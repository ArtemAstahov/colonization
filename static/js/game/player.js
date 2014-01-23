function Player(money, color, active) {
    this.money = money
    this.color = color
    this.active = active
}

Player.prototype.show = function() {
    $('#player').html(this.money)
    if (this.active) {
        $("#finishStroke").css({visibility: 'visible'})
    } else {
        $("#finishStroke").css({visibility: 'hidden'})
    }
}
