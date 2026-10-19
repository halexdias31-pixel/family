# js/mat.js

The full text of comments in `js/mat.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — js/mat.js (19 of 20) THE CHEAT SHEET MAKER — one sheet of A4, built from components you tick, printed from the app.

top level, before `MAT_ROOM`

```
/* ==================================================================================================
   @family. — js/mat.js   (19 of 20)

   THE CHEAT SHEET MAKER — one sheet of A4, built from components you tick, printed from the app.

   IT IS STILL `mat.js`, AND THE IDS ARE STILL `mat-`. The name on the screen changed; the filename
   is listed in `index.html` and in six checkers, and the ids are matched by `check-css` and
   `check-scope`, so renaming the file to match the label would be a rename in nine places to fix
   nothing a person can see. What the tool is called and what the file is called are allowed to be
   different things.

   IT WAS A SEPARATE FILE and the reason to bring it in is the same as the flyers: a second file is
   a second thing to deploy, and its list of levels was a copy of the one already in the sheet.
   `DATA.dropdowns` carries the real ones — SATs, 11+, GCSE and the rest — so the mat can offer
   exactly the levels the rest of the site knows about, and a level added there arrives here.

   THE THING THAT MAKES IT WORK IS THE GAUGE. A4 has 262mm of usable column and the components add
   to far more, so a picker with only tickboxes would let somebody build a mat that runs off the
   bottom of the page — and they would find out at the printer, with the last thing they ticked
   silently cut off. The gauge MEASURES the rendered column rather than adding up a table of
   numbers, because two half-width blocks side by side cost the taller of them and no table can
   know which pairs got ticked.
================================================================================================== */
```

### ---------- HOW MANY NARROW BLOCKS GO ACROSS

top level, before `MAT_TRACKS`

```
/* ---------- HOW MANY NARROW BLOCKS GO ACROSS -----------------------------------------------------
   THREE, AND IT IS NOT A SETTING ANY MORE. `MAT_ACROSS` said how many narrow blocks shared a run,
   and a narrow block's width depended on it and on how many others happened to be ticked beside it.
   The page is a six-track grid now and a narrow block is always two tracks — a third — so three go
   across because 6 / 2 is 3, not because a constant says so. See "EVERY COMPONENT HAS A FIXED AREA"
   below. */
```

### ---------- EVERY COMPONENT HAS A FACE

top level, before `MAT_TRACKS`

```
/* ---------- EVERY COMPONENT HAS A FACE ------------------------------------------------------------
   THE PICKER WAS TWENTY-FIVE PHRASES AND YOU HAD TO READ ALL OF THEM. 'Compound measures',
   'Rounding & bounds', 'Percentage change' — three or four words each, wrapping to two lines in a
   column that narrow, and none of them is what the block looks like on the sheet. Finding the
   density row meant reading, and reading twenty-five times to tick four things is the tool getting
   in the way of the job.

   SO EACH ONE SHOWS ITS OWN MATHS INSTEAD. `d / t` is compound measures. `≈` is bounds. `A ∩ B` is
   set notation. A maths teacher recognises those without reading them, which is the difference
   between scanning and reading, and it is the whole of what makes a long list usable.

   THE NAME IS NOT LOST — it is on `title` for a hover and on `aria-label` for a screen reader, and
   it is the heading of the block on the sheet itself, which is where somebody who does not know the
   symbol will meet it anyway.

   THE RULE IS: THE MATHS ALONE WHERE THE MATHS IS UNMISTAKABLE, and the maths plus one word where
   it is not. `πr²`, `y = mx + c`, `P(A)`, `a²+b²=c²` and `N(μ,σ²)` need nothing — each is the only
   thing it could be. `⌒`, `≈`, `∠`, `x̄` and `Σ` do not: a lone arc could be an arc, a sector or a
   circle theorem, and `≈` could be rounding, bounds or estimation. Those take the word — `◯
   theorems`, `≈ bounds`, `∠ named`, `x̄ averages`, `Σ series` — which is still one word and still
   scanned rather than read.

   THE SYMBOL COMES FIRST IN THE PAIR, because that is the part the eye lands on; the word is there
   to settle which of two or three things the symbol meant, and it is only read if the symbol did
   not already answer it.

   AND A WORD ALONE WHERE THERE IS NO NOTATION. 'HCF · LCM' and 'nth term' are words because the
   notation for them is either nothing or the whole block, and an invented glyph would be worse. */
```

### ---------- EVERY COMPONENT HAS A FIXED AREA

top level, before `MAT_TRACKS`

```
/* ---------- EVERY COMPONENT HAS A FIXED AREA -----------------------------------------------------
   ASKED FOR AS "make all components of cheat sheet maker fixed in area". What the sheet did before
   is recorded in the notes on the parts list: a narrow block's WIDTH depended on how many other
   narrow blocks shared its run (one alone was drawn at the full 184mm, three shared 56mm each), and
   its PLACE depended on a balancer that moved blocks between columns after measuring them. You
   ticked Roman numerals at the foot of the list and the hundred square at the top changed size.

   SO THE PAGE IS A GRID AND EVERY COMPONENT OWNS A SLOT IN IT. Six tracks across the 184mm text
   block, a 2mm row, and each component declares how many tracks wide it is (`span`: 2, 4 or 6) and
   how many millimetres tall (`MAT_SLOT` below). Neither number reads what else is ticked, so a
   component is the same size on every sheet it is ever put on — which is what "fixed" means. The
   browser's own grid placement (`dense`) fills the slots; nothing here measures and moves blocks.

   SIX RATHER THAN THREE, because six divides into the three widths this sheet actually has: a third
   (2 tracks, text blocks), two thirds (4 tracks, the two big grids — see M02/M03) and the whole
   width (6, the pictures whose meaning is spread sideways). A two-thirds grid leaves exactly one
   third beside it, which a narrow block fills, so a big grid never costs a strip of white. */
```

### THE TEXT BLOCK IS 184mm AND STAYS 184mm.

top level, before `MAT_TEXT_W`

```
/* THE TEXT BLOCK IS 184mm AND STAYS 184mm. The sheet is 210 wide and gives up 6mm on the right and
   20mm on the left to the ruler. With the ruler off, the left margin shrinks and the grid does NOT
   widen into it: a slot that is 184/3 wide on one sheet and 198/3 on another is not a fixed area. */
```

### ONE TRACK, AND A SPAN OF N OF THEM — the same two constants the stylesheet is given, so the price in the picker and the width on the paper cannot disagree

top level, before `matTrackW`

```
/* ONE TRACK, AND A SPAN OF N OF THEM — the same two constants the stylesheet is given, so the price
   in the picker and the width on the paper cannot disagree (the fault this file records twice: `half`
   priced at 99mm while drawn at 61, the ruler priced at 0cm² while the bar charged 52). */
```

### ---------- THE SECOND FILTER, AND WHY LEVEL ALONE WAS NOT ENOUGH

top level, before `MAT_TIERED`

```
/* ---------- THE SECOND FILTER, AND WHY LEVEL ALONE WAS NOT ENOUGH -------------------------------
   HALF THE GCSE COMPONENTS ARE HIGHER-ONLY. Exact trig values, negative and fractional indices,
   sphere and cone, perpendicular gradients, cubic and reciprocal graphs — a Foundation student
   handed a sheet carrying those gets a page of things that cannot come up, at the cost of the room
   the things that can would have taken. Tagging them 'GCSE' and stopping was the whole problem:
   the level says which exam, and nothing said which paper.

   ONLY SOME LEVELS ARE TIERED, which is why this is a list and not a flag on every level. A tier
   offered on SATs is a question with no answer, so the level select splits these into Foundation
   and Higher and nothing else — and only for a subject whose pieces change with it (see
   `MAT_TIERED_SUBJECTS`, and `matLevelChoices`, which draws the split).

   AND HIGHER CONTAINS FOUNDATION. That is what makes two options enough rather than three: Higher
   is already the everything view, so 'H' is the default and the opening sheet is what it always
   was. Foundation is the one that takes things away. */
```

### WHICH TIER WAS LAST CHOSEN, and separately WHICH TIER IS BEING DRAWN (`MAT_SHOW`).

top level, before `MAT_TIER`

```
/* WHICH TIER WAS LAST CHOSEN, and separately WHICH TIER IS BEING DRAWN (`MAT_SHOW`). They are not
   the same: on an untiered level nothing should be filtered, so the drawn tier is 'H' whatever was
   chosen — and the choice has to be kept, or choosing GCSE Foundation, looking at A-level and
   coming back would silently promote the sheet to Higher. It was a pair of buttons; it is the
   `|F` / `|H` half of the level select's value now, and the rule is the same. */
```

### ---------- GIVEN IN THE EXAM, AS A FILTER

top level, before `MAT_EXAM`

```
/* ---------- GIVEN IN THE EXAM, AS A FILTER --------------------------------------------------------
   'not given' WAS WRITTEN AS THE EXCEPTION AND TURNED OUT TO BE THE RULE. The comment on the tag
   says a marker on most of the list is a marker nobody sees, and that is exactly what happened: on
   GCSE Higher about twenty of twenty-five rows are not given, so the tag appeared on nearly all of
   them, said the same thing the red name already said, and pushed the area figure off the row.

   THE ROW COLOUR KEEPS THE JOB — it is what a scan picks up, which is what the tag was for. What
   the tag could not do is answer the question somebody actually has, which is "show me only the
   ones the paper will not give me". A filter does that, and it doubles as the key: 'all' / 'not
   given' / 'given' names the colour without a legend sitting under the list.

   AND THEN THE FILTER BECAME ONE BOX, and the colour went with the pills that explained it — see
   `matChoices`. `all` or `not`: the third answer, "show me only what the exam gives me", is not a
   sheet anybody makes. */
```

### Each component: what it is called, which levels it suits, what it costs in millimetres, and whether it sits half-width so it can pair with the next one.

top level, before `MAT_PARTS`

```
/* Each component: what it is called, which levels it suits, what it costs in millimetres, and
   whether it sits half-width so it can pair with the next one.
   THE HEIGHTS ARE MEASURED. The first set were estimates and the gauge was wrong by 300mm — a
   gauge that lies is worse than none, since it is the only thing between a tickbox and a wasted
   sheet. Each was rendered alone and measured. */
```

### WHAT PUTS A COMPONENT UNDER A LEVEL, since the first set were tagged by which exam the topic belongs to and that is the wrong question.

top level, before `MAT_PARTS`

```
/* WHAT PUTS A COMPONENT UNDER A LEVEL, since the first set were tagged by which exam the topic
   belongs to and that is the wrong question. The right one: would somebody sitting THAT exam still
   be getting this wrong? A level therefore inherits what it has not yet stopped forgetting, and
   drops what it has — which is why exact trig values reach A-level and times tables do not.

   AND THE TAGS HAVE TO MATCH THE SHEET'S WORDS EXACTLY. `matLevels()` reads the option list from
   the sheet and these are compared with `indexOf`, so a level written "A-Level" there and 'Alevel'
   here is not a mismatch anybody sees — it is a picker that comes up empty, which reads as a level
   nothing was ever built for.

   THIS IS NOW THE FALLBACK, NOT THE SOURCE. The `cheatsheet` tab owns the name, the levels, the
   tier, the height, the pairing and the order; `matParts()` merges its rows over this list. What is
   written here is what a component looks like to somebody who has never opened the sheet — which is
   also what it looks like before `?setup=1` has been run, so it has to be right rather than blank.
   THE DRAWINGS STAY IN CODE, in `MAT_HTML` below, keyed by these ids. An id is the join between a
   row and a function, which is why they are dull: M02 names a function, not a hundred-square. */
```

### GIVEN IN THE EXAM, OR NOT — `inExam` ON EACH COMPONENT

top level, before `MAT_PARTS`

```
/* ==================================================================================================
   GIVEN IN THE EXAM, OR NOT — `inExam` ON EACH COMPONENT

   Checked against the 2026 GCSE maths formula sheet, which Ofqual provides to every candidate on
   every board. Nine formulae are on it. Everything else must be recalled, and a cheat sheet exists
   to carry the everything else — so this is the field that decides whether a component is worth the
   paper at all.

   TWO OF THE OLD "FORMULAE NOT GIVEN" BLOCK ARE GIVEN. The sphere and the cone are printed IN the
   question whenever one comes up, and always have been, sheet or no sheet. Grouped under a heading
   that called all eight not-given, they were teaching the opposite of the truth to anybody who read
   the heading — which is the second reason that block had to come apart.

   HIGHER AND FOUNDATION GET DIFFERENT SHEETS. The quadratic formula and the sine and cosine rules
   are on the Higher one only, so both are marked given while a Foundation student still has to
   know them. Both components are already tagged `H`, so a Foundation sheet never offers them and
   the two facts cannot contradict each other on screen.

   IT EXPIRES. Ofqual has confirmed the sheet for 2026 and 2027 and is withdrawing it from 2028.
   Every `true` below becomes `false` that year, which is a bigger change to this table than any
   syllabus revision — and it is in the sheet's `in_exam` column, so it will not need a developer.
================================================================================================== */
```

### ---------- THE RULER IS A COMPONENT LIKE ANY OTHER

in `MAT_PARTS`

```
/* ---------- THE RULER IS A COMPONENT LIKE ANY OTHER ----------------------------------------------
     IT WAS ALWAYS THERE, drawn straight into the sheet and impossible to switch off, which made it
     the one thing on a cheat sheet nobody could choose. Fine for a maths mat; wrong the moment the
     sheet stopped being only that — a revision sheet of formulae does not want a centimetre scale
     down its edge, and a flyer never did.

     `edge: true` MEANS IT LIVES IN THE MARGIN, NOT THE COLUMN. Every other component takes height
     from the 262mm the gauge is counting; this one takes width from the left margin instead. So it
     costs 0 against the budget, which is not a fiddle — it genuinely uses none of the space the
     other pieces are competing for. */
```

### `h` IS ITS REAL HEIGHT, THE WHOLE PAGE.

in `MAT_PARTS`

```
/* `h` IS ITS REAL HEIGHT, THE WHOLE PAGE. It was 0 back when the gauge counted height and an edge
     piece had to be made free by lying to it. The gauge counts area now and works the strip out for
     itself — but the PICKER prices from `h`, so the list went on saying 0cm² for a component the
     bar was charging 52cm² for. Two numbers for one thing, and the visible one was the wrong one. */
```

### ---------- THE TWO GRIDS ARE TWO THIRDS OF THE PAGE WIDE

in `MAT_PARTS`

```
/* ---------- THE TWO GRIDS ARE TWO THIRDS OF THE PAGE WIDE --------------------------------------
     ASKED FOR AS "make number square bigger" and "make time table square bigger". They were two
     across at 88mm, which is where the old run logic could guarantee them a fixed size; with every
     component in a fixed slot the size is free to be chosen rather than defended, and it is four of
     the six tracks — about 121mm, cells 12mm for the hundred square and 9.3mm for the times table,
     digits a third larger again in the stylesheet.
     NOT THE FULL WIDTH. A hundred square 184mm across is 184mm tall — most of the 262mm page — and
     the times table would have nowhere to go. Two thirds leaves exactly a third beside each, which
     the grid fills with narrow blocks, so neither costs a strip of white.
     `pair` STILL NAMES THEM, and now means "the two-thirds slot" rather than "a run of two". The
     name is kept because the sheet, the picker and `check-flow` already use it. */
```

### ---------- THE FOUR THAT KEEP THE FULL WIDTH

in `MAT_PARTS`

```
/* ---------- THE FOUR THAT KEEP THE FULL WIDTH ----------------------------------------------------
     WIDTH IS FUNCTIONAL IN THESE, not a default. Circle theorems is eight figures — at 61mm they
     would be 7mm across, which is smaller than the type beside them. Graph shapes is five curves,
     2D shapes a row of them, and a number line is a line: all three are pictures whose meaning is
     spread sideways, and stacking them does not make them narrower, it makes them wrong.

     SINE & COSINE KEEPS IT TOO, for the one reason a text block can: `a² = b² + c² − 2bc cos A` is
     about 45mm of formula, and 61mm minus a 24mm label column leaves 37. A formula that wraps is a
     formula misread. */
```

### MEASURES AND FRACTION=DECIMAL REACH B-TEC.

in `MAT_PARTS`

```
/* MEASURES AND FRACTION=DECIMAL REACH B-TEC. Unit conversion and percentages are most of what an
     applied course asks arithmetically, and it was tagged as though B-TEC were a level above them
     rather than the one course that uses them every week. */
```

### NOT AN A-LEVEL BLOCK, WHICH IS WHAT ITS NAME SAYS.

in `MAT_PARTS`

```
/* NOT AN A-LEVEL BLOCK, WHICH IS WHAT ITS NAME SAYS. "Formulae not given" names a GCSE exam
     convention, and every line in it — circle, sphere, cone, prism, compound measures, percentage
     change, compound interest — is GCSE content that Y9 mocks and B-TEC both examine. An A-level
     student has a different booklet and does not consult this one. */
```

### ---------- EIGHT FORMULAE, EIGHT TICKBOXES

in `MAT_PARTS`

```
/* ---------- EIGHT FORMULAE, EIGHT TICKBOXES ------------------------------------------------------
     "Formulae not given" WAS ONE BOX HOLDING EIGHT UNRELATED FACTS. A student wanting the circle and
     percentage change had to take the cone and compound interest with them, and the only thing the
     eight had in common was a fact ABOUT them — that the exam does not print them. That is a
     property, not a shelf. Grouping by it made the sphere and the prism into one object.

     SO EACH IS ITS OWN COMPONENT and "not given" is a marker on it, which is the honest shape: any
     component can be given or not given, and several outside this old group are. */
```

### AS BUT NOT ALEVEL was the clearest error in the table:

in `MAT_PARTS`

```
/* AS BUT NOT ALEVEL was the clearest error in the table: A-level contains everything AS does, so
     a component offered to the first year and withheld from the second cannot be right either way
     round. B-TEC too — gradient is how every rate-of-change task on an applied course is read. */
```

### THE HEIGHTS BELOW ARE MODELLED, NOT MEASURED, and they are the weakest numbers in this file.

in `MAT_PARTS`

```
/* THE HEIGHTS BELOW ARE MODELLED, NOT MEASURED, and they are the weakest numbers in this file.
     A wrap model calibrated on the four hand-measured pair blocks still came out between 15% and
     70% low, because how far a row wraps depends on the exact string. They are scaled up from it
     and should be read as indicative — the gauge measures the real column, so a sheet cannot
     overrun on the strength of a wrong label, but a label can still tell you 28mm and cost 40. */
```

### B-TEC, LIKE THE ALGEBRA EITHER SIDE OF IT.

in `MAT_PARTS`

```
/* B-TEC, LIKE THE ALGEBRA EITHER SIDE OF IT. Index laws, the straight line and standard form all
     carry B-TEC; solving a quadratic is the same kind of tool on the same kind of course, and its
     absence here was an omission rather than a decision. */
```

### NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the

in `MAT_PARTS`

```
/* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
```

### NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the

in `MAT_PARTS`

```
/* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
```

### SET NOTATION SITS BESIDE PROBABILITY because that is where the sheet already talks about A and B — 'A and B' and 'A or B' are M27's words for what this block

in `MAT_PARTS`

```
/* SET NOTATION SITS BESIDE PROBABILITY because that is where the sheet already talks about A and
     B — 'A and B' and 'A or B' are M27's words for what this block gives the symbols for. Higher
     only: Foundation meets Venn diagrams but is not asked to read the notation. */
```

### YEAR ONE IS 'AS','Alevel' AND YEAR TWO IS 'Alevel' ALONE.

in `MAT_PARTS`

```
/* YEAR ONE IS 'AS','Alevel' AND YEAR TWO IS 'Alevel' ALONE. The pair of them is the only place in
     this table where one level contains another, which is why it is the only place a component is
     deliberately withheld from the lower of the two rather than shared upward. */
```

### NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the

in `MAT_PARTS`

```
/* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
```

### NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the

in `MAT_PARTS`

```
/* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
```

### NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the

in `MAT_PARTS`

```
/* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
```

### NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the

in `MAT_PARTS`

```
/* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
```

### ---------- THE PERIODIC TABLE

in `MAT_PARTS`

```
/* ---------- THE PERIODIC TABLE -------------------------------------------------------------------
     ASKED FOR BY NAME: "add periodic table to cheat sheet maker". A science sheet on a maths tool,
     and the right place for it anyway — the paper, the gauge and the print are all here, and a
     second tool for one A4 page would be a second print path to keep working.
     FULL WIDTH, because it is eighteen columns and every column is a group: at a third of the page
     a cell would be 3mm across, which is smaller than the symbol it has to hold.
     GIVEN IN THE EXAM. AQA and Edexcel both hand a periodic table to every science candidate, so
     `inExam: true` — the sheet's `in_exam` column can say otherwise per board without a deploy.
     THE LEVELS ARE THE ONES THAT SIT CHEMISTRY. Y9 mocks start it, GCSE is where it is used most,
     and A-level chemistry uses the same table; SATs and 11+ never ask for it. */
```

### ---------- THE pH SCALE AND THE INDICATORS

in `MAT_PARTS`

```
/* ---------- THE pH SCALE AND THE INDICATORS --------------------------------------------------------
     ASKED FOR AS "add ph indicator to cheat sheet". The universal indicator colours from 0 to 14, the
     words a question uses for each end, and the three single indicators a GCSE paper names (litmus,
     methyl orange, phenolphthalein) with the colour each turns in acid and in alkali.
     TWO THIRDS WIDE (`pair`), because fifteen colour cells need about 8mm each to hold their number,
     and a third of the page would make them 4mm; the third left over takes another piece beside it.
     NOT GIVEN IN THE EXAM — nobody hands a student the colour chart, which is why it is worth a slot.
     NAMED WITHOUT "pH" because a piece's heading is set in capitals, and "PH SCALE" is the one way a
     chemist would never write it; the list's own face still says pH 0–14. */
```

### ---------- THE NUMBER LINE WITH NEGATIVES

in `MAT_PARTS`

```
/* ---------- THE NUMBER LINE WITH NEGATIVES -------------------------------------------------------
     ASKED FOR AS "add minus number line". Every whole number from −10 to 10, zero longer and bolder
     than the rest because it is the one the whole picture turns on, and an arrow at each end because
     the line does not stop at ten either way.
     A PIECE OF ITS OWN RATHER THAN A WIDER M04, because the two answer different questions: M04 is
     the space between 0 and 1, and a line long enough to carry −10 would squeeze its quarters and
     thirds into a few millimetres. Both can be on one sheet.
     FULL WIDTH, the reason M04 gives: a line is a picture whose meaning is spread sideways, and
     twenty-one steps across a third of the page would be 2.5mm each.
     THE LEVELS ARE THE ONES THAT ASK ABOUT NEGATIVES: KS2 SATs and the 11+ (temperatures, counting
     back past zero), and Y9 mocks and GCSE on both tiers — so no `tier`. Not given in the exam.
     M52, NOT M51: M51 is the pH scale on another branch, and two pieces under one id would be one
     row of the sheet's tab answering for both. `at0` 35 puts it straight after M04, which the sheet
     orders at 30 (and M05 at 40). */
```

### ---------- EACH COMPONENT'S HEIGHT, IN MILLIMETRES OF PAPER

top level, before `MAT_SLOT`

```
/* ---------- EACH COMPONENT'S HEIGHT, IN MILLIMETRES OF PAPER ----------------------------------------
   MEASURED, NOT ESTIMATED. Every component was drawn alone at its own slot width with nothing
   clipping it — on the Higher view of the Everything list, which is the version with the most rows —
   and its natural height rounded UP to the 2mm row. That is the slot, on every sheet, for good.
   A FOUNDATION SHEET LEAVES AIR IN SOME SLOTS, deliberately: the tier hides rows inside a block, and
   a slot that shrank with them would be a component whose size depends on a button two rows up —
   the exact fault this table exists to end.
   A COMPONENT WITH NO ENTRY falls back to its `h` plus the heading, rounded up; `matPaint` also
   grows any slot its drawing overflows rather than clip a formula, and says so in the console — so a
   stale number here costs a slightly bigger box, never a missing line on the printed page. */
```

### THE ENGLISH PIECES (see `MAT_PARTS_EN`), measured the same way — each alone at its own slot width, its scroll height read off the page — and given a millimetre

in `MAT_SLOT`

```
/* THE ENGLISH PIECES (see `MAT_PARTS_EN`), measured the same way — each alone at its own slot
     width, its scroll height read off the page — and given a millimetre before rounding, because a
     label-and-value block wraps a word or two differently in another browser's sans-serif and the
     alarm below should be for a stale number, not for a font. */
```

### WHAT IS TICKED WHEN IT OPENS, from the sheet when the sheet says.

top level, before `matStart`

```
/* WHAT IS TICKED WHEN IT OPENS, from the sheet when the sheet says. `start_on` on the cheatsheet
   tab decides it; the list above is what happens when no row does, which is also what happens
   before the payload lands. Falling back to a working example rather than to nothing is the whole
   reason that list exists — see the note above it. */
```

### ---------- NOTHING IS TICKED UNLESS THE SHEET SAYS SO

in `matStart`

```
/* ---------- NOTHING IS TICKED UNLESS THE SHEET SAYS SO ------------------------------------------
     THERE WAS A LIST OF SEVEN HERE and it was reached whenever the sheet had nothing to say — an
     empty tab, a backend not yet redeployed, a payload still in flight. Every one of those is a
     REASON TO KNOW NOTHING, and the code answered all three with a confident seven ticks that
     nobody had asked for and unticking could not remove.

     A DEFAULT THAT SURVIVES BEING OVERRULED IS NOT A DEFAULT. `start_on` is the only thing that
     ticks a box now; no rows means no ticks, which is also the honest picture of knowing nothing. */
```

### ---------- NOTHING IS CHOSEN FOR YOU

top level, before `MAT_LEVEL`

```
/* ---------- NOTHING IS CHOSEN FOR YOU --------------------------------------------------------------
   THIS OPENED ON 'SATs', which is one of nine levels and was picked by being first to mind when the
   line was typed. For anybody teaching GCSE it is simply the wrong sheet, silently — the list is
   already filtered before they have touched anything, and there is no sign that a filter is on.
   `all` IS THE ONLY NON-ANSWER. It shows every component and privileges no level, so the first
   choice on the screen is still the user's to make. */
```

### THE LEVELS THE REST OF THE SITE USES.

top level, before `matLevels`

```
/* THE LEVELS THE REST OF THE SITE USES. `primary` and `secondary` were a vocabulary I invented, and
   the options tab already lists the real ones — so a level added there arrives here without anybody
   remembering this file exists. The fallback is only for a payload that has not loaded. */
```

### `levels`, AND IT IS A PLAIN ARRAY OF STRINGS — `book.js` hands it straight to a question as options, which is the proof.

in `matLevels`

```
/* `levels`, AND IT IS A PLAIN ARRAY OF STRINGS — `book.js` hands it straight to a question as
     options, which is the proof. I had written `x.value || x.name || x` in case they were objects;
     guessing at two shapes when one file already answers it is how a wrong guess ships. */
```

### THE BRAND, READ THE WAY THE FLYER READS IT.

top level, before `matBrand`

```
/* THE BRAND, READ THE WAY THE FLYER READS IT. Not a second copy of the fallbacks — a cheat sheet
   and a flyer printed the same afternoon carrying two different site addresses is exactly the drift
   that brought the flyer in from its own file. `brand()` alone was not enough: it falls back to
   whatever the caller passes, and this file passed '' for the site, so the footer printed a blank
   where the address goes on every sheet where the brand tab has no `site` row.
   The guard is for the case where flyer.js is not loaded; the fallbacks below are the same ones. */
```

### ---------- WHERE THE COMPONENTS COME FROM

top level, before `matTierFlag`

```
/* ---------- WHERE THE COMPONENTS COME FROM ------------------------------------------------------
   THE DRAWINGS ARE IN CODE AND THE TAGS ARE IN THE SHEET, which is the only split that works: a
   protractor's 181 ticks and a set of plotted curves are not things a spreadsheet can hold, and the
   levels a component suits are edited far more often than the way it looks.

   THE SHEET OVERRIDES; IT DOES NOT REPLACE. Every component below still exists with its own tags if
   the `cheatsheet` tab is missing, empty, or has no row for it — so this works before `?setup=1` has
   ever been run, and a component added in code works on the day it ships rather than on the day
   somebody remembers to type a row.

   AN EMPTY CELL MEANS "NO OPINION", which is why the backend sends blanks as `null` rather than as
   '' or 0 or FALSE: a blank `half_width` read as FALSE would turn every paired block full-width, and
   a blank `sort_order` read as 0 would move it to the top. Those are the two cells most likely to be
   left alone, so getting this wrong would break the ordinary case rather than an edge one. */
```

### THE SHEET SAYS `Higher` AND THE CODE SAYS 'H'.

top level, before `matTierFlag`

```
/* THE SHEET SAYS `Higher` AND THE CODE SAYS 'H'. The full word is what the resources tab already
   stores against all 78 past papers, so that is the word to type; this is the one place the two
   vocabularies meet, rather than every row of every table having to pick one. */
```

### IN THE CODE AND NOT IN THE SHEET is not the same as switched off.

in `out`

```
/* IN THE CODE AND NOT IN THE SHEET is not the same as switched off. The backend only sends rows
       whose `active` is on, so a component with no row here is one the sheet has never been told
       about — and it keeps everything the code says about it. */
```

### ---------- AN EDGE PIECE'S HEIGHT IS NOT A SETTING

in `out`

```
/* ---------- AN EDGE PIECE'S HEIGHT IS NOT A SETTING -------------------------------------
         THE SHEET SAID 0 AND THE SHEET WON. The code was corrected to 262 and the picker still
         printed 0cm², because a row in the tab overrides the code — and that row still held the
         0 written back when an edge piece had to be free to keep the old height-based gauge happy.
         Two places holding the same fact, and the wrong one had the last word.

         BUT IT IS NOT REALLY TWO PLACES. A strip down the margin runs the full height of the page;
         that is what "down the edge" MEANS. There is no version of it that is 40mm tall, so there
         is nothing here for anybody to set — and a setting with one correct value is a way to be
         wrong, not a way to choose. The gauge already worked this out for itself, which is why the
         bar charged 52cm² while the list said nothing. Now the list asks the same question. */
```

### ---------- AND THE SLOT IS NOT A SETTING EITHER

in `out`

```
/* ---------- AND THE SLOT IS NOT A SETTING EITHER -----------------------------------------
         THE SHEET'S `height_mm` AND `half_width` USED TO WIN, and that is how a component's size came
         to depend on a cell: six rows say `half_width: False` for blocks the code draws narrow, and
         the heights in that tab are the estimates this file already calls "a long way out" (index
         laws written as 24mm, rendering at 77). A fixed area has to be decided in one place and
         measured against the drawing, so both come from the code — `matSlot` below. The sheet still
         owns the name, the levels, the tier, the order and whether a component is offered at all. */
```

### ONE SUBJECT AFTER ANOTHER, THEN THE SHEET'S ORDER WITHIN IT.

in `matParts`

```
/* ONE SUBJECT AFTER ANOTHER, THEN THE SHEET'S ORDER WITHIN IT. The tab numbers each subject from
     10 — the English rows restart where the maths ones start — so ordering on the number alone
     interleaved them, a hundred square beside the alphabet, on the one view that shows both. Which
     subject comes first is `matSubjectOrder`'s answer, the same one the subject select gives, so the
     list and the select cannot disagree about it. The ruler is in no subject and goes first. */
```

### ---------- THE BLOCKS

top level, before `MAT_HTML`

```
/* ---------- THE BLOCKS ---------------------------------------------------------------------------
   Each returns the HTML for one component. They are here rather than generated, because the mat is
   drawn from the same data the app already holds and a template that has to be regenerated is a
   second build step for a print sheet. */
```

### THE DECIMALS ONLY WHERE THE FRACTIONS ARE SILENT.

in `M04`

```
/* THE DECIMALS ONLY WHERE THE FRACTIONS ARE SILENT. 0, 0.5 and 1.0 sat directly under 0, the
         half and 1 — the same three places on the line labelled twice, which is what made the strip
         look crowded and, worse, made the two systems look like different scales rather than one.
         Four labels where there were six, and every one of them says something the row above does
         not. */
```

### THE THIRD ENTRY IS THE TIER.

in `MAT_HTML`

```
/* THE THIRD ENTRY IS THE TIER. Sphere and cone are Higher-only content; the rest of this block is
     on both papers, so tagging the whole component 'H' would have taken the circle away from a
     Foundation student to keep a sphere they will never be asked for. */
```

### EVERY VALUE AS √n ÷ 2, INCLUDING THE ONES THAT SIMPLIFY.

in `MAT_HTML`

```
/* EVERY VALUE AS √n ÷ 2, INCLUDING THE ONES THAT SIMPLIFY. The table used to read 0, ½, √2/2,
     √3/2, 1 — five values with nothing in common, which is five things to memorise and no way to
     rebuild any of them once one has gone. Written unsimplified they are one thing: n counts 0 1 2
     3 4 across for sine and back down for cosine, and a student who has the counting has the row.
     THE NUMBERS ARE COUNTED, NOT TYPED, so the pattern is in the code as well as on the paper and
     the two cannot disagree.
     TAN IS NOT OF THAT FORM and is left as it is. It is a table of exact values and dropping the
     row to keep the pattern tidy would be losing the third of them people look up most. */
```

### SUPERSCRIPT, LIKE THE FIVE ABOVE IT.

in `M15`

```
/* SUPERSCRIPT, LIKE THE FIVE ABOVE IT. `a^½` was typed with a caret because
                          there is no single superscript ½ character — but every other law in the
                          block is set properly, so the last line read as somebody's plain-text note
                          in the middle of printed mathematics. `<sup>` needs no character to exist.
                          AND THE GENERAL FORM, since a½ alone teaches one case: the same rule gives
                          the cube root and every other, and a student who has aⁿ can rebuild a½. */
```

### ---------- THE SECONDARY SET

in `MAT_HTML`

```
/* ---------- THE SECONDARY SET -------------------------------------------------------------------
     WHAT A Y7-TO-11 STUDENT ACTUALLY FORGETS. The first eighteen were built outward from primary and
     stopped at whatever the tutor had to hand, which left the middle of the school with a protractor,
     a times table and five GCSE fragments. Nothing here is new maths — it is the set of things that
     get looked up in the back of a book mid-question, which is the only test of what belongs on a
     sheet you are allowed to take in.

     THE TEXT IS KEPT SHORT ON PURPOSE. `.mat-two` is a two-column grid inside a block that is often
     half the sheet wide, so a value much past twenty characters wraps — and a wrapped row costs
     three times its height. That is the whole difference between M15's six rows at 21mm and M12's
     eight at 49mm. Where the wording genuinely cannot be short, the block is full width instead. */
```

### THIS ONE IS DRAWN ON ITS OWN CIRCLE — the external point has to sit inside the box, so the circle moves up and shrinks rather than the point falling off the

in `M30`

```
/* THIS ONE IS DRAWN ON ITS OWN CIRCLE — the external point has to sit inside the box, so the
     circle moves up and shrinks rather than the point falling off the bottom. The tangents are
     carried a little past where they touch, because a line that stops exactly at the circle reads
     as a chord that missed. */
```

### NOT-A IS THE BOX WITH ONE HOLE IN IT, and the hole is A alone.

in `M49`

```
/* NOT-A IS THE BOX WITH ONE HOLE IN IT, and the hole is A alone. The part of B that lies outside
       A is not in A, so it stays shaded — whiting B out as well would draw (A &#8746; B)&#8242; and
       call it A&#8242;, which is the mistake the diagram exists to stop. */
```

### ---------- A-LEVEL

in `MAT_HTML`

```
/* ---------- A-LEVEL ------------------------------------------------------------------------------
     AS MEANS YEAR ONE AND `Alevel` MEANS YEAR TWO AS WELL. Every other level in this file is a
     different exam; these two are the same course a year apart, so the split is by WHEN A THING IS
     TAUGHT rather than by what it belongs to. Differentiating xⁿ is Year 1 and the chain rule is
     Year 2, so they are two blocks — an AS student offered the product rule in January is being
     offered clutter, and one denied it in Year 2 is being denied the thing they came for.

     THE IDS STAY IN THE M SERIES. They are the join to a drawing and nothing else — an `A` prefix
     would look like it meant A-level, and then M13 appearing at A-level would be the exception that
     makes the naming a lie. A dull id cannot mislead.

     NOTHING HERE IS TIERED, since tiers are a GCSE idea; `MAT_TIERED` lists Y9 and GCSE only, so the
     picker never asks the question on these. */
```

### −10 TO 10, ONE TICK A WHOLE NUMBER, PLACED BY PERCENTAGE like M04 so the line is the same at any slot width.

in `MAT_HTML`

```
/* −10 TO 10, ONE TICK A WHOLE NUMBER, PLACED BY PERCENTAGE like M04 so the line is the same at any
     slot width. The minus is U+2212, the sign a printed paper uses — a hyphen is shorter and sits
     lower, and on a line about negative numbers it is the one character that has to look right. */
```

### ---------- THE pH SCALE

top level, before `MAT_PH`

```
/* ---------- THE pH SCALE --------------------------------------------------------------------------
   ONE COLOUR PER WHOLE NUMBER, the universal indicator chart every textbook prints: red through
   orange and yellow to green at 7, then blue to purple. The colours are FILLS, and a browser drops
   fills when it prints unless told otherwise — so `.mat-ph` carries `print-color-adjust: exact`, as
   the flyer does. On a black-and-white printer the cells come out as greys and the numbers, words
   and the indicator table still say everything, which is why nothing here relies on the colour
   alone. The number is light on the dark ends and dark on the pale middle, so it reads on all
   fifteen. */
```

### THE THREE INDICATORS, as the words a mark scheme accepts.

in `matPh`

```
/* THE THREE INDICATORS, as the words a mark scheme accepts. Litmus is the one that changes at 7;
     methyl orange changes in the acid half and phenolphthalein in the alkali half, which is why a
     titration uses one and not the other. */
```

### ---------- THE PERIODIC TABLE, 118 OF THEM

top level, before `MAT_ELEMENTS`

```
/* ---------- THE PERIODIC TABLE, 118 OF THEM --------------------------------------------------------
   ONE STRING, SPLIT, rather than 118 quoted entries — a list that long is read by a person far more
   often than by this, and a missing comma in an array of strings shifts every element after it by
   one with nothing to say so. The length is checked where it is used: a table of 117 draws nothing
   rather than drawing oxygen in the fluorine box. */
```

### WHERE ELEMENT Z SITS:

top level, before `matPtAt`

```
/* WHERE ELEMENT Z SITS: [row, column] of an 18-column table, with the lanthanides (57–71) and the
   actinides (89–103) in two rows of their own under a gap — the layout every exam board prints.
   Rows 1–7 are the periods, row 8 is the gap, rows 9 and 10 are the f-block. Worked out from the
   period lengths rather than typed as 118 pairs, for the reason the symbols are one string. */
```

### THE CELL IS A NUMBER AND A SYMBOL, which is what the question asked for and what fits:

top level, before `matPeriodic`

```
/* THE CELL IS A NUMBER AND A SYMBOL, which is what the question asked for and what fits: at 184mm
   an eighteenth of the width is about 10mm, room for "Og" in bold and "118" above it, and not for a
   name or a mass without shrinking both below what a student can read across a desk.
   A HAIRLINE ROUND EACH CELL, which the "269 rectangles" note would argue against — but that note is
   about numbers already standing in columns. A periodic table is read by its boxes: which group,
   which period, and where the block edges fall. Borders print; a fill would not.
   THE GROUP NUMBERS ARE THE UK EXAM ONES, 1–7 and 0, over the main groups only — the ones a GCSE
   question names. Numbering the transition metals too would be a second convention on one sheet. */
```

### ---------- A FRACTION, DRAWN AS ONE

top level, before `fr`

```
/* ---------- A FRACTION, DRAWN AS ONE -------------------------------------------------------------
   `(−b ± √(b² − 4ac)) ÷ 2a` IS THE QUADRATIC FORMULA TYPED SIDEWAYS. It is correct, and it is not
   what anybody has ever seen on a board or in a book — so the eye has to parse the brackets to work
   out what is over what, which is exactly the work a cheat sheet exists to save. Every ÷ standing
   between two whole expressions is a fraction that was flattened to fit in a string.

   SPANS, NOT `<b>` AND `<i>`. Both of those are already claimed inside these blocks — `.mat-two i`
   is a grid item and `.mat-two i b` is the label — so a fraction built from them would be restyled
   and, in the `i` case, unwrapped by `display: contents` and lose its bar.

   THE BAR IS `currentColor`, so a fraction inside a grey label is grey and inside black text is
   black, without this needing to know which it is in. */
```

### ---------- FOUR VENNS, ONE PICTURE EACH

top level, before `matVenn`

```
/* ---------- FOUR VENNS, ONE PICTURE EACH ---------------------------------------------------------
   THE SYMBOL IS THE THING BEING TAUGHT, so it is the caption and the words are underneath it — a
   student who can already say "in both" is looking this up to find out which of ∩ and ∪ means it.

   THE UNIVERSAL BOX IS DRAWN ON ALL FOUR, not only on the two that need it. It is part of how the
   diagram is set out in the paper, and a box that appears only when the answer involves it tells
   the student it is optional, which it is not.

   SHADED, NOT OUTLINED. The region is the answer, and an outlined region on a diagram already made
   of outlines is one more line to disentangle. */
```

### `own` IS FOR THE ONE FIGURE THAT NEEDS A DIFFERENT CIRCLE.

top level, before `matCirc`

```
/* `own` IS FOR THE ONE FIGURE THAT NEEDS A DIFFERENT CIRCLE. Two tangents meet at a point outside
   the circle, and that point has to be inside the box — so that figure shrinks the circle and moves
   it up, and must not also get the standard one drawn underneath it. */
```

### ---------- THE DRAWN PIECES

top level, before `matPoly`

```
/* ---------- THE DRAWN PIECES ---------------------------------------------------------------------
   A regular polygon from its own definition rather than eight hand-typed paths that disagree with
   their labels — which is exactly what happened the first time: a positional list drew "rectangle"
   as a pentagon, because a fifth entry met a five-sided drawing.
   THE SQUARE IS TURNED HALF A STEP. Every polygon starting with a vertex at the top gives a
   triangle pointing up, which is right, and a square on its corner, which reads as a diamond. */
```

### ---------- EVERY SHAPE THE SAME SIZE ON THE PAGE

top level, before `matPoly`

```
/* ---------- EVERY SHAPE THE SAME SIZE ON THE PAGE -------------------------------------------------
   ALL EIGHT WERE DRAWN ON A CIRCLE OF RADIUS 17, which is the obvious way and makes the triangle
   look half the size of the decagon. It is not an illusion: a triangle inscribed in a circle covers
   about 41% of it and a decagon covers 94%, so drawing them on the same circle really does put less
   than half as much ink on the page for the first one.

   THE EFFECT IS TO TEACH THE WRONG THING. A row comparing shapes should differ in the number of
   sides and in nothing else; if the triangle is also the smallest, size reads as part of what a
   triangle IS.

   SO EACH IS SCALED TO FILL THE SAME BOX. Points are generated on a unit circle, measured, and
   stretched to a fixed width — which makes them equal on the page rather than equal in the
   construction, and the page is where they are looked at. */
```

### A HALF CIRCLE AT TRUE SIZE — which is the whole advantage of paper over a screen.

top level, before `matProtractor`

```
/* A HALF CIRCLE AT TRUE SIZE — which is the whole advantage of paper over a screen. A screen does
   not know how big it is and would need calibrating against a bank card; a printed millimetre is a
   millimetre. Both scales, inner and outer, running opposite ways, because that is what a plastic
   protractor does and the thing every child gets wrong. */
```

### A PROTRACTOR YOU CAN ACTUALLY READ AT THE ENDS.

in `matProtractor`

```
/* ==================================================================================================
     A PROTRACTOR YOU CAN ACTUALLY READ AT THE ENDS.

     THE NUMBERS WERE PRINTED UPRIGHT, all of them, which is fine at the top of the arc and falls
     apart at the ends: at 0 and 180 the outer and inner labels are a few millimetres apart on the
     same horizontal line, so `0 180` and `170 10` ran into each other and the last four readings
     were a smudge. Every real protractor rotates its numbers, and this is why — not decoration, but
     the only way two scales fit in the same place.

     SO EACH LABEL TURNS WITH ITS OWN RADIUS. Upright at 90, lying on their sides at the ends, and
     the two scales stay legibly apart the whole way round because they are never parallel to each
     other along the same line.

     THE TICKS ARE THREE WEIGHTS, not two. Degrees, fives and tens were drawn at two thicknesses, so
     counting in fives meant counting single degrees and hoping. A five now sits between the two,
     which is what the eye uses to land on 35 without counting from 30.

     AND THE COLOURS ARE THE SHEET'S. #111 and #333 were near-black on a page whose grids had just
     been lightened to grey; the protractor was left as the heaviest thing on it. */
```

### ---------- THE TRICK, WHICH BEATS THE TABLE

top level, before `matTrick`

```
/* ---------- THE TRICK, WHICH BEATS THE TABLE -----------------------------------------------------
   EVERY EXACT VALUE IS √n OVER 2, and n counts 0 1 2 3 4 across for sine and backwards for cosine.
   One pattern replacing ten values — and it survives an exam in a way a memorised table does not,
   because a pattern can be rebuilt from nothing on the back of the paper.

   THE ROOT IS DRAWN, NOT TYPED. A √ character sits beside the numbers at whatever size the font
   makes it and its bar covers only the first one, so it reads as the root of that number rather
   than of the row — which is the one thing the trick depends on saying. */
```

### FIVE CURVES, DRAWN — the shape is what is being recognised, and a name without a picture is the half of it nobody can use.

top level, before `matGraphs`

```
/* FIVE CURVES, DRAWN — the shape is what is being recognised, and a name without a picture is the
   half of it nobody can use.
   EACH SVG NEEDS A WIDTH. Without one they filled the column and the block came out 744mm tall,
   nearly three sheets from one component: an SVG with no width is not a small picture, it is as
   large as you let it be. The grid gives them their width. */
```

### ---------- A BREAK IN A CURVE IS PART OF THE CURVE

in `matGraphs`

```
/* ---------- A BREAK IN A CURVE IS PART OF THE CURVE -----------------------------------------------
     THE RECIPROCAL WAS DRAWN AS ONE UNBROKEN LINE and that is not what 1/x looks like — it is the
     one thing about 1/x. Points either side of the asymptote were skipped, correctly, and then
     joined to each other by a single `<polyline>`, which drew a stroke straight across the gap that
     had just been made. On the sheet it came out as a wave crossing the y-axis: a graph of a
     function that is defined at zero, printed under the label `y = 1/x`.

     SO A SKIPPED POINT ENDS THE LINE and the next one starts a new one. Every other graph here is
     continuous and comes back as a single piece, so nothing else changes. */
```

### AXES IN THE SHEET'S GREY.

in `matGraphs`

```
/* AXES IN THE SHEET'S GREY. They were a shade of their own — one more colour in a document
            that had just been reduced to three. An axis is scaffolding: it has to be there and it
            must not compete with the curve, which is the thing being looked at. */
```

### THE RULER DOWN THE LEFT EDGE, in real millimetres because this is printed.

top level, before `matRuler`

```
/* THE RULER DOWN THE LEFT EDGE, in real millimetres because this is printed. At the edge because
   that is where a ruler is used — you lay the paper against the thing you are measuring, and one in
   the middle of a sheet cannot reach anything. */
```

### THE LENGTH IS A CLASS, NOT A NUMBER TYPED HERE.

in `matRuler`

```
/* THE LENGTH IS A CLASS, NOT A NUMBER TYPED HERE. Written inline, the three tick widths could
       not be adjusted from the stylesheet — an inline style beats every rule in the file, so the
       ruler was the one component whose weight could only be changed in JavaScript. A centimetre,
       a half, and a millimetre are three kinds of mark; naming them is what lets the sheet decide
       how loud each one is. */
```

### ---------- THE SHEET SAYS WHAT TO DO WHEN IT COMES OUT WRONG

in `matRuler`

```
/* ---------- THE SHEET SAYS WHAT TO DO WHEN IT COMES OUT WRONG ------------------------------------
     A PRINTED RULER THAT IS NOT TRUE SIZE IS WORSE THAN NO RULER, because it is used without being
     questioned — a child measures with it and gets a wrong answer confidently. And it comes out
     wrong by default on most printers: `@page { margin: 0 }` asks for the full sheet, no printer can
     print to the paper edge, and the browser's answer to that is to shrink the whole page to fit the
     printable area. Twelve to fifteen per cent, silently, with nothing on screen or on paper saying
     so. Measured against a tape it read 23cm at 20cm.

     THE NOTE IS ON THE PAPER AND NOT IN THE PICKER, which is the whole point. The picker is where
     you choose the ruler; the moment you find out it is wrong is with a tape in your hand next to
     the printout, and that is not a moment when anybody goes back to a web page to read a warning.
     It is what a scale bar on a map is for, and it costs one line at the foot of a strip that is
     otherwise empty below the last centimetre. */
```

### A SUBJECT, AND THE ENGLISH PIECES IT OPENS

top level, before `MAT_PARTS_EN`

```
/* ==================================================================================================
   A SUBJECT, AND THE ENGLISH PIECES IT OPENS

   ASKED FOR AS *"for cheat sheet maker it should have subject as a filter too"*. A subject filter
   over a list that is all maths would be a control with one answer — and the `cheatsheet` tab
   already knew better. It holds twenty-one English rows, E02 to E22, each with a name, the levels
   it suits and a note saying what goes in it, and `matParts` has thrown every one of them away
   since they were typed: it walks the code's list and only lays the sheet over what it finds there.
   So the English was never missing from the data. It was missing a drawing.

   THE DRAWINGS ARE HERE, WRITTEN FROM THOSE NOTES, and each row keeps the tab's own name and levels
   so the sheet and the code describe one piece. The sheet still wins everything it wins today —
   name, levels, tier, order, and whether a piece is offered at all.

   E01 IS NOT HERE, DELIBERATELY. It is a second "Ruler down the edge", and the ruler is not a maths
   thing or an English thing: it lives in the margin of whatever sheet you are making. M01 is shown
   under every subject, so an E01 would be two tickboxes for one strip of paper.

   `inExam: false` ON ALL OF THEM, because the sheet says so and it is true: no English paper hands
   a candidate a list of word classes. That also keeps the "leave out what the exam gives you" box
   off an English sheet, where it would be a control with nothing to do.
================================================================================================== */
```

### ---------- THE ENGLISH DRAWINGS

top level, before `MAT_ABC`

```
/* ---------- THE ENGLISH DRAWINGS -------------------------------------------------------------------
   MOSTLY `matPairs`, the label-and-value block thirty-four of the maths pieces already are — a
   term and what it does is exactly that shape, and a second layout for it would be a second thing
   for the stylesheet to keep right. Two are not: the alphabet is a row of letters and the word bank
   is three short columns, and each borrows the nearest block the maths already has.

   WRITTEN TO BE SHORT, because the note over the secondary maths set is true here too: at a third of
   the page a value much past twenty characters wraps, and a wrapped row costs three times its
   height. Where a line could not be said shorter, it is the example that goes, not the rule. */
```

### PRINT OVER JOINED, LETTER BY LETTER.

in `MAT_HTML_EN`

```
/* PRINT OVER JOINED, LETTER BY LETTER. "Both hands" in the sheet's note means both handwriting
     styles, and a child copying a letter wants the two shapes of it one above the other rather than
     two alphabets a line apart. The joined row is set in whatever script face the printer has —
     `cursive` is the last word in that list for a reason — so it is a model rather than a font. */
```

### THE STEMS ARE THE POINT, which is what the note asks for:

in `MAT_HTML_EN`

```
/* THE STEMS ARE THE POINT, which is what the note asks for: a student who knows the letters stand
     for Point, Evidence and Explain still sits in front of a blank line not knowing how to start one.
     PEE is the first three of PETAL, so it is one block rather than two, and the last row says how
     they fold into each other. */
```

### ---------- WHICH SUBJECT A PIECE IS

top level, before `matSubjectOf`

```
/* ---------- WHICH SUBJECT A PIECE IS -----------------------------------------------------------------
   `subject` IS A FIELD ON THE PIECE, like its levels and its tier, and it lives where they do: a
   `subject` column on the `cheatsheet` tab (`data/cheatsheet.json`), which `matParts` lays over the
   code's own row. The English rows above carry it, the periodic table carries `Science`, and the
   rest of `MAT_PARTS` carries nothing — so THE DEFAULT IS MATHS, and that is not a guess about
   forty-nine rows: every `M` id is the maths mat this tool started as. Written as a default rather
   than onto forty-nine rows, because a field that says the same word on every line of a list is a
   field nobody reads, and the day one of them is wrong it is wrong in a crowd.

   A PIECE IN THE MARGIN IS IN NO SUBJECT. The ruler goes down the edge of any sheet, so it is offered
   whichever subject is chosen rather than belonging to one. */
```

### THE SUBJECTS THAT HAVE PIECES, and no others — a subject with nothing under it is an option that empties the list, which is a dead control wearing a name.

top level, before `matSubjectOrder`

```
/* THE SUBJECTS THAT HAVE PIECES, and no others — a subject with nothing under it is an option that
   empties the list, which is a dead control wearing a name. THE ONE WITH THE MOST PIECES FIRST,
   because it is the one most sheets are made of, and ties alphabetically so the order never depends
   on how the file happens to be sorted.
   NOT THE SITE'S OWN SUBJECT LIST, which the first version sorted by. That list is what somebody can
   be BOOKED for — "English Language", "(Single) Chemistry" — and not one of its names is a subject
   a cheat sheet piece carries, so every subject here fell through to the alphabet and English came
   out above Maths on a tool that is fifty maths pieces to twenty-one English. */
```

### ---------- THE PIECES A GROUP AT A TIME

top level, before `MAT_GROUPS`

```
/* ---------- THE PIECES A GROUP AT A TIME --------------------------------------------------------------
   ASKED FOR AS *"the cheat sheet maker shouldnt be as long as it is. you need to think a way to make it
   fit on screen without scrolling"*. The scroller inside the card had already gone (that was the
   second half of the same note, and `.widget-squeeze` with it), which left the card as tall as its
   list — and the list was the whole library. Measured on `check/fixture.json` before this: it opened
   on Maths · Every level, 57 rows, a card of 1206px in a 532px pane at 320x568, and `paneReach_` hit
   its 0.7 floor and still had to let the pane scroll. GCSE Higher was 34 rows, 825px against 532;
   every Maths level but the Y1/Y2 mocks scrolled at 320, and Every subject · Every level was 80 rows.

   A SHORTER LIST IS THE ONLY FIX THAT IS A FIX. Smaller rows were spent long ago (44px is the floor —
   see `.mat-list label`), more columns do not fit at 320, and zooming the card further is the thing
   the floor exists to stop. So the list is cut by TOPIC, which is the next question somebody making
   a sheet has after subject and level — "the algebra bits" — and a third select asks it.

   EIGHT ROWS AT MOST IN ANY VIEW, ruler included, at every subject and level — four lines of two.
   The audit allowed twelve. Measured at 320x568: twelve rows is six lines and a card drawn at about
   0.79; ten drew at 0.858 signed out, and at 0.798 SIGNED IN, where the card carries its star tile
   and is 60px taller for it. Eight is the number that clears 0.85 for both visitors. `check/states.js`
   holds the 0.85 floor, sweeping every subject × level × group at 320x568 and 390x844 as both;
   `check-flow` holds the count, so a piece added to a full group fails before anybody draws it.
   Seven pieces is the most any group below carries at Every level, so the ruler makes eight.

   IN CODE, NOT ON THE SHEET, for now. `data/cheatsheet.json` has no group column and the drawings
   these ids name are in this file anyway; a piece added in code and forgotten here lands in
   `Other` rather than nowhere, and `check-flow` names it so it does not stay there.

   SHORT NAMES, because the option carries its tick count too and the select shows about eighteen
   characters at 320: `Calculus` holds the vectors and the mechanics, `Geometry` the shapes and
   angles, `Spelling` the words.

   THE ORDER HERE IS THE ORDER OF THE SELECT — number before algebra before calculus, roughly the
   order the topics are met in. Grouped by subject only because the ids are; a group is one name
   whatever subject is chosen, so "Every subject" offers all of them in this order. */
```

### ---------- AND WHERE IT OPENS FOR A STUDENT

top level, before `matOwnLevel_`

```
/* ---------- AND WHERE IT OPENS FOR A STUDENT -----------------------------------------------------------
   "OPEN ON THE STUDENT'S OWN LEVEL WHEN KNOWN" — the audit's default, taken. Nothing on a person's row
   says their level, so it is read off the sessions they are booked into as the client, newest first:
   a student in a GCSE Maths group gets the GCSE Maths sheet. `USER.level` is asked first in case the
   login reply ever carries one. A tutor's own sessions are not theirs to study, so only `client`
   counts. Anything that does not name a level this tool has falls through to Every level, which is
   what it opened on before — so a visitor nobody knows anything about sees no change at all. */
```

### ---------- ONE LIST OF LEVELS, AND THE TIER INSIDE IT

top level, before `MAT_TIERED_SUBJECTS`

```
/* ---------- ONE LIST OF LEVELS, AND THE TIER INSIDE IT -----------------------------------------------
   THE LEVEL WAS TEN PILLS AND THE TIER WAS TWO MORE, IN A ROW THAT CAME AND WENT. Measured on a
   320x568 phone: four rows of pills, 288px of a 534px pane, before a single piece was on the screen
   — and the list below them had room for two and a half rows while the Print button sat under the
   fold. The choice itself is one question, "which paper is this for", and GCSE Higher is an answer
   to it in the same way SATs is; splitting it into a level and then a tier that only exists for two
   of the levels was the screen changing shape under the thumb that answered the first half.

   SO IT IS ONE SELECT, and a tiered level is two options in it. Only the levels this subject has
   pieces for — an English sheet offers no B-TEC Foundation — and the tier split only where it
   changes anything, which is the maths: its blocks carry Higher-only rows (`matKeep`), and nothing
   in the English or the periodic table does. `MAT_LEVEL` and `MAT_TIER` stay the state, because the
   title on the paper and every block that reads `matKeep` already know them.

   WHICH SUBJECTS SPLIT IS A LIST, BESIDE `MAT_TIERED`, rather than a word inside a function. It
   cannot be worked out from the pieces: the component-level `tier: 'H'` is only half of it, and the
   other half is Higher-only ROWS inside ordinary blocks (M22, M23, M25, M26), which only reading the
   drawing would find. A tiered English or science piece is one line here. */
```

### ---------- WHAT IS ON THE SHEET IS WHAT IS SHOWN, TICKED

top level, before `matShown`

```
/* ---------- WHAT IS ON THE SHEET IS WHAT IS SHOWN, TICKED ---------------------------------------------
   ONE TEST FOR THE LIST AND THE PAPER, so the two cannot disagree. It was two: the level and the tier
   decided what printed, and the "given" filter hid rows from the list while leaving them on the
   paper — its note said so, and meant it kindly ("narrowing the view must not quietly drop the
   given blocks off a sheet that was already built"). What it produced was a sheet carrying pieces
   the screen was not showing, which is the one thing a picker must not do.

   HIDDEN IS STILL NOT UNTICKED. Every tick is kept, so looking at another subject or level and
   coming back finds the sheet as it was; what changed is only that a piece prints when you can see
   it ticked, and not otherwise. */
```

### THE CHOICES, PUT RIGHT BEFORE ANYTHING IS DRAWN.

top level, before `matSettle`

```
/* THE CHOICES, PUT RIGHT BEFORE ANYTHING IS DRAWN. A subject that has lost its pieces, a level the
   new subject does not have, a tier split that no longer applies — each falls back to the widest
   answer rather than leaving a select showing a value it does not contain. `MAT_SHOW` is set here
   because every block reads it through `matKeep` while it is being drawn. */
```

### THE OPTIONS ARE WRITTEN ONLY WHEN THEY CHANGE.

top level, before `MAT_OPTS`

```
/* THE OPTIONS ARE WRITTEN ONLY WHEN THEY CHANGE. `matPaint` runs on every tick — and this is called from inside the select's own `change`
   handler. Rewriting a select's options while its own picker may still be up is asking a phone's
   native wheel to survive having its contents replaced under it, and nothing here needs that: the
   subject list only changes when the pieces do, and the level list when the subject does. */
```

### THE TWO SELECTS AND THE ONE BOX, drawn from the same state every time rather than patched by the handler that changed them — a control that says one thing

top level, before `matChoices`

```
/* THE TWO SELECTS AND THE ONE BOX, drawn from the same state every time rather than patched by the
   handler that changed them — a control that says one thing while the list says another is the
   invisible mode this repository records against the paused reel. */
```

### THE GROUP, WITH WHAT IS TICKED IN EACH ON ITS OWN OPTION.

in `matChoices`

```
/* THE GROUP, WITH WHAT IS TICKED IN EACH ON ITS OWN OPTION. Ticks are kept across groups — the
     sheet is everything ticked at this subject and level, whichever group is on the screen — so a
     group you are not looking at can hold half the sheet, and the only place left to say so without
     a row of its own is the option label: "Algebra · 3✓". A tick and not the word "ticked": at 320
     the select shows eighteen characters at 16px, and "Trigonometry · 2 t…" was what the word left. Counted through `matShown`, the same
     test the paper uses, so the counts add up to the gauge's piece count and never to more. */
```

### "GIVEN IN THE EXAM" ONLY WHERE SOMETHING IS.

in `matChoices`

```
/* "GIVEN IN THE EXAM" ONLY WHERE SOMETHING IS. It was a row of three pills — All, Not given,
     Given — shown on every level, SATs included, where nothing on the list is marked given and the
     middle pill hid the lot. It is one box now, offered only when a piece on this list is one the
     exam prints for you, and it says what it does rather than naming a category somebody has to
     decode. "Given" alone was a word that needed explaining; the box is the explanation. */
```

### ---------- PRACTICE PAPER: A HANDWRITING SHEET, LINED, OR SQUARED

top level, before `MAT_KINDS`

```
/* ---------- PRACTICE PAPER: A HANDWRITING SHEET, LINED, OR SQUARED ------------------------------------
   ASKED FOR AS *"allow cheat sheet maker to make a handwriting worksheet. or lined or grid paper."*
   The same card, the same Print button, the same basket line — a fourth kind of page rather than a
   fourth tool, because what a tutor wants from it is what they want from the cheat sheet: one sheet
   of A4, printed now, or printed and laminated by the owner. A laminated handwriting sheet is the
   one a child writes on in dry-wipe pen forty times, which is the reason the basket door stays.

   THE PAPER'S SETTINGS ARE A CLOSED LIST, not free numbers. Each `MAT_BLANK_OPTS` entry is what a
   select offers, and `matBlankSet_` refuses anything else — so a value remembered by some later
   version, or typed into storage by hand, can never draw a ruling nobody can choose here. Only the
   words to trace are free, and they are trimmed and capped (`MAT_TEXT_MAX`) because they are drawn
   as rows and a pasted essay would be a page of one sentence's first line. */
```

### `for` IS WHICH KIND OF PAPER ASKS THE QUESTION.

top level, before `MAT_BLANK_OPTS`

```
/* `for` IS WHICH KIND OF PAPER ASKS THE QUESTION. One list of controls, each shown only under its own
   kind (see `matBlankPaint_`), rather than three blocks of markup that would each have to learn the
   select's 44px and its arrow.
   THE HANDWRITING SIZES ARE THE BAND, in mm — the standard four-line ruling is three equal bands
   (ascender, x-height, descender), so one number is the whole ruling: 8mm is a Reception/Year 1
   page, 6mm Years 2–3, 4mm a junior exercise book. THE LABELS ARE SHORT because a 16px select is about eighteen
   characters wide on a 320 phone; "Handwriting worksheet" came out as "Handwriting worksh…". `gap` is how many empty rulings follow each traced
   one: one is copy-under-the-model, two is the same with room to try again. */
```

### A TEXT BOX AT 16px, the global rule's size, because anything smaller makes iOS zoom the page on focus.

in `matBlankControls_`

```
/* A TEXT BOX AT 16px, the global rule's size, because anything smaller makes iOS zoom the page on
     focus. It answers on `input` (below), not `change` — `change` waits for the box to lose focus,
     and the paper should follow the typing. */
```

### ---------- THE RULINGS, AS SVG STROKES

top level, before `MAT_BLANK_H`

```
/* ---------- THE RULINGS, AS SVG STROKES ---------------------------------------------------------------
   A STROKE PRINTS; a background does not (see "A LINE ON PAPER IS A BORDER" in style.css — the ruler
   printed with every tick missing). An SVG drawn in millimetres is also the one way to put a line at
   an exact millimetre on the paper: the viewBox is the drawing area in mm and the element is sized
   in mm, so 1 unit is 1mm whatever the screen thinks a pixel is.
   `MAT_BLANK_H` IS THE DRAWING'S HEIGHT, inside the head, the name row and the foot — 297 minus the
   sheet's 11mm of padding is 286, and the head, the name row, the foot and three 2.8mm gaps take
   the rest. MEASURED in Chrome rather than added up: at 252 the ruling ended 13.8mm above the
   footer, so 260 leaves 3mm of slack — kept, because a ruling that ran under the footer would be
   the kind of fault found at the printer. */
```

### THE FOUR-LINE RULING.

top level, before `matHandRows_`

```
/* THE FOUR-LINE RULING. Top and bottom (ascender, descender) are the faint lines, the x-height is
   dashed — the line a child aims the top of an `a` at, and on every printed handwriting book it is
   the dashed one — and the baseline is the dark one, because it is the line everything sits on.
   ONE PATH PER KIND OF LINE, not one element per line: a Small page is 60 lines, and four paths
   with sixty segments between them print faster and diff smaller than sixty elements. */
```

### A SKIP BETWEEN RULINGS, a band and a half.

in `matHandRows_`

```
/* A SKIP BETWEEN RULINGS, a band and a half. At one band the descender line of one ruling and the
     ascender line of the next were a band apart like every other pair, so the page read as
     continuous lines with a dash every fourth — measured on the first screenshot, where "which four
     lines are mine" took a second look. The wider gap is what makes each ruling one thing. */
```

### WRAPPED BY ESTIMATE, at 0.55em a character — a lower-case alphabet in these faces averages about 0.5em, and an estimate erring wide only ends a row a word

in `matHandRows_`

```
/* WRAPPED BY ESTIMATE, at 0.55em a character — a lower-case alphabet in these faces averages
     about 0.5em, and an estimate erring wide only ends a row a word early, where one erring narrow
     runs the words off the right of the ruling. */
```

### BALANCED, NOT GREEDY.

in `matHandRows_`

```
/* BALANCED, NOT GREEDY. Greedy wrapping left "dog." alone on its own ruling under two full ones —
     a whole trace row for one word. So the number of rows is the greedy answer and the width is then
     the narrowest that still needs no more rows than that. */
```

### THE TRACE ROWS AND THE PRACTICE ROWS, IN TURN, AND THE WORDS COME ROUND AGAIN until the page is full — a sheet that traced its sentence once and then had

in `matHandRows_`

```
/* THE TRACE ROWS AND THE PRACTICE ROWS, IN TURN, AND THE WORDS COME ROUND AGAIN until the page is
     full — a sheet that traced its sentence once and then had twenty empty rulings is lined paper
     with a heading. No words is the plain ruling, every row empty, which is a sheet worth having. */
```

### ---------- THE x-HEIGHT, MEASURED IN THE FACE THAT WILL PRINT

top level, before `MAT_TRACE_FONT`

```
/* ---------- THE x-HEIGHT, MEASURED IN THE FACE THAT WILL PRINT --------------------------------------
   A LOWER-CASE `a` MUST FILL THE MIDDLE BAND EXACTLY — it is the one measurement on a handwriting
   sheet that has to be right, and it depends on the face, which depends on the device. So the font
   size is the band divided by the face's own x-height, and the x-height is asked of the browser:
   `1ex` IS the x-height of the element's font, so a box 1ex tall at 100px is that ratio in pixels.
   `font-size-adjust: .5` WAS TRIED FIRST and Chrome applied it to SVG text in CSS pixels and then
   scaled by the viewBox as well — letters 3.8 times the ruling, the size of a pixel in millimetres.
   Measured once and kept; jsdom has no layout and answers 0, which falls back to .52, the x-height
   of the sans faces this stack ends in. */
```

### EXERCISE-BOOK RULING:

in `matBlankSvg_`

```
/* EXERCISE-BOOK RULING: the lines across, and a margin 25mm in — where the date and the question
       number go, and the line every UK exercise book has. The first line one spacing down, so the
       page starts with somewhere to write rather than a line under the name. */
```

### WHAT THE PAPER SAYS ABOUT ITSELF, for the head, the order and the line under the card.

top level, before `matBlankSay_`

```
/* WHAT THE PAPER SAYS ABOUT ITSELF, for the head, the order and the line under the card. The size is
   in it because "Lined paper" twice in one basket, at 8mm and 12mm, are two different things to
   print, and the owner reads the order message to know which. */
```

### THE PAINT FOR PAPER, called by `matPaint` in place of everything after the choices.

top level, before `matBlankPaint_`

```
/* THE PAINT FOR PAPER, called by `matPaint` in place of everything after the choices. It does the
   three things the cheat sheet's paint does — the sheet for the printer, the sentence under the
   card, the basket line — and none of the measuring, because a ruling is drawn to fit by
   construction and has no gauge to fill. */
```

### THE BASKET LINE: the same `print` line as a cheat sheet, so the laminate switch comes with it and nothing in the basket learns a new kind.

in `matBlankPaint_`

```
/* THE BASKET LINE: the same `print` line as a cheat sheet, so the laminate switch comes with it and
     nothing in the basket learns a new kind. The KEY carries every setting and the words, so two
     sizes are two lines and the same sheet twice is one; the PARTS are what the owner rebuilds it
     from, words included. */
```

### ---------- WHERE YOU LEFT IT

top level, before `MAT_KEEP_AT`

```
/* ---------- WHERE YOU LEFT IT --------------------------------------------------------------------------
   A TUTOR PRINTS THE SAME SHEET MOST WEEKS. Opening the tool on "Every subject, every level" with
   nothing ticked every time is five choices and a dozen ticks to get back to the page printed last
   Tuesday — so the subject, the level, the box and the ticks are kept on this device and come back
   when the tool opens. A per-viewer convenience, which is what `localStorage` is for here; wrapped,
   because it can be blocked or full, and the tool must open either way. */
```

### A KIND THIS VERSION DOES NOT KNOW IS THE CHEAT SHEET, and the paper's settings are each put back through `matBlankSet_`, which refuses a value it does not

in `matRecall`

```
/* A KIND THIS VERSION DOES NOT KNOW IS THE CHEAT SHEET, and the paper's settings are each put
       back through `matBlankSet_`, which refuses a value it does not offer — a stored spacing of
       7mm from some later version must not draw a sheet nobody can choose. */
```

### ---------- THERE IS NO FILL AND NO CLEAR

top level, before `initMat`

```
/* ---------- THERE IS NO FILL AND NO CLEAR -------------------------------------------------------
   Asked for as *"get rid of fill the page button on the cheat sheet maker. and get rid of clear
   button."* Both went, with `matFill` behind Fill (a binary search over ranked pieces, measured by
   the gauge — known-not-given first, then unchecked, then what the exam prints) and the handlers.
   A sheet is built by ticking pieces; a piece comes off by unticking it. `MAT_LEFT` went too: the
   gauge is still the only number that says whether the page is full. */
```

### ---------- THE PICKER AND THE SHEET

top level, before `initMat`

```
/* ---------- THE PICKER AND THE SHEET -------------------------------------------------------------
   Rendered into the widget's own box, so this behaves like every other tool: a card with a start
   function, listed and searchable with the rest.

   ---------- IN THE ORDER SOMEBODY DECIDES IT ----------------------------------------------------
   ASKED FOR AS *"see if the cheat sheet maker could be reworked to be more efficient and
   intuitive"*. Measured on a 320x568 phone before anything moved: the level was ten pills in four
   rows, the tier two more, "All / Not given / Given" three more — 288px of controls before the
   first piece — and the list under them had room for two and a half rows while Print sat below the
   fold with no way to it. And it did not open where its own note said it did: `MAT_LEVEL` starts
   as `all` under a paragraph arguing for exactly that, and the next line in this function replaced
   it with the first level in the list, so every visit opened on SATs.

   SO IT READS TOP TO BOTTOM AS THE CHOICES ARE MADE: which subject, which paper, then the pieces,
   then print. Two selects, one above the other, where there were fifteen pills on five rows (why
   not side by side is under `.mat-pick` in style.css — at 16px they do not fit); one box for the
   formulae the exam prints, and only on a list that has any; and the list gets the height back.
   Nothing on it needs a legend any more: the per-row cm² went (the gauge is the only figure that is
   right, and it is under the list), and so did the red that meant "not given" and needed the pills
   above it to say so. */
```

### SET EACH TIME THE TOOL OPENS, not once at load:

in `initMat`

```
/* SET EACH TIME THE TOOL OPENS, not once at load: the payload may not have landed when this file
     did, and a default read too early is the hard-coded one for the rest of the session. Only when
     nothing has been chosen yet, so reopening the tool does not throw away what somebody was in the
     middle of — and what they chose LAST time comes first, before the sheet's `start_on`. */
```

### SELECTS, IN THE ORDER THE QUESTION IS ASKED:

in `box.innerHTML`

```
/* SELECTS, IN THE ORDER THE QUESTION IS ASKED: which subject, then which paper. A select
            answers on `change` — the dispatcher in cards.js routes it — and it is a real 44px
            control whose options the phone lays out itself, so a list of eleven levels costs one
            row of the card rather than four. One above the other, at every width — see `.mat-pick`.
            `aria-label` because nothing else names it; the option showing already says which
            question it is. */
```

### ---------- PRACTICE PAPER IS ASKED FOR IN THE SUBJECT SELECT, NOT A SELECT OF ITS OWN

in `box.innerHTML`

```
/* ---------- PRACTICE PAPER IS ASKED FOR IN THE SUBJECT SELECT, NOT A SELECT OF ITS OWN ----------
          ASKED FOR AS *"allow cheat sheet maker to make a handwriting worksheet. or lined or grid
          paper"*. The first build gave it a "Sheet type" select above the subject, and that one 44px
          row was the row the card did not have: `check/states.js` walks every subject × level × topic
          at 320x568 and the card was already cut to fit at 0.85 without a row to spare (see
          `MAT_GROUPS`). So the paper kinds are a "Practice paper" group at the foot of the subject's
          own options — which is also the question a tutor is asking: maths, English, or plain paper.
          Choosing one hides the level, the topic and the pieces (`#mat-cheat`) and shows the paper's
          own questions (`#mat-blank`); see `matPaint`. */
```

### ---------- THE LIST IS THE WHOLE LIST, AND THE PANE DECIDES WHAT FITS

in `box.innerHTML`

```
/* ---------- THE LIST IS THE WHOLE LIST, AND THE PANE DECIDES WHAT FITS ------------------
          IT WAS A SCROLLER (`widget-squeeze`): a box inside the card with its own scroll bar,
          which gave up its height so Print stayed on the card. Reported as "the cheat sheet maker
          should not have a scroll thing". A box that scrolls inside a card that slides is two
          gestures fighting for one finger — every drag on the list was a question of whether it
          moved the list or the column — and it is the one widget that did it.
          SO IT IS AN ORDINARY BLOCK NOW and the card is as tall as its list. Where that is taller
          than the pane, `paneReach_` does what it does for every other card: draws it smaller,
          down to its floor, and only past that lets the PANE scroll — one scroller, the same one
          every column has, handing the swipe back to the grid at its end. */
```

### ---------- PRINT IT YOURSELF, OR HAVE IT PRINTED

in `box.innerHTML`

```
/* ---------- PRINT IT YOURSELF, OR HAVE IT PRINTED --------------------------------------------
          ASKED FOR AS *"add an upgrade to lamination for cheat sheet orders that are added to cart"*,
          which needs the sheet to be something the basket can hold first — it could only print.
          The trolley is a TILE BESIDE the button rather than a second full-width button under it:
          the sheet is a thing, a thing's actions are tiles, and a second 44px row is height this
          card has just been cut down to fit without. `mat-cart` is the same door the shop's trolley
          is, and the basket line it makes is a `print` line — which is what gives it the laminate
          switch, priced by the sheet's own rate, with nothing new in the basket to learn it. */
```

### ONE LIBRARY, SO NO HEADINGS.

in `initMat`

```
/* ONE LIBRARY, SO NO HEADINGS. The list was split into "Components" and "Flyers" while a flyer
     could be ticked onto the sheet; with the flyer maker its own tool again there is one library
     here, and the subject select is what cuts it now — a heading over each subject would be the
     same fact twice, once in the select and once over the list it has just filtered. */
```

### GIVEN IN THE EXAM IS SAID ON THE ROW, IN WORDS, and only on the few it is true of.

in `innerHTML`

```
/* GIVEN IN THE EXAM IS SAID ON THE ROW, IN WORDS, and only on the few it is true of. The old
       mark was the other way round — red on every piece the exam does NOT print, which on GCSE
       Higher is twenty of twenty-five, with a row of pills above the list to say what red meant.
       Marking the handful that are given is quieter and needs no key: the note is the key. */
```

### A NOTE BELONGS TO THE COMPONENT, NOT TO THE TOOL.

in `innerHTML`

```
/* A NOTE BELONGS TO THE COMPONENT, NOT TO THE TOOL. "The ruler and protractor print at true
          size" was a line in a paragraph above the whole list, which is where a fact about two
          items out of twenty-five goes to be ignored. On the two rows it is about, it is read.
          INSIDE THE ROW'S 44px NOW, under the face in the same cell, rather than a grid line of its
          own below it — that line was 15px a note and, with groups, the last thing between a
          ten-row group and a card drawn at 0.83 on a 320x568 phone. See `.mat-txt`. */
```

### SWITCHING SUBJECT OR LEVEL HIDES WHAT DOES NOT APPLY; it does not untick it.

top level, before `MAT_TOUCHED`

```
/* SWITCHING SUBJECT OR LEVEL HIDES WHAT DOES NOT APPLY; it does not untick it. Somebody who set up
   a SATs mat, looked at GCSE and came back should find their mat as they left it. The level select
   carries the tier in its value — `GCSE|H` — because they are one choice on the screen. */
```

### WHAT DRAWS A PIECE. One lookup:

top level, before `matDraw`

```
/* WHAT DRAWS A PIECE. One lookup: a component is a function in `MAT_HTML` keyed by its id. There
   were two libraries while a flyer could be ticked onto the sheet (`flyOne` handed the campaign row
   it named); the flyer maker is its own admin-only tool again and there is no flyer here to draw.
   Every caller asks this rather than reaching into `MAT_HTML` itself, so a second kind of piece — a
   coupon, a booking slip — is a line here and a row in the list, and nothing else has to learn it.
   A PIECE WHOSE DRAWING IS MISSING SAYS SO on the paper. Silence would print a gap, and a gap on a
   sheet you are about to photocopy thirty times is worth a sentence. */
```

### THE CHOICES FIRST, BECAUSE EVERYTHING BELOW READS THEM.

in `matPaint`

```
/* THE CHOICES FIRST, BECAUSE EVERYTHING BELOW READS THEM. `matSettle` puts back any choice the
     parts no longer support and sets `MAT_SHOW` before a single block is drawn — every block reads
     it through `matKeep` while rendering, so setting it afterwards would tier the sheet one repaint
     late. `matChoices` then draws the selects and the box from that state. */
```

### ---------- PRACTICE PAPER TAKES THE PAINT FROM HERE

in `matPaint`

```
/* ---------- PRACTICE PAPER TAKES THE PAINT FROM HERE ---------------------------------------------
     The picker underneath keeps its ticks while it is hidden — a tutor who looks at lined paper and
     comes back finds their cheat sheet as they left it, which is the subject select's own rule. */
```

### THE LIST AND THE PAPER ASK ONE QUESTION — `matShown` — and the tick on each row is drawn from `MAT_ON` rather than left to the box, so a remembered sheet

in `matPaint`

```
/* THE LIST AND THE PAPER ASK ONE QUESTION — `matShown` — and the tick on each row is drawn from
     `MAT_ON` rather than left to the box, so a remembered sheet, which
     changes the ticks without anybody pressing a box, shows what it holds. */
```

### LISTED IS SHOWN AND IN THE GROUP; PRINTED IS SHOWN.

in `matPaint`

```
/* LISTED IS SHOWN AND IN THE GROUP; PRINTED IS SHOWN. The group cuts the list and not the
       paper — see `MAT_GROUPS` — so `listed` below still counts the whole level, which is what
       "nothing here for this level yet" is a sentence about. */
```

### PIECES, NOT THE RULER.

in `matPaint`

```
/* PIECES, NOT THE RULER. The ruler is offered under every subject and level, so counting it made
       "nothing here" unreachable: Science with the exam's own periodic table skipped listed the
       ruler alone and said "tick pieces, or Fill the page" over a Fill that was greyed out (Fill is gone now). */
```

### A PIECE THAT IS ALREADY A FINISHED THING GETS NO HEADING AND NO RULE.

in `matPaint`

```
/* A PIECE THAT IS ALREADY A FINISHED THING GETS NO HEADING AND NO RULE. That was the flyer, when
     one could be ticked here: it carries its own name, colour and edge, and a heading over it would
     label a poster with the word poster. `bare` says so and the stylesheet takes the heading, the
     hairline and the padding off. No piece carries it today; it is kept for the next one that is a
     finished thing rather than a block of facts. */
```

### ---------- ONE GRID, AND EVERY BLOCK TAKES ITS OWN SLOT IN IT

in `matPaint`

```
/* ---------- ONE GRID, AND EVERY BLOCK TAKES ITS OWN SLOT IN IT -----------------------------------
     THIS WAS A HUNDRED AND FIFTY LINES of runs, stacks, `pair` runs and a balancer that measured the
     blocks and moved them between columns. Every one of them answered "how wide is this block, given
     what else is here" — the question a fixed area does not ask — and their notes recorded each way
     it went wrong: a run of two drawn in three left a 56mm strip of white; one narrow block alone was
     drawn at the full 184mm; a `sort_order` typed into one cell dropped the hundred square from 88mm
     to 56. What replaced them is the grid in the stylesheet (`.mat-cols`) and two numbers per block:
     `span` tracks across and `h` millimetres down, neither of which reads anything else on the sheet.
     `dense` LETS A NARROW BLOCK DROP INTO THE THIRD LEFT BESIDE A TWO-THIRDS GRID, which is the only
     packing the page needs, and the order is otherwise the list's — so moving a component in the
     sheet moves it on the page, and nothing can change how big it is.
     `data-i` IS THE BLOCK'S PLACE IN THE LIST and `data-id` its component, so a slot on the paper
     can be matched back to the thing that owns it. */
```

### THE SUBJECT AND THE LEVEL ARE ON THE PAPER.

in `matPaint`

```
/* THE SUBJECT AND THE LEVEL ARE ON THE PAPER. Six sheets in a folder all headed "Cheat sheet"
     are six sheets you have to read to tell apart, and the two things that distinguish them are
     already known here. `all` is not a subject or a level anybody is at, so either prints as
     nothing rather than as "every". The tier is named only where it split the list — an English
     GCSE sheet headed "Higher" would be claiming a difference the pieces do not have. */
```

### THE GRID'S THREE NUMBERS ARE HANDED TO THE STYLESHEET FROM HERE, so the tracks the paper is laid out on and the widths the picker prices from are the same

in `matPaint`

```
/* THE GRID'S THREE NUMBERS ARE HANDED TO THE STYLESHEET FROM HERE, so the tracks the paper is
     laid out on and the widths the picker prices from are the same constants rather than two copies
     of them — the disagreement this file has already paid for twice. */
```

### ---------- A SLOT IS NEVER ALLOWED TO CUT A FORMULA OFF

in `matPaint`

```
/* ---------- A SLOT IS NEVER ALLOWED TO CUT A FORMULA OFF ------------------------------------------
     `MAT_SLOT` IS MEASURED, and a measurement can go stale — a row added to a block, a font that
     renders wider. A fixed slot that silently clipped the last line of the quadratic formula would be
     worse than one that grew, because the sheet is photocopied thirty times before anybody reads the
     bottom of it. So a slot its own drawing overflows takes the rows it needs, and the console names
     it: the fixed size is the rule and this is the alarm that says the table needs a new number. */
```

### THE TOP ROW TAKES NO HAIRLINE.

in `matPaint`

```
/* THE TOP ROW TAKES NO HAIRLINE. It is already under the heavy rule below the title, and two
     lines 2mm apart is a mistake that looks deliberate. Which blocks ARE the top row is the grid's
     answer rather than the list's — a narrow block may be packed up beside a wide one — so it is
     asked of the laid-out page. */
```

### ---------- THE PAGE IS AN AREA, NOT A HEIGHT

in `matPaint`

```
/* ---------- THE PAGE IS AN AREA, NOT A HEIGHT ---------------------------------------------------
     THIS MEASURED THE COLUMN'S HEIGHT, which works while everything is stacked and breaks the
     moment something is not. The ruler is the case that broke it: 20mm off the WIDTH of every row
     for the whole height of the page, written into the list as `h: 0` — free, because the number it
     was measured against had no idea width existed.

     NOT A ROUNDING ERROR. 20 x 262 is 5,240mm2, a tenth of the usable page, so ticking the ruler
     could put you over the edge without moving the bar at all.

     SO EVERYTHING IS COUNTED IN SQUARE MILLIMETRES: a row costs the content width times its height,
     the ruler costs its own strip, and the two can finally be added together. A budget you cannot
     add up is not a budget. */
```

### THE WIDTH IS MEASURED TOO.

in `matPaint`

```
/* THE WIDTH IS MEASURED TOO. It was written as 198 minus the ruler, which is 178 — and the text
     block is 184, because the 6mm right margin is not the ruler's to give up. A budget half of
     which is measured and half of which is assumed is the half that is assumed that goes wrong. */
```

### A PERCENTAGE OF ONE PAGE AND A COUNT, which are the two things somebody holding a phone can picture.

in `matPaint`

```
/* A PERCENTAGE OF ONE PAGE AND A COUNT, which are the two things somebody holding a phone can
     picture. It said "412cm² of paper left", which is true and has to be worked out; and when the
     list is empty it says what to do, because an empty gauge over an empty list reads as broken. */
```

### NOT "OR THE BOTTOM IS CUT OFF", which it said — and could not happen, because Print is disabled while the gauge is over (below).

in `innerHTML`

```
/* NOT "OR THE BOTTOM IS CUT OFF", which it said — and could not happen, because Print is
       disabled while the gauge is over (below). A warning about a consequence the tool has already
       prevented is a sentence the next reader believes; this one also fits on one line at 320. */
```

### ---------- AND WHAT THE BASKET WOULD BE GIVEN

in `matPaint`

```
/* ---------- AND WHAT THE BASKET WOULD BE GIVEN ----------------------------------------------------
     THE SAME SHEET THE PRINT BUTTON WOULD PRINT, described rather than drawn — `mat-cart` reads it,
     so the basket can never hold a sheet the gauge did not pass. The KEY is the subject, the level
     and the sorted ids, which is what makes two presses on one sheet one line and a changed sheet a
     new one. The NAME says subject, level and how many pieces, because that is how the owner tells
     six cheat sheets in one order apart; the PIECE NAMES go with it so the order message lists
     them and the sheet can be rebuilt from the message alone. The ruler is in the list when it is
     ticked — it is on the paper — and not in the count, which is the gauge's. */
```

### ---------- INTO THE BASKET, AS A PRINTED PAGE

top level, before `o`

```
/* ---------- INTO THE BASKET, AS A PRINTED PAGE ----------------------------------------------------------
   A `print` LINE, ONE PAGE, NO PRICE STORED — `cartPrint_` prices it from `print_rate_per_page` every
   time it is asked, and `lamControl_` offers it the laminate switch at `laminate_rate_per_page`,
   both off the Ledger config. Nothing here knows a rate, which is the point: the owner's figure is
   the only figure, and a rate typed into this file would be a second one that goes stale.

   SIGNED OUT, IT SAYS SO AND GOES TO SIGN IN — `cart-add`'s own two lines, because the basket is a
   person's and the order goes out as a message from them. Refused, not greyed, when the sheet is
   empty or over the page: the same rule the Print button is disabled by, said in words for
   somebody who pressed anyway. */
```

### ---------- THERE IS NO PREVIEW

top level, before `MAT_SHEET`

```
/* ---------- THERE IS NO PREVIEW ---------------------------------------------------------------------
   ASKED FOR AS "same for cheat sheet maker" — the preview removed, as for the flyer. It was an A4 page
   scaled to a phone with a transform, most of the card's height spent on a picture of the sheet at a
   size where the type could not be read, and it had cost this file three faults: `matFit` guessing a
   phone width while the panel was off screen, the sheet running off the bottom of the card, and two
   wrong fixes to `.mat-out` made on a measurement nobody took. `matFit`, `matWatch`, `matBalance` and
   `.mat-out` are gone with it.

   THE PAGE STILL HAS TO BE LAID OUT, because the gauge is a measurement of it. So it is built in a
   probe at true size, at the end of `body` where no transformed column can scale it or clip it,
   measured, and taken away again in the same tick — nothing is ever painted, and no layout outlives
   the function. `MAT_SHEET` keeps the result for the printer. */
```

### HOW MANY PIXELS A MILLIMETRE IS, measured rather than assumed — 3.7795 is what a browser SHOULD make of one, and under a page zoom it is not.

top level, before `matPx`

```
/* HOW MANY PIXELS A MILLIMETRE IS, measured rather than assumed — 3.7795 is what a browser SHOULD
   make of one, and under a page zoom it is not. The gauge divides the probe's rendered box by this;
   it scaled the old on-screen preview too, which is gone (see `matProbe`). */
```

### PRINTING FROM INSIDE THE APP.

top level, before `paper`

```
/* PRINTING FROM INSIDE THE APP. A browser prints the whole document, so the class hides everything
   else and lifts the sheet out at full size — set only while printing, so a print started anywhere
   else is untouched. The timer is there because some browsers never fire `afterprint` on a
   cancelled dialogue, and the app would be left with everything hidden: a blank screen that looks
   exactly like a crash. */
```

### BUILT AT THE END OF THE BODY, from the sheet the gauge measured.

top level, before `paper`

```
/* BUILT AT THE END OF THE BODY, from the sheet the gauge measured. It was always a copy here —
     `body` is a centred 26.5rem column that clips at 115mm, so a sheet printed from inside the card
     came out shifted right with its right-hand half missing — and with no preview on the card it is
     now a copy of `MAT_SHEET`, which is the same page without a second rendering of it. */
```

