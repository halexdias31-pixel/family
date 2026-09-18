/* ==================================================================================================
   @family. — check-dates.js

   AN ISO DATE WAS READ BACKWARDS AND THE ANSWER LOOKED FINE.

   `parseWhen` in data.js is the one place this app turns a written date into a Date, and every
   timestamp anybody sees goes through it: `ago()` on a post, on a comment, on a session. Its
   day-month-year match was NOT ANCHORED, so on a four-digit year the regex engine simply started
   later in the string — `\d{1,2}` cannot take `2026`, so it slid along to `26-09-15` and read day
   26, month 9, year 15.

   `2026-09-15` CAME OUT AS 26 SEPTEMBER 2015, and `2017-05-25` as 17 May 2025. A plausible date, a
   confident sentence, and wrong by eleven years — the shape this repository keeps recording, where
   the failure looks exactly like a success. Nothing threw and nothing could have noticed.

   WHY A CHECK AND NOT JUST THE FIX. This is the `cost: 0` sentence for the seventh time: a fault
   repaired in the instance and not in the rule comes back. The two date forms this app actually
   carries — the ISO one a sheet cell and a data file hold, and the `15/09/26 18:20` one
   `fmtDateTime` sends — are both here, so a future edit to that regex has to keep both.

   THE FUNCTION IS CUT OUT AND RUN ON ITS OWN, which is `check-marking.js`'s method and is safe for
   the same reason: `parseWhen` touches nothing else in the app. A second implementation here would
   be a second thing to keep in step, which is the fault this repository records under `childrenOf`,
   under `link`/`source_url` and under `factsNow_`.

   RUN IT:  node js/check-dates.js
================================================================================================== */

const fs = require('fs');
const path = require('path');

/* ---------- EVERY CASE IS A FORM THIS APP ACTUALLY CARRIES ----------------------------------------
   Written as local wall-clock rather than as a timestamp, because that is the question: a date is
   built field by field precisely so it does not move across midnight with the machine's zone. */
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
    /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO. "I did not check" is not the same
       answer as "I checked and it was fine", and exit 0 says the second one to everything that
       reads it — which is the `check-booking.js` fault this repository has now recorded five ways. */
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
