# 377 — the whiteboard is a maths notebook for one finger

19 Oct 2026. The owner: *"What is the most cutting edge stuff to help people write on a screen? Like imagine
doing long maths calculus on your phone. Something so specialised it actually unlocks this ability. No stylus.
… I don't care about fancy UI. I care about the subtle and non-subtle things which make my vision possible."*
Then: *"No need to start a demo in another place, just implement on the already existing whiteboard. EVERYTHING
which actually helps — imagine being able to do long calculus workings in the whiteboard."*

So the Tools whiteboard (310) stopped being the question pen on a blank sheet and became a notebook:
`js/board.js` (the board) on `js/ink.js` (helpers any ink surface can use), both loaded after answers.js.
No settings: every technique below is on, at the setting that tested best. The only controls are tiles.

## Why a finger cannot do long maths on a phone, and what each piece answers

A fingertip is 8–10 mm across and covers what it writes; a phone is 70 mm wide; a calculus line is 40+
symbols with exponents and fractions. Writing at the size you read means writing smaller than the finger.

| technique | what it answers | where |
|---|---|---|
| **Write big, land small** | The pad (bottom half) is a magnified window onto the current line: a 34–56 px x-height in the pad is 12 units on the page, about a quarter. Every stroke is stored once, in page units; the pad and the page are two views of it. | `nbMap_`, `nbCommit_` |
| **The pad moves on** | After a 400 ms pause (the end of a glyph, so a two-stroke x is never split) and when the writing is past 62% of the pad, the pad slides so it sits at 30%; at the very edge (88%) it moves at once. A tick under the finger where the phone can vibrate. Microsoft's handwriting panel and Math Input Panel behave this way. | `nbAdvance_` |
| **Lines wrap** | Past the right margin the caret goes to the next free line — indented under the working's `=` when there is one — and the page scrolls to keep the caret's line in view. | `nbAdvance_`, `nbFollow_` |
| **The caret** | A tap on the page puts it there (at a line's end if tapped past it). Held still 220 ms, a loupe twice the size shows what is under the finger, above it, and the finger can then slide the caret. The pad's window is shaded on the page, so where the next stroke lands is visible before it is written. | `nbTap_`, `nbDrawLoupe_` |
| **= lines up under =** | Two short level dashes one above the other are an equals sign. A second `=` on a line moves itself to the next free line under the first `=` of the working, and the caret goes with it — so `f(x) = … = … = …` sets itself out in a column with no tap. An `=` written first on a fresh line snaps under the column too. | `nbEquals_`, `nbEqCol_` |
| **Exponents** | A small stroke written wholly above the x-height line, to the right of what is written, is an exponent: once the pause says it is finished it shrinks to 0.62 and sits raised after its base, and the gap it left closes. The pad's dashed lines are the baseline, x-height and top of a tall letter. | `nbShrink_` |
| **Fraction, Power, Root, Integral tiles** | Each puts a shape at the caret with dashed boxes. The pad zooms to the shape (the whole fraction is in the pad at once); a stroke goes in the box it was written nearest — above the bar the numerator, below it the denominator, high on an integral its upper limit. Boxes grow with what is in them and the bar and the root's overline stretch with them. Written beside the shape, a stroke leaves it and lands on the line after it at line size: the integrand after the limits. A tap on a shape goes back into it. | `NB_SHAPES`, `nbLay_`, `nbRoleAt_` |
| **Ink quality** | `getCoalescedEvents` (every sample the screen took, 120–240 Hz, not one a frame), `getPredictedEvents` (drawn for one frame, never kept), a `desynchronized` canvas for the stroke under the finger, device-pixel canvases, the One Euro filter (1.5 Hz, β 0.03: a resting finger holds still, a fast one is not dragged behind), the line ending where the finger lifted, quadratic curves through midpoints, and a width that thins with speed (1.0–1.9 units). | `inkEuro_`, `inkSamples_`, `inkAhead_`, `inkStroke_` |
| **Gestures, no buttons** | Two fingers tapped: undo. Three: redo. A scribble back and forth over writing (four or more turns along its long side, its path four times its length): rubs out what it covers, and is not kept itself; over nothing it is writing. Held still 480 ms at the end of a nearly straight stroke: ruled, snapped level or upright within 8°, and the end can still swing while held (Procreate's QuickShape) — fraction bars and equals signs. Long press on writing: picks up the term it is part of (touching strokes, transitively) and the same finger drags it; long press on paper, held on: a lasso. Two fingers on the page scroll it and pinch it (1–4×); two on the pad slide the pad along the line. A wheel scrolls the page while it has page left, then the column has it; Ctrl+wheel zooms; Ctrl+Z / Ctrl+Shift+Z for a mouse. | `nbDown_`/`nbMove_`/`nbUp_` |
| **Palm and grip** | A contact wider than 44 px is a palm; one landing within 12 px of the screen's side is a grip or the system's back swipe; a second finger after the first has gone 16 px (or 64 px within 180 ms) is a hand settling and is ignored to its lift — measured on the raw finger, not the filtered line, which trails it. | `nbRefuse_` |

## What was kept from the old board

The key (`board:` + whoever + `whiteboard`, `padKey_(WB_ITEM)`), written through `ansStore_` so a board is marked
whose it is, adopted at sign-in (`padAdopt_`, `answersClaim_`), held for the visit and said when the device
refuses it (`padNoteSay_` → "Not saved — this browser is not keeping it."), never sent; the 100,000-character
ceiling (`PAD_BOARD_MAX`, "The board is full. Clear it to carry on."); a repaint never rebuilding it under a
finger (`boardHold_` beside `padHold_` in shell.js); a change of person putting the stroke down and drawing every
copy under the new key (`boardWhoChanged_`, from `signedOut_` and `signedIn_`); Undo after Clear putting the board
back as whose it was (`ansPutBack_`). The stored value is still a JSON array of strokes, so `ansJoin_`'s union and
`ansKeeps_` work unchanged: a stroke is `{p: [x0, y0, dx, dy …] in quarter units, w: a width digit a point, b: a
shape's box, e: 1 in an =}`, a shape `{t, i, x, y}`. A stroke in the pen's old format (a flat list, 340 across) is
drawn where it was and stored as it was until moved. Strokes are thinned (Ramer–Douglas–Peucker, 0.15 units), so
a long working is about a thousand strokes under the ceiling.

**What changed:** the padlock is gone. The pad is always a pad (`data-noswipe`), and the page lets a swipe
through until a finger is held on it (then the loupe, picking up or a lasso hold the column). Words under the
board would move the pad when they went, so the empty pad says how to use it in its own canvas.
On a phone on its side the page sits over the pad with the star, heading, tiles and note beside them.

## Adopted, rejected, and why

- **Adopted from research:** One Euro filter (Casiez, Roussel and Vogel, CHI 2012, gery.casiez.net/1euro);
  coalesced and predicted pointer events (W3C Pointer Events 3); the `desynchronized` canvas hint
  (developer.chrome.com/blog/desynchronized); write-large panels that advance (Microsoft's handwriting panel,
  Math Input Panel); scratch-out (MyScript, OneNote); hold-to-straighten (Procreate QuickShape); two/three-finger
  undo/redo (Procreate, Notability).
- **Rejected — recognition.** No free, offline, small recogniser of handwritten *maths* exists for a browser:
  Chrome's Handwriting Recognition API (`navigator.createHandwritingRecognizer`) is ChromeOS-only and recognises
  text, not maths (developer.chrome.com/docs/web-platform/handwriting-recognition); MyScript iink and Mathpix are
  paid cloud services with keys; the open models (CROHME-trained encoder–decoders, LaTeX-OCR) are tens of
  megabytes of ONNX and image-based; InkTeX's 72-class ONNX symbol classifier reads one symbol, not a line. When a
  board is to be read, it goes the way "Mark with AI" already sends a drawing — not built here.
- **Rejected — Google's ink-stroke-modeler** (C++, a build step) and **perfect-freehand** (a dependency, and an
  outline polygon per frame): the One Euro filter, prediction and a per-segment width give the same at notebook size.
- **Rejected — pressure:** a finger reports a constant `pressure` on most phones. **A settings drawer:** the owner
  asked for the best defaults, on. **Snapping words or shapes to type:** without recognition it would guess.
- **Platform limits, said plainly:** iOS Safari has no `navigator.vibrate` (no tick) and no predicted events;
  touch radius (palm size) is reported by Chrome on Android and not by every browser — there the side-edge and
  late-second-finger rules still hold.

## The pen's blank sheet

`initWhiteboard`, `wbPaint_` and `WB_ITEM` stay in find.js: another branch is changing the question pen there,
and check/pen.js, check/press.js's pen cases and the pen journeys in check-flow draw on that sheet (they mount a
`.wb-box` in the whiteboard's slot themselves). Whether to delete it is for after that branch lands;
check-widgets lists it as a starter kept on purpose. Wiring the question cards' pen to js/ink.js is not done.

## Checks

`check/whiteboard.js` (new): real touches at 390x844 and a mouse at 1280x800 — lands small, does not move
the pad when the first stroke lands, two-finger undo and three-finger redo, palm, scratch-out, hold-straighten,
advance and wrap, tap-to-caret, `=` alignment, exponent, fraction boxes and leaving the shape, long-press move,
reload, Ctrl+Z, click, wheel. check-flow's two whiteboard journeys and four edges cases were rewritten for the
notebook; check/press.js's whiteboard swipes and check/states.js's board state likewise.
