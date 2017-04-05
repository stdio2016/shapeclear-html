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
        renderer = localStorage.getItem('ShapeClear_renderer');
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

function getResolutionConfig() {
    var res;
    try {
        res = +localStorage.getItem('ShapeClear_resolution');
        if (res < 0.25) res = 1;
        if (res != res) res = 1;
        var devicePixelRatio = window.devicePixelRatio || 1;
        devicePixelRatio = Math.round(devicePixelRatio * 4) / 4;
        if (res > devicePixelRatio) res = devicePixelRatio;
    }
    catch (e) {
        res = 1;
    }
    return res;
}

function getWindowSize() {
    var rect = document.body.getClientRects()[0];
    var width = Math.min(Math.floor(rect.width), innerWidth);
    var height = Math.min(Math.floor(rect.height), innerHeight);
    return [width, height];
}

// Start my game!
var windowSize = getWindowSize();
var game = new Phaser.Game({
    "width": windowSize[0],
    "height": windowSize[1],
    "renderer": getRendererConfig(),
    "parent": "gameDiv",
    "resolution": getResolutionConfig()
});
var gameScreen = new GameScreen();
game.state.add("GameScreen", gameScreen);
game.state.add("Load", new Load());
game.state.add("MainMenu", new AppleFools.MainMenu());
game.state.start("Load");
