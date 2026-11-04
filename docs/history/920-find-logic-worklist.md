# 920 — Find-logic worklist in the health score

The owner (4 Nov) asked for four more Find-logic signals in `tools/health.js`, each a located worklist kind
(`node tools/health.js --list [n] [--kind k]`), folded into the Find logic part (walk score less a capped penalty each):

- `tag-colour` (0.1 each, cap 10): `TAG_OF` colours a FIELD, so every answer of one menu wears one colour. One item per menu.
- `menu-rule` (0.05 each, cap 15): the rule should be "ask the question that splits the remaining cards best". `nextFacet`
  asks the first in the tab's sort_order that `facetWhy_` passes, so the order itself is listed, plus every walked node
  (tools/logic-health.js now records each askable facet's entropy in bits) where another askable facet splits better by > 0.1 bit.
- `tag-asked` (1 each, cap 10): a facet carried as a tag by a front-page card that no walked node ever asks.
- `find-one-off` (0.02 each, cap 10): a literal card-kind, field, facet/key or named-finder test in js/find.js or js/shell.js.
  Keyboard keys and mark-protocol/row-part kinds are left out to keep false positives low.

The walk still runs only in tools/logic-health.js (slow); health.js reads its `menuRule` and `tagAsked` lists.

`node tools/health.js --changed` is the ratchet: over files changed against origin/main plus uncommitted, it re-runs the
worklist (when find.js, shell.js or the walk changed) against the committed data/health.json `work` (matched by kind, file
and text, so moved lines are not new) and counts empty catches per changed .js/.gs file against the last commit. Green: one line; red: each new finding.

`--where WORD` prints every definition (function/const, `field:`/`id:`/`kind:` literal, `screen('…'`, key, CSS token or class)
and then every use of WORD across js/, backend/, data/settings/, style.css and index.html, in about 0.1 s.
`--fix` makes behaviour-identical edits only, then runs js/check.js: a hex literal outside a var() in a rule that equals a
:root token defined once (never re-themed) becomes var(--token), and check-catches' ceiling drops to the real count. Empty
catches are listed, not rewritten, because oops_ reports to the backend. Its first version also swapped in component-scoped
tokens and wrote var(--x, var(--x)); that was caught in the diff before commit and the rule narrowed. Today it finds nothing to do.
