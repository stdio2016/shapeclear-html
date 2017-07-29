function BoardRenderer(board) {
    this.board = board;
    this.boardGroup = null;
    this.shapeGroup = null;
    this.digitGroup = null;
    // position of the board
    this.x = 0;
    this.y = 0;
    this.gridSize = 0;
    // private! all visible shapes
    this.visibleShapes = [];
    // private! sprites associated with each visibleShape
    this.sprites = [];
    // updated[i] == true means board.shapes[i] is updated
    this.updated = [];
    for (var i = 0; i < board.shapes.length; i++) this.updated.push(0);
}

BoardRenderer.prototype.renderAt = function (leftX, topY, size) {
    var board = this.board;
    var boardSize = 9;
    this.gridSize = size / boardSize;
    this.x = leftX + (boardSize - board.width) / 2 * this.gridSize;
    this.y = topY + (boardSize - board.height) / 2 * this.gridSize;
    this.render();
};

BoardRenderer.prototype.render = function () {
    var board = this.board;
    for (var i = 0; i < board.shapes.length; i++) this.updated[i] = 0;
    // draw shapes that exist in previous frame
    for (var i = 0; i < this.sprites.length; i++) {
        var sh = this.visibleShapes[i];
        this.drawShape(sh, i);
        if (sh.x < board.width && sh.y < board.height) { // TODO: inside view range
            this.updated[sh.x + board.width * sh.y] = 1;
        }
        if (sh.isDeleted()) {
            this.sprites[i].forEach(function(x){ x.kill(); });
            this.visibleShapes[i] = this.visibleShapes[this.visibleShapes.length - 1];
            this.visibleShapes.length--;
            this.sprites[i] = this.sprites[this.sprites.length - 1];
            this.sprites.length--;
            i--;
        }
    }
    // draw shapes in the board
    for (var y = 0; y < board.height; y++) {
        for (var x = 0; x < board.width; x++) {
            if (this.updated[x + board.width * y] === 0) {
                var sh = board.shapes[x + board.width * y];
                if (sh.isDeleted()) continue;
                this.sprites.push([]);
                this.visibleShapes.push(sh);
                this.drawShape(sh, this.visibleShapes.length - 1);
            }
        }
    }
};

BoardRenderer.prototype.drawShape = function (shape, index) {
    var sprites = this.sprites[index], spr;
    var scale = this.gridSize / 36;
    if (sprites.length < 1) {
        spr = this.shapeGroup.getFirstDead(true, 100, 100, 'shapes', Shape.typeNames[shape.type-1]);
        sprites.push(spr);
    }
    spr = sprites[0];
    spr.anchor.set(0.5, 0.5);
    spr.x = this.x + (shape.x - shape.dir.x * shape.pos/10 + 0.5) * this.gridSize;
    spr.y = this.y + (shape.y - shape.dir.y * shape.pos/10 + 0.5) * this.gridSize;
    spr.scale.set(scale);
};
