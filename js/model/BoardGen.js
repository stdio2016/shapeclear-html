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
            board.dispensers.push(new Dispenser(i, j));
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

BoardGen.canShuffle = function shuffle(board) {
    var shapes = board.shapes;
    var w = board.width;
    var h = board.height;
    var colors = [-100, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < w * h; i++) {
        if (shapes[i].canShuffle()) {
            colors[shapes[i].type] += 1;
        }
    }
    var possible = false;
    for (var i = 1; i <= 6; i++) {
        if (colors[i] >= 3) possible = true;
    }
    if (!possible) return false;
    var hasSpace = false;
    Board.forEachPossibleMatch(0, 0, w, h, function (x1, y1, x2, y2, x3, y3, x4, y4) {
        var sh1 = shapes[x1 + y1 * w];
        var sh2 = shapes[x2 + y2 * w];
        var sh3 = shapes[x3 + y3 * w];
        var sh4 = shapes[x4 + y4 * w];
        var common = 0, same = 0;
        if (sh3.canSwap() && sh4.canSwap()) {
            if (!sh1.canMatch()) return;
            if (!sh2.canMatch()) return;
            if (!sh3.canMatch()) return;
            if (!sh1.canShuffle()) {
                if (common == 0 || common == sh1.type) common = sh1.type;
                else return ;
                same += 1;
            }
            if (!sh2.canShuffle()) {
                if (common == 0 || common == sh2.type) common = sh2.type;
                else return ;
                same += 1;
            }
            if (!sh3.canShuffle()) {
                if (common == 0 || common == sh3.type) common = sh3.type;
                else return ;
                same += 1;
            }
            hasSpace = common == 0 || colors[common] >= 3-same;
        }
    });
    return hasSpace;
};
