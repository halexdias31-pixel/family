## Four numbers are one quote, and they were two pages with a save each

**Asked for as "only let tutors change thier rate, min number of kids and max number of kids willing
to work with and fraction extra rate all together. and they can only change once a month."** It
generalises the seat-cap cooldown from the night before — and the night before's version could not
have done what was asked, for a reason that is about the FORM rather than the rule.

**`Group size` AND `Your rate` WERE TWO `PROFILE_GROUPS` ENTRIES, AND `settingsPages_` MAPS EACH KEY
ONTO ITS OWN CARD WITH ITS OWN SAVE.** So *"all together"* was not merely unenforced, it was
impossible: a tutor would have spent the month's one change on whichever page they pressed first and
found the other refused. One page, four boxes, one Save.

**`PRICING_FIELDS` IS THE LIST AND BOTH THE PAGE AND THE RULE READ IT.** `PROFILE_GROUPS` builds the
page from it and `pricingRefusal_` decides the month from it, so a fifth field is on the page and
under the cooldown in one edit — which is the sentence already written over those groups about one
list driving the form and the allow-list.

**ONE CLOCK FOR THE FOUR, WHICH IS WHAT "ALL TOGETHER" MEANS.** A stamp each would be four clocks and
a tutor could walk round them a week at a time — the rate on Monday, the extra-seat fraction next
Monday — which is the arms race `handle_changed_at` was written against. So `pricing_changed_at`
replaces `max_students_changed_at`, and **that rename cost nothing**: the old column shipped the
night before and `?setup=1` has not run since, so `ensureSchema` never created it and no cell
anywhere holds a date under the old name.

**WHAT IT SAYS IS THE GROUP, NOT THE FIELD THAT MOVED.** Naming one of the four would read as an
invitation to change the other three, which is exactly what one clock refuses.

**AND `wanted` IS WHAT IS ASKED ABOUT, NOT `fields`.** A field the allow-list dropped is a field that
will not be written, so a cooldown started by one would be a month spent on a change that never
happened.

**Two things carried over from the seat cap unchanged, because both were the load-bearing halves**:
the test is on the VALUE and not on the field being present — that page posts all four on every save
whether or not any was touched — and it is read BEFORE `setCell`, whose last line is
`row[field] = value`, so asking afterwards compares the new values against themselves and the clock
would never start.

### `check-handles.js` — eleven cases, and the cross ones are what make it one clock

**Every case is a fault that would have happened.** A page sending no pricing field at all must not
be refused, because that is what `About you` does. All four posted unchanged must not be refused,
because that is what the pricing page does on every save. And **a rate moved five days ago must
refuse a seat cap today**, in all four directions — which is the only thing that distinguishes one
clock from four wearing one name, and no single-field case can say it.

**PLUS A CASE THAT READS THE CONSTANT.** A rule that had quietly lost a field from its list would
pass every case above: each names the field it moves, so a list of three simply stops refusing the
fourth and nothing says the fourth exists. **Proved by mutation three ways** — firing on presence
names the two unchanged-value cases; dropping `extra_seat_rate` from `PRICING_FIELDS` names both the
refusal case and the list case; removing the admin exemption names the admin case.

**And its heading named one of the two things it checks.** It printed `A USERNAME JUDGED WRONGLY`
over a list that has held pricing findings since the cap cooldown went in, and its FAILED sentence
was about usernames alone — the "all 18 checks pass" shape, in the summary of the check that guards
both. Both name both now.

### `check/fixture.json` had never sent a pricing field, so the lab had never drawn one

**Neither group was in it**, so `check/ui.js` has measured the settings column without ever rendering
a rate box — the same hole the booking receipt, the message thread and the basket were each in, and
**the third time in three commits that the fixture was found stating a shape `doGet` does not send**.

**`settings · the rate and group size` ASSERTS EXACTLY FOUR BOXES, not merely some.** `expect` is
read as a truthy value, so a bare count would pass on a page holding two — and two is precisely what
splitting the group back produces. **Proved by mutation**: split, it names the state at all four
widths as *"was entered and shows no all four pricing boxes on one page"*; merged, 20 combinations
with nothing new.
