/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { lessonCachePath, publicLessonResponse } from "./lib/cache-policy";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: { url: string; revision: string | null }[];
};
const lessonsCache = "gitneapig-public-lessons-v1";
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
clientsClaim();
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html"), {
    denylist: [/^\/api(?:\/|$)/, /^\/uploads(?:\/|$)/],
  }),
);
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin && lessonCachePath(url.pathname),
  new NetworkFirst({
    cacheName: lessonsCache,
    // Only positively marked public content enters this cache; Cookie must not split it.
    matchOptions: { ignoreVary: true },
    plugins: [
      {
        cacheWillUpdate: async ({ response }) =>
          publicLessonResponse(response) ? response : null,
      },
      new ExpirationPlugin({ maxEntries: 12, maxAgeSeconds: 7 * 86400 }),
    ],
  }),
);
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/"),
  new NetworkOnly({ fetchOptions: { cache: "no-store" } }),
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
  if (event.data?.type === "PURGE_PRIVATE")
    event.waitUntil(
      (async () => {
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          for (const request of await cache.keys()) {
            const path = new URL(request.url).pathname;
            if (!path.startsWith("/api/") && !path.startsWith("/uploads/"))
              continue;
            const response = await cache.match(request);
            if (
              name !== lessonsCache ||
              !lessonCachePath(path) ||
              !response ||
              !publicLessonResponse(response)
            )
              await cache.delete(request);
          }
        }
        event.ports[0]?.postMessage({ purged: true });
      })(),
    );
});
