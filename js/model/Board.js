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
            var r1, r2;
            if (i >= 2) {
                r1 = this.getShape(j, i - 1).type;
                if (this.getShape(j, i - 2).type !== r1) {
                    r1 = -1;
                }
            }
            if (j >= 2) {
                r2 = this.getShape(j - 2, i).type;
                if (this.getShape(j - 1, i).type !== r2) {
                    r2 = -1;
                }
            }
            var r;
            do {
                r = this.game.rnd.between(1, 6);
            } while (r1 == r || r2 == r) ;
            var board = this.boardGroup.create(i * gridSize, (j + 1) * gridSize, 'shapes', 'board');
            board.width = board.height = gridSize;
            var sprite = this.shapeGroup.create(i * gridSize, (j + 1) * gridSize, 'shapes',
              ['triangle', 'square', 'circle', 'hexagon', 'downTriangle', 'rhombus'][r - 1]);
            var sh = new Shape(r, j, i);
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
    if (!sh1.canSwap() || !sh2.canSwap()) {
        return ;
    }
    this.swaps.push(new Swap(sh1, sh2, 10));
    this.swapShape(sh1, sh2);
};

Board.prototype.swapShape = function (sh1, sh2) {
    this.shapes[sh1.x + sh1.y * this.width] = sh2;
    this.shapes[sh2.x + sh2.y * this.width] = sh1;
    sh1.swapping = sh2.swapping = true;
    var dx = sh2.x - sh1.x;
    var dy = sh2.y - sh1.y;
    sh1.dir = {x: dx, y: dy};
    sh2.dir = {x: -dx, y: -dy};
    var tmp = sh1.x;
    sh1.x = sh2.x;
    sh2.x = tmp;
    tmp = sh1.y;
    sh1.y = sh2.y;
    sh2.y = tmp;
};

Board.prototype.update = function () {
    this.updateSwaps();
    this.findVeritcalMatch();
    this.findHorizontalMatch();
};

Board.prototype.updateSwaps = function () {
    for (var i = 0; i < this.swaps.length; i++) {
        var from = this.swaps[i].from;
        var to = this.swaps[i].to;
        this.swaps[i].tick--;
        from.pos = to.pos = this.swaps[i].interpolatedPos() * 10;
        if (this.swaps[i].tick == 0) {
            from.swapping = false;
            to.swapping = false;
            if (this.isValidSwapAt(from.x, from.y) || this.isValidSwapAt(to.x, to.y) || this.swaps[i].status === 'reject') {
                this.swaps[i] = this.swaps[this.swaps.length - 1];
                this.swaps.length--;
                --i;
            }
            else {
                this.swaps[i].reject();
                this.swapShape(from, to);
                from.pos = to.pos = this.swaps[i].interpolatedPos() * 10;
            }
        }
    }
};

Board.prototype.findVeritcalMatch = function () {
    var w = this.width;
    var i;
    var shapes = this.shapes;
    for (var x = 0; x < this.height; x++) {
        i = x;
        for (var y = 0; y < w - 2; y++) {
            if (shapes[i].canMatch()) {
                var sh = shapes[i].type;
                if (shapes[i + w].canMatch() && shapes[i + w].type === sh
                 && shapes[i + 2*w].canMatch() && shapes[i + 2*w].type === sh) {
                    do {
                        // TODO make a match object
                        shapes[i].type = 0;
                        shapes[i].sprite.kill();
                        y++;
                        i += w;
                    } while (y < w && shapes[i].canMatch() && shapes[i].type === sh) ;
                }
            }
            i += w;
        }
    }
};

Board.prototype.findHorizontalMatch = function () {
    var w = this.width;
    var h = this.height;
    var shapes = this.shapes;
    var i;
    for (var y = 0; y < h; y++) {
        i = y * w;
        for (var x = 0; x < w - 2; x++) {
            if (shapes[i].canMatch()) {
                var sh = shapes[i].type;
                if (shapes[i + 1].canMatch() && shapes[i + 1].type === sh
                 && shapes[i + 2].canMatch() && shapes[i + 2].type === sh) {
                    do {
                        // TODO make a match object
                        shapes[i].type = 0;
                        shapes[i].sprite.kill();
                        x++;
                        i += 1;
                    } while (x < h && shapes[i].canMatch() && shapes[i].type === sh) ;
                }
            }
            i += 1;
        }
    }
};

Board.prototype.isValidSwapAt = function (x, y) {
    var leftMatch = 0, rightMatch = 0, upMatch = 0, downMatch = 0;
    var sh = this.getShape(x, y);
    if (!sh.canMatch()) {
        return false;
    }
    var type = sh.type;
    if (x >= 1) {
        sh = this.getShape(x - 1, y);
        if (sh.canMatch() && sh.type === type) {
            leftMatch = 1;
            if (x >= 2) {
                sh = this.getShape(x - 2, y);
                if (sh.canMatch() && sh.type === type) {
                    return true;
                }
            }
        }
    }
    if (x < 9 - 1) {
        sh = this.getShape(x + 1, y);
        if (sh.canMatch() && sh.type === type) {
            rightMatch = 1;
            if (x < 9 - 2) {
                sh = this.getShape(x + 2, y);
                if (sh.canMatch() && sh.type === type) {
                    return true;
                }
            }
        }
    }
    if (y >= 1) {
        sh = this.getShape(x, y - 1);
        if (sh.canMatch() && sh.type === type) {
            upMatch = 1;
            if (y >= 2) {
                sh = this.getShape(x, y - 2);
                if (sh.canMatch() && sh.type === type) {
                    return true;
                }
            }
        }
    }
    if (y < 9 - 1) {
        sh = this.getShape(x, y + 1);
        if (sh.canMatch() && sh.type === type) {
            downMatch = 1;
            if (y < 9 - 2) {
                sh = this.getShape(x, y + 2);
                if (sh.canMatch() && sh.type === type) {
                    return true;
                }
            }
        }
    }
    return upMatch + downMatch >= 2 || leftMatch + rightMatch >= 2;
};
