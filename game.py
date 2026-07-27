from datetime import datetime, time
from flask import (
    Flask,
    Response,
    abort,
    jsonify,
    redirect,
    render_template,
    request,
    send_file,
    send_from_directory,
    session,
    url_for,
    flash,
)
import hashlib
import json
import mimetypes
import os
import random
import secrets
import string
from pathlib import Path

from sqlalchemy import desc, func, inspect
from sqlalchemy.types import JSON
from werkzeug.utils import secure_filename
from flask_login import (
    UserMixin,
    login_user,
    LoginManager,
    current_user,
    logout_user,
    login_required,
)
from flask_wtf.csrf import CSRFProtect, CSRFError
from dotenv import load_dotenv

from extensions import db, socketio
from number_voice import number_to_audio
from flask_socketio import emit, join_room




load_dotenv()
app = Flask(__name__, template_folder="static/")
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DB_PATH")
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") #убрать в переменные среды
if app.config['SECRET_KEY'] is None:
    raise ValueError("ОШИБКА: Переменная окружения SECRET_KEY не установлена!")
app.secret_key = app.config["SECRET_KEY"] #os.urandom(32).hex

# CSRF-защита обычных HTTP-запросов. Проверка запускается вручную ниже,
# чтобы служебный транспорт Socket.IO (/socket.io) не блокировался.
app.config["WTF_CSRF_CHECK_DEFAULT"] = False
app.config["WTF_CSRF_TIME_LIMIT"] = None

csrf = CSRFProtect(app)
BASE_DIR = Path(__file__).resolve().parent
BRANDING_FILE = BASE_DIR / "config" / "branding.json"

with open(
    BASE_DIR / "config" / "branding.json",
    encoding="utf-8"
) as f:
    BRAND = json.load(f)
    
@app.context_processor
def inject_brand():

    return BRAND

def load_branding() -> dict:
    """Загружает настройки бренда из JSON."""
    default_branding = {
        "game_name": "The People Versus",
        "game_short_name": "TPV",
        "game_subtitle": "LIVE GAME MASTER CONSOLE",
    }

    if not BRANDING_FILE.exists():
        return default_branding

    try:
        with BRANDING_FILE.open("r", encoding="utf-8") as file:
            loaded = json.load(file)

        # Значения из JSON дополняют настройки по умолчанию.
        return {**default_branding, **loaded}

    except (OSError, json.JSONDecodeError) as error:
        app.logger.error("Не удалось загрузить branding.json: %s", error)
        return default_branding




@app.before_request
def protect_http_requests_from_csrf():
    """Проверяет CSRF для изменяющих HTTP-запросов, кроме транспорта Socket.IO."""
    if request.path.startswith("/socket.io"):
        return None

    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        csrf.protect()

    return None


@app.errorhandler(CSRFError)
def handle_csrf_error(error):
    """Возвращает JSON для fetch и понятную ошибку для обычных форм."""
    if request.is_json or request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return jsonify({
            "status": "error",
            "error": "csrf_failed",
            "message": "Сессия устарела или CSRF-токен недействителен. Обновите страницу."
        }), 400

    return render_template("csrf_error.html", reason=error.description), 400

socketio.init_app(app, cors_allowed_origins=os.environ.get("ALLOWED_ORIGINS")) # добавить конкретный домен
accepted_user = ""
db.init_app(app)
with app.app_context():
    print("DB URI:", app.config["SQLALCHEMY_DATABASE_URI"])
    print("ENGINE URL:", db.engine.url)
    print("DATABASE FILE:", db.engine.url.database)

    inspector = inspect(db.engine)
    print("TABLES:", inspector.get_table_names())
login_manager = LoginManager(app)
login_manager.session_protection = "strong"
login_manager.login_view = "login"
login_manager.login_message_category = "info"
app.config['TELEGRAM_BOT_TOKEN'] = ''
DEFAULT_ROOM_CODE = os.environ.get("DEFAULT_ROOM_CODE") #убрать в переменные среды
HOST_USERNAME = os.environ.get("HOST_USERNAME") #убрать в переменные среды

with app.app_context():
    inspector = inspect(db.engine)
    print(inspector.get_table_names())


@app.route("/error-test/<int:code>") 
def error_test_code(code):
    abort(code)

@socketio.on("connect")
def on_connect():
    print("Client connected")


@socketio.on("disconnect")
def on_disconnect():
    print("Client disconnected")


@socketio.on("ping:test")
def ping_test(data):
    print("Ping from client:", data)

    emit("pong:test", {
        "message": "Socket.IO работает"
    })
    
@socketio.on("room:join_slot")
def socket_join_room(data):
    room_code = str(data.get("room") or get_room_code() or "")
    role = data.get("role") or "unknown"
    username = data.get("username") or ""

    join_room(room_code)
    join_room(f"{room_code}:{role}")
    if username:
        join_room(f"{room_code}:user:{username}")

    print(f"Socket joined room={room_code}, role={role}, username={username}")
    update_list_users()
    emit("room:joined", {
        "room": room_code,
        "role": role,
        "username": username
    })   
    
    
@socketio.on("room:join_tpv")
def socket_join_room(data):
    room_code = str(data.get("room") or get_room_code() or "")
    role = data.get("role") or "unknown"
    username = data.get("username") or ""

    join_room(room_code)
    join_room(f"{room_code}:{role}")
    if username:
        join_room(f"{room_code}:user:{username}")

    print(f"Socket joined room={room_code}, role={role}, username={username}")
    update_users_tpv()
    emit("room:joined", {
        "room": room_code,
        "role": role,
        "username": username
    }) 

@socketio.on("count_answer_interactive")
def count_interactive(data):
    try:
        col = int(data["interactive"])
        socketio.emit("count_answer_interactive_for_spec",col,to=f"{DEFAULT_ROOM_CODE}:spectator")
    except:
        return

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Users, user_id)

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True, unique=True)
    game = db.Column(db.Text, unique=True)
    def __repr__(self):
        return '<Room %r>' %self.id


class Users(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    username = db.Column(db.String(10), unique=True, nullable=False)
    answer = db.Column(db.Text)
    money = db.Column(db.Integer)
    time = db.Column(db.Text)
    status = db.Column(db.Text)
    main_money = db.Column(db.Integer)
    red_bomb = db.Column(db.Text)
    def __repr__(self):
        return '<Users %r>' %self.id
    
class Helps(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    h50_50 = db.Column(db.Text)
    alter = db.Column(db.Text)
    navi = db.Column(db.Text)
    x2 = db.Column(db.Text)
    auden = db.Column(db.Text)
    fact = db.Column(db.Text)
    def __repr__(self):
        return '<Helps %r>' %self.id

class Facts(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    slot = db.Column(db.Text, nullable=False)
    des_fact = db.Column(db.Text)
    def __repr__(self):
        return '<Facts %r>' %self.id

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    round = db.Column(db.Integer)
    fatal = db.Column(JSON)
    md5 = db.Column(db.Text)
    count_fatal = db.Column(db.Integer)
    b_bomb = db.Column(db.Integer)
    r_bomb = db.Column(db.Integer)
    def __repr__(self):
        return '<Task %r>' %self.id

class Answered(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    answer = db.Column(db.Text)
    round = db.Column(db.Integer)
    def __repr__(self):
        return '<Answered %r>' %self.id


def get_current_room():
    """Возвращает текущую игровую комнату или None."""
    return db.session.scalar(db.select(Room).limit(1))


def get_room_code():
    """Возвращает код текущей комнаты строкой."""
    room = get_current_room()
    return str(room.id) if room is not None else None


def init_game():
    db.session.execute(db.delete(Task))
    db.session.execute(db.delete(Answered))
    db.session.execute(db.delete(Helps))
    #if os.path.exists("answered.json"):
    #    os.remove("answered.json")
   # if os.path.exists("task.json"):
  #      os.remove("task.json")
    if os.path.exists("task_otbor.json"):
        os.remove("task_otbor.json")
   # if os.path.exists("helps.json"):
   #     os.remove("helps.json")
   # if os.path.exists("50_50.json"):
   #     os.remove("50_50.json")  
  #  if os.path.exists("alter.json"):
  #      os.remove("alter.json")
  #  if os.path.exists("navi.json"):
   #     os.remove("navi.json") 
  #  if os.path.exists("auden.json"):
    #    os.remove("auden.json") 
  #  if os.path.exists("fact.json"):
  #      os.remove("fact.json") 
  #  if os.path.exists("50_50_spec.json"):
   #     os.remove("50_50_spec.json")  
  #  if os.path.exists("alter_spec.json"):
  #      os.remove("alter_spec.json")
  #  if os.path.exists("navi_spec.json"):
   #     os.remove("navi_spec.json") 
 #   if os.path.exists("auden_spec.json"):
  #      os.remove("auden_spec.json") 
 #   if os.path.exists("fact_spec.json"):
  #      os.remove("fact_spec.json") 


@app.route('/')
def index(): 
    #print (url_for('join'))
    return render_template("index.html")


def check_id_room(room_id):
   # if not os.path.exists("room.json"):
    room = db.session.scalar(db.select(Room).where(Room.id == int(room_id)))
    if room == None:
            return False
    else:
        return True


def give_name_game(game_name):
    name = db.session.scalar(db.select(Room).where(Room.id==game_name))
    return name.game



@app.route('/join', methods=["POST", "GET"])
def join():
    if request.method == 'POST':
        if 'userLogged' in session:
            pass
        print(request.form)
        if request.form['user_name']== "":
           flash ('Требуется авторизация')
           return render_template("login.html")
        if  (request.form['user_name']!=HOST_USERNAME) and (request.form['room_id']==DEFAULT_ROOM_CODE):
           flash ('Неверный код комнаты')
           return render_template("login.html")
        if (request.form['user_name']==HOST_USERNAME)  and (request.form['room_id']==DEFAULT_ROOM_CODE):
           # _users[0] = request.form['user_name']
            init_game()
            return render_template("select.html")
        else:
            if check_id_room(request.form['room_id'])==False:
                flash ('Неверный код комнаты')
                return render_template("login.html")
            if give_name_game(request.form['room_id']) == 'slot':
                u = Users()
                u.username = request.form['user_name']
                u.answer = "0"
                u.money = 0
                u.time = datetime.now()
                u.status = "wait"
                u.main_money = 0
                u.red_bomb = "false"
                tmp = db.session.scalar(db.select(Users).where(Users.username==u.username))
                if tmp!=None:
                    if tmp.username == u.username:
                   # if tmp.username in session['username']:
                            print (url_for('join'))
                            return render_template("user_slot.html",value=u.username)

                            
                    #else:
                     #   return render_template("login.html")                       
                db.session.add(u)
                db.session.flush()
                db.session.commit()
                session['username'] = u.username
                ch = login_user(u)
                return render_template("user_slot.html",value=u.username)
            if give_name_game(request.form['room_id']) == 'tpv':
                find_user = db.session.scalar(db.select(UsersTpv).where(UsersTpv.username==request.form['user_name']))
                # if find_user == None:
                #    flash ('К сожалению, Ваша заявку на игру не найдена')
                 #   return render_template("login.html")
                # if find_user.flip_col<6:
                 #   flash ('К сожалению, Ваша заявку на игру не одобрена! Недостаточно вопросов замены')
                     #return render_template("login.html")  
                user_tpv = QueryTpv()
                user_tpv.username = request.form['user_name']
                tmp = db.session.scalar(db.select(QueryTpv).where(QueryTpv.username==user_tpv.username))
                if tmp!=None:
                    if tmp.username == u.username:
                   # if tmp.username in session['username']:
                            print (url_for('join'))
                            #return render_template("user_slot.html",value=u.username)
                #user_tpv.money = find_user.money
                user_tpv.money = 0
                #user_tpv.flip = find_user.flip
                user_tpv.flip = "test"
                user_tpv.status = "wait"
                db.session.add(user_tpv)
                db.session.flush()
                db.session.commit()
                update_users_tpv()
                session['username'] = user_tpv.username 
                ch = login_user(user_tpv)
                return render_template("login.html")
                    
    return render_template("login.html")

@app.route('/select', methods=["POST", "GET"])
def select():
    if request.method == 'POST':
        if request.form.values == "Свободный слот":
         print (url_for('slot'))
         return render_template("slot.html")
    abort(403)
    print (url_for('join'))
    return render_template("login.html")

@app.route('/slot', methods=["POST", "GET"])
def slot():
    if request.method == 'POST':
        print (url_for('slot'))
        return render_template("slot.html")
    abort(403)
    print (url_for('join'))
    return render_template("login.html")

@app.route('/tpv', methods=["POST", "GET"])
def tpv():
    if request.method == 'POST':
        print (url_for('tpv'))
        return render_template("tpv.html")
    abort(403)
    print (url_for('join'))
    return render_template("login.html")


@app.route('/tpv_host', methods=["POST", "GET"])
def tpv_host():
    if request.method == 'POST':
        print (url_for('tpv_host'))
        #for i in _users:
          #  flash (i)
        return render_template("tpv-host.html")
    abort(403)
    print (url_for('join'))
    return render_template("login.html")



@app.route('/user_slot', methods=["GET"])
def user_slot():
    if request.method == 'GET':
        abort(401)

@app.route('/spec_slot', methods=["POST", "GET"])
def spec_slot():
    if request.method == 'POST':
        print (url_for('slot'))
        return render_template("spec_slot.html")
    abort(400)
    print (url_for('join'))
    return render_template("login.html")


@app.route('/host_slot', methods=["POST", "GET"])
def host_slot():
    if request.method == 'POST':
        print (url_for('host_slot'))
        #for i in _users:
          #  flash (i)
        return render_template("host_slot.html")
    abort(403)
    print (url_for('join'))
    return render_template("login.html")

@app.route('/invite_user', methods=["POST", "GET"])
def invite_user():
    if request.method == 'POST':
        try:
            u = request.json['user_name']
            tmp = db.session.scalar(db.select(Users).where(Users.id==int(u)))
            u = str(tmp.username)
            if tmp.red_bomb == 'true':
                return json.dumps("red bomb")
        except:
            return json.dumps("fail")
        if tmp == None:
            return json.dumps("fail")
        tmp.status = 'main'
        tmp.answer = '0'
        tmp.time = 0
	#tmp.time = 0
        db.session.commit()
        socketio.emit("updated_status_user",tmp.status,to=f"{get_room_code()}:user:{tmp.username}");
        js = db.session.scalars(db.select(Users)).all()
        if len(js)!=1:
            for i in range(len(js)):
                if js[i].status !="main":
                    js[i].status = 'interactive'
                    js[i].answer = '0'
                    js[i].time = 0
                    socketio.emit("updated_status_user",js[i].status,to=f"{get_room_code()}:user:{js[i].username}");
            db.session.commit()
        update_list_users()    
        return json.dumps(u)
    print (url_for('host_slot'))
    return render_template("host_slot.html")




@app.route('/gen_task', methods=["POST", "GET"])
def gen_task():
    if request.method == 'POST':
        r = request.json["current_round"]
        tmp_bomb = request.json["bombs"]
        bomb = False
        if tmp_bomb == "true":
            bomb = True
        jsn = generate_string(int(r),bomb)
        if jsn == "null":
            return json.dumps("fail")
        get_task_user()
        return jsn
  #  print (url_for('host_slot'))
  #  return render_template("host_slot.html")


def get_md5_hash(stroka):
    characters = string.ascii_letters + string.punctuation
    random_string ="".join(secrets.choice(characters) for _ in range(12))
    result_str = str(stroka)+'_'+random_string
    return hashlib.md5(random_string.encode()).hexdigest()
    
    
def generate_string(round_id,is_bombed):
    secure_rnd = secrets.SystemRandom()
    current_round = int(round_id); #получить номер раунда, 0 - отборочный тур
    count_fatal = 0
    otbor_chislo = 0
    bomb = is_bombed
    if current_round == 0:
        otbor_chislo = secure_rnd.randint(10,999)
        a = secure_rnd.randint(10,otbor_chislo)
        b = secure_rnd.randint(otbor_chislo,999)
        md5_hash = get_md5_hash(otbor_chislo)
        result = [current_round,a,b,otbor_chislo,md5_hash]
        result_send = [current_round,a,b,None,md5_hash]
        socketio.emit("get_task_otbor",result_send,to=f"{DEFAULT_ROOM_CODE}:spectator")
        socketio.emit("get_task_otbor",result_send,to=f"{get_room_code()}:user")
        js = json.dumps(result)
        with open('task_otbor.json', 'w') as file:
            json.dump(result, file)
        return js
    else:
        match current_round:
            case 1: count_fatal=1
            case 2: count_fatal=2
            case 3: count_fatal=3
            case 4: count_fatal=5
            case 5: count_fatal=6
            case 6: count_fatal=8
            case 7: count_fatal=10
            case 8: count_fatal=12
            case 9: count_fatal=14
    
    if count_fatal == 1:
        fatal = secure_rnd.randint(1,15)
        #md5_hash = hashlib.md5(str(fatal).encode()).hexdigest()
        md5_hash = get_md5_hash(fatal)
        result = [current_round,fatal,md5_hash, count_fatal]
        result_send = [current_round,None,md5_hash, count_fatal]
        socketio.emit("get_task",result_send,to=f"{DEFAULT_ROOM_CODE}:spectator")
        socketio.emit("get_task",result_send,to=f"{get_room_code()}")
        db.session.execute(db.delete(Task))
        task = Task()
        task.round = current_round
        task.fatal = fatal
        task.md5 = md5_hash
        task.count_fatal = count_fatal
        db.session.add(task)
        db.session.flush()
        db.session.commit()
        js = json.dumps(result)
      #  with open('task.json','w') as file:
       #     json.dump(result,file)
        return js
    else:
        fatal = secure_rnd.sample([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], count_fatal)
        b_bomb = 'false'
        r_bomb = 'false'
        if bomb and (current_round >= 4):
            tmp_bombs = secure_rnd.sample(fatal,2)
            b_bomb = tmp_bombs[0]
            r_bomb = tmp_bombs[1]
        #md5_hash = hashlib.md5(str(fatal).encode()).hexdigest()
        md5_hash = get_md5_hash(fatal)
        result = [current_round,fatal,md5_hash,count_fatal,b_bomb,r_bomb]
        result_send = [current_round,None,md5_hash,count_fatal,None,None]
        socketio.emit("get_task",result_send,to=f"{DEFAULT_ROOM_CODE}:spectator")
        socketio.emit("get_task",result_send,to=f"{get_room_code()}")
        db.session.execute(db.delete(Task))
        task = Task()
        task.round = current_round
        task.fatal = json.dumps(fatal)
        task.md5 = md5_hash
        task.count_fatal = count_fatal
        if b_bomb != "false":
            task.b_bomb = b_bomb
        if r_bomb != "false":
            task.r_bomb = r_bomb
        db.session.add(task)
        db.session.flush()
        db.session.commit()
        js = json.dumps(result)
       # with open('task.json','w') as file:
           # json.dump(result,file)
        return js


            
@app.route('/get_fatal_host', methods=["POST", "GET"])
def get_fatal_host():
    if request.method == 'POST':
        r = request.json["answer"]
        r1 = request.json["round"]
        res = [r, r1]
       # db.session.execute(db.delete(Answered))
        answered = Answered()
        answered.answer = r
        answered.round = r1
        db.session.add(answered)
        db.session.flush()
        db.session.commit()
        #with open('answered.json', 'w') as file:
        #    json.dump(res, file)
        jsn = []
        task = db.session.scalar(db.select(Task).limit(1))
        jsn.append(task.round)
        if task.round == 1:
            jsn.append(task.fatal)
        else:
            jsn.append(json.loads(task.fatal))
        jsn.append(task.md5)
        jsn.append(task.count_fatal)
        if task.b_bomb == None:
            jsn.append("false")
        else:
            jsn.append(task.b_bomb)
        if task.r_bomb == None:
            jsn.append("false")
        else:
            jsn.append(task.r_bomb)
        #with open('task.json') as file:
        #   jsn = json.load(file)
    return jsn

@app.route('/h50_50', methods=["POST", "GET"])
def h50_50():
    if request.method == 'POST':
        secure_rnd = secrets.SystemRandom()
        r = request.json["round"]
        task = db.session.scalar(db.select(Task).limit(1))
        jsn =[]
            #with open('task.json') as file:
        jsn.append(task.round)
        if task.round == 1:
            jsn.append(task.fatal)
        else:
            jsn.append(json.loads(task.fatal))
        jsn.append(task.md5)
        jsn.append(task.count_fatal)
        if task.b_bomb == None:
            jsn.append("false")
        else:
            jsn.append(task.b_bomb)
        if task.r_bomb == None:
            jsn.append("false")
        else:
            jsn.append(task.r_bomb)
        f = jsn[1]
        cf = round(len(f)/2)
        res_f = secure_rnd.sample(f, cf)
        socketio.emit("response_50_50",res_f,to=f"{get_room_code()}")
        socketio.emit("response_50_50",res_f,to=f"{DEFAULT_ROOM_CODE}:spectator")
        #with open('50_50.json', 'w') as file:
        #    json.dump(res_f, file)
       # with open('50_50_spec.json', 'w') as file:
       #     json.dump(res_f, file)
        return res_f

@app.route('/alter', methods=["POST", "GET"])
def alter():
    if request.method == 'POST':
        secret_rnd = secrets.SystemRandom()
        r = request.json["round"]
        task = db.session.scalar(db.select(Task).limit(1))
        jsn =[]
            #with open('task.json') as file:
        jsn.append(task.round)
        if task.round == 1:
            jsn.append(task.fatal)
        else:
            jsn.append(json.loads(task.fatal))
        jsn.append(task.md5)
        jsn.append(task.count_fatal)
        if task.b_bomb == None:
            jsn.append("false")
        else:
            jsn.append(task.b_bomb)
        if task.r_bomb == None:
            jsn.append("false")
        else:
            jsn.append(task.r_bomb)
        f = jsn[1]
        cf = len(f)
        rf = secret_rnd.randint(1,cf-1)
        j = 0
        checked = False
        while (checked==False):
            checked = True
            j = secret_rnd.randint(1,15)
            for i in f:
                if i == j:
                    checked = False
                    break
        
        res = [f[rf],str(j)]
        socketio.emit("response_alter",res,to=f"{get_room_code()}")
        socketio.emit("response_alter",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
       # with open('alter.json', 'w') as file:
       #     json.dump(res, file)
       # with open('alter_spec.json', 'w') as file:
       #     json.dump(res, file)
        return res
    
@app.route('/navi', methods=["POST", "GET"])
def navi():
    if request.method == 'POST':
        secret_rnd = secrets.SystemRandom()
        r = request.json["round"]
        task = db.session.scalar(db.select(Task).limit(1))
        jsn =[]
            #with open('task.json') as file:
        jsn.append(task.round)
        if task.round == 1:
            jsn.append(task.fatal)
        else:
            jsn.append(json.loads(task.fatal))
        jsn.append(task.md5)
        jsn.append(task.count_fatal)
        if task.b_bomb == None:
            jsn.append("false")
        else:
            jsn.append(task.b_bomb)
        if task.r_bomb == None:
            jsn.append("false")
        else:
            jsn.append(task.r_bomb)
        f = jsn[1]
        f.sort()
        row1 = [0,0,0,0,0]
        row2 = [0,0,0,0,0]
        row3 = [0,0,0,0,0]

        for i in f:
            if (i >=1) & (i<=5):
                row1[i-1] = i
            if (i>=6) & (i<=10):
                row2[i-6] = i
            if (i>=11) & (i<=15):
                row3[i-11] = i
        
        col1 = [row1[0],row2[0],row3[0]]
        col2 = [row1[1],row2[1],row3[1]]
        col3 = [row1[2],row2[2],row3[2]]
        col4 = [row1[3],row2[3],row3[3]]
        col5 = [row1[4],row2[4],row3[4]]
        
        col_s = 0
        for i in row1:
            if (i == 0):
                col_s+=1
                
        row1s = round(col_s/5*100)
        col_s = 0
        for i in row2:
            if (i == 0):
                col_s+=1
                
        row2s = round(col_s/5*100)
        col_s = 0
        for i in row3:
            if (i == 0):
                col_s+=1
                
        row3s = round(col_s/5*100)
        
        
        row_max = [row1s,row2s,row3s]
        
        col_s = 0
        for i in col1:
            if (i == 0):
                col_s+=1
                
        col1s = round(col_s/3*100)
        col_s = 0
        for i in col2:
            if (i == 0):
                col_s+=1
                
        col2s = round(col_s/3*100)
        col_s = 0
        for i in col3:
            if (i == 0):
                col_s+=1
                
        col3s = round(col_s/3*100)
        col_s = 0
        for i in col4:
            if (i == 0):
                col_s+=1
                
        col4s = round(col_s/3*100)
        col_s = 0
        for i in col5:
            if (i == 0):
                col_s+=1
                
        col5s = round(col_s/3*100)
        
        col_max=[col1s,col2s,col3s,col4s,col5s]
        
        max_c = max(col_max)
        max_r = max(row_max)
        if max_c > max_r:
            tmp = -1
            for i in range(0,5):
                if max_c == col_max[i]:
                    tmp = i
                    break
            if tmp==0:
                res = ["1","6","11"]
            if tmp==1:
                res = ["2","7","12"]
            if tmp==2:
                res = ["3","8","13"]
            if tmp==3:
                res = ["4","9","14"]
            if tmp==4:
                res = ["5","10","15"]
            socketio.emit("response_navi",res,to=f"{get_room_code()}")
            socketio.emit("response_navi",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            #with open('navi.json','w') as file:
            #    json.dump(res,file)
           # with open('navi_spec.json', 'w') as file:
            #    json.dump(res, file)
            return res
        if max_c < max_r:
            tmp = -1
            for i in range(0,3):
                if max_r == row_max[i]:
                    tmp = i
                    break
            if tmp==0:
                res = ["1","2","3","4","5"]
            if tmp==1:
                res = ["6","7","8","9","10"]
            if tmp==2:
                res = ["11","12","13","14","15"]
            socketio.emit("response_navi",res,to=f"{get_room_code()}")
            socketio.emit("response_navi",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            #with open('navi.json','w') as file:
            #    json.dump(res,file)
            #with open('navi_spec.json', 'w') as file:
            #    json.dump(res, file)
            return res
        if max_r == max_c:
            j = secret_rnd.randint(1,2)
            if j==1:
                tmp = -1
                for i in range(0,5):
                 if max_c == col_max[i]:
                     tmp = i
                     break
                if tmp==0:
                    res = ["1","6","11"]
                if tmp==1:
                    res = ["2","7","12"]
                if tmp==2:
                    res = ["3","8","13"]
                if tmp==3:
                    res = ["4","9","14"]
                if tmp==4:
                    res = ["5","10","15"]
                socketio.emit("response_navi",res,to=f"{get_room_code()}")
                socketio.emit("response_navi",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
                #with open('navi.json','w') as file:
               #     json.dump(res,file)
               # with open('navi_spec.json', 'w') as file:
               #     json.dump(res, file)
                return res
            if j==2:
                tmp = -1
                for i in range(0,3):
                    if max_r == row_max[i]:
                        tmp = i
                        break
                if tmp==0:
                    res = ["1","2","3","4","5"]
                if tmp==1:
                    res = ["6","7","8","9","10"]
                if tmp==2:
                    res = ["11","12","13","14","15"]
                socketio.emit("response_navi",res,to=f"{get_room_code()}")
                socketio.emit("response_navi",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
                #with open('navi.json','w') as file:
                #    json.dump(res,file)
               # with open('navi_spec.json', 'w') as file:
                #    json.dump(res, file)
                return res


    
@app.route('/check_answered', methods=["POST", "GET"])
def check_answered():
    if request.method == 'POST':
        r = request.json["check"]
    if db.session.scalar(db.select(Answered).limit(1))!=None:
        return "true"
    else:
        return "false"   
    
@app.route('/show_rights', methods=["POST", "GET"])
def show_rights():
    if request.method == 'POST':
        js = db.session.scalars(db.select(Users)).all()
        if len(js)==1:
            js[0].status = "check main"
        else:
            jjj = db.session.scalars(db.select(Users)).all()
            for i in range(0,len(jjj)):
                if jjj[i].status == "answered interactive":
                    jjj[i].status = "check interactive"
                if jjj[i].status == "answered main":
                    jjj[i].status = "check main"
                if jjj[i].status ==  "answered main x2":
                    jjj[i].status = "check main x2"
                if jjj[i].status == "interactive no answer":
                    jjj[i].status = "check interactive"
            db.session.commit()
        update_list_users()                                       
        r = request.json["round"]
        ans = db.session.scalar(db.select(Answered).limit(1))
        jsn = [ans.answer, ans.round]
        db.session.execute(db.delete(Answered))
        #if os.path.exists("answered.json"):
         #   with open('answered.json') as file:
         #       jsn = json.load(file)
          #  os.remove("answered.json")
       # if os.path.exists("50_50.json"):
       #     os.remove("50_50.json")
      #  if os.path.exists("alter.json"):
      #     os.remove("alter.json")
      #  if os.path.exists("navi.json"):
      #      os.remove("navi.json")
        check_answer()
        answered_check_spec()
        return jsn
           ## answered interactive
            
            
                

    
 
@app.route('/sounds/slot/<filename>')
def serve_audio(filename):
    CUSTOM_AUDIO_DIR = "sounds/slot/"
    sanitized_filename = secure_filename(filename)

    mime_type, _ = mimetypes.guess_type(sanitized_filename)
    if not mime_type or not mime_type.startswith('audio/'):
        abort(400, description="Unsupported audio format.")

    result = send_from_directory(
        CUSTOM_AUDIO_DIR,
        sanitized_filename,
        mimetype=mime_type,
        as_attachment=False
    )

    result.cache_control.public = True
    result.cache_control.max_age = 432000  # 5 дней
    result.headers["Cache-Control"] = "public, max-age=432000, immutable"

    return result 


    
#@app.route('/update_list_users', methods=["POST", "GET"])
@socketio.on("update_list_users")
def update_list_users():
    #if request.method == 'POST':
        js = db.session.scalars(db.select(Users)).all()
        if len(js)==1:
            id = js[0].id
            username = js[0].username
            answer = js[0].answer
            money = js[0].money
            time = js[0].time
            status = js[0].status
            main_money = js[0].main_money
            red_bomb = js[0].red_bomb
            jsn = [id,username,answer,money,time, status,main_money,red_bomb,"true"]
            result = jsn
            socketio.emit("updated_list_user", result, to=DEFAULT_ROOM_CODE)
            socketio.emit("updated_status_user",js[0].status,to=f"{get_room_code()}:user:{js[0].username}");
            update_for_spec()
        else:
            jsn = []
            for i in range(0,len(js)):
                id = js[i].id
                username = js[i].username
                answer = js[i].answer
                money = js[i].money
                time = js[i].time
                status = js[i].status
                main_money = js[i].main_money
                red_bomb = js[i].red_bomb
                tmp = [id,username,answer,money,time, status,main_money,red_bomb,"false"]
                socketio.emit("updated_status_user",js[i].status,to=f"{get_room_code()}:user:{js[i].username}");
                jsn.append(tmp)
            result = jsn
            socketio.emit("updated_list_user",result, to=DEFAULT_ROOM_CODE)
            update_for_spec()
            return result
            


@app.route('/open_room', methods=["POST", "GET"])
def open_room():
    if request.method == 'POST':
        db.session.execute(db.delete(Room))
        db.session.commit()
        game_type = request.json['game_type']
        try:
            room_code = Room()
            secret_rnd = secrets.SystemRandom()
            room_code.id = secret_rnd.randint(1000,9999)
            room_code.game = game_type
            db.session.add(room_code)
            db.session.flush()
            db.session.commit()
            socketio.emit("room_code_show", {"room":room_code.id}, to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(room_code.id)
        except:
            return json.dumps("fail")
    else:
        return json.dumps("fail")
  
 
@app.route('/game_over', methods=["POST", "GET"])
def game_over():
    if request.method == 'POST':
        try:
            lose = request.json['lose']
            main_money = request.json['money']
            u = request.json['user_name']
            rb = request.json['rb']
            user_u = db.session.scalar(db.select(Users).where(Users.id==u))
            match main_money:
                case '0': user_u.main_money = user_u.main_money + 0
                case '1 000': user_u.main_money = user_u.main_money + 1000
                case '3 000': user_u.main_money = user_u.main_money + 3000
                case '5 000': user_u.main_money = user_u.main_money + 5000
                case '10 000': user_u.main_money = user_u.main_money + 10000
                case '25 000': user_u.main_money = user_u.main_money + 25000
                case '50 000': user_u.main_money = user_u.main_money + 50000
                case '150 000': user_u.main_money = user_u.main_money + 150000
                case '500 000': user_u.main_money = user_u.main_money + 500000
                case '1 000 000': user_u.main_money = user_u.main_money + 1000000
            if rb == "true":
                user_u.red_bomb = "true"
            db.session.commit()
            jh = db.session.scalars(db.select(Users)).all()
            for i in range(len(jh)):
                if lose == "true":
                    jh[i].status = "game over lose"
                else:
                    jh[i].status = "game over"
            db.session.commit()
            update_list_users()
            return json.dumps("ok")
        except:
            return json.dumps("fail")
 
        
@app.route('/close_room', methods=["POST", "GET"])
def close_room():
    if request.method == 'POST':
        db.session.execute(db.delete(Room))
        db.session.commit()
        socketio.emit("room_code_hide", {}, to=f"{DEFAULT_ROOM_CODE}:spectator")
        return json.dumps("ok")
    else:
        return json.dumps("fail")

@app.route('/get_user_status', methods=["POST", "GET"])
def get_user_status():
    if request.method == 'POST':
        try:
         tmp = request.json['user']
         user = Users()
         user = db.session.scalar(db.select(Users).where(Users.username==tmp))
         jsn = user.status
         return json.dumps(jsn)
        except:
            return json.dumps("fail")
        
@app.route('/reset_user_to_wait', methods=["POST", "GET"])
def reset_user_to_wait():
    if request.method == 'POST':
         #if os.path.exists('helps.json'):
         #   os.remove('helps.json')
         db.session.execute(db.delete(Helps))
        # if os.path.exists('answered.json'):
        #    os.remove('answered.json')
         db.session.execute(db.delete(Answered))
         db.session.execute(db.delete(Task))
       #  if os.path.exists("task.json"):
       #     os.remove("task.json")
         js = db.session.scalars(db.select(Users)).all()
         for i in range(0,len(js)):
            js[i].status = "wait"
            js[i].answer = "0"
            js[i].time = 0
            db.session.commit()
            socketio.emit("updated_status_user",js[i].status,to=f"{get_room_code()}:user:{js[i].username}");
         init_game()
         update_list_users()
         return json.dumps(" ")

#@app.route('/get_helps', methods=["POST", "GET"])
def get_helps():
    #if request.method == 'POST':
        #tmp_u = request.json['user']
        try:
            #if os.path.exists("helps.json"):
            user = db.session.scalars(db.select(Users)).all()
            result = []
            for i in range(len(user)):
                if (user[i].status == "main") or (user[i].status == "wait task main") or (user[i].status == "given task main"):
                    help = db.session.scalar(db.select(Helps).limit(1))
                    if help == None:
                       socketio.emit("get_helps", "fail", to=f"{get_room_code()}:user:{user[i].username}")
                       socketio.emit("get_helps", "fail",to=f"{DEFAULT_ROOM_CODE}:spectator")
                       return
                    else:
                        if help.h50_50 == "50:50":
                            result.append(help.h50_50)
                        if help.alter == "alter":
                            result.append(help.alter)
                        if help.navi == "navi":
                            result.append(help.navi)
                        if help.x2 == "x2":
                            result.append(help.x2)
                        if help.auden == "help_auden":
                            result.append(help.auden)
                        if help.fact == "fact":
                            result.append(help.fact)
                        socketio.emit("get_helps", result, to=f"{get_room_code()}:user:{user[i].username}")
                        socketio.emit("get_helps", result, to=f"{DEFAULT_ROOM_CODE}:spectator")
                     
            #    user = Users()
            #    user = db.session.scalar(db.select(Users).where(Users.username==tmp_u))
            #    if (user.status == "main") or (user.status == "wait task main") or (user.status == "given task main"):
            #        db.session.commit()
            #        with open('helps.json') as file:
            #            jsn = json.load(file)
            #        return jsn
            #    else:
            #        return json.dumps("no change")
            #else:
               #  return json.dumps("fail")   
        except:
            return json.dumps("fail")

@app.route('/send_helps', methods=["POST", "GET"])
def send_helps():
    if request.method == 'POST':
        tmp = request.json['helps']
        db.session.execute(db.delete(Helps))
        help = Helps()
        for i in tmp:
            if i == "50:50":
                help.h50_50 = i
            if i == "alter":
                help.alter = i
            if i == "navi":
                help.navi = i
            if i == "x2":
                help.x2 = i
            if i == "help_auden":
                help.auden = i
            if i == "fact":
                help.fact = i
        db.session.add(help)
        db.session.flush()
        db.session.commit()
        get_helps()
        #with open('helps.json','w') as file:
         #   json.dump(tmp,file)
        return json.dumps("OK") 
    else:
        return json.dumps("fail")
  
@app.route('/start_game', methods=["POST", "GET"])
def start_game():
    if request.method == 'POST':
        try:
            js = db.session.scalars(db.select(Users)).all()
            if len(js)!=1:
                for i in range(len(js)):
                    if js[i].status =="main":
                        js[i].status = "wait task main"
                    if js[i].status =="interactive":
                        js[i].status = "wait task interactive"
                    js[i].time = 0
                db.session.commit()
                update_list_users()
            else: 
                return json.dumps("fail")
            
            return json.dumps("ok")
        except:
            return json.dumps("fail")
  
#@app.route('/get_task_user', methods=["POST", "GET"])
def get_task_user():
    #if request.method == 'POST':
        #if not os.path.exists("task.json"):
        #    return json.dumps("fail")
       # with open('task.json') as file:
        #    jsn = json.load(file)
       # if request.json['user']=="spec":
        #    return json.dumps(jsn)
        try:
            task = db.first_or_404(db.select(Task))
            js = db.session.scalars(db.select(Users)).all()
            if len(js)!=1:
                for i in range(len(js)):
                    if js[i].status =="wait task main":
                        js[i].status = "given task main"
                    if js[i].status =="wait task interactive":
                        js[i].status = "given task interactive"
                db.session.commit()
            update_list_users()  
            #return json.dumps(jsn)
        except:
            return json.dumps("fail")
        

#@app.route('/check_answered_main', methods=["POST", "GET"])
def check_answered_main():
    #if request.method == 'POST':
        try:
            #u_tmp = request.json['user']
            #s_tmp = request.json['inter']
            #if not s_tmp:
            #    return json.dumps("fail")
            user2 = db.first_or_404(db.select(Users).where((Users.status == "answered main")|(Users.status == "answered main x2")))
            users = db.session.scalars(db.select(Users)).all()
            for i in range(len(users)):
                if (users[i].status == "given task interactive"):
                    users[i].status = "interactive no answer"
                    db.session.commit()
            update_list_users()
            socketio.emit("check_answered_main","ok",to=f"{get_room_code()}")
            
        except:
            return json.dumps("fail")
 
#@app.route('/answered_main_spec', methods=["POST", "GET"])
def answered_main_spec():
   # if request.method == 'POST':
        try:
            ans = db.first_or_404(db.select(Users).where((Users.status == "answered main")|(Users.status == "answered main x2")))
            if ans!=None:
                 #with open('answered.json') as file:
                 jsn = "o"+str(ans.answer)
                 socketio.emit("answered_main",jsn,to=f"{DEFAULT_ROOM_CODE}:spectator")
            #return json.dumps(jsn)
        except:
            return json.dumps("fail") 



#@app.route('/answered_check_spec', methods=["POST", "GET"])
def answered_check_spec():
    #if request.method == 'POST':
        try:
             task = db.session.scalar(db.select(Task).limit(1))
             jsn =[]
            #with open('task.json') as file:
             jsn.append(task.round)
             if task.round == 1:
                jsn.append(task.fatal)
             else:
                jsn.append(json.loads(task.fatal))
             jsn.append(task.md5)
             jsn.append(task.count_fatal)
             if task.b_bomb == None:
                jsn.append("false")
             else:
                jsn.append(task.b_bomb)
             if task.r_bomb == None:
                jsn.append("false")
             else:
                jsn.append(task.r_bomb)
             socketio.emit("answered_check_spec",jsn,to=f"{DEFAULT_ROOM_CODE}:spectator")
            #return json.dumps(jsn)
        except:
            return json.dumps("fail")  

    
@app.route('/send_answer', methods=["POST", "GET"])
def send_answer():
    if request.method == 'POST':
        try:
            u_tmp = request.json['user']
            a_tnp = request.json['answer_user']
            t_tmp = request.json['time_answer']
            user = db.session.scalar(db.select(Users).where(Users.username == u_tmp))
            if (user.status == "given task main") | (user.status == "check main x2") :
                user.status = "answered main"
                user.answer = a_tnp
                user.time = t_tmp
                db.session.commit()
                update_list_users()
                wait_answer_for_host()
                check_answered_main()
                answered_main_spec()
                return json.dumps("ok")
            if (user.status == "x2"):
                user.status = "answered main x2"
                user.answer = a_tnp
                user.time = t_tmp
                db.session.commit()
                update_list_users()
                wait_answer_for_host()
                check_answered_main()
                answered_main_spec()
                return json.dumps("ok")
            if (user.status == "given task interactive"):
                user.status = "answered interactive"
                user.answer = a_tnp
                user.time = t_tmp
                task = db.session.scalar(db.select(Task).limit(1))
                jsn =[]
                jsn.append(task.round)
                if task.round == 1:
                    jsn.append(task.fatal)
                else:
                    jsn.append(json.loads(task.fatal))
                jsn.append(task.md5)
                jsn.append(task.count_fatal)
                if task.b_bomb == None:
                    jsn.append("false")
                else:
                    jsn.append(task.b_bomb)
                if task.r_bomb == None:
                    jsn.append("false")
                else:
                    jsn.append(task.r_bomb)   
                #with open('task.json') as file:
                 #   jsn = json.load(file)
                fatals = jsn[1]
                c_fatals = jsn[3]
                r = jsn[0]
                wrong = False
                if r==1:
                    if int(user.answer)==fatals:
                        user.money = user.money - 50
                        wrong = True
                if r>1:
                    if (jsn[4]!="false") and (jsn[5]!="false"):
                        if int(user.answer)==jsn[4]:
                            user.money = 0
                            db.session.commit()
                            update_list_users()
                            return json.dumps("ok")
                        if int(user.answer)==jsn[5]:
                           user.money = user.money - 3000*c_fatals
                           db.session.commit()
                           update_list_users()
                           return json.dumps("ok")
                    for i in range(c_fatals):
                        if int(user.answer)==fatals[i]:
                            user.money = user.money - 50*c_fatals
                            wrong = True
                            break
                if not wrong:
                    user.money = user.money + 100*c_fatals
                db.session.commit()
            update_list_users()
            wait_answer_for_host()
            return json.dumps("ok")
        except:
            return json.dumps("fail")



#@app.route('/wait_answer_for_host', methods=["POST", "GET"])
def wait_answer_for_host():
    #if request.method == 'POST':
        try:
            user = db.session.scalar(db.select(Users).where((Users.status == "answered main")|(Users.status == "answered main x2")))
            if user == None:
                return json.dumps("fail")
            res = user.answer
            if res == '0':
                return json.dumps("fail")
            socketio.emit("user answered",res,to=f"{DEFAULT_ROOM_CODE}:host")
            #return json.dumps(res)
        except:
            return json.dumps("fail")

#@app.route('/check_answer', methods=["POST", "GET"])
def check_answer():
   # if request.method == 'POST':
        try:
            #tmp_u = request.json['user']
            users = db.session.scalars(db.select(Users)).all()
            for i in range(len(users)):
                if users[i].status == "check main":
                    users[i].status = "wait next round main"
                if users[i].status == "check interactive":
                    users[i].status = "wait next round interactive"
            #with open('task.json') as file:
            #        jsn = json.load(file)
            task = db.session.scalar(db.select(Task).limit(1))
            jsn =[]
            #with open('task.json') as file:
            jsn.append(task.round)
            if task.round == 1:
                jsn.append(task.fatal)
            else:
                jsn.append(json.loads(task.fatal))
            jsn.append(task.md5)
            jsn.append(task.count_fatal)
            if task.b_bomb == None:
                jsn.append("false")
            else:
                jsn.append(task.b_bomb)
            if task.r_bomb == None:
                jsn.append("false")
            else:
                jsn.append(task.r_bomb)
            db.session.commit()
            update_list_users()
            socketio.emit("checked answer", jsn, to=f"{get_room_code()}")
            #return json.dumps(jsn)
        except:
            return json.dumps("fail")

        
     




@app.route('/next_round', methods=["POST", "GET"])
def next_round():
    if request.method == 'POST':
        try:
            user = db.session.scalars(db.select(Users)).all()
            if len(user)==1:
                user[0].status = "wait task main"
                user[0].answer = "0"
                user[0].time = 0
            else:
                for i in range(len(user)):
                    if (user[i].status == "wait next round main") | (user[i].status == "check main x2"):
                        user[i].status = "wait task main"
                        user[i].answer = "0"
                    if (user[i].status == "wait next round interactive") | (user[i].status == "interactive no answer"):
                        user[i].status = "wait task interactive"
                        user[i].answer = "0"
                    user[i].time = 0
            #if os.path.exists('task.json'):
            #    os.remove('task.json')
            db.session.commit()
            db.session.execute(db.delete(Task))
            get_helps()
            update_list_users()
            return json.dumps("ok")
        except:
            return json.dumps("fail")


#@app.route('/get_50_50', methods=["POST", "GET"])

@socketio.on("get 50:50")
def get_50_50(data=None):
    #if request.method == 'POST':
        try:
         #   tmp_u = request.json['user']
          #  user = db.session.scalar(db.select(Users).where(Users.username==tmp_u))
          #  find = False
           # user.status = "50:50"
           # db.session.commit()
            #while not find:
           # if os.path.exists("50_50.json"):
            #    with open('50_50.json') as file:
            #        p = json.load(file)
               # os.remove("50_50.json")
            #return json.dumps(p)
            socketio.emit("request 50:50", "ok",to=f"{DEFAULT_ROOM_CODE}:host")
        except:
            return json.dumps("fail")
        
      

#@app.route('/get_alter', methods=["POST", "GET"])
@socketio.on("get alter")
def get_alter(data=None):
   # if request.method == 'POST':
        try:
           # tmp_u = request.json['user']
           # user = db.session.scalar(db.select(Users).where(Users.username==tmp_u))
            #find = False
           # user.status = "alter"
           # db.session.commit()
            #while not find:
           # if os.path.exists("alter.json"):
           #     with open('alter.json') as file:
           #         p = json.load(file)
                        #find = True
                       # user.status = "given task main"
            #db.session.commit()
               # os.remove("alter.json")
            socketio.emit("request alter", "ok",to=f"{DEFAULT_ROOM_CODE}:host")
            #return json.dumps(p)
        except:
            return json.dumps("fail")



#@app.route('/get_navi', methods=["POST", "GET"])
@socketio.on("get navi")
def get_navi(data=None):
   # if request.method == 'POST':
        try:
           # tmp_u = request.json['user']
          #  user = db.session.scalar(db.select(Users).where(Users.username==tmp_u))
           # find = False
            #user.status = "navi"
           # db.session.commit()
            #while not find:
           # if os.path.exists("navi.json"):
          #      with open('navi.json') as file:
          #          p = json.load(file)
                        #find = True
                        #user.status = "given task main"
            #db.session.commit()
                #os.remove("navi.json")
            socketio.emit("request navi", "ok",to=f"{DEFAULT_ROOM_CODE}:host")
           # return json.dumps(p)
        except:
            return json.dumps("fail")
        




#@app.route('/get_x2', methods=["POST", "GET"])
@socketio.on("get x2")
def get_x2(data=None):
   # if request.method == 'POST':
        try:
           # tmp_u = request.json['user']
            user = db.session.scalar(db.select(Users).where(Users.status=="given task main"))
            user.status = "x2"
            db.session.commit()
            update_list_users()
            socketio.emit("request x2", "ok", to=f"{DEFAULT_ROOM_CODE}:host")
            socketio.emit("response_x2", "ok", to=f"{DEFAULT_ROOM_CODE}:spectator")
            socketio.emit("response_x2", "ok", to=f"{get_room_code()}:user:{user.username}")
            return json.dumps("ok")
        except:
            return json.dumps("fail")


@app.route('/help_auden', methods=["POST", "GET"])
def help_auden():
    if request.method == 'POST':
        try:
            tmp_u = db.session.scalars(db.select(Users)).all()
            a1 = 0
            a2 = 0
            a3 = 0
            a4 = 0
            a5 = 0
            a6 = 0
            a7 = 0
            a8 = 0
            a9 = 0
            a10 = 0
            a11 = 0
            a12 = 0
            a13 = 0
            a14 = 0
            a15 = 0
            result = []
            for i in range (len(tmp_u)):
                if tmp_u[i].status == "answered interactive":
                    if tmp_u[i].answer == "1":
                        a1 += 1
                    if tmp_u[i].answer == "2":
                        a2 += 1
                    if tmp_u[i].answer == "3":
                        a3 += 1
                    if tmp_u[i].answer == "4":
                        a4 += 1
                    if tmp_u[i].answer == "5":
                        a5 += 1
                    if tmp_u[i].answer == "6":
                        a6 += 1
                    if tmp_u[i].answer == "7":
                        a7 += 1
                    if tmp_u[i].answer == "8":
                        a8 += 1
                    if tmp_u[i].answer == "9":
                        a9 += 1
                    if tmp_u[i].answer == "10":
                        a10 += 1
                    if tmp_u[i].answer == "11":
                        a11 += 1
                    if tmp_u[i].answer == "12":
                        a12 += 1
                    if tmp_u[i].answer == "13":
                        a13 += 1
                    if tmp_u[i].answer == "14":
                        a14 += 1
                    if tmp_u[i].answer == "15":
                        a15 += 1
            col_find_fatal = 0
            col_find_free = 0
            col_ans = (db.session.scalar(db.select(db.func.count(Users.id)).where(Users.status == "answered interactive")) or 0)
            if col_ans == 0:
                return jsonify("fail")
            result.append(round(a1/col_ans*100,2))
            result.append(round(a2/col_ans*100,2))
            result.append(round(a3/col_ans*100,2))
            result.append(round(a4/col_ans*100,2))
            result.append(round(a5/col_ans*100,2))
            result.append(round(a6/col_ans*100,2))
            result.append(round(a7/col_ans*100,2))
            result.append(round(a8/col_ans*100,2))
            result.append(round(a9/col_ans*100,2))
            result.append(round(a10/col_ans*100,2))
            result.append(round(a11/col_ans*100,2))
            result.append(round(a12/col_ans*100,2))
            result.append(round(a13/col_ans*100,2))
            result.append(round(a14/col_ans*100,2))
            result.append(round(a15/col_ans*100,2))
            jsn = []
            task = db.session.scalar(db.select(Task).limit(1))
            jsn.append(task.round)
            if task.round == 1:
                jsn.append(task.fatal)
            else:
                jsn.append(json.loads(task.fatal))
            jsn.append(task.md5)
            jsn.append(task.count_fatal)
            if task.b_bomb == None:
                jsn.append("false")
            else:
                jsn.append(task.b_bomb)
            if task.r_bomb == None:
                jsn.append("false")
            else:
                jsn.append(task.r_bomb)
            fatals = jsn[1]
            fatals.sort()
            for i in range(jsn[3]):
                for j in range(len(result)):
                    if ((j+1)==fatals[i]) & (result[j]>0):
                        col_find_fatal+=1
                        break
            
            result.append(round(col_find_fatal/col_ans*100))
            result.append(100-round(col_find_fatal/col_ans*100))   
            #with open('auden.json','w') as file:
           #     json.dump(result,file)
           # with open('auden_spec.json', 'w') as file:
            #    json.dump(result, file)
           # time.sleep(10)
            #if os.path.exists("auden.json"):
             #   os.remove("auden.json")        
            socketio.emit("response_auden",result,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(result)
        except:
            return json.dumps("fail")

#@app.route('/get_auden', methods=["POST", "GET"])
@socketio.on("get auden")
def get_auden(data=None):
   # if request.method == 'POST':
        try:
         #   uu = request.json['user']
          #  user = db.session.scalar(db.select(Users).where(Users.username==uu))
            #user.status = "auden"
            #db.session.commit()
            #while (True):
           # if os.path.exists("auden.json"):
                    #break
            #    pass
            #user.status = "given task main"
            #db.session.commit()
           socketio.emit("request auden", "ok",to=f"{DEFAULT_ROOM_CODE}:host") 
           # return json.dumps("ok")
        except:
            return json.dumps("fail")



@app.route('/fact', methods=["POST", "GET"])
def fact(data=None):
    if request.method == 'POST':
        try:
            secret_rnd = secrets.SystemRandom()
            slot = secret_rnd.randint(1,15)
            jsn = []
            task = db.session.scalar(db.select(Task).limit(1))
            jsn.append(task.round)
            if task.round == 1:
                jsn.append(task.fatal)
            else:
                jsn.append(json.loads(task.fatal))
            jsn.append(task.md5)
            jsn.append(task.count_fatal)
            if task.b_bomb == None:
                jsn.append("false")
            else:
                jsn.append(task.b_bomb)
            if task.r_bomb == None:
                jsn.append("false")
            else:
                jsn.append(task.r_bomb)
            fat = jsn[1]
            find = False
            
            while not find:
                find = True
                for i in range(jsn[3]):
                    if fat[i]==slot:
                        slot = secret_rnd.randint(1,15)
                        find = False
                        break
            facts = db.session.scalar(db.select(Facts).where(Facts.slot==str(slot)))
            result = []
            result.append(facts.slot)
            result.append(facts.des_fact)
            socketio.emit("response_fact",result,to=f"{DEFAULT_ROOM_CODE}:spectator")
            #with open('fact.json','w') as file:
           #     json.dump(result,file)
           # with open('fact_spec.json', 'w') as file:
            #    json.dump(result, file)
            db.session.delete(facts)
            db.session.commit()
           # time.sleep(10)
            #if os.path.exists("fact.json"):
             #   os.remove("fact.json")   
            return json.dumps(result)
        except:
            return json.dumps("fail")

@socketio.on("get fact")
#@app.route('/get_fact', methods=["POST", "GET"])
def get_fact(data=None):
   # if request.method == 'POST':
        try:
          #  uu = request.json['user']
          #  user = db.session.scalar(db.select(Users).where(Users.username==uu))
           # user.status = "fact"
           # db.session.commit()
           # while (True):
            #if os.path.exists("fact.json"):
                #break
           #     pass
           # user.status = "given task main"
           # db.session.commit()
            #return json.dumps("ok")
            socketio.emit("request fact", "ok",to=f"{DEFAULT_ROOM_CODE}:host") 
        except:
            return json.dumps("fail")
        



##
@app.route('/clear_table', methods=["POST", "GET"])
def clear_table():
    if request.method == 'POST':
        user_all = db.session.execute(db.delete(Users))
        update_list_users()
        db.session.commit()
        return json.dumps("ok")
        
    return json.dumps("fail")



#@app.route('/update_for_spec', methods=["POST", "GET"])
def update_for_spec():
   # if request.method == 'POST':
        user_waits = (db.session.scalar(db.select(db.func.count(Users.id)).where(Users.status == "wait")) or 0)
        user_all = db.session.scalars(db.select(Users)).all()
        if len(user_all)==0:
            socketio.emit("updated_list_user_spec","fail",to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps("fail")
        if (len(user_all)==user_waits):
            socketio.emit("updated_list_user_spec","wait",to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps("wait")
        user_main = db.session.scalar(db.select(Users).where(Users.status == "main"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "wait task main"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "given task main"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "answered main"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "answered main x2"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            return json.dumps(res)
        
        user_main = db.session.scalar(db.select(Users).where(Users.status == "check main"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "check main x2"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "game over lose"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "game over"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "50:50"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "alter"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "x2"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "navi"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "auden"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "fact"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "otbor"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "warning otbor"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "start otbor"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "winner otbor"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "otbor end"))
        if (user_main != None):
            res = []
            res.append(user_main.status)
            res.append(user_main.username)
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res) 
        user_main = db.session.scalar(db.select(Users).where(Users.status == "show result"))
        if (user_main != None):
            res = get_result()
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)
        user_main = db.session.scalar(db.select(Users).where(Users.status == "show total result"))
        if (user_main != None):
            res = get_total_result()
            socketio.emit("updated_list_user_spec",res,to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(res)


def get_result():
    result = []
    tmp = db.session.scalars(db.select(Users).order_by(desc(Users.money))).all()
    for i in range(len(tmp)):
        status = tmp[i].status
        username = tmp[i].username
        money = tmp[i].money
        t = [status, username, money]
        result.append(t)
    return result

def get_total_result():
    result = []
    tmp = db.session.scalars(db.select(Users).order_by(desc(Users.money+Users.main_money))).all()
    for i in range(len(tmp)):
        status = tmp[i].status
        username = tmp[i].username
        money = tmp[i].money + tmp[i].main_money
        t = [status, username, money]
        result.append(t)
    return result


#@app.route('/send_script', methods=["POST", "GET"])
@socketio.on("send_script")
def send_script(data):
    #if request.method == 'POST':
        try:
           # scr = request.json['script']
            scr = data.get("script")
            #with open('script.json', 'w') as file:
            #    json.dump(scr, file)
            socketio.emit("updated_script",scr,to=DEFAULT_ROOM_CODE) 
        except:
            return json.dumps("fail")
    
    
#@app.route('/send_fix', methods=["POST", "GET"])
@socketio.on("send_fix")
def send_fix(data):
    #if request.method == 'POST':
        try:
            #scr = request.json['fix']
            scr = data.get("fix")
            #with open('fix.json', 'w') as file:
            #    json.dump(scr, file)
           # return json.dumps("ok")
            socketio.emit("updated_fix",scr,to=DEFAULT_ROOM_CODE)  
        except:
            return json.dumps("fail")
        

#@app.route('/send_round', methods=["POST", "GET"])
@socketio.on("send_round")
def send_round(data):
    #if request.method == 'POST':
        try:
            scr = data.get("round")
            #scr = request.json['round']
           # with open('round.json', 'w') as file:
           #     json.dump(scr, file)
           # return json.dumps("ok")
            socketio.emit("updated_round",scr,to=DEFAULT_ROOM_CODE) 
        except:
            return json.dumps("fail")
        

@app.route('/get_tree', methods=["POST", "GET"])
def get_tree():
    if request.method == 'POST':
        try:
            res = []
            with open('script.json') as file:
                jsn = json.load(file)
            res.append(jsn)
            with open('fix.json') as file:
                jsn = json.load(file)
            res.append(jsn)
            with open('round.json') as file:
                jsn = json.load(file)
            res.append(jsn)
            return json.dumps(res)
        except:
            return json.dumps("fail")

@app.route('/otbor', methods=["POST", "GET"])
def otbor():
    if request.method == 'POST':
        try:
            u_all = db.session.scalars(db.select(Users)).all()
            for i in range(len(u_all)):
                if u_all[i].red_bomb == 'true':
                    continue
                u_all[i].status = "otbor"
                u_all[i].time = "0"
                socketio.emit("updated_status_user",u_all[i].status,to=f"{get_room_code()}:user:{u_all[i].username}");
            db.session.commit()
            update_list_users()
            return json.dumps("ok")
        except:
            return json.dumps("fail")
        
@app.route('/warning_otbor', methods=["POST", "GET"])
def warning_otbor():
    if request.method == 'POST':
        try:
            u_all = db.session.scalars(db.select(Users)).all()
            for i in range(len(u_all)):
                if u_all[i].red_bomb == 'true':
                    continue
                u_all[i].status = "warning otbor"
                db.session.commit()
                update_list_users()
                socketio.emit("updated_status_user",u_all[i].status,to=f"{get_room_code()}:user:{u_all[i].username}");
            return json.dumps("ok")
        except:
            return json.dumps("fail")

@app.route('/start_otbor', methods=["POST", "GET"])
def start_otbor():
    if request.method == 'POST':
        try:
            u_all = db.session.scalars(db.select(Users)).all()
            for i in range(len(u_all)):
                if u_all[i].red_bomb == 'true':
                    continue
                u_all[i].status = "start otbor"
                db.session.commit()
                update_list_users()
                socketio.emit("updated_status_user",u_all[i].status,to=f"{get_room_code()}:user:{u_all[i].username}");
            return json.dumps("ok")
        except:
            return json.dumps("fail")
        
@app.route('/show_answer_otbor', methods=["POST", "GET"])
def show_answer_otbor():
    if request.method == 'POST':
        try:
            u_all = db.session.scalars(db.select(Users)).all()
            with open('task_otbor.json') as file:
                p = json.load(file)
            for i in range(len(u_all)):
                if u_all[i].red_bomb == 'true':
                    continue
                u_all[i].status = "otbor end"
                db.session.commit()
                update_list_users()
                socketio.emit("updated_status_user",u_all[i].status,to=f"{get_room_code()}:user:{u_all[i].username}");
                socketio.emit("get_answer_otbor",p,to=f"{DEFAULT_ROOM_CODE}:spectator");
                socketio.emit("get_answer_otbor",p,to=f"{get_room_code()}:user:{u_all[i].username}");
            #os.remove('task_otbor.json')
            return json.dumps(p)
        except:
            return json.dumps("fail")


@app.route('/get_task_otbor', methods=["POST", "GET"])
def get_task_otbor():
    if request.method == 'POST':
        try:
            if os.path.exists("task_otbor.json"):
                with open('task_otbor.json') as file:
                    p = json.load(file)
                return json.dumps(p)
            else:
                return json.dumps("fail")
        except:
            return json.dumps("fail")

@app.route('/send_answer_otbor', methods=["POST", "GET"])
def send_answer_otbor():
    if request.method == 'POST':
        try:
            ans = request.json['ans_otbor']
            user = request.json['user']
            time = request.json['time_answer']
            user_db = db.session.scalar(db.select(Users).where(Users.username == user))
            user_db.answer = ans
            user_db.time = time
            db.session.commit()
            update_list_users()
            return json.dumps("ok")
        except:
            return json.dumps("fail")


@app.route('/show_result_otbor', methods=["POST", "GET"])
def show_result_otbor():
    if request.method == 'POST':
        try:
            user_all = db.session.scalars(db.select(Users)).all()
            with open('task_otbor.json') as file:
                    p = json.load(file)
            abs_arr = []
            for i in range(len(user_all)):
                if user_all[i].answer == '0':
                    abs_arr.append(1000000)
                else:
                    try:
                        abs_a = abs(int(p[3])-int(user_all[i].answer))
                        abs_arr.append(abs_a)
                    except:
                        abs_arr.append(1000000)
            min_abs_arr = min(abs_arr)
            users_ans_win = []
            for i in range(len(abs_arr)):
                if abs_arr[i] == min_abs_arr:
                    users_ans_win.append(i)
            if len(users_ans_win)==1:
                user_winner = db.session.scalar(db.select(Users).where(Users.id==users_ans_win[0]+1))
                user_winner.status = "winner otbor"
                db.session.commit()
                #return json.dumps(user_winner)
            else:
                arr_time = []
                for i in range(len(users_ans_win)):
                    tmp_time = user_all[users_ans_win[i]].time
                    arr_time.append(tmp_time)
                min_time = min(arr_time)
                for i in range(len(user_all)):
                    if ((user_all[i].time == min_time) and (min_abs_arr==abs(int(user_all[i].answer)-int(p[3])))):
                        user_winner = user_all[i]
                        user_winner.status = "winner otbor"
                        db.session.commit()
                       # return json.dumps(user_winner)   
            result = []
            result.append(user_winner.id)
            result.append(user_winner.username)
            result.append(user_winner.answer)
            result.append(user_winner.time)
            
            socketio.emit("show_winner_otbor",update_list_users(),to=f"{DEFAULT_ROOM_CODE}:spectator")
            return json.dumps(result)
        except:
            return json.dumps("fail")

@app.route('/show_result_interactive', methods=["POST", "GET"])
def show_result_interactive():
    if request.method == 'POST':
        try:
            action = request.json['action']
            user_all = db.session.scalars(db.select(Users)).all()
            for i in range(len(user_all)):
                if action == "show":
                    user_all[i].status = "show result"
                if action == "show total":
                    user_all[i].status = "show total result"
                if action == "hide":
                    user_all[i].status = "wait"
            db.session.commit()
            update_list_users()
            return json.dumps("ok")
        except:
            return json.dumps("fail")

@socketio.on("wait_4_min")
def wait_4_min():
    socketio.emit("wait_4min","ok",to=f"{DEFAULT_ROOM_CODE}:spectator")
    
@socketio.on("wait_1_min")
def wait_1_min():
    socketio.emit("wait_1min","ok",to=f"{DEFAULT_ROOM_CODE}:spectator")

@socketio.on("host_show_credits")
def host_show_credits():
    socketio.emit("show_credits", {
    "title": "Спасибо за игру!",
    "lines": [
        "Ведущий: Mokaque",
        "Оригинальные авторы идеи: Сергей Бойцов,  Игорь Черкасов",
        "Композитор: Дмитрий Яковлев",
        "Адаптация правил и игры: Mokaque",
        "Техническая реализация: Mokaque",
        "Графика: ChatGPT",
        "Никто из участников создания данной адаптации игры не претендует на авторские права на формат оригинальной игры 'Свободный слот'",
        "Данный проект выпущен исключительно в развлекательных целях и не преследует целей получение материальной выгоды",
        "Оригинальная игра 'Свободный слот' проводится в онлайн формате на https://www.twitch.tv/fighter_kit",
        "До встречи в следующей игре!"
    ]
}, to=f"{DEFAULT_ROOM_CODE}:spectator")
    

@socketio.on("host_hide_credits")
def host_hide_credits():
    socketio.emit("hide_credits", {}, to=f"{DEFAULT_ROOM_CODE}:spectator")


@socketio.on("show_intro")
def handle_show_intro():
    emit("show_intro", to=f"{DEFAULT_ROOM_CODE}:spectator")


@app.route('/sounds/tpv/<filename>')
def serve_audio_tpv(filename):
    CUSTOM_AUDIO_DIR = "sounds/tpv/"
    sanitized_filename = secure_filename(filename)

    mime_type, _ = mimetypes.guess_type(sanitized_filename)
    if not mime_type or not mime_type.startswith('audio/'):
        abort(400, description="Unsupported audio format.")

    result = send_from_directory(
        CUSTOM_AUDIO_DIR,
        sanitized_filename,
        mimetype=mime_type,
        as_attachment=False
    )

    result.cache_control.public = True
    result.cache_control.max_age = 432000  # 5 дней
    result.headers["Cache-Control"] = "public, max-age=432000, immutable"

    return result  

@app.route('/sounds/tpv/bong-game/<filename>')
def serve_audio_tpv_bong(filename):
    CUSTOM_AUDIO_DIR = "sounds/tpv/bong-game/"
    sanitized_filename = secure_filename(filename)

    mime_type, _ = mimetypes.guess_type(sanitized_filename)
    if not mime_type or not mime_type.startswith('audio/'):
        abort(400, description="Unsupported audio format.")

    result = send_from_directory(
        CUSTOM_AUDIO_DIR,
        sanitized_filename,
        mimetype=mime_type,
        as_attachment=False
    )

    result.cache_control.public = True
    result.cache_control.max_age = 432000  # 5 дней
    result.headers["Cache-Control"] = "public, max-age=432000, immutable"

    return result  


@app.post("/api/voice-number")
def api_voice_number():
    data = request.get_json(silent=True) or {}

    try:
        number = int(data.get("number"))
    except (TypeError, ValueError):
        return jsonify({
            "ok": False,
            "error": "Необходимо передать целое число",
        }), 400

    include_currency = bool(
        data.get("include_currency", False)
    )

    try:
        filenames = number_to_audio(
            number,
            include_currency=include_currency,
        )
    except ValueError as error:
        return jsonify({
            "ok": False,
            "error": str(error),
        }), 400

    urls = [
        url_for(
            "serve_audio_tpv_bong",
            filename=f"{filename}",
        )
        for filename in filenames
    ]

    return jsonify({
        "ok": True,
        "number": number,
        "files": filenames,
        "urls": urls,
    })


class UsersTpv(db.Model):
    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )
    username = db.Column(
        db.String(10),
        unique=True,
        nullable=False,
    )
    flip = db.Column(db.Text)
    money = db.Column(db.Integer, default=0)
    approve = db.Column(db.Text)
    flip_col = db.Column(db.Integer, default=0)
    def __repr__(self):
            return '<UsersTpv %r>' %self.id


class Questions_tpv(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )
    task = db.Column(db.Text)
    answer = db.Column(db.Text)
    comment = db.Column(db.Text)
    author = db.Column(db.Text)
    flip = db.Column(db.Text)
    show = db.Column(db.Text)
    def __repr__(self):
        return '<Questions_tpv %r>' %self.id


class QueryTpv(db.Model, UserMixin):
    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )
    username = db.Column(
        db.String(10),
        unique=True,
        nullable=False,
    )
    flip = db.Column(db.Text)
    money = db.Column(db.Integer, default=0)
    status = db.Column(db.Text, default="wait")
    def __repr__(self):
            return '<QueryTpv %r>' %self.id




@socketio.on("update_users_tpv")
def update_users_tpv():
        js = db.session.scalars(db.select(QueryTpv)).all()
        if len(js)==1:
            id = js[0].id
            username = js[0].username
            flip = js[0].flip
            money = js[0].money
            status = js[0].status
            jsn = [id,username,flip,money,status,"true"]
            result = jsn
            socketio.emit("updated_users_tpv", result, to=f"{DEFAULT_ROOM_CODE}:host")
        else:
            jsn = []
            for i in range(0,len(js)):
                id = js[i].id
                username = js[i].username
                flip = js[i].flip
                money = js[i].money
                status = js[i].status
                tmp = [id,username,flip,money,status,"false"]
                #socketio.emit("updated_user_tpv",js[i].status,to=f"{get_room_code()}:user:{js[i].username}");
                jsn.append(tmp)
            result = jsn
            socketio.emit("updated_users_tpv",result, to=f"{DEFAULT_ROOM_CODE}:host")
            return result

@socketio.on("clean_db_tpv")
def clean_db_tpv():
    db.session.execute(db.delete(QueryTpv))
    db.session.commit()
    update_users_tpv()
    socketio.emit("DB_clean","ok", to=f"{DEFAULT_ROOM_CODE}:host")


@socketio.on("choose_player_random")
def choose_player_random():
    try:
        js = db.session.scalars(db.select(QueryTpv).where(QueryTpv.status=="wait")).all()
        if len(js)==0:
            return
        if len(js)==1:
            js[0].status = "selected"
            db.session.commit()
            id = js[0].id
            username = js[0].username
            flip = js[0].flip
            money = js[0].money
            status = js[0].status
            jsn = [id,username,flip,money,status]
            result = jsn
            socketio.emit("player_selected", result, to=f"{DEFAULT_ROOM_CODE}:host")
            update_users_tpv()
        else:
            secure_rnd = secrets.SystemRandom()
            num = secure_rnd.randint(0,len(js))
            js[num].status = "selected"
            db.session.commit()
            id = js[num].id
            username = js[num].username
            flip = js[num].flip
            money = js[num].money
            status = js[num].status
            jsn = [id,username,flip,money,status]
            result = jsn
            update_users_tpv()
            socketio.emit("player_selected", result, to=f"{DEFAULT_ROOM_CODE}:host")
            update_users_tpv()
    except:
        pass
    
@socketio.on("choose_player_id")
def choose_player_id(data):
    try:
        num = data["id"]
        js = db.session.scalar(db.select(QueryTpv).where(QueryTpv.id==num))
        if js == None:
            return
        js.status = "selected"
        db.session.commit()
        id = js.id
        username = js.username
        flip = js.flip
        money = js.money
        status = js.status
        jsn = [id,username,flip,money,status]
        result = jsn
        socketio.emit("player_selected", result, to=f"{DEFAULT_ROOM_CODE}:host")
        update_users_tpv()
    except:
        pass

@socketio.on("reset_to_wait_tpv")
def reset_to_wait_tpv():
    try:
        js = db.session.scalars(db.select(QueryTpv)).all()
        if len(js)==1:
            js[0].status = "wait"
            db.session.commit()
            update_users_tpv()
        else:
            for i in range(0,len(js)):
                if js[i].status != "ended":
                    js[i].status = "wait"
                    db.session.commit()
                    update_users_tpv()
    except:
        return json.dump("fail")

@socketio.on("generate_safe_bong_game")
def generate_safe_bong_game():
    secure_rnd = secrets.SystemRandom()
    num = secure_rnd.randint(1,3)
    socketio.emit("bong_game_safe_var",num,to=f"{DEFAULT_ROOM_CODE}:host")


@socketio.on("generate_sum_for_bong_game")
def generate_sum_for_bong_game(data):
    secure_rnd = secrets.SystemRandom()
    col = secure_rnd.randint(6,15)
    secure_rnd = secrets.SystemRandom()
    result = secure_rnd.sample(range(1,data['sum']),col)
    result.sort()
    result.append(data['sum'])
    socketio.emit("sum_generated",result,to=f"{DEFAULT_ROOM_CODE}:host")


@socketio.on("take_question")
def take_question(data):
    if data["flips"]=="false":
        js = db.session.scalar(db.select(Questions_tpv).where(Questions_tpv.flip=="false", Questions_tpv.show=="false").order_by(func.random()).limit(1))
        if js == None:
            socketio.emit("question_selected","fail",to=f"{DEFAULT_ROOM_CODE}:host")
            return
        question = js.task
        answer = js.answer
        comment = js.comment
        author = js.author
        result = [question,answer,comment,author]
        #js.show = "true"
        #db.session.commit()
        socketio.emit("question_selected",result,to=f"{DEFAULT_ROOM_CODE}:host")
    if data["flips"]!="false":
        js = db.session.scalar(db.select(Questions_tpv).where(Questions_tpv.flip==data["flips"], Questions_tpv.show=="false").order_by(func.random()).limit(1))
        if js == None:
            socketio.emit("question_selected","fail",to=f"{DEFAULT_ROOM_CODE}:host")
            return
        question = js.task
        answer = js.answer
        comment = js.comment
        author = js.author
        result = [question,answer,comment,author]
        #js.show = "true"
        #db.session.commit()        
        socketio.emit("question_selected",result,to=f"{DEFAULT_ROOM_CODE}:host")

@socketio.on("add_result_author")
def add_result_author(data):
    js = db.session.scalar(db.select(UsersTpv).where(UsersTpv.username==data["name_author"]))
    if js == None:
        u = UsersTpv()
        u.username = data["name_author"]
        u.flip = "false"
        u.money = data["sum_author"]
        u.approve = "false"
        u.flip_col = 0
        db.session.add(u)
        db.session.flush()
        db.session.commit()
    else:
        js.money = js.money + data["sum_author"]
        db.session.commit()

@socketio.on("add_result_player")
def add_result_player(data):
    #js = db.session.scalar(db.select(UsersTpv).where(UsersTpv.username==data["name_player"]))
   # js.money = js.money + data["sum_player"]
    js1 = db.session.scalar(db.select(QueryTpv).where(QueryTpv.username==data["name_player"]))
    js1.money = js1.money + data["sum_player"]
    #js1.status = "ended"
    db.session.commit() 
    update_users_tpv()


if __name__ == "__main__":
    _users = [' ']
    
    socketio.run(app,debug=False, host='0.0.0.0')
    


