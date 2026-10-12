## A widget on the glass is drawn: whichever column it is in, started within a moment, stopped when it leaves the glass, and one widget started once for its two copies

**The owner, 10 Oct**, with a screenshot of the app on a wide screen — about 1194px, Settings in front
with About you on it, and the column beside it showing two widget cards that were nothing but the gold
three-dot loader in their middle and a star tile in their corner: *"these remain loading untill i scroll
to them. i dont like this"*.

### What he was looking at

Reproduced in Chromium at 1194x827 against `check/fixture.json`, signed in as an admin, on Settings: the
column to its right is Tools (the sheet's `columns` put Settings between You and Tools), and its
calculator card was the loader and a star for as long as Settings stayed in front. At 1920x1080 it was
four cards on two columns — the calculator and the flyer maker on Tools, chess and Times Tables on Games.
With Games in front at 1194, the calculator on Tools beside it was the loader too.

**Why.** Only the column in front ever started its widgets. `startScreen_` → `toolsStart_` /
`savedStart_` started the column you arrived at (the page in front and one either side at once, the rest
one per task — `widgetsWake_`, `widgetsLater_`, the 5 Oct work on swipes), and leaving it stopped
everything: `go` called `toolsStop_()` for any column that was not one of the four, and `toolsStart_`
called it before every start. Each slot is drawn under the one loader until its widget starts (306). On a
phone, where a column beside is a 23px edge, nothing wrong could be seen; on a wide window the columns
either side are whole cards (THE GRID SHOWS MORE OF ITSELF, shell.js, 6 Oct), and every widget on them was
a loader that nothing was ever going to take off but going there.

### What was built

**`GLASS`, said by `placeGrid`, once per placement** (shell.js). The function that puts every card where it
is answers what is on the glass, in the reading pass it already does (after `columnShift_`'s layout, before
any write, so it forces no layout of its own) and never during a drag:

- `cols` — the column in front, and on a wide window every column showing **more than `WIDE_EDGE`** (24px)
  of its card. At 1194, 1280 and 1920 the column past the last whole one shows 8px of card and no widget;
  at 768 or 1700 it shows 144–146px, a third of one, and counts. On a phone the neighbour is the 6% peek
  and does not count, so a phone runs what it ran.
- `pages` — down each of those columns, the pages whose **widget slot** shows more than `WIDE_EDGE` of itself
  inside the window both ways where the placement leaves it (the column's shift, the page's top, the slot's
  offset in the page; across, as much of the card as shows less the slot's inset), out to `glassRows_`
  either side. A page with no widget is asked the same of the whole page. (It was any pixel of the page
  until the review below.)
- `at` — which column in front it was worked out for.

**No IntersectionObserver.** The reel column had one over a scroller of its own and it went for exactly this
reason — "a ratio measuring a thing the app had already decided" (the note in `goPage`).

**`widgetsGlass_` (arcade.js), after every placement that is not a drag**, beside the two sweeps in
`placeNow_` that already wait for the release:

- a widget on the glass **beside** the column in front is **queued** — the same queue a far widget of the
  column in front waits in: one start per task, never while a finger is on the glass or a slide is
  settling, ahead of anything off the glass (`widgetRank_`);
- a widget that has **left** the glass — its column swiped away, or the window narrowed — is **stopped once
  the slide has settled** (`widgetsSettle_`, booked through `afterSlide_`), and anything queued for it is
  forgotten at once. A `stop` is the widget's own code and some repaint their card: one took 41ms at 390
  with the CPU at a quarter, and from the placement it would have been the first frame of the slide. A move
  between two widget columns already stopped the old one after the slide (from `startScreen_`); now every
  stop does, and a column that comes back before then is simply not stopped;
- **the column in front is left to `startScreen_`**: all of its widgets, near at once, the rest one per
  task, as before.

`toolsStop_(keep, wait)` is the one place a stop happens now: it stops what `keep` does not keep and forgets
what `wait` does not, and with neither it is what it always was.

**`go` no longer stops anything.** Its `toolsStop_()` line is gone; the placement it asks for says what left.
So that a step of the queue cannot start a widget for a column already left in the gap between `go` and that
placement, the queue also waits while `GLASS.at !== AT`.

**Arriving leaves what already runs.** `widgetsWake_` used to stop the whole app and start the arriving
column again. Now a widget already running on the arriving column's own copy, in a slot still in the
document, is left running — the calculator that started while Settings was in front is not stopped and
started again 300ms after you reach Tools (the Connect 4 "fresh board" the note over `startScreen_`'s
booking in `go` is about). One running on another column's copy is stopped and started on the copy in
front, because that is the one a press can reach. A column that is `STALE` is still drawn again on the way
in, and the slot a widget is running in is carried into the new markup (`widgetsHeld_`, below — the first
version threw it away and started the widget again, which the review found). A repaint still restarts the
whole column in front at once, from fresh markup, and leaves the columns beside it alone.

**One widget, one start.** `TOOLS_ON` is `{ w, col, slot }`, one entry per widget, not per copy. A starred
widget is drawn on its own column and on Saved and has one set of state behind it, so with both copies on
the glass it is started once, on the copy nearest the column in front; it is not stopped while that copy is
on the glass; when that copy leaves and the other is still there it is started on the other. Any other copy
on the glass has its loader taken off when it starts (and by `widgetsGlass_` if one comes onto the glass
while the widget runs) and shows its own markup, drawn, until its column comes in front. A copy off the
glass keeps its veil, so on a phone a swipe towards Saved shows what it always showed.

**`$` finds the copy a widget was started on** (data.js). `$` already answered "the copy on the screen in
front". A widget started beside the column in front has no copy there, and the first copy in the document —
Tools' — can be off the glass while Saved's is on it, so its `start` drew into Tools and every tick after it
did too. `WIDGET_HOME` is the column each widget's slot was started on, written by `widgetUp_` and taken
back by `widgetDown_`, asked only when the screen in front has no copy and the element is inside a slot.

**A card beside the one in front is re-centred when it grows.** A widget draws in its `start` and its card
grows; nothing re-placed a column that was not in front, so it sat off the line every card is centred on
(COLUMNS OUT OF LINE in `check/ui.js`). A start from the queue on a column beside the one in front books one
instant placement, coalesced like every other.

**Three smaller things found on the way.**
- `widgetDistance_` measured a starred widget's slot as `$('wgt-…')` — Tools' copy — against Saved's pages;
  it reads the slot on the column it is asked about now (`slotOn_`).
- `slotOn_` finds a slot by its id scoped to the column (`#id`, which a browser answers from its own map of
  ids). The first version walked every `.widget-slot` under the column — the whole Games column, Scrabble's
  225 squares, chess's 64 — for each widget, twice per comparison of the queue's sort; each queued widget's
  rank is now asked once per step.
- `TOOLS_BUSY_SINCE`, when the queue first found a finger down, was only cleared by a step that found
  nothing busy: a queue emptied mid-swipe kept the old moment, and the next queue's first busy step was
  already past the 1.5s cap and started its widget under the finger. `toolsStop_` clears it when it empties
  the queue.

### The review of 331, and what it found

Three findings, each reproduced in Chromium before it was touched, each fixed at its cause, each with a check
that was red before and is green after.

**1. A widget drawn beside the column in front went back to the loader on its first arrival, and lost what
was typed into it.** Every signed-in load lands twice — the payload, then the inbox about two seconds later —
and the second `repaint` marks every column but the one in front `STALE`. Tools beside Settings kept its
markup (a column is drawn again when it is next arrived at), with the calculator running in it. The first
arrival at Tools drew it again: the slot the calculator ran in was thrown away, the new one was drawn under
the loader, and 240–690ms later the calculator was started again from nothing. Reproduced at 1194x827 as
the review had it — admin, Settings, `7+5` typed, a real flick left: the slot replaced 8ms after the
release, the loader for 350ms, the display `0` after (the screenshot: the calculator in
front is the three dots). Once Tools had been visited the same flick kept it, which is why the first
version's journey passed.
- **`paint` carries the slot a widget is running in** (`widgetsHeld_` before the new markup, `widgetsBack_`
  after, arcade.js): each running slot of that column is put where the new markup drew that widget's slot.
  The card, its star and every other widget are the new markup; the widget is the one that was running, as
  it was. The arrival finds it running in a slot in the document and leaves it. A widget the new markup no
  longer draws has nowhere to go and is stopped like any widget whose slot has gone.
- **Not for `repaint`'s own column** (`paint(AT, true)`): a repaint is the facts changing under the column
  you are on, it has always started that column again at once from fresh markup, and `landRepaint_`'s and
  `reconnectKeep_`'s rules are written about exactly that. Carried there too, the notepad journey of 313
  went red ("the notepad was left and the column was never drawn with the payload") — its box survived the
  redraw it is there to see.
- **Not across a change of person** (`who` on every `TOOLS_ON` entry, `widgetWho_()`): what a slot holds can
  be a person's. And a widget beside the column in front started for somebody else is now stopped once the
  slide settles and started again if its column still draws it — a sign-out on Settings at 1194 had left the
  admin's flyer maker and the calculator started for the admin running on Tools beside it, in markup the
  sign-out left `STALE`, until somebody went there.
- **A copy on the glass is unveiled for a running widget only if that widget is being kept.** On the first
  payload, which empties every column before drawing it, the new flyer maker's slot was unveiled at once
  because the old one — running in markup the landing had thrown away — still counted, and it sat there as
  markup nobody had started until the slide settled. It keeps its veil until it is started now.
- **The lost "7" was not this.** The review also clicked the calculator's 7 beside Settings with a real mouse
  and the 7 never arrived. A press on a card beside the one in front brings it to the front and goes no
  further — on purpose (`wideHit_`'s note in shell.js: "arriving first and pressing second is the carousel
  every reader already knows"). What was wrong was the slot: veiled 60ms after that click. It is not now.

After, the same flick three times at 1194 and once at 1920: slot kept, no veiled frame, `7+5` still on the
display. The reviewer's reveal probe, Tools to Games at 1194: chess and
Times Tables, which had flashed for about 200ms, are never veiled. A column newly on the glass (Games, coming
in as Settings slides out) still shows the loader over widgets that have never started until its slide has
settled and the queue reaches them — 449ms in that run — which is the queue doing what point 3 asks of it.

**2. A widget whose slot was off the window was started because a pixel of its page was on it.**
`glassNow_` lit a page if `top < H && top + offsetHeight > 0`. At 1194 on Settings the flyer maker's page
began at y=752 and its slot at y=840, below the 827px window — nothing of it on the glass but its star — and
it was running. `glassShows_` now asks the slot: more than `WIDE_EDGE` (24px) of it inside the window both
ways, its place in the page read from offsets (`glassOffset_`: up the offset chain to the page, or to the
page's offset parent less the page's own offset, less any scroll between), in the same read pass, so it
forces no layout. 24px is the line `check/ui.js` draws, so what is started is what that check counts. A box
with no height has not been laid out (jsdom) and is counted where it sits, as before. After, at 1194: the
calculator lit and running, the flyer maker not; at 1920: the calculator, the flyer maker (114px of its slot
showing), chess and Times Tables lit and running, Flabby Pird (slot at y=1218) not.

**3. Nothing measured the other direction.** `veiledOnGlass` in `check/ui.js` asked whether a slot on the glass
was still veiled; starting too much passed it, and the jsdom journeys have no layout. It now also reads
`TOOLS_ON` and reports **A WIDGET OFF THE GLASS STARTED**: every entry whose column is not the one in front
whose slot shows 24px or less of itself on the glass either way, or is in no column at all, asked over the
same 3s, with a count printed (`widgets running beside the column in front asked whether their slot was on
the glass`). On the branch before this fix it was red at 1280 on Settings: "tools #wgt-flyers (342x0px of its
slot on the glass)" across 33 states. With the review's mutation M8 (every page lit), red with five widgets.

#### Smoothness, after the review's fixes

The reviewer's swipe probe — real touch through CDP, the CPU at a quarter, the admin's fixture with four
widgets starred, from Settings across Tools, Games and Saved and back twice, 700ms between swipes, 12 swipes a
run — on the branch as committed (`c8d8ddc`, "before") and with these fixes ("after"), alternated, load
average 9–12 on the shared four cores:

| | before | after |
|---|---|---|
| 1194x827, worst delay of a touch reaching the page | 260, 569, 395ms | 188, 426, 363ms |
| 1194x827, worst long task under a finger | 62, 514, 108ms | 136, 333, 336ms |
| 390x844, worst delay of a touch reaching the page | 634, 395ms | 382, 145ms |
| 390x844, worst long task under a finger | 619, 372ms | 297, 78ms |
| widget starts begun under a finger | none in any run | none in any run |

The two overlap; the worst long task under a finger is `go`'s own arrival — `paint` and `paintPager` of the
column arrived at (85–617ms at a quarter CPU) — in both. Carrying a slot is a filter of a short list and a
`replaceWith` per running widget of that column.

### What the loader still means (306)

A widget waiting for its own data keeps the loader over that part of itself — the Videos card's list, the
calendar's month and the flyer's rooms before the payload, a score board. What went is the loader standing
in for a widget that simply had not been started. **A payload wait beside you ends when the payload lands**:
the first payload empties every column and draws it again (`load`'s landing), the reconcile sees the old
slots gone, stops what ran in them and queues the new ones on the glass, and they start with the payload in.
After the first payload `awaiting_()` has no wait left to draw. A `widgetsAgain_` that queued every waiting
widget beside the column in front for a restart on every repaint was written for this and taken out: no wait
in the app reached it, and its journey stayed green with it deleted.

### Smoothness, measured

**The worst stall under a swipe**, `check/swipe.js`'s way of swiping (real touch through CDP, every move
carrying its planned time) with the CPU at a quarter, the admin's fixture, eight swipes from Settings across
Tools, Games and Saved and back, each 450ms after the last settled — the case the queue was written for. A
scratch harness, both trees in turn on four cores shared with other worktrees at a load average of 16–38, so
the spread is the machine's. Each cell is one run of eight swipes; the branch's are the final code:

| | base commit 6758e2f | this branch |
|---|---|---|
| 1194x827, worst delay of a touch reaching the page | 720, 698, 447, 355ms | 827, 604, 359ms |
| 1194x827, worst long task under a finger | 250, 144, 138, 377ms | 612, 278, 329, 183ms |
| 390x844, worst delay of a touch reaching the page | 824, 387, 289, 116ms | 1183, 338, 475ms |
| 390x844, worst long task under a finger | 332, 198, 237, 138ms | 456, 388, 133ms |
| widget starts begun under a finger or a settle, per run | 0 0 2 1 · 0 0 5 0 · 0 1 0 1 | 0 0 0 · 0 0 0 0 |
| worst widget start a touch landed on | 160, 144, 193, 27, 94, 141, 77, 23ms | 236, 208, 5, 64, 19, 88ms |

The two columns overlap everywhere; the long tasks under a finger are `placeGrid`'s own (52–283ms per call
at a quarter CPU, 337–729ms over a run) and the widgets' starts, in both trees. **The new code's own cost,
timed in the same runs:** `widgetsGlass_` 6–33ms over a whole run of eight swipes (18–25 calls; one run 155ms,
140 of it a single call the loaded machine took), `glassNow_` 1–12ms (two runs 58 and 74ms, each with one
call of 50ms that sat inside a `placeGrid` call of 52ms — the machine, or a layout I could not reproduce),
`widgetRank_` 8–38ms (98ms before each rank was asked once per step). No widget start began under a finger
or a settle in seven runs of the final code; an earlier version of the branch, before the stops moved after
the slide, had 2, 3, 0, 2 and 0, 0, 2, 0. A start one per task still means a touch can land on one already
running — the queue's design since 5 October.

**check/press.js's chained flick on Games** (a second short flick 20–400ms after the first) missed a page
in 5 of 7 runs on the branch and 0 of 3 on the base. Repeated in isolation with the same flicks — 16 chains a
round, with press.js's own left swipes across the widget columns before them — it was 2 of 32 on the branch
and 4 of 32 on the base; without them 12 of 48 each; and instrumented, **no widget start and no call of the
new code longer than 3ms fell inside any missed chain's window** — the misses are the touches arriving late
(up to 150ms) on a loaded machine. Recorded as seen, not as understood.

### Looked at

Chromium at 1194x827 on Settings, signed in as the admin — before: the Tools column beside it is the
calculator's card with the three dots in its middle and a star; after: the calculator, drawn, beside About
you, with nothing scrolled or swiped. 1920x1080 on Settings — before: four cards of dots on Tools and Games;
after: the calculator, the flyer maker, chess and Times Tables, drawn. 1194 with Games in front — before:
the calculator on Tools beside it under the dots; after: drawn. 390x844 on Settings and on Tools: the same
before and after — the column in front, its widgets drawn; nothing beside it started.

After the review, the owner's path at 1194x827, admin, opened on Settings: on the base commit the Tools card
beside About you is the dots and a star; on the branch as first committed and now, the calculator, drawn,
and the card below it (the flyer maker, whose slot is under the window's edge) only its star — now because
it is not started rather than started out of sight. Then `7+5` and a flick to Tools, 150ms after the
release: on the branch as first committed the calculator in front is the three dots; now it is the
calculator reading `7+5`, with chess coming in beside it under the loader until the slide settles, and
drawn 2.6s later. 390x844 on Settings: the same in all three trees.

### The checks

- **`check-flow`, seven journeys** (279 of 279 green on the final run; the last two and the "never bare"
  half of the fourth are the review's):
  - *a wide window starts the widgets on the glass beside the column in front, and stops them when they
    leave it* — jsdom made a 1194x827 window (`innerWidth`, `matchMedia` answering from it, a resize event to
    narrow it) with the sheet's column order: arriving at Settings starts every Tools card on the glass —
    veil and loader off, running on Tools — and nothing off it; narrowed to 390, they stop (the calculator's
    `stop` called); widened, they start again; with You in front (Tools two away, an 8px edge) they stop.
  - *a starred widget on Tools and Saved is one widget: started once, and never stopped while a copy of it
    is on the glass* — Games in front, Tools and Saved beside: one start, one entry, no loader on either
    copy, the display drawn on the copy it runs on; Tools in front, no second start (unless Tools was drawn
    again on the way in, then exactly one); Spotlight in front, one stop and one start, drawn on Saved's
    copy; back to Games, nothing stopped or started. jsdom's `getElementById` answers a duplicated id by
    insertion order, not tree order, so the calculator's ids are found in tree order here, as a browser does.
  - *arriving at a column on a wide window leaves what already runs on it, and starts the rest one per task*.
  - *a widget beside the column in front that waits for the payload is drawn when it lands, without going
    there* — an admin, the payload held, You in front with Tools beside: the flyer maker starts and shows its
    loader for the rooms; the payload lands, Tools is drawn again, and the new flyer maker is started (its
    controls drawn), not left veiled or unveiled-and-empty.
  - *a column left before its placement has happened starts nothing more of its widgets* — a phone, Tools'
    far widgets queued, `requestAnimationFrame` held, Settings in front: nothing more starts; once placed,
    nothing of Tools is running or queued.
  - *the payload journey above, never bare on the way* — after every change to Tools between the landing and
    the flyer maker being drawn, no flyer slot is without its veil while nothing runs in it.
  - *a repaint and then an arrival keep the widget running beside the column in front: the same slot, never
    the loader, the sum still in it* — 1194, Settings, `7+5` typed into the calculator beside it,
    `repaint()` (Tools left `STALE`), go to Tools: the column is drawn again (its star is a new element and
    Tools is no longer stale), the calculator's slot is the same element, never veiled at any change to the
    column, still reads `7+5`, and was not started again.
  - *a sign-out stops what its column no longer draws beside the column in front, and nothing runs on for
    the last person* — the admin on Settings with the calculator and the flyer maker running beside it; signed
    out with nobody moving, the flyer maker stops and the calculator is started again for nobody; signed in,
    then out and straight to Tools before anything beside was restarted, the new Tools markup does not hold
    the slot started for the admin, and the calculator in front is started for nobody.
- **Mutations, each red on a copy of the files, the real files green after** (`js/check-flow.js` unless said):
  nothing beside the column in front queued (journey 1, eleven lines); what leaves the glass never stopped
  (journey 1); a start per copy (journey 2: "started 2 time(s)", "running 2 time(s) at once"); a running copy
  re-pointed to the nearest copy at every settle (journey 2: "stopped although its copy on Saved never left");
  `$` without the copy its widget was started on (journey 2: "drew into another copy"); no copy but the
  driven one unveiled (journey 2: "its copy on s-saved still holds the loader"); an arrival restarting what
  already runs (journey 3); an arrival starting every far widget in one task (journey 3: "5 widgets started in
  one task"); what ran in a slot a paint replaced kept running (journey 4: "never started — its box is the
  empty markup"); the queue not waiting for an unplaced column change (journey 5: "7 Tools widget(s) were
  started after Tools was left"). The review's: no carry through `paint` (journey 6: slot replaced, veiled
  once, "reads 0", started 1 time more); `repaint` carrying its own column (the notepad journey: "never
  drawn with the payload"); no `who` in the reconcile's keep (journey 7: the flyer maker went on running, the
  calculator "still the one started for P001"); no `who` in the carry (journey 7: "holds the calculator slot
  that was started for the admin", "nothing started it again for nobody"); unveiling for a widget running
  but not kept (journey 4: "shown without its veil and with nothing running in it, 2 time(s)"); every page
  lit in `glassNow_` (`check/ui.js` at 1280: A WIDGET OFF THE GLASS STARTED, five). A check written for a
  "column no longer draws it" rule beside the `who` one stayed green with it deleted — `who` covered every
  case a journey could reach — and the rule went. Two of the first ones were green on the first version of
  their journey and the journey was what changed: journey 2 passed with `$`'s half taken out until the
  tree-order lookup, and journey 4 passed with its mutation until it asked for the flyer's controls rather
  than for no loader.
- **`check/ui.js` — A WIDGET ON THE GLASS NEVER STARTED.** Every widget slot anywhere on the glass, whichever
  column, more than 24px of it inside `#screen` both ways in a drawn column and page, that still holds the
  "not started" veil 3s after the screen settled. A count is printed (`widget slots on the glass asked
  whether they had started`). On the base commit it is red at 1280 on Settings ("tools #wgt-calculator
  (342x525px of it on the glass) still holds the loader…" across 34 states); with nothing beside the column
  in front queued, red at 1920 (six findings); on the final files `--screen=tools` (95 combinations; 22, 47,
  89, 66, 89 slots at the five widths) and `--screen=settings` (170 combinations; 0, 0, 68, 35, 136) report
  nothing new.
- **`check/ui.js` — A WIDGET OFF THE GLASS STARTED** (the review's third finding, above): every widget running
  beside the column in front whose slot shows 24px or less of itself on the glass, or is in no column. Red on
  the branch as first committed at 1280 on Settings (the flyer maker, 33 states), red with every page lit
  (five widgets); on the final files `--screen=tools` asked 0, 0, 38, 26, 38 running widgets at the five
  widths and `--screen=settings` 0, 0, 68, 35, 136, and both report nothing new.
- **`check-flow`'s notepad journey (313) waits for the notepad to start before typing.** It wrote its words
  with `.value` at a fixed 600ms after arriving, and the notepad's `start` writes the account's notes back;
  when the start landed after the words it put back "". Once in ten on the base commit (306 recorded it),
  four in nine here, the arrival's start falling anywhere in a two-second window — and `quiet()` says yes
  while the after-slide jobs still run from the list `afterSlide_` has already emptied, so `woken_` was no
  guard. It now waits for the notepad's veil to come off, which is the moment a person could type into it:
  8 of 8 green after.
- **The rest, on the final files:** `check.js`, `check-const`, `check-loading`, `check-doors` green;
  `check-dead` and `check-scope` print exactly what they print on the base commit. `check/swipe.js` — the
  full run was killed twice by the memory cgroup's OOM killer, on the base commit as well (`dmesg`: "Memory
  cgroup out of memory: Killed process … (chrome)"), so it was run in three parts that together are every
  rule (13 + 46 + 53 = 112 gestures and measurements): all green. An earlier full run on this branch, before
  the stops moved after the slide, finished with two REACH findings in the 1280 wide-press rule, which then
  passed alone twice. `check/press.js --screen=games`: see the chained flick above; nothing threw and
  nothing was silently inert in any run. `check/cascade.js`: "nothing is decided by file order alone" (the
  first attempt ran past the ten minutes this session gave it and was cut off before it reported).
- **And again after the review's fixes:** `check.js`, `check-const`, `check-loading`, `check-doors` green;
  `check-flow` 279 of 279; `check/ui.js --screen=tools` and `--screen=settings` nothing new; `check/swipe.js`
  whole this time (112 gestures and measurements, 255s, all green); `check/press.js --screen=games` 100
  presses and 94 swipes, every one landed, nothing threw or was silently inert; `check/cascade.js` nothing
  decided by file order alone.

**Changed by [341](341-what-a-flick-can-reach-is-drawn-before-it-gets-there.md)** — every widget slot is now drawn in the quiet before it is needed and kept out of `TOOLS_ON`; on arrival it is adopted without a `start` when nothing has moved since (person, actions, landings, a start of it elsewhere), otherwise started behind its drawing after the slide. A `pure` drawing is carried through a paint; every other drawing goes back under its loader at the mark, and a change of person re-veils everybody else's drawings before `repaint` returns. "A widget off the glass started" still counts `TOOLS_ON`.
