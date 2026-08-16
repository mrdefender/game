"""Модуль заявок на участие TPV."""

from __future__ import annotations

from .constants import ApplicationSource, ApplicationStatus, ThemeStatus
from .models import ParticipationModels, create_participation_models
from .routes import register_participation_routes
from .services import (
    ParticipationValidationError,
    TpvParticipationService,
    create_participation_service,
)


def register_tpv_participation(app, db):
    """Регистрирует модель, таблицу, сервис и технический endpoint."""

    models = create_participation_models(db)
    model = models.TpvParticipationApplication

    # Проект использует SQLite без отдельного migration runner.
    # checkfirst не изменяет уже существующую таблицу.
    with app.app_context():
        model.__table__.create(bind=db.engine, checkfirst=True)

    service = create_participation_service(db, model)
    route_exports = register_participation_routes(
        app,
        service=service,
    )

    return {
        "models": models,
        "model": model,
        "service": service,
        "routes": route_exports,
    }


__all__ = [
    "ApplicationSource",
    "ApplicationStatus",
    "ThemeStatus",
    "ParticipationModels",
    "ParticipationValidationError",
    "TpvParticipationService",
    "create_participation_models",
    "create_participation_service",
    "register_participation_routes",
    "register_tpv_participation",
]
