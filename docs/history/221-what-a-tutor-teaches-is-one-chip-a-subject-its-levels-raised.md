## What a tutor teaches is one chip a subject, its levels raised, and the library cards carry no note

**Asked for as *"what they teach should appear like Subject ^level, level, level. so like the levels
are superscripted. no brackets."*** It was one chip per PHRASE — `Maths (GCSE)`, `Maths (A-Level)`,
`Maths (AS)` — so a tutor teaching one subject at three levels said "Maths" three times in a row, and
the brackets were most of the ink. Now `Maths ^GCSE, A-Level`: the subject once, the levels a `<sup>`
after it.

**GROUPED ON THE PHONE, AND THE PHRASES ARE LEFT ALONE.** `teachesOf_` sends one phrase per level
because that is what it dedupes on, and the booking form's `why` and `subjectRows` / `levelRows`
match against exactly that string. Changing `teachPhrase_` would change what three matchers compare
to fix how one card looks — and an older backend sends the very same strings, so nothing waits on a
deploy. `teachGroups_` in cards.js reads them with `subjectIn_` / `levelIn_` from price-rows.js, which
were already the one reader of that format; a third regex would be a third chance to read
`Maths (GCSE)` differently. A phrase with no bracket is a chip with nothing raised.

**THE TWO ROWS ARE SPLIT ON THE PHRASE BEFORE ANYTHING IS GROUPED.** A tutor who specialises in Maths
at GCSE and also teaches it at A-Level gets `Maths ^GCSE` in gold under `Teaches` and `Maths ^A-Level`
under `Can also teach`. Grouping first would put a level they did not specialise in under the gold
edge. `check-flow.js` asserts both rows for the current backend and for one old enough to send a
single `teachesMain`, and the mutant that groups across the rows is named.

**AN 8px FLOOR ON THE LEVELS, `line-height: 0`, AND `--dim` RATHER THAN AN OPACITY.** The chip is
.64rem — 8.6px on a 320px phone — and a browser's own superscript would be about 7px. `line-height: 0`
is what keeps a chip with levels the same height as one without: measured 15.1px against 15.1px at
320 and 20.9 against 20.9 at 390. And a colour is what `check/ui.js`'s contrast rule can read: proved
by setting the levels to `#333`, which it names at 1.56:1 on every width. Each level is its own
no-wrap span behind a no-break space, so at 320px a long list breaks between levels — never inside
`A-Level` at its hyphen, never leaving a subject alone with its levels on the next line.

**`account · a tutor teaching one subject at several levels`** seeds a subject at six levels and a
long subject name, because the fixture's tutor has one level per subject and so cannot wrap. Its
`leave` puts the account column back on the page it was on: taking the seeded tutor out took a page
out from under the one the state had turned to, and `COLUMNS OUT OF LINE` reported the column 500px
off every other — the state's own debris, not the app.

### `library_note` is dropped in `fieldsHtml`, because the deployed backend still asks for it

**Asked for as *"for the library card widget, there doesnt need to be a add note to it."*** The
column had already left `SCHEMA.people` and the groups in `constants.gs` — but the live site talks to
a deployment that still lists it in `Library cards`, so the box went on being drawn under the shelf.
`RETIRED_FIELDS_` in me.js is filtered off every group in `fieldsHtml`, the one walk every surface
goes through, so neither an older deployment nor a cached payload can put it back. Nothing is lost:
`updateProfile` writes only what it is sent, so a note already in an old sheet's cell is left alone
rather than blanked. `check-flow.js` plays that older server and wants the shelf and no note box.

**`.lib-card` IS NOT THE LIBRARY SHELF'S OWN CLASS.** `shelfSlots_` gives every shelf's slots it —
qualifications and photographs too — so the first version of that journey, and of the screenshot,
found the Photos page. Both look for `[data-me="lib1_name"]`, which only the library shelf draws.
