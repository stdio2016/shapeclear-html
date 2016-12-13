function Board(game) {
    this.shapes = [];
    this.height = 9;
    this.width = 9;
    this.game = game;
    this.boardGroup = null;
    this.shapeGroup = null;
}

Board.prototype.generateSimple = function () {
    this.shapes = new Array(this.height * this.width);
    var arr = this.shapes;
    var height = this.height;
    var width = this.width;
    var gameWidth = this.game.width;
    var gameHeight = this.game.height;
    var gridSize = Math.min(gameWidth, gameHeight) / 10;
    this.boardGroup = this.game.add.group();
    this.shapeGroup = this.game.add.group();
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var r = Math.floor(Math.random() * 4);
            var board = this.boardGroup.create(i * gridSize, (j + 1) * gridSize, 'board');
            board.width = board.height = gridSize;
            var sprite = this.shapeGroup.create(i * gridSize, (j + 1) * gridSize,
              ['triangle', 'square', 'circle', 'hexagon'][r]);
            arr[i * width + j] = {shape: r, sprite: sprite};
            sprite.width = gridSize;
            sprite.height = gridSize;
        }
    }
    this.boardGroup.alpha = 20;
}
