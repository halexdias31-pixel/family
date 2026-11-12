## The textbooks hold the teaching animations, and the loading screen draws its copy of them

**Since 10 Oct the chapters, and so the animations, play on the Resources column** ([329](329-the-second-finder-carries-the-resources.md)); `tbAnimWatch_` asks every finder's column, and `check/anims.js` turns to them there.

**The owner, 8 Oct**: *"Add the animations from loading to respective subject text books. Matter of
fact the source for the animations should be in text books. The animation from loading screen are
pulling and syncing from the text book animations."*

### What was wrong with where they were

Forty-one loading screens lived in `index.html` (markup) and `style.css` (rules and keyframes).
Twenty-seven of them TEACH — Pythagoras counted in unit squares, the sieve, Bayes with a hundred
people, standard form's point walking — and the only place any of them could ever be seen was the
two seconds before the app arrived, picked by a coin. A pupil reading the chapter on Pythagoras had
the best picture of Pythagoras in the app and no way to look at it. And the drawing existed in one
file that is not data: a chapter could not point at it, a sheet could not move it, and every byte of
all 27 was parsed on every load to show one.

### Where each one went

One row of `data/textbooks.json` each, **directly under the chapter it teaches**, which a check
holds (`check-textbooks.js`). `about` names the chapter's own words for what the picture shows —
section names (`Pythagoras`) or the opening of a worked point (`Exact values`) — and the chapter page
draws those words under it.

| animation | id | book | chapter | about |
|---|---|---|---|---|
| The sieve | `sieve` | GCSE Maths | 1 Number, factors and primes | Prime |
| Multiples | `mult` | GCSE Maths | 1 Number, factors and primes | Multiple |
| Index laws | `index` | GCSE Maths | 2 Indices, surds and standard form | Index laws |
| Standard form | `sf` | GCSE Maths | 2 Indices, surds and standard form | Standard form |
| Half, three ways | `half3` | GCSE Maths | 3 Fractions, decimals and percentages | Equivalent |
| Number line | `line` | GCSE Maths | 3 Fractions, decimals and percentages | Equivalent, On a number line |
| y = mx + c | `mxc` | GCSE Maths | 6 Straight-line graphs | Straight line, Gradient |
| Sine wave | `sine` | GCSE Maths | 7 Quadratic and other graphs | y = sin x |
| Odd squares | `odds` | GCSE Maths | 10 Number sequences | Square numbers |
| Triangle numbers | `tri` | GCSE Maths | 10 Number sequences | Square numbers |
| Fibonacci | `fib` | GCSE Maths | 10 Number sequences | Fibonacci-type sequence |
| Halves | `half` | GCSE Maths | 10 Number sequences | Geometric sequence |
| Clock | `clock` | GCSE Maths | 11 Ratio and proportion | Ratio, On a clock |
| Angles | `ang` | GCSE Maths | 13 Angles, polygons and constructions | Angle sum of an n-sided polygon |
| Protractor | `prot` | GCSE Maths | 13 Angles, polygons and constructions | Protractor |
| Angle at the centre | `cent` | GCSE Maths | 15 Circle theorems | Centre, Angle at the centre |
| Circle area | `area` | GCSE Maths | 16 Area and volume | Circle |
| Pythagoras | `pyth` | GCSE Maths | 17 Pythagoras and trigonometry | Pythagoras |
| Exact values | `trick` | GCSE Maths | 17 Pythagoras and trigonometry | Exact values |
| Coin flips | `coin` | GCSE Maths | 19 Calculating probabilities | Relative frequency |
| Venn | `venn` | GCSE Maths | 19 Calculating probabilities | Venn diagram |
| The mean | `mean` | GCSE Statistics | 8 Averages | Mean |
| Bayes | `bayes` | GCSE Statistics | 15 Probability | Conditional probability |
| Pascal | `pas` | GCSE Statistics | 16 Probability distributions | Binomial |
| Galton board | `gal` | GCSE Statistics | 16 Probability distributions | Binomial distribution, Normal distribution |
| Binary | `bin` | GCSE Computer Science | 3 Data representation | Binary |
| Sorting | `sort` | GCSE Computer Science | 8 Algorithms | Bubble sort, Insertion sort, Merge sort |
| The solar system | `orbit` | GCSE Physics | 12 Space physics | Solar system, A satellite in a circular orbit |

Maths chapter 3 had no word for "equivalent", which is the thing both of its drawings show, so it
was given one (`Equivalent — the same value written another way, such as ½ = 0.5 = 50% …`) in the
commit before the move, rather than pointing two drawings at a word the chapter does not say.

**The thirteen that are not teaching stay in `index.html`**: the brand (`tag`, `led`, `torch`,
`tube`, `ps`), the two games (`blocks`, `box`) and the calm ones (`ripple`, `tide`, `dawn`,
`breathe`, `rain`, `pend`). They belong to no chapter, and a first visit — with no copy on the
device yet — needs something to draw.

**The orbit was the fourteenth, and it was filed wrong.** It stayed as one of the "calm ones that
teach nothing", with "no words at all, which is also why they are not in any book" — and its own
comment said the opposite: each planet turns in its real period, T ∝ a^1.5, Kepler's third law,
"which is the solar system rather than a decoration of one". A law is teaching, by the rule this
move was made on, and GCSE Physics chapter 12 supplies the words the drawing lacked: "Solar system —
the Sun, the planets … orbiting it" and "[H] … a faster satellite needs a smaller orbit". It moved
in the review after the move (below). The tide (a travelling wave) stays calm: seven columns a beat
apart show "transverse" only to somebody who already knows the word, and the chapter's ripples on
water are not what it draws.

### The row

`book_id, chapter, anim, title, about, html, css, active`, in that order (`check-textbooks.js`).
`html` is the drawing's root, `<div class="an-<id>" aria-hidden="true">`, as it stood in
`index.html` less its comments and the `@family.` line. `css` is every rule that drew it, as it stood
in `style.css` less its comments, with `#splash-<id>` now `.an-<id>`. **Byte for byte otherwise**:
`anim-build/move.js` cut them out of the two files and wrote the rows, and nothing was typed. Every
rule is anchored on `.an-<id>` or on the drawing's own two-letter prefix (`py-`, `sv-`, `by-` …),
every `@keyframes` carries that prefix, and the only at-rules are `@keyframes` and
`@media (prefers-reduced-motion: reduce)`. That is what lets a row's CSS sit in `<head>` beside the
whole app and touch nothing else — and `check-anims.js` refuses a row that breaks it.

The comments did not go into the rows: a JSON cell is no place for six paragraphs of why. They are
below, every one, under the drawing they stood over — the archive this file ends with.

**The thirteen generators** (`tools/pyth.py`, `sieve.py`, `bayes.py`, `coin.py`, `venn.py`, `mxc.py`,
`area.py`, `cent.py`, `fib.py`, `galton.py`, `index.py`, `sine.py`, and `solar.py` since the orbit
moved) wrote into `index.html` and `style.css`. They write the row now, through `tools/anim_row.py`:
each item a script prints replaces its namesake in the row (a rule by selector, a keyframe by name,
markup by how its element opens), and an item the row does not have is an error. All of them leave
`data/textbooks.json` byte for byte as it is; a changed number in one of them changes its row.

**So for those thirteen rows the script is the source, and the row is its output** — `area bayes
cent coin fib gal index mxc orbit pyth sieve sine venn`. This said "change a drawing in its row, or
in the tools/*.py that writes it", which offered two sources for one drawing: `--py-a` changed by
hand in Pythagoras's row passed every check, and `python3 tools/pyth.py` then put the old colour back
without a word. `check-anims.js` now runs each script on a scratch copy of the books and fails if the
copy changes. For the other fifteen the row is the only source.

### The chapter page

After chapter n's page, one page per animation, `an<n>-<id>` (`pageParts_` in find.js): the book's
kicker, the title, the drawing, a **Play again** tile (a thing has tiles), and under it the chapter's
sections that `about` names, drawn by the chapter's own renderer. Searching "Galton board" finds the
statistics book.

- **Only the page in front plays.** Find keeps eleven pages filled, so a book with four drawings near
  the page you are on would run four animations nobody can see, and the one you swipe to would be
  half way through its story. `tbAnimWatch_` marks the stage in front `.is-on` and restarts it
  (`innerHTML = innerHTML`); every other stage is paused by `.tb-an-stage:not(.is-on)`.
- **One `<style data-anim data-h>` per drawing**, shared with the splash (`animStyle_`): a book
  opened while that splash is still fading finds its stylesheet already there, kept if the hash
  matches and replaced if the book's drawing is newer.
- **Each copy gets its own ids** (`animIds_`): the sine's fade, the Venn's clips and y = mx + c's
  clip are reached by `url(#…)`, and two copies of one drawing would be two elements with one id.
- **A card is narrower than the phone**, so every drawing also stops at the box it is in — in the
  commit before the move, proved with screenshots to change nothing on the splash.

### The sync, as built

The splash cannot fetch: it is picked while `index.html` is still being parsed, before any script
file or JSON exists. So the device keeps a copy, written by a load and read by the next.

- **`splashSync_` in `js/shell.js`**, after each load and after a files-only refresh. It walks
  `DATA.textbooks[].chapters[].animations[]` — `{ id, title, about, html, css, h }`, with `h` an
  FNV-1a hash of `html + NUL + css` worked out in `library.js` — and writes:
  - `splashAnim:<id>` = `{ h, html, css }`, **only when the hash changed**, so a load that changed
    nothing writes nothing but the index;
  - then any `splashAnim:*` key not in this load's list is removed (a drawing taken out of a book
    leaves the device);
  - then **`splashAnims`** = `{ f: 1, ids: [...], h: { id: hash } }`, **last**, so a load cut off half
    way leaves the old index pointing at records that are still whole.
  - **A write the store refuses (quota) gives the whole copy back** — the index and every
    `splashAnim:` key (`splashGiveWay_`) — and the splash draws an inline one until a load finds
    room. As built it left the refused one out and kept the rest, which evicted nothing and still
    sat in the last room on the device; see "After the review" below. The lot is capped at
    `SPLASH_CACHE_MAX`, 200 000 characters; the 28 come to about 173 000, and `check-anims.js` fails
    before the books outgrow it, so a drawing is never quietly left off.
  - **An empty or failed fetch of the books changes nothing.** `|| []` makes a missing file look like
    an empty one; an empty one must not clear a good copy.
  - `splashOff` (the sheet's retired splashes) is written here too, and only when
    `settings/splashes` actually arrived with rows — the early write that ran before the file had
    been read is gone, which is what let a retired splash keep coming back.
- **The picker** (the first thing inside `#splash`, ES5, no fetch): the pool is the 14 inline kinds
  plus the ids in `splashAnims` when its `f` is 1, less anything in `splashOff`. If the coin lands on a
  kept drawing, it reads `splashAnim:<id>`, checks its `h` against the index's, puts the CSS in a
  `<style data-anim>` in `<head>` and the markup first in `#splash`, signs it `@family.`, and sets
  `is-an`. **Anything wrong — no record, a damaged one, a hash that does not match — takes it all
  back out, drops the index so the next load rewrites everything, and draws an inline splash.** A
  splash from yesterday is fine; a garbled one is not.
- **One load behind**, exactly as `splashOff` always was: a drawing changed in a book reaches the
  splash on the load after the one that read the book. `check/deploy.js` changes a chapter's title and
  Pythagoras's CSS in one deploy and checks both arrive, and the kept record and hash follow.
- `splashOff_` removes the drawn root half a second after the fade and swaps `is-an` back to
  `is-tag`, so Try again shows a splash and not a black screen naming a root that has gone. The
  `<style>` stays: a chapter page may be using it.
- The books and the settings files are now fetched with the deploy stamp (`?t=LOAD`) — without it the
  service worker answered from its exact-URL cache and a deploy never reached the books at all.

### Weight

|  | before (2275cd1) | after |
|---|---|---|
| `index.html` | 156 132 bytes, 46 549 gzipped | 94 775 bytes, 32 214 gzipped |
| `style.css` | 1 028 037 bytes, 322 998 gzipped | 860 111 bytes, 285 828 gzipped |
| `data/textbooks.json` | 421 435 bytes, 148 917 gzipped | 601 005 bytes, 178 679 gzipped |
| `@keyframes` in style.css | 221 | 59 |

The two files every load parses before anything is drawn lost 165 KB between them; the books gained
it, and the books are read after the app is on screen.

**First paint is as fast, and on a first visit faster.** `check/load.js` (1.6 Mbps, 80 ms, CPU ×4),
the tree before the move and the tree after, two runs each, back to back: a first visit's first
contentful paint came at 8.9–9.0 s against 10.1 s — the page and the stylesheet it waits for are
51 KB smaller over the wire — and every warm row (browser cache, worker, after a deploy, no signal) is
the same within the run-to-run noise of about 100 ms, the library ready at 5–6 s either way. The
splash was chosen before anything was painted in 7 of 7 loads in every run.

### What the plan said and the build did not

- **A third `100%` term in every drawing's `min()`** was measured wrong. Inside the splash's
  shrink-to-fit root a percentage on a child is cyclic: the root grew to 300px and seventeen drawings
  sat at its left edge. Where the size is on the root (Pythagoras, Bayes) it is a third term; where it
  is on something inside, it is `max-width: 100%`.
- **The sieve's line of seventeen overflowed a 320 card**, which only `check/anims.js` saw. Its gap
  and font gained a `cqi` term against `.tb-an-stage`, which is a size container; on the splash there
  is no container and the term falls back to the viewport, the same as before.
- **The coin's tally marks were `cn-mh`/`cn-mt`, not `cn-h`/`cn-t`**: those are the coin's two faces.
- **"First paint" is the first contentful paint.** The first paint of a page is a blank body, which
  every load does before anything, so it could not tell a splash painted before the pick from one
  painted after.
- **The Galton board's per-ball `animation-name` stays inline in its markup**, as it was: it is the
  drawing's own data, anchored on nothing, and the plan allowed it.

### The checks

- **`js/check-anims.js`** (new, fast). The files: no teaching splash left in `index.html` or
  `style.css`; the sheet's proof/tool rows and the textbook rows name the same 27; every row's markup
  parses to one root `.an-<id>` built only of the elements a drawing uses, with no handler, no
  `javascript:`, no inline style but custom properties, every id and class carrying its prefix and
  every `#reference` inside the drawing; every rule anchored, every keyframe prefixed and unique, only
  the two at-rules, a reduced-motion block in each; size under the cap; the picker's `f === 1` equal
  to `SPLASH_CACHE_F`. Then the sync and the picker in jsdom: the
  real 27 written byte for byte in order and drawn as parsed; a changed row replaces only itself, a
  deleted row's key goes, an orphan is swept, a refused drawing or index takes the whole copy (and,
  on a store filled for real, two loads leave room for a child's answer), the keypad's and the
  answers' keys are untouched, an empty fetch changes nothing; a good copy is drawn and four
  bad ones (an index of another shape, a damaged record, a record whose hash is not the index's, a
  record with no markup) fall back to an inline splash.
- **`js/check-textbooks.js`**: the row's fields in order, the id's shape, unique, its chapter exists
  and is active, the row is directly under it, and every `about` matches a section or a point.
- **`js/check-css.js`**: the hide list, the picker's list and the sheet's brand/game/calm rows are
  the same 14; the picker is the first element in `#splash`; the coin, sieve and Bayes rules it held
  are read from the rows now.
- **`js/check-splash-loops.js`** reads each teaching drawing's loop from its row.
- **`js/check-flow.js`**: a chapter plays its animation, with Play again and its about lines; the
  splash is drawn from the textbooks' copy on the next load; a retired splash leaves; the books and
  the settings are fetched with the deploy stamp.
- **`check/anims.js`** (new, slow): every drawing in its chapter at 320 and 390, six moments each,
  painted and inside its card with nothing scrolling sideways; and under reduced motion, still, in the
  chapter and on the splash.
- **`check/states.js`** gains three chapter pages (Pythagoras, Bayes, standard form) for `ui.js`;
  **`check/deploy.js`** proves a deploy reaches a chapter and the kept copy; **`check/load.js`**
  holds the pick against the first contentful paint.

Each new rule above was mutated — the break put in, the check seen to go red, the real files seen
green again: 33 of them, listed in the commits. One never went red, and it was the fix that was wrong, not the check: standard form's
half-rem padding (added two commits before the move, "for the point's first hop past the row")
removed, and `check/anims.js` still found the point inside its card at 320. Measured, it cannot leave
it: the stage centres the drawing rather than stretching it, so the root is 94px wide in a 244px card
and the hop past its row lands seventy pixels inside the card's edge. The padding was on the wrong
box. `check/ui.js`, run on the chapter page, found the box that IS overflowed: the row of digits,
`.sf-num`, which the point is positioned against and hangs 6–7px past at its first stop, at every
width. So the commit after the move moves the half rem from the root to the row — the overhang the
comment described (it is in the archive below, under standard form), on the element it names.

**Carried over, and fixed in the review after**: the reduced-motion stills of Multiples and Standard
form set `animation: none` on a selector a per-child rule outranks, and the Protractor's wedge had no
rule at all. They held still only because the global `.01ms` rule loops anything left running — on
whatever frame the loop is on, not the still the block meant. See "After the review".

### Proof that nothing moved on the screen

Before the move, all 27 drawn from the old markup at 0.7, 2.3 and 4.1 s, 390×844 and 320×568; after
it, the same 162 frames drawn on the splash from the device's copy. 159 of 162 frames are identical bytes; the
other three are the coin's 3D faces at 390, 6 to 12 pixels off by one value in 255 — exactly what the
original gives against a second run of itself. The chapter pages
(272 of them) are byte-identical apart from the new animation pages.

### After the review

Five findings, each verified before it was changed.

**1. A full store: the copy gave nothing back.** `splashSync_` wrote drawings until one write threw,
left that one out, kept the rest and wrote the index last; the comment promised that "saved answers
and drawings cannot be pushed out by a loading screen", and that was true word for word — a `setItem`
that throws evicts nothing. But what fitted stayed, in the last free room on the device. Measured: a
store with about 100 000 characters free kept fourteen drawings and then refused a 2 000-character
answer, which `ansLocalPut_` swallowed, so a child who was not signed in lost it on reload. A store
with room for the 27 but not the 701-character index after them kept all 27 with nothing naming them
— never drawn — and the next load, finding no index, rewrote all 27 and failed on the index again,
on every load. Now any refused write in the sync takes the index and every `splashAnim:` key with it
(`splashGiveWay_`), and a refused child's write in `ansLocalPut_` takes the copy away and tries once
more. `check-anims.js` fills a real 5 000 000-character store to each of those two shapes, syncs the
real books twice, and requires no splash key left and room for a 2 000-character answer; and a copy
that fitted must give way to an answer that does not. Each was mutated back to the old line and went
red. Not covered: writes that do not go through `ansLocalPut_` (`favs`, the signed-in user).

**2. With less movement asked for, four drawings held still on the wrong picture** — on the chapter
page, where a pupil reads the drawing beside its key words:
- *Sorting*: `transform: none` wiped the bars' `scaleY(var(--h))`, so eight identical full-height bars
  sat over "Bubble sort". The still is the sorted end now: the staircase, in the sorted green.
- *Half, three ways*: the three labels are stacked (`position: absolute; inset: 0`) for the
  cross-fade, and all three at opacity 1 printed as one orange glyph. Under reduced motion they sit
  in a line, joined by `=`: ½ = 0.5 = 50%, the chapter's own words.
- *Multiples*: `.mu-grid i { animation: none }` lost to the later per-cell rules, so the global
  `.01ms` loop decided which cells were lit: none at 390, the threes at 820, the fives on the splash.
  The rule is `.an-mult .mu-grid i:nth-child(n)` now, and the threes are lit under "multiples of 3".
- *Protractor*: the wedge had no reduced-motion rule. It stops at 120° now, with the arm on it — an
  angle read from the right-hand zero, which a straight 180° (the arm lying along the baseline) is not.
- *Standard form* showed 10⁴ correctly and was not wrong to look at, but the same lost `animation:
  none` left its four exponent animations finite, and the splash's replay loop restarted them every
  frame under reduced motion. Same fix as Multiples.
`check/anims.js` now also fails on any animation of a drawing still running under reduced motion
(mutating Multiples and the Protractor back made it red, in the chapter and on the splash), and
`--shots` writes each still to check/shots/anim-still-<id>.png. Still is not the same as showing the
lesson; the shots are for a person to look at, and were looked at for all six above.

**3. Two drawings sat over words they contradict.** The protractor sweeps anticlockwise from the
right-hand zero, and the only words under it were "Bearing — an angle measured clockwise from north",
the convention it does not show and the very mix-up pupils make. Maths chapter 13 gained the key word
it does show — "Protractor — measures an angle in degrees: its centre on the vertex, its baseline
along one arm, and read from the 0 on that arm, as its two scales run opposite ways" — and the row is
about that. The clock (chapter 11, "Ratio") was captioned "telling the time" and nothing on the page
said why it is in a ratio chapter; its caption is "minute : hour = 12 : 1" and the chapter has a
worked line it is also about ("On a clock, the minute hand turns 12 times for each turn of the hour
hand …"). The number line (chapter 3) hopped the quarters under "Equivalent — ½ = 0.5 = 50%"; the
chapter has a worked line for it too ("On a number line from 0 to 1, ¼, ½ and ¾ sit at 0.25, 0.5 and
0.75: one point, whichever way it is written").

**4. The orbit moved into Physics chapter 12** — see "The orbit was the fourteenth" above.
`tools/solar.py` writes its row; its two inline styles became custom properties (`--t`, the period;
`--o`, the ring's pivot), because a drawing in a book sets nothing else inline. The splash drawn from the kept copy is the same
picture as the inline one, pixel for pixel, at 0, 1.3, 2.6 and 9 s, at 390 and 320, with and without
reduced motion. The sheet's row is kind `proof`, named "The solar system".

**5. Two sources for the twelve scripted drawings** — see "So for those thirteen rows" above. Six tool
headers still said they wrote "into index.html and … into style.css", and five CSS templates said
"from the same … as the <svg> in index.html"; they say the row now. `tools/anim_row.py` carries the
list (`WRITTEN BY A SCRIPT: …`) and `check-anims.js` holds it to the scripts.

**Seen, not changed**: index.html's replay loop restarts every finite splash animation when the last
one finishes, and does so under reduced motion too, where the global `.01ms` rule makes "finishes" mean
"every frame". Every textbook drawing now stills itself, so none of them reaches it; whether an inline
splash does was not measured.

---

---

Continued in [part 2 of 3](304-the-textbooks-hold-the-animations-2.md).
