/**
 * SPECTATOR SLOT SCRIPT
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
 * === ГЛОБАЛЬНОЕ СОСТОЯНИЕ И POLLING SPECTATOR ===
 * Spectator обновляется через таймеры и backend-состояния.
 * Здесь важно не менять имена функций и id элементов.
 */
//var timerStatus = setInterval(() => update_list_user(), 1500);
//var timerHelps;
//var timeWainAnswerFromMain;
//var timerTreeStatus = setInterval(() => update_tree(), 3000);
const socket = io();

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  socket.emit("ping:test", {
    page: window.location.pathname
  });
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("pong:test", (data) => {
  console.log("Ответ от сервера:", data);
});


socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  socket.emit("room:join", {
    room: "99999999",
    role: "spectator",
    username: "spectator"
  });
});

socket.on("room:joined", (data) => {
  console.log("Joined socket room:", data);
});

socket.on("updated_round", (data) => {
    console.log("Раунд:", data);
  update_round(data);
});
socket.on("updated_fix", (data) => {
    console.log("Несгораяемая сумма:", data);
  update_fix(data);
});
socket.on("updated_script", (data) => {
    console.log("Сценарий:", data);
  update_script(data);
});

socket.on("wait_4min", (data) => {
    wait_4min();
})

socket.on("wait_1min", (data) => {
    wait_1min();
})

/** Показывает большой таймер ожидания 4:12. */
function wait_1min(){
    time = 60;
   // inputName = document.createElement('input');
   // inputName.setAttribute('type', 'submit');
   // inputName.setAttribute('class', 'timer');
   // inputName.setAttribute('id', 'r0');
  //  inputName.setAttribute('value', "4:12");
   // document.getElementById("r0").value
    document.getElementById("au").value = "1:00";
    setTimeout(() => {
  timer_wait(time); 
}, 1000);
}

/** Показывает большой таймер ожидания 4:12. */
function wait_4min(){
    time = 257;
   // inputName = document.createElement('input');
   // inputName.setAttribute('type', 'submit');
   // inputName.setAttribute('class', 'timer');
   // inputName.setAttribute('id', 'r0');
  //  inputName.setAttribute('value', "4:12");
   // document.getElementById("r0").value
    document.getElementById("au").value = "4:17";
    setTimeout(() => {
  timer_wait(time); 
}, 1000);
}

/** Сервисный обратный отсчёт для spectator. */
function timer_wait(time_all){
    if (time_all<=0)
    {
        setWait4MinStage(0);

    setTimeout(() => {
        clearWait4MinVisual();
        clearWait4MinStage();
        }, 900);
        document.getElementById('au').value = ""
        return;
    }
    time_all = time_all -1
    min = parseInt(time_all/60)
    second = time_all%60;
    if (second<10)
    {
        document.getElementById("au").value = min.toString()+':'+'0'+second.toString();
        setTimeout(() => { timer_wait(time_all); }, 1000);
        return;
    }
    document.getElementById("au").value = min.toString()+':'+second.toString();
    syncWait4MinVisual(time_all);
    setWait4MinStage(time_all);

    setTimeout(() => { timer_wait(time_all); }, 1000);

}

function syncWait4MinVisual(secondsLeft) {
    const au = document.getElementById("au");
    const wrap = document.querySelector(".au-wrap");

    if (!au || !wrap) return;

    wrap.classList.add("wait-4min-mode");
    au.classList.add("wait-4min-active");

    if (secondsLeft <= 30 && secondsLeft > 0) {
        au.classList.add("wait-4min-danger");
    } else {
        au.classList.remove("wait-4min-danger");
    }
}

function clearWait4MinVisual() {
    const au = document.getElementById("au");
    const wrap = document.querySelector(".au-wrap");

    if (!au || !wrap) return;

    wrap.classList.remove("wait-4min-mode");
    au.classList.remove("wait-4min-active", "wait-4min-danger");
}

function setWait4MinStage(secondsLeft) {
    document.body.classList.add("wait-4min-focus");

    if (secondsLeft <= 30 && secondsLeft > 0) {
        document.body.classList.add("wait-4min-ending");
    } else {
        document.body.classList.remove("wait-4min-ending");
    }

    if (secondsLeft <= 0) {
        document.body.classList.add("wait-4min-freeze");
    } else {
        document.body.classList.remove("wait-4min-freeze");
    }
}

function clearWait4MinStage() {
    document.body.classList.remove(
        "wait-4min-focus",
        "wait-4min-ending",
        "wait-4min-freeze"
    );
}



/** Возвращает кнопки ответов зрительского экрана в базовое состояние. */
function btn_default(){
    document.getElementById("o1").value = "1";
    document.getElementById("o1").classList.remove("wrong");
    document.getElementById("o1").classList.remove("right");
    document.getElementById("o2").value = "2";
    document.getElementById("o2").classList.remove("wrong");
    document.getElementById("o2").classList.remove("right");
    document.getElementById("o3").value = "3";
    document.getElementById("o3").classList.remove("wrong");
    document.getElementById("o3").classList.remove("right");
    document.getElementById("o4").value = "4";
    document.getElementById("o4").classList.remove("wrong");
    document.getElementById("o4").classList.remove("right");
    document.getElementById("o5").value = "5";
    document.getElementById("o5").classList.remove("wrong");
    document.getElementById("o5").classList.remove("right");
    document.getElementById("o6").value = "6";
    document.getElementById("o6").classList.remove("wrong");
    document.getElementById("o6").classList.remove("right");
    document.getElementById("o7").value = "7";
    document.getElementById("o7").classList.remove("wrong");
    document.getElementById("o7").classList.remove("right");
    document.getElementById("o8").value = "8";
    document.getElementById("o8").classList.remove("wrong");
    document.getElementById("o8").classList.remove("right");
    document.getElementById("o9").value = "9";
    document.getElementById("o9").classList.remove("wrong");
    document.getElementById("o9").classList.remove("right");
    document.getElementById("o10").value = "10";
    document.getElementById("o10").classList.remove("wrong");
    document.getElementById("o10").classList.remove("right");
    document.getElementById("o11").value = "11";
    document.getElementById("o11").classList.remove("wrong");
    document.getElementById("o11").classList.remove("right");
    document.getElementById("o12").value = "12";
    document.getElementById("o12").classList.remove("wrong");
    document.getElementById("o12").classList.remove("right");
    document.getElementById("o13").value = "13";
    document.getElementById("o13").classList.remove("wrong");
    document.getElementById("o13").classList.remove("right");
    document.getElementById("o14").value = "14";
    document.getElementById("o14").classList.remove("wrong");
    document.getElementById("o14").classList.remove("right");
    document.getElementById("o15").value = "15";
    document.getElementById("o15").classList.remove("wrong");
    document.getElementById("o15").classList.remove("right");

}


socket.on("updated_list_user_spec", (data) =>{
    update_list_user(data)
})

/** Основной polling spectator UI через backend. */
function update_list_user(data)
{
    //fetch('/update_for_spec', {
     //   method: 'POST',
     //   body: JSON.stringify({ "":""}),
    //    headers: {
    //        'Content-Type': 'application/data'
       // }
    //}
//)
//.then(response => response.json())

//.then(data => {
    console.log(data)
    

    if (data == "fail")
    {
        return;
    }

    
    if (data == "wait")
        {
            try
            {
                var ind = 0;
		document.getElementById('r').remove()
                while (true)
                {
                    let result_button = document.getElementById('r'+ind.toString())
                    result_button.remove();
                    ind++;
                }
            }
            catch (error)
            {

            }
            btn_default();
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
            document.getElementById("in_game").value = " ";
            document.getElementById("user").value = "";
            document.getElementById("au").value = "";
            document.getElementById("ans").value = "";
            document.getElementById("current").value = "0";
            document.getElementById("fix").value = "0";
            document.getElementById("question").hidden = true;
            document.getElementById("question").value = " ";
            document.getElementById('question').innerText = " ";
            document.getElementById("ex2").value = "0";
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
            document.getElementById("p50_50").hidden = true;
            document.getElementById("palter").hidden = true;
            document.getElementById("pnavi").hidden = true;
            document.getElementById("px2").hidden = true;
            document.getElementById("pauden").hidden = true;
             document.getElementById("pfact").hidden = true;
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
            document.getElementById("p50_50").style.backgroundColor = "#000c11";
            document.getElementById("palter").style.backgroundColor = "#000c11";
            document.getElementById("pnavi").style.backgroundColor = "#000c11";
            document.getElementById("px2").style.backgroundColor = "#000c11";
            document.getElementById("pauden").style.backgroundColor = "#000c11";
             document.getElementById("pfact").style.backgroundColor = "#000c11";           
            return;
    }
     if (data[0] == "main")
        {
             try
            {
                var ind = 0;
		        document.getElementById('r').remove();
                while (true)
                {
                    let result_button = document.getElementById('r'+ind.toString())
                    result_button.remove();
                    ind++;
                }
            }
            catch (error)
            {

            }
            document.getElementById("in_game").value = "В игре: " + data[1]
            document.getElementById("au").value = "В игру вступает:" +'\n'+ data[1];
            document.getElementById("user").value = data[1]
            document.getElementById("question").hidden = false;
            document.getElementById("question").value = " ";
            document.getElementById('question').innerText = "";
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
            btn_default();
            document.getElementById("ans").value = ""
            document.getElementById("ex2").value = "0"
            document.getElementById("p50_50").disabled = false;
            document.getElementById("palter").disabled = false;
            document.getElementById("pnavi").disabled = false;
            document.getElementById("px2").disabled = false;
            document.getElementById("pauden").disabled = false;
            document.getElementById("p50_50").hidden = false;
            document.getElementById("palter").hidden = false;
            document.getElementById("pnavi").hidden = false;
            document.getElementById("px2").hidden = false;
            document.getElementById("pauden").hidden = false;
             document.getElementById("pfact").hidden = false;
              document.getElementById("pfact").disabled = false;
            document.getElementById("question").value = " ";
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
            for (var i =1; i<16;i++)
            {
                document.getElementById(get_o(i.toString())).value = i;
            }

            return;
            
    }
    
    if (data[0] == "wait task main")
    {
        btn_default()
       // document.getElementById("au").value = "";
        document.getElementById("ex2").value = "0";
        document.getElementById("ans").value = "";
        document.getElementById("au").value = " "
        document.getElementById('question').innerText = "";
	document.getElementById('question').value = "";
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
        for (var i =1; i<16;i++)
            {
                document.getElementById(get_o(i.toString())).value = i;
            }
       // get_task();
       // get_helps();
        return;
    }
        if ((data[0] == "given task main") || (data[0] == "x2" ))
    {
       // if ((document.getElementById("ex2").value != "auden") && (document.getElementById("ex2").value != "fact"))
         //   document.getElementById("au").value = "";
        //document.getElementById("question").value = "";
       // get_task();
       // get_helps();
       // get_fact();
       // get_auden();
       // get_50_50();
       // get_alter();
       // get_navi();
       
    }

    if ((data[0] == "answered main") || (data[0] == "answered main x2"))
    {
        
       // answered_main();
        //return;

        
    }
    if ((data[0] == "check main") || (data[0] == "check main x2") || (data[0] == "wait next round main"))
    {
       // check_answered();
        //document.getElementById("au").value = " ";
        //document.getElementById("question").value = " ";
       // return;
    }

    if (data[0] == "game over lose")
    {
       // calc_total();
        an = document.getElementById("ans").value;
        if ((document.getElementById(an).value == "💣") || (document.getElementById(an).value == "🧨"))
        {
            document.getElementById("au").value ="Выигрыш:" +'\n'+ "0";
            return;
        }
        document.getElementById("au").value ="Выигрыш:" +'\n'+ calc_total();// document.getElementById("fix").value;
        //document.getElementById("question").value = "";
       // document.getElementById("question").innerText = " ";
        return;
    }
    if (data[0] == "game over")
    {
        document.getElementById("au").value ="Выигрыш:" +'\n'+ document.getElementById("current").value;
    //    document.getElementById("question").value = "";
        //document.getElementById("question").innerText = " ";
        return;
    }

    if (data[0] == "50:50")
    {
       //get_50_50();
        //return;
    }
     if (data[0] == "alter")
    {

      //  get_alter();
       // return;
    }
    if (data[0] == "navi")
    {

      //  get_navi();
       // return;
    }

    if (data[0] == "x2")
    {

        //get_x2();
        //return;
    }
    if (data[0] == "auden")
    {

       // get_auden();
        return;
    }
    if (data[0] == "fact")
    {

        //get_fact();
        //return;
    }
    if (data[0] == "otbor")
    {

        document.getElementById("in_game").value = "Отборочный тур";
            document.getElementById("user").value = ""
            document.getElementById("au").value = ""
            document.getElementById("ans").value = ""
            //document.getElementById("question").value = " ";
           // document.getElementById('question').innerText = "";
            document.getElementById("ex2").value = "0"
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
            document.getElementById("p50_50").hidden = true;
            document.getElementById("palter").hidden = true;
            document.getElementById("pnavi").hidden = true;
            document.getElementById("px2").hidden = true;
            document.getElementById("pauden").hidden = true;
             document.getElementById("pfact").hidden = true;
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
            document.getElementById("p50_50").style.backgroundColor = "#000c11";
            document.getElementById("palter").style.backgroundColor = "#000c11";
            document.getElementById("pnavi").style.backgroundColor = "#000c11";
            document.getElementById("px2").style.backgroundColor = "#000c11";
            document.getElementById("pauden").style.backgroundColor = "#000c11";
             document.getElementById("pfact").style.backgroundColor = "#000c11";
        document.getElementById("question").hidden = false;
       // get_task_otbor();
        return;
    }
    if (data[0] == "warning otbor")
    {
        document.getElementById("au").value = "20";
    }
    if (data[0] == "start otbor")
    {
        if (document.getElementById("ex2").value == "start otbor")
                return;
            document.getElementById("ex2").value = "start otbor";
            setTimeout(() => {timer_otbor(); }, 1000);
    }
    if (data[0] == "otbor end")
        {
            
            //document.getElementById("au").hidden = true;
            document.getElementById("ex2").value = "0";
            get_answer_otbor();
         // show_winner_otbor();
        }
    if (data[0] == "winner otbor")
        {
           
           // show_winner_otbor();
        }
    if ((data[0][0] == "show result") || (data[0][0] == "show total result"))
    {
       if (document.getElementById("ex2").value == "show_result")
            return;
      if (data[0][0] == "show result")
	{
	    inputName = document.createElement('input');
            inputName.setAttribute('type', 'submit');
            inputName.setAttribute('class', 'result_otbor');
            inputName.setAttribute('id', 'r');
            inputName.setAttribute('innerText', 'Результаты интерактивной игры');
            inputName.setAttribute('value','Результаты интерактивной игры');
            document.body.appendChild(inputName);
	}
      if (data[0][0] == "show total result")
        {
            inputName = document.createElement('input');
            inputName.setAttribute('type', 'submit');
            inputName.setAttribute('class', 'result_otbor');
            inputName.setAttribute('id', 'r');
            inputName.setAttribute('innerText', 'Общий результат игры');
            inputName.setAttribute('value','Общий результат игры');
            document.body.appendChild(inputName);
        }
        for (var i = 0; i < data.length; i++)
{
    const row = document.createElement('div');

    row.className = 'result_otbor result-row';
    row.id = 'r' + i.toString();

    row.innerHTML = `
        <span class="result-place">${i + 1}.</span>
        <span class="result-name">${data[i][1]}</span>
        <span class="result-score">${Number(data[i][2] ?? 0).toLocaleString("ru")}</span>
    `;
    if (i === 0) {
    row.classList.add("result-top1");
}
    document.body.appendChild(row);
}
        document.getElementById("ex2").value = "show_result";

    }

    


//})
//.catch(error => {
//console.error('Ошибка:', error);
//});
}


function calc_total()
{
    var calc_fix = 0;
    var calc_cur = 0;
    if (document.getElementById("fix").value == "0" )
        calc_fix = 0;
    if (document.getElementById("fix").value == "1 000" )
        calc_fix = 1000;
    if (document.getElementById("fix").value == "3 000" )
        calc_fix = 3000;
    if (document.getElementById("fix").value == "5 000" )
        calc_fix = 5000;
    if (document.getElementById("fix").value == "10 000" )
        calc_fix = 10000;
    if (document.getElementById("fix").value == "25 000" )
        calc_fix = 25000;
    if (document.getElementById("fix").value == "50 000" )
        calc_fix = 50000;
    if (document.getElementById("fix").value == "150 000" )
        calc_fix = 150000;
    if (document.getElementById("fix").value == "500 000" )
        calc_fix = 500000;
    if (document.getElementById("current").value == "0" )
        calc_cur = 0;
    if (document.getElementById("current").value == "1 000" )
        calc_cur = 1000;
    if (document.getElementById("current").value == "3 000" )
        calc_cur = 3000;
    if (document.getElementById("current").value == "5 000" )
        calc_cur = 5000;
    if (document.getElementById("current").value == "10 000" )
        calc_cur = 10000;
    if (document.getElementById("current").value == "25 000" )
        calc_cur = 25000;
    if (document.getElementById("current").value == "50 000" )
        calc_cur = 50000;
    if (document.getElementById("current").value == "150 000" )
        calc_cur = 150000;
    if (document.getElementById("current").value == "500 000" )
        calc_cur = 500000;
    if (calc_cur<calc_fix)
        return "0"
    if (calc_cur>=calc_fix)
        return document.getElementById("fix").value


}

socket.on("get_task_otbor", (data) => {
    get_task_otbor(data)
})

function get_task_otbor(data){
       // fetch('/get_task_otbor', {
      //  method: 'POST',
       // body: JSON.stringify({ "":""}),
       // headers: {
       //     'Content-Type': 'application/json'
       // }
    //}
//)
//.then(response => response.json())

//.then(data => {

    if (data=="fail")
    {
       return; 
    }
    document.getElementById('question').innerText="Отборочный тур"+'\n'+ "Диапазон: " + data[1] + " - " + data[2] + '\n' +  "md5: " + data[4];  

//})
//.catch(error => {
//console.error('Ошибка:', error);
//});
}


function timer_otbor(){
    if (document.getElementById("au").value == "0")
    {
        //document.getElementById("answer_otbor").disabled = false;
        return;
    }
    document.getElementById("au").value = (parseInt(document.getElementById("au").value)-1).toString();
    setTimeout(() => { timer_otbor(); 
}, 1000);

}

socket.on("get_answer_otbor", (data)=>{
    get_answer_otbor(data)
})

function get_answer_otbor(data){
       // fetch('/get_task_otbor', {
     //   method: 'POST',
       // body: JSON.stringify({ " ":" "}),
      //  headers: {
      //      'Content-Type': 'application/json'
      //  }
   // }
//)
//.then(response => response.json())

//.then(data => {
    console.log(data);

    if (data=="fail")
    {
       return; 
    }
    document.getElementById('question').innerText= "Правильный ответ: " + data[3];  

//})
//.catch(error => {
//console.error('Ошибка:', error);
//});
}

socket.on ("show_winner_otbor", (data) => {
    show_winner_otbor(data)
})

function show_winner_otbor(data){
    //fetch('/update_list_users', {
   //     method: 'POST',
    //    body: JSON.stringify({ " ":" "}),
     //   headers: {
     //       'Content-Type': 'application/json'
    //    }
   // }
//)
//.then(response => response.json())

//.then(data => {

    if (data=="fail")
    {
       return; 
    }
    
        if (document.getElementById("ex2").value == "show_result")
        {
            return;
        }
       
            inputName = document.createElement('input');
            inputName.setAttribute('type', 'submit');
            inputName.setAttribute('class', 'result_otbor');
            inputName.setAttribute('id', 'r');
            inputName.setAttribute('innerText', 'Результаты отборочного тура');
            inputName.setAttribute('value','Результаты отборочного тура');
            document.body.appendChild(inputName);
             
        for (var i = 0; i< data.length;i++)
        {
            inputName = document.createElement('input');
            inputName.setAttribute('type', 'submit');
            inputName.setAttribute('class', 'result_otbor');
            inputName.setAttribute('id', 'r'+i.toString());
            inputName.setAttribute('innerText', "Игрок: " + data[i][1]+ "      " +"Ответ: " + data[i][2]+ "      "+"Время: "+data[i][4]);
            inputName.setAttribute('value',"Игрок: " + data[i][1]+ "      " +"Ответ: " + data[i][2]+ "      "+"Время: "+data[i][4]);
            document.body.appendChild(inputName);
            if (data[i][2]=='0')
            {
                 document.getElementById('r'+i.toString()).disabled = true;
            }
            if (data[i][5]=="winner otbor")
            {
                document.getElementById('r'+i.toString()).classList.add("accepted")
            }
           
        }
        document.getElementById("ex2").value = "show_result";

    //for (var i =0 ;data.length;i++)
   // {
     //   if (data[i][5]=="winner otbor")
      //  {            
      //      document.getElementById("au").value ="Игрок: " + data[i][1]+ "      " +"Ответ: " + data[i][2]+ "      "+"Время: "+data[i][4];
      //      break;
      //  }
    //}



//})
//.catch(error => {
//console.error('Ошибка:', error);
//});

}

socket.on("answered_main", (data) => {
    answered_main(data)
})


function answered_main(data){
    //fetch('/answered_main_spec', {
    //    method: 'POST',
   ///     body: JSON.stringify({ " ":" "}),
     //   headers: {
      //      'Content-Type': 'application/json'
    //    }
   // }
//)
///.then(response => response.json())

//.then(data => {

      if (data == "fail")
    {
        return;
    }

    
    ans = data;
    document.getElementById("ans").value = ans;
    document.getElementById(ans).style.backgroundColor = "orange";
    if (document.getElementById("ex2").value=="x2-2")
        document.getElementById("ex2").value="0";
 
    
//})

//.catch(error => {
//console.error('Ошибка:', error);
//});
}


socket.on("answered_check_spec", (data) =>{
check_answered(data)
})

function check_answered(data){
    //fetch('/answered_check_spec', {
      //  method: 'POST',
      //  body: JSON.stringify({ " ":" "}),
      //  headers: {
       //     'Content-Type': 'application/json'
      //  }
    //}
//)
//.then(response => response.json())

//.then(data => {
    

   if (data == "fail")
    {
        return;
    }

    fa = data[1]
	
	

    if (document.getElementById("ex2").value=="x2-2")
	return;

    if (document.getElementById("ex2").value=="x2")
    {
        for (var i = 0; i< fa.length;i++)
    {
        id = get_o(fa[i].toString());
        if (id == ans)
        {
           document.getElementById(id).style.backgroundColor = "red";
           document.getElementById("ex2").value="x2-2"
           if ((data[4]!="false") && (data[5]!="false"))
           {
                if (fa[i]==data[4])
                    document.getElementById(id).value = "💣";
                if (fa[i]==data[5])
                    document.getElementById(id).value = "🧨";
           }
            return;
        }
        
       
    }
    }
    if (data[0] == 1)
        document.getElementById(get_o(data[1])).style.backgroundColor = "red";

    for (var i = 0; i< fa.length;i++)
    {
        id = get_o(fa[i].toString());
        document.getElementById(id).style.backgroundColor = "red";
        if ((data[4]!="false") && (data[5]!="false"))
           {
                if (fa[i]==data[4])
                    document.getElementById(id).value = "💣";
                if (fa[i]==data[5])
                    document.getElementById(id).value = "🧨";
           }
           
    }
    if (document.getElementById(ans).style.backgroundColor == "red")
    {
         document.getElementById(ans).classList.add("wrong");
         document.getElementById("ex2").value="0";
         return;
    }

    if (document.getElementById(ans).style.backgroundColor == "orange")
    {
        //document.getElementById(ans).style.backgroundColor = "green";
        document.getElementById(ans).classList.add("right");
        if (data[0]==1)
            document.getElementById("au").value = "1 000";
        if (data[0]==2)
            document.getElementById("au").value = "3 000";
        if (data[0]==3)
            document.getElementById("au").value = "5 000";
        if (data[0]==4)
            document.getElementById("au").value = "10 000";
        if (data[0]==5)
            document.getElementById("au").value = "25 000";
        if (data[0]==6)
            document.getElementById("au").value = "50 000";
        if (data[0]==7)
            document.getElementById("au").value = "150 000";
        if (data[0]==8)
            document.getElementById("au").value = "500 000";
        if (data[0]==9)
            document.getElementById("au").value = "1 000 000";
    

    }
    
    
    

    document.getElementById("ex2").value="0";


 
    
//})

//.catch(error => {
//console.error('Ошибка:', error);
//});


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

socket.on("get_task", (data) => {
    get_task(data)
})

function get_task(data){
 //   fetch('/get_task_user', {
  //      method: 'POST',
  //      body: JSON.stringify({ user:"spec"}),
   //     headers: {
   //         'Content-Type': 'application/json'
   //     }
  //  }
//)
//.then(response => response.json())

//.then(data => {
    

    if (data == "fail")
    {
        return;
    }
    if (document.getElementById("ex2").value !="0")
        return;
    document.getElementById('question').innerText ="Раунд "+data[0]+'\n'+ "md5: "+data[2] + '\n' + "Количество фаталов: "+ data[3];
    document.getElementById('question').value = "Раунд "+data[0]+'\n'+"md5: "+data[2] + '\n' + "Количество фаталов: "+ data[3];
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

     

   
    

//})
//.catch(error => {
//console.error('Ошибка:', error);
//});

}


function update_script(data)
{
    if (data == "fail")
        return;
    if (data == "Классика")
    {
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "white";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "white";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
        document.getElementById("script").value = data;
    }
    if (data== "Экстрим")
    {
        document.getElementById("script").value = data;
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
        document.getElementById("fix").value = "0"
    }    
    if (data == "Рискованный")
    {
         c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
        document.getElementById("fix").value = "0"
    }
}

function update_fix(data)
{
     if (data =="0")
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
        document.getElementById("fix").value = data
    }
    if (data == "1 000")
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
        document.getElementById("fix").value = data
    }
    if (data== "3 000")
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
        document.getElementById("fix").value = data
    }
    if (data == "5 000")
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
        document.getElementById("fix").value = data

    }
     if (data == "10 000")
    {
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "white";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
        document.getElementById("fix").value = data

    }
     if (data== "25 000")
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
        document.getElementById("fix").value = data

    }
     if (data == "50 000")
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
        document.getElementById("fix").value = data

    }
    if (data == "150 000")
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
        document.getElementById("fix").value = data
    }
    if (data == "500 000")
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
        document.getElementById("fix").value = data

    }
}

function update_round(data)
{
    if (data == "Отборочный тур")
    {
        document.getElementById("current").value = "0";
        document.getElementById("fix").value = "0";
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
    if (data == "1")
    {
        document.getElementById("current").value = "0";
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
    if (data == "2")
    {
        document.getElementById("current").value = "1 000";
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
    if (data == "3")
    {
        document.getElementById("current").value = "3 000";
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
    if (data == "4")
    {
         if(document.getElementById("script").value == "Классика")
        {
            document.getElementById("fix").value = "5 000";
        }
        document.getElementById("current").value = "5 000";
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
    if (data == "5")
    {
         if(document.getElementById("script").value == "Классика")
        {
            document.getElementById("fix").value = "5 000";
        }
        document.getElementById("current").value = "10 000";
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
    if (data == "6")
    {
         if(document.getElementById("script").value == "Классика")
        {
            document.getElementById("fix").value = "5 000";
        }
        document.getElementById("current").value = "25 000";
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
    if (data == "7")
    {
         if(document.getElementById("script").value == "Классика")
        {
            document.getElementById("fix").value = "50 000";
        }
        document.getElementById("current").value = "50 000";
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
    if (data== "8")
    {
         if(document.getElementById("script").value == "Классика")
        {
            document.getElementById("fix").value = "50 000";
        }
        document.getElementById("current").value = "150 000";
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
    if (data == "9")
    {
         if(document.getElementById("script").value == "Классика")
        {
            document.getElementById("fix").value = "50 000";
        }
        document.getElementById("current").value = "500 000";
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
    if (data == "Победа")
    {
        
        document.getElementById("fix").value = "1 000 000";
        document.getElementById("current").value = "1 000 000";
        c1.style.backgroundColor = "black";
        c2.style.backgroundColor = "black";
        c3.style.backgroundColor = "black";
        c4.style.backgroundColor = "black";
        c5.style.backgroundColor = "black";
        c6.style.backgroundColor = "black";
        c7.style.backgroundColor = "black";
        c8.style.backgroundColor = "black";
        c9.style.backgroundColor = "orange";
    }  
}
socket.on("get_helps", (data) => {
    get_helps(data);
})


function get_helps(data){
        //var user_name = document.getElementById("user").value;
        const blockedByMode =
        document.getElementById("ex2").value === "alter" ||
        document.getElementById("ex2").value === "x2" ||
        document.getElementById("ex2").value === "x2-2";
       
      //  fetch('/get_helps', {
      //  method: 'POST',
      //  body: JSON.stringify({ user:user_name}),
      //  headers: {
       //     'Content-Type': 'application/json'
       // }
   // }
//)
//.then(response => response.json())

//.then(data => {
    

    if (data=="fail")
    {
       
       document.getElementById("p50_50").hidden = true;
    document.getElementById("palter").hidden = true;
    document.getElementById("pnavi").hidden = true;
    document.getElementById("px2").hidden = true;
    document.getElementById("pauden").hidden = true;
     document.getElementById("pfact").hidden = true;
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
     if (blockedByMode) {
        document.getElementById("p50_50").disabled = true;
        document.getElementById("palter").disabled = true;
        document.getElementById("pnavi").disabled = true;
        document.getElementById("px2").disabled = true;
        document.getElementById("pauden").disabled = true;
        document.getElementById("pfact").disabled = true;
    }


//})
//.catch(error => {
//console.error('Ошибка:', error);
//});
 }

/** Отображает подсказку 50:50 на spectator. */
socket.on ("response_50_50", (data) => {
    get_50_50(data)
})

function get_50_50(data){
    // document.getElementById("p50_50").style.backgroundColor = "orange";
     //document.getElementById("ex2").value = "50:50"
   // fetch('/get_50_50_spec', {
      //  method: 'POST',
      //  body: JSON.stringify({ " ":" "}),
      //  headers: {
      //      'Content-Type': 'application/json'
      //  }
   // }
//)
//.then(response => response.json())

//.then(data => {

    if (data == "fail")
    {
        return;
    }
    for (var i=0;i<data.length;i++)
    {
        ff = data[i].toString();
        document.getElementById(get_o(ff)).disabled = true;
    }
   document.getElementById("ex2").value = "50:50";



//})

//.catch(error => {
//console.error('Ошибка:', error);
//});


}

socket.on ("response_alter", (data) => {
    get_alter(data)
})
/** Отображает подсказку Альтернатива на spectator. */
function get_alter(data){
     //document.getElementById("palter").style.backgroundColor = "orange";
     //document.getElementById("ex2").value = "alter"
 //   fetch('/get_alter_spec', {
    //    method: 'POST',
    //    body: JSON.stringify({ " ":" "}),
   //     headers: {
   //         'Content-Type': 'application/json'
   //     }
  //  }
//)
//.then(response => response.json())

//.then(data => {

    
    if (data == "fail")
    {
        return;
    }
    status_btn(true);
    
    b1 = data[0].toString();
    b2 = data[1].toString();

    document.getElementById(get_o(b1)).disabled = false;
    document.getElementById(get_o(b2)).disabled = false;
    document.getElementById("ex2").value = "alter";


//})

//.catch(error => {
//console.error('Ошибка:', error);
//});

}

socket.on ("response_navi", (data) => {
    get_navi(data)
})
/** Отображает подсказку Навигатор на spectator. */
function get_navi(data){
     //document.getElementById("pnavi").style.backgroundColor = "orange";
     //document.getElementById("ex2").value = "navi"
   // fetch('/get_navi_spec', {
    //    method: 'POST',
    //    body: JSON.stringify({ " ":" "}),
    //    headers: {
     //       'Content-Type': 'application/json'
     //   }
   // }
//)
//.then(response => response.json())

//.then(data => {

    if (data == "fail")
    {
        return;
    }
    
    for (var i = 0;i<data.length;i++)
    {
        n = data[i];
        document.getElementById(get_o(n)).style.backgroundColor = "#d905ec"
    }
    document.getElementById("ex2").value = "navi";


//})

//.catch(error => {
//console.error('Ошибка:', error);
//});

}
socket.on ("response_x2", (data) => {
    get_x2(data)
})

function get_x2(data){
     document.getElementById("px2").style.backgroundColor = "orange";
     document.getElementById("ex2").value = "x2";

}


socket.on ("response_auden", (data) => {
    get_auden(data)
})

function get_auden(data){

     
     //document.getElementById("ex2").value = "auden"
   // fetch('/get_auden_spec', {
     //   method: 'POST',
      //  body: JSON.stringify({ " ":" "}),
       // headers: {
       //     'Content-Type': 'application/json'
       // }
    //}
//)
//.then(response => response.json())

//then(data => {

    if (data == "fail")
    {
        return;
    }
    //document.getElementById("pauden").style.backgroundColor = "orange";
     document.getElementById("au").value = ""
    for (var i = 0; i<15;i++)
    {
        idb = get_o((i+1).toString())
        document.getElementById(idb).value = document.getElementById(idb).value+'\n' +data[i] +"%";
    }
    document.getElementById("au").value = document.getElementById("au").value + " Фатал- "+ data[15] +"%" + " " + " Cвободный слот - "+data[16]+ "%";
    document.getElementById("help_auden").style.backgroundColor = "#000c11";
    document.getElementById("ex2").value = "auden";


//})

//.catch(error => {
//console.error('Ошибка:', error);
//});



   

}

socket.on ("response_fact", (data) => {
    get_fact(data)
})

function get_fact(data){

   // document.getElementById("pfact").style.backgroundColor = "orange";
    // document.getElementById("ex2").value = "fact"
   // fetch('/get_fact_spec', {
    //    method: 'POST',
     //   body: JSON.stringify({ " ":" "}),
     //   headers: {
      //      'Content-Type': 'application/json'
     //   }
   // }
//)
//.then(response => response.json())

//.then(data => {
   

    if (data == "fail")
    {
        return;
    }
    
    
     
    document.getElementById("au").value = data[1];
    document.getElementById("pfact").style.backgroundColor = "#000c11";
    document.getElementById("ex2").value = "fact";


//})

//.catch(error => {
//console.error('Ошибка:', error);
//});

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
