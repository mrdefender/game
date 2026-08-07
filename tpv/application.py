"""Unified TPV application bootstrap.

Этап 11.6. Собирает модели, маршруты Editor, архив, Theme Engine,
Snapshot providers, Archive Runtime и Socket.IO в правильном порядке.

Модуль не импортирует game.py. Зависимости передаются через runtime.
"""

from __future__ import annotations

from typing import Any, Mapping

from .models import create_tpv_models
from .editor_routes import register_tpv_editor_routes
from .archive import register_tpv_archive
from .theme_engine import register_tpv_editor_theme_engine
from .archive_runtime import TpvArchiveRuntime
from .services import create_tpv_archive_snapshot_service
from .socket_handlers import register_tpv_socket_handlers
from .backup_center import register_tpv_backup_center
from .participation import register_tpv_participation
from .editor import (
    create_editor_context,
    register_builder,
    register_dashboard,
    register_exporting,
    register_history,
    register_importing,
    register_maintenance,
    register_participation_applications,
    register_quality,
    register_statistics,
    register_question_applications,
    register_questions,
    register_themes,
    register_users,
)


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
    """Register the complete TPV backend and return public exports."""

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

    # 1.1. Participation applications infrastructure.
    participation_exports = register_tpv_participation(app, db)
    participation_model = participation_exports["model"]
    participation_service = participation_exports["service"]
    namespace.update({
        "TPV_PARTICIPATION": participation_exports,
        "TpvParticipationApplication": participation_model,
        "TPV_PARTICIPATION_SERVICE": participation_service,
    })

    # Constants historically located next to the model block.
    namespace.setdefault("TPV_REQUIRED_FLIP_QUESTIONS", 5)
    namespace.setdefault(
        "TPV_GENERAL_QUESTION_VALUES",
        {"", "false", "общий"},
    )

    # 2. TPV Editor routes and helper exports.
    route_exports = register_tpv_editor_routes(namespace)
    namespace.update(route_exports)

    # 2.1. Shared TPV Editor infrastructure (stage 13.2).
    editor_context = create_editor_context(
        namespace,
        route_exports=route_exports,
    )
    namespace["TPV_EDITOR_CONTEXT"] = editor_context

    # 2.2. History and snapshots (stage 13.4.3).
    history_exports = editor_context.register_module(
        "history",
        register_history,
    )
    namespace["TPV_EDITOR_HISTORY"] = history_exports
    editor_context.runtime.update(history_exports)


    route_exports.update(history_exports)
    namespace.update(history_exports)

    # 2.3. Themes and shared theme helpers (stage 13.4.1).
    theme_exports = editor_context.register_module(
        "themes",
        register_themes,
    )
    namespace["TPV_EDITOR_THEMES"] = theme_exports

    # Theme helpers are published for the remaining Editor modules.

    editor_context.runtime.update(theme_exports)
    route_exports["tpv_editor_theme_list"] = (
        theme_exports["tpv_editor_theme_list"]
    )
    namespace.update(theme_exports)

    # 2.4. Users migrated to readable module (stage 13.3.2).
    user_exports = editor_context.register_module(
        "users",
        register_users,
    )
    namespace["TPV_EDITOR_USERS"] = user_exports
    editor_context.runtime.update(user_exports)

    # 2.5. Questions migrated to readable module (stage 13.3.3).
    # Question exports are required by Game Builder.
    question_exports = editor_context.register_module(
        "questions",
        register_questions,
    )
    namespace["TPV_EDITOR_QUESTIONS"] = question_exports
    editor_context.runtime.update(question_exports)

    # 2.6. Game Builder migrated to readable module (stage 13.4.2).
    # Builder depends on tpv_editor_question_to_dict.
    builder_exports = editor_context.register_module(
        "builder",
        register_builder,
    )
    namespace["TPV_EDITOR_BUILDER"] = builder_exports
    editor_context.runtime.update(builder_exports)


    route_exports.update(builder_exports)
    namespace.update(user_exports)
    namespace.update(question_exports)
    namespace.update(builder_exports)

    # 2.7. Question applications migrated to readable module.
    question_application_exports = editor_context.register_module(
        "question_applications",
        register_question_applications,
    )
    namespace["TPV_EDITOR_QUESTION_APPLICATIONS"] = (
        question_application_exports
    )
    editor_context.runtime.update(question_application_exports)


    route_exports.update(question_application_exports)
    namespace.update(question_application_exports)

    # 2.8. Participation applications (stage 13.5.2).
    participation_editor_exports = editor_context.register_module(
        "participation_applications",
        register_participation_applications,
    )
    namespace["TPV_PARTICIPATION_EDITOR"] = (
        participation_editor_exports
    )
    editor_context.runtime.update(
        participation_editor_exports
    )

    # 2.9. Database maintenance (stage 13.6.1).
    maintenance_exports = editor_context.register_module(
        "maintenance",
        register_maintenance,
    )
    namespace["TPV_EDITOR_MAINTENANCE"] = (
        maintenance_exports
    )
    editor_context.runtime.update(maintenance_exports)


    route_exports.update(maintenance_exports)
    namespace.update(maintenance_exports)

    # 2.10. Data quality checks (stage 13.6.2).
    quality_exports = editor_context.register_module(
        "quality",
        register_quality,
    )
    namespace["TPV_EDITOR_QUALITY"] = quality_exports
    editor_context.runtime.update(quality_exports)


    route_exports.update(quality_exports)
    namespace.update(quality_exports)

    # 2.11. Statistics (stage 13.6.3).
    statistics_exports = editor_context.register_module(
        "statistics",
        register_statistics,
    )
    namespace["TPV_EDITOR_STATISTICS"] = statistics_exports
    editor_context.runtime.update(statistics_exports)


    route_exports.update(statistics_exports)
    namespace.update(statistics_exports)

    # 2.12. Exporting (stage 13.6.4).
    exporting_exports = editor_context.register_module(
        "exporting",
        register_exporting,
    )
    namespace["TPV_EDITOR_EXPORTING"] = exporting_exports
    editor_context.runtime.update(exporting_exports)


    route_exports.update(exporting_exports)
    namespace.update(exporting_exports)

    # 2.13. Importing (stage 13.6.5).
    importing_exports = editor_context.register_module(
        "importing",
        register_importing,
    )
    namespace["TPV_EDITOR_IMPORTING"] = importing_exports
    editor_context.runtime.update(importing_exports)


    route_exports.update(importing_exports)
    namespace.update(importing_exports)

    # 2.14. Dashboard migrated to readable module (stage 13.3.1).
    # Dashboard depends on Builder and question applications.
    dashboard_exports = editor_context.register_module(
        "dashboard",
        register_dashboard,
    )
    namespace["TPV_EDITOR_DASHBOARD"] = dashboard_exports

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
        "TPV_EDITOR_CONTEXT": editor_context,
        "TPV_EDITOR_HISTORY": history_exports,
        "TPV_EDITOR_THEMES": theme_exports,
        "TPV_EDITOR_DASHBOARD": dashboard_exports,
        "TPV_EDITOR_USERS": user_exports,
        "TPV_EDITOR_QUESTIONS": question_exports,
        "TPV_EDITOR_BUILDER": builder_exports,
        "TPV_EDITOR_QUESTION_APPLICATIONS": question_application_exports,
        "TPV_PARTICIPATION_EDITOR": participation_editor_exports,
        "TPV_EDITOR_MAINTENANCE": maintenance_exports,
        "TPV_EDITOR_QUALITY": quality_exports,
        "TPV_EDITOR_STATISTICS": statistics_exports,
        "TPV_EDITOR_EXPORTING": exporting_exports,
        "TPV_EDITOR_IMPORTING": importing_exports,
        **route_exports,
        **archive_exports,
        "TPV_EDITOR_THEME_MODELS": theme_models,
        "TPV_BACKUP_CENTER": backup_exports,
        "TPV_PARTICIPATION": participation_exports,
        "TpvParticipationApplication": participation_model,
        "TPV_PARTICIPATION_SERVICE": participation_service,
        **runtime_exports,
        "TPV_SOCKET_EXPORTS": socket_exports,
        "update_users_tpv": socket_exports["update_users_tpv"],
    }


__all__ = ["register_tpv_application"]
