function Shape(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.dir = {x:0, y:0};
    this.pos = 0;
    this.swapping = false;
}

Shape.prototype.canSwap = function () {
    return !this.swapping && this.type > 0;
};

Shape.prototype.canMatch = function () {
    return !this.swapping && this.type > 0;
};
