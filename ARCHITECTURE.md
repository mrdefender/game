# TPV — архитектура и карта сопровождения

> Репозиторий: `https://github.com/mrdefender/game.git`  
> Ветка: `main`  
> Назначение документа: быстро понять, какой модуль TPV за что отвечает, откуда вызывается, с какими данными работает и где искать неисправность.
>
> **Важно:** TPV и «Свободный слот» — две независимые игры. Изменения TPV не должны затрагивать игровую логику «Свободного слота».

---

## 1. Главный принцип архитектуры

TPV постепенно вынесен из большого `game.py` в самостоятельный пакет `tpv/`.

Правильное направление зависимостей:

```text
game.py
  │
  └── подключает TPV
        │
        ▼
tpv/application.py
  │
  ├── основные модели
  ├── TPV Editor
  ├── заявки на участие
  ├── архив игр
  ├── Theme Engine
  ├── backup/diagnostics
  ├── сервисы
  └── Socket.IO runtime
```

Главное правило сопровождения:

```text
game.py
  = оболочка общего приложения и точка подключения TPV

tpv/
  = внутренняя реализация TPV
```

Новую внутреннюю функциональность TPV желательно добавлять в `tpv/`, а не возвращать обратно в `game.py`.

---

## 2. Структура пакета TPV

Актуальная структура `tpv/`:

```text
tpv/
├── __init__.py
├── admission.py
├── application.py
├── archive.py
├── archive_runtime.py
├── backup_center.py
├── bootstrap.py
├── diagnostics.py
├── editor_routes.py
├── media_routes.py
├── models.py
├── socket_handlers.py
├── theme_engine.py
│
├── editor/
│   ├── __init__.py
│   ├── builder.py
│   ├── dashboard.py
│   ├── exporting.py
│   ├── history.py
│   ├── importing.py
│   ├── maintenance.py
│   ├── operational_settings.py
│   ├── participation_applications.py
│   ├── permissions.py
│   ├── quality.py
│   ├── question_applications.py
│   ├── questions.py
│   ├── registry.py
│   ├── responses.py
│   ├── runtime_threshold.py
│   ├── statistics.py
│   ├── table_utils.py
│   ├── themes.py
│   ├── users.py
│   └── validators.py
│
├── participation/
│   ├── __init__.py
│   ├── constants.py
│   ├── models.py
│   ├── routes.py
│   ├── services.py
│   └── templates/
│
└── services/
    ├── __init__.py
    ├── archive_snapshot.py
    └── room.py
```

Также в `tpv/` находятся исторические документы `README.md`, `APPLICATION.md`, `MODELS.md`, `ROUTES.md`, `SERVICES.md`, `SOCKETS.md`.

Часть этих документов отражает промежуточные этапы рефакторинга и может не соответствовать текущей архитектуре. Этот файл следует считать верхнеуровневой картой текущей структуры.

---

# 3. Запуск TPV

## 3.1 `game.py`

`game.py` остаётся общей точкой запуска Flask-приложения.

Его задача по отношению к TPV:

1. создать/иметь Flask app;
2. предоставить SQLAlchemy;
3. предоставить Socket.IO;
4. передать TPV необходимые зависимости;
5. вызвать регистрацию TPV;
6. сохранить совместимость со старым кодом.

Концептуально:

```python
from tpv.application import register_tpv_application

exports = register_tpv_application(
    runtime=...,
    user_mixin=...
)
```

После этого TPV получает доступ к инфраструктуре приложения, не импортируя `game.py` обратно.

### Почему это важно

Если `tpv/*` начинает импортировать `game.py`, возникает риск:

```text
game.py
  -> tpv.application
       -> game.py
```

то есть циклического импорта.

Поэтому зависимость должна идти сверху вниз:

```text
game.py -> tpv/*
```

а не в обе стороны.

---

# 4. `tpv/application.py`

## Назначение

Главная **точка сборки TPV**.

Это наиболее важный файл при запуске всей подсистемы TPV.

Он связывает между собой:

- основные модели;
- публичные заявки;
- TPV Editor;
- архив;
- Theme Engine;
- диагностику;
- backup;
- сервисы;
- архивный runtime;
- Socket.IO handlers.

## Модель работы

```text
game.py
  │
  ▼
register_tpv_application()
  │
  ├─ create/register models
  ├─ register participation
  ├─ register editor
  ├─ register archive
  ├─ register theme engine
  ├─ register diagnostics
  ├─ create services
  ├─ create archive runtime
  └─ register socket handlers
```

## Когда смотреть этот файл

Если:

- TPV вообще не стартует;
- модуль создан, но его маршруты не зарегистрированы;
- возникает ImportError при запуске TPV;
- новый subsystem не подключается;
- зависимость существует, но не передана в другой компонент.

## Что здесь НЕ должно жить

Не стоит размещать непосредственно:

- CRUD вопросов;
- игровую логику;
- HTML;
- сложные SQL-запросы;
- обработку отдельных Socket.IO событий.

`application.py` должен в первую очередь **собирать**, а не реализовывать.

---

# 5. `tpv/bootstrap.py`

## Назначение

Исторический инфраструктурный bootstrap, появившийся раньше полноценного `application.py`.

Использовался для регистрации отдельных инфраструктурных компонентов TPV Editor, прежде всего:

- Archive;
- Theme Engine.

## Сейчас

После появления `application.py` его роль стала уже.

Не следует воспринимать его как главный bootstrap всей TPV-системы.

Главная точка сборки сейчас:

```text
tpv/application.py
```

---

# 6. `tpv/models.py`

## Назначение

Основные ORM-модели TPV.

Файл отделяет описание таблиц TPV от `game.py`.

Основные модели включают:

```text
UsersTpv
Questions_tpv
QueryTpv
TpvEditorHistory
TpvGameBuild
TpvQuestionApplication
```

## Основные сущности

### `UsersTpv`

Игрок/результат TPV.

Типичные данные:

```text
id
username
flip
money
approve
flip_col
```

Где:

- `username` — имя игрока;
- `flip` — тема замены;
- `money` — результат;
- `approve` — допуск;
- `flip_col` — число подготовленных вопросов по теме.

### `Questions_tpv`

Основная база вопросов.

Типичные поля:

```text
id
task
answer
comment
author
flip
show
```

### `QueryTpv`

Игроки/очередь текущей игры.

Типично содержит:

```text
id
username
flip
money
status
```

### `TpvEditorHistory`

История действий TPV Editor.

### `TpvGameBuild`

Набор/сборка вопросов для игры.

### `TpvQuestionApplication`

Заявка на добавление вопроса.

## Когда смотреть

Если:

- не хватает поля;
- ORM падает;
- данные сохраняются не туда;
- ошибка `no such table`;
- ошибка `no such column`;
- нужно изменить модель основной сущности TPV.

## Важно для SQLite

Изменение Python-класса модели **не мигрирует автоматически существующую SQLite-базу**.

Если добавляется колонка или таблица, отдельно должна быть предусмотрена миграция/SQL-скрипт/инициализация.

---

# 7. `tpv/admission.py`

## Назначение

Центральная логика **допуска игрока по количеству вопросов темы**.

Ключевые функции:

```python
get_required_flip_questions(context=None)
check_player_admission(flip_col, context=None)
```

## Логика

```text
настройка требуемого количества вопросов
             │
             ▼
get_required_flip_questions()
             │
             ▼
check_player_admission(flip_col)
             │
             ├── approved = True
             └── approved = False
```

`check_player_admission()` сравнивает фактическое число вопросов игрока с текущим порогом.

Результат содержит примерно:

```text
approved
flip_col
required_questions
message
```

## Почему этот файл важен

Логика допуска не должна независимо дублироваться в:

- `users.py`;
- `questions.py`;
- Dashboard;
- frontend JavaScript.

Все места должны опираться на одинаковый runtime-порог.

## Когда смотреть

Если:

- изменили порог с 5 на 12, а допуск остался;
- `approve` не соответствует числу вопросов;
- разные страницы Editor показывают разный допуск.

---

# 8. `tpv/editor/runtime_threshold.py`

## Назначение

Связывает **операционный порог допуска** с работающим приложением.

По смыслу этот модуль отвечает за получение/применение текущего значения, которое затем использует логика допуска.

Связка должна выглядеть так:

```text
Editor operational settings
           │
           ▼
runtime_threshold.py
           │
           ▼
admission.py
           │
           ▼
Users / approval calculation
```

## Когда смотреть

Если настройка сохраняется в Editor, но работающая игра/Editor продолжает использовать старое значение.

---

# 9. `tpv/editor/operational_settings.py`

## Назначение

Операционные настройки TPV Editor.

Это настройки, влияющие не только на внешний вид, а на поведение TPV.

Например, сюда логично относится значение:

```text
сколько вопросов требуется для допуска игрока
```

## Отличие от `theme_engine.py`

```text
operational_settings.py
= логические/операционные настройки

theme_engine.py
= визуальные настройки Editor
```

Не стоит смешивать эти два типа конфигурации.

## Когда смотреть

Если:

- настройка не сохраняется;
- настройка показывается неправильно;
- после изменения параметра runtime не меняется;
- требуется добавить новую управляемую настройку TPV.

---

# 10. `tpv/socket_handlers.py`

## Назначение

Главная **runtime-логика Socket.IO** для живой игры TPV.

Этот файл связывает ведущего, игрока и зрителя в реальном времени.

Здесь находятся обработчики игровых событий, включая:

- управление отображением;
- вопросы;
- гонг-игру;
- результаты;
- переключение экранов;
- show/hide;
- команды ведущего;
- синхронизацию spectator/player.

## Поток

```text
Host JS
   │
   │ socket.emit(...)
   ▼
tpv/socket_handlers.py
   │
   ├── изменение runtime state
   ├── ArchiveRuntime
   └── TpvRoomService
             │
             ├── Host
             ├── Player
             └── Spectator
```

## Когда смотреть

Если:

- ведущий нажал кнопку, но ничего не произошло;
- player получил неверное событие;
- spectator не синхронизировался;
- гонг-игра не обновляется;
- событие Socket.IO не приходит;
- события приходят несколько раз;
- игра работает по HTTP, но ломается только в realtime.

## Что желательно в будущем

Файл крупный. Если он продолжит расти, разумно постепенно делить его:

```text
tpv/sockets/
├── lifecycle.py
├── questions.py
├── bong.py
├── display.py
├── players.py
└── host.py
```

Но делать это следует отдельным контролируемым рефакторингом с проверкой всех событий.

---

# 11. `tpv/services/room.py`

## Назначение

Централизованная адресация Socket.IO комнат.

Основной сервис:

```text
TpvRoomService
```

Он решает **кому отправить событие**, а не правила самой игры.

Типовые операции:

```text
get_room_code()
emit_host()
emit_spectator()
emit_players()
emit_player()
```

## Почему он нужен

Плохо:

```python
socketio.emit("event", data, to=f"{room}:user:{username}")
```

в десятках разных handlers.

Лучше:

```python
room_service.emit_player(...)
```

Тогда формат комнат меняется в одном месте.

## Диагностика

Если Socket.IO handler сработал, но событие ушло не той аудитории:

```text
socket_handlers.py
        │
        ▼
services/room.py
```

---

# 12. `tpv/services/archive_snapshot.py`

## Назначение

Адаптер между текущим состоянием приложения и системой архивирования.

Предоставляет Archive Runtime данные вроде:

```text
get_players()
get_results()
get_questions_total()
get_themes_total()
get_builder_id()
get_resource_games()
get_database_path()
```

## Поток

```text
текущая игра / DB
       │
       ▼
archive_snapshot.py
       │
       ▼
archive_runtime.py
       │
       ▼
archive.py / SQLite
```

## Когда смотреть

Если архив запускается, но внутри сохранены неправильные:

- игроки;
- результаты;
- количество вопросов;
- количество тем;
- builder;
- ресурс базы.

---

# 13. `tpv/archive_runtime.py`

## Назначение

Автоматическая запись **текущей живой игры** в архив.

Это runtime-компонент.

Типовые действия:

```text
start()
ensure_started()
record_question()
record event
finish session
```

## Разница с `archive.py`

```text
archive_runtime.py
= наблюдает за текущей игрой и пишет события

archive.py
= модели, API и долговременное хранение архива
```

## Поток вопроса

```text
игровое событие
     │
     ▼
socket_handlers.py
     │
     ▼
archive_runtime.record_question(...)
     │
     ▼
archive tables
```

## Когда смотреть

Если:

- игра прошла, но архивная сессия не появилась;
- вопрос не попал в историю игры;
- время/события не записываются;
- сессия не завершается корректно.

---

# 14. `tpv/archive.py`

## Назначение

Основной subsystem архива проведённых TPV-игр.

Содержит:

- ORM архива;
- операции создания/чтения;
- API Editor;
- работу с архивными сессиями.

В архиве используются сущности уровня:

```text
tpv_game_sessions
tpv_game_players
tpv_game_questions
tpv_game_themes
tpv_game_events
tpv_game_snapshots
```

## Когда смотреть

Если:

- архивная сессия есть, но отображается неправильно;
- API архива падает;
- не создаются архивные таблицы;
- нужно изменить структуру сохранённой игры;
- ломается просмотр истории игры.

---

# 15. `tpv/backup_center.py`

## Назначение

Центр резервного копирования TPV/SQLite.

Работает с:

- путём текущей базы;
- каталогом backups;
- перечнем резервных копий;
- безопасными именами;
- restore;
- emergency backup.

## Когда смотреть

Если:

- backup не создаётся;
- файл не показывается в Editor;
- restore отвергает корректный backup;
- определяется неправильный `game.db`;
- проблемы с emergency backup.

---

# 16. `tpv/diagnostics.py`

## Назначение

Read-only диагностика состояния TPV.

Типовой endpoint:

```text
GET /tpv/api/health
```

Диагностика проверяет наличие групп таблиц и компонентов.

Условно:

```text
CORE_TABLES
EDITOR_TABLES
ARCHIVE_TABLES
PARTICIPATION_TABLES
QUESTION_APPLICATION_TABLES
```

## Использование после деплоя

Рекомендуемый порядок:

```text
1. приложение стартовало
2. /tpv/api/health
3. основные HTTP маршруты
4. TPV Editor
5. Socket.IO
6. тестовая игра
7. архив
```

---

# 17. `tpv/media_routes.py`

## Назначение

HTTP-маршруты TPV для медиаресурсов.

Используется там, где ресурс получается обычным HTTP-запросом, а не Socket.IO.

## Когда смотреть

Если:

- TPV audio/media URL возвращает 404;
- браузер не может получить ресурс;
- media endpoint не зарегистрирован.

---

# 18. `tpv/theme_engine.py`

## Назначение

Backend визуальной настройки TPV Editor.

Это **Visual Theme Designer**, а не темы вопросов игры.

Отвечает за:

- визуальные параметры;
- цветовые настройки;
- хранение темы Editor;
- Theme Designer API.

## Не путать

```text
tpv/theme_engine.py
= внешний вид TPV Editor

tpv/editor/themes.py
= игровые темы / темы замены
```

---

# 19. `tpv/editor_routes.py`

## Назначение

Верхний слой подключения маршрутов TPV Editor.

Исторически сюда переносился большой набор Editor handlers из `game.py`.

После дальнейшего рефакторинга конкретные разделы вынесены в:

```text
tpv/editor/*.py
```

Поэтому сегодня `editor_routes.py` следует воспринимать прежде всего как **adapter/bootstrap маршрутов Editor**, а бизнес-логику искать в конкретных модулях `editor/`.

---

# 20. `tpv/editor/registry.py`

## Назначение

Реестр модулей TPV Editor.

Его идея:

```text
editor_routes
      │
      ▼
editor/registry.py
      │
      ├── register_users
      ├── register_questions
      ├── register_themes
      ├── register_builder
      ├── ...
      └── register_statistics
```

## Когда смотреть

Если конкретный файл Editor существует, но его endpoints вообще не появились в Flask.

---

# 21. Модули `tpv/editor/`

## `users.py`

### Отвечает за

Раздел **Игроки**.

Операции над:

- `UsersTpv`;
- именем игрока;
- темой замены;
- `flip_col`;
- `approve`;
- результатами/связанными данными игрока.

### Связи

```text
Editor UI
   │
   ▼
users.py
   │
   ├── UsersTpv
   ├── admission.py
   └── history
```

### Идти сюда, если

- игрок не создаётся;
- approve неверный;
- тема игрока не обновляется;
- число вопросов игрока отображается неправильно.

---

## `themes.py`

### Отвечает за

Игровые **темы замены**.

Это не цветовая тема интерфейса.

Типовые задачи:

- список тем;
- подсчёт вопросов по теме;
- связь темы с игроками;
- проверка существования;
- статистика темы.

### Связи

```text
Questions_tpv.flip
UsersTpv.flip
      │
      ▼
editor/themes.py
```

---

## `questions.py`

### Отвечает за

Основную базу вопросов.

Типично:

- список;
- фильтры;
- поиск;
- создание;
- редактирование;
- удаление;
- отображение;
- счётчик результатов фильтра.

### Связи

```text
Editor
  │
  ▼
questions.py
  │
  ▼
Questions_tpv
```

### Идти сюда, если

- фильтр показывает не те вопросы;
- счётчик фильтра неправильный;
- вопрос не сохраняется;
- новая тема не появляется в вопросах.

---

## `builder.py`

### Отвечает за

Сборку наборов вопросов/игр.

Связан с:

```text
TpvGameBuild
```

и выборкой вопросов.

### Важная логика

Если отдельный набор не выбран/не создан, система может использовать fallback на доступные вопросы — эту логику нельзя случайно сломать при изменениях Builder.

---

## `dashboard.py`

### Отвечает за

Главную страницу Editor и агрегированные показатели:

- ресурсы;
- число вопросов;
- темы;
- игроки;
- запас базы;
- предупреждения.

### Если Dashboard показывает неправильное число

Проверять:

```text
dashboard.py
   │
   ├── DB queries
   ├── statistics helpers
   └── operational/runtime settings
```

---

## `statistics.py`

### Отвечает за

Статистику TPV Editor.

Здесь должны находиться агрегированные показатели, а не изменение данных.

---

## `history.py`

### Отвечает за

Историю административных изменений.

Связан с:

```text
TpvEditorHistory
```

Используется для аудита действий Editor.

---

## `question_applications.py`

### Отвечает за

Модерацию **заявок на вопросы**.

Не путать с `questions.py`.

```text
question application
      │
      ▼
moderation
      │
      ▼
normal question
```

---

## `participation_applications.py`

### Отвечает за

Административную часть **заявок на участие**.

Публичная часть находится в:

```text
tpv/participation/
```

Связь:

```text
пользователь
   │
   ▼
tpv/participation/routes.py
   │
   ▼
tpv_participation_applications
   │
   ▼
editor/participation_applications.py
   │
   ▼
модератор
```

---

## `importing.py`

### Отвечает за

Импорт данных в Editor.

Рекомендуемая модель:

```text
external data
   │
   ▼
validation
   │
   ▼
importing.py
   │
   ▼
DB
```

---

## `exporting.py`

### Отвечает за

Экспорт данных Editor.

```text
DB
 │
 ▼
exporting.py
 │
 ▼
external file/representation
```

---

## `maintenance.py`

### Отвечает за

Служебное обслуживание.

Сюда логично относить:

- очистку;
- массовые служебные операции;
- maintenance SQLite;
- технические проверки.

Массовую destructive-операцию лучше держать здесь, чем прятать в обычном CRUD.

---

## `quality.py`

### Отвечает за

Контроль качества данных.

Типичные задачи:

- аномалии;
- потенциальные дубли;
- неполные записи;
- несогласованность;
- проверка качества базы.

---

## `permissions.py`

### Отвечает за

Проверку прав на TPV Editor.

Если весь endpoint неожиданно отвечает 403, это один из первых модулей для проверки.

---

## `validators.py`

### Отвечает за

Переиспользуемую валидацию входных данных Editor.

Правильный поток:

```text
request
  │
  ▼
validator
  │
  ▼
operation
  │
  ▼
DB
```

---

## `responses.py`

### Отвечает за

Единый формат HTTP/JSON ответов Editor.

Полезен, чтобы frontend получал одинаковые структуры для:

- success;
- validation error;
- permission error;
- server error.

---

## `table_utils.py`

### Отвечает за

Низкоуровневые helper-функции работы со схемой/таблицами.

Например:

- существует ли таблица;
- готов ли subsystem;
- можно ли выполнять запрос.

Эти проверки не следует копировать по каждому editor-модулю.

---

## `operational_settings.py`

### Отвечает за

Логические настройки поведения TPV.

Например:

- порог допуска;
- операционные параметры Editor.

Не относится к цветовой теме интерфейса.

---

## `runtime_threshold.py`

### Отвечает за

Получение актуального runtime-значения порога допуска и согласование его с остальной системой.

Это важный слой между сохранённой настройкой и `admission.py`.

---

# 22. Публичные заявки на участие — `tpv/participation/`

Эта подсистема правильно отделена от TPV Editor.

---

## `participation/constants.py`

Содержит допустимые константы/статусы.

Например категории уровня:

```text
ApplicationStatus
ThemeStatus
ApplicationSource
```

Плюс этого подхода: статусы не размазаны случайными строками по всему проекту.

---

## `participation/models.py`

ORM заявок на участие.

Основная сущность:

```text
TpvParticipationApplication
```

Таблица:

```text
tpv_participation_applications
```

Типовые поля:

```text
display_name
theme
status
theme_status
...
```

---

## `participation/services.py`

Бизнес-логика заявок.

Типовой сервис:

```text
TpvParticipationService
```

Операции уровня:

```text
create_application()
get_application()
get_public_status()
update_application()
```

Также здесь должна находиться бизнес-валидация.

Правильное разделение:

```text
routes.py
= HTTP

services.py
= правила

models.py
= хранение
```

---

## `participation/routes.py`

Публичный HTTP/UI слой заявок.

Типичные маршруты:

```text
/tpv-apply
/tpv-apply/status
/tpv/api/participation/...
```

### Идти сюда, если

- форма возвращает неправильный HTTP status;
- GET/POST ведут себя неправильно;
- не рендерится public page;
- API проверки заявки возвращает неверный ответ.

---

## `participation/templates/`

HTML публичной системы заявок.

Изменение дизайна формы заявки следует делать здесь, а не в случайной копии HTML в другом каталоге.

---

# 23. Основные потоки данных

## 23.1 Живая игра

```text
Host
 │
 │ Socket.IO
 ▼
socket_handlers.py
 │
 ├───────────────┐
 │               │
 ▼               ▼
RoomService   ArchiveRuntime
 │               │
 ├─ Player       ▼
 └─ Spectator  Archive
```

---

## 23.2 Вопросы Editor

```text
Browser
  │
  ▼
editor/questions.py
  │
  ▼
Questions_tpv
  │
  ▼
SQLite
```

---

## 23.3 Допуск игрока

```text
operational_settings
       │
       ▼
runtime_threshold
       │
       ▼
admission.py
       │
       ▼
users.py / approve
```

Источник истины по правилу допуска должен быть один.

---

## 23.4 Заявка на участие

```text
tpv-apply HTML
     │
     ▼
participation/routes.py
     │
     ▼
participation/services.py
     │
     ▼
participation/models.py
     │
     ▼
SQLite
     │
     ▼
editor/participation_applications.py
```

---

## 23.5 Архив

```text
Socket/Game event
       │
       ▼
archive_runtime.py
       │
       ├── services/archive_snapshot.py
       │
       ▼
archive.py
       │
       ▼
SQLite
```

---

# 24. Root compatibility-файлы

В корне репозитория всё ещё присутствуют файлы:

```text
tpv_application.py
tpv_archive.py
tpv_archive_runtime.py
tpv_backup_center.py
tpv_editor_routes.py
tpv_editor_routes_v2.py
tpv_editor_theme_engine.py
tpv_media_routes.py
tpv_models.py
tpv_participation.py
tpv_services.py
tpv_socket_handlers.py
```

Одновременно актуальные реализации находятся внутри:

```text
tpv/
```

Это следствие поэтапного рефакторинга и слой совместимости/legacy.

## Правило

**Не удалять root `tpv_*.py` только потому, что существует аналог внутри `tpv/`.**

Перед удалением обязательна проверка:

```bash
grep -R "tpv_application" .
grep -R "tpv_archive" .
grep -R "tpv_editor_routes_v2" .
...
```

Нужно проверить:

1. прямые импорты;
2. динамические импорты;
3. запуск development;
4. запуск Gunicorn;
5. HTTP routes;
6. Socket.IO;
7. TPV Editor;
8. архив.

---

# 25. `tpv_editor_routes_v2.py`

Этот root-файл выглядит как переходный слой предыдущего этапа рефакторинга.

Сейчас большая часть Editor уже находится в:

```text
tpv/editor/*.py
```

Поэтому файл является кандидатом на будущую очистку, **но только после анализа всех ссылок**.

Не удалять вслепую.

---

# 26. Где искать проблему — шпаргалка

| Симптом | Первый модуль |
|---|---|
| TPV не стартует | `tpv/application.py` |
| ImportError при старте | `application.py`, `__init__.py` |
| Не зарегистрирован Editor endpoint | `editor_routes.py`, `editor/registry.py` |
| `no such table/column` | `models.py` / subsystem models |
| Порог допуска не обновился | `editor/operational_settings.py`, `editor/runtime_threshold.py`, `admission.py` |
| Неверный approve игрока | `admission.py`, `editor/users.py` |
| Host событие не работает | `socket_handlers.py` |
| Событие ушло не тому клиенту | `services/room.py` |
| Spectator не обновился | `socket_handlers.py`, frontend JS |
| Player не обновился | `socket_handlers.py`, `services/room.py`, frontend JS |
| Вопрос не сохраняется | `editor/questions.py`, `models.py` |
| Неверный фильтр вопросов | `editor/questions.py` |
| Неверный список тем | `editor/themes.py`, `editor/questions.py` |
| Builder работает неправильно | `editor/builder.py` |
| Dashboard считает неправильно | `editor/dashboard.py` |
| Статистика неправильная | `editor/statistics.py` |
| История не пишется | `editor/history.py` |
| Заявка на вопрос | `editor/question_applications.py` |
| Публичная заявка на участие | `participation/routes.py`, `services.py` |
| Модерация участия | `editor/participation_applications.py` |
| Import | `editor/importing.py` |
| Export | `editor/exporting.py` |
| Quality check | `editor/quality.py` |
| Очистка/maintenance | `editor/maintenance.py` |
| Backup/restore | `backup_center.py` |
| Архив игры не создаётся | `archive_runtime.py` |
| Архив содержит неверные данные | `services/archive_snapshot.py` |
| Просмотр архива сломан | `archive.py` |
| Цвета/визуальная тема Editor | `theme_engine.py` |
| TPV media 404 | `media_routes.py` |
| Проверка состояния | `diagnostics.py` |

---

# 27. Как разбирать неисправность по слоям

При проблеме лучше идти не по всему репозиторию, а сверху вниз.

## HTTP-проблема

```text
Browser
  │
  ▼
Flask route
  │
  ▼
service/validator
  │
  ▼
model
  │
  ▼
SQLite
```

Проверять слой за слоем.

---

## Socket.IO проблема

```text
Browser emit
  │
  ▼
socket_handlers.py
  │
  ▼
room.py
  │
  ▼
Browser receive
  │
  ▼
frontend handler
  │
  ▼
DOM
```

Если серверный handler вообще не вызвался — проблема до него.

Если вызвался, но `emit` не пришёл — смотреть room/addressing.

Если событие пришло в браузер, но экран не изменился — backend уже почти наверняка ни при чём, смотреть JS/DOM/CSS.

---

## DB-проблема

```text
route/service
   │
   ▼
ORM model
   │
   ▼
actual SQLite schema
```

Всегда различать:

```text
Python model
```

и:

```text
реальную схему существующего game.db
```

Они могут не совпадать после изменения кода.

---

# 28. Правила дальнейшей разработки

## 28.1 Не возвращать TPV в `game.py`

Новая TPV-функция:

```text
tpv/...
```

Новая секция TPV Editor:

```text
tpv/editor/<section>.py
```

Новый сервис:

```text
tpv/services/<service>.py
```

---

## 28.2 Не создавать циклические импорты

Плохо:

```text
game.py -> tpv -> game.py
```

Хорошо:

```text
game.py
  │
  ▼
tpv.application
  │
  ▼
dependency injection
```

---

## 28.3 Один источник истины

Особенно для:

- порога допуска;
- room naming;
- permission checks;
- статусов заявок;
- таблиц;
- общих validators.

Если одно правило реализовано в трёх местах, рано или поздно одно из них будет отличаться.

---

## 28.4 Editor-модули должны быть предметными

Пример:

```text
questions.py
```

не должен неожиданно содержать backup.

```text
maintenance.py
```

не должен рендерить игровую Socket.IO логику.

---

## 28.5 Сохранять URL и Socket.IO event names при рефакторинге

Внутренний Python-файл можно менять.

Но frontend зависит от контрактов:

```text
HTTP URL
HTTP method
JSON shape
Socket.IO event name
Socket.IO payload
```

Поэтому рефакторинг backend не должен незаметно менять публичный контракт.

---

# 29. Что проверять после изменения TPV

Минимальная проверка:

```text
[ ] Python imports проходят
[ ] Flask запускается
[ ] /tpv открывается
[ ] host TPV открывается
[ ] player TPV открывается
[ ] spectator TPV открывается
[ ] /tpv_editor открывается
[ ] /tpv/api/health работает
[ ] SQLite без ошибок schema
[ ] Socket.IO подключается
[ ] host -> player event работает
[ ] host -> spectator event работает
[ ] вопрос показывается
[ ] ответ/результат работает
[ ] гонг-игра работает
[ ] архив создаётся
[ ] заявки работают
[ ] backup не сломан
```

И отдельно:

```text
[ ] «Свободный слот» запускается
[ ] его маршруты не изменены
[ ] его Socket/WebSocket логика не затронута
[ ] его DB-функциональность не сломана
```

---

# 30. Рекомендуемая граница TPV и «Свободного слота»

```text
                       game.py
                     /         \
                    /           \
           Свободный слот      TPV bootstrap
             (своё)               │
                                  ▼
                                tpv/
```

Общее допустимо только для реальной общей инфраструктуры:

- Flask app;
- SQLAlchemy;
- auth;
- nginx/gunicorn deployment;
- static infrastructure.

Игровые правила, state и события одной игры не должны становиться зависимостью другой.

---

# 31. Технический долг, который можно убирать постепенно

## 31.1 Обновить старые TPV markdown-документы

Текущий `tpv/README.md` исторически описывает этап 11.1 и уже не отражает полностью текущую структуру.

Варианты:

1. заменить его коротким README со ссылкой на `ARCHITECTURE.md`;
2. обновить `APPLICATION.md`, `MODELS.md`, `ROUTES.md`, `SERVICES.md`, `SOCKETS.md`;
3. пометить старые тексты как historical.

---

## 31.2 Проверить root compatibility modules

После полного подтверждения отсутствия внешних импортов можно будет сокращать:

```text
tpv_*.py
```

Но только по одному файлу за этап с тестом запуска.

---

## 31.3 Дальше дробить `socket_handlers.py`

Только когда текущая логика стабильна и покрыта проверочным сценарием.

---

## 31.4 Документировать публичные контракты

Полезно отдельно сделать:

```text
tpv/HTTP_API.md
tpv/SOCKET_EVENTS.md
tpv/DATABASE.md
```

Тогда архитектура будет описывать «где», а эти документы — «какой точный контракт».

---

# 32. Краткая карта ответственности

```text
application.py
    главный сборщик TPV

models.py
    основные ORM TPV

admission.py
    правило допуска игрока

socket_handlers.py
    realtime игра

services/room.py
    Socket.IO адресация

services/archive_snapshot.py
    snapshot текущего состояния

archive_runtime.py
    запись текущей игры

archive.py
    долговременный архив

backup_center.py
    backup/restore SQLite

diagnostics.py
    health checks

media_routes.py
    TPV media HTTP

theme_engine.py
    визуальная тема Editor

editor_routes.py
    подключение Editor

editor/registry.py
    реестр секций Editor

editor/users.py
    игроки

editor/themes.py
    игровые темы

editor/questions.py
    вопросы

editor/builder.py
    игровые наборы

editor/dashboard.py
    dashboard

editor/statistics.py
    статистика

editor/history.py
    история

editor/question_applications.py
    заявки на вопросы

editor/participation_applications.py
    модерация участия

editor/importing.py
    импорт

editor/exporting.py
    экспорт

editor/quality.py
    качество данных

editor/maintenance.py
    обслуживание

editor/permissions.py
    права

editor/validators.py
    валидация

editor/responses.py
    единые ответы

editor/table_utils.py
    schema/table helpers

editor/operational_settings.py
    рабочие настройки

editor/runtime_threshold.py
    runtime-порог допуска

participation/models.py
    модель заявки

participation/services.py
    бизнес-логика заявки

participation/routes.py
    публичные HTTP endpoints

participation/constants.py
    статусы/константы
```

---

# 33. Практическое правило «куда лезть»

Перед изменением кода сформулировать проблему одним предложением.

Пример:

> «После изменения числа вопросов для допуска игрок с 5 вопросами остаётся допущенным при пороге 12».

Тогда маршрут поиска:

```text
operational_settings.py
       │
       ▼
runtime_threshold.py
       │
       ▼
admission.py
       │
       ▼
users.py / recalculation
       │
       ▼
UsersTpv.approve
```

Не нужно начинать с `game.py`, `socket_handlers.py` или frontend, пока не проверена эта цепочка.

Другой пример:

> «Ведущий показывает вопрос, host его видит, spectator нет».

Маршрут:

```text
host JS
   │
   ▼
socket_handlers.py
   │
   ▼
services/room.py
   │
   ▼
spectator Socket.IO listener
   │
   ▼
spectator JS
```

Это и есть основная цель модульной архитектуры: локализовать проблему по ответственности.

---

# 34. Статус документа

Этот файл описывает архитектуру по текущему дереву `main` на момент подготовки документа.

При добавлении нового крупного TPV subsystem рекомендуется одновременно обновлять:

```text
tpv/ARCHITECTURE.md
```

Минимум:

1. добавить модуль в дерево;
2. описать ответственность;
3. указать зависимости;
4. добавить его в таблицу диагностики;
5. добавить проверки после изменения.

Так документация останется рабочей картой проекта, а не историей старого этапа рефакторинга.
