BoardGen = {};

BoardGen.generateBoard = function genBoard(config) {
    var w = config.width;
    var h = config.height;
    var board = new Board(game, w, h);
    board.generateSimple();
    for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
            var oj = BoardGen.instantiate(config.tiles[i][j], config);
            board.setShape(j, i, oj);
        }
    }
    BoardGen.autoCreateDispenser(board);
    // randomly assign color/shape
    for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
            var r1, r2;
            if (i >= 2) {
                r1 = board.getShape(j, i - 1).type;
                if (board.getShape(j, i - 2).type !== r1) {
                    r1 = -1;
                }
            }
            if (j >= 2) {
                r2 = board.getShape(j - 2, i).type;
                if (board.getShape(j - 1, i).type !== r2) {
                    r2 = -1;
                }
            }
            var r;
            do {
                r = board.randomColors[Math.floor(Math.random() * AppleFools.COLOR_COUNT)];
            } while ((r1 == r || r2 == r) && AppleFools.COLOR_COUNT > 2) ;
            if (board.getShape(j, i).type === 99) {
                board.getShape(j, i).type = r;
            }
        }
    }
    return board;
};

BoardGen.autoCreateDispenser = function (board) {
    var w = board.width, h = board.height;
    var genApple = 0;
    var appleFools = new Date().getMonth() == 3;
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++)
            board.tiles[i + j * w].isDispenser = false;
    }
    for (var i = 0; i < w; i++) {
        var j = 0;
        while (j < h && board.getShape(i, j).type == -1) {
            j++;
        }
        if (j < h) {
            board.dispensers.push({
                x: i, y: j,
                generate: function generate(board) {
                    var r = board.game.rnd.between(1, board.randomColors.length);
                    if (appleFools) {
                        if (board.combo < 4) genApple = 4;
                        if (board.remainingTime > 0 && board.combo >= genApple) {
                            genApple += 4;
                            var e = new ElcShape();
                            e.apple = true;
                            return e;
                        }
                    }
                    return new Shape(board.randomColors[r-1]);
                }
            });
            board.tiles[i + j * w].isDispenser = true;
        }
    }
};

BoardGen.instantiate = function instantiate(id, config) {
    if (id === -1) return new Shape(-1);
    if (id === 0) return new Shape(0);
    if (id === 1) return new Shape(99);
    if (id === "hs") return new StripedShape(99, StripedShape.HORIZONTAL);
    if (id === "vs") return new StripedShape(99, StripedShape.VERTICAL);
    if (id === "w") return new WrappedShape(99);
    if (id === "t") return new ElcShape();
    // unrecognised
    return new Shape(99);
};
