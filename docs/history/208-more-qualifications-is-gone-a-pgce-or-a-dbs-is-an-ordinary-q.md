## "More qualifications" is gone: a PGCE or a DBS is an ordinary qualification entry

**Asked for as "remove the extra qualifications field. this can be achieved by the regular
qualification entries."** `extra_quals` is off the Qualifications page, the payload, the profile
card and the lab. The COLUMN stays in `SCHEMA` so nothing already typed is lost: `qualsList_` folds
each comma item in as an entry with a subject and nothing else (skipping a name already on the
list), and the first Save of that page writes it into `quals` and empties the old cell, exactly as
`studying` was retired. `check/states.js`'s multi-select state opens whichever several-of-a-list
field the column carries now (a tutor's venues). Stamps are `2026-09-30-e-noextraquals`.
