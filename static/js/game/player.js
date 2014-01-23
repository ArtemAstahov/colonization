function Player(money, color, active) {
    this.money = money
    this.color = color
    this.active = active
}

Player.prototype.show = function() {
    $('#player').html(this.money)
    if (this.active) {
        $("#finishStroke").attr({
            src: "/static/img/game/recycle.png",
            title: "Завершить Ход"
        })
        $("#finishStroke").css({visibility: 'visible'})
    } else {
        $("#finishStroke").css({visibility: 'hidden'})
    }
}
