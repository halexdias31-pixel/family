# 524 — One tool row on every question part (round 3)

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
  On a phone (under 40rem) the eleven tools fold behind one Tools tile; Check stays out. *(Round 4, below: the row is
  now Pen, Ruler, Protractor, Compass, Photo of working, Magnifier, Read aloud, Lock, Check.)*
- **One marker** (`qtMarker_`, qtypes.js; `markerOf_`, qtools.js): choice_right, then cells, then draw_answer
  geometry, then accept, then mark_words, else the AI. The page's Check and the Function verified tag
  (`qtMachine_`) read the same function. With AI marking off, the AI's Check stays, unpressable, and one line
  says why — never a plain Send.
- **One keypad** that types anything (digits, letters, fractions, powers, √, π, units, signs, vectors); the
  part's type only picks the layer it opens on. An essay is the same box, bigger.
- **Every part has a drawing surface**: a drawn part (`qtDrawn_`) at once; any other on its first Pen tap
  (`PEN_OPEN`) or once it has saved strokes — its figure, else its stem's, else a grid. One canvas per card.
- **Options or cells are the answer** where a row has them: such a part's pen (and a stated `surface`) waits for
  its first Pen tap, as before; a table of cells in the question's words keeps its 44px cells when a tall card's
  words give way (`cardFigFit_`), which the extra row had made zoom them to 31px.
- **The keypad keeps the box's tool row above it** (`kpBox_`), so the Check under the box is never under a key.
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
- `check/pen.js`, `check/ruler.js`, `check/states.js`, `check/types.js`: tools are tapped in the card's row; on a
  phone the Tools tile is opened with a real tap first. `check/types.js` went from 377 faults to 170 (the base
  had 187, all of the same kinds) once the row was kept above the keypad and cells kept their size.

## Left

- ~~The AI does not yet see the pen's drawing~~ — done in Build B, below.

## Build B (29 Oct): the marker, and what the AI sees

- `markerOf_(x)` (qtools.js) is the one chooser: `qtMarker_`'s order — `choice_right`, `cells`, `draw_answer`
  (drawMarker_), `accept` (markAnswer_), `mark_words` then AI, else AI from the scheme. It also says `ready` (a key or
  scheme to mark against) and `how`, the one short line under Check ("Marked against the accepted answers").
  An AI part with no scheme has an unpressable Check and says "No mark scheme yet" instead of sending a request
  that can only fail (131 live parts at the time; check-answerable counts them).
- The AI Check sends `images`: the pen's drawing as a PNG (`penPng_`: the live pad's figure and ink, every line's
  computed look written onto a copy, drawn on a canvas on the card's ground) and up to three working photos. Only to a
  backend whose `features` list `aiMarkImages`; an older one is sent words only, as before. `aiMark` validates the
  pictures (one PNG, three JPEGs, each under `WORKING_PHOTO_CHARS`, refused whole), allows an empty box when there are
  pictures, keeps the daily cap, and tells Gemini which picture is the drawing. Photos are not kept by `aiMark`;
  "Mark my working" (`markWorking`) still keeps them for the student, their parents and the admin — never tutors.
- `tools/ai-draw-accuracy.js`: with `GEMINI_API_KEY`, every part with `draw_answer` drawn right (drawMarker_'s own
  example) and wrong (moved until drawMarker_ marks it down), rendered by the real `penPng_` in Chromium, marked by
  the real `aiMark`, agreement printed. Without a key: "skipped — no key". `--render-only --shots=DIR` writes the PNGs.
- `check-aiimage.js` (fast): the drawing and photo reach the request and Gemini's inlineData; bad pictures refused.
- Review A: the Grid choice reopens its surface after a reload and the first Grid tap on a blank grid gives axes;
  the pad's opening layer is the first accepted way's when there is one (`re | re-` opens on letters); the formula
  sheet is the brand tab's `formula_sheet` ("name: formula" a line) with the old list as fallback; check-answerable
  asserts each part's Check is its marker's, draws the pen surface for one part in ten (4m19s, from 7m47s).

## Review B (29 Oct)

- Options and order parts drew their mark as one flex line (`.qp-mark`, `flex-wrap: nowrap`): at 390px the row
  squeezed beside "Marked by its answer key" and an open Calculator was a sliver with keys over each other. Their mark
  is now `qp-compose`, as the typed box's: row, line, panel and verdict each a full line. `check/states.js` "a
  multiple-choice question, its calculator out" measures it (panel and row as wide as the mark, keys side by side).
- Photo of working on options, order and cells parts (828) opened the camera and showed nothing: only the typed box
  drew the `.qp-work` strip. All four boxes draw it now; check-answerable fails a photo tile with no strip of its key.
- check-answerable read the expected marker from the app's own `markerOf_`, so a wrong marker passed (a mutation
  handing every `accept` part to the AI stayed green). It now works the marker out from the row's own fields.
- `aiMark` took four JPEGs and no drawing, and trusted the drawing to come first; it now takes one PNG and at most
  three JPEGs, and puts the PNG first, as the prompt says.
- `penPng_` left out the Grid tool's overlay (CSS on screen) and any `<img>` figure; `penSvg_` now draws the overlay
  as lines between the figure and the ink, and the canvas draws `<img>` figures under it (without them if one taints it).
- `check/ui.js` never measured a question card: "the library still coming" empties the library, its expect missed, and
  a missed state skipped its `leave`, so every later Find state said "Q0664 is not in the library". Every way out of a
  state now puts it back. The first run that reached them found the Calculator's keys 40px wide at 320 (now each key's
  box is its whole cell, 44px), and ten question-page states in `check/states.js` that still describe the page before
  round 3 (a pen drawn before any tap, no box on a drawn part, Send in the bar, 30/39/40-key pads): left for rewriting.
- Not changed, for the owner: the Calculator on Non-calculator papers (the decided design says every tool on every
  part); 7 accepted answers using ≈ → … ∛ cannot be typed (fix-r2-marking owns `markNorm_`).

## Round 4 (29 Oct): the owner's row, and what the leftovers became

The owner, on the live site: *"There shouldn't even be a calculator button, there already is a calculator tool"*, then
*"get rid of that calculator button you made and grid button. the questions usually come with a grid and table button.
and formula sheet button. there's still two lock buttons."*

- **The row is nine** (`QT_TOOLS`): Pen, Ruler, Protractor, Compass, Photo of working, Magnifier, Read aloud, Lock,
  Check — eight fold behind Tools on a phone. Deleted: the in-page Calculator (`.qcalc`, `QCALC_*`, `calcHtml_`), the
  Grid tool (`qt-grid`, `QT_GRID`, `qtGridOf_`, the `qt-over-*` overlay and its lines in `penSvg_`), the Table
  (`qt-panel`, `tableHtml_`, the `table` field of the part record) and the Formula sheet panel (`FORMULAE`, the brand
  key `formula_sheet`). The Tools column's Calculator is untouched; a question that needs a grid or a table brings its
  own (its figure or blank surface under the Pen, its cells); a formulae sheet is an insert card in Find, as before
  round 3 (463: "they can open it in their 2nd finder"). The Grid choice that came back after a reload (Review A)
  went with the Grid.
- **Two padlocks**: a question card had `q-lock` (`questionTiles_`) and the every-widget padlock `game-lock` (498,
  `cardTiles_`). The padlock is now the row's Lock alone; `cardTiles_` leaves `game-lock` off a question.
  `check-answerable` fails any page of a question (card, stem page, first pages) with a tile twice, `game-lock` and
  `q-lock` counted as one: proven by putting either back.
- **No mark scheme, no AI Check**: an `ai` part with no `answer` (an importer's `examiner_note` is not a scheme, which
  is how Q-STA-KS2-2024-P3-10a had a live AI Check) has `ready: false` (`qtSchemeIn_`), its Check is `qp-noscheme`,
  which sends nothing and says "No mark scheme yet — flag it and we will add one" on the verdict line, as options
  with no key do; the line under the row says it before the press; `aiWanted_` no longer offers the AI there.
  check-answerable works readiness out from the row and presses the Check.
- **Working photos** is drawn by `workingMaySee_`'s rule (`workSeeTile_`): rank Admin, or a parent of the child —
  never a tutor, even with an `everyone` list in a kept payload. check-flow "Working photos is drawn …".
- **The question above the pad** (`kpStrip_`): on a phone a 44px strip over the keys carries the question's first
  two lines on every face; a tap lets go of the lift and scrolls the question's first line into view, the pad still up.
  check-flow and `check/states.js` ("the keypad up on a phone, the question's first lines above the keys, tapped").
- **The opening layer**: the accepted ways when there are any, `qType_` only when there are none (already so since
  Review A for "re | re-" and "HHH, HHT, …"); `qType_` reads a bold answer that is a formula as a value, so
  Q-9MA0-2406-P1-14a ("dr/dt = k/√r — for a constant k") opens on the maths layer. check-library names all three.
- **Every stored answer can be typed**: a third face, symbols (`KP_SYM`, `αβ` beside `123` on the letters): Greek
  letters, ≈ ≠ → ∞ … ∛ ~ ∈ ∪ ∩, { } [ ] _ !, a bar over a letter, ℤ ℝ µ. `check-typeable.js` reads the three faces
  as `kpPadHtml_` draws them, checks each reaches the others, and fails any accept with no written way the keys type
  (markNorm_'s spellings counted). Proven by taking ≈ off, and the `αβ` key away.
