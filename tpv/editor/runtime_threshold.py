"""Single runtime source for the TPV replacement-theme question threshold.

Stage 15.1.2.1.9.12.4. Consumers must resolve the value at call time,
not cache it during service construction.
"""

from __future__ import annotations

from typing import Any


def required_flip_questions(context: Any) -> int:
    """Return the current operational threshold, with legacy fallback."""
    app = getattr(context, "app", None)
    if app is not None:
        service = app.extensions.get("tpv_operational_settings")
        getter = getattr(service, "required_flip_questions", None)
        if callable(getter):
            try:
                return max(1, int(getter()))
            except (TypeError, ValueError):
                pass

    getter = context.get("tpv_editor_required_flip_questions")
    if callable(getter):
        try:
            return max(1, int(getter()))
        except (TypeError, ValueError):
            pass

    try:
        return max(1, int(context.get("TPV_REQUIRED_FLIP_QUESTIONS", 5)))
    except (TypeError, ValueError):
        return 5


__all__ = ["required_flip_questions"]
