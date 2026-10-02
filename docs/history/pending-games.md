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
