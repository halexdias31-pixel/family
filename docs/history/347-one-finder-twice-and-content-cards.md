## One finder, twice: Find 2 carries everything Find does, and keeps a place of its own

**The owner, 12 Oct:** *"Also forget what I said about the finders regarding one having content and other
have exercises. Return to that origional finder having everything and now there is just an identical
second finder. Smart students will know to use this second finder to have the content up while they do
questions on the origional finder."*

That reverses the membership half of docs/history/329 (10 Oct), where the second column carried only the
kinds labelled Resources and Find the rest. The binding half of 329 — one engine, two states — is kept,
because it is the part the owner's use depends on. (The same message asked for the textbooks to become
content cards tagged like questions; that is the second part of this note's work and is written up below
it when it lands.)

### What there is now

| | |
|---|---|
| **Find 2, the column right of Find** | The same list as Find — 8,381 items over the real files signed out: 8,006 questions, 82 practicals, 9 projects, 24 textbooks, 103 boxers, 157 fights, and the Bible's cover for an admin — and the same funnel over it. Its first question is Find's (`What kind`, over the real library), because it is the funnel's own choice over the same list. |
| **Its own state** | Words, chips, page and kept place (`res:place`) are its own, exactly as 329 built them: `inFinder_` parks the bound finder's `STUFF` and memos, presses bind to the column they are in (`finderAt_`), later work captures its finder. A student keeps a chapter up in one column and answers questions in the other, and neither reaches the other. |
| **Called `Find 2`, with Find's 🔎** | In `TABS` (shell.js) and `data/settings/columns.json` (which `applyColumns_` lays over the code). "Resources" said it held different things; the owner's words for it were "finder 2" and "an identical second finder". **The id stays `res`**: it is in the remembered column (`familyTab`), the kept place's storage name, `TAB_ORDER`, `PAGE`/`PAGE_KEEP`/`PAGE_LO`/`PAGER`, every DOM id the column draws (`res-q`, `res-chips` …), `<section id="s-res">` and dozens of checks — churn nobody sees, and a remembered `res` would land on no column. |
| **Find's front pages stay Find's** | The booking form, the posts and the bundles in front of the question are not search results. The booking form is one draft of one booking (`BOOKING` is one global state), and a second copy one swipe along would be two forms writing the same booking. The Tools tail of the fill stays Find's too (`widgets`): one widget started and stopped by two columns' fills is one clock reset by whichever filled last. |
| **The empty sentence** | The same in both (`FINDER_EMPTY`). It still says "the shop", which Find no longer carries; the words are what `check/states.js` and a check-flow journey look for to tell a cold load from an empty library, so changing them is a change to two detectors and is left for the cleanup pass. |

### What was deleted, and why each could not simply stay

- **`resKind_` and `FINDER.has`** — the membership rule. `stuffItemsBuild_` keeps only the
  `FUNNEL_NOT_FOR` rule (Booking and Shop) now.
- **`finderOfItem_`** — "the finder that holds this item". With both holding everything it could only
  answer Find, which would have hidden a decision in a function's name; each caller now says which
  finder it means:
  - `bible-go` (the cover's Open, a verse's Chapter, the Chapter tile on Saved) → **the finder the press
    was in** (`finderAt_`): in Find 2 it stays in Find 2, where the student is reading; from Saved or the
    Spotlight, which are no finder, it is Find.
  - the Bible's index landing and `bible-retry` → **every finder** (`finderEach_`): both hold the Bible
    for an admin, so a `psalms` typed into either while the index was on its way must be told.
  - `find-open` → `finderOpen_(x, part, F)` with `F` the finder the press was in, which from Saved and
    the Spotlight is Find.
- **The "N in Resources" tile** (`finderElsewhere_`, `finderWordsCount_`, `finder-words`,
  `.tile-row.is-elsewhere`) — 329's review, finding 1. With one list in both columns an empty search
  asked of the other finder finds exactly nothing more under no chips; under its own chips the tile would
  carry the words into the column a student keeps a chapter up in AND CLEAR ITS CHIPS — the very place
  the second finder exists to hold. The right advice when chips hide every hit was already the sentence:
  *"Try fewer words, or take a filter off."*
- **`finderForeign_`** — dropped a kept chip that only the other finder answered. Nothing is outside
  either finder now, so it could never fire. Replaced by `placeChipDead_` (below).

### Open, from Saved and the Spotlight: under a card that is not whole there, into Find

It was `Open · in Resources` under a resource only (329). Now the line is drawn where it belonged: Saved
and the Spotlight draw a kept thing as its card (`cardPages_` — a question whole: opening, figure, words,
answer), so a card is given `Open · in Find` exactly when `pageParts_` has a part that list does not draw
(`keptPart_`, one predicate read by both): a textbook's chapters, a boxer's fights, a project's steps and
Share, a practical's kit, method and worksheet. A question, a fight, a shop thing and a boxer with no
fights get none; the Bible keeps its own Open. Never inside a finder — `KEPT_DRAW`, set by `keptPages_` as
`SPOT_TILES` is set by the Spotlight, is the only thing that tells a card on Saved from the same card drawn
by Find's fill. **New**: kept practicals and projects have a way to their method pages from Saved, which
they never had before 329 either.

**INTO FIND, AND WHAT IT COSTS.** Opening walks the funnel for the card (`finderWalk_`) and lands on it
— which replaces Find's chips and words with the walk. A student with questions up in Find who opens a
kept chapter from Saved loses Find's place. The alternative, Find 2, matches "content in the second
finder", but is a guess about which column holds what — which is the split the owner took back. Find
2's place is never touched by it (a journey asks).

### A kept place: chips nothing will answer are dropped, chips nothing answers YET are kept

`placeChipDead_` decides by what a chip IS, never by what answers it at the moment — `findPlaceBack_` runs
on the first payload, before the library lands, when no paper's chip is answered by anything (329's
"early" half, kept):

- a **Bible chip** (Book, Chapter, Verse, the doors above them, and `Shelf · Books`, which holds only the
  Bible) is dead for anybody the Bible is not for (`bibleFor_`). An admin's place inside Genesis 1 comes
  back inside Genesis 1, on either finder — it used to come back without it on Find, because Find had no
  Bible;
- a chip on a **retired question** (`RETIRED_FACETS`) is dead;
- a chip on a **field no facet asks** is dead once the facets have arrived (`DATA.facets` has rows) —
  before then a sheet-only question (`projectType`, `practicalType`) is merely not here yet. `filterHit`
  reads a facetless chip as matching everything, so it would hang on as a chip that does nothing.
- everything else comes back. A Find place from before this change holding `Shelf · Boxing` — which the
  split dropped from Find — keeps it now: Find answers it.

**SAVED.** Nothing to do for this half: every key either finder could have starred still names an item,
and `collItems_` draws only keys that name one, so a star whose item is gone is skipped quietly.

### Two Find-only assumptions that became bugs

329 left both in place because the second column then held no question:

- **`findKeep_`** (answers.js) held a column back from a repaint while an answer box had the focus, the
  keypad was up or a stroke half drawn — for `stuff` only. Find 2 holds every question now, and the
  owner's use is a child answering in one column; a payload landing under a box in Find 2 rebuilt the
  column under her (the diag-signin fault, on the other column). `findKeep_`, `findVerdictShown_` and the
  focusout redraw ask of any finder now, and `typingBox_` (shell.js) leaves both finders to them.
- **The found list forgotten on one finder.** `me.js` cleared `FIND_MEMO.key` after a friends change — from
  outside a binding, Find's alone. `finderForgetFound_` clears every finder's.
  (Not fixed here, and found on the way: the friends are built into `stuffItemsAll_`'s list, memoised on
  the person, so clearing the found list alone does not bring a new friend in until something rebuilds
  the whole list — true before this change on Find, now on both.)

### One list for both finders, counted once

Each finder memoised its own copy of the list, and every count the funnel makes is held in a WeakMap
keyed on the array — so Find 2's first question tallied the whole library again to reach the answers Find
had just drawn: **measured 299 ms in jsdom on the first load**, where `paintNeighbours` paints every
column. The list is built once (`FUNNEL_MEMO`) and both finders hold that array — and with no chips and
no words `stuffFind` hands back `stuffSorted_`'s copy of it, which is then the same array in both finders
too, so the first question's tallies are counted once. After it, Find 2's first question measured
**0 ms**. Nothing sorts or splices either array in place: the readers that order a list order a copy.
(A second memo for the first question's list was written first and proved redundant by its own mutation:
taking it out changed nothing, because the sort's memo already shares the array. It was deleted.)
**And `stuffItemsBuild_` may no longer ask which finder is bound**: its answer is both finders' list,
built by whichever asked first. The mutation that put the split's `FINDER.has` back there was measured
doing nothing at all — which is why the split mutations below are made where a finder's list is held.

### Checks

The journeys and passes that asserted the split were rewritten to the new rule, not deleted:

- **check-flow**: the column is Find 2 with Find's icon (from the file served and from the code's own
  default), right of Find, and asks Find's first question; both finders carry the same items (same keys,
  same count, every kind the funnel offers, the same What kind, "frequency density" finds the book on
  both, a relabelled kind moves nothing, the first question's list one array); no shared state (chip,
  word, page, both ways, the detached Clear, each Clear — setup now presses What kind · Resources); each
  keeps its own place, and a kept place drops Bible chips for a non-admin, the Books shelf, a retired
  question and a facetless chip once the facets are in, and keeps `Shelf · Boxing` and a paper chip not
  answered yet; across a sign-in (329/318's rules unchanged); Saved's Open under a kept textbook, boxer
  and project lands on the card in Find with the rest a swipe up and Find 2's place untouched, and a kept
  fight and question get none, and no card inside a finder does; an empty search on either finder says
  "take a filter off" under a chip and "Try fewer words." for a word nobody has, and draws no tile; a
  kept Bible place comes back inside Genesis 1 for an admin and without it for a pupil; the Bible journey
  lands Saved's Chapter tile in Find and asks that `psalms` typed into Find while the index was on its way
  finds the Bible once it lands; the admin-against-parent walk walks every start on both finders and
  asks that each visitor's two walks are one walk; and a new journey: the payload landing does not
  rebuild Find 2 under a keypad box with the focus, and does once it is left.
- **check-funnel**: rule 0 is that Find holds every kind the whole list offers (the textbooks, boxers and
  fights among them); the range rule's second-finder pass is now Find's own `What kind · Resources →
  Shelf` states (Division and Decade are asked there); the Find 2 pass asks the same ids, the same first
  question and, after each of its answers, the same next question as Find — and the fence.
- **check/states.js**: "a search only Resources answers" became "a search a chip hides" (the sentence,
  measured, and no tile); the `res` group stays, in Find 2's binding.

**The work was cut off by a spend limit before it was committed**, and finished by a second run that
read the uncommitted diff, kept it and ran the checks once over the finished tree: check.js, check-const,
check-funnel, check-drafts, check-doors, check-css, check-loading, check-payload, all four parts of
check-flow (356 journeys), check/ui.js on `stuff` and `res` (the states, nothing new), and check/swipe.js
— all green. **The two mutations that prove the rule itself were run again by that second run**, each on a
copy of the tree, each red, the real files green:
- **Find 2's list kept to the Resources** (`stuffItems` handing Find 2 the Resources rows of the shared
  list): check-funnel's Find 2 pass (8,381 items against 284, Find 2 asking Shelf first, nothing after any
  of Find's What kind answers) and the both-carry journey (293 against 284, no projects, two arrays for
  the first question, the relabel moving the boxers off Find 2).
- **The two finders sharing one state** (`RES_ST` the same object as Find's `STUFF`): the no-shared-state
  journey — a chip, a word and Clear each crossing, both ways.

The list below is what the first run recorded as it went; it was not re-run when the work was finished.

**Mutations**, each applied to a copy of the tree, each red, and the real files green after:
- **Find 2's list kept to the Resources again** (where a finder's list is held, `stuffItems`): the column
  journey (Find 2 asks Shelf first), the both-carry journey (293 against 284, no projects), the
  admin-against-parent walk (Find 2's walks are not Find's), and check-funnel's Find 2 pass (8,381 items
  against 284, a different first question, nothing asked after any of its answers).
- **Find without the resources**: the both-carry journey, the textbook journey, and check-funnel rule 0
  (Find holds no boxer, fight or textbook).
- **The label "Resources" in the file; in the code; the 📚 icon in the file**: the column journey, each
  through its own half (served, bare, icon).
- **The Open tile under every card; under none; under a whole card too; opening into Find 2**: the
  Saved-Open journey, each by its own line — a card in either finder carrying Open; the kept textbook
  with none; a kept fight and question given one; landing on `res` with Find 2's place changed.
- **`placeChipDead_` dropping nothing; dropping an admin's Bible chips; keeping the Books shelf; keeping a
  retired question; dropping a facetless chip before the facets arrive; keeping it after**: the reload
  journey and the Bible-place journey, each red on its own sentence.
- **The "N in Find 2" tile put back under an empty search; the "take a filter off" advice taken out**:
  the empty-search journey, on both finders.
- **`findKeep_` back to `stuff` only**: the Find 2 keypad journey (the box thrown away, the focus on BODY).
- **`bible-go` always into Find 2**: the Bible journey (Saved's Chapter tile lands on `res`).
- **The index landing telling Find 2's memo only**: the Bible journey (`psalms` typed into Find still
  misses the Bible after it lands).
- **Each finder its own copy of the list**: the both-carry journey (two arrays for the first question).
- **329's own two, still standing**: the binding not swapping `STUFF`, and `facet-pick` always acting on
  Find — the no-shared-state journey, both.
- **And one that stayed green, which is how a redundant memo was found** (above): a second memo for the
  first question's list, taken out, changed nothing. It was deleted rather than given a check.

### For whoever touches this next

- **Don't bring back a rule that decides what a finder holds.** The second finder's point is its state.
- **A new deferred call in the funnel** must still capture `FINDER` and bind again (329's one rule).
- **Something that forgets the found list** forgets every finder's — `finderForgetFound_` or
  `finderEach_`, never `FIND_MEMO.key = null` from outside a binding.

## Part 2: content cards

**The owner, 12 Oct (the same message):** *"Also for maths text book begin adding topic tags so students can
immediately find what they need. Forget the whole concept of it being a text book. It's just a "content card"
or whatever. It can share same tags as questions e.g. gcse, ks2, maths."*

### What changed

| | |
|---|---|
| **One chapter, one card** | Every chapter row of `data/textbooks.json` (chapter ≥ 1) is one item of a new kind, `content` (`contentItem_` in find.js), keyed `ct:<book_id>-<chapter>`. The card (`contentCard_`) is the shared Find head (title, the `Content` flag), the tag row a question wears (`contentTags_`), then the key words, formulas and worked lines (`tbSections_`, unchanged). Its animations are still pages of their own after it (`an17-pyth`), played in whichever finder it is open in; the page's kicker is the subject and the card's title, never a chapter number. 272 cards. |
| **`What kind · Content`** | Its own answer, beside Questions, Answers, Practicals, Projects, Bundles — first in `Read or watch it`, ahead of Resources. `Content` is the code's own label, so an empty `kinds` tab still says it. Boxing and the Bible keep their door (`Shelf`). |
| **The cover is defaults, not a card** | A chapter inherits the cover row's `subject`, `level`, `keystage`, `board`, `spec`; its own cell wins (`libraryExtras_` in library.js). |
| **The question library's tags** | Subject and Level as the library spells them (`GCSE`), `keystage` as a comma list, `tier` = Higher only where the whole chapter is, and **`examBoard` blank unless the content is one board's**: English Language 1–8 (AQA's Paper 1/2 question numbers), English Literature 1–9 (the exam, the set texts, the AQA anthology clusters), History 1–10 (AQA's question types and options), Geography 11 and 13 (AQA's Nigeria case study, Paper 3), RS 1, Sociology 8 (question types), French/Spanish/German 1–9 and 14 (AQA's themes, the exam tasks), D&T 10, Food 8, Art 8, PE 9 (the NEA), Music 3–9 (AQA's areas of study, the listening exam, the NEA), Drama 5–8 (AQA's components), Media 7–10 (Eduqas's set products and production). Every cover's own board and spec were blanked: a `Edexcel` chip on every GCSE Maths card would have hidden every board's words from an AQA student. |
| **Key stage** | KS4 from every GCSE cover; `KS3, KS4` on a card where more than half the KS3/KS4 questions on its topics carry KS3 (measured from data/questions.json): Statistics 8, 9, 13, 15; Maths 1, 6, 8, 10, 14, 16, 20. The Key stage question still answers only inside SATs, so on a GCSE card, as on a GCSE question, the tag says `GCSE`. |
| **Gone** | The `@family. textbooks` shelf; the `Book` question (in `RETIRED_FACETS`, and its `facets.json` row off with a note); the contents card, the chapter pages and their `textbookCard_`/`textbookPart_`/`textbookText_` (now `contentText_`, one card's words). |
| **Content first in a mixed list** | `sortKey_` puts a content card ahead of everything else, the cards in the file's order (book id, then number). Measured: typing `histograms` under Maths · GCSE put the card at hit 32 of 47, under thirty past-paper parts, because the order is the alphabet of `sub` and a card's `Maths · GCSE` filed it among the papers. Every other item's key gained the same leading `1`, so their order among themselves did not move. This is the one change here a person will notice on a plain browse too: `Maths · GCSE` lists the 36 GCSE Maths and Statistics cards before the first question. |
| **Kept places and stars** | `placeChipDead_` drops a kept `Shelf · @family. textbooks` (`RETIRED_SHELVES`) and a `Book` chip (retired), early or late. A book starred before this (`tb:<id>`) names no item, and `collItems_` already draws only keys that name one, so Saved skips it quietly — a journey asks that Saved's markup is byte-identical with and without it. |

### The maths cards' topics, before and after

Every library maths topic each card teaches, read off its words, formulas and worked lines, in the tree's
spelling where the tree has the label and the library's own where it has none (`counting`, `reciprocals`,
`difference of two squares`, `plans and elevations`); never one it does not teach (no `3-D Pythagoras &
Trigonometry` on a card with no 3-D, no `Cumulative Frequency` on one that gives the IQR as a subtraction).
The counts are maths questions in data/questions.json carrying each topic, folded by `spellKey_` (case and
punctuation), counted with `python3 -I`:

| Card | Before (maths questions on them) | After: every topic it teaches (maths questions on each) | Key stage |
|---|---|---|---|
| Number, factors and primes | Properties of Number, Order of Operations, Negative Numbers (14) | Properties of Number 0, Order of Operations 6, Negative Numbers 8, Factors & Multiples 12, Primes & Prime Factorisation 19, HCF & LCM 50, counting 4 (99) | KS3, KS4 |
| Indices, surds and standard form | Indices, Surds, Standard Form (135) | Indices 38, Laws of Indices 6, Fractional & Negative Indices 37, Standard Form 83, Surds 14, Simplifying Surds 41, Rationalising the Denominator 3, reciprocals 2 (224) | KS4 |
| Fractions, decimals and percentages | Fractions, Percentages, Fraction Decimal Percentage Conversion (39) | Fractions 8, Equivalent & Simplifying Fractions 18, Adding & Subtracting Fractions 20, Multiplying & Dividing Fractions 8, Mixed Numbers 10, Recurring Decimals 24, Fraction Decimal Percentage Conversion 10, Percentages 21, Percentage Increase & Decrease 49, Reverse Percentages 26, Simple & Compound Interest 52, Growth & Decay 3 (249) | KS4 |
| Rounding, estimation and bounds | Rounding, Estimation, Bounds & Error Intervals (87) | Rounding 15, Significant Figures 4, Estimation 13, Bounds & Error Intervals 59 (91) | KS4 |
| Expressions, formulae and proof | Manipulating Expressions, Formulae, Algebraic Proof (35) | Manipulating Expressions 0, Simplifying & Collecting Terms 4, Expanding Brackets 48, Factorising 10, difference of two squares 2, Formulae 2, Rearranging Formulae 8, Function Notation 34, Composite Functions 30, Inverse Functions 28, Algebraic Proof 33 (199) | KS4 |
| Straight-line graphs | Straight Line Graphs, Equation of a Line, Parallel & Perpendicular Lines (103) | Straight Line Graphs 35, Equation of a Line 46, Parallel & Perpendicular Lines 22, Coordinates 13 (116) | KS3, KS4 |
| Quadratic and other graphs | Quadratic Graphs, Recognising Graph Shapes, Transformations of Graphs (76) | Quadratic Graphs 33, Turning Points 3, Completing the Square 32, Recognising Graph Shapes 3, Transformations of Graphs 40, Trigonometric Graphs & Equations 31, Equation of a Circle 31, Equation of a Tangent 15 (188) | KS4 |
| Linear equations and inequalities | Linear Equations, Simultaneous Equations, Inequalities (145) | Linear Equations 62, Unknowns on Both Sides 19, Simultaneous Equations 67, Inequalities 16, Solving Inequalities 31, Inequalities & Regions 1 (196) | KS3, KS4 |
| Quadratic equations | Solving Quadratics, Completing the Square, Iteration (112) | Solving Quadratics 30, Completing the Square 32, Iteration 50, Quadratic Inequalities 23, Simultaneous Equations 67 (202) | KS4 |
| Number sequences | Term-to-Term Rules, nth Term of a Linear Sequence, Types of Sequence (158) | Sequences 5, Term-to-Term Rules 73, nth Term of a Linear Sequence 24, Types of Sequence 61, Quadratic nth Term 0 (163) | KS3, KS4 |
| Ratio and proportion | Sharing in a Ratio, Direct Proportion, Inverse Proportion (82) | Ratio & Proportion 1, Writing & Simplifying Ratio 29, Sharing in a Ratio 6, Ratio Problems 49, Best Value & Unitary Method 5, Scale Drawings & Maps 4, Direct Proportion 38, Inverse Proportion 38 (170) | KS4 |
| Compound measures and rates | Compound Measures, Real-Life Graphs, Gradient of a Curve (65) | Compound Measures 10, Units & Measures 36, Real-Life Graphs 54, Gradient of a Curve 1, Area Under a Curve 1 (102) | KS4 |
| Angles, polygons and constructions | Angles, Constructions & Loci (21) | Angles 6, Types of Angle 6, Angles in Parallel Lines 20, Angles in Polygons 44, Bearings 45, Constructions & Loci 15 (136) | KS4 |
| Transformations, congruence and similarity | Transformations, Similarity & Congruence (18) | Transformations 18, Reflections 40, Rotations 2, Translations 4, Enlargements 45, Describing a Single Transformation 2, Similarity & Congruence 0, Congruent Triangles 1, Similar Shapes 13, Similar Areas & Volumes 21 (146) | KS3, KS4 |
| Circle theorems | Circle Theorems (53) | Circle Theorems 53, Parts of a Circle 3 (56) | KS4 |
| Area and volume | Mensuration, 3-D Shapes (16) | Mensuration 0, Area of 2-D Shapes 55, Area & Circumference of Circles 42, Arcs & Sectors 25, Volume & Surface Area 140, 3-D Shapes 16, plans and elevations 5, Units & Measures 36 (319) | KS3, KS4 |
| Pythagoras and trigonometry | Pythagoras' Theorem, Trigonometry (22) | Pythagoras' Theorem 2, Trigonometry 20, Right-Angled Trigonometry 18, Exact Trig Values 22, The Sine Rule 12, The Cosine Rule 11 (85) | KS4 |
| Vector geometry | Vectors (15) | Vectors 15 (15) | KS4 |
| Calculating probabilities | Probability (56) | Probability 56, Basic Probability 11, Listing Outcomes & Sample Space 2, Relative Frequency & Expectation 0, Tree Diagrams 49, Venn Diagrams & Set Notation 69, Conditional Probability 32 (219) | KS4 |
| Data and statistics | Statistics (9) | Statistics 9, Sampling 21, Averages & Range 3, Mean 50, Median 50, Mode 46, Range 45, Averages from a Table 30, Comparing Distributions 4, Pie Charts 11, Scatter Graphs & Correlation 3, Histograms 56, Box Plots & Quartiles 3 (331) | KS3, KS4 |
| **All 20** | **48 tags, 1261** | **136 tags, 3306** | |

Statistics and every other subject kept their topics: each was already spelled exactly as the library or
the tree spells it, which the new rule now holds them to.

### What stays named textbook, and why

`data/textbooks.json`, its row shape, `DATA.textbooks` and `LIB_EXTRA`'s `textbooks`: `tools/anim_row.py`
rewrites fourteen animation rows in place by `anim` id (it touches no chapter row, so the new `keystage`
cell is safe from it), `splashSync_` keeps the splash's copy of `DATA.textbooks[].chapters[].animations`,
and `check-anims.js` anchors each animation directly under its chapter row. `check-textbooks.js`, the
`tb-` classes and `tb*` helpers (`tbSections_`, `tbMath_`, `tbAnimWatch_`, `textbookAnimPart_`) and the
`TB-` ids keep their names: none is seen, and each rename is churn in a check or a stylesheet.

### Not done, and why

- **`Topic · Surds` holds the card, not the questions.** The lead's test was "Maths → GCSE → Topic Surds
  shows the surds card beside the surds questions". A question does not answer Topic — the owner's call of
  6 Oct (docs/history/217, `topicShown_`: *"each question has an assigned topic. I hate that"*) — so a Topic
  chip keeps the cards and practicals and drops every question. Making questions answer Topic again would
  reverse that call and put Topic in front of every paper's questions; it is the owner's to make. What
  puts the card beside the questions is the search: typing `surds` under Maths · GCSE finds both, the card
  first. And Topic is not reachable by tapping over Maths · GCSE at all: the 36 GCSE Maths and Statistics
  cards carry 139 different topics, past `FACET_MAX_ANSWERS` (40), and the questions answer none.
- **KS2 maths.** `TB-KS2-MATHS` is not in this tree (it arrives from another branch); its chapter rows
  will need topics in the library's spelling, and `check-textbooks.js` will refuse it without.

### Checks

- **check-textbooks**: the kind is `content` labelled `Content` and placed in `KIND_BUCKET`; `contentItem_`
  puts a card on no shelf; a cover needs no board; a board and a spec go together; a key stage is KS1–KS5;
  and **every content topic is spelled exactly as a question or the tree spells a label, and every maths
  card (its own subject or its cover's: Maths or Statistics) has at least one** — 36 maths cards, 167
  topics. The old join (label, alias or id of the tree) now also accepts a library spelling.
- **check-flow**: the textbook journey is now the content-card journey (What kind · Content → Statistics
  on Find 2, the card whole with its head, tags and typeset formulas, no board on a Statistics card and
  AQA on Macbeth, the animation's page, nothing the app draws on any of the 272 cards or their pages
  saying textbook or chapter, the search on both finders, the star — and a book's old star leaving
  Saved's markup unchanged); **the owner's test**, new, on Find and Find 2 over the real question rows:
  Surds, Pythagoras' Theorem, Standard Form, Simultaneous Equations and Histograms each hold their card
  under Maths · GCSE · Topic, and typing each finds the card in the first ten hits and questions tagged
  with it; the both-carry, Saved-Open, reload (now the mean's animation page, and the kept place drops
  the textbooks' shelf and a Book chip), Pythagoras-page, splash and shared-parts journeys moved from
  `textbook` to `content`, and the Find 2 sign-in journey searches `probability` under What kind ·
  Content where it searched it under Resources (it found 0 pages there once the books left).
- **check-funnel** rule 0 asks Find for `content`. **check/states.js**: `a content card` (Measures of
  spread), three `a content card animation` states, and `a content card's tag row, every tag inside the
  card` (Data and statistics, thirteen topics) in place of the contents card's numbers. **check/anims.js**
  turns to each animation by its card's key under What kind · Content.

**Mutations**, each on a copy, each red, the real files green after:
- **A maths card with no topic** (Vectors' cell blanked) and **`Pythagoras Theorem` without its
  apostrophe**: check-textbooks, each on its own sentence. (The old join, which folds by letters, passed
  the second.)
- **`Surds` taken off the Indices, surds and standard form card's cell**: the owner's test ("no GCSE
  Maths content card is tagged Surds").
- **A content card not sorted first**: the owner's test, on both finders (`histograms` at hit 32 of 47).
- **The kicker saying `chapter 17`**: the content-card journey (28 animation pages say chapter) and the
  Pythagoras-page journey.
- **A chapter-1 card keyed `tb:<book>`**, so an old star names something: the content-card journey
  (Saved's markup changed).
- **`content` labelled `Resources`**: the content-card journey (no `Content` under What kind) and
  check-textbooks.
- **Statistics' cover given its board back** (inherited by every card): the content-card journey (the
  Averages card names Edexcel).
- **`RETIRED_SHELVES` emptied; `book` taken out of `RETIRED_FACETS`**: the reload journey, each on its own
  chip coming back.
- **And one that stayed green**: `topics` taken off the item. `topicOf_` reads the row's cell first and the
  item's only as a fallback, so the item's copy is the shape every mapper writes (practicals and projects
  too) and not what the Topic answer reads; the mutation that proves the tags is the data one above.
