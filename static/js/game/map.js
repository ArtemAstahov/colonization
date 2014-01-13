var FIELD_SIZE = 40

var stage = new Kinetic.Stage({
        container: 'container',
        width: 30 * FIELD_SIZE, // 1200
        height: 15 * FIELD_SIZE // 600
});

function createMap() {
    var layer = new Kinetic.Layer();
    var image = new Image()
    var map = new Kinetic.Image({
        x: 0,
        y: 0,
        image: image,
        width: 30 * FIELD_SIZE,
        height: 15 * FIELD_SIZE,
        listening: false
    });
    image.onload = function() {
        layer.add(map)
        layer.moveToBottom()
        layer.draw()
    };
    image.src = "/static/img/game/map.jpg"
    stage.add(layer);
}