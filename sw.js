/* ==================================================================================================
   @family. — sw.js — the service worker

   REPORTED AS "the website is kinda slow when loading it up on mobile… i dont want to get to my
   clients house and get embarrased." Measured with check/load.js on a throttled phone, the app has
   three different opening times and only one of them is slow in a way anybody can fix:

     cold, nothing cached           5.5 s   1169 KB   — a parent opening the link for the first time
     warm, no deploy since          0.6 s      0 KB   — the versioned URLs in index.html, working
     the first open after a push    5.4 s   1164 KB   — everything again, for a one-line change

   THE THIRD ROW IS THE COMPLAINT. `LOAD` in index.html is `document.lastModified`, so a deploy
   changes EVERY versioned URL at once — twenty-five scripts, the stylesheet and a 370 KB library —
   whether or not any of them changed. Push a fix in the morning, open the site at a client's house
   in the afternoon, and you pay for the whole site to explain one line of `find.js`.

   THE SERVER ALREADY KNOWS THE ANSWER AND NOBODY WAS ASKING IT. GitHub Pages sends an `ETag` with
   every file. A conditional request carrying the one we already hold gets back `304 Not Modified`
   and no body at all — so the thirty files that did not change cost headers and nothing else, in
   parallel, over one connection. That is per-file versioning with no manifest to generate, no build
   step to add and no step for anybody to remember, which are the three reasons it is not already
   done that way.

   AND IT CANNOT SERVE A STALE FILE, which is the half that makes it safe. This is not
   stale-while-revalidate: nothing cached is ever handed over on a changed URL until the SERVER has
   said it is still current. The eleven hours this project once lost to "my fix did not work" versus
   "I am looking at yesterday's file" are exactly what that rules out. If the server says 200, the
   new body is what you get, on that load, not the next one.

   THE WARM VISIT MUST NOT GET SLOWER, and that is why the exact URL is checked first. At 0.6 s and
   nothing over the wire it is already the good case; revalidating thirty files on every open would
   have traded the complaint for a new one. An identical URL is served straight out of the cache with
   no network at all — the URL carries the deploy stamp, so identical means identical.

   THE FIRST VISIT IS UNTOUCHED, deliberately. Registration happens after `load`, so nothing here
   competes with the paint that somebody is waiting for, and a worker does not control the page that
   registered it. Cold stays 5.5 s until the bytes themselves get smaller, which is a different
   piece of work — see the note in index.html about what is actually in those bytes.

   IT ALSO WORKS WITH NO SIGNAL AT ALL, which was not the point and may turn out to be the best part
   of it: a back bedroom in Merton with one bar is the place this app is used.

   WHAT IT WILL NOT TOUCH:
     - `index.html`. It has no version in its URL and is served `no-cache` on purpose — it is the
       one file that must be re-read every time, because it is what decides every other file's URL.
       Cached only as a last resort for a visit with no network at all.
     - the backend. `doGet` is the database and six hours old is wrong; it is another origin, and
       anything not on this one is handed straight to the network.
     - anything that is not a GET.

   AND THERE IS A DOOR OUT. `?dev` is already the publisher's door in index.html — it dates every
   file by the clock so nothing can be held — and it now unregisters this worker and empties its
   cache as well. A service worker you cannot get rid of is the worst object on the web, and the
   escape has to be one somebody can type from memory.
================================================================================================== */

/* THE NAME CARRIES A NUMBER so that a future version of this file can throw the old store away by
   changing it. Everything in the store is keyed by a URL that already carries a deploy stamp, so
   this is for changes to the STORE'S SHAPE rather than to the site's contents. */
const STORE = 'family-2';
/* `family-1` HELD A POISONED KEY. The entry point was filed under its own unstamped URL by the
   routing fault above, and while that entry is inert once navigations go to `page()`, a store
   that is known to contain a copy of an old deploy is not a thing to leave on somebody's phone
   and reason about. Renaming empties it on activate: one cold visit each, once, in exchange for
   certainty that nobody is still holding the build that caused this. */

/* STRAIGHT TO ACTIVE, rather than waiting for every tab to close. There is no old worker whose
   assumptions a new one could break — the store is keyed by full URL and a miss is a fetch — and a
   worker that waits is a worker that is still not running on the visit after the one that installed
   it, which on a site somebody opens twice a week means never. */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(n => n !== STORE).map(n => caches.delete(n)));
  await self.clients.claim();
})()));

/* THE STAMP IS NOT PART OF WHAT A FILE IS. `js/find.js?t=A` and `js/find.js?t=B` are the same file
   at two deploys, and the entire point of this worker is to find out whether they are also the same
   BYTES without downloading them to see. */
const pathOf = u => u.origin + u.pathname;

/* ---------- A VIDEO IS NOT A FILE, AND THIS WORKER BROKE THE FIRST ONE ---------------------------
   MEASURED, with the first reel served from beside the site through a range-capable server: the
   column drew three slides, ONE OF THEM ALREADY FALLEN THROUGH TO THE IFRAME, and the two videos
   sat at `readyState: 0` with nothing playing. Two separate faults, both this function's:

     `Range: bytes=0-`  -> 206 -> `store.put()` THROWS. A partial response cannot be cached, by
                           specification, and the throw is inside the try whose catch has no `held`
                           to fall back to — so it rethrows, `respondWith` rejects, and the element
                           reports an error. The ladder then takes that slide to Google's player.
     `Range: bytes=N-`  -> the conditional path answers 304 and hands back the WHOLE cached file to
                           a request that asked for everything after byte N. The measurement caught
                           this one outright: `304` against `bytes=0-3538943`.

   AND EVEN REPAIRED IT WOULD BE WRONG. This store holds about thirty-five files of code, and
   `store.keys()` is walked on every miss; a sixteen-megabyte clip in it is a cost paid by every
   visitor on every miss for a file only the Reels column ever asks for. A video wants the browser's
   own media stack, which streams it in pieces and keeps none of it.

   SO IT IS TWO TESTS RATHER THAN ONE, because neither covers the other. `destination` names what
   the element asking is — it catches the first request, which on some browsers carries no Range
   header at all. `range` catches everything else, whoever asked: a seek, a second buffer, an
   `<audio>` element nobody has written yet. Returning without `respondWith` is the whole fix —
   the request goes to the network exactly as it would with no worker installed. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.destination === 'video' || req.destination === 'audio') return;
  if (req.headers.has('range')) return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;          // the backend, and anything else
  /* THE BROWSER SAYS WHAT A NAVIGATION IS; A PATHNAME IS A GUESS ABOUT WHERE THE SITE IS DEPLOYED.
     `url.pathname === '/'` was that guess, and it is FALSE on this site: GitHub Pages serves a
     project site from `/family/`, which is neither `/` nor anything ending in `index.html`. So the
     entry point fell through to `file()`, whose first act is to serve an exact URL match with no
     network at all — and the entry point is the one URL that carries no deploy stamp, so it
     matched itself for ever. Every visitor was pinned to whichever build first filed it away, with
     `LOAD` inside it naming that build's URLs, so every other file was an exact hit too. THE WHOLE
     OLD SITE, and only a hard refresh escaped it.

     The comment over `page()` says a stale copy of this file "would pin the whole app to an old
     deploy and this worker would keep it there for ever". It was right. `page()` simply was never
     the function being called.

     AND THE LAB IS WHY IT SURVIVED: check/load.js serves the repository at `/`, so the guess was
     true on every run it ever made. `check/subpath.js` serves it at `/family/` and is what caught
     this — the same lesson as the fixture that could not hold a message. */
  if (req.mode === 'navigate' || /(?:^|\/)index\.html$/.test(url.pathname)) {
    return e.respondWith(page(req));
  }
  e.respondWith(file(req, url));
});

/* ---------- index.html: THE NETWORK IS THE TRUTH ---------------------------------------------------
   IT DECIDES EVERY OTHER URL, so a stale copy of it would pin the whole app to an old deploy and
   this worker would keep it there for ever. Network first, always. The cached copy exists for one
   case and one only: there is no network, and a site that opens with yesterday's content beats a
   site that does not open. */
async function page(req) {
  const store = await caches.open(STORE);
  try {
    /* ---------- WHAT WAS TRIED HERE AND COULD NOT BE SHOWN TO MATTER -------------------------
       THE HEADER OF THIS FILE SAYS index.html "is served `no-cache` on purpose". NOTHING IN THIS
       REPOSITORY SETS THAT HEADER — GitHub Pages decides it, and no Pages setting can change it.
       index.html's own prose has always assumed the worse answer ("push a fix, reload, and you can
       still be reading the index.html that names the old version of everything else") and called
       it the one manual clear.

       So `fetch(req, { cache: 'no-cache' })` was written here, to ask the origin whatever the
       browser's own freshness lifetime says. IT WAS THEN MEASURED AND MADE NO DIFFERENCE:
       `check/deploy.js` passes with it and without it, at both base paths, and a plain `fetch` of
       the entry point inside a `max-age=600` was observed reaching the network anyway. So it is
       NOT here. A rule changed on reasoning rather than on a measurement is what `.mat-out` and
       `.fm-out` cost this project twice, and one extra conditional request on every warm visit is
       a real price for an effect nobody could produce.

       WHAT IS LEFT UNKNOWN, rather than assumed: the live headers cannot be read from here —
       every host but GitHub is blocked by network policy — so what Pages actually sends is a fact
       one `curl -I` settles and nothing in this repository can. If the stale entry point ever
       comes back on a site that is NOT reproducing in `check/deploy.js`, this is the line to
       change, and the check is here to say whether it helped. */
    const res = await fetch(req);
    if (res && res.ok) store.put('index.html', res.clone());
    return res;
  } catch (err) {
    const hit = await store.match('index.html');
    if (hit) return hit;
    throw err;
  }
}

/* ---------- everything else: THE SAME URL IS FREE, A CHANGED ONE IS ASKED ABOUT --------------------
   THREE OUTCOMES AND THEY ARE THE THREE ROWS OF THE TABLE AT THE TOP:

     the same URL      -> the cache, no network at all. The warm visit, unchanged at 0.6 s.
     a changed URL     -> one conditional request. 304 means the bytes we hold are still right and
                          nothing but headers crosses the wire; 200 means they are not, and the new
                          ones are what is returned on THIS load.
     nothing cached    -> an ordinary fetch, stored on the way past. The first visit.

   A FAILURE FALLS BACK TO WHAT WE HAVE, and only after asking. If the request throws — no signal —
   the old copy is better than a broken page; if the server answers 500, the same. Neither is
   serving something stale over something current, because in both cases there is no current. */
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
      /* OUR OWN `If-None-Match`, AND `cache: 'no-store'` SO THE BROWSER'S CACHE STAYS OUT OF IT.
         The HTTP cache has never seen this URL — it is new by construction — so left to itself it
         would download the whole file to discover it already had the bytes. */
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
