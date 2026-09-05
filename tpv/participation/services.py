from __future__ import annotations

# TPV 15.1.3.7.4 STATUS NORMALIZER
LEGACY_APPLICATION_STATUS_MAP = {
    "pending": "reviewing",
    "approved": "accepted",
    "completed": "confirmed",
}

def normalize_application_status(value):
    if value is None:
        return None
    value = str(value).strip()
    return LEGACY_APPLICATION_STATUS_MAP.get(value, value)

"""Сервис заявок на участие TPV."""


from dataclasses import dataclass
from typing import Any

from .constants import ApplicationSource, ApplicationStatus, ThemeStatus

LEGACY_APPLICATION_STATUS_MAP = {"pending": "reviewing", "approved": "accepted", "completed": "confirmed"}
def normalize_application_status(value):
    return LEGACY_APPLICATION_STATUS_MAP.get(value, value)



class ParticipationValidationError(ValueError):
    """Ошибка пользовательских данных заявки."""

    def __init__(self, message: str, *, field: str | None = None):
        super().__init__(message)
        self.field = field


@dataclass(slots=True)
class TpvParticipationService:
    db: Any
    model: Any

    @staticmethod
    def _required_text(
        value: Any,
        *,
        field: str,
        field_key: str,
        max_length: int,
    ) -> str:
        # Нормализуем только пробелы, не меняя регистр пользователя.
        text = " ".join(str(value or "").strip().split())
        if not text:
            raise ParticipationValidationError(
                f"Введите {field.lower()}.",
                field=field_key,
            )
        if len(text) > max_length:
            raise ParticipationValidationError(
                f"Поле «{field}» не должно превышать {max_length} символов.",
                field=field_key,
            )
        return text

    def create_application(
        self,
        *,
        display_name: Any,
        theme: Any,
        created_from: str = ApplicationSource.PUBLIC_FORM,
    ):
        if created_from not in ApplicationSource.ALL:
            raise ParticipationValidationError(
                "Неизвестный источник заявки."
            )

        application = self.model(
            display_name=self._required_text(
                display_name,
                field="Имя / Никнейм",
                field_key="display_name",
                max_length=100,
            ),
            theme=self._required_text(
                theme,
                field="Тема",
                field_key="theme",
                max_length=300,
            ),
            status=ApplicationStatus.NEW,
            theme_status=ThemeStatus.UNCHECKED,
            created_from=created_from,
        )
        self.db.session.add(application)
        self.db.session.commit()
        return application

    def get_application(self, application_id: Any):
        try:
            normalized_id = int(application_id)
        except (TypeError, ValueError) as exc:
            raise ParticipationValidationError(
                "Номер заявки должен быть целым числом.",
                field="application_id",
            ) from exc

        if normalized_id < 1:
            raise ParticipationValidationError(
                "Номер заявки должен быть положительным числом.",
                field="application_id",
            )

        return self.db.session.get(self.model, normalized_id)

    def get_public_status(self, application_id: Any) -> dict[str, Any] | None:
        """Возвращает только данные, разрешённые для публичной страницы."""
        application = self.get_application(application_id)
        if application is None:
            return None

        return {
            "id": int(application.id),
            "display_name": application.display_name,
            "theme": application.theme,
            "status": application.status,
            "status_label": ApplicationStatus.LABELS.get(
                application.status,
                application.status,
            ),
            "theme_status": application.theme_status,
            "theme_status_label": ThemeStatus.LABELS.get(
                application.theme_status,
                application.theme_status,
            ),
            "public_comment": application.public_comment or "",
        }

    def update_application(
        self,
        application,
        *,
        status: str | None = None,
        theme_status: str | None = None,
        public_comment: Any | None = None,
        editor_comment: Any | None = None,
    ):
        if status is not None:
            status = normalize_application_status(status)
            if status not in ApplicationStatus.ALL:
                raise ParticipationValidationError(
                    "Неизвестный статус заявки."
                )
            application.status = status

        if theme_status is not None:
            if theme_status not in ThemeStatus.ALL:
                raise ParticipationValidationError(
                    "Неизвестный статус проверки темы."
                )
            application.theme_status = theme_status

        if public_comment is not None:
            application.public_comment = str(public_comment).strip()[:2000]

        if editor_comment is not None:
            application.editor_comment = str(editor_comment).strip()[:4000]

        self.db.session.commit()
        return application

    def create_player_from_application(self, application):
        """Будет реализовано на этапе 12.0.4.

        Ручное добавление игроков в TPV Editor остаётся независимым.
        """
        raise NotImplementedError(
            "Legacy service hook is not used by the current TPV Editor."
        )


def create_participation_service(db, model) -> TpvParticipationService:
    return TpvParticipationService(db=db, model=model)


__all__ = [
    "ParticipationValidationError",
    "TpvParticipationService",
    "create_participation_service",
]
