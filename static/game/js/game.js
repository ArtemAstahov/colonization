var c=document.getElementById("gameCanvas");
var ctx=c.getContext("2d");
ctx.fillStyle="#FF0000";
ctx.fillRect(0,0,150,75);


$(function () {
    var s = new WebSocket('ws://localhost:8000/game/echo');
    s.onopen = function () {
        console.log('WebSocket open');
    };
    s.onmessage = function (e) {
        console.log('message: ' + e.data);
        $('#messagecontainer').append('<p>' + e.data + '</p>');
    };
    window.s = s;

    $('#send_message').click(function () {
        s.send($('#message').val());
    });
});
