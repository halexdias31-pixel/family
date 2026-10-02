## Qualifications carry their board, and there is somewhere to say what you are studying now

**Asked for as "as halex i want to update my qualifications. I have a B in a level maths edexcel.
also i am currently studying bible and theology at university of st david wales. is there a place to
list this?"** The first half had a gap and the second had no home at all.

**A QUALIFICATION WAS A SUBJECT, A LEVEL AND A GRADE, AND THE BOARD WAS NOWHERE.** *"A in Maths
A-Level"* and *"A in Maths A-Level with Edexcel"* are different claims to a parent checking a tutor,
and the board is the half that is checkable. `qual_N_board` is a `select` off the same
`OPTION_FOR` list the library's own `exam_board` facet uses, so nobody can invent a fourth spelling
of Edexcel — which is the fault `levelOf_` and the spelling vote already record in four columns.

**`studying` AND `studying_at` ARE NOT A FOURTH QUALIFICATION**, and that is the distinction: a
qualification is finished and graded, and a degree in progress has neither. Filing it as
`qual_4_subject` would have printed *"Bible and Theology · —"* on a public card, which is the
`cost: 0` shape — a missing fact rendered as a stated one.

**AND THE CARD ROW IS NOT BUILT THROUGH `profList_`.** That helper splits on commas, and a
university's name is exactly the sort of string that carries one. `[t.studying, t.studyingAt]
.filter(Boolean).join(' at ')` is one sentence rather than a list, so *"University of Wales, Trinity
Saint David"* stays one place rather than becoming two.
