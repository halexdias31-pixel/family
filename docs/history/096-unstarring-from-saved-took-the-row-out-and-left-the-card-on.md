## Unstarring from Saved took the row out and left the card on the screen

**Reported as "if i favourite something it does appear in right place, but then if i unfavourite it
from the favourites tab its buggy and not responsive. should just dissapear."**

**It never disappeared.** `on('fav')` ended with `if ($('s-stuff')) paintStuff(true)` — it rebuilt
the Find strip and nothing else. So unstarring from the Saved column removed the key from `FAVS`,
toggled `.favwrap.is-fav`, relabelled the tile and repainted a screen you were not on. The card sat
exactly where it was. The only thing that moved was the word on the button, which reads as a tap
that half-worked, because it is one.

**Three cases and they are not the same.** On **Saved** a card IS a page, so removing it removes a
page and the column has to be rebuilt and the position clamped — `repaint(true)`. On **Find** a
star adds or removes a page in front of the question, which is exactly what `paintStuff(true)`
already handles. **Anywhere else** — Tools, Games, a person's card — the card is still correct and
the tile has already changed; what is now wrong is the Saved column you are not looking at.

**So the others are marked rather than redrawn**, which is what `STALE` is for and what
`receipt.js` already does for the booking column. **Redrawing Tools from here would be worse than
the bug**: `paint` replaces the markup, `startScreen_` restarts what was in it, and unstarring a
timer would put it back to 25:00.

Measured end to end: star chess on Games → `FAVS ['w:chess']`; swipe to Saved → the widget is
there; unstar it → the card is gone on the spot and the empty-state card is back.
