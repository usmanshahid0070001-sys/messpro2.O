// MessPro 2.0 Progressive Web App (PWA) Service Worker
// Version: 1.0.2

const CACHE_NAME = 'messpro-static-v2';
const CORE_PRECACHE_URLS = [
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
];

// Install: Cache essential app shell assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CORE_PRECACHE_URLS).catch((err) => {
          console.warn('[PWA SW] Precache warning:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up outdated caches and claim active clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('messpro-') && name !== CACHE_NAME)
            .map((oldName) => caches.delete(oldName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests and http/https schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // BYPASS: API endpoints, dynamic data, and Vite dev server internals
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('node_modules') ||
    url.searchParams.has('token') ||
    url.searchParams.has('t')
  ) {
    return;
  }

  // 1. Navigation Requests (HTML Page loads): Network-first with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return (await caches.match('/index.html')) || Response.error();
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Fonts, Images, Icons): Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone()).catch(() => {});
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || Response.error());

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Default: Network with Cache Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, copy).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || Response.error())
      );
    })
  );
});

// Skip Waiting trigger from UI
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
