/* ==================================================================================================
   @family. — tools/accept-chem-8462-2406.js

   CHEMISTRY PAPER 1 COULD NOT MARK A SINGLE ONE OF ITS OWN ANSWERS.

   Reported by somebody sitting it. Measured: 102 questions across the two tiers, 102 with an
   answer, and `accept` empty on every one — so `ansBox_` drew the box and no Check button on all
   of them, and a student working through the paper found out whether they were right by opening
   the mark scheme, which is the one thing a student on their own will not do honestly. The rest
   of the library is not like this: 1,398 rows already carry an `accept`.

   THE RULE IS AS NARROW AS THE FAIRNESS ARGUMENT NEEDS, because this is the one thing in the app
   that tells a child they are wrong and there is nobody for them to appeal to. Two shapes qualify
   and nothing else does:

     A TICK BOX     the paper prints the options, so the set of right answers is closed and
                    printed. 28 of these questions exist on the two tiers; the ones kept are the
                    ones somebody can actually TYPE — a letter, a number, a name, a formula, a
                    phrase of about four words. The sentence options (`Energy is taken in from the
                    surroundings so the reaction is endothermic`) and the equation options
                    (`2 Cl⁻ → Cl₂ + 2 e⁻`) are deliberately left unmarkable: this app has a text
                    box rather than radio buttons, nobody types those, and a right answer marked
                    wrong is the failure that makes a student stop trusting the marking.

     ONE VALUE      a calculation whose answer is a single number, with or without its unit.
                    `markBare_` already drops a unit from the expected side.

   EVERYTHING ELSE IS LEFT ALONE and that is most of the paper: every `explain`, every level-marked
   answer, every "any two of", every answer that is two facts in one box. A mark scheme that reads
   working is not a string comparison and pretending otherwise is worse than no button.

   AND EVERY ENTRY IS PROVED BOTH WAYS BEFORE IT IS WRITTEN, through the app's own `markAnswer_`
   rather than a second opinion about what a right answer is — which is `check-quizzes.js`'s rule,
   and it found three real faults on its first run. For a tick box the wrong side is free and is
   the strongest test available: EVERY OTHER PRINTED OPTION must mark wrong. An `accept` that lets
   two of the four options through is a question with two right answers.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const { markingSource } = require('../js/check-marks-load.js');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'data', 'questions.json');

const marks = markingSource(ROOT);
if (marks.missing.length) {
  console.error('js/find.js no longer declares ' + marks.missing.join(', ') +
                ', so nothing here can be proved — not a pass.');
  process.exit(1);
}
const markAnswer_ = new Function(marks.source + '\nreturn markAnswer_;')();

/* `tail: [accept, [other spellings a right answer might be typed as], printedAnswerReducesTo?]`.
   The printed answer's own head, and on a tick box every other printed option, are added to the
   two sides automatically. The third element is for the one row whose printed answer is itself a
   list of alternatives (`Methyl orange or phenolphthalein`), where no splitting rule can produce
   the thing a student types -- said out loud rather than papered over with a wider `accept`. */
const ACCEPT = {
  '1H': {
    '015': ['11.6 g', ['11.6', '11.60']],
    '025': ['3.0 to 3.8|3.4 mg/cm³|3.4 mg/cm3', ['3.4', '3.0', '3.8', '3.2']],
    '026': ['Chlorine and potassium bromide', ['potassium bromide and chlorine']],
    '053': ['Hydrogen|H₂', ['hydrogen', 'H₂']],
    '075': ['72.4%|72.41%|72.414%|72.4138%|72.41379%',
             ['72.4', '72.41', '72.414', '72.41379']],   // no s.f. is asked for, so every
                                                          // rounding of one exact value is right
    '076': ['9000 dm³|9000 dm3', ['9000', '9 000']],
    '082': ['B', ['b']],
    '083': ['392 kJ/mol', ['392']],
    '094': ['30 cm³|30 cm3', ['30']],
  },
  '1F': {
    '011': ['D', ['d']],
    '012': ['C', ['c']],
    '013': ['Sections A, B and C|A, B and C|A B and C', ['sections a, b and c', 'A B and C']],
    '016': ['B', ['b']],
    '017': ['A', ['a']],
    '022': ['methyl orange|phenolphthalein|litmus', ['Phenolphthalein', 'litmus'], 'Methyl orange'],
    '025': ['16.6 cm³|16.6 cm3', ['16.6']],
    '026': ['Trial 2 and Trial 3|2 and 3|Trials 2 and 3', ['trial 3 and trial 2', 'Trials 2 and 3']],
    '027': ['BaCl₂|BaCl2', ['bacl2', 'BaCl₂']],
    '031': ['Displacement', ['displacement']],
    '032': ['39.8%', ['39.8']],
    '034': ['0.80 g', ['0.8', '0.80']],
    '035': ['25 °C', ['25']],
    '036': ['270 g/dm³|270 g/dm3', ['270'], '270 g/dm³'],  // the 0.025 dm³ in the printed answer is working
    '041': ['A few hundred atoms', ['a few hundred atoms']],
    '042': ['Iron|Fe', ['iron', 'Fe']],
    '051': ['6', ['06']],
    '052': ['7', ['07']],
    '053': ['6', ['06']],
    '054': ['C₂F₆|C2F6', ['c2f6', 'C₂F₆']],
    '056': ['Spherical', ['spherical']],
    '057': ['3', ['03']],
    '064': ['102', ['102.0']],
    '071': ['6 V', ['6']],
    '072': ['Sodium chloride solution', ['sodium chloride solution']],
    '085': ['11.6 g', ['11.6']],
    '095': ['3.0 to 3.8|3.4 mg/cm³|3.4 mg/cm3', ['3.4', '3.0', '3.8']],
    '096': ['Chlorine and potassium bromide', ['potassium bromide and chlorine']],
  },
};

/* The printed answer's own head: the library writes `11.6 g — mass produced = ...`, and what a
   student types is the part before the dash. Splitting there rather than accepting the whole
   sentence is what makes the check a check. */
const head = s => String(s || '').split(/\s[—–-]\s|\.\s|\(/)[0]
  .replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().replace(/[.,]$/, '');

/* A `<sup>` CLOSES UP AND EVERY OTHER TAG OPENS A GAP. `16.4 cm<sup>3</sup>` is one option and
   stripping every tag to a space makes it `16.4 cm 3`, which is not what is printed and not what
   anybody types -- so the option would have matched nothing and the "exactly one right" test would
   have failed on a correct `accept`. */
const options = html => (String(html || '').match(/<li>[\s\S]*?<\/li>/g) || [])
  .map(o => o.replace(/<\/?su[pb]>/g, '').replace(/<[^>]*>/g, ' ')
             .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().replace(/\.$/, ''))
  .filter(Boolean);

const lines = fs.readFileSync(FILE, 'utf8').split('\n');
const out = [];
const done = {};
let ticks = 0;

for (const line of lines) {
  const bare = line.trim();
  const trailing = bare.endsWith(',');
  if (!bare.startsWith('{')) { out.push(line); continue; }
  const row = JSON.parse(trailing ? bare.slice(0, -1) : bare);
  const id = String(row.row_id || '');
  const m = /^Q-AQA-8462-2406-(1[FH])-(\d\d\d)$/.exec(id);
  const want = m && ACCEPT[m[1]] && ACCEPT[m[1]][m[2]];
  if (want) {
    const [accept, alts, as] = want;
    if (String(row.accept || '').trim()) throw new Error(id + ' already carries an accept');

    /* the printed answer, and every spelling a right answer might arrive in, must mark RIGHT */
    for (const right of [as || head(row.answer)].concat(alts)) {
      if (markAnswer_(right, accept) !== true) {
        throw new Error(id + ': ' + JSON.stringify(right) + ' is a right answer and ' +
                        JSON.stringify(accept) + ' marks it wrong');
      }
    }
    /* on a tick box, every OTHER printed option must mark WRONG */
    const opts = options(row.html);
    if (opts.length) {
      ticks++;
      const mine = opts.filter(o => markAnswer_(o, accept) === true);
      if (mine.length !== 1) {
        throw new Error(id + ': ' + JSON.stringify(accept) + ' marks ' + mine.length +
                        ' of the ' + opts.length + ' printed options right — ' +
                        JSON.stringify(mine));
      }
    }
    row.accept = accept;
    done[m[1] + '-' + m[2]] = true;
  }
  out.push(JSON.stringify(row) + (trailing ? ',' : ''));
}

const wanted = [].concat(...Object.keys(ACCEPT).map(t => Object.keys(ACCEPT[t]).map(k => t + '-' + k)));
const missing = wanted.filter(k => !done[k]);
if (missing.length) throw new Error('rows not found in the file: ' + missing.join(', '));

fs.writeFileSync(FILE, out.join('\n'));
console.log(wanted.length + ' questions on AQA Chemistry 8462 Paper 1 can mark themselves now, ' +
            'of 102 across the two tiers');
console.log('  ' + ticks + ' are tick boxes, and each was checked against every other option the ' +
            'paper prints');
console.log('  the rest of the paper is deliberately left unmarkable: an explain, a level-marked ' +
            'answer or an "any two of" is not a string comparison');
