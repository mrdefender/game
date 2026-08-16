"""Конструктор игры TPV Editor."""
from __future__ import annotations
from datetime import datetime
import json
import random
from typing import Any
from flask import jsonify, request
from sqlalchemy import func, inspect
from .registry import EditorContext
from .responses import message_error_response

class BuilderService:
    def __init__(self, context:EditorContext)->None:
        self.context=context; self.db=context.db
        self.QuestionsTpv=self._dep("Questions_tpv")
        self.TpvGameBuild=self._dep("TpvGameBuild")
        self.normalize_text=self._dep("tpv_editor_normalize_text")
        self.is_general_theme=self._dep("tpv_editor_is_general_theme")
        self.theme_list=self._dep("tpv_editor_theme_list")
        self.question_to_dict=self._dep("tpv_editor_question_to_dict")
        self.history_add=self._dep("tpv_editor_history_add")
        self.history_json=self._dep("tpv_editor_history_json")
    def _dep(self,name:str)->Any:
        value=self.context.get(name)
        if value is None:raise RuntimeError(f"Builder TPV Editor: отсутствует зависимость {name}")
        return value
    def table_exists(self)->bool:
        try:return "tpv_game_builds" in inspect(self.db.engine).get_table_names()
        except Exception:
            self.context.app.logger.exception(
                "TPV Editor Builder: не удалось проверить таблицу tpv_game_builds."
            )
            return False
    def create_table(self)->None:self.TpvGameBuild.__table__.create(bind=self.db.engine,checkfirst=True)
    @staticmethod
    def parse_json(value:Any,default:Any)->Any:
        if not value:return default
        try:
            result=json.loads(value);return result if isinstance(result,type(default)) else default
        except (json.JSONDecodeError,TypeError):return default
    def config(self,row):return self.parse_json(row.config_json,{})
    def question_ids(self,row):
        values=self.parse_json(row.question_ids_json,[])
        return [int(v) for v in values if str(v).isdigit()]
    def normalize_payload(self,data):
        name=self.normalize_text(data.get("name"))
        if not name:raise ValueError("Название набора обязательно.")
        if len(name)>120:raise ValueError("Название набора должно содержать не более 120 символов.")
        try:limit=int(data.get("limit") or 30)
        except (TypeError,ValueError):raise ValueError("Количество вопросов должно быть целым числом.")
        if limit<1 or limit>1000:raise ValueError("Количество вопросов должно быть от 1 до 1000.")
        general_mode=str(data.get("general_mode") or "include")
        if general_mode not in {"include","only","exclude"}:raise ValueError("Некорректный режим общих вопросов.")
        themes=[];seen=set()
        for value in data.get("themes") or []:
            theme=self.normalize_text(value);key=theme.casefold()
            if theme and not self.is_general_theme(theme) and key not in seen:seen.add(key);themes.append(theme)
        authors=[];seen=set()
        for value in data.get("excluded_authors") or []:
            author=self.normalize_text(value);key=author.casefold()
            if author and key not in seen:seen.add(key);authors.append(author)
        return {"name":name,"limit":limit,"general_mode":general_mode,
                "unused_only":bool(data.get("unused_only")),
                "randomize":bool(data.get("randomize",True)),
                "themes":themes,"excluded_authors":authors}
    def select_questions(self,config):
        questions=self.db.session.scalars(self.db.select(self.QuestionsTpv).order_by(self.QuestionsTpv.id)).all()
        theme_keys={self.normalize_text(v).casefold() for v in config["themes"]}
        excluded={self.normalize_text(v).casefold() for v in config["excluded_authors"]}
        result=[]
        for q in questions:
            general=self.is_general_theme(q.flip);theme=self.normalize_text(q.flip).casefold();author=self.normalize_text(q.author).casefold()
            if config["unused_only"] and str(q.show or "").casefold()=="true":continue
            if author in excluded:continue
            if config["general_mode"]=="only" and not general:continue
            if config["general_mode"]=="exclude" and general:continue
            if not general and theme_keys and theme not in theme_keys:continue
            result.append(q)
        available=len(result)
        if config["randomize"]:random.SystemRandom().shuffle(result)
        return result[:config["limit"]],available
    def question_dict(self,q):
        d=self.question_to_dict(q)
        return {k:d[k] for k in ("id","task","author","flip_display","is_general","show")}
    def to_dict(self,row,include_questions=True):
        config=self.config(row);ids=self.question_ids(row);questions=[]
        if include_questions and ids:
            found=self.db.session.scalars(self.db.select(self.QuestionsTpv).where(self.QuestionsTpv.id.in_(ids))).all()
            by_id={x.id:x for x in found}
            questions=[self.question_dict(by_id[i]) for i in ids if i in by_id]
        return {"id":row.id,"name":row.name,"limit":int(config.get("limit") or len(ids) or 30),
          "general_mode":config.get("general_mode") or "include","unused_only":bool(config.get("unused_only")),
          "randomize":bool(config.get("randomize",True)),"themes":config.get("themes") or [],
          "excluded_authors":config.get("excluded_authors") or [],"question_ids":ids,
          "question_count":len(ids),"questions":questions,"is_active":bool(row.is_active),
          "created_at":row.created_at.isoformat(timespec="seconds"),
          "updated_at":row.updated_at.isoformat(timespec="seconds"),
          "updated_at_label":row.updated_at.strftime("%d.%m.%Y %H:%M")}
    def list_data(self):
        themes=self.theme_list()
        raw=self.db.session.scalars(self.db.select(self.QuestionsTpv.author).where(self.QuestionsTpv.author.is_not(None)).distinct()).all()
        authors=sorted({self.normalize_text(v) for v in raw if self.normalize_text(v)},key=str.casefold)
        unused=int(self.db.session.scalar(self.db.select(func.count(self.QuestionsTpv.id)).where(func.lower(self.QuestionsTpv.show)!="true")) or 0)
        if not self.table_exists():return False,[],themes,authors,{"total":0,"active_name":None,"unused_questions":unused}
        rows=self.db.session.scalars(self.db.select(self.TpvGameBuild).order_by(self.TpvGameBuild.is_active.desc(),self.TpvGameBuild.updated_at.desc())).all()
        active=next((r for r in rows if r.is_active),None)
        return True,[self.to_dict(r) for r in rows],themes,authors,{"total":len(rows),"active_name":active.name if active else None,"unused_questions":unused}

def register_builder(context:EditorContext)->dict[str,Any]:
    s=BuilderService(context)
    def guard():return None if context.permissions.is_allowed() else message_error_response("Нет доступа к редактору.",403)
    def tpv_editor_builder_list():
        d=guard()
        if d is not None:return d
        exists,items,themes,authors,stats=s.list_data()
        return jsonify({"ok":True,"table_exists":exists,"items":items,"themes":themes,"authors":authors,"stats":stats})
    def tpv_editor_builder_create_table_route():
        d=guard()
        if d is not None:return d
        s.create_table();return jsonify({"ok":True,"message":"Таблица конструктора игры создана."})
    def tpv_editor_builder_preview():
        d=guard()
        if d is not None:return d
        try:config=s.normalize_payload(request.get_json(silent=True) or {})
        except ValueError as exc:return message_error_response(str(exc))
        qs,count=s.select_questions(config)
        return jsonify({"ok":True,"available_count":count,"questions":[s.question_dict(q) for q in qs]})
    def tpv_editor_builder_create():
        d=guard()
        if d is not None:return d
        if not s.table_exists():return message_error_response("Таблица конструктора не создана.",409)
        data=request.get_json(silent=True) or {}
        try:config=s.normalize_payload(data)
        except ValueError as exc:return message_error_response(str(exc))
        ids=[int(v) for v in data.get("question_ids") or [] if str(v).isdigit()]
        if not ids:return message_error_response("Сначала сформируйте выборку вопросов.")
        row=s.TpvGameBuild(name=config["name"],config_json=s.history_json(config),question_ids_json=s.history_json(ids),is_active=False)
        s.db.session.add(row);s.db.session.flush()
        s.history_add("bulk",row.id,"create",f"Создан игровой набор «{row.name}»",after=s.to_dict(row),details=f"Вопросов в наборе: {len(ids)}.",can_revert=False)
        s.db.session.commit()
        return jsonify({"ok":True,"message":"Игровой набор сохранён.","item":s.to_dict(row)}),201
    def tpv_editor_builder_update(build_id):
        d=guard()
        if d is not None:return d
        row=s.db.session.get(s.TpvGameBuild,build_id)
        if row is None:return message_error_response("Игровой набор не найден.",404)
        data=request.get_json(silent=True) or {}
        try:config=s.normalize_payload(data)
        except ValueError as exc:return message_error_response(str(exc))
        ids=[int(v) for v in data.get("question_ids") or [] if str(v).isdigit()]
        if not ids:return message_error_response("Сначала сформируйте выборку вопросов.")
        before=s.to_dict(row);row.name=config["name"];row.config_json=s.history_json(config);row.question_ids_json=s.history_json(ids);row.updated_at=datetime.utcnow()
        s.db.session.flush();s.history_add("bulk",row.id,"update",f"Обновлён игровой набор «{row.name}»",before=before,after=s.to_dict(row),can_revert=False);s.db.session.commit()
        return jsonify({"ok":True,"message":"Игровой набор обновлён.","item":s.to_dict(row)})
    def tpv_editor_builder_delete(build_id):
        d=guard()
        if d is not None:return d
        row=s.db.session.get(s.TpvGameBuild,build_id)
        if row is None:return message_error_response("Игровой набор не найден.",404)
        snap=s.to_dict(row);name=row.name;s.db.session.delete(row)
        s.history_add("bulk",build_id,"delete",f"Удалён игровой набор «{name}»",before=snap,can_revert=False);s.db.session.commit()
        return jsonify({"ok":True,"message":"Игровой набор удалён. Вопросы из базы не изменены."})
    def tpv_editor_builder_activate(build_id):
        d=guard()
        if d is not None:return d
        row=s.db.session.get(s.TpvGameBuild,build_id)
        if row is None:return message_error_response("Игровой набор не найден.",404)
        active=s.db.session.scalars(s.db.select(s.TpvGameBuild).where(s.TpvGameBuild.is_active.is_(True))).all()
        for x in active:x.is_active=False
        row.is_active=True;row.updated_at=datetime.utcnow()
        s.history_add("bulk",row.id,"update",f"Активирован игровой набор «{row.name}»",details=f"Вопросов в наборе: {len(s.question_ids(row))}.",can_revert=False)
        s.db.session.commit();return jsonify({"ok":True,"message":f"Набор «{row.name}» сделан активным."})
    def tpv_editor_builder_active():
        if not s.table_exists():return jsonify({"ok":True,"active":None})
        row=s.db.session.scalar(s.db.select(s.TpvGameBuild).where(s.TpvGameBuild.is_active.is_(True)).order_by(s.TpvGameBuild.updated_at.desc()).limit(1))
        return jsonify({"ok":True,"active":s.to_dict(row) if row else None})
    rules=(
      ("/tpv_editor/api/game-builder","tpv_editor_builder_list",tpv_editor_builder_list,["GET"]),
      ("/tpv_editor/api/game-builder/create-table","tpv_editor_builder_create_table_route",tpv_editor_builder_create_table_route,["POST"]),
      ("/tpv_editor/api/game-builder/preview","tpv_editor_builder_preview",tpv_editor_builder_preview,["POST"]),
      ("/tpv_editor/api/game-builder","tpv_editor_builder_create",tpv_editor_builder_create,["POST"]),
      ("/tpv_editor/api/game-builder/<int:build_id>","tpv_editor_builder_update",tpv_editor_builder_update,["PUT"]),
      ("/tpv_editor/api/game-builder/<int:build_id>","tpv_editor_builder_delete",tpv_editor_builder_delete,["DELETE"]),
      ("/tpv_editor/api/game-builder/<int:build_id>/activate","tpv_editor_builder_activate",tpv_editor_builder_activate,["POST"]),
      ("/tpv_editor/api/game-builder/active","tpv_editor_builder_active",tpv_editor_builder_active,["GET"]))
    for rule,endpoint,view,methods in rules:context.app.add_url_rule(rule,endpoint=endpoint,view_func=view,methods=methods)
    return {"service":s,"tpv_editor_builder_table_exists":s.table_exists,
      "tpv_editor_builder_create_table":s.create_table,"tpv_editor_builder_parse_json":s.parse_json,
      "tpv_editor_builder_config":s.config,"tpv_editor_builder_question_ids":s.question_ids,
      "tpv_editor_builder_normalize_payload":s.normalize_payload,"tpv_editor_builder_select_questions":s.select_questions,
      "tpv_editor_builder_question_dict":s.question_dict,"tpv_editor_builder_to_dict":s.to_dict,
      "tpv_editor_builder_list":tpv_editor_builder_list,"tpv_editor_builder_create_table_route":tpv_editor_builder_create_table_route,
      "tpv_editor_builder_preview":tpv_editor_builder_preview,"tpv_editor_builder_create":tpv_editor_builder_create,
      "tpv_editor_builder_update":tpv_editor_builder_update,"tpv_editor_builder_delete":tpv_editor_builder_delete,
      "tpv_editor_builder_activate":tpv_editor_builder_activate,"tpv_editor_builder_active":tpv_editor_builder_active}
__all__=["BuilderService","register_builder"]
