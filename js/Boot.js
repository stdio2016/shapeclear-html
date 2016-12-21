// Finished loading phaser.js
var loading = document.getElementById('loading');
if (window.Phaser) {
    loading.style.display = 'none';
}
else {
    loading.innerHTML = "Unable to load phaser.js";
}

// get renderer config

function getRendererConfig() {
    var renderer;
    try {
        renderer = localStorage.getItem('ShapeClear.renderer');
        switch (renderer){
          case "WEBGL":
          case "CANVAS":
          case "AUTO":
          case "HEADLESS":
            renderer = Phaser[renderer];
            break;
          default:
            renderer = Phaser.AUTO;
        }
    }
    catch (e) {
        renderer = Phaser.AUTO;
    }
    return renderer;
}

// Start my game!
var game = new Phaser.Game('100', '100', getRendererConfig(), 'gameDiv');
var gameScreen = new GameScreen();
game.state.add("GameScreen", gameScreen);
game.state.add("Load", new Load());
game.state.start("Load");
