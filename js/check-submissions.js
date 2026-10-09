#!/usr/bin/env node
/* ==================================================================================================
   node js/check-submissions.js — EVERY ANSWER SENT IS AN EVENT, ASKED OF THE REAL BACKEND

   THE OWNER, 9 OCT: *"I just want system to record each submition. So like if they submit a correct
   answer then change it and submit an incorrect answer, that's 2 events. And it will leave the latest
   event up, so they would see incorrect answer there next time they login. Simple. Instead of each
   question just saving number of attempts."*

   The phone half is js/submit.js and `check-flow.js` presses it; this is the half that writes a
   learner's record and decides who may read it, and every rule below fails quietly if it fails at all:

     · A ROW PER PRESS, APPENDED. Right then wrong is two rows, and the latest — the later one — is what
       every load says. Nothing is ever updated or deleted.
     · A RETRIED PRESS IS ONE ROW. The same id sent twice, in one request or two, is written once and
       answered both times as saved, with the row's own time.
     · THE PERSON IS THE TOKEN'S. A body claiming another child writes the sender's row. No token, no row.
     · WHAT IS REFUSED IS REFUSED WHOLE: a verdict outside the vocabulary, an id not in the phone's shape,
       an empty answer, one over `ANSWER_TEXT_MAX` — never cut — and the reply leaves each out of `saved`.
     · THE ANSWER IS TEXT: 3/4, 0.50, 2,4 and =1+1 come back exactly as sent. The name and the words
       are kept by the email's own rules (tags out, capped). The time is the server's.
     · WHO IS SENT WHAT: yourself, your latest per question; an admin also everybody's summary and no
       answer of anybody's; another learner and a stranger nothing of anybody else's.
     · NO PAYLOAD IS RETIRED, the generation is untouched, the stored body carries no submissions, and a
       cache HIT has the press just made. The per-person copy of `mine` is read again after a press and
       after an edit typed into the sheet, and not on every load.
     · NOTHING READS OR WRITES `attempts` ANY MORE — not the backend, not the phone — and `markDone` is
       refused at the gate.

   THROUGH THE REAL `doPost` AND `doGet`, gate and all, over `check-gas-load.js`. The people are
   invented and their PINs are 0000.
================================================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const REPO = path.resolve(__dirname, '..');

let seq = 0;
const ID = () => (1760000000000 + (++seq)) + '-ab' + String(seq).padStart(4, '0');

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
  const send = (who, items, extra) => {
    asked++;
    return b.post(Object.assign({ action: 'submitAnswer', token: tok[who] || '', items: items }, extra || {}));
  };
  /* THE TAB AS THE SHEET HOLDS IT, one object per row. */
  const rows = () => {
    const g = b.tabs.submissions;
    if (!g) return [];
    const h = g[0];
    return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; });
  };
  return { b, tok, send, rows };
}
const ADA = 's1@example.org', BEN = 's2@example.org', HAL = 'a1@example.org';
const ev = (key, answer, verdict, more) => Object.assign({ id: ID(), key: key, answer: answer, verdict: verdict }, more || {});

/* ---------- 0. THE TAB IS THERE, AND `attempts` IS NOT ----------------------------------------------- */
{
  const { b } = world();
  asked++;
  const want = ['person_id', 'key', 'label', 'words', 'answer', 'verdict', 'submitted_at', 'event_id'];
  const head = (b.tabs.submissions || [[]])[0];
  if (!b.tabs.submissions) bad.push('there is no `submissions` tab in TAB/SCHEMA, so nothing below can be asked');
  else if (JSON.stringify(head) !== JSON.stringify(want)) bad.push('SCHEMA.submissions is ' + JSON.stringify(head) + ' — wanted ' + JSON.stringify(want));
  if (b.tabs.attempts) bad.push('TAB still names an `attempts` tab — it is left in the live sheet and nothing may read or write it');
  const where = b.ev('WHERE.submissions && WHERE.submissions.file');
  if (where !== 'ledger') bad.push('WHERE.submissions is ' + JSON.stringify(where) + ' — wanted the Ledger, beside every other record of a learner');
  if (b.ev('ACTION_ACCESS.submitAnswer') !== 'self') bad.push('ACTION_ACCESS.submitAnswer is ' + JSON.stringify(b.ev('ACTION_ACCESS.submitAnswer')) + ' — wanted self: the row is the token’s person');
  if (b.ev('typeof ACTION_ACCESS.markDone') !== 'undefined') bad.push('ACTION_ACCESS still classifies markDone — the action went with the attempts tab');
}

/* ---------- 1. A ROW PER PRESS, AND THE LATEST IS THE LAST ---------------------------------------------- */
{
  const { b, tok, send, rows } = world();
  const t0 = Date.now();
  /* RIGHT, THEN THE ANSWER CHANGED AND SENT AGAIN, WRONG — claiming to be Ben both times. */
  const r1 = send(ADA, [ev('q:Q-T-1', '15', 'right', { label: 'Maths · Paper 1 · Q1', words: 'Work out 3 × 5.' })], { personId: 'P-S2', name: 'Ben Pupil' });
  const r2 = send(ADA, [ev('q:Q-T-1', '16', 'wrong', { label: 'Maths · Paper 1 · Q1', words: 'Work out 3 × 5.' })], { personId: 'P-S2' });
  const t1 = Date.now();
  if (!r1.success || !r2.success) bad.push('a submission was refused — ' + JSON.stringify([r1, r2]).slice(0, 300));
  let r = rows();
  asked++;
  if (r.length !== 2) bad.push('right then wrong made ' + r.length + ' row(s) — the owner: *"that\'s 2 events"*');
  else {
    if (r.some(x => x.person_id !== 'P-S1')) bad.push('the rows are for ' + r.map(x => x.person_id).join(', ') + ' — the request claimed P-S2 and the TOKEN was Ada’s; the person must come from the token');
    if (r[0].answer !== '15' || r[0].verdict !== 'right' || r[1].answer !== '16' || r[1].verdict !== 'wrong') bad.push('the two rows read ' + JSON.stringify(r.map(x => [x.answer, x.verdict])) + ' — wanted 15/right then 16/wrong');
    if (r[0].key !== 'q:Q-T-1' || r[0].label !== 'Maths · Paper 1 · Q1' || r[0].words !== 'Work out 3 × 5.') bad.push('the first row lost its key, name or words: ' + JSON.stringify(r[0]));
    const at = x => (x.submitted_at instanceof Date ? x.submitted_at.getTime() : NaN);
    if (!r.every(x => at(x) >= t0 && at(x) <= t1)) bad.push('submitted_at is not the server’s clock as the row was written: ' + JSON.stringify(r.map(x => x.submitted_at)));
    if (!r.every(x => /^\d{10,16}-[a-z0-9]{3,16}$/.test(String(x.event_id)))) bad.push('event_id is not kept on the row: ' + JSON.stringify(r.map(x => x.event_id)));
  }
  /* THE REPLY CARRIES EACH PRESS AS SAVED, with the server's time. */
  const id2 = Object.keys(r2.saved || {})[0];
  if (!id2 || r2.saved[id2].key !== 'q:Q-T-1' || r2.saved[id2].verdict !== 'wrong' || !(r2.saved[id2].at >= t0)) bad.push('the reply does not carry the press back as saved: ' + JSON.stringify(r2.saved));
  /* THE LATEST IS WHAT A LOAD SAYS — on Ada's next sign-in, anywhere. */
  asked++;
  b.cache.clear();
  const g = b.get({ token: tok[ADA] });
  const m = ((g.submissions || {}).mine || {})['q:Q-T-1'];
  if (!m || m.answer !== '16' || m.verdict !== 'wrong') bad.push('Ada’s next load says ' + JSON.stringify(m) + ' for q:Q-T-1 — wanted the latest, 16 and wrong: *"they would see incorrect answer there next time they login"*');
  if (m && m.id !== r[1].event_id) bad.push('the latest carries id ' + JSON.stringify(m.id) + ', not the press it is — the phone compares it with what it sent');
  if ((g.submissions || {}).for !== 'P-S1') bad.push('the submissions are stamped for "' + (g.submissions || {}).for + '", not Ada — the phone checks this before drawing any of it');
  /* AND NOTHING WAS UPDATED OR DELETED: the first row is as it was written. */
  asked++;
  send(ADA, [ev('q:Q-T-1', '15', 'right')]);
  r = rows();
  if (r.length !== 3 || r[0].answer !== '15' || r[1].answer !== '16') bad.push('a third press touched the rows before it: ' + JSON.stringify(r.map(x => x.answer)));
  /* TWO PRESSES OF ONE QUESTION IN ONE REQUEST — the queue a phone kept offline. Same server time; the
     later ROW is the latest. */
  asked++;
  send(ADA, [ev('q:Q-T-2', 'a', 'wrong'), ev('q:Q-T-2', 'b', 'right')]);
  b.cache.clear();
  const m2 = ((b.get({ token: tok[ADA] }).submissions || {}).mine || {})['q:Q-T-2'];
  if (!m2 || m2.answer !== 'b' || m2.verdict !== 'right') bad.push('two presses in one request, wrong then right, load as ' + JSON.stringify(m2) + ' — the later row is the latest');
}

/* ---------- 2. A RETRIED PRESS IS ONE ROW ---------------------------------------------------------------- */
{
  const { send, rows } = world();
  const e1 = ev('q:Q-R-1', '42', 'right');
  const a = send(ADA, [e1]);
  const n = rows().length;
  /* THE REPLY WAS LOST; THE PHONE SENDS THE SAME PRESS AGAIN, beside a new one. */
  const e2 = ev('q:Q-R-2', '7', 'wrong');
  const b2 = send(ADA, [e1, e2]);
  asked++;
  if (rows().length !== n + 1) bad.push('a retried press (the same event id) was written again: ' + n + ' → ' + rows().length + ' rows, wanted ' + (n + 1));
  if (!b2.saved || !b2.saved[e1.id] || !b2.saved[e2.id]) bad.push('the retry is not answered as saved — the phone would send it for ever: ' + JSON.stringify(b2.saved));
  else if (b2.saved[e1.id].at !== a.saved[e1.id].at) bad.push('the retried press is answered with a new time (' + b2.saved[e1.id].at + ' vs ' + a.saved[e1.id].at + ') — it is the row already there');
  /* AND THE SAME ID TWICE IN ONE REQUEST. */
  asked++;
  const e3 = ev('q:Q-R-3', 'x', 'sent');
  const n2 = rows().length;
  send(ADA, [e3, e3]);
  if (rows().length !== n2 + 1) bad.push('one press twice in the same request made ' + (rows().length - n2) + ' rows');
  /* ANOTHER CHILD'S ID IS NOT ADA'S: the same id from Ben is his own press. */
  asked++;
  const n3 = rows().length;
  send(BEN, [e1]);
  if (rows().length !== n3 + 1 || rows()[rows().length - 1].person_id !== 'P-S2') bad.push('Ben’s press with an id Ada once used was not written as his — ids are per person');
}

/* ---------- 3. WHAT IS REFUSED, AND WHAT IS KEPT AS TEXT ------------------------------------------------- */
{
  const { b, tok, send, rows } = world();
  const MAX = b.ev('ANSWER_TEXT_MAX');
  const cases = [
    ['a verdict outside the vocabulary', ev('q:Q-X-1', '5', 'maybe')],
    ['an AI verdict out of nothing', ev('q:Q-X-2', '5', 'ai:3/0')],
    ['an id not in the phone’s shape', Object.assign(ev('q:Q-X-3', '5', 'right'), { id: 'mine' })],
    ['an empty answer', ev('q:Q-X-4', '   ', 'sent')],
    ['an answer over ANSWER_TEXT_MAX', ev('q:Q-X-5', 'x'.repeat(MAX + 1), 'sent')],
    ['no key', ev('', '5', 'right')],
    ['a key longer than any library key', ev('q:' + 'k'.repeat(130), '5', 'right')],
  ];
  const n0 = rows().length;
  const d = send(ADA, cases.map(c => c[1]));
  asked++;
  if (rows().length !== n0) bad.push('refused presses wrote ' + (rows().length - n0) + ' row(s): ' + JSON.stringify(rows().slice(n0).map(x => [x.key.slice(0, 20), String(x.answer).length, x.verdict])));
  cases.forEach(([what, e]) => { if (d.saved && d.saved[e.id]) bad.push(what + ' is answered as saved — the phone would believe it is on the account'); });
  /* EXACTLY AT THE CEILING IS TAKEN, WHOLE. */
  asked++;
  const full = ev('q:Q-X-6', 'y'.repeat(MAX), 'sent');
  send(ADA, [full]);
  const kept = rows().find(x => x.key === 'q:Q-X-6');
  if (!kept || String(kept.answer).length !== MAX) bad.push('an answer exactly ANSWER_TEXT_MAX long was ' + (kept ? 'kept at ' + String(kept.answer).length : 'refused') + ' — wanted it whole');
  /* EVERY VERDICT THE PHONE SENDS. */
  asked++;
  const okV = ['right', 'wrong', 'sent', 'ai:0/4', 'ai:4/4', 'ai:12/20'];
  const vs = okV.map((v, i) => ev('q:Q-V-' + i, 'a' + i, v));
  const dv = send(ADA, vs);
  vs.forEach(e => { if (!dv.saved || !dv.saved[e.id]) bad.push('the verdict ' + e.verdict + ' was refused — the phone sends it'); });
  /* TEXT IN, TEXT OUT — what a sheet turns into a date, a number or a formula. */
  asked++;
  const texts = ['3/4', '1/2', '0.50', '2,4', '=1+1', '+44', '007', 'TRUE', '-3, -1, 2', '3,4,5,2,1'];
  send(ADA, texts.map((t, i) => ev('q:Q-TX-' + i, t, 'sent')));
  texts.forEach((t, i) => {
    const row = rows().find(x => x.key === 'q:Q-TX-' + i);
    if (!row || row.answer !== t) bad.push('the answer ' + JSON.stringify(t) + ' came back off the sheet as ' + JSON.stringify(row && row.answer) + ' — it must be written as text');
  });
  b.cache.clear();
  const mine = (b.get({ token: tok[ADA] }).submissions || {}).mine || {};
  texts.forEach((t, i) => { const m = mine['q:Q-TX-' + i]; if (!m || m.answer !== t) bad.push('the load hands ' + JSON.stringify(t) + ' back as ' + JSON.stringify(m && m.answer)); });
  /* THE NAME AND THE WORDS BY THE EMAIL'S RULES: tags out, folded, capped; an inequality is not a tag. */
  asked++;
  send(ADA, [ev('q:Q-L-1', '1', 'right', { label: '<b>Maths</b>  ·  Paper 1\n· Q3<script>x</script>', words: 'Solve x > 3 and x < 7.\n---\n<b>Find</b> x.' }),
             ev('q:Q-L-2', '1', 'right', { label: 'x'.repeat(400), words: 'w'.repeat(5000) })]);
  const l1 = rows().find(x => x.key === 'q:Q-L-1') || {}, l2 = rows().find(x => x.key === 'q:Q-L-2') || {};
  if (l1.label !== 'Maths · Paper 1 · Q3 x') bad.push('a name with tags was kept as ' + JSON.stringify(l1.label) + ' — wanted the tags out and the spaces folded (attemptLabel_)');
  if (l1.words !== 'Solve x > 3 and x < 7.\n---\nFind x.') bad.push('words were kept as ' + JSON.stringify(l1.words) + ' — wanted the tags out and the inequality and the `---` line kept (attemptWords_)');
  if (String(l2.label).length !== b.ev('ATTEMPT_LABEL_MAX') || String(l2.words).length !== b.ev('ATTEMPT_WORDS_MAX')) bad.push('a long name and long words were kept at ' + String(l2.label).length + ' and ' + String(l2.words).length + ' — wanted the caps');
  /* A CAP ON ONE REQUEST. */
  asked++;
  const many = Array.from({ length: 30 }, (_, i) => ev('q:Q-M-' + i, 'm' + i, 'sent'));
  const nb = rows().length;
  send(BEN, many);
  if (rows().length - nb !== b.ev('SUBMISSIONS_PER_POST')) bad.push('30 presses in one request wrote ' + (rows().length - nb) + ' — wanted SUBMISSIONS_PER_POST (' + b.ev('SUBMISSIONS_PER_POST') + '); the rest go on the next send');
  /* NO TOKEN: refused at the gate, nothing written. */
  asked++;
  const before = rows().length;
  const anon = b.post({ action: 'submitAnswer', items: [ev('q:Q-N-1', '1', 'right')], personId: 'P-S1' });
  if (!anon.error || !/sign in/i.test(anon.error)) bad.push('submitAnswer with no token answered ' + JSON.stringify(anon) + ' — the gate should refuse it');
  if (rows().length !== before) bad.push('a request with no token wrote a row');
  /* AND `markDone`, FROM A PHONE STILL ON THE OLD CODE: refused, and nothing anywhere is written. */
  asked++;
  const w0 = b.log.writes;
  const old = b.post({ action: 'markDone', token: tok[ADA], items: [{ key: 'q:Q-OLD', day: '2026-10-01' }] });
  if (old.success || !old.error) bad.push('markDone was answered ' + JSON.stringify(old).slice(0, 160) + ' — it went with the attempts tab and must be refused');
  if (b.log.writes !== w0 || b.tabs.attempts) bad.push('markDone wrote ' + (b.log.writes - w0) + ' cell(s)' + (b.tabs.attempts ? ' and made an attempts tab' : ''));
}

/* ---------- 4. WHO IS SENT WHAT -------------------------------------------------------------------------- */
{
  const { b, tok, send } = world();
  /* FOUR PRESSES ON THREE QUESTIONS: Q-W-1 twice, and one practical's worksheet as two boxes. */
  send(ADA, [ev('q:Q-W-1', '14', 'wrong'), ev('q:Q-W-2', 'because', 'sent'), ev('pr:PR-W1#iv', 'the temperature', 'sent'), ev('pr:PR-W1#dv', 'the time', 'sent')]);
  send(ADA, [ev('q:Q-W-1', '15', 'right')]);
  send(BEN, [ev('q:Q-W-B', 'Ben’s answer', 'wrong')]);
  b.cache.clear();
  const ada = b.get({ token: tok[ADA] }).submissions || {};
  const ben = b.get({ token: tok[BEN] }).submissions || {};
  const hal = b.get({ token: tok[HAL] }).submissions || {};
  const anon = b.get({}).submissions;
  const spoof = b.get({ person: 'P-S1', name: 'Ada Pupil' }).submissions;
  asked++;
  if (Object.keys(ada.mine || {}).sort().join() !== 'pr:PR-W1#dv,pr:PR-W1#iv,q:Q-W-1,q:Q-W-2') bad.push('Ada is sent ' + JSON.stringify(Object.keys(ada.mine || {})) + ' — wanted her own four keys, each worksheet box under its own');
  if (!ada.mine || !ada.mine['q:Q-W-1'] || ada.mine['q:Q-W-1'].answer !== '15') bad.push('Ada’s latest for q:Q-W-1 is ' + JSON.stringify(ada.mine && ada.mine['q:Q-W-1']) + ' — wanted the later press, 15');
  if (JSON.stringify(ada).indexOf('Ben’s answer') !== -1) bad.push('ONE LEARNER WAS SENT ANOTHER’S ANSWER — Ada’s payload carries Ben’s');
  if (ada.people) bad.push('a learner was sent `people`, which is every learner’s summary');
  if (Object.keys(ben.mine || {}).join() !== 'q:Q-W-B' || ben.for !== 'P-S2') bad.push('Ben is sent ' + JSON.stringify(ben) + ' — wanted his own q:Q-W-B alone');
  asked++;
  if (!hal.people || !hal.people['P-S1'] || hal.people['P-S1'].n !== 3 || !/^\d{4}-\d{2}-\d{2}$/.test(hal.people['P-S1'].last)) bad.push('the admin’s summary for Ada is ' + JSON.stringify(hal.people && hal.people['P-S1']) + ' — wanted n 3 (five presses on three questions: a question sent twice is one, and a worksheet’s boxes are one) and the day of her last');
  if (!hal.people || !hal.people['P-S2'] || hal.people['P-S2'].n !== 1) bad.push('the admin is not sent Ben’s summary: ' + JSON.stringify(hal.people));
  if (/15|because|temperature|Ben’s answer/.test(JSON.stringify(hal.people || {})) || Object.keys(hal.mine || {}).length) bad.push('the admin is sent somebody’s answers — a summary is counts and a day: ' + JSON.stringify(hal).slice(0, 200));
  asked++;
  [['a visitor with no token', anon], ['a visitor NAMING Ada in the URL', spoof]].forEach(([who, a]) => {
    if (!a || a.for !== '' || Object.keys(a.mine || {}).length || a.people) bad.push(who + ' was sent submissions: ' + JSON.stringify(a));
  });
  /* THE SIGN-IN REPLY CARRIES THEM, in the payload's shape, for the person signing in alone. */
  asked++;
  const si = b.post({ action: 'verifyLogin', email: ADA, pin: '0000' });
  if (!si.submissions || si.submissions.for !== 'P-S1' || !si.submissions.mine || !si.submissions.mine['q:Q-W-1']) bad.push('the sign-in reply does not carry Ada’s submissions: ' + JSON.stringify(si.submissions));
  if (si.attempts) bad.push('the sign-in reply still carries `attempts`');
  if (JSON.stringify(si.submissions || {}).indexOf('Ben’s answer') !== -1) bad.push('the sign-in reply carries Ben’s answer to Ada');
  /* AND THE FEATURES SAY SO: submitAnswer, and neither markDone nor attemptWords, so an old phone sends
     the old actions nowhere. */
  asked++;
  const f = b.get({}).features || [];
  if (f.indexOf('submitAnswer') === -1) bad.push('`submitAnswer` is not in doGet’s features, so no phone will ever send a press');
  ['markDone', 'attemptWords'].forEach(n => { if (f.indexOf(n) !== -1) bad.push('`' + n + '` is still in doGet’s features — a phone on the old code would send it to a tab nobody reads'); });
}

/* ---------- 5. WHAT IT COSTS — NO PAYLOAD RETIRED, A HIT FRESH, THE TAB READ ONCE PER PRESS ---------------- */
{
  const { b, tok, send } = world();
  b.get({ token: tok[ADA] });
  b.get({ token: tok[BEN] });
  b.get({ token: tok[HAL] });
  const gen = b.props.PAYLOAD_GEN;
  const stored = () => [...b.cache.keys()].filter(k => /^pay:\d+\|/.test(k) && !/^pay:subs\|/.test(k));
  const idx = pid => stored().some(k => /^pay:[^:]*$/.test(k) && k.endsWith('|' + pid));
  if (!idx('P-S1') || !idx('P-S2') || !idx('P-A1')) bad.push('the three payloads were not cached to begin with, so what a press costs was NOT checked: ' + stored().join(', '));
  else {
    asked++;
    const body = stored().filter(k => /:\d+$/.test(k)).map(k => b.cache.get(k)).join('');
    if (/"submissions"\s*:/.test(body) || /"attempts"\s*:/.test(body)) bad.push('the STORED payload carries `submissions` or `attempts` — a press would have to throw the child’s whole payload away');
    send(ADA, [ev('q:Q-C-1', '9', 'right')]);
    asked++;
    if (b.props.PAYLOAD_GEN !== gen) bad.push('a press bumped PAYLOAD_GEN (' + gen + ' → ' + b.props.PAYLOAD_GEN + ') — every visitor rebuilds thirty tabs because a child pressed Send');
    if (!idx('P-S1') || !idx('P-S2') || !idx('P-A1')) bad.push('a press retired a stored payload — the child’s next sign-in is a cold rebuild');
    const fresh = b.get({ token: tok[ADA] });
    if (!fresh.cached) bad.push('Ada’s next load was not served from the store, so this did not ask what a hit carries');
    const m = ((fresh.submissions || {}).mine || {})['q:Q-C-1'];
    if (!m || m.answer !== '9' || m.verdict !== 'right') bad.push('Ada’s next load (a cache hit) does not have the press she just made: ' + JSON.stringify(fresh.submissions));
    const hal = b.get({ token: tok[HAL] }).submissions || {};
    if (!hal.people || !hal.people['P-S1'] || hal.people['P-S1'].n !== 1) bad.push('the admin’s next load does not count Ada’s press: ' + JSON.stringify(hal.people));
    const ben = b.get({ token: tok[BEN] }).submissions || {};
    if (ben.mine && ben.mine['q:Q-C-1']) bad.push('BEN’S NEXT LOAD CARRIES ADA’S PRESS — the fresh submissions were built for the wrong person');
    /* AND ON A HIT, AS ON A MISS, ONLY AN ADMIN IS SENT THE SUMMARY. */
    if (ben.people || (fresh.submissions || {}).people) bad.push('a learner’s cache hit carries `people`, every learner’s summary: ' + JSON.stringify(ben.people || fresh.submissions.people).slice(0, 120));
  }
  /* THE TAB IS READ ONCE PER PERSON PER PRESS, NOT ONCE PER LOAD: a second load with nothing new reads it
     not at all, a press makes the next load read it, and an edit typed into the sheet (the generation
     bumped by the edit watch) does too. */
  asked++;
  b.ev('(function(){ const r = read; globalThis.__reads = 0; read = function (t) { if (t === TAB.submissions) globalThis.__reads++; return r.apply(this, arguments); }; })()');
  const count = () => b.ev('globalThis.__reads');
  b.get({ token: tok[ADA] });
  const c0 = count();
  b.get({ token: tok[ADA] });
  if (count() !== c0) bad.push('a second load with nothing new read the submissions tab again (' + (count() - c0) + ' time(s)) — every page anybody opens would read every press ever made');
  send(ADA, [ev('q:Q-C-2', '10', 'wrong')]);
  const c1 = count();
  const after = b.get({ token: tok[ADA] });
  if (!(count() > c1)) bad.push('the load after a press did not read the tab again — the press would be missing for six hours');
  const m2 = ((after.submissions || {}).mine || {})['q:Q-C-2'];
  if (!m2 || m2.verdict !== 'wrong') bad.push('the load after a press does not carry it: ' + JSON.stringify(m2));
  /* AN EDIT TYPED INTO THE SHEET: the second press's row deleted by hand, and the edit watch bumps the
     generation. The next load must not still say "wrong". */
  const g = b.tabs.submissions;
  g.splice(g.length - 1, 1);
  b.ev('clearPayloadCache()');
  b.ev('clearCache()');
  const edited = b.get({ token: tok[ADA] });
  if (((edited.submissions || {}).mine || {})['q:Q-C-2']) bad.push('a row deleted from the sheet (and the generation bumped) is still in the next load — the per-person copy outlived an edit');
}

/* ---------- 6. NOTHING READS OR WRITES `attempts`, ANYWHERE ------------------------------------------------- */
{
  asked++;
  const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const files = [];
  try {
    fs.readdirSync(path.join(REPO, 'backend')).filter(f => f.endsWith('.gs')).forEach(f => files.push(['backend/' + f, fs.readFileSync(path.join(REPO, 'backend', f), 'utf8')]));
    fs.readdirSync(path.join(REPO, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f)).forEach(f => files.push(['js/' + f, fs.readFileSync(path.join(REPO, 'js', f), 'utf8')]));
  } catch (e) {}
  if (files.length < 20) { console.log('backend/ and js/ could not be read, so NOTHING was checked — not a pass.'); process.exit(1); }
  const RULES = [
    [/\bTAB\.attempts\b|read\(\s*['"]attempts['"]\s*\)/, 'reads the attempts tab'],
    [/\bDATA\.attempts\b|\.attempts\b(?!\s*\()|["']attempts["']\s*[,\]:]/, 'reads or sends `attempts`'],
    [/['"]markDone['"]|action\s*===\s*['"]markDone/, 'names the markDone action'],
    [/['"]attemptWords['"]/, 'names the attemptWords feature'],
    [/\bdoneMark_\b|\battemptsSync_\b|\battemptsFor_\b|\battemptsUpsert_\b/, 'still calls the done-date machinery'],
  ];
  files.forEach(([f, src]) => {
    const code = strip(src);
    RULES.forEach(([re, what]) => { if (re.test(code)) bad.push(f + ' ' + what + ' — it went with the attempts tab (9 Oct)'); });
  });
}

console.log('');
console.log('EVERY ANSWER SENT IS AN EVENT, THROUGH THE REAL doPost AND doGet  (' + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
console.log('\nrules asked: ' + asked);
if (bad.length) {
  console.log('FAILED — a learner’s record is written wrongly, or sent to somebody it does not belong to.');
  process.exit(1);
}
console.log('OK — a row per press, a retry once, the token’s person, text in and text out, the latest per question to its learner alone, nothing retired, and attempts gone.');
