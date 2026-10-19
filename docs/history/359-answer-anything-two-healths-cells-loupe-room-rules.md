# Answer anything: two healths, fill-in cells, the loupe everywhere, room to write, marks by rule

The owner, 19 Oct: *"The biggest issue still with my website is whenever there's a question that requires
drawing or a worded answer. … I like how you implemented the ruler tool with magnifying glass. I need that
more universally applied. … when you have to write long equations on a vertical phone you don't have enough
space. … I want to limit ai marking and only use it when needed. The health checks need to be distinguished
too … one for faithful accuracy replication, and one for functionality to answer every question … For 1/2
mark worded questions you don't necessarily need ai but you could just have a formula which gives marks for
mentioning a word or two."*

Five pieces, one commit each.

## 1. Two health scores (js/library.js `paperHealth_`, `ableOf_`)

`paperHealth_` still returns `pct`/`band`/`fails` — that is **Faithful** (the paper reproduced: words,
pictures, marks, scheme, numbering, checked against its PDF; unchanged from 354). Beside it, `able` is
**Answerable**: the share of the paper's points whose part has a box the app gives it *and* a way to mark it
with no AI — `accept`, choices with `choice_right`, an order key, `cells`, or `mark_words`. A part answered
only on the printed sheet loses all its points (`input`); a part that can be answered but not machine-marked
(a drawing, a worded answer with no rule, a typed answer with no `accept`) loses 0.6 (`mark`). Same bands as
Faithful (Ready 98+, Usable 85–97, Rough). Both are tag-only finder facets (`health` labelled Faithful,
`answerable` labelled Answerable), the Health tile's note gives both percentages, and its sheet lists both
fault lists (`.faith-list`, `.able-list`). `check-health.js` prints `F` and `A` for every paper and a count of
answerable faults by reason; its fixture now also proves the Answerable fault.

Measured over the library (503 papers), first commit:

| | Ready | Usable | Rough | mean |
|---|---|---|---|---|
| Faithful | 300 | 147 | 56 | — |
| Answerable | 148 | 152 | 203 | 79.4% |

Answerable faults: 898 worded parts with no rule, 687 typed parts with no `accept`, 408 drawings, 368 on the
printed sheet only. 1st Class (Year 1) maths, 7 worksheets: Faithful 99%, Answerable 96% — their grids were
already split into one sub-question per blank with `accept` (place value, addition pyramids, missing digits);
what is left there is drawings (draw an octagon, a kite, match the shapes, a clock) and two "which coins"
answers with many right answers. Year 1–6 worksheets, 69: Answerable 92%. GCSE science, 20: 59%.

## 2. Fill-in tables (find.js `cellsOf_`, `cellsTable_`, `cellsBox_`, `markCells_`; tools/cells-tables.js)

A row's `cells` is its table's blanks in reading order: `;` between cells, `|` between ways, `-` a blank not
asked (a corner heading). The card's own table is drawn with its blanks as cells (44px, numeric keyboard where
every way is a number) when the count of blanks matches; otherwise the cells stand in a labelled row under the
question (`a = 6 ; b = 12`). Typing saves every cell joined through `ansStore_`; the Check tile marks each cell
with `markAnswer_`, colours each, says "2 of 3 cells right" or "Correct — every cell", and records right/wrong.
A row with `cells` gets no drawing pad. `tools/cells-tables.js` derives the cells from the table itself where
it is a times/difference grid and from the scheme where it is not: the four dice/times grids of 5-a-day,
the June 2017 graph-matching table, and the AQA physics table (P, I, P).

Only 23 failing parts in the library hold a table with blanks, and most of those are tables of data the
question reads rather than fills. The 113 failing parts with grid/table figures are nearly all transformations
and graphs to draw — a drawing on a grid, not a blank to fill. Answerable after 2: Ready 150, Usable 151,
Rough 202. **Not done:** marking a drawn transformation by its corners (the scheme already lists them:
"corners at (−4, −2), (−1, −2) …") — the next step for the grid worksheets.

## 3. The loupe for every stroke (find.js `padLoupeWant_`)

357 put the loupe up at once only for a placement on a fine grid and after a 300ms pause elsewhere. It is now
up from the touch for every stroke, every tool, every surface — figure answers, the made-up surfaces, the board —
112px above the finger (beside it near the top), following at the pen's frame. The pause timer is gone.
check/pen.js's coarse-grid case is now a freehand stroke with no pause: up at 130ms, follows ≥95% of frames,
gone after the lift.

## 4. Room to write (keypad.js `kpWideTile_`, `kpWideShut_`)

Every typed box (the answer bar and the essay sheet) has an Expand tile. It opens a sheet over the whole screen
above the keypad — upright or sideways, it is `position: fixed` to the viewport — holding the same answer under
the same key, at 1.35rem, wrapping line after line and scrolling with the caret kept in sight; Done puts the
answer back in the card's box. In the card a long maths answer now stops at four lines and scrolls with its
caret (`kpCaretSeen_` for maths too) instead of pushing the card taller.

## 5. Marked by rule before AI (find.js `markWords_`; tools/mark-words.js)

`mark_words`: points split by `;`, a mark each; ways by `|`; words that must all be there joined by `+`; a
number compared as a number (1,905 = 1905). Words match on stems (placebos = placebo), a phrase in order, and a
word straight after not/no/never does not count. A row with `mark_words` and no `accept` gets Check
("marked by its key words"); full marks is decided and recorded `rule:2/2`; less says "1 of 2 marks · by key
words — or mark it with AI" and only then shows the AI tile, if AI marking is on. `rule:N/M` joined `ai:N/M`
in `SUBMISSION_VERDICT` (backend; all four version stamps bumped) and in the Sunday email's marks.

`tools/mark-words.js` writes rules only where the scheme's headline is clearly a short naming answer: a 1–2 mark
short/explain/written part asking what/which/name/give/state/identify/suggest, not asking for a reason, whose
headline is one part a mark of 1–3 plain words (no digits, no yes/no, no "any other"). 70 rows (Biology 21,
Chemistry 22, Physics 18, Combined Science 8, Maths 1). Most worded 1–2 mark parts want a reason and are left to
AI; check-marking proves every library rule gives its own scheme full marks, and 16 right/wrong cases.

After all five: Answerable Ready 150, Usable 151, Rough 202, mean 79.6%, parts failing 2,361 → 2,285; GCSE
science 59% → 61%.
