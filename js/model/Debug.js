// 和Scratch版的D臭蟲的功能是一樣的
function Debug(board) {
    this.allowIllegalMove = false;
    this.disableMatching = false;
    this.showMatching = false;
    this.board = board;
    this.autoSwipe = false;
    this.autoSwipeLoop = 0;
}

Debug.prototype.runCommand = function (cmd) {
    if (!cmd) return;
    switch (cmd) {
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
        this.autoSwipe = !this.autoSwipe; return;
      case 'mute':
        game.sound.mute = !game.sound.mute; return;
    }
    if (/^get /.test(cmd)) {
        return this.runGetCommand(cmd.substr(4));
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

Debug.prototype.autoSwipeTest = function () {
    if (!this.autoSwipe) return ;
    this.autoSwipeLoop++;
    if (this.autoSwipeLoop < 30) return ;
    this.autoSwipeLoop = 0;
    var swipes = [];
    var board = this.board;
    Board.forEachPossibleMatch(0, 0, 9, 9, function (x1, y1, x2, y2, x3, y3, x4, y4) {
        var s1 = board.getShape(x1, y1);
        var s2 = board.getShape(x2, y2);
        var s3 = board.getShape(x3, y3);
        var s4 = board.getShape(x4, y4);
        if (s3.canSwap() && s4.canSwap()) {
            if (s1.canMatch() && s2.canMatch() && s3.canMatch()) {
                if (s1.type == s2.type && s1.type == s3.type) {
                    swipes.push([{x: x3, y: y3}, {x: x4, y: y4}]);
                }
            }
        }
    });
    if (swipes.length > 0) {
        var r = Math.floor(Math.random() * swipes.length);
        this.board.addSwap(swipes[r][0], swipes[r][1]);
    }
};

Debug.prototype.getDebugMessage = function () {
    return +this.board.game.time.fps;
};
