# 480 — Merge with the card above

Owner: "the individual items which you can split… it seems like you can only split them and then recompile
the exact same ones together, like an on and off switch, when in reality what I want is each item to be
mergeable with another item… compatible with any other item to merge into one widget. It would need to be
done very carefully and expertly… maybe it has an option to merge with the item above only, and then once
that becomes one widget, I can merge with the item above again, and then it's merged three widgets
together… compatible with practically anything else within reason."

And the standing layout rule: like iOS, the current layout IS the layout for everyone; no undo, no saved original.

## What it does

- **An admin tile, "Merge with the card above"** (icon `merge`), in the admin group of every card and widget
  that has a card or widget above it in the same column. Pressed, the two are one card: one frame, the
  parts stacked, each part its own working content (its own ids, handlers, slot, role gate), the top
  part's title as the title and every lower title drawn as a small subheading, one tile row at the foot.
- **Again on the merged card** merges the next one above: N cards chain, up to twelve.
- **Split** on a merged card stands its parts apart where they are — arranging, not undoing.
- **Move ▲ ▼ ◀ ▶, Start here and Delete act on the merged card whole.** Delete takes every part (two taps,
  the second saying "all N of its parts", or naming the only place a setting is edited).
- **A part a viewer cannot see is simply absent**; one part left is drawn as a plain card; none, nothing.
- **One page in its column**: the card columns' pager counts `cardsOf_` (476), the widget columns' counts
  `widgetPagesOf_` (arcade.js), the same lists the columns draw. The basket's `cart-open` finds its page
  through the same list, so a merged basket still opens.

## Stored

`layout.merged: [[top, …, bottom], …]` — two to twelve ids a group, an id in one group only, a hundred
groups at most; cleaned by `layoutSane_` (layout.js) and `layoutClean_` (backend/core.gs, shapes only).
A layout without it is unchanged. At every save a deleted part leaves its group and a group of one goes
(`mergePrune_`). Versions bumped together: 2026-10-26-s-merge-with-the-card-above.

## What cannot merge, and why

- **Console, Board games, Word & number games, the Calculator, the Whiteboard, One more thing (reels)** —
  `WIDGET_WHOLE` in layout.js. Each is sized, zoomed or scrolled to the whole page (the calculator must
  keep its shape, 472); a second thing in its frame would be cut off or squeezed. They carry no Merge
  tile, and nothing merges into them from below.
- **A card that is a page per person** (Tutor directory, Every student, Every parent, a split card drawn
  a page a field) — a merged card is one page, and people cannot be stacked on one. No Merge tile on it
  or on the card below it.
- **A card with a widget**: cards live on the settings, profiles and Business columns and widgets on
  Tools, Games, Reels and Shop; neither can be moved to the other's columns, so they are never neighbours.
- The star on a merged widget saves its top part.

## Checks

Two journeys in js/check-flow.js (profiles cards: merge, merge again to four, a client after a reload
sees only the parts their role allows, ◀ moves it whole, Split, Delete takes both; widgets: no Merge on
the calculator, whiteboard or a game, three merged into one frame of three started slots with one tile
row last, the pager one page, a client sees the parts not admin-only). check/tiles.js: Merge and Split
lengthen the rows, so a row one tile longer than fits breaks near the middle (style.css).

css 2026-10-26-z4-merge-with-the-card-above.
