"""Проверка качества данных TPV Editor."""

from __future__ import annotations
from tpv.admission import check_player_admission

import re
from typing import Any

from flask import jsonify, request

from .registry import EditorContext
from .responses import message_error_response


HTML_RE = re.compile(r"<[^>]+>")
CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


class QualityService:
    """Поиск проблем данных и безопасные автоматические исправления."""

    def __init__(self, context: EditorContext) -> None:
        self.context = context
        self.db = context.db

        self.UsersTpv = self._dependency("UsersTpv")
        self.QuestionsTpv = self._dependency("Questions_tpv")

        self.normalize_text = self._dependency(
            "tpv_editor_normalize_text"
        )
        self.normalize_theme = self._dependency(
            "tpv_editor_normalize_theme"
        )
        self.count_questions = self._dependency(
            "tpv_editor_count_questions"
        )
        self.is_general_theme = self._dependency(
            "tpv_editor_is_general_theme"
        )
        self.update_approval = self._dependency(
            "tpv_editor_update_approval"
        )

        self.required_questions = int(
            context.get("TPV_REQUIRED_FLIP_QUESTIONS", 5)
        )

    def _dependency(self, name: str) -> Any:
        value = self.context.get(name)
        if value is None:
            raise RuntimeError(
                "Проверка качества TPV Editor: "
                f"отсутствует зависимость {name}"
            )
        return value

    @staticmethod
    def compact_text(value: Any) -> str:
        return " ".join(str(value or "").strip().split())

    @staticmethod
    def issue(
        code: str,
        level: str,
        entity: str,
        record_id: Any,
        title: str,
        details: str,
        recommendation: str,
        fixable: bool = False,
    ) -> dict[str, Any]:
        return {
            "key": f"{entity}:{record_id}:{code}",
            "code": code,
            "level": level,
            "entity": entity,
            "record_id": record_id,
            "title": title,
            "details": details,
            "recommendation": recommendation,
            "fixable": bool(fixable),
        }

    def build_report(self) -> dict[str, Any]:
        questions = self.db.session.scalars(
            self.db.select(self.QuestionsTpv)
            .order_by(self.QuestionsTpv.id)
        ).all()
        users = self.db.session.scalars(
            self.db.select(self.UsersTpv)
            .order_by(self.UsersTpv.id)
        ).all()

        issues: list[dict[str, Any]] = []

        user_names = {
            self.normalize_text(user.username).casefold()
            for user in users
            if user.username
        }
        duplicate_groups: dict[
            tuple[str, str],
            list[Any],
        ] = {}

        for question in questions:
            self._check_question(
                question,
                user_names=user_names,
                issues=issues,
                duplicate_groups=duplicate_groups,
            )

        self._append_duplicate_issues(
            duplicate_groups,
            issues,
        )

        for user in users:
            self._check_user(user, issues)

        return {
            "issues": issues,
            "stats": {
                "total": len(issues),
                "critical": sum(
                    item["level"] == "critical"
                    for item in issues
                ),
                "warning": sum(
                    item["level"] == "warning"
                    for item in issues
                ),
                "info": sum(
                    item["level"] == "info"
                    for item in issues
                ),
                "fixable": sum(
                    item["fixable"]
                    for item in issues
                ),
                "scanned": len(questions) + len(users),
            },
        }

    def _check_question(
        self,
        question: Any,
        *,
        user_names: set[str],
        issues: list[dict[str, Any]],
        duplicate_groups: dict[
            tuple[str, str],
            list[Any],
        ],
    ) -> None:
        task = str(question.task or "")
        answer = str(question.answer or "")
        author = str(question.author or "")
        comment = str(question.comment or "")
        theme = str(question.flip or "")
        show = str(question.show or "").casefold()

        if not task.strip():
            issues.append(self.issue(
                "empty_task",
                "critical",
                "question",
                question.id,
                "Пустой текст вопроса",
                f"Вопрос #{question.id} не содержит формулировку.",
                "Откройте вопрос и заполните поле «Вопрос».",
            ))

        if not answer.strip():
            issues.append(self.issue(
                "empty_answer",
                "critical",
                "question",
                question.id,
                "Пустой ответ",
                f"Вопрос #{question.id} не содержит ответа.",
                "Откройте вопрос и заполните поле «Ответ».",
            ))

        if not author.strip():
            issues.append(self.issue(
                "empty_author",
                "warning",
                "question",
                question.id,
                "Не указан автор",
                f"У вопроса #{question.id} отсутствует автор.",
                "Назначьте автора вручную.",
            ))
        elif self.normalize_text(author).casefold() not in user_names:
            issues.append(self.issue(
                "unknown_author",
                "warning",
                "question",
                question.id,
                "Автор отсутствует в UsersTpv",
                f"Автор «{author}» не найден среди пользователей.",
                "Создайте пользователя либо исправьте имя автора.",
            ))

        fields = {
            "вопрос": task,
            "ответ": answer,
            "комментарий": comment,
            "автор": author,
            "тема": theme,
        }

        dirty_fields = [
            name
            for name, value in fields.items()
            if value != self.compact_text(value)
        ]
        if dirty_fields:
            issues.append(self.issue(
                "whitespace",
                "warning",
                "question",
                question.id,
                "Лишние пробелы",
                "Поля: " + ", ".join(dirty_fields) + ".",
                "Можно безопасно удалить пробелы по краям "
                "и повторяющиеся пробелы.",
                True,
            ))

        html_fields = [
            name
            for name, value in fields.items()
            if HTML_RE.search(value)
        ]
        if html_fields:
            issues.append(self.issue(
                "html",
                "warning",
                "question",
                question.id,
                "Обнаружены HTML-теги",
                "Поля: " + ", ".join(html_fields) + ".",
                "Проверьте разметку вручную: автоматическое "
                "удаление может изменить смысл.",
            ))

        control_fields = [
            name
            for name, value in fields.items()
            if CONTROL_RE.search(value)
        ]
        if control_fields:
            issues.append(self.issue(
                "control_chars",
                "warning",
                "question",
                question.id,
                "Управляющие символы",
                "Поля: " + ", ".join(control_fields) + ".",
                "Можно безопасно удалить непечатные "
                "управляющие символы.",
                True,
            ))

        if show not in {"true", "false"}:
            issues.append(self.issue(
                "invalid_show",
                "warning",
                "question",
                question.id,
                "Некорректный статус show",
                f"Сохранено значение «{question.show}».",
                "Статус будет приведён к false.",
                True,
            ))

        if 0 < len(task.strip()) < 10:
            issues.append(self.issue(
                "short_task",
                "info",
                "question",
                question.id,
                "Очень короткий вопрос",
                f"Длина формулировки: {len(task.strip())} символов.",
                "Проверьте, достаточно ли информации для игрока.",
            ))

        if len(task) > 500:
            issues.append(self.issue(
                "long_task",
                "warning",
                "question",
                question.id,
                "Очень длинный вопрос",
                f"Длина формулировки: {len(task)} символов.",
                "Сократите формулировку или проверьте "
                "лимиты интерфейса.",
            ))

        duplicate_key = (
            self.compact_text(task).casefold(),
            self.compact_text(answer).casefold(),
        )
        if duplicate_key[0] and duplicate_key[1]:
            duplicate_groups.setdefault(
                duplicate_key,
                [],
            ).append(question)

    def _append_duplicate_issues(
        self,
        duplicate_groups: dict[
            tuple[str, str],
            list[Any],
        ],
        issues: list[dict[str, Any]],
    ) -> None:
        for group in duplicate_groups.values():
            if len(group) <= 1:
                continue

            ids = [question.id for question in group]
            for question in group:
                others = [
                    str(item)
                    for item in ids
                    if item != question.id
                ]
                issues.append(self.issue(
                    "duplicate",
                    "warning",
                    "question",
                    question.id,
                    "Точный дубликат вопроса",
                    "Совпадает с вопросами: "
                    + ", ".join(others)
                    + ".",
                    "Сравните записи и удалите лишние вручную.",
                ))

    def _check_user(
        self,
        user: Any,
        issues: list[dict[str, Any]],
    ) -> None:
        theme = self.normalize_theme(user.flip)
        expected_count = self.count_questions(theme)
        admission = check_player_admission(
            expected_count,
            self.context
        )

        expected_approve = (
            "true"
            if (
                not self.is_general_theme(theme)
                and admission["approved"]
            )
            else "false"
        )

        actual_count = int(user.flip_col or 0)
        actual_approve = str(
            user.approve or "false"
        ).casefold()

        if (
            actual_count != expected_count
            or actual_approve != expected_approve
        ):
            issues.append(self.issue(
                "stale_approval",
                "warning",
                "user",
                user.id,
                "Устаревший допуск пользователя",
                (
                    f"{user.username}: сохранено вопросов "
                    f"{actual_count}, должно быть {expected_count}; "
                    f"approve={actual_approve}, "
                    f"должно быть {expected_approve}."
                ),
                "Можно безопасно пересчитать flip_col и approve.",
                True,
            ))

        username = str(user.username or "")
        if username != self.compact_text(username):
            issues.append(self.issue(
                "user_whitespace",
                "warning",
                "user",
                user.id,
                "Лишние пробелы в имени",
                f"Имя сохранено как «{username}».",
                "Исправьте имя вручную, чтобы не нарушить "
                "связь с author.",
            ))

    def fix(
        self,
        *,
        code: str,
        entity: str,
        record_id: Any,
    ) -> str:
        if entity == "question":
            return self._fix_question(code, record_id)

        if entity == "user" and code == "stale_approval":
            user = self.db.session.get(
                self.UsersTpv,
                int(record_id),
            )
            if user is None:
                raise LookupError("Пользователь не найден.")

            self.update_approval(user)
            self.db.session.commit()
            return (
                f"Допуск пользователя «{user.username}» "
                "пересчитан."
            )

        raise ValueError(
            "Автоматическое исправление недоступно."
        )

    def _fix_question(
        self,
        code: str,
        record_id: Any,
    ) -> str:
        question = self.db.session.get(
            self.QuestionsTpv,
            int(record_id),
        )
        if question is None:
            raise LookupError("Вопрос не найден.")

        if code == "whitespace":
            question.task = self.compact_text(question.task)
            question.answer = self.compact_text(question.answer)
            question.comment = self.compact_text(
                question.comment
            )
            question.author = self.compact_text(question.author)
            question.flip = self.normalize_theme(question.flip)
        elif code == "control_chars":
            for field in (
                "task",
                "answer",
                "comment",
                "author",
                "flip",
            ):
                setattr(
                    question,
                    field,
                    CONTROL_RE.sub(
                        "",
                        str(getattr(question, field) or ""),
                    ),
                )
        elif code == "invalid_show":
            question.show = "false"
        else:
            raise ValueError(
                "Для этой проблемы нет безопасного "
                "автоматического исправления."
            )

        self.db.session.commit()
        return f"Вопрос #{question.id} исправлен."

    def fix_all_safe(self) -> int:
        questions = self.db.session.scalars(
            self.db.select(self.QuestionsTpv)
        ).all()
        users = self.db.session.scalars(
            self.db.select(self.UsersTpv)
        ).all()

        fixed = 0

        for question in questions:
            original = (
                question.task,
                question.answer,
                question.comment,
                question.author,
                question.flip,
                question.show,
            )

            question.task = CONTROL_RE.sub(
                "",
                self.compact_text(question.task),
            )
            question.answer = CONTROL_RE.sub(
                "",
                self.compact_text(question.answer),
            )
            question.comment = CONTROL_RE.sub(
                "",
                self.compact_text(question.comment),
            )
            question.author = CONTROL_RE.sub(
                "",
                self.compact_text(question.author),
            )
            question.flip = self.normalize_theme(
                CONTROL_RE.sub(
                    "",
                    str(question.flip or ""),
                )
            )

            if str(question.show or "").casefold() not in {
                "true",
                "false",
            }:
                question.show = "false"

            current = (
                question.task,
                question.answer,
                question.comment,
                question.author,
                question.flip,
                question.show,
            )
            if current != original:
                fixed += 1

        for user in users:
            before = (
                int(user.flip_col or 0),
                str(user.approve or "false"),
            )
            self.update_approval(user)
            after = (
                int(user.flip_col or 0),
                str(user.approve or "false"),
            )
            if before != after:
                fixed += 1

        self.db.session.commit()
        return fixed


def register_quality(
    context: EditorContext,
) -> dict[str, Any]:
    """Зарегистрировать API проверки качества."""
    service = QualityService(context)

    def require_access():
        if context.permissions.is_allowed():
            return None
        return message_error_response("Нет доступа к редактору.", 403)

    def tpv_editor_quality_report():
        denied = require_access()
        if denied is not None:
            return denied

        return jsonify({
            "ok": True,
            **service.build_report(),
        })

    def tpv_editor_quality_fix():
        denied = require_access()
        if denied is not None:
            return denied

        data = request.get_json(silent=True) or {}

        try:
            message = service.fix(
                code=str(data.get("code") or ""),
                entity=str(data.get("entity") or ""),
                record_id=data.get("record_id"),
            )
        except LookupError as exc:
            return message_error_response(str(exc), 404)
        except (TypeError, ValueError) as exc:
            return message_error_response(str(exc))

        return jsonify({
            "ok": True,
            "message": message,
        })

    def tpv_editor_quality_fix_all_safe():
        denied = require_access()
        if denied is not None:
            return denied

        fixed = service.fix_all_safe()
        return jsonify({
            "ok": True,
            "message": (
                f"Безопасно исправлено записей: {fixed}."
            ),
            "fixed": fixed,
        })

    rules = (
        (
            "/tpv_editor/api/quality-report",
            "tpv_editor_quality_report",
            tpv_editor_quality_report,
            ["GET"],
        ),
        (
            "/tpv_editor/api/quality/fix",
            "tpv_editor_quality_fix",
            tpv_editor_quality_fix,
            ["POST"],
        ),
        (
            "/tpv_editor/api/quality/fix-all-safe",
            "tpv_editor_quality_fix_all_safe",
            tpv_editor_quality_fix_all_safe,
            ["POST"],
        ),
    )

    for rule, endpoint, view_func, methods in rules:
        context.app.add_url_rule(
            rule,
            endpoint=endpoint,
            view_func=view_func,
            methods=methods,
        )

    return {
        "service": service,
        "tpv_editor_compact_text": service.compact_text,
        "tpv_editor_quality_issue": service.issue,
        "tpv_editor_build_quality_report": (
            service.build_report
        ),
        "tpv_editor_quality_report": (
            tpv_editor_quality_report
        ),
        "tpv_editor_quality_fix": tpv_editor_quality_fix,
        "tpv_editor_quality_fix_all_safe": (
            tpv_editor_quality_fix_all_safe
        ),
    }


__all__ = [
    "QualityService",
    "register_quality",
]
