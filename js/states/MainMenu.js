function MainMenu() {
    this.background = null;
    this.castle = null;
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
    this.btnEasy = null;
    this.lblEasy = null;
    this.lblVersion = null;
    this.ball1 = this.ball2 = null; // Ball to test animation
}

MainMenu.prototype.create = function () {
    this.game.version = 'v0.7.1';
    this.background = this.add.image(0, 0, 'background');
    this.castle = this.add.image(this.game.width/2, this.game.height * 0.705, 'castle');
    this.castle.anchor.set(0.5, 0.72);
    this.music = this.add.sound('music');
    this.music.loop = true;
    this.music.play();
    this.ball1 = new Ball(this.game, /*speed: */5);
    this.add.existing(this.ball1);
    this.ball2 = new Ball(this.game, /*speed: */5, [this.ball1]);
    this.add.existing(this.ball2);
    this.ball3 = new Ball(this.game, /*speed: */5, [this.ball1, this.ball2]);
    this.add.existing(this.ball3);
    game.input.addMoveCallback(this.move, this);
    this.title = this.add.text(-1000, -1000, Translation['Shape Clear']);
    this.title.anchor.set(0.5, 0.5);
    this.title.inputEnabled = true;
    this.title.events.onInputUp.add(function () {
        var xp = localStorage.ShapeClear_xp || 0;
        var times = localStorage.ShapeClear_played || 0;
        var lv = 1;
        var req;
        while (lv < 50 && xp > (req = Math.floor(prank(lv+1, 40)) * 10)) {
            lv++;
        }
        alertBox(
          Translation.Copyright + "\n" +
          Translation.Licensed + "\n" +
          Translation.UsePhaser + "\n" +
          "Lv. " + lv + " xp: " + xp + "/" + req + "\n" +
          Translation["You played "] + times + Translation["? times"]
        );
        Debug.createSpecial ^= 1;
    }, this);
    this.btnPlay = this.add.button(-1000, -1000, 'ui', this.playGame, this, 'buttonHover', 'button', 'buttonPressed', 'button');
    this.btnPlay.anchor.set(0.5, 0.5);
    this.btnPlay.tint = 0xffff00;
    this.lblPlay = this.add.text(-1000, -1000, Translation['Play!']);
    this.lblPlay.anchor.set(0.5, 0.5);
    this.btnHelp = this.add.button(-1000, -1000, 'ui', this.playGame, this, 'buttonHover', 'button', 'buttonPressed', 'button');
    this.btnHelp.anchor.set(0.5, 0.5);
    this.btnHelp.tint = 0xffff00;
    this.lblHelp = this.add.text(-1000, -1000, Translation['Board with holes']);
    this.lblHelp.anchor.set(0.5, 0.5);
    this.btnEasy = this.add.button(-1000, -1000, 'ui', this.playGame, this, 'buttonHover', 'button', 'buttonPressed', 'button');
    this.btnEasy.anchor.set(0.5, 0.5);
    this.btnEasy.tint = 0xffff00;
    this.lblEasy = this.add.text(-1000, -1000, Translation['Easy mode']);
    this.lblEasy.anchor.set(0.5, 0.5);

    this.btnMoves = this.add.button(-1000, -1000, 'ui', this.playGame, this, 'buttonHover', 'button', 'buttonPressed', 'button');
    this.btnMoves.anchor.set(0.5, 0.5);
    this.btnMoves.tint = 0xffff00;
    this.lblMoves = this.add.text(-1000, -1000, Translation['Moves mode']);
    this.lblMoves.anchor.set(0.5, 0.5);

    this.lblVersion = this.add.text(-1000, -1000, this.game.version);
    this.lblVersion.anchor.set(1, 1);
    this.game.bounceTime = 0;
    if (AppleFools.AutoGame) {
        setTimeout(function () {
            mainMenu.btnPlay.frameName = 'buttonPressed';
            mainMenu.playGame(mainMenu.btnPlay);
        }, 1000);
    }
};

MainMenu.prototype.paused = function () {
    console.log("paused");
    this.music.pause();
};

MainMenu.prototype.resumed = function () {
    console.log("resumed");
    this.music.resume();
}

MainMenu.moveButton = function (btn, lbl, dim) {
    lbl.position.copyFrom(btn.position);
    lbl.y += window.devicePixelRatio || 1;
    btn.scale.setTo(dim / btn.texture.frame.width * (125/360));
};

MainMenu.prototype.update = function () {
    var gw = this.game.width, gh = this.game.height, dim = Math.min(gw, gh);
    this.background.width = gw;
    this.background.height = gh;
    var castleScale = Math.min(gh * 0.9, gw) / 800;
    this.castle.scale.set(castleScale, castleScale);
    this.castle.position.set(gw / 2, gh * 0.705);
    this.title.fontSize = dim / 10;
    this.lblPlay.fontSize = dim / 18;
    this.lblHelp.fontSize = dim / 25;
    this.lblEasy.fontSize = dim / 25;
    this.lblVersion.fontSize = dim / 25;
    this.lblMoves.fontSize = dim / 25;
    if (gw > gh * 0.9) {
        this.title.position.set(gw / 2, gh * 0.2);
        this.btnPlay.position.set(gw / 2 - gh * 0.23, gh * 0.6);
        this.btnMoves.position.set(gw / 2 + gh * 0.23, gh * 0.6);
        this.btnHelp.position.set(gw / 2 - gh * 0.23, gh * 0.8);
        this.btnEasy.position.set(gw / 2 + gh * 0.23, gh * 0.8);
    }
    else {
        this.title.position.set(gw / 2, gh * 0.5 - gw * 0.3);
        this.btnPlay.position.set(gw / 2, gh * 0.5);
        this.btnMoves.position.set(gw / 2, gh * 0.5 + gw * 0.15);
        this.btnHelp.position.set(gw / 2, gh * 0.5 + gw * 0.3);
        this.btnEasy.position.set(gw / 2, gh * 0.5 + gw * 0.45);
    }
    MainMenu.moveButton(this.btnPlay, this.lblPlay, dim);
    MainMenu.moveButton(this.btnHelp, this.lblHelp, dim);
    MainMenu.moveButton(this.btnEasy, this.lblEasy, dim);
    MainMenu.moveButton(this.btnMoves, this.lblMoves, dim);
    this.lblVersion.position.set(gw, gh);
    this.lblVersion.text = this.game.version + '.' + this.game.bounceTime;
};

MainMenu.prototype.move = function(pointer, x, y){
    if (pointer.isDown) {
        this.ball1.pointTo(x, y);
        this.ball2.pointTo(x, y);
        this.ball3.pointTo(x, y);
    }
};

MainMenu.prototype.playGame = function (btn) {
    if (/Pressed/.test(btn.frameName)) {
        if (btn === this.btnPlay) {
            Debug.testDiagonalFall = false;
            AppleFools.DROP_COLOR_COUNT = AppleFools.COLOR_COUNT = 6;
            this.state.start("GameScreen");
        }
        else if (btn === this.btnHelp) {
            Debug.testDiagonalFall = true;
            AppleFools.DROP_COLOR_COUNT = 0; AppleFools.COLOR_COUNT = 6;
            this.state.start("GameScreen");
        }
        else if (btn === this.btnEasy) {
            Debug.testDiagonalFall = false;
            AppleFools.DROP_COLOR_COUNT = AppleFools.COLOR_COUNT = 4;
            this.state.start("GameScreen");
        }
        else if (btn === this.btnMoves) {
            Debug.testDiagonalFall = false;
            AppleFools.DROP_COLOR_COUNT = AppleFools.COLOR_COUNT = 6;
            this.state.start("GameScreen", true, false, {remainingMoves: 25, remainingTime: null});
        }
    }
};

MainMenu.prototype.shutdown = function () {
    this.music.destroy();
    this.music = null;
};
