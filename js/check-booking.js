#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-booking.js

   THE STATE MACHINE, RUN. Not read.

   WHY THIS FILE EXISTS. Every fault that has cost real money in this project has been in the same
   fifty lines: `participantsOf`, folding an append-only event log into who is in a session and what
   state they are in. Three found in one afternoon, and all three were invisible to every other
   checker because they are not missing names, dead rules or absent columns — they are a correct
   program computing the wrong answer.

     · a paid client who EDITED anything wiped their own payment. Booked became Waiting, the job
       went back to unconfirmed, and Stripe would sell them the same session again.
     · a paid client who WITHDREW vanished from the roster entirely. Job read cancelled, nothing
       anywhere said a refund was owed, and the only trace was a Confirm nothing reads.
     · the fix for the second had a hole the same shape: the mark was erased by the next event to
       arrive, including an edit by somebody else.

   THE THIRD IS THE POINT OF THIS FILE. Two of those were old bugs; one was mine, introduced while
   fixing another, and found only because I happened to test the fix rather than trust it. A
   throwaway script found each of them and was thrown away each time — so the next change gets no
   help from any of it. This is that script, kept.

   HOW IT WORKS. The fold and the lobby are lifted straight out of `booking.gs` and `constants.gs`
   and run in Node. No Google, no sheet, no network — the functions are pure, which is the property
   that makes this possible and is worth protecting.

     node check-booking.js

   ADDING A CASE IS ONE LINE in `SEQUENCES`. Every sequence somebody can actually perform is worth
   one, and the ones involving money are worth two.
================================================================================================== */
const fs = require('fs');
const path = require('path');

const dir = __dirname;

/* ---------- LIFTING THE REAL CODE ----------------------------------------------------------------
   The point is to test what actually runs, so nothing here is a copy. `booking.gs` is read from
   disk and the functions are cut out by brace-matching — if somebody renames one, this fails loudly
   rather than testing a stale duplicate. */
/* ---------- WHERE THE BACKEND ACTUALLY IS --------------------------------------------------------
   THIS LOOKED IN ONE PLACE AND THE FILES ARE IN ANOTHER, and the cost of that was the whole file.

   It read `../booking.gs`. The .gs files were moved into `backend/` — a good move, and nothing told
   this — so `backendFile` returned null, the guard below printed "nothing to check", and the
   process exited ZERO. Every run since has been a pass. `check-all.js` counted it as a pass. The
   one checker standing between this project and the three money bugs described at the top of this
   file has been switched off for as long as `backend/` has existed, and it reported success the
   entire time.

   SO IT SEARCHES, and the list is ordered by what is true today first. */
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
/* ---------- AND IF THEY ARE NOT THERE, THAT IS A FAILURE --------------------------------------
   IT USED TO EXIT 0 HERE, which is the actual reason the broken path went unnoticed for months. A
   checker that cannot find the thing it checks has not checked it, and "I did not check" is not the
   same answer as "I checked and it was fine" — but exit 0 says the second one to every caller.

   Anything automated reads the exit code and nothing reads the prose. `check-all.js` printed a tick
   beside this file. `sync.js` pushed. The one signal that would have said otherwise was being
   deliberately suppressed by the file that had the most to lose from it. */
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

/* ==================================================================================================
   AND THE TERM LIST, WHICH PUT A BOOKING IN TWO ACADEMIC YEARS AT ONCE.

   REPORTED AS *"why is it coming out to so much?"* over a card totalling £1024.59 whose Dates row
   listed eighteen sessions across September 2026 AND September 2027 for one ticked term. `doget.gs`
   sends the term list and `bookSpec` FILTERS it by name, so a name sent twice gave one ticked button
   two windows a year apart: three sessions became ten and £60 became £200.

   THE FILTER'S OWN COMMENT CLAIMED OTHERWISE — that once terms which have ENDED are dropped *"each
   name appears once inside the next twelve months"*. It holds for most of the year and fails every
   autumn: on 25/09/2026 the current `Autumn 1` has not ended and the next one starts four days inside
   the 370-day cut-off, so both are sent. A sentence that is true in March and false in September is
   exactly the kind of claim a check is for.

   IT RUNS THE REAL BLOCK, cut out of `doget.gs`, over a whole year of "todays" — because one date
   proves one date, and the fault is a date range. `Date` is shadowed in the sandbox rather than the
   source being edited, so what is measured is the code that ships.

   `termsFor` IS THE COMPUTED SCHOOL YEAR, which is what it returns when nobody has typed the dates
   into the sheet — the case that ships, and the only one reachable from here.
================================================================================================== */
const doget = backendFile(['doget.gs', '20_doget.gs']);
let termList;
try {
  if (!doget) throw new Error('doget.gs could not be found');
  /* THE ONE PLACE THE YEAR IS DECIDED, AND THE BLOCK THAT FILTERS IT, cut rather than copied: a copy
     would agree with itself and with nothing else.

     NOTE FOR THE NEXT READER — NO BACKTICKS IN THIS TEMPLATE. The house style writes a name in
     backticks and this is a template literal, so one here ends the string and the syntax error lands
     four hundred lines away from the comment. The same trap `js/map.js` records for widget markup. */
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
    /* UP TO THE NEXT STATEMENT, not to a closing brace. The first version ended the cut at the
       dedupe filter's own '});' — so removing that filter, which is the one mutation worth making
       here, took the cut to some unrelated brace and the check failed with 'missing ) after argument
       list'. A guard firing for a fault in its own cutter teaches nothing. */
    block(doget, 'const nowMs = Date.now();', 'computed.forEach(')
      .replace(/computed\.forEach\($/, ''),
    "  return computed.filter(c => c.kind === 'term');",
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

/* ---------- WHAT SHOULD HAPPEN -------------------------------------------------------------------
   Each case is a list of events and what the roster and the job should read afterwards. Written as
   the sentence somebody would say about it, so a failure names a situation rather than a variable.

   `who` is checked as a set of `name=status`; `job` is the folded job status; `refund` is who is
   owed money back. Anything not stated is not checked, so a case stays readable. */
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

/* ---------- AND THE LOBBY ITSELF -----------------------------------------------------------------
   Separate from the fold: these are about what somebody is ALLOWED to do, which is the other half of
   the machine and the half that decides whether money can move. */
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

/* ---------- AND THE HOURS A TUTOR IS ALREADY TEACHING ------------------------------------------
   `busyHours` IS WHAT GREYS AN HOUR ON THE BOOKING GRID, so a job it cannot see is an hour offered
   to a second family while the first already has it. That is the one fault in this file's subject
   area that takes money from two people for one session.

   IT READ THE WHOLE `weekday` CELL AS ONE DAY NAME. The form has let somebody tick hours across
   several days for a long time and `bookSpec` joins them, so a real cell reads `Monday, Friday` —
   `DAY['monday, friday']` is undefined, the `if (!d) return` dropped the job, and BOTH of its days
   stayed open. Silently, and only on multi-day bookings.

   ONE SPAN ON EACH NAMED DAY, because the job row holds one `start_time` and one
   `hours_per_session`. Of the two ways to be wrong, one offers an hour that is taken and the other
   holds an hour that is free; only the first sells the same hour twice. */
RULES.push({
  what: 'a tutor teaching on two days is busy on both',
  check: () => {
    const bad = [];
    const job = (id, weekday) => ({ job_id: id, weekday: weekday, start_time: '10:00',
                                    hours_per_session: 2, subject: 'Maths' });
    /* A LIVE ROSTER, because `busyHours` skips a job `jobStatusOf` reads as cancelled — and with no
       events at all there are no clients, which IS cancelled. Seeding nothing measured the skip
       rather than the day mapping, and reported "nothing" for every case including the one-day one
       that has always worked. */
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
    /* AND A CANCELLED SESSION RELEASES ITS HOURS, which is what `jobStatusOf` is consulted for —
       asserted here because the case above leans on it, and a guard nothing measures is a guard
       that can quietly become the reason a rule passes. */
    api.set([REQUEST('Pat'), REQUEST('George', 'tutor'), e('Pat', 'client', ACT.WITHDRAW)]);
    api.setJobs([job('J', 'Monday, Friday')], { J: 'George' });
    if (Object.keys(api.busyHours('George')).length) {
      bad.push('a cancelled session still held its hours');
    }
    return bad;
  },
});

/* ---------- THE BANK HOLIDAYS, WORKED OUT, AGAINST THE ONES gov.uk PUBLISHED ------------------------
   `bankHolidays` IS WHAT `computeSessionDates` STEPS OVER, so a wrong date here is a session charged
   on a day nobody is taught, or one skipped that should run. Checked against England and Wales as
   gov.uk lists them — three years with every substitute shape in them: 2026 (Boxing Day on a
   Saturday), 2027 (both on the weekend) and 2028 (New Year's Day on a Saturday). A one-off like a
   jubilee is the holidays tab's job, not the formula's, and is not asked here. */
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

/* ---------- ONE SPAN OF HOURS, IN BOTH LANGUAGES ---------------------------------------------------
   `AVAIL_HOURS` (constants.gs) IS WHAT A TUTOR CAN TICK and `SLOT_HOURS` (js/book.js) IS WHAT A FAMILY
   CAN BOOK, and they disagreed: nine to seven against nine to six, so a seven o'clock tick was drawn
   lit on the tutor's card and could never be booked. Two files in two languages cannot share a
   constant, so the next best thing is this: both are read off the real source and must be the same
   list. Widen both or neither. */
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

/* ---------- AND ONLY WHILE ITS DATES ARE LIVE ----------------------------------------------------
   `busyHours` HAD NO DATES, so a session that ended in July greyed its hours on every booking grid for
   ever, and one booked for next term was busy today. A job counts from its first session date to its
   last; `from`/`to` asks about a window instead of today, which is what `createJob` does with the
   booking's own dates. A job with no dates counts whatever the window — see the note on the function. */
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
