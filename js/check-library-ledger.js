#!/usr/bin/env node
/* node js/check-library-ledger.js — THE LIBRARY'S PRIVATE HALF IN THE LEDGER (397), asked of the real backend.
   The copy, `libItems` and its cap, the tools' export and import, the Sunday email. `--full` copies the whole library. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');
const LF = require('../check/lib-full.js');

const bad = [];
let asked = 0;
const FULL = process.argv.includes('--full');
const D = LF.defs();

/* ---------- THE SOURCE: the real files, whole (check/lib-full.js), cut to a few papers unless --full ---------- */
const whole = {};
LF.NAMES().forEach(n => { whole[n] = LF.rows(n); });
const sizeOf = r => JSON.stringify(LF.privateOf(D.files.questions, r) || {}).length;
const biggest = whole.questions.reduce((a, r) => (sizeOf(r) > sizeOf(a) ? r : a), whole.questions[0]);
const papers = [...new Set(whole.questions.map(r => r.paper_id))].slice(0, 3).concat([biggest.paper_id]);
const src = {
  questions: FULL ? whole.questions : whole.questions.filter(r => papers.indexOf(r.paper_id) !== -1),
  textbooks: whole.textbooks, practicals: whole.practicals, projects: whole.projects,
};
/* A FILE WITH NO ROW AT THE PINNED COMMIT (`newer`, 458) is copied as nothing; its words come by import */
LF.NAMES().forEach(n => { if (D.files[n].newer) src[n] = []; });
const srcText = {};
LF.NAMES().forEach(n => { srcText[D.files[n].file] = LF.fileText(src[n], 'compact'); });
const expected = {};
LF.NAMES().forEach(n => {
  expected[n] = {};
  src[n].forEach(r => { const c = LF.privateOf(D.files[n], r); if (c) expected[n][LF.idOf(D.files[n], r)] = c; });
});
const prefix = n => D.files[n].prefix;
if (sizeOf(biggest) <= 40000) bad.push('the largest question is ' + sizeOf(biggest) + ' characters — nothing exercises a JSON cut across cells');

/* A FAKE NETWORK: raw.githubusercontent.com at the pinned commit answers with the source, and nothing else is reachable. */
function world(o) {
  o = o || {};
  const fetched = [];
  const triggers = [];
  /* A FILE WRITTEN AND NOT YET CHECKED — where a check can spoil a cell, as a sheet that did not keep it would. */
  let spoilNext = 0;
  const b = backend(Object.assign({
    __afterWrite: key => { if (key === 'practicals' && spoilNext > 0) { spoilNext--; const t = b.tabs.lib_practicals; if (t && t[2]) t[2][3] = '~{"aim":"spoilt"}'; } },
    UrlFetchApp: { fetch: url => {
      fetched.push(url);
      /* THE SITE'S OWN CARD FILES, when a check hands some in (`o.site`), for an import's "is it a public card" question (407). */
      const site = Object.keys(o.site || {}).find(f => String(url).split('?')[0] === 'https://halexdias31-pixel.github.io/family/' + f);
      if (site) return { getResponseCode: () => 200, getContentText: () => o.site[site] };
      const at = String(url).indexOf(D.commit + '/');
      const file = at === -1 ? '' : String(url).slice(at + D.commit.length + 1);
      if (String(url).indexOf('https://raw.githubusercontent.com/') !== 0 || !srcText[file]) return { getResponseCode: () => 404, getContentText: () => 'nope' };
      return { getResponseCode: () => 200, getContentText: () => srcText[file] };
    } },
    ScriptApp: { getScriptId: () => 'local', getProjectTriggers: () => triggers.slice(),
      newTrigger: fn => ({ timeBased: () => ({ after: ms => ({ create() { triggers.push({ fn: fn, ms: ms, getHandlerFunction: () => fn }); } }),
                                              everyMinutes: () => ({ create() {} }),
                                              everyHours: h => ({ create() { triggers.push({ fn: fn, hours: h, getHandlerFunction: () => fn }); } }) }) }),
      deleteTrigger: t => { const i = triggers.indexOf(t); if (i !== -1) triggers.splice(i, 1); } },
  }, o.extra || {}));
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'aa2026', email: 's1@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-S2', first_name: 'Ben', last_name: 'Pupil', handle: 'bn2026', email: 's2@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'hl2026', email: 'a1@example.org', role: 'admin' }, base),
  ]);
  if (o.cap !== undefined) b.seed('config', [{ key: 'library_items_per_day', value: String(o.cap) }]);
  const tok = {};
  ['s1@example.org', 's2@example.org', 'a1@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d.token;
  });
  const ask = (who, body) => { asked++; return b.post(Object.assign({ token: tok[who] || '' }, body)); };
  /* A STEP WITH A CLOCK THAT TICKS ONCE PER LOOK, so `budget` ticks is a step cut short exactly where a slow sheet would cut it. */
  const step = budget => {
    let t = 0;
    return JSON.parse(b.ev('JSON.stringify(libCopy_({ noBook: true, force: true, batch: 10, afterWrite: __afterWrite, budgetMs: ' + (budget || 1e9)
      + ', clock: () => (globalThis.__tick = (globalThis.__tick || 0) + 1) }))'));
  };
  const spoil = n => { spoilNext = n; };
  const state = () => JSON.parse(b.ev('JSON.stringify(libMigState_())'));
  const tab = n => (b.tabs[D.files[n].tab] || []);
  return { b, ask, step, state, tab, fetched, triggers, spoil };
}
const ADA = 's1@example.org', BEN = 's2@example.org', HAL = 'a1@example.org';
const strip = v => { const s = String(v == null ? '' : v); return s.charAt(0) === '~' ? s.slice(1) : s; };
/* A TAB'S ROWS AS { id: content }, read the way the backend reads them back. */
function tabItems(w, n) {
  const out = {};
  w.tab(n).slice(1).forEach(r => {
    if (!r || !strip(r[0])) return;
    let json = '';
    for (let i = 0; i < (Number(r[2]) || 1); i++) json += strip(r[3 + i]);
    try { out[strip(r[0])] = JSON.parse(json); } catch (e) { out[strip(r[0])] = '(not JSON)'; }
  });
  return out;
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- 0. THE TABS, THE DOORS AND THE JOB: named three times, made by setup ---------- */
{
  const { b } = world();
  asked++;
  ['lib_questions', 'lib_content', 'lib_practicals', 'lib_projects', 'lib_log'].forEach(t => {
    if (!b.tabs[t]) bad.push('there is no `' + t + '` tab in TAB/SCHEMA');
    if (b.ev('WHERE.' + t + ' && WHERE.' + t + '.file') !== 'ledger') bad.push('WHERE.' + t + ' is not the Ledger');
  });
  const acc = b.ev('JSON.stringify([ACTION_ACCESS.libItems, ACTION_ACCESS.libExport, ACTION_ACCESS.libImport])');
  if (acc !== '["self","admin","admin"]') bad.push('ACTION_ACCESS libItems/libExport/libImport is ' + acc + ' — wanted self, admin, admin');
  const job = b.ev('JSON.stringify(MIGRATIONS.filter(m => m.id === "library-to-ledger").map(m => ({ retry: !!m.retry, progress: typeof m.progress })))');
  if (job !== '[{"retry":true,"progress":"function"}]') bad.push('MIGRATIONS has no retrying library-to-ledger job with a progress line: ' + job);
  delete b.tabs.lib_questions;
  b.ev('ensureSchema_()');
  if (!b.tabs.lib_questions || b.tabs.lib_questions[0].join() !== 'id,checksum,parts,content_1,content_2,content_3,content_4,content_5,content_6') bad.push('ensureSchema_ did not make lib_questions with its header');
  if (!/^[0-9a-f]{40}$/.test(D.commit)) bad.push('LIB_SOURCE_COMMIT is not a whole commit hash: ' + D.commit);
}

/* ---------- 1. THE JOB ON AN ADMIN'S LOAD BOOKS THE COPY AND NEVER COPIES; NOTHING IS SERVED UNTIL EVERY ROW IS CHECKED ---------- */
{
  const w = world();
  asked++;
  let threw = '';
  try { w.b.ev('libMigrate_()'); } catch (e) { threw = String(e && e.message || e); }
  if (!/copying in the background/.test(threw)) bad.push('libMigrate_ did not say it is copying in the background (said ' + JSON.stringify(threw) + ')');
  if (w.triggers.length !== 1 || w.triggers[0].fn !== 'libraryCopyStep') bad.push('libMigrate_ booked ' + JSON.stringify(w.triggers.map(t => t.fn)) + ' — wanted one libraryCopyStep');
  if (w.tab('questions').length > 1) bad.push('libMigrate_ copied rows itself — an admin page load would wait for it');
  const says = JSON.parse(w.b.ev('JSON.stringify(setupStatus_().jobs.filter(j => j.id === "library-to-ledger")[0] || null)'));
  if (!says || says.error || !/copying/.test(says.said || '')) bad.push('the Setup card does not show the copy as waiting with its progress: ' + JSON.stringify(says));
  const d = w.ask(ADA, { action: 'libItems', ids: ['q:' + biggest.row_id] });
  if (d.why !== 'lib-not-ready' || d.items) bad.push('libItems before the copy was checked answered ' + JSON.stringify(d).slice(0, 200));
}

/* ---------- 2. THE COPY: cut short, resumed, every row checked against its source, then done once and only once ---------- */
let done = null;
{
  const w = world();
  asked++;
  let st = w.step(5);
  const f0 = st.files.questions || {};
  if (st.done || !f0.next || f0.next >= f0.total) bad.push('a step cut short after 5 ticks still finished (or wrote nothing): ' + JSON.stringify(f0));
  const wrote = f0.next;
  /* THE ROWS SO FAR ARE THE SOURCE'S FIRST ROWS, in order — row 2 + n is item n. */
  const ids = Object.keys(expected.questions);
  const have = w.tab('questions').slice(1, 1 + wrote).map(r => strip(r[0]));
  if (!same(have, ids.slice(0, wrote))) bad.push('the first step\'s rows are not the source\'s first ' + wrote + ' items in order');
  let n = 0;
  while (!(st = w.step(5)).done && n++ < 400) { if (st.stuck) break; }
  if (!st.done) bad.push('the copy never finished: ' + JSON.stringify(st).slice(0, 300));
  if (n < 2) bad.push('the copy finished in ' + (n + 1) + ' steps — the cut was not exercised');
  LF.NAMES().forEach(k => {
    const got = tabItems(w, k);
    if (!same(Object.keys(got), Object.keys(expected[k]))) bad.push(D.files[k].tab + ' holds ' + Object.keys(got).length + ' items in some order — the source has ' + Object.keys(expected[k]).length);
    const wrong = Object.keys(expected[k]).filter(id => !same(got[id], expected[k][id]));
    if (wrong.length) bad.push(D.files[k].tab + ': ' + wrong.length + ' item(s) differ from the source, e.g. ' + wrong[0]);
    if (st.files[k].rows !== Object.keys(expected[k]).length || !st.files[k].verified) bad.push(k + ' is not recorded as checked with its count: ' + JSON.stringify(st.files[k]));
  });
  const row = w.tab('questions').find(r => strip(r[0]) === biggest.row_id);
  if (!row || Number(row[2]) < 3 || row.slice(3).some(c => String(c).length > 50000)) bad.push('the largest question is not cut into three or more cells under 50,000 characters');
  if (w.tab('questions').slice(1).some(r => r.slice(0, 2).concat(r.slice(3)).some(c => c !== '' && String(c).charAt(0) !== '~'))) bad.push('a text cell does not start ~ — the sheet could read it as a number, a date or a formula');
  /* AGAIN, ONCE DONE: nothing is written, nothing fetched. */
  const writes = w.b.log.writes, got = w.fetched.length;
  w.step(30);
  if (w.b.log.writes !== writes || w.fetched.length !== got) bad.push('a step after the copy was done wrote or fetched again');
  let said = '';
  try { said = w.b.ev('libMigrate_()'); } catch (e) { said = 'threw ' + e.message; }
  if (!/copied from a237c8a/.test(said)) bad.push('libMigrate_ once done says ' + JSON.stringify(said));
  if (!/^https:\/\/raw\.githubusercontent\.com\/halexdias31-pixel\/family\/[0-9a-f]{40}\/data\/questions\.json$/.test(w.fetched[0] || '')) bad.push('the source was fetched from ' + w.fetched[0]);
  done = w;
}

/* ---------- 3. A ROW THAT DOES NOT READ BACK IS COPIED AGAIN; THREE TIMES AND IT STOPS — and nothing is served meanwhile ---------- */
{
  const w = world();
  asked++;
  w.spoil(1);
  let st = w.step(1e9);
  if (st.done) bad.push('a spoilt row passed the check — verify does not compare checksums');
  if (!/^practicals: .*(checksum|does not read back)/.test(st.error || '')) bad.push('the failed check did not say which row: ' + JSON.stringify(st.error));
  if (!st.files.questions.verified || st.files.practicals.verified || st.files.practicals.next !== 0) bad.push('a failed check did not start that file again from its first row: ' + JSON.stringify(st.files.practicals));
  const d = w.ask(ADA, { action: 'libItems', ids: ['pr:' + whole.practicals[0].practical_id] });
  if (d.why !== 'lib-not-ready') bad.push('libItems served while the copy had failed its check: ' + JSON.stringify(d).slice(0, 160));
  /* AND A CLEAN COPY THE NEXT TIME ROUND. */
  st = w.step(1e9);
  if (!st.done) bad.push('the copy after a failed check did not finish clean: ' + JSON.stringify(st).slice(0, 200));
  if (!same(tabItems(w, 'practicals'), expected.practicals)) bad.push('the practicals copied again are not the source');
  /* STUCK: spoilt after every write, three times. */
  const w2 = world();
  w2.spoil(3);
  for (let i = 0; i < 3; i++) st = w2.step(1e9);
  if (!st.stuck || st.done) bad.push('three failed checks did not stop the copy: ' + JSON.stringify({ stuck: st.stuck, done: st.done }));
  let threw = '';
  try { w2.b.ev('libMigrate_()'); } catch (e) { threw = e.message; }
  if (!/rerun/.test(threw)) bad.push('a stopped copy does not say how to run it again: ' + threw);
}

/* ---------- 4. libItems: signed in, a day's cap, the cache ---------- */
{
  const w = done;
  const q = 'q:' + biggest.row_id;
  const anyQ = Object.keys(expected.questions).slice(0, 6).map(id => 'q:' + id);
  const ct = 'ct:' + Object.keys(expected.textbooks)[1], pr = 'pr:' + Object.keys(expected.practicals)[0], pj = 'pj:' + Object.keys(expected.projects)[0];
  /* SIGNED OUT. */
  asked++;
  const out = w.b.post({ action: 'libItems', ids: [q] });
  if (!out.error || out.items) bad.push('libItems signed out answered ' + JSON.stringify(out).slice(0, 160));
  /* EVERY KIND, AS THE SOURCE HAS IT. */
  const d = w.ask(ADA, { action: 'libItems', ids: [q, ct, pr, pj, 'q:NOT-A-ROW'] });
  if (!d.success) bad.push('libItems for a student answered ' + JSON.stringify(d).slice(0, 200));
  else {
    if (!same(d.items[q], expected.questions[biggest.row_id])) bad.push('the largest question came back different from its source');
    if (!same(d.items[ct], expected.textbooks[ct.slice(3)])) bad.push('a content card came back different');
    if (!same(d.items[pr], expected.practicals[pr.slice(3)]) || !same(d.items[pj], expected.projects[pj.slice(3)])) bad.push('a practical or a project came back different');
    if (!same(d.missing, ['q:NOT-A-ROW'])) bad.push('an id with no row is not reported missing: ' + JSON.stringify(d.missing));
    if (d.cap !== 400 || d.left !== 395) bad.push('the default cap is ' + d.cap + ' with ' + d.left + ' left — wanted 400 and 395 after five');
  }
  asked++;
  if (!w.ask(ADA, { action: 'libItems', ids: ['<script>'] }).error) bad.push('a malformed id was answered');
  if (!w.ask(ADA, { action: 'libItems', ids: Array.from({ length: 61 }, (_, i) => 'q:X' + i) }).error) bad.push('61 ids at once were answered — the cap per call is 60');
  /* THE CACHE: a cell spoilt in the tab after the first read is not what the second read gets. */
  const t = w.tab('practicals');
  const keep = t[2][3];
  t[2][3] = '~{"aim":"edited by hand"}';
  const again = w.ask(BEN, { action: 'libItems', ids: [pr] });
  if (!again.success || !same(again.items[pr], expected.practicals[pr.slice(3)])) bad.push('a second read did not come from the cache');
  t[2][3] = keep;
  const log = (w.b.tabs.lib_log || []);
  const h = log[0] || [];
  const rows = log.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; });
  const ada = rows.find(r => r.person_id === 'P-S1');
  if (!ada || Number(ada.served) !== 5 || ada.handle !== 'aa2026') bad.push('lib_log does not hold Ada\'s 5 under her handle: ' + JSON.stringify(ada));
  if (rows.some(r => Object.values(r).some(v => /Pupil/.test(String(v))))) bad.push('lib_log carries a surname');

  /* THE CAP, ON A FRESH LEDGER AT 5 A DAY. */
  const c = world({ cap: 5 });
  while (!c.step(1e9).done) {}
  const qs = Object.keys(expected.questions).map(id => 'q:' + id);
  asked++;
  const a1 = c.ask(ADA, { action: 'libItems', ids: qs.slice(0, 4) });
  const a2 = c.ask(ADA, { action: 'libItems', ids: qs.slice(2, 7) });
  if (!a2.success || Object.keys(a2.items).length !== 3 || !same(a2.refused, qs.slice(5, 7)) || a2.left !== 0) bad.push('at 5 a day, 4 then 5 more (2 seen) gave ' + JSON.stringify({ n: Object.keys(a2.items || {}).length, refused: a2.refused, left: a2.left }));
  const a3 = c.ask(ADA, { action: 'libItems', ids: qs.slice(0, 2) });
  if (!a3.success || Object.keys(a3.items).length !== 2) bad.push('asking again for two already opened today was not free: ' + JSON.stringify(a3).slice(0, 160));
  const a4 = c.ask(ADA, { action: 'libItems', ids: qs.slice(8, 9) });
  if (a4.why !== 'lib-cap' || a4.items) bad.push('a new item past the cap answered ' + JSON.stringify(a4).slice(0, 160));
  const b1 = c.ask(BEN, { action: 'libItems', ids: qs.slice(8, 9) });
  if (!b1.success) bad.push('Ada\'s cap stopped Ben');
  const hal = c.ask(HAL, { action: 'libItems', ids: qs.slice(0, 20) });
  if (!hal.success || Object.keys(hal.items).length !== Math.min(20, qs.length) || hal.cap !== null) bad.push('an admin was capped: ' + JSON.stringify({ n: Object.keys(hal.items || {}).length, cap: hal.cap }));
  /* THE CACHE FORGETS A DAY'S TALLY (six hours): the lib_log row remembers it. */
  c.b.cache.clear();
  const a5 = c.ask(ADA, { action: 'libItems', ids: qs.slice(9, 10) });
  if (a5.why !== 'lib-cap') bad.push('with the cache emptied, the cap was forgotten — lib_log is not read back: ' + JSON.stringify(a5).slice(0, 160));
  void a1;
}

/* ---------- 5. THE TOOLS' COPY: export a page, import replaces and adds, refuses what is not private, admin only ---------- */
{
  const w = done;
  asked++;
  const ex = w.ask(HAL, { action: 'libExport', file: 'practicals', from: 0, count: 10 });
  if (!ex.success || ex.rows.length !== 10 || ex.total !== Object.keys(expected.practicals).length) bad.push('libExport answered ' + JSON.stringify(ex).slice(0, 200));
  else if (!same(ex.rows[0].content, expected.practicals[ex.rows[0].id])) bad.push('libExport\'s first row is not the source\'s');
  if (!w.ask(ADA, { action: 'libExport', file: 'practicals' }).error) bad.push('a student could export the private half');
  if (!w.ask(ADA, { action: 'libImport', file: 'practicals', rows: [] }).error) bad.push('a student could import');
  const pid = Object.keys(expected.practicals)[0];
  const im = w.ask(HAL, { action: 'libImport', file: 'practicals', rows: [
    { id: pid, content: Object.assign({}, expected.practicals[pid], { aim: 'A new aim.' }) },
    { id: 'P-NEW-1', content: { aim: 'Brand new', steps: 'one|two' } }] });
  if (!im.success || im.added !== 1 || im.replaced !== 1) bad.push('libImport answered ' + JSON.stringify(im));
  const back = w.ask(ADA, { action: 'libItems', ids: ['pr:' + pid, 'pr:P-NEW-1'] });
  if (!back.success || (back.items['pr:' + pid] || {}).aim !== 'A new aim.' || (back.items['pr:P-NEW-1'] || {}).aim !== 'Brand new') bad.push('an import was not served next (the cache outlived it?): ' + JSON.stringify(back).slice(0, 200));
  const odd = w.ask(HAL, { action: 'libImport', file: 'practicals', rows: [{ id: pid, content: { name: 'Public field' } }] });
  if (!odd.error) bad.push('libImport took a field that is not private: ' + JSON.stringify(odd));
}

/* ---------- 6. THE SUNDAY EMAIL PUTS THE WORDS BACK ON A METADATA-ONLY ROW ---------- */
{
  const w = done;
  asked++;
  const r = whole.questions.find(x => x.paper_id === papers[0] && x.kind === 'question' && x.html);
  const slim = {};
  Object.keys(r).forEach(k => { if (D.files.questions.private.indexOf(k) === -1) slim[k] = r[k]; });
  slim.lib_has = 'html';
  const got = JSON.parse(w.b.ev('JSON.stringify(digestLibraryFill_({ rows: { a: ' + JSON.stringify(slim) + ' }, pre: [] }))'));
  if (!got.rows || got.rows.a.html !== r.html || 'lib_has' in got.rows.a) bad.push('digestLibraryFill_ did not put the question\'s words back from the Ledger');
}

/* ---------- 7. UPDATES LEFT IN THE OWNER'S DRIVE (407): admin only, merge per field, null deletes, all-or-nothing per file, moved, caches gone ---------- */
/* A FAKE DRIVE: folders and files with owners. Only the script's own account's folder and files may be read. */
function fakeDrive(me) {
  let n = 0;
  const folders = [], files = [];
  const iter = list => { let i = 0; return { hasNext: () => i < list.length, next: () => list[i++] }; };
  const who = email => ({ getEmail: () => email });
  function folderObj(name, parent, owner) {
    const f = { id: 'F' + (++n), name, parent, owner,
      getName: () => f.name, getId: () => f.id, isTrashed: () => false, getOwner: () => who(f.owner),
      getFiles: () => iter(files.filter(x => x.parent === f)),
      getFoldersByName: nm => iter(folders.filter(x => x.parent === f && x.name === nm)),
      getFolders: () => iter(folders.filter(x => x.parent === f)),
      createFolder: nm => folderObj(nm, f, me), createFile: (nm, text, mime) => fileObj(nm, String(text), f, me, mime),
      addFile: x => { x.parent = f; return f; }, removeFile: () => f };
    folders.push(f);
    return f;
  }
  function fileObj(name, text, parent, owner, mime) {
    const x = { id: 'D' + (++n), name, text, parent, owner, mime: mime || 'application/json',
      getName: () => x.name, getId: () => x.id, getMimeType: () => x.mime, getSize: () => x.text.length, isTrashed: () => false,
      getOwner: () => who(x.owner), getBlob: () => ({ getDataAsString: () => x.text }), moveTo: to => { x.parent = to; return x; } };
    files.push(x);
    return x;
  }
  const DriveApp = { getFoldersByName: nm => iter(folders.filter(x => x.name === nm)), createFolder: nm => folderObj(nm, null, me),
    getFolderById: () => null, getFileById: () => null };
  return { DriveApp, folders, files, folderObj, fileObj };
}
{
  const OWNER = 'owner@example.org';
  const drive = fakeDrive(OWNER);
  const qIds = Object.keys(expected.questions);
  const qid = qIds.find(id => expected.questions[id].answer && expected.questions[id].html && expected.questions[id].accept);
  const ctId = Object.keys(expected.textbooks)[0], pid = Object.keys(expected.practicals)[1];
  const site = { 'data/questions.json': JSON.stringify(src.questions.map(r => ({ row_id: r.row_id })).concat([{ row_id: 'Q-ON-THE-SITE-1' }])) };
  const w = world({ site, extra: { DriveApp: drive.DriveApp,
    Session: { getActiveUser: () => ({ getEmail: () => OWNER }), getEffectiveUser: () => ({ getEmail: () => OWNER }), getScriptTimeZone: () => 'Europe/London' } } });
  while (!w.step(1e9).done) {}
  asked++;
  /* THE GATE. */
  if (!w.ask(ADA, { action: 'libImportList' }).error) bad.push('a student could list the Drive imports');
  if (!w.ask(ADA, { action: 'libImportDrive' }).error) bad.push('a student could import from Drive');
  const acc = w.b.ev('JSON.stringify([ACTION_ACCESS.libImportList, ACTION_ACCESS.libImportDrive, typeof RUNNABLE.libImportDrive])');
  if (acc !== '["admin","admin","function"]') bad.push('ACTION_ACCESS libImportList/libImportDrive and RUNNABLE.libImportDrive are ' + acc);
  /* FIRST LOOK MAKES THE FOLDER. */
  const l0 = w.ask(HAL, { action: 'libImportList' });
  const home = drive.folders.find(f => f.name === 'family-library-imports' && !f.parent);
  if (!l0.success || !home || (l0.pending || []).length !== 0) bad.push('the first libImportList did not make the folder and say nothing waits: ' + JSON.stringify(l0));
  /* A STRANGER'S FOLDER OF THE SAME NAME, a stranger's file in ours, and a file not named lib-import-*.json: none of them read. */
  const theirs = drive.folderObj('family-library-imports', null, 'stranger@example.org');
  drive.fileObj('lib-import-2026-10-24T09-00-00Z.json', JSON.stringify({ version: 1, files: { practicals: [{ id: pid, aim: 'STRANGER' }] } }), theirs, 'stranger@example.org');
  drive.fileObj('lib-import-2026-10-24T09-30-00Z.json', JSON.stringify({ version: 1, files: { practicals: [{ id: pid, aim: 'STRANGER' }] } }), home, 'stranger@example.org');
  drive.fileObj('notes.txt', 'hello', home, OWNER, 'text/plain');
  /* THE GOOD FILE: a question's html replaced and its answer deleted, a content card's words, a new practical vouched for by `cards`, one already on the site. */
  const good = drive.fileObj('lib-import-2026-10-24T10-00-00Z.json', JSON.stringify({ version: 1, note: 'drawn matching',
    files: { questions: [{ id: qid, html: '<p>New words</p>', answer: null }, { id: 'Q-ON-THE-SITE-1', html: '<p>On the site</p>' }],
             textbooks: [{ id: ctId, words: 'fresh words' }],
             practicals: [{ id: 'P-DRIVE-NEW', aim: 'From Drive', steps: 'a|b' }] },
    cards: { practicals: [{ practical_id: 'P-DRIVE-NEW', name: 'A new practical' }] } }), home, OWNER);
  const l1 = w.ask(HAL, { action: 'libImportList' });
  if (!l1.success || JSON.stringify((l1.pending || []).map(p => p.name)) !== '["lib-import-2026-10-24T10-00-00Z.json"]') bad.push('libImportList should list only our own lib-import file: ' + JSON.stringify(l1.pending));
  /* THE OLD WORDS IN THE CACHE, so the import has to make them stale. */
  const before = w.ask(ADA, { action: 'libItems', ids: ['q:' + qid] });
  if (!before.success || before.items['q:' + qid].html !== expected.questions[qid].html) bad.push('libItems before the import did not give the copied question');
  const d = w.ask(HAL, { action: 'libImportDrive' });
  const f0 = (d.files || [])[0] || {};
  if (!d.success || d.imported !== 1 || d.failed !== 0 || !f0.counts || f0.counts.questions.replaced !== 1 || f0.counts.questions.added !== 1
      || f0.counts.questions.deleted !== 1 || f0.counts.practicals.added !== 1 || f0.counts.textbooks.replaced !== 1) bad.push('libImportDrive answered ' + JSON.stringify(d).slice(0, 400));
  const qNow = tabItems(w, 'questions')[qid] || {};
  if (qNow.html !== '<p>New words</p>' || 'answer' in qNow || qNow.accept !== expected.questions[qid].accept) bad.push('the question was not merged per field (html replaced, answer deleted, accept kept): ' + JSON.stringify(qNow).slice(0, 200));
  const ctNow = tabItems(w, 'textbooks')[ctId] || {};
  if (ctNow.words !== 'fresh words' || ctNow.points !== expected.textbooks[ctId].points) bad.push('the content card was not merged per field');
  if (!same(tabItems(w, 'practicals')['P-DRIVE-NEW'], { aim: 'From Drive', steps: 'a|b' })) bad.push('the new practical was not added');
  if (tabItems(w, 'practicals')[pid].aim === 'STRANGER') bad.push('a stranger\'s file was imported');
  const done7 = drive.folders.find(f => f.name === 'imported' && f.parent === home);
  if (!done7 || good.parent !== done7) bad.push('the imported file was not moved to family-library-imports/imported');
  const after = w.ask(ADA, { action: 'libItems', ids: ['q:' + qid, 'pr:P-DRIVE-NEW'] });
  if (!after.success || after.items['q:' + qid].html !== '<p>New words</p>' || !after.items['pr:P-DRIVE-NEW']) bad.push('libItems after the import still served the cached words: ' + JSON.stringify(after).slice(0, 200));
  const lh = (w.b.tabs.lib_log || [])[0] || [];
  const logged = (w.b.tabs.lib_log || []).slice(1).map(r => { const o = {}; lh.forEach((c, i) => { o[c] = r[i]; }); return o; }).filter(r => r.person_id === 'library-import');
  if (logged.length !== 1 || !/lib-import-2026-10-24T10-00-00Z\.json/.test(logged[0].ids) || logged[0].handle !== 'hl2026') bad.push('lib_log has no line for the imported file under the admin\'s handle: ' + JSON.stringify(logged));
  const l2 = w.ask(HAL, { action: 'libImportList' });
  if ((l2.pending || []).length !== 0 || !l2.last || l2.last.imported !== 1) bad.push('after the import the list still waits, or has no last report: ' + JSON.stringify(l2).slice(0, 200));

  /* REFUSED WHOLE: an id that is no card anywhere, beside one that would be fine — nothing written, the file stays. */
  const snap = () => JSON.stringify(['questions', 'practicals'].map(k => w.tab(k)));
  const s0 = snap();
  const odd = drive.fileObj('lib-import-2026-10-24T11-00-00Z.json', JSON.stringify({ version: 1, files: {
    practicals: [{ id: pid, aim: 'Would be fine' }], questions: [{ id: 'Q-NOBODY-1', html: 'x' }] } }), home, OWNER);
  const e1 = w.ask(HAL, { action: 'libImportDrive' });
  if (!e1.error || !/Q-NOBODY-1/.test(e1.error) || snap() !== s0 || odd.parent !== home) bad.push('an unknown id did not refuse its whole file untouched: ' + JSON.stringify(e1).slice(0, 200));
  odd.parent = theirs;
  /* A PUBLIC FIELD, A WRONG VERSION: refused, untouched. */
  const pub = drive.fileObj('lib-import-2026-10-24T11-10-00Z.json', JSON.stringify({ version: 1, files: { practicals: [{ id: pid, name: 'Public' }] } }), home, OWNER);
  const e2 = w.ask(HAL, { action: 'libImportDrive' });
  if (!e2.error || !/not a private field/.test(e2.error) || snap() !== s0) bad.push('a public field was not refused: ' + JSON.stringify(e2).slice(0, 200));
  pub.parent = theirs;

  /* WRITE, READ BACK, PUT BACK: a cell the sheet did not keep undoes every row of that file, the new row too. */
  const g = w.b.ev('globalThis'), realSA = g.SpreadsheetApp;
  let spoil = pid;
  g.SpreadsheetApp = Object.assign({}, realSA, { openById: id => {
    const book = realSA.openById(id);
    return Object.assign({}, book, { getSheetByName: nm => {
      const sh = book.getSheetByName(nm);
      if (!sh || nm !== 'lib_practicals') return sh;
      return Object.assign({}, sh, { getRange: (...a) => {
        const r = sh.getRange(...a);
        return Object.assign({}, r, { setValues: vals => {
          r.setValues(vals);
          if (spoil && strip(vals[0][0]) === spoil) { spoil = null; w.b.tabs.lib_practicals[a[0] - 1][3] = '~{"aim":"spoilt"}'; }
          return r;
        } });
      } });
    } });
  } });
  const s1 = JSON.stringify(tabItems(w, 'practicals'));
  const roll = drive.fileObj('lib-import-2026-10-24T12-00-00Z.json', JSON.stringify({ version: 1, files: {
    practicals: [{ id: 'P-DRIVE-NEW-2', aim: 'Second' }, { id: pid, aim: 'Changed' }] },
    cards: { practicals: [{ practical_id: 'P-DRIVE-NEW-2' }] } }), home, OWNER);
  const e3 = w.ask(HAL, { action: 'libImportDrive' });
  if (!e3.error || !/put back/.test(e3.error)) bad.push('a row that did not read back was not reported as put back: ' + JSON.stringify(e3).slice(0, 300));
  if (JSON.stringify(tabItems(w, 'practicals')) !== s1) bad.push('after a failed read-back the practicals are not as they were (half-written)');
  if (roll.parent !== home) bad.push('a file that failed its read-back was moved anyway');
  g.SpreadsheetApp = realSA;
  /* AND THE SAME FILE CLEAN, BY `?run=libImportDrive` — the admin's URL. */
  const r = w.b.get({ run: 'libImportDrive', name: 'Hal Admin', pin: '0000' });
  if (!r.result || r.result.imported !== 1 || tabItems(w, 'practicals')[pid].aim !== 'Changed' || roll.parent !== done7) bad.push('?run=libImportDrive did not import the file once clean: ' + JSON.stringify(r).slice(0, 300));

  /* ---------- 8. THE HOURLY RUN (443): booked once by the admin-load setup, imports what waits, an empty folder writes nothing, a tap alongside is safe ---------- */
  const hourly = () => w.b.ev('JSON.stringify(ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "libImportHourly").length)');
  for (let i = 0; i < 3; i++) w.b.ev('PropertiesService.getScriptProperties().deleteProperty("SETUP_CHECKED_AT"); setupOnAdminLoad_(); 0');
  if (hourly() !== '1') bad.push('the admin-load setup should book exactly one libImportHourly trigger, booked ' + hourly());
  const hk = w.b.ev('JSON.stringify(libImportKeepBooked_())');
  if (hk !== 'null') bad.push('libImportKeepBooked_ with one trigger booked should do nothing: ' + hk);
  const logRows = () => (w.b.tabs.lib_log || []).length;
  /* EMPTY: no log line, no report, no generation, no folder made. */
  const gen0 = w.b.ev('JSON.stringify(PropertiesService.getScriptProperties().getProperties())'), log0 = logRows(), nF = drive.folders.length, nFiles = drive.files.length;
  const h0 = JSON.parse(w.b.ev('JSON.stringify(libImportHourly())'));
  if (!h0.nothing || logRows() !== log0 || drive.folders.length !== nF || drive.files.length !== nFiles
      || w.b.ev('JSON.stringify(PropertiesService.getScriptProperties().getProperties())') !== gen0) bad.push('an hourly run on an empty folder wrote something: ' + JSON.stringify(h0).slice(0, 200));
  /* SPLIT-UP FILES: three parts, each a whole import, oldest name first; and a tap fired while the run holds the lock is turned away. */
  let held = false, tapped = null;
  const realLS = g.LockService;
  g.LockService = { getScriptLock: () => ({ tryLock: () => { if (held) return false; held = true; return true; }, waitLock: () => { if (held) throw new Error('busy'); held = true; },
    releaseLock: () => { held = false; } }) };
  const parts = [1, 2, 3].map(k => drive.fileObj('lib-import-hr-part-0' + k + '-of-03.json', JSON.stringify({ version: 1, files: { practicals: [{ id: 'P-HR-' + k, aim: 'Part ' + k }] },
    cards: { practicals: [{ practical_id: 'P-HR-' + k }] } }), home, OWNER));
  const blob = parts[0].getBlob;
  parts[0].getBlob = () => { tapped = w.ask(HAL, { action: 'libImportDrive' }); return blob(); };
  const h1 = JSON.parse(w.b.ev('JSON.stringify(libImportHourly())'));
  const pr = tabItems(w, 'practicals');
  if (!h1.success || h1.imported !== 3 || !h1.auto || JSON.stringify(h1.files.map(f => f.name)) !== JSON.stringify(parts.map(x => x.name))
      || [1, 2, 3].some(k => !pr['P-HR-' + k] || pr['P-HR-' + k].aim !== 'Part ' + k) || parts.some(x => x.parent !== done7)) bad.push('the hourly run did not import the three parts in order and move them: ' + JSON.stringify(h1).slice(0, 300));
  if (!tapped || tapped.why !== 'busy') bad.push('a tap during the hourly run was not turned away as busy: ' + JSON.stringify(tapped).slice(0, 200));
  const hl = (w.b.tabs.lib_log || []).slice(1).filter(r => /lib-import-hr-part/.test(r.join(' ')));
  if (hl.length !== 3 || !hl.every(r => r.indexOf('hourly') !== -1)) bad.push('lib_log should have one line per part under the handle hourly, has ' + hl.length);
  /* THE TAP AFTERWARDS finds nothing to do twice; the card's list says when the automatic import ran and what it did. */
  const t2 = w.ask(HAL, { action: 'libImportDrive' });
  if (!t2.success || t2.imported !== 0) bad.push('a tap after the hourly run imported again: ' + JSON.stringify(t2).slice(0, 200));
  const l3 = w.ask(HAL, { action: 'libImportList' });
  if (!l3.auto || l3.auto.imported !== 3 || !l3.auto.at) bad.push('libImportList does not say what the last automatic import did: ' + JSON.stringify(l3.auto).slice(0, 200));
  held = true;
  const h2 = JSON.parse(w.b.ev('JSON.stringify(libImportHourly())'));
  if (h2.why !== 'busy') bad.push('an hourly run while the lock is held should give way: ' + JSON.stringify(h2));
  held = false;
  g.LockService = realLS;

  /* ---------- 9. ONE ZIP OF MANY FILES: unpacked into the folder (only lib-import-*.json names, none twice), moved to imported, imported the same run; too big refused ---------- */
  /* A FAKE ZIP: its blob carries its entries; Utilities.unzip hands them back as blobs, and counts how often it was asked. */
  let unzips = 0;
  const realU = g.Utilities, logged9 = [], realLog = g.Logger;
  g.Utilities = Object.assign({}, realU, { unzip: b => { unzips++; return b.entries.map(e => ({ getName: () => e.name, getDataAsString: () => e.text })); } });
  g.Logger = { log: m => logged9.push(String(m)) };
  const zipOf = (name, entries, size) => {
    const z = drive.fileObj(name, '', home, OWNER, 'application/zip');
    z.getSize = () => size || 1000;
    z.getBlob = () => ({ entries, setContentType() { return this; }, getDataAsString: () => '' });
    return z;
  };
  const part9 = k => JSON.stringify({ version: 1, files: { practicals: [{ id: 'P-ZIP-' + k, aim: 'Zip ' + k }] }, cards: { practicals: [{ practical_id: 'P-ZIP-' + k }] } });
  const zip = zipOf('lib-import-2026-10-29-zip.zip', [
    { name: 'out/lib-import-zip-01.json', text: part9(1) },
    { name: 'lib-import-zip-02.json', text: part9(2) },
    { name: 'run-me.gs', text: 'function evil() {}' },
    { name: '../lib-import-hr-part-01-of-03.json', text: JSON.stringify({ version: 1, files: { practicals: [{ id: 'P-HR-1', aim: 'DUPLICATE' }] } }) }]);
  const lz = w.ask(HAL, { action: 'libImportList' });
  const zl = (lz.pending || []).find(p => p.name === zip.name);
  if (!zl || !zl.zip || zl.files !== 3 || zl.said !== 'zip waiting (3 files)') bad.push('libImportList should show the zip as "zip waiting (3 files)": ' + JSON.stringify(lz.pending).slice(0, 300));
  const hz = JSON.parse(w.b.ev('JSON.stringify(libImportHourly())'));
  const pz = tabItems(w, 'practicals');
  const z0 = (hz.zips || [])[0] || {};
  if (z0.unzipped !== 2 || z0.skipped !== 1 || z0.error) bad.push('the zip should give two files and skip the one already imported: ' + JSON.stringify(hz.zips));
  if (hz.imported !== 2 || [1, 2].some(k => !pz['P-ZIP-' + k] || pz['P-ZIP-' + k].aim !== 'Zip ' + k)) bad.push('the zip\'s two files were not imported by the same run: ' + JSON.stringify(hz).slice(0, 300));
  if (zip.parent !== done7) bad.push('the unpacked zip was not moved to imported');
  if (pz['P-HR-1'].aim !== 'Part 1' || drive.files.filter(f => f.name === 'lib-import-hr-part-01-of-03.json').length !== 1) bad.push('a zip\'s file named like one already imported was made again');
  if (drive.files.some(f => /run-me|^out|\.\./.test(f.name))) bad.push('a zip entry not named lib-import-*.json, or its path, reached Drive');
  if (['lib-import-zip-01.json', 'lib-import-zip-02.json'].some(nm => { const f = drive.files.find(x => x.name === nm); return !f || f.parent !== done7 || f.owner !== OWNER; })) bad.push('the unpacked files are not our own, imported, in imported');
  /* A ZIP OF ONLY FILES ALREADY THERE: moved, and the hourly run says so rather than "nothing". */
  const dz = zipOf('lib-import-2026-10-29-dup.zip', [{ name: 'lib-import-zip-02.json', text: part9(2) }]);
  const hd = JSON.parse(w.b.ev('JSON.stringify(libImportHourly())'));
  const la = w.ask(HAL, { action: 'libImportList' }).auto || {};
  if (hd.nothing || dz.parent !== done7 || ((la.zips || [])[0] || {}).skipped !== 1) bad.push('an hourly run that unpacked a zip of duplicates should report it, not "nothing": ' + JSON.stringify([hd, la.zips]).slice(0, 300));
  /* TOO BIG: refused before unpacking, said in the log and on the card, and it stays. */
  const u0 = unzips;
  const big = zipOf('lib-import-2026-10-29-big.zip', [{ name: 'lib-import-big.json', text: part9(9) }], 60 * 1024 * 1024);
  const lb = (w.ask(HAL, { action: 'libImportList' }).pending || []).find(p => p.name === big.name) || {};
  const tb = w.ask(HAL, { action: 'libImportDrive' });
  const zb = (tb.zips || [])[0] || {};
  if (unzips !== u0 || !/at most 45\.0 MB/.test(zb.error || '') || big.parent !== home || drive.files.some(f => f.name === 'lib-import-big.json')
      || !/zip refused/.test(lb.said || '') || !logged9.some(m => /lib-import-2026-10-29-big\.zip refused/.test(m))) bad.push('a 60 MB zip was not refused untouched, with a log line: ' + JSON.stringify([zb, lb, logged9]).slice(0, 300));
  /* TOO MANY FILES: refused the same way. */
  big.parent = theirs;
  const many = zipOf('lib-import-2026-10-29-many.zip', Array.from({ length: 501 }, (_, k) => ({ name: 'lib-import-m-' + k + '.json', text: part9(9) })));
  const tm = w.ask(HAL, { action: 'libImportDrive' });
  if (!/at most 500/.test(((tm.zips || [])[0] || {}).error || '') || many.parent !== home || drive.files.some(f => /^lib-import-m-/.test(f.name))) bad.push('a zip of 501 files was not refused: ' + JSON.stringify(tm.zips));
  many.parent = theirs;

  /* ---------- 10. SUBFOLDERS (an unzipped bundle): any depth but `imported`, our own only, one of each name, a name already imported left alone, capped ---------- */
  const STRANGER = 'stranger@example.org';
  const part10 = (k, aim) => JSON.stringify({ version: 1, files: { practicals: [{ id: 'P-SUB-' + k, aim: aim || 'Sub ' + k }] }, cards: { practicals: [{ practical_id: 'P-SUB-' + k }] } });
  const bundle = drive.folderObj('lib-import-bundle-2026-10-29', home, OWNER), deeper = drive.folderObj('past-paper-imports', bundle, OWNER);
  const sub1 = drive.fileObj('lib-import-sub-01.json', part10(1), bundle, OWNER);
  const sub2 = drive.fileObj('lib-import-sub-02.json', part10(2), deeper, OWNER);
  sub2.moveTo = undefined;   // the older Drive move: added to imported, removed from the folder it is in
  deeper.removeFile = x => { deeper.removed = x; return deeper; };
  const sub3a = drive.fileObj('lib-import-sub-03.json', part10(3), bundle, OWNER), sub3b = drive.fileObj('lib-import-sub-03.json', part10(3, 'TWICE'), deeper, OWNER);
  const again = drive.fileObj('lib-import-zip-01.json', JSON.stringify({ version: 1, files: { practicals: [{ id: 'P-ZIP-1', aim: 'AGAIN' }] } }), bundle, OWNER);
  const odd10 = drive.folderObj('shared-with-me', home, STRANGER);
  drive.fileObj('lib-import-sub-04.json', part10(4), odd10, OWNER);
  const oldDone = drive.folderObj('old', done7, OWNER);
  drive.fileObj('lib-import-sub-05.json', part10(5), oldDone, OWNER);
  drive.fileObj('lib-import-sub-06.json', part10(6), done7, OWNER);
  const zip10 = drive.fileObj('lib-import-sub.zip', '', deeper, OWNER, 'application/zip');
  zip10.getSize = () => 1000;
  zip10.getBlob = () => ({ entries: [{ name: 'lib-import-sub-07.json', text: part10(7) }], setContentType() { return this; }, getDataAsString: () => '' });
  const l10 = w.ask(HAL, { action: 'libImportList' });
  const names10 = (l10.pending || []).map(p => p.name + '@' + (p.folder || '')).sort().join(' ');
  if (names10 !== 'lib-import-sub-01.json@lib-import-bundle-2026-10-29 lib-import-sub-02.json@past-paper-imports lib-import-sub-03.json@lib-import-bundle-2026-10-29 lib-import-sub.zip@past-paper-imports'
      || l10.skipped !== 2) bad.push('libImportList should list the subfolders\' files once each, with their folder, and skip 2: ' + JSON.stringify([names10, l10.skipped]));
  const d10 = w.ask(HAL, { action: 'libImportDrive' });
  const p10 = tabItems(w, 'practicals');
  if (d10.imported !== 4 || d10.failed || [1, 2, 3, 7].some(k => !p10['P-SUB-' + k] || p10['P-SUB-' + k].aim !== 'Sub ' + k)) bad.push('the files in a subfolder and a sub-subfolder (and a zip there) were not imported: ' + JSON.stringify(d10).slice(0, 400));
  if ([sub1, sub2, zip10].some(f => f.parent !== done7) || [sub3a, sub3b].filter(f => f.parent === done7).length !== 1) bad.push('a subfolder\'s imported file did not move to imported, or a name in two folders moved twice');
  if (deeper.removed !== sub2) bad.push('a subfolder\'s file was not taken out of its own folder when moved');
  if ((d10.files || []).filter(f => f.name === 'lib-import-sub-03.json').length !== 1) bad.push('a name in two folders was imported twice');
  if (p10['P-ZIP-1'].aim !== 'Zip 1' || again.parent !== bundle) bad.push('a subfolder\'s file named like one already in imported was imported again');
  if ([4, 5, 6].some(k => p10['P-SUB-' + k])) bad.push('a file under imported, or in a folder not our own, was read: ' + [4, 5, 6].filter(k => p10['P-SUB-' + k]).join(', '));
  /* THE CAP: more folders than a run looks at, said in the log, and nothing breaks. */
  const many10 = Array.from({ length: 25 }, (_, k) => drive.folderObj('extra-' + k, home, OWNER));
  logged9.length = 0;
  const c10 = w.ask(HAL, { action: 'libImportList' });
  if (!c10.success || !/more than 20 folders/.test(c10.capped || '') || !logged9.some(m => /walk stopped at more than 20 folders/.test(m))) bad.push('a walk past 20 folders was not capped with a log line: ' + JSON.stringify([c10.capped, logged9]));
  many10.forEach(f => { f.parent = theirs; });
  g.Utilities = realU;
  g.Logger = realLog;
}

if (bad.length) {
  console.log('\nFAILED — the library in the Ledger:');
  bad.forEach(b => console.log('  ' + b));
  process.exit(1);
}
console.log('OK — the library copies into the Ledger a step at a time and only counts once every row reads back as its source (' + asked
  + ' questions asked' + (FULL ? ', the whole library' : ', ' + src.questions.length + ' question rows') + '); libItems is signed-in, capped per day, cached; the tools\' copy is the admin\'s; the Sunday email gets its words; Drive updates import whole or not at all, by a tap or the hourly run, a zip of them unpacks first (too big refused), and subfolders count too.');
