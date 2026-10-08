## The textbooks hold the teaching animations, and the loading screen draws its copy of them

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
| Number line | `line` | GCSE Maths | 3 Fractions, decimals and percentages | Equivalent |
| y = mx + c | `mxc` | GCSE Maths | 6 Straight-line graphs | Straight line, Gradient |
| Sine wave | `sine` | GCSE Maths | 7 Quadratic and other graphs | y = sin x |
| Odd squares | `odds` | GCSE Maths | 10 Number sequences | Square numbers |
| Triangle numbers | `tri` | GCSE Maths | 10 Number sequences | Square numbers |
| Fibonacci | `fib` | GCSE Maths | 10 Number sequences | Fibonacci-type sequence |
| Halves | `half` | GCSE Maths | 10 Number sequences | Geometric sequence |
| Clock | `clock` | GCSE Maths | 11 Ratio and proportion | Ratio |
| Angles | `ang` | GCSE Maths | 13 Angles, polygons and constructions | Angle sum of an n-sided polygon |
| Protractor | `prot` | GCSE Maths | 13 Angles, polygons and constructions | Bearing |
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

Maths chapter 3 had no word for "equivalent", which is the thing both of its drawings show, so it
was given one (`Equivalent — the same value written another way, such as ½ = 0.5 = 50% …`) in the
commit before the move, rather than pointing two drawings at a word the chapter does not say.

**The fourteen that are not teaching stay in `index.html`**: the brand (`tag`, `led`, `torch`,
`tube`, `ps`), the two games (`blocks`, `box`) and the calm ones (`ripple`, `orbit`, `tide`, `dawn`,
`breathe`, `rain`, `pend`). They belong to no chapter, and a first visit — with no copy on the
device yet — needs something to draw.

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

**The twelve generators** (`tools/pyth.py`, `sieve.py`, `bayes.py`, `coin.py`, `venn.py`, `mxc.py`,
`area.py`, `cent.py`, `fib.py`, `galton.py`, `index.py`, `sine.py`) wrote into `index.html` and
`style.css`. They write the row now, through `tools/anim_row.py`: each item a script prints replaces
its namesake in the row (a rule by selector, a keyframe by name, markup by how its element opens),
and an item the row does not have is an error. All twelve were re-run after the move and leave
`data/textbooks.json` byte for byte as it is; a changed number in one of them changes its row.

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
  - A record the store refuses (quota) is left out of the index rather than half-written. The lot is
    capped at `SPLASH_CACHE_MAX`, 200 000 characters; the 27 come to 170 201, and
    `check-anims.js` fails before the books outgrow it, so a drawing is never quietly left off.
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
  deleted row's key goes, an orphan is swept, quota on one key leaves only that one out, the keypad's
  and the answers' keys are untouched, an empty fetch changes nothing; a good copy is drawn and four
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
green again: 32 of them, listed in the commit. One never went red, and it was the fix that was wrong, not the check: standard form's
half-rem padding (added two commits before the move, "for the point's first hop past the row")
removed, and `check/anims.js` still found the point inside its card at 320. Measured, it cannot leave
it: the stage centres the drawing rather than stretching it, so the root is 94px wide in a 244px card
and the hop past its row lands seventy pixels inside the card's edge. The padding was on the wrong
box. `check/ui.js`, run on the chapter page, found the box that IS overflowed: the row of digits,
`.sf-num`, which the point is positioned against and hangs 6–7px past at its first stop, at every
width. So the commit after the move moves the half rem from the root to the row — the overhang the
comment described (it is in the archive below, under standard form), on the element it names.

**Not changed, and worth knowing**: the reduced-motion stills of Multiples, Standard form and the
Protractor set `animation: none` on a selector that a per-child rule outranks. They are still under
reduced motion only because the global `.01ms` rule ends every animation at once — which leaves each
element wherever that rule's fill puts it, not necessarily at the still its own block meant (Multiples'
lit threes and standard form's 10⁴ may not show). That was true before the move and is
carried over byte for byte.

### Proof that nothing moved on the screen

Before the move, all 27 drawn from the old markup at 0.7, 2.3 and 4.1 s, 390×844 and 320×568; after
it, the same 162 frames drawn on the splash from the device's copy. 159 of 162 frames are identical bytes; the
other three are the coin's 3D faces at 390, 6 to 12 pixels off by one value in 255 — exactly what the
original gives against a second run of itself. The chapter pages
(272 of them) are byte-identical apart from the new animation pages.

---

### The comments that stood over each drawing

Verbatim from `index.html` and `style.css` as they were at the move, in the order the drawings stood
in `index.html`. Where a comment speaks of `#splash-pyth` it means `.an-pyth` now; where it says
"below" or "in style.css", it means the same row.


#### Pythagoras (`pyth`) — now TB-GCSE-MATHS chapter 17

From index.html:

```html
  <!-- ---------- FOUR: THE PROOF. Pythagoras, counted rather than stated. ----------------------
       A 3-4-5 triangle with a square on each side, the two small ones made of unit cells. The 9 and
       the 16 fly into the empty 5 x 5 square on the hypotenuse, fill it exactly, and fly home — so
       9 + 16 = 25 is counted cell by cell. GENERATED by tools/pyth.py (markup below, keyframes in
       style.css); it was a set of squares grown once and then a dash wipe that erased the triangle
       every 2.6 seconds, which is why it was rebuilt.

       IT REPLACED A COLUMN ADDITION, which was maths and was not worth watching: a sum already done,
       appearing a digit at a time. Nothing was being worked out, so there was nothing to see. This
       one builds — the shape first, then what each side is worth — and it is doing the thing the
       business does, which is show why something is true rather than say that it is.

       THE COORDINATES ARE EXACT, not eyeballed. Right angle at (3,7), legs of 4 and 3, and every
       square and every cell worked out by tools/pyth.py from the perpendicular, so all four sides
       of the big one are exactly 5 and 9 + 16 cells tile it with nothing over. A triangle drawn by eye is a triangle that is nearly right, and "nearly" is the
       one thing a proof cannot be. -->
<!-- GENERATED by tools/pyth.py — edit the triangle there, not here. Each cell is drawn at
           (0,0) and carried by its --from and --to, translate then rotate, the way the corners
           of #splash-ang are; --d is when it sets off. -->
```

From style.css:

```css
/* ==================================================================================================
   THE FOURTH SPLASH — Pythagoras, counted in unit squares.
   GENERATED by tools/pyth.py, from the same triangle as the <svg> in index.html.

   A 3-4-5 triangle with a square on each side. The 9 cells of the small square fly into one corner
   of the big one, the 16 of the middle square fill the L that is left, and only when the last cell
   lands does the 25 appear — in the picture and in the sum under it. Then they fly home. So the
   theorem is COUNTED, not stated: every cell is a cell, in every frame, and the big square is filled
   by exactly the cells that left the small ones.

   WHAT IT REPLACED, and why each piece is the way it is:
   · THE TRIANGLE IS NEVER TOUCHED. The idle that ran a dash round it had a 12-long dash on a
     12-long perimeter, so once every 2.6s the whole triangle the proof is about was wiped out.
   · ONE 7.6s TIMELINE, AND NOTHING FINITE. The build grew the squares once and the wipe was
     infinite — so index.html's replay loop, which leaves alone any splash with something endless in
     it, never replayed the build, and after three seconds the wipe was all that moved.
   · THE CELLS MOVE LIKE #splash-ang's CORNERS: drawn at (0,0), `transform-box: view-box` and origin
     0 0, one translate-then-rotate string per cell. Transform and opacity only.
   · THE VIEWBOX IS THE THREE SQUARES AND A MARGIN, so the drawing is centred over the caption; it
     sat 9px left of it.
   · THE BIG SQUARE IS THE APP'S GOLD, var(--gold), because it is the answer; the two small ones
     are this drawing's own teal and blue, named on #splash-pyth and offered to nothing else.
   The base styles are the finished square, which is what reduced motion shows. */
/* ---------- EVERY TEACHING SPLASH FITS THE BOX IT IS IN, NOT ONLY THE PHONE -------------------------
   EACH WAS SIZED AGAINST THE PHONE (`vw`) AND A CEILING (`rem`), which is all a loading screen needs.
   A textbook's chapter page draws the same markup inside a card, narrower than the phone by its
   padding — Bayes came out at 288px in a 244px card at 320 wide — so each also stops at its box.
   TWO WAYS, AND WHICH ONE IS NOT A MATTER OF TASTE. Where the size is on the drawing's own root (this
   one and Bayes) `100%` is a third term of the `min()`: the root's box is the screen, a definite size,
   and `100%` of it is never the smallest. Where the size is on something INSIDE the root — the svg,
   the hundred square, the coin's bar — it is `max-width: 100%` instead. Written as a third term there
   it was measured moving seventeen of them: the splash centres a root that is only as wide as what is
   in it, so `100%` of it is a percentage of itself, the browser sized it as though it were `auto`, the
   root grew to 300px and every drawing sat at its left edge. A cyclic `max-width` is set aside while
   the root is measured and applied after, so the splash is pixel for pixel what it was (all 27, three
   moments, two widths) and in a card the drawing stops at the card. */
/* ONE COLOUR PER SQUARE, set once and read by its outline, its grid, its cells, its number and its
   term in the sum — so nothing has to be joined to anything by a line. */
/* A CELL HAS A SEAM OF THE PAGE'S OWN BLACK round it, so a filled square still reads as cells to
   count rather than as one block of colour. */
/* THE NUMBERS SIT ON THE CELLS, so each carries a stroke of the page's black painted under its fill
   — a seam running through a "1" makes it a different glyph. */
/* THE 25 IS EARNED. It appears when the last cell lands (2.70s) and goes as the first sets off
   home (4.75s) — in the picture and in the sum at once, so the sum reads "9 + 16 =" until the
   square under it has been filled. */
```


#### Odd squares (`odds`) — now TB-GCSE-MATHS chapter 10

From index.html:

```html
  <!-- ODD NUMBERS MAKE SQUARES. 1+3+5+7 = 16, and you can see why: each odd number is the L you
       add to grow a square by one. Nicomachus, and still the neatest thing in arithmetic. -->
```

From style.css:

```css
/* ---------- ODD NUMBERS MAKE SQUARES ------------------------------------------------------------ */
/* WRITTEN ONCE, WITH BOTH ANIMATIONS. This was two passes — the entrance, then the idle added
   below it — and the second silently replaced the first: `animation` is a shorthand, so restating
   it does not add to it. `check-css` caught all five, which is exactly the fault it exists for.
   The idle is each L brightening in turn, so the argument keeps re-making itself. */
/* ---------- THE ENTRANCES FINISH BY TWO SECONDS -------------------------------------------
   THEY WERE TAKING THREE TO FIVE, and a load is often over in two — so the proof was being
   interrupted halfway through more often than it was being seen. An argument nobody reaches the
   end of is worse than no argument: the screen looks like it was doing something and stopped.
   Steps at 0.42s rather than 0.6s. Still readable, and it lands before the app does. */
```


#### Triangle numbers (`tri`) — now TB-GCSE-MATHS chapter 10

From index.html:

```html
  <!-- TRIANGLE NUMBERS. Two staircases make a rectangle, so 1+2+…+n is n(n+1)/2. The trick a
       ten-year-old Gauss is said to have found in a minute. -->
<!-- ==========================================================================================
           THE STAIRCASE: 4 + 3 + 2 + 1 = 10 cells, on a grid four rows tall and five columns wide.
           The second staircase is its exact complement, so the two together fill 4 x 5 = 20 and
           the sum is half of that.

           THE FIRST VERSION DID NOT CLOSE. Its twenty cells spanned SIX columns, so the halves
           never met and the rectangle in the caption was not the rectangle on the screen — a proof
           whose picture disagrees with its own claim, which is worse than no picture. Counted
           rather than eyeballed this time: 20 cells, 5 columns, 4 rows, no gaps and no overlaps.
      =========================================================================================== -->
```

From style.css:

```css
/* ---------- TRIANGLE NUMBERS -------------------------------------------------------------------- */
/* The second staircase slides in to complete the rectangle — the move IS the proof, so it repeats. */
```


#### Sine wave (`sine`) — now TB-GCSE-MATHS chapter 7

From index.html:

```html
  <!-- THE UNIT CIRCLE MAKING A SINE WAVE. A dot goes round and its height is traced out beside it —
       the single most useful picture in trigonometry, and impossible to forget once seen. -->
<!-- GENERATED by tools/sine.py — edit the numbers there, not here. The wave's x axis is the
           circle unrolled (one period = 2&#960;r), and the wave slides right one period per turn. -->
```

From style.css:

```css
/* ---------- THE UNIT CIRCLE AND THE SINE WAVE ---------------------------------------------------
   GENERATED by tools/sine.py, from the same numbers as the <svg> in index.html.

   The dot goes round anticlockwise (negative rotation, because SVG's y axis points down) and its
   height is carried across by the dashed guide to where the wave leaves the circle. The wave's x
   axis is the circle UNROLLED — one period is 2πr — so the wave is the dot's own history, and it
   slides right by exactly one period per turn, which is why the loop has no seam. The teal leg
   inside the circle is sin θ drawn where it lives. Everything moves by transform and nothing by
   `stroke-dashoffset`, which repainted the path every frame. The un-animated geometry is the frame
   at θ = 60°, so reduced motion shows a finished picture rather than a dot sitting on the axis. */
```


#### Circle area (`area`) — now TB-GCSE-MATHS chapter 16

From index.html:

```html
  <!-- A CIRCLE CUT INTO SLICES AND LAID FLAT makes a rectangle of height r and width πr, so the
       area is πr². Archimedes, roughly, and it still works.
       GENERATED by tools/area.py (markup below, keyframes in style.css). The slices TRAVEL into the
       strip, top half gold and bottom half teal, so the gold top edge is half the circumference.
       The comment that stood inside this svg forbade moving slices, because a hand-made transform
       once broke; it was a cross-fade instead, and the rearrangement — the proof — never happened.
       Generated transforms drawn about (0,0), as #splash-ang's are, are what made moving safe. -->
<!-- GENERATED by tools/area.py — edit the circle there, not here. Each slice is drawn with
           its point at (0,0) and carried by its --from and --to, translate then rotate, the way
           the corners of #splash-ang are; --d is when it sets off. -->
```

From style.css:

```css
/* ---------- THE CIRCLE, UNROLLED -----------------------------------------------------------------
   GENERATED by tools/area.py, from the same circle as the <svg> in index.html.

   12 slices, the top half gold and the bottom half teal. They travel from the circle into a strip,
   gold arcs along the top and teal along the bottom, interlocking point to arc. The strip is r tall
   and its top edge is the gold half's arcs laid end to end — half the circumference, πr, labelled
   in the colour it came from. So A = πr × r is SEEN: the same pieces, rearranged. Then back.

   WHAT IT REPLACED, and why each piece is the way it is:
   · THE SLICES MOVE; NOTHING CROSS-FADES. The old splash faded a drawn circle into a drawn strip,
     so the rearrangement — the proof — never happened, and mid-fade the two overlapped as a
     double exposure.
   · TWO COLOURS BY HALF, NOT ALTERNATING BY SLICE. Alternate shading never said which arcs make the
     top edge; colouring by half is what makes "width = half the circumference" visible.
   · ONE 6.4s TIMELINE, every animation infinite, starting and ending on the circle — no seam.
   · THE SLICES MOVE LIKE #splash-ang's CORNERS: point at (0,0), `transform-box: view-box`, origin
     0 0, one translate-then-rotate string each. Transform and opacity only.
   · CENTRED. The circle sat at x = 30 of a 96-wide box, 44px left of the caption; circle and strip
     now share the box's middle, which tools/area.py asserts.
   The base styles are the finished strip with r and πr marked, which is what reduced motion shows. */
/* A SEAM OF THE PAGE'S OWN BLACK between slices, so the strip still reads as 12 pieces. */
/* THE MEASUREMENTS ARE EARNED: they appear when the last slice lands (1.70s) and go as the first
   leaves (4.10s) — r and πr mean nothing against a circle. */
```


#### The sieve (`sieve`) — now TB-GCSE-MATHS chapter 1

From index.html:

```html
  <!-- THE SIEVE OF ERATOSTHENES. Cross out the multiples and what is left are the primes. Two
       thousand years old and still how it is done. -->
```

From style.css:

```css
/* ---------- THE SIEVE, WHICH IS NOT A GRID -------------------------------------------------------
   IT WAS A FOUR-BY-FOUR BOX OF TILES, and a sieve is not a shape — it is a RUN of numbers you walk
   along striking things out. Wrapping 2 to 17 into four rows puts 5 under 2 and 9 under 6, which
   implies a relationship down the columns that is not there and is the one thing a 100-square is
   good for and this is not. In four rows the crossings jump about; in a line they sweep left to
   right, which is the direction counting goes.

   AND THE CROSSED-OUT ONES ARE STRUCK THROUGH rather than dimmed. Dimming says "this one is quiet";
   a line through it says "this one is out", which is what the sieve does and what the pencil does
   when a child works one. The number stays readable under the stroke, because seeing WHICH numbers
   went is the whole lesson. */
/* ---------- THE SIEVE, PRIME BY PRIME — keyframes and markup written by tools/sieve.py ------------
   ASKED FOR AS "refine what is left is prime animation". It struck 4, 6, 8, 9, 10 … in POSITION
   order at a fixed step, so the method was never on screen: nothing said that 9 went because of 3
   and 8 because of 2, and the caption claimed a conclusion the animation had not shown. Now it is
   the sieve as it is worked: 2 is ringed and its multiples struck in 2's colour, then 3 and its
   multiples in 3's, then it stops — 5 × 5 = 25 is past 17 — and what is left is ringed. The caption
   steps with it. One loop: it clears and starts again, so a slow load watches the method, not a
   finished row with a glow on it (the old glow was `infinite`, so the replay loop never re-ran it).

   A STRIKE IS ITS OWN ELEMENT, AS WIDE AS ITS DIGITS. The old one overhung by 8% each side and grew
   `width`, so 8-9-10 and 14-15-16 merged into one red bar and three numbers read as one line through
   nothing in particular. Each `<s>` now ends inside its own number, the gap between numbers stays
   black, and it draws by `scaleX` from its left end — the pencil travelling, on the compositor.
   6 and 12 get a SECOND, lower line in 3's colour: 3's walk lands on them too, and a number struck
   twice is exactly what a child's worked sieve looks like.

   THE COLOURS BELONG TO THIS SPLASH, so they are named on it rather than offered to the sheet. */
/* ONE LINE, OR IT IS NOT A RUN. At 1.05rem it wrapped with 17 alone underneath — an orphan that
   reads as a mistake and breaks the left-to-right sweep the line was chosen for. Sized in `vw` so
   it shrinks to fit rather than wrapping, with `nowrap` to make that the only option.
   AND IN `cqi` AS WELL, because the line is also a page of the Maths book now, inside a card. `vw` is
   the phone, and the card is the phone less its padding: at 320 wide the seventeen numbers came out
   at 264px in a 244px card, and the page scrolled sideways. The book's stage is a size container
   (`.tb-an-stage`), so `cqi` there is the card; on the splash there is no container and `cqi` is the
   phone again, the same size as `vw` — so the third term is never the smaller one there, and the
   splash is pixel for pixel what it was. */
/* `--kf` names each element's keyframes, and this rule animates them — see `.cn-m` for why the name
   is never written inline as `animation-name`: an inline declaration beats the reduced-motion rule. */
/* THE RING sits on the number's own box plus a hair, so 2 and 3 — the one pair of neighbours that
   are both ringed — keep a gap between their rings at 320px. */
/* ONE LINE PER STEP, stacked in one place like the coin's count, only the current one showing. */
/* LESS MOVEMENT: the finished sieve, still — every strike in the colour of the prime that made it,
   every prime ringed, the last line of the caption. It was in the shared list below as `.sv-o,
   .sv-x`, which with the new markup would have been a still of the EMPTY row. */
```


#### Halves (`half`) — now TB-GCSE-MATHS chapter 10

From index.html:

```html
  <!-- POWERS OF TWO. Each square doubles the last, so the halves fill the whole: 1/2 + 1/4 + 1/8 …
       approaches 1 and never quite arrives. The clearest picture of a limit there is. -->
<!-- ==========================================================================================
           WHAT IS LEFT OVER IS THE WHOLE POINT.

           THE FIVE PIECES USED TO FILL THE BOX EXACTLY — 48, 24, 12, 6 and 3 plus four gaps came
           to the full width — so the picture said five terms REACH one. The caption says `→ 1`,
           approaching, and the single idea this drawing exists for is the sliver that is never
           filled. It had been paved over.

           SO THE PIECES ARE EXACT HALVES OF WHAT IS LEFT, and the last one stops short. The strip
           runs 2 to 98, so 96 wide: 48, 24, 12, 6, 3 — and 3 remaining, dark, at the right. That
           empty sliver is the same width as the smallest piece, which is exactly the truth of the
           series: whatever you have added, what is left is always the size of your last step.

           FLUSH, WITH NO GAPS. Pieces cut from one whole sit against each other; a gutter between
           them says they do not quite add up, which is the argument the caption is making against.
           They are told apart by shade, which is what the shades were already for.
      =========================================================================================== -->
<!-- The frame is the 1 the pieces are approaching, so it closes round the empty sliver too. -->
```

From style.css:

```css
/* ---------- HALVES ------------------------------------------------------------------------------ */
/* NO STROKE. A 1.2 outline on a piece 3 wide is mostly outline — the last two halvings came out as
   black bars with a hint of blue in them, and the right-hand end of the strip read as a barcode
   rather than as halves getting smaller. The shades below already tell the pieces apart, and they
   do it without taking width away from the ones that have least to spare. */
```


#### Angles (`ang`) — now TB-GCSE-MATHS chapter 13

From index.html:

```html
  <!-- THE ANGLES IN A TRIANGLE. Tear off the three corners, put them together, and they make a
       straight line. Every child who has done this remembers it. -->
<!-- ==========================================================================================
           THE CORNERS TEAR OFF AND SLIDE TOGETHER ONTO A STRAIGHT LINE, which is the proof.

           The version before this one had nothing move — the three corners were marked in place and
           a fan was drawn below — because an EARLIER version had tried the tear and broken it:
           rotating a shape about its own vertex needs `transform-box`, `transform-origin` and the
           order of rotate-then-translate all right at once, and any one wrong fails silently. It was
           asked to be made better, and the move is the whole argument, so it moves — built so the
           three things that went wrong cannot:

           - EACH WEDGE IS DRAWN WITH ITS VERTEX AT (0, 0), so "rotate about the vertex" is "rotate
             about the origin" and there is no origin to compute.
           - `transform-box: view-box; transform-origin: 0 0` on `.ag-w`, so the origin IS (0, 0).
           - THE WHOLE TRANSFORM IS ONE STRING PER WEDGE, `--from` and `--to` below, rotate written
             after translate — so the order is stated once, beside the numbers it orders.

           The numbers are computed, not eyeballed: A(20,58) B(100,58) C(62,14) give angles of
           46.33°, 49.18° and 84.48°, which sum to 180. a lands on the left of P(60,88),
           b on the right, c upside down between them — the parallel-line picture exactly.
           Transform and opacity only, so it keeps moving while the thread under it parses the app.
      =========================================================================================== -->
<!-- where each corner was torn from: a faint copy stays, so the triangle shows the gap -->
```

From style.css:

```css
/* ---------- THE ANGLES IN A TRIANGLE ------------------------------------------------------------
   Draw the triangle, tear off its three corners, slide them onto a straight line where they fill it
   exactly, hold, and go back — for as long as the splash is up. The geometry, and why it cannot
   misbehave the way the torn-corner version before last did, is written beside the markup.

   ONE 6s CYCLE FOR EVERYTHING, so the pieces, the labels at the line and the caption cannot drift
   apart over a long load: the same duration, delays a fraction of it. The wedges leave a tenth of a
   second apart, the way three corners are torn off one at a time. */
/* THE COLOURS, declared on the component: a splash's palette is that picture's and nobody else's. */
/* OPACITY AND A SCALE, not a stroke drawing itself in: a dash offset is repainted by the main thread,
   which is the thread parsing the app underneath this splash. */
/* The a, b, c at the line and the 180° under it arrive once the three pieces have landed. */
/* MOTION OFF SHOWS THE FINISHED PICTURE: the corners already on the line, labelled, with the sum.
   That is the half that carries the result, and a triangle alone is not an argument. */
```


#### Binary (`bin`) — now TB-GCSE-CS chapter 3

From index.html:

```html
  <!-- COUNTING IN BINARY. Eight lamps counting up, which is all a computer ever does. -->
```

From style.css:

```css
/* ---------- BINARY ------------------------------------------------------------------------------ */
/* EACH LAMP DOUBLES THE PERIOD OF THE ONE BESIDE IT, which is what counting in binary IS —
   the rightmost flickers, the leftmost barely moves, and the pattern never repeats within a load. */
/* ---------- THE DOUBLING IS RIGHT AND THE BASE WAS TOO SLOW --------------------------------------
   EIGHT BITS DOUBLING FROM .6s PUTS THE TOP ONE AT 76.8 SECONDS. A splash is up for about two, so
   four of the eight lamps never changed at all — the half of the row that carries the counting
   looked painted on, and what somebody saw was three flickering lights and a decoration.

   THE HALVING IS THE WHOLE IDEA, so it is kept exactly. The base drops to .18s, which puts the top
   bit at 23 seconds — still slow, but now the fourth and fifth lamps turn over while you watch and
   the row plainly counts rather than flickers. A binary counter you cannot see counting is a row
   of lights. */
/* AND ONCE MORE, because `steps(1)` means a lamp holds its state for half its period — two sample
   frames can land inside one step and come out identical even though the row is counting. The
   fastest lamp now flips every 60ms, which is at the edge of a flicker and is what the least
   significant bit of a counter actually does. The doubling is untouched. */
```


#### Pascal (`pas`) — now TB-GCSE-STATS chapter 16

From index.html:

```html
  <!-- PASCAL'S TRIANGLE. Each number is the two above it added, and the whole of probability falls
       out of that one rule. -->
```

From style.css:

```css
/* ---------- PASCAL ------------------------------------------------------------------------------ */
```


#### Fibonacci (`fib`) — now TB-GCSE-MATHS chapter 10

From index.html:

```html
  <!-- THE GOLDEN SPIRAL, from squares whose sides are the Fibonacci numbers. -->
<!-- GENERATED by tools/fib.py from the sequence 1 1 2 3 5 8 13 21: each square laid against the whole of
           what came before, and one clockwise quarter turn in each, checked for tangency at every
           joint. Edit the script, not this. -->
```

From style.css:

```css
/* ---------- FIBONACCI --------------------------------------------------------------------------- */
/* EIGHT SQUARES AT TWO UNITS where there were five at eight — see tools/fib.py — so the lines are
   thinner in proportion, or the 1-squares would be all stroke. The arc is 169.6 long. */
```


#### Galton board (`gal`) — now TB-GCSE-STATS chapter 16

From index.html:

```html
  <!-- A GALTON BOARD. Sixteen balls bounce left or right off four rows of pegs and pile up in a
       bell — chance turning into a shape you can predict. Every one of the sixteen left/right
       routes is taken exactly once, so the pile is 1, 4, 6, 4, 1 by construction: Pascal's fourth
       row, which is the arithmetic the picture is about. Generated by tools/galton.py. -->
```

From style.css:

```css
/* ---------- THE GALTON BOARD --------------------------------------------------------------------
   REFINED: IT USED TO BE THREE BALLS SLIDING STRAIGHT THROUGH THE PEGS over five bars that pulsed
   together whatever landed — so nothing on it bounced, nothing piled up, and the bell was drawn
   before a single ball had made it. The caption says "chance has a shape", and the picture never
   showed the shape being MADE.

   NOW EACH BALL IS DROPPED ON ITS OWN, touches the top of every peg on its way down, hops half a
   step left or right, and settles on the pile in its bin — gold while it is falling, teal once it
   has landed. Sixteen of them, one for each of the sixteen left/right routes, so the pile ends at
   1, 4, 6, 4, 1 by construction rather than by luck: Pascal's fourth row, which is the arithmetic
   the picture is about. The counts come up under the bins as the bell completes, it holds, and the
   board empties and starts again.

    WRITES THE SIXTEEN KEYFRAMES AND THE SIXTEEN CIRCLES — every position is
   computed from the peg grid, so a ball cannot miss its peg by a pixel somebody typed. Each circle
   sits at its LANDING spot and the animation is a translate away from it, so with motion switched
   off the bell simply stands there finished. Transform, opacity and fill only. */
```


#### Sorting (`sort`) — now TB-GCSE-CS chapter 8

From index.html:

```html
  <!-- SORTING. Bars swap into order, over and over — the shape of an algorithm rather than its code. -->
<!-- `--h` IS A FRACTION, not a percentage, for the reason in `.so-row i`: the bars are
           scaled, and a transform takes a number rather than a length. Same eight heights. -->
```

From style.css:

```css
/* ==================================================================================================
   EIGHT MORE. Same rule as the rest: the drawing is the argument, and each keeps moving after it
   has made it. Entrances land inside two seconds, because a load often does.
================================================================================================== */
/* ---------- SORTING ------------------------------------------------------------------------------ */
/* ---------- SCALED, NOT RESIZED, AND THAT IS WHAT THE SMEAR WAS ----------------------------------
   REPORTED AS "the blue charts leave blue residue behind. same with the ordering animation bar
   graph". Both of these ran correctly in a desktop browser -- measured across a full cycle, the
   colours cross from blue to green and back and every bar moves in every frame. What they were
   doing is animating `height`, which is a LAYOUT property: the box changes size on the main
   thread, the old area has to be invalidated and the new one painted, and they were changing
   their `background` in the same breath.

   MEASURED ACROSS THE WHOLE STYLESHEET: nine keyframes animate a layout property, and these two
   are the ONLY two that animate geometry and colour together. That is the shape that smears,
   because the region to invalidate and the colour to paint are both moving at once -- and it
   happens during boot, which is exactly when the main thread is busy parsing 566KB of JavaScript
   and least able to keep up.

   `transform: scaleY()` IS THE SAME PICTURE WITHOUT THE LAYOUT. The compositor owns it, the box
   never changes size, there is no region to invalidate, and `index.html`'s own argument for the
   splash -- that it keeps moving while the thread is busy -- becomes true of these two rather than
   merely claimed. `transform-origin: bottom` is what keeps them standing on the axis.

   THE OTHER SEVEN ARE LEFT ALONE, deliberately: none of them changes colour while it moves, and
   changing seven animations on a report about two is the fix that costs more than the fault.
   Written down so the next one is a decision rather than a rediscovery. */
/* EACH BAR RISES TO ITS SORTED HEIGHT AND FALLS BACK. The pattern is the point: a jumble becoming
   a staircase, which is what every sort looks like from far enough away. */
/* ---------- THE HOLDS WERE LONGER THAN THE MOVES -------------------------------------------------
   `46%` TO `74%` IS 900 MILLISECONDS OF STILLNESS in a 3.2s cycle, and `0%` to `16%` another 500 at
   the start — so more than half the animation was a pause and two sample frames landed inside the
   same one. Sorting is a thing that keeps going until it is done; a bar chart that settles for a
   second in the middle reads as finished and then inexplicably starts again.
   The holds are trimmed to a beat each, which is enough to see the order arrive without the run
   stopping to admire it. */
```


#### Multiples (`mult`) — now TB-GCSE-MATHS chapter 1

From index.html:

```html
  <!-- ---------- MULTIPLES ON A HUNDRED SQUARE -------------------------------------------------
       THE ONE THING THE OTHER TWENTY-SIX DO NOT DO: show a pattern EMERGING from a grid. Every
       other proof here draws a thing; this one lights cells until a shape somebody has seen in a
       classroom appears out of a hundred numbers — the threes making diagonals, the fives two
       clean columns, the nines a stripe running the other way.
       That noticing is the actual lesson, and it is one nobody has to be told. -->
```

From style.css:

```css
/* STILL A PATTERN, not a blank grid. With motion off the threes stay lit, so the splash says the
     same thing without moving — which is what reduced motion is for and not an excuse to show
     nothing. */
/* ---------- MULTIPLES ON A HUNDRED SQUARE --------------------------------------------------------
   THE ONE THING THE OTHER TWENTY-SIX DO NOT DO: show a pattern emerging from a grid rather than
   drawing a picture of one. Threes make diagonals, fives two clean columns, nines a stripe running
   the other way — and a child notices that before anybody explains it, which is the reason to put
   it on a screen somebody is already staring at.

   THE CELL LISTS ARE COMPUTED, NOT TYPED. Thirty-three nth-child selectors written by hand is
   thirty-three chances to put 27 where 24 goes, and the fault would look like a pattern rather than
   a typo — the worst kind, on a splash whose whole job is showing a true pattern.

   SIX SECONDS, THREE TABLES, and each holds long enough to be seen. A splash is up for about two,
   so most loads show one table completely rather than three partially: one clear pattern beats
   three half-drawn ones, which was the fault in half the splashes here before today. */
/* THREE NUMBERS STACKED IN ONE PLACE, one showing at a time. It was a `::after` whose `content` was
   animated — which Chrome does and SAFARI DOES NOT, so on an iPhone the label read "multiples of 3"
   for all six seconds while the grid went on to the fives and the nines: the words and the picture
   disagreeing on the one splash whose job is showing that they agree. Opacity animates everywhere. */
/* THE CELLS LIT AND THEN HELD, so the middle of each table's third was three identical frames — the
   pattern appeared and then sat there, which is a picture of a pattern rather than one emerging.
   They now come up in a stagger and breathe while lit, so the grid is alive for the whole third
   rather than for the moment it arrives. The stagger is per-cell via the delays below. */
/* THE THREE TABLES AS THREE NAMED ANIMATIONS rather than three delays. The per-cell stagger above
   IS a delay, and one delay cannot mean two things — using it for both would have made the fives
   and nines land on top of the threes. Each table lights in its own third of the cycle. */
/* ---------- ONE ANIMATION PER CELL, WITH ITS OWN KEYFRAMES ---------------------------------------
   TWO ANIMATIONS ON ONE ELEMENT BOTH SETTING `background` DO NOT COMBINE — the later one in the list
   wins for as long as both are running, and all three run the whole six seconds (each simply holds
   dark outside its own third). So `mu-lit5`, holding dark through the first third, painted over
   `mu-lit` lighting: cell 15 carried both animations, resolved correctly in the computed style, and
   still never lit with the threes.
   That is the second time this splash has been wrong in the same place. Listing both animations
   fixed WHICH ones apply and not which one is seen.

   THE ANSWER IS ONE ANIMATION PER CELL whose keyframes light in exactly the thirds that cell
   belongs to. Nothing overlaps, so nothing can overwrite. Only five combinations occur, so it is
   five keyframe sets rather than a hundred.

   AND THE GLOW DIPS MID-HOLD. The pattern has to stay complete long enough to be seen, which is
   760ms of the same cells lit — the longest still stretch of any splash here. Pulsing the SHADOW
   rather than the fill keeps every cell lit, so the shape is unbroken while the screen is not
   frozen: the two requirements looked opposed and only the fill was ever load-bearing. */
/* cells in the 3 times table — 18 of them */
/* cells in the 3 and 5 times tables — 4 of them */
/* cells in the 3 and 5 and 9 times tables — 2 of them */
/* cells in the 3 and 9 times tables — 9 of them */
/* cells in the 5 times table — 14 of them */
```


#### Index laws (`index`) — now TB-GCSE-MATHS chapter 2

From index.html:

```html
  <!-- INDEX LAWS. Three a's and two a's, pushed together and counted. Nobody who has watched five
       letters line up needs telling that you add the powers.
       GENERATED by tools/index.py: one timeline — join, count 1 to 5 while joined, write a⁵, clear,
       part — because the old one counted on a different clock from the join and lit the last two
       tiles after the groups had come apart again. -->
<!-- GENERATED by tools/index.py — edit the timeline there, not here. -->
```

From style.css:

```css
/* ---------- INDEX LAWS ---------------------------------------------------------------------------
   GENERATED by tools/index.py, from one list of times — what was wrong before, and why each piece is
   the way it is, is written there.

   THE TWO GROUPS CLOSE UP AND THE × GOES OUT WITH THEM, because the whole claim of the law is that
   three a's and two a's are five a's — a thing that happens, not a thing that is. Then, while they
   are joined, the five are counted, a numeral under each, and a⁵ is written when the fifth is. The
   count clears, the groups part, and the loop ends on its first frame.

   THE JOIN IS EXACT. Open, the groups are --ix-out from the × on each side and the × is --ix-op
   wide; joined, tiles 3 and 4 must be --ix-in apart like every other pair. So the gap closes by
   2·out + op − in, and each group moves HALF of it towards the other — the joined row is evenly
   spaced and keeps the open row's centre. The old one moved only the second group by a fixed 1.5rem:
   1.1px between tiles 3 and 4 against 4.4px elsewhere, and 11px left of centre.

   The base styles are the joined, counted row with a⁵ written — what reduced motion shows. */
/* ROOM UNDER THE ROW FOR THE NUMERALS, which hang below their tiles rather than in the flow, so
   counting never moves anything. */
/* THE LIGHT IS A RING OVER THE TILE THAT FADES, not the tile's border changing colour: a colour is
   repainted by the main thread, which is busy parsing the app at exactly this moment, and opacity
   is the compositor's. */
/* COUNTED ONE AT A TIME, all cleared together — so five is reached, held, and let go at once. */
/* a⁵ IS WRITTEN WHEN THE FIFTH TILE IS COUNTED, and not before. */
```


#### Exact values (`trick`) — now TB-GCSE-MATHS chapter 17

From index.html:

```html
  <!-- THE TRIG TRICK. The numerators counting 0, 1, 2, 3, 4 is the whole of it, and it is the one
       thing a table of exact values never shows you, because a table has no order in time. -->
```

From style.css:

```css
/* ---------- THE TRIG TRICK ------------------------------------------------------------------------
   REVEALED LEFT TO RIGHT AND NEVER ALL AT ONCE. The numerators are 0, 1, 2, 3, 4 and the only thing
   worth carrying away is that they go up by one — which a table cannot say, because everything in a
   table arrives at the same moment. */
/* LESS MOVEMENT: THE LAST FRAME, every value written. It had no rule of its own, and the global
   `.01ms` one shortens a duration but not a delay — so each value still waited its `.5s + i × .42s`
   at nothing, and the splash's replay loop played the wait again and again. */
```


#### Standard form (`sf`) — now TB-GCSE-MATHS chapter 2

From index.html:

```html
  <!-- STANDARD FORM. The point walks left and the power counts the steps it took. That is the
       rule, and it is a rule about movement, so it is one a still picture cannot make. -->
```

From style.css:

```css
/* ---------- STANDARD FORM --------------------------------------------------------------------------
   THE POINT WALKS AND THE POWER COUNTS ITS STEPS. Four hops, four numbers, in step — the exponent
   is not a fact about the number, it is a tally of a movement, and this is the only way to show it. */
/* ROOM EITHER SIDE FOR THE POINT. It hops to `translateX(2.99rem)` from the middle of a row exactly as
   wide as its five digits, so at its first stop it stands past the row's right edge — on the splash
   that is open screen, and in a card at 320 wide it is the edge of the card, which then scrolls
   sideways. Half a rem either side keeps it inside whatever box the drawing is in, and the splash
   centres the drawing either way, so its pixels do not change. */
/* THE ROW IS THE THING THE POINT IS POSITIONED AGAINST, so it must be exactly as wide as its digits:
   a flex row that stretched to the splash would put `left: 50%` somewhere other than the middle of
   the numerals, and every hop would be measured from the wrong origin. */
/* ---------- THE HOPS ARE ONE DIGIT EACH, WHICH THEY WERE NOT --------------------------------------
   A DIGIT IS 1.1rem WIDE WITH .12rem BESIDE IT, so one place is 1.22rem and the point can only ever
   sit in a gap. The first version moved .61rem a hop — half a digit — so the point walked up the
   middle of the numerals instead of between them and finished three places short of the 4, under a
   caption that said 4.8. The animation contradicted its own answer, which is the one thing a
   teaching animation must never do.

   THE FIVE PLACES, MEASURED FROM THE CENTRE OF A FIVE-DIGIT ROW: the right-hand end is +2.99rem and
   each hop takes 1.22rem off it, landing at +1.83, +0.61, −0.61 and −1.83. Written out rather than
   calculated so that changing the digit width and forgetting these is impossible to do quietly —
   the numbers are visibly the digit width and nothing else.

   AND `translate(-50%)` GOES IN FRONT OF EACH ONE, because `left: 50%` puts the point's left edge on
   the centre rather than the point itself. It was half a glyph right of every position it claimed. */
/* THE STEPS ARE STEPS, not a glide: the point lands between two digits or it is nowhere, and an
   eased slide would show it halfway through a digit, which is not a place a decimal point can be. */
/* ---------- THE POWER CAME OUT AS A SUBSCRIPT -----------------------------------------------------
   FOUR NUMERALS STACKED, AND ALL FOUR TAKEN OUT OF FLOW. `<sup>` raises itself with
   `vertical-align: super`, which shifts a box relative to the baseline — but every numeral inside
   was absolutely positioned, so the box had no in-flow content, collapsed to zero height, and the
   raising had nothing to raise. The digits then drew from the top edge of a box sitting on the
   baseline, which puts them below it: 10₄ where the sheet says 10⁴, on a splash whose whole subject
   is what the little number means.

   STACKED WITH GRID INSTEAD OF WITH `position`. Four items in one cell overlap exactly as they did,
   but they are still in flow, so the box has the height of a numeral and `super` has something to
   lift. It also drops the guessed `width: .7rem` — the grid is as wide as the widest digit by
   construction, which is what that number was trying to be. */
/* EACH NUMERAL HOLDS ITS OWN WINDOW of the same loop rather than fading in and out on a timer of
   its own — four independent fades drift apart from the hops within a few cycles. */
/* LESS MOVEMENT: THE LAST FRAME — the point four places left and 10⁴ written, which is the whole
   claim. Without this the two infinite step animations ran at the global `.01ms`: a point and a
   power flickering through every position at once. */
```


#### Angle at the centre (`cent`) — now TB-GCSE-MATHS chapter 15

From index.html:

```html
  <!-- THE ANGLE AT THE CENTRE. The point walks round the arc and its angle does not change, which
       is the part nobody believes from a diagram holding still. WRITTEN BY tools/cent.py — the
       wedge at P is one shape carried round, so its size visibly does not change. -->
<!-- GENERATED by tools/cent.py — edit the circle there, not here. A, B and O never move;
           the chords, the wedge at P and its label are carried by the @keyframes in style.css. -->
```

From style.css:

```css
/* ---------- THE ANGLE AT THE CENTRE ----------------------------------------------------------------
   GENERATED by tools/cent.py, from the same circle as the <svg> in index.html — edit it there.

   ASKED FOR AS "refine the circle theorems animation". It was a flip-book: three fixed triangles
   faded in turn, an `x` written inside each and no angle marked on any, so what was equal to what
   had to be read off three letters in three places — and nothing moved.

   NOW P SLIDES ROUND THE ARC AND THE ANGLE GOES WITH IT. The wedge at P is ONE shape, carried and
   turned, never redrawn — so the eye sees that it does not change size, which is the theorem. The
   angle at the centre is drawn once and never moves or fades; the arc AB they both stand on is
   picked out, because that is why the two are related at all. Holds of 12% at each end of the
   sweep, so the angle is read standing still before it is seen travelling.

   · ONE 8s TIMELINE; every keyframe starts and ends with P at the same place — no seam.
   · TRANSFORM ONLY, each moving part drawn at (0,0) with `transform-box: view-box` — the method
     #splash-ang and #splash-area use. The chords are unit lines stretched along x, which keeps their
     stroke; the label is translated and never turned, so it never tilts.
   · SAMPLED EVERY 2% and eased in tools/cent.py, so the four moving parts share one
     parametrisation; check-splash-loops.js re-derives P from every stop and asks it is on the rim.
   · THE COLOURS ARE THIS SPLASH'S OWN (`--ct-cen`, `--ct-edge`) and the rim is `--paper` at an
     opacity — it was the paper colour written out as an rgb().
   · REDUCED MOTION is the base rules below: P at the top of the circle, the textbook picture. */
```


#### The mean (`mean`) — now TB-GCSE-STATS chapter 8

From index.html:

```html
  <!-- THE MEAN. Five bars of different heights settle to one height — the mean is the level they
       would all share if they poured into each other, which is a thing to watch, not a sum. -->
<!-- `--h` IS A FRACTION OF THE ROW, not a length, because the bars are scaled rather than
         resized — see `.mn-row i`. 2.2/7, 5/7, 3.4/7, 6.2/7, 1.7/7 of a 7rem row: the same five
         bars to the pixel, and the mean of them is 3.7/7, which is the level they meet at. -->
```

From style.css:

```css
/* ---------- THE MEAN --------------------------------------------------------------------------------
   EVERY BAR GOES TO THE SAME HEIGHT AND COMES BACK. `--h` is where each one starts and 3.7rem is
   their average, so the animation is the definition acted out: level them off and that is the mean.
   Nothing is computed at runtime — the average is written in because five fixed bars have one. */
/* SCALED RATHER THAN RESIZED -- see the note over `.so-row i`, which is the same fault and the
   same fix. The level the bars meet at is 3.7/7 of the row, which is the mean of the five. */
/* THE COLOUR IS DECLARED AT EVERY STOP, not only at the two it changes on. A property named in
   some keyframes and not others is interpolated from the element's own value at the ends, which
   happens to be right here and is a thing a reader has to know rather than see. */
```


#### Half, three ways (`half3`) — now TB-GCSE-MATHS chapter 3

From index.html:

```html
  <!-- ONE HALF, THREE WAYS. The bar fills to the same place each time and only the writing under it
       changes, which is the entire content of the fraction-to-decimal block. -->
```

From style.css:

```css
/* ---------- ONE HALF, THREE WAYS ---------------------------------------------------------------------
   THE BAR DOES NOT MOVE. It fills once and stays, and the three notations take turns underneath —
   the claim is that these are one quantity written three ways, so the quantity has to be the thing
   that holds still while the writing changes. A bar that re-filled for each would say the opposite. */
```


#### y = mx + c (`mxc`) — now TB-GCSE-MATHS chapter 6

From index.html:

```html
  <!-- y = mx + c. The line tilts and the crossing point does not: m is the tilt, c is the place it
       cuts, and separating them is what the block is for. WRITTEN BY tools/mxc.py — "refine the
       gradiant animation": it stops at six gradients and names each one, with run 1 and rise m drawn
       on the line, so m is a number you can see measured rather than a letter in a caption. -->
<!-- GENERATED by tools/mxc.py — edit the axes there, not here. The axes, the grid, the run and
           the point (0, c) never move; the line, the triangle, the rise and the numbers are carried
           by the @keyframes in style.css. -->
<!-- EVERYTHING THAT MOVES IS CLIPPED TO THE PLOT. The triangle and the rise ride up the line as
           it steepens past m = 2 on its way over the top, and fade as they go; unclipped, they would
           be half up when the rise left the top of the plot. -->
```

From style.css:

```css
/* ---------- y = mx + c -------------------------------------------------------------------------------
   GENERATED by tools/mxc.py, from the same axes as the <svg> in index.html — edit it there.

   ASKED FOR AS "refine the gradiant animation". It was a bar rocking between two angles about a
   point near the left of a box: two gradients, neither named, no rise and no run, the line's end
   rising out past the top of the axes, and the dot and the pivot two different sets of numbers.

   NOW THE LINE STOPS AT SIX GRADIENTS AND SAYS WHICH. m = -1, -1/2, 0, 1/2, 1, 2 — falling, flat,
   rising, steep — held 10% of the loop each with the number up, and a rise-over-run triangle on
   the line: run 1 along the grid, rise m to the line, the rise labelled, and under it
   "m = rise ÷ run = " the same value. c is written ON the point where the line cuts: a line turning
   about that point passes through every place near it except the point itself.

   · ONE 9.5s TIMELINE; every keyframe starts and ends at m = -1 — no seam. The line ends it half a
     turn on from where it began: it swings from m = 2 on over the vertical rather than back through
     the stops it has named (the first build's 108° rewind at 189°/s), and a line through its own
     pivot is the same line half a turn later. The triangle, run and rise (`.mx-rr`) fade out as it
     goes through vertical, where m has no value, and in on the far side.
   · THE HALVES ARE BUILT, 1 over a bar over 2, in the drawing (`.mx-rf`) and the caption (`.mx-fr`):
     Cascadia's ½ is two digits in one cell, and at 320 it read as a smudge.
   · THE "=" FADES WITH ITS VALUE, inside each `.mx-v`, so between stops the caption reads
     "m = rise ÷ run" and never ends in a bare "=".
   · THE PIVOT IS ONE STRING. `.mx-line` is `translate(P) rotate(-θ)` and P is identical in every
     keyframe, so the line passes through (0, c) at every frame because nothing interpolates it.
   · TRANSFORM AND OPACITY ONLY. The triangle is a unit right triangle stretched upright by m; the
     rise is a two-unit line shrunk by m/2; the numbers fade, never move.
   · SAMPLED and eased in tools/mxc.py, m = tan θ at every sample, so the line, the triangle and the
     rise share one parametrisation. check-splash-loops.js re-derives all three from these keyframes
     and asks that they meet, that each number is up only while the line holds at it, and that no
     word is crossed by a line while it is showing.
   · THE COLOURS ARE THIS SPLASH'S OWN — the line, m and c — and the axes are `--paper` at an
     opacity; they were the paper colour written out as an rgb().
   · REDUCED MOTION is the base rules below: m = 2, the triangle at its tallest, c marked. */
/* c IS WRITTEN ON ITS DOT, in the background colour, so it needs no halo — the dot is the halo. */
/* THE SIX VALUES IN ONE CELL, so the slot is as wide as the widest and the sentence never shifts
   when the number changes. Each value carries its own "=", in the caption's type, so it goes when
   the value goes. */
```


#### Protractor (`prot`) — now TB-GCSE-MATHS chapter 13

From index.html:

```html
  <!-- A PROTRACTOR, with the arm sweeping through the degrees. -->
```

From style.css:

```css
/* ---------- THE PROTRACTOR ----------------------------------------------------------------------- */
/* ---------- THE ARM SWEEPS, AND NOW THE ANGLE IT MAKES IS FILLED IN ------------------------------
   ONE MOVING PART AND FOUR SECONDS: a splash is up for about two, so the arm got halfway and
   stopped, and what somebody saw was a protractor with a line across it at a random angle.

   TWO AND A HALF SECONDS for the full sweep and back, so the whole gesture lands. And the wedge
   between the base and the arm fills as it goes — a sweeping line is a moving line, whereas a
   growing angle is the thing a protractor is FOR. `transform-box: fill-box` is deliberately not
   used: the origin is in viewBox units, which is what an SVG transform wants by default. */
/* THE ARC OF THE ANGLE, drawn by dash offset — the same trick the sine wave uses, and the reason
   `pathLength` is set: a dash length in user units has to be recomputed whenever the path changes,
   and one in hundredths never does. */
/* ---------- THE SWEEP FLAG WAS 1 AND HAD TO BE 0 -------------------------------------------------
   SVG's y GROWS DOWNWARD, so the "clockwise" flag on an arc from the right end of the baseline to
   the left end takes it UNDER the line. The wedge hung below the protractor as a stray block — an
   element that plainly moved and was plainly wrong, which is exactly what a check for "does it
   animate" cannot catch. Only looking at it does.
   `fill: none` matters too: an arc with a fill would close itself across the chord. */
/* I WROTE A `content` ANIMATION ON `.pr-num` — a real element, not a pseudo — where `content` does
   nothing at all. It would have animated an empty rule forever and looked like a considered choice
   in the stylesheet. The label stays a word; the arc is what carries the reading. */
```


#### Coin flips (`coin`) — now TB-GCSE-MATHS chapter 19

From index.html:

```html
  <!-- COIN FLIPS, settling towards a half. Chance being unreliable and reliable at once. Written by tools/coin.py. -->
```

From style.css:

```css
/* ---------- COIN FLIPS ---------------------------------------------------------------------------
   TEN TOSSES AND A TALLY, written by tools/coin.py. The old one spun an H on the spot over a bar
   that wobbled on a timer of its own, so the coin never came down tails and nothing it did moved
   the bar. Now the coin goes UP, turns, lands on the face the row records, and the bar is the share
   of heads so far: 1, .5, .33, .5, .4, .5, .43, .38, .44, and five in ten. It is a fixed sequence
   that ends on exactly a half, because a splash has ten seconds and a real run of ten does not
   promise one. Every toss adds two whole turns and a half turn when the face changes, so the angle
   is always a face; the run ends on heads, so 100% and 0% are the same picture.
   Transform and opacity only, so the compositor runs all of it. */
/* ---------- AND NOW IT LOOKS LIKE ONE --------------------------------------------------------------
   ASKED FOR AS "make the coin look more like a coin". The toss was right and the object was not: a
   flat #e8c15f disc with an H on one side and a MINT one with a T on the other, both on one plane.
   Gold on one face and teal on the other is a counter, not a coin, and with `backface-visibility`
   doing the flip the two faces shared a plane — so edge-on, twice a toss, the coin was a hairline.

   ONE METAL, BOTH FACES, built in three layers that a struck coin has:
     the MILLED EDGE  the face's own background, a repeating conic of light and dark ridges, of
                      which only a thin ring shows round the outside;
     the RAISED RIM   `::before`, inset a little, a bevelled border lit from the top left and shaded
                      bottom right, round a field with a specular highlight in the same corner;
     a RING OF DOTS   `::after`, a dotted border inside the rim — the generic ornament, and on
                      purpose nothing more. No head, no date, no legend: a coin that looked like a
                      real currency would be a picture of somebody else's money.
   The letter is embossed — light above-left, shade below-right — rather than printed on.

   THICKNESS IS A STACK OF DISCS IN Z inside the `preserve-3d` coin, with the faces just outside
   them — twelve now, at ±.22rem; see the note under the face rules. Face-on they are behind the face and invisible; edge-on they ARE the coin, a gold
   band about .3rem deep. Nothing new moves: the discs ride the toss that was already there, so the
   whole thing is still one transform on one element.

   THE TALLY KEEPS ITS TEAL T. The chips and the caption are a code, not the coin — they only need
   H and T to be told apart at a glance, which gold on gold would not do.

   COLOURS ARE THIS COIN'S OWN, so they are named on it and offered to nothing else. */
/* z-index -1 is under the letter and above the milled background, because the face's own
   transform makes it the stacking context both layers sit in. */
/* ---------- AND NOW IT HAS A BODY ------------------------------------------------------------------
   ASKED FOR AS *"make the coin in the spinning animation look more 3d like it has some thickness to
   it"*. It had an edge, six discs .25rem deep, and nobody could see it: the coin faced the viewer
   square-on, so the edge showed only in the instant a toss passed edge-on — a flicker, twice a
   flip, and at rest a flat gold disc.

   SO TWO THINGS. It is THICKER — twelve discs across .44rem, about an eighth of its width, which is
   a chunky pound coin rather than a penny — and it is SEEN FROM A LITTLE TO THE SIDE AND ABOVE:
   `.cn-tilt` turns the whole coin 24deg round the vertical and 10deg back, once, and the toss runs
   inside it untouched. Now the band of the rim is on screen at rest, swells and thins as the coin
   turns, and the face foreshortens into an ellipse the way a real coin does on a table. The discs
   are shaded darker toward the middle of the band, so the rim reads as a rounded edge in light
   rather than a stack of paper.

   Still one animated transform on one element; the tilt is fixed. */
/* THE KEYFRAMES ARE NAMED BY `--kf`, NOT BY AN INLINE `animation-name`. tools/coin.py used to write
   `style="animation-name: cn-m3"` on every mark, and an inline declaration beats every rule in this
   file — including `animation: none` under reduced motion. So for anybody who had asked for less
   movement, the marks and the count kept animating and only the coin stood still: the still was
   never the still. The inline style now only names the keyframes in a variable and this rule is
   what animates, so the reduced-motion rule below wins as written. */
/* THE LINE AT HALF is the thing the bar is converging on, so it is drawn rather than implied. */
/* ONE LINE PER TOSS, stacked in one place, only the current one showing. */
/* LESS MOVEMENT: the finished run, still — ten marks, the bar at half, the last line. */
```


#### Bayes (`bayes`) — now TB-GCSE-STATS chapter 15

From index.html:

```html
  <!-- BAYES, with a hundred people. A test right nine times in ten, and a positive that still means
       only even odds: 9 true positives from the 10 who have it, 9 false ones from the 90 who do not.
       Written by tools/bayes.py — re-run it rather than editing these lines; check-css.js recomputes
       the posterior from the dots and the captions and fails if they disagree. -->
```

From style.css:

```css
/* `.by-say .by-sN`, not `.by-sN`: the span rule that hides every line is one class heavier. */
/* ---------- BAYES, WITH A HUNDRED PEOPLE ---------------------------------------------------------
   ASKED FOR AS "add a bayesian maths animation". Written by tools/bayes.py, which holds the numbers
   and says what each moment teaches — re-run it rather than editing these lines. The prior is the
   gold row, the test's verdict is the ring, and the answer is two rows of nine of equal length:
   P(has it | +) = TP / (TP + FP) = 9 / 18, drawn before it is said.

   THE PALETTE IS THE SCREEN'S, not a component's own: gold is what has it, ink is everybody and the
   ring the test draws. No paper here — this is the black-and-gold screen, so tokens only.
   Transform and opacity only, one 9.6s clock, every animation infinite; check-css and
   check-splash-loops both hold it to that. */
/* THE RING SCALES ABOUT ITS OWN MIDDLE — `fill-box`, since the circle is drawn at its place in the
   grid and not at (0,0). */
/* `--go` IS A translate IN viewBox UNITS, written per person by the generator; `view-box` and an
   origin at 0 0 make a px in it one unit of the drawing, so it scales with the svg. */
/* ONE LINE PER MOMENT, stacked in one place, only the current one showing. Wider than the drawing
   so the longest line is never wrapped at 320. */
/* LESS MOVEMENT: the answer, still — the two rows of nine, named, the sum and the last line. */
```


#### Number line (`line`) — now TB-GCSE-MATHS chapter 3

From index.html:

```html
  <!-- A NUMBER LINE, with a marker walking along it. -->
```

From style.css:

```css
/* ---------- THE NUMBER LINE ---------------------------------------------------------------------- */
/* STEPS RATHER THAN A GLIDE. A marker sliding smoothly along a number line says the numbers between
   the ticks are where you might land; stepping says they are the places there are. */
/* FOUR SECONDS FOR FIVE HOPS meant a splash showed two of them and stopped — a marker sitting
   between two ticks, which is the exact thing the stepping was chosen to deny. Two seconds puts the
   whole walk on screen.
   AND THE TICK IT LANDS ON LIGHTS UP, so a hop is arriving somewhere rather than only leaving. */
/* ---------- AND THE TICKS STILL, WHICH THEY WERE NOT --------------------------------------------
   ONLY THE DOT HAD A REDUCED-MOTION RULE (in the group further down), so with less movement asked
   for the ticks ran on under the global `.01ms !important` rule — an endless animation at a hundredth
   of a millisecond is a flicker, the one thing reduced motion is there to stop. The group stills the
   dot on 0, so the tick lit is the one under it: the first frame of `nl-lit`, the picture still true. */
```


#### Venn (`venn`) — now TB-GCSE-MATHS chapter 19

From index.html:

```html
  <!-- TWO SETS IN ξ, AND THE NOTATION FOR THREE OF ITS REGIONS. A ∩ B, then A ∪ B, then A′, each
       shaded as it is named underneath, because what a student is here to recognise is the symbol
       read off the picture. Written by tools/venn.py from one table of geometry and one timeline —
       re-run it rather than editing these lines; the region paths and the hatch are arithmetic. -->
```

From style.css:

```css
/* ---------- THE VENN ----------------------------------------------------------------------------- */
/* ---------- WRITTEN BY tools/venn.py — edit the table there and re-run, do not edit these lines ---
   IT WAS TWO CIRCLES SLIDING TOGETHER AND A PATCH LIGHTING IN THE MIDDLE, under "A ∩ B" that never
   changed. That is one fact drawn once, and the patch was a flat cream blob rather than anything a
   student has seen on a paper. Now it is the diagram a GCSE question prints: ξ round the outside,
   A and B arriving, and three regions shaded IN TURN — A ∩ B, A ∪ B, A′ — each with its notation
   underneath as it appears, because the point of the splash is reading the symbol off the picture.
   SHADED WITH A HATCH because that is how a region is shaded by hand, and the hatch drifts by one
   line spacing per turn of its own loop, so a shaded region is moving even while it is held and
   no frame of the loop is a still picture. Only `transform` and `opacity` move, and the loop starts
   and ends on the same empty ξ, so there is no seam. The rules that set an opacity WITHOUT an
   animation are the reduced-motion frame: circles in, A ∩ B shaded and named.
   OUTLINES ONLY, as on a paper: tinted circles put a third colour in the lens where they cross, so
   A′ — which leaves the lens unshaded — read as though the lens were shaded something else. And
   the letters carry a stroke of the page's own black under their fill, because they sit on the
   hatch and a hatch line through a letter makes it a different glyph. */
```


#### Clock (`clock`) — now TB-GCSE-MATHS chapter 11

From index.html:

```html
  <!-- A CLOCK, because the hands are the first thing anybody is taught to read. -->
```

From style.css:

```css
/* ---------- THE CLOCK ---------------------------------------------------------------------------- */
/* TWELVE TO ONE IN THE TIME THE MINUTE HAND TAKES TO GO ROUND — the two hands geared to each other
   the way they are on a real clock, because a minute hand racing an hour hand that stands still is
   the thing children notice is wrong. */
/* ---------- THE RATIO IS RIGHT AND THE SPEED WAS NOT ---------------------------------------------
   TWELVE TO ONE IS CORRECT and 48 SECONDS IS INVISIBLE. A splash is on screen for about two, so the
   hour hand turned four per cent of a revolution and looked painted on — the geared pair, which is
   the entire point of the drawing, read as one moving hand and one stuck one.
   The ratio is kept exactly; both are twelve times faster. The minute hand sweeps in a third of a
   second and the hour hand makes a visible quarter-turn in the time anybody watches. */
```


#### Said of several at once

From index.html, above `odds`:

```html
  <!-- ==========================================================================================
       TEN VISUAL PROOFS.

       ALL PUBLIC-DOMAIN MATHEMATICS, drawn from scratch. These are results that have been shown
       this way for centuries — Nicomachus, Eratosthenes, Archimedes — and the drawing is the
       argument, which is the point: a loading screen that teaches something is a loading screen
       nobody minds waiting through.

       EACH ONE FINISHES ITS ARGUMENT AND THEN KEEPS MOVING. That was the fault with the first
       batch — the proof assembled and then held perfectly still, and a diagram that has stopped
       moving reads as a page that has stopped working. Every one below has an idle that runs for
       as long as the splash is up.
  =========================================================================================== -->
```

From index.html, above `sort`:

```html
  <!-- EIGHT MORE. Same rule as the rest: the drawing is the argument, and every one keeps moving
       after it has made it. -->
```

From index.html, above `index`:

```html
  <!-- ---------- FOUR DRAWN STRAIGHT OFF THE SHEET ------------------------------------------------
       THESE FOUR ARE COMPONENTS. Index laws, the trig trick, standard form and the circle theorem
       are all blocks a student can tick onto their own cheat sheet, and a loading screen is four
       seconds of undivided attention several times a week. Seeing the rule move before you ever
       look it up is how it stops needing looking up.

       THE MOTION IS THE TEACHING, not decoration on top of it. Each one animates the step that is
       the actual point: the letters queuing up, the count going up, the point walking left, the
       angle refusing to change. A splash that showed the finished formula would be a poster. -->
```

From index.html, above `mean`:

```html
  <!-- ---------- FOUR MORE OFF THE SHEET, DELIBERATELY PLAIN --------------------------------------
       NONE OF THESE FOUR MOVES ANYTHING BUT A HEIGHT, A WIDTH OR AN ANGLE. No geometry computed in
       a viewBox, no path interpolation, nothing that can land a pixel out on a phone — the earlier
       standard-form one taught me that an animation whose numbers are subtly wrong is worse than no
       animation, because it is confidently wrong in front of a student.

       A SMALL TRUE THING BEATS A LARGE APPROXIMATE ONE. Each of these makes exactly one claim. -->
```

From style.css, over `odds`, `tri`, `sine`, `half`, `ang`, `bin`, `pas`, `fib`, `gal`:

```css
/* THE CIRCLE-AREA SPLASH LEFT THIS LIST when tools/area.py took it over: its own reduced-motion
     rule sits with its keyframes, so the still is written beside the motion it stills. Before that,
     `.ar-wheel` and `.ar-box` stood here after the elements were gone — `check-css` found them. */
/* THE WHOLE SET, STILL, for anybody who has asked for that. */
```


#### The show rules, and the picker's list

From style.css, over the show rules that went:

```css
/* ---------- AND THE ELEVEN PROOFS -------------------------------------------------------------- */
/* ---------- THE FOUR TAKEN FROM THE COMPONENT LIST --------------------------------------------- */
```

From index.html, the picker's list as it stood before this work (its other comments are still in the picker):

```js
/* THE RING: two boxers of our own, eight-bit. See tools/boxing.py. */
/* ---------- THE VISUAL PROOFS ------------------------------------------------
                    Public-domain mathematics drawn from scratch: odd numbers making squares,
                    triangle numbers, the unit circle, the circle unrolled, the sieve, halves,
                    the angles of a triangle, binary, Pascal, Fibonacci, a Galton board.
                    A loading screen that teaches something is one nobody minds waiting through. */
/* ---------- AND EIGHT MORE ---------------------------------------------------
                    Balancing an equation, sorting, the times table, a protractor, coin flips, a
                    number line, a Venn diagram, a clock. */
/* BAYES: a test right nine times in ten, and a positive that is still only even
                    odds. tools/bayes.py. */
/* ---------- AND THREE THAT TEACH NOTHING -----------------------------------
                    Breathing, rain, a pendulum wave. Twenty-seven proofs in a row is a set that
                    never lets anybody just wait — some loads should be calm, or pretty, and
                    nothing more.
                    THE WEAVE WAS THE FOURTH AND IS GONE. Six threads each way sliding across
                    themselves: it read as a tartan square holding still, which is a picture rather
                    than an animation, and a loading screen that looks frozen reads as an app that
                    has. Its markup, its rules and its keyframes went with it — a splash left in the
                    file but out of the pool is dead code that still has to be maintained. */
/* ---------- AND FOUR THAT ARE COMPONENTS -----------------------------------
                    Index laws, the trig trick, standard form, the angle at the centre. Every one
                    of these is a block on the sheet, so the splash and the paper teach the same
                    thing in the same words — which is the point of taking them from the list
                    rather than inventing four more. */
```
