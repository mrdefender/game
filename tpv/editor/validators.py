"""Общая нормализация и валидация данных TPV Editor."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Collection


_WHITESPACE_RE = re.compile(r"\s+")


@dataclass(slots=True)
class ValidationError(ValueError):
    """Ошибка валидации с необязательной привязкой к полю."""

    message: str
    field: str | None = None

    def __str__(self) -> str:
        return self.message


def normalize_text(value: Any) -> str:
    """Убрать пробелы по краям и объединить повторяющиеся пробелы."""
    if value is None:
        return ""
    return _WHITESPACE_RE.sub(" ", str(value)).strip()


def require_text(
    value: Any,
    *,
    field: str,
    label: str,
    max_length: int | None = None,
    min_length: int = 1,
) -> str:
    """Проверить обязательную строку и вернуть нормализованное значение."""
    text = normalize_text(value)

    if len(text) < min_length:
        raise ValidationError(f"Укажите {label}.", field)

    if max_length is not None and len(text) > max_length:
        raise ValidationError(
            f"{label.capitalize()} должно содержать не более "
            f"{max_length} символов.",
            field,
        )

    return text


def parse_positive_int(
    value: Any,
    *,
    field: str,
    label: str,
    minimum: int = 1,
    maximum: int | None = None,
) -> int:
    """Преобразовать значение в положительное целое число."""
    try:
        number = int(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError(
            f"{label.capitalize()} должно быть целым числом.",
            field,
        ) from exc

    if number < minimum:
        raise ValidationError(
            f"{label.capitalize()} должно быть не меньше {minimum}.",
            field,
        )

    if maximum is not None and number > maximum:
        raise ValidationError(
            f"{label.capitalize()} должно быть не больше {maximum}.",
            field,
        )

    return number


def parse_choice(
    value: Any,
    *,
    field: str,
    label: str,
    choices: Collection[str],
    default: str | None = None,
) -> str:
    """Проверить значение по разрешённому набору."""
    normalized = normalize_text(value)

    if not normalized and default is not None:
        normalized = default

    if normalized not in choices:
        raise ValidationError(f"Некорректное значение поля «{label}».", field)

    return normalized
