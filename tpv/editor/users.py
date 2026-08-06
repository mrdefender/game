"""Пользователи TPV Editor.

Этап 13.3.2. Модуль содержит обычный читаемый Python-код вместо
монолитного блока. Все URL, endpoint-имена и JSON-ответы
и правила работы сохранены.
"""

from __future__ import annotations

from typing import Any

from flask import jsonify, request
from sqlalchemy import func

from .registry import EditorContext


class UserService:
    """Операции с игроками TPV, используемые редактором."""

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db

        self.UsersTpv = self._dependency("UsersTpv")
        self.QuestionsTpv = self._dependency("Questions_tpv")

        self.normalize_text = self._dependency(
            "tpv_editor_normalize_text"
        )
        self.normalize_theme = self._dependency(
            "tpv_editor_normalize_theme"
        )
        self.update_approval = self._dependency(
            "tpv_editor_update_approval"
        )
        self.is_general_theme = self._dependency(
            "tpv_editor_is_general_theme"
        )
        self.history_add = self._dependency(
            "tpv_editor_history_add"
        )
        self.user_snapshot = self._dependency(
            "tpv_editor_user_snapshot"
        )

        self.required_questions = int(
            context.get("TPV_REQUIRED_FLIP_QUESTIONS", 5)
        )

    def _dependency(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                f"Пользователи TPV Editor: отсутствует зависимость {name}"
            )
        return value

    def list_users(self) -> list[Any]:
        return self.db.session.scalars(
            self.db.select(self.UsersTpv).order_by(self.UsersTpv.id)
        ).all()

    def get_user(self, user_id: int) -> Any | None:
        return self.db.session.get(self.UsersTpv, user_id)

    def author_question_count(self, username: str) -> int:
        return int(
            self.db.session.scalar(
                self.db.select(
                    func.count(self.QuestionsTpv.id)
                ).where(self.QuestionsTpv.author == username)
            )
            or 0
        )

    def serialize(self, user: Any) -> dict[str, Any]:
        flip_display = (
            ""
            if self.is_general_theme(user.flip)
            else (user.flip or "")
        )
        approved = str(user.approve).lower() == "true"

        if not flip_display:
            label = "Тема не выбрана"
        elif approved:
            label = "Допущен"
        else:
            label = (
                "Недостаточно вопросов: "
                f"{int(user.flip_col or 0)}/{self.required_questions}"
            )

        return {
            "id": user.id,
            "username": user.username,
            "money": int(user.money or 0),
            "flip": user.flip or "false",
            "flip_display": flip_display,
            "flip_col": int(user.flip_col or 0),
            "approve": "true" if approved else "false",
            "approve_label": label,
            "authored_questions": self.author_question_count(
                user.username
            ),
        }

    def validate_payload(
        self,
        data: dict[str, Any],
        *,
        user_id: int | None = None,
    ) -> tuple[str, int, str]:
        username = self.normalize_text(data.get("username"))

        if not username:
            raise ValueError("Имя пользователя обязательно.")
        if len(username) > 64:
            raise ValueError(
                "Имя должно содержать не более 64 символов."
            )

        duplicate_query = self.db.select(self.UsersTpv).where(
            func.lower(self.UsersTpv.username)
            == username.casefold()
        )
        if user_id is not None:
            duplicate_query = duplicate_query.where(
                self.UsersTpv.id != user_id
            )

        if self.db.session.scalar(duplicate_query):
            raise LookupError(
                "Пользователь с таким именем уже существует."
            )

        try:
            money = int(data.get("money", 0) or 0)
        except (TypeError, ValueError) as exc:
            raise TypeError(
                "Баланс должен быть целым числом."
            ) from exc

        theme = self.normalize_theme(data.get("flip"))
        return username, money, theme

    def create(self, data: dict[str, Any]) -> Any:
        username, money, theme = self.validate_payload(data)

        user = self.UsersTpv(
            username=username,
            money=money,
            flip=theme,
            flip_col=0,
            approve="false",
        )
        self.update_approval(user)

        self.db.session.add(user)
        self.db.session.flush()

        self.history_add(
            "user",
            user.id,
            "create",
            f"Создан пользователь «{user.username}»",
            after=self.user_snapshot(user),
            can_revert=True,
        )
        self.db.session.commit()
        return user

    def update(
        self,
        user: Any,
        data: dict[str, Any],
    ) -> tuple[Any, str]:
        username, money, theme = self.validate_payload(
            data,
            user_id=user.id,
        )

        before = self.user_snapshot(user)
        old_username = user.username

        user.username = username
        user.money = money
        user.flip = theme
        self.update_approval(user)

        self.history_add(
            "user",
            user.id,
            "update",
            f"Изменён пользователь «{user.username}»",
            before=before,
            after=self.user_snapshot(user),
            can_revert=True,
        )
        self.db.session.commit()

        message = "Изменения сохранены."
        if (
            old_username != username
            and self.author_question_count(old_username)
        ):
            message += (
                " Автор в существующих вопросах не переименован."
            )

        return user, message

    def delete(self, user: Any) -> str:
        before = self.user_snapshot(user)
        user_id = user.id
        username = user.username
        count = self.author_question_count(username)

        self.db.session.delete(user)
        self.history_add(
            "user",
            user_id,
            "delete",
            f"Удалён пользователь «{username}»",
            before=before,
            details=f"Связанных вопросов автора: {count}.",
            can_revert=True,
        )
        self.db.session.commit()

        message = f"Пользователь «{username}» удалён."
        if count:
            message += f" Его вопросы ({count}) сохранены."
        return message

    def reset_money(self, user: Any) -> str:
        before = self.user_snapshot(user)
        user.money = 0

        self.history_add(
            "user",
            user.id,
            "reset",
            f"Обнулён баланс пользователя «{user.username}»",
            before=before,
            after=self.user_snapshot(user),
            can_revert=True,
        )
        self.db.session.commit()

        return (
            f"Баланс пользователя «{user.username}» обнулён."
        )

    def recalculate_all(self) -> int:
        users = self.db.session.scalars(
            self.db.select(self.UsersTpv)
        ).all()

        for user in users:
            self.update_approval(user)

        self.db.session.commit()
        return len(users)


def register_users(context: EditorContext) -> dict[str, Any]:
    """Зарегистрировать маршруты пользователей с прежними endpoint."""
    service = UserService(context)

    def legacy_error(message: str, status: int = 400):
        # Сохраняем прежний JSON-контракт: поле называется message.
        return jsonify({"ok": False, "message": message}), status

    def require_access():
        if context.permissions.is_allowed():
            return None
        return legacy_error("Нет доступа к редактору.", 403)

    def tpv_editor_get_users():
        denied = require_access()
        if denied is not None:
            return denied

        return jsonify({
            "ok": True,
            "users": [
                service.serialize(user)
                for user in service.list_users()
            ],
        })

    def tpv_editor_create_user():
        denied = require_access()
        if denied is not None:
            return denied

        data = request.get_json(silent=True) or {}

        try:
            user = service.create(data)
        except LookupError as exc:
            return legacy_error(str(exc), 409)
        except (ValueError, TypeError) as exc:
            return legacy_error(str(exc))

        return jsonify({
            "ok": True,
            "message": "Пользователь создан.",
            "user": service.serialize(user),
        }), 201

    def tpv_editor_update_user(user_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        user = service.get_user(user_id)
        if user is None:
            return legacy_error("Пользователь не найден.", 404)

        data = request.get_json(silent=True) or {}

        try:
            user, message = service.update(user, data)
        except LookupError as exc:
            return legacy_error(str(exc), 409)
        except (ValueError, TypeError) as exc:
            return legacy_error(str(exc))

        return jsonify({
            "ok": True,
            "message": message,
            "user": service.serialize(user),
        })

    def tpv_editor_delete_user(user_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        user = service.get_user(user_id)
        if user is None:
            return legacy_error("Пользователь не найден.", 404)

        return jsonify({
            "ok": True,
            "message": service.delete(user),
        })

    def tpv_editor_reset_money(user_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        user = service.get_user(user_id)
        if user is None:
            return legacy_error("Пользователь не найден.", 404)

        return jsonify({
            "ok": True,
            "message": service.reset_money(user),
        })

    def tpv_editor_recalculate_all():
        denied = require_access()
        if denied is not None:
            return denied

        count = service.recalculate_all()
        return jsonify({
            "ok": True,
            "message": f"Пересчитано пользователей: {count}.",
        })

    rules = (
        (
            "/tpv_editor/api/users",
            "tpv_editor_get_users",
            tpv_editor_get_users,
            ["GET"],
        ),
        (
            "/tpv_editor/api/users",
            "tpv_editor_create_user",
            tpv_editor_create_user,
            ["POST"],
        ),
        (
            "/tpv_editor/api/users/<int:user_id>",
            "tpv_editor_update_user",
            tpv_editor_update_user,
            ["PUT"],
        ),
        (
            "/tpv_editor/api/users/<int:user_id>",
            "tpv_editor_delete_user",
            tpv_editor_delete_user,
            ["DELETE"],
        ),
        (
            "/tpv_editor/api/users/<int:user_id>/reset-money",
            "tpv_editor_reset_money",
            tpv_editor_reset_money,
            ["POST"],
        ),
        (
            "/tpv_editor/api/users/recalculate-all",
            "tpv_editor_recalculate_all",
            tpv_editor_recalculate_all,
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

    return {
        "service": service,
        "tpv_editor_get_users": tpv_editor_get_users,
        "tpv_editor_create_user": tpv_editor_create_user,
        "tpv_editor_update_user": tpv_editor_update_user,
        "tpv_editor_delete_user": tpv_editor_delete_user,
        "tpv_editor_reset_money": tpv_editor_reset_money,
        "tpv_editor_recalculate_all": (
            tpv_editor_recalculate_all
        ),
        # Compatibility helpers for modules migrated later.
        "tpv_editor_author_question_count": (
            service.author_question_count
        ),
        "tpv_editor_user_to_dict": service.serialize,
    }


__all__ = ["UserService", "register_users"]
