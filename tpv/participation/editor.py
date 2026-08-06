"""TPV Editor integration for participation applications — stage 12.0.4."""
from __future__ import annotations
from datetime import datetime
from flask import Blueprint, jsonify, request
from sqlalchemy import func, or_
from .constants import ApplicationStatus, ThemeStatus
from .services import ParticipationValidationError


def register_participation_editor(app, *, db, service, UsersTpv, allowed, error):
    bp = Blueprint("tpv_participation_editor", __name__)

    def guard():
        if not allowed():
            return error("Нет доступа к редактору.", 403)
        return None

    def item_dict(row):
        data = row.to_editor_dict()
        now = datetime.now()
        age = max(0, int((now - row.created_at).total_seconds()))
        if age < 60: age_label = "только что"
        elif age < 3600: age_label = f"{age // 60} мин назад"
        elif age < 86400: age_label = f"{age // 3600} ч назад"
        elif age < 172800: age_label = "вчера"
        else: age_label = f"{age // 86400} дн назад"
        data.update({
            "age_label": age_label,
            "created_at_label": row.created_at.strftime("%d.%m.%Y %H:%M"),
            "updated_at_label": row.updated_at.strftime("%d.%m.%Y %H:%M"),
        })
        return data

    @bp.get('/tpv_editor/api/participation-applications')
    def list_applications():
        denied=guard()
        if denied:return denied
        query=db.select(service.model)
        status=str(request.args.get('status') or 'all')
        theme_status=str(request.args.get('theme_status') or 'all')
        search=' '.join(str(request.args.get('q') or '').strip().split())
        if status != 'all':
            if status not in ApplicationStatus.ALL:return error('Некорректный статус заявки.',400)
            query=query.where(service.model.status==status)
        if theme_status != 'all':
            if theme_status not in ThemeStatus.ALL:return error('Некорректный статус темы.',400)
            query=query.where(service.model.theme_status==theme_status)
        if search:
            term=f"%{search.casefold()}%"
            query=query.where(or_(
                func.lower(service.model.display_name).like(term),
                func.lower(service.model.theme).like(term),
                func.cast(service.model.id, db.String).like(f"%{search}%"),
            ))
        rows=db.session.scalars(query.order_by(service.model.created_at.desc(),service.model.id.desc())).all()
        all_rows=db.session.scalars(db.select(service.model)).all()
        return jsonify({
            'ok':True,
            'items':[item_dict(row) for row in rows],
            'statuses':ApplicationStatus.LABELS,
            'theme_statuses':ThemeStatus.LABELS,
            'stats':{
                'total':len(all_rows),
                'new':sum(r.status==ApplicationStatus.NEW for r in all_rows),
                'in_review':sum(r.status==ApplicationStatus.IN_REVIEW for r in all_rows),
                'approved':sum(r.status==ApplicationStatus.APPROVED for r in all_rows),
            },
        })

    @bp.get('/tpv_editor/api/participation-applications/<int:application_id>')
    def get_application(application_id):
        denied=guard()
        if denied:return denied
        row=service.get_application(application_id)
        if row is None:return error('Заявка не найдена.',404)
        return jsonify({'ok':True,'item':item_dict(row)})

    @bp.put('/tpv_editor/api/participation-applications/<int:application_id>')
    def update_application(application_id):
        denied=guard()
        if denied:return denied
        row=service.get_application(application_id)
        if row is None:return error('Заявка не найдена.',404)
        data=request.get_json(silent=True) or {}
        try:
            service.update_application(
                row,
                status=data.get('status'),
                theme_status=data.get('theme_status'),
                public_comment=data.get('public_comment'),
                editor_comment=data.get('editor_comment'),
            )
        except ParticipationValidationError as exc:
            db.session.rollback(); return error(str(exc),400)
        return jsonify({'ok':True,'message':'Заявка сохранена.','item':item_dict(row)})

    @bp.post('/tpv_editor/api/participation-applications/<int:application_id>/create-player')
    def create_player(application_id):
        denied=guard()
        if denied:return denied
        row=service.get_application(application_id)
        if row is None:return error('Заявка не найдена.',404)
        if row.status != ApplicationStatus.APPROVED:
            return error('Создать игрока можно только из одобренной заявки.',409)
        duplicate=db.session.scalar(db.select(UsersTpv).where(func.lower(UsersTpv.username)==row.display_name.casefold()))
        if duplicate is not None:
            return error(f'Игрок «{row.display_name}» уже существует.',409)
        player=UsersTpv(username=row.display_name,flip=row.theme,money=0,approve='false',flip_col=0)
        db.session.add(player)
        row.status=ApplicationStatus.COMPLETED
        db.session.commit()
        return jsonify({'ok':True,'message':f'Игрок «{player.username}» создан.','player':{'id':player.id,'username':player.username,'theme':player.flip},'item':item_dict(row)}),201

    app.register_blueprint(bp)

    @app.after_request
    def inject_participation_editor_assets(response):
        if request.path != '/tpv_editor' or response.status_code != 200:
            return response
        content_type=response.headers.get('Content-Type','')
        if 'text/html' not in content_type:return response
        html=response.get_data(as_text=True)
        marker='data-tpv-participation-editor="12.0.4"'
        if marker in html:return response
        css='<link rel="stylesheet" href="/static/styles/tpv-participation-editor.css" '+marker+' media="all">'
        js='<script src="/static/js/tpv-participation-editor.js" '+marker+' defer></script>'
        if '</head>' in html:html=html.replace('</head>',css+'\n</head>',1)
        if '</body>' in html:html=html.replace('</body>',js+'\n</body>',1)
        response.set_data(html)
        response.headers['Content-Length']=str(len(response.get_data()))
        return response

    return {'blueprint':bp}

__all__=['register_participation_editor']
