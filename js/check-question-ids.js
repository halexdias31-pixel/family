#!/usr/bin/env node
/* node js/check-question-ids.js — EVERY QUESTION ID THAT EVER EXISTED STILL ANSWERS (answer-ids): a saved answer is keyed by
   its part id, so a gone id with no alias strands that work as Unattempted. */
/* --orphans <file>: the gone ids as JSON. --write: an alias for each unaliased one (the longest id it starts with; a cell slot when that part's cells are exactly the merged parts). */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const QFILE = 'data/questions.json';
const AFILE = path.join(ROOT, 'data', 'settings', 'question-aliases.json');
const bad = [];

function aliases() {
  try { return JSON.parse(fs.readFileSync(AFILE, 'utf8')).aliases || {}; } catch (e) { bad.push('question-aliases.json unreadable: ' + e.message); return {}; }
}
const git = a => execFileSync('git', a, { cwd: ROOT, maxBuffer: 1 << 30, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const norm = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]/g, '');
const idsOf = text => { const s = new Set(); for (const m of String(text).matchAll(/"row_id":"([^"]*)"/g)) s.add(m[1]); return s; };

/* EVERY ID IN EVERY COMMIT of the file. A shallow clone (CI) sees fewer commits; what it sees is still checked. */
function everIds() {
  const ever = new Map();
  let shas = [];
  try { shas = git(['log', '--format=%H', '--', QFILE]).trim().split('\n').filter(Boolean); } catch (e) { return { ever, shas }; }
  shas.forEach(c => {
    let t = '';
    try { t = git(['show', c + ':' + QFILE]); } catch (e) { return; }
    idsOf(t).forEach(id => { if (!ever.has(id)) ever.set(id, c.slice(0, 9)); });
  });
  return { ever, shas };
}

const now = idsOf(fs.readFileSync(path.join(ROOT, QFILE), 'utf8'));
const A = aliases();
/* AN ALIAS POINTS AT IDS THAT EXIST NOW — a chain or a dead target would strand the answer all over again. */
Object.keys(A).forEach(old => {
  const to = [].concat((A[old] && A[old].to) || []);
  if (!to.length) bad.push('alias ' + old + ' has no target');
  to.forEach(t => { if (!now.has(t)) bad.push('alias ' + old + ' → ' + t + ' which is not in ' + QFILE); });
  if (now.has(old)) bad.push('alias ' + old + ' still exists in ' + QFILE + ' (an alias would hide it)');
  if (!A[old] || !String(A[old].why || '').trim()) bad.push('alias ' + old + ' has no why');
});

const { ever, shas } = everIds();
const gone = [...ever.keys()].filter(id => !now.has(id));
const oi = process.argv.indexOf('--orphans');
if (oi > 0) { fs.writeFileSync(process.argv[oi + 1], JSON.stringify(gone.map(id => ({ id, seen: ever.get(id) })), null, 1) + '\n'); process.exit(0); }
if (process.argv.includes('--write')) {
  const shown = {};
  const oldRow = (id, at) => {
    const c = at || ever.get(id); if (!c) return null;
    if (!shown[c]) { try { shown[c] = {}; JSON.parse(git(['show', c + ':' + QFILE])).forEach(r => { if (r && r.row_id) shown[c][r.row_id] = r; }); } catch (e) { shown[c] = {}; } }
    return shown[c][id] || null;
  };
  const priv = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data-private', 'questions.json'), 'utf8')); } catch (e) { return {}; } })();
  const home = id => { let t = id; while (t.length > 2 && !now.has(t)) t = t.slice(0, -1); return now.has(t) ? t : ''; };
  const byTo = {};
  gone.filter(id => !A[id]).forEach(id => { const t = home(id); if (t) (byTo[t] = byTo[t] || []).push(id); else bad.push('no home for ' + id + ': alias it by hand'); });
  Object.keys(byTo).forEach(t => {
    const sibs = byTo[t], cells = String((priv[t] && priv[t].cells) || '').split(' ; ').filter(Boolean).length;
    const slotted = cells === sibs.length + 1;
    /* THE MARKS EACH PART CARRIED WHEN IT WAS LAST ITS OWN ROW, so the merge rule below can tell one mark split in boxes from separate parts. */
    const marks = slotted ? [t].concat(sibs).map(id => { const r = oldRow(id, ever.get(sibs[0])); return r ? String(r.marks || '') : ''; }) : null;
    sibs.forEach((id, i) => {
      A[id] = slotted ? { to: t, slot: i + 1, of: cells, marks: marks, why: 'merged into ' + t + ' as its cell ' + (i + 1) + ' of ' + cells + ' (re-import; last seen ' + ever.get(id) + ')' }
        : { to: t, why: 'folded into ' + t + ' (re-import; last seen ' + ever.get(id) + ')' };
    });
  });
  const sorted = {};
  Object.keys(A).sort().forEach(k => { sorted[k] = A[k]; });
  const doc = JSON.parse(fs.readFileSync(AFILE, 'utf8'));
  doc.aliases = sorted;
  fs.writeFileSync(AFILE, JSON.stringify(doc, null, 1) + '\n');
  console.log('wrote ' + Object.keys(sorted).length + ' aliases');
  if (bad.length) { bad.forEach(b => console.log('  ✗ ' + b)); process.exit(1); }
  process.exit(0);
}
gone.filter(id => !A[id]).forEach(id => bad.push('question id ' + id + ' (last in ' + ever.get(id) + ') is gone from ' + QFILE + ' with no alias in data/settings/question-aliases.json'));

/* ONE ITEM PER PRINTED PART (rules 4.12): a merge of parts that each carried marks fails, unless listed in `restore` (owed). */
const DOC = (() => { try { return JSON.parse(fs.readFileSync(AFILE, 'utf8')); } catch (e) { return {}; } })();
const owed = new Set(DOC.restore || []);
const merged = {};
Object.keys(A).forEach(k => { const a = A[k]; if (a && a.slot !== undefined && Array.isArray(a.marks)) merged[a.to] = a.marks; });
Object.keys(merged).forEach(t => {
  const marked = merged[t].filter(m => m && m !== '0').length;
  if (marked > 1 && !owed.has(t)) bad.push(t + ' merges ' + marked + ' separately marked printed parts into one item: restore them as their own items');
});
owed.forEach(t => { if (!merged[t]) bad.push('restore lists ' + t + ', which is no merge: take it off the list'); });
/* A PART'S ID IS ITS PAPER'S PREFIX AND ITS PRINTED LABEL (question + part), so a re-import makes the same id. Ids older than
   `derived_from` keep theirs for life. */
let base = null;
try { base = DOC.derived_from ? idsOf(git(['show', DOC.derived_from + ':' + QFILE])) : null; } catch (e) { base = null; }
if (base) {
  JSON.parse(fs.readFileSync(path.join(ROOT, QFILE), 'utf8')).forEach(r => {
    if (!r || String(r.kind || '') !== 'question' || base.has(r.row_id)) return;
    const want = norm(r.question) + norm(r.part);
    if (want && !norm(r.row_id).endsWith(want)) bad.push(r.row_id + ' is not derived from its printed label (question ' + r.question + ', part ' + (r.part || '—') + ')');
  });
}

/* THE COPIES IN js/qaliases.js AND backend/constants.gs ARE THE MAP AS IT STANDS. */
try { const w = require('../tools/aliases_gs.js').want(); if (fs.readFileSync(path.join(ROOT, 'js', 'qaliases.js'), 'utf8') !== w.js || fs.readFileSync(path.join(ROOT, 'backend', 'constants.gs'), 'utf8') !== w.gs) bad.push('alias copies stale: node tools/aliases_gs.js'); } catch (e) { bad.push('aliases_gs: ' + e.message); }
console.log('question ids: ' + now.size + ' now, ' + ever.size + ' ever over ' + shas.length + ' commits, ' + gone.length + ' gone, ' + Object.keys(A).length + ' aliased');
if (bad.length) { bad.slice(0, 60).forEach(b => console.log('  ✗ ' + b)); if (bad.length > 60) console.log('  … ' + (bad.length - 60) + ' more'); process.exit(1); }
console.log('✓ every question id ever committed still exists or is aliased; ' + owed.size + ' merged part(s) owed a restore');
