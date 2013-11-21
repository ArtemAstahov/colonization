var SETTLEMENT_TYPE = {
    1 : {name: 'Colony', code: 'S'},
    2 : {name: 'Fort', code: 'F'},
    3 : {name: 'Castle', code: 'C'}
};

function Settlement(pk, map, player, type, left, top) {
    this.map = map
    this.pk = pk
    this.player = player
    this.settlement_type = type
    this.left = left
    this.top = top
}

Settlement.prototype.show = function() {
    var type = SETTLEMENT_TYPE[this.settlement_type]
    var layer = new Kinetic.Layer();
    var x = (this.left - 1) * FIELD_SIZE
    var y = (this.top - 1) * FIELD_SIZE

    var settlement = new Kinetic.Rect({
        x: x,
        y: y,
        width: FIELD_SIZE,
        height: FIELD_SIZE,
        fill: 'red',
        stroke: 'blue',
        listening: false
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

function loadSettlements() {
    $.ajax({
        url : 'load_settlements',
        success : function(records) {
            for (var i = 0; i < records.length; i++) {
                var pk = records[i].pk
                var field = records[i].fields
                var settlement = new Settlement(pk, field.map, field.player, field.settlement_type, field.left, field.top)
                settlement.show()
            }
        }
    });
}