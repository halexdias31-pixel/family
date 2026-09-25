#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-people.js

   THE CELLS ON THE `people` TAB THAT HOLD MORE THAN ONE FACT, ROUND-TRIPPED.

   THREE COLUMNS ON THIS TAB ARE PACKED, and every one of them exists because the alternative is a
   numbered column — the fault CLAUDE.md records under `images`, under `needs`, under the practicals'
   `equipment_1 … equipment_10` and, in writing, over `library_card` itself. So:

     `availability`   77 tickboxes -> "m09,m10,…"           `availGridOut` / `availGridIn`
     `library_card`    9 boxes     -> "name:no:pin|…"       `libCardsOut`  / `libCardsIn`

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
  + ' box.N = LIBRARY_CARDS; box.FIELDS = LIBRARY_FIELDS;')(box);

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

if (bad) { console.log('\nFAILED — ' + bad + ' packed-cell case(s) wrong.'); process.exit(1); }
console.log('\nlibrary cards: ' + box.N + '   fields: ' + box.FIELDS.length);
console.log('OK — every packed cell on the people tab comes back as it went in.');
