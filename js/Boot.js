// Finished loading phaser.js
var loading = document.getElementById('loading');
if (window.Phaser) {
    loading.style.display = 'none';
}
else {
    loading.innerHTML = "Unable to load phaser.js";
}

// Start my game!
var game = new Phaser.Game('100', '100', Phaser.AUTO, 'gameDiv');
var gameScreen = new GameScreen();
game.state.add("GameScreen", gameScreen);
game.state.start("GameScreen");

// Test the renderer
var renderer = 'unknown';
switch (game.renderType) {
  case Phaser.CANVAS:
    renderer = 'CANVAS';
    break;
  case Phaser.WEBGL:
    renderer = 'WEBGL';
    break;
  case Phaser.HEADLESS:
    renderer = 'HEADLESS';
    break;
}
localStorage.setItem('ShapeClear.renderer', renderer);
