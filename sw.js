/* @family. — sw.js — the service worker REPORTED AS § */

/* THE NAME CARRIES A NUMBER so that a future version of this file can throw the old store away by changing it. § */
const STORE = 'family-2';
/* `family-1` HELD A POISONED KEY. § */

/* STRAIGHT TO ACTIVE, rather than waiting for every tab to close. § */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(n => n !== STORE).map(n => caches.delete(n)));
  await self.clients.claim();
})()));

/* THE STAMP IS NOT PART OF WHAT A FILE IS. § */
const pathOf = u => u.origin + u.pathname;

/* ---------- A VIDEO IS NOT A FILE, AND THIS WORKER BROKE THE FIRST ONE § */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.destination === 'video' || req.destination === 'audio') return;
  if (req.headers.has('range')) return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;          // the backend, and anything else
  /* THE BROWSER SAYS WHAT A NAVIGATION IS; A PATHNAME IS A GUESS ABOUT WHERE THE SITE IS DEPLOYED. § */
  if (req.mode === 'navigate' || /(?:^|\/)index\.html$/.test(url.pathname)) {
    return e.respondWith(page(req));
  }
  e.respondWith(file(req, url));
});

/* ---------- index.html: THE NETWORK IS THE TRUTH § */
async function page(req) {
  const store = await caches.open(STORE);
  try {
    /* ---------- WHAT WAS TRIED HERE AND COULD NOT BE SHOWN TO MATTER § */
    const res = await fetch(req);
    if (res && res.ok) store.put('index.html', res.clone());
    return res;
  } catch (err) {
    const hit = await store.match('index.html');
    if (hit) return hit;
    throw err;
  }
}

/* ---------- everything else: THE SAME URL IS FREE, A CHANGED ONE IS ASKED ABOUT § */
async function file(req, url) {
  const store = await caches.open(STORE);

  const exact = await store.match(req.url);
  if (exact) return exact;

  /* THE SAME PATH AT AN EARLIER DEPLOY. `store.keys()` is about thirty-five entries and this runs
     only on a miss, which happens once per file per deploy. */
  const keys = await store.keys();
  const was = keys.find(k => pathOf(new URL(k.url)) === pathOf(url));
  const held = was && await store.match(was);
  const tag = held && held.headers.get('etag');

  if (held && tag) {
    try {
      /* OUR OWN `If-None-Match`, AND `cache: 'no-store'` SO THE BROWSER'S CACHE STAYS OUT OF IT. § */
      const res = await fetch(url.href, {
        cache: 'no-store',
        headers: { 'If-None-Match': tag },
      });
      if (res.status === 304) {
        /* THE SERVER SAYS OUR COPY IS CURRENT. Re-file it under the new URL so the next visit is
           an exact hit and costs nothing, and drop the old key so the store does not grow by one
           entry per file per deploy for ever. */
        await store.put(req.url, held.clone());
        await store.delete(was);
        return held;
      }
      if (res.ok) {
        await store.put(req.url, res.clone());
        await store.delete(was);
        return res;
      }
      return held;                                   // a 5xx: what we have beats what it sent
    } catch (err) {
      return held;                                   // no signal
    }
  }

  try {
    const res = await fetch(req);
    if (res && res.ok) await store.put(req.url, res.clone());
    return res;
  } catch (err) {
    if (held) return held;
    throw err;
  }
}
