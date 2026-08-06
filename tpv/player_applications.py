"""Player application routes for TPV.

This module is registered from tpv.application and does not import game.py.
It adds a public application form and TPV Editor moderation API.
Existing manual UsersTpv creation remains unchanged.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Mapping

from flask import jsonify, render_template, request
from sqlalchemy import func, inspect


ALLOWED_STATUSES = {"new", "reviewing", "approved", "rejected", "archived"}


def register_tpv_player_applications(runtime: Mapping[str, Any]) -> dict[str, Any]:
    app = runtime["app"]
    db = runtime["db"]
    UsersTpv = runtime["UsersTpv"]
    TpvPlayerApplication = runtime["TpvPlayerApplication"]
    allowed = runtime["tpv_editor_allowed"]
    error = runtime["tpv_editor_error"]

    def table_exists() -> bool:
        try:
            return TpvPlayerApplication.__tablename__ in inspect(db.engine).get_table_names()
        except Exception:
            return False

    def normalize(value: Any) -> str:
        return " ".join(str(value or "").strip().split())

    def to_dict(row) -> dict[str, Any]:
        return {
            "id": row.id,
            "display_name": row.display_name,
            "game_topic": row.game_topic,
            "status": row.status,
            "moderator_comment": row.moderator_comment or "",
            "created_at": row.created_at.isoformat(timespec="seconds"),
            "updated_at": row.updated_at.isoformat(timespec="seconds"),
            "reviewed_at": (
                row.reviewed_at.isoformat(timespec="seconds")
                if row.reviewed_at else None
            ),
            "created_user_id": row.created_user_id,
        }

    @app.route("/tpv/apply", methods=["GET", "POST"])
    def tpv_player_apply():
        if request.method == "GET":
            return render_template("tpv/player_application.html")

        if not table_exists():
            return jsonify({
                "ok": False,
                "error": "Сервис заявок временно недоступен."
            }), 503

        data = request.get_json(silent=True) or request.form
        display_name = normalize(data.get("display_name"))
        game_topic = normalize(data.get("game_topic"))

        if len(display_name) < 2:
            return jsonify({
                "ok": False,
                "error": "Укажите имя или никнейм — минимум 2 символа."
            }), 400
        if len(display_name) > 100:
            return jsonify({
                "ok": False,
                "error": "Имя или никнейм не должно превышать 100 символов."
            }), 400
        if len(game_topic) < 2:
            return jsonify({
                "ok": False,
                "error": "Укажите тему игры — минимум 2 символа."
            }), 400
        if len(game_topic) > 200:
            return jsonify({
                "ok": False,
                "error": "Тема не должна превышать 200 символов."
            }), 400

        row = TpvPlayerApplication(
            display_name=display_name,
            game_topic=game_topic,
            status="new",
        )
        db.session.add(row)
        db.session.commit()

        return jsonify({
            "ok": True,
            "message": "Заявка принята. Организатор рассмотрит её.",
            "application_id": row.id,
        }), 201

    @app.get("/tpv_editor/player-applications")
    def tpv_editor_player_applications_page():
        if not allowed():
            return error("Нет доступа к редактору.", 403)
        return render_template("tpv_editor/player_applications.html")

    @app.get("/tpv_editor/api/player-applications")
    def tpv_editor_player_applications_list():
        if not allowed():
            return error("Нет доступа к редактору.", 403)

        if not table_exists():
            return jsonify({
                "ok": True,
                "table_exists": False,
                "items": [],
                "stats": {status: 0 for status in ALLOWED_STATUSES},
            })

        status = normalize(request.args.get("status"))
        search = normalize(request.args.get("search"))

        stmt = db.select(TpvPlayerApplication)
        if status and status in ALLOWED_STATUSES:
            stmt = stmt.where(TpvPlayerApplication.status == status)
        if search:
            pattern = f"%{search.casefold()}%"
            stmt = stmt.where(
                func.lower(TpvPlayerApplication.display_name).like(pattern)
                | func.lower(TpvPlayerApplication.game_topic).like(pattern)
            )

        rows = db.session.scalars(
            stmt.order_by(TpvPlayerApplication.created_at.desc())
        ).all()

        stats = {}
        for item_status in ALLOWED_STATUSES:
            stats[item_status] = int(db.session.scalar(
                db.select(func.count(TpvPlayerApplication.id)).where(
                    TpvPlayerApplication.status == item_status
                )
            ) or 0)

        return jsonify({
            "ok": True,
            "table_exists": True,
            "items": [to_dict(row) for row in rows],
            "stats": stats,
        })

    @app.patch("/tpv_editor/api/player-applications/<int:application_id>")
    def tpv_editor_player_application_update(application_id: int):
        if not allowed():
            return error("Нет доступа к редактору.", 403)

        row = db.session.get(TpvPlayerApplication, application_id)
        if row is None:
            return error("Заявка не найдена.", 404)

        data = request.get_json(silent=True) or {}
        status = normalize(data.get("status"))
        if status:
            if status not in ALLOWED_STATUSES:
                return error("Некорректный статус заявки.")
            row.status = status
            if status in {"approved", "rejected"}:
                row.reviewed_at = datetime.utcnow()

        if "moderator_comment" in data:
            comment = normalize(data.get("moderator_comment"))
            if len(comment) > 1000:
                return error("Комментарий не должен превышать 1000 символов.")
            row.moderator_comment = comment

        row.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"ok": True, "item": to_dict(row)})

    @app.post("/tpv_editor/api/player-applications/<int:application_id>/create-player")
    def tpv_editor_player_application_create_player(application_id: int):
        """Create a UsersTpv row from an application.

        This is an additional path. Existing manual player creation remains active.
        """
        if not allowed():
            return error("Нет доступа к редактору.", 403)

        row = db.session.get(TpvPlayerApplication, application_id)
        if row is None:
            return error("Заявка не найдена.", 404)
        if row.created_user_id:
            return error("Игрок по этой заявке уже создан.", 409)

        data = request.get_json(silent=True) or {}
        username = normalize(data.get("username") or row.display_name)
        if len(username) < 2 or len(username) > 64:
            return error("Имя игрока должно содержать от 2 до 64 символов.")

        duplicate = db.session.scalar(
            db.select(UsersTpv).where(
                func.lower(UsersTpv.username) == username.casefold()
            )
        )
        if duplicate is not None:
            return jsonify({
                "ok": False,
                "error": "Игрок с таким именем уже существует.",
                "existing_user_id": duplicate.id,
            }), 409

        user = UsersTpv(
            username=username,
            flip=row.game_topic,
            money=0,
            approve="false",
            flip_col=0,
        )
        db.session.add(user)
        db.session.flush()

        row.created_user_id = user.id
        row.status = "approved"
        row.reviewed_at = datetime.utcnow()
        row.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "ok": True,
            "message": "Игрок создан из заявки.",
            "user": {
                "id": user.id,
                "username": user.username,
                "flip": user.flip,
            },
            "application": to_dict(row),
        }), 201

    @app.post("/tpv_editor/api/player-applications/<int:application_id>/link-player")
    def tpv_editor_player_application_link_player(application_id: int):
        if not allowed():
            return error("Нет доступа к редактору.", 403)

        row = db.session.get(TpvPlayerApplication, application_id)
        if row is None:
            return error("Заявка не найдена.", 404)

        data = request.get_json(silent=True) or {}
        try:
            user_id = int(data.get("user_id"))
        except (TypeError, ValueError):
            return error("Некорректный ID игрока.")

        user = db.session.get(UsersTpv, user_id)
        if user is None:
            return error("Игрок не найден.", 404)

        row.created_user_id = user.id
        row.status = "approved"
        row.reviewed_at = datetime.utcnow()
        row.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({"ok": True, "application": to_dict(row)})

    @app.delete("/tpv_editor/api/player-applications/<int:application_id>")
    def tpv_editor_player_application_delete(application_id: int):
        if not allowed():
            return error("Нет доступа к редактору.", 403)

        row = db.session.get(TpvPlayerApplication, application_id)
        if row is None:
            return error("Заявка не найдена.", 404)

        db.session.delete(row)
        db.session.commit()
        return jsonify({"ok": True, "message": "Заявка удалена."})

    return {
        "tpv_player_applications_table_exists": table_exists,
    }


__all__ = ["register_tpv_player_applications"]
