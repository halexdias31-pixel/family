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
  consoleLoad: 'its front end (the Console, games.js/racer.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  consoleSave: 'its front end (the Console, games.js/racer.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  filmsSync: 'its front end (the films list, games.js/racer.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  mediaDelete: 'its front end (the reels and videos admin, games.js/racer.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  mediaHide: 'its front end (the reels and videos admin, games.js/racer.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  mediaSave: 'its front end (the reels and videos admin, games.js/racer.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  mediaUpload: 'its front end (the reels and videos admin, games.js/racer.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  raceBuild: 'its front end (the racer, games.js/racer.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  saveAvatar: 'its front end (the figure and its wardrobe, links.js and me-account.js) was removed (9 Nov, one card everywhere); the handler stays until the backend is next redeployed. Restore from 5cc3c89.',
  saveScore: 'its front end (the Flabby Pird game, receipt.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  saveTimetable: 'its front end (the Timetable widget, games.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  saveTtHighscore: 'its front end (the times-tables sprint, games.js) was frozen and deleted (1110); the handler stays until the backend is next redeployed. Restore from cfc19fa.',
  favLinksSave: 'its front end was frozen and deleted (1100); the handler stays until the backend is next redeployed. Restore from c9b8d2f.',
  rewriteIdeas: 'its front end was frozen and deleted (1100); the handler stays until the backend is next redeployed. Restore from c9b8d2f.',
  rewriteCheck: 'its front end was frozen and deleted (1100); the handler stays until the backend is next redeployed. Restore from c9b8d2f.',
  makeChild: 'kept only to refuse an old page plainly: a child makes their own account and a parent claims it (461, the owner: "making a child\'s account shouldn\'t be a thing").',
  reportQuestion: 'kept for a phone loaded before 486: it is routed into the one `suggest` action (check-suggest proves it).',
  report: 'kept for a phone loaded before 494: it is routed into the one `suggest` action (check-suggest proves it).',
  claudeNoteAdd: 'kept for a phone loaded before 494, whose admin tile was Note for Claude; Suggest a change replaced it (check-suggest).',
  claudeNoteDone: 'kept for a phone loaded before 498, whose suggest box listed notes with Done; Done is now data/notes-done.json, read on an admin open (check-suggest).',
  flagMessage: 'kept for a phone loaded before 486: a message routed into the one `suggest` action (check-posts proves it).',
  linkChild: 'the one way an admin settles a HELD family link besides typing in the sheet (check-signin proves the '
    + 'address rule on it). Posted by hand for now; no admin card yet (433).',
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

const handlers = new Set(require('../tools/post-actions.js').postActionNames(strip(backend)));
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

/* THE OTHER DIRECTION (83a): every `action: '…'` the site posts must be a postActions_ key, or the button posts into nothing. */
const pa = require('../tools/post-actions.js');
const keys = new Set(pa.postTable(strip(pa.postSrc(O))).map(x => x.action));
const front = {};
site.forEach(p => { for (const m of strip(read(p)).matchAll(/\baction\s*:\s*['"](\w+)['"]/g)) (front[m[1]] = front[m[1]] || new Set()).add(p); });
const noKey = Object.keys(front).filter(a => !keys.has(a)).sort();

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
console.log('');
console.log('A FRONT-END action: WITH NO postActions_ KEY  (' + noKey.length + ' of ' + Object.keys(front).length + ' posted, ' + keys.size + ' keys)');
console.log(noKey.length ? noKey.map(a => '  ' + a + '  — ' + [...front[a]].join(', ')).join('\n') : '  none');
const bad = uncalled.length + noHandler.length + noGate.length + staleReason.length + noKey.length;
console.log('');
console.log(bad ? 'FAILED — ' + bad + ' action(s) above.'
  : 'OK — every one of ' + all.length + ' actions has a caller or a reason.');
process.exit(bad ? 1 : 0);
