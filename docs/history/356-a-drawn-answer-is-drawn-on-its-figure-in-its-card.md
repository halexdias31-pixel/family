# A drawn answer is drawn on its own figure, in its own card, and no figure has a page

The owner, 18 Oct, with a phone screenshot of Edexcel GCSE Foundation June 2024 Paper 1 Q7 ("On the
grid, draw a suitable diagram or chart for this information."): the card had a "Type your answer" box,
a `Draw` tile, "Figure on the next page →", and the empty grid on a separate card below it.

> *"there's a way to switch from text to graph. But then there's also like a graph widget below. Also
> why would there be an option for text answer in the first place? Can you see how sloppy it is?"*

## What this reverses, on that word

- **204 / 268 / 270**: every figure its own widget, "text, figure, text" as pages. The owner asked for
  those; his 18 Oct word supersedes them for questions. Practicals keep their Diagram page (204's
  "diagram, equipment, steps" was asked of practicals, and 18 Oct was about questions).
- **327 / 337**: the drawing as the answer box's other face behind `Draw`, with the figure page kept as
  a picture to look at. The switch is deleted whole.

## The rule

`answerKinds_(x)` → `{draw, value}`, one test for the card, the tiles and the checks:

- `draw` = `padSource_(x)` gives a surface. `padSource_` now refuses a row with `choices`: a row with
  options is answered by choosing (GPS1-2, GPS1-9, KS2 2024 P2 Q26 lost a made-up blank square).
- `value` = not `draw`, or the row has an `accept` to mark a typed value against.

The card (`ansArea_`, `cardFigBlock_`, `figHtml_`):

| kind | drawn |
|---|---|
| value | the box, as before |
| drawing on the paper's figure (own, or the stem's) | the figure under the pen **among the words, where the paper prints it**; nothing at the foot |
| drawing on a made-up surface | the surface under the pen where the box was (`.qp-area`) |
| both | the drawing in its place, the box at the foot |

Q-STA-KS2-2019-P2-13 ("Draw the full-size triangle accurately") is now `answer_type: drawing` — the
one real drawing question among the 161 loose matches; it gets pen and ruler (protractor answered,
not built).

**The 11 pens whose words ask for a value but which have no `accept` stay drawing only** — an accept
cannot be invented without marking data, and on the printed sheet the value is written on the figure,
which the pen does: Q-CBM-5AD-F-0906-3, -0906-4, Q-CBM-5AD-F-1130-4, Q-1CM-drawing-pie-charts-3, -4,
Q-1MA1-1905-1H-4, Q-1MA1-1706-2H-20a, -20b, Q-1MA1-1811-2H-14, Q-STA-KS2-2024-P2-3,
Q-STA-KS1-2026-P2-26.

The hexagon (Q-CBM-2d-shapes-2) is BOTH: its blank space and its box, with no switch.

Drawings are unchanged on disk: same `pad:` key (`padKey_`), so every drawing made on the old figure
page, the old surface page or behind `Draw` opens on its card.

## One place for a figure

`pageParts_` emits no `fig`, `sfigN`, `use` or `nofig` page for a question. `partPlan_` and
`stemPlan_` put the figure in the block list, by **digest.gs's rule** so the Sunday email and the site
agree with no backend edit: a part's figure at its `<!--fig-->` marker, else after the lead, else in
front of the words; a stem's at its marker, else after its words.

`packBlocks_`:

- weighs a figure as its viewBox height at the 288px pane, 1.8 per px (`figWeight_`);
- glues a figure to the block after it (or before it, when last), so a figure never lands on a page by
  itself — that would be a figure page with tags again;
- holds a figure under a pen (`pin`) and everything after it on the card: the drawing is the answer.

A stem figure a part draws on is drawn under that part's pen and left off the stem's page
(`stemPenned_`); its other parts see it through the Figure tile. An earlier part's marked picture
(`usesOf_`, the 19 `use` pages) is drawn in the later part's card in front of its words, no header.
A figure nobody drew is one line, "Figure not drawn yet.", in the first card of each run (`figGap_`).
The Figure tile loses the part's own figure (it is on the card) and the stem picture its pen is on.

`cardFigFit_` (was `padFaceFit_`) is keyed on any card holding a figure, one order: words to
`PANE_ZOOM_MIN`, then the tallest picture to `FIG_FLOOR` (180px), never the card zoomed whole; the rest
scrolls (`paneReach_`'s `drawn`).

A place kept on a removed part (`findPlaceBack_`, `finderOpen_`) reopens on the item's card.

## Deleted

The switch: `PAD_FACE_STORE/MAX`, `PAD_FACE`, `padFaces_`, `padSig_`, `padFaceOf_`, `padFaceSet_`,
`padFaceForget_`, `ansTyped_`, `padFace_`, `PAD_FACE_EMPTY`, `padFaceTile_`, `drawTile_`,
`on('q-draw')`, `padFaceRedraw_`, `padFaceReads_`, answers.js's face re-ask, the `type` tile icon;
me.js now just removes the dead `surfaceFace` key at sign-out. The pages: `questionFigCard_`,
`questionStemFigCard_`, `questionNoFigCard_`, `questionUsesCard_`. The pointers: every "Figure on the
next page" and `.qsheet-figref` ("Continued on the next page" stays, as `.qsheet-more`). CSS: the
`.qp-area.is-draw` face rules.

## Census (jsdom over the real library)

- 530 drawing cards (532 − 3 choice rows + 1): 518 drawing only, 12 both.
- Pages 20,165 → 18,540: 1,598 figure pages gone (1,159 `fig` + 347 `sfig` + 73 `nofig` + 19 `use`);
  pre pages 1,511 → 1,492, stem pages 1,184 → 1,176.
- Pointers: 1,064 "Figure on the next page" lines gone (203 cards, 540 pre, 321 stem).
- Q7 is `[pre0, card, ans]`: the table on pre0, the ask and the grid under the pen on the card.
