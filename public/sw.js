const CACHE_NAME = 'yaza-study-v2';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isCacheableResponse(response) {
  return response && response.ok && response.type !== 'opaque';
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  // HTML navigation: always prefer fresh content, but provide a real offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).then(async (response) => {
        if (response) return response;
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Never intercept API calls. Authentication, Supabase and other server APIs
  // must receive their normal network behaviour when a connection is available.
  if (new URL(request.url).pathname.startsWith('/api/')) return;

  // Static assets are cache-first for fast repeat visits, with the network as
  // a fallback so new deployments can update assets naturally.
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'manifest'
  ) {
    event.respondWith(
      caches.match(request).then(async (cached) => {
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (isCacheableResponse(response)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        } catch {
          return undefined;
        }
      })
    );
  }
});
