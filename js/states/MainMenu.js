function MainMenu() {
    this.background = null;
    this.music = null;
    this.title = null;
}

MainMenu.prototype.create = function () {
    this.background = this.add.image(0, 0, 'background');
    this.music = this.add.sound('music');
    this.music.loop = true;
    this.music.play();
    this.title = this.add.text(-1000, -1000, 'Shape Clear');
    this.title.inputEnabled = true;
    this.title.events.onInputUp.add(function () {
        this.game.state.start("GameScreen");
    }, this);
};

MainMenu.prototype.update = function () {
    var gw = this.game.width, gh = this.game.height;
    this.background.width = gw;
    this.background.height = gh;
    this.title.fontSize = Math.min(gw, gh) / 10;
    var tw = this.title.width, th = this.title.height;
    if (gw > gh) {
        this.title.position.set((gw - tw) / 2, gh * 0.1 + th / 2);
    }
    else {
        this.title.position.set((gw - tw) / 2, gh * 0.5 - gw * 0.4 + th / 2);
    }
};

MainMenu.prototype.shutdown = function () {
    this.music.destroy();
    this.music = null;
};
