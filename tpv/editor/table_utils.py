"""Поиск, сортировка и пагинация коллекций TPV Editor."""

from __future__ import annotations

from dataclasses import dataclass
from math import ceil
from typing import Any, Callable, Iterable, Sequence, TypeVar


ItemT = TypeVar("ItemT")


@dataclass(frozen=True, slots=True)
class Page:
    """Одна страница результатов."""

    items: list[Any]
    page: int
    per_page: int
    total: int
    pages: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "items": self.items,
            "pagination": {
                "page": self.page,
                "per_page": self.per_page,
                "total": self.total,
                "pages": self.pages,
                "has_previous": self.page > 1,
                "has_next": self.page < self.pages,
            },
        }


def apply_text_search(
    items: Iterable[ItemT],
    query: str,
    *,
    values: Callable[[ItemT], Iterable[Any]],
) -> list[ItemT]:
    """Отфильтровать элементы по вхождению текста в одно из полей."""
    needle = str(query or "").strip().casefold()
    source = list(items)

    if not needle:
        return source

    return [
        item
        for item in source
        if any(
            needle in str(value or "").casefold()
            for value in values(item)
        )
    ]


def sort_items(
    items: Iterable[ItemT],
    *,
    key: Callable[[ItemT], Any],
    reverse: bool = False,
) -> list[ItemT]:
    """Вернуть устойчиво отсортированный список."""
    return sorted(items, key=key, reverse=reverse)


def paginate_items(
    items: Sequence[ItemT] | Iterable[ItemT],
    *,
    page: int = 1,
    per_page: int = 50,
    maximum_per_page: int = 500,
) -> Page:
    """Разбить коллекцию на страницу без зависимости от ORM."""
    source = list(items)
    safe_page = max(1, int(page or 1))
    safe_per_page = max(1, min(int(per_page or 50), maximum_per_page))

    total = len(source)
    pages = max(1, ceil(total / safe_per_page))
    safe_page = min(safe_page, pages)

    start = (safe_page - 1) * safe_per_page
    end = start + safe_per_page

    return Page(
        items=list(source[start:end]),
        page=safe_page,
        per_page=safe_per_page,
        total=total,
        pages=pages,
    )
