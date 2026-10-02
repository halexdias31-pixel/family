## `S(r.date_of_birth)` on a Sheets Date is `Sun Sep 15 1985 00:00:00 GMT+0100 (British Summer Time)`

**Asked for as "date of birth should be 3 boxes. day, month and year. or copy the best practice
method."** The three boxes are the ask; what the measurement found underneath is that the ONE box
had been drawing that string into an editable field, because `profileOf_` stringified whatever the
cell held and a date cell holds a `Date`.

**`dobOut` TESTS THE SHAPE ITSELF RATHER THAN TRUSTING `sheetDate`.** That helper reads
`"sometime in 85"` as 1 January 1985 — right for a column somebody types a date into and wrong here,
because a cell holding a sentence would come back as three confident numbers nobody wrote. Only a
real `Date` or a `dd/mm/yyyy` string is split; anything else goes into the day box untouched, so
whatever is in the sheet is still in front of the person who has to correct it.

**THE THREE BOXES ARE NOT THREE COLUMNS, and that is the packed-cell pattern for a third time** —
`availGridOut`/`availGridIn` for the 77 hour codes, `libCardsOut`/`libCardsIn` for the nine library
boxes, `dobOut`/`dobIn` for these. Each needs the same three wiring points on the server and it is
worth naming them because missing any one is silent: the field names must be excluded from
`wanted`, the real column must be header-checked explicitly (nothing else will, so `setCell` would
write to a header that is not there and lose the value with no error), and `profileOf_` must expand
the cell so the form comes back filled.

**`inputmode="numeric"`, `maxlength`, `autocomplete="bday-day|bday-month|bday-year"`.** The
autocomplete tokens are the half a phone actually uses — without them it offers nothing, or offers
the same thing into all three — and `maxlength` stops the fourth digit being typed into a two-digit
box rather than refusing it afterwards.

### `6ch` clipped `1985` to `198`, and nothing measured it wrong

**The box was exactly `6ch` wide and the text inside it was not.** Every input in this stylesheet
carries `.7rem .75rem`, so about 22px of a box is gone before a digit is drawn — the track has to be
the content **plus that**, or the fourth digit is outside a box reporting itself the size it was
asked for. Same shape as the library shelf's `max-content` track resolving against an input's own
idea of itself, and **found on a screenshot**, which is the twenty-third time this file writes that
a screenshot is the last word on something drawn — counted off the entries above rather than
remembered, because this tally has been wrong inside its own warning twice.

**AND THE DAY AND MONTH BOXES WERE 41.5px AT 320.** `check/ui.js` named it on the first run that had
this row on a screen: two digits plus the input's own padding lands just under the floor, which is
the near-miss `.btn.tiny` records where `max(38px, 2.3rem)` never once chose the rem. `max(44px, …)`
— **the eighth conviction of the tap-targets-in-px rule** in this stylesheet after `.btn.tiny`,
`.post-act`, `.fm-adds label`, the chips, `.qp-check`, the reel's sound button and `.cal-arrow`.
Measured at 320: 44 + 44 + 57.3 and two 6.75px gaps is 158.8 inside a 243.9px card, so nothing is
given up for it.

### `NO NAME` reported twelve correctly-named controls, and the whitespace is why

**A WHITESPACE-ONLY LABEL IS TRUTHY.** `(lab2 ? lab2.textContent : '')` sat five rungs above the
placeholder in that rule's `||` chain, and a caption-less `label.field` contains only a newline and
some spaces before its `<input>` — so the chain stopped there and the `.trim()` at the end made it
`''`. The one source that would have named those boxes was never reached.

**IT HAS BEEN WRONG SINCE THE LIBRARY SHELF SHIPPED**, and the rule's own note says why nobody saw
it: its whole argument is that *a placeholder IS the accessible name when there is nothing else*,
and the shelf is the first thing in this app to lean on that. Nine library boxes and three date
boxes, collapsed by the grouping key into a single `<input>` line — so the report said **1** where
it meant **12**, and every one of the twelve was wrong. An instrument that cannot reach the source
its own comment names is the shape this repository keeps finding in its own checks.

**Each candidate is trimmed before the `||` now, not the whole chain after it.**

**AND THE MUTATION EXPOSED A SECOND NARROWING WORTH TAKING.** With the placeholder removed, `dob_y`
was still silent — because `el.value` was the last rung, and the box held `1985`. **A value is the
name of a submit button and of nothing else**: a screen reader announces `1985` as the value and
still has nothing to call the box. Unnarrowed, that rung made the rule blind to every unnamed box a
person had typed into, which is the state an unnamed box is usually found in. Narrowed to
`submit|button|reset|image`, and measured across all 252 combinations it reports **nothing new** —
this app has no submit input at all. **Proved by mutation in both directions**: `dob_y` with no
placeholder is named while it holds a value and reported the moment it is empty.
