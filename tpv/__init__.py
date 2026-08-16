"""TPV package.

Stable package entry point for TPV 15.0 infrastructure, services,
Editor modules, media routes and application bootstrap.
"""

from .archive import register_tpv_archive
from .archive_runtime import TpvArchiveRuntime
from .theme_engine import register_tpv_editor_theme_engine
from .socket_handlers import register_tpv_socket_handlers
from .application import register_tpv_application
from .backup_center import register_tpv_backup_center
from .participation import register_tpv_participation
from .diagnostics import register_tpv_diagnostics
from .media_routes import register_tpv_media_routes
from .services import (
    create_tpv_room_service,
    create_tpv_archive_snapshot_service,
)
from .editor_routes import register_tpv_editor_routes
from .models import create_tpv_models

__all__ = [
    "register_tpv_archive",
    "TpvArchiveRuntime",
    "register_tpv_editor_theme_engine",
    "register_tpv_socket_handlers",
    "register_tpv_application",
    "register_tpv_backup_center",
    "register_tpv_participation",
    "register_tpv_diagnostics",
    "register_tpv_media_routes",
    "create_tpv_room_service",
    "create_tpv_archive_snapshot_service",
    "register_tpv_editor_routes",
    "create_tpv_models",
]

__version__ = "15.0"