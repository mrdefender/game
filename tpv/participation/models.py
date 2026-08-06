"""ORM-модель заявок на участие TPV — этап 12.0.1."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

from .constants import ApplicationSource, ApplicationStatus, ThemeStatus


@dataclass(frozen=True)
class ParticipationModels:
    TpvParticipationApplication: Any


def create_participation_models(db) -> ParticipationModels:
    """Создаёт модель без импорта ``game.py`` и циклических зависимостей."""

    class TpvParticipationApplication(db.Model):
        __tablename__ = "tpv_participation_applications"

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)

        # Пользователь сам решает, что написать: имя или никнейм.
        display_name = db.Column(db.String(160), nullable=False)
        theme = db.Column(db.String(300), nullable=False)

        status = db.Column(
            db.String(40),
            nullable=False,
            default=ApplicationStatus.NEW,
            index=True,
        )
        theme_status = db.Column(
            db.String(40),
            nullable=False,
            default=ThemeStatus.UNCHECKED,
            index=True,
        )

        public_comment = db.Column(db.Text, nullable=False, default="")
        editor_comment = db.Column(db.Text, nullable=False, default="")

        created_from = db.Column(
            db.String(40),
            nullable=False,
            default=ApplicationSource.PUBLIC_FORM,
            index=True,
        )

        created_at = db.Column(
            db.DateTime,
            nullable=False,
            default=datetime.now,
            index=True,
        )
        updated_at = db.Column(
            db.DateTime,
            nullable=False,
            default=datetime.now,
            onupdate=datetime.now,
        )

        def to_public_dict(self) -> dict[str, Any]:
            """Безопасное представление для публичной проверки статуса."""
            return {
                "id": self.id,
                "display_name": self.display_name,
                "theme": self.theme,
                "status": self.status,
                "status_label": ApplicationStatus.LABELS.get(
                    self.status,
                    self.status,
                ),
                "theme_status": self.theme_status,
                "theme_status_label": ThemeStatus.LABELS.get(
                    self.theme_status,
                    self.theme_status,
                ),
                "public_comment": self.public_comment or "",
                "created_at": self.created_at.isoformat(timespec="seconds"),
                "updated_at": self.updated_at.isoformat(timespec="seconds"),
            }

        def to_editor_dict(self) -> dict[str, Any]:
            """Полное представление для TPV Editor."""
            return {
                **self.to_public_dict(),
                "editor_comment": self.editor_comment or "",
                "created_from": self.created_from,
            }

    return ParticipationModels(
        TpvParticipationApplication=TpvParticipationApplication,
    )


__all__ = [
    "ParticipationModels",
    "create_participation_models",
]
