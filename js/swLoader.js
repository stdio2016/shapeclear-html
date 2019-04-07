// get help from  https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
var hasServiceWorker = false;
var swRegistration = null;
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
        console.log('Registration succeeded. Scope is ' + reg.scope);
        
        // get help from https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker
        var sw = null;
        if (reg.installing) sw = reg.installing;
        else if (reg.waiting) sw = reg.waiting;
        else if (reg.active) sw = reg.active, hasServiceWorker = true;
        swRegistration = reg;
        
        if (sw) {
            sw.addEventListener('statechange', function (e) {
                console.log(sw.state);
                if (sw.state === "activated") hasServiceWorker = true;
            });
        }
    })['catch'](function (x) {
        console.log('Registration failed with ' + x);
    });
    navigator.serviceWorker.addEventListener('controllerchange', function (e) {
        location.reload();
    });
}

function updateByUser() {
    if (hasServiceWorker && swRegistration) {
        swRegistration.update().then(function (x) {
            return new Promise(function (yes, no) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', './cache/delete');
                xhr.onload = yes;
                xhr.onerror = no;
                xhr.send();
            });
        }).then(function () {
            alert('更新完成');
            location.reload();
        })['catch'](function () {
            alert('沒有網路，無法更新遊戲');
        });
    }
    else if (navigator.serviceWorker) {
        alert('網頁尚未載入完成，請稍候');
    }
    else {
        alert('您的瀏覽器不支援 Service Worker，無法提供離線瀏覽功能');
    }
}
