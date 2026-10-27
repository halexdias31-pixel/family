#!/usr/bin/env node
/* node js/check-reports.js — A REPORTED QUESTION IS ONE ROW IN `reports`, asked of the real `doPost` over an in-memory ledger (395).
   The tab and setup; the token's person; one a day per question; caps; admin-only to read or close. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const WANT = ['report_id', 'at', 'person_id', 'handle', 'question_id', 'paper_id', 'part', 'label',
              'reason', 'note', 'finder', 'device', 'status', 'status_at', 'kind', 'item_id', 'reporter_rank', 'status_by'];

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
  const tok = {};
  ['s1@example.org', 's2@example.org', 'a1@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d.token;
  });
  const ask = (who, body) => { asked++; return b.post(Object.assign({ token: tok[who] || '' }, body)); };
  const rows = () => {
    const g = b.tabs.reports;
    if (!g) return [];
    const h = g[0];
    return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; });
  };
  return { b, ask, rows };
}
const ADA = 's1@example.org', BEN = 's2@example.org', HAL = 'a1@example.org';
const rep = more => Object.assign({ action: 'reportQuestion', questionId: 'Q-T-1', paperId: 'RS1-1', part: 'b',
  label: 'Q5b · Paper 1', reason: 'answer-wrong', note: 'the answer says 12 but it is 15', finder: 'stuff', device: 'phone' }, more || {});

/* ---------- 0. THE TAB: NAMED THREE TIMES, AND MADE BY SETUP ---------------------------------------------- */
{
  const { b } = world();
  asked++;
  const head = (b.tabs.reports || [[]])[0];
  if (!b.tabs.reports) bad.push('there is no `reports` tab in TAB/SCHEMA, so nothing below can be asked');
  else if (JSON.stringify(head) !== JSON.stringify(WANT)) bad.push('SCHEMA.reports is ' + JSON.stringify(head) + ' — wanted ' + JSON.stringify(WANT));
  if (b.ev('WHERE.reports && WHERE.reports.file') !== 'ledger') bad.push('WHERE.reports is not the Ledger');
  const acc = b.ev('JSON.stringify([ACTION_ACCESS.reportQuestion, ACTION_ACCESS.listReports, ACTION_ACCESS.setReportStatus])');
  if (acc !== '["self","admin","admin"]') bad.push('ACTION_ACCESS for reportQuestion/listReports/setReportStatus is ' + acc + ' — wanted self, admin, admin');
  /* THE SETUP AN ADMIN'S PAGE LOAD RUNS (361) MAKES IT IN A LEDGER THAT HAS NEVER HAD ONE. */
  delete b.tabs.reports;
  const said = b.ev('JSON.stringify(ensureSchema_().reports || null)');
  if (!b.tabs.reports || JSON.stringify(b.tabs.reports[0]) !== JSON.stringify(WANT)) bad.push('ensureSchema_ did not make the reports tab with its header (said ' + said + ')');
  if (!/ensureSchema_\(\)/.test(b.ev('autoMigrate_.toString()'))) bad.push('autoMigrate_ (run on an admin page load) no longer calls ensureSchema_, so nothing makes the tab');
}

/* ---------- 1. A ROW, AS THE TOKEN'S PERSON, ONCE A DAY PER QUESTION ------------------------------------- */
{
  const { ask, rows } = world();
  const t0 = Date.now();
  /* CLAIMING TO BE BEN: the person is the token's. */
  const d = ask(ADA, rep({ personId: 'P-S2', name: 'Ben Pupil' }));
  if (!d.success || d.already) bad.push('a first report answered ' + JSON.stringify(d));
  let r = rows();
  if (r.length !== 1) bad.push('one report made ' + r.length + ' rows');
  else {
    const x = r[0];
    if (x.person_id !== 'P-S1' || x.handle !== 'aa2026') bad.push('the row is for ' + x.person_id + ' @' + x.handle + ' — the token was Ada’s');
    if (x.question_id !== 'Q-T-1' || x.paper_id !== 'RS1-1' || x.part !== 'b' || x.label !== 'Q5b · Paper 1') bad.push('the row lost what the question was: ' + JSON.stringify(x));
    if (x.reason !== 'The answer is wrong') bad.push('the reason is kept as ' + JSON.stringify(x.reason) + ' — wanted the words, so the sheet reads by itself');
    if (x.note !== 'the answer says 12 but it is 15' || x.finder !== 'stuff' || x.device !== 'phone') bad.push('note, finder or device lost: ' + JSON.stringify(x));
    if (x.status !== 'open' || x.kind !== 'question' || x.item_id !== 'q:Q-T-1' || x.reporter_rank !== 'student') bad.push('a child’s new report is ' + JSON.stringify([x.status, x.kind, x.item_id, x.reporter_rank]) + ' — wanted open, question, q:Q-T-1, student');
    if (!(x.at instanceof Date) || x.at.getTime() < t0) bad.push('`at` is not the server’s clock: ' + JSON.stringify(x.at));
    if (!/^R-\d+-\d+$/.test(String(x.report_id))) bad.push('report_id is ' + JSON.stringify(x.report_id));
    if (Object.values(x).some(v => /Pupil/.test(String(v)))) bad.push('the row carries a surname: ' + JSON.stringify(x));
  }
  /* THE SAME QUESTION AGAIN TODAY, ANOTHER REASON: one a day, and the reply says so rather than failing. */
  const again = ask(ADA, rep({ reason: 'broken', note: 'again' }));
  if (!again.success || !again.already) bad.push('the same question reported twice in a day answered ' + JSON.stringify(again) + ' — wanted success, already');
  if (rows().length !== 1) bad.push('a second report of the same question the same day wrote a row (' + rows().length + ')');
  /* ANOTHER QUESTION, AND ANOTHER PERSON ON THE SAME ONE, ARE THEIR OWN ROWS. */
  ask(ADA, rep({ questionId: 'Q-T-2' }));
  ask(BEN, rep());
  if (rows().length !== 3) bad.push('another question, and another child on the same question, made ' + rows().length + ' rows in all — wanted 3');
  /* YESTERDAY'S REPORT DOES NOT STOP TODAY'S. */
  const { b: b2, ask: ask2, rows: rows2 } = world();
  b2.seed('reports', [{ report_id: 'R-1-1', at: new Date(Date.now() - 2 * 864e5), person_id: 'P-S1', question_id: 'Q-T-1', reason: 'Something else' }]);
  const y = ask2(ADA, rep());
  if (!y.success || y.already || rows2().length !== 2) bad.push('a report the day before yesterday stopped today’s: ' + JSON.stringify(y));
}

/* ---------- 2. WHAT IS REFUSED, AND WHAT IS CUT --------------------------------------------------------- */
{
  const { ask, rows } = world();
  const out = ask('', rep());
  if (!out.error || rows().length) bad.push('signed out, a report answered ' + JSON.stringify(out) + ' and left ' + rows().length + ' rows');
  const why = ask(ADA, rep({ reason: 'nonsense' }));
  if (!why.error || rows().length) bad.push('a reason not on the list answered ' + JSON.stringify(why));
  const proto = ask(ADA, rep({ reason: 'constructor' }));
  if (!proto.error || rows().length) bad.push('reason "constructor" (an Object property) was taken: ' + JSON.stringify(proto));
  const noq = ask(ADA, rep({ questionId: '<b>x</b>' }));
  if (!noq.error || rows().length) bad.push('a question id that is not one answered ' + JSON.stringify(noq));
  ask(ADA, rep({ note: 'a'.repeat(2000), label: '<img src=x onerror=alert(1)>' + 'L'.repeat(500), device: 'd'.repeat(99) }));
  const x = rows()[0] || {};
  if (String(x.note).length > 302) bad.push('a 2000-character note was kept at ' + String(x.note).length + ' characters — the cap is 300');
  if (/<|>/.test(String(x.label)) || String(x.label).length > 120) bad.push('the label kept a tag or ran past 120: ' + String(x.label).slice(0, 60));
  if (String(x.device).length > 20) bad.push('device ran to ' + String(x.device).length + ' characters');
  const { ask: askBusy, rows: rowsBusy } = world(false);
  const busy = askBusy(ADA, rep());
  if (busy.why !== 'busy' || rowsBusy().length) bad.push('with the lock held elsewhere, reportQuestion answered ' + JSON.stringify(busy) + ' and wrote ' + rowsBusy().length);
}

/* ---------- 3. ONLY AN ADMIN READS THEM, OR CLOSES ONE ---------------------------------------------------- */
{
  const { b, ask, rows } = world();
  ask(ADA, rep());
  ask(BEN, rep({ questionId: 'Q-T-9', reason: 'unreadable', note: '' }));
  const peek = ask(BEN, { action: 'listReports' });
  if (!peek.error || peek.reports) bad.push('a child asking listReports was answered ' + JSON.stringify(peek).slice(0, 200));
  const shut = ask(BEN, { action: 'setReportStatus', id: rows()[0].report_id, status: 'fixed' });
  if (!shut.error || rows()[0].status !== 'open') bad.push('a child closed somebody’s report: ' + JSON.stringify(shut));
  /* AND THE PAYLOAD, which everybody is sent, carries none. */
  b.cache.clear();
  asked++;
  const g = JSON.stringify(b.get({}));
  if (/the answer says 12|Q-T-9|"reports"/.test(g)) bad.push('the public payload carries reports');

  const list = ask(HAL, { action: 'listReports' });
  if (!list.success || list.open !== 2 || (list.reports || []).length !== 2) bad.push('the admin’s listReports answered ' + JSON.stringify(list).slice(0, 300));
  else {
    if (list.reports[0].questionId !== 'Q-T-9') bad.push('the newest report is not first: ' + list.reports.map(r => r.questionId).join(', '));
    if (JSON.stringify(list).includes('P-S1') || JSON.stringify(list).includes('Pupil')) bad.push('listReports sends person ids or surnames — the handle is enough');
    if (list.reports[1].handle !== 'aa2026' || list.reports[1].reason !== 'The answer is wrong') bad.push('a listed report lost its handle or reason: ' + JSON.stringify(list.reports[1]));
  }
  const id = rows()[0].report_id;
  const fx = ask(HAL, { action: 'setReportStatus', id, status: 'fixed' });
  if (!fx.success || rows()[0].status !== 'fixed' || !(rows()[0].status_at instanceof Date)) bad.push('Fixed answered ' + JSON.stringify(fx) + ' and left ' + JSON.stringify(rows()[0].status));
  const nope = ask(HAL, { action: 'setReportStatus', id, status: 'deleted' });
  if (!nope.error || rows()[0].status !== 'fixed') bad.push('a status not on the list was taken: ' + JSON.stringify(nope));
  const after = ask(HAL, { action: 'listReports' });
  if (after.open !== 1 || after.total !== 2 || (after.reports || []).some(r => r.id === id)) bad.push('after Fixed the list still counts ' + after.open + ' open of ' + after.total);
  ask(HAL, { action: 'setReportStatus', id: rows()[1].report_id, status: 'not a problem' });
  if (rows()[1].status !== 'dismissed') bad.push('Not a problem (an old phone) was written as ' + JSON.stringify(rows()[1].status));
  const none = ask(HAL, { action: 'setReportStatus', id: 'R-0-0', status: 'fixed' });
  if (!none.error) bad.push('closing a report that is not there answered ' + JSON.stringify(none));
}

/* ---------- 4. ONE RULE FOR EVERYTHING (486): an admin's report is to fix, anybody else's a signal -------------- */
{
  const { b, ask, rows } = world();
  b.seed('claude_notes', []);
  const ct = { action: 'report', kind: 'content', itemId: 'ct:TB-X#3', label: 'Bayes', reason: 'wrong', note: 'the tree is wrong' };
  const kid = ask(ADA, ct);
  if (!kid.success || kid.serious) bad.push('a child’s content report answered ' + JSON.stringify(kid));
  const notes = () => (b.tabs.claude_notes || [[]]).slice(1);
  const marked = () => { b.cache.clear(); asked++; return (b.get({}).reportedItems || []); };
  if (rows()[0].status !== 'open' || notes().length || marked().length) bad.push('a child’s report changed the item: status ' + rows()[0].status + ', notes ' + notes().length + ', marked ' + JSON.stringify(marked()));
  const adm = ask(HAL, { action: 'report', kind: 'widget', itemId: 'calc', label: 'Calculator', reason: 'broken' });
  const ar = rows()[1] || {};
  if (!adm.success || !adm.serious || ar.status !== 'confirmed' || ar.reporter_rank !== 'admin') bad.push('an admin’s report answered ' + JSON.stringify(adm) + ', row ' + ar.status);
  if (notes().length !== 1 || !/calc/.test(JSON.stringify(notes()[0]))) bad.push('an admin’s report made ' + notes().length + ' Notes for Claude — wanted one naming the widget');
  if (JSON.stringify(marked()) !== '["widget|calc"]') bad.push('the payload marks ' + JSON.stringify(marked()) + ' — wanted the admin’s widget only');
  const l = ask(HAL, { action: 'listReports' });
  if (!l.success || l.serious !== 1 || !(l.reports[0] || {}).serious || (l.reports[1] || {}).kind !== 'content') bad.push('listReports does not put the admin’s first and the child’s after: ' + JSON.stringify(l).slice(0, 300));
  const cf = ask(HAL, { action: 'setReportStatus', id: rows()[0].report_id, status: 'confirmed' });
  if (!cf.success || rows()[0].status !== 'confirmed' || notes().length !== 2 || marked().indexOf('content|ct:TB-X#3') === -1) bad.push('Confirm did not make the child’s report one to fix: ' + JSON.stringify(cf).slice(0, 200));
  ask(BEN, Object.assign({}, ct, { itemId: 'ct:TB-X#4' }));
  ask(HAL, { action: 'setReportStatus', id: rows()[2].report_id, status: 'dismissed' });
  if (rows()[2].status !== 'dismissed' || notes().length !== 2) bad.push('Dismiss wrote ' + rows()[2].status + ' and ' + notes().length + ' notes');
  const fx = ask(HAL, { action: 'setReportStatus', id: rows()[1].report_id, status: 'fixed' });
  if (JSON.stringify(fx.reportedItems) !== '["content|ct:TB-X#3"]') bad.push('after Fixed the marked list is ' + JSON.stringify(fx.reportedItems));
  if (!ask(ADA, Object.assign({}, ct, { kind: 'Bad Kind' })).error) bad.push('a kind that is not a word was taken');
}

/* ---------- 5. EVERY REPORT TILE IS `reportTile_` (486): no other `act: 'rep-box'` and no other flag labelled Report ---------- */
{
  const fs = require('fs'), path = require('path');
  const dir = path.join(__dirname);
  asked++;
  fs.readdirSync(dir).filter(f => /\.js$/.test(f) && !/^check/.test(f)).forEach(f => {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const own = f === 'submit.js' ? src.replace(/function reportTile_\([\s\S]*?\n\}/, '') : src;
    if (/act:\s*'rep-box'|label:\s*'Report'/.test(own)) bad.push('js/' + f + ' draws a Report tile of its own — use reportTile_(kind, id, label)');
    if (/data-do="(q-report|msg-report)"|'(q-report|msg-report)'/.test(src)) bad.push('js/' + f + ' still has the old q-report/msg-report tile');
  });
  const uses = fs.readdirSync(dir).filter(f => /\.js$/.test(f) && !/^check/.test(f)).filter(f => /reportTile(For)?_\(/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
  ['tiles.js', 'arcade.js', 'layout.js', 'me.js'].forEach(f => { if (uses.indexOf(f) === -1) bad.push(f + ' no longer calls reportTile_ — cards, widgets, column cards and messages each need it'); });
}

console.log(`requests asked of the backend: ${asked}`);
if (bad.length) {
  console.log('\nFAILED — ' + bad.length + ':\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log('OK — a report is one row as the token’s person, once a day per item, capped; an admin’s is to fix (marked, a Note for Claude), anybody else’s a signal to Confirm or Dismiss; every tile is reportTile_.');
