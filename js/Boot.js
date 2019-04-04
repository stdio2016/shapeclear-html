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
    // porting changes from
    // https://github.com/samme/phaser-ce/commit/1bf7ca70be9e45308a4761417caf520e0fb786ac
    Phaser.BitmapData.generateTexture = function (key, callback, callbackContext) {
        var cache = this.game.cache;
        var image = new Image();

        image.src = this.canvas.toDataURL("image/png");

        if (!callback || image.complete)
        {
            var obj = cache.addImage(key, '', image);
            return new PIXI.Texture(obj.base);
        }
        else
        {
            image.onload = function () {
                var obj = cache.addImage(key, '', image);
                var texture = new PIXI.Texture(obj.base);
                callback.call(callbackContext || null, texture);
                image.onload = null;
            };
        }

        return null;
    };
    
    Phaser.Sound.prototype.resume = function () {
    
        if (this.paused && this._sound)
        {
            if (this.usingWebAudio)
            {
                var p = Math.max(0, this.position + (this.pausedPosition / 1000));
    
                this._sound = this.context.createBufferSource();
                this._sound.buffer = this._buffer;
    
                if (this.externalNode)
                {
                    this._sound.connect(this.externalNode);
                }
                else
                {
                    this._sound.connect(this.gainNode);
                }
    
                if (this.loop)
                {
                    this._sound.loop = true;
                }
    
                if (!this.loop && this.currentMarker === '')
                {
                    this._sound.onended = this.onEndedHandler.bind(this);
                }
    
                var duration = this.duration - (this.pausedPosition / 1000);
    
                if (this._sound.start === undefined)
                {
                    this._sound.noteGrainOn(0, p, duration);
                    //this._sound.noteOn(0); // the zero is vitally important, crashes iOS6 without it
                }
                else
                {
                    // some strange code that breaks on Edge browser
                    if (this.loop)
                    {
                        //  Handle chrome bug: https://code.google.com/p/chromium/issues/detail?id=457099
                        if (this.game.device.chrome && this.game.device.chromeVersion === 42)
                        {
                            this._sound.start(0);
                        }
                        else
                        {
                            this._sound.start(0, p);
                        }
                    }
                    else
                    {
                        this._sound.start(0, p, duration);
                    }
                }
            }
            else
            {
                this._sound.currentTime = this._tempPause;
                this._sound.play();
            }
    
            this.isPlaying = true;
            this.paused = false;
            this.startTime += (this.game.time.time - this.pausedTime);
            this.onResume.dispatch(this);
        }
    
    };
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

function Li(s, x) {
  if (s < 0) return NaN;
  if (x >= 1 || x <= -1) return NaN;
  var sum = 0, term = x, i = 1, xx = x;
  while (term > 1e-14 || term < -1e-14) {
    sum += term;
    ++i;
    xx *= x;
    term = xx / Math.pow(i, s);
  }
  return sum;
}

function prank(T, v) {
  var x = v / T;
  var ex = Math.exp(-x);
  var pi4 = Math.pow(Math.PI, 4);
  return T*T*T*T * (
    pi4 / 15 - x*x*x * Li(1, ex) - 3 * x*x * Li(2, ex) -
      6 * x * Li(3, ex) - 6 * Li(4, ex)
  );
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

// DEBUG: Firefox for Android 61 will leak memory after closing this game
function gameDestructor() {
    if (game) game.destroy();
    game = null;
    mainMenu = null;
    gameScreen = null;
}
window.addEventListener('unload', gameDestructor);

function preventLeave(event) {
    if (game.state.current === "GameScreen") {
        event.returnValue = "Your game is not finished. Do you want to leave?";
        return event.returnValue;
    }
    return void 0;
}
window.addEventListener('beforeunload', preventLeave);

var gameScreen = new GameScreen();
game.state.add("GameScreen", gameScreen);
game.state.add("Load", new Load());
var mainMenu = new MainMenu();
game.state.add("MainMenu", mainMenu);
game.state.start("Load");
