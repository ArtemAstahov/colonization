function drawGame() {
    createMap()
}

function createMap() {
    var c=document.getElementById("gameCanvas");
    var ctx=c.getContext("2d");
    for (var i=0; i<MAP_WIDTH; i++)
        for(var j=0; j<MAP_HEIGHT; j++)
            ctx.strokeRect( i * FIELD_SIZE, j * FIELD_SIZE, FIELD_SIZE, FIELD_SIZE);
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
        url : 'load_game',
        success : function(records) {
            for (var i = 0; i < records.length; i++) {
                var field = records[i].fields
                var unit = new Unit(field.player, field.unit_type, field.field)
                unit.show()
            }
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