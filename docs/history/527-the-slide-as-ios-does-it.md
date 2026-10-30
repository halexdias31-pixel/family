# 527 — The slide between columns, as iOS does it

**The owner:** *"apply the iOS polish when sliding from each widget to the next. I want that stable iOS polish."*

## What was already there, and kept

Pointer events with `#screen { touch-action: none }`, so the browser never fights the drag; the axis chosen once, in the
first ten pixels, at 1.4 to 1 (93, 202); the ten pixels of slop taken off what is placed, never added in one frame, so
the card is under the thumb from the first moving frame; one placement per drawn frame (`dragFast_`); a release speed
fitted to the last 80ms of the finger's own timestamps (`releaseV_`); a flick turns however short; a finger pulling
home is a change of mind; a catch at the lock for a column still settling. `afterSlide_`, `inFinder_`, `go(id)`,
`TAB_ORDER` and the layout's columns are untouched: the change is in how a release lands, not in what lands.

## What changed

1. **The settle is a critically damped spring** (`springAt_`, `springOf_`, `settleCurve_` in shell.js):
   x(t) = 1 − (1 + (ω − a)t)·e^(−ωt), ω = 0.02/ms, released at `a` = the finger's speed toward the target as a share of
   the distance — capped at ω, where more would sail past the card (so it never overshoots), and at −ω/2 the other
   way. It ends when the card is within half a pixel, so its time follows the distance and the speed: a whole step
   (335px) from rest 440ms, flicked hard 328ms, 60px 344ms; nine tenths of the way in 195ms from rest. It is written as a CSS `linear()` curve sampled from the
   spring (12–48 points), so the compositor runs it on `transform` alone and a busy page cannot stutter it — the way
   iOS runs its own springs, off the app's thread. A browser without `linear()` (iOS before 17.2) gets the old
   bezier, at the spring's time. A requestAnimationFrame loop was considered and not used: every afterSlide_ job and
   the builder (`ahead_`) run on the main thread, and a settle driven from there would stall under them.
2. **Halfway, with a coast** (overworld.js `THROW_FRACTION` 0.5, `THROW_MAX` 180, `PROJECT_MS` 100): a release turns
   the page when where it would coast to — the travel plus 100ms of its speed, iOS's "fast" deceleration — is past
   half the step (168px across a 390px phone; never more than 180px down a tall card). A slow drag under halfway
   springs back; 150px let go still moving at 0.3px/ms turns. The flick (`FLICK` 0.4px/ms) and the pull home are as
   they were. This raises the bar from 5 October's third (`THROW_FRACTION` 0.3, cap 120): that was "most of the way"
   measured against a peek of 70px; halfway is iOS's own and still refuses the peek.
3. **A finger landing on the row while it slides holds it there** (`grabRow_`, `grabTake_`, `grabLet_`). At
   touch-down every column is written where it is drawn, its rest kept in `host.REST_X`; a sideways drag takes the
   offset as its catch and is placed from the rests (`dragPlan_` reads `REST_X`), so it moves from where it was held;
   a lift, a vertical drag, a scroll or anything the grid does not take lets the spring go on from there
   (`grabLet_`, from every exit: pointerup, pointercancel, `swipeDrop_`, the tab hidden). Any placement since clears
   `REST_X`, and `grabLet_` then does nothing; a new touch while a hold's lift never came lets that hold go first, so no
   row is left frozen where a finger once was. Sideways only: the vertical keeps its catch at the lock.
4. **The rubber band is back, iOS's** (`band_`): past the first or last column, or page, the card gives
   (1 − 1/(x·0.55/d + 1))·d for a pull of x against a step of d — 80px for a 190px pull on a phone — and springs back
   at the band's slope of the finger's speed. 5 October took the old quarter-of-the-travel give out because it said
   "there is more"; the owner now asks for iOS's feel, and iOS's curve says "the end" by giving less the harder it is
   pulled.
5. **Less motion** (`motionLess_`): with `prefers-reduced-motion: reduce` every placement is instant — a release
   snaps, a tab jumps, nothing is held.

## Proof

`check/slide.js` (Playwright, 390px, touches through CDP, every frame sampled): eight landings (40px flick in 60ms,
90px both ways, 120px held, just under and just over halfway held, 150px coasting at 0.3px/ms, out-and-pulled-home),
each followed by every column within half a pixel of its place, nothing animating, and no frame past the column it
landed on; the rubber band at both ends against iOS's curve (79.7px for 79.7) and back without crossing; a touch
mid-slide holding the row still for 120ms, then going on when lifted; a catch then a drag; a second flick mid-slide
landing two columns on; vertical drags (one drifting 25px sideways) moving the row 0px; 1:1 tracking past the slop;
reduced motion settled three frames after the lift. Each part proved by a mutation that turned it red, the real
files green again: the old third-of-a-step bar (120 and 143px held turned), no band (0px given), no grab (13px on
under a still finger), no coast (150px at 0.3px/ms sprang back), reduced motion ignored (a settle booked), an
underdamped spring (105-135px past the card), an axis ratio of 0.1 (20px sideways on a vertical drag), no slop (the
row at the finger, not 10px behind). The release is placed on the next frame (`PLACE_FRAME`), so the check waits for
that frame rather than a fixed 40ms: on a machine busy with other checks the guess read the drag's curve and failed. `check-flow`'s settle journey now asks the spring: the finger's speed at the
start, never past the card, within half a pixel at its end, longer for further and shorter for faster.

## The Site card that would not move right (owner's note N-1793146418283)

"Weekly email's words" (`site:digest-words`) on Site: *"why can't I move this to the right and have it start a new
column"*. The layout model allows it: 463 stopped whole COLUMNS moving (`applyColumns_` is the sheet's `columns` tab or
`TAB_ORDER`), but a CARD moves between columns, and ▶ on the last column makes a new one (466). 508 made that work past
Site: ▶ there reads "Move to a new admin-only column" and makes `custom-N` (`admin: true`) just after Site with the card
on it (`lay-c-col`, layout.js; check-flow "layout engine (508)"). Nothing to add on the site. What the owner saw is the
backend: before 508, `layoutClean_` (core.gs) dropped the `admin` flag and every card listed under `site`, so the save
came back without the move. Deploy the current backend (Deploy → New version, all four stamps match) and ▶ works.
