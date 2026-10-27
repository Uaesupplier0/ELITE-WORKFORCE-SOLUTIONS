const CACHE_NAME = 'ews-cache-v3';

// Install event - zaroori assets cache karne ke liye
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - purana cache saaf karne ke liye
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - HTML pages ke liye Network-First strategy
self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  // Agar request HTML file ya page navigation ki hai, toh seedha network se laye
  if (event.request.mode === 'navigate' || requestURL.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Baaki static assets ke liye cache check karein
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
