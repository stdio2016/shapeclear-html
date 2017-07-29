function Ball(game, speed){
    var x = Math.random() * (game.width - 100);
    var y = Math.random() * (game.height - 100);
    Phaser.Sprite.call(this, game, x, y, 'ball');
    var angle = 2 * Math.PI * Math.random();
    this.speed = speed;
    this.velocity = {x: Math.cos(angle) * speed, y: Math.sin(angle) * speed};
}
Ball.prototype = Object.create(Phaser.Sprite.prototype);
Ball.prototype.constructor = Ball;

Ball.prototype.update = function(){
    var game = this.game;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    if (this.velocity.x > 0 && this.x > game.width-100) {
        this.velocity.x *= -1;
    }
    if (this.x > game.width-100) {
        this.x = game.width-100;
    }
    if (this.velocity.x < 0 && this.x < 0) {
        this.velocity.x *= -1;
    }
    if (this.x < 0) {
        this.x = 0;
    }
    if (this.velocity.y > 0 && this.y > game.height - 100) {
        this.velocity.y *= -1;
    }
    if (this.y > game.height - 100) {
        this.y = game.height - 100;
    }
    if (this.velocity.y < 0 && this.y < 0) {
        this.velocity.y *= -1;
    }
    if (this.y < 0) {
        this.y = 0;
    }
};

Ball.prototype.pointTo = function(x, y){
    var dx = (this.x + this.width / 2) - x;
    var dy = (this.y + this.height / 2) - y;
    var norm = this.speed / Math.sqrt(dx * dx + dy * dy);
    this.velocity.x = -dx * norm;
    this.velocity.y = -dy * norm;
};
