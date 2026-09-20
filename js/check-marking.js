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
   `check-quizzes.js` needs the same six functions to ask a different question of them and its own
   first attempt at cutting them out could not find `markBare_`. A regex for "the body of a
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
  /* NOTHING TYPED IS NOT A WRONG ANSWER */
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
