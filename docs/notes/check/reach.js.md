# check/reach.js

The full text of comments in `check/reach.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/reach.js WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/reach.js

   WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE.

   THE OWNER, 11 Oct: *"If I scrol fast left right up or down it's still clunky. I think because it only
   loads things which are close to pov. Increase loading scope. Make it more massive so it's never really
   an issue."* Measured that day at 4x CPU on a phone and an iPad (docs/history/341), in runs of fast
   flicks: a black hole where a built card was in 5–43% of a run's frames (cards hidden by their distance
   from the page each column was GOING to, while the slide carried them across the glass); widget cards
   under the loader for 1–4s of every arrival; a sideways sweep with whole columns transparent; and Find's
   pages outrun by the flicks. The fix is a band down each column and across the row, measured in pixels,
   and one builder that draws everything a flick can reach in the quiet before it gets there.

   THIS IS THE INSTRUMENT THAT MEASURED IT, cut down to what must never come back. The real app, served from
   this tree, in Chromium at FOUR TIMES SLOWER CPU (`Emulation.setCPUThrottlingRate`, a 2019 iPad's main
   thread on this machine), signed in as a student over the fixture with a feed of forty photographed posts
   and a Saved column of starred widgets (the fixture's own shape, `heavy_` below) — at 390x844 and
   820x1180, the phone and the iPad. Real touch through CDP (`Input.dispatchTouchEvent`, each move carrying
   the time it was meant to happen, as check/swipe.js does), five flicks a second. Every frame is read
   AFTER it is painted (a `requestAnimationFrame` that posts a message), and what a person would see is
   written down:

     HOLE              a page on the glass drawn at opacity .05 or less, or hidden: black where a card is
     EMPTY             a result page on the glass with nothing in its pane: a card not built
     LOADER            a loader on the glass: something drawn only once it was arrived at
     TRANSPARENT       a column across the glass at opacity .05 or less, with pages on it
     RUNNING OFF GLASS a widget running (`TOOLS_ON`) beside the column in front with no slot on the glass,
                       asked once each run has come to rest — drawn ahead is not started
   and three more, from the review of 12 Oct (docs/history/341, "After review"):
     BOOT LOADER       a column on the glass (or, on a phone, the one either side — the peek) still holding
                       the boot's markup after a sideways landing, the builder held so only the landing draws
     PICTURE GONE      a picture on the card in front, drawn before a landing that changed nothing, not drawn
                       during it — the landing wrote the column in front again (the Feed, at rest)
     NOT ASKED AHEAD   at rest after a placement on the Feed or the Boxing shelf: a picture still `lazy` on the
                       pages k−2…k+6 in front, or P−1…P+2 beside it, or one of the next two neither drawn nor
                       being decoded (`picsAhead_`, posts.js)

   THE RUNS, each from rest (the builder done — `aheadBusy_()` false): Find down a 76-question paper and
   back (15 flicks each way); the Resources column's Boxing shelf, with photographs; the Feed from its
   top; the whole row swept in bursts of four flicks, both ways; and Tools ARRIVED AT after a landing
   (`landRepaint_`, what the payload and the inbox do) and the quiet after it, then flicked down and back.
   After review: Find REPAINTED with the card in front three into the paper, then turned once (an iPad
   showed the pages above as empty shells); the Feed LANDED ON three times at rest; and, on a fresh load
   with the builder held, the row flicked sideways four times — each landing must draw what it shows.

   IT ASSERTS OUTCOMES, NEVER TIMINGS. A frame that took 400ms on this shared machine is noise; a frame
   that showed a black hole is a fact whatever the machine. Late pictures are not asserted (a picture
   arrives when the network says), and two loaders are allowed: the reels widget's when its fact is a
   clip — a `<video>` with no source is a black box, and the loader is its honest face (`feedPaint_`,
   overworld.js) — and the camera's on the Feed's page in front while it is being asked for, a wait for the
   hardware (`camStart_`, posts.js). Both are reported, not failed; the camera card OFF its page is the dark
   viewfinder, and a loader there fails. A run that could not reach its subject fails, saying so.

     node check/reach.js                    both sizes, every run
     node check/reach.js --only=find,sweep  some of them: find res feed feedland findland sweep tools bootglass
     node check/reach.js --width=820 --verbose
   REACH_PORT pins the port; unset, the OS picks a free one, so parallel runs cannot collide.
================================================================================================== */
```

### ---------- THE FIXTURE, WITH ENOUGH IN IT TO SHOW A FEED AND A SAVED COLUMN

top level, before `heavy_`

```
/* ---------- THE FIXTURE, WITH ENOUGH IN IT TO SHOW A FEED AND A SAVED COLUMN -------------------------
   Every key and shape doGet sends, as check/fixture.json has them, plus forty posts shaped like its first
   (photographs as Drive links, every fifth with three), a photograph on each shop item and thirteen
   stars — ten widgets, two shop items, a tutor — so Saved is a column of cards. The fixture alone has two
   posts and no stars: a feed and a Saved column too short to outrun. */
```

### THE TWO ALLOWED: the reels widget veiled because its fact is a clip (`feedPaint_`), and the camera being asked for on the Feed's page in front — a wait for the

in `scan`

```
/* THE TWO ALLOWED: the reels widget veiled because its fact is a clip (`feedPaint_`), and the camera
             being asked for on the Feed's page in front — a wait for the hardware, between the ask and its first
             frame (`camStart_`). Off its page the camera card is the dark viewfinder, and a loader there fails. */
```

### THE FEED LANDED ON, AT REST — three landings that change nothing, as the inbox's does two seconds after every signed-in open.

top level, before `front`

```
/* THE FEED LANDED ON, AT REST — three landings that change nothing, as the inbox's does two seconds after every
       signed-in open. The card in front keeps its pictures (review, 12 Oct: the landing drew the column in front
       from nothing, and its pictures went for 120ms and more each time). */
```

### FIND REPAINTED WITH THE CARD IN FRONT THREE INTO THE PAPER, then turned once — a star, a save or a landing draws the window again from nothing; on an iPad the

top level, before `STUFF.q`

```
/* FIND REPAINTED WITH THE CARD IN FRONT THREE INTO THE PAPER, then turned once — a star, a save or a landing
       draws the window again from nothing; on an iPad the pages above the card in front sat on the glass as
       empty shells until the builder reached them (review, 12 Oct). Then the same after a landing. */
```

### THE ARRIVAL IS WHAT IS ASKED HERE, NOT THE GESTURE (swipe.js asks that).

top level, before `reached`

```
/* THE ARRIVAL IS WHAT IS ASKED HERE, NOT THE GESTURE (swipe.js asks that). On a shared machine at 4x a
         240px flick across an 820 glass is under a third of it and is carried by its speed alone, and the
         speed is what a starved main thread reads wrong: twice it stayed on Settings. So the column is
         waited for, and a flick that did not take is followed by one more than half the glass long. */
```

### A FRESH LOAD, THE BUILDER HELD, THE ROW FLICKED SIDEWAYS FOUR TIMES:

top level, before `where`

```
/* A FRESH LOAD, THE BUILDER HELD, THE ROW FLICKED SIDEWAYS FOUR TIMES: every landing draws the columns it shows
       (`bootGlass_`, shell.js). The builder would have drawn them in a quiet moment; a hand that keeps moving gives
       it none, and the hold is that hand (review, 12 Oct: Reels and Find on the boot's loader at 1280). */
```

