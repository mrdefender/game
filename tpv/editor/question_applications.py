"""Заявки на вопросы TPV — этап 13.5.1.

Модуль содержит публичную форму и редакторскую модерацию заявок.
URL, endpoint-имена и JSON-контракты сохранены.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import jsonify, render_template, request
from tpv.auth.yandex import get_yandex_user, is_yandex_auth_enabled
from sqlalchemy import func, inspect

from .registry import EditorContext
from .responses import message_error_response


class QuestionApplicationService:
    """Подача и модерация заявок на вопросы."""

    STATUS_LABELS = {
        "pending": "На рассмотрении",
        "approved": "Утверждена",
        "rejected": "Отклонена",
    }

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db

        self.UsersTpv = self._dependency("UsersTpv")
        self.QuestionsTpv = self._dependency("Questions_tpv")
        self.QuestionApplication = self._dependency(
            "TpvQuestionApplication"
        )
        self.ParticipationApplication = self.context.get(
            "TpvParticipationApplication"
        )

        self.normalize_text = self._dependency(
            "tpv_editor_normalize_text"
        )
        self.normalize_theme = self._dependency(
            "tpv_editor_normalize_theme"
        )
        self.is_general_theme = self._dependency(
            "tpv_editor_is_general_theme"
        )
        self.recalculate_theme = self._dependency(
            "tpv_editor_recalculate_theme"
        )

        self.history_add = self._dependency(
            "tpv_editor_history_add"
        )
        self.user_snapshot = self._dependency(
            "tpv_editor_user_snapshot"
        )
        self.question_snapshot = self._dependency(
            "tpv_editor_question_snapshot"
        )

    def _dependency(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                "Заявки на вопросы TPV Editor: "
                f"отсутствует зависимость {name}"
            )
        return value

    def table_exists(self) -> bool:
        try:
            return (
                "tpv_question_applications"
                in inspect(self.db.engine).get_table_names()
            )
        except Exception:
            self.context.app.logger.exception(
                "TPV Question Applications: не удалось проверить таблицу заявок."
            )
            return False

    def create_table(self) -> None:
        self.QuestionApplication.__table__.create(
            bind=self.db.engine,
            checkfirst=True,
        )

    def available_themes(self) -> list[str]:
        """Темы замены из игроков и существующих вопросов."""
        question_themes = self.db.session.scalars(
            self.db.select(self.QuestionsTpv.flip)
            .where(self.QuestionsTpv.flip.is_not(None))
            .distinct()
        ).all()

        user_themes = self.db.session.scalars(
            self.db.select(self.UsersTpv.flip)
            .where(self.UsersTpv.flip.is_not(None))
            .distinct()
        ).all()

        themes_by_key: dict[str, str] = {}

        for raw_value in [*question_themes, *user_themes]:
            value = self.normalize_text(raw_value)

            if not value or self.is_general_theme(value):
                continue

            themes_by_key.setdefault(value.casefold(), value)

        return sorted(themes_by_key.values(), key=str.casefold)

    def user_for_identity(self, yandex_user: dict[str, Any] | None):
        """Find a TPV player by the Yandex display name only.

        We intentionally do not store or use Yandex ID. The canonical public
        identity is real_name with login fallback, saved in display_name.
        """
        if not yandex_user:
            return None
        display_name = self.normalize_text(yandex_user.get("display_name"))
        if not display_name:
            return None
        return self.db.session.scalar(
            self.db.select(self.UsersTpv).where(
                func.lower(self.UsersTpv.username) == display_name.casefold()
            )
        )

    def own_theme_for_identity(self, yandex_user: dict[str, Any] | None) -> str | None:
        user = self.user_for_identity(yandex_user)
        if user is not None:
            theme = self.normalize_theme(user.flip)
            if not self.is_general_theme(theme):
                return theme

        # If the player has not yet been created, use their latest active
        # participation application, matched by the same display name.
        display_name = self.normalize_text((yandex_user or {}).get("display_name"))
        if display_name and self.ParticipationApplication is not None:
            application = self.db.session.scalar(
                self.db.select(self.ParticipationApplication)
                .where(
                    func.lower(self.ParticipationApplication.display_name)
                    == display_name.casefold(),
                    self.ParticipationApplication.status != "rejected",
                )
                .order_by(self.ParticipationApplication.id.desc())
            )
            if application is not None:
                theme = self.normalize_theme(application.theme)
                if not self.is_general_theme(theme):
                    return theme
        return None

    def public_themes(self, yandex_user: dict[str, Any] | None) -> list[str]:
        themes = self.available_themes()
        own_theme = self.own_theme_for_identity(yandex_user)
        if not own_theme:
            return themes
        own_key = self.normalize_text(own_theme).casefold()
        return [
            theme for theme in themes
            if self.normalize_text(theme).casefold() != own_key
        ]

    def validate(self, data: dict[str, Any]) -> dict[str, str]:
        author = self.normalize_text(data.get("author"))
        task = self.normalize_text(data.get("task"))
        answer = self.normalize_text(data.get("answer"))
        comment = self.normalize_text(data.get("comment"))
        flip = self.normalize_theme(data.get("flip"))

        if not author:
            raise ValueError("Укажите имя автора.")
        if len(author) > 100:
            raise ValueError("Имя автора слишком длинное.")
        if not task:
            raise ValueError("Введите текст вопроса.")
        if not answer:
            raise ValueError("Введите ответ.")
        if len(task) > 3000:
            raise ValueError("Текст вопроса слишком длинный.")
        if len(answer) > 2000:
            raise ValueError("Ответ слишком длинный.")
        if len(comment) > 3000:
            raise ValueError("Комментарий слишком длинный.")

        if not self.is_general_theme(flip):
            available = {
                value.casefold()
                for value in self.available_themes()
            }
            if self.normalize_text(flip).casefold() not in available:
                raise ValueError(
                    "Выбранная тема замены отсутствует в базе."
                )

        return {
            "author": author,
            "task": task,
            "answer": answer,
            "comment": comment,
            "flip": flip,
        }

    def serialize(self, row: Any) -> dict[str, Any]:
        general = self.is_general_theme(row.flip)

        author_exists = (
            self.db.session.scalar(
                self.db.select(self.UsersTpv.id).where(
                    func.lower(self.UsersTpv.username)
                    == row.author.casefold()
                )
            )
            is not None
        )

        return {
            "id": row.id,
            "author": row.author,
            "task": row.task,
            "answer": row.answer,
            "comment": row.comment or "",
            "flip": row.flip,
            "flip_display": "Общий" if general else row.flip,
            "is_general": general,
            "status": row.status,
            "status_label": self.STATUS_LABELS.get(
                row.status,
                row.status,
            ),
            "reject_reason": row.reject_reason or "",
            "created_at": row.created_at.isoformat(
                timespec="seconds"
            ),
            "created_at_label": row.created_at.strftime(
                "%d.%m.%Y %H:%M"
            ),
            "reviewed_at": (
                row.reviewed_at.isoformat(timespec="seconds")
                if row.reviewed_at
                else None
            ),
            "reviewed_by": row.reviewed_by or "",
            "question_id": row.question_id,
            "author_exists": author_exists,
        }

    def submit(
        self,
        data: dict[str, Any],
        *,
        yandex_user: dict[str, Any],
    ) -> Any:
        public_data = dict(data)
        public_data["author"] = yandex_user.get("display_name")
        values = self.validate(public_data)

        own_theme = self.own_theme_for_identity(yandex_user)
        if own_theme and not self.is_general_theme(values["flip"]):
            if (
                self.normalize_text(values["flip"]).casefold()
                == self.normalize_text(own_theme).casefold()
            ):
                raise PermissionError(
                    "Нельзя отправлять вопросы по своей теме."
                )

        duplicate = self.db.session.scalar(
            self.db.select(self.QuestionApplication).where(
                func.lower(self.QuestionApplication.task)
                == values["task"].casefold(),
                self.QuestionApplication.status == "pending",
            )
        )

        if duplicate is not None:
            raise LookupError(
                "Похожая заявка уже ожидает модерации "
                f"под номером {duplicate.id}."
            )

        row = self.QuestionApplication(
            author=values["author"],
            task=values["task"],
            answer=values["answer"],
            comment=values["comment"],
            flip=values["flip"],
            status="pending",
        )
        self.db.session.add(row)
        self.db.session.commit()
        return row

    def list_data(self) -> dict[str, Any]:
        if not self.table_exists():
            return {
                "table_exists": False,
                "items": [],
                "stats": {
                    "total": 0,
                    "pending": 0,
                    "approved": 0,
                    "rejected": 0,
                },
            }

        rows = self.db.session.scalars(
            self.db.select(self.QuestionApplication)
            .order_by(self.QuestionApplication.id.desc())
            .limit(2000)
        ).all()

        return {
            "table_exists": True,
            "items": [self.serialize(row) for row in rows],
            "stats": {
                "total": len(rows),
                "pending": sum(
                    row.status == "pending"
                    for row in rows
                ),
                "approved": sum(
                    row.status == "approved"
                    for row in rows
                ),
                "rejected": sum(
                    row.status == "rejected"
                    for row in rows
                ),
            },
        }

    def approve(
        self,
        row: Any,
        data: dict[str, Any],
    ) -> Any:
        if row.status != "pending":
            raise RuntimeError("Заявка уже обработана.")

        values = self.validate(data)

        existing_question = self.db.session.scalar(
            self.db.select(self.QuestionsTpv).where(
                func.lower(self.QuestionsTpv.task)
                == values["task"].casefold()
            )
        )
        if existing_question is not None:
            raise LookupError(
                "Вопрос с такой формулировкой уже существует: "
                f"#{existing_question.id}."
            )

        user = self.db.session.scalar(
            self.db.select(self.UsersTpv).where(
                func.lower(self.UsersTpv.username)
                == values["author"].casefold()
            )
        )

        if user is None and bool(data.get("create_user")):
            if len(values["author"]) > 10:
                raise OverflowError(
                    "Нельзя создать пользователя: текущая модель "
                    "допускает имя до 10 символов."
                )

            user = self.UsersTpv(
                username=values["author"],
                money=0,
                flip="false",
                flip_col=0,
                approve="false",
            )
            self.db.session.add(user)
            self.db.session.flush()

            self.history_add(
                "user",
                user.id,
                "create",
                "Создан пользователь "
                f"«{user.username}» при утверждении заявки",
                after=self.user_snapshot(user),
                can_revert=True,
            )

        question = self.QuestionsTpv(
            task=values["task"],
            answer=values["answer"],
            comment=values["comment"],
            author=values["author"],
            flip=values["flip"],
            show="false",
        )
        self.db.session.add(question)
        self.db.session.flush()

        row.author = values["author"]
        row.task = values["task"]
        row.answer = values["answer"]
        row.comment = values["comment"]
        row.flip = values["flip"]
        row.status = "approved"
        row.reject_reason = ""
        row.reviewed_at = datetime.utcnow()
        row.reviewed_by = "TPV Editor"
        row.question_id = question.id

        self.recalculate_theme(question.flip)

        self.history_add(
            "question",
            question.id,
            "create",
            f"Утверждена заявка #{row.id}; "
            f"создан вопрос #{question.id}",
            after=self.question_snapshot(question),
            details=f"Автор заявки: {row.author}.",
            can_revert=True,
        )

        self.db.session.commit()
        return question

    def reject(self, row: Any, reason_raw: Any) -> None:
        if row.status != "pending":
            raise RuntimeError("Заявка уже обработана.")

        reason = self.normalize_text(reason_raw)
        if not reason:
            raise ValueError("Укажите причину отклонения.")

        row.status = "rejected"
        row.reject_reason = reason
        row.reviewed_at = datetime.utcnow()
        row.reviewed_by = "TPV Editor"

        self.history_add(
            "bulk",
            row.id,
            "update",
            f"Отклонена заявка #{row.id}",
            details=f"Причина: {reason}",
            can_revert=False,
        )
        self.db.session.commit()

    def delete(self, row: Any) -> None:
        application_id = row.id
        snapshot = self.serialize(row)

        self.db.session.delete(row)
        self.history_add(
            "bulk",
            application_id,
            "delete",
            f"Удалена заявка #{application_id}",
            before=snapshot,
            can_revert=False,
        )
        self.db.session.commit()

    def clear(self, mode: str) -> int:
        if not self.table_exists():
            raise RuntimeError("Таблица заявок не создана.")

        statement = self.db.delete(self.QuestionApplication)

        if mode == "processed":
            statement = statement.where(
                self.QuestionApplication.status.in_(
                    ["approved", "rejected"]
                )
            )
        elif mode == "approved":
            statement = statement.where(
                self.QuestionApplication.status == "approved"
            )
        elif mode == "rejected":
            statement = statement.where(
                self.QuestionApplication.status == "rejected"
            )
        elif mode != "all":
            raise ValueError("Некорректный режим очистки заявок.")

        result = self.db.session.execute(statement)
        deleted = int(result.rowcount or 0)

        self.history_add(
            "bulk",
            None,
            "delete",
            "Очищены заявки на вопросы",
            details=f"Режим: {mode}. Удалено: {deleted}.",
            can_revert=False,
        )
        self.db.session.commit()
        return deleted


def register_question_applications(
    context: EditorContext,
) -> dict[str, Any]:
    """Зарегистрировать публичные и редакторские маршруты."""
    service = QuestionApplicationService(context)

    def require_access():
        if context.permissions.is_allowed():
            return None
        return message_error_response("Нет доступа к редактору.", 403)

    def public_form_enabled() -> bool:
        getter = context.get("tpv_public_question_form_enabled")
        return True if not callable(getter) else bool(getter())

    def tpv_question_application_page():
        auth_enabled = is_yandex_auth_enabled(context.app)
        return render_template(
            "tpv-question-application.html",
            form_enabled=public_form_enabled(),
            yandex_user=(get_yandex_user() if auth_enabled else None),
            yandex_auth_enabled=auth_enabled,
        )

    def tpv_question_application_status():
        enabled = public_form_enabled()
        auth_enabled = is_yandex_auth_enabled(context.app)
        yandex_user = get_yandex_user() if auth_enabled else None
        if not yandex_user and not auth_enabled:
            manual_author = service.normalize_text(request.args.get("author"))
            if manual_author:
                yandex_user = {"display_name": manual_author, "login": ""}
        own_theme = service.own_theme_for_identity(yandex_user)
        return jsonify({
            "ok": True,
            "table_exists": service.table_exists(),
            "form_enabled": enabled,
            "auth_enabled": auth_enabled,
            "authenticated": bool(yandex_user) if auth_enabled else True,
            "user": ({
                "display_name": yandex_user.get("display_name"),
                "login": yandex_user.get("login"),
            } if yandex_user else None),
            "own_theme": own_theme,
            "themes": service.public_themes(yandex_user) if enabled else [],
        })

    def tpv_question_application_submit():
        if not public_form_enabled():
            return message_error_response(
                "Приём вопросов временно закрыт.",
                403,
            )

        if not service.table_exists():
            return message_error_response(
                "Приём заявок временно недоступен.",
                503,
            )

        data = request.get_json(silent=True) or {}
        auth_enabled = is_yandex_auth_enabled(context.app)
        yandex_user = get_yandex_user() if auth_enabled else None
        if auth_enabled and not yandex_user:
            return message_error_response(
                "Для отправки вопроса необходимо войти через Яндекс.",
                401,
            )
        if not yandex_user:
            manual_author = service.normalize_text(data.get("author"))
            if not manual_author:
                return message_error_response(
                    "Укажите имя или никнейм автора.",
                    400,
                )
            yandex_user = {"display_name": manual_author, "login": ""}

        try:
            row = service.submit(
                data,
                yandex_user=yandex_user,
            )
        except PermissionError as exc:
            return message_error_response(str(exc), 403)
        except LookupError as exc:
            return message_error_response(str(exc), 409)
        except ValueError as exc:
            return message_error_response(str(exc))

        return jsonify({
            "ok": True,
            "message": "Заявка отправлена на модерацию.",
            "application_id": row.id,
        }), 201

    def tpv_editor_application_list():
        denied = require_access()
        if denied is not None:
            return denied

        return jsonify({
            "ok": True,
            **service.list_data(),
        })

    def tpv_editor_application_create_table_route():
        denied = require_access()
        if denied is not None:
            return denied

        service.create_table()
        return jsonify({
            "ok": True,
            "message": "Таблица заявок создана.",
        })

    def tpv_editor_application_approve(application_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        row = service.db.session.get(
            service.QuestionApplication,
            application_id,
        )
        if row is None:
            return message_error_response("Заявка не найдена.", 404)

        try:
            question = service.approve(
                row,
                request.get_json(silent=True) or {},
            )
        except LookupError as exc:
            return message_error_response(str(exc), 409)
        except OverflowError as exc:
            return message_error_response(str(exc), 409)
        except RuntimeError as exc:
            return message_error_response(str(exc), 409)
        except ValueError as exc:
            return message_error_response(str(exc))

        return jsonify({
            "ok": True,
            "message": (
                "Заявка утверждена. "
                f"Создан вопрос #{question.id}."
            ),
            "question_id": question.id,
        })

    def tpv_editor_application_reject(application_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        row = service.db.session.get(
            service.QuestionApplication,
            application_id,
        )
        if row is None:
            return message_error_response("Заявка не найдена.", 404)

        data = request.get_json(silent=True) or {}

        try:
            service.reject(row, data.get("reject_reason"))
        except RuntimeError as exc:
            return message_error_response(str(exc), 409)
        except ValueError as exc:
            return message_error_response(str(exc))

        return jsonify({
            "ok": True,
            "message": "Заявка отклонена.",
        })

    def tpv_editor_application_delete(application_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        row = service.db.session.get(
            service.QuestionApplication,
            application_id,
        )
        if row is None:
            return message_error_response("Заявка не найдена.", 404)

        service.delete(row)
        return jsonify({
            "ok": True,
            "message": "Заявка удалена.",
        })

    def tpv_editor_applications_clear():
        denied = require_access()
        if denied is not None:
            return denied

        data = request.get_json(silent=True) or {}
        mode = str(data.get("mode") or "processed")

        try:
            deleted = service.clear(mode)
        except RuntimeError as exc:
            return message_error_response(str(exc), 409)
        except ValueError as exc:
            return message_error_response(str(exc))

        return jsonify({
            "ok": True,
            "message": f"Удалено заявок: {deleted}.",
            "deleted": deleted,
        })

    rules = (
        (
            "/tpv_questions",
            "tpv_question_application_page",
            tpv_question_application_page,
            ["GET"],
        ),
        (
            "/tpv-question",
            "tpv_question_application_page_alias",
            tpv_question_application_page,
            ["GET"],
        ),
        (
            "/api/tpv-question-applications/status",
            "tpv_question_application_status",
            tpv_question_application_status,
            ["GET"],
        ),
        (
            "/api/tpv-question-applications",
            "tpv_question_application_submit",
            tpv_question_application_submit,
            ["POST"],
        ),
        (
            "/tpv_editor/api/question-applications",
            "tpv_editor_application_list",
            tpv_editor_application_list,
            ["GET"],
        ),
        (
            "/tpv_editor/api/question-applications/create-table",
            "tpv_editor_application_create_table_route",
            tpv_editor_application_create_table_route,
            ["POST"],
        ),
        (
            "/tpv_editor/api/question-applications/"
            "<int:application_id>/approve",
            "tpv_editor_application_approve",
            tpv_editor_application_approve,
            ["POST"],
        ),
        (
            "/tpv_editor/api/question-applications/"
            "<int:application_id>/reject",
            "tpv_editor_application_reject",
            tpv_editor_application_reject,
            ["POST"],
        ),
        (
            "/tpv_editor/api/question-applications/"
            "<int:application_id>",
            "tpv_editor_application_delete",
            tpv_editor_application_delete,
            ["DELETE"],
        ),
        (
            "/tpv_editor/api/question-applications/clear",
            "tpv_editor_applications_clear",
            tpv_editor_applications_clear,
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
        "tpv_editor_applications_table_exists": (
            service.table_exists
        ),
        "tpv_editor_applications_create_table": (
            service.create_table
        ),
        "tpv_editor_application_validate": service.validate,
        "tpv_editor_application_to_dict": service.serialize,
        "tpv_question_application_available_themes": (
            service.available_themes
        ),
        "tpv_question_application_page": (
            tpv_question_application_page
        ),
        "tpv_question_application_status": (
            tpv_question_application_status
        ),
        "tpv_question_application_submit": (
            tpv_question_application_submit
        ),
        "tpv_editor_application_list": (
            tpv_editor_application_list
        ),
        "tpv_editor_application_create_table_route": (
            tpv_editor_application_create_table_route
        ),
        "tpv_editor_application_approve": (
            tpv_editor_application_approve
        ),
        "tpv_editor_application_reject": (
            tpv_editor_application_reject
        ),
        "tpv_editor_application_delete": (
            tpv_editor_application_delete
        ),
        "tpv_editor_applications_clear": (
            tpv_editor_applications_clear
        ),
    }


__all__ = [
    "QuestionApplicationService",
    "register_question_applications",
]
