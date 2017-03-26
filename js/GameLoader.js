function loadScript(src, progressCallback, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var result = xhr.response;
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.defer = false;
        document.head.appendChild(script);
        if (callback) callback();
    };
    xhr.onerror = callback;
    xhr.onprogress = progressCallback || null;
    xhr.open('get', src);
    xhr.responseType = 'text';
    xhr.send();
}

function addScriptTag(src) {
    var script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.defer = false;
    document.head.appendChild(script);
}

var loadProgress = document.getElementById('loadProgress');
loadScript('lib/phaser.js', function (e) {
    if (e.lengthComputable) {
        loadProgress.value = e.loaded;
        loadProgress.max = e.total;
    }
    else {
        loadProgress.value = e.loaded;
        loadProgress.max = 3169095;
    }
}, function (e) {
    if (e) {
        loading.innerText = 'Unable to load Phaser.js';
        return;
    }
    loading.innerText = 'Loading my program';
    var srcs = [
      'js/Load.js',
      'js/model/Board.js',
      'js/model/Shape.js',
      'js/model/Swap.js',
      'js/model/Match.js',
      'js/model/Debug.js',
      'js/GameScreen.js',
      'js/Ball.js',
      'js/TouchDetector.js',
      'js/applefools/AppleFools.js',
      'js/Boot.js'
    ];
    for (var i = 0; i < srcs.length; i++) {
        addScriptTag(srcs[i]);
    }
});
