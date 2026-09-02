"""Yandex ID authentication for TPV public forms."""

from .yandex import get_yandex_user, is_yandex_auth_enabled, register_yandex_auth

__all__ = ["get_yandex_user", "is_yandex_auth_enabled", "register_yandex_auth"]
