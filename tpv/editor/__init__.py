"""Читаемая модульная инфраструктура TPV Editor.

После этапа 13.6.6 все маршруты зарегистрированы обычным Python-кодом
без встроенного исходника и динамического выполнения.
"""

from .builder import BuilderService, register_builder

from .dashboard import DashboardService, register_dashboard
from .exporting import ExportService, register_exporting
from .history import HistoryService, register_history
from .importing import ImportService, register_importing
from .participation_applications import (
    ParticipationApplicationEditorService,
    register_participation_applications,
)
from .maintenance import MaintenanceService, register_maintenance
from .permissions import EditorPermissions
from .questions import QuestionService, register_questions
from .quality import QualityService, register_quality
from .question_applications import (
    QuestionApplicationService,
    register_question_applications,
)
from .registry import EditorContext, create_editor_context
from .responses import (
    error_response,
    forbidden_response,
    message_error_response,
    not_found_response,
    success_response,
)
from .users import UserService, register_users
from .themes import ThemeService, register_themes
from .statistics import StatisticsService, register_statistics
from .table_utils import (
    Page,
    apply_text_search,
    paginate_items,
    sort_items,
)
from .validators import (
    ValidationError,
    normalize_text,
    parse_choice,
    parse_positive_int,
    require_text,
)

from .operational_settings import register_operational_settings

__all__ = [
    "register_operational_settings",
    "DashboardService",
    "BuilderService",
    "EditorContext",
    "EditorPermissions",
    "ExportService",
    "HistoryService",
    "ImportService",
    "MaintenanceService",
    "Page",
    "ParticipationApplicationEditorService",
    "QuestionApplicationService",
    "QualityService",
    "QuestionService",
    "StatisticsService",
    "ThemeService",
    "UserService",
    "ValidationError",
    "apply_text_search",
    "create_editor_context",
    "register_builder",
    "register_dashboard",
    "register_exporting",
    "register_history",
    "register_importing",
    "register_maintenance",
    "register_participation_applications",
    "register_quality",
    "register_question_applications",
    "register_questions",
    "register_statistics",
    "register_themes",
    "register_users",
    "error_response",
    "forbidden_response",
    "message_error_response",
    "normalize_text",
    "not_found_response",
    "paginate_items",
    "parse_choice",
    "parse_positive_int",
    "require_text",
    "sort_items",
    "success_response",
]
