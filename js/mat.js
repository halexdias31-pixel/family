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

/* HOW MUCH COLUMN THERE IS, after the heading and the footer. Measured on the real sheet, not
   derived from 297 minus some margins — the header and foot are content and their height is
   whatever the font makes it. */
const MAT_ROOM = 262;

/* ---------- HOW MANY NARROW BLOCKS GO ACROSS -----------------------------------------------------
   THREE, AND IT IS NOT A SETTING ANY MORE. `MAT_ACROSS` said how many narrow blocks shared a run,
   and a narrow block's width depended on it and on how many others happened to be ticked beside it.
   The page is a six-track grid now and a narrow block is always two tracks — a third — so three go
   across because 6 / 2 is 3, not because a constant says so. See "EVERY COMPONENT HAS A FIXED AREA"
   below. */
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
const MAT_TRACKS = 6;
/* THE GUTTER, ONCE — the gap between two tracks. The CSS spends it (`.mat-cols` column-gap) and the
   pricing has to know it, so the stylesheet reads it through `--mat-gut` set from here. */
const MAT_GUT = 6;
/* THE ROW UNIT. Slots are whole numbers of these tall, so a slot's height is exact rather than a
   fractional track the browser rounds differently on each sheet. */
const MAT_ROW = 2;
/* THE TEXT BLOCK IS 184mm AND STAYS 184mm. The sheet is 210 wide and gives up 6mm on the right and
   20mm on the left to the ruler. With the ruler off, the left margin shrinks and the grid does NOT
   widen into it: a slot that is 184/3 wide on one sheet and 198/3 on another is not a fixed area. */
const MAT_TEXT_W = 184;
/* ONE TRACK, AND A SPAN OF N OF THEM — the same two constants the stylesheet is given, so the price
   in the picker and the width on the paper cannot disagree (the fault this file records twice: `half`
   priced at 99mm while drawn at 61, the ruler priced at 0cm² while the bar charged 52). */
const matTrackW = () => (MAT_TEXT_W - MAT_GUT * (MAT_TRACKS - 1)) / MAT_TRACKS;
const matSpanW = n => n * matTrackW() + (n - 1) * MAT_GUT;
/* A NARROW BLOCK IS A THIRD, a `pair` block (the hundred square and the times table) two thirds. */
const matColW = () => matSpanW(2);
const matPairW = () => matSpanW(4);
/* HOW MANY TRACKS A COMPONENT TAKES, from what it is rather than from what is beside it. */
const matSpan = c => c.pair ? 4 : (c.half ? 2 : MAT_TRACKS);

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
const MAT_TIERED = ['Y9 Mocks', 'GCSE'];

/* WHICH TIER WAS LAST CHOSEN, and separately WHICH TIER IS BEING DRAWN (`MAT_SHOW`). They are not
   the same: on an untiered level nothing should be filtered, so the drawn tier is 'H' whatever was
   chosen — and the choice has to be kept, or choosing GCSE Foundation, looking at A-level and
   coming back would silently promote the sheet to Higher. It was a pair of buttons; it is the
   `|F` / `|H` half of the level select's value now, and the rule is the same. */
let MAT_TIER = 'H';
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
let MAT_EXAM = 'all';
let MAT_SHOW = 'H';

/* Does this row survive the tier being drawn? A flag of 'H' means Higher only; anything else — and
   that is most rows — means it is on both papers. */
const matKeep = flag => flag !== 'H' || MAT_SHOW === 'H';

/* Each component: what it is called, which levels it suits, what it costs in millimetres, and
   whether it sits half-width so it can pair with the next one.
   THE HEIGHTS ARE MEASURED. The first set were estimates and the gauge was wrong by 300mm — a
   gauge that lies is worse than none, since it is the only thing between a tickbox and a wasted
   sheet. Each was rendered alone and measured. */
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
const MAT_PARTS = [
  /* ---------- THE RULER IS A COMPONENT LIKE ANY OTHER ----------------------------------------------
     IT WAS ALWAYS THERE, drawn straight into the sheet and impossible to switch off, which made it
     the one thing on a cheat sheet nobody could choose. Fine for a maths mat; wrong the moment the
     sheet stopped being only that — a revision sheet of formulae does not want a centimetre scale
     down its edge, and a flyer never did.

     `edge: true` MEANS IT LIVES IN THE MARGIN, NOT THE COLUMN. Every other component takes height
     from the 262mm the gauge is counting; this one takes width from the left margin instead. So it
     costs 0 against the budget, which is not a fiddle — it genuinely uses none of the space the
     other pieces are competing for. */
  /* `h` IS ITS REAL HEIGHT, THE WHOLE PAGE. It was 0 back when the gauge counted height and an edge
     piece had to be made free by lying to it. The gauge counts area now and works the strip out for
     itself — but the PICKER prices from `h`, so the list went on saying 0cm² for a component the
     bar was charging 52cm² for. Two numbers for one thing, and the visible one was the wrong one. */
  { id: 'M01', name: 'Ruler down the edge', face: '|·| ruler', lv: [], h: 262, half: false, edge: true,
    note: 'prints at true size' },
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
  { id: 'M02', name: 'Number square', face: '100 square',      lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 94,  half: true, pair: true },
  { id: 'M03', name: 'Times tables', face: '12×12 tables',       lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 100, half: true, pair: true },
  /* ---------- THE FOUR THAT KEEP THE FULL WIDTH ----------------------------------------------------
     WIDTH IS FUNCTIONAL IN THESE, not a default. Circle theorems is eight figures — at 61mm they
     would be 7mm across, which is smaller than the type beside them. Graph shapes is five curves,
     2D shapes a row of them, and a number line is a line: all three are pictures whose meaning is
     spread sideways, and stacking them does not make them narrower, it makes them wrong.

     SINE & COSINE KEEPS IT TOO, for the one reason a text block can: `a² = b² + c² − 2bc cos A` is
     about 45mm of formula, and 61mm minus a 24mm label column leaves 37. A formula that wraps is a
     formula misread. */
  { id: 'M04', name: 'Number line', face: '0 ½ 1 line',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 20,  half: false },
  { id: 'M05', name: 'Place value', face: 'Th H T U',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 15,  half: true },
  /* MEASURES AND FRACTION=DECIMAL REACH B-TEC. Unit conversion and percentages are most of what an
     applied course asks arithmetically, and it was tagged as though B-TEC were a level above them
     rather than the one course that uses them every week. */
  { id: 'M06', name: 'Measures', face: 'km→m units',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 39,  half: true, inExam: false },
  { id: 'M07', name: 'Angles named', face: '∠ named',       lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 28,  half: true },
  { id: 'M08', name: 'Protractor', face: '◡ protractor',         lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 54,  half: true,
    note: 'prints at true size' },
  /* Y1 AS WELL AS Y2. Naming a triangle and a square is the first year's work, and the block was
     offered to the second year and withheld from the one that starts it. */
  { id: 'M09', name: '2D shapes', face: '△ ▢ ⬠ shapes',          lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 35,  half: false },
  { id: 'M10', name: 'Roman numerals', face: 'XIV numerals',     lv: ['SATs','11+'],                               h: 13,  half: true },
  { id: 'M11', name: 'Fraction = decimal', face: '½ = 0.5', lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 15,  half: true, inExam: false },
  /* NOT AN A-LEVEL BLOCK, WHICH IS WHAT ITS NAME SAYS. "Formulae not given" names a GCSE exam
     convention, and every line in it — circle, sphere, cone, prism, compound measures, percentage
     change, compound interest — is GCSE content that Y9 mocks and B-TEC both examine. An A-level
     student has a different booklet and does not consult this one. */
  /* ---------- EIGHT FORMULAE, EIGHT TICKBOXES ------------------------------------------------------
     "Formulae not given" WAS ONE BOX HOLDING EIGHT UNRELATED FACTS. A student wanting the circle and
     percentage change had to take the cone and compound interest with them, and the only thing the
     eight had in common was a fact ABOUT them — that the exam does not print them. That is a
     property, not a shelf. Grouping by it made the sphere and the prism into one object.

     SO EACH IS ITS OWN COMPONENT and "not given" is a marker on it, which is the honest shape: any
     component can be given or not given, and several outside this old group are. */
  { id: 'M12A', name: 'Circle', face: 'πr² circle',            lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12B', name: 'Arc & sector', face: 'θ/360 arc',      lv: ['Y9 Mocks','GCSE'],                          h: 10, half: true, inExam: false },
  { id: 'M12C', name: 'Sphere', face: '⁴⁄₃πr³ sphere',            lv: ['GCSE'],                                     h: 10, half: true, tier: 'H', inExam: true },
  { id: 'M12D', name: 'Cone', face: '⅓πr²h cone',              lv: ['GCSE'],                                     h: 10, half: true, tier: 'H', inExam: true },
  { id: 'M12E', name: 'Prism', face: 'A × l prism',             lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12F', name: 'Compound measures', face: 'd/t speed', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12G', name: 'Percentage change', face: '%Δ change', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12H', name: 'Compound interest', face: 'P(1+r)ⁿ interest', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: true },
  { id: 'M13', name: 'Exact trig values', face: 'sin30 exact',  lv: ['GCSE','AS','Alevel'],                       h: 33,  half: true, tier: 'H', inExam: false },
  { id: 'M14', name: 'The trig trick', face: '√n⁄2 trick',     lv: ['GCSE','AS','Alevel'],                       h: 33,  half: true, tier: 'H', inExam: false },
  /* INDEX LAWS AND GRAPH SHAPES START AT Y9. Both are Y8/Y9 teaching, and both were tagged from
     GCSE up while the straight line beside them started at Y9 — the same year, three rows apart,
     disagreeing about when algebra begins. */
  { id: 'M15', name: 'Index laws', face: 'aᵐaⁿ index',         lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 24,  half: true, inExam: false },
  { id: 'M16', name: 'Graph shapes', face: 'y=x² graphs',       lv: ['Y9 Mocks','GCSE','AS','Alevel'],            h: 40,  half: false, inExam: false },
  /* AS BUT NOT ALEVEL was the clearest error in the table: A-level contains everything AS does, so
     a component offered to the first year and withheld from the second cannot be right either way
     round. B-TEC too — gradient is how every rate-of-change task on an applied course is read. */
  { id: 'M17', name: 'Straight line', face: 'y = mx + c',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 29,  half: true, inExam: false },
  { id: 'M18', name: 'Averages', face: 'x̄ averages',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 24,  half: true, inExam: false },
  /* THE HEIGHTS BELOW ARE MODELLED, NOT MEASURED, and they are the weakest numbers in this file.
     A wrap model calibrated on the four hand-measured pair blocks still came out between 15% and
     70% low, because how far a row wraps depends on the exact string. They are scaled up from it
     and should be read as indicative — the gauge measures the real column, so a sheet cannot
     overrun on the strength of a wrong label, but a label can still tell you 28mm and cost 40. */
  { id: 'M19', name: 'Pythagoras & trig', face: 'a²+b²=c²',  lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 28,  half: true, inExam: true },
  { id: 'M20', name: 'Angle rules', face: '180° rules',        lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 35,  half: true, inExam: false },
  { id: 'M21', name: 'Area & perimeter', face: '½bh area',   lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 23,  half: true, inExam: false },
  /* SATs. Percentages of an amount is Y6, and fractions, rounding, area and averages all carry
     SATs on the rows around this one — four neighbours teaching the same year, and this the only
     one saying otherwise. */
  { id: 'M22', name: 'Percentages', face: '15% of 40',        lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 23,  half: true, inExam: false },
  { id: 'M23', name: 'Rounding & bounds', face: '≈ bounds',  lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 35,  half: true, inExam: false },
  { id: 'M24', name: 'Standard form', face: 'a × 10ⁿ',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 35,  half: true, inExam: false },
  /* SATs, for the same reason: continuing a number sequence is Y6, and the nth term on top of it
     is what the later levels add rather than what makes the block start. */
  { id: 'M25', name: 'Sequences', face: 'nth term',          lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 41,  half: true, inExam: false },
  /* B-TEC, LIKE THE ALGEBRA EITHER SIDE OF IT. Index laws, the straight line and standard form all
     carry B-TEC; solving a quadratic is the same kind of tool on the same kind of course, and its
     absence here was an omission rather than a decision. */
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
  { id: 'M26', name: 'Quadratics', face: 'ax²+bx+c',         lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 23,  half: true, inExam: true },
  /* 11+, WHERE IT IS ASKED. Simple probability is on entrance papers, and this was the only block
     on a common 11+ topic that an 11+ student could not see. */
  { id: 'M27', name: 'Probability', face: 'P(A) chance',        lv: ['11+','Y9 Mocks','GCSE','B-TEC'],            h: 28,  half: true, inExam: false },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
  { id: 'M28', name: 'Primes, HCF & LCM', face: 'HCF · LCM',  lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 23,  half: true, inExam: false },
  /* SET NOTATION SITS BESIDE PROBABILITY because that is where the sheet already talks about A and
     B — 'A and B' and 'A or B' are M27's words for what this block gives the symbols for. Higher
     only: Foundation meets Venn diagrams but is not asked to read the notation. */
  { id: 'M49', name: 'Set notation', face: 'A ∩ B sets',        lv: ['GCSE'],                                     h: 47,  half: true, tier: 'H', inExam: false },
  /* HIGHER, AND WHOLLY SO — both of these are Higher-only content top to bottom, which is what makes
     them component-wide tiers rather than the row-level ones inside M22, M23, M25 and M26. */
  { id: 'M29', name: 'Sine & cosine rule', face: 'a⁄sin A rule', lv: ['GCSE','AS','Alevel'],                       h: 18,  half: false, tier: 'H', inExam: true },
  { id: 'M30', name: 'Circle theorems', face: '◯ theorems',    lv: ['GCSE'],                                     h: 28,  half: false, tier: 'H', inExam: false },
  { id: 'M31', name: 'Fractions', face: 'a⁄b + c⁄d',          lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 35,  half: true, inExam: false },
  /* YEAR ONE IS 'AS','Alevel' AND YEAR TWO IS 'Alevel' ALONE. The pair of them is the only place in
     this table where one level contains another, which is why it is the only place a component is
     deliberately withheld from the lower of the two rather than shared upward. */
  { id: 'M32', name: 'Differentiation', face: 'dy/dx differ.',    lv: ['AS','Alevel'],                              h: 40,  half: true },
  { id: 'M33', name: 'Differentiation rules', face: 'uv′ rules', lv: ['Alevel'],                                h: 29,  half: true },
  { id: 'M34', name: 'Integration', face: '∫ integrate',        lv: ['AS','Alevel'],                              h: 40,  half: true },
  { id: 'M35', name: 'Integration methods', face: '∫u dv by parts', lv: ['Alevel'],                                  h: 35,  half: true },
  { id: 'M36', name: 'Logs & exponentials', face: 'ln x logs', lv: ['AS','Alevel'],                             h: 23,  half: true },
  { id: 'M37', name: 'Binomial expansion', face: 'ⁿCᵣ binomial', lv: ['AS','Alevel'],                              h: 17,  half: true },
  { id: 'M38', name: 'Trig identities', face: 'sin²+cos²',    lv: ['AS','Alevel'],                              h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
  { id: 'M39', name: 'Double & addition', face: 'sin 2A double',  lv: ['Alevel'],                                   h: 23,  half: true },
  { id: 'M40', name: 'Radians', face: 'π = 180° rad',            lv: ['Alevel'],                                   h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
  { id: 'M41', name: 'Series', face: 'Σ series',             lv: ['Alevel'],                                   h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
  { id: 'M42', name: 'Circles & points', face: '(x−a)² eqn',   lv: ['AS','Alevel'],                              h: 23,  half: true },
  { id: 'M43', name: 'Vectors', face: '⟶ vectors',            lv: ['AS','Alevel'],                              h: 29,  half: true },
  { id: 'M44', name: 'SUVAT & forces', face: 'F = ma forces',     lv: ['AS','Alevel'],                              h: 29,  half: true },
  { id: 'M45', name: 'Binomial distribution', face: 'B(n,p) binomial', lv: ['AS','Alevel'],                           h: 35,  half: true },
  { id: 'M46', name: 'Normal distribution', face: 'N(μ,σ²) normal', lv: ['Alevel'],                                  h: 29,  half: true },
  { id: 'M47', name: 'Hypothesis testing', face: 'H₀ testing', lv: ['AS','Alevel'],                              h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other
     one — at 99mm it is a comfortable two-up table, and the alternative was 198. At three across it
     is 61mm and the same rows simply run down instead of across: taller, and no longer a break in
     the column rules for something that is only text. */
  { id: 'M48', name: 'Numerical methods', face: 'xₙ₊₁ iter',  lv: ['Alevel'],                                   h: 23,  half: true },
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
  { id: 'M50', subject: 'Science', name: 'Periodic table', face: 'H He table',  lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 96,  half: false, inExam: true },
  /* ---------- THE pH SCALE AND THE INDICATORS --------------------------------------------------------
     ASKED FOR AS "add ph indicator to cheat sheet". The universal indicator colours from 0 to 14, the
     words a question uses for each end, and the three single indicators a GCSE paper names (litmus,
     methyl orange, phenolphthalein) with the colour each turns in acid and in alkali.
     TWO THIRDS WIDE (`pair`), because fifteen colour cells need about 8mm each to hold their number,
     and a third of the page would make them 4mm; the third left over takes another piece beside it.
     NOT GIVEN IN THE EXAM — nobody hands a student the colour chart, which is why it is worth a slot.
     NAMED WITHOUT "pH" because a piece's heading is set in capitals, and "PH SCALE" is the one way a
     chemist would never write it; the list's own face still says pH 0–14. */
  { id: 'M51', subject: 'Science', name: 'Acids, alkalis & indicators', face: 'pH 0–14', lv: ['Y9 Mocks','GCSE','B-TEC'], h: 34, half: true, pair: true, inExam: false },
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
  { id: 'M52', name: 'Negative number line', face: '−10 0 10 line', lv: ['SATs','11+','Y9 Mocks','GCSE'], h: 15, half: false, inExam: false, at0: 35 },
];

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
const MAT_SLOT = {
  M02: 112, M03: 112, M04: 28, M05: 20, M06: 42, M07: 30, M08: 60, M09: 40, M10: 18, M11: 24,
  M12A: 14, M12B: 18, M12C: 18, M12D: 18, M12E: 14, M12F: 14, M12G: 18, M12H: 14,
  M13: 36, M14: 44, M15: 54, M16: 46, M17: 38, M18: 32, M19: 54, M20: 72, M21: 42, M22: 46,
  M23: 46, M24: 38, M25: 42, M26: 44, M27: 50, M28: 46, M29: 24, M30: 36, M31: 46, M32: 46,
  M33: 66, M34: 44, M35: 56, M36: 50, M37: 36, M38: 46, M39: 46, M40: 46, M41: 54, M42: 42,
  M43: 38, M44: 54, M45: 38, M46: 46, M47: 42, M48: 44, M49: 60, M50: 98, M51: 42, M52: 22,
  /* M52 MEASURED ON THE PRINTED SHEET: 18.8mm under a block, with its rule and the 3mm beneath it —
     given a millimetre for another browser's mono and rounded up to the row, 22. */
  /* THE ENGLISH PIECES (see `MAT_PARTS_EN`), measured the same way — each alone at its own slot
     width, its scroll height read off the page — and given a millimetre before rounding, because a
     label-and-value block wraps a word or two differently in another browser's sans-serif and the
     alarm below should be for a stale number, not for a font. */
  E02: 22, E03: 54, E04: 34, E05: 66, E06: 42, E07: 58, E08: 58, E09: 42, E10: 34, E11: 48,
  E12: 26, E13: 36, E14: 36, E15: 66, E16: 50, E17: 42, E18: 32, E19: 56, E20: 52, E21: 30,
  E22: 44,
};
const matSlot = c => {
  const mm = MAT_SLOT[c.id] || (Number(c.h) || 20) + 8;
  return Math.ceil(mm / MAT_ROW) * MAT_ROW;
};


/* WHAT IS TICKED WHEN IT OPENS, from the sheet when the sheet says. `start_on` on the cheatsheet
   tab decides it; the list above is what happens when no row does, which is also what happens
   before the payload lands. Falling back to a working example rather than to nothing is the whole
   reason that list exists — see the note above it. */
function matStart() {
  /* ---------- NOTHING IS TICKED UNLESS THE SHEET SAYS SO ------------------------------------------
     THERE WAS A LIST OF SEVEN HERE and it was reached whenever the sheet had nothing to say — an
     empty tab, a backend not yet redeployed, a payload still in flight. Every one of those is a
     REASON TO KNOW NOTHING, and the code answered all three with a confident seven ticks that
     nobody had asked for and unticking could not remove.

     A DEFAULT THAT SURVIVES BEING OVERRULED IS NOT A DEFAULT. `start_on` is the only thing that
     ticks a box now; no rows means no ticks, which is also the honest picture of knowing nothing. */
  return (DATA.cheatsheet || []).filter(r => r && r.startOn).map(r => r.id);
}
/* ---------- NOTHING IS CHOSEN FOR YOU --------------------------------------------------------------
   THIS OPENED ON 'SATs', which is one of nine levels and was picked by being first to mind when the
   line was typed. For anybody teaching GCSE it is simply the wrong sheet, silently — the list is
   already filtered before they have touched anything, and there is no sign that a filter is on.
   `all` IS THE ONLY NON-ANSWER. It shows every component and privileges no level, so the first
   choice on the screen is still the user's to make. */
let MAT_LEVEL = 'all';
let MAT_ON = [];   /* filled from the sheet by matStart() when the tool opens */
/* WHETHER ANYBODY HAS CHOSEN ANYTHING YET. Without this, opening the tool a second time would
   silently undo the sheet somebody had just built. */
let MAT_TOUCHED = false;

/* THE LEVELS THE REST OF THE SITE USES. `primary` and `secondary` were a vocabulary I invented, and
   the options tab already lists the real ones — so a level added there arrives here without anybody
   remembering this file exists. The fallback is only for a payload that has not loaded. */
function matLevels() {
  /* `levels`, AND IT IS A PLAIN ARRAY OF STRINGS — `book.js` hands it straight to a question as
     options, which is the proof. I had written `x.value || x.name || x` in case they were objects;
     guessing at two shapes when one file already answers it is how a wrong guess ships. */
  const got = ((DATA.dropdowns || {}).levels || []).filter(Boolean);
  return got.length ? got
    : ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel', 'B-TEC'];
}

/* THE BRAND, READ THE WAY THE FLYER READS IT. Not a second copy of the fallbacks — a cheat sheet
   and a flyer printed the same afternoon carrying two different site addresses is exactly the drift
   that brought the flyer in from its own file. `brand()` alone was not enough: it falls back to
   whatever the caller passes, and this file passed '' for the site, so the footer printed a blank
   where the address goes on every sheet where the brand tab has no `site` row.
   The guard is for the case where flyer.js is not loaded; the fallbacks below are the same ones. */
const matBrand = () => (typeof flyBrand === 'function' ? flyBrand() : {
  name:  brand('name', '@family.'),
  area:  brand('area', 'Merton & Wandsworth'),
  site:  brand('site', 'halexdias31-pixel.github.io/family/'),
  phone: brand('phone', ''),
});

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
/* THE SHEET SAYS `Higher` AND THE CODE SAYS 'H'. The full word is what the resources tab already
   stores against all 78 past papers, so that is the word to type; this is the one place the two
   vocabularies meet, rather than every row of every table having to pick one. */
const matTierFlag = v => /^h/i.test(String(v || '').trim()) ? 'H'
                       : (/^f/i.test(String(v || '').trim()) ? 'F' : '');

function matParts() {
  const rows = DATA.cheatsheet || [];
  const by = {};
  rows.forEach(r => { if (r && r.id) by[String(r.id).toUpperCase()] = r; });

  /* THE MATHS AND THE ENGLISH, one list — see `MAT_PARTS_EN`. Concatenated here rather than
     written into `MAT_PARTS`, so the English is one block that can be read, and moved, whole. */
  const all = MAT_PARTS.concat(MAT_PARTS_EN);

  const out = all.map((c, i) => {
    const r = by[c.id];
    /* IN THE CODE AND NOT IN THE SHEET is not the same as switched off. The backend only sends rows
       whose `active` is on, so a component with no row here is one the sheet has never been told
       about — and it keeps everything the code says about it. */
    if (!r) return Object.assign({}, c, { h: c.edge ? MAT_ROOM : matSlot(c), at: c.at0 || (i + 1) * 10 });
    const levels = String(r.levels || '').split(/[,\n|]/).map(s => s.trim()).filter(Boolean);
    return Object.assign({}, c, {
      name:  r.name || c.name,
      /* A SUBJECT THE SHEET CAN SET, and an empty cell leaves the code's — see `matSubjectOf`. */
      subject: r.subject || c.subject,
      lv:    levels.length ? levels : c.lv,
      /* THE SHEET CAN ADD A TIER AND IT CAN TAKE ONE AWAY. `'-'` is how you say "both papers" about
         a component the code calls Higher-only, since an empty cell already means "no opinion" and
         one value cannot mean both. */
      tier:  r.tier === '-' ? '' : (matTierFlag(r.tier) || c.tier),
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
      /* ---------- AND THE SLOT IS NOT A SETTING EITHER -----------------------------------------
         THE SHEET'S `height_mm` AND `half_width` USED TO WIN, and that is how a component's size came
         to depend on a cell: six rows say `half_width: False` for blocks the code draws narrow, and
         the heights in that tab are the estimates this file already calls "a long way out" (index
         laws written as 24mm, rendering at 77). A fixed area has to be decided in one place and
         measured against the drawing, so both come from the code — `matSlot` below. The sheet still
         owns the name, the levels, the tier, the order and whether a component is offered at all. */
      h:     c.edge ? MAT_ROOM : matSlot(c),
      /* WHETHER THE EXAM GIVES YOU THIS. Only the sheet knows — nothing in the code has an opinion,
         and null stays null so "nobody has checked" survives all the way to the screen. */
      /* THE SHEET WINS, THE CODE ANSWERS WHEN IT IS SILENT. `null` from the tab means the cell was
         empty, which is "nobody has checked" — and that is not the same as the code not knowing. */
      inExam: (r.inExam === undefined || r.inExam === null)
                ? (c.inExam === undefined ? null : c.inExam) : r.inExam,
      at:    r.order === null || r.order === undefined ? (c.at0 || (i + 1) * 10) : r.order,
    });
  });

  /* SORTED BY THE SHEET'S NUMBER, ties broken by the order they are written in code — so a column
     of blank `sort_order` cells leaves the sheet exactly as it prints today, and filling in one cell
     moves one component. */
  /* ONE SUBJECT AFTER ANOTHER, THEN THE SHEET'S ORDER WITHIN IT. The tab numbers each subject from
     10 — the English rows restart where the maths ones start — so ordering on the number alone
     interleaved them, a hundred square beside the alphabet, on the one view that shows both. Which
     subject comes first is `matSubjectOrder`'s answer, the same one the subject select gives, so the
     list and the select cannot disagree about it. The ruler is in no subject and goes first. */
  const order = matSubjectOrder(out);
  const rank = c => { const s = matSubjectOf(c); return s ? order.indexOf(s) + 1 : 0; };
  return out.sort((a, b) => rank(a) - rank(b) || a.at - b.at);
}

/* ---------- THE BLOCKS ---------------------------------------------------------------------------
   Each returns the HTML for one component. They are here rather than generated, because the mat is
   drawn from the same data the app already holds and a template that has to be regenerated is a
   second build step for a print sheet. */
const MAT_HTML = {
  M02: () => matGrid('mat-hun', 100, n => {
    const c = n % 10 === 0 ? ' ten' : (n % 5 === 0 ? ' five' : '');
    return `<i class="${c.trim()}">${n}</i>`;
  }),
  M03: () => {
    let h = '<i class="h"></i>';
    for (let x = 1; x <= 12; x++) h += `<i class="h">${x}</i>`;
    for (let y = 1; y <= 12; y++) {
      h += `<i class="h">${y}</i>`;
      for (let x = 1; x <= 12; x++) h += `<i class="${x === y ? 'sq' : ''}">${x * y}</i>`;
    }
    return `<div class="mat-tt">${h}</div>`;
  },
  M04: () => {
    const W = 100;
    const fr = [[0,1,'0'],[1,4,'¼'],[1,3,'⅓'],[1,2,'½'],[2,3,'⅔'],[3,4,'¾'],[1,1,'1']];
    let h = fr.map(([n, d, l]) =>
      `<i style="left:${W*n/d}%"></i><b style="left:${W*n/d}%">${l}</b>`).join('');
    for (let k = 0; k <= 10; k++) {
      h += `<u style="left:${k*10}%"></u>`;
      /* THE DECIMALS ONLY WHERE THE FRACTIONS ARE SILENT. 0, 0.5 and 1.0 sat directly under 0, the
         half and 1 — the same three places on the line labelled twice, which is what made the strip
         look crowded and, worse, made the two systems look like different scales rather than one.
         Four labels where there were six, and every one of them says something the row above does
         not. */
      if ([2,4,6,8].indexOf(k) !== -1) h += `<s style="left:${k*10}%">${(k/10).toFixed(1)}</s>`;
    }
    return `<div class="mat-nl">${h}</div>`;
  },
  M05: () => `<div class="mat-pv">${
    [['Th','1000'],['H','100'],['T','10'],['U','1'],['•',''],['t','0.1'],['h','0.01']]
      .map(([c, v]) => `<i class="${c === '•' ? 'dot' : ''}"><b>${c}</b><em>${v}</em></i>`).join('')}</div>`,
  M06: () => `<div class="mat-meas">${
    [['Length', ['10 mm = 1 cm','100 cm = 1 m','1000 m = 1 km']],
     ['Mass', ['1000 g = 1 kg','1000 kg = 1 tonne']],
     ['Capacity', ['1000 ml = 1 litre','100 cl = 1 litre']],
     ['Time', ['60 sec = 1 min','60 min = 1 hr','24 hr = 1 day']]]
      .map(([k, vs]) => `<div><em>${k}</em>${vs.map(v => `<i>${v}</i>`).join('')}</div>`).join('')}</div>`,
  M07: () => matAngles(),
  M08: () => matProtractor(),
  M09: () => `<div class="mat-shapes">${
    [['triangle',3],['square',4],['pentagon',5],['hexagon',6],
     ['heptagon',7],['octagon',8],['nonagon',9],['decagon',10]]
      .map(([n, k]) => `<div>${matPoly(k)}<span>${n}</span><em>${k} sides</em></div>`).join('')}</div>`,
  M10: () => `<div class="mat-rom">${
    [['I',1],['V',5],['X',10],['L',50],['C',100],['D',500],['M',1000]]
      .map(([a, b]) => `<i><b>${a}</b>${b}</i>`).join('')}
    <i class="wide">4 = IV · 9 = IX · 40 = XL · 90 = XC · 2026 = MMXXVI</i></div>`,
  M11: () => `<div class="mat-fdp">${
    [[fr('1','2'),'0.5','50%'], [fr('1','4'),'0.25','25%'], [fr('3','4'),'0.75','75%'],
     [fr('1','3'),'0.33','33⅓%'], [fr('1','5'),'0.2','20%'], [fr('1','10'),'0.1','10%'],
     [fr('1','8'),'0.125','12.5%'], [fr('1','1'),'1.0','100%']]
      .map(([f, d, p]) => `<i><b>${f}</b><em>${d}</em><em>${p}</em></i>`).join('')}</div>`,
  /* THE THIRD ENTRY IS THE TIER. Sphere and cone are Higher-only content; the rest of this block is
     on both papers, so tagging the whole component 'H' would have taken the circle away from a
     Foundation student to keep a sphere they will never be asked for. */
  M12A: () => matPairs([['Circle','A = πr² · C = 2πr']]),
  M12B: () => matPairs([['Arc, sector', fr('θ','360') + ' × 2πr · × πr²']]),
  M12C: () => matPairs([['Sphere', 'V = ' + fr('4','3') + 'πr³ · A = 4πr²']]),
  M12D: () => matPairs([['Cone', 'V = ' + fr('1','3') + 'πr²h · πrl']]),
  M12E: () => matPairs([['Prism','V = cross-section × length']]),
  M12F: () => matPairs([['Compound','speed = d/t · density = m/v']]),
  M12G: () => matPairs([['% change', fr('new − old','old') + ' × 100']]),
  M12H: () => matPairs([['Interest','P(1 + r)ⁿ']]),
  /* EVERY VALUE AS √n ÷ 2, INCLUDING THE ONES THAT SIMPLIFY. The table used to read 0, ½, √2/2,
     √3/2, 1 — five values with nothing in common, which is five things to memorise and no way to
     rebuild any of them once one has gone. Written unsimplified they are one thing: n counts 0 1 2
     3 4 across for sine and back down for cosine, and a student who has the counting has the row.
     THE NUMBERS ARE COUNTED, NOT TYPED, so the pattern is in the code as well as on the paper and
     the two cannot disagree.
     TAN IS NOT OF THAT FORM and is left as it is. It is a table of exact values and dropping the
     row to keep the pattern tidy would be losing the third of them people look up most. */
  M13: () => {
    const surd = n => fr('√' + n, '2');
    const rows = [['sin', [0, 1, 2, 3, 4].map(surd)],
                  ['cos', [4, 3, 2, 1, 0].map(surd)],
                  ['tan', ['0', '√3/3', '1', '√3', '—']]];
    let h = ['', '0°', '30°', '45°', '60°', '90°'].map(x => `<i class="h">${x}</i>`).join('');
    rows.forEach(([name, vs]) => {
      h += `<i class="h">${name}</i>` + vs.map(v => `<i>${v}</i>`).join('');
    });
    return `<div class="mat-trig">${h}</div>`;
  },
  M14: () => matTrick(),
  /* POSITIVE POWERS AND THE ZERO INDEX ARE ON BOTH PAPERS. Negative and fractional indices are
     Higher, and they are the two rows a Foundation student would spend the longest reading. */
  M15: () => matPairs([['aᵐ × aⁿ','aᵐ⁺ⁿ'],['aᵐ ÷ aⁿ','aᵐ⁻ⁿ'],['(aᵐ)ⁿ','aᵐⁿ'],
                       ['a⁰','1'],['a⁻ⁿ', fr('1','aⁿ'), 'H'],
                       /* SUPERSCRIPT, LIKE THE FIVE ABOVE IT. `a^½` was typed with a caret because
                          there is no single superscript ½ character — but every other law in the
                          block is set properly, so the last line read as somebody's plain-text note
                          in the middle of printed mathematics. `<sup>` needs no character to exist.
                          AND THE GENERAL FORM, since a½ alone teaches one case: the same rule gives
                          the cube root and every other, and a student who has aⁿ can rebuild a½. */
                       ['a<sup>1/n</sup>','ⁿ√a','H'],
                       ['a<sup>1/2</sup>','√a','H']]),
  M16: () => matGraphs(),
  /* PARALLEL IS ON BOTH PAPERS AND PERPENDICULAR IS NOT — the one distinction in this block, and
     the reason it could not be tiered as a whole. */
  M17: () => matPairs([['y = mx + c','m is the gradient, c the crossing'],
                       ['gradient', fr('y₂ − y₁','x₂ − x₁')],
                       ['parallel','same m'], ['perpendicular','m₁ × m₂ = −1', 'H']]),
  M18: () => matPairs([['mean','add up, divide by how many'], ['median','in order, take the middle'],
                       ['mode','the one that appears most'], ['range','biggest minus smallest']]),

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
  M19: () => matPairs([['a² + b² = c²','c is the longest side'], ['a shorter side','c² − a²'],
                       ['sin', fr('opp','hyp')], ['cos', fr('adj','hyp')], ['tan', fr('opp','adj')],
                       ['an angle','sin⁻¹ cos⁻¹ tan⁻¹']]),

  M20: () => matPairs([['straight line','180°'], ['at a point','360°'], ['triangle','180°'],
                       ['quadrilateral','360°'], ['vertically opposite','equal'],
                       ['alternate (Z)','equal'], ['corresponding (F)','equal'],
                       ['co-interior (C)','180°'], ['exterior sum','360°'],
                       ['interior sum','(n − 2) × 180°']]),

  M21: () => matPairs([['rectangle','bh'], ['triangle','½bh'], ['parallelogram','bh'],
                       ['trapezium','½(a + b)h'], ['circle','πr²'], ['compound','split it, add up']]),

  /* REVERSE PERCENTAGE IS THE HIGHER LINE. Finding the original amount is the one thing in this
     block a Foundation paper does not ask for, and it is also the one people get wrong by doing the
     obvious thing instead. */
  M22: () => matPairs([['15% of 40','0.15 × 40'], ['up 15%','× 1.15'], ['down 15%','× 0.85'],
                       ['reverse','÷ the multiplier','H'], ['change', fr('new − old','old')],
                       ['compound','P(1 + r)ⁿ']]),

  M23: () => matPairs([['3 s.f.','from the first non-zero'], ['2 d.p.','after the point'],
                       ['5 or more','rounds up'], ['estimating','1 s.f. each first'],
                       ['error interval','± half the unit','H'], ['bounds of a sum','max + max','H']]),

  M24: () => matPairs([['a × 10ⁿ','1 ≤ a < 10'], ['big','n positive'], ['small','n negative'],
                       ['×','× the a, add the n'], ['÷','÷ the a, take the n']]),

  M25: () => matPairs([['linear nth term','difference × n, adjust'],
                       ['term-to-term','what gets the next one'],
                       ['quadratic','2nd difference ÷ 2','H'], ['geometric','× a common ratio'],
                       ['triangular','1 3 6 10 15 21'], ['Fibonacci','add the two before']]),

  /* FULL WIDTH, because two of these values are twenty-four characters of algebra that cannot be
     said any shorter and would wrap to three lines in a half-width column. */
  M26: () => matPairs([['factorising','× to c, + to b'], ['two squares','x² − a² = (x + a)(x − a)'],
                       ['the formula', fr('−b ± √(b² − 4ac)','2a'), 'H'],
                       ['completing the square','(x + b/2)² − (b/2)² + c','H'],
                       ['discriminant','b² − 4ac','H']]),

  M27: () => matPairs([['all outcomes','add to 1'], ['not A','1 − P(A)'],
                       ['A and B','× along branches'], ['A or B','+ the branches'],
                       ['expected number','P × trials'], ['relative frequency', fr('successes','trials')]]),

  M28: () => matPairs([['prime','exactly two factors'], ['primes to 30','2 3 5 7 11 13 17 19 23 29'],
                       ['product of primes','divide by the smallest'], ['HCF','the shared primes'],
                       ['LCM','every prime, shared once'], ['BIDMAS','brackets, indices, ÷×, +−']]),

  M29: () => matPairs([['sine rule', fr('a','sin A') + ' = ' + fr('b','sin B')],
                       ['cosine rule','a² = b² + c² − 2bc cos A'], ['area','½ab sin C'],
                       ['which one','angle between → cosine']]),

  M30: () => `<div class="mat-circ">${[
  /* THE DIAMETER IS DASHED, because it is construction rather than part of the theorem — the
     theorem is the two lines to the edge and the right angle they make. */
  matCirc('<path d="M20,52 L100,52" class="dash"/>' +
          '<path d="M20,52 L60,12 L100,52" class="ln"/>' +
          '<path d="M60,12 L54.3,17.7 L60,23.4 L65.7,17.7 Z" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'semicircle &rarr; 90&deg;'),

  matCirc('<path d="M25.4,72 L60,52 L94.6,72" class="ln"/>' +
          '<path d="M25.4,72 L60,12 L94.6,72" class="ln"/>' +
          '<text x="60" y="70" class="lb" text-anchor="middle">2x</text>' +
          '<text x="60" y="34" class="lb" text-anchor="middle">x</text>',
          'centre &rarr; twice the edge'),

  matCirc('<path d="M25.4,72 L94.6,72" class="ch"/>' +
          '<path d="M25.4,72 L40,17.4 L94.6,72" class="ln"/>' +
          '<path d="M25.4,72 L80,17.4 L94.6,72" class="ln"/>' +
          '<text x="34" y="33" class="lb">x</text><text x="79" y="33" class="lb">x</text>',
          'same segment &rarr; equal'),

  matCirc('<polygon points="31.7,23.7 88.3,23.7 94.6,72 25.4,72" class="ln"/>' +
          '<text x="36" y="37" class="lb">x</text><text x="82" y="66" class="lb">y</text>',
          'cyclic quad &rarr; 180&deg;'),

  matCirc('<path d="M14,92 L106,92" class="ln"/><path d="M60,52 L60,92" class="ln"/>' +
          '<path d="M60,84 L68,84 L68,92" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'tangent &amp; radius &rarr; 90&deg;'),

  /* THIS ONE IS DRAWN ON ITS OWN CIRCLE — the external point has to sit inside the box, so the
     circle moves up and shrinks rather than the point falling off the bottom. The tangents are
     carried a little past where they touch, because a line that stops exactly at the circle reads
     as a chord that missed. */
  matCirc('<circle cx="60" cy="45" r="34" class="rim"/>' +
          '<path d="M60,100 L27.7,58.9 M60,100 L92.3,58.9" class="ln"/>' +
          '<path d="M44,80 L50,76 M76,80 L70,76" class="mk"/>' +
          '<circle cx="60" cy="100" r="1.8" class="dot"/>',
          'two tangents &rarr; equal', true),

  matCirc('<path d="M14,92 L106,92" class="ln"/><path d="M60,92 L94.6,32" class="ln"/>' +
          '<path d="M25.4,32 L60,92 M25.4,32 L94.6,32" class="ln"/>' +
          '<text x="67" y="87" class="lb">x</text><text x="30" y="46" class="lb">x</text>',
          'alternate segment &rarr; same'),

  matCirc('<path d="M25.4,72 L94.6,72" class="ln"/><path d="M60,52 L60,72" class="ln"/>' +
          '<path d="M60,64 L68,64 L68,72" class="mk"/>' +
          '<path d="M42.7,68 L42.7,76 M77.3,68 L77.3,76" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'centre to chord &rarr; bisects')
].join('')}</div>`,

  M49: () => `<div class="mat-venn">${[
    matVenn(VS_LENS, 'A &#8745; B', 'in both'),
    matVenn('<circle class="vs-on" cx="38" cy="28" r="22"/><circle class="vs-on" cx="58" cy="28" r="22"/>',
            'A &#8746; B', 'in either'),
    /* NOT-A IS THE BOX WITH ONE HOLE IN IT, and the hole is A alone. The part of B that lies outside
       A is not in A, so it stays shaded — whiting B out as well would draw (A &#8746; B)&#8242; and
       call it A&#8242;, which is the mistake the diagram exists to stop. */
    matVenn('<rect class="vs-on" x="3" y="3" width="90" height="50"/>' +
            '<circle class="vs-out" cx="38" cy="28" r="22"/>',
            'A&#8242;', 'not in A'),
    /* AND &#958; IS EVERYTHING, circles included — shading the box but leaving the two circles white
       says "everything except A and B", which is the one thing &#958; is not. */
    matVenn('<rect class="vs-on" x="3" y="3" width="90" height="50"/>',
            '&#958;', 'everything'),
  ].join('')}</div>`,

  M31: () => matPairs([['adding','same denominator first'], ['multiplying','tops × tops'],
                       ['dividing','flip and multiply'], ['of','× the fraction'],
                       ['mixed → improper','whole × bottom, + top'], ['simplifying','÷ both by the HCF']]),

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
  M32: () => matPairs([['xⁿ','nxⁿ⁻¹'], ['gradient there','put x into f′(x)'],
                       ['tangent','y − y₁ = m(x − x₁)'], ['normal', 'gradient −' + fr('1','m')],
                       ['stationary','f′(x) = 0'], ['max or min','f″(x) < 0 is a max']]),

  M33: () => matPairs([['chain','f′(g) × g′'], ['product','u′v + uv′'],
                       ['quotient', fr('u′v − uv′','v²')], ['sin x','cos x'], ['cos x','−sin x'],
                       ['eˣ','eˣ'], ['ln x', fr('1','x')], ['dy/dx', fr('1','dx/dy')]]),

  M34: () => matPairs([['xⁿ', fr('xⁿ⁺¹','n + 1') + ' + c'], ['the + c','indefinite only'],
                       ['definite','F(b) − F(a)'], ['area under a curve','∫ between the limits'],
                       ['below the axis','comes out negative']]),

  M35: () => matPairs([['by parts','∫u dv = uv − ∫v du'], ['substitution','change the limits too'],
                       [fr('1','x'), 'ln |x| + c'], ['eˣ','eˣ + c'], ['sin x','−cos x + c'],
                       ['cos x','sin x + c'], [fr('f′(x)','f(x)'), 'ln |f(x)| + c']]),

  M36: () => matPairs([['log a + log b','log ab'], ['log a − log b', 'log ' + fr('a','b')],
                       ['n log a','log aⁿ'], ['log 1','0'], ['aˣ = b', 'x = ' + fr('log b','log a')],
                       ['ln and eˣ','undo each other']]),

  M37: () => matPairs([['(a + b)ⁿ','ⁿCr aⁿ⁻ʳ bʳ'], ['ⁿCr', fr('n!','r!(n − r)!')],
                       ['the terms','r counts from 0'], ['(1 + x)ⁿ, any n','|x| < 1']]),

  M38: () => matPairs([['sin² + cos²','1'], ['tan', fr('sin','cos')], ['1 + tan²','sec²'],
                       ['1 + cot²','cosec²'], ['sin(−x)','−sin x'], ['cos(−x)','cos x']]),

  /* FULL WIDTH — these are the longest values in the file and there is no shorter way to write an
     addition formula that is still the formula. */
  M39: () => matPairs([['sin(A ± B)','sinA cosB ± cosA sinB'],
                       ['cos(A ± B)','cosA cosB ∓ sinA sinB'], ['sin 2A','2 sinA cosA'],
                       ['cos 2A','1 − 2sin²A'], ['tan 2A', fr('2 tanA','1 − tan²A')],
                       ['a sinx + b cosx','R sin(x + α)']]),

  M40: () => matPairs([['180°','π radians'], ['arc','rθ'], ['sector','½r²θ'],
                       ['sin θ ≈','θ'], ['tan θ ≈','θ'], ['cos θ ≈', '1 − ' + fr('θ²','2')]]),

  M41: () => matPairs([['arithmetic nth','a + (n − 1)d'],
                       ['arithmetic sum','½n(2a + (n − 1)d)'], ['geometric nth','arⁿ⁻¹'],
                       ['geometric sum', fr('a(1 − rⁿ)','1 − r')], ['to infinity', fr('a','1 − r')],
                       ['it converges when','|r| < 1']]),

  M42: () => matPairs([['circle','(x − a)² + (y − b)² = r²'], ['centre','(a, b)'],
                       ['tangent','perpendicular to the radius'], ['semicircle','angle is 90°'],
                       ['midpoint','average the ends'], ['distance','√((x₂−x₁)² + (y₂−y₁)²)']]),

  M43: () => matPairs([['magnitude','√(x² + y²)'], ['unit vector','÷ its magnitude'],
                       ['i and j','across and up'], ['parallel','one is a multiple'],
                       ['position vector','from the origin']]),

  M44: () => matPairs([['v','u + at'], ['s','ut + ½at²'], ['v²','u² + 2as'],
                       ['s (average)','½(u + v)t'], ['F','ma'], ['weight','mg'],
                       ['friction','F ≤ μR'], ['g','9.8 m s⁻²']]),

  M45: () => matPairs([['when','fixed n, two outcomes'], ['X ~','B(n, p)'],
                       ['P(X = r)','ⁿCr pʳ (1 − p)ⁿ⁻ʳ'], ['mean','np'],
                       ['P(X ≤ r)','tables or calculator']]),

  M46: () => matPairs([['X ~','N(μ, σ²)'], ['standardise', 'Z = ' + fr('x − μ','σ')], ['Z ~','N(0, 1)'],
                       ['within 1σ','about 68%'], ['within 2σ','about 95%'],
                       ['inverse normal','from a probability']]),

  M47: () => matPairs([['H₀','the assumption'], ['H₁','what you suspect'],
                       ['one tail','5% at one end'], ['two tail','2.5% each end'],
                       ['reject H₀','p < the level'], ['then say it','in context']]),

  M48: () => matPairs([['sign change','a root lies between'],
                       ['Newton–Raphson', 'x − ' + fr('f(x)','f′(x)')],
                       ['trapezium','½h[(y₀ + yₙ) + 2(rest)]'], ['h', fr('b − a','n')],
                       ['iteration','xₙ₊₁ = g(xₙ)']]),

  M50: () => matPeriodic(),

  M51: () => matPh(),
  /* −10 TO 10, ONE TICK A WHOLE NUMBER, PLACED BY PERCENTAGE like M04 so the line is the same at any
     slot width. The minus is U+2212, the sign a printed paper uses — a hyphen is shorter and sits
     lower, and on a line about negative numbers it is the one character that has to look right. */
  M52: () => {
    let h = '<em class="l"></em><em class="r"></em>';
    for (let n = -10; n <= 10; n++) {
      const at = (n + 10) * 5;
      const z = n === 0 ? ' class="z"' : '';
      h += `<i${z} style="left:${at}%"></i><b${z} style="left:${at}%">${n < 0 ? '−' + (-n) : n}</b>`;
    }
    return `<div class="mat-neg">${h}</div>`;
  },
};

/* ---------- THE pH SCALE --------------------------------------------------------------------------
   ONE COLOUR PER WHOLE NUMBER, the universal indicator chart every textbook prints: red through
   orange and yellow to green at 7, then blue to purple. The colours are FILLS, and a browser drops
   fills when it prints unless told otherwise — so `.mat-ph` carries `print-color-adjust: exact`, as
   the flyer does. On a black-and-white printer the cells come out as greys and the numbers, words
   and the indicator table still say everything, which is why nothing here relies on the colour
   alone. The number is light on the dark ends and dark on the pale middle, so it reads on all
   fifteen. */
const MAT_PH = ['#d7191c', '#e8402b', '#f0672d', '#f68f2f', '#fbb72f', '#f7dc33', '#c9d936', '#5fb846',
                '#2f9e6b', '#1f8aa0', '#2168b0', '#2f4ea3', '#4a3a96', '#5e2c86', '#6d1f75'];
function matPh() {
  if (MAT_PH.length !== 15) return '<p class="mat-gone">The pH scale has a colour missing.</p>';
  const cells = MAT_PH.map((c, n) =>
    `<i style="background:${c};color:${n >= 3 && n <= 7 ? '#111' : '#fff'}">${n}</i>`).join('');
  /* THE THREE INDICATORS, as the words a mark scheme accepts. Litmus is the one that changes at 7;
     methyl orange changes in the acid half and phenolphthalein in the alkali half, which is why a
     titration uses one and not the other. */
  const ind = [['litmus', 'red', 'blue'], ['methyl orange', 'red', 'yellow'],
               ['phenolphthalein', 'colourless', 'pink']]
    .map(([n, a, b]) => `<i><b>${n}</b><em>${a}</em><em>${b}</em></i>`).join('');
  return `<div class="mat-ph">
    <div class="mat-ph-bar">${cells}</div>
    <div class="mat-ph-say"><span>&larr; acid</span><span>neutral 7</span><span>alkali &rarr;</span></div>
    <p class="mat-ph-note">strong acid 0&ndash;2 &middot; weak acid 3&ndash;6 &middot; weak alkali 8&ndash;11 &middot; strong alkali 12&ndash;14. One pH lower is 10&times; more H&#8314; ions.</p>
    <div class="mat-ph-ind"><i><b></b><em>in acid</em><em>in alkali</em></i>${ind}</div>
  </div>`;
}

/* ---------- THE PERIODIC TABLE, 118 OF THEM --------------------------------------------------------
   ONE STRING, SPLIT, rather than 118 quoted entries — a list that long is read by a person far more
   often than by this, and a missing comma in an array of strings shifts every element after it by
   one with nothing to say so. The length is checked where it is used: a table of 117 draws nothing
   rather than drawing oxygen in the fluorine box. */
const MAT_ELEMENTS = ('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu '
  + 'Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm '
  + 'Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np '
  + 'Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' ');

/* WHERE ELEMENT Z SITS: [row, column] of an 18-column table, with the lanthanides (57–71) and the
   actinides (89–103) in two rows of their own under a gap — the layout every exam board prints.
   Rows 1–7 are the periods, row 8 is the gap, rows 9 and 10 are the f-block. Worked out from the
   period lengths rather than typed as 118 pairs, for the reason the symbols are one string. */
function matPtAt(z) {
  if (z === 1) return [1, 1];
  if (z === 2) return [1, 18];
  const small = (start, row) => {           /* periods 2 and 3: two s-block, then six p-block */
    const k = z - start;
    return [row, k < 2 ? k + 1 : k + 11];
  };
  if (z <= 10) return small(3, 2);
  if (z <= 18) return small(11, 3);
  if (z <= 36) return [4, z - 18];
  if (z <= 54) return [5, z - 36];
  const heavy = (start, row, fRow, fFrom) => {  /* periods 6 and 7, with their f-block pulled out */
    if (z < start + 2) return [row, z - start + 1];
    if (z <= fFrom + 14) return [fRow, z - fFrom + 3];
    return [row, z - fFrom - 11];
  };
  if (z <= 86) return heavy(55, 6, 9, 57);
  return heavy(87, 7, 10, 89);
}

/* THE CELL IS A NUMBER AND A SYMBOL, which is what the question asked for and what fits: at 184mm
   an eighteenth of the width is about 10mm, room for "Og" in bold and "118" above it, and not for a
   name or a mass without shrinking both below what a student can read across a desk.
   A HAIRLINE ROUND EACH CELL, which the "269 rectangles" note would argue against — but that note is
   about numbers already standing in columns. A periodic table is read by its boxes: which group,
   which period, and where the block edges fall. Borders print; a fill would not.
   THE GROUP NUMBERS ARE THE UK EXAM ONES, 1–7 and 0, over the main groups only — the ones a GCSE
   question names. Numbering the transition metals too would be a second convention on one sheet. */
function matPeriodic() {
  if (MAT_ELEMENTS.length !== 118) return '<p class="mat-gone">The periodic table has a symbol missing.</p>';
  let h = '';
  [[1, '1'], [2, '2'], [13, '3'], [14, '4'], [15, '5'], [16, '6'], [17, '7'], [18, '0']]
    .forEach(([col, g]) => { h += `<s style="grid-area:1/${col}">${g}</s>`; });
  MAT_ELEMENTS.forEach((sym, n) => {
    const z = n + 1, [row, col] = matPtAt(z);
    h += `<i style="grid-area:${row + 1}/${col}"><em>${z}</em><b>${sym}</b></i>`;
  });
  /* WHERE THE f-BLOCK WAS TAKEN FROM, so the gap under barium reads as a reference rather than as a
     missing element. */
  h += '<u style="grid-area:7/3">57–71</u><u style="grid-area:8/3">89–103</u>';
  return `<div class="mat-pt">${h}</div>`;
}

const matGrid = (cls, n, cell) => {
  let h = '';
  for (let k = 1; k <= n; k++) h += cell(k);
  return `<div class="${cls}">${h}</div>`;
};
/* EVERY PAIRS BLOCK IS TIER-FILTERED HERE, once, rather than in each of the four that use it — so a
   row tagged 'H' anywhere disappears on Foundation without its block having to know about tiers. */
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
const fr = (top, bottom) =>
  `<span class="mat-fr"><span>${top}</span><span>${bottom}</span></span>`;


/* ---------- FOUR VENNS, ONE PICTURE EACH ---------------------------------------------------------
   THE SYMBOL IS THE THING BEING TAUGHT, so it is the caption and the words are underneath it — a
   student who can already say "in both" is looking this up to find out which of ∩ and ∪ means it.

   THE UNIVERSAL BOX IS DRAWN ON ALL FOUR, not only on the two that need it. It is part of how the
   diagram is set out in the paper, and a box that appears only when the answer involves it tells
   the student it is optional, which it is not.

   SHADED, NOT OUTLINED. The region is the answer, and an outlined region on a diagram already made
   of outlines is one more line to disentangle. */
const matVenn = (fill, sym, say) =>
  `<i><svg viewBox="0 0 96 56" xmlns="http://www.w3.org/2000/svg">
      <rect class="vs-box" x="3" y="3" width="90" height="50"/>
      ${fill}
      <circle class="vs-c" cx="38" cy="28" r="22"/>
      <circle class="vs-c" cx="58" cy="28" r="22"/>
      <text class="vs-l" x="20" y="14">A</text><text class="vs-l" x="72" y="14">B</text>
      <text class="vs-x" x="7" y="50">&#958;</text>
    </svg><b>${sym}</b><em>${say}</em></i>`;

/* THE LENS. Both arcs bulge the same way, so the path traces one circle down and the other back up
   — the two crossing points are where x = 48 and y = 28 &plusmn; &radic;(22&sup2; &minus; 10&sup2;). */
const VS_LENS = '<path class="vs-on" d="M48 8.4 A22 22 0 0 0 48 47.6 A22 22 0 0 0 48 8.4 Z"/>';

/* `own` IS FOR THE ONE FIGURE THAT NEEDS A DIFFERENT CIRCLE. Two tangents meet at a point outside
   the circle, and that point has to be inside the box — so that figure shrinks the circle and moves
   it up, and must not also get the standard one drawn underneath it. */
const matCirc = (inner, cap, own) =>
  `<i><svg viewBox="0 0 120 104" xmlns="http://www.w3.org/2000/svg">${
     own ? '' : '<circle cx="60" cy="52" r="40" class="rim"/>'}${inner}</svg><em>${cap}</em></i>`;

const matPairs = rows => `<div class="mat-two">${
  rows.filter(r => matKeep(r[2])).map(([a, b]) => `<i><b>${a}</b><em>${b}</em></i>`).join('')}</div>`;

/* ---------- THE DRAWN PIECES ---------------------------------------------------------------------
   A regular polygon from its own definition rather than eight hand-typed paths that disagree with
   their labels — which is exactly what happened the first time: a positional list drew "rectangle"
   as a pentagon, because a fifth entry met a five-sided drawing.
   THE SQUARE IS TURNED HALF A STEP. Every polygon starting with a vertex at the top gives a
   triangle pointing up, which is right, and a square on its corner, which reads as a diamond. */
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
function matPoly(n) {
  const off = n === 4 ? Math.PI / n : 0;
  const raw = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + off + 2 * Math.PI * k / n;
    raw.push([Math.cos(a), Math.sin(a)]);
  }
  const xs = raw.map(p => p[0]), ys = raw.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  /* THE LARGER DIMENSION DECIDES, so a tall shape and a wide one both fit and neither is cropped. */
  const k = 32 / Math.max(w, h);
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const pts = raw.map(([x, y]) =>
    (20 + (x - midX) * k).toFixed(1) + ',' + (20 + (y - midY) * k).toFixed(1));
  return `<svg viewBox="0 0 40 40"><polygon points="${pts.join(' ')}" fill="none"
    stroke="currentColor" stroke-width="1.4"/></svg>`;
}

/* A HALF CIRCLE AT TRUE SIZE — which is the whole advantage of paper over a screen. A screen does
   not know how big it is and would need calibrating against a bank card; a printed millimetre is a
   millimetre. Both scales, inner and outer, running opposite ways, because that is what a plastic
   protractor does and the thing every child gets wrong. */
function matProtractor() {
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
  const R = 41, cx = R + 4, cy = R + 4;
  const INK = '#14140f', MID = '#8d8878', FAINT = '#b4ae9c', RED = '#9b2d22';
  const at = (r, t) => [(cx + r * Math.cos(t)).toFixed(2), (cy - r * Math.sin(t)).toFixed(2)];

  let p = `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none"
    stroke="${MID}" stroke-width=".4"/>`;

  for (let a = 0; a <= 180; a++) {
    const t = Math.PI * (180 - a) / 180;
    const ten = a % 10 === 0, five = a % 5 === 0;
    const [x1, y1] = at(ten ? R - 6.5 : (five ? R - 4.5 : R - 2.4), t);
    const [x2, y2] = at(R, t);
    p += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${ten ? INK : (five ? MID : FAINT)}" stroke-width="${ten ? .45 : (five ? .3 : .18)}"/>`;

    if (!ten) continue;
    /* ROTATED WITH THE RADIUS. `a - 90` is upright at the top and a quarter turn at either end,
       which is exactly how the two scales stop overlapping down there. */
    const turn = a - 90;
    const [ox, oy] = at(R - 10.5, t);
    const [ix, iy] = at(R - 16, t);
    p += `<text x="${ox}" y="${oy}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.9" fill="${INK}" transform="rotate(${turn} ${ox} ${oy})">${a}</text>`;
    p += `<text x="${ix}" y="${iy}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.9" fill="${RED}" transform="rotate(${turn} ${ix} ${iy})">${180 - a}</text>`;
  }

  /* THE BASELINE, AND THE CROSS YOU LINE UP WITH THE VERTEX. The cross is the one part of a
     protractor that is used rather than read, so it stays the strongest mark on it. */
  p += `<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="${INK}" stroke-width=".5"/>
    <line x1="${cx - 5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" stroke="${RED}" stroke-width=".6"/>
    <line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy + 5}" stroke="${RED}" stroke-width=".6"/>
    <circle cx="${cx}" cy="${cy}" r="1.1" fill="none" stroke="${RED}" stroke-width=".4"/>`;

  return `<div class="mat-prot"><svg viewBox="0 0 ${2 * (R + 4)} ${R + 8}">${p}</svg></div>`;
}

function matAngles() {
  const kinds = [['acute', 45, 'less than 90'], ['right', 90, 'exactly 90'],
                 ['obtuse', 130, '90 to 180'], ['straight', 180, 'exactly 180'],
                 ['reflex', 250, 'more than 180']];
  return `<div class="mat-ang">${kinds.map(([name, deg, note]) => {
    const t = Math.PI * deg / 180;
    const x = 20 + 15 * Math.cos(t), y = 22 - 15 * Math.sin(t);
    const arc = deg === 180 ? '' :
      `<path d="M 27 22 A 7 7 0 ${deg > 180 ? 1 : 0} 0
        ${(20 + 7 * Math.cos(t)).toFixed(1)} ${(22 - 7 * Math.sin(t)).toFixed(1)}"
        fill="none" stroke="#9b2d22" stroke-width=".7"/>`;
    return `<div><svg viewBox="0 0 40 30">
      <line x1="20" y1="22" x2="36" y2="22" stroke="currentColor" stroke-width="1.4"/>
      <line x1="20" y1="22" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"
        stroke="currentColor" stroke-width="1.4"/>${arc}</svg>
      <span>${name}</span><em>${note}</em></div>`;
  }).join('')}</div>`;
}

/* ---------- THE TRICK, WHICH BEATS THE TABLE -----------------------------------------------------
   EVERY EXACT VALUE IS √n OVER 2, and n counts 0 1 2 3 4 across for sine and backwards for cosine.
   One pattern replacing ten values — and it survives an exam in a way a memorised table does not,
   because a pattern can be rebuilt from nothing on the back of the paper.

   THE ROOT IS DRAWN, NOT TYPED. A √ character sits beside the numbers at whatever size the font
   makes it and its bar covers only the first one, so it reads as the root of that number rather
   than of the row — which is the one thing the trick depends on saying. */
function matTrick() {
  const angs = ['0°','30°','45°','60°','90°'];
  const row = (label, ns, simp) =>
    `<div class="mat-tk-row"><b>${label}</b><div class="mat-tk-surd"><span class="mat-tk-rad"></span>
       <div class="mat-tk-nums">${ns.map(n => `<i>${n}</i>`).join('')}</div></div></div>
     <div class="mat-tk-simp"><b></b><div class="mat-tk-nums">${
       simp.map(v => `<u>${v}</u>`).join('')}</div></div>`;
  return `<div class="mat-tk">
    <div class="mat-tk-row"><b></b><div class="mat-tk-surd"><span class="mat-tk-rad"></span>
      <div class="mat-tk-nums">${angs.map(a => `<em>${a}</em>`).join('')}</div></div></div>
    ${row('sin', ['0','1','2','3','4'], ['0','½','√2/2','√3/2','1'])}
    ${row('cos', ['4','3','2','1','0'], ['1','√3/2','√2/2','½','0'])}
    <p class="mat-tk-say">Every one is <b>√n over 2</b>. Count up for sine, down for cosine.
      tan = sin ÷ cos.</p></div>`;
}

/* FIVE CURVES, DRAWN — the shape is what is being recognised, and a name without a picture is the
   half of it nobody can use.
   EACH SVG NEEDS A WIDTH. Without one they filled the column and the block came out 744mm tall,
   nearly three sheets from one component: an SVG with no width is not a small picture, it is as
   large as you let it be. The grid gives them their width. */
function matGraphs() {
  const W = 44, H = 34;
  /* ---------- A BREAK IN A CURVE IS PART OF THE CURVE -----------------------------------------------
     THE RECIPROCAL WAS DRAWN AS ONE UNBROKEN LINE and that is not what 1/x looks like — it is the
     one thing about 1/x. Points either side of the asymptote were skipped, correctly, and then
     joined to each other by a single `<polyline>`, which drew a stroke straight across the gap that
     had just been made. On the sheet it came out as a wave crossing the y-axis: a graph of a
     function that is defined at zero, printed under the label `y = 1/x`.

     SO A SKIPPED POINT ENDS THE LINE and the next one starts a new one. Every other graph here is
     continuous and comes back as a single piece, so nothing else changes. */
  const curve = f => {
    const runs = [];
    let run = [];
    for (let k = 0; k <= 40; k++) {
      const x = -1.6 + 3.2 * k / 40;
      const y = f(x);
      if (!isFinite(y) || Math.abs(y) > 3) {
        if (run.length > 1) runs.push(run);
        run = [];
        continue;
      }
      run.push((W / 2 + x * W / 3.6).toFixed(1) + ',' + (H / 2 - y * H / 7).toFixed(1));
    }
    if (run.length > 1) runs.push(run);
    return runs;
  };
  /* FOUNDATION RECOGNISES LINEAR AND QUADRATIC. Cubic, reciprocal and exponential are Higher, and
     the tier is the fourth entry rather than the third because the third is the function. */
  const kinds = [['linear','y = x', x => x], ['quadratic','y = x²', x => x * x],
                 ['cubic','y = x³', x => x ** 3, 'H'],
                 /* NO CLAMP. Returning 9 near zero was a way of forcing a skip under the old
                    single-line drawing; now the skip is real, `1/x` can be handed over as itself
                    and the |y| > 3 test does the cutting. */
                 ['reciprocal','y = 1/x', x => 1 / x, 'H'],
                 ['exponential','y = 2ˣ', x => Math.pow(2, x) - 1, 'H']];
  return `<div class="mat-graphs">${kinds.filter(k => matKeep(k[3])).map(([n, eq, f]) =>
    `<div><svg viewBox="0 0 ${W} ${H}">
      ${/* AXES IN THE SHEET'S GREY. They were a shade of their own — one more colour in a document
            that had just been reduced to three. An axis is scaffolding: it has to be there and it
            must not compete with the curve, which is the thing being looked at. */''}
      <line x1="0" y1="${H/2}" x2="${W}" y2="${H/2}" stroke="#b4ae9c" stroke-width=".4"/>
      <line x1="${W/2}" y1="0" x2="${W/2}" y2="${H}" stroke="#b4ae9c" stroke-width=".4"/>
      ${curve(f).map(pts =>
        `<polyline points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.2"/>`
      ).join('')}
    </svg><span>${n}</span><em>${eq}</em></div>`).join('')}</div>`;
}

/* THE RULER DOWN THE LEFT EDGE, in real millimetres because this is printed. At the edge because
   that is where a ruler is used — you lay the paper against the thing you are measuring, and one in
   the middle of a sheet cannot reach anything. */
function matRuler(mmHigh) {
  let h = '';
  for (let mm = 0; mm <= mmHigh; mm++) {
    /* THE LENGTH IS A CLASS, NOT A NUMBER TYPED HERE. Written inline, the three tick widths could
       not be adjusted from the stylesheet — an inline style beats every rule in the file, so the
       ruler was the one component whose weight could only be changed in JavaScript. A centimetre,
       a half, and a millimetre are three kinds of mark; naming them is what lets the sheet decide
       how loud each one is. */
    const long = mm % 10 === 0, mid = mm % 5 === 0;
    h += `<i class="${long ? 'cm' : (mid ? 'mid' : '')}" style="top:${mm}mm"></i>`;
    if (long && mm > 0) h += `<b style="top:${mm}mm">${mm / 10}</b>`;
  }
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
  h += '<s class="mat-rule-say">100% scale<br>no fit to page</s>';
  return h;
}

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
const MAT_PARTS_EN = [
  { id: 'E02', subject: 'English', name: 'Alphabet — print and cursive', face: 'Aa Bb alphabet',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 22, half: false, inExam: false },
  { id: 'E03', subject: 'English', name: 'Word classes', face: 'noun · verb',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 46, half: true, inExam: false },
  { id: 'E04', subject: 'English', name: 'Sentence types', face: 'sentences',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 40, half: true, inExam: false },
  { id: 'E05', subject: 'English', name: 'Punctuation and what it does', face: '. , ; : marks',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 52, half: true, inExam: false },
  { id: 'E06', subject: 'English', name: 'Apostrophes', face: '’s apostrophes',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 30, half: true, inExam: false },
  { id: 'E07', subject: 'English', name: 'Homophones', face: 'their · there',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 40, half: true, inExam: false },
  { id: 'E08', subject: 'English', name: 'Spelling rules', face: 'i before e',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 44, half: true, inExam: false },
  { id: 'E09', subject: 'English', name: 'PEE / PETAL paragraph', face: 'PEE · PETAL',
    lv: ['11+', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 48, half: true, inExam: false },
  { id: 'E10', subject: 'English', name: 'What to say about a quotation', face: '“…” quotes',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 46, half: true, inExam: false },
  { id: 'E11', subject: 'English', name: 'AFOREST', face: 'AFOREST',
    lv: ['11+', 'Y9 Mocks', 'GCSE'], h: 46, half: true, inExam: false },
  { id: 'E12', subject: 'English', name: 'Ethos, pathos, logos', face: 'ethos · pathos',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 26, half: true, inExam: false },
  { id: 'E13', subject: 'English', name: 'Connectives by job', face: 'however · so',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 44, half: true, inExam: false },
  { id: 'E14', subject: 'English', name: 'Sentence openers', face: 'openers',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 32, half: true, inExam: false },
  { id: 'E15', subject: 'English', name: 'Devices worth naming', face: 'simile · etc.',
    lv: ['11+', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 56, half: true, inExam: false },
  { id: 'E16', subject: 'English', name: 'Structure methods', face: '↻ structure',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 40, half: true, inExam: false },
  { id: 'E17', subject: 'English', name: "Instead of 'said', 'good', 'bad'", face: 'said → muttered',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 34, half: true, inExam: false },
  { id: 'E18', subject: 'English', name: 'Letter, article, speech', face: 'Dear… forms',
    lv: ['Y9 Mocks', 'GCSE', 'B-TEC'], h: 42, half: true, inExam: false },
  { id: 'E19', subject: 'English', name: 'Reading question stems', face: '“How does…”',
    lv: ['Y9 Mocks', 'GCSE', 'B-TEC'], h: 36, half: true, inExam: false },
  { id: 'E20', subject: 'English', name: 'Poetry: form and sound', face: 'enjambment',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 40, half: true, inExam: false },
  { id: 'E21', subject: 'English', name: 'Tiers of vocabulary', face: 'tier 1 2 3 words',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 28, half: true, inExam: false },
  { id: 'E22', subject: 'English', name: 'Proofreading checklist', face: '✓ proofread',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 26, half: true, inExam: false },
];

/* ---------- THE ENGLISH DRAWINGS -------------------------------------------------------------------
   MOSTLY `matPairs`, the label-and-value block thirty-four of the maths pieces already are — a
   term and what it does is exactly that shape, and a second layout for it would be a second thing
   for the stylesheet to keep right. Two are not: the alphabet is a row of letters and the word bank
   is three short columns, and each borrows the nearest block the maths already has.

   WRITTEN TO BE SHORT, because the note over the secondary maths set is true here too: at a third of
   the page a value much past twenty characters wraps, and a wrapped row costs three times its
   height. Where a line could not be said shorter, it is the example that goes, not the rule. */
const MAT_ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAT_HTML_EN = {
  /* PRINT OVER JOINED, LETTER BY LETTER. "Both hands" in the sheet's note means both handwriting
     styles, and a child copying a letter wants the two shapes of it one above the other rather than
     two alphabets a line apart. The joined row is set in whatever script face the printer has —
     `cursive` is the last word in that list for a reason — so it is a model rather than a font. */
  E02: () => `<div class="mat-abc">${MAT_ABC.map(l =>
    `<i><b>${l}${l.toLowerCase()}</b><em>${l}${l.toLowerCase()}</em></i>`).join('')}</div>`,
  E03: () => matPairs([['noun', 'dog, London, joy'], ['verb', 'run, is, think'],
                       ['adjective', 'tall, red'], ['adverb', 'quickly, soon'],
                       ['pronoun', 'she, it, they'], ['preposition', 'under, after'],
                       ['conjunction', 'and, because'], ['determiner', 'the, a, some']]),
  E04: () => matPairs([['simple', 'one main clause'],
                       ['compound', 'two main clauses: and, but, or, so'],
                       ['complex', 'main + subordinate: because, although, when, if'],
                       ['minor', 'not a full sentence: “Nice one.”']]),
  E05: () => matPairs([['.', 'ends a sentence'], [',', 'splits a list or a clause'],
                       ['?', 'ends a question'], ['!', 'surprise or force'],
                       ['’', 'a missing letter, or belonging'], ['“ ”', 'the words spoken'],
                       [':', 'brings in a list or a reason'], [';', 'joins two linked sentences'],
                       ['( )', 'extra information'], ['–', 'a pause, or an aside']]),
  /* ITS AND IT'S GET A ROW EACH, because that is the line the sheet's note says catches everybody —
     and it catches them precisely because every other belonging word takes the apostrophe. */
  E06: () => matPairs([['missing letters', 'do not → don’t'], ['one owner', 'the dog’s bone'],
                       ['more than one', 'the dogs’ bones'], ['no s plural', 'the children’s'],
                       ['its', 'belonging: its tail'], ['it’s', 'it is, or it has']]),
  E07: () => matPairs([['their', 'belongs to them'], ['there', 'a place'], ['they’re', 'they are'],
                       ['your', 'belongs to you'], ['you’re', 'you are'],
                       ['to · too · two', 'towards · also · 2'], ['of · off', 'belonging · not on'],
                       ['were · we’re · where', 'was, plural · we are · a place']]),
  E08: () => matPairs([['most plurals', '+ s: cats'], ['s x ch sh', '+ es: boxes'],
                       ['consonant + y', 'y → ies: babies'], ['f, fe', 'often ves: leaves'],
                       ['short vowel', 'double it: hop → hopping'],
                       ['silent e', 'drop it: make → making'],
                       ['i before e', 'except after c: receive'],
                       ['and where it fails', 'weird, seize, science']]),
  /* THE STEMS ARE THE POINT, which is what the note asks for: a student who knows the letters stand
     for Point, Evidence and Explain still sits in front of a blank line not knowing how to start one.
     PEE is the first three of PETAL, so it is one block rather than two, and the last row says how
     they fold into each other. */
  E09: () => matPairs([['Point', 'The writer presents…'], ['Evidence', 'This is shown when “…”'],
                       ['Technique', 'The writer uses…'], ['Analysis', 'The word “…” suggests…'],
                       ['Link', 'This links to… / So…'],
                       ['PEE', 'Point, Evidence, Explain = T + A']]),
  E10: () => matPairs([['zoom in', 'The word “…” suggests…'], ['name it', 'a metaphor, a verb…'],
                       ['the effect', 'It makes the reader feel…'],
                       ['link it out', 'This fits the wider idea that…']]),
  E11: () => matPairs([['A', 'alliteration'], ['F', 'facts'], ['O', 'opinions'],
                       ['R', 'rhetorical questions'], ['E', 'emotive language'],
                       ['S', 'statistics'], ['T', 'triples — the rule of three']]),
  /* THE TEST IS A QUESTION TO ASK OF THE TEXT, which is what the note means by a one-line test: the
     names are easy to learn and hard to spot, and each of these is the thing to ask to spot one. */
  E12: () => matPairs([['ethos', 'trust: why believe the speaker?'],
                       ['pathos', 'feeling: does it move you?'],
                       ['logos', 'logic: reasons and evidence?']]),
  E13: () => matPairs([['adding', 'and, also, furthermore'], ['contrasting', 'but, however, whereas'],
                       ['causing', 'because, so, therefore'], ['sequencing', 'first, then, finally'],
                       ['concluding', 'overall, in conclusion']]),
  E14: () => matPairs([['adverb', 'Slowly, …'], ['-ing', 'Running to the door, …'],
                       ['simile', 'Like a ghost, …'], ['preposition', 'Under the bridge, …'],
                       ['subordinate', 'Although it was late, …']]),
  E15: () => matPairs([['simile', 'like or as'], ['metaphor', 'says it IS something else'],
                       ['personification', 'a thing acting human'], ['alliteration', 'same first sound'],
                       ['onomatopoeia', 'sounds like it means: buzz'], ['hyperbole', 'deliberate exaggeration'],
                       ['imagery', 'a picture in words'], ['juxtaposition', 'opposites side by side'],
                       ['pathetic fallacy', 'weather matches mood'], ['semantic field', 'a group of linked words']]),
  E16: () => matPairs([['opening', 'how it hooks you'], ['shift', 'focus moves: out → in, past → now'],
                       ['cyclical', 'ends where it began'], ['foreshadowing', 'a hint of what comes'],
                       ['zoom', 'narrows to a detail, or widens'], ['flashback', 'a jump back in time']]),
  /* THREE SHORT COLUMNS, as the note says — which is the measures block's shape with a third column,
     so it borrows `.mat-meas` rather than starting a fourth kind of list. */
  E17: () => `<div class="mat-meas mat-three">${[
      ['said', ['whispered', 'shouted', 'muttered', 'replied', 'gasped', 'insisted']],
      ['good', ['brilliant', 'kind', 'excellent', 'skilful', 'delightful', 'generous']],
      ['bad', ['awful', 'cruel', 'dreadful', 'harmful', 'rotten', 'terrible']]]
    .map(([k, vs]) => `<div><em>${k}</em>${vs.map(v => `<i>${v}</i>`).join('')}</div>`).join('')}</div>`,
  E18: () => matPairs([['letter', 'Dear… → Yours sincerely (a name), faithfully (Sir, Madam)'],
                       ['article', 'headline, strapline, subheadings'],
                       ['speech', 'greet them, say “you”, end with what to do']]),
  E19: () => matPairs([['list four', 'short facts, from the lines given'],
                       ['how… language', 'words, methods, effect'],
                       ['how… structured', 'start, shifts, ending'],
                       ['to what extent', 'judge it, with quotations'],
                       ['summarise', 'the differences, inferred'],
                       ['compare', 'both texts, views and methods']]),
  E20: () => matPairs([['stanza', 'a verse: a group of lines'], ['metre', 'the beat: iambic is da-DUM'],
                       ['rhyme scheme', 'ABAB, AABB…'], ['enjambment', 'a sentence runs over the line'],
                       ['caesura', 'a pause inside a line'], ['volta', 'the turn in the thought'],
                       ['writing it', 'name it, quote it, say what it does']]),
  E21: () => matPairs([['tier 1', 'everyday: happy, walk — talk'],
                       ['tier 2', 'academic: analyse, significant — any essay'],
                       ['tier 3', 'subject: metaphor, sonnet — naming it']]),
  E22: () => matPairs([['1', 'capitals and full stops'], ['2', 'spellings from the question'],
                       ['3', 'a new paragraph for each new point, time or speaker'],
                       ['4', 'its / it’s, their / there'],
                       ['5', 'read it back: does each sentence make sense?']]),
};
Object.assign(MAT_HTML, MAT_HTML_EN);

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
const matSubjectOf = c => (!c || c.edge) ? '' : String(c.subject || 'Maths');

/* WHAT IS CHOSEN. Maths until somebody says otherwise, because the maths is most of the library and
   what this tool was built as; `all` is "every subject" and mixes them on one sheet. */
let MAT_SUBJECT = 'Maths';

/* THE SUBJECTS THAT HAVE PIECES, and no others — a subject with nothing under it is an option that
   empties the list, which is a dead control wearing a name. THE ONE WITH THE MOST PIECES FIRST,
   because it is the one most sheets are made of, and ties alphabetically so the order never depends
   on how the file happens to be sorted.
   NOT THE SITE'S OWN SUBJECT LIST, which the first version sorted by. That list is what somebody can
   be BOOKED for — "English Language", "(Single) Chemistry" — and not one of its names is a subject
   a cheat sheet piece carries, so every subject here fell through to the alphabet and English came
   out above Maths on a tool that is fifty maths pieces to twenty-one English. */
function matSubjectOrder(list) {
  const n = {};
  (list || []).forEach(c => { const s = matSubjectOf(c); if (s) n[s] = (n[s] || 0) + 1; });
  return Object.keys(n).sort((a, b) => n[b] - n[a] || a.localeCompare(b));
}
const matSubjects = parts => matSubjectOrder(parts || matParts());

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
const MAT_GROUPS = [
  ['Number',               ['M02', 'M03', 'M04', 'M05', 'M10', 'M52', 'M28']],
  ['Fractions & %',        ['M11', 'M31', 'M22', 'M12G', 'M12H', 'M23', 'M24']],
  ['Algebra',              ['M25', 'M26', 'M15', 'M37', 'M41', 'M36']],
  ['Graphs & rates',       ['M17', 'M16', 'M42', 'M12F']],
  ['Geometry',             ['M07', 'M08', 'M09', 'M20', 'M30']],
  ['Area & volume',        ['M21', 'M06', 'M12A', 'M12B', 'M12C', 'M12D', 'M12E']],
  ['Trigonometry',         ['M19', 'M13', 'M14', 'M29', 'M38', 'M39', 'M40']],
  ['Data & chance',        ['M18', 'M27', 'M49', 'M45', 'M46', 'M47']],
  ['Calculus',             ['M32', 'M33', 'M34', 'M35', 'M48', 'M43', 'M44']],
  ['Spelling',             ['E02', 'E07', 'E08', 'E21']],
  ['Grammar',              ['E03', 'E04', 'E05', 'E06']],
  ['Writing',              ['E11', 'E12', 'E13', 'E14', 'E17', 'E18', 'E22']],
  ['Reading',              ['E09', 'E10', 'E15', 'E16', 'E19', 'E20']],
  ['Chemistry',            ['M50', 'M51']],
];
const MAT_GROUP_OTHER = 'Other';
const MAT_GROUP_BY = {};
MAT_GROUPS.forEach(([g, ids]) => ids.forEach(id => { MAT_GROUP_BY[id] = g; }));
/* THE RULER IS IN EVERY GROUP, for the reason it is in every subject: it goes down the edge of any
   sheet, so it is offered wherever you are rather than filed under one topic you might never open. */
const matGroupOf = c => (!c || c.edge) ? '' : (MAT_GROUP_BY[c.id] || MAT_GROUP_OTHER);
/* WHICH GROUP IS ON THE SCREEN. Empty until settled, and `matSettle` puts it on the first group the
   subject and level have pieces in — a group that has emptied (Calculus at SATs) is not left showing. */
let MAT_GROUP = '';
const matInGroup = c => { const g = matGroupOf(c); return !g || g === MAT_GROUP; };
/* THE GROUPS THIS SUBJECT AND LEVEL HAVE PIECES IN, in the table's order — asked of `matShown`, so a
   group appears exactly when the paper could carry something from it. */
function matGroupChoices(parts) {
  const has = {};
  (parts || matParts()).forEach(c => { const g = matGroupOf(c); if (g && matShown(c)) has[g] = true; });
  return MAT_GROUPS.map(x => x[0]).concat(MAT_GROUP_OTHER).filter(g => has[g]);
}

/* ---------- AND WHERE IT OPENS FOR A STUDENT -----------------------------------------------------------
   "OPEN ON THE STUDENT'S OWN LEVEL WHEN KNOWN" — the audit's default, taken. Nothing on a person's row
   says their level, so it is read off the sessions they are booked into as the client, newest first:
   a student in a GCSE Maths group gets the GCSE Maths sheet. `USER.level` is asked first in case the
   login reply ever carries one. A tutor's own sessions are not theirs to study, so only `client`
   counts. Anything that does not name a level this tool has falls through to Every level, which is
   what it opened on before — so a visitor nobody knows anything about sees no change at all. */
function matOwnLevel_(parts) {
  if (typeof USER === 'undefined' || !USER) return null;
  const known = matLevelChoices(parts).map(o => o.v.split('|')[0]);
  const fit = l => known.find(k => norm(k) === norm(l)) || '';
  const own = fit(USER.level || (USER.profile || {}).level || '');
  if (own) return { level: own, subject: '' };
  let jobs = [];
  try { jobs = (DATA.liveJobs || DATA.jobs || []).filter(j => j && norm(j.client) === norm(USER.name)); }
  catch (e) { jobs = []; }
  jobs.sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')));
  const subs = matSubjects(parts);
  for (const j of jobs) {
    const level = fit(j.level);
    if (!level) continue;
    /* "English Language", "(Single) Chemistry" — the bookable names — carry this tool's subject as a
       word inside them, or carry nothing it knows. */
    const subject = subs.find(s => norm(j.subject).indexOf(norm(s)) !== -1) || '';
    return { level, subject };
  }
  return null;
}

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
const MAT_TIERED_SUBJECTS = ['Maths'];
const matTierSplits = l => MAT_TIERED.indexOf(l) !== -1
  && (MAT_SUBJECT === 'all' || MAT_TIERED_SUBJECTS.indexOf(MAT_SUBJECT) !== -1);
const matLevelValue = () => MAT_LEVEL === 'all' ? 'all'
  : (matTierSplits(MAT_LEVEL) ? MAT_LEVEL + '|' + MAT_TIER : MAT_LEVEL);

function matLevelChoices(parts) {
  const used = {};
  (parts || matParts()).forEach(c => {
    if (c.edge) return;
    if (MAT_SUBJECT !== 'all' && matSubjectOf(c) !== MAT_SUBJECT) return;
    c.lv.forEach(l => { used[l] = true; });
  });
  const known = matLevels();
  const levels = known.filter(l => used[l])
    .concat(Object.keys(used).filter(l => known.indexOf(l) === -1));
  const out = [{ v: 'all', say: 'Every level' }];
  levels.forEach(l => {
    if (matTierSplits(l)) out.push({ v: l + '|F', say: l + ' Foundation' }, { v: l + '|H', say: l + ' Higher' });
    else out.push({ v: l, say: l });
  });
  return out;
}

/* ---------- WHAT IS ON THE SHEET IS WHAT IS SHOWN, TICKED ---------------------------------------------
   ONE TEST FOR THE LIST AND THE PAPER, so the two cannot disagree. It was two: the level and the tier
   decided what printed, and the "given" filter hid rows from the list while leaving them on the
   paper — its note said so, and meant it kindly ("narrowing the view must not quietly drop the
   given blocks off a sheet that was already built"). What it produced was a sheet carrying pieces
   the screen was not showing, which is the one thing a picker must not do.

   HIDDEN IS STILL NOT UNTICKED. Every tick is kept, so looking at another subject or level and
   coming back finds the sheet as it was; what changed is only that a piece prints when you can see
   it ticked, and not otherwise. */
function matShown(c, ignoreExam) {
  if (!c) return false;
  const s = matSubjectOf(c);
  if (s && MAT_SUBJECT !== 'all' && s !== MAT_SUBJECT) return false;
  /* NO LEVEL MEANS EVERY LEVEL — the ruler's `lv` is empty, and reading that as "belongs to nothing"
     would hide it at every level. */
  if (MAT_LEVEL !== 'all' && c.lv.length && c.lv.indexOf(MAT_LEVEL) === -1) return false;
  if (!matKeep(c.tier)) return false;
  if (!ignoreExam && MAT_EXAM === 'not' && c.inExam === true) return false;
  return true;
}

/* THE CHOICES, PUT RIGHT BEFORE ANYTHING IS DRAWN. A subject that has lost its pieces, a level the
   new subject does not have, a tier split that no longer applies — each falls back to the widest
   answer rather than leaving a select showing a value it does not contain. `MAT_SHOW` is set here
   because every block reads it through `matKeep` while it is being drawn. */
function matSettle(parts) {
  const subs = matSubjects(parts);
  if (MAT_SUBJECT !== 'all' && subs.indexOf(MAT_SUBJECT) === -1) MAT_SUBJECT = subs[0] || 'all';
  if (matLevelChoices(parts).map(o => o.v).indexOf(matLevelValue()) === -1) MAT_LEVEL = 'all';
  MAT_SHOW = (MAT_LEVEL !== 'all' && matTierSplits(MAT_LEVEL)) ? MAT_TIER : 'H';
  /* THE GROUP LAST, because which groups have pieces is a question about the subject, the level
     and the tier just settled — and it reads `matShown`, which reads `MAT_SHOW`. */
  const groups = matGroupChoices(parts);
  if (groups.indexOf(MAT_GROUP) === -1) MAT_GROUP = groups[0] || '';
}

/* THE OPTIONS ARE WRITTEN ONLY WHEN THEY CHANGE. `matPaint` runs on every tick — and this is called from inside the select's own `change`
   handler. Rewriting a select's options while its own picker may still be up is asking a phone's
   native wheel to survive having its contents replaced under it, and nothing here needs that: the
   subject list only changes when the pieces do, and the level list when the subject does. */
/* A WeakMap rather than an attribute, so the markup does not carry a copy of itself, and so a select
   `initMat` has just rebuilt starts with nothing remembered and is always written. */
const MAT_OPTS = new WeakMap();
const matOptions_ = (sel, html) => {
  if (MAT_OPTS.get(sel) === html) return;
  sel.innerHTML = html;
  MAT_OPTS.set(sel, html);
};
/* THE TWO SELECTS AND THE ONE BOX, drawn from the same state every time rather than patched by the
   handler that changed them — a control that says one thing while the list says another is the
   invisible mode this repository records against the paused reel. */
function matChoices(parts) {
  const sub = $('mat-subject'), lev = $('mat-level'), given = $('mat-given');
  const subs = matSubjects(parts);
  if (sub) {
    matOptions_(sub, subs.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')
      + '<option value="all">Every subject</option>');
    sub.value = MAT_SUBJECT;
    /* ONE SUBJECT IS NO CHOICE, so there is nothing to draw — the sheet's tab can switch every
       English row off, and a select with one real answer is a control that does nothing. */
    (sub.closest('.mat-sel') || sub).hidden = subs.length < 2;
  }
  if (lev) {
    matOptions_(lev, matLevelChoices(parts)
      .map(o => `<option value="${esc(o.v)}">${esc(o.say)}</option>`).join(''));
    lev.value = matLevelValue();
  }
  /* THE GROUP, WITH WHAT IS TICKED IN EACH ON ITS OWN OPTION. Ticks are kept across groups — the
     sheet is everything ticked at this subject and level, whichever group is on the screen — so a
     group you are not looking at can hold half the sheet, and the only place left to say so without
     a row of its own is the option label: "Algebra · 3✓". A tick and not the word "ticked": at 320
     the select shows eighteen characters at 16px, and "Trigonometry · 2 t…" was what the word left. Counted through `matShown`, the same
     test the paper uses, so the counts add up to the gauge's piece count and never to more. */
  const grp = $('mat-group');
  if (grp) {
    const groups = matGroupChoices(parts);
    const ticked = g => parts.filter(c => !c.edge && matGroupOf(c) === g && matShown(c)
      && MAT_ON.indexOf(c.id) !== -1).length;
    matOptions_(grp, groups.map(g => {
      const n = ticked(g);
      return `<option value="${esc(g)}">${esc(g + (n ? ' · ' + n + '✓' : ''))}</option>`;
    }).join(''));
    grp.value = MAT_GROUP;
    /* ONE GROUP IS NO CHOICE — the subject select's own rule. Science is two pieces in one group. */
    (grp.closest('.mat-sel') || grp).hidden = groups.length < 2;
  }
  /* "GIVEN IN THE EXAM" ONLY WHERE SOMETHING IS. It was a row of three pills — All, Not given,
     Given — shown on every level, SATs included, where nothing on the list is marked given and the
     middle pill hid the lot. It is one box now, offered only when a piece on this list is one the
     exam prints for you, and it says what it does rather than naming a category somebody has to
     decode. "Given" alone was a word that needed explaining; the box is the explanation. */
  if (given) {
    given.hidden = !parts.some(c => c.inExam === true && matShown(c, true));
    const box = given.querySelector('input');
    if (box) box.checked = MAT_EXAM === 'not';
  }
}

/* ---------- WHERE YOU LEFT IT --------------------------------------------------------------------------
   A TUTOR PRINTS THE SAME SHEET MOST WEEKS. Opening the tool on "Every subject, every level" with
   nothing ticked every time is five choices and a dozen ticks to get back to the page printed last
   Tuesday — so the subject, the level, the box and the ticks are kept on this device and come back
   when the tool opens. A per-viewer convenience, which is what `localStorage` is for here; wrapped,
   because it can be blocked or full, and the tool must open either way. */
const MAT_KEEP_AT = 'matChoice';
function matRemember() {
  try {
    localStorage.setItem(MAT_KEEP_AT, JSON.stringify({
      s: MAT_SUBJECT, l: MAT_LEVEL, t: MAT_TIER, x: MAT_EXAM, g: MAT_GROUP, on: MAT_ON }));
  } catch (e) { /* a phone that will not store it simply opens fresh next time */ }
}
function matRecall() {
  try {
    const v = JSON.parse(localStorage.getItem(MAT_KEEP_AT) || 'null');
    if (!v || typeof v !== 'object') return false;
    if (typeof v.s === 'string') MAT_SUBJECT = v.s;
    if (typeof v.l === 'string') MAT_LEVEL = v.l;
    if (v.t === 'F' || v.t === 'H') MAT_TIER = v.t;
    MAT_EXAM = v.x === 'not' ? 'not' : 'all';
    /* A GROUP FROM BEFORE GROUPS EXISTED IS NO GROUP, and `matSettle` picks the first. */
    if (typeof v.g === 'string') MAT_GROUP = v.g;
    if (Array.isArray(v.on)) MAT_ON = v.on.map(String);
    return true;
  } catch (e) { return false; }
}

/* ---------- THERE IS NO FILL AND NO CLEAR -------------------------------------------------------
   Asked for as *"get rid of fill the page button on the cheat sheet maker. and get rid of clear
   button."* Both went, with `matFill` behind Fill (a binary search over ranked pieces, measured by
   the gauge — known-not-given first, then unchecked, then what the exam prints) and the handlers.
   A sheet is built by ticking pieces; a piece comes off by unticking it. `MAT_LEFT` went too: the
   gauge is still the only number that says whether the page is full. */

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
function initMat() {
  const box = $('mat-box');
  if (!box) return;
  /* SET EACH TIME THE TOOL OPENS, not once at load: the payload may not have landed when this file
     did, and a default read too early is the hard-coded one for the rest of the session. Only when
     nothing has been chosen yet, so reopening the tool does not throw away what somebody was in the
     middle of — and what they chose LAST time comes first, before the sheet's `start_on`. */
  if (!MAT_TOUCHED) {
    if (matRecall()) MAT_TOUCHED = true;
    else {
      MAT_ON = matStart();
      /* A STUDENT'S OWN LEVEL, when their sessions say it — see `matOwnLevel_`. Not marked as a
         choice: nobody chose it, so a later visit with a new booking may answer differently. */
      const own = matOwnLevel_(matParts());
      if (own) { MAT_LEVEL = own.level; if (own.subject) MAT_SUBJECT = own.subject; }
    }
  }
  box.innerHTML = `
    <div class="mat-pick">
      ${/* SELECTS, IN THE ORDER THE QUESTION IS ASKED: which subject, then which paper. A select
            answers on `change` — the dispatcher in cards.js routes it — and it is a real 44px
            control whose options the phone lays out itself, so a list of eleven levels costs one
            row of the card rather than four. One above the other, at every width — see `.mat-pick`.
            `aria-label` because nothing else names it; the option showing already says which
            question it is. */''}
      <label class="mat-sel"><select id="mat-subject" data-do="mat-subject"
        aria-label="Subject"></select></label>
      <label class="mat-sel"><select id="mat-level" data-do="mat-level"
        aria-label="Level"></select></label>
      ${/* THE THIRD QUESTION, WHICH TOPIC — see `MAT_GROUPS`. It is what keeps the list under the
            fold of a 320x568 phone, and it says on each option how much of the sheet is in it. */''}
      <label class="mat-sel"><select id="mat-group" data-do="mat-group"
        aria-label="Topic"></select></label>
    </div>
    <label class="check mat-given" id="mat-given" hidden><input type="checkbox" data-do="mat-exam">
      <span class="box"></span><span>Skip what the exam gives you</span></label>
    ${/* ---------- THE LIST IS THE WHOLE LIST, AND THE PANE DECIDES WHAT FITS ------------------
          IT WAS A SCROLLER (`widget-squeeze`): a box inside the card with its own scroll bar,
          which gave up its height so Print stayed on the card. Reported as "the cheat sheet maker
          should not have a scroll thing". A box that scrolls inside a card that slides is two
          gestures fighting for one finger — every drag on the list was a question of whether it
          moved the list or the column — and it is the one widget that did it.
          SO IT IS AN ORDINARY BLOCK NOW and the card is as tall as its list. Where that is taller
          than the pane, `paneReach_` does what it does for every other card: draws it smaller,
          down to its floor, and only past that lets the PANE scroll — one scroller, the same one
          every column has, handing the swipe back to the grid at its end. */''}
    <div class="mat-list" id="mat-list"></div>
    <div class="mat-gauge" id="mat-gauge"><i></i></div>
    <p class="mat-said" id="mat-said"></p>
    ${/* ---------- PRINT IT YOURSELF, OR HAVE IT PRINTED --------------------------------------------
          ASKED FOR AS *"add an upgrade to lamination for cheat sheet orders that are added to cart"*,
          which needs the sheet to be something the basket can hold first — it could only print.
          The trolley is a TILE BESIDE the button rather than a second full-width button under it:
          the sheet is a thing, a thing's actions are tiles, and a second 44px row is height this
          card has just been cut down to fit without. `mat-cart` is the same door the shop's trolley
          is, and the basket line it makes is a `print` line — which is what gives it the laminate
          switch, priced by the sheet's own rate, with nothing new in the basket to learn it. */''}
    <div class="mat-do">
      <button class="btn" data-do="mat-print" id="mat-go">Print the sheet</button>
      ${tile_({ icon: 'cart', label: 'Have it printed', note: 'into your basket', act: 'mat-cart' })}
    </div>`;

  /* ONE LIBRARY, SO NO HEADINGS. The list was split into "Components" and "Flyers" while a flyer
     could be ticked onto the sheet; with the flyer maker its own tool again there is one library
     here, and the subject select is what cuts it now — a heading over each subject would be the
     same fact twice, once in the select and once over the list it has just filtered. */
  $('mat-list').innerHTML = matParts().map(c => {
    /* GIVEN IN THE EXAM IS SAID ON THE ROW, IN WORDS, and only on the few it is true of. The old
       mark was the other way round — red on every piece the exam does NOT print, which on GCSE
       Higher is twenty of twenty-five, with a row of pills above the list to say what red meant.
       Marking the handful that are given is quieter and needs no key: the note is the key. */
    const notes = [c.note, c.inExam === true ? 'given in the exam' : '']
      .filter(Boolean).map(n => `<em class="mat-note">${esc(n)}</em>`).join('');
    return `<label title="${esc(c.name)}" aria-label="${esc(c.name)}" data-id="${esc(c.id)}"${
      c.inExam === true ? ' class="given"' : ''}><input
       type="checkbox" data-do="mat-tick"
       data-id="${esc(c.id)}"${MAT_ON.indexOf(c.id) !== -1 ? ' checked' : ''}>
     <span class="mat-txt"><b class="mat-face">${esc(c.face || c.name)}</b>${
       /* A NOTE BELONGS TO THE COMPONENT, NOT TO THE TOOL. "The ruler and protractor print at true
          size" was a line in a paragraph above the whole list, which is where a fact about two
          items out of twenty-five goes to be ignored. On the two rows it is about, it is read.
          INSIDE THE ROW'S 44px NOW, under the face in the same cell, rather than a grid line of its
          own below it — that line was 15px a note and, with groups, the last thing between a
          ten-row group and a card drawn at 0.83 on a 320x568 phone. See `.mat-txt`. */
       notes}</span></label>`;
  }).join('');
  matPaint();
}

/* SWITCHING SUBJECT OR LEVEL HIDES WHAT DOES NOT APPLY; it does not untick it. Somebody who set up
   a SATs mat, looked at GCSE and came back should find their mat as they left it. The level select
   carries the tier in its value — `GCSE|H` — because they are one choice on the screen. */
on('mat-subject', el => {
  MAT_TOUCHED = true;
  MAT_SUBJECT = String(el.value || 'all');
  matPaint();
  matRemember();
});
on('mat-level', el => {
  MAT_TOUCHED = true;
  const [l, t] = String(el.value || 'all').split('|');
  MAT_LEVEL = l || 'all';
  if (t === 'F' || t === 'H') MAT_TIER = t;
  matPaint();
  matRemember();
});
/* A GROUP CHANGES WHAT IS LISTED AND NOTHING ELSE — the paper is every tick at this subject and
   level, whichever group is showing, so the gauge does not move when this does. */
on('mat-group', el => {
  MAT_TOUCHED = true;
  MAT_GROUP = String(el.value || '');
  matPaint();
  matRemember();
});
on('mat-exam', el => {
  MAT_TOUCHED = true;
  MAT_EXAM = el.checked ? 'not' : 'all';
  matPaint();
  matRemember();
});
on('mat-tick', el => {
  MAT_TOUCHED = true;
  const id = el.getAttribute('data-id');
  const at = MAT_ON.indexOf(id);
  if (el.checked && at === -1) MAT_ON.push(id);
  if (!el.checked && at !== -1) MAT_ON.splice(at, 1);
  matPaint();
  matRemember();
});

/* WHAT DRAWS A PIECE. One lookup: a component is a function in `MAT_HTML` keyed by its id. There
   were two libraries while a flyer could be ticked onto the sheet (`flyOne` handed the campaign row
   it named); the flyer maker is its own admin-only tool again and there is no flyer here to draw.
   Every caller asks this rather than reaching into `MAT_HTML` itself, so a second kind of piece — a
   coupon, a booking slip — is a line here and a row in the list, and nothing else has to learn it.
   A PIECE WHOSE DRAWING IS MISSING SAYS SO on the paper. Silence would print a gap, and a gap on a
   sheet you are about to photocopy thirty times is worth a sentence. */
function matDraw(c) {
  return MAT_HTML[c.id] ? MAT_HTML[c.id]()
    : `<p class="mat-gone">${esc(c.name)} has nothing to draw it.</p>`;
}

function matPaint() {
  const list = $('mat-list');
  /* THE PICKER IS WHAT MUST BE THERE — there is no sheet on the card to look for any more. */
  if (!list || !$('mat-said')) return;
  /* ONE READ OF THE PARTS FOR THE WHOLE PAINT — the choices, the list and the sheet are all asked
     about the same list, so they cannot be answering about two. */
  const parts = matParts();

  /* THE CHOICES FIRST, BECAUSE EVERYTHING BELOW READS THEM. `matSettle` puts back any choice the
     parts no longer support and sets `MAT_SHOW` before a single block is drawn — every block reads
     it through `matKeep` while rendering, so setting it afterwards would tier the sheet one repaint
     late. `matChoices` then draws the selects and the box from that state. */
  matSettle(parts);
  matChoices(parts);

  /* THE LIST AND THE PAPER ASK ONE QUESTION — `matShown` — and the tick on each row is drawn from
     `MAT_ON` rather than left to the box, so a remembered sheet, which
     changes the ticks without anybody pressing a box, shows what it holds. */
  const byId = {};
  parts.forEach(c => { byId[c.id] = c; });
  let listed = 0;
  if (list) list.querySelectorAll('label').forEach(el => {
    const id = el.getAttribute('data-id');
    const show = matShown(byId[id]);
    /* LISTED IS SHOWN AND IN THE GROUP; PRINTED IS SHOWN. The group cuts the list and not the
       paper — see `MAT_GROUPS` — so `listed` below still counts the whole level, which is what
       "nothing here for this level yet" is a sentence about. */
    el.classList.toggle('off', !(show && matInGroup(byId[id])));
    const tick = el.querySelector('input');
    if (tick) tick.checked = MAT_ON.indexOf(id) !== -1;
    /* PIECES, NOT THE RULER. The ruler is offered under every subject and level, so counting it made
       "nothing here" unreachable: Science with the exam's own periodic table skipped listed the
       ruler alone and said "tick pieces, or Fill the page" over a Fill that was greyed out (Fill is gone now). */
    if (show && byId[id] && !byId[id].edge) listed++;
  });

  const on_ = parts.filter(c => MAT_ON.indexOf(c.id) !== -1 && matShown(c));

  /* AN EDGE PIECE IS NOT IN THE COLUMN. The ruler lives in the margin, so it must not be laid out
     with the others or it would take a row of its own and push everything down a sheet. */
  const pieces = on_.filter(c => !c.edge);

  /* ONE FUNCTION, CALLED ONCE PER BLOCK. The first version had a ternary that invoked `MAT_HTML`
     twice for the same component — drawing a protractor's 181 ticks and throwing one copy away. */
  /* A PIECE THAT IS ALREADY A FINISHED THING GETS NO HEADING AND NO RULE. That was the flyer, when
     one could be ticked here: it carries its own name, colour and edge, and a heading over it would
     label a poster with the word poster. `bare` says so and the stylesheet takes the heading, the
     hairline and the padding off. No piece carries it today; it is kept for the next one that is a
     finished thing rather than a block of facts. */
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
  let cellN = 0;
  /* `is-wide` / `is-narrow` BECAUSE A LABEL/VALUE BLOCK LAYS ITSELF OUT DIFFERENTLY at a third of
     the page (two columns) and across the whole of it (four) — the stylesheet reads the class
     rather than working the width out again. */
  const cell = c => `<div class="mat-box${c.bare ? ' bare' : ''}${
    matSpan(c) === MAT_TRACKS ? ' is-wide' : ' is-narrow'}" data-i="${cellN++}" data-id="${
    esc(c.id)}" style="grid-column:span ${matSpan(c)};grid-row:span ${Math.round(c.h / MAT_ROW)}">${
    c.bare ? '' : `<h4>${esc(c.name)}</h4>`}${matDraw(c)}</div>`;
  const h = pieces.map(cell).join('');

  /* THE SUBJECT AND THE LEVEL ARE ON THE PAPER. Six sheets in a folder all headed "Cheat sheet"
     are six sheets you have to read to tell apart, and the two things that distinguish them are
     already known here. `all` is not a subject or a level anybody is at, so either prints as
     nothing rather than as "every". The tier is named only where it split the list — an English
     GCSE sheet headed "Higher" would be claiming a difference the pieces do not have. */
  const B = matBrand();
  const tierWord = (MAT_LEVEL !== 'all' && matTierSplits(MAT_LEVEL))
    ? (MAT_TIER === 'F' ? ' Foundation' : ' Higher') : '';
  const title = (MAT_SUBJECT === 'all' ? 'Cheat sheet' : MAT_SUBJECT + ' cheat sheet')
    + (MAT_LEVEL === 'all' ? '' : ' — ' + MAT_LEVEL + tierWord);
  /* PHONE ONLY IF THE TAB HAS ONE — a separator with nothing after it reads as something missing
     rather than something not offered. */
  const foot = [B.area, B.phone].filter(Boolean).join('  ·  ');
  /* THE MARGIN BELONGS TO THE RULER, so it goes when the ruler does. Left reserved, an untick
     would take the scale away and leave a 20mm strip of nothing down the page — which reads as a
     printing fault rather than as a choice. */
  const ruled = MAT_ON.indexOf('M01') !== -1;
  /* THE GRID'S THREE NUMBERS ARE HANDED TO THE STYLESHEET FROM HERE, so the tracks the paper is
     laid out on and the widths the picker prices from are the same constants rather than two copies
     of them — the disagreement this file has already paid for twice. */
  const grid = `--mat-tracks:${MAT_TRACKS};--mat-gut:${MAT_GUT}mm;--mat-row:${MAT_ROW}mm;`
             + `width:${MAT_TEXT_W}mm`;
  const probe = matProbe(`<div class="mat-sheet${ruled ? ' ruled' : ''}">${
    ruled ? `<div class="mat-rule">${matRuler(285)}</div>` : ''}
    <div class="mat-head"><h3>${esc(title)}</h3><span>${esc(B.name)}</span></div>
    <div class="mat-cols" style="${grid}">${h}</div>
    <div class="mat-foot"><span>${esc(foot)}</span>
      <b>${esc(B.site)}</b></div></div>`);

  /* ---------- A SLOT IS NEVER ALLOWED TO CUT A FORMULA OFF ------------------------------------------
     `MAT_SLOT` IS MEASURED, and a measurement can go stale — a row added to a block, a font that
     renders wider. A fixed slot that silently clipped the last line of the quadratic formula would be
     worse than one that grew, because the sheet is photocopied thirty times before anybody reads the
     bottom of it. So a slot its own drawing overflows takes the rows it needs, and the console names
     it: the fixed size is the rule and this is the alarm that says the table needs a new number. */
  const px = matPx();
  const cols = probe.querySelector('.mat-cols');
  if (cols) cols.querySelectorAll('.mat-box').forEach(b => {
    if (b.scrollHeight <= b.clientHeight + 1) return;
    const rows = Math.ceil(b.scrollHeight / px / MAT_ROW);
    b.style.gridRow = 'span ' + rows;
    if (typeof console !== 'undefined') {
      console.warn('[mat] ' + b.getAttribute('data-id') + ' needs ' + rows * MAT_ROW
                 + 'mm and its slot is smaller — update MAT_SLOT');
    }
  });
  /* THE TOP ROW TAKES NO HAIRLINE. It is already under the heavy rule below the title, and two
     lines 2mm apart is a mistake that looks deliberate. Which blocks ARE the top row is the grid's
     answer rather than the list's — a narrow block may be packed up beside a wide one — so it is
     asked of the laid-out page. */
  if (cols) {
    const top = cols.getBoundingClientRect().top;
    cols.querySelectorAll('.mat-box').forEach(b =>
      b.classList.toggle('is-top', b.getBoundingClientRect().top - top < 1));
  }

  /* MEASURED, NOT ADDED UP. The slots are fixed, but which of them the grid packs side by side is
     not something a table of numbers can know. Reading the rendered column is the figure that is
     always right. */
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
  const PAGE_H = MAT_ROOM;                       /* usable height, inside the margins */
  const ruleW = ruled ? 20 : 0;
  /* THE WIDTH IS MEASURED TOO. It was written as 198 minus the ruler, which is 178 — and the text
     block is 184, because the 6mm right margin is not the ruler's to give up. A budget half of
     which is measured and half of which is assumed is the half that is assumed that goes wrong. */
  const box = cols ? cols.getBoundingClientRect() : null;
  const colW = box ? box.width / matPx() : 0;
  const colH = box ? box.height / matPx() : 0;
  const room = Math.round(ruleW * PAGE_H + colW * PAGE_H);
  const used = Math.round(ruleW * PAGE_H + colW * colH);
  const over = used > room;

  /* IN CENTIMETRES SQUARED, and the percentage first. 41,382mm2 is a number nobody can picture;
     414cm2 is a postcard, and "38% used" is what actually gets read. */
  const pct = Math.min(100, Math.round(used / room * 100));
  const left = Math.max(0, Math.round((room - used) / 100));
  $('mat-gauge').classList.toggle('over', over);
  $('mat-gauge').firstElementChild.style.width = pct + '%';
  $('mat-said').className = 'mat-said' + (over ? ' over' : '');
  /* A PERCENTAGE OF ONE PAGE AND A COUNT, which are the two things somebody holding a phone can
     picture. It said "412cm² of paper left", which is true and has to be worked out; and when the
     list is empty it says what to do, because an empty gauge over an empty list reads as broken. */
  const n = pieces.length;
  $('mat-said').innerHTML = over
    /* NOT "OR THE BOTTOM IS CUT OFF", which it said — and could not happen, because Print is
       disabled while the gauge is over (below). A warning about a consequence the tool has already
       prevented is a sentence the next reader believes; this one also fits on one line at 320. */
    ? `<b>${Math.round(used / room * 100)}% of one page</b> — untick something`
    : `<b>${pct}% of the page</b> · ${
        n ? `${n} piece${n === 1 ? '' : 's'}${left ? '' : ' · full'}`
        : !listed ? (MAT_EXAM === 'not' && parts.some(c => !c.edge && matShown(c, true))
            ? 'all given in the exam' : 'nothing here for this level yet')
        : 'tick pieces'}`;
  $('mat-go').disabled = over || !n;
  /* ---------- AND WHAT THE BASKET WOULD BE GIVEN ----------------------------------------------------
     THE SAME SHEET THE PRINT BUTTON WOULD PRINT, described rather than drawn — `mat-cart` reads it,
     so the basket can never hold a sheet the gauge did not pass. The KEY is the subject, the level
     and the sorted ids, which is what makes two presses on one sheet one line and a changed sheet a
     new one. The NAME says subject, level and how many pieces, because that is how the owner tells
     six cheat sheets in one order apart; the PIECE NAMES go with it so the order message lists
     them and the sheet can be rebuilt from the message alone. The ruler is in the list when it is
     ticked — it is on the paper — and not in the count, which is the gauge's. */
  const say = [MAT_SUBJECT === 'all' ? 'every subject' : MAT_SUBJECT,
               MAT_LEVEL === 'all' ? 'every level' : MAT_LEVEL + tierWord].join(' · ');
  MAT_ORDER = {
    ok: !over && n > 0,
    key: 'mat:' + MAT_SUBJECT + '|' + matLevelValue() + '|' + on_.map(c => c.id).sort().join(','),
    name: 'Cheat sheet — ' + say + ' (' + n + ' piece' + (n === 1 ? '' : 's') + ')',
    parts: on_.map(c => c.name),
  };
  /* THE TROLLEY FILLS WHEN THIS EXACT SHEET IS IN THE BASKET, and empties the moment a tick makes it
     a different sheet — the bundle's trolley rule (`cartPaint_`), for one line rather than several. */
  const trolley = list.closest('#mat-box') && list.closest('#mat-box').querySelector('[data-do="mat-cart"]');
  if (trolley) {
    const inCart = typeof CART !== 'undefined' && CART.some(c => c.kind === 'print' && c.key === MAT_ORDER.key);
    tileSet_(trolley, inCart ? { label: 'In your basket', note: '', on: true, off: false }
                             : { label: 'Have it printed', note: 'into your basket', on: false,
                                 off: !MAT_ORDER.ok });
  }
  /* WHAT GOES TO THE PRINTER is the sheet exactly as it was measured — slots grown, top row marked —
     kept as markup so `mat-print` prints the page the gauge was talking about rather than a second
     rendering of it. */
  MAT_SHEET = probe.innerHTML;
  probe.remove();
}

/* THE SHEET AS A BASKET LINE — see the note where `matPaint` fills it. Empty until the first paint. */
let MAT_ORDER = { ok: false, key: '', name: '', parts: [] };

/* ---------- INTO THE BASKET, AS A PRINTED PAGE ----------------------------------------------------------
   A `print` LINE, ONE PAGE, NO PRICE STORED — `cartPrint_` prices it from `print_rate_per_page` every
   time it is asked, and `lamControl_` offers it the laminate switch at `laminate_rate_per_page`,
   both off the Ledger config. Nothing here knows a rate, which is the point: the owner's figure is
   the only figure, and a rate typed into this file would be a second one that goes stale.

   SIGNED OUT, IT SAYS SO AND GOES TO SIGN IN — `cart-add`'s own two lines, because the basket is a
   person's and the order goes out as a message from them. Refused, not greyed, when the sheet is
   empty or over the page: the same rule the Print button is disabled by, said in words for
   somebody who pressed anyway. */
on('mat-cart', el => {
  if (!USER) { toast('Sign in first'); go('account'); return; }
  const o = MAT_ORDER;
  if (!o.ok) { toast('Tick some pieces that fit on one page first'); return; }
  if (CART.some(c => c.kind === 'print' && c.key === o.key)) { toast('Already in your basket'); return; }
  CART.push({ key: o.key, kind: 'print', name: o.name, pages: 1, cost: 0, parts: o.parts.slice() });
  cartSave();
  if (typeof cartPaint_ === 'function') cartPaint_();
  tileSet_(el, { label: 'In your basket', note: '', on: true });
  /* THE UPGRADE IS NAMED ONLY WHEN IT IS OFFERED — a rate of 0 in the Ledger means no laminating. */
  toast('Cheat sheet in your basket' + (typeof laminateOffered_ === 'function' && laminateOffered_()
    ? ' — laminate it there' : ''));
});

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
let MAT_SHEET = '';
function matProbe(html) {
  const p = document.createElement('div');
  p.className = 'mat-probe';
  p.style.cssText = 'position:absolute;left:-10000px;top:0;width:210mm;visibility:hidden;'
                  + 'pointer-events:none';
  p.setAttribute('aria-hidden', 'true');
  p.innerHTML = html;
  document.body.appendChild(p);
  return p;
}

/* HOW MANY PIXELS A MILLIMETRE IS, measured rather than assumed — 3.7795 is what a browser SHOULD
   make of one, and under a page zoom it is not. The gauge divides the probe's rendered box by this;
   it scaled the old on-screen preview too, which is gone (see `matProbe`). */
function matPx() {
  const p = document.createElement('div');
  p.style.cssText = 'width:100mm;position:absolute;visibility:hidden';
  document.body.appendChild(p);
  const k = p.getBoundingClientRect().width / 100;
  p.remove();
  return k || 3.7795;
}
/* PRINTING FROM INSIDE THE APP. A browser prints the whole document, so the class hides everything
   else and lifts the sheet out at full size — set only while printing, so a print started anywhere
   else is untouched. The timer is there because some browsers never fire `afterprint` on a
   cancelled dialogue, and the app would be left with everything hidden: a blank screen that looks
   exactly like a crash. */
on('mat-print', () => {
  if (!MAT_SHEET) return;
  /* BUILT AT THE END OF THE BODY, from the sheet the gauge measured. It was always a copy here —
     `body` is a centred 26.5rem column that clips at 115mm, so a sheet printed from inside the card
     came out shifted right with its right-hand half missing — and with no preview on the card it is
     now a copy of `MAT_SHEET`, which is the same page without a second rendering of it. */
  const paper = document.createElement('div');
  paper.className = 'mat-paper';
  paper.innerHTML = MAT_SHEET;
  document.body.appendChild(paper);
  document.body.classList.add('printing-mat');
  const done = () => {
    document.body.classList.remove('printing-mat');
    paper.remove();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  /* AND A TIMER, because some browsers never fire `afterprint` on a cancelled dialogue, and the app
     would be left with everything hidden: a blank screen that looks exactly like a crash. */
  setTimeout(done, 4000);
  /* `window.print()`, NOT `print()`. Bare it works — it is a global — and it reads as a function
     this file forgot to declare, which is exactly what `check.js` said. */
  window.print();
});
