function Match() {
    this.type = Match.HORIZONTAL;

    // vertical match
    this.lengthv = 0;
    this.xv = 0;
    this.yv = 0;

    // horizontal match
    this.lengthh = 0;
    this.xh = 0;
    this.yh = 0;
}

Match.HORIZONTAL = 1;
Match.VERTICAL = 2;
Match.CROSS = 3;
