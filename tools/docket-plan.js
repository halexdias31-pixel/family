#!/usr/bin/env node
/* @family. — tools/docket-plan.js THE NOW, NEXT CHECK (rule 1.75, 1.82; owner 20 Nov): the owner follows the docket's order without deciding, so the order
   must keep its rules. js/map.js dkPlan_ is run as served on fixed sample lists: an item at a fixed time keeps it, what runs by itself goes first (the longest
   first), a deadline beats no deadline, must beats normal, a hard item is followed by an easy one, done items go last, and the same input gives the same order.
   Counted: every case printed; one broken fails the build. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
function planner() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'map.js'), 'utf8'), m = /\nfunction dkPlan_\(items, now\) \{[\s\S]*?\n\}\n/.exec(src);
  if (!m) throw new Error('docket-plan: no dkPlan_ in js/map.js');
  return new Function(m[0] + '; return dkPlan_;')();
}
const NOW = '2026-11-20 09:00';
/* Each case: a list, and what must hold of its order (titles). */
const CASES = [
  { name: 'runs by itself first, longest first', items: [{ title: 'email' }, { title: 'laundry', runs: 60 }, { title: 'dishwasher', runs: 90 }, { title: 'call', importance: 'must' }],
    ok: o => o[0] === 'dishwasher' && o[1] === 'laundry' },
  { name: 'a fixed time is kept: in before what would run past it', items: [{ title: 'a', minutes: 30 }, { title: 'b', minutes: 30 }, { title: 'meeting', time: '09:45', minutes: 15 }, { title: 'c', minutes: 30 }],
    ok: o => o.join() === 'a,meeting,b,c' },
  { name: 'a fixed time already come goes first', items: [{ title: 'laundry', runs: 60 }, { title: 'pills', time: '08:30', repeat: 'daily' }],
    ok: o => o[0] === 'pills' },
  { name: 'closest deadline before none', items: [{ title: 'later', date: '2026-11-25' }, { title: 'none' }, { title: 'soon', time: '11:00', timeIs: 'by' }],
    ok: o => o.join() === 'soon,later,none' },
  { name: 'must, then high, then normal', items: [{ title: 'n' }, { title: 'h', importance: 'high' }, { title: 'm', importance: 'must' }, { title: 'l', importance: 'low' }],
    ok: o => o.join() === 'm,h,n,l' },
  { name: 'hard then easy in turn, short first', items: [{ title: 'tax', effort: 'hard', minutes: 30 }, { title: 'bins', fun: 'dread', minutes: 5 }, { title: 'music', fun: 'enjoy', minutes: 10 }, { title: 'tea', minutes: 3 }],
    ok: o => o.join() === 'bins,tea,tax,music' },
  { name: 'place groups an equal tie', items: [{ title: 'shop', place: 'out' }, { title: 'sweep', place: 'home' }, { title: 'read' }],
    ok: o => o.join() === 'sweep,read,shop' },
  { name: 'done items last', items: [{ title: 'gone', done: true, doneOn: '2026-11-20' }, { title: 'daily done', repeat: 'daily', doneOn: '2026-11-20' }, { title: 'left' }],
    ok: o => o[0] === 'left' },
];
function run() {
  const plan = planner(), bad = [];
  CASES.forEach(c => {
    const a = plan(c.items, NOW), b = plan(JSON.parse(JSON.stringify(c.items)), NOW), o = a.map(i => c.items[i].title);
    const whole = a.length === c.items.length && new Set(a).size === a.length;
    if (!whole || a.join() !== b.join() || !c.ok(o)) bad.push(c.name + ': ' + o.join(', '));
  });
  console.log('docket-plan: ' + CASES.length + ' sample lists through dkPlan_; ' + (CASES.length - bad.length) + ' keep the order rules, ' + bad.length + ' break them');
  bad.forEach(s => console.log('  ' + s));
  if (bad.length) throw new Error('docket-plan: ' + bad.length + ' list(s) out of order');
  return { n: CASES.length, bad: bad.length };
}
module.exports = { run };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
