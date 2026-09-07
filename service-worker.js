const CACHE = 'uabc-portal-v7-showcase-20260907';
const CORE = [
  '/', '/offline.html', '/manifest.webmanifest',
  '/assets/css/tailwind.css', '/assets/css/styles.css', '/assets/css/layout-fixes.css', '/assets/css/enhancements.css',
  '/assets/css/template-demo.css', '/assets/css/presentation-refinement.css', '/assets/css/showcase.css',
  '/assets/js/app.js', '/assets/js/enhancements.js', '/assets/js/showcase.js',
  '/assets/data/content.js', '/assets/data/search-index.json'
];

const isAppAsset = request => {
  const url = new URL(request.url);
  return request.mode === 'navigate' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.startsWith('/assets/data/') ||
    url.pathname === '/manifest.webmanifest';
};

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) ||
      (request.mode === 'navigate' ? (await cache.match('/offline.html')) : Response.error());
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then(async response => {
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || network || Response.error();
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(clients.map(client => {
      try { return client.navigate(client.url); } catch { return null; }
    }));
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isAppAsset(event.request)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
