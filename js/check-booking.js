#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-booking.js THE STATE MACHINE, RUN. § */
const fs = require('fs');
const path = require('path');

const dir = __dirname;

/* ---------- LIFTING THE REAL CODE § */
/* ---------- WHERE THE BACKEND ACTUALLY IS § */
const WHERE = [path.join(dir, '..', 'backend'), path.join(dir, 'backend'),
               path.join(dir, '..'), dir];

function backendFile(names) {
  for (const where of WHERE) {
    for (const n of names) {
      const p = path.join(where, n);
      if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    }
  }
  return null;
}
const booking = backendFile(['booking.gs', '30_booking.gs']);
const constants = backendFile(['constants.gs', '00_constants.gs']);
/* `sheetDate` LIVES IN core.gs, and `busyHours` reads a job's dates through it — lifted like the rest
   rather than stubbed, because a stub that parsed `05/10/26` differently would prove the wrong year. */
const core = backendFile(['core.gs', '10_core.gs']);
/* ---------- AND IF THEY ARE NOT THERE, THAT IS A FAILURE § */
if (!booking || !constants || !core) {
  console.log('');
  console.log('  FAIL — booking.gs, core.gs or constants.gs could not be found, so NOTHING was checked.');
  console.log('  Looked in: ' + WHERE.join(', '));
  console.log('  This reads the real backend rather than a copy, so it needs the files.');
  process.exit(1);
}

function fn(src, name) {
  const i = src.indexOf('function ' + name);
  if (i < 0) throw new Error('cannot find function ' + name + ' — has it been renamed?');
  let depth = 0, k = src.indexOf('{', i);
  do { if (src[k] === '{') depth++; else if (src[k] === '}') depth--; k++; } while (depth > 0);
  return src.slice(i, k);
}
function block(src, from, end) {
  const i = src.indexOf(from);
  if (i < 0) throw new Error('cannot find ' + from);
  return src.slice(i, src.indexOf(end, i) + end.length);
}

/* The handful of helpers the backend takes for granted, written the same way `10_core.gs` does. */
const PRELUDE = `
  const S = v => String(v == null ? '' : v).trim();
  const norm = v => S(v).toLowerCase();
  const key = v => norm(v).replace(/[^a-z0-9]/g, '');
  let EVENTS = [];
  function eventsForJob() { return EVENTS; }

  /* ---------- AND THE FEW THE TUTOR'S WEEK NEEDS -------------------------------------------------
     \`busyHours\` IS THE ONE FUNCTION HERE THAT TOUCHES A SHEET, and it is worth the four stubs:
     it decides which hours the booking grid greys out, so a job it cannot see is an hour sold
     twice. \`N\` is copied from \`constants.gs\` verbatim rather than approximated — a stub that
     rounds differently from the real one would prove the wrong thing. */
  let JOBS = [];
  let TUTOR_OF = {};
  const TAB = { jobs: 'jobs' };
  function read() { return { rows: JOBS }; }
  function confirmedTutorOf_(id) { return TUTOR_OF[id] || ''; }
  function fmtTime(v) { return S(v); }
  function config() { return { h: 2 }; }
  const N = v => { const x = parseFloat(String(v == null ? '' : v).replace(/[£$,\s]/g, '')); return isNaN(x) ? 0 : x; };
`;

let api;
try {
  const src = PRELUDE
    + block(constants, 'const BM = ', '};').replace(/\/\*[\s\S]*?\*\//g, '')
    + block(constants, 'const ACT = ', '};').replace(/\/\*[\s\S]*?\*\//g, '')
    + block(constants, 'const BM_EFFECT = ', '\n};')
    + fn(booking, 'participantsOf')
    + fn(booking, 'clientsIn')
    + fn(booking, 'tutorsIn')
    + fn(booking, 'jobStatusOf')
    + fn(booking, 'tutorStatusOf')
    + fn(booking, 'bmActionsFor')
    + fn(booking, 'bmApply')
    + fn(core, 'sheetDate')
    + fn(booking, 'sessionDatesOf')
    + block(booking, 'const DAY_CODE_ = ', '};')
    + fn(booking, 'slotCodes_')
    + fn(booking, 'jobCodes_')
    + fn(booking, 'busyHours')
    + `; module.exports = { BM, ACT, set: e => { EVENTS = e },
         setJobs: (j, t) => { JOBS = j; TUTOR_OF = t || {}; },
         participantsOf, clientsIn, jobStatusOf, tutorStatusOf, bmActionsFor, bmApply,
         busyHours };`;
  const m = { exports: {} };
  new Function('module', 'exports', src)(m, m.exports);
  api = m.exports;
} catch (e) {
  console.log('');
  console.log('  could not run the booking code: ' + e.message);
  process.exit(1);
}

/* AND THE TERM LIST, WHICH PUT A BOOKING IN TWO ACADEMIC YEARS AT ONCE. § */
const doget = backendFile(['doget.gs', '20_doget.gs']);
let termList;
try {
  if (!doget) throw new Error('doget.gs could not be found');
  /* THE ONE PLACE THE YEAR IS DECIDED, AND THE BLOCK THAT FILTERS IT, cut rather than copied: § */
  const src = [
    "const S = v => String(v == null ? '' : v).trim();",
    "const norm = v => S(v).toLowerCase();",
    "const DAY_MS = 864e5;",
    block(booking, 'const MON = ', ';'),
    fn(booking, 'easter'),
    block(booking, 'const add = ', ';'),
    fn(booking, 'nth'),
    fn(booking, 'schoolYear'),
    /* WHAT termsFor ANSWERS WITH NO SHEET OVERRIDE, which is the case that ships and the only one
       reachable from here — the real one reads the terms tab and falls back to exactly this. */
    'function termsFor(y) { return schoolYear(y); }',
    'module.exports = function (at) {',
    '  setNOW(at);',
    '  const yNow = (new Date()).getMonth() >= 7',
    '    ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1;',
    /* UP TO THE NEXT STATEMENT, not to a closing brace. § */
    block(doget, 'const nowMs = Date.now();', 'computed.forEach(')
      .replace(/computed\.forEach\($/, ''),
    "  return computed.filter(c => c.kind === 'term');",
    '};',
    /* EVERY INTERVAL OF THE TWO YEARS, holidays included, so a day can be asked which one it is in. */
    'module.exports.all = function (at) {',
    '  setNOW(at);',
    '  const yNow = (new Date()).getMonth() >= 7',
    '    ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1;',
    '  return termsFor(yNow).concat(termsFor(yNow + 1));',
    '};',
    /* AND WHICH OF THEM `doGet` OFFERS: the same list through the real `operatingWindow` (the forEach below the block). */
    fn(core, 'sheetDate'),
    fn(booking, 'operatingWindow'),
    'module.exports.offered = function (at) {',
    '  setNOW(at);',
    '  const yNow = (new Date()).getMonth() >= 7',
    '    ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1;',
    block(doget, 'const nowMs = Date.now();', 'computed.forEach(')
      .replace(/computed\.forEach\($/, ''),
    '  return computed.filter(c => operatingWindow(c.start, c.end)).map(c => c.name);',
    '};',
  ].join('\n');

  const m = { exports: {} };
  let NOW = Date.now();
  /* DATE SHADOWED AS A PARAMETER, so Date.now() and new Date() inside the real block both read the
     day being tested and not one character of the source is rewritten. */
  const Real = Date;
  class Fake extends Real {
    constructor(...a) { super(...(a.length ? a : [NOW])); }
    static now() { return NOW; }
  }
  new Function('module', 'exports', 'Date', 'setNOW', src)(m, m.exports, Fake, v => { NOW = v; });
  termList = m.exports;
} catch (err) {
  console.log('');
  console.log('  FAIL — the term list could not be run: ' + err.message);
  console.log('  A check that cannot reach its subject has not checked it.');
  process.exit(1);
}

const { BM, ACT } = api;
const e = (actor, role, action, target) => ({ actor, role, action, target });

/* ---------- WHAT SHOULD HAPPEN § */
const REQUEST = (n, r) => e(n, r || 'client', ACT.REQUEST);
const ACCEPT = (n, t, r) => e(n, r || 'client', ACT.ACCEPT, t);
const PAID = n => e(n, 'client', 'Confirm');
const LEAVE = (n, r) => e(n, r || 'client', ACT.WITHDRAW);
const EDIT = (n, r) => e(n, r || 'client', ACT.EDIT);

const PAID_BOOKING = [REQUEST('Pat'), REQUEST('George', 'tutor'),
                      ACCEPT('Pat', 'George'), PAID('Pat')];

const SEQUENCES = [
  { what: 'a request nobody has answered',
    evs: [REQUEST('Pat'), REQUEST('George', 'tutor')],
    who: ['Pat=Waiting', 'George=Waiting'], job: 'unconfirmed' },

  { what: 'the client accepts the tutor',
    evs: [REQUEST('Pat'), REQUEST('George', 'tutor'), ACCEPT('Pat', 'George')],
    who: ['Pat=Agreed', 'George=Agreed'], job: 'unconfirmed' },

  { what: 'a paid booking',
    evs: PAID_BOOKING,
    who: ['Pat=Booked', 'George=Agreed'], job: 'active' },

  /* ---------- THE THREE THAT COST MONEY ---------------------------------------------------- */

  { what: 'a PAID client edits the terms — their payment must survive',
    evs: PAID_BOOKING.concat([EDIT('Pat')]),
    who: ['Pat=Booked', 'George=Waiting'], job: 'active' },

  { what: 'somebody ELSE edits after a client has paid',
    evs: PAID_BOOKING.concat([EDIT('George', 'tutor')]),
    who: ['Pat=Booked', 'George=Waiting'], job: 'active' },

  { what: 'a PAID client withdraws — they must not vanish',
    evs: PAID_BOOKING.concat([LEAVE('Pat')]),
    who: ['Pat=Withdrawn', 'George=Agreed'], job: 'cancelled', refund: ['Pat'] },

  { what: 'an edit after a paid withdrawal must not disturb them',
    evs: PAID_BOOKING.concat([LEAVE('Pat'), EDIT('George', 'tutor')]),
    who: ['Pat=Withdrawn', 'George=Waiting'], job: 'cancelled', refund: ['Pat'] },

  { what: 'they rejoin — the refund is still owed',
    evs: PAID_BOOKING.concat([LEAVE('Pat'), REQUEST('Pat')]),
    who: ['Pat=Waiting', 'George=Agreed'], job: 'unconfirmed', refund: ['Pat'] },

  { what: 'they rejoin and pay again — still owed the first one',
    evs: PAID_BOOKING.concat([LEAVE('Pat'), REQUEST('Pat'),
                              ACCEPT('Pat', 'George'), PAID('Pat')]),
    who: ['Pat=Booked', 'George=Agreed'], job: 'active', refund: ['Pat'] },

  /* ---------- LEAVING, WHERE NO MONEY IS INVOLVED ------------------------------------------- */

  { what: 'an unpaid client withdraws — they are simply gone',
    evs: [REQUEST('Pat'), REQUEST('George', 'tutor'), LEAVE('Pat')],
    who: ['George=Waiting'], job: 'cancelled', refund: [] },

  { what: 'one of two clients withdraws',
    evs: [REQUEST('Pat'), REQUEST('Dee'), REQUEST('George', 'tutor'), LEAVE('Pat')],
    who: ['Dee=Waiting', 'George=Waiting'], job: 'unconfirmed' },

  { what: 'a tutor declines the client',
    evs: [REQUEST('Pat'), REQUEST('George', 'tutor'),
          e('George', 'tutor', ACT.DECLINE, 'Pat')],
    who: ['George=Waiting'], job: 'cancelled' },

  { what: 'an unpaid edit resets everybody',
    evs: [REQUEST('Pat'), REQUEST('George', 'tutor'), ACCEPT('Pat', 'George'), EDIT('Pat')],
    who: ['Pat=Waiting', 'George=Waiting'], job: 'unconfirmed' },

  { what: 'withdrawing and coming back, never having paid',
    evs: [REQUEST('Pat'), LEAVE('Pat'), REQUEST('Pat')],
    who: ['Pat=Waiting'], job: 'unconfirmed', refund: [] },
];

/* ---------- AND THE LOBBY ITSELF § */
const RULES = [
  { what: 'no day of the year offers one term name twice',
    check: () => {
      const bad = [];
      /* EVERY DAY OF A YEAR FROM TODAY. The fault is a range — it appears in September and clears in
         November — so a single date would have proved whichever answer that date happens to give. */
      for (let i = 0; i < 365; i++) {
        const at = Date.UTC(2026, 8, 25) + i * 864e5;
        let terms;
        try { terms = termList(at); } catch (err) { bad.push('threw: ' + err.message); break; }
        const seen = {};
        terms.forEach(t => { (seen[String(t.name)] = seen[String(t.name)] || []).push(t); });
        Object.keys(seen).forEach(n => {
          if (seen[n].length < 2) return;
          bad.push(new Date(at).toISOString().slice(0, 10) + ' offers ' + JSON.stringify(n)
            + ' ' + seen[n].length + ' times: '
            + seen[n].map(t => t.start.toISOString().slice(0, 10)).join(' and '));
        });
      }
      /* AND IT MUST OFFER SOMETHING, or a list that is always empty passes this for ever. */
      const now = termList(Date.UTC(2026, 8, 25));
      if (!now.length) bad.push('no terms at all are offered — the list cannot be checked');
      return bad;
    } },

  /* THE INTERVAL WE ARE IN IS OFFERED (owner, 29 Oct: "I should be able to select the current academic interval too, which is October half term"): § */
  { what: 'the interval we are in is always offered, a holiday week included, from its first day to its last',
    check: () => {
      const bad = [];
      for (let i = 0; i < 365; i++) {
        const at = Date.UTC(2026, 8, 1, 12) + i * 864e5;
        const day = new Date(at); day.setHours(0, 0, 0, 0);
        let all, offered;
        try { all = termList.all(at); offered = termList.offered(at); } catch (err) { bad.push('threw: ' + err.message); break; }
        const now = all.find(t => t.start <= day && t.end >= day);
        if (!now) continue;
        if (offered.indexOf(now.name) === -1) bad.push(new Date(at).toISOString().slice(0, 10) + ' is in ' + now.name + ', which is not offered');
      }
      const oct = termList.offered(Date.UTC(2026, 9, 29, 12));
      if (oct.indexOf('October Half Term') === -1) bad.push('29 Oct 2026 does not offer October Half Term: ' + oct.join(', '));
      return bad;
    } },

  { what: 'only a client can pay, and only when both sides have agreed',
    check: () => {
      const bad = [];
      [['client', 'tutor']].forEach(() => {});
      ['client', 'tutor'].forEach(role => {
        [BM.NONE, BM.WAITING, BM.AGREED, BM.PAYING, BM.BOOKED].forEach(mine => {
          [BM.NONE, BM.WAITING, BM.AGREED, BM.PAYING, BM.BOOKED].forEach(theirs => {
            const can = api.bmActionsFor(role, mine, theirs).indexOf(ACT.PAY) !== -1;
            const should = role === 'client' && mine === BM.AGREED && theirs === BM.AGREED;
            if (can !== should) {
              bad.push(role + ' ' + (mine || '—') + '/' + (theirs || '—')
                + (can ? ' CAN pay and should not' : ' cannot pay and should'));
            }
          });
        });
      });
      return bad;
    } },

  { what: 'nobody is ever stuck with no move at all',
    check: () => {
      const bad = [];
      ['client', 'tutor'].forEach(role => {
        [BM.NONE, BM.WAITING, BM.AGREED, BM.PAYING, BM.BOOKED].forEach(mine => {
          [BM.NONE, BM.WAITING, BM.AGREED, BM.PAYING, BM.BOOKED].forEach(theirs => {
            if (!api.bmActionsFor(role, mine, theirs).length) {
              bad.push(role + ' at ' + (mine || '—') + ' facing ' + (theirs || '—'));
            }
          });
        });
      });
      return bad;
    } },

  { what: 'leaving is always possible, whatever state anybody is in',
    check: () => {
      const bad = [];
      ['client', 'tutor'].forEach(role => {
        [BM.WAITING, BM.AGREED, BM.PAYING, BM.BOOKED].forEach(mine => {
          if (api.bmActionsFor(role, mine, BM.AGREED).indexOf(ACT.WITHDRAW) === -1) {
            bad.push(role + ' at ' + mine + ' cannot leave');
          }
        });
      });
      return bad;
    } },
];

/* ---------- AND THE HOURS A TUTOR IS ALREADY TEACHING § */
RULES.push({
  what: 'a tutor teaching on two days is busy on both',
  check: () => {
    const bad = [];
    const job = (id, weekday) => ({ job_id: id, weekday: weekday, start_time: '10:00',
                                    hours_per_session: 2, subject: 'Maths' });
    /* A LIVE ROSTER, because `busyHours` skips a job `jobStatusOf` reads as cancelled — and with no events at all there are no clients, which IS cancelled. § */
    const LIVE = [REQUEST('Pat'), REQUEST('George', 'tutor')];
    const busy = (weekday, tutor) => {
      api.set(LIVE);
      api.setJobs([job('J', weekday)], { J: tutor || 'George' });
      return Object.keys(api.busyHours('George')).sort();
    };
    const want = (weekday, keys) => {
      const got = busy(weekday);
      if (got.join(' ') !== keys.join(' ')) {
        bad.push('"' + weekday + '" marks [' + (got.join(' ') || 'nothing')
          + '], expected [' + keys.join(' ') + ']');
      }
    };
    want('Monday', ['m10', 'm11']);
    want('Monday, Friday', ['f10', 'f11', 'm10', 'm11']);
    want('Monday, Wednesday, Friday', ['f10', 'f11', 'm10', 'm11', 'w10', 'w11']);
    /* A CELL THAT NAMES NO DAY MARKS NOTHING, which is the case the old guard was written for and
       is still right: an empty `weekday` is a booking with no day yet, not every day. */
    want('', []);
    want('whenever', []);
    /* AND ONLY THE TUTOR ACTUALLY TEACHING IT. Somebody who applied and was not chosen is free. */
    api.set(LIVE);
    api.setJobs([job('J', 'Monday, Friday')], { J: 'Someone Else' });
    if (Object.keys(api.busyHours('George')).length) {
      bad.push('a job another tutor teaches made George busy');
    }
    /* AND A CANCELLED SESSION RELEASES ITS HOURS, which is what `jobStatusOf` is consulted for — asserted here because the case above leans on it, and a guard § */
    api.set([REQUEST('Pat'), REQUEST('George', 'tutor'), e('Pat', 'client', ACT.WITHDRAW)]);
    api.setJobs([job('J', 'Monday, Friday')], { J: 'George' });
    if (Object.keys(api.busyHours('George')).length) {
      bad.push('a cancelled session still held its hours');
    }
    return bad;
  },
});

/* ---------- EVERY BOOKED HOUR, NOT THE FIRST RUN'S (434) ---------- */
RULES.push({
  what: 'a booking of Mon 10–12 and Fri 16–18 is busy exactly there, off slot_codes',
  check: () => {
    const bad = [];
    api.set([REQUEST('Pat'), REQUEST('George', 'tutor')]);
    /* THE ROW createJob WRITES: weekday + start + length say the first run only; slot_codes says both. */
    api.setJobs([{ job_id: 'J', weekday: 'Monday, Friday', start_time: '10:00', hours_per_session: 2,
                   subject: 'Maths', slot_codes: 'm10,m11,f16,f17' }], { J: 'George' });
    const got = Object.keys(api.busyHours('George')).sort().join(' ');
    if (got !== 'f16 f17 m10 m11') bad.push('busy [' + got + '], wanted [f16 f17 m10 m11] — Friday 10–12 was never booked and 16–18 was');
    /* AN OLD ROW WITH NO slot_codes still reads as it always did, until the backfill fills it. */
    api.setJobs([{ job_id: 'J', weekday: 'Monday', start_time: '16:00', hours_per_session: 2, subject: 'Maths' }], { J: 'George' });
    const old = Object.keys(api.busyHours('George')).sort().join(' ');
    if (old !== 'm16 m17') bad.push('an old row (no slot_codes) is busy [' + old + '], wanted [m16 m17]');
    return bad;
  },
});

/* ---------- THE BANK HOLIDAYS, WORKED OUT, AGAINST THE ONES gov.uk PUBLISHED § */
RULES.push({
  what: 'the bank holidays are the ones gov.uk publishes, substitutes and all',
  check: () => {
    let bh;
    try {
      bh = new Function([
        block(booking, 'const DAY_MS = ', ';'), block(booking, 'const add = ', ';'),
        fn(booking, 'easter'), fn(booking, 'bankHolidays'), 'return bankHolidays;'].join('\n'))();
    } catch (err) { return ['bankHolidays could not be run: ' + err.message]; }
    const WANT = {
      2026: '01/01 03/04 06/04 04/05 25/05 31/08 25/12 28/12',
      2027: '01/01 26/03 29/03 03/05 31/05 30/08 27/12 28/12',
      2028: '03/01 14/04 17/04 01/05 29/05 28/08 25/12 26/12',
    };
    const bad = [];
    Object.keys(WANT).forEach(y => {
      const got = bh(Number(y)).map(h => h.date).sort((a, b) => a - b)
        .map(d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0')).join(' ');
      if (got !== WANT[y]) bad.push(y + ' came out [' + got + '], gov.uk says [' + WANT[y] + ']');
    });
    return bad;
  },
});

/* ---------- ONE SPAN OF HOURS, IN BOTH LANGUAGES § */
RULES.push({
  what: 'the hours a tutor can tick are the hours a family can book',
  check: () => {
    const bookJs = fs.readFileSync(path.join(dir, 'book.js'), 'utf8');
    const m = /const SLOT_HOURS = \[\];\s*\n\s*for \(([^)]*)\) SLOT_HOURS\.push\(h\);/.exec(bookJs);
    if (!m) return ['cannot find SLOT_HOURS in js/book.js, so the two spans were NOT compared'];
    const slot = new Function('const SLOT_HOURS = []; for (' + m[1] + ') SLOT_HOURS.push(h); return SLOT_HOURS;')();
    const avail = new Function(block(constants, 'const AVAIL_HOURS = ', ';') + ' return AVAIL_HOURS;')();
    return slot.join(',') === avail.join(',') ? []
      : ['AVAIL_HOURS is [' + avail.join(',') + '] and SLOT_HOURS is [' + slot.join(',') + ']'];
  },
});

/* ---------- AND ONLY WHILE ITS DATES ARE LIVE § */
RULES.push({
  what: 'a tutor is busy only while a session is running, or across the window asked about',
  check: () => {
    const bad = [];
    const LIVE = [REQUEST('Pat'), REQUEST('George', 'tutor')];
    const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
    const dmy = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0')
      + '/' + String(d.getFullYear()).slice(-2);
    const busy = (dates, from, to) => {
      api.set(LIVE);
      api.setJobs([{ job_id: 'J', weekday: 'Monday', start_time: '10:00', hours_per_session: 2,
                     subject: 'Maths', session_dates: dates.map(dmy).join(', ') }], { J: 'George' });
      return Object.keys(api.busyHours('George', from, to)).length > 0;
    };
    if (!busy([day(-14), day(-7), day(7), day(14)])) bad.push('a session running now (dates either side of today) is not busy');
    if (busy([day(-70), day(-63), day(-56)])) bad.push('a session that ENDED eight weeks ago is still busy today');
    if (busy([day(21), day(28), day(35)])) bad.push('a session that STARTS in three weeks is already busy today');
    if (!busy([day(21), day(28), day(35)], day(14), day(42))) bad.push('asked about next term, a session booked for next term is not busy');
    if (busy([day(-70), day(-63)], day(14), day(42))) bad.push('asked about next term, a session that ended last term is busy');
    if (!busy([])) bad.push('a session with no dates yet is not busy — it must hold its hours until it has some');
    return bad;
  },
});

/* WHAT A BOOKING EARNS, RUN WITH THE OWNER'S OWN NUMBERS (docs/history/353) § */
const coreJs = (() => { try { return fs.readFileSync(path.join(dir, 'core.js'), 'utf8'); } catch (e) { return null; } })();
let money_ = null;
try {
  if (!coreJs) throw new Error('js/core.js could not be read');
  const m = {};
  new Function('module', 'let DATA = {}; let USER = null; const $ = () => null;' + coreJs
    + ';module.priceFrom = priceFrom; module.setData = d => { DATA = d; };')(m);
  const b = { exports: {} };
  new Function('module', PRELUDE
    + 'const TRUE_ = v => /^(true|yes|1|✓)$/i.test(S(v)); const ON_ = v => S(v) === \'\' || TRUE_(v);'
    + block(constants, 'const BM = ', '};').replace(/\/\*[\s\S]*?\*\//g, '')
    + fn(core, 'sheetDate') + fn(booking, 'jobMoneyFreeze_') + fn(booking, 'discountRefusal_')
    + ';module.exports = { jobMoneyFreeze_, discountRefusal_ };')(b);
  money_ = Object.assign(m, b.exports);
} catch (err) {
  RULES.push({ what: 'the money code loads', check: () => ['could not load it: ' + err.message] });
}
const r2 = x => Math.round(x * 100) / 100;
const MONEY_DATA = (vars) => ({
  constants: { vars: Object.assign({ c: 0.5, B: 0.2 }, vars || {}) },
  tutors: [{ title: 'Tutor', rate: 30 }], multipliers: {},
  venues: [{ title: 'Somewhere', bestRate: 15 }],
});
const quote = (spec, vars) => {
  money_.setData(MONEY_DATA(vars));
  return money_.priceFrom(Object.assign({ subjects: [], tutor: 'Tutor', slots: 1, day: 'Monday' }, spec));
};
if (money_) {
  RULES.push({
    what: 'the owner\'s examples price to the penny: tutoring, two discounts, card fees, and a format sent by an old phone priced as tutoring (463)',
    check: () => {
      const bad = [];
      const want = (what, L, charged, tutor, net) => {
        const got = [r2(L.earn.charged), r2(L.earn.tutorPayout), r2(L.earn.net)];
        if (got.join() !== [charged, tutor, net].join()) {
          bad.push(what + ': charged/tutor/net ' + got.join(' / ') + ', wanted ' + [charged, tutor, net].join(' / '));
        }
        if (r2(L.total) !== charged) bad.push(what + ': COST reads ' + r2(L.total) + ', wanted ' + charged);
      };
      want('tutoring, 1 child, 2h', quote({ n: 1, hours: 2, hoursPerWeek: 2 }), 60, 60, 0);
      want('tutoring, 2 children, 2h', quote({ n: 2, hours: 2, hoursPerWeek: 2 }), 102, 90, 12);
      /* AN OLD DRAFT'S `format: 'Trip'` IS IGNORED (463): it prices as the tutoring it is. */
      want('an old draft saying Trip', quote({ n: 2, hours: 2, hoursPerWeek: 2, format: 'Trip', trip: 'x' }), 102, 90, 12);
      want('£10 off, business absorbs', quote({ n: 2, hours: 2, hoursPerWeek: 2, discount: { type: '£', value: 10 } }), 92, 90, 2);
      want('10% off, shared with tutor', quote({ n: 2, hours: 2, hoursPerWeek: 2,
        discount: { type: '%', value: 10, by: 'Shared with tutor' } }), 91.8, 81, 10.8);
      want('£20 off one child, business absorbs: a loss', quote({ n: 1, hours: 2, hoursPerWeek: 2, discount: { type: '£', value: 20 } }), 40, 60, -20);
      /* "IF I PUT 30 IN THAT FIELD THEN IT'S JUST 30 PERCENT OFF" (owner, 29 Oct): off what the client pays, the room included. */
      const full = quote({ n: 2, hours: 2, hoursPerWeek: 2, loc: 'Somewhere' });
      const off30 = quote({ n: 2, hours: 2, hoursPerWeek: 2, loc: 'Somewhere', discount: { type: '%', value: 30 } });
      if (!(full.earn.venue > 0)) bad.push('the 30% example has no room in it, so it proves nothing about the room: ' + JSON.stringify(full.earn));
      if (r2(off30.total) !== r2(full.total * 0.7)) bad.push('30% off ' + r2(full.total) + ' came to ' + r2(off30.total) + ', wanted ' + r2(full.total * 0.7));
      const fees = quote({ n: 2, hours: 2, hoursPerWeek: 2 }, { card_fee_pct: 1.5, card_fee_fixed: 0.2 });
      if (r2(fees.earn.cardFees) !== 1.73 || r2(fees.earn.net) !== 10.27) {
        bad.push('card fees 1.5% + 20p on £102 came to ' + r2(fees.earn.cardFees) + ', net ' + r2(fees.earn.net) + ', wanted 1.73 and 10.27');
      }
      return bad;
    },
  });
  RULES.push({
    what: 'what a booking earns is frozen when it is agreed, and a config change afterwards rewrites nothing',
    check: () => {
      const bad = [];
      const row = { gross: 102, tutor_payout: 90, venue_cost: 0, materials_cost: 0, tickets_cost: 0, card_fees: 0, priced_at: '' };
      const first = money_.jobMoneyFreeze_(row, { card_fee_pct: 1.5, card_fee_fixed: '' }, new Date(2026, 9, 18));
      if (!first || first.card_fees !== 1.53 || first.net_profit !== 10.47 || !first.priced_at) {
        return ['freezing £102 at 1.5% gave ' + JSON.stringify(first) + ', wanted card_fees 1.53, net_profit 10.47 and a priced_at'];
      }
      Object.assign(row, first);
      const again = money_.jobMoneyFreeze_(row, { card_fee_pct: 3, card_fee_fixed: 1 }, new Date(2026, 10, 1));
      if (again !== null) bad.push('a frozen row was priced again after the config changed: ' + JSON.stringify(again));
      if (row.card_fees !== 1.53 || row.net_profit !== 10.47) bad.push('the frozen figures moved: ' + JSON.stringify(row));
      if (money_.jobMoneyFreeze_({ gross: '', priced_at: '' }, {}, new Date()) !== null) {
        bad.push('a job from before the money columns was frozen at nothing');
      }
      return bad;
    },
  });
  RULES.push({
    what: 'a discount is refused from anybody but an admin, and a code is held to its row',
    check: () => {
      const bad = [];
      const today = new Date(2026, 9, 18);
      const ask = { discountType: '£', discountValue: '10', discountAbsorbedBy: 'Business' };
      if (!/Only @family\. gives a discount/.test(money_.discountRefusal_(ask, false, null, today))) bad.push('a parent\'s discount was not refused');
      if (money_.discountRefusal_(ask, true, null, today)) bad.push('an admin\'s £10 was refused: ' + money_.discountRefusal_(ask, true, null, today));
      if (money_.discountRefusal_({ name: 'Pat' }, false, null, today)) bad.push('a booking with no discount was refused');
      const code = { code: 'SPRING10', type: '%', value: 10, max_uses: 2, used: 0, expires: '', active: '' };
      const withCode = { discountType: '%', discountValue: '10', discountCode: 'SPRING10' };
      if (money_.discountRefusal_(withCode, true, code, today)) bad.push('a good code was refused');
      if (!/used all 2/.test(money_.discountRefusal_(withCode, true, Object.assign({}, code, { used: 2 }), today))) bad.push('a used-up code was let through');
      if (!/expired/.test(money_.discountRefusal_(withCode, true, Object.assign({}, code, { expires: '17/10/2026' }), today))) bad.push('an expired code was let through');
      if (!/switched off/.test(money_.discountRefusal_(withCode, true, Object.assign({}, code, { active: 'FALSE' }), today))) bad.push('a switched-off code was let through');
      if (!/not what was sent/.test(money_.discountRefusal_(Object.assign({}, withCode, { discountValue: '50' }), true, code, today))) bad.push('a code sent with a bigger value was honoured');
      return bad;
    },
  });
}

/* ---------- RUN ---------------------------------------------------------------------------------- */
let failed = 0;
console.log('');

SEQUENCES.forEach(c => {
  api.set(c.evs);
  const people = api.participantsOf('J');
  const got = people.map(p => p.name + '=' + (p.status || '—')).sort();
  const want = c.who.slice().sort();
  const bad = [];

  if (got.join(', ') !== want.join(', ')) {
    bad.push('roster is [' + got.join(', ') + '], expected [' + want.join(', ') + ']');
  }
  if (c.job !== undefined) {
    const job = api.jobStatusOf('J');
    if (job !== c.job) bad.push('job reads ' + job + ', expected ' + c.job);
  }
  if (c.refund !== undefined) {
    const owed = people.filter(p => p.refundDue).map(p => p.name).sort();
    if (owed.join(', ') !== c.refund.slice().sort().join(', ')) {
      bad.push('refund owed to [' + (owed.join(', ') || 'nobody')
        + '], expected [' + (c.refund.join(', ') || 'nobody') + ']');
    }
  }

  if (bad.length) {
    failed++;
    console.log('  FAIL  ' + c.what);
    bad.forEach(b => console.log('          ' + b));
  } else {
    console.log('  ok    ' + c.what);
  }
});

RULES.forEach(r => {
  let bad;
  try { bad = r.check(); } catch (err) { bad = ['the check threw: ' + err.message]; }
  if (bad.length) {
    failed++;
    console.log('  FAIL  ' + r.what);
    bad.slice(0, 8).forEach(b => console.log('          ' + b));
    if (bad.length > 8) console.log('          … and ' + (bad.length - 8) + ' more');
  } else {
    console.log('  ok    ' + r.what);
  }
});

console.log('');
const total = SEQUENCES.length + RULES.length;
console.log(failed ? 'FAILED — ' + failed + ' of ' + total + ' behaviours are wrong'
                   : 'OK — all ' + total + ' booking behaviours are right.');
process.exit(failed ? 1 : 0);
