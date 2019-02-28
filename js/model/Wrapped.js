function WrappedShape(type, x, y, board) {
    Shape.call(this, type, x, y, board);
    this.state = WrappedShape.NORMAL;
    this.special = WrappedShape.SPECIAL;
}

WrappedShape.NORMAL = 0;
WrappedShape.EXPLODED = 1;
WrappedShape.WAIT_EXPLODE_AGAIN = 2;
WrappedShape.CAN_CLEAR = 3;

WrappedShape.SPECIAL = 3;
WrappedShape.SPECIAL_WAIT_EXPLODE = 4;

WrappedShape.prototype = new Shape();
WrappedShape.prototype.constructor = WrappedShape;

WrappedShape.prototype.update = function () {
    if (this.state === WrappedShape.EXPLODED) {
        this.state = WrappedShape.WAIT_EXPLODE_AGAIN;
        this.special = WrappedShape.SPECIAL_WAIT_EXPLODE;
        this.tick = 60 * 5 - this.board.passedTime%60;
    }
    this.tick--;
    if (this.tick <= 0 && this.state === WrappedShape.WAIT_EXPLODE_AGAIN) {
        this.state = WrappedShape.CAN_CLEAR;
        this.board.clearShape(this.x, this.y, 0, {special: true});
        // sometimes the shape might fail to explode
        if (!this.cleared) {
            this.state = WrappedShape.WAIT_EXPLODE_AGAIN;
        }
    }
};

WrappedShape.prototype.canMatch = function () {
    if (this.state === WrappedShape.NORMAL) {
        // call base class
        return Shape.prototype.canMatch.call(this);
    }
    return false;
};

WrappedShape.prototype.canBeCleared = function () {
    if (Shape.prototype.canBeCleared.call(this)) {
        return this.state === WrappedShape.CAN_CLEAR;
    }
    return false;
};

WrappedShape.prototype.canCrush = function () {
    if (Shape.prototype.canCrush.call(this)) {
        return this.state === WrappedShape.NORMAL || this.state === WrappedShape.CAN_CLEAR;
    }
    return false;
};

WrappedShape.prototype.crush = function (board) {
    if (this.state === WrappedShape.NORMAL) {
        this.state = WrappedShape.EXPLODED;
        var ex = new WrappedEffect(board, this.x, this.y, this.type);
        board.addItemToClear(ex);
    }
    return Shape.prototype.crush.call(this, board);
};

WrappedShape.prototype.deleteUpdate = function () {
    if (this.tickClear === 10) {
        var ex = new WrappedEffect(this.board, this.x, this.y, this.type);
        this.board.addItemToClear(ex);
    }
    return Shape.prototype.deleteUpdate.call(this);
};

function WrappedEffect(board, x, y, color) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.totalTicks = 10;
    this.tick = this.totalTicks;
    this.type = color;
    this.explode();
}

WrappedEffect.prototype.explode = function () {
    var i, j;
    var score = 540;
    for (i = Math.max(this.x-1, 0); i <= this.x+1 && i < this.board.width; i++) {
        for (j = Math.min(this.y+1, this.board.height-1); j >= this.y-1 && j >= 0 ; j--) {
            if (i !== this.x || j !== this.y) {
                var s = this.board.clearShape(i, j);
                score += s.addition + s.jelly + s.blocker;
            }
        }
        var sh;
        while (j >= 0) {
            sh = this.board.getShape(i, j);
            if (sh.canFall() && (sh.dir.y === 0 || sh.dir.y === 1)) {
                // explosion pull force
                sh.pos += 0.4;
                sh.speed -= 0.4;
                sh.dir.y = +1;
                sh.bouncing = true;
            }
            j--;
        }
    }
    this.board.gainScores.push({
      x: this.x,
      y: this.y,
      type: this.type,
      score: score
    });
    this.board.score += score;
};

WrappedEffect.prototype.update = function () {
    'use strict';
    this.tick--;
    if (this.stillChanging) {
        this.board.itemChanged = true;
    }
    return this.tick > 0;
};

// returns array of [x, y, width, height, frameName]'s
WrappedEffect.prototype.getSpritePositions = function () {
    var t = 1 - this.tick / this.totalTicks;
    var sw = 0.6, sh = 0.6, frm = Shape.typeNames[this.type-1];
    return [
        [this.x-t, this.y-t, sw, sh, frm],
        [this.x-t, this.y+t, sw, sh, frm],
        [this.x+t, this.y-t, sw, sh, frm],
        [this.x+t, this.y+t, sw, sh, frm]
    ];
};
