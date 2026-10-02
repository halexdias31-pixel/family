## Qualifications are a list you read, and an editor opens in place of the one row being changed

**Reported as *"the current system for adding qualifications is really hard to understand."*** It
was. A subject was a summary line that was secretly a button (`Maths · GCSE 8 ✓ · A-Level B ★`),
opening onto a subject box, which held more summary lines that were also buttons, each opening onto
boxes captioned only by their placeholders, with a ✓, a ★, a ▸ and a ✕ to decode on the way — and
the Save that kept any of it was at the foot of the card. A design panel scored three replacements;
this is the winner, with grafts from the other two.

**THE DEFAULT IS THE FINISHED LIST, AND NOTHING IN IT IS A CONTROL BUT A WORD.** `qualShelf_` draws
a subject as a bold heading with `Edit` beside it, and each level as two or three plain lines —
`A-Level · grade B`, `Hill Top Sixth Form · 2019`, and `Teach` in the profile card's own gold chip
or `Can teach` in a dim word — with its own `Edit`. `+ Add a Maths level` under each subject,
`+ Add a subject` under them all, and `3 of 10 qualifications` at the foot. An empty shelf is one
sentence and the new-subject editor, already open, with no Cancel because there is nothing to go
back to.

**ONE PATTERN: `Edit`, THEN `Save` OR `Cancel`, IN PLACE.** An editor replaces its row, captions
above every box (`LEVEL`, `GRADE`, `SCHOOL, COLLEGE OR UNI`, `FINISHED`), `Still studying` for
`Present`, and the teaching question as a sentence — *"Do you tutor Maths A-Level?"* — over a
three-way `Teach | Can teach | No`. While one is open, `.q-shelf.is-editing` takes every other
`Edit` and `+ Add` off the page, and a gold rule down the left marks which one is open. **Every
editor saves itself** through `meSave_` — `me-save`'s body, lifted out so both can call it, and
answering whether the card was kept — so the Qualifications card has no Save tile of its own.
Remove saves at once and toasts `Removed Maths A-Level.`; Cancel puts back the snapshot `Edit` took
(`data-was`), and a level never saved goes back to the pool.

**THE DATA CONTRACT DID NOT MOVE, AND THAT IS WHAT MADE IT SAFE.** All ten slots stay in the form as
`.q-slot[data-slot=N]` with seven `data-me` boxes each, so every Save posts seventy fields and
`qualsIn` rebuilds the rows exactly as before — no backend change, no column, no `?setup=1`. Teach
and Can teach are **hidden inputs holding `TRUE`/`FALSE`**, written by the three-way control, so
there is no checkbox on the shelf to be read the wrong way round. After every Save and Cancel the
shelf is **redrawn from what its boxes hold** (`qualRedraw_`), so grouping, the pool, the count line
and whether there is room for another are one renderer's answer: a subject renamed onto another
merges into it, a subject whose last level went is gone, and at ten records the add buttons are not
drawn at all and the line reads `10 of 10 — remove one to add another.`

**Measured at 320x568**: the two-subject list fits whole at full size; an open A-Level editor is
drawn at 80%; the empty shelf at 93%; ten records at 70% and then scrolling.
`None yet` is the empty grade, not `No grade yet`, because the longer phrase was clipped to `No grade
y` in a half-width select at 320. `check-flow.js` drives Teach on two levels (both stay), `No` on one
(the other untouched), Cancel, Remove (seven blank fields posted), Add a level (the subject carried
into `qual_N`) and the ten-record cap; an untick-the-others rule and a Cancel that does not restore
both fail it. `check/states.js` has the read list and the A-Level editor open.
