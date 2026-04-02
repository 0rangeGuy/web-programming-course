/// <reference lib="WebWorker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = "todo-pwa-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.webmanifest"];

// Установка SW — кэшируем статику
sw.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      await sw.skipWaiting();
    })(),
  );
});

// Активация — очищаем старые кэши
sw.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const deletePromises = keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key));
      await Promise.all(deletePromises);
      await sw.clients.claim();
    })(),
  );
});

// Перехват fetch-запросов
sw.addEventListener("fetch", (event: FetchEvent) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // API запросы не кэшируем (они будут синхронизироваться через очередь)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Стратегия: cache-first для статики
  event.respondWith(
    (async () => {
      // Пытаемся получить из кэша
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Если нет в кэше — идём в сеть
      try {
        const networkResponse = await fetch(event.request);
        // Кэшируем успешные ответы
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        // Fallback для офлайн-режима
        const offlineFallback = await caches.match("/index.html");
        if (offlineFallback) {
          return offlineFallback;
        }
        return new Response("Offline - page not available", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }
    })(),
  );
  // В обработчике fetch, после проверки /api/
  if (url.pathname === "/api/todos" && event.request.method === "GET") {
    event.respondWith(
      (async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        try {
          const response = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
          return response;
        } catch {
          return (
            cached ||
            new Response(JSON.stringify({ items: [] }), {
              headers: { "Content-Type": "application/json" },
            })
          );
        }
      })(),
    );
    return;
  }
});
