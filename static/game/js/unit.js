function Unit(pk, player, type, left, top) {
    this.pk = pk
    this.player = player
    this.unit_type = type
    this.left = left
    this.top = top
}

Unit.prototype.show = function() {
    var layer = new Kinetic.Layer();
    var x = (this.left - 1) * FIELD_SIZE
    var y = (this.top - 1) * FIELD_SIZE

    var border = new Kinetic.Rect({
        x: x - FIELD_SIZE,
        y: y - FIELD_SIZE,
        width: 3 * FIELD_SIZE,
        height: 3 * FIELD_SIZE,
        stroke: 'red',
        strokeWidth: 2.5,
        listening: false
    });

    var unit = new Kinetic.Rect({
        x: x,
        y: y,
        width: FIELD_SIZE,
        height: FIELD_SIZE,
        fill: 'red',
        stroke: 'yellow',
        draggable: true,
        dragBoundFunc: function(pos) {
            var border = function(pos, rectPos) {
                if(pos < rectPos - FIELD_SIZE) return rectPos - FIELD_SIZE;
                else if(pos > rectPos + FIELD_SIZE) return rectPos + FIELD_SIZE;
                else return pos
            };

            return {
                x: border(pos.x, x),
                y: border(pos.y, y)
            };
        }
    });

    unit.on('mouseup', function() {
        layer.destroyChildren()
        layer.destroy()
        var absolutePosition = stage.getPointerPosition()
        var left = parseInt(absolutePosition.x / FIELD_SIZE) + 1
        var top = parseInt(absolutePosition.y / FIELD_SIZE) + 1
        new Unit(this.pk, this.player, this.unit_type, left, top).show()
        delete this
    });

    unit.on('mousedown', function() {
        if (layer.children.length == 2) layer.add(border)
    });

    var shadow = new Kinetic.Rect({
        x: x,
        y: y,
        width: FIELD_SIZE,
        height: FIELD_SIZE,
        fill: 'red',
        opacity: 0.5
    });

    layer.add(shadow);
    layer.add(unit);
    stage.add(layer);
}
