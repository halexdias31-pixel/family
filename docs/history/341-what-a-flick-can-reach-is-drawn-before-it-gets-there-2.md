# 341-what-a-flick-can-reach-is-drawn-before-it-gets-there (part 2 of 2)

Continues [part 1](341-what-a-flick-can-reach-is-drawn-before-it-gets-there.md).

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
  while a child types…" and the taboo deal. (This line said the last full run on the final tree was 336 of 336;
  the review found it contradicted the paragraph above and the builder's own report — the whole flow had not been
  run again after Reach 10 and 11. What was run after review is under "After review".)

### After review

Three reviewers read this branch at 9118807 against cafb838 — one asking whether it feels right, one what it
costs and whether anything drawn early goes stale, one whether the checks would notice it breaking — on the
same shared machine (load average 22–55 on four cores; their in-page calibration loop ran 92–1,967ms for the
same work). They reported only outcomes that repeated and probes that are deterministic, and so does this. Every
finding below was reproduced on 9118807 first, and each fix has a check that is red there — or red on a copy of
this tree with the fix taken out, where 9118807 already passed it — and green on the real files.

**What they found, and what was done** (`9118807` → this tree; the check that holds it):

| Finding | Seen on 9118807 | Fix | Held by |
|---|---|---|---|
| **Reels dealt twice.** The identical-markup skip kept a reel column the builder had appended to; the reel draw had already counted from nought, so the next top-up dealt reels 7–12 again — six repeats per landing, without end, and from page 13 the clip started was a slide six pages off the glass | reels `0..12,7..12` after one landing; 3 slides and no repeat on base | an append says the column has left its drawing: `reelMore_` and `reelAhead_` set `DRAWN` to null — the residual rule written over the skip, which had said nothing edited a column in place | check-flow "a landing never deals a reel twice" |
| **An inbox asked for nobody.** The Messages draw asks the backend (`dmSync_`), and the builder drew it after every repaint and landing | 3 repaints, 3 `messages` POSTs; cafb838 none | drawn ahead it asks nothing (`dmAsk_`, posts.js): the inbox the payload fetched is its first answer; `DM_LAST` is left, so the first arrival asks as before | "nothing drawn ahead asks the network" — also: no slice may ask anything (the Bible's job apart, an admin's) |
| **A sign-out missed the next person's missing widgets.** The person re-veil walked `widgetsOn_(col)`, the NEW person's list — signed out, Saved's stars and an admin's tools are on nobody's list | 14 of an admin's slots drawn after `signedOut_()`; 8–15s at 4x until redrawn | it walks every slot on the column (`widgetsReveilAll_`, arcade.js) | "signing out puts away every drawing … including the ones the next person has no slot for" |
| **`pure` proved by nobody.** No person in check-widgets had a week, so the timetable — which draws its person's week AND the sessions booked here — passed as pure | — | the timetable is not `pure`; check-widgets' second student has a week of her own. Giving her one found a draw ahead that runs something: a week from before the colours existed was saved (a POST 900ms later) from the builder's draw. Drawn ahead (`AHEAD.running`, which the sandbox now holds for the draw as `aheadSlice_` does), it saves nothing | check-widgets (purity, network) |
| **Six marks that never kicked.** A star, a spotlight, the Bible's index, a child's account, a claim answered, a session opened from a receipt marked `STALE` themselves; the builder runs nothing periodic | a star by keyboard: 13 columns stale 43s later, every wait for quiet timed out | one call, `markStale_` (shell.js), which kicks. No re-veil: none of the six changes a fact a widget's drawing reads (a star is the tile beside a card, outside its slot) | "a column marked stale by a press with no finger lifted … is drawn in the quiet" |
| **The boot's loader beside the landing.** The first payload draws the front and the glass and leaves the rest to the builder, whose quiet a moving hand never gives; a sideways landing in the first seconds showed columns still on the boot's loader (Reels as dots, Find as "Search…" over dots at 1280; 2–11s per run, base none) | reach.js BOOT LOADER at 390 (the peek) and 820, landing 1 | `go` draws, before it places anything, every column the landing will show that still holds the boot's markup: on a wide window those within `GLASS.reach` (the same sum `glassNow_` uses, worked out per window), on a phone the one either side (`bootGlass_`). Only the boot's markup: a column that is merely stale shows what it showed before and is the builder's. Paid in the first seconds only, once per column — what base paid for every column before the splash lifted | check-flow "a sideways landing in the first seconds …" (phone and wide); reach.js `bootglass` (BOOT LOADER), held |
| **Empty shells above Find on an iPad.** A repaint draws Find in front from nothing and filled three cards; the release fill goes only the way of the turn; stubs of 29–46px put three empty card shells on a tall glass for 1–2.5s | reach.js `findland` at 820: EMPTY in 94 of 385 frames (Find and Resources beside it); 390 clean | a window drawn afresh where it can be seen — in front, or beside it on a wide window — is filled in the same task as far as the band shows, both ways, before it is placed (`stuffBandFill_`, find.js): on the repaint's and an arrival's draw, a new question in front, and the builder's paint of a finder on the glass. Up to six a side on an iPad against base's ten; a phone rarely past the three | jsdom "a window drawn afresh in front is filled … both ways"; reach.js `findland` (EMPTY) at 390 and 820 |
| **A landing redrew the column in front, and an arrival after one wrote its column.** The skip was "never the column in front" | reach.js `feedland`: PICTURE GONE in 2 and 3 frames (a picture on the card in front not drawn during a landing that changed nothing) | the skip is taken by `go`'s arrival paint, and by a landing's own paint of the column in front (`o.land` from `repaint`) for a column with no widgets and no window — Feed, Booking, Reels, Messages, You, Settings, Spotlight, Progress, the business records. A column of widgets in front is still drawn and restarted, 331's rule; `'kept'` means nothing that runs in it is started again | "a landing that changes nothing keeps the column in front …"; reach.js `feedland` |
| **The first thirty seconds clunkier than base.** `AHEAD.input` started at 0, so the first slices needed no quiet; `AHEAD_SLOW` started empty, so every heavy first draw ran after 400ms; and the finder's draw queued its own fill as a microtask that ran outside the slice and its timing (2.7s of one idle callback against 1.6s logged) | median first-touch delay 55→170ms at 390 (review) | the quiet starts when the builder opens; a column's first draw from a payload (`PRE_PAYLOAD`) is slow until timed — a second of quiet; the slow bit is kept on the device (`familyAheadSlow`, column paints and widget draws only); a finder drawn ahead is filled by the builder — in the same slice when it is on the glass, one card per slice when not — never by a microtask after it | "the first slices after the screen is up …", "a finder drawn for nobody is filled inside the builder's slices" |
| **Widget loaders in reach of the builder.** A slot was as far as its column plus its pages, so Games' slots eight pages down came after whole paints three and four columns away — and the band draws those pages as a slide carries them | Games pages 8–10 on the glass as loaders, target 4 | a slot is as far as its column; its page only orders it within the column (`/16`) | "a column's widget slots are drawn before any column further out is painted" |
| **Mechanisms no check could see.** The skip's own comparison; the gates (input, typing, settle and tapped slide, hidden page); the picture reach; reels 7/6/6; the Bible prefetch; the window's re-centring; "every tab draws something" loosened for every tab | each removable with the whole suite green | a journey or rule for each (below). The Bible chip's own prefetch could not be told from the first verse card's — the page in front is filled in the chip's task and its first card asks first — so it was taken out rather than tested; the builder's `bible` job stays, for Resources drawn for nobody with its question in front, and is tested | "a landing that brings a fact draws it", "the builder waits for the hand", reach.js NOT ASKED AHEAD, "the reels are kept six ahead …", "a chosen book of the Bible is fetched by the builder …", "the quiet puts a finder's window where a run needs it", "every tab draws something" (a loader counts only on Messages, while its ask is out) |
| **This note contradicted itself** (334 of 336 at line 289, 336 of 336 at line 422) and left out the cold load | — | corrected where they stand; the cold load is below | — |

**Decisions, and what they were chosen over.**

- **The reels: null the drawing, not exclude the column.** Excluding `reel` from the skip would have been one word;
  nulling the drawing on an append keeps the skip for a reel column nobody topped up (a landing straight after a
  draw), and it is the rule the skip already stated for anything edited in place.
- **Messages: no ask at all when drawn ahead**, not "ask only the first time". The first ask is the payload's inbox,
  which lands with a `landRepaint_` of its own that marks this column — so the builder draws it again from the
  answer. A signed-in person whose inbox failed sees the loader until they arrive, as on base, where the arrival
  asks.
- **The column in front: arrival always, a landing only without widgets or a window.** A landing in front over a
  column of widgets is "the facts changing under the column you are on" (331) — a running calendar must be drawn
  from them, and restarting only the fact-reading ones is a second widget model. Finders have their own window.
- **The boot's loader: drawn on the landing, not ranked first in the builder.** The builder needs a quiet a moving
  hand never gives; the landing is the one moment the columns it shows are known. Bounded: the boot's markup only,
  so it is paid once per column in the first seconds and never again.
- **The finder: the band both ways at a fresh window, not five either side.** Five either side is base's number
  and fills four cards a phone cannot see; the band is the same rule the release fill and the placement already
  use, in the same units.
- **Not done:** a shorter quiet for jobs under 50ms (the feel review's suggestion). The settle already shuts the
  builder for the 260–420ms after a release, so a shorter quiet would only move the first slice a few frames
  earlier, and a second learned bit is the cost model this design refused. And splitting a finder's cold paint
  into its shell and its fills is now what happens for a finder off the glass — the paint draws the shell, and
  the fills are the builder's one card per slice.

**The checks added** (all in this round): fifteen new check-flow journeys and one changed — the reels landed on three times; no slice
asks the network; the sign-out over every slot; the keyboard star; the boot's loader on a phone and a wide window;
the column in front kept and an arrival kept (a press, and a column of widgets, still written); a fact that lands
is drawn; the band fill both ways; the builder's gates (a key every 100ms, a focused box, a tapped slide, a settle,
a hidden page — and that it finishes after each); the first slices' quiet, the cold first draws and the kept slow
bit; a finder off the glass filled only inside slices; the reels six ahead in a turn and twelve after the quiet; the
window re-centred thirteen or fourteen behind; widget slots drawn before further columns; the Bible job; and "every
tab draws something" counting a loader only on Messages, and asking it again once its ask has answered. In
check/reach.js: three runs — `findland` (Find repainted and turned, then landed on and turned back), `feedland` (the
Feed landed on three times at rest; PICTURE GONE), `bootglass` (a fresh load, the builder held, four sideways
landings; BOOT LOADER) — and NOT ASKED AHEAD at rest after the Feed and Boxing runs' setup. check-widgets: a
person with a week, and the draw made inside a slice.

**Mutations** — each on a copy of this tree, the named check run on it; every real file green after:

| | Taken out | Red |
|---|---|---|
| R1 | the reels' `DRAWN = null` | "never deals a reel twice" |
| R2 | `dmAsk_` (the draw asks again) | "nothing drawn ahead asks the network" |
| R3 | the walk over every slot (the new person's list again) | "including the ones the next person has no slot for" |
| R4 | `markStale_`'s kick | "a star from the keyboard" |
| R5 | `bootGlass_` | "a sideways landing in the first seconds" (and reach.js BOOT LOADER, as on 9118807) |
| R6 | the skip for the column in front (`id !== AT` back) | "keeps the column in front" |
| R7 | the skip's markup comparison | "a landing that brings a fact draws it" |
| R8 | `stuffBandFill_` | "a window drawn afresh in front is filled … both ways" (and reach.js EMPTY at 820, as on 9118807) |
| R9a–d | the 400ms quiet; the typing gate; the hidden gate; the settle and tapped-slide gates | "the builder waits for the hand", each |
| R10a–d | the quiet from the opening; the cold first draw; reading the kept bit; writing it back | "the first slices after the screen is up", each (a: green until it asked the first slice's quiet itself — `afterSlide_`'s own jobs had delayed the first slice past 400ms anyway) |
| R11 | the finder's microtask fill when drawn ahead | "a finder drawn for nobody is filled inside the builder's slices" |
| R12 | reels 3/2/3, the append and the top-up | "the reels are kept six ahead …" |
| R13 | the `centre` job | "the quiet puts a finder's window where a run needs it" |
| R14 | the `bible` job | "a chosen book of the Bible is fetched by the builder" |
| R15 | Progress drawn as the loader alone | "every tab draws something" |
| R16a, b | the timetable `pure` again; its save drawn ahead | check-widgets purity; check-widgets "runs something" |
| R17 | `picsAhead_` and the `pics` job | reach.js NOT ASKED AHEAD, Feed and Boxing at 390 and 820 |
| R18 | the widget rank by pages again | "a column's widget slots are drawn before any column further out" |

**Measured after review** — (this tree against 9118807 unless said; alternated pairs on the shared machine at a load average of 4–20,
the in-page calibration loop 110–520ms at 4x — a near-fivefold spread, so long-task totals, frame gaps and "drawn
per flick" are noise here, and only counts that go to nought, and the deterministic probes, are findings):

| Measured | 9118807 | This tree |
|---|---|---|
| The reviewers' probes, one run a side: `go` four right with a hand moving, the glass 1.5s later, 1280 / 1920 | Reels, Find (and Resources at 1920) on the boot's loader | nothing on the boot's markup |
| Find at 820: repaint, one turn, the glass 1s and 2.5s later | three empty shells above the card in front at 1s | none at either |
| A landing, then the Feed arrived at 300ms later with a hand moving (390, 4x, three runs) | written inside the release 3 of 3; 0 of 96 pictures kept; `go` 106–172ms | nothing written; 96 of 96 kept; `go` 8–19ms |
| Three landings with the Feed in front at page 5 (390, 4x) | the card in front replaced each time, its two pictures undecoded right after; 147–253ms each | the same element, both pictures decoded throughout; 22–48ms each |
| check/reach.js's new runs, 390 and 820 at 4x | BOOT LOADER at both (landing 1); EMPTY in 94 of 385 frames at 820; PICTURE GONE in 2 and 3 frames | nothing, 16 runs |
| Boot gestures, 2x CPU (the feel review's lane), loader on the glass, ms, two pairs: 1280 boot-h / boot-mix / boot-pause | 2717, 3033 / 3433, 3950 / 4433, 3367 | 117, 1617 / 200, 267 / 1283, 467 |
| the same against cafb838 (two pairs) | cafb838: 283, 183 / 0, 883 / 3516, 350 | 217, 283 / 150, 0 / 400, 1067 |
| 820 boot-h / boot-pause against cafb838 | cafb838: 6700, 5250 / 2583, 1600 (and 0.8–1.6s of see-through columns in boot-h) | 3100, 3383 / 567, 517 |
| Reading-pace flicks down Find after a repaint (pause-v), empty-card frames, 820 student / 1024 admin | 18, 10 / 8, 15 | 0, 0 / 0, 0 |
| The Feed flicked through a `load()` and a landing (land-feed), late picture on the card in front, 820 / 1024 admin | 2483, 867ms / 0, 2233ms | 0, 0 / 0, 0 |
| The flick harness at 4x (390, 820, student, two pairs): Find, the Boxing shelf, Tools and Games after a landing | holes, black glass, empty cards, see-through columns: 0 | 0 |
| — the Feed through a landing, bad% | 5, 4 | 2, 0 |
| — the sweep, loader frames | 28 (390), 31 (820) | 11, 34 |
| Elements at rest after a landing that changed nothing (390 student / admin) | +84 each landing (6,045→6,129; 9,546→9,630) — the reels dealt twice | +0 (6,045; 9,549) |

The iPadOS path (no `requestIdleCallback`, the builder on its 60ms timer), 820 at 4x, one run: Find, the Boxing
shelf, the Feed through a landing and Tools after one — no hole, empty card, loader or late picture; the sweep as
below.

The sweep's loaders, on both trees, are widget slots the builder had not reached: the sweep is the first gesture
after the boot. At rest nothing is veiled, and a walk across the whole row at 820 left nothing veiled either.

**The builder's work** after a repaint, at rest with no hand, 4x (one run a side, noise): quiet after 5.2–8.5s on
9118807 and 5.8–9.3s here; 29–34 slices, 1.2–2.7s of them in all; after a landing that changed nothing, quiet after
3.3–4.5s, 0.5–1.1s of slices, on both. The longest slices are single column paints: Shop, Saved, Booking and Reels at
0.31–0.43s here (Saved at 0.40–0.76s on 9118807), and Find's draw from nothing. That is how long the loaders the feel review found on widget
columns "within the builder's window" last, now that a column's slots come before the next column out.

**The first thirty seconds** (the cost review's harness: a real touch flick on the Feed every 0.9–1.7s from the first
screen, two trees booted together; touch delay p50 / p95 / max, ms):

| | 9118807 (3 pairs) | this tree | cafb838 (2 pairs) | this tree |
|---|---|---|---|---|
| 390 student | 83 / 584 / 1,324 | 72 / 382 / 544 | 29 / 94 / 185 | 72 / 316 / 460 |
| 390 admin | 67 / 970 / 1,960 | 115 / 554 / 778 | 33 / 146 / 362 | 75 / 405 / 460 |
| 820 student | 87 / 710 / 1,721 | 69 / 353 / 413 | 28 / 93 / 288 | 63 / 248 / 424 |
| longest task after the first screen | 976–2,034 | 375–620 | 382–1,187 | 401–827 |
| first screen | | | 7.1–10.5s | 4.2–6.5s |

Against the reviewed tree the worst of it is a third of what the review found and no touch waits a second. **Against
cafb838 it is still worse, and T12 is not met**: the median touch waits about 40ms more and the p95 150–260ms more.
That is the work cafb838 did before its first screen — which came 3–6s later — done after it, in 48–52 slices of
2.5–3.6s in all at 4x; and a touch that lands inside one of the long ones (Find's draw from nothing, 0.45–0.8s here;
Shop; an admin's Settings) waits for it. Not hidden by tuning: a slow job's quiet raised past this harness's cadence
would make the numbers here go away and put Find's cold draw inside the release of the arrival that beats it, which
is the stall this note exists to remove. The fix that would reach it is a cheaper first draw of a finder (its funnel
over the whole library is computed then), which is a change to the funnel, not to reach.

**The checks on this tree:** run after the last code change, at a load average of 2–20:

- the fast checks, 53 of 54 — check-dead reports, and its output is byte for byte 9118807's;
- check-flow, 351 journeys in four parts, 350 green; the one red, "a round left for the Saved column … pauses like
  any other leave", passed alone twice on this tree and twice on 9118807 — the load flake the builder recorded on
  base too;
- check-widgets; swipe.js (114 gestures); reach.js (16 runs at 390 and 820, 4x); anims.js; cards; diagrams; deploy;
  videos; share; the funnel; ui.js in its three parts ("nothing NEW to report" in each); cascade.js whole, in 882s;
- press.js: 332 presses, 109 swipes and 14 dropdowns right, and one press read as changing nothing — `rg-next` on
  Games, a round game's Got it, which a `--screen=games` run straight after passed (102 presses, 104 swipes); the
  same run on 9118807 at the same moment missed three chained flicks and a Draw tap, which is the load;
- every mutation above red, and the real files green after (the mutants were copies; nothing was changed back).
