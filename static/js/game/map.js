var FIELD_SIZE = 40

var stage = new Kinetic.Stage({
        container: 'container',
        width: 18 * FIELD_SIZE, // 720
        height: 14 * FIELD_SIZE // 560
});

function createMap() {
    var layer = new Kinetic.Layer();
    var image = new Image()
    var map = new Kinetic.Image({
        x: 0,
        y: 0,
        image: image,
        width: 18 * FIELD_SIZE,
        height: 14 * FIELD_SIZE,
        listening: false
    });
    image.onload = function() {
        layer.add(map)
        layer.moveToBottom()
        layer.draw()
    };
    image.src = "/static/img/game/map.png"
    stage.add(layer);
}