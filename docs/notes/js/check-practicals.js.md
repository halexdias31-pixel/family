# js/check-practicals.js

The full text of comments in `js/check-practicals.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-practicals.js THE PRACTICALS, AND WHETHER THE THING THEY ARE JOINED TO EXISTS.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-practicals.js

   THE PRACTICALS, AND WHETHER THE THING THEY ARE JOINED TO EXISTS.

   WHY THIS IS NOT PART OF `check-library.js`. That one owns `data/questions.json` — ids, the 80-mark
   rule, the closed facet vocabulary. This owns a different file with a different shape and, more to
   the point, ONE question that file cannot ask: does a practical's topic name anything real.

   THAT QUESTION IS THE WHOLE FEATURE. The export shipped one topic per practical and the trundle
   wheel's was `Perimeter and area` — a phrase that reads perfectly and matched exactly ONE question
   in a library holding ninety-four about perimeter and area under other spellings. A join that
   silently reaches nothing is this repository's oldest shape: `figure`, `orderPrints`, the four
   message actions, `exam_date`. Here it would be worse than silent, because "Practicals" would be
   an answer in the funnel that quietly returned the wrong ones.

   SO A TOPIC HAS TO BE A LABEL OR AN ALIAS IN `data/topics.json`, and that is checkable where free
   text never is. The tree is the one place that says what a topic is called; a practical naming a
   spelling the tree has never heard of is either a typo or a branch somebody needs to add, and
   both are things a person should be told about rather than a filter that comes back empty.
================================================================================================== */
```

### ---------- THE SHAPE, PARSED A LINE AT A TIME

top level, before `readLines`

```
/* ---------- THE SHAPE, PARSED A LINE AT A TIME ---------------------------------------------------
   The same rule `data/questions.json` has and for the same reason: the next script to append by
   splitting on newlines. `check-library.js` records why each line is parsed on its own rather than
   the file's last character checked — a whole file flattened onto one line still ends in `}`. */
```

### ---------- WHAT THE TREE ANSWERS TO

top level, before `key`

```
/* ---------- WHAT THE TREE ANSWERS TO -------------------------------------------------------------
   Label, alias, and the id read as words — the same three `topicIndex_` in find.js built its map
   from, while the app still read the tree for `Topic area`. Both are retired (find.js, `THE TOPIC
   TREE WAS READ HERE`), so this file is now one of the tree's readers rather than a copy of one.
   Deliberately NOT the containment pass the app used: that resolved "scatter graphs" inside
   "Scatter Graphs & Correlation" and was right to, but a practical's topic is written by hand into a
   file under review, so it can be held to the stricter standard of naming the branch outright. */
```

### ---------- AND `wow` IS A CLOSED LIST FOR A REASON THIS FILE ALREADY LEARNED

top level, before `WOW`

```
/* ---------- AND `wow` IS A CLOSED LIST FOR A REASON THIS FILE ALREADY LEARNED ---------------------
   IT WENT IN AS FREE TEXT — "low to look at, high to learn from", "high — and he keeps it" — which
   reads beautifully and cannot be compared. The card reads this column to mark the one or two worth
   opening a session with, and a rule over free text is the fault recorded a few lines up, where
   `/required practical/` matched `AQA-aligned, NOT a required practical` and called five extras
   required. The nuance did not go anywhere: it is in `notes`, which is prose and is drawn as prose. */
```

### ---------- AN EXPERIMENT OR A THING YOU MAKE

top level, before `PRACTICAL_TYPE`

```
/* ---------- AN EXPERIMENT OR A THING YOU MAKE -----------------------------------------------------
   ASKED FOR AS "differentiate between a science experiment and a contraption/art and craft thing",
   and it is a closed list for `WOW`'s reason one rule up: the card reads it to print a word, so it
   has to be comparable. A third value is plainly possible — a DEMONSTRATION you watch rather than
   measure or make — and it goes in HERE, deliberately, by somebody who has just read the two
   already in use. That is the argument `check-library.js` makes about `Resit` arriving beside
   `Second wave`.

   NEVER DERIVED FROM A WORD IN THE ROW. "build" is in the steps of half the experiments and
   "measure" is in the steps of most of the builds, and a substring over this data is the fault
   this file already carries in its own comments: /required practical/ matched `AQA-aligned, NOT a
   required practical` and called five extras required. */
```

### ---------- A QUANTITY IS SHORT, OR IT IS NOT A QUANTITY

top level, before `QTY_MAX`

```
/* ---------- A QUANTITY IS SHORT, OR IT IS NOT A QUANTITY ------------------------------------------
   IT IS PRINTED AFTER THE ITEM'S NAME on its line of the kit list — `Lolly sticks: about 10`. It
   was a badge inside a chip that could not wrap, and the chips were reverted to a list on "the
   google chip idea didnt work how i wanted to so revert back"; the cap outlived them for its other
   reason. Twelve characters holds `2`, `250 ml`, `a handful` and `2 per person`, and a sentence
   after the colon reads as a second item on the same line. Put the detail in the name. */
```

### EXACTLY THE ONE VALUE.

top level, before `gone`

```
/* EXACTLY THE ONE VALUE. `AQA-aligned, not a required practical` CONTAINS the words
     "required practical", so a substring test counted five extras as required — found here,
     by this count disagreeing with the one the transform printed. */
```

### ---------- A REFUSED EXPERIMENT IS ASKED FOR A REASON WHERE A LIVE ONE IS ASKED FOR A METHOD --

top level, before `gone`

```
/* ---------- A REFUSED EXPERIMENT IS ASKED FOR A REASON WHERE A LIVE ONE IS ASKED FOR A METHOD --
     FIVE ROWS ARE EXPERIMENTS THAT WERE CONSIDERED AND TURNED DOWN — burning magnesium ribbon,
     magnesium and hydrochloric acid, flame tests, and two left out on preference. They are rows
     rather than a deletion because "recorded so the reasoning is not lost" is the whole point of
     them: a tutor asking why they are not doing the classic version has to be able to find the
     answer.

     `active` IS NOT THE COLUMN FOR THAT, and this repository already records the distinction on
     the posts tab: `active` is whether a thing has been deleted and `approved` is whether it has
     been let through, and folding them together makes undeleting and approving one act. So an
     excluded row is LIVE and carries `excluded_reason`.

     AND IT IS NOT ASKED FOR A METHOD. An experiment nobody will run does not need one, and
     demanding it would mean writing out a procedure purely to satisfy a checker — inventing
     content, which is the opposite of what this file is for. It is asked for the reason instead,
     which is the thing that has to be there. */
```

### `practical_type` IS ON THIS LIST FOR THE SAME REASON THE OTHER TWO ARE.

top level, before `NEEDLESS`

```
/* `practical_type` IS ON THIS LIST FOR THE SAME REASON THE OTHER TWO ARE. Saying which shape
       an afternoon that is not happening would have had is a judgement about a thing nobody will
       do — content invented to fill a column, which is what this block exists to refuse. */
```

### ---------- THE THREE LIST COLUMNS: PRESENT, AND NO DOUBLED PIPE

top level, before `v`

```
/* ---------- THE THREE LIST COLUMNS: PRESENT, AND NO DOUBLED PIPE ---------------------------
       `risks` IS A FAILURE RATHER THAN A COUNT, and it is the only editorial column in this file
       that is. Everywhere else here a blank cell is a backlog printed as a number — the age, the
       hazard, the shop join — because the argument this repository makes over and over is that a
       wrong "you need compasses" sends a tutor into a lesson with the wrong bag while a blank one
       sends them to look at the paper.

       A RISK ASSESSMENT IS THE ONE PLACE THAT ARGUMENT DOES NOT HOLD, and the reason it gives has
       changed while the rule has not. It used to be about the SCREEN: a blank produced a guide
       opening on a heading reading `Risk assessment` over nothing, which reads as an experiment
       with no hazards in it. The guide draws no such section now — see `practicalPart_` in js/find.js, which
       was cut to five things — so this rule guards the DATA and nothing else.

       IT IS STILL A FAILURE AND NOT A COUNT. Everywhere else a blank here is work somebody
       intends to do and a number is how you act on it. Hazards are not that: this is the one
       column in this file that is about whether a child gets hurt, and "nobody has written them
       yet" and "there are none" are indistinguishable from outside the row. A number printed
       against that is a backlog you can ship; a failure is one row of editorial work now. The
       column is one `<section>` from being drawn again, and the 250 hazards already written are
       what makes putting it back a decision rather than a project. */
```

### ---------- AND THE KIT CARRIES ITS OWN QUANTITY, IN ONE STRING

top level, before `bits`

```
/* ---------- AND THE KIT CARRIES ITS OWN QUANTITY, IN ONE STRING ---------------------------
       THE FORMAT IS `Name × qty` AND THIS IS WHERE IT IS REFUSED. `kitParse_` in js/library.js is
       its only reader and it is deliberately forgiving — a kit line with no name is worse than one
       with a long name, so a malformed item falls back to drawing the whole string. That forgiveness
       is exactly why the rule has to be here: a `Water ×` with nothing after it would render as the
       words `Water ×` and look like a design.

       THE SEPARATOR IS `×` AND NOT `x`, measured: a bare `x` sits inside `box`, `flex` and
       `Perspex`, and the multiplication sign appeared ZERO times across the 640 items this column
       held before it was chosen. It is also the character the booking card already prints for the
       same idea.

       A QUANTITY OF ONE IS NOT A QUANTITY. One stopwatch is one stopwatch, and `× 1` on five
       hundred lines of kit is five hundred pieces of furniture that say nothing. The absence IS the
       answer, which is the same argument this file makes three columns along about an age nobody
       has judged. */
```

### ---------- WHICH OF THE TWO SHAPES IT IS

top level, before `pt`

```
/* ---------- WHICH OF THE TWO SHAPES IT IS ----------------------------------------------------
     ASKED OF A LIVE ROW ONLY. A refused experiment is a row so the reasoning is findable, and it
     is already excused its method and its risk assessment for the same reason — saying which shape
     an afternoon that is not happening would have had is content invented to satisfy a checker. */
```

### ---------- THE HAZARD IS A CLOSED LIST, FOR `VOCAB`'S REASON

top level, before `hz`

```
/* ---------- THE HAZARD IS A CLOSED LIST, FOR `VOCAB`'S REASON ---------------------------------
     It is the one word a tutor triages on before reading anything else — "medium, involves fire"
     against "very low" — and free text turns a triage into a paragraph. A sixth level has to be
     added here by somebody who has just read the five already in use, which is the argument
     `check-library.js` makes about `exam_wave` and `Resit` beside `Second wave`. */
```

### ---------- AN AGE IS A NUMBER OR IT IS ABSENT

top level, before `a`

```
/* ---------- AN AGE IS A NUMBER OR IT IS ABSENT ------------------------------------------------
     `12+ with an adult` in this column would be a sentence nothing can compare, and the sentence
     belongs in `safety` where it already is. */
```

### ---------- A COST OF NOTHING AND NO COST ARE DIFFERENT ANSWERS

top level, before `v`

```
/* ---------- A COST OF NOTHING AND NO COST ARE DIFFERENT ANSWERS -------------------------------
     THIS IS THE `cost: 0` FAULT AND THIS FILE IS WHERE IT IS REFUSED. CLAUDE.md records it four
     times: `Number(x.price) || 0` made a blank cell a price of nought and 3,262 of 3,265 items
     answered "Free". Measuring car speeds really does cost nothing per run; the 41 lab practicals
     have never been costed at all. A `0` states the first and an absent value states the second,
     and an empty STRING states neither — it is a blank wearing a number's clothes. */
```

### `practicals` RATHER THAN `experiments`, BECAUSE `experiment` IS A VALUE NOW.

top level, before `live`

```
/* `practicals` RATHER THAN `experiments`, BECAUSE `experiment` IS A VALUE NOW. It was the
   ordinary English word for all of them until `practical_type` made it one of two shapes, and a
   header reading `82 experiments` over a line reading `71 experiment(s), 6 build(s)` is one word
   meaning two things three lines apart — the `kind`/`paper` collision this repository already
   renamed its way out of. */
```

### ---------- PRINTED, BECAUSE A NUMBER IS SOMETHING SOMEBODY CAN ACT ON

top level, before `live`

```
/* ---------- PRINTED, BECAUSE A NUMBER IS SOMETHING SOMEBODY CAN ACT ON ------------------------
   The argument `check-library.js` makes about its own counts, and the one that caught a rename
   taking `papers checked against a total` from 34 to 2 under a green tick. A count that moves when
   it should not is the only thing that would show these columns quietly emptying. */
```

### ---------- THE GUIDE'S OWN THREE COLUMNS, AND THE DRAWINGS

top level, before `live`

```
/* ---------- THE GUIDE'S OWN THREE COLUMNS, AND THE DRAWINGS -------------------------------------
   `variables` AND `log` ARE WHAT THE GUIDE ASKS FROM. Without them it hands a student the kit, the
   method and three empty boxes with nothing suggesting what to change or measure — which is what
   41 of these rows did until somebody counted. Printed rather than failed for the same reason the
   drawings are: writing a paragraph about a practical is editorial work, and a number somebody can
   act on beats a silence. It is zero today, so the next row added without one shows up as a one.

   `science` IS COUNTED AND NO LONGER DRAWN, and that is said rather than left to be discovered.
   The guide was cut to five things — the name, the picture, the kit, the method and the three
   worksheet questions — so "What is going on" is a column this file counts and nothing renders.
   It is deliberate rather than accidental, which is the whole difference from `figure`,
   `orderPrints` and `exam_date`: keep it filled and a guide that wants it again has it.

   A DRAWING IS A DIFFERENT KIND OF BACKLOG, and this is the one count that is not aiming at zero.
   CLAUDE.md's rule is to draw only where the row's own words determine the picture, so a rack of
   tubes whose colours ARE the reading, a build whose shape is the variable, and a kit whose own
   booklet determines it each correctly get nothing. The number is printed off the run rather than
   named in this comment, which is the "all 18 checks pass" fault. */
```

### A DRAWING ON A REFUSED ROW WOULD BE A PICTURE OF AN EXPERIMENT NOBODY IS RUNNING.

top level, before `NO_DRAWING`

```
/* A DRAWING ON A REFUSED ROW WOULD BE A PICTURE OF AN EXPERIMENT NOBODY IS RUNNING. The same rule
   this file already applies to kit and steps, and for the same reason: the five refusals are rows
   so the reasoning is findable, not so the experiment is. */
```

### ---------- AND A ROW WITH NO DRAWING SAYS WHY

top level, before `NO_DRAWING`

```
/* ---------- AND A ROW WITH NO DRAWING SAYS WHY -------------------------------------------------
   THE COUNT ABOVE IS NOT AIMING AT ZERO, which is exactly what makes it useless on its own: a
   printed 26 reads the same whether those rows were judged or forgotten. So every row without one
   has a written reason here, and a live row that has neither a drawing nor an entry FAILS. Sixth
   time this repository reaches for the pattern, after `ACCEPTED` in check-payload.js, `VOCAB` in
   check-library.js, `ACCEPTED_TAP` in check/ui.js, `RETIRED_FACETS` in find.js and `HANDLE_ALLOWED`
   in people.gs — one entry, one sentence, so a NEW row without a picture fails loudly instead of
   joining a red nobody reads.

   IT IS EMPTY NOW AND THAT IS WHY IT STAYS. All 77 live practicals carry a drawing, so the list
   has nothing to hold — and a list somebody deletes because it is empty is the guard gone: the next
   row added without a picture would then pass in silence rather than being refused until somebody
   writes the sentence. An empty accepted-list is the strongest state this pattern has, not a spent
   one.

   THE SIXTEEN IT USED TO HOLD ARE THE ENTRY WORTH READING, because fourteen of them were wrong. The
   reasons were honest and they were reasons not to draw the RESULT, taken as reasons not to draw
   the SET-UP: `PR-HM05` read "a tablet, a glass and a stopwatch", and the thing that picture has to
   settle is whether the stopwatch starts as the tablet touches the water. The two that were right
   are still right and are drawn a different way: `PR-HM24`'s gear train is dashed, because step 1
   builds it from somebody else's booklet, and `PR-HM26`'s two layers are simply absent, because
   step 2 asks which is on top. What changed is not the rule — it is that "no picture determines
   this" was being asked of the whole practical rather than of its first three steps. */
```

### AND A DRAWING HAS TO BE A DRAWING.

top level, before `d`

```
/* AND A DRAWING HAS TO BE A DRAWING. `libraryInto_` hands `diagram` straight to the page without
   escaping it, exactly as the library's questions are handed to `questionCard_`, so what is in the
   cell has to be an inline SVG and nothing else. */
```

### ---------- UNIFORM, WHICH IS A THING A CHECK CAN ASK

top level, before `running_`

```
/* ---------- UNIFORM, WHICH IS A THING A CHECK CAN ASK ---------------------------------------------
   REPORTED AS "it seems you speciallised the practicles for me and my situation. it needs to be more
   systematic and uniform like repeatable for anyone." Measured, that was four things and two of
   them are columns: `age_min` and `wow` existed on 16 of 57 rows — the same sixteen, the set that
   came out of one chat transcript — so the column drew two kinds of card, eleven carrying an age
   and a "worth opening a session with" and forty-six carrying neither.

   BOTH ARE ON EVERY LIVE ROW NOW and this is what stops the next one arriving without them. A
   refused experiment correctly has neither, for the reason its method and its risks are also
   absent: writing out an age for something nobody will run is inventing content to satisfy a
   checker. See tools/practical-uniform.py for the age rule and the judgements.

   `cost_per_run_gbp` IS DELIBERATELY NOT ASKED FOR, and the count below says so rather than leaving
   it as a silence. A school owns the kit and nobody has ever costed a lab practical; `libNum`
   answers absent rather than nought for exactly that, which is the `cost: 0` fault this repository
   records four times. */
```

### ---------- AND A METHOD THAT NAMES A PLACE ONLY WORKS FOR SOMEBODY STANDING IN IT

top level, before `LOCAL`

```
/* ---------- AND A METHOD THAT NAMES A PLACE ONLY WORKS FOR SOMEBODY STANDING IN IT ----------------
   TWO PRACTICALS WERE NAMED AFTER ONE TOWN'S PARK AND ITS RIVER — "Perimeter of Wandle Park",
   "Flow rate of the River Wandle" — and five more named a local landmark inside their steps or
   notes. A tutor in Leeds reads the same row, so the method has to say what KIND of place it needs.

   A CLOSED LIST OF THE ONES THAT WERE THERE, which is the `ACCEPTED` / `VOCAB` / `RETIRED_FACETS`
   pattern: it cannot catch a place nobody has written yet, and it makes the ones that were found
   impossible to put back by accident. A new local name is a judgement somebody makes on purpose,
   and adding it here is where that decision gets written down. */
```

### ---------- WHAT EACH COLUMN COVERS, AS A NUMBER

top level, before `kitItems`

```
/* ---------- WHAT EACH COLUMN COVERS, AS A NUMBER --------------------------------------------------
   A COLUMN ON A SUBSET IS EXACTLY THE FAULT ABOVE, and the only way it is visible before somebody
   opens two cards side by side is a count. Printed rather than failed for the ones that are
   deliberately partial. */
```

### ---------- THE TWO SHAPES, AND HOW MUCH OF THE KIT CARRIES A QUANTITY

top level, before `kitItems`

```
/* ---------- THE TWO SHAPES, AND HOW MUCH OF THE KIT CARRIES A QUANTITY ----------------------------
   BOTH ARE PRINTED RATHER THAN DRIVEN TO A TARGET, and they are different kinds of number. The
   split is a fact about the library — if it ever reads 82 and 0 something has stopped being
   decided per row, which is what a rule could never catch. The quantities are a BACKLOG: a
   quantity is written where the row's own method states one, and inventing the rest would send a
   tutor to a client's house with the wrong bag. That is this file's oldest sentence, and it is why
   a blank here is a number rather than a failure. */
```

