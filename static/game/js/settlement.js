var SETTLEMENT_TYPE = {
    1 : {name: 'Colony', code: 'S', icon: 'icon-house.png'},
    2 : {name: 'Fort', code: 'F', icon: 'icon-fort.png'},
    3 : {name: 'Castle', code: 'C', icon: 'icon-temple.png'}
};

function Settlement(pk, map, player, type, left, top, active) {
    this.map = map
    this.pk = pk
    this.player = player
    this.settlement_type = type
    this.left = left
    this.top = top
    this.active = active
}

Settlement.prototype.show = function() {
    var type = SETTLEMENT_TYPE[this.settlement_type]
    var layer = new Kinetic.Layer();
    var x = (this.left - 1) * FIELD_SIZE
    var y = (this.top - 1) * FIELD_SIZE
    var that = this

    var settlement = new Kinetic.Rect({
        x: x,
        y: y,
        width: FIELD_SIZE,
        height: FIELD_SIZE,
        fill: 'red',
        stroke: 'blue'
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
                url : 'buy_unit',
                data : {'player':  1, 'type': unit_type, 'settlement_pk': that.pk, 'map': '1'},
                success : function(records) {
                    hidePurchasesPanel()
                    var pk = records[0].pk
                    var field = records[0].fields
                    var unit = new Unit(pk, field.map, field.player, field.unit_type, field.left, field.top, field.active)
                    unit.show()
                    loadPlayer()
                }
            });
        });
        $('#upgradeSettlement').click(function(){
            $.ajax({
                url : 'upgrade_settlement',
                data : {'player':  1, 'type': that.settlement_type + 1, 'settlement_pk': that.pk, 'map': '1'},
                success : function(records) {
                    hidePurchasesPanel()
                    var field = records[0].fields
                    that.settlement_type = field.settlement_type
                    that.active = field.active
                    that.show()
                    loadPlayer()
                }
            });
        });
    });

    var settlementText = new Kinetic.Text({
        x: settlement.getX() + 5,
        y: settlement.getY(),
        text: type.code,
        fontSize: 50,
        fill: 'white',
        listening: false
    });

    layer.add(settlement);
    layer.add(settlementText);
    stage.add(layer);
}

Settlement.prototype.setPurchasesPanel = function() {
    var that = this
    $.ajax({
        url : 'check_settlement_active',
        data : {'pk': this.pk},
        success : function(response) {
            that.active = response['active']
            if (that.active) $('#purchasesPanel').children().prop('disabled', false)
            else $('#purchasesPanel').children().prop('disabled', true)
            $('#purchasesPanel').css({visibility: 'visible'})
        }
    });
}

function loadSettlements() {
    $.ajax({
        url : 'load_settlements',
        success : function(records) {
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var settlement =
                    new Settlement(pk, field.map, field.player, field.settlement_type, field.left, field.top, field.active)
                settlement.show()
            }
        }
    });
}

function hidePurchasesPanel() {
    $('#purchasesPanel').css({visibility: 'hidden'})
}