## The Games column: Alibi deleted, Herd into Word games, the maze mended, Connect 4 drops, a Contest card

Five lines from the owner's notes list, all on the Games column, built in one pass.

### "delete alibi game."

**Deleted outright, not switched off.** This reverses the owner's own request from 1 October (231),
and the house rule is the one `c4Reply_` states: a dormant game behind a flag is a second mode
nothing presses.

What went:
- the `alibi` widget in `map.js`;
- the engine in `games.js`: `albPaint`, `alb-start`, `alb-next`, the `alb` slot in `PARTY` and the
  `alb` row in `PARTY_GAMES`;
- its four decks: 121 crimes, 24 times, 46 places and 122 questions;
- the `.alb-*` rules in `style.css`;
- its journey in `check-flow.js` and its two lab states in `check/states.js`;
- its entries in `check-widgets.js`'s `OWN_ONLY` and `SIZED`. Leaving them would have printed
  `COULD NOT READ ALB_...` and failed.

`OWN_ONLY` stays as an empty list. Its rule is still right for the next deck that is dealt but not
guessed. `an alibi` is still an Articulate card, because that one is a word to describe.

**Checked.** The journey `alibi is gone from the Games column, its handlers and its round state`
asks four things: no `alibi` in the roster, no `alb-start`/`alb-next` handler, no `alb` slot in
`PARTY`, and no `#alb-card` drawn on the column. With the widget, a handler and the `PARTY` slot put
back, it failed on all four. With them removed again, it passed.

A star on the old `alibi` id stops matching anything, so `savedWidgets_` simply stops drawing it.

### "heard mentality is a word game so should go there."

**Herd Mentality is the eighth game in the Word games dropdown.** Its own card on the column is
gone. The merge on 2 October (238) left it out on the builder's reasoning: Herd is a question
everybody answers at once, not a word to get across. That was the builder's call, not the owner's,
and the owner's line overrides it.

**The engine is unchanged.** `initHerd` and `herd-next` work exactly as before. The `herd` row of
`WORD_GAMES` carries the old card's body inside `<div id="herd-card" class="herd-card">`, and both
names on that wrapper are needed:
- `id="herd-card"`, because every game in the list draws into a `<k>-card` and `check-flow.js` asks
  for one per option in the dropdown;
- `class="herd-card"`, because `.herd-card .herd-q` is the rule that sets the question large enough
  to read across a table.

`initHerd` is now in `check-widgets.js`'s `ACCEPTED_ENGINE`, beside `initRound` and `initImposter`.
Without that entry the orphan-engine check fails, because no widget's `start` names it any more.

**Checked.** The word-games journey now expects eight games and names `herd` among the ids that
must no longer be widgets. It also chooses Herd and asks three things: a question is dealt inside
`#wg-slot .herd-card`, and `Next question` deals a different one. Two mutations proved it:
- dropping the `herd-card` class failed with "drew without the .herd-card wrapper";
- renaming the row's key failed with "Herd Mentality is not in the dropdown".

Screenshots at 320 and 390 show the question at its large size, 15.5px and 17px. The sentence sits
tight under the dropdown, but Taboo and the other six do the same (`.card .sub`'s negative top
margin), so Herd matches them.

A star on the old `herd` id stops matching, as it did for the seven moved before it.

### "maz game is glitched."

**The cause was a class name collision.** The word search added on 1 October gave its grid the bare
class `.ws`, which sets `display: grid`, a top margin and a max width. The maze already used `ws` as
its south-wall class. So every maze square with a south wall was laid out as a small grid of its own.
Measured at 390: 71 of 121 squares were 16.6px tall in 24.7px rows. The result was doubled walls,
walls that did not meet, gaps in the outer edge and a squashed gold square. Nothing threw and nothing
overflowed.

**The walls are now `mz-n`, `mz-e`, `mz-s` and `mz-w`.** The fix is the prefix, not a rename of the
word search: a two-letter class with no prefix is a name any later component can take without
knowing. After the change, all 121 squares are 19.77px at 320 and 24.7px at 390, and the
screenshots show a clean maze.

**Two smaller faults the audit measured are fixed in the same pass.**
- **The arrow keys.** The maze listened on `document` whenever `#maze-grid` existed, and it exists
  whenever the Games column is drawn as a neighbour. Two arrows on Find walked a hidden maze. On the
  maze page itself, ArrowDown walked the maze and the pager's `window` listener also turned the
  column. Now `mzInFront_` asks `dropOnFront_` (book.js), the app's one copy of "on the screen you
  are on, on the page in front of you", of every copy of the grid. While a maze is being walked in
  front of you, the arrows are the maze's, and `stopPropagation` keeps them from the pager. That
  holds when a wall stops the move too. A finished maze gives the arrows back.
- **A repaint dealt a new maze.** `start` runs on every repaint. Now `initMaze` keeps a maze that is
  still being walked and deals only when there is none or the last one is finished. `New maze`
  calls `mzDeal_` directly.

**Checked twice, once in each instrument.**
- `check-flow.js` has its first maze journey. It reads `style.css` and asks that no rule whose
  subject names a maze square's class, and that matches one, belongs to anyone but the maze. This
  turns the fault into a rule, so a future `.you` or `.out` on another card is caught too. The
  journey then reads the walls back off the drawn classes, checks both sides of every doorway agree,
  presses the arrow keys on and off the maze page, repaints mid-walk, and walks the shortest route
  through the pad's own handler to "the shortest way there is". Four mutations each turned it red
  for the right reason, and each passed again once restored:
  - bare `ws` put back gave "a rule that is not the maze's reaches a maze square: .ws";
  - `stopPropagation` removed gave "ArrowUp on the maze page turned the column … to page 6";
  - the in-front guard removed gave "arrow keys on another column walked the maze from 1 to 4";
  - dealing on every start gave "coming back to the column dealt a new maze".
- `check/ui.js` now asks every board on a screen (chess, Connect 4, Othello, maze, word search,
  Scrabble) that its squares are one size, within 0.5px. It prints how many boards it measured: 528
  on the Games screen across 88 combinations. With bare `ws` put back, it reported "#maze-grid: 53
  of 121 squares are not the board's size … 12.1-19.3px tall".
