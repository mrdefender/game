"""Заявки на участие TPV Editor — этап 13.5.2.

Редакторская логика вынесена из ``tpv.participation.editor``.
Публичная подача и проверка статуса продолжают работать через
``tpv.participation.routes``.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import jsonify, request
from sqlalchemy import func, or_

from tpv.participation.constants import ApplicationStatus, ThemeStatus
from tpv.participation.services import ParticipationValidationError

from .registry import EditorContext


class ParticipationApplicationEditorService:
    """Модерация заявок на участие и создание игроков."""

    PROCESSED_STATUSES = (
        ApplicationStatus.APPROVED,
        ApplicationStatus.COMPLETED,
        ApplicationStatus.REJECTED,
    )

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db
        self.UsersTpv = self._dependency("UsersTpv")
        self.model = self._dependency("TpvParticipationApplication")
        self.service = self._dependency("TPV_PARTICIPATION_SERVICE")

        self.history_add = self._dependency(
            "tpv_editor_history_add"
        )
        self.user_snapshot = self._dependency(
            "tpv_editor_user_snapshot"
        )
        self.update_approval = self._dependency(
            "tpv_editor_update_approval"
        )

    def _dependency(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                "Заявки на участие TPV Editor: "
                f"отсутствует зависимость {name}"
            )
        return value

    @staticmethod
    def _age_label(created_at: datetime) -> str:
        age = max(
            0,
            int((datetime.now() - created_at).total_seconds()),
        )
        if age < 60:
            return "только что"
        if age < 3600:
            return f"{age // 60} мин назад"
        if age < 86400:
            return f"{age // 3600} ч назад"
        if age < 172800:
            return "вчера"
        return f"{age // 86400} дн назад"

    def serialize(self, row: Any) -> dict[str, Any]:
        data = row.to_editor_dict()
        data.update({
            "age_label": self._age_label(row.created_at),
            "created_at_label": row.created_at.strftime(
                "%d.%m.%Y %H:%M"
            ),
            "updated_at_label": row.updated_at.strftime(
                "%d.%m.%Y %H:%M"
            ),
        })
        return data

    def list_data(
        self,
        *,
        search: str,
        status: str,
        theme_status: str,
    ) -> dict[str, Any]:
        query = self.db.select(self.model)

        if status != "all":
            if status not in ApplicationStatus.ALL:
                raise ValueError("Некорректный статус заявки.")
            query = query.where(self.model.status == status)

        if theme_status != "all":
            if theme_status not in ThemeStatus.ALL:
                raise ValueError("Некорректный статус темы.")
            query = query.where(
                self.model.theme_status == theme_status
            )

        normalized_search = " ".join(
            str(search or "").strip().split()
        )
        if normalized_search:
            term = f"%{normalized_search.casefold()}%"
            query = query.where(or_(
                func.lower(self.model.display_name).like(term),
                func.lower(self.model.theme).like(term),
                func.cast(self.model.id, self.db.String).like(
                    f"%{normalized_search}%"
                ),
            ))

        rows = self.db.session.scalars(
            query.order_by(
                self.model.created_at.desc(),
                self.model.id.desc(),
            )
        ).all()
        all_rows = self.db.session.scalars(
            self.db.select(self.model)
        ).all()

        return {
            "items": [self.serialize(row) for row in rows],
            "statuses": ApplicationStatus.LABELS,
            "theme_statuses": ThemeStatus.LABELS,
            "stats": {
                "total": len(all_rows),
                "new": sum(
                    row.status == ApplicationStatus.NEW
                    for row in all_rows
                ),
                "in_review": sum(
                    row.status == ApplicationStatus.IN_REVIEW
                    for row in all_rows
                ),
                "approved": sum(
                    row.status == ApplicationStatus.APPROVED
                    for row in all_rows
                ),
            },
        }

    def get(self, application_id: int) -> Any | None:
        return self.service.get_application(application_id)

    def update(self, row: Any, data: dict[str, Any]) -> Any:
        before = self.serialize(row)

        try:
            self.service.update_application(
                row,
                status=data.get("status"),
                theme_status=data.get("theme_status"),
                public_comment=data.get("public_comment"),
                editor_comment=data.get("editor_comment"),
            )
        except ParticipationValidationError:
            self.db.session.rollback()
            raise

        self.history_add(
            "bulk",
            row.id,
            "update",
            f"Изменена заявка на участие #{row.id}",
            before=before,
            after=self.serialize(row),
            can_revert=False,
        )
        self.db.session.commit()
        return row

    def create_player(self, row: Any) -> Any:
        if row.status != ApplicationStatus.APPROVED:
            raise RuntimeError(
                "Создать игрока можно только из одобренной заявки."
            )

        duplicate = self.db.session.scalar(
            self.db.select(self.UsersTpv).where(
                func.lower(self.UsersTpv.username)
                == row.display_name.casefold()
            )
        )
        if duplicate is not None:
            raise LookupError(
                f"Игрок «{row.display_name}» уже существует."
            )

        player = self.UsersTpv(
            username=row.display_name,
            flip=row.theme,
            money=0,
            approve="false",
            flip_col=0,
        )
        self.update_approval(player)

        self.db.session.add(player)
        self.db.session.flush()

        row.status = ApplicationStatus.COMPLETED

        self.history_add(
            "user",
            player.id,
            "create",
            "Создан игрок "
            f"«{player.username}» из заявки #{row.id}",
            after=self.user_snapshot(player),
            details=f"Тема: {player.flip}.",
            can_revert=True,
        )
        self.db.session.commit()
        return player

    def delete(self, row: Any) -> None:
        snapshot = self.serialize(row)
        application_id = row.id

        self.db.session.delete(row)
        self.history_add(
            "bulk",
            application_id,
            "delete",
            f"Удалена заявка на участие #{application_id}",
            before=snapshot,
            details=(
                "Связанные игроки и записи UsersTpv "
                "не изменялись."
            ),
            can_revert=False,
        )
        self.db.session.commit()

    def clear(self, mode: str) -> int:
        statement = self.db.delete(self.model)

        if mode == "processed":
            statement = statement.where(
                self.model.status.in_(self.PROCESSED_STATUSES)
            )
        elif mode != "all":
            raise ValueError(
                "Некорректный режим очистки заявок на участие."
            )

        result = self.db.session.execute(statement)
        deleted = int(result.rowcount or 0)

        self.history_add(
            "bulk",
            None,
            "delete",
            "Очищены заявки на участие",
            details=(
                f"Режим: {mode}. Удалено: {deleted}. "
                "Игроки не удалялись."
            ),
            can_revert=False,
        )
        self.db.session.commit()
        return deleted


def register_participation_applications(
    context: EditorContext,
) -> dict[str, Any]:
    """Зарегистрировать API и подключить frontend TPV Editor."""
    service = ParticipationApplicationEditorService(context)

    def error(message: str, status: int = 400):
        return jsonify({"ok": False, "message": message}), status

    def require_access():
        if context.permissions.is_allowed():
            return None
        return error("Нет доступа к редактору.", 403)

    def list_applications():
        denied = require_access()
        if denied is not None:
            return denied

        try:
            data = service.list_data(
                search=request.args.get("q", ""),
                status=str(request.args.get("status") or "all"),
                theme_status=str(
                    request.args.get("theme_status") or "all"
                ),
            )
        except ValueError as exc:
            return error(str(exc))

        return jsonify({"ok": True, **data})

    def get_application(application_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        row = service.get(application_id)
        if row is None:
            return error("Заявка не найдена.", 404)

        return jsonify({
            "ok": True,
            "item": service.serialize(row),
        })

    def update_application(application_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        row = service.get(application_id)
        if row is None:
            return error("Заявка не найдена.", 404)

        try:
            service.update(
                row,
                request.get_json(silent=True) or {},
            )
        except ParticipationValidationError as exc:
            return error(str(exc))

        return jsonify({
            "ok": True,
            "message": "Заявка сохранена.",
            "item": service.serialize(row),
        })

    def create_player(application_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        row = service.get(application_id)
        if row is None:
            return error("Заявка не найдена.", 404)

        try:
            player = service.create_player(row)
        except LookupError as exc:
            return error(str(exc), 409)
        except RuntimeError as exc:
            return error(str(exc), 409)

        return jsonify({
            "ok": True,
            "message": f"Игрок «{player.username}» создан.",
            "player": {
                "id": player.id,
                "username": player.username,
                "theme": player.flip,
            },
            "item": service.serialize(row),
        }), 201

    def delete_application(application_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        row = service.get(application_id)
        if row is None:
            return error("Заявка не найдена.", 404)

        service.delete(row)
        return jsonify({
            "ok": True,
            "message": "Заявка на участие удалена.",
        })

    def clear_applications():
        denied = require_access()
        if denied is not None:
            return denied

        data = request.get_json(silent=True) or {}
        mode = str(data.get("mode") or "processed")

        try:
            deleted = service.clear(mode)
        except ValueError as exc:
            return error(str(exc))

        return jsonify({
            "ok": True,
            "message": f"Удалено заявок на участие: {deleted}.",
            "deleted": deleted,
        })

    rules = (
        (
            "/tpv_editor/api/participation-applications",
            "tpv_editor_participation_application_list",
            list_applications,
            ["GET"],
        ),
        (
            "/tpv_editor/api/participation-applications/"
            "<int:application_id>",
            "tpv_editor_participation_application_get",
            get_application,
            ["GET"],
        ),
        (
            "/tpv_editor/api/participation-applications/"
            "<int:application_id>",
            "tpv_editor_participation_application_update",
            update_application,
            ["PUT"],
        ),
        (
            "/tpv_editor/api/participation-applications/"
            "<int:application_id>/create-player",
            "tpv_editor_participation_application_create_player",
            create_player,
            ["POST"],
        ),
        (
            "/tpv_editor/api/participation-applications/"
            "<int:application_id>",
            "tpv_editor_participation_application_delete",
            delete_application,
            ["DELETE"],
        ),
        (
            "/tpv_editor/api/participation-applications/clear",
            "tpv_editor_participation_applications_clear",
            clear_applications,
            ["POST"],
        ),
    )

    for rule, endpoint, view_func, methods in rules:
        context.app.add_url_rule(
            rule,
            endpoint=endpoint,
            view_func=view_func,
            methods=methods,
        )

    @context.app.after_request
    def inject_participation_editor_assets(response):
        if (
            request.path != "/tpv_editor"
            or response.status_code != 200
        ):
            return response

        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type:
            return response

        html = response.get_data(as_text=True)
        marker = 'data-tpv-participation-editor="13.5.2"'

        if marker in html:
            return response

        css = (
            '<link rel="stylesheet" '
            'href="/static/styles/tpv-participation-editor.css" '
            f'{marker} media="all">'
        )
        js = (
            '<script src="/static/js/tpv-participation-editor.js" '
            f'{marker} defer></script>'
        )

        if "</head>" in html:
            html = html.replace("</head>", css + "\n</head>", 1)
        if "</body>" in html:
            html = html.replace("</body>", js + "\n</body>", 1)

        response.set_data(html)
        response.headers["Content-Length"] = str(
            len(response.get_data())
        )
        return response

    return {
        "service": service,
        "tpv_editor_participation_application_list": (
            list_applications
        ),
        "tpv_editor_participation_application_get": (
            get_application
        ),
        "tpv_editor_participation_application_update": (
            update_application
        ),
        "tpv_editor_participation_application_create_player": (
            create_player
        ),
        "tpv_editor_participation_application_delete": (
            delete_application
        ),
        "tpv_editor_participation_applications_clear": (
            clear_applications
        ),
    }


__all__ = [
    "ParticipationApplicationEditorService",
    "register_participation_applications",
]
