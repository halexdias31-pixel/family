## The app downloaded itself again on every open

**Reported as "the loading when site is starting is also taking long".** Measured, gzipped, off a
server sending GitHub Pages' own headers, at 4× CPU throttling on a 1.6 Mbps link with 80 ms latency:

| | before | after |
|---|---|---|
| first visit | 1863 ms, 1059 KB, 31 requests | unchanged — nothing is in the cache yet |
| every visit after | **1537 ms, 1025 KB** | **473 ms, 346 KB, 1 request** |
| `?dev` | — | 1771 ms, 1060 KB — the publisher's door, still uncached |

**Nothing was ever cached.** `LOAD` was `Date.now()`, so every file was asked for as
`name.js?t=<a number that changes every load>` — a URL the browser has never seen — and all 25
scripts, the stylesheet and the library came down again from nothing on every single open.

**`index.html` already argues both sides of this at length and the argument is still sound.** The
clock was chosen deliberately, because the cost of a stale file falls on the PUBLISHER, who cannot
tell "my fix did not work" from "I am looking at yesterday's file", and that cost eleven hours once.
**What it quotes as the price is "about 230KB", and that number was measured before the library moved
into the repository.** It is 1025 KB now and it grows with every paper transcribed — the same shape
as "all 18 checks pass" and "one of the eighteen names": a number in a sentence nobody re-reads.

**The fix is not to pick the other side.** The two readers want different answers and can have them:

- **a visitor** gets `document.lastModified`, rounded to five minutes — when Pages last built the
  page, so it moves on a deploy and at no other time. Between deploys every URL is one they already
  hold; the moment you push, every URL changes at once. Nothing to remember, which is the whole
  point: a step that must be remembered is a step that will be forgotten.
- **the publisher** gets **`?dev`** back. It is a page no browser has a copy of, so the entry point
  itself arrives fresh — the one thing the version system cannot do for itself — and it dates
  everything by the clock so no file can be held. A link, not a setting: a parent opening the
  ordinary address gets the ordinary fast path.

**Still never cached, deliberately**: the payload (`cache: 'no-store'` — it is the database, and six
hours old is wrong) and `index.html` itself, which has no URL of its own to put a version on.

**One thing is not fixed and is not claimed to be.** `data/questions.json` still refetches on every
visit. It is requested with the same versioned URL as everything else and every script beside it
caches; `force-cache` made no difference and the container has 29 GB free, so it is not a cache-size
ceiling. Whether that is Chromium or the app is not established, so it is written down rather than
guessed at — and it is why the "after" row above says 346 KB rather than 0.

**The Find screen itself was already fast** and is not what the complaint was about: measured in the
browser at 4,007 items, `stuffItems` 0 ms memoised, a repaint 0 ms, a search 8 ms, a filter change
19 ms. The four-fold speedup recorded further down held.

### `node check/load.js` — and the slow visit was the one nobody had measured

**Reported again as "the website is kinda slow when loading it up on mobile... i dont want to get to
my clients house and get embarrased."** The section above is the last round of this and its numbers
had gone stale exactly as it predicted: it quotes the cost of never caching as "about 230KB",
measured before the library moved into the repository. So the first move was an instrument rather
than a fix — `check/load.js`, which opens the real site through a throttled phone (1.6 Mbps, 80 ms,
CPU at 4x) against a server sending GitHub Pages' own headers, and times **the app being on the
screen** rather than the `load` event.

| | app on screen | over the wire |
|---|---|---|
| **cold** — nobody has ever opened it | 5.5 s | 1,166 KB |
| **warm** — opened before, nothing pushed since | **0.6 s** | **0 KB** |
| **the first open after a push** | 5.4 s | 1,164 KB |

**The caching works and the middle row proves it.** What nothing had ever measured is the third row,
and it is the one the complaint is about: `LOAD` is `document.lastModified`, so a deploy changes
**every** versioned URL at once — twenty-five scripts, the stylesheet, a 370 KB library — whether or
not any of them changed. Push a fix in the morning and open the site at a client's house in the
afternoon and you pay for the whole site to explain one line of `find.js`.

**The server already knew the answer and nobody was asking it.** Pages sends an `ETag` with every
file. `sw.js` holds what it fetched, and when a URL changes it asks with the ETag it already has:
thirty files answer `304` and send no body at all. That is per-file versioning with **no manifest to
generate and no build step**, which are the two reasons it was not already done that way.

| after `check/load.js` | app on screen | over the wire |
|---|---|---|
| the first open after a push | **0.6 s** | **36 KB** — index.html, and 30 files answered "unchanged" |
| a push that really changed one file | 0.6 s | 43 KB, and the changed file served **new** |
| **no signal at all** | **0.5 s** | the app opens with the server switched off |

**It is not stale-while-revalidate and that distinction is the whole safety argument.** Nothing held
is handed over on a changed URL until the SERVER has said it is still current. The eleven hours this
project lost to "my fix did not work" versus "I am looking at yesterday's file" are exactly what
that rules out — proved by changing one file for real and watching the new body come back on that
load, not the next one.

### There was a service-worker purge, and it had been right until the moment it wasn't

**Four hours went into a worker that installed, took control, saw every request, cached every one —
and left a store holding a single entry.** Nothing threw, `controller` was set, every `put` reported
success, and the app worked perfectly. The one file that survived was always the same one, and it
was the one fetched last.

**`index.html` and `shell.js` each carried a `purge()` that unregistered every service worker and
emptied every cache, on every load.** Both were written deliberately and both notes are worth
keeping: a worker outlives a reload, a hard reload and on some browsers clearing history, and while
one is installed it can serve a file from months ago whatever the server sends — indistinguishable
from an edit not saving. `shell.js`'s ended *"This project has never deliberately registered one."*

**That sentence stopped being true, and nothing anywhere connected the two.** Every entry written
during the page's opening burst was deleted a moment later by a promise started before any of it;
`data/topics.json` survived because `library.js` fetches it after the purge has already run.

**The `shell.js` copy would have taken the live site down.** It called `location.reload()` on finding
a worker to remove — correct while a worker could only ever be somebody else's leftover, and an
infinite loop the moment the site installs one of its own: register at `load`, purge on the next
open, reload, register, purge. For every visitor, with the app never finishing opening. **No check
here would have caught it**; it was found by reading the file the first purge was in.

**What the purge protected is a link you can type now.** `?dev` was already the publisher's door —
it dates every file by the clock so nothing can be held — and it unregisters the worker and empties
the store as well. **At the top of `index.html`, not beside the registration at the foot**, because a
page is controlled by whatever worker was installed when it was NAVIGATED to: unregistering halfway
down leaves the publisher reading files handed over by the worker they were trying to be rid of.
One reload, only when there was something to remove, and it cannot loop because nothing re-registers
while `?dev` is in the URL. Measured after: `?dev` gives a page with no worker, no registration and
no cache, and the next ordinary visit has one again.

### The instrument was wrong three times before it was right, all in the flattering direction

Worth the space, because every one of them would have been believed:

- **`page.route` switches the browser's HTTP cache off** — for every request, not just the routed
  one. `check/load.js` registers one to stand in for the backend, so its first honest run reported
  the warm visit re-downloading all 1,176 KB and three identical rows: "the versioned URLs do not
  cache". Proved rather than argued — with one route the server sees 32 requests on the second
  visit, with none it sees 1. The backend is stubbed with `addInitScript` now.
- **`encodedDataLength` on `Network.responseReceived` is the headers only.** The next version
  counted it and reported 300 bytes for `find.js` and 9 KB for the whole app. The body's size
  arrives on `loadingFinished`.
- **A service worker's own `fetch` is a different CDP target**, so the page's `Network` events do not
  carry it and the post-deploy row came back "0 requests, 0 bytes" — the number the whole exercise
  was hoping for, about thirty conditional requests the instrument could not see. It counts at the
  socket now, which cannot miss one.
- **And `LOAD` buckets to five minutes**, so simulating a deploy by touching `index.html` changes
  nothing four times out of five. Two separate rows were reported as "0 KB after a deploy" for a
  deploy that had not happened. It moves the date an hour and reads the stamp back.

**It prints and it does not fail a build**, and is not in `npm run check`: timings move with the
machine, and a check whose answer depends on what else the container is doing is a check people
learn to ignore. `npm run load`, and a person reads it.

### Half of what a first visit downloads is English

**Measured, gzipped, and not fixed:**

| | shipped | of which comments |
|---|---|---|
| `style.css` | 161 KB | **129 KB** |
| the 25 files in `js/` | 566 KB | **~421 KB** |

**Seventy per cent of the raw JavaScript and sixty-seven per cent of the stylesheet is prose.** That
prose is the most valuable thing in this repository and this file opens by saying so — but the
browser throws every byte of it away, and it is 550 KB of the 1,166 KB a first visit pays for.

**It is left alone because removing it is a build step, and this project does not have one.** Blanking
each comment to newlines of the same count would keep every line number in a stack trace pointing at
the right line in the repo and takes the two files to 33 KB and ~145 KB — but something has to do
that between the repository and the phone, and a step somebody has to remember is a step that will
be forgotten. That is the argument `LOAD` is built on. **It is a decision for whoever owns the
deploy, not a fix to slip in**, so the number is written down here instead.

**The service worker does not help the cold visit and does not claim to.** It is registered after
`load` and a worker does not control the page that registered it.
