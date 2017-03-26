if (!('AppleFools' in window)) {
    AppleFools = {};
}

AppleFools.appleFoolsReady = (new Date()).getMonth() + 1 != 4;
AppleFools.appleFoolsReady = false;

AppleFools.safeGetStorage = function (key) {
    try {
        return localStorage.getItem(key);
    }
    catch (x) {
        return null;
    }
};

AppleFools.safeSetStorage = function (key, value) {
    try {
        localStorage.setItem(key, value);
    }
    catch (x) {
        console.log('Cannot access localStorage');
    }
};

AppleFools.getLife = function (callback) {
    var livesInfo = AppleFools.safeGetStorage('ShapeClear_AppleFools17');
    if (typeof livesInfo !== 'string') {
        livesInfo = +new Date();
        AppleFools.safeSetStorage('ShapeClear_AppleFools17', livesInfo);
    }
    else {
        // To prevent > 5 lives
        livesInfo = Math.max(+livesInfo, +new Date());
    }
    var avail = (+new Date() + (30 * 60 * 1000) * 5 - livesInfo);
    var lives = Math.floor(avail / (30 * 60 * 1000));
    var refillTime = 30 * 60 - (avail / 1000 - lives * 30 * 60);
    var secs = refillTime % 60;
    var mins = (refillTime - secs) / 60;
    secs = Math.floor(secs);
    secs = secs >= 10 ? secs : '0'+secs;
    if (lives >= 5) {
        console.log('%c♥' + lives + ' Full', 'color:red');
    }
    else {
        console.log('%c♥' + lives + ' ' + mins+':'+secs, 'color:red');
    }
    if (!AppleFools.appleFoolsReady) {
        // This only works on Apple Fools Day
        return callback(true);
    }
    if (lives > 0) {
        livesInfo += 30 * 60 * 1000;
        AppleFools.safeSetStorage('ShapeClear_AppleFools17', livesInfo);
        callback(true);
    }
    else {
        callback(false);
    }
};
