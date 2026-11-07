# 1110 — frozen code deleted (second cut: games.js and racer.js)

The owner (docs/philosophy.md "How we work"): only Find, Library, Questions, Settings and Bookings
matter; unused code is deleted and git history is the attic. Restore anything below from **cfc19fa**:
`git checkout cfc19fa -- <path>`, then put the stem back in `index.html`'s FILES/LATER lists and in
`data/settings/tiers.json` (`files`, `later`, `frozen`), and run `node tools/tiers.js`.

## Kept, moved

- `js/calc.js` (new) — the calculator widget's screen (`initMiniCalc`, `CALC_KEYBOARD`) and its
  key-row sizing (`calcFit_`, which Find's pages call). Cut unchanged out of games.js; the engine
  stays in arcade.js.
- `profileAge_` — moved into `js/me-account.js` beside Apply to teach, its one remaining reader.
- `SWIPE` was never in games.js (it is in overworld.js), so nothing moved for it.

## Deleted files (restore from cfc19fa)

- `js/games.js` — times tables, timer, calendar, timetable, touch typing, two-player chess, the reels'
  slides, the videos card and its admin form, the Console (NES/emulator), board games and word games.
- `js/racer.js` — the Colliers Wood racer.
- `js/check-reels.js` — it tested games.js's clip rules; reels are off.
- The two YouTube Short journeys in `check/flow/01-cheat-sheet.js`: their slides were drawn by games.js.

## Also removed (same commit, restore from cfc19fa)

- Flabby Pird and the carried-over game state at the end of `js/receipt.js` (`initFlappy`, `fitCanvas_`).
- The Videos door in Find (`videoDoorItems_`, `videoDoorCard_`, `find-doors.js`; its row in
  `find-finder.js`): it read games.js's video list, and Videos is off. The `vid*` facets stay in
  `facets.json` as data.
- About 400 rules in `style.css` whose every selector named a class only games.js, racer.js or Flabby
  Pird drew (`.nes-`, `.race-`, `.kt-`, `.tmt-`, `.vid-`, `.scr-`, `.imp-`, `.c4`, `.mz`…).
- Their entries in `check-drafts.js`, `check-widgets.js` (the word-deck comparisons and the
  game starters' reasons), `check-surfaces.js`, `check-css.js`, `check-strings.js`, and the
  game getters in `check-flow.js`; the guarded calls in arcade.js, overworld.js and me-account.js.
- The backend handlers (`consoleLoad`, `consoleSave`, `filmsSync`, `media*`, `raceBuild`, `saveScore`,
  `saveTimetable`, `saveTtHighscore`) stay with a reason in `check-actions.js` until the backend is
  next redeployed.

## Kept

- The widget rows in `js/map.js` (console, boardgames, wordgames, videos, timer, timetable, typing,
  calendar): `tiers.json` marks them off, so they draw as "Coming soon" from data; their `start`/`draw`
  reach `window.*`, so nothing undeclared is named.
- Reels in posts.js and the feed in overworld.js reach `window.feedSlide`/`window.clipSrc_`, so they
  draw nothing rather than throw.

## Not deleted, and why

- `mechanics.js` and `chemistry.js` are not borrowed-from games: every function in them is Find's
  Library source (`mechItems_`/`chemItems_` in find-aloud.js, `mechCard_`/`chemCard_` in
  find-finder.js). Moving them into a find-* file would only rename them, so they stay; they are
  Library, not a frozen feature.
- overworld.js, arcade.js, posts.js, chess.js still hold game leftovers (the feed, the timer face,
  the calculator engine, the reels); each is its own later cut.
