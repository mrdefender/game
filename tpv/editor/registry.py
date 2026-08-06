"""Контекст и регистрация читаемых модулей TPV Editor."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Mapping

from .permissions import EditorPermissions


EditorModule = Callable[["EditorContext"], Any]


@dataclass(slots=True)
class EditorContext:
    """Зависимости, общие для модулей редактора."""

    app: Any
    db: Any
    runtime: dict[str, Any]
    permissions: EditorPermissions
    modules: dict[str, Any] = field(default_factory=dict)

    def register_module(
        self,
        name: str,
        register: EditorModule,
    ) -> Any:
        """Зарегистрировать модуль один раз и сохранить его экспорт."""
        if name in self.modules:
            return self.modules[name]

        exports = register(self)
        self.modules[name] = exports
        return exports

    def get(self, name: str, default: Any = None) -> Any:
        """Получить зависимость из исходного runtime."""
        return self.runtime.get(name, default)


def create_editor_context(
    runtime: Mapping[str, Any],
    *,
    route_exports: Mapping[str, Any],
) -> EditorContext:
    """Создать общий контекст поверх уже работающих callbacks."""
    namespace = dict(runtime)

    # Базовый route runtime содержит только обычные callbacks
    # и зависимости приложения. Динамического кода здесь нет.
    route_runtime = route_exports.get("runtime")
    if isinstance(route_runtime, Mapping):
        namespace.update(route_runtime)

    namespace.update({
        name: value
        for name, value in route_exports.items()
        if name != "runtime"
    })

    app = namespace["app"]
    db = namespace["db"]

    allowed = route_exports["tpv_editor_allowed"]
    error = route_exports["tpv_editor_error"]

    return EditorContext(
        app=app,
        db=db,
        runtime=namespace,
        permissions=EditorPermissions(
            allowed=allowed,
            error=error,
        ),
    )
