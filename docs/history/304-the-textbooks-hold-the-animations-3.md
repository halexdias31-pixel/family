# 304-the-textbooks-hold-the-animations (part 3 of 3)

Continues [part 2](304-the-textbooks-hold-the-animations-2.md).

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


#### The solar system (`orbit`) — TB-GCSE-PHYS chapter 12, moved in the review after

From index.html (its CSS comment is still in `tools/solar.py`, which writes it):

```html
  <!-- THE SOLAR SYSTEM. Eight planets in order round the Sun, each at its real period relative to the
       others (Kepler), Earth once every four seconds. Drawn by tools/solar.py. -->
```

From style.css, the shared reduced-motion rule it was in, which keeps the other three:

```css
  .rp-box span, .or-p, .or-ring, .td-row i, .dw-sun { animation: none; opacity: 1; transform: none; }
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
