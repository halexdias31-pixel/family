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
/* ---------- AND IF THEY ARE NOT THERE, THAT IS A FAILURE --------------------------------------
   IT USED TO EXIT 0 HERE, which is the actual reason the broken path went unnoticed for months. A
   checker that cannot find the thing it checks has not checked it, and "I did not check" is not the
   same answer as "I checked and it was fine" — but exit 0 says the second one to every caller.

   Anything automated reads the exit code and nothing reads the prose. `check-all.js` printed a tick
   beside this file. `sync.js` pushed. The one signal that would have said otherwise was being
   deliberately suppressed by the file that had the most to lose from it. */
if (!booking || !constants) {
  console.log('');
  console.log('  FAIL — booking.gs or constants.gs could not be found, so NOTHING was checked.');
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

const PAID_BOOKING = [REQUEST('Rasa'), REQUEST('George', 'tutor'),
                      ACCEPT('Rasa', 'George'), PAID('Rasa')];

const SEQUENCES = [
  { what: 'a request nobody has answered',
    evs: [REQUEST('Rasa'), REQUEST('George', 'tutor')],
    who: ['Rasa=Waiting', 'George=Waiting'], job: 'unconfirmed' },

  { what: 'the client accepts the tutor',
    evs: [REQUEST('Rasa'), REQUEST('George', 'tutor'), ACCEPT('Rasa', 'George')],
    who: ['Rasa=Agreed', 'George=Agreed'], job: 'unconfirmed' },

  { what: 'a paid booking',
    evs: PAID_BOOKING,
    who: ['Rasa=Booked', 'George=Agreed'], job: 'active' },

  /* ---------- THE THREE THAT COST MONEY ---------------------------------------------------- */

  { what: 'a PAID client edits the terms — their payment must survive',
    evs: PAID_BOOKING.concat([EDIT('Rasa')]),
    who: ['Rasa=Booked', 'George=Waiting'], job: 'active' },

  { what: 'somebody ELSE edits after a client has paid',
    evs: PAID_BOOKING.concat([EDIT('George', 'tutor')]),
    who: ['Rasa=Booked', 'George=Waiting'], job: 'active' },

  { what: 'a PAID client withdraws — they must not vanish',
    evs: PAID_BOOKING.concat([LEAVE('Rasa')]),
    who: ['Rasa=Withdrawn', 'George=Agreed'], job: 'cancelled', refund: ['Rasa'] },

  { what: 'an edit after a paid withdrawal must not disturb them',
    evs: PAID_BOOKING.concat([LEAVE('Rasa'), EDIT('George', 'tutor')]),
    who: ['Rasa=Withdrawn', 'George=Waiting'], job: 'cancelled', refund: ['Rasa'] },

  { what: 'they rejoin — the refund is still owed',
    evs: PAID_BOOKING.concat([LEAVE('Rasa'), REQUEST('Rasa')]),
    who: ['Rasa=Waiting', 'George=Agreed'], job: 'unconfirmed', refund: ['Rasa'] },

  { what: 'they rejoin and pay again — still owed the first one',
    evs: PAID_BOOKING.concat([LEAVE('Rasa'), REQUEST('Rasa'),
                              ACCEPT('Rasa', 'George'), PAID('Rasa')]),
    who: ['Rasa=Booked', 'George=Agreed'], job: 'active', refund: ['Rasa'] },

  /* ---------- LEAVING, WHERE NO MONEY IS INVOLVED ------------------------------------------- */

  { what: 'an unpaid client withdraws — they are simply gone',
    evs: [REQUEST('Rasa'), REQUEST('George', 'tutor'), LEAVE('Rasa')],
    who: ['George=Waiting'], job: 'cancelled', refund: [] },

  { what: 'one of two clients withdraws',
    evs: [REQUEST('Rasa'), REQUEST('Danile'), REQUEST('George', 'tutor'), LEAVE('Rasa')],
    who: ['Danile=Waiting', 'George=Waiting'], job: 'unconfirmed' },

  { what: 'a tutor declines the client',
    evs: [REQUEST('Rasa'), REQUEST('George', 'tutor'),
          e('George', 'tutor', ACT.DECLINE, 'Rasa')],
    who: ['George=Waiting'], job: 'cancelled' },

  { what: 'an unpaid edit resets everybody',
    evs: [REQUEST('Rasa'), REQUEST('George', 'tutor'), ACCEPT('Rasa', 'George'), EDIT('Rasa')],
    who: ['Rasa=Waiting', 'George=Waiting'], job: 'unconfirmed' },

  { what: 'withdrawing and coming back, never having paid',
    evs: [REQUEST('Rasa'), LEAVE('Rasa'), REQUEST('Rasa')],
    who: ['Rasa=Waiting'], job: 'unconfirmed', refund: [] },
];

/* ---------- AND THE LOBBY ITSELF -----------------------------------------------------------------
   Separate from the fold: these are about what somebody is ALLOWED to do, which is the other half of
   the machine and the half that decides whether money can move. */
const RULES = [
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
    const LIVE = [REQUEST('Rasa'), REQUEST('George', 'tutor')];
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
    api.set([REQUEST('Rasa'), REQUEST('George', 'tutor'), e('Rasa', 'client', ACT.WITHDRAW)]);
    api.setJobs([job('J', 'Monday, Friday')], { J: 'George' });
    if (Object.keys(api.busyHours('George')).length) {
      bad.push('a cancelled session still held its hours');
    }
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
