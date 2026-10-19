# js/check-funnel.js

The full text of comments in `js/check-funnel.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-funnel.js THE FUNNEL, RUN AGAINST THE REAL LIBRARY, ASKED WHETHER ITS QUESTIONS ARE WORTH ASKING.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-funnel.js

   THE FUNNEL, RUN AGAINST THE REAL LIBRARY, ASKED WHETHER ITS QUESTIONS ARE WORTH ASKING.

   WHY THIS EXISTS. `check-flow` proves the app boots and can be pressed. `check-library` proves the
   data file is well formed. Neither can see the fault that actually makes the Find screen feel
   arbitrary, because it is not a crash and not a malformed row — it is a QUESTION THAT DOES NOT
   NARROW ANYTHING, sitting in the funnel looking exactly like a question that does.

   THREE OF THEM HAD ACCUMULATED, AND ALL THREE PASSED TWENTY-TWO GREEN CHECKS:

     `paper` / "Printed?"   `questionItems` wrote `paper: true` on every item and this facet was the
                            only reader. 3,753 answered Printed, 17 answered Digital, and the 17
                            were widgets with no such field. A literal, drawn as a choice.
     `exam_wave`            three spellings of one sitting — "June 2018" from the old import,
                            "First wave"/"Second wave" from the transcriptions. For 2018 the funnel
                            offered both, as separate answers, hiding 151 questions behind whichever
                            one you did not pick.
     `level` vs `stage`     two columns, one meaning, two facets, two different answer sets. Picking
                            A-Level gave you 135 items or 263 depending which question you were
                            asked first.

   THE COMMON SHAPE is that each looked fine in the code and only showed up in the ARITHMETIC over
   real data. So this check does what `whyThisQuestion()` does in the console — builds the real
   items and interrogates the real facets — and fails on the four things that can go wrong.

     node js/check-funnel.js

   IT USES THE REAL `data/questions.json`, not the fixture, on purpose: the fixture has four
   question rows and every fault above needs thousands of rows to become visible. The fixture still
   supplies everything that is not the library, so the non-library facets are measured thin here —
   which is why a thin facet is never a failure below, only a lopsided or incoherent one.
================================================================================================== */
```

### ---------- AND THE REAL PRACTICALS, WHICH THIS HARNESS HAD NEVER LOADED

in `w.fetch`

```
/* ---------- AND THE REAL PRACTICALS, WHICH THIS HARNESS HAD NEVER LOADED --------------------
       EVERY OTHER URL FELL THROUGH TO THE FIXTURE, so `data/practicals.json` came back as the
       payload object rather than an array and the practical mapper built nothing. That made this
       file blind to a whole kind: the count below reported `question`, `venue` and `tutor` and did
       not mention the 57 practicals at all, which is exactly the fault it was written to catch.

       A CHECK THAT CANNOT FAIL IS NOT A CHECK, and this one could not have, on the one kind that
       prompted it. Found by reading its own output rather than by trusting that it ran. */
```

### ---------- AND EVERY OTHER `data/` FILE, WHICH IS THE SAME FAULT TWICE MORE

in `w.fetch`

```
/* ---------- AND EVERY OTHER `data/` FILE, WHICH IS THE SAME FAULT TWICE MORE -----------------
       THE PRACTICALS FIX WAS WRITTEN AS ONE LINE FOR ONE FILE and the sentence above says what the
       shape is: every other url fell through to the fixture. Two more files fall through it, and
       both decide what this check measures.

       `data/topics.json` WAS THE TOPIC TREE. `topicAreaOf_` was its only reader, so with the
       fixture in its place `DATA.topicTree` was empty, `Topic area` resolved to NOTHING on all
       5,119 items, and a declared question with 13 answers and 84% coverage was invisible to every
       rule below. Measured both ways: 0 distinct topic areas with the fixture, 13 with the file.
       (The question, its reader and the app's fetch of that file are retired since — see `THE TOPIC
       TREE WAS READ HERE` in find.js — and the rule below stands for the next file.)

       `data/settings/facets.json` IS THE FUNNEL'S OWN ORDER AND LABELS, and this is the half that
       matters most: **this check has never once measured the funnel the app draws.** The sheet
       relabels `Sitting` back to `Exam wave`, relabels `Company` to `Paper code` over answers that
       are publishers, switches `Year` off, and carries four rows naming fields that were renamed or
       deleted — so it invents `Question number` and `Question part` off the row, and `Type` and
       `Level` lose the positions it means to give them. None of that was visible here.

       SO THE RULE IS THE SHAPE RATHER THAN A THIRD LINE: any `data/**.json` the app asks for is
       served from disk, and the fixture answers only what is not a file. A file added tomorrow is
       loaded tomorrow with nothing here to remember — which is what the one-line-per-file version
       could not promise, and is why it needed fixing three times. */
```

### A THUNK, NOT THE OBJECT.

in `boot`

```
/* A THUNK, NOT THE OBJECT. `load()` ends with `DATA = d` — it REPLACES the payload — so a
         reference captured at eval time is the one from before the settings files landed, and the
         sheet reads as nought rows. Same trap `facetList`'s own memo is keyed against. */
```

### A value the funnel would draw on a button, reduced to the thing a person would say it is.

top level, before `norm_`

```
/* A value the funnel would draw on a button, reduced to the thing a person would say it is. Two
   answers that differ only by a hyphen, a space or a capital are ONE answer wearing two coats, and
   that is the `Alevel` / `A-Level` fault. */
```

### ---------- 0. WHAT THE FIND SCREEN HOLDS IS WHAT THE OWNER SAID IT HOLDS

top level, before `GONE`

```
/* ---------- 0. WHAT THE FIND SCREEN HOLDS IS WHAT THE OWNER SAID IT HOLDS ------------------------
     ASKED FOR AS *"Get rid of booking places ... So finder now will become just learning stuff"* and
     *"Get rid of links that's almost redundant now."* Neither is a question about a number, so the
     rules below could not see either: 127 links and 13 venues answered every facet perfectly well.
     Measured before the change, over the real files, Find's first question read `Booking, Places |
     Learning | Links | Shop`.

     ON THE REAL FILES, WHICH IS WHY IT IS HERE. This harness serves every `data/**.json` the app
     asks for from disk, so a fetch of `data/settings/links.json` that came back would put the 127
     links straight into `items` — the half `check-flow.js`'s inline payload cannot see. And the
     fixture's venue is a production-shaped row now that the fixture sends `kinds: []`.

     A KIND AND A DOOR, NOT A WHITELIST OF DOORS. `Shop` is still a door until its column exists
     (see `shop` in KINDS), and Friends and Paperwork appear for the people they belong to; a list of
     allowed answers would be wrong the day any of those moves. What is refused is what the owner
     named, and a door that is two groups joined by a comma — one chip, which is how `Booking,
     Places` was drawn. */
```

### AND EVERYTHING ELSE.

top level, before `notFor`

```
/* AND EVERYTHING ELSE. *"Return to that origional finder having everything and now there is just an
     identical second finder"* — the owner, 12 Oct (docs/history/347), taking back the 10 Oct split that
     moved the resources to a second column (329). So Find holds every kind the whole list holds except
     what the funnel was never for (`FUNNEL_NOT_FOR`: Booking and Shop) — the content cards (the textbooks'
     chapters since 347 part 2), the boxers and the fights among them — and Find 2 holds the same list (the pass at the end). */
```

### ---------- 1. A QUESTION EVERYBODY ANSWERS THE SAME WAY

top level, before `split`

```
/* ---------- 1. A QUESTION EVERYBODY ANSWERS THE SAME WAY --------------------------------------
       The `paper` fault. Marked `always` means it is a door rather than a filter — see FACETS —
       and doors are allowed to be lopsided.

       `facetSplit_` IS NOW A SHARE OF THE LIST, not of the tally, and that repair was found by this
       check's own subject rather than by this check. `Key stage` scored 35.4% at a real state of the
       real funnel — five times the floor — and pressing its commonest answer left 1,314 items of
       1,331, because a multi-valued facet counts one item against several answers and the old
       denominator was that count rather than the list. Nothing here changed; the number it reads
       stopped lying. */
```

### ---------- 3. A FACET FED BY A LITERAL

top level, before `SERIES_WORDS`

```
/* ---------- 3. A FACET FED BY A LITERAL -------------------------------------------------------
       THE GENERAL FORM OF THE `paper: true` FAULT, and the one worth having. A facet whose reader
       returns the same value for every single item is not reading anything — it is reporting a
       constant somebody wrote in code. It cannot be caught by looking at the facet, only by running
       it over real items and noticing that the answer never moves. Skipped where nothing answers at
       all, which is an absent field rather than a hardcoded one. */
```

### ---------- 4. THE SITTING HAS ONE VOCABULARY

top level, before `SERIES_WORDS`

```
/* ---------- 4. THE SITTING HAS ONE VOCABULARY -------------------------------------------------
     `waveOf` collapses dates, month-names and phase words onto one set of buttons. If a new spelling
     ever reaches the funnel it shows up here as an answer that is not `<series word> <year>`, which
     is what "First wave" was doing for 850 rows while every other check passed.

     THE LIST IS CLOSED RATHER THAN A SHAPE, and that is a repair. The rule used to be the regex
     `^[A-Z][a-z]+ (19|20)\d{2}$` — any capitalised word and a year — so when `seriesOf_` was
     renamed from "June 2017" to "Summer 2017" this check went on passing without noticing that the
     funnel's entire sitting vocabulary had changed underneath it. A shape cannot tell a series word
     from a typo that happens to be capitalised; a list can. Same argument as `VOCAB` in
     check-library.js, and the same one that let `resource_type` sit in it after the rename. */
```

### ---------- THE SITTING IS TWO QUESTIONS NOW, SO THE RULE IS THREE

top level, before `smonth`

```
/* ---------- THE SITTING IS TWO QUESTIONS NOW, SO THE RULE IS THREE ------------------------------
     REPORTED AS "some tags are like summer 2018 when it should just be summer then 2018", and
     `examWave` was split into `examSeries` and `examYear` over one reader, `sittingOf_`. THEN THE
     SEASON WENT: "I don't want it to ask summer or autumn I'd rather it just do the months. Like may
     or November" -- so it is `examYear` and then `examMonth`, the year first, as the outer folder.
     The closed vocabulary is asked of each at the place it can go wrong:

       `waveOf`       over the items, every answer `<series> <year>` -- the source the year is cut
                      from, and where `First wave` sat on 850 rows. Read off the reader rather than
                      off a facet, so a bucket can never be mistaken for a spelling. It still says
                      `Summer 2017`, because that is the bundle's TITLE word; it is no longer asked.
       `examMonth`    a month name and nothing else. `Summer` here is the season the owner asked to
                      be rid of, back as an answer.
       `examYear`     a four-digit year and nothing else, through `facetOwn_` (the column) and not
                      through the drawn answers, which are year PAIRS by design.

     AND THE OLD FACETS MUST BE OFF THE FUNNEL. A row naming `examWave` would put `Summer 2018` back
     beside them, and one naming `examSeries` would put `Summer` beside `May` and `June`. */
```

### THE CARD AND THE FOLDER SAY THE SAME MONTH.

top level, before `id`

```
/* THE CARD AND THE FOLDER SAY THE SAME MONTH. The card's sitting tag is cut from the paper's
           name; the Month answer once read the date column first, and ten AQA papers said `June 2024`
           on the card and sat in the `May` folder. */
```

### ---------- AND THE CARD SAYS THEM AS TWO TAGS, THE WAY THE FOLDERS ASK THEM

top level, before `id`

```
/* ---------- AND THE CARD SAYS THEM AS TWO TAGS, THE WAY THE FOLDERS ASK THEM --------------
           REPORTED AS *"Fix this why it say June and year in same chip"*: the sitting was ONE pill,
           `June 2024`, under a funnel that asks Year and then Month. So the card's tags are read
           here as the two folders read them -- a year tag that is the Year answer, a month tag that
           is the Month answer -- and no tag of any colour may carry a month word and a year at once.
           THE OLD READ WAS A REGEX FOR THE FUSED PILL, and with the pill split it would match nothing
           and pass silently: the clash rule would have gone on printing green over cards it no
           longer read. So the split is asserted, not assumed: a dated card with no month tag is a
           failure of its own. */
```

### A PAPER WITH A YEAR AND NO MONTH IS IN THE YEAR FOLDER AND IN NO MONTH FOLDER INSIDE IT, so the Month question would hide it behind whichever month somebody

top level, before `MATHS_PAST`

```
/* A PAPER WITH A YEAR AND NO MONTH IS IN THE YEAR FOLDER AND IN NO MONTH FOLDER INSIDE IT, so the
       Month question would hide it behind whichever month somebody tapped. Every paper here prints
       its month on its cover, so the count should be nought -- and a count is printed either way. */
```

### ---------- 4a. YEAR, MONTH, PAPER -- ASKED LIKE FOLDERS, EVEN WITH ONE INSIDE

top level, before `MATHS_PAST`

```
/* ---------- 4a. YEAR, MONTH, PAPER -- ASKED LIKE FOLDERS, EVEN WITH ONE INSIDE ---------------------
     ASKED FOR AS *"I want it to ask for the year even if there's only one year's worth of the paper
     ... Like when I'm in my gdrive folder finding the stuff it felt simple and I would have to select
     the year of the folder even if there was only one option."* Every other question is skipped
     with one answer, and the rule that skips them is right for them -- so this one walks the real
     funnel, through `nextFacet`, to the places where a folder holds exactly one thing, and requires
     the folder to be asked anyway. Found, not named: a level whose maths past papers are one year,
     and a month that holds one paper, so a library that grows a second KS1 year moves the walk to
     whatever is single then. And if nothing in the library is single, that is said, not passed. */
```

### ---------- 4b. TWO ANSWERS, ONE LABEL

top level, before `seen`

```
/* ---------- 4b. TWO ANSWERS, ONE LABEL --------------------------------------------------------
     `shortLabels_` DRAWS THE SHORTEST FORM OF A NAME THAT IS STILL UNIQUE — `Paper 1` rather than
     `Paper 1 (Non-Calculator) — May 2017` once the funnel has already asked which sitting. It
     chooses that rung by testing uniqueness itself, so this cannot fire on the code's own facets,
     and it is here for the same reason test 2 is kept: a `facets` row can invent a question at
     runtime over any column, and every one of those goes through the same shortening.

     THE COST OF BEING WRONG IS THE WHOLE POINT. Two papers on one button is not a cosmetic fault —
     the row's `data-value` is the FULL name, so two rows reading `Paper 1` would send you to
     whichever one you happened to press with nothing on screen saying the other existed. That is
     the `Alevel` / `A-Level` fault with the spelling hidden instead of shown. */
```

### ---------- 4c. AN ANSWER MUST RETURN WHAT ITS OWN ROW PROMISED

top level, before `promises`

```
/* ---------- 4c. AN ANSWER MUST RETURN WHAT ITS OWN ROW PROMISED -------------------------------
     THE ONE INVARIANT THAT TIES THE DRAWER TO THE FILTER, and the only rule here that would have
     caught any of the last three faults on its own.

     EVERY ANSWER ROW IS A PROMISE. `facetValues` says "Paper 1, 31 questions" and draws a row; the
     chip that row creates goes through `filterHit`, which matches a completely different way — on
     `spellKey_`, or on numeric membership for a band. **Nothing had ever checked that the two agree**,
     and three separate mechanisms now sit between them:

       `spellShow_`    the chip holds the spelling that was drawn, the row holds whatever the sheet
                       says — `1st Class Maths` against `1stclassmaths`
       `shortLabels_`  the row's TEXT is shortened and its `data-value` is not
       `bucketValues_` the answer is `11–20`, `Heavyweight` or `C–F`, and no row anywhere holds
                       that string — it is a GROUP, matched by membership

     EACH ONE IS A CHANCE FOR A CHIP TO FIND NOTHING, silently — the list empties, the screen says
     "Nothing matches", and no error is thrown anywhere. Proved on the last of them: removing the
     band branch from `filterHit` makes pressing `11–20` return **0 questions where the row
     promised 15**, and every other check in this suite still passed.

     AND IT CAUGHT THE GROUPING'S OWN FIRST VERSION. `bucketValues_` summed the answer counts into
     each bucket, and `facetTally_` counts an item once per ANSWER — so a question tagged `Loci`
     and `Nets`, both inside `L–O`, was counted twice there: the row promised 723 and pressing it
     returned 646. The recount goes over the items through `bucketHas_` now.

     CHECKED AT TWO STATES, because a bug here is about a value, not about a state: the whole
     library, and one paper deep, where the bands and the short labels actually appear. */
```

### ---------- PRESSED THE WAY THE APP PRESSES IT, WHICH NOW INCLUDES `bucket`

in `promises`

```
/* ---------- PRESSED THE WAY THE APP PRESSES IT, WHICH NOW INCLUDES `bucket` ------------
           `facet-pick` READS `data-bucket` OFF THE ROW and puts it on the chip, because `filterHit`
           has to test membership for a bucket and equality for a leaf. A harness that presses
           without it is pressing something the app never sends: this reported `1-10` returning 0
           of a promised 14 the moment `bucketValues_` landed, which is the harness being wrong
           about the press rather than the app being wrong about the answer. The flag is carried
           from the value that drew the row, so the two cannot disagree. */
```

### ---------- 4d. AND AN ANSWER INSIDE A BUCKET, PRESSED THROUGH THE WHOLE CHAIN

top level, before `chained`

```
/* ---------- 4d. AND AN ANSWER INSIDE A BUCKET, PRESSED THROUGH THE WHOLE CHAIN -------------------
     4c PRESSES EACH ANSWER ON ITS OWN, over the list it was drawn from, and that is blind to the one
     thing a SECOND chip on a field does: `stuffNarrow_` stands the bucket down once the answer inside
     it arrives, so the inner answer is then tested against everything the earlier chips kept, not
     against the ten it was opened inside. FOUND WALKING ONE WORKSHEET: `1–10` opened onto `1`,
     `2–3`, ..., the `1` row promised 2 and pressing it showed 11 -- 1 and 10 to 19, because the
     inner rows were cut by the alphabet and read back as a prefix. 4c passed, because inside the
     ten, `1` really does hold two.
     SO THIS PRESSES THEM THE WAY A THUMB DOES: the bucket as a chip, then each answer drawn inside
     it as the next chip, through `stuffNarrow_` over everything -- and the count has to be the one
     the inner row said. Over the whole library and over one paper, the same two states as 4c. */
```

### ONLY WHERE THE FUNNEL WOULD ASK IT.

in `chains`

```
/* ONLY WHERE THE FUNNEL WOULD ASK IT. `Day` over the whole library is every 5-a-day in seven
           months, which nobody is ever shown -- `FACET_NEEDS_FIRST` holds it behind Month -- and its
           weeks then hold forty-nine days apiece. A state no thumb can reach is not a promise. */
```

### ---------- AND NOT INSIDE ONE PAPER ANY MORE, WHICH IS SAID RATHER THAN SKIPPED

top level, before `live`

```
/* ---------- AND NOT INSIDE ONE PAPER ANY MORE, WHICH IS SAID RATHER THAN SKIPPED ---------------
       THIS PRESSED THE QUESTION NUMBERS INSIDE `P-1MA1-1705-1H` -- `1–10`, then `1–2`, then `1` --
       and they were the only buckets a paper ever had. The owner retired both questions (*"no more
       asking for questions 1-10 or question part 1 or b."*) and a paper now ends the funnel (see
       `FACET_ENDS`), so inside one paper there is nothing to press. That is asserted in 4e below
       rather than assumed here: this line only says why the second state is gone. */
```

### NOTHING IS GROUPED SINCE 6 OCT (*"No more of these artificial categories like grade 1-3"*), so there is no answer inside a bucket to press and this proves

top level, before `live`

```
/* NOTHING IS GROUPED SINCE 6 OCT (*"No more of these artificial categories like grade 1-3"*), so
       there is no answer inside a bucket to press and this proves nothing -- which is now the right
       answer, not a fault. A bucket drawn at all fails the "cut into ranges" rule further down. */
```

### ---------- 4e. AFTER PAPER, THE PAPER -- ITS QUESTIONS, IN ORDER, AND NOTHING MORE ASKED

top level, before `live`

```
/* ---------- 4e. AFTER PAPER, THE PAPER -- ITS QUESTIONS, IN ORDER, AND NOTHING MORE ASKED ------------
     ASKED FOR AS *"no more asking for questions 1-10 or question part 1 or b."* Before it, GCSE ·
     Foundation · 2024 · June · Paper 1 went on to `1–10 | 11–20 | 21–30`, then `1–2 | 3–4 | …`, then
     `1 | 2`. Three halves, each one a way it can come back:

       THE QUESTIONS ARE NOT ASKED. `qNumber` and `qPart` are live again since 18 Oct, as `tagOnly`
                                   facets -- the card's [Q7] [a] tags are answers, offered as doors on a
                                   chosen paper (docs/history/355) -- so each must be `tagOnly`, which
                                   `nextFacet` and `overFacet_` skip. The row's own spellings `question`
                                   and `part` must not be in `facetList()` at all (`RETIRED_FACETS`).
       NOTHING IS ASKED.           EVERY paper, reached the way a thumb reaches it -- Year, Month, then
                                   Paper -- asks nothing more, through `nextFacet` and the last resort
                                   both. Measured with only the two retired: 495 of 496 asked nothing
                                   and one asked `What you need`. That one is why `FACET_ENDS` exists.
       IT IS THE WHOLE PAPER, IN ORDER.  The drawn list holds every question of that paper and nothing
                                   else, question numbers never going backwards -- which is what makes
                                   it safe to stop asking: the order IS the question number. */
```

### ---------- 5. TWO FACETS, ONE MEANING

top level, before `answers`

```
/* ---------- 5. TWO FACETS, ONE MEANING --------------------------------------------------------
     The `level` / `stage` fault ACROSS facets: two questions offering the same answer word but
     landing on different result sets. Reported rather than failed — two facets legitimately share a
     word sometimes (a `Tier` of "A-Level" and a `Level` of "A-Level" are arguably both true) — but
     a person should look, because it is how "which one did I answer?" starts. */
```

### A QUESTION NOBODY IS ASKED CANNOT BE CONFUSED WITH ONE THAT IS.

top level, before `k`

```
/* A QUESTION NOBODY IS ASKED CANNOT BE CONFUSED WITH ONE THAT IS. The `tagOnly` facets (355) are
       picked from doors on a chosen paper, each under its own label -- `2` as a Question, a Page and a
       Marks answer is three labelled rows, not one word in two folders. */
```

### ---------- A RANGE IS NOT A NAME

top level, before `k`

```
/* ---------- A RANGE IS NOT A NAME ----------------------------------------------------------
         THE MOMENT `bucketValues_` LANDED THIS NAMED FOUR LETTER RANGES: `2-B` is an answer to Topic
         and to Paper, `M-P` to Paper and to Category. That is arithmetic rather than ambiguity --
         the two questions index two different alphabets and the endpoints coincide -- where the
         four real findings under it are one WORD carrying two meanings, which is what somebody can
         act on. Buckets are skipped by the flag the row carries, the same way the paper test tells
         a shelf from a book. (It is still worth knowing that the Paper index and the Topic index
         read alike over the 1st Class Maths worksheets, because those sheets are NAMED after their
         topic -- a fact about the library, and written up rather than reported every run.) */
```

### ---------- 6. WHAT THE SEARCH BOX CAN SEE, PER KIND

top level, before `byKind`

```
/* ---------- 6. WHAT THE SEARCH BOX CAN SEE, PER KIND -----------------------------------------
     `stuffFind`'s HAYSTACK IS `name + sub + subject + slot + grade + text`, and `text` is the only
     one of those that holds a thing's own WORDS. Everything else is a label. So a kind whose items
     carry no `text` is findable by its title and by nothing else — which is a whole department of
     the app that the search box cannot reach, and it does not throw, fail or look wrong anywhere.

     MEASURED THE DAY THE PRACTICAL GUIDES WENT IN: **0 of the 57 practicals had one.** `goggles`,
     `thermistor`, `nichrome`, `foil`, `tray` and `limiting reactant` each returned nothing, with
     every one of those words sitting in the row. The words that did hit — `bicarbonate`, `trundle`
     — hit the NAME, which is a coincidence rather than a search.

     PRINTED, NOT FAILED, and that is the `figure` argument rather than laziness: a boxer's card is
     a record with no prose on it, and demanding a haystack of one would mean inventing words to
     satisfy a checker. What the number is for is the OTHER direction — a kind that has words and
     stops shipping them, which is exactly how this was found and is the shape
     `papers checked against a total` going 34 to 2 under a green tick already records. */
```

### ---------- 6b. THE CODE PRINTED ON THE COVER HAS TO FIND THE PAPER

top level, before `docCode`

```
/* ---------- 6b. THE CODE PRINTED ON THE COVER HAS TO FIND THE PAPER --------------------------
     A TUTOR HOLDING THE PAPER TYPES WHAT IS PRINTED ON IT. Measured on the real library before
     `paperCodeAtoms_` existed: `1MA1` returned 0 of 794, `8464` returned 0 of 157 and `8464/B/1H`
     returned 0 of 27 — three codes that are on the front of the paper AND in a cell on every row
     under it. Fourth occurrence of this file's own sentence, after `topics`, after `company` and
     after the practical guides.

     THIS ONE FAILS RATHER THAN PRINTING, because it is wiring rather than a backlog. A paper that
     HAS a `spec_code` either answers to it or something between that cell and the haystack has
     come undone, and the question has one right answer. The papers with NO code are the backlog
     and are counted below instead.

     THROUGH `stuffHay_` AND `norm`, which is the pair `stuffFind` itself uses — asking the search
     the way the box asks it rather than re-implementing the match, which is how a check ends up
     green over a broken screen. */
```

### THE BACKLOG, PRINTED.

top level, before `papers`

```
/* THE BACKLOG, PRINTED. A worksheet has no exam code to carry and correctly has none; what this
     number is for is the papers that DO have one printed on them and no cell holding it — the
     Edexcel maths papers filed under `RS…` serials, and the AQA Religious Studies ones. One
     `spec_code` cell each and they join the rule above with nothing here to change. */
```

### ---------- 6c. A PAPER-LEVEL FACT HAS TO REACH EVERY QUESTION UNDER IT

top level, before `docNeeds`

```
/* ---------- 6c. A PAPER-LEVEL FACT HAS TO REACH EVERY QUESTION UNDER IT -----------------------
     "YOU MUST NOT USE A CALCULATOR" IS PRINTED ON A COVER AND IS TRUE OF ALL 41 QUESTIONS INSIDE,
     which is why `needs` sits on the `kind: 'document'` row rather than being copied onto every
     question — `needsOf_`'s own note says so, and CLAUDE.md records the denormalisation hazard the
     copy would be.

     MEASURED, AND IT WAS NOT REACHING THEM: `needsIndex_` was handed `DATA.questions`, and
     `libraryInto_` drops every row whose `active` cell is not on — so the map held 174 of the file's
     691 document rows. 77 of the 128 papers with a `needs` cell are marked inactive, seven of those
     have questions under them, and **247 questions never said whether a calculator was allowed**:
     the whole June 2024 Edexcel series, both tiers, Papers 1, 2 and 3, plus June 2023 Higher 1. On
     Foundation Paper 1, 15 of the 41 cards drew `Printed sheet` and nothing else, so the strip was
     present and read as complete — worse than a silence.

     THIS IS THE THIRD FUNCTION TO GET THAT WRONG. `specIndex_` and `paperLabels_` were each repaired
     for it, each with a paragraph explaining why, and the three lines were written out twice — so a
     third copy was the third. They all go through `libDocRows_` now, and this is the rule that would
     have caught the next one.

     A FAILURE RATHER THAN A COUNT, and rule 6b's own sentence is why: a paper that HAS the cell
     either reaches its questions or something between the cell and the card has come undone, and
     the question has exactly one right answer. A paper with no `needs` cell is the backlog and is
     printed below.

     ON THE ITEMS, THROUGH `asList_`, which is what `questionCard_` reads — asking the property
     rather than the mechanism, so it holds however the index is built. A test on `needsIndex_`'s
     arguments would pass on a version that took the file and ignored it. */
```

### ---------- AN ANSWER THAT NAMES A THING MUST NAME EXACTLY ONE OF THEM

top level, before `paperFacet`

```
/* ---------- AN ANSWER THAT NAMES A THING MUST NAME EXACTLY ONE OF THEM ------------------------
     THE `Paper` QUESTION WAS OFFERING ONE BUTTON FOR TWO PAPERS. Its `of` returned the paper's
     NAME, and `spellKey_` folds `Paper 1 (Non-Calculator) — May 2017` onto
     `Paper 1 (Non-calculator) — May 2017` — Edexcel Higher and Foundation, one sitting apart in
     meaning and one letter's case apart in spelling. Six names were shared by twenty papers, the
     six AQA `Paper 1 — June 2024` rows putting three subjects and two tiers on a single answer.

     TEST 2 COULD NOT SEE IT AND ITS OWN NOTE SAYS WHY: it looks for two values that normalise to
     one key, and after the fold there is only one value left to look at. The fold is right — it is
     what makes `Alevel` and `A-Level` one button — and feeding it an identity was not.

     SO THE RULE IS ON THE ITEMS BEHIND THE ANSWER rather than on the spelling in front of it: press
     it, and every question you are left with has to come from one paper. That is checkable without
     knowing anything about how the label was built, which is what makes it the right question.
     Proved by mutation: put the name back as the value and it names the merged answers. */
```

### ---------- A LEAF ANSWER IS ONE PAPER; A BUCKET IS MEANT TO HOLD MANY

top level, before `leaves`

```
/* ---------- A LEAF ANSWER IS ONE PAPER; A BUCKET IS MEANT TO HOLD MANY ----------------------
       THIS TEST IS WHY `showOf` EXISTS — its own note above records six names carried by twenty
       papers, merged into one button by the spelling fold, so an answer holding two papers is a
       real fault and stays one.

       `bucketValues_` MAKES THE OTHER KIND OF ANSWER, and holding many papers is the whole of its
       job: `P` is not a paper, it is the way to the papers whose names start with it. Told apart by
       the flag the row carries rather than by the shape of the text, which is the same distinction
       `filterHit` draws and for the same reason. */
```

### ONE ANSWER PER PAPER, AND ONLY WHERE THE ANSWERS ARE PAPERS.

top level, before `bucketed`

```
/* ONE ANSWER PER PAPER, AND ONLY WHERE THE ANSWERS ARE PAPERS. Over the whole library the
       Paper question is 266 answers, which is past the seven a card can hold, so what it draws is
       buckets — and counting those against the number of papers would be comparing a shelf against
       the books on it. The assertion holds where it means something: a list whose paper answers are
       leaves must have exactly one per paper. */
```

### ---------- AND THE PAPERS THE RULE ABOVE CANNOT REACH

top level, before `labels`

```
/* ---------- AND THE PAPERS THE RULE ABOVE CANNOT REACH -----------------------------------------
     THAT RULE IS ON THE ITEMS, so a paper with no questions under it yet produces no items and is
     invisible to it. 425 of the library's papers are in that state — the transcription queue — and
     two of them arriving with the same label is a fault that shows up on the day somebody types
     the questions in, not on the day the rows land.

     IT HAPPENED. AQA Combined Science June 2024 went in beside the Edexcel papers already there,
     and `Biology Paper 1 — June 2024` is a true name of an 8464/B/1H and of a 1SC0/1BH. They
     agree on subject and on tier as well, so `paperLabels_` appended `· Higher` to both and
     drew ONE button over two different papers. The board rung in that function is the fix; this is
     what would have named it.

     PRINTED, NOT FAILED, and the 17 it prints are why: thirteen are an `RS…` stub sitting
     beside its own transcription, which `check-library.js` already counts as the intended state,
     and four are English stubs carrying no year and, on two of them, `subject: Maths` on an
     English Language paper. Both are rows to repair rather than a rule to enforce, and a permanent
     red is a red nobody reads. What guards the class of fault is the rung, not this line. */
```

### ---------- A PAPER'S LABEL SAYS NOTHING THE SCREEN HAS ALREADY ANSWERED

top level, before `paper`

```
/* ---------- A PAPER'S LABEL SAYS NOTHING THE SCREEN HAS ALREADY ANSWERED -----------------------
     REPORTED FROM THE LIVE FUNNEL: "biology paper 1 as one category when it should be like biology
     then paper 1." Narrowed to `Subject · Biology`, all four Paper answers read
     `Paper 1 — June 2024 · Biology · Foundation` — the subject spelled out on four answers that are
     all Biology, because `paperLabels_` disambiguated against the whole library once and
     `shortLabels_` cannot take an APPENDED rung off again.

     THE RULE IS ON THE ANSWERS RATHER THAN ON THE FUNCTION. Narrow by a facet, then read the labels
     the Paper question would draw: none of them may name the answer just chosen. That is the
     property, and it holds however the labels are built — where a test on `paperLabels_`'s
     arguments would pass on a version that took the ids and ignored them.

     THREE NARROWINGS, BECAUSE ONE PROVES ONE. A subject with several papers of one name (Biology),
     a subject-plus-tier (Chemistry · Higher) where the bare `Paper 1` becomes available, and a
     sitting (Physics · Summer 2024) where the date is the redundant word rather than the subject. */
```

### THE YEAR IS ASSERTED TOO, AND THAT TOOK MOVING A RUNG.

in `LOOK`

```
/* THE YEAR IS ASSERTED TOO, AND THAT TOOK MOVING A RUNG. Split in two, the year is a chip of
         its own — and `paperLabels_` used to APPEND its subject and tier rungs after the paper's
         date (`Paper 1 — June 2024 · Foundation`), which left `nameForms_` nothing to cut, so the
         first version of this split exempted the year here with a comment. The rungs go before the
         date now and this narrowing reads `Paper 1 · Foundation`. Tier is deliberately left
         unanswered: answered, the papers are unique by name and the rule would pass on any order of
         rungs. */
```

### ---------- 4f. A CHIP'S HALF OF THE DATE IS NOT SAID AGAIN, AND NO ANSWER FUSES THE TWO

top level, before `paperF`

```
/* ---------- 4f. A CHIP'S HALF OF THE DATE IS NOT SAID AGAIN, AND NO ANSWER FUSES THE TWO -------------
     REPORTED AS *"Fix this why it say June and year in same chip"*. The card's tag is asserted in 4;
     this is the other half, the Paper answers and the chips they make. Measured before the fix, Year
     skipped and `June` pressed: `Paper 1 — June 2023 | Paper 1 — June 2024` -- the month the person
     had just chosen, read back fused to the year they had not.

     EVERY YEAR FOLDER A THUMB CAN REACH OVER PAST PAPERS, found by answering the funnel's own
     questions rather than named here, so a subject or a level added next term is walked with nothing
     to change. At each one, the three routes that say something: a year with the month skipped, a
     month with the year skipped, and both. Every Paper answer drawn there -- inside its bucket where
     the list is long -- and the chip it makes when pressed:

       never says the year a Year chip said, nor the month a Month chip said,
       never carries a month word and a year together,
       and reads on the chip exactly as it read on the button.

     NOT THE ROUTE WITH BOTH FOLDERS SKIPPED. `Doesn't matter` twice is a person choosing to see every
     sitting at once, nothing above the answers has said either half, and `— June 2023` is then the only
     thing telling two Paper 1s apart; that route keeps the date as the paper prints it, and the count
     of such answers is printed rather than failed. */
```

### ---------- A SATs PAPER IS `Paper 1` ON THE MENU, ON THE CHIP AND ON THE CARD

top level, before `byField`

```
/* ---------- A SATs PAPER IS `Paper 1` ON THE MENU, ON THE CHIP AND ON THE CARD ----------------------
     REPORTED AS *"When I do maths sats with [a student], the tags come out with full paper name and
     which paper is on the menu."* Measured: Maths · Past paper · KS2 SATs offered
     `Paper 1: Arithmetic — May 2019` beside `… May 2024`, and the chip it made read `PAPER Paper 1: Arithmetic — May 2019`. Three
     causes, one per half of this rule:

       the menu   the SATs question rows carry no sitting, so `Year` was never asked and the date had
                  to stay in the paper's name to tell two years apart -- `waveFromDoc_`
       the chip   it was labelled against the whole library rather than against the chips before
                  it -- `chipShow_`
       the card   the paper's name was one line of text -- `tagRow_` now

     KS1 AND KS2, because the two were added months apart and only one of them prompted this. Each
     year is walked on its own, which is what the funnel does once `Year` is asked. The route is
     `Level · SATs` then `Key stage · KS1` / `KS2` -- *"sats is one tag not ks2 sats"* -- which is the
     question a person answers to tell the two apart now that the level does not. */
```

### ---------- AND WITH THE YEAR SKIPPED

top level, before `months`

```
/* ---------- AND WITH THE YEAR SKIPPED ----------------------------------------------------------
         `Doesn't matter` IS DRAWN UNDER EVERY QUESTION, folders included, and pressed on Year it left
         the six KS2 papers reading their whole names -- `Paper 1: Arithmetic — May 2019` -- on the
         menu and on the chip, while every check here walked only the years. With the year skipped
         the date is the one thing that tells two papers apart, so it may stay; the qualifier may not.
         Walked with the Month skipped too and with it answered, because both are a thumb's route.
         AND ONLY THE HALF OF THE DATE NOBODY HAS SAID -- *"Fix this why it say June and year in same
         chip"*. With `May` pressed the answer is `Paper 1 · 2019`, the year alone; only with BOTH
         folders skipped does the printed `— May 2019` stay, because then nothing above it has said
         either half and the two together are what tells the papers apart. See `sittingUnsaid_`. */
```

### ---------- A CARD'S SUBJECT IS THE SUBJECT QUESTION'S, AND A 5-A-DAY'S DAY IS ITS DAY ANSWER

top level, before `subjectF`

```
/* ---------- A CARD'S SUBJECT IS THE SUBJECT QUESTION'S, AND A 5-A-DAY'S DAY IS ITS DAY ANSWER -----
       TWO WAYS A CARD SAID A WORD THE FUNNEL ABOVE IT DID NOT. The subject tag was read off the name,
       so AQA Combined Science cards wore `Biology` in green and real GCSE Biology cards wore nothing;
       and a 5-a-day's name was cut at its dash, so `5-a-day Foundation` was one red pill and the day
       was coloured as a sitting while the Day answer that reaches it is red. Over every paper: each
       green tag is one of the item's own Subject answers, and each 5-a-day card carries its Day
       answer in the Day answer's colour and no pill joining a type to a level. */
```

### ---------- A `facets` ROW NAMING A FIELD NOTHING ANSWERS IS A DEAD ROW

top level, before `sheet`

```
/* ---------- A `facets` ROW NAMING A FIELD NOTHING ANSWERS IS A DEAD ROW ------------------------
     FOUR OF THEM WERE LIVE WHEN THIS WAS WRITTEN, and they are the reason the funnel was reported
     as "not uniform". `data/settings/facets.json` is the live source of every question's LABEL and
     ORDER, and `facetList` sorts each of its rows into one of two piles: a field the code declares
     is a relabel of that question, and a field the code has never heard of is a NEW question read
     straight off the column. So a RENAME moves a row silently from the first pile to the second:

       `resourceType`  the column is `document_type` since the rename. The row meant to put `Type`
                       at order 40 and instead invented a dead question, while the real
                       `documentType` facet — having no row — fell wherever its position in the
                       code's array happened to land it. `Type` was FOURTEENTH.
       `stage`         renamed to `level` in code for exactly this reason, and the sheet kept the
                       old name. `Level` was EIGHTEENTH, after `Question number`.
       `qNumber`       both deleted from the code. The sheet went on inventing them, and
       `qPart`         `Question part` offered `A`, `B`, `C` beside `1`, `2`, `3` — two vocabularies
                       in one question, which is the most non-uniform answer set the funnel had.

     NOTHING COULD SEE ANY OF IT. `whyThisQuestion()` prints a dead question with `0%` beside it and
     is a console tool somebody has to run; this check ran with the fixture in the sheet's place, so
     it was measuring a funnel the app does not draw. Both halves are fixed in the same commit — the
     boot above serves the real file, and this is the rule that refuses the next rename.

     THE TEST IS "DOES ANY ITEM ANSWER IT", not "is it declared in code", because inventing a
     question off a column is a FEATURE — `facetFromSheet_` exists for it and a row naming a real
     `venues` column is meant to work with no code change. What cannot be right is a row nothing
     anywhere can answer: it is a label and an order attached to nothing.

     AND A ROW FOR A RETIRED FACET IS DEAD TOO. `RETIRED_FACETS` blocks it from drawing, which is
     the guard working; a row that exists only to be blocked is still a row somebody will read as
     live. `paper` was one. */
```

### ---------- DECLARED IN CODE *OR* ANSWERED BY SOMETHING — NOT "ANSWERED", FULL STOP

top level, before `facet`

```
/* ---------- DECLARED IN CODE *OR* ANSWERED BY SOMETHING — NOT "ANSWERED", FULL STOP --------
         THE FIRST VERSION ASKED ONLY WHETHER ANY ITEM ANSWERS, and it named `slot` and `afford`:
         both are real code facets whose subject is the shop and the wardrobe, and `check/fixture.json`
         has no priced rows, so their coverage here is nought. This file's own header says why that
         cannot be a failure — the fixture supplies everything that is not the library, so a facet
         measured thin here is measured thin by the harness rather than by the app.
         A CODE FACET IS NEVER A DEAD ROW. Its `of` is a function somebody wrote; the row only
         relabels and reorders it. What is dead is a row naming a field the code does NOT declare
         and nothing anywhere answers — which is exactly what a rename leaves behind. */
```

### AND NO QUESTION IS CUT INTO RANGES -- THE SEVEN-ANSWER CAP BELOW IS HISTORY.

top level, before `CAP`

```
/* ================================================================================================
     AND NO QUESTION IS CUT INTO RANGES -- THE SEVEN-ANSWER CAP BELOW IS HISTORY.

     6 OCT, THE OWNER REVERSED IT: *"I don't want to break up the title of things ... I no longer
     want to have that a-g method or h-n. Just display. Other categories should reduce how many show
     up like grade."* So the rule now is: a group drawn is a category its facet's own table names
     (a grade band, a subject area), never `C–E` or `1–10`; and a question ASKED is drawn whole, so
     it holds at most FACET_MAX_ANSWERS. What the paragraphs below describe is the rule this
     replaced, kept because it says why the walk is shaped the way it is.

     REPORTED: "there are some menus in finder where there are more than 7 options. And so it can't
     display them and asks user to search. I DO NOT LIKE THIS." The funnel used to trim the drawn
     answers to seven and print a line pointing at the search box; `bucketValues_` groups instead,
     so a long answer list becomes at most seven buckets and the question is asked again inside
     whichever one was pressed.

     A PROPERTY OF THE DATA, NOT OF THE CODE, WHICH IS WHY IT IS CHECKED RATHER THAN ASSUMED. Every
     rule in `bucketValues_` can decline: a facet's own grouping stands down if it cannot place
     every value, the tens band stands down unless everything is an integer, and the alphabet stands
     down if every value reduces to one key. Each of those is the right thing to do and each leaves
     the list untrimmed — so the guarantee holds only as long as something walks the real funnel and
     counts. That is this.

     AT EVERY STATE A PERSON CAN REACH, NOT AT THE TOP. Six answers deep on Maths worksheets at KS4
     the Paper question still held 87 answers and Topic still held 75, so a check that looked only
     at the opening question would have passed over the states the complaint was about. The walk is
     the greedy one — always press the biggest answer — plus every answer to each of the two doors,
     which between them reach every kind the app holds.

     PROVED BY MUTATION: with `bucketValues_` handing back its input untouched, this names 71
     over-sized questions across 17 states — `topic` at 375 answers, `division` at 16, `decade` at
     14 — and exits 1.
  ================================================================================================ */
```

### ---------- AND WHAT THE GROUPS ACTUALLY SAY, WHICH IS THE HALF A RULE CANNOT JUDGE

top level, before `groups`

```
/* ---------- AND WHAT THE GROUPS ACTUALLY SAY, WHICH IS THE HALF A RULE CANNOT JUDGE ----------
       SEVEN LEGAL BUCKETS AND SEVEN USABLE ONES ARE NOT THE SAME THING. `Heavyweight` and
       `Grades 4–6` are questions a person can answer; `P`, `R`, `W` were the three the Paper
       question drew before its ranges were measured on the paper's NAME rather than on the id
       behind it, and every rule here was green over them. So the first grouping each question
       makes is printed, once, and a person reads it -- the argument this repository makes about
       the figure backlog and the transcription queue, pointed at the funnel. */
```

### AND THE BOXING'S OWN SHELF, from Find's top.

top level, before `kindF`

```
/* AND THE BOXING'S OWN SHELF, from Find's top. `Division` and `Decade` — two of the questions the
       mutation above names — are boxing questions; the two doors above reach them under `What kind ·
       Resources`, and this goes one shelf further, where they are asked. They were measured over the
       second finder's own lists while it held the resources alone (329); it holds Find's list now (347,
       and the pass at the end proves the two lists are one), so measuring Find measures both. */
```

### A CLOSED KIND'S QUESTIONS COST EVERYBODY ELSE NOTHING — THE FENCE, MEASURED BY WHAT WAS TALLIED.

top level, before `fenced`

```
/* ================================================================================================
       A CLOSED KIND'S QUESTIONS COST EVERYBODY ELSE NOTHING — THE FENCE, MEASURED BY WHAT WAS TALLIED.

       THE BIBLE IS SIX QUESTIONS ON FIND (`only: 'bible'`), asked of nobody but an admin, and this harness
       is signed out — so there is no Bible here to ask about, and that is the point: the six must not be
       TALLIED over a list that holds none of it. Measured before the fence, they were: placed straight
       after Shelf, five more tallies on every school question (Questions went from 8.5 to 20.3 ms), and
       the coverage rule was the only thing keeping them unasked — by arithmetic, after the cost.

       SO THIS READS `FACET_TALLY`, THE ENGINE'S OWN MEMO, rather than the question chosen: a fenced
       question is never tallied, so no key of one may appear. On a FRESH COPY of each list, because the
       memo is keyed on the array and every other rule here has already tallied the originals. Over the
       top list, every door's list, and one item of every kind on its own — where `nextFacet` finds
       nothing to ask and `overFacet_`, the last resort, runs too; it has a fence of its own.

       AND A GRID MUST BE FENCED. `grid` exempts a question from FACET_MAX_ANSWERS so a run of 150
       chapter numbers can be drawn; on a question that is not kept to one closed kind, that exemption
       would draw 389 topics whole on the library's own lists. */
```

### ---------- AND A DECLARED BUCKET HOLDS EXACTLY WHAT ITS TABLE SAYS

top level, before `leaks`

```
/* ---------- AND A DECLARED BUCKET HOLDS EXACTLY WHAT ITS TABLE SAYS --------------------------
       THE MUTANT THAT PROMPTED THIS PASSED EVERYTHING. With the letter ranges keyed on the raw
       value instead of on `bucketKeyOf_`, `Level` drew `KS2 (259)` where the table says 228: a
       range labelled `KS2` prefix-matched the values `KS2-GCSE` and `KS2-KS3`, so 31 rows were in
       two buckets at once and `LEVEL_BUCKET`'s own sentence — "a span is filed under the level it
       goes UP TO" — was being contradicted by the mechanism meant to implement it. Every rule here
       was green: the drawn count and the pressed count agreed, because both go through
       `bucketHas_`, which is exactly the function that was wrong.

       SO THE TABLE IS THE THING COMPARED AGAINST, not the code that reads it. Where a facet
       declares its own grouping and the drawn buckets are its own labels, an item belongs to a
       bucket if and only if one of its values names that bucket. `facetOwn_` and `filterHit` are
       both already here, and `bucketOf` rides on the facet object, so this needs nothing new
       exported — which is the point: it is asking the app the question rather than repeating its
       arithmetic. */
```

### ---------- THROUGH THE ENGINE'S OWN TEST, NOT A SECOND COPY OF IT

top level, before `said`

```
/* ---------- THROUGH THE ENGINE'S OWN TEST, NOT A SECOND COPY OF IT ------------------------
         THIS ASKED `facet.bucketOrder.indexOf(b) >= 0` AND IT SILENTLY SKIPPED `examWave`. That
         grouping is computed rather than listed, so its `order` is an EMPTY ARRAY — truthy, so the
         guard above let it through, and then every one of its labels failed the `indexOf` and the
         whole facet returned. A rule that cannot reach its subject reporting that the subject is
         fine is this repository's oldest shape, and here it was hiding a fifth of the declared
         groupings from the rule written to guard them. `bucketDeclares_` is what `bucketHas_`
         itself asks, so the check and the engine agree about which labels a grouping owns by
         construction rather than by two functions that have to be kept in step. */
```

### ---------- AND A LISTED TABLE PLACES EVERY ANSWER THE LIBRARY GIVES

top level, before `unplaced`

```
/* ---------- AND A LISTED TABLE PLACES EVERY ANSWER THE LIBRARY GIVES ----------------------------
       FOUND ADDING THE FIRST FUNCTIONAL SKILLS PAPER, and only because the summary line above was
       read: `Level` had been `KS1 | KS2 | KS3 | GCSE | A-Level` and one new band value turned it into
       `A (618) | F (6) | G (4752) | K (353)`. `bucketLabels_` stands the whole grouping down to the
       alphabet when ONE value has no row in the table -- deliberately, because a grouping that drops
       an answer hides it -- so six questions nobody had filed rewrote the Level question for all
       5,750. Nothing failed: the rule above only looks at a facet whose drawn labels are its own, so
       the moment the table stood down that rule stood down with it.

       SO A TABLE THAT IS WRITTEN OUT (`order` non-empty) MUST PLACE EVERY VALUE AN ITEM GIVES. A
       computed grouping (`waveBucket_`, an empty `order`) places by arithmetic and is not this rule's
       business. The repair is one row in the table, and the message names the value. */
```

### ---------- AND A QUESTION ASKED INSIDE A BUCKET OFFERS ONLY WHAT IS IN IT

top level, before `outside`

```
/* ---------- AND A QUESTION ASKED INSIDE A BUCKET OFFERS ONLY WHAT IS IN IT -------------------
       FOUND BY WALKING THE FUNNEL AND READING WHAT IT DREW, which is the only way it could have
       been: six chips deep, pressing `Topic · D–F` drew `D–E`, `F`, `I–M`, `N–P` and `S–T`.
       Nothing was broken — `topic` is multi-valued, so a question tagged `Decimals, Ratio` is kept
       by the chip and still carries `Ratio` — and the screen said the opposite of the chip above
       it. Every rule in this file was green, because every count agreed with every press.

       PRESSED THROUGH THE APP'S OWN STATE rather than by calling the restriction: the chip goes on
       `STUFF.filters` exactly as `facet-pick` puts it there, the items are filtered by `filterHit`,
       and what is read back is what `stuffQuestion` would draw. `bucketHas_` decides what "inside"
       means, because it is the one function that decides that anywhere. */
```

### ---------- ON THE RAW VALUES, BECAUSE AN INNER ANSWER IS OFTEN A BUCKET TOO

top level, before `raw`

```
/* ---------- ON THE RAW VALUES, BECAUSE AN INNER ANSWER IS OFTEN A BUCKET TOO --------------
         THE FIRST VERSION ASKED `bucketHas_` WHETHER THE INNER ANSWER WAS INSIDE THE OUTER ONE and
         named four findings that are all correct behaviour: inside `1–10` the question numbers
         re-group as `2–3`, `4–5`, and a LABEL is not a value — `bucketHas_` takes what a row
         holds. So the test is on what the rows hold: any value on a kept item that the outer chip
         does not contain is a stray, and no answer drawn inside that chip may hold one. */
```

### ---------- AND A LIST NO TABLE CAN SPLIT IS DRAWN WHOLE

top level, before `collapse`

```
/* ---------- AND A LIST NO TABLE CAN SPLIT IS DRAWN WHOLE ------------------------------------
       A grouping that answers ONE label for every value cannot narrow anything, so `bucketLabels_`
       stands it down -- and since 6 Oct there is nothing behind it: no tens, no alphabet. Ten
       answers in, the same ten answers out, none of them a bucket. Asked of a facet built here,
       because none of the real tables collapses and the shape still has to be held. */
```

### ---------- AND A TABLE PLACES EVERY SPELLING OF A VALUE IT LISTS

top level, before `unfolded`

```
/* ---------- AND A TABLE PLACES EVERY SPELLING OF A VALUE IT LISTS ---------------------------
       `facetTally_` FOLDS VARIANTS BY `spellKey_` AND HANDS THE GROUPING WHICHEVER SPELLING WON,
       so a table keyed on `norm` — lower case and trim, nothing else — is using a looser fold at
       one end than the fold that decided the answer at the other. `A Level` is the same answer as
       `A-Level` to `spellKey_` and a different key to `norm`; it wins the vote by carrying a
       separator; and ONE unplaced value stands the whole grouping down to the alphabet, silently,
       on a question that worked the day before. This file records `Alevel` / `A-level` /
       `A-Level` as three answers on one screen in this very column.

       SO IT IS ASKED OF THE TABLES RATHER THAN OF THE DATA. Every label a facet declares must come
       back for a spelling of it with the separators taken out, which is the perturbation
       `spellKey_` is built to see through and `norm` cannot. */
```

### RULE 8 WAS HERE — A BRANCH A ROW CANNOT HONESTLY BE IN

top level, before `all`

```
/* ==================================================================================================
     RULE 8 WAS HERE — A BRANCH A ROW CANNOT HONESTLY BE IN

     REPORTED AS "sometimes in finder there are things which seem to appear in wrong menu. like i
     remember seeing a level maths pure somewhere it shouldnt be ... this happens frequently." It
     held every row's `Topic area` against the level and subject the tree's roots declare, read the
     candidates off `data/topics.json` itself so it could not agree with the resolver by sharing its
     mistake, and caught the two faults it was written for — 18 GCSE Higher questions in the A-level
     branch, and `brackets` filing two KS2 grammar questions under Number (docs/history/180).

     IT WENT WITH THE MENU IT GUARDED. The owner retired `Topic area` on 6 Oct, and from then on this
     rule was the only caller `topicAreaOf_` had: green over a resolver no screen asks, which is a
     check measuring itself. `check-dead.js` listed the function the day the facet went. Both are gone
     now (find.js, `THE TOPIC TREE WAS READ HERE`). A topic menu that comes back brings this rule back
     with it — the file's history has it whole. */
```

### ---------- LEVEL BEFORE KEY STAGE, AND A QUALIFICATION RATHER THAN A GREY AREA

top level, before `all`

```
/* ---------- LEVEL BEFORE KEY STAGE, AND A QUALIFICATION RATHER THAN A GREY AREA --------------------
     THE OWNER: *"key stage 3 and 4 shouldnt come before like the level … I prefer GCSE or SATs over
     grey areas."* Four answers, each through the app's own readers:
       1. Level is ahead of Key stage in the code's order AND in the live order the sheet makes;
       2. no item with a key stage has no level — 1,160 primary sheets had none, which kept Level
          under its coverage bar and put Key stage in front of it;
       3. no item's level is a bare KS1, KS2, KS4 or KS5 — those have a qualification to say;
       4. Key stage is asked INSIDE SATs AND NOWHERE ELSE. *"why is ks2 sats one tag? it should be
          sats. if they want to specify key stage then it should be its own thing."* So no level
          reads `KS1 SATs` or `KS2 SATs` (the level is `SATs`), inside SATs the question answers
          exactly `KS1 | KS2`, and inside every other level it answers nothing at all — `KS3 | KS4`
          inside GCSE is the exact screen first reported, and this was "at most one answer" until
          the key stage stopped riding inside the level's name. */
```

### FIND 2, THE SAME FINDER TWICE (docs/history/347).

top level, before `RF`

```
/* ================================================================================================
     FIND 2, THE SAME FINDER TWICE (docs/history/347).

     THE OWNER, 12 Oct: *"Return to that origional finder having everything and now there is just an
     identical second finder. Smart students will know to use this second finder to have the content
     up while they do questions on the origional finder."* It held only the resources from 10 Oct
     (329), and this pass asked that it did; now it asks the opposite, in the app's own binding
     (`inFinder_`), so the list and the questions measured are the ones the second column really has:

       a. it holds Find's list: the same ids, as many of them, over the real files;
       b. its first question is Find's first question — the same field, the same answers, the same
          counts — the funnel's own choice, as Find's is;
       c. one rung down, from every answer of that question, the question it asks next is the one Find
          asks next — so the binding changes whose state is read and nothing about what is asked.
          Rules 1 and 2 above are measured over Find's list, which is this list (a.);
       d. the fence holds here too: no closed-kind question (`only`) is tallied over a list with none
          of that kind in it — the Bible is not on a signed-out list, so nothing of it may be counted.
  ================================================================================================ */
```

