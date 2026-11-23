#!/usr/bin/env node
/* @family. — tools/marker-cases.js THE MARKER'S KNOWN TRAPS (rule 1.75; queue 4c, 20 Nov): the one marker (js/find-marking.js
   `markAnswer_`), loaded in a vm as tools/validate-questions.js loads the app, asked each case below: a right answer that must pass, a
   wrong one that must fail. Prints "marker-cases: N/M"; any case that goes wrong fails the build. A case the marker cannot yet get right
   is listed with `known: true`, counted apart, and does not fail it; one that starts passing is reported, to drop the flag. Run by tools/build.js. */
'use strict';
const { report, main } = require('./lib/gen.js');
const VQ = require('./validate-questions.js');

/* [typed, key, right?, what it guards, known?] */
const CASES = [
  /* named values: each value with its own name, names in any order */
  ['x = 5, y = 9', 'x = 5, y = 9', true, 'named values as keyed'],
  ['y = 9, x = 5', 'x = 5, y = 9', true, 'named values, names swapped with their values'],
  ['x = 9, y = 5', 'x = 5, y = 9', false, 'swapped x/y values'],
  ['y = 5, x = 9', 'x = 5, y = 9', false, 'swapped x/y values, names reordered'],
  ['x = -4, y = 3', 'x = 3, y = -4', false, 'swapped x/y, a negative'],
  ['a = -5, b = 4', 'a = 4, b = -5 | a=4,b=-5', false, 'swapped a/b'],
  ['5, 9', 'x = 5, y = 9', true, 'unnamed values in the key\'s order'],
  ['9, 5', 'x = 5, y = 9', false, 'unnamed values out of the key\'s order'],
  /* a point keeps its order */
  ['(3, -11)', '(3, -11) | (3, −11) | (3,-11)', true, 'a point as keyed'],
  ['(-11, 3)', '(3, -11) | (3, −11) | (3,-11)', false, 'a point reversed'],
  ['-3, 0', '(0, -3) | (0,-3) | 0, -3 | 0,-3', false, 'a point reversed, no brackets'],
  ['0 -3', '(0, -3) | (0,-3)', true, 'a point typed with a space'],
  /* an ordered phrase keeps its order */
  ['X to Y', 'X to Y', true, '"X to Y" as keyed'],
  ['Y to X', 'X to Y', false, 'reversed "X to Y"'],
  ['from Y to X', 'from X to Y', false, 'reversed "from X to Y"'],
  ['kinetic to thermal', 'kinetic to thermal | kinetic energy to thermal energy', true, 'an energy transfer as keyed'],
  ['thermal to kinetic', 'kinetic to thermal | kinetic energy to thermal energy', false, 'an energy transfer reversed'],
  ['B then A', 'A then B', false, 'reversed "A then B"'],
  ['2H2O → 2H2 + O2', '2H2 + O2 → 2H2O', false, 'an equation reversed'],
  ['O2 + 2H2 → 2H2O', '2H2 + O2 → 2H2O', true, 'an equation, one side reordered', true],
  ['16.2 to 16.1', '16.1 to 16.2', true, 'a band of numbers is a band, not an order', true],
  ['16.15', '16.1 to 16.2', true, 'a value inside a band'],
  /* a set stays a set */
  ['10, 5, 2, 1', '1, 2, 5, 10', true, 'a bare list is a set'],
  ['127° and 53°', '53° and 127°', true, 'two angles in any order'],
  ['84, 28, 98', '28, 84, 98 | rule: set 28/84/98', true, 'a rule: set in any order'],
  /* "I do not know" is not an answer */
  ['I do not know', 'rule: points max 1; no~not', false, '"I do not know" against a not/no alternative'],
  ['I don\'t know', 'rule: points max 1; no~not', false, '"I don\'t know" against a not/no alternative'],
  ['no', 'rule: points max 1; no~not', true, 'a plain no'],
  ['I do not know', 'I know', false, '"I do not know" is not "I know"'],
  /* near spellings that are other words */
  ['intracellular', 'intercellular', false, 'intra- is not inter-'],
  ['intercellular', 'intercellular', true, 'inter- as keyed'],
  ['intercelular', 'intercellular', true, 'a slip in inter- still counts'],
  ['amylose', 'amylase', false, 'amylose is not amylase'],
  ['amylase', 'amylase', true, 'amylase as keyed'],
  /* alleles keep their case */
  ['tt', 'Tt', false, 'tt is not Tt'],
  ['TT', 'Tt', false, 'TT is not Tt'],
  ['Tt', 'Tt', true, 'Tt as keyed'],
  ['tT', 'Tt', true, 'tT is Tt'],
  ['TT', 'tT', false, 'TT is not tT'],
  ['tT', 'tT', true, 'tT as keyed'],
  /* genotypes: allele by allele, either order inside one, a list holds exactly the key's */
  ['IAIA, IBIB', 'IAIO, IAIB', false, 'IAIA and IBIB are not IAIO and IAIB'],
  ['IOIO, IAIB', 'IAIO, IAIB', false, 'IOIO is not IAIO'],
  ['IAIO, IAIB', 'IAIO, IAIB', true, 'ABO genotypes as keyed'],
  ['IOIA and IBIA', 'IAIO, IAIB', true, 'alleles in either order'],
  ['IAIB, IAIO', 'IAIO, IAIB', true, 'a list of genotypes in another order'],
  ['IAIO', 'IAIO, IAIB', false, 'one genotype short'],
  ['IAIO, IAIB, IOIO', 'IAIO, IAIB', false, 'one genotype too many'],
  ['iaio, iaib', 'IAIO, IAIB', false, 'genotypes keep their case'],
  ['IOIA', 'IAIO', true, 'IOIA is IAIO'],
  ['IBIO', 'IAIO', false, 'IBIO is not IAIO'],
  ['XʰXᴴ', 'XᴴXʰ', true, 'X alleles in either order'],
  ['XᴴXᴴ', 'XᴴXʰ', false, 'XᴴXᴴ is not XᴴXʰ'],
  ['XhXH', 'XᴴXʰ', false, 'allele symbols must match'],
  ['Tt, tt', 'Tt, tt', true, 'a list of letter genotypes'],
  ['TT, tt', 'Tt, tt', false, 'TT is not Tt in a list'],
  /* the n't trap: n't is a not */
  ['it doesn\'t dissolve', 'rule: points max 1; does not dissolve', true, 'doesn\'t is does not'],
  ['it doesn\'t dissolve', 'rule: points max 1; dissolves~dissolve', false, 'doesn\'t dissolve is not dissolves'],
  ['it isn\'t alive', 'rule: points max 1; alive', false, 'isn\'t alive is not alive'],
  ['doesn\'t dissolve', 'does not dissolve', true, 'doesn\'t is does not, plain key'],
  ['it isn\'t alive', 'it is alive', false, 'isn\'t alive is not "it is alive"'],
  /* a not stays in its own clause (queue 4d) */
  ['No, because 99.9% is reflected', 'rule: points max 1; 99.9%~99.9 reflected~reflect', true, '"No, because" does not negate the reason'],
  ['No. Because 99.9% is reflected', 'rule: points max 1; 99.9%~99.9 reflected~reflect', true, '"No. Because" does not negate the reason'],
  ['not, because it is reflected', 'rule: points max 1; reflected~reflect', true, 'a not before a comma stays in its clause'],
  ['it is not reflected', 'rule: points max 1; reflected~reflect', false, 'a not in its own clause still negates'],
  ['No, it is not reflected', 'rule: points max 1; reflected~reflect', false, 'a not after "No," still negates its clause'],
  /* a comma-keyed sequence marked `rule: ordered` keeps its order (queue 4d) */
  ['red, orange, yellow', 'red, orange, yellow | rule: ordered', true, 'an ordered sequence as keyed'],
  ['yellow, orange, red', 'red, orange, yellow | rule: ordered', false, 'an ordered sequence reversed'],
  ['3, 1, 2', '1, 2, 3 | rule: ordered', false, 'an ordered list of numbers shuffled'],
  ['1, 2, 3', '1, 2, 3 | rule: ordered', true, 'an ordered list of numbers as keyed'],
  ['yellow, orange, red', 'red, orange, yellow', true, 'without rule: ordered a bare list is still a set'],
  /* a read-off tolerance: the scheme's "430 years (420–440)" keyed as a range (queue, 20 Nov) */
  ['432.6', '430 | rule: count 1, sum 420..440', true, 'a value inside a range rule'],
  ['432.6 years', '430 | rule: count 1, sum 420..440', true, 'a value inside a range rule, with its unit'],
  ['445', '430 | rule: count 1, sum 420..440', false, 'a value outside a range rule'],
  /* queue 4i: a direction word across a clause word is that clause's, not a contradiction of the point */
  ['limits the fish caught so more fish survive', 'rule: points max 2; limit~fewer~less fish caught; more fish survive~reproduce', true, 'an opposite direction in the next clause does not cancel the point'],
  ['fewer fish caught so more fish survive', 'rule: points max 2; limit~fewer~less fish caught; more fish survive~reproduce', true, 'both directions, each in its clause'],
  ['more fish caught so fewer fish survive', 'rule: points max 2; limit~fewer~less fish caught; more fish survive~reproduce', false, 'both directions swapped between the clauses'],
  ['more fish are caught', 'rule: points max 1; fewer~less fish caught', false, 'the opposite direction on the point itself still cancels it'],
  /* queue 4i: one word serves every point it is part of; the very same words never two */
  ['decomposed by bacteria', 'rule: points max 2; decomposed~decayed bacteria~microbes; bacteria~microbes', true, 'bacteria is the decay point and the bacteria point'],
  ['bacteria', 'rule: points max 2; decomposed~decayed bacteria~microbes; bacteria~microbes', false, 'bacteria alone is one point, not the decay point'],
  ['microbes', 'rule: points max 2; microbes~bacteria; bacteria~microbes', false, 'one word found as the same words for two points farms nothing'],
  /* queue 4i: a comma list in a short answer scores each point it names */
  ['bacteria, fungi', 'rule: points max 2; bacteria; fungi', true, 'a list of two key words, two points'],
  ['temperature, moisture, predators', 'rule: points max 3; temperature; moisture; predators', true, 'a list of three key words, three points'],
  ['bacteria, bacteria', 'rule: points max 2; bacteria; fungi', false, 'the same item twice is one point'],
  ['viruses, bacteria', 'rule: points max 2; bacteria; fungi', false, 'a list with a wrong item'],
  ['light, water, soil', 'rule: points max 3; temperature; moisture; predators', false, 'a list of wrong items'],
  ['rotation. 180. (4, -1).', 'rule: points max 3; rotation / rotate / rotated; 180; (4, -1) / (4,-1)', true, 'a coordinate\'s comma is no list'],
  ['no and 72', 'rule: points max 1; no and 72', true, 'an "and" between a no and a number is no list'],
  /* queue 4i: a real word is not a slip of another */
  ['flatter', 'fatter', false, 'flatter is not fatter'],
  ['fatter', 'fatter', true, 'fatter as keyed'],
  ['phototrophism', 'phototropism', false, 'phototrophism is not phototropism'],
  ['phototropism', 'phototropism', true, 'phototropism as keyed'],
  ['evaparation', 'evaporation', true, 'a slip that is no word still counts'],
  ['cells', 'cell', true, 'a plural of the key is the key'],
  ['particles move from low to high concentration', 'rule: points max 1; particles high~higher to low~lower concentration', false, 'move is not more, low to high is not high to low'],
  /* queue 4i: a [2] tag anywhere in a point */
  ['the cell wall', 'rule: points max 2; cell wall [2]', true, 'a [2] at the end is the point\'s marks, not a word 2'],
  ['the cell wall 2', 'rule: points max 3; cell wall [2]; nucleus', false, 'a 2 typed is not a [2] point\'s second mark'],
  ['the cell wall and a nucleus', 'rule: points max 3; cell wall [2]; nucleus', true, 'a [2] at the end gives two marks'],
  ['the wall and a nucleus', 'rule: points max 3; [2] cell wall / [2] wall; nucleus', true, 'a [2] on each wording'],
  ['a nucleus', 'rule: points max 3; [2] cell wall / [2] wall; nucleus', false, 'a [2] point not made'],
  /* queue 4i: an ordered phrase inside a point keeps its order */
  ['particles move from high to low concentration', 'rule: points max 1; particles high~higher to low~lower concentration', true, 'high to low inside a point, as keyed'],
  ['particles spread from low to high concentration', 'rule: points max 1; particles high~higher to low~lower concentration', false, 'low to high inside a point is reversed'],
  ['kinetic energy to thermal energy', 'rule: points max 1; kinetic → thermal', true, 'an arrow inside a point, as keyed'],
  ['thermal energy to kinetic energy', 'rule: points max 1; kinetic → thermal', false, 'an arrow inside a point, reversed'],
  ['between 16.2 to 16.1', 'rule: points max 1; 16.1 to 16.2', true, 'a band of numbers inside a point is a band'],
  /* 21 Nov: a point naming two things keeps their roles (labels A-H, named substances, than) -- said the other way round with the
     direction turned over it is the same point, swapped it is not */
  ['polymer A has crosslinks', 'rule: points max 1; polymer A has crosslinks', true, 'a labelled point as keyed'],
  ['polymer a has crosslinks', 'rule: points max 1; polymer A has crosslinks', true, 'a label typed in lower case'],
  ['polymer B has crosslinks', 'rule: points max 1; polymer A has crosslinks', false, 'another label is not the key\'s label'],
  ['A is more reactive than B', 'rule: points max 1; A is more reactive than B', true, 'a labelled comparison as keyed'],
  ['A reacts more vigorously than B', 'rule: points max 1; A is more reactive than B', true, 'a labelled comparison in other words, the same roles'],
  ['B is less reactive than A', 'rule: points max 1; A is more reactive than B', true, 'a comparison turned round with its direction turned over'],
  ['B is more reactive than A', 'rule: points max 1; A is more reactive than B', false, 'a labelled comparison reversed'],
  ['A is less reactive than B', 'rule: points max 1; A is more reactive than B', false, 'a labelled comparison with its direction wrong'],
  ['zinc is less reactive than magnesium', 'rule: points max 1; magnesium more reactive than zinc', true, 'a named comparison turned round'],
  ['zinc is more reactive than magnesium', 'rule: points max 1; magnesium more reactive than zinc', false, 'a named comparison reversed'],
  ['A has crosslinks but B does not', 'rule: points max 1; A crosslinks B not', true, 'two labels in the key\'s roles'],
  ['B has crosslinks but A does not', 'rule: points max 1; A crosslinks B not', false, 'two labels swapped'],
  /* the three real questions, in generic words: Q-AQA-8462-1906-1H-076 (a direction without a than) */
  ['X forms instead because M is more reactive than X', 'substance X forms instead, because metal M is more reactive than X | rule: points max 2; x forms~formed~instead; m more~most reactive~reactivity / x less reactive', true, 'Q-AQA-8462-1906-1H-076 shape: right'],
  ['X forms because X is less reactive than M', 'substance X forms instead, because metal M is more reactive than X | rule: points max 2; x forms~formed~instead; m more~most reactive~reactivity / x less reactive', true, 'Q-AQA-8462-1906-1H-076 shape: said the other way round'],
  ['X forms because M is less reactive than X', 'substance X forms instead, because metal M is more reactive than X | rule: points max 2; x forms~formed~instead; m more~most reactive~reactivity / x less reactive', false, 'Q-AQA-8462-1906-1H-076 shape: the comparison reversed'],
  /* Q-AQA-8462-2206-1H-071: a point with no than, answered with one */
  ['P is less reactive than Q', 'metal P is less reactive than metal Q | rule: points max 2; [2] p less~lower reactive~reactivity / p below~under q', true, 'Q-AQA-8462-2206-1H-071 shape: right'],
  ['Q is more reactive than P', 'metal P is less reactive than metal Q | rule: points max 2; [2] p less~lower reactive~reactivity / p below~under q', true, 'Q-AQA-8462-2206-1H-071 shape: said the other way round'],
  ['Q is less reactive than P', 'metal P is less reactive than metal Q | rule: points max 2; [2] p less~lower reactive~reactivity / p below~under q', false, 'Q-AQA-8462-2206-1H-071 shape: the key\'s subject after the than'],
  ['P is below Q', 'metal P is less reactive than metal Q | rule: points max 2; [2] p less~lower reactive~reactivity / p below~under q', true, 'Q-AQA-8462-2206-1H-071 shape: below as keyed'],
  ['Q is below P', 'metal P is less reactive than metal Q | rule: points max 2; [2] p less~lower reactive~reactivity / p below~under q', false, 'Q-AQA-8462-2206-1H-071 shape: below reversed'],
  /* Q-AQA-8462-2011-2F-067: a way with no label is said of the label the key's answer names */
  ['polymer A has crosslinks between the chains', 'polymer A has crosslinks | rule: points max 1; has crosslinks / b no crosslinks', true, 'Q-AQA-8462-2011-2F-067 shape: right'],
  ['polymer B has no crosslinks', 'polymer A has crosslinks | rule: points max 1; has crosslinks / b no crosslinks', true, 'Q-AQA-8462-2011-2F-067 shape: the other label\'s way'],
  ['polymer B has crosslinks', 'polymer A has crosslinks | rule: points max 1; has crosslinks / b no crosslinks', false, 'Q-AQA-8462-2011-2F-067 shape: the label swapped'],
  /* a synonym of several words is written with _ (remove~get_rid water) */
  ['remove the water', 'rule: points max 1; remove~get_rid water', true, 'the one-word synonym'],
  ['get rid of the water', 'rule: points max 1; remove~get_rid water', true, 'the several-word synonym'],
  ['get the water', 'rule: points max 1; remove~get_rid water', false, 'part of a several-word synonym is not it'],
  /* `rule: standard form`: the value in standard form */
  ['8.9 × 10^8', '8.9 × 10^8 | rule: standard form', true, 'standard form as keyed'],
  ['8.9e8', '8.9 × 10^8 | rule: standard form', true, 'standard form as e-notation'],
  ['89 × 10^7', '8.9 × 10^8 | rule: standard form', false, 'the same value not in standard form'],
  ['890000000', '8.9 × 10^8 | rule: standard form', false, 'the same value as an ordinary number'],
  ['7.1 × 10^8', '8.9 × 10^8 | rule: standard form', false, 'a wrong value in standard form'],
  /* owner 23 Nov: 7/3 as a mixed number (Q-CBM-top-heavy-fractions-mixed-numbers-1), in each way a child types it or the keypad writes it */
  ['2 1/3', '2 1/3 | rule: count 1, mixed, each eq 7/3', true, '7/3 as a mixed number, typed 2 1/3'],
  ['2⅓', '2 1/3 | rule: count 1, mixed, each eq 7/3', true, '7/3 as a mixed number, typed 2⅓'],
  ['2+1/3', '2 1/3 | rule: count 1, mixed, each eq 7/3', true, '7/3 as a mixed number, typed 2+1/3'],
  ['2+ 1/3', '2 1/3 | rule: count 1, mixed, each eq 7/3', true, '7/3 as a mixed number, the box\'s 2+ 1/3'],
  ['2 (1)/(3)', '2 1/3 | rule: count 1, mixed, each eq 7/3', true, '7/3 as a mixed number, the mixed key after a number'],
  ['(2) (1)/(3)', '2 1/3 | rule: count 1, mixed, each eq 7/3', true, '7/3 as a mixed number, the mixed key\'s whole box'],
  ['7/3', '2 1/3 | rule: count 1, mixed, each eq 7/3', false, 'an improper fraction is not the mixed number asked for'],
  ['2+4/3', '2 1/3 | rule: count 1, mixed, each eq 7/3', false, 'a whole and an improper fraction is no mixed number'],
  ['3+1/3', '2 1/3 | rule: count 1, mixed, each eq 7/3', false, 'a wrong mixed number with a +'],
  ['2 2/6', '2 1/3 | rule: count 1, mixed, lowest, each eq 7/3', false, 'simplest form asked: 2 2/6 is not in lowest terms'],
  /* each form the keypad's keys write, as it writes it */
  ['(7)/(4)', '7/4', true, 'the fraction key'],
  ['x^(5)', 'x^5', true, 'the power key'],
  ['√(7)', '√7', true, 'the root key'],
  ['-4', '−4', true, 'the negative key against a key\'s minus sign'],
  ['4π', '4π', true, 'π'],
  ['3 : 5', '3:5', true, 'a ratio with spaces'],
  ['12 cm', '12cm', true, 'a unit after a space'],
  ['(3,-11)', '(3, -11) | (3,-11)', true, 'the point key'],
  ['3, -11', '(3, -11)', true, 'a point without its brackets'],
  ['(-11,3)', '(3, -11)', false, 'the point key, x and y swapped'],
  ['(-2,5)', '(-2, 5)', true, 'a point, x negative'],
  ['(1,2),(3,4)', '(1, 2), (3, 4)', true, 'two points from the point key'],
  ['8.9×10^(8)', '8.9 × 10^8 | rule: standard form', true, 'the ×10ⁿ key'],
  ['3.2×10^(-4)', '3.2 × 10^-4 | rule: standard form', true, 'the ×10ⁿ key, a negative power'],
  ['-2≤x<3', '-2 ≤ x < 3', true, 'a double inequality from the sign keys'],
  /* single values are untouched */
  ['9', '9', true, 'a single value'],
  ['5', '9', false, 'a single wrong value'],
];
/* FILL A TABLE (owner, 23 Nov), the one order rule from the table's structure (find-cells.js `cellsOrder_`): [cells key, table, typed a cell each, right?, what] */
const ROWS3 = '<table><tr><th>Spinner</th><th>Coin</th></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>';
const ROWHEAD = '<table><tr><th>Colour</th><th>Frequency</th></tr><tr><th>Red</th><td></td></tr><tr><th>Blue</th><td></td></tr><tr><th>Green</th><td></td></tr></table>';
/* the live bug (owner photo, 23 Nov, Q-1CM-probability-tree-diagrams-1): fraction-key values, (1)/(6), split at their slash into two cells */
const TREE6 = '<table><thead><tr><th scope="col">Branch</th><th scope="col">Probability</th></tr></thead><tbody><tr><th scope="row">Coin: Heads</th><td></td></tr><tr><th scope="row">Coin: Tails</th><td></td></tr><tr><th scope="row">Heads, then dice: 6</th><td></td></tr><tr><th scope="row">Heads, then dice: Not a 6</th><td></td></tr><tr><th scope="row">Tails, then dice: 6</th><td></td></tr><tr><th scope="row">Tails, then dice: Not a 6</th><td></td></tr></tbody></table>';
const TREE6_KEY = '(1) = 1/2 ; (2) = 1/2 ; (3) = 1/6 ; (4) = 5/6 ; (5) = 1/6 ; (6) = 5/6';
const TABLE_CASES = [
  [TREE6_KEY, TREE6, ['0.5', '0.5', '(1)/(6)', '(5)/(6)', '(1)/(6)', '(5)/(6)'], true, 'Q-1CM-probability-tree-diagrams-1: fraction-key values a cell each'],
  [TREE6_KEY, TREE6, ['0.5', '(1)/(6)', '', '', '', ''], false, 'Q-1CM-probability-tree-diagrams-1: a fraction in one cell is never parted over two'],
  [TREE6_KEY, TREE6, ['0.5', '0.5', '(1)/(12)', '(5)/(12)', '(1)/(12)', '(5)/(12)'], false, 'Q-1CM-probability-tree-diagrams-1: the student\'s twelfths, each one value, not the key'],
  /* unordered: rows written whole are a list, in any order */
  ['1 = 1 ; 2 = H ; 3 = 2 ; 4 = H ; 5 = 3 ; 6 = H', ROWS3, ['1', 'H', '2', 'H', '3', 'H'], true, 'outcome rows as keyed'],
  ['1 = 1 ; 2 = H ; 3 = 2 ; 4 = H ; 5 = 3 ; 6 = H', ROWS3, ['3', 'H', '1', 'H', '2', 'H'], true, 'outcome rows in another order'],
  ['1 = 1 ; 2 = H ; 3 = 2 ; 4 = H ; 5 = 3 ; 6 = H', ROWS3, ['H', '1', 'H', '2', 'H', '3'], false, 'outcome rows with each row\'s cells swapped'],
  ['1 = 1 ; 2 = H ; 3 = 2 ; 4 = H ; 5 = 3 ; 6 = H', ROWS3, ['1', 'H', '1', 'H', '3', 'H'], false, 'an outcome row twice, one missing'],
  /* ordered: a cell tied to its given row header keeps its place */
  ['Red = 5 ; Blue = 7 ; Green = 2', ROWHEAD, ['5', '7', '2'], true, 'frequencies by their given rows'],
  ['Red = 5 ; Blue = 7 ; Green = 2', ROWHEAD, ['7', '5', '2'], false, 'frequencies swapped between given rows'],
];

function run() {
  const { ctx, call } = VQ.appCode();
  let pass = 0, known = 0, fixed = [], bad = [];
  for (const [typed, key, want, what, isKnown] of CASES) {
    ctx.__t = typed; ctx.__k = key;
    let got;
    try { got = !!call('markAnswer_(__t, __k)'); } catch (e) { got = 'error ' + e.message; }
    const ok = got === want;
    if (isKnown) { known++; if (ok) fixed.push(what); continue; }
    if (ok) pass++; else bad.push(JSON.stringify(typed) + ' for ' + JSON.stringify(key) + ' (' + what + '): ' + (want ? 'must pass' : 'must fail') + ', marked ' + got);
  }
  /* markerOf_ swallows a name the vm has not loaded yet: loaded here first */
  call('qtMarker_(workRow_({row:{}}))');
  for (const [cells, html, typed, want, what] of TABLE_CASES) {
    ctx.__x = { key: 'marker-cases-table-' + what, marks: 1, html, cells }; ctx.__t = typed;
    let got;
    try { got = call('mark_(__x, __t)').verdict === 'right'; } catch (e) { got = 'error ' + e.message; }
    if (got === want) pass++; else bad.push('table ' + JSON.stringify(typed) + ' (' + what + '): ' + (want ? 'must pass' : 'must fail') + ', marked ' + got);
  }
  const n = CASES.length + TABLE_CASES.length - known;
  console.log('marker-cases: ' + pass + '/' + n + ' right' + (known ? '; ' + known + ' known-failing' : ''));
  fixed.forEach(f => console.log('  now right, drop its known flag: ' + f));
  report('marker-cases', bad, 'case(s) marked wrongly');
  return { pass, n, known };
}
module.exports = { run, CASES, TABLE_CASES };
main(module, run);
