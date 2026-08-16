"""TPV Editor Backup Center.

SQLite backup, полный ZIP проекта, список, скачивание, удаление
и безопасное восстановление SQLite с аварийной копией.
"""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
import os
import sqlite3
import tempfile
import zipfile
from typing import Any, Callable

from flask import Blueprint, jsonify, request, send_file


def register_tpv_backup_center(
    app,
    db,
    *,
    allowed: Callable[[], bool],
    error: Callable[[str, int], Any],
):
    bp=Blueprint('tpv_backup_center',__name__,url_prefix='/tpv_editor/api/backups')

    def guard():
        return None if allowed() else error('Нет доступа к резервным копиям.',403)

    def database_path()->Path:
        value=str(db.engine.url.database or '')
        if not value: raise RuntimeError('Не удалось определить файл SQLite.')
        path=Path(value)
        if not path.is_absolute(): path=Path(app.root_path)/path
        return path.resolve()

    def backup_dir()->Path:
        path=database_path().parent/'backups'
        path.mkdir(parents=True,exist_ok=True)
        return path.resolve()

    def safe_file(filename:str)->Path:
        name=Path(str(filename or '')).name
        if not name: raise ValueError('Файл backup не указан.')
        root=backup_dir()
        path=(root/name).resolve()
        if path.parent!=root or not path.is_file(): raise FileNotFoundError('Backup не найден.')
        return path

    def sqlite_backup(target:Path)->None:
        db.session.commit()
        source=database_path()
        if not source.exists(): raise RuntimeError('Файл SQLite не найден.')
        target.parent.mkdir(parents=True,exist_ok=True)
        with sqlite3.connect(str(source)) as src, sqlite3.connect(str(target)) as dst:
            src.backup(dst)

    def item(path:Path)->dict[str,Any]:
        stat=path.stat(); name=path.name
        if name.endswith('.zip'): kind='project'
        elif '_emergency_' in name: kind='emergency'
        else: kind='database'
        return {
            'filename':name,'kind':kind,
            'kind_label':{'project':'Проект ZIP','database':'SQLite','emergency':'Аварийная SQLite'}[kind],
            'size_bytes':stat.st_size,
            'size_label':format_size(stat.st_size),
            'created_at':datetime.fromtimestamp(stat.st_mtime).isoformat(timespec='seconds'),
            'created_at_label':datetime.fromtimestamp(stat.st_mtime).strftime('%d.%m.%Y %H:%M:%S'),
            'can_restore':kind in {'database','emergency'},
        }

    def format_size(value:int)->str:
        if value>=1024**3:return f'{value/1024**3:.2f} ГБ'
        if value>=1024**2:return f'{value/1024**2:.1f} МБ'
        if value>=1024:return f'{value/1024:.1f} КБ'
        return f'{value} Б'

    def list_items():
        files=[p for p in backup_dir().iterdir() if p.is_file() and (p.suffix.lower() in {'.zip','.db','.sqlite','.sqlite3'} or '.sqlite' in p.name.lower())]
        return [item(p) for p in sorted(files,key=lambda p:p.stat().st_mtime,reverse=True)]

    @bp.get('')
    def list_backups():
        denied=guard()
        if denied:return denied
        rows=list_items()
        return jsonify({'ok':True,'items':rows,'directory':str(backup_dir()),'count':len(rows),'last_backup':rows[0] if rows else None})

    @bp.post('/database')
    def create_database_backup():
        denied=guard()
        if denied:return denied
        try:
            source=database_path(); stamp=datetime.now().strftime('%Y%m%d_%H%M%S'); suffix=source.suffix or '.sqlite'
            target=backup_dir()/f'{source.stem}_backup_{stamp}{suffix}'
            sqlite_backup(target)
            return jsonify({'ok':True,'message':'Резервная копия SQLite создана.','item':item(target)})
        except Exception as exc:
            app.logger.exception("TPV backup center: ошибка создания SQLite backup.")
            return error(f'Не удалось создать SQLite backup: {exc}',500)

    @bp.post('/project')
    def create_project_backup():
        denied=guard()
        if denied:return denied
        try:
            root=Path(app.root_path).resolve(); source_db=database_path(); stamp=datetime.now().strftime('%Y%m%d_%H%M%S')
            target=backup_dir()/f'tpv_project_backup_{stamp}.zip'
            excluded_dirs={'.git','__pycache__','.pytest_cache','.mypy_cache','.idea','.vscode','node_modules','backups'}
            excluded_suffixes={'.pyc','.pyo','.log'}
            with tempfile.TemporaryDirectory(prefix='tpv_backup_') as tmp:
                snapshot=Path(tmp)/(source_db.name or 'game.db'); sqlite_backup(snapshot)
                with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,allowZip64=True) as archive:
                    for path in root.rglob('*'):
                        if not path.is_file():continue
                        rel=path.relative_to(root)
                        if any(part in excluded_dirs for part in rel.parts):continue
                        if path.suffix.lower() in excluded_suffixes:continue
                        if path.resolve()==source_db:continue
                        archive.write(path,rel.as_posix())
                    archive.write(snapshot,f'database_snapshot/{source_db.name}')
                    archive.writestr('BACKUP_INFO.txt',f'TPV project backup\nCreated: {datetime.now().isoformat(timespec="seconds")}\nProject: {root}\nDatabase snapshot: database_snapshot/{source_db.name}\n')
            return jsonify({'ok':True,'message':'Полный ZIP проекта создан.','item':item(target)})
        except Exception as exc:
            app.logger.exception("TPV backup center: ошибка создания ZIP проекта.")
            return error(f'Не удалось создать ZIP проекта: {exc}',500)

    @bp.get('/<path:filename>/download')
    def download_backup(filename):
        denied=guard()
        if denied:return denied
        try:path=safe_file(filename)
        except (ValueError,FileNotFoundError) as exc:return error(str(exc),404)
        return send_file(path,as_attachment=True,download_name=path.name)

    @bp.delete('/<path:filename>')
    def delete_backup(filename):
        denied=guard()
        if denied:return denied
        try:path=safe_file(filename); name=path.name; path.unlink()
        except (ValueError,FileNotFoundError) as exc:return error(str(exc),404)
        except Exception as exc:
            app.logger.exception("TPV backup center: ошибка удаления backup.")
            return error(f'Не удалось удалить backup: {exc}',500)
        return jsonify({'ok':True,'message':f'Backup «{name}» удалён.'})

    @bp.post('/<path:filename>/restore')
    def restore_database(filename):
        denied=guard()
        if denied:return denied
        data=request.get_json(silent=True) or {}
        if str(data.get('confirmation') or '')!='RESTORE':return error('Для восстановления передайте confirmation: RESTORE.',400)
        try:
            source=safe_file(filename)
            if source.suffix.lower()=='.zip':return error('Восстановление из ZIP проекта выполняется вручную.',409)
            current=database_path(); stamp=datetime.now().strftime('%Y%m%d_%H%M%S'); emergency=backup_dir()/f'{current.stem}_emergency_{stamp}{current.suffix or ".sqlite"}'
            sqlite_backup(emergency)
            db.session.remove(); db.engine.dispose()
            with sqlite3.connect(str(source)) as src, sqlite3.connect(str(current)) as dst:
                src.execute('PRAGMA integrity_check')
                src.backup(dst)
            return jsonify({'ok':True,'message':'SQLite восстановлена. Перезапустите Flask перед продолжением работы.','emergency':item(emergency),'restart_required':True})
        except Exception as exc:
            app.logger.exception("TPV backup center: ошибка восстановления SQLite.")
            return error(f'Не удалось восстановить SQLite: {exc}',500)

    app.register_blueprint(bp)
    return {'backup_directory':backup_dir}

__all__=['register_tpv_backup_center']
