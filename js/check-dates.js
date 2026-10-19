require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-dates.js AN ISO DATE WAS READ BACKWARDS AND THE ANSWER LOOKED FINE. § */

const fs = require('fs');
const path = require('path');

/* ---------- EVERY CASE IS A FORM THIS APP ACTUALLY CARRIES § */
const CASES = [
  /* The ISO forms. A sheet cell typed by hand, a data file, and a payload that used `String(Date)`
     before `fmtDateTime` was used everywhere. All four were wrong before the anchor. */
  ['2026-09-15 18:20',    '2026-09-15 18:20'],
  ['2026-09-15',          '2026-09-15 00:00'],
  ['2026-09-15T18:20:00', '2026-09-15 18:20'],
  /* A real exam date out of `data/questions.json`. */
  ['2017-05-25',          '2017-05-25 00:00'],

  /* The British forms, which were right and must stay right — `fmtDateTime` in core.gs sends the
     first of these on every message and every comment. */
  ['15/09/26 18:20',      '2026-09-15 18:20'],
  ['1/2/2026',            '2026-02-01 00:00'],
  ['31-12-99',            '2099-12-31 00:00'],

  /* AND THE PAYLOAD'S OWN `at`, WHICH IS MILLISECONDS. Posts are sorted on it and drawn from it, so
     a number must not fall through to the string branch. */
  [Date.UTC(2026, 0, 2, 0, 0, 0) + new Date(2026, 0, 2).getTimezoneOffset() * 0, null],
];

function show(d) {
  if (!d) return String(d);
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
       + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function run() {
  let src;
  try { src = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8'); }
  catch (err) { console.log('COULD NOT RUN — no data.js beside this checker'); process.exitCode = 1; return; }

  const from = src.indexOf('function parseWhen');
  const to = src.indexOf('const fullDate');
  if (from < 0 || to < 0 || to < from) {
    /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO. § */
    console.log('COULD NOT RUN — parseWhen not found in data.js');
    process.exitCode = 1; return;
  }
  let parseWhen;
  try {
    parseWhen = new Function('MONTH_NAMES', src.slice(from, to) + '\nreturn parseWhen;')([]);
  } catch (err) {
    console.log('COULD NOT RUN — parseWhen would not load: ' + (err && err.message));
    process.exitCode = 1; return;
  }

  const bad = [];
  CASES.forEach(([input, want]) => {
    if (want === null) {                         // the milliseconds case: it just has to come back
      const d = parseWhen(input);
      if (!d || isNaN(d)) bad.push({ input: String(input), got: String(d), want: 'a Date' });
      return;
    }
    const got = show(parseWhen(input));
    if (got !== want) bad.push({ input: input, got: got, want: want });
  });

  console.log('\nA DATE READ AS A DIFFERENT DATE  (' + bad.length + ')');
  if (!bad.length) console.log('  none');
  bad.forEach(b => console.log('  ' + JSON.stringify(b.input)
    + '  →  ' + b.got + '   (should be ' + b.want + ')'));

  console.log('\ndate forms checked: ' + CASES.length);
  if (bad.length) {
    console.log('FAILED — parseWhen is the one place this app reads a written date, and it is '
              + 'wrong about ' + bad.length + ' of the forms it is handed.');
    process.exitCode = 1;
  } else {
    console.log('OK — every date form this app carries reads as the date it says.');
  }
}

run();
