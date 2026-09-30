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
const setup  = fs.readFileSync(path.join(ROOT, 'backend', 'setup.gs'), 'utf8');

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
  /* ---------- AND THE GENERATOR, WHICH THE COMMENT OVER IT CANNOT CHECK ITSELF ------------------
     `handleMake_` PASSES ITS CANDIDATES THROUGH `handleTrouble_`, so it cannot produce a handle that
     is taken, reserved or the wrong shape — that half is structural. What it CAN produce is a pair
     that folds onto a banned word: `handleFold_` turns digits into letters, so a word-pair nobody
     would look at twice can reduce onto something the blocklist refuses, and the generator would
     then quietly burn tries. That is a fact about the two lists TOGETHER, which is exactly what a
     person reading one list cannot see. */
  grab(people, /const HANDLE_ADJ\s*=\s*\[[\s\S]*?\];/, 'HANDLE_ADJ'),
  grab(people, /const HANDLE_FIRST_MAX[^;]*;/, 'HANDLE_FIRST_MAX'),
  grab(people, /const HANDLE_FALLBACK[^;]*;/, 'HANDLE_FALLBACK'),
  grab(people, /function handleFirst_\([\s\S]*?\n\}/, 'handleFirst_'),
  grab(people, /function handleIsShaped_\([\s\S]*?\n\}/, 'handleIsShaped_'),
  grab(people, /const HANDLE_TRIES[^;]*;/, 'HANDLE_TRIES'),
  grab(people, /function handleMake_\([\s\S]*?\n\}/, 'handleMake_'),
  /* ---------- AND THE REPAIR JOB, WHICH IS THE ONE THING HERE THAT WRITES -----------------------
     `fillHandles` FILLS A BLANK HANDLE ON EVERY EXISTING ROW, and the fault it must never have is
     overwriting one: a handle is what somebody signs in with and what `findPerson` resolves them
     by, so a job that replaced one would lock that person out of their own account. That is not a
     thing reading it can settle — it is a thing you run over rows and then look at the rows. */
  grab(setup,  /function fillHandles\([\s\S]*?\n\}/, 'fillHandles'),
  /* AND THE ONE THAT REPLACES A HANDLE ON PURPOSE, into the owner's `<first>_<adjective><NN>`. */
  grab(setup,  /function renameHandles\([\s\S]*?\n\}/, 'renameHandles'),
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
  /* ---------- A SHEET ENOUGH OF ONE FOR A JOB THAT WRITES ---------------------------------------
     fillHandles ASKS THREE THINGS OF THE TAB that the clash check never did: that it exists, what
     its headers are, and to be written to. The headers are the two columns the job itself refuses to
     run without -- named rather than assumed, so a rule can put the missing-column branch through
     it. setCell writes the row IN PLACE, exactly as the real one's last line does, which is what
     lets a case read back what the job did.
     NO BACKTICKS IN HERE EITHER, and this comment is why the rule two blocks up is written down:
     the first version of it used them and the file failed to parse eighty lines from the cause. */
  const read = () => ({ rows: ROWS, sheet: true, headers: HEADERS });
  let HEADERS = ['person_id', 'handle', 'email', 'first_name', 'last_name', 'handle_was'];
  const setCell = (t, r, f, v) => { r[f] = v; WROTE.push(f); };
  let WROTE = [];
  const clearCache = () => {};
  const setRows = r => { ROWS = r; };
  const N = v => { const x = parseFloat(String(v == null ? '' : v).replace(/[£$,\s]/g, ''));
                   return isNaN(x) ? 0 : x; };
`;

const box = {};
new Function('box', PRELUDE + SRC + '\nbox.trouble = handleTrouble_; box.fold = handleFold_;'
           + ' box.setRows = setRows; box.price = pricingRefusal_;'
           + ' box.moved = pricingMoved_; box.fields = PRICING_FIELDS;'
           + ' box.find = findPerson; box.mail = emailRefusal_;'
           + ' box.make = handleMake_; box.ADJ = HANDLE_ADJ;'
           + ' box.FIRST_MAX = HANDLE_FIRST_MAX; box.FALLBACK = HANDLE_FALLBACK;'
           + ' box.first = handleFirst_; box.shaped = handleIsShaped_; box.rename = renameHandles;'
           + ' box.TRIES = HANDLE_TRIES; box.fill = fillHandles;'
           /* THE GATE ITSELF, SO THE GENERATOR'S OWN LOOP CAN BE TESTED. `handleTrouble_` is a
              function DECLARATION in this scope, so it can be rebound — and that is the only way to
              reach `handleMake_`'s retry and its give-up branch, because the tail is random over
              fifty-one thousand pairs and no number of seeded rows makes a collision reliable.
              Restored after each case; nothing outside these two lines uses it. */
           + ' box.shape = HANDLE_SHAPE;'
           + ' box.realGate = handleTrouble_;'
           + ' box.setGate = f => { handleTrouble_ = f; };'
           + ' box.setHeaders = h => { HEADERS = h; };'
           + ' box.wrote = () => WROTE; box.clearWrote = () => { WROTE = []; };')(box);

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
     ASKED FOR AS *"i want people to be able to sign in with email as well."* `verifyLogin` RESOLVED
     through `findPerson` when this was written, so the rung there WAS the feature. It reads the
     `email` column alone now, and the cases for THAT are under `SIGNIN` below — and the case that
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
  /* EITHER SPELLING OF THE WRITE: two `setCell`s, or one `setCells` whose object names both. The
     handler moved to the second so all four cells go in one call, and the rule is about the VALUE —
     both cells from `want` — rather than about how many calls it takes. */
  const cells = (block.match(/setCells\(t, r, \{([^}]*)\}\)/) || [])[1] || '';
  const stores = /setCell\(t, r, 'handle', want\)/.test(block) || /\bhandle: want\b/.test(cells);
  if (folds) bad.push({ handle: 'changeHandle', want: 'as typed',
    why: 'the case somebody chose is thrown away on the way into the cell',
    said: 'dopost.gs lower-cases the handle before storing it' });
  if (!takes) bad.push({ handle: 'changeHandle', want: 'as typed',
    why: 'the posted handle is not taken as S(body.handle).trim()',
    said: 'dopost.gs no longer builds `want` the way this rule can read' });
  if (!stores) bad.push({ handle: 'changeHandle', want: 'as typed',
    why: 'what was checked is what must be written',
    said: 'dopost.gs does not write the handle from `want`' });

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
  /* ---------- TO THE NEXT HANDLER, NOT FOR 4000 CHARACTERS ---------------------------------------
     IT WAS `post.slice(reg, reg + 4000)` AND THE HANDLER OUTGREW IT. Adding the generated handle put
     the `username:` line at 4715 characters from `action === 'register'`, so the window ended before
     the line it exists to read and the check reported "could not find the username line" — which is
     the guard doing its job, and about itself rather than about the app.

     A CHARACTER COUNT IS NOT A BOUNDARY. The next `if (action ===` is, and it is what the handler
     actually ends at — so a comment added above a line cannot move that line out of reach. Same
     lesson as `objectAfter_` in `check-tabs.js`, where `indexOf('const ' + name)` matched a longer
     name and handed the check the wrong object. */
  const rEnd = reg < 0 ? -1 : post.indexOf("if (action ===", reg + 20);
  const rblock = reg < 0 ? '' : post.slice(reg, rEnd > reg ? rEnd : undefined);
  if (!rblock) {
    console.log('FAILED — could not find the register handler in dopost.gs to check.');
    process.exit(1);
  }
  if (!/handle:\s*regHandle/.test(rblock)) bad.push({ handle: 'register', want: 'a handle',
    why: 'a row written with no handle shows its squashed name in place of one, for ever',
    said: 'dopost.gs does not write a generated handle at registration' });

  /* ---------- AND NOTHING WRITES A `username` ANY MORE -------------------------------------------
     THE COLUMN WENT WITH THE PEOPLE TAB'S REDESIGN — it was the handle written a second time — so a
     write to it is a write to a header that is not there: `missedWrite_` records it and `jsonOut`
     turns the whole Save into "Nothing was saved". A grep over the backend's code (comments are
     prose and may say the word) for anything that names it as a cell. */
  const writesUser = [];
  fs.readdirSync(path.join(ROOT, 'backend')).filter(f => f.endsWith('.gs')).forEach(f => {
    /* COMMENTS TRACKED OPENER TO CLOSER, not guessed at from how a line starts — prose inside a
       block comment is allowed to say the word, and `check-backend.js` records its own first version
       firing on its own documentation. */
    let inBlock = false;
    fs.readFileSync(path.join(ROOT, 'backend', f), 'utf8').split('\n').forEach((line, n) => {
      let code = '', i = 0;
      while (i < line.length) {
        if (inBlock) { const e = line.indexOf('*/', i); if (e < 0) { i = line.length; } else { inBlock = false; i = e + 2; } continue; }
        const o = line.indexOf('/*', i), sl = line.indexOf('//', i);
        if (sl >= 0 && (o < 0 || sl < o)) { code += line.slice(i, sl); break; }
        if (o < 0) { code += line.slice(i); break; }
        code += line.slice(i, o); inBlock = true; i = o + 2;
      }
      if (/\busername\s*:|'username'|"username"|\.username\b/.test(code)) writesUser.push(f + ':' + (n + 1));
    });
  });
  if (writesUser.length) bad.push({ handle: 'username', want: 'no such column',
    why: 'the people tab has no username column, so a write to it fails the whole save',
    said: 'still named at ' + writesUser.slice(0, 4).join(', ') });

  /* ---------- EVERY PAIR THE GENERATOR CAN MAKE, THROUGH THE GATE IT CLAIMS TO PASS -------------
     `handleMake_` RUNS ITS CANDIDATES THROUGH `handleTrouble_`, so it cannot RETURN a bad one — and
     that is not the same as the lists being sound. `handleFold_` turns digits into letters, so a
     word-pair nobody would look at twice can reduce onto something the blocklist refuses, and the
     generator would then burn tries on it silently. The comment over those lists asserts no pair
     does; this is what makes that a measurement.

     ON AN EMPTY TAB, so the only things that can refuse are the shape, the reserved list and the
     blocklist — the three that are facts about the words rather than about who is registered. A
     clash is the generator's job to retry and is checked below. */
  box.setRows([]);
  /* ---------- THE SHAPE THE OWNER ASKED FOR: `<first>_<adjective><NN>` ------------------------------
     *"handles are their first name then underscore then adjective then number."* Every draw below
     must be exactly that, lower case, with the first name reduced the way `handleFirst_` says. A
     regex written here rather than read from people.gs, because this is the contract and the
     generator is what it checks. */
  const NEW_SHAPE = /^([a-z][a-z0-9]*)_([a-z]+)(\d{2})$/;
  const shapeCases = [
    ['Halex', 'halex'], ['ZOË', 'zo'], ["O'Brien", 'obrien'], ['Mary-Jane', 'maryjane'],
    ['2Pac', 'pac'], ['Maximilianoaurelius', 'maximiliano'], ['', box.FALLBACK], ['李', box.FALLBACK],
  ];
  shapeCases.forEach(([first, head]) => {
    for (let i = 0; i < 5; i++) {
      const made = box.make(null, first);
      const m = made.match(NEW_SHAPE);
      if (!m || m[1] !== head || box.ADJ.indexOf(m[2]) === -1 || made.length > 20) {
        bad.push({ handle: made || '(nothing)', want: head + '_<adjective><NN>',
          why: 'a generated handle is the first name, an underscore, an adjective and a two-digit '
             + 'number — which is what the owner asked for', said: 'first name "' + first + '"' });
        break;
      }
    }
  });

  /* THE LONGEST FIRST NAME THE GENERATOR KEEPS, WITH THE LONGEST ADJECTIVE AND THE TAIL, MUST FIT
     `HANDLE_SHAPE`'s twenty, or a long name makes every draw refused for length alone and falls to
     the fallback in silence. A seventh-letter adjective breaks it with nothing else changing. */
  const longestAdj = box.ADJ.reduce((x, y) => (y.length > x.length ? y : x), '');
  const worst = 'a'.repeat(box.FIRST_MAX) + '_' + longestAdj + '99';
  if (!box.shape.test(worst)) bad.push({ handle: worst, want: 'yes',
    why: 'the longest name the generator keeps plus the longest adjective is past HANDLE_SHAPE',
    said: worst.length + ' characters' });

  /* EVERY ADJECTIVE, AGAINST A SPREAD OF ORDINARY FIRST NAMES, THROUGH THE GATE. The blocklist folds
     digits onto letters and drops the underscore, so a name and an adjective can meet across it and
     the generator would burn tries on that name in silence. On an empty tab, so only the shape, the
     reserved list and the blocklist can refuse. */
  const names = ['halex', 'ada', 'sam', 'pat', 'jo', 'al', 'mo', 'zo', box.FALLBACK];
  const pairs = [];
  names.forEach(n => box.ADJ.forEach(a2 => pairs.push(n + '_' + a2 + '42')));
  const refused = pairs.filter(w => box.trouble(w, null, true));
  if (refused.length) bad.push({ handle: refused.slice(0, 4).join(', '), want: 'yes',
    why: refused.length + ' of ' + pairs.length + ' generated handles are refused by the very gate '
       + 'the generator passes them through, so it burns tries on them',
    said: box.trouble(refused[0], null, true) });

  /* AND A FIRST NAME THE GATE REFUSES OUTRIGHT FALLS TO THE FALLBACK, rather than giving up and
     leaving `register` to write a squashed name. Built from the blocklist at run time rather than
     written here, because a refused word pasted into this file is the word in one more file. */
  const blockedName = (consts.match(/HANDLE_BLOCKED\s*=\s*\[\s*'([a-z]+)'/) || [])[1];
  if (blockedName) {
    const made = box.make(null, blockedName);
    if (!made || made.indexOf(box.FALLBACK + '_') !== 0) bad.push({ handle: made || '(nothing)',
      want: box.FALLBACK + '_<adjective><NN>',
      why: 'a first name the blocklist refuses must fall back to the neutral head, not give up',
      said: '(a blocked first name)' });
  }

  /* AND `handleIsShaped_` — what `renameHandles` leaves alone — says yes to its own output and no
     to the old `BrightOtter42` shape, or the job either rewrites everybody every run or nobody. */
  if (!box.shaped('halex_bright42', 'Halex')) bad.push({ handle: 'halex_bright42', want: 'shaped',
    why: 'renameHandles would regenerate a handle already in the new shape on every run', said: 'no' });
  ['BrightOtter42', 'ada_bright42', 'halex_otter42', 'halex_bright4'].forEach(h => {
    if (box.shaped(h, 'Halex')) bad.push({ handle: h, want: 'not shaped',
      why: 'renameHandles would leave a handle that is not <first>_<adjective><NN> alone', said: 'yes' });
  });

  /* ---------- AND WHAT IT ACTUALLY RETURNS IS SOMETHING THE GATE ACCEPTS ------------------------
     TEN DRAWS RATHER THAN ONE, because it is random: a single call passing proves one pair. */
  for (let i = 0; i < 10; i++) {
    const made = box.make(null, 'Halex');
    const no = made ? box.trouble(made, null, true) : 'it gave up on an empty tab';
    if (no) { bad.push({ handle: made || '(nothing)', want: 'yes',
      why: 'the generator returned something its own gate refuses', said: no }); break; }
  }

  /* ---------- THE RETRY, AND THE GIVE-UP, WHICH ONLY A STUBBED GATE CAN REACH -------------------
     SEEDING ROWS CANNOT TEST EITHER, AND THE FIRST VERSION OF THIS TRIED. It took every
     adjective-noun pair but one as a taken row and wanted the generator to return the one left —
     and the generator correctly returned `WarmComet37`, because the tail is a random 10 to 99 and
     those 575 rows are 575 of FIFTY-ONE THOUSAND possibilities. A case that assumed a fixed tail,
     reported as a fault in the app. Taking the whole space needs 51,840 rows through a clash check
     that runs four `key()` calls per row per try, which is seconds of a check that runs in
     hundredths.

     SO THE GATE IS REBOUND INSTEAD, which is what makes both branches deterministic: the generator's
     contract is "keep asking until the gate says yes, and give up rather than loop", and that is a
     statement about the loop rather than about the words. */
  box.setGate(() => 'no');
  const gaveUp = box.make(null, 'Halex');
  if (gaveUp !== '') bad.push({ handle: String(gaveUp), want: '(nothing)',
    why: 'a gate that refuses everything must make the generator give up, not return a refused '
       + 'handle — `register` writes whatever it hands back',
    said: '"' + gaveUp + '"' });

  /* AND IT RETRIES RATHER THAN TAKING THE FIRST DRAW. A gate that refuses the first four candidates
     and then allows anything must still produce one — which a generator that asked once would fail
     and a generator that asked for ever would hang. */
  let asked = 0;
  box.setGate(() => (++asked <= 4 ? 'taken' : ''));
  const fifth = box.make(null, 'Halex');
  if (!fifth || asked !== 5) bad.push({ handle: String(fifth), want: 'the fifth candidate',
    why: 'the generator does not retry past a refusal',
    said: 'it asked ' + asked + ' time(s) and returned "' + fifth + '"' });
  box.setGate(box.realGate);

  /* ---------- AND THE REPAIR JOB ONLY EVER FILLS A BLANK ----------------------------------------
     THE FAULT IT MUST NOT HAVE is overwriting a handle. That is what somebody signs in with, so a
     job that replaced one would lock them out of their own account and change the name their friends
     know them by — and it would look like a successful run. Every case below is a row shape that
     exists on the real tab today. */
  box.setHeaders(['person_id', 'handle', 'email', 'first_name', 'last_name']);
  const rows = [
    { person_id: 'P1', handle: 'HalexD', email: 'a@b.com',
      first_name: 'Halex', last_name: 'Dias' },                       // has one — must not be touched
    { person_id: 'P4', handle: '', email: '', first_name: '', last_name: '' },
  ];
  box.setRows(rows);
  box.clearWrote();
  const did = box.fill();
  if (rows[0].handle !== 'HalexD') {
    bad.push({ handle: 'fillHandles', want: 'untouched',
      why: 'a row that already has a handle was rewritten, which changes the name its friends know it by',
      said: rows[0].handle });
  }
  if (did.leftAlone !== 1) bad.push({ handle: 'fillHandles', want: '1 left alone',
    why: 'a run that reports nothing left alone reads the same whether it found nothing or '
       + 'rewrote everything', said: String(did.leftAlone) });
  if (!rows[1].handle) {
    bad.push({ handle: 'fillHandles', want: 'a handle',
      why: 'a blank row must get one', said: '"' + rows[1].handle + '"' });
  }
  if (box.wrote().indexOf('username') !== -1) bad.push({ handle: 'fillHandles', want: 'no username',
    why: 'the column is gone, so a write to it is a write to nothing', said: box.wrote().join(', ') });
  /* AND IT INVENTS NEITHER AN EMAIL NOR A NAME, which is the line this job stops at: a generated
     address is not a blank cell, it is a WRONG one, and `notify` would post into it and report
     success. P4 has none of the three and must come back NAMED rather than filled. */
  if (box.wrote().indexOf('email') !== -1 || box.wrote().indexOf('first_name') !== -1) {
    bad.push({ handle: 'fillHandles', want: 'never invented',
      why: 'a generated email address makes every notification silently post into nothing',
      said: 'it wrote ' + box.wrote().join(', ') });
  }
  if (did.missingEmail !== 1 || did.noEmail.indexOf('P4') === -1) {
    bad.push({ handle: 'fillHandles', want: 'P4 named as missing an email',
      why: 'a row nobody can be written to has to be reported, or it is a silence',
      said: JSON.stringify(did.noEmail) });
  }
  /* AND IT REFUSES RATHER THAN RUNNING WHEN THE COLUMN IS NOT THERE. `setCell` writes to a header
     that is not there and loses the value with no error anywhere — a job that "ran" and changed
     nothing is the worst outcome available here. */
  box.setHeaders(['person_id', 'email']);
  box.setRows([{ person_id: 'P9', handle: '' }]);
  if (!box.fill().error) bad.push({ handle: 'fillHandles', want: 'a refusal',
    why: 'with no handle column every write is silently lost and the job reports success',
    said: '(it ran)' });

  /* ---------- AND `renameHandles`, WHICH REPLACES ON PURPOSE AND ONLY WHERE THE SHAPE IS WRONG ------
     It may overwrite because signing in is an e-mail and a PIN now. What it must do: rename an old
     `BrightOtter42` into `<first>_<adjective><NN>`, write the username to match, keep the old one in
     `handle_was`, leave a row already in the shape alone, and change nothing on a second run. */
  box.setHeaders(['person_id', 'handle', 'handle_was', 'first_name']);
  const rrows = [
    { person_id: 'R1', handle: 'BrightOtter42', first_name: 'Halex' },
    { person_id: 'R2', handle: 'ada_calm17', first_name: 'Ada' },
    { person_id: 'R3', handle: '', first_name: '' },
  ];
  box.setRows(rrows);
  const ren = box.rename();
  const r1 = rrows[0].handle.match(/^halex_([a-z]+)\d{2}$/);
  if (!r1 || rrows[0].handle_was !== 'BrightOtter42') {
    bad.push({ handle: 'renameHandles', want: 'halex_<adjective><NN>, old kept',
      why: 'the old-format handle must become the new format, with handle_was set',
      said: rrows[0].handle + ' / was ' + rrows[0].handle_was });
  }
  if (rrows[1].handle !== 'ada_calm17') bad.push({ handle: 'renameHandles', want: 'untouched',
    why: 'a handle already in the new shape must be left alone', said: rrows[1].handle });
  if (rrows[2].handle.indexOf(box.FALLBACK + '_') !== 0) bad.push({ handle: 'renameHandles',
    want: box.FALLBACK + '_<adjective><NN>', why: 'a row with no first name gets the fallback head',
    said: rrows[2].handle });
  if (ren.renamedCount !== 2 || ren.renamed.indexOf('R1') === -1 || ren.leftAlone !== 1) {
    bad.push({ handle: 'renameHandles', want: '2 renamed by id, 1 left alone',
      why: 'the report names who changed', said: JSON.stringify(ren.renamed) + ' / ' + ren.leftAlone });
  }
  const snap = JSON.stringify(rrows);
  const again = box.rename();
  if (again.renamedCount !== 0 || JSON.stringify(rrows) !== snap) bad.push({ handle: 'renameHandles',
    want: 'nothing on a second run', why: 'the job must be safe to run twice',
    said: again.renamedCount + ' renamed' });

  /* ---------- AND THE FIXTURE CANNOT STATE A HANDLE THE SERVER WOULD NEVER SEND -----------------
     IT SAID `@ada`, WITH THE `@` IN THE CELL. `doget.gs` sends `S(r.handle) || S(r.username) ||
     S(r.first_name)` off a sheet whose cells hold `HalexD`, and `HANDLE_SHAPE` refuses a leading
     `@` outright — so no row anywhere can produce one. The moment a card drew `@` + the handle the
     lab rendered `@@ada`, and every measurement of that card would have been of a string the app
     cannot produce.

     SIXTH TIME THAT FILE HAS BEEN FOUND STATING A SHAPE THE SERVER DOES NOT SEND — after `focus` as
     a string, the receipt's `sessionDates` against `dates`, the job's `students` and `venue`, the
     availability hour codes, and `studentFields: []`. The other five were each found by a feature
     failing to draw; this is a rule, so the seventh fails here instead.

     THROUGH `HANDLE_SHAPE` RATHER THAN A REGEX WRITTEN HERE, which is the one thing that makes it
     honest: the question is whether the server could ever send this value, and that constant is what
     decides it. */
  const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
  []. concat(fixture.tutors || [], fixture.students || []).forEach(who => {
    const h = String((who && who.handle) || '');
    if (!h) return;                         // a row with no handle is a real shape and draws nothing
    if (!box.shape.test(h.toLowerCase())) bad.push({ handle: h, want: 'a handle a row could hold',
      why: 'the fixture states a handle HANDLE_SHAPE refuses, so every card measured against it is '
         + 'measured on a string the server cannot send',
      said: '"' + h + '" is not a shape any row can produce' });
  });

  box.setRows(OTHERS.concat([ME]));

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
    /* THE SHAPES THE PRICE CANNOT USE, refused for an admin too — see `pricingRefusal_`. */
    ['no',  PRI, { extra_seat_rate: 15 }, false, 'an extra-seat share of 15 is pounds typed into a fraction'],
    ['no',  PRI, { extra_seat_rate: 15 }, true, 'and an admin cannot save it either'],
    ['yes', PRI, { extra_seat_rate: 2 }, false, 'two is the top of the range and allowed'],
    ['no',  PRI, { min_students: 6 }, false, 'a minimum above the saved maximum of 4'],
    ['no',  PRI, { min_students: 6, max_students: 4 }, true, 'both posted, the wrong way round'],
    ['yes', PRI, { min_students: 3, max_students: 3 }, false, 'equal is a class of exactly three'],
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

  /* ---------- `SIGNIN` — AN E-MAIL ADDRESS AND A PIN, AND NOTHING ELSE ---------------------------
     ASKED FOR AS *"i want people to be able to sign in only with their email and their pin now. no
     case sensitive stuff."* `verifyLogin` reads the `email` column alone, and the three rules that
     make it so had no check at all: `check-flow`'s sign-in journey stubs the POST, and the cases
     above run `findPerson`, which sign-in no longer calls. Putting `findPerson(body.name)` back
     would have left every check here green.

     THE HANDLER ITSELF, CUT OUT OF `dopost.gs` AND RUN, not a second implementation of it. The
     seven helpers it reaches for are stubbed — the PIN check is a plain comparison, because what is
     under test is WHICH ROW a sign-in lands on rather than the hashing — and `findPerson` is stubbed
     to answer a username, so a version that went back to it fails the username case. */
  const vlAt = post.indexOf("if (action === 'verifyLogin')");
  const vlEnd = vlAt < 0 ? -1 : post.indexOf("if (action === '", vlAt + 10);
  if (vlAt < 0 || vlEnd < 0) {
    console.log('FAILED — could not find the verifyLogin block in dopost.gs to check.');
    process.exit(1);
  }
  const SIGNIN_ROWS = [
    { person_id: 'P1', email: 'Ada@Example.com', pin: '0000', username: 'AdaL' },
    { person_id: 'P2', email: 'dup@x.com',       pin: '0000', username: 'DupOne' },
    { person_id: 'P3', email: ' DUP@x.com ',     pin: '0000', username: 'DupTwo' },
    { person_id: 'P4', email: '',                pin: '0000', username: 'NoMail' },
  ];
  const signIn = new Function('body', 'ROWS', `
    const S = v => String(v == null ? '' : v).trim();
    const norm = v => S(v).toLowerCase();
    const key = v => S(v).toLowerCase().replace(/[^a-z0-9]/g, '');
    const TAB = { people: 'people' };
    const read = () => ({ rows: ROWS });
    const jsonOut = o => o;
    const findPerson = n => ROWS.find(r => key(r.username) === key(n) || norm(r.email) === norm(n)) || null;
    const authWaitMins_ = () => 0;
    const authWrong_ = () => {};
    const authCheckPin_ = (t, r, pin) => S(r.pin) === S(pin);
    const hasPin_ = r => !!(r && S(r.pin));
    const authNewSession_ = () => 'token';
    const loginReplyFor_ = r => ({ success: true, who: r.person_id });
    const action = 'verifyLogin';
    ` + post.slice(vlAt, vlEnd) + `
    return { fellThrough: true };`);
  const SIGNIN = [
    { body: { email: '  ADA@example.COM ', pin: '0000' }, want: 'P1', why: 'case and spaces must not matter' },
    { body: { name: 'ada@example.com', pin: '0000' },     want: 'P1', why: 'an older phone sends the address as name' },
    { body: { email: 'AdaL', pin: '0000' },               want: '', code: 'not-an-email', why: 'a username is not an address' },
    { body: { name: 'NoMail', pin: '0000' },              want: '',   why: 'a row with no address cannot be named instead' },
    { body: { email: 'ada@example.com', pin: 'wrong' },    want: '', code: 'wrong-pin', why: 'a wrong PIN is still wrong' },
    { body: { email: 'dup@x.com', pin: '0000' },          want: '',   why: 'two rows on one address is refused, not guessed' },
    { body: { email: 'nobody@x.com', pin: '0000' },       want: '', code: 'no-such-email', why: 'an address nobody has signs nobody in' },
  ];
  SIGNIN.forEach(c => {
    let got;
    try { got = signIn(c.body, SIGNIN_ROWS.map(r => Object.assign({}, r))); }
    catch (e) { got = { error: 'threw: ' + e.message }; }
    const who = (got && got.success) ? got.who : '';
    if (who !== c.want) bad.push({ handle: 'verifyLogin ' + JSON.stringify(c.body),
      want: c.want || 'refused', why: c.why, said: JSON.stringify(got) });
    /* AND IT SAYS WHICH HALF WAS WRONG — asked for by the owner, so a wrong PIN must not read as an
       unknown address or the other way round. */
    else if (c.code && (!got || got.why !== c.code)) bad.push({ handle: 'verifyLogin ' + JSON.stringify(c.body),
      want: 'refused as ' + c.code, why: c.why, said: JSON.stringify(got) });
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
    + '  ·  findPerson terms resolved: ' + FINDS.length
    + '  ·  sign-ins checked: ' + SIGNIN.length
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
