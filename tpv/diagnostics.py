"""Production diagnostics for TPV 15.0.

Read-only health endpoint:
    GET /tpv/api/health
"""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from typing import Any

from flask import Blueprint, jsonify
from sqlalchemy import inspect, text


CORE_TABLES = {
    "Questions_tpv",
    "query_tpv",
    "users_tpv",
}

EDITOR_TABLES = {
    "tpv_editor_history",
    "tpv_editor_settings",
    "tpv_editor_themes",
    "tpv_game_builds",
}

ARCHIVE_TABLES = {
    "tpv_game_events",
    "tpv_game_players",
    "tpv_game_questions",
    "tpv_game_sessions",
    "tpv_game_snapshots",
    "tpv_game_themes",
}

PARTICIPATION_TABLES = {
    "tpv_participation_applications",
}

QUESTION_APPLICATION_TABLES = {
    "tpv_question_applications",
}

ALL_REQUIRED_TABLES = (
    CORE_TABLES
    | EDITOR_TABLES
    | ARCHIVE_TABLES
    | PARTICIPATION_TABLES
    | QUESTION_APPLICATION_TABLES
)


def _tpv_version() -> str:
    """Read package version without importing tpv recursively."""
    package = sys.modules.get("tpv")
    value = getattr(package, "__version__", None) if package is not None else None
    return str(value or "unknown")


def _component_state(
    tables: set[str],
    present: set[str],
) -> dict[str, Any]:
    missing = sorted(tables - present)
    return {
        "ok": not missing,
        "required": len(tables),
        "present": len(tables) - len(missing),
        "missing": missing,
    }


def register_tpv_diagnostics(app, db) -> dict[str, Any]:
    """Register the read-only TPV production health endpoint."""

    blueprint = Blueprint(
        "tpv_diagnostics",
        __name__,
        url_prefix="/tpv/api",
    )

    @blueprint.get("/health")
    def tpv_health():
        database_ok = False
        database_error = None
        present_tables: set[str] = set()

        try:
            db.session.execute(text("SELECT 1")).scalar()
            inspector = inspect(db.engine)
            present_tables = set(inspector.get_table_names())
            database_ok = True
        except Exception:
            app.logger.exception("TPV health: database diagnostic failed.")
            database_error = "database_unavailable"
        finally:
            try:
                db.session.rollback()
            except Exception:
                app.logger.exception("TPV health: diagnostic rollback failed.")

        components = {
            "core": _component_state(CORE_TABLES, present_tables),
            "editor": _component_state(EDITOR_TABLES, present_tables),
            "archive": _component_state(ARCHIVE_TABLES, present_tables),
            "participation": _component_state(
                PARTICIPATION_TABLES,
                present_tables,
            ),
            "question_applications": _component_state(
                QUESTION_APPLICATION_TABLES,
                present_tables,
            ),
        }

        required_missing = sorted(ALL_REQUIRED_TABLES - present_tables)
        tables_ok = not required_missing
        components_ok = all(
            state["ok"]
            for state in components.values()
        )

        healthy = database_ok and tables_ok and components_ok

        payload = {
            "ok": healthy,
            "status": "healthy" if healthy else "degraded",
            "service": "tpv",
            "version": _tpv_version(),
            "checked_at": datetime.now(timezone.utc).isoformat(
                timespec="seconds"
            ),
            "database": {
                "ok": database_ok,
                "error": database_error,
            },
            "tables": {
                "ok": tables_ok,
                "required": len(ALL_REQUIRED_TABLES),
                "present": (
                    len(ALL_REQUIRED_TABLES)
                    - len(required_missing)
                ),
                "missing": required_missing,
            },
            "components": components,
        }

        return jsonify(payload), 200 if healthy else 503

    app.register_blueprint(blueprint)

    return {
        "blueprint": blueprint,
        "required_tables": frozenset(ALL_REQUIRED_TABLES),
    }


__all__ = [
    "ALL_REQUIRED_TABLES",
    "register_tpv_diagnostics",
]
