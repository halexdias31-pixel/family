# 1040 — unattended health rounds

Each round fixes what does not change the look, plus what the owner asked for outright
("pressing a tile never adds/removes/moves other controls"); anything else visible goes to `docs/owner-questions.md`.

## Round of 2026-11-05

- Reports refreshed: `tools/facet-data.js` (facet-health), `check/qcard.js` run once.
- stable-controls 12 → 9: the status lines under Save (`.me-said`, `#pin-said`) keep one line of room from the start, so Change PIN's message no longer moves Try voice and the report box. The rest are questions.
- static-controls 5 → 2: `check/qcard.js` read a one-line `on('card-share', …)` as never ending, so `myResultNew_` (tags, not controls) was blamed; the scan now ends a handler at the next top-level declaration. Talmud's size tiles are redrawn inside their own row instead of replacing it.
- check-actions red → green: favLinksSave, rewriteCheck, rewriteIdeas carry "switched off, kept for attic/js/…" reasons.
- A tombstone comment pair (referral sheet) in `js/me.js` dropped; the story is the `on('my-referral')` history above it in git.
- Dup waitlist rows in `backend/dopost.gs` left: their fields differ, so merging could change what is written.

## Round of 2026-11-05 (2): Find cut into sixteen files

- `js/find.js` (12,081 lines) is now `js/find-finder.js`, `find-facets`, `find-history`, `find-boxers`, `find-parts`, `find-marking`, `find-cells`, `find-pen`, `find-pad`, `find-loupe`, `find-figures`, `find-aloud`, `find-levels`, `find-bundles`, `find-pages`, `find-measure` (all ≤ 790 lines), in that order where `find` stood in `FILES` and `LATER`.
- Cut in source order at top-level statement boundaries (acorn), not by the plan's prefix groups: order unchanged means load order unchanged. No edits inside any block; one statement moved: `window.CARD_EXTRAS_MORE = …` to the end of `find-boxers.js`, after `bibleOpts_` (a function no longer hoisted across files).
- `tools/find-src.js` gives the checks Find as one text (`findSrc()`) or its file list (`findFiles()`), read from `index.html`; none found throws. About 25 checks and tools now read it instead of `js/find.js`; check-drafts, check-writings, check-finder, check-widgets, check-tiers, check-strings, check-changed, facet-hues and health.js know the pieces.
- `tools/structure.js` ratchet: a removed file's functions and counts pass to the files cut from it, so a split is not new giants; `health.js --changed` weighs Find's pieces' empty catches together and keys one-offs to `js/find.js`.
- Fighter-name facet mismatches (11): the data is right (a fight has two fighters); what the tag shows is a look, so it is a question.
- The § stories of the pieces stay in `docs/notes/js/find.js.md`.
- Budgets raised by hand, for the split alone: coupling `js/me.js` 184 → 187 and `js/talmud.js` 25 → 29 (they read Find's names, now from several files); `searchBytes` 7,472,098 → 7,472,640 (the checks' new lines that read the pieces). A `--changed` run before `git add` measures untracked pieces as absent and tightens wrongly; stage new files first.

## Round of 2026-11-05 (3): me.js, shell.js and keypad.js cut in order

- `js/me.js` (4,867 lines) is `me-account`, `me-messages`, `me-roles`, `me-shelves`, `me-settings`, `me-card`, `me-people`; `js/shell.js` (3,932) is `shell-boot`, `shell-layout`, `shell-pages`, `shell-click`, `shell-api`, `shell-hold`; `js/keypad.js` (1,785) is `keypad-keys`, `keypad-pad`, `keypad-edit`. All ≤ 780 lines, in place in `FILES`, `LATER` (keypad) and tiers.json (`files`, `later`).
- Same method as round 2: acorn top-level boundaries, pure moves, concatenation byte-identical to the old file. A scan for load-time use of a later piece's name found none (two hits were object keys).
- One edit: keypad.js declared `kpSelect_` twice; the first (overridden by hoisting, same behaviour) is deleted, since across files check.js counts it as declared twice.
- `tools/piece-src.js` (`pieceFiles(base)`, `pieceSrc(base)`) reads any cut file back by its old name from `index.html`; none found throws. check-anims, api-deadline, css, people, press-hold, profile, surfaces, tiers, voice, drafts, loading, suggest, widgets, strings, keyboard, aimark, library, flow, check/motion, tools/tiers, cache, structure and health.js read the pieces.
- `tools/isolation.js` counts the pieces of me/shell/keypad as one caller, as the old file was: the cut otherwise raised six find-* coupling budgets by counting each piece as a new file.
- check-widgets failed before this round: every widget is off (tiers.json, 4 Nov), so none draws itself and each `pure: true` read as unproved. A stale check, not a site change: off widgets are now left out of the `pure` judgement.
- `searchBytes` kept under budget by deleting nine unused declarations in `js/check-flow.js` (`CARD_ORDER_`, `seatSaid_`, `seatParts_`, `seatNote_`, `placeholderFaults_`, `pageHead`, `rowSay`, `earCut_`, `resPick_`) and `PLACEHOLDER_MARKUP_`.
- Browser 390x844: sign in, Find menu pick, a question keyed on `.kp-key` and Checked, Settings field changed and Saved (`updateProfile` sent, "Saved"), sign out — no page errors. No owner questions this round.
