# 1216 — the gate red after merges checked with --fast only (13 Nov 2026)

`node tools/gate.js` was red on `claude/focused-wright-blx2g6`: recent merges had been checked with
`check-all --fast` and the journeys only, so secondary checks, the Optimiser ratchet and the gallery had
drifted. What was wrong, and what changed:

- **Checks stale against owner decisions.** The per-tutor `extra_seat_cut` is ignored since a0f23e1 (config B
  prices everyone), so check-profile and check-staff now prove no Save writes it. A student sees no sibling and a
  signed-out visitor no child (`seesWhom_`, 10 Nov), so check-profile, check-hands, check-posts and check-uploads
  seed a booking between the tutor and the family. Backend helpers split out of `doPost` (`registerThank_`,
  `registerMail_`, `postAddNotify_`) are pinned under their own names in check-prefs. `MIGRATIONS` lives in
  `access.gs`; the fixture's rooms carry the 19:00 and 20:00 hours; Site is in Find › Settings (check-inbox draws
  the card itself); Find's text kinds open through the opener table (check-reading, check-texts); `histKind`
  is `HIST_KIND_ROW`'s (check-writings); the card has no figure section and Jobs moved onto it (check-profile).
- **Real faults.** A DM thread (`card_(…, 'msg')`) drew empty: `findCard` sent every `msg` through Find's
  message door and spec, so a panel now keeps its own insides. The venue card lost its 8-bit building in 2c2bab5;
  it is back. The times-tables sprint's Start, Again and Give up had no handler. A saved booking's `Split` row
  is a receipt-only `SPINE_EXTRA` row. The card named a `video` box nobody may write. `legoCount` lets a child
  through the gate (the handler decides) in permissions.json. Orphaned `me-save`, `find-reveal`, `rule-set` and
  `rules-undo` handlers went; the journeys call `meSave_` directly.
- **Tools.** `tools/dead.js` read `accept="image/*"` as a comment opening and called biz-check's functions
  dead; it now opens a comment only after a space or punctuation (check-doors' rule). Functions the journeys and
  checks read through the page are in its KEEP list, as `aheadBusy_` was. check-doors counts a helper's `act`
  argument and `act: x || 'name'` as doors.
- **Size budgets re-set once** (data/settings/size-budgets.json, current + 5%): `js/finder-tags.js` was budgeted
  at 3 KB as a stub and is the build-time answer table (fc59351), 338 KB; `js/cards-render.js` and
  `js/qaliases.js` are new files; `cards-parts.js` and `cards-make.js` grew with the master template (every card
  kind a spec). The first-download total follows them, almost all of it the answer table.
- **Diagram twins.** 661 drawings had no PNG twin and 6 twins no drawing: `node tools/diagram_png.js`.
