var CACHENAME = 'shapeclear';
var VERSION = 'v0.7.0xmas';
var myPath = location.origin + location.pathname;
var cacheEnableTest = 
    caches.open(CACHENAME).then(function (cache) {
        return cache.match(myPath + "cache/no");
    }).then(function (result) {
        return result == null;
    })['catch'](function () {
        return true;
    });

myPath = myPath.match(/(.*\/)/)[1];

self.addEventListener('fetch', function(event) {
    if (event.request) {
        var url = event.request.url;
        if (url.startsWith(myPath + 'cache/')) {
            cacheSettings(url.substring(myPath.length + 6), event);
        }
        else if (!url.startsWith(myPath) && url.indexOf('?') !== -1) {
            // don't cache hit counter!!
            event.respondWith(fetch(event.request));
        }
        else {
            event.respondWith(fromCache(event.request, event));
        }
    }
});

function cacheSettings(url, event) {
    if (url === 'delete') {
        event.waitUntil(preLoad());
        event.respondWith(new Response('ok'));
        console.log('cache cleared');
    }
    else if (url === 'version') {
        event.respondWith(new Response(VERSION));
    }
    else if (url === "disable") {
        event.waitUntil(caches.open(CACHENAME).then(function (c) {
            c.put(new Request("cache/no"), new Response('yes', {'status':200}));
        }));
        cacheEnableTest = Promise.resolve(false);
        event.respondWith(new Response('ok'));
    }
    else if (url === "enable") {
        event.waitUntil(caches.open(CACHENAME).then(function (c) {
            c.delete(new Request("cache/no"));
        }));
        cacheEnableTest = Promise.resolve(true);
        event.respondWith(new Response('ok'));
    }
    else {
        event.respondWith(noPage()); // need to get a promise
    }
}

addEventListener('install', function (event) {
    event.waitUntil(preLoad());
    skipWaiting();
});

addEventListener('activate', function (event) {
    event.waitUntil(clients.claim());
});

// with help from https://serviceworke.rs/strategy-cache-and-update_service-worker_doc.html
function preLoad() {
    var mustDownload = [
      'js/swLoader.js',
      'js/GameLoader.js',
      'js/alertbox.js',
      'css/fullscreen.css',
      'css/alertbox.css',
      'game.html',
      'index.html',
      '',
      '404.html',
      'config.html',
      'LICENSE'
    ];
    for (var i = 0; i < mustDownload.length; i++) {
        mustDownload[i] = myPath + mustDownload[i];
    }
    var c, names = [], must = new Set(mustDownload);
    return caches.open(CACHENAME).then(function (cache) {
        c = cache;
        return c.keys().then(function (keys) {
            names = keys;
            return cache.addAll(mustDownload);
        });
    }).then(function () {
        names.forEach(function (name) {
            if (!must.has(name.url)) {
                console.log("delete " + name.url);
                c['delete'](name);
            }
        });
        console.log('preloaded');
    })['catch'](function (x) {
        console.log(x);
    });
}

function fromCache(req, event) {
    var nocache = false;
    var c;
    return cacheEnableTest.then(function (yes) {
        if (!yes) return Promise.reject("cache disabled");
        return caches.open(CACHENAME);
    }).then(function (cache) {
        c = cache;
        // manually strip search string to make Chrome faster
        var i = req.url.indexOf('?');
        if (i !== -1) req = req.url.substring(0, i);
        return c.match(req).then(function (result) {
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
    })['catch'](noPage);
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

function noPage() {
    return caches.match('404.html').then(function (result) {
        if (result) return new Response(result.body, {status: 404});
        return new Response(
          '<!DOCTYPE html><html><head>\n' +
          '<meta charset="UTF-8">\n' +
          '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
          '<title>File not found</title></head>\n' +
          '<body><h1>File not found</h1></body></html>'
        , {status: 404, headers: {'Content-Type': 'text/html'}}
        );
    });
}
