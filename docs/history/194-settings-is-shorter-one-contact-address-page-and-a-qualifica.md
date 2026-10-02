## Settings is shorter: one Contact & address page, and a qualification is one line until opened

**Asked for as "look at all of account settings and see if there is a better way to have it
layout. like more efficient."** Two changes, both measured at 320x568.

**`Contact` and `Where` were two pages with two Saves for one question** — how do we reach you.
They are one `Contact & address` group in `PROFILE_GROUPS`, and `check-profile.js` and the fixture
name it. A tutor's column is nine pages.

**A FILLED QUALIFICATION IS ITS SUMMARY LINE** — `Maths · A-Level · Edexcel · B · 2019` — and a tap
opens its boxes in place. The shelf was 802px at 390 and 605 at 320 even drawn at 70%; it is 456 and
443 at full size. Shut cards are still in the form, so one Save posts all ten, and an empty shelf's
first slot arrives open. The summary line is a span that may wrap, because `check/ui.js` named the
button running 4px past a 320px card the first run a filled qualification was on screen.

**The state had to be given a filled slot.** The fixture's admin has none, so every card was empty,
every card open, and a collapse that never shut anything measured perfectly — proved by mutation
before and after seeding `USER.profile`.

**And the year box read `200`.** `.dob-boxes` sized its tracks in `ch` of the root's clamp (13.5px
on a 320px phone) while the inputs are 16px, so four characters of the smaller font were not four of
the larger. The grid is 16px now. Caught on a screenshot, which is the only thing that could.
