"""Вопросы TPV Editor — этап 13.3.3.

CRUD вопросов расположен в отдельном читаемом модуле.
URL, endpoint-имена и JSON-контракт сохранены.
"""
from __future__ import annotations
from typing import Any
from flask import jsonify, request
from sqlalchemy import func
from .registry import EditorContext
from .responses import message_error_response


class QuestionService:
    def __init__(self, context: EditorContext) -> None:
        self.context=context
        self.db=context.db
        self.QuestionsTpv=self._dep("Questions_tpv")
        self.normalize_text=self._dep("tpv_editor_normalize_text")
        self.is_general_theme=self._dep("tpv_editor_is_general_theme")
        self.matching_users=self._dep("tpv_editor_matching_users")
        self.update_approval=self._dep("tpv_editor_update_approval")
        self.history_add=self._dep("tpv_editor_history_add")
        self.question_snapshot=self._dep("tpv_editor_question_snapshot")

    def _dep(self,name:str)->Any:
        value=self.context.get(name)
        if value is None:
            raise RuntimeError(f"Вопросы TPV Editor: отсутствует зависимость {name}")
        return value

    def normalize_theme(self,value:Any)->str:
        theme=self.normalize_text(value)
        return "false" if self.is_general_theme(theme) else theme

    def serialize(self,q:Any)->dict[str,Any]:
        general=self.is_general_theme(q.flip)
        return {"id":q.id,"task":q.task or "","answer":q.answer or "",
                "comment":q.comment or "","author":q.author or "",
                "flip":q.flip or "false","flip_display":"общий" if general else q.flip,
                "is_general":general,
                "show":"true" if str(q.show).lower()=="true" else "false"}

    def payload(self,data:dict[str,Any])->tuple[str,str,str,str,str,str]:
        task=self.normalize_text(data.get("task"))
        answer=self.normalize_text(data.get("answer"))
        author=self.normalize_text(data.get("author"))
        comment=str(data.get("comment") or "").strip()
        flip=self.normalize_theme(data.get("flip"))
        show="true" if str(data.get("show")).lower()=="true" else "false"
        if not task: raise ValueError("Текст вопроса обязателен.")
        if not answer: raise ValueError("Ответ обязателен.")
        if not author: raise ValueError("Автор обязателен.")
        return task,answer,comment,author,flip,show

    def duplicate(self,task:str,exclude_id:int|None=None)->Any|None:
        normalized=self.normalize_text(task).casefold()
        if not normalized:return None
        query=self.db.select(self.QuestionsTpv).where(
            func.lower(func.trim(self.QuestionsTpv.task))==normalized)
        if exclude_id is not None: query=query.where(self.QuestionsTpv.id!=exclude_id)
        return self.db.session.scalar(query.limit(1))

    def recalculate_theme(self,theme:Any)->int:
        if self.is_general_theme(theme):return 0
        users=self.matching_users(theme)
        for user in users:self.update_approval(user)
        return len(users)

    def list_payload(self)->dict[str,Any]:
        questions=self.db.session.scalars(
            self.db.select(self.QuestionsTpv).order_by(self.QuestionsTpv.id)).all()
        raw_authors=self.db.session.scalars(
            self.db.select(self.QuestionsTpv.author)
            .where(self.QuestionsTpv.author.is_not(None)).distinct()).all()
        raw_themes=self.db.session.scalars(
            self.db.select(self.QuestionsTpv.flip)
            .where(self.QuestionsTpv.flip.is_not(None)).distinct()).all()
        authors=sorted({self.normalize_text(x) for x in raw_authors if self.normalize_text(x)},key=str.casefold)
        themes=sorted({self.normalize_text(x) for x in raw_themes if not self.is_general_theme(x)},key=str.casefold)
        return {"questions":[self.serialize(q) for q in questions],"authors":authors,"themes":themes}

    def create(self,data:dict[str,Any])->Any:
        task,answer,comment,author,flip,show=self.payload(data)
        duplicate=self.duplicate(task)
        if duplicate:raise LookupError(f"Такой вопрос уже существует: ID {duplicate.id}.")
        q=self.QuestionsTpv(task=task,answer=answer,comment=comment,author=author,flip=flip,show=show)
        self.db.session.add(q);self.db.session.flush();self.recalculate_theme(flip)
        self.history_add("question",q.id,"create",f"Создан вопрос #{q.id}",
                         after=self.question_snapshot(q),can_revert=True)
        self.db.session.commit();return q

    def update(self,q:Any,data:dict[str,Any])->Any:
        task,answer,comment,author,flip,show=self.payload(data)
        duplicate=self.duplicate(task,exclude_id=q.id)
        if duplicate:raise LookupError(f"Такой вопрос уже существует: ID {duplicate.id}.")
        before=self.question_snapshot(q);old_theme=q.flip
        q.task,q.answer,q.comment=task,answer,comment
        q.author,q.flip,q.show=author,flip,show
        self.db.session.flush();self.recalculate_theme(old_theme)
        if self.normalize_text(old_theme).casefold()!=self.normalize_text(flip).casefold():
            self.recalculate_theme(flip)
        self.history_add("question",q.id,"update",f"Изменён вопрос #{q.id}",
                         before=before,after=self.question_snapshot(q),can_revert=True)
        self.db.session.commit();return q

    def delete(self,q:Any)->int:
        before=self.question_snapshot(q);qid=q.id;theme=q.flip
        self.db.session.delete(q);self.db.session.flush();self.recalculate_theme(theme)
        self.history_add("question",qid,"delete",f"Удалён вопрос #{qid}",
                         before=before,can_revert=True)
        self.db.session.commit();return qid

    def copy(self,source:Any)->Any:
        q=self.QuestionsTpv(task=f"{source.task} (копия)",answer=source.answer,
            comment=source.comment,author=source.author,flip=source.flip,show="false")
        self.db.session.add(q);self.db.session.flush();self.recalculate_theme(q.flip)
        self.history_add("question",q.id,"create",f"Создана копия вопроса #{source.id}",
            after=self.question_snapshot(q),details=f"Исходный вопрос: #{source.id}.",can_revert=True)
        self.db.session.commit();return q

    def reset_shown(self)->int:
        questions=self.db.session.scalars(self.db.select(self.QuestionsTpv)
            .where(func.lower(self.QuestionsTpv.show)=="true")).all()
        for q in questions:q.show="false"
        self.history_add("bulk",None,"reset","Сброшены использованные вопросы",
            details=f"Обновлено вопросов: {len(questions)}.",can_revert=False)
        self.db.session.commit();return len(questions)


def register_questions(context:EditorContext)->dict[str,Any]:
    service=QuestionService(context)
    def denied():return None if context.permissions.is_allowed() else message_error_response("Нет доступа к редактору.",403)

    def tpv_editor_get_questions():
        d=denied()
        if d is not None:return d
        payload=service.list_payload()
        return jsonify({"ok":True,**payload})

    def tpv_editor_create_question():
        d=denied()
        if d is not None:return d
        try:q=service.create(request.get_json(silent=True) or {})
        except LookupError as exc:return message_error_response(str(exc),409)
        except ValueError as exc:return message_error_response(str(exc))
        return jsonify({"ok":True,"message":"Вопрос создан.","question":service.serialize(q)}),201

    def tpv_editor_update_question(question_id):
        d=denied()
        if d is not None:return d
        q=service.db.session.get(service.QuestionsTpv,question_id)
        if not q:return message_error_response("Вопрос не найден.",404)
        try:q=service.update(q,request.get_json(silent=True) or {})
        except LookupError as exc:return message_error_response(str(exc),409)
        except ValueError as exc:return message_error_response(str(exc))
        return jsonify({"ok":True,"message":"Вопрос сохранён.","question":service.serialize(q)})

    def tpv_editor_delete_question(question_id):
        d=denied()
        if d is not None:return d
        q=service.db.session.get(service.QuestionsTpv,question_id)
        if not q:return message_error_response("Вопрос не найден.",404)
        qid=service.delete(q)
        return jsonify({"ok":True,"message":f"Вопрос #{qid} удалён."})

    def tpv_editor_duplicate_question(question_id):
        d=denied()
        if d is not None:return d
        source=service.db.session.get(service.QuestionsTpv,question_id)
        if not source:return message_error_response("Вопрос не найден.",404)
        q=service.copy(source)
        return jsonify({"ok":True,"message":f"Создана копия вопроса #{q.id}.","question":service.serialize(q)}),201

    def tpv_editor_reset_question_show():
        d=denied()
        if d is not None:return d
        count=service.reset_shown()
        return jsonify({"ok":True,"message":f"Сброшено использованных вопросов: {count}.","updated":count})

    rules=(
      ("/tpv_editor/api/questions","tpv_editor_get_questions",tpv_editor_get_questions,["GET"]),
      ("/tpv_editor/api/questions","tpv_editor_create_question",tpv_editor_create_question,["POST"]),
      ("/tpv_editor/api/questions/<int:question_id>","tpv_editor_update_question",tpv_editor_update_question,["PUT"]),
      ("/tpv_editor/api/questions/<int:question_id>","tpv_editor_delete_question",tpv_editor_delete_question,["DELETE"]),
      ("/tpv_editor/api/questions/<int:question_id>/duplicate","tpv_editor_duplicate_question",tpv_editor_duplicate_question,["POST"]),
      ("/tpv_editor/api/questions/reset-shown","tpv_editor_reset_question_show",tpv_editor_reset_question_show,["POST"]),
    )
    for rule,endpoint,view,methods in rules:
        context.app.add_url_rule(rule,endpoint=endpoint,view_func=view,methods=methods)
    return {"service":service,"tpv_editor_question_to_dict":service.serialize,
      "tpv_editor_normalize_question_theme":service.normalize_theme,
      "tpv_editor_recalculate_theme":service.recalculate_theme,
      "tpv_editor_question_duplicate":service.duplicate,
      "tpv_editor_question_payload":service.payload,
      "tpv_editor_get_questions":tpv_editor_get_questions,
      "tpv_editor_create_question":tpv_editor_create_question,
      "tpv_editor_update_question":tpv_editor_update_question,
      "tpv_editor_delete_question":tpv_editor_delete_question,
      "tpv_editor_duplicate_question":tpv_editor_duplicate_question,
      "tpv_editor_reset_question_show":tpv_editor_reset_question_show}

__all__=["QuestionService","register_questions"]
