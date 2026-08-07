"""Проверки доступа к TPV Editor."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable


AllowedCallback = Callable[[], bool]
ErrorCallback = Callable[[str, int], Any]


@dataclass(frozen=True, slots=True)
class EditorPermissions:
    """Единая обёртка над проверкой доступа TPV Editor.

    Использует общие callbacks ``tpv_editor_allowed`` и
    ``tpv_editor_error``. Правила доступа остаются централизованными.
    """

    allowed: AllowedCallback
    error: ErrorCallback

    def is_allowed(self) -> bool:
        """Вернуть ``True``, если текущему запросу разрешён доступ."""
        return bool(self.allowed())

    def require(self, message: str = "Нет доступа к редактору."):
        """Вернуть ответ 403 при отсутствии доступа, иначе ``None``."""
        if self.is_allowed():
            return None
        return self.error(message, 403)

    def forbidden(self, message: str = "Нет доступа к редактору."):
        """Сформировать стандартный ответ 403."""
        return self.error(message, 403)
