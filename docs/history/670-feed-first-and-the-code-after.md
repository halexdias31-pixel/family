# 670 — feed first, and the code after the first screen

The step 630 left open. On `check/arrival.js` (390x844, CPU 4x, slow 4G, cold cache, payload 5 s late) the
screen was black until 8.75 s, and the feed came at 58.9 s: `loadOnce_` merged the whole library (1 MB
gzipped, 23 MB raw, plus 320 KB of content cards) into the payload before it became `DATA`.

| | before | after |
|---|---|---|
| JS before the first paint (gzip -6) | 1,068 KB, 62 files | 348 KB, 21 files |
| cold, first drawn | 8.75 s | 3.9 s |
| cold, feed drawn | 58.9 s | 9.0 s |
| cold, library in | 58.9 s | 64 s (Find waits for it) |
| warm, first drawn / landed | 1.8 s / 7.4 s | 0.8 s / 6.4 s |

## Feed first

- **The settings tabs are their own fetch** (`settingsRows_`, library.js), a few KB, and still go into the
  payload before it is `DATA`: the columns, words and facets never wait for the library.
- **Library already here** (warm, a retry, a fixture that answers at once): merged with the payload as before.
  **Not here yet:** the payload becomes `DATA` without it, `LIBRARY_LATE` is set, and `libraryLate_` (shell.js)
  merges it into the same rows when it lands, makes a new `DATA` proxy (so every memo keyed on `DATA` starts
  again), forgets the finders' found lists, repaints as a landing does, and only then runs `findPlaceBack_`.
- **546's promise:** while `LIBRARY_LATE`, `finderScreen_` draws one `loading_()` page and no menu, so Find's
  first answers are the library's. A library that failed says so in the banner when it is given up on.

## The code after the first screen

`window.LATER` (index.html) names files of `FILES` the first screen does not need: games, find, book,
collections, the question tools (keypad, board, answers, submit, qtools), the writings, the admin's layout and
records, the makers. They are not preloaded or written as `defer`; `laterFiles_` (data.js) appends them, in
`FILES`' order, right after the first `go()`, and the library is asked for only once they are in, so they never
share the wire with it. `load()` and `filesOnly_` await them before drawing anything from the payload.

- `boot.js` is still the last of the head's files; the LATER ones run after it. `node js/check.js` checks
  load-time reads in that real order (eager files, then LATER).
- Before they arrive a column whose drawer or helper is missing shows `loading_()` (`paint`: no drawer, or a
  `ReferenceError` while `!LATER_IN`), and is drawn again with the payload. `widgetsOf_` answers none without find.js.
- Kept eager: overworld (it declares `bootFailed`, which boot.js reads at load), me, posts, arcade, shell.

## The check

`check/arrival.js` now also fails on a page error, on a feed or library that never comes, on a cold first
paint over 5 s (`ARRIVAL_PAINT_MAX`), and cold, on a feed that is not drawn at least a second before the
library is in.
