// IACE Fotos de Vistoria — service worker (funcionamento offline)
const CACHE = 'iace-fotos-v1';
const ARQS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(e.request, { ignoreSearch: true }) || (e.request.mode === 'navigate' ? await c.match('./index.html') : null);
    // atualiza em segundo plano quando houver internet
    const rede = fetch(e.request).then(r => { if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await rede) || new Response('Offline', { status: 503 });
  })());
});
