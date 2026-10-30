# 531 — The polish tokens and the measuring harness (package P0)

**Asked:** the owner wants the app to *"feel so stable, like iOS made it"*. Six lens audits (shift, touch,
motion, scroll, visual, states) were merged into twenty rules (U1-U20) and fourteen work packages; the owner
said yes to all sixteen decisions D1-D16 as proposed. P0 lands first: the shared tokens every later package
moves onto, and the instruments they prove themselves with. Nothing a person sees changes in P0.

## The tokens (style.css `:root`)

Defined once, adopted package by package:

- **Motion** — `--dur-press 0s`, `--dur-quick 120ms`, `--dur-enter 220ms`, `--dur-exit 180ms`, `--dur-move 280ms`,
  `--dur-mark 1.3s` (an information highlight, kept under reduced motion, D14); `--ease-out`, `--ease-in`,
  `--ease-spring`. The spring is `cubic-bezier(.2,.9,.3,1)` until the slide rebuild (527) is on this base and its
  spring can be written as `linear(…)`; one spring for the app, never a second. A new
  `@media (prefers-reduced-motion: reduce)` block zeroes the four movement durations and leaves `--dur-mark`.
  The blanket `* { … .01ms !important }` rule stays until package F replaces it.
- **Press** — `--press-small .96`, `--press-card .985`, `--press-wash`, `--press-wash-paper`, `--disabled .4` (D7).
- **Type** — `--fs-xs max(11px, .75rem)` up to `--fs-2xl`, `--lh-tight`, `--lh-body`, `--fw-title`.
- **Spacing** `--s1`-`--s6`; **radius** `--r-surface 14px`, `--r-pill`; **edge and colour** `--edge-surface` and
  `--shadow-1` (today's pane edge and shadow, written once), `--shadow-press`, `--on-gold`, `--toast-bg`.
  `--paper-faint` (D8) is package J's.

`--quick` is now an alias, `var(--dur-quick)`, until every use moves (plan section 2): one quick duration, 120 ms
for 130 ms, and zero under reduced motion. The tile's press wash was the one literal already equal to a new token
(`rgb(255 255 255 / .08)`); `check-css` asks for the token once it exists, so that line says `var(--press-wash)`,
the same colour. The review asked for it to be left to package E; reverting it makes `check-css` red, so it stays.

## `MOTION_` and `motionOK_()` (js/shell.js, beside `why_`)

`motionOK_()` is the one question a script asks before it moves anything. `MOTION_` reads the tokens as numbers
(ms) and curves, once the stylesheet has arrived (a getter, so a script loaded before the CSS still reads it;
until then the fallbacks are the same numbers). Under reduced motion the CSS zeroes the durations, so
`MOTION_.move` reads 0 with no second test. Placed outside the slide block, which 527 owns.

## The instruments

- **check/glass.js** — the shared harness: one server, one browser, visitors out / student / admin at 320, 390 and
  1280 (a touch screen below 768), every scenario module in a folder. A module returns findings, or `null` when
  it could not reach its subject (always a failure); `report: true` prints and never fails — where a figure not
  yet proven starts. A package adds a file in the folder and edits nothing shared.
- **check/steady.js** (STEADY_PORT) — layout shifts, a frame clock and every box's scroll offset. Scenarios:
  `idle` (a settled app untouched for 1.5 s shifts nothing, scrolls nothing, the card in front stays), `toast`
  (a message comes and goes and nothing moves), `landing` (report: shift from the payload until the app went quiet).
- **check/jank.js** (JANK_PORT) — long tasks and event timing. `quiet` gates a settled app at 500 ms; `quiet-50`
  reports the U4 50 ms figure until package H gates it.
- **check/touch.js** (TOUCH_PORT) — every control on the card in front and in the chrome, by kind, with the
  styles a press depends on. `flash` (no system tap flash), `delay` (a tap in the card's padding is a click within
  50 ms, phone widths), `kinds` (report: eased press-in, selectable words, callout per kind — package E's).
- **check/motion.js** — read, not run, so it is in `--fast`: distinct duration literals, distinct curves,
  transitions of a non-composited property, `transition: all`, keyframes moving a non-composited property, scripts
  writing their own duration, reduced motion asked outside `motionOK_`. A ratchet against
  `check/motion-baseline.json`: a count may fall, never grow; one that fell is said, and `--update` lowers it.
  It also counts every literal duration and curve written (not only distinct ones), so a new rule reusing an old
  `.2s ease` grows a count. First counts: 19 durations (30 written), 13 curves (76 written), 33 moved, 0 all,
  4 keyframes, 2 script durations, 3 reduced-motion asks.
- **check/states.js** — `family`, `staff`, `tutors`, `students`, `parents` are keys now (their `col:` states still
  land on them), each with *the last card*; `feed` has *offline* (the payload failing: what was drawn stays, no
  loader over it, no raw error); `stuff` and `res` have *the library failed* (the column draws, no loader waiting
  for ever). These hold today; package D tightens them to the failure card and Try again.

## What the first runs found

The settled app is clean when measured from 3 s after the payload lands. Inside those 3 s the reel neighbour
moves (shift 0.002 at 320, 0.019 at 1280, `#s-reel .page.soft`): that is `landing`'s report, package A's to gate.
At 1x a settled app still runs tasks over 50 ms (up to 244 ms, admin at 320) — `quiet-50`'s report, package H's.

## Settled means quiet, not three seconds

The review ran steady red 2 times in 4 at admin @1280: `#s-reel`, the reel neighbour, shifted 0.2-6.8 s after the
payload. Traced: the landing's `loadMessages` (shell.js `loadOnce_`) repaints the reel, whose YouTube poster
(`img.feed-poster`, i.ytimg.com, real network) lands seconds later and resizes its card. A fixed 3 s settle was a
coin toss. `open()` in check/glass.js now waits, after the settle, for 1.5 s with no layout shift, no `fetch` in
flight and every eager picture complete; a page that never gets there within 15 s of the payload fails. Twelve
runs of admin @1280 in a row green. The late reel shift itself is package A's (U1, U5): `landing` reports it.

## Proof

Each gate made red by a mutation and green again on the real files: a busy loop in the settled app (`jank
quiet`), a box that grows under the card in front after landing (`steady idle`), a tap flash on `.tile` (`touch
flash`), a viewport that allows zoom (`touch delay`), a box shifting every second (the quiet wait: never quiet, red), a box
shifting every 2 s (`steady idle` red behind the quiet wait), a new rule reusing `.2s ease` (`motion`'s use counts), and a new `transition: width .37s ease-in-out` rule
(`motion`).
