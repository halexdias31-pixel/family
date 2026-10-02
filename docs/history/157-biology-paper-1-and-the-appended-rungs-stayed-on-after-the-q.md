## "Biology Paper 1" — and the appended rungs stayed on after the question they name had been answered

**The owner's own words, and both halves of the fault are real.**

**HALF ONE IS THE LABEL CODE.** Narrowed to `Subject · Biology`, all four Paper answers read
`Paper 1 — June 2024 · Biology · Foundation`. Every word after `Paper 1` is on the screen already —
the subject is the chip above and the sitting is the only sitting those four papers have — and the one
thing that separates them is the tier, four words in.

**THE CAUSE IS TWO MECHANISMS FOR ONE JOB AND ONLY ONE OF THEM LOOKS AT THE SCREEN.** `shortLabels_`
states the rule in its own note — *"uniqueness is measured over the answers on screen rather than
declared"* — and `paperLabels_` measured it over the whole library, once, into a memo. `shortLabels_`
then could not undo it: `nameForms_` cuts a name at its separators, and a rung this function APPENDED
is a prefix of nothing, so the ladder had no step between `Paper 1` and the whole string.

**SO IT DISAMBIGUATES AGAINST THE IDS IT IS GIVEN.** `facetTally_` hands `showOf` the answers it is
about to draw. Measured:

| narrowed to | before | after |
|---|---|---|
| `Subject · Biology` | `Paper 1 — June 2024 · Biology · Foundation` | **`Paper 1 — June 2024 · Foundation`** |
| `Physics · Summer 2024` | `Paper 1 — June 2024 · Physics · Foundation` | `Paper 1 — June 2024 · Foundation` |
| `Chemistry · Higher` | `Paper 1` | `Paper 1` — already right, two papers sharing no name |
| `English Language` | `Paper 1: … — June 2023 · English Language` | `Paper 1: … — June 2023` |

**WITH NO IDS IT IS THE LIBRARY, MEMOISED, EXACTLY AS BEFORE** — which is what a CHIP needs. A chip
sits alone with no siblings to be unique against, so `chipText` must get the form that is unambiguous
in the whole library, or a chip would read `Paper 1` and name one of twenty.

**THE RULE IS ON THE ANSWERS RATHER THAN ON THE FUNCTION**, in `check-funnel.js`: narrow by a facet,
then read the labels the Paper question would draw, and none of them may name the answer just chosen.
That holds however the labels are built, where a test on `paperLabels_`'s arguments would pass on a
version that took the ids and ignored them. Three narrowings, because one proves one. **Proved by
mutation twice** — the ids ignored inside the function, and `showOf` back to one argument — and both
name `Subject · Biology` and `Physics · Summer 2024` and exit 1.

### Half two is the data, and it is right

**`Biology Paper 1` IS WHAT THE COVER SAYS.** AQA numbers Combined Science within the subject, so
8464's six papers are Biology 1 and 2, Chemistry 1 and 2, Physics 1 and 2 — and `paper` is what the
cover calls it, which this file records as a decision. **Renaming them to `Paper 1` makes it strictly
worse**: three papers would then share that name, `paperLabels_` would append `· Combined Science` to
all three, and the subject that actually separates them would be gone.

**AND THE FUNNEL DOES ASK "BIOLOGY THEN PAPER 1" AT THAT STATE** — `Subject · Combined Science` offers
`Topic area` next, whose answers there are `Chemistry` 65 and `Biology` 61. Which exposes the real
gap: **the 31 Combined Science PHYSICS questions carry no `topics` at all**, so they answer neither,
and "Doesn't matter" is the only way past that question for them. They are the June 2023 8464 physics
rows that task #42 already covers for their answers; the topics are the same backlog.
