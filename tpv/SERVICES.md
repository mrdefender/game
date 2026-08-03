# TPV Services — этап 11.5

```text
tpv/services/
├── __init__.py
├── room.py
└── archive_snapshot.py
```

## `room.py`

Отвечает за:

- получение кода текущей комнаты;
- адресацию экрана ведущего;
- адресацию экрана зрителя;
- отправку всем игрокам;
- отправку конкретному игроку.

Старые имена `get_room_code`, `emit_tpv_host`,
`emit_tpv_spectator`, `emit_tpv_players` и `emit_tpv_player`
сохраняются в `game.py` как ссылки на методы сервиса.

## `archive_snapshot.py`

Отвечает за поставку данных в `TpvArchiveRuntime`:

- текущие игроки;
- итоговые результаты;
- количество вопросов;
- количество тем;
- активный Builder;
- ресурс базы;
- путь к SQLite.

Сервис не меняет данные и не содержит игровых Socket.IO-событий.
