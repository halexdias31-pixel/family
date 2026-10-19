# check/pen.js

The full text of comments in `check/pen.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/pen.js A FINGER ON THE PEN:

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/pen.js

   A FINGER ON THE PEN: WHAT IT KEEPS, AND WHAT IT LETS ONTO THE PAGE (docs/history/338).

   *"they are just using their fingers"* -- the owner, 11 Oct, asked what the children draw with. The
   brief before it: *"drawing or editing with a finger (especially on tablets like an iPad or
   touchscreens) feels finicky, imprecise, and frustrating"*, naming *"accidental stray ink blobs while
   trying to pan"*.

   `js/check-flow.js` ASKS EVERY RULE OF THE CONTACT MODEL that jsdom can see. What only a browser can say
   is asked here, with REAL TOUCH through CDP (`Input.dispatchTouchEvent`, each contact its own id and
   radius, each move its planned timestamp) on the Tools whiteboard and on June 2024 1F Q7's card:

     two      a two-finger tap, pan and pinch on the armed board store and draw nothing, and the column,
              the page and the lock stay where they were
     pinchoff a pinch with one finger off the 180px figure at 320 (it lands on the card, not the ink)
     palm     a palm (radius 25) first, then a fingertip draws: the finger's line and nothing of the palm
     large    one large contact alone still draws -- size decides nothing until a device is measured
     tap      one fingertip tap is a dot
     cancel   a `touchCancel` 50ms in withdraws; one after 500ms and 200px keeps the line
     lost     a contact whose lift never came, then a real swipe off the pad: the column moves
     bar      a palm on Undo during a stroke, lifted before and after the finger: nothing undone
     drift    a palm down first beside the pad (the primary pointer), a finger draws, the palm drifts 30px
              sideways: the column does not move and the stroke is kept
     grip     a thumb gripping the screen's edge pans 40px with a finger (two fingers: nothing), then STAYS DOWN,
              still, while two lines are drawn: both are kept -- a hand gone still is not half of a pan (after review)
     settle   a thumb that rolls 9px as a line starts, a palm on the card that settles 12px, a palm that lands 120ms
              into a line and settles 10px: every line is kept -- a settle is not a second finger (after review)
     phase    a two-finger pan whose second finger reports 5ms out of phase, eight times: nothing, every time
     types    a stylus draws and a palm lands as the primary TOUCH; a finger draws and a mouse clicks beside the
              board: the stylus's line and the finger's line -- "primary" is per kind of pointer (after review)
     pin      on November 2019 1H Q4, a pin held on the compass's centre (and a ruler's end) and a second finger
              swinging round it: nothing stored, as before 338 -- a pin is not a palm (after review) -- and nothing
              either when the pin rolls 6px as the other swings (second review), or 12, 16 or 24px (third review), or
              settles 8-9px as it is put down and rolls 3-5 more, or rolls 12px in 200ms, beside a finger that starts
              slowly (fourth review); and from the second finger's landing nothing on the picture in any frame: a mark
              that cannot be kept is not shown
     palmtool on the same card, a palm (radius 25) resting on the picture, then a finger uses the pen, the ruler or
              the compass while the palm drifts 6px: never a mark at the palm. The palm down 120ms before: the
              finger's line, every tool; 400ms before: the pen's line, and the ruler's and compass's are the cost
              338 section 4 chose -- by movement a resting palm is a pin (second review). And (third review) the palm
              drifting 12, 16 or 24px over the line, or sliding 12px once the finger has lifted: never a mark, and
              nothing shown from the finger's landing; a ruler finger aiming while a palm lands, settles 12px and then
              slides 40px along with the line: the finger's line, shown as it is drawn. And (fourth review) a palm
              landing 120ms after a ruler or compass finger and settling 12px: the finger's line; the same palm lifting
              before the finger moves: the finger's line; the finger lifting still beside it: nothing; a palm 400ms
              first that settled 9px and drifts 2-4 more under a slow-starting finger, or 22 more while the refused
              finger pauses: never a mark, nothing shown; a palm first, a finger's 20px tick, then the palm sliding 15px
              -- with the pen and a 120px line after it, the line; else nothing, and nothing shown
     palmafter on the board and on Q7, at 390 and 820, the pen: a finger held still to aim, a palm landing after it (300ms
              or 1.5s) and settling 9, 12 or 16px, then the finger draws: never a mark at the palm, and the finger's
              line (at 16, the line or nothing -- section 4's cost); the palm settling and lifting first: the finger's
              line; the finger lifting still beside it: nothing, and nothing shown; and a finger landing after that tap
              while the palm drifts 12px more: the finger's line (fourth review)
     hold     a finger held 1.1s on the armed card: nothing selected, and the callout rule in style.css
     inv      the geometry the rules rest on: no zoomed ancestor, the ink's box is the picture's, 16px from the edges
     samples  a 1,200-sample zigzag at 8ms, 4x CPU: at least 95% of the distinct samples kept (about a third
              were, before); Q7's 120-sample drag keeps 114 or more; ONE box read per pen event and no path
              written inside one; NO FORCED LAYOUT inside a pen event, counted from a Chromium trace; at most
              TWO live `d`s written in any frame (the open chunk and one being frozen -- a frame's cost does not
              grow with the stroke); the path PAINTED IN THE FIRST FRAME after the event for 95% of events (no
              latency added); the live chunks, at a frame, are exactly `padPath_` of the points so far, and the
              path after the lift is `padPath_` of what was stored. All counts. Printed, not judged: the
              handler's p50/p95 (wall clock and the trace's thread time), the frames over 33ms, and how long
              from an event to the path's next write
     round    a fast circle (one turn in 200ms and in 120ms) is stored with no chord longer than 1.5 x its
              share of the circle, and on Q7 is DRAWN within 1.5px of round; a STARVED circle -- nine events a
              turn, what an iPad without coalesced events gives -- is drawn within 1.5px of round between its
              ends, where its polygon was 6% of the radius off, on the board and on Q7

   AND A POINT PUT DOWN EXACTLY (docs/history/357), at 390x844, 4x CPU, three seeds, a fingertip's +-4px wobble:
     plot      six taps on Q7's grid and on a made-up squared grid: six one-point strokes, each round() of its
               intersection and within 0.6px of it (0 of 6 before 357); the board keeps the same tap exactly as before
     plotfine  a closed loop on a 3.3px cumulative frequency grid -- the finger follows the loupe's crosshair, wobbling:
               6 of 6 exact within 1.5s each, three times; at 320 (2.1px squares) printed
     rulersnap a ruler line between two intersections ends on both; a bar's side drawn 3 degrees off upright is stored upright
     curve     six dots, then a freehand curve through them: the curve is the finger's own samples, the dots unchanged, the
               line within the wobble + 1.5px of the aim, within 3px of each dot, and no vertex turning 50 degrees
     loupe     on in the first frame for a dot on a fine grid, only after 300ms on a coarse one; following the finger in 95% of
               frames; never on from a second finger's landing (`shownWatch` counts it); gone after a lift, a cancel, `padDrop_`
     samples   (and) with the loupe open: no forced layout, two live writes a frame, painted in the first frame

   COUNTS AND GEOMETRY ARE PASS OR FAIL; TIMINGS ARE PRINTED. The machine is shared and a frame time is
   noise, but a coalesced sample arrives whatever the frame rate, and "what was stored" is not noise. The first
   build also JUDGED the handler's p95 against a backstop, gated on how many frames ran slow: the review found it
   almost never judged under load, failed once on unchanged code, and passed a mutation that added a frame of
   latency and one that forced a layout per event. Those two are counted now, and the time is printed.
   A section that cannot reach its subject -- no board, the pen not armed, no Q7 -- FAILS saying so.

     node check/pen.js                 everything
     node check/pen.js --only=two,palm some of it, for proving one rule by mutation
     node check/pen.js --verbose       every gesture's numbers, not only the failures
     node check/pen.js --shots         and pictures of what was drawn, for a person to read
   PEN_PORT pins the port; unset, the OS picks a free one. PEN_RATE=1 runs at full speed. PEN_QUERY=pen=sizes loads
   every page with the sizes line up.
================================================================================================== */
```

### THE PEN'S POINTERMOVE AT 4x CPU, p95:

top level, before `PEN_P95_MS`

```
/* THE PEN'S POINTERMOVE AT 4x CPU, p95: 3.3-3.4ms before note 338, a forced layout and a whole path per event;
   1.6-2.6ms after on a quiet machine (p50 0.2-0.6). PRINTED BESIDE ITS REFERENCE, NOT JUDGED (after review): the
   exact budgets are counted -- one box read and no path written per event, no forced layout in a trace, two live
   writes a frame, the path painted in the first frame -- and a time measures the neighbours on a shared machine. */
```

### THE BUDGET, COUNTED:

in `boot`

```
/* THE BUDGET, COUNTED: inside the document's pointermove listeners while a stroke is drawn, how many times
       the ink's box was read and how many `d`s were written -- and, timed for the record, how long they took
       and when the live path was next written. A capture listener added now runs after the app's own capture
       listeners and before the pen's; a bubble listener added now runs after the pen's. */
```

### ---------- THE FINGERS

top level, before `T`

```
/* ---------- THE FINGERS ------------------------------------------------------------------------------
   `T` sends one touch frame with its planned time. `stream` sends a list of frames on the wall clock
   WITHOUT waiting for each to be delivered -- a digitizer keeps reporting while the page is busy, which is
   what makes the renderer fold samples together under load, as a phone's does. */
```

### ---------- A CHROMIUM TRACE: FORCED LAYOUTS INSIDE THE PEN'S EVENTS, COUNTED

top level, before `traceStart`

```
/* ---------- A CHROMIUM TRACE: FORCED LAYOUTS INSIDE THE PEN'S EVENTS, COUNTED --------------------------------
   A layout or a style recalculation INSIDE a `pointermove`'s dispatch is a read after a write -- the cost 1b took out
   of the pen. Counted from the browser's own trace, so load cannot move it: the review's positive control was
   `?pen=sizes` as first built, 78 forced in 78 events. Thread time (`tdur`) is printed beside the wall clock. */
```

### A PLAN OF FRAMES, PLAYED ON THE WALL CLOCK -- for gestures where a hand and a finger each do their own thing.

top level, before `track`

```
/* A PLAN OF FRAMES, PLAYED ON THE WALL CLOCK -- for gestures where a hand and a finger each do their own thing. A track is
   one contact's `{t, p: [x, y, id, radius]}`, down from its first entry to its last; `plan` merges tracks into frames
   that list every point down at each moment (each contact where it last was), with a frame 8ms after each track's last
   entry from which it is gone. `play` sends them: a point new since the last frame goes down (`touchStart` lists every
   point down), a point gone goes up (`touchEnd` lists the ones that go -- CDP releases the points it lists), the rest
   move. As `stream`, it does not wait for each to be delivered. */
```

### WHAT THE PICTURE SHOWED FROM THE SECOND CONTACT'S LANDING, frame by frame (third review):

top level, before `shownWatch`

```
/* WHAT THE PICTURE SHOWED FROM THE SECOND CONTACT'S LANDING, frame by frame (third review): how many frames had a live
   preview or the ruler's or compass's aid on them. Where nothing either finger does can be kept -- a pin's or a resting
   palm's stroke while the other finger draws -- nothing may be shown either: the review watched a palm's own ruler line
   and ring follow it about the picture and vanish at the lift. Counted on every animation frame, so a preview shown for
   a single frame is found whenever the machine gets round to it. `shownWatch` before the gesture, `shownRead` after. */
```

### HOW FAR THE DRAWN PATH IS FROM ROUND, ON THE SCREEN:

top level, before `roundness`

```
/* HOW FAR THE DRAWN PATH IS FROM ROUND, ON THE SCREEN: the last stroke's `<path>` sampled with
   `getPointAtLength`, between its two end segments (a stroke's ends take the chord's direction -- 338), each
   point taken to the screen through the ink's box and measured against the circle the finger drew. */
```

### CDP's `touchEnd` RELEASES THE POINTS IT LISTS (an empty list releases every one) -- measured by both reviews of 11 Oct, and the first build had the two orders

in `r`

```
/* CDP's `touchEnd` RELEASES THE POINTS IT LISTS (an empty list releases every one) -- measured by both reviews of
             11 Oct, and the first build had the two orders the wrong way round. So the palm first lists the palm. And the
             order is asked of the pen itself between the two lifts, so a label can never again say the other one. */
```

### A THUMB GRIPPING THE SCREEN'S EDGE (radius 11) DOWN FIRST; a finger lands on the board and the two pan 40px SIDEWAYS together -- two fingers, nothing.

top level, before `th`

```
/* A THUMB GRIPPING THE SCREEN'S EDGE (radius 11) DOWN FIRST; a finger lands on the board and the two pan 40px
         SIDEWAYS together -- two fingers, nothing. (Sideways: a thumb on the column moving up or down is the browser's own
         scroll, which cancels the thumb's pointer -- measured, the first try of this section.) The finger lifts and the
         THUMB STAYS, still, while two lines are drawn: both kept. The pen as first built held the thumb in the dead
         gesture and drew neither (the review's `stuck.js`). */
```

### A TWO-FINGER PAN, 150px UP, WITH THE SECOND FINGER'S REPORTS 5ms OUT OF PHASE -- each finger's moves in their own dispatch, as a digitizer scanning them apart

top level, before `drew`

```
/* A TWO-FINGER PAN, 150px UP, WITH THE SECOND FINGER'S REPORTS 5ms OUT OF PHASE -- each finger's moves in their own
         dispatch, as a digitizer scanning them apart sends them. Eight times: judged by when each one's event arrived, the
         review drew 8 pans in 28 at 820 and 1024. Judged at each finger's samples' own time, none. */
```

### EACH FRAME'S CALLBACKS BEGIN:

top level, before `window.__fr`

```
/* EACH FRAME'S CALLBACKS BEGIN: `performance.now()` in a frame callback asked for before any of the pen's,
           so a write in a frame's callbacks comes after its tick and a write in an event handler before the next.
           And the live `d`s written since the last tick -- one frame's -- are put down at each. */
```

### A PALM LANDING AFTER AN AIMING FINGER:

top level, before `surf`

```
/* ==================== A PALM LANDING AFTER AN AIMING FINGER: the board and Q7, at a phone and an iPad ====================
     THE FOURTH REVIEW'S MUST-FIX (12 Oct). The pen hands a palm-first stroke to the finger that lands after it, at any age --
     and so, until this, to a PALM that landed after a finger held still to aim, once the palm's centre had moved 10px:
     its settle was shown in 28-48 frames and stored (`[[272,289,257,289]]` on the board, a 91-point squiggle on Q7), and
     the finger, a rest from then on, drew a line that was lost -- 16 of 16 at a 12 or 16px settle, where 4955c7c kept the
     line every time. A later contact is handed the stroke at 30px now, a lift hands nothing over, and the half rule tells
     the palm's settle from a second finger once the finger moves.
       aim    the finger on (0.2, 0.35) of the ink, trembling; the palm (radius 25) lands on (0.8, 0.85) `gap` ms later and
              settles S px in 80ms, then trembles; the finger draws half the ink's width over 400ms from `wait` ms after
              the palm landed: the finger's line at S 9 and 12, at 300ms and at 1.5s, and with the palm on the card off
              the ink; at 16 never a mark at the palm, and the line or nothing -- a settle over 15px moving with the
              finger is section 4's cost, printed and not failed
       brush  the same, the palm settling 12px and LIFTING before the finger moves: the finger's line
       tap    the finger LIFTS still while the settled palm stays: nothing at all, and nothing shown
       retap  the same tap -- the palm is left holding the stroke -- then a finger lands at +400, and the palm drifts 12px
              more before it moves 200ms later: the new finger's line, never a mark at the palm (an owner that came later
              is handed the stroke back only at 30px, even with a new finger beside it) */
```

### FINGER 1 ON THE CENTRE, HELD, TREMBLING UNDER A PIXEL; FINGER 2 LANDS 300ms LATER AT THE RADIUS AND SWINGS 270 DEGREES ROUND IT IN 60 MOVES 10ms APART

top level, before `cx`

```
/* FINGER 1 ON THE CENTRE, HELD, TREMBLING UNDER A PIXEL; FINGER 2 LANDS 300ms LATER AT THE RADIUS AND SWINGS 270 DEGREES
           ROUND IT IN 60 MOVES 10ms APART (the compass), or slides 40px (the ruler). Nothing stored, as before 338. AND THE
           PIN THAT ROLLS: from the moment finger 2 lands it drifts `drift` px over 300ms, as a fingertip held on a point does.
           Refused the swap, the pin was made the stroke again with 4px to go: a ruler line or a ring of radius 8 round itself,
           at 390 and 820 (second review); with the 10px that review gave it, the same at 12 and 16px (third review). */
```

### AND A PIN THAT SETTLED AS IT WAS PUT DOWN (fourth review):

top level, before `name`

```
/* AND A PIN THAT SETTLED AS IT WAS PUT DOWN (fourth review): 8 or 9px in its first 80ms -- under 10, still a dot --
         then rolling 3 or 5 more over 200ms once the second finger lands, which starts slowly (a hand's stroke: minimum
         jerk). The race counted the pin from its own down, so it was at 12 while the slow finger was at 10-12, and 2a89387
         stored the pin's ruler line `[[153,170,166,170]]` at 820. Counted from where it was when the other landed, it has
         moved 3-5px: nothing, and nothing shown. And a pin that rolls 12px in those 200ms: it is at 10 before the slow
         finger, and with the race still at 10px and "further", asked by the samples' clock, it stored its own ruler line
         `[[153,170,167,170]]` at 390 and 820 every time (2a89387 missed it only by when its frames ran). The race is to 30px:
         nothing. */
```

### A PALM (radius 25) RESTING ON THE PICTURE AT (0.85, 0.85), trembling under a pixel for `gap` ms; then a fingertip lands at (0.25, 0.4) and draws a 120px ruler

top level, before `cases`

```
/* A PALM (radius 25) RESTING ON THE PICTURE AT (0.85, 0.85), trembling under a pixel for `gap` ms; then a fingertip lands
         at (0.25, 0.4) and draws a 120px ruler line or a pen line, or opens the compass 60px and swings it. `how` is what the
         palm does meanwhile:
           first   drifts 6px in the finger's first 120ms (second review: the palm's own 7-unit line and a ring of 10 points
                   round it, the finger's lost)
           spread  drifts `drift` px over the finger's whole stroke (third review: with round 2's 10px, the palm's line or
                   ring at 12, 16 and 24px)
           after   still while the finger draws, then slides 12px over 600ms once it has lifted (third review: the same)
           aim     the FINGER first, aiming 300ms; the palm lands, settles 12px in 80ms, and slides 40px along with the line:
                   the finger is the one drawing, and its line is kept and shown (the review's prototype lost it). And
                   (fourth review) the palm landing 120ms after a ruler or compass finger and settling 12px, then still:
                   within `PAD_TOGETHER_MS` the tools hand a later contact the stroke, and 2a89387 handed it to the palm at
                   its 10px -- its ruler line `[[289,289,274,289]]` or a ring round it; the finger's line now
           brush   the same palm, 120ms after, settling 12px and LIFTING before the finger moves: the finger's line (a lift
                   handed the palm the stroke, fourth review)
           tap     the same palm, and the FINGER lifts still while it stays: nothing at all, and nothing shown
           headstart  the palm 400ms first settles 9px in 80ms (still a dot), then drifts 2-4px more over the first 200ms of a
                   finger that starts slowly (fourth review: the race counted the palm from its own down, and 2a89387 stored
                   its line or ring in 4 of 8 ruler and 3 of 6 compass runs in one pass, 3 of 8 and 1 of 6 in another)
           pause   the palm 400ms first settles 9px; the finger goes 12px in 40ms -- refused, the race begins -- and
                   pauses 400ms while the palm drifts 22px more, then draws on: 31px from the palm's own down, 22 from
                   where it was when the finger landed -- never a mark (counted from its down, the palm's line or ring)
           alone   the palm first (the pen 400ms, the ruler 100ms); a finger ticks 20px and lifts -- not handed the stroke,
                   338 section 4's cost -- and the palm, left alone holding it, slides 15px as the hand moves on; with the
                   pen, a finger then draws 120px: its line, and never a mark at the palm; without it, or with the ruler,
                   nothing at all and nothing shown (fourth round: the palm left alone was handed the stroke back at 10px --
                   its slide drawn and stored, and the 120px line after it lost)
         Never a mark at the palm, never a mark that is not the finger's. The finger's line at 120ms, every tool, and with the
         pen at 400ms; with the ruler and the compass at 400ms nothing at all -- the cost chosen in 338 section 4, printed
         and not failed, so that a later decision to give tools the palm-first swap back changes only the note and this
         comment -- and then NOTHING SHOWN from the finger's landing on. */
```

### THE FINGER FIRST, held on its point; the palm at `gap` settling `drift` px in 80ms, then trembling; the finger draws its 120px over 400ms

top level, before `go`

```
/* THE FINGER FIRST, held on its point; the palm at `gap` settling `drift` px in 80ms, then trembling; the finger
             draws its 120px over 400ms (the compass: opens 60px in 160ms and swings half a turn) from 400ms after the palm
             landed. `brush`: the palm lifts at +250, before the finger moves. `tap`: the finger lifts still at +250. */
```

### THE PALM FIRST, settling `drift` px in 80ms and trembling; the finger at `gap` goes 12px in 40ms and pauses until +440, the palm drifting `more` px from +250

top level, before `t`

```
/* THE PALM FIRST, settling `drift` px in 80ms and trembling; the finger at `gap` goes 12px in 40ms and pauses until
             +440, the palm drifting `more` px from +250 to +400 -- long after the frame that refused the finger, even under
             load -- then the finger draws on: a 120px ruler line, or the compass opened to 60 and swung half a turn. */
```

### THE PALM FIRST, settling `drift` px in its first 80ms and trembling; the finger at `gap`, starting slowly:

top level, before `t`

```
/* THE PALM FIRST, settling `drift` px in its first 80ms and trembling; the finger at `gap`, starting slowly: a 120px
             ruler line over 600ms, or the compass opened 60px over 480ms and swung; the palm drifts `more` px over the
             finger's first 200ms. */
```

### THE PALM FIRST, trembling; at `gap` a finger 0.25 of the picture below the line's start ticks 20px in 100ms and lifts; the palm slides `drift` px from +250 to

top level, before `ft`

```
/* THE PALM FIRST, trembling; at `gap` a finger 0.25 of the picture below the line's start ticks 20px in 100ms and
             lifts; the palm slides `drift` px from +250 to +400 and trembles; `then`, a second finger draws 120px from +600
             over 400ms, and the palm lifts at +1100 (else at +600). */
```

### THE FINGER FIRST, held on its point; the palm at `gap`, settling, still; then the finger draws its 120px over 600ms while the palm slides 40px along.

top level, before `go`

```
/* THE FINGER FIRST, held on its point; the palm at `gap`, settling, still; then the finger draws its 120px over
             600ms while the palm slides 40px along. The finger waits 600ms after the palm lands: the settle has to be
             told apart from the finger first (338 T4) -- the review's frame trace at 4x CPU under load had frames 100-230ms
             apart, and a settle still undecided when the finger moves reads as a hand moving WITH it (round 1's cost). */
```

### A POINT PUT DOWN EXACTLY (docs/history/357):

top level, before `PLACE`

```
/* ==================== A POINT PUT DOWN EXACTLY (docs/history/357): plot, plotfine, rulersnap, curve, loupe ====================
     THE OWNER, 18 OCT: *"how are the students supposed to answer it by using there fingers to draw such a fine line"*.
     Measured before 357 with these gestures: 0 of 6 taps on Q7's intersections, every one a five-point squiggle. Real touch,
     390x844, DPR 2, 4x CPU, three seeds. A fingertip's wobble is uniform +-4px on each axis at the landing and on every
     sample after it -- the worst radial error is 5.66px. What is judged is what is STORED: round() of the intersection,
     within 0.6px of it on the screen. Pen positions are picked from the app's own grid reading (`padLattice_`), so the
     aim is the grid the child sees. */
```

### THE TURN AT EACH VERTEX OF THE DRAWN LINE AS A PERSON SEES IT -- read every 12px along it, its end chords left out.

in `res`

```
/* THE TURN AT EACH VERTEX OF THE DRAWN LINE AS A PERSON SEES IT -- read every 12px along it, its end chords left out.
             Every 2.4px sample is kept and drawn (nothing filters a line), so between two samples the wobble itself turns. */
```

