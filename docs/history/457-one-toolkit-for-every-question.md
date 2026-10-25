# 457 — One toolkit for every question, and a check that every part can be answered

25 Oct 2026. The owner, after a question turned up with no way to zoom in and no compass: *"A question had no
zooming in or compass tool… I want you to implement some meta strategy which reduces how often I need to keep
correcting things. Questions should be more stable or less prone to error by nature… universalise the zoom-in
button so there's zero likelihood of a question being unanswerable due to lack of visibility. Maybe the same with
the padlock tool. Universalise that. Figure it out."*

The strategy: a question page's tools come from **one function, from what the page is**, never from a flag a row can
lack; and **one check over the whole library** asks of every part what a child needs to answer it. A row's own words
and fields may still ADD a tool; nothing on a row can take one away.

## The audit: who decided each capability before

| Capability | Who decided | Where it could be missing |
|---|---|---|
| Zoom on a figure | nobody: there was none. Pinch zoom (374) only on a figure under an armed pen; the page itself is *shrunk* to fit (`PANE_ZOOM_MIN` 0.7, `cardFigFit_` to 180px) | every figure not under the pen, every picture, every table, every stem |
| Zoom on the stem / words | nobody | everywhere; `user-scalable=no` in the viewport stops the browser's own pinch |
| The pen | `answer_type` drawing/annotate or a `surface` (`padWanted_`, `padSurface_`); options or cells take it away (`padSource_`) | a drawn part typed as calculation; deliberate for options/cells (356) |
| Ruler on the pen | `needs`, words ("use a ruler", "construct", "locus"), or a squared grid (`padTools_`, `padToolsOf_`, 357) | any drawing whose words did not say "ruler" on a picture with no grid |
| Compass on the pen | `needs`, or the words "compasses", "construct", "locus", "bisect" (`padTools_`) | **every** drawing that did not name one: 485 of the 493 pens in the library |
| Protractor / ruler to measure (385) | `measTools_`: Maths only, the word "measure", then angle or length words in the words or `accept` | any figure whose part does not say "measure"; never on a chosen or a table part (`ansBox_` only) |
| The padlock | the console only (`nesLock_`, `SWIPE.lock`); the pen's lock tile was removed in 368 | every question. And the console's own padlock was lost at the first touch: `SWIPE.lock` doubled as the drag's dead zone and `pointerdown` set it to 0 |
| Keypad vs keyboard | `ansMaths_` (keypad.js) from the scheme and subject; essays get the phone keyboard (`ansEssay_`) | heuristic; the invariant below asks only that a control exists for the type |
| Calculator | a widget in Tools, not per question | not a question capability |
| Insert | `insertsFor_`: a paper's subject, level, tier and board against `data/inserts.json` (455) | a paper whose source is a printed insert nobody has entered |
| Read aloud | `readAloudFor_`: primary only (KS2/SATs or years 1–6, 394) | every secondary question |
| Help | `helpRow_` in every question card (455) | nowhere |
| Report | `reportTile_` for anybody signed in (395) | signed out, by design |
| Answer control | `qType_` (qtypes.js) → `ansBox_`/`choiceBox_`/`orderBox_`/`cellsBox_`/pen | a table part whose table was on a page in front: the box was judged against the whole words, the card showed only the last chunk, so it had **no box anywhere** |

## What is universal now

`qToolkit_(x)` (find.js) is the one place. For every question part:

- **Zoom**, the first tile of the row on the answer card and on every stem page and long-part page (`qToolTiles_`,
  `qPageTools_`): the whole question, its stems, words, figure, pictures and the picture under the pen, in a sheet,
  `−`/`+` and two-finger pinch, scrolling both ways inside its own box. And **every figure and picture** on a question
  page is a tap to zoom (`QZOOM_FIG` on `figHtml_`, the stem's figure and `pics_`), except while a measuring tool is out.
- **The padlock** beside it (`qLockTile_`): the column will not swipe, wheel or arrow-turn while it is on; a tab or
  link that leaves the page lets go (`qLockStray_`, from `placeCells`). One state for the console and a question,
  `PADLOCK` (overworld.js), its own name, so a touch no longer clears it.
- **The pen** comes with Pen, Ruler and Compass on every question (`padToolsOf_`); `needs` and words can only add.
- **Measuring**: every own figure in a subject that measures (maths, statistics, the sciences, geography, design)
  has Protractor and Ruler, on a typed, a chosen and a table part alike (`measTools_`, `measTiles_`).
- **Read aloud** on every question; content cards keep the primary rule.
- **Help** and **Report** as before.

The table bug is fixed by construction: `cellsBox_` asks whether the cells are in the table **on this card**
(`cellsCardHtml_`), so a table on a page in front gets its row of boxes on the answer card.

## The invariants: js/check-answerable.js (in check-all, slow)

The whole library through `check/lib-full.js`, each part drawn by the app's own builders in jsdom (a fresh app every
600 parts — one window drawing nine thousand cards outgrows the heap). A pending row without its words is skipped (411).

- **words**: the page says something — words, a figure or a table, never "words are missing" (432).
- **figures**: every drawing has a viewBox or a width and height; every picture a source.
- **zoom**: Zoom and the padlock in the row; every figure off the pen a tap to zoom; every stem and long-part page has Zoom.
- **control**: a control that fits `qType_`: a box, ≥2 options, ≥2 items, cells, a sheet, or the pen.
- **self**: the row's own answer (first written way of `accept`, each cell's first way, its `choice_right`, its order,
  its `draw_answer` example through `DRAW_MARK`) is marked right; `zzqq wvxk` and `987654.321` are not.
- **pen**: a drawn part has the pen, with Ruler and Compass.
- **parts**: every page of every part draws without throwing; a `uses` names a part of the same question.
- **insert**: a paper part whose words send you to "the insert", a formulae sheet, an equation sheet or the periodic
  table has an Insert tile.
- **import**: the backend import's own self-test (`libSelfTest_`, below) refuses no row the library holds.

Overflow at 320px is `check/cards.js`'s: a real browser's layout, not jsdom's.

**Counts.** On the code before this change (the check run against `claude/focused-wright-blx2g6`): **23 644 failures**
— zoom 23 157 (no Zoom anywhere), pen 485 (no Compass), control 2 (the table bug). After: **0**, over 8 273 parts
(761 pending without words skipped), 13 765 pages, 3 900 figures, 493 pens, 6 593 self-tested answers, 41 insert-naming
parts; 23 waiting for the owner (below). Two things the first run caught were the check's own: a nonsense answer
`zq9x7` read as 9 × 7 = 63, and the word *insert* as a verb ("Insert two commas").

## The import tests itself (backend)

`libSelfTest_` (content.gs) runs on every item `libImport_` and the Drive import (`libDriveApply_`) write: an item
whose `choice_right` is not among its options, whose cells hold no answer, whose `accept` has no way, or whose
`draw_answer` is not a drawing is **refused** — nothing of that file is written. Options with no `choice_right` are
**flagged**: imported, and named on the Library updates card and by `tools/lib-private.js`. The full marker is the
site's; the sheet asks the part a sheet can. Version stamps bumped together: `2026-10-25-s-self-test-import`.

## Waiting for the owner

- **Edexcel GCSE Greek listening** (1GK0 June 2019 1F, Nov 2020 1H, 18 parts): the options are there, the scheme's
  answers are not (`choice_right` empty). Answerable, never marked.
- **AQA English Language Paper 1** (R0389, R0391, R0396, R0397, R0398, part 2): the source is a printed insert, a
  copyrighted extract, and not in `data/inserts.json`.
- A **protractor on the pen** for "draw an angle of 50°": the measuring tool lays over a `<figure>`, not a pen's
  picture, so a drawn part has Pen, Ruler and Compass but no Protractor yet.

## Checks

check-flow: *the one toolkit* — a typed, a chosen, a table, a drawn and an essay part each have Zoom, the padlock,
Read aloud, Help and Report; the drawn part's bar is exactly pen, ruler, compass (mutation: the toolkit's add switched
off, it fails naming `["pen","ruler"]`); a typed figure measures with Protractor and Ruler; Zoom opens the words and
figure and `+` enlarges; a tap on the figure zooms it; a stem page has Zoom and the padlock; the padlock locks
(`axisFree` refuses the drag), unlocks, and lets go when a tab leaves. *read aloud* now asks that a GCSE question has the
tile and a GCSE content card does not.
