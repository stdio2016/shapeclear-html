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
    if (this.state === TaserShape.FINISHED) {
        if (this.board.getShape(this.x, this.y) === this) {
            this.board.clearShape(this.x, this.y);
        }
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
    return Shape.prototype.crush.call(this, board);
};

function TaserEffect(board, color, taser) {
    this.board = board;
    this.totalTicks = 2;
    this.tick = this.totalTicks;
    this.progress = 0;
    this.type = color || this.board.game.rnd.between(1, AppleFools.COLOR_COUNT);
    this.taser = taser;
    // shapes to clear
    this.all = [];
    this.clearing = [];
    this.count = 0;
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
                this.board.gainScores.push({
                  x: sh.x,
                  y: sh.y,
                  type: this.type,
                  score: 60 * this.count
                });
                this.board.score += 60 * this.count;
                this.board.clearShape(sh.x, sh.y);
            }
            if (this.progress === this.count-1) {
                this.taser.state = TaserShape.FINISHED;
            }
        }
        //  taser has no target!
        if (this.count === 0) {
            this.taser.state = TaserShape.FINISHED;
        }
    }
    if (this.progress < this.count-1 || this.tick === this.totalTicks) {
        this.board.itemChanged = true;
    }
    this.tick--;
    if (this.tick <= 0) {
        this.tick = this.totalTicks;
        this.progress++;
    }
    return this.progress < this.count+2;
};

// returns array of [x, y, width, height, frameName]'s
TaserEffect.prototype.getSpritePositions = function () {
    var lb = Math.max(this.progress - 2, 0);
    var ub = Math.min(this.count, this.progress + 1);
    var ans = [];
    var tz = this.taser;
    var tzx = (tz.x + tz.dir.x * tz.pos / 10);
    var tzy = (tz.y + tz.dir.y * tz.pos / 10);
    var sw = 0.6, sh = 0.6;
    for (var i = lb; i < ub; i++) {
        var t = (this.progress-i + 1 - this.tick / this.totalTicks) / 3;
        var s = this.all[i];
        ans.push([
          (s.x + s.dir.x * s.pos / 10) * t + tzx * (1-t),
          (s.y + s.dir.y * s.pos / 10) * t + tzy * (1-t),
          sw, sh, "taser"
        ]);
    }
    return ans;
};
