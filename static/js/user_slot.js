var welcome = document.getElementById("welcome");
welcome.innerText = "Добро пожаловать на игру";
var welcome2 = document.getElementById("welcome2");
welcome2.innerText = "Свободный слот!";

var timerStatus = setInterval(() => get_status(), 5000);
var timerHelps;
var timeWainAnswerFromMain;

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
            document.getElementById('welcome3').innerHTML = "Ожидайте дальнейших указаний!";
            document.getElementById("question").hidden = true;
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
            document.getElementById("question").value = "";
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
    }
    if (data == "interactive")
        {
            document.getElementById('welcome').innerHTML = "";
            document.getElementById('welcome2').innerHTML = "";
            document.getElementById('welcome3').innerHTML = "Интерактивная игра";
            document.getElementById("question").hidden = false;
            document.getElementById("question").value = "";
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
            status_btn(true);
           
            //clearInterval(timerToGame);

        }
    if (data== "main")
        {
            document.getElementById('welcome').innerHTML = " ";
            document.getElementById('welcome2').innerHTML = " ";
            document.getElementById('welcome3').innerHTML = "Основная игра";
            document.getElementById("question").hidden = false;
            document.getElementById("question").value = "";
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
            document.getElementById("question").value = "";
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
            get_task();
            //clearInterval(timerToGame);
            
        }
    if (data == "wait task main")
        {
            document.getElementById("question").value = "";
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
            get_task();
            //clearInterval(timerToGame);
        }
    if (data == "given task interactive")
        {
            get_task();
            //clearInterval(timerToGame);
            timeWainAnswerFromMain = setInterval(() => check_answered_main(), 5000);
        }
    if (data == "given task main")
        {
            get_task();
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

        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
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
       return;
    
    }

    if ((document.getElementById("ex2").value == "alter") || (document.getElementById("ex2").value == "x2"))
    {
    document.getElementById("p50_50").disabled = true;
    document.getElementById("palter").disabled = true;
    document.getElementById("pnavi").disabled = true;
    document.getElementById("px2").disabled = true;
    document.getElementById("pauden").disabled = true;
    return;
    }

    document.getElementById("p50_50").hidden = true;
    document.getElementById("palter").hidden = true;
    document.getElementById("pnavi").hidden = true;
    document.getElementById("px2").hidden = true;
    document.getElementById("pauden").hidden = true;

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
    }
    document.getElementById("p50_50").style.backgroundColor = "#000c11";
    document.getElementById("palter").style.backgroundColor = "#000c11"
    document.getElementById("pnavi").style.backgroundColor = "#000c11"
    document.getElementById("px2").style.backgroundColor = "#000c11"
    document.getElementById("pauden").style.backgroundColor = "#000c11"


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
    document.getElementById("time-start").value = Date.now().toString();
    document.getElementById('question').innerText = "md5: "+data[2] + '\n' + "Количество фаталов: "+ data[3];
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
        if (document.getElementById("p50_50").hidden == false)
            document.getElementById("p50_50").disabled = false;
        

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
        console.log(timeWainAnswerFromMain)
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
    var user_name = document.getElementById("user_name").value;
    document.getElementById("o1").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a2(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o2").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a3(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o3").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a4(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o4").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a5(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o5").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a6(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o6").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a7(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o7").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a8(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o8").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}
function a9(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o9").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a10(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o10").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a11(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o11").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a12(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o12").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a13(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o13").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a14(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o14").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
    status_btn(true);
    clearInterval(timeWainAnswerFromMain);
})

.catch(error => {
console.error('Ошибка:', error);
});

}

function a15(){
     var user_name = document.getElementById("user_name").value;
    document.getElementById("o15").style.backgroundColor = "orange";
    var time_answer = (Date.now() - parseInt(document.getElementById("time-start").value))/1000;
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
        if (document.getElementById("ex2").value == "x2")
        {
            document.getElementById("ex2").value ="0";
                   
        return;
        }

        f = data[1]
        for (var i = 0; i<data[3];i++)
        {
            var a = get_o(f[i])
            document.getElementById(a).style.backgroundColor = "red"
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


function p50_50(){

     var user_name = document.getElementById("user_name").value;
     document.getElementById("p50_50").style.backgroundColor = "orange";
     document.getElementById("ex2").value = "50:50"
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
   



})

.catch(error => {
console.error('Ошибка:', error);
});

}

function palter(){
     var user_name = document.getElementById("user_name").value;
     document.getElementById("palter").style.backgroundColor = "orange";
     document.getElementById("ex2").value = "alter"
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



})

.catch(error => {
console.error('Ошибка:', error);
});

}

function pnavi(){
    var user_name = document.getElementById("user_name").value;
     document.getElementById("pnavi").style.backgroundColor = "orange";
     document.getElementById("ex2").value = "navi"
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
    


})

.catch(error => {
console.error('Ошибка:', error);
});

}
function px2(){

    var user_name = document.getElementById("user_name").value;
     document.getElementById("px2").style.backgroundColor = "orange";
     document.getElementById("ex2").value = "nx2"
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


})

.catch(error => {
console.error('Ошибка:', error);
});


}

function pauden(){

}
