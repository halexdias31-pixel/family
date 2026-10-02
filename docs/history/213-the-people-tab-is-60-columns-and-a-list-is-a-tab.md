## The people tab is 60 columns, and a list is a tab

**Asked as "do you think the current structure of having qualification 1 2 3 is a bit barbaric …
i am giving you position to completely redesign organisation of people tab", then "make it the best
you in charge you choose".** The note over `SCHEMA.people` has the full argument. In short:

| | |
|---|---|
| **`people`** | 89 columns became 60, in groups: who they are, contact and sign-in, the account, the profile, where they are, what they charge and when, a family's and a student's own, then app state |
| **`qualifications`** | new: one row per qualification — `person_id, subject, level, grade, institution, completed, teach, can_teach` |
| **`library_cards`** | new: one row per card — `person_id, library, card_number, pin` |

**Dropped because each was a second copy or read by nothing.** `full_name` (first + last);
`username` (the handle); `teaches_1/2` and their levels, and `teaches_also` (now derived from the two
ticks by `teachesOf_`); `qual_1–3` with their level, grade and board, and the packed `quals`;
`extra_quals`, `studying` and `studying_at` (already folded into qualifications); `ticks_1–3` (read
only by `saveTopics`, which nothing called, so it went too); `locked_until`; and the packed
`library_card`. `findPerson` resolves by id, first + last, handle and e-mail;
`personDisplayName` is first + last.

**The phone's form did not change.** It still posts `qual_N_*` and `libN_*` boxes. `qualsIn` and
`libCardsIn` turn those into records, and `writeOwnRows_` syncs a person's rows in place:
- The first rows are overwritten through `setCells`, so an untouched Save writes nothing.
- Extra rows are appended.
- Surplus rows are deleted from the bottom up, because `delRow` shifts every row below the one it
  removes.

`ownRows_` reads a person's rows in sheet order, so dragging a row up in the sheet reorders it on
the card and the form.

**`check-profile.js` caught a real fault on its first honest run.** A sheet stores a typed `TRUE`
as a boolean, and `sameCell_` compared it as text against the `TRUE` the form posts. So every
untouched Qualifications Save rewrote ten ticks and retired the payload. It only showed once the
check's seed went through the sheet's own coercion, which it now does. `sameCell_` compares a
boolean with the word.

**`check-handles.js` fails on any backend code that still names `username`.** It tracks comments
from opener to closer, so prose may still use the word. A write to a column that no longer exists
is `missedWrite_`, and `jsonOut` turns the whole Save into "Nothing was saved". Proved by putting
one write back.

**The switch is all at once.** The new backend cannot read the old layout. The three CSVs are built
from the live rows by the old code and deduplicated (P003 had one Maths GCSE qualification three
times). They are pasted in the same sitting as the deploy, then `?setup=1` is run.
