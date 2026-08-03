"""TPV infrastructure bootstrap.

Не импортирует game.py и не создаёт циклических зависимостей.
Используется как единая точка регистрации из основного приложения.
"""

from __future__ import annotations

from typing import Any, Callable

from .archive import register_tpv_archive
from .theme_engine import register_tpv_editor_theme_engine


def register_editor_infrastructure(
    app,
    db,
    *,
    archive_allowed: Callable[[], bool],
    editor_error: Callable[[str, int], Any],
    theme_allowed: Callable[[], bool] | None = None,
):
    """Регистрирует инфраструктуру TPV Editor.

    Возвращает словарь зарегистрированных ORM-моделей.
    """

    archive_models = register_tpv_archive(
        app,
        db,
        allowed=archive_allowed,
        error=editor_error,
    )

    theme_models = register_tpv_editor_theme_engine(
        app,
        db,
        allowed=theme_allowed or archive_allowed,
        error=editor_error,
    )

    return {
        "archive": archive_models,
        "themes": theme_models,
    }
