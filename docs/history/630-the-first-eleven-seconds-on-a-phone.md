# 630 — the first eleven seconds on a phone

The owner, 2 Nov (N-1793561749787-31972, N-1793561754426-31172, N-1793581619944-96786): "Site looks bad on
arrival: widgets loading, empty, missing; wants a good first 11 seconds" — "when i arrive on the site
everything is loading and looks shit". An earlier try could not see it: a fast machine, a local fixture.

## Seen the way a phone sees it

`check/arrival.js`: 390x844, CPU 4x, slow 4G (150 ms, 1.6 Mbps), a cold cache, the fixture's payload 5 s
late, then a warm second visit. Frames at 0.5, 1, 2, 3, 5, 8, 11 s (`SHOTS=<dir> PREFIX=<name>`).

Before (two runs each, agreeing within 0.6 s):

| frame | cold | warm |
|---|---|---|
| 0.5–11 s | a black page, nothing at all; first drawn at 11.9 s | 0.5 s black; 1–5 s one set of dots |
| dots | — | at y 392 at 1 s, y 420 at 2 s: the wait itself jumped (the typeface arriving) |
| landed | 55 s | 8.6 s |

Why black: the head started `data/questions.json` (1 MB gzipped, 23 MB raw) and the other library tabs
alongside the 1.07 MB of code, on one 1.6 Mbps link. The code shared the wire with cards the opening screen
does not show. A `priority: 'low'` hint on those fetches changed nothing measurable (12.5 s).

## What changed

- **The library is asked for by boot.js once the first screen is drawn**, not from the head (`libraryRows_()`,
  `libraryExtraRows_()`, both memoised, so `load()` awaits the same promises). First drawn: cold 11.9 s → 8.6 s.
  Warm landed 8.6 s → 6.7 s.
- **The typeface is preloaded** beside the stylesheet, so the first words and the one wait are laid out once.
  The 28 px jump of the dots is gone.
- No splash, no markup wait in index.html (466, `check-loading`), no second loader: the one `loading_()` of
  the opening column is the whole arrival state, and `arrive_` (428) fades the column in where it stood.

## The check

`check/arrival.js` (slow, in check-all): no layout shift past 0.1 on either visit, and once `LOADED` nothing in
view is an empty `.widget/.card/.tile-row/.tile` or a `.loading`. "In view" is `elementFromPoint` on top, since
the columns are stacked and slid (placeCells); a rect test counted three parked panes' dots as showing.

## Still open

Cold, the payload lands at ~59 s because `loadOnce_` merges the whole library into `d` before it becomes
`DATA`: the feed, which reads no question, waits for 23 MB of cards. The next step is letting a column that
reads no library draw from the payload alone and merging the library after; it touches 546's promise that
Find's first answers never change, so it is its own change. A device copy of the payload stays ruled out (466:
private rows, stale).
