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
  ['2', '2 × 3 × 3 × 5', false, 'the first prime alone — `x 3 x 3 x 5` read as a unit after the 2, so this passed'],
  ['6.3', '6.3 x 10^7', false, 'and the number without its power of ten, the same way'],
  ['2x+3', '2 × 3', false, 'an x that is the letter is never folded: `2x` has no number after it'],

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

if (bad) {
  console.log('\n%d of %d marking cases wrong. Every one of these is a child being told the wrong\n' +
    'thing about their own work, so this fails the build.', bad, CASES.length);
  process.exit(1);
}
console.log('OK — all %d marking cases: a right answer is marked right, a wrong one wrong.',
  CASES.length);
