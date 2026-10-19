# 374 — Hold to straighten, pinch to look closer, every answer kind walked

19 Oct 2026. Amends 338 (the finger pen: §8 "the pen never snaps", §9 pinch-zoom and predicted points declined),
357 (only placements are transformed), 368 (the lazy brush).

## What the owner asked

*"I want to maximise user friendliness, simplicity, elegance and familiarity. … Usually writing and drawing with
finger or mouse is hard so I really want this part to be as best as possible. Even if it means using the latest
methods and code techniques. I want a mobile user to be able to complete any type of question with ease. Same as a
pc user."*

## The research, and what was taken

| technique | verdict | why |
|---|---|---|
| `getCoalescedEvents` | already in (338) | every sample, one box read per event |
| pointer capture, `touch-action: none` on the armed ink | already in (338) | |
| **hold to straighten** (iPad QuickShape: draw, keep the pen down, the stroke snaps to a line or the nearest shape) | **taken** | the most familiar precision gesture on tablets; it is invisible until used and changes nothing for a stroke lifted at once |
| **pinch to zoom the figure** (338 §9's revisit, B's design) | **taken**, as a CSS transform of the picture and its ink together | the box `padMap_` reads is the zoomed box, so storage, snapping, the loupe and the marker need no zoom maths |
| `getPredictedEvents` (Baseline 2024) | **taken, preview only** | one segment, at most 12px ahead, a finger's freehand line only, drawn in the aid layer and never stored (338 §9's terms) |
| ctrl + wheel / trackpad pinch on a desktop | **taken** | the desktop's own zoom gesture, on the armed picture only; the wheel pans a zoomed one |
| `desynchronized` low-latency canvas | rejected | the pen is SVG; the live path is already written once a frame and painted in the first frame (338's `samples`), and the hint is ignored where unsupported |
| One-Euro filter for a finger | rejected again | 338 §6: it lags and cuts corners on a 16px square; the finger stays raw, the mouse/stylus keeps 368's lazy brush |
| offset cursor / Shift | kept as 357 has it | the loupe shows the point; an offset makes a band unreachable |
| auto-beautify every stroke | rejected | a sketched curve must stay a curve; only a deliberate pause changes ink |
| a second-finger tap to perfect the shape (Procreate) | rejected | two fingers are a pinch now, and nothing else (338's palm rules) |
| on-device maths handwriting recognition | skipped | no free, offline, small (< a few MB) model reads maths expressions in the browser; digit-only ONNX models exist, and the keypad already types maths |

## Hold to straighten (find.js `padHoldWatch_`, `padShapeOf_`, `padStraighten_`)

A pen stroke (finger, mouse or stylus, every surface, the board too) whose point stays within `PAD_HOLD_PX` (8px)
for `PAD_HOLD_MS` (500ms) has the run since its last corner replaced by its shape, shown at once (and an 8ms buzz
where `navigator.vibrate` exists):

- **A line** (max deviation ≤ max(6px, 10% of the chord), path ≤ 1.3 × chord): two points. The start snaps as a
  placement does (357's `padSnap_`: own marks, the grid's intersections); the end locks level or upright within 6°
  (the ruler's rule) and then snaps; an end within 24px of the stroke's own start closes the shape there.
  The point the finger paused at is a **corner**: once it leaves the 8px zone the pen goes on from the corner, so
  a polygon drawn in one stroke and paused at each corner is stored as its corners.
- **A ring** (the whole stroke; Kasa least-squares circle, ≥ 300° covered, rms ≤ 10% r, worst ≤ 25% r): the
  compass's own polyline (`padArc_`), its centre snapped like a placement. Done: the stroke ignores the finger
  until it lifts.
- **An arc** (the whole stroke, 40–300°, rms ≤ 5% r, worst ≤ 12% r, and not a line): an arc of that circle.
  Held tighter than the ring so a sketched parabola or sine paused at its end stays as drawn.
- **Anything else** — a scribble, a curve, a pause shorter than 500ms — is left exactly as drawn.

The tremble of the pause itself is left out of the shape; a mouse's lazy string is not paid out after a hold.
A dot (357) never straightens; palms, two fingers and a held stroke (338) never do. Stored points stay whole
numbers, so `draw_answer` marks a held line like a ruler's.

## Pinch to look closer (find.js `padPinch_`, `padZoomPaint_`; style.css `.qpad.is-zoomed`)

Two fingers already judged two by 338's rules, both on the armed picture, zoom it about their landing midpoint
(the spread measured from where they landed, so nothing is lost to the 338 decision) and pan it, 1x to 5x,
never showing past the picture's edge. An unzoomed picture zooms only once the spread changes 15%, so a palm
sliding with a finger does nothing. Let go under 1.1x and it is whole again; Done drawing, leaving, or a change of
person makes it whole. The picture and its ink are scaled together inside their own box (`overflow: hidden`), the
ink kept 2.5px on the screen. Nothing new is shown until a pinch: no tile, no text.

## Every answer kind, walked (390x844 touch, 1280x800 mouse, 320x568 touch)

Typed, a box per value, coordinates, cells, choice, ordering, key words, drawn on a figure, a made-up grid and a
construction were opened in the real card, tapped, typed and armed, measured and photographed. Nothing ran off the
card, every box stayed above the keypad, every pad armed. One fault: **at 320 a card answered by tapping** (choice
options, the order's numbers, cells) was drawn at 0.89–0.93x to fit its pane, so its options were 41px and the
order's numbers 39px. `paneReach_` now treats such a card like a form: never drawn smaller, it scrolls, and
every target stays 44px.

## Proof

check/pen.js `straight`: a bowed line held 700ms is stored as exactly the two intersections it was aimed 3px off
(three seeds, and from a mouse held with no events at all); the same line lifted at once keeps the finger's 73
points; a 300ms pause changes nothing; a wobbly oval held at its close is a closed ring within 2.5px; Corbettmaths
coordinates Q8's quadrilateral drawn in one stroke paused at each corner is its 5 corners and Check marks it right.
`zoom`: a pinch from 40 to 160px zooms Q7 to 4x, stores nothing and moves no column; a tap on the zoomed grid
stores that intersection in the picture's own units; pinching back makes it whole with the mark kept; two fingers
moving together at 1x do not zoom; Done drawing makes it whole. Mutations: no hold (6 findings), an instant hold
(8), no pinch (2); green again after. Every 338/357/368 case unchanged and green.

## Not done

- A device reading of the 500ms hold for children (338 §10's list).
- Ellipses, rectangles and triangles snapped whole (QuickShape does); here a polygon is made by its corners.

## And, the owner the same day: one kind of tile, and no sound switch

- *"turn the submit button into just another tile. To achieve uniformity."* `checkTile_` (tiles.js) is an ordinary
  `tile_()` now — the same 44px square, border and ink as its neighbours, last in its row; the gold 48px disc
  (`.tile.is-send`) is deleted from style.css. check-flow, check/states and check/ui ask for an ordinary tile.
- *"no sound tile — it should just play sound, no option to get rid of. The user can mute the tab or lower
  volume."* The marking-sound switch (`markSoundTile_`, `markSoundFace_`, `markSoundShow_`, `on('mark-sound')`, the
  `storage` listener, `markSoundOn_` and the `mark-sound` device key) is gone; the chime and the buzzer always play
  where Web Audio exists, and the old key is removed at load. The reels' own video mute is a different control and
  stays. check-flow's switch journey is now "there is no switch"; check/sounds.js keeps every loudness, click,
  one-tap-one-sound and rest check, without the switch's presses.
