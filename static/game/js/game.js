function drawGame() {
    createMap()
    loadGame()
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

function loadGame() {
    $.ajax({
        url : 'load_game',
        success : function(records) {
            stage.clear()
            createMap()
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var unit = new Unit(pk, field.map, field.player, field.unit_type, field.left, field.top)
                unit.show()
            }
        }
    });
}

drawGame();