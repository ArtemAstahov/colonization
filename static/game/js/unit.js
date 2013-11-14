function Unit(player, type, position) {
    this.player = player
    this.type = type
    this.position = position
}

Unit.prototype.show = function(){
    var c=document.getElementById("gameCanvas");
    var ctx=c.getContext("2d");
    ctx.fillRect((this.position[0] - 1) * FIELD_SIZE, (this.position[1] - 1) * FIELD_SIZE, FIELD_SIZE, FIELD_SIZE);
}