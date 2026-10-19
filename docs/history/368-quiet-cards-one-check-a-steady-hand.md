# 368 — Quiet cards, one Check, a steady hand

19 Oct 2026. Amends 357 (the finger pen), 359 (room to write), 362 (Send), 366 (drawn answers marked by geometry).

## What the owner asked

With a phone screenshot of Corbettmaths KS2 Metric Units Q1a (a 0–1000 g dial, a line drawn from the centre to about
450): *"simplify the finder experience ... regarding clutter when answering questions. e.g. duplicate text on have
another go. saved to [name]'s account is redundant ... i think i got question right but it says i got wrong ...
achieving as much universality on each questions with the tool tiles ... that feature you created for some sort of
huge white board really does nothing ... is there a technique to reduce acceleration or manipulate user input when
writing using the mouse to make it easier to control?"*

## Why the dial was marked wrong

The figure is drawn inside `<g transform="translate(-86,0)">`. `draw_answer`'s centre `[256, 84]` is in the group's
units, but `frame: "vb"` read it as the viewBox's, so the marker measured the bearing from a point 86 units right of
the dial's visible centre. A line from the real centre to 450 g read as roughly 250 g. Only this row had a
translated figure with `draw_answer`, but the rule is generic: `drawFig_` reads one outer `translate` as `shift`, the
labels are moved by it and `frameOf` adds it to the origin of `vb` and explicit `{o, u}` frames.

## The same class of over-strictness, swept

- **Hands, pointers, radii** (`clock`, `dial`, `pie`) used the longest RDP piece. A wobble splits a hand into pieces
  and the outer piece does not start at the centre. They now read `rays()`: each stroke is cut where it passes
  nearest the centre, so it can be drawn from either end; an arm's direction is the mean direction of its outer half.
  A dial arrow drawn outside the dial and pointing in is read by the mean direction of the ink round the rim.
- **Fake corners**: after RDP, a vertex that turns less than 12° and is within 0.3 of a square of the chord is
  dropped. Before this, a wobbly bar top broke into two short pieces and the histogram was marked wrong.
- check-marking: the real Metric Units figure with a hand-drawn wobbly stroke (just off the centre, at 455 g, drawn
  from the rim inwards) is right, and 490 g and 400 g are wrong. Every right drawing in `DRAW` (42) is drawn again
  thickened to dense points, wobbled and reversed, and must keep its mark. The old code fails 4 of these cases.

## Clutter removed

- **The verdict beside the star** (`subSlot_`, `.qcard-verdict`): gone. The box's own verdict line says it once.
- **"Saved to …'s account" / "Sent to …" / "Saving…" / "On this device until you send it"**: silent
  (`ANS_QUIET`, `padKeptSay_`). The line speaks only when an answer is not on the account or cannot be: signed out,
  too long, refused by the store. `.qp-saved:empty` and `.qpad-note:empty` take no room.
- The essay's "Mark with AI" caption beside its tile is gone.
- Tile notes are only titles and aria-labels (never drawn), so they were left as they were.

## One Check

`checkTile_` (tiles.js) is the same gold disc with the word Check on every question kind: typed (`qp-check`), key words
(`qp-rule`), cells, drawn by geometry (`pad-check`), a drawing nothing can mark (`pad-send`), an order, a box that only
sends (`qp-send`) and the AI (`qp-ai`, offered only where nothing else marks). It always comes after the figure tile.
The verdict line says which marker was used ("· by the drawing", "Sent — waiting to be marked"). Multiple-choice
options are still the answer itself, with no Check. The rule's own AI fallback (`qp-ai-later`) keeps its separate
tile because it is a second opinion after Check.

## Removed: room to write

359's Expand tile and its whole-screen sheet (`kpWideTile_`, `kp-wide`, its CSS and its check-flow journey) are
deleted. The box wraps and scrolls on its own. The Tools whiteboard widget stays; if "huge white board" meant that
widget, it is a separate decision.

## A steady hand for a mouse or a stylus

`padLazy_` is a lazy brush. The ink follows the pointer on a 6px string (`PAD_STRING_PX`), so jitter inside the
string moves no ink, and the point at the end of the string is low-passed (`PAD_STEADY_K` 0.55). On lift, the slack
is paid out in two points, so the stroke ends where the pointer lifted with no lag. Fingers (`pointerType: touch`)
are untouched, as 357 requires. check/pen.js `steady`: a 220px line with ±3px jitter per sample from a mouse and from a
stylus is stored at 1.06px (phone) / 0.48px (iPad) roughness per sample where the hand was 5.03px, and ends at the
lift. A finger's same line keeps its jitter.
