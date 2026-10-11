## The paper's own figure is the answer box's other face too: every question answered by drawing has Draw on its card, and every figure page is a picture to look at

**The owner, 11 October**, asked whether the 470 questions drawn on the paper's own figure (or a stem's)
should get the same Draw switch on the answer box that the 62 made-up surfaces got the day before (327):

> *"You decide best for paper figure thing. I just want simplest and most uniform"*

The request it answers, 10 October, over the KS1 hexagon (327): *"this is confusing. theres an answer box
and draw box? in questions which require a drawing, just leave it as an answer box like before but theres
an option to switch to drawing box. this makes more sense and is more uniform."*

### What was wrong

After 327 there were two ways to answer by drawing. A question on a made-up surface had the box on its
card and a `Draw` tile that turned it into the grid in place; a question drawn on the paper's own figure
had the box on its card **and** the pen on its figure page, a swipe away, with nothing saying which one
counted — the hexagon's two places again, one kind along. 327 left them alone because *"like before"*
could be read either way, and wrote the question down for the owner ("Not fixed, a question for the
owner"). The owner left the choice to the build (*"You decide best"*), asking only for the simplest and
most uniform; the rule here is the one anyone can state now:

**A question you answer by drawing has a Draw tile on its card. A picture the paper prints has its own
page, to look at.**

### Counted

Through the app's own `padSource_` over all 8,006 questions: **470** paper pens — 386 on the part's own
figure, 84 on a stem's (50 stems: 21 serve one part, 24 two, 5 three) — **62** made-up surfaces (43 blank,
19 squared, 0 axes), and **12** passages to ring words in, which have no pen and did not move. All 470
figures are inline SVG drawn by the site; none is a photograph. The Resources finder carries no
questions and no pen. Nothing shows a child's drawing to a tutor or an admin, or prints it (the answers
tab has no such view, `backend/constants.gs`); the only readers of `pad:` are the pen and answers.js.

### What changed

| | |
|---|---|
| **one gate** | `drawTile_`, `ansArea_`, `padFaceTile_` and the `q-draw` handler ask `padSource_` — any pen — where they asked `surfaceOf_`. The four cannot disagree about which questions have two faces. `surfaceOf_` stays, as "is it made up". |
| **the card** | The box exactly as any question's, and `Draw · on the figure` in the row under the card. Draw rewrites the answer area in place to the figure under the pen; `Type` brings the box back. No repaint, no page change, every copy (Find and Saved). On the **same `pad:` key** the figure page used (`padKey_`), so every drawing already made is on the card and still rides the answers tab (308); a drawing with nothing typed opens the card on the drawing — 327's rule, so children who drew on a figure page before today open on their drawing. |
| **the credit** | The drawing face carries the figure's own credit (`FIG_BY`, "drawn for @family. from the paper's own figures…"), as the pen did on the figure page — never "Not the paper's own figure", which is the made-up surface's line. Run on with "Saved to …" as 327's small print is, so it ends in a full stop here: the first screenshot read "…is not reproduced here Kept on this device only". |
| **the figure page** | Stays, where the paper prints it, as every question with a figure has one — the picture to look at, credited, with **no pen**: no lock, Undo, Clear, Ruler or Compass. `questionFigCard_` draws `usesFig_` (an earlier part's marks, read only) or the figure. `padWrap_` is now drawn by `ansArea_` and the whiteboard and nothing else. |
| **stem pens** | The 84 parts drawn on a stem's figure had a figure page of their own that was the stem's picture again under that part's pen (`questionHasFig_`'s third clause). With the pen on the card it only repeated the stem's page, so it went: a stem-pen part has no figure page, as the paper prints it; each part's Draw shows the stem's figure under its **own** key. |
| **where the figure stands** | `partPlan_` had a row of its own for a pen question with no marker: the card, then the figure to draw on — *"you read what to draw before the thing you draw it on"* (270). That was the pen's page; it is on the card now, so a pen question is laid out as any other. 131 of the 386 moved their figure in front of their card (and gained the Figure tile any part with a figure in front has); the 198 whose rows mark the figure at the end keep it after the card, by the data, with "Figure on the next page". |
| **use your graph** | `usesPage_` skipped the page in front of a later part whose own pen was on the same picture, "because the marks are under its pen" — a page away when the pen was on the figure page, nowhere on a card that opens on its box. Now only a part whose own **figure** is that picture skips it (its figure page shows the marks, read only); the 3 stem pens that use an earlier part get the page in front, and their Draw shows the earlier marks fainter under their pen, as 327 did for surfaces. Its other rule — "not a page the strip has just shown", in front of a part straight after the earlier part's own figure page — went too: that page held the earlier part's pen with the graph on it; it is the paper's picture with nothing on it now. |
| **the pointer** | "Figure on the next page" is the card's words and is not redrawn by Draw; on the drawing the same figure is right under it, so it is hidden while the card is on its drawing (`.qcard:has(> .qp-area.is-draw) .qsheet-figref`). |
| **ink** | The figure classes (`.lbl .num .ax .axis .grid .pt .coin .tag .cap`) were inked only inside `.qsheet` (and `.gd`); 327 added `.qsurf` to three of them. `.qp-area` is in all nine now — without it a Venn diagram on the card is unlabelled circles and a number line's numbers fall back to the pen note's coding font. `check-css.js` holds every figure-ink rule to naming it. |
| **the note** | `Draw · on the figure` over the paper's own picture; the surfaces' table would have said "a blank space" over the paper's grid. |
| **the store** | `surfaceFace` keeps its name: renamed, every face already remembered would be dropped on the day of the deploy, for a word. |

### Fit, from the census and from screenshots

327's `padFaceFit_` shrank a made-up square: `fit = w - by - 4`, a square's width being its height. The
paper's figures are anything from a 35-unit number line to the transformations-of-graphs stems at 340 by
640 (1.88 times as tall as wide). Now, for the paper's figure:

- **its own shape**: the width that takes `by` off the height is `w * (h - by - 4) / h`;
- **words first**, to `PANE_ZOOM_MIN`, then the figure — a figure carries labels at the paper's scale and
  the finest graph paper in the library is 2px squares at 320; a blank grid carries none, so a made-up
  surface keeps 327's order (grid, then words);
- **the same floor**, `PAD_FACE_FLOOR`, 180px wide: labels at 6.9px on every screen. A legibility floor is
  a fingertip's kind of number, in px;
- **the face on the glass at once**: narrowed further only so the figure, its bar and `Type` all fit the
  pane — a card that still scrolls opens at its foot, which is only any use if the figure's top is there;
- never the tiles, never the card drawn smaller whole, scroll from the first pixel — 327's rules.

**The floor was chosen by looking.** The census put 174 of the 470 over at 320x568 with the figure at its
page's size and the words at 0.7; measured on the built card (words first, the pointer hidden) it is 90.
Screenshotted at 320x568, the figure kept at its page's size, at 0.9 of it, and at 0.8 (= 180px at 320):
Nov 2022 2H Q11 (a cumulative frequency graph on 2mm paper, the finest grid), AQA A-level Physics Paper 3
2023 Q1.6 (the densest, 223 elements), AQA Chemistry 2024 2F Q1.9 (axis labels the smallest), AQA Biology
2024 1F Q7.7 (a tall bar-chart grid) and transformations of graphs Q2 (two stacked graphs). At 0.8 every
one of them was still read and drawn on — the grids' squares visible, the labels small but legible at a
phone's density — and shrinking fewer than all saved little: a card that scrolls anyway is a smaller
figure and a scroll. The owner's own word on the trade: *"I don't like scrolling. If you need to leave
things more compact or smaller font."*

| 320x568, all 470, Draw pressed | at the page's size | 0.9 of it | 180px (chosen) |
|---|---|---|---|
| cards that scroll | 90 (max 104px) | 53 (max 95px) | **33** (median 29px, max 90px) |
| figures drawn smaller | 11 (only for the glass) | 90 | 90 (64 under 0.9) |

**After, every one of the 470, Draw pressed through its own tile in the real Find strip**
(scratch sweep, not committed):

| | 320x568 | 390x844 | 1280x800 |
|---|---|---|---|
| a tile under 44px | 0 | 0 | 0 |
| `Type` outside its pane, or a press at its centre and at 90% not landing on it | 0 | 0 | 0 |
| a card drawn smaller whole | 0 | 0 | 0 |
| the figure not wholly on the glass | 0 | 0 | 0 |
| cards that scroll (opened at the foot) | 33 | 0 | 0 |
| words drawn smaller (at 0.7) | 220 (165) | 4 (3) | 18 (10) |
| figures drawn smaller | 90 | 3 (all at 0.97 or more) | 8 |
| figures under the floor | 3 — the transformations Q8 trio, 179px, for the glass | 0 | 0 |
| smallest label (13-unit labels, p10) | 6.9px | 9.0px | 9.7px |

Every card opened on its box with `Draw · on the figure`, turned to `Type · the answer box`, stayed on
its page, drew on its own `pad:` key, carried its credit and never "Not the paper's own figure".

**Worth a look:** the Figure tile and Draw side by side, on a box whose figure stands in front (131 moved
there): the Figure tile opens the picture over the box, which is what it does for every part with a
figure in front, and Draw turns the box into it. Each follows its own rule, and the row looks like any
other — but it is the one place two tiles both offer the figure.

### Checked

`check-flow` — a new journey over REAL rows (June 2024 1F Q7, the review's own example, and the bearings
sheet's Q2 whose map (a), (b) and (c) are drawn on): every page of every one with the cards on their
boxes carries no pen; the figure page draws the figure and its credit; the stem's map is its page once
and no part has a figure page of its own; the card opens on its box with `Draw · on the figure`; a
drawing seeded under the key the old figure page used opens the card on it, on that key, over the
paper's own grid, credited with a full stop and never "Not the paper's"; a stroke there is stored under
it; Type and Draw again; each of the stem's parts draws on the map under its own key; Saved's pages carry
no pen and Draw on Find's copy turns Saved's; Draw in the real strip moves neither the page nor the page
count; a drawing made signed out moves to the child who signs in, and the card opens on it. Rewritten to
state the new rule: the surface journey's paper-figure section, use-your-graph (the pen taken from the
card's drawing face; (ii)'s figure page shows (i)'s cross read only; straight after (b)'s own figure page
(c) still gets the page; a stem pen using (a) gets the page and the faint marks under its own key),
every-control-is-a-tile (Q8's Ruler and Compass on its card, no figure page with a pen), where-a-figure-
stands (a pen question laid out as any other), the multipart answer swipe, the surface-choice journey
(an own figure's page has no pen; its Draw is that figure), no-keyboard (a paper figure switched to its
drawing: no field, a pen), the email words (a part pen and a stem pen both still "(picture on the site)").

`check/states.js`: Q7 on its box with `Draw · on the figure`; switched to its figure under the pen (its
own grid, its key, pen off, Type, the same page); its figure page with no pen; bearings Q2(b)'s map under
its own pen with no figure page of its own; the transformations Q8 stem switched at every width (every
tile 44px, Type hit, nothing smaller whole, the whole figure in the pane, and a narrowed figure no
narrower than the card needed); AQA Chemistry Q1.9 switched, given way to the floor and no further. The construction (Nov 2019 1H Q4) enters on its card through Draw.
"A diagram you can draw on", which turned to the figure page for its pen, is replaced by them.
`check/press.js`: the line of best fit's five gestures are asked of May 2017 1F Q6(i)'s card after a
real touch on its Draw tile. `check-css.js`: every figure-ink rule names `.qp-area`.

### Mutations

Each applied alone to a copy of the tree, each red, the real files green after (the four parts of
`check-flow`, the states at 320, 390 and 1280, `check-css`):

| mutation | went red |
|---|---|
| the figure page keeps the pen (`padWrap_` back in `questionFigCard_` for a part's own figure) | five journeys: the paper-figure journey ("Q7#fig carries a pen", "the strip draws 2 pens"), the surface journey, use-your-graph, every-control-is-a-tile, the surface-choice journey |
| no Draw on a paper figure (`drawTile_` gated on `surfaceOf_` again) | the paper-figure and surface journeys (the tile reads nothing -- no Draw at all) |
| a stem's part drawing under another key (the stem's) | the paper-figure journey: "(b) draws on pad:S-Q-1CM-bearings-2", "(b)'s map carries (a)'s stroke", the signed-out drawing under the wrong key |
| the old key not read (the face on a new `face:` prefix) | the paper-figure journey: "the drawing from the old figure page has 0 strokes on the card" |
| the fit floor removed for paper figures | the dense-figure state at 320 (and nothing at 390, where the figure is not narrowed — as it should be) |
| Draw changing the page (`goPage` one on after the redraw) | the paper-figure journey ("Draw moved Find from page 16 to 17"); the switched-to and stem's-map states at 390 |
| `.qp-area` missing from the `.grid` ink rule | `check-css`: "inks `.grid` in a figure page's sheet and not on the card's drawing face" |
| "a blank space" as a paper figure's note | the paper-figure and surface journeys |
| "Not the paper's own figure." under the paper's own figure | the paper-figure and surface journeys |
| the `partPlan_` pen rule kept | where-a-figure-stands, the surface journey, the multipart answer swipe |
| the old `usesPage_` clause kept | use-your-graph: "Q20(b) … has pages [null]" |
| "not a page the strip has just shown" kept | use-your-graph: "straight after (b)'s own figure page … (c) has no page with (b)'s graph" |
| the stem pen's own figure page kept (`questionHasFig_`'s third clause) | the paper-figure journey ("a stem's part still has a figure page of its own", "Saved draws the stem's map 3 times") and use-your-graph |
| the square shrink (`w - by - 4`) | the tallest-figure state at 390 and 1280 — but only once it asked for it: the first version of the state passed, because a figure shrunk too far still fits. It asks now that a figure drawn narrower than its page leaves no more than 16px of the pane's cap unused: the square shrink drew the stem's grids 190px wide at 1280 where 242 fitted |

### Not changed

The made-up surfaces (327) — their order, their 180px floor and their states are as they were. The
whiteboard. The answers tab, `padAdopt_`, the `surfaceFace` memory and its sign-out. A passage to ring
words in has no pen and stays on its card. The weekly email still says "(picture on the site)" for all
470 — a paper figure is still the paper's picture.
