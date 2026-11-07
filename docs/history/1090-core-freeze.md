# 1090 — the core freeze (7 Nov 2026)

The owner: for now only **Find, the library, questions (practice, question pages, marking), settings and bookings** matter.
Everything else is frozen to make work and CI quicker and cheaper. Nothing is deleted.

## What is frozen
- **Screens** off (`active: FALSE` in `data/settings/columns.json`): saved, spotlight, feed, dm (Messages), shop, web, apprentices.
  Bookings became core (`screens.booking`, `files.book`, `check-booking.js` in `data/settings/tiers.json`; booking journeys match `journeys.core`).
- **Widgets** off in `tiers.json` (shown as "Coming soon" in Find): every Tools/Games widget but calculator and libcards.
  Their files (board, ink, flyer, poster, pixel, spotify, rewrite, favlinks) are `off` and never fetched.
- **Health**: `tiers.json` `frozen.files` lists the js/ stems `tools/health.js` leaves out of its score and worklist.
- **CI**: the blocking `check` job is now `fast` + the eight core flow parts (~8–10 min wall clock, in parallel).
  The browser and heavy groups moved to the report-only `secondary` job.

## How to unfreeze (one data edit each)
- A screen: its `active` back to `TRUE` in columns.json.
- A widget: its line back to `secondary` in tiers.json, its file in `files` back to `secondary`, then `node tools/tiers.js`.
- Health: take the stem off `frozen.files`.
- CI: move the browser/heavy lines back into the `check` matrix in `.github/workflows/checks.yml`.
