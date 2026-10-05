#!/usr/bin/env node
/* ==================================================================================================
   node js/check-attempts.js — THE DAY A QUESTION WAS DONE, ASKED OF THE REAL BACKEND

   ASKED FOR AS *"should be saved to a spreadsheet instead of"* being kept only on the phone. The
   phone half is `doneMark_` / `attemptsSync_` in js/find.js and `check-flow.js` presses it; this is
   the half that writes a learner's record and decides who may read it, and each rule below fails
   quietly if it fails at all:

     · ONE ROW PER PERSON PER QUESTION. `first_done` once, `last_done` each new day, `times` counting
       days — and a second send for a day already there writes NOTHING, so a retry cannot count twice.
     · THE PERSON IS THE TOKEN'S. A request claiming another student's `personId` dates the question
       for whoever sent it. No token, no row.
     · A DAY FROM THE FUTURE IS TODAY. The phone's day is believed, up to tomorrow.
     · ONLY TWO PAYLOADS ARE RETIRED — the student's own and the admin's — and the generation that
       would make every visitor rebuild is untouched.
     · WHO IS SENT WHAT: yourself, your own; an admin, everybody's summary; another learner and a
       stranger, nothing of anybody else's.

   THROUGH THE REAL `doPost` AND `doGet`, gate and all, over `check-gas-load.js`. The people are
   invented and their PINs are 0000.
================================================================================================== */
'use strict';
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;

const iso = d => d.toISOString().slice(0, 10);
const TODAY = iso(new Date());
const D1 = '2026-09-01', D2 = '2026-09-08', D0 = '2026-08-20';

function world() {
  const b = backend();
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-S2', first_name: 'Ben', last_name: 'Pupil', handle: 'benpupil', email: 's2@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'a1@example.org', role: 'admin' }, base),
  ]);
  const tok = {};
  ['s1@example.org', 's2@example.org', 'a1@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d.token;
  });
  const done = (who, items, extra) => {
    asked++;
    return b.post(Object.assign({ action: 'markDone', token: tok[who] || '', items: items }, extra || {}));
  };
  /* THE TAB AS THE SHEET HOLDS IT, one object per row, dates read back as the sheet hands them. */
  const rows = () => {
    const g = b.tabs.attempts, h = g[0];
    return g.slice(1).map(r => {
      const o = {};
      h.forEach((c, i) => { const v = r[i]; o[c] = v instanceof Date ? iso(new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()))) : v; });
      return o;
    });
  };
  return { b, tok, done, rows };
}

/* ---------- THE UPSERT ------------------------------------------------------------------------- */
{
  const { b, done, rows } = world();
  if (!b.tabs.attempts) bad.push('there is no `attempts` tab in TAB/SCHEMA, so nothing below can be asked');
  else {
    /* CLAIMING TO BE BEN: the gate overwrites it, and the row is Ada's. */
    const a = done('s1@example.org', [{ key: 'q-alg-1', day: D1 }], { personId: 'P-S2', name: 'Ben Pupil' });
    if (!a.success) bad.push('a first done question was refused — ' + JSON.stringify(a));
    let r = rows();
    if (r.length !== 1) bad.push('one done question made ' + r.length + ' rows');
    else {
      if (r[0].person_id !== 'P-S1') bad.push('the row is for ' + r[0].person_id + ' — the request claimed P-S2 and the TOKEN was P-S1’s; the person must come from the token');
      if (r[0].question_key !== 'q-alg-1') bad.push('question_key is ' + r[0].question_key);
      if (r[0].first_done !== D1 || r[0].last_done !== D1 || Number(r[0].times) !== 1) bad.push('a first attempt wrote ' + JSON.stringify(r[0]) + ' — wanted first = last = ' + D1 + ', times 1');
    }
    if (!a.attempts || !a.attempts['q-alg-1'] || a.attempts['q-alg-1'].last !== D1) bad.push('the reply does not carry the row back: ' + JSON.stringify(a.attempts));

    /* THE SAME DAY AGAIN: nothing written, nothing counted. */
    const again = done('s1@example.org', [{ key: 'q-alg-1', day: D1 }]);
    if (!again.success) bad.push('a second send for the same day was refused — ' + JSON.stringify(again));
    if (again.writes !== 0) bad.push('a second send for a day already on the sheet wrote ' + again.writes + ' cell(s) — a retry must write nothing');
    r = rows();
    if (r.length !== 1 || Number(r[0].times) !== 1) bad.push('the same day sent twice left ' + JSON.stringify(r) + ' — wanted one row, times 1');

    /* A LATER DAY: last moves, first stays, times counts. */
    done('s1@example.org', [{ key: 'q-alg-1', day: D2 }]);
    r = rows();
    if (r.length !== 1) bad.push('a second day made a second row: ' + r.length);
    else if (r[0].first_done !== D1 || r[0].last_done !== D2 || Number(r[0].times) !== 2) bad.push('a later day left ' + JSON.stringify(r[0]) + ' — wanted first ' + D1 + ', last ' + D2 + ', times 2');

    /* AN OLDER DAY, as an offline phone's backlog sends it: first moves back, last stays. */
    done('s1@example.org', [{ key: 'q-alg-1', day: D0 }]);
    r = rows();
    if (r[0] && (r[0].first_done !== D0 || r[0].last_done !== D2 || Number(r[0].times) !== 3)) bad.push('an older day left ' + JSON.stringify(r[0]) + ' — wanted first ' + D0 + ', last ' + D2 + ', times 3');

    /* A DAY FROM THE FUTURE IS TODAY. */
    done('s1@example.org', [{ key: 'q-future', day: '2099-01-01' }]);
    const fut = rows().find(x => x.question_key === 'q-future');
    if (!fut || fut.last_done !== TODAY) bad.push('a day in 2099 was written as ' + (fut && fut.last_done) + ' — wanted today, ' + TODAY);

    /* A BATCH, as the backlog arrives, capped. */
    const many = Array.from({ length: 60 }, (_, i) => ({ key: 'q-batch-' + i, day: D1 }));
    done('s2@example.org', many);
    const ben = rows().filter(x => x.person_id === 'P-S2');
    if (ben.length !== 50) bad.push('a batch of 60 wrote ' + ben.length + ' rows — wanted the cap of 50');

    /* NO TOKEN: refused at the gate, nothing written. */
    const before = rows().length;
    const anon = done('nobody', [{ key: 'q-anon', day: D1 }], { personId: 'P-S1' });
    if (!anon.error || !/sign in/i.test(anon.error)) bad.push('markDone with no token answered ' + JSON.stringify(anon) + ' — the gate should refuse it');
    if (rows().length !== before) bad.push('a request with no token wrote a row');
  }
}

/* ---------- WHO IS SENT WHAT -------------------------------------------------------------------- */
{
  const { b, tok, done } = world();
  done('s1@example.org', [{ key: 'q-alg-1', day: D1 }, { key: 'q-alg-2', day: D2 }]);
  done('s2@example.org', [{ key: 'q-ben-1', day: D1 }]);
  b.cache.clear();
  const ada = b.get({ token: tok['s1@example.org'] }).attempts || {};
  const ben = b.get({ token: tok['s2@example.org'] }).attempts || {};
  const hal = b.get({ token: tok['a1@example.org'] }).attempts || {};
  const anon = b.get({}).attempts;
  const spoof = b.get({ person: 'P-S1', name: 'Ada Pupil' }).attempts;

  if (ada.for !== 'P-S1') bad.push('Ada’s attempts are stamped for "' + ada.for + '" — the phone checks this before drawing them');
  if (!ada.mine || !ada.mine['q-alg-1'] || ada.mine['q-alg-1'].last !== D1 || !ada.mine['q-alg-2'] || ada.mine['q-alg-2'].last !== D2) bad.push('Ada is not sent her own attempts: ' + JSON.stringify(ada.mine));
  if (ada.mine && ada.mine['q-ben-1']) bad.push('ONE LEARNER WAS SENT ANOTHER’S ATTEMPTS — Ada’s payload has Ben’s q-ben-1');
  if (ada.people) bad.push('a learner was sent `people`, which is every learner’s summary');
  if (!ben.mine || Object.keys(ben.mine).join() !== 'q-ben-1') bad.push('Ben was sent ' + JSON.stringify(ben.mine) + ' — wanted his own q-ben-1 alone');
  if (!hal.people || !hal.people['P-S1'] || hal.people['P-S1'].n !== 2 || hal.people['P-S1'].last !== D2) bad.push('the admin’s summary for Ada is ' + JSON.stringify(hal.people && hal.people['P-S1']) + ' — wanted n 2, last ' + D2);
  if (!hal.people || !hal.people['P-S2'] || hal.people['P-S2'].n !== 1) bad.push('the admin is not sent Ben’s summary: ' + JSON.stringify(hal.people));
  [['a visitor with no token', anon], ['a visitor NAMING Ada in the URL', spoof]].forEach(([who, a]) => {
    if (!a || a.for !== '' || Object.keys(a.mine || {}).length || a.people) bad.push(who + ' was sent attempts: ' + JSON.stringify(a));
  });
}

/* ---------- WHAT IT COSTS EVERYBODY ELSE ----------------------------------------------------------
   A done question is in two payloads. Ada's own goes, the admin's goes, Ben's stays, and the
   generation every key starts with is the same number after as before. */
{
  const { b, tok, done } = world();
  b.get({ token: tok['s1@example.org'] });
  b.get({ token: tok['s2@example.org'] });
  b.get({ token: tok['a1@example.org'] });
  const gen = b.props.PAYLOAD_GEN;
  const idx = pid => [...b.cache.keys()].some(k => /^pay:[^:]*$/.test(k) && k.endsWith('|' + pid));
  if (!idx('P-S1') || !idx('P-S2') || !idx('P-A1')) bad.push('the three payloads were not cached to begin with, so retirement was NOT checked: ' + [...b.cache.keys()].filter(k => /^pay:[^:]*$/.test(k)).join(', '));
  else {
    done('s1@example.org', [{ key: 'q-cost', day: D1 }]);
    if (b.props.PAYLOAD_GEN !== gen) bad.push('a done question bumped PAYLOAD_GEN (' + gen + ' → ' + b.props.PAYLOAD_GEN + ') — every visitor rebuilds thirty tabs because a child typed an answer');
    if (idx('P-S1')) bad.push('Ada’s own payload was not retired, so her other phone keeps the old date for six hours');
    if (idx('P-A1')) bad.push('the admin’s payload was not retired, so the people column keeps the old count');
    if (!idx('P-S2')) bad.push('Ben’s payload was retired for Ada’s question — it has nothing of hers in it');
    const fresh = b.get({ token: tok['s1@example.org'] }).attempts || {};
    if (!fresh.mine || !fresh.mine['q-cost']) bad.push('Ada’s next load does not have the question she just did');
  }
}

console.log('');
console.log('THE DAY A QUESTION WAS DONE, THROUGH THE REAL doPost AND doGet  (' + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
console.log('\nrequests made: ' + asked);
if (bad.length) {
  console.log('FAILED — a learner’s record is written wrongly, or sent to somebody it does not belong to.');
  process.exit(1);
}
console.log('OK — one row per person per question, the person from the token, each sees only their own and an admin everybody’s.');
