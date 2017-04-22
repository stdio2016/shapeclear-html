function GameScreen() {
    this.debug = null; // To show debug message
    this.ball = null; // Ball to test animation
    this.background = null;
    this.board = null;
    this.touchDetector = null;
    this.music = null;
    this.showMatches = [];
    this.shapeGroup = null;
    this.scoreText = null;
    this.scorePopups = [];
}

GameScreen.prototype.preload = function () {
    console.log("I don't know how to use Phaser game engine");
};

GameScreen.prototype.create = function () {
    console.log("So don't expect me to make a game");
    this.background = game.add.sprite(0, 0, 'background');
    this.addDebugText();
    this.ball = new Ball(this.game, /*speed: */5);
    this.add.existing(this.ball);
    game.input.addMoveCallback(this.move, this);
    this.board = new Board(this.game);
    this.board.generateSimple();
    this.shapeGroup = this.add.group();
    this.touchDetector = new TouchDetector(this.game, this.board);
    this.addSelectSprite();
    this.music = this.game.add.sound('music2');
    this.music.loop = true;
    this.music.play();
    this.scoreText = new ScoreText(0, 0, 0, 0, this.game);
};

GameScreen.prototype.addDebugText = function () {
    var style = { font: "32px", fill: "black" };
    this.debug = this.game.add.text(0, 0, "0", style);
    this.debug.inputEnabled = true;
    this.debug.events.onInputUp.add(function () {
        var debugging = this.board.debug;
        promptBox('Input debug command:', '', function (result) {
            debugging.runCommand(result);
        });
    }, this);
};

GameScreen.prototype.addSelectSprite = function(){
    var ptrs = this.touchDetector.pointers;
    for (var i=0; i<ptrs.length; i++) {
        var spr = this.add.sprite(0, 0, 'shapes', 'selected');
        ptrs[i].selectSprite = spr;
        spr.visible = false;
    }
};

GameScreen.prototype.update = function () {
    this.touchDetector.update();
    this.board.update();
    this.debug.fontSize = Math.min(game.width, game.height) * 0.05 + 'pt';
    this.debug.text = this.board.debug.getDebugMessage();
    this.background.width = game.width * this.game.resolution;
    this.background.height = game.height * this.game.resolution;
    if (this.board.combo > this.scoreText.value) {
        this.scoreText.setScore(this.board.combo);
    }
    // Uncomment this to test layout
    //this.scoreText.setScore(Math.floor(this.scoreText.value * 1.1)+1);
    if (this.scoreText.value > 1e9) this.scoreText.setScore(1);
    this.resizeUI();
    this.updateSelectSprite();
};

GameScreen.prototype.updateSelectSprite = function () {
    var ptrs = this.touchDetector.pointers;
    for (var i=0; i<ptrs.length; i++) {
        var spr = ptrs[i].selectSprite;
        spr.visible = ptrs[i].isDown && ptrs[i].tracking;
        spr.x = this.board.x + this.board.gridSize * ptrs[i].x;
        spr.y = this.board.y + this.board.gridSize * ptrs[i].y;
        spr.width = this.board.gridSize * this.game.resolution;
        spr.height = this.board.gridSize * this.game.resolution;
    }
};

GameScreen.prototype.resizeUI = function(){
    var gw = game.width;
    var gh = game.height;
    if (gw > gh * 7/5) { // wide landscape
        var left = gh * 2/5;
        var right = gw - left;
        var tall = gh;
        this.resizeBoard(left + (right - tall) / 2 + tall * 1/11, (gh - tall * 9/11) / 2, tall * 9/11);
        this.scoreText.showWithBounds(left * 2/5, gh * 1/2, left * 2/3, gh * 1/10);
    }
    else if (gw > gh) { // narrow landscape
        var left = gw * 2/7;
        var right = gw * 5/7;
        var tall = gw * 5/7;
        this.resizeBoard(left + (right - tall) / 2 + tall * 1/11, (gh - tall * 9/11) / 2, tall * 9/11);
        this.scoreText.showWithBounds(left * 2/5, tall * 1/2, left * 2/3, tall * 1/10);
    }
    else if (gw > gh * 8/11){ // short portrait
        var up = gh * 1/11;
        var middle = gh * 8/11;
        var down = gh - up - middle;
        var tall = middle;
        var wide = gh * 8/11;
        this.resizeBoard((gw - tall * 9/11) / 2, up + (middle - tall) / 2 + tall * 1/11, tall * 9/11);
        this.scoreText.showWithBounds(gw * 1/2, (up + middle) + down * 2/5, wide * 1/5, down * 1/3);
    }
    else { // long portrait
        var up = gw * 1/8;
        var middle = gh - up - gw * 2/8;
        var down = gh - up - middle;
        var tall = gw;
        var wide = gw;
        this.resizeBoard((gw - tall * 9/11) / 2, up + (middle - tall) / 2 + tall * 1/11, tall * 9/11);
        this.scoreText.showWithBounds(gw * 1/2, (up + middle) + down * 2/5, wide * 1/5, down * 1/3);
    }
};

GameScreen.prototype.resizeBoard = function(leftX, topY, size){
    var board = this.board;
    var boardSize = 9;
    var gridSize = size / boardSize;
    var scale = gridSize / 36 * this.game.resolution;
    var startX = leftX + (boardSize - board.width) / 2 * gridSize;
    var startY = topY + (boardSize - board.height) / 2 * gridSize;
    for (var y = 0; y < board.height; y++){
        for (var x = 0; x < board.width; x++){
            var shape = board.shapes[y * board.width + x];
            if (shape.sprite === null && shape.type > 0) {
                shape.sprite = this.shapeGroup.getFirstDead(true, 100, 100, 'shapes', Shape.typeNames[shape.type - 1]);
                shape.sprite.alpha = 1;
            }
            var spr = shape.sprite;
            if (spr !== null) {
                spr.x = startX + (x - shape.dir.x * shape.pos/10) * gridSize;
                spr.y = startY + (y - shape.dir.y * shape.pos/10) * gridSize;
                spr.scale.x = scale;
                spr.scale.y = scale;
            }
            var tile = board.tiles[y * board.width + x].sprite;
            tile.x = startX + x * gridSize;
            tile.y = startY + y * gridSize;
            tile.scale.x = scale;
            tile.scale.y = scale;
        }
    }
    board.x = leftX;
    board.y = topY;
    board.gridSize = size / 9;
    var delSh = this.board.deletedShapes;
    for (var i = 0; i < delSh.length; i++) {
        var sh = delSh[i];
        // some shapes have no sprites attached
        if (!sh.sprite) {
            console.log('jjj');
            continue;
        }
        sh.sprite.alpha -= 0.1;
        if (sh.sprite.alpha <= 0) {
            // QUESTION: how to remove items from array?
            delSh[i] = delSh[delSh.length - 1];
            delSh.length--;
            i--;
            sh.sprite.kill();
        }
    }
    var scores = this.board.gainScores, aliveScoreTexts = [];
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var st = new ScoreText(s.score, s.type, s.x, s.y, this.game);
        st.popup(board.x, board.y, board.gridSize);
        aliveScoreTexts.push(st);
    }
    for (var i = 0; i < this.scorePopups.length; i++) {
        var st = this.scorePopups[i];
        st.popup(board.x, board.y, board.gridSize);
        if (st.lifetime <= 0) {
            st.kill();
        }
        else {
            aliveScoreTexts.push(st);
        }
    }
    this.scorePopups = aliveScoreTexts;
};

GameScreen.prototype.move = function(pointer, x, y){
    if (pointer.isDown) {
        this.ball.pointTo(x, y);
    }
};

GameScreen.prototype.render = function (game) {
    if (!this.board.debug.showMatching) return;
    var colors = [0x7f0000, 0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0xff7fff, 0xc0c0c0, 0xffffff, 0x000000];
    var matches = this.board.matches;
    var x, y, width, height, line;
    var j = 0;
    var spr;
    function getSprite () {
        if (j < this.showMatches.length) {
            spr = this.showMatches[j];
        }
        else {
            spr = this.add.sprite(0, 0, 'whiteSquare');
            this.showMatches.push(spr);
        }
        spr.visible = true;
        j++;
    };

    for (var i = 0; i < matches.length; i++) {
        var m = matches[i];
        if (m.type & Match.HORIZONTAL) {
            getSprite.call(this);
            spr.x = this.board.x + m.hx * this.board.gridSize;
            spr.width = m.hlength * this.board.gridSize;
            spr.y = this.board.y + (m.hy + 0.4) * this.board.gridSize;
            spr.height = 0.2 * this.board.gridSize;
            spr.tint = colors[i % colors.length];
        }
        if (m.type & Match.VERTICAL) {
            getSprite.call(this);
            spr.y = this.board.y + m.vy * this.board.gridSize;
            spr.height = m.vlength * this.board.gridSize;
            spr.x = this.board.x + (m.vx + 0.4) * this.board.gridSize;
            spr.width = 0.2 * this.board.gridSize;
            spr.tint = colors[i % colors.length];
        }
    }

    for (var i = j; i < this.showMatches.length; i++) {
        this.showMatches[i].visible = false;
    }
};

GameScreen.prototype.shutdown = function () {
    this.music.destroy();
    this.music = null;
};
