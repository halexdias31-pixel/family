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
| **the credit** | The drawing face carries the figure's own credit — never "Not the paper's own figure", which is the made-up surface's line. Run on with "Saved to …" as 327's small print is, so it ends in a full stop here: the first screenshot read "…is not reproduced here Kept on this device only". It was the figure page's whole sentence (`FIG_BY`, "drawn for @family. from the paper's own figures…"); **after review** it is the card's one line, "The paper's figure, redrawn.", and the figure page keeps the sentence (below). |
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
  surface keeps 327's order (grid, then words). **After review the order is decided by what is in the
  picture, not who drew it** — a blank paper grid gives way first too (below);
- **the same floor**, `PAD_FACE_FLOOR`, 180px wide: 13-unit labels at 6.9px on every screen (9-unit axis
  captions at 4.8px — said more exactly after review). A legibility floor is a fingertip's kind of number,
  in px;
- ~~**the face on the glass at once**: narrowed further only so the figure, its bar and `Type` all fit the
  pane~~ — **removed after review**: on a phone on its side it drew the pictures a few pixels wide. The floor
  is never crossed; a card still too tall opens with the picture's top in the pane (below);
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
| figures under the floor | 3 — the transformations Q8 trio, 179px, for the glass (0 after review) | 0 | 0 |
| smallest label (13-unit labels, p10) | 6.9px | 9.0px | 9.7px |

Every card opened on its box with `Draw · on the figure`, turned to `Type · the answer box`, stayed on
its page, drew on its own `pad:` key, carried its credit and never "Not the paper's own figure".

**Worth a look:** the Figure tile and Draw side by side, on a box whose figure stands in front (131 moved
there): the Figure tile opens the picture over the box, which is what it does for every part with a
figure in front, and Draw turns the box into it. Each follows its own rule, and the row looks like any
other — but it is the one place two tiles both offer the figure.

**Found by `check/press.js`, and left as it is:** Draw grows the card in place and the column is not
placed again for the new height — the card keeps its top, so nothing under the finger moves. Leaving Find
and coming back centres the card for the height it has now: the May 2017 1F Q6(i) scale sat 31px higher
at 390x844 after the round trip. The press pass measured the scale before a swipe away and drew its
stroke after coming back, below the ink, where a drag turns the column; it measures again on return now.
The same is true of 327's surfaces. Re-placing the column on every Draw would make the card jump under
the thumb that pressed it.

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
real touch on its Draw tile (the box measured again after the swipe away and back, above). `check-css.js`: every figure-ink rule names `.qp-area`.

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

The made-up surfaces (327) — their order, their 180px floor and their states are as they were. (Said by the
build and not true of it on a phone on its side, where "the face on the glass at once" took 1F Q11c's grid
from 141px to 111 at 568x320; true again after review.) The
whiteboard. The answers tab, `padAdopt_`, the `surfaceFace` memory and its sign-out. A passage to ring
words in has no pen and stays on its card. The weekly email still says "(picture on the site)" for all
470 — a paper figure is still the paper's picture.

### After review (11 October)

Three reviews of the build: a child's walk through it in real Chromium with real touch, the state and the
data through jsdom over the whole library, and coverage and fit by mutation and a sweep of every pen
question. What they found, and what was done:

**On a phone on its side the figure went to nothing — must-fix, fixed.** The build added "the face on the
glass at once" to `padFaceFit_`: a picture narrowed past its 180px floor until the picture, its bar and
`Type` fitted the pane together, so a card opened at its foot showed the picture's top. Upright it moved
three cards by a pixel (the transformations Q8 trio, 180 to 179px at 320x568). Sideways it took them all,
and every check passed because every check measured a phone held upright:

| sideways | before the review | now |
|---|---|---|
| 844x390, transformations Q8 (four stacked graphs) | 88px wide, axis numbers 3.4px | 180px, opened at its top |
| 844x390, June 2024 1F Q7 (the paper's blank grid) | 163px | 180px |
| 568x320, June 2024 1F Q7 | 82px | 180px |
| 568x320, 1F Q11c (a made-up blank, 327) | 111px — its CSS size is 141 | 141px, its CSS size, as at af08dee |
| 667x300, transformations Q8 | 33px | 180px |
| 568x240, June 2024 1F Q7 | 4px: the question, a lock, Undo and Clear, nothing to draw on | 180px |
| 568x240, 1F Q11c | 31px — af08dee drew 106 | 106px, its CSS size |
| 844x390, all 470 paper figures | 123 under 180px, smallest 88 | none under 180px |

The rule is gone. A picture is never drawn under `PAD_FACE_FLOOR`, made up or the paper's — 327's contract,
which 337 said it kept and had not — and one the stylesheet already drew smaller (a made-up grid at its
`44svh` cap on a short screen) is left at that size. A card still too tall scrolls, and `paneReach_` opens
it at its foot only as far as keeps the picture's top in the pane: whenever the picture, its bar and `Type`
fit together that is the foot, as before; sideways it is the picture's top, eight pixels down (room for an
armed pen's gold frame), with the bar and `Type` a scroll below, which a finger beside the picture reaches
armed or not. A box too tall for a sideways pane scrolls too, and a child scrolls to `Draw` before pressing
it; the drawing face keeps that scroll. Placing it afresh on every turn was tried and taken back out: over
all 532 at 568x320 the picture's top was in the pane every time either way, and a rule nothing can show
doing anything is the one this review found ("the face on the glass at once").
**Checked:** `check/press.js` turns the phone — at 568x320 and 844x390, the sizes its whiteboard is already
measured sideways at, in a phone-shaped context with real touch — and for the transformations stem, Q7 and
Q11c touches `Draw` and asks the picture at least the floor (or its CSS size), every tile 44px, nothing
drawn smaller whole, the picture's top in the pane as it opens, and at the pane's foot `Type` inside it,
hit at its centre, and a real tap on it bringing the box back. The tallest-figure state asks the floor at
every upright width too.

**"…is not reproduced here.The fainter marks…" — fixed.** On the card both the credit and the line about an
earlier part's marks are inline small print (`.qp-area.is-draw .qpad > .fig-by`), and `padWrap_` wrote them
with nothing between; on the old figure page the credit was a block and it never showed. 16 paper parts
draw over an earlier part's marks, and the one made-up surface with a use page (Q-CBM-5AD-F-0906-4) had read
"figure.The fainter" since 327. A space in the template. **Checked:** use-your-graph's (ii) is credited as
the real ones are, and its small print must read "redrawn. The fainter marks".

**The credit was three lines at 320 — fixed, with the next one.** The drawing face carried the figure page's
whole sentence ("drawn for @family. from the paper's own figures — the original is the board's and is not
reproduced here."), three lines at 320 and four signed out, against the surface's one. 327 cut the
surface's line to its claim for exactly this; the card's credit is the claim now too, **"The paper's figure,
redrawn."** (`FIG_CARD`), beside the surface's "Not the paper's own figure." The figure's own page — the
stem's, for a stem's part — keeps the whole sentence, so nothing is disclosed less. Not for `family-set`,
whose sentence is that the content is ours ("our coins and our answer"): cut to "redrawn" it would caption
our picture as the board's, the fault `FIG_BY`'s note records the other way round; none of the 470 is one.
With it, and the floor and order fixes either side of it, the cards that still scroll with `Draw`
pressed at 320x568 went from 33 to 17 signed out and from 22 to 17 signed in (median 26px, at most 69),
the figures drawn narrower from 90 to 55, the cards whose words gave way from 220 to 178. **Checked:** the
paper-figure journey and the Q7 state ask that exact line on the face, and the figure page still has "drawn
for @family".

**The two kinds gave way in opposite orders — fixed, by what is in the picture.** A made-up surface shrank
its grid first; a paper figure its words first. So June 2024 1F Q7 — the paper's own *blank* grid — drew its
question at 0.7 at 320x568 beside 1F Q11c's made-up blank grid at 0.95: two blank grids behaving
differently because of who drew them, the "two ways" the owner asked to be rid of. Now the order is
decided by the picture: one with something to read in it (any `<text>`: a Venn diagram's letters, a scale's
numbers, an axis caption) keeps its size until the words have given way; one with nothing to read — a blank
grid, a dashed square, the empty circle of a pie chart — gives way first, as 327's grids always did. None of
the 62 made-up surfaces has text (43 blank, 19 squared, no axes), so theirs is 327's order unchanged;
77 of the paper's figures have none either (66 a part's own, 11 a stem's) and now go with them, 12 of them
fitted differently at 320x568 for it — Q7's question at full size and its grid at 180, beside Q11c's at 0.95
and 180. **Checked:** the Q7 state asks that its words are drawn smaller only once its grid is at the floor; the tallest and dense states, and a new
one, ask that a figure with labels is narrowed only once the words are at `PANE_ZOOM_MIN` (the review found
that order held by nothing: figure-first for every picture left every check green).

**A drawing pulled from the account under a card on its box was shown nowhere — fixed.** `ansRefresh_`
repaints every pen on the screen when a pull lands; a card on its box has no pen, and with every pen on its
card that is most cards. Until 11 Oct the paper figures' pens were on their figure pages and were repainted
at once; now the tile went on saying "Draw · on the figure" over a drawing made on the tutor's iPad
(327's surfaces had the same hole from the day they moved). `ansRefresh_` now asks `padFace_` again for each
card on the screen with a Draw tile whose drawing or typed answer just landed: a face that changed turns
where it stands (`padFaceRedraw_`, every copy, no repaint), and one that did not has its tile's note said
again. Never from under the keypad: a box being typed into stays, its tile saying "has a drawing". (Nor from
under the pen, which this round missed: see "After the second review", below.)
**Checked:** a new journey through the real boot, a backend that keeps answers and `answersPull_` — Q7 on its
box turns to the pulled drawing on the same page; Q7 on a drawing the child chose stays there when a typed
answer arrives and says "Type · has an answer"; Q11c with the keypad up in its box is not turned and says
"has a drawing", and turns at the next pull once the keypad is away.

**A stroke on Saved's copy was not on Find's — fixed, though older than this.** One key can be on the screen
twice (Find and Saved, or Spotlight), and `q-draw` turns both faces together, but a stroke, an Undo or a
Clear repainted only the pad it was made on: Find's copy showed 0 strokes over a store holding 1, and Clear
there wiped a drawing the child could not see. True of 327's surfaces and the old figure page's pen as well;
it reached the 470 through their cards. `padCopies_` repaints every other pad on the key from what was just
stored. **Checked:** the paper-figure journey draws on Saved's copy, clears Find's, and undoes on each, asking
both copies every time.

**Found by this round's own sweep: on its side the ink was not over a made-up grid — fixed, older than this.**
Sweeping every pen at 568x320 to prove the floor, all 62 made-up surfaces measured the ink layer 152px off
its grid (128 at 844x390). `.qpad-art` is an inline-block sized by what is in it, and a picture whose width is
a percentage gives a shrink-to-fit box the default 300px; the ink stretches to that box (`padWrap_`). Upright
the picture fills it, so nothing showed; where the surface's `44svh` cap binds — a phone on its side — the
grid was 141px wide in a 293px box, a mark was stored against the wrong box, and it moved when the phone was
turned upright. The same at af08dee (327). A rule holds a capped surface's box to the cap
(`.qp-area.is-draw .qpad-art:has(> svg.qsurf:first-child)`); upright every width is what it was (11c at
180/278/300px at 320/390/1280, measured). **Checked:** the press.js pass above asks the ink over the picture
to the pixel; `--css-version` is `2026-10-11-fig-draw-2`.

**Coverage the review found missing, added:** "Figure on the next page" hidden on the drawing face (one line
of style.css, whose deletion left every check green while 198 cards pointed at the next page over the figure
under the pen) — the Q7 states ask it shown on the box and hidden on the drawing, which only a browser can
compute (`:has`); each of a stem's parts has its own `Draw · on the figure` on its box, asked before the face
is set by hand, so a missing tile is said rather than found by a throw further down.

**Said more exactly:** "labels at 6.9px" at the floor is true of the 13-unit labels; the 9-unit axis captions
are 4.8px there (39 cards at 320 had some text under 6px in the review's sweep). The code and the dense state
say both now.

**Recorded, not changed.** Adding `Draw` puts four AQA cards at 320x568 signed out into whole-card zoom on
their *box* face (Q-AQA-8462-2406-1F-015 at 0.899, Q-AQA-8462-2406-2F-024 at 0.959, Q-AQA-7408-2306-2-041
at 0.922, Q-AQA-7408-1906-3BA-011 at 0.912), the tile 40-42px — signed in they were already zoomed for the Save tile, and 327's two 5-a-day surfaces are the same.
That is the owner's `paneReach_` trade (*"If you need to leave things more compact or smaller font"*), and
with Draw pressed every tile is 44px. Two older things: a "use" page, or the fainter marks under a later
part's pen, are drawn once, so a stroke on the earlier part after the strip was painted reaches them at the
next redraw (the same at af08dee); and the keypad, up, covers the row with `Draw` in it, as it does on 327's
surfaces. On the Figure tile beside Draw on the 131 cards whose figure now stands in front: while the card
shows its drawing the Figure tile is not drawn, so two tiles never offer the figure at once (the child's
walk); on the box both are there, each doing what it does on every part.

**After, swept again** — every one of the 532 pen questions, its card opened through the paper chip, `Draw`
touched by a real tap in the real Find strip (and `Type` after it); a scratch sweep, not committed. 320x568
ran before the last change to the app, the capped grid's box, which cannot bind there (44svh is 250px, the
column 223):

| | 320x568 out | 320x568 in | 390x844 out | 1280x800 in | 844x390 in | 568x320 out |
|---|---|---|---|---|---|---|
| a tile under 44px, or a card drawn smaller whole | 0 | 0 | 0 | 0 | 0 | 0 |
| `Type` not reached (in the pane as it opens; sideways at the pane's foot) or a press missing it | 0 | 0 | 0 | 0 | 0 | 0 |
| `Type` not bringing the box back on the same page | 0 | 0 | 0 | 0 | 0 | 0 |
| a picture under the floor (or under its CSS size) | 0 | 0 | 0 | 0 | 0 | 0 |
| the picture's top outside the pane as it opens | 0 | 0 | 0 | 0 | 0 | 0 |
| the ink more than 1px off the picture | 0 | 0 | 0 | 0 | 0 | 0 |
| "Figure on the next page" shown over the drawing | 0 | 0 | 0 | 0 | 0 | 0 |
| paper cards that scroll (median, most) | 17 (26, 69px) — was 33 | 17 — was 22 | 0 | 0 | 407 (63, 262px) | 470 (147, 346px) |
| paper figures drawn narrower | 55 — was 90 | 55 | 0 | 4 — was 8 | 449 | 470 |
| paper cards whose words gave way (to 0.7) | 178 (123) — was 220 (165) | 178 (123) | 4 (3) | 12 (7) — was 18 (10) | 465 (456) | 470 (470) |
| smallest figure | 180px | 180px | 180px | 180px | 172px, a made-up grid at its cap | 141px, the same |

Every card opened on its box with `Draw · on the figure` (or the surface's note), turned to `Type · the
answer box`, drew on its own `pad:` key, carried "The paper's figure, redrawn." or "Not the paper's own
figure." and never the other. Text in a figure at the floor: 13-unit labels 6.9px, 9-unit axis captions
4.8px; 37 cards at 320 have some text under 6px, against 39 before.

**Mutations, each alone on a copy of the tree, each red, the real files green after.** Made by a script on a
copy (`check/` and all), so the real files were never touched; after them the real tree ran green — the four
parts of `check-flow`, `ui.js --screen=stuff` at all five widths, `press.js --screen=stuff`.

| mutation | went red |
|---|---|
| "the face on the glass at once" put back in `padFaceFit_` | `press.js` on its side: five of six rows under the floor — transformations Q8 52px at 568x320 and 96 at 844x390, Q7 95 and 176, Q11c 111 against its 141. (Upright it now moves nothing: with the one-line credit the trio fit at 180, so the tallest state's floor clause cannot see it at 320.) |
| a scrolling drawing face opened at its foot again | `press.js`: four rows with the picture's top above the pane — transformations Q8 164px above at 568x320 and 125 at 844x390, Q7 9, Q11c 25 |
| the capped surface's box not held to it (the new style.css rule deleted) | `press.js`: Q11c's ink 152px off its grid at 568x320, 128 at 844x390 |
| the order by who drew it again (any paper figure's words first) | the Q7 switched state at 320, both visitors — after the assertion was put right: its first version read an unset width as 0 and passed this mutation |
| every picture gives way first | the new 2H Q21 state at 320, both visitors; the tallest and dense states stayed green, as the review said they would |
| the "Figure on the next page" rule deleted | the Q7 switched state at 320, both visitors |
| the figure page's whole sentence back as the card's credit | the paper-figure journey (Q7's face, (a)'s face) and use-your-graph |
| no space between the credit and the earlier marks' line | use-your-graph: "paper’s figure, redrawn.The fainter marks" |
| `padCopies_` doing nothing | the paper-figure journey: the copies at 1 and 2 strokes after the stroke on Saved's, 0 and 2 after Clear on Find's |
| `ansRefresh_` not asking the faces again | the pull journey: Q7 left on its box reading "Draw · on the figure"; Q11c "Draw · a blank space" with and without the keypad |
| no Draw on a stem's parts | the paper-figure journey, in words, for each of bearings (a), (b), (c): "has no Draw tile on its box" |

### After the second review (11 October)

The three reviews ran again over the round above. The child's walk and the coverage sweep found nothing new
(the coverage sweep's three uncaught mutations were this round's own findings, and are caught now). The state
and data lens found one thing, and it was new in the round above.

**The drawing taken from under a pen switched on — should-fix, fixed, and at the rule rather than where it
was found.** The block the round above added to `ansRefresh_` asks `padFace_` again for every card on the
screen whose drawing or typed answer a pull brought, and turns a card whose face changed. It stood back for a
box the keypad was typing into, but not for a drawing whose pen was on. The steps: a card opens on its
drawing by the default rule (a drawing, nothing typed, no face remembered — every paper figure a child drew
on before 11 Oct opens that way); the child presses the lock; a typed answer for the same question arrives
from the tutor's iPad or another tab. "A drawing and nothing typed" is no longer true, so the card turned to
its box under the pen. That left `PAD_ON` naming a pad no longer on the screen — the invisible mode `q-draw`'s
own note forbids — and the next `Draw` brought the drawing back armed, holding the card still, with nobody
having asked. Reproduced on 7e5c615 in Chromium, with real touch on the lock, at 390x844 signed in, on June
2024 1F Q7:

| | the pull lands | Draw pressed after |
|---|---|---|
| 7e5c615 | on its box, `PAD_ON` still this pad, the pad gone, "Draw · has a drawing" | the drawing back armed, the ink holding the swipe |
| af08dee (1F Q11c, a made-up surface, as the reviewer ran it) | the drawing, armed | — |

The reviewer's fix was the keypad's guard copied for the pen, inside `ansRefresh_`. It was built first and
went green, and then a repaint was added after the pull — a payload landing, or the inbox reply after every
load. The repaint drew the card from `padFace_`, which still said "type", and did the same thing a few
seconds later: on its box, `PAD_ON` still this pad, the pad disarmed. That path is older. On af08dee, 1F Q11c,
pen on, typed answer pulled, then `repaint(true)` gives `{draw:false, PAD_ON:'this pad', armedPad:false}` —
327's 62 surfaces have always done it. The 470 started doing it the day their pen moved onto the card: on the
old figure page there was no box to turn to, and a repaint drew that pen armed. A guard at one caller
(`ansRefresh_`) was the instance; the rule is the face's.

So **`padFace_` asks the pen first: a pen switched on over this question's drawing (`PAD_ON` is its key)
keeps the drawing**, whatever the rest of the rule would say. Everything that draws a face asks `padFace_` —
the card (`ansArea_`), the tile (`drawTile_`), `ansRefresh_`, `padFaceRedraw_`, every copy in Find, Saved and
Spotlight — so the pull and the repaint both find "draw" where "draw" is shown, and only the tile is said
again: **"Type · has an answer"**. `Type` is still the way off the drawing, and it puts the pen down before it
redraws (`q-draw`), so "type" is what `padFace_` then says. `ansRefresh_` keeps its keypad guard and points at
`padFace_` for the pen. A pen on one card holds only that card: the rule compares the key.

Measured after, in Chromium (the same script, real touch on the lock, 390x844, signed in):

| | opened | lock pressed | typed answer pulled | repaint |
|---|---|---|---|---|
| June 2024 1F Q7 (the paper's grid) | drawing, "Type · the answer box" | armed | drawing, armed, "Type · has an answer", page 16 | the same |
| 1F Q11c (a made-up surface) | drawing | armed | drawing, armed, "Type · has an answer", page 39 | the same — 327's repaint hole closed with it |

The reviewer's own script (`Draw` pressed after the pull) now reads `Type`, and pressing it brings the box
with the pen off.

**Checked:** a new check-flow journey next to the pull journey. It goes through the real boot, a backend that
keeps answers, the real Find strip and `answersPull_`, over June 2024 1F's real rows:
- Q7 opens on its drawing by the default rule, and the real lock action switches the pen on. A typed answer
  is pulled. Q7 stays on its drawing with one stroke, `PAD_ON` still its key, the pad armed and the ink
  `data-noswipe`, the tile "Type · has an answer", and the page unmoved.
- After a `repaint`, all of that is still true, and Q11c (nothing drawn, nothing typed) is still drawn on its
  box with "Draw · a blank space", so the pen holds only its own card.
- `Type` then brings the box with the pulled "(3, 4)" in it, and the pen is off.
- Q11c opens on its drawing the same way with the pen off. The same pull turns it to its box, "Draw · has a
  drawing" — 327's rule — so what holds the drawing is the pen, not every drawing.

**Mutations, each alone on a fresh copy of the tree, each red; the real files green after:**

| mutation | went red |
|---|---|
| the pen rule taken out of `padFace_` (the finding as found) | "turned Q7 to its box from under the pen … PAD_ON left naming a pad no longer on the screen"; the tile "Draw · has a drawing" |
| the reviewer's fix alone: no rule in `padFace_`, the keypad's guard copied for the pen in `ansRefresh_` | "a repaint after the pull turned Q7 to its box from under the pen still on over its drawing" |
| too broad: `ansRefresh_` never turns a card away from its drawing | Q11c with the pen off left on its drawing, "Type · has an answer" |
| too broad: `padFace_` holds every drawing face while any pen is on | "with Q7's pen on, Q11c — nothing on either face — is drawn on its drawing" |
| `Type` leaving the pen on (`q-draw`'s rule, which the last step leans on) | "Type on Q7 … left its pen on over a pad no longer on the screen" |

**Re-run after, on the real files (after the mutations, which ran on copies):** `check.js`, `check-const`,
`check-css`, `check-doors`, `check-loading`, `check-drafts`, `check-library`, `check-funnel`,
`check-marking`, `check-practicals` and `check-payload` all pass. `check-flow` passes in four parts
(81, 81, 81 and 82 journeys, 325 in all). `ui.js --screen=stuff` (all five widths, both visitors),
`--screen=saved` and `--screen=spotlight` each report nothing new; stuff's six unreachable states are the
same six as the round above. `press.js --screen=stuff` pressed 50 actions, and all 109 swipes landed.
`cards.js`, `diagrams.js` and `cascade.js` pass. style.css is unchanged, so `--css-version` stays
`2026-10-11-fig-draw-2`.
