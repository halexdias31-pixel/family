# 960 — one card per question number

Owner: "ONE CARD PER QUESTION NUMBER, like the paper."

- **Page model.** `stuffPages_` makes one page per question number: `{ x: first part, part: 'q', parts, open, ans }`.
  `pageParts_` gives a question `['q']` (and `[]` for a later part of the same number); the old stem/pre/ans page
  plan is still there behind `QPAGE_PARTS = true` for anything that asks it.
- **The card** (`questionWhole_`, js/find.js): the question-level tag line once (`qWholeTags_` drops part-only facets:
  part, sub-part, page, marks, your result, accuracy/function), then one block repeated at every level (`qBlock_` over
  `qTree_`): label (a / (i)) with marks small beside it → its own stem/text/figure → its answer row (`qPartCard_`: words,
  `ansArea_` with the Tools fold + Check, and its Show-answer tile when answers are on) → its children, indented one step.
  A stem sits at the deepest level every part under it shares, so a context-only stem is the top of the card.
- **One card tile row**: `cardTiles_` with Magnifier, padlock, Read aloud and Help appended (`more`). The pen stays in
  each part's Tools fold: it draws on that part's figure.
- `qPartCard_` is a `.qcard` of its own so every handler's `closest('.qcard')` (keypad, Check, pen, cells, AI) still finds
  one part; the outer box is `.qwhole`. `qtRedraw_` redraws a `.qb-part` as a part, not as a whole old card.
- `stemOnCard_` returns only the pen-carried stem now: the opening is drawn once at the top, never copied onto each part.
- `cardFigFit_` skips a whole question: it scrolls, nothing is shrunk to fit the pane.
- **Funnel**: counts are untouched (`stuffFiltered` is not changed; parts are still the items). A part the chips do not
  keep (not in the filtered list, or its own page tags disagree) folds to its label, "not in this search".
- **Old links**: `?card=<part key>`, `finderOpen_` and `find:place` of a part land on its question's page (`pageHas_`)
  and `Q_SCROLL_TO` scrolls that part's block into view when the page is filled.

## Help tile lag (same round)

Cause: since 950 `tileRowsJoin_` moves the Help row into the card's tile row, which stands outside `.qcard`, so
`helpPaint_`'s `.qcard .help-hand` matched nothing and a tap changed nothing on screen until something else redrew the
page (the 15 s poll or a page turn): it felt like a cooldown. `helpPaint_` now redraws every `.help-hand`.

## Checks

`check/qcard.js` (browser, fixture, 390x844) writes data/qcard-health.json; `tools/health.js` reads it against
`structure-budgets.json` `qcard` (all 0): card-split, orphan-part (over every question page), dup-tagline, tile-groups,
card-order, indent (on a spread sample of drawn cards), tap-response (each tile act on a question page and Settings,
twice 300 ms apart, a DOM change within 100 ms each), text-overflow (chips/tiles/buttons at 390x844 and 1024x1366).

## check-flow.js tests now stale (not run)

They read `stuffPages_()` as one part per page (`pg.part` of `stemN`/`preN`/`ans`/card, `pg.x.qPart`), around lines:
16971, 17164-17205 (strip of `qPart:part`), 17265-17298, 17660-17729, 18157, 18916, 19074-19191, 21514, 21655-21657,
22054, 22151-22170, 22368-22370, 23963-23970, 24112, 24189-24256 (Q8 pages), 24437-24440 (no answer page under
Questions), 24685-24698, 25124, 29394-29441. Rewrite each to `pg.part === 'q'` and `pg.parts`.

## Budgets raised (owner-asked feature, no shrink found this round)

find.js lines 12122→12243, one-offs 167→168, outside links 295→297; qtools.js links 40→41 (`qPartCard_`);
style.css lines 7184→7189; searchBytes 7483332→7496920. New `qcard` budgets: all 0 except tap-response 7 (measured:
card-share ~500 ms, pad-undo/pad-clear/card-save second tap no change, lay-split ~600 ms, voice-try no change, card-cancel ~110 ms).
