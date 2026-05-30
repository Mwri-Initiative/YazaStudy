const CACHE_NAME = 'yaza-study-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll([
        '/',
        '/manifest.json',
        '/favicon.svg',
        OFFLINE_URL,
      ]);
      // Force the waiting service worker to become the active service worker
      await self.skipWaiting();
    })()
  );
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
      await self.clients.claim();
    })()
  );
});

// Fetch handler - try network first for navigation requests, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          // Update the cache with the latest HTML
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (err) {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const offlineResponse = await caches.match(OFFLINE_URL);
          return offlineResponse;
        }
      })()
    );
    return;
  }

  // For other requests, try cache first, then network, then fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).catch(async () => {
          // If request is for an image or stylesheet, optionally return a placeholder
          if (request.destination === 'image') {
            return caches.match('/favicon.svg');
          }
          return caches.match(OFFLINE_URL);
        })
      );
    })
  );
});
