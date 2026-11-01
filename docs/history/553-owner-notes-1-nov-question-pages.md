# 553 — The owner's notes of 1 Nov on a question's pages (Edexcel 1MA1 June 2023 1H, 9MA0) and the empty Saved

Six notes from the "Notes for Claude" file, each fixed as a rule for every case rather than the one the owner was looking at.

## N-1793371010890-90443 (Q-1MA1-2306-1H-6b)

> "there's no suggest change button in the widget above"

The page above 6b's first page was 6a's **answer page**, and an answer page had no Suggest a change (stem and long-part pages got theirs on 29 Oct, 529; the answer page was missed because the 29 Oct journey sampled every third page). Now **every page of a question ends in one foot** (`qFoot_`, find.js): its Help row, then the card's own row (`cardTiles_`: the star, Suggest a change, an admin's tiles), then Back to top. `qPageTools_` lost its own Suggest so a page never has two.

> "sometimes the ruler button displays a ruler and sometimes it allows you to draw straight lines … they should each have their own buttons and be universal"

Two tiles in `QT_TOOLS` (qtools.js): **Straight line** (`line`, the pen's straight-edge mode, still called `ruler` inside the pad — `QT_PAD_TOOL`) and **Ruler** (always the measuring ruler laid on the figure, or on the pen's page where the part has only a surface; `measFig_` finds `.qpad-art > svg` too). Both stand wherever the drawing tools do (`QT_DRAWING`). The checks that pressed Ruler to draw a line (check-flow's construction and Q7 grid journeys, check/states.js, check/pen.js) press Straight line now.

> "clicking help should just make the current widget red, not the widgets before or after or same question, just current widget. Also should make a noise"

The hand is kept with its page (`{ q, pg }`, help.js): `helpCls_(x, pg)` reddens that page alone; Help pressed on another page moves the hand there, pressed on the red page puts it down. `helpPaint_` now redraws the tile and its words only — it used to replace the whole row, which wiped the star and Suggest joined into it (`tileRowsJoin_`). The bell is `markSound_('help')` (submit.js), the marking sounds' one AudioContext: two short notes a fourth apart at the chime's level. There is no sound switch to respect — the owner removed it for the marking sounds (374).

## N-1793370830991-49785 (Q-1MA1-2306-1H-5b)

> "I would like buttons to all appear in the same place"

The foot above is the same tiles in the same order on every page and always the card's last line: `.tile-group.qtool-tiles::after` / `.qans-tiles::after` break the joined row so the page's own tiles (Magnifier, Lock, Read aloud; Show the answer) stand above it, never beside it. The answer page's Show/Hide stays under the tags — its place is a promise that it does not move when pressed (check/states.js measures it).

## N-1793370798765-60883 (Q-1MA1-2306-1H-5a)

> "looks messy when the answer boxes are like this. should be a principle to not do this"

The Venn part's four boxes wrapped two a line with their names broken over two lines ("A / only"). `.qp-cells` is a two-column grid now: the name, then its box, one a line, every box one width — the 421 rule (one line per thing). Screenshots at 390px before/after were taken.

## N-1793358598631-68805 (Q-9MA0-2306-01-1)

> "Make it look more like a half. universal rule"

`x<sup>1&frasl;2</sup>` was left as `1⁄2` at full digit size inside the index, on purpose (241: a fraction stacked at superscript size is unreadable). It is now `.frac-ix` — a raised small top, a slant (`&#x2044;`, which `typeset_` does not read as a slash again) and a small bottom: ½'s shape for any whole-number index, still on its line. check-typeset holds three cases.

## N-1793358527451-40284 (Q-9MA0-2406-P1-6a)

> "Where is the sketch?"

The preamble said "Figure 1 shows a sketch of the graph of y = 3|x − 2| − 5 with vertex at P" over nothing. Drawn (the V, O, x, y and P; `diagram_by: family`, its PNG twin by tools/diagram_png.js, a Ledger import file for the owner). The rule: a stem naming a figure nobody has drawn says "Figure not drawn yet." on its page (`stemFigOwed_`), as a part's run already did (`figGap_`), and check-library counts them under a ceiling (`STEM_NOT_DRAWN_MAX`, 658 — the 9MA0 2024 papers and the OCR H240 ones were imported without figures). Drawing one lowers it.

## N-1793375567124-27617 (Find 2)

> "why is there no buttons on 'saved' widget to the right of this"

An empty widget was its title alone (414). `emptyCard_` now carries its Suggest a change; `cardReportRow_` adds nothing to a card already carrying one and the admin's layout row drops its own Suggest there. The 486 journey no longer skips `.is-empty`.

## Checks

- check/boxes.js (new, real browser, 390 and 320px): on the owner's pages, every page's last line is exactly Help, star, Suggest, Back to top; the boxes one a line, one width, one column.
- check-flow 455 rewritten (one page red, the bell rung once), 486 counts empty cards.
- check-typeset, check-library (stem ceiling), check-answerable's tool order.
