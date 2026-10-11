## The loading screen teaches: only the textbooks' animations, and a first visit is the name, still, with the one loader

**The owner, 10 Oct:** *"delete all animations for loading which dont come from text books or arnt
educational."*

### What the loading screen was

Two pools, mixed by one coin (docs/history/304). The **teaching** animations — 28 of them, Pythagoras,
the sieve, Bayes, the solar system — have lived since 8 Oct as rows of `data/textbooks.json` under the
chapter each teaches, and the splash draws them from the copy the last load kept (`splashSync_`). And
**thirteen inline splashes** were still written into `index.html` with their rules in `style.css`, a
row each in `data/settings/splashes.json`:

| id | what it was | kind in the sheet |
|---|---|---|
| `tag` | @family. sprayed on, a mist drifting behind it | brand |
| `led` | a 1974 amber readout warming up | brand |
| `torch` | a beam finding the name on a dark wall | brand |
| `tube` | a roundel and a train running four stations | brand |
| `ps` | columns of light rising on a dark plain | brand |
| `blocks` | a pixel runner bumping letters out of blocks (`tools/blocks.py`) | game |
| `box` | two eight-bit boxers in a ring (`tools/boxing.py`) | game |
| `ripple` | three rings leaving one point | calm |
| `tide` | seven columns rising a beat apart | calm |
| `dawn` | a sun rising and setting behind a line | calm |
| `breathe` | a ring that swells and settles | calm |
| `rain` | drops running down glass | calm |
| `pend` | a pendulum wave, seen end-on | calm |

None is in a book and none teaches anything — that was the reason each had been kept *out* of a book —
so all thirteen went. A first visit, which has no kept copy yet, could only ever draw one of them; so
the question the deletion leaves is what a first visit shows instead.

### What it is now

**THE POOL IS THE BOOKS' DRAWINGS AND NOTHING ELSE.** The picker in `index.html` has no inline list.
With a kept copy it draws one of the kept drawings the sheet has not retired; **if the sheet retires
every one of them it still draws one** — the "never a blank loading screen" rule as it was, because a
device that has the books is not to be shown less for a tidy spreadsheet.

**A FIRST VISIT IS STILL AND QUIET.** Nothing kept — a first visit, a cleared store, a copy given up for
a child's answer (`splashGiveWay_`) — and the splash is what the markup says: `#splash-still`, the name
`@family.` set plainly in the app's face and **not animated**, and under it **the app's one loader**,
the three gold dots every card waits with. The tag it replaces was the name being written on in 1.7
seconds with a mist behind it — a performance, which teaches nothing; the loader is the truth, which is
that the app is waiting. *"Every widget has unique loading look. They should all have a simplistic
simple loading thing"* (the owner, 9 Oct, docs/history/306): the loading screen is one more of those.

**A KEPT COPY THAT FAILS ITS CHECK IS THE STILL ONE TOO** — an index of another shape, a damaged record,
a hash that is not the index's, a record with no markup — where it used to fall back to an inline
splash. One more was added while here: **a record whose markup is empty, or is not one `an-` root**,
with its hash and index matching. `''` is a string, so it passed every test the picker had, and then
`el.firstElementChild` was the picker's own `<script>`: the signature was appended to the script and
`is-an` set over nothing — a black screen. The picker now requires the first element it inserted to be
an `an-` root, or it takes everything back out and drops the index.

**A TRY AGAIN SHOWS THE STILL ONE.** `splashOff_` took a drawn animation off after the fade and set
`is-tag`, so Try again (`splashOn_`) showed the tag. It sets `is-still` now — the name and the loader,
which is what a Try again is.

**THE LOADER IS `loading_()`'s, WRITTEN OUT.** The picker and the splash are parsed before `shell.js`
exists, so `index.html` cannot call `loading_()`; it carries the markup by hand —
`<div class="loading" role="status" aria-label="Loading"><span></span><span></span><span></span></div>` —
and `check-loading.js` holds that copy to what `loading_()` returns. The name is `aria-hidden`, because
`#splash-say` already says it out loud.

### The boxer cards kept their ring

The boxer cards in Find (`BOXER_GUARD`, `boxerRing_` in `find.js`) draw the ring splash's posts, ropes,
pads, mat, apron and gold fighter as the placeholder behind a photo, **painted by the splash's own `.bx-*`
rules**. So the ring's block was cut to exactly the classes `boxerRing_` writes, and nothing else:

- **KEPT**, each because the card draws an element with that class: `.boxer-ring { --bx-mat }` (the mat's
  colour; it was `.bx-ring, .boxer-ring`), `.bx-post`, `.bx-rope`, `.bx-rope-mid`, `.bx-pad-l`,
  `.bx-pad-r`, `.bx-mat`, `.bx-mat-edge`, `.bx-apron`, `.bx-apron-band`, `.bx-skin`, `.bx-eye`,
  `.bx-glove`, `.bx-band`, `.bx-boot`, `.bx-l .bx-hair`, `.bx-l .bx-trunks`, `.bx-r .bx-hair`,
  `.bx-r .bx-trunks`. They stand where the ring's block stood, under a header saying what they are for.
- **DELETED**, because only the splash drew them: `#splash-box`, `#splash-box .sp-sig`, `.bx-ring`,
  `.bx-gold`, `.bx-clapper`, `.bx-spk`, `.bx-pose`/`.bx-spark`/`.bx-ding`, the guard/jab/hit/duck pose
  rules, `.bx-l-go`, `.bx-r-go`, `.bx-bob`, the sparks, the bell, the ding, the reduced-motion block and
  all 14 `@keyframes bx-*`.
- **`tools/boxing.py` WENT.** Nothing runs or imports it but the splash: the card's guard paths were
  pasted from it once, by hand ("if the splash is regenerated, paste its new guard paths over these"),
  and with no splash there is nothing to regenerate. `find.js` says the paths are the card's own now.

Another branch (`fix-boxer-looks`) gives the cards a figure of their own under `.bf-*` and stops drawing
the `.bx-*` classes. When both are in, the rules kept here are the last of the ring and can go — the
header over them says so, and `check-css` will list them as styled and never produced.

### Where everything went

- `index.html`: the picker rewritten (no `kinds`, the still fallback, the root guard), the thirteen
  splashes' markup out, `#splash-still` in, `<div id="splash" class="is-still">`, and four comments that
  named the tag or the "two splashes above" brought up to date.
- `style.css`: every rule and keyframe of the thirteen — the tag, the hide list and its thirteen `.is-`
  rules, the readout, the torch, the tube, the columns, the blocks, the ring (less the card's rules), the
  ripple, tide and dawn, breathing, rain and the pendulum — out; `#splash-still` in (hidden, shown only by
  `#splash.is-still`, the name in `--paper`, nothing dressing the loader, which its own block does);
  `--css-version` bumped to `2026-10-11-the-loading-screen-teaches`.
- `data/settings/splashes.json`: the thirteen rows out. 28 rows, every one a proof or a tool, every one a
  row of `data/textbooks.json`.
- `js/shell.js`: `splashOff_` back to `is-still`; the comments that promised an inline splash say the
  still one.
- `js/find.js`, `js/settings.js`: comments that named the splash or `tools/boxing.py`.
- `tools/blocks.py`, `tools/boxing.py`: deleted.

### Weight

|  | before (a47d338) | after |
|---|---|---|
| `index.html` | 93 346 bytes, 31 886 gzipped | 72 900 bytes, 26 468 gzipped |
| `style.css` | 910 721 bytes, 303 623 gzipped | 850 840 bytes, 286 422 gzipped |
| `@keyframes` in style.css (`check-loading.js`'s count) | 57 | 8 |
| rules `check-css.js` reads | 2 543 | 2 055 |

The two files every load parses before anything is drawn lost 80 KB between them, 22.6 KB over the wire.

### The checks

Every check that measured or listed the deleted splashes was changed to the new rule, not skipped:

- **`js/check-css.js` §6** was "the hide list, the picker's list and the sheet's brand/game/calm rows are
  one list". There is no list now, so it holds that none comes back: the only `splash-` ids in
  `index.html` are the still one, `#splash-say` and `#splash-wait`; the picker has no `kinds` and sets
  only `is-an` or `is-still`, never `'is-' + pick`; the splash opens as `is-still`; every `#splash-` id
  and `#splash.is-` state the stylesheet names is one of those; only `#splash-still { display: none }`
  and `#splash.is-still #splash-still` say how the still one is displayed; and every row of
  `data/settings/splashes.json` is a proof or a tool. §8 asks that `#splash-still` names the app (and
  the picker still signs a drawing). §9 lost the blocks; the coin, the sieve and Bayes are rows.
- **`js/check-anims.js`**: the picker harness starts from `is-still`; the four bad copies must give the
  still one (they had to give an inline splash), and two more were added — markup empty, markup not an
  `an-` root, hash and index matching. New: a first visit is the still one whatever the coin says; with
  the real books kept, 64 answers of the coin draw 28 different drawings and nothing else; with all 28
  retired one is still drawn.
- **`js/check-loading.js`** §5 (new): the splash's loader is exactly what `loading_()` returns — the
  function taken out of shell.js by acorn and called — inside `#splash-still`, and the only
  `class="loading"` in the page. And `mb-spin`, accepted for the blocks' coin, went from
  `ACCEPTED_KEYFRAMES`, with a rule that fails on an acceptance whose keyframe is gone.
- **`js/check-splash-loops.js`**: the ring and its sentence (`boxOwn_`) out; the six on the list are rows.
- **`js/check-flow.js`**: the two splash journeys read the books' copy as the whole pool, and after the
  splash comes off it must be `is-still` with the name and the loader in it.
- **`check/anims.js`**: the splash half reads only the kept ids; new, **a first visit in a real browser**
  at 320 and 390, with motion and without: `is-still`, nothing drawn, no animation on the name and four
  frames of it identical, the loader `loading_()`'s own markup with its three dots moving (and still under
  reduced motion), the name on the screen and the loader centred under it. `--shots` writes
  `check/shots/splash-first-<width>.png`.
- **`check/splash.js`** (not in the suite) reads the kept pool only; **`check/load.js`**'s comment names
  `is-still`. `check/ui.js`, `check/states.js` and `check/deploy.js` named no deleted splash
  (`deploy.js` uses the kept Pythagoras, which stays) and are unchanged.

**Every new rule was mutated, seen red, and the real files seen green again — 23 mutations:** an inline
`#splash-tide` put back in the markup; a `kinds` list in the picker; `className = 'is-' + pick`;
`className = 'is-tag'`; the splash opening as `is-tag`; a `#splash.is-tide #splash-tide` rule; a rule
giving `#splash-still` its own `display: block`; the hide rule removed; the show rule's `display` removed;
a `calm` row added to the sheet; the still name without `@family.` (all `check-css`); a first visit drawing
`is-an`; `if (!pool.length) pool = anims` removed; a bad copy falling to another class; the root guard
removed; an extra non-book id in the pool (all `check-anims`); `role="status"` dropped from the splash's
copy; an attribute added to `loading_()` alone; a second `class="loading"` in the page; `mb-spin` put back
in the acceptances (all `check-loading`); `splashOff_` going back to `is-tag` (`check-flow`); the name
animated; the loader off centre (both `check/anims.js`).

### Seen in a browser

Chromium at 390×844: a first visit with empty storage and the backend silent is the name in cream on the
black and three gold dots under it, centred; a real load that read the books, then the next load with
every drawing but Pythagoras retired, is Pythagoras signed `@family.`; the next with nothing retired
drew Bayes; and a boxer card with its photo refused is the ring placeholder, posts, ropes with the red
middle one, gold and blue pads, mat, apron and the gold fighter in his guard, painted by the kept rules.

### Not changed

- **`CLAUDE.md`** says the teaching animations are "Never in `index.html` or `style.css`: those hold only
  the 13 splashes that teach nothing". The 13 are gone; that sentence wants updating by whoever keeps it.
- **`backend/constants.gs` and `backend/doget.gs`** carry comments about the splashes tab ("Twenty-nine of
  them", "proof, brand, game, tool", "all 26 rows active") that were stale before this and are staler
  now. Comments only, in the Apps Script copy; left for the next backend change rather than a deploy of
  comments.
- **`#splash-wait`** ("Still loading… the connection looks slow.", after fifteen seconds) is a sentence on
  the loading screen, and stays: it is said once, about the connection, under the loader rather than
  instead of it.
