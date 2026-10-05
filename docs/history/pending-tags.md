## Every fact about a page of a question is a tag, and SATs is one tag with the key stage beside it

**Asked for on 5 October:** *"why do the questions say non calculator but its not a tag? also the
marks should also be a tag. also the question numbers should also be a tag. also answers should have
the answer tags and questions have the question tag."* And: *"also why is ks2 sats one tag? it should
be sats. if they want to specify key stage then it should be its own thing. sats is one tag not ks2
sats."*

**What was on screen.** A gold header line (`Q4a`, `2 marks` hard right; `Q3 · answer` on the answer
page), then the tag row — `GCSE`, `Edexcel`, `Maths`, `Higher`, `2018`, `November`, `Paper 1` and a
GREY `Non-Calculator` pill cut from the paper's name — then an orange line `No calculator` (the row's
`needs`, `.qcard-needs`). The calculator was said twice and neither time as a tag of its kind; the
level read `KS2 SATs`, one pill for two facts.

### One row, at the top of every page of a question

`qPage_(x, kind, num, marks)` in find.js draws it, and every builder calls it — `questionCard_`,
`questionAnsCard_`, `questionFigCard_`, `questionStemCard_`, `questionStemFigCard_`,
`questionPreCard_`. It is the card's first block; nothing is above it.

| tag | kind (`data-tag`) | where |
|---|---|---|
| what the page is — `Question`, `Answer`, the figure's own name (`Figure 3`), a surface's (`Squared grid`) | `kind`, solid ink | first, on every page |
| the number — `Q4a`; `Q5 · 1 of 2` on a page cut from a longer one (one tag: "1 of 2" alone is not a fact about anything) | `number`, the paper's red | question, stem, lead-in, answer. Never a figure |
| the marks — `2 marks`; nothing where the row has none (absent is not zero) | `marks`, ink outline | question and answer |
| `SATs`, then `KS2` | `level`, both — the colour both funnel chips wear | where the level is SATs |
| the board, subject, tier, year, month, paper, what it is | as before | |
| the day it was sat — `sat Friday 10 May` (was the `.qcard-sat` line) | `sitting` | rows with `exam_date` |
| what to bring — `Non-calculator`, `Calculator allowed`, `Ruler`, `Protractor`… one per fact | `needs`, pale lemon | last |

**The calculator, said once.** `nameNeeds_` takes the calculator out of the paper name's qualifier
(`Paper 1 (Non-Calculator)` leaves no qualifier; `Section A: Non-calculator (September 2019
materials)` leaves the materials) and it joins the needs list `needsOf_` already unions from the
cover and the row. **Spelling, decided:** `Non-calculator` — the board's word on every Edexcel Paper
1 cover and the owner's own ("non calculator"), sentence case like every other answer;
`Calculator allowed` rather than `Calculator`, because a calculator paper permits one rather than
needing one, and a bare `Calculator` beside a paper's name reads as what the question is about.
`needsSay_` holds the two; the `needs` facet's `showOf` and the two `NEEDS_BUCKET` labels say the
same, so the funnel's answer, its chip and the card's tag are one spelling. The cell's vocabulary
(`Calculator`, `No calculator`, closed in check-library) is unchanged — it is how it is said.

**The colours** (style.css `:root`, after `--tag-topic`). `needs` is a kind in `TAG_OF` again, and
its funnel answers and chips wear it too. It was left out because it had been gold — the press
colour — and its answers looked pressed; a plain outline is the grey pill this was reported over.
Picked by looking at a Higher non-calculator card with four candidates side by side: a rose made four
reds on one card (`Q4a`, `Higher`, `Paper 1`, `Non-calculator`), a sky blue read as a second level, a
pale cyan as a second board, a full lemon was a step from gold. **Pale lemon `#f0f08a`.** The page's
own three spend no hue: `--tag-kind` is the ink, filled solid (a 16% tint was tried first and read as
one more grey pill), `--tag-marks` the ink outlined, and `--tag-number` aliases the paper's red on
purpose — it says WHICH one, as `Paper 1` does, and it is what the retired `Question` chip wore. The
app is dark only (a terminal); there is no light palette to keep in step.

### The date moved to the tile row, beside the star

The header held `Done 4 Oct` on the marks line. **Not a tag, decided:** a tag is a fact about the
question, the same for everybody; the date is a fact about YOU and the question, like the star. And
the tile row is 44px tiles tall whatever it holds, so marking still writes into a slot that is
already there and nothing moves (261) — as the last tag of a wrapping row, the first stamp could push
the row onto a new line and the question down under the finger that pressed Check. Drawn by
`questionTiles_` only where a date can be kept (`doneKeyOf_`: somebody signed in — the visitor the
star is drawn for).

### SATs is the level; Key stage is asked inside it, and only there

`levelOf_` reads `KS1 SATs`, `KS2 SATs` (the STA papers' `band_value`) and a bare `KS1`/`KS2` as
`SATs`; `ksLevel_` and `ksFallback_` say `SATs` for KS1, KS2 and Years 1–6; `LEVEL_BUCKET` has one
`SATs` row placing every old spelling. The data is untouched (the next import would write it back).
`satsStagesOf_` says which key stage — the school year first (Year 2 is KS1's), then the band or
level that names one, then every KS1/KS2 in the cell. The `keystage` facet answers that inside SATs
and nothing anywhere else: `KS1 | KS2` inside SATs, never `KS3 | KS4` inside GCSE. The bundle title
no longer drops the key stage where a level spoke (it can only speak inside SATs now: `SATs · KS2`);
a result's crumb says `SATs · KS2` (`levelSaid_`). Measured: Level answers `SATs (1375) | KS3 (18) |
GCSE (4784) | Functional Skills (24) | A-Level (620)`; Key stage is asked inside 1 of 10 levels.
`me.js` offers `SATs`, not `KS2 SATs`, as a qualification level (a saved `KS2 SATs` is kept).

### Checks, each proved by mutation (broken, red for the right reason, restored, green)

* **check-flow** — new journey *every fact about a page of a question is a tag in one row at the
  top*: question, answer, figure, stem and stem-figure pages of a Higher non-calculator question
  whose name AND cover both say it (row first; kind first; number; marks; none of
  `.qcard-top/.qcard-sub/.qcard-needs/.qcard-sat`; one `needs:Non-calculator`; the paper's facts the
  same on every page; no key stage on GCSE); a calculator paper says `Calculator allowed` once and a
  row with no marks has no marks tag; the needs facet's answer and chip say `Non-calculator`; a SATs
  worksheet (school year, key-stage cell) and an STA paper (`KS2 SATs` band) start `Question, Q1,
  [1 mark,] SATs, KS2` with no `KS2 SATs` and no board. Mutations: kind tag dropped (8 complaints);
  the name's qualifier left in (`Non-Calculator` back as a plain pill); number and marks on a figure
  page (also red in *a figure stands where the paper prints it*); the STA band read as `KS2 SATs`
  again; the `.qcard-needs` line drawn again.
* **check-flow**, updated to read the row (`pageHead`, `tagText`): figure order, the cut, surfaces;
  the date journeys draw the card with its tile row (mutation: slot back inside the card → *the date
  slot is inside the card* / *the tile row has no date slot*); the sameness journey treats the date
  slot as a person's, like the star.
* **check-funnel** — Level against Key stage: no level carries a key stage (`KS2 SATs`), Key stage
  answers exactly `KS1 | KS2` inside SATs and nothing inside any other level, and no SATs at all is
  a failure. Mutations: the band read as `KS2 SATs` (285 items fused, Key stage inside `KS1 SATs` /
  `KS2 SATs`); Key stage answered everywhere (`inside Level GCSE Key stage answers KS2 | KS3 | KS4`,
  A-Level, AS). Its SATs paper walk goes `Level · SATs` then `Key stage · KS1/KS2`.
* **check/states.js** — `six answers in` goes `Level · SATs`, `Key stage · KS2`; the stem, figure,
  grid, long-part and dated states read the tags and the tile row; new state *a KS2 SATs question,
  SATs and KS2 as two tags* (the May 2024 Reasoning Q1, which asks for a ruler). Mutations: kind tag
  dropped (stem, figure, grid, SATs states red); `.qcard-needs` back (SATs state red); date back in
  the card (dated state red).
* **check/states.js `a paper chosen`** — the card's sitting tags are `2017`, `June`, then the day it
  was sat with no year (mutation: the year left on the day tag → red).
* **check/cards.js** — its copy of the card draws the row (three page tags, `SATs` + `KS2`, the
  needs); its figure-number rule reads the row (mutation: number and marks on figure pages → 10+
  figure pages named). **check/press.js** — a figure page's head is its kind and number tags.

**Measured cost, and left as it is.** Every page now carries the needs tags (they were on the
question card only, as the gold line), and a stem or lead-in page carries `Question` and its number
as two pills where the header was one line. `check/cards.js`, base against this: question pages
taller than a 320×568 pane **440 → 488** of 13,270 (cards 330 → 315, stems 24 → 45, lead-in pages
84 → 119, figures 2 → 9); at 390×844 **6 → 6**. Every one is reachable (the pane scrolls and the
pager takes over). The cut's budgets (`CHUNK_PAGE`, `PART_LAST`) were not retuned: that renumbers
pages across the library, and is the owner's call if the 320 figure matters more than one row of
tags on every page.

**Screenshots** at 320 and 390 in the scratchpad's `build2/tags/`: a non-calculator GCSE question
(with `Done 4 Oct` beside the star) and its answer page, a calculator question, a part's figure, a
stem and its figure, a long part's first page, a squared-grid surface, KS2 and KS1 SATs questions,
an AQA paper with the day it was sat, a Functional Skills Section A, a Corbettmaths 5-a-day, a
practical (unchanged — practicals use the `.fc` head, not this row), the funnel with a
`Non-calculator` chip, and Level SATs asking `KS1 | KS2`.
