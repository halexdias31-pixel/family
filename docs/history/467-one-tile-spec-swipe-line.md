# 467 — One tile spec, and the magenta line while swiping

Owner: "Reformat tiles universally to be more consistent — they feel all over the place. For tutors, the
tiles are clashing." and "Sometimes when I swipe I see a cyan/pink line on my screen."

## What was wrong

On a tutor's card (owner's iPhone screenshots) there were three or four tile rows under the card, each
looking different:

- the viewer's row (Message, Share, Save) had plates with a `--line-soft` border that read as no border;
- the admin group was pushed to the far end (`margin-left: auto`), so its left edge differed from the row
  above, and at 390px the six admin tiles plus their spacing overran the card;
- Delete their account is tone `danger`, which had no CSS at all: a bare grey square among yellow plates;
- the person's "Start here" row and the card's layout row (465) were nested: `cardRowIn_` slid the card's
  row inside the last `</div>` of the page, which was the start row, not the card. The same splice put a
  student list's layout row inside the last person's own tile row. Hence a lone flag on its own line and
  the layout row at yet another indent;
- `.tile-row.is-admin` drew 36px tiles with a 15px mark (below the 44px target); `.tile.is-listen` was 64px.
- A disabled tile lost its plate, so a row with one disabled tile had a hole in it.

## The spec (style.css `:root`, `.tile`, `.tile-row`)

- Every tile is `tile_()` (tiles.js): icon-only, its name in `aria-label` and `title`. Icon-only suits the
  black-and-white screen; the label is what a screen reader and a long press get.
- `--tile: 44px` plate, `--tile-i: 18px` mark, `--tile-gap: 6px` between, `--r` corners, a `--line` border,
  for every tone. Tones change colour only: default, `admin`, `buy`, `danger` (new), `over`, `lead`.
- A disabled tile keeps its plate and dims.
- A row is flex, wrap, left-aligned, 6px gap; equal tiles plus an equal gap make the lines line up as a
  grid. The admin group stays together but starts at the same left edge and wraps whole before it wraps
  inside.
- No lone orphan: each `.tile-row` is a size container, and a row of five that fits four breaks 3 + 2, six
  that fits five 3 + 3, four that fits three 2 + 2.

`check/tiles.js` (slow, in `check-all`) fails on a tile drawn by hand outside tiles.js, a tile size or mark
size in style.css outside the spec, and, at 320/390/768/1280 on every column, a tile that is not 44x44
or has a mark that is not 18px, two tiles overlapping, a tile spilling past its row, or a lone tile under a
line of three or more. Before the fix it reported 191 findings; after it, none, over 1988 tiles.

## The swipe line

Not reproducible in Chromium (mid-swipe frames at 390x844 over every column showed no such line). On the
owner's iPhone it is a 1-2px magenta line across the whole viewport, through the blurred neighbouring
cards as well as the one in front, which is a compositor artefact rather than anything drawn: iOS WebKit
tiles a `filter: blur()` layer and inside a column moving by `transform` (`will-change`) the seam between
the tiles shows as a coloured line. The cards not in front were blurred by `.page.soft > .pane`.
In iOS WebKit (`@supports (-webkit-touch-callout: none)`) they are now dimmed instead (opacity .85), the
look reduced-motion already had. Desktop and Android keep the blur. If the line is ever seen again on an
iPhone after this, the next suspect is `will-change` on `.screen`.

css 2026-10-26-q-tiles-one-spec
