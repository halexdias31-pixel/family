## No question ever draws more than seven answers, and the seven had to be worth reading

**Reported, verbatim: "I e noticed there are some menus in finder where there are more than 7
options. And so it can't display them and asks user to search. I DO NOT LIKE THIS. Have the
categories work in a way that there are never more than 7. If it means grouping many suptopics into
first larger topics then do so. For all things by the way."**

**WHAT WAS THERE WAS THE FUNNEL GIVING UP ON ITS OWN JOB IN FRONT OF YOU.** `FACET_MAX_SHOWN`
trimmed the drawn answers to the biggest seven and printed a line under them — *"and 368 more topic
answers, type one into the search box above"*. Three hundred and sixty-eight answers you cannot
see, and an instruction to go and type instead.

**Measured before anything was written, over the real 5,587 items, at every state a person can
reach by answering the funnel's own questions — fourteen facets break seven:**

```
Topic 375 · Paper 266 · Category 25 · Question part 20 · Division 16 · Sitting 16 · Decade 14
Topic area 13 · Question number 11 · Level 9 · What you need 9 · What kind 8 · Subject 8 · Grade 8
```

**And narrowing does not save them**: six answers deep on Maths worksheets at KS4 the Paper question
still held 87 and Topic still held 75, so a fix aimed at the opening question would have missed the
states the complaint was about.

### The cap became a grouping, which is `bandNumbers_` generalised

**This is not a new idea here.** `bandNumbers_` already turned a run of plain integers into `1–10`,
`11–20` — a band that is a real chip, matched by membership through the one function that drew it.
`bucketValues_` is that mechanism with two more kinds of bucket behind it, and the old function is
gone rather than left beside it.

**THREE RULES, TRIED IN ORDER, AND THE FIRST THAT ANSWERS WINS:**

| | |
|---|---|
| **the facet's own** | `bucketOf` on a `FACETS` entry — a larger category written by somebody who knows what these answers ARE. *"Group many subtopics into first larger topics"*, which is what was asked for |
| **tens** | a run of plain integers bands as it always did |
| **the alphabet** | anything else falls into at most seven contiguous letter ranges, balanced by how many things are behind each |

**RULE 3 IS WHAT MAKES THIS A GUARANTEE RATHER THAN A HABIT.** A facet the spreadsheet invents
tomorrow — `facetFromSheet_` can do that with no deploy — gets seven buckets with no line in code,
and so does a facet whose values grow past seven next year. That is the difference between a rule
and a list of repairs, which is this file's own sentence about `cost: 0` and `paper: true`.

**A BUCKET IS A REAL ANSWER, NOT A VIEW.** Same row, same chip, same ✕. `filterHit` tests
membership rather than equality, and **a bucket does not settle the facet** — `nextFacet` skips a
field only where a non-bucket chip has answered it — so the question is asked AGAIN over what is
left. Measured on the real app: `Grade` at eight answers draws `Grades 1–3 / 4–6 / 7–9`; pressing
`Grades 4–6` leaves 671 items and the next question is Grade again, drawing `Grade 4`, `Grade 5`,
`Grade 6`. Two taps to reach a place that previously could not be reached at all.

**AND MEMBERSHIP IS A PURE FUNCTION OF THE CHIP**, which is the constraint that shaped all of it.
`filterHit` is handed one item and one filter and never the list, so a bucket whose edges depended
on what else happened to be on screen could not be matched afterwards. Every label carries its own
edges — a declared one is looked up, `11–20` and `A–C` are parsed — so the drawer and the filter
cannot disagree. That is `bandOf_`'s own argument, generalised.

### The generic rule alone produced seven buttons nobody could use

**Measured with the alphabet and nothing else: `Sitting` came out as `A` and `S`** — Autumn and
Summer, two buttons for nine years of exams — **and `check-funnel.js` refused it outright**, which
is that check doing its job on my own change. `What you need` came out as `P`. `Subject` came out as
`B / C / E / M`. Each is a legal grouping, under the cap, balanced, and worthless.

**So eleven facets carry a declared table** — `Heavyweight … Bantamweight & below`, `Before 1930 …
2010s onwards`, `Grades 1–3`, `Calculator / No calculator / Drawing kit / A sheet with it / A lab`,
`Numbered / Lettered / Roman`.

**AND THE SITTINGS SAY `2023 & 2024` RATHER THAN `2023–2024`, which is the one label that had to be
argued about.** The academic year is the unit a tutor thinks in — Autumn 2023 and Summer 2024 are
one year's sittings — and it was written that way first and then counted: **sixteen sittings across
2017 to 2025 fall into nine academic years**, past the cap, so rule 1 would stand down at the wide
states and hold at the narrow ones. One question with two vocabularies is the `level` / `stage`
fault, so the pairing stays arithmetic over the calendar — and the label says so, because a dash
between two years is how every board writes an academic year and `2023–2024` over a bucket holding
Summer 2023 would be confidently wrong about the one fact it states. **Every label is a word already in use**: the maths ones are the
national curriculum's own strand names, the boxing ones are what the weight classes are called, and
none is title-cased by code — the `Hcf And Lcm` fault this file records is a label a machine made up.

**THE TABLES HAD TO GO ABOVE `const FACETS = [`.** That array is a top-level `const` built as the
file loads, so a table declared below it is in the temporal dead zone and **the app does not start
at all** — `Cannot access 'KIND_BUCKET' before initialization`, on the first line of the first facet.

### Three fell to the alphabet, and which three is a fact about the data

| | |
|---|---|
| `topic` | 417 distinct values and **70 are in no branch of `data/topics.json`** — `quadratic equations`, `volume`, `sets`, `plans and elevations`, `hcf`. The tree's SECOND level is exactly the larger topic that was asked for, and **rule 1 is all-or-nothing on purpose**: a grouping that places 347 and drops 70 makes those 70 unreachable with nothing on screen saying so. What carries the user's own sentence meanwhile is `Topic area`, which IS the larger topic and is asked immediately before Topic — so the ranges index inside one area rather than across the library |
| `paperId` | a paper's larger category is its sitting, its board, its tier and its type, and every one of those is already a question asked before this one. What is left to tell two papers apart by then is the name on the cover |
| `category` | the link categories come out of `data/settings/links.json`, which the owner edits with no deploy. A table in code over a list the sheet owns is two things to keep in step, and the code's copy is the one that goes stale |

### `P`, `R`, `W` — the paper question indexed a spelling nobody has ever seen

**266 papers came back as three buckets.** The `paperId` facet's `of` returns an id —
`P-1MA1-1705-1H`, `RS1786302107764-481`, `W-1CM-reflections` — and its own note has said since it
was written that *"the id decides WHO answers and the name is what is shown"*. The alphabet keyed
on the value, so it indexed the id.

**`bucketKeyOf_` is the one reader and it prefers `bucketOf`, then `showOf`, then the value.** Keyed
on the name the paper question is six ranges over `Adding Decimals` and `Circle Theorems Edexcel`,
which is what an index of 266 documents is. `showOf` is called with no answer list, deliberately:
`facetTally_` passes one so a label can be disambiguated against its siblings, and `bucketHas_` is
handed one item and never the list — so a key built from the shortened form could not be recomputed
at match time.

**AND IT CLOSED A LEAK IN EVERY DECLARED TABLE WHOSE LABELS ARE PREFIXES OF ITS VALUES.** `Level`
drew `KS2 (259)` where `LEVEL_BUCKET` says 228: a range labelled `KS2` prefix-matched the values
`KS2–GCSE` and `KS2–KS3`, so **31 rows were in two buckets at once** and that table's own sentence —
*"a span is filed under the level it goes UP TO"* — was contradicted by the mechanism meant to
implement it. `KS3` was the same, ten rows.

**Every rule was green over it**, and the reason is worth keeping: the drawn count and the pressed
count agreed, because both go through `bucketHas_`, which is the function that was wrong.

### Two rules in `check-funnel.js`, and one printed list, because only one of the three is checkable

**THE CAP IS A PROPERTY OF THE DATA RATHER THAN OF THE CODE**, which is why it is walked rather than
assumed: every rule in `bucketValues_` can decline — a facet's own grouping stands down if it cannot
place every value, the tens band stands down unless everything is an integer, and the alphabet
stands down if every value reduces to one key. Each of those is right and each leaves the list
untrimmed. So the check walks the real funnel — the top, every answer to both doors, and the greedy
path — and fails on a question drawn with more than seven answers. **Proved by mutation**: with
`bucketValues_` handing back its input it names **71 over-sized questions across 17 states** — the
first eight of them `topic` at 375 answers, `division` at 16, `decade` at 14 — and exits 1.

**AND A DECLARED BUCKET HOLDS EXACTLY WHAT ITS TABLE SAYS.** Comparing `filterHit` against
`facet.bucketOf` per item is what catches the `KS2` leak — the table is the thing compared against,
not the code that reads it. **Proved by mutation**: the alphabet keyed back on the raw value names
`level` and exits 1.

**WHAT NEITHER CAN JUDGE IS WHETHER SEVEN BUCKETS ARE WORTH READING**, and `P / R / W` is the proof:
legal, balanced, under the cap, and green on every rule in the suite. So the first grouping each
question makes is **printed in full on every run** and a person reads it — the argument this
repository makes about the figure backlog and the transcription queue, pointed at the funnel.

### Three things the buckets broke, and each refusal was right

| | |
|---|---|
| **the sitting vocabulary** | rule 4 refuses an `examWave` answer that is not `<series> <year>`, and sixteen sittings group into year pairs — so it named all five of `2023 & 2024` and friends. **A bucket is a GROUP over spellings, so by construction it cannot be one.** It reads `facetOwn_` over the items now — the column itself, one step before the grouping — which is what the rule was always about: `First wave` sat on 850 rows for months and the fault was in the column |
| **the `promises` test** | it pressed `{field, value}` and the app presses `{field, value, bucket}`, so it reported `1–10` returning 0 of a promised 14. The harness was wrong about the press, and the flag is carried from the value that drew the row so the two cannot disagree |
| **the paper test** | *one answer per paper* is right about a leaf and meaningless about a shelf. Told apart by the flag the row carries rather than by the shape of the text |

**And the cross-facet overlap note named four letter ranges** — `2–B` is an answer to Topic and to
Paper, `M–P` to Paper and to Category. That is arithmetic rather than ambiguity, where the four real
findings under it are one WORD carrying two meanings. Buckets are skipped by the same flag. (It is
still worth knowing that the Paper index and the Topic index read alike over the 1st Class Maths
worksheets, because those sheets are NAMED after their topic — a fact about the library.)

### A question asked inside a bucket was still offering what was outside it

**Found by walking the funnel and reading what it drew, which is the only way it could have been.**
Six chips deep, pressing `Topic · D–F` drew **`D–E`, `F`, `I–M`, `N–P` and `S–T`** — three answers
plainly outside the chip sitting above them.

**NOTHING WAS BROKEN, AND THAT IS WHY IT NEEDED MEASURING RATHER THAN READING.** `topic` is
multi-valued; the chip means *"has a topic in D–F"*; and a question tagged `Decimals, Ratio` is
legitimately kept by it and legitimately still carries `Ratio`. Pressing `S–T` would have narrowed
to questions about both — correct, and unreadable: the funnel appears to step back out of the
bucket it has just gone into, on the one screen whose whole job is to say where you are.

**So the ITEMS keep every value they have and the QUESTION offers only the ones inside.**
`filterHit` is untouched, so nothing leaves the list; what changes is which answers the next ask
draws. Measured after: `Topic · D–F` draws `D`, `E`, `F`. **A single-valued facet is unaffected by
construction** — pressing `Grades 4–6` leaves items whose only Grade is inside it — which is why
the tens band this generalises never had to think about it.

**And the tally is keyed on the bucket as well as on the list and the facet**, because it is no
longer a function of the first two alone. The items array is freshly built on every filter change,
so the `WeakMap` key already differed in practice; the third key is what makes that an argument
rather than a coincidence.

**The rule tests the RAW VALUES, and its first version named four findings that were all correct
behaviour.** Asking `bucketHas_` whether an inner ANSWER is inside the outer one is a category
error: inside `1–10` the question numbers re-group as `2–3`, `4–5`, and a label is not a value.
What it asks now is whether any value on a kept item that the outer chip does not contain is held
by an answer drawn inside it. **Proved by mutation**: with the restriction off it names `topic`,
`topicArea` and `decade` — eighteen findings — and exits 1.

### The count beside a bucket is counted over items, not summed over answers

**The first version summed and the `promises` test caught it the moment it was written.**
`facetTally_` counts an item once per ANSWER it gives — which is right, and is what makes a
worksheet tagged `KS3, KS4` appear under both — so a question tagged `Loci` and `Nets`, both inside
`L–O`, was counted twice in that bucket. Measured: the row promised 723 and pressing it returned
646. **The recount goes through `bucketHas_`**, the same function `filterHit` uses, over the same
items.

**And `bucketHas_` opened with `if (!/^[a-z]/i.test(b)) return false;`, which was wrong about two
real answers**: the question-part facet holds `1`…`9` beside `A`…`F`, so its buckets were `1` and
`9–A` and pressing either returned nothing at all while the row beside it promised 253 and 306 —
the silent empty this whole mechanism exists to avoid, caused by the mechanism itself.

**What it costs, measured**: a repaint at every state down the greedy path is **2–11 ms** over 5,587
items, against the 15–28 ms this file already records for answering a question. Tallying all
twenty-six facets cold went 271 ms → 541 ms, which is a number the app never pays: `nextFacet` walks
in order and stops at the first question that qualifies, and `facetTally_`'s memo makes every
reading after that free.

### A review of all fourteen groupings found a hole in the engine, and refuted the one I had left open

**Fourteen designs, one per over-sized question, each then attacked by three independent reviewers
told to refute it.** All forty-two verdicts came back unsound, which is what a refuter is for and
is not by itself a finding. Three of the defects are about the code that shipped rather than about
the proposals, and all three are real.

**THE FIRST ONE BROKE THE GUARANTEE THIS WHOLE COMMIT IS ABOUT.** `bucketKeyOf_` preferred
`bucketOf` — on the argument that a facet declaring its own grouping is saying what its values are
about, so a grouping with too many groups to draw would at least give ranges over the GROUP names.
What it gives when every value on the list maps to ONE group is a key that is **the same string for
every value**: `alphaBuckets_` grows its prefix to twelve characters, never finds a second run,
returns null, and `bucketValues_` hands the list back **ungrouped**. Measured on a ten-value facet
whose table answers one label: **ten answers drawn, cap gone.**

**THE KEY HAS TO BE A PURE FUNCTION OF THE VALUE *AND* HAS TO TELL VALUES APART**, and those two
together are the whole constraint — `bucketHas_` is handed one item and never the list, so it
cannot know which key the drawer chose. What a value is READ as always tells values apart, because
that is what makes them different answers. So the key is `showOf` or the value, and the
`KS2`-against-`KS2–GCSE` leak that `bucketOf` was put in the key to close is closed by
`bucketDeclares_` instead: **a label the grouping made is the grouping's, both ways** — not "the
table says yes, and then try the ranges anyway", which is what let a range labelled `KS2` collect a
span the table files under `GCSE`. A table enumerates its labels in `bucketOrder`; a computed one
is idempotent (`waveBucket_('2023 & 2024')` reads the year out of its own label and answers it),
which holds by construction for a grouping that reads a number out of a string.

**THE SECOND IS THAT THE TABLES WERE KEYED MORE TIGHTLY THAN THE FOLD THAT DECIDED THEIR ANSWERS.**
`bucketTable_` keyed on `norm` — lower case and trim — while `facetTally_` folds variants by
`spellKey_`, alphanumerics only, and hands the grouping whichever spelling won the vote. This file
records `Alevel` / `A-level` / `A-Level` as three answers on one screen **in this very column**: a
row spelled `A Level` is the same answer to `spellKey_`, wins the vote by carrying a separator,
reaches the table as a key `norm` has never seen — and one unplaced value stands the WHOLE grouping
down to the alphabet, silently, on a question that worked the day before. It falls back to
`spellKey_` now, built on first use because the tables are constructed before that function exists.
**Proved by mutation**: the old lookup names `subject` and exits 1.

**The third is that `bucketLabels_` called `bucketOf` with no `try`** where `bucketKeyOf_` wrapped
it. Nothing can throw today — eleven are table lookups and two are a regex over a string — and
`filterHit` runs the same function per item per chip, so the day one of them resolves against a
file that has not landed, an unguarded call is the Find screen rather than an ungrouped question.

### And it refuted the grouping I had left `topic` without

**THE OBVIOUS ONE IS THE TREE'S SECOND LEVEL and it is not available, which is now measured rather
than reasoned.** `data/topics.json` is three levels — 13 roots, 95 mid nodes, 191 leaves — and the
roots are what `topicArea` already draws. A mid-level grouping folds to 37 labels, at most seven
present at once, and the review measured what it actually draws over **873 reachable states**:

| | |
|---|---|
| states where Topic is asked and needs grouping | 303 |
| **where the 37 labels fire** | **76** |
| where it falls back to letter ranges anyway | 227 |
| `Topic area · Number` / `· Algebra` / `· Geometry & Measures` | **all three still draw letters** |

**Those three are the errands.** So the proposal does not fix the complaint where the complaint
appears, and it costs a 64-entry table, a 46-entry fold and a three-pass resolver to not fix it.
**And the reason is structural rather than a gap in the table**: at `Topic area · Number` the 91
topic values on offer span all seven strands, because a question tagged `Multiplication, Area of
2-D Shapes` is in both lists — so any map fine enough to tell two topics inside one strand apart
has at least eight labels present there. The only map that fires on a wide list is the strand map,
and the strand map is `topicArea`'s, asked one row above.

**So the alphabet stays, and it stays on a measurement instead of on my judgement.** What would
change the answer is the data — a topic column with one strand per row — and not a cleverer table.

### And the runner hid the failure that this change caused, twice

**`check/press.js` FAILED INSIDE `npm run check` AND THE FOURTEEN LINES UNDER IT WERE THE PART THAT
IS FINE** — the twelve controls that are correctly quiet, and a count. This file already records
that happening once and the repair it chose was a pointer line: *"… 7 earlier line(s) not shown —
`node check/press.js` for the whole report"*. Better than nothing, and it is still asking somebody
to run a three-minute check a second time to find out what the first run said.

**THE WHOLE OF THE FAILURE WAS ONE LINE FORTY LINES ABOVE THE TAIL**: `! could not enter account ·
a tutor switched off: pic is not defined`. A check that marks a line with `!` has already said this
is the finding, so the runner lifts those out of the tail and prints them whether or not they fall
in the last fourteen. The tail stays, because for most checks it IS the report.

### And twenty-three comments said `1\u201310` where they meant `1–10`

**Found by a `python3` heredoc refusing to match a string I had written with it an hour earlier.**
A `\u2013` inside a non-raw Python string is an en dash; written into a file through a layer that
had already consumed the backslash, it lands as the six literal characters `\u2013`. So the
comment over `filterHit` read *"REPLACES `1`…`13` WITH `1\u201310` AND `11\u201320`"* — in a
repository whose own first page says the prose is the most valuable thing in it.

**Twenty-three across four files, twenty-one of them leaks and nine of those months old**, in `book.js`'s note about the
waiting-list week. Nothing could see them: they are comments, so they parse, they render nothing,
and no check here reads English. A scan that marks the comment spans with a small state machine and
leaves every string literal and regex alone is what found them — `' \u2014 '` inside a JS string
is a real em dash at runtime and must not be touched.

**AND TWO OF THE TWENTY-THREE WERE RIGHT AND THE SWEEP BROKE BOTH.** `data.js` carries *"`\u0000`
cannot occur in a law's text"* and `sortKey_` in `find.js` carries *"`\u0000` BETWEEN THE PARTS,
because it sorts below every printable character"* — prose ABOUT the escape, where the literal
characters are the point. Replacing them wrote a real NUL byte into each, and **git reported both
files as binary**: no diff, and `grep` refuses them outright, which is how it was found.

**MEASURED RATHER THAN ASSUMED, because the obvious conclusion was wrong.** A NUL inside a comment
is legal source: node parses it, and Chromium served the same file over HTTP and ran everything
either side of it. So what the corruption costs is the TOOLING and the history — a file nothing can
diff, grep or review — rather than the app, and it would have been committed in exactly that state.

**It is the reason this is a sweep rather than a check.** Telling a comment that QUOTES an escape
from one that LEAKED an escape is a judgement about what a sentence means, and a rule that cannot
tell them apart would corrupt the two files it should leave alone.

### And `check.js` refused the first version of the fold, one finding per table

**`bucketTable_` is CALLED AT LOAD** — `const KIND_BUCKET = bucketTable_([…])` runs as the file is
parsed — and the first version kept `spellKey_` where it was, four hundred lines further down,
by building its second index lazily on the first lookup. **`js/check.js` named all eight tables**:
*"calls `bucketTable_()`, which uses `spellKey_` — declared at line 2252 of the same file, so it is
still in its dead zone and this throws. Everything below it in the file never loads."*

**IT COULD NOT SEE THAT THE REFERENCE SITS BEHIND A BRANCH THAT ONLY RUNS LATER, and that is the
check being conservative about the right thing.** What it guards is a throw at load taking every
name below it with it — which this file has already paid for once, in the note above `FACETS`
about `KIND_BUCKET` and the temporal dead zone, from the other side.

**So the dependency was made real rather than argued with**: `SPELL_KEYS` and `spellKey_` moved
above the tables, both indexes are built at construction, and the lazy branch is gone. A dependency
that is real belongs above its dependent, which is the one rule `index.html`'s file list is built
on, applied one file in.
