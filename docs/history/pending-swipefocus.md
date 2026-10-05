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
columns and called once leaving the feed. `--only=` and `--width=` narrow it for a mutation, and say
so.

**Every fix proved by mutation** (`--only=… --width=390`, each fails naming its rule; real files
green again). Two mutants survived the first round and the rules were rewritten until they died: the
pull-back went to 80 px, under the new bar, so `backing` was never consulted (it pulls back to 120 px
now); and the real-finger tap, above. The list: the `:has()` rule back → RELEASE COST; `camStop_` unguarded → RELEASE COST; widgets
all in one task → WIDGETS A FEW AT A TIME; `backing` off → ONE CELL; the old 56 px bar → ONE CELL;
the whole-travel lock → UNDER THE FINGER; the nowhere rule off → ONE CELL; `PRESS_SLIDING` off → NO
PRESS WHILE SLIDING; a drag zeroing every transition → OTHER AXIS KEEPS SLIDING; the old top line →
CENTRED; no `.soft` → OUT OF FOCUS; no easing → OUT OF FOCUS; no focus release → FIELD LET GO; the
reduced-motion media query gone → OUT OF FOCUS.

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
word); a blur of 2 px; a still release now needing a third of a card (56–120 px) rather than 56 px.
