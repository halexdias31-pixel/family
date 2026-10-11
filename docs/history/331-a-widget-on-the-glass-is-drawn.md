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
- `pages` — down each of those columns, the pages whose card is inside the window where the placement
  leaves it (the column's shift plus the page's top and height), out to `glassRows_` either side.
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
front, because that is the one a press can reach; one whose slot a paint replaced (`STALE`, drawn on the way
in) is started again. A repaint still restarts the whole column in front at once and leaves the columns
beside it alone — their markup was not replaced.

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

### The checks

- **`check-flow`, five journeys** (277 of 277 green on the final run):
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
- **Mutations, each red on a copy of the files, the real files green after** (`js/check-flow.js` unless said):
  nothing beside the column in front queued (journey 1, eleven lines); what leaves the glass never stopped
  (journey 1); a start per copy (journey 2: "started 2 time(s)", "running 2 time(s) at once"); a running copy
  re-pointed to the nearest copy at every settle (journey 2: "stopped although its copy on Saved never left");
  `$` without the copy its widget was started on (journey 2: "drew into another copy"); no copy but the
  driven one unveiled (journey 2: "its copy on s-saved still holds the loader"); an arrival restarting what
  already runs (journey 3); an arrival starting every far widget in one task (journey 3: "5 widgets started in
  one task"); what ran in a slot a paint replaced kept running (journey 4: "never started — its box is the
  empty markup"); the queue not waiting for an unplaced column change (journey 5: "7 Tools widget(s) were
  started after Tools was left"). Two of them were green on the first version of their journey and the
  journey was what changed: journey 2 passed with `$`'s half taken out until the tree-order lookup, and
  journey 4 passed with its mutation until it asked for the flyer's controls rather than for no loader.
- **`check/ui.js` — A WIDGET ON THE GLASS NEVER STARTED.** Every widget slot anywhere on the glass, whichever
  column, more than 24px of it inside `#screen` both ways in a drawn column and page, that still holds the
  "not started" veil 3s after the screen settled. A count is printed (`widget slots on the glass asked
  whether they had started`). On the base commit it is red at 1280 on Settings ("tools #wgt-calculator
  (342x525px of it on the glass) still holds the loader…" across 34 states); with nothing beside the column
  in front queued, red at 1920 (six findings); on the final files `--screen=tools` (95 combinations; 22, 47,
  89, 66, 89 slots at the five widths) and `--screen=settings` (170 combinations; 0, 0, 68, 35, 136) report
  nothing new.
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
