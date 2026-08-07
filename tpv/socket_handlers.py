"""Socket.IO handlers for The People Versus.

Этап 13.8.1.
Обработчики зарегистрированы обычным читаемым Python-кодом:
без _TPV_SOCKET_SOURCE, compile() и exec().

Модуль не импортирует game.py. Все зависимости по-прежнему передаются
через register_tpv_socket_handlers(runtime).
"""

from __future__ import annotations

from typing import Any, Mapping


_REQUIRED_RUNTIME_NAMES = {
    "socketio",
    "db",
    "emit",
    "join_room",
    "request",
    "url_for",
    "json",
    "secrets",
    "func",
    "desc",
    "DEFAULT_ROOM_CODE",
    "QueryTpv",
    "Questions_tpv",
    "UsersTpv",
    "TPV_ARCHIVE_RUNTIME",
    "get_room_code",
    "emit_tpv_host",
    "emit_tpv_player",
    "emit_tpv_spectator",
}


TPV_SOCKET_EVENTS = [
    "room:join_tpv",
    "count_answer_interactive",
    "clean_db_tpv",
    "tpv_spectator_ready",
    "tpv_selection_start",
    "tpv_versus",
    "choose_player_random",
    "choose_player_id",
    "reset_to_wait_tpv",
    "tpv_bong_prepare",
    "tpv_bong_selected",
    "tpv_bong_value",
    "tpv_bong_stop_ack",
    "tpv_bong_result",
    "tpv_bong_hide",
    "tpv_bong_stop_request",
    "generate_safe_bong_game",
    "generate_sum_for_bong_game",
    "take_question",
    "add_result_author",
    "add_result_player",
    "tpv_update_data_user_spec",
    "show_tree",
    "hide_tree",
    "show_stats",
    "hide_stats",
    "tpv_correct",
    "tpv_pass",
    "tpv_flip",
    "tpv_wrong",
    "start_intro",
    "host_show_credits_tpv",
    "show_results_tpv",
]


TPV_CREDITS_PAYLOAD = {
    "title": "Спасибо за игру!",
    "lines": [
        "Ведущий: Mokaque",
        "Редактор вопросов: Mokaque",
        "Оригинальная идея: David Briggs, Steve Knight, Mike Whitehill",
        "Голос Гонг Игры: Кирилл (Yandex SpeechKit)",
        "Техническая реализация: Mokaque",
        "Композиторы: Keith Strachan, Mattew Strachan",
        "Адаптация правил: Mokaque",
        "Графика: ChatGPT",
        "Оригинальный формат: Sony Pictures Entertainment",
        (
            "Никто из участников создания данной адаптации игры "
            "не претендует на авторские права на формат оригинальной "
            "игры 'The People Versus'"
        ),
        (
            "Данный проект выпущен исключительно в развлекательных "
            "целях и не преследует целей получение материальной выгоды"
        ),
        "До встречи в следующей игре!",
    ],
}


class TpvSocketHandlers:
    """Набор Socket.IO-обработчиков TPV.

    Зависимости приложения хранятся в экземпляре сервиса, а события
    регистрируются явно в :meth:`register`.
    """

    def __init__(self, runtime: Mapping[str, Any]) -> None:
        self.socketio = runtime["socketio"]
        self.db = runtime["db"]
        self.emit = runtime["emit"]
        self.join_room = runtime["join_room"]
        self.request = runtime["request"]
        self.url_for = runtime["url_for"]
        self.json = runtime["json"]
        self.secrets = runtime["secrets"]
        self.func = runtime["func"]
        self.desc = runtime["desc"]

        self.DEFAULT_ROOM_CODE = runtime["DEFAULT_ROOM_CODE"]

        self.QueryTpv = runtime["QueryTpv"]
        self.QuestionsTpv = runtime["Questions_tpv"]
        self.UsersTpv = runtime["UsersTpv"]

        self.archive = runtime["TPV_ARCHIVE_RUNTIME"]

        self.get_room_code = runtime["get_room_code"]
        self.emit_tpv_host = runtime["emit_tpv_host"]
        self.emit_tpv_player = runtime["emit_tpv_player"]
        self.emit_tpv_spectator = runtime["emit_tpv_spectator"]

    # ------------------------------------------------------------------
    # Регистрация
    # ------------------------------------------------------------------

    def register(self) -> None:
        """Зарегистрировать все TPV Socket.IO events."""
        handlers = {
            "room:join_tpv": self.socket_join_room,
            "count_answer_interactive": self.count_interactive,
            "clean_db_tpv": self.clean_db_tpv,
            "tpv_spectator_ready": self.tpv_spectator_ready,
            "tpv_selection_start": self.tpv_selection_start,
            "tpv_versus": self.tpv_versus,
            "choose_player_random": self.choose_player_random,
            "choose_player_id": self.choose_player_id,
            "reset_to_wait_tpv": self.reset_to_wait_tpv,
            "tpv_bong_prepare": self.tpv_bong_prepare,
            "tpv_bong_selected": self.tpv_bong_selected,
            "tpv_bong_value": self.tpv_bong_value,
            "tpv_bong_stop_ack": self.tpv_bong_stop_ack,
            "tpv_bong_result": self.tpv_bong_result,
            "tpv_bong_hide": self.tpv_bong_hide,
            "tpv_bong_stop_request": self.tpv_bong_stop_request,
            "generate_safe_bong_game": self.generate_safe_bong_game,
            "generate_sum_for_bong_game": (
                self.generate_sum_for_bong_game
            ),
            "take_question": self.take_question,
            "add_result_author": self.add_result_author,
            "add_result_player": self.add_result_player,
            "tpv_update_data_user_spec": (
                self.tpv_update_data_user_spec
            ),
            "show_tree": self.show_tree,
            "hide_tree": self.hide_tree,
            "show_stats": self.show_stats,
            "hide_stats": self.hide_stats,
            "tpv_correct": self.tpv_correct,
            "tpv_pass": self.tpv_pass,
            "tpv_flip": self.tpv_flip,
            "tpv_wrong": self.tpv_wrong,
            "start_intro": self.start_intro,
            "host_show_credits_tpv": self.host_show_credits,
            "show_results_tpv": self.show_results_tpv,
        }

        for event_name, handler in handlers.items():
            self.socketio.on(event_name)(handler)

    # ------------------------------------------------------------------
    # Комнаты и список игроков
    # ------------------------------------------------------------------

    def socket_join_room(self, data):
        room_code = str(
            data.get("room")
            or self.get_room_code()
            or ""
        )
        role = data.get("role") or "unknown"
        username = data.get("username") or ""

        self.join_room(room_code)
        self.join_room(f"{room_code}:{role}")

        if username:
            self.join_room(
                f"{room_code}:user:{username}"
            )

        print(
            "Socket joined "
            f"room={room_code}, "
            f"role={role}, "
            f"username={username}"
        )

        self.update_users_tpv()

        self.emit(
            "room:joined",
            {
                "room": room_code,
                "role": role,
                "username": username,
            },
        )

    def count_interactive(self, data):
        try:
            count = int(data["interactive"])
            self.socketio.emit(
                "count_answer_interactive_for_spec",
                count,
                to=(
                    f"{self.DEFAULT_ROOM_CODE}:spectator"
                ),
            )
        except Exception:
            return

    @staticmethod
    def _user_row(user, single: bool):
        return [
            user.id,
            user.username,
            user.flip,
            user.money,
            user.status,
            "true" if single else "false",
        ]

    def update_users_tpv(self):
        users = self.db.session.scalars(
            self.db.select(self.QueryTpv)
        ).all()

        if len(users) == 1:
            result = self._user_row(
                users[0],
                single=True,
            )
            self.emit_tpv_host(
                "updated_users_tpv",
                result,
            )
            return None

        result = [
            self._user_row(user, single=False)
            for user in users
            if user.status != "ended"
        ]

        self.emit_tpv_host(
            "updated_users_tpv",
            result,
        )
        return result

    def clean_db_tpv(self):
        self.archive.cancel(
            "Игровая база очищена ведущим"
        )

        self.db.session.execute(
            self.db.delete(self.QueryTpv)
        )
        self.db.session.commit()

        self.update_users_tpv()
        self.emit_tpv_host("DB_clean", "ok")

    def tpv_spectator_ready(self):
        """Восстановить код комнаты после reload spectator."""
        room_code = self.get_room_code()

        if room_code is None:
            self.emit("room_code_hide", {})
            return

        join_url = (
            f"{self.request.host_url.rstrip('/')}"
            f"{self.url_for('join')}"
            f"?room={room_code}"
        )

        self.emit(
            "room_code_show",
            {
                "room": room_code,
                "joinUrl": join_url,
            },
        )

    # ------------------------------------------------------------------
    # Отбор игрока
    # ------------------------------------------------------------------

    def tpv_selection_start(self):
        self.archive.start()

        players = self.db.session.scalars(
            self.db.select(self.QueryTpv).where(
                self.QueryTpv.status == "wait"
            )
        ).all()

        self.emit_tpv_spectator(
            "tpv_spectator_select_start",
            {
                "players": [
                    player.username
                    for player in players
                ]
            },
        )

    def tpv_versus(self):
        self.emit_tpv_spectator(
            "tpv_versus_spec",
            {"show": True},
        )

    @staticmethod
    def _selected_player_result(player):
        return [
            player.id,
            player.username,
            player.flip,
            player.money,
            player.status,
        ]

    def _emit_selected_player(self, player):
        result = self._selected_player_result(
            player
        )

        self.socketio.emit(
            "player_selected",
            result,
            to=(
                f"{self.get_room_code()}"
                f":user:{player.username}"
            ),
        )

        self.emit_tpv_host(
            "player_selected",
            result,
        )

        self.emit_tpv_spectator(
            "tpv_spectator_player_selected",
            {
                "player": player.username,
                "topic": player.flip,
                "currentMoney": player.money,
            },
        )

        return result

    def choose_player_random(self):
        try:
            players = self.db.session.scalars(
                self.db.select(self.QueryTpv).where(
                    self.QueryTpv.status == "wait"
                )
            ).all()

            if not players:
                return

            if len(players) == 1:
                player = players[0]
                player.status = "selected"
                self.db.session.commit()

                self._emit_selected_player(player)
                self.update_users_tpv()
                return

            secure_rnd = self.secrets.SystemRandom()
            player = players[
                secure_rnd.randrange(len(players))
            ]

            player.status = "selected"
            self.db.session.commit()

            # Сохраняем прежний порядок обновлений:
            # host list -> selected event -> host list.
            self.update_users_tpv()
            self._emit_selected_player(player)
            self.update_users_tpv()

        except Exception:
            pass

    def choose_player_id(self, data):
        try:
            player_id = data["id"]

            player = self.db.session.scalar(
                self.db.select(self.QueryTpv).where(
                    self.QueryTpv.id == player_id
                )
            )

            if player is None:
                return

            player.status = "selected"
            self.db.session.commit()

            self._emit_selected_player(player)
            self.update_users_tpv()

        except Exception:
            pass

    def reset_to_wait_tpv(self):
        try:
            players = self.db.session.scalars(
                self.db.select(self.QueryTpv)
            ).all()

            if len(players) == 1:
                if players[0].status != "ended":
                    players[0].status = "wait"
                    self.db.session.commit()
                    self.update_users_tpv()
            else:
                for player in players:
                    if player.status != "ended":
                        player.status = "wait"
                        self.db.session.commit()
                        self.update_users_tpv()

            self.socketio.emit(
                "reset",
                "wait",
                to=(
                    f"{self.get_room_code()}:user"
                ),
            )
            self.emit_tpv_spectator(
                "reset",
                "wait",
            )

        except Exception:
            # Сохраняем прежнюю ветку обработки ошибки.
            return self.json.dump("fail")

    # ------------------------------------------------------------------
    # Гонг-игра
    # ------------------------------------------------------------------

    def _emit_tpv_bong_to_player(
        self,
        event_name,
        data,
    ):
        """Переслать этап гонг-игры player + spectator."""
        payload = dict(data or {})
        player = str(
            payload.pop("player", "") or ""
        ).strip()

        if player:
            self.socketio.emit(
                f"{event_name}_user",
                payload,
                to=(
                    f"{self.get_room_code()}"
                    f":user:{player}"
                ),
            )

        self.emit_tpv_spectator(
            f"{event_name}_spec",
            payload,
        )

    def tpv_bong_prepare(self, data):
        self._emit_tpv_bong_to_player(
            "tpv_bong_prepare",
            data,
        )

    def tpv_bong_selected(self, data):
        self._emit_tpv_bong_to_player(
            "tpv_bong_selected",
            data,
        )

    def tpv_bong_value(self, data):
        self._emit_tpv_bong_to_player(
            "tpv_bong_value",
            data,
        )

    def tpv_bong_stop_ack(self, data):
        self._emit_tpv_bong_to_player(
            "tpv_bong_stop_ack",
            data,
        )

    def tpv_bong_result(self, data):
        self._emit_tpv_bong_to_player(
            "tpv_bong_result",
            data,
        )

    def tpv_bong_hide(self, data):
        self._emit_tpv_bong_to_player(
            "tpv_bong_hide",
            data,
        )

    def tpv_bong_stop_request(self, data):
        """Передать STOP-запрос игрока ведущему."""
        player = str(
            (data or {}).get("player") or ""
        ).strip()

        if not player:
            return {
                "ok": False,
                "error": "player_required",
            }

        payload = {"player": player}

        host_rooms = {
            f"{self.DEFAULT_ROOM_CODE}:host",
            f"{self.get_room_code()}:host",
        }

        for host_room in host_rooms:
            self.socketio.emit(
                "tpv_bong_stop_requested",
                payload,
                to=host_room,
            )

        return {"ok": True}

    def generate_safe_bong_game(self):
        secure_rnd = self.secrets.SystemRandom()
        number = secure_rnd.randint(1, 3)

        self.emit_tpv_host(
            "bong_game_safe_var",
            number,
        )

    def generate_sum_for_bong_game(self, data):
        secure_rnd = self.secrets.SystemRandom()
        count = secure_rnd.randint(6, 15)

        secure_rnd = self.secrets.SystemRandom()
        result = secure_rnd.sample(
            range(1, data["sum"]),
            count,
        )

        result.sort()
        result.append(data["sum"])

        self.emit_tpv_host(
            "sum_generated",
            result,
        )

    # ------------------------------------------------------------------
    # Вопросы
    # ------------------------------------------------------------------

    def _select_question(self, data):
        replacement = (
            data["flips"] != "false"
        )
        theme = (
            data["flips"]
            if replacement
            else "false"
        )

        question = self.db.session.scalar(
            self.db.select(
                self.QuestionsTpv
            )
            .where(
                self.QuestionsTpv.flip == theme,
                (
                    self.QuestionsTpv.author
                    != data["player"]
                ),
                self.QuestionsTpv.show == "false",
            )
            .order_by(self.func.random())
            .limit(1)
        )

        return question, replacement

    def take_question(self, data):
        question_row, replacement = (
            self._select_question(data)
        )

        if question_row is None:
            self.emit_tpv_host(
                "question_selected",
                "fail",
            )
            return

        question = question_row.task
        answer = question_row.answer
        comment = question_row.comment
        author = question_row.author

        result_host = [
            question,
            answer,
            comment,
            author,
        ]

        result_user_spec = {
            "question": question,
            "author": author,
            "replacement": replacement,
            "questionNumber": data.get(
                "questionNumber"
            ),
        }

        if replacement:
            result_user_spec[
                "replacementTopic"
            ] = data.get("flips")

        question_row.show = "true"
        self.db.session.commit()

        self.archive.record_question(
            question_id=question_row.id,
            question_type=(
                "theme"
                if replacement
                else "general"
            ),
            theme=(
                data.get("flips")
                if replacement
                else None
            ),
            author=author,
            player=data.get("player"),
            question_number=data.get(
                "questionNumber"
            ),
        )

        self.socketio.emit(
            "question_selected_user",
            result_user_spec,
            to=(
                f"{self.get_room_code()}"
                f":user:{data['player']}"
            ),
        )

        self.emit_tpv_spectator(
            "question_selected_spec",
            result_user_spec,
        )

        self.emit_tpv_host(
            "question_selected",
            result_host,
        )

    # ------------------------------------------------------------------
    # Результаты игроков и авторов
    # ------------------------------------------------------------------

    def add_result_author(self, data):
        amount = int(
            data.get("sum_author", 0) or 0
        )
        author_name = data.get(
            "name_author",
            "",
        )

        self.archive.record_author_result(
            author_name,
            amount,
        )

        author = self.db.session.scalar(
            self.db.select(self.UsersTpv).where(
                self.UsersTpv.username
                == data["name_author"]
            )
        )

        if author is None:
            author = self.UsersTpv()
            author.username = data["name_author"]
            author.flip = "false"
            author.money = data["sum_author"]
            author.approve = "false"
            author.flip_col = 0

            self.db.session.add(author)
            self.db.session.flush()
            self.db.session.commit()
        else:
            author.money = (
                author.money
                + data["sum_author"]
            )
            self.db.session.commit()

        self.emit_tpv_spectator(
            "tpv_author_win_user",
            {
                "amount": amount,
                "author": author_name,
            },
        )

    def add_result_player(self, data):
        amount = int(
            data.get("sum_player", 0) or 0
        )
        player_name = data.get(
            "name_player",
            "",
        )

        self.archive.record_player_result(
            player_name,
            amount,
        )

        user = self.db.session.scalar(
            self.db.select(self.UsersTpv).where(
                self.UsersTpv.username
                == data["name_player"]
            )
        )

        # Сохраняем прежнее предположение:
        # UsersTpv должен существовать.
        user.money = (
            user.money
            + data["sum_player"]
        )

        game_player = self.db.session.scalar(
            self.db.select(self.QueryTpv).where(
                self.QueryTpv.username
                == data["name_player"]
            )
        )

        if game_player is None:
            return

        game_player.money = (
            game_player.money
            + data["sum_player"]
        )
        game_player.status = "ended"

        self.db.session.commit()

        payload = {
            "amount": amount,
            "player": player_name,
        }

        self.socketio.emit(
            "tpv_player_win_user",
            payload,
            to=(
                f"{self.get_room_code()}"
                f":user:{data['name_player']}"
            ),
        )

        self.emit_tpv_spectator(
            "tpv_player_win_user",
            payload,
        )

        self.update_users_tpv()

    # ------------------------------------------------------------------
    # Синхронизация player / spectator
    # ------------------------------------------------------------------

    def tpv_update_data_user_spec(self, data):
        # v7 передаёт именованный state.
        # Старый exp по-прежнему поддерживается.
        result = data.get(
            "state",
            data.get("exp", {}),
        )

        self.socketio.emit(
            "update_data_user",
            result,
            to=(
                f"{self.get_room_code()}:user"
            ),
        )

        self.emit_tpv_spectator(
            "update_data_spec",
            result,
        )

    def _emit_visibility(
        self,
        *,
        player,
        user_event,
        user_value,
        spectator_event,
        spectator_value,
    ):
        self.socketio.emit(
            user_event,
            user_value,
            to=(
                f"{self.get_room_code()}"
                f":user:{player}"
            ),
        )

        self.emit_tpv_spectator(
            spectator_event,
            spectator_value,
        )

    def show_tree(self, data):
        self._emit_visibility(
            player=data["player"],
            user_event="show_tree_user",
            user_value="show",
            spectator_event="show_tree_spec",
            spectator_value="show",
        )

    def hide_tree(self, data):
        self._emit_visibility(
            player=data["player"],
            user_event="hide_tree_user",
            user_value="hide",
            spectator_event="hide_tree_spec",
            spectator_value="hide",
        )

    def show_stats(self, data):
        self._emit_visibility(
            player=data["player"],
            user_event="show_stats_user",
            user_value="show",
            spectator_event="show_stats_spec",
            spectator_value="show",
        )

    def hide_stats(self, data):
        self._emit_visibility(
            player=data["player"],
            user_event="hide_stats_user",
            user_value="hide",
            spectator_event="hide_stats_spec",
            spectator_value="hide",
        )

    # ------------------------------------------------------------------
    # Ответы
    # ------------------------------------------------------------------

    def _record_answer(
        self,
        answer_type,
        data,
    ):
        self.archive.record_answer(
            answer_type,
            player=data.get("player"),
            answer=data.get("answer"),
            question_number=data.get(
                "questionNumber"
            ),
            state=data.get("state"),
        )

    def tpv_correct(self, data):
        self._record_answer(
            "correct",
            data,
        )

        payload = {
            "answer": data.get("answer", ""),
            "questionNumber": data.get(
                "questionNumber"
            ),
            "correctCount": data.get(
                "correctCount"
            ),
            "round": data.get("round"),
            "roundFinished": bool(
                data.get(
                    "roundFinished",
                    False,
                )
            ),
        }

        self.socketio.emit(
            "tpv_correct_user",
            payload,
            to=(
                f"{self.get_room_code()}"
                f":user:{data['player']}"
            ),
        )

        self.emit_tpv_spectator(
            "tpv_correct_spec",
            payload,
        )

    def tpv_pass(self, data):
        self._record_answer(
            "pass",
            data,
        )

        payload = {
            "answer": data.get("answer", ""),
            "questionNumber": data.get(
                "questionNumber"
            ),
            "passCount": data.get(
                "passCount"
            ),
            "state": data.get("state"),
        }

        self.emit_tpv_player(
            data["player"],
            "tpv_pass_user",
            payload,
        )

        self.emit_tpv_spectator(
            "tpv_pass_spec",
            payload,
        )

    def tpv_flip(self, data):
        self._record_answer(
            "flip",
            data,
        )

        payload = {
            "answer": data.get("answer", ""),
            "questionNumber": data.get(
                "questionNumber"
            ),
            "replacement": True,
            "state": data.get("state"),
        }

        self.emit_tpv_player(
            data["player"],
            "tpv_flip_user",
            payload,
        )

        self.emit_tpv_spectator(
            "tpv_flip_spec",
            payload,
        )

    def tpv_wrong(self, data):
        self._record_answer(
            "wrong",
            data,
        )

        payload = {
            "answer": data.get("answer", ""),
            "questionNumber": data.get(
                "questionNumber"
            ),
            "wrongIndex": data.get(
                "wrongIndex"
            ),
            "state": data.get("state"),
        }

        self.emit_tpv_player(
            data["player"],
            "tpv_wrong_user",
            payload,
        )

        self.emit_tpv_spectator(
            "tpv_wrong_spec",
            payload,
        )

    # ------------------------------------------------------------------
    # Intro / credits / final results
    # ------------------------------------------------------------------

    def start_intro(self):
        self.emit_tpv_spectator(
            "start_intro",
            {"": ""},
        )

    def host_show_credits(self):
        self.socketio.emit(
            "show_credits_tpv",
            TPV_CREDITS_PAYLOAD,
            to=(
                f"{self.DEFAULT_ROOM_CODE}"
                ":spectator"
            ),
        )

    def show_results_tpv(self):
        self.archive.finalize()

        users = self.db.session.scalars(
            self.db.select(self.UsersTpv)
            .where(self.UsersTpv.money != 0)
            .order_by(
                self.desc(
                    self.UsersTpv.money
                )
            )
        ).all()

        result = [
            [user.username, user.money]
            for user in users
        ]

        self.emit_tpv_spectator(
            "show_results_tpv",
            result,
        )


def register_tpv_socket_handlers(
    runtime: Mapping[str, Any],
) -> dict[str, Any]:
    """Зарегистрировать TPV Socket.IO handlers.

    Совместимый публичный API функции сохранён.
    """
    missing = sorted(
        name
        for name in _REQUIRED_RUNTIME_NAMES
        if name not in runtime
    )

    if missing:
        raise RuntimeError(
            "Не удалось зарегистрировать TPV Socket.IO. "
            "Отсутствуют зависимости: "
            + ", ".join(missing)
        )

    handlers = TpvSocketHandlers(runtime)
    handlers.register()

    return {
        "update_users_tpv": (
            handlers.update_users_tpv
        ),
        "_emit_tpv_bong_to_player": (
            handlers._emit_tpv_bong_to_player
        ),
    }


__all__ = [
    "register_tpv_socket_handlers",
    "TPV_SOCKET_EVENTS",
]
