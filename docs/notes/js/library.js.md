# js/library.js

The full text of comments in `js/library.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — library.js THE QUESTIONS COME FROM THIS REPOSITORY, NOT FROM THE SPREADSHEET.

top level, before `LIBRARY_ROWS`

```
/* ==================================================================================================
   @family. — library.js

   THE QUESTIONS COME FROM THIS REPOSITORY, NOT FROM THE SPREADSHEET.

   WHY. `questions` is the one tab nobody hand-edits — it is written in bulk, and every edit to it
   this week has gone: export the sheet, build a CSV, download it, File → Import, twice, and hope.
   A tab that only ever arrives in bulk belongs where bulk edits are cheap and reviewable, and that
   is git. `Settings` and `Ledger` stay in Sheets for the two reasons that decide it: a person edits
   Settings by hand and should not need a deploy to do it, and Ledger holds PINs, e-mail addresses
   and dates of birth, which cannot go in a public repository at any price.

   WHAT WAS LEFT BEHIND, and this is the whole of it: `ticks_1`, `ticks_2` and `ticks_3`. 529 cells
   holding the handles of real people — a first name and an initial each, most of them children. They
   are stripped from `data/questions.json` and they are the reason this file says so twice. A tick
   is a fact about a PERSON and a document; it was never library data, and if it comes back it comes
   back in `Ledger`.

   ---------------------------------------------------------------------------------------------
   THIS IS NOT A SECOND IMPLEMENTATION OF `doGet`. It is a MOVED one. The two blocks below are the
   `payload.questions` push and the `dropdowns.checklists` build, lifted out of `doget.gs` because
   the rows they read no longer reach the backend at all. There is one copy, and it is this one.

   THE SHAPES ARE THEREFORE EXACT, down to the key names, because everything downstream — `allTopics`,
   `paperBody_`, `paperText_`, the funnel's facets — was written against them and none of it is
   being touched. A key renamed here is a feature that silently does nothing, which is this app's
   signature fault and the reason `check-payload.js` exists.

   FETCHED ALONGSIDE THE PAYLOAD, NOT AFTER IT. `index.html` starts both requests while it is still
   parsing; this one is 2.4 MB and the backend's is not, so starting it second would add its whole
   time to the boot. Merged in `load()` when both have landed.

   AND IT IS CACHEABLE, which the payload never was. The same origin as the site, a normal static
   file, so the second visit pays for none of it.

   IF IT FAILS, THE LIBRARY IS EMPTY and the rest of the app is untouched — the same outcome as an
   empty tab, which is what every other section of this payload does with a section it cannot read.
   It is not allowed to take the app down: a paper nobody can see is a bad day, a blank screen is a
   dead business.
================================================================================================== */
```

### ---------- THE HELPERS THE TWO BLOCKS NEED

top level, before `libS`

```
/* ---------- THE HELPERS THE TWO BLOCKS NEED --------------------------------------------------------
   `S`, `N`, `ON_` and `TRUE_` are `doget.gs`'s, and they are here under `lib` names rather than
   added to the global scope: `core.js` already has `norm`, and four more one-letter globals in a
   file that shares one scope with thirty-nine others is how a name gets taken twice. */
```

### ---------- A FINGERPRINT OF AN ANIMATION, SO A CHANGED ONE REPLACES THE COPY A DEVICE KEPT

top level, before `animHash_`

```
/* ---------- A FINGERPRINT OF AN ANIMATION, SO A CHANGED ONE REPLACES THE COPY A DEVICE KEPT ------------
   FNV-1a, 32 bits, over the UTF-16 code units, as eight hex digits. Not a security hash and it does not
   need to be one: it answers "is the copy this phone kept the drawing the book has now", and two
   drawings colliding would mean one load showing yesterday's version of one splash. The picker in
   index.html compares it as a string, so it never has to know how it was made. */
```

### ---------- `libN` BUT ABSENT STAYS ABSENT

top level, before `libNum`

```
/* ---------- `libN` BUT ABSENT STAYS ABSENT -------------------------------------------------------
   `libN('')` IS 0, deliberately: a blank count is none of something, and every caller it was
   written for wants that. It is exactly wrong for a PRICE and for an AGE, where nought and
   unanswered are different facts — the `cost: 0` shape CLAUDE.md records four times, most recently
   on the shop mapper where a blank cell read as "free" under a comment defending the zero.
   Two functions rather than a flag, so a caller picks by saying which question it is asking. */
```

### ---------- A KIT LIST, SPLIT INTO WHAT THE THING IS AND HOW MUCH OF IT

top level, before `kitParse_`

```
/* ---------- A KIT LIST, SPLIT INTO WHAT THE THING IS AND HOW MUCH OF IT ---------------------------
   THE STORAGE FORMAT IS `Name × qty`, ONE PIPE-SEPARATED ITEM EACH, and this is its only reader.
   `Lolly sticks × 12`, `Water × 100 ml`, `Beaker (250 ml)` — the last has no quantity because one
   beaker is one beaker, and a kit line reading `Beaker: 1` says nothing.

   SPLIT ON THE LAST `×`, NOT THE FIRST. A name may one day carry one (`10 × 10 grid`); a quantity
   is always the tail, so taking the last occurrence is right under both readings and taking the
   first is right under only one.

   `×` RATHER THAN `x`, AND THAT IS MEASURED. A bare `x` sits inside `box`, `flex` and `Perspex`,
   and ` x ` would still catch `10 x 10`. The multiplication sign appears ZERO times across the 640
   items this column holds — counted before it was chosen — so it cannot collide with a name
   already written, and it is the character the booking card already uses for the same idea.

   THE NAME IS WHAT IS LEFT AND IT IS NEVER EMPTY. An item that is nothing but a quantity is a
   quantity of nothing, so a leading `×` keeps the whole string as the name rather than producing a
   kit line with no name — and `check-practicals.js` fails the row, which is where that is repaired. */
```

### `libPrintPrice_` AND `libCanPrint_` WERE HERE — what a printed copy costs, computed while the checklists were built so a document arrived with its price on it.

top level, before `libraryRows_`

```
/* `libPrintPrice_` AND `libCanPrint_` WERE HERE — what a printed copy costs, computed while the
   checklists were built so a document arrived with its price on it. The checklists are not built
   any more (see below), so both went with the block that called them. Orphaned by the same change
   that orphaned `printPrice` in find.js, and found the same way, by `check-dead.js`. */
```

### ---------- ONE FETCH, STARTED EARLY

top level, before `libraryRows_`

```
/* ---------- ONE FETCH, STARTED EARLY ---------------------------------------------------------------
   `window.BOOT_LIB` is set by `index.html` before any of this has parsed, for the same reason
   `BOOT_GET` is: the network is the slow part and the parser is not. Null whenever that could not
   happen — no `fetch`, opened from a file, or it simply failed — and then this asks for it itself. */
```

### ---------- A FILE THAT DID NOT ARRIVE IS NOT AN EMPTY LIBRARY

in `libraryRows_`

```
/* ---------- A FILE THAT DID NOT ARRIVE IS NOT AN EMPTY LIBRARY -------------------------------
     THIS CAUGHT AND SAID NOTHING, and `[]` is what came out either way. Downstream, `stuffPageHtml`
     then drew "Nothing in the shop or the library yet." — a confident sentence about the library
     being empty, printed for a library that is 4,682 rows and simply had not come.

     IT IS THE FAULT THIS REPOSITORY HAS NOW RECORDED FOUR TIMES. `loadMessages` showed an empty
     inbox for an unreachable backend and its own comment named it: "a network blip reads as
     everything having been deleted". `check-booking.js` printed "nothing to check" and exited 0.
     Reels drew "Nothing here yet" for a column that worked. Every one is the same sentence — I did
     not manage to look, reported as I looked and there was nothing there.

     AND IT MATTERS MOST ON THE PHONE THAT CANNOT DO IT. This file is 346 KB compressed and 3.4 MB
     parsed, which is the one request in the app big enough to fail on a weak signal or an old
     handset — so the person who sees this message is exactly the person whose library did NOT load,
     and the message told them it was empty. `nothingHere` has drawn a reason and a `Try again` for
     the backend since it was written; the library just was never wired into it. */
```

### THE OTHER THREE TABS OF `Library`, AND BOTH STEPS ARE TAKEN.

top level, before `LIB_EXTRA`

```
/* ==================================================================================================
   THE OTHER THREE TABS OF `Library`, AND BOTH STEPS ARE TAKEN. THIS IS THE ONLY IMPLEMENTATION.

   `questions` LEFT THE SPREADSHEET AND THE ARGUMENT APPLIES UNCHANGED to `boxers`, `fights` and
   `cheatsheet`. CLAUDE.md sets the test in three questions, first one to answer wins:

     Is it secret?            No. Boxers and bouts are public record; the cheat sheet is a list of
                              which components a revision card may carry. Nothing here is a PIN, an
                              e-mail address or a date of birth, which is what keeps `Ledger` in a
                              sheet and out of this public repository.
     Does the app write to it? No — and this is the one that decides it. Measured: `read(TAB.boxers)`,
                              `read(TAB.fights)` and `read(TAB.cheatsheet)` appear exactly once each,
                              all three in `doget.gs`, and no `setCell` or `append` anywhere names
                              them. Code cannot be written to at runtime, so a tab the app writes to
                              can never move here; these three it only ever reads.
     Who edits it?            You, in bulk. Which is the same answer `questions` gave.

   IT WAS BUILT AS A FALLBACK AND IT RAN AS ONE FOR A FORTNIGHT, which is the part worth keeping.
   When `questions` moved, the rows were in hand and `doGet` stopped building them in the same
   commit. These three could not be done that way: the rows were in a spreadsheet the agent
   environment cannot open — every Google host is blocked by network policy — so it went in two
   steps, and only the first could be taken from here:

     1. the machinery, with the FILE WINNING and the payload still answering while the file is empty
     2. paste the rows in, confirm, then delete the three blocks from `doget.gs`

   CUTTING THE BACKEND FIRST WOULD HAVE TAKEN THE FEATURES DARK for however long step 2 took, over a
   migration nobody was waiting on. Step 2 is done — the rows came out through the Drive connector,
   337 of them, and were compared cell by cell against what `doGet` was building from the same tabs:
   **337 rows, 0 cells differ**, so the cutover changed nothing anybody could see. `doget.gs` no
   longer reads those tabs, `SCHEMA`, `TAB` and `WHERE` no longer name them, and `LIBRARY_ID` is
   gone from `FILES`, so nothing in this project opens that spreadsheet at all.

   THE `[]` FALLBACK BELOW STAYS AND IS NOW LOAD-BEARING IN ONE DIRECTION ONLY. There is no payload
   copy left to fall back TO — `doGet` sends `boxers: []`, `fights: []` and `cheatsheet: []` and
   nothing fills them — so a file that 404s is three dark screens rather than a quiet reversion.
   That is worse than what it replaces and it is still the right shape: the alternative is a throw
   on a file that has not been deployed yet, which takes the whole of `load()` with it. What it
   costs is written down here so it is not rediscovered as a bug.

   THE FILES HOLD THE SHEET'S OWN COLUMN NAMES — `boxer_id`, `height_cm`, `part_id` — not the
   camelCase the phone reads. That is deliberate and it is what `questions.json` does too: the file
   is a faithful export of the tab, so a person can paste a row in without translating it, and the
   one place that renames a column is the mapping below. Two spellings in two places is how
   `r.link` and `source_url` cost seven silent reads, recorded in CLAUDE.md.
================================================================================================== */
```

### ---------- `topics` WAS THE FOURTH, AND IT IS NOT FETCHED ANY MORE

top level, before `LIB_EXTRA`

```
/* ---------- `topics` WAS THE FOURTH, AND IT IS NOT FETCHED ANY MORE ------------------------------
   269 LABELS UNDER 10 ROOTS, with an `aliases` column, fetched here for `topicAreaOf_` and the
   `Topic area` question it answered. The owner retired that question on 6 Oct, and its reader
   followed a round later (see `THE TOPIC TREE WAS READ HERE` in find.js) — in between, every boot
   still fetched the file and built `DATA.topicTree` for nobody. The file stays in `data/`: the
   practicals', projects' and textbooks' checks read it straight off disk to hold a hand-written
   topic to a label or an alias, and none of them needs the phone to have it. */
```

### `practicals` JOINED THIS LIST LAST and is the first entry that is not a boxing row or a lookup table:

top level, before `LIB_EXTRA`

```
/* `practicals` JOINED THIS LIST LAST and is the first entry that is not a boxing row or a
   lookup table: 41 experiments, each naming the library's own topics, so a practical and a
   past-paper question about the same thing answer the same question in the funnel. */
```

### `projects` IS THE SIXTH, and the practicals' sibling rather than a kind of practical.

top level, before `LIB_EXTRA`

```
/* `projects` IS THE SIXTH, and the practicals' sibling rather than a kind of practical. ASKED FOR
   AS "the projects are like practicles, but not practicles. so should be a new tag in the finder
   called projects." A practical is an afternoon that ends in a reading or a thing on the bench; a
   project is three or four sessions that end in something a child MADE and keeps -- a film, a
   board game, a recipe book. Same row shape where the two agree (topics, kit, steps), its own
   columns where they do not (`sessions`, `makes`, `share`), and its own file so the 82 practicals'
   rules -- compliance, hazard, IV/DV/CV -- are not asked of a podcast. See `check-projects.js`. */
```

### `textbooks` IS THE SEVENTH — "the @family textbook should be bare bones for now and the textbooks will be in the resources tag in the finder."

top level, before `LIB_EXTRA`

```
/* `textbooks` IS THE SEVENTH — "the @family textbook should be bare bones for now and the textbooks
   will be in the resources tag in the finder." ONE FILE FOR EVERY BOOK, not one file per book, because
   a file is a name in this list and a name here is a deploy: the second book should be rows, not code.
   One row per chapter; see the mapper below and `check-textbooks.js`.
   ---------- THERE ARE NO TEXTBOOKS ON SCREEN ANY MORE, AND THE FILE KEEPS ITS NAME ---------------
   Since 12 Oct every chapter row is one CONTENT CARD (*"Forget the whole concept of it being a text
   book"* — the owner; docs/history/347, part 2), and the cover row is only the defaults its chapters
   inherit. `data/textbooks.json`, `DATA.textbooks` and the row shape STAY, because three things are
   written against them and none of them is on screen: `tools/anim_row.py` rewrites fourteen animation
   rows in place by their `anim` id, `splashSync_` (shell.js) keeps the loading screen's copy of
   `DATA.textbooks[].chapters[].animations`, and `check-anims.js` anchors each animation directly under
   its chapter row. A rename would be churn in all three for a word nobody reads. */
```

### One fetch per tab, all started before this file parsed — see `index.html`.

top level, before `libraryExtraRows_`

```
/* One fetch per tab, all started before this file parsed — see `index.html`. A file that 404s or
   fails answers `[]`, and `libraryExtras_` reads that as "leave the payload's key alone" — which
   since the cut means leaving an empty array alone. See the note above for why that is still the
   right shape now that there is nothing behind it. */
```

### ---------- AND THE SETTINGS TABS, THROUGH THE SAME MACHINE

in `libraryExtraRows_`

```
/* ---------- AND THE SETTINGS TABS, THROUGH THE SAME MACHINE -----------------------------------
     `SETTINGS_TABS` names them as paths — `settings/brand` is `data/settings/brand.json` — so this
     loop is unchanged and there is one implementation of "fetch a tab, answer [] if it did not
     come". A second copy beside it is the second reader this repository keeps recording, under
     `documents_()`, under `paperIdOf_` and under `factsNow_`.

     READ AT CALL TIME, NOT AT PARSE TIME. `settings.js` loads after this file, so naming
     `SETTINGS_TABS` in the `LIB_EXTRA` literal above would be a temporal-dead-zone throw on every
     load — the shape `d = libraryInto_(…)` already cost this project, where a broken line sat
     inside a `try` and nothing after it in the block could run. */
```

### ---------- WITH THE DEPLOY'S STAMP, AS THE BOXERS ALREADY WERE

in `libraryExtraRows_`

```
/* ---------- WITH THE DEPLOY'S STAMP, AS THE BOXERS ALREADY WERE --------------------------------
         `sw.js` SERVES AN EXACT URL STRAIGHT OUT OF ITS STORE, with no network at all — that is its
         warm visit, and it is safe only because every URL it holds carries `?t=` + the deploy. These
         did not: `data/textbooks.json` and every `data/settings/` file were bare, so a device that had
         the worker kept the first copy it ever fetched, for good. A chapter rewritten, a splash retired
         in the sheet, a facet renamed — none of it reached a phone that had opened the site before.
         `index.html`'s early fetch of the boxers stamps them; this is the same stamp for the rest. */
```

### ---------- THE THREE BLOCKS, MOVED OUT OF `doget.gs`

top level, before `libraryExtras_`

```
/* ---------- THE THREE BLOCKS, MOVED OUT OF `doget.gs` ---------------------------------------------
   Every field name, every guard and every three-state null below WAS the backend's, copied line for
   line rather than rewritten: `mat.js` and the boxing screens were written against those exact keys,
   and a mapping that is nearly the same is worse than one that is obviously the same. That was
   written while both existed and the two had to agree exactly. They no longer both exist — the
   blocks are gone from `doget.gs` and this is the only implementation, so the sentence is now
   history rather than a rule. It is kept because it says why the key names are what they are, which
   is the question the next reader asks about `heightMm` sitting over a column called `height_mm`. */
```

### the cheat sheet's components ------------------------------------------------------------ BLANK IS NOT ZERO and three states are not two.

in `libraryExtras_`

```
/* --- the cheat sheet's components ------------------------------------------------------------
     BLANK IS NOT ZERO and three states are not two. An empty height means "whatever the code says"
     and a typed 0 is a real answer; `in_exam` has to be able to say "nobody has checked" rather
     than saying "no". Both distinctions are the backend's and both are why this is `=== ''` rather
     than a truthiness test. */
```

### WHICH SUBJECT, for the cheat sheet's subject select — a column of the file like `levels`, and it wins the way `levels` does.

in `libraryExtras_`

```
/* WHICH SUBJECT, for the cheat sheet's subject select — a column of the file like `levels`,
           and it wins the way `levels` does. A blank cell is '' and the code's answer stands
           (`matSubjectOf`, which reads a piece with no subject as Maths). */
```

### the practicals -------------------------------------------------------------------------- TWO COLUMNS ARE PIPE-SEPARATED AND THAT IS MEASURED, NOT PREFERRED.

in `libraryExtras_`

```
/* --- the practicals --------------------------------------------------------------------------
     TWO COLUMNS ARE PIPE-SEPARATED AND THAT IS MEASURED, NOT PREFERRED. `asList_` splits on commas
     and is right about `topics` and `keystage`, where no value has ever carried one. It is wrong
     here: 14 of the 410 equipment cells hold a comma INSIDE one item -- "Nichrome wire (about 1 m,
     taped to a metre rule)" is one thing and "Bunsen burner, tripod, gauze, heatproof mat" is four,
     and no comma rule can tell those apart. Nothing in either column holds a pipe.

     `required` IS DERIVED AND NOT STORED. The export carried the same fact twice -- a `category` of
     `required`/`fun` beside a `compliance` naming which of the three states a practical is in --
     and they agreed on all 41 rows, which is luck rather than a guarantee. One cell, read here.
     That is the `needs_print` / `print_required` lesson, which cost 356 rows of disagreement. */
```

### AN EXACT MATCH, NOT A SUBSTRING, AND THE DIFFERENCE IS FIVE PRACTICALS.

in `libraryExtras_`

```
/* AN EXACT MATCH, NOT A SUBSTRING, AND THE DIFFERENCE IS FIVE PRACTICALS. The first
           version tested /required practical/ — which is inside `AQA-aligned, NOT A REQUIRED
           PRACTICAL` as well, so the five that say they are not one were flagged as one. The
           check caught it by printing a count that disagreed with the data (33 against 28),
           which is the whole argument for printing counts: nothing threw and the card simply
           told a tutor the exam board demands an experiment it does not. */
```

### ---------- AN EXPERIMENT OR A THING YOU MAKE

in `libraryExtras_`

```
/* ---------- AN EXPERIMENT OR A THING YOU MAKE -------------------------------------------
           ASKED FOR AS "differentiate between a science experiment and a contraption/art and craft
           thing". `subject` says what it is ABOUT and `compliance` says whether a board demands it;
           neither says which of the two SHAPES it is, and a periscope and a titration are not the
           same kind of afternoon.

           WRITTEN PER ROW, NEVER DERIVED. Every word that would make a rule is in both sets —
           "build" is in the steps of half the experiments and "measure" is in the steps of most of
           the builds — and this repository already records what a substring costs here: the five
           practicals that say they are NOT a required practical were flagged as one by
           /required practical/. The tie-break is the row's own `outcome`: if the OBJECT is what you
           end up with it is a build, and if the READING is, it is an experiment.

           IT IS ON `row`, SO THE FUNNEL CAN ASK ABOUT IT WITH NO DEPLOY. `facetFromSheet_` reads
           `x.row[field]`, so one `facets` row naming `practicalType` is a question — and the
           coverage rule keeps it silent until the list is practicals, exactly as it does for
           `Topic`. Nothing here decides that; the sheet does. */
```

### ---------- THE KIT, AS A NAME AND A QUANTITY

in `libraryExtras_`

```
/* ---------- THE KIT, AS A NAME AND A QUANTITY ------------------------------------------
           ASKED FOR AS "each item/ingredient to be like a chip ... and it's quantity". The chips
           were reverted to a list — `kitList_` in find.js — and the half that was worth keeping
           is this one: an item has two halves and the file has to carry both, so `kitParse_`
           splits each item on its own `×`. That character appeared NOWHERE in the 640 items this
           column already held, measured before it was chosen, and it is the one this app already
           means multiplication by — the booking card prints `2 × £24.00` in the same face.

           ONE STRING PER ITEM RATHER THAN A SECOND LIST BESIDE IT, and the argument is written out
           ten lines above this one about `risks`: "three lists that have to line up by index is
           the numbered-column fault wearing a different hat — nothing can check that item 3 of one
           belongs to item 3 of another". A parallel `equipment_qty` is two lists with exactly that
           problem, on a column somebody edits by hand.

           AND THE QUANTITY IS OFTEN ABSENT ON PURPOSE. One stopwatch, one clamp stand, one pair of
           goggles: writing `× 1` on five hundred lines is five hundred pieces of furniture. A
           quantity is written where it MATTERS — more than one, or an amount the method states —
           and `check-practicals.js` refuses a `× 1`. */
```

### THE SHOP JOIN, BY ID, AND NOTHING READS IT YET.

in `libraryExtras_`

```
/* THE SHOP JOIN, BY ID, AND NOTHING READS IT YET. 20 of the 41 name the stock they need --
           `I023,I026,I045,I022` is the trundle wheel, the tape measure, the cones and the first aid
           kit. The shop rows live in the Settings spreadsheet, so this stays an id list until they
           are there: a name would be the `findPerson`-by-name fault, and inventing the rows here
           would be a second shop. */
```

### ---------- THE TEN COLUMNS THE HOME EXPERIMENTS BROUGHT WITH THEM

in `libraryExtras_`

```
/* ---------- THE TEN COLUMNS THE HOME EXPERIMENTS BROUGHT WITH THEM ---------------------
           BLANK ON THE 41 LAB PRACTICALS AND THAT IS NOT A GAP. Nobody has costed a school
           practical because the school owns the kit, and nobody has put a hazard word on one
           because a lab has a technician in it. Every reader below treats absent as absent. */
```

### ---------- THE APPARATUS, AS INLINE SVG

in `libraryExtras_`

```
/* ---------- THE APPARATUS, AS INLINE SVG ------------------------------------------------
           THE SAME COLUMN THE LIBRARY'S QUESTIONS CARRY, for the same reason: a drawing committed
           beside the thing it belongs to cannot separate from it, takes the page's own ink so it
           works on both palettes and offline, and needs no second request. 17 of the 52 have one.

           ONLY WHERE THE ROW'S OWN WORDS DETERMINE THE PICTURE -- CLAUDE.md's rule, and here that
           means a SET-UP or a CONSTRUCTION rather than a result. No cooling curve, no I-V graph,
           no density tower with its layers already in order: that last one is step 2 of its own
           method, so drawing it would answer the question the practical asks. See
           tools/draw-practicals.py, and `check-practicals.js` prints how many still have none. */
```

### ---------- THE RISK ASSESSMENT, ONE SENTENCE PER HAZARD

in `libraryExtras_`

```
/* ---------- THE RISK ASSESSMENT, ONE SENTENCE PER HAZARD -------------------------------
           PIPE-SEPARATED FOR THE REASON `equipment` AND `steps` ARE, recorded above: 14 of the 410
           equipment cells hold a comma inside one item, so a comma cannot separate here either.

           ONE SENTENCE RATHER THAN THREE FIELDS. A school form has hazard / who is harmed /
           control as three columns, and three lists that have to line up by index is the
           numbered-column fault wearing a different hat — nothing can check that item 3 of one
           belongs to item 3 of another. A hazard and what you do about it is ONE fact, so it is
           one string, and `check-practicals.js` asks only that it is there and not empty.

           WRITTEN, NEVER DERIVED. `safety` is prose on every row and turning it into a structure
           by rule is the fault this repository records twice — a substring called five practicals
           "required" when they say they are not. See tools/practical-guides.py. */
```

### ---------- A COST OF NOTHING IS NOT THE SAME FACT AS NO COST

in `libraryExtras_`

```
/* ---------- A COST OF NOTHING IS NOT THE SAME FACT AS NO COST -------------------------
           `libN('')` IS 0, AND THAT IS THE `cost: 0` FAULT THIS REPOSITORY RECORDS FOUR TIMES —
           `Number(x.price) || 0` made a blank cell a price of nought, and 3,262 of 3,265 items
           answered "Free" on a question that then meant nothing. Measuring car speeds really
           does cost nothing to run; a lab practical has simply never been costed. `libNum`
           answers `null` for the second, and `priced_` upstream already tells a card how to draw
           the difference. */
```

### AND WHY IT IS NOT DONE, WHERE IT IS NOT DONE.

in `libraryExtras_`

```
/* AND WHY IT IS NOT DONE, WHERE IT IS NOT DONE. See the note over these rows in
           `check-practicals.js`: an excluded practical is live and carries its reason, because
           `active` means deleted and a decision is not a deletion. */
```

### the projects ----------------------------------------------------------------------------- THE PRACTICALS' MAPPING, CUT TO WHAT A PROJECT HAS.

in `libraryExtras_`

```
/* --- the projects -----------------------------------------------------------------------------
     THE PRACTICALS' MAPPING, CUT TO WHAT A PROJECT HAS. `materials` is `equipment` under the word a
     child would use, and goes through the same `kitParse_` for the same `Name × qty` reason -- a
     second parser for one cell format is the second reader this file keeps recording. `steps` is
     pipe-separated for the comma reason written over `equipment` above.

     `sessions` AND THE TWO AGES GO THROUGH `libNum`, NOT `libN`. A blank is "nobody has said", not
     nought sessions or an age of zero -- the `cost: 0` fault, which a strip reading "0 sessions"
     would be. `check-projects.js` refuses the blank anyway; this is what an older phone does with
     a row somebody pasted in by hand. */
```

### ---------- A PROJECT OR A COURSEWORK, ONE COLUMN

in `libraryExtras_`

```
/* ---------- A PROJECT OR A COURSEWORK, ONE COLUMN ---------------------------------------
           THE OWNER, 9 Oct: "i would like to add course works. make it bare bones. its within
           projects in finder." So coursework is a TYPE of project, as `practical_type` is a type of
           practical, and not a kind of its own: a design-and-make coursework has the project's
           whole shape -- sessions, materials, an ordered list, something made at the end -- and
           the one thing it has that a project does not is a board, which `check-projects.js`
           therefore REQUIRES on a live coursework, from a closed list of boards.

           BLANK READS AS `project`, so the eight rows written before the column existed keep
           working untouched and a row pasted in without it is a project. Lower-cased here, so
           `Coursework` typed into a cell is the same word; anything else is drawn raw on the card
           (`PROJ_TYPE` in find.js) and refused at the file by `check-projects.js`.

           `exam_board` AND `spec_ref` ONLY MEAN SOMETHING ON A COURSEWORK -- note 253: "a how-to
           video has no ... exam board" -- and the card's strip shows them where present.

           THE PRACTICALS' SPELLING, COLUMNS AND FIELDS BOTH: `exam_board` -> `board` and `spec_ref`
           -> `specRef`, exactly as the mapper above. The first cut wrote `exam_board` beside the
           textbooks' `spec` -- one family's board and the other's spec, in the column's first row --
           and one fact under two spellings is the `needs_print` / `print_required` fault this file
           already records. The project's sibling is the practical (`project_type` is
           `practical_type` one kind along), so its spelling won. `check-projects.js` refuses `board`
           and `spec` on a project row, which this line would silently never read. */
```

### the textbooks --------------------------------------------------------------------------- ONE ROW PER CHAPTER, GROUPED HERE INTO ONE OBJECT PER BOOK, because a

in `libraryExtras_`

```
/* --- the textbooks ---------------------------------------------------------------------------
     ONE ROW PER CHAPTER, GROUPED HERE INTO ONE OBJECT PER BOOK, because a flat file is
     one a diff can point into — one object per line, so the next script can append by splitting on
     newlines — and "chapter 9 of GCSE Statistics"
     is a line. The row with `chapter: 0` is the TITLE PAGE — name, summary, subject, level, board,
     spec — so a book's own facts are written once rather than on sixteen rows that could disagree.

     THREE PIPE LISTS, each item `name — the rest`, the em dash being the one separator nothing in
     a definition or a formula needs. A leading `[H] ` marks Higher tier only, read off here into
     `higher` so no card has to know the spelling. A whole chapter that is Higher says so in `tier`
     instead of on every line. `check-textbooks.js` holds the file to all of it.

     ORDERED BY `chapter`, NOT BY LINE. A row pasted at the bottom of the file is chapter 7 if it
     says 7, which is what the sheet would do with a sort. */
```

### ---------- AND THE CHAPTER'S ANIMATIONS, WHICH ARE ROWS OF THEIR OWN

in `libraryExtras_`

```
/* ---------- AND THE CHAPTER'S ANIMATIONS, WHICH ARE ROWS OF THEIR OWN ---------------------------
     "Add the animations from loading to respective subject text books. Matter of fact the source for
     the animations should be in text books. The animation from loading screen are pulling and syncing
     from the text book animations." — the owner, 8 Oct. So a teaching animation (a proof, a law, a
     process) is a row of this file, under the chapter it teaches: `anim` is its id (the
     `splash_id` in data/settings/splashes.json), `title` its page's heading, `about` the chapter's own
     key words, formulas or worked lines it is about, and `html` and `css` the drawing itself, once.
     The loading screen keeps a copy of what this reads (`splashSync_` in shell.js) and draws from it.

     A ROW OF ITS OWN, NOT A COLUMN ON THE CHAPTER: Galton's is 23 KB, which would make every edit to
     a chapter's words a diff nobody can read, and a chapter that also named its animations would be
     a second link that could disagree with this one.

     NOT TRIMMED. `libS` hands the cell back exactly, because the device's copy is compared with this
     one by hash and a trim on one side would be a copy that is never the same. */
```

### ---------- THE COVER IS THE CHAPTERS' DEFAULTS, AND NOT A CARD ANY MORE

in `libraryExtras_`

```
/* ---------- THE COVER IS THE CHAPTERS' DEFAULTS, AND NOT A CARD ANY MORE ------------------
         *"Forget the whole concept of it being a text book. It's just a "content card" or whatever.
         It can share same tags as questions e.g. gcse, ks2, maths."* — the owner, 12 Oct. Each
         chapter is one content card on Find (`contentItem_` in find.js) and wears the question
         library's tags, so it has to KNOW its subject, level, key stage, board and spec. They are
         written once, on the row with `chapter: 0`, and a chapter's own cell wins — the shape the
         file already had for `tier`, where a whole-Higher chapter says so on itself. Filled in
         below, once every row is read, because the cover is found by number and not by line. */
```

### IN FILE ORDER, which is page order:

in `libraryExtras_`

```
/* IN FILE ORDER, which is page order: the first under a chapter is the first page after it. An
       animation whose chapter is not here (switched off, or a number that does not exist) goes
       nowhere — `check-textbooks.js` refuses the file first. */
```

### the boxers ------------------------------------------------------------------------------ ---------- THE RECORD IS `libNum`, NOT `libN`, AND FOURTEEN FIGHTERS

in `libraryExtras_`

```
/* --- the boxers ------------------------------------------------------------------------------
     ---------- THE RECORD IS `libNum`, NOT `libN`, AND FOURTEEN FIGHTERS ARE WHY -------------------
     `libN('')` IS 0, which is right for a count nobody could have left blank and wrong for these.
     Fourteen rows have no record at all and the card drew every one of them as `0-0-0` — an
     unbeaten fighter who never fought, stated as a fact. `losses_ko` is blank on a hundred rows
     and would have printed "0 KO" under every loss column, which is the claim that nobody ever
     stopped Joe Louis. Blank is "not on file", and `null` is how this file says that — the
     `cost: 0` fault again, recorded over `libNum` itself. Height and reach go the same way: a
     fighter 0 cm tall is a blank cell, not a measurement.

     `lineal` AND `hall_of_fame` ARE `libTrue`, NOT `libOn`. `libOn` reads BLANK AS ON — right for
     `active`, where nobody switching a row off means it is live — and it would have put a Hall of
     Fame badge on the twenty-four fighters whose cell is empty and a "lineal champion" on all 103.
     An honour is claimed by a cell that says so, never by one that says nothing.

     `image_credit` RIDES WITH `image`. A Commons photograph is free on condition that its author
     and licence are named wherever it is shown, so the card refuses to draw a photo without its
     credit — see `boxerPic_` in find.js. A column the mapper dropped would have meant no boxer
     could ever show a photo, which is the safe failure, but a silent one.

     `look` AND `trunks` ARE THE EIGHT-BIT FIGHTER'S (`boxerFigure_` in find.js): his skin, hair,
     hair colour and facial hair, and the trunks he usually wore. Folded to lower case and trimmed,
     as a cell typed by hand may not be; a word outside the vocabulary is still passed through and the
     figure draws that part as though it were blank, claiming nothing — `check-library.js` is what
     refuses the cell. `sex` (above) is read by the figure too: a woman wears a top.
     `look_source` is NOT mapped: it is for the owner checking a cell in the file, and every phone
     carrying 103 paragraphs of citations for a drawing it never prints would be weight for nobody. */
```

### the bouts ------------------------------------------------------------------------------- SORTED OLDEST FIRST, because a rivalry only reads correctly in order

in `libraryExtras_`

```
/* --- the bouts -------------------------------------------------------------------------------
     SORTED OLDEST FIRST, because a rivalry only reads correctly in order — the second fight is an
     answer to the first. Sorted here rather than on each screen so they cannot disagree, which is
     the backend's reason and still the reason. */
```

### CUT TO THE DAY HERE, ONCE.

in `libraryExtras_`

```
/* CUT TO THE DAY HERE, ONCE. A date cell arrives as a timestamp, and the exam wave column
           taught this the hard way — a cell meaning "June 2018" reached the phone as sixty
           characters of clock and timezone and was drawn on a filter button exactly as it came. */
```

### THE TRUNKS EACH CORNER WORE THAT NIGHT, where a source names them — the fight card dresses each fighter in these and in nothing else (`boxerPic_`).

in `libraryExtras_`

```
/* THE TRUNKS EACH CORNER WORE THAT NIGHT, where a source names them — the fight card dresses
           each fighter in these and in nothing else (`boxerPic_`). `trunks_source` stays in the file
           for the same reason `look_source` does. */
```

### ---------- THE TWO BLOCKS, MOVED OUT OF `doget.gs`

top level, before `libraryInto_`

```
/* ---------- THE TWO BLOCKS, MOVED OUT OF `doget.gs` ------------------------------------------------
   `d` is the payload as it arrived. Both keys are written onto it before it becomes `DATA`, so
   every reader downstream sees exactly what it saw when the backend built them. */
```

### `const admin = isAdmin()` WAS HERE, declared and never read.

in `libraryInto_`

```
/* `const admin = isAdmin()` WAS HERE, declared and never read. Nothing in the library is filtered by
     who is looking -- an inactive row is dropped for everybody, by `libOn(r.active)` -- and a role
     sitting unused at the top of the mapper is an invitation to start. */
```

### ---------- A DOCUMENT IS NOT A QUESTION, AND IT COMES THROUGH ANYWAY

in `libraryInto_`

```
/* ---------- A DOCUMENT IS NOT A QUESTION, AND IT COMES THROUGH ANYWAY -----------------------
       THIS LINE USED TO SKIP THEM AND IT HAD STOPPED. It tested `kind === 'paper'`, and the rename
       recorded in CLAUDE.md made that value `document` — so the guard has been permanently false
       since, and all 665 document rows have been arriving in `DATA.questions`. The funnel is not
       wrong, because `questionItems` filters `kind !== 'document'` itself; the guard was simply
       dead, wearing a comment describing what it no longer did. Same shape as `resource_type` in
       `VOCAB` and `isEdexcelGcseMaths`, which the same rename also broke in silence.

       SO IT IS DELIBERATE NOW RATHER THAN ACCIDENTAL, because the app needs those rows. A document
       row is where a PAPER-LEVEL fact lives — `needs` carries "No calculator" once per paper
       instead of once per question — and `needsIndex_` in find.js reads them straight out of this
       list. Restoring the skip would have taken that away; leaving a dead line would have left the
       next reader believing the opposite of what happens.

       WHAT STOPS THEM BEING DRAWN is `questionItems`, in one place, where the funnel's own filter
       already is. A document has no text, no marks and no answer, and one arriving as a question
       is the fault this comment was written about. */
```

### `figure` SAYS WHICH KIND OF PICTURE; `diagram` IS THE PICTURE.

in `libraryInto_`

```
/* `figure` SAYS WHICH KIND OF PICTURE; `diagram` IS THE PICTURE. `figure` has been on the
         payload since it was written and nothing has ever drawn it, because it was never a
         picture — it is 253 one-word labels (`venn`, `scatter`, `grid-blank`) left by whoever
         transcribed the paper. `diagram` is the column that holds one, as inline SVG rather than a
         URL: a link is a second thing that has to stay alive, and `style.css` has had
         `.qpaper figure svg` and the label classes waiting for it since before anything could
         produce one. Empty on all but two rows today. */
```

### WHAT YOU HAVE TO HAVE IN FRONT OF YOU — a comma-list, the way `topics` and `keystage` are.

in `libraryInto_`

```
/* WHAT YOU HAVE TO HAVE IN FRONT OF YOU — a comma-list, the way `topics` and `keystage` are.
         On a DOCUMENT row it is the paper's own front page ("You must not use a calculator") and
         covers every question inside; on a question row it is what that one question needs on top.
         `needsOf_` in find.js unions the two. See tools/set-needs.py for why it is one column and
         not three booleans. */
```

### ---------- PICTURES THAT ARE PHOTOGRAPHS OR SCANS, NOT DRAWINGS

in `libraryInto_`

```
/* ---------- PICTURES THAT ARE PHOTOGRAPHS OR SCANS, NOT DRAWINGS ------------------------
         `diagram` IS INLINE SVG DRAWN HERE and takes the page's own ink; `images` is a list of
         addresses. AQA's Paper 1 Question 5 is the case that asked for it — the writing task offers
         a photograph as one of its two prompts, and a question whose prompt is a picture is not a
         question without it.

         A COMMA-SEPARATED LIST, NOT `image_1`, `image_2`, `image_3`. Numbered columns were the
         obvious shape and they are the one that does not scale: three of them are empty on 4,005
         rows, and the day something needs a fourth is a schema change in the data, the mapping, the
         renderer and the check. `topics` and `keystage` are already comma-lists in this file for
         exactly this reason, and `asList_` has read them since before any of it. */
```

### ---------- AN INSERT IS SEVERAL THINGS, AND IT USED TO BE ONE

in `libraryInto_`

```
/* ---------- AN INSERT IS SEVERAL THINGS, AND IT USED TO BE ONE ---------------------------
         AN AQA ENGLISH INSERT IS NOT ONE BLOCK OF PROSE. The paper prints it line-numbered and
         every reading question names a span of it: "lines 1 to 6", "lines 10 to 19", "from line
         20 to the end". One preamble row per paper could hold the whole insert and could not say
         which part of it any question wanted, so a student on Q2 got the entire source and had to
         find lines 10-19 in a row that carries no line numbers at all.

         SO A PREAMBLE IS A LIST NOW, and these are the two columns that make one readable:
         `lines` is the span this part covers, printed as its heading, and `sort_order` is the
         order the paper prints them in. Both are empty on every row that is not an insert part,
         and a single-row preamble needs neither -- which is what keeps this a addition rather
         than a migration. */
```

### ---------- WHAT A MARK IS MADE ON, WHEN THE ANSWER IS A MARK

in `libraryInto_`

```
/* ---------- WHAT A MARK IS MADE ON, WHEN THE ANSWER IS A MARK -------------------------------
         `grid`, `coord`, `blank` or `text` -- squared paper, axes, a space, or the passage itself to
         ring words in. Empty on most rows and inferred from `figure` for a drawing question; said
         here when somebody has decided. See `padSurface_` in find.js. A closed list, held by
         `check-library.js`. */
```

### WHICH EARLIER PART'S DRAWING THIS ONE NEEDS IN FRONT OF IT -- `b` on "Use your graph to find estimates" after (b) drew the graph.

in `libraryInto_`

```
/* WHICH EARLIER PART'S DRAWING THIS ONE NEEDS IN FRONT OF IT -- `b` on "Use your graph to find
         estimates" after (b) drew the graph. The earlier part's own `part` cell, inside this question.
         Empty on all but a few dozen rows; see tools/set-uses.py for which and why, and `usesOf_` in
         find.js for what it draws. */
```

### WHAT A STUDENT COULD TYPE AND BE RIGHT.

in `libraryInto_`

```
/* WHAT A STUDENT COULD TYPE AND BE RIGHT. `answer` is prose for a tutor -- the value, an
         em dash, then the method -- and "16 &mdash; half it." does not equal "16". See
         tools/set-accept.py for why the two are separate columns rather than one parsed twice. */
```

### A CLOSED LIST OF OPTIONS, TAPPED RATHER THAN TYPED.

in `libraryInto_`

```
/* A CLOSED LIST OF OPTIONS, TAPPED RATHER THAN TYPED. `choices` is a pipe list, for the
         practicals' `equipment` reason (an option can hold a comma), and may carry inline HTML (`<i>P</i> = <i>I</i><sup>2</sup><i>R</i>`);
         `choice_right` is the 1-based positions the mark scheme credits, a comma for "tick two".
         Positions rather than option text, so marking is exact and folds nothing. See `choiceBox_`. */
```

### ---------- AN ORDERING IS THE SAME TWO COLUMNS AND ONE MORE

in `libraryInto_`

```
/* ---------- AN ORDERING IS THE SAME TWO COLUMNS AND ONE MORE --------------------------------
         `answer_type: order` (see `orderBox_`): `choices` are the items in the order the paper prints
         them, and `choice_right` is the right ORDER -- `3,4,5,2,1`, the 3rd item first -- and, where
         equal values make more than one order right, the others after a pipe: `2,1,3 | 1,2,3`.
         `choiceRight` is the FIRST of them, so a multiple-choice row (which never has a pipe) reads
         exactly as it did; `choiceWays` keeps every one, because an alternative dropped here is a
         right answer marked wrong. `order_ends` is the row's two ends in the question's own words,
         first end first -- "smallest | largest". */
```

### TWO COLUMNS, ONE FACT, AND THEY ARE DISJOINT.

in `libraryInto_`

```
/* TWO COLUMNS, ONE FACT, AND THEY ARE DISJOINT. `needs_print` is True on 252 rows and
         `print_required` on 104, and **not one row is True in both** — two imports over two
         subsets, neither ever given the other's rows. `find.js` noticed and said so where the
         deleted `Printed?` facet used to be. Unioned here rather than in 356 content rows: a union
         is safe precisely because they are disjoint, so nothing is adjudicated. `printable` is NOT
         folded in — True on 1,287 and a different question, whether a PDF exists to print at all. */
```

### ---------- AND THE ROW ITSELF, WHICH COSTS A POINTER

in `libraryInto_`

```
/* ---------- AND THE ROW ITSELF, WHICH COSTS A POINTER --------------------------------------
         THE LIST ABOVE IS AN ENUMERATION AND ENUMERATIONS GO STALE. It names 29 of the file's 44
         columns, so `topics` (2,918 rows), `description`, `level`, `pages`, `source_url` and nine
         others reach the browser inside `LIBRARY_ROWS` and then stop at this function.

         THAT MATTERED THE MOMENT THE `facets` TAB COULD INVENT A QUESTION. `facetFromSheet_` in
         find.js reads `x[field]` and falls back to `x.row[field]` — the original row — which is
         what lets a new column be filterable without a code change. Without this line that fallback
         reached this enumeration rather than the file, so `field: topics` silently found nothing:
         0% coverage, question never offered. Exactly the silent-nothing this app keeps paying for.

         IT IS A REFERENCE, NOT A COPY, and that is a fact about the language rather than something
         measured: `LIBRARY_ROWS` holds these rows for the life of the page anyway, so this stores
         3,265 pointers at the objects already there and duplicates no row data. */
```

### ---------- THE CHECKLISTS WERE BUILT HERE AND ARE NOT ANY MORE

in `libraryInto_`

```
/* ---------- THE CHECKLISTS WERE BUILT HERE AND ARE NOT ANY MORE --------------------------------
     THIS PUT THE 642 `kind: 'paper'` ROWS INTO `d.dropdowns.checklists`, nested by subject and then
     by band, which is the shape `doGet` had always sent and `allTopics` in find.js read. `allTopics`
     is gone: the funnel lists questions, not the documents they came out of — see the note above
     `questionItems`.

     SO IT IS DELETED RATHER THAN LEFT BUILDING. A structure computed on every load for nobody is
     weight on every phone, and worse, it is a thing the next person reads and believes is wired up.
     `dropdowns.topics` stays an empty array and `checklists` an empty object, both set by `load()`
     in shell.js, because `check-payload.js` and the fixture still name them and an absent key reads
     differently from an empty one.

     THE ROWS THEMSELVES ARE NOT LOST. They are in `data/questions.json` with everything else, still
     `kind: 'paper'`, still carrying the link, the page count and the print flag. Nothing reads them
     today. Anything that lists documents again reads them from there. */
```

### EVERY PAPER HAS A HEALTH SCORE — ONE NUMBER, 0 TO 100, FROM THE ROWS THEMSELVES.

top level, before `HEALTH_HURT`

```
/* ==================================================================================================
   EVERY PAPER HAS A HEALTH SCORE — ONE NUMBER, 0 TO 100, FROM THE ROWS THEMSELVES.

   THE OWNER, 18 Oct: *"Can you add a health check to worksheets or past papers so we can know when we
   are doing something whether it's low accuracy or buggy or missing shit or anything. Like 99% would
   be it's practically perfect and ready to do. This is for work in the finder."*

   ONE FUNCTION AND TWO READERS. The finder's `Health` tag and tile (find.js, `healthOf_`) and the
   owner's report (`node js/check-health.js`) both call this, over the same rows, so the number on a
   card and the number in the report cannot disagree. It lives HERE because this file is the library's
   loader and is a plain script with no DOM: a check loads it in a `vm` and gets the real thing rather
   than a copy (docs/history/354).

   THE SCORE IS THE SHARE OF THE PAPER'S POINTS THAT PASS. A question is worth its marks, or 1 where
   the paper prints none (a Corbettmaths sheet), so a broken six-marker costs six times a broken
   one-marker — which is what it costs a lesson. Each failure takes a SHARE of its question's points,
   by how badly it spoils the work, and two failures on one question compound rather than add, so no
   question loses more than it is worth:

     no words              1.0   there is nothing to do
     no answer             0.5   it can be done and not checked — a tutor needs the scheme in hand
     needs a picture       0.6   "the triangle shown" over no triangle is usually not answerable
     picture in words      0.25  `Figure: a circle of radius 4cm` — answerable, and still not the paper
     words are a stand-in  0.5   `placeholder` on the row or on the preamble above it: a description
                                 of the real thing, sat only with the printed paper beside you
     no marks              0.15  where the paper prints marks: it can be done, the weight is a guess

   AND THREE THINGS ABOUT THE WHOLE PAPER, which no one row can say:

     marks add to X of T   the missing (or doubled) marks are missing points: |T − X| of them. T is
                           the paper's own `total_marks`, or 80 for an Edexcel GCSE maths paper —
                           `outOf` in check-library.js, the same two answers in the same order.
     Q4 missing            a gap in the question numbers. It costs a question of the paper's mean
                           worth — unless a stated total is already short by it, which says so.
     not checked           no row of the paper carries `pages_checked`. THAT COLUMN IS WEAK EVIDENCE
                           and is weighed as such: it says the PAGE COUNT was checked against the PDF
                           (resource.js labels it so), not that every question was read against it.
                           There is no column that says that, so it moves the score by 1 — the gap
                           between 99 and 100 — and nothing more.

   A PICTURE IS NEEDED when the row names a figure that is not somewhere to write (`figure` outside
   the answer-space labels check-library.js lists), or its words say `diagram`, `shown`, `graph`,
   `table below` or `grid`. It is THERE when the row draws one (`diagram`, `images`, an inline svg,
   img or table in `html` or `lead`), when a preamble over it does (paper, section or question scope,
   `preamble_`'s three), when it `uses` an earlier part's drawing, when it is a drawing question whose
   words only ask for a grid (the box is the grid, `padSurface_`), or when the row says it is sat on the
   printed sheet (`needs_print` / `print_required`) and the paper has a PDF to print.

   READY IS 98 AND UP, USABLE 85 TO 97, ROUGH UNDER 85 — the owner's "99% would be practically
   perfect", with one point of room for the unchecked page count above. Rounded DOWN, so a paper
   at 97.9 is not shown as a Ready 98.

   INACTIVE ROWS ARE NOT COUNTED, the rule `libraryInto_` applies: what nobody can be shown cannot
   spoil what they are shown. A paper with no question rows has no score — the transcription queue
   check-library.js counts, not a paper at 0%.
================================================================================================== */
```

