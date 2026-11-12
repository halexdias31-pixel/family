# 1214 — The specifications, one place and one card

Owner, 12 Nov: "keep the spec for each subject of each exam board somewhere appropriate so students can see it."

## One place, one format (shared with the coverage branches)

- `data/spec/<board>-<code>.json`, one file per specification: `id, board, qualification, level, subject, code, url`
  (the board's official PDF), `sections: [{id, title}]`, `points: [{id, text, parent, links}]`. `parent` is a
  section id or another point's id, so the tree is as deep as the board's own numbering.
- `text` is the board's own heading or wording, cut to 140 characters; the PDF behind `url` is the full text.
- `links` lists the site's card keys (lessons, questions) taught or tested by that point. It is filled only from a
  coverage mapping, `data/spec-map/<id>.json` (`{ "<point id>": ["<card key>", …] }`); with none it is `[]`, never guessed.
  The coverage branches (GCSE sciences, maths 1MA1) write that mapping, keyed by these point ids, then re-run the tool.
- `tools/specs.py <dir of PDFs>` writes every file and `data/specs.json` (the index Find fetches with the library
  files). Re-run it, never hand-edit. Each spec's URL and how its PDF is read (numbered headings, table cells, contents)
  is in its `SPECS` row.

## In Find

Kind `spec`, labelled Specification, under Library (`KIND_UNDER`): Library › subject › Specification › board/level.
The card is the one template: tags (board, subject, level, the code as its name), then the insert's paper sheet with
each section a fold (`<details>`) and its points inside, then the card's row with Official (the PDF in `fileView_`).

## Depth per spec

Numbered specs (AQA sciences, maths, social sciences; OCR A-level sciences; Edexcel maths and Combined Science;
KS2 maths, reading and GPS frameworks) have point-level trees. The OCR humanities (J352, H472, H573, H567, J203,
H481) and Edexcel Greek list their components or themes only: their content is prose and tables, not numbered points.
Edexcel AS maths (8MA0) is included; AQA AS maths (7356) is not (the library has one paper of it).
