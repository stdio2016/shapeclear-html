function Board(game) {
    this.shapes = [];
    this.tiles = [];
    this.height = 9;
    this.width = 9;
    this.game = game;
    this.swaps = [];
    this.matches = [];
    this.deletedShapes = [];
    this.falling = false;
    this.debug = new Debug(this);
    this.combo = 0;
    this.gainScores = [];
    this.remainingTime = 3600;
    this.score = 0;

    // position of board in the game
    this.x = 0;
    this.y = 0;
    this.gridSize = 0;
}

Board.prototype.generateSimple = function () {
    this.shapes = new Array(this.height * this.width);
    var arr = this.shapes;
    var height = this.height;
    var width = this.width;
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var r1, r2;
            if (i >= 2) {
                r1 = this.getShape(j, i - 1).type;
                if (this.getShape(j, i - 2).type !== r1) {
                    r1 = -1;
                }
            }
            if (j >= 2) {
                r2 = this.getShape(j - 2, i).type;
                if (this.getShape(j - 1, i).type !== r2) {
                    r2 = -1;
                }
            }
            var r;
            do {
                r = this.game.rnd.between(1, AppleFools.COLOR_COUNT);
            } while (r1 == r || r2 == r) ;
            var sh = new Shape(r, j, i, this);
            arr[i * width + j] = sh;
            // TODO: Add Tile class
            this.tiles.push({sprite: null});
        }
    }
};

Board.prototype.getShape = function (x, y) {
    // bound check
    if (x >= this.width || x < 0) return null;
    if (y >= this.height || y < 0) return null;
    return this.shapes[x + y * this.width];
};

Board.prototype.setShape = function (x, y, sh) {
    // bound check
    if (x >= this.width || x < 0) throw RangeError('x out of bound');
    if (y >= this.height || y < 0) return RangeError('y out of bound');
    if (sh instanceof Shape) {
        if (sh.board !== this) throw TypeError("this Shape comes from different Board");
        this.shapes[x + y * this.width] = sh;
    }
    else if (typeof sh === "number") {
        var sp = this.shapes[x + y * this.width];
        if (sp.sprite) sp.sprite.kill();
        sp.type = sh;
        sp.sprite = null;
    }
};

Board.prototype.clearShape = function (x, y) {
    // bound check
    if (x >= this.width || x < 0) throw RangeError('x out of bound');
    if (y >= this.height || y < 0) return RangeError('y out of bound');
    // TODO: handle special shapes such as striped or wrapped ones
    var i = x + y * this.width;
    if (this.shapes[i].type > 0 && !this.shapes[i].cleared && !this.shapes[i].swapping) {
        this.deletedShapes.push(this.shapes[i]);
        this.shapes[i].cleared = true;
        //this.shapes[i] = new Shape(0, x, y);
    }
};

Board.prototype.addSwap = function(from, to) {
    // NOTE: uncomment this to prevent multi swipe at the same time
    //if (this.falling || this.combo > 0 || this.swaps.length > 0) return;
    var sh1 = this.getShape(from.x, from.y);
    var sh2 = this.getShape(to.x, to.y);
    if ((!sh1.canSwap() || !sh2.canSwap()) && !this.debug.allowIllegalMove) {
        return ;
    }
    this.swaps.push(new Swap(sh1, sh2, 10));
    this.swapShape(sh1, sh2);
};

Board.prototype.swapShape = function (sh1, sh2) {
    this.shapes[sh1.x + sh1.y * this.width] = sh2;
    this.shapes[sh2.x + sh2.y * this.width] = sh1;
    sh1.swapping = sh2.swapping = true;
    var dx = sh2.x - sh1.x;
    var dy = sh2.y - sh1.y;
    sh1.dir = {x: dx, y: dy};
    sh2.dir = {x: -dx, y: -dy};
    var tmp = sh1.x;
    sh1.x = sh2.x;
    sh2.x = tmp;
    tmp = sh1.y;
    sh1.y = sh2.y;
    sh2.y = tmp;
};

Board.prototype.update = function () {
    this.debug.autoSwipeTest();
    this.gainScores = [];
    this.updateSwaps();
    this.initMatch();
    if (!this.falling) {
        this.findVeritcalMatch();
        this.findHorizontalMatch();
        // TODO: sort chains by their type
        // first match-5, then cross, match-4, and finally match-3.
        this.clearMatch();
    }
    var newDelShapes = [];
    for (var i = 0; i < this.deletedShapes.length; i++) {
        if (this.deletedShapes[i].deleteUpdate()) {
            newDelShapes.push(this.deletedShapes[i]);
        }
        this.falling = true;
    }
    this.deletedShapes = newDelShapes;
    if (!this.falling && this.matches.length == 0) {
      this.combo = 0;
    }
    this.falling = false;
    this.fall();
    if (this.remainingTime > 0)
        this.remainingTime--;
};

Board.prototype.updateSwaps = function () {
    for (var i = 0; i < this.swaps.length; i++) {
        var from = this.swaps[i].from;
        var to = this.swaps[i].to;
        this.swaps[i].tick--;
        from.pos = to.pos = this.swaps[i].interpolatedPos() * 10;
        if (this.swaps[i].tick == 0) {
            from.stopSwapping();
            to.stopSwapping();
            if ( this.isValidSwapAt(from.x, from.y)
              || this.isValidSwapAt(to.x, to.y)
              || this.swaps[i].status === 'reject'
            ) {
                this.swaps[i] = this.swaps[this.swaps.length - 1];
                this.swaps.length--;
                --i;
            }
            else {
                this.game.add.sound('nomatch').play();
                this.swaps[i].reject();
                this.swapShape(from, to);
                from.pos = to.pos = this.swaps[i].interpolatedPos() * 10;
            }
        }
    }
};

Board.prototype.initMatch = function () {
    this.matches = [];
    for (var i = 0; i < this.shapes.length; i++) {
        if (this.shapes[i].match) {
            this.shapes[i].match = null;
        }
    }
};

Board.prototype.findVeritcalMatch = function () {
    var w = this.width;
    var i;
    var shapes = this.shapes;
    for (var x = 0; x < this.height; x++) {
        i = x;
        for (var y = 0; y < w - 2; y++) {
            if (shapes[i].canMatch()) {
                var sh = shapes[i].type;
                if (shapes[i + w].canMatch() && shapes[i + w].type === sh
                 && shapes[i + 2*w].canMatch() && shapes[i + 2*w].type === sh) {
                    var match = new Match(Match.VERTICAL, x, y, sh);
                    do {
                        shapes[i].match = match;
                        match.vlength++;
                        y++;
                        i += w;
                    } while (y < w && shapes[i].canMatch() && shapes[i].type === sh) ;
                    y--; i -= w;
                    this.matches.push(match);
                }
            }
            i += w;
        }
    }
};

Board.prototype.findHorizontalMatch = function () {
    var w = this.width;
    var h = this.height;
    var shapes = this.shapes;
    var i;
    for (var y = 0; y < h; y++) {
        i = y * w;
        for (var x = 0; x < w - 2; x++) {
            if (shapes[i].canMatch()) {
                var sh = shapes[i].type;
                if (shapes[i + 1].canMatch() && shapes[i + 1].type === sh
                 && shapes[i + 2].canMatch() && shapes[i + 2].type === sh) {
                    var match = new Match(Match.HORIZONTAL, x, y, sh);
                    var cross = null;
                    do {
                        match.hlength++;
                        if (cross === null && shapes[i].match !== null) {
                            if(shapes[i].match.type === Match.VERTICAL) {
                                cross = shapes[i].match;
                            }
                        }
                        x++;
                        i += 1;
                    } while (x < h && shapes[i].canMatch() && shapes[i].type === sh) ;
                    x--; i -= 1;
                    if (cross !== null) { // l/T shaped match
                        cross.type = Match.CROSS;
                        cross.hx = match.hx;
                        cross.hy = match.hy;
                        cross.hlength = match.hlength;
                        match = cross;
                    }
                    else {
                        this.matches.push(match);
                    }
                }
            }
            i += 1;
        }
    }
};

Board.prototype.isValidSwapAt = function (x, y) {
    if (this.debug.allowIllegalMove) return true;
    var leftMatch = 0, rightMatch = 0, upMatch = 0, downMatch = 0;
    var sh = this.getShape(x, y);
    if (!sh.canMatch()) {
        return false;
    }
    var type = sh.type;
    if (x >= 1) {
        sh = this.getShape(x - 1, y);
        if (sh.canMatch() && sh.type === type) {
            leftMatch = 1;
            if (x >= 2) {
                sh = this.getShape(x - 2, y);
                if (sh.canMatch() && sh.type === type) {
                    return true;
                }
            }
        }
    }
    if (x < 9 - 1) {
        sh = this.getShape(x + 1, y);
        if (sh.canMatch() && sh.type === type) {
            rightMatch = 1;
            if (x < 9 - 2) {
                sh = this.getShape(x + 2, y);
                if (sh.canMatch() && sh.type === type) {
                    return true;
                }
            }
        }
    }
    if (y >= 1) {
        sh = this.getShape(x, y - 1);
        if (sh.canMatch() && sh.type === type) {
            upMatch = 1;
            if (y >= 2) {
                sh = this.getShape(x, y - 2);
                if (sh.canMatch() && sh.type === type) {
                    return true;
                }
            }
        }
    }
    if (y < 9 - 1) {
        sh = this.getShape(x, y + 1);
        if (sh.canMatch() && sh.type === type) {
            downMatch = 1;
            if (y < 9 - 2) {
                sh = this.getShape(x, y + 2);
                if (sh.canMatch() && sh.type === type) {
                    return true;
                }
            }
        }
    }
    return upMatch + downMatch >= 2 || leftMatch + rightMatch >= 2;
};

Board.prototype.clearMatch = function () {
    if (this.debug.disableMatching) return;
    for (var i = 0; i < this.matches.length; i++) {
        var m = this.matches[i];
        var mx = m.vx, my = m.hy, type = m.shapeType;
        if (m.type & Match.HORIZONTAL) {
            for (var j = 0; j < m.hlength; j++) {
                this.clearShape(m.hx + j, m.hy);
            }
            mx = m.hx + (m.hlength - 1) / 2;
        }
        if (m.type & Match.VERTICAL) {
            for (var j = 0; j < m.vlength; j++) {
                this.clearShape(m.vx, m.vy + j);
            }
            my = m.vy + (m.vlength - 1) / 2;
        }
        this.combo++;
        var len = m.hlength + m.vlength - (m.type == Match.HORIZONTAL + Match.VERTICAL ? 1 : 0);
        var score = len >= 5 ? len * 40 : (len == 4 ? 120 : 60);
        score *= this.combo;
        this.gainScores.push({x: mx, y: my, type: m.shapeType, score: score});
        this.score += score;
    }
    if (this.matches.length > 0) {
        var s = game.add.sound('match');
        var cn = [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24][Math.min(this.combo - 1, 14)];
        s.play();
        if (s._sound && s._sound.playbackRate && s._sound.playbackRate.value) {
          s._sound.playbackRate.value = Math.pow(2, cn / 12);
        }
    }
};

Board.forEachPossibleMatch = function (left, top, width, height, callback) {
    function callbackArguments(x1, y1, x2, y2, x3, y3, x4, y4) {
        // shapes at (x1,y1), (x2,y2), and (x3,y3) may match-3
        // objects at (x3,y3) and (x4,y4) may be swapped
    }
    var right = left + width, bottom = top + height;
    var x, y;
    for (x = left; x < right-3; x++) {
        for (y = top; y < bottom; y++) {
            callback(x, y, x+1, y, x+3, y, x+2, y);
            callback(x+3, y, x+2, y, x, y, x+1, y);
        }
    }
    for (x = left; x < right-2; x++) {
        for (y = top; y < bottom-1; y++) {
            callback(x  ,y  ,x+1,y  ,x+2,y+1,x+2,y);
            callback(x  ,y  ,x+2,y  ,x+1,y+1,x+1,y);
            callback(x+1,y  ,x+2,y  ,x  ,y+1,x  ,y);
            callback(x  ,y+1,x+1,y+1,x+2,y  ,x+2,y+1);
            callback(x  ,y+1,x+2,y+1,x+1,y  ,x+1,y+1);
            callback(x+1,y+1,x+2,y+1,x  ,y  ,x  ,y+1);
        }
    }
    for (x = left; x < right-1; x++) {
        for (y = top; y < bottom-2; y++) {
            callback(x  ,y  ,x  ,y+1,x+1,y+2,x  ,y+2);
            callback(x  ,y  ,x  ,y+2,x+1,y+1,x  ,y+1);
            callback(x  ,y+1,x  ,y+2,x+1,y  ,x  ,y);
            callback(x+1,y  ,x+1,y+1,x  ,y+2,x+1,y+2);
            callback(x+1,y  ,x+1,y+2,x  ,y+1,x+1,y+1);
            callback(x+1,y+1,x+1,y+2,x  ,y  ,x+1,y);
        }
    }
    for (x = left; x < right; x++) {
        for (y = top; y < bottom-3; y++) {
            callback(x, y, x, y+1, x, y+3, x, y+2);
            callback(x, y+3, x, y+2, x, y, x, y+1);
        }
    }
};

// Helper for Board.prototype.fall
Board.prototype.tryFallAt = function (i, wd) {
    var sh = this.shapes[i];
    var d = false;
    if (sh.isEmpty()) { // empty tile
        return true;
    }
    if (sh.canFall() && (sh.isStopped() || sh.pos <= 0 || sh.bouncing) && !wd[i]) {
        wd[i] = true;
        // TODO: find the Down of i
        if (i < 72) {
            d = this.tryFallAt(i + 9, wd);
        }
        else {
            d = false;
        }
        if (d) { //there is space for falling
            if (sh.isStopped()) {
                sh.speed = 0.2; // initial falling speed
                sh.pos = 10 - sh.speed;
                sh.dir = {x: 0, y: 1}; // assign direction
            }
            else {
                sh.bouncing = false;
                sh.pos += 10;
            }
            this.shapes[i] = new Shape(0, i % 9, Math.floor(i / 9), this);
            // TODO: add support for other gravity directions
            this.shapes[i + 9] = sh;
            sh.y++;
            this.falling = true;
        }
    }
    return d;
};

Board.prototype.fall = function () {
    var wd = []; // "shape will fall down or pass through" mark
    for (var i = 0; i < this.shapes.length; i++) {
        var sh = this.shapes[i];
        if (sh.isMoving()) {
            sh.speed += 0.1; // gravity acceleration
            if(sh.speed > 10) { // maximum speed
                sh.speed = 10;
            }
            sh.pos -= sh.speed;
            if (!sh.bouncing) {
                this.falling = true;
            }
        }
        wd.push(false);
    }
    for (var i = 0; i < this.shapes.length; i++) {
        this.tryFallAt(i, wd);
    }
    for (var i = 0; i < this.shapes.length; i++) {
        var sh = this.shapes[i];
        // TODO: add support for other gravity direction
        if (sh.isMoving() && sh.pos <= 0) {
            if (i >= 72 || !this.shapes[i + 9].isEmpty()) {
                // stop the shape from falling
                sh.stopFalling();
            }
        }
    }
    for (var i = 0; i < 9; i++) {
        var dsh = this.shapes[i + 9];
        if (this.shapes[i].isEmpty()) {
            this.falling = true;
            var r = Math.floor(Math.random() * AppleFools.DROP_COLOR_COUNT);
            var sh = new Shape(r + 1, i, 0, this);
            this.shapes[i] = sh;
            sh.dir = {x: 0, y: 1};
            if (dsh.isEmpty() || dsh.isStopped() || dsh.bouncing) {
                sh.pos = 10;
                sh.speed = 0;
            }
            else {
                sh.pos = this.shapes[i + 9].pos;
                sh.speed = this.shapes[i + 9].speed;
            }
        }
    }
   for (var i = 0; i < this.shapes.length; i++) {
        var j = i;
        var sh = this.shapes[i];
        if (sh.isMoving() || sh.swapping) {
            do {
                wd[j] = true;
                if (j < (this.height - 1) * this.width) {
                    j = j + 9;
                }
                else {
                    break;
                }
                sh = this.shapes[j];
            } while (!wd[j] && (sh.swapping || sh.isEmpty())) ;
        }
    }
};

Board.prototype.elcShape = function (type) {
    for (var i = 0; i < this.shapes.length; i++) {
        if (this.shapes[i].type == type) {
            this.clearShape(i%this.width, Math.floor(i/this.width));
        }
    }
};
