# 503 — Why it said "Still loading" after everything had arrived

Owner: "this keeps happening and it happens randomly like a misfire. the site not fetching everything."
The screen showed the `#boot-slow` box: "Still loading after 30 seconds. Code: arrived · Data: arrived ·
Files: 5977326".

## What the box was saying

- **"Files: 5977326"** was never a count. It printed `LOAD`, the cache-busting stamp
  (`floor(lastModified / 300000)`), which the box had borrowed as a "version". It changes once per deploy.
- **"Data: arrived"** meant `Object.keys(DATA).length > 1`, which is also true of the files-only fallback
  `filesOnly_` paints at 15 s. So "arrived" could mean the backend never answered at all.
- The box only asked `LOADED`, so anything that kept `load()` from finishing kept it up.

## The causes (reproduced in Playwright, 390px, fixture backend)

1. **The box never went away.** `load()` cleared it with `banner('')`, which hides `#banner` — a different
   element. A cold Apps Script that took 31 seconds left the box up for good over a site that had loaded.
   Intermittent because it needs a backend slower than 30 s: a cold instance, after `clearPayloadCache`.
2. **One hung library file held the boot for ever.** `libraryRows_` / `libraryExtraRows_` awaited
   `fetch` and `res.json()` with no deadline, and `load()` awaits them before the payload becomes `DATA`.
   With `data/textbooks.json` never answering: `LOADED` stayed false indefinitely, slow box up. The 60 s
   deadline covered only the backend's headers, not its body either.
3. **Two fetches of the same file.** `filesOnly_` (at 15 s) and `load()` each called the library loaders;
   the early promise had been consumed, so the second started a fresh 6 MB fetch.
4. **The service worker held replies hostage.** `file()` awaited `store.put` before returning, so every
   miss waited for its whole body to be written, and a full store (quota) turned a good reply into a
   network error. A revalidation of a file we already held had no deadline on a stalled network.

## The fix

- `bootLoaded_(true)` hides `#boot-slow`. The watchdog shows only while the code is missing or the
  backend has not answered (`window.PAYLOAD_IN`, set when the reply body is parsed), and says which in
  plain words — the failed script names, or "waiting for the server" — and no stamp.
- Library files: 20 s to answer, 90 s for the body (`libWithin_`); one in-flight ask shared by both
  callers. A failure is the existing `LIBRARY_FAILED` banner, not a hang. The backend body has 60 s too.
- `sw.js`: the store is written beside the reply (`e.waitUntil`), never before it; a revalidation with a
  copy to fall back on gets 15 s. Nothing is precached (it never was).

Lazy library data (bible, quran, talmud, works, icon masters, race map, e-ink) was already not fetched at
boot; the new check holds that. Bytes at first paint (gzip, fixture backend): 3.66 MB before and after —
1.86 MB of it is `data/questions.json`, which the funnel still needs at boot.

`check/bootslow.js`: a cold load fetches no lazy data; with `textbooks.json` hanging and
`practicals.json` 404 the boot finishes and the box never shows; a payload at 33 s takes the box down.
Reverting the three page files turns it red on all three.
