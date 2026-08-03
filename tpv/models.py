"""Core ORM models for The People Versus.

Этап 11.2. Модели создаются через фабрику, потому что экземпляр
Flask-SQLAlchemy пока инициализируется в game.py. Фабрика не импортирует
основное приложение и поэтому не создаёт циклическую зависимость.
"""

from __future__ import annotations

from datetime import datetime
from types import SimpleNamespace
from typing import Any


def create_tpv_models(db, user_mixin: type) -> SimpleNamespace:
    """Create and return TPV ORM model classes bound to ``db``.

    Explicit ``__tablename__`` values preserve the existing SQLite schema.
    Calling this factory more than once for the same metadata is not supported;
    the application calls it exactly once during startup.
    """

    class UsersTpv(db.Model):
        __tablename__ = "users_tpv"

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        username = db.Column(db.String(64), unique=True, nullable=False)
        flip = db.Column(db.Text)
        money = db.Column(db.Integer, default=0)
        approve = db.Column(db.Text)
        flip_col = db.Column(db.Integer, default=0)

        def __repr__(self):
            return f"<UsersTpv {self.id!r}>"

    class Questions_tpv(db.Model):
        __tablename__ = "questions_tpv"

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        task = db.Column(db.Text)
        answer = db.Column(db.Text)
        comment = db.Column(db.Text)
        author = db.Column(db.Text)
        flip = db.Column(db.Text)
        show = db.Column(db.Text)

        def __repr__(self):
            return f"<Questions_tpv {self.id!r}>"

    class QueryTpv(db.Model, user_mixin):
        __tablename__ = "query_tpv"

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        username = db.Column(db.String(64), unique=True, nullable=False)
        flip = db.Column(db.Text)
        money = db.Column(db.Integer, default=0)
        status = db.Column(db.Text, default="wait")

        def __repr__(self):
            return f"<QueryTpv {self.id!r}>"

    class TpvEditorHistory(db.Model):
        __tablename__ = "tpv_editor_history"

        id = db.Column(db.Integer, primary_key=True)
        created_at = db.Column(
            db.DateTime,
            nullable=False,
            default=datetime.utcnow,
            index=True,
        )
        entity_type = db.Column(db.String(24), nullable=False, index=True)
        entity_id = db.Column(db.String(64), nullable=True, index=True)
        action = db.Column(db.String(24), nullable=False, index=True)
        title = db.Column(db.String(255), nullable=False)
        details = db.Column(db.Text, nullable=True)
        before_json = db.Column(db.Text, nullable=True)
        after_json = db.Column(db.Text, nullable=True)
        can_revert = db.Column(db.Boolean, nullable=False, default=False)
        reverted_at = db.Column(db.DateTime, nullable=True)
        revert_history_id = db.Column(db.Integer, nullable=True)

    class TpvGameBuild(db.Model):
        __tablename__ = "tpv_game_builds"

        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(120), nullable=False)
        config_json = db.Column(db.Text, nullable=False, default="{}")
        question_ids_json = db.Column(db.Text, nullable=False, default="[]")
        is_active = db.Column(db.Boolean, nullable=False, default=False, index=True)
        created_at = db.Column(
            db.DateTime,
            nullable=False,
            default=datetime.utcnow,
        )
        updated_at = db.Column(
            db.DateTime,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
            index=True,
        )

    class TpvQuestionApplication(db.Model):
        __tablename__ = "tpv_question_applications"

        id = db.Column(db.Integer, primary_key=True)
        author = db.Column(db.String(100), nullable=False, index=True)
        task = db.Column(db.Text, nullable=False)
        answer = db.Column(db.Text, nullable=False)
        comment = db.Column(db.Text, nullable=True)
        flip = db.Column(db.String(200), nullable=False, default="false", index=True)
        status = db.Column(db.String(16), nullable=False, default="pending", index=True)
        reject_reason = db.Column(db.Text, nullable=True)
        created_at = db.Column(
            db.DateTime,
            nullable=False,
            default=datetime.utcnow,
            index=True,
        )
        reviewed_at = db.Column(db.DateTime, nullable=True)
        reviewed_by = db.Column(db.String(100), nullable=True)
        question_id = db.Column(db.Integer, nullable=True, index=True)

    # Restore public class names/qualnames for logs, Flask-SQLAlchemy and tooling.
    classes: dict[str, Any] = {
        "UsersTpv": UsersTpv,
        "Questions_tpv": Questions_tpv,
        "QueryTpv": QueryTpv,
        "TpvEditorHistory": TpvEditorHistory,
        "TpvGameBuild": TpvGameBuild,
        "TpvQuestionApplication": TpvQuestionApplication,
    }
    for name, model in classes.items():
        model.__name__ = name
        model.__qualname__ = name
        model.__module__ = __name__

    return SimpleNamespace(**classes)


__all__ = ["create_tpv_models"]
