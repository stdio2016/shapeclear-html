function Board(game, width, height) {
    this.shapes = [];
    this.tiles = [];
    this.height = height || 9;
    this.width = width || 9;
    this.game = game;
    this.swaps = [];
    this.matchFinder = new MatchFinder();
    this.deletedShapes = [];
    this.runningItems = [];
    this.falling = false;
    this.changed = false;
    this.debug = new Debug(this);
    this.combo = 0;
    this.gainScores = [];
    this.remainingTime = 3600;
    this.remainingMoves = -1;
    this.score = 0;
    this.tileLocks = [];
    this.itemChanged = false;
    this.state = Board.PLAYING;
    this.passedTime = 0;
    this.tick = 0;
    this.randomColors = [1,2,3,4,5,6];
    this.goodCount = 0;
    this.hooks = [];
}
Board.STARTING = 0;
Board.PLAYING = 1;
Board.SHUFFLING = 2;
Board.BONUS_TIME = 3;
Board.ENDED = 4;
Board.IDLE = 5;

Board.prototype.generateSimple = function () {
    this.randomColors = [1,2,3,4,5,6];
    for (var i = 0; i < 6 - AppleFools.COLOR_COUNT; i++) {
        var r = this.game.rnd.between(0, this.randomColors.length - 1);
        this.randomColors.splice(r, 1);
    }
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
                r = this.randomColors[this.game.rnd.between(0, AppleFools.COLOR_COUNT-1)];
            } while ((r1 == r || r2 == r) && AppleFools.COLOR_COUNT > 2) ;
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
        if (sh.board !== this) sh.board = this;
        this.shapes[x + y * this.width] = sh;
        sh.x = x;
        sh.y = y;
    }
    else if (typeof sh === "number") {
        var sp = this.shapes[x + y * this.width];
        if (sp.sprite) sp.sprite.kill();
        if (sh === 0) {
            this.shapes[x + y * this.width] = new Shape(0, x, y, this);
        }
        else {
            sp.type = sh;
            sp.sprite = null;
        }
    }
};

Board.prototype.clearShape = function (x, y, color, setting) {
    setting = setting || {};
    this.changed = true;
    // bound check
    if (x >= this.width || x < 0) throw RangeError('x out of bound');
    if (y >= this.height || y < 0) return RangeError('y out of bound');
    var i = x + y * this.width;
    var sh = this.shapes[i];
    if (sh.canCrush()) {
        if (sh.canBeCleared()) {
            this.deletedShapes.push(sh);
            sh.cleared = true;
        }
        //this.shapes[i] = new Shape(0, x, y);
        return sh.crush(this, color);
    }
    return {score: 0, addition: 0, multiply: 0, jelly: 0, blocker: 0};
};

Board.prototype.addSwap = function(from, to) {
    // NOTE: uncomment this to prevent multi swipe at the same time
    //if (this.changed || this.swaps.length > 0) return;
    if (this.state === Board.SHUFFLING) return ;
    if (AppleFools.DROP_COLOR_COUNT == 0) return ;
    if (this.remainingTime <= 0 && !this.debug.allowIllegalMove) return ;
    var sh1 = this.getShape(from.x, from.y);
    var sh2 = this.getShape(to.x, to.y);
    if ((!sh1.canSwap() || !sh2.canSwap()) && !this.debug.allowIllegalMove) {
        return ;
    }
    // NOTE: to fix empty tile position
    if (sh1.type === 0) sh1 = new Shape(0, from.x, from.y, this);
    if (sh2.type === 0) sh2 = new Shape(0, to.x, to.y, this);
    this.swaps.push(new Swap({x: from.x, y: from.y}, {x: to.x, y: to.y}, 10));
    this.swapShape(sh1, sh2);
};

Board.prototype.addHook = function (obj, method) {
    this.hooks.push([obj, method]);
};

Board.prototype.emitSignal = function (evt, args) {
    this.hooks.forEach(function (hook) {
        hook[1].call(hook[0], evt, args);
    });
};

Board.prototype.swapShape = function (sh1, sh2) {
    this.shapes[sh1.x + sh1.y * this.width] = sh2;
    this.shapes[sh2.x + sh2.y * this.width] = sh1;
    sh1.swapping = sh2.swapping = true;
    sh1.pos = sh2.pos = 10;
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
    var lock = this.tileLocks[x + y * this.width];
    for (var i = 0; i < lock.length; i++) {
        if (lock[i] === key) {
            break;
        }
    }
    if (i < lock.length) {
        lock[i] = lock[lock.length - 1];
        lock.length--;
        this.changed = true;
    }
};

Board.prototype.tileLocked = function (index) {
    return this.tileLocks[index].length > 0;
};

Board.prototype.update = function () {
    if (this.state === Board.SHUFFLING) return this.shuffleUpdate();
    this.debug.autoSwipeTest();
    this.gainScores = [];
    this.falling = false;
    this.changed = false;
    this.itemChanged = false;
    this.fall();
    this.matchFinder.clear();
    this.updateSwaps();
    this.itemClearUpdate();
    this.shapeClearUpdate();
    if (this.state === Board.BONUS_TIME || !this.falling && !this.itemChanged) {
        this.matchFinder.findAndClearMatch(this, this.debug.disableMatching);
    }
    this.shapeUpdate();
    this.matchFinder.makeMatchSound(this);
    this.changed = this.changed || this.itemChanged;
    if (!this.changed && this.matchFinder.matches.length == 0) {
        var hasBomb = false;
        for (var i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i].special === WrappedShape.SPECIAL_WAIT_EXPLODE &&
                this.shapes[i].state === WrappedShape.WAIT_EXPLODE_AGAIN)
            {
                this.shapes[i].tick = 1;
                hasBomb = true;
            }
        }
        if (hasBomb) {
            this.changed = true;
        }
        else {
            var goodness = this.combo + this.goodCount;
            if (goodness > 0) this.emitSignal('endChain', {goodness: goodness});
            this.combo = this.goodCount = 0;
            if (this.swaps.length === 0 && this.state === Board.PLAYING) {
                var hints = this.hintMoves();
                if (hints.length === 0) {
                    this.state = Board.SHUFFLING;
                    this.tick = 0;
                    return ;
                }
                else this.state = Board.IDLE;
            }
        }
    }
    if (this.remainingTime > 0)
        this.remainingTime--;
    if (this.remainingTime == 0 && !this.changed && this.swaps.length == 0) {
        if (this.state != Board.ENDED && this.state != Board.BONUS_TIME) {
            this.state = Board.ENDED;
            if (this.findFirstSpecial()) this.emitSignal("bonusTime");
            else this.emitSignal("endGame");
        }
    }
    if (this.state === Board.BONUS_TIME && !this.changed) {
        var special = this.findFirstSpecial();
        if (!special) {
            this.state = Board.ENDED;
            this.emitSignal("endGame");
        }
        else this.clearShape(special.x, special.y);
    }
    if (this.state !== Board.ENDED) {
        this.passedTime++;
    }
};

Board.prototype.findFirstSpecial = function () {
    var hasSpecial = this.findSpecial(WrappedShape.SPECIAL);
    if (!hasSpecial) hasSpecial = this.findSpecial(function (sh) {
        return sh.special === StripedShape.HORIZONTAL || sh.special === StripedShape.VERTICAL;
    });
    if (!hasSpecial) hasSpecial = this.findSpecial(ElcShape.SPECIAL);
    return hasSpecial;
};

Board.prototype.findSpecial = function (specialTest) {
    if ((typeof specialTest) !== "function") {
        var spe = specialTest;
        specialTest = function (sh) {
            return sh.special === spe;
        };
    }
    for (var i = 0; i < this.shapes.length; i++) {
        var sh = this.shapes[i];
        if (specialTest(sh)) {
            return sh;
        }
    }
    return null;
};

Board.prototype.itemClearUpdate = function () {
    var itemsToUpdate = this.runningItems;
    this.runningItems = [];
    for (var i = 0; i < itemsToUpdate.length; i++) {
        var alive = itemsToUpdate[i].update(this);
        if (alive) {
            this.runningItems.push(itemsToUpdate[i]);
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

Board.prototype.shapeUpdate = function () {
    for (var i = 0; i < this.shapes.length; i++) {
        if (!this.shapes[i].cleared)
            this.shapes[i].update();
    }
};

Board.prototype.updateSwaps = function () {
    for (var i = 0; i < this.swaps.length; i++) {
        this.state = Board.PLAYING;
        var from = this.swaps[i].from;
        from = this.getShape(from.x, from.y);
        var to = this.swaps[i].to;
        to = this.getShape(to.x, to.y);
        this.swaps[i].tick--;
        from.pos = to.pos = this.swaps[i].interpolatedPos() * 10;
        if (this.swaps[i].tick == 0) {
            from.stopSwapping();
            to.stopSwapping();
            var sw = this.swaps[i];
            if (sw.status === 'swap' && sw.specialCombo(this)) {
                this.swaps[i] = this.swaps[this.swaps.length - 1];
                this.swaps.length--;
                this.remainingMoves -= 1;
                --i;
                continue;
            }
            var valid1 = this.isValidSwapAt(from.x, from.y);
            var valid2 = this.isValidSwapAt(to.x, to.y);
            if (valid1 || valid2 || sw.status === 'reject') {
                this.swaps[i] = this.swaps[this.swaps.length - 1];
                this.swaps.length--;
                --i;
                if (sw.status === 'swap') {
                    this.remainingMoves -= 1;
                }
            }
            else {
                this.emitSignal('playSound', {name: 'nomatch'});
                sw.reject();
                this.swapShape(from, to);
                from.pos = to.pos = sw.interpolatedPos() * 10;
            }
        }
    }
};

Board.prototype.isValidSwapAt = function (x, y) {
    if (this.debug.disableMatching) return true;
    var valid = this.matchFinder.clearSwapMatch(this, x, y);
    return this.debug.allowIllegalMove || valid;
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
    else if (shape.bouncing && dx != 0) {
        shape.pos = 10;
        shape.speed = 0;
        shape.bouncing = false;
    }
    else {
        shape.bouncing = false;
        shape.pos += 10;
    }
    shape.dir = {x: dx, y: dy}; // assign direction
    var pos = shape.x + shape.y * this.width;
    this.shapes[pos] = this.shapes[pos + this.width * dy + dx];
    this.shapes[pos + this.width * dy + dx] = shape;
    shape.x += dx; shape.y += dy;
};

Board.prototype.fall = function () {
    var wd = []; // "shape will fall down or pass through" mark
    for (var i = this.shapes.length - 1; i >= 0; i--) {
        var sh = this.shapes[i], dsh = this.shapes[i + this.width];
        if (sh.isMoving()) {
            // diagonal fall is constant velocity
            // even increasing the speed to 1.2 breaks the simulation
            if (sh.dir.x) sh.speed = 1.1;
            else sh.speed += 0.15; // gravity acceleration
            if(sh.speed > 10) { // maximum speed
                sh.speed = 10;
            }
            sh.pos -= sh.speed;
            if (!sh.bouncing) {
                this.falling = true;
            }
            this.changed = true;
        }
        wd.push(false);
    }
    for (var x = 0; x < this.width; x++) {
        for (var y = this.height - 2; y >= 0; y--) {
            var pos = y * this.width + x;
            var sh = this.shapes[pos];
            if (sh.canFall()) {
                // move down more than 1 block
                var dwn = pos + this.width;
                while (dwn < this.shapes.length && this.shapes[dwn].type === -1) {
                    dwn += this.width;
                }
                if (dwn < this.shapes.length && !this.tileLocked(dwn) && this.shapes[dwn].isEmpty()) {
                    this.moveShape(sh, 0, (dwn - pos) / this.width);
                    this.falling = true;
                }
            }
        }
    }
    for (var i = 0; i < this.width; i++) {
        var dsh = this.shapes[i + this.width];
        if (this.shapes[i].isEmpty() && !this.tileLocked(i)) {
            this.falling = true;
            var r = this.game.rnd.between(0, AppleFools.DROP_COLOR_COUNT-1);
            var sh = new Shape(this.randomColors[r], i, 0, this);
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
    // HACK way to simulate Candy Crush
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            this.unlockPosition(x, y, this.fall);
        }
    }
    for (var y = 1; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var sh = this.getShape(x, y);
            if (sh.pos >= 5 && sh.dir.x == 0 && sh.isMoving()) {
                this.lockPosition(x-sh.dir.x, y-sh.dir.y, this.fall);
            }
        }
    }
    // end of HACK
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
    for (var i = 0; i < this.shapes.length; i++) {
        var sh = this.shapes[i];
        if (sh.isMoving() && sh.pos <= 0) {
            if (i >= (this.height-1) * this.width || !this.shapes[i + this.width].isEmpty() || this.tileLocked(i + this.width) || !sh.canFall()) {
                // stop the shape from falling
                sh.stopFalling();
                this.changed = true;
            }
        }
    }
    for (var y = 0; y < this.height - 1; y++) {
        for (var x = 0; x < this.width; x++) {
            var pos = y * this.width + x;
            var sh = this.shapes[pos];
            var diagonal = false;
            var dpos = pos + this.width - 1;
            if (x > 0 && !wd[dpos]) {
                var dsh = this.shapes[dpos];
                if (sh.canFall() && dsh.isEmpty() && !this.tileLocked(dpos)) {
                    sh.speed = sh.pos = 0;
                    this.moveShape(sh, -1, +1);
                    diagonal = true;
                }
            }
            if (!diagonal) {
                dpos = pos + this.width + 1;
                if (x < this.width-1 && !wd[dpos]) {
                    var dsh = this.shapes[dpos];
                    if (sh.canFall() && dsh.isEmpty() && !this.tileLocked(dpos)) {
                        sh.speed = sh.pos = 0;
                        this.moveShape(sh, +1, +1);
                        diagonal = true;
                    }
                }
            }
            if (diagonal) {
                this.falling = true;
                pos -= this.width;
                sh = this.shapes[pos];
                while (pos >= 0 && sh.canFall()) {
                    if (sh.bouncing) {
                        sh.stopFalling();
                    }
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
    this.changed = this.changed || this.falling;
};

Board.prototype.shuffle = function () {
    var r = [];
    for (var i = 0; i < this.shapes.length; i++) {
        var sh = this.shapes[i];
        sh.tick = 0;
        sh.cleared = false;
        if (sh.canSwap()) {
            r.push(sh);
        }
    }
    for (var i = r.length; i > 0; i--) {
        var rr = Math.random() * i | 0;
        var tmp = r[i-1];
        r[i-1] = r[rr];
        r[rr] = tmp;
    }
    for (var i = 0; i < this.shapes.length; i++) {
        if (this.shapes[i].canSwap()) {
            var sh = r.pop();
            sh.x = i%this.width;
            sh.y = i/this.width | 0;
            if (sh.sprite) sh.sprite.kill();
            sh.sprite = null;
            this.shapes[i] = sh;
        }
    }
    this.deletedShapes.length = 0;
};

Board.prototype.shuffleUpdate = function () {
    this.swaps.length = 0;
    this.runningItems.length = 0;
    this.stoppedItems.length = 0;
    if (this.tick === 0) this.emitSignal('shuffle');
    this.tick++;
    if (this.tick < 30) {
        ;
    }
    else {
        if (this.tick === 30) {
            // TODO: check impossible to move case
            this.shuffle();
            // if not successful, reshuffle
            if (this.hintMoves().length === 0) this.tick -= 1;
        }
        if (this.tick === 60) {
            this.state = Board.PLAYING;
            this.emitSignal('shuffleFinish');
            this.changed = true;
            this.tick = 0;
        }
    }
};

Board.prototype.hintMoves = function () {
    var swipes = [];
    Board.forEachPossibleMatch(0, 0, this.width, this.height, function (x1, y1, x2, y2, x3, y3, x4, y4) {
        var s1 = board.getShape(x1, y1);
        var s2 = board.getShape(x2, y2);
        var s3 = board.getShape(x3, y3);
        var s4 = board.getShape(x4, y4);
        if (s3.canSwap() && s4.canSwap()) {
            if (s1.canMatch() && s2.canMatch() && s3.canMatch()) {
                if (s1.type == s2.type && s1.type == s3.type) {
                    swipes.push([{x: x3, y: y3}, {x: x4, y: y4}, [s1,s2,s3]]);
                }
            }
        }
    });
    var w = this.width;
    for (var i = 0; i < this.height; i++) {
        for (var j = 0; j < w; j++) {
            var idx = i * w + j;
            var sh1 = this.shapes[idx], sh2;
            if (j > 0) {
                sh2 = this.shapes[idx-1];
                if (Swap.isSpecialCombo(sh1, sh2))
                    swipes.push([{x:j-1,y:i}, {x:j,y:i}, [sh1,sh2]]);
            }
            if (i > 0) {
                sh2 = this.shapes[idx-w];
                if (Swap.isSpecialCombo(sh1, sh2))
                    swipes.push([{x:j,y:i-1}, {x:j,y:i}, [sh1,sh2]]);
            }
        }
    }
    return swipes;
};

Board.prototype.addClick = function (aa) {
    if (AppleFools.DROP_COLOR_COUNT == 0) {
        if (this.getShape(aa.x, aa.y).type == -1) {
            this.setShape(aa.x, aa.y, this.randomColors[0|Math.random() * AppleFools.COLOR_COUNT]);
        }
        else this.setShape(aa.x, aa.y, -1);
        var aa = [];
        for (var i = 0; i < this.shapes.length; i++) {
            aa.push(this.shapes[i].type == -1 ? -1 : 1);
        }
        localStorage.ShapeClear_board = JSON.stringify(aa);
        return true;
    }
};
