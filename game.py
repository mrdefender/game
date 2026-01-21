from datetime import datetime
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





app = Flask(__name__, template_folder="static/")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
app.config["SECRET_KEY"] = os.urandom(32).hex
app.secret_key = os.urandom(32).hex
socketio = SocketIO(app)
accepted_user = ""
db = SQLAlchemy(app)




class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True, unique=True)
    username = db.Column(db.String(10), unique=True, nullable=False)
    answer = db.Column(db.Text)
    money = db.Column(db.Integer)
    time = db.Column(db.Text)
    status = db.Column(db.Text)
    def __repr__(self):
        return '<Users %r>' %self.id


def init_game():
    if os.path.exists("answered.json"):
        os.remove("answered.json")
    if os.path.exists("task.json"):
        os.remove("task.json")
    if os.path.exists("room.json"):
        os.remove("room.json")


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
                    tmp.answer = u.answer
                    tmp.money = 0
                    tmp.time = u.time
                    tmp.status = u.status
                    db.session.commit()
                    print (url_for('join'))
                    return render_template("user_slot.html",value=u.username)                           
            db.session.add(u)
            db.session.flush()
            db.session.commit()
            print (url_for('join'))
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
        u = request.json["user_name"]
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
        pass
        
            
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
            return res
        if max_r == max_c:
            j = random(1,2)
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
        r = request.json["round"]
        if os.path.exists("answered.json"):
            with open('answered.json') as file:
                jsn = json.load(file)
            os.remove("answered.json")
            return jsn
         

    
 
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
            id = js.id
            username = js.username
            answer = js.answer
            money = js.money
            time = js.time
            jsn = [id,username,answer,money,time]
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
                tmp = [id,username,answer,money,time]
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
        



  

if __name__ == "__main__":
    _users = ['test']
    
    socketio.run(app,debug=True, host='0.0.0.0')
    
    ##app.run(debug=True)
    
    