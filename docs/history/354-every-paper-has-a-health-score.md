# Every paper has a health score

The owner, 18 Oct: *"Can you add a health check to worksheets or past papers so we can know when we are
doing something whether it's low accuracy or buggy or missing shit or anything. Like 99% would be it's
practically perfect and ready to do. This is for work in the finder."* Then, over a first draft that
showed it to tutors and admins only: *"No, everyone can see the scores".*

## One function, two readers

`paperHealth_(rows)` in `js/library.js` scores every `paper_id` from the rows of `data/questions.json`.
The finder (`healthOf_` in find.js, memoised on `LIBRARY_ROWS`) and the owner's report
(`node js/check-health.js`, which loads library.js in a `vm`) both call it, so the number on a card and
the number in the report cannot disagree. Inactive rows are not counted (`libraryInto_`'s rule). A paper
with no question rows has no score: it is check-library.js's transcription queue, not a paper at 0%.

## The score

The share of the paper's points that pass. A question is worth its marks, or 1 where the paper prints
none. Each failure takes a share of its question's points, and two on one question compound
(`1 − Π(1 − share)`), so no question loses more than it is worth:

| fault | share | read from |
|---|---|---|
| no words | 1.0 | `html` and `lead` empty |
| no answer / no mark scheme | 0.5 | `answer`, `accept`, `choices` + `choice_right`; `explain`, `written`, `proof`, `annotate`, `drawing` need `answer` itself |
| needs a picture, none drawn | 0.6 | see below |
| picture described in words | 0.25 | the same, where the words carry `Figure:` — answerable, still not the paper |
| words are a stand-in | 0.5 | `placeholder` on the row, or on a preamble over it |
| no marks | 0.15 | where the paper prints marks (a stated total, a Past/Specimen paper, or any row with marks) |

And three about the whole paper:

- **marks add to X of T** — `T` is `total_marks`, or 80 for an Edexcel GCSE maths paper (`outOf` in
  check-library.js, the same two answers). Missing marks are missing points: they join the denominator;
  doubled marks are lost points.
- **Q4 missing** — a gap in the whole-number question numbers. Costs a question of the paper's mean
  worth, unless a stated total is already short (which then carries it).
- **not checked against its PDF** — no row carries `pages_checked`. That column says the PAGE COUNT was
  checked (resource.js labels it so), not the content, and no column says the content was. So it moves
  the score by 1 and nothing more: a flawless unchecked paper is `Ready · 99%`, a checked one 100%.

A picture is NEEDED when `figure` names one that is not an answer space (check-library.js's list), or
the words say `diagram`, `shown`, `table below`, `grid`, or point at a graph (`the graph`, `graph
below`) — "C is a graph with equation …" was a false positive on the first measurement. It is THERE
with `diagram`, `images`, an inline svg/img/table in `html` or `lead`, a preamble over the row that has
one, `uses`, a drawing question that only names a grid (the box is the grid), or `needs_print` /
`print_required` on a paper with a PDF.

Ready ≥ 98, Usable 85–97, Rough < 85, rounded down.

## In the finder, for everybody

- **The tag.** Every page of a paper's questions ends its tag row with `Ready · 99%`, `data-tag="health"`,
  in `--tag-health` (a muted sand at `:root`; the wheel is full). Added in `qPage_`, not `qTags_`, which
  check-funnel reads as the paper's own facts.
- **The facet.** `health` / Health, `tagOnly: true`, so `nextFacet` never asks it and no folder grows a
  tap. It is offered as a small labelled row under whatever question is asked (`healthDoor_`), only while
  it splits the list, using the ordinary `facet-pick` press. Its wrapper is `.health-answers`, not
  `.answers`: thirty checks read `.answers` as THE question, and check/states.js's year folder stopped
  measuring the first time the row was there.
- **The tile.** Under a chosen paper (`paperEnd_`), one `tile_` — `pulse`, "Health · Usable 87%" —
  opening a sheet: the score, the questions and marks, then one line per fault in the card's own
  reference (`Q2.1(i) — needs a picture, none drawn`, `Paper — marks add to 76 of 80`).

## The library, 18 Oct

503 papers scored: **Ready 300, Usable 147, Rough 56.** The worst are the two Greek listening papers
(23%, 24%: transcript stand-ins and no answers), the AQA English Language June 2025 Paper 1 (49%, its
source a stand-in), and Corbettmaths 5-a-day Foundation sheets whose shapes never came across (61%,
64%). Faults: 390 papers unchecked, 231 missing pictures, 168 stand-ins, 163 rows with no marks, 159
pictures in words, 140 with no answer, 2 number gaps, 1 marks total.

## Proved

check-flow, *"every paper has a health score …"*, as nobody, a student, a parent and a tutor, over two
fixture papers through the real loader: the tag on both, the funnel walked to the end never asking
Health, the row offering Ready and Rough, Ready leaving only Ready papers, and the tile's list being
exactly `Q2 — no answer`, `Q3 — needs a picture, none drawn`, `Paper — marks add to 76 of 80`. Each
broken in turn (tag off, row off, Ready not narrowing, `tagOnly` removed, tile off, answer test off,
a student refused) went red and green again on restore. check-health.js carries its own fixture and
exits 1 only when the scorer breaks (answer test off; Ready at 50) — never over a Rough library.
