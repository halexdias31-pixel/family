## A finger is the pen: every sample kept, a fast line drawn round, and no mark from two fingers, a palm or a thumb

**The owner, 11 Oct, 11:38 — the brief:** *"drawing or editing with a finger (especially on tablets like
an iPad or touchscreens) feels finicky, imprecise, and frustrating"*. It names *"finger occlusion"*, the
*"fat-finger problem"*, *"accidental stray ink blobs while trying to pan"* and *"difficulty selecting
close or small elements"*.

**The owner, 11 Oct, 13:53 — asked what the children draw with:** *"they are just using their fingers"*.

The pens are the Tools whiteboard and the pen on every question card answered by drawing (337) — one
implementation, `padWrap_` and the `pad-*` handlers in js/find.js. This note is the design for all three
increments, so the next builder starts from it, and the record of what increment 1 did.

---

### 1. What was measured before a line was written

Chromium 1194 headless, `hasTouch`/`isMobile`, DPR 2, real touch through CDP (`Input.dispatchTouchEvent`,
each contact its own `id` and `radiusX`/`radiusY`), 4x CPU unless noted, on 4955c7c. Load average 0.2–3.

| | 390x844 (board 270x360) | 820x1180 (board 374x499) | 390x844 at 1x |
|---|---|---|---|
| zigzag, 1,200 samples at 8ms → `pointermove`s | 395 | 358 | 717 |
| coalesced samples available | 1,200 | 1,200 | 1,200 |
| live points kept | 394 | 359 | 718 |
| stored after the board's thinning | 18 points, 135 chars | 19 points, 141 chars | 13 points, 96 chars |
| pen handler p50 / p95 (last 100 moves) | 0.4 / 3.4ms | 0.4 / 3.4ms | 0.3 / 0.4ms |
| `padAt_` (the box read) p95 | 1.0ms | 1.0ms | 0.1ms |
| frames over 33ms | 28 of 599 | 23 of 602 | 2 of 624 |

**The pen threw away about two thirds of a finger's samples under load**, all of them available through
`getCoalescedEvents`. **A fast circle came out as a polygon**: one turn in 200ms at r = 97px stored 10
points with a longest chord of 114px (a lopsided 9-gon on the screen); in 120ms, 9 points and 115px; on the
iPad board 9 points and a 227px chord.

**A second finger 40ms after the first, armed** (finger 1 always owned the stroke — note 310's rule):

| gesture | stored |
|---|---|
| two-finger tap | a dot from finger 1, `[119,102]` |
| two-finger pan up 150px | a line from finger 1, `[119,244,119,102]` |
| pinch | a line from finger 1, `[119,102,43,102]` |
| palm (radius 25) first, then the fingertip draws | **the palm's blob**, `[238,299,240,299,238,299]` — **and the fingertip's whole line lost** |

**Reproduced again with `check/pen.js` against an unchanged copy of 4955c7c** (load average 7–8), every
one red: the three two-finger gestures at 390 and 820, the palm, a `touchCancel` 50ms into a stroke
storing `[[119,102,157,102]]`, a pinch with one finger off Q7's 180px figure at 320 storing a 7-point
line **and the pane scrolling under it** (the off-figure finger was the primary pointer), and:

- **R1, the palm that drifts.** A palm (radius 25) down first on the card below the board, so it is the
  PRIMARY pointer and the one the swipe engine follows; a fingertip draws on the armed ink; the palm drifts
  30px sideways. **The swipe engine took the palm as a sideways swipe (`SWIPE.axis` `x`) — the column moved
  under the stroke**, at 390 and at 820. `[data-noswipe]` only ever asked what the primary pointer landed on.
- **R11, a palm on Undo.** Predicted to undo the previous stroke. **Not reproduced in Chromium**: with a
  finger down, its gesture detector made no click of the palm's touch, lifted before the finger or after.
  The guard ships anyway (§4.6): the source shows the path, and a click from a lift is a WebKit decision.

### 2. The decision in brief

Three designs were judged (A, latency: 79, 82, 79; B: 75, 75, 76; C: 66, 61, 54). **A is the spine**;
every graft below was named by at least one judge.

- **One finger draws, and only on a locked pad, as before.** The ink is always under the fingertip — no
  offset cursor, no predicted ink. The lock still means the card is held still.
- **Two fingers, a palm or a thumb never leave a mark and never move the column.** Deciding costs a
  one-finger stroke no latency: the preview appears the moment the finger lands. A stroke is held back only
  when a second contact gives evidence, with every sample kept. **Contacts are told apart by how they move**,
  not by a timer that waits. Contact *size* is recorded and decides nothing until a device reading exists.
- **The swipe engine respects a finger on the drawing** (`padBusy_`, one guarded line in overworld.js).
- **Every sample is kept** (`getCoalescedEvents`, one box read per event), and the live path is written once
  a frame in chunks of 128 segments. The ruler and compass stay synchronous.
- **Fast lines are drawn round, old drawings too** — `padPath_` draws long, gently turning segments as
  centripetal Catmull-Rom curves through every stored point. Dots, ruler lines, corners and dense strokes
  are drawn byte for byte as before. **Nothing stored changes.**
- **Nothing filters or predicts the input** (§6).
- **A loupe shows what the finger hides** (increment 2) — a view, never a change to the ink.
- **The ruler and compass land on what the child drew** (increment 3). The pen never snaps.

### 3. The contact model (increment 1)

A **contact** is a pointer the pen tracks in `PAD_TOUCH`, by `pointerId`: every pointer that goes down on
the ARMED pad's ink, of any kind, and every TOUCH that goes down anywhere while a pad is armed (a palm on
the card, a gripping thumb, the second finger of a pinch on a small figure). jsdom's events (no
`pointerType`) are never tracked off the ink. Each records where and when it went down, where it is, the
furthest it has been (`far`), the last time it moved 5px (`tm` — a resting palm's tremble is not a move),
its size (`max(width, height)` when > 1, on down and move only — Android reports 1 on `pointerup`), and a
role: owner, cand, watch, rest or two. **Pressure is never read** (0 for an iPad finger); nor are a
coalesced entry's `pointerId` or `target` (iOS 18.2 shipped them without).

**States.** IDLE; DRAWING (`PAD_ST`/`PAD_GO` set, preview shown — *tentative* while the owner is still a dot,
`far` < 10px, or younger than 200ms, otherwise *established*); HELD (`PAD_HUSH`: the stroke still held, so
`padHold_`, `findKeep_` and `wbPaint_` still hold its column, samples still accumulating, nothing on the
screen); TWO (`PAD_TWO`: no stroke, nothing drawn until every member has lifted).

**Thresholds** — CSS px and ms, never rem, because a fingertip is the same size on every screen:

| name | value | why |
|---|---|---|
| `PAD_STILL_PX` | 10 | "a dot" and "has moved": the app's own drag decision (`PRESS_MOVED`), iOS's long-press tolerance of 10pt; Android's slop is 8dp |
| `PAD_ALSO_PX` | 5 | "moving too": by the time one finger of a pan has gone 10px the other has gone more than 5; a creeping palm or a resting thumb has not |
| `PAD_TOGETHER_MS` | 200 | twice Android's tap timeout, because children's fingers land less in step; CDP measured two fingers 40ms apart |
| `PAD_TOGETHER_PX` | 200 | 38mm on an iPad, 31mm on a phone: index and middle finger, a narrow pinch — not a palm heel, 60mm+ from the fingertip |
| bar guard | 400ms | Android's long press: the longest a resting hand's release takes to become a click |

**The rules.**

- **T0, stale contacts.** A `pointerdown` with `isPrimary === true` forgets every contact first — the
  platform saying no other touch is down — and drops any stroke still held (its preview removed, nothing
  stored). jsdom's `undefined` never resets anything. `visibilitychange` (hidden), `pagehide` and `blur` end a
  stroke by the cancel rule and forget every contact. The same id going down again replaces its contact.
- **T1, a contact lands on the armed ink with nothing drawn.** Not primary while the swipe engine is already
  carrying another pointer → a rest (a moving column is not drawn on). A mouse or a stylus → the owner,
  established at once (a stylus makes every touch a rest). Otherwise the stroke starts as it always did — a
  dot at once — and every contact already down is looked at: one that landed in the last 200ms, or is moving
  now (10px from its down and a 5px move in the last 200ms) holds the stroke (kind **b**); two or more make
  it TWO; an old, still one is **watched**.
- **T2, another contact lands while a stroke is drawn.** Established → a rest (**310's rule, unchanged**).
  The owner still a dot, at any age and distance → HELD, kind **b**. The owner young and the newcomer within
  200px of it → HELD, kind **a**. Otherwise a rest.
- **T3, watched contacts** exist only while the owner is a dot. The first of them to go 10px decides: the
  other has moved 5px → TWO (a pan begun with a finger already down); the owner alone → they are rests; a
  watched one alone → it is a rest. **A watched contact can make the stroke two-finger and can never take it
  over: it was down first.**
- **T4, resolving a hold.** The first of the owner (measured from where the hold began) and the candidate (from
  where it was then) to go 10px decides: the other moved 5px → **TWO**; the owner first → **resume**, the
  preview redrawn from every kept sample; the candidate first, kind b, on the armed ink and landed after the
  owner → **swap**: it takes the stroke from its own first point with every sample it gave while held, and the
  palm that landed first is a rest; the candidate first, off the ink or down first → resume; kind a → TWO. A
  third contact → TWO. One of a held pair lifting is forgotten (the owner's samples with it); the other, if
  it is on the ink and came later, is held alone — it becomes the stroke if it goes on to move 10px, and
  nothing if it lifts still. So a two-finger tap stores nothing whichever finger lifts first.
- **T5, TWO.** Nothing is drawn until every member has lifted. A contact landing on the ink joins.
- **T6, the owner lifts.** Today's lift: the tool's end, the board's thinning, `padSave_`.
- **T7, cancel.** The owner's `pointercancel` (or a page event) **withdraws a tentative stroke and commits an
  established one.** Cancels that are not ink arrive early — platform palm rejection, system edge gestures;
  one after 200ms and 10px of a real line is an interruption, and dropping it would lose a mark the child
  saw. It used to commit always, which stored every early one's stray mark.
- **T8, leaving.** `padWhoChanged_` and `q-draw` call `padDrop_()`: everything the pen holds for a gesture
  put down, nothing stored. The lock pressed off by another hand keeps the old behaviour — an established
  stroke commits on its lift, a tentative one is withdrawn — and forgets every other contact.
- **Every contact on the armed ink** gets `preventDefault` and the pointer capture; a touch off the ink gets
  neither, so a tap on a tile still works. `contextmenu` on the armed ink is prevented (the keypad's
  precedent).

**One decision this build added, measured: who went first is decided one frame late.** Asked per event as
written, two fingers of one pan were told apart wrongly: the platform sends each finger's moves as their own
`pointermove`, one after the other, and under load one event carries several folded samples — finger 1's
event arrives 15px on while finger 2's event for the same frame has not been dispatched, so finger 2 reads as
still and the pan draws a line (the jsdom journey's 15px-step pan, the fold a 4x-throttled phone makes). So the
crossing is recorded and the decision made at the next animation frame (input is dispatched before a frame's
callbacks), at the other finger's next event at or after that time, or at any lift, landing or cancel —
whichever comes first. Nothing is lost by the wait: a held stroke keeps every sample.

**The amendment to note 310, in the comment over the listeners:** *"a second pointer neither takes it over nor
ends it"* stands for an ESTABLISHED stroke. It is amended only for a stroke that is still tentative or held.
Restore first-finger-wins and the palm blob comes back, and a two-finger pan draws.

**The swipe engine (`padBusy_`).** True while `PAD_ON` is set and some contact went down on that pad's ink —
keyed by the pad's KEY, so a repaint mid-gesture does not let go. overworld.js asks it at the axis decision,
after the 10px return: `if (typeof padBusy_ === 'function' && padBusy_()) { SWIPE.live = false; return; }` —
refusing the grid and the pane scroll whichever pointer is primary. A swipe already moving when a finger lands
is left to finish (T1). The pen's listeners are on `document` and run before the engine's on `window`, so T0's
forgetting comes first. A stuck `padBusy_` would mean a column that never moves again; T0 is why it cannot.

**The bar under a resting hand.** Undo and Clear do nothing while a finger is on that pad's drawing, or within
400ms of the lift of a touch that went down off the ink while one was. Silently. The lock and the tools are
not guarded: "Done drawing" pressed by the other hand still ends the stroke. And a commit survives a repaint of
its own pad: with no preview left it appends a path, so a stored stroke is always drawn.

**Selection.** While armed, `.pane:has(.qpad.is-drawing), .qpad.is-drawing` are unselectable with no
callout — note 301's precedent, the pane as well as the card, the pad's own selector for iOS before 15.4 —
and `input`/`textarea` inside stay selectable, because on iOS an input in an unselectable box can stop taking
a caret.

**`?pen=sizes`.** With it in the address, a fixed line (`.pad-sizes`, tokens only, presses nothing, hidden
from screen readers) lists the last eight contacts: pointer type, width x height at the down, the largest
during. One screenshot from an iPad — draw a line, tap, rest a palm, rest a thumb — is the reading
increment 2 waits for.

### 4. The costs accepted

- **A deliberate still dot is lost** when another contact lands while the finger is still and both lift
  without moving — "palm resting on the ink, finger taps" included. A mark lost rather than a stray one
  left. Increment 2's size rule recovers it where sizes are real.
- **A palm that lands first, alone, and creeps 10px before any finger lands** is an established stroke and
  draws. Only size can tell.
- **Anchored pinch** (one finger still on the ink, the other moving): the moving finger's line, or a dot
  from the anchor. Undo removes it.
- **A two-finger pan whose first finger has travelled 10px for more than 200ms before the second lands**
  draws finger 1's line.
- **Two children** starting within the window draw nothing until both lift. One stroke at a time was
  already the rule.
- **On iOS only the first touch gets real coalesced samples** (WebKit 284852): a finger that lands after a
  palm runs at its own event rate, and the curves cover the gap.

### 5. Every sample, and the live path (increment 1)

`getCoalescedEvents` where it exists and answers something (`co && co.length ? co : [e]` — overworld.js's
precedent: Firefox on Android answers `[]`, Safari before 18.2 has none, nor jsdom). From each entry only
`clientX`, `clientY` and `timeStamp`. The box is read **once per event** and shared by its samples; a box
cached across events is declined — `padFaceFit_`, a sibling's zoom or the app's own scrolling can move the
ink without a scroll or resize event first. With the pen's writes moved into the frame, nothing writes
between two pen events, so the read is a clean-layout read. Predicted events are not read.

The pen's live path is written **once a frame**: `pointerdown` writes the dot at once (synchronously);
`pointermove` feeds the samples, marks the stroke dirty and asks for one frame; the frame rewrites only the
**open chunk's** `d`, through the same segment writer `padPath_` uses, and freezes a chunk at 128 segments
once the stroke has 2 points beyond it (what segment *i*'s corner test and far handle need), starting the next
at its last point. At every frame the chunks draw exactly `padPath_` of the points so far. On a lift the
frame is flushed synchronously and the chunks collapse into one path. A frame asked for from an input handler
runs before the next paint, so batching adds no latency. The ruler and the compass stay synchronous (the
journeys read their live radius straight after `pointermove`).

### 6. Drawing a stroke: corner-keeping centripetal Catmull-Rom (increment 1)

`padPath_(st, k)`, `k` the pad's aspect (H/W of its box): 4/3 for the board (always 3:4, but its surface's
viewBox is 340x340 with `preserveAspectRatio="none"`), otherwise h/w of the first `viewBox` in the figure,
otherwise 1. `padWrap_` writes it on `.qpad` as `data-aspect`, and the live path and every repaint read that
one number, so they agree byte for byte. A wrong `k` only changes how a curve bends, never where a point is.

The work is done in Q = (x, k·y), proportional to screen px (340 units span the box's width and its height).

1. **Unchanged:** fewer than 3 points, an odd length, or any value not a finite number → today's string.
2. Consecutive duplicates removed.
3. **Corners:** vertex i turns θ ≥ 50° (`u·v ≤ cos 50° |u||v|`); the ends count as corners.
4. **Per segment** of length L (in Q): straight if L < 8 units across, or both ends are corners; otherwise a
   cubic (centripetal, α = ½), d₀ = |Qᵢ − Qᵢ₋₁|^½, d₁ = |Qᵢ₊₁ − Qᵢ|^½, d₂ = |Qᵢ₊₂ − Qᵢ₊₁|^½:
   - B1 = corner(i) ? Qᵢ + (Qᵢ₊₁ − Qᵢ)/3 : (d₀²Qᵢ₊₁ − d₁²Qᵢ₋₁ + (2d₀² + 3d₀d₁ + d₁²)Qᵢ) / (3d₀(d₀ + d₁))
   - B2 = corner(i+1) ? Qᵢ₊₁ − (Qᵢ₊₁ − Qᵢ)/3 : (d₂²Qᵢ − d₁²Qᵢ₊₂ + (2d₂² + 3d₂d₁ + d₁²)Qᵢ₊₁) / (3d₂(d₂ + d₁))
5. Back to units (control y ÷ k), control points to one decimal, endpoints the stored whole numbers.
6. **No segment a cubic → today's string, byte for byte.**

**Why α = ½:** Yuksel, Schaefer and Keyser (2011) — centripetal is the one member of the family with no cusps
and no self-intersection within a segment, and the curve passes through every stored point, which is why it
can be applied to old strokes without touching storage.

**Why 50°**, against a circle of r = 97px:

| points per turn | turn at each | polygon gap | Catmull-Rom off the circle | at 50° |
|---|---|---|---|---|
| 6 | 60° | 13.0px | 2.49px | corner — a hexagon stays one |
| 7 | 51.4° | 9.6px | 1.38px | corner |
| 8 | 45° | 7.4px | 0.82px | round |
| 9 | 40° | 5.9px | 0.52px | round |
| 12 | 30° | 3.3px | 0.17px | round |

The measured starved circles were 9–10 points a turn, so they come out round; heptagons, hexagons,
squares and triangles keep their corners. The cost is a thinned or fast octagon, and it is free to re-tune
because no stored point depends on it.

**Why 8 units:** a chord's sagitta is about Lθ/8, so under 8 units and 50° a polyline segment is within
0.87 units of its curve — at most 0.96px, on the iPad board. So every slowly drawn question stroke (coalesced
samples 1–3 units apart) stays byte-identical, and `d` grows only where a curve is visible. Byte-identical by
construction: dots, two-point strokes, strokes whose every vertex turns 50° or more, strokes whose every chord
is under 8 units.

**No input filter, no prediction.** One Euro (α = 1/(1 + τ/Tₑ), τ = 1/(2π f_c), f_c = f_min + β|v|): to
quiet a still finger f_min ≈ 1Hz (τ = 159ms); at a corner a child slows to ~100px/s, f_c ≈ 1.9Hz, τ ≈ 84ms,
and the line lags ~8px and cuts the corner — on a 16px square the corner is the answer. The jitter it would
remove (0.5–1.5px) is under the 1-unit rounding the store already applies; a moving average lags the same; a
filter is irreversible where render smoothing can be re-tuned for free. Predicted points draw ink where the
finger has not been and overshoot at turns; no finger-latency figure for Safari exists to justify them.

### 7. Increment 2 — see what the finger hides, and a hand is a hand (designed, not built)

- **The loupe** (Shift, Vogel and Baudisch 2007): touch only; opens after the owner stays within 10px for
  **300ms** at a stroke's start, or within **8px for 400ms** mid-stroke (children pause often); never while
  held or TWO; a `setTimeout` reset by moves, which only shows a view and never decides ink. Once open it stays
  until the lift and follows with no filter. **128px at 2x** (a 64px disc — a child's fingertip contact);
  centre at (x, y − 112), rim 48px above the contact (Shift's 22mm); beside the finger (x ∓ 112, y − 24) when
  its top would come within 8px of the viewport top, away from a resting contact, back above only 40px lower;
  clamped 8px inside; never below. A clone of `.qpad-art` in a box twice the art's size, moved by `translate`
  each frame, the live chunks and aid copied in the same write, a 6px gold crosshair ring. `position: fixed`
  on `<body>`, `pointer-events: none`, `aria-hidden`, no animation. **`.pad-loupe` added as a container in
  every figure-ink rule beside `.qsheet`, `.gd` and `.qp-area`**, held by check-css (its `.qp-area` pairing,
  one container along); tokens only; `--css-version` `…-2`.
- **Size rules, only after a reading** (`?pen=sizes` on an iPad at 390 and at the board). Ship only if every
  palm is at least 2x every fingertip and thumb; then `PAD_PALM_PX` = the geometric mean of the largest finger
  and the smallest palm, rounded down to 8px. Provisional: 120px; ratio 2x with the larger ≥ 48px; calibrated
  after 5 kept strokes to max(96, 2 x their median), for the visit only. **S1** a lone contact ≥ `PAD_PALM_PX`
  is a rest. **S2** a newcomer ≥ 2x the owner is a rest, no hold. **S3** held, owner ≥ 2x the candidate and the
  candidate lifts still: the candidate's dot is stored. **S4** a tentative stroke whose contact grows to
  `PAD_PALM_PX` is withdrawn. Two contacts that both move are always TWO, whatever their sizes.

### 8. Increment 3 — the ruler and the compass land on the point (designed, not built)

Ruler (both ends) and compass (the pin at the down, and a radius "through a target") snap; **the pen never
snaps; the board never snaps**. Targets in screen px, cached per pad: A, own ends and dots (and `.qpad-was`);
B, crossings where at least one stroke is a line or an arc (never freehand x freehand), at most 300, by a
32-unit spatial hash; C, the figure's `.pt` centres, small circles and closed-shape corners. Merged within 2px
(A over B over C). Radius r(t) = min(CAP, 0.45 x nearest neighbour), CAP 24px for A and 20 for B and C, so two
discs never overlap; the smallest |p − t| / r(t) ≤ 1 wins; released beyond 1.25r. Compass: through a target;
equal to the last radius within 10px (`r_last` per key for the visit); closed to a ring at ≥ 270° with a gap
≤ 20px; the radius held at the last rest (6px for 80ms). A gold halo of 30px shows a held snap before the lift;
the radius line turns solid. Stored values are the target's whole numbers; the ruler stays two points. **The
grid lattice waits for zoom**: at 1x the largest card square is 18.8px, under any useful gate.

### 9. Declined, and when to revisit

| declined | why | revisit when |
|---|---|---|
| pinch-zoom of the picture | needs a mode and a way back; the lock promises the card is held still | a device session shows children missing squares on a 180px figure after the loupe and snapping — then B's `viewBox` zoom (`PAD_VIEW` per key, `s_max = min(5, 3/u_max)`, a "Whole picture" tile), with lattice snapping gated on squares ≥ 48px |
| two-finger scroll of the pane | breaks "holds the card still" | — |
| a larger drawing face on tablets | 337's layout | when 337's layout is next changed |
| One Euro / moving average | §6 | — |
| predicted points | §6 | a device measurement of finger latency; then preview only, one frame or 12px, never stored |
| offset cursor | children expect ink under the finger; an offset makes a band unreachable | — |
| settling the start (B) | moves every stroke's start up to 6px | a device screenshot shows landing hooks |
| a tap stored as one point; roll trim; loupe placing a point; mid-stroke straightening (C) | each changes ink the child saw | — |
| a box cached across events (C) | goes stale silently | only §5's measured fallback |
| cancel always withdraws (B) | loses real lines | — |
| synchronous incremental live path (B) | a forced layout per event | — |
| curves with no minimum chord (B) | every dense stroke's `d` about 3x longer for nothing visible | — |
| edge-start rejection | no pad reaches an edge (`check/pen.js` asks: 16px) | that invariant fails |
| haptics | iOS has no vibration API | — |

### 10. What only a device can settle

1. Real finger, thumb and palm widths on an iPad, an iPhone and an Android phone (`?pen=sizes`) — the
   critical path for increment 2.
2. Whether `user-select` and `-webkit-touch-callout` stop iOS selecting text on an armed card (Chromium cannot
   show it — note 301).
3. How far apart children's fingers really land: 100, 200 or 250ms.
4. The coalesced sample rate for a finger on Safari 18.2+, and whether its entries still lack `pointerId`.
5. How often iOS sends `pointercancel` mid-stroke, and whether an iPad Pro cancels large contacts itself.
6. Whether the loupe's 300 and 400ms feel right to a child.
7. The kink a curve can put on a thinned board stroke (an isolated 10° kink between two 200px segments is
   drawn up to 2.6px off the polyline), on real strokes.

### 11. Every parameter

| name | value | unit | increment |
|---|---|---|---|
| `PAD_STILL_PX` | 10 | px | 1 |
| `PAD_ALSO_PX` | 5 | px | 1 |
| `PAD_TOGETHER_MS` | 200 | ms | 1 |
| `PAD_TOGETHER_PX` | 200 | px | 1 |
| "moving" (already down) | 10px from its down and a 5px move ≤ 200ms ago | px, ms | 1 |
| `PAD_BAR_MS` | 400 | ms | 1 |
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
