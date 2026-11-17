# tools/content.js — the one content pipeline (owner, 17 Nov)

Every past paper, mark scheme, figure, insert and library card comes in through one command:

    node tools/content.js <what> [--stage a,b] [--out <dir>] [--ledger <dir>]

`source → spec → parts → figures → keys → card → import`, in that order; `--stage` runs some of them, on what the earlier
ones wrote to `data-private/specs/<name>.json` (words: never in git). `node tools/content.js help` lists them.

| stage | does |
|---|---|
| source | the PDF, the zip (unpacked into `data-private/sources/`), the Drive file the cover names |
| spec | the paper as rows, from a transcription module (`emit.py`), a spec file, or `library:<paper_id>` |
| parts | the question shape: `kind`, `question`/`part` from the row id, `marks` as text |
| figures | `figure_from` {pdf, page, clip, label} → `tools/pdf_figure.py`; `figure_script` → a figkit script's SVG; `diagram_twin` pointed at its PNG |
| keys | `scheme` {answer, accept, mark_words, …} onto the row's own fields — left as data, never interpreted here |
| card | the family's card fields from `data/settings/content.json`; the inserts it is sat with; the qualification list |
| import | `data/questions.json` + `data-private/questions.json` (and a paper's own insert in `data/inserts.json`), each row where it was; `--out` writes elsewhere; `--ledger` writes the `libImport_` file |

## Adding a new paper

1. Its family (paper_id prefix) in `data/settings/content.json`. A new board or qualification is a new row there —
   board, qualification (its label in `data/settings/expected-papers.json`), the card fields every row carries,
   optionally `cover` (cover fields its parts carry) and `specs` (a glob of its modules). No code.
2. A transcription module: a Python file exposing `ROWS` (document row first, then preambles and questions), or a
   `tools/content/paper.py` `Paper` as `P`. Words are private: keep the module beside the PDFs if it holds a whole paper.
   A figure is `figure_from` (a PDF clip) or `figure_script` (`tools/<x>.py` on figkit); a paper's own insert is a row
   with `kind: 'insert'`.
3. `node tools/content.js <module.py> --out /tmp/x` to look; then without `--out`. The schema (`tools/lib/library-schema.js`)
   refuses, writing nothing, a row problem the paper had not got.
4. `node tools/diagram_png.js` if the figures stage said some are to draw; then `node tools/content.js library push`
   (or `--ledger <dir>` and the owner's Drive folder).

## What it replaced (rule 1.76)

`tools/add-past-paper.js` (import), `tools/paperspec.py` (now `tools/content/paper.py`, board-free), `tools/lib-private.js`
(now `tools/content/library.js`, run as `node tools/content.js library …`), `tools/aqa7408/write.py` and `tools/cbm5ad/write.py`
(per-board writers with their own checks), and the one-off writers `insert-ks1-2026`, `insert-fs-maths-l2-prac1`,
`insert-aqa-biology-8461-2H`, `add-aqa-8464-2406-higher` (now modules in `tools/content/specs/`) and
`add-aqa-english-skeletons` (applied; gone). The backend's `libImport_` and the Drive/zip import stay: they are where the
import stage's `--ledger` file lands.

## Re-run against the library (17 Nov)

`library:<paper_id>` for all 250 papers of AQA 7408, OCR J247, Edexcel 1MA1 (both id schemes), STA KS2, plus
AQA 8461-2H, AQA 8700 (with its insert), R0373 (figure + insert): cards, words, figures' twins and inserts identical, except
these fixes: 9 cards' `lib_has`/`function_verified` re-derived from words in `data-private/` newer than the card (an `accept`
added after the last split), and 1 word map's fields in the definition's order. Not committed.

The transcription modules lag the library: fixes since (typeset fractions, choices, accepts, twins, topics) went into
the data, not the modules, so a module re-run differs and its import is refused. Re-run those papers as `library:<paper_id>`
until a module is brought up to its rows.
