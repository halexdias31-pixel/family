## A question reads in the paper's order, a figure is named as the paper names it, a long page is cut, and a done question is dated

**Asked for as** *"when a student does do a question, it should record the date they did it. currently
the questions are confusing … preserve order of question from exam while at the same time giving
diagrams and figures their own widget to ensure each widget is smaller than a phone screen."* and
*"evaluate how questions appear when there's multiple parts and a diagram … diagram widgets shouldn't
have a question number on them."*

### What was confusing, measured on the real library

A question is one row per **part**; a shared opening (a stem, `kind: preamble`) is a row the parts
point at. 776 question numbers have more than one part; 270 of those have a stem with words, **43 a
stem with a figure**, 76 a figure on one of the parts, 11 both. 139 parts hang from a stem figure, and 9
of them are asked to draw on it ("complete the Venn diagram above").

Every part was drawn as `[its card, its figure, its answer]`, and the card printed the stem while the
figure page gathered **every** picture the part hung from. So Q5 of the June 2022 Statistics paper
(stem + Venn, six parts) read: *"Of the 80 people…" + "is skilled,"* → Venn → answer → *"Of the 80
people…" + "lives in area B…"* → the same Venn → … six copies of the stem and six of the figure, each
figure a page **after** the part, headed `Q5(a) · figure`. In the paper it is Q5, the Venn, (a)…(f).

### What it is now

| | |
|---|---|
| **the order** | `pageParts_(x, prev)` gives a part `stemN` (the stem's words) and `sfigN` (the stem's figure) **in front of** it, then its card, its own figure, its answer. `prev` is the result in front in the strip: a stem the previous part already showed is not shown again. So Q5 → Venn → (a) → (b) … ; Saved and a part on its own (no `prev`) still get their stem |
| **the stem page** | `questionStemCard_`: `Q5`, no part, no marks, the tags, the stem in full ink (it was dimmed under a dashed rule because it used to sit above the part). "Figure on the next page" when its figure follows. The part's card no longer prints the stem |
| **a figure's header** | its own name, never a question number: `figLabel_` reads "Figure N" out of the words that introduce it ("Figure 3 shows…"), skipping the stems' names so (c)'s "use Figure 3 to complete Figure 4" heads its own drawing Figure 4; plain `Figure` where the paper numbers none (every Edexcel maths paper). No marks either |
| **a part drawing on its stem's diagram** | the stem's figure stays where it is in the order, and the part gets its **own** figure page with the pen on that diagram, because the pen's marks are keyed per part (`padKey_`). Nine parts; decided, worth a look |
| **the answer tile** | turns by answer − card in `pageParts_`, not by the answer's index, since pages can now stand in front of the card |

### Each page smaller than a phone

`check/cards.js` now builds **every page of every question** through the app's own `stuffCard` /
`stuffPart_`, in the strip's order, at **320 × 568 and 390 × 844**, and prints a count per page kind with
the worst of each (`--all` for every one). Before, after the reorder, after the cut:

| pages taller than the pane | before | stems on their own pages | and cut between paragraphs |
|---|---|---|---|
| 320 × 568 | **1,577** of 11,395 | 1,219 of 11,632 | **451** of 13,027 |
| 390 × 844 | **420** | 167 | **6** |

**The cut** (`htmlBlocks_`, `packBlocks_`, `stemChunks_`, `partChunks_`): only at top-level blocks — a
paragraph, a table, a list — never inside one, so a table keeps its header with its rows. By a weight
(characters + a line per paragraph/row/item), budgeted for 320 × 568 (`CHUNK_PAGE` 640, `PART_LAST`
300) and not by layout, because `stuffPages_` counts pages before anything is drawn and a cut that
moved with the window would renumber the pager when a phone turned. **From the end**: the card keeps
the ask and only what fits beside the box and tiles; the pages in front (`preN`, `Q2.4 · 1 of 3`, no
box, "Continued on the next page") take the rest. A long stem is `stemN`, `stemN-1`…; only its first page
carries the `lines` label. Tried 600/220: 451 → 383 at 320 for 756 more pages; not worth it.

**What is still tall** (451 at 320, 6 at 390) is mostly one block that cannot be cut: Corbettmaths and
1st Class Maths rows transcribed as one 1,000-character paragraph (`Q-1CM-probability-tree-diagrams-12`
+679px), long choice lists, the R0373 insert's single long paragraphs. Those are transcription fixes
(break the cell into `<p>`s), not this code's; the pane scrolls them (`paneReach_`).

### `Done 4 Oct`

When a **signed-in** person writes in an answer box, presses Check (right or not yet) or taps enough
options, today is stored at `done:<who>:<question key>` beside their answer (`ans:<who>:<key>`), and the
question card's header says `Done 4 Oct` after the marks (the year too when it is not this one). The
slot is always drawn and filled in place, so marking still moves nothing (261). Signed out records
nothing — that key is everybody. `localStorage` throwing (private mode): held for the visit
(`DONE_HELD`). **The last day, not the first.** Not sent to the sheet, because the answer it dates is
not: the answer box is a workbook on the phone. A `done` tab would let a tutor see it and follow the
student to another phone; that is a backend change (TAB/SCHEMA/WHERE + a doPost action) not made here.

### Checked, each proved by mutation and restored to green

`check-flow` gains three journeys: **the paper's order** (parts per `prev`, the strip's sequence, Saved,
the stem card's `Q3`, Figure 3 / Figure 4 / Figure, no `Q\d` on a figure, the tile's distance) —
red for: the stem repeated per part, a figure headed `Q3(c) · figure`, the tile counted from the first
page, the stem printed on the part; **the cut** (every word once and in order, the ask with the box, no
box on a pre page, a table whole, one huge paragraph whole, the stem's pages and its label, the tile past
pre pages) — red for: no cut, a cut inside a table, packing from the front, `lines` on every page, the
tile ignoring pre pages; **the date** (signed out unstamped, Check / tap / typing stamp it, the header the
same node, per person, private mode, another year) — red for: no stamp on Check, no fallback, a
signed-out stamp (which also turned 261's "nothing moved" red). `check/press.js` walks stem, stem-figure
and pre pages and fails a figure page with a question number; its tall-card swipe moved to a row that is
still tall. `check/cards.js` fails a stem on a part's card, a figure page with no picture or with a
question number (red on the old `find.js`: 1,193). `check/states.js`: the stem page, its figure, a long
part's first page, a dated card. Screenshots at 320 and 390 looked at.
