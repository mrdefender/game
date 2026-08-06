"""Backward-compatible import for TPV Editor routes.

Canonical module: :mod:`tpv.editor_routes`.
This proxy can be removed after all external imports have migrated.
"""

from .editor_routes import ROUTES_VERSION, register_tpv_editor_routes

__all__ = ["ROUTES_VERSION", "register_tpv_editor_routes"]
