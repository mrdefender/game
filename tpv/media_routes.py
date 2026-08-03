"""TPV audio and number-voice HTTP routes.

Этап 11.6. Сохраняет исходные URL и Flask endpoint names.
"""

from __future__ import annotations

import mimetypes
from typing import Callable

from flask import abort, jsonify, request, send_from_directory, url_for
from werkzeug.utils import secure_filename


def register_tpv_media_routes(
    app,
    *,
    number_to_audio: Callable[..., list[str]],
):
    def serve_audio_tpv(filename):
        custom_audio_dir = "sounds/tpv/"
        sanitized_filename = secure_filename(filename)
        mime_type, _ = mimetypes.guess_type(sanitized_filename)

        result = send_from_directory(
            custom_audio_dir,
            sanitized_filename,
            mimetype=mime_type,
            as_attachment=False,
        )
        result.cache_control.public = True
        result.cache_control.max_age = 432000
        result.headers["Cache-Control"] = (
            "public, max-age=432000, immutable"
        )
        return result

    def serve_audio_tpv_bong(filename):
        custom_audio_dir = "sounds/tpv/bong-game/"
        sanitized_filename = secure_filename(filename)
        mime_type, _ = mimetypes.guess_type(sanitized_filename)

        if not mime_type or not mime_type.startswith("audio/"):
            abort(400, description="Unsupported audio format.")

        result = send_from_directory(
            custom_audio_dir,
            sanitized_filename,
            mimetype=mime_type,
            as_attachment=False,
        )
        result.cache_control.public = True
        result.cache_control.max_age = 432000
        result.headers["Cache-Control"] = (
            "public, max-age=432000, immutable"
        )
        return result

    def api_voice_number():
        data = request.get_json(silent=True) or {}

        try:
            number = int(data.get("number"))
        except (TypeError, ValueError):
            return jsonify({
                "ok": False,
                "error": "Необходимо передать целое число",
            }), 400

        include_currency = bool(data.get("include_currency", False))

        try:
            filenames = number_to_audio(
                number,
                include_currency=include_currency,
            )
        except ValueError as exc:
            return jsonify({
                "ok": False,
                "error": str(exc),
            }), 400

        urls = [
            url_for(
                "serve_audio_tpv_bong",
                filename=filename,
            )
            for filename in filenames
        ]

        return jsonify({
            "ok": True,
            "number": number,
            "files": filenames,
            "urls": urls,
        })

    app.add_url_rule(
        "/sounds/tpv/<filename>",
        endpoint="serve_audio_tpv",
        view_func=serve_audio_tpv,
        methods=["GET"],
    )
    app.add_url_rule(
        "/sounds/tpv/bong-game/<filename>",
        endpoint="serve_audio_tpv_bong",
        view_func=serve_audio_tpv_bong,
        methods=["GET"],
    )
    app.add_url_rule(
        "/api/voice-number",
        endpoint="api_voice_number",
        view_func=api_voice_number,
        methods=["POST"],
    )

    return {
        "serve_audio_tpv": serve_audio_tpv,
        "serve_audio_tpv_bong": serve_audio_tpv_bong,
        "api_voice_number": api_voice_number,
    }


__all__ = ["register_tpv_media_routes"]
