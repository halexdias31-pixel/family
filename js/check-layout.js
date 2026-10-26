#!/usr/bin/env node
/* node js/check-layout.js — EDIT LAYOUT (462): `layoutSave` keeps a checked value on config's
   `layout` row for an admin only, refuses rubbish and size, and doGet sends it parsed as `layout`. -v for the detail. */
'use strict';
require('../check/quiet');
const { backend } = require('./check-gas-load.js');

const base = { pin: '0000', verified: 'TRUE', listed: true };
const PEOPLE = [
  Object.assign({}, base, { person_id: 'P-A1', role: 'admin', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'admin@example.org' }),
  Object.assign({}, base, { person_id: 'P-C1', role: 'client', first_name: 'Pat', last_name: 'Parent', handle: 'patparent', email: 'parent@example.org' }),
  Object.assign({}, base, { person_id: 'P-T1', role: 'tutor', first_name: 'Ada', last_name: 'Tutor', handle: 'adatutor', email: 'tutor@example.org' }),
];
const bad = [];
let asked = 0;
const b = backend();
b.seed('people', PEOPLE);
const tok = {};
PEOPLE.forEach(p => { const d = b.post({ action: 'verifyLogin', email: p.email, pin: '0000' }); if (d.success) tok[p.person_id] = d.token; });
if (!tok['P-A1']) { console.log('check-layout: the admin could not sign in, so NOTHING was checked — not a pass.'); process.exit(1); }
const save = (who, extra) => b.post(Object.assign({ action: 'layoutSave', token: tok[who], personId: who }, extra));
const cell = () => {
  const t = b.tabs.config, h = t[0];
  const r = t.find((x, i) => i > 0 && x[h.indexOf('key')] === 'layout');
  return r ? r[h.indexOf('value')] : undefined;
};
const GOOD = { columns: ['games', 'feed', 'tools'], widgets: { tools: ['calc', 'console'], games: ['notepad'] }, hidden: ['flappy'], deleted: ['wordgames'] };

/* 1. NOBODY BUT AN ADMIN — a parent, a tutor, no token, a parent naming the admin's id. */
['P-C1', 'P-T1'].forEach(id => { asked++; const d = save(id, { layout: GOOD }); if (d.success || cell()) bad.push(id + ' saved a layout: ' + JSON.stringify(d)); });
asked++; { const d = b.post({ action: 'layoutSave', layout: GOOD }); if (d.success || cell()) bad.push('no token saved a layout'); }
asked++; { const d = b.post({ action: 'layoutSave', token: tok['P-C1'], personId: 'P-A1', layout: GOOD }); if (d.success || cell()) bad.push('a parent claiming the admin id saved a layout'); }
asked++; if (b.ev('ACTION_ACCESS.layoutSave') !== 'admin') bad.push('ACTION_ACCESS.layoutSave is not admin');

/* 2. AN ADMIN'S IS KEPT, CLEANED, AND SENT PARSED; config's vars do not carry it twice. */
asked++;
{
  const d = save('P-A1', { layout: Object.assign({ junk: 'x' }, GOOD, { columns: GOOD.columns.concat(['<b>', 'games']) }) });
  const got = JSON.parse(cell() || 'null');
  if (!d.success || !got || got.junk || got.columns.join() !== 'games,feed,tools' || got.deleted.join() !== 'wordgames') bad.push('the admin\'s layout was kept as ' + cell());
}
asked++;
{
  const g = b.get({});
  if (!g.layout || g.layout.widgets.tools.join() !== 'calc,console' || g.layout.hidden.join() !== 'flappy') bad.push('doGet sent layout ' + JSON.stringify(g.layout));
  if (g.constants && g.constants.vars && 'layout' in g.constants.vars) bad.push('doGet sent the layout twice, in constants.vars too');
}

/* 3. RUBBISH AND TOO BIG ARE REFUSED, AND THE KEPT VALUE STAYS. */
const kept = cell();
[['a string that is not JSON', '{nope'], ['an array', [1, 2]], ['a number', 7],
 ['a 9000-character string', JSON.stringify({ columns: Array(1000).fill('abcdefgh') })]].forEach(([what, v]) => {
  asked++;
  const d = save('P-A1', { layout: v });
  if (d.success || cell() !== kept) bad.push(what + ' was answered ' + JSON.stringify(d).slice(0, 120));
});
asked++;
{
  const d = save('P-A1', { layout: { columns: Array.from({ length: 300 }, (_, i) => 'col' + i + 'x'.repeat(50)) } });
  if (d.success && String(cell()).length > 8000) bad.push('a layout over the cap was kept, ' + String(cell()).length + ' characters');
}

/* 4. RESET EMPTIES THE CELL, AND doGet SENDS null. */
asked++; { const d = save('P-A1', { reset: 'TRUE' }); if (!d.success || cell() !== '') bad.push('reset left ' + JSON.stringify(cell())); }
asked++; { const g = b.get({}); if (g.layout !== null) bad.push('after a reset doGet sent layout ' + JSON.stringify(g.layout)); }

console.log('layout: ' + asked + ' asked, ' + bad.length + ' wrong');
bad.forEach(x => console.log('  ' + x));
if (bad.length) { console.log('FAILED — the site-wide layout must be an admin\'s alone, and always a value the site can read.'); process.exit(1); }
console.log('OK — layoutSave keeps a checked layout for an admin only, refuses rubbish and size, resets, and doGet sends it once.');
