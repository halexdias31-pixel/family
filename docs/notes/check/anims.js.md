# check/anims.js

The full text of comments in `check/anims.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/anims.js EVERY TEXTBOOK ANIMATION, IN ITS CHAPTER, IN A REAL BROWSER — AND STILL WHEN STILLNESS IS ASKED FOR.

top level, before `http`

```
/* ==================================================================================================
   @family. — check/anims.js

   EVERY TEXTBOOK ANIMATION, IN ITS CHAPTER, IN A REAL BROWSER — AND STILL WHEN STILLNESS IS ASKED FOR.

   "Add the animations from loading to respective subject text books." — the owner, 8 Oct. Drawings
   made for one place — the middle of a black screen as wide as the phone; twenty-seven at the move,
   and the solar system since — are drawn in a second: a card, narrower than the phone by its padding,
   with words above and below.
   `check-anims.js` proves the rows are one source, kept and drawn as written; this asks what only a
   browser can answer about each one, on the page Find 2 turns to after its chapter, at 320 and 390:

     · THE DRAWING IS THERE: the stage holds its root, with a size;
     · NOTHING OF IT LEAVES THE CARD: every part of it, sampled at six moments of its loop (a hop, a
       flip and a regrouping all travel), stays inside the card's edges — a drawing that reaches past
       one is a page that scrolls sideways or a picture cut off, and either is the fault;
     · AND WITH LESS MOVEMENT ASKED FOR, IT HOLDS STILL: eight frames a quarter-second apart are the
       same picture, in the chapter and on the splash drawn from the device's copy — the global
       `.01ms` rule turns anything left moving into a flicker, which is the one thing reduced motion
       is there to stop;
     · AND IT IS STILL BECAUSE ITS OWN BLOCK STILLED IT: no animation of the drawing is left running.
       Eight equal frames did not prove that. Multiples' `animation: none` lost to a per-cell rule that
       outranked it and the protractor's wedge had no rule at all, and both held still — on whatever
       frame the global `.01ms` loop happened to stop at, which is not the picture their blocks meant:
       no threes lit under "multiples of 3" at 390, the threes lit at 820, the 5s lit on the splash.

   AND A FIRST VISIT, WHICH HAS NOTHING KEPT: the still name and the one loader. "delete all animations
   for loading which dont come from text books or arnt educational." — the owner, 10 Oct; the splashes
   that taught nothing went (docs/history/322), and a device with no copy of the books' drawings yet is
   shown the name, not moving, and the loader every card waits with. At 320 and 390, with the backend
   never answering so the splash stays up: the splash is `is-still` with nothing drawn; NO ANIMATION
   touches the name and four frames of it a quarter-second apart are the same picture; the loader under
   it is `loading_()`'s own markup, its three dots moving — and, with less movement asked for, still;
   the name and the loader sit inside the screen, the loader centred under the name. `--shots` writes
   check/shots/splash-first-<width>.png.

   WHAT THE STILL SHOWS IS FOR A PERSON TO LOOK AT. Holding still is not showing the lesson: the
   sorting bars all came out full height (`transform: none` wiped out their `scaleY`), and ½, 0.5 and
   50% printed on top of one another as one orange glyph — both perfectly still. `--shots` writes each
   chapter card under reduced motion to check/shots/anim-still-<id>.png, the drawing with the words
   under it, the way a pupil who asked for less movement reads it.

   SLOW, and in the suite's browser pool beside `check/ui.js`.

     node check/anims.js            all of them
     node check/anims.js pyth sf    just these
     node check/anims.js --shots    and the reduced-motion stills, for a person
================================================================================================== */
```

### THE CARD AN ANIMATION IS UNDER, BY KEY:

top level, before `cardOf`

```
/* THE CARD AN ANIMATION IS UNDER, BY KEY: each chapter row is one content card since 12 Oct (docs/history/
   347, part 2), keyed `ct:<book_id>-<chapter>` by `contentItem_` — so the row's own two cells name it, and
   a drawing landing under a new book needs nothing written here. It was the book's title, read off its
   title page, when the book was the card. */
```

### TO THE ANIMATION'S PAGE, THE WAY A READER GETS THERE:

top level, before `turnTo`

```
/* TO THE ANIMATION'S PAGE, THE WAY A READER GETS THERE: What kind · Content and the card's subject, then
   its page — on Find 2, the column a student keeps the reading up in (both finders hold the cards,
   docs/history/347). The chips are set in that finder's binding (`inFinder_`), inside which `STUFF` is
   the column's own state. */
```

### AND THE BUILDER DONE (`aheadBusy_`, docs/history/341), as press.js and ui.js wait for it.

in `turnTo`

```
/* AND THE BUILDER DONE (`aheadBusy_`, docs/history/341), as press.js and ui.js wait for it. A new
           question kicks it, and it fills the window round the chapter one card per quiet slice; each card
           drawn above this one moves the column back by what it grew. That correction is exact to the
           fraction of a pixel it can read, and the column's next placement rounds — so frames taken
           meanwhile differed by a half-pixel shimmer that is not the drawing. Before this wait the same rule
           caught a real fault: with less movement asked for, the correction was eased over `.01ms` and the
           chapter flashed a card's height down and back (`colShiftNow_`, shell.js). Bounded at thirty
           seconds. */
```

### WHAT IS PAINTED, NOT WHAT IS LAID OUT.

in `got`

```
/* WHAT IS PAINTED, NOT WHAT IS LAID OUT. Inside an `<svg>` that clips (`overflow` not visible)
           nothing reaches past the svg's own box, which is measured itself; and a shape under a mask or
           a clip-path, or in `<defs>`, is drawn only where they let it — the sine wave runs a period
           either side of its mask, the Venn's hatching is a hundred lines clipped to one region. */
```

### ---------- 2. LESS MOVEMENT: STILL, IN THE CHAPTER AND ON THE SPLASH

top level, before `ctx`

```
/* ---------- 2. LESS MOVEMENT: STILL, IN THE CHAPTER AND ON THE SPLASH ------------------------------
     At 390, one device: a real boot fills the copy the splash draws from, the chapter is read in that
     same boot, and then each splash is drawn the app's own way — everything else retired in `splashOff`
     — with the backend never answering so it stays up. */
```

### WHAT IS STILL RUNNING INSIDE THE DRAWING after the frames above (two seconds):

top level, before `running`

```
/* WHAT IS STILL RUNNING INSIDE THE DRAWING after the frames above (two seconds): under the global
       rule an animation its block stilled is gone, one that ran once has finished, and one left
       `infinite` is looping every .01ms — still to the eye, on no frame anybody chose. */
```

### ---------- 3. A FIRST VISIT: THE NAME, STILL, AND THE ONE LOADER UNDER IT

top level, before `firsts`

```
/* ---------- 3. A FIRST VISIT: THE NAME, STILL, AND THE ONE LOADER UNDER IT ------------------------
     A fresh device — nothing in its storage — and a backend that never answers, so the splash stays up
     for as long as this looks at it. Asked at both widths, with motion and with less of it. */
```

### AND NOTHING ELSE IN THE SPLASH MOVES.

in `got`

```
/* AND NOTHING ELSE IN THE SPLASH MOVES. The name being still and the loader being the loader
         said nothing about a third thing: a decoration put in `#splash` with a class — or drawn by a
         `::before` with no markup at all — ran on every first visit beside the loader and this
         passed. Every running animation whose target is the splash or anything in it, pseudo-elements
         included, unless it is the loader's own. */
```

