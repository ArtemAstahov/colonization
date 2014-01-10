var game = null

function Game(pk, game, player, opponent, units, settlements, opponentUnits, opponentSettlements) {
    this.pk = pk
    this.game = game
    this.player = player
    this.opponent = opponent
    this.units = units
    this.settlements = settlements
    this.opponentUnits = opponentUnits
    this.opponentSettlements = opponentSettlements
}

Game.prototype.show = function() {
    this.player.show()

    for (var pk in this.settlements) {
        this.settlements[pk].show()
    }

    for (var pk in this.opponentSettlements) {
        this.opponentSettlements[pk].show()
    }

    for (var pk in this.units) {
        this.units[pk].show()
    }

    for (var pk in this.opponentUnits) {
        this.opponentUnits[pk].show()
    }
}

Game.prototype.clear = function() {
    for (var pk in this.settlements) {
        this.settlements[pk].delete()
    }

    for (var pk in this.opponentSettlements) {
        this.opponentSettlements[pk].delete()
    }

    for (var pk in this.units) {
        this.units[pk].delete()
    }

    for (var pk in this.opponentUnits) {
        this.opponentUnits[pk].delete()
    }
}

var interval = null
var INTERVAL = 2000

function initGame() {
    createMap()
    loadGame()
}

function clearPanels() {
    hidePurchasesPanel()
    hideUnitPanel()
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
            clearPanels();

            for (var pk in game.units) {
                var unit = game.units[pk]
                unit.active = false
                unit.show()
            }

            game.player.active = false
            game.player.show()

            interval = setInterval(checkGame, INTERVAL);
        }
    });
});

function checkGame() {
    $.ajax({
        url : '/ajax/check_game',
        data : {'game_pk': game.pk},
        success : function(response) {
            if (response['game'] != undefined && response['game'].active == false) {
                alert("winner " + game.winner + ", looser" + game.looser)
                window.location.replace("/")
            }
            if (response['player_active']) {
                game.clear()
                loadGame()
                clearInterval(interval)
            }
        }
    });
}

function loadGame() {
    $.ajax({
        url : '/ajax/load_game',
        success : function(response) {
            var fields = jQuery.parseJSON(response['player'])[0].fields
            var player = new Player(fields.money, fields.color, fields.active)

            fields = jQuery.parseJSON(response['opponent'])[0].fields
            var opponent = new Player(fields.money, fields.color, fields.active)

            var records = jQuery.parseJSON(response['units'])
            var units = {}
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var unit = new Unit(pk, field.unit_type, field.left, field.top, field.active, player.color)
                units[pk] = unit
            }

            var records = jQuery.parseJSON(response['settlements'])
            var settlements = {}
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var settlement = new Settlement(pk, field.settlement_type, field.left, field.top, field.active, player.color)
                settlements[pk] = settlement
            }

            var records = jQuery.parseJSON(response['opponent_units'])
            var opponentUnits = {}
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var unit = new Unit(pk, field.unit_type, field.left, field.top, false, opponent.color)
                opponentUnits[pk] = unit
            }

            var records = jQuery.parseJSON(response['opponent_settlements'])
            var opponentSettlements = {}
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var opponentSettlement = new Settlement(pk, field.settlement_type, field.left, field.top, false, opponent.color)
                opponentSettlements[pk] = opponentSettlement
            }

            game = jQuery.parseJSON(response['game'])[0]
            game = new Game(game.pk, game.fields, player, opponent, units, settlements,
                            opponentUnits, opponentSettlements)
            game.show()

            if (!player.active) interval = setInterval(checkGame, INTERVAL);
        }
    });
}

initGame();