# 1214 — The specifications, one place and one card

Owner, 12 Nov: "keep the spec for each subject of each exam board somewhere appropriate so students can see it."

## One place, one format (shared with the coverage branches)

- `data/spec/<board>-<code>.json`, one file per specification: `id, board, qualification, level, subject, code, url`
  (the board's official PDF), `sections: [{id, title}]`, `points: [{id, text, parent, links}]`. `parent` is a
  section id or another point's id, so the tree is as deep as the board's own numbering.
- `text` is the board's own heading or wording, cut to 140 characters; the PDF behind `url` is the full text.
- `links` lists the site's Find keys for that point: its lessons (`ct:<book>-<chapter>`), then up to four questions
  (`q:<row_id>`); `asked` is how many questions there are in all. `tools/coverage.js` writes both, by its own matching
  (a card's `spec_ref`, the point's `topics`, its `keys` or its own words in the question); nothing is hand-written.
- The coverage work's fields live on the same points: `keys`, `topics`, `figure`, `ht`, `retired`; a section's `topic` is
  its library label; `measured: true` marks the specs whose every leaf point must have a lesson (AQA GCSE sciences, 1MA1).
- `tools/specs.py <dir of PDFs>` re-reads the boards' PDFs (a GOV.UK page for KS1 maths) and keeps all of those fields
  and any point the coverage work added. Then `node tools/coverage.js` fills the links and writes `data/specs.json`
  (every spec file as one list, without the matching hints) — the index Find fetches with the library files.

## One folder (merged with the coverage branch)

The coverage branch had its own `data/specs/` (four specs, `title`/`topics`/`keys`/`figure`) and a `data/spec/maths-1ma1.json`.
They are folded into `data/spec/`: the coverage list held 4–31 headings per science spec the PDF reading missed (now
added with the coverage title), and its leaf points are exactly the spec file's leaves — so the measure is unchanged.

## In Find

Kind `spec`, labelled Specification, under Library (`KIND_UNDER`): Library › subject › Specification › board/level.
The card is the one template: tags (board, subject, level, the code as its name), then the insert's paper sheet with
each section a fold (`<details>`) and its points inside, then the card's row with Official (the PDF in `fileView_`).

## Depth per spec

Numbered specs (AQA sciences, maths, social sciences; OCR A-level sciences; Edexcel maths and Combined Science;
KS2 maths, reading and GPS frameworks) have point-level trees. The OCR humanities (J352, H472, H573, H567, J203,
H481) and Edexcel Greek list their components or themes only: their content is prose and tables, not numbered points.
Edexcel AS maths (8MA0) is included; AQA AS maths (7356) is not (the library has one paper of it).
KS1 maths (`sta-ks1-maths`) was added for the KS1 papers. No spec for the DVSA theory test or the board-less worksheets.
