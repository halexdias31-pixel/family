#!/usr/bin/env node
/* @family. — tools/docket-plan.js THE NOW, NEXT CHECK (rule 1.75, 1.82; owner 20 Nov): the owner follows the docket's order without deciding, so the order
   must keep its rules. js/map.js dkPlan_ is run as served on fixed sample lists: an item at a fixed time keeps it, what runs by itself goes first (the longest
   first), a deadline beats no deadline, must beats normal, a hard item is followed by an easy one, done items go last, and the same input gives the same order.
   THE WHOLE DAY (owner, 21 Nov): dkPhase_ on fixed phase lists (eyes open, feet on floor, shower, desk): the clock picks the list, ticking a list's last item
   moves on, a list skipped moves on when its time passes and its unticked items carry over marked missed, a list with no start is no phase.
   Counted: every case printed; one broken fails the build. Run by tools/build.js. */
'use strict';
const { ROOT, report, main } = require('./lib/gen.js');
const fs = require('fs'), path = require('path');
/* A FUNCTION, and the one-line helpers it reads (dkRep_, dkOn_: EVERY 8 HOURS, owner 25 Nov) as function declarations, so two functions may both bring them. */
const HELPERS = ['dkRep_', 'dkOn_'];
const fnOf = (src, name) => { const m = new RegExp('\\nfunction ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src);
  if (!m) throw new Error('docket-plan: no ' + name + ' in js/map.js');
  return HELPERS.filter(h => new RegExp('\\b' + h + '\\(').test(m[0])).map(h => { const c = new RegExp('\\nconst ' + h + ' = (.*);\\n').exec(src);
    if (!c) throw new Error('docket-plan: no ' + h); return 'function ' + h + '(...a) { return (' + c[1] + ')(...a); }\n'; }).join('') + m[0]; };
function planner() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'map.js'), 'utf8');
  return new Function(fnOf(src, 'dkPlan_') + fnOf(src, 'dkPhase_') + '; return [dkPlan_, dkPhase_];')();
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
  /* THE OWNER'S ORDER RULES (21 Nov), from the planner, not the data. */
  { name: 'the Jesus prayer opens the list', items: [{ title: 'email' }, { title: 'laundry', runs: 60 }, { title: 'Jesus prayer', minutes: 2 }, { title: 'call', importance: 'must' }],
    ok: o => o[0] === 'Jesus prayer' },
  { name: 'what runs by itself starts first, after the opener', items: [{ title: 'curls', effort: 'hard', minutes: 10 }, { title: 'charge phone', runs: 120, minutes: 1 }, { title: 'Jesus prayer' }],
    ok: o => o.join() === 'Jesus prayer,charge phone,curls' },
  { name: 'eat before training', items: [{ title: 'pull ups', effort: 'hard', minutes: 10, importance: 'must' }, { title: 'rows', effort: 'hard', minutes: 10 }, { title: 'cook rice', minutes: 2 }, { title: 'eggs' }],
    ok: o => Math.max(o.indexOf('cook rice'), o.indexOf('eggs')) < Math.min(o.indexOf('pull ups'), o.indexOf('rows')) },
  { name: 'workout before shower', items: [{ title: 'shower', minutes: 10 }, { title: 'dips', effort: 'hard', minutes: 10 }, { title: 'read', minutes: 3 }, { title: 'jog', effort: 'hard', minutes: 20, place: 'out' }],
    ok: o => o.indexOf('shower') > Math.max(o.indexOf('dips'), o.indexOf('jog')) },
];
/* THE DAY'S PHASES: a fresh copy per case; `tick` names the titles done today (London's day of NOW). */
const DAY = () => [
  { name: 'Eyes open', start: '06:30', items: [{ title: 'water', repeat: 'daily' }, { title: 'pills', repeat: 'daily' }] },
  { name: 'Feet on floor', start: '07:00', items: [{ title: 'bed', repeat: 'daily' }, { title: 'stretch', repeat: 'daily', minutes: 10 }] },
  { name: 'Shopping', items: [{ title: 'milk' }] },
  { name: 'Shower', start: '07:30', items: [{ title: 'shower', repeat: 'daily', minutes: 10 }] },
  { name: 'Desk', start: '9:00', items: [{ title: 'email', repeat: 'daily' }, { title: 'tax', effort: 'hard', minutes: 30 }] },
];
const PHASES = [
  { name: 'before the first start, the first list', at: '05:10', want: 'Eyes open', next: 'Feet on floor', missed: [] },
  { name: 'the clock picks the list', at: '07:10', tick: ['water', 'pills'], want: 'Feet on floor', next: 'Shower', missed: [] },
  { name: 'ticking the last item moves to the next before its time', at: '06:40', tick: ['water', 'pills'], want: 'Feet on floor', next: 'Shower', missed: [] },
  { name: 'a skipped list moves on when its time passes, its items carried over missed', at: '07:35', tick: ['water'], want: 'Shower', next: 'Desk', missed: ['pills', 'bed', 'stretch'] },
  { name: 'missed come after the current list, in plan order', at: '09:05', tick: ['water', 'pills', 'bed', 'stretch', 'shower'], want: 'Desk', next: '', order: 'tax,email' },
  { name: 'a list with no start is no phase', at: '08:00', tick: ['water', 'pills', 'bed', 'stretch'], want: 'Shower', next: 'Desk', missed: [] },
  { name: 'yesterday\'s ticks are not today\'s', at: '07:05', tick: ['water', 'pills'], tickOn: '2026-11-19', want: 'Feet on floor', missed: ['pills', 'water'] },
  { name: 'all done: the last list, nothing left', at: '10:00', tick: ['water', 'pills', 'bed', 'stretch', 'shower', 'email', 'tax'], want: 'Desk', next: '', over: true },
];
function phaseCase(phase, c) {
  const lists = DAY(), day = NOW.slice(0, 10);
  lists.forEach(L => L.items.forEach(it => { if ((c.tick || []).includes(it.title)) { it.doneOn = c.tickOn || day; if (it.repeat !== 'daily') it.done = true; } }));
  const p = phase(lists, day + ' ' + c.at), name = li => (li == null ? '' : lists[li].name);
  if (!p) return 'no phase found';
  const own = p.rows.filter(r => !r.missed).map(r => lists[r.li].items[r.i].title), miss = p.rows.filter(r => r.missed).map(r => lists[r.li].items[r.i].title);
  const ok = name(p.cur) === c.want && (c.next == null || name(p.next) === c.next) && (!c.missed || miss.join() === c.missed.join())
    && (!c.order || own.join() === c.order) && (c.over == null || p.over === c.over)
    && JSON.stringify(p) === JSON.stringify(phase(JSON.parse(JSON.stringify(lists)), day + ' ' + c.at));
  return ok ? '' : 'at ' + c.at + ': ' + name(p.cur) + ' [' + own.join(', ') + '] missed [' + miss.join(', ') + '], next ' + name(p.next);
}
function run() {
  const [plan, phase] = planner(), bad = [];
  CASES.forEach(c => {
    const a = plan(c.items, NOW), b = plan(JSON.parse(JSON.stringify(c.items)), NOW), o = a.map(i => c.items[i].title);
    const whole = a.length === c.items.length && new Set(a).size === a.length;
    if (!whole || a.join() !== b.join() || !c.ok(o)) bad.push(c.name + ': ' + o.join(', '));
  });
  const nPlan = bad.length;
  PHASES.forEach(c => { const why = phaseCase(phase, c); if (why) bad.push(c.name + ': ' + why); });
  if (phase([{ name: 'x', items: [] }], NOW) !== null) bad.push('lists with no start: a phase was found');
  console.log('docket-plan: ' + CASES.length + ' sample lists through dkPlan_; ' + (CASES.length - nPlan) + ' keep the order rules, ' + nPlan + ' break them');
  console.log('docket-plan: ' + PHASES.length + ' clock times through dkPhase_; ' + (bad.length - nPlan ? PHASES.length - (bad.length - nPlan) : PHASES.length) + ' pick the right list, ' + (bad.length - nPlan) + ' do not');
  report('docket-plan', bad, 'list(s) out of order');
  return { n: CASES.length + PHASES.length, bad: bad.length };
}
module.exports = { run, fnOf, NOW, DAY, PHASES };
main(module, run);
