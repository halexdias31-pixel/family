# 447 — Words ahead of the reader

**Asked (owner):** "it's an unpleasant experience using the questions… it only loads when you get to it when you
scroll down… I understand you don't want to load it all at once… figure out a better way."

## Measured first

A journey in `js/check-flow.js` ("words ahead", `LIB_MEASURE=lat,pace,turns,n` prints what it saw) boots the
app signed in, holds every `libItems` reply for `lat` ms, shows AQA 8462 June 2024 2F (83 rows) in Find and
turns a page every `pace` ms. Before this change (`LIB_AHEAD = 4` pages, asked only where a fill landed):

| Ledger latency, page every | calls (ids) | pages waiting when they came in front | page changed under the reader |
|---|---|---|---|
| 3000 ms, 150 ms | 2 (11/16) | 50 of 60 | 0 |
| 1500 ms, 200 ms | 2 (11/16) | 12 of 40 | 2 |
| 1500 ms, 600 ms | 3 (11/7/9) | 0 of 40 | 2 |

Two causes: the ask went out from `fillStuffPages`, which a quick reader reaches only on a bare page (the
after-slide fill never runs while the pages keep turning), and four pages is one or two cards. The "changed
under the reader" was a card whose words came before it was reached but whose pages were counted while it
waited: it became its stem page as it came in front.

## What changed

- **Asked in batches, ahead** (`libAhead_`, find.js): counted in cards, not pages. When fewer than `LIB_AHEAD`
  (10) cards from the one in front are whole or on their way, the next `LIB_AHEAD_BATCH` (24) go in one call
  (`libPump_` still splits at 60 ids, the backend's cap). On the question page, the first `LIB_AHEAD` cards
  once the typing has stopped (700 ms, as before) — the first screenful is whole before the first turn.
- **On every turn** (`goPage`, shell.js): `libAhead_` runs on every turn of a finder, not only after a slide.
- **Counted again off the glass** (`libLanded_`): when a batch lands and a card ahead that was counted waiting
  is whole, the finder is drawn again and the page in front is found again by its card and part
  (`libRepaintFinder_`), so nothing moves under the reader.
- **Kept on the device** (`libDisk_`, library.js): IndexedDB `family-lib`, one record per wire id
  `{ id, gen, who, at, item }`, at most `LIB_DISK_MAX` (800), oldest out. Read once a visit; what it holds for
  this person and the Ledger's generation is merged before anything is asked (`libFromDisk_`). Every step is in
  try/catch; no IndexedDB is "nothing kept".
- **Generation, not the session counter:** `LIB.gen` counts merges on this phone (it keys `CHUNK_MEMO`, 432) and
  so cannot key a device copy. The backend's own `libGen_()` (bumped by every import, already the key of its
  CacheService copy) is now sent as `libGen` by doGet and as `gen` with every `libItems` reply. A record of another
  generation is never read and is dropped; a reply of a newer one drops the rest. Merges still go through
  `libMerge_`, so `LIB.gen` moves and the page plans are cut again — the blank-card fix (432) holds.
- **Signed out, the device forgets** (`libDiskClear_` from `libForget_`).
- The daily cap (400 items, `LIB_DAILY_CAP`) now pays for up to 24 cards not yet looked at; a device hit costs
  nothing.

Not used: an IntersectionObserver. Find's pages are placed by transforms (`placeCells`), so "two screens
ahead" is a page count from `PAGE`, which `goPage` knows on every turn.

## After

| Ledger latency, page every | calls (ids) | pages waiting in front | changed under the reader |
|---|---|---|---|
| 3000 ms, 150 ms | 2 (11/26) | 0 of 60 | 0 |
| 1500 ms, 200 ms | 2 (11/26) | 0 of 40 | 0 |

Second visit with the device copy: no call for anything kept, first cards whole before scrolling.

## Checks

- check-flow "words ahead … (447)": the first 8 cards whole before scrolling, no page waiting in front, nothing
  changing under the reader, at most a call per four turns, never over 60 ids.
- check-flow "words on the device … (447)": a stand-in store; a second visit asks for nothing the device holds;
  a new `libGen` asks again and drops the old records; sign-out empties it. Mutated (generation ignored) it fails.

## Deploy

Front end by push. Backend (`libGen` in doGet, `gen` on `libItems`): versions `2026-10-25-lib-prefetch`, the
usual Deploy → New version. Until then the phone has no generation and keeps nothing on the device: prefetch
still works.
