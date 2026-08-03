# TPV ORM models — этап 11.2

Модуль `tpv.models` содержит фабрику `create_tpv_models(db, UserMixin)`.

Перенесены модели:

- `UsersTpv` → таблица `users_tpv`;
- `Questions_tpv` → `questions_tpv`;
- `QueryTpv` → `query_tpv`;
- `TpvEditorHistory` → `tpv_editor_history`;
- `TpvGameBuild` → `tpv_game_builds`;
- `TpvQuestionApplication` → `tpv_question_applications`.

Названия таблиц зафиксированы явно. Схема SQLite не меняется и миграция не нужна.
