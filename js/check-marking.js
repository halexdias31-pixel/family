#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-marking.js

   DOES THE MARKER SAY YES TO A RIGHT ANSWER AND NO TO A WRONG ONE.

   WHY THIS EXISTS. `markAnswer_` is the one piece of this app that tells a child they are wrong,
   and there is nobody for them to appeal to. Everything else here measures whether the app WORKS;
   this measures whether it is FAIR, and the two failures are not symmetrical:

     a right answer marked wrong   a child stops trusting the marking, and then stops using it
     a wrong answer marked right   a child learns the wrong thing and finds out in an exam

   Both are real and the first is the one that happened. The library writes Q23(b) of the June 2024
   Foundation paper as `5&frasl;9`, which strips to `5⁄9` carrying U+2044 FRACTION SLASH -- a
   character no phone keyboard has. What a student types is `5/9`, and before the fold in
   `markNorm_` those were two different strings. Ninety-one rows in the library are spelled that
   way, and somebody was sitting one of those papers at the time.

   IT READS THE REAL FUNCTIONS, NOT A COPY. `find.js` is 350 KB and needs a browser, so the five
   marking functions are cut out of it by name and run on their own -- they touch nothing else in
   the app, which is what makes that safe and is also why they are worth checking in isolation. A
   second implementation here would be a second thing to keep in step, which is the fault this
   repository records under `childrenOf`, under `link`/`source_url` and under `kinds`.

   EVERY CASE IS A FAULT THAT HAPPENED OR ONE THAT NEARLY DID. The thousands-separator row is the
   first question of that same Foundation paper, whose scheme answer is "18 000" and which marked
   "18000" wrong. The `11/6` row is the reason spaces are NOT stripped wholesale: 1 1/6 and 11/6 are
   1.17 and 1.83, and folding them together would mark a wrong answer right to fix a right one.
================================================================================================== */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'find.js'), 'utf8');

/* CUT BY NAME, BRACE-COUNTED, AND THE CUTTER IS `check-marks-load.js` — one extractor, because
   other checks need the same functions to ask different questions of them, and a second cutter
   written once already could not find `markBare_`. A regex for "the body of a
   function" is really a regex for "up to the next closing brace at the start of a line", which is
   a formatting convention rather than a fact about the code, and this file is checking the one
   thing in the app that must not be approximately right. */
const { NAMES, markingSource } = require('./check-marks-load.js');

const marks = markingSource(path.join(__dirname, '..'));
if (marks.missing.length) {
  /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO. "I did not check" is not the same
     answer as "I checked and it was fine", and `check-booking.js` printed the second for the first
     for months. */
  console.log('check-marking: cannot find ' + marks.missing.join(', ') + ' in find.js — renamed?');
  process.exit(1);
}
eval(marks.source);

/* typed, accept, expected. `null` means "nothing typed", which is not a wrong answer. */
const CASES = [
  /* THE FRACTION SLASH, which is what the library writes and no keyboard has */
  ['5/9', '5⁄9', true, 'the answer to Q23(b), typed the way a phone types it'],
  ['5⁄9', '5⁄9', true, 'and typed the way the library spells it'],
  ['5 / 9', '5⁄9', true, 'with the spaces somebody puts round an operator'],
  ['2/3', '2⁄3', true, 'Q13(b) of the same paper'],
  ['1 1/6', '1 1⁄6', true, 'a mixed number both ways'],
  ['3 1/3', '3⅓', true, 'the vulgar character, which is what a signpost prints'],
  ['1/2', '½', true, 'and on its own'],
  /* AND THE THING THAT MUST STAY WRONG */
  ['11/6', '1 1/6', false, '11/6 is 1.83 and 1 1/6 is 1.17 — the space is load-bearing'],
  ['1 1/6', '11/6', false, 'and the same the other way round'],
  /* THE THOUSANDS SEPARATOR — three printings of one number, one of them typed */
  ['18000', '18 000', true, 'Edexcel writes 18 000'],
  ['18,000', '18 000', true, 'the KS2 papers write 1,000'],
  /* NUMBERS COMPARED AS NUMBERS, AND UNITS DROPPED FROM THE EXPECTED SIDE ONLY */
  ['8.50', '8.5', true, 'trailing zeros'],
  ['1000', '1,000 envelopes', true, 'the unit is the sentence, not the answer'],
  ['1000 cats', '1,000 envelopes', false, 'but not from what was typed'],
  /* A UNIT THE CHILD TYPED, against a bare number or the same unit — the 2019 SATs audit */
  ['3.75 litres', '3.75', true, 'a careful child writes the unit'],
  ['65p', '65', true, 'pence written the way a child writes it'],
  ['25%', '25', true, 'a percentage sign'],
  ['144 cm²', '144', true, 'square units'],
  ['(55, 30)', '55, 30', true, 'a coordinate in its own brackets'],
  ['0.009 kg, 0.99 kg, 1.025 kg, 1.25 kg', '0.009, 0.99, 1.025, 1.25', true, 'a unit on every value of a list'],
  ['3.75 litres', '4', false, 'a unit does not make a wrong number right'],
  ['5 and 24', '5', false, 'a second answer is not a unit'],
  ['12 kg', '12 g', false, 'a different unit is a different answer'],
  /* A LIST IS A SET */
  ['10, 5, 2, 1', '1, 2, 5, 10', true, 'factors, worked outwards from the middle'],
  ['1, 2, 5', '1, 2, 5, 10', false, 'one missing is still wrong'],
  /* SEVERAL ANSWERS CAN BE RIGHT */
  ['16', '8 | 16', true, '"how many friends might she have" has two answers'],
  ['9', '8 | 16', false, 'and nine is not one of them'],
  /* "OR EQUIVALENT", WHICH IS WHAT THE MARK SCHEME SAYS AND WHAT THE CANCELLING LEAVES BEHIND */
  ['10/18', '5\u20449', true, 'Q23(b)\u2019s scheme says oe and means it'],
  ['15/20', '3\u20444', true, 'what Corbettmaths Q3 gives you before you cancel'],
  ['0.5', '1/2', true, 'a decimal is the same number'],
  ['1/2', '0.5', true, 'and the other way round'],
  ['7/3', '2 1/3', true, 'top-heavy against the mixed number'],
  ['6/12', '1\u20442 km', true, 'with the unit still on the expected side'],
  ['5/8', '3\u20444', false, 'close is not equal'],
  ['1/0', '5', false, 'a denominator of nought is not a number'],
  /* A UNIT IS NOT A LIST OF ALTERNATIVES. `set-accept.py` used to split an answer on `/`, so
     `12 km/h` became the two acceptable answers `12 km` and `h` — and the bare letter **h** was
     marked RIGHT. Found on Q14(a) of the June 2024 Foundation Paper 2. */
  ['12 km/h', '12 km/h', true, 'the speed, written out'],
  ['12', '12 km/h', true, 'and without the unit, which is the sentence not the answer'],
  ['h', '12 km/h', false, 'the letter out of the unit is not an answer'],
  ['cm3', '2 g/cm^3', false, 'nor half of a density'],
  /* A SUPERSCRIPT THAT IS NOT A NUMERATOR IS A POWER. Deleting its tags ran it into the base, so
     `m<sup>4</sup>` was stored as `m4` and `10<sup>7</sup>` as `107` — values nobody types. */
  ['m^4', 'm^4', true, 'an index, with the caret a keyboard has'],
  ['3.42 × 10^7', '3.42 × 10^7', true, 'standard form'],
  /* THE MINUS SIGN THE PAPER PRINTS IS NOT THE ONE ON THE KEYBOARD */
  ['-3', '−3', true, 'U+2212 against the hyphen'],
  /* A BAND THE SCHEME PRINTS TAKES EVERY NUMBER IN IT. Q13 of the May 2017 Foundation Paper 1 is
     `1.5 to 2 metres` and there is no single right answer to it — and before `markRange_` the
     BOTTOM of the band passed while the TOP failed, from the same cell, which is worse than
     failing both: it looks like marking. */
  ['1.5', '1.5 to 2 metres', true, 'the bottom of the band — right before this rule and after it'],
  ['2', '1.5 to 2 metres', true, 'the top of the same band, which used to be marked wrong'],
  ['1.75', '1.5 to 2 metres', true, 'and the middle, which is what a person actually writes'],
  ['1 3/4', '1.5 to 2 metres', true, 'the same value as a mixed number'],
  ['1.4', '1.5 to 2 metres', false, 'just under is still under'],
  ['2.1', '1.5 to 2 metres', false, 'and just over is over'],
  ['9', '7.5 to 12 metres', true, 'the tree, Q13(b) of the same paper'],
  ['7', '6 to 8 boxes', true, 'and Q18(a), where the band is whole boxes'],
  ['5', '6 to 8 boxes', false, 'five boxes is not six'],
  /* A HYPHEN BETWEEN TWO NUMBERS IS NOT A BAND, and must not become one: it is also how a person
     writes a subtraction and how this library writes an age range. */
  ['9', '7-11', false, 'a hyphen is not `to`'],
  ['banana', '1.5 to 2 metres', false, 'and a word is in no band'],

  /* ---------- A RATIO, WHICH NOTHING IN THIS LIBRARY COULD MARK UNTIL THE COLON FOLDED ----------
     `markNorm_` took the spaces off either side of a fraction slash and left them round a colon,
     so `2:3` typed against the `2 : 3` a mark scheme prints came out FALSE. Measured across the
     whole library first: not one of its 1,435 `accept` cells held a colon, so no ratio answer
     anywhere could mark itself -- which is also what proves the fold cannot change an existing
     row. Q10 of the June 2024 Foundation paper is the first one that can. */
  ['2:3', '2 : 3', true, 'Q10 of June 2024 Foundation, typed the way a child types it'],
  ['2 : 3', '2 : 3', true, 'and the way the mark scheme prints it'],
  ['2 :3', '2 : 3', true, 'and with the spacing somebody actually manages on a phone'],
  ['3:2', '2 : 3', false, 'the other way round is a different ratio'],
  ['6:9', '2 : 3', false, 'and an uncancelled one fails a question asking for simplest form'],
  ['2/3', '2 : 3', false, 'a ratio is not the fraction its two numbers make'],

  /* ---------- AN ACCEPTED BAND WRITTEN WITH A DASH, WHICH NO CASE HERE HAD -----------------------
     `markRange_` takes `to` and the two long dashes, and every case above uses the word -- so the
     dash half of that rule has never once been exercised. CLAUDE.md records the gap in as many
     words, and it is the shape an escape sweep has broken in this repository twice: a real en dash
     written into a regex through a layer that eats the backslash leaves `/(?:to|-|-)/`, which
     matches the word and no dash, and every case in this file goes on passing. */
  ['1.75', '1.5\u20132 metres', true, 'the middle of a band written with an EN dash'],
  ['1.5', '1.5\u20132 metres', true, 'its bottom end'],
  ['2', '1.5\u20132 metres', true, 'its top end'],
  ['2.1', '1.5\u20132 metres', false, 'and over is still over'],
  ['1.75', '1.5\u20142 metres', true, 'and the same band written with an EM dash'],
  /* NOTHING TYPED IS NOT A WRONG ANSWER */
  /* ---------- A SPACE ROUND AN OPERATOR, WHICH IS THE RATIO RULE ONE CLASS OF CHARACTER ALONG ----
     A MARK SCHEME PRINTS `4n \u2212 3` AND NOBODY TYPES THE SPACES. 178 of the library's 1,436
     `accept` cells carry one, and they are the algebra questions \u2014 so the nth-term answer every
     student actually writes was marked wrong on every one of them. */
  ['4n-3', '4n \u2212 3', true, 'Q20 of June 2024 Foundation, typed the way a child types it'],
  ['4n - 3', '4n \u2212 3', true, 'and with the spaces the scheme prints'],
  ['3(2x-5)', '3(2x \u2212 5)', true, 'a factorised expression closed up'],
  ['5x+2y', '5x + 2y', true, 'and a sum'],
  ['2\u00d73\u00d73\u00d75', '2 \u00d7 3 \u00d7 3 \u00d7 5', true, 'a product of primes'],
  ['4n+1', '4n \u2212 3', false, 'the common slip off the first term is still wrong'],
  ['4x-3', '4n \u2212 3', false, 'and so is the wrong letter'],
  /* THE ONE THING THIS MUST NOT DO, and the fraction rule above names it: `1 1/6` is 1.17 and
     `11/6` is 1.83. The space in a mixed number touches no operator, so nothing here can reach it
     \u2014 and these two cases are what says so rather than a sentence claiming it. */
  ['1 1/6', '11/6', false, 'a mixed number must not fold onto the improper fraction'],
  ['11/6', '1 1/6', false, 'and not the other way round either'],

  /* ---------- A SIGN NO PHONE KEYBOARD HAS ------------------------------------------------------
     `\u2264` IS ON ELEVEN `accept` CELLS AND THERE IS NO KEY FOR IT. Q28 of June 2024 Foundation is
     `x \u2264 \u22124`, so a student who had solved it could not enter the answer at all. */
  ['x<=-4', 'x \u2264 \u22124', true, 'Q28 of June 2024 Foundation, with the keyboard\'s own operator'],
  ['x \u2264 -4', 'x \u2264 \u22124', true, 'and with the sign, if they can find it'],
  ['x>=-4', 'x \u2264 \u22124', false, 'the wrong way round is a different answer'],
  ['x=-4', 'x \u2264 \u22124', false, 'and an equation is not an inequality'],
  ['100<w<=150', '100 < w \u2264 150', true, 'a grouped-data class, typed'],

  /* ---------- WHAT THE MATHS KEYPAD WRITES ------------------------------------------------------
     `keypad.js` builds every structure with a slot to type into — `()/()`, `^()`, `√()` — so the
     stacked preview has somewhere to put the caret. These are its own outputs, typed key by key,
     against the scheme as the library writes it. The bracket fold in `markNorm_` is what makes
     them right, and the `2(3)` row is what it must never do. */
  ['(3)/(4)', '0.75', true, 'the keypad’s fraction, against a decimal scheme that says oe'],
  ['(3)/(4)', '3⁄4', true, 'and against the fraction the library prints'],
  ['3/(4)', '3⁄4', true, 'a fraction begun after its numerator was already typed'],
  ['(-3)/(4)', '−0.75', true, 'a negative fraction with the keypad’s minus'],
  ['(10)/(18)', '5⁄9', true, 'an uncancelled keypad fraction, the scheme still saying oe'],
  ['(5)/(8)', '3⁄4', false, 'and a different fraction is still different'],
  ['x^(2)', 'x^2', true, 'the keypad’s power, its slot still bracketed'],
  ['w^(-2)', 'w^-2', true, 'a negative index, bracketed or not'],
  ['3.42×10^(7)', '3.42 × 10^7', true, 'standard form off the keypad'],
  ['2√(11)', '2√11', true, 'a surd off the keypad'],
  ['√(7)/(7)', 'sqrt(7)/7', true, 'and against the scheme that spells the root out'],
  ['12π', '12pi', true, 'the π key against a scheme that wrote pi'],
  ['12pi', '12π', true, 'and pi typed against the sign'],
  ['2(3)', '23', false, 'a bracket after a digit is multiplication and must not be folded away'],
  ['(x+1)/(3)', 'x/3', false, 'a bracket round more than one term keeps its meaning'],

  /* ---------- A ROOT UNDER THE LINE, OFF THE KEYPAD ----------------------------------------------
     sin 45° on the exact-trig sheet: the cell lists `1/√2` and the model answer prints it, and the
     keypad writes it `1/(√(2))` — the fraction key after the 1 opens `/()`, the root key opens
     `√()`. The two folds ran in one pass, the outer bracket was tried while the inner one was still
     on, and "Not yet" was the answer to a right one. */
  ['1/(√(2))', '1/√2', true, 'sin 45° off the keypad: 1, the fraction key, √, 2'],
  ['(1)/(√(2))', '1/√2', true, 'and begun with the fraction key'],
  ['1/(√(3))', '√3/3 | 1/√3', true, 'tan 30° the same way'],
  ['(√(3))/(2)', '√3/2', true, 'and a root on TOP begun with the fraction key, which kept its bracket too'],
  ['1/(√(3))', '1/√2', false, 'a different root is still a different answer'],
  ['2/(√(2))', '1/√2', false, 'and so is a different numerator'],
  ['(√(2)+1)/(2)', '√2/2', false, 'a bracket holding a root AND more is still more than one term'],

  /* ---------- `root`, THE THIRD SPELLING OF √ --------------------------------------------------------
     The exact-trig cells listed `root3/2` beside `sqrt3/2`, so `root3/2` was right and `root 3/2`
     wrong, and the letters sent four surd questions to the keyboard, which has no √ key. */
  ['root 3/2', '√3/2 | sqrt3/2 | sqrt(3)/2 | (√3)/2', true, 'sin 60° typed out with the space a person puts in'],
  ['root3', '√3', true, 'run together'],
  ['root(3)', '√3', true, 'and bracketed the way sqrt(3) is'],
  ['root 2', '√3', false, 'the wrong root is still wrong'],
  ['10', '10 root 2 cm', false, 'the 10 of 10√2 — `root 2 cm` read as a UNIT after it, so this passed'],
  /* AND THE SAME CELL REFUSED ITS OWN ANSWER. June 2023 Higher Q16 is `10 root 2 cm`, which the
     fold made `10 √2 cm` — and the space stayed, so the keypad's `10√(2)` matched nothing. A space
     between a number and the root or π it multiplies says nothing (`3 √6` and `3√6` sit side by side
     in one cell), so it folds; and a unit comes off a surd as it does off a number. */
  ['10√(2)', '10 root 2 cm', true, 'June 2023 Q16 off the keypad: 1, 0, √, 2'],
  ['10√2 cm', '10 root 2 cm', true, 'and with the unit'],
  ['10√2cm', '10 root 2 cm', true, 'and the unit closed up'],
  ['√2', '10 root 2 cm', false, 'the root without its 10 is still wrong'],
  ['10√2 m', '10 root 2 cm', false, 'and a different unit is a different answer'],

  /* ---------- A UNIT GLUED TO A ROOT, OR TO A MULTIPLE OF π ---------------------------------------
     ROUND 1 TOOK `√3cm` OUT OF EXACT-TRIG Q17 so the row would get the keypad, and that made `√3cm`,
     `sqrt3cm` and the keypad's `√(3)cm` — right answers the cell had marked right — "Not yet". The
     marker took a unit off a bare NUMBER only (`MARK_UNIT` began `-?[\d.\/]+`), so a surd with a unit
     on it was never reduced, and `√3 cm` in the cell did not cover `√3cm` typed. The rule is fixed
     (`MARK_NUM`: a number may end in a root or in π) and the spelling stays out of the cell. */
  ['√3cm', '√3 | sqrt3 | sqrt(3) | √3 cm', true, 'exact-trig Q17, the unit closed up'],
  ['√(3)cm', '√3 | sqrt3 | sqrt(3) | √3 cm', true, 'and off the keypad, then `cm` on the abc keys'],
  ['sqrt3cm', '√3 | sqrt3 | sqrt(3) | √3 cm', true, 'and the root spelled out'],
  ['√3', '√3 cm', true, 'the root without its unit, which is the sentence and not the answer'],
  ['√3 m', '√3 cm', false, 'a different unit on a root is a different answer'],
  ['√2cm', '√3 | √3 cm', false, 'and a different root with the right unit is still wrong'],
  ['48πcm²', '48π | 48pi | 48 pi | 48π cm²', true, 'a sector’s area, the unit closed up after π'],
  ['48 π', '48π', true, 'and the space a person leaves before π'],

  /* ---------- AND ONLY THE UNIT ITS CELL NAMES -----------------------------------------------------
     ROUND 2 TOOK A UNIT OFF A ROOT, AND THE BARE ROOT BESIDE IT LET ANY UNIT THROUGH. A bare way is
     where a plain number's unit is "the sentence", and round 2 handed that to every surd and π row
     with nobody having measured it there: `√3 m` was Correct on Q17, whose own cell says `√3 cm`;
     `√3²` (3), `2√3²` (12) and `√3x` passed on every surd; `15πcm³`, a volume, on an area. orig and
     round 1 refused every one. So a unit after a root or π now has to be one the cell names — on
     any of its ways, because `37.7 cm | 12π` is one circumference written twice. */
  ['√3 m', '√3 | sqrt3 | sqrt(3) | √3 cm', false, 'exact-trig Q17 as the library holds it: the bare √3 let a metre through'],
  ['√3cm²', '√3 | sqrt3 | sqrt(3) | √3 cm', false, 'and an area where the cell says a length'],
  ['√3x', '√3 | sqrt3 | sqrt(3) | √3 cm', false, 'a letter after a root is algebra, not a unit'],
  ['√3²', '√3 | sqrt3 | sqrt(3)', false, 'and a power after one is a different number: √3² is 3'],
  ['2√3²', '2√3 | 2sqrt3 | 2sqrt(3)', false, '"simplify √12": 2√3² is 12'],
  ['2√3 kg', '2√3 | 2sqrt3 | 2sqrt(3)', false, 'a cell that names no unit takes none after a root'],
  ['15πcm³', '15π | 15π cm^2 | 15π cm²', false, 'June 2024 Higher Q15: a volume, against an area'],
  ['15π cm^2 m', '15π | 15π cm^2 | 15π cm²', false, 'and the right unit with another after it'],
  ['48π cm', '48π | 48pi | 48 pi | 48π cm²', false, 'a sector’s area: a length is not an area'],
  ['12π cm', '37.7 | 37.7 cm | 37.7cm | 12π | 12pi', true, 'a circumference whose cell names its unit on the decimal'],
  ['12π m', '37.7 | 37.7 cm | 37.7cm | 12π | 12pi', false, 'and another unit on the same circumference'],

  /* ---------- `*` AND A LETTER `x` BETWEEN NUMBERS ARE `×` ----------------------------------------
     Prime factorisation Q1 (88): the cell lists `2^3*11` and `2^3 x 11`, and refused every other
     spacing — `2^3 * 11`, `2 * 2 * 2 * 11`, `2^3 x11`, `2³ x 11` — on all eleven rows. */
  ['2^3 * 11', '2^3 × 11 | 2 × 2 × 2 × 11', true, '88 as a product of primes, with the spaces round the asterisk'],
  ['2 * 2 * 2 * 11', '2^3 × 11 | 2 × 2 × 2 × 11', true, 'and written out'],
  ['2^3 *11', '2^3 × 11', true, 'with the spacing somebody manages on a phone'],
  ['2^3 x11', '2^3 × 11', true, 'the letter x for times'],
  ['2³ x 11', '2³ × 11', true, 'after a superscript power'],
  ['2^(3) x 11', '2^3 × 11', true, 'the keypad’s power, then the letter'],
  ['3.42 x 10^7', '3.42 × 10^7', true, 'standard form with the letter'],
  ['2^3 * 13', '2^3 × 11', false, 'a different prime is still wrong'],
  /* THE CELL IS WRITTEN WITH THE LETTER, because that is the hole. Round 1 wrote this case against
     `2 × 3 × 3 × 5` — the sign, which no rule ever read as a unit — so it was green against the
     find.js that had the hole, and guarded nothing. Two rules close it now and each is enough on
     its own: the fold makes the letter `×`, and `markBare_` never reads a lone `x` as a unit. So this
     goes red against the old find.js and with both rules gone; the fold alone is pinned by `2^3 x11`
     above and by NORMS below, and `markBare_` alone by `6` against `6w² − 10w` further down. */
  ['2', '2 x 3 x 3 x 5', false, 'the first prime alone — `x 3 x 3 x 5` read as a unit after the 2, so this passed'],
  ['6.3', '6.3 x 10^7', false, 'and the number without its power of ten, the same way'],

  /* ---------- A UNIT WITH A CARET, AND THE POWER IS PART OF THE UNIT -------------------------------
     Pyramid Q1 refused `300cm^3` against a cell listing `300 cm^3`, and the keypad's power key
     writes `cm^(3)`. Area of Shapes Q1 asks for the units, and once its bare `60` was gone `60 cm`
     still passed, because `cm^2` was read as `cm`. */
  ['300cm^3', '300 | 300cm3 | 300 cm3 | 300 cm^3 | 300cm³', true, 'pyramid Q1 with no space before the unit'],
  ['300cm^(3)', '300 cm^3', true, 'and off the keypad’s power key'],
  ['300cm^3', '300 cm³', true, 'the caret against the superscript: one power, two spellings'],
  ['301cm^3', '300 | 300 cm^3', false, 'a different number is still wrong'],
  ['300cm^2', '300 cm^3', false, 'an area is not a volume'],
  ['60 cm', '60cm2 | 60 cm2 | 60 cm^2 | 60cm² | 60 cm²', false, 'Area of Shapes Q1: a length is not an area'],
  ['60 m²', '60cm2 | 60 cm2 | 60 cm^2 | 60cm² | 60 cm²', false, 'and a different area unit is a different answer'],
  ['60cm^2', '60cm2 | 60 cm2 | 60 cm^2 | 60cm² | 60 cm²', true, 'while the right unit, any spelling, is right'],
  ['12 cm²', '12m2 | 12 m2 | 12 m^2 | 12m² | 12 m²', false, 'Area of Shapes Q2: the triangle is in metres'],
  ['3x^2', '3', false, 'a letter with a power is algebra, not a coefficient with a unit after it'],
  ['6w2', '6w^2 - 10w | 6w² − 10w', false, 'and `w²` is not the unit `w2`'],
  /* A COMPOUND UNIT CLOSED UP was "Not yet" on every speed and density in the library: the unit a
     child typed came off only as letters, and `/` is not a letter, so `12km/h` stayed whole against
     a cell of `12 km/h`. The whole-library sweep below found 23 of them. */
  ['12km/h', '12 km/h', true, 'June 2024 Foundation Q14(a), the unit closed up'],
  ['1.01g/cm3', '1.01 g/cm^3', true, 'a density, its power spelled the other way'],
  ['12km/minute', '12 km/h', false, 'a different rate is a different unit'],
  /* A COMPOUND CAME OFF IN ROUND 2 TOO, AND TOOK THE SAME GENEROSITY: `2 kg/m^3` passed on a density
     listed `2 g/cm^3 | 2`, and `12 km/h m` on `12 km/h` because only the first word of a unit was
     read. A compound has to be the cell's own when the cell names a unit; where it names none, a
     compound after a plain number comes off as a plain unit does. */
  ['2 kg/m^3', '2 g/cm^3 | 2', false, 'June 2024 Foundation Q26: a density in the other unit'],
  ['12 km/h m', '12 km/h', false, 'a unit with another after it is not the unit'],
  ['15 km/h', '15', true, 'a compound against a cell that names no unit, as `3.75 litres` against `3.75`'],
  ['57.08 km/h', '57.1 km/h | 57.07 km/h | 57.07 to 57.1', true, 'and a rate inside the band printed beside its unit'],
  /* A POWER IS NOT A UNIT, AND ONLY A LENGTH TAKES ONE. `²` alone was a unit word and so was `x²`. */
  ['3²', '3', false, 'a power after a number is a different number: 3² is 9'],
  ['3x²', '3', false, 'and a letter with a raised power is algebra'],
  ['300 cm^3 of water', '300 cm³', true, 'the words after a unit are the sentence, its power on a caret'],
  /* A PLAIN NUMBER WITH A PLAIN UNIT KEEPS WHAT IT HAD, its first word compared. Holding it to the
     cell's units as well was measured and refused, because these are right and would have gone. */
  ['2.5 cm long', '2.5 cm', true, 'a unit and a word after it'],
  ['15 degrees', '15 | 15°C | 15 °C | 15C', true, 'the cell writes °C and the child writes degrees'],
  ['7.25 pounds', '£7.25 | 7.25 | 725p', true, 'and the pence on the same cell do not bind the pounds'],

  /* ---------- THE SPACE BETWEEN A NUMBER AND ITS LETTERS --------------------------------------------
     ROUND 2 TOOK IT AWAY. `markBare_` used to cut both `185p` and `185 p` to `185`, so whichever way
     round the cell and the child wrote it they met in the middle; once it stopped cutting a letter
     glued to a number (`7m` is "simplify 9m − 2m"), `185 p` typed against `185p` matched nothing, and
     43 spellings on 36 rows went from right to wrong. The library sweep below only ever typed the
     OTHER direction — a spaced cell, closed up — so it stayed green. */
  ['185 p', '1.85 | 185p', true, 'KS2 2019 Paper 3 Q16: pence with the space a child puts in'],
  ['12 p', '12p', true, 'the smallest case of it'],
  ['7 m', '7m', true, '"simplify 9m − 2m", spaced'],
  ['3 a', '3a | a3', true, 'June 2024 Foundation Q4, spaced'],
  ['6 cd', '6cd | 6dc', true, 'a product of two letters, spaced'],
  ['10 xy', '10xy | 10yx', true, 'and another'],
  ['6 w²', '6w^2 | 6w² | 6w2', true, 'and a letter with a power'],
  ['75 g, 180 g, 300 g', '180g, 300g, 75g', true, 'and every part of a list, in another order'],

  /* ---------- THE NUMBER IN FRONT OF AN EXPRESSION IS NOT THE ANSWER -------------------------------
     `markBare_` TOOK EVERYTHING AFTER THE FIRST NUMBER AS ITS UNIT, so it cut `6w² − 10w` to `6`, and
     a bare 6 was marked RIGHT for "expand 2w(3w − 5)". Not one cell: across the library the leading
     number of 241 expressions in 110 questions passed — every nth term (`4` for `4n − 1`), every
     expansion, every line (`2` for `2y = 3x + 6`), every error interval (`93.5` for `93.5 m ≤ length
     < 94.5 m`) — and times (`2` for `2 hours 45 minutes`). It takes off a UNIT now and nothing else: a
     word or a symbol from the list, a power and a `/`, and then the end of the answer. */
  ['6', '6w^2 - 10w|6w^2-10w|6w² − 10w|6w²-10w', false, 'Corbettmaths 30 June Q3: the 6 of 6w² − 10w'],
  ['4', '4n − 1', false, 'the 4 of an nth term'],
  ['2', 'y = 3⁄2x + 3 | y = 1.5x + 3 | 2y = 3x + 6', false, 'the 2 of an equation of a line'],
  ['93.5', '93.5 ≤ length < 94.5 | 93.5 m ≤ length < 94.5 m', false, 'the bottom of an error interval is not the interval'],
  ['2', '2 hours 45 minutes | 2h 45m', false, 'and the hours are not the time'],
  ['5', '5 minutes past 4 | 5 past 4 | 4:05', false, 'nor the minutes'],
  ['42', '42, 70, 15 | 42 days, 70 days and 15 weeks', false, 'nor the first of three'],
  /* A SINGLE LETTER IS ALGEBRA UNLESS IT IS A UNIT, AND GLUED TO A NUMBER IT IS NEVER TAKEN FOR ONE.
     `7m` is "simplify 9m − 2m" on the 5-a-day sheet and `6.27m` is a length on the next; nothing in
     the spelling tells them apart. Every metre, gram and second the library glues on also lists the
     bare number or the spaced unit beside it, so refusing the glued letter costs no right answer —
     and the money cells that list only `250p` are pounds questions where 250 alone reads as £250. */
  ['3', '3a | a3', false, 'June 2024 Foundation Q4: simplify 7a + a − 5a'],
  ['7', '7m', false, 'simplify 9m − 2m'],
  ['6', '6cd | 6dc', false, 'two letters are a product, not a unit'],
  ['80', '80y|80 y|80*y|80 x y|80 × y', false, 'nor is a letter after a space, when it is not a unit'],
  ['15', '15y|15y pence|15yp', false, 'and the unit after the letter does not make the letter one'],
  ['4', 'm = 4s/h|m=4s/h|4s/h', false, 'nor does a slash: `4s/h` is s over h'],
  ['250', '2.50|£2.50|2.5|250p', false, 'pence without its p, against an answer in pounds'],
  ['2', '2a (FC + CD + DE = (a − b) + a + b)', false, 'a worked answer still keeps its letter'],
  /* AND A UNIT STILL COMES OFF. These are the units the library writes, each the way it writes it. */
  ['6', '6 V', true, 'a single letter after a space is a unit'],
  ['77953', '77953 N/m²', true, 'and a compound one'],
  ['16.7', '16.7 m/s', true, 'a speed'],
  ['10', '10 miles per hour', true, '`per` and the unit after it'],
  ['8.5', '8.5 cm (PQ = 45 ÷ 10 = 4.5, so BC = 4.5 and AB = 13 − 4.5)', true, 'and the working in brackets after the unit'],
  ['126', '126 p', true, 'pence after a space'],
  ['1905', '1,905 m', true, 'a length with its thousands comma'],
  ['3.4', '3.4 mg/cm³', true, 'a density'],

  /* ---------- AN ALGEBRAIC FRACTION, OFF THE KEYPAD ------------------------------------------------
     June 2020 Higher Q12(a). Its cell was `3x2⁄(x + 2)(x − 4), which is …` — the superscript lost
     when the tags came off, and a sentence after it — so it marked nothing right, and it reached the
     keypad only because `markBare_` cut it at the first letter. Rewritten as maths. The keypad begun
     with the fraction key writes `(3x^(2))/(…)`: the POWER's slot folds first now, as the root's
     does, and a numerator's slot may hold one term with a power, so the bracket comes off. */
  ['(3x^(2))/((x+2)(x-4))', '3x^2/((x+2)(x-4)) | 3x^2/((x-4)(x+2)) | 3x^2/(x^2-2x-8)', true, 'begun with the fraction key'],
  ['3x^(2)/((x+2)(x-4))', '3x^2/((x+2)(x-4)) | 3x^2/(x^2-2x-8)', true, 'and with the 3x² typed first'],
  ['3', '3x^2/((x+2)(x-4)) | 3x^2/(x^2-2x-8)', false, 'the 3 of it, which the old cut passed'],
  ['(3x^(2)+1)/(x-4)', '3x^2+1/(x-4)', false, 'a numerator of two terms keeps its bracket'],

  /* ---------- A NAME IN FRONT OF THE ANSWER -----------------------------------------------------------
     The pyramid sheet's answer line is `h = ....... cm`, and a child copies it. */
  ['h = 12.5 cm', '12.5 | h = 12.5 | h=12.5 | 12.5cm | 12.5 cm', true, 'pyramid Q6, the answer line copied'],
  ['h=12.5cm', '12.5 | h = 12.5 | h=12.5 | 12.5cm | 12.5 cm', true, 'and closed up'],
  ['AB = 8.7 cm', '8.7 | 8.7cm | 8.7 cm', true, 'pyramid Q7, named by its side'],
  ['AB = 8.7', '8.7 | 8.7cm | 8.7 cm', true, 'without the unit'],
  ['h = 12.6 cm', '12.5 | h = 12.5 | 12.5 cm', false, 'a name does not make a wrong number right'],
  ['AB = 8.8 cm', '8.7 | 8.7 cm', false, 'nor a unit and a name together'],
  ['x = 7', 'y = 7', false, 'a cell that names its own letter still wants that letter'],
  ['2x+3', 'y = 2x + 3', false, 'and the `y =` of a line is never taken off the EXPECTED side'],
  ['', '7', null, 'an empty box is not a mistake'],
  ['banana', '7', false, 'and a word is not a number'],
];

let bad = 0;
CASES.forEach(([typed, accept, want, why]) => {
  const got = markAnswer_(typed, accept);
  if (got === want) return;
  bad++;
  console.log('  %j against %j — marked %s, should be %s   (%s)',
    typed, accept, String(got), String(want), why);
});

/* ---------- WHAT `markNorm_` ITSELF WRITES -----------------------------------------------------------
   SOME RULES CANNOT BE SEEN THROUGH `markAnswer_`, and a case written against it goes on passing with
   the rule deleted. `markParts_` runs `markNorm_` a second time over a string it has already
   normalised, so a bracket the first pass left is taken off by the second, and the order of two
   folds stops mattering at the level a CASE can see. The reviewer of round 1 deleted the line that
   folds a root's own slot first and all 137 cases stayed green. And a fold applied to BOTH sides
   cannot change whether they are equal: drop the lookahead that keeps the letter `x` in `2x + 3` and
   `2×+3` still equals `2×+3`. Those rules are statements about what `markNorm_` writes, so they are
   checked here, as that. */
const NORMS = [
  ['1/(√(2))', '1/√2', 'the root’s own slot folds first, then the fraction’s slot holding the root'],
  ['(√(3))/(2)', '√3/2', 'and a root on top, begun with the fraction key'],
  ['(3x^(2))/((x+2)(x-4))', '3x^2/((x+2)(x-4))', 'the power’s slot folds first, then the numerator holding the power'],
  ['(x+1)/(3)', '(x+1)/3', 'a numerator of more than one term keeps its bracket'],
  ['2(3)', '2(3)', 'a bracket after a digit is multiplication and is never folded'],
  ['2 x 3 x 3 x 5', '2×3×3×5', 'a letter x with a number on both sides is times'],
  ['2^3 x11', '2^3×11', 'after a power too'],
  ['2x+3', '2x+3', 'an x that is the letter is never folded: `2x` has no number after it'],
  ['6x', '6x', 'nor at the end of an answer'],
  ['3x^2', '3x^2', 'nor before a power'],
  ['10 root 2 cm', '10√2 cm', 'root is √, and the space between a number and its root says nothing'],
  ['48 pi', '48π', 'nor the space before π'],
  ['1 1/6', '1 1/6', 'while the space in a mixed number is the number'],
];
let normBad = 0;
NORMS.forEach(([s, want, why]) => {
  const got = markNorm_(s);
  if (got === want) return;
  normBad++;
  console.log('  markNorm_(%j) wrote %j, should be %j   (%s)', s, got, want, why);
});

/* ---------- THE WHOLE LIBRARY, MARKED ------------------------------------------------------------
   THE CASES ABOVE ARE THE FAULTS SOMEBODY THOUGHT OF, and every fault in this file was found the
   other way: by typing the library into itself. `6` against `6w² − 10w` was not one cell but 110, and
   `√3cm` was a right answer lost to a data edit that a sweep over one data set could not see. So the
   library is marked here on every run, seven ways, each a property that holds for EVERY row and
   needs nobody to list the rows:

     CLOSED UP   a way that is a number, a space and a unit — `√3 cm`, `12 km/h`, `80 y` — typed with
                 the space taken out is still right. A space is not an answer.
     SPACED      and the other way round: `185p`, `7m`, `6cd` typed with a space in. Round 2 lost 43 of
                 these and this sweep, typing only the first direction, stayed green over it.
     KEYPAD      a way typed the way the keypad stores it — every root, power and one-term
                 denominator in its own bracketed slot, `1/(√(2))` for `1/√2` — is still right.
     IN FRONT    the number in front of an EXPRESSION — letters and an operator after it, `4n − 1`,
                 `2y = 3x + 6`, `93.5 m ≤ length < 94.5 m` — is WRONG on its own. A unit is the
                 sentence; an expression is the answer.
     AFTER √/π   a root or a multiple of π the cell lists bare takes the units the cell names, closed
                 up or spaced, and nothing else: not a letter (`√3x`), not a power (`√3²`), not a unit
                 the cell does not name, and not the right one with another after it.
     A POWER     a number its cell lists, with `²` or `x²` after it, is wrong: a power is not a unit.
     COMPOUND    a compound unit the cell does not name, typed after a value it gives one, is wrong,
                 and so is the cell's own with another unit after it.

   The patterns that choose the rows are written out here and NOT borrowed from find.js: a check
   that asked the marker which ways have a unit would agree with the marker by construction. */
const LIB = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8'))
  .filter(r => r && r.kind === 'question' && String(r.accept || '').trim());
/* a way written with a space between the value and its unit — typed GLUED by the CLOSED UP sweep */
const GLUED = /^(-?[\d.\/]*(?:√[\d.]*\d|π|\d))\s+([a-z°%][a-z0-9°%²³^\/]*)$/;
const keyed = w => w.replace(/\/(√?[\d.]+|[a-z])(?![\d.(^a-z])/g, '/($1)')
  .replace(/√(\d+(?:\.\d+)?)/g, '√($1)').replace(/\^(-?\d+)/g, '^($1)');
/* a way written closed up — typed SPACED by the sweep of that name */
const SPACED = /^(-?[\d.\/]*(?:√[\d.]*\d|π|\d))([a-z°%][a-z0-9°%²³^\/]*)$/;
const ROOT = /^-?[\d.]*(?:√[\d.]*\d|π)$/;
/* `cm^2`, `cm2` and `cm²` are one unit; written here and not borrowed, for the reason above */
const fold = u => u.replace(/\^?2(?![\d])/g, '²').replace(/\^?3(?![\d])/g, '³');
const lib = { glued: 0, spaced: 0, keyed: 0, front: 0, root: 0, power: 0, compound: 0, bad: [] };
const want = (r, typed, right, why) => {
  if (markAnswer_(typed, r.accept) !== right)
    lib.bad.push(r.row_id + ': ' + JSON.stringify(typed) + ', ' + why + ', is marked ' + (right ? 'wrong' : 'right'));
};
LIB.forEach(r => {
  const ways = String(r.accept).split('|').map(w => w.trim()).filter(Boolean);
  const norms = ways.map(markNorm_);
  /* the units the cell writes after a number, each as one token */
  const units = [...new Set(norms.map(n => (GLUED.exec(n) || SPACED.exec(n) || [])[2]).filter(Boolean))];
  /* one value written one or more ways, and nothing else: only there is "x² is wrong" a fact */
  const one = new Set(norms.map(n => (GLUED.exec(n) || SPACED.exec(n) || [, n])[1])).size === 1;
  norms.forEach((n, i) => {
    const w = ways[i];
    const sp = SPACED.exec(n);
    if (sp) {
      lib.spaced++;
      want(r, sp[1] + ' ' + sp[2], true, JSON.stringify(w) + ' with a space put in');
    }
    if (ROOT.test(n)) {
      lib.root++;
      want(r, n + 'x', false, 'the root of ' + JSON.stringify(w) + ' with a letter after it');
      if (one) want(r, n + '²', false, 'the root of ' + JSON.stringify(w) + ' squared');
      want(r, n + ' kg', false, JSON.stringify(w) + ' with a unit its cell never names');
      units.forEach(u => {
        want(r, n + ' ' + u, true, JSON.stringify(w) + ' with the unit its cell names');
        want(r, n + u, true, JSON.stringify(w) + ' with the unit its cell names, closed up');
        want(r, n + ' ' + u + ' m', false, JSON.stringify(w) + ' with its unit and another after it');
      });
      ['m', 'cm', 'cm²', 'cm³'].filter(o => units.every(u => fold(u) !== o))
        .forEach(o => want(r, n + ' ' + o, false, JSON.stringify(w) + ' with ' + o + ', which its cell does not name'));
    }
    if (one && /^-?\d+(?:\.\d+)?$/.test(n) && Number(n) !== 0 && Number(n) !== 1) {
      lib.power++;
      want(r, n + '²', false, JSON.stringify(w) + ' squared');
      want(r, n + 'x²', false, JSON.stringify(w) + ' with x² after it');
    }
    const cp = (GLUED.exec(n) || SPACED.exec(n));
    if (cp && cp[2].indexOf('/') >= 0) {
      lib.compound++;
      const other = fold(cp[2]) === fold('kg/m^3') ? 'km/h' : 'kg/m^3';
      want(r, cp[1] + ' ' + other, false, 'the value of ' + JSON.stringify(w) + ' in a rate its cell does not name');
      want(r, cp[1] + ' ' + cp[2] + ' m', false, JSON.stringify(w) + ' with another unit after it');
    }
    const g = GLUED.exec(n);
    if (g) {
      lib.glued++;
      if (markAnswer_(g[1] + g[2], r.accept) !== true)
        lib.bad.push(r.row_id + ': ' + JSON.stringify(g[1] + g[2]) + ', ' + JSON.stringify(w) + ' closed up, is marked wrong');
    }
    const k = keyed(w);
    if (k !== w) {
      lib.keyed++;
      if (markAnswer_(k, r.accept) !== true)
        lib.bad.push(r.row_id + ': ' + JSON.stringify(k) + ', ' + JSON.stringify(w) + ' off the keypad, is marked wrong');
    }
    const m = /^-?\d+(?:\.\d+)?/.exec(n);
    const rest = m ? n.slice(m[0].length).replace(/\s+\(.*\)$/, '') : '';
    if (m && /[a-z]/.test(rest) && /[-+=<>×÷]/.test(rest.replace(/\^-?[\d.]+/g, ''))) {
      lib.front++;
      if (markAnswer_(m[0], r.accept) !== false)
        lib.bad.push(r.row_id + ': ' + JSON.stringify(m[0]) + ', the number in front of ' + JSON.stringify(w) + ', is marked right');
    }
  });
});
lib.bad.slice(0, 40).forEach(x => console.log('  ' + x));
if (lib.bad.length > 40) console.log('  … and ' + (lib.bad.length - 40) + ' more');

/* ---------- THE ROWS THESE FAULTS WERE FOUND ON, AS THE LIBRARY HOLDS THEM TODAY ------------------
   EVERY CASE ABOVE CARRIES ITS OWN COPY OF A CELL, which is what lets it state a rule — and what let
   round 1's data edit go unseen: `√3cm` came out of the REAL exact-trig Q17 while the cases went on
   testing a copy. These are typed against the live `accept`, so a data edit that loses a right
   answer, or puts a bare number back where the unit is the question, is red here as well as there. */
const ROWS = [
  ['Q-1CM-exact-trig-values-17', '√3cm', true, 'the right answer round 1’s data edit lost'],
  ['Q-1CM-exact-trig-values-17', '√(3)cm', true, 'and off the keypad'],
  ['Q-1CM-exact-trig-values-17', 'sqrt3cm', true, 'and spelled out'],
  ['Q-1CM-exact-trig-values-17', '√2', false, 'a different root'],
  ['Q-1CM-exact-trig-values-13', '1/(√(2))', true, 'sin 45° off the keypad'],
  ['Q-1MA1-2306-1H-16', '10√(2)', true, 'the diameter off the keypad'],
  ['Q-1MA1-2306-1H-16', '10', false, 'and its 10 alone'],
  ['Q-1MA1-2006-3H-12a', '(3x^(2))/((x+2)(x-4))', true, 'the algebraic fraction off the keypad'],
  ['Q-1MA1-2006-3H-12a', '3x^(2)/(x^(2)-2x-8)', true, 'and over the expanded denominator'],
  ['Q-1MA1-2006-3H-12a', '3', false, 'and its 3 alone, which the old cut passed'],
  ['Q-CBM-5AD-F-0630-5', '6', false, 'the 6 of 6w² − 10w'],
  ['Q-CBM-5AD-F-0630-5', '6w^(2)-10w', true, 'and the expansion off the keypad'],
  ['Q-1CM-area-of-shapes-1', '60 m²', false, 'the units are the question'],
  ['Q-1CM-area-of-shapes-2', '12 cm²', false, 'and the triangle is in metres'],
  ['Q-1CM-exact-trig-values-17', '√3 m', false, 'a metre where its cell says centimetres'],
  ['Q-1CM-exact-trig-values-17', '√3x', false, 'a letter after the root'],
  ['Q-1CM-exact-trig-values-17', '√3²', false, 'a power after it, which is 3'],
  ['Q-1CM-exact-trig-values-17', '√3cm²', false, 'an area'],
  ['Q-1CM-calculating-with-surds-1', '2√3²', false, '12, for "simplify √12"'],
  ['Q-1CM-calculating-with-surds-1', '2√3x', false, 'and the surd times x'],
  ['Q-1CM-calculating-with-surds-1', '2√3 kg', false, 'and a unit the question never had'],
  ['Q-1MA1-2406-1H-15', '15πcm³', false, 'a volume for an area'],
  ['Q-1MA1-2406-1H-15', '15πcm²', true, 'and the area, closed up'],
  ['Q-1CM-sectors-14', '48π cm', false, 'a length for a sector’s area'],
  ['Q-1MA1-2406-3F-26', '2 kg/m^3', false, 'a density in the other unit'],
  ['Q-STA-KS2-2019-P3-16', '185 p', true, 'pence, spaced, against `185p`'],
  ['Q-CBM-5AD-F-1013-1', '725 p', true, 'and again'],
  ['Q-CBM-5AD-F-0614-4', '7 m', true, '"simplify 9m − 2m", spaced'],
  ['Q-1MA1-2406-3F-4', '3 a', true, 'June 2024 Foundation Q4, spaced'],
  ['Q-1MA1-2406-2F-13a', '6 cd', true, 'a product, spaced'],
  ['Q-CBM-5AD-F-1222-4', '10 xy', true, 'and another'],
  ['Q-CBM-5AD-F-0609-3', '6 w²', true, 'and a power'],
  ['Q-CBM-5AD-F-0620-5', '12π m', true, 'a circle measured in metres, now its cell says so'],
  ['Q-CBM-5AD-F-0620-5', '12π cm', false, 'and not in centimetres'],
  ['Q-1CM-equation-of-a-tangent-12', '20√5 units', true, 'the unit its model answer prints'],
];
let rowBad = 0;
ROWS.forEach(([id, typed, want, why]) => {
  const r = LIB.find(x => x.row_id === id);
  const got = r ? markAnswer_(typed, r.accept) : 'not in the library';
  if (got === want) return;
  rowBad++;
  console.log('  %s: %j against %j — marked %s, should be %s   (%s)',
    id, typed, r ? r.accept : '', String(got), String(want), why);
});

/* ---------- AND IN TIME ------------------------------------------------------------------------------
   `MARK_UNIT` USED TO TAKE SECONDS OVER A SENTENCE. Its unit was `[a-z][a-z0-9]*` repeated with
   nothing required between repeats, so `because` could be read as one unit, or `b` + `ecause`, or
   every other split — 2.8 s for "5 because the triangle is much bigger?" when round 1 measured it,
   doubling with each letter, on a phone, on Check. It is the question mark that does it: the words
   all read as units, the `?` does not, and every way of reading them is tried before the match is
   given up. A unit now has to end where its letters do, which is the same language with one way to
   read it. The sentence here is one plural longer: about 1.6 s with the old pattern, warm, on the
   machine that wrote this (11 s cold), and a millisecond or two now. The limit sits a quarter of the
   way up, so a slow machine is not the thing that goes red. */
const SLOW = '5 because the triangles are much bigger?';
const t0 = Date.now();
markAnswer_(SLOW, '5');
const took = Date.now() - t0;
const slow = took > 400;
if (slow) console.log('  marking %j took %d ms — a unit is being read more than one way again', SLOW, took);

if (bad || normBad || lib.bad.length || rowBad || slow) {
  console.log('\n%d of %d marking cases wrong, %d of %d markNorm_ cases, %d in the library sweep, %d of %d\n' +
    'named rows, and the long answer took %d ms. Every one of these is a child being told the wrong\n' +
    'thing about their own work, so this fails the build.',
    bad, CASES.length, normBad, NORMS.length, lib.bad.length, rowBad, ROWS.length, took);
  process.exit(1);
}
console.log('OK — all %d marking cases, %d markNorm_ cases and %d named rows: a right answer is marked\n' +
  '     right, a wrong one wrong. And the library, %d questions: %d units closed up, %d spaced out and\n' +
  '     %d keypad spellings marked right; %d numbers in front of an expression, %d roots and multiples\n' +
  '     of π with what their cell does not name, %d numbers with a power and %d rates in another unit\n' +
  '     marked wrong; and a long answer marked in %d ms.',
  CASES.length, NORMS.length, ROWS.length, LIB.length, lib.glued, lib.spaced, lib.keyed, lib.front,
  lib.root, lib.power, lib.compound, took);
