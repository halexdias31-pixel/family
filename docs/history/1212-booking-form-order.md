# 1212 — the booking form in dependency order; the discount shared, no maximum (12 Nov 2026)

Owner, 12 Nov: "optimise the booking form so the order is least arbitrary … merging some fields is your decision", then
"minimal dynamism for maximum stability", then on the discount: no maximum, and the tutor shares it.

**Order by dependency.** Each row reads only rows above it, so nothing above changes because of a choice below:
who (For, Child) → what (Kind, Class, Subject, Extra subj., Level) → who teaches (Tutor) → where (Venue, Room, Space)
→ how many (Extra seats: the smaller of tutor and place capacity, so it must follow both) → when (Term, the week,
Dates — the term's result under it) → Note → the four ticks → Discount → the money. `BOOK_STEPS` was reordered
(Child after Kind; Extra seats after Space; Term before the week) and `Dates` is pinned after the week in
`SPINE_EXTRA`; the spine is read off both, so the saved booking follows (journey 32).

**A bug found on the way:** the week rows are drawn as `day_(label)` (Mon…Sun since 8 Nov) but the spine listed
Monday…Sunday, so every week row missed the spine and fell below the ticks. The spine and `weekLeft_` now use `day_`.

**Fixed rows.** Nothing is hidden: a row that does not apply keeps its place and shows "—" (7 Nov, 8 Nov), so nothing
appears, disappears or moves while the form is filled in.

**Merges not made.** Subject/Extra subj., Venue/Room/Space and the four ticks each carry their own figure or tick on
the price columns and the owner listed them to keep; merging would move a figure off its cause. Left as rows.

**Money computed once.** `bookPrice()` memoises the money object per `BOOKING` state for one tick (a draw asked for it
about six times); the memo dies on the next microtask so fresh data is never priced stale.

**Discount (owner, 12 Nov).** Replaces the 8 Nov cap: no maximum; the discount is off the teaching only (room hire
and card fees are not discounted) and the tutor and @family. each lose the same share. At 100% both get nothing and
only fees/room can make @family. negative. `bookMoney_` (core.js) is the one rule; the `max N%` line, `capped`,
`maxPct` and the Business/Shared choice are gone; the backend's default `discount_absorbed_by` is `Shared with tutor`.
Versions 2026-11-12-discount-shared-1.
