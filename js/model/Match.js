function Match(type, x, y, sh) {
    this.type = type || Match.HORIZONTAL;

    // vertical match
    this.vlength = 0;
    this.vx = 0;
    this.vy = 0;

    // horizontal match
    this.hlength = 0;
    this.hx = 0;
    this.hy = 0;

    if (this.type === Match.HORIZONTAL) {
        this.hx = x;
        this.hy = y;
    }
    else if (this.type === Match.VERTICAL) {
        this.vx = x;
        this.vy = y;
    }

    this.shapeType = sh;
}

Match.HORIZONTAL = 1;
Match.VERTICAL = 2;
Match.CROSS = 3;

function MatchFinder() {
    this.matches = [];
    this.vertical = [];
    this.getRankOfMatch = MatchFinder.getRankOfMatch;
    this.matchComparator = MatchFinder.matchComparator.bind(this);
}

MatchFinder.getRankOfMatch = function (m) {
    if (m.hlength >= 5 || m.vlength >= 5) return 100;
    if (m.type === Match.CROSS) return m.hlength + m.vlength + 10;
    if (m.hlength == 4 || m.vlength == 4) return 4;
    return 3;
};

MatchFinder.matchComparator = function (a, b) {
    var an = this.getRankOfMatch(a);
    var bn = this.getRankOfMatch(b);
    
    if (an !== bn) return bn - an;
    var ax = a.type & Match.HORIZONTAL ? a.hx : a.vx;
    var ay = a.type & Match.HORIZONTAL ? a.hy : a.vy;
    var bx = b.type & Match.HORIZONTAL ? b.hx : b.vx;
    var by = b.type & Match.HORIZONTAL ? b.hy : b.vy;
    if (ay !== by) return ay - by;
    return ax - bx;
};

MatchFinder.prototype.findAndClearMatch = function (board, disableMatching) {
    this.matches.length = 0;
    for (var i = 0; i < board.shapes.length; i++) {
        this.vertical[i] = null;
    }
    this.findVeritcalMatch(board);
    this.findHorizontalMatch(board);
    if (!disableMatching) this.clearMatch(board);
};

MatchFinder.prototype.findVeritcalMatch = function (board) {
    var w = board.width, h = board.height;
    var i;
    var shapes = board.shapes;
    for (var x = 0; x < w; x++) {
        i = x;
        for (var y = 0; y < h - 2; y++) {
            if (shapes[i].canMatch()) {
                var sh = shapes[i].type;
                if (shapes[i + w].canMatch() && shapes[i + w].type === sh
                 && shapes[i + 2*w].canMatch() && shapes[i + 2*w].type === sh) {
                    var match = new Match(Match.VERTICAL, x, y, sh);
                    do {
                        this.vertical[i] = match;
                        match.vlength++;
                        y++;
                        i += w;
                    } while (y < h && shapes[i].canMatch() && shapes[i].type === sh) ;
                    y--; i -= w;
                    this.matches.push(match);
                }
            }
            i += w;
        }
    }
};

MatchFinder.prototype.findHorizontalMatch = function (board) {
    var w = board.width;
    var h = board.height;
    var shapes = board.shapes;
    var i;
    for (var y = 0; y < h; y++) {
        i = y * w;
        for (var x = 0; x < w - 2; x++) {
            if (shapes[i].canMatch()) {
                var sh = shapes[i].type;
                if (shapes[i + 1].canMatch() && shapes[i + 1].type === sh
                 && shapes[i + 2].canMatch() && shapes[i + 2].type === sh) {
                    var match = new Match(Match.HORIZONTAL, x, y, sh);
                    var cross = null;
                    do {
                        match.hlength++;
                        if (cross === null && this.vertical[i] !== null) {
                            if(this.vertical[i].type === Match.VERTICAL) {
                                cross = this.vertical[i];
                            }
                        }
                        x++;
                        i += 1;
                    } while (x < w && shapes[i].canMatch() && shapes[i].type === sh) ;
                    x--; i -= 1;
                    if (cross !== null) { // l/T shaped match
                        cross.type = Match.CROSS;
                        cross.hx = match.hx;
                        cross.hy = match.hy;
                        cross.hlength = match.hlength;
                        match = cross;
                    }
                    else {
                        this.matches.push(match);
                    }
                }
            }
            i += 1;
        }
    }
};

MatchFinder.prototype.putSpecial = function (board, match, special) {
    var place = [];
    if (match.type & Match.HORIZONTAL) {
        for (var j = 0; j < match.hlength; j++) {
            if (board.getShape(match.hx + j, match.hy).special === 0) {
                place.push([match.hx + j, match.hy]);
            }
        }
    }
    if (match.type & Match.VERTICAL) {
        for (var j = 0; j < match.vlength; j++) {
            if (board.getShape(match.vx, match.vy + j).special === 0) {
                place.push([match.vx, match.vy + j]);
            }
        }
    }
    if (place.length > 0) {
        var r = place[board.game.rnd.between(0, place.length-1)];
        special.x = r[0];
        special.y = r[1];
        board.setShape(special.x, special.y, special);
    }
};

MatchFinder.prototype.clearMatch = function (board) {
    this.matches.sort(this.matchComparator);
    for (var i = 0; i < this.matches.length; i++) {
        var m = this.matches[i];
        var mx = m.vx, my = m.hy, type = m.shapeType;
        if (m.type & Match.HORIZONTAL) {
            for (var j = 0; j < m.hlength; j++) {
                board.clearShape(m.hx + j, m.hy);
            }
            mx = m.hx + (m.hlength - 1) / 2;
        }
        if (m.type & Match.VERTICAL) {
            for (var j = 0; j < m.vlength; j++) {
                board.clearShape(m.vx, m.vy + j);
            }
            my = m.vy + (m.vlength - 1) / 2;
        }
        if (m.hlength == 4 && m.type === Match.HORIZONTAL) {
            var r = board.game.rnd.between(1,2), sh;
            sh = new StripedShape(type, m.hy+1, m.hy, r, board);
            this.putSpecial(board, m, sh);
        }
        if (m.vlength == 4 && m.type === Match.VERTICAL) {
            var r = board.game.rnd.between(1,2);
            sh = new StripedShape(type, m.vx, m.vy+1, r, board);
            this.putSpecial(board, m, sh);
        }
        if (m.type === Match.CROSS && m.hlength < 5 && m.vlength < 5) {
            sh = new WrappedShape(type, m.vx, m.hy, board);
            this.putSpecial(board, m, sh);
        }
        if (m.hlength >= 5) {
            sh = new TaserShape(m.hx+2, m.hy, board);
            this.putSpecial(board, m, sh);
        }
        if (m.vlength >= 5 && m.hlength < 5) {
            sh = new TaserShape(m.vx, m.vy+2, board);
            this.putSpecial(board, m, sh);
        }
        board.combo++;
        var len = m.hlength + m.vlength - (m.type == Match.HORIZONTAL + Match.VERTICAL ? 1 : 0);
        var score = len >= 5 ? len * 40 : (len == 4 ? 120 : 60);
        score *= board.combo;
        board.gainScores.push({x: mx, y: my, type: m.shapeType, score: score});
        board.score += score;
    }
    if (this.matches.length > 0) {
        var s = game.add.sound('match');
        var cn = [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24][Math.min(board.combo - 1, 14)];
        s.play();
        if (s._sound && s._sound.playbackRate && s._sound.playbackRate.value) {
          s._sound.playbackRate.value = Math.pow(2, cn / 12);
        }
    }
};
