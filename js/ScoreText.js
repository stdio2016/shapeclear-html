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
    var dec = newScore.toString();
    for (var i = this.digits.length; i < dec.length; i++) {
        var d = this.charPool.add.sprite(0, 0, 'number', dec.charAt(i));
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

ScoreText.prototype.showAtPosition = function (x, y, charHeight) {
    var dec = this.value.toString();
    var charWidth = charHeight * ScoreText.charAspectRatio;
    for (var i = 0; i < this.digits.length; i++) {
        var d = this.digits[i];
        d.x = x + (i - (this.digits.length - 1) / 2) * charWidth;
        d.y = y;
        if (dec.length <= this.digits.length) {
            if (i < this.digits.length - dec.length) {
                d.frameName = "0";
            }
            else {
                d.frameName = dec.charAt(dec.length - this.digits.length + i);
            }
        }
        else { // fill with "9"
            d.frameName = "9";
        }
        d.width = charWidth;
        d.height = charHeight;
        d.tint = ScoreText.colorPalette[this.color];
    }
};

ScoreText.prototype.popup = function (boardx, boardy, boardsize) {
    this.lifetime--;
    this.showAtPosition(boardx + boardsize * this.x, boardy + boardsize * this.y, boardsize * (2/3));
    return this.lifetime <= 0;
};

ScoreText.prototype.showWithBounds = function (x, y, width, height) {
    var w = height * ScoreText.charAspectRatio * this.value.toString().length;
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
