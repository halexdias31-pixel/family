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
