# Functional Skills maths — what is in, what is not

## In the library (2026-10-03)

| Paper | Booklet | Marks | Rows |
|---|---|---|---|
| Pearson Edexcel FS Maths Level 2, Practice Paper 1 (Sept 2019 materials), Section A, non-calculator | S64037A | 16 | `P-EDX-FSL2-PRAC1-A`: 1 document, 1 preamble, 6 questions |
| the same, Section B, calculator | S64039A | 48 | `P-EDX-FSL2-PRAC1-B`: 1 document, 6 preambles, 18 questions |

Inserted by `tools/insert-fs-maths-l2-prac1.py`, which asserts every answer and each section total.

## Still to do

- **The mark scheme.** It is not in Drive. When it is, check the computed answers against it. Then replace
  the worked answers on the rows that a person marks (A3, A4a, A4b; B1a, B1b, B3c, B7, B9b, B10b, B12) with
  the scheme's own wording, and give `accept` a band where the scheme prints one (the graph readings).
- **Two pictures need drawing.** One is the conversion graph (B Q1). It is a straight line from 0 l, 0 gal to
  100 l, 22 gal, with gallons running 0–25 up the side. The other is the scatter diagram (B Q3): heights
  0–1100 m, temperatures −15 to 10 °C, and the eight points listed on the row. Both carry `figure`, so they
  are counted in check-library's "picture never came across" line.
- **No other Functional Skills papers are in Drive.** Searches by title and full text for Functional Skills,
  FS, Entry Level, Level 1, Level 2, PRAC and the boards (Pearson/Edexcel, City & Guilds, NCFE, Highfield,
  Open Awards) found only the two booklets above. When Entry Level or Level 1 papers arrive, give them the band
  values `Functional Skills Entry Level` or `Functional Skills L1`. `LEVEL_BUCKET` already places both under
  `Functional Skills`. A new board (City & Guilds, NCFE, ...) needs adding to `exam_board` in check-library's
  VOCAB, with a reason.
- **Owner's call:** these are filed as `Specimen paper`, because a practice paper is not a sitting. See
  docs/history/pending-funcmaths.md for the one-line change if they should sit under Past paper instead.
