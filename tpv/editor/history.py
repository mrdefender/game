"""История изменений TPV Editor — этап 13.4.3.

Модуль хранит snapshots, журналирование, просмотр, очистку и откат.
Он регистрируется до остальных разделов, поскольку Users, Questions,
Themes и Builder используют его helpers.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import json
from typing import Any

from flask import jsonify, request
from sqlalchemy import func, inspect

from .registry import EditorContext


class HistoryService:
    """Журнал изменений и восстановление сущностей TPV Editor."""

    ACTION_LABELS = {
        "create": "Создание",
        "update": "Изменение",
        "delete": "Удаление",
        "reset": "Сброс",
        "rename": "Переименование",
        "import": "Импорт",
        "fix": "Исправление",
        "revert": "Откат",
    }

    ENTITY_LABELS = {
        "user": "Пользователь",
        "question": "Вопрос",
        "theme": "Тема",
        "bulk": "Массовая операция",
    }

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db
        self.UsersTpv = self._dependency("UsersTpv")
        self.QuestionsTpv = self._dependency("Questions_tpv")
        self.EditorHistory = self._dependency("TpvEditorHistory")

    def _dependency(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                f"История TPV Editor: отсутствует зависимость {name}"
            )
        return value

    def _late_dependency(self, name: str) -> Any:
        """Получить helper модуля, зарегистрированного после History."""
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                f"История TPV Editor: поздняя зависимость не готова: {name}"
            )
        return value

    def table_exists(self) -> bool:
        try:
            return (
                "tpv_editor_history"
                in inspect(self.db.engine).get_table_names()
            )
        except Exception:
            return False

    def create_table(self) -> None:
        self.EditorHistory.__table__.create(
            bind=self.db.engine,
            checkfirst=True,
        )

    @staticmethod
    def to_json(value: Any) -> str | None:
        if value is None:
            return None
        return json.dumps(
            value,
            ensure_ascii=False,
            sort_keys=True,
        )

    @staticmethod
    def parse_json(value: Any) -> Any:
        if not value:
            return None
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return None

    @staticmethod
    def user_snapshot(user: Any) -> dict[str, Any] | None:
        if user is None:
            return None
        return {
            "id": user.id,
            "username": user.username,
            "money": int(user.money or 0),
            "flip": user.flip,
            "flip_col": int(user.flip_col or 0),
            "approve": user.approve,
        }

    @staticmethod
    def question_snapshot(question: Any) -> dict[str, Any] | None:
        if question is None:
            return None
        return {
            "id": question.id,
            "task": question.task,
            "answer": question.answer,
            "comment": question.comment,
            "author": question.author,
            "flip": question.flip,
            "show": question.show,
        }

    def add(
        self,
        entity_type: str,
        entity_id: Any,
        action: str,
        title: str,
        before: Any = None,
        after: Any = None,
        details: str = "",
        can_revert: bool = False,
    ) -> Any | None:
        if not self.table_exists():
            return None

        row = self.EditorHistory(
            entity_type=entity_type,
            entity_id=(
                str(entity_id)
                if entity_id is not None
                else None
            ),
            action=action,
            title=title,
            details=details or "",
            before_json=self.to_json(before),
            after_json=self.to_json(after),
            can_revert=bool(can_revert),
        )
        self.db.session.add(row)
        return row

    def serialize(self, row: Any) -> dict[str, Any]:
        return {
            "id": row.id,
            "created_at": row.created_at.isoformat(
                timespec="seconds"
            ),
            "entity_type": row.entity_type,
            "entity_label": self.ENTITY_LABELS.get(
                row.entity_type,
                row.entity_type,
            ),
            "entity_id": row.entity_id,
            "action": row.action,
            "action_label": self.ACTION_LABELS.get(
                row.action,
                row.action,
            ),
            "title": row.title,
            "details": row.details or "",
            "before": self.parse_json(row.before_json),
            "after": self.parse_json(row.after_json),
            "can_revert": bool(row.can_revert),
            "reverted": row.reverted_at is not None,
            "reverted_at": (
                row.reverted_at.isoformat(timespec="seconds")
                if row.reverted_at
                else None
            ),
            "revert_history_id": row.revert_history_id,
        }

    def restore_user(self, snapshot: dict[str, Any] | None) -> Any | None:
        if not snapshot:
            return None

        user = self.db.session.get(
            self.UsersTpv,
            int(snapshot["id"]),
        )

        if user is None:
            duplicate = self.db.session.scalar(
                self.db.select(self.UsersTpv).where(
                    func.lower(self.UsersTpv.username)
                    == str(snapshot["username"]).casefold()
                )
            )
            if duplicate is not None:
                raise ValueError(
                    "Нельзя восстановить пользователя: имя уже занято."
                )

            user = self.UsersTpv()
            user.id = int(snapshot["id"])
            self.db.session.add(user)

        user.username = snapshot["username"]
        user.money = int(snapshot.get("money") or 0)
        user.flip = snapshot.get("flip") or "false"
        user.flip_col = int(snapshot.get("flip_col") or 0)
        user.approve = snapshot.get("approve") or "false"
        return user

    def restore_question(
        self,
        snapshot: dict[str, Any] | None,
    ) -> Any | None:
        if not snapshot:
            return None

        question = self.db.session.get(
            self.QuestionsTpv,
            int(snapshot["id"]),
        )

        if question is None:
            question = self.QuestionsTpv()
            question.id = int(snapshot["id"])
            self.db.session.add(question)

        question.task = snapshot.get("task") or ""
        question.answer = snapshot.get("answer") or ""
        question.comment = snapshot.get("comment") or ""
        question.author = snapshot.get("author") or ""
        question.flip = snapshot.get("flip") or "false"
        question.show = snapshot.get("show") or "false"
        return question

    def revert_row(self, row: Any) -> None:
        before = self.parse_json(row.before_json)

        if row.entity_type == "user":
            self._revert_user(row, before)
        elif row.entity_type == "question":
            self._revert_question(row, before)
        elif row.entity_type == "theme":
            self._revert_theme(before)
        else:
            raise ValueError("Для этой операции откат недоступен.")

        row.reverted_at = datetime.utcnow()

    def _revert_user(self, row: Any, before: Any) -> None:
        if row.action == "create":
            user = self.db.session.get(
                self.UsersTpv,
                int(row.entity_id),
            )
            if user is not None:
                self.db.session.delete(user)
            return

        if row.action in {"update", "reset", "delete"}:
            self.restore_user(before)
            return

        raise ValueError(
            "Эта операция пользователя не поддерживает откат."
        )

    def _revert_question(self, row: Any, before: Any) -> None:
        recalculate_theme = self._late_dependency(
            "tpv_editor_recalculate_theme"
        )

        if row.action == "create":
            question = self.db.session.get(
                self.QuestionsTpv,
                int(row.entity_id),
            )
            if question is not None:
                theme = question.flip
                self.db.session.delete(question)
                self.db.session.flush()
                recalculate_theme(theme)
            return

        if row.action in {"update", "delete"}:
            old_theme = None
            current = self.db.session.get(
                self.QuestionsTpv,
                int(row.entity_id),
            )
            if current is not None:
                old_theme = current.flip

            restored = self.restore_question(before)
            self.db.session.flush()

            if old_theme:
                recalculate_theme(old_theme)
            if restored is not None:
                recalculate_theme(restored.flip)
            return

        raise ValueError(
            "Эта операция вопроса не поддерживает откат."
        )

    def _revert_theme(self, before: Any) -> None:
        if not isinstance(before, dict):
            raise ValueError("В истории отсутствует снимок темы.")

        for snapshot in before.get("questions", []):
            self.restore_question(snapshot)
        for snapshot in before.get("users", []):
            self.restore_user(snapshot)

        self.db.session.flush()

        update_approval = self._late_dependency(
            "tpv_editor_update_approval"
        )
        users = self.db.session.scalars(
            self.db.select(self.UsersTpv)
        ).all()
        for user in users:
            update_approval(user)

    def list_data(self) -> dict[str, Any]:
        if not self.table_exists():
            return {
                "table_exists": False,
                "items": [],
                "stats": {
                    "total": 0,
                    "today": 0,
                    "revertible": 0,
                    "reverted": 0,
                },
            }

        rows = self.db.session.scalars(
            self.db.select(self.EditorHistory)
            .order_by(self.EditorHistory.id.desc())
            .limit(1000)
        ).all()
        today = datetime.utcnow().date()

        return {
            "table_exists": True,
            "items": [self.serialize(row) for row in rows],
            "stats": {
                "total": len(rows),
                "today": sum(
                    row.created_at.date() == today
                    for row in rows
                ),
                "revertible": sum(
                    row.can_revert
                    and row.reverted_at is None
                    for row in rows
                ),
                "reverted": sum(
                    row.reverted_at is not None
                    for row in rows
                ),
            },
        }

    def revert(self, history_id: int) -> None:
        if not self.table_exists():
            raise RuntimeError("Таблица истории не создана.")

        row = self.db.session.get(self.EditorHistory, history_id)
        if row is None:
            raise LookupError("Запись истории не найдена.")
        if not row.can_revert:
            raise ValueError("Для этой операции откат недоступен.")
        if row.reverted_at is not None:
            raise ValueError("Операция уже была отменена.")

        self.revert_row(row)

        revert_row = self.add(
            entity_type=row.entity_type,
            entity_id=row.entity_id,
            action="revert",
            title=f"Отмена операции: {row.title}",
            before=self.parse_json(row.after_json),
            after=self.parse_json(row.before_json),
            details=f"Отменена запись истории #{row.id}.",
            can_revert=False,
        )

        self.db.session.flush()
        if revert_row is not None:
            row.revert_history_id = revert_row.id
        self.db.session.commit()

    def clear(self, mode: str) -> int:
        if not self.table_exists():
            raise RuntimeError("Таблица истории не создана.")

        statement = self.db.delete(self.EditorHistory)

        if mode == "older30":
            cutoff = datetime.utcnow() - timedelta(days=30)
            statement = statement.where(
                self.EditorHistory.created_at < cutoff
            )
        elif mode == "older365":
            cutoff = datetime.utcnow() - timedelta(days=365)
            statement = statement.where(
                self.EditorHistory.created_at < cutoff
            )
        elif mode != "all":
            raise ValueError("Некорректный режим очистки истории.")

        result = self.db.session.execute(statement)
        deleted = int(result.rowcount or 0)
        self.db.session.commit()
        return deleted


def register_history(context: EditorContext) -> dict[str, Any]:
    """Зарегистрировать историю с прежними URL и endpoint."""
    service = HistoryService(context)

    def error(message: str, status: int = 400):
        return jsonify({"ok": False, "message": message}), status

    def require_access():
        if context.permissions.is_allowed():
            return None
        return error("Нет доступа к редактору.", 403)

    def tpv_editor_history_status():
        denied = require_access()
        if denied is not None:
            return denied

        return jsonify({
            "ok": True,
            "table_exists": service.table_exists(),
        })

    def tpv_editor_history_create_table_route():
        denied = require_access()
        if denied is not None:
            return denied

        service.create_table()
        return jsonify({
            "ok": True,
            "message": "Таблица истории создана.",
        })

    def tpv_editor_history_list():
        denied = require_access()
        if denied is not None:
            return denied

        return jsonify({
            "ok": True,
            **service.list_data(),
        })

    def tpv_editor_history_revert(history_id: int):
        denied = require_access()
        if denied is not None:
            return denied

        try:
            service.revert(history_id)
        except LookupError as exc:
            return error(str(exc), 404)
        except RuntimeError as exc:
            return error(str(exc), 409)
        except ValueError as exc:
            service.db.session.rollback()
            return error(str(exc), 409)
        except Exception:
            service.db.session.rollback()
            raise

        return jsonify({
            "ok": True,
            "message": "Изменение успешно отменено.",
        })

    def tpv_editor_history_clear():
        denied = require_access()
        if denied is not None:
            return denied

        data = request.get_json(silent=True) or {}
        mode = str(data.get("mode") or "older30")

        try:
            deleted = service.clear(mode)
        except RuntimeError as exc:
            return error(str(exc), 409)
        except ValueError as exc:
            return error(str(exc))

        return jsonify({
            "ok": True,
            "message": f"Удалено записей истории: {deleted}.",
            "deleted": deleted,
        })

    rules = (
        (
            "/tpv_editor/api/history/status",
            "tpv_editor_history_status",
            tpv_editor_history_status,
            ["GET"],
        ),
        (
            "/tpv_editor/api/history/create-table",
            "tpv_editor_history_create_table_route",
            tpv_editor_history_create_table_route,
            ["POST"],
        ),
        (
            "/tpv_editor/api/history",
            "tpv_editor_history_list",
            tpv_editor_history_list,
            ["GET"],
        ),
        (
            "/tpv_editor/api/history/<int:history_id>/revert",
            "tpv_editor_history_revert",
            tpv_editor_history_revert,
            ["POST"],
        ),
        (
            "/tpv_editor/api/history/clear",
            "tpv_editor_history_clear",
            tpv_editor_history_clear,
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
        "tpv_editor_history_table_exists": service.table_exists,
        "tpv_editor_history_create_table": service.create_table,
        "tpv_editor_history_json": service.to_json,
        "tpv_editor_history_parse": service.parse_json,
        "tpv_editor_user_snapshot": service.user_snapshot,
        "tpv_editor_question_snapshot": service.question_snapshot,
        "tpv_editor_history_add": service.add,
        "tpv_editor_history_to_dict": service.serialize,
        "tpv_editor_restore_user": service.restore_user,
        "tpv_editor_restore_question": service.restore_question,
        "tpv_editor_revert_history_row": service.revert_row,
        "tpv_editor_history_status": tpv_editor_history_status,
        "tpv_editor_history_create_table_route": (
            tpv_editor_history_create_table_route
        ),
        "tpv_editor_history_list": tpv_editor_history_list,
        "tpv_editor_history_revert": tpv_editor_history_revert,
        "tpv_editor_history_clear": tpv_editor_history_clear,
    }


__all__ = ["HistoryService", "register_history"]
