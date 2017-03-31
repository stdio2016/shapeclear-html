if (!('AppleFools' in window)) {
    AppleFools = {};
}

AppleFools.appleFoolsReady = (new Date()).getMonth() + 1 == 4;
AppleFools.foolsMsg = 'Left-top debug text';

AppleFools.safeGetStorage = function (key) {
    try {
        return localStorage.getItem(key);
    }
    catch (x) {
        return null;
    }
};

(function () {
    if (AppleFools.safeGetStorage('ShapeClear_AppleFools17')) {
        AppleFools.appleFoolsReady = true;
    }
    if (!AppleFools.appleFoolsReady) return;
    var saves = AppleFools.safeGetStorage('ShapeClear_AppleFools');
    if (saves === null || saves.substr(0, 3) !== '17\n') {
        AppleFools.livesInfo = +new Date();
        AppleFools.hintCount = 0;
    }
    else {
        var data = saves.substr(3).split(',');
        AppleFools.livesInfo = +data[0];
        AppleFools.hintCount = data[1]|0;
    }
    Load.prototype.playGame = function () {
        this.state.start('MainMenu');
    };
})();

AppleFools.safeSetStorage = function () {
    var value = '17\n' + AppleFools.livesInfo + ',' + AppleFools.hintCount;
    try {
        localStorage.setItem('ShapeClear_AppleFools', value);
    }
    catch (x) {
        console.log('Cannot access localStorage');
    }
};

AppleFools.getLife = function (callback) {
    var livesInfo = AppleFools.livesInfo;
    {
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
        AppleFools.livesInfo = livesInfo;
        AppleFools.safeSetStorage();
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
    AppleFools.framesCount = 0;
};

AppleFools.preparePatch = function () {
    if (!AppleFools.Board_addSwap) {
        AppleFools.Board_addSwap = Board.prototype.addSwap;
        Board.prototype.addSwap = AppleFools.addSwap;
        AppleFools.Debug_getDebugMessage = Debug.prototype.getDebugMessage;
        AppleFools.Board_clearShape = Board.prototype.clearShape;
        AppleFools.GameScreen_update = GameScreen.prototype.update;
        GameScreen.prototype.update = AppleFools.eachFrame;
    }
};

AppleFools.helloMsgs = [
  'Do you know?\n' +
    'Today is Apple Fools Day, and I prepared some fun features for you. Go and find them!',
  'Do you know?\n' +
    'I added a mode called Apple Fools Mode.\n' +
    'You can see your score after you "eat" 10 apples.\n' +
    'However, calculating score requires cloud computing, so if you played many times, the server might be busy~~',
  'Do you know?\n' +
    'When you swap 3 times in the game, this message will pop up.',
  'Do you know?\n' +
    '"Apple Fools Day" is a misspelling of "April Fools\' Day."',
  'Do you know?\n' +
    'In Apple Fools Mode, if you match 3 apples, you will see "I have an apple" on top left of the screen.',
  'I love PPAP!',
  'Did you see any apple, pencil or pineapple in my game?',
  'Do you know?\n' +
    'This may not be the last message in the game.'
];

AppleFools.addSwap = function (a, b) {
    AppleFools.Board_addSwap.call(this, a, b);
    if (++AppleFools.swapCounter == 3) {
        alertBox(AppleFools.helloMsgs[AppleFools.hintCount++]);
        if (AppleFools.hintCount >= AppleFools.helloMsgs.length) {
            AppleFools.hintCount = 0;
        }
        AppleFools.safeSetStorage();
    }
};

AppleFools.clearShape = function (x, y) {
    var sh = this.getShape(x, y).type;
    if (sh == 5) {
        AppleFools.IHave('an apple');
        AppleFools.appleCount++;
        if (AppleFools.appleCount == 10) {
            var time = AppleFools.framesCount;
            var score = Math.ceil(1000 * 1800 / (time + 1800));
            alertBox('Your score is ' + score, function () {
                this.game.state.start('MainMenu');
            });
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

AppleFools.eachFrame = function (game) {
    AppleFools.GameScreen_update.call(this, game);
    AppleFools.framesCount++;
};
