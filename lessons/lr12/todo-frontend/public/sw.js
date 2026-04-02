"use strict";
(() => {
  // src/sw.ts
  var sw = self;
  var CACHE_NAME = "todo-pwa-v1";
  var STATIC_ASSETS = ["/", "/index.html", "/manifest.webmanifest"];
  sw.addEventListener("install", (event) => {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(STATIC_ASSETS);
        await sw.skipWaiting();
      })()
    );
  });
  sw.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        const deletePromises = keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key));
        await Promise.all(deletePromises);
        await sw.clients.claim();
      })()
    );
  });
  sw.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(fetch(event.request));
      return;
    }
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const offlineFallback = await caches.match("/index.html");
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response("Offline - page not available", {
            status: 503,
            statusText: "Service Unavailable"
          });
        }
      })()
    );
  });
})();
