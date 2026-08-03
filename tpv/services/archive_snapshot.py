"""Archive Snapshot providers for TPV.

Этап 11.5. Инкапсулирует запросы, которыми TpvArchiveRuntime получает
текущее состояние игроков, вопросов, Builder и ресурса базы.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable


@dataclass(slots=True)
class TpvArchiveSnapshotService:
    db: Any
    QueryTpv: Any
    UsersTpv: Any
    QuestionsTpv: Any
    GameBuild: Any
    desc: Any
    theme_list: Callable[[], list[Any]]
    builder_table_exists: Callable[[], bool]

    def get_players(self):
        return self.db.session.scalars(
            self.db.select(self.QueryTpv).order_by(self.QueryTpv.id)
        ).all()

    def get_results(self):
        return self.db.session.scalars(
            self.db.select(self.UsersTpv)
            .where(self.UsersTpv.money != 0)
            .order_by(self.desc(self.UsersTpv.money))
        ).all()

    def get_questions_total(self) -> int:
        return int(
            self.db.session.scalar(
                self.db.select(
                    self.db.func.count(self.QuestionsTpv.id)
                )
            ) or 0
        )

    def get_themes_total(self) -> int:
        return len(self.theme_list())

    def get_builder_id(self) -> int | None:
        if not self.builder_table_exists():
            return None

        active = self.db.session.scalar(
            self.db.select(self.GameBuild)
            .where(self.GameBuild.is_active.is_(True))
            .order_by(self.GameBuild.id.desc())
            .limit(1)
        )
        return active.id if active is not None else None

    def get_resource_games(self) -> int:
        general_available = self.db.session.scalar(
            self.db.select(
                self.db.func.count(self.QuestionsTpv.id)
            ).where(
                self.QuestionsTpv.flip == "false",
                self.QuestionsTpv.show == "false",
            )
        ) or 0
        return max(0, int(general_available) // 25)

    def get_database_path(self) -> str | None:
        try:
            return str(self.db.engine.url.database or "")
        except Exception:
            return None

    def runtime_callbacks(self) -> dict[str, Callable[..., Any]]:
        return {
            "get_players": self.get_players,
            "get_results": self.get_results,
            "get_questions_total": self.get_questions_total,
            "get_themes_total": self.get_themes_total,
            "get_builder_id": self.get_builder_id,
            "get_resource_games": self.get_resource_games,
            "get_database_path": self.get_database_path,
        }


def create_tpv_archive_snapshot_service(
    db,
    *,
    QueryTpv,
    UsersTpv,
    QuestionsTpv,
    GameBuild,
    desc,
    theme_list: Callable[[], list[Any]],
    builder_table_exists: Callable[[], bool],
) -> TpvArchiveSnapshotService:
    return TpvArchiveSnapshotService(
        db=db,
        QueryTpv=QueryTpv,
        UsersTpv=UsersTpv,
        QuestionsTpv=QuestionsTpv,
        GameBuild=GameBuild,
        desc=desc,
        theme_list=theme_list,
        builder_table_exists=builder_table_exists,
    )


__all__ = [
    "TpvArchiveSnapshotService",
    "create_tpv_archive_snapshot_service",
]
