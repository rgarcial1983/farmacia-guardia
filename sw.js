// Define un nombre para tu caché
const CACHE_NAME = 'farmacias-guardia-cache-v1';

// Lista los archivos que quieres guardar en caché
// Añade aquí todos tus archivos (HTML, CSS, JS, imágenes clave)
const urlsToCache = [
  '.',
  'index.html',
  'css/style.css',
  'js/scripts.js',
  'manifest.json',
  'farmaciasGuardia.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'ficheros/GUARDIAS_UBEDA_2025.pdf'
];

// Evento "install": Se dispara cuando el Service Worker se instala
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('¡Caché abierta!');
        // Añade todos los archivos de la lista a la caché
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento "fetch": Se dispara cada vez que la web pide un recurso (CSS, JS, imagen...)
self.addEventListener('fetch', event => {
  event.respondWith(
    // Intenta encontrar el recurso en la caché
    caches.match(event.request)
      .then(response => {
        // Si lo encuentra en caché, lo devuelve desde ahí
        if (response) {
          return response;
        }
        // Si no, va a internet a buscarlo
        return fetch(event.request);
      }
    )
  );
});