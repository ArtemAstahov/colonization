var UNIT_TYPE = {
    1 : {name: 'Settler', code: 'S', steps: 1},
    2 : {name: 'Militiaman', code: 'M', steps: 1},
    3 : {name: 'Scout', code: 'C', steps: 2},
    4 : {name: 'Officer', code: 'O', steps: 1},
    5 : {name: 'Dragoon', code: 'D', steps: 2}
};

function Unit(pk, map, player, type, left, top, active) {
    this.map = map
    this.pk = pk
    this.player = player
    this.unit_type = type
    this.left = left
    this.top = top
    this.active = active
    this.layer = new Kinetic.Layer()
    stage.add(this.layer);
}

Unit.prototype.show = function() {
    var type = UNIT_TYPE[this.unit_type]
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
        draggable: this.active,
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
        that.layer.destroyChildren()
        that.layer.add(border)
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
        $('#missStroke').off('click')
        $('#createColony').off('click')
        that.layer.moveToTop()

        $('#missStroke').css({visibility: 'visible'})
        if(that.unit_type == 1) {
            $('#createColony').css({visibility: 'visible'})
            $('#createColony').click(function() {
                $('#createColony').css({visibility: 'hidden'})
                $('#createColony').off('click')
                that.createColony()
            });
        }

        $('#missStroke').click(function() {
            $('#missStroke').css({visibility: 'hidden'})
            $('#missStroke').off('click')
            that.layer.destroyChildren()
            that.move()
        });
    });

    var shadow = new Kinetic.Rect({
        x: x,
        y: y,
        width: FIELD_SIZE,
        height: FIELD_SIZE,
        fill: 'red',
        listening: false,
        opacity: 0.5
    });

    if(this.active) this.layer.add(unit)

    this.layer.add(shadow)
    this.layer.add(unitText)

    if(!this.active) this.layer.moveToBottom()

    this.layer.draw()
}

Unit.prototype.createColony = function() {
    var that = this
    this.layer.destroy()
    $.ajax({
        url : 'create_colony',
        data : {'pk':  that.pk},
        success : function(records) {
            var pk = records[0].pk
            var field = records[0].fields
            var settlement =
                new Settlement(pk, field.map, field.player, field.settlement_type, field.left, field.top, field.active)
            settlement.show()
            delete that
        }
    });
}

Unit.prototype.move = function() {
    this.layer.destroyChildren()
    $('#missStroke').css({visibility: 'hidden'})
    $('#createColony').css({visibility: 'hidden'})
    var that = this
    $.ajax({
        url : 'move_unit',
        data : {'pk':  this.pk, 'left': this.left, 'top': this.top},
        success : function(records) {
            var field = records[0].fields
            that.left = field.left;
            that.top = field.top;
            that.active = field.active;
            that.show()
        }
    });
}

function loadUnits() {
    $.ajax({
        url : 'load_units',
        success : function(records) {
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var unit = new Unit(pk, field.map, field.player, field.unit_type, field.left, field.top, field.active)
                unit.show()
            }
        }
    });
}