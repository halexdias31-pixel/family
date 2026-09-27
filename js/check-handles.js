/* ==================================================================================================
   @family. — check-handles.js

   A USERNAME IS THE ONE THING A PERSON TYPES THAT EVERYBODY ELSE HAS TO LOOK AT.

   Every other check here measures whether the app WORKS. This one and `check-marking.js` are the two
   that measure whether it is SAFE to hand to a child, and the failures are not symmetrical:

     a rude handle let through   is on a tutoring site, beside children's names, until somebody sees
                                 it — and the person who sees it first is a parent
     a real name refused         is somebody who has done nothing, told no, with no way to argue

   The second is why `HANDLE_ALLOWED` exists at all, and why half the cases below are words that
   must be let through rather than words that must not.

   ---------- AND THE RULE THAT IS NOT ABOUT WORDS AT ALL ---------------------------------------------

   `findPerson` resolves a person by id, then `full_name`, then `first + last`, then `handle`, then
   `username`, FIRST MATCH WINS. A handle that duplicates any of those makes `changePin` check the
   PIN somebody typed against ANOTHER PERSON'S ROW and tell them their own PIN is wrong — the denial
   CLAUDE.md already records, which happened by accident to one person. Letting people choose their
   own handle turns that accident into something a person can do on purpose, so the uniqueness cases
   below are the ones that matter most even though the word list is what anybody asks about first.

   IT CUTS THE TWO FUNCTIONS OUT OF `people.gs` AND RUNS THEM, which is `check-marking.js`'s method
   and is safe for the same reason: they touch nothing else. A second implementation here would be a
   second thing to keep in step — the fault this repository records under `childrenOf`, under
   `link`/`source_url` and under `factsNow_`.

   ---------- AND THE OTHER THING A PERSON MAY ONLY CHANGE ONCE A MONTH -------------------------------

   `pricingRefusal_` IS THE SAME MECHANISM OVER FOUR COLUMNS — a tutor's rate, their extra-seat
   fraction and the two ends of the class sizes they take, which between them are what a family is
   quoted and what every booking already taken was priced and seated against. It lives beside
   `handleRefusal` in `people.gs` *so that this file can run it*: written inside `updateProfile` it
   would be six lines nothing here can reach, which is the shape this repository records every time a
   check could not see its subject.

   ITS OWN CASES ARE BELOW THE USERNAMES, and two of them are faults that would have been silent.
   A page that posts the four unchanged must NOT be refused, because that form posts all four on
   every save whether or not anybody touched one. And ONE CLOCK MEANS ONE CLOCK: a rate changed five
   days ago must refuse a change to the seat cap today, or the four stamps somebody could walk round
   a week at a time are back with one name on them.

   RUN IT:  node js/check-handles.js
================================================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const people = fs.readFileSync(path.join(ROOT, 'backend', 'people.gs'), 'utf8');
const consts = fs.readFileSync(path.join(ROOT, 'backend', 'constants.gs'), 'utf8');

/* ---------- CUT BY NAME, AND FAIL LOUDLY IF A NAME IS NOT THERE -------------------------------------
   A check that cannot reach its subject must exit non-zero — `check-booking.js` printed "nothing to
   check" and exited 0 for months, which read as a pass. */
function grab(src, re, what) {
  const m = src.match(re);
  if (!m) { console.log('FAILED — could not find ' + what + ' to check.'); process.exit(1); }
  return m[0];
}
const SRC = [
  grab(consts, /const HANDLE_COOLDOWN_DAYS[^;]*;/, 'HANDLE_COOLDOWN_DAYS'),
  grab(consts, /const HANDLE_SHAPE[^;]*;/, 'HANDLE_SHAPE'),
  grab(consts, /const HANDLE_RESERVED\s*=\s*\[[\s\S]*?\];/, 'HANDLE_RESERVED'),
  grab(consts, /const HANDLE_BLOCKED\s*=\s*\[[\s\S]*?\];/, 'HANDLE_BLOCKED'),
  grab(consts, /const HANDLE_ALLOWED\s*=\s*\{[\s\S]*?\n\};/, 'HANDLE_ALLOWED'),
  grab(people, /function handleFold_\([\s\S]*?\n\}/, 'handleFold_'),
  /* THE RESOLUTION CHAIN ITSELF, because an e-mail is a rung on it now and nothing else here could
     see whether that rung collides with the name rungs above it. */
  grab(people, /function findPerson\([\s\S]*?\n\}\n/, 'findPerson'),
  grab(people, /function emailRefusal_\([\s\S]*?\n\}/, 'emailRefusal_'),
  grab(people, /function handleTrouble_\([\s\S]*?\n\}\n/, 'handleTrouble_'),
  grab(consts, /const PRICING_COOLDOWN_DAYS[^;]*;/, 'PRICING_COOLDOWN_DAYS'),
  /* THE FOUR FIELDS THE RULE IS ABOUT, READ OUT OF `constants.gs` RATHER THAN LISTED HERE. A copy
     would agree with itself and with nothing else — so a fifth field added there is under these
     cases the same afternoon, and one deleted there fails them. */
  grab(consts, /const PRICING_FIELDS[^;]*;/, 'PRICING_FIELDS'),
  grab(people, /function pricingMoved_\([\s\S]*?\n\}/, 'pricingMoved_'),
  grab(people, /function pricingRefusal_\([\s\S]*?\n\}/, 'pricingRefusal_'),
].join('\n\n');

/* The eight Apps Script helpers those two reach for, and nothing else. If one of them ever changes
   meaning, this stops agreeing with the backend and that is the point of stubbing rather than
   importing: they are the backend's, copied, and a drift shows up as a case failing. */
const PRELUDE = `
  const S = v => (v === undefined || v === null ? '' : String(v));
  /* ---------- THE BACKEND'S OWN, TO THE CHARACTER -----------------------------------------------
     THIS HAD DRIFTED AND NOTHING CAUGHT IT. constants.gs strips everything that is not a letter or
     a digit; this stub folded whitespace and kept punctuation, which is a different function. The
     note above says a drift "shows up as a case failing" -- it does not, because every handle
     HANDLE_SHAPE allows is already alphanumeric-plus-underscore, so the two agree on exactly the
     strings the cases happen to use. Where they disagree is the CLASH check, which runs key() over
     full_name: "Ada Lovelace" is adalovelace to the backend and "ada lovelace" to this, so a handle
     taken from somebody's real name would have been refused in production and allowed here. It is
     the real one now, and AdaLovelace below is the case that could not have passed before.

     NO BACKTICKS IN HERE. This whole block is inside a template literal, so one ends it -- which is
     the trap CLAUDE.md already records costing js/map.js a syntax error four files from the cause. */
  const key = v => S(v).toLowerCase().replace(/[^a-z0-9]/g, '');
  const norm = v => S(v).trim().toLowerCase();
  const sheetDate = v => (v instanceof Date ? v : (v ? new Date(v) : null));
  const fmtDate = d => d.toISOString().slice(0, 10);
  let ROWS = [];
  const TAB = { people: 'people' };
  const read = () => ({ rows: ROWS });
  const setRows = r => { ROWS = r; };
  const N = v => { const x = parseFloat(String(v == null ? '' : v).replace(/[£$,\s]/g, ''));
                   return isNaN(x) ? 0 : x; };
`;

const box = {};
new Function('box', PRELUDE + SRC + '\nbox.trouble = handleTrouble_; box.fold = handleFold_;'
           + ' box.setRows = setRows; box.price = pricingRefusal_;'
           + ' box.moved = pricingMoved_; box.fields = PRICING_FIELDS;'
           + ' box.find = findPerson; box.mail = emailRefusal_;')(box);

const DAY = 864e5;
const ago = n => new Date(Date.now() - n * DAY);

/* THE OTHER PEOPLE ON THE SHEET. One of each thing `findPerson` matches on, because the uniqueness
   test has to refuse ALL of them and checking `handle` alone is the fault this is written for. */
const OTHERS = [
  { person_id: 'P002', handle: 'ada99',   username: 'adalovelace', full_name: 'Ada Lovelace',
    first_name: 'Ada',  last_name: 'Lovelace' },
  { person_id: 'P003', handle: 'grace_h', username: 'gracehopper', full_name: 'Grace Hopper',
    first_name: 'Grace', last_name: 'Hopper' },
];
const ME    = { person_id: 'P001', handle: 'paul', username: 'paulsmith', full_name: 'Paul Smith',
                first_name: 'Paul', last_name: 'Smith' };
const MEold = Object.assign({}, ME, { handle_changed_at: ago(200) });
const MEnew = Object.assign({}, ME, { handle_changed_at: ago(5)  });

/* ---------- EVERY CASE IS A FAULT THAT HAPPENED OR WOULD HAVE ---------------------------------------
   `no` means "must be refused", `yes` means "must be allowed". The word beside it is the reason,
   printed when a case fails, because "case 31 failed" tells nobody anything. */
const CASES = [
  // --- the shape
  ['no',  'ab',            ME, 'two characters'],
  ['no',  'a'.repeat(21),  ME, 'twenty-one characters'],
  ['no',  '9lives',        ME, 'starts with a digit'],
  ['no',  'paul.smith',    ME, 'a dot is not allowed'],
  ['no',  'paul-smith',    ME, 'a hyphen is not allowed'],
  ['no',  'paul smith',    ME, 'a space is not allowed'],
  ['no',  'раul_x',        ME, 'CYRILLIC а and р — looks exactly like paul_x and is a different string'],
  ['yes', 'paul_smith2',   ME, 'letters, digits, underscore, starts with a letter'],

  // --- names that would speak for the business
  ['no',  'admin',         ME, 'reserved'],
  ['no',  'office',        ME, 'reserved'],
  ['no',  'atfamily',      ME, 'reserved — the business itself'],
  ['no',  '0ffice',        ME, 'reserved, leet-spelled'],

  // --- the words
  ['no',  'fuckface',      ME, 'plain'],
  ['no',  'f4gg0t',        ME, 'leet: 4 and 0'],
  ['no',  'sh1t_lord',     ME, 'leet: 1'],
  ['no',  'b0ll0cks',      ME, 'leet, twice'],
  ['no',  'w4nker99',      ME, 'leet plus digits'],
  ['no',  'n1gg3r',        ME, 'the one that matters most'],
  ['no',  'analfun',       ME, 'a banned word with an innocent word after it is not innocent'],
  ['no',  'xxpaedoxx',     ME, 'padded either side'],

  // --- and the words those are inside, which must be let through
  ['yes', 'analysis',      ME, 'THE Scunthorpe case — the school subject'],
  ['yes', 'analyst99',     ME, 'an allowed word with digits after it'],
  ['yes', 'mr_analytic',   ME, 'an allowed word at the end'],
  ['yes', 'classic',       ME, 'contains no banned word, and is the word this site is about'],
  ['yes', 'cocktail',      ME, 'a rooster and a tail'],
  ['yes', 'peacock99',     ME, 'a bird'],
  ['yes', 'bassist',       ME, 'an instrument'],
  ['yes', 'scunthorpe',    ME, 'the town the problem is named after'],
  ['yes', 'titan',         ME, 'a moon'],
  ['yes', 'therapist',     ME, 'a job'],

  /* ---------- CASE IS KEPT FOR THE READER AND FOLDED FOR EVERY COMPARISON ---------------------
     Asked for as *"i would like peoples username logins to be case sensitive."* What changed is
     that `changeHandle` stores the letters as TYPED instead of lower-casing them; what deliberately
     did not change is any comparison, and these are the cases that say so. A version that made the
     matching case sensitive passes none of the four `no`s below — which is the whole reason they
     are here rather than a sentence in a comment. */
  ['yes', 'Paul_Smith2',   ME, 'CAPITALS ARE ALLOWED — the shape is tested on the folded form'],
  ['yes', 'PAULSMITH2',    ME, 'and all of them'],
  ['no',  'Ada99',         ME, 'a clash is a clash whatever case it is typed in'],
  ['no',  'AdaLovelace',   ME, 'another row\'s FULL NAME, folded — the real key() strips the space'],
  ['no',  'FuckFace',      ME, 'the block list folds too, or capitals walk past it'],
  ['yes', 'Analysis',      ME, 'and so does the allow list, or Scunthorpe comes back capitalised'],
  ['no',  'Admin',         ME, 'reserved, whatever case'],

  // --- taken, against every column findPerson answers to
  ['no',  'ada99',         ME, 'another row\'s handle'],
  ['no',  'gracehopper',   ME, 'another row\'s username'],
  ['no',  'grace_h',       ME, 'another row\'s handle, underscored'],
  ['yes', 'paul',          MEold, 'YOUR OWN handle is not a clash with yourself'],
  ['yes', 'paulsmith',     MEold, 'your own username is not a clash either'],

  // --- the cooldown
  ['no',  'newname',       MEnew, 'changed five days ago'],
  ['yes', 'newname',       MEold, 'changed two hundred days ago'],
  ['yes', 'newname',       ME,    'never changed — no cell, so no cooldown'],
];

function run() {
  box.setRows(OTHERS.concat([ME]));
  const bad = [];
  CASES.forEach(([want, handle, me, why]) => {
    const said = box.trouble(handle, me, false);
    const got = said ? 'no' : 'yes';
    if (got !== want) bad.push({ handle, want, why, said: said || '(allowed)' });
  });

  /* ---------- SIGNING IN WITH AN E-MAIL, AND THE COLLISION THAT MADE IT A DIFFERENT FOLD --------
     ASKED FOR AS *"i want people to be able to sign in with email as well."* `verifyLogin` resolves
     through `findPerson` and nothing else, so the rung there IS the feature — and the case that
     decides how it is written is `SAME` below.

     `alex@dias.com` AND A PERSON CALLED "Alex Dias Com" REDUCE TO ONE `key()`. That function strips
     everything that is not a letter or a digit, so an address matched the way every name above it
     is matched would put two different people on one search term — and `changePin` would then check
     the PIN somebody typed against the other one's row, which is the denial this repository records
     happening for real. Matching the address WHOLE, case-folded, makes it impossible rather than
     unlikely: the four cases below fail on any version that folds an address the way it folds a
     name, and pass on this one.

     AND THE RUNG IS LAST, which `KEEP` is for: every name that resolved before must go on resolving
     to the same row. */
  const MAILS = [
    { person_id: 'P010', handle: 'alexd', username: 'alexd', full_name: 'Alex Dias',
      first_name: 'Alex', last_name: 'Dias', email: 'alex@dias.com' },
    { person_id: 'P011', handle: 'adc',   username: 'adc',   full_name: 'Alex Dias Com',
      first_name: 'Alex', last_name: 'Dias Com', email: '' },
    { person_id: 'P012', handle: 'bee',   username: 'bee',   full_name: 'Bee Keeper',
      first_name: 'Bee', last_name: 'Keeper', email: 'BEE@Hive.co.uk' },
    /* ---------- AND A ROW WHOSE E-MAIL CELL HOLDS A NAME ---------------------------------------
       WHICH IS WHAT THE `@` GUARD IS FOR, and the only thing that makes it load-bearing: an
       address is matched WHOLE, so without the guard a cell into which somebody typed a person's
       name is a second way to reach that string — and the row it reaches is not the row whose name
       it is. A sheet somebody types into by hand has cells like this in it; the rule is that a rung
       looking for an address only ever fires on something shaped like one. */
    /* THE JUNK ROW SITS FIRST, and that is the whole of what makes this a test. `Array.find`
       returns the first ROW whose predicate is true, so the order of the rungs INSIDE the
       predicate decides nothing unless the wrong row is reached first. With Grace's own row above
       it, her name matches before anything looks at anybody's e-mail cell and the case passes
       whatever the rung does. */
    { person_id: 'P014', handle: 'someone', username: 'someone', full_name: 'Someone Else',
      first_name: 'Someone', last_name: 'Else', email: 'Grace Hopper' },
    { person_id: 'P013', handle: 'gracehop', username: 'gracehop', full_name: 'Grace Hopper',
      first_name: 'Grace', last_name: 'Hopper', email: '' },
  ];
  box.setRows(MAILS);
  const FINDS = [
    ['alex@dias.com',  'P010', 'an e-mail address signs you in'],
    ['ALEX@DIAS.COM',  'P010', 'and the case of it does not matter'],
    ['  bee@hive.co.uk  ', 'P012', 'nor does what the cell was typed in, nor the spaces round it'],
    ['alexdiascom',    'P011', 'THE COLLISION: this is a NAME, and it must find the person called it'],
    ['Alex Dias Com',  'P011', 'the same person by their own name'],
    ['Alex Dias',      'P010', 'and a name that is a prefix of it still finds its own row'],
    ['alexd',          'P010', 'a handle still wins before any address is looked at'],
    ['',               null,   'an empty box finds nobody, whatever blank cells are on the tab'],
    ['nobody@here.com', null,  'an address on no row finds nobody'],
    ['Grace Hopper',   'P013', 'A NAME IN AN E-MAIL CELL is not an address: the name wins'],
    ['grace hopper',   'P013', 'whatever case it is asked in'],
    /* ---------- THE GUARD IS WHAT PROTECTS THIS, AND THE RUNG ORDER IS NOT -----------------------
       I WROTE THE OPPOSITE FIRST AND THE MUTATION SAID NO. `Array.find` returns the first ROW whose
       predicate is true, so which rung sits where INSIDE that predicate decides nothing — the row
       order does. Dropping the `@` guard fires these two cases whether the address rung is first or
       last; moving the rung with the guard in place fires nothing. So the guard is the rule and the
       ordering is only about not changing what already resolved. Measured both ways rather than
       reasoned, which is what this file exists to make possible. */
  ];
  FINDS.forEach(([term, want, why]) => {
    const got = box.find(term);
    const id = got ? got.person_id : null;
    if (id !== want) bad.push({ handle: term || '(empty)', want: want || 'nobody', why,
                                said: id ? 'found ' + id : '(nobody)' });
  });

  /* AND THE ADDRESS IS A CREDENTIAL THE MOMENT IT RESOLVES, so two rows may not hold one. */
  const MAILCASES = [
    ['no',  'bee@hive.co.uk', MAILS[0], 'somebody else already answers to it'],
    ['no',  'BEE@HIVE.CO.UK', MAILS[0], 'and case does not get you round it'],
    ['yes', 'alex@dias.com',  MAILS[0], 'YOUR OWN address is not a clash with yourself'],
    ['yes', 'new@thing.com',  MAILS[0], 'an address nobody holds'],
    ['yes', '',               MAILS[0], 'clearing your address is not taking anybody\'s'],
  ];
  MAILCASES.forEach(([want, mail, me, why]) => {
    const said = box.mail(mail, me);
    const got = said ? 'no' : 'yes';
    if (got !== want) bad.push({ handle: mail || '(blank)', want, why, said: said || '(allowed)' });
  });
  box.setRows(OTHERS.concat([ME]));

  /* ---------- AND THE HALF THAT LIVES IN `dopost.gs`: WHAT IS STORED ---------------------------
     `handleTrouble_` ONLY EVER SAYS NO. Every case above tests the refusals, and not one of them
     can see what `changeHandle` WRITES — so a version that validates the typed form perfectly and
     then lower-cases it on the way into the cell passes all 48 of them, which is exactly the state
     this file was in before the case was kept.

     A GREP RATHER THAN A PARSE, for `check-backend.js`'s reason: the question has one right answer
     and no scope to get wrong. Two things must hold on the path from the posted field to the cell —
     nothing folds the case, and what is validated is what is written. A third variable in between
     would be a second spelling of the handle, which is the fault `handle`/`username` already is.

     THE BLOCK IS CUT OPENER-TO-CLOSER rather than guessed at from indentation, because
     `check-backend.js` records its own first version firing on the comment that explained it. */
  const post = fs.readFileSync(path.join(ROOT, 'backend', 'dopost.gs'), 'utf8');
  const at = post.indexOf("action === 'changeHandle'");
  const block = at < 0 ? '' : post.slice(at, post.indexOf("if (action === 'changePin')", at));
  if (!block) {
    console.log('FAILED — could not find the changeHandle block in dopost.gs to check.');
    process.exit(1);
  }
  const takes = /const want = S\(body\.handle\)\.trim\(\);/.test(block);
  const folds = /body\.handle[^;]*toLowerCase/.test(block)
             || /const want[^;]*toLowerCase/.test(block);
  const stores = /setCell\(t, r, 'handle', want\)/.test(block)
              && /setCell\(t, r, 'username', want\)/.test(block);
  if (folds) bad.push({ handle: 'changeHandle', want: 'as typed',
    why: 'the case somebody chose is thrown away on the way into the cell',
    said: 'dopost.gs lower-cases the handle before storing it' });
  if (!takes) bad.push({ handle: 'changeHandle', want: 'as typed',
    why: 'the posted handle is not taken as S(body.handle).trim()',
    said: 'dopost.gs no longer builds `want` the way this rule can read' });
  if (!stores) bad.push({ handle: 'changeHandle', want: 'as typed',
    why: 'handle and username must both be written from the same value, or the old one still answers',
    said: 'dopost.gs does not write both cells from `want`' });

  /* ---------- AND `register`, WHICH IS THE WRITER EVERY ACCOUNT GOES THROUGH ONCE ---------------
     `changeHandle` IS THE RENAME BOX AND `register` IS EVERYBODY. The rule above was written for
     the first and the second went on folding: `norm(first + last)` stored "Halex Dias" as
     `halexdias`, and `doget.gs` shows `handle || username || first_name` — so every account that
     has never gone looking for the rename box has been displaying a name it did not choose.
     Two writers of one cell and only one of them checked is the second reader this repository
     keeps finding; the rule asks both.

     THE PUNCTUATION STRIP MUST SURVIVE, and that is the other half. `HANDLE_SHAPE` never sees a
     registered username — `handleTrouble_` guards the rename and nothing else — so this one
     expression is all that keeps a space or an apostrophe out of the cell. A rule that only
     refused the fold would pass a version that had dropped the strip with it. */
  const reg = post.indexOf("action === 'register'");
  const rblock = reg < 0 ? '' : post.slice(reg, reg + 4000);
  const uline = (rblock.match(/username:\s*[^\n]*/) || [''])[0];
  if (!uline) {
    console.log('FAILED — could not find the username line in register to check.');
    process.exit(1);
  }
  if (/norm\(|toLowerCase/.test(uline)) bad.push({ handle: 'register', want: 'as typed',
    why: 'every account that never renames itself is shown a name it did not choose',
    said: 'dopost.gs folds the case when it writes a new username' });
  if (!/replace\(/.test(uline)) bad.push({ handle: 'register', want: 'letters and digits only',
    why: 'HANDLE_SHAPE never sees a registered username, so this strip is the only thing holding',
    said: 'dopost.gs no longer strips punctuation out of a new username' });

  /* An admin is exempt from the COOLDOWN and from nothing else — an admin fixing somebody's bad
     handle is the remedy, and an admin taking a taken one is still a collision. */
  box.setRows(OTHERS.concat([MEnew]));
  if (box.trouble('newname', MEnew, true)) bad.push({ handle: 'newname', want: 'yes',
    why: 'an admin skips the cooldown', said: box.trouble('newname', MEnew, true) });
  if (!box.trouble('ada99', MEnew, true)) bad.push({ handle: 'ada99', want: 'no',
    why: 'an admin does NOT skip uniqueness', said: '(allowed)' });
  if (!box.trouble('fuckface', MEnew, true)) bad.push({ handle: 'fuckface', want: 'no',
    why: 'an admin does NOT skip the word list', said: '(allowed)' });

  /* ---------- AND WHAT A TUTOR CHARGES, WHICH IS THE SAME MONTH OVER FOUR NUMBERS ---------------
     EVERY CASE HERE IS A FAULT THAT WOULD HAVE HAPPENED. The first two are the ones that would have
     broken the form without looking broken: that page posts all four fields on every save, touched or
     not, so a rule firing on a field being PRESENT would refuse a save for a month over a number
     nobody edited. The cross cases are what makes it ONE clock rather than four — a rate moved five
     days ago must refuse a seat cap today, in both directions, or the walking-round is back. And the
     last two are the other end: a tutor who has never changed anything has no cell and is free, and a
     rule reading a missing date as zero would refuse everybody for ever.

     A FIELD ABSENT FROM THE POSTED OBJECT IS NOT A CHANGE, which is what lets every other page on the
     column save normally: `About you` sends no pricing field at all, so it must never be refused. */
  const PRI    = { person_id: 'P001', rate_per_hour: 30, extra_seat_rate: 0.3,
                   max_students: 4, min_students: 1 };
  const PRInew = Object.assign({}, PRI, { pricing_changed_at: ago(5)   });
  const PRIold = Object.assign({}, PRI, { pricing_changed_at: ago(200) });
  const PRICES = [
    ['yes', PRInew, {}, false, 'a page that sends no pricing field at all is not a change'],
    ['yes', PRInew, { rate_per_hour: 30, extra_seat_rate: 0.3, max_students: 4, min_students: 1 },
       false, 'all four posted unchanged is not a change — this is what the page does every save'],
    ['yes', PRInew, { rate_per_hour: '30', max_students: '4' }, false,
       'and "30" off a form is the same number as 30 in the cell'],
    ['no',  PRInew, { rate_per_hour: 40 }, false, 'the rate moved five days ago'],
    ['no',  PRInew, { extra_seat_rate: 0.5 }, false, 'so did the extra-seat fraction'],
    ['no',  PRInew, { max_students: 6 }, false, 'ONE CLOCK: the cap is refused because the rate moved'],
    ['no',  PRInew, { min_students: 2 }, false, 'and so is the floor'],
    ['no',  PRInew, { rate_per_hour: 20 }, false,
       'down is a change too — a rate that falls strands sessions already agreed at the old one'],
    ['yes', PRIold, { rate_per_hour: 40, max_students: 6 }, false, 'last moved two hundred days ago'],
    ['yes', PRI,    { rate_per_hour: 40 }, false, 'never moved — no cell, so no cooldown'],
    ['yes', PRInew, { rate_per_hour: 40 }, true,
       'an admin fixing a rate is the remedy, not the thing being braked'],
  ];
  PRICES.forEach(([want, me, f, isAdmin, why]) => {
    const said = box.price(me, f, isAdmin);
    const got = said ? 'no' : 'yes';
    if (got !== want) bad.push({ handle: 'quote \u2192 ' + JSON.stringify(f)
      + (isAdmin ? ' (admin)' : ''), want, why, said: said || '(allowed)' });
  });

  /* ---------- AND THE FOUR ARE THE FOUR, which no case above can say ----------------------------
     A rule that had quietly lost a field from its list would pass every case above — each one names
     the field it moves, so a list of three would simply stop refusing the fourth and there is no
     case that says the fourth exists. This reads the constant. */
  const WANT_FIELDS = ['rate_per_hour', 'extra_seat_rate', 'max_students', 'min_students'];
  WANT_FIELDS.forEach(f => {
    if (box.fields.indexOf(f) === -1) bad.push({ handle: 'PRICING_FIELDS', want: 'yes',
      why: f + ' is part of what a family is quoted and is not in the list the cooldown reads',
      said: JSON.stringify(box.fields) });
  });
  box.fields.forEach(f => {
    if (WANT_FIELDS.indexOf(f) === -1) bad.push({ handle: 'PRICING_FIELDS', want: 'yes',
      why: f + ' is under the pricing cooldown and this check has never been told why',
      said: JSON.stringify(box.fields) });
  });

  /* ---------- THE HEADING NAMES BOTH THINGS, because it checks both -------------------------------
     It read "A USERNAME JUDGED WRONGLY" over a list that has held pricing findings since the cap
     cooldown went in — a summary naming one of the two subjects it covers, which is the "all 18
     checks pass" shape this repository records four times. */
  console.log('\nJUDGED WRONGLY  (' + bad.length + ')');
  if (!bad.length) console.log('  none');
  bad.forEach(b => console.log('  ' + JSON.stringify(b.handle) + '  wanted ' + b.want
    + ' — ' + b.why + '\n      server said: ' + b.said));

  /* EVERY NUMBER HERE IS READ OFF THE ARRAY IT COUNTS. A figure typed into a sentence is the
     "all 18 checks pass" fault, which this repository has now recorded four times — including once
     in its own tally of how often it had recorded it. */
  console.log('\nusernames checked: ' + (CASES.length + 3)
    + '  ·  sign-in terms resolved: ' + FINDS.length
    + '  ·  e-mail clashes checked: ' + MAILCASES.length
    + '  ·  pricing changes checked: ' + PRICES.length
    + ' over ' + box.fields.length + ' fields'
    + '  ·  words on the block list: ' + (SRC.match(/const HANDLE_BLOCKED[\s\S]*?\];/)[0]
        .match(/'/g).length / 2)
    + '  ·  innocent words allowed back: '
    + (SRC.match(/const HANDLE_ALLOWED[\s\S]*?\n\};/)[0].match(/^\s{2}\w+:/gm) || []).length);

  if (bad.length) {
    console.log('FAILED — a username is the one thing a person types that everybody else has to '
              + 'look at, what a tutor charges is what every booking already taken was priced '
              + 'against, and who a name resolves to decides whose PIN a sign-in is checked '
              + 'against. This is the only thing standing between any of them and the sheet.');
    process.exitCode = 1;
  } else {
    console.log('OK — every rude one refused, every innocent one allowed, nobody can take a name '
              + 'that already answers to somebody else, and both months hold.');
  }
}

run();
