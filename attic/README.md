# attic/ — switched-off code, kept

Files here are not loaded by the site and not run by any check. They were moved out of `js/` and `check/`
on 5 Nov 2026 so an AI editing the site has less to search and read. Nothing was deleted; the commit
before the move is 389d843 (and the parent of the "Attic" commit).

`.ignore` lists `attic/`, so a pathless Grep skips it.

## Bringing a site file back (attic/js/<name>.js)

The five site files (spotify, favlinks, rewrite, poster, pixel) came back on 6 Nov 2026 (docs/history/1040, batch B); the table below is kept for the checks' sake.

1. `git mv attic/js/<name>.js js/<name>.js`
2. Re-add `'<name>'` to `window.FILES` in `index.html` at its original position (below). Order is load-bearing.
3. In `data/settings/tiers.json` re-add `files.<name>`, `widgetFiles.<name>` and its place in `later` (below),
   set the widget in `widgets` to `core`/`secondary`, then `node tools/tiers.js` (rewrites OFF/LATER).
4. In `js/map.js` the widget's `start` calls `window.init…?.()`; that keeps working as is.
5. Re-add its entries to `js/check-drafts.js` (`git show 389d843:js/check-drafts.js | grep <name>.js`).
6. `node js/check.js`, then `node tools/build-stamp.js`.

| File | index.html FILES position (0-based) | between | tiers.json `later` index | widget |
|---|---|---|---|---|
| spotify.js  | 55 | inbox … favlinks   | 18 | spotify (off) |
| favlinks.js | 56 | spotify … rewrite  | 37 | favlinks (off) |
| rewrite.js  | 57 | favlinks … poster  | 14 | rewrite (off) |
| poster.js   | 58 | rewrite … pixel    | 16 | poster (off) |
| pixel.js    | 59 | poster … missing   | 17 | pixel (off) |

Not moved then, because live code or a core check still read them: `board.js`, `ink.js` (check/pen.js),
`flyer.js` (check-strings.js). Partly-used secondary files (games, posts, shop, booking) stay in `js/`.

## Bringing a check back (attic/js/check-*.js, attic/check/*.js)

All eight were tier `off` (skipped by check-all) when moved.

1. `git mv` it back (`attic/js/x.js` → `js/x.js`, `attic/check/x.js` → `check/x.js`).
2. Re-add its line to the `SUITE` in `js/check-all.js` at the line number below, and `"<file>": "off"` (or a tier)
   under `checks` in `data/settings/tiers.json`. `check/videos.js` also had `"videos": "node check/videos.js"` in package.json.

Original `js/check-all.js` lines (line number: text):

```
158:  { file: 'check-console-saves.js', what: 'a console game\'s save on the account: signed in, owner only, a child may, latest only, 2 MB cap, save data only' },
160:  { file: 'check-race.js', what: 'the racer\'s map: crossings shared, roads every 15 m, the box, DEM fallbacks and cache, ?race=1, an admin builds' },
162:  { file: 'check/race-geometry.js', what: 'the racer map\'s geometry: one road surface, no overlaps or gaps, junctions covered, OSM\'s buildings with roofs' },
169:  { file: 'check-favlinks.js', what: 'Favourite links (509): signed in only, ten at most, http(s) only, own links alone in the payload' },
171:  { file: 'check-rewrite.js', what: 'the Rewrite coach (509, 519): admin only, its own cap, the text fenced as data, the AI narrowed to one fact per answer with a real quote, never a rewrite; the phone\'s substance scanner and copying check' },
188:  { file: 'check-eink.js', what: 'every icon in data/icons.json drawn in black and white only, the e-ink files current, no link away to the install page (470)' },
244:  { file: 'check/whiteboard.js', what: 'the whiteboard notebook: written big it lands small, the pad moves on, gestures undo, rub out, straighten and move', slow: true },
248:  { file: 'check/videos.js',  what: 'the videos card: the bar held as you type, Search lets go, one player, full screen either way up', slow: true },
```

## The special engines (owner decision 88a, 10 Nov 2026)

Games, chess, the calculator, the whiteboard, the e-ink screen, the racer's map and the teaching animations were
taken out of the site to come back later as ordinary Find cards. The commit before the move is ba02cc6. Their data
rows stay in `data/` (animation rows in `data/textbooks.json` are skipped by `libExtrasBooks_`, library.js; the
race map and e-ink sets are not fetched by anything).

| Attic file | Was | Came from |
|---|---|---|
| `js/widgets-engines.js` | the WIDGETS entries console, boardgames, wordgames, calculator, verse, whiteboard, and the calculator's `[data-mc]` click handler | `js/map.js` |
| `js/calc.js`, `js/calc-engine.js` (back in `js/` on 11 Nov 2026 as the question's Calculator tool, with `js/check-calc.js`; their rules are in style.css) | the calculator's screen and its keys/engine | `js/calc.js` (FILES after `mat`), `js/arcade.js` lines 5–488 |
| `js/chess-engine.js` | the board helpers and the move generator | `js/price-rows.js` (its tail) and `js/chess.js` (its head); the rest of chess.js is now `js/facts.js` |
| `js/eink.js` | the e-ink screen widget | `js/records.js` |
| `js/whiteboard-surface.js` | `wbPaint_`, `initWhiteboard`, `WB_SURF` | `js/find-loupe.js` (the pen's `board:` key handling stays) |
| `js/anims.js` | `textbookAnimPart_`, `animStyle_`, `animIds_`, `tbAnimWatch_`, `tbAnimSet_`, `tb-an-again`, `histTimelineChapter_`, `tlExtras_`, `animHash_` and the loop that hung each animation row on its chapter | `js/find-facets.js`, `js/find-timelines.js`, `js/library.js` (plus calls in find-pages, shell-pages, shell-boot, find-boxers) |
| `css/engines.css` | every style rule of the above (and word search, scramble, imposter, Articulate, Flabby Pird, Connect 4's drop) | `style.css` |
| `epaper-verse/` | the e-ink screen's firmware and installer | `tools/epaper-verse/` (was in build-stamp's SERVED) |
| `check/race-fixture.json`, `check/race-practice.json` | the racer journeys' maps | `check/` |

To bring one back: move its files back, re-add its name to `window.FILES` (and `later` in tiers.json, then
`node tools/tiers.js`), its widget to `widgets` in tiers.json, its style rules, and its checks below.

Checks moved with them (were in `js/check-all.js`; tier in brackets):

```
28:  { file: 'check-splash-loops.js', what: 'the rebuilt splashes: one seamless loop each, centred' },   [secondary]
111: { file: 'check-calc.js',  what: 'the calculator engine: exact fractions, roots, powers, degrees, DEL as a unit' },   [core]
113: { file: 'check-chess.js',  what: 'the chess move generator, counted by perft' },   [secondary]
127: { file: 'check-anims.js', what: 'the books\' animations: one source, kept and drawn as their rows', par: true },   [core]
230: { file: 'check/anims.js',   what: 'every textbook animation inside its card, and still when asked', slow: true },   [secondary]
245: { file: 'check/calc-steady.js', what: 'pressing keys never changes the calculator\'s size or shape, nor any key\'s (472)', slow: true },   [core]
```

`js/check-css-splash.js` is section 9 of `js/check-css.js`. The journeys that tested only the engines (games,
racer, maze, console, connect 4, e-ink, a content card's animation) are in ba02cc6's `check/flow/03, 04, 06, 07, 12, 19`.
