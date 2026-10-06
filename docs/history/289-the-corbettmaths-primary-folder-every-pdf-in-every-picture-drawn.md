## The Corbettmaths primary folder: every PDF in, every picture drawn

The owner, 6 Oct: *"I want Corbett maths primary worksheets to be all done."* 281 had answered all
1,062 questions; what was left, found by comparing the bank against the Drive folder itself rather
than against itself:

- **Three sheets were never in at all** — Ordering Fractions (9), Angles in Polygons (5) and
  Reflections (9). Nothing in the library could know: a sheet that is missing has no rows to be
  incomplete. Found by listing the folder's 71 PDFs and matching each Drive id to a `source_url`.
  Read off their own pages, 13 drawings, answers worked and the polygons' sums checked twice.
- **"Area of a Triangle" rows 13–20 were "Area of Squares and Rectangles" Q13–20.** The triangle
  PDF has 12 questions. They moved to `W-CBM-area-of-squares-and-rectangles` (new ids — the old
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
