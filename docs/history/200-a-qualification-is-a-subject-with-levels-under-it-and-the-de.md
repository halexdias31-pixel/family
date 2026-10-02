## A qualification is a subject with levels under it, and the degree is one of the levels

**Asked for as "i would rather a tutor add a subject … then add that they got a gcse in it at a
certain grade, and then add another level eg a level and its grade. that way they dont need to add
another entry for the same subject. then add the teach tick, and specialise tick … exam board too.
the degree shouldnt be a whole nother widget … also add date of completing drop down list."**

**THE CELL DID NOT CHANGE, WHICH IS WHAT MADE THIS A FRONT-END CHANGE ONLY.** `people.quals` is
still a packed list of records — subject, level, grade, board, received, teach, spec — through
`qualsIn` / `qualsOut`, so no backend deploy and no migration. What changed is that `qualShelf_`
GROUPS the records by subject (`norm` of the name) and draws each subject once: its name, its
levels as one-line summaries (`GCSE · 8 · Edexcel · 2017`) that open to edit, `Add a level`, and
one pair of Teach / Specialise ticks. A new level carries the subject's name into its hidden
`qual_N`, or a Save would post a level with no subject.

**THE TICKS ARE THE SUBJECT'S AND THE RECORDS ARE PER LEVEL**, so `qualSubjectSync_` writes them
down: teach onto every level, and the specialism onto the FIRST level only — three chips of gold for
one subject would say Maths three times on the card. The visible pair is a control; the hidden
`qual_N_teach` / `qual_N_spec` boxes are what `me-save` posts.

**THE DEGREE IS A LEVEL, and "Studying now" stays gone.** `Degree · Present` under `Bible and
Theology` is the whole of it; the board box takes a university as well as an exam board, and
`Completed` is the same year list with `Present` as before.

**All seventy fields stay in the form, drawn or not** — `qualsIn` rebuilds the whole cell from what
arrives, so a slot missing from the form is a qualification deleted on Save. Unused slots wait in a
hidden pool that `Add a level` and `Add a subject` take from.

**`settings · the qualifications` asserts the shape and the sync**: Maths once with three levels all
named Maths, the two saved ones shut, one pair of ticks, teach on all three and the specialism on the
first only. **Proved by mutation twice** — every level keyed as its own subject, and the specialism
copied onto every level — and both are named at all four widths.
