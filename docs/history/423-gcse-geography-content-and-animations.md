# 423 — GCSE Geography: four new chapters, every chapter fuller, ten animations

**Asked for as** GCSE Geography, AQA-style: take stock of what the book had, add or upgrade chapters across natural
hazards, ecosystems, UK physical landscapes, urban issues, the changing economic world, resource management and
geographical skills, and draw ten teaching animations — plate boundaries, earthquake waves, tropical storm formation,
coastal erosion and longshore drift, a meander becoming an ox-bow lake, the demographic transition model, the greenhouse
effect, the water cycle, 4- and 6-figure grid references, and contours to a 3D profile — each as a script
`tools/gg_<topic>.py`.

### What the book had

`TB-GCSE-GEOG` had fourteen chapters in AQA 8035 order, taking coasts, rivers, hot deserts and water as the options:
5–7 key words and 4–5 worked lines each, formulas only in the skills chapter, and no animation at all. Missing: the
other options (cold environments, glacial landscapes, energy, food), and most of the vocabulary the animations would
name (focus, seismic waves, Coriolis effect, greenhouse effect, swash, meander, ox-bow lake, hydrograph, birth and death
rates, easting, cross-section).

### What changed

- **Chapters 1–14, fuller.** Every one gained key words (38 in all), appended so the old ones keep their place;
  chapters 1, 5 and 13 gained a fifth worked line (the check's ceiling is five); chapter 10 gained two formulas
  (natural increase rate, GNI per head). The title page's summary says eighteen chapters and names the options.
- **Chapters 15–18, new:** Cold environments, Glacial landscapes, Energy management, Food management — the options the
  book lacked, appended after chapter 14 because a chapter's number is half its Ledger id (`TB-GCSE-GEOG#n`) and
  renumbering would orphan every existing row. Each is a card with `lib_pending: "True"`.
- **Ten animations**, rows under the chapter each teaches, scripts in `tools/gg_*.py`, ids in `tools/anim_row.py`'s
  list and CLAUDE.md, one `proof` row each in `data/settings/splashes.json`:

  | id | chapter | script | `about` |
  |---|---|---|---|
  | ggplate | 1 | gg_plates.py | Constructive, Destructive, Conservative margin |
  | ggquake | 1 | gg_quake.py | Conservative margin |
  | ggstorm | 2 | gg_storm.py | Tropical storm, Eye |
  | gggreen | 3 | gg_green.py | Enhanced greenhouse effect |
  | ggcoast | 6 | gg_coast.py | Hydraulic power, Abrasion, Longshore drift |
  | ggwater | 7 | gg_water.py | Lag time |
  | ggmeander | 7 | gg_meander.py | Meander (how a worked line opens) |
  | ggdtm | 10 | gg_dtm.py | DTM (how a worked line opens) |
  | gggrid | 14 | gg_grid.py | Four- and Six-figure grid reference |
  | ggcontour | 14 | gg_contour.py | Contour line |

### Decisions

- **Every `about` names a word the pinned seed already has.** A fresh clone rebuilds `data-private/` from
  `LIB_SOURCE_COMMIT`, which holds the old chapters' words, not the new ones. An animation about "Seismic waves" would
  pass here and fail there. So each animation hangs on a chapter 1–14 and names a word or worked-line opening the old
  chapter already had; none sits on a pending chapter. Checked by moving `data-private/` aside and running
  `check-textbooks` and `check-anims` against the seed: green, "4 pending card(s) … NOT checked for words".
- **The water cycle is in the rivers chapter**, on `Lag time`: it runs from evaporation to rain to runoff and
  infiltration, then draws the storm hydrograph whose two peaks are the lag time — the reason a geographer draws the
  cycle at GCSE.
- **The grid-reference animation finds 456 723**, the chapter's own worked line ("45 and 6 tenths along, then 72 and 3
  tenths up"), with a church at that point; the zoom is one `transform` on the map group, its lines kept thin by
  `vector-effect: non-scaling-stroke`, and a `clipPath` (an attribute, since a row's CSS may not hold `url(`).
- **No `d` animation.** Paths do not morph (Safari will not animate `d`), so the meander is five pictures years apart
  crossfading, and lines are drawn by `pathLength="1"` and `stroke-dashoffset`.
- **Scripts write through the unchanged `write_anim`.** It rewrites only what a row already has, so each row was first
  written whole from its script's own output by a one-off seeder (not committed); after that the script is the source
  and `check-anims` re-runs each on a copy, byte for byte.
- **`SPLASH_CACHE_MAX` 200 000 → 400 000.** The ten come to about 97 000 characters, taking the books' 39 animations to
  about 289 000. Other branches of this batch add drawings too (410's GCSE Maths seventeen also raised it to 400 000):
  merged together they may pass it, and `check-anims` will say so — raising it again is that merge's decision.
- **`lib_pending` support is the batch's shared one**, copied as other content branches have it (`check/lib-full.js`
  `pending`, `check-textbooks.js` skipping a wordless pending card, "Coming soon." in `libSay_`); docs/library.md.

### Getting the words to the Ledger

The import file (written by `node tools/lib-private.js drive-pack … --ids TB-GCSE-GEOG#1,…,#18`, never in the repo)
carries the eighteen items whole — chapters 1–14 with their fuller words, 15–18 new with their cards under `cards`. It
goes into the Drive folder `family-library-imports`; the owner taps *Import library updates* in Business.

### Looked at

Each animation rendered at 390 px wide at six moments (`document.getAnimations()` paused at set times) and read frame by
frame: labels inside the box, the steep side steep, the neck narrow, the lag time between the right peaks.
