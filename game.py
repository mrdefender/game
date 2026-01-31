from datetime import datetime, time
from flask import Flask, Response, abort, jsonify, logging, redirect, render_template, request, send_file, send_from_directory, session, url_for, flash, redirect
import random
import hashlib
import os
import json
from werkzeug.utils import secure_filename  
import mimetypes  
import string
import flask, flask.views
import secrets
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, login_user, LoginManager, current_user, logout_user, login_required 





app = Flask(__name__, template_folder="static/")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
app.config["SECRET_KEY"] = "ce07970d34c80634ce4ab5ef66270f64" #"000001C9E687F6E0" #os.urandom(32).hex
app.secret_key = "ce07970d34c80634ce4ab5ef66270f64" #"000001C9E687F6E0" #os.urandom(32).hex
socketio = SocketIO(app)
accepted_user = ""
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.session_protection = "strong"
login_manager.login_view = "login"
login_manager.login_message_category = "info"


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(user_id)


class Users(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    username = db.Column(db.String(10), unique=True, nullable=False)
    answer = db.Column(db.Text)
    money = db.Column(db.Integer)
    time = db.Column(db.Text)
    status = db.Column(db.Text)
    def __repr__(self):
        return '<Users %r>' %self.id

class Facts(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    slot = db.Column(db.Text, nullable=False)
    des_fact = db.Column(db.Text)
    def __repr__(self):
        return '<Facts %r>' %self.id



def init_game():
    if os.path.exists("answered.json"):
        os.remove("answered.json")
    if os.path.exists("task.json"):
        os.remove("task.json")
    if os.path.exists("helps.json"):
        os.remove("helps.json")
    if os.path.exists("50_50.json"):
        os.remove("50_50.json")  
    if os.path.exists("alter.json"):
        os.remove("alter.json")
    if os.path.exists("navi.json"):
        os.remove("navi.json") 
    if os.path.exists("auden.json"):
        os.remove("auden.json") 
    if os.path.exists("fact.json"):
        os.remove("fact.json") 


@app.route('/')
def index(): 
    print (url_for('index'))
    return render_template("index.html")


def check_id_room(room_id):
    if not os.path.exists("room.json"):
        return False
    else:
        with open('room.json') as file:
           jsn = json.load(file)
        if jsn == room_id:
            True
        else:
            return False



@app.route('/join', methods=["POST", "GET"])
def join():
    if request.method == 'POST':
        if 'userLogged' in session:
            pass
        print(request.form)
        if (request.form['user_name']!="admin") & (request.form['room_id']=="99999999"):
           flash ('Неверный код комнаты')
           return render_template("login.html")
        if (request.form['user_name']=="admin") & (request.form['room_id']=="99999999"):
            _users[0] = request.form['user_name']
            init_game()
            return render_template("select.html")
        else:
            if check_id_room(request.form['room_id'])==False:
                flash ('Неверный код комнаты')
                return render_template("login.html")
            u = Users()
            u.username = request.form['user_name']
            u.answer = "0"
            u.money = 0
            u.time = datetime.now()
            u.status = status="wait"
            tmp = Users.query.filter(Users.username==u.username).first()
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
    return render_template("login.html")

@app.route('/select', methods=["POST", "GET"])
def select():
    if request.method == 'POST':
        if request.form.values == "Свободный слот":
         print (url_for('slot'))
         return render_template("slot.html")
    print (url_for('select'))
    return render_template("select.html")

@app.route('/slot', methods=["POST", "GET"])
def slot():
    if request.method == 'POST':
        print (url_for('slot'))
        return render_template("slot.html")
    print (url_for('slot'))
    return render_template("slot.html")

@app.route('/host_slot', methods=["POST", "GET"])
def host_slot():
    if request.method == 'POST':
        print (url_for('host_slot'))
        for i in _users:
            flash (i)
        return render_template("host_slot.html")
    print (url_for('host_slot'))
    return render_template("host_slot.html")

@app.route('/invite_user', methods=["POST", "GET"])
def invite_user():
    if request.method == 'POST':
        try:
            u = request.json['user_name']
            tmp = Users.query.filter(Users.id==int(u)).first()
            u = str(tmp.username)
        except:
            return json.dumps("fail")
        if tmp == None:
            return json.dumps("fail")
        tmp.status = 'main'
        db.session.commit()
        js = Users.query.all()
        if len(js)!=1:
            for i in range(len(js)):
                if js[i].status !="main":
                    js[i].status = 'interactive'
            db.session.commit()
        return json.dumps(u)
    print (url_for('host_slot'))
    return render_template("host_slot.html")




@app.route('/gen_task', methods=["POST", "GET"])
def gen_task():
    if request.method == 'POST':
        r = request.json["current_round"]
        jsn = generate_string(int(r),False)
        return jsn
  #  print (url_for('host_slot'))
  #  return render_template("host_slot.html")

def get_summs():
    f = open('txt/sum.txt','r')
    f_t = open('txt/text_sum.txt', 'r')
    f1 = f.readlines()
    f2 = f_t.readlines()
    print(f1[0])
    print(f2[0])
    f.close()
    f_t.close()

def get_md5_hash(stroka):
    characters = string.ascii_letters + string.punctuation
    random_string = str(stroka).join(secrets.choice(characters))
    return hashlib.md5(random_string.encode()).hexdigest()
    
    
def generate_string(round_id,is_bombed):
    random.seed(secrets.randbelow(99999))
    current_round = int(round_id); #получить номер раунда, 0 - отборочный тур
    count_fatal = 0
    otbor_chislo = 0
    bomb = is_bombed
    if current_round == 0:
        otbor_chislo = random.randint(10,999)
        
        a = random.randint(10,otbor_chislo)
        b = random.randint(otbor_chislo,999)
       # md5_hash = hashlib.md5(str(otbor_chislo).encode()).hexdigest()
        md5_hash = get_md5_hash(otbor_chislo)
        result = [current_round,a,b,otbor_chislo,md5_hash]
        js = json.dumps(result)
    
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
        fatal = random.randint(1,15)
        #md5_hash = hashlib.md5(str(fatal).encode()).hexdigest()
        md5_hash = get_md5_hash(fatal)
        result = [current_round,fatal,md5_hash, count_fatal]
        js = json.dumps(result)
        with open('task.json','w') as file:
            json.dump(result,file)
        return js
    else:
        fatal = random.sample([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], count_fatal)
        #md5_hash = hashlib.md5(str(fatal).encode()).hexdigest()
        md5_hash = get_md5_hash(fatal)
        result = [current_round,fatal,md5_hash,count_fatal]
        js = json.dumps(result)
        with open('task.json','w') as file:
            json.dump(result,file)
        return js


            
@app.route('/get_fatal_host', methods=["POST", "GET"])
def get_fatal_host():
    if request.method == 'POST':
        r = request.json["answer"]
        r1 = request.json["round"]
        res = [r, r1]
        with open('answered.json', 'w') as file:
            json.dump(res, file)
        jsn = 0
        with open('task.json') as file:
           jsn = json.load(file)
    return jsn

@app.route('/h50_50', methods=["POST", "GET"])
def h50_50():
    if request.method == 'POST':
        r = request.json["round"]
        jsn = 0
        with open('task.json') as file:
           jsn = json.load(file)
        f = jsn[1]
        cf = round(len(f)/2)
        res_f = []
        for i in range(cf):
            res_f.append(f[i])
        with open('50_50.json', 'w') as file:
            json.dump(res_f, file)
        return res_f

@app.route('/alter', methods=["POST", "GET"])
def alter():
    if request.method == 'POST':
        r = request.json["round"]
        jsn = 0
        with open('task.json') as file:
           jsn = json.load(file)
        f = jsn[1]
        cf = len(f)
        random.seed(secrets.randbelow(99999))
        rf = random.randint(1,cf-1)
        random.seed(secrets.randbelow(99999))
        j = 0
        checked = False
        while (checked==False):
            checked = True
            j = random.randint(1,15)
            for i in f:
                if i == j:
                    checked = False
                    break
        
        res = [f[rf],str(j)]
        with open('alter.json', 'w') as file:
            json.dump(res, file)
        return res
    
@app.route('/navi', methods=["POST", "GET"])
def navi():
    if request.method == 'POST':
        r = request.json["round"]
        jsn = 0
        with open('task.json') as file:
           jsn = json.load(file)
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
            with open('navi.json','w') as file:
                json.dump(res,file)
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
            with open('navi.json','w') as file:
                json.dump(res,file)
            return res
        if max_r == max_c:
            j = random.randint(1,2)
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
                with open('navi.json','w') as file:
                    json.dump(res,file)
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
                with open('navi.json','w') as file:
                    json.dump(res,file)
                return res


    
@app.route('/check_answered', methods=["POST", "GET"])
def check_answered():
    if request.method == 'POST':
        r = request.json["check"]
    if os.path.exists("answered.json"):
        return "true"
    else:
        return "false"   
    
@app.route('/show_rights', methods=["POST", "GET"])
def show_rights():
    if request.method == 'POST':
        js = Users.query.all()
        if len(js)==1:
            js.status = "check main"
        else:
            jjj = Users.query.all()
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
        r = request.json["round"]
        if os.path.exists("answered.json"):
            with open('answered.json') as file:
                jsn = json.load(file)
            os.remove("answered.json")
            
            return jsn
           ## answered interactive
            
            
                

    
 
@app.route('/sounds/<filename>')  
def serve_audio(filename):
    CUSTOM_AUDIO_DIR = "sounds/"
    if request.method == 'GET':
        sanitized_filename = secure_filename(filename)  

    # Check if the sanitized file exists in the custom directory  
        #if not os.path.isfile(sanitized_filename):  
        #    abort(404, description="File not found.")    
        mime_type, _ = mimetypes.guess_type(sanitized_filename) 
        if not mime_type or not mime_type.startswith('audio/'):  
         abort(400, description="Unsupported audio format.") 
        result = send_from_directory(CUSTOM_AUDIO_DIR, sanitized_filename,  mimetype=mime_type, as_attachment=False)
               
        return result
      ##  result = CUSTOM_AUDIO_DIR + filename;         
    ##return result;    
    
@app.route('/update_list_users', methods=["POST", "GET"])
def update_list_users():
    if request.method == 'POST':
        js = Users.query.all()
        if len(js)==1:
            id = js[0].id
            username = js[0].username
            answer = js[0].answer
            money = js[0].money
            time = js[0].time
            status = js[0].status
            jsn = [id,username,answer,money,time, status,"true"]
            result = json.dumps(jsn)
            return result
        else:
            jsn = []
            for i in range(0,len(js)):
                id = js[i].id
                username = js[i].username
                answer = js[i].answer
                money = js[i].money
                time = js[i].time
                status = js[i].status
                tmp = [id,username,answer,money,time, status,"false"]
                jsn.append(tmp)
            result = json.dumps(jsn)
            return result


@app.route('/open_room', methods=["POST", "GET"])
def open_room():
    if request.method == 'POST':
        id_room = request.json["room_id"]
        with open('room.json','w') as file:
            json.dump(id_room,file)
        return id_room
    else:
        return id_room
  
        
@app.route('/close_room', methods=["POST", "GET"])
def close_room():
    if request.method == 'POST':
        id_room = request.json["room_id"]
        if os.path.exists("room.json"):
            os.remove("room.json")
        return id_room
    else:
        return id_room
        

@app.route('/get_user_status', methods=["POST", "GET"])
def get_user_status():
    if request.method == 'POST':
        try:
         tmp = request.json['user']
         user = Users()
         user = Users.query.filter(Users.username==tmp).first()
         jsn = user.status
         return json.dumps(jsn)
        except:
            json.dumps("fail")
        
@app.route('/reset_user_to_wait', methods=["POST", "GET"])
def reset_user_to_wait():
    if request.method == 'POST':
         if os.path.exists('helps.json'):
            os.remove('helps.json')
         if os.path.exists('answered.json'):
            os.remove('answered.json')
         if os.path.exists("task.json"):
            os.remove("task.json")
         js = Users.query.all()
         for i in range(0,len(js)):
            js[i].status = "wait"
            js[i].answer = "0"
            db.session.commit()
         init_game()
         return json.dumps(" ")

@app.route('/get_helps', methods=["POST", "GET"])
def get_helps():
    if request.method == 'POST':
        tmp_u = request.json['user']
        try:
            if os.path.exists("helps.json"):
                user = Users()
                user = Users.query.filter(Users.username==tmp_u).first()
                if (user.status == "main") | (user.status == "wait task main") | (user.status == "given task main"):
                    db.session.commit()
                    with open('helps.json') as file:
                        jsn = json.load(file)
                    return jsn
                else:
                    return json.dumps("fail")
            else:
                 return json.dumps("fail")   
        except:
            return json.dumps("fail")

@app.route('/send_helps', methods=["POST", "GET"])
def send_helps():
    if request.method == 'POST':
        tmp = request.json['helps']
        with open('helps.json','w') as file:
            json.dump(tmp,file)
        return json.dumps("OK") 
    else:
        return json.dumps("fail")
  
@app.route('/start_game', methods=["POST", "GET"])
def start_game():
    if request.method == 'POST':
        try:
            js = Users.query.all()
            if len(js)!=1:
                for i in range(len(js)):
                    if js[i].status =="main":
                        js[i].status = "wait task main"
                    if js[i].status =="interactive":
                        js[i].status = "wait task interactive"
                db.session.commit()
            else: 
                return json.dumps("fail")
            return json.dumps("ok")
        except:
            return json.dumps("fail")
  
@app.route('/get_task_user', methods=["POST", "GET"])
def get_task_user():
    if request.method == 'POST':
        if not os.path.exists("task.json"):
            return json.dumps("fail")
        with open('task.json') as file:
            jsn = json.load(file)  
        try:
            js = Users.query.all()
            if len(js)!=1:
                for i in range(len(js)):
                    if js[i].status =="wait task main":
                        js[i].status = "given task main"
                        break
                    if js[i].status =="wait task interactive":
                        js[i].status = "given task interactive"
                db.session.commit()
              
            return json.dumps(jsn)
        except:
            return json.dumps("fail")
        

@app.route('/check_answered_main', methods=["POST", "GET"])
def check_answered_main():
    if request.method == 'POST':
        try:
            u_tmp = request.json['user']
            s_tmp = request.json['inter']
            if not s_tmp:
                return json.dumps("fail")
            user2 = Users.query.filter((Users.status == "answered main")|(Users.status == "answered main x2")).first_or_404()
            user = Users.query.filter(Users.username == u_tmp).first()
            user.status = "interactive no answer"
            db.session.commit()
            return json.dumps("ok")
            
        except:
            return json.dumps("fail")
    
@app.route('/send_answer', methods=["POST", "GET"])
def send_answer():
    if request.method == 'POST':
        try:
            u_tmp = request.json['user']
            a_tnp = request.json['answer_user']
            t_tmp = request.json['time_answer']
            user = Users.query.filter(Users.username == u_tmp).first()
            if (user.status == "given task main") | (user.status == "check main x2") :
                user.status = "answered main"
                user.answer = a_tnp
                user.time = t_tmp
                db.session.commit()
                return json.dumps("ok")
            if (user.status == "x2"):
                user.status = "answered main x2"
                user.answer = a_tnp
                user.time = t_tmp
                db.session.commit()
                return json.dumps("ok")
            if (user.status == "given task interactive"):
                user.status = "answered interactive"
                user.answer = a_tnp
                user.time = t_tmp
                with open('task.json') as file:
                    jsn = json.load(file)
                fatals = jsn[1]
                c_fatals = jsn[3]
                r = jsn[0]
                wrong = False
                if r==1:
                    if int(user.answer)==fatals:
                        user.money = user.money - 50
                        wrong = True
                if r>1:
                    for i in range(c_fatals):
                        if int(user.answer)==fatals[i]:
                            user.money = user.money - 50*c_fatals
                            wrong = True
                            break
                if not wrong:
                    user.money = user.money + 100*c_fatals
            db.session.commit()
            return json.dumps("ok")
        except:
            return json.dumps("fail")



@app.route('/wait_answer_for_host', methods=["POST", "GET"])
def wait_answer_for_host():
    if request.method == 'POST':
        try:
            user = Users.query.filter((Users.status == "answered main")|(Users.status == "answered main x2")).first()
            if user == None:
                return json.dumps("fail")
            res = user.answer
            if res == '0':
                return json.dumps("fail")
            return json.dumps(res)
        except:
            return json.dumps("fail")

@app.route('/check_answer', methods=["POST", "GET"])
def check_answer():
    if request.method == 'POST':
        try:
            tmp_u = request.json['user']
            user = Users.query.filter(Users.username == tmp_u).first()
            if user.status == "check main":
                user.status = "wait next round main"
            if user.status == "check interactive":
                user.status = "wait next round interactive"
            with open('task.json') as file:
                    jsn = json.load(file)
            db.session.commit()
            return json.dumps(jsn)
        except:
            return json.dumps("fail")


@app.route('/next_round', methods=["POST", "GET"])
def next_round():
    if request.method == 'POST':
        try:
            user = Users.query.all()
            if len(user)==1:
                user.status = "wait task main"
            else:
                for i in range(len(user)):
                    if (user[i].status == "wait next round main") | (user[i].status == "check main x2"):
                        user[i].status = "wait task main"
                        user[i].answer = "0"
                    if (user[i].status == "wait next round interactive") | (user[i].status == "interactive no answer"):
                        user[i].status = "wait task interactive"
                        user[i].answer = "0"
            if os.path.exists('task.json'):
                os.remove('task.json')
            db.session.commit()
            return json.dumps("ok")
        except:
            return json.dumps("fail")


@app.route('/get_50_50', methods=["POST", "GET"])
def get_50_50():
    if request.method == 'POST':
        try:
            tmp_u = request.json['user']
            user = Users.query.filter(Users.username==tmp_u).first()
            find = False
            user.status = "50:50"
            db.session.commit()
            while not find:
                if os.path.exists("50_50.json"):
                    with open('50_50.json') as file:
                        p = json.load(file)
                        find = True
                        user.status = "given task main"
            db.session.commit()
            os.remove("50_50.json")
            return json.dumps(p)
        except:
            return json.dumps("fail")

@app.route('/get_alter', methods=["POST", "GET"])
def get_alter():
    if request.method == 'POST':
        try:
            tmp_u = request.json['user']
            user = Users.query.filter(Users.username==tmp_u).first()
            find = False
            user.status = "alter"
            db.session.commit()
            while not find:
                if os.path.exists("alter.json"):
                    with open('alter.json') as file:
                        p = json.load(file)
                        find = True
                        user.status = "given task main"
            db.session.commit()
            os.remove("alter.json")
            return json.dumps(p)
        except:
            return json.dumps("fail")



@app.route('/get_navi', methods=["POST", "GET"])
def get_navi():
    if request.method == 'POST':
        try:
            tmp_u = request.json['user']
            user = Users.query.filter(Users.username==tmp_u).first()
            find = False
            user.status = "navi"
            db.session.commit()
            while not find:
                if os.path.exists("navi.json"):
                    with open('navi.json') as file:
                        p = json.load(file)
                        find = True
                        user.status = "given task main"
            db.session.commit()
            os.remove("navi.json")
            return json.dumps(p)
        except:
            return json.dumps("fail")


@app.route('/get_x2', methods=["POST", "GET"])
def get_x2():
    if request.method == 'POST':
        try:
            tmp_u = request.json['user']
            user = Users.query.filter(Users.username==tmp_u).first()
            user.status = "x2"
            db.session.commit()
            return json.dumps("ok")
        except:
            return json.dumps("fail")


@app.route('/help_auden', methods=["POST", "GET"])
def help_auden():
    if request.method == 'POST':
        try:
            tmp_u = Users.query.all()
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
            col_ans = Users.query.filter(Users.status == "answered interactive").count()
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
            with open('task.json') as file:
                jsn = json.load(file)
            fatals = jsn[1]
            fatals.sort()
            for i in range(jsn[3]):
                for j in range(len(result)):
                    if ((j+1)==fatals[i]) & (result[j]>0):
                        col_find_fatal+=1
                        break
            
            result.append(round(col_find_fatal/col_ans*100))
            result.append(100-round(col_find_fatal/col_ans*100))   
            with open('auden.json','w') as file:
                json.dump(result,file)
           # time.sleep(10)
            if os.path.exists("auden.json"):
                os.remove("auden.json")        
            return json.dumps(result)
        except:
            return json.dumps("fail")

@app.route('/get_auden', methods=["POST", "GET"])
def get_auden():
    if request.method == 'POST':
        try:
            uu = request.json['user']
            user = Users.query.filter(Users.username==uu).first()
            user.status = "auden"
            db.session.commit()
            while (True):
                if os.path.exists("auden.json"):
                    break
            user.status = "given task main"
            db.session.commit()
            return json.dumps("ok")
        except:
            return json.dumps("fail")

@app.route('/fact', methods=["POST", "GET"])
def fact():
    if request.method == 'POST':
        try:
            random.seed(secrets.randbelow(99999))
            slot = random.randint(1,15)
            with open('task.json') as file:
                    jsn = json.load(file)
            fat = jsn[1]
            find = False
            
            while not find:
                find = True
                for i in range(jsn[3]):
                    if fat[i]==slot:
                        random.seed(secrets.randbelow(99999))
                        slot = random.randint(1,15)
                        find = False
                        break
            facts = Facts.query.filter(Facts.slot==str(slot)).first()
            result = []
            result.append(facts.slot)
            result.append(facts.des_fact)
            with open('fact.json','w') as file:
                json.dump(result,file)
           # time.sleep(10)
            if os.path.exists("fact.json"):
                os.remove("fact.json")   
            return json.dumps(result)
        except:
            return json.dumps("fail")


@app.route('/get_fact', methods=["POST", "GET"])
def get_fact():
    if request.method == 'POST':
        try:
            uu = request.json['user']
            user = Users.query.filter(Users.username==uu).first()
            user.status = "fact"
            db.session.commit()
            while (True):
                if os.path.exists("fact.json"):
                    break
            user.status = "given task main"
            db.session.commit()
            return json.dumps("ok")
        except:
            return json.dumps("fail")


if __name__ == "__main__":
    _users = ['test']
    
    socketio.run(app,debug=True, host='0.0.0.0')
    
    ##app.run(debug=True)
    

