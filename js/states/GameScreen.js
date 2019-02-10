function GameScreen() {
    this.debug = null; // To show debug message
    this.background = null;
    this.castle = null;
    this.board = null;
    this.touchDetector = null;
    this.music = null;
    this.showMatches = [];
    this.effectGroup = null;
    this.shapeGroup = null;
    this.boardGroup = null;
    this.scoreText = null;
    this.scorePopups = [];
    this.digitGroup = null;
    this.timeText = null;
    this.lblScore = this.lblTime = null;
    this.effectSprites = [];
    this.runTime = [];
    this.soundEffects = {
      match: null, nomatch: null
    };
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
    window.board = this.board = new Board(this.game);
    this.board.generateSimple();
    this.boardGroup = this.add.group();
    this.boardGroup.alpha = 0.8;
    this.shapeGroup = this.add.group();
    this.effectGroup = this.add.group();
    this.touchDetector = new TouchDetector(this.game, this.board);
    this.addSelectSprite();
    this.music = this.game.add.sound('music2');
    this.music.loop = true;
    this.music.play();
    this.digitGroup = this.add.group();
    this.scoreText = new ScoreText(0, 0, 0, 0, this.digitGroup);
    this.lblScore = this.createText(Translation["Score"]);
    this.timeText = new ScoreText(3600, 0, 0, 0, this.digitGroup);
    this.lblTime = this.createText(Translation["Time"]);
    this.runTime = [0, +new Date(), 0, 0, false, 1/6];
    for (var name in this.soundEffects) {
        this.soundEffects[name] = this.game.add.sound(name);
        this.soundEffects[name].allowMultiple = true;
    }
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
    this.fixTime();
    var runTime = this.runTime;
    runTime[3] = Math.min(runTime[3] + runTime[5]/10 * 60, 5);
    while (runTime[3] > 0) {
        this.updateOnce();
        runTime[3] -= Math.max(this.game.time.slowMotion, 0.001);
    }
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
    this.touchDetector.update();
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
        this.board.update();
    /*
    }
    */
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
    if (this.board.remainingTime == 0 && !this.board.changed && this.board.swaps.length == 0) {
        if (this.board.state == Board.ENDED) {
        var me = this;
        if (promptCallback === doesNothing) {
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
        }
        else {
            this.board.state = Board.BONUS_TIME;
        }
    }
    // Uncomment this to test layout
    //this.scoreText.setScore(Math.floor(this.scoreText.value * 1.1)+1);
    this.resizeUI();
    this.updateSelectSprite();
    this.playSounds();
};

GameScreen.prototype.updateSelectSprite = function () {
    var ptrs = this.touchDetector.pointers;
    for (var i=0; i<ptrs.length; i++) {
        var spr = ptrs[i].selectSprite;
        spr.visible = ptrs[i].isDown && ptrs[i].tracking;
        spr.x = this.board.x + this.board.gridSize * ptrs[i].x;
        spr.y = this.board.y + this.board.gridSize * ptrs[i].y;
        spr.width = this.board.gridSize;
        spr.height = this.board.gridSize;
    }
    if (this.touchDetector.lastPointed !== null) {
        var spr = ptrs[0].selectSprite, pos = this.touchDetector.lastPointed;
        spr.visible = true;
        spr.x = this.board.x + this.board.gridSize * pos.x;
        spr.y = this.board.y + this.board.gridSize * pos.y;
        spr.width = this.board.gridSize;
        spr.height = this.board.gridSize;
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
    var r = this.game.resolution;
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
    for (var y = 0; y < board.height; y++){
        for (var x = 0; x < board.width; x++){
            var shape = board.shapes[y * board.width + x];
            if (shape.sprite === null && shape.type > 0) {
                shape.sprite = this.shapeGroup.getFirstDead(true, 100, 100, 'shapes', Shape.typeNames[shape.type - 1]);
                shape.sprite.alpha = 1;
                shape.sprite.anchor = new Phaser.Point(0.5, 0.5);
                shape.sprite.data = shape;
            }
            var spr = shape.sprite;
            if (spr !== null) {
                var pos = shape.pos;
                if (!shape.swapping && shape.dir.x !== 0) { // diagonal fall looks faster
                    pos = Math.max(shape.pos * 2 - 10, 0);
                }
                var frameName = Shape.typeNames[shape.type - 1];
                if (shape.special == 1) frameName += "HStripe";
                if (shape.special == 2) frameName += "VStripe";
                if (shape.special == 3) frameName += "Wrapped";
                if (shape.special === 5) frameName = "taser";
                if (spr.frameName !== frameName)
                    spr.frameName = frameName;
                spr.x = startX + (x - shape.dir.x * pos/10 + 0.5) * gridSize;
                spr.y = startY + (y - shape.dir.y * pos/10 + 0.5) * gridSize;
                spr.scale.x = scale * spr.alpha;
                spr.scale.y = scale * spr.alpha;
            }
            var tile = board.tiles[y * board.width + x];
            if (!tile.sprite) {
                tile.sprite = this.boardGroup.create(0, 0, 'shapes', 'board');
            }
            tile = tile.sprite;
            tile.x = startX + x * gridSize;
            tile.y = startY + y * gridSize;
            tile.scale.x = scale;
            tile.scale.y = scale;
            tile.visible = shape.type >= 0;
        }
    }
    board.x = startX;
    board.y = startY;
    board.gridSize = size / boardSize;
    var delSh = this.board.deletedShapes;
    for (var i = 0; i < delSh.length; i++) {
        var sh = delSh[i];
        // some shapes have no sprites attached
        if (sh.sprite) {
            sh.sprite.alpha -= 0.1;
        }
        if (sh.tickClear == 1) {
            if (sh.sprite) {
                sh.sprite.kill();
            }
        }
    }
    this.shapeGroup.forEachAlive(function (spr) {
        var sh = spr.data;
        if (this.board.getShape(sh.x, sh.y) !== sh) {
            sh.sprite = null;
            spr.kill();
        }
    });
    var scores = this.board.gainScores, aliveScoreTexts = [];
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var st = new ScoreText(s.score, s.type, s.x, s.y, this.digitGroup);
        st.popup(board.x, board.y, board.gridSize);
        aliveScoreTexts.push(st);
    }
    for (var i = 0; i < this.scorePopups.length; i++) {
        var st = this.scorePopups[i];
        st.popup(board.x, board.y, board.gridSize);
        if (st.lifetime <= 0) {
            st.kill();
        }
        else {
            aliveScoreTexts.push(st);
        }
    }
    this.scorePopups = aliveScoreTexts;
    var sc = 0;
    for (var i = 0; i < this.board.runningItems.length; i++) {
        var it = this.board.runningItems[i];
        var pos = it.getSpritePositions();
        for (var j = 0; j < pos.length; j++) {
            var sp = this.effectSprites[sc++];
            var frameName = pos[j][4];
            if (!sp) {
                sp = this.effectGroup.getFirstDead(true, 100, 100, 'shapes', frameName);
                sp.alpha = 1;
                sp.anchor = new Phaser.Point(0.5, 0.5);
                this.effectSprites.push(sp);
            }
            if (sp.frameName !== frameName)
                sp.frameName = frameName;
            sp.x = startX + (pos[j][0] + 0.5) * gridSize;
            sp.y = startY + (pos[j][1] + 0.5) * gridSize;
            sp.scale.x = pos[j][2] * scale;
            sp.scale.y = pos[j][3] * scale;
        }
    }
    while (sc < this.effectSprites.length) {
        this.effectSprites.pop().kill();
    }
};

GameScreen.prototype.render = function (game) {
    if (!this.board.debug.showMatching) return;
    var colors = [0x7f0000, 0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0xff7fff, 0xc0c0c0, 0xffffff, 0x000000];
    var matches = this.board.matchFinder.matches;
    var x, y, width, height, line;
    var j = 0;
    var spr;
    function getSprite () {
        if (j < this.showMatches.length) {
            spr = this.showMatches[j];
        }
        else {
            spr = this.add.sprite(0, 0, 'whiteSquare');
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
    if (this.board.debug.debugged) return ;
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

GameScreen.prototype.playSounds = function () {
    var sndfx = this.soundEffects;
    this.board.sounds.forEach(function (snd) {
        var s = sndfx[snd.name];
        s.play();
        var pitch = snd.pitch || 1; 
        if (s._sound && s._sound.playbackRate && s._sound.playbackRate.value) {
            s._sound.playbackRate.value = pitch;
        }
    });
};
