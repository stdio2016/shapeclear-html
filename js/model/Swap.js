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
            return false;
        }
        else if (to instanceof WrappedShape) {
            return false;
        }
        else if (to instanceof TaserShape) {
            return false;
        }
        else return false;
    }
    else if (from instanceof WrappedShape) {
        if (to instanceof StripedShape) {
            return false;
        }
        else if (to instanceof WrappedShape) {
            return false;
        }
        else if (to instanceof TaserShape) {
            return false;
        }
        else return false;
    }
    else if (from instanceof TaserShape) {
        if (to instanceof StripedShape) {
            return false;
        }
        else if (to instanceof WrappedShape) {
            return false;
        }
        else if (to instanceof TaserShape) {
            return false;
        }
        else if (to.canMatch()) {
            board.clearShape(from.x, from.y, to.type);
        }
        else return false;
    }
    else if (to instanceof TaserShape) {
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
