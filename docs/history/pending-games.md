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
