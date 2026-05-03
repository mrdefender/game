/**
 * HOST SLOT SCRIPT
 *
 * SAFE REFACTOR / COMMENTED VERSION
 * ---------------------------------
 * Этот файл сохраняет исходную логику максимально близко к оригиналу.
 * Основная цель:
 * - ничего не сломать;
 * - оставить те же глобальные функции;
 * - сохранить совместимость с текущим HTML и backend;
 * - добавить понятные комментарии по блокам и функциям.
 *
 * Важно:
 * - имена функций не меняются;
 * - работа через document.getElementById(...) сохранена;
 * - сетевые роуты fetch(...) сохранены;
 * - цветовая логика и id элементов сохранены.
 */
/** 
 * === ГЛОБАЛЬНЫЕ DOM-ССЫЛКИ, СЧЁТЧИКИ, ЗВУК ===
 * Сохраняем старую модель с глобальными переменными, потому что
 * основной интерфейс и onclick-привязки уже завязаны на такой формат.
 */
var round = document.getElementById("status-round");
var away = document.getElementById("away");
var current_money = document.getElementById("current-money");
var next_money = document.getElementById("next-money");
var lost_money = document.getElementById("lost-money");
var fix_money = document.getElementById("fix-money");
var c1 = document.getElementById("c1");
var c2 = document.getElementById("c2");
var c3 = document.getElementById("c3");
var c4 = document.getElementById("c4");
var c5 = document.getElementById("c5");
var c6 = document.getElementById("c6");
var c7 = document.getElementById("c7");
var c8 = document.getElementById("c8");
var c9 = document.getElementById("c9");
var select = document.querySelector('#select_round');
var select_fix = document.querySelector('#select_fix');
var select_script = document.querySelector('#select_script');
document.getElementById("show-right").disabled = true;
//var audio = new Audio("http://10.73.12.4:5000/sounds/q1-3.ogg");//добавить все звуки
var audioCache = {};
var currentAudio = [];
var currentUrl = document.URL;
var ffffff = currentUrl.split('/host_slot');//адресная строка пользователя без /host_slot http://ip:5000
var audioUrl = ffffff[0]+'/sounds/';

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
  socket.emit("room:join", {
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
//var timerWaitAnswer;
//var timerHelps;
/** Сбрасывает состояние пульта ведущего к начальному состоянию. */
function cancel_all(){
    btn_default();
   // clearInterval(timerHelps);
    document.getElementById("rb").value = "false";
    document.getElementById("user_id").disabled = false;
    document.getElementById("user_id").value = "";
    document.getElementById("in_game").value = "В игре: ";
    reset_user_to_wait();
    //update_list_user();
    var select = document.querySelector('#select_round');
    var select_fix = document.querySelector('#select_fix');
    document.getElementById("au").value = "";
    document.getElementById("question").value = "";
    status_btn(true,"btn");
    status_btn(true,"o");
    select.value = "Раунд 1";
    select_fix.value = "0";
    select_fix.disabled = true;
    select_script.value = "Сценарий";
    document.getElementById("take_money").disabled = true;
    document.getElementById("take_money").style.backgroundColor ="#1a1b02";
    document.getElementById("o1").style.backgroundColor = "#000c11";
    document.getElementById("o2").style.backgroundColor = "#000c11";
    document.getElementById("o3").style.backgroundColor = "#000c11";
    document.getElementById("o4").style.backgroundColor = "#000c11";
    document.getElementById("o5").style.backgroundColor = "#000c11";
    document.getElementById("o6").style.backgroundColor = "#000c11";
    document.getElementById("o7").style.backgroundColor = "#000c11";
    document.getElementById("o8").style.backgroundColor = "#000c11";
    document.getElementById("o9").style.backgroundColor = "#000c11";
    document.getElementById("o10").style.backgroundColor = "#000c11";
    document.getElementById("o11").style.backgroundColor = "#000c11";
    document.getElementById("o12").style.backgroundColor = "#000c11";
    document.getElementById("o13").style.backgroundColor = "#000c11";
    document.getElementById("o14").style.backgroundColor = "#000c11";
    document.getElementById("o15").style.backgroundColor = "#000c11";
    document.getElementById("question").value = " ";
    document.getElementById("question").innerText = " ";
    document.getElementById("total_money").disabled = true;
    btn1.style.backgroundColor = "#000c11";
    btn2.style.backgroundColor = "#000c11";
    btn3.style.backgroundColor = "#000c11";
    btn4.style.backgroundColor = "#000c11";
    btn5.style.backgroundColor = "#000c11";
    btn6.style.backgroundColor = "#000c11";
    btn7.style.backgroundColor = "#000c11";
    btn8.style.backgroundColor = "#000c11";
    btn9.style.backgroundColor = "#000c11";
    btn10.style.backgroundColor = "#000c11";
    btn11.style.backgroundColor = "#000c11";
    btn12.style.backgroundColor = "#000c11";
    btn13.style.backgroundColor = "#000c11";
    btn14.style.backgroundColor = "#000c11";
    btn15.style.backgroundColor = "#000c11";
    document.getElementById("h50_50").style.backgroundColor = "#000c11";
    document.getElementById("alter").style.backgroundColor = "#000c11";
    document.getElementById("x2").style.backgroundColor = "#000c11";
    document.getElementById("help_auden").style.backgroundColor = "#000c11";
    document.getElementById("navi").style.backgroundColor = "#000c11";
    document.getElementById("fact").style.backgroundColor = "#000c11";
    document.getElementById("otbor").disabled = false;
    document.getElementById("start_otbor").disabled = true;
    document.getElementById("answer_otbor").disabled = true;
    document.getElementById('result_otbor').disabled = true;
   ch1();
   ch2();
   ch3();
  //  location.reload();
}

/** Переводит игроков обратно в режим ожидания на backend. */
function reset_user_to_wait()
{
    
     fetch('/reset_user_to_wait', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

     //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}


select_script.addEventListener('change', function(){
    ch1();
}
)


/** Меняет сценарий игры: классика / экстрим / рискованный. */
function ch1()
{
    if (select_script.value == "Классика")
    {
        select_fix.disabled = true;
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "white";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "white";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
    }
    if (select_script.value == "Экстрим")
    {
        select_fix.disabled = true;
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
        fix_money.value = "0";
    }    
    if (select_script.value == "Рискованный")
    {
        select_fix.disabled = false;
        ch2();
    }    

    socket.emit("send_script",{script:select_script.value})


    /* 
    fetch('/send_script', {
        method: 'POST',
        body: JSON.stringify({ script:select_script.value}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

     
})
.catch(error => {
console.error('Ошибка:', error);
});
*/
}


select_fix.addEventListener('change', function(){
   ch2()
}
);



/** Меняет несгораемую сумму в рискованном сценарии. */
function ch2(){
    if (select_fix.value =="0")
    {
        //fix_money.value = "0";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
    }
    if (select_fix.value == "1 000")
    {
       // fix_money.value = "1 000";
        c1.style.color = "white";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
    }
    if (select_fix.value == "3 000")
    {
       // fix_money.value = "3 000";
        c1.style.color = "#dd6706";
        c2.style.color = "white";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
    }
    if (select_fix.value == "5 000")
    {
       // fix_money.value = "5 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "white";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";

    }
     if (select_fix.value == "10 000")
    {
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "white";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";

    }
     if (select_fix.value == "25 000")
    {
       // fix_money.value = "25 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "white";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";

    }
     if (select_fix.value == "50 000")
    {
       // fix_money.value = "50 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "white";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";

    }
    if (select_fix.value == "150 000")
    {
      //  fix_money.value = "150 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "white";
        c8.style.color = "#dd6706";
    }
    if (select_fix.value == "500 000")
    {
        //fix_money.value = "500 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "white";

    }
    socket.emit("send_fix",{fix:select_fix.value})
    /*
     fetch('/send_fix', {
        method: 'POST',
        body: JSON.stringify({ fix:select_fix.value}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

     
})
.catch(error => {
console.error('Ошибка:', error);
}); */
}





select.addEventListener('change', function(){
   ch3();
}
);

/** Ручное переключение раунда и обновление дерева денег. */
function ch3(){
    round = document.getElementById("status-round");
    console.log (select.value);
    if (select.value == "Отборочный тур")
    {
        round.value = "Отборочный тур";
        away.value = "Осталось раундов: 9";
        current_money.value = "0";
        next_money.value = "1 000";
        lost_money.value = "0";
        fix_money.value = "0";
        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    }
    if (select.value == "Раунд 1")
    {
        round.value = "1";
        away.value = "Осталось раундов: 9";
        current_money.value = "0";
        next_money.value = "1 000";
        fix_money.value = "0";
        lost_money.value = "0"; 
        fix_money.value = "0";
        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    }   
    if (select.value == "Раунд 2")
    {
        round.value = "2";
        away.value = "Осталось раундов: 8";
        current_money.value = "1 000";
        next_money.value = "3 000";
        if(select_script.value != "Рискованный")
        {
            document.getElementById("lost-money").value = "1 000";
        }
        else{
            tt = calc_fix("2",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }
        c1.style.backgroundColor = "orange";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    } 
    if (select.value == "Раунд 3")
    {
        round.value = "3";
        away.value = "Осталось раундов: 7";
        current_money.value = "3 000";
        next_money.value = "5 000";
        if(select_script.value != "Рискованный")
        {
            document.getElementById("lost-money").value = "3 000";
        }
        else{
            tt = calc_fix("3",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }
        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "orange";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    } 
    if (select.value == "Раунд 4")
    {
        round.value = "4";
        away.value = "Осталось раундов: 6";
        current_money.value = "5 000";
        next_money.value = "10 000";
        if(select_script.value == "Классика")
        {
            document.getElementById("lost-money").value = "0";
            document.getElementById("fix-money").value = "5 000";
        }
        if(select_script.value == "Экстрим")
        {
            document.getElementById("lost-money").value = "5 000";
            document.getElementById("fix-money").value = "0";
        }
       if(select_script.value == "Рискованный"){
            tt = calc_fix("4",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }

        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "orange";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    } 
    if (select.value == "Раунд 5")
    {
        round.value = "5";
        away.value = "Осталось раундов: 5";
        current_money.value = "10 000";
        next_money.value = "25 000";
        if(select_script.value == "Классика")
        {
            document.getElementById("lost-money").value = "5 000";
            document.getElementById("fix-money").value = "5 000";
        } 
        if(select_script.value == "Экстрим")
        {
            document.getElementById("lost-money").value = "10 000";
            document
            .getElementById("fix-money").value = "0";
        }
        if(select_script.value == "Рискованный"){
            tt = calc_fix("5",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }
        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "orange";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    } 
    if (select.value == "Раунд 6")
    {
        round.value = "6";
        away.value = "Осталось раундов: 4";
        current_money.value = "25 000";
        next_money.value = "50 000";
        if(select_script.value == "Классика")
        {
            document.getElementById("lost-money").value = "20 000";
            document.getElementById("fix-money").value = "5 000";
        }
        if(select_script.value == "Экстрим")
        {
            document.getElementById("lost-money").value = "25 000";
            document.getElementById("fix-money").value = "0";
        }
        if(select_script.value == "Рискованный"){
            tt = calc_fix("6",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }

        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "orange";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    } 
    if (select.value == "Раунд 7")
    {
        round.value = "7";
        away.value = "Осталось раундов: 3";
        current_money.value = "50 000";
        next_money.value = "150 000";
         if(select_script.value == "Классика")
        {
            document.getElementById("lost-money").value = "0";
            document.getElementById("fix-money").value = "50 000";
        }
        if(select_script.value == "Экстрим")
        {
            document.getElementById("lost-money").value = "50 000";
            document.getElementById("fix-money").value = "0";
        }
        if(select_script.value == "Рискованный"){
            tt = calc_fix("7",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }
        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "orange";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    }  
    if (select.value == "Раунд 8")
    {
        round.value = "8";
        away.value = "Осталось раундов: 2";
        current_money.value = "150 000";
        next_money.value = "500 000";
        if(select_script.value == "Классика")
        {
            document.getElementById("lost-money").value = "100 000";
            document.getElementById("fix-money").value = "50 000";
        }
        if(select_script.value == "Экстрим")
        {
            document.getElementById("lost-money").value = "150 000";
            document.getElementById("fix-money").value = "0";
        }
        if(select_script.value == "Рискованный"){
            tt = calc_fix("8",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }
        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "orange";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "black";
    } 
    if (select.value == "Раунд 9")
    {
        round.value = "9";
        away.value = "Осталось раундов: 1";
        current_money.value = "500 000";
        next_money.value = "1 000 000";
        if(select_script.value == "Классика")
        {
            document.getElementById("lost-money").value = "450 000";
            document.getElementById("fix-money").value = "50 000";
        }
        if(select_script.value == "Экстрим")
        {
            document.getElementById("lost-money").value = "500 000";
            document.getElementById("fix-money").value = "0";
        }
        if(select_script.value == "Рискованный"){
            tt = calc_fix("9",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }

        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "orange";
        c9.style.backgroundColor = "black";
    }   
    if (select.value == "Победа")
    {
        round.value = "Победа";
        away.value = "Осталось раундов: 0";
        current_money.value = "1 000 000";
        next_money.value = "1 000 000";
        lost_money.value = "0";
        fix_money.value = "1 000 000";
        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "orange";
        document.getElementById("get_task").disabled = true; 
    } 
    ch1();
    ch2(); 
    console.log("Раунд " + round.value);
    socket.emit("send_round",{round:round.value})
    /*

     fetch('/send_round', {
        method: 'POST',
        body: JSON.stringify({ round:round.value}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

     
})
.catch(error => {
console.error('Ошибка:', error);
});
*/


}

function btn_default(){
    btn1.value = "1";
    btn2.value = "2";
    btn3.value = "3";
    btn4.value = "4";
    btn5.value = "5";
    btn6.value = "6";
    btn7.value = "7";
    btn8.value = "8";
    btn9.value = "9";
    btn10.value = "10";
    btn11.value = "11";
    btn12.value= "12";
    btn13.value = "13";
    btn14.value = "14";
    btn15.value = "15";
}


function start_to_game()
{
    
    document.getElementById("start_game").disabled = true;
    document.getElementById("get_task").disabled = false;
    stop_current_sound();
    playAudio("start_game.ogg",false)
    fetch('/start_game', {
        method: 'POST',
        body: JSON.stringify({"": ""}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    if (data == 'fail')
        return;
    
})
.catch(error => {
console.error('Ошибка:', error);
});


}

function fixed_script()
{
document.getElementById("fixed_script").disabled = true;
document.getElementById("start_game").disabled = false;
document.getElementById("h50_50").disabled = false;
document.getElementById("alter").disabled = false;
document.getElementById("navi").disabled = false;
document.getElementById("x2").disabled = false;
document.getElementById("help_auden").disabled = false;
document.getElementById("fact").disabled = false;
stop_current_sound();
playAudio("fix_script.ogg",false)
update_helps()
/*
var helps = [];
    if (document.getElementById("p50_50").checked)
        helps.push("50:50");
    if (document.getElementById("palter").checked)
        helps.push("alter");
    if (document.getElementById("pnavi").checked)
        helps.push("navi");
    if (document.getElementById("px2").checked)
        helps.push("x2");
    if (document.getElementById("phelp_auden").checked)
        helps.push("help_auden");
    if (document.getElementById("pfact").checked)
        helps.push("fact");
    send_helps(helps);
   // timerHelps = setInterval(() => update_helps(), 5000);

*/
}




    function update_helps(){
        var helps = [];
    if (document.getElementById("p50_50").checked)
        helps.push("50:50");
    if (document.getElementById("palter").checked)
        helps.push("alter");
    if (document.getElementById("pnavi").checked)
        helps.push("navi");
    if (document.getElementById("px2").checked)
        helps.push("x2");
    if (document.getElementById("phelp_auden").checked)
        helps.push("help_auden");
    if (document.getElementById("pfact").checked)
        helps.push("fact");
    
    send_helps(helps);
}

    function send_helps(val_helps)
{
    fetch('/send_helps', {
        method: 'POST',
        body: JSON.stringify({helps: val_helps}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    if (data == 'fail')
        return;
    
})
.catch(error => {
console.error('Ошибка:', error);
});
}

/** Приглашает выбранного игрока в игру. */
function invite_to_game()
{

    var input = document.getElementById("user_id").value;
    if ((input == "") || (input==undefined))
        return;
    fetch('/invite_user', {
        method: 'POST',
        body: JSON.stringify({user_name: input}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    if (data == 'fail')
        return;
    if (data == 'red bomb')
    {
       document.getElementById('au').value ="Игрок в предыдущих играх нашел красную бомбу и невозможно пригласить в основную игру";
        return;
    }
        document.getElementById('au').value = "В игру вступает " + data;
        document.getElementById('in_game').value = "В игре:    " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
    document.getElementById("fixed_script").disabled = false;
    select.value = "Раунд 1";
    ch3();
    stop_current_sound();
    playAudio("invite.ogg",false);
    document.getElementById('question').innerText = " "
    document.getElementById('question').value = " "
    document.getElementById("otbor").disabled = true;
    document.getElementById("start_otbor").disabled = true;
    document.getElementById("answer_otbor").disabled = true;
    document.getElementById('result_otbor').disabled = true;
})
.catch(error => {
console.error('Ошибка:', error);
});

}

/** Получает новое задание для текущего раунда. */
function gen_task()
{
    
    if (select.value == "Победа")
        return;
    var input = document.getElementById("user_id").value;
    round = document.getElementById("status-round").value;
    var bombs = "false"
    if (document.getElementById("bomb").checked)
        bombs = "true";
    if (document.getElementById("status-round").value == "Отборочный тур")
        round = "0";
    round = parseInt(round)
    console.log(round)
    if (round == "Отборочный тур" )
    {
       return;
    }
    else
    {
        var t = round
        round = parseInt(t)
    }
    console.log(round);
        fetch('/gen_task', {
        method: 'POST',
        body: JSON.stringify({user_name: input, current_round: t,bombs,bombs}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    console.log(data)
    if (data == "fail")
    {
        document.getElementById('question').innerText = "Ошибка БД"
        return
    }
    if (data[0]==0)
    {
         document.getElementById('question').innerText="Отборочный тур"+'\n'+ "Диапазон: " + data[1] + " - " + data[2] + '\n' +  "md5: " + data[4];
         document.getElementById("warning_otbor").disabled = false;
         return;
    }
    document.getElementById('question').innerText ="Раунд " + data[0] +'\n'+ "md5: "+data[2] + '\n' + "Количество фаталов: "+ data[3];
    status_btn (false,"o");
    status_btn (false,"btn");
    document.getElementById('take_money').disabled = false;
    stop_current_sound();
    if ((data[0]==1) || (data[0]==2) || (data[0]==3))
    {
        playAudio("q1-3.ogg",true);
    }
    if ((data[0]==4) || (data[0]==5))
    {
        playAudio("q4-5.ogg",true);
    }
    if (data[0]==6)
    {
        playAudio("q6.ogg",true);
    }
    if (data[0]==7)
    {
        playAudio("q7.ogg",true);
    }
    if (data[0]==8)
    {
        playAudio("q8.ogg",true);
    }
    if (data[0]==9)
    {
       playAudio("q9.ogg",true);
    }
  
    //timerWaitAnswer = setInterval(() => wait_answer(), 5000);

})
.catch(error => {
console.error('Ошибка:', error);
});

}



function status_btn(it_disable,code_btn)
{
    if (code_btn == "o")
    {
    btn_answers1 = document.getElementById("o1");
    btn_answers1.disabled = it_disable;
    btn_answers2 = document.getElementById("o2");
    btn_answers2.disabled = it_disable;
    btn_answers3 = document.getElementById("o3");
    btn_answers3.disabled = it_disable;
    btn_answers4 = document.getElementById("o4");
    btn_answers4.disabled = it_disable;
    btn_answers5 = document.getElementById("o5");
    btn_answers5.disabled = it_disable;
    btn_answers6 = document.getElementById("o6");
    btn_answers6.disabled = it_disable;
    btn_answers7 = document.getElementById("o7");
    btn_answers7.disabled = it_disable;
    btn_answers8 = document.getElementById("o8");
    btn_answers8.disabled = it_disable;
    btn_answers9 = document.getElementById("o9");
    btn_answers9.disabled = it_disable;
    btn_answers10 = document.getElementById("o10");
    btn_answers10.disabled = it_disable;
    btn_answers11 = document.getElementById("o11");
    btn_answers11.disabled = it_disable;
    btn_answers12 = document.getElementById("o12");
    btn_answers12.disabled = it_disable;
    btn_answers13 = document.getElementById("o13");
    btn_answers13.disabled = it_disable;
    btn_answers14 = document.getElementById("o14");
    btn_answers14.disabled = it_disable;
    btn_answers15 = document.getElementById("o15");
    btn_answers15.disabled = it_disable;
    };
    if (code_btn = "btn")
    {
    btn1 = document.getElementById("btn1");
    btn1.disabled = it_disable;
    btn2 = document.getElementById("btn2");
    btn2.disabled = it_disable;
    btn3 = document.getElementById("btn3");
    btn3.disabled = it_disable;
    btn4 = document.getElementById("btn4");
    btn4.disabled = it_disable;
    btn5 = document.getElementById("btn5");
    btn5.disabled = it_disable;
    btn6 = document.getElementById("btn6");
    btn6.disabled = it_disable;
    btn7 = document.getElementById("btn7");
    btn7.disabled = it_disable;
    btn8 = document.getElementById("btn8");
    btn8.disabled = it_disable;
    btn9 = document.getElementById("btn9");
    btn9.disabled = it_disable;
    btn10 = document.getElementById("btn10");
    btn10.disabled = it_disable;
    btn11 = document.getElementById("btn11");
    btn11.disabled = it_disable;
    btn12 = document.getElementById("btn12");
    btn12.disabled = it_disable;
    btn13 = document.getElementById("btn13");
    btn13.disabled = it_disable;
    btn14 = document.getElementById("btn14");
    btn14.disabled = it_disable;
    btn15 = document.getElementById("btn15");
    btn15.disabled = it_disable;
    }
}

function get_btn(answer)
{
    if (answer == "1")
        return "btn1";
    if (answer == "2")
        return "btn2";
    if (answer == "3")
        return "btn3";
    if (answer == "4")
        return "btn4";
    if (answer == "5")
        return "btn5";
    if (answer == "6")
        return "btn6";
    if (answer == "7")
        return "btn7";
    if (answer == "8")
        return "btn8";
    if (answer == "9")
        return "btn9";
    if (answer == "10")
        return "btn10";
    if (answer == "11")
        return "btn11";
    if (answer == "12")
        return "btn12";
    if (answer == "13")
        return "btn13";
    if (answer == "14")
        return "btn14";
    if (answer == "15")
        return "btn15";
    
}
function get_o(answer)
{
    if (answer == "1")
        return "o1";
    if (answer == "2")
        return "o2";
    if (answer == "3")
        return "o3";
    if (answer == "4")
        return "o4";
    if (answer == "5")
        return "o5";
    if (answer == "6")
        return "o6";
    if (answer == "7")
        return "o7";
    if (answer == "8")
        return "o8";
    if (answer == "9")
        return "o9";
    if (answer == "10")
        return "o10";
    if (answer == "11")
        return "o11";
    if (answer == "12")
        return "o12";
    if (answer == "13")
        return "o13";
    if (answer == "14")
        return "o14";
    if (answer == "15")
        return "o15";
    
}


function show_fatal_to_host_panel(n_r,fatal,b_bomb,r_bomb)
{
        document.getElementById("show-right").disabled = false;
        document.getElementById("take_money").disabled = true;
        console.log(b_bomb,r_bomb);
        
        if (n_r == 1)
    {
        document.getElementById(get_btn(fatal)).style.backgroundColor = "red";

    }
    if (n_r==2)
    {
        for (i=0;i<2;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
        }

    }
    if (n_r==3)
    {
        for (i=0;i<3;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
        }

    }
    if (n_r==4)
    {
        for (i=0;i<5;i++)
        {
            stop_current_sound();
            playAudio("a4-9.ogg",false);
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            if ((b_bomb != "false") && (r_bomb!=false))
            {
                document.getElementById(get_btn(b_bomb)).value = "💣";
                document.getElementById(get_btn(r_bomb)).value = "🧨";
            }
            
        }

    }
    if (n_r==5)
    {
        for (i=0;i<6;i++)
        {
            stop_current_sound();
            playAudio("a5.ogg",false);
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            if ((b_bomb != "false") && (r_bomb!=false))
            {
                document.getElementById(get_btn(b_bomb)).value = "💣";
                document.getElementById(get_btn(r_bomb)).value = "🧨";
            }
            
        }

    }
    if (n_r==6)
    {
        for (i=0;i<8;i++)
        {
            stop_current_sound();
            playAudio("a6.ogg",false);
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            if ((b_bomb != "false") && (r_bomb!=false))
            {
                document.getElementById(get_btn(b_bomb)).value = "💣";
                document.getElementById(get_btn(r_bomb)).value = "🧨";
            }
            
        }

    }
    if (n_r==7)
    {
        for (i=0;i<10;i++)
        {
            stop_current_sound();
            playAudio("a6.ogg",false);
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            if ((b_bomb != "false") && (r_bomb!=false))
            {
                document.getElementById(get_btn(b_bomb)).value = "💣";
                document.getElementById(get_btn(r_bomb)).value = "🧨";
            }
            
        }

    }
    if (n_r==8)
    {
        for (i=0;i<12;i++)
        {
            stop_current_sound();
            playAudio("a6.ogg",false);
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            if ((b_bomb != "false") && (r_bomb!=false))
            {
                document.getElementById(get_btn(b_bomb)).value = "💣";
                document.getElementById(get_btn(r_bomb)).value = "🧨";
            }
            
        }

    }
    if (n_r==9)
    {
        for (i=0;i<14;i++)
        {
            stop_current_sound();
            playAudio("a9.ogg",false);
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            if ((b_bomb != "false") && (r_bomb!=false))
            {
                document.getElementById(get_btn(b_bomb)).value = "💣";
                document.getElementById(get_btn(r_bomb)).value = "🧨";
            }
            
        }

    }

}

function check_answered()
{
    if(document.getElementById("x2").style.backgroundColor == "orange")
       {
        return false;
       }
    fetch('/check_answered', {
        method: 'POST',
        body: JSON.stringify({check: "true"}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    if (data = "true")
        return true;
    else
        return false;
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}

function a1(){
    btn_answers1 = document.getElementById("o1");
    btn_answers1.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o1", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a2(){
    btn_answers2 = document.getElementById("o2");
    btn_answers2.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o2", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}
function a3(){
    btn_answers3 = document.getElementById("o3");
    btn_answers3.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o3", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a4(){
    btn_answers4 = document.getElementById("o4");
    btn_answers4.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o4", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}
function a5(){
    btn_answers5 = document.getElementById("o5");
    btn_answers5.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o5", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}
function a6(){
    btn_answers6 = document.getElementById("o6");
    btn_answers6.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o6", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}
function a7(){
    btn_answers7 = document.getElementById("o7");
    btn_answers7.style.backgroundColor = "orange";
   if (check_answered())
       { return;};
   document.getElementById("show-right").disabled = false; 
   fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o7", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}
function a8(){
     btn_answers8 = document.getElementById("o8");
    btn_answers8.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o8", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a9(){
    btn_answers9 = document.getElementById("o9");
    btn_answers9.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o9", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a10(){
    btn_answers10 = document.getElementById("o10");
    btn_answers10.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o10", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a11(){
 btn_answers11 = document.getElementById("o11");
    btn_answers11.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o11", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a12(){
     btn_answers12 = document.getElementById("o12");
    btn_answers12.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o12", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a13(){
     btn_answers13 = document.getElementById("o13");
    btn_answers13.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o13", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a14(){
     btn_answers14 = document.getElementById("o14");
    btn_answers14.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o14", round:round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function a15(){
     btn_answers15 = document.getElementById("o15");
    btn_answers15.style.backgroundColor = "orange";
    if (check_answered())
       { return;}
    document.getElementById("show-right").disabled = false;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "o15", round: round}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    var c_r = parseInt(data[0]);
    b_bomb = data[4]
    r_bomb = data[5]
    show_fatal_to_host_panel(c_r, data[1],b_bomb,r_bomb);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}


/** Показывает правильный ответ на пульте ведущего. */
function show_right(){
    if (check_answered)
        fetch('/show_rights', {
        method: 'POST',
        body: JSON.stringify({answer: " ", round:"round"}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    document.getElementById("show-right").disabled = true;
    
    console.log(data);
    if(document.getElementById("x2").style.backgroundColor == "orange")
    {
        stop_current_sound();
        playAudio("x2_2.ogg",false);
        document.getElementById("x2").style.backgroundColor =  "#1a1b02"
        if(document.getElementById(o_to_btn(data[0])).style.backgroundColor == "red")
        {
            document.getElementById(data[0]).style.backgroundColor ="red"
            document.getElementById("x2").style.backgroundColor =  "#1a1b02";
            //timerWaitAnswer = setInterval(() => wait_answer(), 5000);
            return;
        }

    };
    document.getElementById("o1").style.backgroundColor = btn1.style.backgroundColor;
    document.getElementById("o2").style.backgroundColor = btn2.style.backgroundColor;
    document.getElementById("o3").style.backgroundColor = btn3.style.backgroundColor;
    document.getElementById("o4").style.backgroundColor = btn4.style.backgroundColor;
    document.getElementById("o5").style.backgroundColor = btn5.style.backgroundColor;
    document.getElementById("o6").style.backgroundColor = btn6.style.backgroundColor;
    document.getElementById("o7").style.backgroundColor = btn7.style.backgroundColor;
    document.getElementById("o8").style.backgroundColor = btn8.style.backgroundColor;
    document.getElementById("o9").style.backgroundColor = btn9.style.backgroundColor;
    document.getElementById("o10").style.backgroundColor = btn10.style.backgroundColor;
    document.getElementById("o11").style.backgroundColor = btn11.style.backgroundColor;
    document.getElementById("o12").style.backgroundColor = btn12.style.backgroundColor;
    document.getElementById("o13").style.backgroundColor = btn13.style.backgroundColor;
    document.getElementById("o14").style.backgroundColor = btn14.style.backgroundColor;
    document.getElementById("o15").style.backgroundColor = btn15.style.backgroundColor;

    var tm = document.getElementById("take_money");
    console.log(tm.style.backgroundColor);
    if (tm.style.backgroundColor == "lime")
        return;

    if (document.getElementById(data[0]).style.backgroundColor !="red")
    {
        document.getElementById(data[0]).style.backgroundColor ="green";
        document.getElementById("au").value = next_money.value;
        if (data[1] == "1")
        {
            select.value = "Раунд 2";
            document.getElementById("status-round").value = "2";
            playAudio("r1-2.ogg",false);
           if(select_script.value == "Классика")
           {
            document.getElementById("lost-money").value = "1 000";
           }
            if(select_script.value == "Рискованный")
        {
            console.log(select_script.value);
            tt = calc_fix("2",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
        }
        }
        if (data[1] == "2")
        {
            select.value = "Раунд 3";
            playAudio("r1-2.ogg",false);
            document.getElementById("status-round").value = "3";
           if(select_script.value == "Классика")
           {
            document.getElementById("lost-money").value = "3 000";
           }   
           if(select_script.value == "Рискованный"){
            tt = calc_fix("3",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];

        }         
        }
        if (data[1] == "3")
        {
            select.value = "Раунд 4";
            stop_current_sound();
            playAudio("r3.ogg",false);
            document.getElementById("status-round").value = "4";
           if(select_script.value == "Классика")
           {
            document.getElementById("fix-money").value = "5 000";
            document.getElementById("lost-money").value = "0";
           }
           if(select_script.value == "Рискованный"){
            tt = calc_fix("4",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];

        }
        }
        if (data[1] == "4")
        {
            select.value = "Раунд 5";
            stop_current_sound();
            playAudio("r4.ogg",false);
            document.getElementById("status-round").value = "5";
           if(select_script.value == "Классика")
           {
            document.getElementById("fix-money").value = "5 000";
            document.getElementById("lost-money").value = "5 000";
           }    
           if(select_script.value == "Рискованный"){
            tt = calc_fix("5",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];

        }        
        }
        if (data[1] == "5")
        {
            select.value = "Раунд 6";
            stop_current_sound();
            playAudio("r5.ogg",false);
            document.getElementById("status-round").value = "6";
            if(select_script.value == "Классика")
           {
            document.getElementById("fix-money").value = "5 000";
            document.getElementById("lost-money").value = "20 000";
           }  
           if(select_script.value == "Рискованный"){
            tt = calc_fix("6",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];

        }
        }
        if (data[1] == "6")
        {
            select.value = "Раунд 7";
            stop_current_sound();
            playAudio("r6.ogg",false);
            document.getElementById("status-round").value = "7";
            if(select_script.value == "Классика")
           {
            document.getElementById("fix-money").value = "50 000";
            document.getElementById("lost-money").value = "0";
           }  
           if(select_script.value == "Рискованный"){
            tt = calc_fix("7",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
            
        }
        }

        if (data[1] == "7")
        {
            select.value = "Раунд 8";
            stop_current_sound();
            playAudio("r7.ogg",false);
            document.getElementById("status-round").value = "8";
            if(select_script.value == "Классика")
           {
            document.getElementById("fix-money").value = "50 000";
            document.getElementById("lost-money").value = "100 000";
           }  
           if(select_script.value == "Рискованный"){
            tt = calc_fix("8",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
            
        }
        }
        if (data[1] == "8")
        {
            select.value = "Раунд 9";
            stop_current_sound();
            playAudio("r8.ogg",false);
            document.getElementById("status-round").value = "9";
           if(select_script.value == "Классика")
           {
            document.getElementById("fix-money").value = "50 000";
            document.getElementById("lost-money").value = "450 000";
           }  
            if(select_script.value == "Рискованный")
        {
            tt = calc_fix("9",select_fix.value);
            fix_money.value = tt[0];
            lost_money.value = tt[1];
            ;
        }            
        }
        if (data[1] == "9")
        {
            select.value = "Победа";
            stop_current_sound();
            playAudio("r9.ogg",false);
            document.getElementById("status-round").value = "Победа";
            if(select_script.value == "Классика")
           {
            document.getElementById("fix-money").value = "1 000 000";
            document.getElementById("lost-money").value = "0";
            
           }              
        }
        
        if (select.value == "Победа")
        {
            document.getElementById("next-round").disabled = true;
        document.getElementById("total_money").disabled = false;
        document.getElementById("next-round").disabled = true; 
         document.getElementById("get_task").disabled = true; 
        }
        document.getElementById("next-round").disabled = false; 


    }
        else 
    {
        
        document.getElementById("au").value = fix_money.value;
        document.getElementById("next-round").disabled = true;
        document.getElementById("total_money").disabled = false;
        if (document.getElementById(o_to_btn(data[0])).value=="💣")
        {
            document.getElementById("au").value = "0";
        }
        if (document.getElementById(o_to_btn(data[0])).value=="🧨")
        {
            document.getElementById("au").value = "0";
            document.getElementById("rb").value = "true";
        }
        stop_current_sound();
        if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        {
            playAudio("w1-3.ogg",false);
        }
        if (select.value == "Раунд 4")
        {
            playAudio("w4.ogg",false);
        }
        if (select.value == "Раунд 5")
        {
            playAudio("w5.ogg",false);
        }
        if (select.value == "Раунд 6")
        {
            playAudio("w6.ogg",false);
        }
        if (select.value == "Раунд 7")
        {
            playAudio("w7.ogg",false);
        }
        if (select.value == "Раунд 8")
        {
            playAudio("w8.ogg",false);
        }
        if (select.value == "Раунд 9")
        {
            playAudio("w9.ogg",false);
        }
    }   

    document.getElementById("show-right").disabled = true;
    ch3();
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;

    
}
)
.catch(error => {
console.error('Ошибка:', error);
});


}


/** Готовит UI к следующему раунду. */
function next_round()
{   
    btn_default();
    document.getElementById("rb").value = "false";
    ch3();
    if (select.value == "Раунд 4")
    {
        stop_current_sound();
        playAudio("n4.ogg",false);
    }
    if (select.value == "Раунд 5")
    {
        stop_current_sound();
        playAudio("n5.ogg",false);
    }
    if (select.value == "Раунд 6")
    {
        stop_current_sound();
        playAudio("n6.ogg",false);;
    }
    if (select.value == "Раунд 7")
    {
        stop_current_sound();
        playAudio("n7.ogg",false);
    }
    if (select.value == "Раунд 8")
    {
        stop_current_sound();
        playAudio("n8.ogg",false);
    }
    if (select.value == "Раунд 9")
    {
        stop_current_sound();
        playAudio("n9.ogg",false);
    }
    document.getElementById("o1").style.backgroundColor = "#000c11";
    document.getElementById("o2").style.backgroundColor = "#000c11";
    document.getElementById("o3").style.backgroundColor = "#000c11";
    document.getElementById("o4").style.backgroundColor = "#000c11";
    document.getElementById("o5").style.backgroundColor = "#000c11";
    document.getElementById("o6").style.backgroundColor = "#000c11";
    document.getElementById("o7").style.backgroundColor = "#000c11";
    document.getElementById("o8").style.backgroundColor = "#000c11";
    document.getElementById("o9").style.backgroundColor = "#000c11";
    document.getElementById("o10").style.backgroundColor = "#000c11";
    document.getElementById("o11").style.backgroundColor = "#000c11";
    document.getElementById("o12").style.backgroundColor = "#000c11";
    document.getElementById("o13").style.backgroundColor = "#000c11";
    document.getElementById("o14").style.backgroundColor = "#000c11";
    document.getElementById("o15").style.backgroundColor = "#000c11";
    document.getElementById("question").value = " ";
    document.getElementById("question").innerText = " ";
    btn1.style.backgroundColor = "#000c11";
    btn2.style.backgroundColor = "#000c11";
    btn3.style.backgroundColor = "#000c11";
    btn4.style.backgroundColor = "#000c11";
    btn5.style.backgroundColor = "#000c11";
    btn6.style.backgroundColor = "#000c11";
    btn7.style.backgroundColor = "#000c11";
    btn8.style.backgroundColor = "#000c11";
    btn9.style.backgroundColor = "#000c11";
    btn10.style.backgroundColor = "#000c11";
    btn11.style.backgroundColor = "#000c11";
    btn12.style.backgroundColor = "#000c11";
    btn13.style.backgroundColor = "#000c11";
    btn14.style.backgroundColor = "#000c11";
    btn15.style.backgroundColor = "#000c11";
     document.getElementById("show-right").disabled = true;
    document.getElementById("next-round").disabled = true;
    status_btn(true,"btn");
    status_btn(true,"o");
    document.getElementById("alter").style.backgroundColor = "#1a1b02";
    document.getElementById("x2").style.backgroundColor =  "#1a1b02";
    document.getElementById("navi").style.backgroundColor = "#000c11";
    document.getElementById("alter").style.backgroundColor = "#000c11";
    document.getElementById("h50_50").style.backgroundColor = "#000c11";
    fetch('/next_round', {
        method: 'POST',
        body: JSON.stringify({ round:document.getElementById("status-round").value}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == 'fail')
        return;


})
.catch(error => {
console.error('Ошибка:', error);
});

    

}

function calc_fix(id_round, id_fix)
{
    console.log(id_round, id_fix);
      res_money = []
    var id_fix_int;
    switch (id_fix){
        case "1 000": id_fix_int = 1000; break;
        case "3 000": id_fix_int = 3000; break;
        case "5 000": id_fix_int = 5000; break;
        case "10 000": id_fix_int = 10000; break;
        case "25 000": id_fix_int = 25000; break;
        case "50 000": id_fix_int = 50000; break;
        case "150 000":id_fix_int = 150000; break;
        case "500 000":id_fix_int = 500000; break;
    }
    var id_round_int;
    switch (id_round){
        case "2": id_round_int = 1000; break;
        case "3": id_round_int = 3000; break;
        case "4": id_round_int = 5000; break;
        case "5": id_round_int = 10000; break;
        case "6": id_round_int = 25000; break;
        case "7": id_round_int = 50000; break;
        case "8":id_round_int = 150000; break;
        case "9":id_round_int = 500000; break;
    }

    console.log (id_fix_int , id_round_int);

    var tmp = id_fix_int - id_round_int;
    if (tmp == 0)
        res_money = [id_fix,"0"];
    if (tmp>0)
    {
        switch (id_round){
        case "2": res_money = ["0","1 000"]; break;
        case "3": res_money = ["0","3 000"]; break;
        case "4":  res_money = ["0","5 000"]; break;
        case "5":  res_money = ["0","10 000"]; break;
        case "6":  res_money = ["0","25 000"]; break;
        case "7":  res_money = ["0","50 000"]; break;
        case "8": res_money = ["0","150 000"]; break;
        case "9": res_money = ["0","500 000"]; break;
    }
    }
    if (tmp<0)
    {
       tmp *=-1;
        var tmp_str = tmp.toString();
       console.log(tmp_str);
       
       var tmp_str_res
        if (tmp_str.length == 6)
        {
            tmp_str_res = tmp_str[0]+tmp_str[1]+tmp_str[2]+" "+tmp.toString().slice(-3);
        }
        if (tmp_str.length == 5)
        {
            tmp_str_res = tmp_str[0]+tmp_str[1]+" "+tmp.toString().slice(-3);
        }
        if (tmp_str.length == 4)
        {
            tmp_str_res = tmp_str[0]+" "+tmp.toString().slice(-3);
        }
        res_money = [id_fix,tmp_str_res];
    }

    console.log(res_money);

    return res_money;
    
}

/** Фиксирует решение забрать деньги. */
function take_money()
{
    if(document.getElementById("x2").style.backgroundColor == "orange")
        return;
   // if (document.getElementById("alter").style.backgroundColor == "orange")
       // return;
    //document.getElementById("au").value = "Выигрыш: " + '\n' + current_money.value;
     document.getElementById("au").value = current_money.value;
     var tm = document.getElementById("take_money");
     tm.style.backgroundColor = "lime";
     console.log(tm.style.backgroundColor);
     document.getElementById("total_money").disabled = false;
     stop_current_sound();
     playAudio("take_money.ogg",false);
}

socket.on("request 50:50", (data) => {
    h50_50();
})

/** Активирует подсказку 50:50. */
function h50_50(){
    if(document.getElementById("x2").style.backgroundColor == "orange")
        return;
    if(check_answered())
        return;
    if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        return;
    fetch('/h50_50', {
        method: 'POST',
        body: JSON.stringify({ round:document.getElementById("status-round").value}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    for (var i =0;i<data.length;i++)
    {
        document.getElementById(get_btn(data[i])).disabled = true;
        document.getElementById(get_o(data[i])).disabled = true;
    }
    document.getElementById('p50_50').checked = false;
     playAudio("rave_50_50.ogg",false);
    document.getElementById("h50_50").style.backgroundColor = "#000c11";
    update_helps();

        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});






}

socket.on("request alter", (data) => {
    alter();
})

/** Активирует подсказку Альтернатива. */
function alter(){
    if(document.getElementById("x2").style.backgroundColor == "orange")
        return;
    if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        return;
    
    fetch('/alter', {
        method: 'POST',
        body: JSON.stringify({ round:document.getElementById("status-round").value}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    var f = data[0]
    var nf = data[1]
    console.log(f,nf);
    status_btn(true,"btn");
    status_btn(true,"o");
    document.getElementById(get_btn(f)).disabled = false;
    document.getElementById(get_o(f)).disabled = false;
    document.getElementById(get_btn(nf)).disabled = false;
    document.getElementById(get_o(nf)).disabled = false;

    document.getElementById("palter").checked = false;
    document.getElementById("alter").style.backgroundColor = "orange";
    playAudio("alter.ogg",false);
    update_helps();



        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});


}
socket.on("request navi", (data) => {
    navi();
})
/** Активирует подсказку Навигатор. */
function navi(){
    if(document.getElementById("x2").style.backgroundColor == "orange")
        return;
    
    if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        return;
    if (document.getElementById("alter").style.backgroundColor == "orange")
        return;
    document.getElementById("pnavi").checked = false;
    document.getElementById("navi").style.backgroundColor = "#000c11";

    fetch('/navi', {
        method: 'POST',
        body: JSON.stringify({ round:document.getElementById("status-round").value}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    playAudio("navigator.ogg",false);
    for (var i = 0; data.length;i++)
    {
    document.getElementById(get_btn(data[i])).style.backgroundColor = "#d905ec";
    document.getElementById(get_o(data[i])).style.backgroundColor = "#d905ec";
    }

    document.getElementById("navi").style.backgroundColor = "#000c11";
    update_helps();





        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
socket.on("request x2", (data) => {
    x2();
})
/** Активирует подсказку x2. */
function x2(){
    if(check_answered())
        return;
    if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        return;
    if (document.getElementById("alter").style.backgroundColor == "orange")
        return;
    document.getElementById("px2").checked = false;
    document.getElementById("x2").style.backgroundColor = "orange";
    
    stop_current_sound();
    playAudio("x2.ogg",false);
    update_helps();


}
socket.on("request auden", (data) => {
    help_auden();
})

/** Активирует подсказку помощи интерактива. */
function help_auden(){
     if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        return;
    if (document.getElementById("alter").style.backgroundColor == "orange")
        return;
    if (document.getElementById("x2").style.backgroundColor == "orange")
        return;

    if (document.getElementById("count_interactive").value==0)
        return;
    
    fetch('/help_auden', {
        method: 'POST',
        body: JSON.stringify({" ":" "}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fatal")
        return;
    document.getElementById("phelp_auden").checked = false;
    stop_current_sound();
    playAudio("help_auden.ogg",false);
    document.getElementById("au").value = ""
    for (var i = 0; i<15;i++)
    {
        document.getElementById("au").value = document.getElementById("au").value+" " + (i+1).toString()+" - "+data[i] +"%"+ ";";
    }
    document.getElementById("au").value = document.getElementById("au").value + " Фатал- "+ data[15] +"%" + " " + " Cвободный слот - "+data[16]+ "%";
    document.getElementById("help_auden").style.backgroundColor = "#000c11";
    update_helps();

   

   
})
.catch(error => {
console.error('Ошибка:', error);
});

}
socket.on("request fact", (data) => {
    fact();
})

/** Активирует подсказку Факт. */
function fact(){
     if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        return;
    if (document.getElementById("alter").style.backgroundColor == "orange")
        return;
    if (document.getElementById("x2").style.backgroundColor == "orange")
        return;
    
    fetch('/fact', {
        method: 'POST',
        body: JSON.stringify({" ":" "}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fatal")
        return;
    document.getElementById("pfact").checked = false;
    stop_current_sound();
    playAudio("help_auden.ogg",false);
    document.getElementById("au").value = ""
    document.getElementById("au").value = document.getElementById("au").value + data[0]+": "+ data[1];
    document.getElementById("fact").style.backgroundColor = "#000c11";
    update_helps();

   

   
})
.catch(error => {
console.error('Ошибка:', error);
});

}




function o_to_btn(o)
{
    if (o == "o1")
        return "btn1"
    if (o == "o2")
        return "btn2"
    if (o == "o3")
        return "btn3"
    if (o == "o4")
        return "btn4"
    if (o == "o5")
        return "btn5"
    if (o == "o6")
        return "btn6"
    if (o == "o7")
        return "btn7"
    if (o == "o8")
        return "btn8"
    if (o == "o9")
        return "btn9"
    if (o == "o10")
        return "btn10"
    if (o == "o11")
        return "btn11"
    if (o == "o12")
        return "btn12"
    if (o == "o13")
        return "btn13"
    if (o == "o14")
        return "btn14"
    if (o == "o15")
        return "btn15"
}

/** Открывает комнату для игроков. */
function open_room(){


     fetch('/open_room', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/json'
        }
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
            'Content-Type': 'application/json'
        }
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
    
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}


function start_sound_begin1()
{
    stop_current_sound();
    playAudio("begin1.ogg",false);
}
function start_sound_begin2()
{
    stop_current_sound();
    playAudio("begin2.ogg",false);
}
function start_background()
{
    stop_current_sound();
    playAudio("start_background.ogg",true);
}
function start_rules_game()
{
    stop_current_sound();
    playAudio("rules_player.ogg",true);
}
function start_pre_final()
{
    stop_current_sound();
    playAudio("pre-final.ogg",true);
}
function start_final()
{
    stop_current_sound();
    playAudio("final.ogg",false);
}


/** Показывает общий выигрыш / итог. */
function total_money()
{
    var lose = "false";
    var result_money;
    var tm = document.getElementById("take_money");
    var input = document.getElementById("user_id").value;
    var rb = document.getElementById("rb").value;
  // if (tm.style.backgroundColor != "lime")
   //{
    var tmp_money = document.getElementById("au").value;
    result_money = tmp_money;
    document.getElementById("au").value = "Выигрыш:" +'\n' + tmp_money;
     if (tm.style.backgroundColor != "lime") {
             lose = "true";
         }
    fetch('/game_over', {
        method: 'POST',
        body: JSON.stringify({ lose:lose,money:result_money,user_name:input,rb:rb}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    

    if (data == 'fail')
        return;


})
.catch(error => {
console.error('Ошибка:', error);
});

    stop_current_sound();
    playAudio("out_player.ogg",false);
}


//let timerId = setInterval(() => update_list_user(), 5000);


socket.on("updated_list_user", (data) => {
    update_list_user(data);
}

)
/** Обновляет таблицу игроков и их статусы. */
function update_list_user(data)
{
  //  fetch('/update_list_users', {
      //  method: 'POST',
       // body: JSON.stringify({ "":""}),
      //  headers: {
       //     'Content-Type': 'application/data'
    //   // }
//)
//.then(response => response.json())

//.then(data => {

    console.log(data);
    var interactive_col = 0;

    var table = document.getElementById("status_users");
    if (table.rows.length!=1)
    {
   for (let i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i); // Помалу прощаемся со строками...
     }
   }

   if (data[8]=="true")
   {
    var tr = document.createElement("tr")
    var cell1 = document.createElement("td")
    cell1.innerHTML = data[0];
    var cell2 = document.createElement("td")
    cell2.innerHTML = data[1];
    var cell3 = document.createElement("td")
    cell3.innerHTML = data[2];
    var cell4 = document.createElement("td")
    cell4.innerHTML = data[3];
    var cell5 = document.createElement("td")
    cell5.innerHTML = data[4];
    var cell6 = document.createElement("td")
    cell6.innerHTML = data[5];
    var cell7 = document.createElement("td")
    cell7.innerHTML = data[6];
    var cell8 = document.createElement("td")
    cell8.innerHTML = data[7];
    tr.appendChild(cell1);
    tr.appendChild(cell2);
    tr.appendChild(cell3);
    tr.appendChild(cell4);
    tr.appendChild(cell5);
    tr.appendChild(cell6);
    tr.appendChild(cell7);
    tr.appendChild(cell8);
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
    var cell6 = document.createElement("td")
    cell6.innerHTML = data[i][5];
    var cell7 = document.createElement("td")
    cell7.innerHTML = data[i][6].toLocaleString("ru");
    var cell8 = document.createElement("td")
    cell8.innerHTML = data[i][7];
    if (data[i][5]=="answered interactive")
        interactive_col++;
    if (data[i][5]=="50:50")
    {
        document.getElementById("h50_50").style.backgroundColor = "blue";
    }
    if (data[i][5]=="alter")
    {
        document.getElementById("alter").style.backgroundColor = "blue";
    }
    if (data[i][5]=="navi")
    {
        document.getElementById("navi").style.backgroundColor = "blue";
    }
       if (data[i][5]=="x2")
    {
        document.getElementById("x2").style.backgroundColor = "orange";
    }
       if (data[i][5]=="auden")
    {
        document.getElementById("help_auden").style.backgroundColor = "blue";
    }
     if (data[i][5]=="fact")
    {
        document.getElementById("fact").style.backgroundColor = "blue";
    }
    console.log(interactive_col);
    document.getElementById("count_interactive").value = interactive_col.toString();
    tr.appendChild(cell1);
    tr.appendChild(cell2);
    tr.appendChild(cell3);
    tr.appendChild(cell4);
    tr.appendChild(cell5);
    tr.appendChild(cell6);
    tr.appendChild(cell7);
    tr.appendChild(cell8);
    table.appendChild(tr);
    }
}  

//})
//.catch(error => {
//console.error('Ошибка:', error);
//});
//}

function clear_table(){
    fetch('/clear_table', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/data'
        }
    }
)
.then(response => response.json())

.then(data => {
    

    console.log(data);
    if (data == 'fail')
        return;


})
.catch(error => {
console.error('Ошибка:', error);
});
}

socket.on ("user answered",(data) =>{
    wait_answer(data);
})

/** Периодически проверяет, пришёл ли ответ игрока. */
function wait_answer(data){
    //fetch('/wait_answer_for_host', {
     //   method: 'POST',
      //  body: JSON.stringify({ "":""}),
      //  headers: {
      //      'Content-Type': 'application/data'
      //  }
   // }
//)
//.then(response => response.json())

//.then(data => {
    

//    console.log(data);
    if (data == 'fail')
        return;
//    console.log(timerWaitAnswer)
//    clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
 //   clearInterval(timerWaitAnswer);
//   if (timerWaitAnswer == undefined)
   //     return;
 //   timerWaitAnswer = undefined;
    if (data == "1")
    {
        
        a1();
        return;
    }
    if (data == "2")
     {
        a2();
        return;
    }
    if (data == "3")
       {
        a3();
        return;
    }
    if (data == "4")
       {
        a4();
        return;
       }
    if (data == "5")
      {
        a5();
        return;
    }
    if (data == "6")
       {
        a6();
        return;
    }
    if (data == "7")
       {
        a7();
        return;
    }
    if (data == "8")
       {
        a8();
        return;
    }
    if (data == "9")
       {
        a9();
        return;
    }
    if (data == "10")
       {
        a10();
        return;
    }
    if (data == "11")
       {
        a11();
        return;
    }
    if (data == "12")
       {
        a12();
        return;
    }
    if (data == "13")
       {
        a13();
        return;
    }
    if (data == "14")
       {
        a14();
        return
    }
    if (data == "15")
       {
        a15();
        return;
    }



//})
//.catch(error => {
//console.error('Ошибка:', error);
//});
}


/** Запускает режим отборочного тура. */
function otbor(){
    
    fetch('/otbor', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/data'
        }
    }
)
.then(response => response.json())

.then(data => {
    

    console.log(data);
    if (data == 'fail')
        return;
    select.value = "Отборочный тур"
    ch3();
    stop_current_sound();
    playAudio("otbor_rules.ogg",true);
    document.getElementById("get_task").disabled = false;
    document.getElementById("start_otbor").disabled = true;
    document.getElementById("answer_otbor").disabled = true;
    document.getElementById('result_otbor').disabled = true;
 



})
.catch(error => {
console.error('Ошибка:', error);
});


}

/** Показывает предупреждение перед стартом отборочного тура. */
function warning_otbor(){
    
    fetch('/warning_otbor', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/data'
        }
    }
)
.then(response => response.json())

.then(data => {
    

    console.log(data);
    if (data == 'fail')
        return;
    stop_current_sound();
    playAudio("otbor_warning.ogg",false);
    document.getElementById("au").value = "20";
    document.getElementById("start_otbor").disabled = false;
    

})
.catch(error => {
console.error('Ошибка:', error);
});


}

/** Запускает таймер отборочного тура. */
function start_otbor(){
     fetch('/start_otbor', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/data'
        }
    }
)
.then(response => response.json())

.then(data => {
     if (data == 'fail')
        return;
    stop_current_sound();
    playAudio("otbor_play.ogg",false);
    setTimeout(() => {
  timer_otbor(); 
}, 1000);
    

})
.catch(error => {
console.error('Ошибка:', error);
});


    
}

function timer_otbor(){
    if (document.getElementById("au").value == "0")
    {
        document.getElementById("answer_otbor").disabled = false;
        return;
    }
    document.getElementById("au").value = (parseInt(document.getElementById("au").value)-1).toString();
    setTimeout(() => { timer_otbor(); 
}, 1000);

}

/** Показывает правильный ответ отборочного тура. */
function show_answer_otbor(){
     fetch('/show_answer_otbor', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/data'
        }
    }
)
.then(response => response.json())

.then(data => {
    

    console.log(data);
    if (data == 'fail')
        return;
    stop_current_sound();
    playAudio("navigator.ogg",false);
    document.getElementById("au").value =" ";
    document.getElementById('question').innerText= "Правильный ответ: " + data[3];
    document.getElementById('result_otbor').disabled = false;
   

})
.catch(error => {
console.error('Ошибка:', error);
});



}

/** Показывает победителя отборочного тура. */
function show_result_otbor(){
    fetch('/show_result_otbor', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/data'
        }
    }
)
.then(response => response.json())

.then(data => {  
    console.log(data);
    if (data == 'fail')
        return;
    document.getElementById("user_id").value = data[0];
    stop_current_sound();
    playAudio("otbor_result.ogg",false);

   

})
.catch(error => {
console.error('Ошибка:', error);
});
}


/** Показывает результаты интерактива. */
function show_result_interactive(){
     var action
    
        action = "show"
    fetch('/show_result_interactive', {
        method: 'POST',
        body: JSON.stringify({ action:action}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    console.log(data);
    if (data == 'fail')
        return;
  

   

})
.catch(error => {
console.error('Ошибка:', error);
});
}
/** Показывает общий итог игры. */
function show_result_total(){
     var action
    
        action = "show total"
    fetch('/show_result_interactive', {
        method: 'POST',
        body: JSON.stringify({ action:action}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    console.log(data);
    if (data == 'fail')
        return;
  

   

})
.catch(error => {
console.error('Ошибка:', error);
});
}

var time = 0;
function wait_1min(){
    time = 60;
    document.getElementById("au").value = "1:00";
    stop_current_sound();
    playAudio("wait_1min.ogg",false);
    socket.emit("wait_1_min")
    setTimeout(() => {
  timer_wait(time); 
}, 2000);
}

/** Показывает большой таймер ожидания 4:12. */
function wait_4_min(){
    time = 257;
   // inputName = document.createElement('input');
   // inputName.setAttribute('type', 'submit');
   // inputName.setAttribute('class', 'timer');
   // inputName.setAttribute('id', 'r0');
  //  inputName.setAttribute('value', "4:12");
   // document.getElementById("r0").value
    document.getElementById("au").value = "4:17";
    stop_current_sound();
    playAudio("4_20.ogg",false);
    socket.emit("wait_4_min")
    setTimeout(() => {
  timer_wait2(time); 
}, 1000);
}

/** Сервисный обратный отсчёт для spectator. */
function timer_wait2(time_all){
    if (time_all<=0)
    {
        return;
    }
    
    time_all = time_all -1
    min = parseInt(time_all/60)
    second = time_all%60;
    if (second<10)
    {
        document.getElementById("au").value = min.toString()+':'+'0'+second.toString();
        setTimeout(() => { timer_wait2(time_all); }, 1000);
        return;
    }
    document.getElementById("au").value = min.toString()+':'+second.toString();

    setTimeout(() => { timer_wait2(time_all); }, 1000);

}


function timer_wait(time_w){
    if (time_w<=0)
    {
        return;
    }
    time_w=time_w-1;
    if (time_w<10)
    {
        document.getElementById("au").value = '0:'+'0'+time_w.toString();
        setTimeout(() => { timer_wait(time_w); }, 1000);
        return;
    }
    if (time_w<60)
        document.getElementById("au").value = "0:"+time_w.toString();

    setTimeout(() => { timer_wait(time_w); }, 1000);

}
