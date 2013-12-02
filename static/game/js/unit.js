var UNIT_TYPE = {
    1 : {name: 'Settler', code: 'S', steps: 1, icon: 'icon-men.png'},
    2 : {name: 'Militiaman', code: 'M', steps: 1, icon: 'icon-bow.png'},
    3 : {name: 'Scout', code: 'C', steps: 2, icon: 'icon-knight.png'},
    4 : {name: 'Officer', code: 'O', steps: 1, icon: 'icon-sword.png'},
    5 : {name: 'Dragoon', code: 'D', steps: 2, icon: 'icon-quake.png'}
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
    var x = (this.left - 1) * FIELD_SIZE + UNIT_DELTA
    var y = (this.top - 1) * FIELD_SIZE + UNIT_DELTA
    var that = this

    var border = new Kinetic.Rect({
        x: x - UNIT_DELTA - (type.steps) * FIELD_SIZE,
        y: y - UNIT_DELTA - (type.steps) * FIELD_SIZE,
        width: (2 * type.steps  + 1) * FIELD_SIZE,
        height: (2 * type.steps  + 1) * FIELD_SIZE,
        stroke: 'red',
        strokeWidth: 2.5,
        listening: false
    });

    var image = new Image();

    var unit = new Kinetic.Image({
        x: x,
        y: y,
        image: image,
        fill: 'red',
        stroke: 'red',
        width: UNIT_SIZE,
        height: UNIT_SIZE,
        draggable: true,
        dragBoundFunc: function (pos) {
            var border = function (pos, rectPos) {
                if (pos < rectPos - (type.steps) * FIELD_SIZE) return rectPos - (type.steps) * FIELD_SIZE;
                else if (pos > rectPos + (type.steps) * FIELD_SIZE) return rectPos + (type.steps) * FIELD_SIZE;
                else return pos
            };

            return {
                x: border(pos.x, x),
                y: border(pos.y, y)
            };
        }
    });

    unit.on('mouseup', function() {
        that.layer.destroyChildren()
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
        that.layer.moveToTop()
        if (that.layer.children.length == 2) that.layer.add(border)

        $('#missStroke').off('click')
        $('#missStroke').css({visibility: 'visible'})
        hidePurchasesPanel()

        $('#missStroke').click(function() {
            $('#missStroke').css({visibility: 'hidden'})
            $('#missStroke').off('click')
            that.layer.destroyChildren()
            that.move()
        });

        $('#createColony').css({visibility: 'hidden'})
        if(that.unit_type == 1) {
            that.setCreateColony()
        }
    });

    var shadow = new Kinetic.Image({
        x: x,
        y: y,
        image: image,
        fill: 'red',
        opacity: 0.5,
        width: UNIT_SIZE,
        height: UNIT_SIZE,
        listening: false
    });

    image.onload = function() {
        that.layer.add(shadow);

        if(that.active) {
            that.layer.add(unit);
        } else {
            that.layer.moveToBottom()
        }
        that.layer.draw()
    };
    image.src = "/static/game/img/" + type.icon
}

Unit.prototype.createColony = function() {
    var that = this
    $.ajax({
        url : 'create_colony',
        data : {'pk':  that.pk},
        success : function(records) {
            that.layer.destroy()
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
    hideUnitPanel()
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

Unit.prototype.setCreateColony = function() {
    var that = this
    $.ajax({
        url : 'check_settlements_margins',
        data : {'pk': this.pk},
        success : function(response) {
            var available = response['available']
            if (response['available']) {
                $('#createColony').off('click')
                $('#createColony').css({visibility: 'visible'})
                $('#createColony').click(function() {
                    $('#createColony').css({visibility: 'hidden'})
                    $('#createColony').off('click')
                    that.createColony()
                });
            } else {
                $('#createColony').css({visibility: 'hidden'})
            }
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

function hideUnitPanel() {
    $('#createColony').css({visibility: 'hidden'})
    $('#missStroke').css({visibility: 'hidden'})
}