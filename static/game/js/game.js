function drawGame() {
    createMap()
}

function createMap() {
    var layer = new Kinetic.Layer();

    for (var i = 0; i < MAP_WIDTH; i++) {
        for(var j = 0; j < MAP_HEIGHT; j++) {
            var field = new Kinetic.Rect({
                x: i * FIELD_SIZE,
                y: j * FIELD_SIZE,
                width: FIELD_SIZE,
                height: FIELD_SIZE,
                stroke: 'black'
            });
            layer.add(field);
        }
    }

    stage.add(layer);
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
                var unit = new Unit(field.player, field.unit_type, [field.left, field.top])
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