# 584 — Edexcel 1MA1 papers from the owner's Drive, questions only, awaiting their mark schemes

**Asked for as** importing the Edexcel GCSE Maths (1MA1) question papers the library lacked, from the owner's Drive folder,
**questions only — no mark schemes**, newest first, as many whole papers as one run allows. Pipeline as 415 and 521:
`tools/add-past-paper.js`, card in `data/questions.json`, words in `data-private/`, `lib_pending: "True"`, the words to the
Ledger as a `lib-import-*.json` file (`node tools/lib-private.js drive-pack`).

## What went in

Seven papers, 268 rows (parts and shared stems), each paper summing to its 80, into the empty covers that were waiting:

| Paper | Cover |
|---|---|
| November 2024 1F, 1H, 2F, 2H, 3F, 3H | `D-RS1786302107764-409` … `414` |
| June 2023 3F | `D-RS1786302107764-431` |
| November 2022 1F, 2F, 3F, 3H (second batch, 178 rows; P68720A, P68722A, P68724A, P68725A) | `433`, `435`, `437`, `438` |
| June 2022 all six (third batch, 231 rows; P66306RA 1F, P66305A 1H, P66304A 2F, P66303A 2H, P66380A 3F, P66381A 3H — 1H, 1F, 3F, 3H from the hash-named backups 29611431cb, 97e0be7de4, 574dbba869, 2b7dd549d1) | `439` … `444` |

The words were read through the Drive connector's text of each PDF (identified by its cover: P75157A–P75162A for
November 2024, P75151A for June 2023 3F) and typed as rows by a script outside the repository, as 415's were.

## No checked answer yet — `schemeOwed`

No part carries `answer`, `accept`, `cells`, `mark_words`, `draw_answer` or `choice_right`, and none is `verified`
(unverified is the field's absence: `verified` is a closed list of `True`, so "False" is refused by the schema). That
state is recognised by one rule, not per row:

- **check/schema.js `schemeOwed(row)`**: a question that is `lib_pending`, not verified, a past paper, and has no answer of
  any kind is awaiting its scheme. The fill-in rule (a "Complete the table" part must have `cells`) waits for it, since
  cells are an answer. Exported for any other check that needs it.
- **js/find.js `schemeOwed_(x)`**: the same state on the site. Such a part still gets its answer page, and the page says
  plainly *"No checked answer yet: this paper's mark scheme has not been added."* (`.qans-none`) with no Show tile. Its
  tags already read Accuracy unverified and Function unverified.

When a scheme is read, giving a part its answer (and `verified: "True"`) takes it out of the state with no other change.

## Figures — none drawn

Every part that needs the paper's picture says so in its words ("shown in the diagram", "on the grid"), so the existing
"Figure not drawn yet." line stands in. Where the PDF's text layer lost the mathematics itself (a stacked fraction or
surd that cannot be recovered with certainty — Nov 2024 2F Q20 and 2H Q1's calculation, 1H Q18a's f(x), 2H Q17 and Q19,
3H Q15, and the angles of 2F Q13), the part refers to the expression "shown in the diagram" rather than guess it.
Fractions and surds that could be confirmed from the question's own arithmetic were written out (1H Q10, Q16b, Q20;
2H Q22's 3/5; 3H Q14). `check-library`'s stem ceiling rose 658 → 670 → 682 for these papers' figure-naming stems (twelve a batch); since the third batch
it is a rule instead: **a stem whose every part is `schemeOwed` is not counted** (its paper waits for scheme and figures
together, so the backlog is that paper), and the ceiling is back at 658. November 2022's unrecoverable expressions
(1F Q26a, 3F Q17b and Q29b, 3H Q9b and Q22) are referred to the diagram the same way, as are June 2022's: 2F Q14(i);
2H Q8's calculation and Q19's g and h; 1H Q3's (and 1F Q25's) fraction of cars, Q18 and Q19; 1F Q15a; 3F Q5, Q15, Q17b
and Q19's fractions; 3H Q9a, Q13's vectors, Q16's formula and Q19.
Two "use your line of best fit" parts carry `uses: b` so the child's line is shown.

## Left

- November 2021 all six; November
  2020 (check against the May/June 2020 rows, 415 found 1H the same sitting); November 2019 3F (no cover row; 2H and 3H are
  already P-1MA1-1911-*); June 2019 1F/3F; November 2018 1F/2F/3F. The Drive folder holds most of them by plain name;
  the hash-named `past-papers-backup/…Higher…` PDFs are June 2022 and June 2023 Higher papers by their titles, not yet
  opened.
- Every imported part's answer, from its scheme, and the figures.
