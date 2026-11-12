# js/find-pad.js

The full text of comments in `js/find-pad.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### WHAT A DRAG MAKES, BY TOOL.

top level, before `PAD_DRAW`

```
/* WHAT A DRAG MAKES, BY TOOL. `move` answers the stroke to preview (null: nothing new); `end` answers
   the stroke to keep (null: nothing -- a tap is a dot to the pen, and to a ruler or a compass a slip). */
```

### ONE POINT PER PIXEL OF THE PICTURE, not one per event.

in `pen`

```
/* ONE POINT PER PIXEL OF THE PICTURE, not one per event. A pointer fires far faster than a
       finger moves anything visible, and every duplicated point is two more characters in storage
       for a mark nobody can see. */
```

### A SHORT STROKE IS DRAWN EXACTLY AS MOVED:

in `move`

```
/* A SHORT STROKE IS DRAWN EXACTLY AS MOVED: the string engages once the pointer is more than its length from where it went down -- a tick, a cross's arm (368) */
```

### A CLICK THAT NEVER MOVED IS A PLOTTED POINT:

in `end`

```
/* A CLICK THAT NEVER MOVED IS A PLOTTED POINT: onto the grid or the figure's point as a finger's is (357), never onto your own mark, where it would vanish */
```

### A RULER IS ITS TWO ENDS.

in `PAD_DRAW`

```
/* A RULER IS ITS TWO ENDS. The live line follows the finger from where it went down; what is kept
     is that line and nothing of the path the finger took to get there. */
```

### AND A HALO ROUND A SNAP THAT IS HOLDING (357):

in `padAid_`

```
/* AND A HALO ROUND A SNAP THAT IS HOLDING (357): 30px on the screen, an ellipse in the stretched units so it
     is round where it is seen. Shown, never stored -- the aid is emptied at the lift. */
```

### AND WHERE THE FINGER IS ABOUT TO BE (374):

in `padAid_`

```
/* AND WHERE THE FINGER IS ABOUT TO BE (374): the platform's prediction, one short segment, never stored -- the next frame replaces it */
```

### HELD: the stroke is kept (`PAD_ST`, `PAD_GO`, so `padHold_` and `findKeep_` still hold its column) and

top level, before `PAD_HUSH`

```
/* HELD: the stroke is kept (`PAD_ST`, `PAD_GO`, so `padHold_` and `findKeep_` still hold its column) and its samples go on accumulating, but nothing of it is on § */
```

### `?pen=sizes` IN THE ADDRESS:

top level, before `PAD_SIZES`

```
/* `?pen=sizes` IN THE ADDRESS: the last eight contacts' widths, on the screen -- the reading increment 2
   waits for. Nothing reads it but the line that shows it. */
```

### A CONTACT'S SIZE: the larger of its two sides, and only when the platform reports one -- 1 (or 0) is

top level, before `padSizeOf_`

```
/* A CONTACT'S SIZE: the larger of its two sides, and only when the platform reports one -- 1 (or 0) is
   "not known", which is what a mouse, iOS before 18 and Android's `pointerup` say. */
```

### WHETHER A FINGER IS ON THE ARMED DRAWING -- the swipe engine asks this before it takes a gesture

top level, before `padBusy_`

```
/* WHETHER A FINGER IS ON THE ARMED DRAWING -- the swipe engine asks this before it takes a gesture (overworld.js, the axis decision), so a palm or a thumb that § */
```

### A PEN IS IN USE WHILE A STROKE OR A CONTACT IS ON IT, not merely for being the last pad touched:

top level, before `padInUse_`

```
/* A PEN IS IN USE WHILE A STROKE OR A CONTACT IS ON IT, not merely for being the last pad touched: with no lock (368) nothing else ever lets go of it. */
```

### AND WHERE IT HAS GOT TO:

top level, before `padTrack_`

```
/* AND WHERE IT HAS GOT TO: how far from where it went down, and when it last really moved. A "move" is
   `PAD_ALSO_PX`, so a resting palm's tremble is not a contact on the move. */
```

### A STEADY HAND FOR A MOUSE OR A STYLUS (368):

top level, before `PAD_STRING_PX`

```
/* A STEADY HAND FOR A MOUSE OR A STYLUS (368): a lazy brush -- the ink follows the pointer on a string -- then a light low-pass. A finger keeps 357's ink under it, untouched */
```

### THE LONGEST RUN OF EVEN STEPS -- an axis drawn a little off the grid, or a frame round it, ends a run

in `run`

```
/* THE LONGEST RUN OF EVEN STEPS -- an axis drawn a little off the grid, or a frame round it, ends a run, not the grid. */
```

### ONE PLACEMENT: the finger's point (units) through the slow mode and the snap, back to WHOLE units -- what

top level, before `padPlace_`

```
/* ONE PLACEMENT: the finger's point (units) through the slow mode and the snap, back to WHOLE units -- what is stored is always whole numbers § */
```

### ---------- HOLD TO STRAIGHTEN (374): a pen line paused at its end becomes straight, a ring round, an arc an arc

top level, before `PAD_HOLD_MS`

```
/* ---------- HOLD TO STRAIGHTEN (374): a pen line paused at its end becomes straight, a ring round, an arc an arc -- QuickShape's gesture. A quick stroke is kept as drawn */
```

### WHAT A RUN OF POINTS (px) WAS MEANT TO BE:

top level, before `padShapeOf_`

```
/* WHAT A RUN OF POINTS (px) WAS MEANT TO BE: a line, or -- the whole stroke only -- a ring or an arc; null leaves it as drawn */
```

### AN ARC IS HELD TO TIGHTER:

in `padShapeOf_`

```
/* AN ARC IS HELD TO TIGHTER: a sketched curve (a parabola, a sine) paused at its end must not turn into a circle's piece */
```

### A STRAIGHTENED END (px):

top level, before `padEndAt_`

```
/* A STRAIGHTENED END (px): through the grid's snap, the ruler's level/upright lock against the other end, and back onto the stroke's own start to close a shape */
```

### THE PAUSE, ACTED ON:

top level, before `padStraighten_`

```
/* THE PAUSE, ACTED ON: the run since the last corner replaced by its shape, shown at once; a line's end is a corner the pen goes on from */
```

### THE TREMBLE OF THE PAUSE ITSELF IS NOT THE SHAPE:

in `padStraighten_`

```
/* THE TREMBLE OF THE PAUSE ITSELF IS NOT THE SHAPE: the points still inside the pause's zone are left out, the finger's place put back */
```

### ---------- A FINGER'S NEXT FEW MS, PREDICTED (374; 338 section 9's revisit): preview only, at most `PAD_PRED_PX`

top level, before `PAD_PRED_PX`

```
/* ---------- A FINGER'S NEXT FEW MS, PREDICTED (374; 338 section 9's revisit): preview only, at most `PAD_PRED_PX` ahead, a finger's freehand line only */
```

### A PLACEMENT, PUT DOWN (357):

in `padStart_`

```
/* A PLACEMENT, PUT DOWN (357): the pin and the ruler's first end where they snap, and the pen's touch a
     DOT -- one point -- until it has gone `PAD_DOT_PX`. Not on the board: it never snaps, and its taps are as before. */
```

### A MOUSE OR A STYLUS IS NOT PLACING A DOT:

in `padStart_`

```
/* A MOUSE OR A STYLUS IS NOT PLACING A DOT: it lands where it is put, so an arrowhead's 8px stroke stays a stroke and is not snapped onto the shaft (368) */
```

### THE PREVIEW, DRAWN WHOLE FROM EVERY SAMPLE KEPT -- at the start, and when a hold resolves.

top level, before `padLiveShow_`

```
/* THE PREVIEW, DRAWN WHOLE FROM EVERY SAMPLE KEPT -- at the start, and when a hold resolves. Now, not at
   the next frame: the dot is under the finger the moment it lands. */
```

### NOR WHAT CANNOT BE KEPT:

in `padLiveShow_`

```
/* NOR WHAT CANNOT BE KEPT: a pin's or a palm's ruler line or ring while it is not known to be the one drawing (`padRace_`)
     -- the third review watched a palm's line and ring follow it round the picture and vanish at the lift. */
```

### NOBODY HAS GONE 10px AT A MOMENT ALL HAVE REPORTED -- though one has by its own latest:

in `padJudge_`

```
/* NOBODY HAS GONE 10px AT A MOMENT ALL HAVE REPORTED -- though one has by its own latest: the others' reports are
       still coming. Asked again at the frame after their next event; a lift decides it. */
```

### REFUSED, SO THE STILL ONE IS THE STROKE AGAIN -- and a ruler's or a compass's still owner is a PIN or a

in `padAlone_`

```
/* REFUSED, SO THE STILL ONE IS THE STROKE AGAIN -- and a ruler's or a compass's still owner is a PIN or a PALM until it shows otherwise. § */
```

### THE RACE STARTS WHERE THE STILL ONE WAS WHEN THE FIRST REFUSED ONE LANDED (fourth review), by the

in `padAlone_`

```
/* THE RACE STARTS WHERE THE STILL ONE WAS WHEN THE FIRST REFUSED ONE LANDED (fourth review), by the samples' clock: § */
```

