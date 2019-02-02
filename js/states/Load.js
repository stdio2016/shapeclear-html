function Load () {
    this.loadBar = null;
    this.playButton = null;
    this.background = null;
}

Load.shouldLoadAudio = function () {
    try {
        return localStorage.getItem("ShapeClear_disableAudio") !== "true";
    } catch (e) {
        return true;
    }
};

Load.prototype.preload = function () {
    var r = this.game.resolution;
    game.canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };
    if (/Android 2\./.test(navigator.userAgent)) {
        this.game.device.m4a = false;
    }
    this.loadBar = this.add.text(this.game.width / 2, this.game.height / 2, 'Loading assets...');
    this.loadBar.x -= this.loadBar.width / (2 * r);
    this.loadBar.y -= this.loadBar.height / (2 * r);
    this.testRenderer();

    // some game settings
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.onResize = function () {
        var rect = getWindowSize();
        game.scale.setGameSize(rect[0], rect[1]);
    };
    game.time.advancedTiming = true;
    game.stage.backgroundColor = '#0080ff';

    // load assets
    game.load.image('ball', 'assets/ball.png');
    if (Math.min(screen.width, screen.height) > 750) {
        this.gridPx = 72;
        game.load.atlasJSONArray('shapes', 'img/shapes_big.png', 'img/shapes_big.json');
        game.load.atlasJSONArray('number', 'img/number_big.png', 'img/number_big.json');
        game.load.atlasJSONArray('ui', 'img/ui_big.png', 'img/ui_big.json');
    }
    else {
        this.gridPx = 36;
        game.load.atlasJSONArray('shapes', 'img/shapes_small.png', 'img/shapes_small.json');
        game.load.atlasJSONArray('number', 'img/number_small.png', 'img/number_small.json');
        game.load.atlasJSONArray('ui', 'img/ui_small.png', 'img/ui_small.json');
    }
    game.load.image('background', 'assets/background.png');
    game.load.image('castle', 'assets/background-castle.png');
    if (Load.shouldLoadAudio()) {
        game.load.audio('music', ['assets/sound/music.ogg', 'assets/sound/music.mp3']);
        game.load.audio('music2', ['assets/sound/music2.ogg', 'assets/sound/music2.m4a', 'assets/sound/music2.mp3']);
        game.load.audio('match', ['assets/sound/match.wav', 'assets/sound/match.mp3']);
        game.load.audio('nomatch', ['assets/sound/nomatch.wav', 'assets/sound/nomatch.mp3']);
    }
    Translation = {};
    game.load.json('text', 'lang/en.json');
    var lang = navigator.languages;
    var supportedLanguage = {
      "en": 1, "zh-TW": 1
    };
    for (var i = 0; i < lang.length; i++) {
      if (lang[i] in supportedLanguage) break;
    }
    game.load.json('translation', 'lang/' + lang[i] + '.json');

    // create texture for showing match-3
    this.game.create.texture('whiteSquare', ['2']);

    // debugger
    this.input.onTap.add(function (pointer, dblClick) {
        if (dblClick) {
            promptBox(Translation['Input debug command:'], '', function (cmd) {
                try {
                    if (cmd) alertBox(window.eval(cmd) + "");
                } catch (e) {
                    alertBox(e.message + "");
                }
            });
        }
    });
};

Load.prototype.loadUpdate = function () {
    var r = this.game.resolution;
    // HACK to get the text size
    this.loadBar.x = this.game.width / 2 - this.loadBar.width / (2 * r);
    this.loadBar.y = this.game.height / 2 - this.loadBar.height / (2 * r);
};

Load.prototype.create = function() {
    Translation = this.game.cache.getJSON('text') || {};
    Object.assign(Translation, this.game.cache.getJSON('translation'));
    this.game.clearBeforeRender = false;
    this.background = this.add.sprite(0, 0, 'background');
    this.background.width = this.game.width;
    this.background.height = this.game.height;
    this.background.moveDown();
    this.loadBar.text = Translation['Start!'] || "Start!";
    this.playButton = this.add.button(this.game.width / 2 - 100, this.game.height / 2 - 35,
      'ball', this.playGame, this);
    this.loadBar.moveUp();
    this.playButton.width = 200;
    this.playButton.height = 70;
};

Load.prototype.update = function () {
    var w = this.game.width;
    var h = this.game.height;
    var r = this.game.resolution;
    // HACK to get the text size
    this.loadBar.x = w / 2 - this.loadBar.width / (2 * r);
    this.loadBar.y = h / 2 - this.loadBar.height / (2 * r);
    this.playButton.x = w / 2 - 200 / 2;
    this.playButton.y = h / 2 - 70 / 2;
    this.background.width = w;
    this.background.height = h;
};

Load.prototype.playGame = function () {
    if (this.game.sound.usingWebAudio) {
        var ctx = this.game.sound.context;
        if (ctx.state === "suspended") {
            ctx.resume();
        }
    }
    this.state.start('MainMenu');
};

Load.prototype.testRenderer = function () {
    // Test the renderer
    var renderer = 'unknown';
    switch (this.game.renderType) {
      case Phaser.CANVAS:
        renderer = 'CANVAS';
        break;
      case Phaser.WEBGL:
        renderer = 'WEBGL';
        break;
      case Phaser.HEADLESS:
        renderer = 'HEADLESS';
        break;
    }
    // don't store into localStorage!
    try {
        // localStorage.setItem('ShapeClear_renderer', renderer);
    }
    catch (e) {
        ;
    }
};
