# js/check-library.js

The full text of comments in `js/check-library.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### check-library.js — THE ONE DATA FILE IN THIS REPOSITORY, GUARDED

top level, before `fs`

```
/* ==================================================================================================
   check-library.js — THE ONE DATA FILE IN THIS REPOSITORY, GUARDED

   `data/questions.json` is 4,264 rows and 2.4 MB of committed content, and until this file existed
   NOTHING CHECKED IT AT ALL. Every other check in here reads the code; this one reads the data the
   code is about. A wrong row does not throw, does not fail a build, and looks exactly like a right
   one — it is simply a question somebody is taught wrongly.

   Each rule below is a mistake that was actually made, or came within one step of being made.

   THE SHAPE. Line one is a bare `[`, the last line a bare `]`, and every row is ONE JSON OBJECT ON
   ONE LINE so a diff names the rows that changed. Every insert written for this file appends inside
   those brackets by splitting on newlines — so the shape is not cosmetic, it is the contract those
   scripts rely on. The first insert of the session assumed no brackets at all and would have
   written a broken file; it was caught by reading the first line, which is not a method that scales.

   ROW IDS ARE UNIQUE. A repeated id is a question that silently replaces another. Papers were
   transcribed one per sitting, and a paper keyed on the month it was sat (`P-1MA1-1906-2H`) rather
   than the year alone is the only thing that keeps a June paper from colliding with a November one.

   NO TICK COLUMNS, EVER. `ticks_1`, `ticks_2` and `ticks_3` held the handles of real people, most of
   them children, and were stripped at source when this file was built. THIS REPOSITORY IS PUBLIC and
   git history is permanent, so a tick column reappearing is not a data-quality problem, it is a
   disclosure. CLAUDE.md says this twice; this says it where it can act.

   A QUESTION'S PAPER MUST EXIST. `kind: 'paper'` is the one row a document gets, and it carries the
   link, the page count and the print flag. A question naming a `paper_id` with no paper row behind
   it is a question that can be found and never opened. (The reverse is fine and expected: 440 papers
   carry no questions yet. That is the backlog written down, not a fault, so it is reported and does
   not fail.)

   EVERY EDEXCEL 1MA1 HIGHER PAPER IS 80 MARKS. That is a fact about the qualification, not a
   convention, which makes it the strongest check available here: a dropped part, a doubled part or a
   mistyped mark shows up as a total that is not 80. Twelve papers, twelve 80s. It caught nothing
   when written because every paper was checked against its own stated total before insertion — which
   is the point. The check is the thing that keeps that true after the person who was being careful
   has gone.

   THE FACET VOCABULARY IS CLOSED. This is the near-miss that prompted the file. `exam_wave`, `tier`,
   `subject` and the rest are FACETS: `facetFromSheet_` turns a column into a question the funnel
   asks, and every distinct value becomes an answer somebody is offered. Transcribing the November
   papers I tagged them `exam_wave: 'Resit'` — a perfectly sensible word, next to the `'Second wave'`
   the file had used for exactly that meaning since before I arrived. Two answers, one meaning, and a
   filter that reads as arbitrary. I caught it by looking afterwards, which is luck.

   So the vocabulary is written down and anything outside it FAILS. The point is not that these
   values are beautiful — two of them are not, and say so below — it is that a NEW one has to be
   added here deliberately, by somebody who has just read what is already in use. Same argument as
   `ACCEPTED` in check-payload.js and `ACCEPTED_TAP` in check/ui.js: a list exists so that the next
   arrival fails loudly instead of joining a red nobody reads.

   Run:  node js/check-library.js
================================================================================================== */
```

### ---------- THE CLOSED VOCABULARY

top level, before `VOCAB`

```
/* ---------- THE CLOSED VOCABULARY ---------------------------------------------------------------
   Every value here is one the file already uses. Adding to this list is how you add an answer to a
   facet, and it should take a moment's thought — that moment is the whole feature.

   TWO ENTRIES ARE UNTIDY AND KEPT ANYWAY, with the reason written down, because silently
   "correcting" content is worse than describing it:

     exam_wave  carries both words (`First wave`, `Second wave` — the summer and November sittings)
                and ISO dates from an older import. They mean different things to whoever wrote
                them and nothing in the app reads the dates, so they stay until somebody decides
                what the column is for. NEW rows use the words.
     pages_checked  is a flag everywhere except one import that wrote a date into it. Left as found. */
```

### `5-a-day` IS A DIFFERENT KIND OF THING FROM A WORKSHEET and the owner's own words are the reason it is a value rather than a naming convention:

in `VOCAB`

```
/* `5-a-day` IS A DIFFERENT KIND OF THING FROM A WORKSHEET and the owner's own words are the
     reason it is a value rather than a naming convention: "its its own category, not to be
     confused with the other corbet maths work which is like topic learning. this is 5 a day."
     A Corbettmaths worksheet is thirty questions on ONE topic, worked through once. A 5-a-day is
     five questions on five different topics, sat in ten minutes, every day of a month — the same
     publisher and the opposite shape. `document_type` is what the funnel's Type question reads, so
     making it a value is what puts the two in different answers instead of one pile. */
```

### `Foundation Plus` AND `Higher Plus` ARE CORBETTMATHS' OWN LEVELS, printed on the front of every 5-a-day, and they are not exam tiers — Edexcel and AQA have two.

in `VOCAB`

```
/* `Foundation Plus` AND `Higher Plus` ARE CORBETTMATHS' OWN LEVELS, printed on the front of
     every 5-a-day, and they are not exam tiers — Edexcel and AQA have two. They are in this column
     anyway, for the reason `total_marks` is a cell: THE PAPER DECLARES ITS OWN LEVEL, and the one
     moment anybody is certain of it is when they are looking at the front of the thing. Filing a
     Higher Plus under `Higher` would fold a set aimed past grade 9 into the tier below it, which
     is a wrong answer on a chip rather than a missing one. */
```

### WHAT A MARK IS MADE ON -- squared paper, axes, a blank space, or the passage itself.

in `VOCAB`

```
/* WHAT A MARK IS MADE ON -- squared paper, axes, a blank space, or the passage itself. A closed list
     because each is a different drawing (`surfaceSvg_`) or a different behaviour (`circWords_`), and a
     fifth spelling would draw as nothing. */
```

### 4, 5 AND 6 ARE REAL PAPER NUMBERS and it took Edexcel Combined Science to prove it.

in `VOCAB`

```
/* 4, 5 AND 6 ARE REAL PAPER NUMBERS and it took Edexcel Combined Science to prove it. 1SC0 is six
     papers — biology, chemistry and physics, each sat twice — and its own covers say "Combined
     Science PAPER 4" over the code 1SC0/2BH. A cap of three was never a rule about exams; it was
     the shape of the one qualification anybody had in front of them, which is the sentence this
     file already writes about `isEdexcelGcseMaths`. */
```

### WHAT YOU HAVE TO HAVE IN FRONT OF YOU — one comma-list, not three booleans.

in `VOCAB`

```
/* WHAT YOU HAVE TO HAVE IN FRONT OF YOU — one comma-list, not three booleans. A closed list for
     the reason every list here is closed: `calc`, `Calculator` and `calculator` would be three
     buttons on the funnel for one fact, which is the `Alevel` / `A-Level` fault in a new column.
     `Calculator` and `No calculator` live on the DOCUMENT row (the front cover says it once for the
     whole paper); the kit lives on the question that asks for it. See tools/set-needs.py. */
```

### `Periodic table` IS THE SCIENCES' VERSION OF THE SAME FACT and arrived with the first AQA chemistry paper:

in `VOCAB`

```
/* `Periodic table` IS THE SCIENCES' VERSION OF THE SAME FACT and arrived with the first AQA
     chemistry paper: its front cover lists it beside the ruler and the calculator, in the same
     sentence, as a thing you must have. Paper-level like the calculator — the cover says it once
     for all the questions inside. */
```

### `Equation booklet` IS THE PHYSICS ONE, and AQA encloses it with the paper:

in `VOCAB`

```
/* `Equation booklet` IS THE PHYSICS ONE, and AQA encloses it with the paper: "the Physics
     Equations Sheet (enclosed)" on the cover of all four 8463 papers, and Edexcel says the same on
     1SC0/1PH and /2PH. A sheet of formulae a student is HANDED in the exam is exactly the fact this
     column carries — it changes what you put on the table beside them. */
```

### ---------- THE SHAPE, READ AS TEXT

top level, before `raw`

```
/* ---------- THE SHAPE, READ AS TEXT ---------------------------------------------------------------
   Before parsing, because the one-object-per-line layout is invisible to JSON.parse: a file written
   as one long line parses perfectly and makes every future diff useless. */
```

### EACH LINE IS PARSED ON ITS OWN, not merely checked for the right last character.

top level, before `body`

```
/* EACH LINE IS PARSED ON ITS OWN, not merely checked for the right last character. The first version
   of this asked whether the line ended in `}` — and the whole file concatenated onto a single line
   ends in `}` too, so the one mutant that should have caught it sailed through. Parsing is the only
   test that actually says "exactly one object here". */
```

### ---------- 80 MARKS

top level, before `paperFacts`

```
/* ---------- 80 MARKS ------------------------------------------------------------------------------
   Every Edexcel GCSE maths past paper is 80 marks, Foundation and Higher alike, by definition of the
   qualification. It is the only end-to-end check a transcription has — nothing else in here knows
   what the paper said — so it catches a dropped part, a misread mark and a doubled question at once.
   Anything else (worksheets, A-level, other boards) has no single right answer to compare against
   and is left alone rather than guessed at.

   THE PAPER IS IDENTIFIED BY WHAT IT IS, NOT BY HOW ITS ID IS SPELLED. This used to test
   `/^P-1MA1-\d+-\dH$/` against the paper_id, and the June 2024 series — six papers, both tiers,
   filed under `RS…` ids — was therefore never checked at all. That is the same fault as the
   duplicate above wearing different clothes: an id prefix is a naming habit, and a check that keys
   on one only sees the papers somebody happened to name that way. All six do total 80; nothing was
   wrong, and nothing would have said so. */
```

### ---------- AND THE PAPER SAYS WHAT IT IS OUT OF

top level, before `isEdexcelGcseMaths`

```
/* ---------- AND THE PAPER SAYS WHAT IT IS OUT OF ---------------------------------------------------
   THIS KNEW ABOUT ONE QUALIFICATION. `isEdexcelGcseMaths` is a predicate over five columns, written
   because the id prefix it used before was blind to six papers filed under `RS…` ids — a real fix,
   and still a rule that only works for the board and subject somebody had in front of them. The
   first AQA GCSE English paper walked straight past it, and so would every A-level paper already in
   the library.

   SO THE PAPER DECLARES ITS OWN TOTAL. `total_marks` on the `kind: 'paper'` row, and the parts under
   it must sum to it. That is one cell per paper, set by whoever transcribes it from the front page
   of the thing they are looking at — which is where the number is printed, and the one moment
   anybody is certain of it. No board, subject, tier or key stage appears in the rule at all.

   THE OLD PREDICATE STAYS AS A DEFAULT, not as the rule. Thirty Edexcel GCSE maths papers are in
   here without a `total_marks` cell, and 80 is true of every one of them by definition of the
   qualification — so they go on being checked while the column fills in behind them. A paper that
   matches neither is not checked, and the count below says how many that is rather than letting it
   pass as coverage. */
```

### ---------- A LIST COLUMN IS CHECKED PER ITEM, NOT PER CELL

top level, before `LIST_COLS`

```
/* ---------- A LIST COLUMN IS CHECKED PER ITEM, NOT PER CELL --------------------------------------
   `key_stage` GAVE THIS AWAY AND IT TOOK A SECOND LIST COLUMN TO NOTICE. Its vocabulary reads
   `KS1`, `KS1, KS2`, `KS2`, `KS3`, `KS3, KS4`, `KS4`, `KS5` — five values and two COMBINATIONS of
   them, listed because the loop compared the whole cell. That is fine at two combinations and
   combinatorial after: `needs` holds six atoms, so a cell-wise list would need sixty-three entries
   to permit what six atoms already say, and a real pair like "Compass, Ruler" fails until somebody
   types it out.

   THE COLUMN IS A LIST WHEREVER THE APP READS IT AS ONE — `asList_` and a comma, which is how
   `topics`, `keystage` and `images` have always worked. So the vocabulary is the ATOMS, and the
   combinations come out of `key_stage` because they were never facts, only an artefact of how this
   loop asked the question. */
```

### ---------- A VOCABULARY WRITTEN BEFORE ITS COLUMN, ON PURPOSE

top level, before `VOCAB_AHEAD`

```
/* ---------- A VOCABULARY WRITTEN BEFORE ITS COLUMN, ON PURPOSE -------------------------------------
   `surface` IS NEW AND THE FRONT END READS IT BEFORE ANY ROW CARRIES IT: the data workflow is writing
   it into rows and the app has to be ready on the day it lands, with the list closed from the first
   row rather than from whenever somebody remembers. So it may be on no row YET without the failure
   below -- and it says so on every run, and says when it can come off this list, so "ahead" is a state
   with an end rather than a second way of enforcing nothing. */
```

### ---------- A VOCABULARY FOR A COLUMN NOTHING HAS IS A VOCABULARY NOTHING ENFORCES

top level, before `col`

```
/* ---------- A VOCABULARY FOR A COLUMN NOTHING HAS IS A VOCABULARY NOTHING ENFORCES -------------
     CAUGHT BY DOING IT. `resource_type` was renamed to `document_type` across the file and the code,
     and this list kept the old name — so the loop above found the column on zero rows, reported zero
     strays, and printed a pass. The closed vocabulary for the funnel's `Type` question had stopped
     existing and nothing said so.

     THAT IS THE SHAPE THIS WHOLE FILE IS ABOUT: a check that cannot reach its subject reporting that
     the subject is fine. `check-booking.js` printed "nothing to check" and exited 0; this printed
     nothing at all. So a name in VOCAB that no row carries is now a failure — either the column was
     renamed and this list did not follow, or the entry is for a column that never existed. */
```

### ---------- `AND` AND `&` ARE TWO BUTTONS FOR ONE TOPIC

top level, before `AMP`

```
/* ---------- `AND` AND `&` ARE TWO BUTTONS FOR ONE TOPIC -------------------------------------------
   `topics` HAS NO CLOSED VOCABULARY and cannot have one: it is 400-odd editorial values that grow
   every time a paper goes in, which is why the funnel folds spellings instead (`spellKey_` in
   find.js, and the vote in `topicOf_`). That fold reduces an answer to its letters and digits — so
   `Alevel` and `A-Level` become one button, and `Magnetism and Electromagnetism` and
   `Magnetism & Electromagnetism` DO NOT. They are different letters. Two buttons, one unit.

   CAUGHT BY LOOKING AT THE LIST, AFTER A CHECK I WROTE FOR IT SAID THERE WAS NOTHING THERE. Nine
   AQA science papers went in over one session and three units ended up spelled both ways — atomic
   structure, magnetism, infection. The throwaway probe that was meant to find them normalised `the`
   out of the middle of words and reported clean; the raw tally of values, printed and read, did not.
   Same shape as `check-booking.js` exiting 0, one layer up: my own instrument could not reach its
   subject and I believed it.

   SO THE RULE IS THE NARROWEST ONE THAT IS CERTAIN, and it is about `and` against `&` and nothing
   else. Case and spacing are already folded by `spellKey_`; a genuinely different topic never
   differs from another only by that one word. Proved by mutation in both directions. */
```

### CASE IS DELIBERATELY NOT FOLDED HERE.

top level, before `k`

```
/* CASE IS DELIBERATELY NOT FOLDED HERE. `spellKey_` already reduces `Histograms` and
       `histograms` to one identity and `topicOf_`'s vote picks which to show — 46 pairs in this
       file are that, and every one is correct. The first version of this rule lower-cased and
       reported all 46 as faults, which is `check-rows.js` with 95 findings and 2 real ones. The
       question this rule asks is only the one the fold cannot: `and` against `&`. */
```

### `&amp;` IS A THIRD SPELLING AND IT GOT PAST THIS RULE ONCE.

top level, before `k`

```
/* `&amp;` IS A THIRD SPELLING AND IT GOT PAST THIS RULE ONCE. A topic written into an
       insert script as an HTML entity is a different string from the same topic written with a
       bare ampersand, so it is a second button for one topic exactly as `and` is -- and this
       rule, which exists to catch that, folded only the bare form. Caught on the KS2 2019
       transcription, where one row said `Multiplying &amp; Dividing Fractions` beside 22 rows
       saying `Multiplying & Dividing Fractions`. Entities are unescaped BEFORE the fold. */
```

### ---------- THE SAME PAPER, TRANSCRIBED TWICE

top level, before `seriesOf`

```
/* ---------- THE SAME PAPER, TRANSCRIBED TWICE ------------------------------------------------------
   This file had no idea what a real-world exam paper IS, only what a row is, so the ids being
   unique was the whole of its protection. That is not enough: the June 2024 Higher papers were
   already in here under `RS…` ids, and a session that listed `paper_id` prefixes, saw no
   `P-1MA1-24…`, and went off to transcribe Paper 1 again produced 33 fresh rows with fresh ids
   and no complaint from anything. A duplicate paper is worse than a duplicate row, because a
   duplicate row at least LOOKS wrong in the funnel; two copies of a paper just make the library
   bigger and every search return each question twice.

   So the key is what identifies a SITTING: subject, board, year, series, paper number and tier.
   Two details matter.

   THE MONTH IS COLLAPSED TO A SERIES, because the same sitting is dated both ways in here — the
   2024 Higher Paper 1 sat on 16 May and is filed under month 6, and the duplicate was filed under
   month 5. Comparing months exactly would have let the pair through, which is precisely the
   `waveOf` problem `find.js` already solves for the funnel: two spellings of one sitting.

   ONLY PAPERS THAT HAVE QUESTIONS COUNT. Most `kind: 'paper'` rows are documents with nothing
   under them yet — a link and a page count — and a document row sitting beside the transcription
   of the same paper is the normal, intended state. Seventeen of those pairs exist right now and
   not one is a fault.

   AND A QUALIFICATION MAY NUMBER TWO PAPERS THE SAME, WHICH IS WHAT `spec_code` SETTLES. The key
   has no column that can tell two papers apart when the qualification itself gives them one
   number: Edexcel A-level Maths sits Paper 31 (Statistics) and Paper 32 (Mechanics) on one
   afternoon and both carry `paper: 3`, and AQA Combined Science: Trilogy is SIX papers — Biology,
   Chemistry and Physics, each sat twice — so 8464/B/1H and 8464/C/1H are both Combined Science,
   AQA, 2024, summer, paper 1, Higher. The first of those was carried in `ACCEPTED_TWICE` with a
   written reason, which was the right holding answer for one pair and would have needed four more
   entries the moment a trilogy arrived. **That is this repository's own sentence about `cost: 0`
   and `paper: true`: a fault repaired in the instance and not in the rule comes back.**

   So the exemption is gone and the CODE PRINTED ON THE PAPER decides. A collision is not a
   duplicate when every paper in it carries a `spec_code` and they are all different — `9MA0-31`
   against `9MA0-32`, `8464/B/1H` against `8464/C/1H`. It is exactly as strict as before
   everywhere else: 599 of the 691 document rows carry no code at all, and two transcriptions of
   ONE paper carry the same code or none, so the case this rule was written for (June 2024 Higher
   Paper 1, transcribed twice under two id schemes) still fires. Proved by mutation in both
   directions. */
```

### ---------- THE SAME DOCUMENT, TRANSCRIBED TWICE — AND THIS IS THE STRONGER TEST

top level, before `driveId`

```
/* ---------- THE SAME DOCUMENT, TRANSCRIBED TWICE — AND THIS IS THE STRONGER TEST -------------------
   THE SITTING KEY ABOVE CANNOT SEE A WORKSHEET. It is built from subject, board, year, series,
   paper number and tier, and a Corbettmaths or 1st Class Maths sheet has none of those — so five
   sets sat in the library, three of them a SECOND transcription of a PDF that was already in here,
   past every check in the suite. Found by noticing that five of the sixty-nine `W-CBM-` sets carry
   a `source_url` and the other sixty-four do not: the URL is the 1st Class Maths tell, because that
   publisher's sheets are Drive files and Corbettmaths' are not.

   AND THE URLS WERE IDENTICAL — the same Drive file id, character for character. `W-CBM-reflections`
   (9 parts, terse) and `W-1CM-reflections` (15 parts, carrying the sheet's own title) are one PDF
   read twice, at different granularity, by two different sessions. Nothing about the text matched,
   which is why comparing questions said "different worksheets" and was wrong: the questions ARE
   different, because the two transcriptions disagree about where a question ends.

   SO THE DOCUMENT IS THE THING, AND ITS URL IS ITS IDENTITY. A `source_url` is a file somewhere;
   two `paper_id`s pointing at one file is one document entered twice, whatever either is called and
   whatever the rows under them say. It needs no vocabulary, no id convention and no knowledge of
   what an exam is, which is what makes it the test the sitting key should have been.

   COMPARED ON THE DRIVE ID, NOT THE URL. The same file is written both `drive.google.com/file/d/<id>/view`
   and `drive.google.com/open?id=<id>&usp=drive_copy` in this very library, on rows of the same set —
   two spellings of one address, which is the `waveOf` fault in a third column.

   TWO PAPERS WITH QUESTIONS IS A FAILURE; A STUB BESIDE A TRANSCRIPTION IS A NOTE. Twenty-five of
   the twenty-eight pairs are an empty `R0xxx` document row — a link and a page count, no questions —
   sitting beside the real transcription of that paper. That is the normal, intended state and the
   sitting key above already says so in its own words. What cannot be normal is the same file read
   into questions twice. */
```

### A 5-A-DAY BOOK IS ONE FILE HOLDING A MONTH OF DOCUMENTS.

top level, before `preLetter_`

```
/* A 5-A-DAY BOOK IS ONE FILE HOLDING A MONTH OF DOCUMENTS. Corbettmaths prints a month of days in
     one PDF and a day is the thing somebody sits, so thirty-one `paper_id`s on one file is the book
     being read ONCE, a page per day — not the same paper entered twice. Exempt only when every paper
     on the file is a 5-a-day, so a real duplicate sitting beside one still fires. */
```

### ---------- A PREAMBLE THAT NOTHING SITS UNDER

top level, before `preLetter_`

```
/* ---------- A PREAMBLE THAT NOTHING SITS UNDER ------------------------------------------------------
   A `kind: 'stem'` ROW IS A PARAGRAPH SEVERAL QUESTIONS HANG FROM, and its scope is read off the
   columns it carries — see `preamble_` in find.js. Three things can go wrong with that and none of
   them throws:

   AN ORPHAN. A stem naming a question number that has no parts is a paragraph nothing will ever
   draw. It reads as content in the file and is content nowhere, which is the `dropdowns.checklists`
   fault in miniature: a builder producing nothing from nothing, silently, for as long as nobody
   looks.

   A STEM THAT CLAIMS MARKS. A preamble is scene-setting; the marks are on the parts. One carrying
   a mark count would be double-counted by the 80-mark rule above, and that rule is the only
   end-to-end check this library has.

   AND A PART WHOSE SCENE IS MISSING is NOT reported, deliberately. 3,976 of the 4,005 parts carry
   their preamble inside their own `html` because that is how they were transcribed, and a check
   that fires on all of them says nothing anybody can act on. The model is thinly populated on
   purpose — filling it in is editorial work on rows that already exist. */
```

### ---------- SEVERAL PREAMBLES IN ONE SCOPE, AND NO ORDER BETWEEN THEM

top level, before `preLetter_`

```
/* ---------- SEVERAL PREAMBLES IN ONE SCOPE, AND NO ORDER BETWEEN THEM -------------------------------
   AN INSERT IS A LIST NOW — see `stemIndex_` in find.js, and the measurement that prompted it:
   three rows in one scope went in and ONE came out, silently, because the index held a row per
   scope rather than a list. That is fixed, and the fix introduced a way to be wrong that did not
   exist before: two rows in one scope with nothing saying which comes first.

   THE ORDER IS THE CONTENT. "Lines 1-6" printed under "Lines 20 to the end" is not untidy, it is
   the source in the wrong order, and a student reading it would have no way to tell. `sort_order`
   is what declares it, so a scope holding several rows where two share an order — or where any
   lacks one — is a paper whose insert reads differently depending on the order the file happens
   to be in. Proved by mutation, both directions. */
```

### ---------- A PAPER WITH NO QUESTIONS AT ALL IS ONE BEING BUILT

top level, before `L`

```
/* ---------- A PAPER WITH NO QUESTIONS AT ALL IS ONE BEING BUILT --------------------------------
     THE INSERT CAN ARRIVE BEFORE THE QUESTIONS DO, and on AQA English it usually will: the source
     is a separate booklet, so somebody holding the insert and not the question paper has exactly
     half of a real paper and should be able to put that half in. Failing them for it would mean
     the only way to add an insert is to invent the questions that point at it — which is the one
     outcome this whole file exists to prevent.

     SO THE RULE IS ABOUT A SCOPE THAT MISSED, not about a paper that is unfinished. A stem under a
     paper that HAS parts and matches none of them is a paragraph nothing will ever draw. A stem
     under a paper with no parts yet is the backlog, and the backlog is already counted below —
     440 document rows are in exactly that state. */
```

### ---------- A PREAMBLE'S `part` IS ONE LETTER, OR NOTHING

top level, before `L`

```
/* ---------- A PREAMBLE'S `part` IS ONE LETTER, OR NOTHING ------------------------------------
     THE "(d)" OPENING (`stemLetter_` in find.js, the multi-part audit's finding 6): a preamble whose
     `part` is a letter is the opening of that letter's parts, drawn once before (d)(i). Anything
     else in the column -- "d(i)", "2" -- the app reads as no letter and draws in front of the whole
     question, which is not what whoever typed it meant. And a letter needs a question to stand in
     and a part of that letter to stand in front of, or it is a paragraph on no screen. */
```

### ---------- THE DATE A PAPER WAS SAT, AND THE TWO WAYS IT CAN LIE

top level, before `m`

```
/* ---------- THE DATE A PAPER WAS SAT, AND THE TWO WAYS IT CAN LIE --------------------------------
   `exam_date` IS HOW A PERSON NAMES A PAPER. "Thursday 25 May 2017, Paper 1 Higher" is what a tutor
   and a student both say out loud, and the library held `year` and `month` and nothing finer — so
   the one identifier everybody actually uses was the one that could not be matched on.

   IT IS ALSO WHERE THE 2021 ANSWER GOES. Edexcel took the date off the front page in 2021 and two
   ©2021 sets of Higher papers sit unidentified because of it; CLAUDE.md records that the empty
   document rows' `source_url`s carry the real dates (`1MA1_1H_que_20211103.pdf`). There was nowhere
   to put that answer once somebody worked it out. There is now.

   TWO RULES, AND THE SECOND IS THE ONE WORTH HAVING. A date that is not a date is obvious and
   caught at once. A date that disagrees with the `year` and `month` already on the row is not: both
   halves read perfectly, the funnel files the paper by one of them and the person searching uses
   the other, and nothing anywhere says they are different. Same shape as the two spellings of a
   sitting, one column further in. */
```

### ---------- AND A THIRD, WHICH IS THE ONLY ONE THAT CATCHES THE WRONG DATE

top level, before `DAY`

```
/* ---------- AND A THIRD, WHICH IS THE ONLY ONE THAT CATCHES THE WRONG DATE -------------------
     NOBODY SITS A GCSE ON A SATURDAY. The two rules above compare `exam_date` against columns
     that were filled in by the same person in the same sitting, so a date that is simply WRONG —
     a day out, or a publication date mistaken for an exam date — agrees with both of them and
     sails past.

     THIS IS NOT HYPOTHETICAL AND IT NEARLY HAPPENED HERE. 41 documents carry a `source_url` with a
     full date in the filename (`1MA1_1H_que_20211103.pdf`), which looked like 41 free exam dates
     waiting to be copied across. **Eight of the 41 land on a Saturday** — `P-1MA1-2306-1H` on
     2023-05-20, four November Paper 2s, and the 2022 and 2023 summer Paper 1s. So that slug is the
     date the FILE was published at least some of the time, and there is no way to tell from here
     which of the other 33 are exam dates and which are not. Bulk-filling from it would have put a
     confident wrong day on a third of the library.

     A WEEKEND IS THE ONE HALF A CHECKER CAN SETTLE without knowing the timetable. It cannot tell a
     Tuesday that is wrong from a Tuesday that is right — only a person holding the paper can — but
     it is enough to refuse the whole class of mistake that produced those eight. */
```

### ---------- AN ADDRESS THAT IS NOT AN ADDRESS

top level, before `pic`

```
/* ---------- AN ADDRESS THAT IS NOT AN ADDRESS ------------------------------------------------------
   `images` IS A COMMA-SEPARATED LIST OF PLACES A PICTURE IS, and the one way it fails silently is a
   value that is not a place: a filename with no folder, a Drive *page* rather than a Drive file, a
   path copied off somebody's desktop. None of those throw — the browser asks, gets nothing, and the
   question is served with a broken picture where its prompt should be, which on AQA Paper 1
   Question 5 is the whole question.

   TWO SHAPES ARE ADDRESSES: `http(s)://…`, and a `data:image/…` URI for a picture committed into the
   row itself. Anything else is refused here rather than at the end of a wire.

   `drive.google.com/file/d/<id>` IS NAMED SEPARATELY because this repository has already paid for
   that distinction once: a Drive FILE page is HTML, not an image, so it renders as nothing in an
   `<img>`. The same spelling trap as the `.xlsx` ids in `check-tabs.js`. */
```

### ---------- A PICTURE THIS SITE DREW MUST SAY SO

top level, before `DIAGRAM_BY`

```
/* ---------- A PICTURE THIS SITE DREW MUST SAY SO ---------------------------------------------------
   SIX QUESTIONS IN THE CORBETTMATHS MONEY SHEET HAD NO ANSWER IN THEM. "Natalie has these coins.
   How much money does Natalie have?" — and no coins: the data was entirely in an image and a
   transcription is a text layer. corbettmaths.com is blocked from the agent's environment by the
   same policy that blocks every Google host, so the real coins cannot be recovered; the set that is
   drawn now is ours, and so is the answer.

   `diagram_by` IS A DISCLOSURE FIELD AND IT IS CLOSED. Absent means the picture came off the paper.
   Anything else is a spelling nobody has agreed, and it would go straight onto a card under a credit
   line that would then be wrong — which is worse than no credit at all. Same argument as `VOCAB`,
   one column over.

   AND THERE ARE TWO WAYS THIS SITE CAN HAVE DRAWN ONE, WHICH IS A DIFFERENCE THE CARD HAS TO SAY.
   `family` is a picture REDRAWN from what the paper prints — the square ABCD, the box-plot grid, the
   probability scale. The drawing is ours and the question, the figures and the answer are still the
   board's. `family-set` is a picture whose CONTENT we chose, because the original was lost and the
   question could not be answered without one: the six Corbettmaths money questions above, where
   choosing the coins chose the answer.

   ONE VALUE FOR BOTH WAS A REAL FAULT AND A SCREENSHOT CAUGHT IT. `figCredit_` was written for the
   coins and said "these are our coins and our answer" — true of six rows, and printed under thirty
   others where the drawing is faithful and the answer is Edexcel's. A credit line that overclaims
   is not a smaller problem than one that underclaims: it tells a student the figures in front of
   them were made up. Same shape as every sentence in this repository that was true when it was
   written and stopped being true when the data under it grew.

   AND A PICTURE CANNOT BE CREDITED IF THERE IS NO PICTURE. A `diagram_by` on a row with no
   `diagram` is a claim about nothing, and it is exactly what a half-finished edit leaves behind. */
```

### ---------- WHERE A ROW'S FIGURE STANDS: `<!--fig-->`

top level, before `FIG_MARK`

```
/* ---------- WHERE A ROW'S FIGURE STANDS: `<!--fig-->` ----------------------------------------------
   ASKED FOR AS *"a question which begins with text, then diagram, then text then diagram then text.
   This should break into 5 widgets ... same order but diagram has its own widget."* A row has one
   figure and some words, and nothing said where among the words the paper prints it -- so the data
   says, with the literal comment `<!--fig-->` between two top-level blocks of `html`. `figBlocks_` in
   find.js reads it and the pages are cut on either side (`stemPlan_`, `partPlan_`).

   THE CONVENTION IS HELD HERE, AT THE FILE, because a misplaced marker draws as nothing at all -- an
   HTML comment is invisible by design, which is why it was chosen -- and so the only sign of one in
   the wrong place is a figure in the wrong place:
     ONLY IN `html`.         `lead` is one block by definition and the other columns are not read for it.
     ONE PER ROW.            A row has one figure; a second marker is a second figure that does not exist.
     ON A ROW WITH A FIGURE. A `diagram`, `images`, or -- a question answered by drawing -- the surface
                             the pen is given. A marker anywhere else places nothing.
     AT THE TOP LEVEL.       Between two blocks, never inside a paragraph, a table or a list: the app
                             stands a figure found inside a block AFTER that block rather than cut it,
                             so the data would be saying one place and the page showing another.
   And it prints how many rows carry one: the data workflow is putting them in, and a count is how
   anybody knows it has. */
```

### ---------- WHAT IS STILL STANDING IN FOR SOMETHING

top level, before `standingIn`

```
/* ---------- WHAT IS STILL STANDING IN FOR SOMETHING ------------------------------------------------
   `placeholder` MARKS A ROW WHOSE CONTENT IS A DESCRIPTION OF THE REAL THING. The AQA English
   inserts are the first: the sources are a separate booklet and third-party copyright, so they are
   not in the paper and cannot be reproduced here — what is in the row is enough to teach around and
   is explicitly not the text.

   IT IS A LIST, NOT A FAILURE. A placeholder is a decision somebody made on purpose and a job
   somebody means to finish; a build that refuses it would just mean nobody marks anything. Printed,
   counted, and named, so the list of what is outstanding is read off the data rather than
   remembered. Same argument as the questions the transcriber could not recover. */
```

### ---------- WHAT THE TRANSCRIBER COULD NOT RECOVER

top level, before `flagged`

```
/* ---------- WHAT THE TRANSCRIBER COULD NOT RECOVER -------------------------------------------------
   `examiner_note` is where somebody transcribing a paper wrote down that a question did not come
   across — a diagram the PDF had no text for, or maths the text layer had flattened past reading.
   These are real questions being taught in a broken state, and nothing surfaced them until now.
   Reported rather than failed: it is editorial work on a handful of rows, not a build error. */
```

### THE OTHER THREE LIBRARY FILES, WHICH ARE MID-MIGRATION.

top level, before `EXTRA_FILES`

```
/* ==================================================================================================
   THE OTHER THREE LIBRARY FILES, WHICH ARE MID-MIGRATION.

   `data/boxers.json`, `data/fights.json` and `data/cheatsheet.json` are the next three tabs out of
   the spreadsheet — see the header of `js/library.js` for why they qualify and why the move is two
   steps. They ship EMPTY, with the payload still supplying those keys, because the rows live in a
   Google sheet that the agent environment cannot reach.

   TWO THINGS ARE WORTH CHECKING AND THEY ARE DIFFERENT SEVERITIES. The SHAPE is a rule: whatever
   ends up in the file must be a JSON array with one object per line, or the next script to append
   to it by splitting on newlines corrupts it — the same rule, for the same reason, as the one this
   file already applies to `questions.json`. Whether the migration is FINISHED is a note: the moment
   a file has rows in it, `doget.gs` is still walking the same tab and shipping it to every phone
   for nobody, and that is when the block should go. Nothing can work that out except by holding the
   two facts side by side, so it is printed rather than remembered. */
```

### ---------- A BOXER'S PHOTO CARRIES ITS CREDIT, AND HIS RECORD ADDS UP

top level, before `boxers`

```
/* ---------- A BOXER'S PHOTO CARRIES ITS CREDIT, AND HIS RECORD ADDS UP ------------------------------
   ASKED FOR AS "maybe add image of each boxer". The pictures are Wikimedia Commons files, and a
   Commons file is free on a CONDITION — its author and licence named wherever it is shown. So a row
   with an `image` and no `image_credit` is not a small gap, it is a licence broken on every phone
   that opens the card. `boxerPicSrc_` in find.js refuses to draw such a photo already; this refuses
   the ROW, so it is caught here before it ships rather than quietly hidden after.

   `https` ONLY, because the site is, and a plain-http picture is blocked as mixed content — a broken
   box by another route. A credit with no image is printed as a note: harmless, and probably a photo
   somebody meant to add.

   AND THE RECORD'S PARTS CANNOT EXCEED ITS WHOLE: KOs among the wins no more than the wins, KO losses
   no more than the losses. The card prints a KO rate off those two cells, and 38 KOs in 37 wins is a
   KO rate over a hundred per cent on a fighter's own page. A BLANK IS NOT CHECKED — blank means not
   on file, which the card says in words. */
```

### ---------- A CC LICENCE NEEDS ITS LINK, AND ONLY A COMMONS FILE HAS ONE TO GIVE

top level, before `findSrc`

```
/* ---------- A CC LICENCE NEEDS ITS LINK, AND ONLY A COMMONS FILE HAS ONE TO GIVE ---------------
       CC BY AND CC BY-SA ASK FOR MORE THAN A NAME: the credit has to point at where the work and its
       licence can be read. The card makes the credit that link — the Commons file page, named from
       the picture's own `upload.wikimedia.org/wikipedia/commons/` address (`boxerCredit_`). A
       picture held anywhere else has no such page, so its credit would be words with nowhere to go:
       a licence broken on every phone, which is the photo-without-credit fault by another route.
       Public domain and a photo the owner took need no link, so they are not asked for one. */
```

### ---------- THE EDITOR'S TO-DO, LISTED

top level, before `findSrc`

```
/* ---------- THE EDITOR'S TO-DO, LISTED -----------------------------------------------------------
       A `notes` cell that says check or checking is the researchers' to-do, and the card no longer
       prints it (`boxerNote_` in find.js) — five of them were under public records, saying the site
       doubted its own numbers. Kept off the card is not the same as done, so they are listed here,
       every run, until somebody checks the thing and clears the cell. Printed, not failed: a record
       waiting for a check is the backlog, not a fault. */
```

### ---------- A BOXER'S LOOK AND A FIGHT'S TRUNKS USE THE FIGURE'S WORDS, AND SAY WHERE THEY CAME FROM

top level, before `findSrc`

```
/* ---------- A BOXER'S LOOK AND A FIGHT'S TRUNKS USE THE FIGURE'S WORDS, AND SAY WHERE THEY CAME FROM ----
   THE OWNER, 10 Oct: *"make the boxers retro avatar actually look more like the boxers and their
   shorts in the fight."* So data/boxers.json carries `look_skin`, `look_hair`, `look_hair_colour`,
   `look_facial` and `trunks_usual`, and data/fights.json `trunks_a` and `trunks_b`, and the eight-bit
   fighter on every card is drawn from them (`boxerFigure_` in find.js).

   A WORD THE FIGURE DOES NOT KNOW DRAWS NOTHING, SILENTLY. "whte/black" is not half a pair of trunks
   to the renderer, it is a blank — the corner's colour — and a fight with its trunks misspelt looks
   exactly like a fight nobody researched. So every cell is held to the vocabulary, which is NOT
   written out again here: it is `BOXER_LOOK`, cut out of find.js, the same list the figure draws
   from, so the two cannot disagree. Exact words in lower case; a trunks cell is `<main>` or
   `<main>/<trim>` with the trim a different colour.

   EVERY FILLED CELL HAS A SOURCE IN ITS ROW — `look_source` on a boxer, `trunks_source` on a fight —
   because a likeness is a claim about a real man and the owner has to be able to check any of them.
   A look column the figure does not read (`look_skn`) is refused too: a misspelt column is a look
   nobody will ever draw.

   AND THE SOURCE MAY NOT CLAIM MORE THAN IT SAW. The first research labelled every skin, hair and
   beard "medium" in the same sentence that said they were judged from memory and no photograph was
   opened, and this check took that sentence as the source it asks for. The brief was skin chosen
   from photographs of the man, by eye. So each filled look cell must be labelled in `look_source`'s
   "Confidence:" clause — `skin unverified`, `hair high` — and HIGH OR MEDIUM ON SKIN, HAIR, HAIR
   COLOUR OR FACIAL HAIR NEEDS THE PHOTOGRAPH IT WAS CHECKED AGAINST, written `photo checked: <url>`;
   a source that says "from memory" can label them nothing but unverified. */
```

### ---------- AND EVERY WORD HAS SOMETHING TO DRAW

top level, before `shapes`

```
/* ---------- AND EVERY WORD HAS SOMETHING TO DRAW ---------------------------------------------------
       A WORD IN THE LIST WITH NO SHAPE OR NO COLOUR passes the rule below and draws a blank's part
       all the same: a hair style missing from `BOXER_HAIR` throws nothing, and a trunks colour with no
       `--bf-tk-*` on `.boxer-ring` leaves the custom property pointing at nothing, which the stylesheet
       then paints as the corner's muted colour. So the list is held against the shapes in find.js and the
       colours in style.css, word for word. */
```

### ---------- THE LEGO SETS: A CATALOGUE SHAPED LIKE THE SHOP, WAITING TO BE STOCKED

top level, before `f`

```
/* ---------- THE LEGO SETS: A CATALOGUE SHAPED LIKE THE SHOP, WAITING TO BE STOCKED ------------------
   ASKED FOR AS "just database the lego sets ... include rough price ... maybe ill have these items as
   items in the shop". `data/lego-sets.json` is one row per set, carrying EVERY column of the shop tab
   (`SCHEMA.shop` in constants.gs) so a row can be pasted into the Ledger's shop tab as it stands, plus
   the facts about the set a shop row has no column for: its number, theme, year, pieces, age, and the
   RRP and a street price seen on a named date. `active` is false on every row, because nothing is for
   sale until the owner decides the price and has one to sell.
   NOTHING READS IT YET, and that is deliberate rather than the "written and never read" fault: it is a
   catalogue, not a feature. What is checked is what would make the paste go wrong: the file's shape,
   every shop column present, one id per set built from its number, and whole-pence prices. */
```

### ---------- AND THE OWNER'S NEW ITEMS, WAITING TO BE PASTED

top level, before `addF`

```
/* ---------- AND THE OWNER'S NEW ITEMS, WAITING TO BE PASTED -------------------------------------
     ASKED FOR ACROSS NINE NOTES — "add hour glass to list of items", "gooey louis add this gae to
     item", "Goggles resealable packets. Chemicals add this stuff to items" and six more — and
     answered "For sale". The shop tab lives in the Ledger and NOTHING IN THIS REPOSITORY WRITES IT,
     so the rows ship the way the LEGO sets did: `data/shop-additions.json`, one object per row with
     every `SCHEMA.shop` column, and `data/shop-additions.csv` beside it in the tab's column order,
     ready to paste. `data/settings/shop.json` is a stale export nothing reads, which is why it is
     not where they went — and why it is still the right list to ask "is this id taken".

     WHAT WOULD MAKE THE PASTE GO WRONG, AND ONE THING THAT WOULD MAKE IT DISHONEST:
       · a column missing, which shifts every cell after it;
       · an id used twice, or one the shop already has — the practicals' `item_ids` join on it;
       · I045, which the practicals already name for the cones the shop never stocked;
       · the CSV saying something the JSON does not;
       · A PRICE. Nobody told this repository what a sand timer costs, and a number typed here
         would be read by every phone as the business's price. Blank is what makes the card say
         "not priced yet" — the owner fills the cells after pasting. */
```

### ---------- A SIMPLEST-FORM QUESTION MUST NOT HAVE A FRACTION FOR AN ANSWER

top level, before `BARE_FRACTION`

```
/* ---------- A SIMPLEST-FORM QUESTION MUST NOT HAVE A FRACTION FOR AN ANSWER -----------------------
   `markAnswer_` compares two fractions BY VALUE, because "or equivalent" is what a mark scheme
   actually says and a child who writes 15/20 before cancelling has not made a mistake. That is
   right everywhere in this library and it would be wrong in exactly one place: a question that
   asks for the simplest form, where the unsimplified fraction is the QUESTION and accepting it
   back marks a non-answer right.

   There is no such row today -- 83 answers are a bare fraction and none of them asks for the
   simplest form, which is what made the value fold safe to write. This is here so that the first
   one fails the build instead of quietly turning the marking wrong, and the fix when it does is to
   leave `accept` off that row: a person marks it, which is what `set-accept.py` already does for
   everything it cannot be sure about. */
```

### ---------- A TAPPED ANSWER MUST BE ONE OF THE TAPS

top level, before `choiceRows`

```
/* ---------- A TAPPED ANSWER MUST BE ONE OF THE TAPS ---------------------------------------------------
   `choices` makes the app draw buttons instead of a box, and `choice_right` names the positions the
   mark scheme credits. A position past the end, or `choice_right` on a row with no options, is a
   question NOBODY can get right, which is the worse of the two marking failures. One option is not a
   choice. Written by tools/set-choices.py, which asserts the same; this holds the file to it. */
```

### ---------- AN ORDERING IS ITS ITEMS, THE ORDERS THAT ARE RIGHT, AND ITS TWO ENDS

top level, before `orderRows`

```
/* ---------- AN ORDERING IS ITS ITEMS, THE ORDERS THAT ARE RIGHT, AND ITS TWO ENDS --------------------
   `answer_type: order` draws the items as buttons tapped into numbered slots and marks the ORDER
   (`orderBox_`, `markOrder_`). Four things make one that nobody can get right, or that marks wrong:

     fewer than two items       there is nothing to put in order
     an order that is not each  `choice_right` names the places, first place first; an order with an
     item exactly once          item missing, twice, or past the end is an order nobody can tap
     not two ends               the strip's "smallest" ... "largest" is what says which way it reads,
                                and a box with no ends is the question asked without its direction
     an `accept`                `markParts_` reads a typed list as a SET, so it would mark any order of
                                the right items right -- 045's "an ordering has no accept"

   And the other way: `order_ends` on a row that is not an ordering is a column nothing draws. */
```

### ---------- AND THE ORDER IT LISTS IS THE RIGHT ONE

top level, before `ORD_SEP`

```
/* ---------- AND THE ORDER IT LISTS IS THE RIGHT ONE ---------------------------------------------------
   THE RULE ABOVE ASKS ONLY FOR THE SHAPE: two items or more, each order every place once, two ends,
   no accept. A WRONG order that uses every place once passes it, and so does everything else here --
   proved in a scratch copy: `Q-CBM-ordering-decimals-3`'s "4,5,3,2,1" changed to "5,4,3,2,1", which
   puts 5.1 before 5.08 and contradicts the row's own answer, and check-library, check-marking,
   check-answers, check-typeset and check-funnel all exited 0. `check-marking.js`'s sweep only asks
   whether each listed order marks right against ITSELF. So the 67 conversions rested on one solve
   made once, in a scratch file -- and the same batch found three answers that were already wrong
   (0701-5, 0706-4, ordering-decimals-7).

   TWO QUESTIONS, EACH ASKED OF SOMETHING WRITTEN APART FROM `choice_right`:

   THE ANSWER. The first `<b>` of `answer` is the list a person reads under "Show the answer", and it
   must name the items in one of the orders `choice_right` lists -- item for item, compared as text
   (tags and spaces out, a thousands comma closed up, so "15,123" is one item and not two), split on
   the commas or arrows the list is written with. Reordering `choices` without `choice_right`,
   changing an order, or swapping the ends without the answer all fail it -- and it would have caught
   the 0701-5 and 0706-4 answers that were fixed by hand.

   THE NUMBERS. Where every item reads as a number -- a decimal, a minus sign, a fraction, a percentage,
   pounds and pence, a power, a root, standard form, a recurring decimal, a Roman numeral, or one unit
   of length, mass, volume or temperature -- each listed order must RUN the way `order_ends` says:
   up from "smallest", "lowest", "shortest", "lightest"; down from "largest", "highest", "greatest".
   And where two items are EQUAL, the order with those two swapped must be listed too, because both are
   right and an order left out is a right answer marked wrong. Words, names and mixed time units
   ("1 month" against "35 days") are not read; the answer rule above is what guards those. */
```

### "EDEXCEL GCSE MATHS PAPERS CHECKED AT 80 MARKS" WAS TRUE WHEN IT WAS WRITTEN AND IS NOT NOW.

top level, before `MARKS`

```
/* "EDEXCEL GCSE MATHS PAPERS CHECKED AT 80 MARKS" WAS TRUE WHEN IT WAS WRITTEN AND IS NOT NOW.
   `marks.size` is every paper summed against a declared total, whoever set it — the whole point of
   `total_marks` was to stop this rule knowing about one board. It stayed readable while the only
   papers with a total were Edexcel maths at 80, and the first AQA physics paper transcribed against
   its own 100 made the sentence plainly false. Fourth time this repository records the shape: "all
   18 checks pass", "one of the eighteen names", and the prose over `CARD_W` naming 88% and 4% while
   the code said 80 and 8. The sentence says what the number IS now, which is the only version that
   cannot go stale. */
```

### ---------- AN `accept` THAT CANNOT MARK ITS OWN ANSWER

top level, before `MARKS`

```
/* ---------- AN `accept` THAT CANNOT MARK ITS OWN ANSWER -------------------------------------------
   THE MARKING IS THE ONE THING IN THIS APP THAT TELLS A CHILD THEY ARE WRONG, and `check-marking.js`
   proves the six functions behave on thirty-five hand-written cases. What nothing asked is whether
   the 1,399 `accept` CELLS in the library can be marked by them.

   ONE QUESTION, AND IT HAS EXACTLY ONE RIGHT ANSWER: type the first thing the cell itself lists as
   acceptable -- does it come back right? A cell that cannot pass that is a cell that marks nobody
   right, ever, however carefully the child answered.

   IT FOUND ONE, AND IT IS THE WORST SHAPE THIS FILE RECORDS. `Q-CBM-inequality-signs-6` asks for
   four comparison symbols and its `accept` was `< > < >`; `markNorm_` keeps letters and digits
   only, so both sides reduce to nothing, `markAnswer_` reads that as "nothing typed" and answers
   `null` -- **Not yet, for ever, to a child who had it exactly right**. The cell is empty now and
   the row says why: an accept a question cannot be marked by is worse than none.

   IT IS A FAILURE RATHER THAN A COUNT because the number is zero and there is no backlog to swamp
   it, which is the same argument the practicals' fold rule makes. */
```

### ---------- A TICK BOX HAS ONE RIGHT OPTION AND THE PAPER PRINTS THE OTHERS

top level, before `TICK`

```
/* ---------- A TICK BOX HAS ONE RIGHT OPTION AND THE PAPER PRINTS THE OTHERS --------------------
     A MULTIPLE-CHOICE QUESTION IS THE ONE PLACE THE WRONG ANSWERS ARE WRITTEN DOWN, so it is the
     one place a checker can prove an `accept` is not too generous. The rule above asks whether a
     cell can mark its own answer right; this asks whether it marks anything ELSE right, and a cell
     that lets two of the four printed options through is a question with two right answers.

     IT WOULD HAVE FIRED ON A REAL DRAFT. Chemistry 8462/1F 03.8 prints four options that differ in
     two halves -- energy in or out, endothermic or exothermic -- and an `accept` of the bare word
     `endothermic`, which is the obvious short form to reach for, marks two of them right.

     NARROWED TO WHAT PRINTS "TICK ONE BOX", and that narrowing is the `check-rows.js` lesson. The
     general form -- any row with an `accept` and a bulleted list -- reports two rows across the
     library and both are wrong: Q-1MA1-1706-1F-7 bullets Fahima's shopping and
     Q-AQA-8464B-2406-2H-053 bullets the two things sewage affected. Neither is a set of options.
     Nothing can tell a bullet list from an option list; the paper's own instruction can. */
```

### ---------- A QUESTION THAT ASKS FOR THE UNITS DOES NOT ACCEPT A BARE NUMBER

top level, before `UNITS_ASKED`

```
/* ---------- A QUESTION THAT ASKS FOR THE UNITS DOES NOT ACCEPT A BARE NUMBER ---------------------
     THE MARKER LETS ANY UNIT THROUGH A BARE NUMBER, on purpose: a unit the child types is checked
     only against a way with no unit or the same one, so where the cell lists `12` the unit is the
     sentence and not the answer. That is right where the paper prints the unit on the answer line,
     and wrong where the unit IS the question. Area of Shapes Q2 says "giving the units of your
     answer", prints none, and gives one of its two marks for them — and its cell led with a bare
     `12`, so `12 cm²` for a triangle measured in metres, the slip the question is there to catch,
     was marked Correct. Q1 the same with `60 m²`. The older rows that ask for units (5AD-F-0925-1,
     5AD-F-1029-3, area-of-squares-and-rectangles-12) never listed a bare number, which is the
     convention this holds every row to. */
```

### THE NOTE IS A COUNT OF BOTH, NEVER A SENTENCE.

top level, before `unitsAsked`

```
/* THE NOTE IS A COUNT OF BOTH, NEVER A SENTENCE. It said "none lists a bare number" whatever the
     rows said — on the old data it printed that under a FAILED run naming the two rows that did. A
     line that cannot change is not a measurement, and the one after a red is the one a person reads. */
```

### ---------- A ROOT OR π WITH A UNIT NAMES THE UNIT

top level, before `ROOTY`

```
/* ---------- A ROOT OR π WITH A UNIT NAMES THE UNIT ----------------------------------------------
     THE MARKER TAKES A UNIT OFF A ROOT OR π ONLY WHEN THE CELL NAMES ONE (`markAnswer_` in find.js).
     A bare `√3` beside `√3 cm` used to let any unit through — `√3 m` was Correct on exact-trig Q17,
     `15πcm³` on an area, `2√3 kg` on "simplify √12" — so now the unit typed after a surd has to be one
     the cell writes. That moves a duty onto the data: a surd or π answer to a question that HAS a
     unit must write it, or the right unit typed is refused. Four 5-a-day circles did not — `37.7 |
     12π` for a circle measured in metres, so `12π m` was "Not yet" — and nor did a tangent's
     `20√5 units`. The model answer says which rows have one: its value is printed with the unit
     (`37.7 m (3 s.f.)`, `48π cm²`), and that is what this reads. */
```

### ---------- A ROOT OR π ANSWER GETS THE KEY FOR IT

top level, before `kpSrc`

```
/* ---------- A ROOT OR π ANSWER GETS THE KEY FOR IT ----------------------------------------------
     `ansMaths_` (keypad.js) gives a calculation the maths keypad only when EVERY way in its cell is
     maths-shaped, so one way with letters in it sends the whole row to the phone keyboard — which has
     no √ key. The exact-trig sheet did that four times: `root3/2` beside `√3/2` (two letters in a row,
     before `markNorm_` learned to fold `root`), and `√3cm` beside `√3 cm` on Q17 (a unit glued to a
     root, which `kpMathsy_` could not cut off). Those four surds were the answers the √ key exists
     for, and the three rows beside them got the keypad. A row whose cell writes a root the keypad can
     type is a keypad row; the way that says otherwise is a spelling to take out — or a rule to fix.

     AND TAKING THE SPELLING OUT COST A RIGHT ANSWER. `√3cm` came out of Q17 for the keypad's sake and
     `√3cm` typed was then marked "Not yet", because the marker only took a unit off a bare NUMBER and
     a root is not one. Both halves were the same fault — a unit after a surd — and both are rules now
     (`MARK_NUM` in find.js, `KP_LEAD` in keypad.js), so `check-marking.js` holds the marking and this
     holds the keyboard.

     A ROOT IS READ AS THE MARKER READS IT: `markNorm_` first, so `10 root 2 cm` and `sqrt3` count.

     AND π IS THE KEY BESIDE IT. `15π cm²`, `48π cm²`, `64π cm²` and `400 − 50π cm²` were all on the
     phone keyboard — which has no π — because a unit after a multiple of π was not one the pad's cut
     could see, and a raised `²` was not one its end-of-answer strip could. Both are rules in keypad.js
     now, and this is what keeps them.

     AND ONE ROW BY NAME, because no rule above reaches it: June 2020 Higher Q12(a), an algebraic
     fraction whose cell was a lost superscript and a sentence. It reached the keypad only because the
     marker cut it at its first letter, lost it when the `x` fold made `3x2` into `3×2`, and has it
     again only because its cell is maths now. */
```

### ---------- A BAND IS A NUMBER, AND GETS THE KEYS FOR ONE

top level, before `bandRows`

```
/* ---------- A BAND IS A NUMBER, AND GETS THE KEYS FOR ONE ---------------------------------------
       `kpMathsy_` used to borrow `markBare_`'s cut — the first number, then anything — and `8.5 to
       8.9 cm` came out as `8.5`. When `markBare_` stopped cutting an expression to its coefficient
       (`6` was marked right for `6w² − 10w`), the keypad would have lost every band with it: 79 rows
       moved to the phone keyboard in the sweep, 59 of them a band like `3.0 to 3.8`, which is a
       reading off a scale and nothing but digits. The pad has its own cut now (`KP_LEAD`). This is
       what holds it: a row whose every way is a number or a band the marker reads (`markRange_`) is
       answered in numbers, and a calculation answered in numbers is a keypad row. */
```

### ---------- WHEN A FIGURE IS DRAWN, AND THE RULE IS THE OWNER'S

top level, before `PRE_AT`

```
/* ---------- WHEN A FIGURE IS DRAWN, AND THE RULE IS THE OWNER'S -----------------------------------
   IN THEIR WORDS: "only make diagrams when they are part of the question like in the paper."

   TWO TESTS, AND BOTH HAVE TO PASS. The paper has to PRINT it as part of the question -- nothing is
   invented to fill a gap, and a question that reads perfectly without a picture does not get one.
   And what it shows has to be determined by something other than the shape of the artwork: the
   question's own words, a table it plots, or a value the mark scheme quotes back.

   THE SECOND IS WHAT STOPS THE FIRST BEING A LICENCE. Figure 1 of Chemistry Paper 1 is printed as
   part of 01.1 and is NOT drawn, because the question is "give two conclusions from Figure 1" and
   the conclusions are the shape of a curve nobody can read off a raster image -- redrawing it by
   eye is the mistake this repository records where a cumulative-frequency curve read that way gave
   50 where the pixels said 48.1. Figure 10 two questions later IS drawn, because a tank, a lining,
   three rods, a mixture and a layer of aluminium are five facts the question already states.

   THE COUNT BELOW IS THE REST: printed, not failed, because repairing one needs the original paper
   open beside somebody. */
```

### ---------- A CARD IS NOT A PAGE

top level, before `PRE_AT`

```
/* ---------- A CARD IS NOT A PAGE -----------------------------------------------------------------
   A QUESTION THAT SAYS "USE FIGURE 10" OVER A CARD WITH NO FIGURE 10 ON IT IS NOT A QUESTION.
   That sentence is this repository's, written the day a transcribed exam question arrived as prose
   with its picture missing, and it is a DIFFERENT fault from the `figure` backlog above: that one
   counts rows whose picture never came across, and a row can be in it and still be perfectly
   answerable, because the words say what the picture showed. This counts rows that NAME a figure
   or a table by number and then neither draw it nor say what it shows — anywhere the card can
   reach, which is the row itself plus every preamble scoped to it.

   AQA IS WHY IT HAPPENS AND THE CAUSE IS THE FORMAT RATHER THAN THE TRANSCRIBER. A paper prints a
   figure once and then asks about it again two pages later, where the student turns back. There is
   nothing to turn back to here: `fillStuffPages` draws one question per card. So a description that
   is complete on 06.3 leaves 06.5 holding a reference to nothing, and the row reads perfectly in a
   diff.

   FOUND BY AUDITING THE FOUR 8464 PAPERS, one row of their 126 — `Q-AQA-8464C-2406-1H-065`, which
   asked for the half equation "at the negative electrode in Figure 10" over a bare card. Fixed by
   carrying the description on both rows from one string, because `preamble_` scopes to the paper,
   the section or the QUESTION, and question 6 opens with two parts about a reactivity series that
   have nothing to do with an electrolysis cell.

   PRINTED, NOT FAILED, which is the `figure` argument rather than laziness: repairing one needs the
   original paper open, and there are 71 of them across fifteen AQA papers that were transcribed
   before this was measured. What the number is for is the other direction — a paper going in
   tomorrow that adds to it. */
```

### EVERYTHING THE CARD SHOWS, which is the row plus the preambles `preamble_` would attach:

top level, before `shown`

```
/* EVERYTHING THE CARD SHOWS, which is the row plus the preambles `preamble_` would attach: the
     paper's own, its section's, and its question's. A narrower reading would report rows that are
     perfectly well served by the paragraph above them. */
```

### ---------- `note` WAS PUSHED TO AND NEVER PRINTED

top level, before `queued`

```
/* ---------- `note` WAS PUSHED TO AND NEVER PRINTED -----------------------------------------------
   CLAUDE.md STATES THIS FILE'S JOB OUTRIGHT: "`check-library.js` says when step 2 is due rather
   than leaving it to memory: once a file has rows AND `doget.gs` still builds that key, it prints
   that the block should go." It did not print it. `const note = []` was declared, `note.push(…)`
   was called, and nothing anywhere read the array — so the signal went into a list that was
   dropped on the floor every run.

   IT SURVIVED BECAUSE THE CONDITION HAD NEVER BEEN TRUE. All three files held `[]` from the day
   they were committed, so `body.length` was 0 and the push never happened; the first run that
   could have printed anything is the run after the export. A rule that cannot fire is a rule
   nobody finds out is broken, which is this repository's oldest shape and is recorded here about
   three checks that were never in the roster, a check that could not find its subject, and a
   `check/ui.js` rule that fired zero times on the fault it was written for.

   PRINTED, NOT FAILED, deliberately. Step 2 is a decision about a live backend and a deploy, not a
   thing a build should refuse over — the same footing as the transcriber's list above it. */
```

### ---------- AND A PAPER THAT DECLARES A TOTAL AND HAS NO QUESTIONS IS IN NEITHER COUNT

top level, before `queued`

```
/* ---------- AND A PAPER THAT DECLARES A TOTAL AND HAS NO QUESTIONS IS IN NEITHER COUNT ------------
   `marks` IS KEYED OFF QUESTION ROWS, so a `kind: 'document'` row carrying `total_marks` with
   nothing under it yet enters neither bucket — it is not "checked", because there is nothing to
   sum, and it is not "no total to check against", because it has one. Sixteen science papers went
   in as stubs across two sittings and both numbers stayed exactly where they were.

   THAT IS THE COUNT DOING ITS JOB AND HIDING SOMETHING AT THE SAME TIME, which is the shape this
   file records under `papers checked against a total` going 34 to 2 under a green tick, and under
   the practical that a substring called required. A stub with a total is not a fault and it is not
   nothing: it is the TRANSCRIPTION QUEUE, already carrying the one number that will refuse a wrong
   transcription the moment somebody starts typing one. Printed so it is a number rather than a
   silence — the argument this file makes about 485 missing figures and 2 compasses of 4,005. */
```

### TEN AND A REMAINDER, because eighty-seven lines on every run is a list nobody reads — which is the `ACCEPTED_TAP` argument pointed the other way:

top level, before `ANSWER_SPACE`

```
/* TEN AND A REMAINDER, because eighty-seven lines on every run is a list nobody reads — which is
   the `ACCEPTED_TAP` argument pointed the other way: that one prints in full BECAUSE it must not
   grow, and this one is meant to. The number is the thing to act on. */
```

### WITH A DENOMINATOR, because "1" is a number and "1 of 665" is a backlog.

top level, before `ANSWER_SPACE`

```
/* WITH A DENOMINATOR, because "1" is a number and "1 of 665" is a backlog. Same argument as the
   `total_marks` line three above it: what is uncovered has to be a figure somebody can act on
   rather than a silence. A date is read off the front page of the paper, so this moves only when
   somebody has one in front of them — see the weekend rule for why it is not derived. */
```

### ---------- A QUESTION WHOSE PICTURE NEVER CAME ACROSS

top level, before `ANSWER_SPACE`

```
/* ---------- A QUESTION WHOSE PICTURE NEVER CAME ACROSS ------------------------------------------
   REPORTED BY SOMEBODY TEACHING FROM THE PAPER: "this is what question 4 looks like but on the app
   it's just text." It was — `Q-1MA1-1705-1H-4` carried `figure: 'diagram'` and no `diagram`, so the
   square ABCD arrived as a sentence describing a square, which you can only sit an exam from if you
   already know what the square looked like.

   `figure` IS TWO COLUMNS UNDER ONE NAME and that is why this is a count rather than a rule.
   CLAUDE.md records it: `venn`, `scatter`, `pie-chart` mean the paper had a picture nobody
   transcribed, while `grid-blank`, `fractions`, `boxes`, `long-method` mean it had somewhere to
   WRITE THE ANSWER — and those questions are complete as they stand. A first renderer printed "not
   drawn yet" off this column and was wrong on about 120 questions. So the answer-space labels are
   named here and everything else is counted.

   PRINTED, NOT FAILED. It is editorial work needing the original paper open beside you, and drawing
   one from the row's own prose is how a wrong figure gets onto a card wearing the exam's authority —
   see tools/draw-1705-1h-more.py for the line between the two. A number is something somebody can
   act on; a silence is how 486 of them accumulated unnoticed. */
```

### ---------- A QUESTION WHOSE TABLE NEVER CAME ACROSS

top level, before `DRAWN_COLS`

```
/* ---------- A QUESTION WHOSE TABLE NEVER CAME ACROSS --------------------------------------------
   FOUND WHILE AUDITING ONE PAPER, BY AN INSTRUMENT THAT WAS WRONG FIRST. Asked whether June 2024
   Foundation Paper 1 was complete, I swept it for a row whose own words name a thing the card does
   not hold — and read `html` and `diagram` only. Q7 says "The table shows the number of hours that
   Lena and Pavel worked", and the sweep reported it as a gap: I was one edit from writing a
   `placeholder` stand-in over a table that is CORRECT and checks against its own mark scheme
   (6+7=13, 9+6=15, 8+5=13, 6+6=12, the four daily totals the scheme prints). It is in `lead`,
   which `questionCard_` draws as `.qsheet-lead` and which my sweep never looked at.

   SO THIS READS EVERY COLUMN THE CARD DRAWS. `html`, `lead`, `diagram` and `images`, on the row and
   on every preamble that hangs above it — because a table a paper prints above three parts belongs
   on the preamble, which is where the six on that paper now live. A rule that reads two of the four
   reports a fault about the two it did not read.

   WHAT IT IS FOR is the same silence the picture count above it closed. 29 of these carry
   `figure: 'table'`, so that count already has them; 1 carries an answer-space label, so the table
   IS the blank and the row is complete. The rest are in NEITHER — a question that says "the table
   shows information about the masses of 400 apples" with the headers flattened into its prose and
   not one frequency anywhere, which is `Q-1CM-averages-from-tables-2`, five marks, unanswerable,
   and recorded nowhere. The 1st Class Maths averages sheets are the cluster and their PDFs are in
   Drive, so they are repairable the way the Corbettmaths fraction sheets were.

   PRINTED, NOT FAILED, AND WIDE ON PURPOSE. Narrowing it to "the table SHOWS" — a table introduced
   as carrying data — drops 36, and the dropped set is full of real faults: "Complete the table of
   values for y = x² − x" with no table is as unanswerable as a missing data table, and the repair
   is simply a different one. Left wide it also catches rows that are fine: "Here is a list of
   numbers 6 8 11 14" prints its list in the prose, and one KS2 grammar question is about the word
   "space" in "Make space on the table for the laptop". Those are the price of not dropping the
   other 36, and they are why this is a number somebody reads rather than a build failure — the
   same argument the picture count makes about `figure` being two columns under one name. */
```

### ---------- ONE PICTURE, SEVERAL PARTS, AND WHERE IT BELONGS

top level, before `byQ`

```
/* ---------- ONE PICTURE, SEVERAL PARTS, AND WHERE IT BELONGS ------------------------------------
   `preamble_` DRAWS A QUESTION-SCOPED PREAMBLE ON EVERY PART THAT HANGS FROM IT, so a figure two
   parts share is written ONCE on the preamble and appears on both. Named on each part instead, it
   is the duplication CLAUDE.md records under the AQA insert and under `.reel .over`: one fact in
   two places, drifting apart the first time either is touched.

   AND THE COST IS NOT ONLY TIDINESS. June 2024 Foundation Paper 1 was reported as *"navigation is
   a bit buggy for one student"*, and this was it: with the shared stem left on part (a), swiping
   through the paper handed a student a card reading only "Find the range." and another reading
   only "Give a reason for your answer.", with the thing they refer to on the page before. You had
   to swipe back, and swiping back loses your place in the strip.

   PRINTED, NOT FAILED, AND `figure` IS WHY. It is a LABEL rather than an identity -- two parts both
   saying `graph` may mean Figure 3 and Figure 5, and no rule here can tell that from two parts
   sharing one picture. A check that cannot tell them apart is the `check-rows.js` fault, where the
   first version had 95 findings and 2 real ones. So this is a place to look, and the second number
   is the sharp end of it: a part carrying a real DRAWING beside a sibling that names the same
   figure is one picture built twice, whatever the label means. */
```

### ---------- WHAT A PAPER REQUIRES, AND HOW MUCH OF IT IS KNOWN

top level, before `saysCalc`

```
/* ---------- WHAT A PAPER REQUIRES, AND HOW MUCH OF IT IS KNOWN ----------------------------------
   THE SAME BACKLOG SHAPE AS `total_marks` AND `exam_date`: a number somebody can act on beats a
   silence. Calculator is read off the paper's own front page and covers every question inside, so
   it is counted per DOCUMENT; the kit is per question and mostly absent, because only twelve
   questions in the whole library print the word themselves — see tools/set-needs.py for why the
   rest are left blank rather than inferred from what the question is about. */
```

### ---------- A QUESTION THAT ASKS YOU TO DRAW, WITH NOWHERE TO DRAW

top level, before `preDiag_`

```
/* ---------- A QUESTION THAT ASKS YOU TO DRAW, WITH NOWHERE TO DRAW --------------------------------
   `answer_type` OF `drawing` OR `annotate` MEANS THE ANSWER IS A MARK ON A PICTURE — a box plot, an
   enlargement, a cross on a probability scale, a line of best fit. `padSource_` in find.js lays a
   pen over that picture so the question can actually be answered, and it can only do that where
   there IS one: the question's own `diagram`, or a single diagram on a preamble the question sits
   under, which is where a figure shared between parts (a) and (b) lives.

   SO THE ONES WITH NO PICTURE ARE A BACKLOG AND THIS PRINTS THEM. The question and its marks are
   right; what is missing is the paper's own figure, which is editorial work with the paper open.

   AND THEY ARE ANSWERABLE IN THE MEANTIME, which this paragraph used to argue against. *"some
   questions require answers on diagram. So should have a diagram for them to draw on"* -- the owner,
   tutoring from it -- so a drawing question with no picture gets a SURFACE under the pen (squared
   paper, axes, a blank space) or, for "circle the words in the passage", its own passage to tap
   (`padSurface_` in find.js, cut out below by name so this count is the app's rule and not a copy of
   it). The surface stands where the box would on the card, and the paper's own figure under a pen
   stands among the question's words (docs/history/356) -- one answer, drawn, with no switch to a box
   (a box beside it only where `accept` has a value to mark). The count below says how many stand on
   each, so the backlog of real figures is still a number. */
```

### EXACTLY ONE, not "any".

top level, before `withPad`

```
/* EXACTLY ONE, not "any". A question sitting under two pictures has no single answer to which of
   them the pen belongs on, and guessing puts the marks on the wrong one — so it counts as having
   none and stays in the backlog until somebody says. `padSource_` makes the same test for the same
   reason, and the two have to agree or this number is about a different thing than the app does. */
```

### ---------- A RULER AND A COMPASS ON THE PEN, AND HOW MANY QUESTIONS ASK FOR THEM

top level, before `toolsSrc_`

```
/* ---------- A RULER AND A COMPASS ON THE PEN, AND HOW MANY QUESTIONS ASK FOR THEM -----------------------
   *"some questions require a compass or ruler. so should have a tile for these things. if you cant find
   those questions dont worry just have the infrastructure set up for it."* The app's own decider
   (`padTools_`, cut out of find.js by name like `padSurface_` above) run over every question, with the
   `needs` the card shows -- the paper's cover unioned with the row's own, as `needsOf_` does -- and the
   words of the row, its lead and its preambles. A COUNT, NOT A RULE: a question asking for a compass
   with no pen to use it on is the data's to fix (its `answer_type` or `surface`), and it is printed so
   that it is a backlog rather than a silence. "Protractor" is decided and not built -- printed too. */
```

### ---------- "USE YOUR GRAPH" NAMES THE PART WHOSE GRAPH

top level, before `usesKey_`

```
/* ---------- "USE YOUR GRAPH" NAMES THE PART WHOSE GRAPH ------------------------------------------------
   The multi-part audit, finding 5: 2F Q24(c) "Use your graph to find estimates..." drew no picture, and
   the graph was the child's own, on (b)'s grid. `uses` names that earlier part by its `part` cell, and
   the app draws its picture with the child's marks in front of (c) -- or under (c)'s own pen, where (c)
   draws on the same picture (`usesOf_` in find.js; tools/set-uses.py decides the rows, and says why).

   TWO RULES, BOTH FAILURES:
     a `uses` must name a part of ITS OWN QUESTION that comes BEFORE it and is answered by drawing --
       anything else is a picture the app cannot find, or marks that do not exist yet, or (pointing
       forward) the beginning of a loop; a part naming a part that is not there draws as if it named
       nothing, which is the silent nothing this file exists to refuse
     a part whose own words say "use your graph" (or diagram, drawing, line of best fit...) after a part
       of its question answered by drawing must carry one. NOT "use the graph" -- as often the paper's
       printed graph as the child's -- and not two parts on one printed picture, which say nothing in
       their words; those are decided in tools/set-uses.py, and printed here as a count. "Your" is the
       one word that can only mean the child's own, so it is the one this can hold a new paper to. */
```

### ---------- THE FIGURES THE PAPER PRINTS AND NOBODY HAS DRAWN, COUNTED SO THE COUNT CANNOT GROW

top level, before `NOT_DRAWN_MAX`

```
/* ---------- THE FIGURES THE PAPER PRINTS AND NOBODY HAS DRAWN, COUNTED SO THE COUNT CANNOT GROW -------
   THE MULTI-PART AUDIT, FINDING 4. A part whose words name a figure ("Figure 3", "the graph", "the
   grid", "the table below"…) in a question where no row carries one now gets a page saying so --
   `questionNoFigCard_` in find.js -- because a question that reads as complete and cannot be answered
   is the failure nobody on the phone can see. That page is the stopgap; drawing them is the fix, and
   this is the ledger: THE APP'S OWN TEST (`FIG_NAMED`, `figWanted_`, cut out of find.js by name, with
   `padSurface_` from above), run over every part with what its question holds -- its own `diagram`
   or `images`, any other part's, and every preamble over it (paper, section, question, letter).
   A CEILING, NOT A RULE: today's count is written below, and a new row that adds to it fails. Drawing
   one lowers the count, and the ceiling should follow it down so the gain is kept. */
```

### ---------- ONE SPELLING OF A PART PER QUESTION

top level, before `spellBy_`

```
/* ---------- ONE SPELLING OF A PART PER QUESTION ---------------------------------------------------
   THE MULTI-PART AUDIT, FINDING 13: the order of a question's parts is read off how each is spelled,
   and "bi" beside "b(ii)" used to sort b(ii), b(iii), bi -- (i) last. `partKeys_` in find.js now reads
   the two as one, so the order would come out right; this is the other half, because a question that
   says one thing two ways is a transcription that was not looked at twice, and the next reader of the
   column -- a script, a sheet formula -- will not be as forgiving. Bracketed is "a(i)", bare is "ai";
   a numeral on its own ("ii") is neither and is allowed beside either. */
```

### ---------- EVERY PART SPLITS INTO ITS TAGS: Q1a(ii) IS [Q1] [a] [ii] (docs/history/355)

top level, before `bad_`

```
/* ---------- EVERY PART SPLITS INTO ITS TAGS: Q1a(ii) IS [Q1] [a] [ii] (docs/history/355) ---------------------
   The owner, 12 Oct: the card's number is three tags, each a finder answer -- the Part [a] (or AQA's [.1])
   and the Sub-part [ii]. `partSplit_` in find.js does it with the question's own numeral decision
   (`partNumerals_`, the one the sort uses), so this cuts the two out by name and runs them over every
   question row: a part that will not split is a card with half a number, and fails. AND THE ONE TRAP THE
   DECISION EXISTS FOR: W-CBM-time Q4 runs a to j, so its `i` is the ninth LETTER -- [Q4] [i] as a part,
   never a sub-part -- where a lone `i` anywhere else is a numeral. */
```

