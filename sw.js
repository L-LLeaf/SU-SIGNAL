const CACHE = "su-signal-shell-v31";
const ASSETS = ["./", "./index.html", "./styles.css", "./cards.css?v=b11dcb8", "./engine.css?v=engine3", "./chat.css?v=chat13", "./app.js", "./cards.js?v=nickname1", "./engine.js?v=engine2", "./chat.js?v=chat12", "./profile.js?v=profile5", "./profile.css?v=profile2", "./style.js?v=style2", "./style.css?v=style1", "./notice.js?v=notice1", "./notice.css?v=notice1", "./cards.json", "./manifest.webmanifest", "./assets/player-default.webp", "./assets/su-default.webp"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith("su-signal-shell-") && key !== CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Prefer the newest deployed page/assets; use the local cache only when offline.
  event.respondWith(
    fetch(request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});
