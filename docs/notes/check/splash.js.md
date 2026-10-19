# check/splash.js

The full text of comments in `check/splash.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/splash.js IS THE LOADING SCREEN STILL MOVING?

top level, before `http`

```
/* ==================================================================================================
   @family. — check/splash.js

   IS THE LOADING SCREEN STILL MOVING?

   ASKED FOR AS "make animations more stable for loading", and the first thing to find out is what
   was actually wrong — because there were two candidate answers and the measurement says one of
   them is not true.

   ---------------------------------------------------------------------------------------------
   THE ONE THAT IS NOT TRUE: IT DOES NOT STUTTER.

   `index.html`'s case for the splash is that *"the animation is CSS, so it runs even while the main
   thread is busy parsing eighteen files"*. That is true of `transform` and `opacity`, which the
   compositor runs on its own thread, and false of a `background`, a `box-shadow`, a colour or a
   `width`, which the MAIN thread recomputes and repaints — the same thread parsing 566KB of
   JavaScript and decoding a 3.4MB library at exactly that moment.

   ASKED OF THE BROWSER, 23 of the 39 splashes animate at least one property the compositor cannot
   run, and the worst of them runs 47 `background`-and-`box-shadow` animations at once. That reads
   like a diagnosis and is not one. Measured at the moment of boot with the CPU throttled 6x and
   then 20x, with the payload never answering so the splash stays up: **every splash moved in every
   frame**, the 47-animation one exactly as much as the pure-`transform` one. There is no stutter to
   fix, and writing the fix without taking the measurement would have been the `.mat-out` mistake —
   two rules changed on a reading nobody had checked.

   ---------------------------------------------------------------------------------------------
   THE ONE THAT IS: SOME OF THEM STOP.

   Measured at full speed, where nothing is competing for anything, four splashes are IDENTICAL from
   one frame to the next for more than a third of their frames, and hold a single still picture for
   up to a second at a time. `index.html` has already deleted a splash for exactly this, and its own
   sentence is the standard: *"it read as a tartan square holding still, which is a picture rather
   than an animation, and a loading screen that looks frozen reads as an app that has."*

   A HOLD IS NOT AUTOMATICALLY A FAULT. Several of these teach something — standard form, the angle
   at the centre — and a beat to read the result on is the point. That is why this PRINTS and does
   not fail: which of them is a rhythm and which is a freeze is a judgement about the animation, and
   the pool is the sheet's (`splashOff`, read by the picker in index.html). A number is something
   somebody can act on; a silence is how a frozen loading screen stays in the pool.

   AND IT IS NOT IN `npm run check`, for `check/load.js`'s reason: it drives a real browser and its
   answer moves with what else the machine is doing, and a check whose result depends on that is a
   check people learn to ignore.

   RUN IT:  npm run splash          every splash, 8 seconds each — about six minutes
            npm run splash -- is-sf is-pyth     just these
================================================================================================== */
```

### ---------- AND NONE OF IT IS IN index.html ANY MORE

top level, before `kinds`

```
/* ---------- AND NONE OF IT IS IN index.html ANY MORE ------------------------------------------------
   THE SPLASHES ARE THE TEXTBOOKS' ANIMATIONS (data/textbooks.json), drawn from the copy a load keeps on
   the device (`splashSync_` in shell.js). Half of the pool was an inline list in the picker until 10
   Oct, when every splash that taught nothing was deleted (docs/history/322); the pool is now whatever
   a REAL boot of the app saved — the app filling its own cache, not this file writing one it hopes
   looks the same. This only asks that the picker is there to choose from it. A first visit's still
   name is not in the pool and is not measured: it is meant to hold still (`check/anims.js` holds it). */
```

### ONE CONTEXT FOR THE WHOLE RUN, because the device's copy of the books' drawings lives in its storage.

top level, before `ctx`

```
/* ONE CONTEXT FOR THE WHOLE RUN, because the device's copy of the books' drawings lives in its
     storage. A real boot fills it first — the backend answering with the fixture, so `load()` reads
     the books and `splashSync_` keeps them — and every page after it is the same device. */
```

### PICKED THE APP'S OWN WAY.

top level, before `waitUntil`

```
/* PICKED THE APP'S OWN WAY. `splashOff` is the switch the sheet already has and the picker in
       index.html reads it BEFORE it picks — so seeding it with everything-but-one is the app
       choosing rather than a hand on the element afterwards. Setting the class from a
       DOMContentLoaded handler instead put this measurement wrong once: it runs after index.html's
       own replay loop, which had already captured the animations of whatever the coin chose. */
```

### IDENTICAL BYTES IS THE WHOLE TEST.

top level, before `worst`

```
/* IDENTICAL BYTES IS THE WHOLE TEST. A PNG of the same pixels is the same PNG, and it is the
           only question that can tell a compositor animation from a main-thread one: a page can be
           busy and still be moving, and a page can be idle and be a photograph. */
```

### ---------- WHAT IS WORTH LOOKING AT, AND IT IS A JUDGEMENT RATHER THAN A THRESHOLD

top level, before `dull`

```
/* ---------- WHAT IS WORTH LOOKING AT, AND IT IS A JUDGEMENT RATHER THAN A THRESHOLD ------------
     A THIRD OF THE FRAMES IS THE LINE THIS PRINTS AT, and it is a place to start reading rather
     than a rule: a splash that teaches something has earned a beat to read the answer on, and one
     that is calm has earned a slow cycle. What it is not allowed to be is a picture. */
```

