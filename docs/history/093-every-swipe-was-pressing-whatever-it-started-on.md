## Every swipe was pressing whatever it started on

**Reported as "if i scroll down far enough then scroll back up eventually the widgets above
dissappear".** They did not disappear, and nothing was wrong with the pager.

**Measured on the Find screen: twenty-five downward drags, each starting on an answer row.** The
page never moved once. What happened instead was `facet-pick`, `facet-pick`, `facet-pick` — three
more questions answered by the scrolling itself, 5,333 results narrowed to four and then to the
funnel's first question with nothing behind it. The column had not scrolled; it had been emptied
under the thumb.

**The browser fires a `click` after a drag**, on the nearest common ancestor of where the finger
went down and where it came up. That is correct and unavoidable, `pointerup` does not cancel it,
and nothing in this app was asking it to.

**`overworld.js` ALREADY RECORDS WHY THE OBVIOUS GUARD IS NOT THERE.** `setPointerCapture` was
tried and it sent every release to the root so that no card, chip or tick ever answered — *"nothing
threw. The app rendered perfectly and simply stopped answering."* Removing it was right, and it
left the opposite case unhandled: a press that should not have counted.

**So the finger's own travel decides.** Past the same ten pixels the grid uses to tell a drag from
a wobble, the gesture is a drag and the click it produces is swallowed. **Set in `pointermove`
BEFORE the axis is chosen**, which is the half that matters: `axisFree` can refuse a gesture and
stop reading moves — a textarea scrolling, a pad being drawn on — and a drag the grid will not take
is still a drag as far as the thing under the finger is concerned. Cleared by the press it
swallows and again by the next `pointerdown`, so a gesture that ends without a click cannot eat the
tap after it.

### Forty swipes were green over it, because every one of them started on bare card

**`check/press.js` has driven real drags since it was written** and they all begin at the middle of
a pane. That is the `.mat-face` lesson one gesture along: the instrument was right about what it
asked and had never been pointed at the case that breaks. **The new rule starts the drag ON a
control** — the nearest `[data-do]` to the middle of the screen, per column — and wants two things
of it: the page turns, and nothing is answered. **Proved by mutation**: without the mark it reports
`up from stuff from [filter-clear] landed on turned 0 page(s), and answered a question` and exits 1.
