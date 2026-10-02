## Ten experiments that run in somebody's front room, and five that were refused

**Asked for as "I need to database this in an appropriate way and add to my site"**, over a chat
transcript holding ten home science experiments, five rejected ones with the reasoning, a shopping
list and a prep checklist.

**They are not a new table.** `data/practicals.json` already holds 41 experiments with a name, a
subject, kit, steps, safety, a venue and a topic join — which is this list with different values in
it. The `images` and `needs` notes both settle the shape: a thing one column wider is not a second
table. And the practicals' own note settles the kind: *"`subject` IS THE SCIENCE and `kind` is what
it is"* — a home chemistry experiment IS chemistry and IS a practical, and a second kind beside it
would put one door in the funnel marked Practicals and another marked Experiments and ask somebody
to know the difference.

**What actually separates them is `venue`, which already existed.** The 41 are `lab`, `library room`
and `outdoors`; these are `home` and `outdoors`. That is the fact a tutor needs — can I do this in a
client's front room — and it was already a column.

### The five refusals are rows, and `active` is not the column for them

**"Recorded so the reasoning is not lost" was the instruction**, and a tutor asking why they are not
burning magnesium ribbon has to be able to find the answer rather than an absence. `active` is the
wrong home for that and this file already records why, on the posts tab: *"`active` is whether it
has been deleted. This is whether it has been let through"* — folding them makes undeleting and
approving one act. So a refused experiment is LIVE, carries `excluded_reason`, and the card leads
with it: the flag changes word and colour, the reason sits under the subtitle with a red rule, and
the card is dimmed. Three signals for one fact, the same doubling `placeholder: True` gets.

**And it is not asked for a method.** `check-practicals.js` demands kit and steps of a live row and
a REASON of a refused one, because writing out a procedure for something nobody will run is
inventing content to satisfy a checker — the opposite of what the checker is for. Proved by
mutation: a refused row given steps exits 1.

### `cost: 0` had one more place to land and this was it

**Measuring car speeds really does cost nothing per run. A lab practical has never been costed at
all.** `libN('')` is 0, so mapping the new column with it would have made all 41 free — the fault
this file records four times, most recently on the shop mapper where a blank cell read as "free"
under a comment defending the zero. `libNum` is `libN` with absent staying absent, two functions
rather than a flag so a caller picks by saying which question it is asking; the card draws "free to
run" for a real zero and says nothing for an uncosted row. **Measured on the rendered text: 0 of the
41 lab practicals claim to be free**, 5 of the new ones do, and 7 carry a price.

### A column written and never read, caught before it shipped

**`wow` went in as free text** — "low to look at, high to learn from", "high — and he keeps it" —
which reads beautifully and cannot be compared, and nothing read it. That is two faults at once:
this repository's oldest shape (`figure`, `orderPrints`, the four message actions, `exam_date`), and
a rule over free text, which is the fault `/required practical/` matching `AQA-aligned, NOT a
required practical` already cost five cards. It is a closed list of five now, the card reads it to
print *"Worth opening a session with"* on the top two levels and nothing otherwise, and the nuance
went into `notes`, which is prose and is drawn as prose.

### `Separating Mixtures` is a new branch, and the diff is why it was safe

Filtration, crystallisation and evaporation are a real GCSE topic that `data/topics.json` did not
carry, and filing salt-from-sand under `Atomic Structure & the Periodic Table` — where AQA's spec
actually puts it — would be correct and unfindable. **Adding a branch changes `topicAreaOf_` for
every item**, because its containment pass resolves a name only when every candidate agrees, so it
was diffed over the whole library first, exactly as the three science roots were: **0 gained an
area, 0 lost one, 0 moved**, across the 4,341 rows that already had one.

**Measured after: the join is the feature.** `Compound Measures` reaches 15 items, so the car-speed
experiment sits with the maths speed questions; `Waves` reaches 26, so the shoebox projector sits
with the refraction ones; `Rate of Reaction` 28 and `Chemical Changes` 42. The practicals now
resolve to nine topic areas — Biology, Chemistry, Physics and five maths branches.

### What is deliberately NOT committed

The source carried a learner profile: an age, a set of interests, a first session date, and "confirm
the student has a fish tank". **This repository is public and git history is permanent**, so none of
it is here. Where a learner-specific line carried a reusable fact it is written as one — "matches
the fish interest on file" became a `feasible` of *"needs a tank, a pond, or a window onto birds"*,
which is true for anybody.

**And the two lines from the prep checklist that are about every home practical rather than any one
of them** — public liability cover, and a written parental agreement describing what will be done —
are drawn from `venue === 'home'` in one place. Writing them into ten `notes` cells would be the AQA
insert fault again: one fact repeated on every row that uses it, and ten cells to keep in step the
day the wording changes.

### `check/cards.js` had never laid out a practical, and that cost four cards

**Found by laying all 56 out while adding ten.** `.prac-head` is a flex row and **a flex item's
minimum is its MIN-CONTENT** — the widest unbreakable word, not nothing — so `Photosynthesis`,
`Field investigations`, `Chromatography` and `I–V characteristics` beside a `flex: 0 0 auto` flag
could not shrink, and each took the card up to **19px past a 320px column**. Four rows of
forty-one, on every commit, for as long as that card has existed.

**Nothing had ever looked.** `check/cards.js` reads `data/questions.json`; `check/ui.js` measures
nine screens and the funnel fills five pages either side of where you are, so it sees whichever
practicals it happens to stop on. That is this file's own **"a sample is not a sweep"**, one data
file along — and it is why `check/cards.js` lays these out too now, **through the app's own
`practicalCard_` rather than a copy of it**: that file already half-pays for rebuilding a question's
markup, and paying it twice would be worse. The measuring rules came out of the loop into one
`measure()` both passes call, for the same reason.

**Proved by mutation**: putting `min-width: 0` back names all four rows and exits 1; the real file
lays out 4,906 questions and 56 practicals with nothing past the column.
