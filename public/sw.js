const CACHE_NAME = "dcn-opshub-cache-v1";

const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/icons/icon.svg",
  "/favicon.ico",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Service Worker pre-cache notice:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network first, fallback to cache for offline support)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Jangan cache request API auth / mutations / supabase
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan salinan ke cache jika respons valid
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Jika offline, cari di cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback untuk navigasi halaman
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }

        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      })
  );
});
