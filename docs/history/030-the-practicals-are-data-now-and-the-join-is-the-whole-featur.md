## The practicals are data now, and the join is the whole feature

**Asked for as "database the practicals... i guess they would be linked to topics? like measuring
wheel practical goes with area and perimeter".** That guess is right, and the file it needed was
already in the repository: `data/archive/practicals.json`, 41 experiments, 41 columns, exported
when the `Library` spreadsheet was emptied and read by nothing since. **This is `topicstuff` a
second time** — the archive holds what is unread, which is not the same as unusable, and that
folder's own README says so.

### What was wrong with the export, and all three faults are ones already paid for once

| | |
|---|---|
| `equipment_1 … equipment_10` | **the numbered-column fault, third occurrence.** `images` and `needs` both record the argument |
| `step_1 … step_10` | the same again — and `step_9`/`step_10` are empty on all 41 rows, two columns that exist so one practical could have had them |
| `category` beside `compliance` | **one fact in two columns.** Measured, they agree on all 41: `required` is exactly `AQA required practical` (28) and `fun` is the other two values (13). The finer one stays; a derived word does not need a cell. Same shape as `needs_print` / `print_required`, which cost 356 rows of disagreement |

**And the separator is a PIPE, which is measured rather than preferred.** `asList_` splits on commas
and is right about `topics` and `keystage`, where no value has ever held one. It is wrong here:
**14 of the 410 equipment cells carry a comma inside one item** — *"Nichrome wire (about 1 m, taped
to a metre rule)"* is one thing and *"Bunsen burner, tripod, gauze, heatproof mat"* is four, and no
comma rule can tell those apart. 73 of the 297 steps hold one too. Nothing in either column holds a
pipe.

### The topic that reached one question out of ninety-four

**The export had ONE topic per practical and the trundle wheel's was `Perimeter and area`.** It
reads perfectly. Measured against the library it matched **exactly one question**, because the
library spells that `Perimeter` (23), `Area of 2-D Shapes` (71) and eleven other ways. A join that
silently reaches nothing is this repository's oldest shape — `figure`, `orderPrints`, the four
message actions — and here it would have been worse than silent, because `Practicals` would have
been an answer in the funnel that quietly returned the wrong list.

**So every practical names topics in the library's own spellings, and carries two kinds:**

- **the subject topic** — the AQA unit it is assessed under, which is what a science teacher calls it
- **the maths topics** — what the practical actually makes a student *do*. The export already had
  this and called it `maths_link`. **This is the half that matters for a maths tutor**: "resistance
  of a wire" IS a straight-line graph through the origin, and a student stuck on direct proportion
  should find it.

**Written out by hand, not derived from the `maths_link` prose.** Parsing *"why intuition fails"*
into a topic is the mistake this file records twice — a scatter graph summarised in a sentence is
not a drawing instruction. Measured after: **2.8 topics per practical, median reach 64 questions**,
and the trundle wheel went from 1 to **107**. Three pure-chemistry practicals reach nothing and
that is correct rather than a gap: the library is a maths library, and Electrolysis shares no topic
with a past paper in it.

### The tree had to grow, and the risk was the other direction

`topicAreaOf_` answers "which branch is this on" from `data/topics.json` — ten roots, 269 rows, all
maths and English. **Twenty of the export's twenty-four topics are science**, so they resolved to
nothing. Three roots were added, **with AQA's own unit names** (`Cell Biology`, `Bioenergetics`,
`Homeostasis & Response` are printed headings of spec 8461), and the short forms the export already
used as aliases so no cell has to be retyped.

**Adding a root changes `topicAreaOf_` for every item, questions included** — its third pass
resolves by containment and only when all candidates agree, so a new root can take a maths topic
away from maths. `Energy`, `Forces`, `Waves` and `Rates` are ordinary English and were the danger.
**So it was diffed over the whole library before it was kept: one question of 4,152 moved**, and it
moved from a *wrong* answer to a right one — a GCSE lava-flow question tagged `compound units,
rates` had been resolving to **A-Level Pure Maths**, because "rates" is inside `Connected Rates of
Change`. `Compound Measures` answers to `rates`, `compound units` and `flow rate` now. Questions
with an area: 3,548 before, 3,548 after.

**`Density` is deliberately NOT a physics branch.** The maths tree already carries it as an alias of
`Compound Measures`, and a second home is two branches for one word — the `A-Level` / `Tier` overlap
`check-funnel.js` already reports. The one practical that called itself Density is filed under
`Compound Measures`, which is where a tutor looks.

### A substring said five practicals were required when they are not

`required: /required practical/i.test(compliance)` — and **`AQA-aligned, not a required practical`
contains the words "required practical"**. So the five that say outright they are not one were
flagged as one, on the card, in gold. **Found by the check printing a count that disagreed with the
data**: 33 against the transform's 28. Nothing threw. That is the whole argument for printing a
number rather than a pass — the same argument `papers checked against a total` already records,
where a rename took it 34 → 2 under a green tick.

### `subject` is the science, and `kind` is what it is

A physics required practical IS physics. Filing all 41 under a subject of their own would have put
Biology, Chemistry and Physics behind a door marked something else — **the `boxKind` mistake one rung
up**, where the division was written into `subject` and the Subject question then offered
Heavyweight beside Maths. So `kind: 'practical'` says what it is, `subject` says what it is about,
and the funnel needed a mapper and a card and nothing else.

**`item_ids` is the shop join and nothing reads it yet.** 20 of the 41 name the stock they need —
`I023,I026,I045,I022` is the trundle wheel, the tape measure, the cones and the first aid kit. The
shop rows live in the Settings spreadsheet, so this stays an id list until they are there: a name
would be the `findPerson`-by-name fault, and inventing the rows here would be a second shop.

### The strip said "lab · needs a lab", and a screenshot is what caught it

`venue` and `feasible` overlap on 14 of the 41 rows: every lab practical is `lab` **and** `needs a
lab`. Measured across all five combinations that exist, the only thing `feasible` adds that the
venue does not already say is the kit. So the venue is shown and `feasible` contributes one phrase
when it has one. **Fifth time this file writes that a screenshot is the last word on something
drawn** — all 41 cards laid out at 320px, no overflow, no error, and the repetition visible in the
first one.
