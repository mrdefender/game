var timerStatus = setInterval(() => update_list_user(), 2000);
var timerHelps;
var timeWainAnswerFromMain;
var timerTreeStatus = setInterval(() => update_tree(), 3000);





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
    console.log("update " + data);

    if (data == "fail")
    {
        return;
    }

    
    if (data == "wait")
        {
            document.getElementById("in_game").value = "В игре: "
            document.getElementById("user").value = ""
            document.getElementById("au").value = ""
            document.getElementById("ans").value = ""
            document.getElementById("question").hidden = true;
            document.getElementById("question").value = " ";
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
            
            
            return;
    }
     if (data[0] == "main")
        {
            document.getElementById("in_game").value = "В игре: " + data[1]
            document.getElementById("au").value = "В игру вступает:" +'\n'+ data[1];
            document.getElementById("user").value = data[1]
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
            get_helps();
            return;
            
    }
    
    if (data[0] == "wait task main")
    {
        document.getElementById("au").value = "";
        document.getElementById("ex2").value = "0";
        document.getElementById("ans").value = "";
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
        get_helps();
        return;
    }
        if (data[0] == "given task main")
    {
        document.getElementById("au").value = "";
        document.getElementById("question").value = "";
        get_task();
        get_helps();
        return;
    }

    if (data[0] == "answered main")
    {
        console.log(data[0]);
        answered_main();
        return;

        
    }
    if (data[0] == "check main")
    {
        check_answered();
        document.getElementById("au").value = "";
        document.getElementById("question").value = "";
        return;
    }

    if (data[0] == "game over lose")
    {
        document.getElementById("au").value ="Выигрыш:" +'\n'+ document.getElementById("fix").value;
        document.getElementById("question").value = "";
        return;
    }
    if (data[0] == "game over")
    {
        document.getElementById("au").value ="Выигрыш:" +'\n'+ document.getElementById("current").value;
        document.getElementById("question").value = "";
        return;
    }


    


})
.catch(error => {
console.error('Ошибка:', error);
});
}



function answered_main(){
    fetch('/answered_main_spec', {
        method: 'POST',
        body: JSON.stringify({ " ":" "}),
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
        return;
    }

    
    ans = data[0];
    document.getElementById("ans").value = ans;
    document.getElementById(ans).style.backgroundColor = "orange";
 
    
})

.catch(error => {
console.error('Ошибка:', error);
});
}


function check_answered(){
    fetch('/answered_check_spec', {
        method: 'POST',
        body: JSON.stringify({ " ":" "}),
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

    fa = data[1]

    for (var i = 0; i< fa.length;i++)
    {
        id = get_o(fa[i].toString());
        document.getElementById(id).style.backgroundColor = "red";
    }
    if (document.getElementById(ans).style.backgroundColor == "orange")
    {
        document.getElementById(ans).style.backgroundColor = "green";
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
            document.getElementById("au").value = "150 000";
        if (data[0]==9)
            document.getElementById("au").value = "1 000 000";
    

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



function get_task(){
    fetch('/get_task_user', {
        method: 'POST',
        body: JSON.stringify({ user:"spec"}),
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
    if (document.getElementById("ex2").value !="0")
        return;
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

     

   
    

})
.catch(error => {
console.error('Ошибка:', error);
});

}


function update_tree(){

    fetch('/get_tree', {
        method: 'POST',
        body: JSON.stringify({ "":""}),
        headers: {
            'Content-Type': 'application/json'
        }
    }
)
.then(response => response.json())

.then(data => {

    if (data == "fail")
        return;
     if (data[0] == "Классика")
    {
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "white";
        c4.style.color = "#dd6706";
        c5.style.color = "#dd6706";
        c6.style.color = "white";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
        document.getElementById("script").value = data[0];
    }
    if (data[0]== "Экстрим")
    {
        document.getElementById("script").value = data[0];
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
    if (data[0] == "Рискованный")
    {
        document.getElementById("script").value = data[0];
        if (data[1] =="0")
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
        document.getElementById("fix").value = data[1]
    }
    if (data[1] == "1 000")
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
        document.getElementById("fix").value = data[1]
    }
    if (data[1]== "3 000")
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
        document.getElementById("fix").value = data[1]
    }
    if (data[1] == "5 000")
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
        document.getElementById("fix").value = data[1]

    }
     if (data[1] == "10 000")
    {
        c1.style.color = "#dd6706";
        c2.style.color = "#dd6706";
        c3.style.color = "#dd6706";
        c4.style.color = "white";
        c5.style.color = "#dd6706";
        c6.style.color = "#dd6706";
        c7.style.color = "#dd6706";
        c8.style.color = "#dd6706";
        document.getElementById("fix").value = data[1]

    }
     if (data[1] == "25 000")
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
        document.getElementById("fix").value = data[1]

    }
     if (data[1] == "50 000")
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
        document.getElementById("fix").value = data[1]

    }
    if (data[1] == "150 000")
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
        document.getElementById("fix").value = data[1]
    }
    if (data[1] == "500 000")
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
        document.getElementById("fix").value = data[1]

    }
    }    
    if (data[2] == "Отборочный тур")
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
    if (data[2] == "1")
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
    if (data[2] == "2")
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
    if (data[2] == "3")
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
    if (data[2] == "4")
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
    if (data[2] == "5")
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
    if (data[2] == "6")
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
    if (data[2] == "7")
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
    if (data[2]== "8")
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
    if (data[2] == "9")
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
    if (data[2] == "Победа")
    {
         if(document.getElementById("script").value == "Классика")
        {
            document.getElementById("fix").value = "1 000 000";
        }
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
    


})
.catch(error => {
console.error('Ошибка:', error);
});


}


function get_helps(){
        var user_name = document.getElementById("user").value;
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
