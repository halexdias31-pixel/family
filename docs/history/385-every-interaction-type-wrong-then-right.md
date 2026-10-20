# 385 — Every interaction type, answered wrong and then right, by touch and by mouse

20 Oct 2026. The owner, with a photo of an iPad on June 2024 Foundation Paper 1 Q11(c) (five options, one
pair of brackets, "↻ Not yet — see Answers" under them): "This won't let Theo click. He's tapping and
tapping." And: "once you get protocols perfect you can recycle them and I will never have an issue."
Three more came in the same session: "editing a text box of text you've already written is hard and
clunky. I was expecting more like iOS"; Q19 of the same paper ("Describe fully the single
transformation"), typed "Translate triangle A (5/-4)": "There's nothing on the keypad for vectors";
and Paper 2 Q7(b) ("Measure the size of the angle marked x"): "There needs to be a protocol for this
type of question. Like protractor tool."

## Why Theo could not tap

Nothing covered the options and no touch was eaten. `qp-choose` (js/find.js) returned early once the
stored pick had as many options as the question needs — `if (right && picked.length >= need) return;` —
and `choiceBox_` drew the box `is-done` after any pick, right or wrong. That was deliberate: the comment
said a free retry reaches "Correct" by elimination. So after one wrong tap every later tap was ignored,
and "see Answers" pointed at the Answers chip, which is not a tile on the card. Reproduced with real CDP
touches on an iPad (820x1180) and an iPhone (390x844): taps 2 and 3 landed on the option (elementFromPoint
was the option) and changed nothing.

The fix: only a right pick is final. A wrong one draws the box `is-miss` (the pick in amber, every option
still pressable), the verdict says "Not yet — have another go" as every other box does, and the next tap
is a new pick, marked and recorded again. On "choose two" a third pick drops the oldest. check-flow's
"still" journey and the mark-sound journey now prove a second tap after "Not yet" is taken and heard;
check/states.js expects `is-miss`.

## check/types.js — the recycled protocol

For every type in `QTYPE_PROTOCOL`, two or three real rows (Corbettmaths first, then GCSE Maths, then
SATs; Q11(c) pinned) on their real cards in Find, driven as a child does on an iPhone and an iPad (CDP
touch) and a desktop (mouse and keyboard): a wrong answer, Check, "Not yet"; change it (another option,
⌫ and retyped on the gold keypad, cleared and redrawn, Clear and reordered, a cell refilled, the tool
moved and read); Check, "Correct". Every target is measured where the finger lands: the element under its
centre must be the target, at least 44px (the letter keys, ten across like the phone's own keyboard: 44px
tall and at least 32px wide), not disabled, and no verdict is said twice on the card. Right and wrong
answers come from the row as the card draws it (`choice_right`, `data-accept`, `data-rule`, `cellsOf_`,
`DRAW_MARK.example`). essay and print are not driven (no machine mark). Port TYPES_PORT (22801);
registered slow in check-all. `--type=`, `--row=`, `--env=` narrow it.

What it found, and what was done:

- **choose1 / chooseN**: the lock above. Fixed.
- **A thin picture under the pen** (the number lines, 340x35, a 31px strip on a phone): the circles the
  scheme wants above the line had nowhere to go. `padRoom_` gives any pad picture under 0.3 high:wide room
  above and below (the library's figure is unchanged; parts that share it are still found by the
  original, `padUnderParts_`).
- **The measuring overlay was not on the picture**: positioned over the figure's whole box, its units
  were stretched against the drawing's; a reading was off by degrees. It now sits exactly on the
  picture's rectangle.
- **A band read with its unit** — "67°" against `65 to 69`, "8.7 cm" against `8.5 to 8.9 cm` — was marked
  wrong. `markRange_` keeps the band's unit; a reading with that unit or a degree sign is read inside it.
- The harness's own lessons, kept in it: a tap inside typed text puts the caret there, so ⌫ empties by →
  then ⌫; a capital is ⇧ only when auto-shift is not already on; a fraction is the fraction key then →;
  a finger's ring on a phone is drawn at 10px radius (the example's 7px ring is under the pen's dot);
  a shape's corners are held, which the pen straightens; an example stroke past the picture's edge is
  left out (a finger landing off the pad is a swipe).
- Accepted, printed, open: November 2019 Higher 1 Q4 (the scheme's example arcs swing to 421 of 340,
  below the printed figure); June 2024 Higher 1 Q13(a) by mouse (a held corner is straightened onto the
  grid and one bar lands 2 units off).

## Boxes edit like iOS

js/keypad.js, "EDITING LIKE iOS": a tap puts the caret where the finger is (it did; now proved); held
350ms the loupe (`#kp-loupe`, the box's drawing at 1.6x over the finger) comes up and the caret follows
the finger; the space bar held and slid is a trackpad, a character per 9px, and types no space; a double
tap selects the word, its two ends get handles (`.kp-handle`, 44px of touch) that drag that end; ⌫ takes
a selection; a mouse drags to select and → ← move. The swipe engine stands down while a caret or handle is
held (`kpBusy_` beside `padBusy_` in overworld.js) and a held finger's touchmove is refused so the
browser does not cancel the pointer. Typing always acts at the caret. check/types.js "editing" drives
all of it in a maths box and a worded box, by touch and by mouse.

## Vectors and "describe fully the single transformation"

A column-vector key (`!vec`, `KP_VEC_KEYS`, a row above the keys with − ( ) , °) appears on the pad
wherever the answer involves a vector or a transformation (`kpVec_`: vector, translat, single
transformation in the scheme or the words), on the letters and on the numbers. It inserts `⟮,⟯` with the
caret in the top; → goes to the bottom; ⌫ steps over its brackets and takes an empty one whole. The box,
the card and Saved draw it stacked (`vecHtml_`, called from `typeset_` and the worded box), and the Sunday
email the same (`digestTheirAnswer_`; backend stamps bumped to `2026-10-20-j-vector`).

Marking: `markWords_` now also reads pairs, vectors and lines with their signs (`mwShapes_`): `(5, -4)`,
`(5/-4)`, `⟮5,-4⟯`, "5 right 4 down" are one token; `x = -2`, `y = -x`, the x-axis likewise. A rule term
written `(5,-4)` or `x=2` asks for that token. 26 transformation parts were given rules a mark a point
(the word in its forms; the vector, line, or angle+direction; the centre): Q19 is `translation; (5,-4)`;
the two that had an `accept` of whole sentences lost it for the rule. check-marking has the cases.

## Printed sheet

The tag came from `needs_print`, left True on parts long since answerable on screen. It is cleared on
the 146 parts (P-STA excepted) that have `accept`, `mark_words`, `draw_answer`, `cells` or `choice_right`;
they now take their real interaction type instead of `print`. check-digest's Q7 tags follow.

## Measuring on the figure

`measTools_` gives a Maths part that says "measure" and has a figure a Protractor tile (an angle or a
bearing) and/or a Ruler tile (a length) beside Figure and Check — 7 parts. The tool is an overlay in the
figure's own units: one finger drags it, a second finger or the round handle (always on the picture,
never past its edge) turns it, a mouse wheel turns it a degree a notch; let go near a corner (14px) and
its centre or zero sits on it, near an arm's direction (8°) and it lies along it (`measGeom_` reads the
lines, polygons and straight paths). The ruler reads true to the paper: the longest line is as long as
the middle of the scheme's band (Q7(a): 33 units a centimetre, which is the paper's own drawn ruler). A
part whose words ran on to a second page turns back to the page with its figure. check/types.js drags the
tool 8px off the corner, turns it 5° off the arm, checks both snaps, reads the angle or length, types a
wrong reading and then the right one.
