const STATIC_CACHE_NAME = 'static-cache-v1';
const urlsToCache = [
  // '/',
  // '/index.html',
  // '/static/js/bundle.js',
  // Ajoutez d'autres ressources statiques à mettre en cache
];

// Installation du service worker et mise en cache des ressources statiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du service worker et suppression des anciens caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  // N'intercepter que les requêtes GET
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});

// Gestion des messages envoyés au service worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestion de la mise à jour du service worker
self.addEventListener('controllerchange', () => {
  window.location.reload();
});
