## Tools and games are out of the funnel again, and both decisions are worth keeping

**They were put back on a measurement and taken out on a judgement.** The measurement was real:
`.filter(wgt => … && wgt.groups)` had a second test that was ALWAYS FALSE — 16 widgets declared, 0
carrying `groups` — so `stuffItems()` returned zero items of kind `tool` or `game` and typing
`calculator` found nothing. A filter emptying a list while looking like a design.

**The judgement is the owner's and it overrules it.** A tool is not a thing you FIND, it is a thing
you OPEN, and it has a column of its own where all sixteen are laid out as tiles. Putting them in
the funnel made the app's search return a calculator beside a past paper, and `What kind` grew two
answers that are two other screens. Measured after: `What kind` now offers Questions, Tutors,
Venues.

**What it costs is written where the code was**, so it is not rediscovered as a bug: typing
`calculator` into Find returns nothing, deliberately, and the fix is those four lines rather than
another `wgt.groups`.

**Booking went the same way later and by the same argument**, with one difference worth knowing:
tools and games were removed from the BUILD, and Booking is filtered out of it by group — so the
`kinds` tab can put a Booking kind back and cannot put a tool back. See "Booking is out of the
funnel" below.
