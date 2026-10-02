## The thing you pressed stayed dark for an eighth of a second

**Reported as "make the button pressing feel more responsive on the finder."** Measured before
anything was changed, at 8x CPU — an ordinary phone — answering one of the funnel's questions:

| | |
|---|---|
| finger down → the press state painted | 19–42 ms |
| **finger up → the screen having changed** | **130–138 ms** |
| the whole of it, contact to answer | 270–308 ms |

**`:active` ENDS AT THE LIFT.** So a tap is a brief flash, then an eighth of a second of a screen
identical to the one you were just looking at, and only then the answer. That gap is the complaint:
nothing on the phone says the tap landed, and the reasonable conclusion is that it missed.

**AND ON THE OWNER'S PHONE THERE MAY BE NO FLASH AT ALL, which is the half nothing here can test.**
`:active` on touch is a browser heuristic rather than a rule — it is withheld until the gesture is
known not to be a scroll, and Safari has historically wanted a touch listener on the ELEMENT. Every
listener this app has is on the window. So the one piece of feedback a press had was the piece that
depends on the one platform this environment cannot reach.

**A class depends on none of it.** `pressMark_` in shell.js puts `.is-pressed` on the nearest
`[data-do]` at `pointerdown` — before any browser is deciding what the gesture is — and takes it
off **two frames** after the handler ran, which is one frame after the repaint it is covering for
has painted. Measured through a `MutationObserver` in the page rather than from the harness, which
got it wrong first: a round trip out to node is longer than two frames, so the class read as gone
the instant the finger lifted. In the page: **lit at 0 ms, and never unlit — the repaint replaces
the row carrying it at 168 ms.**

**IT IS NOT A SECOND PRESS STATE.** `.is-pressed` is added to the ten `:active` selectors that
already exist rather than given rules of its own. Two descriptions of one look is the `.reel .over`
fault, and these two would sit on the same element a tenth of a second apart — which is the version
somebody notices. **A control with no `:active` rule is unchanged**, deliberately: the mark is on
every control in the app and the stylesheet decides which of them show it, exactly as `:active`
does.

**The drag is the clear that is not optional.** A swipe that begins on an answer must not leave that
answer lit for the length of the gesture — it reads as the row being held down while the column
slides under it. Cleared at the one line that already decides a press has become a drag, beside
`PRESS_MOVED`, so the two cannot disagree about when a tap stopped being a tap. Measured: lit at
0px of travel, dark at 112px, and no answer added. A 1200 ms timeout sits behind all of it, because
a mark that is never cleared is a control that looks permanently pressed and the cost of one wrong
clear is nothing.

### `check/press.js` asks whether it lit up, and the finder had to learn to hit-test

**NOTHING HERE COULD SEE EITHER HALF OF THIS.** The press pass reaches a control with
`dispatchEvent`, which fires no `pointerdown` at all and says so in its header — *"by the DISPATCH
rather than by hit-testing, because whether a box can be hit is `check/ui.js`'s question"*. And
`check/ui.js` measures whether a control can be read and hit, where **a control with no press state
measures perfectly.**

**TWO QUESTIONS, BECAUSE THE TWO FAILURES ARE OPPOSITE**: a mark that never goes ON is the app
silently back to feeling dead, and one that never comes OFF is a control that looks permanently
pressed. Plus the drag, which runs first, so anything still lit afterwards is a mark the drag failed
to clear. **Proved by mutation in both directions**: the `pressMark_` call removed names three
columns *"nothing lit"*; the clear removed names two *"1 still lit after"*; the real files report
*"53 swipes, every one landed where it should"*.

**THE FIRST RUN REPORTED FIVE COLUMNS DEAD AND EVERY ONE WAS THE HARNESS.** The drag above turns the
page — that is the whole thing it asserts — and the press was using the coordinate taken BEFORE it,
so it landed on card the control had slid away from. The spot is found again after the drag.

**AND THE SECOND RUN REPORTED TWO, WHICH WAS A REAL FAULT IN THE FINDER.** `Tools` and `Games` both
chose the star tile at the foot of a widget card: a rect in the middle of the screen whose own
centre answers `elementsFromPoint` with the bare `.screen`, because it is **clipped below its pane's
fold**. A rect is a layout position and a pane clips. That never mattered while every press here was
dispatched; the moment one became a real pointer, the finder had to answer the other question too —
so it checks `document.elementFromPoint` at the centre and skips anything that is not there.

**IT MAKES THE DRAG TEST HONEST AS WELL, which is the part worth having.** A drag from a point where
the control is not begins on bare card — the exact case that test exists to stop being the only one
measured — and it would have gone on passing while proving nothing. 59 swipes became 53, and the six
that went are the ones that were never touching a control.

**The repaint itself was profiled and deliberately left alone.** Of the 130 ms: `stuffQuestion` 33,
`fillStuffPages` 8, `stuffWindow_` 3, `filterChips` 2.7, and about 74 ms of the browser's own style,
layout and paint. Splitting it — chips and the next question now, the results a frame later — would
put the first visible change at 66 ms, and it is not done: `paintStuff(keepPage)` is also called by
a star and by a dropdown on the booking form, where you are standing ON a result page, and a
deferred second half would show the old card for a frame. **The gap was the problem and the mark is
what fills it**; halving a number nobody can see any more is not worth a conditional repaint.
