function TaserShape(x, y, board) {
    Shape.call(this, Shape.UNMATCHABLE_TYPE, x, y, board);
    this.state = WrappedShape.NORMAL;
    this.special = TaserShape.SPECIAL;
}

TaserShape.SPECIAL = 5;
TaserShape.NORMAL = 0;
TaserShape.ACTIVE = 1;
TaserShape.DISCHARGING = 2;
TaserShape.FINISHED = 3;

TaserShape.prototype = new Shape();
TaserShape.prototype.constructor = TaserShape;

TaserShape.prototype.update = function () {
    if (this.state === TaserShape.ACTIVE) {
        this.state = TaserShape.DISCHARGING;
    }
};

TaserShape.prototype.canBeCleared = function () {
    if (Shape.prototype.canBeCleared.call(this)) {
        return this.state === TaserShape.FINISHED;
    }
    return false;
};

TaserShape.prototype.canCrush = function () {
    if (Shape.prototype.canBeCleared.call(this)) {
        return this.state === TaserShape.NORMAL || this.state === TaserShape.FINISHED;
    }
    return false;
};

TaserShape.prototype.crush = function (board, color) {
    if (this.state === TaserShape.NORMAL) {
        this.state = TaserShape.ACTIVE;
        board.addItemToClear(new TaserEffect(board, color, this));
    }
    return {score: 0, addition: 0, multiply: 0, jelly: 0, blocker: 0};
};

TaserShape.prototype.canFall = function () {
    return Shape.prototype.canFall.call(this) && this.state !== TaserShape.DISCHARGING;
};

function TaserEffect(board, color, taser) {
    this.board = board;
    this.totalTicks = 3;
    this.tick = this.totalTicks;
    this.progress = 0;
    this.type = color || board.randomColors[this.board.game.rnd.between(0, AppleFools.COLOR_COUNT-1)];
    this.taser = taser;
    // shapes to clear
    this.all = [];
    this.clearing = [];
    this.count = 0;
    this.done = false;
    taser.state = TaserShape.DISCHARGING;
}

TaserEffect.prototype.elcShape = function (type) {
    var shapes = this.board.shapes;
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].type == type && shapes[i].canCrush()) {
            this.count++;
            this.all.push(shapes[i]);
        }
    }
};

TaserEffect.prototype.update = function () {
    'use strict';
    if (this.tick === this.totalTicks) {
        if (this.progress === 0) {
            this.elcShape(this.type);
        }
        
        if (this.progress < this.count) {
            var sh = this.all[this.progress];
            if (this.board.getShape(sh.x, sh.y) === sh) {
                var sco = this.board.clearShape(sh.x, sh.y);
                var score = (sco.score + sco.addition) * this.count + sco.jelly + sco.blocker;
                this.board.gainScores.push({
                  x: sh.x,
                  y: sh.y,
                  type: this.type,
                  score: score
                });
                this.board.score += score;
            }
            if (this.progress === this.count-1) {
                this.done = true;
            }
        }
        //  taser has no target!
        if (this.count === 0) {
            this.done = true;
        }
    }
    if (this.progress < this.count-1 || this.tick > 0) {
        this.board.itemChanged = true;
    }
    this.tick--;
    if (this.tick <= 0) {
        this.tick = this.totalTicks;
        this.progress++;
    }
    if (this.done) {
        this.taser.state = TaserShape.FINISHED;
        if (!this.taser.cleared) {
            this.board.clearShape(this.taser.x, this.taser.y);
            if (!this.taser.cleared) {
                return true;
            }
        }
    }
    return this.progress < this.count+2;
};

// returns array of [x, y, width, height, frameName]'s
TaserEffect.prototype.getSpritePositions = function () {
    var lb = Math.max(this.progress - 2, 0);
    var ub = Math.min(this.count, this.progress + 1);
    var ans = [];
    var tz = this.taser;
    var tzx = (tz.x - tz.dir.x * tz.pos / 10);
    var tzy = (tz.y - tz.dir.y * tz.pos / 10);
    var sw = 0.6, sh = 0.6;
    for (var i = lb; i < ub; i++) {
        var t = (this.progress-i + 1 - this.tick / this.totalTicks) / 3;
        var s = this.all[i];
        ans.push([
          (s.x - s.dir.x * s.pos / 10) * t + tzx * (1-t),
          (s.y - s.dir.y * s.pos / 10) * t + tzy * (1-t),
          sw, sh, "taser"
        ]);
    }
    return ans;
};

function TaserComboEffect(board, taser, shape) {
    this.totalTicks = 10;
    this.initialDelay = 30;
    this.tick = 0;
    this.taser = taser;
    this.shape = shape;
    this.color = shape.type;
    this.type = shape.special;
    this.phase = 0;
    this.progress = 0;
    this.all = [];
    board.lockPosition(taser.x, taser.y, this);
}

TaserComboEffect.prototype.elcShape = function (board, type) {
    var shapes = board.shapes;
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].type == type && shapes[i].canCrush()) {
            var s = shapes[i];
            var x = s.x, y = s.y;
            if (this.type === StripedShape.HORIZONTAL) {
                s = new StripedShape(type, StripedShape.HORIZONTAL, board, s.x, s.y);
                this.type = StripedShape.VERTICAL;
            }
            else if (this.type === StripedShape.VERTICAL) {
                s = new StripedShape(type, StripedShape.VERTICAL, board, s.x, s.y);
                this.type = StripedShape.HORIZONTAL;
            }
            else if (this.type === WrappedShape.SPECIAL) {
                s = new WrappedShape(type);
            }
            board.setShape(x, y, s);
            this.all.push(s);
        }
    }
};

TaserComboEffect.prototype.update = function (board) {
    this.tick++;
    if (this.phase === 0) {
        if (this.tick === 1) {
            this.elcShape(board, this.color);
            board.clearShape(this.shape.x, this.shape.y);
        }
        if (this.tick === this.initialDelay) {
            this.phase = 1;
            this.tick = 0;
        }
        board.itemChanged = true;
    }
    else if (this.phase === 1) {
        board.unlockPosition(this.taser.x, this.taser.y, this);
        if (this.tick === this.totalTicks) {
            this.tick = 0;
            while (this.progress < this.all.length) {
                var sh = this.all[this.progress];
                if (sh.cleared
                  || (sh instanceof WrappedShape && sh.state !== WrappedShape.NORMAL))
                    this.progress++;
                else break;
            }
            if (this.progress < this.all.length) {
                var sh = this.all[this.progress];
                board.clearShape(sh.x, sh.y);
                this.progress++;
            }
        }
        if (this.progress < this.all.length)
            board.itemChanged = true;
        else
            this.phase = 2;
    }
    else return false;
    
    return true;
};

TaserComboEffect.prototype.getSpritePositions = function () {
    var ans = [];
    var tz = this.taser;
    var tzx = (tz.x - tz.dir.x * tz.pos / 10);
    var tzy = (tz.y - tz.dir.y * tz.pos / 10);
    var sw = 0.6, sh = 0.6;
    if (this.phase === 0 && this.tick <= 12) {
        for (var i = 0; i < this.all.length; i++) {
            var t = this.tick / 12;
            var s = this.all[i];
            ans.push([
              (s.x - s.dir.x * s.pos / 10) * t + tzx * (1-t),
              (s.y - s.dir.y * s.pos / 10) * t + tzy * (1-t),
              sw, sh, "taser"
            ]);
        }
    }
    return ans;
};

function DoubleTaserEffect(board, taser1, taser2) {
    this.board = board;
    this.progress = 0;
    this.tick = 0;
    this.totalTicks = 1;
    this.showTime = 12;
    this.taser1 = taser1;
    this.taser2 = taser2;
    this.done = false;
    taser1.state = TaserShape.DISCHARGING;
    taser2.state = TaserShape.DISCHARGING;
}

DoubleTaserEffect.prototype.update = function (board) {
    board.changed = true;
    this.tick++;
    if (this.tick >= this.totalTicks) {
        this.tick = 0;
        if (this.progress >= this.showTime) {
            var p = this.progress - this.showTime;
            var x = p / this.board.width | 0;
            var y = p % this.board.width;
            if (p <= board.width * board.height - 1) {
                var sh = board.getShape(x, y);
                var sco = board.clearShape(x, y);
                var score = (sco.score + sco.addition) + sco.jelly + sco.blocker;
                if (score !== 0) {
                    board.gainScores.push({
                      x: x, y: y, type: sh.type, score: score
                    });
                    board.score += score;
                }
            }
            if (p >= board.width * board.height - 1) {
                this.taser1.state = TaserShape.FINISHED;
                this.taser2.state = TaserShape.FINISHED;
                board.clearShape(this.taser1.x, this.taser1.y);
                board.clearShape(this.taser2.x, this.taser2.y);
                if (this.taser1.cleared && this.taser2.cleared)
                    return false;
                else { // try again
                    this.tick = this.totalTicks;
                }
            }
        }
        this.progress++;
    }
    this.board.itemChanged = true;
    return true;
};

DoubleTaserEffect.prototype.getSpritePositions = function () {
    var ans = [];
    var tz = this.taser1;
    var tzx = (tz.x - tz.dir.x * tz.pos / 10);
    var tzy = (tz.y - tz.dir.y * tz.pos / 10);
    var tz2 = this.taser2;
    var tz2x = (tz2.x - tz2.dir.x * tz2.pos / 10);
    var tz2y = (tz2.y - tz2.dir.y * tz2.pos / 10);
    var sw = 0.6, sh = 0.6;
    for (var i = 0; i < this.showTime; i++) {
        var p = this.progress - i;
        if (p < 0 || p >= this.board.width * this.board.height) continue;
        var t = (i + (this.tick+1) / this.totalTicks) / this.showTime;
        var x = p / this.board.width | 0;
        var y = p % this.board.width;
        ans.push([
          x * t + (tzx + tz2x) * 0.5 * (1-t),
          y * t + (tzy + tz2y) * 0.5 * (1-t),
          sw, sh, "taser"
        ]);
    }
    return ans;
};
