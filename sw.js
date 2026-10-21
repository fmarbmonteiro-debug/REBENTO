const CACHE_NAME = 'rebento-cache-v6';
const APP_SHELL = [
  './',
  './index.html',
  './web_application.html',
  './manifest.json',
  './manifest.js',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/js/auth.js',
  './assets/js/db.js',
  './assets/js/index.js',
  './assets/js/modules/UI.js',
  './assets/js/modules/api.js',
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
].map(path => new URL(path, self.registration.scope).href);

const menuUrl = new URL('./pages/menu-inicial.html', self.registration.scope).href;

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

          const menuPage = await cache.match(menuUrl);
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
    caches.open(CACHE_NAME).then(async cache => {
      const cachedResponse = await cache.match(request, { ignoreSearch: true });
      if (cachedResponse) return cachedResponse;

      const response = await fetch(request);
      if (response.ok) {
        event.waitUntil(cache.put(request, response.clone()));
      }
      return response;
    })
  );
});
