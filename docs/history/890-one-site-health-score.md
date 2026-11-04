# 890 — One site health score

The owner (4 Nov) wanted one universal score instead of Stability (730, 860) and Logic health (770).

- `tools/health.js` writes `data/health.json`: code stability (core, `tools/stability.js`) 40%, Find logic
  (`data/logic-health.json`) 35%, UI simplicity (style.css counts: !important, px and colour literals, same-selector
  order overrides, selector count, z-index values, transforms/absolute) 25%. Weights and caps are in its header.
  Top offenders are every signal priced in points of the overall score; the five dearest, one plain line each.
- `--check` never walks the funnel: logic-health.json is stale when an input's last commit (or an uncommitted edit) is newer.
- Find › Settings: kind `health` lists `health` (Site health) and `missing` (What's missing). The Logic health card
  (`LOGIC_SHOWN`, missing.js) and the Stability card (`STABILITY_SHOWN`, me.js) are switched off, code kept.
- Checks: on the owner's order only `node js/check.js`, the tools, then build-stamp.
