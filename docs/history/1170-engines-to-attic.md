# 1170 — the special engines go to attic (10 Nov 2026)

Owner decision 88a: games, chess, the calculator, the whiteboard, the e-ink screen, the racer's map and the
teaching animations are removed, to be rebuilt later as ordinary Find cards. 87a: an item that needs a removed
engine is hidden. `attic/README.md` lists every file moved and how to bring one back; ba02cc6 is the commit before.

## What went

- **Widgets:** console, board games, word & number games, calculator, e-ink screen and whiteboard left `WIDGETS`
  (map.js) and `widgets` in tiers.json. The calculator was the last of them still on (secondary).
- **Files:** `calc.js` and the engine in arcade.js; the chess rules (price-rows.js' tail, chess.js' head; the rest of
  chess.js, the feed's facts and clips, is `facts.js` now); the e-ink widget out of records.js; the whiteboard's
  blank sheet out of find-loupe.js; the animations' drawing out of find-facets, find-timelines and library.js;
  `tools/epaper-verse/` (no longer a served file for build-stamp); every engine's style rule (`attic/css/engines.css`).
- **Find:** no `game` or `reel` kind (widgets-in-find.json says FALSE for both), no Games or Verse front answer, no
  timeline Animation tile, no content-card animation page.
- **Checks:** check-calc, check-chess, check-anims, check-splash-loops, check/anims, check/calc-steady, check-css's
  splash section; the journeys that tested only an engine; the engines' states, press blocks and exceptions.

## What stayed, and why

- **Data:** the animation rows in `data/textbooks.json` (skipped by `libExtrasBooks_`), `data/race-map.json`,
  `data/eink-*.json`, `data/icons.json`. The animation scripts in `tools/` still write their rows.
- **Backend:** the racer's `raceBuild`/`?race=1` and the console's saves stay until the backend is next deployed
  (check-actions already lists them as front-end-gone).
- **The pen's `board:` key handling** (thinning, its ceiling, `ansIsBoard_`): a device may still hold a board.
- **Library cards** is still a tool: a tool's Find card is now `findCard(x)` with the live widget as its insides
  (`KC_OWN.tool`), so check-card-shape exempts no kind.
- **Calculator words in the library** ("Calculator allowed", "Non-calculator") are a paper's needs, not the engine.
- Secondary journeys that use a removed widget as their example (layout, merge, delete, drawn-ahead) report, not fail.
