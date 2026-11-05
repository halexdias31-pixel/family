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
