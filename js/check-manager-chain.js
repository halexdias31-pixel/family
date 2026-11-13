#!/usr/bin/env node
/* node js/check-manager-chain.js — THE EXTRA-SEAT SPLIT UP THE MANAGER CHAIN (history 1217): tutor half, chain half,
   loops and admin lessons included; the money to the penny; the backend's refusals and payload. */
'use strict';
require('../check/quiet');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (ok, what) => { asked++; if (!ok) bad.push(what); return !!ok; };

/* THE REAL CALCULATOR, lifted out of js/core.js by name, never a copy. */
const src = fs.readFileSync(path.join(__dirname, 'core.js'), 'utf8');
function lift(name) {
  const i = src.search(new RegExp('^(function ' + name + '\\b|const ' + name + '\\b)', 'm'));
  if (i < 0) throw new Error('js/core.js has no ' + name + ' — renamed?');
  if (src.startsWith('const', i)) return src.slice(i, src.indexOf('\n', i) + 1);
  let depth = 0, k = src.indexOf('{', i);
  for (; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}' && --depth === 0) break; }
  return src.slice(i, k + 1);
}
const box = {};
vm.runInNewContext(['CHAIN_GIVE', 'chainShares_', 'bookMoney_', 'bookShares_'].map(lift).join('\n')
  + '\nthis.chainShares_ = chainShares_; this.bookMoney_ = bookMoney_; this.bookShares_ = bookShares_;', box);
const { chainShares_, bookMoney_, bookShares_ } = box;

const T = (id, manager, role) => ({ personId: id, manager: manager || '', role: role || 'Tutor', title: 'Name ' + id });
const near = (a, b) => Math.abs(a - b) < 1e-12;
const sum = c => c.managers.reduce((a, m) => a + m.share, 0) + c.admin;
const say = c => JSON.stringify({ tutor: c.tutor, managers: c.managers.map(m => m.id + ':' + m.share), admin: c.admin });
function exactly(id, people, want, what) {
  const c = chainShares_(id, people);
  const got = { tutor: c.tutor, managers: c.managers.map(m => m.id + ':' + m.share), admin: c.admin };
  rule(JSON.stringify(got) === JSON.stringify(want), what + ': wanted ' + JSON.stringify(want) + ', got ' + say(c));
  if (c.tutor !== 1) rule(near(c.tutor, 0.5) && near(sum(c), 0.5), what + ': the tutor does not keep half or the chain does not take half — ' + say(c));
  return c;
}

const ADM = T('A', '', 'Admin');
/* THE OWNER'S THREE EXAMPLES. */
exactly('B', [ADM, T('B', 'A')], { tutor: 0.5, managers: [], admin: 0.5 }, 'a tutor directly under the admin');
exactly('B', [ADM, T('B', '')], { tutor: 0.5, managers: [], admin: 0.5 }, 'a blank manager is the admin');
exactly('C', [ADM, T('B', 'A'), T('C', 'B')], { tutor: 0.5, managers: ['B:0.25'], admin: 0.25 }, 'C under B under A');
exactly('D', [ADM, T('B', 'A'), T('C', 'B'), T('D', 'C')], { tutor: 0.5, managers: ['C:0.25', 'B:0.125'], admin: 0.125 }, 'D under C under B under A');
/* THE ADMIN'S OWN LESSONS HAVE NO CUT. */
exactly('A', [ADM, T('B', 'A')], { tutor: 1, managers: [], admin: 0 }, "the admin's own lesson");
/* A MISSING MANAGER, A LOOP, A SELF-LOOP, AND A TUTOR NOBODY KNOWS. */
exactly('B', [ADM, T('B', 'P-GONE')], { tutor: 0.5, managers: [], admin: 0.5 }, 'a manager who is not there');
exactly('C', [ADM, T('B', 'C'), T('C', 'B')], { tutor: 0.5, managers: ['B:0.25'], admin: 0.25 }, 'a loop of two');
exactly('B', [ADM, T('B', 'B')], { tutor: 0.5, managers: [], admin: 0.5 }, 'their own manager');
exactly('Z', [ADM], { tutor: 0.5, managers: [], admin: 0.5 }, 'a tutor nobody sent');
exactly('', [], { tutor: 0.5, managers: [], admin: 0.5 }, 'no tutor chosen');
/* EVERY DEPTH TO 30 AND A LOOP AT THE END OF EACH: still half and half, and nobody twice. */
for (let n = 1; n <= 30; n++) {
  const people = [ADM];
  for (let k = 1; k <= n; k++) people.push(T('t' + k, k === n ? 't1' : 't' + (k + 1)));
  const c = chainShares_('t1', people);
  rule(near(c.tutor, 0.5) && near(sum(c), 0.5), 'a chain of ' + n + ' ending in a loop: ' + say(c));
  rule(new Set(c.managers.map(m => m.id)).size === c.managers.length && c.managers.length === n - 1, 'a chain of ' + n + ' paid someone twice or missed one: ' + say(c));
  if (c.managers.length) rule(near(c.managers[0].share, 0.25), 'a chain of ' + n + ': the direct manager does not get a quarter');
}

/* THE MONEY: £30 of extra seats in a £100 booking, a 10% discount, a room and card fees — shares after all of those. */
const chain = chainShares_('D', [ADM, T('B', 'A'), T('C', 'B'), T('D', 'C')]);
const mo = bookMoney_({ tutorPay: 40 + 15, profit: 45, venue: 12, discount: { type: '%', value: 10 }, feePct: 1.5, feeFixed: 0.2,
  seatMoney: 30, chain });
rule(mo.managers.length === 2 && near(mo.managers[0].amount, 6.75) && near(mo.managers[1].amount, 3.38),
  'the managers did not get 25% and 12.5% of the discounted extra-seat money (£27): ' + JSON.stringify(mo.managers));
rule(near(Math.round((mo.tutorPayout + mo.venue + mo.cardFees + mo.managerTotal + mo.net) * 100) / 100, mo.charged),
  'the client pays is not tutor + room + fees + managers + admin to the penny: ' + JSON.stringify(mo));
const sh = bookShares_({ earn: mo, total: mo.charged, splitShares: 1 });
rule(sh && near(Math.round((sh.tutor + sh.fees + sh.admin + sh.managers.reduce((a, m) => a + m.amount, 0)) * 100) / 100, sh.pays),
  'bookShares_ does not add up with the managers in it: ' + JSON.stringify(sh));
const own = bookMoney_({ tutorPay: 70, profit: 0, seatMoney: 30, chain: chainShares_('A', [ADM]) });
rule(own.managerTotal === 0 && own.managers.length === 0, "the admin's own lesson paid a manager: " + JSON.stringify(own.managers));

/* THE BACKEND: the tutor chooses, the admin may too, never yourself or somebody who is not a tutor; doGet sends it. */
const b = backend({ MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 } });
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', last_name: 'Chaintest', rate_per_hour: 20 };
b.seed('people', [
  Object.assign({}, base, { person_id: 'M-ADM', role: 'admin', first_name: 'Orla', handle: 'orla_mc1', email: 'adm@example.org' }),
  Object.assign({}, base, { person_id: 'M-T1', role: 'tutor', first_name: 'Perrin', handle: 'perrin_mc2', email: 't1@example.org' }),
  Object.assign({}, base, { person_id: 'M-T2', role: 'tutor', first_name: 'Quilla', handle: 'quilla_mc3', email: 't2@example.org' }),
  Object.assign({}, base, { person_id: 'M-C1', role: 'client', first_name: 'Rowan', handle: 'rowan_mc4', email: 'c1@example.org' }),
]);
const tok = e => b.post({ action: 'verifyLogin', email: e, pin: '0000' }).token;
const t1 = tok('t1@example.org');
const save = (token, id, v) => b.post({ token, action: 'updateProfile', targetId: id, fields: { manager: v } });
save(t1, 'M-T1', 'M-T1');
rule(String(b.row('M-T1').manager || '') === '', 'a tutor was saved as their own manager');
save(t1, 'M-T1', 'M-C1');
rule(String(b.row('M-T1').manager || '') === '', 'a client was saved as a manager');
const ok = save(t1, 'M-T1', 'M-T2');
rule(b.row('M-T1').manager === 'M-T2', 'a tutor could not choose another tutor as manager: ' + JSON.stringify(ok));
save(tok('adm@example.org'), 'M-T2', 'M-T1');
rule(b.row('M-T2').manager === 'M-T1', 'the admin could not set a tutor\'s manager');
const sent = (b.get({}).tutors || []).find(x => x.personId === 'M-T1');
rule(sent && sent.manager === 'M-T2', 'doGet does not send the tutor\'s manager: ' + JSON.stringify(sent && sent.manager));

if (bad.length) {
  console.log('FAIL — the manager chain: ' + bad.length + ' of ' + asked);
  bad.forEach(x => console.log('  ' + x));
  process.exit(1);
}
console.log('OK — the manager chain: the tutor keeps half, the chain takes half, to the penny (' + asked + ' asked).');
