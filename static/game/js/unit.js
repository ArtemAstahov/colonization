var UNIT_TYPE = {
    1 : {name: 'Settler', code: 'S', steps: 1, icon: 'icon-men.png'},
    2 : {name: 'Militiaman', code: 'M', steps: 1, icon: 'icon-bow.png'},
    3 : {name: 'Scout', code: 'C', steps: 2, icon: 'icon-knight.png'},
    4 : {name: 'Officer', code: 'O', steps: 1, icon: 'icon-sword.png'},
    5 : {name: 'Dragoon', code: 'D', steps: 2, icon: 'icon-quake.png'}
};

function Unit(pk, type, left, top, active) {
    this.pk = pk
    this.unit_type = type
    this.left = left
    this.top = top
    this.active = active
    this.layer = new Kinetic.Layer()
    stage.add(this.layer);
}

Unit.prototype.show = function() {
    this.layer.destroyChildren()
    this.layer.clear()
    var type = UNIT_TYPE[this.unit_type]
    var x = (this.left - 1) * FIELD_SIZE
    var y = (this.top - 1) * FIELD_SIZE
    var that = this

    var border = new Kinetic.Rect({
        x: x - (type.steps) * FIELD_SIZE,
        y: y - (type.steps) * FIELD_SIZE,
        width: (2 * type.steps  + 1) * FIELD_SIZE,
        height: (2 * type.steps  + 1) * FIELD_SIZE,
        fill: 'yellow',
        opacity: 0.15,
        listening: false
    });

    var image = new Image();

    var unit = new Kinetic.Image({
        x: x,
        y: y,
        image: image,
        width: FIELD_SIZE,
        height: FIELD_SIZE,
        draggable: true,
        fill: player.color,
        shadowColor: 'yellow',
        shadowBlur: 18,
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
        $('#missStroke').css({display: 'block'})
        hidePurchasesPanel()

        $('#missStroke').click(function() {
            $('#missStroke').css({display: 'none'})
            $('#missStroke').off('click')
            that.layer.destroyChildren()
            that.move()
        });

        $('#createColony').css({display: 'none'})
        if(that.unit_type == 1) {
            that.setCreateColony()
        }
    });

    var shadow = new Kinetic.Image({
        x: x,
        y: y,
        image: image,
        opacity: 0.5,
        width: FIELD_SIZE,
        height: FIELD_SIZE,
        fill: player.color,
        shadowColor: 'white',
        listening: false
    });

    image.onload = function() {
        that.layer.add(shadow);

        if(that.active) {
            that.layer.add(unit);
        } else {
            that.layer.moveDown()
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
                new Settlement(pk, field.settlement_type, field.left, field.top, field.active)
            settlement.show()
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
                $('#createColony').css({display: 'block'})
                $('#createColony').click(function() {
                    $('#createColony').css({display: 'none'})
                    $('#createColony').off('click')
                    that.createColony()
                });
            } else {
                $('#createColony').css({display: 'none'})
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
                var unit = new Unit(pk, field.unit_type, field.left, field.top, field.active)
                units[pk] = unit
                unit.show()
            }
        }
    });
}

function updateUnits() {
    for (var pk in units) {
        var unit = units[pk]
        if (!unit.active) {
            unit.active = true
            unit.show()
        }
    }
}

function hideUnitPanel() {
    $('#createColony').css({display: 'none'})
    $('#missStroke').css({display: 'none'})
}