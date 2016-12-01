// Before I start the game
// If someone's browser doesn't support console, then make a dummy object
console = window.console || { log: function(s){} };

// Start my game!
var game = new Phaser.Game('100', '100', Phaser.AUTO, 'gameDiv');
var gameScreen = new GameScreen();
game.state.add("GameScreen", gameScreen);
game.state.start("GameScreen");
