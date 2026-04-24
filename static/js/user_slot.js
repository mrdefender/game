var welcome = document.getElementById("welcome");
welcome.innerText = "Добро пожаловать на игру";
var welcome2 = document.getElementById("welcome2");
welcome2.innerText = "Свободный слот!";

var timerStatus = setInterval(() => get_status(), 5000);
var timerHelps;
var timeWainAnswerFromMain;

function btn_default(){
    document.getElementById("o1").value = "1";
    document.getElementById("o2").value = "2";
    document.getElementById("o3").value = "3";
    document.getElementById("o4").value = "4";
    document.getElementById("o5").value = "5";
    document.getElementById("o6").value = "6";
    document.getElementById("o7").value = "7";
    document.getElementById("o8").value = "8";
    document.getElementById("o9").value = "9";
    document.getElementById("o10").value = "10";
    document.getElementById("o11").value = "11";
    document.getElementById("o12").value = "12";
    document.getElementById("o13").value = "13";
    document.getElementById("o14").value = "14";
    document.getElementById("o15").value = "15";
}

function setGameStatus(text, type = "wait") {
    const el = document.getElementById("welcome3");
    const panel = document.querySelector(".welcome-panel");
    const body = document.querySelector(".player-body");

    if (!el || !panel || !body) return;

    el.innerText = text;

    el.classList.remove("wait", "main", "interactive", "status-flash");
    panel.classList.remove("game-wait", "game-main", "game-interactive", "stage-flash");
    body.classList.remove("stage-focus");

    switch (type) {
        case "main":
            el.classList.add("main");
            panel.classList.add("game-main");
            body.classList.add("stage-focus");
            break;

        case "interactive":
            el.classList.add("interactive");
            panel.classList.add("game-interactive");
            body.classList.add("stage-focus");
            break;

        default:
            el.classList.add("wait");
            panel.classList.add("game-wait");
    }

    void el.offsetWidth;
    void panel.offsetWidth;

    el.classList.add("status-flash");
    panel.classList.add("stage-flash");
}

function sync_otbor_timer_ui() {
    const au = document.getElementById("au");
    const strip = document.getElementById("otborTimerStrip");
    const valueNode = document.getElementById("otborTimerValue");
    const fill = document.getElementById("otborTimerBarFill");
    const status = document.getElementById("otborTimerStatus");
   const otbor_timer_title = document.getElementById("otbor-timer-title");

    if (!au || !strip || !valueNode || !fill || !status) return;

    const isHidden = au.hidden;
    // Полностью повторяем поведение au
    strip.hidden = isHidden;
    valueNode.hidden = isHidden;
    fill.hidden = isHidden;
    status.hidden = isHidden;
    otbor_timer_title.hidden = isHidden;

    if (isHidden) {
        strip.classList.remove("warning", "danger");
        return;
    }

    const raw = parseInt(au.value || "0", 10);
    const max = 10;
    const safe = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(max, raw));
    const percent = (safe / max) * 100;

    valueNode.textContent = String(safe);
    fill.style.width = percent + "%";

    strip.classList.remove("warning", "danger");

    if (safe <= 0) {
        status.textContent = "Время вышло";
        strip.classList.add("danger");
    } else if (safe <= 3) {
        status.textContent = "Нужно ответить сейчас";
        strip.classList.add("danger");
    } else if (safe <= 5) {
        status.textContent = "Осталось мало времени";
        strip.classList.add("warning");
    } else {
        status.textContent = "Введите ответ и нажмите кнопку";
    }
}


function get_status(){

    var user_name = document.getElementById("user_name").value;
    fetch('/get_user_status', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

   
    if (data=="fail")
        return;
    if (data == "wait")
    {
         document.getElementById('welcome').innerHTML = "";
            document.getElementById('welcome2').innerHTML = "";
            setGameStatus("Ожидайте дальнейших указаний", "wait");
            document.getElementById("question").hidden = true;
            document.getElementById("question").value = "";
            document.getElementById("ex2").value ="0"
            document.getElementById("otbor_input").hidden = true;
            document.getElementById("otbor_submit").hidden = true;
	        document.getElementById("time-start").value = "0";
            btn_default();
            document.getElementById("o1").hidden = true;
            document.getElementById("o2").hidden = true;
            document.getElementById("o3").hidden = true;
            document.getElementById("o4").hidden = true;
            document.getElementById("o5").hidden = true;
            document.getElementById("o6").hidden = true;
            document.getElementById("o7").hidden = true;
            document.getElementById("o8").hidden = true;
            document.getElementById("o9").hidden = true;
            document.getElementById("o10").hidden = true;
            document.getElementById("o11").hidden = true;
            document.getElementById("o12").hidden = true;
            document.getElementById("o13").hidden = true;
            document.getElementById("o14").hidden = true;
            document.getElementById("o15").hidden = true;
            document.getElementById("p50_50").disabled = true;
            document.getElementById("palter").disabled = true;
            document.getElementById("pnavi").disabled = true;
            document.getElementById("px2").disabled = true;
            document.getElementById("pauden").disabled = true;
            document.getElementById("p50_50").hidden = true;
            document.getElementById("palter").hidden = true;
            document.getElementById("pnavi").hidden = true;
            document.getElementById("px2").hidden = true;
            document.getElementById("pauden").hidden = true;
             document.getElementById("pfact").hidden = true;
              document.getElementById("pfact").disabled = true;
            document.getElementById("question").value = "";
            document.getElementById("au").hidden = true;
            document.getElementById("ans").value = "";
            document.getElementById("question").innerText = " ";
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
            document.getElementById("otbor_input").value = "";
            sync_otbor_timer_ui();
            clearInterval(timerHelps);
            clearInterval(timeWainAnswerFromMain);
            clearInterval(timeWainAnswerFromMain);
            clearInterval(timeWainAnswerFromMain);
            clearInterval(timeWainAnswerFromMain);
            clearInterval(timeWainAnswerFromMain);clearInterval(timeWainAnswerFromMain);
    }
    if (data == "interactive")
        {
            document.getElementById("ans").value = "";
            btn_default();
            document.getElementById('welcome').innerHTML = "";
            document.getElementById('welcome2').innerHTML = "";
            setGameStatus("Интерактивная игра", "interactive");
            document.getElementById("question").hidden = false;
            document.getElementById("question").value = "";
            document.getElementById("question").innerText = " ";
	    document.getElementById("time-start").value = "0";
            document.getElementById("o1").hidden = false;
            document.getElementById("o2").hidden = false;
            document.getElementById("o3").hidden = false;
            document.getElementById("o4").hidden = false;
            document.getElementById("o5").hidden = false;
            document.getElementById("o6").hidden = false;
            document.getElementById("o7").hidden = false;
            document.getElementById("o8").hidden = false;
            document.getElementById("o9").hidden = false;
            document.getElementById("o10").hidden = false;
            document.getElementById("o11").hidden = false;
            document.getElementById("o12").hidden = false;
            document.getElementById("o13").hidden = false;
            document.getElementById("o14").hidden = false;
            document.getElementById("o15").hidden = false;
             document.getElementById("otbor_input").hidden = true;
            document.getElementById("otbor_submit").hidden = true;
            document.getElementById("au").hidden = true;
            sync_otbor_timer_ui();
            status_btn(true);
           
            //clearInterval(timerToGame);

        }
    if (data== "main")
        {
            document.getElementById("ans").value = "";
            document.getElementById('welcome').innerHTML = " ";
            document.getElementById('welcome2').innerHTML = " ";
            setGameStatus("Основная игра", "main");
            document.getElementById("question").hidden = false;
            document.getElementById("question").value = "";
            document.getElementById("question").innerText = " ";
            document.getElementById("time-start").value = "0";
            btn_default();
            document.getElementById("o1").hidden = false;
            document.getElementById("o2").hidden = false;
            document.getElementById("o3").hidden = false;
            document.getElementById("o4").hidden = false;
            document.getElementById("o5").hidden = false;
            document.getElementById("o6").hidden = false;
            document.getElementById("o7").hidden = false;
            document.getElementById("o8").hidden = false;
            document.getElementById("o9").hidden = false;
            document.getElementById("o10").hidden = false;
            document.getElementById("o11").hidden = false;
            document.getElementById("o12").hidden = false;
            document.getElementById("o13").hidden = false;
            document.getElementById("o14").hidden = false;
            document.getElementById("o15").hidden = false;
            document.getElementById("otbor_input").hidden = true;
            document.getElementById("otbor_submit").hidden = true;
            document.getElementById("au").hidden = true;
            sync_otbor_timer_ui();
            timerHelps = setInterval(() => get_helps(), 5000);
            status_btn(true);
            //clearInterval(timerToGame);
        }
    if ((data == "take money") || (data =="end interactive"))
    {
            status_btn(true);
    }
    if (data == "wait task interactive")
        {
            document.getElementById("ans").value = "";
            document.getElementById("question").value = "";
            document.getElementById("question").innerText = " ";
            document.getElementById("time-start").value = "0";
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
            btn_default();
            document.getElementById("question").value = " ";
            get_task();
            //clearInterval(timerToGame);
            
        }
    if (data == "wait task main")
        {
            document.getElementById("ans").value = "";
            document.getElementById("question").value = " ";
            document.getElementById("question").innerText = " ";
            document.getElementById("time-start").value = "0";
            btn_default();
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
            get_task();
            //clearInterval(timerToGame);
        }
    if (data == "given task interactive")
        {
            get_task();
            p50_50();
            palter();
            pnavi();
           // pauden();
            //clearInterval(timerToGame);
           // check_answered_main();
            timeWainAnswerFromMain = setInterval(() => check_answered_main(), 5000);
        }
    if (data == "given task main")
        {
            get_task();
            p50_50();
            palter();
            pnavi();
           // pauden();
        }
    if (data == "check main")
        {
            show_right_user();
        }
    if (data == "check main x2")
        {
            show_right_user();
        }
    if (data == "check interactive")
        {
            show_right_user();
        }
        if (data == "otbor")
        {
             document.getElementById('welcome').innerHTML = "";
            document.getElementById('welcome2').innerHTML = "";
            document.getElementById('welcome3').innerHTML = "Отборочный тур!";
            document.getElementById("question").hidden = false;
            document.getElementById("otbor_input").hidden = false;
            document.getElementById("otbor_submit").hidden = false;
            document.getElementById("au").hidden = false;
            sync_otbor_timer_ui();
            document.getElementById("question").value = "";
            document.getElementById("ex2").value ="0"
            document.getElementById("o1").hidden = true;
            document.getElementById("o2").hidden = true;
            document.getElementById("o3").hidden = true;
            document.getElementById("o4").hidden = true;
            document.getElementById("o5").hidden = true;
            document.getElementById("o6").hidden = true;
            document.getElementById("o7").hidden = true;
            document.getElementById("o8").hidden = true;
            document.getElementById("o9").hidden = true;
            document.getElementById("o10").hidden = true;
            document.getElementById("o11").hidden = true;
            document.getElementById("o12").hidden = true;
            document.getElementById("o13").hidden = true;
            document.getElementById("o14").hidden = true;
            document.getElementById("o15").hidden = true;
            document.getElementById("p50_50").disabled = true;
            document.getElementById("palter").disabled = true;
            document.getElementById("pnavi").disabled = true;
            document.getElementById("px2").disabled = true;
            document.getElementById("pauden").disabled = true;
            document.getElementById("p50_50").hidden = true;
            document.getElementById("palter").hidden = true;
            document.getElementById("pnavi").hidden = true;
            document.getElementById("px2").hidden = true;
            document.getElementById("pauden").hidden = true;
             document.getElementById("pfact").hidden = true;
              document.getElementById("pfact").disabled = true;
            document.getElementById("question").value = "";
            document.getElementById("ans").value = "";
            document.getElementById("question").innerText = " ";
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
            clearInterval(timerHelps);
            clearInterval(timeWainAnswerFromMain);
            clearInterval(timeWainAnswerFromMain);
            clearInterval(timeWainAnswerFromMain);
            clearInterval(timeWainAnswerFromMain);
            clearInterval(timeWainAnswerFromMain);clearInterval(timeWainAnswerFromMain);
            document.getElementById("otbor_input").value = "";
            get_task_otbor();
        }
        if (data == "warning otbor")
        {
            document.getElementById("au").value = "10";
            sync_otbor_timer_ui();
        }
        if (data == "start otbor")
        {

            
            if (document.getElementById("ex2").value == "start otbor")
                return;
            document.getElementById("ex2").value = "start otbor";
            document.getElementById("otbor_submit").disabled = false;
            document.getElementById("time-start").value = Date.now().toString();
            setTimeout(() => {timer_otbor(); }, 2000);
            
        }
        if (data == "otbor end")
        {
            document.getElementById("otbor_input").hidden = true;
            document.getElementById("otbor_submit").hidden = true;
            document.getElementById("au").hidden = true;
            document.getElementById("ex2").value = "0";
            sync_otbor_timer_ui();
            get_answer_otbor();
        }
        


        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}

function timer_otbor(){
    if (document.getElementById("au").value == "0")
    {
        document.getElementById("otbor_submit").disabled = true;
        sync_otbor_timer_ui();
        return;
    }

    document.getElementById("au").value =
        (parseInt(document.getElementById("au").value) - 1).toString();

    sync_otbor_timer_ui();

    setTimeout(() => { timer_otbor(); }, 1000);
}



function get_task_otbor(){
    var user_name = document.getElementById("user_name").value;
        fetch('/get_task_otbor', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data=="fail")
    {
       return; 
    }
    document.getElementById('question').innerText="Отборочный тур" +'\n'+ "Диапазон: " + data[1] + " - " + data[2] + '\n' +  "md5: " + data[4];  

})
.catch(error => {
console.error('Ошибка:', error);
});
}

function get_answer_otbor(){
    var user_name = document.getElementById("user_name").value;
        fetch('/get_task_otbor', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data=="fail")
    {
       return; 
    }
    document.getElementById('question').innerText= "Правильный ответ: " + data[3];  

})
.catch(error => {
console.error('Ошибка:', error);
});
}


function send_answer_otbor(){
     var user_name = document.getElementById("user_name").value;
     var ans_otbor = document.getElementById("otbor_input").value;
     try
     {
        var tmp = parseInt(ans_otbor);
     }
     catch (error)
     {
        document.getElementById("otbor_input").value = "0";
     }
     var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
        fetch('/send_answer_otbor', {
        method: 'POST',
        body: JSON.stringify({ user:user_name, ans_otbor:ans_otbor,time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data=="fail")
    {
       return; 
    }
    document.getElementById("otbor_submit").disabled = true;

})
.catch(error => {
console.error('Ошибка:', error);
});
}


function get_helps(){
        var user_name = document.getElementById("user_name").value;
        fetch('/get_helps', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data=="fail")
    {
        document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
       return;
    
    }

    if ((document.getElementById("ex2").value == "alter") || (document.getElementById("ex2").value == "x2"))
    {
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    return;
    }

    document.getElementById("p50_50").hidden = true;
    document.getElementById("palter").hidden = true;
    document.getElementById("pnavi").hidden = true;
    document.getElementById("px2").hidden = true;
    document.getElementById("pauden").hidden = true;
     document.getElementById("pfact").hidden = true;

    for (var i = 0; i<data.length;i++)
    {
        if (data[i]=="50:50")
            document.getElementById("p50_50").hidden = false;
        if (data[i]=="alter")
            document.getElementById("palter").hidden = false;
        if (data[i]=="navi")
            document.getElementById("pnavi").hidden = false;
        if (data[i]=="x2")
            document.getElementById("px2").hidden = false;
        if (data[i]=="help_auden")
            document.getElementById("pauden").hidden = false;
        if (data[i]=="fact")
            document.getElementById("pfact").hidden = false;
    }
    document.getElementById("p50_50").style.backgroundColor = "#000c11";
    document.getElementById("palter").style.backgroundColor = "#000c11"
    document.getElementById("pnavi").style.backgroundColor = "#000c11"
    document.getElementById("px2").style.backgroundColor = "#000c11"
    document.getElementById("pauden").style.backgroundColor = "#000c11"
    document.getElementById("pfact").style.backgroundColor = "#000c11"
    


})
.catch(error => {
console.error('Ошибка:', error);
});
    }

function get_task(){
    var user_name = document.getElementById("user_name").value;
    fetch('/get_task_user', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    

    if (data == "fail")
    {
        return;
    }
    if (document.getElementById("ex2").value !="0")
        return;
    if (document.getElementById("time-start").value == "0")
	{
    	document.getElementById("time-start").value = Date.now().toString();
	}
    document.getElementById('question').innerText ="Раунд "+data[0]+'\n'+"md5: "+data[2] + '\n' + "Количество фаталов: "+ data[3];
    document.getElementById("o1").disabled = false;
    document.getElementById("o2").disabled = false;
    document.getElementById("o3").disabled = false;
    document.getElementById("o4").disabled = false;
    document.getElementById("o5").disabled = false;
    document.getElementById("o6").disabled = false;
    document.getElementById("o7").disabled = false;
    document.getElementById("o8").disabled = false;
    document.getElementById("o9").disabled = false;
    document.getElementById("o10").disabled = false;
    document.getElementById("o11").disabled = false;
    document.getElementById("o12").disabled = false;
    document.getElementById("o13").disabled = false;
    document.getElementById("o14").disabled = false;
    document.getElementById("o15").disabled = false;
    if (data[0]<=3)
    {
            
        if (document.getElementById("p50_50").hidden == false)
            document.getElementById("p50_50").disabled = true;
        if (document.getElementById("palter").hidden == false)
            document.getElementById("palter").disabled = true;
        if (document.getElementById("pnavi").hidden == false)
            document.getElementById("pnavi").disabled = true;
        if (document.getElementById("px2").hidden == false)
            document.getElementById("px2").disabled = true;
        if (document.getElementById("pauden").hidden == false)
            document.getElementById("pauden").disabled = true;
        if (document.getElementById("p50_50").hidden == false)
            document.getElementById("p50_50").disabled = true;
        if (document.getElementById("pfact").hidden == false)
            document.getElementById("pfact").disabled = true;
    }
    if (data[0]>3)
    {
        if (document.getElementById("p50_50").hidden == false)
            document.getElementById("p50_50").disabled = false;
        if (document.getElementById("palter").hidden == false)
            document.getElementById("palter").disabled = false;
        if (document.getElementById("pnavi").hidden == false)
            document.getElementById("pnavi").disabled = false;
        if (document.getElementById("px2").hidden == false)
            document.getElementById("px2").disabled = false;
        if (document.getElementById("pauden").hidden == false)
            document.getElementById("pauden").disabled = false;
        if (document.getElementById("pfact").hidden == false)
            document.getElementById("pfact").disabled = false;
        

    }
    

    if (document.getElementById("o1").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o2").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o3").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o4").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o5").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o6").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o7").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o8").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o9").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o10").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o11").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o12").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o13").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o14").style.backgroundColor == "orange")
        return;
    if (document.getElementById("o15").style.backgroundColor == "orange")
        return;
    if (document.getElementById("p50_50").style.backgroundColor == "orange")
        return
    if (document.getElementById("palter").style.backgroundColor == "orange")
        return
    if (document.getElementById("pnavi").style.backgroundColor == "orange")
        return
    if (document.getElementById("pfact").style.backgroundColor == "orange")
        return
    if (document.getElementById("pauden").style.backgroundColor == "orange")
        return

     

    status_btn (false);
    document.getElementById("count_fatal").value = data[3].toString();
    

        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}

function check_answered_main(){
    var user_name = document.getElementById("user_name").value;
    var inter = false;
    clearInterval(timeWainAnswerFromMain);
    if (timeWainAnswerFromMain == undefined)
        return;
    if (document.getElementById("welcome3").innerHTML=="Интерактивная игра")
        inter = true;
    fetch('/check_answered_main', {
        method: 'POST',
        body: JSON.stringify({ user:user_name, inter:inter}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    if (data == "ok")
    {
        status_btn(true);
        clearInterval(timeWainAnswerFromMain);
        timeWainAnswerFromMain = undefined;
       
       // timeWainAnswerFromMain = undefined;
    }
    
})

.catch(error => {
console.error('Ошибка:', error);
});
}

function status_btn(it_disable)
{
    
    btn1 = document.getElementById("o1");
    btn1.disabled = it_disable;
    btn2 = document.getElementById("o2");
    btn2.disabled = it_disable;
    btn3 = document.getElementById("o3");
    btn3.disabled = it_disable;
    btn4 = document.getElementById("o4");
    btn4.disabled = it_disable;
    btn5 = document.getElementById("o5");
    btn5.disabled = it_disable;
    btn6 = document.getElementById("o6");
    btn6.disabled = it_disable;
    btn7 = document.getElementById("o7");
    btn7.disabled = it_disable;
    btn8 = document.getElementById("o8");
    btn8.disabled = it_disable;
    btn9 = document.getElementById("o9");
    btn9.disabled = it_disable;
    btn10 = document.getElementById("o10");
    btn10.disabled = it_disable;
    btn11 = document.getElementById("o11");
    btn11.disabled = it_disable;
    btn12 = document.getElementById("o12");
    btn12.disabled = it_disable;
    btn13 = document.getElementById("o13");
    btn13.disabled = it_disable;
    btn14 = document.getElementById("o14");
    btn14.disabled = it_disable;
    btn15 = document.getElementById("o15");
    btn15.disabled = it_disable;
}

function a1(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    var user_name = document.getElementById("user_name").value;
    document.getElementById("ans").value = "o1";
    document.getElementById("o1").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"1",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a2(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o2";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o2").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"2",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a3(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o3";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o3").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"3",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a4(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o4";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o4").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"4",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a5(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o5";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o5").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"5",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a6(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o6";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o6").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"6",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a7(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o7";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o7").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"7",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a8(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o8";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o8").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"8",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}
function a9(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o9";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o9").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"9",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a10(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o10";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o10").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"10",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a11(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o11";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o11").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"11",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a12(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o12";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o12").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"12",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a13(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o13";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o13").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"13",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
     document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a14(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o14";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o14").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"14",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
    document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a15(){
    if (document.getElementById("ex2").value == "x2-2")
        document.getElementById("ex2").value = ""
    document.getElementById("ans").value = "o15";
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o15").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseFloat(document.getElementById("time-start").value))/1000;
    fetch('/send_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name,answer_user:"15",time_answer:time_answer}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
    document.getElementById("pfact").disabled = true;
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}


function show_right_user(){
    
    var user_name = document.getElementById("user_name").value;
    fetch('/check_answer', {
        method: 'POST',
        body: JSON.stringify({ user:user_name, double: "0"}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    if (data[0] == 1)
    {
        f = data[1].toString()
        a = get_o(f)
        document.getElementById(a).style.backgroundColor = "red";
        for (var i = 1; i<16;i++)
        {
            b = i.toString();
            bb = get_o(b)
            if (document.getElementById(bb).style.backgroundColor == 'orange')
            {
                document.getElementById(bb).style.backgroundColor = 'green';
            break;
            }
        }
    }
    if (data[0]>1)
    {
        if (document.getElementById("ex2").value == "x2-2")
            return;
        b_bomb = data[4]
        r_bomb = data[5]


        if (document.getElementById("ex2").value == "x2")
        {
			document.getElementById("px2")?.classList.remove("is-active");
			document.getElementById("px2")?.classList.add("used");
            document.getElementById("ex2").value ="x2-2";
            if (data[0]<4)
                return;
            ff = data[1];
            c_ff = data[3];
            ans_u = document.getElementById("ans").value;
            for (var i = 0; i<c_ff;i++)
            {
                if (document.getElementById("ans").value == get_o(ff[i].toString()))
                {
                    document.getElementById(get_o(ff[i].toString())).style.backgroundColor = "red";
                    if ((data[4]!="false") && (data[5]!="false"))
                    {
                        if (ff[i] == data[4])
                        {
                        document.getElementById(get_o(ff[i].toString())).value = "💣";
                        }
                        if (ff[i] == data[5])
                        {
                        document.getElementById(get_o(ff[i].toString())).value = "🧨";
                        }
                    }

                    break;
                }

            }
            
            if (document.getElementById(ans_u).style.backgroundColor == "red")
            {
                for (var i =1; i<16;i++)
                {
                    if (get_o(i.toString())!=ans_u)
                    document.getElementById(get_o(i.toString())).disabled = false;
                }
                return;
            }
        }

        f = data[1]
        for (var i = 0; i<data[3];i++)
        {
            var a = get_o(f[i])
            document.getElementById(a).style.backgroundColor = "red"
            if ((data[4]!="false") && (data[5]!="false"))
            {
                if (f[i]==data[4])
                {
                    document.getElementById(a).value = "💣";
                }
                if (f[i]==data[5])
                {
                    document.getElementById(a).value = "🧨";
                }
            }
            
        }
        for (var i = 1; i<16;i++)
        {
            b = i.toString();
            bb = get_o(b);
            if (document.getElementById(bb).style.backgroundColor == 'orange')
            {
                document.getElementById(bb).style.backgroundColor = 'green';
            break;
            }
        }
        
        document.getElementById("ex2").value ="0"
		try
		{
			document.getElementById("px2")?.classList.remove("used");
		}
		catch (error)
		{
			
		}
    }



})

.catch(error => {
console.error('Ошибка:', error);
});


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



function can_activate_help(helpName) {
    var ex2 = document.getElementById("ex2").value;

    // После Альтернативы другие подсказки брать нельзя
    if (ex2 === "alter") return false;

    // После x2 другие подсказки брать нельзя
    if (ex2 === "x2" || ex2 === "x2-2") return false;

    return true;
}

function play5050ShowEffect(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove("show5050-flash", "show5050-split", "show5050-pulse");

  // перезапуск анимации
  void el.offsetWidth;

  el.classList.add("show5050-flash");
  el.classList.add("show5050-split");
  el.classList.add("show5050-pulse");

  setTimeout(() => el.classList.remove("show5050-flash"), 560);
  setTimeout(() => el.classList.remove("show5050-split"), 720);
  setTimeout(() => el.classList.remove("show5050-pulse"), 820);
}

function p50_50(){
         if (!can_activate_help("50:50"))
        return;

var user_name = document.getElementById("user_name").value;
	
     //document.getElementById("p50_50").style.backgroundColor = "orange";
     //document.getElementById("ex2").value = "50:50"
    fetch('/get_50_50', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    for (var i=0;i<data.length;i++)
    {
        ff = data[i].toString();
        document.getElementById(get_o(ff)).disabled = true;
    }
     document.getElementById("p50_50").style.backgroundColor = "orange";
     play5050ShowEffect("p50_50");
     document.getElementById("ex2").value = "50:50"
   



})

.catch(error => {
console.error('Ошибка:', error);
});

}

function palter(){
         if (!can_activate_help("alter"))
        return;

var user_name = document.getElementById("user_name").value;
   //  document.getElementById("palter").style.backgroundColor = "orange";
    // document.getElementById("ex2").value = "alter"
    fetch('/get_alter', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    status_btn(true);
    
    b1 = data[0].toString();
    b2 = data[1].toString();

    document.getElementById(get_o(b1)).disabled = false;
    document.getElementById(get_o(b2)).disabled = false;
    document.getElementById("palter").style.backgroundColor = "orange";
     document.getElementById("ex2").value = "alter"
     play5050ShowEffect("palter");


})

.catch(error => {
console.error('Ошибка:', error);
});

}

function pnavi(){
        if (!can_activate_help("navi"))
        return;

var user_name = document.getElementById("user_name").value;
    // document.getElementById("pnavi").style.backgroundColor = "orange";
    // document.getElementById("ex2").value = "navi"
    fetch('/get_navi', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    
    for (var i = 0;i<data.length;i++)
    {
        n = data[i];
        document.getElementById(get_o(n)).style.backgroundColor = "#d905ec"
    }
    document.getElementById("pnavi").style.backgroundColor = "orange";
    document.getElementById("ex2").value = "navi";
    play5050ShowEffect("pnavi");


})

.catch(error => {
console.error('Ошибка:', error);
});

}
function px2(){

        if (!can_activate_help("x2"))
        return;
	

var user_name = document.getElementById("user_name").value;
     document.getElementById("px2").style.backgroundColor = "orange";
     document.getElementById("ex2").value = "x2"
    fetch('/get_x2', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
	document.getElementById("px2")?.classList.add("is-active");
    play5050ShowEffect("px2");


})

.catch(error => {
console.error('Ошибка:', error);
});


}

function pauden(){
        if (!can_activate_help("pauden"))
        return;

document.getElementById("pauden").style.backgroundColor = "orange";
    var user_name = document.getElementById("user_name").value;
     fetch('/get_auden', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    play5050ShowEffect("pauden");


})

.catch(error => {
console.error('Ошибка:', error);
});

}

function pfact(){
    
        if (!can_activate_help("pfact"))
        return;

document.getElementById("pfact").style.backgroundColor = "orange";
    var user_name = document.getElementById("user_name").value;
     fetch('/get_fact', {
        method: 'POST',
        body: JSON.stringify({ user:user_name}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }
    play5050ShowEffect("pfact");


})

.catch(error => {
console.error('Ошибка:', error);
});

}
