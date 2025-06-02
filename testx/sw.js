const CACHE_NAME = 'testx-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index-mob.html',
  '/take-test.html',
  '/create-test.html',
  '/styles.css',
  '/scripts.js',
  '/take-test.js',
  '/take-test.css',
  '/create-test.js',
  '/create-test.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
          });
      })
      .catch(() => {
        // Return offline fallback if both cache and network fail
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
}); 