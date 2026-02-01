var timerStatus = setInterval(() => update_list_user(), 5000);
var timerHelps;
var timeWainAnswerFromMain;






function update_list_user()
{
    fetch('/update_for_spec', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/data'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
    {
        return;
    }

    console.log(data);
    if (data == "wait")
        {
            document.getElementById("question").hidden = true;
            document.getElementById("question").value = "";
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
            
            
            return;
    }
     if (data == "main")
        {
            document.getElementById("question").hidden = false;
            document.getElementById("question").value = "";
            document.getElementById("au").value = "";
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
            
    }
    var interactive_col = 0;
    document.getElementById("count_interactive").value = interactive_col.toString();
    for (var i=0;data.length;i++)
    {

    if (data[i][5]=="answered interactive")
        interactive_col++;

    console.log(interactive_col);
    document.getElementById("count_interactive").value = interactive_col.toString();
    }
    

})
.catch(error => {
console.error('Ошибка:', error);
});
}













/*



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
            document.getElementById("question").hidden = true;
            document.getElementById("question").value = "";
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
            document.getElementById("question").value = "";
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
*/
