# TPV — база данных SQLite и карта сопровождения

> Репозиторий: `https://github.com/mrdefender/game.git`  
> Ветка: `main`  
> Связанный документ: `tpv/ARCHITECTURE.md`
>
> Назначение: быстро понять, какие таблицы принадлежат TPV, кто их создаёт, кто читает и изменяет, какие связи существуют и что произойдёт при очистке или удалении данных.
>
> **Критично:** TPV и «Свободный слот» — независимые игры. Нельзя выполнять массовые SQL-операции по всей базе только по признаку того, что таблица находится в том же `game.db`.

---

# 1. Общая схема

TPV использует SQLite через Flask-SQLAlchemy.

Концептуально:

```text
Flask
  │
  ▼
SQLAlchemy
  │
  ▼
game.db
  │
  ├── таблицы TPV
  ├── таблицы TPV Editor
  ├── архив TPV
  ├── заявки TPV
  │
  └── таблицы других частей приложения
```

Основной принцип:

> `game.db` является физическим файлом базы, но логически внутри него существуют разные подсистемы.

Поэтому операция уровня:

```sql
DROP TABLE ...
DELETE FROM ...
VACUUM;
```

должна выполняться с пониманием конкретной подсистемы.

---

# 2. Где определяется схема

Основные ORM-модели TPV:

```text
tpv/models.py
```

Архив:

```text
tpv/archive.py
```

Заявки на участие:

```text
tpv/participation/models.py
```

Theme Engine и общие настройки Editor:

```text
tpv/theme_engine.py
```

Операционные настройки читают ту же таблицу настроек:

```text
tpv/editor/operational_settings.py
```

---

# 3. Таблицы, которые TPV считает обязательными

Текущий `tpv/diagnostics.py` делит обязательные таблицы на пять групп.

## Core

```text
questions_tpv / Questions_tpv*
query_tpv
users_tpv
```

## Editor

```text
tpv_editor_history
tpv_editor_settings
tpv_editor_themes
tpv_game_builds
```

## Archive

```text
tpv_game_events
tpv_game_players
tpv_game_questions
tpv_game_sessions
tpv_game_snapshots
tpv_game_themes
```

## Participation

```text
tpv_participation_applications
```

## Question applications

```text
tpv_question_applications
```

Итого:

```text
15 логически обязательных таблиц TPV
```

---

# 4. Важная несогласованность имени `questions_tpv`

В ORM:

```python
__tablename__ = "questions_tpv"
```

А в `diagnostics.py` текущий список `CORE_TABLES` содержит:

```python
"Questions_tpv"
```

То есть отличается регистр первой буквы.

## Почему это важно

SQLite в SQL-запросах обычно не различает регистр имени таблицы, однако:

```python
inspect(db.engine).get_table_names()
```

может вернуть имя именно в том виде, в котором оно записано в схеме.

Поэтому health-check может теоретически получить:

```text
questions_tpv
```

и считать отсутствующим:

```text
Questions_tpv
```

## Рекомендация

Привести `diagnostics.py` к фактическому имени ORM:

```python
"questions_tpv"
```

Но перед изменением проверить реальный production `game.db`:

```sql
SELECT name
FROM sqlite_master
WHERE type='table'
ORDER BY name;
```

---

# 5. Карта всех таблиц

| Таблица | Подсистема | Основной код |
|---|---|---|
| `users_tpv` | игроки/результаты | `tpv/models.py`, `editor/users.py` |
| `questions_tpv` | база вопросов | `tpv/models.py`, `editor/questions.py` |
| `query_tpv` | текущая очередь/игроки игры | `tpv/models.py`, runtime |
| `tpv_editor_history` | аудит Editor | `tpv/models.py`, `editor/history.py` |
| `tpv_game_builds` | наборы вопросов | `tpv/models.py`, `editor/builder.py` |
| `tpv_question_applications` | заявки на вопросы | `tpv/models.py`, `editor/question_applications.py` |
| `tpv_editor_themes` | визуальные темы Editor | `tpv/theme_engine.py` |
| `tpv_editor_settings` | настройки Editor/TPV | `tpv/theme_engine.py`, `editor/operational_settings.py` |
| `tpv_participation_applications` | заявки на участие | `tpv/participation/*` |
| `tpv_game_sessions` | архив: игровая сессия | `tpv/archive.py` |
| `tpv_game_players` | архив: игроки сессии | `tpv/archive.py` |
| `tpv_game_questions` | архив: вопросы сессии | `tpv/archive.py` |
| `tpv_game_themes` | архив: темы сессии | `tpv/archive.py` |
| `tpv_game_events` | архив: события | `tpv/archive.py` |
| `tpv_game_snapshots` | архив: снимок состояния | `tpv/archive.py` |

---

# 6. `users_tpv`

## ORM

```text
UsersTpv
```

## Назначение

Постоянная база игроков TPV и связанных с ними результатов/тем.

## Поля

```text
id          INTEGER PRIMARY KEY AUTOINCREMENT
username    VARCHAR(64) UNIQUE NOT NULL
flip        TEXT
money       INTEGER DEFAULT 0
approve     TEXT
flip_col    INTEGER DEFAULT 0
```

## Семантика

### `username`

Уникальное имя игрока.

### `flip`

Тема замены игрока.

### `money`

Результат/выигрыш или накопленное значение, используемое TPV.

### `approve`

Состояние допуска.

На текущем этапе это поле хранится как `TEXT`, а не как Boolean.

Это важно: нельзя автоматически считать, что там всегда:

```text
0 / 1
```

или SQLite boolean.

### `flip_col`

Количество вопросов, относящихся к теме игрока.

---

## Кто читает

Основные потребители:

```text
editor/users.py
editor/themes.py
dashboard/statistics
archive snapshot
runtime TPV
```

## Кто пишет

Прежде всего:

```text
editor/users.py
```

а также логика пересчёта допуска.

---

## Связи

Формального Foreign Key к `questions_tpv` нет.

Связь логическая:

```text
users_tpv.flip
      │
      │ строковое совпадение темы
      ▼
questions_tpv.flip
```

Это означает:

> удаление/переименование темы не контролируется SQLite внешним ключом.

Целостность должна обеспечиваться приложением.

---

## Можно ли очищать

### Полная очистка

Технически:

```sql
DELETE FROM users_tpv;
```

не уничтожит `questions_tpv`.

Но функционально исчезнет база игроков.

### Риск

Высокий.

После очистки:

- Editor потеряет игроков;
- темы, связанные только через игрока, могут выглядеть иначе;
- approve/flip_col исчезнут;
- исторический архив при этом останется.

### Архив

`tpv_game_players` не зависит от `users_tpv`.

Поэтому уже проведённые игры сохранят имена игроков в архиве.

---

# 7. `questions_tpv`

## ORM

```text
Questions_tpv
```

## Назначение

Главная рабочая база вопросов TPV.

## Поля

```text
id        INTEGER PRIMARY KEY AUTOINCREMENT
task      TEXT
answer    TEXT
comment   TEXT
author    TEXT
flip      TEXT
show      TEXT
```

---

## Семантика

### `task`

Текст вопроса.

### `answer`

Правильный ответ.

### `comment`

Комментарий/пояснение.

### `author`

Автор вопроса.

### `flip`

Тема замены.

Общий вопрос обычно определяется отсутствием конкретной темы или специальным значением в соответствии с текущей бизнес-логикой Editor.

### `show`

Флаг/состояние показа.

Хранится как текст.

---

## Кто читает

```text
editor/questions.py
editor/themes.py
editor/builder.py
dashboard.py
statistics.py
quality.py
runtime TPV
archive snapshot
```

## Кто пишет

```text
editor/questions.py
question application approval
importing.py
maintenance/administrative operations
```

---

## Связи

### С игроками

Логическая связь:

```text
questions_tpv.flip
       ↕
users_tpv.flip
```

### С Builder

`tpv_game_builds.question_ids_json` содержит ID вопросов в JSON.

Формального FK нет.

### С заявкой на вопрос

```text
tpv_question_applications.question_id
```

может указывать на созданный вопрос, но это не объявлено как FK в основной ORM-модели.

### С архивом

```text
tpv_game_questions.question_id
```

сохраняет ID оригинального вопроса, но архивная запись должна восприниматься как историческая сущность.

Формального FK к `questions_tpv` нет.

---

## Что будет, если удалить вопрос

```sql
DELETE FROM questions_tpv WHERE id = ?;
```

### Не удалится автоматически

- архив;
- Builder JSON;
- заявки;
- история Editor.

### Возможная проблема

Builder может сохранить ID уже несуществующего вопроса:

```json
[12, 19, 25]
```

если вопрос `19` удалён.

Поэтому удаление вопроса должно проходить через прикладную логику, которая умеет проверять зависимости.

---

# 8. `query_tpv`

## ORM

```text
QueryTpv
```

## Назначение

Рабочая очередь/состояние участников текущего TPV runtime.

## Поля

```text
id        INTEGER PRIMARY KEY AUTOINCREMENT
username  VARCHAR(64) UNIQUE NOT NULL
flip      TEXT
money     INTEGER DEFAULT 0
status    TEXT DEFAULT 'wait'
```

---

## Отличие от `users_tpv`

```text
users_tpv
= постоянная база игроков

query_tpv
= рабочая/текущая очередь игры
```

Не следует объединять эти понятия.

---

## Можно ли очищать

Из основных таблиц это одна из наиболее естественных таблиц для очистки между игровыми состояниями, **если текущий runtime действительно ожидает пустую очередь**.

Но очистку лучше выполнять через существующую игровую логику, а не вручную в SQLite во время активной игры.

---

## Риск очистки во время игры

Высокий:

- connected player может остаться в Socket.IO;
- DB state и runtime state разойдутся;
- host может видеть одно состояние, а база — другое.

---

# 9. `tpv_editor_history`

## ORM

```text
TpvEditorHistory
```

## Назначение

Аудит изменений TPV Editor.

## Поля

```text
id
created_at
entity_type
entity_id
action
title
details
before_json
after_json
can_revert
reverted_at
revert_history_id
```

---

## Индексы

ORM отмечает индексами:

```text
created_at
entity_type
entity_id
action
```

---

## Важная семантика

История может хранить:

```text
before_json
after_json
```

поэтому является не просто логом текста, а потенциальным источником данных для revert.

---

## Можно ли очищать

Да, но с последствиями.

Текущий `maintenance.py` при полном обслуживании удаляет записи истории:

```text
старше 365 дней
```

После этого выполняет:

```text
ANALYZE
VACUUM
PRAGMA integrity_check
```

---

## Что потеряется

- аудит;
- возможность анализа старых изменений;
- потенциальный revert старых записей.

Основная база вопросов/игроков не удаляется.

---

# 10. `tpv_game_builds`

## ORM

```text
TpvGameBuild
```

## Назначение

Сохранённые наборы/сборки вопросов для игр.

## Поля

```text
id
name
config_json
question_ids_json
is_active
created_at
updated_at
```

---

## Ключевое поле

```text
question_ids_json
```

Это JSON-массив ID вопросов.

Например:

```json
[10, 15, 31, 44]
```

---

## Почему это не полноценная relational-связь

SQLite не знает, что числа внутри JSON должны существовать в:

```text
questions_tpv.id
```

Поэтому:

```text
questions_tpv
      X
      │ нет FK
      ▼
tpv_game_builds.question_ids_json
```

Целостность Builder обеспечивает Python-код.

---

## Удаление Builder

Обычно безопаснее удаления вопросов.

Удаление конкретного `tpv_game_builds` не удаляет:

- вопросы;
- игроков;
- архив.

---

## Архивная ссылка

`tpv_game_sessions.builder_id` и `tpv_game_snapshots.builder_id` сохраняют ID Builder, но формального FK нет.

Если Builder удалить:

- архивная игра останется;
- `builder_id` может стать ссылкой на уже несуществующий Builder.

Это допустимо как историческое значение, но UI должен уметь это отображать.

---

# 11. `tpv_question_applications`

## ORM

```text
TpvQuestionApplication
```

## Назначение

Очередь входящих заявок на вопросы до/после модерации.

## Поля

```text
id
author
task
answer
comment
flip
status
reject_reason
created_at
reviewed_at
reviewed_by
question_id
```

---

## Статусы

Типично используются:

```text
pending
approved
rejected
```

---

## `question_id`

После одобрения может храниться ID вопроса, созданного в `questions_tpv`.

Формального FK нет.

---

## Можно ли очищать

Да, обработанные заявки являются кандидатами для cleanup.

Текущий `maintenance.py` при полном обслуживании удаляет:

```text
approved
rejected
```

и сохраняет pending.

---

## Последствия

После удаления обработанных заявок:

- созданные нормальные вопросы остаются;
- `questions_tpv` не очищается;
- исчезает история самой заявки.

---

# 12. `tpv_editor_themes`

## ORM

Определяется внутри:

```text
tpv/theme_engine.py
```

Модель:

```text
EditorTheme
```

## Назначение

Визуальные темы TPV Editor.

**Не путать с игровыми темами вопросов.**

## Поля

```text
id
slug UNIQUE
name
description
is_system
variables_json
created_at
updated_at
```

---

## `variables_json`

JSON с CSS-переменными.

Например концептуально:

```json
{
  "--bg": "...",
  "--panel": "...",
  "--text": "...",
  "--cyan": "..."
}
```

---

## System presets

Theme Engine содержит системные presets и умеет seed'ить их в таблицу.

Поэтому полная очистка таблицы может быть частично восстановлена через seed/create logic.

---

## Можно ли удалять

Пользовательские темы — через API Theme Engine.

Системные темы вручную удалять не рекомендуется.

---

# 13. `tpv_editor_settings`

## ORM

Определяется в:

```text
tpv/theme_engine.py
```

Модель:

```text
EditorSetting
```

## Поля

```text
id
key UNIQUE
value
updated_at
```

Это универсальное key/value-хранилище.

---

# 14. Что сейчас хранится в `tpv_editor_settings`

По текущему коду как минимум используются следующие ключи.

## `current_theme_slug`

Текущая визуальная тема Editor.

Пример:

```text
tpv-dark
```

## `required_flip_questions`

Требуемое число вопросов для допуска игрока.

Default текущего operational service:

```text
5
```

Допустимый диапазон:

```text
1..100
```

## `public_participation_form_enabled`

Включена ли публичная форма заявок на участие.

Строковое значение:

```text
true / false
```

## `public_question_form_enabled`

Включена ли публичная форма заявок на вопросы.

---

# 15. Почему `tpv_editor_settings` особенно критична

Эта таблица используется двумя подсистемами:

```text
theme_engine.py
        │
        ├── current_theme_slug
        │
        ▼
tpv_editor_settings
        ▲
        │
operational_settings.py
        ├── required_flip_questions
        ├── public_participation_form_enabled
        └── public_question_form_enabled
```

Поэтому название таблицы несколько уже не соответствует реальной роли:

```text
tpv_editor_settings
```

фактически содержит и визуальные, и рабочие настройки TPV.

---

## Что произойдёт при очистке

Если удалить строки:

```sql
DELETE FROM tpv_editor_settings;
```

код начнёт использовать defaults там, где они предусмотрены.

В частности:

```text
required_flip_questions -> 5
public_participation_form_enabled -> true
public_question_form_enabled -> true
```

Theme Engine также имеет fallback для текущей темы.

Но это не значит, что ручная очистка является рекомендуемой операцией.

---

# 16. `tpv_participation_applications`

## ORM

```text
TpvParticipationApplication
```

## Файл

```text
tpv/participation/models.py
```

## Назначение

Публичные заявки на участие в TPV.

## Поля

```text
id
display_name
theme
status
theme_status
public_comment
editor_comment
created_from
created_at
updated_at
```

---

## Кто пишет

```text
participation/routes.py
participation/services.py
editor/participation_applications.py
```

---

## Что хранит

### Публичные данные

```text
display_name
theme
status
theme_status
public_comment
```

### Только Editor

```text
editor_comment
created_from
```

---

## Связи

Формального FK к:

```text
users_tpv
questions_tpv
```

нет.

Тема заявки является текстом.

---

## Можно ли очищать

Да, как отдельную очередь заявок, если это явно административно разрешённая операция.

Не удаляет:

- игроков;
- вопросы;
- архив.

Но пользователь больше не сможет проверить старую заявку по ID.

---

# 17. Архив TPV

Архив состоит из шести таблиц:

```text
tpv_game_sessions
    ├── tpv_game_players
    ├── tpv_game_questions
    ├── tpv_game_themes
    ├── tpv_game_events
    └── tpv_game_snapshots
```

Это наиболее явно relational-часть TPV.

---

# 18. `tpv_game_sessions`

## ORM

```text
GameSession
```

## Назначение

Одна проведённая/проводимая игровая сессия.

## Поля

```text
id
title
season
builder_id
status
started_at
ended_at
duration_seconds
winner
winner_money
players_count
general_questions
theme_questions
correct_answers
wrong_answers
ended_normally
tpv_version
editor_version
notes
created_at
```

---

## Индексы

```text
started_at
winner
season
```

---

## Родительская таблица

Все дочерние архивные записи связаны через:

```text
session_id
```

---

# 19. `tpv_game_players`

## Назначение

Снимок участников конкретной архивной игры.

## Поля

```text
id
session_id FK
username
theme
money
correct_answers
wrong_answers
place
```

## FK

```text
session_id
  -> tpv_game_sessions.id
  ON DELETE CASCADE
```

## Важно

Это историческая копия данных.

Удаление игрока из `users_tpv` не должно удалять его из старой игры.

---

# 20. `tpv_game_questions`

## Назначение

Вопросы, использованные в конкретной игре.

## Поля

```text
id
session_id FK
question_id
question_type
theme
author
correct
```

## FK

Есть только:

```text
session_id -> tpv_game_sessions.id
```

`question_id` не объявлен FK к рабочей базе вопросов.

Это правильное решение для истории:

> архив не должен ломаться только потому, что исходный вопрос позже удалили.

---

# 21. `tpv_game_themes`

## Назначение

Статистика тем в игровой сессии.

## Поля

```text
id
session_id FK
theme
used_count
correct_count
wrong_count
```

## FK

```text
session_id
 -> tpv_game_sessions.id
 ON DELETE CASCADE
```

---

# 22. `tpv_game_events`

## Назначение

Хронология событий игры.

## Поля

```text
id
session_id FK
event_time
event_type
payload
```

`payload` хранится как JSON-текст.

## Индекс

Составной:

```text
session_id + event_time
```

Это удобно для восстановления timeline.

---

# 23. `tpv_game_snapshots`

## Назначение

Один итоговый/ресурсный snapshot игровой сессии.

## Поля

```text
id
session_id FK UNIQUE
questions_total
themes_total
database_size
resource_games
builder_id
```

## Особенность

```text
session_id UNIQUE
```

То есть на одну сессию предусмотрен один snapshot.

---

# 24. Каскадное удаление архива

Архивные дочерние таблицы используют:

```text
ON DELETE CASCADE
```

и SQLAlchemy relationships:

```text
cascade="all, delete-orphan"
passive_deletes=True
```

Поэтому логическая операция:

```text
DELETE GameSession
```

должна удалить связанные:

```text
GamePlayer
GameQuestion
GameTheme
GameEvent
GameSnapshot
```

---

## Важное замечание SQLite

Чтобы database-level:

```text
ON DELETE CASCADE
```

реально работал в SQLite, соединение должно иметь:

```sql
PRAGMA foreign_keys = ON;
```

SQLAlchemy ORM cascade дополнительно помогает при ORM-удалении.

Перед использованием прямого SQL желательно проверить:

```sql
PRAGMA foreign_keys;
```

Ожидаемый результат:

```text
1
```

---

# 25. ER-схема TPV

```text
users_tpv
   │
   │ logical: flip
   ▼
questions_tpv
   │
   ├──── logical IDs ────► tpv_game_builds.question_ids_json
   │
   ├──── logical ID ─────► tpv_question_applications.question_id
   │
   └──── historical ID ──► tpv_game_questions.question_id


tpv_editor_settings
   ├── current_theme_slug ──logical──► tpv_editor_themes.slug
   ├── required_flip_questions
   ├── public_participation_form_enabled
   └── public_question_form_enabled


tpv_game_sessions
   │
   ├──< tpv_game_players
   ├──< tpv_game_questions
   ├──< tpv_game_themes
   ├──< tpv_game_events
   └──1 tpv_game_snapshots


tpv_participation_applications
   independent queue

query_tpv
   runtime/current-game state
```

---

# 26. Формальные и логические связи

Очень важно различать.

## Формальные FK

В текущем TPV явно определены прежде всего в архиве:

```text
archive child.session_id
    -> tpv_game_sessions.id
```

## Логические связи

Не контролируются SQLite:

```text
users_tpv.flip
    <-> questions_tpv.flip

tpv_game_builds.question_ids_json
    -> questions_tpv.id

tpv_question_applications.question_id
    -> questions_tpv.id

tpv_game_questions.question_id
    -> historical questions_tpv.id

tpv_editor_settings.current_theme_slug
    -> tpv_editor_themes.slug
```

---

# 27. Почему логические связи опаснее

При:

```sql
DELETE FROM questions_tpv WHERE id=10;
```

SQLite не скажет:

> вопрос используется Builder.

Потому что ID лежит внутри JSON.

Так же SQLite не скажет:

> тема назначена игроку.

Потому что связь сделана строкой.

Поэтому ручное изменение БД обходным SQL должно быть исключением.

---

# 28. Матрица риска очистки

| Таблица | Риск очистки | Что потеряется |
|---|---:|---|
| `query_tpv` | средний | текущая очередь игры |
| `tpv_editor_history` | средний | аудит/revert history |
| `tpv_question_applications` | средний | история заявок |
| `tpv_participation_applications` | средний | заявки и проверка статуса |
| `tpv_game_builds` | высокий | сохранённые наборы |
| `tpv_editor_themes` | средний | темы интерфейса |
| `tpv_editor_settings` | высокий | runtime/visual settings |
| `users_tpv` | высокий | база игроков |
| `questions_tpv` | критический | рабочая база вопросов |
| `tpv_game_sessions` | критический | весь архив игр через cascade |
| `tpv_game_players` | высокий | часть архива |
| `tpv_game_questions` | высокий | часть архива |
| `tpv_game_themes` | высокий | часть архива |
| `tpv_game_events` | высокий | timeline архива |
| `tpv_game_snapshots` | высокий | snapshot архива |

---

# 29. Что разрешено считать «мягкой очисткой»

Под мягкой очисткой здесь понимается операция, не удаляющая рабочую базу вопросов/игроков.

Примеры:

```text
обработанные question applications
старые editor history entries
старые participation applications — только по явной команде
runtime queue — между играми через штатную игровую логику
```

Текущий Full Maintenance уже реализует:

```text
backup
  ↓
удаление approved/rejected question applications
  ↓
удаление history старше 365 дней
  ↓
ANALYZE
  ↓
VACUUM
  ↓
PRAGMA integrity_check
```

Это хороший шаблон безопасной maintenance-операции:

> сначала backup, потом удаление.

---

# 30. `ANALYZE`

SQLite:

```sql
ANALYZE;
```

обновляет статистику, которую query planner использует при выборе стратегии запросов.

Не удаляет пользовательские данные.

Риск низкий.

---

# 31. `VACUUM`

SQLite:

```sql
VACUUM;
```

пересобирает файл базы.

Используется для:

- возврата свободного места;
- дефрагментации файла;
- компактной пересборки SQLite.

Не является удалением строк само по себе.

Но требует свободного места на диске для операции пересборки.

---

# 32. `PRAGMA integrity_check`

Проверка:

```sql
PRAGMA integrity_check;
```

Ожидаемый нормальный результат:

```text
ok
```

Это read-only диагностическая проверка структуры SQLite.

---

# 33. Backup перед maintenance

Текущий maintenance flow делает backup до destructive cleanup.

Это правило следует сохранить для всех будущих операций:

```text
Destructive operation
        │
        ▼
      BACKUP
        │
        ▼
     DELETE/DDL
        │
        ▼
    integrity_check
```

---

# 34. Проверка схемы вручную

## Список таблиц

```sql
SELECT name
FROM sqlite_master
WHERE type='table'
ORDER BY name;
```

## Схема конкретной таблицы

```sql
SELECT sql
FROM sqlite_master
WHERE type='table'
  AND name='users_tpv';
```

## Колонки

```sql
PRAGMA table_info(users_tpv);
```

## Индексы

```sql
PRAGMA index_list(users_tpv);
```

## Foreign Keys

```sql
PRAGMA foreign_key_list(tpv_game_players);
```

---

# 35. Быстрая диагностика количества строк

```sql
SELECT COUNT(*) FROM users_tpv;
SELECT COUNT(*) FROM questions_tpv;
SELECT COUNT(*) FROM query_tpv;
SELECT COUNT(*) FROM tpv_game_builds;
SELECT COUNT(*) FROM tpv_question_applications;
SELECT COUNT(*) FROM tpv_participation_applications;
SELECT COUNT(*) FROM tpv_game_sessions;
```

Это безопасные read-only запросы.

---

# 36. Проверка orphan Builder IDs

Поскольку Builder хранит JSON, обычный FK отсутствует.

Если SQLite собран с JSON1, можно диагностировать orphan IDs примерно так:

```sql
SELECT
    b.id AS build_id,
    b.name,
    value AS missing_question_id
FROM tpv_game_builds AS b,
     json_each(b.question_ids_json)
LEFT JOIN questions_tpv AS q
       ON q.id = CAST(value AS INTEGER)
WHERE q.id IS NULL;
```

Перед автоматическим исправлением обязательно делать backup.

---

# 37. Проверка архивных orphan rows

Должно возвращать 0 строк:

```sql
SELECT p.*
FROM tpv_game_players p
LEFT JOIN tpv_game_sessions s
  ON s.id = p.session_id
WHERE s.id IS NULL;
```

Аналогично проверить:

```text
tpv_game_questions
tpv_game_themes
tpv_game_events
tpv_game_snapshots
```

---

# 38. Проверка настроек допуска

Текущий порог:

```sql
SELECT key, value, updated_at
FROM tpv_editor_settings
WHERE key = 'required_flip_questions';
```

Игроки:

```sql
SELECT
    id,
    username,
    flip,
    flip_col,
    approve
FROM users_tpv
ORDER BY username;
```

Если порог:

```text
12
```

а у игрока:

```text
flip_col = 5
```

но `approve` остаётся положительным, проблема уже не в хранении настройки, а в цепочке пересчёта:

```text
operational_settings.py
        ↓
runtime_threshold.py
        ↓
admission.py
        ↓
editor/users.py
        ↓
users_tpv.approve
```

---

# 39. Проверка тем и количества вопросов

Пример read-only диагностики:

```sql
SELECT
    flip,
    COUNT(*) AS questions_count
FROM questions_tpv
GROUP BY flip
ORDER BY questions_count DESC;
```

Можно сравнить с:

```sql
SELECT
    username,
    flip,
    flip_col,
    approve
FROM users_tpv;
```

Если `flip_col` не совпадает с реальным COUNT, требуется прикладной recalculation.

---

# 40. Не исправлять `flip_col` триггером SQLite без необходимости

Можно было бы сделать DB trigger, но текущая архитектура держит бизнес-логику в Python.

Добавление триггера создаст два источника истины:

```text
Python
+
SQLite trigger
```

Поэтому предпочтительно:

```text
questions change
   ↓
Python recalculation service
   ↓
users_tpv.flip_col / approve
```

---

# 41. Индексы

## Явные core/editor индексы

SQLAlchemy создаёт индексы для полей, где указано:

```python
index=True
```

Например в истории:

```text
created_at
entity_type
entity_id
action
```

В Builder:

```text
is_active
updated_at
```

В заявках:

```text
author
flip
status
created_at
question_id
```

В participation:

```text
status
theme_status
created_from
created_at
```

---

# 42. Архивные индексы

Определены явно.

## `tpv_game_sessions`

```text
started_at
winner
season
```

## `tpv_game_players`

```text
session_id
username
```

## `tpv_game_questions`

```text
session_id
question_id
```

## `tpv_game_themes`

```text
session_id
theme
```

## `tpv_game_events`

составной:

```text
session_id, event_time
```

---

# 43. UNIQUE constraints

Особенно важные:

```text
users_tpv.username UNIQUE
query_tpv.username UNIQUE

tpv_game_builds
  — name НЕ unique по текущей ORM

tpv_editor_themes.slug UNIQUE
tpv_editor_settings.key UNIQUE

tpv_game_snapshots.session_id UNIQUE
```

---

# 44. JSON-поля

В TPV активно используется JSON внутри TEXT.

Основные:

```text
tpv_editor_history.before_json
tpv_editor_history.after_json

tpv_game_builds.config_json
tpv_game_builds.question_ids_json

tpv_editor_themes.variables_json

tpv_game_events.payload
```

SQLite не валидирует их как JSON на уровне текущих ORM-моделей.

Поэтому приложение должно корректно сериализовать данные.

---

# 45. Даты

Используются Python `datetime`.

Обратить внимание, что в разных исторических модулях встречаются:

```text
datetime.utcnow
datetime.now
```

То есть база может содержать naive datetime без timezone metadata.

Не стоит без отдельного миграционного плана переводить часть таблиц на timezone-aware timestamps, оставляя остальные без изменений.

---

# 46. Миграции

На текущем проекте схема развивалась постепенно, а SQLite не получает полноценную автоматическую миграцию только от изменения ORM.

Правило:

```text
изменили model.py
    ≠
изменили production game.db
```

При добавлении:

```text
column
index
constraint
table
```

нужен отдельный migration path.

---

# 47. Безопасный шаблон SQLite migration

Принцип:

```text
1. backup
2. PRAGMA integrity_check
3. проверить текущую schema
4. выполнить idempotent migration
5. проверить schema
6. проверить данные
7. PRAGMA integrity_check
8. запустить приложение
9. /tpv/api/health
10. smoke test TPV
```

---

# 48. `CREATE TABLE IF NOT EXISTS` недостаточно для новой колонки

Например если таблица уже есть:

```sql
CREATE TABLE IF NOT EXISTS users_tpv (... новая колонка ...);
```

не добавит новую колонку.

Для существующей таблицы нужен:

```sql
ALTER TABLE users_tpv ADD COLUMN ...;
```

или controlled rebuild для изменений, которые SQLite не поддерживает простым ALTER.

---

# 49. Проверка существования колонки

Перед idempotent migration можно использовать:

```sql
PRAGMA table_info(users_tpv);
```

В Python — SQLAlchemy inspector.

---

# 50. Health endpoint

TPV предоставляет:

```text
GET /tpv/api/health
```

Он проверяет:

- доступ к БД;
- наличие обязательных таблиц;
- состояние групп TPV.

Это должно быть первой проверкой после deployment/migration.

---

# 51. Что health endpoint НЕ проверяет

Наличие таблицы ещё не означает целостность содержимого.

Health не гарантирует:

- правильный `flip_col`;
- отсутствие orphan Builder IDs;
- валидный JSON;
- отсутствие duplicate logical themes;
- корректность approve;
- правильность архивных counters.

Для этого нужны quality/maintenance checks.

---

# 52. Два уровня диагностики

## Schema health

```text
/tpv/api/health
PRAGMA table_info
sqlite_master
```

## Data health

```text
editor/quality.py
custom SELECT checks
business recalculation
archive consistency
```

Не смешивать.

---

# 53. Практическая карта «кто пишет»

| Таблица | Основные writers |
|---|---|
| `users_tpv` | `editor/users.py`, recalculation |
| `questions_tpv` | `editor/questions.py`, import, approved applications |
| `query_tpv` | runtime TPV |
| `tpv_editor_history` | editor modules/history service |
| `tpv_game_builds` | `editor/builder.py` |
| `tpv_question_applications` | public/application API + moderation |
| `tpv_editor_themes` | `theme_engine.py` |
| `tpv_editor_settings` | `theme_engine.py`, `operational_settings.py` |
| `tpv_participation_applications` | participation service + moderation |
| `tpv_game_sessions` | archive runtime/archive API |
| `tpv_game_players` | archive runtime |
| `tpv_game_questions` | archive runtime |
| `tpv_game_themes` | archive runtime |
| `tpv_game_events` | archive runtime |
| `tpv_game_snapshots` | archive runtime |

---

# 54. Практическая карта «кто читает»

| Таблица | Основные readers |
|---|---|
| `users_tpv` | Editor, runtime, dashboard, statistics |
| `questions_tpv` | Editor, Builder, runtime, statistics |
| `query_tpv` | runtime/host/game logic |
| `tpv_editor_history` | history/maintenance |
| `tpv_game_builds` | Builder, runtime, archive snapshot |
| `tpv_question_applications` | moderation/maintenance |
| `tpv_editor_themes` | Theme Engine |
| `tpv_editor_settings` | Theme Engine, operational settings, public route switches |
| `tpv_participation_applications` | public status + moderation |
| archive tables | archive UI/API/statistics |

---

# 55. Что не делать вручную

Не рекомендуется во время работающего сервера:

```sql
UPDATE users_tpv ...
DELETE FROM query_tpv ...
DELETE FROM questions_tpv ...
DROP TABLE ...
```

через внешний sqlite client без понимания активной SQLAlchemy session.

Причина:

```text
SQLite изменился
   │
   X
SQLAlchemy/runtime cache/state
```

Сервер может продолжить работать со старым объектом или несогласованным runtime state.

---

# 56. Когда прямой SQL оправдан

- controlled migration;
- аварийное восстановление;
- read-only диагностика;
- maintenance при остановленном приложении;
- специально подготовленный SQL-скрипт этапа разработки.

При destructive SQL:

```text
остановить приложение
backup
SQL
integrity_check
запуск
health
smoke test
```

---

# 57. Backup-файлы

Backup subsystem должен восприниматься как часть процедуры работы с базой, а не опциональная косметика.

Особенно перед:

- migration;
- cleanup;
- import;
- mass edit;
- restore;
- ручным SQL.

---

# 58. Restore

Restore заменяет состояние всей SQLite-базы, а не одной таблицы TPV.

Это означает:

> если `game.db` содержит данные других подсистем приложения, восстановление старого файла откатывает и их.

Поэтому restore — операция уровня всего DB файла.

---

# 59. TPV и «Свободный слот»

Хотя данные могут находиться в одном `game.db`, нельзя считать:

```text
backup TPV
=
backup только TPV
```

Если backup копирует весь SQLite-файл, он содержит все таблицы файла.

То же относится к restore.

Поэтому restore после TPV-ошибки должен проверяться также запуском «Свободного слота».

---

# 60. Проверка после DB-изменения

Минимальный checklist:

```text
[ ] backup создан
[ ] SQLite открывается
[ ] PRAGMA integrity_check = ok
[ ] обязательные TPV таблицы существуют
[ ] /tpv/api/health = healthy
[ ] users_tpv читается
[ ] questions_tpv читается
[ ] Builder открывается
[ ] Dashboard открывается
[ ] заявки на вопросы работают
[ ] заявки на участие работают
[ ] operational settings читаются
[ ] порог допуска пересчитывается
[ ] TPV host запускается
[ ] TPV player подключается
[ ] TPV spectator подключается
[ ] архив создаётся
[ ] существующий архив открывается
[ ] backup/maintenance открываются
[ ] «Свободный слот» запускается и не повреждён
```

---

# 61. Рекомендуемые дальнейшие улучшения DB-слоя

## 61.1 Исправить регистр `questions_tpv` в diagnostics

Привести обязательное имя к фактическому ORM/schema.

## 61.2 Добавить schema version

Полезна отдельная таблица:

```text
tpv_schema_version
```

или общий migration framework.

Тогда приложение сможет точно знать:

```text
какую migration уже применили
```

а не угадывать только по наличию колонок.

## 61.3 Документировать значения `approve`

Поле сейчас `TEXT`.

Стоит явно закрепить допустимые значения.

## 61.4 Документировать семантику `show`

Тоже `TEXT`, и контракт должен быть описан.

## 61.5 Добавить automated consistency checks

Особенно:

```text
Builder orphan IDs
flip_col vs actual questions count
current_theme_slug exists
archive orphan rows
application.question_id exists when approved
JSON validity
```

---

# 62. Рекомендуемые SQL read-only проверки

## Общее состояние

```sql
SELECT name
FROM sqlite_master
WHERE type='table'
ORDER BY name;
```

## Integrity

```sql
PRAGMA integrity_check;
```

## Foreign keys enabled

```sql
PRAGMA foreign_keys;
```

## Количество вопросов

```sql
SELECT COUNT(*) FROM questions_tpv;
```

## Количество игроков

```sql
SELECT COUNT(*) FROM users_tpv;
```

## Активный порог допуска

```sql
SELECT value
FROM tpv_editor_settings
WHERE key='required_flip_questions';
```

## Архив

```sql
SELECT COUNT(*) FROM tpv_game_sessions;
```

## Pending заявки

```sql
SELECT COUNT(*)
FROM tpv_question_applications
WHERE status='pending';
```

---

# 63. Основная ментальная модель

```text
WORKING DATA
├── users_tpv
├── questions_tpv
├── query_tpv
└── tpv_game_builds

EDITOR SUPPORT
├── tpv_editor_history
├── tpv_editor_settings
└── tpv_editor_themes

INCOMING QUEUES
├── tpv_question_applications
└── tpv_participation_applications

IMMUTABLE/HISTORICAL DATA
└── tpv_game_sessions
    ├── tpv_game_players
    ├── tpv_game_questions
    ├── tpv_game_themes
    ├── tpv_game_events
    └── tpv_game_snapshots
```

При поиске ошибки сначала определить, к какой группе относится проблема.

---

# 64. Правило обслуживания

Самое безопасное правило:

> **Не исправлять данные SQL-запросом, пока не понятно, какой Python-модуль считает себя источником истины для этих данных.**

Пример:

```text
approve неверный
```

Не начинать с:

```sql
UPDATE users_tpv SET approve = ...
```

Сначала:

```text
operational setting
     ↓
runtime threshold
     ↓
admission
     ↓
users recalculation
```

Иначе следующий автоматический пересчёт снова перезапишет ручную правку.

---

# 65. Статус документа

Документ составлен по текущей структуре `main`.

Главные источники схемы:

```text
tpv/models.py
tpv/archive.py
tpv/participation/models.py
tpv/theme_engine.py
tpv/editor/operational_settings.py
tpv/diagnostics.py
tpv/editor/maintenance.py
```

При изменении таблицы одновременно обновлять:

```text
ORM
migration/SQL
diagnostics
DATABASE.md
backup/restore assumptions
quality checks
```

Так схема TPV останется поддерживаемой и после следующих этапов рефакторинга.
