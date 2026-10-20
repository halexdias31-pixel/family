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
  too long, refused by the store. The box's line keeps its reserved height (261: words arriving move nothing); an empty
  `.qpad-note` takes no room.
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

## Short strokes always ink (20 Oct)

Found testing Corbettmaths Metric Units Q1 with a mouse on the real card: an arrow's shaft was kept, its arrowhead's
two short lines were not. The cause was not the string. On a question's pad every pen touch was 357's *placement*: a
dot until it had gone `PAD_DOT_PX` (12px), snapped to a grid intersection, a figure's point or **your own mark's end**
(24px). A mouse's 8px arrowhead stroke never left the dot, so it was stored as one point, snapped onto the shaft's
end, and painted on top of it, unseen. A 5px tick, a 3px cross and a decimal point went the same way. The board,
which never snaps, kept them.

The fix, in the pen only (`padStart_`, `PAD_DRAW.pen`):

- A mouse or a stylus (`padSteady_`) is never a placement. It goes down where it is put, and a short stroke is kept
  from its down point to its up point.
- A short stroke is drawn exactly as moved. The lazy string engages only once the pointer is more than
  `PAD_STRING_PX` from where it went down (`g.slack`), so a tick keeps its corner and a long line is steadied as before.
- A click that never moved is a plotted point. It snaps to the grid or a figure's point, as a finger's does, but never
  to your own marks, where it would vanish.
- A finger is unchanged. Its short touch is still 357's dot, and 338's palm, two-finger and stray rules are untouched.

check/pen.js `short`, at 390 and 820, on Q7's card and on the board, from a mouse and from a stylus: a 5px tick, an
arrowhead pair after a shaft, a 3px cross and a click are each stored with their own down and up points, drawn,
and change the screen's pixels round them. A finger's tick on the card is still one point. Before the fix, every card
case failed and the arrowheads were `[119,153]`, the shaft's end. check/whiteboard.js: board.js (377) already kept
them. It now proves a mouse's and a stylus's tick, cross and click, and a finger's tick and tap, are each kept and
painted.

## A finger on a phone did nothing on the whiteboard (20 Oct)

The owner, on a real phone just after ee42605, 9cb39cb and 95004f2 went live: *"It doesn't work when on mobile,
like I place finger and nothing happens."*

**Reproduced, with real touch** (Playwright, `isMobile` + `hasTouch`, 390 × 844 at 3x with an iPhone user agent, and
412 × 915 at 2.625x as Chrome on Android; CDP `Input.dispatchTouchEvent` taps and drags, not a mouse), on Metric Units
Q1 (a)'s card (the dial carried from its stem, 381), Q7's card (its own grid), a made-up grid and the Tools whiteboard.

- **The question cards were not broken**, at ee42605, at 8df1749 (381), at 95004f2 or at 8a321ed before them: a
  finger's tap on the figure arms the pen (the art is the door, as the lock tile is), a stroke then inks and a tap
  leaves 357's dot, for every contact width tried (16–62 px). ee42605's split is `pointerType === 'mouse' || 'pen'`;
  a finger (`touch`, or `''` from a browser that leaves it empty) falls on the finger's side and is unchanged. A finger
  placed on an *unarmed* figure still does nothing — by design since 338: a swipe there moves the column.
- **The whiteboard was.** The notebook (board.js, 377, live since 29ded2a) refused at landing any touch wider than
  `NB_PALM_PX` = 44 px as a palm (`nbRefuse_`), whatever else was down. WebKit gives a touch pointer
  `width` = 2 × the UITouch's radius, and an iPhone reports a fingertip's radius in steps of about 5.2 pt from about
  20.9 — 42, 52, 63 px wide. A light touch passes, an ordinary one does not: put a finger on the pad, and nothing.
  Chrome emulation and check/whiteboard.js use an 8 px radius (16 px), so every check was green. The commits named
  above did not cause it; they were the first deploy the owner wrote on the board with.

**The rule, fixed:** a contact is never refused for its size alone. A wide contact is a palm only *beside a narrower
one* (`nbWide_`): wide and landing while a finger writes, it is ignored to its lift; down first and a narrower finger
landing after, the palm's half-stroke goes and the finger writes. The edge rule and the late-second-finger rule are
unchanged. The question pen never had a size rule (338 waits for a reading), so nothing there changes.

**Proof.** check/pen.js `phone`: an iPhone (52 px fingertip, 3x, iOS UA) and an Android phone (24 px, 2.625x) tap the
stem figure (Metric Units Q1 a) and Q7's figure to arm them, stroke (1 stored, 1 drawn, no swipe) and tap (a dot), and
write a stroke and a tap on the notebook. check/whiteboard.js: lone fingertips 42, 52 and 62 px wide each write; a palm
down first then a finger keeps only the finger's stroke; a palm landing beside a writing finger is ignored. Mutation:
the old board.js fails `phone` (iPhone notebook: 0 items for the stroke and the tap) and whiteboard.js (52 and 62 px
fingertips: nothing written); the real file is green again.

## The first touch draws: no lock on a question's figure (20 Oct)

The owner, on a phone, after the board was fixed: *"I place finger and nothing happens."* On a question card it was
still true by design — since 338 a finger on an unarmed figure did nothing until the figure or the lock tile (an icon
alone on a phone) was tapped, so that a swipe starting on the figure moved the column. The owner wants the simplest
thing, no hidden step, and fewer tiles.

**The rule now.** A pen's figure (every `.qpad`: a drawing part's own figure, a stem's figure it draws on (381), a
made-up surface, the pen's blank sheet) takes the first touch. A contact landing on a pad's ink with nothing else down
gives that pad the pen there and then (`padTake_`, in the pointerdown listener) and goes on to `padLand_` — a tap is
357's dot, a drag a line, a mouse or stylus the same. `PAD_ON` is now "the pad last touched", one at a time, so 338's
palm, two-finger, stray and lost-lift rules still have one ink to ask about. Choosing a tool (Pen, Ruler, Compass)
does the same (`padTake_`). The ink is `pointer-events: auto; touch-action: none; data-noswipe` from the moment it is
drawn (`.qpad .qpad-ink`); a copy with no pen (`.qseen`, 356's `uses`) stays inert, and a figure in a question
answered in a box was never a pen (`padSource_`) and is unchanged.

**Removed:** the lock tile (`pad-draw`, `padLockFace_`, `PAD_TAP`), the picture as a door (`.qpad-art[data-do]`),
and the gold frame that said "armed" — there is no mode left to show. The bar is the tools (where the question has
more than a pen), Undo and Clear.

**Swiping between cards.** A swipe that starts OFF the figure — the words, the bar's gaps, the small print, the card's
margin — moves the column exactly as before. A touch that starts ON the figure is the pen's, whether one finger or
two. Considered and not taken: a fast, mostly horizontal two-finger swipe on the figure moving the column. 338 decided
two fingers, a palm or a thumb never move the column (`padBusy_`), because the palm under a writing hand was the
swipe engine's sideways swipe; a two-finger exception would bring that back and is a new gesture to teach. One rule:
**on the figure is drawing, off it is moving.** The cost: a vertical scroll that starts on a figure does not scroll
the card either — start it beside the figure.

**What `PAD_ON` no longer means.** With no lock, nothing lets go of `PAD_ON` (a change of person still does). So
`ansHeld_` (answers.js), which keeps the account's copy from overwriting a key under a finger, now asks `padInUse_` —
a stroke or a contact on that pad now — instead of "the pad is armed"; otherwise the last pad touched would refuse
the account's copy for the rest of the visit. Zoom (374) is let go by pinching back, or by touching another pad;
"Done drawing" is gone with the lock.

`--css-version` `2026-10-20-d-first-touch-draws`.

**Proof.** check/pen.js `phone`, on iPhone-like (52 px fingertip, 3x, iOS UA) and Android-like (24 px, 2.625x)
emulation with real CDP touch, on Metric Units Q1 (a)'s stem figure and Q7's own figure, the pen put down first
(`PAD_ON = ''`): no lock tile; a single-finger stroke inks at once (1 stored, 1 drawn, no swipe axis, column and page
unchanged); a single tap leaves a dot; a swipe starting on the card's small print, off the figure, turns the page and
leaves no mark. Mutation: the old find.js and style.css fail every one of those cases at both sizes (stroke stored 0,
the swipe engine took it and the column moved to dm); the real files are green again. pen.js's `arm` is now a real tap
on the ink, its dot taken off; the zoom section's "Done drawing" step went with the tile. check/press.js: a line of
best fit dragged across May 2017 1F Q6(i)'s scale with nothing pressed first is kept and the column stays; a swipe
from the same card's small print moves the column. check-flow: "a drawing question's figure takes the first touch"
(no lock or door, `data-noswipe` from the start, a first tap a dot, a stroke on a second figure moves the pen there
and is a line, a repaint keeps it, a typed question's figure is no pen); the tile census now fails a `pad-draw`
tile; the Ruler and Compass and the answers journeys draw without pressing a lock. check/states.js: Q7's card has
no lock. check/swipe.js unchanged and green.
