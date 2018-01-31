function Board(game) {
    this.shapes = [];
    this.tiles = [];
    this.height = 9;
    this.width = 9;
    this.game = game;
    this.swaps = [];
    this.matches = [];
    this.deletedShapes = [];
    this.runningItems = [];
    this.stoppedItems = [];
    this.falling = false;
    this.changed = false;
    this.debug = new Debug(this);
    this.combo = 0;
    this.gainScores = [];
    this.remainingTime = 3600;
    this.score = 0;
    this.tileLocks = [];
    this.itemChanged = false;
    this.state = Board.PLAYING;

    // position of board in the game
    this.x = 0;
    this.y = 0;
    this.gridSize = 0;
}
Board.STARTING = 0;
Board.PLAYING = 1;
Board.SHUFFLING = 2;
Board.BONUS_TIME = 3;
Board.ENDED = 4;

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
            if (Debug.testDiagonalFall && this.game.rnd.between(1, 10)  == 1) r = -1;
            var sh = new Shape(r, j, i, this);
            arr[i * width + j] = sh;
            // TODO: Add Tile class
            this.tiles.push({sprite: null});
            this.tileLocks.push([]);
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

Board.prototype.clearShape = function (x, y, dir) {
    // bound check
    if (x >= this.width || x < 0) throw RangeError('x out of bound');
    if (y >= this.height || y < 0) return RangeError('y out of bound');
    // TODO: handle special shapes such as striped or wrapped ones
    var i = x + y * this.width;
    if (this.shapes[i].type > 0 && !this.shapes[i].cleared && !this.shapes[i].swapping) {
        this.deletedShapes.push(this.shapes[i]);
        this.shapes[i].cleared = true;
        //this.shapes[i] = new Shape(0, x, y);
        switch (this.shapes[i].special) {
          case 1:
            this.addItemToClear(new StripeEffect(this, x, y, 1, this.shapes[i].type));
            break;
          case 2:
            this.addItemToClear(new StripeEffect(this, x, y, 2, this.shapes[i].type));
            break;
          case 3:
            for (var i = Math.max(x-1, 0); i < Math.min(x+2, this.width); i++) {
                for (var j = Math.max(y-1, 0); j < Math.min(y+2, this.height); j++) {
                    this.clearShape(i, j);
                }
            }
            break;
        }
        if (this.shapes[i].type === 10) {
            this.elcShape(dir || this.game.rnd.between(1, AppleFools.DROP_COLOR_COUNT));
        }
    }
};

Board.prototype.addSwap = function(from, to) {
    // NOTE: uncomment this to prevent multi swipe at the same time
    //if (this.changed || this.swaps.length > 0) return;
    if (this.remainingTime <= 0) return ;
    var sh1 = this.getShape(from.x, from.y);
    var sh2 = this.getShape(to.x, to.y);
    if ((!sh1.canSwap() || !sh2.canSwap()) && !this.debug.allowIllegalMove) {
        return ;
    }
    // NOTE: to fix empty tile position
    if (sh1.type === 0) sh1 = new Shape(0, from.x, from.y, this);
    if (sh2.type === 0) sh2 = new Shape(0, to.x, to.y, this);
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

Board.prototype.addItemToClear = function (specialItem) {
    this.runningItems.push(specialItem);
};

Board.prototype.lockPosition = function (x, y, key) {
    var lock = this.tileLocks[x + y * this.width];
    for (var i = 0; i < lock.length; i++) {
        if (lock[i] === key) {
            break;
        }
    }
    if (i === lock.length) {
        lock.push(key);
    }
};

Board.prototype.unlockPosition = function (x, y, key) {
    this.changed = true;
    var lock = this.tileLocks[x + y * this.width];
    for (var i = 0; i < lock.length; i++) {
        if (lock[i] === key) {
            break;
        }
    }
    if (i < lock.length) {
        lock[i] = lock[lock.length - 1];
        lock.length--;
    }
};

Board.prototype.tileLocked = function (index) {
    return this.tileLocks[index].length > 0;
};

Board.prototype.update = function () {
    this.debug.autoSwipeTest();
    this.gainScores = [];
    this.falling = false;
    this.changed = false;
    this.itemChanged = false;
    this.fall();
    this.updateSwaps();
    this.initMatch();
    this.itemClearUpdate();
    this.shapeClearUpdate();
    if (!this.falling && !this.itemChanged) {
        this.findVeritcalMatch();
        this.findHorizontalMatch();
        // TODO: sort chains by their type
        // first match-5, then cross, match-4, and finally match-3.
        this.clearMatch();
    }
    this.changed = this.changed || this.itemChanged;
    if (!this.changed && this.matches.length == 0) {
        this.combo = 0;
    }
    if (this.remainingTime > 0)
        this.remainingTime--;
    if (this.state === Board.BONUS_TIME && !this.changed) {
        var hasSpecial = false;
        for (var i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i].special > 0) {
                this.clearShape(i%9, i/9|0);
                hasSpecial = true; break;
            }
        }
        if (!hasSpecial) this.state = Board.ENDED;
    }
};

Board.prototype.itemClearUpdate = function () {
    var itemsToUpdate = this.runningItems;
    this.runningItems = [];
    this.stoppedItems = [];
    for (var i = 0; i < itemsToUpdate.length; i++) {
        var alive = itemsToUpdate[i].update();
        if (alive) {
            this.runningItems.push(itemsToUpdate[i]);
        }
        else {
            this.stoppedItems.push(itemsToUpdate[i]);
        }
    }
};

Board.prototype.shapeClearUpdate = function () {
    var newDelShapes = [];
    for (var i = 0; i < this.deletedShapes.length; i++) {
        if (this.deletedShapes[i].deleteUpdate()) {
            newDelShapes.push(this.deletedShapes[i]);
        }
        this.changed = true;
    }
    this.deletedShapes = newDelShapes;
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
            else if (from.type === 10 || to.type === 10) {
                if (from.type === 10) {
                    this.clearShape(from.x, from.y, to.type);
                }
                if (to.type === 10) {
                    this.clearShape(to.x, to.y, from.type);
                }
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
    var w = this.width, h = this.height;
    var i;
    var shapes = this.shapes;
    for (var x = 0; x < w; x++) {
        i = x;
        for (var y = 0; y < h - 2; y++) {
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
                    } while (y < h && shapes[i].canMatch() && shapes[i].type === sh) ;
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
                    } while (x < w && shapes[i].canMatch() && shapes[i].type === sh) ;
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
    var leftMatch = 0, rightMatch = 0, upMatch = 0, downMatch = 0;
    var sh = this.getShape(x, y);
    if (!this.debug.allowIllegalMove && !sh.canMatch()) {
        return false;
    }
    var type = sh.type;
    while (x - leftMatch > 0) {
        sh = this.getShape(x - (leftMatch + 1), y);
        if (sh.canMatch() && sh.type === type) {
            leftMatch++;
        }
        else break;
    }
    while (x + rightMatch < this.width - 1) {
        sh = this.getShape(x + (rightMatch + 1), y);
        if (sh.canMatch() && sh.type === type) {
            rightMatch++;
        }
        else break;
    }
    while (y - upMatch > 0) {
        sh = this.getShape(x, y - (upMatch + 1));
        if (sh.canMatch() && sh.type === type) {
            upMatch++;
        }
        else break;
    }
    while (y + downMatch < this.height - 1) {
        sh = this.getShape(x, y + (downMatch + 1));
        if (sh.canMatch() && sh.type === type) {
            downMatch++;
        }
        else break;
    }
    if (upMatch + downMatch >= 2 || leftMatch + rightMatch >= 2) {
        this.initMatch();
        this.findVeritcalMatch();
        this.findHorizontalMatch();
        this.clearMatch();
    }
    return this.debug.allowIllegalMove || upMatch + downMatch >= 2 || leftMatch + rightMatch >= 2;
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
        if (m.hlength == 4 && m.type === Match.HORIZONTAL) {
            var r = this.game.rnd.between(1,2)+m.hx, sh;
            this.setShape(r, m.hy, sh = new Shape(type, r, m.hy, this));
            sh.special = 2;
        }
        if (m.vlength == 4 && m.type === Match.VERTICAL) {
            var r = this.game.rnd.between(1,2)+m.vy;
            this.setShape(m.vx, r, sh = new Shape(type, m.vx, r, this));
            sh.special = 1;
        }
        if (Debug.createSpecial) {
            if (m.type === Match.CROSS && m.hlength < 5 && m.vlength < 5) {
                this.setShape(m.vx, m.hy, sh = new Shape(type, m.vx, m.hy, this));
                sh.special = 3;
            }
            if (m.hlength >= 5) {
                this.setShape(m.hx+2, m.hy, new Shape(10, m.hx+2, m.hy, this));
            }
            if (m.vlength >= 5) {
                this.setShape(m.vx, m.vy+2, new Shape(10, m.vx, m.vy+2, this));
            }
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

Board.prototype.moveShape = function (shape, dx, dy) {
    if (shape.isStopped()) {
        shape.pos = 10 - shape.speed;
    }
    else {
        shape.bouncing = false;
        shape.pos += 10;
    }
    shape.dir = {x: dx, y: dy}; // assign direction
    var pos = shape.x + shape.y * this.width;
    this.shapes[pos] = new Shape(0, shape.x + dx, shape.y + dy, this);
    this.shapes[pos + this.width * dy + dx] = shape;
    shape.x += dx; shape.y += dy;
};

Board.prototype.fall = function () {
    var wd = []; // "shape will fall down or pass through" mark
    for (var i = this.shapes.length - 1; i >= 0; i--) {
        var sh = this.shapes[i], dsh = this.shapes[i + this.width];
        if (sh.isMoving()) {
            sh.speed += 0.07; // gravity acceleration
            if(sh.speed > 10) { // maximum speed
                sh.speed = 10;
            }
            sh.pos -= sh.speed;
            if (!sh.bouncing) {
                this.falling = true;
            }
            this.changed = true;
            if (dsh != null && !dsh.isEmpty() && dsh.pos > sh.pos && !dsh.swapping && dsh.dir.x === 0) {
                sh.pos = dsh.pos;
                if (dsh.isMoving()) {
                    sh.speed = dsh.speed;
                }
            }
        }
        wd.push(false);
    }
    for (var x = 0; x < this.width; x++) {
        for (var y = this.height - 2; y >= 0; y--) {
            var pos = y * this.width + x;
            var sh = this.shapes[pos], dsh = this.shapes[pos + this.width];
            if (sh.canFall() && (sh.isStopped() || sh.pos <= 0 || sh.bouncing) && dsh.isEmpty() && !this.tileLocked(pos + this.width)) {
                this.moveShape(sh, 0, +1);
                this.falling = true;
            }
        }
    }
    for (var i = 0; i < this.width; i++) {
        var dsh = this.shapes[i + this.width];
        if (this.shapes[i].isEmpty() && !this.tileLocked(i)) {
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
                sh.pos = this.shapes[i + this.width].pos;
                sh.speed = this.shapes[i + this.width].speed;
            }
        }
    }
    for (var i = 0; i < this.shapes.length; i++) {
        var j = i;
        var sh = this.shapes[i];
        if (sh.type > 0 || i < this.width && sh.isEmpty()) {
            do {
                wd[j] = true;
                if (j < (this.height - 1) * this.width) {
                    j = j + this.width;
                }
                else {
                    break;
                }
                sh = this.shapes[j];
            } while (!wd[j] && (sh.swapping || sh.isEmpty())) ;
        }
    }
    //for (var y = this.height-2; y >= 0; y--) {
    for (var y = 0; y < this.height - 1; y++) {
        for (var x = 0; x < this.width; x++) {
            var pos = y * this.width + x;
            var sh = this.shapes[pos];
            var diagonal = false;
            var dpos = pos + this.width + 1;
            if (x < this.width-1 && !wd[dpos]) {
                var dsh = this.shapes[dpos];
                if (sh.canFall() && (sh.isStopped() || sh.pos <= 0 || sh.bouncing) && dsh.isEmpty() && !this.tileLocked(dpos)) {
                    sh.speed = sh.pos = 0;
                    this.moveShape(sh, +1, +1);
                    diagonal = true;
                }
            }
            if (!diagonal) {
                dpos = pos + this.width - 1;
                if (x > 0 && !wd[dpos]) {
                    var dsh = this.shapes[dpos];
                    if (sh.canFall() && (sh.isStopped() || sh.pos <= 0 || sh.bouncing) && dsh.isEmpty() && !this.tileLocked(dpos)) {
                        sh.speed = sh.pos = 0;
                        this.moveShape(sh, -1, +1);
                        diagonal = true;
                    }
                }
            }
            if (diagonal) {
                this.falling = true;
                pos -= this.width;
                sh = this.shapes[pos];
                while (pos >= 0 && sh.canFall() && (sh.isStopped() || sh.pos <= 0 || sh.bouncing)) {
                    this.moveShape(this.shapes[pos], 0, +1);
                    pos -= this.width;
                    sh = this.shapes[pos];
                }
                var j = dpos;
                do {
                    wd[j] = true;
                    if (j < (this.height - 1) * this.width) {
                        j = j + this.width;
                    }
                    else {
                        break;
                    }
                    sh = this.shapes[j];
                } while (!wd[j] && (sh.swapping || sh.isEmpty())) ;
            }
        }
    }
    for (var i = 0; i < this.shapes.length; i++) {
        var sh = this.shapes[i];
        // TODO: add support for other gravity direction
        if (sh.isMoving() && sh.pos <= 0) {
            if (i >= (this.height-1) * this.width || !this.shapes[i + this.width].isEmpty() || this.tileLocked(i + this.width)) {
                // stop the shape from falling
                sh.stopFalling();
            }
        }
    }
    this.changed = this.changed || this.falling;
};

Board.prototype.elcShape = function (type) {
    var count = 0, all = [];
    for (var i = 0; i < this.shapes.length; i++) {
        if (this.shapes[i].type == type) {
            count++;
            all.push(i);
            this.clearShape(i%this.width, Math.floor(i/this.width));
        }
    }
    for (var i = 0; i < count; i++) {
        this.gainScores.push({x: all[i]%this.width, y: Math.floor(all[i]/this.width), type: type, score: 60 * count});
        this.score += 60 * count;
    }
};
