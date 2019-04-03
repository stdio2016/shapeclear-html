// get help from  https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
var hasServiceWorker = false;
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
        console.log('Registration succeeded. Scope is ' + reg.scope);
        
        // get help from https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker
        var sw = null;
        if (reg.installing) sw = reg.installing;
        else if (reg.waiting) sw = reg.waiting;
        else if (reg.active) sw = reg.active, hasServiceWorker = true;
        
        if (sw) {
            sw.addEventListener('statechange', function (e) {
                console.log(sw.state);
                if (sw.state === "activated") hasServiceWorker = true;
            });
        }
    }).catch(function (x) {
        console.log('Registration failed with ' + x);
    });
}
