function Player(money, color, active) {
    this.money = money
    this.color = color
    this.active = active
}

Player.prototype.show = function() {
    $('#player').html("money: " + this.money + ", active: " + this.active)
    player = this
}

function loadPlayer() {
    $.ajax({
        url : 'load_player',
        success : function(records) {
            var field = records[0].fields
            var player = new Player(field.money, field.color, field.active)
            player.show()
            playerDeferred.resolve()
        }
    });
}
