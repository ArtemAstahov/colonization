var UNIT_TYPE = {
    1 : {name: 'Settler', code: 'S', steps: 1, icon: 'icon-men.png', cost: 10},
    2 : {name: 'Militiaman', code: 'M', steps: 1, icon: 'icon-bow.png', cost: 2},
    3 : {name: 'Scout', code: 'C', steps: 2, icon: 'icon-knight.png', cost: 4},
    4 : {name: 'Officer', code: 'O', steps: 1, icon: 'icon-sword.png', cost: 4},
    5 : {name: 'Dragoon', code: 'D', steps: 2, icon: 'icon-quake.png', cost: 6}
};

function Unit(pk, type, left, top, active, color) {
    this.pk = pk
    this.unit_type = type
    this.left = left
    this.top = top
    this.active = active
    this.color = color
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
        fill: that.color,
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
        fill: that.color,
        shadowColor: 'white',
        listening: false
    });

    image.onload = function() {
        that.layer.add(shadow)
        that.layer.moveUp()
        that.layer.moveUp()

        if(that.active) {
            that.layer.add(unit)
            that.layer.moveToTop()
        }

        that.layer.draw()
    };
    image.src = "/static/img/game/" + type.icon
}

Unit.prototype.createColony = function() {
    var that = this
    $.ajax({
        url : '/ajax/create_colony',
        data : {'pk':  that.pk},
        success : function(records) {
            that.layer.destroy()
            var pk = records[0].pk
            var field = records[0].fields
            var settlement =
                new Settlement(pk, field.settlement_type, field.left, field.top, field.active, game.player.color)
            game.settlements[pk] = settlement
            settlement.show()
        }
    });
}

Unit.prototype.move = function() {
    var that = this
    that.layer.destroyChildren()
    hideUnitPanel()
    $.ajax({
        url : '/ajax/move_unit',
        data : {'pk':  this.pk, 'left': this.left, 'top': this.top},
        success : function(response) {
            if (response) {
                var unit = jQuery.parseJSON(response['unit'])[0].fields
                that.left = unit.left;
                that.top = unit.top;
                that.active = unit.active;
                that.show()

                var opponent_unit = jQuery.parseJSON(response['opponent_unit'])
                if (opponent_unit) game.opponentUnits[opponent_unit[0].pk].delete()

                var opponentSettlements = jQuery.parseJSON(response['opponent_settlements'])
                for (var i = 0; i < opponentSettlements.length; i++) {
                    var pk = opponentSettlements[i].pk
                    if (!game.opponentSettlements[pk]) {
                        var field = opponentSettlements[i].fields
                        var settlement =
                            new Settlement(pk, field.settlement_type, field.left, field.top, field.active, game.opponent.color)
                        game.opponentSettlements[pk] = settlement
                        settlement.show()
                    }
                }

                var opponentUnits = jQuery.parseJSON(response['opponent_units'])
                for (var i = 0; i < opponentUnits.length; i++) {
                    var pk = opponentUnits[i].pk
                    if (!game.opponentUnits[pk]) {
                        var field = opponentUnits[i].fields
                        var unit = new Unit(pk, field.unit_type, field.left, field.top, field.active, game.opponent.color)
                        game.opponentUnits[pk] = unit
                        unit.show()
                    }
                }
            } else {
                that.delete()
            }
        }
    });
}

Unit.prototype.setCreateColony = function() {
    var that = this
    $.ajax({
        url : '/ajax/check_settlements_margins',
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

Unit.prototype.delete = function() {
    this.layer.removeChildren()
    this.layer.clear()
    this.layer.destroy()
    stage.remove(this.layer)
    delete this
}

function hideUnitPanel() {
    $('#createColony').css({display: 'none'})
    $('#missStroke').css({display: 'none'})
}