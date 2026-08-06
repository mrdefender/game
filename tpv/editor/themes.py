"""Темы TPV Editor — этап 13.4.1.

Темы хранятся в ``Questions_tpv.flip`` и ``UsersTpv.flip``.
Отдельная таблица не создаётся. Модуль также содержит общие
тематические helpers, которыми пользуются другие разделы редактора.
"""

from __future__ import annotations

from typing import Any

from flask import jsonify, request

from .registry import EditorContext


class ThemeService:
    """Работа с темами вопросов и игроков TPV."""

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db

        self.UsersTpv = self._dependency("UsersTpv")
        self.QuestionsTpv = self._dependency("Questions_tpv")

        self.normalize_text = self._dependency(
            "tpv_editor_normalize_text"
        )
        self.history_add = self._dependency(
            "tpv_editor_history_add"
        )
        self.question_snapshot = self._dependency(
            "tpv_editor_question_snapshot"
        )
        self.user_snapshot = self._dependency(
            "tpv_editor_user_snapshot"
        )

        self.general_values = {
            str(value).casefold()
            for value in context.get(
                "TPV_GENERAL_QUESTION_VALUES",
                {"", "false", "общий"},
            )
        }
        self.required_questions = int(
            context.get("TPV_REQUIRED_FLIP_QUESTIONS", 5)
        )

    def _dependency(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                f"Темы TPV Editor: отсутствует зависимость {name}"
            )
        return value

    def is_general(self, value: Any) -> bool:
        return self.normalize_text(value).casefold() in self.general_values

    def normalize_theme(self, value: Any) -> str:
        theme = self.normalize_text(value)
        return "false" if self.is_general(theme) else theme

    def theme_key(self, value: Any) -> str:
        """Ключ темы с поддержкой кириллицы и лишних пробелов."""
        return self.normalize_text(value).casefold()

    def matching_questions(self, theme: Any) -> list[Any]:
        key = self.theme_key(theme)
        if not key or self.is_general(theme):
            return []

        questions = self.db.session.scalars(
            self.db.select(self.QuestionsTpv).where(
                self.QuestionsTpv.flip.is_not(None)
            )
        ).all()

        return [
            question
            for question in questions
            if self.theme_key(question.flip) == key
        ]

    def matching_users(self, theme: Any) -> list[Any]:
        key = self.theme_key(theme)
        if not key or self.is_general(theme):
            return []

        users = self.db.session.scalars(
            self.db.select(self.UsersTpv).where(
                self.UsersTpv.flip.is_not(None)
            )
        ).all()

        return [
            user
            for user in users
            if self.theme_key(user.flip) == key
        ]

    def count_questions(self, theme: Any) -> int:
        normalized = self.normalize_theme(theme)
        if self.is_general(normalized):
            return 0
        return len(self.matching_questions(normalized))

    def update_approval(self, user: Any) -> None:
        user.flip = self.normalize_theme(user.flip)

        if self.is_general(user.flip):
            user.flip_col = 0
            user.approve = "false"
            return

        user.flip_col = self.count_questions(user.flip)
        user.approve = (
            "true"
            if user.flip_col >= self.required_questions
            else "false"
        )

    def theme_list(self) -> list[str]:
        raw = self.db.session.scalars(
            self.db.select(self.QuestionsTpv.flip)
            .where(self.QuestionsTpv.flip.is_not(None))
            .distinct()
        ).all()

        unique: dict[str, str] = {}

        for raw_value in raw:
            theme = self.normalize_text(raw_value)
            if theme and not self.is_general(theme):
                unique.setdefault(theme.casefold(), theme)

        return sorted(unique.values(), key=str.casefold)

    def theme_rows(self) -> list[dict[str, Any]]:
        questions = self.db.session.scalars(
            self.db.select(self.QuestionsTpv).where(
                self.QuestionsTpv.flip.is_not(None)
            )
        ).all()
        users = self.db.session.scalars(
            self.db.select(self.UsersTpv).where(
                self.UsersTpv.flip.is_not(None)
            )
        ).all()

        groups: dict[str, dict[str, Any]] = {}

        for question in questions:
            value = self.normalize_text(question.flip)
            if not value or self.is_general(value):
                continue

            group = groups.setdefault(
                self.theme_key(value),
                {
                    "variants": set(),
                    "questions": [],
                    "users": [],
                },
            )
            group["variants"].add(value)
            group["questions"].append(question)

        for user in users:
            value = self.normalize_text(user.flip)
            if not value or self.is_general(value):
                continue

            group = groups.setdefault(
                self.theme_key(value),
                {
                    "variants": set(),
                    "questions": [],
                    "users": [],
                },
            )
            group["variants"].add(value)
            group["users"].append(user)

        result = []

        for group in groups.values():
            variants = sorted(group["variants"], key=str.casefold)
            theme_questions = group["questions"]
            theme_users = group["users"]
            question_count = len(theme_questions)

            result.append({
                "name": variants[0],
                "variants": variants,
                "question_count": question_count,
                "shown_count": sum(
                    str(question.show).lower() == "true"
                    for question in theme_questions
                ),
                "user_count": len(theme_users),
                "approved_count": sum(
                    str(user.approve).lower() == "true"
                    for user in theme_users
                ),
                "required_questions": self.required_questions,
                "ready": question_count >= self.required_questions,
            })

        return sorted(
            result,
            key=lambda item: item["name"].casefold(),
        )

    def rename(self, old_name: str, new_name: str) -> tuple[int, int]:
        old_name = self.normalize_text(old_name)
        new_name = self.normalize_text(new_name)

        if not old_name or self.is_general(old_name):
            raise ValueError("Исходная тема не указана.")
        if not new_name or self.is_general(new_name):
            raise ValueError(
                "Название темы не может быть пустым или общим."
            )
        if (
            old_name.casefold() == new_name.casefold()
            and old_name == new_name
        ):
            raise ValueError("Название темы не изменилось.")

        questions = self.matching_questions(old_name)
        users = self.matching_users(old_name)

        if not questions and not users:
            raise LookupError("Тема не найдена.")

        before = {
            "questions": [
                self.question_snapshot(item)
                for item in questions
            ],
            "users": [
                self.user_snapshot(item)
                for item in users
            ],
        }

        for question in questions:
            question.flip = new_name
        for user in users:
            user.flip = new_name

        self.db.session.flush()

        # Учитываются и пользователи, ранее находившиеся в целевой теме.
        for user in self.matching_users(new_name):
            self.update_approval(user)

        after = {
            "questions": [
                self.question_snapshot(item)
                for item in questions
            ],
            "users": [
                self.user_snapshot(item)
                for item in users
            ],
        }

        self.history_add(
            "theme",
            old_name,
            "rename",
            f"Тема «{old_name}» переименована в «{new_name}»",
            before=before,
            after=after,
            can_revert=True,
        )
        self.db.session.commit()

        return len(questions), len(users)

    def delete(
        self,
        name: str,
        target_raw: Any,
    ) -> tuple[int, int, str]:
        name = self.normalize_text(name)
        target = (
            "false"
            if self.is_general(target_raw)
            else self.normalize_text(target_raw)
        )

        if not name or self.is_general(name):
            raise ValueError("Удаляемая тема не указана.")
        if not target:
            target = "false"
        if (
            not self.is_general(target)
            and name.casefold() == target.casefold()
        ):
            raise ValueError("Нельзя перенести тему саму в себя.")

        questions = self.matching_questions(name)
        users = self.matching_users(name)

        if not questions and not users:
            raise LookupError("Тема не найдена.")

        before = {
            "questions": [
                self.question_snapshot(item)
                for item in questions
            ],
            "users": [
                self.user_snapshot(item)
                for item in users
            ],
        }

        for question in questions:
            question.flip = target
        for user in users:
            user.flip = target

        self.db.session.flush()

        if self.is_general(target):
            for user in users:
                self.update_approval(user)
            target_label = "общие вопросы / без темы"
        else:
            for user in self.matching_users(target):
                self.update_approval(user)
            target_label = f"тему «{target}»"

        after = {
            "questions": [
                self.question_snapshot(item)
                for item in questions
            ],
            "users": [
                self.user_snapshot(item)
                for item in users
            ],
        }

        self.history_add(
            "theme",
            name,
            "delete",
            f"Удалена тема «{name}»",
            before=before,
            after=after,
            details=f"Перенос выполнен в: {target_label}.",
            can_revert=True,
        )
        self.db.session.commit()

        return len(questions), len(users), target_label


def register_themes(context: EditorContext) -> dict[str, Any]:
    """Зарегистрировать маршруты тем с прежними endpoint-именами."""
    service = ThemeService(context)

    def error(message: str, status: int = 400):
        return jsonify({"ok": False, "message": message}), status

    def require_access():
        if context.permissions.is_allowed():
            return None
        return error("Нет доступа к редактору.", 403)

    def tpv_editor_get_themes():
        denied = require_access()
        if denied is not None:
            return denied

        return jsonify({
            "ok": True,
            "themes": service.theme_list(),
        })

    def tpv_editor_themes_dashboard():
        denied = require_access()
        if denied is not None:
            return denied

        return jsonify({
            "ok": True,
            "themes": service.theme_rows(),
        })

    def tpv_editor_rename_theme():
        denied = require_access()
        if denied is not None:
            return denied

        data = request.get_json(silent=True) or {}
        old_name = service.normalize_text(data.get("old_name"))
        new_name = service.normalize_text(data.get("new_name"))

        try:
            question_count, user_count = service.rename(
                old_name,
                new_name,
            )
        except LookupError as exc:
            return error(str(exc), 404)
        except ValueError as exc:
            return error(str(exc))

        return jsonify({
            "ok": True,
            "message": (
                f"Тема «{old_name}» перенесена в «{new_name}». "
                f"Вопросов: {question_count}, "
                f"пользователей: {user_count}."
            ),
        })

    def tpv_editor_delete_theme():
        denied = require_access()
        if denied is not None:
            return denied

        data = request.get_json(silent=True) or {}
        name = service.normalize_text(data.get("name"))

        try:
            question_count, user_count, target_label = (
                service.delete(name, data.get("target"))
            )
        except LookupError as exc:
            return error(str(exc), 404)
        except ValueError as exc:
            return error(str(exc))

        return jsonify({
            "ok": True,
            "message": (
                f"Тема «{name}» удалена. "
                f"Связанные записи перенесены в {target_label}. "
                f"Вопросов: {question_count}, "
                f"пользователей: {user_count}."
            ),
        })

    rules = (
        (
            "/tpv_editor/api/themes",
            "tpv_editor_get_themes",
            tpv_editor_get_themes,
            ["GET"],
        ),
        (
            "/tpv_editor/api/themes-dashboard",
            "tpv_editor_themes_dashboard",
            tpv_editor_themes_dashboard,
            ["GET"],
        ),
        (
            "/tpv_editor/api/themes/rename",
            "tpv_editor_rename_theme",
            tpv_editor_rename_theme,
            ["POST"],
        ),
        (
            "/tpv_editor/api/themes/delete",
            "tpv_editor_delete_theme",
            tpv_editor_delete_theme,
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
        "tpv_editor_is_general_theme": service.is_general,
        "tpv_editor_normalize_theme": service.normalize_theme,
        "tpv_editor_theme_key": service.theme_key,
        "tpv_editor_matching_questions": service.matching_questions,
        "tpv_editor_matching_users": service.matching_users,
        "tpv_editor_count_questions": service.count_questions,
        "tpv_editor_update_approval": service.update_approval,
        "tpv_editor_theme_list": service.theme_list,
        "tpv_editor_theme_rows": service.theme_rows,
        "tpv_editor_get_themes": tpv_editor_get_themes,
        "tpv_editor_themes_dashboard": (
            tpv_editor_themes_dashboard
        ),
        "tpv_editor_rename_theme": tpv_editor_rename_theme,
        "tpv_editor_delete_theme": tpv_editor_delete_theme,
    }


__all__ = ["ThemeService", "register_themes"]
