## A maze, and the one design decision in it is that it is not swiped

**Asked for as "i need to add maze game widget".** Eleven by eleven, carved by a depth-first walk
that never revisits a cell — which is what makes the result a TREE: between any two squares there is
one path and no loops, so it is always solvable and never has a shortcut somebody can stumble onto.

**UP, DOWN, LEFT AND RIGHT ARE THE FOUR GESTURES THIS APP NAVIGATES BY.** A maze that read them
would fight the pager on the one screen it lives on, and the loser would be the swipe — which is how
you reach every other widget. `touch-action` cannot arbitrate it, because the column and the card
want the same four directions. So it is a pad of four buttons, each **44px in px**, and the arrow
keys for anybody on a keyboard. This file records what a blanket `touch-action` cost on the notepad;
this is the same argument made before the fault rather than after it.

**The shortest way is counted, not invented.** A breadth-first walk from the entrance gives the
fewest moves that can solve it, so *"out in 68 — the shortest way there is"* is a fact about the
maze rather than a score made up to have one. Computed when the maze is built, so finishing costs
nothing.

**The trail is the whole playability on a card this size.** Eleven squares across 272px is about
24px each, and without a mark of where you have been a dead end looks exactly like a corridor you
have not tried. Faint, because it is a memory aid rather than part of the maze.

**A cell cannot be 44px and here that costs nothing**, which is the difference from Connect 4:
eleven of them is 484px against a 320px phone, and **nothing in the maze is tapped**. The four keys
are, and each is a real fingertip. The board note by `.c4` is about the case where the squares
themselves are the control.

**A wall stops you and says nothing.** Every other game here answers an illegal move by ignoring it;
a maze that announced *"there is a wall there"* would be saying what the screen already shows, once
per attempt, which is most of playing one.

**And its three colours are declared on the component.** A maze's walls are that maze's convention
and nothing else in this app wants them — the rule the house style states with the chess board's
cream and charcoal. `--line` is right for a hairline between rows of text and **measurably** too
faint to read as a wall at twenty-four pixels a cell.

**The opening line was removed after a screenshot.** `#maze-said` said *"Top left to bottom right."*
directly under a `.sub` saying *"Top left to bottom right. Tap the arrows, or use the arrow keys."*
— one sentence twice, which is the fault this file records where every widget printed its own name
twice. It speaks when there is something to say.

**Proved by playing it**: the maze is solved by pressing the four real buttons along a
breadth-first route, and the moves counter, the state and the sentence all agree with the number
the solver predicted — 50 on one maze, 68 on the next, so the carving really is random. Walking
into the edge moves nothing and counts nothing. 36 checks pass, `check-widgets.js` reports 8 games,
and `check/press.js` presses both of its actions.
