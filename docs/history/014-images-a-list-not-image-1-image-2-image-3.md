## `images` — a list, not `image_1`, `image_2`, `image_3`

**AQA's Paper 1 Question 5 is the case that asked for it**: the writing task offers a photograph as
one of its two prompts, and a question whose prompt is a picture is not a question without it.

**Numbered columns were the obvious shape and the one that does not scale.** Three of them would be
empty on 4,005 rows, and the day something needs a fourth is a schema change in the data, the
mapping, the renderer and the check. `topics` and `keystage` are already comma-lists for exactly
this reason and `asList_` has read them since before any of it — so `images` is one column holding
as many as there are, on a question row or a preamble row alike.

**`diagram` and `images` are different things and both stay.** `diagram` is inline SVG drawn here,
which takes the page's own ink and works offline; `images` is a list of addresses. A scan of an exam
page is one, a drawn Venn diagram is the other.

**Two shapes are addresses and everything else fails**: `http(s)://…` and `data:image/…`. A Drive
FILE page is named separately, because it is HTML and an `<img>` asking for it draws nothing — the
same spelling trap as the `.xlsx` ids in `check-tabs.js`. Proved on three mutants: two refused, one
counted.
