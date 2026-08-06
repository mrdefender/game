"""Backward-compatible root import for TPV Editor routes.

Canonical module: :mod:`tpv.editor_routes`.
"""

from tpv.editor_routes import ROUTES_VERSION, register_tpv_editor_routes

__all__ = ["ROUTES_VERSION", "register_tpv_editor_routes"]
