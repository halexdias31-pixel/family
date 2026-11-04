# 910 — Health round one: dead code and core empty catches

The owner (4 Nov): optimise for scalability, ease of change and stability, guided by the Site health score (890).
Time-boxed to the two cheapest steps. Score 74.5% → 76.1% (code 65.6 → 69.5; Find logic 84.6, stale, not re-walked; UI 74.7).

- **Dead code:** of the 16 names check-dead lists, only `whyThisQuestion` (find.js) and `typedFirstWords_` (people.gs)
  had no reference anywhere, checks included; both deleted. The other 14 are still named by a check or by other
  code and stay. Their notes in docs/notes stay as history.
- **Empty catches in core files:** a one-line `try { … } catch (e) {}` in me, shell, find, submit, answers, keypad,
  resource, rules and boot now either says why it is expected (storage, focus, the browser refusing, already
  stopped: 59) or reports with `oops_(e, '<file>:<function>')` (121). data.js and library.js load before shell.js
  defines `oops_`, so they only got reasons. check-catches' ceiling 526 → 346.
- `backend/people.gs` changed (a dead function removed); it goes live at the next Apps Script sync, no version bump needed.

Left for round 2: the facet order (finer-before-coarser: wAuthor/wForm/wText before wWork, wUnit before wChapter,
division and decade before fighter/year, key stage before level — re-walk tools/logic-health.js after);
style.css (radius literals onto `--r*` tokens, five same-selector duplicates, a `--z-*` scale); the 14 remaining
dead names once their check references go; multi-line empty catches.
