function Shape(type, x, y, board) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.dir = {x:0, y:0};
    this.pos = 0;
    this.speed = 0;
    this.bouncing = false;
    this.swapping = false;
    this.cleared = false;
    this.tickClear = 10;
    this.tick = 0;

    // a Shape belongs to exactly one Board
    this.board = board || null;
    this.special = 0;
}

Shape.typeNames = ['triangle', 'square', 'circle', 'hexagon',
 'downTriangle', 'rhombus', 'apple', 'pineapple', 'pen', 'taser'];
Shape.UNMATCHABLE_TYPE = 100;

Shape.prototype.canSwap = function () {
    return !this.swapping && !this.isMoving() && this.type > 0 && !this.cleared;
};

Shape.prototype.canMatch = function () {
    return !this.swapping && (!this.isMoving() || this.bouncing) &&
    (this.type > 0 && this.type !== Shape.UNMATCHABLE_TYPE) && !this.cleared;
};

Shape.prototype.isMoving = function () {
    return !this.swapping && (this.dir.x != 0 || this.dir.y != 0);
};

Shape.prototype.isStopped = function () {
    return !this.swapping && (this.dir.x === 0 && this.dir.y === 0);
};

Shape.prototype.isEmpty = function () {
    return this.type === 0 && !this.swapping;
};

Shape.prototype.canFall = function () {
    return !this.swapping && this.type > 0 &&
     (this.isStopped() || this.pos <= 0 || this.bouncing);
};

Shape.prototype.isDeleted = function () {
    return this.tickClear <= 0 || this.type == 0;
};

Shape.prototype.canBeCleared = function () {
    return this.type > 0 && !this.swapping && !this.cleared;
};

Shape.prototype.canCrush = function () {
    return this.type > 0 && !this.swapping && !this.cleared;
};

Shape.prototype.stopSwapping = function () {
    this.swapping = false;
    this.dir = {x: 0, y: 0};
};

Shape.prototype.stopFalling = function () {
    if (this.speed > 1 && this.dir.x * this.dir.y === 0) {
        this.pos += this.speed;
        this.speed = -0.1;
        this.bouncing = true;
    }
    else {
        this.dir = {x: 0, y: 0};
        this.speed = 0;
        this.bouncing = false;
        this.pos = 0;
    }
};

Shape.prototype.deleteUpdate = function () {
    this.tickClear--;
    if (this.tickClear <= 0) {
        if (this.board.getShape(this.x, this.y) === this) {
            this.board.setShape(this.x, this.y, new Shape(0, this.x, this.y, this.board));
        }
        return false;
    }
    return true;
};

Shape.prototype.update = function () {
    ;
};

Shape.prototype.toString = function () {
    var b = this.board;
    var sp = this.sprite;
    this.board = null;
    this.sprite = null;
    var str = "[Object "+this.constructor.name+"]" + JSON.stringify(this);
    this.board = b;
    this.sprite = sp;
    return str;
};

Shape.prototype.crush = function (board) {
    if (this.type > 0) {
        return {score: 60, addition: 0, multiply: 1, jelly: 0, blocker: 0};
    }
    return {score: 0, addition: 0, multiply: 0, jelly: 0, blocker: 0};
};
