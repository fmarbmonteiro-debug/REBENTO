const CACHE_NAME = 'rebento-cache-v3';
const APP_SHELL = [
  './',
  './index.html',
  './web_application.html',
  './manifest.json',
  './manifest.js',
  './assets/css/styles.css',
  './assets/js/db.js',
  './assets/js/auth.js',
  './assets/images/logo.svg',
  './assets/images/icons/icon-192x192.png',
  './assets/images/icons/icon-512x512.png',
  './pages/index.html',
  './pages/menu-inicial.html',
  './pages/registo.html',
  './pages/login.html',
  './pages/css/base.css',
  './pages/css/index.css',
  './pages/css/menu-inicial.css',
  './pages/css/registo.css',
  './pages/css/login.css',
  './pages/js/main.js',
  './pages/js/index.js',
  './pages/js/menu-inicial.js',
  './pages/js/registo.js',
  './pages/js/login.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('rebento-cache-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, copy))
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedPage = await cache.match(request, { ignoreSearch: true });
          if (cachedPage) return cachedPage;

          const menuPage = await cache.match('./pages/menu-inicial.html');
          if (menuPage) return menuPage;

          return new Response('A aplicação está indisponível offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true })
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then(response => {
          if (!response.ok) return response;

          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy))
          );
          return response;
        });
      })
  );
});
