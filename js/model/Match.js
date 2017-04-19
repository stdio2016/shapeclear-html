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
