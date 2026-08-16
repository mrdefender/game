from __future__ import annotations

from datetime import datetime
import json
from pathlib import Path
from typing import Any, Callable

from sqlalchemy import inspect


class TpvArchiveRuntime:
    """Автоматическое накопление данных одной одновременно запущенной игры TPV."""

    REQUIRED_TABLES = {
        "tpv_game_sessions",
        "tpv_game_players",
        "tpv_game_questions",
        "tpv_game_themes",
        "tpv_game_events",
        "tpv_game_snapshots",
    }

    def __init__(
        self,
        db,
        models,
        *,
        get_players: Callable[[], list[Any]],
        get_results: Callable[[], list[Any]],
        get_questions_total: Callable[[], int],
        get_themes_total: Callable[[], int],
        get_builder_id: Callable[[], int | None],
        get_resource_games: Callable[[], int],
        get_database_path: Callable[[], str | None],
        logger=None,
    ):
        self.db = db
        self.models = models
        self.get_players = get_players
        self.get_results = get_results
        self.get_questions_total = get_questions_total
        self.get_themes_total = get_themes_total
        self.get_builder_id = get_builder_id
        self.get_resource_games = get_resource_games
        self.get_database_path = get_database_path
        self.logger = logger
        self._session_id: int | None = None

    def _log_exception(self, message: str) -> None:
        if self.logger is not None:
            self.logger.exception(message)

    def tables_exist(self) -> bool:
        try:
            names = set(inspect(self.db.engine).get_table_names())
            return self.REQUIRED_TABLES.issubset(names)
        except Exception:
            self._log_exception(
                "TPV archive runtime: не удалось проверить таблицы архива."
            )
            return False

    def _active(self):
        if not self.tables_exist():
            return None

        if self._session_id is not None:
            row = self.db.session.get(self.models.GameSession, self._session_id)
            if row is not None and row.status == "draft":
                return row
            self._session_id = None

        row = self.db.session.scalar(
            self.db.select(self.models.GameSession)
            .where(self.models.GameSession.status == "draft")
            .order_by(self.models.GameSession.id.desc())
            .limit(1)
        )
        if row is not None:
            self._session_id = row.id
        return row

    @staticmethod
    def _elapsed(row) -> int:
        return max(0, int((datetime.now() - row.started_at).total_seconds()))

    def _add_event(
        self,
        row,
        event_type: str,
        description: str = "",
        payload: dict[str, Any] | None = None,
    ) -> None:
        data = dict(payload or {})
        if description:
            data.setdefault("description", description)
        row.events.append(self.models.GameEvent(
            event_time=self._elapsed(row),
            event_type=str(event_type or "event")[:40],
            payload=json.dumps(data, ensure_ascii=False),
        ))

    def start(self, *, title: str | None = None, season: str | None = None) -> int | None:
        """Создаёт черновик игры. Повторный вызов не создаёт дубль."""
        if not self.tables_exist():
            return None
        try:
            current = self._active()
            if current is not None:
                return current.id

            now = datetime.now()
            row = self.models.GameSession(
                title=(title or f"TPV — {now:%d.%m.%Y}")[:160],
                season=(season or str(now.year))[:80],
                builder_id=self.get_builder_id(),
                status="draft",
                started_at=now,
                duration_seconds=0,
                winner_money=0,
                players_count=0,
                general_questions=0,
                theme_questions=0,
                correct_answers=0,
                wrong_answers=0,
                ended_normally=False,
                tpv_version="15.0",
                editor_version="15.0",
            )

            seen = set()
            for index, player in enumerate(self.get_players() or [], start=1):
                username = str(getattr(player, "username", "") or "").strip()
                if not username or username.casefold() in seen:
                    continue
                seen.add(username.casefold())
                row.players.append(self.models.GamePlayer(
                    username=username[:100],
                    theme=str(getattr(player, "flip", "") or "")[:160] or None,
                    money=max(0, int(getattr(player, "money", 0) or 0)),
                    correct_answers=0,
                    wrong_answers=0,
                    place=index,
                ))

            row.players_count = len(row.players)
            self._add_event(row, "game_start", "Игра началась")
            self.db.session.add(row)
            self.db.session.commit()
            self._session_id = row.id
            return row.id
        except Exception:
            self.db.session.rollback()
            self._log_exception("Не удалось начать архивную сессию TPV")
            return None

    def ensure_started(self):
        row = self._active()
        if row is None:
            self.start()
            row = self._active()
        return row

    def record_question(
        self,
        *,
        question_id: int | None,
        question_type: str,
        theme: str | None,
        author: str | None,
        player: str | None,
        question_number: Any = None,
    ) -> None:
        try:
            row = self.ensure_started()
            if row is None:
                return

            kind = "theme" if question_type == "theme" else "general"
            row.questions.append(self.models.GameQuestion(
                question_id=question_id,
                question_type=kind,
                theme=(str(theme).strip()[:160] if theme else None),
                author=(str(author).strip()[:100] if author else None),
                correct=None,
            ))
            if kind == "theme":
                row.theme_questions += 1
                self._increment_theme(row, theme or "Без темы", used=1)
            else:
                row.general_questions += 1

            self._add_event(
                row,
                "question",
                "Выбран вопрос",
                {
                    "question_id": question_id,
                    "question_type": kind,
                    "theme": theme,
                    "author": author,
                    "player": player,
                    "question_number": question_number,
                },
            )
            self.db.session.commit()
        except Exception:
            self.db.session.rollback()
            self._log_exception("Не удалось записать вопрос TPV в архив")

    def _increment_theme(
        self,
        row,
        theme: str,
        *,
        used: int = 0,
        correct: int = 0,
        wrong: int = 0,
    ) -> None:
        normalized = str(theme or "Без темы").strip()[:160]
        item = next(
            (value for value in row.themes if value.theme.casefold() == normalized.casefold()),
            None,
        )
        if item is None:
            item = self.models.GameTheme(
                theme=normalized,
                used_count=0,
                correct_count=0,
                wrong_count=0,
            )
            row.themes.append(item)
        item.used_count += used
        item.correct_count += correct
        item.wrong_count += wrong

    def record_answer(
        self,
        outcome: str,
        *,
        player: str | None,
        answer: str | None = None,
        question_number: Any = None,
        state: Any = None,
    ) -> None:
        try:
            row = self.ensure_started()
            if row is None:
                return

            is_correct = outcome == "correct"
            is_wrong = outcome == "wrong"

            if is_correct:
                row.correct_answers += 1
            elif is_wrong:
                row.wrong_answers += 1

            # Последний вопрос без результата считается текущим.
            current_question = next(
                (item for item in reversed(row.questions) if item.correct is None),
                None,
            )
            if current_question is not None and (is_correct or is_wrong):
                current_question.correct = is_correct
                if current_question.question_type == "theme" and current_question.theme:
                    self._increment_theme(
                        row,
                        current_question.theme,
                        correct=1 if is_correct else 0,
                        wrong=1 if is_wrong else 0,
                    )

            archive_player = next(
                (
                    item for item in row.players
                    if item.username.casefold() == str(player or "").casefold()
                ),
                None,
            )
            if archive_player is not None:
                if is_correct:
                    archive_player.correct_answers += 1
                elif is_wrong:
                    archive_player.wrong_answers += 1

            labels = {
                "correct": "Правильный ответ",
                "wrong": "Неправильный ответ",
                "pass": "Вопрос пропущен",
                "flip": "Переход к теме замены",
            }
            self._add_event(
                row,
                f"answer_{outcome}",
                labels.get(outcome, "Результат ответа"),
                {
                    "player": player,
                    "answer": answer,
                    "question_number": question_number,
                    "state": state,
                },
            )
            self.db.session.commit()
        except Exception:
            self.db.session.rollback()
            self._log_exception("Не удалось записать результат ответа TPV")

    def record_player_result(self, username: str, amount: int) -> None:
        try:
            row = self.ensure_started()
            if row is None:
                return
            name = str(username or "").strip()
            if not name:
                return

            player = next(
                (item for item in row.players if item.username.casefold() == name.casefold()),
                None,
            )
            if player is None:
                player = self.models.GamePlayer(
                    username=name[:100],
                    money=0,
                    correct_answers=0,
                    wrong_answers=0,
                    place=len(row.players) + 1,
                )
                row.players.append(player)
                row.players_count = len(row.players)

            player.money = max(0, int(player.money or 0) + int(amount or 0))
            self._add_event(
                row,
                "player_result",
                "Начислен результат игроку",
                {"player": name, "amount": int(amount or 0)},
            )
            self.db.session.commit()
        except Exception:
            self.db.session.rollback()
            self._log_exception("Не удалось записать результат игрока TPV")

    def record_author_result(self, username: str, amount: int) -> None:
        try:
            row = self.ensure_started()
            if row is None:
                return
            self._add_event(
                row,
                "author_result",
                "Начислен результат автору вопроса",
                {"author": username, "amount": int(amount or 0)},
            )
            self.db.session.commit()
        except Exception:
            self.db.session.rollback()
            self._log_exception("Не удалось записать результат автора TPV")

    def finalize(self) -> int | None:
        """Завершает текущую архивную запись и создаёт Snapshot."""
        try:
            row = self._active()
            if row is None:
                return None

            now = datetime.now()
            row.ended_at = now
            row.duration_seconds = max(
                0,
                int((now - row.started_at).total_seconds()),
            )
            row.status = "completed"
            row.ended_normally = True

            results = sorted(
                self.get_results() or [],
                key=lambda item: int(getattr(item, "money", 0) or 0),
                reverse=True,
            )
            if results:
                row.winner = str(getattr(results[0], "username", "") or "")[:100] or None
                row.winner_money = max(0, int(getattr(results[0], "money", 0) or 0))

            result_map = {
                str(getattr(item, "username", "") or "").casefold(): item
                for item in results
            }
            for player in row.players:
                source = result_map.get(player.username.casefold())
                if source is not None:
                    player.money = max(0, int(getattr(source, "money", 0) or 0))

            row.players.sort(key=lambda item: item.money, reverse=True)
            for place, player in enumerate(row.players, start=1):
                player.place = place
            row.players_count = len(row.players)

            database_size = 0
            database_path = self.get_database_path()
            if database_path:
                path = Path(database_path)
                if path.exists():
                    database_size = path.stat().st_size

            if row.snapshot is None:
                row.snapshot = self.models.GameSnapshot()
            row.snapshot.questions_total = max(0, int(self.get_questions_total() or 0))
            row.snapshot.themes_total = max(0, int(self.get_themes_total() or 0))
            row.snapshot.database_size = database_size
            row.snapshot.resource_games = max(0, int(self.get_resource_games() or 0))
            row.snapshot.builder_id = self.get_builder_id()

            self._add_event(row, "game_end", "Игра завершена")
            self.db.session.commit()
            finished_id = row.id
            self._session_id = None
            return finished_id
        except Exception:
            self.db.session.rollback()
            self._log_exception("Не удалось завершить архивную сессию TPV")
            return None

    def cancel(self, description: str = "Игра отменена") -> int | None:
        try:
            row = self._active()
            if row is None:
                return None
            row.ended_at = datetime.now()
            row.duration_seconds = self._elapsed(row)
            row.status = "cancelled"
            row.ended_normally = False
            self._add_event(row, "game_cancel", description)
            self.db.session.commit()
            cancelled_id = row.id
            self._session_id = None
            return cancelled_id
        except Exception:
            self.db.session.rollback()
            self._log_exception("Не удалось отменить архивную сессию TPV")
            return None
