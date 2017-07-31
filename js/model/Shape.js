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
    this.tick = 10;

    // is it part of a matching?
    this.match = null;

    // a Shape belongs to exactly one Board
    this.board = board || null;
}

Shape.typeNames = ['triangle', 'square', 'circle', 'hexagon',
 'downTriangle', 'rhombus', 'apple', 'pineapple', 'pen'];

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

Shape.prototype.isDeleted = function () {
    return this.tick <= 0 || this.type == 0;
};

Shape.prototype.stopSwapping = function () {
    this.swapping = false;
    this.dir = {x: 0, y: 0};
};

Shape.prototype.stopFalling = function () {
    if (this.speed > 1 && this.dir.x * this.dir.y === 0) {
        this.pos += this.speed;
        this.speed = -0.2;
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
    this.tick--;
    if (this.tick <= 0) {
        if (this.board.getShape(this.x, this.y) === this) {
            this.board.setShape(this.x, this.y, new Shape(0, this.x, this.y, this.board));
        }
        return false;
    }
    return true;
};
