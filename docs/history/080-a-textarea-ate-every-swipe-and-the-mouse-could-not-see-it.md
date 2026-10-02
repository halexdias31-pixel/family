## A textarea ate every swipe, and the mouse could not see it

**Reported as "i notice that somethimes navigating on widgets could be more stable in general. please
i dont want any hiccups".** Measured rather than guessed at, and it is one line.

**`axisFree` named `textarea` beside `select` as a control that consumes a drag for its own
reasons**, and `style.css` gave every textarea `touch-action: pan-y` from the matching list. Between
them that is a blanket refusal on **both axes for every textarea in the app** — the notepad, the
comment box, the message composer, and the answer box on every question card, which is the surface
a student's thumb is on all evening.

| measured with real touch events | swipe up | swipe left |
|---|---|---|
| the notepad, empty | **stays** | **stays** |
| the notepad, a page of text in it | scrolls the text ✓ | **stays** |
| the comment box, empty | **stays** | **stays** |

**You land on the widget and you cannot swipe off it in either direction.** The tab bar was the only
way out, which is exactly "navigating on widgets".

### Sideways can never be right, and vertically it is a question the walk already asks

**A textarea WRAPS**, so `scrollWidth` is `clientWidth` and there is no sideways scroll to protect —
naming it blocks a gesture it could never have wanted. Vertically it is right only while there is
text below the fold, and that is precisely what the walk under it asks of every other scroll
container, with the six-pixel floor whose own entry records what rounding costs. So the name came
off and the measurement decides, which is this file's sentence about `cost: 0` for the tenth time:
a blanket where a measurement belongs.

### A DIV hands the gesture back and a TEXTAREA never does

**That half is a fact about the browser and it took counting events to find.** `#docket-body` is a
DIV with `pan-y` and nothing to scroll, and a swipe up on it turns the page — correctly. `.cmt-text`
is a TEXTAREA with `pan-y` and nothing to scroll, and the page does not move. Counted at the window:
**`pointerdown 1, pointermove 1, pointercancel 1`**, with `.pane` and `#screen` both saying `none`
over it. A drag inside a text control is a SELECTION, so the browser takes it whatever the ancestors
say — an ancestor cannot fix this and only the element can.

**So it is `touch-action: none` on `textarea` rather than leaving it off the list.** `auto` loses
both axes to the selection, `pan-y` loses the vertical to a pan that usually has nothing to pan, and
`none` hands the app everything — which is what every card in this app already does. **What it costs
is written down**: you cannot drag a long answer up and down inside its own two-row box. The caret
scrolls it while you type.

**And the one textarea that is genuinely a thing you are IN is not in the stylesheet at all.**
`padReach_` sets the notepad from its own measured overflow — `pan-y` once there is text below the
fold, `none` while it fits — called where the widget is drawn and on every keystroke, which is
already where the save is booked. One writer, so there is no cascade to lose, and it uses the same
six-pixel floor `axisFree` uses because two places asking one question have to ask it the same way.

| after | swipe up | swipe left |
|---|---|---|
| the notepad, empty | page turns | column moves |
| the notepad, a page of text | scrolls the text | column moves |
| the comment box | page turns | column moves |
| **a question card's answer box** | **page turns** | **column moves** |

**A full notepad scrolled to its bottom still eats one more up-swipe**, and that is left alone: it is
what every native scroller does at its end, and `touch-action` is read once at the start of a gesture
so it cannot be expressed as "at the bottom, going up".

### The swipe pass was green over all of it, because a mouse ignores `touch-action`

**`check/press.js` has driven 30 real swipes on every run since it was written** — `page.mouse`, at
the pace a hand makes them, so the thresholds, the axis lock and the velocity are all exercised.
**None of that can see this**: `touch-action` applies to touch and to nothing else, so a box that
swallows every drag on a phone measures perfectly with a cursor. **The instrument that cannot reach
its subject reporting that the subject is fine**, one layer below where this file usually records it.

**So it dispatches real touch events too**, through CDP, and asks the narrow question the fault
shares: **a box with nothing to scroll must not keep the gesture.** Every surface that carries its
own touch behaviour — `textarea`, `.msg-body`, `#docket-body`, `.feed-text`, `.widget-squeeze` — in
the axis it cannot use. A box that CAN scroll is not asked, because keeping the drag is then what
somebody reached for. **Proved by mutation**: putting the blanket `pan-y` back names
`touch up from feed p0 textarea.cmt-text landed on page 0, wanted page 1` and exits 1; the real
files exit 0. 33 swipes, and the three new ones are the only ones that could ever have failed.
