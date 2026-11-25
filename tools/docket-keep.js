#!/usr/bin/env node
/* @family. — tools/docket-keep.js THE PLANNER'S FIELDS ARE KEPT (rule 1.75, 1.82; owner 21 Nov): an item's minutes, runs, effort, fun, importance, place
   and timeIs (kinds.json docket-item) must survive every save, or the docket's order is lost. backend/post-account.gs todoTidy_ (saveTodo) and
   docketTidy_ (docketImport), both the one list tidy listTidy_,, and js/map.js dkTidy_ (each load), are run as served on an item with every field set off its default.
   Counted: every field through every tidy; one dropped fails the build. Run by tools/build.js. */
'use strict';
const { text, report, main } = require('./lib/gen.js');
const fnOf = (src, name, file) => { const m = new RegExp('\\nfunction ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src);
  if (!m) throw new Error('docket-keep: no ' + name + ' in ' + file); return m[0]; };
function tidies() {
  const gen = text('backend/cards-gen.gs'), m = /\nconst DOCKET_PLAN_FIELDS = .*;\n/.exec(gen);
  if (!m) throw new Error('docket-keep: no DOCKET_PLAN_FIELDS in backend/cards-gen.gs');
  const be = text('backend/post-account.gs'), js = text('js/map.js'), F = 'backend/post-account.gs';
  const back = new Function('const S = v => (v == null ? "" : String(v)).trim(), todayIso_ = () => "2026-11-21";' + m[0] + /\nconst LIST_KINDS = .*;\n/.exec(gen)[0]
    + ['listTidy_', 'listItemTidy_', 'todoTidy_', 'docketTidy_'].map(n => fnOf(be, n, F)).join('') + 'return [DOCKET_PLAN_FIELDS, todoTidy_, docketTidy_];')();
  const dk = new Function('const dkDay_ = () => "2026-11-21";' + /\nconst dkRep_ = .*\n/.exec(js)[0] + /\nconst dkGone_ = .*\n/.exec(js)[0] + fnOf(js, 'dkTidy_', 'js/map.js') + 'return dkTidy_;')();
  return [back[0], back[1], back[2], dk];
}
function run() {
  const [FIELDS, todoTidy, docketTidy, dkTidy] = tidies(), bad = [];
  /* each field set to a value that is not its default: the last other option, or the default plus 7 */
  const item = { title: 'tax' };
  Object.entries(FIELDS).forEach(([k, F]) => { item[k] = F.options ? F.options.filter(o => o !== F.def).pop() : F.def + 7; });
  const want = Object.keys(FIELDS);
  ['minutes', 'runs', 'effort', 'fun', 'importance', 'place', 'timeIs'].forEach(k => { if (!want.includes(k)) bad.push('kinds.json docket-item has no ' + k + ' with a default'); });
  const one = () => [{ name: 'L', items: [Object.assign({}, item)] }];
  const outs = {
    todoTidy_: JSON.parse(todoTidy(JSON.stringify({ lists: one() }))).lists[0].items[0],
    docketTidy_: docketTidy(one())[0].items[0],
    dkTidy_: dkTidy(one())[0].items[0] };
  Object.entries(outs).forEach(([t, o]) => want.forEach(k => { if (o[k] !== item[k]) bad.push(t + ' drops ' + k + ' (' + JSON.stringify(item[k]) + ' became ' + JSON.stringify(o[k]) + ')'); }));
  /* a default is left out of the cell, and a value off the form's list is not kept */
  const dflt = { title: 'tea' }; Object.entries(FIELDS).forEach(([k, F]) => { dflt[k] = F.def; });
  const d = docketTidy([{ name: 'L', items: [dflt] }])[0].items[0];
  const wrong = docketTidy([{ name: 'L', items: [{ title: 'x', effort: 'huge', minutes: -3 }] }])[0].items[0];
  want.forEach(k => { if (k in d) bad.push('docketTidy_ keeps the default ' + k); });
  if ('effort' in wrong || 'minutes' in wrong) bad.push('docketTidy_ keeps a value off the form');
  console.log('docket-keep: ' + want.length + ' planner fields through 3 tidies; ' + bad.length + ' wrong');
  report('docket-keep', bad, 'planner field(s) dropped by a tidy');
  return { n: want.length * 3, bad: bad.length };
}
module.exports = { run };
main(module, run);
