/* @family. — sw.js — THE WORKER, SWITCHED OFF (owner, 14 Nov): phone notifications and offline papers went to attic/ (the old worker is attic/sw.js). */
/* A phone that registered the old worker fetches this one on its next visit; it empties every store, unregisters itself and reloads its open pages from the network. No fetch handler, so nothing is ever answered from a store. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  try { const names = await caches.keys(); await Promise.all(names.map(n => caches.delete(n))); } catch (err) { /* no stores to empty */ }
  try { await self.registration.unregister(); } catch (err) { /* already gone */ }
  try { const wins = await self.clients.matchAll({ type: 'window' }); wins.forEach(w => { try { w.navigate(w.url); } catch (err) { /* a page that cannot be moved keeps going */ } }); } catch (err) { /* no pages */ }
})()));
