var CACHENAME = 'shapeclear';

self.addEventListener('fetch', function(event) {
    event.respondWith(fromCache(event.request));
    event.waitUntil(updateCache(event.request));
});

addEventListener('install', function (event) {
    event.waitUntil(preLoad());
    skipWaiting();
});

addEventListener('activate', function (event) {
    event.waitUntil(clients.claim());
});

// with help from https://serviceworke.rs/strategy-cache-and-update_service-worker_doc.html
function preLoad() {
    return caches.open(CACHENAME).then(function (cache) {
        return cache.addAll([
          './js/swLoader.js',
          './js/GameLoader.js',
          './js/alertbox.js',
          './css/fullscreen.css',
          './css/alertbox.css',
          './game.html',
          './index.html',
          './',
          './config.html'
        ]); 
    }).catch(function (x) {
        console.log(x);
    });
}

function fromCache(req) {
    var nocache = false;
    return caches.open(CACHENAME).then(function (cache) {
        return cache.match(req).then(function (result) {
            if (result) return result;
            nocache = true;
            return Promise.reject("cache miss");
        });
    }).catch(function (x) {
        if (!nocache) {
            console.log(x);
        }
        // to prevent network error
        return fetch(req);
    });
}

function updateCache(req) {
    return caches.open(CACHENAME).then(function (cache) {
        return fetch(req).then(function (result) {
            if (result.ok) {
                return cache.put(req, result);
            }
        });
    }).catch(function (x) {
        console.log(x);
    });
}
