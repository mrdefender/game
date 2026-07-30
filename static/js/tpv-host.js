var audioCache = {};
var currentAudio = [];
var currentUrl = document.URL;
var ffffff = currentUrl.split('/tpv_host');//адресная строка пользователя без /host_slot http://ip:5000
var audioUrl = ffffff[0]+'/sounds/tpv/';
var stop_timer = true;
var roundTimerId = null;
var roundTimerStartId = null;
var safe_bong = null;
var select_bong_game = null;
var stop_bong_game_now = false;
var sum_results = 0;
var bongPlayerName = "";
var bongLastPresentedValue = 0;
var bongRunFinished = false;

const tpvGame = window.TPVGame || null;

function readGameStateFromControls(extra = {}) {
    return {
        timer: Number(document.getElementById("control-timer-seconds").value) || 0,
        circle: Number(document.getElementById("control-circle").value) || 1,
        round: Number(document.getElementById("control-round").value) || 1,
        bank: Number(document.getElementById("control-bank").value) || 0,
        currentMoney: Number(document.getElementById("control-current-money").value) || 0,
        question: Number(document.getElementById("control-question-number").value) || 1,
        correct: Number(document.getElementById("control-correct-count").value) || 0,
        flips: Number(document.getElementById("control-flips-count").value) || 0,
        pass: Number(document.getElementById("control-pass-count").value) || 0,
        ...extra
    };
}

function syncEngineFromControls(extra = {}) {
    const state = readGameStateFromControls(extra);
    if (tpvGame) tpvGame.setState(state, false);
    return state;
}

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
function playAudio(name, loop = false) {
    const audio = getAudio(name);

    audio.loop = Boolean(loop);

    /*
     * При повторном запуске одного файла сначала останавливаем
     * его текущее воспроизведение.
     */
    audio.pause();
    audio.currentTime = 0;

    /*
     * Не добавляем один объект Audio в массив несколько раз.
     */
    if (!currentAudio.includes(audio)) {
        currentAudio.push(audio);
    }

    const playPromise = audio.play();

    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(error => {
            console.log(`Не удалось запустить ${name}:`, error);
        });
    }
}
function stop_current_sound() {
    for (const audio of currentAudio) {
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.loop = false;
        } catch (error) {
            console.warn("Не удалось остановить звук:", error);
        }
    }

    currentAudio.length = 0;
}
function init_game(){
    stopRoundTimer();
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
    update_data();

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
        document.getElementById("money-round-1").classList.add("is-active");
        document.getElementById("money-round-2").classList.remove("is-active");
        document.getElementById("money-round-3").classList.remove("is-active");
        document.getElementById("money-round-4").classList.remove("is-active");
        document.getElementById("money-round-5").classList.remove("is-active");

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
        document.getElementById("money-round-1").classList.remove("is-active");
        document.getElementById("money-round-2").classList.add("is-active");
        document.getElementById("money-round-3").classList.remove("is-active");
        document.getElementById("money-round-4").classList.remove("is-active");
        document.getElementById("money-round-5").classList.remove("is-active");
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
        document.getElementById("money-round-1").classList.remove("is-active");
        document.getElementById("money-round-2").classList.remove("is-active");
        document.getElementById("money-round-3").classList.add("is-active");
        document.getElementById("money-round-4").classList.remove("is-active");
        document.getElementById("money-round-5").classList.remove("is-active");
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
        document.getElementById("money-round-1").classList.remove("is-active");
        document.getElementById("money-round-2").classList.remove("is-active");
        document.getElementById("money-round-3").classList.remove("is-active");
        document.getElementById("money-round-4").classList.add("is-active");
        document.getElementById("money-round-5").classList.remove("is-active");
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
        document.getElementById("money-round-1").classList.remove("is-active");
        document.getElementById("money-round-2").classList.remove("is-active");
        document.getElementById("money-round-3").classList.remove("is-active");
        document.getElementById("money-round-4").classList.remove("is-active");
        document.getElementById("money-round-5").classList.add("is-active");
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
    stopRoundTimer();
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
        document.getElementById("display-room-code").textContent = data;
        playAudio("tpv-show-code.ogg",false);
    
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

    if (Number(document.getElementById("control-round").value) === 5) {
        document.getElementById("action-answer-pass").disabled = true;
    }

    stop_current_sound();
    playAudio(
        "tpv-r" + document.getElementById("control-round").value + ".ogg",
        false
    );

    name_player = document.getElementById("display-current-player").textContent;
    socket.emit("take_question", {flips: "false", player: name_player});
    startRoundTimer(1500);
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

function stopRoundTimer(){
    stop_timer = true;

    if (roundTimerStartId !== null) {
        clearTimeout(roundTimerStartId);
        roundTimerStartId = null;
    }

    if (roundTimerId !== null) {
        clearTimeout(roundTimerId);
        roundTimerId = null;
    }
}

function startRoundTimer(delayMs = 0){
    stopRoundTimer();
    stop_timer = false;

    roundTimerStartId = setTimeout(() => {
        roundTimerStartId = null;
        timer_circle_start();
    }, delayMs);
}

function timer_circle_start(){
    if (stop_timer) return;

    const timerControl = document.getElementById("control-timer-seconds");
    const seconds = Math.max(0, Number(timerControl.value) || 0);

    if (seconds <= 0) {
        stopRoundTimer();
        stop_current_sound();
        playAudio("tpv-timeout.ogg", false);
        update_data();
        return;
    }

    timerControl.value = seconds - 1;
    calc_timer();

    // Периодически отправляем игроку авторитетное значение таймера.
    update_data();

    roundTimerId = setTimeout(timer_circle_start, 1000);
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

    const state = syncEngineFromControls();
    socket.emit("tpv_update_data_user_spec", {state: state});
}

function correct() {
    const namePlayer =
        document.getElementById("display-current-player").textContent;

    const answer =
        document.getElementById("question-answer").textContent;

    const answeredQuestion =
        Number(document.getElementById("control-question-number").value) || 1;

    const currentRound =
        Number(document.getElementById("control-round").value) || 1;

    playAudio("tpv-correct.ogg", false);

    const correctControl =
        document.getElementById("control-correct-count");

    correctControl.value =
        (Number(correctControl.value) || 0) + 1;

    const correctCount = Number(correctControl.value);
    const roundFinished = correctCount >= currentRound;

    if (!roundFinished && answeredQuestion < 5) {
        document.getElementById(
            "control-question-number"
        ).value = answeredQuestion + 1;
    }

    // Отправляем состояние текущего ответа.
    update_data();

    socket.emit("tpv_correct", {
        answer: answer,
        player: namePlayer,
        questionNumber: answeredQuestion,
        correctCount: correctCount,
        round: currentRound,
        roundFinished: roundFinished,
        phase: "answer"
    });

    if (roundFinished) {
        stopRoundTimer();
        

        setTimeout(() => {
            advanceRoundAfterSuccess(currentRound);
        }, 3500);

        return;
    }

    setTimeout(() => {
        socket.emit("take_question", {
            flips: "false",
            player: namePlayer
        });
    }, 2100);
}

function advanceRoundAfterSuccess(completedRound) {
    stopRoundTimer();

    const currentRound = Math.max(
        1,
        Math.min(5, Number(completedRound) || 1)
    );

    const circleControl =
        document.getElementById("control-circle");

    const bankControl =
        document.getElementById("control-bank");

    const currentMoneyControl =
        document.getElementById("control-current-money");

    const roundControl =
        document.getElementById("control-round");

    const questionControl =
        document.getElementById("control-question-number");

    const correctControl =
        document.getElementById("control-correct-count");

    const passControl =
        document.getElementById("control-pass-count");

    const circle = Math.max(
        1,
        Number(circleControl.value) || 1
    );

    const roundMoney = {
        1: 10000,
        2: 25000,
        3: 50000,
        4: 150000,
        5: 500000
    };

    const completedRoundMoney =
        (roundMoney[currentRound] || 0) * circle;

    /*
     * Сумма за завершённый раунд.
     */
    currentMoneyControl.value = completedRoundMoney;

    /*
     * Музыка завершения раунда.
     */
    stop_current_sound();
    playAudio(`tpv-e${currentRound}.ogg`, false);

    /*
     * Завершён пятый раунд — завершаем круг.
     */
    if (currentRound === 5) {
        const currentBank =
            Number(bankControl.value) || 0;

        /*
         * Переносим текущую сумму в банк.
         */
        const moneyToBank =
    Number(currentMoneyControl.value) || completedRoundMoney;

        bankControl.value = currentBank + moneyToBank;

        /*
         * Текущая сумма после переноса обнуляется.
         */
        currentMoneyControl.value = 0;

        /*
         * Начинается новый круг.
         */
        circleControl.value = circle + 1;

        /*
         * Новый круг начинается с первого раунда.
         */
        roundControl.value = 1;
        questionControl.value = 1;
        correctControl.value = 0;
        passControl.value = 0;

        /*
         * Перерисовываем все изменённые значения.
         */
        calc_bank();
        calc_current_money();
        calc_circle();
        calc_correct();
        calc_pass();
        calc_round();

        /*
         * Отправляем игроку и зрителю полностью обновлённое
         * состояние нового круга.
         */
        update_data();
        return;
    }

    /*
     * Обычный переход между раундами внутри текущего круга.
     */
    roundControl.value = currentRound + 1;
    questionControl.value = 1;
    correctControl.value = 0;
    passControl.value = 0;

    calc_current_money();
    calc_correct();
    calc_pass();
    calc_round();

    update_data();
}


function wrong(){
    name_player = document.getElementById("display-current-player").textContent;
    if (parseInt(document.getElementById("control-current-money").value)!=0)
        document.getElementById("action-bong-start").disabled = false;
    const wrongQuestionNumber = Number(document.getElementById("control-question-number").value) || 1;
    const wrongIndex = (Number(document.getElementById("control-correct-count").value) || 0) + 1;
    const state = syncEngineFromControls({phase: "wrong", wrong: true, replacement: false});
    socket.emit("tpv_wrong", {
        answer: document.getElementById("question-answer").textContent,
        player: name_player,
        questionNumber: wrongQuestionNumber,
        wrongIndex: wrongIndex,
        state: state
    });
    stop_current_sound();
    stopRoundTimer();
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
    name_player = document.getElementById("display-current-player").textContent;
    playAudio("tpv-pass.ogg",false);
    socket.emit("tpv_pass",{answer:document.getElementById("question-answer").textContent,player:name_player});
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
    
    setTimeout(() => {socket.emit("take_question",{flips:"false",player:name_player});}, 2100);
}

function flip(){
    const flipsControl = document.getElementById("control-flips-count");
    const flipsLeft = Number(flipsControl.value) || 0;
    if (flipsLeft <= 0) return;

    const namePlayer = document.getElementById("display-current-player").textContent;
    const questionNumber = Number(document.getElementById("control-question-number").value) || 1;

    flipsControl.value = flipsLeft - 1;
    const state = syncEngineFromControls({phase: "replacement", replacement: true});

    socket.emit("tpv_flip", {
        answer: document.getElementById("question-answer").textContent,
        player: namePlayer,
        questionNumber: questionNumber,
        state: state
    });

    setTimeout(() => { playAudio("tpv-flip.ogg", false); }, 3000);
    setTimeout(() => {
        socket.emit("take_question", {
            flips: document.getElementById("display-current-flip").textContent,
            player: namePlayer,
            replacement: true,
            questionNumber: questionNumber
        });
    }, 3000);

    update_data();
    document.getElementById("action-question-flip").disabled = Number(flipsControl.value) <= 0;
}


function getCurrentBongPlayer() {
    return document.getElementById("display-current-player").textContent.trim();
}

function emitBongToPlayer(eventName, payload = {}) {
    const player = bongPlayerName || getCurrentBongPlayer();
    if (!player || player === "--") return;

    socket.emit(eventName, {
        player: player,
        ...payload
    });
}

function resetBongSelection() {
    for (let option = 1; option <= 3; option += 1) {
        document
            .getElementById(`bong-variable-${option}`)
            ?.classList.remove("bong-option-select");
    }
}

function start_bong_game() {
    const currentMoney = Number(
        document.getElementById("control-current-money").value
    ) || 0;

    bongPlayerName = getCurrentBongPlayer();

    if (currentMoney <= 0 || !bongPlayerName || bongPlayerName === "--") {
        return;
    }

    stop_current_sound();
    playAudio("tpv-bong-bg.ogg", true);

    stop_bong_game_now = false;
    bongRunFinished = false;
    bongLastPresentedValue = 0;
    sum_results = 0;
    stop_el = null;
    sums = [];

    resetBongSelection();
    document.getElementById("bong-current-sum").textContent =
        currentMoney.toLocaleString("ru-RU");
    document.getElementById("bong-current-sum").classList.remove("bong");

    document.getElementById("action-bong-option-1").disabled = false;
    document.getElementById("action-bong-option-2").disabled = false;
    document.getElementById("action-bong-option-3").disabled = false;
    document.getElementById("action-bong-stop").disabled = true;

    sum_bong_game = currentMoney;

    const bongAuthor = document.getElementById("bong-question-author")?.textContent
        || document.getElementById("question-author")?.textContent
        || "— Автор вопроса —";

    emitBongToPlayer("tpv_bong_prepare", {
        currentMoney: currentMoney,
        author: bongAuthor
    });

    socket.emit("generate_safe_bong_game");
}

socket.on("bong_game_safe_var", (data) => {
    safe_bong = Number(data);
    console.log("safe bong game:", safe_bong);
});

function selectBongVariant(option) {
    if (bongRunFinished) return;

    select_bong_game = Number(option);
    stop_bong_game_now = false;
    bongLastPresentedValue = 0;

    stop_current_sound();
    playAudio("tpv-bong-select.ogg", false);

    resetBongSelection();
    document
        .getElementById(`bong-variable-${select_bong_game}`)
        ?.classList.add("bong-option-select");

    document.getElementById("bong-current-sum").textContent = "0";
    document.getElementById("action-bong-option-1").disabled = true;
    document.getElementById("action-bong-option-2").disabled = true;
    document.getElementById("action-bong-option-3").disabled = true;
    document.getElementById("action-bong-stop").disabled = false;

    emitBongToPlayer("tpv_bong_selected", {
        option: select_bong_game,
        author: document.getElementById("bong-question-author")?.textContent
            || document.getElementById("question-author")?.textContent
            || "— Автор вопроса —"
    });

    socket.emit("generate_sum_for_bong_game", {
        sum: sum_bong_game
    });
}

function bong_game_start_var_1() {
    selectBongVariant(1);
}

function bong_game_start_var_2() {
    selectBongVariant(2);
}

function bong_game_start_var_3() {
    selectBongVariant(3);
}

let sums = [];
var stop_el = null;

function finishBongRun(result) {
    if (bongRunFinished) return;
    bongRunFinished = true;

    document.getElementById("action-bong-stop").disabled = true;
    document.getElementById("action-bong-author-win").disabled = false;

    if (result.status === "stopped") {
        document.getElementById("action-bong-next-sum").disabled = false;
    }

    emitBongToPlayer("tpv_bong_result", result);
}

socket.on("sum_generated", async (data) => {
    sums = Array.isArray(data) ? [...data] : [];

    if (select_bong_game !== safe_bong && sums.length > 0) {
        sums[sums.length - 1] = "BONG";
    }

    console.log("bong sums:", sums);

    setTimeout(() => {
        if (!bongRunFinished) {
            playAudio("tpv-bong-start.ogg", false);
        }
    }, 3000);

    await delay(9000);

    for (let index = 0; index < sums.length; index += 1) {
        if (stop_bong_game_now) {
            stop_current_sound();

            sum_results = Number(bongLastPresentedValue) || 0;
            stop_el = Math.max(0, index - 1);

            document.getElementById("bong-current-sum").textContent =
                sum_results.toLocaleString("ru-RU");

            finishBongRun({
                status: "stopped",
                value: sum_results,
                option: select_bong_game
            });
            return;
        }

        const value = sums[index];

        if (value === "BONG") {
            document.getElementById("bong-current-sum").textContent = "ГОНГ";
            document.getElementById("bong-current-sum").classList.add("bong");

            stop_current_sound();
            playAudio("tpv-bong-sound.ogg", false);

            emitBongToPlayer("tpv_bong_value", {
                value: "BONG"
            });

            finishBongRun({
                status: "bong",
                value: "BONG",
                option: select_bong_game
            });
            return;
        }

        bongLastPresentedValue = Number(value) || 0;
        document.getElementById("bong-current-sum").textContent =
            bongLastPresentedValue.toLocaleString("ru-RU");

        emitBongToPlayer("tpv_bong_value", {
            value: bongLastPresentedValue
        });

        await NumberVoice.speak(bongLastPresentedValue, {
            includeCurrency: true
        });
        await delay(1400);
    }

    stop_current_sound();
    playAudio("tpv-bong-winner.ogg", false);

    sum_results = Number(bongLastPresentedValue) || 0;

    finishBongRun({
        status: "winner",
        value: sum_results,
        option: select_bong_game
    });
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function requestBongStop(source = "host") {
    if (bongRunFinished || stop_bong_game_now) return;

    stop_bong_game_now = true;
    document.getElementById("action-bong-stop").disabled = true;

    stop_current_sound();
    playAudio("tpv-bong-stop.ogg", false);

    emitBongToPlayer("tpv_bong_stop_ack", {
        source: source
    });
}

function stop_bong_game() {
    requestBongStop("host");
}

socket.on("tpv_bong_stop_requested", (data) => {
    const requestedPlayer = String(data?.player || "").trim();
    const activePlayer = String(bongPlayerName || "").trim();

    if (requestedPlayer && activePlayer && requestedPlayer !== activePlayer) return;
    requestBongStop("player");
});

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

function next_sum() {
    if (!Array.isArray(sums) || stop_el === null) return;
    if (stop_el >= sums.length - 1) return;

    stop_el += 1;
    const value = sums[stop_el];

    if (value === "BONG") {
        document.getElementById("bong-current-sum").textContent = "ГОНГ";
        document.getElementById("bong-current-sum").classList.add("bong");
        stop_current_sound();
        playAudio("tpv-bong-sound.ogg", false);

        emitBongToPlayer("tpv_bong_value", {value: "BONG"});
        return;
    }

    sum_results = Number(value) || 0;
    document.getElementById("bong-current-sum").textContent =
        sum_results.toLocaleString("ru-RU");

    emitBongToPlayer("tpv_bong_value", {value: sum_results});
}
function result_sum_for_player()
{
    result_money = parseInt(document.getElementById("control-current-money").value) + parseInt(document.getElementById("control-bank").value);
    playAudio("tpv-result.ogg",false);
    socket.emit("add_result_player", {
        sum_player: result_money,
        name_player: document.getElementById("display-current-player").textContent
    })
}


function show_tree()
{
    playAudio("tpv-money-tree.ogg",false);
    update_data();
    name_player = document.getElementById("display-current-player").textContent;
    socket.emit("show_tree",{player:name_player});
}

function hide_tree()
{
    name_player = document.getElementById("display-current-player").textContent;
    socket.emit("hide_tree",{player:name_player});
}

function show_stats()
{
    playAudio("tpv-stats.ogg",false);
    name_player = document.getElementById("display-current-player").textContent;
    update_data();
    socket.emit("show_stats",{player:name_player});
}

function hide_stats()
{
    name_player = document.getElementById("display-current-player").textContent;
    socket.emit("hide_stats",{player:name_player});
}
