function Shape(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.dir = {x:0, y:0};
    this.pos = 0;
    this.speed = 0;
    this.bouncing = false;
    this.swapping = false;

    // is it part of a matching?
    this.match = null;
}

Shape.prototype.canSwap = function () {
    return !this.swapping && !this.isMoving() && this.type > 0;
};

Shape.prototype.canMatch = function () {
    return !this.swapping && (!this.isMoving() || this.bouncing) && this.type > 0;
};

Shape.prototype.isMoving = function () {
    return !this.swapping && (this.dir.x != 0 || this.dir.y != 0);
};

Shape.prototype.isStopped = function () {
    return !this.swapping && (this.dir.x === 0 && this.dir.y === 0);
};

Shape.prototype.isEmpty = function () {
    return this.type === 0;
}

Shape.prototype.canFall = function () {
    return this.type > 0;
}

Shape.prototype.stopSwapping = function () {
    this.swapping = false;
    this.dir = {x: 0, y: 0};
};

Shape.prototype.stopFalling = function () {
    if (this.speed > 0.5) {
        this.speed /= -5;
        this.bouncing = true;
    }
    else {
        this.dir = {x: 0, y: 0};
        this.speed = 0;
        this.bouncing = false;
    }
    this.pos = 0;
};
