function StripedShape(type, x, y, dir, board) {
    Shape.call(this, type, x, y, board);
    this.stripeDirection = dir;
    if (dir === StripedShape.HORIZONTAL) {
        this.special = StripedShape.HORIZONTAL;
    }
    else {
        this.special = StripedShape.VERTICAL;
    }
}

StripedShape.HORIZONTAL = 1;
StripedShape.VERTICAL = 2;

StripedShape.prototype = new Shape();
StripedShape.prototype.constructor = StripedShape;

StripedShape.prototype.crush = function (board) {
    board.addItemToClear(new StripeEffect(
      board, this.x, this.y, this.stripeDirection, this.type
    ));
    return Shape.prototype.crush.call(this, board);
};

function StripeEffect(board, x, y, direction, color) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.direction = direction || StripeEffect.HORIZONTAL;
    this.totalTicks = 2;
    this.tick = this.totalTicks;
    this.progress = 0;
    this.type = color;
    this.stillChanging = true;
}

StripeEffect.HORIZONTAL = 1;
StripeEffect.VERTICAL = 2;

StripeEffect.prototype.update = function () {
    'use strict';
    this.tick--;
    if (this.stillChanging) {
        this.board.itemChanged = true;
    }
    var work = true;
    if (this.tick <= 0) {
        this.tick += this.totalTicks;
        work = false;
        this.progress++;
        var scores = [];
        if (this.direction === StripeEffect.VERTICAL) {
            if (this.y - this.progress >= 0) {
                scores.push({x: this.x, y: this.y - this.progress});
                this.board.lockPosition(this.x, this.y - this.progress, this);
                work = true;
            }
            if (this.y + this.progress < this.board.height) {
                scores.push({x: this.x, y: this.y + this.progress});
                work = true;
            }
            if (this.y - this.progress + 1 >= 0) {
                this.board.unlockPosition(this.x, this.y - this.progress + 1, this);
            }
            if (!work) {
                this.board.unlockPosition(this.x, 0, this);
                this.stillChanging = false;
            }
            work = this.y - this.progress >= -4 || this.y + this.progress < this.board.height + 4;
        }
        else {
            if (this.x - this.progress >= 0) {
                scores.push({x: this.x - this.progress, y: this.y});
                work = true;
            }
            if (this.x + this.progress < this.board.width) {
                scores.push({x: this.x + this.progress, y: this.y});
                work = true;
            }
            if (!work) {
                this.stillChanging = false;
            }
            work = this.x - this.progress >= -4 || this.x + this.progress < this.board.width + 4;
        }
        // score
        var combo = 0;
        for (var i = 0; i < scores.length; i++) {
            scores[i].type = this.board.getShape(scores[i].x, scores[i].y).type;
            scores[i].combo = this.board.clearShape(scores[i].x, scores[i].y);
            combo += scores[i].combo.multiply;
        }
        for (var i = 0; i < scores.length; i++) {
            var c = scores[i].combo;
            scores[i].score = (c.score + c.addition + 60 * c.multiply) * combo;
            if (scores[i].score !== 0) {
                this.board.gainScores.push(scores[i]);
                this.board.score += scores[i].score;
            }          
        }
    }
    if (this.direction === StripeEffect.VERTICAL) {
        if (this.y - this.progress >= 0) {
            this.board.lockPosition(this.x, this.y - this.progress, this);
        }
    }
    return work;
};

// returns array of [x, y, width, height, frameName]'s
StripeEffect.prototype.getSpritePositions = function () {
    var t = this.progress + 1 - this.tick / this.totalTicks;
    var sw = 0.6, sh = 0.6, frm = Shape.typeNames[this.type-1];
    frm += this.direction === StripeEffect.VERTICAL ? "VStripe" : "HStripe";
    var arr = [];
    for (var i = 0; t >= 0 && i < 3; t-=1, i++) {
        if (this.direction === StripeEffect.VERTICAL) {
            if (this.y - t > -1) {
                arr.push([this.x, this.y - t, sw, sh, frm]);
            }
            if (this.y + t < this.board.height) {
                arr.push([this.x, this.y + t, sw, sh, frm]);
            }
        }
        else {
            if (this.x - t > -1) {
                arr.push([this.x - t, this.y, sw, sh, frm]);
            }
            if (this.x + t < this.board.width) {
                arr.push([this.x + t, this.y, sw, sh, frm]);
            }
        }
    }
    return arr;
};
