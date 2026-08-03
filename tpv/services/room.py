"""Room and screen addressing service for TPV.

Этап 11.5. Содержит только инфраструктуру адресации Socket.IO:
код текущей комнаты и отправку события ведущему, зрителю или игрокам.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable


@dataclass(slots=True)
class TpvRoomService:
    socketio: Any
    default_room_code: str
    get_current_room: Callable[[], Any]

    def get_room_code(self) -> str | None:
        room = self.get_current_room()
        return str(room.id) if room is not None else None

    def emit_host(self, event: str, data: Any = None) -> None:
        self.socketio.emit(
            event,
            data,
            to=f"{self.default_room_code}:host",
        )

    def emit_spectator(self, event: str, data: Any = None) -> None:
        self.socketio.emit(
            event,
            data,
            to=f"{self.default_room_code}:spectator",
        )

    def emit_players(self, event: str, data: Any = None) -> None:
        room_code = self.get_room_code()
        if room_code is not None:
            self.socketio.emit(event, data, to=room_code)

    def emit_player(
        self,
        username: str,
        event: str,
        data: Any = None,
    ) -> None:
        room_code = self.get_room_code()
        if room_code is not None and username:
            self.socketio.emit(
                event,
                data,
                to=f"{room_code}:user:{username}",
            )


def create_tpv_room_service(
    socketio,
    *,
    default_room_code: str,
    get_current_room: Callable[[], Any],
) -> TpvRoomService:
    return TpvRoomService(
        socketio=socketio,
        default_room_code=str(default_room_code),
        get_current_room=get_current_room,
    )


__all__ = [
    "TpvRoomService",
    "create_tpv_room_service",
]
