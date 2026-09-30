#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-people.js

   THE CELLS ON THE `people` TAB THAT HOLD MORE THAN ONE FACT, ROUND-TRIPPED.

   THREE COLUMNS ON THIS TAB ARE PACKED, and every one of them exists because the alternative is a
   numbered column — the fault CLAUDE.md records under `images`, under `needs`, under the practicals'
   `equipment_1 … equipment_10` and, in writing, over `library_card` itself. So:

     `availability`   77 tickboxes -> "m09,m10,…"           `availGridOut` / `availGridIn`
     `date_of_birth`   3 boxes     -> "15/09/1985"          `dobOut`       / `dobIn`

   AND TWO SETS OF BOXES THAT ARE ROWS ON TABS OF THEIR OWN since the people tab was redesigned —
   the qualification shelf on `qualifications` and the library cards on `library_cards`. They go
   through the same round trip: boxes to rows, rows back to boxes.

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

/* ---------- EVERY CASE IN THIS FILE RUNS IN A TIMEZONE BEHIND UTC --------------------------------
   NOT DECORATION, AND MEASURED. `new Date('2027-05-14')` is UTC MIDNIGHT, so it reads back as the
   13th anywhere west of Greenwich and as the 14th here — this container is UTC. So the ONE mutation
   that matters most to `isoDate_`, parsing the ISO branch with `new Date(<string>)` instead of
   matching it, passes every assertion below when the ambient zone is UTC and fails two of them in
   New York. A case that only fails somewhere else is a case that passes here by luck, which is this
   repository's own definition of a check that cannot fail.

   Set before the first `Date` is constructed, which is what Node reads it for. It makes the birthday
   cases stricter too and changes none of their answers: `dobOut`/`dobIn` build from local fields and
   `dobRefusal_` compares against `Date.now()`, so neither has a string for a zone to get wrong. */
process.env.TZ = 'America/New_York';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const core   = fs.readFileSync(path.join(ROOT, 'backend', 'core.gs'), 'utf8');
const consts = fs.readFileSync(path.join(ROOT, 'backend', 'constants.gs'), 'utf8');
/* THE PHONE'S HALF OF THE ONE ARRANGEMENT THIS FILE CANNOT OTHERWISE SEE — see the last case. */
const me     = fs.readFileSync(path.join(ROOT, 'js', 'me.js'), 'utf8');

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
  /* ---------- THE TWO LISTS THAT ARE TABS: A PERSON'S OWN ROWS, READ AND TURNED INTO BOXES ---------
     `read` is stubbed below over an in-memory store, which is the one Apps Script call these reach. */
  grab(core,   /function ownRows_\([\s\S]*?\n\}/, 'ownRows_'),
  grab(core,   /function libCardsOut\([\s\S]*?\n\}/, 'libCardsOut'),
  grab(core,   /function libCardsIn\([\s\S]*?\n\}/, 'libCardsIn'),
  grab(consts, /const QUAL_MAX\s*=[^;]*;/, 'QUAL_MAX'),
  grab(consts, /const QUAL_FIELDS\s*=\s*\(\(\)[\s\S]*?\}\)\(\);/, 'QUAL_FIELDS'),
  grab(core,   /function qualsList_\([\s\S]*?\n\}/, 'qualsList_'),
  grab(core,   /function qualsOut\([\s\S]*?\n\}/, 'qualsOut'),
  grab(core,   /function qualsIn\([\s\S]*?\n\}/, 'qualsIn'),
  grab(core,   /const teachPhrase_\s*=[^;]*;/, 'teachPhrase_'),
  grab(core,   /function teachesOf_\([\s\S]*?\n\}/, 'teachesOf_'),
  grab(consts, /const PHONE_CODES\s*=[^;]*;/, 'PHONE_CODES'),
  grab(core,   /function phoneOut\([\s\S]*?\n\}/, 'phoneOut'),
  grab(core,   /function phoneIn\([\s\S]*?\n\}/, 'phoneIn'),
  /* THE THIRD PACKED CELL, and the one whose unpacker has to read TWO different stored shapes:
     Sheets makes a real Date of a birthday typed into the spreadsheet, and this app writes a
     `dd/mm/yyyy` string. `sheetDate` is what tells them apart, so it is cut out too. */
  grab(core,   /function sheetDate\([\s\S]*?\n\}/, 'sheetDate'),
  grab(core,   /function dobOut\([\s\S]*?\n\}/, 'dobOut'),
  grab(core,   /function dobIn\([\s\S]*?\n\}/, 'dobIn'),
  grab(core,   /function dobRefusal_\([\s\S]*?\n\}/, 'dobRefusal_'),
  /* ---------- AND THE COLUMN THAT IS NOT PACKED AND IS STILL A RE-SPELLING ----------------------
     `exam_small_date` HOLDS ONE FACT, so it is not a packed cell — and it is here for the same
     reason the three are: a value goes out in one spelling and comes back in another, and if the two
     halves disagree the picker opens EMPTY over a cell with a date in it and the next save writes
     the empty over it. Silent, exactly like a short `availability` cell. */
  grab(core,   /function isoDate_\([\s\S]*?\n\}/, 'isoDate_'),
  grab(core,   /function isoRefusal_\([\s\S]*?\n\}/, 'isoRefusal_'),
  grab(consts, /const DATE_COLS\s*=[^;]*;/, 'DATE_COLS'),
  /* THE EXTRA PHOTOGRAPHS: eight boxes, one cell, a list rather than a set of slots — so a gap
     closes up and a duplicate is one, which is where it parts from the library shelf. */
  grab(consts, /const PHOTO_MAX\s*=[^;]*;/, 'PHOTO_MAX'),
  grab(core,   /function photosOut\([\s\S]*?\n\}/, 'photosOut'),
  grab(core,   /function photosIn\([\s\S]*?\n\}/, 'photosIn'),
  grab(core,   /function photosRefusal_\([\s\S]*?\n\}/, 'photosRefusal_'),
  grab(core,   /function photosList_\([\s\S]*?\n\}/, 'photosList_'),
  /* THE VENUES A TUTOR WILL TEACH AT: a pseudo-field over the venues tab's own column. */
  grab(core,   /function venuesPersonIs_\([\s\S]*?\n\}/, 'venuesPersonIs_'),
  grab(core,   /function venuesListOf_\([\s\S]*?\n\}/, 'venuesListOf_'),
  grab(core,   /function venuesWrites_\([\s\S]*?\n\}/, 'venuesWrites_'),
].join('\n\n');

/* THE FOUR APPS SCRIPT HELPERS THOSE FIVE REACH FOR, copied rather than imported — the same
   arrangement `check-handles.js` uses and for its stated reason: if one of them changes meaning in
   `constants.gs`, a case here fails, which is what a stub is for. */
const PRELUDE = `
  const S = v => String(v ?? '').trim();   // constants.gs's own — it TRIMS, and the packers rely on it
  const norm = v => S(v).toLowerCase().replace(/\\s+/g, '').trim();
  const key = v => S(v).toLowerCase().replace(/[^a-z0-9]/g, '');
  const TRUE_ = v => v === true || /^(true|yes|1|✓)$/i.test(S(v).trim());
  const TAB = { qualifications: 'qualifications', library_cards: 'library_cards' };
  let STORE = { qualifications: [], library_cards: [] };
  function read(tab) { return { rows: STORE[tab] || [] }; }
  box.setStore = s => { STORE = s; };
`;
const box = {};
new Function('box', PRELUDE + SRC
  + '\nbox.libOut = libCardsOut; box.libIn = libCardsIn;'
  + ' box.availOut = availGridOut; box.availIn = availGridIn;'
  + ' box.N = LIBRARY_CARDS; box.FIELDS = LIBRARY_FIELDS;'
  + ' box.dobOut = dobOut; box.dobIn = dobIn; box.dobNo = dobRefusal_;'
  + ' box.iso = isoDate_; box.isoNo = isoRefusal_; box.DATE_COLS = DATE_COLS;'
  + ' box.qList = qualsList_; box.qOut = qualsOut; box.qIn = qualsIn;'
  + ' box.QMAX = QUAL_MAX; box.QFIELDS = QUAL_FIELDS;'
  + ' box.teaches = teachesOf_; box.phOut = phoneOut; box.phIn = phoneIn;'
  + ' box.pOut = photosOut; box.pIn = photosIn; box.pNo = photosRefusal_; box.pList = photosList_;'
  + ' box.PMAX = PHOTO_MAX; box.vWrites = venuesWrites_;')(box);

let bad = 0;
const is = (what, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g !== w) { bad++; console.log('  FAIL  ' + what + '\n          got  ' + g + '\n          want ' + w); }
};

/* ---------- THE FIELD LIST IS DERIVED FROM THE COUNT, so a fourth library is one number -----------
   WRITTEN OUT HERE WOULD BE THE SECOND COPY. What this asks instead is that the list AGREES with
   the count — nine names for three cards — which is the thing that breaks if somebody edits one and
   not the other. */
is('each card gives three field names', box.FIELDS.length, box.N * 3);
/* FIVE, BECAUSE THAT IS THE ASK — *"same with library cards (max 5)"*. A number typed into a check
   is usually the second copy this repository warns about; here it is the requirement itself, so the
   check fails if somebody lowers the constant back without being asked to. */
is('five library cards', box.N, 5);
is('ten qualifications, seven boxes each — four, the received year and the two ticks', [box.QMAX, box.QFIELDS.length], [10, 70]);
is('the first card is named lib1_*', box.FIELDS.slice(0, 3), ['lib1_name', 'lib1_no', 'lib1_pin']);

/* ---------- THE ROUND TRIP, WHICH IS THE WHOLE POINT ---------------------------------------------
   Boxes -> rows (what `updateProfile` writes with `writeOwnRows_`) -> the person's rows read back
   (`ownRows_`) -> boxes. `person_id` is what ties a row to its person, so rows for somebody else in
   the same tab must never come back into this person's form. */
const cards = (...rows) => {
  const f = {};
  rows.forEach((r, i) => {
    f['lib' + (i + 1) + '_name'] = r[0];
    f['lib' + (i + 1) + '_no']   = r[1];
    f['lib' + (i + 1) + '_pin']  = r[2];
  });
  return f;
};
const ME = { person_id: 'P-ME' };
const asRows = (list, pid) => list.map(x => Object.assign({ person_id: pid || 'P-ME' }, x));
const store = (quals, libs) => box.setStore({ qualifications: quals || [], library_cards: libs || [] });
const trip = f => {
  store([], asRows(box.libIn(f)));
  const back = box.libOut(ME);
  const out = {};
  box.FIELDS.forEach(k => { if (f[k] !== undefined) out[k] = back[k]; });
  return out;
};

is('one card comes back as it went in',
   trip(cards(['Merton', '2000000000000', '0000'])),
   cards(['Merton', '2000000000000', '0000']));
is('three cards come back as they went in',
   trip(cards(['Merton', '20000000001', '0000'],
              ['Sutton', '20000000002', '0000'],
              ['Wandsworth Town and Putney', '20000000003', '0000'])),
   cards(['Merton', '20000000001', '0000'],
         ['Sutton', '20000000002', '0000'],
         ['Wandsworth Town and Putney', '20000000003', '0000']));
/* A ROW HAS NO SEPARATORS TO PROTECT, so what is typed is what is kept — a colon or a pipe that the
   packed cell had to strip or parse around is just a character now. */
is('a colon and a pipe in a library name survive as typed',
   trip(cards(['Merton: Wimbledon|West', '2000000000000', '0000'])),
   cards(['Merton: Wimbledon|West', '2000000000000', '0000']));
is('an empty card is not written, wherever it is — a row has no position to keep',
   box.libIn(cards(['Merton', '1', '0000'], ['', '', ''], ['Sutton', '3', '0000'])).map(c => c.library),
   ['Merton', 'Sutton']);
is('nothing typed at all is no rows', box.libIn(cards(['', '', ''])), []);
const blanks = n => Array.from({ length: n }, () => ['', '', '']);
store([], []);
is('no rows unpack to empty boxes', box.libOut(ME), cards(...blanks(box.N)));
store([], asRows([{ library: 'Theirs', card_number: '9', pin: '0000' }], 'P-SOMEBODY'));
is('somebody else\'s card never comes into this form', box.libOut(ME), cards(...blanks(box.N)));

/* ---------- THE QUALIFICATIONS -------------------------------------------------------------------
   `teach` IS THE SPECIALISM (one on the page, the gold chip under "Teaches") and `can_teach` is
   everything else taught. On the way back a specialism is also taught, so the form's Can teach box
   comes back ticked beside it. */
const q7 = (...rows) => {
  const f = {};
  rows.forEach((r, i) => ['', '_level', '_board', '_grade', '_received', '_teach', '_spec'].forEach((sfx, j) => {
    f['qual_' + (i + 1) + sfx] = r[j];
  }));
  return f;
};
is('a qualification becomes one row, the institution in its own column',
   box.qIn(q7(['Maths', 'A-Level', 'Hill Top School', 'B', '2019', 'TRUE', ''])),
   [{ subject: 'Maths', level: 'A-Level', institution: 'Hill Top School', grade: 'B', completed: '2019',
      teach: 'FALSE', can_teach: 'TRUE' }]);
is('a specialism is teach, and not can_teach as well',
   (q => [q.teach, q.can_teach])(box.qIn(q7(['Maths', 'GCSE', '', '9', '', 'TRUE', 'TRUE']))[0]), ['TRUE', 'FALSE']);
is('only one specialism survives the server, the first',
   box.qIn(q7(['Maths', 'GCSE', '', '9', '', '', 'TRUE'], ['Physics', 'GCSE', '', '8', '', '', 'TRUE'])).map(q => q.teach),
   ['TRUE', 'FALSE']);
is('an empty qualification in the middle is dropped',
   box.qIn(q7(['Maths', 'GCSE', '', '9'], ['', '', '', ''], ['Physics', 'GCSE', 'AQA', '8'])).map(q => q.subject),
   ['Maths', 'Physics']);
store(asRows(box.qIn(q7(['Bible and Theology', 'Degree', 'UWTSD', '', 'Present', '', ''],
                       ['Maths', 'GCSE', 'Hill Top', '8', '2017', '', 'TRUE']))));
is('and the rows come back into the same boxes',
   (o => [o.qual_1, o.qual_1_board, o.qual_1_received, o.qual_2, o.qual_2_teach, o.qual_2_spec, o.qual_3])(box.qOut(ME)),
   ['Bible and Theology', 'UWTSD', 'Present', 'Maths', 'TRUE', 'TRUE', '']);
store(asRows(Array.from({ length: 11 }, (_, i) => ({ subject: 'S' + i, level: 'GCSE', grade: '1' }))));
is('ten fit, and an eleventh row is not invented into a box', box.qList(ME).length, 10);
store(asRows([{ subject: 'Maths', teach: 'TRUE' }, { subject: 'Physics', teach: 'TRUE' }]));
is('two teach rows typed into the sheet still give one specialism, the first',
   box.qList(ME).map(q => q.spec), [true, false]);
store(asRows([{ subject: 'Maths', level: 'GCSE' }], 'P-SOMEBODY'));
is('somebody else\'s qualification never comes into this form', box.qList(ME).length, 0);

/* ---------- WHAT A TUTOR TEACHES IS DERIVED FROM THE TICKS, NOT KEPT ------------------------------
   The card's "Teaches" and "Can also teach" read this. The specialism first; a subject ticked twice
   is one phrase; a tutor with no specialism has no "Teaches" rather than their first "can teach"
   promoted into it. */
store(asRows([{ subject: 'English', level: 'KS3', can_teach: 'TRUE' },
              { subject: 'Maths', level: 'GCSE', teach: 'TRUE' },
              { subject: 'english', level: 'ks3', can_teach: 'TRUE' },
              { subject: 'Latin', level: '' }]));
is('the specialism first, then what else they teach, deduped, and nothing untaught',
   box.teaches(ME), { main: 'Maths (GCSE)', all: ['Maths (GCSE)', 'English (KS3)'], mainSubject: 'Maths', mainLevel: 'GCSE' });
store(asRows([{ subject: 'English', level: 'KS3', can_teach: 'TRUE' }]));
is('no specialism is no Teaches', box.teaches(ME).main, '');
store([], []);

/* ---------- THE VENUES: A SAVE THAT MOVES NOTHING WRITES NOTHING ----------------------------------
   `others.concat(mine)` put this person at the END of the cell on every Save, so a Save with nothing
   touched rewrote it and retired the payload. */
{
  const me = { person_id: 'P-T1', handle: 'tee' };
  const rows = [{ name: 'Sutton Library', tutors_happy_here: 'P-T1, someone-else' },
                { name: 'Online', tutors_happy_here: 'someone-else' }];
  is('the venues already chosen, saved again, write nothing',
     box.vWrites(me, 'Sutton Library', rows).length, 0);
  is('a venue added is appended to the others',
     box.vWrites(me, 'Sutton Library, Online', rows).map(w => w.cell), ['someone-else, P-T1']);
  is('a venue taken off keeps everybody else in their order',
     box.vWrites(me, '', rows).map(w => w.cell), ['someone-else']);
}

/* ---------- THE PHONE: A COUNTRY CODE AND A NUMBER, ONE CELL ------------------------------------ */
is('a phone packs as code, space, number',
   box.phIn({ phone_cc: '+44', phone_no: '7700 900123' }), '+44 7700 900123');
is('and the trunk 0 comes off',
   box.phIn({ phone_cc: '+44', phone_no: '07700 900123' }), '+44 7700 900123');
is('a number typed with its own +44 is not given it twice',
   box.phIn({ phone_cc: '+44', phone_no: '+44 7700 900123' }), '+44 7700 900123');
is('nor one typed with 0044',
   box.phIn({ phone_cc: '+44', phone_no: '0044 7700 900123' }), '+44 7700 900123');
is('an empty number is an empty cell, not a bare code',
   box.phIn({ phone_cc: '+44', phone_no: '' }), '');
is('a legacy 07… reads as UK',
   box.phOut('07700 900123'), { phone_cc: '+44', phone_no: '7700 900123' });
is('the longest matching code wins, so +353 is not +3',
   box.phOut('+353 87 123 4567').phone_cc, '+353');
is('00 is read as +',
   box.phOut('0044 7700 900123'), { phone_cc: '+44', phone_no: '7700 900123' });
is('the cell round-trips',
   box.phIn(box.phOut('+1 415 555 0100')), '+1 415 555 0100');

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

/* ================================================================================================
   AN EXAM DATE, WHICH GOES OUT AS ISO AND MAY ARRIVE AS ANYTHING THE SHEET HOLDS.

   `isoDate_` IS THE ONE THING BETWEEN A CELL AND AN EMPTY PICKER. A date input silently rejects any
   value that is not `yyyy-mm-dd` — so every case below where the answer is NOT empty is a case where
   getting it wrong loses a date on the next save, with nothing on screen saying so.

   THE TIMEZONE CASE IS THE ONE THAT CANNOT BE SEEN BY READING. `new Date('2027-05-14')` is UTC
   midnight, so in any timezone behind UTC it reads back as the 13th — the `parseWhen` fault this
   repository records reading `2026-09-15` as 26 September 2015. `isoDate_` matches and re-spells
   rather than parsing, so the assertion below holds wherever the script runs.
================================================================================================ */
is('an ISO cell is already the shape the picker speaks', box.iso('2027-05-14'), '2027-05-14');
is('A REAL DATE comes back as ISO — Sheets stores a typed-in date as one',
   box.iso(new Date(2027, 4, 14)), '2027-05-14');
is('and its month and day are padded', box.iso(new Date(2027, 0, 5)), '2027-01-05');
is('a dd/mm/yyyy cell is re-spelled, never read as mm/dd', box.iso('14/05/2027'), '2027-05-14');
is('a single-digit day and month are padded on the way', box.iso('5/1/2027'), '2027-01-05');
is('an empty cell is an empty picker', box.iso(''), '');
is('and so is something nobody can read as a date', box.iso('after half term'), '');
is('THE ROUND TRIP IS EXACT, which is the whole of it', box.iso(box.iso('2027-05-14')), '2027-05-14');

/* AND WHY IT MAY NOT BE WRITTEN. Every one of these is a request that did NOT come from the form —
   a date input cannot produce them — and `doPost` is reachable by anybody with the URL. */
const isoNo = v => !!box.isoNo(v, 'date');
is('blank is allowed — clearing an exam date clears it', isoNo(''), false);
is('a real date is allowed', isoNo('2027-05-14'), false);
is('A PAST DATE IS ALLOWED, because an exam already sat is a fact', isoNo('2019-05-14'), false);
is('dd/mm/yyyy is REFUSED, because the picker could not hold it back', isoNo('14/05/2027'), true);
is('and so is anything that is not a date at all', isoNo('after half term'), true);
is('there is no month 13', isoNo('2027-13-01'), true);
is('there is no 31st of September', isoNo('2027-09-31'), true);
is('29 February 2028 is a real day', isoNo('2028-02-29'), false);
is('29 February 2027 is not', isoNo('2027-02-29'), true);
is('a year outside the sensible range is refused', isoNo('0202-05-14'), true);

/* THE LIST IS WHAT KEEPS THE TWO HALVES IN STEP, and a rule that named the columns here would be the
   second copy. What this asks is that it is not EMPTY — which is what a rename would leave it, with
   every case above still passing and not one column going through either function. */
is('the server knows of at least one date column', box.DATE_COLS.length > 0, true);
is('and `date_of_birth` is NOT one of them — it is three boxes and a dd/mm/yyyy cell',
   box.DATE_COLS.indexOf('date_of_birth'), -1);

/* ---------- AND THE TWO HALVES OF IT LIVE IN DIFFERENT FILES -------------------------------------
   `DATE_COLS` IN `constants.gs` DECIDES WHAT THE SERVER SENDS AS ISO; `FIELD_IS_DATE` IN `js/me.js`
   DECIDES WHAT THE FORM DRAWS AS A PICKER. Nothing anywhere makes them agree, and they must: a
   column in the list whose name does not match the regex gets an ISO value from the server and a
   plain text box on the phone, so `2027-05-14` is what somebody is asked to edit and `14/05/2027`
   is what they type — refused by `isoRefusal_`, which is a save that fails on a page that looks
   fine. The reverse is worse and silent: a column that matches the regex but is NOT in the list
   draws a picker and is sent whatever the cell holds, so a real Date opens it EMPTY and the next
   save writes the empty over it.

   THE REGEX IS READ OUT OF THE FILE rather than written again here, which is the whole point — a
   copy of `/_date$/` in this check would agree with itself and with nothing else, the fault this
   file's own header names about a second implementation. */
const reSrc = grab(me, /const FIELD_IS_DATE = \/[^\n]*\/;/, 'FIELD_IS_DATE in js/me.js');
const FIELD_IS_DATE = new RegExp(reSrc.replace(/^.*?=\s*\//, '').replace(/\/;\s*$/, ''));
box.DATE_COLS.forEach(f => {
  is('the form draws `' + f + '` as a picker, because the server sends it as one',
     FIELD_IS_DATE.test(f), true);
});
is('and it does NOT match `date_of_birth`, which is three boxes',
   FIELD_IS_DATE.test('date_of_birth'), false);

/* ---------- THE PHOTOGRAPHS ---------------------------------------------------------------------
   Every case is a way a gallery goes wrong without anything failing: a link that splits in two on
   the next read, a picture drawn twice, a blank that becomes a hole in the grid, a note typed into a
   link box drawn as a broken picture on a public card, and the face repeated under itself. */
const A = 'https://example.org/a.jpg', B = 'https://example.org/b.jpg', C = 'https://example.org/c.jpg';
const pf = o => { const f = {}; for (let i = 1; i <= box.PMAX; i++) f['photos_' + i] = o[i] || ''; return f; };
is('three photographs go out as three and come back as three',
   box.pOut(box.pIn(pf({ 1: A, 2: B, 3: C }))), Object.assign(pf({}), { photos_1: A, photos_2: B, photos_3: C }));
is('a gap in the middle closes up rather than drawing a hole', box.pIn(pf({ 1: A, 3: B })), A + ' | ' + B);
is('the same link twice is one photograph', box.pIn(pf({ 1: A, 2: A, 3: B })), A + ' | ' + B);
is('a pipe inside a link is escaped, so it stays one photograph',
   box.pOut(box.pIn(pf({ 1: 'https://x.org/a|b.jpg' }))).photos_1, 'https://x.org/a%7Cb.jpg');
is('nothing typed packs to an empty cell', box.pIn(pf({})), '');
is('an empty cell opens eight empty boxes', box.pOut(''), pf({}));
is('every box is a slot the form draws', Object.keys(box.pOut('')).length, box.PMAX);
is('a link is not refused', box.pNo(pf({ 1: A, 2: B })), '');
is('a sentence in a link box is refused, by its number', /Photo 2/.test(box.pNo(pf({ 1: A, 2: 'my cat' }))), true);
is('the card leaves out the face and anything that is not a link',
   box.pList({ photo: A, photos: [A, 'a note', B, B].join(' | ') }), [B]);

if (bad) { console.log('\nFAILED — ' + bad + ' packed-cell case(s) wrong.'); process.exit(1); }
console.log('\nlibrary cards: ' + box.N + '   fields: ' + box.FIELDS.length
          + '   packed cells: availability, date_of_birth, phone, photos   rows: qualifications, library_cards'
          + '   date columns: ' + box.DATE_COLS.join(', '));
console.log('OK — every packed cell and every date column comes back as it went in.');
