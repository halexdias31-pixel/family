# 472 — Compact widgets, and a calculator that keeps its shape

Owner, with three iPhone screenshots (Console, Make a flyer, Calculator): "These are too long. You need to
make it more efficient with space… make it smaller or something." And: "the calculator … kept moving when
you press buttons … it needs to not move like a real calculator, changing shape. Real calculator doesn't
change shape."

## What was wrong

- **Two lines of tiles above every widget's title** for an admin: the star (and a game's padlock) on one
  row, the layout row (▲ ▼ ◀ ▶ Delete) on another, then the title on a third.
- **Console**: a three-line description over the picker, and the same promise repeated in a sentence under
  the tiles.
- **Make a flyer**: every answer was a caption over a full-width select (two lines each), a three-line
  description and a three-line footnote about the colours.
- **The calculator changed shape.** The LCD had only a `min-height`; its input line's height followed its
  content (a fraction is taller than a digit), the answer line's too, and both could grow a scrollbar.
  `paneReach_` (find.js) zooms a widget taller than its pane to fit, and recomputed the zoom every time
  the content height moved — so the whole device rescaled (0.946 → 0.956 after pressing "1") under the
  thumb. On top of that a pressed key's face did `translateY(1px) scale(.95)`.

## What changed

- **One place for a widget's tiles.** Owner, on a later Console screenshot: "why are tiles not all in same
  place. you need to standardise uniformalise tiles to be good." Every widget is now title, content (its own
  tiles last, as each widget draws them), then ONE row, `.wgt-foot`, the card's last child: the star, the
  padlock, then the admin's ▲ ▼ ◀ ▶ Delete, in that order (`widgetOnColumn_`, arcade.js; `layoutTiles_`
  returns a `.tile-group` now). The groups are `display: contents`, so the seven tiles wrap as one row; a
  star plus five admin tiles where five fit breaks 3 + 3, plus four where four fit 3 + 2 (the 467 orphan
  rule across groups). check/tiles.js now also fails a widget whose star, padlock or admin group sits
  anywhere but that last row, or out of order (46 findings on the old drawing, none now).
  The widget's own tiles are not moved into that row: each widget redraws its own row by id, and moving
  nodes it repaints would leave stale copies; so they sit directly above it, the last thing of the content.
- Widget padding is a token, `--wgt-pad` (.7rem, was .9rem); a widget's inner `.card` loses its own
  block padding and rule.
- Console: one short line ("NES to DS games you own; they stay on this device.", the system list in its
  title), the repeated footnote removed.
- Make a flyer: label/value rows, one thing per line (421) — the label left, the control filling the rest;
  Ink, Accent and Paper are one Colours line of three swatches; the footnote moved into that line's title.
- Calculator: the LCD and each of its lines have fixed heights and clip (scrolling sideways, scrollbars
  hidden), an error stays on one line; a pressed key darkens (`filter`, inset shadow) and no longer
  transforms. Device padding and the bezel tightened, the name line lost its 44px reserve for the star.
- `check/calc-steady.js` (slow, in check-all): 72 presses — 23 digits, fractions, powers, SHIFT, roots,
  S⇔D, 1 ÷ 0, trig — measured held and released; the device, display and all 48 keys and faces must not
  move or resize. Before the fix it reported 3331 findings; after, none.

## Heights at 390 × 844, admin view

| Widget | Before | After |
|---|---|---|
| Console | 749 | 651 |
| Make a flyer (content, capped by the pane) | 1130 | 928 |
| Calculator (device, unzoomed) | 733 (zoom .89) | 708 (zoom .924) |

css 2026-10-26-u-compact-widgets-steady-calc.
