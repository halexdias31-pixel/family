# 1210 — the Optimiser counts rules, not weights (12 Nov 2026)

Owner, 12 Nov: "maybe the things it measures are needed, but the percentage it values each thing is arbitrary."
He was right. `tools/health.js` blended five parts by hand-picked weights (code .28, Find logic .25, UI .18, AI cost
.17, business .12), and each signal took off a hand-picked amount per finding up to a hand-picked cap (selectors 0.002
over 1500 cap 15, `VARIETY_PENALTY`, `FIND_PENALTY`, ...). A different set of numbers gave a different "best next fix".

**Now every measure is a rule over a countable population**, and its score is the things that follow it ÷ the things
it applies to: functions within 80 lines ÷ functions, CSS font sizes on the `--fs` scale ÷ font sizes, walked menus with
no menu-rule finding ÷ walked menus, variety families ideal ÷ variants. A check with no population (most of the walks'
findings) is one thing: 1/1 when it passes, 0/1 when it does not. **The total is the plain average of the rules**,
each counted equally; the groups (code, Find logic, design and UI, AI cost, business) are for display only. The
`weights` field in data/health.json is now each group's share of the rules, so the Checks card's weighted total is the
same plain average. `node tools/health.js` says what the % means; `-v` prints every rule as followed/total.

**Dropped**, no population and nothing wrong in itself: the selector count, distinct z-index values and position/
transform uses; px literals (the three scale rules hold sizes now); stability's `catches` (the `catch` rule counts
the same catches). A business job run "partly" no longer counts ½: it is not yet run.

**Added** (owner): every card on the one template (`one-template`, js/check-one-template.js's population: cards made
through findCard/card_); sizes and colours from the fixed scale (`font-scale`, `space-scale`, `radius-scale`,
`colourlit`); one answer-box width (`answer-width`).

**Why some answer boxes were longer than others.** A multi-value answer drew one box per value in a wrapping flex
row, sized by kind: maths boxes `flex: 1 1 4.5rem; max-width: 9rem`, words boxes `flex-basis: 10rem; max-width:
none`. Words boxes grew without a cap, so a box that wrapped onto its own line (or one added by a growing answer)
stretched across the whole line while its siblings stayed short, and a maths box was never the width of a words box.
Fixed at the cause: one token, `--ans-w`, and every box sharing a line is `flex: 0 1 var(--ans-w)`, whatever its kind.
A single answer alone in the bar still fills its line (`.qp-bar > .qp-ans`): that is a line of one.

The worklist (`--list`) is ordered by the points of the total a fix gains: 1/population of its rule for a ratio rule,
an equal share of the rule's one point for a pass/fail rule, divided by the number of rules.

## Second pass, same day: the unit a rule counts

The owner's next point: the unit is itself a choice. Rules that counted LINES (dup 33957/33986, nest 33979/33986,
one-off over 4063 comparison lines) or every CSS declaration (important, order, 7665) sat near 100% however bad things
were, beside families counted as 1/43. **Now every rule counts the thing a person would fix**, and `-v` prints that unit
beside each rule:

- code `one-off`, `dup`, `nest` and Find's `find-one-off`: functions (top-level functions, plus each file's code outside
  any function) with a finding ÷ all of them (`fnUnits` in tools/health.js). dup's worklist gain is per finding now.
- CSS `important`, `order`, `colourlit`, `font-scale`, `space-scale`, `radius-scale`: rule-blocks that break the rule ÷
  the rule-blocks it applies to (a block with no colour is not counted for `colourlit`).
- `spread`: commits to js/ touching at most 6 files ÷ such commits (was the median, 0/1).

**Pass/fail checks that inspect a population are ratios over it** (the walked things with no finding ÷ walked, by the
finding's `where`): friction over journeys, returned-features over features, timeline-anim over timelines, ux over its
budgets (each click, each missing control, each load/heap/live measure, each non-owner qcard count, the text-box
measure), settings-work over settings boxes, wait over screen loads, card-tags and attr-outside-tags over card kinds,
odd-tags over tagged cards. a11y becomes elements once `tools/ux-health.js` records `a11yChecked` (added; the walk needs
re-running); until then it stays pass/fail. The rest (console, in-sync, chip-size, clutter, resilience, ...) have no
recorded population and stay one check each. `claude-lines` and `search-bytes` are about one file and one directory.

Thresholds are unchanged: each is still the rule's definition. Score at this change: 73.9% → 80.1%.
