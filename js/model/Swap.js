function Swap(from, to, ticks) {
    this.from = from;
    this.to = to;
    this.tick = ticks;
    this.totalTicks = ticks;
    this.status = 'swap';
}

Swap.prototype.interpolatedPos = function () {
    var x = this.tick / this.totalTicks;
    return x * (3 * x - 2 * x * x);
};

Swap.prototype.reject = function() {
    this.status = 'reject';
    this.tick = this.totalTicks;
};

Swap.prototype.specialCombo = function (board) {
    // many "return false"'s are unimplemented special combo
    var from = this.from;
    var to = this.to;
    if (from instanceof StripedShape) {
        if (to instanceof StripedShape) {
            var e = new StripeEffect(board);
            e.addLine(from.x, from.y, StripeEffect.HORIZONTAL, from.x === to.x ? from.type : to.type);
            e.addLine(from.x, from.y, StripeEffect.VERTICAL, from.y === to.y ? from.type : to.type);
            from.stripeDirection = to.stripeDirection = 0;
            from.special = from.x === to.x ? StripeEffect.HORIZONTAL : StripeEffect.VERTICAL;
            to.special = from.y === to.y ? StripeEffect.HORIZONTAL : StripeEffect.VERTICAL;
            board.clearShape(from.x, from.y, to.type);
            board.addItemToClear(e);
        }
        else if (to instanceof WrappedShape && to.state === WrappedShape.NORMAL) {
            return false;
        }
        else if (to instanceof TaserShape && to.state === TaserShape.NORMAL) {
            board.setShape(to.x, to.y, 0);
            var e = new TaserComboEffect(board, to, from);
            board.addItemToClear(e);
        }
        else return false;
    }
    else if (from instanceof WrappedShape && from.state === WrappedShape.NORMAL) {
        if (to instanceof StripedShape) {
            return false;
        }
        else if (to instanceof WrappedShape && to.state === WrappedShape.NORMAL) {
            from.bombSize = to.bombSize = 2;
            board.clearShape(from.x, from.y);
            board.clearShape(to.x, to.y);
        }
        else if (to instanceof TaserShape && to.state === TaserShape.NORMAL) {
            board.setShape(to.x, to.y, 0);
            var e = new TaserComboEffect(board, to, from);
            board.addItemToClear(e);
        }
        else return false;
    }
    else if (from instanceof TaserShape && from.state === TaserShape.NORMAL) {
        if (to instanceof StripedShape) {
            board.setShape(from.x, from.y, 0);
            var e = new TaserComboEffect(board, from, to);
            board.addItemToClear(e);
        }
        else if (to instanceof WrappedShape && to.state === WrappedShape.NORMAL) {
            board.setShape(from.x, from.y, 0);
            var e = new TaserComboEffect(board, from, to);
            board.addItemToClear(e);
        }
        else if (to instanceof TaserShape && to.state === TaserShape.NORMAL) {
            var e = new DoubleTaserEffect(board, from, to);
            board.addItemToClear(e);
        }
        else if (to.canMatch()) {
            board.clearShape(from.x, from.y, to.type);
        }
        else return false;
    }
    else if (to instanceof TaserShape && to.state === TaserShape.NORMAL) {
        if (from.canMatch()) {
            board.clearShape(to.x, to.y, from.type);
        }
        else return false;
    }
    else {
        return false;
    }
    return true;
};
