## Carry on was built and then removed, and the removal is the entry

**Asked for as "i want it to be the same paper we did like 2 weeks ago for each"**, and the answer
built for it was a `<name>, carry on` block over the funnel's first question: the papers this person
had answers saved against, a count beside each, a tap setting the `paperId` chip. Derived from the
answer keys, which really are the only record of which paper anybody worked through — nothing is
posted anywhere, so `ans:u:<person_id>:q:<row_id>` in `localStorage` is it.

**And the owner's answer was that the question had already been answered**: *"no i dont want lucca
carry on bullshit. im just saying if they answer something, it will be answered next time they come
on."* That is a statement about PERSISTENCE, and persistence is `ansKey_` and `ansRead_` — an answer
typed into a box is under the signed-in person and comes back in that box on the next visit, on
every paper, with nothing on any screen to press.

**So the feature was a second route to a place the funnel already reaches** — measured at 8 taps for
May 2017 Higher Paper 1 and 9 for the Foundation one, both landing on exactly that paper in its own
order — **on the one screen whose own note warns about offering to throw away what somebody is
part-way through.** Removed whole: `resumeBlock_`, `resumeList_`, `resumeIndex_`, `RESUME_MAX`,
`RESUME_ROWS`, `on('resume-paper')`, two CSS rules and the declared state that pressed it.

**What survives it is worth naming, because it is not the same work.** The `showOf` hook and
`paperLabels_` below came out of the same afternoon and stay: they are what stops twenty papers
sharing six buttons, and they are the funnel's own Paper question rather than a door beside it. And
the measurement stands — the answer keys ARE the record of which paper somebody is part-way through,
and a surface that ever needs it reads them rather than growing a column.

**`pad-clear` went off `ACCEPTED_QUIET` with the state that reached it.** It was correctly quiet —
clearing a pad nobody has drawn on writes an empty list over an empty list — and with the state gone
nothing presses it, so the entry would have been a written reason with nothing behind it. That is
the shape every list in this file exists to prevent, pointed at itself.

### The Paper question was putting two papers on one button

**Its own note has always stated the rule** — *"the id decides WHO answers and the name is what is
shown"* — **and its `of` returned the name.** So the spelling fold, which exists to make `Alevel`
and `A-Level` one button, merged papers: `Paper 1 (Non-Calculator) — May 2017` is Edexcel Higher and
`Paper 1 (Non-calculator) — May 2017` is the Foundation paper of the same sitting, one letter's case
apart. **Six names carried by twenty papers**, the six AQA science `Paper 1 — June 2024` rows
putting three subjects and two tiers on one answer, and 248 answers offered for 262 papers.

**`showOf` is the fix and it is one line per facet**: the value is the id, the label is what the
facet says to draw, and `shortLabels_` shortens the label rather than the value. Narrowed to
Maths · Higher · Summer 2017 the three answers still read `Paper 1`, `Paper 2`, `Paper 3`.
`paperLabels_` disambiguates only where a name is shared and by what actually differs — subject
first, then tier.

**Built from `LIBRARY_ROWS`, the file, not the mapped list.** The first version read
`DATA.questions`, which carries only 170 of the 262 papers' document rows and renames `paper_id` to
`paper` on the way through, so every button drew a raw id. Caught by looking at the rendered answers
rather than at the count, which was already right.

**And the chip did not follow the value.** `f.value` had been both the match and the label until
this, so the chip read `PAPER P-1MA1-1705-1H` — an account number where a paper's name had been.
Caught on a screenshot of the tap that sets it. Same shape as `resource_type` sitting in `VOCAB`
after the rename: the rule moved and one of its readers did not.

**`check-funnel.js` gains the rule, and it is on the ITEMS rather than the spelling**: press an
answer, and every question left has to come from one paper. Test 2 could not see this and its own
note says why — it looks for two values that normalise to one key, and after the fold there is only
one value left. Proved by mutation: the old `of` names all six merged answers.

### The lesson that outlived it: a door drawn from `localStorage` is a door nothing presses

**`check/press.js` passed without ever reaching `resume-paper`.** The block was drawn from
`localStorage`, so on a fresh browser there was nothing to draw — and an action that is on no screen
is one that check cannot report. **That is the hole the STATES list exists to close**, the same one
the booking receipt and the message thread were in, and it is why the state was written before the
feature was trusted: 89 actions pressed became 100.

**The state is gone with the feature and the rule is not.** Anything whose door only appears once a
device carries state — an answer, a basket, a saved thing — needs a declared state that seeds it
through the app's own writer, or the press pass reports a clean sweep of a control it never saw.
`stuff · carry on` seeded through `ansKey_` rather than spelling the key out in the harness, and
`leave` removed what it wrote, because states run in order down one page.
