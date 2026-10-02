## Subject-green was on the booking dropdown, not on the subjects

**Reported as "some subjects are green and some arent... not all subjects seem to be treated the
same for some reason".** Exactly that: `lawList('subjects')` read `dropdowns.subjects` off the
payload, which is **what somebody can be booked for** — Maths, English, the things taught one to
one. `Combined Science`, `Religious Studies` and half the library's subjects have never been in it,
so the funnel drew a column of answers with some green and the rest plain, on a rule nobody could
see.

**A colour that means "this is a subject" is only worth having if it is on every subject.** One
that is on most of them is read as a STATE — available, chosen, already done — and the app never
says which. That is the `cost: 0` shape in a colour: a fact drawn confidently from a column that
does not hold it.

**Retired in `lawList` rather than left to the sheet**, with the reason written where the case was,
because the law that reads it is a row in the `laws` tab and a list nothing answers is a law that
quietly does nothing. Measured against a payload carrying that law and a two-name dropdown: seven
subject answers, **0 green**. If subject-green is wanted back it wants a list of every subject the
library holds, which is the whole reason this is written down rather than deleted.
