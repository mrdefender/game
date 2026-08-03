"""Unified TPV application bootstrap.

Этап 11.6. Собирает модели, маршруты Editor, архив, Theme Engine,
Snapshot providers, Archive Runtime и Socket.IO в правильном порядке.

Модуль не импортирует game.py. Зависимости передаются через runtime.
"""

from __future__ import annotations

from typing import Any, Mapping

from .models import create_tpv_models
from .editor_routes_v2 import register_tpv_editor_routes
from .archive import register_tpv_archive
from .theme_engine import register_tpv_editor_theme_engine
from .archive_runtime import TpvArchiveRuntime
from .services import create_tpv_archive_snapshot_service
from .socket_handlers import register_tpv_socket_handlers
from .backup_center import register_tpv_backup_center


_REQUIRED_NAMES = {
    "app",
    "db",
    "desc",
}


def register_tpv_application(
    runtime: Mapping[str, Any],
    *,
    user_mixin,
) -> dict[str, Any]:
    """Register the complete TPV backend and return compatibility exports."""

    missing = sorted(name for name in _REQUIRED_NAMES if name not in runtime)
    if missing:
        raise RuntimeError(
            "Не удалось зарегистрировать TPV application. "
            "Отсутствуют зависимости: " + ", ".join(missing)
        )

    namespace = dict(runtime)
    app = namespace["app"]
    db = namespace["db"]

    # 1. Main TPV models.
    models = create_tpv_models(db, user_mixin)
    model_exports = {
        "TPV_MODELS": models,
        "UsersTpv": models.UsersTpv,
        "Questions_tpv": models.Questions_tpv,
        "QueryTpv": models.QueryTpv,
        "TpvEditorHistory": models.TpvEditorHistory,
        "TpvGameBuild": models.TpvGameBuild,
        "TpvQuestionApplication": models.TpvQuestionApplication,
    }
    namespace.update(model_exports)

    # Constants historically located next to the model block.
    namespace.setdefault("TPV_REQUIRED_FLIP_QUESTIONS", 5)
    namespace.setdefault(
        "TPV_GENERAL_QUESTION_VALUES",
        {"", "false", "общий"},
    )

    # 2. TPV Editor routes and helper exports.
    route_exports = register_tpv_editor_routes(namespace)
    namespace.update(route_exports)

    # 3. Game archive API and ORM models.
    archive_models = register_tpv_archive(
        app,
        db,
        allowed=route_exports["tpv_editor_allowed"],
        error=route_exports["tpv_editor_error"],
    )
    archive_exports = {
        "TPV_ARCHIVE_MODELS": archive_models,
        "TpvGameSession": archive_models.GameSession,
        "TpvGamePlayer": archive_models.GamePlayer,
        "TpvGameQuestion": archive_models.GameQuestion,
        "TpvGameTheme": archive_models.GameTheme,
        "TpvGameEvent": archive_models.GameEvent,
        "TpvGameSnapshot": archive_models.GameSnapshot,
    }
    namespace.update(archive_exports)

    # 4. Theme Engine / Theme Designer backend.
    theme_models = register_tpv_editor_theme_engine(
        app,
        db,
        allowed=route_exports["tpv_editor_allowed"],
        error=route_exports["tpv_editor_error"],
    )
    namespace["TPV_EDITOR_THEME_MODELS"] = theme_models

    # Backup Center.
    backup_exports = register_tpv_backup_center(
        app,
        db,
        allowed=route_exports["tpv_editor_allowed"],
        error=route_exports["tpv_editor_error"],
    )
    namespace["TPV_BACKUP_CENTER"] = backup_exports

    # 5. Archive Snapshot providers.
    snapshot_service = create_tpv_archive_snapshot_service(
        db,
        QueryTpv=models.QueryTpv,
        UsersTpv=models.UsersTpv,
        QuestionsTpv=models.Questions_tpv,
        GameBuild=models.TpvGameBuild,
        desc=namespace["desc"],
        theme_list=route_exports["tpv_editor_theme_list"],
        builder_table_exists=route_exports[
            "tpv_editor_builder_table_exists"
        ],
    )
    callbacks = snapshot_service.runtime_callbacks()

    archive_runtime = TpvArchiveRuntime(
        db,
        archive_models,
        get_players=callbacks["get_players"],
        get_results=callbacks["get_results"],
        get_questions_total=callbacks["get_questions_total"],
        get_themes_total=callbacks["get_themes_total"],
        get_builder_id=callbacks["get_builder_id"],
        get_resource_games=callbacks["get_resource_games"],
        get_database_path=callbacks["get_database_path"],
        logger=app.logger,
    )

    runtime_exports = {
        "TPV_ARCHIVE_SNAPSHOT_SERVICE": snapshot_service,
        "_TPV_ARCHIVE_CALLBACKS": callbacks,
        "TPV_ARCHIVE_RUNTIME": archive_runtime,
    }
    namespace.update(runtime_exports)

    # 6. Socket.IO handlers. They receive the complete namespace.
    socket_exports = register_tpv_socket_handlers(namespace)

    return {
        **model_exports,
        "TPV_REQUIRED_FLIP_QUESTIONS": namespace[
            "TPV_REQUIRED_FLIP_QUESTIONS"
        ],
        "TPV_GENERAL_QUESTION_VALUES": namespace[
            "TPV_GENERAL_QUESTION_VALUES"
        ],
        "TPV_EDITOR_ROUTE_EXPORTS": route_exports,
        **route_exports,
        **archive_exports,
        "TPV_EDITOR_THEME_MODELS": theme_models,
        "TPV_BACKUP_CENTER": backup_exports,
        **runtime_exports,
        "TPV_SOCKET_EXPORTS": socket_exports,
        "update_users_tpv": socket_exports["update_users_tpv"],
    }


__all__ = ["register_tpv_application"]
