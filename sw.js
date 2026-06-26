const CACHE_NAME = 'bat-knock-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/components/css/style.css',
  '/components/js/script.js',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Event - Cache Core Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Stale While Revalidate Strategy
self.addEventListener('fetch', event => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Only cache our own origin or known CDNs if we want to be safe,
          // but here we just cache whatever we fetch successfully.
          if (event.request.url.startsWith('http')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        }).catch(() => {
          // If fetch fails (offline), just rely on the cached response
        });

        // Return the cached response immediately if there is one, otherwise wait for the network response.
        return cachedResponse || fetchPromise;
      })
  );
});
