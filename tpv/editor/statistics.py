"""Статистика TPV Editor."""

from __future__ import annotations
from typing import Any
from flask import jsonify
from .registry import EditorContext
from .runtime_threshold import required_flip_questions


class StatisticsService:
    """Расчёт статистики игроков, вопросов, тем и авторов."""

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db
        self.UsersTpv = self._dep("UsersTpv")
        self.QuestionsTpv = self._dep("Questions_tpv")
        self.theme_rows = self._dep("tpv_editor_theme_rows")
        self.is_general_theme = self._dep("tpv_editor_is_general_theme")
        self.normalize_text = self._dep("tpv_editor_normalize_text")


    @property
    def required_questions(self) -> int:
        # 15.1.2.1.9.12.4: never cache this value at service startup.
        return required_flip_questions(self.context)

    def _dep(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(f"Статистика TPV Editor: отсутствует зависимость {name}")
        return value

    def build(self) -> dict[str, Any]:
        users = self.db.session.scalars(
            self.db.select(self.UsersTpv).order_by(self.UsersTpv.username)
        ).all()
        questions = self.db.session.scalars(
            self.db.select(self.QuestionsTpv).order_by(self.QuestionsTpv.id)
        ).all()
        theme_rows = self.theme_rows()

        total_questions = len(questions)
        general_rows = [q for q in questions if self.is_general_theme(q.flip)]
        general_questions = len(general_rows)
        themed_questions = total_questions - general_questions
        shown_questions = sum(str(q.show or "").casefold() == "true" for q in questions)
        unused_questions = total_questions - shown_questions
        usage_percent = round(shown_questions * 100 / total_questions, 1) if total_questions else 0

        general_used = sum(str(q.show or "").casefold() == "true" for q in general_rows)
        general_unused = general_questions - general_used
        general_usage_percent = round(general_used * 100 / general_questions, 1) if general_questions else 0

        approved_users = sum(str(u.approve or "").casefold() == "true" for u in users)
        users_without_theme = sum(self.is_general_theme(u.flip) for u in users)
        users_not_approved = len(users) - approved_users

        ready_themes = sum(row["ready"] for row in theme_rows)
        shortage_themes = sum(not row["ready"] for row in theme_rows)

        author_groups: dict[str, dict[str, Any]] = {}
        for question in questions:
            author_name = self.normalize_text(question.author)
            key = author_name.casefold()
            group = author_groups.setdefault(key, {
                "name": author_name or "Без автора",
                "total": 0, "general": 0, "themed": 0, "shown": 0,
            })
            group["total"] += 1
            if self.is_general_theme(question.flip):
                group["general"] += 1
            else:
                group["themed"] += 1
            if str(question.show or "").casefold() == "true":
                group["shown"] += 1

        authors = sorted(
            author_groups.values(),
            key=lambda item: (-item["total"], item["name"].casefold()),
        )

        themes = sorted([
            {
                "name": row["name"],
                "question_count": row["question_count"],
                "shown_count": row["shown_count"],
                "user_count": row["user_count"],
                "approved_count": row["approved_count"],
                "ready": row["ready"],
                "missing": max(0, self.required_questions - row["question_count"]),
            }
            for row in theme_rows
        ], key=lambda item: (-item["question_count"], item["name"].casefold()))

        user_rows = []
        for user in users:
            theme = "" if self.is_general_theme(user.flip) else self.normalize_text(user.flip)
            user_rows.append({
                "id": user.id,
                "username": user.username,
                "money": int(user.money or 0),
                "theme": theme,
                "question_count": int(user.flip_col or 0),
                "approved": str(user.approve or "").casefold() == "true",
            })

        return {
            "summary": {
                "users": len(users),
                "questions": total_questions,
                "themes": len(theme_rows),
                "approved_users": approved_users,
                "total_money": sum(int(u.money or 0) for u in users),
            },
            "questions": {
                "total": total_questions, "general": general_questions,
                "themed": themed_questions, "shown": shown_questions,
                "unused": unused_questions, "usage_percent": usage_percent,
            },
            "general_questions": {
                "total": general_questions, "used": general_used,
                "unused": general_unused, "available": general_unused,
                "usage_percent": general_usage_percent,
            },
            "readiness": {
                "ready_themes": ready_themes,
                "shortage_themes": shortage_themes,
                "users_without_theme": users_without_theme,
                "users_not_approved": users_not_approved,
            },
            "themes": themes[:15],
            "authors": authors[:20],
            "users": user_rows,
        }


def register_statistics(context: EditorContext) -> dict[str, Any]:
    service = StatisticsService(context)

    def tpv_editor_statistics():
        if not context.permissions.is_allowed():
            return jsonify({"ok": False, "message": "Нет доступа к редактору."}), 403
        return jsonify({"ok": True, "statistics": service.build()})

    context.app.add_url_rule(
        "/tpv_editor/api/statistics",
        endpoint="tpv_editor_statistics",
        view_func=tpv_editor_statistics,
        methods=["GET"],
    )
    return {
        "service": service,
        "tpv_editor_statistics": tpv_editor_statistics,
        "tpv_editor_build_statistics": service.build,
    }


__all__ = ["StatisticsService", "register_statistics"]
