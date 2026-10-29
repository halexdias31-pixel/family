# 522 — one writer of a finder's question (R1), and the funnel's invariants walked at random

**Found by** the finder audit (funnel finding 1): Find's chips were set by hand from three other files —
`book-with` (cards.js), `job-take-seat` and `job-join` (receipt.js) — and Practise (arcade.js) did it with
its own copy of the box-clearing lines. The first three set `STUFF.filters` and left `STUFF.q` and the box
alone, so a word typed in Find before pressing **Book this** stayed under the new `Booking` chip: the box
still said "fractions" and the results under the booking form were filtered by it.

## The rule

`finderSet_(F, { filters, q })` in find.js, next to `inFinder_`, is the one writer of a finder's question
from outside: it binds `F`, clears a pending typing timer, sets the chips (copied) and the words (`''` when
not given), writes `F.id + '-q'`, and paints — `paintStuff()` without `keepPage` puts the column back on its
question page. `paint: false` exists only for a caller that must count before it shows (Practise falls back
to the question last got wrong when its topic finds nothing).

Inside find.js, the Bible's `bible-go`, `finderOpen_` and `findPlaceBack_` (the place kept from last time)
call it too. What stays hand-written there is the typing handler (it IS the box), `filter-clear` (clears the
chips and keeps the words, by design) and `finderWalk_`'s working state.

## The checks

- `js/check-finder.js` (fast, in `--fast`): no file in `js/` other than find.js and the checks assigns,
  pushes into or empties `STUFF|RES_ST|.st` `.filters`/`.q`; comments are blanked first. It fails if
  `finderSet_` is gone or fewer than 20 files were read. Proved: the old `cards.js` line put back → red;
  an appended `STUFF.filters.push(...)` / `FINDERS.res.st.q = ...` → red; `finderSet_` renamed → red.
- `check-flow`, "a door into Find from a card …": types "fractions" in Find, then presses Book this, take a
  seat and Practise in turn; each must leave Find in front, the words and box empty, its own chip, and
  something past the question page. Red on the old cards/receipt code (words and box kept), green now.
- `check-funnel` section 7, **random funnels** (seeded LCG, `FUNNEL_SEED`, `FUNNEL_RUNS`, default 80
  walks of up to 14 steps; `FUNNEL_ONLY=walk` runs it alone): the memo holds what `stuffFind` gives afresh;
  no facet is asked twice; the count on every answer equals what narrowing by it gives, and the pressed
  answer's count equals the list after the press; Doesn't matter never changes the list; a typed word never
  widens it and keeps the item it was read off. Proved by three mutations of find.js (an answer's count +1
  on Level; a Level Doesn't-matter chip treated as a filter; `nextFacet` forgetting what was asked) — each red.

## Left as a note, not a failure

The memo and a fresh filter hold the **same items** but sometimes in a **different order** once words narrow
an already-narrowed list (`stuffFiltered`'s incremental path re-filters the previous order). Five steps in
the default walk; printed under WORTH A LOOK. The audit's finding 2 (`spellKey_` of an all-punctuation value
is `''`) is not touched here.
