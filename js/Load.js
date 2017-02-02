function Load () {
    this.loadBar = null;
}

Load.prototype.preload = function () {
    this.loadBar = this.add.text(this.game.width / 2, this.game.height / 2, 'Loading...');
    this.testRenderer();

    // some game settings
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.time.advancedTiming = true;
    game.stage.backgroundColor = '#0080ff';

    // load assets
    game.load.image('ball', 'assets/ball.png');
    game.load.image('triangle', 'assets/shapes/triangle.svg');
    game.load.image('square', 'assets/shapes/square.svg');
    game.load.image('circle', 'assets/shapes/circle.svg');
    game.load.image('hexagon', 'assets/shapes/hexagon.svg');
    game.load.image('board', 'assets/shapes/board.svg');
    game.load.image('background', 'assets/background.png');
    this.loadCounter = 0;
};

Load.prototype.update = function () {
    if(++this.loadCounter >= 10)
        this.state.start('GameScreen');
}

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
        localStorage.setItem('ShapeClear.renderer', renderer);
    }
    catch (e) {
        ;
    }
};
