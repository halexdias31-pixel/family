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

- `js/check-finder.js` (fast, in `--fast`): parses every file in `js/` other than find.js and the checks
  with acorn and fails on any hand write of a finder's question — `STUFF`/`RES_ST`/`F.st` `.q` and `.filters`
  by dot, bracket or computed key; the chips array changed in place (push, splice, `[i] =`, `.length =`); a
  chip changed (`f.value =` in a `forEach` over the chips, or through `.find`); `F.st` or `STUFF` replaced
  whole; `Object.assign`/`Reflect.set` on any of them. Aliases are followed through `const`/`let`,
  assignment, `for…of` and a list callback's parameter (`finderStates_().forEach(st => …)`), scope by
  scope. It fails if `finderSet_` is gone, a file does not parse, or fewer than 20 files were read.

  **The first version matched lines with a regex and missed the one write that was really there**:
  `signedOut_` (me.js) cleared `st.q`/`st.filters` on each of `finderStates_()` by hand, so a switch from one
  person to another (`signedIn_` → `signedOut_({ quiet: true })`, which skips `repaint`) left the box saying
  the last person's words over an empty question. The review also got past it with an alias
  (`const st0 = FINDERS.stuff.st; st0.q = …`), `Object.assign`, `filters[0] =`, `STUFF['q']`, a replaced
  `F.st`, a chip changed in `forEach`, and a write on a line after a string holding `//` or `/*` (the comment
  blanker read `accept="image/*"` as a comment's start). `signedOut_` now calls `finderSet_(F, { paint:
  false })` for each finder and sets only `whose` by hand. Proved: the old me.js → red at me.js:408, and each
  of sixteen shapes appended to cards.js → red; `Object.assign(STUFF, { admit })` and an unrelated
  `o.st =`/`o.q =` stay green; `finderSet_` renamed → red; an unparseable file → red.
- `check-flow`, "signing in over somebody else …": types in Find and Find 2, sets a chip on each, signs a
  second person in over the first; both finders' words and chips and both boxes must be empty. Red on the
  old me.js (the stuff box still said "fractions"), green now.
- `check-flow`, "a door into Find from a card …": types "fractions" in Find, then presses Book this, take a
  seat and Practise in turn; each must leave Find in front, the words and box empty, its own chip, and
  something past the question page. Red on the old cards/receipt code (words and box kept), green now.
  Practise already cleared its words before; it is there so it cannot start keeping them.
- `check-funnel` section 7, **random funnels** (seeded LCG, `FUNNEL_SEED`, `FUNNEL_RUNS`, default 80
  walks of up to 14 steps; `FUNNEL_ONLY=walk` runs it alone, about three minutes, and says so in its OK
  line): the memo holds what `stuffFind` gives afresh, in the same order;
  no facet is asked twice; the count on every answer equals what narrowing by it gives, and the pressed
  answer's count equals the list after the press; Doesn't matter never changes the list; a typed word never
  widens it and keeps the item it was read off. Proved by three mutations of find.js (an answer's count +1
  on Level; a Level Doesn't-matter chip treated as a filter; `nextFacet` forgetting what was asked) — each red.

## The order of a list depended on the path to it

The walk first found the memo and a fresh filter holding the same items in a **different order** (five steps
in the default walk, e.g. the Library chip, then "length"). `stuffFind` puts the content cards a search
names first (`stuffLead_`), but `stuffFiltered`'s incremental path only narrowed the previous list, so a
word typed after a chip never brought its named card to the front, while the same word typed first did. The
incremental path now goes back to the library's order (`stuffKeyCmp_`, on the cached `_sk`) and leads by
the current words whenever there are words now or were before. Order is now part of the memo invariant
(`order`); removing that line turns the walk red with those five steps.

## Not touched

The audit's finding 2 (`spellKey_` of an all-punctuation value is `''`). The walk passes through
`level=KS3–GCSE`, a range kept as one tag, against owner decision O1; that belongs to the package that owns
levels.
