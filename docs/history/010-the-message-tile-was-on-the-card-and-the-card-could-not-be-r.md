## The Message tile was on the card and the card could not be reached

**Reported as "I don't see the message tile".** It was there — measured, `cardTiles_` on a tutor
returns `data-do="msg-open"`. What could not be done is get to a tutor card at all.

**The `facets` sheet put `subject` at order 1, which is a filter in front of the doors.** The first
question the funnel asked was Subject, and there is no answer to Subject that keeps a tutor — a
tutor has none, `filterHit` finds no value, and every tutor, venue and friend is dropped by the
first tap.

**The coverage rule could not catch it, and the reason matters.** `FACET_COVERAGE` refuses a
question fewer than half the list can answer — and `subject` has **100% coverage**, because 4,005 of
the 4,007 items are questions. The library is now so much larger than everything else that ANY
library facet looks universal. The rule is right; it is measuring a list whose minority is three
items.

**So `always` does the other half of the job its own note describes.** `What for` and `What kind`
are DOORS — they take somebody from the whole app to a department — and a door asked third is a door
behind two filters. Doors sort before filters; the sheet still owns the order of the doors among
themselves, the order of everything else, and whether any of them is asked at all. **What it cannot
do is put a filter in front of a door**, because that is not an ordering preference, it is a dead
end for everything the filter cannot describe. Measured after: What for → People → the tutor, in two
taps.
