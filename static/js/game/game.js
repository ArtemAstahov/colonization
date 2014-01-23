var game = null
var INTERVAL = 2000

var notifyAudio = null
if ( (/msie|trident/i).test(navigator.userAgent) ) {
    notifyAudio = new Audio('/static/sounds/game/notify.mp3')
} else {
    notifyAudio = new Audio('/static/sounds/game/notify.wav')
}

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

function initGame() {
    createMap()
    checkGame()
    setInterval(checkGame, INTERVAL)
}

function clearPanels() {
    hidePurchasesPanel()
    hideUnitPanel()
}

$("#finishStroke").click(function(){
    if (!game.player.active)
        return

    $.ajax({
        url : '/ajax/finish_stroke',
        success : function() {
            clearPanels();

            for (var pk in game.units) {
                var unit = game.units[pk]
                if (unit.active) {
                    unit.active = false
                    unit.show()
                }
            }

            game.player.active = false
            game.player.show()
        }
    });
});

$("#leaveGame").click(function(){
    $.ajax({
        url : '/ajax/leave_game',
        success : function(response) {
            var fields = response[0].fields
            alert("winner: " + fields.winner + ", looser: " + fields.looser)
            window.location.replace("/")
        }
    });
});

function checkGame() {
    if (game == null) {
        loadGame()
        return
    }
    $.ajax({
        url : '/ajax/check_game',
        data : {'game_pk': game.pk},
        success : function(response) {
            if (!game.player.active && response['player_active']) {
                notifyAudio.play()
                game.clear()
                loadGame()
            }
            if (response['game']) {
                var fields = jQuery.parseJSON(response['game'])[0].fields
                alert("winner: " + fields.winner + ", looser: " + fields.looser)
                window.location.replace("/")
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

            var opponent = jQuery.parseJSON(response['opponent'])[0]
            if (opponent) {
                fields = opponent.fields
                var opponent = new Player(fields.money, fields.color, fields.active)
            }

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
        }
    });
}

initGame();