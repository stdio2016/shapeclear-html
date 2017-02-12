function TouchDetector(game, board) {
    this.game = game;
    this.board = board;
    this.lastButState = [false];
    for (var i=0; i<10; i++){
        this.lastButState.push(false);
    }
}

TouchDetector.prototype.update = function () {
    var input = this.game.input;
    var touches = input.pointers;
    var mouse = input.mousePointer;
    for (var i=0; i<touches.length; i++){
        if (touches[i].isDown && !this.lastButState[i+1]){
            this.down(i+1, touches[i].x, touches[i].y);
        }
        this.lastButState[i+1] = touches[i].isDown;
    }
    if (mouse.isDown && !this.lastButState[0]){
        this.down(0, mouse.x, mouse.y);
    }
    this.lastButState[0] = mouse.isDown;
};

TouchDetector.prototype.down = function(index, x, y) {
    console.log("pointer %d start at %f,%f", index, x, y);
};
