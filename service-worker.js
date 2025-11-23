// Nombre de caché (aumenta la versión para invalidar caches antiguas)
const CACHE_NAME = 'farmacias-guardia-cache-v3';

// Archivos que queremos cachear (assets estáticos). No cacheamos todo agresivamente.
const urlsToCache = [
  '/',
  'index.html',
  'css/style.css',
  'js/script.js',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Install: cachea sólo los assets estáticos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate: limpiar caches antiguas y tomar control inmediato
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Fetch: estrategia más conservadora para evitar servir páginas muy antiguas
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Sólo gestionar GET y recursos de mismo origen
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  // Para navegación (documentos HTML) usamos network-first: intentamos red,
  // y si falla devolvemos cache (útil para modo offline). Esto mantiene la página más fresca.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(networkResponse => {
          // Opcional: actualizar la caché del HTML para fallback offline
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Para otros recursos estáticos aplicamos stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(req).then(cachedResponse => {
        const networkFetch = fetch(req).then(networkResponse => {
          // Sólo cachear ciertos tipos: scripts, estilos e imágenes
          const dest = req.destination;
          if (['script', 'style', 'image'].includes(dest) || req.url.endsWith('.css') || req.url.endsWith('.js') || req.url.endsWith('.png') || req.url.endsWith('.jpg')) {
            try { cache.put(req, networkResponse.clone()); } catch (e) { /* put puede fallar para cross-origin */ }
          }
          return networkResponse;
        }).catch(() => {});

        // Devuelve cache si existe, sino la respuesta de red cuando llegue
        return cachedResponse || networkFetch;
      })
    )
  );
});