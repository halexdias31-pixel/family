## 428 — What arrives where the dots were fades in (2026-10-24)

**Asked for as** "make the site look more professional with less stuttery movement e.g. on loading widgets; more
transitions so it feels smoother and less clunky."

### Measured first

A Playwright harness (kept out of the repo, like 401's) served the app with `check/fixture.json`, signed in as an
admin, at 390x844 (touch, 2x) and 1280x800, CPU 4x. The backend answered at 19s, so the splash lifted on the files
(`SPLASH_SAY_AFTER`, 15s) and the payload landed with the app on the glass, which is what a phone sees on the real
backend (15–45s, 317). Then every column was arrived at and one page turned on each. A second run held the builder
(`__aheadHold`, as check/load.js does) so every widget was still under its loader when its column arrived; a third
served the library as cards only and answered `libItems` after 900ms, then walked Find's first results. Images were
served 600ms late. It read, after the splash: Chrome's layout-shift entries; every painted frame, the box of
everything on the page in front measured against that page (so a slide does not count, and a box moving inside
its page does); each place where three dots were taken off; and each picture that arrived on the glass.

| after the splash | before, 390 | before, 1280 | after, 390 | after, 1280 |
|---|---|---|---|---|
| layout shift (Chrome's CLS entries) | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| boxes moving inside their page (frame reader, >2px) | 0 | 0 | 0 | 0 |
| visible dots → content, faded | 0 of 3 | 0 of 5 | 3 of 3 | 5 of 5 |
| visible pictures that took their time, faded | 0 of 2 | 0 of 2 | 3 of 3 (feed, 711–725ms) | — |
| builder held: layout shift | 0.0053 | 0.0278 | — | — |
| builder held: visible dots → content, faded | 0 of 6 | 0 of 47 | — | — |

The "after" columns with the builder held, and the library run, could not be finished: the machine was shared
with dozens of other check runs and Chromium was killed for memory on most attempts (see "The checks"); the
pictures were read by a smaller probe of the feed at 390. The fade is the same code whichever caller takes the
dots off, so what was measured for one holds for the rest.

**What it found.** Nothing much *moved* any more: 382 already holds a card where it will stay, and 306 holds a
veiled widget at its full size. What stuttered was **how things appeared**: every place the dots were replaced, the
content was simply there in the next frame — a hard cut from three dots to a full card — and every picture that
took its time popped in whole. And a wait of a few frames flashed the three dots on and off.

### What was built: one fade, in one place

- **`arrive_(el)`** (shell.js, beside `loading_`/`loaded_`) gives an element the class `arrive` for 700ms;
  **`.arrive`** (style.css) is `animation: arrive var(--arrive) ease-out both` with `@keyframes arrive { from {
  opacity: 0 } }`. Opacity only, so nothing is laid out again and nothing positioned inside it is disturbed (a
  transform would make `position: fixed` children relative to it for the length of the fade). Only `from` is
  written, so an element that is meant to sit at less than full strength ends at its own opacity. Taken off after
  700ms so a slot carried to another column later (`widgetsBack_`) is not faded a second time.
- **Three callers, and they are the only ways the dots go:**
  - `loaded_(el)` — a box drawn veiled (`aria-busy`) under the loader: what was under it fades in where it already
    stood. Every widget's start (`widgetUp_`), the business records, the Videos card, the calendar, the flyer maker.
  - `paint(id)` — a column drawn again over pages that were waiting (`waitingPages_` before, `arrivePages_`
    after): a page that was only the loader fades in whole; a page that was a card with the loader in it (a card
    whose words are in the Ledger, 397) fades in only what is new — its title and tags were already on the glass
    and are compared by their markup, so they stay put. A widget slot is left to `loaded_`: one carried across the
    redraw is running.
  - **one MutationObserver** (`arriveWatch_`) for every other `box.innerHTML = …` over a `loading_()`: a record that
    took a `.loading` away fades in what it put back. It looks only at a removed node that is itself the loader, so
    a column rebuilt wholesale costs it nothing.
- **A picture that took its time** (loaded more than 80ms after it was put in the page) fades in on its `load`; one
  from the cache is shown as it is, because fading it on every redraw would be a flicker. Every picture already
  had its box reserved (`aspect-ratio`, fixed sizes), so this is the appearance only.
- **The loader itself fades up after .12s** (`.loading { animation: arrive … .12s both }`, in the loader's block),
  so a wait shorter than that never flashes three dots and is gone.
- **Only what can be seen moves**, after 306: `.screen:not(.is-front) .arrive` runs no animation — the builder
  fills the other columns in the quiet, unseen (about 45 boxes at a landing) — while the pages either side of the
  card in front, which peek, do fade. `.page:not(.on) .loading` does not fade up, as its dots already do not
  pulse. Under `prefers-reduced-motion` neither fades: content is there at once, and the dots are the three still
  dots they were.
- **A pane that was only the dots** had no frame (306), so the whole pane fades in, frame and all, not only what
  is in it; and a pane redrawn from the dots to the dots again is not faded.

### Not changed

The layout — no box was given a new size, because none jumped. The page turns (401) and the sheet already move.
The two small layout shifts found, a neighbour page under the Shop's basket and the Business card settling by
15px, are on pages beside the one in front and were left.
