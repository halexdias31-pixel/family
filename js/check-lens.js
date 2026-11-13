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

if (bad.length) { console.log('FAILED — the settings lens:'); bad.forEach(b => console.log('  ' + b)); process.exit(1); }
console.log('OK — ' + seen.size + ' settings functions read whose_(), lensOpen is an admin\'s alone, and a change is logged by id.');
