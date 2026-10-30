/*
 * sw.js — maakt de app offline speelbaar.
 * Bij het eerste bezoek worden alle bestanden bewaard. Daarna start de app ook zonder internet.
 * Is er wel internet, dan wordt op de achtergrond de nieuwste versie opgehaald (zichtbaar bij de volgende keer openen).
 * Nieuwe versie uitgebracht? Verhoog VERSION, dan worden oude bestanden opgeruimd.
 */
const VERSION = "potjeshelden-v5";
const FILES = [
  "./", "index.html", "manifest.webmanifest",
  "css/style.css",
  "js/config.js", "js/art.js", "js/storage.js", "js/voice.js", "js/sync.js", "js/app.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Eerst uit de opslag (snel en offline), tegelijk op de achtergrond verversen.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !isFont) return;

  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then(res => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; })
        .catch(() => cached || (req.mode === "navigate" ? cache.match("index.html") : undefined));
      return cached || network;
    })
  );
});
