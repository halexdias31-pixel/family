## Twenty-five practicals from a pasted library, and twenty-one that were already here

**A 46-entry practicals file, pasted in with "add these, any that are not already in there".** The
first move was the comparison rather than the import, and it is most of the answer: **21 of the 46
are already in `data/practicals.json`**, under the names this library gave them when the ten home
experiments went in. The red cabbage indicator, the effervescent tablets, elephant's toothpaste,
salt and sand, the steel wool, the electrolysis, the shoebox projector, the scribble bot, the car
speeds, the animal ethogram and all five refusals are the same rows.

**Five more are the LAB version of the same investigation and are deliberately not duplicated.**
The pasted `springs-hookes-law` is PR-PH06, `light-refraction` is PR-PH09, `radiation-cans` is
PR-PH10 — a clamp stand against a spring on a hook, a ray box against an optics kit, a Leslie cube
against three painted tins. Same experiment, different kit, and a home row beside a school row is
two rows that have to agree about one thing: the `needs_print` / `print_required` shape this file
records at 356 rows of disagreement. The kit difference is what `feasible` is for and it is already
on those rows. `area-perimeter-measuring-wheel` is PR-FN09 and `fish-ethogram` is PR-HM10, which is
that row with the fish taken out of it.

**So 25 went in** — 14 physics and engineering, 10 chemistry, 1 biology — as `PR-HM12` to `PR-HM36`.
**79 hazards written out, 3.2 a row**, every one with what you do about it, because
`check-practicals.js` counts a one-line risks cell as a claim rather than a record.

### What is deliberately not imported, and it is most of the file

| | |
|---|---|
| `learner_profile` | an age, a one-to-one home setting, and a list of one child's interests |
| **`sessions`** | **six dated rows carrying a child's first name** |
| `status` / `done_on` | when a particular child was taught a particular thing — the same fact spread over two more columns |
| the notes about one learner | *"he grew hesitant"*, *"confirm he has a tank"*, *"matches his car interest"*, *"before HE is watching"* |
| `inventory` | a record of what the tutor already owns and what each thing cost |

**The sessions block is the `ticks_1/2/3` rule arriving from a new direction.** That entry is about
columns holding the handles of real people, most of them children, in a repository that is public
with permanent history — and it says a tick column reappearing is not untidy, it is a leak. Six
dated rows naming a ten-year-old is the same object with a different column heading.

**This file already recorded the decision once**, when the ten home experiments went in: *"a learner
profile: an age, a set of interests, a first session date... none of it is here. Where a
learner-specific line carried a reusable fact it is written as one."* Same again, and the rule held
without being rediscovered: *"his RC car"* is a remote-control car anybody can borrow, and *"confirm
he has a tank"* was already `feasible` on PR-HM10.

**The writer asserts it rather than the checker alone.** `LOCAL`'s six place names and the learner's
name are both refused in `tools/add-practicals-home-set.py`, at the row that carries them, naming
it — because a rule that lives only in the checker is one the writer can walk past, which is this
file's own sentence about `cost: 0` being repaired in the data and not in the rule.

### One row is written rather than imported, and that is the honest half

**The pasted `heat-pressure` entry carries no method and no science.** Its own note says *"Details
not recorded. Fill in method/science."* Importing it as it stands would be a practical that cannot
be run; **guessing which kit was used would be inventing a record of somebody's session**, which is
the fault this file records under the scatter graph and the curve read by eye. It goes in as
`PR-HM15`, the standard bottle-and-balloon gas pressure practical written out in full, and its
`notes` say outright that it claims nothing about what was done on the day.

### The assertions caught five rows before the checker did

**`maths_link` was missing on five of the twenty-five** and the writer named each one as it reached
it. That is the point of asserting at the writing end as well: `check-practicals.js` would have said
nothing, because `maths_link` is not one of the columns it demands — it is a column the CARD reads,
so an empty one is a silently thinner card rather than a failure. The five are the hand warmer, the
rusting jars, the crystals, the slime and the fountain.

**And the topic names were checked against the tree before a row was written**, which is the
practicals' own oldest lesson: the trundle wheel's `Perimeter and area` read perfectly and joined
one question. Eight candidate names missed — `Averages`, `Scatter Graphs`, `Volume`, `Acids &
Alkalis`, `Light`, `Oxidation`, `Speed Distance Time`, `Gears` — and every one of them had a real
label already in `data/topics.json` saying the same thing (`Averages & Range`, `Scatter Graphs &
Correlation`, `Volume & Surface Area`, `Compound Measures`, `Waves`, `Corrosion`). **No branch was
added**, which is the outcome worth having: the tree's containment pass can take a maths topic away
from maths, and this file records diffing it over the whole library three times for that reason.

### Measured after, through the app rather than off the file

**82 practicals, 234 topic links, every one reaching a branch of the tree.** `check/cards.js` lays
out all 82 cards and opens all 77 live guides in the app's own sheet; `PR-HM20`'s guide is 2,640px
with its eight answer boxes, which is the shape every other guide has.

**And every new one is findable by its own words**, which is the thing that was measured when the
guides went into the haystack:

| typing | |
|---|---|
| `slinky`, `catapult`, `pendulum`, `strawberry`, `electromagnet` | one each, the right one |
| `gear ratio` | the gear build |
| **`supersaturated`** | **the click hand warmer** |
| **`borate`** | **slime** |
| `friction` | 4, led by the car on four surfaces |
| `osmosis` | 2 — the potato cylinders, and the naked egg |

**The last two are the ones worth reading.** Neither word is in a title, a subject or a topic cell:
`supersaturated` and `borate` appear only inside the science paragraph of the guide. That is
`plainText_` doing its job, and it is the difference between a library that holds a practical and
one that can find it.
