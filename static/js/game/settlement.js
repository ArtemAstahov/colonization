var SETTLEMENT_OFFSET = 5

var SETTLEMENT_TYPE = {
    1 : {name: 'Colony', code: 'S', icon: 'icon-house.png'},
    2 : {name: 'Fort', code: 'F', icon: 'icon-temple.png'},
    3 : {name: 'Castle', code: 'C', icon: 'icon-fort.png'}
};

function Settlement(pk, type, left, top, active, color) {
    this.pk = pk
    this.settlement_type = type
    this.left = left
    this.top = top
    this.active = active
    this.color = color
    this.layer = new Kinetic.Layer()
    stage.add(this.layer);
}

Settlement.prototype.show = function() {
    var type = SETTLEMENT_TYPE[this.settlement_type]
    var x = (this.left - 1) * FIELD_SIZE
    var y = (this.top - 1) * FIELD_SIZE
    var that = this

    var image = new Image();

    var settlement = new Kinetic.Image({
        x: x - SETTLEMENT_OFFSET,
        y: y - SETTLEMENT_OFFSET,
        image: image,
        fill: that.color,
        shadowColor: 'white',
        shadowBlur: 15,
        width: FIELD_SIZE + 2 * SETTLEMENT_OFFSET,
        height: FIELD_SIZE + 2 * SETTLEMENT_OFFSET
    });

    settlement.off("mouseup")

    settlement.on('mousedown', function() {
        $('.buyUnit').off('click')
        $('#upgradeSettlement').off('click')
        that.setPurchasesPanel()
        hideUnitPanel()
        $('.buyUnit').click(function(){
            var unit_type = this.name
            $.ajax({
                url : '/ajax/buy_unit',
                data : {'type': unit_type, 'settlement_pk': that.pk},
                success : function(records) {
                    hidePurchasesPanel()
                    var pk = records[0].pk
                    var fields = records[0].fields
                    var unit = new Unit(pk, fields.unit_type, fields.left, fields.top, fields.active, game.player.color)
                    unit.show()
                    game.units[pk] = unit
                    game.player.money -= UNIT_TYPE[unit_type]['cost']
                    game.player.show()
                }
            });
        });
        $('#upgradeSettlement').click(function(){
            $.ajax({
                url : '/ajax/upgrade_settlement',
                data : {'type': that.settlement_type + 1, 'settlement_pk': that.pk},
                success : function(records) {
                    hidePurchasesPanel()

                    game.player.money -= 15
                    game.player.show()

                    var fields = records[0].fields
                    that.settlement_type = fields.settlement_type
                    that.active = fields.active
                    that.layer.clear()
                    that.show()
                }
            });
        });
    });

    image.onload = function() {
        that.layer.add(settlement);
        that.layer.draw()
    };
    image.src = "/static/img/game/" + type.icon
}

Settlement.prototype.setPurchasesPanel = function() {
    var that = this
    if (game.player.active) {
        $.ajax({
            url : '/ajax/check_settlement_active',
            data : {'pk': this.pk},
            success : function(response) {
                that.active = response['active']
                if (that.active) {
                    $('#upgradeSettlement').css({visibility: 'visible'})
                    $('#purchasesPanel').css({display: 'block'})
                    if (that.settlement_type == 1) {
                        $("#upgradeSettlement").attr({
                            title: "форт: атака 1, прирост 1, стоимость 15"
                        })
                        $("#upgradeSettlement").children().attr({
                            src: "/static/img/game/icon-temple.png"
                        })
                    } else if(that.settlement_type == 2) {
                        $("#upgradeSettlement").attr({
                            title: "замок: атака 2, прирост 2, стоимость 15"
                        })
                        $("#upgradeSettlement").children().attr({
                            src: "/static/img/game/icon-fort.png"
                        })
                    } else {
                        $('#upgradeSettlement').css({visibility: 'hidden'})
                    }
                } else {
                    hidePurchasesPanel()
                }
            }
        });
    }
}

Settlement.prototype.delete = function() {
    this.layer.removeChildren()
    this.layer.clear()
    this.layer.destroy()
    stage.remove(this.layer)
    delete this
}

function hidePurchasesPanel() {
    $('#upgradeSettlement').css({visibility: 'hidden'})
    $('#purchasesPanel').css({display: 'none'})
}