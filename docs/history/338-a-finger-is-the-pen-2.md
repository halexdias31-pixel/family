# 338-a-finger-is-the-pen (part 2 of 4)

Continues [part 1](338-a-finger-is-the-pen.md).

### 11. Every parameter

| name | value | unit | increment |
|---|---|---|---|
| `PAD_STILL_PX` | 10 | px | 1 |
| `PAD_ALSO_PX` | 5 | px | 1 |
| `PAD_TOGETHER_MS` | 200 | ms | 1 |
| `PAD_TOGETHER_PX` | 200 | px | 1 |
| "moving" (already down) | 10px from its down and a 5px move ≤ 200ms ago | px, ms | 1 |
| `PAD_BAR_MS` | 400 | ms | 1 |
| `PAD_KEEPUP_PX` *(after review; round 4: also the hand-over to a later contact, at a lift too, and both sides of the pin rule's race)* | 30 | px | 1 |
| `PAD_WITH` *(after review)* | 0.5 | — | 1 |
| `PAD_LAG_MS` *(after review)* | 40 | ms | 1 |
| a two-finger gesture in progress *(after review)* | a member moved 5px in the last 200ms | px, ms | 1 |
| `PAD_CHUNK` | 128 | segments | 1 |
| `PAD_CORNER_DEG` | 50 | degrees | 1 |
| `PAD_CURVE_MIN` | 8 | units across | 1 |
| control-point precision | 1 | decimal | 1 |
| aspect k | 4/3 board; viewBox h/w; else 1 | — | 1 |
| `?pen=sizes` | last 8 contacts | — | 1 |
| loupe dwell start / mid-stroke | 300 within 10 / 400 within 8 | ms, px | 2 |
| loupe diameter, zoom, rise, rim gap, margin, hysteresis | 128, 2x, 112, 48, 8, 40 | px | 2 |
| `PAD_PALM_PX` | 120 provisional, from the reading | px | 2 |
| palm ratio; calibration | 2x (larger ≥ 48); max(96, 2 x median of 5) | px | 2 |
| snap CAP | 24 own, 20 crossings and figure | px | 3 |
| snap factor; release; merge | 0.45 x nearest; 1.25r; 2px | — | 3 |
| crossings cap / budget | 300 / 2ms at 4x | — | 3 |
| halo | 30 radius, 1.5 stroke, 0.6 opacity | px | 3 |
| compass equal / close / rest | ±10px / ≥ 270° and ≤ 20px / 80ms within 6px | — | 3 |
| `--css-version` | `2026-10-11-finger-pen-1` / `-2` / `-3` | — | each |

### 12. What increment 1 did

#### 1a — no mark that was not meant

js/find.js: the contact model above (`PAD_TOUCH`, `PAD_HUSH`, `PAD_TWO`, `PAD_DUE`, `padLand_`, `padRules_`,
`padDecide_`, `padGone_`, `padCommit_`, `padDrop_`, `padAway_`, `padBusy_`, `padRested_`), `padAt_` replaced
by the pure `padMap_`, the Undo/Clear guard, `contextmenu`, the page events, `?pen=sizes`, `padDrop_` in
`padWhoChanged_` and `q-draw`, and the comment over the listeners amending 310. js/overworld.js: the one line.
style.css: the selection rule, `.pad-sizes`, `--css-version` `2026-10-11-finger-pen-1`.

**Proved.** check-flow: two new journeys — on a question's pad, the two-finger tap (either finger first), pan
(5px and 15px steps), pinch then a drag, a third finger, the palm first (exactly the finger's line, from its
own first point), a finger held 300ms then a palm (every sample, the preview back within a frame), a brush,
the staggered pans (150ms after 30px, 300ms after still), a thumb-and-finger pinch, the two cancels, a lost
lift then a primary touch; on the board, 310's palm timed at +350ms, a hand on the card and a finger moving
together, a hand resting a second then drifting while the finger draws, a hand already down and a finger
moving together, a repaint while held, Undo and Clear while a finger draws, a change of person while held.
Each asks the store, that no preview, aid or contact is left and that `padBusy_` has let go. The 15 existing
pen journeys pass unchanged.

**Mutations, each red on its own and the real files green after** (byte-compared): second contact always a
rest; a second finger takes over (pre-310); no swap; cancel always commits; cancel always withdraws; no T0;
no off-ink tracking; no overworld guard; no watched rule; no bar guard; no `PAD_TOGETHER_PX` gate (310's own
journey goes red); every owner young; the tentative window 0.

**`check/pen.js`** (new, on the roster): every case above that the unchanged 4955c7c failed now passes at 390
and 820 — the two-finger gestures, the palm, the early cancel, the pinch off Q7's figure at 320, R1 — plus the
lost lift (a planted stale contact, then a real swipe: the page turns) and the invariants: no zoomed ancestor,
the ink's box the picture's, and the ink at least 16px from the sides and the bottom (smallest: 48px, Q7 at
320).

#### 1b — every sample

js/find.js: `padSamples_` (the coalesced samples, or the event itself), one box read per event shared by its
samples, the pen's live path written once a frame (`padFrame_`, `padChunks_`) in chunks of `PAD_CHUNK` = 128
segments through `padSegs_` — the one segment writer the stored path shares — and the lift flushing it:
the frame cancelled, the stroke stored from every sample fed and drawn from what was stored, the chunks one
path. Every `[data-live]` lookup is a list. The ruler and the compass stay synchronous.

**Measured with `check/pen.js --only=samples`, the same script against the unchanged 4955c7c and against 1b,
back to back, 4x CPU, load average 2.1 then 3.3:**

| | before | after 1b |
|---|---|---|
| zigzag at 390, distinct samples kept | 421 of 1,201 (35%) | 1,201 of 1,201 (100%) |
| zigzag at 820 | 376 of 1,201 (31%) | 1,201 of 1,201 (100%) |
| Q7, a 120-sample drag, points kept (320 / 390) | 43 / 39 | 121 / 121 |
| pen `pointermove` handler p50 / p95, 390 | 1.2 / 3.4ms | 0.3 / 2.1ms |
| the same, 820 | 1.1 / 3.3ms | 0.6 / 2.0ms |
| ink box reads per pen event | 1 (then a forced layout) | at most 1, on clean layout |
| path writes inside a pen event | one per event | none |
| event → the live path's next write, p50 / p95 | 1.1 / 3.3ms (inside the handler) | 5.7 / 16.2ms (in the next frame's callbacks) |
| **painted in the first frame after the event** | **100%** | **100%** |
| frames over 33ms (390 / 820) | 21 of 624 / 21 of 627 | 39 of 602 / 34 of 611 (a later run, load 1.7: 23 of 619 / 20 of 625) |
| the board's stored zigzag | 20 points, 145 chars | 14 points, 104 chars |

The write moved from inside the handler to the next frame's callbacks, and both are painted by the same
frame: **no latency added**, which is the design's claim measured rather than argued. The board's stroke is
*smaller* stored: every sample gives the 1-unit thinning a truer line to fit than one sample in three did.
A fuller run of the check, beside the other sections on a busier machine, had 90 of 545 frames over 33ms and a
3.1ms p95 — load; the same section alone measured the line above. So the handler's time was judged against a
backstop (3.0ms in the code; this note said 2.5) only when the frame record showed a machine that kept up (no
more than 8% of frames over 33ms), and printed either way; the COUNTED budget — one box read, no write inside an
event — is judged always. *(After review the time is printed only, beside its 3.0ms reference, and what it stood
for is counted: see "After review", 6.)*

check-flow: one journey — six folded samples in one event, one with no `pointerId` (every one kept, the repeat
dropped, ONE box read); an event whose list is empty (its own point); the box read again after the pad moved
50px under the finger; before a frame the live path is behind, after one it is exactly `padPath_` of the points
so far; the last two points, moved after the last frame, are the stored stroke's end and the drawn path is
`padPath_` of what was stored; a 300-point stroke is three chunks that join into `padPath_` of it, and one path
after the lift.

**Mutations, each red on its own and the real files green after:** coalesced samples ignored (`[e]`); the box
read per sample; the box kept from the down (C's cache); no flush on the lift (the drawn path behind the store);
samples left for a frame with no flush (the last points dropped from the store); no chunks; the path written per
event instead of per frame.

#### 1c — round when fast

js/find.js: `padSegs_` (corner-keeping centripetal Catmull-Rom, §6), `padPath_(st, k)` through it, `padAspect_`
(4/3 for the board, a figure's viewBox h/w, else 1) written on `.qpad` as `data-aspect`, and that one number read
by the live path (`PAD_GO.k`), the lift, `padRepaint_`, `usesInk_` and `usesSeen_`. Nothing stored changes.

**Measured with `check/pen.js --only=round`, 4x CPU, load average 0.6:**

| | before 338 | after |
|---|---|---|
| one turn in 200ms, board at 390 | 10 points, chord 114px, a lopsided 9-gon | 26 points, chord 25px, 0.46px off round between its ends |
| one turn in 120ms, board at 390 | 9 points, chord 115px | 16 points, chord 40.7px, 0.41px off round |
| the same on the iPad board (820), 200 / 120ms | 9 points, chord 227px / 8, 200px | 26 / 16 points, chords 34.6 / 56.4px, 0.71 / 0.61px off round |
| Q7 at 390, 200ms | 11 points, a polygon | 26 points, drawn 0.41px off round |
| **a starved circle — 9 events a turn, nothing folded (an iPad without coalesced events)** | a 9-gon, 5.9–8.1px off round | **drawn 0.53px (Q7), 0.87px (board 390), 1.27px (board 820) off round** |
| Q7 at 390, 200ms, `getCoalescedEvents` deleted (reported, not judged) | — | 9–11 irregular points, chords up to 137px: 16–27px off round — where the events came unevenly, a vertex turns past 50° and keeps its corner |

**Looked at** (a scratch script, real touch at 4x, the same strokes on the unchanged 4955c7c and on this branch:
a fast circle, a slow wobbly line, handwriting — a row of joined loops — a dot, a ruler line and a compass arc,
on Q7's face, on a made-up surface (KS2 2024 P2 Q1's grid), on the board, and the ruler and compass on November
2019 1H Q4, at 390x844 and 820x1180): the circle a 7–9-gon before and round after on every pad and size; the
handwriting's loops smoother on the board; the slow line, the dot, the ruler line and the compass arc drawn as
before. **One thing a screenshot shows that the maths said:** a circle drawn as one closed stroke keeps a point
at its seam — the stroke's two ends take their chord's direction (§6). It is the polygon's own 40° vertex, the
other eight gone; closing a seam was declined (§9). If a device screenshot of a child's circles shows it, closing
a stroke whose first and last points coincide is the change.

**Storage, measured** (a wave across the board, 150 samples at 8ms, 4x, the way 310 measured one): stored 181–211
characters before and 226 after (1.07–1.25x, inside the 1.3x expected — every sample gives the thinning a truer
line, so a wave keeps 30 points where it kept 24–28); so a board holds about 442 such waves where it held 473–552.
A question's drawing (the visual set on Q7) is 2,446 characters stored where it was 1,349–1,502 (1.6–1.8x, under
the 3x at which question strokes would be thinned locally); the account copy is thinned at 1 unit on the way, as
before. **The board at its ceiling** (442 of those waves, 99,840 characters): the drawn `d` is 345K characters
against 99K (3.5x — over the 2.5x expected, because a thinned board stroke is all long, gentle segments, the very
case curves are written for), and `padRepaint_` — what Undo and Clear run — takes 82–95ms median at 4x (max
101–121) against 27–40ms. Under the 100ms at which `PAD_CURVE_MIN` was to be raised for the board, by its median;
over it at the worst run. Recorded as the first change to make if Undo on a full board is ever seen to lag.

check-flow: one journey — today's string byte for byte for a dot, two points, a repeated pair, a square, a
triangle, 310's stroke, a ruler line, a malformed list (an odd length, NaN, Infinity) and a dense stroke at
k = 1, 0.5 and 4/3, and for every stroke this file's journeys store; an L keeps its corner; a 12-gon of radius
100 is drawn 0.17 units off its circle between its ends (the bound is 0.5) and its two end segments under the
polygon's own 3.4; a 9-point ring curves and a hexagon does not; a circle stored round on the 3:4 board is round
drawn with k = 4/3 and different with k = 1; duplicates and a straight run draw no NaN; and on a pad,
`data-aspect` is 1 for a square figure and 0.5 for a 340x170 one, an old fast circle (whole numbers, as every
device stores them) is drawn round through every stored point, an old ruler line is `M50 100L200 180`, a repaint
draws with the pad's own aspect, and the stored value is byte for byte what it was.

**Mutations, each red on its own and the real files green after:** `PAD_CORNER_DEG = 180`; `PAD_CURVE_MIN = 0`;
smoothing off (every segment straight); the aspect ignored; the storage format changed (an object per stroke);
the storage format changed (unrounded points).

#### At full speed (1x CPU), the same sections against 4955c7c and the branch (load average 3.9–4.2)

| | before | after |
|---|---|---|
| zigzag, distinct samples kept (390 / 820) | 754 / 762 of 1,201 (63%) | 1,201 / 1,201 (100%) |
| handler p50 / p95 | 0.3 / 0.4–0.5ms | 0.1 / 0.2ms |
| Q7, 120-sample drag (320 / 390) | 79 / 85 | 121 / 121 |
| one turn in 200ms, board 390 / 820 | 3.4 / 4.7px off round | 0.46 / 0.71px |
| one turn in 120ms, board 390 / 820 | 8.5 / 12.1px off round | 0.41 / 0.61px |
| Q7 at 390, 200ms, with no coalesced events | 17 points, 7.1px off round | 19 points, 1.48px off round |

#### The suite, on the last commit

All run alone, with ports in this build's range (19864–19869), on a machine shared with other builds (load
average 1.6–6.9 through it):

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors, as before), `check-loading`,
  `check-drafts`, `check-scope`, `check-strings`, `check-widgets`, `check-library`, `check-funnel`: green.
  `check-dead` (soft) prints the same report as on 4955c7c.
- `check-flow` in four parts: 82 + 82 + 82 + 83 = **329 journeys, all green**; and the five pen journeys again
  after the mutations, with the sizes journey added since.
- `check/ui.js --screen=tools` (95 combinations), `--screen=stuff` (630), `--screen=saved` (20): nothing new.
  Each prints a "not reachable" list; the same two screens on 4955c7c print the same lists word for word.
- `check/press.js --screen=tools` and `--screen=stuff`: nothing threw, nothing was silently inert.
- `check/swipe.js` in full: 112 gestures at 390 and 320, OK (and 110 on 1a, after the overworld line).
- `check/cascade.js`: nothing decided by file order alone. `check/cards.js`: OK.
- `check/pen.js`: OK, 115s.

**Browser mutations, each red on its own, the real files green after** (the source compared byte for byte):
smoothing off (the starved circle 6.2 and 8.6px off round); coalesced samples ignored (423 and 452 of 1,201
kept); the box read per sample (14 and 10 reads in one event); the path written per event (446 and 488 writes
inside events); a second contact always a rest (the two-finger tap's dot); no swap (the palm's stroke); a cancel
always committed (the early cancel's line); no T0 (after a lost lift a real swipe could not turn the page); no
off-ink tracking (the pinch off Q7's figure drew a line); no overworld guard (the drifting palm took the column);
no selection rule. And for the sizes line: keeping every contact, and drawing it without the address.

**Not run as one: `npm run check`.** Its browser members take fixed or OS-chosen ports outside this build's
range; every member that touches the pen, the swipe engine or the stylesheet was run above, alone.

#### Unsure, for the next builder

- **The seam of a closed fast circle keeps one point** (§1c above). Declined in §9; a device screenshot decides.
- **Undo on a board at its ceiling** repaints in 82–95ms median at 4x, its worst run 101–121ms (§1c). The
  first change if it is ever seen to lag: `PAD_CURVE_MIN` raised for the board. *(After review: one stroke comes
  off and nothing else is redrawn — 13–24ms; see "After review", 7.)*
- **Who-went-first decided one frame late** is this build's own addition (§3), measured on the folded pan; a
  child's real two-finger timing on an iPad has not been seen (§10.3).
- **R11, a palm on Undo**, did not reproduce in Chromium; the guard is built from the source, not from a red run.
- **The time backstop** in `check/pen.js` (p95 3.0ms at 4x, judged only when no more than 8% of frames ran over
  33ms) is set from this machine's spread, 1.6–2.6ms after against 3.3–3.4 before. A quieter machine could
  tighten it; the counted budgets (one box read, no write inside an event) are the exact ones. *(After review:
  printed only; see "After review", 6.)*

### After review (11 Oct)

Three reviews read increment 1 at 2a7a7f3, each through one lens: **real multi-touch as a child would draw**
(Chromium 1194, CDP `Input.dispatchTouchEvent` with ids, radii and timestamps, on the board, Q7's face, a
made-up grid surface and the ruler-and-compass card, at 390, 820 and 1024, 4x CPU); **performance and latency**
(Chromium traces — thread time, forced layouts, frame writes — because the machine was at a load average of
7–23); and **compatibility** (every changed line against 4955c7c, the storage format from real input, 3,164
fuzzed strokes through `padPath_`). They confirmed what increment 1 set out to do — fast circles 0.3–0.7px off
round where they were 9-gons, every sample kept, no latency added (the path painted in the first frame after
its event for 99.9–100% of events), the stored format byte for byte the same from real input, no stroke
dropped at a lift, the column never moved by a resting hand. And they found twelve things wrong. Each was
reproduced on 2a7a7f3 first, fixed, given a check that is red on 2a7a7f3 (or red under a mutation, where the
check itself was what was missing) and green after, and every mutation was undone with the real files compared
byte for byte. The load average through this work was 9–53 on four cores.

**1. A hand left down after a two-finger gesture kept the pen dead** (must-fix). T5 said "nothing is drawn until
every member has lifted". A thumb gripping the screen's edge, or a palm on the card, that was half of a
two-finger decision and then stayed down kept every later line from drawing — no preview under the finger,
nothing stored, until that hand lifted, which a gripping thumb never does. The review: 0, 0 and 0 strokes for
three lines where af08dee drew 1, 2, 3. **T5 is amended**: a contact landing while TWO joins it only while the
gesture is in progress — a member having moved `PAD_ALSO_PX` in the last `PAD_TOGETHER_MS`; otherwise TWO is
over, and its members are ordinary contacts already down, which T1 then watches (so one can still make the new
stroke two-finger by moving with it, and can never take it over). And every contact already down when a new
owner lands loses its "came later" mark, so a member of an old gesture can never be handed a new stroke.
*Checked:* check-flow — the review's own case (P16, then the hand stays and two lines are drawn: wanted
`[[45,170,159,170],[45,255,159,255]]`, 2a7a7f3 stored `[]`) and a finger left resting after a pinch while a
third draws (2a7a7f3 `[]`); `check/pen.js` 'grip', a thumb at the screen's edge that pans 40px sideways with a
finger and then stays still for two lines (2a7a7f3 `[]` at 390 and at 820; now two lines at both). The guard
the other way: a tap landing while the other finger of a pinch drags on still joins the gesture and stores
nothing. *Mutations:* TWO kept while still → both journeys and 'grip' red; TWO dissolved at every landing →
the tap's guard red (it stored the dragging finger's line).

**2. A thumb or palm that rolls or settles as the line starts was taken for a second finger** (should-fix). T3
and T4 called it two fingers when the other had moved 5px by the time the first went 10px. A thumb gripping
the edge rolls 6–12px in the first 50–80ms of a line and stops; a palm put down flattens and its centre slides
as far. The review drew nothing on all 12 pad x size combinations for a 9px thumb roll and a 12px palm settle
(af08dee drew every one), and lost an already-drawn line when a palm landed 120ms in and settled 10px.
**The rule now:** when one of them has gone 10px and another has moved 5px too, nothing is decided until the one
that went furthest has gone `PAD_KEEPUP_PX` = 30px; then every one that has gone `PAD_WITH` = half of that is a
finger moving with it — two fingers, nothing drawn — and one that fell behind settled. *Why these numbers:* at a
child's 300px/s the leader takes 100ms to go 30px, past the 50–80ms a roll or a settle takes; a settle of up to
12px is then under 15px, while the second finger of a pan or a pinch, moving with the first, is at about 30.
Slower lines give a settle longer to stop; faster ones give it less distance (at 1,000px/s the leader is at
30px in 30ms, when a 12px settle over 80ms has gone 4.5px). A lift, a cancel or the page going away decides at
once from where each one got to, by the same half. Nothing is lost by waiting: a held stroke keeps every sample,
and a watched one is drawn all along. The costs are in §4. *Checked:* check-flow — a thumb rolling 9px in 48ms,
a palm on the card settling 12px in 80ms, a palm landing 120ms into a line and settling 10px in 60ms, and a palm
first settling 12px while the finger draws: 2a7a7f3 stored `[]` in all four; now the line, every sample (with a
frame every fourth step, so the decision is asked while drawing and not only at the lift). `check/pen.js`
'settle' (thumb-roll-9, palm-card-settle-12, palm-lands-settles, real touch): 2a7a7f3 `[]` in all six at 390
and 820; now every line. The real pans and pinches stay nothing (P3, P4, P9, P10, P14, P16, R2 and 'phase').
*Mutations:* the keep-up wait removed (5px at the crossing decides) and the half removed (any 5px is with it):
the journeys red, and 'settle' red (at 390 the thumb roll kept one line of two; at 820 the palm settle and the
palm that landed kept nothing).

**3. A pin held on a compass's centre was handed to the second finger** (should-fix). One finger held still on
the centre and a second landing later and swinging round it — a real compass's way — made the second finger the
owner (T4's palm-first swap): an arc centred where IT landed, and for the ruler a line from its start to its end.
4955c7c stored nothing. **Chosen: (a), keep the owner** — for the ruler and the compass, a candidate that came
more than `PAD_TOGETHER_MS` after an owner held still on its point never takes the stroke (a pin placed on
purpose is not a palm), so the pin's stroke ends as the slip it is and nothing is stored, as before 338. Not (b),
a two-finger compass (the still finger the centre, the moving one the pencil): the spec decided two fingers do
nothing through all three increments, and (b) is a new gesture to design, teach and prove, where (a) restores
what was. **(b) is a revisit**, in §9's table: when a device session shows children reaching for a pin
finger. The palm-first swap stays for the pen, and for a tool when the second came within 200ms (a palm first,
then the compass finger: its ring about where IT went down — checked). *Checked:* check-flow — compass and
ruler with a pin held 300ms (2a7a7f3: a 33-point arc, and `[[230,170,270,170]]`); `check/pen.js` 'pin' on
November 2019 1H Q4 at 390 with real taps on the tool tiles (2a7a7f3: an arc `[[191,296,186,294,…]]` and
`[[205,170,254,170]]`; now `[]` and `[]`). *Mutation:* the pin rule removed → both red.

**4. The other finger was judged by its event's time, not its samples'** (nit). Two fingers are now compared at one
moment: each contact keeps its recent samples with their own times (`hist`, `padPos_`), the moment judged is the
latest every finger still reporting has reported (`PAD_LAG_MS` = 40ms: one silent longer than that has not moved
since), and each is taken where it was then. **And the decision is made at a frame, not inside an event.** The
first version of this fix judged inside each event and drew 3 of 8 out-of-phase pans at 390 and 3 of 8 at 820:
inside an event the other finger's events of the same batch can still be queued behind it, and a stall of the
main thread makes it look silent. Input that has arrived is dispatched before a frame's callbacks, so at the
frame every queued report is in. *Checked:* check-flow — finger 2's event stamped 1029 carrying only its sample of
1013 (4px), with a frame there: 2a7a7f3 stored finger 1's line; now nothing. `check/pen.js` 'phase' (eight pans
with the second finger 5ms out of phase, at 390 and 820): 0 of 8 at both. On 2a7a7f3 this section drew 0 of 16
here (the review, with its own pan, 8 of 28 at 820 and 1024), so the browser red is the mutation's: *Mutations:*
judged at the latest arrival (no `PAD_LAG_MS`) → the journey red; decided inside the event → 'phase' drew 5 of 8
and 6 of 8 (run again after the restart below, at a load average of 35–37: 8 of 8 and 3 of 8).

**5. Nothing noticed a frame that redraws the whole stroke** (should-fix). Both checks now count: check-flow, a
frame of a 320-point stroke writes at most two live `d`s (the open chunk and one being frozen); `check/pen.js`
'samples', the live `d`s written in each frame of a 1,200-sample zigzag, at most 2 (measured: 2, in every one of
587 and 639 frames). *Mutation:* every chunk rewritten every frame → the journey red (3 writes) and 'samples' red
(10 writes in a frame, at both sizes).

**6. `check/pen.js` judged a time that load moves** (should-fix). The handler's p95 was judged against a 3.0ms
backstop (this note said 2.5) only when the frame record showed a machine that kept up — so it almost never
judged here, failed once on unchanged code, and passed a mutation that added a frame of latency and one that
forced a layout per event at one size of two. **The p95 is printed only**, beside its 3.0ms reference (this note
corrected), and what it stood for is counted: the path **painted in the first frame** after its event for at
least 95% of events (now 100% of 287 and 368; the extra-frame mutation 42% and 36% → red), and **no forced
layout** inside a pen `pointermove`, counted from a Chromium trace (`Layout` or `UpdateLayoutTree` inside the
`EventDispatch`) — now 0 of 287 and 0 of 368; a style write and a box read per event → 107 of 213 and 92 of 174
→ red; and the positive control, 2a7a7f3 loaded with `?pen=sizes` (`PEN_QUERY=pen=sizes`), 179 of 179 and 263 of
263 → red. Thread time is printed beside the wall clock.

**7. Undo on a full board** (should-fix). `padRepaint_` recomputed every stroke's curve and re-parsed a `d` 2.3–2.5x
longer, for one stroke taken off: the review measured Undo's task at 74ms of main thread at 4x against 31 before.
**Both halves removed, and the screen is still the store's:** `padPath_` keeps the path of every stroke it has
drawn (`PAD_PATHS`, by aspect and stroke — a stroke stored never changes; the live preview of a growing stroke is
not kept), and `padRepaint_` keeps a `<path>` that already says exactly what its stroke draws and rewrites from the
first that differs (a live chunk or anything else in the group is taken off as before). **The memo is held to a
size in characters, not a count of strokes** (`PAD_PATHS_MAX`, 4M characters of keys and paths, about 8MB; past it
it starts again empty): a question keeps every sample, so one stroke can be a 10K key and a 30K path, and the first
version's cap of 4,000 strokes would have let a long visit hold hundreds of megabytes. A full board is about 350K,
so eleven fit. *Checked:* check-flow, Undo on a board of three rings keeps the two path nodes it did not take off
and recomputes no curve (2a7a7f3: both replaced, two recomputed); and 150 long curved strokes leave the memo under
its budget, still holding the last. *Mutations:* the whole group rewritten → red; no memo → red; the memo held to
4,000 strokes → red (5,772K characters held). *Measured:*
the review's own benchmark (its seeded board of handwriting-like scribbles,
thinned as the board stores them, to 99,000 characters; nine Undos each, median, Chromium trace thread time),
4x CPU, two runs per build, load average 16–17:

| | 4955c7c (before 338) | 2a7a7f3 | after review |
|---|---|---|---|
| the Undo click's task | 37.7 / 43.1ms | 65.0 / 42.3ms (the review: 73.9) | **24.3 / 13.0ms** |
| layout after it | 3.6 / 5.0ms | 6.6 / 1.5ms | **0.1 / 0.1ms** |
| the drawn `d`, all strokes | 98,312 chars | 241,936 | 241,936 |

Cheaper than before 338, curves and all: one `<path>` comes off where every one was parsed again.

**8. Fast drawing fills the board faster than this note said** (should-fix, recorded). The wave this note measured
(§12, 1c) was slow; the review measured handwriting: 0.8s scribbles at about 7Hz store 275–277 characters a stroke
on this branch against 115–185 on af08dee at 4x and 6x (1.5–2.4x — the old pen kept a third of a fast wiggle's
samples), and a 20s spiral 5,631 against 1,796–3,048. So **a board holds about 360 such scribbles where it held
540–870** — about five minutes of continuous fast handwriting — beside note 310's "349 waves fill it" (slow waves,
before 338) and §12's 442. **Decided: the thinning stays at one unit.** The stroke stored is the one drawn, which
is the point of 1b; thinning harder to buy room back would cut off the very wiggles a child's handwriting is
made of, and the store's format is untouched either way. When the board is full the toast says to Clear, and Clear
can be undone. Revisit if a device session shows a child filling it.

**9. `?pen=sizes` forced a layout on every move** (nit). The line was written inside each `pointermove`, before
the box was read — the read after write 1b removed, in the mode the iPad reading is to be taken in (the review:
78 in 78, 2.3ms each). It is now written at the next frame, and only when a contact is new or has grown.
*Checked:* check-flow, a contact growing changes nothing in the line inside its events and shows at the next
frame (2a7a7f3: written in the event); `check/pen.js` with `PEN_QUERY=pen=sizes`: 2a7a7f3 forced a layout in 179 of 179 and 263 of 263 pen events (handler p50 7.8 and
7.3ms); now 0 of 336 and 0 of 283 (p50 0.8 and 0.6ms). *Mutation:* the
line written in every event, as built → red in both.

**10. The lift of a long board stroke costs more** (nit, recorded). Measured by the review (traces, a 20s spiral of
2,500 samples on the board): the `pointerup`'s CPU 40–58ms at 4x against 14–18 on af08dee, 67–112 against 22–47 at
6x; its profile at 4x: `padCommit_` 46.7ms, of which `ansStore_` 17.8, `ansSimplify_` 9.1, `padPath_` 6.8, and the
garbage of the per-sample arrays. Ordinary 0.8s strokes: 11–23ms against 11–14. It is three times the points,
thinned and stored once; no change unless a device shows a hitch at the lift. (The `padPath_` worked out at the
lift is now kept, so the next Undo or copy does not work it out again.)

**11. T0 read "primary" as "no other pointer of any kind"** (should-fix). The Pointer Events spec makes `isPrimary`
per pointer type: a touch is primary while a stylus is down, and a mouse click is primary while a finger draws. So
a palm landing as a stylus drew threw the stylus's line away and stored the palm's dot, and a mouse clicked beside
the board on a touchscreen laptop threw the finger's line away — where 4955c7c kept both. **T0 is per kind**
(`padPrimary_`): only contacts of the newcomer's kind are forgotten, each as a lift that never came; a stroke of
another kind carries on, and the newcomer is classed by T1/T2 as any other (a touch under a stylus is the hand
holding it, as T1b always said and could never reach). Every contact of that kind is the old reset. *Checked:*
check-flow, a stylus line with a palm landing as the primary touch, and a finger line with a mouse click beside
the picture (2a7a7f3: `[[280,280]]` and `[]`); `check/pen.js` 'types' with real input, a stylus through CDP's
mouse events with `pointerType: 'pen'` (2a7a7f3: `[[238,289]]` and `[]` at 390 and 820; now the stylus's line and
the finger's). On an iPad with an Apple Pencil, whether WebKit marks the palm primary is unverified; the devices
this certainly reached are Android stylus tablets and touchscreen laptops. *Mutation:* T0 for every kind → red
in both.

**12. `check/pen.js`'s 'bar' had its two orders swapped** (nit). CDP's `touchEnd` releases the points it lists (both
reviews measured it), so "palm first" lifted the finger first. The listed points are swapped, and the order is now
asked of the pen between the two lifts — the stroke still drawn after the palm lifts; ended, with the palm still
down, after the finger lifts — so the label can never again say the other one.

**Found while fixing:** a contact that came later to one stroke kept that mark into the next, where it could have
been handed a stroke it was down before; every contact already down when an owner lands is now marked as such.
*Checked:* check-flow, a palm landing on the board as a line ends (a rest, later than that line's finger), the next
finger landing 64ms after it, and the palm sliding 30px while the finger is still: the finger's line is stored.
*Mutation:* the mark kept → red (the palm's slide stored, `[261,298,227,298]`, and the finger's line lost). The
cost, written here so it is chosen and not found: if the contact left down is the next FINGER and the one landing
64ms after it a palm, the finger moving alone is now a rest and the palm's dot is kept. The palm landing as a line
ends is the ordinary case (note 310); a second finger put down before the first lifts, then a palm, is not.

**What the review's own matrix says now** (the touch review's `drive.js`, run against this branch's gesture code —
the same code as the commit, whose only later change to `find.js` is the memo's budget, which no gesture reaches; the
script itself went with the review's folder and could not be run again after the restart: the board,
Q7's face, a made-up grid surface and November 2019 1H Q4, at 390, 820 and 1024, 4x CPU): 372 gestures, no page error, and the column never moved. **Every
resting-hand gesture of the review now keeps its lines on all 12 pad x size combinations** — thumb-roll-6 and -9,
palm-card-settle-6 and -12, palm-card-roll, palm-rest-slide (and the line after it), hand-edge-30, hand-ink-25 and
palm-lands-settles — where 2a7a7f3 kept them in 2, 0, 3, 0, 3, 2 (7), 5 and 5 of 12. Two-finger taps, pans in step
and out of it, the staggered pans of 30–150ms, the palm first, a palm 100 and 350ms into a line, dots, edges, the
ruler and compass and Undo/Clear by real taps: as wanted, 12 of 12 (3 of 3 for the tools on Q4), and the two-finger
compass and ruler store nothing (3 of 3). Two kinds still lose a line, both now written in §4: second-pan-80 and -150
on the 820 and 1024 boards, whose fingers land more than `PAD_TOGETHER_PX` apart (as on 2a7a7f3); and hand-ink-60
and hand-card-60, a palm sliding at 60% of the finger's speed through the whole line — line 2 is kept now, line 1
is two fingers by movement (2a7a7f3 kept neither). The frame probe found the live path off the finger in 19 of 6,023
frames, one at a hold or a swap in a two-contact gesture each time, as 2a7a7f3's run did (22).

#### The suite, after review

---

Continued in [part 3 of 4](338-a-finger-is-the-pen-3.md).
