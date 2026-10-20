# 381 — A part that draws on its stem's figure draws on it in place, and a shared figure is one figure

20 Oct 2026. Amends 356 (a drawn answer on its own figure, in its own card), 366/368 (Check), 375 (the types).

## What the owner asked

After Corbettmaths Metric Units Q1: *"The question includes a diagram to draw on, but you give another diagram
which the user has to select draw to see. Why is there even a text input when this question is not text? Better
protocol for this TYPE of question. If you need to update database for question types do so."*

The data: a preamble row `S-Q-CBM-metric-units-1` ("A can of beans has a mass of 450 grams") carries the dial;
part (a) `Q-CBM-metric-units-1` is `answer_type: drawing` with a `dial` `draw_answer` and no figure of its own;
part (b) `Q-CBM-metric-units-1b` is a calculation, `accept: 900 | 900g | …`.

## What the child saw (390 × 844, the real app in Chromium, before)

1. A card with only "A can of beans has a mass of 450 grams" (tagged Q1 a).
2. Part (a)'s card: the dial under the pen, the lock / Undo / Clear bar, then the **Check tile, and only under it**
   the words "Draw an arrow on the scale to show 450g" — the instruction below its own Check.
3. (a)'s answer page.
4. Part (b)'s card: the words, a "Type your answer" box, **a Figure tile** that opened the dial again over the page,
   and Check. That second dial behind a tile, beside a text box, on a card tagged Q1, is the "another diagram you
   have to select to see" and the "text input" on a question that looked like a drawing.

## The type, counted (`js/check-flow.js`, the real app over the whole library)

A drawn part whose figure is not its own row's: **82 parts round 49 stem figures**, 39 of them the first part of
their stem, 28 figures drawn on by more than one part, 12 of the 82 also answered in a box (a bearing typed, the
drawing its working). Beside them, **13 drawn parts draw on a copy of a sibling's figure** through `uses` (5-a-day
transformations, the AQA HR diagram, FSL2 Q3). No drawn part in the library has its figure only on a sibling with
no `uses`; no drawn part sits under two stems with a figure each; 64 draw on a made-up surface.

## The protocol (`QT_PEN` and `QT_SHARED_FIGURE`, js/qtypes.js)

- **The figure is the pen, in place.** The part that draws on its stem's figure carries the stem onto its card when
  it is the first part to share that stem (`stemCarried_`): the stem's words, the figure under this part's pen
  where the stem prints it (its `<!--fig-->` marker, else after its words), then the part's words. The stem has no
  page of its own then. A long stem's first words go on the part's `pre` pages, in front, as before. Not carried:
  a stem with `lines`, a stand-in, pictures (`images`), an outer stem with an inner one after it, or a stem whose
  first part is typed (10 figures) — those keep 356's stem page, words only.
- **One figure per card.** A drawing part that also `uses` an earlier part drawing on the same stem figure
  (1706 2H Q20b, 1711 2H Q5b, KS2 2019 P3 Q10b) drew that figure twice — the marked copy in front of its words
  and its own pen. `usesPage_` now says no when the part draws on that same picture: the earlier marks are under
  its pen already.
- **Every part's ink on the one figure.** A pad shows, faint and out of reach of its Undo, Clear and Check, the
  ink of every other part of the question that draws on the same figure (`padUnderParts_`: the `uses` chain as
  before, and now every sibling on the same picture), and repaints it when one of them changes (`data-under`,
  `padUnderRepaint_`). Each part keeps its own `pad:` key and is marked on its own ink only. Chosen over "one shared
  drawing" because the keys, the stored drawings, the marking and the Sunday email stay exactly as they were, and
  over "earlier parts only" because the paper is one figure: marking B, you see where A went, and going back to A
  you see B.
- **Nothing for the drawing on a typed part.** No pen, no figure, and no Figure tile offering a stem figure an
  earlier part drew on (`figsBefore_`). A typed part whose words read that figure names the drawing part in
  `uses` and has the figure, with that part's marks, in front of its words — 356's `use` block. Twelve rows were
  given `uses` in `tools/set-uses.py` (2406 2F Q6c, 1st Class histograms 8b, 9b, 9c, 10b, tree diagrams 13b, 2306 2H
  Q16b, 1806 2H Q10b, 1705 1H Q1d, 1706 1F Q21d, 1706 3H Q9c, 1805 1H Q5b). Metric Units 1b, 1st Class
  transformations 4b–6b and 1911 1H Q20b read nothing off the figure and get nothing. The table also gained three
  straight-line-graphs rows the file already had and the table had lost, so a re-run no longer strips them.
- **One Check per part, in one place.** A figure pen's Check row (`padSendRow_`) is drawn by `ansArea_` at the card's
  foot, under the part's words, where a typed part's box and Check are; it finds its pad by `data-pad` in its card
  (`padOfRow_`). A made-up surface and the whiteboard keep the row in the pad, which is already the foot.
- A part whose answer is a drawing never shows a box or keypad (unchanged since 356, now swept per part of the type).

`--css-version` `2026-10-20-stem-figure-in-place`: `.qsheet-stem.is-over`, the carried stem without the faded rule
a stem had when it stood over a part.

## Proof

- **check-qtypes** fails a drawn part whose words point at a figure (`on the scale`, `the grid`, `diagram above`…)
  with no figure of its own, no stem with one and no `surface`, and one under two stems with a figure each
  (`qtFigureOf_`); it reports drawn parts by where the figure is (own 363, stem 82, surface 64). Mutation: the
  dial taken off `S-Q-CBM-metric-units-1` fails it naming `Q-CBM-metric-units-1`; the real file is green again.
- **check-flow**, two journeys: Metric Units Q1 — no stem page, stem words then the dial under the pen then the
  part's words on one card, one figure, no box, no Figure tile, one Check after the words; an arrow drawn centre to
  450 g is Correct and recorded right, one at 300 g is Not yet; (b) has its box under its words, one Check, no pen,
  no figure, no Figure tile. And the sweep over the 82: exactly one figure on the card and it is the pen, no box
  unless the part is answered by one, one Check and not inside the pen, the Figure tile never offers the figure
  it draws on, a carried stem's words on its pages and no stem page, and with a stroke on every other part on the
  same figure, exactly those strokes faint under it and none of its own.
- Screenshots at 390: `q1-before.png`, `q1-after.png` (the arrow drawn with a mouse on the real card, Check: Correct).
- Journeys amended to the new rule: 362's Send test finds a figure pen's Send at the card's foot (a made-up
  surface's still in the pad); the `uses` journey now wants the scatter's (b) to show (c)'s mark as well as (a)'s,
  (i)'s probability scale to show (ii)'s cross, and 1706 2H Q20(b) to have no marked copy in front of its words.
  check/cards.js allows the one stem a part carries (`.qsheet-stem.is-over`); check/pen.js finds the Check row by
  `data-pad`.
- Green: check.js, check-const, check-comments, check-doors, check-qtypes, check-marking, check-all --fast (58),
  check-flow 1/4–4/4 (102 + 103 + 102 + 103), check/pen.js, check/cards.js.
