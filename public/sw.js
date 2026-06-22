// Offline-first service worker.
// App shell (HTML + hashed Vite bundles) cached on first visit → works offline.
// Open-Meteo API responses also cached so the last-seen weather/wind is shown
// when there's no internet (useful on the beach at Ringkøbing Fjord).

const CACHE = "kite-paklijst-v3";
const PRECACHE = [self.registration.scope]; // index.html entry point

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate for all cacheable GET requests.
// Covers both same-origin Vite assets AND Open-Meteo API calls.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith("http")) return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isOpenMeteo =
    url.hostname === "api.open-meteo.com" ||
    url.hostname === "archive-api.open-meteo.com" ||
    url.hostname === "marine-api.open-meteo.com";

  if (!sameOrigin && !isOpenMeteo) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      // Return cached immediately while updating in the background
      return cached || network;
    })
  );
});
