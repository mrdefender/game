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
var currentUrl = document.URL;
var ffffff = currentUrl.split('/host_slot');//адресная строка пользователя без /host_slot http://ip:5000
var audioUrl = ffffff[0]+'/sounds/';
var audio_q1_3 = new Audio(audioUrl+"q1-3.ogg");//добавить все звуки
var audio_q4_5 = new Audio(audioUrl+"q4-5.ogg");
var audio_q6 = new Audio(audioUrl+"q6.ogg");
var audio_q7 = new Audio(audioUrl+"q7.ogg");
var audio_q8 = new Audio(audioUrl+"q8.ogg");
var audio_q9 = new Audio(audioUrl+"q9.ogg");
var audio_r1_2 = new Audio(audioUrl+"r1-2.ogg");
var audio_r3 = new Audio(audioUrl+"r3.ogg");
var audio_r4 = new Audio(audioUrl+"r4.ogg");
var audio_r5 = new Audio(audioUrl+"r5.ogg");
var audio_r6 = new Audio(audioUrl+"r6.ogg");
var audio_r7 = new Audio(audioUrl+"r7.ogg");
var audio_r8 = new Audio(audioUrl+"r8.ogg");
var audio_r9 = new Audio(audioUrl+"r9.ogg");
var audio_a4_9 = new Audio(audioUrl+"a4-9.ogg");
var audio_w1_3 = new Audio(audioUrl+"w1-3.ogg");
var audio_w4 = new Audio(audioUrl+"w4.ogg");
var audio_w5 = new Audio(audioUrl+"w5.ogg");
var audio_w6 = new Audio(audioUrl+"w6.ogg");
var audio_w7 = new Audio(audioUrl+"w7.ogg");
var audio_w8 = new Audio(audioUrl+"w8.ogg");
var audio_w9 = new Audio(audioUrl+"w9.ogg");
var audio_n4 = new Audio(audioUrl+"n4.ogg");
var audio_n5 = new Audio(audioUrl+"n5.ogg");
var audio_n6 = new Audio(audioUrl+"n6.ogg");
var audio_n7 = new Audio(audioUrl+"n7.ogg");
var audio_n8 = new Audio(audioUrl+"n8.ogg");
var audio_n9 = new Audio(audioUrl+"n9.ogg");
var audio_h3 = new Audio(audioUrl+"h3.ogg");
var audio_h4 = new Audio(audioUrl+"h4.ogg");
var audio_begin1 = new Audio(audioUrl+"begin1.ogg");
var audio_begin2 = new Audio(audioUrl+"begin2.ogg");
var audio_otbor_rules= new Audio(audioUrl+"otbor_rules.ogg");
var audio_otbor_warning= new Audio(audioUrl+"otbor_warning.ogg");
var audio_otbor_play= new Audio(audioUrl+"otbor_play.ogg");
var audio_otbor_resullt= new Audio(audioUrl+"otbor_resullt.ogg")
var audio_start_background= new Audio(audioUrl+"start_background.ogg");
var audio_rules_player= new Audio(audioUrl+"rules_player.ogg");
var audio_fix_script= new Audio(audioUrl+"fix_script.ogg");
var audio_back= new Audio(audioUrl+"back.ogg");
var audio_reklama= new Audio(audioUrl+"reklama.ogg");
var audio_invite= new Audio(audioUrl+"invite.ogg");
var audio_rave_50_50= new Audio(audioUrl+"rave_50_50.ogg");
var audio_alter= new Audio(audioUrl+"alter.ogg");
var audio_take_money= new Audio(audioUrl+"take_money.ogg");
var audio_x2= new Audio(audioUrl+"x2.ogg");
var audio_x2_2= new Audio(audioUrl+"x2_2.ogg");
var audio_start_game= new Audio(audioUrl+"start_game.ogg");
var audio_navigator= new Audio(audioUrl+"navigator.ogg");
var audio_out_player= new Audio(audioUrl+"out_player.ogg");
var audio_pre_final= new Audio(audioUrl+"pre-final.ogg");
var audio_final= new Audio(audioUrl+"final.ogg");
var timerWaitAnswer;
var timerHelps;

function cancel_all(){
    clearInterval(timerHelps);
    document.getElementById("user_id").disabled = false;
    document.getElementById("user_id").value = "";
    document.getElementById("in_game").value = "В игре: ";
    reset_user_to_wait();
    update_list_user();
    var select = document.querySelector('#select_round');
    var select_fix = document.querySelector('#select_fix');
    document.getElementById("au").value = "";
    document.getElementById("question").value = "";
    status_btn(true,"btn");
    status_btn(true,"o");
    select.value = "Раунд 1";
    select_fix.value = "0";
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
   ch1();
   ch2();
   ch3();
  //  location.reload();
}

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
    }    
}


select_fix.addEventListener('change', function(){
   ch2()
}
);



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
}

select.addEventListener('change', function(){
   ch3();
}
);

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
    console.log("Раунд " + round.value);
}


function start_to_game()
{
    
    document.getElementById("start_game").disabled = true;
    document.getElementById("get_task").disabled = false;
    stop_sounds();
    audio_start_game.play();
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
stop_sounds();
audio_fix_script.play();
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
    send_helps(helps);
    timerHelps = setInterval(() => update_helps(), 5000);


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
        document.getElementById('au').value = "В игру вступает " + data;
        document.getElementById('in_game').value = "В игре:    " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
    document.getElementById("fixed_script").disabled = false;
    stop_sounds();
    audio_invite.play();
})
.catch(error => {
console.error('Ошибка:', error);
});

}

function start_sounds_for_questions(){


    
       audio.currentTime = 0;
       audio.pause();
       audio.play();
        
       /*
       fetch('/sounds/q1-3.ogg', {
        method: 'GET',
        headers: {
            'Content-Type': 'audio/ogg'
        }
    }
)
.then(response =>  {
        console.log(response);
     //   player = document.getElementById('audioPlayer');  
       //  player.src = `/sounds/${encodeURIComponent(response)}`
         
         //player.play().catch(error => console.error("Playback failed:", error));  
      
        
     
       
}
)

*/
}

function gen_task()
{
    
    if (select.value == "Победа")
        true;
    var input = document.getElementById("user_id").value;
    round = document.getElementById("status-round").value;
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
        body: JSON.stringify({user_name: input, current_round: t}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    console.log(data)
    document.getElementById('question').innerText = "md5: "+data[2] + '\n' + "Количество фаталов: "+ data[3];
    status_btn (false,"o");
    status_btn (false,"btn");
    document.getElementById('take_money').disabled = false;
    stop_sounds();
    if ((data[0]==1) || (data[0]==2) || (data[0]==3))
    {
        audio_q1_3.loop = true;
        audio_q1_3.play(); 
    }
    if ((data[0]==4) || (data[0]==5))
    {
        audio_q4_5.loop = true;
        audio_q4_5.play();
    }
    if (data[0]==6)
    {
        audio_q6.loop = true;
        audio_q6.play();
    }
    if (data[0]==7)
    {
        audio_q7.loop = true;
        audio_q7.play();
    }
    if (data[0]==8)
    {
        audio_q8.loop = true;
        audio_q8.play();
    }
    if (data[0]==9)
    {
        audio_q9.loop = true;
        audio_q9.play();
    }
  
    timerWaitAnswer = setInterval(() => wait_answer(), 5000);

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


function show_fatal_to_host_panel(n_r,fatal)
{
        document.getElementById("show-right").disabled = false;
        document.getElementById("take_money").disabled = true;
        
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
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            stop_sounds();
            audio_a4_9.play();
        }

    }
    if (n_r==5)
    {
        for (i=0;i<6;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            stop_sounds();
            audio_a4_9.play();
        }

    }
    if (n_r==6)
    {
        for (i=0;i<8;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            stop_sounds();
            audio_a4_9.play();
        }

    }
    if (n_r==7)
    {
        for (i=0;i<10;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            stop_sounds();
            audio_a4_9.play();
        }

    }
    if (n_r==8)
    {
        for (i=0;i<12;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            stop_sounds();
            audio_a4_9.play();
        }

    }
    if (n_r==9)
    {
        for (i=0;i<14;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
            stop_sounds();
            audio_a4_9.play();
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
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
    show_fatal_to_host_panel(c_r, data[1]);
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}

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
        stop_sounds();
        audio_x2_2.play();
        document.getElementById("x2").style.backgroundColor ==  "#1a1b02"
        if(document.getElementById(o_to_btn(data[0])).style.backgroundColor == "red")
        {
            document.getElementById(data[0]).style.backgroundColor ="red"
            document.getElementById("x2").style.backgroundColor =  "#1a1b02";
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
            audio_r1_2.play();
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
            audio_r1_2.play();
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
            stop_sounds();
            audio_r3.play();
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
            stop_sounds();
            audio_r4.play();
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
            stop_sounds();
            audio_r5.play();
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
            stop_sounds();
            audio_r6.play();
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
            stop_sounds();
            audio_r7.play();
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
            stop_sounds();
            audio_r8.play()
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
            stop_sounds();
            audio_r9.play();
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
        stop_sounds();
        if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        {
            audio_w1_3.play();
        }
        if (select.value == "Раунд 4")
        {
            audio_w4.play();
        }
        if (select.value == "Раунд 5")
        {
            audio_w5.play();
        }
        if (select.value == "Раунд 6")
        {
            audio_w6.play();
        }
        if (select.value == "Раунд 7")
        {
            audio_w7.play();
        }
        if (select.value == "Раунд 8")
        {
            audio_w8.play();
        }
        if (select.value == "Раунд 9")
        {
            audio_w9.play();
        }
    }   

    document.getElementById("show-right").disabled = true;
   // ch3();
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;

    
}
)
.catch(error => {
console.error('Ошибка:', error);
});


}


function next_round()
{

    ch3();
    if (select.value == "Раунд 4")
    {
        stop_sounds();
        audio_n4.play();
    }
    if (select.value == "Раунд 5")
    {
        stop_sounds();
        audio_n5.play();
    }
    if (select.value == "Раунд 6")
    {
        stop_sounds();
        audio_n6.play();
    }
    if (select.value == "Раунд 7")
    {
        stop_sounds();
        audio_n7.play();
    }
    if (select.value == "Раунд 8")
    {
        stop_sounds();
        audio_n8.play();
    }
    if (select.value == "Раунд 9")
    {
        stop_sounds();
        audio_n9.play();
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

function take_money()
{
    if(document.getElementById("x2").style.backgroundColor == "orange")
        return;
    if (document.getElementById("alter").style.backgroundColor == "orange")
        return;
    document.getElementById("au").value = "Выигрыш: " + '\n' + current_money.value;
   var tm = document.getElementById("take_money");
    tm.style.backgroundColor = "lime";
     console.log(tm.style.backgroundColor);
     document.getElementById("total_money").disabled = false;
     stop_sounds();
     audio_take_money.play();
}


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
    audio_rave_50_50.play();

        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});






}
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
    audio_alter.play();



        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});


}
function navi(){
    if(document.getElementById("x2").style.backgroundColor == "orange")
        return;
    if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        return;
    if (document.getElementById("alter").style.backgroundColor == "orange")
        return;
    document.getElementById("pnavi").checked = false;

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
    audio_navigator.play();
    for (var i = 0; data.length;i++)
    {
    document.getElementById(get_btn(data[i])).style.backgroundColor = "#d905ec";
    document.getElementById(get_o(data[i])).style.backgroundColor = "#d905ec";
    }
   






        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}
function x2(){
    if(check_answered())
        return;
    if ((select.value == "Раунд 1") || (select.value == "Раунд 2") || (select.value == "Раунд 3"))
        return;
    if (document.getElementById("alter").style.backgroundColor == "orange")
        return;

    document.getElementById("x2").style.backgroundColor = "orange";
    document.getElementById("px2").checked = false;
    stop_sounds();
    audio_x2.play();


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

function open_room(){

    if (document.getElementById("room").value=="")
    {
        return;
    }
       console.log(document.getElementById("room").value);

    

     fetch('/open_room', {
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
    
    
        document.getElementById("open_room").disabled = true;
        document.getElementById("close_room").disabled = false;
        document.getElementById("room").disabled = true;
    
        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

function close_room(){

    if (document.getElementById("room").value=="")
    {
        return;
    }
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



}
function stop_sounds()
{
    //start_sounds_for_questions()
    audio_q1_3.currentTime = 0;
    audio_q1_3.pause(); //добавить все звуки
    audio_q4_5.currentTime = 0;
    audio_q4_5.pause();
	audio_q6.currentTime = 0;
    audio_q6.pause();
	audio_q7.currentTime = 0;
    audio_q7.pause();
	audio_q8.currentTime = 0;
    audio_q8.pause();
	audio_q9.currentTime = 0;
    audio_q9.pause();
    audio_r1_2.currentTime = 0;
    audio_r1_2.pause();
    audio_r3.currentTime = 0;
    audio_r3.pause();
    audio_r4.currentTime = 0;
    audio_r4.pause();
    audio_r5.currentTime = 0;
    audio_r5.pause();
    audio_r6.currentTime = 0;
    audio_r6.pause();
    audio_r7.currentTime = 0;
    audio_r7.pause();
    audio_r8.currentTime = 0;
    audio_r8.pause();
    audio_r9.currentTime = 0;
    audio_r9.pause();
    audio_a4_9.currentTime = 0;
    audio_a4_9.pause();
    audio_w1_3.currentTime = 0;
    audio_w1_3.pause();
    audio_w4.currentTime = 0;
    audio_w4.pause();
    audio_w5.currentTime = 0;
    audio_w5.pause();
    audio_w6.currentTime = 0;
    audio_w6.pause();
    audio_w7.currentTime = 0;
    audio_w7.pause();
    audio_w8.currentTime = 0;
    audio_w8.pause();
    audio_w9.currentTime = 0;
    audio_w9.pause();
    audio_n4.currentTime = 0;
    audio_n4.pause();
    audio_n5.currentTime = 0;
    audio_n5.pause();
    audio_n6.currentTime = 0;
    audio_n6.pause();
    audio_n7.currentTime = 0;
    audio_n7.pause();
    audio_n8.currentTime = 0;
    audio_n8.pause();
    audio_n9.currentTime = 0;
    audio_n9.pause();
    audio_h3.currentTime = 0;
    audio_h3.pause();
    audio_h4.currentTime = 0;
    audio_h4.pause();		
    audio_begin1.currentTime = 0;
    audio_begin1.pause();
    audio_begin2.currentTime = 0;
    audio_begin2.pause();
    audio_otbor_rules.currentTime = 0;
    audio_otbor_rules.pause();
    audio_otbor_warning.currentTime = 0;
    audio_otbor_warning.pause();
    audio_otbor_play.currentTime = 0;
    audio_otbor_play.pause();
    audio_otbor_resullt.currentTime = 0;
    audio_otbor_resullt.pause();
    audio_start_background.currentTime = 0;
    audio_start_background.pause();
    audio_rules_player.currentTime = 0;
    audio_rules_player.pause();
    audio_fix_script.currentTime = 0;
    audio_fix_script.pause();
    audio_back.currentTime = 0;
    audio_back.pause();
    audio_reklama.currentTime = 0;
    audio_reklama.pause();
    audio_invite.currentTime = 0;
    audio_invite.pause();
    audio_rave_50_50.currentTime = 0;
    audio_rave_50_50.pause();
    audio_alter.currentTime = 0;
    audio_alter.pause();
    audio_take_money.currentTime = 0;
    audio_take_money.pause();
    audio_x2.currentTime = 0;
    audio_x2.pause();
    audio_x2_2.currentTime = 0;
    audio_x2_2.pause();
    audio_start_game.currentTime = 0;
    audio_start_game.pause();
    audio_navigator.currentTime = 0;
    audio_navigator.pause();
    audio_out_player.currentTime = 0;
    audio_out_player.pause();
    audio_pre_final.currentTime = 0;
    audio_pre_final.pause();
    audio_final.currentTime = 0;
    audio_final.pause();
    //console.log(currentUrl);
}


function start_sound_begin1()
{
    stop_sounds();
    audio_begin1.play();
}
function start_sound_begin2()
{
    stop_sounds();
    audio_begin2.play();
}
function start_background()
{
    stop_sounds();
    audio_start_background.loop = true;
    audio_start_background.play();
}
function start_rules_game()
{
    stop_sounds();
    audio_rules_player.loop = true;
    audio_rules_player.play();
}
function start_pre_final()
{
    stop_sounds();
    audio_pre_final.loop = true;
    audio_pre_final.play();
}
function start_final()
{
    stop_sounds();
    audio_final.play();
}


function total_money()
{
    var tm = document.getElementById("take_money");
   if (tm.style.backgroundColor != "lime")
   {
    var tmp_money = document.getElementById("au").value;
    document.getElementById("au").value = "Выигрыш:" +'\n' + tmp_money;
   }
    stop_sounds();
    audio_out_player.play();
}


let timerId = setInterval(() => update_list_user(), 5000);

function update_list_user()
{
    fetch('/update_list_users', {
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

    var table = document.getElementById("status_users");
    if (table.rows.length!=1)
    {
   for (let i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i); // Помалу прощаемся со строками...
     }
   }

   if (data[6]=="true")
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
    tr.appendChild(cell1);
    tr.appendChild(cell2);
    tr.appendChild(cell3);
    tr.appendChild(cell4);
    tr.appendChild(cell5);
    tr.appendChild(cell6);
    table.appendChild(tr);
    return;
   }

    for (var i=0;data.length;i++)
    {
    var tr = document.createElement("tr")
    var cell1 = document.createElement("td")
    cell1.innerHTML = data[i][0];
    var cell2 = document.createElement("td")
    cell2.innerHTML = data[i][1];
    var cell3 = document.createElement("td")
    cell3.innerHTML = data[i][2];
    var cell4 = document.createElement("td")
    cell4.innerHTML = data[i][3];
    var cell5 = document.createElement("td")
    cell5.innerHTML = data[i][4];
    var cell6 = document.createElement("td")
    cell6.innerHTML = data[i][5];
    tr.appendChild(cell1);
    tr.appendChild(cell2);
    tr.appendChild(cell3);
    tr.appendChild(cell4);
    tr.appendChild(cell5);
    tr.appendChild(cell6);
    table.appendChild(tr);
    }


})
.catch(error => {
console.error('Ошибка:', error);
});
}


function wait_answer(){
    fetch('/wait_answer_for_host', {
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
    clearInterval(timerWaitAnswer)
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



})
.catch(error => {
console.error('Ошибка:', error);
});
}
