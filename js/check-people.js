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
  grab(core,   /function libCardsOut\([\s\S]*?\n\}/, 'libCardsOut'),
  grab(core,   /function libCardsIn\([\s\S]*?\n\}/, 'libCardsIn'),
  /* ---------- THE TWO SHELVES THAT READ THE ROW RATHER THAN THE CELL -------------------------------
     `qualsList_` AND `teachAlsoList_` ARE THE MIGRATION: a row nobody has saved since `quals` and
     `teaches_also` existed has those cells empty and its answers in `qual_1…3` and `teaches_2`, and a
     reader that looked only at the new cell would show an empty shelf — which the next Save would
     then mirror back over the old cells. So the cases below include a legacy row. */
  grab(consts, /const QUAL_MAX\s*=[^;]*;/, 'QUAL_MAX'),
  grab(consts, /const QUAL_FIELDS\s*=\s*\(\(\)[\s\S]*?\}\)\(\);/, 'QUAL_FIELDS'),
  grab(consts, /const TEACH_ALSO_MAX\s*=[^;]*;/, 'TEACH_ALSO_MAX'),
  grab(core,   /function qualsList_\([\s\S]*?\n\}/, 'qualsList_'),
  grab(core,   /function qualsOut\([\s\S]*?\n\}/, 'qualsOut'),
  grab(core,   /function qualsIn\([\s\S]*?\n\}/, 'qualsIn'),
  grab(core,   /function teachAlsoList_\([\s\S]*?\n\}/, 'teachAlsoList_'),
  grab(core,   /const teachAlsoPhrase_\s*=[^;]*;/, 'teachAlsoPhrase_'),
  grab(core,   /function teachAlsoOut\([^\n]*\}/, 'teachAlsoOut'),
  grab(core,   /function teachAlsoIn\([\s\S]*?\n\}/, 'teachAlsoIn'),
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
].join('\n\n');

/* THE FOUR APPS SCRIPT HELPERS THOSE FIVE REACH FOR, copied rather than imported — the same
   arrangement `check-handles.js` uses and for its stated reason: if one of them changes meaning in
   `constants.gs`, a case here fails, which is what a stub is for. */
const PRELUDE = `
  const S = v => String(v ?? '').trim();   // constants.gs's own — it TRIMS, and the packers rely on it
  const norm = v => S(v).toLowerCase().replace(/\\s+/g, '').trim();
  const TRUE_ = v => v === true || /^(true|yes|1|✓)$/i.test(S(v).trim());
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
  + ' box.aList = teachAlsoList_; box.aOut = teachAlsoOut; box.aIn = teachAlsoIn;'
  + ' box.AMAX = TEACH_ALSO_MAX; box.phOut = phoneOut; box.phIn = phoneIn;'
  + ' box.pOut = photosOut; box.pIn = photosIn; box.pNo = photosRefusal_; box.pList = photosList_;'
  + ' box.PMAX = PHOTO_MAX;')(box);

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
is('eight also-teach subjects', box.AMAX, 8);
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
const blanks = n => Array.from({ length: n }, () => ['', '', '']);
is('an empty cell unpacks to empty boxes',
   box.libOut(''), cards(...blanks(box.N)));
is('a ragged item does not throw and does not invent',
   box.libOut('Merton'), cards(['Merton', '', ''], ...blanks(box.N - 1)));

/* ---------- THE QUALIFICATIONS: ROUND TRIP, MIGRATION, COMPACTION, AND THE CAP ------------------ */
const quals = (...rows) => {
  const f = {};
  rows.forEach((r, i) => ['', '_level', '_board', '_grade'].forEach((sfx, j) => {
    f['qual_' + (i + 1) + sfx] = r[j];
  }));
  return f;
};
is('a qualification packs as subject:level:board:grade~received~flags',
   box.qIn(quals(['Maths', 'A-Level', 'Edexcel', 'B'])), 'Maths:A-Level:Edexcel:B~~');
is('and comes back into the same four boxes',
   box.qOut({ quals: 'Maths:A-Level:Edexcel:B' }).qual_1_board, 'Edexcel');
is('a colon in the subject survives, because the item is read from the right',
   box.qList({ quals: 'Maths: Pure:A-Level:Edexcel:B' })[0].subject, 'Maths: Pure');
/* COMPACTED, UNLIKE THE LIBRARY. A gap would come back as an empty card mid-shelf above the
   `Add another`, and a list of qualifications has no slot anybody remembers by position. */
is('an empty qualification in the middle is dropped, not kept',
   box.qIn(quals(['Maths', 'GCSE', '', '9'], ['', '', '', ''], ['Physics', 'GCSE', 'AQA', '8'])),
   'Maths:GCSE::9~~|Physics:GCSE:AQA:8~~');
is('ten fit and are all kept',
   box.qList({ quals: Array.from({ length: 10 }, (_, i) => 'S' + i + ':GCSE::1').join('|') }).length, 10);
is('an eleventh in the cell is not invented into a box',
   box.qList({ quals: Array.from({ length: 11 }, (_, i) => 'S' + i + ':GCSE::1').join('|') }).length, 10);
is('a pipe typed into a subject does not become a second qualification',
   box.qList({ quals: box.qIn(quals(['Maths|Stats', 'GCSE', '', '9'])) }).length, 1);
/* THE MIGRATION, and the case that would have lost data: a row saved before `quals` existed. */
const legacy = { qual_1: 'Maths', qual_1_level: 'A-Level', qual_1_board: 'Edexcel', qual_1_grade: 'B',
                 qual_2: 'English', qual_2_level: 'GCSE', qual_2_grade: '7' };
is('an empty quals cell reads the old qual_1..3 columns',
   box.qList(legacy).map(q => q.subject + '/' + q.grade), ['Maths/B', 'English/7']);
is('and the form is filled from them',
   [box.qOut(legacy).qual_1, box.qOut(legacy).qual_2_level, box.qOut(legacy).qual_3], ['Maths', 'GCSE', '']);
is('a filled quals cell wins over the old columns',
   box.qList(Object.assign({ quals: 'Physics:GCSE:AQA:8' }, legacy)).length, 1);

/* ---------- THE RECEIVED YEAR AND THE TWO TICKS -------------------------------------------------
   The tail every item carries now. The cases that would lose data are the legacy ones: an item from
   before the tail must still read, and a row with no ticks written must inherit them from
   `teaches_1`/`teaches_also` or the first Save blanks what a tutor teaches. */
const q7 = (...rows) => {
  const f = {};
  rows.forEach((r, i) => ['', '_level', '_board', '_grade', '_received', '_teach', '_spec'].forEach((sfx, j) => {
    f['qual_' + (i + 1) + sfx] = r[j];
  }));
  return f;
};
is('the received year and the ticks pack onto the tail',
   box.qIn(q7(['Maths', 'A-Level', 'Edexcel', 'B', '2019', 'TRUE', 'FALSE'])), 'Maths:A-Level:Edexcel:B~2019~t');
is('a specialism is taught even when Teach was left unticked',
   box.qIn(q7(['Maths', 'GCSE', '', '9', '', 'FALSE', 'TRUE'])), 'Maths:GCSE::9~~ts');
is('only one specialism survives the server, the first',
   box.qIn(q7(['Maths', 'GCSE', '', '9', '', '', 'TRUE'], ['Physics', 'GCSE', '', '8', '', '', 'TRUE'])),
   'Maths:GCSE::9~~ts|Physics:GCSE::8~~');
is('a tilde typed into a subject cannot forge a tail',
   box.qList({ quals: box.qIn(q7(['Maths~x~s', 'GCSE', '', '9', '', '', ''])) })[0].spec, false);
is('the tail round-trips through the form',
   (o => [o.qual_1_received, o.qual_1_teach, o.qual_1_spec])(box.qOut({ quals: 'Bible:Degree::~Present~t' })),
   ['Present', 'TRUE', '']);
is('an item from before the tail still reads',
   box.qList({ quals: 'Maths:GCSE:AQA:9' })[0].grade, '9');
is('with no ticks written, teaches_1 ticks the matching qualification as the specialism',
   (q => [q.teach, q.spec])(box.qList({ quals: 'Maths:GCSE:AQA:9|English:GCSE::7',
     teaches_1: 'Maths', teaches_1_level: 'GCSE', teaches_also: 'English (GCSE)' })[0]), [true, true]);
is('and teaches_also ticks Teach on the others',
   (q => [q.teach, q.spec])(box.qList({ quals: 'Maths:GCSE:AQA:9|English:GCSE::7',
     teaches_1: 'Maths', teaches_1_level: 'GCSE', teaches_also: 'English (GCSE)' })[1]), [true, false]);
is('a subject taught with no matching qualification becomes one rather than vanishing',
   box.qList({ teaches_1: 'Chemistry', teaches_1_level: 'A-Level' }).map(q => q.subject + '/' + q.spec),
   ['Chemistry/true']);
is('once ticks are written, teaches_1 no longer re-ticks an unticked list',
   box.qList({ quals: 'Maths:GCSE::9~~', teaches_1: 'Maths', teaches_1_level: 'GCSE' })[0].teach, false);
is('what they were studying becomes a qualification received Present',
   (q => q.subject + '/' + q.received)(box.qList({ studying: 'Bible and Theology', studying_at: 'UWTSD' })[0]),
   'Bible and Theology — UWTSD/Present');
is('and is not added twice once a Present qualification exists',
   box.qList({ quals: 'Bible:Degree::~Present~', studying: 'Bible' }).length, 1);

/* ---------- THE PHONE: A COUNTRY CODE AND A NUMBER, ONE CELL ------------------------------------ */
is('a phone packs as code, space, number',
   box.phIn({ phone_cc: '+44', phone_no: '7700 900123' }), '+44 7700 900123');
is('and the trunk 0 comes off',
   box.phIn({ phone_cc: '+44', phone_no: '07700 900123' }), '+44 7700 900123');
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

/* ---------- WHAT ELSE A TUTOR TEACHES ----------------------------------------------------------
   ONE COLUMN, posted by the phone's multi-select as the phrases the card prints. What the server
   owes it is tidying and the legacy fallback, and both are silent when wrong. */
is('the cell reads back as it went in',
   box.aIn('Maths (GCSE), English (KS3)'), 'Maths (GCSE), English (KS3)');
is('a pipe typed by hand is a separator too',
   box.aIn('Maths (GCSE)|English (KS3)'), 'Maths (GCSE), English (KS3)');
is('a subject with no level has no brackets', box.aIn('Chess'), 'Chess');
is('a level with no subject is not a subject', box.aIn('(GCSE)'), '');
is('the same subject twice is one subject, whatever the case',
   box.aIn('Maths (GCSE), maths (gcse)'), 'Maths (GCSE)');
is('an empty post stays empty, which is a tutor clearing the list', box.aIn(''), '');
is('the level comes apart from the subject',
   box.aList({ teaches_also: 'Maths (GCSE), English (KS3)' })[1], { subject: 'English', level: 'KS3' });
is('an empty teaches_also reads the old teaches_2',
   box.aList({ teaches_2: 'Physics', teaches_2_level: 'A-Level' }), [{ subject: 'Physics', level: 'A-Level' }]);
is('and the form is filled from it', box.aOut({ teaches_2: 'Physics', teaches_2_level: 'A-Level' }),
   'Physics (A-Level)');
is('a filled teaches_also wins over teaches_2',
   box.aList({ teaches_also: 'Chess', teaches_2: 'Physics' }).map(x => x.subject), ['Chess']);
is('no more than eight are kept',
   box.aIn(Array.from({ length: 9 }, (_, i) => 'S' + i).join(', ')).split(', ').length, 8);

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
          + '   packed cells: availability, library_card, date_of_birth, quals, teaches_also, photos'
          + '   date columns: ' + box.DATE_COLS.join(', '));
console.log('OK — every packed cell and every date column comes back as it went in.');
