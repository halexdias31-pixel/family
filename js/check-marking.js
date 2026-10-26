#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-marking.js DOES THE MARKER SAY YES TO A RIGHT ANSWER AND NO TO A WRONG ONE. § */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'find.js'), 'utf8');

/* CUT BY NAME, BRACE-COUNTED, AND THE CUTTER IS `check-marks-load.js` — one extractor, because other checks need the same functions to ask different questions of § */
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
  /* A READING OFF THE PROTRACTOR OR RULER (385), inside the scheme's band and out of it */
  ['67', '65 to 69', true, 'June 2024 Foundation 2, Q7(b): the angle read off the protractor'],
  ['67°', '65 to 69', true, 'with its degree sign'],
  ['65', '65 to 69', true, 'the band includes its ends'],
  ['70', '65 to 69', false, 'one degree past the band'],
  ['8.7', '8.5 to 8.9 cm', true, 'Q7(a): the length off the ruler'],
  ['8.7 cm', '8.5 to 8.9 cm', true, 'with its unit'],
  ['87 mm', '8.5 to 8.9 cm', false, 'in millimetres the scheme does not print -- marked wrong, the unit is the scheme\'s'],
  ['9.1', '8.5 to 8.9 cm', false, 'past the band'],
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
  /* A UNIT IS NOT A LIST OF ALTERNATIVES. § */
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
  /* A BAND THE SCHEME PRINTS TAKES EVERY NUMBER IN IT. § */
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

  /* ---------- A RATIO, WHICH NOTHING IN THIS LIBRARY COULD MARK UNTIL THE COLON FOLDED § */
  ['2:3', '2 : 3', true, 'Q10 of June 2024 Foundation, typed the way a child types it'],
  ['2 : 3', '2 : 3', true, 'and the way the mark scheme prints it'],
  ['2 :3', '2 : 3', true, 'and with the spacing somebody actually manages on a phone'],
  ['3:2', '2 : 3', false, 'the other way round is a different ratio'],
  ['6:9', '2 : 3', false, 'and an uncancelled one fails a question asking for simplest form'],
  ['2/3', '2 : 3', false, 'a ratio is not the fraction its two numbers make'],

  /* ---------- AN ACCEPTED BAND WRITTEN WITH A DASH, WHICH NO CASE HERE HAD § */
  ['1.75', '1.5\u20132 metres', true, 'the middle of a band written with an EN dash'],
  ['1.5', '1.5\u20132 metres', true, 'its bottom end'],
  ['2', '1.5\u20132 metres', true, 'its top end'],
  ['2.1', '1.5\u20132 metres', false, 'and over is still over'],
  ['1.75', '1.5\u20142 metres', true, 'and the same band written with an EM dash'],
  /* NOTHING TYPED IS NOT A WRONG ANSWER */
  /* ---------- A SPACE ROUND AN OPERATOR, WHICH IS THE RATIO RULE ONE CLASS OF CHARACTER ALONG § */
  ['4n-3', '4n \u2212 3', true, 'Q20 of June 2024 Foundation, typed the way a child types it'],
  ['4n - 3', '4n \u2212 3', true, 'and with the spaces the scheme prints'],
  ['3(2x-5)', '3(2x \u2212 5)', true, 'a factorised expression closed up'],
  ['5x+2y', '5x + 2y', true, 'and a sum'],
  ['2\u00d73\u00d73\u00d75', '2 \u00d7 3 \u00d7 3 \u00d7 5', true, 'a product of primes'],
  ['4n+1', '4n \u2212 3', false, 'the common slip off the first term is still wrong'],
  ['4x-3', '4n \u2212 3', false, 'and so is the wrong letter'],
  /* THE ONE THING THIS MUST NOT DO, and the fraction rule above names it: § */
  ['1 1/6', '11/6', false, 'a mixed number must not fold onto the improper fraction'],
  ['11/6', '1 1/6', false, 'and not the other way round either'],

  /* ---------- A SIGN NO PHONE KEYBOARD HAS § */
  ['x<=-4', 'x \u2264 \u22124', true, 'Q28 of June 2024 Foundation, with the keyboard\'s own operator'],
  ['x \u2264 -4', 'x \u2264 \u22124', true, 'and with the sign, if they can find it'],
  ['x>=-4', 'x \u2264 \u22124', false, 'the wrong way round is a different answer'],
  ['x=-4', 'x \u2264 \u22124', false, 'and an equation is not an inequality'],
  ['100<w<=150', '100 < w \u2264 150', true, 'a grouped-data class, typed'],

  /* ---------- WHAT THE MATHS KEYPAD WRITES § */
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

  /* ---------- A ROOT UNDER THE LINE, OFF THE KEYPAD § */
  ['1/(√(2))', '1/√2', true, 'sin 45° off the keypad: 1, the fraction key, √, 2'],
  ['(1)/(√(2))', '1/√2', true, 'and begun with the fraction key'],
  ['1/(√(3))', '√3/3 | 1/√3', true, 'tan 30° the same way'],
  ['(√(3))/(2)', '√3/2', true, 'and a root on TOP begun with the fraction key, which kept its bracket too'],
  ['1/(√(3))', '1/√2', false, 'a different root is still a different answer'],
  ['2/(√(2))', '1/√2', false, 'and so is a different numerator'],
  ['(√(2)+1)/(2)', '√2/2', false, 'a bracket holding a root AND more is still more than one term'],

  /* ---------- `root`, THE THIRD SPELLING OF √ § */
  ['root 3/2', '√3/2 | sqrt3/2 | sqrt(3)/2 | (√3)/2', true, 'sin 60° typed out with the space a person puts in'],
  ['root3', '√3', true, 'run together'],
  ['root(3)', '√3', true, 'and bracketed the way sqrt(3) is'],
  ['root 2', '√3', false, 'the wrong root is still wrong'],
  ['10', '10 root 2 cm', false, 'the 10 of 10√2 — `root 2 cm` read as a UNIT after it, so this passed'],
  /* AND THE SAME CELL REFUSED ITS OWN ANSWER. § */
  ['10√(2)', '10 root 2 cm', true, 'June 2023 Q16 off the keypad: 1, 0, √, 2'],
  ['10√2 cm', '10 root 2 cm', true, 'and with the unit'],
  ['10√2cm', '10 root 2 cm', true, 'and the unit closed up'],
  ['√2', '10 root 2 cm', false, 'the root without its 10 is still wrong'],
  ['10√2 m', '10 root 2 cm', false, 'and a different unit is a different answer'],

  /* ---------- A UNIT GLUED TO A ROOT, OR TO A MULTIPLE OF π § */
  ['√3cm', '√3 | sqrt3 | sqrt(3) | √3 cm', true, 'exact-trig Q17, the unit closed up'],
  ['√(3)cm', '√3 | sqrt3 | sqrt(3) | √3 cm', true, 'and off the keypad, then `cm` on the abc keys'],
  ['sqrt3cm', '√3 | sqrt3 | sqrt(3) | √3 cm', true, 'and the root spelled out'],
  ['√3', '√3 cm', true, 'the root without its unit, which is the sentence and not the answer'],
  ['√3 m', '√3 cm', false, 'a different unit on a root is a different answer'],
  ['√2cm', '√3 | √3 cm', false, 'and a different root with the right unit is still wrong'],
  ['48πcm²', '48π | 48pi | 48 pi | 48π cm²', true, 'a sector’s area, the unit closed up after π'],
  ['48 π', '48π', true, 'and the space a person leaves before π'],

  /* ---------- AND ONLY THE UNIT ITS CELL NAMES § */
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

  /* ---------- `*` AND A LETTER `x` BETWEEN NUMBERS ARE `×` § */
  ['2^3 * 11', '2^3 × 11 | 2 × 2 × 2 × 11', true, '88 as a product of primes, with the spaces round the asterisk'],
  ['2 * 2 * 2 * 11', '2^3 × 11 | 2 × 2 × 2 × 11', true, 'and written out'],
  ['2^3 *11', '2^3 × 11', true, 'with the spacing somebody manages on a phone'],
  ['2^3 x11', '2^3 × 11', true, 'the letter x for times'],
  ['2³ x 11', '2³ × 11', true, 'after a superscript power'],
  ['2^(3) x 11', '2^3 × 11', true, 'the keypad’s power, then the letter'],
  ['3.42 x 10^7', '3.42 × 10^7', true, 'standard form with the letter'],
  ['2^3 * 13', '2^3 × 11', false, 'a different prime is still wrong'],
  /* THE CELL IS WRITTEN WITH THE LETTER, because that is the hole. § */
  ['2', '2 x 3 x 3 x 5', false, 'the first prime alone — `x 3 x 3 x 5` read as a unit after the 2, so this passed'],
  ['6.3', '6.3 x 10^7', false, 'and the number without its power of ten, the same way'],

  /* ---------- A UNIT WITH A CARET, AND THE POWER IS PART OF THE UNIT § */
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
  /* A COMPOUND UNIT CLOSED UP was "Not yet" on every speed and density in the library: § */
  ['12km/h', '12 km/h', true, 'June 2024 Foundation Q14(a), the unit closed up'],
  ['1.01g/cm3', '1.01 g/cm^3', true, 'a density, its power spelled the other way'],
  ['12km/minute', '12 km/h', false, 'a different rate is a different unit'],
  /* A COMPOUND CAME OFF IN ROUND 2 TOO, AND TOOK THE SAME GENEROSITY: § */
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

  /* ---------- THE SPACE BETWEEN A NUMBER AND ITS LETTERS § */
  ['185 p', '1.85 | 185p', true, 'KS2 2019 Paper 3 Q16: pence with the space a child puts in'],
  ['12 p', '12p', true, 'the smallest case of it'],
  ['7 m', '7m', true, '"simplify 9m − 2m", spaced'],
  ['3 a', '3a | a3', true, 'June 2024 Foundation Q4, spaced'],
  ['6 cd', '6cd | 6dc', true, 'a product of two letters, spaced'],
  ['10 xy', '10xy | 10yx', true, 'and another'],
  ['6 w²', '6w^2 | 6w² | 6w2', true, 'and a letter with a power'],
  ['75 g, 180 g, 300 g', '180g, 300g, 75g', true, 'and every part of a list, in another order'],

  /* ---------- THE NUMBER IN FRONT OF AN EXPRESSION IS NOT THE ANSWER § */
  ['6', '6w^2 - 10w|6w^2-10w|6w² − 10w|6w²-10w', false, 'Corbettmaths 30 June Q3: the 6 of 6w² − 10w'],
  ['4', '4n − 1', false, 'the 4 of an nth term'],
  ['2', 'y = 3⁄2x + 3 | y = 1.5x + 3 | 2y = 3x + 6', false, 'the 2 of an equation of a line'],
  ['93.5', '93.5 ≤ length < 94.5 | 93.5 m ≤ length < 94.5 m', false, 'the bottom of an error interval is not the interval'],
  ['2', '2 hours 45 minutes | 2h 45m', false, 'and the hours are not the time'],
  ['5', '5 minutes past 4 | 5 past 4 | 4:05', false, 'nor the minutes'],
  ['42', '42, 70, 15 | 42 days, 70 days and 15 weeks', false, 'nor the first of three'],
  /* A SINGLE LETTER IS ALGEBRA UNLESS IT IS A UNIT, AND GLUED TO A NUMBER IT IS NEVER TAKEN FOR ONE. § */
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

  /* ---------- AN ALGEBRAIC FRACTION, OFF THE KEYPAD § */
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
  /* A COMPARISON SIGN IS NOT A TAG, AND AN ENTITY IS THE CHARACTER IT NAMES. Both were thrown away,
     so the inequality-signs sheet and every `&pound;` accept could never mark right. */
  ['<', '&lt; | <', true, 'the sign a child types for "less than"'],
  ['4 < 7', '4 &lt; 7 | 4 < 7', true, 'a whole comparison, sign kept'],
  ['4 > 7', '4 < 7', false, 'and the wrong sign is still wrong'],
  ['£5.20', '&pound;5.20', true, 'money in the cell the way the library spells it'],
  ['5.20', '&pound;5.20', true, 'and without the pound sign'],
];

let bad = 0;
CASES.forEach(([typed, accept, want, why]) => {
  const got = markAnswer_(typed, accept);
  if (got === want) return;
  bad++;
  console.log('  %j against %j — marked %s, should be %s   (%s)',
    typed, accept, String(got), String(want), why);
});

/* ---------- WHAT `markNorm_` ITSELF WRITES § */
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

/* ---------- THE WHOLE LIBRARY, MARKED § */
const LIB = require('../check/lib-full.js').rows('questions')
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
  const ways = String(r.accept).split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
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

/* ---------- THE ROWS THESE FAULTS WERE FOUND ON, AS THE LIBRARY HOLDS THEM TODAY § */
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

/* ---------- AN ORDERING IS MARKED BY ITS ORDER § */
const { cutFrom } = require('./check-marks-load.js');
const orderSrc = cutFrom(src, 'markOrder_');
if (!orderSrc) {
  console.log('check-marking: cannot find markOrder_ in find.js — renamed? No ordering was marked.');
  process.exit(1);
}
eval(orderSrc);
const Q4 = '3,4,5,2,1';   /* June 2024 1F Q4: 0.21 0.2 0.03 0.1 0.16, smallest first */
const ORDERS = [
  ['3,4,5,2,1', Q4, true, 'June 2024 1F Q4, smallest first: 0.03, 0.1, 0.16, 0.2, 0.21'],
  ['1,2,5,4,3', Q4, false, 'the same row reversed, largest under "smallest"'],
  ['4,3,5,2,1', Q4, false, 'one swap at the front: 0.1 before 0.03'],
  ['3,4,2,5,1', Q4, false, 'one swap in the middle: 0.2 before 0.16, the trap the question sets'],
  ['3,4,5,1,2', Q4, false, 'one swap at the end'],
  ['1,2,3,4,5', Q4, false, 'the paper’s own order, untouched — what the set-marker passed'],
  ['3,4,5,2', Q4, null, 'four of five placed is not an answer yet'],
  ['3,,5,2,1', Q4, null, 'nor is a row with a hole in it'],
  ['', Q4, null, 'nor an empty row'],
  ['3,4,5,2,1', '', null, 'and with no right order there is nothing to mark against'],
  ['1,2,3', '2,1,3 | 1,2,3', true, 'two equal values: the second order the scheme allows'],
  ['2,1,3', '2,1,3 | 1,2,3', true, 'and the first'],
  ['3,1,2', '2,1,3 | 1,2,3', false, 'and not a third'],
  ['3,4,5,2,1', [[3, 4, 5, 2, 1]], true, 'the loader’s arrays (`choiceWays`)'],
  ['2,1,3', [[2, 1, 3], [1, 2, 3]], true, 'and its alternatives'],
  ['3,4,5,2,1', ' 3, 4, 5, 2, 1 ', true, 'a cell written with spaces'],
];
let orderBad = 0;
ORDERS.forEach(([seq, ways, want, why]) => {
  const got = markOrder_(seq, ways);
  if (got === want) return;
  orderBad++;
  console.log('  markOrder_(%j, %j) — marked %s, should be %s   (%s)', seq, ways, String(got), String(want), why);
});
/* EVERY ORDERING IN THE LIBRARY, three ways: § */
const ORDER_ROWS = require('../check/lib-full.js').rows('questions')
  .filter(r => r && r.kind === 'question' && String(r.answer_type || '').trim() === 'order');
const orderLib = { ways: 0, wrong: 0, bad: [] };
ORDER_ROWS.forEach(r => {
  const ways = String(r.choice_right || '').split('|').map(w => w.split(',').map(t => t.trim()).join(',')).filter(Boolean);
  ways.forEach(w => {
    orderLib.ways++;
    if (markOrder_(w, r.choice_right) !== true) orderLib.bad.push(r.row_id + ': its own order ' + w + ' is marked ' + markOrder_(w, r.choice_right));
    const p = w.split(',');
    const tries = [p.slice().reverse()];
    for (let i = 0; i + 1 < p.length; i++) { const s = p.slice(); [s[i], s[i + 1]] = [s[i + 1], s[i]]; tries.push(s); }
    tries.map(t => t.join(',')).filter(t => ways.indexOf(t) === -1).forEach(t => {
      orderLib.wrong++;
      if (markOrder_(t, r.choice_right) !== false) orderLib.bad.push(r.row_id + ': ' + t + ', not an order its cell lists, is marked ' + markOrder_(t, r.choice_right));
    });
  });
});
orderLib.bad.slice(0, 20).forEach(x => console.log('  ' + x));

/* ---------- A TYPED LIST UNDER THE SAME KEY IS NOT A ROW § */
const seqSrc = cutFrom(src, 'orderSeq_');
if (!seqSrc) {
  console.log('check-marking: cannot find orderSeq_ in find.js — renamed? No stored row was read back.');
  process.exit(1);
}
eval(seqSrc);
const SEQS = [
  ['3,4,5,2,1', 5, [3, 4, 5, 2, 1], 'a whole row, as `orderSay_` writes it'],
  ['3,,5', 5, [3, 0, 5, 0, 0], 'a row with a hole, and nothing after the last placed item'],
  ['', 5, [0, 0, 0, 0, 0], 'nothing stored'],
  [' 3, 4 ', 5, [3, 4, 0, 0, 0], 'spaces round the numbers'],
  ['-3, -1, 2, 4, 7', 5, [0, 0, 0, 0, 0], '2406-2F-1 typed before it was an ordering — drew `_ _ −3 2 _`'],
  ['3/5, 65%, 2/3, 0.68, 7/10', 5, [0, 0, 0, 0, 0], '0617-5 typed — drew `0.68 _ 7/10 _ _`'],
  ['1, 3, 4, 5', 4, [0, 0, 0, 0], '0603-1 typed as values — every piece a whole number, but 5 is past the 4 items'],
  ['0.45, 0.59, 0.88, 1.24, 1.34', 5, [0, 0, 0, 0, 0], 'ordering-decimals-2 typed — put 0.59 in slot 4'],
  ['3,3', 5, [0, 0, 0, 0, 0], 'an item twice is not a row this app wrote'],
  ['0,1', 5, [0, 0, 0, 0, 0], 'nor a place numbered 0'],
  ['1,2,3,4,5,6', 5, [0, 0, 0, 0, 0], 'nor more places than items'],
  ['A, B, C, D', 4, [0, 0, 0, 0], 'nor letters'],
];
let seqBad = 0;
SEQS.forEach(([v, n, want, why]) => {
  const got = orderSeq_(v, n);
  if (JSON.stringify(got) === JSON.stringify(want)) return;
  seqBad++;
  console.log('  orderSeq_(%j, %d) — drew %j, should be %j   (%s)', v, n, got, want, why);
});
const seqLib = { swept: 0, bad: [] };
ORDER_ROWS.forEach(r => {
  const head = /<b>([\s\S]*?)<\/b>/.exec(String(r.answer || ''));
  if (!head) return;
  const n = String(r.choices || '').split('|').filter(t => t.trim()).length;
  const typed = head[1].replace(/<[^>]*>/g, '');
  seqLib.swept++;
  const got = orderSeq_(typed, n);
  if (got.some(Boolean)) seqLib.bad.push(r.row_id + ': its answer typed out, "' + typed + '", draws the strip ' + JSON.stringify(got) + ' — a row nobody made');
});
seqLib.bad.slice(0, 20).forEach(x => console.log('  ' + x));

/* ---------- AND IN TIME § */
const SLOW = '5 because the triangles are much bigger?';
const t0 = Date.now();
markAnswer_(SLOW, '5');
const took = Date.now() - t0;
const slow = took > 400;
if (slow) console.log('  marking %j took %d ms — a unit is being read more than one way again', SLOW, took);

/* ---------- BY RULE: KEY WORDS MARK A SHORT WORDED ANSWER, A MARK A POINT (docs/history/359) ---------- */
const MW_NAMES = ['MW_STOP', 'mwStem_', 'mwToks_', 'mwNum_', 'mwShapes_', 'mwHas_', 'markWords_', 'cellsOf_', 'markCells_'];
const mwSrc = MW_NAMES.map(n => cutFrom(src, n));
let mwBad = 0;
const MW = [
  /* typed, rule, wanted marks, why */
  ['It is an underestimate because both numbers were rounded down', 'underestimate ; rounded+down | round+down', 2, 'both points, in other words than the scheme'],
  ['underestimate', 'underestimate ; rounded+down | round+down', 1, 'the answer without its reason is one mark of two'],
  ['an overestimate since they were rounded up', 'underestimate ; rounded+down | round+down', 0, 'the opposite answer scores nothing'],
  ['A placebo', 'placebo', 1, 'one word, one mark'],
  ['placebos', 'placebo', 1, 'a plural is the same word'],
  ['it is not a placebo', 'placebo', 0, 'a word straight after "not" does not count'],
  ['Negative correlation', 'negative+correlation', 1, 'all-of: both words'],
  ['there is correlation', 'negative+correlation', 0, 'one of two all-of words is not the mark'],
  ['the bromine water turns colourless', 'colourless | decolourised | decolorised', 1, 'any-of, a synonym'],
  ['it was decolourised', 'colourless | decolourised | decolorised', 1, 'and the other spelling of it'],
  ['56 ways', '56', 1, 'a number with its unit'],
  ['1,905 metres', '1905', 1, 'a number with its thousands comma'],
  ['55 ways', '56', 0, 'a different number is wrong'],
  ['gravitational potential energy', 'gravitational potential', 1, 'a phrase, in order'],
  ['potential gravitational', 'gravitational potential', 0, 'and out of order it is not the phrase'],
  ['', 'placebo', null, 'nothing typed is not a wrong answer'],
  ['No. The powers of 10 come first', 'no ; powers', 2, 'an opening No with its full stop is the verdict, not a negation of the next word'],
  ['No placebo was given', 'placebo', 0, 'but a No inside the sentence still negates'],
  /* A TRANSFORMATION DESCRIBED FULLY (385): the word, and the vector, line or centre read with its signs */
  ['Translate triangle A (5/-4)', 'translation|translate|translated; (5,-4)', 2, 'Theo\'s answer: the vector as 5 over -4'],
  ['Translation \u27ee5,\u22124\u27ef', 'translation|translate|translated; (5,-4)', 2, 'the keypad\'s column vector'],
  ['translated 5 right and 4 down', 'translation|translate|translated; (5,-4)', 2, 'the vector in words'],
  ['Translation (5, 4)', 'translation|translate|translated; (5,-4)', 1, 'the wrong sign is not the vector'],
  ['Reflection (5,-4)', 'translation|translate|translated; (5,-4)', 1, 'the wrong transformation is not the word'],
  ['reflect in y = \u2212x', 'reflection|reflect; y=-x', 2, 'a line with its sign'],
  ['reflect in y = x', 'reflection|reflect; y=-x', 1, 'and without it, another line'],
  ['reflection in the x-axis', 'reflection|reflect; y=0', 2, 'the x-axis is y = 0'],
  ['rotate 90 clockwise about (-4, 1)', 'rotation|rotate; 90+clockwise; (-4,1)', 3, 'a rotation\'s three marks'],
  ['rotation 90 clockwise about (4, 1)', 'rotation|rotate; 90+clockwise; (-4,1)', 2, 'a centre with a lost sign'],
];
if (mwSrc.some(x => !x)) { console.log('check-marking: cannot find ' + MW_NAMES.filter((n, i) => !mwSrc[i]).join(', ') + ' in find.js — renamed?'); process.exit(1); }
eval(mwSrc.join('\n'));
MW.forEach(([typed, rule, want, why]) => {
  const m = markWords_(typed, rule), got = m ? m.got : null;
  if (got !== want) { mwBad++; console.log('  WRONG  markWords_(%j, %j) gave %j, wanted %j — %s', typed, rule, got, want, why); }
});
/* AND A FILL-IN TABLE'S CELLS, each marked on its own. */
const cellsGot = markCells_(['6', '7', ''], cellsOf_({ cells: '- ; 6 ; 6 | six ; 9' }).slice(1));
if (cellsGot.right !== 1 || cellsGot.of !== 3 || cellsGot.each[1] !== false || cellsGot.each[2] !== null) { mwBad++; console.log('  WRONG  markCells_ gave %j', cellsGot); }
const cellsAll = markCells_(['x', '6', 'six', '9'], cellsOf_({ cells: '- ; 6 ; 6 | six ; 9' }));
if (cellsAll.right !== 3 || cellsAll.of !== 3) { mwBad++; console.log('  WRONG  a full table with its corner not asked gave %j', cellsAll); }
/* EVERY RULE IN THE LIBRARY GIVES FULL MARKS TO ITS OWN SCHEME'S HEADLINE -- a rule its own answer fails is a wrong rule. */
const mwLib = require('../check/lib-full.js').rows('questions').filter(r => String(r.mark_words || '').trim());
mwLib.forEach(r => {
  const head = String(r.answer || '').replace(/&minus;/g, '-').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ');
  const m = markWords_(head, r.mark_words);
  if (!m || m.got < m.of) { mwBad++; console.log('  WRONG  %s: its own scheme scores %j against mark_words %j', r.row_id, m, r.mark_words); }
});
/* AND A `rule:` WAY (360): the numbers typed tested, not matched. typed, accept, wanted, why. */
const RULES = [
  ['1, 100, 2, 50, 4, 25', 'rule: count 6, distinct, pairs prod 100', true, 'a net\u2019s opposite faces, in pairs, each making 100 (366)'],
  ['1, 100, 2, 50, 4, 26', 'rule: count 6, distinct, pairs prod 100', false, 'one pair making 104'],
  ['10, 10, 2, 50, 4, 25', 'rule: count 6, distinct, pairs prod 100', false, 'ten twice is not six different numbers'],
  ['4, 12, 18', 'rule: count 3, distinct, each factor 36, sum 31..34', true, 'three factors of 36 adding to 34'],
  ['4, 12, 19', 'rule: count 3, distinct, each factor 36, sum 31..34', false, '19 is not a factor'],
  ['6, 12, 18', 'rule: count 3, distinct, each factor 36, sum 31..34', false, 'they add to 36, past the band'],
  ['1/20 + 3/10 + 1/2', 'rule: count 3, distinct, sum 17/20', true, 'fractions summed as values'],
  ['6/10, 6/10, 9/15', 'rule: count 3, distinct, each eq 3/5', false, 'the same fraction twice is not three'],
  ['£2, £1, 20p and 1p', 'rule: sum 3.21, from 2/1/1/1/50p/50p/20p/10p/5p/2p/1p/1p/1p/1p/1p', true, 'coins in pounds and pence'],
  ['£2, £2, 20p and 1p', 'rule: sum 3.21, from 2/1/1/1/50p/50p/20p/10p/5p/2p/1p/1p/1p/1p/1p', false, 'a coin there is only one of, used twice'],
  ['150 and 154', 'rule: count 2, diff 4, rounddiff 100 100', false, 'both round to 200'],
  ['-4 and 1', 'rule: count 2, sum -3, diff 5', true, 'a negative number'],
  ['2 1/3', 'rule: count 1, mixed, each eq 7/3', true, 'a mixed number'],
  ['7/3', 'rule: count 1, mixed, each eq 7/3', false, 'the top-heavy fraction is not the mixed number asked for'],
  ['14', 'rule: count 1, each mult 2 notmult 7 over 0', false, 'a multiple of 7 too'],
  ['3/40', 'rule: count 1, lowest, each eq 3/40', true, 'the simplest form asked for (439)'],
  ['75/1000', 'rule: count 1, lowest, each eq 3/40', false, 'the same value, not simplified'],
  ['0.075', 'rule: count 1, lowest, each eq 3/40', false, 'a decimal where a fraction is asked for'],
  ['2 2/3', 'rule: count 1, lowest, each eq 8/3', true, 'a mixed number in its lowest terms'],
  ['2 4/6', 'rule: count 1, lowest, each eq 8/3', false, 'a mixed number not simplified'],
  ['564000', 'rule: count 1, digits ##4###, once 4', true, 'six digits, 4 the thousands digit and the only 4 (439)'],
  ['104 567', 'rule: count 1, digits ##4###, once 4', true, 'a thousands space is still one number'],
  ['444000', 'rule: count 1, digits ##4###, once 4', false, 'a 4 used more than once'],
  ['54000', 'rule: count 1, digits ##4###, once 4', false, 'five digits, so the 4 is not the thousands digit'],
  ['064000', 'rule: count 1, digits ##4###, once 4', false, 'a leading 0 does not make six digits'],
  ['560400', 'rule: count 1, digits ##4###, once 4', false, 'the 4 in the hundreds place'],
  ['Head and 2, H1', 'rule: set head~h+1/head+2', true, 'a list of pairs, in any order, a word or its letter'],
  ['Head and 2', 'rule: set head~h+1/head+2', false, 'a list with one missing'],
  ["HHH, HHT, HTH, HTT, THH, THT, TTH, TTT", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", true, "three coins: the eight outcomes (454)"],
  ["TTT, HHH, THT, HTH, TTH, HHT, THH, HTT", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", true, "the outcomes in any order"],
  ["H H H, H H T, H T H, H T T, T H H, T H T, T T H, T T T", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", true, "letters spaced"],
  ["HHH HHT HTH HTT THH THT TTH TTT", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", true, "no commas"],
  ["H,H,H, H,H,T, H,T,H, H,T,T, T,H,H, T,H,T, T,T,H, T,T,T", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", true, "each letter comma-separated"],
  ["hhh, hht, hth, htt, thh, tht, tth, ttt", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", true, "lower case"],
  ["heads heads heads, heads heads tails, heads tails heads, heads tails tails, tails heads heads, tails heads tails, tails tails heads, tails tails tails", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", true, "words"],
  ["HHH, HHT, HTH, HTT, THH, THT, TTH", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", false, "one missing"],
  ["HHH, HHT, HTH, HTT, THH, THT, TTH, TTT, HHH", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", false, "a repeat"],
  ["HHH, HHT, HHT, HTT, THH, THT, TTH, TTT", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", false, "a repeat in place of HTH"],
  ["HHH, HHT, HTT, TTT", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", false, "the four ignoring order"],
  ["HHX, HHT, HTH, HTT, THH, THT, TTH, TTT", "rule: set hhh/hht/hth/htt/thh/tht/tth/ttt, spell h~heads~head t~tails~tail", false, "a letter that is not H or T"],
  ['Soup and Chicken, Beef and Soup', 'rule: set soup+chicken/soup+beef', true, 'each pair either way round'],
  ['', 'rule: count 1', null, 'nothing typed is not a wrong answer'],
  ['35, 28', 'rule: count 2, hcf 7, at 1 mult 5, at 2 even', true, 'another pair with HCF 7, m a multiple of 5, n even'],
  ['35, 70', 'rule: count 2, hcf 7, at 1 mult 5, at 2 even', false, 'their HCF is 35, not 7'],
  ['14, 35', 'rule: count 2, hcf 7, at 1 mult 5, at 2 even', false, 'the two the wrong way round'],
  /* `expr` and `eqn` (365): an algebraic answer marked by its value at sample points, not its spelling */
  ['x^2 + 7x + 12', 'rule: expr x^2+7x+12', true, 'the scheme as written'],
  ['7x + x² + 12', 'rule: expr x^2+7x+12', true, 'the terms in another order, a squared sign'],
  ['(x + 3)(x + 4)', 'rule: expr x^2+7x+12, nobracket', false, 'still in brackets where it was to be multiplied out'],
  ['x^2 + 7x + 13', 'rule: expr x^2+7x+12', false, 'one term wrong'],
  ['(f+4)/(f-3)', 'rule: expr m = (f+4)/(f-3)', true, 'the subject without its name'],
  ['m = (4 + f)/(f − 3)', 'rule: expr m = (f+4)/(f-3)', true, 'the subject named, the top turned round'],
  ['m(f - 3) = f + 4', 'rule: expr m = (f+4)/(f-3)', false, 'a true equation with the letter not yet the subject'],
  ['4y + 3x + 11 = 0', 'rule: eqn y = -3/4x - 11/4', true, 'the same line as an equation in another form'],
  ['y = -0.75x + 2.75', 'rule: eqn y = -3/4x - 11/4', false, 'a parallel line, not the line'],
  ['h = 120t^-0.5', 'rule: expr h = 120/√t', true, 'a negative power for a root underneath'],
  ['banana', 'rule: expr x^2+7x+12', false, 'words are not an expression'],
  /* 376: `parallel` and `not E` (a line parallel to M, y = 5x), `fn g` (a function, not a product), and the form `mixed` asks for */
  ['y = 5x + 1', 'rule: eqn y = 5x + 1, parallel, not y = 5x', true, 'the worked example'],
  ['5x − y + 1 = 0', 'rule: eqn y = 5x + 1, parallel, not y = 5x', true, 'another of gradient 5, rearranged'],
  ['y - 7 = 5x', 'rule: eqn y = 5x + 1, parallel, not y = 5x', true, 'another intercept'],
  ['y = 5x', 'rule: eqn y = 5x + 1, parallel, not y = 5x', false, 'M itself is not parallel to M'],
  ['2y = 10x', 'rule: eqn y = 5x + 1, parallel, not y = 5x', false, 'M itself, doubled'],
  ['y = 4x + 1', 'rule: eqn y = 5x + 1, parallel, not y = 5x', false, 'another gradient'],
  ['y = 5x^2 + 1', 'rule: eqn y = 5x + 1, parallel, not y = 5x', false, 'a curve is not a line'],
  ['x = 5', 'rule: eqn y = 5x + 1, parallel, not y = 5x', false, 'a vertical line'],
  ['y = g(−x)', 'rule: expr y = g(-x), fn g', true, 'a reflection in the y-axis'],
  ['g(-x)', 'rule: expr y = g(-x), fn g', true, 'the subject left unnamed'],
  ['y = -g(x)', 'rule: expr y = g(-x), fn g', false, 'the reflection in the x-axis, which a product would take for it'],
  ['y = g(x)', 'rule: expr y = g(-x), fn g', false, 'graph A itself'],
  ['5 3/5', '5 3/5 | rule: count 1, mixed, each eq 28/5', true, 'the mixed number asked for'],
  ['28/5', '5 3/5 | rule: count 1, mixed, each eq 28/5', false, 'the written way beside `mixed` does not let the top-heavy fraction through'],
  ['5.6', '5 3/5 | rule: count 1, mixed, each eq 28/5', false, 'nor the decimal'],
];
RULES.forEach(([typed, accept, want, why]) => {
  const got = markAnswer_(typed, accept);
  if (got !== want) { mwBad++; console.log('  WRONG  markAnswer_(%j, %j) gave %j, wanted %j — %s', typed, accept, got, want, why); }
});
/* EVERY `rule:` IN THE LIBRARY HAS A WORKED EXAMPLE IN FRONT OF IT, AND MARKS IT RIGHT BY THE RULE ALONE. */
const ruleLib = LIB.filter(r => /(^|\|)\s*rule:/i.test(r.accept));
ruleLib.forEach(r => {
  const rules = String(r.accept).split('|').filter(w => /^\s*rule:/i.test(w)).join('|');
  const eg = String(r.accept).split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  if (!eg.length) { mwBad++; console.log('  WRONG  %s: a `rule:` with no worked example in front of it to prove it', r.row_id); }
  eg.forEach(w => {
    if (markAnswer_(w, rules) !== true) { mwBad++; console.log('  WRONG  %s: its own example %j is marked wrong by %j', r.row_id, w, rules); }
  });
});
/* ONE BOX PER VALUE (362): the scheme's own list, typed a value to a box and joined as the boxes join it, is marked right. */
let boxRows = 0;
LIB.forEach(r => {
  if (!r.accept || r.cells || (r.choices && String(r.choices).trim())) return;
  const m = multiOf_(r);
  if (!m) return;
  boxRows++;
  const eg = String(r.accept).split('|').map(w => w.trim()).find(w => w && !/^rule:/i.test(w));
  if (!eg) return;
  const vals = multiVals_(eg, m);
  if (!m.grow && vals.length !== m.n) { mwBad++; console.log('  WRONG  %s: %d boxes for the %d values of %j', r.row_id, m.n, vals.length, eg); }
  if (!m.wrap && !m.labels.some(Boolean) && markAnswer_(vals, r.accept) !== true) { mwBad++; console.log('  WRONG  %s: %j typed a value to a box is marked wrong', r.row_id, vals); }
  if (markAnswer_(multiJoin_(vals, m), r.accept) !== true) { mwBad++; console.log('  WRONG  %s: the boxes joined, %j, are marked wrong', r.row_id, multiJoin_(vals, m)); }
});
if (boxRows < 100) { mwBad++; console.log('  WRONG  only %d library answers get a box per value — multiOf_ has stopped reading them', boxRows); }
if (mwBad) { console.log('\n%d rule-marking cases wrong — a short worded answer is being marked wrongly without AI.', mwBad); process.exit(1); }
console.log('rule marking: %d key-word cases, the cells, %d library rules each scoring its own scheme in full; %d `rule:` cases and %d library rules', MW.length, mwLib.length, RULES.length, ruleLib.length);

/* ---------- A DRAWN ANSWER MARKED BY ITS GEOMETRY (366): every kind, a right drawing right, a near miss wrong, and the tolerance's two edges */
const cutDraw_ = require('./check-marks-load.js').cutFrom;
const DRAW_NAMES = ['PAD_GRIDS', 'padGrid_', 'drawFig_', 'drawMarker_'];
const drawSrc = DRAW_NAMES.map(n => cutDraw_(src, n));
if (drawSrc.some(x => !x)) { console.log('check-marking: cannot find ' + DRAW_NAMES.filter((n, i) => !drawSrc[i]).join(', ') + ' in find.js — the drawing marker was NOT checked'); process.exit(1); }
const DM = new Function(drawSrc.join('\n') + '\nreturn { fig: drawFig_, M: drawMarker_() };')();
/* a 16-square grid, 20 units a square, with its axes numbered -8 to 8 (the made-up "Axes" surface's shape) */
const gridSvg = (() => {
  const o = [];
  for (let v = 10; v <= 330; v += 20) o.push(`<line x1="${v}" y1="10" x2="${v}" y2="330"/><line x1="10" y1="${v}" x2="330" y2="${v}"/>`);
  for (let n = -8; n <= 8; n += 2) if (n) o.push(`<text x="${170 + n * 20}" y="182">${n}</text><text x="164" y="${170 - n * 20 + 3}">${n}</text>`);
  return `<svg viewBox="0 0 340 340">${o.join('')}</svg>`;
})();
const plainSvg = '<svg viewBox="0 0 340 340"><rect x="10" y="10" width="320" height="320"/></svg>';
const AX = DM.fig(gridSvg), PL = DM.fig(plainSvg);
/* strokes as the pen stores them, from points in the picture's units (both pictures are 340 square) */
const st = (...pls) => pls.map(pl => [].concat.apply([], pl));
const xy = (X, Y) => [170 + X * 20, 170 - Y * 20];            // a point on the axes, in their numbers
const P_ = (...pts) => pts.map(p => xy(p[0], p[1]));
const cross_ = (X, Y) => [P_([X - 0.2, Y - 0.2], [X + 0.2, Y + 0.2]), P_([X + 0.2, Y - 0.2], [X - 0.2, Y + 0.2])];
const at_ = (c, g, r) => [c[0] + r * Math.sin(g * Math.PI / 180), c[1] - r * Math.cos(g * Math.PI / 180)];
const TRI = [[1, 1], [4, 1], [1, 3]];
const DRAW = [
  /* points plotted, by a cross or a dot */
  ['pts', AX, { items: [{ k: 'pts', at: [[2, -3], [-4, 1]] }], loose: true }, st(...cross_(2, -3), ...cross_(-4, 1)), 1, 'two crosses where they belong'],
  ['pts', AX, { items: [{ k: 'pts', at: [[2, -3], [-4, 1]] }], loose: true }, st(...cross_(-3, 2), ...cross_(-4, 1)), 0, '(−3, 2) for (2, −3): across and up swapped'],
  ['pts', AX, { items: [{ k: 'pts', at: [[2, -3]] }] }, st([xy(2.25, -3)]), 1, 'a dot a quarter of a square out: inside the tolerance'],
  ['pts', AX, { items: [{ k: 'pts', at: [[2, -3]] }] }, st([xy(2.45, -3)]), 0, 'and nearly half a square out: outside it'],
  /* a shape corner for corner: a reflection, a translation */
  ['segs', AX, { items: [{ k: 'segs', poly: TRI }] }, st(P_(...TRI, TRI[0])), 1, 'the image triangle drawn in one go'],
  ['segs', AX, { items: [{ k: 'segs', poly: TRI }] }, st(P_(TRI[1], TRI[2]), P_(TRI[2], TRI[0], TRI[1])), 1, 'in two strokes, the other way round'],
  ['segs', AX, { items: [{ k: 'segs', poly: TRI }] }, st(P_([1, 1], [4, 1], [1, 4], [1, 1])), 0, 'one corner a square out'],
  ['segs', AX, { items: [{ k: 'segs', poly: TRI }] }, st(P_([1.2, 1.1], [4.1, 0.9], [0.9, 3.2], [1.2, 1.1])), 1, 'drawn a little off by hand, within 0.3 of a square'],
  ['segs', AX, { items: [{ k: 'segs', poly: TRI, m: 2, or: { k: 'segs', poly: TRI, move: 'xy', m: 1 } }] }, st(P_(...TRI, TRI[0]).map(p => [p[0] + 40, p[1]])), 1, 'the right shape in the wrong place: the scheme’s 1 of 2'],
  ['segs', AX, { items: [{ k: 'segs', poly: TRI, m: 2, or: { k: 'segs', poly: TRI, move: 'xy', m: 1 } }] }, st(P_(...TRI, TRI[0])), 2, 'and in the right place, 2 of 2'],
  ['segs', AX, { items: [{ k: 'segs', poly: TRI, turn: true, move: 'xy' }] }, st(P_([-1, -1], [-1, -4], [-3, -1], [-1, -1])), 1, 'turned and moved, where any orientation will do (a plan)'],
  /* a graph: a polyline through its points */
  ['path', AX, { items: [{ k: 'segs', path: [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]] }] }, st(P_([-2, 4], [-1.5, 2.25], [-1, 1], [-0.5, 0.25], [0, 0], [0.5, 0.25], [1, 1], [1.5, 2.25], [2, 4])), 1, 'y = x² drawn as a curve through its points'],
  ['path', AX, { items: [{ k: 'segs', path: [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]] }] }, st(P_([-2, 5], [-1, 2], [0, 1], [1, 2], [2, 5])), 0, 'the curve one square too high'],
  /* a line of symmetry, and a line that is not one */
  ['line', PL, { frame: 'vb', items: [{ k: 'line', thru: [[170, 20], [170, 300]] }] }, st([[170, 10], [171, 310]]), 1, 'the line down the middle'],
  ['line', PL, { frame: 'vb', items: [{ k: 'line', thru: [[170, 20], [170, 300]] }] }, st([[170, 10], [171, 310]], [[20, 20], [300, 300]]), 0, 'and a diagonal that is not a line of symmetry with it'],
  ['line', PL, { frame: 'vb', items: [{ k: 'line', thru: [[170, 20], [170, 300]] }] }, st([[190, 10], [190, 310]]), 0, 'a parallel line a square off the middle'],
  /* shading: how many cells, or which */
  ['cells', PL, { frame: 'vb', items: [{ k: 'cells', need: 2, rects: [[10, 10, 100, 100], [110, 10, 100, 100], [210, 10, 100, 100]] }] }, st([[20, 20], [100, 30], [20, 60], [100, 90], [30, 100]], [[220, 20], [300, 30], [220, 60], [300, 90], [230, 100]]), 1, 'two of three shaded'],
  ['cells', PL, { frame: 'vb', items: [{ k: 'cells', need: 2, rects: [[10, 10, 100, 100], [110, 10, 100, 100], [210, 10, 100, 100]] }] }, st([[20, 20], [100, 30], [20, 60], [100, 90], [30, 100]]), 0, 'one of three'],
  ['cells', PL, { frame: 'vb', items: [{ k: 'cells', set: [[1]], rects: [[10, 10, 100, 100], [110, 10, 100, 100]] }] }, st([[20, 20], [100, 30], [20, 60], [100, 90], [30, 100]]), 0, 'a cell shaded, the wrong one'],
  /* a radius and a diameter */
  ['radius', PL, { frame: 'vb', items: [{ k: 'radius', c: [170, 170], r: 100 }] }, st([[170, 170], at_([170, 170], 40, 100)]), 1, 'centre to edge'],
  ['radius', PL, { frame: 'vb', items: [{ k: 'radius', c: [170, 170], r: 100 }] }, st([[170, 170], at_([170, 170], 40, 60)]), 0, 'stopping short of the edge'],
  ['radius', PL, { frame: 'vb', items: [{ k: 'radius', c: [170, 170], r: 100, dia: true }] }, st([at_([170, 170], 40, 100), at_([170, 170], 220, 100)]), 1, 'a diameter through the centre'],
  ['radius', PL, { frame: 'vb', items: [{ k: 'radius', c: [170, 170], r: 100, dia: true }] }, st([at_([170, 170], 40, 100), at_([170, 170], 180, 100)]), 0, 'a chord that misses it'],
  /* perpendicular and parallel */
  ['dir', PL, { frame: 'vb', items: [{ k: 'dir', to: [100, 170, 240, 170], rel: 'perp', meet: true }] }, st([[170, 100], [171, 240]]), 1, 'a perpendicular crossing the line'],
  ['dir', PL, { frame: 'vb', items: [{ k: 'dir', to: [100, 170, 240, 170], rel: 'perp', meet: true }] }, st([[170, 100], [190, 240]]), 0, 'eight degrees off'],
  ['pair', PL, { frame: 'vb', items: [{ k: 'pair', rel: 'par' }] }, st([[40, 100], [300, 110]], [[40, 200], [300, 210]]), 1, 'two parallel lines'],
  ['pair', PL, { frame: 'vb', items: [{ k: 'pair', rel: 'par' }] }, st([[40, 100], [300, 110]], [[40, 200], [300, 240]]), 0, 'two lines that will meet'],
  ['dir', AX, { items: [{ k: 'dir', len: 5, ltol: 0.2 }] }, st(P_([-3, 0], [2, 0])), 1, 'a 5 cm line on a centimetre grid'],
  ['dir', AX, { items: [{ k: 'dir', len: 5, ltol: 0.2 }] }, st(P_([-3, 0], [2.5, 0])), 0, 'and one 5.5 cm long'],
  /* an angle drawn: within two degrees, as a protractor is marked */
  ['angle', PL, { frame: 'vb', items: [{ k: 'angle', deg: 40 }] }, st([[300, 280], [60, 280], at_([60, 280], 50, 200)]), 1, '40° in one stroke'],
  ['angle', PL, { frame: 'vb', items: [{ k: 'angle', deg: 40 }] }, st([[300, 280], [60, 280]], [[60, 280], at_([60, 280], 48.5, 200)]), 1, '41.5° in two: inside two degrees'],
  ['angle', PL, { frame: 'vb', items: [{ k: 'angle', deg: 40 }] }, st([[300, 280], [60, 280], at_([60, 280], 46, 200)]), 0, '44°: outside them'],
  /* a shape by its properties, wherever it is drawn */
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', n: 8 }] }, st([[170, 50], [255, 85], [290, 170], [255, 255], [170, 290], [85, 255], [50, 170], [85, 85], [170, 50]]), 1, 'an octagon'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', n: 8 }] }, st([[170, 50], [255, 85], [290, 170], [255, 255], [170, 290], [85, 255], [50, 170], [170, 50]]), 0, 'seven sides'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', n: 8 }] }, st([[170, 50], [255, 85], [290, 170], [255, 255], [170, 290], [85, 255], [50, 170], [85, 85], [150, 60]]), 0, 'eight sides left open'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'kite' }] }, st([[170, 40], [240, 120], [170, 300], [100, 120], [170, 40]]), 1, 'a kite'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'kite' }] }, st([[170, 40], [240, 120], [170, 300], [80, 160], [170, 40]]), 0, 'a quadrilateral with no equal pair'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'parallelogram' }] }, st([[60, 100], [220, 100], [280, 220], [120, 220], [60, 100]]), 1, 'a parallelogram (439)'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'parallelogram' }] }, st([[60, 100], [220, 100], [300, 220], [120, 220], [60, 100]]), 0, 'a trapezium, one pair parallel'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'scalene' }] }, st([[50, 280], [300, 280], [110, 90], [50, 280]]), 1, 'a scalene triangle'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'scalene' }] }, st([[50, 280], [290, 280], [170, 60], [50, 280]]), 0, 'an isosceles one'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'right' }] }, st([[60, 280], [280, 280], [62, 80], [60, 280]]), 1, 'a right angle drawn by hand, half a degree off'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'right' }] }, st([[60, 280], [280, 280], [90, 80], [60, 280]]), 0, 'eight degrees off'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', n: 3, sas: [6, 5, 30], sim: true }] }, st([[40, 300], [280, 300], at_([280, 300], 300, 200), [40, 300]]), 1, 'a triangle with sides 6 and 5 at 30°, at any size'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', n: 3, sas: [6, 5, 30], sim: true }] }, st([[40, 300], [280, 300], at_([280, 300], 300, 240), [40, 300]]), 0, 'with the sides equal'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'equilateral', on: { lat: [20, 20, 40, 0, 20, 34.64] } }] }, st([[60, 20], [100, 20], [80, 54.64], [60, 20]]), 1, 'an equilateral triangle on dotted paper'],
  ['polygon', PL, { frame: 'vb', items: [{ k: 'polygon', is: 'equilateral', on: { lat: [20, 20, 40, 0, 20, 34.64] } }] }, st([[60, 20], [100, 20], [80, 60], [60, 20]]), 0, 'a corner off the dots'],
  ['polygon', AX, { items: [{ k: 'polygon', n: 3, area: 18, atol: 0.5 }] }, st(P_([0, 0], [6, 0], [0, 6], [0, 0])), 1, 'a triangle of area 18 squares'],
  ['polygon', AX, { items: [{ k: 'polygon', n: 3, area: 18, atol: 0.5 }] }, st(P_([0, 0], [6, 0], [0, 5], [0, 0])), 0, 'one of 15'],
  /* a cuboid on isometric dots: its volume */
  ['cuboid', PL, { frame: 'vb', sq: 20, items: [{ k: 'cuboid', vol: 8, on: { lat: [10, 10, 17.32, 10, 0, 20] } }] }, (() => {
    const u = [17.32, 10], w = [-17.32, 10], d = [0, 20], g = (p, v, n) => [p[0] + v[0] * n, p[1] + v[1] * n];
    const T = [165.88, 40], A = g(T, u, 2), B = g(A, d, 2), C = g(B, w, 2), D = g(C, u, -2), E = g(D, d, -2);
    return st([T, A, B, C, D, E, T]);
  })(), 1, 'a 2 by 2 by 2 cuboid for a volume of 8'],
  ['cuboid', PL, { frame: 'vb', sq: 20, items: [{ k: 'cuboid', vol: 8, on: { lat: [10, 10, 17.32, 10, 0, 20] } }] }, (() => {
    const u = [17.32, 10], w = [-17.32, 10], d = [0, 20], g = (p, v, n) => [p[0] + v[0] * n, p[1] + v[1] * n];
    const T = [165.88, 40], A = g(T, u, 2), B = g(A, d, 3), C = g(B, w, 2), D = g(C, u, -2), E = g(D, d, -3);
    return st([T, A, B, C, D, E, T]);
  })(), 0, 'a 2 by 2 by 3, volume 12'],
  /* clocks, dials, scales and pie charts: the value or the angle shown */
  ['clock', PL, { frame: 'vb', items: [{ k: 'clock', c: [170, 170], r: 120, h: 5, min: 40 }] }, st([[170, 170], at_([170, 170], 240, 96)], [[170, 170], at_([170, 170], 170, 60)]), 1, 'twenty to six'],
  ['clock', PL, { frame: 'vb', items: [{ k: 'clock', c: [170, 170], r: 120, h: 5, min: 40 }] }, st([[170, 170], at_([170, 170], 240, 60)], [[170, 170], at_([170, 170], 170, 96)]), 0, 'the hands swapped'],
  ['clock', PL, { frame: 'vb', items: [{ k: 'clock', c: [170, 170], r: 120, h: 5, min: 40 }] }, st([[170, 170], at_([170, 170], 240, 96)], [[170, 170], at_([170, 170], 150, 60)]), 0, 'the hour hand on the 5, as if it did not move'],
  ['dial', PL, { frame: 'vb', items: [{ k: 'dial', c: [170, 170], r: 100, a: [0, 360], v: [0, 1000], want: 650, vtol: 10 }] }, st([[170, 170], at_([170, 170], 234, 90)]), 1, 'a pointer at 650 g'],
  ['dial', PL, { frame: 'vb', items: [{ k: 'dial', c: [170, 170], r: 100, a: [0, 360], v: [0, 1000], want: 650, vtol: 10 }] }, st([[170, 170], at_([170, 170], 241.2, 90)]), 0, 'at 670 g'],
  ['scale', PL, { frame: 'vb', items: [{ k: 'scale', a: [20, 200], b: [320, 200], v: [0, 10], want: 4, vtol: 0.25 }] }, st([[140, 150], [140, 198]]), 1, 'an arrow at 4 on a 0 to 10 line'],
  ['scale', PL, { frame: 'vb', items: [{ k: 'scale', a: [20, 200], b: [320, 200], v: [0, 10], want: 4, vtol: 0.25 }] }, st([[155, 150], [155, 198]]), 0, 'at 4.5'],
  ['pie', PL, { frame: 'vb', loose: true, items: [{ k: 'pie', c: [170, 170], r: 120, given: [0], sect: [60, 80, 220] }] }, st([[170, 170], at_([170, 170], 60, 120)], [[170, 170], at_([170, 170], 140, 120)]), 1, 'sectors of 60°, 80° and 220°'],
  ['pie', PL, { frame: 'vb', loose: true, items: [{ k: 'pie', c: [170, 170], r: 120, given: [0], sect: [60, 80, 220] }] }, st([[170, 170], at_([170, 170], 60, 120)], [[170, 170], at_([170, 170], 145, 120)]), 0, 'one sector 5° out'],
  ['pie', PL, { frame: 'vb', loose: true, items: [{ k: 'pie', c: [170, 170], r: 120, given: [0], sect: [60, 80, 220] }] }, st([[170, 170], at_([170, 170], 61.5, 120)], [[170, 170], at_([170, 170], 141.5, 120)]), 1, 'each line 1.5° out: inside two degrees'],
  /* a region shown */
  ['inside', AX, { items: [{ k: 'inside', poly: [[0, 0], [4, 0], [0, 4]] }] }, st(P_([0.5, 0.5], [1.5, 1], [0.6, 1.5], [1.2, 0.5])), 1, 'shading inside the triangle'],
  ['inside', AX, { items: [{ k: 'inside', poly: [[0, 0], [4, 0], [0, 4]] }] }, st(P_([3.5, 3.5], [4.5, 4], [3.6, 4.5], [4.2, 3.5])), 0, 'shading outside it'],
  /* a histogram bar for bar; and with no numbers up the axis, its bars' proportions */
  ['hist', AX, { items: [{ k: 'hist', x: [0, 2, 6], h: [3, 1] }] }, st(P_([0, 0], [0, 3], [2, 3], [2, 0]), P_([2, 1], [6, 1], [6, 0])), 1, 'two bars at their heights'],
  ['hist', AX, { items: [{ k: 'hist', x: [0, 2, 6], h: [3, 1] }] }, st(P_([0, 0], [0, 3], [2, 3], [2, 0]), P_([2, 2], [6, 2], [6, 0])), 0, 'the second bar a square too tall'],
  ['hist', AX, { items: [{ k: 'hist', x: [0, 2, 6], h: [3, 1], fy: true }] }, st(P_([0, 0], [0, 6], [2, 6], [2, 0]), P_([2, 2], [6, 2], [6, 0])), 1, 'twice the scale, with the scale the drawer\u2019s'],
  ['hist', AX, { items: [{ k: 'hist', x: [0, 2, 6], h: [3, 1], fy: true }] }, st(P_([0, 0], [0, 6], [2, 6], [2, 0]), P_([2, 3], [6, 3], [6, 0])), 0, 'and out of proportion'],
  ['hist', AX, { items: [{ k: 'hist', seq: [[3, 1, 2]] }] }, st(P_([1, 0], [1, 3], [2, 3], [2, 0]), P_([3, 0], [3, 1], [4, 1], [4, 0]), P_([5, 0], [5, 2], [6, 2], [6, 0])), 1, 'three bars, read left to right'],
  /* a box plot, at whatever height it is drawn */
  ['box', AX, { items: [{ k: 'box', v: [-6, -2, 0, 3, 7] }] }, st(P_([-6, 4], [-2, 4]), P_([-2, 3], [-2, 5], [3, 5], [3, 3], [-2, 3]), P_([0, 3], [0, 5]), P_([3, 4], [7, 4])), 1, 'the five values'],
  ['box', AX, { items: [{ k: 'box', v: [-6, -2, 0, 3, 7] }] }, st(P_([-6, 4], [-2, 4]), P_([-2, 3], [-2, 5], [3, 5], [3, 3], [-2, 3]), P_([1, 3], [1, 5]), P_([3, 4], [7, 4])), 0, 'the median a square out'],
  /* an inequality on a number line: the circles open and filled */
  ['interval', AX, { items: [{ k: 'interval', a: -2, b: 3, ca: true, cb: false }] }, (() => {
    const ring = (X, r) => Array.from({ length: 13 }, (_, i) => xy(X + r * Math.sin(i * Math.PI / 6), 1 + r * Math.cos(i * Math.PI / 6)));
    return st(P_([-1.7, 1], [2.7, 1]), ring(-2, 0.3), ring(-2, 0.2), ring(-2, 0.1), P_([-2.25, 1], [-1.75, 1]), P_([-2, 1.25], [-2, 0.75]), ring(3, 0.3));
  })(), 1, '\u22122 \u2264 x < 3: filled at \u22122, open at 3'],
  ['interval', AX, { items: [{ k: 'interval', a: -2, b: 3, ca: true, cb: false }] }, (() => {
    const ring = (X, r) => Array.from({ length: 13 }, (_, i) => xy(X + r * Math.sin(i * Math.PI / 6), 1 + r * Math.cos(i * Math.PI / 6)));
    return st(P_([-1.7, 1], [2.7, 1]), ring(-2, 0.3), ring(3, 0.3));
  })(), 0, 'both circles open'],
  /* the symbols of a pictogram, by their area */
  ['area', AX, { items: [{ k: 'area', in: [[-8, 8], [8, -8]], want: 2.5 }] }, st(P_([0, 0], [1, 0], [1, 1], [0, 1], [0, 0]), P_([2, 0], [3, 0], [3, 1], [2, 1], [2, 0]), P_([4, 0], [4.5, 0], [4.5, 1], [4, 1], [4, 0])), 1, 'two and a half squares'],
  ['area', AX, { items: [{ k: 'area', in: [[-8, 8], [8, -8]], want: 2.5 }] }, st(P_([0, 0], [1, 0], [1, 1], [0, 1], [0, 0]), P_([2, 0], [3, 0], [3, 1], [2, 1], [2, 0])), 0, 'two'],
  /* compass arcs by a construction */
  ['curves', PL, { frame: 'vb', items: [{ k: 'curves', n: 2, near: [170, 200], r: 80 }] }, st(Array.from({ length: 9 }, (_, i) => at_([170, 60], 150 + i * 7.5, 150)), Array.from({ length: 9 }, (_, i) => at_([170, 340], -30 + i * 7.5, 150))), 1, 'two arcs near the foot'],
  ['curves', PL, { frame: 'vb', items: [{ k: 'curves', n: 2, near: [170, 200], r: 80 }] }, st([[100, 200], [240, 200]]), 0, 'a ruled line, no arcs'],
  /* a sketch by its shape */
  ['sketch', AX, { items: [{ k: 'sketch', test: ['inc', 'above', 'crossy'] }] }, st(P_([-6, 0.1], [-3, 0.2], [-1, 0.6], [0, 1], [1, 2], [2, 4], [3, 8])), 1, 'y = 2\u02e3 rising, above the axis, crossing above the origin'],
  ['sketch', AX, { items: [{ k: 'sketch', test: ['inc', 'above', 'crossy'] }] }, st(P_([-6, -1], [-3, -0.5], [0, 1], [3, 8])), 0, 'dipping below the axis'],
  /* a vector's arrowhead; a sketch's height fitted */
  ['head', AX, { items: [{ k: 'segs', at: [[0, 0, 3, 4]], move: 'xy', head: true }] }, st(P_([1, 1], [4, 5]), P_([3.2, 4.6], [4, 5], [4.1, 4.1])), 1, 'an arrow 3 right and 4 up, anywhere'],
  ['head', AX, { items: [{ k: 'segs', at: [[0, 0, 3, 4]], move: 'xy', head: true }] }, st(P_([1, 1], [4, 5]), P_([1.6, 1.9], [1, 1], [1.9, 1.4])), 0, 'the head at the wrong end'],
  ['fity', AX, { items: [{ k: 'segs', path: Array.from({ length: 13 }, (_, i) => [i / 2 - 3, Math.sin(i * Math.PI / 6)]), fity: true }] }, st(P_(...Array.from({ length: 13 }, (_, i) => [i / 2 - 3, 3 * Math.sin(i * Math.PI / 6)]))), 1, 'a sine wave three squares high, on an axis with no numbers'],
  ['fity', AX, { items: [{ k: 'segs', path: Array.from({ length: 13 }, (_, i) => [i / 2 - 3, Math.sin(i * Math.PI / 6)]), fity: true }] }, st(P_(...Array.from({ length: 13 }, (_, i) => [i / 2 - 3, -3 * Math.sin(i * Math.PI / 6)]))), 0, 'and upside down'],
  /* nothing drawn is not a wrong answer */
  ['empty', AX, { items: [{ k: 'pts', at: [[0, 0]] }] }, [], null, 'nothing drawn'],
];
let drawBad = 0;
const drawKinds = new Set();
DRAW.forEach(([kind, fig, spec, strokes, want, why]) => {
  drawKinds.add(kind);
  const r = DM.M.mark(strokes, spec, fig);
  const got = r && r.empty ? null : r && r.got;
  if (got !== want) { drawBad++; console.log('  WRONG  %s: %s — wanted %j, got %j', kind, why, want, r); }
});
/* the frame read off the axes' numbers: (2, −3) is 2 squares right of the 0 and 3 down */
const fr = DM.M.frameOf({}, AX);
if (Math.abs(fr.o[0] - 170) > 0.5 || Math.abs(fr.o[1] - 170) > 0.5 || Math.abs(fr.u[0] - 20) > 0.01 || Math.abs(fr.u[1] + 20) > 0.01) { drawBad++; console.log('  WRONG  the axes’ numbers give the frame %j, not the origin at (170, 170) and 20 a unit', [fr.o, fr.u]); }
/* THE OWNER'S DIAL (19 Oct): Metric Units Q1a's real figure, drawn in a translated group, and a hand's line from near its centre to 450 g -- wobbly, a little off the centre, either way round */
const QROWS_ = require('../check/lib-full.js').rows('questions');
const dialRow_ = QROWS_.find(x => x.row_id === 'Q-CBM-metric-units-1'), dialFig_ = DM.fig((QROWS_.find(x => x.row_id === 'S-Q-CBM-metric-units-1') || {}).diagram);
const hand_ = (a, b, wob, n) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, w = wob * Math.sin(i * 2.1) * Math.sin(t * Math.PI); return [a[0] + (b[0] - a[0]) * t - w * (b[1] - a[1]) / 70, a[1] + (b[1] - a[1]) * t + w * (b[0] - a[0]) / 70]; });
const pen_ = (vb, pl) => [].concat.apply([], pl.map(p => [(p[0] - vb[0]) / vb[2] * 340, (p[1] - vb[1]) / vb[3] * 340]));
[[450, [173, 86], 1, 'a wobbly line from just off the centre to 450 g'], [455, [168, 82], 1, 'at 455 g, inside half a small mark'],
 [450, null, 1, 'drawn from the rim in to the centre'], [490, [171, 84], 0, 'at 490 g'], [400, [171, 84], 0, 'at 400 g']].forEach(([gr, from, want, why]) => {
  const c = [170, 84], tip = at_(c, gr * 0.36, 66), a = from || tip, b = from ? tip : [171, 85];
  const r = dialRow_ && dialFig_.vb ? DM.M.mark([pen_(dialFig_.vb, hand_(a, b, 2.5, 24))], dialRow_.draw_answer, dialFig_) : null;
  if (!r || r.got !== want) { drawBad++; console.log('  WRONG  the metric-units dial: %s -- wanted %j, got %j', why, want, r); }
});
/* THE OWNER'S TRIANGLE (20 Oct, 384): KS2 2024 Paper 2 Q1's real row and figure -- the reflection right, a copy slid across, and one reflected a square too far */
const refRow_ = QROWS_.find(x => x.row_id === 'Q-STA-KS2-2024-P2-1') || {}, refFig_ = DM.fig(refRow_.diagram || '');
const g_ = (x, y) => [14 + x * 26, 28 + (8 - y) * 26];
[[[[11, 2], [7, 2], [7, 5], [11, 2]], 1, 'the reflection, corner for corner'], [[[7, 2], [11, 2], [11, 5], [7, 2]], 0, 'a copy slid across, not flipped'],
 [[[12, 2], [8, 2], [8, 5], [12, 2]], 0, 'reflected a square too far from the line']].forEach(([pts, want, why]) => {
  const r = refFig_.vb && refRow_.draw_answer ? DM.M.mark([pen_(refFig_.vb, pts.map(p => g_(p[0], p[1])))], refRow_.draw_answer, refFig_) : null;
  if (!r || r.got !== want) { drawBad++; console.log('  WRONG  KS2 2024 P2 Q1: %s -- wanted %j, got %j', why, want, r); }
});
/* EVERY RIGHT DRAWING BY HAND: each stroke densified, wobbled by a twentieth of a square and drawn backwards still marks the same */
let handN = 0;
DRAW.forEach(([kind, fig, spec, strokes, want, why]) => {
  if (!want) return;
  const wob = strokes.map(f => { const pl = []; for (let i = 0; i + 1 < f.length; i += 2) pl.push([f[i], f[i + 1]]);
    if (pl.length < 2) return f;
    const out = [];
    pl.slice(1).forEach((q, i) => { const p = pl[i], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 4));
      for (let k = i ? 1 : 0; k <= n; k++) { const t = k / n, j = (k === 0 || k === n) ? 0 : Math.sin((out.length + 1) * 2.3); out.push([p[0] + (q[0] - p[0]) * t + j, p[1] + (q[1] - p[1]) * t + j * 0.7]); } });
    return [].concat.apply([], out.reverse()); });
  const r = DM.M.mark(wob, spec, fig); handN++;
  if (!r || r.got !== want) { drawBad++; console.log('  WRONG  %s by hand: %s -- wanted %j, got %j', kind, why, want, r); }
});
if (drawBad) { console.log('\n%d of %d drawing cases wrong — a drawn answer is being marked wrongly.', drawBad, DRAW.length); process.exit(1); }
console.log('drawings: %d cases over %d kinds, each a right drawing right and a near miss wrong; %d drawn again by a wobbly hand, backwards; the metric-units dial by hand', DRAW.length, drawKinds.size, handN);

if (bad || normBad || lib.bad.length || rowBad || slow || orderBad || orderLib.bad.length || seqBad || seqLib.bad.length) {
  console.log('\n%d of %d marking cases wrong, %d of %d markNorm_ cases, %d in the library sweep, %d of %d\n' +
    'named rows, %d of %d orderings and %d in the orderings sweep, %d of %d stored rows read back wrong and\n' +
    '%d typed answers drawn as a strip, and the long answer took %d ms. Every one of these is a child being\n' +
    'told the wrong thing about their own work, so this fails the build.',
    bad, CASES.length, normBad, NORMS.length, lib.bad.length, rowBad, ROWS.length,
    orderBad, ORDERS.length, orderLib.bad.length, seqBad, SEQS.length, seqLib.bad.length, took);
  process.exit(1);
}
console.log('OK — all %d marking cases, %d markNorm_ cases and %d named rows: a right answer is marked\n' +
  '     right, a wrong one wrong. And the library, %d questions: %d units closed up, %d spaced out and\n' +
  '     %d keypad spellings marked right; %d numbers in front of an expression, %d roots and multiples\n' +
  '     of π with what their cell does not name, %d numbers with a power and %d rates in another unit\n' +
  '     marked wrong; and a long answer marked in %d ms.\n' +
  '     Orderings: all %d cases, and the library\'s %d: %d listed orders marked right, %d\n' +
  '     reversals and single swaps marked wrong. Stored rows: all %d read back as the strip they are,\n' +
  '     and %d answers typed out as a list draw an empty strip.',
  CASES.length, NORMS.length, ROWS.length, LIB.length, lib.glued, lib.spaced, lib.keyed, lib.front,
  lib.root, lib.power, lib.compound, took, ORDERS.length, ORDER_ROWS.length, orderLib.ways, orderLib.wrong,
  SEQS.length, seqLib.swept);
