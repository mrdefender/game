from flask import Flask, abort, logging, redirect, render_template, request, send_file, session, url_for, flash, redirect
import random
import hashlib
import os
from flask_socketio import SocketIO, emit



app = Flask(__name__, template_folder="static/")
app.config["SECRET_KEY"] = os.urandom(32).hex
app.secret_key = os.urandom(32).hex
socketio = SocketIO(app)


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
        return render_template("host_slot.html")
    print (url_for('host_slot'))
    return render_template("host_slot.html")

    
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
        result = [a,b,otbor_chislo,md5_hash]
        return result
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
        result = [fatal,md5_hash]
    else:
        fatal = random.sample([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], count_fatal)
        md5_hash = hashlib.md5(str(fatal).encode()).hexdigest()
        result = [fatal,md5_hash]
        return result
        pass
        
            
    
    

    
    

if __name__ == "__main__":
    users = ['test']
    socketio.run(app,debug=True)
    ##app.run(debug=True)
    
    