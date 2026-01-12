from flask import Flask, abort, jsonify, logging, redirect, render_template, request, send_file, session, url_for, flash, redirect
import random
import hashlib
import os
import json
from flask_socketio import SocketIO, emit



app = Flask(__name__, template_folder="static/")
app.config["SECRET_KEY"] = os.urandom(32).hex
app.secret_key = os.urandom(32).hex
socketio = SocketIO(app)
accepted_user = ""

@app.route('/')
def index(): 
    print (url_for('index'))
    return render_template("index.html")

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
            users[0] = request.form['user_name']
            return render_template("select.html")
        else:
            users.append = request.form['user_name']
            flash ('Неверный код комнаты')
            print("lol")
    print (url_for('join'))
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
        for i in users:
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


    
def generate_string(round_id,is_bombed):
    random.seed()
    current_round = int(round_id); #получить номер раунда, 0 - отборочный тур
    count_fatal = 0
    otbor_chislo = 0
    bomb = is_bombed
    if current_round == 0:
        otbor_chislo = random.randint(10,999)
        a = random.randint(10,otbor_chislo)
        b = random.randint(otbor_chislo,999)
        md5_hash = hashlib.md5(str(otbor_chislo).encode()).hexdigest()
        result = [current_round,a,b,otbor_chislo,md5_hash]
        js = json.dumps(result)
    
        return js
    else:
        match current_round:
            case 1: count_fatal=1
            case 2: count_fatal=2
            case 3: count_fatal=3
            case 4: count_fatal=5
            case 5: count_fatal=8
            case 6: count_fatal=10
            case 7: count_fatal=12
            case 8: count_fatal=13
            case 9: count_fatal=14
    
    if count_fatal == 1:
        fatal = random.randint(1,15)
        md5_hash = hashlib.md5(str(fatal).encode()).hexdigest()
        result = [current_round,fatal,md5_hash]
        js = json.dumps(result)
        with open('task.json','w') as file:
            json.dump(result,file)
        return js
    else:
        fatal = random.sample([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], count_fatal)
        md5_hash = hashlib.md5(str(fatal).encode()).hexdigest()
        result = [current_round,fatal,md5_hash]
        js = json.dumps(result)
        with open('task.json','w') as file:
            json.dump(result,file)
        return js
        pass
        
            
@app.route('/get_fatal_host', methods=["POST", "GET"])
def get_fatal_host():
    if request.method == 'POST':
        r = request.json["answer"]
    with open('answered.json', 'w') as file:
        answered = true
        json.dump(answered,r)
    jsn = 0
    with open('task.json') as file:
           jsn = json.load(file)
    return jsn
    
@app.route('/check_answered', methods=["POST", "GET"])
def check_answered():
    if request.method == 'POST':
        r = request.json["check"]
    if os.path.exists("answered.json"):
        return True
    else:
        return False    
    
    
    

if __name__ == "__main__":
    users = ['test']
    socketio.run(app,debug=True, host='0.0.0.0')
    ##app.run(debug=True)
    
    