## Four shapes of one control, and the fourth is the ordinary one

**Reported as "i hate this. i prefer drop down list, one that allows multiselect, but doesnt
disapear after each option click."** It is the third report about one question on the booking card,
and the three before it rule out everything except the answer:

| | |
|---|---|
| a `<select>` | closes when you choose — that is what choosing MEANS to it. *"for me to multiselect i have to click on field then click on subject then click on field then click on another subject. thats long."* |
| a sheet | *"i dont like this. this is shit. no pop up menus."* |
| the page the form was on, drawing the LIST instead | *"i hate this."* |

**WHAT WAS ASKED FOR EVERY TIME IS THE THING EVERY OTHER SITE HAS**, and the only reason this app
did not have it is that the booking card has nowhere to put one.

### The arithmetic rules out the card and does not rule out an overlay

`.pane` is `overflow: hidden` and the booking card is **544px of content in a 534px pane at 320 and
605.7 in 613 at 390** — ten pixels past the fold at the narrowest phone, seven pixels of headroom at
the widest. A list that opens IN FLOW under a row pushes everything below it past that fold with no
scroll and no page to turn to: twelve subjects is about 276px at 320, and the Send tile ends up
somewhere nobody can reach. **That arithmetic is what produced the page-replacement**, and it does
not apply to a panel that is drawn OVER the card rather than inside its flow.

**WHAT DOES APPLY IS THE CLIPPING, AND `position: fixed` DOES NOT ESCAPE IT.** `overflow: hidden`
clips an absolutely positioned child as readily as an ordinary one — and `placeCells` puts a
`transform` on every column, which makes a transformed ancestor the containing block for a fixed
descendant **and goes on clipping it**. So `#drop` is a sibling of the screens in index.html, like
`#sheet`, and three numbers reach it from `js/book.js`: `left`, `top` and `max-height`.

**RIGHT EDGES TOGETHER, because the value it hangs off is right-aligned.** The answer column on that
card is **56.3 / 75.3 / 80.9px** at 320 / 390 / 768 — a drop-down four characters wide — so the panel
is `min(20rem, calc(100vw - 2rem))` and lines its right edge up with the row's, clamped to the
gutter. **Whichever side of the field has more room**, with `max-height` taken from that room rather
than a number chosen here: a list that always opened downwards would be cut off by the bottom of the
screen on the last rows of a twelve-row form, which is where the subjects row sits on a saved
booking. And `touch-action` is set from the **measured** overflow, which is `padReach_`'s rule on the
notepad — a box that keeps a gesture it cannot use is a box you cannot swipe off, and this one is
over the app.

**IT FOLLOWS THE FIELD OR IT CLOSES.** A fixed box is measured against the viewport, so it does not
travel with a column that slides away underneath it — and the booking card's section stays in the
document whichever column you are on. `placeNow_` is the one place that knows the grid has moved (a
swipe, a page turn, a resize all arrive there) and it calls `bookDropMove_`, which re-places the
panel or shuts it. **Before the drag guard**, because a finger sliding the columns is exactly when it
has to keep up.

**THE STATE IS STILL `BOOKING.picking`**, kept with the answers rather than in the DOM, so a redraw
cannot lose it. `drawBooker` rebuilds the card and then the panel, which is what makes the ✓, the
row's own summary and the running price land together.

### Which page, off `PAGE` rather than off `.page.on`

**THE FIRST VERSION CLOSED THE LIST ON EVERY TICK, and the reason is worth keeping.** `.page.on` is
written by `placeGrid`; **`paint` replaces the markup without placing it**, so the guard was reading
that class off a page the very redraw that called it had just rebuilt — absent every time. `PAGE[AT]`
is the app's own answer to "which page is in front of you" and no repaint can lose it; `logIndex_`
turns a DOM position into a page number, which is not the same thing on the Find screen.

**And it exposed something already true of every column**: after any `paint(id)` the pages carry no
`.on` and no `.far` until the next placement. Nothing is misplaced — `placeGrid` sets pages to
`position: static`, which is the default, and the column carries the transform — so what is lost for
a frame is the dimming. Written down rather than fixed here.

### The journey asks three things that pull against each other

`check/ui.js` cannot ask any of them: a select that shuts after every pick **measures perfectly**.
`check/press.js` presses each action once and asks whether anything changed, which is true of all
four shapes. So `check-flow.js` asserts, on the real booking column through the app's own handlers:
the list stays open across ticks, **nothing opens over the app**, and **the form is still on its
page** while the list is up. A check asking only the first passes on both rejected shapes; one
asking the first two passes on the page-replacement — **which is how the last version of this
journey went green over the thing that was about to be reported.**

**Proved by mutation in both directions**: a tick that clears `BOOKING.picking` names three
assertions; `bookerCard` returning the list instead of the form names *"opening the list takes the
form off its page"*. The real files pass all 38 journeys.

**AND THREE INSTRUMENTS HAD TO LEARN ABOUT `#drop`**, each for the reason they already know about
`#sheet`: `check/ui.js` measures it, so its options are inside the sweep rather than outside it;
`check/press.js` presses what is in it and hashes it into `stateOf`, or opening, ticking and closing
would all read as presses that did nothing; and `check/states.js`'s declared state reads the panel
rather than `#s-booking`, because a selector scoped to the screen finds nothing and reads as the list
being absent.

**And a screenshot caught the one thing measurement could not.** The Done button was a gold `.btn` —
the loudest object on a panel whose entire content is twelve things to press, competing with the gold
border a ticked option wears an inch above it. It is `.btn quiet`: the options are the actions and
the way out is not one. Same correction as `.reel-sound` and the Messages column's `Refresh`.
**Twenty-first time this file writes that a screenshot is the last word on something drawn** —
counted off the entries above rather than remembered, because this tally has been wrong in its own
warning twice.
