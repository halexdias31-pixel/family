# 1213 — The specification is what must exist (12 Nov)

Owner: "go through the resources, filling in resources where there aren't any, without arbitrariness, as objective as
possible, derived from first principles, with pictures where appropriate."

**The objective list.** A published exam specification numbers everything a student must learn. `data/specs/*.json` holds
those points (id, the heading as printed, `ht` for Higher only, `separate` for the triple-science-only points), taken from
the published PDFs: AQA GCSE Physics 8463 (91 points), Biology 8461 (97), Chemistry 8462 (124) at the deepest numbered
heading, and Edexcel GCSE Maths 1MA1 (97, N1–S6, each named by the library's own topic labels). `figure` on a point lists
the words in that point's own text — diagram, graph, draw, sketch, apparatus, label, structure — so "needs a picture" is
read off the spec, not chosen. "Key ideas" sections and "draw conclusions" are not points or pictures.

**The mapping.** `tools/coverage.js` writes `data/coverage-health.json`, which `tools/health.js` reads as three rules in a
new *Library content* part: spec points with a lesson, spec points with practice questions, lessons with a figure where the
point needs one. A lesson is a content card naming the point in `spec_ref` (the practicals' and projects' column), or, for
maths, a card wearing one of the point's topics. A question covers a point by `spec_ref`, by topic (maths), or — on its topic
or untagged — by containing the point's heading words (three in five for long headings) or one of the point's `keys`
phrases where a heading is too general ("Newton's Second Law" → "resultant force acceleration"). Practice needs the
private question words, so without `data-private/` the last measure is kept.

**The lessons.** One content card per science point (books `TB-AQA-8463/8461/8462`), always the same shape: the definition
as its key word(s), then Explanation, Worked example, Common mistake, Check (with its answer) on the worked page, formulas
where the point has them, and an SVG on a new Diagram page (`diagram`, a private field of `lib_content` like the
practicals') where the spec asks for a picture. `coverage.js` refuses a spec card not in that shape; `check-textbooks`
holds spec cards to one key word and 400-character lines, since a lesson line is a short paragraph, not a worked line.
The words go to the Ledger by Drive import; the backend must be deployed first (`diagram` is new in `LIB_FILES`).
