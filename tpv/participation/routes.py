"""Публичные маршруты заявок на участие TPV.

HTML-шаблоны являются каноническими в ``tpv/participation/templates``.
Дубли в ``static/`` не используются и удалены на этапе 14.9.2.
"""

from __future__ import annotations

from flask import Blueprint, jsonify, render_template, request

from .constants import ApplicationSource, ApplicationStatus, ThemeStatus
from .services import ParticipationValidationError


def register_participation_routes(app, *, service):
    infrastructure = Blueprint(
        "tpv_participation_infrastructure",
        __name__,
        url_prefix="/tpv/api/participation",
    )

    # Канонический источник публичных HTML-шаблонов.
    # Не дублировать tpv-apply*.html в static/.
    public = Blueprint(
        "tpv_participation_public",
        __name__,
        template_folder="templates",
    )

    @infrastructure.get("/status")
    def participation_status():
        return jsonify({
            "ok": True,
            "stage": "15.0",
            "table": "tpv_participation_applications",
            "public_form": "/tpv-apply",
            "public_status": "/tpv-apply/status",
            "public_status_api": "/tpv/api/participation/application-status",
            "application_statuses": ApplicationStatus.LABELS,
            "theme_statuses": ThemeStatus.LABELS,
        })

    @public.get("/tpv-apply")
    def participation_application_page():
        return render_template("tpv-apply.html")

    @public.get("/tpv-apply/status")
    def participation_application_status_page():
        return render_template("tpv-apply-status.html")

    def _application_status_response(application_id):
        """Вернуть публичный статус заявки единым JSON-контрактом."""
        try:
            application = service.get_public_status(application_id)
        except ParticipationValidationError as exc:
            return jsonify({
                "ok": False,
                "error": str(exc),
                "field": exc.field,
            }), 400

        if application is None:
            return jsonify({
                "ok": False,
                "error": "Заявка с указанным номером не найдена.",
                "field": "application_id",
            }), 404

        return jsonify({
            "ok": True,
            "application": application,
        })

    @infrastructure.get("/application-status")
    def participation_application_status_api():
        """GET API для публичной проверки статуса.

        Отдельный endpoint не пересекается с HTML-страницей
        /tpv-apply/status и не требует POST/CSRF.
        """
        application_id = request.args.get(
            "application_id",
            request.args.get("id"),
        )
        return _application_status_response(application_id)

    @public.post("/tpv-apply/status")
    def participation_application_status_lookup():
        """Legacy POST endpoint для обратной совместимости."""
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            data = request.form.to_dict()

        return _application_status_response(
            data.get("application_id", data.get("id"))
        )

    @public.post("/tpv-apply")
    def participation_application_submit():
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            data = request.form.to_dict()

        try:
            application = service.create_application(
                display_name=data.get("display_name"),
                theme=data.get("theme"),
                created_from=ApplicationSource.PUBLIC_FORM,
            )
        except ParticipationValidationError as exc:
            return jsonify({
                "ok": False,
                "error": str(exc),
                "field": exc.field,
            }), 400
        except Exception:
            service.db.session.rollback()
            raise

        return jsonify({
            "ok": True,
            "id": application.id,
            "application_id": application.id,
            "message": "Ваша заявка зарегистрирована.",
        }), 201

    app.register_blueprint(infrastructure)
    app.register_blueprint(public)

    return {
        "blueprint": infrastructure,
        "public_blueprint": public,
        "service": service,
    }


__all__ = ["register_participation_routes"]
