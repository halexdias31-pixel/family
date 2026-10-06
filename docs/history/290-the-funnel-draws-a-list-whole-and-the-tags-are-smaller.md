## The funnel draws a list whole, and the tags are smaller

The owner, 6 Oct: *"I don't want to break up the title of things. Like as you can see it's broken
up into letter and so on. I don't want this no more. Just let it all display ... Basically I no
longer want to have that a-g method or h-n. Just display. Other categories should reduce how many
show up like grade. Make the tags smaller because this will help to make sure more fit in even when
there's lots of names for the user to parse through."*

**What was cutting lists up:** `bucketLabels_` had three rules for a question past seven answers —
(1) the facet's own table, (2) tens and runs of integers, (3) the alphabet. Rules 2 and 3 are gone,
with `alphaBuckets_`, `bandOf_` and `FACET_BAND_BY`. So were two computed groupings that were the
same thing in another shape: the sittings paired into `2023 & 2024` (`waveBucket_`) and the
5-a-day days in weeks (`FIVE_WEEKS`). Measured before: Topic over FOUR items drawn as `C | E | O |
P | R | S | U`.

**What still groups, deliberately:** rule 1 — a facet's own table. Grade bands (`Grades 4–6`), the
subject areas, levels, divisions. Those are categories a person can answer, which is what the owner
asked to do the narrowing. **What keeps a long list off the card:** `FACET_MAX_ANSWERS` (40) in
`nextFacet`, which was always there — a question with more answers than that is not asked until
the other questions have narrowed the list. `bucketHas_` still reads a range label, so a chip
saved on a phone before this still finds its items.

**Smaller tags:** the answer chips and the funnel's own filter chips (`.chip.sm`, not every chip in
the app) are 32px tall, font .8rem, with a 6px `::before` reach above and below so the finger still
gets 44 — `.qw`'s trick. `check/ui.js` carries it as a written exception; the answer markup puts
`counted` first in its class list because the check records only the first two classes.

**Checks changed with it:** `check-funnel` no longer asserts "never more than seven" — it asserts no
question is drawn as ranges (every group is one its table names) and no question ASKED is past
`FACET_MAX_ANSWERS`. `check/states.js` lost "an answer one letter long" (impossible now) for "a long
list, drawn whole"; the bundle state answers `2017` instead of `2017 & 2018`.

**Found on the way:** the new Corbettmaths sheet and a 1st Class Maths paper were both called "Area
of Squares and Rectangles", so one could not be picked; ours is named by its cover, "Area of a
Square / Area of a Rectangle".

### And then the tables went too

Same day, on a screenshot of `Grades 1–3 | Grades 4–6 | Grades 7–9`: *"No more of these artificial
categories like grade 1-3."* So rule 1 went after rules 2 and 3: `bucketLabels_` is gone and
`bucketValues_` hands back what it is given. Grade draws `Grade 1` … `Grade 9`, Subject its real
subjects, Level its real levels. The tables (`GRADE_BUCKET` and the rest) and `bucketHas_` stay —
an old saved chip still finds its items, and `check-flow` routes journeys by the kind table.
`check-funnel`'s "an answer inside a bucket, pressed through the chain" rule now says there are no
buckets rather than failing for want of one.
