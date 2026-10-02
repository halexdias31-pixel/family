## "hours of sunshine" was two pixels tall, and the rule was looking the other way

**Found on a screenshot taken to answer "will Paper 1 comprehensively work".** May 2017 Higher Q1
is a scatter graph of temperature against sunshine, and the card drew the top two pixels of its
x-axis caption. The label sits at `y = 180` inside `viewBox="0 0 340 176"`, so four units of it
were painted nowhere — and an axis caption is not decoration: a scatter graph whose axes are
unnamed is two columns of numbers.

**Six diagrams on four papers were doing it**, measured across all 68 in the library: two below
their box (the same graph on the Higher and the Foundation paper) and four above it, worst at 16
units on an AQA chemistry figure whose y-axis label was simply gone.

**THE RULE ASKED ABOUT TWO EDGES AND THERE ARE FOUR.** `check/cards.js` gained a clipped-label rule
with the practical drawings, and both faults it was written for ran off the SIDE — *"bulb level
with the side arm"* arriving as *"el with"*. So it compared `left` and `right`, and a caption
below the box was invisible to it. Same fault, other axis, which is the shape this file records
every time a rule is written from the instance that prompted it.

**And the library's own figures were outside it entirely.** That rule ran over the practical
guides' seventeen drawings and not over the 89 question cards that carry one — the figures a
student is actually looking at while they answer. Both passes share one `outside()` now, four
edges, and the run prints how many cards carry a drawing so the number cannot quietly go to zero.

**The window moves, never the drawing.** A label below the box grows the viewBox height; one above
it makes `min-y` negative and grows the height by the same amount. Every coordinate is untouched
and `.qsheet figure svg` still lays out at `min(100%, 20rem)`, so the picture is not rescaled — it
is given room it was already using. Recomputing the coordinates would be redrawing six figures to
fix a frame. **Proved by mutation**: putting one viewBox back names all four parts of Q1 at 5px.

**And it found two drawings that are not 340 wide** — `RS…-503` Q5 at 300 and Q6 at 290. The
viewBox width IS the scale, so those two render about a sixth larger than every other drawing in
the library; that is the coins fault, and it is printed rather than rewritten, because widening a
viewBox without moving its coordinates pushes the drawing into the left of its own frame. A redraw
and a judgement, not a frame fix.

### What a Paper 1 actually offers, measured through the app rather than off the data

**Asked as "i hope the maths papers they will do (which will be a paper 1) will work. and i mean
comprehensivley work."** It depends entirely on which paper, and the spread is wide enough that the
question has no single answer:

| Paper 1 | Qs | answer box | Check | drawn | pen | picture named, never drawn |
|---|---|---|---|---|---|---|
| **May 2017 Higher** `P-1MA1-1705-1H` | 31 | 31 | 22 | 15 | 1 | **0** |
| **May 2017 Foundation** `RS…-481` | 41 | 41 | 36 | 19 | 4 | 1 |
| June 2024 Higher `RS…-416` | 33 | 33 | 16 | **0** | 0 | **13** |
| June 2024 Foundation `RS…-415` | 41 | 41 | 30 | **0** | 0 | **15** |

**Ten of the thirteen transcribed maths Paper 1s have no drawings at all.** The 2017 pair are the
two that were drawn, and they are the two to teach from. This is the `figure` backlog this file
already counts — 485 questions across the library — seen from the other end: not "how many rows
are outstanding" but "can somebody sit this paper tonight".

**The pen is rarer still and for the reason already recorded**: `padSource_` needs a diagram, so a
draw-on question with no picture is an answer box. 1 of 31 on the Higher paper, 4 of 41 on the
Foundation one, 0 on everything else.
