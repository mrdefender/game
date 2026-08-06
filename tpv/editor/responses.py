"""Единые JSON-ответы TPV Editor."""

from __future__ import annotations

from typing import Any

from flask import jsonify


def success_response(
    *,
    data: dict[str, Any] | None = None,
    status: int = 200,
    message: str | None = None,
    **fields: Any,
):
    """Вернуть успешный JSON-ответ в едином формате."""
    payload: dict[str, Any] = {"ok": True}

    if message is not None:
        payload["message"] = message
    if data:
        payload.update(data)
    if fields:
        payload.update(fields)

    return jsonify(payload), status


def error_response(
    message: str,
    status: int = 400,
    *,
    field: str | None = None,
    code: str | None = None,
    **fields: Any,
):
    """Вернуть ошибку в едином JSON-формате."""
    payload: dict[str, Any] = {
        "ok": False,
        "error": str(message),
    }

    if field:
        payload["field"] = field
    if code:
        payload["code"] = code
    if fields:
        payload.update(fields)

    return jsonify(payload), status



def message_error_response(
    message: str,
    status: int = 400,
    **fields: Any,
):
    """Вернуть совместимую ошибку с полем ``message``."""
    payload: dict[str, Any] = {
        "ok": False,
        "message": str(message),
    }
    if fields:
        payload.update(fields)

    return jsonify(payload), status

def forbidden_response(message: str = "Нет доступа к редактору."):
    """Вернуть стандартный ответ 403."""
    return error_response(message, 403, code="forbidden")


def not_found_response(message: str = "Запись не найдена."):
    """Вернуть стандартный ответ 404."""
    return error_response(message, 404, code="not_found")
