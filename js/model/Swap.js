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

Swap.isSpecialCombo = function (from, to) {
    if (!from.canSwap() || !to.canSwap()) return false;
    if (from instanceof StripedShape) {
        if (to instanceof StripedShape) ;
        else if (to instanceof WrappedShape && to.state === WrappedShape.NORMAL) ;
        else if (to instanceof TaserShape && to.state === TaserShape.NORMAL) ;
        else return false;
    }
    else if (from instanceof WrappedShape && from.state === WrappedShape.NORMAL) {
        if (to instanceof StripedShape) ;
        else if (to instanceof WrappedShape && to.state === WrappedShape.NORMAL) ;
        else if (to instanceof TaserShape && to.state === TaserShape.NORMAL) ;
        else return false;
    }
    else if (from instanceof TaserShape && from.state === TaserShape.NORMAL) {
        if (to instanceof StripedShape) ;
        else if (to instanceof WrappedShape && to.state === WrappedShape.NORMAL) ;
        else if (to instanceof TaserShape && to.state === TaserShape.NORMAL) ;
        else if (to.canMatch()) ;
        else return false;
    }
    else if (to instanceof TaserShape && to.state === TaserShape.NORMAL) {
        if (from.canMatch()) ;
        else return false;
    }
    else {
        return false;
    }
    return true;
};

Swap.prototype.specialCombo = function (board) {
    // many "return false"'s are unimplemented special combo
    var from = board.getShape(this.from.x, this.from.y);
    var to = board.getShape(this.to.x, this.to.y);
    if (!Swap.isSpecialCombo(from, to)) return false;
    if (from instanceof StripedShape) {
        if (to instanceof StripedShape) {
            var e = new StripeEffect(board);
            e.addLine(to.x, to.y, StripeEffect.HORIZONTAL, from.x === to.x ? to.type : from.type);
            e.addLine(to.x, to.y, StripeEffect.VERTICAL, from.y === to.y ? to.type : from.type);
            from.stripeDirection = to.stripeDirection = 0;
            from.special = from.x === to.x ? StripeEffect.VERTICAL : StripeEffect.HORIZONTAL;
            to.special = from.y === to.y ? StripeEffect.VERTICAL : StripeEffect.HORIZONTAL;
            board.clearShape(to.x, to.y);
            board.goodCount += 1;
            board.addItemToClear(e);
        }
        else if (to instanceof WrappedShape && to.state === WrappedShape.NORMAL) {
            var e = new BigStripeEffect(board, from, to);
            board.addItemToClear(e);
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
            var e = new BigStripeEffect(board, from, to);
            board.addItemToClear(e);
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
