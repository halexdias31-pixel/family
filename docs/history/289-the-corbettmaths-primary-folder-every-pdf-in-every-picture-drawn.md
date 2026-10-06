## The Corbettmaths primary folder: every PDF in, every picture drawn

The owner, 6 Oct: *"I want Corbett maths primary worksheets to be all done."* 281 had answered all
1,062 questions; what was left, found by comparing the bank against the Drive folder itself rather
than against itself:

- **Three sheets were never in at all** — Ordering Fractions (9), Angles in Polygons (5) and
  Reflections (9). Nothing in the library could know: a sheet that is missing has no rows to be
  incomplete. Found by listing the folder's 71 PDFs and matching each Drive id to a `source_url`.
  Read off their own pages, 13 drawings, answers worked and the polygons' sums checked twice.
- **"Area of a Triangle" rows 13–20 were "Area of Squares and Rectangles" Q13–20.** The triangle
  PDF has 12 questions. They moved to `W-CBM-area-of-squares-and-rectangles` ("Area of a Square / Area of a Rectangle", the cover's own title -- 1st Class Maths has a paper called "Area of Squares and Rectangles") (new ids — the old
  ones named the wrong sheet), and that sheet's Q1–12 were added from its PDF.
- **Ten questions described their picture in a sentence** ("The diagram is a circle cut into 3
  equal parts"). Drawn. The four that say *shade* are now `drawing`, answered with the pen on the
  picture as Line Symmetry Q10 is; they were typed counts only because there was nothing to shade.
- **Ordering Decimals and Ordering Numbers carried the answer boxes' labels in their words** —
  "…starting with the smallest 9.2 2.9 5.4 8.7 smallest", and Q9's last temperature at the start of
  Q10. The numbers were right and in the page's order; the words were rewritten from the page.

**How the PDFs were read:** the container cannot reach Drive directly, but the Drive connector's
download is written to disk when it is too big to return, as base64 JSON; `pymupdf` renders the
pages from there.

### And then every question, against its page

The ordering sheets were not the only ones: the text layer had flattened lists, sub-questions and
answer-box labels into one line on most sheets that were already "complete". Five readers took 13
sheets each (1,026 questions), rendered every page and re-solved every answer. 373 field changes:

- **Words** on about 320 questions: one `<p>` per line of the page, `(a)`/`(b)` split, box labels
  (`£`, `cm`, "smallest") and dotted answer lines taken out, the page's bold put back.
- **Four questions had no row at all**, merged into a neighbour: Roman Numerals Q6 and Q23,
  Decimals: Multiplication Q10, Order of Operations Q10. Added.
- **Wrong answers:** Money Q1, 4, 5, 9, 11 and 19 — their DIAGRAMS had invented coins and prices and
  the answers had been solved from the diagrams (Q1 said £2.07; the page's five 10p and five 5p are
  75p). Checked against the page by a second reader, the diagrams redrawn from it. Multiplying by 10,
  100, 1000 Q23, 24, 26, 27 answered fractions to decimal questions. 3D Shapes Q1 and Q4 had answers
  that only said "the sheet is needed" — now answered, and drawn.
- **Wrong reasons under right answers:** Metric Units (fourteen said "a metre is smaller than a
  centimetre"), Order of Operations Q5, 7, 8.

**Not done, on purpose:** `accept` was added only where a typed answer is one thing. A "write in
order" key would also tick the right numbers in the wrong order — `markParts_` compares a
comma-separated answer as a set — so ordering questions and the Using Calculations parts stay
marked by eye. Inequality Signs Q6's new `< > < >` key was taken back off: `check-library` showed the
marker could not read it.
