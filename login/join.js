function checkuser()
{
    let user = document.querySelector('#name').value;
    let room = document.querySelector('#room').value;
    console.log(user)
    console.log(room)
    if ((user == "") || (room == ""))
        alert("Строка пустая");
    else
        if ((user == "admin") && (room == "99999999"))
            window.location = "/start/select.html"
        else
            window.location = "/start/user.html"

}
