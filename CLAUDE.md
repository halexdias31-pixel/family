# @family. — where to start

A tutoring business's site: static front end on GitHub Pages, Google Apps Script backend (`backend/`), spreadsheets as the database.

**The rulebook is `data/settings/rules.json`** — the one place rules live. Read it as `docs/rules.md` (generated: `node tools/rules.js --write`).

## Reading cheaply
- Grep first, then Read a line range. Never Read a big file whole (`style.css`, `check/states.js`, `data/*.json` — use a `node -e` one-liner).
- Cut files are read as one: Find by `tools/find-src.js`; `me-*`, `shell-*`, `keypad-*`, `book-*` by `tools/piece-src.js`.
- A comment ending `§` was shortened; its story is in `docs/notes/<path>.md`. A pathless Grep skips `docs/`, `data/`, `attic/`.

## Commands
- `node js/check.js` after every change; `node tools/rules.js` after touching the rulebook.
- `node tools/build-stamp.js` last, after any change to a served file (`--check` verifies).
- `node tools/gate.js` before every merge; never merge red.
- Optimiser: `node tools/health.js --changed | --where <x> | --list [n] | --plan`, `node tools/ai-cost.js -v`, `node tools/facet-data.js -v`.

## Reference, not rules
- `docs/map-detail.md` (screens, data, deploying, CI; grep it) and `docs/history/` (`grep -ril <keyword> docs/history`).
- `docs/owner-queue.md` is the to-do list.
