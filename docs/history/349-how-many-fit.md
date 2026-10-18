## How many fit? Division as measuring, drawn — on a KS2 Maths card, written by a script, and held to its own sums

**The owner, 12 Oct:** *"also i need an animationj to add to content cards. for the kids to see what i
mean when i say how many 3s fit into 4 or how many of x number fits into y number."*

### What it teaches

"How many 3s fit into 4" is division as **measuring** (quotition): lay copies of the divisor along the
dividend and count them. The copy that does not fit whole is the remainder, and the part of it that does
fit is the fraction — 4 ÷ 3 = 1 remainder 1 = 1⅓. The same picture is why dividing by a quarter makes
more: four quarters fit into 1. The owner tutors Years 5–6 and GCSE; this is for the younger ones, with
no sound and nobody talking, so the picture has to say all of it.

Four examples on one 36 s loop, the owner's first:

| | what happens | ends on |
|---|---|---|
| 4 ÷ 3 (10 s) | one 3 lands and is counted **1**; the next lands as a whole 3, its "3" fades, the part past the dashed wall turns red under **too far**, then is cut to a dashed ghost and **⅓** is named over the part that fits | *One and a third 3s fit into 4* · 4 ÷ 3 = 1⅓ |
| 12 ÷ 3 (8 s) | four 3s, counted 1–4; the end of the bar lights gold | *Exactly four 3s fit into 12* · 12 ÷ 3 = 4 |
| 7 ÷ 2 (10 s) | three 2s, the fourth overhangs, too far, cut to **½** | *Three and a half 2s fit into 7* · 7 ÷ 2 = 3½ |
| 1 ÷ ¼ (8 s) | four quarters on a bar marked 0, ¼, ½, ¾, 1; gold end | *Exactly four quarters fit into 1* · 1 ÷ ¼ = 4 |

Blue is the divisor (the thing laid down), gold the answer (count, fraction, exact-fit end line, the
answer in the sentence and the sum), red is too far — `var(--coral)`, the app's own red for wrong. The
blue `#6fa8dc` is this drawing's own and is defined on `.an-fit`, as `cent`'s and `area`'s are.

With less movement asked for, the base styles are the still: the whole first example's answer — the bar,
the one 3 under its gold 1, the third that fits under its gold ⅓, the dashed ghost of the other two
cells, the sentence and 4 ÷ 3 = 1⅓.

### How it was chosen

Three prototypes were built and judged — a bar model, a number line with hops, counters scooped into
groups. The bar model won and took five things from the others:

- **A 3 has three parts from the moment it lands** (from the counters' dashed places): every block is
  its cells, divided top to bottom in a darker line, so the ghost's "one of three cells solid" is
  something the child has already seen.
- **Type sizes at 320 as a floor**: nothing under 11 units in a 240-unit drawing — 11.2px in the 244px
  card at 320. The bar's numbers were 8.8px and the quarter inside each block 7.9px in the prototype.
- **"too far" in red** over the overhang while it is red, fading with it (from the number line).
- **The quarter marks under the bar as stacked fractions**, 1 over 4 built by hand — the font's ¼ glyph
  is a speck at this size — and the ¼ inside each block raised to 10.8.
- **"Exactly four quarters"**, so the two exact fits read as a pair.

And four faults of the winner were fixed:

- **The overhanging copy's label split blue and red.** The 2 of 7 ÷ 2 sits on the wall itself, and it
  faded out *while* the red faded in. Now the label goes first (1.0 s after landing in the first example,
  0.8 s in the third), and only then does the red come.
- **Blocks blinked in.** The drop now fades in over 0.3 s and settles by 0.6 s.
- **Drawn on bare black.** Looked at in the real card, on the pane's `rgb(16 16 16)`: the bar is a tenth
  of paper with its edge at .6 and its units at .4, and the ghost's dashes at .9 — all plainly there.
- **9.6 KB of coordinates written by hand would have been unmaintainable**, so it is a script (below).
- **A 2-block showed two stubs, not two cells.** Its "2" sat on its own divider, haloed in blue so the
  line stopped at the digit — so the one thing the picture is about, the cells, was what a 2-block did
  not show. Now every divider runs the block's full height and nothing is written over one: a label sits
  in the middle cell, or, with no middle cell, the one left of it. The dividers are a shade lighter than
  the black seam between two copies (.55 at 1.1, against a 1.4 gap), so one copy's cells are never
  counted as copies. And `fit.py` asserts that the red starts only once the label's half-second fade is
  over, in every example (it overlapped by 50 ms in the third).

### THE CARD ZOOMED THE DRAWING TO 0.7, AND ONLY A SCREENSHOT SAID SO

The first look in the real app at 320 measured the card at **171px**, not 236, and every text in the
drawing at 7.8px — the same faults the type-size graft had just removed. Nothing in the drawing caused
it: `paneReach_` (find.js) draws a card taller than its pane smaller by CSS `zoom`, down to
`PANE_ZOOM_MIN` 0.7, and the animation's page carried its chapter's two key words and five worked lines
under it (`about`), 435px of them — a 756px card in a 507px pane. `check/anims.js` passed it, because a
zoomed drawing is still inside its card and still holds still.

**So `about` is `Measuring`** — the one key word that says, in words, what the picture is. The worked
lines stay on the chapter's own page, one swipe back. The card is 394px at 320 and 433 at 390; zoom 1 at
both. *A long `about` shrinks the drawing above it*; the chapter is the place for everything else.

### A SCRIPT WRITES IT, AND THE ROW WAS MADE ONCE FOR IT TO WRITE INTO

`tools/fit.py` computes every coordinate and timing and writes the whole root and every rule through
`tools/anim_row.py`, like the thirteen before it; `fit` is on `anim_row.py`'s WRITTEN-BY-A-SCRIPT line
and in CLAUDE.md's list, which is now fourteen. **Never edit the row's `html` or `css` by hand** —
`check-anims.js` re-runs the script on a copy and fails on any difference.

`anim_row.write_anim` only *replaces* — a rule or an element the row does not have is an error, by
design. So a new animation's row has to exist before its script can run. It was made once: the
KS2 rows appended with `html` and `css` set to exactly what the script's first run would write (its CSS
items normalised as `anim_row` normalises them), then `python3 tools/fit.py` run twice and the file
compared — byte for byte the same. A new rule added to the script later is added to the row the same
way, on purpose, and then the script is re-run.

**One clock, four shared keyframes.** Every moving part carries `--d`, a negative delay that puts its
keyframe's switch at the moment it should happen (`-((H − a) mod T)`, `H = T − HOLD`). It then holds for
`HOLD` = 10.5 s — past the end of its example — and snaps back while its example is hidden. The examples
cross-fade on four keyframes of their own (`--kf`, read by `animation-name: var(--kf)`, never an inline
`animation-name`, which would beat `animation: none`).

**Not in `check-splash-loops.js`.** That list asks that every keyframe's 0% and 100% match and that
nothing is dashed; the `--d` snap is at 100% → 0% by design (unseen, inside a hidden example) and the
wall and the ghost are dashed and never move. Joining it would mean rewriting both rules for one row.

### What holds it

- **`check-css.js` — the seamless-loop registry**, beside the coin, the sieve and Bayes: transform and
  opacity only, every animation infinite, reduced motion turning each off, no inline animation name —
  **and its own sentence**, read back from the markup: each example's question, the bar's last number,
  the sentence and the sum name the same two numbers; the sum is right; the sentence says the answer in
  words ("Exactly" only for a fit with nothing over); the gold count runs 1, 2, 3 … to the sum's whole
  part; and the first example is 4 ÷ 3. Proved by mutation on the real row, each restored and green
  after: "One and a half" for "One and a third"; 12 ÷ 3 = 5; a count of 1, 2, 7, 4; "fit into 9?" over a
  bar of 7; and the script run with 12 ÷ 3 first.
- `check-anims.js` (one row, one prefix, anchored CSS, the script is the source, the cache);
  `check/anims.js fit` (in its card at 320 and 390, inside it at six moments, still and stilled with less
  movement, in the chapter and on the splash); `check-textbooks.js` (the chapter's bones, its topics in
  the tree, `about` found in it).

### The KS2 Maths book, and what the parallel branch should know

Appended at the end of `data/textbooks.json` (three lines), so `fix-one-finder`'s rewrite of the file
can take them as they are:

- **Cover, `TB-KS2-MATHS` chapter 0**: title `KS2 Maths`; subject `Maths`; level `KS2` — the library's
  KS2 worksheets carry no level and `key_stage` `KS2`, and Find files them as `SATs` with Key stage
  `KS2`; `levelOf_` reads a level of `KS2` the same way, so the book lands beside them; **board and spec
  blank**.
- **Chapter 1**, `How many fit? Dividing by measuring`: topics `Division, Multiplying & Dividing
  Fractions` (both the library's own labels; the second because the card divides by a quarter); five key
  words (Dividend, Divisor, Measuring, Quotient, Remainder), three formulas and five worked lines, the
  four examples and a check by multiplying back.
- **The animation row**: `anim` `fit`, title `How many fit?`, about `Measuring`; and `How many fit?` in
  data/settings/splashes.json, kind `proof`.

`check-textbooks.js` required a board and a spec on every title page. A book for a key stage that ends
in no board's exam has neither, and a guessed one would be a wrong fact — so for a level of KS1, KS2 or
KS3 the two may be blank, and if one is filled both must be.

The 29 drawings now come to 186,471 characters of `SPLASH_CACHE_MAX` 200,000 (this one 13,224, the second largest after the Galton board's 24,026). A
failure there after a merge is a reason to slim this row — shared keyframes already, so shorter class
names next — not to raise the cap.
