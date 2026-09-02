"""Yandex OAuth authentication used by TPV public forms.

The OAuth access token is used only during the callback and is never stored in
Flask's client-side session. The session contains only the Yandex login and the display name chosen as
``real_name`` with ``login`` fallback. Yandex ID is deliberately not stored.
"""

from __future__ import annotations

import json
import os
import secrets
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

from flask import Blueprint, current_app, jsonify, redirect, request, session, url_for

YANDEX_AUTHORIZE_URL = "https://oauth.yandex.ru/authorize"
YANDEX_TOKEN_URL = "https://oauth.yandex.ru/token"
YANDEX_INFO_URL = "https://login.yandex.ru/info"
SESSION_USER_KEY = "tpv_yandex_user"
SESSION_STATE_KEY = "tpv_yandex_oauth_state"
SESSION_NEXT_KEY = "tpv_yandex_oauth_next"


def is_yandex_auth_enabled(app=None) -> bool:
    """Return the live TPV Editor switch state; enabled by default."""
    flask_app = app or current_app
    settings = flask_app.extensions.get("tpv_operational_settings")
    if settings is None:
        return True
    try:
        return bool(settings.bool_setting("yandex_auth_enabled"))
    except Exception:
        flask_app.logger.exception("Failed to read Yandex auth setting")
        return True


def get_yandex_user() -> dict | None:
    value = session.get(SESSION_USER_KEY)
    return value if isinstance(value, dict) else None


def _safe_next(value: str | None) -> str:
    """Allow only local absolute paths as a post-login destination."""
    candidate = str(value or "").strip()
    if not candidate.startswith("/") or candidate.startswith("//"):
        return "/tpv-apply"
    parsed = urlsplit(candidate)
    if parsed.scheme or parsed.netloc:
        return "/tpv-apply"
    return candidate


def _redirect_uri() -> str:
    configured = str(os.environ.get("YANDEX_REDIRECT_URI") or "").strip()
    if configured:
        return configured
    return url_for("tpv_yandex_auth.callback", _external=True)


def _json_request(url: str, *, data: dict | None = None, headers: dict | None = None) -> dict:
    encoded = None
    request_headers = {"Accept": "application/json"}
    if headers:
        request_headers.update(headers)
    if data is not None:
        encoded = urlencode(data).encode("utf-8")
        request_headers["Content-Type"] = "application/x-www-form-urlencoded"

    req = Request(url, data=encoded, headers=request_headers)
    try:
        with urlopen(req, timeout=10) as response:
            payload = response.read().decode("utf-8")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:1000]
        raise RuntimeError(f"Yandex OAuth HTTP {exc.code}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError("Yandex OAuth network error") from exc

    try:
        value = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Yandex OAuth returned invalid JSON") from exc
    if not isinstance(value, dict):
        raise RuntimeError("Yandex OAuth returned unexpected response")
    return value


def register_yandex_auth(app):
    bp = Blueprint("tpv_yandex_auth", __name__)

    @app.context_processor
    def inject_yandex_auth_state():
        return {"yandex_auth_enabled": is_yandex_auth_enabled(app)}

    @bp.get("/auth/yandex")
    def login():
        if not is_yandex_auth_enabled(app):
            return jsonify({
                "ok": False,
                "error": "Авторизация через Яндекс отключена в TPV Editor.",
                "code": "yandex_auth_disabled",
            }), 403
        client_id = str(os.environ.get("YANDEX_CLIENT_ID") or "").strip()
        if not client_id:
            return jsonify({
                "ok": False,
                "error": "Вход через Яндекс не настроен на сервере.",
                "code": "yandex_oauth_not_configured",
            }), 503

        state = secrets.token_urlsafe(32)
        session[SESSION_STATE_KEY] = state
        session[SESSION_NEXT_KEY] = _safe_next(request.args.get("next"))

        query = urlencode({
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": _redirect_uri(),
            "state": state,
        })
        return redirect(f"{YANDEX_AUTHORIZE_URL}?{query}")

    @bp.get("/auth/yandex/callback")
    def callback():
        expected_state = session.pop(SESSION_STATE_KEY, None)
        returned_state = request.args.get("state")
        next_url = _safe_next(session.pop(SESSION_NEXT_KEY, None))

        if not expected_state or not secrets.compare_digest(
            str(expected_state), str(returned_state or "")
        ):
            return "Некорректное состояние OAuth. Повторите вход через Яндекс.", 400

        if request.args.get("error"):
            return redirect(f"{next_url}?auth_error=yandex_denied")

        code = str(request.args.get("code") or "").strip()
        client_id = str(os.environ.get("YANDEX_CLIENT_ID") or "").strip()
        client_secret = str(os.environ.get("YANDEX_CLIENT_SECRET") or "").strip()
        if not code or not client_id or not client_secret:
            return "Не удалось завершить вход через Яндекс.", 400

        try:
            token_data = _json_request(
                YANDEX_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "client_id": client_id,
                    "client_secret": client_secret,
                },
            )
            access_token = str(token_data.get("access_token") or "").strip()
            if not access_token:
                raise RuntimeError("Yandex OAuth response has no access_token")

            profile = _json_request(
                f"{YANDEX_INFO_URL}?format=json",
                headers={"Authorization": f"OAuth {access_token}"},
            )
        except RuntimeError:
            current_app.logger.exception("Не удалось завершить Yandex OAuth")
            return redirect(f"{next_url}?auth_error=yandex_unavailable")

        login_name = str(profile.get("login") or "").strip()
        display_name = str(profile.get("real_name") or "").strip() or login_name

        if not display_name:
            current_app.logger.warning("Yandex profile misses real_name/login: %r", profile)
            return redirect(f"{next_url}?auth_error=incomplete_profile")

        session[SESSION_USER_KEY] = {
            "login": login_name[:160],
            "display_name": display_name[:160],
        }
        session.modified = True
        return redirect(next_url)

    @bp.get("/api/auth/me")
    def me():
        user = get_yandex_user()
        if not user:
            return jsonify({"ok": True, "authenticated": False, "user": None})
        return jsonify({"ok": True, "authenticated": True, "user": user})

    @bp.post("/auth/yandex/logout")
    def logout():
        session.pop(SESSION_USER_KEY, None)
        session.pop(SESSION_STATE_KEY, None)
        session.pop(SESSION_NEXT_KEY, None)
        return jsonify({"ok": True})

    app.register_blueprint(bp)
    return {"blueprint": bp, "get_yandex_user": get_yandex_user, "is_yandex_auth_enabled": is_yandex_auth_enabled}
