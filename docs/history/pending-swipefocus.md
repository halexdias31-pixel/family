## Swiping held still, the card in front sits in the middle, and the rest go soft

**Asked for on 5 October as *"can you make swiping and so on more stable. like the widgets and all.
a more pleasant experience. also focused widgets should be in centre of screen. also those widgets
not in focus should actually look slightly out of focus effect."***

A lab measured it first, read-only, with real touch through CDP (every move carrying the time it was
meant to happen), 262 gestures at 390×844 and 320×568, normal speed and 4× CPU — on a machine with a
load average of 13–45, so **outcomes and element counts are trustworthy and milliseconds are not**.
It ranked nine faults. All nine were confirmed against this branch before anything changed, and the
screenshots taken to check the result found a tenth.

### What "unstable" was made of, and what changed

| | measured before | the cause | now |
|---|---|---|---|
| **the card froze at the lift, then leapt** | every page turn and column change restyled **all 4,381–5,054 elements** (53–64 ms CPU a page turn at 1×) | `.hr.on:has(+ .hr.on)` — one corner-squaring rule on the booking hour grid. A class inside `:has()` with a sibling combinator makes Chrome invalidate the whole document whenever *anything* gains or loses `on`, and `placeGrid` moves `on` at every turn | the rule is gone; the second cell's leftward bridge reaches `--r-sm` further and covers the first cell's corners. **273 elements** a page turn, **186** a column change (trace) |
| **sideways heavier than up and down** | a column change forced a layout of the whole document, 38–61 ms CPU | `camStop_()` on every column change, resetting the camera card's markup for a camera never started | only when leaving the feed, or with a stream open. Warmed up, the release's layout went from 230 ms (base, this machine) to under 1 ms |
| **"the second swipe sometimes doesn't take"** on Tools and Games | arriving started every widget in one task — ~560 ms Games, ~800 ms Tools; a second swipe 450 ms in first moved 1,425 ms after touch-down | `startScreen_` → `toolsStart_` → every `start()`, each a full layout | the page in front and one either side start at once; the rest one per task, nearest first, waiting out a finger and a settle (`widgetsWake_`). **At most 3 in one task, all 10 started** (check). A page turned to before its turn starts its widget there and then (`widgetsNear_`). A repaint still starts everything at once |
| **a sideways swipe did nothing** | 40°, 45°, 55° on a one-page column: lost **12/12**; a 45 px thumb arc: lost 3/4 | the 1.4× ratio sends a diagonal to the vertical, which on Saved, Spotlight, Messages or the Find root goes nowhere | a gesture leaning at least half as far sideways, on a vertical with no page that way and nothing under the finger to scroll, is sideways. **4/4 → next column** on Saved (lab, after) |
| **"it turned the page when I changed my mind"** | 150 px pulled back to 80 and let go moving home: **turned 8/8**; 70 px held still: **turned 8/8** | `far` never looked at the release speed; "far" was `min(56px, 18% of the step)` — 7% of a tall card | a release moving home at ≥ 0.2 px/ms does not turn; a still release needs **a third of the step, between 56 and 120 px**. A flick is unchanged. Both now **stay** (lab and check) |
| **a card jumped when you swiped again the other way** | sideways then up 40–160 ms later: the arriving column snapped 81–248 px in one frame (12/12); up then sideways: 199–614 px (9/9) | `no-anim` (`transition: none !important`) on whatever was dragged killed *both* axes' slide — there was one transform and one transition | a column's x is `transform` and its y the separate `translate` property, each with its own transition; a drag zeroes only its own axis (`colTransition_`). The other slide is **still running with 335 px / 492 px to go** after a drag frame on the other axis (check). Browsers without `translate` keep the single transform |
| **the keypad stayed up over the wrong card** | a maths box focused, card swiped away: keypad up and typing into a card off screen, **8/8** | the pad closes on `focusout`, and nothing took the focus away | a focused field whose page is no longer in front is blurred by `placeGrid` — pad and phone keyboard alike. **Closes 2/2** (lab), **let go** (check) |
| **a tap on a sliding card pressed it** | a star fired on a card mid-flight, 90 ms after the lift | nothing knew a slide was running | a press that starts on a card while the column in front is sliding is swallowed like a drag (`SLIDE_UNTIL`, `PRESS_SLIDING`), the last 60 ms excepted — and only on the cards: the first version swallowed a tap on a sheet's backdrop opened over a column still sliding in, and `check/press.js` said so. **A press on the arriving card mid-slide runs nothing; the same star pressed once it has landed runs `fav`** (check) |
| **(found by the screenshots) the card lagged the finger** | a sideways drag whose first moves arrived folded together (7 px, then 132 px) left the card **132 px behind the thumb** for the whole gesture | the axis lock took the whole travel at the moment of deciding off what is placed — ten pixels only when every move arrives | it takes the ten pixels of slop and no more (check sends exactly that shape) |
| (minor) a code jump straight to a deep page of an unvisited column shows the wrong card for a moment | 0.44–1.8 s | `placeCells`' "animation wins" against first-paint requests | **not done** — one caller (`me.js:2687`); worth doing if links straight to widgets arrive |

And one more, found when `check/press.js` went red: **`go()` to the column already in front booked
`startScreen_` too**, which stops and restarts every widget on it — a Connect 4 game in progress was
dealt a fresh board 300 ms after anything asked for the column it was on. Spreading the starts widened
that window; the answer is that it should not exist. It books only when the column changed or was
repainted.

### Centred, and what it undoes

History 131 put every column's card on one top line, because centring each on its own card left the
neighbours' top edges up to 245 px apart mid-swipe — reported then as "the edge is slid up or down".
Measured on 5 October that line left the card in front **192 px off the middle at the median at
390×844, 306 px on Saved**. `columnShift_` centres again: **every card within 0.7 px, 26 cards at each
width** (check). What comes back is the thing 131 fixed — two neighbours of different heights no
longer share a top edge, their centres do — and the cards either side are now drawn out of focus,
which is what makes that read as depth rather than as a column that slipped. A card at the cap
(803–807 px tall at 390×844) is centred too, with 18.5 px above and below and only ~2 px of its
neighbours showing; clamping it to the old line was measured and rejected because it leaves that card
15–18 px low with its bottom on the glass. **`COLUMNS OUT OF LINE` in `check/ui.js` is restated**: every
column's card centred within the same 2 px — proved by putting the top line back (8 findings, the
worst Messages 198 px off at 320). Its first honest run found the one thing centring added: a column
REDRAWN with a card of a new height (`paint('saved')` after a star, `dmPoll_`'s repaint every twenty
seconds) had nothing re-placing it, which a top line never needed. `paint` books one placement now.

**And centred is where a card arrives, not where it is put back.** The first version re-centred on
every change of the card in front's height — the `ResizeObserver` behind `holdColumn_` sees it — and
a lab run after the suite went red found what that does to the owner's *"nice more sleek, fresh
stable"*: pressing the funnel's answer shortens its card, and **the search box moved 38 px down the
screen at 390×844 and 31 px at 320×568** (base: 0). The state in `check/states.js` that guards it
measures against the pane, so a pane that moved could not fail it. Showing an answer grew its card
56 px and left the question 28 px from where the finger pressed it. So a press, a field taking focus
or a change on the card in front holds its top (`HOLD_AT`): it grows and shrinks downward, a card
that would grow past the bottom of the glass is lifted just enough, and arriving anywhere else lets
go — the next card is centred, and the funnel is centred again a page away and back. Keyed on the
page's number, because the funnel repaints the whole column on a press. **Now 0.0 px at both widths,
and back within 0.2 px of the middle** (check).

### Out of focus, at the cost the lab allowed

`.soft` on the pages that can be on the glass — up to two above and below, and the card peeking in
from the column either side — drawn as `filter: blur(2px)` **on the pane**, never on the column. The
lab measured why: a pane is not a layer, so its blur is baked into its column's tiles once and costs
nothing per frame while the cards move; a filter on `.screen`, which is a layer, is a blurred surface
redrawn every frame (2.4–2.8× the drawing, render passes doubled). Nothing two columns or three pages
away carries it.

It **follows the finger**: the card leaving blurs and the card arriving sharpens in step with how far
the drag has gone (`softDrag_` — check: 30% of the way, 0.61 px and 1.39 px), and the release finishes
the change at once (`softSettle_`). **Easing it over the settle was written first and measured out**:
Chrome cannot run a blur's animation on the compositor, so the main thread ticked two or three panes'
filters every frame of every settle, and `check/press.js`'s chained flick — a 40 px flick 20–40 ms into
the first one's settle — read its release speed as 0–0.37 px/ms and lost the page 3 times in 8 (base:
0). Switched at the release: 22 of 24 across six interleaved runs at a load average of ~30, the same
as the base commit under the same load (11 of 12). The two panes the finger moves hold
`will-change: filter` for the length of the movement only (check: no pane keeps a layer once still). A pane with a **playing video or an iframe** is dimmed instead of blurred,
since it repaints every frame; a paused reel or a canvas at rest is a still picture and is blurred
like the rest (dimming every canvas left Flabby Pird sharp beside a blurred chessboard). Asking for
**less motion or less transparency**: dimmed, never blurred, nothing eased. Never blurred: the card in
front, a card with a field being typed in, the keypad (on `<body>`), a playing video. **Scale was not
added** — "a card is a fixed size" (the note over `CARD_W`) was a refusal for a reason that still holds.

### Checks

`check/swipe.js`, on the roster (port: `SWIPE_PORT`, unset = the OS picks). Real touch at 390 and 320:
one card or back for a flick, a 40/70 px still release, a pull-back, half a card; the axis kept for a
whole gesture; folded moves; 45° and 55° on a one-page column, 25° on Tools, a vertical drift; a swipe
from a tile pressing nothing; a press mid-slide pressing nothing and the same press after landing
pressing (asked of the mechanism — a real tap on a card moving that fast slides out from under the
finger and presses nothing either way, which is how the first version of that rule could not fail);
the other axis still sliding (asked of the mechanism, in one task, because frames are noise here); a
real sideways-then-up chain; every column's card centred within 1 px; the blur at rest, mid-drag and
under reduced motion; a focused field let go; at most three widget starts in a task on arrival; a page
turn and a column change under 1,000 restyled elements; `camStop_` not called between two non-feed
columns and called once leaving the feed; a real tap on the funnel's answer moving the search box
0 px, and the funnel centred again a page away and back. `--only=` and `--width=` narrow it for a
mutation, and say so.

**Every fix proved by mutation** (`--only=… --width=390`, each fails naming its rule; real files
green again). Two mutants survived the first round and the rules were rewritten until they died: the
pull-back went to 80 px, under the new bar, so `backing` was never consulted (it pulls back to 120 px
now); and the real-finger tap, above. The list: the `:has()` rule back → RELEASE COST; `camStop_` unguarded → RELEASE COST; widgets
all in one task → WIDGETS A FEW AT A TIME; `backing` off → ONE CELL; the old 56 px bar → ONE CELL;
the whole-travel lock → UNDER THE FINGER; the nowhere rule off → ONE CELL; `PRESS_SLIDING` off → NO
PRESS WHILE SLIDING; a drag zeroing every transition → OTHER AXIS KEEPS SLIDING; the old top line →
CENTRED; no `.soft` → OUT OF FOCUS; no easing → OUT OF FOCUS; no focus release → FIELD LET GO; the
reduced-motion media query gone → OUT OF FOCUS; no hold on a press → HELD WHILE USED (38.0 px and
30.5 px); a hold never let go → HELD WHILE USED (the funnel 37.8 px off the middle a page away and
back).

`check/press.js`'s backdrop tap asked its question where the favourite colour is — and centred, that
is under the sheet's BODY, which rightly stays open when tapped. It now taps the first select on the
page in front that the backdrop covers, and a page with none fails to reach. Proved by taking
`selAt_`'s "what is in front" test out: the list behind opens (age min); the real files are green on
Settings (24 actions, 80 swipes, 6 dropdown taps).

**What the suite says under this machine's load, and why it is not this branch.** The load average
was 20–56 throughout (other worktrees' suites). These failed on the unchanged base commit as well, in
runs beside the ones on this branch: Find states that click 150 ms after entering and are measured
340–500 ms later not arriving (base: "the answer, turned to from its question", "a maths answer, the
keypad up"; this branch, a different two or three each run — every one of them arrives on this branch
in isolation, 6 of 6, at 340 ms); the chained flick on Games (base lost the 20 ms one, this branch the
400 ms one in one run and none in the next); and the camera journey in `check-flow`. `PANE OFF THE
SCREEN` on "the answer, turned to from its question" is the same clock: the page turn its click starts
is still pending its first frame when `check/ui.js` measures — sampled, it is centred and on the
screen from 500 ms on. Flabby Pird's touch-down rule waits a fixed 900 ms after arriving at Games;
under this load the bird's `start` ran at 979 ms on one run.

**The last full `npm run check` (ports exported, load 5–20): 46 of 51 pass, `check/swipe.js`
among them.** The five that do not, each run against the base commit beside it:
`check/cards.js` — A PICTURE NOT ON ITS OWN FIGURE PAGE (2374), identical on base (library data, not
layout); `check/ui.js --part=1/2` — the same 25 states not reachable on both, and PANE OFF THE
SCREEN (2) on both, different states each run, every one caught mid-slide (sampled: centred and on
the screen by 500 ms); `--part=2/2` — killed at the roster's 900 s; `check/press.js` — `c4-again`,
`oth-again`, `rg-next`, `rg-again` quiet on both, plus one state not arriving on each (base: two
Games states; this branch: the camera's photograph); `check-flow.js` — the Games journeys at the
roster's 180 s under load, **105 of 105 on both** run alone. One more was this branch's and is
fixed: `book-set` read as quiet because the harness moved the client select to its blank row, and
the base commit passed it only because the repaint left the page unplaced for longer than the 130 ms
it waits — `paint` re-placing what it drew took that difference away. It moves to a real answer now.

`check-flow`: the Games journeys read widgets thirteen pages down straight after arriving, which the
stagger delays by design — they wait for `quiet()` now (after-slide jobs and the widget queue run
dry) rather than a fixed sleep. The camera journey's `CAM_SLIDE` waits do the same; that journey
failed on the unchanged base commit under this load too.

### Not done, and named

The first visit to a column after the payload lands is a repaint by design (`STALE`), with a full
layout behind it — the cost of new data rather than of a swipe. `content-visibility: auto` on far
pages and columns would shrink every layout walk (the document holds every page of every column); it
needs care because `columnShift_` reads the `offsetTop` of pages above. #9 above.

**For the owner to confirm**: centring over the top line (history 131's trade, reversed at your
word); a card you are using growing downward rather than staying centred (so an answer shown sits a
little below the middle until you move on); a blur of 2 px; a still release now needing a third of a
card (56–120 px) rather than 56 px.

### After the review: the keypad, a flaky centring read, and widgets under a resting finger

**THE MATHS KEYPAD COVERED THE ANSWER BOX AT 320x568.** A card centred on the screen sits lower than
one hung from the old top line, and the review measured every answer box on a paper's question cards
under the pad — 8 pages of 8 on this branch, 1 of 8 on base (pad top 315px, box bottoms 317–327px).
`kpRoom_` only scrolled a scrolling ancestor, and a card whose content fits has none; the hold on
focus then kept the box where it was. Now `kpLift_` lifts the whole column by what the box is short
of, through the hold itself — `HOLD_AT.lift`, read by `columnShift_` AFTER its clamp, because this is
the one time a card is meant to go above the glass, as a phone's keyboard pushes a page — and
`kpRoomBack_` takes it off when the pad closes. Worked out from where the column is GOING (unmoved
top + held shift + the box's distance down its column), never from a rectangle read mid-slide.
`check/swipe.js` `keypad`: a real tap on each box on five question pages of one paper at both
widths; the box 12px or more clear of the pad (the margin `kpRoom_` keeps), and the card back where
it was once the pad closes. Mutations: no lift → five boxes under the pad at 320 (−2 to −12.5px);
lift never taken off → the card 14–24px high after closing. Screenshots `kp-320-*`, `kp-390-*`.
The ✓ tile under the box is behind the pad at 320 while it is up; the pad's own ✓ key is Check.

**`check/swipe.js` CENTRED WAS FLAKY, 1 run in 3, and it was the check.** Probed: the feed's camera
card grows 611 → 692px when a machine with no camera answers, about 300ms after arriving — after
everything `R.still` watched had gone quiet. One sample reads 40.7px low, the next 0.2px (the
`ResizeObserver` frame re-centres it). `R.still` now also waits for `CAM_ASKING`, for the card in
front to read the same height twice running, and for the column to be placed where `columnShift_`
says. NOT PROVED BY MUTATION, and saying so: the fault is a ~50ms window that cannot be put under a
measurement on demand — a 900ms-late camera made both the old and new waits pass, because the old
one measured before the growth. Three runs of `--only=centre` green, and the full suite.

**WIDGETS NO LONGER START UNDER A FINGER THAT HAS ONLY JUST TOUCHED.** `widgetsLater_` counted a
finger once its direction was decided, and not a tapped page turn's glide at all. `SWIPE.live` alone
and `SLIDE_UNTIL` now count, capped at 1.5s from when the column was first found busy, so a resting
thumb or a lost `pointerup` cannot leave a column of dead widgets. `check/swipe.js` `widgets` rests a
real touch on Tools as the queue fills: nothing starts before the cap, everything by 4s. Mutations:
axis-only → 5 and 1 started under the finger; no cap → 6 and 4 never started. The `SLIDE_UNTIL`
half has no mutation of its own. `.screen { will-change: transform, translate }` — the vertical
move is the separate `translate` property now.

**Not tested here, worth one look on a real phone:** text boxes on centred cards (to-do, notepad)
sit lower than they did, so a phone's own keyboard at 320x568 is more likely to cover them. The
browser shrinks the visual viewport for its keyboard and scrolls the focused field into view, which
this harness cannot reproduce.

### And the suite, run whole: three harness waits and one tile

**`check/ui.js --part=2/2` FINISHED FOR THE FIRST TIME on this branch (8 minutes, alone) and named
eleven panes off the screen and `games` up to 42px off the middle** — a different set each run.
Traced: the column's placed shift was exactly what `columnShift_` asked for, with a transition still
running. A fixed 450/500ms wait does not outlast a slide on a loaded machine. `settled()` waits for no
running animation on any column and no booked placement (bounded at 4s) before both geometry rules.
`--screen=games`: 6 findings twice without it, clean with it. Both halves green afterwards.

**`check/press.js`: `c4-again`, `oth-again`, `rg-next`, `rg-again` quiet — and THIS BRANCH'S, not
the base's** (the note above said both; run side by side with `--screen=games` the base is green).
Widgets start a few at a time now, and the queue read 300ms after arriving held New game but not the
board, so New game was pressed on an unplayed board. The queue now waits for the widget queue and the
after-slide jobs to run dry. Green after.

**Mark with AI was 120x21** (TAP TARGET, part 2/2): when Check became a tile on main, this button kept
`.qp-check` and lost the look. It is a tile now — CLAUDE.md lists it by name.

**Still red, and not this branch's:** `check/cards.js` A PICTURE NOT ON ITS OWN FIGURE PAGE — 2371 on
the base commit, 2374 here (three more library rows merged since); library data, not layout.
