# 375 — Every question part has an interaction type, and every type a protocol

19 Oct 2026. Builds on 359 (Answerable), 360/362 (Corbettmaths primary), 365 (GCSE Maths), 366 (drawn answers
marked by geometry) and 368 (one Check).

## What the owner asked

*"It might even be worth categorising and cataloging each type of question so we can have protocols for each type of
question."* The aim behind it: every question, especially the irregular ones, should feel familiar and easy on a phone
and a PC, be marked by machine, and carry no clutter.

## What was built

- **`js/qtypes.js`** (loaded after `library.js`, needs nothing else, so it runs alone in Node too):
  - `qType_(row)` puts every question part in exactly one of 25 **interaction types**: what the student has to
    produce. It takes a library row or a card item, which carries its row as `row`.
  - `QTYPE_PROTOCOL` holds one protocol per type, as data: the input surface, the tiles in order (Check last, once,
    per 368), how the part is marked, tolerances, what the student sees when wrong and when right, phone and PC
    specifics, and `need`, the fields a complete row has.
  - `qtIncomplete_(row)` returns the needs a row does not meet. `qtMachine_(row)` reads "machine-marked" the same
    way `ableOf_` does (359).
- **`js/check-qtypes.js`** is in the fast suite. It **fails** in three cases: a part with no type, a protocol with a
  field missing, or a 25-row fixture typed wrong. Everything else is a **report**: parts, % machine-marked and
  % complete per type, and incomplete parts per type in each collection. `--type=<id>` lists that type's incomplete
  parts and `--all` lists every one. A mutation (one branch returning an unknown id) fails it with each part named.
  The real files are green again.

## How a type is decided (first match wins)

1. **Options**: `choices` (2 or more): `order` if `answer_type` is order, `chooseN` if `choice_right` has 2 or more,
   otherwise `choose1`.
2. **Cells**: `match` when the words say match/join/sort/Venn, `label` for a labelling, otherwise `table`.
3. **Drawn**: `answer_type` drawing/annotate, or a `surface`. A drawing whose answer is typed in its box (it has
   `accept`/`mark_words` and no `draw_answer`, like a bearing) takes the box's type, because the pen is only the
   working (366). The order of tests:
   - Strong words first: match, complete the table, circle/tick the …, construct, hand, number line, graph/chart,
     lines of symmetry, transform/shape. A reflection is marked as `segs`, but it is a shape.
   - Then the `draw_answer` kinds (366), mapped to a type: `curves` → construct, `clock`/`dial`/`scale` → hand,
     `interval` → numline, `hist`/`box`/`pie`/`sketch`/`area` → graph, `cells`/`inside` → shade,
     `polygon`/`cuboid` → shape, `segs`/`line`/`pair`/`dir`/`radius`/`angle` → line, `pts` → points.
   - Then the weaker words: points, label, line.
4. **Worded**: `essay` (written/explain, 6+ marks, not maths). `measure` ("measure the length/size/angle …").
   explain/proof → `reason`. written of 2 marks or fewer, with no "explain/why/give a reason" → `words`.
5. **Typed, by `accept`**, in this order:
   - `rule: expr/eqn` → expr
   - `rule: mixed` → fraction
   - `(a, b)` → coords
   - several values (the same reading as `multiOf_`, 362) → multi
   - a fraction → fraction
   - algebra or an inequality → expr. A one-letter name joined to a number, letter or bracket counts as algebra;
     "fifty-four" and "6:18pm" do not.
   - a unit → unit. A one-letter unit (m, g, N …) must be spaced, so `3n − 1` is algebra and `6 m` is a length.
   - words → words
   - otherwise value.
6. **No `accept`**: `mark_words` gives words or reason. Reasoning words give reason. A printed paper gives `print`.
   Otherwise the scheme's own answer decides between words and value.

## The catalogue (8,010 parts, 19 Oct)

Machine-marked overall: 6,232 of 8,010 parts, **77.8%**. "Complete" means the row has every field its protocol needs.

| type | parts | machine | complete | protocol |
|---|---|---|---|---|
| value: single value | 2,829 | 88% | 88% | one keypad box; `accept` by value, bands, `x =` allowed; needs `accept` |
| unit: value with a unit | 1,364 | 100% | 100% | one box; unit optional unless √/π/rate; cm2 = cm²; needs `accept` |
| multi: several values | 169 | 100% | 100% | a box per value (362), ✓ moves on; set or `rule:` clauses; needs `accept` |
| fraction: fraction or mixed number | 324 | 100% | 99% | by value; `rule: mixed` where the form is asked; needs `accept` (+ mixed rule) |
| coords: coordinates | 73 | 100% | 100% | two boxes in brackets; ordered pair; needs `accept` |
| expr: expression or equation | 449 | 100% | 69% | maths keys with letters; `rule: expr/eqn` by value, a form question as written; needs `accept` + the rule |
| choose1: choose one | 622 | 97% | 97% | options as tiles, no Check; needs `choices`, `choice_right` |
| chooseN: choose several | 68 | 84% | 84% | options as tiles, the count said; needs `choices`, `choice_right` |
| order: put in order | 71 | 100% | 100% | slots between the two ends, Clear + Check; needs `choices`, `choice_right`, `order_ends` |
| match: match or sort | 13 | 77% | 77% | labelled cells (Venn regions, pairs); needs `cells` |
| table: fill table cells | 16 | 100% | 100% | the question's own table, blanks as cells (359); needs `cells` |
| label: label a diagram | 34 | 15% | 15% | the pen or labelled cells; needs `draw_answer`, `cells` or `accept` |
| words: short words (1–2 marks) | 291 | 70% | 70% | letter keys; `accept`, else key words; AI only after; needs `accept` or `mark_words` |
| reason: explanation or reasoning | 895 | 26% | 26% | letter keys; `mark_words`, a point a mark; AI last; needs `mark_words` or `accept` |
| essay | 277 | 0% | 100% | a sheet with a word count; AI against the scheme, clamped; needs `answer`, `marks` |
| points: draw point(s) | 12 | 42% | 42% | the pen on the figure; `pts`, 0.3 of a square; needs `draw_answer` |
| line: draw a line or segment | 54 | 54% | 54% | `segs`/`line`/`pair`/`dir`/`radius`/`angle`; needs `draw_answer` |
| shape: draw or transform a shape | 152 | 29% | 29% | `polygon`/`cuboid`/closed `segs`, `or` for part marks; needs `draw_answer` |
| shade: shade cells or a region | 12 | 83% | 83% | `cells` by ink inside each cell, `inside`; needs `draw_answer` |
| hand: set a hand or pointer | 7 | 71% | 71% | `clock`/`dial`/`scale`, read as rays (368); needs `draw_answer` |
| graph: plot a graph or chart | 186 | 27% | 27% | `hist`/`box`/`pie`/`sketch`/`area`/path; needs `draw_answer` |
| construct: compass and ruler | 9 | 11% | 11% | `curves` (arcs) and the line they make; needs `draw_answer` |
| numline: number line | 18 | 11% | 11% | `interval` (filled or open circles); needs `draw_answer` |
| measure: measure from a figure | 9 | 78% | 78% | a box beside the figure; a band, because a screen is not full size; needs `accept` as a band |
| print: practical or printed sheet only | 56 | 0% | 0% | nothing on screen; the protocol is to convert it to another type |

"Machine" counts a drawn part that is marked by its box (`mark_words`), so it can be higher than "complete" for a
drawn type. An essay is complete when the AI has a scheme to mark against.

### The two collections the owner named

- **Corbettmaths primary** (1,358 parts): 4 incomplete. 3 `reason` (Rosie's rectangles, words and figures 21 and
  21c, as 360 left them) and 1 `measure` (2D shapes 5b, "measure the longest side", which needs a full-size screen).
  Every drawn type there is complete (30 shape, 25 line, 6 shade, 5 hand, 4 graph, 2 points).
- **GCSE Maths F & H** (1,097 parts): 31 incomplete.
  - 25 `expr` with written ways and no `rule: expr/eqn`, e.g. 2406 1H Q6a `y = 3⁄2x + 3 | y = 1.5x + 3 | 2y = 3x + 6`.
    A student who writes `3x − 2y + 6 = 0` is marked wrong.
  - 4 `value` with no `accept`: 2406 1H Q6b and 1F Q25b ("a line parallel to M", which needs a "not this one" rule,
    as 365 says), and 1911 1H Q8 and Q8(ii).
  - 2 `fraction` "as a mixed number" with no `mixed` rule (2306 1H Q2, 2211 1H Q2a), so the top-heavy fraction is let
    through.

## Gaps, ranked by how many students they would reach

The repo holds no usage figures. The ranking puts the owner's two collections first, then the size of the gap.

1. **GCSE Maths `expr`, 25 parts**: add `rule: eqn` or `rule: expr` beside the ways (tools/answer-gcse-maths.py).
   Small, and it is the main past-paper set.
2. **GCSE Maths, the 6 others**: a `not c` clause for the parallel lines, `accept` for 1911 1H Q8, and `mixed` on the
   two mixed numbers.
3. **`reason` without key words, 661 parts**: GCSE sciences 398, 1st Class 139, A-Level 48, 5-a-day 44, SATs 11.
   This is the largest gap. 365's `mark_words` pass, run on the sciences, would close most of it.
4. **Drawn parts with no `draw_answer`, about 300**:
   - by type: graph 136, shape 108, line 25, numline 16, construct 8, points 7, shade 2, hand 2
   - by collection: 1st Class 148, 5-a-day 137, sciences 50
   - fix: `tools/draw-answers.js` (366), run on 1st Class and 5-a-day. Corbettmaths primary and GCSE already show it works.
5. **`value` with no `accept`, 330 parts**: 1st Class 148, 5-a-day 68, other 50, sciences 31.
6. **`expr` with no rule outside GCSE, 115 parts**: 5-a-day 66, 1st Class 46. Mostly "write an expression for …",
   listed in a few orders.
7. **`words` with no key, 87 parts** (sciences 75). **`print`, 56 parts** (A-Level 31, unextracted functions).
   **`label`, 29 parts** (SATs grammar "insert …", reaction profiles). **`chooseN` with no `choices`, 11 parts**
   (SATs "circle the three adjectives", which should be tap-to-choose).

## Not done

- **No `data-qtype` on the card.** The card is `questionCard_` in js/find.js, which another branch is working in.
  Adding it is one attribute once that work lands.
- **Nothing reads the types yet.** The finder, the health score and the card don't use them; that is deliberate for
  now. check-dead lists `qtIncomplete_` and `qtMachine_` as uncalled from the page (a note, not a failure). The check
  is their only reader.
- **The words-based typing is a heuristic.** Every part gets exactly one type, but a borderline part can land in a
  neighbouring type (a science "plot" is typed points where graph is meant). The protocol's `need` is the same for
  every drawn type, so the gap counts do not depend on which neighbour it lands in.
