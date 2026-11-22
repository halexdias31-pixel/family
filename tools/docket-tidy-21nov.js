#!/usr/bin/env node
/* @family. — tools/docket-tidy-21nov.js THE OWNER'S DOCKET TIDY (rule 1.75, 1.82; owner 21 Nov): the one-off `docket-owner-tidy-21nov` rewrites the owner's
   lists, and a wrong rule would cost the owner their docket's order. backend/access.gs docketOwnerTidy21Nov_ is run as served, then docketTidy_, on a made-up
   docket (generic titles only): no `time` left; one Jesus prayer first in every list; the "arrived home" teeth and room items become one daily each; the
   planner estimates set only where missing, first rule wins; a list's `start` survives. And end to end (22 Nov): autoMigrate_ in tools/lib/backend-vm.js on a made-up owner runs `docket-owner-tidy-22nov` under a JSONP request, near DOCKET_CELL_MAX, twice. Counted: every rule; one broken fails the build. Run by tools/build.js. */
'use strict';
const { text, report, main } = require('./lib/gen.js');
const { load, book } = require('./lib/backend-vm.js');
const fnOf = (src, name, file) => { const m = new RegExp('\\nfunction ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src);
  if (!m) throw new Error('docket-tidy-21nov: no ' + name + ' in ' + file); return m[0]; };
const constOf = (src, name, file) => { const m = new RegExp('\\nconst ' + name + ' = [\\s\\S]*?;\\n(?=\\S)').exec(src);
  if (!m) throw new Error('docket-tidy-21nov: no ' + name + ' in ' + file); return m[0]; };
function tidies() {
  const acc = text('backend/access.gs'), be = text('backend/post-account.gs'), gen = text('backend/cards-gen.gs');
  return new Function('const S = v => (v == null ? "" : String(v)).trim();'
    + constOf(gen, 'DOCKET_PLAN_FIELDS', 'backend/cards-gen.gs') + constOf(acc, 'DK21_OPENER', 'backend/access.gs') + constOf(acc, 'DK21_ESTIMATES', 'backend/access.gs')
    + fnOf(acc, 'docketOwnerTidy21Nov_', 'backend/access.gs') + ['docketPlanTidy_', 'docketPlanOf_', 'docketTidy_'].map(n => fnOf(be, n, 'backend/post-account.gs')).join('')
    + 'return [docketOwnerTidy21Nov_, docketTidy_];')();
}
const SAMPLE = () => [
  { name: 'Morning', start: '07:00', items: [{ title: 'jog', time: '07:10' }, { title: 'curls' }, { title: 'take a shower', time: '08:00' },
    { title: 'laundry' }, { title: 'cook rice' }, { title: 'meat' }, { title: 'shopping' }, { title: 'instrument' }, { title: 'floss' },
    { title: 'tidy desk' }, { title: 'charge phone' }, { title: 'creed' }, { title: 'call', note: 'x'.repeat(250) }, { title: 'post', minutes: 30, place: 'out' }] },
  { name: 'Evening', items: [{ title: 'read' }, { title: ' jesus PRAYER ', note: 'first' }, { title: 'Jesus prayer', note: 'second' }] },
  { name: 'Arrived Home', items: [{ title: 'shoes off' }, { title: 'Brush teeth & clean room' }, { title: 'clean room' }, { title: 'brush teeth', time: '21:00' }, { title: 'kettle' }] },
];

/* END TO END (22 Nov: the 21 Nov job was deployed and the owner's docket did not change): autoMigrate_ itself, in the vm, on a made-up owner (an admin
   whose address is config owner_email) with a docket shaped like theirs: ten lists, prayers with long notes, times, the arrived-home duplicates. */
const OWNER = 'owner@example.test', LONG = 'Lord, have mercy. '.repeat(200).trim();
function ownerDocket() {
  return Array.from({ length: 10 }, (_, n) => ({ name: n === 4 ? 'Arrived home' : 'List ' + n, start: String(6 + n).padStart(2, '0') + ':15',
    items: [{ title: 'Morning prayers', note: LONG, time: '06:30', repeat: 'daily' }]
      .concat(Array.from({ length: 12 }, (_, k) => ({ title: 'thing ' + n + '.' + k, note: 'note ' + k, time: String(k + 8).padStart(2, '0') + ':00', ...(k % 3 ? {} : { repeat: 'daily' }) })))
      .concat(n === 2 ? [{ title: 'Jesus prayer', note: 'kept', time: '09:00' }] : [])
      .concat(n === 4 ? [{ title: 'clean room' }, { title: 'brush teeth & clean room', time: '20:00' }, { title: 'brush teeth', time: '21:00' }, { title: 'kettle' }] : []) }));
}
function endToEnd() {
  const ctx = load({ at: true }), B = book(), props = {};
  const person = { person_id: 'P-OWN', role: 'admin', first_name: 'Made', last_name: 'Up', email: OWNER, todo: JSON.stringify({ v: 1, lists: ownerDocket() }) };
  B.tabs.items = B.sheet('items', [['id', 'kind', 'data_1'], ['owner_email', 'setting', JSON.stringify({ key: 'owner_email', value: OWNER })],
    ['P-OTHER', 'person', JSON.stringify({ person_id: 'P-OTHER', role: 'admin', email: 'other@example.test', todo: JSON.stringify({ v: 1, lists: ownerDocket() }) })],
    ['P-OWN', 'person', JSON.stringify(person)]]);
  ctx.findSheet_ = at => B.tabs[at.names[0]] || null;
  ctx.PropertiesService = { getScriptProperties: () => ({ getProperties: () => Object.assign({}, props), getProperty: k => (k in props ? props[k] : null),
    setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; } }) };
  ctx.LockService = { getScriptLock: () => ({ tryLock: () => true, waitLock: () => {}, releaseLock: () => {} }) };
  /* Every other job already done, as on the live site: this one is what is asked. */
  ctx.$('MIGRATIONS').forEach(m => { if (m.id !== 'docket-owner-tidy-22nov') props['MIGRATED_' + m.id] = 'before'; });
  props.SCHEMA_VERSION = ctx.$('BACKEND_VERSION');
  /* An admin's page load is a JSONP request: the job must not depend on what jsonOut answers. */
  ctx.$("JSONP_CB = 'cb'");
  const cellOf = id => JSON.parse(JSON.parse(B.tabs.items.v.find(r => r[0] === id)[2]).todo).lists;
  const run = () => { ctx.clearCache(); return ctx.autoMigrate_(); };
  const first = run() || {}, out = cellOf('P-OWN'), rowsAfter = JSON.stringify(B.tabs.items.v);
  delete props['MIGRATED_docket-owner-tidy-22nov'];
  const second = run() || {}, changedAgain = JSON.stringify(B.tabs.items.v) !== rowsAfter;
  const was = ownerDocket(), key = i => String(i.title).trim().toLowerCase(), arrived = ['clean room', 'brush teeth & clean room', 'brush teeth', 'jesus prayer'];
  const same = (a, b) => a.title === b.title && (a.note || '') === (b.note || '') && (a.repeat || '') === (b.repeat || '') && !!a.done === !!b.done;
  return [
    ['autoMigrate_ runs the job and marks it done', () => !!props['MIGRATED_docket-owner-tidy-22nov'] && !props['FAILED_docket-owner-tidy-22nov']
      && (first.ran || []).some(r => r.id === 'docket-owner-tidy-22nov' && !r.error)],
    ["autoMigrate_: no owner's item keeps a time", () => out.every(L => L.items.every(i => !i.time))],
    ['autoMigrate_: one Jesus prayer opens each list', () => out.every(L => key(L.items[0]) === 'jesus prayer' && L.items.filter(i => key(i) === 'jesus prayer').length === 1)
      && out[2].items[0].note === 'kept'],
    ['autoMigrate_: arrived home merged', () => out[4].items.map(i => i.title).slice(-3).join() === 'brush teeth,clean room,kettle'
      && out[4].items.filter(i => /brush teeth|clean room/.test(key(i))).length === 2],
    ["autoMigrate_: every list's start kept", () => out.every((L, n) => L.start === was[n].start)],
    ['autoMigrate_: every other item and note unchanged', () => out.every((L, n) => {
      const a = L.items.filter(i => arrived.indexOf(key(i)) < 0), b = was[n].items.filter(i => arrived.indexOf(key(i)) < 0);
      return L.name === was[n].name && a.length === b.length && a.every((i, k) => same(i, b[k]));
    })],
    ["autoMigrate_: nobody else's docket touched", () => JSON.stringify(cellOf('P-OTHER')) === JSON.stringify(ownerDocket())],
    ['autoMigrate_: a second run changes nothing', () => !changedAgain && (second.ran || []).every(r => !r.error)],
  ];
}
function run() {
  const [tidy21, docketTidy] = tidies(), bad = [];
  const out = docketTidy(tidy21(SAMPLE())), again = docketTidy(tidy21(JSON.parse(JSON.stringify(out))));
  const find = (L, t) => L.items.find(i => i.title === t) || {};
  const checks = [
    ['no item keeps a time', () => out.every(L => L.items.every(i => !i.time))],
    ['one Jesus prayer first in every list', () => out.every(L => /^jesus prayer$/i.test(L.items[0].title.trim())
      && L.items.filter(i => /^jesus prayer$/i.test(i.title.trim())).length === 1)],
    ['a missing Jesus prayer is added, daily', () => out[0].items[0].title === 'Jesus prayer' && out[0].items[0].repeat === 'daily'],
    ['of several, the first is kept', () => out[1].items[0].note === 'first' && out[1].items[1].title === 'read'],
    ['arrived home: brush teeth and clean room once each, daily, in place', () => out[2].items.map(i => i.title).join() === 'Jesus prayer,shoes off,brush teeth,clean room,kettle'
      && out[2].items.slice(2, 4).every(i => i.repeat === 'daily')],
    ['other lists keep their items', () => out[0].items.length === 15 && out[1].items.length === 2],
    ['estimates by title', () => {
      const L = out[0], want = { jog: [20, 0, 'hard', 'out'], curls: [10, 0, 'hard', 'home'], 'take a shower': [10, 0, '', 'home'], laundry: [5, 60, '', 'home'],
        'cook rice': [2, 0, '', 'home'], meat: [15, 0, '', 'home'], shopping: [20, 0, '', 'out'], instrument: [20, 0, '', 'home'], floss: [2, 0, '', 'home'],
        'tidy desk': [10, 0, '', 'home'], 'charge phone': [1, 120, '', 'home'], 'Jesus prayer': [2, 0, '', ''], creed: [5, 0, '', ''], call: [5, 0, '', ''] };
      return Object.entries(want).every(([t, [m, r, e, p]]) => { const i = find(L, t);
        return (i.minutes || 5) === m && (i.runs || 0) === r && (i.effort || '') === e && (i.place || '') === p; });
    }],
    ['a field already set is kept', () => find(out[0], 'post').minutes === 30 && find(out[0], 'post').place === 'out'],
    ['arrived home estimates', () => find(out[2], 'brush teeth').minutes === 3 && find(out[2], 'clean room').minutes === 10],
    ["a list's start survives", () => out[0].start === '07:00' && !('start' in out[1])],
    ['running it twice does what once did', () => JSON.stringify(again) === JSON.stringify(out)],
  ];
  try { checks.push(...endToEnd()); } catch (e) { checks.push(['autoMigrate_ end to end ran', () => { console.log(e.stack); return false; }]); }
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (e) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-tidy-21nov: ' + checks.length + ' rules through docketOwnerTidy21Nov_ and docketTidy_; ' + bad.length + ' broken');
  report('docket-tidy-21nov', bad, 'docket tidy rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
