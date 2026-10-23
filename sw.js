const CACHE_NAME = 'ews-cache-v1';
const urlsToCache = [
  '/ELITE-WORKFORCE-SOLUTIONS/',
  '/ELITE-WORKFORCE-SOLUTIONS/index.html',
  '/ELITE-WORKFORCE-SOLUTIONS/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
