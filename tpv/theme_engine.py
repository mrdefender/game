from __future__ import annotations

from datetime import datetime
import json
import re
from typing import Any, Callable

from flask import Blueprint, jsonify, request
from sqlalchemy import inspect


PRESETS = [
    {
        "slug": "tpv-dark",
        "name": "TPV Dark",
        "description": "Стандартная тема TPV Editor.",
        "variables": {
            "--bg": "#071019",
            "--panel": "#0d1c2a",
            "--line": "rgba(108,222,255,.22)",
            "--text": "#eef9ff",
            "--muted": "#8ca7b8",
            "--cyan": "#67dcff",
            "--green": "#6be2ad",
            "--red": "#ff7584",
        },
    },
    {
        "slug": "studio-blue",
        "name": "Studio Blue",
        "description": "Холодная телевизионная синяя палитра.",
        "variables": {
            "--bg": "#07111f",
            "--panel": "#0c2138",
            "--line": "rgba(77,170,255,.28)",
            "--text": "#f1f7ff",
            "--muted": "#91a9c4",
            "--cyan": "#4daaff",
            "--green": "#65ddb0",
            "--red": "#ff7188",
        },
    },
    {
        "slug": "emerald",
        "name": "Emerald",
        "description": "Тёмная изумрудная палитра.",
        "variables": {
            "--bg": "#071512",
            "--panel": "#0d2922",
            "--line": "rgba(92,226,179,.25)",
            "--text": "#effff9",
            "--muted": "#91b5a7",
            "--cyan": "#5ce2b3",
            "--green": "#86f0bf",
            "--red": "#ff788b",
        },
    },
    {
        "slug": "violet",
        "name": "Violet Studio",
        "description": "Студийная тема с фиолетовым акцентом.",
        "variables": {
            "--bg": "#110b19",
            "--panel": "#21152f",
            "--line": "rgba(192,123,255,.27)",
            "--text": "#fbf5ff",
            "--muted": "#b09abb",
            "--cyan": "#c07bff",
            "--green": "#77e3b1",
            "--red": "#ff7898",
        },
    },
    {
        "slug": "high-contrast",
        "name": "High Contrast",
        "description": "Максимальная читаемость и контраст.",
        "variables": {
            "--bg": "#000000",
            "--panel": "#101010",
            "--line": "rgba(255,255,255,.42)",
            "--text": "#ffffff",
            "--muted": "#c9c9c9",
            "--cyan": "#00e5ff",
            "--green": "#57ff9a",
            "--red": "#ff5c73",
        },
    },
]


def register_tpv_editor_theme_engine(
    app,
    db,
    *,
    allowed: Callable[[], bool],
    error: Callable[[str, int], Any],
):
    class EditorTheme(db.Model):
        __tablename__ = "tpv_editor_themes"

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        slug = db.Column(db.String(80), nullable=False, unique=True)
        name = db.Column(db.String(120), nullable=False)
        description = db.Column(db.String(300), nullable=False, default="")
        is_system = db.Column(db.Boolean, nullable=False, default=True)
        variables_json = db.Column(db.Text, nullable=False, default="{}")
        created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
        updated_at = db.Column(
            db.DateTime,
            nullable=False,
            default=datetime.now,
            onupdate=datetime.now,
        )

    class EditorSetting(db.Model):
        __tablename__ = "tpv_editor_settings"

        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        key = db.Column(db.String(80), nullable=False, unique=True)
        value = db.Column(db.Text, nullable=False, default="")
        updated_at = db.Column(
            db.DateTime,
            nullable=False,
            default=datetime.now,
            onupdate=datetime.now,
        )

    bp = Blueprint(
        "tpv_editor_theme_engine",
        __name__,
        url_prefix="/tpv_editor/api/interface-themes",
    )

    required = {"tpv_editor_themes", "tpv_editor_settings"}
    allowed_vars = {
        "--bg", "--panel", "--line", "--text",
        "--muted", "--cyan", "--green", "--red",
    }

    def guard():
        if allowed():
            return None
        return error("Нет доступа к настройкам оформления.", 403)

    def exists():
        try:
            names = set(inspect(db.engine).get_table_names())
            return required.issubset(names)
        except Exception:
            return False

    def setting(key: str, default: str = "") -> str:
        if not exists():
            return default
        row = db.session.scalar(
            db.select(EditorSetting).where(EditorSetting.key == key).limit(1)
        )
        return row.value if row else default

    def set_setting(key: str, value: str):
        row = db.session.scalar(
            db.select(EditorSetting).where(EditorSetting.key == key).limit(1)
        )
        if row is None:
            db.session.add(EditorSetting(key=key, value=value))
        else:
            row.value = value

    def serialize(row):
        try:
            values = json.loads(row.variables_json or "{}")
        except json.JSONDecodeError:
            values = {}
        return {
            "id": row.id,
            "slug": row.slug,
            "name": row.name,
            "description": row.description or "",
            "is_system": bool(row.is_system),
            "variables": {
                key: str(value)
                for key, value in values.items()
                if key in allowed_vars
            },
        }

    def seed():
        existing = {
            row.slug: row
            for row in db.session.scalars(db.select(EditorTheme)).all()
        }
        for preset in PRESETS:
            payload = json.dumps(preset["variables"], ensure_ascii=False)
            row = existing.get(preset["slug"])
            if row is None:
                db.session.add(EditorTheme(
                    slug=preset["slug"],
                    name=preset["name"],
                    description=preset["description"],
                    is_system=True,
                    variables_json=payload,
                ))
            else:
                row.name = preset["name"]
                row.description = preset["description"]
                row.variables_json = payload

        if not setting("current_theme_slug"):
            set_setting("current_theme_slug", "tpv-dark")
        db.session.commit()

    def create_tables():
        EditorTheme.__table__.create(bind=db.engine, checkfirst=True)
        EditorSetting.__table__.create(bind=db.engine, checkfirst=True)
        seed()

    def fallback():
        preset = PRESETS[0]
        return {
            "id": None,
            "slug": preset["slug"],
            "name": preset["name"],
            "description": preset["description"],
            "is_system": True,
            "variables": preset["variables"],
        }

    def current():
        if not exists():
            return fallback()
        slug = setting("current_theme_slug", "tpv-dark")
        row = db.session.scalar(
            db.select(EditorTheme).where(EditorTheme.slug == slug).limit(1)
        )
        if row is None:
            row = db.session.scalar(
                db.select(EditorTheme).where(
                    EditorTheme.slug == "tpv-dark"
                ).limit(1)
            )
        return serialize(row) if row else fallback()

    @bp.get("")
    def list_themes():
        denied = guard()
        if denied:
            return denied
        if not exists():
            return jsonify({
                "ok": True,
                "table_exists": False,
                "current_slug": "tpv-dark",
                "themes": [],
                "theme": fallback(),
            })
        seed()
        rows = db.session.scalars(
            db.select(EditorTheme).order_by(EditorTheme.name)
        ).all()
        return jsonify({
            "ok": True,
            "table_exists": True,
            "current_slug": setting("current_theme_slug", "tpv-dark"),
            "themes": [serialize(row) for row in rows],
            "theme": current(),
        })

    @bp.get("/current")
    def get_current():
        denied = guard()
        if denied:
            return denied
        return jsonify({
            "ok": True,
            "table_exists": exists(),
            "theme": current(),
        })

    @bp.post("/create-tables")
    def init_engine():
        denied = guard()
        if denied:
            return denied
        create_tables()
        return jsonify({
            "ok": True,
            "message": "Theme Engine создан.",
            "theme": current(),
        })

    @bp.post("/select")
    def select():
        denied = guard()
        if denied:
            return denied
        if not exists():
            return error("Сначала создайте Theme Engine.", 409)

        data = request.get_json(silent=True) or {}
        slug = str(data.get("slug") or "").strip()
        row = db.session.scalar(
            db.select(EditorTheme).where(EditorTheme.slug == slug).limit(1)
        )
        if row is None:
            return error("Тема не найдена.", 404)

        set_setting("current_theme_slug", row.slug)
        db.session.commit()
        return jsonify({
            "ok": True,
            "message": f"Применена тема «{row.name}».",
            "theme": serialize(row),
        })

    @bp.post("/reset")
    def reset():
        denied = guard()
        if denied:
            return denied
        if not exists():
            return error("Сначала создайте Theme Engine.", 409)

        set_setting("current_theme_slug", "tpv-dark")
        db.session.commit()
        return jsonify({
            "ok": True,
            "message": "Восстановлена тема TPV Dark.",
            "theme": current(),
        })


    def normalize_slug(value: str) -> str:
        value = str(value or "").strip().lower()
        value = re.sub(r"[^a-z0-9а-яё_-]+", "-", value, flags=re.IGNORECASE)
        value = re.sub(r"-{2,}", "-", value).strip("-_")
        return value[:80] or "custom-theme"

    def unique_slug(base_slug: str, current_id: int | None = None) -> str:
        candidate = normalize_slug(base_slug)
        suffix = 2
        while True:
            row = db.session.scalar(
                db.select(EditorTheme)
                .where(EditorTheme.slug == candidate)
                .limit(1)
            )
            if row is None or row.id == current_id:
                return candidate
            candidate = f"{normalize_slug(base_slug)[:70]}-{suffix}"
            suffix += 1

    def normalize_variables(data: Any) -> dict[str, str]:
        if not isinstance(data, dict):
            raise ValueError("Палитра темы должна быть JSON-объектом.")

        result = {}
        for key in allowed_vars:
            if key not in data:
                continue
            value = str(data[key] or "").strip()
            if not value:
                raise ValueError(f"Переменная {key} не может быть пустой.")
            if len(value) > 100:
                raise ValueError(f"Слишком длинное значение переменной {key}.")
            result[key] = value

        missing = sorted(allowed_vars - set(result))
        if missing:
            raise ValueError(
                "В палитре отсутствуют переменные: " + ", ".join(missing)
            )
        return result

    def theme_document(row: EditorTheme) -> dict[str, Any]:
        return {
            "format": "TPV_EDITOR_THEME",
            "version": "1.0",
            "theme": serialize(row),
        }

    @bp.post("/copy")
    def copy_theme():
        denied = guard()
        if denied:
            return denied
        if not exists():
            return error("Сначала создайте Theme Engine.", 409)

        data = request.get_json(silent=True) or {}
        source_slug = str(data.get("source_slug") or "").strip()
        source = db.session.scalar(
            db.select(EditorTheme)
            .where(EditorTheme.slug == source_slug)
            .limit(1)
        )
        if source is None:
            return error("Исходная тема не найдена.", 404)

        requested_name = str(data.get("name") or "").strip()
        name = requested_name or f"{source.name} — копия"
        if len(name) > 120:
            return error("Название темы не должно превышать 120 символов.", 400)

        slug = unique_slug(data.get("slug") or name)
        row = EditorTheme(
            slug=slug,
            name=name,
            description=str(
                data.get("description")
                or f"Пользовательская копия темы «{source.name}»."
            )[:300],
            is_system=False,
            variables_json=source.variables_json,
        )
        db.session.add(row)
        db.session.flush()
        set_setting("current_theme_slug", row.slug)
        db.session.commit()

        return jsonify({
            "ok": True,
            "message": f"Создана пользовательская тема «{row.name}».",
            "theme": serialize(row),
        }), 201

    @bp.post("/save")
    def save_custom_theme():
        denied = guard()
        if denied:
            return denied
        if not exists():
            return error("Сначала создайте Theme Engine.", 409)

        data = request.get_json(silent=True) or {}
        theme_id = data.get("id")
        row = db.session.get(EditorTheme, int(theme_id)) if theme_id else None

        if row is None:
            return error("Пользовательская тема не найдена.", 404)
        if row.is_system:
            return error(
                "Системную тему нельзя изменять. Сначала создайте её копию.",
                409,
            )

        name = str(data.get("name") or "").strip()
        if not name:
            return error("Укажите название темы.", 400)
        if len(name) > 120:
            return error("Название темы не должно превышать 120 символов.", 400)

        description = str(data.get("description") or "").strip()
        if len(description) > 300:
            return error("Описание не должно превышать 300 символов.", 400)

        try:
            variables = normalize_variables(data.get("variables"))
        except ValueError as exc:
            return error(str(exc), 400)

        row.name = name
        row.description = description
        row.slug = unique_slug(data.get("slug") or row.slug or name, row.id)
        row.variables_json = json.dumps(
            variables,
            ensure_ascii=False,
            sort_keys=True,
        )
        set_setting("current_theme_slug", row.slug)
        db.session.commit()

        return jsonify({
            "ok": True,
            "message": f"Тема «{row.name}» сохранена.",
            "theme": serialize(row),
        })

    @bp.delete("/<int:theme_id>")
    def delete_custom_theme(theme_id: int):
        denied = guard()
        if denied:
            return denied
        if not exists():
            return error("Сначала создайте Theme Engine.", 409)

        row = db.session.get(EditorTheme, theme_id)
        if row is None:
            return error("Тема не найдена.", 404)
        if row.is_system:
            return error("Системные темы удалить нельзя.", 409)

        was_active = setting("current_theme_slug", "tpv-dark") == row.slug
        name = row.name
        db.session.delete(row)
        if was_active:
            set_setting("current_theme_slug", "tpv-dark")
        db.session.commit()

        return jsonify({
            "ok": True,
            "message": f"Тема «{name}» удалена.",
            "theme": current(),
        })

    @bp.get("/<int:theme_id>/export")
    def export_theme(theme_id: int):
        denied = guard()
        if denied:
            return denied
        if not exists():
            return error("Сначала создайте Theme Engine.", 409)

        row = db.session.get(EditorTheme, theme_id)
        if row is None:
            return error("Тема не найдена.", 404)

        return jsonify({
            "ok": True,
            "document": theme_document(row),
        })

    @bp.post("/import")
    def import_theme():
        denied = guard()
        if denied:
            return denied
        if not exists():
            return error("Сначала создайте Theme Engine.", 409)

        document = request.get_json(silent=True)
        if not isinstance(document, dict):
            return error("Некорректный JSON темы.", 400)

        if document.get("format") == "TPV_EDITOR_THEME":
            version = str(document.get("version") or "")
            if version != "1.0":
                return error(
                    f"Версия темы {version or 'не указана'} не поддерживается.",
                    400,
                )
            data = document.get("theme")
        elif "variables" in document:
            data = document
        else:
            return error("Файл не является темой TPV Editor.", 400)

        if not isinstance(data, dict):
            return error("В файле отсутствует объект theme.", 400)

        try:
            variables = normalize_variables(data.get("variables"))
        except ValueError as exc:
            return error(str(exc), 400)

        name = str(data.get("name") or "Импортированная тема").strip()
        if not name:
            name = "Импортированная тема"

        row = EditorTheme(
            slug=unique_slug(data.get("slug") or name),
            name=name[:120],
            description=str(data.get("description") or "")[:300],
            is_system=False,
            variables_json=json.dumps(
                variables,
                ensure_ascii=False,
                sort_keys=True,
            ),
        )
        db.session.add(row)
        db.session.flush()
        set_setting("current_theme_slug", row.slug)
        db.session.commit()

        return jsonify({
            "ok": True,
            "message": f"Тема «{row.name}» импортирована.",
            "theme": serialize(row),
        }), 201

    app.register_blueprint(bp)

    return {
        "EditorTheme": EditorTheme,
        "EditorSetting": EditorSetting,
    }
