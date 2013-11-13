function Unit(player, type, position) {
    this.player = player
    this.type = type
    this.position = position
}

Unit.prototype.show = function(){
    alert("player: " + this.player + " type: " + this.type + " position: " + this.position);
}