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
