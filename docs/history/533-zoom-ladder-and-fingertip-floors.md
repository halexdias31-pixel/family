# 533 — The zoom ladder and the fingertip floors (polish package B)

**Asked:** *"feels so stable, like iOS made it"* (531). Rule U10 of the polish plan: the zoom has a ladder and two
floors. The owner said yes to D3 — *"Cards will shrink only in three fixed steps (full, a bit smaller, smaller),
never so far that writing is under a readable size or buttons are smaller than a fingertip; past that the card
scrolls instead"* — and to D4, *"Make the calculator fit its space at full size rather than being shrunk on every
phone"*.

## What was wrong

`paneReach_` (find.js) drew a card taller than its pane at exactly `room / used`, anywhere from 0.7 to 0.999. The
audit found seven rendered sizes of one card title at 390, reel cards at 0.98 (a blur for two per cent), the
calculator always zoomed (0.7 at 320, 31px keys), Tutors' tiles 35px at 320, and a ResizeObserver that re-zoomed
a card under the reader's thumb whenever it grew.

## The ladder (`PANE_ZOOM_STEPS`, find.js)

- A card is drawn at **1, .875 or .75** and nothing between (`paneStep_`). `PANE_ZOOM_MIN` is the last step.
- **Nearly fitting is full size**: above `PANE_ZOOM_SNUG` (.95) the card is drawn at 1 and its pane gets
  `.is-snug`, a tighter top and bottom (`--s1`/`--s2`); if it still does not fit, its pane scrolls (see the review below).
- **The floors** (`paneFloor_`): no step that draws the card's body words (`p`, `li` and the card's own size; art
  in `PANE_ART` excepted) under 11px, a tile under 36px or a Check under 44px. A tile is 36px at full size, so in
  practice **a card with a tile on it is never drawn smaller**: it scrolls. That is most cards; the ladder is for
  the tile-less ones. A card held above its fit by a floor scrolls from 2px over (see the review below).
- `cardFigFit_`'s words (the figure card) take the same ladder and the 11px floor; the picture narrows for the rest.
- **On the glass, no re-zoom**: the ResizeObserver no longer zooms a card on the page in front (`paneOnGlass_`). It
  keeps its zoom, may start to scroll (`paneReach_(…, { hold: true })`), and is marked `PANE_DUE`; `paneWatch_`
  zooms it again at the next arrival (the page in front changed since its last call, `PANE_FRONT`) or once it is
  off the glass.
- **No flip**: a zoom change that reverses the pane's previous change within 50 ms (three frames) is not made.
  (The plan's text says "in the same direction"; its check says "never reverses", which is the loop it meant.)

## The calculator (`calcFit_`, games.js; style.css `.calc`)

The device is never zoomed now. Its nine key rows — the top block's six half-rows (three keys), two function rows,
four number rows — are one variable, `--calc-row`, set from the pane's cap: what the pane has left, divided by nine,
between 36px (a tile's floor) and 56px. `paneReach_` calls it before measuring, like the other fits. Measured
(admin): 41px rows at 390x844 and the device fits; 36px at 1280x800 and it fits in a snug pane; 36px at 320x568,
where it is 189px over and the pane scrolls — nine 36px rows and the display do not fit a 532px pane. A face is no
taller than its row less its legend, so a short row draws a flatter key, never a taller device. `.mc-btn` lost its
44px min-height (a key is its cell); check/ui.js accepts `.mc-btn` with the reason and holds its run to 36px.
calc-steady (472) still holds: pressing a key changes no size.

## The answers' "44px reach"

The `counted.row` entry in ACCEPTED_TAP said each chip's 6px reach above and below made a 44px hit area. A reason
that names a number is now held to it (`run`, below), and it did not hold: measured down a chip's middle at 390
the run is 36-38px (43 on a lone line), because lines of chips sit .4rem apart and one chip's reach lies under the
next line's. The plan offered a 12px line gap or the true number. The gap would push every long answer list a line
further down a card, against the owner's own reason for 32px chips (*"make sure more fit in"*), so the entry now
says what is true and is held to 36, a tile's floor.

## Checks

- **check/ui.js** — `A ZOOM OFF THE LADDER`: every card and every `[data-face-zoom]` word is at 1, .875 or .75
  (`ZOOM_LADDER`, written in the check so the app cannot move it and pass). `A TOOL DRAWN SMALLER`: Tools at 390 and
  1280 has no zoomed card. `TAP TARGET SHORTER THAN ITS REASON SAYS`: an ACCEPTED_TAP entry with `run` is measured
  by `elementFromPoint` down the control's middle (on the page in front, whole inside its pane) and fails under
  its number; a whole run that measured none fails.
- **check/tiles.js** — a second pass: every tile in every state of check/states.js, as student and admin, at 320
  and 390, measured with `getBoundingClientRect` (zoom included) and failing under 35.5px (43.5 for a Check).
  `--no-states` skips it. A state this pass cannot reach (some ask for check/ui.js's visitor or payload) is counted
  and named under -v, not failed: reaching states is ui.js's rule; measuring no tile at all fails.
- **check/steady/zoom-stable.js** — the library is held back and given back with Find in front; every card in
  every pane, every frame for 105 frames: none reverses its zoom within three frames, none is off the ladder.
- check/states.js: the cheat sheet maker's walk accepts a view that scrolls to its foot (the floors hold it at
  full size at 320) instead of asking for zoom ≥ .85; the tallest-figure state reads "gave way" as a ladder step.

## What it looks like now

No card in the fixture is drawn smaller any more at 320, 390 or 1280: every one that overflowed carries a tile, so
the tile floor holds it at full size and its pane scrolls (feed, tools at 320, games, staff, tutors, biz, site);
the reel's 0.98 cards are full size in snug panes. Tools at 390 and 1280 is all at zoom 1.

## Proof

Each new rule made red on purpose and green again on the real files:

- `paneStep_` put back to the old `max(0.7, room / used)` and `calcFit_` switched off: steady `zoom-stable` red
  (`s-tutors .card at 0.835`, `s-tools .card at 0.826` …), ui.js `A ZOOM OFF THE LADDER` and `A TOOL DRAWN
  SMALLER` red at 390 (`.card at 0.941`), tiles.js red at 320 (3126 tiles drawn 25.2px, under a fingertip).
- The run rule was red on the real files before its entries were corrected: 101 `counted.row`/`chip.sm` findings
  at 390 against the old claim of 44, and 20 `.qw` words at 320 (32-33px) against the old "about 35px". The
  passage's words now say 32, which is what they have.

## The review: a full-size card's foot cut off

The first build kept `PANE_REACH`'s 24px allowance for a card held at full size by the snug rule or a floor. The
old code never met that case, since any card more than 2px over was zoomed until it fitted. Here it did: at 320
a student's booking page 0 was snug but 16px over, with its Share/Message tile row cut in half and `overflow:
hidden`, and admin biz page 6 was 24px over (10px of it painted) and did not scroll. Both had fitted at .96/.95 on
the base. Now `paneReach_` marks a card **held** when the zoom it is drawn at is above its fit (snug, a floor, an
essay's 1, the no-flip rule, or `o.hold`), and a held card's pane scrolls from 2px over, as ticks, forms, picks and
figures already did. check/ui.js no longer files a full-size card's clipped foot under "OUT OF REACH, INSIDE THE
APP'S OWN FLOOR (known)": only a card drawn smaller may claim `PANE_REACH`, so any other is plain `OUT OF REACH`.
Proof: the `held` term taken out of the `over` line turned ui.js red at 320 (booking "a single answer chosen" 22px,
biz 24px in four states); put back, neither screen has any OUT OF REACH finding.

## Left as found

- check/ui.js `--screen=tools` is red before and after this package with the same 23 `TAP TARGET` findings (36px
  tiles, the 467 spec against ui.js's 44) and the same unreached states; nothing here adds to them.
- steady `idle` at admin @1280 shifts `section.page.soft` by 0.013-0.019 about one run in two, on the base (P0)
  as well as here — the 1280 neighbour re-centre the plan lists as NEEDS PROOF; package A or G's.
- The figure states in check/states.js still ask for 43.5px pen tiles, which round 4 made 36px tiles; they are not
  reached on the base either.
