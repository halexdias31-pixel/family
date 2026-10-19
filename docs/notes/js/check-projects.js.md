# js/check-projects.js

The full text of comments in `js/check-projects.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-projects.js THE PROJECTS, AND WHETHER THE THINGS THEY ARE JOINED TO EXIST.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-projects.js
   THE PROJECTS, AND WHETHER THE THINGS THEY ARE JOINED TO EXIST.

   ASKED FOR AS "the projects are like practicles, but not practicles. so should be a new tag in the
   finder called projects." So this is `check-practicals.js`'s sibling and holds the same two
   arguments it does, about a different file:

   THE JOIN IS THE FEATURE. A project names topics in the library's own spellings, so a recipe book
   that scales from four people to six is found by the Topic question that finds a past paper on
   direct proportion. A topic the tree has never heard of is a join that silently reaches nothing —
   the trundle wheel's `Perimeter and area`, which matched one question in ninety-four.

   THE KIT IS `Name × qty`, refused here because `kitParse_` is forgiving on purpose, and a `Glue ×`
   with nothing after it would draw as the words `Glue ×` and look like a design.

   AND THREE THINGS A PRACTICAL NEVER HAD TO ASK:

   · THE TWO TABLES THAT GROUP THE FUNNEL. `bucketLabels_` stands a whole grouping down the moment
     ONE answer is unplaced. A project whose subject is `Computing`, or whose level is `KS2/KS3`
     with a slash, would turn the Subject or Level question back into the alphabet for the whole
     library — and a kind missing from `KIND_BUCKET` would do the same to `What kind`, which is the
     question the owner asked to see `Projects` in. So all three are read out of js/find.js.

   · AGES 8 TO 16, the range the projects were asked for, as two numbers rather than a sentence.

   · NOTHING GOES ONLINE. A child's film, voice and face are the material here, and "save videos"
     is deliberately not built (see `projectCard_`). A step or a share note that says upload,
     publish or post online is the one sentence on these cards that could hurt somebody, so it
     fails rather than counts. `safety` may SAY "not put online"; it is not scanned.

   AND, SINCE 9 OCT, A PROJECT OR A COURSEWORK. "i would like to add course works. make it bare
   bones. its within projects in finder." — the owner. So `project_type` is a closed word, blank
   reading as `project`; a live coursework MUST name an `exam_board` from a closed list and MAY
   name a `spec_ref`, and a project may name neither (note 253: a how-to video has no exam board);
   there is a project AND a coursework, because a question with one answer is never asked; and the
   question is wired the way `practicalType` is — a row in `data/settings/facets.json`, live, asked
   before Subject, asked ONLY of a list that is all projects, its colour in `TAG_OF`. See
   docs/history/314.
================================================================================================== */
```

### ---------- THE THREE TABLES, READ OUT OF THE FILE THAT USES THEM

top level, before `findSrc`

```
/* ---------- THE THREE TABLES, READ OUT OF THE FILE THAT USES THEM --------------------------------
   READ RATHER THAN COPIED, because a copy here is a second list that agrees with the first until
   the day somebody edits one. The quoted strings inside the `bucketTable_([...])` literal are the
   labels and the values together; a value matching either is placed. */
```

### ---------- PROJECT OR COURSEWORK, WIRED END TO END

top level, before `TYPES`

```
/* ---------- PROJECT OR COURSEWORK, WIRED END TO END ------------------------------------------------
   FOUR PLACES, AND A MISSING ONE IS SILENT IN EVERY CASE. `practicalType`'s arrangement, which has no
   facet in code: the mapper has to read the column, the item has to carry the field, the facets file
   has to name it (a field nobody names is a question nobody asks), and `TAG_OF` has to colour it.
   Read out of the files, for the reason the bucket tables are. */
```

### THE BOARDS, IN THE SPELLINGS THE REST OF THE SHELF ALREADY USES — `check-library.js` holds `AQA` and `Edexcel` for the papers, and the textbooks print `AQA`

top level, before `BOARDS`

```
/* THE BOARDS, IN THE SPELLINGS THE REST OF THE SHELF ALREADY USES — `check-library.js` holds `AQA`
   and `Edexcel` for the papers, and the textbooks print `AQA`, `Edexcel`, `OCR` and `Eduqas`. One
   spelling per board is what makes Exam board put a coursework and a past paper under one answer;
   `Pearson Edexcel` or `AQQ` would be an answer of their own. A closed list, `PROJ_TYPE`'s rule:
   a new board is added here on purpose. */
```

### THE FACETS FILE'S CELLS, READ THE WAY THE PHONE READS THEM.

top level, before `cellNum`

```
/* THE FACETS FILE'S CELLS, READ THE WAY THE PHONE READS THEM. `settingsInto_` turns a blank
   `sort_order` into null and `facetList` then places the question at 1000 and up — after Subject —
   while `Number('')` is 0 and looked like "first". `active` goes through `libOn`, so "FALSE" is off
   though it is not `=== false`. And `min_coverage` through `facetMin_`: blank is the default half, a
   number over 1 is a percentage. Three readers copied in miniature, because a check that reads a cell
   more kindly than the phone does is a check that passes what the phone breaks. */
```

### BEFORE SUBJECT, AND THIS IS THE RULE THAT WOULD OTHERWISE FAIL WITHOUT A SOUND.

top level, before `min`

```
/* BEFORE SUBJECT, AND THIS IS THE RULE THAT WOULD OTHERWISE FAIL WITHOUT A SOUND. A coursework's
     subject (Design and Technology) is not one any project has, so Subject asked first files it
     alone under Technology; once it is alone the question has one answer, and a question with one
     answer is never asked. Measured with the row at 38.5, beside `practicalType`: the funnel asked
     Subject straight after Projects (check-flow's coursework journey), and every Subject answer
     leaves one type, so Project or coursework could never come. A blank is NOT before anything:
     the phone puts it at 1000. */
```

### ONLY OF A LIST THAT IS ALL PROJECTS.

top level, before `min`

```
/* ONLY OF A LIST THAT IS ALL PROJECTS. Asked before Subject, at the default half it was asked of
     ANY list that was half projects: typing `blade` and skipping What kind left two projects, the
     D&T textbook and a practical, the funnel asked Project or coursework, and Coursework dropped the
     textbook and the practical without a word. A sweep of 1,550 searches found `send`, `folder` and
     `studio` doing the same. At 1 every item in hand has to be a project, which is what the row's
     note always said the coverage rule did. */
```

### A CLOSED WORD, WRITTEN AS THE MAPPER READS IT.

top level, before `pt`

```
/* A CLOSED WORD, WRITTEN AS THE MAPPER READS IT. Blank is `project` — the eight rows from before
     the column. Exact and lower-case, `check-practicals.js`'s rule for `practical_type`: the mapper
     forgives `Coursework`, and a file that relies on being forgiven is a file the next reader trips
     on. */
```

### THE BOARD AND THE SPEC ARE TEXT, and a coursework's alone.

top level, before `b`

```
/* THE BOARD AND THE SPEC ARE TEXT, and a coursework's alone. `8552` typed as a number is a spec
     that loses a leading zero the day a board has one and sorts as arithmetic; and a board on a
     project means a row that is coursework and was never marked so — note 253, "a how-to video has
     no ... exam board". */
```

### THE PRACTICALS' SPELLING, AND ONLY IT.

top level, before `b`

```
/* THE PRACTICALS' SPELLING, AND ONLY IT. `board` and `spec` are the textbooks' columns for the same
     two facts; on a project row the mapper reads neither, so a coursework written with them would
     lose its board without a sound. Named so the fix is obvious. */
```

### A COURSEWORK HAS A BOARD — "the one thing it has that a project does not".

top level, before `b`

```
/* A COURSEWORK HAS A BOARD — "the one thing it has that a project does not". Required on a LIVE
     one, from the closed list above: a coursework with no board is a project wearing the word, and a
     misspelt board is an Exam board answer of its own. */
```

### HOW LONG THE ORDERED PAGE IS, PRINTED AND NOT FAILED.

top level, before `pageChars`

```
/* HOW LONG THE ORDERED PAGE IS, PRINTED AND NOT FAILED. The steps and the safety paragraph share
     one card, and the card is drawn smaller to fit down to a floor and then scrolls inside itself.
     Measured at 320×568 on 9 Oct: PJ-01's 1,182 characters fit at 74%, PJ-02's 1,253 scroll by
     29px, and the first coursework's 1,617 scrolled by 141 with its knife-safety paragraph under the
     edge. A proxy for a measurement, so a note — `check/ui.js` skips a pane that scrolls, and a
     screenshot is the last word. */
```

### BOTH ANSWERS, OR THE QUESTION IS NEVER ASKED — the funnel's own rule for a question with one answer.

top level

```
/* BOTH ANSWERS, OR THE QUESTION IS NEVER ASKED — the funnel's own rule for a question with one
   answer. So a file of courseworks alone, or of projects alone, leaves the facet wired and silent,
   and only a count can say so. Counted over LIVE rows, because that is the list the funnel asks. */
```

