function GameScreen() {
    this.debug = null; // To show debug message
    this.ball = null; // Ball to test animation
    this.background = null;
    this.board = null;
    this.touchDetector = null;
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
    this.touchDetector = new TouchDetector(this.game, this.board);
    this.addSelectSprite();
};

GameScreen.prototype.addDebugText = function () {
    var style = { font: "32px", fill: "black" };
    this.debug = this.game.add.text(0, 0, "0", style);
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
    this.debug.text = game.width + "x" + game.height;
    this.background.width = game.width;
    this.background.height = game.height;
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
        spr.width = this.board.gridSize;
        spr.height = this.board.gridSize;
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
    }
    else if (gw > gh) { // narrow landscape
        var left = gw * 2/7;
        var right = gw * 5/7;
        var tall = gw * 5/7;
        this.resizeBoard(left + (right - tall) / 2 + tall * 1/11, (gh - tall * 9/11) / 2, tall * 9/11);
    }
    else if (gw > gh * 8/11){ // short portrait
        var up = gh * 1/11;
        var middle = gh * 8/11;
        var tall = middle;
        this.resizeBoard((gw - tall * 9/11) / 2, up + (middle - tall) / 2 + tall * 1/11, tall * 9/11);
    }
    else { // long portrait
        var up = gw * 1/8;
        var middle = gh - up - gw * 2/8;
        var tall = gw;
        this.resizeBoard((gw - tall * 9/11) / 2, up + (middle - tall) / 2 + tall * 1/11, tall * 9/11);
    }
};

GameScreen.prototype.resizeBoard = function(leftX, topY, size){
    var board = this.board;
    var boardSize = 9;
    var gridSize = size / boardSize;
    var startX = leftX + (boardSize - board.width) / 2 * gridSize;
    var startY = topY + (boardSize - board.height) / 2 * gridSize;
    for (var y = 0; y < board.height; y++){
        for (var x = 0; x < board.width; x++){
            var shape = board.shapes[y * board.width + x].sprite;
            shape.x = startX + x * gridSize;
            shape.y = startY + y * gridSize;
            shape.width = gridSize;
            shape.height = gridSize;
            var tile = board.tiles[y * board.width + x].sprite;
            tile.x = startX + x * gridSize;
            tile.y = startY + y * gridSize;
            tile.width = gridSize;
            tile.height = gridSize;
        }
    }
    board.x = leftX;
    board.y = topY;
    board.gridSize = size / 9;
};

GameScreen.prototype.move = function(pointer, x, y){
    if (pointer.isDown) {
        this.ball.pointTo(x, y);
    }
};
