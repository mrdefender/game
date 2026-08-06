"""Базовые маршруты и callbacks TPV Editor — этап 13.6.6.

Этот модуль содержит обычный читаемый Flask-код. Встроенного исходника,
динамической компиляции и exec здесь больше нет.
"""

from __future__ import annotations

from typing import Any

from flask import (
    redirect,
    render_template,
    request,
    session,
    url_for,
)

from .editor.responses import message_error_response
from .editor.validators import normalize_text


ROUTES_VERSION = "13.6.6"


def tpv_editor_normalize_text(value: Any) -> str:
    """Совместимое имя общей нормализации текста."""
    return normalize_text(value)


def tpv_editor_allowed() -> bool:
    """Проверить доступ текущей сессии к TPV Editor."""
    return (
        session.get("tpv_launcher_allowed") is True
        and session.get("tpv_role") == "editor"
    )


def tpv_editor_error(
    message: str,
    status: int = 400,
):
    """Вернуть прежний JSON-контракт ошибки редактора."""
    return message_error_response(
        message,
        status,
    )


def tpv_editor():
    """Открыть TPV Editor и установить роль редактора через POST."""
    if request.method == "POST":
        if session.get("tpv_launcher_allowed") is not True:
            return redirect(url_for("tpv"))

        session["tpv_role"] = "editor"
        return render_template("tpv-editor.html")

    if tpv_editor_allowed():
        return render_template("tpv-editor.html")

    return redirect(url_for("tpv"))


def register_tpv_editor_routes(
    application_namespace: dict[str, Any],
) -> dict[str, Any]:
    """Зарегистрировать базовый маршрут и вернуть общие callbacks."""
    app = application_namespace.get("app")
    if app is None:
        raise RuntimeError(
            "Не удалось зарегистрировать TPV Editor: "
            "отсутствует зависимость app."
        )

    existing = app.view_functions.get("tpv_editor")
    if existing is None:
        app.add_url_rule(
            "/tpv_editor",
            endpoint="tpv_editor",
            view_func=tpv_editor,
            methods=["GET", "POST"],
        )
    elif existing is not tpv_editor:
        raise RuntimeError(
            "Endpoint tpv_editor уже зарегистрирован "
            "другой функцией."
        )

    base_exports = {
        "tpv_editor": tpv_editor,
        "tpv_editor_allowed": tpv_editor_allowed,
        "tpv_editor_error": tpv_editor_error,
        "tpv_editor_normalize_text": (
            tpv_editor_normalize_text
        ),
    }

    runtime = dict(application_namespace)
    runtime.update(base_exports)

    return {
        **base_exports,
        "runtime": runtime,
    }


__all__ = [
    "ROUTES_VERSION",
    "register_tpv_editor_routes",
    "tpv_editor",
    "tpv_editor_allowed",
    "tpv_editor_error",
    "tpv_editor_normalize_text",
]
