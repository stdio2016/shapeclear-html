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
    this.tick = 0;

    // is it part of a matching?
    this.match = null;

    // a Shape belongs to exactly one Board
    this.board = board || null;
}

Shape.typeNames = ['triangle', 'square', 'circle', 'hexagon',
 'downTriangle', 'rhombus', 'apple'];

Shape.prototype.canSwap = function () {
    return !this.swapping && !this.isMoving() && this.type > 0 && !this.cleared;
};

Shape.prototype.canMatch = function () {
    return !this.swapping && (!this.isMoving() || this.bouncing) && this.type > 0 && !this.cleared;
};

Shape.prototype.isMoving = function () {
    return !this.swapping && (this.dir.x != 0 || this.dir.y != 0);
};

Shape.prototype.isStopped = function () {
    return !this.swapping && (this.dir.x === 0 && this.dir.y === 0);
};

Shape.prototype.isEmpty = function () {
    return this.type === 0;
};

Shape.prototype.canFall = function () {
    return !this.swapping && this.type > 0 && !this.cleared;
};

Shape.prototype.stopSwapping = function () {
    this.swapping = false;
    this.dir = {x: 0, y: 0};
};

Shape.prototype.stopFalling = function () {
    if (this.speed > 0.5) {
        this.pos += this.speed;
        this.speed /= -5;
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
    this.tick++;
    if (this.tick >= 15) {
        this.board.setShape(this.x, this.y, new Shape(0, this.x, this.y, this.board));
        return false;
    }
    return true;
};
