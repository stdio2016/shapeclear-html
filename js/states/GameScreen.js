function GameScreen() {
    this.debug = null; // To show debug message
    this.background = null;
    this.castle = null;
    this.board = null;
    this.touchDetector = null;
    this.music = null;
    this.showMatches = [];
    this.effectGroup = null;
    this.boardView = null;
    this.scoreText = null;
    this.scorePopups = [];
    this.digitGroup = null;
    this.timeText = null;
    this.lblScore = this.lblTime = null;
    this.anncs = null;
    this.effectSprites = [];
    this.runTime = [];
    this.soundEffects = {
      match: null, nomatch: null
    };
    this.speedup = 1;
    this.brightShader = null;
    this.cachedHint = null;
    this.hintTimer = 0;
}

GameScreen.prototype.preload = function () {
    console.log("I don't know how to use Phaser game engine");
};

GameScreen.prototype.create = function () {
    console.log("So don't expect me to make a game");
    this.background = game.add.sprite(0, 0, 'background');
    this.castle = this.add.image(this.game.width/2, this.game.height * 0.705, 'castle');
    this.castle.anchor.set(0.5, 0.72);
    this.addDebugText();
    if (Debug.testDiagonalFall) {
        var tiles = [];
        for (var i = 0; i < 9; i++) {
            tiles.push([]);
            for (var j = 0; j < 9; j++) {
                tiles[i].push(Math.random() < 0.1 ? -1 : 1);
            }
        }
        window.board = this.board = BoardGen.generateBoard({
            "width": 9,
            "height": 9,
            "tiles": tiles
        });
    }
    else if ("hard" == "level") {
        window.board = this.board = BoardGen.generateBoard({
            "width": 9,
            "height": 9,
            "tiles": [
              [ 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [-1, 1, 1, 1, 1, 1, 1, 1, 1],
              [ 1, 1, 1, 1,-1,-1,-1,-1,-1],
              [ 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [-1,-1,-1,-1,-1, 1, 1, 1, 1],
              [-1, 1, 1, 1,-1, 1, 1, 1,-1],
              [-1, 1, 1, 1, 1, 1, 1, 1,-1],
              [-1,-1, 1, 1, 1, 1, 1,-1,-1],
              [-1,-1,-1, 1, 1, 1, 1,-1,-1]
            ]
        });
    }
    else if (AppleFools.DROP_COLOR_COUNT === 6) {
        window.board = this.board = BoardGen.generateBoard({
            "width": 9,
            "height": 9,
            "tiles": [
              [1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        });
    }
    else {
        window.board = this.board = BoardGen.generateBoard({
            "width": 9,
            "height": 9,
            "tiles": [
              [1, 1, 1, 1,  1,  1, 1, 1, 1],
              [1, 1, 1, 1,  1,"t", 1, 1, 1],
              [1, 1, 1, 1,  1,  1, 1, 1, 1],
              [1, 1, 1, 1,  1,  1, 1, 1, 1],
              [1, 1, 1, 1, -1,  1, 1, 1, 1],
              [1, 1, 1, 1,  1,  1, 1, 1, 1],
              [1, 1, 1, 1,  1,  1, 1, 1, 1],
              [1, 1, 1, 1,  1,  1, 1, 1, 1],
              [1, 1, 1, 1,  1,  1, 1, 1, 1]
            ]
        });
    }
    this.board.addHook(this, this.onBoardEvent);
    this.boardView = new BoardView(this.game, this.board);
    this.effectGroup = this.add.group();
    this.touchDetector = new TouchDetector(this.game, this.boardView);
    this.addSelectSprite();
    this.music = this.game.add.sound('music2');
    this.music.loop = true;
    this.music.play();
    this.digitGroup = this.add.group();
    this.scoreText = new ScoreText(0, 0, 0, 0, this.digitGroup);
    this.lblScore = this.createText(Translation["Score"]);
    this.timeText = new ScoreText(3600, 0, 0, 0, this.digitGroup);
    this.lblTime = this.createText(Translation["Time"]);
    this.anncs = this.game.add.group();
    this.runTime = [0, +new Date(), 0, 0, false, 1/6];
    for (var name in this.soundEffects) {
        this.soundEffects[name] = this.game.add.sound(name);
        this.soundEffects[name].allowMultiple = true;
    }
    this.brightShader = new Phaser.Filter(game, null, game.cache.getShader('bright'));
    this.boardView.brightShader = this.brightShader;
    
    this.lblTime.inputEnabled = true;
    this.lblTime.events.onInputUp.add(function () {
        if (AppleFools.DROP_COLOR_COUNT == 0) {
            AppleFools.DROP_COLOR_COUNT = AppleFools.COLOR_COUNT;
            this.board.dispensers = [];
            BoardGen.autoCreateDispenser(this.board);
        }
    }, this);
};

GameScreen.prototype.addDebugText = function () {
    var style = { font: "32px", fill: "black" };
    this.debug = this.game.add.text(0, 0, "0", style);
    this.debug.inputEnabled = true;
    this.debug.events.onInputUp.add(function () {
        var debugging = this.board.debug;
        this.game.paused = true;
        promptBox(Translation['Input debug command:'], '', function (result) {
            this.game.paused = false;
            debugging.runCommand(result);
        });
    }, this);
};

GameScreen.prototype.createText = function (txt) {
    var style = { font: "32px", fill: "black" };
    var txt = this.add.text(0, 0, txt, style);
    return txt;
};

GameScreen.prototype.addSelectSprite = function(){
    var ptrs = this.touchDetector.pointers;
    for (var i=0; i<ptrs.length; i++) {
        var spr = this.add.sprite(0, 0, 'shapes', 'selected');
        ptrs[i].selectSprite = spr;
        spr.visible = false;
    }
};

GameScreen.prototype.paused = function () {
    console.log("paused");
    this.runTime[4] = false;
    this.music.pause();
};

GameScreen.prototype.resumed = function () {
    console.log("resumed");
    this.music.resume();
}

GameScreen.prototype.update = function () {
    if (this.board.state === 3 && this.speedup >= 1) {
        this.speedup += 0.001;
    }
    this.fixTime();
    this.resizeUI();
    this.touchDetector.update();
    var runTime = this.runTime;
    runTime[3] = Math.min(runTime[3] + runTime[5]/10 * 60, 5);
    while (runTime[3] > 0) {
        this.updateOnce();
        runTime[3] -= Math.max(1 / this.speedup, 0.001);
    }

    this.boardView.drawShape();
    this.boardView.drawEffects(this.effectGroup);

    this.anncs.x = this.boardView.x + this.board.width * this.boardView.gridSize / 2;
    this.anncs.y = this.boardView.y + this.board.height * this.boardView.gridSize / 2;

    var fontSize = Math.round(Math.min(game.width, game.height) * 0.05);
    this.lblTime.fontSize = fontSize;
    this.lblScore.fontSize = fontSize;
    this.debug.fontSize = fontSize;
    this.debug.text = this.board.debug.getDebugMessage();
    this.background.width = game.width;
    this.background.height = game.height;

    var castleScale = Math.min(this.game.height * 0.9, this.game.width) / 800;
    this.castle.scale.set(castleScale, castleScale);
    this.castle.position.set(this.game.width / 2, this.game.height * 0.705);

    this.scoreText.setScore(this.board.score);
    var remainingTime = this.board.remainingTime;
    if (Math.ceil(remainingTime / 60) <= 10 && (remainingTime-1)%60 >= 30 || remainingTime == 0) {
        this.timeText.setColor(1);
    }
    else {
        this.timeText.setColor(0);
    }
    this.timeText.setScore(Math.ceil(remainingTime / 60));
    // Uncomment this to test layout
    //this.scoreText.setScore(Math.floor(this.scoreText.value * 1.1)+1);
    this.updateSelectSprite();
    this.updateScoreText();
};

GameScreen.prototype.fixTime = function () {
    var runTime = this.runTime;
    var now = +new Date();
    if (runTime[4]) {
        runTime[0]++;
        runTime[2] += (now - runTime[1]) / 1000;
    }
    if (runTime[0] >= 10) {
        runTime[0] = 0;
        runTime[5] = runTime[2];
        runTime[2] = 0;
    }
    runTime[1] = now;
    runTime[4] = true;
};

GameScreen.prototype.updateOnce = function () {
    // Only need this if you want to speed up 1000x
    /*
    for (var i = 0; i < this.board.shapes.length; i++) {
        if (this.board.shapes[i].sprite) {
            this.board.shapes[i].sprite.kill();
            this.board.shapes[i].sprite = null;
        }
    }
    for (var i = 0; i < 1; i++) {
    */
    if (AppleFools.DROP_COLOR_COUNT != 0)
        this.board.update();
    /*
    }
    */
    this.hintTimer += 1;
    if (this.hintTimer == 240) this.hintTimer = 0;
    if (this.board.changed || (this.board.state != Board.IDLE && this.board.state != Board.PLAYING))
        this.cachedHint = null;
    else if (!this.cachedHint && !this.board.changed) {
        var hint = this.board.hintMoves();
        var betterHint = [];
        hint.forEach(function (h) {
            var sh1 = h[2][0], sh2 = h[2][1];
            if (h[2].length == 2 && sh1.special != 0 && sh2.special != 0) {
                betterHint.push(h);
            }
        });
        if (hint.length > 0) {
            if (betterHint.length > 0) {
                this.cachedHint = betterHint[Math.floor(betterHint.length*Math.random())][2];
            }
            else
                this.cachedHint = hint[Math.floor(hint.length*Math.random())][2];
        }
    }
    if (this.board.swaps.length > 0 || !this.cachedHint) this.hintTimer = 0;
    if (AppleFools.DROP_COLOR_COUNT == 0) this.cachedHint = null; // level editor
    this.boardView.cachedHint = this.cachedHint;
    this.boardView.hintTimer = this.hintTimer;
    var scoreTexts = this.scorePopups;
    while (scoreTexts.length > 0 && scoreTexts[0].lifetime <= 0) {
        if (scoreTexts[0].view) scoreTexts[0].view.kill();
        scoreTexts.shift();
    }
    var scores = this.board.gainScores;
    for (var i = 0; i < scores.length; i++) {
        scores[i].lifetime = 100;
        scoreTexts.push(scores[i]);
    }
    for (var i = 0; i < scoreTexts.length; i++) {
        scoreTexts[i].lifetime -= 1;
    }
};

GameScreen.prototype.updateSelectSprite = function () {
    var ptrs = this.touchDetector.pointers;
    for (var i=0; i<ptrs.length; i++) {
        var spr = ptrs[i].selectSprite;
        spr.visible = ptrs[i].isDown && ptrs[i].tracking;
        spr.x = this.boardView.x + this.boardView.gridSize * ptrs[i].x;
        spr.y = this.boardView.y + this.boardView.gridSize * ptrs[i].y;
        spr.width = this.boardView.gridSize;
        spr.height = this.boardView.gridSize;
    }
    if (this.touchDetector.lastPointed !== null) {
        var spr = ptrs[0].selectSprite, pos = this.touchDetector.lastPointed;
        spr.visible = true;
        spr.x = this.boardView.x + this.boardView.gridSize * pos.x;
        spr.y = this.boardView.y + this.boardView.gridSize * pos.y;
        spr.width = this.boardView.gridSize;
        spr.height = this.boardView.gridSize;
    }
};

GameScreen.prototype.resizeUI = function(){
    var gw = game.width;
    var gh = game.height;
    if (gw > gh * 7/5) { // wide landscape
        var left = gh * 2/5;
        var right = gw - left;
        var tall = gh;
        this.resizeBoard(left + (right - tall) / 2 + tall * 1/11, (gh - tall * 9/11) / 2, tall * 9/11);
        this.showWithBounds(this.lblTime, this.timeText, left * 2/5, gh * 3/10, left * 2/3, gh * 1/10);
        this.showWithBounds(this.lblScore, this.scoreText, left * 2/5, gh * 1/2, left * 2/3, gh * 1/10);
    }
    else if (gw > gh) { // narrow landscape
        var left = gw * 2/7;
        var right = gw * 5/7;
        var tall = gw * 5/7;
        this.resizeBoard(left + (right - tall) / 2 + tall * 1/11, (gh - tall * 9/11) / 2, tall * 9/11);
        this.showWithBounds(this.lblTime, this.timeText, left * 2/5, tall * 3/10, left * 2/3, tall * 1/10);
        this.showWithBounds(this.lblScore, this.scoreText, left * 2/5, tall * 1/2, left * 2/3, tall * 1/10);
    }
    else if (gw > gh * 8/11){ // short portrait
        var up = gh * 1/11;
        var middle = gh * 8/11;
        var down = gh - up - middle;
        var tall = middle;
        var wide = gh * 8/11;
        this.resizeBoard((gw - tall * 9/11) / 2, up + (middle - tall) / 2 + tall * 1/11, tall * 9/11);
        this.showWithBounds(this.lblTime, this.timeText, gw * 1/4, (up + middle) + down * 2/5, wide * 1/5, down * 1/3);
        this.showWithBounds(this.lblScore, this.scoreText, gw * 1/2, (up + middle) + down * 2/5, wide * 1/5, down * 1/3);
    }
    else { // long portrait
        var up = gw * 1/8;
        var middle = gh - up - gw * 2/8;
        var down = gh - up - middle;
        var tall = gw;
        var wide = gw;
        this.resizeBoard((gw - tall * 9/11) / 2, up + (middle - tall) / 2 + tall * 1/11, tall * 9/11);
        this.showWithBounds(this.lblTime, this.timeText, gw * 1/4, (up + middle) + down * 2/5, wide * 1/5, down * 1/3);
        this.showWithBounds(this.lblScore, this.scoreText, gw * 1/2, (up + middle) + down * 2/5, wide * 1/5, down * 1/3);
    }
};

GameScreen.prototype.showWithBounds = function (lbl, txt, x, y, width, height) {
    var r = Phaser.VERSION.startsWith("2.6.") ? this.game.resolution : 1.0;
    txt.showWithBounds(x, y, width, height);
    lbl.x = x - lbl.width / (2 * r);
    lbl.y = y - lbl.height / (2 * r) - height;
};

GameScreen.prototype.resizeBoard = function(leftX, topY, size){
    var board = this.board;
    var boardSize = 9;
    var gridSize = size / boardSize;
    var scale = gridSize / this.game.state.states.Load.gridPx;
    var startX = leftX + (boardSize - board.width) / 2 * gridSize;
    var startY = topY + (boardSize - board.height) / 2 * gridSize;
    this.boardView.x = startX;
    this.boardView.y = startY;
    this.boardView.gridSize = gridSize;
};

GameScreen.prototype.updateScoreText = function () {
    var board = this.boardView;
    for (var i = 0; i < this.scorePopups.length; i++) {
        var st = this.scorePopups[i];
        if (!st.view) st.view = new ScoreText(st.score, st.type, st.x, st.y, this.digitGroup);
        st.view.popup(board.x, board.y, board.gridSize, st.lifetime);
    }
};

GameScreen.prototype.render = function (game) {
    if (!this.board.debug.showMatching) return;
    var colors = [0x7f0000, 0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0xff7fff, 0xc0c0c0, 0xffffff, 0x000000];
    var matches = this.board.matchFinder.matches.concat(this.board.matchFinder.swapMatches);
    var x, y, width, height, line;
    var j = 0;
    var spr;
    function getSprite () {
        if (j < this.showMatches.length) {
            spr = this.showMatches[j];
        }
        else {
            spr = this.add.sprite(0, 0, 'number', '0');
            this.showMatches.push(spr);
        }
        spr.visible = true;
        j++;
    };

    for (var i = 0; i < matches.length; i++) {
        var m = matches[i];
        if (m.type & Match.HORIZONTAL) {
            getSprite.call(this);
            spr.x = this.board.x + m.hx * this.board.gridSize;
            spr.width = m.hlength * this.board.gridSize;
            spr.y = this.board.y + (m.hy + 0.4) * this.board.gridSize;
            spr.height = 0.2 * this.board.gridSize;
            spr.tint = colors[i % colors.length];
        }
        if (m.type & Match.VERTICAL) {
            getSprite.call(this);
            spr.y = this.board.y + m.vy * this.board.gridSize;
            spr.height = m.vlength * this.board.gridSize;
            spr.x = this.board.x + (m.vx + 0.4) * this.board.gridSize;
            spr.width = 0.2 * this.board.gridSize;
            spr.tint = colors[i % colors.length];
        }
    }

    for (var i = j; i < this.showMatches.length; i++) {
        this.showMatches[i].visible = false;
    }
};

GameScreen.prototype.shutdown = function () {
    this.music.destroy();
    this.music = null;
    this.showMatches = [];
    this.scorePopups = [];
    window.board = null;
    this.effectSprites = [];
    for (var name in this.soundEffects) {
        this.soundEffects[name].destroy();
    }
};

GameScreen.prototype.saveScore = function (score) {
    if (this.board.debug.debugged || score !== score || score < 0) return ;
    try {
        var xp = +localStorage.ShapeClear_xp;
        if (!xp) xp = 0;
        xp += Math.floor(score / 10);
        localStorage.ShapeClear_xp = xp;
        var times = +localStorage.ShapeClear_played;
        if (!times) times = 0;
        localStorage.ShapeClear_played = times + 1;
    }
    catch (x) {
        ;
    }
};

GameScreen.prototype.redraw = function () {
    this.shapeGroup.children.forEach(function (x) {
        x.kill();
    });
    this.shapeGroup.children.length = 0;
    this.board.shapes.forEach(function (x) {
        if (x.sprite) x.sprite = null;
    });
};

GameScreen.prototype.playSound = function (name, pitch) {
    var s = this.soundEffects[name];
    s.play();
    pitch = pitch || 1; 
    if (s._sound && s._sound.playbackRate && s._sound.playbackRate.value) {
        s._sound.playbackRate.value = pitch;
    }
};

GameScreen.prototype.addAnncs = function addAnncs(txt) {
    var t = this.createText(txt);
    t.anchor.set(0.5, 0.5);
    t.t = 0;
    this.anncs.add(t);
    t.update = function () {
        var delta = t.game.time.elapsed;
        t.fontSize = Math.round(Math.min(t.game.width, t.game.height) * 0.05) * 2.5;
        t.y -= delta * 0.01;
        t.t += delta;
        if (t.t < 167) t.scale.set(t.t/167, t.t/167);
        else t.scale.set(1, 1);
        if (t.t > 1000) t.destroy();
        else if (t.t > 667) t.alpha = (1000 - t.t) / 333;
    };
};

GameScreen.prototype.onEndChain = function (args) {
    var goodness = args.goodness;
    var txt = '';
    if (goodness >= 12) txt = 'Amazing!';
    else if (goodness >= 9) txt = 'Excellent';
    else if (goodness >= 6) txt = 'Great';
    else if (goodness >= 4) txt = 'Nice';
    if (txt) this.addAnncs(txt);
};

GameScreen.prototype.waitForCond = function (condition, callback) {
    var dummy = this.add.group();
    var me = this;
    dummy.update = function () {
        if (condition()) {
            callback();
            dummy.destroy();
        }
    };
};

GameScreen.prototype.onBoardEvent = function (evt, args) {
    var me = this;
    if (evt == 'endChain') {
        this.onEndChain(args);
        return;
    }
    if (evt == 'playSound') {
        this.playSound(args.name, args.pitch);
        return;
    }
    if (evt == 'shuffle') {
        this.addAnncs(Translation['Shuffling...']);
        return;
    }
    if (evt == 'bonusTime') {
        this.waitForCond(
            function () { return me.anncs.length == 0; },
            function () {
                me.addAnncs(Translation['Bonus Time']);
                me.board.state = Board.BONUS_TIME;
            }
        );
    }
    if (evt == 'endGame') {
        this.waitForCond(
            function () { return me.anncs.length == 0; },
            function () {
                me.speedup = 1;
                me.saveScore(me.board.score);
                alertBox(
                  Translation["Time's up"] + '\n' +
                  Translation["Your score: "] + me.board.score + '\n' + 
                  Translation["Press OK to replay"], function () {
                    me.state.start('MainMenu');
                });
                if (AppleFools.AutoGame) {
                    setTimeout(function () {
                        promptOK.onclick();
                    }, 1000);
                }
            }
        );
    }
};
