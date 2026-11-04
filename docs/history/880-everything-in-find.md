# 880 — Everything in Find; one finder; layout editing off

The owner (4 Nov): "I basically want everything in the finder... Only one finder for now. No more ability to move widgets."

- `res` (Find 2) is `active: "FALSE"` in data/settings/columns.json. Its code stays.
- Every switched-off column (`DATA.columnsOff`, settings.js, from columns.json) and every off widget (`TIER_OFF_WIDGETS`,
  from tiers.json) is one Find card of kind `soon` under the first answer "Coming soon" (`soonItems_`, `soonCard_`, find.js):
  its name, the first plain line of its notes, brand('comingSoon', 'Coming soon') and Suggest. Turning one back on removes its card.
- Layout editing is off behind `LAYOUT_EDIT = false` (layout.js): no move, merge, new-column, front-door or column tiles,
  and `layoutNow_()` returns null, so a saved config `layout` is ignored on load. The code stays.
- Checks: on the owner's order only `node js/check.js` was run; the suites were not.
