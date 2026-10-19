require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-handles.js A HANDLE IS THE ONE NAME ON A PERSON THAT EVERYBODY ELSE HAS TO LOOK AT. § */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const people = fs.readFileSync(path.join(ROOT, 'backend', 'people.gs'), 'utf8');
const consts = fs.readFileSync(path.join(ROOT, 'backend', 'constants.gs'), 'utf8');
const setup  = fs.readFileSync(path.join(ROOT, 'backend', 'setup.gs'), 'utf8');

/* ---------- CUT BY NAME, AND FAIL LOUDLY IF A NAME IS NOT THERE § */
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
  /* ---------- AND THE GENERATOR, WHICH THE COMMENT OVER IT CANNOT CHECK ITSELF § */
  grab(people, /const HANDLE_ADJ\s*=\s*\[[\s\S]*?\];/, 'HANDLE_ADJ'),
  grab(people, /const HANDLE_FIRST_MAX[^;]*;/, 'HANDLE_FIRST_MAX'),
  grab(people, /const HANDLE_FALLBACK[^;]*;/, 'HANDLE_FALLBACK'),
  grab(people, /const HANDLE_TAIL_MIN[^;]*;/, 'HANDLE_TAIL_MIN'),
  grab(people, /const HANDLE_ORDERS\s*=\s*\[[\s\S]*?\]\];/, 'HANDLE_ORDERS'),
  /* ---------- A CHILD'S HANDLE (342), AND THE ONE TEST THAT SAYS WHO IS A CHILD § */
  grab(consts, /const SELF_ROLE_ALIASES\s*=\s*\{[\s\S]*?\};/, 'SELF_ROLE_ALIASES'),
  grab(consts, /const LISTED_PENDING[^;]*;/, 'LISTED_PENDING'),
  grab(people, /function rolesOf\([\s\S]*?\n\}/, 'rolesOf'),
  grab(people, /function hasRole\([^\n]*\n/, 'hasRole'),
  grab(people, /function tutorPending_\([\s\S]*?\n\}/, 'tutorPending_'),
  grab(people, /function actingRole_\([\s\S]*?\n\}/, 'actingRole_'),
  grab(people, /function isChild_\([\s\S]*?\n\}/, 'isChild_'),
  grab(people, /const HANDLE_KID_FOLD[^;]*;/, 'HANDLE_KID_FOLD'),
  grab(people, /function handleFirst_\([\s\S]*?\n\}/, 'handleFirst_'),
  grab(people, /function handleParts_\([\s\S]*?\n\}/, 'handleParts_'),
  grab(people, /const HANDLE_NO_LETTER[^;]*;/, 'HANDLE_NO_LETTER'),
  grab(people, /function handleLetters_\([\s\S]*?\n\}/, 'handleLetters_'),
  grab(people, /const HANDLE_ACTIVITY[^;]*;/, 'HANDLE_ACTIVITY'),
  grab(people, /function handleFirstSeen_\([\s\S]*?\n\}/, 'handleFirstSeen_'),
  grab(people, /function handleJoined_\([\s\S]*?\n\}/, 'handleJoined_'),
  grab(people, /function handleInShape_\([\s\S]*?\n\}/, 'handleInShape_'),
  grab(people, /function handleCandidates_\([\s\S]*?\n\}/, 'handleCandidates_'),
  grab(people, /function handleTemplate_\([\s\S]*?\n\}/, 'handleTemplate_'),
  grab(people, /function handleMake_\([\s\S]*?\n\}/, 'handleMake_'),
  grab(people, /function handleFriendsMove_\([\s\S]*?\n\}/, 'handleFriendsMove_'),
  grab(fs.readFileSync(path.join(ROOT, 'backend', 'core.gs'), 'utf8'), /function sheetDate\([\s\S]*?\n\}/, 'sheetDate'),
  grab(people, /function handleWasWith_\([\s\S]*?\n\}/, 'handleWasWith_'),
  /* AND THE FACE A MOVED HANDLE KEEPS (342, round 2) — `renameHandles_` writes it before the handle.
     `check-signin.js` holds the face itself, drawn by the phone's own code. */
  grab(people, /const FACE_SKINS[^;]*;/, 'FACE_SKINS'),
  grab(people, /const FACE_HAIRS[^;]*;/, 'FACE_HAIRS'),
  grab(people, /function handleFaceKept_\([\s\S]*?\n\}/, 'handleFaceKept_'),
  /* ---------- AND THE REPAIR JOB, WHICH IS THE ONE THING HERE THAT WRITES § */
  grab(setup,  /function fillHandles\([\s\S]*?\n\}/, 'fillHandles'),
  /* AND THE ONE THAT REPLACES A HANDLE ON PURPOSE, into the owner's `<first>_<virtue>`. */
  grab(setup,  /function renameHandles_\([\s\S]*?\n\}/, 'renameHandles_'),
  /* WHICH NOW REPORTS A PRIVATE GROWN-UP WHOSE HANDLE CARRIES THEIR SURNAME (342) — the real test of who
     is private, cut out with it. */
  grab(people, /function namePrivate_\([\s\S]*?\n\}/, 'namePrivate_'),
  grab(consts, /const PRICING_COOLDOWN_DAYS[^;]*;/, 'PRICING_COOLDOWN_DAYS'),
  /* THE FOUR FIELDS THE RULE IS ABOUT, READ OUT OF `constants.gs` RATHER THAN LISTED HERE. § */
  grab(consts, /const PRICING_FIELDS[^;]*;/, 'PRICING_FIELDS'),
  grab(people, /function pricingMoved_\([\s\S]*?\n\}/, 'pricingMoved_'),
  grab(people, /function pricingRefusal_\([\s\S]*?\n\}/, 'pricingRefusal_'),
  /* ---------- AND THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR (docs/history/345) § */
  grab(consts, /const SEAT_CUT_FIELD[^;]*;/, 'SEAT_CUT_FIELD'),
  grab(people, /function seatCutRefusal_\([\s\S]*?\n\}/, 'seatCutRefusal_'),
  grab(people, /function seatCutOut_\([\s\S]*?\n\}/, 'seatCutOut_'),
].join('\n\n');

/* The eight Apps Script helpers those two reach for, and nothing else. § */
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
  const fmtDate = d => d.toISOString().slice(0, 10);
  let ROWS = [];
  const TAB = { people: 'people', submissions: 'submissions' };
  let OTHER = {};
  const setOther = o => { OTHER = o; };
  /* ---------- A SHEET ENOUGH OF ONE FOR A JOB THAT WRITES ---------------------------------------
     fillHandles ASKS THREE THINGS OF THE TAB that the clash check never did: that it exists, what
     its headers are, and to be written to. The headers are the two columns the job itself refuses to
     run without -- named rather than assumed, so a rule can put the missing-column branch through
     it. setCell writes the row IN PLACE, exactly as the real one's last line does, which is what
     lets a case read back what the job did.
     NO BACKTICKS IN HERE EITHER, and this comment is why the rule two blocks up is written down:
     the first version of it used them and the file failed to parse eighty lines from the cause. */
  const read = n => (n && n !== 'people' ? { rows: OTHER[n] || [], sheet: true, headers: [] } : { rows: ROWS, sheet: true, headers: HEADERS });
  let HEADERS = ['person_id', 'handle', 'email', 'first_name', 'last_name', 'handle_was'];
  const setCell = (t, r, f, v) => { r[f] = v; WROTE.push(f); return true; };
  const setCells = (t, r, o) => Object.keys(o).forEach(f => setCell(t, r, f, o[f]));
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
           + ' box.cut = seatCutRefusal_; box.cutOut = seatCutOut_; box.CUT_FIELD = SEAT_CUT_FIELD;'
           + ' box.find = findPerson; box.mail = emailRefusal_;'
           + ' box.make = handleMake_; box.ADJ = HANDLE_ADJ;'
           + ' box.FIRST_MAX = HANDLE_FIRST_MAX; box.FALLBACK = HANDLE_FALLBACK;'
           + ' box.TAIL_MIN = HANDLE_TAIL_MIN; box.TAIL_MAX = HANDLE_TAIL_MAX;'
           + ' box.wasWith = handleWasWith_;'
           + ' box.first = handleFirst_; box.rename = renameHandles_;'
           + ' box.parts = handleParts_; box.ORDERS = HANDLE_ORDERS;'
           + ' box.fill = fillHandles;'
           + ' box.isChild = isChild_;'
           /* THE GATE ITSELF, SO THE GENERATOR'S OWN LOOP CAN BE TESTED. § */
           + ' box.shape = HANDLE_SHAPE;'
           + ' box.realGate = handleTrouble_;'
           + ' box.setGate = f => { handleTrouble_ = f; };'
           + ' box.setHeaders = h => { HEADERS = h; }; box.setOther = setOther;'
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

/* ---------- EVERY CASE IS A FAULT THAT HAPPENED OR WOULD HAVE § */
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

  /* ---------- EVERY COMPARISON FOLDS THE CASE § */
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

  /* AND NO MONTH. The cooldown went with the typed box: § */
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

  /* ---------- SIGNING IN WITH AN E-MAIL, AND THE COLLISION THAT MADE IT A DIFFERENT FOLD § */
  const MAILS = [
    { person_id: 'P010', handle: 'alexd', username: 'alexd', full_name: 'Alex Dias',
      first_name: 'Alex', last_name: 'Dias', email: 'alex@dias.com' },
    { person_id: 'P011', handle: 'adc',   username: 'adc',   full_name: 'Alex Dias Com',
      first_name: 'Alex', last_name: 'Dias Com', email: '' },
    { person_id: 'P012', handle: 'bee',   username: 'bee',   full_name: 'Bee Keeper',
      first_name: 'Bee', last_name: 'Keeper', email: 'BEE@Hive.co.uk' },
    /* ---------- AND A ROW WHOSE E-MAIL CELL HOLDS A NAME § */
    /* THE JUNK ROW SITS FIRST, and that is the whole of what makes this a test. § */
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
    /* ---------- THE GUARD IS WHAT PROTECTS THIS, AND THE RUNG ORDER IS NOT § */
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

  /* ---------- AND THE TYPED PATH IS GONE, AND THE DOOR THAT REPLACED IT IS THE ASKER'S OWN § */
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
  /* AND NO PRESS (364): the handle is a template, so `randomiseHandle` has no door and no handler. */
  if (/randomiseHandle/.test(code(consts) + code(post))) bad.push({ handle: 'randomiseHandle', want: 'gone',
    why: 'the owner: "no more randomisation feature"', said: 'still in constants.gs or dopost.gs' });

  /* ---------- AND `register`, WHICH IS THE WRITER EVERY ACCOUNT GOES THROUGH ONCE § */
  const reg = post.indexOf("action === 'register'");
  /* ---------- TO THE NEXT HANDLER, NOT FOR 4000 CHARACTERS § */
  const rEnd = reg < 0 ? -1 : post.indexOf("if (action ===", reg + 20);
  const rblock = reg < 0 ? '' : post.slice(reg, rEnd > reg ? rEnd : undefined);
  if (!rblock) {
    console.log('FAILED — could not find the register handler in dopost.gs to check.');
    process.exit(1);
  }
  if (!/handle:\s*regHandle/.test(rblock)) bad.push({ handle: 'register', want: 'a handle',
    why: 'a row written with no handle shows its squashed name in place of one, for ever',
    said: 'dopost.gs does not write a generated handle at registration' });

  /* ---------- AND NOTHING WRITES A `username` ANY MORE § */
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

  /* ---------- THE TEMPLATE (367): FIRST INITIAL AND THE YEAR THEY JOINED — WORKED OUT ALONE */
  box.setGate(box.realGate);
  box.setRows([]);
  const NOW_Y = String(new Date().getFullYear());
  const TPL = [
    [{ person_id: 'P1', first_name: 'Tam', last_name: 'Dove', joined_on: '04/03/2025' }, 't2025', 'the plain template'],
    [{ person_id: 'P2', first_name: 'Ed', last_name: 'Ng', joined_on: new Date(2024, 10, 21) }, 'e2024', 'a date cell, as the sheet hands one over'],
    [{ person_id: 'P3', first_name: 'Zoë', last_name: 'Łukas', joined_on: '30/1/2023' }, 'z2023', 'an accent folded'],
    [{ person_id: 'P4', first_name: 'Łena', last_name: 'Ruiz', joined_on: '1/1/2022' }, 'l2022', 'a stroke folded'],
    [{ person_id: 'P-1042', first_name: 'Ana', last_name: 'Ruiz' }, 'a' + NOW_Y, 'no join date and no activity: the year now'],
    [{ person_id: 'P-X', first_name: '', last_name: '', joined_on: '1/1/2025' }, 'x2025', 'nothing to go on still makes a handle'],
    [{ person_id: 'P5', first_name: "O'Neil", last_name: 'de Vries', date_of_birth: '09/09/2010', joined_on: '2/2/2025' }, 'o2025', 'a birthday changes nothing'],
  ];
  TPL.forEach(([r, want, why]) => {
    const got = box.make(r);
    if (got !== want) bad.push({ handle: 'handleMake_', want: want, why: why, said: got });
    if (!box.shape.test(got)) bad.push({ handle: got, want: 'HANDLE_SHAPE', why: 'a made handle the gate refuses', said: got });
    if (/dove|ruiz|vries|ng$/.test(got.replace(/\d+$/, '').slice(1))) bad.push({ handle: got, want: 'no surname', why: 'a handle never shows a surname', said: got });
  });
  /* A CLASH: another person's handle OR old handle is never handed out; first-name letters are added, then a counter. */
  box.setRows([{ person_id: 'Q1', handle: 't2025' }, { person_id: 'Q2', handle: 'x', handle_was: 'ta2025' }]);
  const clash = box.make({ person_id: 'P1', first_name: 'Tam', joined_on: '04/03/2025' });
  if (clash !== 'tam2025') bad.push({ handle: 'handleMake_', want: 'tam2025', why: 't2025 is somebody\'s handle and ta2025 somebody\'s old one', said: clash });
  box.setRows([{ person_id: 'Q1', handle: 'b2025' }, { person_id: 'Q2', handle: 'bo2025' }]);
  const counted = box.make({ person_id: 'P1', first_name: 'Bo', joined_on: '04/03/2025' });
  if (counted !== 'bo20252') bad.push({ handle: 'handleMake_', want: 'bo20252', why: 'the first name ran out, so a counter', said: counted });
  /* NOTHING RANDOM: the same row gives the same handle every time. */
  box.setRows([]);
  const same = new Set(Array.from({ length: 20 }, () => box.make({ person_id: 'P7', first_name: 'Kit', last_name: 'Moss', joined_on: '1/5/2025' })));
  if (same.size !== 1) bad.push({ handle: 'handleMake_', want: 'one handle', why: 'a template a child can work out cannot vary', said: [...same].join(', ') });
  if (/random/i.test(SRC.match(/function handleCandidates_[\s\S]*?\n\}/)[0] + SRC.match(/function handleMake_[\s\S]*?\n\}/)[0])) {
    bad.push({ handle: 'handleMake_', want: 'no Math.random', why: 'the owner: "no more randomisation"', said: 'it draws' });
  }

  /* ---------- AND THE MOVE: EVERYBODY, EARLIEST JOINER FIRST, OLD HANDLE KEPT, FRIENDS MOVED, SAFE TO REPEAT */
  box.setHeaders(['person_id', 'handle', 'email', 'first_name', 'last_name', 'handle_was', 'handle_changed_at', 'friends', 'joined_on', 'role']);
  /* Tia has the lower id but joined later, so Tam (earlier) wins t2025; Oli's year comes from his first submission. */
  const mv = [
    { person_id: 'P-1', role: 'student', first_name: 'Tia', last_name: 'Dunn', joined_on: '04/11/2025', handle: 't04d' },
    { person_id: 'P-2', role: 'tutor', first_name: 'Tam', last_name: 'Dove', joined_on: '04/03/2025', handle: 'tam_kind62', handle_was: 'tamd' },
    { person_id: 'P-3', role: 'client', first_name: 'Oli', last_name: 'Sand', handle: 'os03', friends: 'tam_kind62, t04d, nobody' },
    { person_id: 'P-4', role: 'student', first_name: 'Ann', last_name: 'Roe', joined_on: '09/01/2024', handle: 'a2024' },
  ];
  box.setRows(mv);
  box.setOther({ submissions: [{ person_id: 'P-3', submitted_at: '2024-06-01' }, { person_id: 'P-3', submitted_at: '2025-01-01' }] });
  const ran = box.rename();
  const mvGot = mv.map(r => r.handle).join(' ');
  if (mvGot !== 'ti2025 t2025 o2024 a2024') bad.push({ handle: 'renameHandles_', want: 'ti2025 t2025 o2024 a2024', why: 'every role moves; the earlier joiner wins a clash; no join date takes the first activity', said: mvGot });
  if (mv[1].handle_was !== 'tam_kind62, tamd') bad.push({ handle: 'renameHandles_', want: 'tam_kind62, tamd', why: 'the old handle goes to the front of handle_was and still signs in', said: mv[1].handle_was });
  if (mv[2].friends !== 't2025, ti2025, nobody') bad.push({ handle: 'renameHandles_', want: 'friends moved', why: 'a list naming an old handle names nobody', said: mv[2].friends });
  if (ran.renamed !== 3 || ran.leftAlone !== 1 || ran.longer !== 1 || ran.yearFrom.activity !== 1 || ran.yearFrom.joined_on !== 2) bad.push({ handle: 'renameHandles_', want: '3 moved, 1 left, 1 longer, 1 year from activity', why: 'the counts the reply gives', said: JSON.stringify(ran) });
  box.setOther({});
  const twice = box.rename();
  if (twice.renamed !== 0) bad.push({ handle: 'renameHandles_', want: 'nothing moved', why: 'once made, a handle never changes — not even when its fallback year would now differ', said: JSON.stringify(twice) });
  box.setHeaders(['person_id', 'handle']);
  if (!box.rename().error) bad.push({ handle: 'renameHandles_', want: 'a refusal', why: 'with no handle_was a moved handle loses its sign-in', said: '(it ran)' });
  box.setHeaders(['person_id', 'handle', 'email', 'first_name', 'last_name', 'handle_was']);


  /* ---------- `handle_was`: NEWEST FIRST, AND EVERY ONE KEPT § */
  const WAS = [
    ['', 'ada_kind', 'ada_kind', 'the first change starts the history'],
    ['ada_brave', 'ada_kind', 'ada_kind, ada_brave', 'the newest goes at the FRONT and the rest stay'],
    ['ada_brave', '', 'ada_brave', 'a blank handle replaced adds nothing'],
    ['ada_kind, ada_brave', 'Ada_Kind', 'ada_kind, ada_brave', 'the handle already at the front is no change — a re-run after a failed write does not say it twice'],
    ['ada_kind, ada_brave', 'ada_brave', 'ada_brave, ada_kind, ada_brave', 'going BACK to an older handle is a true history, kept'],
    [Array.from({ length: 250 }, (_, i) => 'old' + i).join(', '), 'new',
      ['new'].concat(Array.from({ length: 250 }, (_, i) => 'old' + i)).join(', '),
      'past 250 NOTHING falls off — every old handle still signs its person in'],
  ];
  WAS.forEach(([cell, was, want, why]) => {
    const got = box.wasWith(cell, was);
    if (got !== want) bad.push({ handle: 'handle_was', want: want, why: why, said: got });
  });

  /* ---------- AND THE REPAIR JOB ONLY EVER FILLS A BLANK § */
  box.setHeaders(['person_id', 'handle', 'email', 'first_name', 'last_name']);
  const rows = [
    { person_id: 'P1', handle: 'AdaV', email: 'a@b.com',
      first_name: 'Ada', last_name: 'Vale' },                       // has one — must not be touched
    { person_id: 'P4', handle: '', email: '', first_name: '', last_name: '' },
  ];
  box.setRows(rows);
  box.clearWrote();
  const did = box.fill();
  if (rows[0].handle !== 'AdaV') {
    bad.push({ handle: 'fillHandles', want: 'untouched',
      why: 'a row that already has a handle was rewritten by the job that only fills blanks',
      said: rows[0].handle });
  }
  if (did.leftAlone !== 1) bad.push({ handle: 'fillHandles', want: '1 left alone',
    why: 'a run that reports nothing left alone reads the same whether it found nothing or '
       + 'rewrote everything', said: String(did.leftAlone) });
  if (rows[1].handle !== 'x' + new Date().getFullYear()) {
    bad.push({ handle: 'fillHandles', want: 'x' + new Date().getFullYear(),
      why: 'a blank row with no name and no join date gets the template: a stand-in initial and the year now',
      said: '"' + rows[1].handle + '"' });
  }
  if (box.wrote().indexOf('username') !== -1) bad.push({ handle: 'fillHandles', want: 'no username',
    why: 'the column is gone, so a write to it is a write to nothing', said: box.wrote().join(', ') });
  /* AND IT INVENTS NEITHER AN EMAIL NOR A NAME, which is the line this job stops at: § */
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
  /* AND IT REFUSES RATHER THAN RUNNING WHEN THE COLUMN IS NOT THERE. § */
  box.setHeaders(['person_id', 'email']);
  box.setRows([{ person_id: 'P9', handle: '' }]);
  if (!box.fill().error) bad.push({ handle: 'fillHandles', want: 'a refusal',
    why: 'with no handle column every write is silently lost and the job reports success',
    said: '(it ran)' });

  /* ---------- AND THE FIXTURE CANNOT STATE A HANDLE THE SERVER WOULD NEVER SEND § */
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


  /* ---------- AND WHAT A TUTOR CHARGES, WHICH IS THE SAME MONTH OVER FOUR NUMBERS § */
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

  /* ---------- AND THE FOUR ARE THE FOUR, which no case above can say § */
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

  /* ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT: AN ADMIN'S, AND BLANK IS NOT NOUGHT (docs/history/345) § */
  const CUT0 = { person_id: 'P002', rate_per_hour: 30, extra_seat_rate: 0.5, extra_seat_cut: '' };
  const CUTOWN = Object.assign({}, CUT0, { extra_seat_cut: 0.1 });
  const CUTNONE = Object.assign({}, CUT0, { extra_seat_cut: 0 });
  const CUTONE = Object.assign({}, CUT0, { extra_seat_cut: 1 }), CUTTWO = Object.assign({}, CUT0, { extra_seat_cut: 2 });
  const CUTS = [
    ['yes', CUT0,   {}, false, 'a page that sends no cut is not a change'],
    ['yes', CUT0,   { extra_seat_cut: '' }, false, 'a tutor\'s no-change Save posts the blank it was drawn with'],
    ['yes', CUTOWN, { extra_seat_cut: '0.10' }, false, 'and "0.10" over 0.1 is the same share written twice'],
    ['yes', CUTNONE, { extra_seat_cut: '0' }, false, 'and "0" over nought is nought'],
    ['no',  CUT0,   { extra_seat_cut: '0.2' }, false, 'a TUTOR setting the business\'s cut — their margin is not theirs to move'],
    ['no',  CUT0,   { extra_seat_cut: '0' }, false, 'nor taking it to nothing, blank to nought'],
    ['no',  CUTOWN, { extra_seat_cut: '' }, false, 'nor putting it back to the usual'],
    ['yes', CUT0,   { extra_seat_cut: '0.2' }, true, 'an admin sets it'],
    ['yes', CUT0,   { extra_seat_cut: '0' }, true, 'an admin takes it to nought — no cut for this tutor'],
    ['yes', CUTOWN, { extra_seat_cut: '' }, true, 'an admin puts it back to the usual share'],
    ['yes', CUT0,   { extra_seat_cut: '2' }, true, 'two is the top of the range'],
    ['no',  CUT0,   { extra_seat_cut: '15' }, true, '15 is pounds typed into a fraction, refused for an admin too'],
    ['no',  CUT0,   { extra_seat_cut: '-0.1' }, true, 'and a share below nothing'],
    ['no',  CUT0,   { extra_seat_cut: 'ten percent' }, true, 'and words'],
    /* ONE PARSER, THE PATTERN (the review of 345): § */
    ['no',  CUTONE, { extra_seat_cut: '0x1' }, false, 'a TUTOR writing "0x1" over a cut of 1 — Number() reads 1, parseFloat 0'],
    ['no',  CUTTWO, { extra_seat_cut: '0b10' }, false, 'nor "0b10" over a cut of 2'],
    ['no',  CUTONE, { extra_seat_cut: '1e0' }, false, 'nor another spelling of the same 1 — the cell is not theirs to rewrite'],
    ['yes', CUTONE, { extra_seat_cut: '1.0' }, false, 'but "1.0" over 1 is the same cut written twice'],
    ['no',  CUT0,   { extra_seat_cut: '0x1' }, true, 'and "0x1" from an admin, which would be sent as nought'],
    ['no',  CUT0,   { extra_seat_cut: '£0.10' }, true, 'and "£0.10" — a cut is a plain share, never pounds'],
  ];
  CUTS.forEach(([want, me, f, isAdmin, why]) => {
    const said = box.cut(me, f, isAdmin);
    const got = said ? 'no' : 'yes';
    if (got !== want) bad.push({ handle: 'cut \u2192 ' + JSON.stringify(f)
      + (isAdmin ? ' (admin)' : ''), want, why, said: said || '(allowed)' });
  });
  /* WHAT `doGet` SENDS FOR IT: § */
  [['', ''], [null, ''], [0, 0], ['0', 0], [0.1, 0.1], ['0.25', 0.25], [2, 2], ['abc', ''],
   ['0x1', ''], ['0b10', ''], ['10', ''], [15, ''], ['-0.1', ''], [-0.1, ''], ['£0.10', ''], ['10%', '']].forEach(([cell, want]) => {
    const got = box.cutOut(cell);
    if (got !== want) bad.push({ handle: 'seatCutOut_(' + JSON.stringify(cell) + ')', want: JSON.stringify(want),
      why: 'blank is the usual cut and nought is none — doGet must keep them apart', said: JSON.stringify(got) });
  });
  /* AND IT IS NOT UNDER THE TUTOR'S MONTH: a fifth of the four would stamp `pricing_changed_at` on an admin's edit. */
  if (box.fields.indexOf(box.CUT_FIELD) !== -1) bad.push({ handle: 'PRICING_FIELDS', want: 'no ' + box.CUT_FIELD,
    why: 'the business\'s cut is an admin\'s and must not start the tutor\'s month', said: JSON.stringify(box.fields) });

  /* ---------- `SIGNIN` — AN E-MAIL ADDRESS AND A PIN, AND NOTHING ELSE § */
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
    /* A STUDENT WHO HAS AN ADDRESS, in each shape a handle has had: § */
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
    /* ---------- A CHILD WHOSE HANDLE WAS MOVED (342), and the two ways an old handle could go wrong § */
    { person_id: 'P12', email: '',               pin: '0000', username: 'EllaJ',  handle: 'ej2345',
      handle_was: 'ella_kind42, Ella_Bold17', first_name: 'Ella', last_name: 'Jones' },
    { person_id: 'P13', email: '',               pin: '0000', username: 'MoNow',  handle: 'mo_brave33' },
    { person_id: 'P14', email: '',               pin: '0000', username: 'MoWas',  handle: 'mz6789', handle_was: 'mo_brave33' },
    { person_id: 'P15', email: '',               pin: '0000', username: 'ZedA',   handle: 'ab2345', handle_was: 'zed_kind11' },
    { person_id: 'P16', email: '',               pin: '0000', username: 'ZedB',   handle: 'ab3456', handle_was: 'zed_kind11' },
    /* AND A LONG FIRST NAME WHOSE OLD HANDLE WAS CUT TO NINE LETTERS (342, the review): he typed it in
       full before the move and must still be let in by it after. */
    { person_id: 'P17', email: '',               pin: '0000', username: 'ChrisL', handle: 'cl2345', handle_was: 'christoph_kind42',
      first_name: 'Christopher', last_name: 'Lane' },
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
    /* THE ONE MATCHER BOTH READ (342, the review): a handle, or a long first name spelled out in it. */
    grab(people, /function handleAnswers_\([\s\S]*?\n\}/, 'handleAnswers_'),
    /* AND THE OLD HANDLES (342), asked only when nobody holds what was typed now. */
    grab(people, /function handleWasRows_\([\s\S]*?\n\}/, 'handleWasRows_'),
    grab(people, /function handleWasEntry_\([\s\S]*?\n\}/, 'handleWasEntry_'),
  ].join('\n');
  const signIn = new Function('body', 'ROWS', `
    const S = v => String(v == null ? '' : v).trim();
    const norm = v => S(v).toLowerCase();
    const key = v => S(v).toLowerCase().replace(/[^a-z0-9]/g, '');
    const TAB = { people: 'people', submissions: 'submissions' };
  let OTHER = {};
  const setOther = o => { OTHER = o; };
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
    /* NOR ANY CHANGE OF ADDRESS CANCELLED by a taking back (\`authMoveSaid_\`, check-signin (h)). */
    const authMoveSaid_ = () => '';
    const setCell = (t, r, f, v) => { r[f] = v; return true; };
    /* THE ONE READER BOTH DOORS USE, cut out of people.gs with what it reaches for. */
    ` + HANDLE_LOOKUP + `
    const authNewSession_ = () => 'token';
    /* WHICH OLD HANDLE LET THEM IN, AND WHAT THEY ARE NOW — the reply's handleMoved (342). */
    const loginReplyFor_ = (r, tok, extra) => ({ success: true, who: r.person_id,
      moved: extra && extra.handleMoved ? extra.handleMoved.was + '>' + extra.handleMoved.now : '' });
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
    /* THE OLD HANDLE ON A CHILD'S SLIP STILL LETS HER IN, AND SAYS WHAT SHE IS NOW (342). */
    { body: { email: 'ella_kind42', pin: '0000' },          want: 'P12', moved: 'ella_kind42>ej2345', why: 'a handle on handle_was still signs its child in, and the reply says the new one' },
    { body: { email: '@ella_bold17', pin: '0000' },         want: 'P12', moved: 'Ella_Bold17>ej2345', why: 'an older one too, typed as a card prints it — and said back as it is stored' },
    { body: { email: 'ej2345', pin: '0000' },               want: 'P12', moved: '', why: 'her handle now signs her in and says nothing has moved' },
    { body: { email: 'ella_kind42', pin: 'wrong' },         want: '', code: 'wrong-pin', said: 'Wrong PIN for that handle.', why: 'an old handle meets the same PIN and the same throttle as a new one' },
    { body: { email: 'mo_brave33', pin: '0000' },           want: 'P13', moved: '', why: 'A HANDLE SOMEBODY HAS NOW WINS — it was P14\'s once, and an old entry must never sign in a different person' },
    { body: { email: 'zed_kind11', pin: '0000' },           want: '', why: 'an old handle in two accounts\' histories is refused, not guessed' },
    /* AFTER REVIEW (342): an old handle answers to every spelling it answered to when it was current —
       the whole first name where it keeps nine letters — and to nothing less than the whole of it. */
    { body: { email: 'christopher_kind42', pin: '0000' },   want: 'P17', moved: 'christoph_kind42>cl2345', why: 'an OLD handle, spelled with the whole first name the way he always typed it — the move must not be what locks him out' },
    { body: { email: 'ella_kin', pin: '0000' },             want: '', code: 'not-an-email', why: 'a prefix of an old handle is not the handle' },
    { body: { email: 'ella_kind4', pin: '0000' },           want: '', code: 'not-an-email', why: 'nor is an old handle one character short' },
    { body: { email: 'zz9999', pin: '0000' },               want: '', said: 'Sign in with the email on your account — or your handle, as it is on your card.',
      why: 'a handle nobody has is refused WITHOUT a grown-up\'s handle as the example — a child\'s is their initials and four digits' },
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
    else if (c.moved !== undefined && (!got || got.moved !== c.moved)) bad.push({ handle: 'verifyLogin ' + JSON.stringify(c.body),
      want: c.moved ? 'told ' + c.moved : 'told nothing moved', why: c.why, said: JSON.stringify(got) });
  });

  /* ---------- THE HEADING NAMES BOTH THINGS, because it checks both § */
  console.log('\nJUDGED WRONGLY  (' + bad.length + ')');
  if (!bad.length) console.log('  none');
  bad.forEach(b => console.log('  ' + JSON.stringify(b.handle) + '  wanted ' + b.want
    + ' — ' + b.why + '\n      server said: ' + b.said));

  /* EVERY NUMBER HERE IS READ OFF THE ARRAY IT COUNTS. § */
  console.log('\nhandles judged by the gate: ' + CASES.length
    + '  ·  templates made: ' + TPL.length + ', clashes: 3, moves: ' + mv.length
    + '  ·  handle_was histories: ' + WAS.length
    + '  ·  findPerson terms resolved: ' + FINDS.length
    + '  ·  sign-ins checked: ' + SIGNIN.length
    + '  ·  e-mail clashes checked: ' + MAILCASES.length
    + '  ·  pricing changes checked: ' + PRICES.length
    + ' over ' + box.fields.length + ' fields'
    + '  ·  seat-cut changes checked: ' + CUTS.length
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
    console.log('OK — every handle is the template (first initial and the year joined; '
              + 'no birthday: initials and two digits of the id), nothing random, one surname letter at most, a clash '
              + 'broken by first-name letters in id order; the move keeps each old handle as a sign-in and moves '
              + 'friends lists; nobody can be handed a name that answers, or once answered, to somebody '
              + 'else; an old handle signs in only its own person; and the pricing month holds.');
  }
}

run();
