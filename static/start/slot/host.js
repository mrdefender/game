var round = document.getElementById("status-round");
var away = document.getElementById("away");
var current_money = document.getElementById("current-money");
var next_money = document.getElementById("next-money");
var lost_money = document.getElementById("lost-money");
var fix_money = document.getElementById("fix-money");
var fix = 0;
fix_money.value = fix.toString();
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
        fix_money.value = "1000";
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
        fix_money.value = "3000";
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
        fix_money.value = "5000";
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
        fix_money.value = "10000";
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
        fix_money.value = "25000";
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
        fix_money.value = "50000";
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
        fix_money.value = "150000";
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
        fix_money.value = "500000";
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
        next_money.value = "1000";
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
        next_money.value = "1000";

            lost_money.value = current_money.value;
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
        current_money.value = "1000";
        next_money.value = "3000";
        if (fix==parseInt(current_money.value))
        {
            fix_money.value = current_money.value;
            var a = parseInt(current_money.value);
            var b = a - fix;
            lost_money.value = b.toString();
        }
        else
        {
            lost_money.value = current_money.value;
            fix_money.value = "0";
        }

        fix_money.value = fix.toString();
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
        current_money.value = "3000";
        next_money.value = "5000";
        if (fix==parseInt(current_money.value) && !player_is_fixed )
        {
            player_is_fixed = true;
            fix_money.value = current_money.value;
            var a = parseInt(current_money.value);
            var b = a - fix;
            lost_money.value = b.toString();
        }
        else
        {
            lost_money.value = current_money.value;
            fix_money.value = "0";
        }
        fix_money.value = fix.toString();
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
        current_money.value = "5000";
        next_money.value = "10000";
        if (fix==parseInt(current_money.value) && !player_is_fixed )
        {
            player_is_fixed = true;
            fix_money.value = current_money.value;
            var a = parseInt(current_money.value);
            var b = a - fix;
            lost_money.value = b.toString();
        }
        else
        {
            lost_money.value = current_money.value;
            fix_money.value = "0";
        }
        fix_money.value = fix.toString();
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
        current_money.value = "10000";
        next_money.value = "25000";
        if (fix==parseInt(current_money.value) && !player_is_fixed )
        {
            player_is_fixed = true;
            fix_money.value = current_money.value;
            var a = parseInt(current_money.value);
            var b = a - fix;
            lost_money.value = b.toString();
        }
        else
        {
            lost_money.value = current_money.value;
            fix_money.value = "0";
        }
        fix_money.value = fix.toString();
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
        current_money.value = "25000";
        next_money.value = "50000";
        if (fix==parseInt(current_money.value) && !player_is_fixed )
        {
            player_is_fixed = true;
            fix_money.value = current_money.value;
            var a = parseInt(current_money.value);
            var b = a - fix;
            lost_money.value = b.toString();
        }
        else
        {
            lost_money.value = current_money.value;
            fix_money.value = "0";
        }
        fix_money.value = fix.toString();
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
        current_money.value = "50000";
        next_money.value = "150000";
        if (fix==parseInt(current_money.value) && !player_is_fixed )
        {
            player_is_fixed = true;
            fix_money.value = current_money.value;
            var a = parseInt(current_money.value);
            var b = a - fix;
            lost_money.value = b.toString();
        }
        else
        {
            lost_money.value = current_money.value;
            fix_money.value = "0";
        }
        fix_money.value = fix.toString();
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
        current_money.value = "150000";
        next_money.value = "500000";
        if (fix==parseInt(current_money.value) && !player_is_fixed )
        {
            player_is_fixed = true;
            fix_money.value = current_money.value;
            var a = parseInt(current_money.value);
            var b = a - fix;
            lost_money.value = b.toString();
        }
        else
        {
            lost_money.value = current_money.value;
            fix_money.value = "0";
        }
        fix_money.value = fix.toString();
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
        current_money.value = "500000";
        next_money.value = "1000000";
         if (fix==parseInt(current_money.value) && !player_is_fixed )
        {
            player_is_fixed = true;
            fix_money.value = current_money.value;
            var a = parseInt(current_money.value);
            var b = a - fix;
            lost_money.value = b.toString();
        }
        else
        {
            lost_money.value = current_money.value;
            fix_money.value = "0";
        }
        fix_money.value = fix.toString();
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
        current_money.value = "1000000";
        next_money.value = "1000000";
        lost_money.value = "0";
        fix_money.value = "1000000";
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
        round == 0
    }
    else
    {
        var t = round
        round = parseInt(t)
    }
    fetch('/gen_task', {
        method: 'POST',
        body: JSON.stringify({user_name: input, current_round: "5"}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {
    console.log(data[2])
    document.getElementById('question').innerText = "md5: "+data[2];
})
.catch(error => {
console.error('Ошибка:', error);
});
}

