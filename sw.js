/* Norvegia Artica 2026 — service worker.
   Shell precaricata, meteo e font in cache con aggiornamento
   in background. Alza CACHE a ogni modifica dei dati. */

const CACHE = "vn2026-v8.5";
const SHELL = [
  "./", "index.html", "app.css",
  "data.js", "store.js", "ui.js", "weather.js", "extra.js", "views.js", "app.js",
  "manifest.webmanifest", "icon-192.png", "icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // meteo: rete prima, cache come rete di sicurezza
  if (url.hostname === "api.open-meteo.com") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // font: cache prima, si scaricano una volta sola
  if (url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // app: cache prima, aggiornamento silenzioso al passaggio successivo
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        }).catch(() => hit || caches.match("index.html"));
        return hit || net;
      })
    );
  }
});
