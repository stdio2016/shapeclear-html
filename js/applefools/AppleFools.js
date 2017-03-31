if (!('AppleFools' in window)) {
    AppleFools = {};
}

AppleFools.appleFoolsReady = (new Date()).getMonth() + 1 != 4;
AppleFools.appleFoolsReady = false;
AppleFools.foolsMsg = 'Left-top debug text';

AppleFools.safeGetStorage = function (key) {
    try {
        return localStorage.getItem(key);
    }
    catch (x) {
        return null;
    }
};

AppleFools.safeSetStorage = function (key, value) {
    try {
        localStorage.setItem(key, value);
    }
    catch (x) {
        console.log('Cannot access localStorage');
    }
};

AppleFools.getLife = function (callback) {
    var livesInfo = AppleFools.safeGetStorage('ShapeClear_AppleFools17');
    if (typeof livesInfo !== 'string') {
        livesInfo = +new Date();
        AppleFools.safeSetStorage('ShapeClear_AppleFools17', livesInfo);
    }
    else {
        // To prevent > 5 lives
        livesInfo = Math.max(+livesInfo, +new Date());
    }
    var avail = (+new Date() + (30 * 60 * 1000) * 5 - livesInfo);
    var lives = Math.floor(avail / (30 * 60 * 1000));
    var refillTime = 30 * 60 - (avail / 1000 - lives * 30 * 60);
    var secs = refillTime % 60;
    var mins = (refillTime - secs) / 60;
    secs = Math.floor(secs);
    secs = secs >= 10 ? secs : '0'+secs;
    if (lives >= 5) {
        console.log('%c♥' + lives + ' Full', 'color:red');
    }
    else {
        console.log('%c♥' + lives + ' ' + mins+':'+secs, 'color:red');
    }
    if (!AppleFools.appleFoolsReady) {
        // This only works on Apple Fools Day
        return callback(true);
    }
    if (lives > 0) {
        livesInfo += 30 * 60 * 1000;
        AppleFools.safeSetStorage('ShapeClear_AppleFools17', livesInfo);
        callback(true);
    }
    else {
        callback(false);
    }
};

AppleFools.COLOR_COUNT = 6;
AppleFools.DROP_COLOR_COUNT = 6;

AppleFools.chooseMode = function (mode) {
    AppleFools.preparePatch();
    if (mode === 'classic') {
        AppleFools.COLOR_COUNT = 6;
        AppleFools.DROP_COLOR_COUNT = 6;
        Shape.typeNames = ['triangle', 'square', 'circle', 'hexagon',
         'downTriangle', 'rhombus'];
        Debug.prototype.getDebugMessage = AppleFools.Debug_getDebugMessage;
        Board.prototype.clearShape = AppleFools.Board_clearShape;
    }
    else {
        AppleFools.COLOR_COUNT = 4;
        AppleFools.DROP_COLOR_COUNT = 7;
        Shape.typeNames = ['triangle', 'square', 'circle', 'hexagon',
         'apple', 'pen', 'pineapple'];
        AppleFools.foolsMsg = 'Apple Fools!';
        Debug.prototype.getDebugMessage = AppleFools.foolDebugMessage;
        Board.prototype.clearShape = AppleFools.clearShape;
        AppleFools.appleCount = 0;
    }
    AppleFools.swapCounter = 0;
};

AppleFools.preparePatch = function () {
    if (!AppleFools.Board_addSwap) {
        AppleFools.Board_addSwap = Board.prototype.addSwap;
        Board.prototype.addSwap = AppleFools.addSwap;
        AppleFools.Debug_getDebugMessage = Debug.prototype.getDebugMessage;
        AppleFools.Board_clearShape = Board.prototype.clearShape;
    }
};

AppleFools.addSwap = function (a, b) {
    AppleFools.Board_addSwap.call(this, a, b);
    if (++AppleFools.swapCounter == 3) {
        alertBox('Do you know?\nToday is Apple Fools Day, and I prepared some fun features for you. Go and find them!');
    }
};

AppleFools.clearShape = function (x, y) {
    var sh = this.getShape(x, y).type;
    if (sh == 5) {
        AppleFools.IHave('an apple');
        AppleFools.appleCount++;
        if (AppleFools.appleCount >= 10) {
            this.game.state.start('MainMenu');
        }
    }
    if (sh == 6) {
        AppleFools.IHave('a pen');
    }
    if (sh == 7) {
        AppleFools.IHave('pineapple');
    }
    AppleFools.Board_clearShape.call(this, x, y);
};

AppleFools.IHave = function (obj) {
    AppleFools.foolsMsg = 'I have ' + obj;
};

AppleFools.foolDebugMessage = function () {
    return AppleFools.foolsMsg;
};
