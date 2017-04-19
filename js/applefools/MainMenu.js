if (!window.AppleFools) {
    AppleFools = {};
}

AppleFools.MainMenu = function () {
    this.selectAMode = null;
};

AppleFools.MainMenu.prototype.preload = function () {
    this.camera.bounds = null;
};

AppleFools.MainMenu.prototype.create = function () {
    this.selectAMode = this.add.text(145, 10, 'Select a mode');
    this.classicMode = this.add.button(40, 90, 'ball', this.gotoClassicMode, this);
    this.classicMode.width = 160 * this.game.resolution;
    this.classicMode.height = 160 * this.game.resolution;
    var tex = this.add.text(70, 135, 'Classic\nMode');
    this.afMode = this.add.button(280, 90, 'shapes', this.gotoAfMode, this, 'pen', 'apple', 'pineapple', 'pen');
    this.afMode.width = 160 * this.game.resolution;
    this.afMode.height = 160 * this.game.resolution;
    var tex = this.add.text(325, 170, 'Apple\nFools');
    this.music = this.add.sound('music');
    this.music.loop = true;
    this.music.play();
};

AppleFools.MainMenu.prototype.update = function () {
    var w = this.game.width, h = this.game.height;
    if (w > h * 4/3) {
        this.camera.scale.x = h/360;
        this.camera.scale.y = h/360;
        this.camera.setPosition(-(w - h * 4/3) /2, 0);
    }
    else {
        this.camera.scale.x = w/480;
        this.camera.scale.y = w/480;
        this.camera.setPosition(0, -(h - w * 3/4) / 2);
    }
};

AppleFools.MainMenu.prototype.shutdown = function () {
    this.camera.reset();
    this.camera.scale.x = this.camera.scale.y = 1;
    this.music.destroy();
    this.music = null;
};

AppleFools.MainMenu.prototype.gotoClassicMode = function () {
    AppleFools.chooseMode('classic');
    this.state.start("GameScreen");
};

AppleFools.MainMenu.prototype.gotoAfMode = function () {
    var me = this;
    AppleFools.getLife(function (result) {
        if (result) {
            AppleFools.chooseMode('AppleFools');
            me.state.start("GameScreen");
        }
        else {
            alertBox('Sorry... Server is busy. Please try again. (You can still play Classic Mode)');
        }
    });
};
