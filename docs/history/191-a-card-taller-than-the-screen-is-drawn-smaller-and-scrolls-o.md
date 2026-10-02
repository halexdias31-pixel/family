## A card taller than the screen is drawn smaller, and scrolls only past 70%

**Reported with a screenshot of a tutor's profile running off the bottom of a phone: "I don't like
scrolling. If you need to leave things more compact or smaller font. This goes for all widgets so
they all fit on screen."** `paneReach_` in find.js used to give an overflowing pane `overflow-y:
auto`. It now shrinks the card first — CSS `zoom` on the pane's children, measured at zoom 1 every
time so the answer is deterministic, down to `PANE_ZOOM_MIN` (0.7, about 10px text) — and scrolls
only a card that still does not fit at that. It runs on every column, from `placeNow_`.

**Two things had to be right and both were found by measuring.** Zoom alone does not shrink
anything whose height follows its width — a game board, a 4:5 photo — because a zoomed card is wider
in its own pixels; so each child keeps the width it had at zoom 1 (`width` + `margin-inline: auto`)
and everything scales by one factor. And a shrunk card is a few pixels shorter than the capped pane,
which moved the page in front on the Find screen by 46px on a busy machine; a zoom that changed now
re-places its column.

**The cost is the tap targets**, which shrink with the card. `check/ui.js` judges each control at
its own size and prints `CARD DRAWN SMALLER TO FIT (known)` — 39 findings at the four sizes, nearly
all at 320x568. Profile rows are also a notch tighter (`.is-prof .row`), so a profile rarely needs
shrinking at all.
