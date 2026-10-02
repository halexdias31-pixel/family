## "It shows old reels, then I hard refresh and it works" — the worker was serving the whole old site

**The service worker decided what a navigation was from its PATHNAME**:

```js
if (url.pathname === '/' || /\/index\.html$/.test(url.pathname)) return e.respondWith(page(req));
```

**GitHub Pages serves a project site from `/family/`**, which is neither. So every navigation fell
through to `file()`, whose first act is to serve an exact URL match with no network at all — and the
entry point is the **one** URL that carries no deploy stamp, so it matched itself for ever. `LOAD`
lives inside that file and names every other file's URL, so once the old `index.html` was being
served, all twenty-five scripts and the stylesheet were exact hits too. **The whole old site,
permanently, escapable only by a hard refresh.**

**`page()` was correct and was never the function being called.** Its own comment says a stale copy
of `index.html` *"would pin the whole app to an old deploy and this worker would keep it there for
ever"*. It was right about the consequence and wrong about who would cause it.

**The browser says what a navigation is; a pathname is a guess about where the site is deployed.**
`req.mode === 'navigate'` needs no knowledge of the deploy path, and the `index.html` suffix stays
for a URL somebody types out.

**`family-1` → `family-2`.** The poisoned entry is inert once navigations go to `page()`, and a store
known to hold a copy of an old deploy is still not a thing to leave on somebody's phone and reason
about. One cold visit each, once, for certainty.

### The lab's own base path is what hid it, and that is the whole lesson

**`check/load.js` serves the repository at `/`**, so `url.pathname === '/'` was TRUE on every run it
has ever made — and it measures **times and bytes**, both of which a stale load flatters: serving
yesterday's site from the cache is fast and free. Four green checks and a hundred and four UI
combinations, and the app was a deploy behind for everybody.

**`node check/deploy.js` asks the one question neither can**: after a push, does the browser run the
NEW code. Nothing about milliseconds, nothing about bytes, so its answer does not move with what else
the machine is doing — which is why it is on the roster where `load.js` and `splash.js` are not.

**Three loads and two deploys, because a two-load version passed against the broken worker.** A
worker never controls the page that registered it, so load 1 is uncontrolled, load 2 is the first the
worker sees — and the first chance it has to file the entry point away — and **load 3 is the first
that can be answered out of what load 2 filed**. My first probe stopped at two and reported OK.

**And a new tab per load, not `goto` twice.** Chromium treats a navigation to the URL already in the
address bar as a RELOAD, whose request carries `cache: 'no-cache'` — so the harness was measuring a
case nobody is in. *"When I first go on site"* is a fresh navigation: a bookmark, a home-screen icon,
a tapped link.

**It runs at BOTH base paths**, because the fault was base-path-dependent. The mutation shows it
exactly: put the pathname guess back and `/family/` fails while `/` passes.

### The other half was reverted, because it could not be shown to do anything

`sw.js`'s header says `index.html` *"is served `no-cache` on purpose"*. **Nothing in this repository
sets that header** — Pages decides it — and `index.html`'s own prose has always assumed the worse
answer. So `fetch(req, { cache: 'no-cache' })` went into `page()` to ask the origin whatever the
browser's freshness lifetime says.

**Measured, it made no difference**: `check/deploy.js` passes with it and without it at both base
paths, and a plain `fetch` of the entry point inside a `max-age=600` was observed reaching the
network anyway. So it is not there. **Two rules changed on a measurement nobody had taken is what
`.mat-out` and `.fm-out` cost this project**, and one extra conditional request on every warm visit is
a real price for an effect nobody could produce. What the live headers actually say is a `curl -I`
away and unreachable from here — every host but GitHub is blocked — so it is written down rather than
guessed at, with the line to change if the fault ever returns on a site `check/deploy.js` says is
fine.
