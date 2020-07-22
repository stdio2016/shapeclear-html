function Dispenser(x, y) {
    this.x = x;
    this.y = y;
    this.pos = 0;
    this.buffer = [];
}

Dispenser.prototype.generate = function generate(board) {
    var r = board.game.rnd.between(1, board.randomColors.length);
    var sh = new Shape(board.randomColors[r-1]);
    return sh;
};

Dispenser.prototype.preDispense = function generate(board) {
    var num = 0;
    for (var y = this.y; y < board.height; y++) {
        var sh = board.getShape(this.x, y);
        if (sh.type == -1) break;
        if (sh.isEmpty()) num += 1;
    }
    for (var i = this.buffer.length; i < num; i++) {
        var sh = this.generate(board);
        sh.dir = {x: 0, y: 1};
        this.pos += 10;
        sh.pos = this.pos;
        sh.speed = 0;
        this.buffer.push(sh);
    }
    while (this.buffer.length > num) this.buffer.pop();
};

Dispenser.prototype.dispense = function generate(board) {
    var sh = this.buffer.shift();
    if (!sh) throw Error(123456);
    if (this.buffer.length == 0) this.pos = 0;
    return sh;
};

Dispenser.prototype.updateAccel = function updateAccel(board) {
    var buf = this.buffer;
    var dsh = board.getShape(this.x, this.y);
    for (var i = 0; i < buf.length; i++) {
        var sh = buf[i];
        if (sh.isMoving()) {
            // diagonal fall is constant velocity
            if (sh.dir.x) sh.speed = 1.2;
            else if (sh.speed < 1.5) sh.speed += 0.15;
            else sh.speed += 0.3; // gravity acceleration
            if(sh.speed > 2.7) { // maximum speed
                sh.speed = 2.7;
            }
            sh.pos -= sh.speed;
            if (dsh && sh.pos < dsh.pos + 10) {
                sh.pos = dsh.pos + 10;
            }
            board.falling = true;
        }
        dsh = sh;
    }
};
