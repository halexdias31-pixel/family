# 517 — past papers in bulk from the boards' own public pages

**Asked for as** "download past papers in bulk, for as many as you can, from the exam boards' own public sites" (AQA,
Pearson Edexcel, OCR, WJEC/Eduqas, CCEA if easy), GCSE and A-level, question papers with their mark schemes, imported
the way 415 imported the Edexcel papers. Statistics was left to the Drive import running beside it (fix-stats-papers).
The owner's order: English Literature first, then A-level Maths, Physics, Religious Studies, Psychology, Geography,
Further Maths, Philosophy.

## Where the papers came from

| Board | Reached by | What happened |
|---|---|---|
| AQA | each specification's `assessment-resources` page, listed in `aqa.org.uk/sitemap.xml`; the page carries every file's original name and its `cdn.sanity.io` address | papers and schemes 2017–2025, fetched one at a time with a pause |
| OCR | each qualification's `/assessment/` page: series headings and `/Images/…pdf` links | the public "examples", 2014–2025 |
| Pearson Edexcel | — | not taken: the past-paper finder is a JavaScript search over a third-party index; no page or file lists the PDFs, and guessed addresses redirect to a 404 page |
| Eduqas | a qualification's Past Papers tab (`/umbraco/surface/TabSurface/GetpastpapersTab`) lists `pastpapers.download.wjec.co.uk` files | reachable; not imported — its numbering (`3 2`, boxed) needs a parser of its own |
| CCEA | — | `ccea.org.uk` answers 403 to an automated request; left alone |

Nothing behind a login, a captcha or a robots rule was fetched. The PDFs were read with `pdftotext -layout` and deleted.

## How a paper became rows

Two parsers, outside the repository with the words (as 415's paper scripts are): AQA's boxed `0 1 . 2` numbering with
`[n marks]`, and OCR's `1 (a) (i) … [n]`. Each part's text is cut at its marks; the scheme is cut by the same ids, and its
block becomes the answer as `result — the scheme` (check-answers). A paper went in only when its parts summed to its stated
total (or past it, for a paper of options) and four in five parts found a scheme block (half, for essay papers). Rows go
through `tools/add-past-paper.js` exactly as 415's did: card in `data/questions.json`, words in `data-private/`,
`lib_pending: "True"`, the cover row carrying the board's own PDF as `source_url`. The words reach the Ledger as
`lib-import-*.json` files (under 800 KB each) through the Drive import (407).

- **A part that names a figure only the PDF holds is left out** (check-library's ceiling on "Figure not drawn yet");
  such a paper has no `total_marks`, so it is not summed. Drawing those figures (`tools/pdf_figure.py`) is the way back.
- **Maths is not here.** AQA's and OCR's maths papers set powers, fractions and symbols in fonts whose text layer reads
  `y ¼ 2 x 3` for y = 2x³; check-typeset refuses them, rightly. A-level Maths and Further Maths need 415's hand method.
- **English Literature** questions carry the text studied in `topics` (Macbeth, A Christmas Carol, a poetry cluster), the
  extract as the question's opening, and the scheme's indicative content as the answer; `answer_type: written`.
- AQA A-level Philosophy (7172) is filed under Religious Studies, where the library's philosophy book is. No board sets a
  GCSE Philosophy.
- The papers the library already held (AQA 2406 sciences, 8463 2306, RS 7062 Paper 1 and 2A) were skipped by id or by year.

check-library's subject and board vocabularies gained the subjects data/textbooks.json already spells, OCR and Eduqas,
and paper 7 (OCR H573/07).
