# check/diagrams.js

The full text of comments in `check/diagrams.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/diagrams.js EVERY LABEL IN EVERY DRAWING, AGAINST EVERY LINE AND EVERY OTHER LABEL IN IT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/diagrams.js

   EVERY LABEL IN EVERY DRAWING, AGAINST EVERY LINE AND EVERY OTHER LABEL IN IT.

   REPORTED BY THE OWNER, TUTORING FROM IT: *"the Venn diagram was a bit off. Like P and Q was
   clashing with lines."* June 2024 Foundation Paper 1, Q23. The set letters sat at (97.2, 47.2) and
   (240.5, 46.7) — on the rims of two circles of radius 64.3 — so each letter had a circle running
   through it. A printed exam paper puts a Venn's letters OUTSIDE their circles, by the upper-left
   and upper-right, and nothing in this repository could tell the difference.

   NOTHING COULD, AND EACH CHECK WAS RIGHT ABOUT WHAT IT ASKS. `check/cards.js` measures whether a
   card fits its column and whether a label is painted outside its own `<svg>` — a letter on a rim
   is inside the column and inside the box. `check/ui.js` measures screens. A drawing's labels
   against its own lines is a third question and it had no instrument, so every one of the 334
   drawings in the data files was laid out by a person looking at it, once, at whatever width
   they happened to look at.

   SO THIS ASKS THREE THINGS OF EVERY `<text>` IN EVERY INLINE DRAWING IN `data/*.json`:

     1. does any inked stroke run through its glyphs
     2. do its glyphs overlap another label's
     3. are its glyphs inside the drawing's own viewBox

   THE GLYPHS, NOT THE TEXT BOX. `getBBox()` on a `<text>` is the font's whole line — ascent to
   descent, advance to advance — so a capital P carries an empty descender under it and a number set
   just above a line "touches" it with nothing but air. Every character is measured on its own, with
   the canvas `measureText` of the font that character is actually drawn in, which gives the INK box
   (`actualBoundingBox*`) — and placed at the browser's own position for that character
   (`getStartPositionOfChar`), so `text-anchor`, `dy` on a `<tspan>` and a `transform="rotate(...)"`
   on an axis caption all land where they are drawn. Everything is compared in SCREEN pixels, through
   each element's own CTM, at the width a phone shows — so the tolerance below is a number on a
   phone and not a number in a viewBox somebody would have to scale in their head.

   EVERY DATA FILE, NOT ONE. It reads every `data/*.json` and takes any string cell carrying an
   `<svg`, so the next file to grow drawings is measured the day it does rather than the day
   somebody remembers this list. Today that is `questions.json` and `practicals.json`.

     node check/diagrams.js                    every drawing, at 320 and 390px, 3x
     node check/diagrams.js --width=360        one width alone
     node check/diagrams.js --dpr=2            …or another pixel density (3 by default)
     node check/diagrams.js --face="DejaVu Serif"   …or another serif, standing in for Android's
     node check/diagrams.js --shots=DIR        a PNG of every drawing with a finding, into DIR
     node check/diagrams.js --shots=DIR --rows=A,B   …or of these rows, finding or not
================================================================================================== */
```

### ---------- 320 AND 390, AND THE SECOND ONE IS NOT FOR SHOW

top level, before `WIDTHS`

```
/* ---------- 320 AND 390, AND THE SECOND ONE IS NOT FOR SHOW -------------------------------------
   320 because it is the narrowest phone still in use, and the width `check/cards.js` and
   `check/ui.js` both open on. The drawing is `min(100%, 20rem)` wide, so at 320 it is about 270px
   across a 340-unit viewBox and a 13px label is drawn at about 10px — the size a person reads it.

   390 because a drawing's geometry scales but its type does not quite: the glyphs are hinted at
   whatever size they land, so a label clear by a fraction of a pixel at one width can touch at
   another. MEASURED THE DAY THIS WAS WRITTEN — with every finding at 320 fixed, 390 still named
   one label, 360 another and 414 a third, each at exactly the half-pixel line. Two widths is not a
   proof for every phone; it is the narrowest one and the commonest one, and a label has to clear
   both. `--width=` measures one width alone. */
```

### ---------- THE PORT IS OPTIONAL, AND ZERO WHEN NOBODY NAMES ONE

top level, before `PORT_WANTED`

```
/* ---------- THE PORT IS OPTIONAL, AND ZERO WHEN NOBODY NAMES ONE ---------------------------------
   Every browser check here takes its own port from the environment because several worktrees run
   the suite on one machine at once, and two checks on one port is one of them dying on EADDRINUSE.
   This one goes a step further: unset, it asks the OS for a free port (`listen(0)`), so a worker who
   has never heard of `DIAGRAMS_PORT` cannot collide with anyone. Set it to pin one. */
```

### ---------- THE TOLERANCE IS HALF A PIXEL, ON THE PHONE, AND HERE IS WHY

top level, before `TOL`

```
/* ---------- THE TOLERANCE IS HALF A PIXEL, ON THE PHONE, AND HERE IS WHY ---------------------------
   A collision is ink of a stroke reaching INTO the ink box of a glyph by more than this. Three
   things make the true answer fuzzy and all three are under a pixel:
     - anti-aliasing: a stroke's edge is a half-covered pixel either side of its geometric edge;
     - the box is a rectangle and a glyph is not — P's lower right, 7's lower left, an italic's
       slant all leave corners of the box empty, so a box overlap of a fraction of a pixel is very
       often no overlap of ink at all;
     - sub-pixel placement: the same label lands a fraction of a pixel differently at 320 and 390,
       and a rule that flips on that is measuring the rounding rather than the drawing.
   Half a pixel is below anything a person can see as touching, and above the rounding. The same
   number serves the label-against-label and inside-the-box questions, for the same reasons.

   AND THE FONT IS NAMED, BECAUSE IT DECIDES THE ANSWER. Chromium here resolves `serif` to Liberation
   Serif, which has Times New Roman's metrics — what an iPhone draws these labels in, and what every
   drawing in the library was laid out against (see the note over `.qsheet .lbl` in style.css).
   Android's `serif` is Noto Serif, which is wider. `--face="DejaVu Serif"` measures a face of about
   that width: on 5 October 2026 it found 381 collisions in 136 drawings where Times found 124 in
   55, and after those 124 were cleared it still finds 304, 116 of them a word running out of its
   own box — the 183 the stylesheet note records for a monospace face, smaller.
   That is a decision about the drawings' font, not about where a label sits, so it is printed by
   that flag and not failed by this run. */
```

### ---------- A STROKE IS INK WHEN AT LEAST HALF OF IT IS PAINTED

top level, before `INK`

```
/* ---------- A STROKE IS INK WHEN AT LEAST HALF OF IT IS PAINTED ----------------------------------
   THE GRAPH PAPER IS NOT A LINE A LABEL CAN CLASH WITH. `.grid` is `stroke-width: .4; opacity: .3`
   — the printed squares of the paper — and an exam paper writes on squared paper all the time: a
   point's letter, a line's equation, a region's R. What the reader sees is faint ruling under the
   word, the same as on paper. So a stroke counts by how much of it is PAINTED — opacity down the
   ancestor chain × `stroke-opacity` × the colour's own alpha — and anything under one half is
   paper rather than drawing. That is a rule about what is on the screen, not a list of classes, so
   a faint construction line drawn without `.grid` is judged the same way and a `.grid` someone
   darkens to 0.8 starts being checked. */
```

### AN OPAQUE FILL HIDES WHAT IS UNDER IT, and this repository already uses that on purpose:

top level, before `OPAQUE`

```
/* AN OPAQUE FILL HIDES WHAT IS UNDER IT, and this repository already uses that on purpose: a tick
   number on a graph sits on a small `fill: var(--raised)` rectangle painted after the grid and
   before the number, so the line is knocked out under the digits (`Q-1MA1-1706-3H-13` is the
   first). That is the convention for a label that must sit ON a line, and it is honoured by asking
   what is painted rather than by naming rows: a stroke sample is dropped when a later element's
   fill covers that point with at least this much alpha. */
```

### ---------- ACCEPTED — labels that do touch a line, each with one written reason

top level, before `KEY_ON_PAPER`

```
/* ---------- ACCEPTED — labels that do touch a line, each with one written reason -----------------
   SHORT, AND IT SHOULD STAY THAT WAY: the convention above (a knockout under the label) is the way
   to put a label on a line, and moving the label is the way to take one off it. An entry is
   `'ROW|label text|the line, as the report names it': 'reason'` — the LINE as well, so forgiving
   one ruling does not forgive the same label landing on a curve next week. It is still printed on
   every run, so a forgiven collision is never a silent one. A key that matches nothing is reported
   as stale, because a reason for a fault that no longer exists is a sentence somebody will trust
   about the wrong drawing.

   THE ONE KIND HERE IS A LABEL THAT NO POSITION CAN CLEAR. The AQA 7408/3A key reads "experiment
   1" and "experiment 2" beside two sample lines, and each label is about 63 units long on graph
   paper whose major squares are 45.7 — so wherever it sits it crosses a major ruling, and it cannot
   leave the square it is in because the sample line it names is part of the drawing. The printed
   paper puts its key on a white box, which is the knockout convention, and adding one is a change
   to the drawing rather than to where a label sits. Left for the owner, named here so it is not
   forgotten: one `fill: var(--raised)` rect behind the key in each of the two rows clears all four. */
```

### A TEXTBOOK ANIMATION IS NOT A FIGURE OF THIS KIND, and measured as one it is wrong by hundreds of pixels.

in `diagrams`

```
/* A TEXTBOOK ANIMATION IS NOT A FIGURE OF THIS KIND, and measured as one it is wrong by
         hundreds of pixels. Since 9 Oct the teaching animations are rows of data/textbooks.json
         (`anim`), and each carries its own `css` — the font size of its labels in its own viewBox
         units among it. Drawn here inside `.qsheet` without that stylesheet, the Bayes tree's
         "have it, test +" came out at the card's text size in a 100-unit box: "242.4px past the
         viewBox", on a drawing that is whole on the screen. `check/anims.js` draws every one with its
         own CSS, inside its card, at several moments and as its reduced-motion still — that is the
         instrument for these. */
```

### THE WRAPPER THE APP DRAWS IT IN — `.gd` round a practical's figure (`practicalPart_` in find.js), `.qsheet` round a question's (`questionFigCard_`).

in `diagrams`

```
/* THE WRAPPER THE APP DRAWS IT IN — `.gd` round a practical's figure (`practicalPart_` in
           find.js), `.qsheet` round a question's (`questionFigCard_`). The label rules are written
           once for both selectors, but a drawing measured in the wrong wrapper is measured against a
           stylesheet that could one day differ. */
```

### THE CARD A FIGURE IS DRAWN ON, with the classes the app gives it, so the stylesheet under test is the one deciding how wide the drawing is and what size its

top level, before `cardHtml`

```
/* THE CARD A FIGURE IS DRAWN ON, with the classes the app gives it, so the stylesheet under test is
   the one deciding how wide the drawing is and what size its labels are. A question's figure is in its
   question's card, inside `.qsheet-pb` among the words (`figHtml_`; docs/history/356) -- no `.qfig` page. */
```

### THE MEASUREMENT. It runs inside the page, takes one plain argument and closes over nothing.

top level, before `inspect`

```
/* ==================================================================================================
   THE MEASUREMENT. It runs inside the page, takes one plain argument and closes over nothing.
================================================================================================== */
```

### SIGNED DISTANCE FROM A POINT TO A BOX:

in `inspect`

```
/* SIGNED DISTANCE FROM A POINT TO A BOX: positive outside, negative inside by the distance to the
     nearest edge — so a stroke through the middle of a glyph scores deeper than one grazing a
     corner, and the number printed is how far the ink reaches into the letter. */
```

### WHICH CHARACTER IS WHICH.

in `inspect`

```
/* WHICH CHARACTER IS WHICH. The browser numbers the characters it lays out, after collapsing
           white space; walking the text nodes and collapsing the same way gives each number its
           character and the element (a `<tspan>`, maybe smaller, maybe italic) that draws it. When
           the two counts disagree the advance box from `getExtentOfChar` stands in — the font's
           whole height, so a stricter box — and the count of those is printed. */
```

### A FILL IS INK WHEN IT IS THE DRAWING'S OWN COLOUR — `currentColor`, the dot on a point, the head of an arrow — and painted at least half.

in `inspect`

```
/* A FILL IS INK WHEN IT IS THE DRAWING'S OWN COLOUR — `currentColor`, the dot on a point,
           the head of an arrow — and painted at least half. Any other opaque fill is a surface
           (the knockout under a tick number, a sky, a sun) and only matters for what it hides. */
```

### ---------- AT A PHONE'S PIXEL DENSITY, BECAUSE THE ANSWER MOVES WITH IT

top level, before `BATCH`

```
/* ---------- AT A PHONE'S PIXEL DENSITY, BECAUSE THE ANSWER MOVES WITH IT ----------------------
     MEASURED, NOT ASSUMED: the same label against the same line came out up to half a pixel apart
     at a device scale of 1 and of 3. Chromium lays SVG text out at the size it will RASTERISE it —
     font size × the drawing's scale × the device's pixel ratio — and hints the advances at that
     size, so where each glyph starts depends on how dense the screen is. A desktop at 1x is not
     what anybody reads these on; every phone in use is 2x or 3x, and 3 is the iPhone this site is
     tutored from. A half-pixel shift is exactly the size of the tolerance, so a check run at 1x
     would pass labels a phone draws touching. */
```

### AT THE SAME DENSITY AS THE MEASUREMENT, so the picture is the layout that was measured — and a 1x picture of a 10px letter is too coarse to tell a letter

top level, before `W`

```
/* AT THE SAME DENSITY AS THE MEASUREMENT, so the picture is the layout that was measured — and a
       1x picture of a 10px letter is too coarse to tell a letter touching a line from one beside
       it, which is the only thing these pictures are for. */
```

