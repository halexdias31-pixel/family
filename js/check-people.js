#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-people.js

   THE CELLS ON THE `people` TAB THAT HOLD MORE THAN ONE FACT, ROUND-TRIPPED.

   THREE COLUMNS ON THIS TAB ARE PACKED, and every one of them exists because the alternative is a
   numbered column — the fault CLAUDE.md records under `images`, under `needs`, under the practicals'
   `equipment_1 … equipment_10` and, in writing, over `library_card` itself. So:

     `availability`   77 tickboxes -> "m09,m10,…"           `availGridOut` / `availGridIn`
     `library_card`    9 boxes     -> "name:no:pin|…"       `libCardsOut`  / `libCardsIn`
     `date_of_birth`   3 boxes     -> "15/09/1985"          `dobOut`       / `dobIn`

   NOTHING HAS EVER TESTED EITHER. They are the one shape where a fault is completely silent: a
   packer that drops a field writes a shorter cell, the form reloads with an empty box, and the
   person who typed it assumes they forgot. There is no error, no log and nothing on screen — which
   is this repository's oldest shape, and the reason `availGridIn` went eighteen months unexamined.

   WHAT THIS ASKS IS ONE QUESTION: pack what was typed, unpack it again, and get the same thing
   back. Plus the cases where the two halves are NOT symmetrical and the asymmetry is deliberate —
   a trailing empty card is dropped, a middle gap is kept, and a separator typed into a box is
   stripped rather than escaped.

     node js/check-people.js

   IT RUNS THE BACKEND'S OWN FUNCTIONS, cut out of the `.gs` by name and run in Node. Not a second
   implementation: a second implementation would agree with itself and with nothing else, which is
   the fault this file exists to catch one table along.
================================================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const core   = fs.readFileSync(path.join(ROOT, 'backend', 'core.gs'), 'utf8');
const consts = fs.readFileSync(path.join(ROOT, 'backend', 'constants.gs'), 'utf8');

/* A CHECK THAT CANNOT REACH ITS SUBJECT MUST EXIT NON-ZERO — `check-booking.js` printed "nothing to
   check" and exited 0 for months, which read as a pass. Same `grab` as `check-handles.js`. */
function grab(src, re, what) {
  const m = src.match(re);
  if (!m) { console.log('FAILED — could not find ' + what + ' to check.'); process.exit(1); }
  return m[0];
}
const SRC = [
  grab(consts, /const AVAIL_DAYS\s*=[^;]*;/, 'AVAIL_DAYS'),
  grab(consts, /const AVAIL_HOURS\s*=[^;]*;/, 'AVAIL_HOURS'),
  grab(consts, /const LIBRARY_CARDS\s*=[^;]*;/, 'LIBRARY_CARDS'),
  grab(consts, /const LIBRARY_FIELDS\s*=\s*\(\(\)[\s\S]*?\}\)\(\);/, 'LIBRARY_FIELDS'),
  grab(core,   /function availGridOut\([\s\S]*?\n\}/, 'availGridOut'),
  grab(core,   /function availGridIn\([\s\S]*?\n\}/, 'availGridIn'),
  grab(core,   /function availSet\([\s\S]*?\n\}/, 'availSet'),
  grab(core,   /function libCardsOut\([\s\S]*?\n\}/, 'libCardsOut'),
  grab(core,   /function libCardsIn\([\s\S]*?\n\}/, 'libCardsIn'),
  /* THE THIRD PACKED CELL, and the one whose unpacker has to read TWO different stored shapes:
     Sheets makes a real Date of a birthday typed into the spreadsheet, and this app writes a
     `dd/mm/yyyy` string. `sheetDate` is what tells them apart, so it is cut out too. */
  grab(core,   /function sheetDate\([\s\S]*?\n\}/, 'sheetDate'),
  grab(core,   /function dobOut\([\s\S]*?\n\}/, 'dobOut'),
  grab(core,   /function dobIn\([\s\S]*?\n\}/, 'dobIn'),
  grab(core,   /function dobRefusal_\([\s\S]*?\n\}/, 'dobRefusal_'),
].join('\n\n');

/* THE FOUR APPS SCRIPT HELPERS THOSE FIVE REACH FOR, copied rather than imported — the same
   arrangement `check-handles.js` uses and for its stated reason: if one of them changes meaning in
   `constants.gs`, a case here fails, which is what a stub is for. */
const PRELUDE = `
  const S = v => (v === undefined || v === null ? '' : String(v));
  const norm = v => S(v).toLowerCase().replace(/\\s+/g, '').trim();
  const TRUE_ = v => v === true || /^(true|yes|1|✓)$/i.test(S(v).trim());
`;
const box = {};
new Function('box', PRELUDE + SRC
  + '\nbox.libOut = libCardsOut; box.libIn = libCardsIn;'
  + ' box.availOut = availGridOut; box.availIn = availGridIn;'
  + ' box.N = LIBRARY_CARDS; box.FIELDS = LIBRARY_FIELDS;'
  + ' box.dobOut = dobOut; box.dobIn = dobIn; box.dobNo = dobRefusal_;')(box);

let bad = 0;
const is = (what, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g !== w) { bad++; console.log('  FAIL  ' + what + '\n          got  ' + g + '\n          want ' + w); }
};

/* ---------- THE FIELD LIST IS DERIVED FROM THE COUNT, so a fourth library is one number -----------
   WRITTEN OUT HERE WOULD BE THE SECOND COPY. What this asks instead is that the list AGREES with
   the count — nine names for three cards — which is the thing that breaks if somebody edits one and
   not the other. */
is('three cards give nine field names', box.FIELDS.length, box.N * 3);
is('the first card is named lib1_*', box.FIELDS.slice(0, 3), ['lib1_name', 'lib1_no', 'lib1_pin']);

/* ---------- THE ROUND TRIP, WHICH IS THE WHOLE POINT --------------------------------------------- */
const cards = (...rows) => {
  const f = {};
  rows.forEach((r, i) => {
    f['lib' + (i + 1) + '_name'] = r[0];
    f['lib' + (i + 1) + '_no']   = r[1];
    f['lib' + (i + 1) + '_pin']  = r[2];
  });
  return f;
};
const trip = f => {
  const back = box.libOut(box.libIn(f));
  const out = {};
  box.FIELDS.forEach(k => { if (f[k] !== undefined) out[k] = back[k]; });
  return out;
};

is('one card comes back as it went in',
   trip(cards(['Merton', '2000000000000', '0000'])),
   cards(['Merton', '2000000000000', '0000']));

is('three cards come back as they went in',
   trip(cards(['Merton', '20000000001', '1111'],
              ['Sutton', '20000000002', '2222'],
              ['Wandsworth Town and Putney', '20000000003', '3333'])),
   cards(['Merton', '20000000001', '1111'],
         ['Sutton', '20000000002', '2222'],
         ['Wandsworth Town and Putney', '20000000003', '3333']));

/* A NAME MAY HOLD A COLON AND THAT IS WHY AN ITEM IS PARSED FROM THE RIGHT. `Merton: Wimbledon` is
   a real way to write a branch, and a left-to-right parse would file `Wimbledon` as the number. */
is('a colon inside a library name survives',
   trip(cards(['Merton: Wimbledon', '2000000000000', '0000'])),
   cards(['Merton: Wimbledon', '2000000000000', '0000']));

/* A PIPE IS THE SEPARATOR AND IS STRIPPED RATHER THAN ESCAPED. Left in, `Merton|Sutton` would come
   back as TWO cards on the next load — a silent corruption of the one thing this cell exists to
   remember, and the kind that looks like the app inventing a library. */
is('a pipe typed into a name cannot split the cell',
   trip(cards(['Merton|Sutton', '2000000000000', '0000'])),
   cards(['Merton Sutton', '2000000000000', '0000']));

/* THE TWO ASYMMETRIES, BOTH DELIBERATE AND BOTH EASY TO GET WRONG ------------------------------- */
is('a trailing empty card is not written',
   box.libIn(cards(['Merton', '1', '0000'], ['', '', ''], ['', '', ''])),
   'Merton:1:0000');
is('a gap in the middle is kept, because it is somebody\'s second slot left blank',
   box.libIn(cards(['Merton', '1', '0000'], ['', '', ''], ['Sutton', '3', '3333'])),
   'Merton:1:0000||Sutton:3:3333');
is('nothing typed at all is an empty cell', box.libIn(cards(['', '', ''])), '');

/* AN OLD CELL, AND A CELL WITH MORE CARDS IN IT THAN THE FORM DRAWS. Neither should throw and
   neither should invent a field: the form shows `LIBRARY_CARDS` of them and a fourth would be
   dropped on the next save, which is a real loss and is why the count is one constant. */
is('an empty cell unpacks to empty boxes',
   box.libOut(''), cards(['', '', ''], ['', '', ''], ['', '', '']));
is('a ragged item does not throw and does not invent',
   box.libOut('Merton'), cards(['Merton', '', ''], ['', '', ''], ['', '', '']));

/* ---------- AND THE HOURS, WHICH HAVE NEVER BEEN TESTED EITHER ----------------------------------- */
is('a ticked hour survives the round trip',
   box.availIn(box.availOut('m09,tu14')), 'm09,tu14');
is('an empty week packs to an empty cell', box.availIn(box.availOut('')), '');
is('an hour outside the span is dropped rather than kept',
   box.availIn(box.availOut('m09,m23')), 'm09');

/* ---------- AND THE DATE OF BIRTH, WHOSE UNPACKER HAS TO READ TWO STORED SHAPES -----------------
   A BIRTHDAY TYPED INTO THE SPREADSHEET IS A REAL DATE and one written by this app is a
   `dd/mm/yyyy` string, and `dobOut` has to come apart into the same three numbers either way. The
   Date case is the one that was a live fault: `profileOf_` sent `S(r.date_of_birth)`, so the box
   rendered `Sun Sep 15 1985 00:00:00 GMT+0100 (British Summer Time)`.

   THE ZERO PADDING IS NOT COSMETIC. `sheetDate`'s anchored branch reads `15/09/1985`; a
   four-digit year is what keeps it out of the two-digit rule, which is `2000 + n` and would make
   `85` into 2085. So the packer's output is asserted character for character. */
const dob = (d, m, y) => ({ dob_d: d, dob_m: m, dob_y: y });
is('three numbers pack to the one format sheetDate reads',
   box.dobIn(dob('15', '9', '1985')), '15/09/1985');
is('and the day is padded too', box.dobIn(dob('5', '9', '1985')), '05/09/1985');
is('a dd/mm/yyyy cell comes apart into three numbers',
   box.dobOut('15/09/1985'), dob('15', '9', '1985'));
is('A REAL DATE comes apart the same way — the fault that sent a JS date string into the box',
   box.dobOut(new Date(1985, 8, 15)), dob('15', '9', '1985'));
is('the round trip is exact', box.dobIn(box.dobOut('15/09/1985')), '15/09/1985');
is('nothing typed at all is an empty cell', box.dobIn(dob('', '', '')), '');
is('an empty cell unpacks to empty boxes', box.dobOut(''), dob('', '', ''));
is('what the boxes cannot show is KEPT rather than blanked, so opening a form cannot lose it',
   box.dobOut('sometime in 85'), dob('sometime in 85', '', ''));

/* AND WHY IT MAY NOT BE WRITTEN. A partial is `null` to `sheetDate` — a birthday that vanishes off
   the calendar with the form saying Saved, which is the whole reason the refusal exists. */
const no = f => !!box.dobNo(f);
is('all three blank is allowed — clearing a birthday clears it', no(dob('', '', '')), false);
is('a real date is allowed', no(dob('15', '9', '1985')), false);
is('A PARTIAL IS REFUSED — this is the one that loses a birthday silently',
   no(dob('15', '', '1985')), true);
is('and so is a missing year', no(dob('15', '9', '')), true);
is('a two-digit year is refused, because sheetDate would make 85 into 2085',
   no(dob('15', '9', '85')), true);
is('there is no month 13', no(dob('1', '13', '1985')), true);
is('there is no 31st of September', no(dob('31', '9', '1985')), true);
is('29 February 2024 is a real day', no(dob('29', '2', '2024')), false);
is('29 February 2023 is not', no(dob('29', '2', '2023')), true);
is('a birthday in the future is refused', no(dob('1', '1', '2099')), true);

if (bad) { console.log('\nFAILED — ' + bad + ' packed-cell case(s) wrong.'); process.exit(1); }
console.log('\nlibrary cards: ' + box.N + '   fields: ' + box.FIELDS.length
          + '   packed cells: availability, library_card, date_of_birth');
console.log('OK — every packed cell on the people tab comes back as it went in.');
