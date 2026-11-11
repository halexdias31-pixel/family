# 991 — size budgets for the cut files (11 Nov 2026)

The health checker listed eleven `js/` files with no size budget: the pieces `shell-*`, `me-*`, `form.js`
and `predicates.js` were cut out of bigger files and never given one. Each now has its current size + 5%,
the rule from 920. No budget was raised; the seven files over budget are still listed.
