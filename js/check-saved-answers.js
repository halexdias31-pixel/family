#!/usr/bin/env node
/* ==================================================================================================
   node js/check-saved-answers.js — WHAT A CHILD WROTE, KEPT ON THEIR ACCOUNT, ASKED OF THE REAL BACKEND

   REPORTED BY THE OWNER FROM A PUPIL'S iPAD: *"i just relogged in as [the child] after having done the
   questions earlier and i dont see his answers there"*, *"it doesnt seem to save their answers"*, and
   *"i am very dissapointed it didnt have his answers already written in when he went to see them on the
   computer"*. The phone half is js/answers.js and `check-flow.js` drives it; this is the half that
   keeps a child's work and decides who may read it back, through the real `doPost` and `doGet`, gate
   and all, over `check-gas-load.js`. Every rule below fails quietly if it fails at all:

     · ONE ROW PER PERSON PER ANSWER KEY — a second save is an update, never a second row.
     · THE PERSON IS THE TOKEN'S. A request claiming another child's `personId` writes the sender's
       own row; no token, no row, and no read.
     · THE LATER EDIT WINS, and a stale one is answered with the winner — an iPad that was offline for
       an hour cannot write over the answer typed on the computer since.
     · AN EMPTY VALUE IS KEPT, so clearing a box reaches the other device.
     · A VALUE COMES BACK EXACTLY AS IT WENT — `3/4`, `1/2`, `2,4`, `0.50`, `=1+1`, a date, `TRUE`: a
       sheet turns half of those into something else unless the cell is written as text.
     · THE CEILINGS HOLD, and a value over one is refused whole, never cut.
     · `myAnswers` RETURNS THE CALLER'S ROWS AND NOBODY ELSE'S, stamped `for` the caller.
     · NO PAYLOAD IS RETIRED — answers are not in it — and the generation does not move.
     · THE SIGN-IN REPLY CARRIES THE ANSWERS, AND THE DONE DATES, STARS AND FAMILY the payload would have
       brought fifteen seconds later (`loginReplyFor_`), each for the person signing in only.

   The people are invented and their PINs are 0000. No real child's name is written here — the repo is
   public.
================================================================================================== */
'use strict';
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;

function world() {
  const b = backend();
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-S2', first_name: 'Ben', last_name: 'Pupil', handle: 'benpupil', email: 's2@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-M1', first_name: 'Mo', last_name: 'Parent', handle: 'moparent', email: 'm1@example.org', role: 'client' }, base),
    Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'a1@example.org', role: 'admin' }, base),
  ]);
  const tok = {};
  ['s1@example.org', 's2@example.org', 'm1@example.org', 'a1@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d.token;
  });
  const save = (who, items, extra) => {
    asked++;
    return b.post(Object.assign({ action: 'saveAnswers', token: tok[who] || '', items: items }, extra || {}));
  };
  const mine = (who, extra) => {
    asked++;
    return b.post(Object.assign({ action: 'myAnswers', token: tok[who] || '' }, extra || {}));
  };
  /* THE TAB AS THE SHEET HOLDS IT, one object per row. */
  const rows = () => {
    const g = b.tabs.answers;
    if (!g) return [];
    const h = g[0];
    return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; });
  };
  return { b, tok, save, mine, rows };
}

const ADA = 's1@example.org', BEN = 's2@example.org';
const T0 = Date.UTC(2026, 9, 8, 14, 0, 0);          /* an edit this afternoon */
const T1 = T0 + 60000, T2 = T0 + 120000;

/* ---------- THE UPSERT, AND WHOSE ROW IT IS ------------------------------------------------------- */
{
  const { b, save, rows } = world();
  if (!b.tabs.answers) bad.push('there is no `answers` tab in TAB/SCHEMA, so nothing below can be asked');
  else {
    /* CLAIMING TO BE BEN: the gate overwrites it, and the row is Ada's. */
    const a = save(ADA, [{ key: 'ans:q:Q-1', v: '15', at: T0 }], { personId: 'P-S2', name: 'Ben Pupil' });
    if (!a.success) bad.push('a first answer was refused — ' + JSON.stringify(a).slice(0, 200));
    let r = rows();
    if (r.length !== 1) bad.push('one answer made ' + r.length + ' rows');
    else {
      if (r[0].person_id !== 'P-S1') bad.push('the row is for ' + r[0].person_id + ' — the request claimed P-S2 and the TOKEN was P-S1’s; the person must come from the token');
      if (r[0].answer_key !== 'ans:q:Q-1' || String(r[0].value) !== '15') bad.push('the row holds ' + JSON.stringify(r[0]));
    }
    if (!a.saved || !a.saved['ans:q:Q-1'] || a.saved['ans:q:Q-1'].v !== '15' || a.saved['ans:q:Q-1'].at !== T0) bad.push('the reply does not carry the saved answer back: ' + JSON.stringify(a.saved));

    /* A LATER EDIT: the same row, the new value. */
    save(ADA, [{ key: 'ans:q:Q-1', v: '16', at: T1 }]);
    r = rows();
    if (r.length !== 1) bad.push('a second edit of one box made ' + r.length + ' rows — wanted one per person per key');
    else if (String(r[0].value) !== '16') bad.push('a later edit left the value ' + JSON.stringify(r[0].value) + ', wanted "16"');

    /* THE SAME EDIT AGAIN, as a retry sends it: nothing written. */
    const again = save(ADA, [{ key: 'ans:q:Q-1', v: '16', at: T1 }]);
    if (!again.success || again.writes !== 0) bad.push('the same edit sent twice wrote ' + again.writes + ' cell(s) — a retry must write nothing');

    /* AN OLDER EDIT, as an iPad that was offline sends it: refused, and the winner comes back. */
    const stale = save(ADA, [{ key: 'ans:q:Q-1', v: '9', at: T0 - 1000 }]);
    if (String(rows()[0].value) !== '16') bad.push('an OLDER edit wrote over a newer one: the row now says ' + JSON.stringify(rows()[0].value) + ' — an offline phone coming back would undo the work done since');
    if (!stale.saved || !stale.saved['ans:q:Q-1'] || stale.saved['ans:q:Q-1'].v !== '16' || stale.saved['ans:q:Q-1'].at !== T1) bad.push('a stale edit was answered ' + JSON.stringify(stale.saved) + ' — wanted the winner, "16" at ' + T1 + ', so the phone can put it in the box');
    if (stale.writes !== 0) bad.push('a stale edit wrote ' + stale.writes + ' cell(s)');

    /* AN EMPTY VALUE IS A REAL ROW: clearing the box has to reach the other device. */
    const cleared = save(ADA, [{ key: 'ans:q:Q-1', v: '', at: T2 }]);
    if (!cleared.success || !cleared.saved || !cleared.saved['ans:q:Q-1'] || cleared.saved['ans:q:Q-1'].v !== '') bad.push('clearing an answer was answered ' + JSON.stringify(cleared).slice(0, 200));
    r = rows();
    if (r.length !== 1 || String(r[0].value) !== '') bad.push('a cleared answer left ' + JSON.stringify(r) + ' — wanted the row kept with an empty value');

    /* A CLOCK RUNNING FAST IS NOT BELIEVED: the edit is never later than the server's now. */
    const fut = save(ADA, [{ key: 'ans:q:Q-FUTURE', v: '7', at: Date.now() + 864e5 * 30 }]);
    const fat = fut.saved && fut.saved['ans:q:Q-FUTURE'] && fut.saved['ans:q:Q-FUTURE'].at;
    if (!(fat <= Date.now() + 1000)) bad.push('an edit stamped a month ahead was kept at ' + fat + ' — a fast iPad clock would win every argument for a month');

    /* NO TOKEN: refused at the gate, nothing written. */
    const before = rows().length;
    const anon = save('nobody', [{ key: 'ans:q:Q-ANON', v: 'x', at: T0 }], { personId: 'P-S1' });
    if (!anon.error || !/sign in/i.test(anon.error)) bad.push('saveAnswers with no token answered ' + JSON.stringify(anon) + ' — the gate should refuse it');
    if (rows().length !== before) bad.push('a request with no token wrote a row');
  }
}

/* ---------- WHAT COMES BACK IS WHAT WENT IN ---------------------------------------------------------
   The harness's sheet does to a string what a real one does on `setValue` (`coerce`): a date-shaped
   string becomes a Date, `TRUE` a boolean, `0.50` the number 0.5. A real sheet goes further — `3/4`
   and `1/2` are dates to it and `2,4` can be 24 — which is why the value is always written as text,
   and why all of them are asked here even where this harness would have spared them. */
{
  const { save, mine } = world();
  const values = ['3/4', '1/2', '2,4', '0.50', '=1+1', '+44 7700', '-x', '0123', '2026-10-08', '5/6/2024', 'TRUE', "'quoted",
    '1,000', 'x² + 5x', '(3)/(4)', '[[10,20,30,40]]', 'Line one\nline two'];
  const items = values.map((v, i) => ({ key: 'ans:q:Q-V' + i, v: v, at: T0 }));
  const d = save(ADA, items.slice(0, 25));
  if (!d.success) bad.push('saving the awkward values was refused — ' + JSON.stringify(d).slice(0, 200));
  const back = (mine(ADA).answers) || {};
  values.forEach((v, i) => {
    const got = back['ans:q:Q-V' + i];
    if (!got || got.v !== v) bad.push('the answer ' + JSON.stringify(v) + ' came back as ' + JSON.stringify(got && got.v) + ' — a sheet read it as something other than text');
  });
}

/* ---------- THE CEILINGS, AND WHAT IS NOT AN ANSWER'S KEY ------------------------------------------- */
{
  const { b, save, rows } = world();
  const TEXT = b.ev('typeof ANSWER_TEXT_MAX === "number" ? ANSWER_TEXT_MAX : 0');
  const PAD = b.ev('typeof ANSWER_PAD_MAX === "number" ? ANSWER_PAD_MAX : 0');
  const PER = b.ev('typeof ANSWERS_PER_POST === "number" ? ANSWERS_PER_POST : 0');
  if (!(TEXT >= 500) || !(PAD >= 10000) || PAD > 50000 || !(PER >= 5)) bad.push('the ceilings are ANSWER_TEXT_MAX ' + TEXT + ', ANSWER_PAD_MAX ' + PAD + ', ANSWERS_PER_POST ' + PER + ' — missing, or a pad over what a Sheets cell holds (50,000)');
  else {
    const d = save(ADA, [
      { key: 'ans:q:Q-AT', v: 'a'.repeat(TEXT), at: T0 },
      { key: 'ans:q:Q-OVER', v: 'a'.repeat(TEXT + 1), at: T0 },
      { key: 'pad:q:Q-AT', v: '1'.repeat(PAD), at: T0 },
      { key: 'pad:q:Q-OVER', v: '1'.repeat(PAD + 1), at: T0 },
      { key: 'done:q:Q-NOT', v: 'x', at: T0 },
      { key: 'q:Q-BARE', v: 'x', at: T0 },
      { key: 'ans:' + 'q'.repeat(120), v: 'x', at: T0 },
      { key: 'pad:q:Q-WORDS:words', v: '["1.2"]', at: T0 },
      { key: 'ans:q:Q-SLOT#iv', v: 'temperature', at: T0 },
    ]);
    const saved = Object.keys((d && d.saved) || {}).sort().join(', ');
    const want = ['ans:q:Q-AT', 'ans:q:Q-SLOT#iv', 'pad:q:Q-AT', 'pad:q:Q-WORDS:words'].sort().join(', ');
    if (saved !== want) bad.push('the ceilings and keys let through ' + saved + ' — wanted exactly ' + want + ': a value over its ceiling or a key that is not an answer’s is refused whole');
    const keys = rows().map(r => r.answer_key).sort().join(', ');
    if (keys !== want) bad.push('the tab holds ' + keys + ' — wanted ' + want);
    const r = rows().find(x => x.answer_key === 'ans:q:Q-AT');
    if (!r || String(r.value).length !== TEXT) bad.push('an answer exactly at the ceiling was kept as ' + (r ? String(r.value).length : 'nothing') + ' characters');
    /* AND HOW MANY ONE REQUEST CARRIES. */
    const many = Array.from({ length: PER + 5 }, (_, i) => ({ key: 'ans:q:Q-MANY-' + i, v: String(i), at: T0 }));
    save(BEN, many);
    const ben = rows().filter(x => x.person_id === 'P-S2').length;
    if (ben !== PER) bad.push('a request of ' + (PER + 5) + ' answers wrote ' + ben + ' rows — wanted the cap of ' + PER);
  }
}

/* ---------- WHO IS SENT WHAT ------------------------------------------------------------------------ */
{
  const { save, mine } = world();
  save(ADA, [{ key: 'ans:q:Q-1', v: 'Ada’s answer', at: T0 }, { key: 'pad:q:Q-2', v: '[[1,2,3,4]]', at: T0 }]);
  save(BEN, [{ key: 'ans:q:Q-1', v: 'Ben’s answer', at: T0 }]);
  const a = mine(ADA, { personId: 'P-S2' });
  if (!a.success || a.for !== 'P-S1') bad.push('Ada asking (and claiming to be Ben) was answered for "' + a.for + '" — the reply is the TOKEN’s person’s, and says so');
  const ak = Object.keys(a.answers || {}).sort().join(', ');
  if (ak !== 'ans:q:Q-1, pad:q:Q-2') bad.push('Ada was sent ' + ak + ' — wanted her own two');
  if ((a.answers || {})['ans:q:Q-1'] && a.answers['ans:q:Q-1'].v !== 'Ada’s answer') bad.push('ONE CHILD WAS SENT ANOTHER’S ANSWER: Ada got ' + JSON.stringify(a.answers['ans:q:Q-1']));
  if (!(a.answers || {})['ans:q:Q-1'] || a.answers['ans:q:Q-1'].at !== T0) bad.push('the answer came back without its edit time: ' + JSON.stringify((a.answers || {})['ans:q:Q-1']));
  const bn = mine(BEN);
  if (Object.keys(bn.answers || {}).join() !== 'ans:q:Q-1' || bn.answers['ans:q:Q-1'].v !== 'Ben’s answer') bad.push('Ben was sent ' + JSON.stringify(bn.answers));
  const mo = mine('m1@example.org');
  if (!mo.success || Object.keys(mo.answers || {}).length) bad.push('a parent with no answers of their own was sent ' + JSON.stringify(mo.answers) + ' — there is no parent read');
  const hal = mine('a1@example.org');
  if (Object.keys(hal.answers || {}).length) bad.push('an admin was sent ' + JSON.stringify(hal.answers) + ' through myAnswers — it is the caller’s own rows only');
  const anon = mine('nobody', { personId: 'P-S1' });
  if (!anon.error || anon.answers) bad.push('a stranger naming Ada was answered ' + JSON.stringify(anon).slice(0, 200) + ' — the gate should refuse it');
}

/* ---------- WHAT IT COSTS EVERYBODY ELSE: NOTHING ----------------------------------------------------
   Answers are not in the payload, so a save retires nobody's stored copy and the generation every key
   starts with does not move. A child typing must never make the next visitor rebuild thirty tabs. */
{
  const { b, tok, save } = world();
  b.get({ token: tok[ADA] });
  b.get({ token: tok[BEN] });
  b.get({});
  const gen = b.props.PAYLOAD_GEN;
  const keys = () => [...b.cache.keys()].filter(k => /^pay:[^:]*$/.test(k)).sort().join(' ');
  const was = keys();
  if (!was) bad.push('nothing was cached to begin with, so what a save costs was NOT checked');
  save(ADA, [{ key: 'ans:q:Q-COST', v: '42', at: T0 }]);
  if (b.props.PAYLOAD_GEN !== gen) bad.push('saving an answer bumped PAYLOAD_GEN (' + gen + ' → ' + b.props.PAYLOAD_GEN + ') — every visitor rebuilds because a child typed');
  if (keys() !== was) bad.push('saving an answer retired a stored payload: ' + was + ' → ' + keys());
  const g = b.get({ token: tok[ADA] });
  if (/Q-COST/.test(JSON.stringify(g))) bad.push('the payload carries a child’s answers — it is cached and keyed, and answers are theirs alone');
  if (!(g.features || []).includes('saveAnswers') || !(g.features || []).includes('myAnswers')) bad.push('`saveAnswers` / `myAnswers` are not in doGet’s features, so no phone will ever send or ask for an answer');
  const access = b.ev('JSON.stringify([ACTION_ACCESS.saveAnswers, ACTION_ACCESS.myAnswers])');
  if (access !== '["self","self"]') bad.push('ACTION_ACCESS says ' + access + ' for saveAnswers and myAnswers — wanted self for both');
}

/* ---------- A BACKEND SYNCED BEFORE `ensureSchema` MADE THE TAB -------------------------------------
   Saving says what to do and writes nothing; signing in still works, with no answers. */
{
  const { b, tok } = world();
  delete b.tabs.answers;
  asked++;
  const d = b.post({ action: 'saveAnswers', token: tok[ADA], items: [{ key: 'ans:q:Q-1', v: '1', at: T0 }] });
  if (!d.error || !/ensureSchema|setup/.test(d.error)) bad.push('with no answers tab, saveAnswers answered ' + JSON.stringify(d).slice(0, 200) + ' — wanted a sentence naming ensureSchema');
  asked++;
  const m = b.post({ action: 'myAnswers', token: tok[ADA] });
  if (!m.success || Object.keys(m.answers || {}).length) bad.push('with no answers tab, myAnswers answered ' + JSON.stringify(m).slice(0, 200) + ' — wanted success and none');
  asked++;
  const s = b.post({ action: 'verifyLogin', email: ADA, pin: '0000' });
  if (!s.success) bad.push('with no answers tab, signing in failed: ' + JSON.stringify(s).slice(0, 200));
}

/* ---------- THE SIGN-IN REPLY BRINGS WHAT THE PAYLOAD WOULD HAVE, FOR THIS PERSON ONLY ------------------
   *"the logging in and everything feels so janky and unresponsive and slow"* — the Done dates, the stars,
   the family and the answers all waited for the person's own `doGet`, 15–35 s after "Signed in". They
   come with the reply now, in the payload's own shapes, for the person who signed in and nobody else. */
{
  const { b, tok, save } = world();
  save(ADA, [{ key: 'ans:q:Q-SIGN', v: '3/4', at: T0 }]);
  save(BEN, [{ key: 'ans:q:Q-BEN', v: 'not Ada’s', at: T0 }]);
  asked++;
  b.post({ action: 'markDone', token: tok[ADA], items: [{ key: 'q:Q-SIGN', day: '2026-10-08' }] });
  b.seed('favourites', [{ fav_id: 'F1', person_id: 'P-S1', kind: 'question', item_id: 'q:Q-STAR', at: '2026-10-08' },
                        { fav_id: 'F2', person_id: 'P-S2', kind: 'question', item_id: 'q:Q-BENSTAR', at: '2026-10-08' }]);
  b.seed('family', [{ link_id: 'L1', parent_id: 'P-M1', child_id: 'P-S1', state: 'accepted' }]);
  asked++;
  const d = b.post({ action: 'verifyLogin', email: ADA, pin: '0000' });
  if (!d.success) bad.push('Ada could not sign in for the reply check — ' + JSON.stringify(d).slice(0, 200));
  else {
    if (!d.answers || !d.answers['ans:q:Q-SIGN'] || d.answers['ans:q:Q-SIGN'].v !== '3/4') bad.push('the sign-in reply does not carry Ada’s answers: ' + JSON.stringify(d.answers) + ' — the boxes would wait a round trip after "Signed in"');
    if (d.answers && d.answers['ans:q:Q-BEN']) bad.push('THE SIGN-IN REPLY CARRIES ANOTHER CHILD’S ANSWER');
    if (!d.attempts || d.attempts.for !== 'P-S1' || !d.attempts.mine || !d.attempts.mine['q:Q-SIGN']) bad.push('the sign-in reply’s attempts are ' + JSON.stringify(d.attempts) + ' — wanted Ada’s, stamped for P-S1, as doGet builds them');
    if (JSON.stringify(d.favourites) !== '["q:Q-STAR"]') bad.push('the sign-in reply’s favourites are ' + JSON.stringify(d.favourites) + ' — wanted Ada’s one star and nobody else’s');
    if (d.familyFor !== 'P-S1' || !Array.isArray(d.family) || d.family.length !== 1 || d.family[0].personId !== 'P-M1' || d.family[0].relation !== 'parent') bad.push('the sign-in reply’s family is ' + JSON.stringify({ familyFor: d.familyFor, family: d.family }) + ' — wanted Mo as Ada’s parent, stamped for P-S1');
    if (d.family && d.family[0] && (d.family[0].email || d.family[0].phone)) bad.push('a family card in the sign-in reply carries private fields: ' + JSON.stringify(d.family[0]));
    /* THE SAME SHAPES AS THE PAYLOAD — one builder each, so the two cannot disagree. */
    b.cache.clear();
    const g = b.get({ token: d.token });
    if (JSON.stringify(g.family) !== JSON.stringify(d.family) || g.familyFor !== d.familyFor) bad.push('the payload’s family and the sign-in reply’s differ: ' + JSON.stringify(g.family) + ' / ' + JSON.stringify(d.family));
    if (JSON.stringify(g.favourites) !== JSON.stringify(d.favourites)) bad.push('the payload’s favourites and the sign-in reply’s differ');
    if (JSON.stringify(g.attempts) !== JSON.stringify(d.attempts)) bad.push('the payload’s attempts and the sign-in reply’s differ: ' + JSON.stringify(g.attempts) + ' / ' + JSON.stringify(d.attempts));
  }
}

console.log('');
console.log('WHAT A CHILD WROTE, KEPT ON THEIR ACCOUNT, THROUGH THE REAL doPost AND doGet  (' + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
console.log('\nrequests made: ' + asked);
if (bad.length) {
  console.log('FAILED — a child’s answer is lost, written wrongly, or sent to somebody it does not belong to.');
  process.exit(1);
}
console.log('OK — one row per person per answer, the person from the token, the later edit wins, every value comes back as text, and the sign-in reply brings the child’s own work.');
