#!/usr/bin/env node
/* node js/check-hands.js — A HAND UP FROM A QUESTION (455), by the real backend. No flags, no port. */
/* Proves: signed in only, your own hand only, a child may, Staff see the list oldest first and may lower anyone's, 30 minutes and it is gone. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const ok = (cond, rule, msg) => { asked++; if (!cond) bad.push(rule + ' — ' + msg); };

const b = backend({});
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
b.seed('people', [
  Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
  Object.assign({ person_id: 'P-S2', first_name: 'Bo', last_name: 'Pupil', handle: 'bopupil', email: 's2@example.org', role: 'student' }, base),
  Object.assign({ person_id: 'P-T1', first_name: 'Tia', last_name: 'Tutor', handle: 'tiatutor', email: 't1@example.org', role: 'tutor' }, base),
]);
const tok = {};
['s1', 's2', 't1'].forEach(k => { tok[k] = b.post({ action: 'verifyLogin', email: k + '@example.org', pin: '0000' }).token; });
const raise = (who, more) => b.post(Object.assign({ action: 'raiseHand', token: tok[who], on: true, q: 'Q1', label: 'Q1 fractions' }, more || {}));
const hands = who => b.post({ action: 'hands', token: tok[who] });

/* 1. NOT SIGNED IN: refused. */
ok(b.post({ action: 'raiseHand', on: true, q: 'Q1' }).error, 'signed in only', 'a hand with no token was raised');
ok(b.post({ action: 'hands' }).error, 'signed in only', 'the list was read with no token');

/* 2. A CHILD RAISES HER OWN; she sees her own flag and nobody's list. */
const realNow = Date.now;
let now = realNow();
Date.now = () => now;
const r1 = raise('s1');
ok(r1.success && r1.mine && r1.mine.q === 'Q1' && !r1.hands, 'a child may', JSON.stringify(r1));
now += 1000;
raise('s2', { q: 'Q7', label: 'Q7 algebra' });
const kid = hands('s2');
ok(kid.mine && kid.mine.q === 'Q7' && !kid.hands, 'own flag only', 'a child saw ' + JSON.stringify(kid));

/* 3. NOT ANOTHER'S: a child cannot lower or raise a classmate's hand. */
ok(raise('s2', { on: false, for: 'P-S1' }).error, 'own flag only', 'a child lowered a classmate\'s hand');
ok(raise('s2', { for: 'P-S1' }).error, 'own flag only', 'a child raised a hand for a classmate');

/* 4. STAFF SEE WHO, OLDEST FIRST, AND MAY LOWER ONE; the child's next poll finds it gone. */
const list = (hands('t1').hands || []).map(h => h.personId + ':' + h.q);
ok(list.join() === 'P-S1:Q1,P-S2:Q7', 'staff see the list', 'got ' + list.join());
ok(raise('t1', { on: true, for: 'P-S1' }).error, 'staff lower, never raise', 'staff raised a hand for a child');
const done = raise('t1', { on: false, for: 'P-S1' });
ok(done.success && (done.hands || []).length === 1, 'staff can clear others', JSON.stringify(done));
ok(hands('s1').mine === null, 'staff can clear others', 'the child still has her hand up after Done');

/* 5. A CHILD PUTS HER OWN DOWN. */
raise('s1');
ok(raise('s1', { on: false }).mine === null, 'own hand down', 'the hand stayed up');

/* 6. THIRTY MINUTES: an unanswered hand goes down by itself. */
now += 30 * 60 * 1000 + 5;
ok((hands('t1').hands || []).length === 0 && hands('s2').mine === null, 'TTL', 'a hand outlived 30 minutes');
Date.now = realNow;

if (bad.length) { console.log('check-hands: FAILED\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-hands: ' + asked + ' asked, all hold — signed in, own hand only, staff list oldest first and Done, 30-minute TTL');
