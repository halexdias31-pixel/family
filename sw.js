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
  e.respondWith(file(req, url, e));
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
/* KEPT BESIDE THE ANSWER, NOT BEFORE IT (503): an awaited `put` held every reply until its whole body was in the store, and a full store turned the reply into a failure. */
function keep(e, store, key, res, was) {
  const job = store.put(key, res).then(() => (was ? store.delete(was) : null)).catch(() => {});
  try { e.waitUntil(job); } catch (err) {}
}
/* A REVALIDATION GETS 15 SECONDS WHEN THERE IS A COPY TO FALL BACK ON (503), so a stalled network never hangs a file we already have. */
function within(p, ms) {
  let t;
  return Promise.race([p, new Promise((u, no) => { t = setTimeout(() => no(new Error('slow')), ms); })])
    .finally(() => clearTimeout(t));
}

async function file(req, url, e) {
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
      const res = await within(fetch(url.href, {
        cache: 'no-store',
        headers: { 'If-None-Match': tag },
      }), 15000);
      if (res.status === 304) {
        /* THE SERVER SAYS OUR COPY IS CURRENT. Re-file it under the new URL so the next visit is
           an exact hit and costs nothing, and drop the old key so the store does not grow by one
           entry per file per deploy for ever. */
        keep(e, store, req.url, held.clone(), was);
        return held;
      }
      if (res.ok) {
        keep(e, store, req.url, res.clone(), was);
        return res;
      }
      return held;                                   // a 5xx: what we have beats what it sent
    } catch (err) {
      return held;                                   // no signal
    }
  }

  try {
    const res = held ? await within(fetch(req), 15000) : await fetch(req);
    if (res && res.ok) keep(e, store, req.url, res.clone(), null);
    return res;
  } catch (err) {
    if (held) return held;
    throw err;
  }
}

/* ---------- PHONE NOTIFICATIONS (492): FCM sends data only; this draws it, and a tap opens the site at the item. */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  /* FCM wraps what push.gs sent in `data`; a plain push is read as it is. */
  const m = Object.assign({}, d.notification || {}, d.data || d);
  const scope = self.registration.scope;
  e.waitUntil(self.registration.showNotification(m.title || '@family.', {
    body: m.body || '', icon: scope + 'icon.png', badge: scope + 'favicon.png',
    tag: m.tag || undefined, renotify: !!m.tag, data: { url: m.url || scope },
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    /* AN OPEN WINDOW IS TOLD WHERE TO GO, rather than a second copy of the app being opened. */
    const w = wins.find(c => c.url.indexOf(self.registration.scope) === 0);
    if (w) {
      w.postMessage({ pushOpen: url });
      return w.focus();
    }
    return self.clients.openWindow(url);
  })());
});
