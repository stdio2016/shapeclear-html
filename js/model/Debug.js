// 和Scratch版的D臭蟲的功能是一樣的
function Debug(board) {
    this.allowIllegalMove = false;
    this.disableMatching = false;
    this.showMatching = false;
    this.board = board;
    this.autoSwipe = false;
    this.autoSwipeLoop = 0;
    this.debugged = false;
    if (AppleFools.AutoGame) {
        this.autoSwipe = true;
        this.board.game.stage.disableVisibilityChange = true;
        this.debugged = true;
    }
}

Debug.testDiagonalFall = false;

Debug.prototype.runCommand = function (cmd) {
    if (!cmd) return;
    if (/;/.test(cmd)) {
        var r = cmd.split(';');
        for (var i = 0; i < r.length; i++) {
            this.runCommand(r[i]);
        }
        return ;
    }
    this.debugged = true;
    switch (cmd.toLowerCase()) {
      case 'allow illegal move':
        this.allowIllegalMove = true; return ;
      case 'disallow illegal move':
        this.allowIllegalMove = false; return ;
      case 'enable matching':
        this.disableMatching = false; return ;
      case 'disable matching':
        this.disableMatching = true; return ;
      case 'show matching':
        this.showMatching = true; return ;
      case 'hide matching':
        this.showMatching = false; return ;
      case 'help': case '?':
        alertBox("Can't help you"); return ;
      case 'auto swipe':
        this.autoSwipe = !this.autoSwipe;
        this.board.game.stage.disableVisibilityChange = this.autoSwipe;
        return;
      case 'mute':
        game.sound.mute = !game.sound.mute; return;
      case 'redraw':
        gameScreen.redraw(); return;
      case 'shuffle':
        this.board.state = Board.SHUFFLING; return;
    }
    if (/^get /.test(cmd)) {
        return this.runGetCommand(cmd.substr(4));
    }
    if (/^set /.test(cmd)) {
        return this.runSetCommand(cmd.substr(4));
    }
    if (cmd == 'april fools') {
        try {
            localStorage.ShapeClear_AppleFools17 = +new Date();
        }
        catch (x) {
            ;
        }
    }
    console.log('Unknown command: ' + cmd);
};

Debug.prototype.runGetCommand = function (cmd) {
    if (cmd == 'inner height') {
        alertBox(window.innerHeight);
    }
    else if (cmd == 'body client height') {
        var rect = document.body.getClientRects()[0];
        alertBox(rect.height);
    }
};

Debug.prototype.runSetCommand = function (cmd) {
    var name = cmd.split(' ');
    if (name[0] == 'time') {
        this.board.remainingTime = Math.max(Math.floor(name[1] * 60 || 0), 0);
    }
    if (name[0] == 'slow') {
        console.log(name[1]);
        gameScreen.speedup = Math.max(1 / name[1] || 1, 0);
    }
};

Debug.prototype.autoSwipeTest = function () {
    // no swap after time is up
    if (!this.autoSwipe || this.board.remainingTime <= 0 || this.board.changed) return ;
    this.autoSwipeLoop++;
    if (this.autoSwipeLoop < 30) return ;
    this.autoSwipeLoop = 0;
    var swipes = this.board.hintMoves();
    var board = this.board;
    if (swipes.length > 0) {
        var r = Math.floor(Math.random() * swipes.length);
        this.board.addSwap(swipes[r][0], swipes[r][1]);
    }
};

Debug.prototype.getDebugMessage = function () {
    if (AppleFools.DROP_COLOR_COUNT == 0)
        return "Level edit mode!";
    if (ChristmasIsComing()) {
        if ((new Date()).getMonth() == 11) return "Merry Xmas!";
        return "Happy New Year!";
    }
    return this.board.game.time.fps;
};
