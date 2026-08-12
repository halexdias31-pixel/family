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
function backendFile(names) {
  for (const n of names) {
    const p = path.join(dir, '..', n);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return null;
}
const booking = backendFile(['booking.gs', '30_booking.gs']);
const constants = backendFile(['constants.gs', '00_constants.gs']);
if (!booking || !constants) {
  console.log('');
  console.log('  booking.gs or constants.gs is not beside the project — nothing to check.');
  console.log('  This reads the real backend rather than a copy, so it needs the files.');
  process.exit(0);
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
    + `; module.exports = { BM, ACT, set: e => { EVENTS = e },
         participantsOf, clientsIn, jobStatusOf, tutorStatusOf, bmActionsFor, bmApply };`;
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
