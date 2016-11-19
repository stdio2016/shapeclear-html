function GameScreen(){
	this.debug = null; // To show debug message
	this.ball = null; // Ball to test animation
}

GameScreen.prototype.preload = function(){
	console.log("I don't know how to use Phaser game engine");
	game.load.image('ball', 'assets/ball.svg');
	game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
	game.time.advancedTiming = true;
}

GameScreen.prototype.create = function(){
	console.log("So don't expect me to make a game");
	this.addDebugText();
	this.ball = game.add.sprite(Math.random()*(game.width-100), Math.random()*(game.height-100), 'ball');
	var angle = 2*Math.PI*Math.random();
	var speed = 5;
	this.ball.velocity = {x: Math.cos(angle)*speed, y: Math.sin(angle)*speed};
}

GameScreen.prototype.addDebugText = function(){
	var style = { font: "32px", fill: "green" };
	this.debug = this.game.add.text(0, 0, "0", style);
}

GameScreen.prototype.update = function(){
	this.debug.text = game.time.fps;
	var ball = this.ball;
	ball.x += ball.velocity.x;
	ball.y += ball.velocity.y;
	if(ball.velocity.x > 0 && ball.x > game.width-100){
		ball.velocity.x *= -1;
		ball.x = game.width-100;
	}
	if(ball.velocity.x < 0 && ball.x < 0){
		ball.velocity.x *= -1;
		ball.x = 0;
	}
	if(ball.velocity.y > 0 && ball.y > game.height-100){
		ball.velocity.y *= -1;
		ball.y = game.height-100;
	}
	if(ball.velocity.y < 0 && ball.y < 0){
		ball.velocity.y *= -1;
		ball.y = 0;
	}
}
