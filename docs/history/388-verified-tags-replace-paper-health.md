## Two verified tags on every question replace the paper health score

**Asked for as** *"delete the current health check system, it complicates things. Each question will
have an accuracy verified tag and a functionality verified tag."*

**Deleted:** `paperHealth_`, `ableOf_` and the `HEALTH_*` constants (js/library.js), the Health tile,
its sheet and `paper-health` handler (`healthBy_`, `healthOf_`, `healthTiles_`, `healthListHtml_` in
js/find.js), the `pulse` tile icon, the `.health-*` rules and `--tag-health` (style.css),
`js/check-health.js` and its line in check-all, and the flow check that drove the tile (354, 355, 383).
The backend's `?health=1` data-problems report is a different thing (the sheet's own faults for an
admin) and stays.

**Added:** two ordinary funnel tags in `FACETS`, read by `verifyTags_` (find.js) — no door, no row,
no rule of their own; a question carries exactly one answer of each.

- **Accuracy** — `Accuracy verified` when the row's `verified` is `True`: its answer was checked
  against the official mark scheme. Otherwise `Accuracy unverified`.
- **Function** — `Function verified` when the type's protocol is complete (`qtIncomplete_` empty) and
  the part is machine-marked (`qtMachine_`), both js/qtypes.js. Computed, never stored.

**Where `verified: True` was set — only where the repo records a mark-scheme check (225).** The
`tools/refine-*.py` scripts that read the scheme PDF: Edexcel 1MA1 Foundation June 2024 Papers 1, 2
and 3 (`refine-1f-2406-p1.py` read the scheme's arithmetic; `refine-f2406-2/3.py` the scheme PDFs)
and KS2 2019 Papers 2 and 3 (`refine-sats2019-23.py`). 206 question rows. Not set: Higher 2017
Papers 1, 2 and 3 and Foundation May 2017 Paper 1 (the scripts say the schemes were not in Drive and
answers were re-derived), KS2 2024 (no source at all), and everything else. `pages_checked` says a
page count was checked, not an answer, so it is no evidence.

**Counts at the commit:** 8010 question parts; Accuracy verified 206; Function verified 6196.
`check-qtypes.js` runs find.js's own `verifyTags_` on every part and fails if one lacks either tag;
`check-library.js` allows `verified: True` only.
