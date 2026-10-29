# 525 — The week says × the boxes ticked, once, in the multiplier column

**Reported** through Suggest a change on the Booking widget, with a screenshot of a priced card (four
hours ticked over two days, Term × 6, £696.00): *"can you see how 4 boxes are ticked. it should say
times 4 on multiplier column how i layed it out"*.

## Two faults, one of them invisible to the check that guarded it

1. **On a priced card the week's figure was wiped.** `bookBreakdown` merges each priced line onto the
   question row with the same step id (`r.mul = p.mul`). The day lines `breakdownRows` pushes for the
   `slots` step carry an empty `mul`, so the merge wrote `''` over the figure `weekRows_` had counted.
   The old journey (*"a day says how many hours it is…"*, 146) cleared every answer first, so `L` was
   null, nothing was merged, and it never saw a priced card. The owner only ever sees priced ones.
   Now a row keeps its own figure when its priced line has none.
2. **The figure was per day.** 146 put `× 3` beside a day of three hours. Ticked over two days, that
   reads `× 2` and `× 2`, and the column read down (£/h × ? × 6 weeks = total) has no `× 4` in it.
   `priceFrom` multiplies by hours a week — the count of ticked boxes — so the week says that number
   once, on its last row: the place the owner drew it, between Sunday and the Term row.

One rule, in `weekRows_`: the sum of the days' counts goes on the last row. The form counts the ticks;
the receipt (`jobWeekRows_`) counts `hours_per_session` on each day the job runs, so a saved job of two
days of two hours reads `× 4` the same way. The price was always right; no backend change.

## Proof

`check-flow`: *"the week says how many boxes are ticked, once, in the column that multiplies"* ticks
1 to 4 boxes (two on Monday, then two on Wednesday) on a card priced against a term still to come, and
asks for `× N` on Sunday's row alone, `hoursPerWeek = N`, and the total = the hourly figure above the
week × N × the Term row's weeks. Before: every count blank on the priced card, and the receipt
`× 2, × 2`. A mutant with the per-day figure (merge fixed) fails at every N.
