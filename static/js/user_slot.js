var welcome = document.getElementById("welcome");
welcome.innerText = "Добро пожаловать на игру";
var welcome2 = document.getElementById("welcome2");
welcome2.innerText = "Свободный слот!";

let timerStatus = setInterval(() => get_status(), 5000);

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

    console.log(data);
    if (data == "wait")
        return;


        //document.getElementById('au').textContent = "В игру вступает " + data;
    //document.getElementById('au').innerText = "В игру вступает " + data;
})
.catch(error => {
console.error('Ошибка:', error);
});

}


