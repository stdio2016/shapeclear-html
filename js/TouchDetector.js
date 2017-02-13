function TouchDetector(game, board) {
    this.game = game;
    this.board = board;
    this.pointers = [];
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
    for (var i=0; i<touches.length; i++){
        this.process(i+1, touches[i]);
    }
    this.process(0, mouse);
};

TouchDetector.prototype.process = function (index, pointer) {
    var myPoint = this.pointers[index];
    if (pointer.isDown) {
        if (myPoint.isDown) { // pointer is moving
            if (myPoint.tracking) {
                var p = this.convertPointToGrid(pointer);
                if (p === null || p[0] != myPoint.x || p[1] != myPoint.y) {
                    // move out of the selection
                    // it means swap
                    var dir = this.calcDirection(myPoint, pointer);
                    console.log('swap from ' + myPoint.x + ',' + myPoint.y +
                      ' to ' + dir);
                    myPoint.tracking = false;
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
            }
        }
    }
    else if(myPoint.isDown && myPoint.tracking){ // pointer is up
        ;
    }
    myPoint.isDown = pointer.isDown;
};

TouchDetector.prototype.convertPointToGrid = function (point) {
    var board = this.board;
    var x = Math.floor((point.x - board.x) / board.gridSize);
    var y = Math.floor((point.y - board.y) / board.gridSize);
    if (x >= 0 && x < 9 && y >= 0 && y < 9){
        return [x, y];
    }
    return null;
};

TouchDetector.prototype.calcDirection = function (from, to) {
    var board = this.board;
    var cx = board.x + (from.x + 1/2) * board.gridSize;
    var cy = board.y + (from.y + 1/2) * board.gridSize;
    // if (to.x + to.y) > (cx + cy), then direction is right or down
    if (to.x - cx > to.y - cy) { // up or right
        if (to.x + to.y > cx + cy) { // right
            return [from.x+1, from.y];
        }
        else { // up
            return [from.x, from.y-1];
        }
    }
    else { // down or left
        if (to.x + to.y > cx + cy) { // down
            return [from.x, from.y+1];
        }
        else { // left
            return [from.x-1, from.y];
        }
    }
};
