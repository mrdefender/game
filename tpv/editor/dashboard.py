"""Dashboard TPV Editor.

Этап 13.3.1. Здесь находится обычный читаемый Python-код вместо
старого монолитного блока. URL и JSON-контракт
Dashboard сохранены.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
from time import perf_counter
from typing import Any

from flask import jsonify
from sqlalchemy import text

from .registry import EditorContext


GENERAL_QUESTIONS_PER_GAME = 25
THEME_QUESTIONS_PER_GAME = 1


class DashboardService:
    """Собирает данные главного экрана TPV Editor."""

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db

        self.UsersTpv = self._dependency("UsersTpv")
        self.QuestionsTpv = self._dependency("Questions_tpv")
        self.QuestionApplication = self._dependency(
            "TpvQuestionApplication"
        )
        self.EditorHistory = self._dependency("TpvEditorHistory")
        self.GameBuild = self._dependency("TpvGameBuild")

        self.theme_rows = self._dependency("tpv_editor_theme_rows")
        self.is_general_theme = self._dependency(
            "tpv_editor_is_general_theme"
        )
        self.applications_table_exists = self._dependency(
            "tpv_editor_applications_table_exists"
        )
        self.history_table_exists = self._dependency(
            "tpv_editor_history_table_exists"
        )
        self.builder_table_exists = self._dependency(
            "tpv_editor_builder_table_exists"
        )
        self.builder_question_ids = self._dependency(
            "tpv_editor_builder_question_ids"
        )
        self.normalize_text = self._dependency(
            "tpv_editor_normalize_text"
        )

    def _dependency(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                f"Dashboard TPV Editor: отсутствует зависимость {name}"
            )
        return value

    def database_info(self) -> dict[str, Any]:
        """Вернуть сведения о SQLite и последней реальной копии."""
        filename = ""
        size_bytes = 0
        integrity = "unknown"
        backup_label = None

        try:
            with self.db.engine.connect() as connection:
                rows = connection.execute(
                    text("PRAGMA database_list")
                ).fetchall()
                main_row = next(
                    (row for row in rows if row[1] == "main"),
                    None,
                )
                filename = str(main_row[2] if main_row else "")
                integrity = str(
                    connection.execute(
                        text("PRAGMA quick_check")
                    ).scalar()
                    or "unknown"
                )

            database_path = Path(filename) if filename else None
            if database_path and database_path.exists():
                size_bytes = database_path.stat().st_size
                backup_label = self._last_backup_label(database_path)
        except Exception:
            # Dashboard должен открываться даже при недоступной диагностике.
            pass

        return {
            "path": filename,
            "filename": Path(filename).name if filename else "—",
            "size_bytes": size_bytes,
            "size_label": self._format_size(size_bytes),
            "integrity": integrity,
            "integrity_label": (
                "OK" if integrity.casefold() == "ok" else integrity
            ),
            "last_backup_label": backup_label,
        }

    @staticmethod
    def _last_backup_label(database_path: Path) -> str | None:
        backup_dir = database_path.parent / "backups"
        if not backup_dir.exists():
            return None

        supported_suffixes = {".db", ".sqlite", ".sqlite3", ".zip"}
        backups = sorted(
            (
                item
                for item in backup_dir.iterdir()
                if (
                    item.is_file()
                    and item.suffix.casefold() in supported_suffixes
                    and (
                        item.name.startswith(
                            f"{database_path.stem}_backup_"
                        )
                        or item.name.startswith("tpv_project_backup_")
                        or "_emergency_" in item.name
                    )
                )
            ),
            key=lambda item: item.stat().st_mtime,
            reverse=True,
        )

        if not backups:
            return None

        modified = datetime.fromtimestamp(backups[0].stat().st_mtime)
        return modified.strftime("%d.%m.%Y %H:%M")

    @staticmethod
    def _format_size(size_bytes: int) -> str:
        if size_bytes >= 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.1f} МБ"
        if size_bytes >= 1024:
            return f"{size_bytes / 1024:.1f} КБ"
        return f"{size_bytes} Б"

    def build_payload(self) -> dict[str, Any]:
        started = perf_counter()
        now = datetime.utcnow()

        users = self.db.session.scalars(
            self.db.select(self.UsersTpv)
        ).all()
        questions = self.db.session.scalars(
            self.db.select(self.QuestionsTpv)
        ).all()
        theme_rows = self.theme_rows()

        user_stats = self._user_stats(users)
        question_stats = self._question_stats(questions)
        theme_stats = self._theme_stats(theme_rows)
        resource = self._resource_stats(
            question_stats["general_available"],
            theme_rows,
        )
        application_stats = self._application_stats()
        history = self._history_stats(now)
        builder = self._builder_stats()
        top_authors = self._top_authors(questions)
        database = self.database_info()

        readiness = self._readiness(
            users=users,
            user_stats=user_stats,
            theme_rows=theme_rows,
            theme_stats=theme_stats,
            question_stats=question_stats,
            application_stats=application_stats,
            builder=builder,
        )
        health = self._health(
            database=database,
            history_stats=history["stats"],
            application_stats=application_stats,
        )
        alerts = self._alerts(
            user_stats=user_stats,
            theme_stats=theme_stats,
            limiting_theme=resource["limiting_theme_row"],
            application_stats=application_stats,
            general_available=question_stats["general_available"],
            database=database,
        )

        return {
            "ok": True,
            "generated_at": now.isoformat(timespec="seconds"),
            "generated_at_label": now.strftime("%d.%m.%Y %H:%M:%S"),
            "users": user_stats,
            "questions": question_stats,
            "themes": theme_stats,
            "applications": application_stats,
            "history": history["stats"],
            "builder": builder,
            "alerts": alerts,
            "events": history["events"],
            "growth": history["growth"],
            "top_authors": top_authors,
            "reserve": resource["reserve"],
            "resource": resource["resource"],
            "readiness": readiness,
            "health": health,
            "database": database,
            "performance": {
                "response_ms": round(
                    (perf_counter() - started) * 1000,
                    1,
                ),
            },
        }

    def _user_stats(self, users: list[Any]) -> dict[str, int]:
        approved = sum(
            str(user.approve or "").casefold() == "true"
            for user in users
        )
        without_theme = sum(
            self.is_general_theme(user.flip)
            for user in users
        )
        return {
            "total": len(users),
            "approved": approved,
            "without_theme": without_theme,
            "not_approved": len(users) - approved,
        }

    def _question_stats(self, questions: list[Any]) -> dict[str, int]:
        general_rows = [
            question
            for question in questions
            if self.is_general_theme(question.flip)
        ]
        available = sum(
            str(question.show or "").casefold() != "true"
            for question in general_rows
        )
        return {
            "total": len(questions),
            "general_total": len(general_rows),
            "general_available": available,
            "general_used": len(general_rows) - available,
        }

    @staticmethod
    def _theme_stats(theme_rows: list[dict[str, Any]]) -> dict[str, int]:
        ready = sum(bool(row.get("ready")) for row in theme_rows)
        return {
            "total": len(theme_rows),
            "ready": ready,
            "shortage": len(theme_rows) - ready,
        }

    def _resource_stats(
        self,
        general_available: int,
        theme_rows: list[dict[str, Any]],
    ) -> dict[str, Any]:
        available_themes = []
        for row in theme_rows:
            available = max(
                0,
                int(row.get("question_count") or 0)
                - int(row.get("shown_count") or 0),
            )
            available_themes.append({
                "name": row.get("name") or "Без названия",
                "available": available,
                "games": available // max(1, THEME_QUESTIONS_PER_GAME),
                "ready": bool(row.get("ready")),
            })

        theme_games = [row["games"] for row in available_themes]
        theme_min = min(theme_games) if theme_games else 0
        theme_average = (
            round(sum(theme_games) / len(theme_games))
            if theme_games else 0
        )
        limiting_theme_row = min(
            available_themes,
            key=lambda row: row["games"],
            default=None,
        )

        general_games = (
            general_available // max(1, GENERAL_QUESTIONS_PER_GAME)
        )
        resource_games = general_games
        limiting_label = "Общие вопросы"
        limiting_theme = "—"

        if (
            limiting_theme_row is not None
            and theme_min < resource_games
        ):
            resource_games = theme_min
            limiting_label = "Тема замены"
            limiting_theme = limiting_theme_row["name"]

        return {
            "limiting_theme_row": limiting_theme_row,
            "reserve": {
                "general_available": general_available,
                "general_per_game": GENERAL_QUESTIONS_PER_GAME,
                "general_games": general_games,
                "theme_average_games": theme_average,
                "theme_min_games": theme_min,
            },
            "resource": {
                "games": max(0, resource_games),
                "limiting_label": limiting_label,
                "limiting_theme": limiting_theme,
            },
        }

    def _application_stats(self) -> dict[str, int]:
        stats = {
            "total": 0,
            "pending": 0,
            "approved": 0,
            "rejected": 0,
        }
        if not self.applications_table_exists():
            return stats

        rows = self.db.session.scalars(
            self.db.select(self.QuestionApplication)
        ).all()
        return {
            "total": len(rows),
            "pending": sum(row.status == "pending" for row in rows),
            "approved": sum(row.status == "approved" for row in rows),
            "rejected": sum(row.status == "rejected" for row in rows),
        }

    def _history_stats(self, now: datetime) -> dict[str, Any]:
        result = {
            "stats": {"total": 0, "today": 0},
            "events": [],
            "growth": {"today": 0, "week": 0, "month": 0},
        }
        if not self.history_table_exists():
            return result

        rows = self.db.session.scalars(
            self.db.select(self.EditorHistory)
            .order_by(self.EditorHistory.id.desc())
        ).all()
        today = now.date()

        action_labels = {
            "create": "Создание",
            "update": "Изменение",
            "delete": "Удаление",
            "revert": "Откат",
            "import": "Импорт",
        }
        question_creates = [
            row
            for row in rows
            if row.entity_type == "question"
            and row.action == "create"
        ]

        return {
            "stats": {
                "total": len(rows),
                "today": sum(
                    row.created_at.date() == today
                    for row in rows
                ),
            },
            "events": [{
                "title": row.title,
                "action": row.action,
                "action_label": action_labels.get(
                    row.action,
                    row.action,
                ),
                "created_at_label": row.created_at.strftime(
                    "%d.%m.%Y %H:%M"
                ),
            } for row in rows[:8]],
            "growth": {
                "today": sum(
                    row.created_at.date() == today
                    for row in question_creates
                ),
                "week": sum(
                    row.created_at >= now - timedelta(days=7)
                    for row in question_creates
                ),
                "month": sum(
                    row.created_at >= now - timedelta(days=30)
                    for row in question_creates
                ),
            },
        }

    def _builder_stats(self) -> dict[str, Any]:
        result = {
            "active_name": None,
            "question_count": 0,
            "updated_at_label": None,
        }
        if not self.builder_table_exists():
            return result

        active = self.db.session.scalar(
            self.db.select(self.GameBuild)
            .where(self.GameBuild.is_active.is_(True))
            .order_by(self.GameBuild.updated_at.desc())
            .limit(1)
        )
        if active is None:
            return result

        return {
            "active_name": active.name,
            "question_count": len(
                self.builder_question_ids(active)
            ),
            "updated_at_label": active.updated_at.strftime(
                "%d.%m.%Y %H:%M"
            ),
        }

    def _top_authors(self, questions: list[Any]) -> list[dict[str, Any]]:
        counts: dict[str, int] = {}
        for question in questions:
            author = (
                self.normalize_text(question.author)
                or "Без автора"
            )
            counts[author] = counts.get(author, 0) + 1

        return [
            {"author": author, "count": count}
            for author, count in sorted(
                counts.items(),
                key=lambda item: (-item[1], item[0].casefold()),
            )[:5]
        ]

    @staticmethod
    def _readiness(
        *,
        users: list[Any],
        user_stats: dict[str, int],
        theme_rows: list[dict[str, Any]],
        theme_stats: dict[str, int],
        question_stats: dict[str, int],
        application_stats: dict[str, int],
        builder: dict[str, Any],
    ) -> dict[str, Any]:
        player_score = (
            round(user_stats["approved"] * 100 / len(users))
            if users else 0
        )
        theme_score = (
            round(theme_stats["ready"] * 100 / len(theme_rows))
            if theme_rows else 100
        )
        general_target = GENERAL_QUESTIONS_PER_GAME * 3
        general_score = (
            min(
                100,
                round(
                    question_stats["general_available"]
                    * 100
                    / general_target
                ),
            )
            if general_target else 100
        )
        builder_score = 100 if (
            builder["active_name"] is None
            or builder["question_count"] > 0
        ) else 0
        applications_score = max(
            0,
            100 - application_stats["pending"] * 10,
        )
        quality_score = max(
            0,
            100
            - user_stats["without_theme"] * 8
            - theme_stats["shortage"] * 10
            - (
                35
                if not question_stats["general_available"]
                else 0
            ),
        )

        components = [
            {
                "key": "players",
                "label": "Пользователи",
                "score": player_score,
                "weight": 20,
            },
            {
                "key": "themes",
                "label": "Темы",
                "score": theme_score,
                "weight": 20,
            },
            {
                "key": "general",
                "label": "Общие вопросы",
                "score": general_score,
                "weight": 25,
            },
            {
                "key": "builder",
                "label": "Источник вопросов",
                "score": builder_score,
                "weight": 10,
            },
            {
                "key": "applications",
                "label": "Заявки",
                "score": applications_score,
                "weight": 10,
            },
            {
                "key": "quality",
                "label": "Проверка базы",
                "score": quality_score,
                "weight": 15,
            },
        ]
        score = round(
            sum(
                item["score"] * item["weight"] / 100
                for item in components
            )
        )
        label = (
            "Полностью готово к игре"
            if score >= 95
            else "Почти готово к игре"
            if score >= 85
            else "Требуется внимание"
            if score >= 70
            else "Не готово к игре"
        )
        return {
            "score": score,
            "label": label,
            "components": components,
        }

    @staticmethod
    def _health(
        *,
        database: dict[str, Any],
        history_stats: dict[str, int],
        application_stats: dict[str, int],
    ) -> dict[str, Any]:
        penalty = 0
        if database["integrity"].casefold() != "ok":
            penalty += 50
        if history_stats["total"] > 10000:
            penalty += 15
        elif history_stats["total"] > 5000:
            penalty += 8
        if application_stats["total"] > 2000:
            penalty += 10
        if not database["last_backup_label"]:
            penalty += 10

        score = max(0, 100 - penalty)
        label = (
            "Система исправна"
            if score >= 95
            else "Есть рекомендации по обслуживанию"
            if score >= 80
            else "Требуется обслуживание"
        )
        return {"score": score, "label": label}

    @staticmethod
    def _alerts(
        *,
        user_stats: dict[str, int],
        theme_stats: dict[str, int],
        limiting_theme: dict[str, Any] | None,
        application_stats: dict[str, int],
        general_available: int,
        database: dict[str, Any],
    ) -> list[dict[str, str]]:
        alerts: list[dict[str, str]] = []

        if user_stats["without_theme"]:
            alerts.append({
                "level": "warning",
                "title": (
                    "Пользователей без темы: "
                    f"{user_stats['without_theme']}"
                ),
                "details": (
                    "Назначьте тему замены или оставьте "
                    "пользователя без допуска."
                ),
                "tab": "users",
            })
        if user_stats["not_approved"]:
            alerts.append({
                "level": "warning",
                "title": (
                    "Пользователей без допуска: "
                    f"{user_stats['not_approved']}"
                ),
                "details": "Проверьте темы и количество вопросов.",
                "tab": "users",
            })
        if theme_stats["shortage"]:
            alerts.append({
                "level": "warning",
                "title": (
                    "Тем с недостатком вопросов: "
                    f"{theme_stats['shortage']}"
                ),
                "details": (
                    "Пополните темы до установленного минимума."
                ),
                "tab": "themes",
            })
        if limiting_theme is not None:
            alerts.append({
                "level": "info",
                "title": (
                    "Минимальный запас темы: "
                    f"{limiting_theme['games']} игр"
                ),
                "details": (
                    "Ограничивающая тема: "
                    f"{limiting_theme['name']}."
                ),
                "tab": "themes",
            })
        if application_stats["pending"]:
            alerts.append({
                "level": "warning",
                "title": (
                    "Заявок ожидает модерации: "
                    f"{application_stats['pending']}"
                ),
                "details": (
                    "Проверьте новые вопросы перед подготовкой игры."
                ),
                "tab": "applications",
            })
        if not general_available:
            alerts.append({
                "level": "critical",
                "title": "Нет доступных общих вопросов",
                "details": (
                    "Сбросьте использованные вопросы "
                    "или добавьте новые."
                ),
                "tab": "questions",
            })
        if not database["last_backup_label"]:
            alerts.append({
                "level": "info",
                "title": "Резервная копия ещё не создавалась",
                "details": (
                    "Создайте backup перед массовыми изменениями."
                ),
                "tab": "backups",
            })

        return alerts


def register_dashboard(context: EditorContext) -> dict[str, Any]:
    """Зарегистрировать Dashboard без изменения URL и endpoint."""
    service = DashboardService(context)

    def tpv_editor_dashboard():
        denied = context.permissions.require()
        if denied is not None:
            return denied
        return jsonify(service.build_payload())

    context.app.add_url_rule(
        "/tpv_editor/api/dashboard",
        endpoint="tpv_editor_dashboard",
        view_func=tpv_editor_dashboard,
        methods=["GET"],
    )

    return {
        "service": service,
        "tpv_editor_dashboard": tpv_editor_dashboard,
        "tpv_editor_dashboard_database_info": service.database_info,
    }


__all__ = [
    "DashboardService",
    "register_dashboard",
]
