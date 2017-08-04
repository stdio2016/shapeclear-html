function StripedShape(type, x, y, dir, board) {
    Shape.call(this, type, x, y, board);
    this.stripeDirection = dir;
}

StripedShape.prototype = new Shape();
StripedShape.prototype.constructor = StripedShape;

function StripeEffect(board, x, y, direction) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.direction = direction || StripeEffect.HORIZONTAL;
    this.totalTicks = 2;
    this.tick = this.totalTicks;
    this.progress = 0;
}

StripeEffect.HORIZONTAL = 1;
StripeEffect.VERTICAL = 2;

StripeEffect.prototype.update = function () {
    this.tick--;
    if (this.tick <= 0) {
        this.tick += this.totalTicks;
        var work = false;
        this.progress++;
        if (this.direction === StripeEffect.VERTICAL) {
            if (this.y - this.progress >= 0) {
                this.board.clearShape(this.x, this.y - this.progress, true);
                work = true;
            }
            if (this.y + this.progress < this.board.height) {
                this.board.clearShape(this.x, this.y + this.progress, true);
                work = true;
            }
        }
        else {
            if (this.x - this.progress >= 0) {
                this.board.clearShape(this.x - this.progress, this.y, true);
                work = true;
            }
            if (this.x + this.progress < this.board.width) {
                this.board.clearShape(this.x + this.progress, this.y, true);
                work = true;
            }
        }
        return work;
    }
    return true;
};
