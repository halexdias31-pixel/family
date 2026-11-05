# attic/ — switched-off code, kept

Files here are not loaded by the site and not run by any check. They were moved out of `js/` and `check/`
on 5 Nov 2026 so an AI editing the site has less to search and read. Nothing was deleted; the commit
before the move is 389d843 (and the parent of the "Attic" commit).

`.ignore` lists `attic/`, so a pathless Grep skips it.

## Bringing a site file back (attic/js/<name>.js)

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

Not moved, because live code or a core check still reads them: `board.js`, `ink.js` (check/pen.js),
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
