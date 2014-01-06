var settlements = {}
var opponentSettlements = {}
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
                    var field = records[0].fields
                    var unit = new Unit(pk, field.unit_type, field.left, field.top, field.active, player.color)
                    unit.show()
                    units[pk] = unit
                    loadPlayer()
                    updateOpponentUnits()
                }
            });
        });
        $('#upgradeSettlement').click(function(){
            $.ajax({
                url : '/ajax/upgrade_settlement',
                data : {'type': that.settlement_type + 1, 'settlement_pk': that.pk},
                success : function(records) {
                    hidePurchasesPanel()
                    var field = records[0].fields
                    that.settlement_type = field.settlement_type
                    that.active = field.active
                    that.layer.clear()
                    that.show()
                    loadPlayer()
                }
            });
        });
    });

    image.onload = function() {
        that.layer.add(settlement);
        that.layer.draw()
    };
    image.src = "/static/game/img/" + type.icon
}

Settlement.prototype.setPurchasesPanel = function() {
    var that = this
    if (player.active) {
        $.ajax({
            url : '/ajax/check_settlement_active',
            data : {'pk': this.pk},
            success : function(response) {
                that.active = response['active']
                if (that.active) {
                    $('#purchasesPanel').css({display: 'block'})
                } else {
                    $('#purchasesPanel').css({display: 'none'})
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

function clearOpponentSettlements() {
    for (var pk in opponentSettlements) {
        var settlement = opponentSettlements[pk]
        settlement.delete()
    }
    opponentSettlements = {}
}

function clearSettlements() {
    for (var pk in settlements) {
        var settlement = settlements[pk]
        settlement.delete()
    }
    settlements = {}
}

function updateSettlements() {
    $.ajax({
        url : '/ajax/load_settlements',
        success : function(records) {
            clearSettlements()
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var settlement = new Settlement(pk, field.settlement_type, field.left, field.top, field.active, player.color)
                settlements[pk] = settlement
                settlement.show()
            }
        }
    });
}

function updateOpponentSettlements() {
    $.ajax({
        url : '/ajax/load_opponent_settlements',
        success : function(records) {
            clearOpponentSettlements()
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var opponentSettlement = new Settlement(pk, field.settlement_type, field.left, field.top, false, 'black')
                opponentSettlements[pk] = opponentSettlement
                opponentSettlement.show()
            }
        }
    });
}

function hidePurchasesPanel() {
    $('#purchasesPanel').css({display: 'none'})
}