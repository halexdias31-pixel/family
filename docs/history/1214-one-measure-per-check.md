# 1214 — one measure per check (rulebook audit, 12 Nov 2026)

The rulebook audit found checks and Optimiser rules measuring the same thing two ways, so they could disagree.
Each measurement now has one home that the check and the Optimiser both read:

- `tools/css-scale.js` — the fixed scale and palette. `js/check-scale.js` gates its hard set (bare lengths, corners,
  tap targets, colour literals incl. named colours, missing tokens); `tools/health.js` scores `font-scale`, `space-scale`,
  `radius-scale`, `colourlit` from the same parse. `check-style-sources` no longer counts css colours (check-scale holds
  them at zero); it keeps the `!important` allow-list and js/ colour literals.
- `tools/catches.js` — empty catches. `check-catches` (now js/ and backend, ceiling 268 = today's count), health `catch`
  and stability `catches` (the count, not the ceiling) read it.
- `tools/dead.js` — functions nothing calls. `check-dead`, stability `dead` and health `dead` read it (no stdout parsing).
- `tools/one-template.js` — `check-one-template` and health `one-template` (no stderr parsing, no 60-line cap).
- `tools/comments.js` now holds tombstone detection: `check-comments` fails on one; `tools/ai-cost.js` scores the same list.
- `check-loading --json` is health's `own-wait` (its crude regex is gone; `Working…` joined check-loading's phrases).
- `check/stability-guard.js` folded into `js/check-stability.js --base DIR` (CI updated).

Renames for names that meant two things: `check/schema.js` → `check/library-schema.js` (the library schema module;
`js/check-schema.js` is the check), `js/check-markers.js` → `js/check-conflicts.js` (merge-conflict lines; `markers`
is health's TODO/FIXME rule), `check/card-facts.js` → `check/card-render.js` (the browser-rendered card; `card-shape`
is the static shape, `one-template` the builder). `check-spine` stays: journey 32 does not test the spine.
