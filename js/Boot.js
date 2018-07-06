// patch to fix Phaser
(function () {
    // resolution problem
    function removeResolutionFromCode (obj, methodName) {
        if (!obj[methodName]) return;
        var code = obj[methodName].toString();
        code = code.replace('this.game.resolution', '1');
        obj[methodName] = window.eval('(' + code + ')');
    }
    removeResolutionFromCode(Phaser.Cache.prototype, "addCompressedTextureMetaData");
    removeResolutionFromCode(Phaser.Cache.prototype, "addImage");
    removeResolutionFromCode(Phaser.Cache.prototype, "addBitmapFont");
    removeResolutionFromCode(Phaser.Cache.prototype, "addSpriteSheet");
    removeResolutionFromCode(Phaser.Cache.prototype, "addTextureAtlas");
    var code = Phaser.Loader.prototype.loadImageTag.toString();
    // fix Firefox black texture issue
    // More info here: https://github.com/photonstorm/phaser/issues/2534
    code = code.replace(
        "if (file.data.complete && file.data.width && file.data.height)",
        "if (!this.game.device.firefox && file.data.complete && file.data.width && file.data.height)"
    );
    Phaser.Loader.prototype.loadImageTag = window.eval('(' + code + ')');
})();

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
    "enableDebug": false,
    "resolution": getResolutionConfig()
});
var gameScreen = new GameScreen();
game.state.add("GameScreen", gameScreen);
game.state.add("Load", new Load());
var mainMenu = new MainMenu();
game.state.add("MainMenu", mainMenu);
game.state.start("Load");
