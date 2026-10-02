## A tutor states the ages they teach, and "Adults" is an answer rather than a number

**Asked for as *"tutors should also be able to state an age range of people they are willing to work
with."*** Two columns on `people`, `age_min` and `age_max`, on About you beside the years of
experience, drawn as one `[youngest] – [oldest]` row by `FIELD_ROWS` — the students range's shape, so
the two ranges a tutor states read alike.

**NOT ON THE RATE PAGE, though that is where group size lives, and that is the one decision.** Those
four fields are the quote and move once a month (`PRICING_FIELDS`, `pricingRefusal_`), because bookings
already taken were priced against them. An age range prices nothing and seats nobody; putting it on
that page would put it under a clock it has no reason to be under, and the state that counts that
page at exactly four boxes would say so.

**FOUR TO EIGHTEEN, THEN THE WORD `Adults`.** "18" as the oldest is a school-leaver; "Adults" is no
upper limit, and as the youngest it is adults only. `AGE_OPTIONS` in constants.gs is the list, and it
is a list the CODE owns rather than a row of the `options` tab, which is the `FIELD_OPTIONS` argument's
other half: those lists are descriptive and may grow with no deploy, this one is a rule —
`ageRefusal_` refuses anything off it — so a sheet able to widen the drop-down would offer an answer
the server then refuses. `FIELD_FIXED` merges it into `validations` over the tab's lists, and the
phone's form reads one map and knows nothing.

**THE REFUSAL IS ASKED ONLY WHEN AN END MOVED**, `pricingMoved_`'s rule for its reason: About you posts
both ends on every save, and the select keeps a hand-typed value that is not on the list as its own
first option, so a rule firing on presence would refuse a headline because somebody once typed "3"
into the sheet. What moved must be on the list, and the youngest may not be older than the oldest.
Asked before a single cell is written, beside the other refusals in `updateProfile`. No admin
exemption: neither rule is a brake on a person.

**THE CARD READS EVERY HALF A ROW CAN HOLD.** `ageOut_` sends a number, `Adults` or `''` — never
`N()`, which would turn the word into nought and nought into "age 0", the `cost: 0` shape. `profAges_`
in cards.js draws one chip under At a glance, second after experience because it is the first thing
that rules a tutor out: `Ages 8–16`, `Age 10`, `Ages 11+` (youngest only, or up to Adults),
`Ages up to 16`, `Adults`, `All ages` (oldest Adults, youngest blank), and nothing at all when neither
end is answered. A pair typed backwards in the sheet is read the way it obviously means.

**Proved**: `check-profile.js` saves About you through the real `doPost` with the youngest after the
oldest, adults-then-eleven, an age off the list and a word off the list — all four refused having
written nothing, the headline posted beside them unmoved — then `11` to `Adults` reads back after
signing in and reaches the payload as `11` and `"Adults"`. Mutation: the refusal call removed names all
four; `N()` in the payload names it. `check-flow.js` holds `profAges_` to fifteen shapes and the card to
drawing the chip; the swap and the chip removed are both named. Two declared states,
`settings · the age range` (two selects off `validations`, `8` and `Adults` chosen, on a page without
the rate) and `account · an age range on a card`; the first proved by mutation at all four widths.

**About you is 468px in a 495px pane at 320x568 with the row and 394 without** — inside its pane, zoom
1. **`?setup=1` must run after the backend deploys**: until `age_min` and `age_max` exist, every tutor's
About you save is refused by name — *"The sheet has no column for: age_min, age_max"* — which is the
refusal that exists so nobody meets a silent no-op.
