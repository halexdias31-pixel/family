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
const ORDER_ROWS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8'))
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
const MW_NAMES = ['MW_STOP', 'mwStem_', 'mwToks_', 'mwHas_', 'markWords_', 'cellsOf_', 'markCells_'];
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
const mwLib = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8')).filter(r => String(r.mark_words || '').trim());
mwLib.forEach(r => {
  const head = String(r.answer || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ');
  const m = markWords_(head, r.mark_words);
  if (!m || m.got < m.of) { mwBad++; console.log('  WRONG  %s: its own scheme scores %j against mark_words %j', r.row_id, m, r.mark_words); }
});
/* AND A `rule:` WAY (360): the numbers typed tested, not matched. typed, accept, wanted, why. */
const RULES = [
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
  ['Head and 2, H1', 'rule: set head~h+1/head+2', true, 'a list of pairs, in any order, a word or its letter'],
  ['Head and 2', 'rule: set head~h+1/head+2', false, 'a list with one missing'],
  ['Soup and Chicken, Beef and Soup', 'rule: set soup+chicken/soup+beef', true, 'each pair either way round'],
  ['', 'rule: count 1', null, 'nothing typed is not a wrong answer'],
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
if (mwBad) { console.log('\n%d rule-marking cases wrong — a short worded answer is being marked wrongly without AI.', mwBad); process.exit(1); }
console.log('rule marking: %d key-word cases, the cells, %d library rules each scoring its own scheme in full; %d `rule:` cases and %d library rules', MW.length, mwLib.length, RULES.length, ruleLib.length);

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
