from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import json
from typing import Any, Callable

from flask import Blueprint, jsonify, request
from sqlalchemy import inspect


@dataclass(frozen=True)
class TpvArchiveModels:
    GameSession: type
    GamePlayer: type
    GameQuestion: type
    GameTheme: type
    GameEvent: type
    GameSnapshot: type


def register_tpv_archive(
    app,
    db,
    *,
    allowed: Callable[[], bool],
    error: Callable[[str, int], Any],
) -> TpvArchiveModels:
    """Регистрирует модели и API архива игр TPV.

    Модуль не импортирует game.py и не затрагивает маршруты,
    модели или Socket.IO игры «Свободный слот».
    """

    class GameSession(db.Model):
        __tablename__ = "tpv_game_sessions"
        __table_args__ = (
            db.Index("ix_tpv_game_sessions_started_at", "started_at"),
            db.Index("ix_tpv_game_sessions_winner", "winner"),
            db.Index("ix_tpv_game_sessions_season", "season"),
        )

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        title = db.Column(db.String(160), nullable=False)
        season = db.Column(db.String(80), nullable=False, default="")
        builder_id = db.Column(db.Integer, nullable=True)
        status = db.Column(db.String(20), nullable=False, default="completed")
        started_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
        ended_at = db.Column(db.DateTime, nullable=True)
        duration_seconds = db.Column(db.Integer, nullable=False, default=0)
        winner = db.Column(db.String(100), nullable=True)
        winner_money = db.Column(db.Integer, nullable=False, default=0)
        players_count = db.Column(db.Integer, nullable=False, default=0)
        general_questions = db.Column(db.Integer, nullable=False, default=0)
        theme_questions = db.Column(db.Integer, nullable=False, default=0)
        correct_answers = db.Column(db.Integer, nullable=False, default=0)
        wrong_answers = db.Column(db.Integer, nullable=False, default=0)
        ended_normally = db.Column(db.Boolean, nullable=False, default=True)
        tpv_version = db.Column(db.String(40), nullable=True)
        editor_version = db.Column(db.String(40), nullable=True)
        notes = db.Column(db.Text, nullable=True)
        created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


    class GamePlayer(db.Model):
        __tablename__ = "tpv_game_players"
        __table_args__ = (
            db.Index("ix_tpv_game_players_session", "session_id"),
            db.Index("ix_tpv_game_players_username", "username"),
        )

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        session_id = db.Column(
            db.Integer,
            db.ForeignKey("tpv_game_sessions.id", ondelete="CASCADE"),
            nullable=False,
        )
        username = db.Column(db.String(100), nullable=False)
        theme = db.Column(db.String(160), nullable=True)
        money = db.Column(db.Integer, nullable=False, default=0)
        correct_answers = db.Column(db.Integer, nullable=False, default=0)
        wrong_answers = db.Column(db.Integer, nullable=False, default=0)
        place = db.Column(db.Integer, nullable=True)


    class GameQuestion(db.Model):
        __tablename__ = "tpv_game_questions"
        __table_args__ = (
            db.Index("ix_tpv_game_questions_session", "session_id"),
            db.Index("ix_tpv_game_questions_question", "question_id"),
        )

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        session_id = db.Column(
            db.Integer,
            db.ForeignKey("tpv_game_sessions.id", ondelete="CASCADE"),
            nullable=False,
        )
        question_id = db.Column(db.Integer, nullable=True)
        question_type = db.Column(db.String(16), nullable=False, default="general")
        theme = db.Column(db.String(160), nullable=True)
        author = db.Column(db.String(100), nullable=True)
        correct = db.Column(db.Boolean, nullable=True)


    class GameTheme(db.Model):
        __tablename__ = "tpv_game_themes"
        __table_args__ = (
            db.Index("ix_tpv_game_themes_session", "session_id"),
            db.Index("ix_tpv_game_themes_theme", "theme"),
        )

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        session_id = db.Column(
            db.Integer,
            db.ForeignKey("tpv_game_sessions.id", ondelete="CASCADE"),
            nullable=False,
        )
        theme = db.Column(db.String(160), nullable=False)
        used_count = db.Column(db.Integer, nullable=False, default=0)
        correct_count = db.Column(db.Integer, nullable=False, default=0)
        wrong_count = db.Column(db.Integer, nullable=False, default=0)


    class GameEvent(db.Model):
        __tablename__ = "tpv_game_events"
        __table_args__ = (
            db.Index("ix_tpv_game_events_session_time", "session_id", "event_time"),
        )

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        session_id = db.Column(
            db.Integer,
            db.ForeignKey("tpv_game_sessions.id", ondelete="CASCADE"),
            nullable=False,
        )
        event_time = db.Column(db.Integer, nullable=False, default=0)
        event_type = db.Column(db.String(40), nullable=False)
        payload = db.Column(db.Text, nullable=False, default="{}")


    class GameSnapshot(db.Model):
        __tablename__ = "tpv_game_snapshots"

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        session_id = db.Column(
            db.Integer,
            db.ForeignKey("tpv_game_sessions.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        )
        questions_total = db.Column(db.Integer, nullable=False, default=0)
        themes_total = db.Column(db.Integer, nullable=False, default=0)
        database_size = db.Column(db.Integer, nullable=False, default=0)
        resource_games = db.Column(db.Integer, nullable=False, default=0)
        builder_id = db.Column(db.Integer, nullable=True)


    # Связи назначаются после объявления всех моделей.
    # Используются прямые ссылки на классы, без строкового разрешения имён.
    GameSession.players = db.relationship(
        GamePlayer,
        cascade="all, delete-orphan",
        passive_deletes=True,
        back_populates="session",
        order_by=GamePlayer.place,
    )
    GameSession.questions = db.relationship(
        GameQuestion,
        cascade="all, delete-orphan",
        passive_deletes=True,
        back_populates="session",
        order_by=GameQuestion.id,
    )
    GameSession.themes = db.relationship(
        GameTheme,
        cascade="all, delete-orphan",
        passive_deletes=True,
        back_populates="session",
        order_by=GameTheme.id,
    )
    GameSession.events = db.relationship(
        GameEvent,
        cascade="all, delete-orphan",
        passive_deletes=True,
        back_populates="session",
        order_by=GameEvent.event_time,
    )
    GameSession.snapshot = db.relationship(
        GameSnapshot,
        cascade="all, delete-orphan",
        passive_deletes=True,
        back_populates="session",
        uselist=False,
    )

    GamePlayer.session = db.relationship(GameSession, back_populates="players")
    GameQuestion.session = db.relationship(GameSession, back_populates="questions")
    GameTheme.session = db.relationship(GameSession, back_populates="themes")
    GameEvent.session = db.relationship(GameSession, back_populates="events")
    GameSnapshot.session = db.relationship(GameSession, back_populates="snapshot")

    models = TpvArchiveModels(
        GameSession=GameSession,
        GamePlayer=GamePlayer,
        GameQuestion=GameQuestion,
        GameTheme=GameTheme,
        GameEvent=GameEvent,
        GameSnapshot=GameSnapshot,
    )

    table_names = {
        "tpv_game_sessions",
        "tpv_game_players",
        "tpv_game_questions",
        "tpv_game_themes",
        "tpv_game_events",
        "tpv_game_snapshots",
    }

    def tables_exist() -> bool:
        try:
            existing = set(inspect(db.engine).get_table_names())
            return table_names.issubset(existing)
        except Exception:
            return False

    def create_tables() -> None:
        # Сначала родительская таблица, затем дочерние.
        for table in (
            GameSession.__table__,
            GamePlayer.__table__,
            GameQuestion.__table__,
            GameTheme.__table__,
            GameEvent.__table__,
            GameSnapshot.__table__,
        ):
            table.create(bind=db.engine, checkfirst=True)

    def parse_datetime(value: Any, *, required: bool = False) -> datetime | None:
        if isinstance(value, datetime):
            return value
        text = str(value or "").strip()
        if not text:
            return datetime.utcnow() if required else None
        try:
            return datetime.fromisoformat(text.replace("Z", "+00:00")).replace(
                tzinfo=None
            )
        except ValueError as exc:
            raise ValueError("Некорректная дата игры.") from exc

    def as_non_negative_int(value: Any) -> int:
        try:
            return max(0, int(value or 0))
        except (TypeError, ValueError):
            return 0

    def as_optional_int(value: Any) -> int | None:
        if value in (None, ""):
            return None
        try:
            return int(value)
        except (TypeError, ValueError) as exc:
            raise ValueError("Некорректное числовое значение.") from exc

    def duration_seconds(started: datetime, ended: datetime | None, supplied: Any) -> int:
        if supplied not in (None, ""):
            return as_non_negative_int(supplied)
        if ended is None:
            return 0
        return max(0, int((ended - started).total_seconds()))

    def parse_event_payload(raw: Any) -> str:
        if isinstance(raw, str):
            text = raw.strip()
            if not text:
                return "{}"
            try:
                parsed = json.loads(text)
            except json.JSONDecodeError:
                parsed = {"description": text}
        elif isinstance(raw, dict):
            parsed = raw
        else:
            parsed = {}
        return json.dumps(parsed, ensure_ascii=False)

    def event_payload(row: GameEvent) -> dict[str, Any]:
        try:
            value = json.loads(row.payload or "{}")
            return value if isinstance(value, dict) else {}
        except json.JSONDecodeError:
            return {}

    def session_to_dict(row: GameSession, *, include_children: bool = True) -> dict[str, Any]:
        total_answers = row.correct_answers + row.wrong_answers
        result = {
            "id": row.id,
            "title": row.title,
            "season": row.season,
            "builder_id": row.builder_id,
            "status": row.status,
            "started_at": row.started_at.isoformat(timespec="minutes"),
            "started_at_label": row.started_at.strftime("%d.%m.%Y %H:%M"),
            "ended_at": (
                row.ended_at.isoformat(timespec="minutes")
                if row.ended_at else None
            ),
            "duration_seconds": row.duration_seconds,
            "duration_label": format_duration(row.duration_seconds),
            "winner": row.winner or "",
            "winner_money": row.winner_money,
            "prize": row.winner_money,
            "players_count": row.players_count,
            "player_count": row.players_count,
            "general_questions": row.general_questions,
            "general_count": row.general_questions,
            "theme_questions": row.theme_questions,
            "themed_count": row.theme_questions,
            "total_questions": row.general_questions + row.theme_questions,
            "correct_answers": row.correct_answers,
            "correct_count": row.correct_answers,
            "wrong_answers": row.wrong_answers,
            "wrong_count": row.wrong_answers,
            "correct_percent": (
                round(row.correct_answers * 100 / total_answers)
                if total_answers else 0
            ),
            "ended_normally": bool(row.ended_normally),
            "tpv_version": row.tpv_version or "",
            "editor_version": row.editor_version or "",
            "notes": row.notes or "",
            "created_at": row.created_at.isoformat(timespec="seconds"),
        }

        if not include_children:
            result["players_text"] = ""
            return result

        result.update({
            "players": [
                {
                    "id": child.id,
                    "name": child.username,
                    "username": child.username,
                    "theme": child.theme or "",
                    "result": child.money,
                    "money": child.money,
                    "correct": child.correct_answers,
                    "correct_answers": child.correct_answers,
                    "wrong": child.wrong_answers,
                    "wrong_answers": child.wrong_answers,
                    "place": child.place,
                }
                for child in row.players
            ],
            "players_text": " ".join(child.username for child in row.players),
            "questions": [
                {
                    "id": child.id,
                    "question_id": child.question_id,
                    "question_type": child.question_type,
                    "theme": child.theme or "",
                    "author": child.author or "",
                    "correct": child.correct,
                }
                for child in row.questions
            ],
            "question_ids": [
                child.question_id
                for child in row.questions
                if child.question_id is not None
            ],
            "themes": [
                {
                    "id": child.id,
                    "name": child.theme,
                    "theme": child.theme,
                    "used": child.used_count,
                    "used_count": child.used_count,
                    "correct": child.correct_count,
                    "correct_count": child.correct_count,
                    "wrong": child.wrong_count,
                    "wrong_count": child.wrong_count,
                }
                for child in row.themes
            ],
            "events": [
                {
                    "id": child.id,
                    "event_time": child.event_time,
                    "time": format_event_time(child.event_time),
                    "type": child.event_type,
                    "event_type": child.event_type,
                    "payload": event_payload(child),
                    "description": event_payload(child).get("description", ""),
                }
                for child in row.events
            ],
            "snapshot": (
                {
                    "questions_total": row.snapshot.questions_total,
                    "themes_total": row.snapshot.themes_total,
                    "database_size": row.snapshot.database_size,
                    "resource_games": row.snapshot.resource_games,
                    "builder_id": row.snapshot.builder_id,
                }
                if row.snapshot else None
            ),
        })
        return result

    def format_duration(seconds: int) -> str:
        seconds = max(0, int(seconds or 0))
        hours, remainder = divmod(seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        return f"{hours}:{minutes:02d}" if hours else f"{minutes} мин"

    def format_event_time(seconds: int) -> str:
        seconds = max(0, int(seconds or 0))
        hours, remainder = divmod(seconds, 3600)
        minutes, secs = divmod(remainder, 60)
        if hours:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        return f"{minutes:02d}:{secs:02d}"

    def replace_children(row: GameSession, data: dict[str, Any]) -> None:
        row.players.clear()
        for index, item in enumerate(data.get("players") or [], start=1):
            if not isinstance(item, dict):
                continue
            username = str(item.get("username") or item.get("name") or "").strip()
            if not username:
                continue
            row.players.append(GamePlayer(
                username=username[:100],
                theme=str(item.get("theme") or "").strip()[:160] or None,
                money=as_non_negative_int(item.get("money", item.get("result"))),
                correct_answers=as_non_negative_int(
                    item.get("correct_answers", item.get("correct"))
                ),
                wrong_answers=as_non_negative_int(
                    item.get("wrong_answers", item.get("wrong"))
                ),
                place=as_optional_int(item.get("place")) or index,
            ))

        row.questions.clear()
        questions_data = data.get("questions")
        if questions_data is None:
            questions_data = [
                {"question_id": value}
                for value in (data.get("question_ids") or [])
            ]
        for item in questions_data or []:
            if isinstance(item, int):
                item = {"question_id": item}
            if not isinstance(item, dict):
                continue
            question_type = str(item.get("question_type") or "general").strip()
            if question_type not in {"general", "theme"}:
                question_type = "general"
            row.questions.append(GameQuestion(
                question_id=as_optional_int(item.get("question_id")),
                question_type=question_type,
                theme=str(item.get("theme") or "").strip()[:160] or None,
                author=str(item.get("author") or "").strip()[:100] or None,
                correct=(
                    None if item.get("correct") is None
                    else bool(item.get("correct"))
                ),
            ))

        row.themes.clear()
        for item in data.get("themes") or []:
            if not isinstance(item, dict):
                continue
            theme = str(item.get("theme") or item.get("name") or "").strip()
            if not theme:
                continue
            row.themes.append(GameTheme(
                theme=theme[:160],
                used_count=as_non_negative_int(
                    item.get("used_count", item.get("used"))
                ),
                correct_count=as_non_negative_int(
                    item.get("correct_count", item.get("correct"))
                ),
                wrong_count=as_non_negative_int(
                    item.get("wrong_count", item.get("wrong"))
                ),
            ))

        row.events.clear()
        for item in data.get("events") or []:
            if not isinstance(item, dict):
                continue
            event_type = str(
                item.get("event_type") or item.get("type") or "event"
            ).strip()[:40]
            event_time = item.get("event_time", item.get("seconds", 0))
            if isinstance(event_time, str) and ":" in event_time:
                parts = [int(part or 0) for part in event_time.split(":")]
                if len(parts) == 2:
                    event_time = parts[0] * 60 + parts[1]
                elif len(parts) == 3:
                    event_time = parts[0] * 3600 + parts[1] * 60 + parts[2]
            payload = item.get("payload")
            if payload is None:
                payload = {"description": item.get("description", "")}
            row.events.append(GameEvent(
                event_time=as_non_negative_int(event_time),
                event_type=event_type or "event",
                payload=parse_event_payload(payload),
            ))

        snapshot = data.get("snapshot")
        if isinstance(snapshot, dict):
            if row.snapshot is None:
                row.snapshot = GameSnapshot()
            row.snapshot.questions_total = as_non_negative_int(
                snapshot.get("questions_total")
            )
            row.snapshot.themes_total = as_non_negative_int(
                snapshot.get("themes_total")
            )
            row.snapshot.database_size = as_non_negative_int(
                snapshot.get("database_size")
            )
            row.snapshot.resource_games = as_non_negative_int(
                snapshot.get("resource_games")
            )
            row.snapshot.builder_id = as_optional_int(snapshot.get("builder_id"))
        elif snapshot is None and row.snapshot is not None:
            db.session.delete(row.snapshot)

        row.players_count = len(row.players)

    def apply_payload(row: GameSession, data: dict[str, Any]) -> None:
        title = str(data.get("title") or "").strip()
        if not title:
            raise ValueError("Название игры обязательно.")

        status = str(data.get("status") or "completed").strip()
        if status not in {"completed", "draft", "cancelled"}:
            raise ValueError("Некорректный статус игры.")

        started = parse_datetime(data.get("started_at"), required=True)
        ended = parse_datetime(data.get("ended_at"))

        row.title = title[:160]
        row.season = str(data.get("season") or started.year).strip()[:80]
        row.builder_id = as_optional_int(data.get("builder_id"))
        row.status = status
        row.started_at = started
        row.ended_at = ended
        row.duration_seconds = duration_seconds(
            started,
            ended,
            data.get("duration_seconds"),
        )
        row.winner = str(data.get("winner") or "").strip()[:100] or None
        row.winner_money = as_non_negative_int(
            data.get("winner_money", data.get("prize"))
        )
        row.general_questions = as_non_negative_int(
            data.get("general_questions", data.get("general_count"))
        )
        row.theme_questions = as_non_negative_int(
            data.get("theme_questions", data.get("themed_count"))
        )
        row.correct_answers = as_non_negative_int(
            data.get("correct_answers", data.get("correct_count"))
        )
        row.wrong_answers = as_non_negative_int(
            data.get("wrong_answers", data.get("wrong_count"))
        )
        row.ended_normally = bool(data.get("ended_normally", status == "completed"))
        row.tpv_version = str(data.get("tpv_version") or "").strip()[:40] or None
        row.editor_version = (
            str(data.get("editor_version") or "10.2.1").strip()[:40] or None
        )
        row.notes = str(data.get("notes") or "").strip() or None

        replace_children(row, data)

    def archive_analytics(rows: list[GameSession]) -> dict[str, Any]:
        completed = [
            row for row in rows
            if row.status == "completed" and row.ended_normally
        ]

        def percent(correct: int, wrong: int) -> int:
            total = int(correct or 0) + int(wrong or 0)
            return round(int(correct or 0) * 100 / total) if total else 0

        def average(values: list[int | float], digits: int = 1):
            if not values:
                return 0
            result = sum(values) / len(values)
            return round(result, digits)

        total_correct = sum(row.correct_answers for row in completed)
        total_wrong = sum(row.wrong_answers for row in completed)
        total_questions = sum(
            row.general_questions + row.theme_questions
            for row in completed
        )
        total_players = sum(row.players_count for row in completed)

        players: dict[str, dict[str, Any]] = {}
        themes: dict[str, dict[str, Any]] = {}
        questions: dict[str, dict[str, Any]] = {}
        authors: dict[str, dict[str, Any]] = {}

        for row in completed:
            winner_key = str(row.winner or "").strip().casefold()

            for item in row.players:
                name = str(item.username or "").strip()
                if not name:
                    continue
                key = name.casefold()
                stat = players.setdefault(key, {
                    "name": name,
                    "games": 0,
                    "wins": 0,
                    "total": 0,
                    "best": 0,
                    "correct": 0,
                    "wrong": 0,
                })
                stat["games"] += 1
                stat["wins"] += 1 if winner_key and key == winner_key else 0
                stat["total"] += int(item.money or 0)
                stat["best"] = max(stat["best"], int(item.money or 0))
                stat["correct"] += int(item.correct_answers or 0)
                stat["wrong"] += int(item.wrong_answers or 0)

            for item in row.themes:
                name = str(item.theme or "Без темы").strip() or "Без темы"
                key = name.casefold()
                stat = themes.setdefault(key, {
                    "name": name,
                    "games": 0,
                    "used": 0,
                    "correct": 0,
                    "wrong": 0,
                })
                stat["games"] += 1
                stat["used"] += int(item.used_count or 0)
                stat["correct"] += int(item.correct_count or 0)
                stat["wrong"] += int(item.wrong_count or 0)

            for item in row.questions:
                question_key = (
                    f"id:{item.question_id}"
                    if item.question_id is not None
                    else f"archive:{item.id}"
                )
                stat = questions.setdefault(question_key, {
                    "question_id": item.question_id,
                    "type": item.question_type,
                    "theme": item.theme or "",
                    "author": item.author or "",
                    "used": 0,
                    "correct": 0,
                    "wrong": 0,
                    "unresolved": 0,
                    "last_used": None,
                })
                stat["used"] += 1
                if item.correct is True:
                    stat["correct"] += 1
                elif item.correct is False:
                    stat["wrong"] += 1
                else:
                    stat["unresolved"] += 1
                if stat["last_used"] is None or row.started_at > stat["last_used"]:
                    stat["last_used"] = row.started_at

                author = str(item.author or "").strip()
                if author:
                    author_key = author.casefold()
                    author_stat = authors.setdefault(author_key, {
                        "name": author,
                        "games_set": set(),
                        "used": 0,
                        "correct": 0,
                        "wrong": 0,
                    })
                    author_stat["games_set"].add(row.id)
                    author_stat["used"] += 1
                    if item.correct is True:
                        author_stat["correct"] += 1
                    elif item.correct is False:
                        author_stat["wrong"] += 1

        player_rows = []
        for stat in players.values():
            stat["average"] = round(stat["total"] / stat["games"]) if stat["games"] else 0
            stat["win_percent"] = round(stat["wins"] * 100 / stat["games"]) if stat["games"] else 0
            stat["correct_percent"] = percent(stat["correct"], stat["wrong"])
            player_rows.append(stat)
        player_rows.sort(key=lambda x: (-x["games"], -x["wins"], -x["best"], x["name"].casefold()))

        theme_rows = []
        for stat in themes.values():
            stat["correct_percent"] = percent(stat["correct"], stat["wrong"])
            theme_rows.append(stat)
        theme_rows.sort(key=lambda x: (-x["used"], x["name"].casefold()))

        question_rows = []
        for stat in questions.values():
            stat["correct_percent"] = percent(stat["correct"], stat["wrong"])
            stat["last_used_label"] = (
                stat["last_used"].strftime("%d.%m.%Y")
                if stat["last_used"] else "—"
            )
            stat.pop("last_used", None)
            question_rows.append(stat)
        question_rows.sort(key=lambda x: (-x["used"], x["correct_percent"], x["question_id"] or 0))

        author_rows = []
        for stat in authors.values():
            stat["games"] = len(stat.pop("games_set"))
            stat["correct_percent"] = percent(stat["correct"], stat["wrong"])
            author_rows.append(stat)
        author_rows.sort(key=lambda x: (-x["used"], x["name"].casefold()))

        game_rows = sorted(completed, key=lambda row: row.started_at)
        return {
            "has_data": bool(completed),
            "summary": {
                "all_games": len(rows),
                "completed_games": len(completed),
                "draft_games": sum(row.status == "draft" for row in rows),
                "cancelled_games": sum(row.status == "cancelled" for row in rows),
                "unique_players": len(players),
                "unique_questions": len(questions),
                "unique_themes": len(themes),
                "unique_authors": len(authors),
                "total_players": total_players,
                "total_questions": total_questions,
                "total_correct": total_correct,
                "total_wrong": total_wrong,
                "correct_percent": percent(total_correct, total_wrong),
                "average_players": average([row.players_count for row in completed]),
                "average_questions": average([
                    row.general_questions + row.theme_questions
                    for row in completed
                ]),
                "average_general": average([row.general_questions for row in completed]),
                "average_themes": average([row.theme_questions for row in completed]),
                "average_prize": round(average([row.winner_money for row in completed], 0)),
                "average_duration_seconds": round(average([row.duration_seconds for row in completed], 0)),
                "average_duration_label": format_duration(
                    round(average([row.duration_seconds for row in completed], 0))
                ) if completed else "—",
            },
            "games": [
                {
                    "id": row.id,
                    "title": row.title,
                    "date": row.started_at.strftime("%d.%m.%Y"),
                    "players": row.players_count,
                    "questions": row.general_questions + row.theme_questions,
                    "correct_percent": percent(row.correct_answers, row.wrong_answers),
                    "prize": row.winner_money,
                    "duration_seconds": row.duration_seconds,
                    "duration_label": format_duration(row.duration_seconds),
                }
                for row in game_rows
            ],
            "players": player_rows,
            "themes": theme_rows,
            "questions": question_rows,
            "authors": author_rows,
        }

    def statistics(rows: list[GameSession]) -> dict[str, Any]:
        completed = [
            row for row in rows
            if row.status == "completed" and row.ended_normally
        ]
        total = len(rows)
        if not completed:
            return {
                "total": total,
                "completed": 0,
                "average_players": 0,
                "average_general": 0,
                "average_duration_seconds": 0,
                "average_duration_label": "—",
            }
        avg_duration = round(
            sum(row.duration_seconds for row in completed) / len(completed)
        )
        return {
            "total": total,
            "completed": len(completed),
            "average_players": round(
                sum(row.players_count for row in completed) / len(completed), 1
            ),
            "average_general": round(
                sum(row.general_questions for row in completed) / len(completed), 1
            ),
            "average_duration_seconds": avg_duration,
            "average_duration_label": format_duration(avg_duration),
        }

    blueprint = Blueprint(
        "tpv_archive",
        __name__,
        url_prefix="/tpv_editor/api/games",
    )

    def require_editor():
        if allowed():
            return None
        return error("Нет доступа к редактору.", 403)

    @blueprint.get("/status")
    def archive_status():
        denied = require_editor()
        if denied:
            return denied
        return jsonify({"ok": True, "table_exists": tables_exist()})

    @blueprint.post("/create-tables")
    def archive_create_tables():
        denied = require_editor()
        if denied:
            return denied
        create_tables()
        return jsonify({
            "ok": True,
            "message": "Таблицы архива игр созданы.",
        })

    @blueprint.get("")
    def archive_list():
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return jsonify({
                "ok": True,
                "table_exists": False,
                "items": [],
                "games": [],
                "stats": statistics([]),
                "seasons": [],
                "analytics": archive_analytics([]),
            })

        rows = db.session.scalars(
            db.select(GameSession)
            .order_by(GameSession.started_at.desc(), GameSession.id.desc())
        ).unique().all()
        items = [session_to_dict(row) for row in rows]
        seasons = sorted(
            {row.season for row in rows if row.season},
            reverse=True,
        )
        return jsonify({
            "ok": True,
            "table_exists": True,
            "items": items,
            "games": items,
            "stats": statistics(rows),
            "seasons": seasons,
            "analytics": archive_analytics(rows),
        })

    def export_package(rows: list[GameSession]) -> dict[str, Any]:
        return {
            "format": "TPV_GAME_ARCHIVE",
            "version": "1.0",
            "exported_at": datetime.now().isoformat(timespec="seconds"),
            "count": len(rows),
            "games": [
                session_to_dict(row, include_children=True)
                for row in rows
            ],
        }

    def normalize_import_document(document: Any) -> list[dict[str, Any]]:
        """Принимает пакет архива, список игр или одну игру."""
        if isinstance(document, list):
            games = document
        elif isinstance(document, dict):
            format_name = str(document.get("format") or "").strip()

            if format_name and format_name != "TPV_GAME_ARCHIVE":
                raise ValueError("Файл не является архивом игр TPV.")

            version = str(document.get("version") or "1.0").strip()
            if version not in {"1.0"}:
                raise ValueError(
                    f"Версия архива {version} пока не поддерживается."
                )

            if isinstance(document.get("games"), list):
                games = document["games"]
            elif isinstance(document.get("game"), dict):
                games = [document["game"]]
            elif "title" in document:
                # Совместимость с JSON одной игры из этапов 10.2.3–10.2.4.
                games = [document]
            else:
                raise ValueError("В файле отсутствуют записи игр.")
        else:
            raise ValueError("Некорректная структура JSON-файла.")

        if not games:
            raise ValueError("В импортируемом файле нет игр.")

        if len(games) > 1000:
            raise ValueError(
                "За один раз можно импортировать не более 1000 игр."
            )

        normalized = []
        for index, item in enumerate(games, start=1):
            if not isinstance(item, dict):
                raise ValueError(
                    f"Запись игры №{index} имеет некорректный формат."
                )

            data = dict(item)

            # Идентификаторы исходной установки никогда не переносятся.
            data.pop("id", None)
            data.pop("created_at", None)
            data.pop("started_at_label", None)
            data.pop("duration_label", None)
            data.pop("players_text", None)
            data.pop("correct_percent", None)
            data.pop("total_questions", None)
            data.pop("player_count", None)
            data.pop("general_count", None)
            data.pop("themed_count", None)
            data.pop("correct_count", None)
            data.pop("wrong_count", None)
            data.pop("prize", None)

            # В экспортированных дочерних объектах локальные ID также не нужны.
            for key in ("players", "questions", "themes", "events"):
                children = data.get(key)
                if isinstance(children, list):
                    cleaned = []
                    for child in children:
                        if not isinstance(child, dict):
                            continue
                        value = dict(child)
                        value.pop("id", None)
                        cleaned.append(value)
                    data[key] = cleaned

            normalized.append(data)

        return normalized

    @blueprint.get("/export-all")
    def archive_export_all():
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return error("Таблицы архива игр не созданы.", 409)

        rows = db.session.scalars(
            db.select(GameSession)
            .order_by(GameSession.started_at, GameSession.id)
        ).unique().all()

        return jsonify({
            "ok": True,
            "archive": export_package(rows),
        })

    @blueprint.get("/<int:game_id>/export")
    def archive_export_one(game_id: int):
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return error("Таблицы архива игр не созданы.", 409)

        row = db.session.get(GameSession, game_id)
        if row is None:
            return error("Игра не найдена.", 404)

        return jsonify({
            "ok": True,
            "archive": export_package([row]),
        })

    @blueprint.post("/import")
    def archive_import():
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return error("Сначала создайте таблицы архива игр.", 409)

        document = request.get_json(silent=True)
        try:
            games = normalize_import_document(document)
            imported = []

            for data in games:
                row = GameSession()
                apply_payload(row, data)
                db.session.add(row)
                db.session.flush()
                imported.append({
                    "id": row.id,
                    "title": row.title,
                })

            db.session.commit()

        except ValueError as exc:
            db.session.rollback()
            return error(str(exc), 400)
        except Exception:
            db.session.rollback()
            raise

        return jsonify({
            "ok": True,
            "message": (
                f"Импортировано игр: {len(imported)}. "
                "Исходные ID не перезаписывались."
            ),
            "imported_count": len(imported),
            "items": imported,
        }), 201

    def build_records_payload() -> dict[str, Any]:
        rows = db.session.scalars(
            db.select(GameSession)
            .order_by(GameSession.started_at, GameSession.id)
        ).unique().all()

        completed = [
            row for row in rows
            if row.status == "completed" and row.ended_normally
        ]

        def accuracy(row: GameSession) -> float:
            total = row.correct_answers + row.wrong_answers
            return round(row.correct_answers * 100 / total, 2) if total else 0.0

        def game_ref(row: GameSession | None, value: Any = None) -> dict[str, Any] | None:
            if row is None:
                return None
            return {
                "game_id": row.id,
                "title": row.title,
                "started_at": row.started_at.isoformat(timespec="minutes"),
                "started_at_label": row.started_at.strftime("%d.%m.%Y %H:%M"),
                "winner": row.winner or "",
                "value": value,
            }

        def max_row(items, key):
            return max(items, key=key) if items else None

        def min_row(items, key):
            return min(items, key=key) if items else None

        games_records = {
            "longest": game_ref(
                max_row(completed, lambda r: r.duration_seconds),
                max((r.duration_seconds for r in completed), default=0),
            ),
            "shortest": game_ref(
                min_row(completed, lambda r: r.duration_seconds),
                min((r.duration_seconds for r in completed), default=0),
            ),
            "largest_prize": game_ref(
                max_row(completed, lambda r: r.winner_money),
                max((r.winner_money for r in completed), default=0),
            ),
            "smallest_prize": game_ref(
                min_row([r for r in completed if r.winner_money > 0], lambda r: r.winner_money),
                min((r.winner_money for r in completed if r.winner_money > 0), default=0),
            ),
            "highest_accuracy": game_ref(
                max_row(completed, accuracy),
                max((accuracy(r) for r in completed), default=0),
            ),
            "lowest_accuracy": game_ref(
                min_row(completed, accuracy),
                min((accuracy(r) for r in completed), default=0),
            ),
            "most_players": game_ref(
                max_row(completed, lambda r: r.players_count),
                max((r.players_count for r in completed), default=0),
            ),
            "most_questions": game_ref(
                max_row(completed, lambda r: r.general_questions + r.theme_questions),
                max((r.general_questions + r.theme_questions for r in completed), default=0),
            ),
            "most_theme_questions": game_ref(
                max_row(completed, lambda r: r.theme_questions),
                max((r.theme_questions for r in completed), default=0),
            ),
            "most_correct": game_ref(
                max_row(completed, lambda r: r.correct_answers),
                max((r.correct_answers for r in completed), default=0),
            ),
            "most_wrong": game_ref(
                max_row(completed, lambda r: r.wrong_answers),
                max((r.wrong_answers for r in completed), default=0),
            ),
        }

        player_map: dict[str, dict[str, Any]] = {}
        author_map: dict[str, dict[str, Any]] = {}
        theme_map: dict[str, dict[str, Any]] = {}

        for row in completed:
            winner_key = (row.winner or "").casefold()

            for player in row.players:
                name = (player.username or "").strip()
                if not name:
                    continue
                key = name.casefold()
                item = player_map.setdefault(key, {
                    "name": name,
                    "games": 0,
                    "wins": 0,
                    "total_money": 0,
                    "best_money": 0,
                    "worst_money": None,
                    "places": [],
                    "results": [],
                })
                item["games"] += 1
                item["wins"] += 1 if key == winner_key else 0
                item["total_money"] += int(player.money or 0)
                item["best_money"] = max(item["best_money"], int(player.money or 0))
                item["worst_money"] = (
                    int(player.money or 0)
                    if item["worst_money"] is None
                    else min(item["worst_money"], int(player.money or 0))
                )
                if player.place is not None:
                    item["places"].append(int(player.place))
                item["results"].append({
                    "game_id": row.id,
                    "won": key == winner_key,
                    "money": int(player.money or 0),
                })

            for question in row.questions:
                author = (question.author or "").strip()
                if author:
                    key = author.casefold()
                    item = author_map.setdefault(key, {
                        "name": author,
                        "used": 0,
                        "correct": 0,
                        "wrong": 0,
                    })
                    item["used"] += 1
                    if question.correct is True:
                        item["correct"] += 1
                    elif question.correct is False:
                        item["wrong"] += 1

            for theme in row.themes:
                name = (theme.theme or "").strip()
                if not name:
                    continue
                key = name.casefold()
                item = theme_map.setdefault(key, {
                    "name": name,
                    "used": 0,
                    "correct": 0,
                    "wrong": 0,
                })
                item["used"] += int(theme.used_count or 0)
                item["correct"] += int(theme.correct_count or 0)
                item["wrong"] += int(theme.wrong_count or 0)

        players = []
        for item in player_map.values():
            games = item["games"]
            wins = item["wins"]
            current_win_streak = 0
            best_win_streak = 0
            current_no_win_streak = 0
            best_no_win_streak = 0
            for result in item["results"]:
                if result["won"]:
                    current_win_streak += 1
                    best_win_streak = max(best_win_streak, current_win_streak)
                    current_no_win_streak = 0
                else:
                    current_no_win_streak += 1
                    best_no_win_streak = max(best_no_win_streak, current_no_win_streak)
                    current_win_streak = 0

            players.append({
                "name": item["name"],
                "games": games,
                "wins": wins,
                "win_percent": round(wins * 100 / games, 2) if games else 0,
                "total_money": item["total_money"],
                "average_money": round(item["total_money"] / games) if games else 0,
                "best_money": item["best_money"],
                "worst_money": item["worst_money"] or 0,
                "average_place": (
                    round(sum(item["places"]) / len(item["places"]), 2)
                    if item["places"] else None
                ),
                "best_win_streak": best_win_streak,
                "best_no_win_streak": best_no_win_streak,
            })

        players.sort(key=lambda x: (-x["wins"], -x["total_money"], x["name"].casefold()))

        authors = []
        for item in author_map.values():
            answered = item["correct"] + item["wrong"]
            authors.append({
                **item,
                "accuracy": round(item["correct"] * 100 / answered, 2) if answered else 0,
            })
        authors.sort(key=lambda x: (-x["used"], x["name"].casefold()))

        themes = []
        for item in theme_map.values():
            answered = item["correct"] + item["wrong"]
            themes.append({
                **item,
                "accuracy": round(item["correct"] * 100 / answered, 2) if answered else 0,
                "difficulty": round(item["wrong"] * 100 / answered, 2) if answered else 0,
            })
        themes.sort(key=lambda x: (-x["used"], x["name"].casefold()))

        total_events = sum(len(row.events) for row in completed)
        total_questions = sum(row.general_questions + row.theme_questions for row in completed)
        total_correct = sum(row.correct_answers for row in completed)
        total_wrong = sum(row.wrong_answers for row in completed)
        total_prize = sum(row.winner_money for row in completed)
        average_duration = (
            round(sum(row.duration_seconds for row in completed) / len(completed))
            if completed else 0
        )
        average_prize = round(total_prize / len(completed)) if completed else 0
        average_accuracy = (
            round(total_correct * 100 / (total_correct + total_wrong), 2)
            if total_correct + total_wrong else 0
        )

        project = {
            "games_total": len(rows),
            "games_completed": len(completed),
            "games_draft": sum(1 for row in rows if row.status == "draft"),
            "games_cancelled": sum(1 for row in rows if row.status == "cancelled"),
            "players_unique": len(players),
            "authors_unique": len(authors),
            "themes_unique": len(themes),
            "questions_total": total_questions,
            "events_total": total_events,
            "correct_total": total_correct,
            "wrong_total": total_wrong,
            "prize_total": total_prize,
            "average_duration_seconds": average_duration,
            "average_duration_label": format_duration(average_duration) if average_duration else "—",
            "average_accuracy": average_accuracy,
            "average_prize": average_prize,
        }

        achievement_specs = [
            ("first_game", "Первая игра", project["games_completed"] >= 1, f'{project["games_completed"]} игр'),
            ("ten_games", "10 игр", project["games_completed"] >= 10, f'{project["games_completed"]} игр'),
            ("hundred_games", "100 игр", project["games_completed"] >= 100, f'{project["games_completed"]} игр'),
            ("thousand_questions", "1000 вопросов", project["questions_total"] >= 1000, f'{project["questions_total"]} вопросов'),
            ("first_million", "Первый миллион", project["prize_total"] >= 1_000_000, f'{project["prize_total"]} очков'),
            ("hundred_players", "100 игроков", project["players_unique"] >= 100, f'{project["players_unique"]} игроков'),
            ("hundred_themes", "100 тем", project["themes_unique"] >= 100, f'{project["themes_unique"]} тем'),
            ("hundred_replays", "100 Replay", project["games_completed"] >= 100 and project["events_total"] > 0, f'{project["games_completed"]} архивов'),
        ]

        achievements = [
            {
                "code": code,
                "title": title,
                "unlocked": unlocked,
                "progress": progress,
            }
            for code, title, unlocked, progress in achievement_specs
        ]

        return {
            "project": project,
            "games": games_records,
            "players": players,
            "authors": authors,
            "themes": themes,
            "achievements": achievements,
        }

    @blueprint.get("/records")
    def archive_records():
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return jsonify({
                "ok": True,
                "table_exists": False,
                "records": {
                    "project": {},
                    "games": {},
                    "players": [],
                    "authors": [],
                    "themes": [],
                    "achievements": [],
                },
            })

        return jsonify({
            "ok": True,
            "table_exists": True,
            "records": build_records_payload(),
        })

    @blueprint.get("/<int:game_id>")
    def archive_get(game_id: int):
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return error("Таблицы архива игр не созданы.", 409)
        row = db.session.get(GameSession, game_id)
        if row is None:
            return error("Игра не найдена.", 404)
        return jsonify({"ok": True, "game": session_to_dict(row)})

    @blueprint.post("")
    def archive_create():
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return error("Сначала создайте таблицы архива игр.", 409)
        data = request.get_json(silent=True) or {}
        row = GameSession()
        try:
            apply_payload(row, data)
            db.session.add(row)
            db.session.commit()
        except ValueError as exc:
            db.session.rollback()
            return error(str(exc), 400)
        except Exception:
            db.session.rollback()
            raise
        return jsonify({
            "ok": True,
            "message": "Запись игры создана.",
            "game": session_to_dict(row),
        }), 201

    @blueprint.put("/<int:game_id>")
    def archive_update(game_id: int):
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return error("Таблицы архива игр не созданы.", 409)
        row = db.session.get(GameSession, game_id)
        if row is None:
            return error("Игра не найдена.", 404)
        data = request.get_json(silent=True) or {}
        try:
            apply_payload(row, data)
            db.session.commit()
        except ValueError as exc:
            db.session.rollback()
            return error(str(exc), 400)
        except Exception:
            db.session.rollback()
            raise
        return jsonify({
            "ok": True,
            "message": "Запись игры обновлена.",
            "game": session_to_dict(row),
        })

    @blueprint.delete("/<int:game_id>")
    def archive_delete(game_id: int):
        denied = require_editor()
        if denied:
            return denied
        if not tables_exist():
            return error("Таблицы архива игр не созданы.", 409)
        row = db.session.get(GameSession, game_id)
        if row is None:
            return error("Игра не найдена.", 404)
        db.session.delete(row)
        db.session.commit()
        return jsonify({"ok": True, "message": "Запись игры удалена."})

    app.register_blueprint(blueprint)

    return models
