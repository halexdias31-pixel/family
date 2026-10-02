## Scrabble, and the dictionary that is deliberately not here

**ASKED FOR AS "add scrable to games tool. 2/3/4 player".** 15×15, a hundred tiles asserted at 100
and 187 points, seven on a rack, the standard premium layout built from one 8×8 quadrant and
mirrored — measured against the printed board: **8 triple words, 17 double words (sixteen and the
star), 12 triple letters, 24 double letters.**

**THERE IS NO WORD LIST AND THAT IS A DECISION.** A usable English one is about 280,000 entries and
two and a half megabytes — the size of the whole question library, for one game widget, on a site
this file has spent two rounds making open faster on a phone. And it is not what the game needs: in
real Scrabble a word **stands unless somebody challenges it**, and with two to four people round one
phone the challenge is the person opposite. Same argument Herd Mentality already makes about
scoring: the part that is people arguing is the part an app should leave to them.

**WHAT IS CHECKED IS THE GEOMETRY**, which is the part people get wrong by accident: the first word
through the centre, everything in one line, no gaps (counting tiles already down, because a word may
bridge one), and after the first move at least one new tile touching what is there. Each refusal
says WHICH rule was broken, because a refusal that does not is one you learn nothing from.

**THE RACK IS SECRET, SO THE PHONE IS HANDED OVER.** Between turns the board stays up and the rack is
replaced by "hand the phone to <name>" and one tap. Without it the next player reads the previous
one's tiles on the way past, which cannot happen with a real rack and is the one part of this game a
single screen genuinely changes.

**AND IT IS NOT REBUILT ON EVERY PAINT, WHICH IS THE OPPOSITE OF THE MAZE.** `initMaze` deals a new
maze each open and its note says why. A Scrabble game is forty minutes and four people, and
`repaint` runs whenever a payload lands or anything saves — so `initScrabble` redraws whatever is in
progress. `New game` is the only thing that throws one away.

### Three faults the lab and a screenshot found, and one the code found first

| | |
|---|---|
| **one tile played twice** | a placed tile stays on the rack until the turn is committed — deliberately, because taking it back has to put it somewhere — so selecting the same slot again put a second copy on the board and the commit spliced one index for two squares. Asked of the BOARD (`from` on each placed square) rather than a second list |
| **625 tap targets under 44px** | fifteen 44px cells need 660px, wider than any phone; at 320px they are 13px. In `ACCEPTED_TAP` with the arithmetic, the same argument `.c4` and `.oth` record for their 40px and 35px cells — and what makes it liveable is that a wrong tap costs nothing, because a tile comes straight back off |
| **the blank's alphabet was 220px** | 26 keys at 44px is five rows at 320px, which took the rack and all four actions past the pane's fold. One select instead — the shape this app uses everywhere somebody picks from a closed list, answering on `change` like `book-note` |
| **the card was 17px past the fold** | a five-line subtitle explaining the hand-over, which the card says for itself at the moment it happens; and a standalone `New game` button, which now sits in the action row while a game is running and gives way to the 2/3/4 row once it is over |

### And the lab found four more, every one a control that was on the page before it could work

**`check/press.js` NAMED SIX AT ONCE**: `scr-cell`, `scr-play`, `scr-recall`, `scr-swap`, `scr-pass`
and `scr-again`, all *"on games"*, all quiet. Every one was correct: they were pressed in the state
the widget OPENS in, which is the three buttons saying 2, 3 or 4 players — and with no game to act
on, five of them returned on their first line and 225 board squares did nothing at all.

**A HIDDEN CONTROL IS STILL A CONTROL TO ANYTHING THAT PRESSES THE PAGE.** The action row was static
markup with `hidden` on its container, which is the same thing to look at and not the same thing to
press. It is built by `scrabblePaint` now and is empty until there is a turn to take. The board is
drawn either way — an empty board under the player-count buttons says what you are about to play on
— but with no game its squares are `<i>` rather than `<button>`, which is what the maze's cells
already are and for the same reason: it is a picture until it is a control.

**AND BUILDING IT FROM A LIST TOOK THE DOORS FROM 137 TO 132.** `check-doors.js` follows
`data-do="x"` with a string in it and cannot follow a variable, so a row mapped out of an array
reported all five handlers as unreachable — **a red with nothing behind it, which is the one thing
every list in this file exists to prevent.** Written out as five literals. CLAUDE.md already records
the same correction on `banner()`, which is why the fault was recognisable rather than puzzling.

**`check/cascade.js` NAMED NINE LONGHANDS ON ONE SQUARE.** `.scr-sq.mid` — the star — against
`.scr-sq.has`, same specificity, settled by which is written later. A tile covering the star is
right and it was right by accident; `.scr-sq.mid:not(.has)` says it instead. Ninth conviction of
`.price.faint` and the first one caught before a screenshot rather than after.

**A BACKTICK INSIDE AN HTML COMMENT INSIDE A TEMPLATE LITERAL ENDED THE LITERAL.** `js/map.js` builds
every widget's markup in a template string, so `` `check/ui.js` `` in a `<!-- -->` there is a syntax
error — reported as `Unexpected identifier 'check'` and `WIDGETS is not defined`, four files away
from the comment. The house style's backticks stop at the edge of a template literal.
