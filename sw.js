var CACHENAME = 'shapeclear';

self.addEventListener('fetch', function(event) {
    if (event.request) {
        console.log('fetching %s' ,event.request.url);
        event.respondWith(fromCache(event.request, event));
    }
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
          './404.html',
          './config.html'
        ]); 
    })['catch'](function (x) {
        console.log(x);
    });
}

function fromCache(req, event) {
    var nocache = false;
    var c;
    return caches.open(CACHENAME).then(function (cache) {
        c = cache;
        return c.match(req, {ignoreSearch: true}).then(function (result) {
            if (result) {
                // update cache
                if (event) event.waitUntil(updateCache(req, cache));
                return result;
            }
            nocache = true;
            return Promise.reject("cache miss");
        });
    })['catch'](function (x) {
        if (!nocache) {
            console.log(x);
        }
        return fetch(req);
    }).then(function (result) {
        // add to cache
        if (nocache && event && result.ok) {
            event.waitUntil(c.put(req, result.clone()));
        }
        return result;
    })['catch'](function () {
        return c.match('404.html');
    })['catch'](function () {
        return new Response(
          '<!DOCTYPE html><html><head>\n' +
          '<meta charset="UTF-8">\n' +
          '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
          '<title>File not found</title></head>\n' +
          '<body><h1>File not found</h1></body></html>'
        , {status: 404, headers: {'Content-Type': 'text/html'}});
    });
}

function updateCache(req, cache) {
    return fetch(req).then(function (result) {
        if (result.ok) {
            return cache.put(req, result);
        }
    })['catch'](function (x) {
        console.log(x);
    });
}
