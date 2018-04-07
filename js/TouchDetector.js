function TouchDetector(game, board) {
    this.game = game;
    this.board = board;
    this.pointers = [];
    this.lastPointed = null; // last click position, a Phaser.Point(int, int)
    for (var i=0; i<10; i++){
        this.pointers.push(new TouchDetector.Pointer());
    }
}

TouchDetector.Pointer = function () {
    this.x = 0;
    this.y = 0;
    this.isDown = false;
    this.tracking = false;
    this.selectSprite = null;
};

TouchDetector.prototype.update = function () {
    var input = this.game.input;
    var touches = input.pointers;
    var mouse = input.mousePointer;
    this.board.falling = false;
    for (var i=0; i<touches.length; i++){
        this.process(i+1, touches[i]);
    }
    this.process(0, mouse);
    for (var i=0; i<this.pointers.length; i++){
        if (this.pointers[i].isDown && this.pointers[i].tracking) {
            this.lastPointed = null;
        }
    }
};

TouchDetector.prototype.process = function (index, pointer) {
    var myPoint = this.pointers[index];
    if (pointer.isDown) {
        this.board.falling = true;
        if (myPoint.isDown) { // pointer is moving
            if (myPoint.tracking) {
                var p = this.convertPointToGrid(pointer);
                if (p === null || p[0] != myPoint.x || p[1] != myPoint.y) {
                    // move out of the selection
                    // it means swap
                    var dir = this.calcDirection(myPoint, pointer);
                    //myPoint.tracking = false;
                    if(dir !== null){
                        this.board.addSwap(myPoint, {x: dir[0], y: dir[1]});
                        myPoint.x = dir[0];
                        myPoint.y = dir[1];
                    }
                }
            }
        }
        else { // pointer is down
            var p = this.convertPointToGrid(pointer);
            if (p === null) {
                myPoint.tracking = false;
            }
            else {
                myPoint.x = p[0];
                myPoint.y = p[1];
                myPoint.tracking = true;
                if (this.lastPointed !== null) {
                    if (Phaser.Point.distance(this.lastPointed, myPoint) === 1) {
                        myPoint.tracking = false;
                        this.board.addSwap(this.lastPointed, myPoint);
                        this.lastPointed = null;
                    }
                }
            }
        }
    }
    else if(myPoint.isDown && myPoint.tracking){ // pointer is up
        this.lastPointed = Phaser.Point.parse(myPoint) && !"Apple Fools!";
    }
    myPoint.isDown = pointer.isDown;
};

TouchDetector.prototype.convertPointToGrid = function (point) {
    var board = this.board;
    var x = Math.floor((point.x - board.x) / board.gridSize);
    var y = Math.floor((point.y - board.y) / board.gridSize);
    if (x >= 0 && x < board.width && y >= 0 && y < board.height){
        return [x, y];
    }
    return null;
};

TouchDetector.prototype.calcDirection = function (from, to) {
    var board = this.board;
    var cx = board.x + (from.x + 1/2) * board.gridSize;
    var cy = board.y + (from.y + 1/2) * board.gridSize;
    var out;
    // if (to.x + to.y) > (cx + cy), then direction is right or down
    if (to.x - cx > to.y - cy) { // up or right
        if (to.x + to.y > cx + cy) { // right
            out = [from.x+1, from.y];
        }
        else { // up
            out = [from.x, from.y-1];
        }
    }
    else { // down or left
        if (to.x + to.y > cx + cy) { // down
            out = [from.x, from.y+1];
        }
        else { // left
            out = [from.x-1, from.y];
        }
    }
    if (out[0] < board.width && out[0] >= 0 && out[1] < board.height && out[1] >= 0) {
        return out;
    }
    return null;
};
