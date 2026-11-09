/* @family. — sw.js — the worker that draws phone notifications; it holds no files (98). */

/* PUSH ONLY (98, owner 9 Nov): no fetch handler, so every visit loads the current files; an old worker's stores are emptied on activate. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  try { const names = await caches.keys(); await Promise.all(names.map(n => caches.delete(n))); } catch (err) { /* no stores to empty */ }
  await self.clients.claim();
})()));

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
