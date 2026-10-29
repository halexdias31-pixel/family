# 520 — One tool row on every question part (round 3)

The owner's design, decided after the round 3 audit: **every tool on every question, same place, same order;
only the marker varies.** A human never marks; what no rule can mark, the AI marks.

## Before

At least fifteen deciders chose what a part showed: `ansBox_`, `orderIs_`, `cellsOf_`, `padWanted_`/`PAD_TYPES`,
`padSource_`, `answerKinds_`, `ansMaths_`, `ansEssay_`, `aiWanted_`, `kpSigns_`, `kpVec_`, `multiOf_`, `padTools_`
(with word patterns), `measTools_` (a subject rule), `qToolkit_`, and three admin switches (`pen-chosen`,
`meas-under-pen`, `meas-wordy`). `qType_` (qtypes.js) did not draw the page, so the page and the Function
verified tag could disagree. 1,955 parts were unmarked or sent to a person (`pad-send`: "Sent — waiting to be
marked"); a pen's strokes and a typed box were saved under two keys.

## Now

- **One page** for every part: words, figure or canvas, options (if the row has them), one answer box, the tool
  row, the verdict.
- **One registry** (`QT_TOOLS`, js/qtools.js): Pen, Ruler, Protractor, Compass, Grid, Calculator, Table, Photo of
  working, Formula sheet, Magnifier, Read aloud, Check — always drawn in that order inside the part's mark.
  On a phone (under 40rem) the eleven tools fold behind one Tools tile; Check stays out.
- **One marker** (`qtMarker_`, qtypes.js; `markerOf_`, qtools.js): choice_right, then cells, then draw_answer
  geometry, then accept, then mark_words, else the AI. The page's Check and the Function verified tag
  (`qtMachine_`) read the same function. With AI marking off, the AI's Check stays, unpressable, and one line
  says why — never a plain Send.
- **One keypad** that types anything (digits, letters, fractions, powers, √, π, units, signs, vectors); the
  part's type only picks the layer it opens on. An essay is the same box, bigger.
- **Every part has a drawing surface**: a drawn part (`qtDrawn_`) at once; any other on its first Pen tap
  (`PEN_OPEN`) or once it has saved strokes — its figure, else its stem's, else a grid. One canvas per card.
- **Calculator** (scientific, in the page, no network — arcade.js's engine) and **Table** (any part).
- **One record per part** (`partRec_`, key `part:<who>:<item>`, named from the answer's key): grid, table,
  calculator result and the AI's kept mark live in it; the typed answer and the strokes are read into it from
  the two keys that go to the account (answers.js and the server's ceilings are keyed that way). The old
  `aiMark:<ans key>` store is folded in once, the first time the part is read, and removed.

## Deleted

`PAD_TYPES`/`padWanted_`, `answerKinds_`, `padTools_` word patterns, `measTools_`/`measTiles_` and the subject
rule, `QT_WORDY_SUBJECT`, `qToolkit_`/`qToolTiles_`, `padSendRow_`/`pad-send`, the pen's own instrument tiles
(`pad-tool`), `kpSigns_`/`kpVec_` as gates, `workWanted_`/`workTile_`, the admin rules `pen-chosen`,
`meas-under-pen`, `meas-wordy`, the `print` question type, `AI_KEPT`.

## Checks

- `check-answerable`: every part in the whole library (`check/lib-full.js`) draws the twelve tools in the owner's
  order (written in the check, not read from the app), one answer box, and a surface on the first Pen tap.
  Proven by mutation: a row without Table, a Pen that opens nothing, a card with two boxes — each red.
- `check-flow`: the drawn-answer, stem-figure, AI-off, keypad, essay and sound journeys rewritten for the one
  row; "a drawn answer is never sent to a person"; the essay's kept mark proves the one-time `aiMark:` move.
- `check/pen.js`, `check/ruler.js`, `check/states.js`: tools are tapped in the card's row; on a phone the
  Tools tile is opened with a real tap first.

## Left

- The AI does not yet see the pen's drawing: a drawn part with no `draw_answer` asks for the answer in the box
  and treats the drawing and photos as working. Sending the drawing needs it rasterised and an image-taking
  `aiMark` (today only `markWorking` takes images); test against the 162 parts with `draw_answer`.
