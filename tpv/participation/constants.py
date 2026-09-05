"""Константы заявок на участие TPV."""

from __future__ import annotations


class ApplicationStatus:
    NEW = "new"
    IN_REVIEW = "reviewing"
    NEEDS_CLARIFICATION = "needs_clarification"
    ACCEPTED = "accepted"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"

    ALL = (
        NEW,
        IN_REVIEW,
        NEEDS_CLARIFICATION,
        ACCEPTED,
        CONFIRMED,
        REJECTED,
    )

    LABELS = {
        NEW: "Новая",
        IN_REVIEW: "На рассмотрении",
        NEEDS_CLARIFICATION: "Требуется уточнение",
        ACCEPTED: "Принята",
        CONFIRMED: "Подтверждена",
        REJECTED: "Отклонена",
    }


class ThemeStatus:
    UNCHECKED = "unchecked"
    UNIQUE = "unique"
    SIMILAR = "similar"
    EXISTS = "exists"

    ALL = (
        UNCHECKED,
        UNIQUE,
        SIMILAR,
        EXISTS,
    )

    LABELS = {
        UNCHECKED: "Не проверена",
        UNIQUE: "Такой темы нет",
        SIMILAR: "Есть похожая тема",
        EXISTS: "Такая тема уже существует",
    }


class ApplicationSource:
    PUBLIC_FORM = "public_form"
    EDITOR = "editor"
    IMPORT = "import"

    ALL = (
        PUBLIC_FORM,
        EDITOR,
        IMPORT,
    )


__all__ = [
    "ApplicationStatus",
    "ThemeStatus",
    "ApplicationSource",
]
