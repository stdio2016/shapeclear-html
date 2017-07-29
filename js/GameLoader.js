function loadScript(src, progressCallback, callback) {
    var xhr = new XMLHttpRequest();
    if (xhr.onload === void 6) {
        return void callback('error');
    }
    xhr.onload = function () {
        if (xhr.status != 200) return void callback('error');
        var result = xhr.response;
        var script = document.createElement('script');
        if (result) {
            script.innerHTML = result;
        }
        else if (script.text !== void 0) {
            script.text = xhr.responseText;
        }
        script.async = false;
        script.defer = false;
        document.head.appendChild(script);
        if (callback) callback();
    };
    xhr.onerror = function() { callback('error'); };
    xhr.onprogress = progressCallback || null;
    xhr.open('get', src);
    xhr.responseType = 'text';
    xhr.send();
}

function addScriptTag(src, onload, onerror) {
    var script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.defer = false;
    script.onload = onload;
    script.onerror = onerror;
    document.body.appendChild(script);
}

var loadProgress = document.getElementById('loadProgress');
var loadingInfo = document.getElementById('loadingInfo');
loadScript('lib/phaser.js', function (e) {
    if (e.lengthComputable) {
        loadProgress.value = e.loaded;
        loadProgress.max = e.total;
    }
    else {
        loadProgress.value = e.loaded;
        loadProgress.max = 3338647;
    }
}, function (e) {
    if (e) {
        loadingInfo.innerText = 'Unable to load Phaser.js';
        return;
    }
    loadingInfo.innerText = 'Loading my program';
    var srcs = [
      'js/model/Board.js',
      'js/model/Shape.js',
      'js/model/Swap.js',
      'js/model/Match.js',
      'js/model/Debug.js',
      'js/states/Load.js',
      'js/states/GameScreen.js',
      'js/states/MainMenu.js',
      'js/view/Ball.js',
      'js/view/ScoreText.js',
      'js/TouchDetector.js',
      'js/applefools/AppleFools.js',
      'js/applefools/MainMenu.js'
    ];
    var count = srcs.length;
    loadProgress.value = 0;
    loadProgress.max = count;
    function onload() {
        count--;
        loadProgress.value = srcs.length - count;
        if (count == 0) {
            addScriptTag('js/Boot.js');
        }
    }
    function onerror() {
        loading.innerText = 'Unable to load my program';
    }
    for (var i = 0; i < srcs.length; i++) {
        addScriptTag(srcs[i], onload, onerror);
    }
});

// To punish IE user
Object.assign = Object.assign || function (target, sources) {
    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        if (source != null) {
            for (var k in source) {
                if (source.hasOwnProperty(k)) {
                    to[k] = source[k];
                }
            }
        }
    }
    return to;
};
