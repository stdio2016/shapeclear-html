function MainMenu() {
    this.background = null;
    this.music = null;
    /* Main Menu looks like this:
    |     Shape Clear   |
    |       [Play!]     |
    |       [Help ]     |
    |[*]            v0.5|
    */
    this.title = null;
    this.btnPlay = null;
    this.lblPlay = null;
    this.btnHelp = null;
    this.lblHelp = null;
    this.lblVersion = null;
}

MainMenu.prototype.create = function () {
    this.background = this.add.image(0, 0, 'background');
    this.music = this.add.sound('music');
    this.music.loop = true;
    this.music.play();
    this.title = this.add.text(-1000, -1000, 'Shape Clear');
    this.title.anchor.set(0.5, 0.5);
    this.title.inputEnabled = true;
    this.title.events.onInputUp.add(function () {
        alertBox(
          "Copyright (c) 2016~2017 Yi-Feng Chen(陳羿豐)\n" +
          "Licensed under MIT license\n" +
          "~~~ Credits ~~~\n" +
          "Shape Clear uses Phaser game framework"
        );
        Debug.createSpecial ^= 1;
    }, this);
    this.btnPlay = this.add.button(-1000, -1000, 'ui', this.playGame, this, 'buttonHover', 'button', 'buttonPressed', 'button');
    this.btnPlay.anchor.set(0.5, 0.5);
    this.btnPlay.tint = 0xffff00;
    this.lblPlay = this.add.text(-1000, -1000, 'Play!');
    this.lblPlay.anchor.set(0.5, 0.5);
    this.btnHelp = this.add.button(-1000, -1000, 'ui', this.playGame, this, 'buttonHover', 'button', 'buttonPressed', 'button');
    this.btnHelp.anchor.set(0.5, 0.5);
    this.btnHelp.tint = 0xffff00;
    this.lblHelp = this.add.text(-1000, -1000, 'Board with holes');
    this.lblHelp.anchor.set(0.5, 0.5);
    this.lblVersion = this.add.text(-1000, -1000, 'v0.5.1');
    this.lblVersion.anchor.set(1, 1);
};

MainMenu.prototype.update = function () {
    var gw = this.game.width, gh = this.game.height, dim = Math.min(gw, gh);
    this.background.width = gw;
    this.background.height = gh;
    this.title.fontSize = dim / 10;
    this.lblPlay.fontSize = dim / 18;
    this.lblHelp.fontSize = dim / 25;
    this.lblVersion.fontSize = dim / 25;
    if (gw > gh) {
        this.title.position.set(gw / 2, gh * 0.2);
        this.btnPlay.position.set(gw / 2, gh * 0.5);
        this.btnHelp.position.set(gw / 2, gh * 0.7);
    }
    else {
        this.title.position.set(gw / 2, gh * 0.5 - gw * 0.3);
        this.btnPlay.position.set(gw / 2, gh * 0.5);
        this.btnHelp.position.set(gw / 2, gh * 0.5 + gw * 0.2);
    }
    this.lblPlay.position.copyFrom(this.btnPlay.position);
    this.lblPlay.y += window.devicePixelRatio || 1;
    this.btnPlay.scale.setTo(dim / 360);
    this.lblHelp.position.copyFrom(this.btnHelp.position);
    this.lblHelp.y += window.devicePixelRatio || 1;
    this.btnHelp.scale.setTo(dim / 360);
    this.lblVersion.position.set(gw, gh);
};

MainMenu.prototype.playGame = function (btn) {
    if (/Pressed/.test(btn.frameName)) {
        if (btn === this.btnPlay) {
            Debug.testDiagonalFall = false;
            this.state.start("GameScreen");
        }
        else if (btn === this.btnHelp) {
          this.state.start("GameScreen");
            Debug.testDiagonalFall = true;
            this.state.start("GameScreen");
        }
    }
};

MainMenu.prototype.shutdown = function () {
    this.music.destroy();
    this.music = null;
};
