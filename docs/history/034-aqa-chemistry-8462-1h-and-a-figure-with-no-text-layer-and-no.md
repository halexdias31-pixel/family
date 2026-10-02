## AQA Chemistry 8462/1H, and a figure with no text layer and no vectors

**44 questions against `Mark scheme (Higher)_ Paper 1 - June 2024`.** Cover total 100, margin boxes
10, 11, 8, 14, 10, 11, 15, 9, 12, and every intermediate the scheme prints inside its own working —
232, 168/232, 40 000 ÷ 160, 250 × 3/2, 2(347) + 5(498), 6(805) + 8(464), 3139 ÷ 8 — recomputed in
`tools/insert-aqa-chemistry-8462-1H.py` before a row is written.

**Figure 3 is a raster image inside the PDF.** No text layer, no vectors, nothing to extract — so
the gridlines were found by their own regular spacing, the scale fixed from them (2.5 °C and 0.10 g
per major division), and the eight crosses located as dark blobs. That is this file's own rule for a
picture carrying data, and **the mark scheme is what proves the scale**: it reads the crossing point
of the two lines of best fit as 0.8 g and 47 °C, and that lands exactly on the fifth cross.

**Two figures are drawn and the drawing IS the question.** 02.4 is *"plot the data from Table 1 on
Figure 1"*, so the picture it needs is the grid with nothing on it — and with the grid there,
`padSource_` lays a pen over it and the question can be answered on a phone. 04.1 asks for two lines
of best fit on Figure 3, so Figure 3 is drawn with its eight measured crosses and nothing else. The
library's drawable-question count went 8 of 139 to **10 of 141** — and the first version of
this paragraph said 12 of 143, a number I wrote down instead of reading off the run, which is
the fault this file records as "all 18 checks pass".

**And where a picture decides the answer but cannot be drawn, what it shows is in the question's own
words.** The blue patch by the negative electrode and the yellow by the positive; the four reaction
profiles and which way each arrow points; the three-carbon chain of propane. A question about a
picture you cannot see is not a question — which is the fault this file records under *"on the app
it's just text"*, one paper along.

### `tools/svgplot.py` — one plotter, because the third graph would have been the one that drifted

`axes()` was written inside the Physics 2H insert script and the Chemistry paper needed it the same
afternoon. **Two implementations of one thing is two chances to disagree about it** — this file's
sentence about `documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf` — so it is a file both
import. **The extraction was proved byte-identical**: the physics rows were regenerated through the
shared copy and compared cell by cell against what was already committed, which is how the one real
difference showed up. Adding `ymin` (Figure 3 starts at 20 °C, not 0) changed the minor-grid loop,
and `round()` where the old code had `int()` put one extra gridline 5px past the frame on a graph
that had nothing to do with the change. Same move as the `libraryExtras_` cutover: prove it
identical first, then make it.
