function Board(game) {
    this.shapes = [];
    this.tiles = [];
    this.height = 9;
    this.width = 9;
    this.game = game;
    this.boardGroup = null;
    this.shapeGroup = null;
    this.swaps = [];

    // position of board in the game
    this.x = 0;
    this.y = 0;
    this.gridSize = 0;
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
            var board = this.boardGroup.create(i * gridSize, (j + 1) * gridSize, 'shapes', 'board');
            board.width = board.height = gridSize;
            var sprite = this.shapeGroup.create(i * gridSize, (j + 1) * gridSize, 'shapes',
              ['triangle', 'square', 'circle', 'hexagon'][r]);
            var sh = new Shape(i, j, r);
            arr[i * width + j] = sh;
            sh.sprite = sprite;
            this.tiles.push({sprite: board});
            sprite.width = gridSize;
            sprite.height = gridSize;
        }
    }
    this.boardGroup.alpha = 0.8;
};

Board.prototype.getShape = function (x, y) {
    // bound check
    if (x >= this.width || x < 0) return null;
    if (y >= this.height || y < 0) return null;
    return this.shapes[x + y * this.width];
};

Board.prototype.addSwap = function(from, to) {
    var sh1 = this.getShape(from.x, from.y);
    var sh2 = this.getShape(to.x, to.y);
    this.swaps.push(new Swap(sh1, sh2, 10));
    this.shapes[from.x + from.y * this.width] = sh2;
    this.shapes[to.x + to.y * this.width] = sh1;
    sh1.swapping = sh2.swapping = true;
    var dx = to.x - from.x;
    var dy = to.y - from.y;
    sh1.dir = {x: dx, y: dy};
    sh2.dir = {x: -dx, y: -dy};
};

Board.prototype.update = function () {
    this.updateSwaps();
};

Board.prototype.updateSwaps = function () {
    for (var i = 0; i < this.swaps.length; i++) {
        var from = this.swaps[i].from;
        var to = this.swaps[i].to;
        this.swaps[i].tick--;
        from.pos = to.pos = this.swaps[i].interpolatedPos() * 10;
        if (this.swaps[i].tick == 0) {
            this.swaps[i] = this.swaps[this.swaps.length - 1];
            this.swaps.length--;
            from.swapping = false;
            to.swapping = false;
        }
    }
};
