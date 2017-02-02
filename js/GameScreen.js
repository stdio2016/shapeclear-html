function GameScreen() {
    this.debug = null; // To show debug message
    this.ball = null; // Ball to test animation
    this.background = null;
    this.board = null;
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
};

GameScreen.prototype.addDebugText = function () {
    var style = { font: "32px", fill: "black" };
    this.debug = this.game.add.text(0, 0, "0", style);
};

GameScreen.prototype.update = function () {
    this.debug.text = game.time.fps;
    this.background.width = game.width;
    this.background.height = game.height;
};

GameScreen.prototype.move = function(pointer, x, y){
    if (pointer.isDown) {
        this.ball.pointTo(x, y);
    }
};
