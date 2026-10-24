# 431 — deleting what could never run

A structural review listed code that no person could reach. Each item was grepped across `js/`, `check/`,
`backend/`, `tools/`, `index.html`, `sw.js` and `data/settings/` before it went; what follows is what went, why it
was unreachable, and the one item that stayed.

## The map and the 3D board (about 1,500 lines)

- **js/map.js, the flat map** — `MAP_WORLD`, `mapWorlds`/`mapWorld`/`mapNodes`/`mapLayout`/`mapProject`, the hand-traced
  rivers (`WANDLE`, `BEVERLEY`, `CRANE`, `THAMES`), `PARKS`, `BUILDINGS`, `ROADS`, `mapTerrain`, `drawOverworld` and the
  `map-world`/`map-node` handlers. `drawOverworld` drew into `#map-board`, and no screen, widget or check creates an
  element with that id: the Overworld widget was removed long ago, so the function returned on its first line every
  time. `mapPlaces` (arcade.js) had no other reader and went with it. `WIDGETS` and the high-score board stay.
- **js/overworld.js, the WebGL board** — `OW*`, `ow*`, `initOverworldBoard`, the `ow-tap` handler: the same `#map-board`
  mount. The window error banner and the sheet flick at the top and bottom of the file stay.
- **style.css** — the `.map*` block, the arcade-cabinet frame (`.widget-full:has(.map)`), `.map.ow` and the `.ow-*`
  rules; `.map-arrow` dropped from two selector lists. `--css-version` is `2026-10-24-h-delete-dead`.
- **The backend half** — `payload.landmarks` (and `landmarks()`), the `?map=` branch of `doGet`, `fetchMap` and its
  `simplify_`, `tidyRing_`, `seedLandmarks` (both RUNNABLE entries), the `colliers-wood-landmarks` setup step (its id
  stays spent, noted in place), the health report's unmeasured-landmark rows, and the `landmarks`, `landmark_parts`
  and `map` tabs from `TAB`, `SCHEMA` and `WHERE` together. Rows already on a real sheet are untouched: nothing reads
  them now. `data/settings/landmarks.json` is deleted.
- **The showcase gallery** — `gallery()`, the `?galleryOnly=1` branch, `gallery`/`galleryError` in the payload literal,
  the `showcase_folder_id` config row (constants and `config.json`) and `authoriseDrive`'s showcase line. No screen
  fetched `galleryOnly`; `feedPosts` read `DATA.gallery` only as a fallback behind `DATA.posts`, which is always sent.
- **Checks** — check-flow's "a landmark is the same shape whichever way it is turned" and its `tiles` hook,
  check-widgets' `initOverworldBoard` exception, check-uploads' showcase case, `fetchMap`/`gallery`/`landmarks` out of
  check-dead's KEEP list, `landmarks`/`gallery` out of check/fixture.json and check/live.js.

## Three "Not built yet" widgets

`contest` (Games), `drill` "Practice" (Tools) and `legotrade` (Tools) drew a heading, a line and "Not built yet." and
had nothing to press. They are gone from `WIDGETS`, and so are the two check-flow journeys that asked for the contest
and LEGO cards in their slots. `placeholderFaults_` stays: the Progress placeholder still uses it.

## terms.js

The legal-documents feature was never built: no `acceptTerms` handler, no tab, and `DATA.terms` never sent (three
`check-payload` ACCEPTED entries and one `check-access` ACCEPTED_MISSING said so). The Staff hub (405) draws the tutor
terms from `brand('tutor_terms')`. The file, its `index.html` entry, the `doc` finder kind, `docItems_` in the found
list, `termsPages_` on the account column and in its pager are gone. `termsProse_`/`termsMarks_`, which the Staff hub's
agreement card does use, moved into staff.js. The `termsAccepted` fixture key went too, since `doGet` never sent it.

## Brand keys, exams, stale notes

- `seat_price`, `class_size`, `session_hours` and `email` are out of `data/settings/brand.json`: nothing calls
  `brand()` with them. `email` was a personal address in a public repository; notices go to the `owner_email`
  config key. The settings README's sentence that repeated the address is rewritten.
- `saveExam`/`deleteExam` (dopost.gs) and their ACTION_ACCESS entries are deleted: no front end posts them. Exam
  dates live on the profile in Settings; `doGet` still reads the `exams` tab for what is already there.
- data/settings/README.md no longer says "Nothing reads these files yet" (settings.js reads them on every load), and
  columns.json's `TAB_HOME` note moved from `stuff` to `feed`, where `TAB_HOME` really points.

## What stayed: the old whiteboard (find.js)

`WB_ITEM` and `padIsBoard_` are live (board.js's notebook keys on `WB_ITEM`). `wbPaint_`/`initWhiteboard`/`WB_SURF`
draw into `.wb-box`, which the app no longer makes, but check/pen.js, check/press.js, check/whiteboard.js and about
six check-flow pen journeys make a `.wb-box` and call `initWhiteboard()` as their drawing surface. Deleting it means
rewriting those journeys onto the notebook, which is the pen branch's work (check-widgets already says so). It was left.

Stamps: `2026-10-24-i-delete-dead` (all four).
