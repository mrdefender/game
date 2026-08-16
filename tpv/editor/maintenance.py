"""Обслуживание SQLite для TPV Editor."""

from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
import shutil
from typing import Any

from flask import jsonify
from sqlalchemy import text

from .registry import EditorContext
from .responses import message_error_response


class MaintenanceService:
    """Резервное копирование и обслуживание базы TPV."""

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db

        self.QuestionApplication = self._dependency(
            "TpvQuestionApplication"
        )
        self.EditorHistory = self._dependency(
            "TpvEditorHistory"
        )

        self.applications_table_exists = self._dependency(
            "tpv_editor_applications_table_exists"
        )
        self.history_table_exists = self._dependency(
            "tpv_editor_history_table_exists"
        )

    def _dependency(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                "Обслуживание TPV Editor: "
                f"отсутствует зависимость {name}"
            )
        return value

    def database_path(self) -> Path:
        """Определить путь к основной SQLite-базе."""
        with self.db.engine.connect() as connection:
            rows = connection.execute(
                text("PRAGMA database_list")
            ).fetchall()

        main_row = next(
            (row for row in rows if row[1] == "main"),
            None,
        )
        if main_row is None or not main_row[2]:
            raise RuntimeError(
                "Не удалось определить файл SQLite."
            )

        return Path(str(main_row[2]))

    def create_backup(self) -> Path:
        """Создать файловую копию SQLite в каталоге backups."""
        self.db.session.commit()

        source = self.database_path()
        if not source.exists():
            raise RuntimeError("Файл SQLite не найден.")

        backup_dir = source.parent / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)

        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        suffix = source.suffix or ".sqlite"
        target = (
            backup_dir
            / f"{source.stem}_backup_{stamp}{suffix}"
        )

        shutil.copy2(source, target)
        return target

    def integrity_check(self) -> str:
        """Выполнить полную проверку целостности SQLite."""
        with self.db.engine.connect() as connection:
            return str(
                connection.execute(
                    text("PRAGMA integrity_check")
                ).scalar()
                or "unknown"
            )

    def analyze(self) -> None:
        """Обновить статистику планировщика SQLite."""
        self.db.session.commit()
        with self.db.engine.connect().execution_options(
            isolation_level="AUTOCOMMIT"
        ) as connection:
            connection.execute(text("ANALYZE"))

    def vacuum(self) -> None:
        """Пересобрать файл SQLite и освободить место."""
        self.db.session.commit()
        with self.db.engine.connect().execution_options(
            isolation_level="AUTOCOMMIT"
        ) as connection:
            connection.execute(text("VACUUM"))

    def full_maintenance(self) -> list[str]:
        """Выполнить безопасный полный цикл обслуживания."""
        report: list[str] = []

        target = self.create_backup()
        report.append(f"✔ Backup создан: {target.name}")

        if self.applications_table_exists():
            result = self.db.session.execute(
                self.db.delete(self.QuestionApplication).where(
                    self.QuestionApplication.status.in_(
                        ["approved", "rejected"]
                    )
                )
            )
            deleted = int(result.rowcount or 0)
            report.append(
                f"✔ Удалено обработанных заявок: {deleted}"
            )

        if self.history_table_exists():
            cutoff = datetime.utcnow() - timedelta(days=365)
            result = self.db.session.execute(
                self.db.delete(self.EditorHistory).where(
                    self.EditorHistory.created_at < cutoff
                )
            )
            deleted = int(result.rowcount or 0)
            report.append(
                "✔ Удалено записей истории старше года: "
                f"{deleted}"
            )

        self.db.session.commit()

        with self.db.engine.connect().execution_options(
            isolation_level="AUTOCOMMIT"
        ) as connection:
            connection.execute(text("ANALYZE"))
            report.append("✔ ANALYZE выполнен.")

            connection.execute(text("VACUUM"))
            report.append("✔ VACUUM выполнен.")

            integrity = str(
                connection.execute(
                    text("PRAGMA integrity_check")
                ).scalar()
                or "unknown"
            )
            report.append(
                f"✔ Проверка целостности: {integrity}"
            )

        return report


def register_maintenance(
    context: EditorContext,
) -> dict[str, Any]:
    """Зарегистрировать прежние API обслуживания."""
    service = MaintenanceService(context)

    def require_access():
        if context.permissions.is_allowed():
            return None
        return message_error_response("Нет доступа к редактору.", 403)

    def tpv_editor_maintenance_backup_route():
        denied = require_access()
        if denied is not None:
            return denied

        try:
            target = service.create_backup()
        except Exception as exc:
            context.app.logger.exception(
                "TPV Editor Maintenance: ошибка создания backup."
            )
            return message_error_response(
                f"Не удалось создать backup: {exc}",
                500,
            )

        return jsonify({
            "ok": True,
            "message": "Резервная копия базы создана.",
            "filename": target.name,
        })

    def tpv_editor_maintenance_integrity():
        denied = require_access()
        if denied is not None:
            return denied

        try:
            result = service.integrity_check()
        except Exception as exc:
            context.app.logger.exception(
                "TPV Editor Maintenance: ошибка проверки SQLite."
            )
            return message_error_response(
                f"Ошибка проверки SQLite: {exc}",
                500,
            )

        ok = result.casefold() == "ok"
        return jsonify({
            "ok": True,
            "message": (
                "Целостность базы подтверждена."
                if ok
                else "SQLite сообщил о проблеме."
            ),
            "report": [
                f"PRAGMA integrity_check: {result}"
            ],
            "integrity": result,
        })

    def tpv_editor_maintenance_analyze():
        denied = require_access()
        if denied is not None:
            return denied

        try:
            service.analyze()
        except Exception as exc:
            context.app.logger.exception(
                "TPV Editor Maintenance: ошибка ANALYZE."
            )
            return message_error_response(
                f"Не удалось выполнить ANALYZE: {exc}",
                500,
            )

        return jsonify({
            "ok": True,
            "message": "ANALYZE выполнен.",
            "report": [
                "✔ Статистика планировщика SQLite обновлена."
            ],
        })

    def tpv_editor_maintenance_vacuum():
        denied = require_access()
        if denied is not None:
            return denied

        try:
            service.vacuum()
        except Exception as exc:
            context.app.logger.exception(
                "TPV Editor Maintenance: ошибка VACUUM."
            )
            return message_error_response(
                f"Не удалось выполнить VACUUM: {exc}",
                500,
            )

        return jsonify({
            "ok": True,
            "message": "VACUUM выполнен.",
            "report": [
                "✔ Свободное место в файле SQLite "
                "перераспределено."
            ],
        })

    def tpv_editor_maintenance_full():
        denied = require_access()
        if denied is not None:
            return denied

        try:
            report = service.full_maintenance()
        except Exception as exc:
            service.db.session.rollback()
            context.app.logger.exception(
                "TPV Editor Maintenance: полное обслуживание прервано."
            )
            return message_error_response(
                f"Обслуживание прервано: {exc}",
                500,
            )

        return jsonify({
            "ok": True,
            "message": "Полное обслуживание TPV завершено.",
            "report": report,
        })

    rules = (
        (
            "/tpv_editor/api/maintenance/backup",
            "tpv_editor_maintenance_backup_route",
            tpv_editor_maintenance_backup_route,
        ),
        (
            "/tpv_editor/api/maintenance/integrity",
            "tpv_editor_maintenance_integrity",
            tpv_editor_maintenance_integrity,
        ),
        (
            "/tpv_editor/api/maintenance/analyze",
            "tpv_editor_maintenance_analyze",
            tpv_editor_maintenance_analyze,
        ),
        (
            "/tpv_editor/api/maintenance/vacuum",
            "tpv_editor_maintenance_vacuum",
            tpv_editor_maintenance_vacuum,
        ),
        (
            "/tpv_editor/api/maintenance/full",
            "tpv_editor_maintenance_full",
            tpv_editor_maintenance_full,
        ),
    )

    for rule, endpoint, view_func in rules:
        context.app.add_url_rule(
            rule,
            endpoint=endpoint,
            view_func=view_func,
            methods=["POST"],
        )

    return {
        "service": service,
        "tpv_editor_maintenance_database_path": (
            service.database_path
        ),
        "tpv_editor_maintenance_backup": (
            service.create_backup
        ),
        "tpv_editor_maintenance_backup_route": (
            tpv_editor_maintenance_backup_route
        ),
        "tpv_editor_maintenance_integrity": (
            tpv_editor_maintenance_integrity
        ),
        "tpv_editor_maintenance_analyze": (
            tpv_editor_maintenance_analyze
        ),
        "tpv_editor_maintenance_vacuum": (
            tpv_editor_maintenance_vacuum
        ),
        "tpv_editor_maintenance_full": (
            tpv_editor_maintenance_full
        ),
    }


__all__ = [
    "MaintenanceService",
    "register_maintenance",
]
