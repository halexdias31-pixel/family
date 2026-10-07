/* ==================================================================================================
   @family. — check-handles.js

   A HANDLE IS THE ONE NAME ON A PERSON THAT EVERYBODY ELSE HAS TO LOOK AT.

   NOBODY TYPES ONE ANY MORE. *"handles should be their name and a virtuous describing word. they can
   randomise it but it will follow that general name."* And on 2 October: *"their first name, a
   virtuous adjective and random numbers and maybe an underscore. but all random order."* So
   `handleMake_` builds every handle — the first name, a virtue and a fresh two-digit number, in one
   of the four orders that do not start with the digits, with an underscore at one join about half
   the time — and the Settings card's Randomise tile asks it for another. The cases below are in
   three parts: the GATE every candidate goes through (`handleTrouble_`), the GENERATOR's own rules
   (two hundred draws all shaped, every order seen, never the handle you already have, every older
   shape still read as shaped by `handleParts_`), and the two jobs that
   write handles onto rows that exist. `randomiseHandle` itself is run through the real `doPost` in
   `check-profile.js`, which is the file here that already loads the whole backend.

   Every other check here measures whether the app WORKS. This one and `check-marking.js` are the two
   that measure whether it is SAFE to hand to a child, and the failures are not symmetrical:

     a rude handle let through   is on a tutoring site, beside children's names, until somebody sees
                                 it — and the person who sees it first is a parent
     a real name refused         is somebody who has done nothing, told no, with no way to argue

   A first name is still something the gate is asked about, and a name and a virtue can meet across
   the underscore — which is why `HANDLE_ALLOWED` is still here, and why half the gate's cases are
   words that must be let through rather than words that must not.

   ---------- AND THE RULE THAT IS NOT ABOUT WORDS AT ALL ---------------------------------------------

   `findPerson` resolves a person by id, then `first + last`, then `handle`, then e-mail, FIRST MATCH
   WINS. A handle that duplicates any of those makes `changePin` check the PIN somebody typed against
   ANOTHER PERSON'S ROW and tell them their own PIN is wrong — the denial CLAUDE.md already records,
   which happened by accident to one person. A generator that did not ask would make the same
   accident on its own, so the uniqueness cases below are the ones that matter most even though the
   word list is what anybody asks about first.

   IT CUTS THE TWO FUNCTIONS OUT OF `people.gs` AND RUNS THEM, which is `check-marking.js`'s method
   and is safe for the same reason: they touch nothing else. A second implementation here would be a
   second thing to keep in step — the fault this repository records under `childrenOf`, under
   `link`/`source_url` and under `factsNow_`.

   ---------- AND THE ONE THING A PERSON MAY ONLY CHANGE ONCE A MONTH ---------------------------------

   `pricingRefusal_` IS THE SAME MECHANISM OVER FOUR COLUMNS — a tutor's rate, their extra-seat
   fraction and the two ends of the class sizes they take, which between them are what a family is
   quoted and what every booking already taken was priced and seated against. It lives beside
   `handleTrouble_` in `people.gs` *so that this file can run it*: written inside `updateProfile` it
   would be six lines nothing here can reach, which is the shape this repository records every time a
   check could not see its subject.

   ITS OWN CASES ARE BELOW THE HANDLES, and two of them are faults that would have been silent.
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
  grab(people, /const HANDLE_TAIL_MIN[^;]*;/, 'HANDLE_TAIL_MIN'),
  grab(people, /const HANDLE_ORDERS\s*=\s*\[[\s\S]*?\]\];/, 'HANDLE_ORDERS'),
  grab(people, /const HANDLE_UNDERSCORE_ODDS[^;]*;/, 'HANDLE_UNDERSCORE_ODDS'),
  grab(people, /const HANDLE_TRIES[^;]*;/, 'HANDLE_TRIES'),
  grab(people, /const HANDLE_WAS_KEEP[^;]*;/, 'HANDLE_WAS_KEEP'),
  grab(people, /function handleFirst_\([\s\S]*?\n\}/, 'handleFirst_'),
  grab(people, /function handleParts_\([\s\S]*?\n\}/, 'handleParts_'),
  grab(people, /function handleIsShaped_\([\s\S]*?\n\}/, 'handleIsShaped_'),
  grab(people, /function handleShuffle_\([\s\S]*?\n\}/, 'handleShuffle_'),
  grab(people, /function handleMake_\([\s\S]*?\n\}/, 'handleMake_'),
  grab(people, /function handleDraw_\([\s\S]*?\n\}/, 'handleDraw_'),
  grab(people, /function handleWasWith_\([\s\S]*?\n\}/, 'handleWasWith_'),
  /* ---------- AND THE REPAIR JOB, WHICH IS THE ONE THING HERE THAT WRITES -----------------------
     `fillHandles` FILLS A BLANK HANDLE ON EVERY EXISTING ROW, and the fault it must never have is
     overwriting one: a handle is what somebody signs in with and what `findPerson` resolves them
     by, so a job that replaced one would lock that person out of their own account. That is not a
     thing reading it can settle — it is a thing you run over rows and then look at the rows. */
  grab(setup,  /function fillHandles\([\s\S]*?\n\}/, 'fillHandles'),
  /* AND THE ONE THAT REPLACES A HANDLE ON PURPOSE, into the owner's `<first>_<virtue>`. */
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
           + ' box.TAIL_MIN = HANDLE_TAIL_MIN; box.TAIL_MAX = HANDLE_TAIL_MAX;'
           + ' box.WAS_KEEP = HANDLE_WAS_KEEP; box.wasWith = handleWasWith_;'
           + ' box.first = handleFirst_; box.shaped = handleIsShaped_; box.rename = renameHandles;'
           + ' box.parts = handleParts_; box.ORDERS = HANDLE_ORDERS; box.TRIES = HANDLE_TRIES;'
           + ' box.fill = fillHandles;'
           /* THE GATE ITSELF, SO THE GENERATOR'S OWN LOOP CAN BE TESTED. `handleTrouble_` is a
              function DECLARATION in this scope, so it can be rebound — and that is the way to reach
              `handleMake_`'s retry and its give-up branch deterministically, because the order the
              words are tried in is random. Restored after each case; nothing outside these lines
              uses it. */
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

  /* ---------- EVERY COMPARISON FOLDS THE CASE ------------------------------------------------
     The generator only ever asks in lower case, but rows typed into the sheet by hand do not, and
     the gate is what stops `halex` being handed out while `HaLeX` already answers to somebody — two
     accounts that render identically on a site children use. A version that made the matching
     case sensitive passes none of the four `no`s below, which is why they are cases rather than a
     sentence in a comment. */
  ['yes', 'Paul_Smith2',   ME, 'CAPITALS ARE ALLOWED — the shape is tested on the folded form'],
  ['yes', 'PAULSMITH2',    ME, 'and all of them'],
  ['no',  'Ada99',         ME, 'a clash is a clash whatever case it is typed in'],
  ['no',  'AdaLovelace',   ME, 'another row\'s FULL NAME, folded — the real key() strips the space'],
  ['no',  'FuckFace',      ME, 'the block list folds too, or capitals walk past it'],
  ['yes', 'Analysis',      ME, 'and so does the allow list, or Scunthorpe comes back capitalised'],
  ['no',  'Admin',         ME, 'reserved, whatever case'],

  // --- taken, against every column findPerson answers to
  ['no',  'ada99',         ME, 'another row\'s handle'],
  ['no',  'gracehopper',   ME, 'another row\'s first + last name, folded'],
  ['no',  'grace_h',       ME, 'another row\'s handle, underscored'],
  ['yes', 'paul',          MEold, 'YOUR OWN handle is not a clash with yourself'],
  ['yes', 'paulsmith',     MEold, 'your own first + last is not a clash either'],

  /* --- AND NO MONTH. The cooldown went with the typed box: every handle is a first name and a
     word off a list, so there is nothing for a brake to brake, and a child pressing Randomise twice
     is looking for a word they like. Putting `HANDLE_COOLDOWN_DAYS` back fails the first case. */
  ['yes', 'newname',       MEnew, 'changed five days ago — and there is no cooldown any more'],
  ['yes', 'newname',       MEold, 'changed two hundred days ago'],
  ['yes', 'newname',       ME,    'never changed'],
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

  /* ---------- AND THE TYPED PATH IS GONE, AND THE DOOR THAT REPLACED IT IS THE ASKER'S OWN ---------
     `changeHandle` TOOK A HANDLE SOMEBODY TYPED, and everything this file used to say about it — the
     case kept as typed, what was validated being what was written — was about a box that is not
     there any more. What replaces it is `randomiseHandle`, which takes no handle at all. Two things
     must hold and both are facts about the files rather than about behaviour, so they are greps:
     nothing in the backend's code still answers to `changeHandle`, and `randomiseHandle` is `self`
     — a door for the signed-in person and nobody else. What the action DOES is run through the real
     `doPost` in `check-profile.js`.

     COMMENTS ARE STRIPPED FIRST, opener to closer, because the prose says `changeHandle` on purpose
     — it is the history of why this door exists. */
  const post = fs.readFileSync(path.join(ROOT, 'backend', 'dopost.gs'), 'utf8');
  const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const stillTyped = [];
  fs.readdirSync(path.join(ROOT, 'backend')).filter(f => f.endsWith('.gs')).forEach(f => {
    const c = code(fs.readFileSync(path.join(ROOT, 'backend', f), 'utf8'));
    if (/changeHandle/.test(c)) stillTyped.push(f);
  });
  if (stillTyped.length) bad.push({ handle: 'changeHandle', want: 'gone',
    why: 'a handle somebody can type is a handle somebody can try variations of, and the cooldown '
       + 'that braked that went with the box', said: 'still in the code of ' + stillTyped.join(', ') });
  const access = code(consts).match(/randomiseHandle\s*:\s*'([a-z]+)'/);
  if (!access || access[1] !== 'self') bad.push({ handle: 'randomiseHandle', want: "'self'",
    why: 'a new handle is the asker\'s own and nobody else\'s — anything wider lets a stranger or an '
       + 'unknown action reach it', said: access ? "'" + access[1] + "'" : 'not in ACTION_ACCESS' });
  if (!/action === 'randomiseHandle'/.test(code(post))) bad.push({ handle: 'randomiseHandle',
    want: 'a handler', why: 'the Randomise button posts to it', said: 'dopost.gs has no such action' });

  /* ---------- AND `register`, WHICH IS THE WRITER EVERY ACCOUNT GOES THROUGH ONCE ---------------
     `register` WAS ONCE THE WRITER NOTHING CHECKED: it stored `norm(first + last)` as a username
     and no handle at all, while the rename box was the only door the gate guarded. It writes a
     generated handle now, through the same gate, and this asks that it still does — a row written
     with no handle shows a first name where a handle would be, for ever. */
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

  /* ---------- THE WORD LIST, WHICH IS THE PART A PERSON CHOSE -------------------------------------
     WHICH WORDS ARE VIRTUES IS A JUDGEMENT AND IS WRITTEN OVER THE LIST, NOT HERE. What a check can
     settle is the shape of the list: lower-case letters only, nothing twice (a duplicate is a word
     drawn twice as often, and two Sams one word apart in a list that says it has thirty), and short
     enough that the longest word, the longest first name kept and a tail still fit `HANDLE_SHAPE`.
     A word that broke the last rule would make every draw on it refused for length alone, and on a
     long name the generator would fall to the fallback in silence. */
  const seenAdj = {};
  box.ADJ.forEach(w => {
    if (!/^[a-z]+$/.test(w)) bad.push({ handle: w, want: 'lower-case letters',
      why: 'a word with anything else in it is a handle the shape refuses or a fold can change',
      said: 'in HANDLE_ADJ' });
    if (seenAdj[w]) bad.push({ handle: w, want: 'once', why: 'a word on the list twice is drawn twice as often',
      said: 'in HANDLE_ADJ twice' });
    seenAdj[w] = true;
  });
  const longestAdj = box.ADJ.reduce((x, y) => (y.length > x.length ? y : x), '');
  /* ONE UNDERSCORE, because the generator puts at most one in — "maybe an underscore". */
  const worst = 'a'.repeat(box.FIRST_MAX) + '_' + longestAdj + String(box.TAIL_MAX);
  if (!box.shape.test(worst)) bad.push({ handle: worst, want: 'yes',
    why: 'the longest name the generator keeps plus the longest word plus a number is past HANDLE_SHAPE',
    said: worst.length + ' characters' });
  /* AND THE OTHER DIRECTION, so the arithmetic is the arithmetic rather than a margin nobody chose:
     one more letter on the name would not fit, or `HANDLE_FIRST_MAX` is cutting names it need not. */
  if (box.shape.test('a'.repeat(box.FIRST_MAX + 1) + '_' + longestAdj + String(box.TAIL_MAX)))
    bad.push({ handle: 'HANDLE_FIRST_MAX', want: String(20 - 1 - longestAdj.length - 2),
      why: 'first names are cut shorter than the longest word, a number and one underscore require',
      said: String(box.FIRST_MAX) });

  /* ---------- THE ORDERS: EVERY ONE THAT DOES NOT START WITH THE DIGITS, AND NO OTHER ---------------
     *"their first name, a virtuous adjective and random numbers and maybe an underscore. but all
     random order."* Three parts have six orders; `HANDLE_SHAPE` refuses a handle that starts with a
     digit, so the two that lead with the number are out and the other four are in. A list that lost
     one would still pass every draw below — it is the list itself that has to be all four. */
  const ORDER_KEYS = box.ORDERS.map(o => o.join('-'));
  const WANT_ORDERS = ['first-virtue-nn', 'virtue-first-nn', 'first-nn-virtue', 'virtue-nn-first'];
  const missingOrder = WANT_ORDERS.filter(o => ORDER_KEYS.indexOf(o) === -1);
  const digitsFirst = ORDER_KEYS.filter(o => o.indexOf('nn') === 0);
  if (missingOrder.length || digitsFirst.length || ORDER_KEYS.length !== WANT_ORDERS.length)
    bad.push({ handle: 'HANDLE_ORDERS', want: WANT_ORDERS.join(', '),
      why: 'every order of the three parts that does not start with the number, once each',
      said: ORDER_KEYS.join(', ') });

  /* ---------- EVERY WORD BESIDE A SPREAD OF FIRST NAMES, IN EVERY ORDER, THROUGH THE GATE -------------
     `handleFold_` turns digits into letters and drops the underscore, so a first name, a number and
     a word can meet across the joins and reduce onto something the blocklist refuses — `ada` and
     `55` are `adass` to it. Every such candidate is refused and the generator draws again, so a
     refusal is not a fault the way it was when every name had exactly thirty candidates; what would
     be is a share large enough that a name runs out of draws. So this counts them and fails past one
     in fifty, and prints the count either way. On an empty tab, so only the shape, the reserved
     list and the blocklist can refuse. */
  box.setRows([]);
  const names = ['halex', 'ada', 'sam', 'pat', 'jo', 'al', 'mo', 'zo', 'lucy', 'kit', box.FALLBACK];
  let paired = 0;
  const refused = [];
  const joins = (ps) => [ps.join(''), ps[0] + '_' + ps[1] + ps[2], ps[0] + ps[1] + '_' + ps[2]];
  names.forEach(n => box.ADJ.forEach(w => {
    for (let nn = box.TAIL_MIN; nn <= box.TAIL_MAX; nn++) {
      box.ORDERS.forEach(o => {
        const ps = o.map(p => (p === 'first' ? n : p === 'virtue' ? w : String(nn)));
        joins(ps).forEach(h => { paired++; if (box.trouble(h, null)) refused.push(h); });
      });
    }
  }));
  if (refused.length * 50 > paired) bad.push({ handle: refused.slice(0, 4).join(', '), want: 'yes',
    why: refused.length + ' of ' + paired + ' candidates are refused by the very gate the generator '
       + 'passes them through — past one in fifty a short name can run out of draws',
    said: box.trouble(refused[0], null) });

  /* ---------- THE SHAPE THE OWNER ASKED FOR, OVER TWO HUNDRED DRAWS --------------------------------
     A contract written HERE rather than read from people.gs, because it is the generator being
     checked and a check that asked `handleParts_` whether `handleMake_` was right would be the code
     marking its own homework. Every draw, on an empty tab, must be: the first name reduced the way
     `handleFirst_` says, a virtue, and a two-digit number 10–99, in one of the four orders; at most
     one underscore and only at a join; never starting with a digit; twenty characters at most; and
     something the gate itself accepts. Then the two hundred TOGETHER must show all four orders, an
     underscore and none, and more than one number — a generator that always drew `<first>_<virtue>NN`
     passes every single-handle rule above and is exactly the fixed order the owner asked to lose. */
  const WORDS = '(' + box.ADJ.join('|') + ')';
  const shapeOf = head => {
    const H = '(' + head + ')';
    return {
      'first-virtue-nn': new RegExp('^' + H + '_?' + WORDS + '_?([1-9][0-9])$'),
      'virtue-first-nn': new RegExp('^' + WORDS + '_?' + H + '_?([1-9][0-9])$'),
      'first-nn-virtue': new RegExp('^' + H + '_?([1-9][0-9])_?' + WORDS + '$'),
      'virtue-nn-first': new RegExp('^' + WORDS + '_?([1-9][0-9])_?' + H + '$'),
    };
  };
  const DRAWS = 200;
  const seenOrders = {}, seenJoins = {}, seenNums = {};
  let drawn = 0;
  const shapeCases = [
    ['Halex', 'halex'], ['ZOË', 'zo'], ["O'Brien", 'obrien'], ['Mary-Jane', 'maryjane'],
    ['2Pac', 'pac'], ['Charlotte', 'charlotte'], ['Maximilianoaurelius', 'maximilia'],
    ['', box.FALLBACK], ['李', box.FALLBACK],
  ];
  for (let i = 0; i < DRAWS; i++) {
    const [first, head] = shapeCases[i % shapeCases.length];
    const made = box.make(null, first);
    drawn++;
    const shapes = shapeOf(head);
    const which = Object.keys(shapes).filter(k => shapes[k].test(made));
    const unders = (made.match(/_/g) || []).length;
    const no = made ? box.trouble(made, null) : 'it gave up on an empty tab';
    const why = !made ? 'nothing came back'
      : /^[0-9]/.test(made) ? 'it starts with the digits'
      : !which.length ? 'it is not the first name, a virtue and a number 10–99 in one of the four orders'
      : unders > 1 ? 'it has more than one underscore'
      : made.length > 20 ? 'it is past twenty characters'
      : no ? 'the gate refuses it: ' + no : '';
    if (why) {
      bad.push({ handle: made || '(nothing)', want: head + ', a virtue and NN, in any order',
        why: why, said: 'first name "' + first + '", draw ' + (i + 1) + ' of ' + DRAWS });
      break;
    }
    which.forEach(k => { seenOrders[k] = true; });
    seenJoins[unders ? (made.indexOf('_') < made.length / 2 ? 'early' : 'late') : 'none'] = true;
    seenNums[made.match(/[0-9]{2}/)[0]] = true;
    /* AND THE PARSER READS IT. `renameHandles` leaves alone what `handleParts_` calls shaped, so a
       handle Randomise made that the parser could not read would be renamed by the next run of the
       job — the very thing the owner said must not happen to anybody's handle. */
    if (!box.shaped(made, first)) {
      bad.push({ handle: made, want: 'shaped', why: 'handleIsShaped_ does not read a handle the '
        + 'generator just made, so ?run=renameHandles would regenerate it', said: 'first "' + first + '"' });
      break;
    }
  }
  const lostOrders = WANT_ORDERS.filter(o => !seenOrders[o]);
  if (drawn === DRAWS && lostOrders.length) bad.push({ handle: 'handleMake_', want: 'all four orders',
    why: 'in ' + DRAWS + ' draws the generator never laid the parts out as ' + lostOrders.join(', ')
       + ' — "but all random order"', said: Object.keys(seenOrders).join(', ') || '(none)' });
  if (drawn === DRAWS && (!seenJoins.none || !(seenJoins.early || seenJoins.late)))
    bad.push({ handle: 'handleMake_', want: 'some with an underscore and some without',
      why: '"maybe an underscore" — over ' + DRAWS + ' draws both must appear',
      said: Object.keys(seenJoins).join(', ') });
  if (drawn === DRAWS && Object.keys(seenNums).length < 20) bad.push({ handle: 'handleMake_',
    want: 'a fresh number each draw', why: 'only ' + Object.keys(seenNums).length + ' different numbers in '
       + DRAWS + ' draws — the number is meant to be random every time, not the smallest free one',
    said: Object.keys(seenNums).slice(0, 8).join(', ') });

  /* ---------- A TAKEN WORD-AND-NUMBER IS NEVER HANDED OUT, IN ANY SPELLING -----------------------------
     The clash check compares by `key()`, which drops the underscore, so with `ada_kind42` held by
     somebody else the generator must not hand out `adakind42` either — the pair that reads as the same
     person. With every word in every one of the first two orders taken at one number, twenty draws
     must still come back free and never match a held one by `key`. */
  const taken = (first, holds) => holds.map((h, i) => ({ person_id: 'T' + i, handle: h,
    first_name: first, last_name: 'Other' + i }));
  const held = box.ADJ.map(w => 'ada_' + w + '42');
  box.setRows(taken('Ada', held));
  const heldKeys = held.map(h => h.replace(/_/g, ''));
  for (let i = 0; i < 20; i++) {
    const made = box.make(null, 'Ada');
    if (!made || heldKeys.indexOf(made.replace(/_/g, '')) !== -1) {
      bad.push({ handle: made || '(nothing)', want: 'a handle nobody holds',
        why: 'a handle that differs from somebody else\'s only by the underscore is the same name',
        said: made || '(nothing)' });
      break;
    }
  }

  /* ---------- NEVER THE HANDLE YOU ALREADY HAVE -----------------------------------------------------
     Randomise passes the current handle as `avoid`, and the gate cannot refuse it on its own: a
     person's own row is not a clash with them, so to the gate `ada_kind42` is FREE for its owner.
     With a fresh number every press the generator almost never OFFERS the current one, so thirty
     honest presses would pass a generator that ignored `avoid` entirely. So the dice are fixed:
     `Math.random` pinned to 0 makes every press draw the same candidates in the same order, the
     first press on an empty tab says what the first candidate is, and the person is then given
     exactly that handle — the next press must step past it, and past its spelling without the
     underscore, which `key()` reads as the same name. Restored in a `finally`, because a pinned
     `Math.random` left behind would make every later case here deterministic in silence. */
  const realRandom = Math.random;
  let firstDraw = '', stepped = '', steppedBare = '';
  try {
    Math.random = () => 0;
    box.setRows([]);
    firstDraw = box.make(null, 'Ada');
    const meAda = { person_id: 'ME', handle: firstDraw, first_name: 'Ada', last_name: 'Me' };
    box.setRows([meAda]);
    stepped = box.make(meAda, undefined, firstDraw);
    steppedBare = box.make(meAda, undefined, firstDraw.replace(/_/g, ''));
  } finally {
    Math.random = realRandom;
  }
  const keyOf = h => String(h || '').replace(/_/g, '');
  if (!firstDraw || !stepped || keyOf(stepped) === keyOf(firstDraw)) bad.push({
    handle: stepped || '(nothing)', want: 'anything but ' + firstDraw,
    why: 'Randomise handed back the handle the person already has', said: stepped || '(nothing)' });
  if (!steppedBare || keyOf(steppedBare) === keyOf(firstDraw)) bad.push({
    handle: steppedBare || '(nothing)', want: 'anything but ' + firstDraw + ' in any spelling',
    why: 'the same handle without its underscore is the same name to findPerson and to sign-in',
    said: steppedBare || '(nothing)' });
  /* AND THE HONEST VERSION TOO, thirty presses with real dice, none of them the current handle. */
  const meAda = { person_id: 'ME', handle: 'ada_kind42', first_name: 'Ada', last_name: 'Me' };
  box.setRows([meAda]);
  for (let i = 0; i < 30; i++) {
    const again = box.make(meAda, undefined, meAda.handle);
    if (!again || keyOf(again) === 'adakind42') { bad.push({ handle: again || '(nothing)',
      want: 'a different handle', why: 'Randomise handed back the handle the person already has',
      said: again || '(nothing)' }); break; }
  }

  /* AND A FIRST NAME THE GATE REFUSES OUTRIGHT FALLS TO THE FALLBACK, rather than giving up and
     leaving `register` to write a blank. Built from the blocklist at run time rather than written
     here, because a refused word pasted into this file is the word in one more file. */
  box.setRows([]);
  const blockedName = (consts.match(/HANDLE_BLOCKED\s*=\s*\[\s*'([a-z]+)'/) || [])[1];
  const fallbackShapes = shapeOf(box.FALLBACK);
  const isFallback = h => Object.keys(fallbackShapes).some(k => fallbackShapes[k].test(h));
  if (blockedName) {
    const made = box.make(null, blockedName);
    if (!made || !isFallback(made)) bad.push({ handle: made || '(nothing)',
      want: box.FALLBACK + ', a virtue and NN',
      why: 'a first name the blocklist refuses must fall back to the neutral head, not give up',
      said: '(a blocked first name)' });
  }

  /* ---------- `handleIsShaped_` — WHAT `renameHandles` READS AS ALREADY DONE ----------------------
     EVERY ARRANGEMENT, AND THE ONE BEFORE IT. The 1 October `halex_kind` and its tailed form are
     still the shape — the owner said existing handles are not regenerated, and this is the line that
     keeps the job from doing it. All four new orders, with and without an underscore at either join.
     Not the shape: the older `BrightOtter42`, `halex_bright42` (not a virtue), somebody else's head,
     a one-digit or three-digit number, a number out of 10–99, the digits first, two underscores,
     capitals, a trailing underscore. */
  [['halex_kind', true], ['halex_kind' + box.TAIL_MIN, true], [box.FALLBACK + '_brave', true],
   ['halexkind42', true], ['halex_kind42', true], ['halexkind_42', true],
   ['kindhalex42', true], ['kind_halex42', true], ['kindhalex_42', true],
   ['halex42kind', true], ['halex_42kind', true], ['halex42_kind', true],
   ['kind42halex', true], ['kind_42halex', true], ['kind42_halex', true],
   ['true42halex', true],
   ['BrightOtter42', false], ['halex_bright42', false], ['halex_golden', false], ['ada_kind', false],
   ['halex_kind4', false], ['halex_kind100', false], ['halex_kind05', false], ['Halex_kind', false],
   ['halex_', false], ['42halexkind', false], ['halex_kind_42', false], ['kind_42_halex', false],
   ['halex__kind42', false], ['halexkind42_', false],
  ].forEach(([h, want]) => {
    if (box.shaped(h, 'Halex') !== want) bad.push({ handle: h,
      want: want ? 'shaped' : 'not shaped',
      why: want ? 'renameHandles would regenerate a handle already in the shape on every run'
                : 'renameHandles would leave a handle that is not the generated shape alone',
      said: want ? 'no' : 'yes' });
  });
  /* A FIRST NAME THAT IS ALSO A VIRTUE. Somebody called True gets `true` as a head and might get
     `true` as a word; the parser must read `truekind42` and `kindtrue42` both, which it can only do
     because a regex of alternatives backtracks. */
  [['truekind42', 'True'], ['kindtrue42', 'True'], ['truetrue42', 'True']].forEach(([h, first]) => {
    if (!box.shaped(h, first)) bad.push({ handle: h, want: 'shaped',
      why: 'a first name that is also on the word list must still read as the shape',
      said: 'first "' + first + '": no' });
  });

  /* ---------- `handle_was`: NEWEST FIRST, AND THE LAST TEN ------------------------------------------
     There is no cooldown, so somebody can press Randomise all afternoon: the history keeps the newest
     `HANDLE_WAS_KEEP` rather than growing for ever, and the one just replaced is at the front. A
     version that overwrote the cell — which is what it did while there was a month between changes —
     answers "who was @foo" only about the last name. */
  const WAS = [
    ['', 'ada_kind', 'ada_kind', 'the first change starts the history'],
    ['ada_brave', 'ada_kind', 'ada_kind, ada_brave', 'the newest goes at the FRONT and the rest stay'],
    ['ada_brave', '', 'ada_brave', 'a blank handle replaced adds nothing'],
    [Array.from({ length: box.WAS_KEEP }, (_, i) => 'old' + i).join(', '), 'new',
      ['new'].concat(Array.from({ length: box.WAS_KEEP - 1 }, (_, i) => 'old' + i)).join(', '),
      'past ' + box.WAS_KEEP + ' the OLDEST falls off'],
  ];
  WAS.forEach(([cell, was, want, why]) => {
    const got = box.wasWith(cell, was);
    if (got !== want) bad.push({ handle: 'handle_was', want: want, why: why, said: got });
  });

  /* ---------- THE RETRY, AND THE GIVE-UP, WHICH ONLY A STUBBED GATE CAN REACH ---------------------
     The generator's contract is "keep asking until the gate says yes, and give up rather than loop",
     and that is a statement about the loop rather than about the words — so the gate is rebound. A
     gate that refuses everything must make it give up, and within a bound: `HANDLE_TRIES` draws for
     the name and as many for the fallback. A version that walked every number on every word in every
     order would ask over forty thousand times before saying no, on a request somebody is waiting for. */
  let asked = 0;
  box.setGate(() => { asked++; return 'no'; });
  const gaveUp = box.make(null, 'Halex');
  const bound = 2 * box.TRIES;
  if (gaveUp !== '') bad.push({ handle: String(gaveUp), want: '(nothing)',
    why: 'a gate that refuses everything must make the generator give up, not return a refused '
       + 'handle — `register` writes whatever it hands back',
    said: '"' + gaveUp + '"' });
  if (asked > bound) bad.push({ handle: 'handleMake_', want: 'at most ' + bound + ' asks',
    why: 'giving up must be bounded', said: asked + ' asks' });

  /* AND IT RETRIES RATHER THAN TAKING THE FIRST DRAW. A gate that refuses the first four candidates
     and then allows anything must still produce one — which a generator that asked once would fail
     and a generator that asked for ever would hang. */
  asked = 0;
  box.setGate(() => (++asked <= 4 ? 'taken' : ''));
  const fifth = box.make(null, 'Halex');
  if (!fifth || asked !== 5) bad.push({ handle: String(fifth), want: 'the fifth candidate',
    why: 'the generator does not retry past a refusal',
    said: 'it asked ' + asked + ' time(s) and returned "' + fifth + '"' });
  box.setGate(box.realGate);

  /* ---------- AND THE REPAIR JOB ONLY EVER FILLS A BLANK ----------------------------------------
     THE FAULT IT MUST NOT HAVE is overwriting a handle — that is `renameHandles`' job, on purpose and
     only where the shape is wrong. Every case below is a row shape that exists on the real tab. */
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
      why: 'a row that already has a handle was rewritten by the job that only fills blanks',
      said: rows[0].handle });
  }
  if (did.leftAlone !== 1) bad.push({ handle: 'fillHandles', want: '1 left alone',
    why: 'a run that reports nothing left alone reads the same whether it found nothing or '
       + 'rewrote everything', said: String(did.leftAlone) });
  if (!isFallback(rows[1].handle)) {
    bad.push({ handle: 'fillHandles', want: box.FALLBACK + ', a virtue and NN',
      why: 'a blank row with no first name gets the fallback head, a virtue and a number',
      said: '"' + rows[1].handle + '"' });
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
     It may overwrite where the handle was never the shape. What it must do, row by row:

       R1 `BrightOtter42`     the oldest shape — becomes the new one, old one kept
       R2 `ada_kind`          the 1 October shape — untouched. *Existing handles are not regenerated*,
                              and a child with no e-mail signs in with this.
       R3 blank, no name      the fallback head
       R4 `sam_steady71`      the 1 October shape with a tail. Until 2 October this job stripped a
                              tail nobody needed; a number is on every handle now, so it is left
                              alone — or the job would strip the number off every Randomise press.
       R5 `kind42zo`          the new shape, digits in the middle, no underscore — untouched
       R6 a full history      the new handle at the front of `handle_was` and the oldest off the end

     And a second run changes nothing. */
  box.setHeaders(['person_id', 'handle', 'handle_was', 'handle_changed_at', 'first_name']);
  const full = Array.from({ length: box.WAS_KEEP }, (_, i) => 'old' + i).join(', ');
  const rrows = [
    { person_id: 'R1', handle: 'BrightOtter42', first_name: 'Halex' },
    { person_id: 'R2', handle: 'ada_kind', first_name: 'Ada' },
    { person_id: 'R3', handle: '', first_name: '' },
    { person_id: 'R4', handle: 'sam_steady71', handle_was: 'samsmith', first_name: 'Sam' },
    { person_id: 'R5', handle: 'kind42zo', first_name: 'Zo' },
    { person_id: 'R6', handle: 'Pat_Typed', handle_was: full, first_name: 'Pat' },
  ];
  box.setRows(rrows);
  const ren = box.rename();
  const byId = id => rrows.find(r => r.person_id === id);
  const r1 = byId('R1'), r4 = byId('R4'), r5 = byId('R5'), r6 = byId('R6');
  const halexShapes = shapeOf('halex');
  if (!Object.keys(halexShapes).some(k => halexShapes[k].test(r1.handle))
      || r1.handle_was !== 'BrightOtter42' || !(r1.handle_changed_at instanceof Date)) {
    bad.push({ handle: 'renameHandles', want: 'halex, a virtue and NN; old kept, date written',
      why: 'the oldest shape must become the new one, the old in handle_was',
      said: r1.handle + ' / was ' + r1.handle_was });
  }
  if (byId('R2').handle !== 'ada_kind') bad.push({ handle: 'renameHandles', want: 'untouched',
    why: 'a 1 October handle is still the shape and must not be regenerated', said: byId('R2').handle });
  if (!isFallback(byId('R3').handle))
    bad.push({ handle: 'renameHandles', want: box.FALLBACK + ', a virtue and NN',
      why: 'a row with no first name gets the fallback head', said: byId('R3').handle });
  if (r4.handle !== 'sam_steady71' || r4.handle_was !== 'samsmith') {
    bad.push({ handle: 'renameHandles', want: 'sam_steady71, untouched',
      why: 'a number is part of the shape now — stripping it would strip every Randomise press too',
      said: r4.handle + ' / was ' + r4.handle_was });
  }
  if (r5.handle !== 'kind42zo') bad.push({ handle: 'renameHandles', want: 'untouched',
    why: 'a handle in one of the new orders must be left alone, or the job renames every '
       + 'Randomise press', said: r5.handle });
  const r6was = r6.handle_was.split(', ');
  if (r6was.length !== box.WAS_KEEP || r6was[0] !== 'Pat_Typed' || r6was.indexOf('old' + (box.WAS_KEEP - 1)) !== -1)
    bad.push({ handle: 'renameHandles', want: 'Pat_Typed first, ' + box.WAS_KEEP + ' kept',
      why: 'handle_was is the last ten, newest first', said: r6.handle_was });
  if (ren.renamedCount !== 3 || ['R1', 'R3', 'R6'].some(id => ren.renamed.indexOf(id) === -1)
      || ren.leftAlone !== rrows.length - 3) {
    bad.push({ handle: 'renameHandles', want: '3 renamed by id, the rest left alone',
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
    { person_id: 'P4', email: '',                pin: '0000', username: 'NoMail', handle: 'sam_kind' },
    { person_id: 'P5', email: '',                pin: '0000', username: 'Twin1',  handle: 'twin_brave' },
    { person_id: 'P6', email: '',                pin: '0000', username: 'Twin2',  handle: 'Twin_Brave' },
    /* A STUDENT WHO HAS AN ADDRESS, in each shape a handle has had: the 1 October
       `<first>_<virtue><nn>` and today's shuffled arrangement. *"have the students be able to login
       with their handles too"* — these two were the ones the handle door turned away. */
    { person_id: 'P7', email: 'mia@x.com',       pin: '0000', username: 'MiaS',   handle: 'mia_brave33' },
    { person_id: 'P8', email: 'leo@x.com',       pin: '0000', username: 'LeoS',   handle: 'kind42_leo' },
    { person_id: 'P9', email: 'new@x.com',       pin: '0000', username: 'NewS',   handle: 'nia_calm7', verified: 'PENDING' },
    /* A LONG FIRST NAME. `handleFirst_` keeps nine letters, so Christopher's handle carries
       `christoph` — and he types his name the way he spells it. */
    { person_id: 'P10', email: '',               pin: '0000', username: 'ChrisL', handle: 'uprightchristoph_71',
      first_name: 'Christopher' },
    /* A HANDLE TYPED INTO THE SHEET BY HAND, not in the generated shape: compared as it stands, so a
       long first name does not open a second spelling of it. */
    { person_id: 'P11', email: '',               pin: '0000', username: 'MaxL',   handle: 'maximili_rocks',
      first_name: 'Maximilian' },
  ];
  /* THE HELPER THE TWO DOORS SHARE (the lock, the PIN, the session) is cut out too, because the
     handler hands every found row to it. */
  const helpAt = post.indexOf('function signInRow_(');
  const helpEnd = helpAt < 0 ? -1 : post.indexOf('\n}\n', helpAt);
  if (helpAt < 0 || helpEnd < 0) {
    console.log('FAILED — could not find signInRow_ in dopost.gs to check.');
    process.exit(1);
  }
  const helperSrc = post.slice(helpAt, helpEnd + 3);
  const HANDLE_LOOKUP = [
    grab(people, /const HANDLE_ADJ\s*=\s*\[[\s\S]*?\];/, 'HANDLE_ADJ'),
    grab(people, /const HANDLE_FIRST_MAX[^;]*;/, 'HANDLE_FIRST_MAX'),
    grab(people, /const HANDLE_FALLBACK[^;]*;/, 'HANDLE_FALLBACK'),
    grab(people, /const HANDLE_TAIL_MIN[^;]*;/, 'HANDLE_TAIL_MIN'),
    grab(people, /const HANDLE_ORDERS\s*=\s*\[[\s\S]*?\]\];/, 'HANDLE_ORDERS'),
    grab(people, /function handleFirst_\([\s\S]*?\n\}/, 'handleFirst_'),
    grab(people, /function handleParts_\([\s\S]*?\n\}/, 'handleParts_'),
    grab(people, /function handleRows_\([\s\S]*?\n\}/, 'handleRows_'),
  ].join('\n');
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
    /* THE EMAILED PIN (see check-signin.js, which runs it for real) is nothing here, so what is
       under test stays which row a typed name lands on. */
    const authResetGet_ = () => null;
    const authResetUse_ = () => false;
    /* AND SO NOTHING WAS TAKEN BACK, so there is nothing about held children to say. */
    const authHeldSaid_ = () => '';
    const setCell = (t, r, f, v) => { r[f] = v; return true; };
    /* THE ONE READER BOTH DOORS USE, cut out of people.gs with what it reaches for. */
    ` + HANDLE_LOOKUP + `
    const authNewSession_ = () => 'token';
    const loginReplyFor_ = r => ({ success: true, who: r.person_id });
    const action = 'verifyLogin';
    ` + helperSrc + `
    ` + post.slice(vlAt, vlEnd) + `
    return { fellThrough: true };`);
  const SIGNIN = [
    { body: { email: '  ADA@example.COM ', pin: '0000' }, want: 'P1', why: 'case and spaces must not matter' },
    { body: { name: 'ada@example.com', pin: '0000' },     want: 'P1', why: 'an older phone sends the address as name' },
    { body: { email: 'AdaL', pin: '0000' },               want: '', code: 'not-an-email', why: 'a username is not an address' },
    { body: { name: 'NoMail', pin: '0000' },              want: '', code: 'not-an-email', why: 'a username is not a handle' },
    { body: { email: 'Sam_Kind', pin: '0000' },            want: 'P4', why: 'a row with no address signs in by handle, case folded' },
    { body: { email: 'sam_kind', pin: 'wrong' },            want: '', code: 'wrong-pin', why: 'a wrong PIN on a handle is still wrong' },
    { body: { email: 'twin_brave', pin: '0000' },           want: '',   why: 'two blank rows on one handle is refused, not guessed' },
    { body: { email: 'ada_x', pin: '0000' },                want: '', code: 'not-an-email', why: 'a handle nobody has signs nobody in' },
    { body: { email: 'adal', pin: '0000' },                 want: '', code: 'not-an-email', why: 'a username is still not a handle, address or not' },
    { body: { email: 'mia_brave33', pin: '0000' },          want: 'P7', why: 'a student WITH an address signs in by an old-shaped handle' },
    { body: { email: 'kind42_leo', pin: '0000' },           want: 'P8', why: 'a student WITH an address signs in by a new-shaped handle' },
    { body: { email: 'MIA_Brave33', pin: '0000' },          want: 'P7', why: 'the handle is case-insensitive' },
    { body: { email: '@mia_brave33', pin: '0000' },         want: 'P7', why: 'the handle as a card prints it, with its @' },
    { body: { email: '  mia_brave33 ', pin: '0000' },       want: 'P7', why: 'a handle pasted with spaces round it is the handle' },
    { body: { email: 'Mia@X.com', pin: '0000' },            want: 'P7', why: 'THE SAME PERSON BY ADDRESS — the handle door and the address door must land on one row, or signing in by handle is signing in as somebody else' },
    { body: { name: 'leo_kind42', pin: '0000' },            want: '', code: 'not-an-email', why: 'the same parts in another order are somebody else\'s handle, not this one' },
    { body: { email: 'mia_brave33', pin: 'wrong' },          want: '', code: 'wrong-pin', said: 'Wrong PIN for that handle.', why: 'a wrong PIN by handle is refused, and names the handle even though the row has an address' },
    { body: { email: 'mia@x.com', pin: 'wrong' },            want: '', code: 'wrong-pin', said: 'Wrong PIN for that email address.', why: 'the same row by address names the address' },
    { body: { email: 'nia_calm7', pin: '0000' },            want: 'P9', why: 'an unconfirmed address does not keep anybody out — the owner, 6 Oct' },
    { body: { email: 'ada@example.com', pin: 'wrong' },    want: '', code: 'wrong-pin', why: 'a wrong PIN is still wrong' },
    { body: { email: 'dup@x.com', pin: '0000' },          want: '',   why: 'two rows on one address is refused, not guessed' },
    { body: { email: 'nobody@x.com', pin: '0000' },       want: '', code: 'no-such-email', why: 'an address nobody has signs nobody in' },
    { body: { email: 'uprightchristoph_71', pin: '0000' },  want: 'P10', why: 'a long first name\'s handle as it is stored' },
    { body: { email: 'uprightchristopher_71', pin: '0000' }, want: 'P10', why: 'THE SAME HANDLE WITH THE WHOLE FIRST NAME SPELLED OUT — the child types their name as they spell it' },
    { body: { email: '@UprightChristopher71', pin: '0000' }, want: 'P10', why: 'spelled out, with the @, the case and no underscore' },
    { body: { email: 'uprightchristophe_71', pin: '0000' },  want: '', code: 'not-an-email', why: 'a misspelling of the name is not the name' },
    { body: { email: 'maximilian_rocks', pin: '0000' },      want: '', code: 'not-an-email', why: 'a hand-typed handle is compared as it stands — no second spelling of it' },
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
    /* THE WORDING IS PART OF THE ASK — "the same refusal wording" — so where a case names the
       sentence, the sentence is compared whole. */
    else if (c.said && (!got || got.error !== c.said)) bad.push({ handle: 'verifyLogin ' + JSON.stringify(c.body),
      want: 'refused with "' + c.said + '"', why: c.why, said: JSON.stringify(got) });
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
  console.log('\nhandles judged by the gate: ' + CASES.length
    + '  ·  virtues: ' + box.ADJ.length + ', each beside ' + names.length + ' first names in '
    + box.ORDERS.length + ' orders, 3 joins and every number: ' + paired + ' candidates, '
    + refused.length + ' refused by the gate and drawn again'
    + '  ·  handles generated and shaped: ' + drawn + ' over ' + shapeCases.length + ' first names, orders seen: '
    + Object.keys(seenOrders).length + ', numbers seen: ' + Object.keys(seenNums).length
    + '  ·  handle_was histories: ' + WAS.length
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
    console.log('FAILED — a handle is the one name on a person that everybody else has to look '
              + 'at, what a tutor charges is what every booking already taken was priced '
              + 'against, and who a name resolves to decides whose PIN a sign-in is checked '
              + 'against. This is the only thing standing between any of them and the sheet.');
    process.exitCode = 1;
  } else {
    console.log('OK — every handle is a first name, a virtue and a fresh number in a random order, '
              + 'never starting with the digits, never the one you have, every older shape still '
              + 'reads as shaped, nobody can be handed a name that already answers to somebody '
              + 'else, and the pricing month holds.');
  }
}

run();
