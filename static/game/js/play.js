var interval = null
var INTERVAL = 2000

function initGame() {
    createMap()
    loadPlayer()
    loadGame()

    $.when(playerDeferred).done(function(){
        updateUnitsAndSettlements()
        if (!player.active) {
            interval = setInterval(updateGame, INTERVAL)
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
            updateUnitsAndSettlements()
        }
    });
}

function updateUnitsAndSettlements() {
    updateOpponentSettlements();
    updateSettlements();
    updateOpponentUnits();
    updateUnits();
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
            clearGame();
            activateUnits(false);
            loadPlayer();
            interval = setInterval(updateGame, INTERVAL);
        }
    });
});

function loadGame() {
    $.ajax({
        url : '/ajax/load_game',
        success : function(response) {
            var game = response['game']
            game = game[game]
        }
    });
}

initGame();