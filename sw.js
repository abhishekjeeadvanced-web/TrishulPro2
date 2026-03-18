const CACHE_NAME = 'trishul-pro-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // External resources cached for offline use
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Inter:wght@400;600;700;800;900&display=swap'
];

// Install Event - Caching basic files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching initial assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate Event - Clearing old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Stale While Revalidate (Offline support)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Network fetch to get latest, otherwise fallback to cache
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return nothing if offline and not in cache
      });
      
      // Return cached immediately if available, while fetching in background
      return cachedResponse || fetchPromise;
    })
  );
});