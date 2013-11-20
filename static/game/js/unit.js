var UNIT_TYPE = {
    1 : {name: 'Settler', code: 'S', steps: 1},
    2 : {name: 'Militiaman', code: 'M', steps: 1},
    3 : {name: 'Scout', code: 'C', steps: 2},
    4 : {name: 'Officer', code: 'O', steps: 1},
    5 : {name: 'Dragoon', code: 'D', steps: 2}
};

function Unit(pk, map, player, type, left, top) {
    this.map = map
    this.pk = pk
    this.player = player
    this.unit_type = type
    this.left = left
    this.top = top
}

Unit.prototype.show = function() {
    var type = UNIT_TYPE[this.unit_type]
    var layer = new Kinetic.Layer();
    var x = (this.left - 1) * FIELD_SIZE
    var y = (this.top - 1) * FIELD_SIZE
    var that = this

    var border = new Kinetic.Rect({
        x: x - (type.steps) * FIELD_SIZE,
        y: y - (type.steps) * FIELD_SIZE,
        width: (2 * type.steps  + 1) * FIELD_SIZE,
        height: (2 * type.steps  + 1) * FIELD_SIZE,
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
                if(pos < rectPos - (type.steps) * FIELD_SIZE) return rectPos - (type.steps) * FIELD_SIZE;
                else if(pos > rectPos + (type.steps) * FIELD_SIZE) return rectPos + (type.steps) * FIELD_SIZE;
                else return pos
            };

            return {
                x: border(pos.x, x),
                y: border(pos.y, y)
            };
        }
    });

    var unitText = new Kinetic.Text({
        x: unit.getX() + 5,
        y: unit.getY(),
        text: type.code,
        fontSize: 50,
        fill: 'white',
        listening: false
    });

    unit.on('mouseup', function() {
        layer.destroy();
        var absolutePosition = stage.getPointerPosition();
        var left = parseInt(absolutePosition.x / FIELD_SIZE) + 1;
        var top = parseInt(absolutePosition.y / FIELD_SIZE) + 1;
        if (that.left != left || that.top != top) {
            that.left = left;
            that.top = top;
            that.move()
        } else {
            that.show();
        }
    });

    unit.on('mousedown', function() {
        if (layer.children.length == 3) layer.add(border)
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
    layer.add(unitText);
    stage.add(layer);
}

Unit.prototype.move = function() {
    var that = this
    $.ajax({
        url : 'move_unit/',
        data: {'pk':  this.pk, 'left': this.left, 'top': this.top},
        success : function(records) {
            var field = records[0].fields
            that.left = field.left;
            that.top = field.top;
            that.show()
        }
    });
}

function loadUnits() {
    $.ajax({
        url : 'load_units/',
        success : function(records) {
            stage.clear()
            createMap()
            loadSettlements()
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var unit = new Unit(pk, field.map, field.player, field.unit_type, field.left, field.top)
                unit.show()
            }
        }
    });
}