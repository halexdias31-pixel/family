## AQA Biology 8461 Higher, and the paper that was in Drive under a filename naming no subject

**I told the owner Biology Higher was missing. It was there.** AQA names every subject's download
`Question paper (Higher)_ Paper 1 - June 2024.pdf`, so four subjects arrive under one filename and
Drive disambiguates them into `(1)`, `(2)`, `(3)`. **The unsuffixed copies are 8461/1H and 8461/2H
with both mark schemes**, and they were the first four files uploaded. What found them was not
reading the folder again: it was noticing that four of the thirty-two files had a byte size matching
nothing already transcribed, and then opening their covers. **This file's own rule — check the
metadata and read the front cover before reading a single page — is the one that works, and a
listing is what fails.**

**91 questions against AQA's own two schemes**, 100 marks each. The covers say 100 and the margin
boxes say 14, 14, 12, 12, 11, 8, 17, 12 and 8, 10, 11, 15, 14, 11, 13, 10, 8; both are asserted, and
so is every intermediate the schemes print — the cylinder length 499.363 nm and the magnification
×8010, the missing table value, 22 ÷ 60 × 100, both routes through the maize energy calculation
(46 000 ÷ 209 920 and 46 000 ÷ 12.8), 2200 : 4200 = 11 : 21, and 1/50 × 1/50.

### `blankgrid` moved to `tools/svgplot.py`, and the extraction was proved byte-identical first

**8461/1H Figure 1 IS 8461/1F Figure 6** — the same four cardiovascular diseases, the same blank
grid, the same bar for E already at 14%. That is the tier overlap this file already records for
chemistry, and the same move: one builder, imported by both, rather than a second set of
coordinates that can drift. **The committed 1F row was regenerated through the shared copy and
compared character for character before the local one was deleted** — 10,440 bytes, identical — the
`libraryExtras_` rule again: prove it identical, then make it.

### Both grids on Paper 2 are RASTER images, so they were measured in pixels

**`get_drawings()` returned nothing for either.** AQA sets these grids as images with no text layer
and no vectors, so the majors were found by their own regular spacing — the rule this file already
records for the chemistry Figure 3. Figure 4 is **8 columns by 7 rows** with the y-axis printed 0 to
70 in tens and the x-axis deliberately blank, which is where two of its four marks are; Figure 11 is
**14 by 6 with the zero line at column 7**, which is what its scheme's *"symmetrical around 0"*
means and is not something you can eyeball.

### A pedigree is DATA, and it is built from the facts rather than drawn

**Figure 10 carries six marks of the paper.** Twelve people, who is affected, who is married to
whom, who is whose child — every one of those facts is in the printed symbols, and 06.2 and 06.3
cannot be answered without them. So it is not artwork to describe: it is a table of twelve rows and
three couples that the SVG is generated from, which makes "the picture disagrees with the prose
under it" a shape that cannot occur. Same argument as the Corbettmaths fraction sheets, where the
sum and the words live in one table. The assertions are on the FACTS — only persons 1 and 6 are
filled, all three grandchildren are male, every child sits one generation below its parents — so a
coordinate typed wrongly fails in the writer rather than shipping.

**Everything else on both papers is artwork and says so.** A hoverfly beside a wasp, a peat bog in
section, a lettered body outline, a Petri dish, a variegated leaf, three photosynthesis curves, the
endocrine glands, and Figure 7 — which is the drawing the STUDENT is asked to finish. Each carries
`figure`, so the count went 699 → 711 rather than the prose hiding twelve.

**And Figure 3 is the phloem photograph AQA itself could not print**, on both tiers: *"Figure 3
cannot be reproduced here due to third-party copyright restrictions"*, with the journal named. The
row says what the figure is OF and `examiner_note` carries AQA's own sentence — the same answer this
file already gives for the AQA English insert and for 8461/1F.

**One answer shipped with a mangled string and a sweep is what caught it.** `1 in 50` had become
`1—44844—50` in the 06.4 answer — valid JSON, valid markup, no check anywhere could see it. Found by
scanning every non-ASCII character in the 93 new rows and looking at an em dash that sat between two
digits. Fixed in the script and in the file, because a repair to the data alone is the `cost: 0`
fault this file records four times.
