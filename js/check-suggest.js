#!/usr/bin/env node
/* node js/check-suggest.js — SUGGEST A CHANGE (494) of the real `doPost`: an admin's an open note, anybody else's pending;
   the old reports move once; one tile, no Report left. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;

function world(lockFree) {
  const b = backend(lockFree === false
    ? { LockService: { getScriptLock: () => ({ tryLock: () => false, waitLock: () => { throw new Error('busy'); }, releaseLock: () => {} }) } }
    : undefined);
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'aa2026', email: 's1@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-S2', first_name: 'Ben', last_name: 'Pupil', handle: 'bn2026', email: 's2@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'hl2026', email: 'a1@example.org', role: 'admin' }, base),
  ]);
  b.seed('claude_notes', []);
  const tok = {};
  ['s1@example.org', 's2@example.org', 'a1@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d.token;
  });
  const ask = (who, body) => { asked++; return b.post(Object.assign({ token: tok[who] || '' }, body)); };
  const tab = name => () => {
    const g = b.tabs[name];
    if (!g) return [];
    const h = g[0];
    return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; });
  };
  return { b, ask, notes: tab('claude_notes'), reports: tab('reports') };
}
const ADA = 's1@example.org', BEN = 's2@example.org', HAL = 'a1@example.org';
const sg = more => Object.assign({ action: 'suggest', kind: 'question', itemId: 'q:Q-T-1', label: 'Q5b · Paper 1', note: 'the answer says 12 but it is 15' }, more || {});

/* ---------- 0. THE GATE ---------- */
{
  const { b } = world();
  asked++;
  const acc = b.ev('JSON.stringify([ACTION_ACCESS.suggest, ACTION_ACCESS.listSuggestions, ACTION_ACCESS.decideSuggestion, ACTION_ACCESS.report])');
  if (acc !== '["self","admin","admin","self"]') bad.push('ACTION_ACCESS for suggest/listSuggestions/decideSuggestion/report is ' + acc);
}

/* ---------- 1. A CHILD'S WAITS; THE TOKEN'S PERSON; ONCE A DAY ---------- */
{
  const { b, ask, notes, reports } = world();
  const d = ask(ADA, sg({ personId: 'P-S2' }));
  if (!d.success || d.serious) bad.push('a child’s suggestion answered ' + JSON.stringify(d));
  const n = notes();
  if (n.length !== 1) bad.push('one suggestion made ' + n.length + ' rows');
  else {
    const x = n[0];
    if (x.made_by !== 'P-S1') bad.push('the row is for ' + x.made_by + ' — the token was Ada’s');
    if (x.status !== 'pending' || x.item_id !== 'question|q:Q-T-1' || x.column !== 'question') bad.push('a child’s row is ' + JSON.stringify([x.status, x.item_id, x.column]) + ' — wanted pending, question|q:Q-T-1');
    if (x.note !== 'the answer says 12 but it is 15') bad.push('the words were not kept: ' + JSON.stringify(x.note));
  }
  if (reports().length) bad.push('a suggestion wrote to the retired reports tab');
  const again = ask(ADA, sg({ note: 'again' }));
  if (!again.success || !again.already || notes().length !== 1) bad.push('the same thing twice in a day answered ' + JSON.stringify(again));
  ask(BEN, sg());
  if (notes().length !== 2) bad.push('another child on the same thing made ' + notes().length + ' rows — wanted 2');
  /* WAITING IS NOT OPEN: not in the payload's notes, not marked, not in the Drive file's list. */
  b.cache.clear(); asked++;
  const g = b.get({});
  if ((g.reportedItems || []).length) bad.push('a waiting suggestion marked the item: ' + JSON.stringify(g.reportedItems));
  if (/the answer says 12/.test(JSON.stringify(g))) bad.push('the public payload carries a waiting suggestion');
  if (b.ev('claudeNotesOpen_().length') !== 0) bad.push('a waiting suggestion is counted open for Claude');
  /* REFUSED: signed out, no words, a bad id, a bad kind, and busy. */
  if (!ask('', sg()).error) bad.push('signed out, a suggestion was taken');
  if (!ask(ADA, sg({ itemId: 'q:Q-T-7', note: '  ' })).error) bad.push('a suggestion with no words was taken');
  if (!ask(ADA, sg({ itemId: '<b>x</b>' })).error) bad.push('an id that is not one was taken');
  if (!ask(ADA, sg({ kind: 'Bad Kind' })).error) bad.push('a kind that is not a word was taken');
  const { ask: askBusy, notes: nBusy } = world(false);
  if (askBusy(ADA, sg()).why !== 'busy' || nBusy().length) bad.push('with the lock held elsewhere a suggestion was written');
  /* AN OLD PHONE'S report AND reportQuestion LAND HERE TOO, the reason kept as words. */
  ask(ADA, { action: 'reportQuestion', questionId: 'Q-T-3', reason: 'answer-wrong', note: 'old' });
  const old = notes().find(r => r.item_id === 'question|q:Q-T-3');
  if (!old || old.note !== 'The answer is wrong — old' || old.status !== 'pending') bad.push('an old phone’s reportQuestion became ' + JSON.stringify(old));
}

/* ---------- 2. AN ADMIN'S IS OPEN AT ONCE, AND ONLY AN ADMIN DECIDES ---------- */
{
  const { b, ask, notes } = world();
  const adm = ask(HAL, sg({ kind: 'widget', itemId: 'calc', label: 'Calculator', note: 'bigger keys' }));
  if (!adm.success || !adm.serious || !(adm.notes || []).some(n => n.itemId === 'widget|calc')) bad.push('an admin’s suggestion answered ' + JSON.stringify(adm).slice(0, 200));
  if ((notes()[0] || {}).status !== 'open') bad.push('an admin’s suggestion is ' + (notes()[0] || {}).status + ' — wanted open');
  b.cache.clear(); asked++;
  if (JSON.stringify(b.get({}).reportedItems) !== '["widget|calc"]') bad.push('the admin’s suggestion did not mark the widget');
  ask(ADA, sg());
  ask(BEN, sg({ itemId: 'q:Q-T-9', note: 'blurry' }));
  if (!ask(BEN, { action: 'listSuggestions' }).error) bad.push('a child was shown the suggestions');
  const pid = notes().find(r => r.made_by === 'P-S1').note_id;
  if (!ask(BEN, { action: 'decideSuggestion', id: pid, decision: 'confirm' }).error) bad.push('a child confirmed a suggestion');
  const l = ask(HAL, { action: 'listSuggestions' });
  if (!l.success || l.open !== 2 || (l.suggestions || []).length !== 2) bad.push('listSuggestions answered ' + JSON.stringify(l).slice(0, 300));
  else {
    if (JSON.stringify(l).includes('P-S1') || JSON.stringify(l).includes('Pupil')) bad.push('listSuggestions sends person ids or surnames — the handle is enough');
    if (!l.suggestions.some(s => s.handle === 'aa2026' && s.itemId === 'q:Q-T-1' && s.note)) bad.push('a listed suggestion lost its handle, item or words: ' + JSON.stringify(l.suggestions));
  }
  const cf = ask(HAL, { action: 'decideSuggestion', id: pid, decision: 'confirm' });
  if (!cf.success || notes().find(r => r.note_id === pid).status !== 'open' || (cf.reportedItems || []).indexOf('question|q:Q-T-1') === -1) bad.push('Confirm did not send it to Notes for Claude: ' + JSON.stringify(cf).slice(0, 200));
  const did = notes().find(r => r.made_by === 'P-S2').note_id;
  const ds = ask(HAL, { action: 'decideSuggestion', id: did, decision: 'dismiss' });
  if (!ds.success || notes().find(r => r.note_id === did).status !== 'dismissed') bad.push('Dismiss answered ' + JSON.stringify(ds));
  if (b.ev('claudeNotesOpen_().length') !== 2) bad.push('after Confirm and Dismiss, ' + b.ev('claudeNotesOpen_().length') + ' notes are open — wanted 2');
  if (!ask(HAL, { action: 'decideSuggestion', id: did, decision: 'confirm' }).error) bad.push('a dismissed suggestion was confirmed again');
  if (!ask(HAL, { action: 'decideSuggestion', id: pid, decision: 'delete' }).error) bad.push('a decision not on the list was taken');
}

/* ---------- 3. THE OLD REPORTS, MOVED ONCE (the `reports-to-notes` job) ---------- */
{
  const { b, notes, reports } = world();
  const day = new Date(Date.now() - 3 * 864e5);
  b.seed('reports', [
    { report_id: 'R-1-1', at: day, person_id: 'P-S1', question_id: 'Q-T-1', reason: 'The answer is wrong', note: '12 not 15', status: '', label: 'Q5b' },
    { report_id: 'R-1-2', at: day, person_id: 'P-A1', kind: 'widget', item_id: 'calc', reason: "Doesn't work", note: '', status: 'confirmed', label: 'Calculator' },
    { report_id: 'R-1-3', at: day, person_id: 'P-S2', kind: 'content', item_id: 'ct:TB-X#3', reason: 'Something else', note: 'x', status: 'dismissed' },
    { report_id: 'R-1-4', at: day, person_id: 'P-S2', kind: 'content', item_id: 'ct:TB-X#4', reason: 'Something else', note: 'y', status: 'fixed' },
  ]);
  asked++;
  if (!/reportsMigrate_/.test(b.ev("JSON.stringify(MIGRATIONS.filter(m => m.id === 'reports-to-notes').map(m => m.run.toString()))"))) bad.push('no `reports-to-notes` job in MIGRATIONS runs reportsMigrate_');
  const said = b.ev('reportsMigrate_()');
  const n = notes();
  if (n.length !== 2) bad.push('the migration made ' + n.length + ' notes from 2 open reports (said ' + said + ')');
  const a = n.find(r => r.item_id === 'question|q:Q-T-1');
  if (!a || a.made_by !== 'P-S1' || a.note !== '[old report] The answer is wrong — 12 not 15' || a.status !== 'open' || !(a.made_at instanceof Date) || a.made_at.getTime() !== day.getTime())
    bad.push('an old report became ' + JSON.stringify(a));
  if (!n.some(r => r.item_id === 'widget|calc' && r.made_by === 'P-A1')) bad.push('the admin’s confirmed report was not moved');
  const st = reports().map(r => r.status).join(',');
  if (st !== 'migrated,migrated,dismissed,fixed') bad.push('after the migration the reports read ' + st);
  b.ev('reportsMigrate_()');
  if (notes().length !== 2) bad.push('the migration run twice made ' + notes().length + ' notes');
}

/* ---------- 4. ONE TILE: every Suggest tile is `suggestTile_`; no Report, flag or Note for Claude tile left ---------- */
{
  const dir = __dirname;
  asked++;
  const files = fs.readdirSync(dir).filter(f => /\.js$/.test(f) && !/^check/.test(f));
  files.forEach(f => {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const own = f === 'submit.js' ? src.replace(/function suggestTile_\([\s\S]*?\n\}/, '') : src;
    if (/act:\s*'rep-box'/.test(own)) bad.push('js/' + f + ' draws a Suggest tile of its own — use suggestTile_(kind, id, label)');
    if (/label:\s*'(Report[^']*|Note for Claude)'/.test(src)) bad.push('js/' + f + ' still has a Report or Note for Claude tile');
    if (/act:\s*'ncl-open'|reportTile_|noteTile_/.test(src)) bad.push('js/' + f + ' still calls the old report or note tile');
    if (/data-do="(q-report|msg-report)"|'(q-report|msg-report)'/.test(src)) bad.push('js/' + f + ' still has the old q-report/msg-report tile');
  });
  const uses = files.filter(f => /suggest(Tile|TileFor|RowIn)_\(/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
  ['tiles.js', 'arcade.js', 'layout.js', 'me.js', 'find.js', 'posts.js'].forEach(f => { if (uses.indexOf(f) === -1) bad.push(f + ' no longer calls suggestTile_ — cards, widgets, column cards, the finder and messages each need it'); });
  const icons = fs.readFileSync(path.join(dir, 'tiles.js'), 'utf8');
  if (!/^\s*suggest:\s*'/m.test(icons)) bad.push('TILE_ICONS has no `suggest` icon');
  if (!/icon: 'suggest'/.test(fs.readFileSync(path.join(dir, 'submit.js'), 'utf8'))) bad.push('suggestTile_ does not use the suggest icon');
}

console.log(`requests asked of the backend: ${asked}`);
if (bad.length) {
  console.log('\nFAILED — ' + bad.length + ':\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log('OK — a suggestion is one claude_notes row as the token’s person: an admin’s open at once, anybody else’s waiting for Confirm or Dismiss; the old reports moved once; one Suggest tile everywhere.');
