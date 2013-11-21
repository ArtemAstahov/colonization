function Player(pk, name, money, color, active) {
    this.pk = pk
    this.name = name
    this.money = money
    this.color = color
    this.active = active
}

Player.prototype.show = function() {
    $('#player').html("name: " + this.name + ", money: " + this.money + ", active: " + this.active)
}

function loadPlayer() {
    $.ajax({
        url : 'load_player',
        data : {'pk': 1},
        success : function(records) {
            delete Player
            var pk = records[0].pk
            var field = records[0].fields
            var player = new Player(pk, field.name, field.money, field.color, field.active)
            player.show()
        }
    });
}