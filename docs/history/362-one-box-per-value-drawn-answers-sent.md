# One box per value; a drawn answer is sent; Corbettmaths primary walked part by part

The owner, 19 Oct: *"there are some questions which require multiple numbers for answers. currently it
seems youve made it so you must seperate each number with comma and space. this is less stable then
having an answer box for each. also i want you to make sure corbet maths questions for primary are all
done. some questions which require drawed answers allow you to draw, but not even submit."*

## One box per value (find.js `multiOf_`, `multiBoxes_`)

An answer of several values gets a paper box per value, side by side in the bar, wrapping. The count is
read off `accept`, nothing new in the data:

- a `rule:` with `count N` → N boxes; `set a+b/c+d` → one worded box per group;
- a `rule:` with no count (the coins that make £3.21) → one box, and a filled last box grows another;
- otherwise the first way's list: split at commas, and at "and"/"&" only between numbers or single
  letters (`36 and 48`, `C and D`, never "two hundred and nine"); a thousands comma or a sentence is not
  a list; `(3, -2)` gives two boxes in brackets, `x = 3, y = 2` two boxes labelled `x =` and `y =`.
  Every way that is a list must have the same count, or it stays one box.

The boxes join into the string the scheme writes (`multiJoin_`: labels and brackets put back), kept
under the question's own `ans:` key in a hidden `.qp-ans-in` first in the box, so Check, Send, the
verdict painters, the account sync and every saved answer are unchanged. A saved comma answer loads into
the boxes (`multiVals_`), and one arriving from another device fills them (`multiFill_`, answers.js).
`markAnswer_` also takes the values as an array. Order-free where the scheme is: lists were already
marked as sets (`markParts_`), rules as their clauses say.

The keypad: ✓ reads **next** in a box with another after it and moves there (`kpNextPaint_`,
`kpDone_`); the comma key moves to the next box too. Send on the last box marks.

195 library answers get boxes (72 in Corbettmaths primary). check-marking types each scheme's own list a
value to a box, joins it as the boxes do, and proves it is marked right.

## A drawn answer is sent (find.js `padSendRow_`, `pad-send`)

Every question answered by drawing alone — on its figure among the words, or on a made-up grid, axes or
blank space — has **Send · for marking** under the pen. Nothing drawn: "Draw your answer first". Drawn:
a submission `drawing · N marks · #hash` with verdict `sent` ("Sent — waiting to be marked"; signed out,
"Kept on this device — sign in to send it for marking"); the strokes themselves go up under their `pad:`
key as before. A mark added or taken away clears the line. There is no AI marking of a drawing (the
`aiMark` path takes text). check-flow: the two surfaces, and every drawing-only question in the library
(about 500) has Send.

## Corbettmaths primary, every part (1,358 parts, 71 worksheets)

| | before | after |
|---|---|---|
| machine-marked: one typed box | 1,136 (lists typed with commas) | 1,064 |
| machine-marked: a box per value | 0 | 72 |
| machine-marked: choices / cells / key words | 121 / 10 / 14 | 121 / 10 / 14 |
| drawn, sent for marking | 0 (73 drawn with nothing to send) | 73 |
| typed, sent to a person or AI | 4 | 4 |

check-flow walks all 1,358 in the real card: each has a tile that marks or sends it, and no more than
the 4 known parts are typed with nothing to mark them by machine.

Not machine-marked, and why:

- **73 drawings**: reflections and translations, lines of symmetry, drawing angles, triangles and
  quadrilaterals, plotting points, shading a fraction, scale arrows, clock hands, pie charts, nets,
  parallel and perpendicular lines. Determinate on paper, but marking needs the strokes read in
  the figure's own units (the paper's grids have no declared scale); 359's next step still stands.
- **2D shapes 5b** "measure the longest side": a screen is not full size.
- **Rosie's rectangles** (area 20) and **words and figures 21, 21c**: explanations no key word decides.
