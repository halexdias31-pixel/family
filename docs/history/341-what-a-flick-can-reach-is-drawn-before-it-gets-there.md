## What a flick can reach is drawn before it gets there: one builder draws every stale column, every widget slot, both finders' whole windows and the pictures ahead in the quiet; a band in pixels keeps drawn what a slide carries; nothing is built or started inside a release; nothing drawn early is ever stale

**The owner, 11 Oct:** *"If I scrol fast left right up or down it's still clunky. I think because it only
loads things which are close to pov. Increase loading scope. Make it more massive so it's never really an
issue."*

He was right about the cause, and half wrong about what was missing. Measured that day at 4x CPU
(`Emulation.setCPUThrottlingRate`, a 2019 iPad's main thread on this machine), on a phone (390x844) and an
iPad (820x1180), signed in as a student over a heavy fixture (forty photographed posts, starred widgets on
Saved), real touch through CDP at five flicks a second, every painted frame read:

| What the eye saw | Size, before | Cause |
|---|---|---|
| **Black glass** — a built card hidden while the slide carried it across | 5–43% of a run's frames; a whole column black for 0.3–0.8s in a sideways sweep | every page was drawn by its distance from the page its column was GOING to, and in a run the target leads the drawn column by two to eight pages |
| **Loader cards** — widgets drawn only by being started, after the settle | 1–4s in front per arriving run; loaders in 19–77% of every sweep's frames | a widget slot was drawn only by `start`, and only once its column was in front and settled |
| **Late pictures** | 42 of 53 late pictures had been ASKED FOR after their card was in front (median 565ms after) | only the Feed asked ahead, and one page ahead |
| **Stutter** — each flick cost more than the 200ms between flicks | 270–415ms of main thread per flick; about half the flicks got no frame of their own (median drawn: Find 62%, Feed 37%) | stale columns drawn inside the release (34–98ms, up to 450 for an admin), widget starts behind it, a column's markup written to count its pages twice a gesture, a 551ms late pass of eight Find cards |

So "loading scope" was two things: what was BUILT ahead (columns, widgets, Find's window, pictures), and
what was DRAWN of what was already built (the band). Both are fixed, and the second costs nothing to load.

**The honest limit.** Browser rendering — style, layout, paint, commit, hit testing — is 55–70% of
long-frame time at 4x. A 2019 device still drops some frames in a run of five flicks a second. The aim was
that every frame it does draw is right, and that more flicks get a frame; the tables at the end say how
far that went.

### The decision, and what it was chosen over

Three designs were drawn up and judged (in the session's scratch, not here). **The spine is A, "eager":**
one idle builder draws, ahead of the finger, every column, every widget slot, both finders' whole windows,
and pictures well ahead in the direction of travel; widgets drawn ahead are kept out of `TOOLS_ON` and are
adopted only if nothing has changed since they were drawn. Both judges ranked it first, because its
staleness and widget model is the soundest. Grafted on: from C (the only measured design) the per-flick
cuts, the identical-markup skip for landings with the avatar made deterministic, and the trail measured in
pixels; from B the synchronous re-veil when the person changes, the full list of what a draw ahead may not
do, the swipe rules (black on the glass, sweep, built ahead) and the "whole window filled" finder. Of B's
"run mode" one rule survives: **a release never starts or paints anything that is already drawn.**

Rejected, each for a reason:

- **C's R7** (no-stop widgets started and kept in `TOOLS_ON` off the glass): it turns check/ui.js's "a
  widget off the glass started" (331) red for every widget, and through `widgetsHeld_` it would carry the
  calendar, docket and timetable across every landing drawn from old `DATA`.
- **B's start-then-stop priming:** `initTables` clears a running sprint's `ttState` from Saved's copy, and
  the word games' start and stop drive the shared `PARTY`. A start is not a draw.
- **B's `RUN` model and learned cost averages, A's per-kind cost model:** one bit per job, learned on the
  device, does the only job they did (below).
- **B's `MESSAGES` recording proxy** for the inbox landing: the identical-markup skip makes the inbox's
  re-marking cost the draw string only (about 160ms at 4x for all fifteen columns, against 1.4s).
- **An idle-callback timeout:** it forces work into a saturated thread, which is exactly when a fast run
  is happening.
- **`content-visibility`:** it moves layout into the frame a column arrives in, `columnShift_` reads
  `offsetTop`, and the size of the document is not the cost (286's "not done" stays not done for this).
- **A detached-fragment card cache:** cards outside the document miss `subAdopt_`, `adoptMarks_` and the
  face writes. **Every one of the 8,006 pages built** (082, 083) and **IntersectionObserver** (047, 331): no.

### Reach, before and after

| What | Before (cafb838) | After | Why this number |
|---|---|---|---|
| Columns current after the facts change | the one in front at once; the rest when arrived at, inside the release | the one in front at once; **every other column in the quiet**, nearest first, travel side first | 12 of 13 student columns were `STALE` after a signed-in boot; an arrival cost 34–98ms (up to 450 admin) inside the release at 4x |
| First payload | all fifteen columns emptied and drawn in one task (3.07s at 4x, admin, 390) | the column in front (and the glass on a wide window) in the landing task; the rest in the quiet | the splash waits for that task |
| Pages drawn down a column | 3 from the TARGET visible, `glassRows_` opaque | **the band**: every page whose box meets the swept glass ± one glass height, in pixels; shade by distance inside it; hidden outside | the target runs 2–8 pages ahead of the slide; short iPad cards put pages 4–8 away on the glass |
| Trail cap | — | eight glass heights behind the target | the measured lag is ≤ 8 pages; a thirty-flick run must not keep its whole history drawn |
| Columns drawn across (phone) | 1 at .92, 2 at 0, hidden past 3 — from the target | **within 3 of the swept span at .92**, the fourth drawn and transparent, hidden past it | three, not the designed two: see "found while measuring" |
| Columns drawn across (wide) | `onGlass` from the target | whole while on the glass over the swept span, or one step short of it | the same lag sideways |
| Find / Resources window | 15 elements, re-centred within 4 of an edge | **41**; slid by 6 in a release when fewer than `glassRows_()+3` are left ahead; re-centred 13 behind / 27 ahead in the quiet | lag 8 + a fifteen-flick run + three glass rows + slack; what the what-if measured |
| Find / Resources filled | ±5, the rest emptied; the far 8 in one task of up to 551ms | **the whole window**, one card per idle slice; nothing in the window emptied | flicking back never rebuilds; bounded by the window |
| Widget slots | drawn only by `start`, after arrival + 300ms + the settle | **every slot on Shop, Tools, Games and Saved drawn in the quiet** (no-stop by `start`, the rest by a declared `draw`); adopted on arrival when unchanged | 1–4s of loader in front per arriving run |
| Pictures, column in front | Feed only, k−1..k+2 | **every column, k−2..k+6** in the direction of travel, off the glass at `fetchpriority="low"`; the next two decoded in the quiet | a request must leave a second before arrival: six pages at five flicks a second |
| Pictures elsewhere | — | neighbours P−1..P+2 (their front page decoded on a wide window), every other column P−1..P+4, in the quiet | the next sideways flick, the next sweep |
| Reels | 3 first, 2 ahead, 3 more, topped up after the slide | **7 / 6 / 6**; a release appends one when fewer than six are ahead; the quiet tops up to 12 | flicks under 300ms apart starved the after-slide top-up |
| The Bible | a book fetched when its first verse card was drawn | fetched when its chip is chosen, and by the builder if still not here | cards filled ahead otherwise sat on the loader |

### What was built

**1. A flick does less** (shell.js, style.css). The column's own marker is `is-front`, not `on`: component
rules with `.on` in an ancestor compound made every toggle restyle the column's subtree (870 elements, 31ms
on the Feed at 4x, twice a sideways turn); pages keep `.on`. `pageCount` is kept per column against its
first page element and child count, so a gesture no longer writes a column's markup to count it (Settings
45ms a call at 4x). The `.page` opacity fade is gone (`--css-version` bumped): with the band a page is
drawn a glass height before it can reach the glass, so the fade had nothing left to soften, and it cost a
layer and main-thread time on every turn. What changes for the eye: a neighbour's .9/.75 shade steps at the
release instead of easing over a fifth of a second. `placeGrid`'s page loop is `placePages_`: a column
neither in front nor on the glass whose signature is unchanged is not walked, and a page writes only what
differs from what it last held. `placeOne_` places one column alone, for the builder.

**2. The band** (shell.js, `trailY_`, `trailX_`, `trailEnd_`). Each column keeps the union of the windows
its glass has been aimed at while its last slide runs, per column (`TRAIL`; the global settle cannot tell
a vertical slide of one column from a sideways slide of all of them), capped at eight glass heights behind;
a page is drawn while its box meets that union widened by one glass height, read in `placeGrid`'s existing
reading pass after the one layout `columnShift_` already pays. Only pages within twelve of the target are
read. At rest the band is the glass and a glass either side. `trailEnd_`, after the slide, puts it back.
`GLASS` and the widget starts still describe the target.

**3. One builder, and the columns** (`ahead_` in shell.js, after `afterSlide_`). It runs only when ALL of:
the first good payload's screen is up (two frames after its landing task — nothing is built before the
first drawn screen); the page is visible; no finger down; no settle or tapped slide running; the placement
caught up; `afterSlide_`'s list and the widget queue empty; 400ms since the last pointer, wheel or key;
nobody typing and no pen stroke; `window.__aheadHold` unset (the checks' way of testing the arrival floor).
**400ms, not 250:** a 291ms chess draw started 250ms after a flick lands inside the next flick of a
200–400ms cadence. One job per `requestIdleCallback` slice with **no timeout**, a 60ms timer where there is
none (iPadOS Safari, the device this is for). The job is chosen afresh from live state every slice —
nothing is queued as an object, so a job a repaint, a sign-out or a new question made obsolete cannot run —
nearest first (columns across plus pages down, half a move less in the direction last travelled), ties by
kind: paint, fill, widget, pictures, reels, centre, Bible. **One slow rule:** a job that last took over 150ms
waits for a whole second of quiet (a finder's cold paint, an admin's Settings, chess). **Nothing periodic:**
a slice is booked only when there is a job, and the builder is kicked by what makes work.
- A `STALE` column is drawn as an arrival would draw it, placed alone, its panes measured now (so a
  release later finds them seen), and the half of `startScreen_` that starts nothing run — never the
  camera, a clip, a widget's start or a poll. A paint `paint` refuses (a box being edited, a stroke) leaves
  the mark and waits for the next kick (`focusout`, pen-up). `go`'s own paint is the floor.
- The first payload no longer empties the columns: the landing draws the one in front and the glass; the
  rest keep the boot's loader — the one wait, never a blank — until the builder draws them.
- **A landing that changes nothing writes nothing.** A landing marks `'maybe'` (a `repaint()` still marks
  1); a column marked `'maybe'` whose new markup is byte-identical to what it holds, with no action
  dispatched since it was drawn, is left as it is. The bust avatar's numbered `clipPath` (`AV_CLIP`) was the
  only thing that made the same facts draw different markup: every bust now points at one `#av-clip`
  defined once in index.html, the same circle in each drawing's own units. (Rounding the svg's own box was
  tried first; check/ui.js's drawn-picture rule read that box clip cutting the circle — a box clip snaps to
  the pixel grid — and it went.) **Two clocks:** `ACT_EPOCH` counts actions and
  changes of person; `DRAW_EPOCH` counts repaints and landings. With one clock the inbox's own landing would
  always have moved it, and the skip could never be taken on the one landing it was built for.

**4. Widgets** (arcade.js, map.js). **Every widget slot is drawn before it is needed, and nothing runs for
nobody.** A widget with no `stop` is drawn by its `start`; one with a `stop` declares a `draw` that runs none
of what its start does — `initTables`, `flappyStill_` (one frame, no loop; with no box it is not drawn),
`wgPaint_` (markup, not the classroom round), `vidPaint_` (no list asked for), `feedPaint_` (the fact's card;
a fact that is a `<video>` clip stays under its loader, because a video with no source is a black box). Only
a slot nothing is using: not on the column in front (`$` resolves to that copy), running or queued nowhere,
on a column already drawn. Kept out of `TOOLS_ON`; stamped with whom and under which clocks it was drawn.
**Adopted on arrival, with no `start`,** when the same person, no action, no landing and no start of the
same widget elsewhere have happened since; otherwise started behind its drawing after the slide. **In a
release only a slot still under its loader is started.** `pure: true` (twelve widgets — the calculator, the
timer, the timetable, touch typing and eight games) says the drawing reads no facts: carried through a
paint. Every other drawing goes back under its loader **at the mark** — when the repaint or landing
happens, not when the column is next drawn — and is drawn again from the new facts. **A change of person**
re-veils every drawing that was somebody else's on every column before `repaint` returns. The whiteboard,
which `signedOut_` and `signedIn_` draw for the person arriving, stamps the slots it draws so the re-veil
does not take that board away.

**5. Find and Resources** (find.js). Forty-one pages, all filled, nothing in the window emptied (see the
table). The fill job and the centre job are worked out and run inside each finder's own binding with the
question captured, so a Resources fill cannot touch Find's state (329). A card drawn above the one in front
moves the column back by what it grew. The release's own fill (`stuffEdgeFill_`) is in the band's units —
every unfilled page to the far edge of the turn's glass plus a glass height, positions read before the
first fill, never fewer than `glassRows_()`, **at most `glassRows_() + 3` fills a release** (the glass itself
is always covered; past it is the builder's, and a release that fills a dozen cards because the builder had
no quiet moment is the stall this removes). A recycled page that a reader had scrolled has its scroll put
back before it stands for another card (`stuffBlank_`).

**6. Pictures, reels, the Bible, the camera** (posts.js). `picsAhead_` replaces `postsAhead_`; every `<img>`
the app writes says `decoding="async"` (WebKit decodes on the main thread without it); reels 7/6/6 with a
one-slide append in the release; the chosen book fetched on its chip. **The camera card at rest is the dark
viewfinder, not the loader** — off its page nothing is coming, and it was 1.0–1.2s of loader on the glass
per Feed sweep on an iPad; `camStart_` draws the loader for exactly the time between the ask and the first
frame.

### Found while measuring, and changed

- **The sideways band was two and is three.** check/reach.js read a column at opacity nought 41px onto a
  390 glass in a sweep at 4x: its style said .92, but the recalc that starts its .22s fade waited behind the
  releases' long tasks while the row's slide did not. One more column of lead is one more flick of time.
- **A column still holding the boot's markup is drawn fresh by whoever draws it** — an arrival as well as
  the builder — so 331's restart of a widget started on boot markup holds on every path.
- **A new question kicks the builder** (`paintStuff`): nothing else would have, and the builder runs
  nothing periodic.
- **A copy of a widget running in front, drawn again by the builder, came back veiled** — chess starred into
  Saved beside Games on an iPad: up to 104 frames of loader beside a running game. `widgetUp_` unveils every
  copy once, when the widget starts; the builder drew the stale column after that. It is now said again at
  every placement for the widgets the column in front is running, and such a copy is marked `LENT` — unveiled
  for a run in another copy, not drawn by itself — so an arrival starts it at once like one still under its
  loader. Measured after: games-late loader frames 104→0 and 21→0 (below).
- **A widget started after the payload is carried; one started on the boot's markup is started again**
  (`UP_PAID`). Forcing every paint of a boot-markup column fresh restarted the videos card and the wide
  window's widgets on every arrival; the slot now says whether its start saw the payload.
- **The whiteboard drawn for the person arriving went straight back under its loader**: `signedOut_` and
  `signedIn_` draw it and then repaint, and the repaint's own mark veiled it. A drawing made from the
  person's own device copy and from no fact is stamped `OWN` and kept when only the facts change.
- **A camera card turned away from mid-ask kept its loader** on the page beside the one in front, for as
  long as the prompt stayed up, and for good if the answer landed after the page was left (`camStop_(true)`
  keeps the card). Off its page the viewfinder now goes back to the dark stage (`camRest_`), at the turn
  itself rather than after the slide that carries the page across the glass.
- **A slide ends `dur` after the frame it starts in, not after the write that asked for it.** Behind a long
  task the transition starts up to a second after the transform is written; timed from the write, the trail
  ran out before the slide began, the next flick restarted the union from the last target, and reach.js read
  a hole ten pages behind the card in front on the Feed at 820 and columns at nought in a sweep. The end is
  moved to the next animation frame (`trailFrom_`), only ever later — and that was not enough: a slide re-aimed
  by another write outlasts any clock, and with debugging on, reach.js caught the Feed drawn 6,000px short of
  its target with the trail 173ms past its end. So a trail also holds while the browser says the column's
  transition is still running (`slideRunning_`, asked in the reading pass where the style is already clean),
  and `trailEnd_` waits for the same. A column rising from nought is drawn at once rather than faded in: the
  `.22s` fade started at a style pass that came after the row's slide.
- **With less movement asked for, a correction of the column was eased, and the card flashed.** style.css
  holds every transition at `.01ms !important` then, which an inline `0s` cannot beat, so `colShiftNow_`'s
  move became a transition whose first frame drew the column where it had been over a layout that had
  already moved: the card in front a whole card's height down for a frame, each time the builder drew a card
  above it (check/anims.js, the chapters' drawings, 770px). The vertical property is now taken out of the
  transition list for that one write. The corrections are also measured to the fraction of a pixel
  (`stuffTop_`): `offsetTop` is rounded, a card's height is not.
- **The release's fill floor is `glassRows_() + 3` pages, not `glassRows_()`**: on the 76-question paper at
  820 a glass height and a half reached five of the six pages BUILT AHEAD asks for during a run, when the
  builder has had no quiet moment.

### Staleness: a page drawn early is never stale

1. One definition of fresh: `paint`'s `delete STALE[id]`. The builder only shortens how long a column stays
   stale; it never decides freshness.
2. Every fact change goes through `repaint` or `landRepaint_`, which mark first; the picker reads `STALE`
   every slice, and nothing is queued that could outlive a mark.
3. The identical-markup skip: byte-identical html, drawn after the last action, a landing's `'maybe'` only
   — never a `repaint()`'s 1, never `fresh`, the boot's markup, the column in front or a finder.
4. Widgets: pure carried (proved, below); every other drawing veiled at the mark and drawn again, except one
   made from the person's own device copy (`OWN`, the whiteboard); adoption needs the same person and
   unmoved clocks; a change of person re-veils everybody else's drawing at once.
5. Finders: every job bound with `inFinder_`, its question captured, dropped when the question changes.
6. The face switch (337) rewrites every copy in place, window pages included.
7. Sign-in and sign-out are `repaint()`: marks of 1, a full paint, plus the synchronous re-veil.
8. `columnsFor_`: `TABS` is read again every slice; the admin's column is built when it appears and never
   asked about once it has gone.
9. The paint guards run before any skip and any idle paint; a refused paint stays `STALE`.
10. Pictures are attribute changes only; nothing is redrawn for them.

### The checks

- **js/check-widgets.js** now runs every draw ahead in jsdom in a sandbox — five scenarios (signed out; a
  student; another student over a payload with every list, setting and date changed; an admin; the
  fixture's tutor over the changed payload) — and fails on a fetch, an XHR, `send_` or a beacon, a media
  source or `play()`, sound or speech, the camera, any interval, a timer or frame still pending 400ms after
  the draw, or a write outside the widget's own slot (a probe measured and removed in the same tick is
  not a write: the cheat sheet's x-height). **`pure: true` holds if and only if the slot's markup is the
  same in every scenario it is drawn in, under two people and two payloads.** Three fact-readers the
  fixture cannot reach are listed in `ACCEPTED_IMPURE` with what they read (the cheat sheet tab, the facts
  tab, a typed video search). A `stop` without a `draw` fails.
- **check-flow**, eleven journeys with the builder on: it finishes and never runs under a finger (a finger
  held down for 1.5s once the builder is under way after a repaint), a settle, a booked slide or within 400ms of input; a refused
  paint stays stale and does not loop, and is drawn once the box lets go; adoption without `start`, and a
  start after a press, a carried drawing or a change of person; the widgets with a `stop` drawn and running
  nothing; the first payload drawing only the front and the glass, nothing left empty; a landing veils a
  fact-reading drawing at once and draws it again from the new facts while a pure one is the same element;
  a sign-out re-veils before `repaint` returns; the Resources fill bound to its finder; every screen's draw
  identical twice; a landing that changed nothing writing nothing, and after a press writing; the page-count
  memo following an appended reel and a paint. Two of them were strengthened when their mutation stayed green:
  the Resources journey now also asks that every page in the window is drawn once the builder is quiet (a fill
  run outside its binding is logged as a slice and writes nothing — M14), and the landing journey asks that a
  `repaint()`'s mark of 1 writes the column with nothing changed (the old repaint journey arrives at a column
  still holding the boot's markup, which is never skipped — M13). Every journey written before boots with the builder held
  (`__aheadHold`) and goes on testing the arrival floor. Changed: "every tab draws something" counts the
  one loader as drawn (a column first drawn on arrival for somebody whose data is on its way); the
  whiteboard journey's board survives the person re-veil; the chapter journey fills its window explicitly.
- **check/swipe.js**: Find's second run is fifteen flicks down a 76-question paper from eight short of the
  window's end (the subtraction sheet fits inside forty-one), with **BLACK ON THE GLASS** (a page on the
  glass drawn hidden or at nothing) and **BUILT AHEAD** (at every landing at least `glassRows_() + 3` pages
  past the one in front filled; and from rest, ten flicks down a sheet inside the window have no card drawn
  inside them by anything but the builder — added when the window put back to fifteen stayed green, the
  release fill drawing in the flicks what the builder had not); a new **sweep** with **SWEEP** (a column see-through on the glass) and
  **RELEASE** (a column drawn or a widget started inside a release — across the sweep, and in a page turn
  on Tools made the moment its arrival has queued drawn widgets that cannot be adopted); `still` waits for
  the builder; a write after the window moved is not compared with one before it; the widget-queue rules
  run with the builder held; the find-fill rule walks past the window and counts each page emptied as it is
  emptied (`stuffBlank_`), since `still` waits for the builder to fill every recycled page again.
- **check/reach.js (new, on the roster and `npm run reach`)**: the flick harness's per-frame reading at 4x
  CPU, phone and iPad — Find, the Resources boxing shelf, the Feed, the sweep, and Tools arrived at after a
  landing and the quiet — failing on any hole, empty card, loader, see-through column, or widget running
  off the glass. Outcomes, never timings. Two loaders are allowed and reported: the reels card over a clip,
  and the camera on the Feed's page in front while it is being asked for. The Tools run asks the arrival,
  not the gesture: it waits for the column, and a 240px flick across an 820 glass that a starved thread read
  too slowly is followed by one more than half the glass long. `REACH_DEBUG=1` prints, for each hole, the
  page's box, the column's trail and where the column is drawn against where it was sent.
- check/states.js walks past the window to reach an emptied card; press.js and ui.js wait for the builder.
- check-uploads waits up to 45s, not 15, for the thirteenth widget on an admin's Tools: started one per task
  behind the slide, it took 4–13s in jsdom on a shared machine, base and branch alike. check-dead keeps
  `aheadBusy_` (asked by the checks through the page, by nothing in the app); the two helpers this branch
  had left uncalled (`postsAhead_`'s alias, a `paintDirty_` nothing called) are gone, and the residual rule
  says what to do in their place: code that edits a column in place outside `paint` and outside an action
  sets that section's `DRAWN` to null.

### Measured: base against this branch, alternated

**How.** The flick harness check/reach.js is cut from (in the session's scratch), on Chromium at 4x CPU, the
heavy fixture signed in, real touch through CDP at five flicks a second, every painted frame read. Base
(cafb838) and this branch were booted from copies of each tree, alternately, on one port, so a spike in the
machine's load lands on both sides of a pair. **The machine is the caveat.** It was shared with other
builders at a load average of 12–48 all evening, and a fixed loop timed inside the page (`calib`) took
85–1180ms for the same work — a fourteenfold spread. Long-task totals, frame gaps and "drawn per flick" moved
by less than that spread and are called noise here, not wins or losses. What is not noise is a count that
goes to nought on every run and every configuration: black glass, holes, late pictures.

**What the eye sees** — medians over the pairs; base → branch. *bad%* is the share of a run's time with
anything wrong on the glass (black, empty, a loader, a late picture, a faded or growing card, a see-through
column); *black%* is black glass alone; *holes* are frames with a hidden page on the glass; *late picture* is
the longest a picture on the glass was still coming. 390 and 820 as a student, n=3 pairs; 390 as an admin,
n=2. The first branch side here is the tree before the last widget fixes; those fixes touch widgets only, and
the widget runs were measured again on the final tree (the next table).

| Run | 390 student | 820 student | 390 admin |
|---|---|---|---|
| Find, 15 flicks down and back: bad% / black% / holes | 0→0 / 15→0 / 19→0 | 4→0 / 18→0 / 11→0 | 0→0 / 20→0 / 7→0 |
| Resources, the boxing shelf | 35→0 / 23→0 / 16→0; late picture 2067→0ms | 12→0 / 15→0 / 7→0; 1500→0ms | 12→0 / 21→0 / 13→0; 1317→0ms |
| Feed, 15 down and back | 7→5 / 14→0 / 4→0 | 4→0 / 13→0 / 3→0 | 0→0 / 7→0 / 4→0 |
| Feed, flicked as the payload lands | 33→6 / 3→0 / 2→0 | 18→0 / 18→0 / 8→0 | 3→8 / 22→0 / 3→0 |
| The sweep across the row: bad% / black% / see-through columns | 40→22 / 14→0 / 12→0 | 66→25 / 22→6 / 10→1 | 37→14 / 10→0 / 14→0 |

The same direction in every single-pair configuration run alongside (1024 student and admin, 1280 and 1920 at
1x and 4x, 390 and 820 at 6x, the plain fixture at 390, and with no idle callback at all — the timer path
iPadOS takes): black glass and holes at or near nought; late pictures at nought but for 390 at 6x, where the
sweep and the boxing shelf each had one picture 1.5s late (base: 0 and 167ms) — one pair, at a sixfold
throttle, and not chased.

**Widgets, on the final tree** (n=2 pairs, 820 and 1024): a run to Games, Saved and Tools after a landing and
a rest.

| Run | 820: bad% / loader frames | 1024: bad% / loader frames |
|---|---|---|
| Games | 72→0 / 104→0 | 56→0 / 21→0 |
| Tools | 0→0 / 0→0 | 20→0 / 2→0 |
| Saved | 22→9 / 2→3 | 25→22 / 5→8 |
| The sweep | 63→9 / 132→0 | 45→4 / 88→0 |

Saved's few loaders are a starred widget that reads the facts, veiled at the landing's mark and drawn again in
the next quiet moment — the staleness rule (4) doing what it says. A run to Tools *straight* after a landing,
before any quiet (the arrival that beats the builder), still meets the floor's loaders: loader frames 2→13 at 390 and 1→3 at 820 (n=2),
bad% 18→20 and 7→21, while its black glass (18%, 5%) and holes went to nought. The widgets that read facts,
veiled at the landing's mark, wait under the one loader for their start, where base went on showing the
drawing made from the facts before the landing. That is the staleness rule's price on the one path the
builder cannot beat: a loader for a moment rather than yesterday's sessions.

**The fade veto** (two alternated pairs of this branch with the `.page` fade put back, against without, 390
and 820, n=2): with the fade, Find and the Feed showed 3–20% black glass and 1–3 frames of holes, from pages
the band had drawn fading in from nought while already on the glass; without it, nought. Long tasks within
noise either way. The fade stays out.

**Cold boots** (five alternated boots a side, 4x CPU; medians, range in brackets):

| | 390 student | 390 admin | 820 student | 820 admin |
|---|---|---|---|---|
| First screen, ms | 8599 (5931–13985) → 4624 (4232–6126) | 8403 → 5624 | 8666 → 6663 | 10179 → 6795 |
| Long tasks before it, ms | 5400 → 1499 | 5788 → 2231 | 5575 → 1915 | 7247 → 2894 |
| First input delay, ms | 240 → 167 | 269 → 355 | 191 → 190 | 203 → 173 |
| Elements at rest | 4426 → 3831 | 7662 → 4457 | 4425 → 3834 | 7661 → 4457 |

The first payload draws the front and the glass only; the rest is the builder's. First input delay is noise.
Elements at rest fall because a column nobody has reached keeps the boot's one loader until the builder
draws it — and then rise as it does.

**What it costs.** The builder's slices over a gesture's quiet: 0.2–1.4s in all. Across 330 runs a run's
longest slice was under 310ms nine times in ten. **The worst were whole-column paints**, which are one job
and cannot be split: the Feed's at 0.4–0.7s (2.3s once, an admin at 1024 under the heaviest load), Saved's at
0.3–0.5s (1.2–1.8s at 6x and on the timer path), Settings' 0.6s, a finder's cold paint 0.7s. They start only
after 400ms with no input, and once slow, after a whole second — but a flick that begins inside one waits
for it to finish. That is the price of drawing a column before anybody arrives instead of inside the release
that arrives at it (where base paid 34–450ms at the worst possible moment); it is not zero. The document's peak element count is up to twice base's on the Feed (5,239 →
10,843 at 390) — the window of forty-one, the widgets drawn ahead, six pictures ahead — and the heap within
noise (40–60MB on both sides). Frames per flick ("drawn", Find 44→38%, Feed 27→27%, sweep 43→48% at 390) did
not move beyond the noise: the stutter browser rendering causes at 4x is still there, as the honest limit at
the top said it would be.

**Mutations** — each applied to a copy, the named check run on it, red is caught:

| | Mutation | Caught by | |
|---|---|---|---|
| M1 | the band off: a page drawn by its distance from the target | swipe.js findrun: BLACK ON THE GLASS at 390 and 820 | red |
| M2 | the band's margin in pages, not glass heights | reach.js at 820 | red in one run of three: a hole on the Resources boxing shelf (green in two) |
| M3 | the sideways band off: the base rule from the target, one column at .92 | reach.js sweep at 4x: TRANSPARENT at 390 | red |
| | only the swept span taken out, three columns from the target kept | reach.js sweep; swipe.js SWEEP | green: once the fade-in went, three columns of lead from the target covered every sweep measured, so the swept-span half is not proved necessary by any check |
| M4 | the builder's gate without `SWIPE.live` | J1 | red (green while J1 put its finger down straight after the repaint, when `afterSlide_`'s booked jobs shut the builder anyway; it now waits for the builder to be under way) |
| M5 | the builder off | J1 | red |
| M6 | adoption ignoring `ACT_EPOCH` | J3 | red |
| M7 | `pure: true` on the calendar | check-widgets purity | red |
| M8 | a fact-reading drawing carried, not veiled | J6 | red |
| M9 | the videos and reels cards drawn ahead by their starts | check-widgets: a fetch from each | red |
| M10 | no synchronous re-veil at a change of person | J7 | red (green until J7 asked about the timetable as well as the notepad) |
| M11 | the first payload empties every column again | J5 | red |
| M12 | the avatar's numbered clip back | J9, J10 | red |
| M13 | the identical-markup skip taken for a repaint's mark of 1 | J10 | red (green against the old repaint journey, which never reaches the skip) |
| M14 | a Resources fill run outside its binding | J8 | red (green until J8 asked that the window is drawn, not only that slices ran) |
| M15 | `STUFF_NEAR`'s emptying put back on every turn | swipe.js BUILT AHEAD at 820 | red |
| | the same, put back only where it lived (`fillStuffPages`, now a paint's) | — | green: nothing calls it in a run, and the builder refills |
| M15b | the window back to fifteen | swipe.js BUILT AHEAD from rest | red (green until that rule existed) |
| M16 | the page-count memo kept against the first page alone | J11 | red |
| M17 | `widgetsNear_` starting drawn slots in a release | swipe.js RELEASE | red |
| M18 | the release's fill removed while the builder is held | swipe.js findrun: EMPTY ON THE GLASS, TURNED BACK, BUILT AHEAD | red |

Every real file was green again after each (the runs above are on copies).

### Not done, and why

- **`content-visibility`**, **caching `appWidth_`/`innerWidth`** (it moves forced layout without removing
  it), **a constant `filter` on panes** for `.soft`'s 6,049-object layout (unproven), **splitting the
  admin's Settings paint** (it is a slow job instead) — as the design said.
- **The fade veto** was asked for as three alternated pairs at 390 and 820; two were run (above), and both
  said the same.
- **The matrix** was cut to what a machine at a load average of 12–48 could run in an evening: three pairs
  at 390 and 820 as a student, two as an admin, one of everything else. What was run, and its spread, is in
  the tables, and the noise is called noise.
- **The page form of the band's margin** (M2, decision row 2 of the design): not taken. The rule was three
  green runs at 820 and 1024; at 820 the third run read a hole on the Resources boxing shelf, so the pixels
  stay — and the release's fill is written in the band's pixels too ("the same rule, in the same units").
- **A copy of a widget running in front is unveiled, not drawn** (`LENT`): its own markup, without the
  drawing its start would make, until the column it is on is arrived at. Half-drawn rather than a loader; it
  was so before this branch, and making it whole means a second start of one widget, which 331 forbids.
- **Three journeys flaked in the earlier full runs** at a load average near 40 and passed alone — "a round
  left for the Saved column…" (which base failed three times in three at the same load), "a session that ends
  while a child types…" and the taboo deal. The last full run, on the final tree, was green: 336 of 336.
