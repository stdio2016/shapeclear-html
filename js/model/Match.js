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
    this.swapMatches = [];
    this.matches = [];
    this.vertical = [];
    this.shapes = [];
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

MatchFinder.prototype.clear = function () {
    this.swapMatches.length = 0;
    this.matches.length = 0;
};

MatchFinder.prototype.findAndClearMatch = function (board, disableMatching) {
    this.matches.length = 0;
    for (var i = 0; i < board.shapes.length; i++) {
        this.vertical[i] = null;
    }
    /*this.findVeritcalMatch(board);
    this.findHorizontalMatch(board);*/
    this.findMatch2(board);
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

MatchFinder.prototype.findMatch2 = function (board) {
    var shs = this.shapes;
    var w = board.width, h = board.height;
    if (shs.length == 0) {
        for (var x = 0; x < w; x++) {
            var r = [];
            for (var y = 0; y < h; y++) r.push(0);
            shs.push(r);
        }
    }
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            var oj = board.shapes[x + y * w];
            if (oj.canMatch()) shs[x][y] = oj.type;
            else shs[x][y] = 0;
        }
    }
    
    // find 5 match vertical
    for (var x = 0; x < w; x++) {
        var y = 0;
        while (y < h - 4) {
            var sh = shs[x][y];
            if (sh > 0 && shs[x][y+1] == sh && shs[x][y+2] == sh
                && shs[x][y+3] == sh && shs[x][y+4] == sh) {
                var m = new Match(Match.VERTICAL, x, y, sh);
                // strange cross rule
                var left = x-1;
                while (left >= 0 && shs[left][y] == sh) left -= 1;
                var right = x+1;
                while (right < w && shs[right][y] == sh) right += 1;
                if (right - left > 3) {
                    m.type = Match.CROSS;
                    m.hx = left + 1;
                    m.hy = y;
                    m.hlength = right - left - 1;
                    for (left = left+1; left < right; left++) {
                        shs[left][y] = 0;
                    }
                }
                // actual, normal vertical match
                do {
                    shs[x][y] = 0;
                    y += 1;
                    m.vlength += 1;
                } while (y < h && shs[x][y] == sh) ;
                this.matches.push(m);
            }
            else y += 1;
        }
    }
    
    // find 5 match horizontal
    for (var y = 0; y < h; y++) {
        var x = 0;
        while (x < w - 4) {
            var sh = shs[x][y];
            if (sh > 0 && shs[x+1][y] == sh && shs[x+2][y] == sh
                && shs[x+3][y] == sh && shs[x+4][y] == sh) {
                var m = new Match(Match.HORIZONTAL, x, y, sh);
                do {
                    shs[x][y] = 0;
                    x += 1;
                    m.hlength += 1;
                } while (x < w && shs[x][y] == sh) ;
                this.matches.push(m);
            }
            else x += 1;
        }
    }
    
    // find cross
    for (var x = 0; x < w; x++) {
        var y = 0;
        while (y < h - 2) {
            var sh = shs[x][y];
            if (sh > 0 && shs[x][y+1] == sh && shs[x][y+2] == sh) {
                var m = new Match(Match.VERTICAL, x, y, sh);
                do {
                    var left = x-1;
                    while (left >= 0 && shs[left][y] == sh) left -= 1;
                    var right = x+1;
                    while (right < w && shs[right][y] == sh) right += 1;
                    if (m.type == Match.VERTICAL && right - left > 3) {
                        m.type = Match.CROSS;
                        m.hx = left + 1;
                        m.hy = y;
                        m.hlength = right - left - 1;
                        for (left = left+1; left < right; left++) {
                            shs[left][y] = 0;
                        }
                    }
                    y += 1;
                    m.vlength += 1;
                } while (y < h && shs[x][y] == sh) ;
                if (m.type == Match.CROSS) {
                    this.matches.push(m);
                    for (var i = m.vy; i < y; i++) {
                        shs[x][i] = 0;
                    }
                }
            }
            else y += 1;
        }
    }
    
    // find 4 match vertical
    for (var x = 0; x < w; x++) {
        var y = 0;
        while (y < h - 3) {
            var sh = shs[x][y];
            if (sh > 0 && shs[x][y+1] == sh && shs[x][y+2] == sh
                && shs[x][y+3] == sh) {
                var m = new Match(Match.VERTICAL, x, y, sh);
                for (var i = 0; i < 4; i++) shs[x][y+i] = 0;
                m.vlength = 4;
                this.matches.push(m);
                y += 4;
            }
            else y += 1;
        }
    }
    
    // find 4 match horizontal
    for (var y = 0; y < h; y++) {
        var x = 0;
        while (x < w - 3) {
            var sh = shs[x][y];
            if (sh > 0 && shs[x+1][y] == sh && shs[x+2][y] == sh
                && shs[x+3][y] == sh) {
                var m = new Match(Match.HORIZONTAL, x, y, sh);
                for (var i = 0; i < 4; i++) shs[x+i][y] = 0;
                m.hlength = 4;
                this.matches.push(m);
                x += 4;
            }
            else x += 1;
        }
    }
    
    // find 3 match vertical
    for (var x = 0; x < w; x++) {
        var y = 0;
        while (y < h - 2) {
            var sh = shs[x][y];
            if (sh > 0 && shs[x][y+1] == sh && shs[x][y+2] == sh) {
                var m = new Match(Match.VERTICAL, x, y, sh);
                for (var i = 0; i < 3; i++) shs[x][y+i] = 0;
                m.vlength = 3;
                this.matches.push(m);
                y += 3;
            }
            else y += 1;
        }
    }
    
    // find 3 match horizontal
    for (var y = 0; y < h; y++) {
        var x = 0;
        while (x < w - 2) {
            var sh = shs[x][y];
            if (sh > 0 && shs[x+1][y] == sh && shs[x+2][y] == sh) {
                var m = new Match(Match.HORIZONTAL, x, y, sh);
                for (var i = 0; i < 3; i++) shs[x+i][y] = 0;
                m.hlength = 3;
                this.matches.push(m);
                x += 3;
            }
            else x += 1;
        }
    }
};

MatchFinder.prototype.putSpecial = function (board, match, special) {
    var place = [];
    if (match.type & Match.HORIZONTAL) {
        for (var j = 0; j < match.hlength; j++) {
            var sh = board.getShape(match.hx + j, match.hy);
            if (sh.type === match.shapeType && sh.special === 0) {
                place.push([match.hx + j, match.hy]);
            }
        }
    }
    if (match.type & Match.VERTICAL) {
        for (var j = 0; j < match.vlength; j++) {
            var sh = board.getShape(match.vx, match.vy + j);
            if (sh.type === match.shapeType && sh.special === 0) {
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
    // first remove matched shapes
    for (var i = 0; i < this.matches.length; i++) {
        var m = this.matches[i];
        if (m.type & Match.HORIZONTAL) {
            for (var j = 0; j < m.hlength; j++) {
                board.clearShape(m.hx + j, m.hy);
            }
        }
        if (m.type & Match.VERTICAL) {
            for (var j = 0; j < m.vlength; j++) {
                board.clearShape(m.vx, m.vy + j);
            }
        }
    }
    // then create special shapes
    for (var i = 0; i < this.matches.length; i++) {
        var m = this.matches[i];
        var mx = m.vx, my = m.hy, type = m.shapeType;
        if (m.type & Match.HORIZONTAL) {
            mx = m.hx + (m.hlength - 1) / 2;
        }
        if (m.type & Match.VERTICAL) {
            my = m.vy + (m.vlength - 1) / 2;
        }
        if (m.hlength == 4 && m.type === Match.HORIZONTAL) {
            var r = board.game.rnd.between(1,2), sh;
            sh = new StripedShape(type, r, m.hy+1, m.hy, board);
            this.putSpecial(board, m, sh);
        }
        if (m.vlength == 4 && m.type === Match.VERTICAL) {
            var r = board.game.rnd.between(1,2);
            sh = new StripedShape(type, r, m.vx, m.vy+1, board);
            this.putSpecial(board, m, sh);
        }
        if (m.type === Match.CROSS && m.hlength < 5 && m.vlength < 5) {
            sh = new WrappedShape(type, m.vx, m.hy, board);
            this.putSpecial(board, m, sh);
        }
        if (m.hlength >= 5) {
            sh = new ElcShape(m.hx+2, m.hy, board);
            this.putSpecial(board, m, sh);
        }
        if (m.vlength >= 5 && m.hlength < 5) {
            sh = new ElcShape(m.vx, m.vy+2, board);
            this.putSpecial(board, m, sh);
        }
        board.combo++;
        var len = m.hlength + m.vlength - (m.type == Match.HORIZONTAL + Match.VERTICAL ? 1 : 0);
        var score = len >= 5 ? len * 40 : (len == 4 ? 120 : 60);
        score *= board.combo;
        board.gainScores.push({x: mx, y: my, type: m.shapeType, score: score});
        board.score += score;
    }
};

MatchFinder.prototype.clearSwapMatch = function (board, x, y) {
    // check if swap is valid
    var cur = board.getShape(x, y), sh;
    if (!cur.canMatch()) return false;

    var type = cur.type;
    var leftMatch = 0, rightMatch = 0, upMatch = 0, downMatch = 0;
    while (x - leftMatch > 0) {
        sh = board.getShape(x - (leftMatch + 1), y);
        if (sh.canMatch() && sh.type === type) {
            leftMatch++;
        }
        else break;
    }
    while (x + rightMatch < board.width - 1) {
        sh = board.getShape(x + (rightMatch + 1), y);
        if (sh.canMatch() && sh.type === type) {
            rightMatch++;
        }
        else break;
    }
    while (y - upMatch > 0) {
        sh = board.getShape(x, y - (upMatch + 1));
        if (sh.canMatch() && sh.type === type) {
            upMatch++;
        }
        else break;
    }
    while (y + downMatch < board.height - 1) {
        sh = board.getShape(x, y + (downMatch + 1));
        if (sh.canMatch() && sh.type === type) {
            downMatch++;
        }
        else break;
    }
    
    // clear match
    var m = new Match(0, 0, 0, type);
    m.type = 0;
    var mx = x, my = y;
    if (upMatch + downMatch >= 2 && leftMatch + rightMatch < 4 || upMatch + downMatch >= 4) {
        m.type |= Match.VERTICAL;
        m.vx = x;
        m.vy = y - upMatch;
        m.vlength = upMatch + downMatch + 1;        
        for (var j = 0; j < m.vlength; j++) {
            board.clearShape(m.vx, m.vy + j);
        }
        my = m.vy + (m.vlength - 1) / 2;
    }
    if (leftMatch + rightMatch >= 2 && (upMatch + downMatch < 4 || upMatch == 0)) {
        m.type |= Match.HORIZONTAL;
        m.hx = x - leftMatch;
        m.hy = y;
        m.hlength = leftMatch + rightMatch + 1;
        for (var j = 0; j < m.hlength; j++) {
            if (m.type != Match.CROSS || m.hx + j != m.vx)
                board.clearShape(m.hx + j, m.hy);
        }
        mx = m.hx + (m.hlength - 1) / 2;
    }
    if (m.type === 0) return false;
    this.swapMatches.push(m);
    
    // make special shape
    var spec = null;
    if (m.hlength >= 5 || m.vlength >= 5) {
        spec = new ElcShape(x, y, board);
    }
    else if (m.type === Match.CROSS) {
        spec = new WrappedShape(type, x, y, board);
    }
    else if (m.type === Match.HORIZONTAL && m.hlength === 4) {
        spec = new StripedShape(type, StripedShape.VERTICAL, x, y, board);
    }
    else if (m.type === Match.VERTICAL && m.vlength === 4) {
        spec = new StripedShape(type, StripedShape.HORIZONTAL, x, y, board);
    }
    if (spec) {
        if (cur.special === 0) board.setShape(x, y, spec);
        else this.putSpecial(board, m, spec);
    }
    
    // make score
    board.combo++;
    var len = m.hlength + m.vlength - (m.type == Match.HORIZONTAL + Match.VERTICAL ? 1 : 0);
    var score = len >= 5 ? len * 40 : (len == 4 ? 120 : 60);
    score *= board.combo;
    board.gainScores.push({x: mx, y: my, type: m.shapeType, score: score});
    board.score += score;
    
    return true;
};

MatchFinder.prototype.makeMatchSound = function (board) {
    if ((this.matches.length > 0 || this.swapMatches.length > 0) && !board.debug.disableMatching) {
        var lv = Math.min(board.combo - 1, 14);
        var cn = [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24][lv];
        board.emitSignal('playSound', {name: 'match', pitch: Math.pow(2, cn/12)});
    }
};
