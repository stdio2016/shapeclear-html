function ScoreText(score, color, x, y, charPool) {
    this.digits = [];
    this.value = score;
    this.color = color;
    this.x = x;
    this.y = y;
    this.charPool = charPool;
    this.lifetime = 100;
    this.setScore(score);
}

ScoreText.colorPalette = [
  0x000000, // black
  0xcc0000, // red triangle
  0xcccc00, // yellow square
  0x00dd00, // green circle
  0x2244cc, // blue hexagon
  0xdd00dd, // purple downTriangle
  0xff9400, // orange rhombus
  0x000000
];

ScoreText.charAspectRatio = 36.0 / 48.0; // width/height

ScoreText.prototype.setScore = function (newScore) {
    var dec = ScoreText.numToString(newScore);
    for (var i = this.digits.length; i < dec.length; i++) {
        var ch = dec.charAt(i);
        if (ch === "∞") ch = "8";
        if (ch === "-") ch = "minus";
        var d = this.charPool.getFirstDead(true, 0, 0, 'number', ch);
        d.anchor.x = 0.5;
        d.anchor.y = 0.5;
        d.tint = ScoreText.colorPalette[this.color];
        this.digits.push(d);
    }
    while (dec.length < this.digits.length) {
        this.digits.pop().kill();
    }
    this.value = newScore;
};

ScoreText.prototype.setColor = function (newColor) {
    this.color = newColor;
    for (var i = 0; i < this.digits.length; i++) {
        this.digits[i].tint = ScoreText.colorPalette[newColor];
    }
}

ScoreText.prototype.showAtPosition = function (x, y, charHeight) {
    var dec = ScoreText.numToString(this.value);
    var charWidth = charHeight * ScoreText.charAspectRatio;
    for (var i = 0; i < this.digits.length; i++) {
        var d = this.digits[i];
        d.x = x + (i - (this.digits.length - 1) / 2) * charWidth;
        d.y = y;
        var digit = "9";
        if (dec.length <= this.digits.length) {
            if (i < this.digits.length - dec.length) {
                digit = "0";
            }
            else {
                digit = dec.charAt(dec.length - this.digits.length + i);
            }
            if (digit === "∞") {
                digit = "8";
                d.angle = 90;
            }
            else {
                d.angle = 0;
                if (digit === "-") digit = "minus";
            }
        }
        if (d.frameName !== digit) {
            d.frameName = digit;
        }
        d.width = charWidth;
        d.height = charHeight;
        //d.tint = ScoreText.colorPalette[this.color];
        d.alpha = this.lifetime / 100;
    }
};

ScoreText.prototype.popup = function (boardx, boardy, boardsize) {
    this.lifetime--;
    if (this.lifetime >= 90) {
        this.showAtPosition(
          boardx + boardsize * (this.x + 0.5),
          boardy + boardsize * (this.y + 0.5),
          boardsize * (1/2) * (100 - this.lifetime) / 10);
    }
    else {
        this.showAtPosition(
          boardx + boardsize * (this.x + 0.5),
          boardy + boardsize * (this.y + 0.5 + (this.lifetime - 90) / 100 * 0.4),
          boardsize * (1/2));
    }
    return this.lifetime <= 0;
};

ScoreText.prototype.showWithBounds = function (x, y, width, height) {
    var w = height * ScoreText.charAspectRatio * ScoreText.numToString(this.value).length;
    if (w > width) {
        this.showAtPosition(x, y, height * width / w);
    }
    else {
        this.showAtPosition(x, y, height);
    }
};

ScoreText.prototype.kill = function () {
    for (var i = 0; i < this.digits.length; i++) {
        this.digits[i].kill();
    }
};

ScoreText.numToString = function (num) {
    var str = Math.floor(num).toString();
    if (num >= 1e15) {
        return "∞";
    }
    if (num <= -1e15) {
        return "-∞";
    }
    if (num !== num) { // NaN
        return "---";
    }
    return str;
};

ScoreText.prototype.setDepth = function (d) {
    for (var i = 0; i < this.digits.length; i++) {
        this.digits[i].z = d;
    }
};
