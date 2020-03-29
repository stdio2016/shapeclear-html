function ElcShape(x, y, board) {
    Shape.call(this, Shape.UNMATCHABLE_TYPE, x, y, board);
    this.state = WrappedShape.NORMAL;
    this.special = ElcShape.SPECIAL;
    this.apple = false;
}

ElcShape.SPECIAL = 5;
ElcShape.NORMAL = 0;
ElcShape.ACTIVE = 1;
ElcShape.DISCHARGING = 2;
ElcShape.FINISHED = 3;

ElcShape.prototype = new Shape();
ElcShape.prototype.constructor = ElcShape;

ElcShape.prototype.update = function () {
    if (this.state === ElcShape.ACTIVE) {
        this.state = ElcShape.DISCHARGING;
    }
};

ElcShape.prototype.canBeCleared = function () {
    if (Shape.prototype.canBeCleared.call(this)) {
        return this.state === ElcShape.FINISHED;
    }
    return false;
};

ElcShape.prototype.canCrush = function () {
    if (Shape.prototype.canBeCleared.call(this)) {
        return this.state === ElcShape.NORMAL || this.state === ElcShape.FINISHED;
    }
    return false;
};

ElcShape.prototype.crush = function (board, color) {
    if (this.state === ElcShape.NORMAL) {
        this.state = ElcShape.ACTIVE;
        var fx = new ElcEffect(board, color, this);
        fx.apple = this.apple;
        board.addItemToClear(fx);
        board.goodCount += 1;
    }
    return {score: 0, addition: 0, multiply: 0, jelly: 0, blocker: 0};
};

ElcShape.prototype.canFall = function () {
    return Shape.prototype.canFall.call(this) && this.state !== ElcShape.DISCHARGING;
};

function ElcEffect(board, color, elc) {
    this.board = board;
    this.totalTicks = 3;
    this.tick = this.totalTicks;
    this.progress = 0;
    this.type = color || board.randomColors[this.board.game.rnd.between(0, AppleFools.COLOR_COUNT-1)];
    this.elc = elc;
    // shapes to clear
    this.all = [];
    this.clearing = [];
    this.count = 0;
    this.done = false;
    elc.state = ElcShape.DISCHARGING;
}

ElcEffect.prototype.elcShape = function (type) {
    var shapes = this.board.shapes;
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].type == type && shapes[i].canCrush()) {
            this.count++;
            shapes[i].cleared = true;
            this.all.push(shapes[i]);
        }
    }
};

ElcEffect.prototype.update = function () {
    'use strict';
    if (this.tick === this.totalTicks) {
        if (this.progress === 0) {
            this.elcShape(this.type);
        }
        
        if (this.progress < this.count+2 && this.progress > 1) {
            var sh = this.all[this.progress-2];
            if (this.board.getShape(sh.x, sh.y) === sh) {
                sh.cleared = false;
                var sco = this.board.clearShape(sh.x, sh.y);
                var score = (sco.score + sco.addition) * this.count + sco.jelly + sco.blocker;
                if (score != 0) {
                    this.board.gainScores.push({
                      x: sh.x,
                      y: sh.y,
                      type: this.type,
                      score: score
                    });
                }
                this.board.score += score;
            }
            if (this.progress === this.count+1) {
                this.done = true;
            }
        }
        //  elc has no target!
        if (this.count === 0) {
            this.done = true;
        }
    }
    if (this.progress < this.count+1 || this.tick > 0) {
        this.board.itemChanged = true;
    }
    this.tick--;
    if (this.tick <= 0) {
        this.tick = this.totalTicks;
        this.progress++;
    }
    if (this.done) {
        this.elc.state = ElcShape.FINISHED;
        if (!this.elc.cleared) {
            this.board.clearShape(this.elc.x, this.elc.y);
            if (!this.elc.cleared) {
                return true;
            }
        }
    }
    return this.progress < this.count+4;
};

// returns array of [x, y, width, height, frameName]'s
ElcEffect.prototype.getSpritePositions = function () {
    var lb = Math.max(this.progress - 2, 0);
    var ub = Math.min(this.count, this.progress + 1);
    var ans = [];
    var tz = this.elc;
    var tzx = (tz.x - tz.dir.x * tz.pos / 10);
    var tzy = (tz.y - tz.dir.y * tz.pos / 10);
    var sw = 0.6, sh = 0.6;
    for (var i = lb; i < ub; i++) {
        var t = (this.progress-i + 1 - this.tick / this.totalTicks) / 3;
        var s = this.all[i];
        ans.push([
          (s.x - s.dir.x * s.pos / 10) * t + tzx * (1-t),
          (s.y - s.dir.y * s.pos / 10) * t + tzy * (1-t),
          sw, sh, this.apple ? "apple" : "elc"
        ]);
    }
    return ans;
};

function ElcComboEffect(board, elc, shape) {
    this.totalTicks = 10;
    this.initialDelay = 30;
    this.tick = 0;
    this.elc = elc;
    this.shape = shape;
    this.color = shape.type;
    this.type = shape.special;
    this.phase = 0;
    this.progress = 0;
    this.all = [];
    board.lockPosition(elc.x, elc.y, this);
}

ElcComboEffect.prototype.elcShape = function (board, type) {
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

ElcComboEffect.prototype.update = function (board) {
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
        board.unlockPosition(this.elc.x, this.elc.y, this);
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

ElcComboEffect.prototype.getSpritePositions = function () {
    var ans = [];
    var tz = this.elc;
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
              sw, sh, "elc"
            ]);
        }
    }
    return ans;
};

function DoubleElcEffect(board, elc1, elc2) {
    this.board = board;
    this.progress = 0;
    this.tick = 0;
    this.totalTicks = 1;
    this.showTime = 12;
    this.elc1 = elc1;
    this.elc2 = elc2;
    this.done = false;
    elc1.state = ElcShape.DISCHARGING;
    elc2.state = ElcShape.DISCHARGING;
}

DoubleElcEffect.prototype.update = function (board) {
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
                this.elc1.state = ElcShape.FINISHED;
                this.elc2.state = ElcShape.FINISHED;
                board.clearShape(this.elc1.x, this.elc1.y);
                board.clearShape(this.elc2.x, this.elc2.y);
                if (this.elc1.cleared && this.elc2.cleared)
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

DoubleElcEffect.prototype.getSpritePositions = function () {
    var ans = [];
    var tz = this.elc1;
    var tzx = (tz.x - tz.dir.x * tz.pos / 10);
    var tzy = (tz.y - tz.dir.y * tz.pos / 10);
    var tz2 = this.elc2;
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
          sw, sh, "elc"
        ]);
    }
    return ans;
};
