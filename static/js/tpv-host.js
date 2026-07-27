var audioCache = {};
var currentAudio = [];
var currentUrl = document.URL;
var ffffff = currentUrl.split('/tpv_host');//адресная строка пользователя без /host_slot http://ip:5000
var audioUrl = ffffff[0]+'/sounds/tpv/';
var stop_timer = false;
var safe_bong = null;
var select_bong_game = null;
var stop_bong_game_now = false;
var sum_results = 0;

function getCsrfToken() {
    return document
        .querySelector('meta[name="csrf-token"]')
        ?.content || "";
}

const socket = io();
function setSocketStatus(isOnline) {
  const box = document.getElementById("socket-status");
  const text = document.getElementById("socket-status-text");

  if (!box || !text) return;

  box.classList.toggle("socket-online", isOnline);
  box.classList.toggle("socket-offline", !isOnline);

  text.innerText = isOnline ? "Сервер подключён" : "Сервер отключён";
}
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  socket.emit("ping:test", {
    page: window.location.pathname
  });
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
  setSocketStatus(false);
});

socket.on("pong:test", (data) => {
  console.log("Ответ от сервера:", data);
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
setSocketStatus(true);
  socket.emit("room:join_tpv", {
    room: "99999999",
    role: "host",
    username: "admin"
  });
});

socket.on("room:joined", (data) => {
  console.log("Joined socket room:", data);
});

socket.on("connect_error", () => {
  setSocketStatus(false);
});

socket.on("reconnect_attempt", () => {
  setSocketStatus(false);
});

socket.on("reconnect", () => {
  setSocketStatus(true);
});



function getAudio(name) {
    if (!audioCache[name]) {
        var a = new Audio(audioUrl+ name);
        a.preload = "metadata"; // или "none"
        audioCache[name] = a;
    }
    return audioCache[name];
}
function playAudio(name, loop) {

    var a = getAudio(name);
    a.loop = loop;
    a.currentTime = 0;

    var p = a.play();
    if (p && typeof p.catch === 'function') {
        p.catch(err => console.log("audio play blocked:", err));
    }

    currentAudio.push(a);
}
function stop_current_sound() {
    if (currentAudio.length==0) return;
   for (var i =0; i<currentAudio.length; i++)
   {
    currentAudio[i].pause();
    currentAudio[i].currentTime = 0;
    currentAudio[i].loop = false;
   }
    currentAudio = [];
}

function init_game(){
    document.getElementById("control-timer-seconds").value=240;
    document.getElementById("control-circle").value=1;
    document.getElementById("control-round").value=1;
    document.getElementById("control-bank").value=0;
    document.getElementById("control-current-money").value=0;
    document.getElementById("control-question-number").value=1;
    document.getElementById("control-correct-count").value=0;
    document.getElementById("control-flips-count").value=3;
    document.getElementById("control-pass-count").value=0;
    document.getElementById("control-player-id").value = "";
    document.getElementById("display-current-player").textContent = "--";
    document.getElementById("display-current-flip").textContent = "--";
    document.getElementById("action-start-circle").disabled = true;
    document.getElementById("action-start-round").disabled = true;
    document.getElementById("action-answer-correct").disabled = true;
    document.getElementById("action-answer-wrong").disabled = true;
    document.getElementById("action-answer-pass").disabled = true;
    document.getElementById("action-question-flip").disabled = true;
    //document.getElementById("action-bong-start").disabled = true;
    document.getElementById("action-bong-option-1").disabled = true;
    document.getElementById("action-bong-option-2").disabled = true;
    document.getElementById("action-bong-option-3").disabled = true;
    document.getElementById("action-bong-stop").disabled = true;
    document.getElementById("action-bong-author-win").disabled = true;
    document.getElementById("action-bong-next-sum").disabled = true;
    document.getElementById("correct-indicator-1").classList.remove("status-orb-wrong-answer");
    document.getElementById("correct-indicator-2").classList.remove("status-orb-wrong-answer");
    document.getElementById("correct-indicator-3").classList.remove("status-orb-wrong-answer");
    document.getElementById("correct-indicator-4").classList.remove("status-orb-wrong-answer");
    document.getElementById("correct-indicator-5").classList.remove("status-orb-wrong-answer");
    document.getElementById("bong-variable-1").classList.remove("bong-option-select");
    document.getElementById("bong-variable-2").classList.remove("bong-option-select");
    document.getElementById("bong-variable-3").classList.remove("bong-option-select");
    document.getElementById("bong-current-sum").textContent = 0;
    document.getElementById("bong-current-sum").classList.remove("bong");
    document.getElementById("action-bong-author-win").disabled = true;
    document.getElementById("action-bong-next-sum").disabled = true;
    document.getElementById("bong-game-status").textContent = "";
    document.getElementById("bong-question-author").textContent = "— Автор вопроса —";
    document.getElementById("question-text").textContent = "";
    document.getElementById("question-answer").textContent = "";
    document.getElementById("question-author").textContent = "";
    document.getElementById("question-comment").textContent = "";
    stop_bong_game_now = false;
    sum_results = 0;
    

}

document.getElementById("control-timer-seconds").addEventListener('change', function(){

   calc_timer()

}
)

function calc_timer(){
     timer_min = parseInt(document.getElementById("control-timer-seconds").value / 60);
    timer_sec = document.getElementById("control-timer-seconds").value % 60;
    if (timer_sec>=10)
    {
   document.getElementById("display-time").value = timer_min.toString()+":"+timer_sec.toString();
    }
     if (timer_sec<10)
     {
        document.getElementById("display-time").value = timer_min.toString()+":"+"0"+timer_sec.toString();
     }
}

document.getElementById("control-circle").addEventListener('change', function(){
   calc_circle();
}
)


function calc_circle(){
     document.getElementById("display-circle").value = document.getElementById("control-circle").value;
    sum1 = 10000*document.getElementById("control-circle").value;
    sum2 = 25000*document.getElementById("control-circle").value;
    sum3 = 50000*document.getElementById("control-circle").value;
    sum4 = 150000*document.getElementById("control-circle").value;
    sum5 = 500000*document.getElementById("control-circle").value;
    document.getElementById("money-round-1").querySelector("strong").textContent = sum1.toLocaleString("ru-RU");
    document.getElementById("money-round-2").querySelector("strong").textContent = sum2.toLocaleString("ru-RU");
    document.getElementById("money-round-3").querySelector("strong").textContent = sum3.toLocaleString("ru-RU");
    document.getElementById("money-round-4").querySelector("strong").textContent = sum4.toLocaleString("ru-RU");
    document.getElementById("money-round-5").querySelector("strong").textContent = sum5.toLocaleString("ru-RU");
}

document.getElementById("control-round").addEventListener('change', function(){
    calc_round();
    
}
)

function calc_round(){
    if (document.getElementById("control-round").value > 5)
    {
        document.getElementById("control-round").value = 5;
    }
    if (document.getElementById("control-round").value < 1)
    {
        document.getElementById("control-round").value = 1;
    }
    document.getElementById("display-round").value = document.getElementById("control-round").value;

    if (document.getElementById("display-round").value == 1)
    {
        document.getElementById("correct-indicator-1").textContent = "В";
        document.getElementById("correct-indicator-2").textContent = "";
        document.getElementById("correct-indicator-3").textContent = "";
        document.getElementById("correct-indicator-4").textContent = "";
        document.getElementById("correct-indicator-5").textContent = "";
        document.getElementById("money-round-1").classList.remove("passed");
        document.getElementById("money-round-2").classList.remove("passed");
        document.getElementById("money-round-3").classList.remove("passed");
        document.getElementById("money-round-4").classList.remove("passed");
        document.getElementById("money-round-5").classList.remove("passed");

    }
    if (document.getElementById("display-round").value == 2)
    {
        document.getElementById("correct-indicator-1").textContent = "В";
        document.getElementById("correct-indicator-2").textContent = "В";
        document.getElementById("correct-indicator-3").textContent = "";
        document.getElementById("correct-indicator-4").textContent = "";
        document.getElementById("correct-indicator-5").textContent = "";
        document.getElementById("money-round-1").classList.add("passed");
        document.getElementById("money-round-2").classList.remove("passed");
        document.getElementById("money-round-3").classList.remove("passed");
        document.getElementById("money-round-4").classList.remove("passed");
        document.getElementById("money-round-5").classList.remove("passed");
    }
    if (document.getElementById("display-round").value == 3)
    {
        document.getElementById("correct-indicator-1").textContent = "В";
        document.getElementById("correct-indicator-2").textContent = "В";
        document.getElementById("correct-indicator-3").textContent = "В";
        document.getElementById("correct-indicator-4").textContent = "";
        document.getElementById("correct-indicator-5").textContent = "";
        document.getElementById("money-round-1").classList.add("passed");
        document.getElementById("money-round-2").classList.add("passed");
        document.getElementById("money-round-3").classList.remove("passed");
        document.getElementById("money-round-4").classList.remove("passed");
        document.getElementById("money-round-5").classList.remove("passed");
    }
    if (document.getElementById("display-round").value == 4)
    {
        document.getElementById("correct-indicator-1").textContent = "В";
        document.getElementById("correct-indicator-2").textContent = "В";
        document.getElementById("correct-indicator-3").textContent = "В";
        document.getElementById("correct-indicator-4").textContent = "В";
        document.getElementById("correct-indicator-5").textContent = "";
        document.getElementById("money-round-1").classList.add("passed");
        document.getElementById("money-round-2").classList.add("passed");
        document.getElementById("money-round-3").classList.add("passed");
        document.getElementById("money-round-4").classList.remove("passed");
        document.getElementById("money-round-5").classList.remove("passed");
    }
    if (document.getElementById("display-round").value == 5)
    {
        document.getElementById("correct-indicator-1").textContent = "В";
        document.getElementById("correct-indicator-2").textContent = "В";
        document.getElementById("correct-indicator-3").textContent = "В";
        document.getElementById("correct-indicator-4").textContent = "В";
        document.getElementById("correct-indicator-5").textContent = "В";
        document.getElementById("money-round-1").classList.add("passed");
        document.getElementById("money-round-2").classList.add("passed");
        document.getElementById("money-round-3").classList.add("passed");
        document.getElementById("money-round-4").classList.add("passed");
        document.getElementById("money-round-5").classList.remove("passed");
        document.getElementById("action-answer-pass").disabled = true;
    }


}

document.getElementById("control-bank").addEventListener('change', function(){
    calc_bank();
}
)

function calc_bank()
{
    bank = parseInt(document.getElementById("control-bank").value);
    document.getElementById("display-bank").value = bank.toLocaleString("ru-RU");
}

document.getElementById("control-current-money").addEventListener('change', function(){
    calc_current_money();
}
)

function calc_current_money(){
    bank = parseInt(document.getElementById("control-current-money").value);
    document.getElementById("display-current-money").value = bank.toLocaleString("ru-RU");
}


document.getElementById("control-flips-count").addEventListener('change', function(){
  calc_flip();
}
)

function calc_flip()
{
      if (document.getElementById("control-flips-count").value==3)
    {
        document.getElementById("flip-indicator-1").value = "→";
        document.getElementById("flip-indicator-2").value = "→";
        document.getElementById("flip-indicator-3").value = "→";
        document.getElementById("action-question-flip").disabled = false;
        return;
    }
    if (document.getElementById("control-flips-count").value==2)
    {
        document.getElementById("flip-indicator-1").value = "x";
        document.getElementById("flip-indicator-2").value = "→";
        document.getElementById("flip-indicator-3").value = "→";
        document.getElementById("action-question-flip").disabled = false;
        return;
    }
    if (document.getElementById("control-flips-count").value==1)
    {
        document.getElementById("flip-indicator-1").value = "x";
        document.getElementById("flip-indicator-2").value = "x";
        document.getElementById("flip-indicator-3").value = "→";
        document.getElementById("action-question-flip").disabled = false;
        return;
    }
    if (document.getElementById("control-flips-count").value==0)
    {
        document.getElementById("flip-indicator-1").value = "x";
        document.getElementById("flip-indicator-2").value = "x";
        document.getElementById("flip-indicator-3").value = "x";
        document.getElementById("action-question-flip").disabled = true;
        return;
    }
}

document.getElementById("control-pass-count").addEventListener('change', function(){
   calc_pass();
}
)

function calc_pass(){
    if (document.getElementById("control-round").value==5)
        document.getElementById("action-answer-pass").disabled = true;
     if (document.getElementById("control-pass-count").value==0)
    {
        document.getElementById("correct-indicator-2").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-3").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-4").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-5").classList.remove("status-orb-pass");
    }
    if (document.getElementById("control-pass-count").value==1)
    {
        document.getElementById("correct-indicator-2").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-3").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-4").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-5").classList.add("status-orb-pass");
    }
    if (document.getElementById("control-pass-count").value==2)
    {
        document.getElementById("correct-indicator-2").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-3").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-4").classList.add("status-orb-pass");
        document.getElementById("correct-indicator-5").classList.add("status-orb-pass");
    }
    if (document.getElementById("control-pass-count").value==3)
    {
        document.getElementById("correct-indicator-2").classList.remove("status-orb-pass");
        document.getElementById("correct-indicator-3").classList.add("status-orb-pass");
        document.getElementById("correct-indicator-4").classList.add("status-orb-pass");
        document.getElementById("correct-indicator-5").classList.add("status-orb-pass");
    }
    if (document.getElementById("control-pass-count").value==4)
    {
        document.getElementById("correct-indicator-2").classList.add("status-orb-pass");
        document.getElementById("correct-indicator-3").classList.add("status-orb-pass");
        document.getElementById("correct-indicator-4").classList.add("status-orb-pass");
        document.getElementById("correct-indicator-5").classList.add("status-orb-pass");
    }

}
document.getElementById("control-correct-count").addEventListener('change', function(){
    calc_correct();
}
)
function calc_correct(){
    if (document.getElementById("control-correct-count").value==0)
    {
        document.getElementById("correct-indicator-1").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-2").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-3").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-4").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-5").classList.remove("status-orb-correct-answer");
    }
    if (document.getElementById("control-correct-count").value==1)
    {
        document.getElementById("correct-indicator-1").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-2").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-3").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-4").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-5").classList.remove("status-orb-correct-answer");
    }
    if (document.getElementById("control-correct-count").value==2)
    {
        document.getElementById("correct-indicator-1").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-2").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-3").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-4").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-5").classList.remove("status-orb-correct-answer");
    }
    if (document.getElementById("control-correct-count").value==3)
    {
        document.getElementById("correct-indicator-1").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-2").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-3").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-4").classList.remove("status-orb-correct-answer");
        document.getElementById("correct-indicator-5").classList.remove("status-orb-correct-answer");
    }
    if (document.getElementById("control-correct-count").value==4)
    {
        document.getElementById("correct-indicator-1").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-2").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-3").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-4").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-5").classList.remove("status-orb-correct-answer");
    }
    if (document.getElementById("control-correct-count").value==5)
    {
        document.getElementById("correct-indicator-1").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-2").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-3").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-4").classList.add("status-orb-correct-answer");
        document.getElementById("correct-indicator-5").classList.add("status-orb-correct-answer");
    }
}


function cancel_all()
{
    init_game();
    stop_timer = true;
    socket.emit("reset_to_wait_tpv")
}


function intro(){
    stop_current_sound();
    playAudio("tpv-begin1.ogg",false);
}

function intro_host(){
    stop_current_sound();
    playAudio("tpv-begin2.ogg",false);
}

function bg(){
    stop_current_sound();
    playAudio("tpv-bg.ogg",true);
}

function final()
{
    stop_current_sound();
    playAudio("tpv-end.ogg",false);
    setTimeout(() => {playAudio("tpv-prefinal.ogg",true);}, 8000);
}

function credits()
{
    stop_current_sound();
    playAudio("tpv-final.ogg",false);
    
}


function stop_sounds(){
    stop_current_sound();
}


/** Открывает комнату для игроков. */
function open_room(){


     fetch('/open_room', {
        method: 'POST',
        body: JSON.stringify({ game_type:"tpv"}),
         headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest'
    },
    }
)
.then(response => response.json())

.then(data => {
   console.log(data);
    if (data == "fail")
    {
        return;
    }

        document.getElementById("room").value = data;
        document.getElementById("open_room").disabled = true;
        document.getElementById("close_room").disabled = false;
        document.getElementById("display-room-code").textContent = data
    
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}

/** Закрывает комнату. */
function close_room(){

       console.log(document.getElementById("room").value);

    

     fetch('/close_room', {
        method: 'POST',
        body: JSON.stringify({ room_id:document.getElementById("room").value}),
         headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest'
    },
    }
)
.then(response => response.json())

.then(data => {
   console.log(data);
   if (data=="fail")
   {
        return;
   }
    
        document.getElementById("open_room").disabled = false;
        document.getElementById("close_room").disabled = true;
        document.getElementById("room").disabled = false;
         document.getElementById("room").value = "";
         document.getElementById("display-room-code").textContent = "----";
    
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}


socket.on("updated_users_tpv", (data) => {
    console.log(data);
    update_list_user(data);
}

)


function update_list_user(data)
{
  

    console.log(data);

    var table = document.getElementById("players-table");
    if (table.rows.length!=1)
    {
   for (let i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i); // Помалу прощаемся со строками...
     }
   }

   if (data[5]=="true")
   {
    var tr = document.createElement("tr")
    var cell1 = document.createElement("td")
    cell1.innerHTML = data[0];
    var cell2 = document.createElement("td")
    cell2.innerHTML = data[1];
    var cell3 = document.createElement("td")
    cell3.innerHTML = data[2];
    var cell4 = document.createElement("td")
    cell4.innerHTML = data[3].toLocaleString("ru");
    var cell5 = document.createElement("td")
    cell5.innerHTML = data[4];
    tr.appendChild(cell1);
    tr.appendChild(cell2);
    tr.appendChild(cell3);
    tr.appendChild(cell4);
    tr.appendChild(cell5);
    table.appendChild(tr);
    return;
   }

    for (var i=0;i<data.length;i++)
    {
    var tr = document.createElement("tr")
    var cell1 = document.createElement("td")
    cell1.innerHTML = data[i][0];
    var cell2 = document.createElement("td")
    cell2.innerHTML = data[i][1];
    var cell3 = document.createElement("td")
    cell3.innerHTML = data[i][2];
    var cell4 = document.createElement("td")
    cell4.innerHTML = data[i][3].toLocaleString("ru");
    var cell5 = document.createElement("td")
    cell5.innerHTML = data[i][4];
    
    tr.appendChild(cell1);
    tr.appendChild(cell2);
    tr.appendChild(cell3);
    tr.appendChild(cell4);
    tr.appendChild(cell5);
    table.appendChild(tr);
    }
}  


function clear_db(){
    socket.emit("clean_db_tpv");
}

socket.on("DB_clean", (data) => {
    console.log(data);
}

)


function choose_player_random(){
    socket.emit("choose_player_random")

}
function choose_player_id(){
    id_player = document.getElementById("control-player-id").value
    console.log(id_player)
    socket.emit("choose_player_id",{id:id_player})

}

socket.on("player_selected", (data) => {
    document.getElementById("display-current-player").textContent = data[1]
    document.getElementById("display-current-flip").textContent = data[2]
    playAudio("tpv-select-player.ogg",false)   
}

)

function tpv(){
    stop_current_sound()
    playAudio("tpv-versus.ogg",false);
    document.getElementById("action-start-circle").disabled = false;
    
}

function start_circle(){
    stop_current_sound()
    playAudio("tpv-start-circle.ogg",false);
    document.getElementById("action-start-round").disabled = false;
    document.getElementById("action-answer-correct").disabled = true;
    document.getElementById("action-answer-wrong").disabled = true;
    document.getElementById("action-answer-pass").disabled = true;
    document.getElementById("action-question-flip").disabled = true;
    
}

function start_round(){
    document.getElementById("action-answer-correct").disabled = false;
    document.getElementById("action-answer-wrong").disabled = false;
    document.getElementById("action-answer-pass").disabled = false;
    if (document.getElementById("control-round").value==5)
        document.getElementById("action-answer-pass").disabled = true;
    stop_current_sound()
    playAudio("tpv-r"+document.getElementById("control-round").value.toString()+".ogg",false)
    stop_timer = false;
    socket.emit("take_question",{flips:"false"})
    timer_circle_start()
}

socket.on("question_selected", (data) => {
    console.log(data);
    if (data=="fail")
    {
        document.getElementById("question-text").textContent = "";
        document.getElementById("question-answer").textContent = "";
        document.getElementById("question-author").textContent = "";
        document.getElementById("question-comment").textContent = "";
        return;
    }
    
        document.getElementById("question-text").textContent = data[0];
        document.getElementById("question-answer").textContent = data[1];
        document.getElementById("question-author").textContent = data[3];
        document.getElementById("question-comment").textContent = data[2];

}
)

function timer_circle_start(){
   if (document.getElementById("control-timer-seconds").value == 0)
   {
        stop_current_sound();
        playAudio("tpv-timeout.ogg",false);
        return;
   }
   if (stop_timer)
    return;
   document.getElementById("control-timer-seconds").value = document.getElementById("control-timer-seconds").value-1 ;
   calc_timer();
   setTimeout(() => {timer_circle_start();}, 1000);
}

function update_data(){
    calc_timer();
    calc_bank();
    calc_circle();
    calc_correct();
    calc_current_money();
    calc_flip();
    calc_pass();
    calc_round();
}

function correct(){
    playAudio("tpv-correct.ogg",false);
    document.getElementById("control-correct-count").value = Number(document.getElementById("control-correct-count").value)+1;
    if (document.getElementById("control-question-number").value<5)
        document.getElementById("control-question-number").value = Number(document.getElementById("control-question-number").value)+1;
    calc_correct();
    if (document.getElementById("control-correct-count").value==document.getElementById("control-round").value){
        stop_timer = true;
        
        if (document.getElementById("control-round").value==1)
        {
            setTimeout(() => {stop_current_sound(); playAudio("tpv-e1.ogg",false);}, 3500);
            document.getElementById("control-current-money").value = 10000*Number(document.getElementById("control-circle").value);
            document.getElementById("control-correct-count").value = 0;
            document.getElementById("control-round").value = 2;
            document.getElementById("control-pass-count").value = 0;
            document.getElementById("control-question-number").value = 1;
            update_data();
            return;
        }
        if (document.getElementById("control-round").value==2)
        {
            setTimeout(() => {stop_current_sound();playAudio("tpv-e2.ogg",false);}, 3500);
            document.getElementById("control-current-money").value = 25000*Number(document.getElementById("control-circle").value);
            document.getElementById("control-correct-count").value = 0;
            document.getElementById("control-round").value = 3;
            document.getElementById("control-pass-count").value = 0;
            document.getElementById("control-question-number").value = 1;
            update_data();
            return;
        }
        if (document.getElementById("control-round").value==3)
        {
            setTimeout(() => {stop_current_sound();playAudio("tpv-e3.ogg",false);}, 3500);
            document.getElementById("control-current-money").value = 50000*Number(document.getElementById("control-circle").value);
            document.getElementById("control-correct-count").value = 0;
            document.getElementById("control-round").value = 4;
            document.getElementById("control-pass-count").value = 0;
            document.getElementById("control-question-number").value = 1;
            update_data();
            return;
        }
        if (document.getElementById("control-round").value==4)
        {
            setTimeout(() => {stop_current_sound();playAudio("tpv-e4.ogg",false);}, 3500);
            document.getElementById("control-current-money").value = 150000*Number(document.getElementById("control-circle").value);
            document.getElementById("control-correct-count").value = 0;
            document.getElementById("control-round").value = 5;
            document.getElementById("control-pass-count").value = 0;
            document.getElementById("control-question-number").value = 1;
            update_data();
            return;
        }

        if (document.getElementById("control-round").value==5)
        {
        setTimeout(() => {stop_current_sound();playAudio("tpv-e5.ogg",false);}, 3500);
        document.getElementById("control-bank").value = parseInt(document.getElementById("control-bank").value)+500000*Number(document.getElementById("control-circle").value);
        document.getElementById("control-current-money").value = 0;
        document.getElementById("control-timer-seconds").value = 240;
        document.getElementById("control-correct-count").value = 0;
        document.getElementById("control-flips-count").value = 3;
        document.getElementById("control-pass-count").value = 0;
        document.getElementById("control-circle").value = Number(document.getElementById("control-circle").value) + 1;
        document.getElementById("control-round").value = 1;
        document.getElementById("control-question-number").value = 1;
        update_data();
        return;
        }
        
    }
    setTimeout(() => {socket.emit("take_question",{flips:"false"});}, 2100);

}

function wrong(){
    if (parseInt(document.getElementById("control-current-money").value)!=0)
        document.getElementById("action-bong-start").disabled = false;
    stop_current_sound();
    stop_timer = true;
    playAudio("tpv-wrong.ogg",false);
    if (document.getElementById("control-correct-count").value == 0)
    {
       document.getElementById("correct-indicator-1").classList.add("status-orb-wrong-answer");
    }
    if (document.getElementById("control-correct-count").value == 1)
    {
       document.getElementById("correct-indicator-2").classList.add("status-orb-wrong-answer");
    }
    if (document.getElementById("control-correct-count").value == 2)
    {
       document.getElementById("correct-indicator-3").classList.add("status-orb-wrong-answer");
    }
    if (document.getElementById("control-correct-count").value == 3)
    {
       document.getElementById("correct-indicator-4").classList.add("status-orb-wrong-answer");
    }
    if (document.getElementById("control-correct-count").value == 4)
    {
       document.getElementById("correct-indicator-5").classList.add("status-orb-wrong-answer");
    }
    document.getElementById("bong-question-author").textContent = document.getElementById("question-author").textContent;
    if (parseInt(document.getElementById("control-current-money").value)==0)
        {
            sum_bong_game = 1000;
        document.getElementById("bong-game-status").textContent=sum_bong_game.toLocaleString("ru-RU");
        document.getElementById("control-current-money").value = 0;
        update_data();
        if (document.getElementById("bong-question-author").textContent!="— Автор вопроса —")
            socket.emit("add_result_author",{sum_author:sum_bong_game,name_author:document.getElementById("bong-question-author").textContent})

    }

}

function pass(){
    playAudio("tpv-pass.ogg",false);
    document.getElementById("control-pass-count").value = Number(document.getElementById("control-pass-count").value) + 1;
    console.log(document.getElementById("control-pass-count").value);
    document.getElementById("control-question-number").value = Number(document.getElementById("control-question-number").value)+1;
    pass_col = parseInt(document.getElementById("control-pass-count").value);
    round = parseInt(document.getElementById("control-round").value);
    summa = pass_col + round;
    console.log (summa)
    if (summa == 5)
    {
        document.getElementById("action-answer-pass").disabled = true;
    }
    update_data();
    setTimeout(() => {socket.emit("take_question",{flips:"false"});}, 2100);
}

function flip(){
    col = parseInt(document.getElementById("control-flips-count").value)
    if (col==0)
        return;
    setTimeout(() => {playAudio("tpv-flip.ogg",false);}, 3000);
    setTimeout(() => {socket.emit("take_question",{flips:document.getElementById("display-current-flip").textContent});}, 3000);
    
    document.getElementById("control-flips-count").value = Number(parseInt(document.getElementById("control-flips-count").value)) - 1;
    update_data();
    
    if (parseInt(document.getElementById("control-flips-count").value)==0)
        document.getElementById("action-question-flip").disabled = true;
    else
        document.getElementById("action-question-flip").disabled = false;
}


function start_bong_game(){
    if (parseInt(document.getElementById("control-current-money").value)==0)
        return;
    playAudio("tpv-bong-bg.ogg",true);
    document.getElementById("action-bong-option-1").disabled = false;
    document.getElementById("action-bong-option-2").disabled = false;
    document.getElementById("action-bong-option-3").disabled = false;
    socket.emit("generate_safe_bong_game")
    sum_bong_game = parseInt(document.getElementById("control-current-money").value);
    document.getElementById("bong-current-sum").textContent = Number(sum_bong_game).toLocaleString("ru-RU");
    
}


socket.on("bong_game_safe_var", (data) => {
    safe_bong = data;
    console.log("safe bong game: " + data);
}

)


function bong_game_start_var_1(){
    stop_current_sound();
    playAudio("tpv-bong-select.ogg",false);
    document.getElementById("bong-variable-1").classList.add("bong-option-select");
    document.getElementById("bong-current-sum").textContent = 0;
    document.getElementById("action-bong-stop").disabled = false;
    select_bong_game = 1;
    start_bong_game_selected();

}


function bong_game_start_var_2(){
    stop_current_sound();
    playAudio("tpv-bong-select.ogg",false);
    document.getElementById("bong-variable-2").classList.add("bong-option-select");
    document.getElementById("bong-current-sum").textContent = 0;
     document.getElementById("action-bong-stop").disabled = false;
    select_bong_game = 2;
    start_bong_game_selected();

}

function bong_game_start_var_3(){
    stop_current_sound();
    playAudio("tpv-bong-select.ogg",false);
    document.getElementById("bong-variable-3").classList.add("bong-option-select");
    document.getElementById("bong-current-sum").textContent = 0;
     document.getElementById("action-bong-stop").disabled = false;
    select_bong_game = 3;
    start_bong_game_selected();

}

function start_bong_game_selected(){
    socket.emit("generate_sum_for_bong_game",{sum:sum_bong_game});
}

sums = []
var stop_el = null;

socket.on("sum_generated", async(data) => {
    sums = data;
    if (select_bong_game!=safe_bong)
        sums[sums.length-1] = "BONG";
    console.log(sums);
    setTimeout(() => {playAudio("tpv-bong-start.ogg",false);}, 3000);
     await delay(9000);
    for (var i=0;i<sums.length;i++)
    {
        if (stop_bong_game_now)
        {
            sum_results = 0;
            stop_current_sound();
            //playAudio("tpv-bong-stop.ogg",false);
            sum_results = sums[i-1];
            stop_el = i-1;
            document.getElementById("action-bong-author-win").disabled = false;
             document.getElementById("action-bong-next-sum").disabled = false;
            document.getElementById("bong-current-sum").textContent = sum_results.toLocaleString("ru-RU");
            return;
        }
        if (sums[i]=="BONG")
        {
            document.getElementById("bong-current-sum").textContent = "ГОНГ";
            stop_current_sound();
            playAudio("tpv-bong-sound.ogg",false);
            document.getElementById("bong-current-sum").classList.add("bong");
            document.getElementById("action-bong-author-win").disabled = false;
            return;
        }
        document.getElementById("bong-current-sum").textContent = sums[i].toLocaleString("ru-RU");
        await NumberVoice.speak(sums[i],{includeCurrency: true});
         await delay(1400);
    }
    stop_current_sound();
    playAudio("tpv-bong-winner.ogg",false);
    sum_results = sums[sums.length-1];
    document.getElementById("action-bong-author-win").disabled = false;

}

)

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function stop_bong_game(){
    stop_current_sound();
    playAudio("tpv-bong-stop.ogg",false);
    stop_bong_game_now = true;
}

function sum_for_author(){
    if (document.getElementById("bong-current-sum").textContent == "ГОНГ")
    {
        sum_bong_game = parseInt(document.getElementById("control-current-money").value)+1000;
        document.getElementById("bong-game-status").textContent=sum_bong_game.toLocaleString("ru-RU");
        document.getElementById("control-current-money").value = 0;
        update_data();
        if (document.getElementById("bong-question-author").textContent!="— Автор вопроса —")
            socket.emit("add_result_author",{sum_author:sum_bong_game,name_author:document.getElementById("bong-question-author").textContent})
        return;
    }
    sum_bong_game = parseInt(document.getElementById("control-current-money").value) - sum_results +1000
    console.log(sum_bong_game)
    document.getElementById("bong-game-status").textContent=sum_bong_game.toLocaleString("ru-RU");
    document.getElementById("control-current-money").value = sum_results;
    if (document.getElementById("bong-question-author").textContent!="— Автор вопроса —")
        socket.emit("add_result_author",{sum_author:sum_bong_game,name_author:document.getElementById("bong-question-author").textContent})
    update_data();
}

function next_sum()
{
    if (stop_el==sums.length)
        return;
    stop_el=stop_el+1
    document.getElementById("bong-current-sum").textContent = sums[stop_el].toLocaleString("ru-RU");
    if (sums[stop_el]=="BONG")
        {
            document.getElementById("bong-current-sum").textContent = "ГОНГ";
            stop_current_sound();
            playAudio("tpv-bong-sound.ogg",false);
            document.getElementById("bong-current-sum").classList.add("bong");
            return;
        }
}
function result_sum_for_player()
{
    playAudio("tpv-result.ogg",false);
    socket.emit("add_result_player",{sum_player:parseInt(document.getElementById("control-current-money").value),name_player:document.getElementById("display-current-player").textContent})
}
