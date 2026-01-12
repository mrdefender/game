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



function cancel_all(){


}



select_script.addEventListener('change', function(){
    if (this.value == "Классика")
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
    if (this.value == "Экстрим")
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
    if (this.value == "Рискованный")
    {
        select_fix.disabled = false;
    }    


}
)


select_fix.addEventListener('change', function(){
    console.log(this.value);
    if (this.value =="0")
    {
        fix_money.value = "0";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
    }
    if (this.value == "1 000")
    {
        fix_money.value = "1 000";
        c1.style.color = "white";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
    }
    if (this.value == "3 000")
    {
        fix_money.value = "3 000";
        c1.style.color = "#dd6706";
        c2.style.color = "white";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
    }
    if (this.value == "5 000")
    {
        fix_money.value = "5 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "white";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";

    }
     if (this.value == "10 000")
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
     if (this.value == "25 000")
    {
        fix_money.value = "25 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "white";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";

    }
     if (this.value == "50 000")
    {
        fix_money.value = "50 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "white";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";

    }
    if (this.value == "150 000")
    {
        fix_money.value = "150 000";
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "white";
        c8.style.color = "#dd6706";
    }
    if (this.value == "500 000")
    {
        fix_money.value = "500 000";
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
);


select.addEventListener('change', function(){
    console.log(this.value);


    if (this.value == "Отборочный тур")
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
    if (this.value == "Раунд 1")
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
    if (this.value == "Раунд 2")
    {
        round.value = "2";
        away.value = "Осталось раундов: 8";
        current_money.value = "1 000";
        next_money.value = "3 000";




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
    if (this.value == "Раунд 3")
    {
        round.value = "3";
        away.value = "Осталось раундов: 7";
        current_money.value = "3 000";
        next_money.value = "5000";


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
    if (this.value == "Раунд 4")
    {
        round.value = "4";
        away.value = "Осталось раундов: 6";
        current_money.value = "5 000";
        next_money.value = "10 000";



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
    if (this.value == "Раунд 5")
    {
        round.value = "5";
        away.value = "Осталось раундов: 5";
        current_money.value = "10 000";
        next_money.value = "25 000";
 
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
    if (this.value == "Раунд 6")
    {
        round.value = "6";
        away.value = "Осталось раундов: 4";
        current_money.value = "25 000";
        next_money.value = "50 000";




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
    if (this.value == "Раунд 7")
    {
        round.value = "7";
        away.value = "Осталось раундов: 3";
        current_money.value = "50 000";
        next_money.value = "150 000";
 

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
    if (this.value == "Раунд 8")
    {
        round.value = "8";
        away.value = "Осталось раундов: 2";
        current_money.value = "150 000";
        next_money.value = "500 000";



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
    if (this.value == "Раунд 9")
    {
        round.value = "9";
        away.value = "Осталось раундов: 1";
        current_money.value = "500 000";
        next_money.value = "1 000 000";



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
    if (this.value == "Победа")
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
    }  
    console.log(current_money.value);
    console.log(lost_money.value);
    console.log(fix_money.value);
    console.log(round.value);
}
);
function invite_to_game()
{
    var input = document.querySelector('input[name="user_name"]:checked').value;
    console.log(input)
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
        document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});
}


function gen_task()
{
    var input = document.querySelector('input[name="user_name"]:checked').value;
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
    console.log(data[2])
    document.getElementById('question').innerText = "md5: "+data[2];
    status_btn (false,"o");
    status_btn (false,"btn");


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


function show_fatal_to_host_panel(n_r,fatal)
{
        document.getElementById("show-right").disabled = false;
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
        }

    }
    if (n_r==5)
    {
        for (i=0;i<8;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
        }

    }
    if (n_r==6)
    {
        for (i=0;i<10;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
        }

    }
    if (n_r==7)
    {
        for (i=0;i<12;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
        }

    }
    if (n_r==8)
    {
        for (i=0;i<13;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
        }

    }
    if (n_r==9)
    {
        for (i=0;i<14;i++)
        {
            document.getElementById(get_btn(fatal[i])).style.backgroundColor = "red";
        }

    }

}

function check_answered()
{
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
    return data;
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "1"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "2"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "3"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "4"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "5"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "6"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "7"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "8"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "9"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "10"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "11"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "12"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "13"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "14"}),
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
    if (check_answered)
        return;
    fetch('/get_fatal_host', {
        method: 'POST',
        body: JSON.stringify({answer: "15"}),
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

}
