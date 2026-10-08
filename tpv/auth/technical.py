from __future__ import annotations

import hashlib, os, secrets
from datetime import datetime, timezone
from functools import wraps
from flask import abort, jsonify, redirect, render_template, request, session, url_for
from sqlalchemy import text
from webauthn import generate_authentication_options, generate_registration_options, options_to_json, verify_authentication_response, verify_registration_response
from webauthn.helpers.structs import AuthenticatorSelectionCriteria, ResidentKeyRequirement, UserVerificationRequirement

ADMIN_SESSION='tpv_technical_admin'
CHALLENGE='tpv_webauthn_challenge'

def _b64e(v: bytes)->str:
    import base64
    return base64.urlsafe_b64encode(v).rstrip(b'=').decode()
def _b64d(v: str)->bytes:
    import base64
    return base64.urlsafe_b64decode(v + '='*((4-len(v)%4)%4))
def _request_hostname() -> str:
    return (request.host.split(":", 1)[0] or "").strip().lower()

def _is_local_webauthn() -> bool:
    return _request_hostname() in {"localhost", "127.0.0.1", "::1"}

def _rp_id() -> str:
    # localhost is a special WebAuthn development context.  Never let a
    # production RP ID from .env leak into a local test session.
    if _is_local_webauthn():
        return "localhost"
    return (os.getenv("WEBAUTHN_RP_ID") or _request_hostname()).strip()

def _origin() -> str:
    if _is_local_webauthn():
        # Local WebAuthn is intentionally HTTP.  Keep the actual development
        # port so expected_origin exactly matches the browser origin.
        port = request.host.rsplit(":", 1)[1] if ":" in request.host and not request.host.startswith("[") else ""
        return f"http://localhost{':' + port if port else ''}"
    return (os.getenv("WEBAUTHN_ORIGIN") or request.host_url.rstrip("/")).strip()
def _hash(code:str)->str: return hashlib.sha256(code.encode()).hexdigest()

def register_technical_auth(app, db):
    @app.before_request
    def _normalize_local_webauthn_host():
        # Browsers do not consistently accept an IP address as an RP ID.
        # For local WebAuthn flows use the standards-friendly localhost host.
        if _request_hostname() == "127.0.0.1" and (
            request.path.startswith("/technical-login")
            or request.path.startswith("/settings/security")
            or request.path.startswith("/api/technical/")
            or request.path.startswith("/api/security/webauthn/")
        ):
            port = request.host.rsplit(":", 1)[1] if ":" in request.host else ""
            target = f"http://localhost{':' + port if port else ''}{request.full_path}"
            if target.endswith("?"):
                target = target[:-1]
            return redirect(target, code=302)

    with app.app_context():
        db.session.execute(text('''CREATE TABLE IF NOT EXISTS technical_webauthn_credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, credential_id TEXT UNIQUE NOT NULL, public_key TEXT NOT NULL, sign_count INTEGER NOT NULL DEFAULT 0, created_at VARCHAR(40) NOT NULL)'''))
        # Keep credentials isolated by WebAuthn relying party. Existing databases
        # are upgraded in-place; old rows are assigned to the configured production RP.
        cols = {r[1] for r in db.session.execute(text('PRAGMA table_info(technical_webauthn_credentials)')).fetchall()}
        if 'rp_id' not in cols:
            db.session.execute(text('ALTER TABLE technical_webauthn_credentials ADD COLUMN rp_id VARCHAR(255)'))
            legacy_rp = (os.getenv('WEBAUTHN_RP_ID') or '').strip() or 'legacy-unknown'
            db.session.execute(text('UPDATE technical_webauthn_credentials SET rp_id=:rp WHERE rp_id IS NULL OR rp_id=""'), {'rp': legacy_rp})
        db.session.execute(text('''CREATE TABLE IF NOT EXISTS technical_recovery_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, code_hash VARCHAR(64) UNIQUE NOT NULL, used_at VARCHAR(40), created_at VARCHAR(40) NOT NULL)'''))
        db.session.commit()

    def credentials(rp_only=False):
        if rp_only:
            return db.session.execute(text('SELECT id,name,credential_id,public_key,sign_count,created_at,rp_id FROM technical_webauthn_credentials WHERE rp_id=:rp ORDER BY id'), {'rp': _rp_id()}).mappings().all()
        return db.session.execute(text('SELECT id,name,credential_id,public_key,sign_count,created_at,rp_id FROM technical_webauthn_credentials ORDER BY id')).mappings().all()
    def admin_required(fn):
        @wraps(fn)
        def wrapped(*a,**kw):
            if session.get(ADMIN_SESSION) is not True: return redirect(url_for('technical_login'))
            return fn(*a,**kw)
        return wrapped

    @app.get('/technical-login')
    def technical_login():
        return render_template('technical-login.html', has_keys=bool(credentials(rp_only=True)), bootstrap_enabled=bool(os.getenv('YUBIKEY_BOOTSTRAP_TOKEN')))

    @app.post('/api/technical/bootstrap')
    def technical_bootstrap():
        if credentials(): abort(403)
        expected=os.getenv('YUBIKEY_BOOTSTRAP_TOKEN','')
        supplied=str((request.get_json(silent=True) or {}).get('token') or '')
        if not expected or not secrets.compare_digest(expected,supplied): abort(403)
        session[ADMIN_SESSION]=True; session['tpv_auth_method']='bootstrap'
        return jsonify(ok=True, redirect='/settings/security')

    @app.post('/api/technical/auth/options')
    def technical_auth_options():
        creds=credentials(rp_only=True)
        if not creds: return jsonify(ok=False,error='no_keys'),409
        opts=generate_authentication_options(rp_id=_rp_id(), allow_credentials=[], user_verification=UserVerificationRequirement.REQUIRED)
        session[CHALLENGE]=_b64e(opts.challenge)
        return app.response_class(options_to_json(opts), mimetype='application/json')

    @app.post('/api/technical/auth/verify')
    def technical_auth_verify():
        body=request.get_json(force=True); cid=body.get('id','')
        row=db.session.execute(text('SELECT * FROM technical_webauthn_credentials WHERE credential_id=:c AND rp_id=:rp'),{'c':cid,'rp':_rp_id()}).mappings().first()
        if not row: return jsonify(ok=False,error='unknown_credential'),403
        try:
            result=verify_authentication_response(credential=body, expected_challenge=_b64d(session.pop(CHALLENGE,'')), expected_rp_id=_rp_id(), expected_origin=_origin(), credential_public_key=_b64d(row['public_key']), credential_current_sign_count=row['sign_count'], require_user_verification=True)
        except Exception as exc: return jsonify(ok=False,error='verification_failed',message=str(exc)),403
        db.session.execute(text('UPDATE technical_webauthn_credentials SET sign_count=:s WHERE id=:i'),{'s':result.new_sign_count,'i':row['id']}); db.session.commit()
        session[ADMIN_SESSION]=True; session['tpv_auth_method']='webauthn'
        return jsonify(ok=True,redirect='/select')

    @app.post('/api/technical/recovery')
    def technical_recovery():
        code=str((request.get_json(silent=True) or {}).get('code') or '').strip().upper()
        row=db.session.execute(text('SELECT id FROM technical_recovery_codes WHERE code_hash=:h AND used_at IS NULL'),{'h':_hash(code)}).first()
        if not row: return jsonify(ok=False,error='invalid_recovery_code'),403
        db.session.execute(text('UPDATE technical_recovery_codes SET used_at=:u WHERE id=:i'),{'u':datetime.now(timezone.utc).isoformat(),'i':row[0]}); db.session.commit()
        session[ADMIN_SESSION]=True; session['tpv_auth_method']='recovery'
        return jsonify(ok=True,redirect='/select')

    @app.get('/settings/security')
    @admin_required
    def security_settings():
        from tpv.auth.yandex import is_yandex_auth_enabled
        remaining=db.session.execute(text('SELECT count(*) FROM technical_recovery_codes WHERE used_at IS NULL')).scalar() or 0
        return render_template('security-settings.html', credentials=credentials(), recovery_remaining=remaining, yandex_auth_enabled=is_yandex_auth_enabled(app), auth_method=session.get('tpv_auth_method'))

    @app.post('/api/security/webauthn/register/options')
    @admin_required
    def reg_options():
        opts=generate_registration_options(rp_id=_rp_id(), rp_name='Весёлые игры', user_id=b'tpv-technical-admin', user_name='technical-admin', user_display_name='Технический администратор', authenticator_selection=AuthenticatorSelectionCriteria(resident_key=ResidentKeyRequirement.PREFERRED, user_verification=UserVerificationRequirement.REQUIRED))
        session[CHALLENGE]=_b64e(opts.challenge)
        return app.response_class(options_to_json(opts),mimetype='application/json')

    @app.post('/api/security/webauthn/register/verify')
    @admin_required
    def reg_verify():
        body=request.get_json(force=True)
        try:
            result=verify_registration_response(credential=body, expected_challenge=_b64d(session.pop(CHALLENGE,'')), expected_rp_id=_rp_id(), expected_origin=_origin(), require_user_verification=True)
        except Exception as exc: return jsonify(ok=False,error='verification_failed',message=str(exc)),400
        name=str(body.get('name') or 'YubiKey')[:100]
        try:
            db.session.execute(text('INSERT INTO technical_webauthn_credentials(name,credential_id,public_key,sign_count,created_at,rp_id) VALUES(:n,:c,:p,:s,:d,:rp)'),{'n':name,'c':body['id'],'p':_b64e(result.credential_public_key),'s':result.sign_count,'d':datetime.now(timezone.utc).isoformat(),'rp':_rp_id()}); db.session.commit()
        except Exception: db.session.rollback(); return jsonify(ok=False,error='credential_exists'),409
        session['tpv_auth_method']='webauthn'
        return jsonify(ok=True)

    @app.delete('/api/security/webauthn/<int:key_id>')
    @admin_required
    def delete_key(key_id):
        if session.get('tpv_auth_method') != 'webauthn': return jsonify(ok=False,error='webauthn_reauth_required'),403
        if len(credentials()) <= 1: return jsonify(ok=False,error='last_key_cannot_be_deleted'),409
        db.session.execute(text('DELETE FROM technical_webauthn_credentials WHERE id=:i'),{'i':key_id}); db.session.commit(); return jsonify(ok=True)

    @app.post('/api/security/recovery/regenerate')
    @admin_required
    def recovery_regenerate():
        if session.get('tpv_auth_method') not in ('webauthn','bootstrap'): return jsonify(ok=False,error='webauthn_reauth_required'),403
        codes=['TPV-'+secrets.token_hex(3).upper()+'-'+secrets.token_hex(3).upper() for _ in range(10)]
        now=datetime.now(timezone.utc).isoformat(); db.session.execute(text('DELETE FROM technical_recovery_codes'))
        for c in codes: db.session.execute(text('INSERT INTO technical_recovery_codes(code_hash,created_at) VALUES(:h,:d)'),{'h':_hash(c),'d':now})
        db.session.commit(); return jsonify(ok=True,codes=codes)

    @app.put('/api/security/yandex')
    @admin_required
    def security_yandex():
        service=app.extensions.get('tpv_operational_settings')
        if service is None: return jsonify(ok=False,error='settings_unavailable'),503
        enabled=bool((request.get_json(silent=True) or {}).get('enabled'))
        data=service.serialize(); data['yandex_auth_enabled']=enabled; service.save(data)
        return jsonify(ok=True,enabled=enabled)

    @app.post('/technical-logout')
    def technical_logout():
        session.pop(ADMIN_SESSION,None); session.pop('tpv_auth_method',None); return redirect('/join')

    return {'admin_required':admin_required}
