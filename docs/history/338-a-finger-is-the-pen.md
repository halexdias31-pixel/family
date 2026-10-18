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

- **T0, stale contacts.** A `pointerdown` with `isPrimary === true` forgets every contact **of its kind**
  first — the platform saying no other pointer of that kind is down — and drops a stroke made by that kind (its
  preview removed, nothing stored). *Of its kind* was added after review: `isPrimary` is per pointer type, so a
  palm is the primary touch while a stylus draws (see "After review", 11). jsdom's `undefined` never resets anything. `visibilitychange` (hidden), `pagehide` and `blur` end a
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
  palm that landed first is a rest; the candidate first, off the ink or down first → resume; kind a → TWO.
  *(Round 4: the swap waits until the candidate has gone 30px — a palm landing beside an aiming finger settles
  10–16px — and a lift hands nothing over; until then the hold goes on, and if the owner moves the half rule decides.)*
  *(After review.)* **Not with the ruler or the compass when the owner had been down more than 200ms** before
  the candidate came — a pin held on a point is not a palm (round 1, 3). The owner is made the stroke again, and
  which of the two is drawing is then a **race** (round 3, replacing round 2's 10px): the refused one going 30px
  first was the finger drawing, and the owner — a pin or a palm — marks nothing in that stroke however far it then
  drifts; the owner going further than the refused one has, and at least 10px, first was a finger aiming when a
  palm settled, and its line counts *(round 4: the owner too must go 30px first, counted from where it was when the
  refused one landed — at 10px a pin rolling 12 beat a finger starting slowly)*. Until one of them wins the owner
  marks nothing and nothing of it is shown. By
  movement a palm resting that long is a pin too, so it takes the finger's tool line with it (§4). A
  third contact → TWO. One of a held pair lifting is forgotten (the owner's samples with it); the other, if
  it is on the ink and came later, is held alone — it becomes the stroke if it goes on to move 10px *(round 4:
  30px)*, and nothing if it lifts short of that. *(Round 4: and when it is the other that lifts, the owner is held
  alone on the same terms — 30px, whichever came first.)* So a two-finger tap stores nothing whichever finger lifts
  first.
- **T5, TWO.** Nothing is drawn until every member has lifted — **or has gone still**: a contact landing while
  a member has moved 5px in the last 200ms joins the gesture; one landing after every member has been still that
  long ends it, and the members are ordinary contacts already down (T1 watches them). Amended after review: a
  gripping thumb or a resting palm that was half of a two-finger decision never lifts, and kept the pen dead
  (see "After review", 1).
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

**One decision this build added, measured: who went first is decided one frame late.** *(Rewritten after
review — decided at a frame, at each finger's own samples' time, and only once the one that went furthest has
gone 30px when the other has moved too: see "After review", 2 and 4. The paragraph below is what was built
first.)* Asked per event as
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
- *(After review.)* **A real two-finger gesture is decided at 30px, not 10**, when both have moved: a held
  stroke stays hidden that much longer (nothing visible — it is held), and a pan begun with a finger already
  down for more than 200ms shows up to 30px of line before it is taken off.
- *(After review.)* **A hand that rolls or settles more than half as far as the finger has gone by 30px** — a
  settle of over 15px — still reads as moving with it, and the line is lost; and a line shorter than about
  twice a hand's roll, lifted while the hand is still settling, is judged at the lift by the same half.
- *(After review.)* **A palm that slides along with the finger at more than half its speed for the whole line** is,
  by movement, a second finger: the line is lost (the review's hand-ink-60 and hand-card-60 — 2a7a7f3 lost both
  lines, now only the first). A higher half would let the spec's pinch with one finger off a small figure draw (its
  off-figure finger moves 0.56 of the other). Only size can tell a palm sliding from a finger panning (increment 2).
- *(After review.)* **A two-finger compass or ruler stores nothing** (a pin held on the centre and a second
  finger swinging), as before 338: neither finger is handed the stroke. A two-finger tool is a revisit. *(Round
  2: nor when the pin rolls 4–9px as the other swings. Round 3: nor at 12, 16 or 24px — the pin never marks once
  the other finger has gone 30px, and nothing of it is shown. Round 4: that was not quite true — a pin that settled
  8–9px as it was put down and rolled 3–5 more, or rolled 12px in 200ms beside a finger starting slowly, beat it to
  10px and stored its own ruler line or ring. The pin marks only by going 30px before the other finger does, now.)*
- *(After review, round 2.)* **A palm resting on the picture more than 200ms before the finger takes the
  finger's ruler line or compass arc with it — and every tool line after, for as long as that palm stays
  down.** Nothing is left at the palm *(round 3: true now at any drift, slide or creep once the finger has
  gone 30px; round 2 wrote it when a palm that drifted 10px still marked. Round 4: still not true — counted from
  its own down, a palm that settled 9px as it was put down and drifted 2–4 more under a slow-starting finger
  marked, and the finger went on to draw 120px. True now unless the palm goes 30px, from where it was when the
  finger landed, before the finger does)*. By movement a resting palm and a pin held on a point are the same
  thing (an old, still owner and a later contact moving alone); the pin rule refuses the swap to both, and the
  pen always swaps. Chosen over handing tools the swap back, which would put the swung finger's wrong arc back
  for every two-finger compass and store a palm's settle as a line when it lands beside a finger that is
  aiming — **a mark lost rather than a stray one left**, this section's first line. A palm down within 200ms
  of the finger still hands the tool over, and the pen hands it over at any age. Only size can tell a palm
  from a pin (increment 2); lifting the palm and drawing again draws.
- *(After review, round 3; round 4.)* **A palm resting first that slides 30px or more after a refused finger's line
  shorter than 30px** still marks — its own ruler line or ring. Round 3 had this at "further than the finger's line"
  (a 21px drift after a 20px tick); since round 4 both sides of the race need 30px, so a palm must go 30px before
  the finger does. Below 30px a finger's tick and a palm's settle move alike. A child's ruler line or compass
  radius is rarely under 30px (a 390 card's picture is about 300px across).
- *(After review, round 3; round 4.)* **A finger aiming with the ruler or the compass while a palm lands on the
  picture more than 200ms later and slides 30px before the finger has gone 30px** loses its line: the palm reads
  as the one drawing. A palm that settles and then slides along with the hand as the finger draws does not — the
  finger went 30px first. *(Round 4:)* **and the same aiming finger's line is lost if it is shorter than 30px**
  (the palm settled 10px or more, so the two race, and neither won). Round 3's "further than the palm" kept a 13px
  line; it is the same rule that let a pin rolling 12px win — 10px is inside a roll or a settle.
- *(After review, round 4.)* **A later contact is handed the stroke at 30px, not 10** — the finger after a palm,
  with the pen at any age and the ruler and the compass within 200ms. Its preview shows from 30px rather than 10;
  every sample is kept, so nothing of a line that goes on is lost. A palm landing beside a finger held still to
  aim settles 6–16px and stops short of 30, which is the point.
- *(After review, round 4.)* **A lift hands nothing over.** So the first strokes after a palm lands, if shorter than
  30px — a tick, a dash, a digit's stroke — are lost, for as long as that palm stays down and still; the first that
  goes 30px is handed over, and from then on the palm is a watched rest and short strokes draw. A finger that slides
  on after the other of a two-finger tap lifts must go 30px too, whichever lifted first. Chosen in round 4 (see "After
  review, round 4") over the review's rule, which let a lift hand it over from 10px and so stored a palm's settle
  whenever something lifted first: a palm that settled 12px beside an aiming finger and lifted had its settle stored
  and the finger's line after it lost, and a finger that tapped still beside a settling palm handed it the stroke. *A
  mark lost rather than a stray one left.*
- *(After review, round 4.)* **A short stroke by an aiming finger after a palm has brushed the picture** — landed
  after it, settled, and lifted — is lost if it is under 30px, and a longer one shows from 30px: the finger is left
  alone in a held stroke, and whichever is left alone is handed it only at 30px. Chosen in round 4 over handing it
  back at 10px, which let a resting palm left alone after a finger's short tick draw its slide as the hand moved on —
  and then made every finger stroke after it a rest beside an established stroke, lost until the palm lifted.
- *(After review, round 4 — found, not changed.)* **A palm resting first that slides 10px while a finger that has just
  landed beside it has moved less than 5** reads as the one drawing (T4: the owner first → resume), and its slide is
  its stroke: a palm that settled 9px and then slid 22px in 200ms as a slow-starting finger landed stored its ruler
  line (`[[289,289,327,289]]`) or a ring round itself, in real touch on Q4 at 390 and 820, 7 of 8 over two passes —
  and so did 4955c7c (the first finger owned the stroke) and 2a89387. By movement it is a finger aiming that starts to
  draw beside a palm resting still, the case T4's resume is for. The simpler rule that would catch it — nothing held
  is decided under 30px, the owner too — was tried in jsdom and loses lines round 3 kept: the aiming ruler finger's
  beside a settled palm that slides along with it (both moving, so the half rule calls them two), and the 20px line's
  preview within a frame. Left for the size rules (increment 2) and named for the next review.
- *(After review, round 4.)* **A palm that settles more than half as far as the aiming finger has gone at 30px** — a
  settle over 15px, landing after the finger — reads as a hand moving with it (the half rule) and the finger's line
  is lost. How far the finger has gone by the first frame past 30px decides it: on November 2019 1H Q4, where the
  picture is small and the line slow, a 16px settle stored nothing in 4 of 8 runs over four passes at 390 and 820; on
  the board and on Q7, 1 of 16 (the board at 390).

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
| a two-finger compass or ruler: the still finger the pin, the moving one the pencil *(after review)* | two fingers do nothing through all three increments; it is a new gesture to design, teach and prove | a device session shows children reaching for a pin finger (until then the pin's stroke stores nothing, as before 338, and nothing however the pin rolls unless it goes 30px before the other finger does — rounds 3 and 4) |
| the palm-first swap for the ruler and the compass when the palm had rested more than 200ms *(after review, round 2)* | by movement a resting palm is a pin; the swap stores the two-finger compass's wrong arc and a palm's settle beside an aiming finger *(round 4: where the swap is kept — the pen, and tools within 200ms — it now waits for 30px, so a palm's settle beside an aiming finger is not handed the stroke there either)* | the size rules (increment 2) can tell a palm from a fingertip — then a palm is a rest by size and the pin rule is asked only of fingertips |
| a lift handing a later contact the stroke from 10px *(round 4)* | the review proposed it with the 30px hand-over; it stored a palm's settle whenever something lifted first — a palm brushing the picture beside an aiming finger, or a finger tapping beside a settling palm | the size rules (increment 2): a fingertip's short tick after a palm could be handed over by size |

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

**The container restarted** part-way through this work, after the fixes were written and before they were committed.
Nothing it had run was taken on trust: every check below was run again on the files as committed, every mutation was
made again from them (one change each, in a copy — the worktree never written), and every red on 2a7a7f3 was asked
again of a copy of 2a7a7f3 with today's checks laid over it. Two things were added in the rerun: the memo's
character budget (7, above) and a check for the "came later" mark (Found while fixing, above), each with its
mutation. The load average through it was 9–53 on four cores, from other builds; every timing below says so.
Ports 19883–19888 only.

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors), `check-loading`, `check-scope`,
  `check-strings`, `check-drafts`, `check-widgets`: green. `check-dead` (soft) prints the report 2a7a7f3 prints.
- **check-flow in four parts: 82 + 83 + 83 + 83 = 331 journeys** (330 at 2a7a7f3, and the one added here). Part 4,
  at a load average of 26–33, failed one journey that does not touch the pen — "the payload landing does not rebuild
  Find under a keypad box…", whose wait is half a second — and it passed run again alone (load 34): load. **The 21 pen
  journeys together, alone** (the 15 of 4955c7c, the five of increment 1, the one added here): all green.
- **`check/pen.js` in full: OK in 269s** (load 32–35). Its 'samples': 1,201 of 1,201 distinct samples kept at 390
  and 820; at most 2 live `d`s written in any frame (of 798 and 591 frames); **0 forced layouts** in 125 and 213
  traced pen events; the path painted in the first frame after its event for **100%** of them; the handler's p95
  3.6 and 2.9ms by the wall clock and 3.25 and 2.88ms of thread time (printed, against the 3.0 reference) — the
  frames over 33ms (63 of 797 at 390) say how busy the machine was. With `PEN_QUERY=pen=sizes`: OK, 0 forced in 229
  and 169 events. 'phase': 0 of 8 at both sizes. Its pictures read: the gripped board with both lines, the
  two-finger compass on November 2019 1H Q4 with nothing on it and the Compass tile chosen, the round circle.
- **On 2a7a7f3, the same sections red:** 'grip' (both sizes, `[]`), 'settle' (thumb-roll-9, palm-card-settle-12,
  palm-lands-settles, all `[]`, both sizes), 'types' (the palm's dot `[[238,289]]` for the stylus's line, and `[]`
  for the finger's, both sizes), 'pin' (the swung arc and `[[205,170,254,170]]`), and 'samples' with `?pen=sizes`
  (138 of 138 and 155 of 155 events forced a layout). 'phase' drew 0 of 8 there too; its red is the mutation's.
  check-flow's review journey on 2a7a7f3: every case named in 1–4 and 7, 9 and 11 above red.
- **Mutations, each in its own copy, each red, the real files green after** (and compared: a copy differs from the
  worktree by its one change and nothing else). check-flow: TWO kept while still (both held-hand cases); TWO
  dissolved at every landing (the tap's guard, `[[113,85]]`); no keep-up wait (the thumb roll keeps one line of
  two, the palm first keeps none); no half (all four settle cases); the pin rule removed (the compass arc and the
  ruler line); no `PAD_LAG_MS` (the late report's pan drew); every chunk rewritten every frame (3 writes in a
  frame); the group rewritten on Undo; no memo; the memo held to 4,000 strokes (5,772K characters); the sizes line
  written in the event; T0 for every kind (the stylus's line and the finger's); the "came later" mark kept (the
  palm's slide stored). `check/pen.js`: TWO kept while still → 'grip' `[]` at both sizes; no keep-up and no half
  → 'settle' (no keep-up: thumb-roll-9 one line of two at 390, the palm settle and the landed palm nothing at both;
  no half: all three at both); the pin rule removed → 'pin'; decided inside the event → 'phase' 8 of 8 and 3 of 8;
  T0 for every kind → 'types' at both sizes; the bar's lifts swapped back → 'bar' (the pen itself says which lifted
  first); every chunk rewritten → 10 live writes in a frame; a frame added → painted in the first frame for 33%
  and 36%; a style write and a box read per event → 44 of 114 and 92 of 186 forced; the sizes line in the event →
  202 of 202 and 168 of 168 forced. Decided inside the event stays green in jsdom (its frames are timers): the
  browser holds it.
- **`check/swipe.js` in full: OK** (410s, load 28–30). **`check/cascade.js`: OK. `check/cards.js`: OK.**
- **`check/ui.js`** `--screen=tools`, `--screen=saved` and `--screen=stuff`: exit 0, nothing new; their "not reachable"
  lists are word for word the ones printed before the restart, which increment 1 recorded as 4955c7c's.
- **`check/press.js`** `--screen=tools`: 6 swipes went elsewhere at a load average of 30–48, and 4 run again at
  11–20 — every one a timed tap or flick: "tap Draw" on Q-1CM-transformations-of-graphs-8 not turning the card in
  300ms, a flick chain on Games, a press mark on Feed. **4955c7c, before any of 338, under the same load (40),
  missed 6 — the same "tap Draw" at both sizes, and the padlock and "touch across" ones** — and 2a7a7f3 missed 4.
  None arms a pad, so none reaches the pen (`PAD_ON` is empty and the listeners do nothing). `--screen=stuff`: 4,
  then 3 — the same kinds; 4955c7c at a load of 37–39 missed 3, the same "tap Draw" at 844x390 among them. Nothing threw and nothing was silently inert in any run. Load, and the same on the base.

**Not run as one: `npm run check`.** Its browser members take fixed or OS-chosen ports outside this build's range;
every member that touches the pen, the swipe engine or the stylesheet was run above, alone.

### After review, round 2 (12 Oct)

A verification of round 1, with real touch through CDP (Chromium 1194, 4x CPU, November 2019 1H Q4 armed with a
real tap and each tool chosen with a real tap on its tile, at 390x844 and 820x1180), found one should-fix — in round
1's fix 3 — and nothing else. It was reproduced first on a4d0ccf with the verifier's own script, at a load average of
18–27, and then held by checks that are red there.

**The finding: a refused swap made the still owner the stroke again, with 4px to go.** When the later contact moves
alone and the pin rule refuses it the stroke (ruler or compass, the owner down more than 200ms before it), `padAlone_`
resumed the owner — and `PAD_DRAW.ruler.end` and `compass.end` asked only `PAD_MIN_PX`, 4px. Two things followed, and
§4 listed neither:

1. **A pin that rolled stored its own mark.** Finger 1 trembling ±0.4px on the centre for 300ms, then drifting 6px
   over 300ms while finger 2 swings 270° round it at 0.28 x the picture (or slides 40px, the ruler): a4d0ccf stored
   `[[153,170,160,170]]` for the ruler and a 10–11-point ring of radius about 8 units round the pin for the compass,
   at 390 and at 820. With no drift, `[]`. The brief's stray blob, where §4 said nothing is stored.
2. **A palm resting on the picture first took the finger's tool line, and left its own.** A palm (radius 25) at
   (0.85, 0.85) of the picture, still for 400ms; then the finger lands at (0.25, 0.4) and draws a 120px ruler line,
   or opens 60px and swings the compass, while the palm drifts 6px in the first 120ms: a4d0ccf stored the palm's
   `[[289,289,296,289]]`, or a 10-point ring at the palm, and the finger's line was lost (with no drift, `[]`).
   2a7a7f3 drew the finger's line every time; 4955c7c stored the palm's marks. The pen drew the finger's line in every
   case, and so did every tool when the palm came only 120ms before the finger.

**Fixed: a ruler's or compass's still owner made the stroke again after a refused swap marks nothing until it has moved
10px.** *(Not enough: the third review drifted the palm and rolled the pin 12px and both marked again — 10px is inside
what a palm drifts. Replaced by a race in round 3, below.)* In `padAlone_`, when the other moved alone and may not take the stroke, a tool stroke gets `g.min =
PAD_STILL_PX`, and the tool's end (and the compass's radius line in the aid, so it does not show a radius that will not
count) asks `padMinOf_(g)` in place of `PAD_MIN_PX`. 10px is the app's own "has moved" (§3). A 4–9px roll of a pin or
drift of a palm marks nothing; a finger that was aiming when a palm landed and settled is made the stroke again, and its
line is far past 10px. The pen is untouched: a pen's resumed owner is the finger (the pen hands a palm's stroke over at
any age). Nothing stored changes shape.

**Decided: the tools keep the pin rule, so a palm resting more than 200ms before the finger takes the finger's ruler
line or compass arc with it — and each one after, while it stays down** (§4 and §9 say so now). The review left the
choice to whoever decides; it is decided here on this note's own rule, with every alternative written down and
measured, so that it can be changed knowingly. By movement a resting palm and a pin are the same thing — an old, still
owner and a later contact moving alone — and with no size to go on, every answer loses something:

| after a refused swap | a pin, and a second finger swinging round it | a palm resting 400ms, then the finger | a finger aiming 300ms, then a palm lands and settles 12px |
|---|---|---|---|
| **made the stroke again, 10px to mark (chosen)** | nothing | nothing: the finger's line lost, and the next while the palm stays | the finger's line |
| the swap handed back to tools (2a7a7f3; the spec's T4) | an arc round where the swinging finger landed; a ruler line along its slide | both of the finger's lines | the palm's settle stored, `[[320,320,308,320]]`, and the finger's line lost |
| the stroke withdrawn, the owner a rest | nothing (a second swing with the pin left down: an arc round the wrong centre) | the first line lost, the second drawn | nothing: the finger's line lost |
| the swap only when the two landed more than `PAD_TOGETHER_PX` apart (a palm heel is 60mm+ from the fingertip) | nothing within 200px; a wider span, or two hands, the wrong arc | the finger's line beyond 200px, lost within it | beyond 200px, the palm's settle stored |

The first three rows are measured in jsdom (the journey's own cases, each alternative as a one-line mutation); the last
is reasoned from the first two and was not built — and would not have saved the review's own case: its palm and finger
are about 190px apart on Q4's picture at 390 and about 200px at 820 (measured from the pictures), because a card's
picture is at most 320px wide and a palm resting ON it is never far from the finger. **Only the chosen row never leaves a mark that was not meant** *(as built in round 2 it did leave one: a palm or a pin
that went 10px or more marked — round 3)* —
§4's first line, "a mark lost rather than a stray one left", and the brief's *"accidental stray ink blobs"*. Its cost
is a palm resting on a construction card; lifting it, or putting it down with the finger, draws. Increment 2's size
rule is the real answer: a palm is a rest by its size, and then the pin rule need only ever be asked of fingertips.

**Checked.** check-flow's review journey, on the 340x170 question pad with a construction question's tiles:

| case | a4d0ccf | now |
|---|---|---|
| a pin on the compass's centre rolling 6px while a second finger swings | an 11-point ring round the pin | `[]` |
| a pin on the ruler's end rolling 6px while a second finger slides | `[[170,170,176,170]]` | `[]` |
| a palm 400ms before the ruler finger, drifting 6px, then a second line with the palm still down | `[[320,320,314,320]]` | `[]` |
| the same with the compass | an 11-point ring at the palm | `[]` |
| *guard:* a ruler finger aiming 300ms, a palm landing and settling 12px before it moves | the finger's line | the finger's line |
| *guard:* a palm 120ms before the ruler finger, drifting 6px | the finger's line | the finger's line |
| *guard:* a palm 400ms before the pen finger, drifting 6px | the finger's line | the finger's line |

`check/pen.js` 'pin' now runs at 390 and 820, each tool with and without a 6px roll, and the new 'palmtool' (the review's
palm, 400 and 120ms before the pen, the ruler and the compass, drifting 6px): never a mark at the palm, never a mark that
is not the finger's, the finger's line wherever the palm came within 200ms or the tool is the pen, and the pen let go
after. On a4d0ccf, with this check laid over it: 12 findings — the rolled pin's ruler line and ring at both sizes, the
palm's line and ring at both sizes (each "at the palm" and "not the finger's"). Now: OK, at both sizes; the ruler and
compass with the palm 400ms before store `[]`, printed as the cost.

**Mutations, each one line in its own copy, each red, the real files green after** (each copy differs from the worktree
in `js/find.js` by its one line and nothing else):

- the 10px rule removed → check-flow: the two rolled pins and the two resting palms; `check/pen.js`: the same 12 as
  a4d0ccf.
- the pin rule asked of the pen too → check-flow: the pen 400ms guard (the palm's drift stored as a pen stroke, the
  finger's line lost); `check/pen.js` 'palmtool': the pen at 400ms, both sizes.
- the pin rule at any gap (`> 0`) → check-flow: the ruler 120ms guard, and round 1's palm-first compass at 40ms;
  `check/pen.js`: the ruler and the compass at 120ms, both sizes.
- withdrawn outright in place of made the stroke again → check-flow: the aiming finger's line lost (and the resting
  palms' second lines drawn — the table's third row).
- the pin rule removed (round 1's own mutation, run again for the table) → check-flow: both held pins, both rolled pins,
  both resting palms (the finger's lines) and the aiming finger (`[[320,320,308,320]]`).

#### The suite, round 2

Run on the files as committed, ports 19883–19888, at a load average of 11–44 from other builds on four cores.

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors), `check-loading`, `check-scope`,
  `check-strings`, `check-drafts`, `check-widgets`, `check-library`, `check-funnel`: green. `check-dead` (soft)
  prints, byte for byte, what a4d0ccf prints.
- **check-flow in four parts: 82 + 83 + 83 + 83 = 331 journeys, all green** (455, 206, 254 and 547s, load 13–27); the
  journeys that draw, run together alone: 19 of 19.
- **`check/pen.js` in full: OK in 301s** (load 17–27): 'samples' kept 1,201 of 1,201 at 390 and 820, at most 2 live
  writes in a frame, 0 forced layouts in 240 and 246 traced events, the path painted in the first frame for 100%;
  'phase' 0 of 8 at both sizes. With `PEN_QUERY=pen=sizes`, 'samples': OK, 0 forced in 245 and 239. 'pin' and
  'palmtool' alone: OK at both sizes, three times. The pictures read: November 2019 1H Q4 at 390 and 820, armed, the
  Compass chosen, nothing on the picture after a two-finger compass.
- **`check/swipe.js` in full: OK** (112 gestures, 321s). **`check/cascade.js`: OK** in 2,428s — its first run was
  stopped by this build's own 1,500s limit (exit 124, "target closed"), not by a finding; round 1 measured it at
  990s at a lower load. **`check/cards.js`:** the first run, at a load of 25–37, said "the app has no practical items,
  so this check saw nothing" (the payload had not arrived), exit 1; run again alone at 19–23: OK.
- **`check/ui.js`** `--screen=tools`, `--screen=saved`, `--screen=stuff`: exit 0, nothing new; the "not reachable"
  lists word for word round 1's.
- **`check/press.js`** `--screen=tools`: 4 swipes elsewhere at a load of 29–38 (a Feed press mark, two Games flick
  chains, "tap Draw" on Q-1CM-transformations-of-graphs-8 at 844x390); run again, at 19–27: OK, exit 0; a4d0ccf under
  the same load missed 1 (a Games flick chain). `--screen=stuff`: 1 ("tap Draw" at 568x320), then 2 (Games flick
  chains), and a4d0ccf, run between them, 2 (press marks on Reels and Tools). Every one is a timed tap or flick that
  arms no pad, so none reaches the pen; nothing threw and nothing was silently inert in any of the six runs. Load, and
  the same on a4d0ccf.

**Not run as one: `npm run check`**, for the same reason as round 1: its browser members take ports outside this
build's range. Every member that touches the pen, the swipe engine or the stylesheet was run above, alone.

### After review, round 3 (12 Oct)

A verification of round 2, with real touch through CDP (Chromium 1194, 4x CPU, November 2019 1H Q4 armed with a real tap
and each tool chosen with a real tap on its tile, at 390x844 and 820x1180), found one should-fix — in round 2's own fix —
and nothing else.

**The finding: round 2's 10px only moved the stray mark.** After a refused swap `padAlone_` still made the still owner — a
pin, or a palm resting on the picture — the stroke again, and its ruler line or compass radius counted once it had moved
10px. Round 1 measured a thumb's roll and a palm's settle at 6–12px; 10px is inside that, and a palm that drifts with the
hand goes further still. So a palm on a construction card that drifted 12px or more while the finger drew stored its own
ruler line or a ring round itself, and the finger's line was lost — the brief's *"accidental stray ink blobs"*. So did a
palm that slid 12px after the finger had lifted, one that crept 22px through three tries, and a pin that rolled 12px while
the other finger swung. And the palm's line or ring was **shown** as it drifted, while nothing of the finger's showed, and
vanished at the lift. d66be43's subject ("a pin that rolls or a palm that drifts marks nothing"), the comments over
`padAlone_` and `padTakes_`, §4 ("Nothing is left at the palm") and round 2's table ("Only the chosen row never leaves a mark
that was not meant") all said otherwise; each now says what is true (a commit message cannot be changed, so this note is
where d66be43's subject is corrected).

**Reproduced first, on d66be43,** with the verifier's own script (`probe2.js`, the four sections `palmdrift`, `pinroll`,
`palmafter`, `palmlong`), real touch at 390 and 820, at a load average of 38.8–45.3: **14 stray marks at each size, 28 in
all.** At 390: a pin rolling 12 and 16px stored `[[153,170,168,170]]` and `[[153,170,173,170]]` with the ruler, and a ring
round the pin with the compass (at 9px, nothing); a palm drifting 12, 16 and 24px over the finger's line stored
`[[289,289,304,289]]`, `[[289,289,309,289]]` and `[[289,289,318,289]]`, or a ring at the palm (at 0 and 9px, nothing); the
palm sliding 12px after the finger lifted stored `[[289,289,304,289]]` or a ring; the palm down through three tries,
creeping 22px, stored `[[289,289,315,289]]` or a ring, and none of the three lines. At 820 the same, a unit or two shorter.
The same in jsdom: the new cases below, laid over d66be43, fail 87 ways — 25 of them a mark stored at the pin or the palm,
the rest a preview or the aid shown for a mark that cannot be kept.

**Fixed: after the pin rule refuses a contact on the picture, which of the two is drawing is a race, and until it is won
the still one marks nothing and shows nothing.** (`padRace_`, `padPinned_`, `padShown_` in js/find.js.)

- **The refused one going 30px first** (`PAD_KEEPUP_PX`, round 1's "past any roll or settle") was the finger drawing: the
  still one is a pin or a palm and **never** marks in that stroke, however far it then drifts, slides or creeps.
- **The still one going further than the refused one has, and at least 10px, first** was a finger that was aiming when a
  palm landed and settled: its line counts, and is shown from that moment — even if the palm then slides along with the
  hand.
- **Until one of them wins, nothing of the still one is on the picture**: no ruler line, no ring, no aid
  (`padShown_` in `padLiveShow_` and `padLive_`). A preview is a promise of what the lift keeps.
- **First by the samples' own clock, decided at a frame** — `padJudge_`'s reason: under load one event carries a finger's
  last 100ms, and the other's event for the same moments can come before or after it. Each side's moment is the sample it
  crossed at; a side is beaten only once the other has reported that far, or has been silent `PAD_LAG_MS`, or lifted. The
  owner's lift (and the page going) decides from what has come.
- **Only the pin rule's refusals race** (`padPinned_`): a contact refused because it was down first, or is off the picture
  (a thumb on the card), says nothing about the owner — the owner is the later finger, and draws as before. Off the
  picture the owner still needs 10px (round 2's `g.min`, now raised with `Math.max` so a second refusal cannot lower it).
- The pen is untouched: it never refuses a later contact on the picture.

**The review's prototype, and the other answers, measured** (each a mutation of the chosen code, in jsdom, the journey's
own cases):

| after a refused swap | a pin rolling, or a palm drifting, 12–24px; a palm sliding 12 or 60px after; creeping 22px | a finger aiming, a palm settling 12px, then sliding 40px along with the line | a finger's 20px ruler tick refused, then the palm drifting 15px | a thumb on the card sliding 40px while the finger aims |
|---|---|---|---|---|
| round 2: the still one marks at 10px | the pin's or palm's own line or ring | the finger's line | the palm's `[[320,320,305,320]]` | the finger's line |
| the review's prototype: the refused one at 30px, at any time, and the still one never marks | nothing | **lost** | the palm's line | the finger's line |
| the race, but the still one wins at 10px (no "further than the other") | the pin's ruler line at a 24px roll; the palm's line or ring at a quick 24px drift | the finger's line | the palm's line | the finger's line |
| the race, counting a refusal off the picture | nothing | the finger's line | nothing | **lost** |
| **the race (chosen)** | **nothing** | **the finger's line** | **nothing** | **the finger's line** |

The prototype measured green on the review's own 40 real-touch cases; what it costs is the second column — a hand that
settles beside an aiming finger and then moves with it, which is the case the pin rule's refusal exists to keep. "Further
than the other" is what the first and third columns need: at 10px alone a quick 24px palm drift and a 24px roll of the ruler's pin win
before the finger has gone 30px, and a palm drifting 15px beats a 20px tick.

**What is left, written into §4:** a palm that drifts further than a refused finger's line, when that line is under 30px,
still marks (below 30px a tick and a settle move alike, and "whichever went further" is the rule); and a finger aiming while
a palm lands and slides 30px before the finger has gone further loses its line.

**Checked.** check-flow's review journey ("the finger pen after review"), on the 340x170 question pad with a construction
question's tiles — every case asserting the store, and the ones that must show nothing asserting that no preview and no
aid is on the picture mid-gesture:

- a pin rolling 6, 12, 16 and 24px, compass and ruler: `[]`, nothing shown;
- a palm 400ms before the finger drifting 6, 12, 16 and 24px, in its first 120ms and over the whole line, each tool, with a
  second line while it stays: `[]`, nothing shown;
- a palm sliding 12 and 60px after the finger lifted, each tool: `[]`, nothing shown;
- a palm down through three tries creeping 22px, each tool: `[]`, nothing shown;
- a finger's 20px ruler tick refused, then the palm drifting 15px: `[]`;
- *guards:* a ruler finger aiming, a palm settling 12px — and the same with the palm then sliding 40px along — the finger's
  line, shown as it is drawn; the same with the palm's moves folded 50ms at a time ahead of the finger's (the race by the
  samples' clock): the finger's line; a thumb on the card sliding 40px while the finger aims: the finger's line; a palm
  left down from one ruler line sliding 30px as the next finger lands: both lines; and round 2's guards (a palm 120ms
  before the ruler, 400ms before the pen) unchanged.

`check/pen.js` 'pin' now rolls the pin 0, 6, 12, 16 and 24px, and 'palmtool' adds the palm drifting 12, 16 and 24px over the
line, sliding 12px after the finger lifts, and the aiming finger with the palm settling and sliding 40px along; every case
where nothing can be kept also counts, on every animation frame from the second contact's landing, the frames with a
preview or the aid on them (`shownWatch`): none. Laid over d66be43: **80 findings** — every stored mark above at both sizes,
and a preview or the aid on the picture in 1–103 frames of every pin and palm case. On the fix: OK.

**Real touch, after.** The verifier's own script on the fix, the same 40 cases at 390 and 820 (load 38.8–56.4): **0 marks
and nothing left behind** (`PAD_TOUCH` empty, `padBusy_` false, no live path) — against 28 marks on d66be43, run again
beside it at the same load. Screenshots taken mid-gesture, the palm down through three tries (read): on d66be43 a gold
ring round the palm beside D, or its ruler line above CD, while the third finger draws nothing; on the fix, the picture
as it was — C, D and P and nothing else.

One thing learned on the way, kept in the check: the first 'aim' gave the finger 200ms between the palm's settle and its
first move, and under this load the frame that tells a settle apart came 100–230ms late — a frame trace showed it — so the
settle was still undecided when the finger moved, and read (round 1's rule) as a hand moving with it: nothing drawn.
Given 600ms, it was decided first in 10 runs of 10, the finger's line shown in 9–30 frames.

**Mutations, each its own copy of the fix differing in js/find.js by the change named** (the copies were made before a
comment-only edit to `padMinOf_`'s comment): every one red, the real files green after.

| mutation | red in check-flow | red in check/pen.js |
|---|---|---|
| no race — round 2's rule back | 87: every pin and palm case, stored and shown | 79 findings: the pin's and the palm's marks at both sizes (42), and a preview or the aid on the picture (37) |
| nothing hidden (`padShown_` always true) | 62: a preview and the aid on every pin and palm case | 40: a preview or the aid on every pin and palm case that keeps nothing, at both sizes; nothing stored |
| the review's prototype | the aiming finger with the palm sliding along; the folded-samples race; the 20px tick | the aiming finger, at both sizes: its line lost (at 390 never shown either) |
| a refusal off the picture counted | the thumb on the card | — |
| a refusal for being first counted | the palm left down from one ruler line: the second line lost | — |
| the still one wins at 10px | the ruler's pin rolling 24px; the palm's quick 24px drift, each tool; the 20px tick | — |
| the still one's line not shown when it wins | both aiming fingers: "not shown as it was drawn" | — |
| decided by event order, not the samples' clock | the folded-samples race | — |

The labels "a pin held on the ruler's centre" now say the ruler's **end** (a nit, in check-flow and check/pen.js).

#### The suite, round 3

Run on the files as committed, ports 19883–19888. The load average was 23–56 from other builds on four cores for most
of it, and fell to 2 near the end; every failure below was run again, alone or beside d66be43, and is said so.

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors), `check-loading`, `check-scope`,
  `check-strings`, `check-drafts`, `check-widgets`, `check-library`, `check-funnel`: green (check.js, const, scope, strings
  and doors run again after the last, comment-only, edit). `check-dead` (soft) prints, byte for byte, what d66be43 prints.
- **check-flow in four parts, 82 + 83 + 83 + 83 = 331 journeys.** At a load of 30–49, four journeys outside the pen
  failed: "just a minute keeps its round…" (part 1), "a payload that timed out is asked for again at once…" (part 2),
  "the payload landing does not rebuild Find under a keypad box…" and "the timetable holds your booked sessions
  locked…" (part 4). The first three passed run alone; the timetable one failed alone at a load of 30 on the fix **and on
  d66be43** alike (its 1,100ms debounce wait). At a load of 2, parts 1, 2 and 4 ran again whole: **all green**, the
  timetable included; part 3 was green first time. The journeys that draw, run together alone: 19 of 19.
- **`check/pen.js` in full: OK in 605s** (load 23–50): 'samples' kept 1,201 of 1,201 at 390 and 820, at most 2 live
  writes a frame, 0 forced layouts. With `PEN_QUERY=pen=sizes`, 'samples': OK. 'pin' and 'palmtool' alone: OK (and 80
  findings on d66be43 with this check laid over it).
- **`check/swipe.js`:** at a load of 42–46, three runs on the fix each failed only REACH — the check not reaching its
  subject: 5, 4 and 3 of them ("wide 1280 mouse: no button… to press", "only 5 drag frames were placed", "the queue had
  emptied before the finger landed") — and d66be43, run between them, failed 2 of the same kind. Side by side at 18–26:
  **the fix OK (112 gestures)**, d66be43 1 REACH ("only 4 drag frames"). Load. overworld.js is unchanged since round 1.
- **`check/cascade.js`: OK** in 3,425s. **`check/cards.js`: OK.**
- **`check/ui.js`** `--screen=tools`, `--screen=saved`, `--screen=stuff`: exit 0, nothing new; the "not reachable" lists
  word for word round 2's.
- **`check/press.js`** `--screen=tools`: 4 misses at 37 and 6 at 33–43 (press marks, Games flick chains, "tap Draw" on
  Q-1CM-transformations-of-graphs-8 and 1F-11c, a tap on the board's padlock — a tap no armed pad sees); side by side at
  26–33 the fix and d66be43 missed 3 each, the same kinds; at a load of 2–8 the fix missed one Games flick chain, then
  d66be43 and the fix, one after the other: **both OK**. `--screen=stuff`: 8 misses at 33–46 (the same kinds); side by
  side at 8–30: **the fix and d66be43 both OK**. Nothing threw and nothing was silently inert in any run.

**Not run as one: `npm run check`**, as in rounds 1 and 2: its browser members take ports outside this build's range.
Every member that touches the pen, the swipe engine or the stylesheet was run above, alone.

### After review, round 4 (12 Oct)

A verification of round 3, with real touch through CDP (Chromium 1194, 4x CPU) on the board, on June 2024 1F Q7 and on
November 2019 1H Q4, at 390x844 and 820x1180, found one must-fix, one should-fix and one nit. The main session decided
the first three answers; the fourth was left to this round — *if a further fault of the same family appears (a contact
that is not the drawing finger marking, or the drawing finger's line lost), prefer the simpler rule over another
special case* — and it was needed three times.

**The must-fix: a palm landing after an aiming finger took its stroke.** A finger held still on the armed picture
(aiming a line, or a point) is the owner and a dot. A palm landing on the picture after it, at any age, was held as the
candidate (T2, kind b), and once its centre had moved 10px alone — a palm settles 6–12px as it flattens, round 1
measured, and 16 is not rare — T4 handed it the stroke, as the pen hands a palm-first stroke to the finger. Its settle
was shown and stored, and the finger, a rest from then on, drew a line that was lost. The ruler and the compass did the
same when the palm landed within 200ms of the finger. 4955c7c, where the first finger always owned the stroke, kept the
line in every case: a regression, and the spec's own §2 row *"finger held still, a palm lands, finger draws"*.

**The should-fix: the race counted the still one from its own down.** After the pin rule refuses a contact the two race
(round 3), and the still one — a palm or a pin — was measured from where it went down, so what it moved before the other
landed counted. A palm that settled 9px as it was put down (under 10: a dot, so it never marked) needed only 2–4px more
while a slow-starting finger was at 10–12px: its own ruler line or a ring round itself, shown and stored, and the
finger's 120px line after it lost. 2a89387's subject — *"after a refused swap the pin or palm never marks once the finger
has drawn 30px"* — was not true: here the finger drew 120px. A commit message cannot be changed; this note is where it is
corrected.

**The nit: the race was asked at the frame's time.** Each of the still one's samples was compared with how far the
refused one had gone by the frame that asked, not by that sample — so a late frame could find a palm that had settled
and then slid along already past the finger's sample that beat it, and lose the line.

**Reproduced first, on 2a89387,** with the verifier's probes (`probe3.js`, `probe4.js`, copied into this round's own
scratch), real touch at a load of 1–8. The container restarted part-way through this round and its suite went with it;
the numbers below are from the pass after, run again on 2a89387, 4955c7c and the fix, and where the first pass said
something else it is said so:

- *Must-fix, the pen* (`probe4.js`, the board and Q7 at 390 and 820; a finger trembling ±0.3px on (0.2, 0.35) of the
  ink, a palm of radius 25 landing on (0.8, 0.85) 300ms or 1.5s later and settling S px in 80ms, the finger drawing half
  the ink's width 150 or 400ms after the palm landed): **16 of 16 at S = 12 and 16 stored the palm's settle** —
  `[[272,289,257,289]]` on the board, a squiggle from (272, 289) on Q7 — shown in 26–50 frames, and none of the finger's
  line. At S = 9, and with the palm on the card off the ink, the finger's line (8 of 8). 4955c7c: the finger's line,
  24 of 24.
- *Must-fix, every tool* (`probe3.js --only=aim`, Q4): the pen at 12, 16 and 12-with-150ms, 6 of 6 the palm's mark; the
  ruler and the compass with the palm 120ms after the finger, 4 of 4 — `[[289,289,274,289]]` or a ring at the palm.
- *Must-fix, with a lift* (`probe6.js`, written for this round; Q4 at 390 and 820): the same palm settling 12 or 16px and
  LIFTING before the finger moves (a hand brushing the picture), or the finger LIFTING still while the palm stays (a
  tap): **the palm's settle stored, 8 of 8 and 8 of 8**, every tool — and the brushed finger's line after it lost.
  4955c7c: the finger's line; for the tap, the tap's dot with the pen and nothing with the tools.
- *Should-fix* (`--only=headstart`, the palm 400ms first settling 8–9px, then drifting 2–4 under a minimum-jerk finger):
  the ruler 3 of 8 and the compass 1 of 6 stored the palm's line or ring (`[[289,289,303,289]]`…) — 4 of 8 and 3 of 6
  in the first pass; the controls (no drift, 6+6, 0+12) nothing. Timing-dependent, as the review said. The pin
  (`--only=pinslow`), settled 9px and rolling 3: its ruler line, `[[153,170,167,170]]` at 390 and `[[153,170,166,170]]`
  at 820. 4955c7c, where the first finger owned the stroke: every headstart run (26 of 26, the controls too) and every
  pin run (12 of 12) marked.
- *jsdom:* this round's cases laid over 2a89387's check-flow fail as above — the pen at 12 and 16 at 300ms and 1.5s, the
  ruler and the compass at 12 and 16, every lift case, the 9+3, 9+4 and 8+4 ruler drifts, the 'pause' case below, the
  compass pin settled 9 or 8 and rolling 3 or 5, and the nit's one-frame case (the finger's line lost) — preview, aid
  and store.

**Fixed, as decided.**

1. *A later contact is handed the stroke only once it has gone `PAD_KEEPUP_PX`* (`padJudge_`): when the one that moved
   alone is the held candidate and `padTakes_` would hand it the stroke — the pen at any age, the tools within 200ms —
   the hold goes on until it has gone 30px. A settle stops short; a finger drawing after a palm goes 30px in 100ms. If
   the still one moves meanwhile, round 1's keep-up-and-half rule tells a settle from a second finger, and the still
   one's line comes back.
2. *The race starts where the still one was when the first refused contact landed* (`raceAt`, `raceFrom`, kept by
   `padAlone_` by the samples' clock); its samples before that are not a race with anything.
3. *The race is judged by the samples' clock on both sides*, not against how far the other had gone by the frame.

**And then, three times, the simpler rule (decision 4).**

*A lift hands nothing over.* The verifier's rule for 1 kept an exception — *unless a lift forces the decision* — and the
same palm marked whenever something lifted first. Measured with real touch (`probe6.js`, Q4, 390 and 820) on 1–3 as
decided: **a palm that settled 12 or 16px beside an aiming finger and lifted before the finger moved was handed the
stroke at its lift — its settle stored and the finger's line after it lost, 8 of 8 across the pen, the ruler and the
compass; a finger that tapped still beside a settling palm handed it the stroke at its own lift, the palm's settle
stored, 8 of 8** — in both passes, exactly as 2a89387 did. The special case was the fault, so it went: the 30px holds
at a lift too (`padOwed_` with no `force` way round it), and for the one left holding a stroke when the first lifts
(`padSwap_`, held — it moved on from 10px, which is how the tap handed the palm its settle). The cost is in §4: the first
strokes after a palm lands, if shorter than 30px, are lost while it stays down and still (`probe6.js` "tick": a 20px pen
tick and a 20px ruler tick, palm first — 2a89387 and 1–3 as decided stored both, 4955c7c the palm's dot for the pen;
now nothing, 4 of 4).

*The race is to 30px on both sides.* With 2 and 3 in, the still one still won at 10px when it had gone "further than the
refused one had" by then — and asked by the samples' clock, a ruler's **pin that rolled 12px in 200ms beside a second
finger starting slowly won in every run of both passes: its own line, `[[153,170,167,170]]` at 390 and
`[[153,170,166,170]]` at 820** (`probe3.js --only=pinslow`). 2a89387 stored nothing there, by luck of when its frames
ran: asked at a late frame, the accelerating finger was ahead. In jsdom the 'pause' case won too — the palm settled 9px,
the finger refused at 12 and pausing, the palm drifting 22 more: "further" than 12, so its ruler line or ring. 10px is
inside what a pin rolls and a palm settles — round 3 said so of round 2's threshold, and the race kept 10px for the
still one. So the still one wins only by going `PAD_KEEPUP_PX` before the refused one does, from `raceFrom`, by the
samples' clock: one number for every hand-over and every race, and nothing compared but the two moments each side
crossed it. The nit's comparison is gone with it — there is no "how far had the other gone" left to ask at the wrong
time. The cost, in §4: an aiming finger's ruler line or compass radius shorter than 30px, beside a palm that landed
over 200ms later and settled 10px, is lost; round 3's residual stray mark ("a palm that drifts further than a refused
finger's line under 30px") now needs a 30px slide.

*Whichever is left alone in a held stroke is handed it at 30px.* A lift handing nothing over has a second side, found
while checking the cost above: after a palm-first tick shorter than 30px it is the PALM that is left holding the stroke,
with nobody beside it, and an owner moving alone was handed it back at 10px — so the hand moving on to the next stroke,
the palm sliding 15px, drew its slide, and every finger after it was a rest beside an established stroke, its line lost
until the palm lifted (jsdom, the fix as it stood: the palm's slide stored and a 60px line after it lost; the ruler the
same, `[[320,320,305,320]]`). 2a89387 did the same after a finger's *tap*; the 30px hand-over had widened it to every
tick under 30. Once the other has lifted there is nothing left to compare the one left with, and a finger after a palm's
brush and a palm after a finger's tick move alike — so whichever is left alone is handed the stroke only at 30px, as a
later contact is: one rule for both sides of a lift (`padOwed_`: the candidate it may go to, the one it went to at a
lift, and the owner whose candidate lifted). Not an owner with its candidate still down — moving alone beside a contact
that stays still is the evidence, and round 1's P7 holds its line back within a frame at 10px. And the one it went to at
a lift stays owed when a new finger lands beside it: a palm handed a finger's tap that drifted 12px more as the next
finger landed was otherwise handed it back at 10px (jsdom). The cost, in §4: the aiming finger's short stroke after a
palm has brushed the picture is lost (jsdom: a 20px line, nothing; 40px, the line). In real touch (`probe7.js`,
written for this, Q4 at 390 and 820): a palm 400ms first, a 20px pen tick, the palm sliding 15px, with a 120px line
after it or without, and the ruler with the palm 100ms first — **the fix as it stood stored the palm's slide 6 of 6,
the line after it lost; now the line, and without it nothing, nothing shown** (2a89387: the tick, nothing at the palm;
4955c7c: the palm's slide, 6 of 6). The tap, then a finger landing as the palm drifts 12px more: the finger's line at
390 and 820 (2a89387: the palm's settle).

| | a palm settling 12/16px beside an aiming finger, then the finger draws | the palm settles and lifts first (brush) | the finger taps still beside it | a palm 400ms first, settled 8–9px, drifting 2–4 under a slow finger | a pin rolling 12px in 200ms beside a slow finger | a palm-first 20px tick | a palm-first 20px tick, the palm sliding 15px, then a finger's line |
|---|---|---|---|---|---|---|---|
| 4955c7c | the finger's line | the finger's line | the tap's dot (pen), nothing (tools) | the palm's line or ring (it owned the stroke), 14 of 14 | the pin's line or ring, 4 of 4 | the palm's dot (pen), nothing (ruler) | **the palm's slide, the line lost**, 6 of 6 |
| 2a89387 | **the palm's settle**, 16 of 16 | **the palm's settle**, 8 of 8 | **the palm's settle**, 8 of 8 | **the palm's line or ring**, 4 of 14 (7 of 14 in the first pass) | nothing (frame luck) | the tick | the tick and the line |
| 1–3 as decided | the finger's line | **the palm's settle**, 8 of 8 | **the palm's settle**, 8 of 8 | nothing | **the pin's line** (ruler, 2 of 2) | the tick | the tick and the line |
| + a lift hands nothing over | the finger's line | the finger's line | nothing | nothing | **the pin's line** (ruler, 2 of 2) | nothing | **the palm's slide, the line lost** |
| + the race to 30px | the finger's line | the finger's line | nothing | nothing | nothing | nothing | **the palm's slide, the line lost**, 6 of 6 |
| **+ whichever is left alone, at 30px (committed)** | **the finger's line**, 23 of 24 on the board and Q7 (a 16px settle, nothing — §4) | **the finger's line**, 8 of 8 | **nothing**, 8 of 8 | **nothing**, 0 of 14 | **nothing**, 0 of 4 | **nothing (the cost)** | **the line, nothing at the palm**, 6 of 6 |

The rows between are the same probes on those states of `find.js`: 1–3 as decided, `probe4`, `probe6`, `pinslow` and
`headstart` in this pass (`probe4`: the finger's line 23 of 24 — a 16px settle on the board at 390 stored nothing, §4's
cost); with the lift rule as well, the first pass's runs and `pinslow` in this one; the race to 30px, this pass's first
run of the fix, before the last rule. In the last column the rows for 1–3 as decided and for the lift rule are
check-flow's case on those files, and the rest `probe7.js`.

**What is left, written into §4:** a palm-first finger's preview shows from 30px; the first strokes after a palm lands, if
under 30px, are lost while it stays down and still (a finger's tap beside a settling palm stores nothing — §4's first
line), and so is an aiming finger's short stroke after a palm has brushed the picture; a settle over 15px beside an
aiming finger reads as moving with it on a small, slow line; an aiming tool line under 30px beside a late, settled palm
is lost; a palm that slides 30px after a refused finger's line under 30px marks. And one found and not changed: **a palm
resting first that slides 10px while a just-landed finger beside it has moved under 5px is resumed as the one drawing**
(T4's "the owner first"): a palm that settled 9px and slid 22px in 200ms under a slow-starting finger stored its ruler
line or a ring round itself at 390 and 820, 7 of 8 over two passes (`probe3.js` headstart 9+22) — as 4955c7c, 2a89387
and 1–3 as decided all did. By movement it is the aiming finger's case. The simpler rule that would catch it — nothing
held is decided under 30px, the owner too — was laid over this round's check-flow and lost the aiming ruler finger's
line beside a settled palm sliding along with it (round 3's two cases, and this round's one-frame case) and P7's
preview within a frame. Named for the next review; the size rules (increment 2) are what tell a palm.

**Checked.** check-flow's review journey ("the finger pen after review"), on the 340x170 question pad with a construction
question's tiles:

- *the must-fix*: a finger aiming, a palm landing on the picture and settling 9, 12 or 16px — the pen at 300ms and 1.5s,
  the ruler and the compass at 120ms — then the finger draws: the finger's line (the compass: its arc, every point 60px
  from where the finger went down), shown as it is drawn, nothing near the palm, and nothing on the picture while the
  palm settles;
- *a lift hands nothing over*: the same palm settling 12 or 16px and lifting before the finger moves — the finger's line;
  the finger tapping still while the palm stays — nothing, and nothing shown; every tool;
- *the cost, so it cannot grow unseen*: a palm resting first, then two 20px pen ticks — nothing — a 60px line — kept —
  and a 20px tick — kept, the palm a watched rest by then; a 20px ruler tick, the palm 100ms first — nothing;
- *the should-fix*: a palm 400ms first, settled 8–9px, drifting 2–4 more under a slow-starting ruler or compass finger —
  nothing, nothing shown; and the case that tells `raceFrom` from the palm's own down: the palm settled 9px, the finger
  refused at 12px and pausing while the palm drifts 22 more (31 from its down) — nothing; a pin that settled 8–9px as it
  was put down and rolls 3–5, or rolls 12px in 200ms beside a slow finger — nothing;
- *the race to 30px*: a finger's 20px ruler tick refused, then the palm drifting 15 or 28px — nothing (round 3 stored the
  28px line); the aiming ruler finger and settled palm, the finger at 32px by its samples before the palm slides past 30,
  all of it before one frame — the finger's line (2a89387 lost it); the same with the finger drawing 20px — nothing (the
  cost) — and 40px — its line;
- *whichever is left alone*: a palm resting first, a 20px pen tick, the palm sliding 15px, then a finger drawing 60px —
  the line, nothing at the palm, nothing shown while it slides; the same without the line, and the ruler with the palm
  100ms first — nothing; a palm brushing the picture after an aiming finger, then a 20px line — nothing (the cost) — and
  40px — its line; a palm handed a finger's tap, a new finger landing as it drifts 12px more, then drawing 60px — the
  finger's line;
- round 3's cases and guards unchanged (the 'aim' guard's comments now say "30px first", not "further").

`check/pen.js`: **'palmafter'** (new) — the pen on the board and on Q7 at 390 and 820: the aiming finger with a palm
landing 300ms or 1.5s after it and settling 9, 12 or 16px (the finger drawing 150 or 400ms after), the palm on the card,
the palm settling and lifting first, and the finger tapping beside it; never a mark at the palm, the finger's line (at
16 the line or nothing, printed), nothing at all for the tap and nothing shown, and 'retap' — the tap, then a finger
landing as the palm drifts 12px more: the finger's line. **'palmtool'** adds the ruler and the compass with the palm
120ms after the aiming finger — settling 12px; settling and lifting; the finger tapping — the palm 400ms first settled
9px and drifting 2–4 under a slow-starting finger, the 'pause' case, and 'alone' — a palm first, a 20px tick, the palm
sliding 15px: with the pen and a 120px line after it, the line; else nothing, nothing shown. **'pin'** adds the pin
settled 9 and rolling 3, settled 8 and rolling 5, and rolling 12px in 200ms, beside a slow-starting second finger.

#### Mutations, round 4

Each is the committed `find.js` with one change (the last, that state's whole `find.js`); the real files are green after
(below). check-flow with `FLOW_ONLY='the finger pen'`: the review journey red in every one; `check/pen.js` on the
sections that reach it, at 4x CPU and a load of 15–20 from other builds:

| mutant | what it puts back | check-flow (lines) | `check/pen.js` (lines) |
|---|---|---|---|
| nohold | no hold: a later contact handed the stroke at 10px, as 2a89387 | red (105) | 'palmafter', 'palmtool': red (111) |
| lifthands | the verifier's rule as written: the candidate only, and a lift decides from 10px | red (52) | red (76) |
| liftonly | only a lift's way round the 30px | red (52) | — |
| heldten | only the candidate owed: whoever is left at a lift, at 10px | red (36) | red (59) |
| aloneten | the owner whose candidate lifted, at 10px — the fix before the third rule | red (11) | 'palmtool' ('alone'): red (22) |
| latecand | the one handed a stroke at a lift owed only while alone | red (3) | 'palmafter' ('retap'): red (9) |
| owndown | the race from the still one's own down | red (6) | 'palmtool' ('pause'): red (5) |
| atframe | the still one at 10px and "further than the refused one's furthest", asked at the frame | red (11) | 'pin', 'palmtool': red (10) |
| tenrace | the still one wins at 10px from `raceFrom` | red (28) | 'pin', 'palmtool': red (20) |
| dec3race | 1–3 as decided with the lift rule | red (24) | 'pin': red (4) |

Two of those runs also failed a 'shown' check their change does not reach — heldten the board at 820 with a 16px
settle, latecand Q7 at 820 with a 9px one: the line stored, and in none of 34 and 55 frames — at a load of 17–20.
Run alone on the real files at that load, 'palmafter' passed twice (26–28) and failed the same check three times at
21–32 — 5, 1 and 3 cases, every line stored right — and so, once, did 4955c7c with this check laid over it (Q7 at 820, at
30–32), where a line is on the picture from the finger's first sample. A frame trace in the page says why: under that
load a finger's 400ms line reached the page in as little as 60–190ms with two frames in it, and in the failing cases in
one frame or none; a held stroke is decided at a frame (round 1), so a line delivered that bunched can be decided after
its last frame. At the full check's load (4–17), and in this round's probes at 1–8, every line was shown, in 1–44 frames.

#### The suite, round 4

Run on the files as committed, ports 20301–20308; the load was 4–22 for the suite and 16–32 for the runs again, other
builds on four cores most of the time.

- `check.js`, `check-const`, `check-css`, `check-doors` (233 handlers, 232 doors), `check-loading`, `check-drafts`,
  `check-scope`, `check-strings`: green.
- **check-flow in four parts, 82 + 83 + 83 + 83 = 331 journeys: all green**, at a load of 4–20.
- **`check/pen.js` in full, `--verbose`: OK in 619s** (load 4–17): every 'palmafter', 'palmtool' and 'pin' case as above,
  printed; 'samples' and 'round' as before.
- **`check/ui.js`** `--screen=tools`, `--screen=stuff`, `--screen=saved`: exit 0, nothing new.
- **`check/swipe.js`: OK**, 112 gestures. **`check/cascade.js`: OK.** **`check/cards.js`: OK.**
- **`check/press.js`** `--screen=tools`: 2 misses at 18–20 (the board's padlock; Draw on Q-1CM-transformations-of-graphs-8);
  run again alone, 2 at 16 (a Games flick chain; Draw on 1F-11c) and 3 at 21–24 (Draw on Q-1CM…, the pen on a diagram's
  Draw, Flabby Pird's touch-down) — and 4955c7c between them, OK at 16–19 and then 8 misses at 24–25 (Games, a shop mark,
  a tall card's pages). `--screen=stuff`: 3 misses at 18–20 (two Games flick chains; the same Draw); alone, 1 at 19–26 (a
  Games press mark), and 4955c7c 2 at 26 (Draw on Q-1CM… and on 1F-11c). Nothing threw and nothing was silently inert in
  any run; the kinds are round 3's load misses, on both.

**Not run as one: `npm run check`**, as in rounds 1–3: its browser members take ports outside this build's range. Every
member that touches the pen, the swipe engine or the stylesheet was run above.
