function drawGame()
{
    var c=document.getElementById("gameCanvas");
    var ctx=c.getContext("2d");
    ctx.fillStyle="#FF0000";
    ctx.fillRect(0,0,150,75);
}


function updateGame() {
    //var count = $(":selected").val();
    $.ajax({
        url : 'game/update/', // + count,
        success : function(records) {
            $('#chat').html(records);
        }
    });
}

function loadGame() {
    $.ajax({
        url : 'load',
        success : function(records) {
            $('#hernya').html(records);
        }
    });
}

function saveRecord() {
    var message = $("#message").val();
    $.ajax({
        url : '/save-record/',
        type: "POST",
        dataType: "text",
        encoding:"UTF-8",
        data: "message=" + message,
        success : function() {
            $("#message").val('');
            updateChat();
        }
    });
}

drawGame();
loadGame();
//setInterval(updateChat, 10000);