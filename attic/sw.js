/* @family. — sw.js — the worker that draws phone notifications and, once a paper is offline, opens the app with no connection (98). */

/* THE NETWORK FIRST, ALWAYS (98): a visit with a connection loads the current files; only a failed fetch is answered from the store. */
/* The store exists only once a paper is made available offline (offline.js makes it, sign-out empties it); any other store goes on activate. */
const OFF_CACHE = 'family-offline';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  try { const names = await caches.keys(); await Promise.all(names.filter(n => n !== OFF_CACHE).map(n => caches.delete(n))); } catch (err) { /* no stores to empty */ }
  await self.clients.claim();
})()));

/* OUR OWN GETS ONLY: the backend's requests and anything cross-origin go past untouched. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(offFetch_(req));
});
async function offFetch_(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok && await caches.has(OFF_CACHE)) {
      const copy = res.clone();
      caches.open(OFF_CACHE).then(c => c.put(req, copy)).catch(() => {});
    }
    return res;
  } catch (err) {
    const c = (await caches.has(OFF_CACHE).catch(() => false)) ? await caches.open(OFF_CACHE) : null;
    const hit = c && ((await c.match(req)) || (await c.match(req, { ignoreSearch: true }))
      || (req.mode === 'navigate' ? await c.match('index.html', { ignoreSearch: true }) : null));
    if (hit) return hit;
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
