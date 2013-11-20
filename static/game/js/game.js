function drawGame() {
    createMap()
    loadUnits()
    loadSettlements()
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

drawGame();