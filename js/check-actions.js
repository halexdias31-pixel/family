#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-actions.js EVERY doPost ACTION HAS A CALLER (site or tools/, as a quoted name) OR A REASON, and the gate and handlers agree (433). No flags, no port. */
'use strict';
const fs = require('fs'), path = require('path');
const O = path.join(__dirname, '..');
const read = p => { try { return fs.readFileSync(path.join(O, p), 'utf8'); } catch (e) { return ''; } };
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');

/* ---------- A HANDLER NO CODE CALLS, KEPT ON PURPOSE. One sentence each: who reaches it, and why it stays. */
const REASONS = {
  linkChild: 'the one way an admin settles a HELD family link besides typing in the sheet (check-signin proves the '
    + 'address rule on it). Posted by hand for now; no admin card yet (433).',
  digestPreview: 'the Sunday email\'s dry run against the LIVE sheet, posted by hand by an admin (the card went in '
    + 'eef67ad); check-digest proves it writes, sends and books nothing (433).',
};

/* every backend file, so a handler moved out of dopost.gs is still seen */
const gsDir = path.join(O, 'backend');
const gs = fs.existsSync(gsDir) ? fs.readdirSync(gsDir).filter(f => f.endsWith('.gs')) : [];
const backend = gs.map(f => read('backend/' + f)).join('\n');
const consts = read('backend/constants.gs');
/* A CHECK THAT CANNOT REACH ITS SUBJECT FAILS — no backend is not a clean backend. */
if (!gs.length || !consts.includes('const ACTION_ACCESS = {')) {
  console.log('check-actions: backend/*.gs or ACTION_ACCESS not found — nothing was checked');
  process.exit(1);
}

const handlers = new Set([...strip(backend).matchAll(/action === '(\w+)'/g)].map(m => m[1]));
const tbl = consts.slice(consts.indexOf('const ACTION_ACCESS = {'));
const gate = new Set([...strip(tbl.slice(0, tbl.indexOf('\n};'))).matchAll(/(\w+)\s*:\s*'/g)].map(m => m[1]));

/* THE CALLERS: anything that names the action as a quoted string. A ternary (`forNobody ? 'openWaitlist' : …`) counts. */
const jsDir = path.join(O, 'js');
const site = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !/^check/.test(f) && f !== '_scope.js')
  .map(f => 'js/' + f).concat(['index.html', 'sw.js']);
const toolsDir = path.join(O, 'tools');
const tools = fs.existsSync(toolsDir) ? fs.readdirSync(toolsDir).filter(f => /\.(js|py|sh)$/.test(f)).map(f => 'tools/' + f) : [];
const callers = {};
site.concat(tools).forEach(p => {
  const src = strip(read(p));
  for (const m of src.matchAll(/['"`](\w+)['"`]/g)) (callers[m[1]] = callers[m[1]] || new Set()).add(p);
});

const all = [...new Set([...handlers, ...gate])].sort();
const noHandler = [...gate].filter(a => !handlers.has(a)).sort();
const noGate = [...handlers].filter(a => !gate.has(a)).sort();
const uncalled = all.filter(a => handlers.has(a) && !callers[a] && !(a in REASONS));
const kept = all.filter(a => handlers.has(a) && !callers[a] && (a in REASONS));
const staleReason = Object.keys(REASONS).filter(a => !handlers.has(a) || callers[a]);

console.log('  ' + handlers.size + ' handlers, ' + gate.size + ' in ACTION_ACCESS, '
  + (all.length - kept.length - uncalled.length) + ' with a caller, ' + kept.length + ' kept with a reason');
console.log('');
console.log('A HANDLER NOTHING CALLS AND NOBODY HAS GIVEN A REASON FOR  (' + uncalled.length + ')');
console.log(uncalled.length ? uncalled.map(a => '  ' + a + '  — delete it, or add one sentence to REASONS in js/check-actions.js').join('\n') : '  none');
console.log('');
console.log('AN ACTION_ACCESS ENTRY WITH NO HANDLER  (' + noHandler.length + ')');
console.log(noHandler.length ? '  ' + noHandler.join(', ') + '  — a door onto nothing; take the entry out' : '  none');
console.log('');
/* check-access fails these too; said here so this check's own count is whole. */
console.log('A HANDLER THE GATE HAS NEVER HEARD OF  (' + noGate.length + ')');
console.log(noGate.length ? '  ' + noGate.join(', ') : '  none');
console.log('');
console.log('A REASON FOR A HANDLER THAT IS GONE, OR NOW HAS A CALLER  (' + staleReason.length + ')');
console.log(staleReason.length ? '  ' + staleReason.join(', ') + '  — take it out of REASONS' : '  none');
if (kept.length) {
  console.log('');
  console.log('KEPT WITH A REASON  (' + kept.length + ')');
  kept.forEach(a => console.log('  ' + a + ' — ' + REASONS[a]));
}
const bad = uncalled.length + noHandler.length + noGate.length + staleReason.length;
console.log('');
console.log(bad ? 'FAILED — ' + bad + ' action(s) above.'
  : 'OK — every one of ' + all.length + ' actions has a caller or a reason.');
process.exit(bad ? 1 : 0);
