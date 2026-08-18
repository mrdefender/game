"""TPV Editor operational settings — 15.1.1."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import jsonify, request
from sqlalchemy import inspect, text

from .registry import EditorContext
from .responses import message_error_response


DEFAULTS = {
    "required_flip_questions": "5",
    "public_participation_form_enabled": "true",
    "public_question_form_enabled": "true",
}


class OperationalSettingsService:
    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db

    def table_exists(self) -> bool:
        try:
            return "tpv_editor_settings" in set(
                inspect(self.db.engine).get_table_names()
            )
        except Exception:
            self.context.app.logger.exception(
                "TPV settings: table inspection failed."
            )
            return False

    def _get_raw(self, key: str) -> str:
        default = DEFAULTS[key]
        if not self.table_exists():
            return default
        value = self.db.session.execute(
            text(
                "SELECT value FROM tpv_editor_settings "
                "WHERE key = :key LIMIT 1"
            ),
            {"key": key},
        ).scalar()
        return default if value is None else str(value)

    def _set_raw(self, key: str, value: str) -> None:
        if not self.table_exists():
            raise RuntimeError(
                "Таблица tpv_editor_settings не создана."
            )
        row_id = self.db.session.execute(
            text(
                "SELECT id FROM tpv_editor_settings "
                "WHERE key = :key LIMIT 1"
            ),
            {"key": key},
        ).scalar()
        now = datetime.now()
        if row_id is None:
            self.db.session.execute(
                text(
                    "INSERT INTO tpv_editor_settings "
                    "(key, value, updated_at) "
                    "VALUES (:key, :value, :updated_at)"
                ),
                {"key": key, "value": value, "updated_at": now},
            )
        else:
            self.db.session.execute(
                text(
                    "UPDATE tpv_editor_settings "
                    "SET value = :value, updated_at = :updated_at "
                    "WHERE key = :key"
                ),
                {"key": key, "value": value, "updated_at": now},
            )

    def required_flip_questions(self) -> int:
        try:
            value = int(self._get_raw("required_flip_questions"))
        except (TypeError, ValueError):
            return 5
        return max(1, min(100, value))

    def bool_setting(self, key: str) -> bool:
        return self._get_raw(key).strip().lower() in {
            "1", "true", "yes", "on"
        }

    def serialize(self) -> dict[str, Any]:
        return {
            "required_flip_questions": self.required_flip_questions(),
            "public_participation_form_enabled": self.bool_setting(
                "public_participation_form_enabled"
            ),
            "public_question_form_enabled": self.bool_setting(
                "public_question_form_enabled"
            ),
        }

    def save(self, data: dict[str, Any]) -> dict[str, Any]:
        try:
            required = int(data.get("required_flip_questions"))
        except (TypeError, ValueError) as exc:
            raise ValueError(
                "Количество вопросов должно быть целым числом."
            ) from exc
        if required < 1 or required > 100:
            raise ValueError(
                "Количество вопросов должно быть от 1 до 100."
            )

        def bool_value(name: str) -> str:
            value = data.get(name)
            if isinstance(value, bool):
                return "true" if value else "false"
            normalized = str(value).strip().lower()
            if normalized in {"1", "true", "yes", "on"}:
                return "true"
            if normalized in {"0", "false", "no", "off"}:
                return "false"
            raise ValueError(
                f"Некорректное значение настройки {name}."
            )

        self._set_raw("required_flip_questions", str(required))
        self._set_raw(
            "public_participation_form_enabled",
            bool_value("public_participation_form_enabled"),
        )
        self._set_raw(
            "public_question_form_enabled",
            bool_value("public_question_form_enabled"),
        )
        self.db.session.commit()
        return self.serialize()


def register_operational_settings(
    context: EditorContext,
) -> dict[str, Any]:
    service = OperationalSettingsService(context)

    # Public routes are registered earlier than Editor modules. Resolve this
    # live service at request time through Flask extensions.
    context.app.extensions["tpv_operational_settings"] = service

    def require_access():
        if context.permissions.is_allowed():
            return None
        return message_error_response("Нет доступа к редактору.", 403)

    def get_settings():
        denied = require_access()
        if denied is not None:
            return denied
        return jsonify({
            "ok": True,
            "table_exists": service.table_exists(),
            "settings": service.serialize(),
        })

    def save_settings():
        denied = require_access()
        if denied is not None:
            return denied
        try:
            settings = service.save(
                request.get_json(silent=True) or {}
            )
        except ValueError as exc:
            return message_error_response(str(exc), 400)
        except RuntimeError as exc:
            return message_error_response(str(exc), 409)

        users_service = context.get("TPV_EDITOR_USERS_SERVICE")
        recalculated = False
        players_updated = 0

        if users_service is not None:
            players_updated = users_service.recalculate_all() if users_service else 0
            recalculated = True

    # Старый callback возвращает Flask Response.
    # Не пытаемся преобразовывать его в int.

        return jsonify({
            "ok": True,
            "message": (
                "Настройки TPV сохранены. Допуски пользователей пересчитаны."
                if recalculated
                else "Настройки TPV сохранены."
            ),
            "settings": settings,
            "approvals_recalculated": recalculated,
            "players_updated": players_updated,
        })

    context.app.add_url_rule(
        "/tpv_editor/api/operational-settings",
        endpoint="tpv_editor_operational_settings",
        view_func=get_settings,
        methods=["GET"],
    )
    context.app.add_url_rule(
        "/tpv_editor/api/operational-settings",
        endpoint="tpv_editor_operational_settings_save",
        view_func=save_settings,
        methods=["PUT"],
    )

    return {
        "service": service,
        "tpv_editor_required_flip_questions": (
            service.required_flip_questions
        ),
        "tpv_public_participation_form_enabled": (
            lambda: service.bool_setting(
                "public_participation_form_enabled"
            )
        ),
        "tpv_public_question_form_enabled": (
            lambda: service.bool_setting(
                "public_question_form_enabled"
            )
        ),
    }


__all__ = [
    "OperationalSettingsService",
    "register_operational_settings",
]
