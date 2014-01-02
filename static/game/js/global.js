var FIELD_SIZE = 40

var stage = new Kinetic.Stage({
        container: 'container',
        width: 1300,
        height: 600
});

var units = {}
var player = null
var playerDeferred = $.Deferred();