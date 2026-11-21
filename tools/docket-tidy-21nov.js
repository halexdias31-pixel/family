#!/usr/bin/env node
/* @family. — tools/docket-tidy-21nov.js THE OWNER'S DOCKET TIDY (rule 1.75, 1.82; owner 21 Nov): the one-off `docket-owner-tidy-21nov` rewrites the owner's
   lists, and a wrong rule would cost the owner their docket's order. backend/access.gs docketOwnerTidy21Nov_ is run as served, then docketTidy_, on a made-up
   docket (generic titles only): no `time` left; one Jesus prayer first in every list; the "arrived home" teeth and room items become one daily each; the
   planner estimates set only where missing, first rule wins; a list's `start` survives. Counted: every rule; one broken fails the build. Run by tools/build.js. */
'use strict';
const { text, report, main } = require('./lib/gen.js');
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
  checks.forEach(([name, f]) => { if (!f()) bad.push(name); });
  console.log('docket-tidy-21nov: ' + checks.length + ' rules through docketOwnerTidy21Nov_ and docketTidy_; ' + bad.length + ' broken');
  report('docket-tidy-21nov', bad, 'docket tidy rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
