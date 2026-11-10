/* Watch — service worker. App shell di-cache, data live SELALU dari network. */
var CACHE = 'watch-v19';
var SHELL = [
  './',
  'index.html',
  'manifest.json',
  'office-3d.webp',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  /* status.json = data live, JANGAN PERNAH di-cache */
  if (url.pathname.indexOf('status.json') !== -1) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }
  /* app shell: cache dulu, fallback ke network */
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.ok && e.request.method === 'GET') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      });
    })
  );
});
