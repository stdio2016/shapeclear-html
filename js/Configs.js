var Configs = (function() {
var db = null;
function getIDB() {
    if (db) return Promise.resolve(db);
    return new Promise(function(resolve, reject) {
        try {
            var dbreq = indexedDB.open("ShapeClear_configs", 1);
            dbreq.onupgradeneeded = function (event) {
                db = dbreq.result;
                var store = db.createObjectStore("keyval");
            };
            dbreq.onsuccess = function (event) {
                db = dbreq.result;
                resolve(db);
            };
            dbreq.onerror = function (event) {
                reject(event);
            };
        }
        catch (x) {
            reject(x);
        }
    });
}

function get(key) {
    return getIDB().then(function (db) {
        return new Promise(function(resolve, reject) {
            var t = db.transaction("keyval", "readonly");
            var s = t.objectStore("keyval");
            var req = s.get(key);
            req.onsuccess = function () {
                resolve(req.result);
            };
            req.onerror = reject;
        });
    }, function () {
        return localStorage.getItem('ShapeClear_' + key);
    });
}

function set(key, value) {
    return getIDB().then(function (db) {
        return new Promise(function(resolve, reject) {
            var t = db.transaction("keyval", "readwrite");
            var s = t.objectStore("keyval");
            s.put(value, key);
            t.oncomplete = resolve;
            t.onerror = reject;
        });
    }, function () {
        return localStorage.setItem('ShapeClear_' + key, value);
    });
}

function del(key, value) {
    return getIDB().then(function (db) {
        return new Promise(function(resolve, reject) {
            var t = db.transaction("keyval", "readwrite");
            var s = t.objectStore("keyval");
            s['delete'](key);
            t.oncomplete = resolve;
            t.onerror = reject;
        });
    }, function () {
        return localStorage.removeItem('ShapeClear_' + key);
    });
}

return {
    getIDB: getIDB,
    get: get,
    set: set,
    del: del
};
})();
