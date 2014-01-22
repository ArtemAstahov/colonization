function Player(money, color, active) {
    this.money = money
    this.color = color
    this.active = active
}

Player.prototype.show = function() {
    var active = this.active ? "ваш ход" : "ход противника"
    $('#player').html("монеты: " + this.money + ", " + active)
    if (this.active) {
        $('#finishStroke').css({visibility: 'visible'})
    } else {
        $('#finishStroke').css({visibility: 'hidden'})
    }
}
