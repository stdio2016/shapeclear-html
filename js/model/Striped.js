function StripedShape(type, dir, x, y, board) {
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
    if (this.stripeDirection === 0) {
        // overridden
        return {score: 0, addition: 0, jelly: 0, blocker: 0, multiply: 1};
    }
    var e = new StripeEffect(board);
    e.addLine(this.x, this.y, this.stripeDirection, this.type);
    board.addItemToClear(e);
    return Shape.prototype.crush.call(this, board);
};

function StripeEffect(board) {
    this.board = board;
    board.goodCount += 1;
    this.lines = [];
    this.totalTicks = 2;
    this.tick = this.totalTicks;
    this.progress = 0;
}

StripeEffect.HORIZONTAL = 1;
StripeEffect.VERTICAL = 2;

StripeEffect.prototype.addLine = function (x, y, direction, color) {
    this.lines.push({x: x, y: y, direction: direction, stillChanging: true, type: color});
};

StripeEffect.prototype.lineUpdate = function (i, affect, board) {
    var line = this.lines[i];
    var work = false;
    if (line.direction === StripeEffect.VERTICAL) {
        if (line.y - this.progress >= 0) {
            affect.push({x: line.x, y: line.y - this.progress});
            board.lockPosition(line.x, line.y - this.progress, line);
            work = true;
        }
        if (line.y + this.progress < board.height) {
            affect.push({x: line.x, y: line.y + this.progress});
            work = true;
        }
        if (line.y - this.progress + 1 >= 0) {
            board.unlockPosition(line.x, line.y - this.progress + 1, line);
        }
        if (!work) {
            board.unlockPosition(line.x, 0, this);
            line.stillChanging = false;
        }
        work = line.y - this.progress >= -4 || line.y + this.progress < board.height + 4;
    }
    else {
        if (line.x - this.progress >= 0) {
            affect.push({x: line.x - this.progress, y: line.y});
            work = true;
        }
        if (line.x + this.progress < board.width) {
            affect.push({x: line.x + this.progress, y: line.y});
            work = true;
        }
        if (!work) {
            line.stillChanging = false;
        }
        work = line.x - this.progress >= -4 || line.x + this.progress < board.width + 4;
    }
    return work;
};

StripeEffect.prototype.update = function () {
    'use strict';
    this.tick--;
    var still = false;
    for (var i = 0; i < this.lines.length; i++) {
        if (this.lines[i].stillChanging) still = true;
    }
    if (still) {
        this.board.itemChanged = true;
    }
    var work = true;
    if (this.tick <= 0) {
        this.tick += this.totalTicks;
        work = false;
        this.progress++;
        var scores = [];
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lineUpdate(i, scores, board)) work = true;
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
            scores[i].score = (c.score + c.addition) * combo + c.jelly + c.blocker;
            if (scores[i].score !== 0) {
                this.board.gainScores.push(scores[i]);
                this.board.score += scores[i].score;
            }
        }
    }
    for (var i = 0; i < this.lines.length; i++) {
        var line = this.lines[i];
        if (line.direction === StripeEffect.VERTICAL) {
            if (line.y - this.progress >= 0) {
                this.board.lockPosition(line.x, line.y - this.progress, line);
            }
        }
    }
    return work;
};

// returns array of [x, y, width, height, frameName]'s
StripeEffect.prototype.getSpritePositions = function () {
    var t2 = this.progress + 1 - this.tick / this.totalTicks;
    var sw = 0.6, sh = 0.6;
    var arr = [];
    for (var n = 0; n < this.lines.length; n++) {
        var line = this.lines[n];
        var frm = Shape.typeNames[line.type-1];
        frm += line.direction === StripeEffect.VERTICAL ? "VStripe" : "HStripe";
        var t = t2;
        for (var i = 0; t >= 0 && i < 3; t-=1, i++) {
            if (line.direction === StripeEffect.VERTICAL) {
                if (line.y - t > -1) {
                    arr.push([line.x, line.y - t, sw, sh, frm]);
                }
                if (line.y + t < this.board.height) {
                    arr.push([line.x, line.y + t, sw, sh, frm]);
                }
            }
            else {
                if (line.x - t > -1) {
                    arr.push([line.x - t, line.y, sw, sh, frm]);
                }
                if (line.x + t < this.board.width) {
                    arr.push([line.x + t, line.y, sw, sh, frm]);
                }
            }
        }
    }
    return arr;
};

function BigStripeEffect(board, from, to) {
    this.board = board;
    this.totalTicks = 30;
    this.tick = this.totalTicks;
    this.progress = 0;
    this.color = from instanceof StripedShape ? from.type : to.type;
    this.x = to.x;
    this.y = to.y;
    board.setShape(from.x, from.y, 0);
    board.setShape(to.x, to.y, 0);
    for (var i = Math.max(this.x-1, 0); i <= this.x+1 && i < board.width; i++) {
        board.lockPosition(i, Math.max(this.y-1, 0));
    }
    for (var i = Math.max(this.x-1, 0); i <= this.x+1 && i < board.width; i++) {
        for (var j = this.y-1; j <= this.y+1; j++) {
            if (i < 0 || j < 0) continue;
            if (i >= board.width || j >= board.height) continue;
            var sh = board.getShape(i, j);
            if (sh.type > 0) {
                board.clearShape(i, j);
            }
        }
    }
}

BigStripeEffect.prototype.update = function (board) {
    this.tick--;
    board.changed = true;
    if (this.tick === 0) {
        if (this.progress === 0) {
            var e = new StripeEffect(board);
            for (var i = this.y-1; i <= this.y+1; i++) {
                if (i >= 0 && i < board.height)
                    e.addLine(this.x, i, StripeEffect.HORIZONTAL, this.color);
            }
            board.addItemToClear(e);
        }
        else if (this.progress === 2) {
            for (var i = Math.max(this.x-1, 0); i <= this.x+1 && i < board.width; i++) {
                board.unlockPosition(i, Math.max(this.y-1, 0));
            }
            var e = new StripeEffect(board);
            for (var i = this.x-1; i <= this.x+1; i++) {
                if (i >= 0 && i < board.width)
                    e.addLine(i, this.y, StripeEffect.VERTICAL, this.color);
            }
            board.addItemToClear(e);
        }
        else if (this.progress === 3) {
            return false;
        }
        this.tick = this.totalTicks;
        this.progress++;
    }
    return true;
};

BigStripeEffect.prototype.getSpritePositions = function () {
    var size = 2;
    if (this.progress === 0 && (this.totalTicks - this.tick) < 10) {
        size = 1 + (this.totalTicks - this.tick) / 10;
    }
    var frm = Shape.typeNames[this.color-1];
    frm += this.progress >= 2 ? "VStripe" : "HStripe";
    return [[this.x, this.y, size, size, frm]];
};
