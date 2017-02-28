function Load () {
    this.loadBar = null;
    this.playButton = null;
    this.background = null;
    // HACK
    this.loadTicks = 0;
}

Load.prototype.preload = function () {
    this.loadBar = this.add.text(this.game.width / 2, this.game.height / 2, 'Loading assets...');
    this.loadBar.x -= this.loadBar.width / 2;
    this.loadBar.y -= this.loadBar.height / 2;
    this.testRenderer();

    // some game settings
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.onResize = function () {
        var rect = document.body.getClientRects()[0];
        game.scale.setGameSize(Math.floor(rect.width), Math.floor(rect.height));
    };
    game.time.advancedTiming = true;
    game.stage.backgroundColor = '#0080ff';

    // load assets
    game.load.image('ball', 'assets/ball.png');
    game.load.atlasJSONArray('shapes', 'img/shapes_small.png', 'img/shapes_small.json');
    game.load.image('background', 'assets/background.png');
    game.load.audio('music', ['assets/music.ogg', 'assets/music.m4a', 'assets/music.wav']);
};

Load.prototype.preloadUpdate = function () {
    this.loadBar.x = this.game.width / 2 - this.loadBar.width / 2;
    this.loadBar.y = this.game.height / 2 - this.loadBar.height / 2;
};

Load.prototype.create = function() {
    this.background = this.add.sprite(0, 0, 'background');
    this.background.width = this.game.width;
    this.background.height = this.game.height;
    this.background.moveDown();
    this.loadBar.text = 'Start!';
    this.playButton = this.add.button(this.game.width / 2 - 100, this.game.height / 2 - 35,
      'ball', this.playGame, this);
    this.loadBar.moveUp();
    this.playButton.width = 200;
    this.playButton.height = 70;
};

Load.prototype.update = function () {
    var w = this.game.width;
    var h = this.game.height;
    this.loadBar.x = w / 2 - this.loadBar.width / 2;
    this.loadBar.y = h / 2 - this.loadBar.height / 2;
    this.playButton.x = w / 2 - this.playButton.width / 2;
    this.playButton.y = h / 2 - this.playButton.height / 2;
    this.background.width = w;
    this.background.height = h;

    // HACK workaround for Firefox running under file://
    this.loadTicks++;
    if (this.loadTicks == 10 && location.protocol === 'file:') {
        this.game.cache.destroy();
        this.state.start('Load');
    }
};

Load.prototype.playGame = function () {
    this.state.start('GameScreen');
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
    try {
        localStorage.setItem('ShapeClear_renderer', renderer);
    }
    catch (e) {
        ;
    }
};
