#!/usr/bin/env node
/* @family. — check-lens.js THE ADMIN'S LENS (rules.json 9.7): every settings card reads `whose_()`, never USER, and only an admin may open it. */
'use strict';
require('../check/quiet');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const { pieceFiles } = require('../tools/piece-src.js');
const bad = [];

/* ---------- 1. THE CARDS: every function the three settings columns reach, read off me-*.js, with no USER in it ----------
   Walked from the columns' builders, so a card added later is read the day it is called. */
const ROOTS = ['familyPages_', 'staffPages_', 'studentSetPages_'];
/* THE SESSION'S OWN: signing in and out, your own refresh and links, and the shut placeholder that swaps USER on purpose. */
const SESSION = { lockedAs_: 1, mountGoogleWhenDrawn: 1, profileRefresh_: 1, signedIn_: 1, SIGN_IN_REFUSED: 1, signedOut_: 1,
  verifyFromLink_: 1, paidFromLink_: 1 };
const defs = Object.create(null);
pieceFiles('me', ROOT).forEach(f => {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8'), at = [];
  for (const m of s.matchAll(/^(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=)/gm)) at.push({ n: m[1] || m[2], i: m.index });
  /* A BODY ENDS AT THE NEXT LINE IN COLUMN 0 — an `on(...)` handler after a function is a press, not the card. */
  at.forEach((d, k) => { const all = s.slice(d.i, k + 1 < at.length ? at[k + 1].i : s.length), cut = /\n[A-Za-z_$[]/.exec(all.slice(1));
    defs[d.n] = { f, body: cut ? all.slice(0, cut.index + 1) : all }; });
});
const code = b => b.replace(/\/\*[\s\S]*?\*\//g, '').replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
const seen = new Set(), q = ROOTS.slice();
ROOTS.forEach(n => { if (!defs[n]) bad.push('the settings builder ' + n + ' is gone — the walk has no root'); });
while (q.length) {
  const n = q.shift();
  if (seen.has(n) || !defs[n]) continue;
  seen.add(n);
  for (const m of code(defs[n].body).matchAll(/\b(\w+)\b/g)) if (defs[m[1]] && !seen.has(m[1])) q.push(m[1]);
}
/* YOU ASK: the asker's own name and id on a request are the session's, not whose card it is. */
const ASKER = /\b(name|personId):\s*\(?USER(\s*&&\s*USER)?\.(name|personId)\)?/g;
/* AND YOUR OWN STORED COPY, written only when the card is yours (`W === USER`). */
const KEPT = /localStorage\.setItem\('familyUser', JSON\.stringify\(USER\)\)|\bW === USER\b|whose_\(\) !== USER/g;
seen.forEach(n => {
  if (SESSION[n]) return;
  const c = code(defs[n].body.replace(KEPT, '')).replace(ASKER, '');
  const hits = c.split('\n').filter(l => /\bUSER\b/.test(l));
  hits.forEach(l => bad.push(defs[n].f + ' ' + n + ' reads USER on a settings card — read whose_(): ' + l.trim().slice(0, 120)));
});
if (seen.size < 20) bad.push('the walk from the settings builders reached only ' + seen.size + ' functions — the reader is broken');

/* ---------- 2. THE TABLE: `lensOpen` is an admin's alone ---------- */
const perm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'permissions.json'), 'utf8'));
const rows = perm.filter(r => r && r.kind === 'action' && r.action === 'lensOpen');
if (rows.length !== 4) bad.push('permissions.json has ' + rows.length + ' lensOpen rows, not one per role');
rows.forEach(r => { if (r.allow !== (r.role === 'admin')) bad.push('permissions.json lets ' + r.role + ' ' + (r.allow ? '' : 'not ') + 'use lensOpen'); });

/* ---------- 3. THE REAL BACKEND: a non-admin is refused, an admin is answered with no secrets, and a change is logged by id ---------- */
const real = require('./check-gas-load.js').backend();
const P = (id, first, role, email) => ({ person_id: id, first_name: first, last_name: 'Lens', handle: first.toLowerCase(), email, role, pin: '0000', verified: 'TRUE', listed: true });
real.seed('people', [P('P-A1', 'Hal', 'admin', 'admin@example.org'), P('P-T1', 'Ada', 'tutor', 'tutor@example.org'),
  P('P-C1', 'Pat', 'client', 'parent@example.org')]);
const sign = email => real.post({ action: 'verifyLogin', email, pin: '0000' });
const a = sign('admin@example.org'), t = sign('tutor@example.org');
if (!a.success || !t.success) bad.push('the seeded admin or tutor could not sign in to the real backend');
else {
  const no = real.post({ action: 'lensOpen', token: t.token, name: t.name, personId: t.personId, targetId: 'P-C1' });
  if (no.success || no.profile) bad.push('a tutor opened somebody else\'s settings with lensOpen');
  const anon = real.post({ action: 'lensOpen', name: 'x', personId: 'P-A1', targetId: 'P-C1' });
  if (anon.success) bad.push('lensOpen with no session was answered');
  const yes = real.post({ action: 'lensOpen', token: a.token, name: a.name, personId: a.personId, targetId: 'P-C1' });
  if (!yes.success || yes.personId !== 'P-C1' || !yes.profile) bad.push('an admin\'s lensOpen for P-C1 was not answered: ' + JSON.stringify(yes).slice(0, 160));
  if (/"(pin|pin_hash|token)"\s*:/.test(JSON.stringify(yes))) bad.push('lensOpen sent a PIN or a token');
  const tu = real.post({ action: 'updateProfile', token: t.token, name: t.name, personId: t.personId, target: 'Pat', targetId: 'P-C1', fields: { city: 'Nope' } });
  if (tu.success) bad.push('a tutor wrote a parent\'s row through updateProfile');
  const ad = real.post({ action: 'updateProfile', token: a.token, name: a.name, personId: a.personId, target: 'Pat', targetId: 'P-C1', fields: { city: 'Leeds' } });
  if (!ad.success) bad.push('an admin could not write the parent\'s row: ' + (ad.error || ''));
  const log = (real.tabs.lens_log || []).slice(1);
  const h = (real.tabs.lens_log || [[]])[0];
  const row = log.map(r => ({ by: r[h.indexOf('by_id')], for: r[h.indexOf('for_id')], f: r[h.indexOf('fields')] })).find(r => r.for === 'P-C1');
  if (!row || row.by !== 'P-A1' || !/city/.test(String(row.f))) bad.push('the admin\'s change to P-C1 left no lens_log row naming P-A1 and city: ' + JSON.stringify(log));
  if (log.some(r => String(r).indexOf('Leeds') !== -1)) bad.push('lens_log holds a value, not only the field name');
}

/* ---------- 4. ONE WAY TO THE SERVER (step 2, slice 2): readItems reads people, answers and messages as the old doors did, and no further ---------- */
{
  const r2 = require('./check-gas-load.js').backend();
  const Q = (id, first, role, email, more) => Object.assign(P(id, first, role, email), more || {});
  r2.seed('people', [Q('P-A1', 'Hal', 'admin', 'admin@example.org'), Q('P-C1', 'Pat', 'client', 'parent@example.org'),
    Q('P-C2', 'Rae', 'client', 'other@example.org'), Q('P-K1', 'Kit', 'student', 'kit@example.org', { date_of_birth: '01/03/2014' }),
    Q('P-K2', 'Lou', 'student', 'lou@example.org', { date_of_birth: '01/03/2014' })]);
  r2.seed('family', [{ link_id: 'L1', parent_id: 'P-C1', child_id: 'P-K1', state: 'accepted' }, { link_id: 'L2', parent_id: 'P-C2', child_id: 'P-K2', state: 'accepted' }]);
  const in2 = email => r2.post({ action: 'verifyLogin', email, pin: '0000' });
  const ad = in2('admin@example.org'), pa = in2('parent@example.org'), ki = in2('kit@example.org');
  const ask = (who, o) => r2.post(Object.assign({ action: 'readItems', token: who.token, name: who.name, personId: who.personId }, o));
  const old = (who, o) => r2.post(Object.assign({ token: who.token, name: who.name, personId: who.personId }, o));
  const strip = d => JSON.stringify(d, (k, v) => (k === 'gapMs' ? undefined : v));
  if (!ad.success || !pa.success || !ki.success) bad.push('readItems: the seeded admin, parent or child could not sign in: ' + [ad, pa, ki].map(x => x.error || 'ok').join(' / '));
  else {
    /* SIGNED OUT: refused, every kind. */
    ['profile', 'answer', 'message', 'person', 'card'].forEach(k => {
      const d = r2.post({ action: 'readItems', kind: k, personId: 'P-K1', ids: ['P-K1'] });
      if (d.success || !d.error) bad.push('readItems ' + k + ' answered somebody signed out: ' + JSON.stringify(d).slice(0, 120));
    });
    /* YOUR OWN: exactly the old door's reply. */
    [[pa, 'profile', 'myProfile'], [ki, 'profile', 'myProfile'], [ki, 'answer', 'myAnswers'], [pa, 'message', 'messages']].forEach(([w, k, o]) => {
      const n = ask(w, { kind: k }), b = old(w, { action: o });
      if (!n.success || strip(n) !== strip(b)) bad.push('readItems ' + k + ' for ' + w.personId + ' is not what ' + o + ' sends: ' + JSON.stringify(n).slice(0, 160));
    });
    /* A CHILD READS NOBODY ELSE, by any kind. */
    [['profile', 'P-K2'], ['profile', 'P-C1'], ['answer', 'P-K2'], ['message', 'P-C1'], ['person', 'P-K2'], ['card', 'P-K2']].forEach(([k, id]) => {
      const d = ask(ki, { kind: k, ids: [id] });
      if (d.success || /"(profile|person|answers|messages)"\s*:/.test(JSON.stringify(d))) bad.push('a child read ' + id + '\'s ' + k + ' through readItems: ' + JSON.stringify(d).slice(0, 140));
    });
    /* A PARENT, AS BEFORE: no old read door gave a parent a person's row — not her own child's, not another's — and readItems gives none. */
    [['profile', 'P-K1'], ['profile', 'P-K2'], ['card', 'P-K1'], ['person', 'P-K1'], ['answer', 'P-K1'], ['message', 'P-K2']].forEach(([k, id]) => {
      const d = ask(pa, { kind: k, ids: [id] });
      if (d.success) bad.push('a parent read ' + id + '\'s ' + k + ' through readItems: ' + JSON.stringify(d).slice(0, 140));
    });
    ['lensOpen', 'getProfile', 'personGet'].forEach(o => { if (old(pa, { action: o, targetId: 'P-K1', target: 'P-K1' }).success) bad.push('the old ' + o + ' answered a parent — the "as before" this check holds readItems to has moved'); });
    /* THE ADMIN: somebody else's settings as lensOpen sends them, no secrets, and logged by id. */
    const before = (r2.tabs.lens_log || [[]]).length;
    const lens = ask(ad, { kind: 'profile', ids: ['P-K1'] }), was = old(ad, { action: 'lensOpen', targetId: 'P-K1' });
    if (!lens.success || lens.personId !== 'P-K1' || strip(lens) !== strip(was)) bad.push('an admin\'s readItems profile for P-K1 is not lensOpen\'s reply: ' + JSON.stringify(lens).slice(0, 160));
    if (/"(pin|pin_hash|token)"\s*:/.test(JSON.stringify(lens))) bad.push('readItems profile sent a PIN or a token');
    const lh = (r2.tabs.lens_log || [[]])[0], lr = (r2.tabs.lens_log || []).slice(Math.max(1, before));
    if (!lr.some(r => r[lh.indexOf('by_id')] === 'P-A1' && r[lh.indexOf('for_id')] === 'P-K1')) bad.push('an admin\'s readItems lens on P-K1 left no lens_log row by id: ' + JSON.stringify(r2.tabs.lens_log || []).slice(0, 200));
    const pg = ask(ad, { kind: 'person', ids: ['P-K1'] }), pgo = old(ad, { action: 'personGet', targetId: 'P-K1' });
    if (!pg.success || strip(pg) !== strip(pgo)) bad.push('an admin\'s readItems person is not personGet\'s reply');
    const cd = ask(ad, { kind: 'card', ids: ['P-K1'] }), cdo = old(ad, { action: 'getProfile', target: 'P-K1' });
    if (!cd.success || strip(cd) !== strip(cdo)) bad.push('an admin\'s readItems card is not getProfile\'s reply');
    if (ask(ad, { kind: 'answer', ids: ['P-K1'] }).success) bad.push('readItems gave an admin somebody else\'s answers, which myAnswers never did');
    if (ask(ad, { kind: 'profile', ids: ['P-K1', 'P-K2'] }).success) bad.push('readItems read two people in one call');
  }
}

/* ---------- 5. ONE WAY TO THE SERVER (step 2, slice 3): saveItem and deleteItem write what the old doors wrote, and no further ---------- */
/* Two backends seeded alike: the old door in one, the general door in the other; every tab must come out the same (times and tokens aside). */
const W5 = (() => {
  const Q = (id, first, role, email, more) => Object.assign(P(id, first, role, email), more || {});
  const fresh = () => {
    const r = require('./check-gas-load.js').backend();
    r.seed('people', [Q('P-A1', 'Hal', 'admin', 'admin@example.org'), Q('P-C1', 'Pat', 'client', 'parent@example.org'),
      Q('P-C2', 'Rae', 'client', 'other@example.org'), Q('P-K1', 'Kit', 'student', 'kit@example.org', { date_of_birth: '01/03/2014' }),
      Q('P-K2', 'Lou', 'student', 'lou@example.org', { date_of_birth: '01/03/2014' })]);
    r.seed('family', [{ link_id: 'L1', parent_id: 'P-C1', child_id: 'P-K1', state: 'accepted' }, { link_id: 'L2', parent_id: 'P-C2', child_id: 'P-K2', state: 'accepted' }]);
    r.seed('messages', [{ message_id: 'M-1', from_id: 'P-A1', to_id: 'P-K1', body: 'hello' }, { message_id: 'M-2', from_id: 'P-A1', to_id: 'P-K2', body: 'hi' }]);
    const who = {};
    [['ad', 'admin@example.org'], ['pa', 'parent@example.org'], ['ki', 'kit@example.org']].forEach(([k, e]) => { who[k] = r.post({ action: 'verifyLogin', email: e, pin: '0000' }); });
    return { r, who };
  };
  /* THE TABS, with each backend's tokens, hashes and clock taken out: what is left is what the request wrote. */
  const sheet = b => {
    let s = JSON.stringify(b.r.tabs);
    Object.values(b.who).forEach(w => { if (w && w.token) s = s.split(w.token).join('TOKEN'); });
    return s.replace(/"\d{4}-\d\d-\d\dT[\d:.]+Z"/g, '"T"').replace(/\b1\d{12}(-\d{1,6}\b)?/g, 'N').replace(/"[0-9a-f]{32,}"/g, '"H"');
  };
  const reply = d => JSON.stringify(d, (k, v) => (k === 'gapMs' ? undefined : v)).replace(/"\d{4}-\d\d-\d\dT[\d:.]+Z"/g, '"T"').replace(/\b1\d{12}\b/g, 'N');
  return { fresh, sheet, reply };
})();
{
  const SAVE = { profile: 'updateProfile', notepad: 'saveNotepad', todo: 'saveTodo', notify: 'setNotify', answer: 'saveAnswers',
    favourite: 'favourite', message: 'readMessage', post: 'editPost', layout: 'layoutSave', words: 'wordsSave',
    listed: 'setListed', person: 'personSave', spotlight: 'spotlight', ownerAnswer: 'saveOwnerAnswer' };
  const DEL = { post: 'deletePost', person: 'personDelete' };
  const ADMIN_ONLY = ['layout', 'words', 'listed', 'person', 'spotlight', 'ownerAnswer'];
  /* ONE REQUEST PER KIND, as the site sends it; the third field says who signs it. */
  const CASES = [
    ['save', 'profile', 'ki', w => ({ target: w.name, targetId: w.personId, fields: { city: 'York' } })],
    ['save', 'notepad', 'ki', () => ({ notepad: 'my note' })],
    ['save', 'todo', 'pa', () => ({ todo: JSON.stringify([{ t: 'milk' }]) })],
    ['save', 'notify', 'pa', () => ({ kind: 'messages', on: false })],
    ['save', 'answer', 'ki', () => ({ items: [{ key: 'q:Q-1|a', v: 'forty-two', at: 1760000000000 }, { key: 'pad:Q-2', v: 'x = 3', at: 1760000000001 }] })],
    ['save', 'favourite', 'ki', () => ({ kind: 'item', itemId: 'q:Q-1', on: 'TRUE' })],
    ['save', 'message', 'ki', () => ({ messageId: 'M-1' })],
    ['save', 'layout', 'ad', () => ({ layout: JSON.stringify({ order: ['a', 'b'] }) })],
    ['save', 'words', 'ad', () => ({ set: { 'hello.title': 'Hi' }, reset: [] })],
    ['save', 'listed', 'ad', () => ({ who: 'Pat Lens', whoId: 'P-C1', on: false })],
    ['save', 'person', 'ad', () => ({ targetId: 'P-K2', firstName: 'Louise', lastName: 'Lens' })],
    ['save', 'spotlight', 'ad', () => ({ kind: 'item', itemId: 'q:Q-1', on: 'TRUE' })],
    ['save', 'ownerAnswer', 'ad', () => ({ id: 'q-one', choice: 'a', note: '' })],
    ['save', 'post', 'ki', () => ({ id: 'X-1', fields: { title: 't' } })],
    ['delete', 'post', 'ki', () => ({ id: 'X-1' })],
    ['delete', 'person', 'ad', () => ({ targetId: 'P-K2' })],
  ];
  const gen = { save: 'saveItem', delete: 'deleteItem' };
  const base = w => ({ token: w.token, name: w.name, personId: w.personId });
  let wrote = 0;
  CASES.forEach(([verb, item, as, f]) => {
    const old = (verb === 'save' ? SAVE : DEL)[item];
    const A = W5.fresh(), B = W5.fresh(), C = W5.fresh();
    const wa = A.who[as], wb = B.who[as], wc = C.who[as];
    if (!wa.success || !wb.success || !wc.success) { bad.push(gen[verb] + ' ' + item + ': ' + as + ' could not sign in'); return; }
    const pre = W5.sheet(A);
    const da = A.r.post(Object.assign(base(wa), f(wa), { action: old }));
    const db = B.r.post(Object.assign(base(wb), f(wb), { action: gen[verb], item }));
    C.r.post(Object.assign(base(wc), f(wc), { action: old }));
    /* THE COMPARISON ITSELF IS HONEST: the old door twice gives the same tabs, or this kind cannot be compared. */
    if (W5.sheet(A) !== W5.sheet(C)) { bad.push(gen[verb] + ' ' + item + ': the old door twice does not give the same tabs — the comparison is noise'); return; }
    if (W5.reply(da) !== W5.reply(db)) bad.push(gen[verb] + ' ' + item + ' replied ' + W5.reply(db).slice(0, 140) + ', and ' + old + ' ' + W5.reply(da).slice(0, 140));
    if (W5.sheet(A) !== W5.sheet(B)) bad.push(gen[verb] + ' ' + item + ' wrote other cells than ' + old + ' did');
    if (W5.sheet(A) !== pre) wrote++;
    /* A LEARNER'S ANSWERS: the case must really write, or it proves nothing. */
    if (item === 'answer' && (!da.success || W5.sheet(A) === pre)) bad.push('saveAnswers did not write the test answers — the answer case proves nothing: ' + JSON.stringify(da).slice(0, 140));
  });
  if (wrote < 10) bad.push('only ' + wrote + ' of ' + CASES.length + ' saveItem/deleteItem cases wrote anything — the requests are wrong, so the comparison proves little');
  /* SIGNED OUT, WRONG ROLE: refused, and nothing written. */
  const T = W5.fresh(), { ad, pa, ki } = T.who;
  const ask = (w, o) => T.r.post(Object.assign(w ? base(w) : { personId: 'P-K1', name: 'Kit Lens' }, o));
  const before = W5.sheet(T);
  CASES.forEach(([verb, item, as, f]) => {
    const d = ask(null, Object.assign(f(T.who[as]), { action: gen[verb], item }));
    if (d.success || d.why !== 'signed-out') bad.push(gen[verb] + ' ' + item + ' answered somebody signed out: ' + JSON.stringify(d).slice(0, 120));
  });
  [['save', ADMIN_ONLY], ['delete', ['person']]].forEach(([verb, kinds]) => kinds.forEach(item => [pa, ki].forEach(w => {
    const c = CASES.find(x => x[0] === verb && x[1] === item);
    const d = ask(w, Object.assign(c[3](w), { action: gen[verb], item }));
    if (d.success || !/Not authorised/.test(d.error || '')) bad.push(w.personId + ' ' + gen[verb] + ' ' + item + ' (an admin\'s alone) was not refused: ' + JSON.stringify(d).slice(0, 120));
  })));
  if (W5.sheet(T) !== before) bad.push('a refused saveItem/deleteItem wrote something');
  /* A CHILD WRITES ONLY HER OWN: another's profile, email choice, message, and answers under another's id. */
  const kp = ask(ki, { action: 'saveItem', item: 'profile', target: 'Lou Lens', targetId: 'P-K2', fields: { city: 'Nope' } });
  if (kp.success || T.r.row('P-K2').city === 'Nope') bad.push('a child saved another child\'s profile through saveItem');
  const pp = ask(pa, { action: 'saveItem', item: 'profile', target: 'Lou Lens', targetId: 'P-K2', fields: { city: 'Nope' } });
  if (pp.success || T.r.row('P-K2').city === 'Nope') bad.push('a parent saved another family\'s child\'s profile through saveItem');
  const kn = ask(ki, { action: 'saveItem', item: 'notify', targetId: 'P-K2', kind: 'messages', on: false });
  if (kn.success) bad.push('a child changed another child\'s email choices through saveItem');
  const km = ask(ki, { action: 'saveItem', item: 'message', messageId: 'M-2' });
  if (km.success) bad.push('a child marked another\'s message read through saveItem');
  if (W5.sheet(T) !== before) bad.push('a child\'s or parent\'s refused write to somebody else\'s row wrote something');
  const ka = ask(ki, { action: 'saveItem', item: 'answer', personId: 'P-K2', items: [{ key: 'q:Q-9|a', v: 'theirs', at: 1760000000000 }] });
  if (JSON.stringify(T.r.tabs.answers || []).indexOf('P-K2') !== -1 || (ka.for && ka.for !== 'P-K1')) bad.push('a child wrote answers under another child\'s id through saveItem');
  /* A KIND THE GENERAL DOORS DO NOT SERVE (the library's own save, any made-up one) is refused by name. */
  ['question', 'nonsense', ''].forEach(k => { const d = ask(ad, { action: 'saveItem', item: k }); if (d.success || d.why !== 'kind') bad.push('saveItem item "' + k + '" was not refused as a kind'); });
  if (ask(ad, { action: 'deleteItem', item: 'profile' }).why !== 'kind') bad.push('deleteItem deleted a profile, which no old door did');
}

if (bad.length) { console.log('FAILED — the settings lens:'); bad.forEach(b => console.log('  ' + b)); process.exit(1); }
console.log('OK — ' + seen.size + ' settings functions read whose_(), lensOpen is an admin\'s alone, a change is logged by id, readItems reads people, answers and messages no wider than the old doors, and saveItem/deleteItem write what the old doors wrote.');
