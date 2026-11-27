#!/usr/bin/env node
/* @family. — tools/term-events.js TERM DATES ARE EVENTS ON THE ONE TIME LIST, YOUR SHIFT ON YOUR ACCOUNT (rule 1.75; owner 27 Nov: "term dates become
   events in the one time list"; the per-phone "my school starts / ends" moves into the account). js/arcade.js run as served, on a made-up day:
   (1) the events are the one rule's (tdYear_) intervals, each an all-day { title, start, end }, in order from the one in hand;
   (2) a shift kept on the account (the `term` beside the lists in the `todo` cell) moves every term's first and last school day, the breaks with them,
       on any phone (nothing kept on the phone); signed out, the usual dates;
   (3) changing it saves the todo cell with the shift and the lists untouched, against the base it was read from, once again on a stale base;
   (4) the Docket card folds the next ones (js/map.js dkCard_ reads tdEvents_). Each rule proved by mutating the served source. Run by tools/build.js. */
'use strict';
const SD = require('./lib/site-data.js');
const { report, main, text } = require('./lib/gen.js');

const fnOf = (src, n) => { const m = new RegExp('\\nfunction ' + n + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src); if (!m) throw new Error('term-events: no ' + n); return m[0]; };
const lineOf = (src, n) => { const m = new RegExp('\\nconst ' + n + ' = .*;\\n').exec(src); if (!m) throw new Error('term-events: no const ' + n); return m[0]; };
const settings = () => { const s = text('js/core.js'), m = /\nconst SHARED_SETTINGS = (.*);\n/.exec(s); return JSON.parse(m[1]); };
/* THE TERM CODE AS SERVED, with a USER whose todo cell is `todo` and an `api` that answers from `answers` (each call kept). */
function load(src, todo, answers) {
  const env = { SHARED_SETTINGS: settings(), USER: todo === null ? null : { personId: 'P-1', todo }, sent: [], answers: answers || [] };
  const body = 'let TD_MORE = false;\n' + ['tdEaster_', 'tdYear_', 'tdJul_', 'tdYear0_', 'tdShift_', 'tdShiftSave_', 'tdSchoolDays_', 'termDatesRows_'].map(n => fnOf(src, n)).join('')
    + lineOf(src, 'tdIso_') + lineOf(src, 'tdEvents_')
    + 'return { tdYear_, tdEvents_, tdShift_, tdShiftSave_, user: () => USER };';
  const f = new Function('SHARED_SETTINGS', 'USER', 'api', 'todoBase_', 'toast', 'text_', 'saveUser_', 'DK', body);
  const api = b => { env.sent.push(JSON.parse(JSON.stringify(b))); return Promise.resolve(env.answers.shift() || { success: true }); };
  return Object.assign(env, f(env.SHARED_SETTINGS, env.USER, api, s => 'b:' + String(s).length, () => {}, k => k, () => {}, undefined));
}
const DAY = new Date(2026, 10, 28);   // a Saturday in Autumn 2
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const CELL = s => JSON.stringify({ v: 1, lists: [{ name: 'Docket', items: [{ title: 'Made-up item' }] }], term: s });
const RULES = [
  ['(1) the events are the one rule\'s intervals, all day, from the one in hand', M => { const a = M(null), ev = a.tdEvents_(DAY), y = a.tdYear_(2026);
    const i = y.findIndex(x => x.name === 'Autumn 2');
    return ev.length === 4 && ev.every((e, k) => e.title === y[i + k].name && e.start === iso(y[i + k].from) && e.end === iso(y[i + k].to) && e.kind === y[i + k].kind); }],
  ['(2) the account\'s shift moves the first and last school days, the breaks with them', M => { const a = M(null).tdEvents_(DAY, 6), b = M(CELL({ s: 0, e: -1 })).tdEvents_(DAY, 6);
    const sp = M(CELL({ s: 2, e: 0 })).tdEvents_(DAY, 6), au2 = b[0], hol = b[1], plain = a[1];
    return au2.end < a[0].end && hol.start === iso(new Date(+au2.end.slice(0, 4), +au2.end.slice(5, 7) - 1, +au2.end.slice(8, 10) + 1))
      && sp[2].start > a[2].start && sp[1].end > a[1].end && plain.end === a[1].end; }],
  ['(2) signed out, or no shift kept, the usual dates', M => JSON.stringify(M(null).tdEvents_(DAY)) === JSON.stringify(M(CELL(undefined)).tdEvents_(DAY))],
  ['(3) a change saves the todo cell with the shift, the lists untouched, against its base', M => { const a = M(CELL({ s: 0, e: 0 })); a.tdShiftSave_({ s: 1, e: -2 });
    const b = a.sent[0] || {}, t = JSON.parse(b.todo || '{}');
    return a.sent.length === 1 && b.action === 'item' && b.door === 'save' && b.item === 'todo' && b.base === 'b:' + CELL({ s: 0, e: 0 }).length
      && t.term.s === 1 && t.term.e === -2 && t.lists[0].items[0].title === 'Made-up item' && a.tdShift_().e === -2; }],
  ['(3) on a stale base it saves once more onto the server\'s cell', M => { const server = CELL({ s: 0, e: 0 }).replace('Made-up item', 'Made-up server item');
    const a = M(CELL({ s: 0, e: 0 }), [{ stale: true, todo: server, base: 'b:server' }]); a.tdShiftSave_({ s: 3, e: 0 });
    return new Promise(r => setTimeout(r, 0)).then(() => a.sent.length === 2 && a.sent[1].base === 'b:server' && JSON.parse(a.sent[1].todo).lists[0].items[0].title === 'Made-up server item'
      && JSON.parse(a.sent[1].todo).term.s === 3); }],
];
const MUTS = [
  ['the shift ignored', s => s.replace('const t = (o && o.term) || {};', 'const t = {};')],
  ['events not from the shifted rows', s => s.replace('termDatesRows_(today, n || 4).map(x => ({ title: x.name, start: tdIso_(x.from), end: tdIso_(x.to), kind: x.kind }))',
    'tdYear_(2026).slice(0, n || 4).map(x => ({ title: x.name, start: tdIso_(x.from), end: tdIso_(x.to), kind: x.kind }))')],
  ['the lists dropped on a save', s => s.replace('const todo = JSON.stringify(Object.assign(t, { term: o }));', 'const todo = JSON.stringify({ v: 1, lists: [], term: o });')],
  ['no retry on a stale base', s => s.replace('if (d && d.stale && again) return put(', 'if (false) return put(')],
  ['the base not sent', s => s.replace("item: 'todo', personId: USER.personId, todo, base }", "item: 'todo', personId: USER.personId, todo }")],
  ['the breaks not moved with the terms', s => s.replace('if (all[i + 1]) all[i + 1].from =', 'if (false) all[i + 1].from =')],
];
async function holds(src) { const M = (todo, answers) => load(src, todo, answers);
  for (const [, f] of RULES) { let ok = false; try { ok = await f(M); } catch (e) { ok = false; } if (!ok) return false; } return true; }
async function run() {
  const bad = [], src = text('js/arcade.js'), map = text('js/map.js'), data = text('js/data.js');
  const M = (todo, answers) => load(src, todo, answers);
  for (const [n, f] of RULES) { let ok = false; try { ok = await f(M); } catch (e) { ok = false; } if (!ok) bad.push(n); }
  let missed = [];
  for (const m of MUTS) { const s2 = m[1](src); if (s2 === src || await holds(s2)) missed.push(m[0]); }
  if (missed.length || process.argv.includes('--prove')) console.log('  --prove: ' + (MUTS.length - missed.length) + '/' + MUTS.length + ' breaks caught' + (missed.length ? '; missed ' + missed.join(', ') : ''));
  if (missed.length) bad.push('every mutation caught');
  if (/familyTermShift/.test(src + data)) bad.push('(2) the shift is still kept on the phone');
  if (!/tdEvents_\(\)/.test(fnOf(map, 'dkCard_'))) bad.push('(4) the Docket card does not fold the term-date events');
  if (!SD.kinds().docket) bad.push('no docket kind');
  console.log('term-events: ' + (RULES.length + 3) + ' rules (the one rule\'s events, the account\'s shift, its save, the Docket card); ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('term-events', bad, 'term-date event rule(s) broken');
  return { n: RULES.length + 3, bad: bad.length };
}
module.exports = { run };
main(module, run);
