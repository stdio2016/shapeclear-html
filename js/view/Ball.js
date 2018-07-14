function Ball(game, speed, nnn){
    var x = Math.random() * (game.width - 100);
    var y = Math.random() * (game.height - 100);
    Phaser.Sprite.call(this, game, x, y, 'ball');
    var angle = 2 * Math.PI * Math.random();
    this.speed = speed;
    this.velocity = {x: Math.cos(angle) * speed, y: Math.sin(angle) * speed};
    this.nnn = nnn || [];
}
Ball.prototype = Object.create(Phaser.Sprite.prototype);
Ball.prototype.constructor = Ball;

Ball.prototype.update = function(){
    var game = this.game;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    if (this.velocity.x > 0 && this.x > game.width-100) {
        this.velocity.x *= -1;
        this.game.bounceTime++;
    }
    if (this.x > game.width-100) {
        this.x = game.width-100;
    }
    if (this.velocity.x < 0 && this.x < 0) {
        this.velocity.x *= -1;
        this.game.bounceTime++;
    }
    if (this.x < 0) {
        this.x = 0;
    }
    if (this.velocity.y > 0 && this.y > game.height - 100) {
        this.velocity.y *= -1;
        this.game.bounceTime++;
    }
    if (this.y > game.height - 100) {
        this.y = game.height - 100;
    }
    if (this.velocity.y < 0 && this.y < 0) {
        this.velocity.y *= -1;
        this.game.bounceTime++;
    }
    if (this.y < 0) {
        this.y = 0;
    }
    var PP = Phaser.Point;
    var pos1 = this.position;
    for (var i = 0; i < this.nnn.length; i++) {
        var pos2 = this.nnn[i].position;
        var d = PP.subtract(pos2, pos1);
        var dd = d.getMagnitudeSq();
        var v1 = this.velocity, v2 = this.nnn[i].velocity;
        v1 = new Phaser.Point(v1.x, v1.y);
        v2 = new Phaser.Point(v2.x, v2.y);
        if (dd < 10000) {
            var v1d = PP.project(v1, d);
            var v2d = PP.project(v2, d);
            this.velocity = PP.add(PP.subtract(v1, v1d), v2d);
            this.nnn[i].velocity = PP.add(PP.subtract(v2, v2d), v1d);
            d.setMagnitude(d.getMagnitude() - 100);
            pos1.add(d.x / 2, d.y / 2);
            pos2.subtract(d.x / 2, d.y / 2);
            this.game.bounceTime++;
        }
    }
};

Ball.prototype.pointTo = function(x, y){
    var dx = (this.x + this.width / 2) - x;
    var dy = (this.y + this.height / 2) - y;
    var norm = this.speed / Math.sqrt(dx * dx + dy * dy);
    this.velocity.x = -dx * norm;
    this.velocity.y = -dy * norm;
};
