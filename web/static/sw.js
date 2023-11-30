let CACHE_VERSION = 'v1'; // Initial cache version
const CACHE_NAME = `pwa-cache-${CACHE_VERSION}`;
const urlsToCache = ["/index.html", "/style.css", "/index.js", "defer.js", "/game.html", "/game.css", "/game.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => console.error("Error caching static assets:", error))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          return caches
            .open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            })
            .catch((error) =>
              console.error("Error caching dynamic assets:", error)
            );
        });
      })
      .catch((error) => console.error("Error fetching assets:", error))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => {
          // Update the CACHE_VERSION to trigger cache update
          if (name.startsWith('pwa-cache-') && name !== CACHE_NAME) {
            const [, cacheVersion] = name.split('-');
            if (cacheVersion !== CACHE_VERSION) {
              return true; // Clear old caches when CACHE_VERSION changes
            }
          }
          return false;
        }).map((name) => {
          return caches.delete(name);
        })
      );
    })
  );
});
