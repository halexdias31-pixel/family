## A profile picture picker, a tutor's hours on their card, and a heat map you can read

### The heat map

**Asked for as *"make the heat map a bit clearer."*** Two things made it unclear, and both were
measured on a stand-in tile in OpenStreetMap's own colours, because this container cannot load the
real tiles (403):

- **The streets were gone.** `.heat-tiles` was `invert(1) hue-rotate(180deg) brightness(.85)
  contrast(.9) saturate(.4)`. White minor roads on `#f2efe9` land came out `rgb(13,13,13)` on
  `rgb(26,25,23)`, which is 1.11:1. The two colours are 5% apart, and inverting keeps them 5% apart at
  the dark end. Turning the contrast up after an invert only clips both to black (measured: 1.00:1).
  The filter is now `brightness(.46) contrast(4) saturate(.5) sepia(.25)`. The stretch comes first, so
  the narrow light band the tiles live in is spread across the dark half of the range, and streets stay
  LIGHTER than the blocks round them, as on any dark map. Minor roads now measure 1.62:1 on open land
  and 2.46:1 on residential grey (`#e0dfdf`, which is most of London at these zooms). Water is 1.85:1,
  and place labels come out dark rather than white.
- **Seven venues were one blob.** Colliers Wood, Sutton, Wimbledon, Tooting, Mitcham, Balham and
  Morden merge into a single patch with 80px glows. That is right for a heat map, but it meant three
  venues looked the same as seven. Each venue now has a 10px gold core with a dark ring, on its own
  `.heat-core` layer above the glows. The core is placed by the same `pos()` call as the glow, so the
  two position strings are identical.
- **No text was added.** The owner asked for a map *"instead of the tutors at showing names of all
  places"*.

The account state `a tutor card, the five captions and the area map` now also asserts that there is
one core per venue (`data-dots`) and that the cores' `background-position` list equals the glows'.
Proved by placing the core at `pos(p[0], p[1], D, D)`, half a dot off its glow: the state reported
"was entered and shows no … gold core on its centre" at every width. It went green again once the
change was put back.

**The phone has the last word on the filter.** Every screenshot here was taken over a stand-in tile.
If it is too dark or too bright, tune the two numbers. Do not change the order.
