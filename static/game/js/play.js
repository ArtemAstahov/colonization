var interval = null

function initGame() {
    createMap()
    loadPlayer()

    $.when(playerDeferred).done(function(){
        loadSettlements()
        loadOpponentUnits()
        loadUnits()
        if (!player.active) {
            interval = setInterval(updateGame, 1000)
        }
    });
}

function clearGame() {
    hidePurchasesPanel()
    hideUnitPanel()
}

function updateGame() {
    loadPlayer();
    $.when(playerDeferred).done(function(){
        if (player.active) {
            clearInterval(interval)
            loadOpponentUnits();
            activateUnits();
        }
    });
}

function createMap() {
    var layer = new Kinetic.Layer();
    var image = new Image()
    var map = new Kinetic.Image({
        x: 0,
        y: 0,
        image: image,
        width: 1300,
        height: 600,
        listening: false
    });
    image.onload = function() {
        layer.add(map)
        layer.moveToBottom()
        layer.draw()
    };
    image.src = "/static/game/img/map.jpg"
    stage.add(layer);
}

$("#finishStroke").click(function(){
    $.ajax({
        url : '/ajax/finish_stroke',
        success : function() {
            player.active = false
            clearGame();
            activateUnits();
            interval = setInterval(updateGame, 1000);
        }
    });
});

initGame();