# 031-checking-your-work (part 3 of 4)

Continues [part 2](031-checking-your-work-2.md).

### The collection line is gone, and a paper is an answer like any other

**Two ways of narrowing one list, stacked on one screen, is a pivot table.** `stuffQuestion` drew a
sentence above the funnel — *"or the 227 papers these are in"* — that turned the results into one
card per paper until you pressed it again. You had to know what it meant before you could use it,
and it named a thing the funnel could simply ASK about once the list was small enough.

**So `collect: true` came off `paperId` and the ordinary rules do the job better.** 227 answers keeps
the question silent at the top exactly as `FACET_MAX_ANSWERS` intends; narrow to one board, tier and
sitting and it is twelve, under the cap, and the funnel asks "which paper" as a plain question —
same chip, same ✕, same handler. Measured at the six-chip state: `Paper`, 12 answers, 100% coverage,
offered. **The name is shown and the id decides who answers**, because `P-1MA1-2211-1H` is a join
and the paper's name is on every one of its questions already.

`collectionAxes_`, `groupItems_`, `one_`, `plural_`, `STUFF.groupBy`, `on('group-by')`,
`on('group-open')`, the `group` tile in `tiles.js` and `.stuff-coll` are all gone. **The arithmetic
in them was right and is kept in prose** where they were: one distinct value per row identifies a
row, ~16 rows each is a collection, 654 rows each is a category, and the boundary between the last
two is the same constant.

**Two other things went off that screen for the same reason.** The count beside each answer — it was
defended as "the thing doing the work", and that is true of a list you are deciding between and
false of this one: four digits wide, changing on every tap, and never the reason you pick a topic.
It is still computed, because `facetSplit_` is a share of those counts and that is what keeps a
useless question off the screen. And the credits card, which was a balance on the app's front door;
nothing on the Find screen is spent.

### The Find screen was slow because it walked the same list twenty-one times

**Measured, first draw at 4,045 items: 200 ms.** Where it went, and all four are the same mistake —
work repeated that could not have changed:

| | |
|---|---|
| `collectionAxes_` | **71 ms** — every facet tallied over every item, to draw one sentence |
| the sort | **88 ms** — four `localeCompare` calls per comparison, ~200,000 of them |
| the facet rules | **3 walks per facet**: `facetValues`, `facetCoverage`, `facetSplit_`, each its own pass |
| `stuffItems` | **33 ms rebuilt on every keystroke**, and nothing in it reads a filter |

**`facetTally_` walks once and answers all three**, because they are three readings of one count:
the keys are the answers, the number of items contributing a key is the coverage, and the share
outside the biggest key is the split. The three old functions are thin readers of it, so every
caller — `check-funnel.js` included — is untouched. Held in a `WeakMap` on the items array itself:
a new list is a new array, so there is no key to get wrong and nothing to invalidate.

**`sortKey_` bakes the order into one string per item** and the comparator becomes `<`. Case folded
and every run of digits zero-padded to eight, which is what `numeric: true` does — so "Paper 10"
still sorts after "Paper 2". Cached on the item, so a second sort of the same items is free.

**`stuffItems` is memoised on `DATA`, admin, and which person you are** — the only three things any
mapper reads. That is also what makes the sort keys worth caching: rebuilding the items every call
was throwing that cache away at the rate it was filled.

| | before | after |
|---|---|---|
| first draw, cold | ~200 ms | **50 ms** |
| answering a question | ~200 ms | **15–28 ms** |
| a keystroke | ~40 ms | **5–9 ms** |

**And a dead reader that was not a bug, which is the part worth keeping.** The sort's second and
third terms read `qNumber` and `qPart`, and nothing has written either since the paper card was
deleted. I read that as Q1, Q10, Q11, Q12, Q2 down every paper — and went to measure it before
writing it down. It is not: `cmpText` carries `numeric: true`, so the LAST term, on the name,
already put Q2 before Q10. Identical order on both versions, 32 parts, checked both ways. **A dead
reader standing over a live one** — the same shape as `d = libraryInto_(…)`, where the broken line
came after the useful work and a correct fallback hid it. The fields are written again because the
key is built from them, not because anything was broken.

### One answer, one button — the spelling fault, fixed as a rule instead of a fourth time

**It has arrived in four columns and been repaired by hand in three.** `level` (`Alevel` / `A-level`
/ `A-Level`, fixed in `levelOf_`), `exam_wave` (`June 2018` against `First wave`, fixed in
`waveOf`), `topics` (46 of 389 values differing only by case, fixed by a vote in `topicOf_`), and
`company` — `1stclassmaths` on 1,372 rows against `1st class maths` on 109, invisible only because
the funnel lists questions and every question row used the first. **Each fix was to the instance and
none was to the rule**, which is this file's own sentence about `cost: 0` and `paper: true`.

**So it is two lines in the engine now.** An answer's IDENTITY is its letters and digits
(`spellKey_`); its SPELLING is whichever variant is most worth showing. `facetTally_` folds the
variants together *as it counts* — before, not after, because the coverage and the split that decide
whether a question is asked at all are read off those counts — and `filterHit` matches on the
identity rather than the text, so a chip saved as `1st Class Maths` finds a row that says
`1stclassmaths`. Measured: both spellings return the same 1,370 items.

**Which spelling wins, and every rule in it is about not inventing a word:**

| | |
|---|---|
| **the one a person would write** | most separators — `1st Class Maths` over `1stclassmaths`, `A-Level` over `Alevel`. A squashed spelling is a machine's; a spaced one was typed |
| **then the commonest, then the alphabet** | so a button's label never depends on the order the file is in |
| **first letter raised** | `estimation` outnumbers `Estimation`; a lower-case button in a capitalised column reads as a fault. Only the first letter — `HCF and LCM` stays as typed |

**The plain vote gets the first one wrong**, which is why it is first: `1stclassmaths` outnumbers
`1st class maths` twelve to one and is still not the publisher's name.

**It folds within the list on screen**, not against the whole library — `facetTally_` is already
walking exactly the items whose answers are about to be drawn. Narrowing cannot change which ITEMS
an answer holds; only which of its spellings is on the button.

**`check-funnel.js` test 2 can no longer fire and that is the point, not a loss.** It looks for two
values in one facet reducing to the same key, and `spellKey_` is that same reduction — the fault is
impossible now rather than detected. It is kept because it also guards the facets a spreadsheet
invents at runtime.

**`levelOf_` kept exactly one branch**: `AS level` → `AS`. That reduces to `aslevel` against `as` —
two identities, so no spelling rule can join them, and joining them is a fact about English exams.
**The engine folds spellings; a reader resolves meanings.** `waveOf` is on the same side of that line.

### Four things were wrong in the data, and one of them was a document read twice

**`company` was holding spec codes on 53 rows** — `9MA0-31`, `8700-01-01`, `7357-02-01`. Every one
also carries a real `exam_board`, so the code went to a new `spec_code` column and `company` became
the board. That column is not decoration: `8700` is AQA GCSE English Language, which is the next
thing going in.

**Five `W-CBM-` sets carried a 1st Class Maths attribution, and the id was the thing that was
wrong** — but that is not what they turned out to be. Five of the sixty-nine `W-CBM-` sets have a
`source_url`; the other sixty-four have none, and 81 of 82 `W-1CM-` sets have one. **The URL is the
1st Class Maths tell**, because that publisher's sheets are Drive files and Corbettmaths' are not.

**And for three of the five the URL was IDENTICAL to an existing set's** — the same Drive file id,
character for character. `W-CBM-reflections` (9 parts, terse) and `W-1CM-reflections` (15 parts,
carrying the sheet's own title) are one PDF read twice by two sessions at different granularity.
**I had compared the questions, found nothing in common, and reported "genuinely different
worksheets" — which was exactly backwards**: the questions differ *because* the two transcriptions
disagree about where a question ends. The fuller three are kept; the other three are deleted. The
remaining two had unique URLs and were simply mis-prefixed, so they are `W-1CM-` now, row ids and
all.

#### `check-library.js` — the document is the thing, and its URL is its identity

**The sitting key cannot see a worksheet.** It is built from subject, board, year, series, paper
number and tier, and a Corbettmaths sheet has none of those — which is how three duplicate
transcriptions sat in the library past every check in the suite.

**So two `paper_id`s pointing at one file is one document entered twice**, whatever either is called
and whatever the rows under them say. It needs no vocabulary, no id convention and no knowledge of
what an exam is, which is what makes it the test the sitting key should have been.

- **Compared on the Drive id, not the URL.** The same file is written `drive.google.com/file/d/<id>/view`
  *and* `drive.google.com/open?id=<id>&usp=drive_copy` on rows of the same set — two spellings of one
  address, the same fault in a third column.
- **Two papers with questions is a failure; a stub beside a transcription is a note.** 25 of the 28
  pairs are an empty `R0xxx` document row sitting beside the real transcription, which is the
  intended state. The count is printed.
- Proved by mutation: putting four rows of `W-1CM-reflections` back under the old id fires it.

### The lopsided rule was measuring the wrong denominator, and it is the `cost: 0` shape a third time

**`Key stage` scored 35.4% — five times the floor — and pressing its commonest answer left 1,314
items of 1,331.** Measured at a real state of the real funnel: Learning · Questions · Maths · GCSE ·
Worksheet. A tap that removes seventeen things out of thirteen hundred, offered as the next
question, looking healthy to the one rule written to stop exactly that.

**The cause is that `facetSplit_` was a share of the TALLY, not of the list.** The tally counts an
item once per answer — which is right, and is what makes the counts beside the answers true: a
worksheet tagged `KS3, KS4` really is in both. But it means the total is bigger than the list, so a
facet where nearly everything answers the commonest answer *and* something else scores well on a
share of a number that is not the list.

**So the question is asked of the list, which is what it was always about**: press the biggest
answer — what is left? For a single-valued facet at full coverage that is arithmetically the same
number as before, which is why nothing that was working changed. It differs exactly where the old
one was lying.

The greedy walk before and after says it plainly. Before: 2,344 → Type → 1,354 → **Key stage →
1,314** → Grade. After: 2,344 → Type → 1,331 → Grade → 419 → Topic → 45 → Paper → 11. Every step is
now a real narrowing.

**This is `cost: 0` and `paper: true` a third time**, and the sentence this file already carries is
the right one: both of those were fixed in the data and neither was fixed in the rule, so the shape
recurred. The rule is the fix.

### Reels was never broken. It had nothing to show, and two rules were missing

**Reported as "the widget has disappeared".** Measured in a browser before touching anything: the
column is in `TABS`, `go('reel')` works, there are no JS errors, and `screen('reel')` draws its
"Nothing here yet. Add a row to the **facts** tab" card. **A column that works and has nothing to
show is indistinguishable from one that does not work, and it is read as the second.**

**The move to a tab only half happened.** Fifty-eight facts live in `FEED_FACTS` in `chess.js` — a
subject, a headline, a paragraph and a photograph search term each. `screen('reel')` was rewritten
to read `DATA.facts` instead, which is the right change and the note in `shell.js` says why. The
backend sends that tab. **The tab has no rows in it**, and has had none since.

**`factsNow_` is the rule, and it is `libraryExtras_`'s rule pointed the other way.** That one says
*a file with no rows leaves the payload's copy alone*, so cutting over could never take a screen
dark. This says *a tab with no rows leaves the code's copy alone* — which is also the house rule
this file opens with: an empty or broken sheet must still produce a working site. The sheet wins the
moment it has a row, so nothing about the migration is undone; it just stops being a cliff.
Measured: 58 built-in, one row in the tab → 1 from the tab, tab emptied → 58 again.

**And the two surfaces were reading two sources.** The Reels column read `DATA.facts`; the "One more
thing" widget read `FEED_FACTS` directly. Filling the tab would have changed one of them. Both ask
`factsNow_` now — the same argument as `documents_()` and `paperIdOf_`: a second reader of one thing
is a second chance to disagree about it. `reelsWatch_` was a third, reading `DATA.facts` for the
photograph while the slides beside it were drawn from somewhere else.

#### And then every slide was zero pixels tall

**`.reels` asks for `height: 100%` and `.page` is `height: auto`.** Circular — the thing asking for
the height *is* the content — so the container resolved to 0 and so did all 58 slides. The markup
was all there, the text was in the DOM, and every box measured 0px.

**It had never been rendered, which is why nobody had seen it.** The `facts` tab has always been
empty, so the screen has always returned the "Nothing here yet" card instead — an ordinary `.pane`
that sizes itself perfectly well. **The slide rules were written, committed, and never once put on a
screen.** Filling the column is what exposed them, and it took measuring the boxes in a browser:
`.page.reel-page { height: 100% }`, one class on the one page that wants it, because `.screen` is
`position: absolute; inset: 0` and so has a height for a percentage to resolve against.

**This is the same shape as the check that could not reach its subject**, one layer down: CSS that
cannot be wrong until something renders it.

#### And its observer had never run, because one timer was holding three jobs

**`afterSlide_` kept one `setTimeout` and cleared it on every call.** That is exactly right for one
caller asked twice — a run of quick swipes should fill the pages once, at the end — and silently
wrong the moment two DIFFERENT jobs are booked for the same slide.

**`paint()` books two, four lines apart**: `reelsWatch_`, and then `startScreen_(AT)`. The second
always won. **So the reel column's observer has never once run** — no slide has ever asked Commons
for its photograph, and every reel anybody has ever seen has been the bare gradient that
`.feed-art`'s own comment calls "the floor, not a placeholder". Nothing threw, nothing was missing,
the screen worked, and it quietly did half of what it was written to do.

**Found by counting the observers in a browser, which is the only way it could have been found.**
Both lines are correct; the fault is in the thing they meet in. `REEL_IO_ART` came back `false` and
`.reel.is-watched` came back 0 on a screen with four slides on it.

**Coalesced per job now, not across jobs.** The key is the function itself where the caller passes a
named one, and a word where it passes an arrow — a fresh arrow is a different key every call, so
keying on identity alone would queue one `startScreen_` per swipe and undo the coalescing the timer
was built for. Last booking of a key wins; every key runs, each in its own `try`. Proved in both
directions on the reel column: 0 observers before, 4 after, and 28 journeys plus 100 UI combinations
unchanged.

### A reel is a video, and the column was drawing the widget's card in its own words

**Asked for as "the reels will look like the other widgets. most like the one more thing widget. but
infinite going down."** Three things, and each one was a different fault.

**`.reel .over` WAS A SECOND DESCRIPTION OF `.feed-art`.** The same object — a subject, a heading, a
paragraph and a credit over a picture — written twice in one stylesheet and twice in two files, with
its own gradient, its own scrim and its own type sizes. `factsNow_` had already settled where a fact
COMES from and the two surfaces still did not look alike, because nothing had settled how one is
DRAWN. `feedSlide` is the one renderer now and `.reels` keeps only the column: how a stack of slides
scrolls and snaps, which is the half the widget genuinely does not have.

**IT DREW ALL FIFTY-EIGHT AND STOPPED.** Fifty-eight is a lot of slides and it is still a bottom —
and it was fifty-eight boxes and fifty-eight observed elements on the first paint of a screen showing
one of them. **`feedItem(n)` has never had an end**: the "One more thing" widget has walked it
forwards since it was written, because `feedShuffle` deals another pass whenever the deck runs out,
seeded by the day and by how many passes have gone before. The infinite column is that function read
one index at a time — four slides on open, four more when the last is two away. Nothing new decides
what comes next. Measured: 4 on open, 28 after six flicks to the bottom, no sideways scroll at 320.

**`clip` is a fifth field, not a second tab.** A reel with one plays it; a reel without one keeps the
photograph `pic` finds. Two tabs would be two schemas, two reads, two mappings and two empty states
describing one object — the `needs_print` / `print_required` lesson, which cost 356 rows of
disagreement. **A row with a clip needs no heading**: `factsNow_` kept a row only if it had one,
which is right for a fact and wrong for a video, and is the same argument as the chessboard that was
made to stop drawing its own title.

**TWO ADDRESSES FOR ONE DRIVE FILE AND THEY ARE NOT INTERCHANGEABLE.** `uc?export=download` answers
with the BYTES, which is the only form a `<video>` can mute, autoplay, loop and pause; `/preview`
answers with an HTML PLAYER, which can only be an iframe with Google's own chrome and a play button.
The first is the one worth having and it is also the undocumented one — and **every Google host is
blocked from this environment by network policy**, so which of the two a real browser gets is a fact
one open of the live site settles and nothing here can. That is exactly why there are two: `error`
on the `<video>` swaps in the iframe. Proved by answering the Drive request with a 404 — the iframe
arrives and the sound button, which cannot reach inside one, is removed with it.

**And the video was painted black, which a screenshot caught.** An opaque element over `.feed-art`
covers the gradient, so a clip that has not loaded is a black rectangle where every other slide is a
finished thing — the exact fault the gradient exists to prevent, one rule along. It is transparent,
and `has-photo` (the scrim, the white words, the vanished initial) arrives on `loadeddata` rather
than on the first paint, which is the same moment and the same reason the photograph branch adds it.
Measured in four states: waiting, loaded, errored, and sound on and off again.

**`.reel-sound` was a gold bar across the top of the slide**, because `.btn` is `width: 100%` — right
in a form, wrong absolutely positioned. `.btn-row .btn` already says the same thing for the same
reason. 44px, in px, which is this file's fifth conviction of that rule.

#### And then the facts came off it, because a reel is a video

**Reported from a screenshot of the column: "no more factoids on this yh? its just the videos".**
It opened on a green gradient reading *"Notre-Dame took nearly 200 years"* — a perfectly good fact,
and not a reel. The clips were pinned in front of the deck and the deck was still underneath them.

**One list, two surfaces, and they want different halves of it.** So it is a filter here rather than
a second source: `factsNow_` still answers both, the sheet still wins over the code, and a clip row
is still just a row with a `clip` in it. The "One more thing" widget goes on dealing the whole deck,
which is where the facts belong — they are a thing you tap for, not a thing you scroll past.
Splitting the data instead would be two tabs, two empty states and two things to keep in step.

**A column with no clips says so rather than filling itself with facts.** Showing the next best
thing is exactly how this screen came to be showing the wrong thing.

**"For ever" is a LAP now, and with two clips that is plainly a repeat.** Saying so beats a column
that stops dead two flicks in and reads as broken; it stops being a repeat the moment there is a
third clip, with nothing here to change. **And it is bounded**, because a video is not a div: every
watched slide holds a decoded `<video>` with a `src`, so an unbounded append is a megabyte a flick
with nothing released. `REEL_MAX = 60` is a stated ceiling — thirty laps of two — rather than a leak
nobody measures until a phone gets hot. Measured: every slide a clip, the two ids alternating, 6 on
open and 60 at the cap after forty flicks.

**And the photograph fetch went with the facts.** It asked Commons for a picture off the slide's
`pic`, one screen ahead — right while a slide could be a fact, and dead the moment `reelItem_`
cannot return one without a clip. A reader left standing over a permanently false condition is the
shape this file records under `resource_type` in `VOCAB` and under `libraryInto_`'s dead
`kind === 'paper'` guard. `feedPicture` is untouched and still draws the widget.

##### "No clips yet" was two different answers wearing one sentence

**Reported with a screenshot of that card**, and I could not tell from it which of two things had
happened — so the first fix was to the SCREEN rather than to the cause. A column that has looked at
fifty-eight reel rows and found a clip on none of them is a data problem. A column that has looked
at **nothing** is a code problem: `chess.js` holds the built-in list, and a browser serving a copy
of it from before clips existed reports exactly the same empty card. The count is the only thing
that can say which, and it is this repository's oldest fault for the fifth time — *I did not manage
to look*, printed as *I looked and there was nothing there*.

**Measured against the real Settings spreadsheet while looking for the cause: there is no `facts`
tab at all.** `fact_id` appears nowhere in it and neither does `clip`; every hit on the word "facts"
is inside a campaign's `blocks` column. So the sheet is not the explanation, and that is worth
writing down because this file has said "the tab is empty" for a while when the truth is that
`?setup=1` has never created it.

**And the hunt found a real trap underneath.** `factsNow_` is all-or-nothing — the tab has rows, so
the tab is the answer — which was right while both surfaces wanted the same list. The Reels column
wants only the clips, so **one ordinary fact typed into the sheet would have hidden every built-in
clip** and taken the column dark. The house rule is per LIST: `clipsNow_` asks the sheet for rows
with a clip and falls through to the code's when it has none, exactly as `factsNow_` does for facts.

**`reelItem_` was a SECOND reader of "which clips" and the mutant is what caught it.** It still
filtered `factsNow_` while the screen asked `clipsNow_`, and the two disagree precisely in the case
being fixed: one typed fact gave `{slides: 0}` under a card reading just "Reels" — heading,
scroller, no slides, no empty state either. A second reader of one thing is a second chance to
disagree about it, which is what this file says about `documents_()`, `paperIdOf_` and `factsNow_`
itself. **Proved on four payloads**: the real files (6 slides), the built-in clips stripped ("Looked
at 60 reel rows and none of them has a clip"), the list emptied ("no reel rows at all"), and one
sheet fact beside the code's clips (6 slides, where it was 0 before).

### AQA Physics 8463/1H is transcribed, and the first wide table in the library broke a rule

**43 questions, every answer read off AQA's own 8463/1H scheme.** The 2017 Highers are why that is
the rule and not a preference, and `tools/insert-aqa-physics-8463-1H.py` asserts **both** totals
before it writes a row: the cover's 100, and the ten boxes down the margin — 10, 10, 9, 10, 13, 9,
8, 8, 11, 12. A dropped part or a misread mark count fails in the script rather than shipping.

**Three answers are PICTURES and were rendered rather than remembered.** 03.2 asks which of four
graphs shows resistance against length; 05.4 and 10.2 ask you to draw a thermistor and a fuse. All
three print a drawing in the scheme and nothing in the text layer, so all three were rendered at
scale and looked at — *a screenshot is the last word on a drawing*, for the sixth time. 03.2 is a
straight line from the origin, which is also what R = ρL/A says, and the answer is written as that
sentence rather than as a box letter nothing here can see.

**What a figure carries is said, and attributed, and never written into the question.** Eight parts
hang off artwork: a circuit, a fission diagram, three photographs, three graphs a value is read off.
Each carries `figure` so `check-library.js` counts it, and where the SCHEME states the number the
figure would have given — 80 Ω at 20 °C, about 3 cm of air, 7.1 × 10²⁰ Bq — it is in
`examiner_note` saying it came from the scheme. The alternative is a question that reads as though
the paper printed a number nobody transcribed, which is the fault this file records under the
scatter graph and under the curve read by eye.

#### `check/cards.js` caught my own table, and then it caught the check

**Table 1 went 26px past a 320px column.** Four columns — method, energy stored per 100 kg,
percentage wasted, installation — and every table in the library before it had three or fewer, so
the rule had never met one that cannot shrink. Caught on the commit that added it, which is the
whole argument for laying out all four thousand rows rather than sampling.

**The house rule says which way it goes**: the page body never scrolls sideways and *"only wide
tables, code and diagrams may run past it — each gets `overflow-x: auto` on its own container"*.
Squeezing the columns instead would have been `.mat-face` again — the label that cannot shrink is
the one that breaks, and "Percentage of stored energy wasted" is four words that have to stay.
`display: block` is what makes it possible at all: a `table` box ignores `overflow` because it is
not a block container.

**And then the check went on reporting it**, because the overflow had moved from the card to the box
now holding it deliberately. **CLAUDE.md already states the question this check is asking** — *"does
this box scroll sideways when it was NOT told it could"* — and the code was asking the other one. It
skips an element whose computed `overflow-x` is `auto` or `scroll` and **does not skip its
ancestors**, which is the half that keeps it honest: a scroller cannot hide a card that is genuinely
too wide, because the card is measured on its own pass. **Proved by mutation**: put the table back
to `visible` and it fires on `.qsheet` at the same 26px.

#### And the headline sentence had gone stale, which the transcription is what exposed

**"61 Edexcel GCSE maths papers checked at 80 marks"** — `marks.size` is every paper summed against
a declared total, whoever set it, and the whole point of `total_marks` was to stop that rule knowing
about one board. It stayed readable while the only papers with a total WERE Edexcel maths at 80; the
first AQA paper summed against its own 100 made it plainly false. Fourth time this file records the
shape, after "all 18 checks pass", "one of the eighteen names", and the prose over `CARD_W` naming
88% and 4% while the code said 80 and 8. It says what the number is now.

### Eighteen science papers, named off their covers rather than their filenames

**`newbatch` holds eighteen June 2024 science papers and not one filename says which subject it
is.** AQA names every subject's download `Question paper (Higher)_ Paper 1 - June 2024.pdf`, so
Drive had disambiguated them into `(1)`, `(2)`, `(3)` — an ordering that means nothing. Every one
was identified by reading the front cover, which is the rule this file already records for the
Edexcel codes: **check the metadata and the cover before reading a single page.**

| | June 2024, all with mark schemes beside them |
|---|---|
| **AQA Biology 8461** | Foundation Papers 1 and 2 |
| **AQA Chemistry 8462** | Foundation Papers 1 and 2, Higher Papers 1 and 2 |
| **AQA Physics 8463** | Foundation Papers 1 and 2, Higher Papers 1 and 2 |
| **Edexcel Combined Science 1SC0** | Higher Papers 1–6 — **no mark schemes** |

**And the file named `Insert (Foundation)_ Paper 1` is not an insert.** It is AQA's **Physics
Equations Sheet**, stamped "FOR USE IN JUNE 2024 ONLY". Read as the filename says it, an AQA insert
means English Language — and this library already holds two English papers whose source is a
`placeholder` row waiting to be replaced. Opening it is the only thing that stopped a formula sheet
being filed as a reading source.

**The Edexcel slug is a publication date, and this is the second proof.** Every one of the six
carries a full date in its filename and **every one is a day after the date on its own cover** —
`1sc0-1bh-que-20240511.pdf` over *Friday 10 May 2024*. One is worse: `1sc0-1ph-que-20240822.pdf`
over *Wednesday 22 May 2024*, three months out. This file already refuses to bulk-fill `exam_date`
from that slug on the evidence of eight Saturdays; six papers with a consistent +1 offset and one
with a wrong month is the same finding from a different board.

**`paper` goes to 6, and the cap was never a rule about exams.** 1SC0 is six papers — biology,
chemistry and physics, each sat twice — and its own covers read "Combined Science PAPER 4" over the
code `1SC0/2BH`. A vocabulary of `1, 2, 3` was the shape of the one qualification somebody had in
front of them, which is the sentence this file writes about `isEdexcelGcseMaths`. `Equation booklet`
is a seventh `needs` for the same reason `Periodic table` was a sixth: four 8463 covers and two
1SC0 covers hand the student a sheet of formulae, and what is on the table beside them is what this
column is for.

#### The transcription queue was in neither count

**`marks` is keyed off QUESTION rows**, so a document row carrying `total_marks` with nothing under
it yet is in neither of the two numbers this check prints: not "checked against a total", because
there is nothing to sum, and not "no total to check against", because it has one. **Sixteen science
stubs went in across two sittings and both numbers stayed exactly where they were** — 60 and 186,
before and after.

**That is a count doing its job and hiding something at the same time**, which is the shape recorded
here twice already: `papers checked against a total` going 34 → 2 under a green tick, and a
substring calling five practicals required. So the third number is printed, and **it is 87** — the
sixteen sciences plus seventy-one maths papers that have been identified, given a total, and never
transcribed. Nobody had ever counted them. A stub with a total is not a fault and it is not nothing:
it is the queue, already carrying the one number that will refuse a wrong transcription the moment
anybody starts typing one.

**Ten lines and a remainder**, because eighty-seven on every run is a list nobody reads. That is
`ACCEPTED_TAP`'s argument pointed the other way: that one prints in full because it must not grow,
and this one is meant to.

### AQA Chemistry, as two document rows and nothing else yet

**What was added to Drive as "higher 2024 bio" is AQA GCSE CHEMISTRY 8462**, Higher, Papers 1 and 2,
June 2024, question papers and mark schemes — read off the front cover of each rather than the
filename, which is AQA's own generic `Question paper (Higher)_ Paper 1 - June 2024.pdf` and names no
subject at all. Paper 1 is uploaded twice, byte for byte, under `(1)` and `(2)`.

**The paper row is the part that can be right before anything is transcribed**, and it is the part
that decides where every question under it lands: board, spec code, tier, paper number, the month,
the exam date off the cover, and the total the cover states. **100 marks each**, so
`check-library.js` will refuse a transcription that does not sum to it — the one end-to-end check the
library has, in place before there is anything to check.

**`Periodic table` is a seventh `needs`.** The chemistry cover lists it beside the ruler and the
calculator, in the same sentence, as a thing you must have — and like the calculator it is a fact
about the PAPER, so it sits on the document row and covers every question inside.

### `node js/check-funnel.js` — the funnel, run over the real library

The three faults above have one shape: **each looked fine in the code and only showed up in the
arithmetic over real data.** So this check does what `whyThisQuestion()` does in the console — builds
the real items, interrogates the real facets — and fails on four things:

1. **a question that cannot narrow** — offered, not marked `always`, minority under 2%
2. **one answer wearing two coats** — two values in one facet that normalise to the same word
3. **a facet fed by a literal** — the general form of `paper: true`: a reader whose answer never
   moves across thousands of items is reporting a constant, not reading a column. Reported, not
   failed, because an absent field looks the same from here
4. **a second spelling of a sitting** — any `examWave` answer that is not `<Month> <year>`

**It uses `data/questions.json`, not the fixture**, on purpose: the fixture has four question rows
and every fault above needs thousands to become visible. The fixture still supplies everything that
is not the library, which is why a *thin* facet is never a failure here — only a lopsided or
incoherent one.

**Proved in both directions on three mutants**, because a check that cannot fail is not a check: a
facet returning a constant (fires at 0.45%, the exact `paper` reproduction), a facet offering
`Alevel` beside `A-Level`, and `waveOf` with the phase-word branch switched off (fires naming
`"First wave", "Second wave"`). All three exit 1; the real file exits 0. **The first attempt at the
second mutant was inert and passing it proved nothing** — after the merge the `level` facet
genuinely cannot emit both spellings, because the band wins on every row that has one. A mutation
that does not change behaviour is not a test, and the only way to know is to watch it fail.

**Two cross-facet overlaps are reported and left alone**: `A-Level` answers both `Level` (263) and
`Tier` (135), and `Edexcel` answers both `Exam board` (2,283) and `Company` (873). Both are arguably
true twice — a board and a publisher are different facts that share a name — so they are a note
rather than a failure. It is still how "which one did I answer?" starts.

### What the audit found healthy, which is the other half of trusting it

Measured, not assumed: **stem attachment works** — 29 parts across two papers correctly carry the
shared preamble they cannot be answered without. **Search is not the bottleneck** — 31–125 ms across
3,753 items, built once onto the item rather than per keystroke. **And the search does not leak mark
schemes**: three apparent hits in a 200-row sample were all coincidence, where the question is
*about* a regular hexagon so the words recur in both. `text:` is deliberately built from the stem,
the lead and the part and never the answer, and that holds.

**The one thing this cannot measure is everything that is not the library.** The fixture has one
tutor and one venue, so `What for` reading 99.5% here is partly an artefact of it, and only
`check/live.js` against the real spreadsheets could settle it — every Google host is blocked from
the agent's environment by network policy. That is exactly why `always` is a declared flag rather
than a threshold tuned to numbers I cannot see.

---

Continued in [part 4 of 4](031-checking-your-work-4.md).
