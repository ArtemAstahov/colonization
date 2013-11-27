var checked_settlement;

var SETTLEMENT_TYPE = {
    1 : {name: 'Colony', code: 'S'},
    2 : {name: 'Fort', code: 'F'},
    3 : {name: 'Castle', code: 'C'}
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

    settlement.on('click', function() {
        //TODO: checking active per time from server and ask nekit!!!
        that.checkActive()
        if (that.active) $('#buyPanel').children().prop('disabled', false)
        else $('#buyPanel').children().prop('disabled', true)
        $('#buyPanel').css({visibility: 'visible'})
        checked_settlement = that.pk
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

Settlement.prototype.checkActive = function() {
    var that = this
    $.ajax({
        url : 'check_settlement_active',
        data : {'pk': this.pk},
        success : function(active) {
            that.active = new Boolean(active).valueOf()
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

$('.buyUnit').click(function(){
    var that = this
    $.ajax({
        url : 'buy_unit',
        data : {'player':  1, 'type': that.name, 'settlement_pk': checked_settlement, 'map': '1'},
        success : function(records) {
            $('#buyPanel').css({visibility: 'hidden'})
            var pk = records[0].pk
            var field = records[0].fields
            var unit = new Unit(pk, field.map, field.player, field.unit_type, field.left, field.top, field.active)
            unit.show()
            loadPlayer()
        }
    });
});