function Player(pk, money, color, active) {
    this.pk = pk
    this.money = money
    this.color = color
    this.active = active
}

Player.prototype.show = function() {
    $('#player').html("money: " + this.money + ", active: " + this.active)
}

function loadPlayer() {
    $.ajax({
        url : 'load_player',
        data : {'pk': 1},
        success : function(records) {
            var pk = records[0].pk
            var field = records[0].fields
            var player = new Player(pk, field.money, field.color, field.active)
            player.show()
        }
    });
}