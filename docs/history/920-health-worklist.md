# 920 — Health finds the one-off cases, line by line

The owner (4 Nov): changes are slow because the code is huge files full of one-off cases; make the health checker
FIND them, with exact locations, so nobody has to search. Losing complexity, even features, is acceptable for stability.

- **tools/health.js** now scans every CORE app file (tiers.json) and the backend once, with a small scanner that knows
  strings, templates, regexes and comments, and records five priced signals plus empty catches:
  one-off (0.05 each, cap 20), long-fn (0.01 per line over 80, cap 10), big-file (0.001 per line over 1500, cap 10),
  dup (0.02 per line of a repeated 6+-line chunk, cap 10), nest (0.05 per run over 4 levels, cap 10); catch is listed
  only, still priced by stability's `catches`.
- They replace stability's `special`, `longfiles`, `longfns` and `duplicates` in the code part, so nothing counts twice;
  tools/stability.js and its own card are unchanged.
- **The worklist:** data/health.json `worklist` holds every finding `{file, line, kind, text, cost}`, dearest first.
  `node tools/health.js --list [n] [--kind one-off|long-fn|big-file|dup|nest|catch]` prints `file:line  kind  text`.
- **The card** (siteHealthCard_, js/missing.js) shows the five dearest under "Fix first", file:line in plain words.
- The score fell 76.1% → 63.3% (code 69.5 → 37.5): the stricter budgets see what the old ones let through. It is a
  new baseline, not a regression. The dearest: doPost() 3591 lines, doGet() 1205, js/find.js 12225 lines, drawMarker_() 645.
