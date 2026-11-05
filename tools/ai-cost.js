#!/usr/bin/env node
/* @family. — tools/ai-cost.js WHAT A CHANGE COSTS AN AI TO READ (940): § */
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./health.js');
const ROOT = path.resolve(__dirname, '..');
const size = f => { try { return fs.statSync(path.join(ROOT, f)).size; } catch (e) { return 0; } };
/* A TOMBSTONE: a comment that only says what used to be there. Its story belongs in docs/history, not beside living code. */
const TOMB = /\/\*[- ]*(?:`[^`]+`|THE [A-Z'` ]+|[A-Z`'_ ]+) (?:IS|ARE) GONE\b|\b(?:WAS|WERE) HERE\b|\bused to be (?:written|booked|measured|drawn|here)\b|\bremoved at the owner/i;
const KEEP = /THAT IS GONE|BEFORE IT IS GONE|WHEN IT IS GONE|IF IT IS GONE|ONCE IT IS GONE|TYPED BOX IS GONE FROM|DELETED IS GONE EVERYWHERE|MARKING PASS IS GONE|DELETED POST IS GONE|TYPED PATH IS GONE|@family\./i;
function tombstones(files) {
  const out = [];
  files.forEach(f => H.read(f).split('\n').forEach((l, i) => { const s = l.trim();
    const one = (s.startsWith('/*') && s.endsWith('*/') && s.split('*/').length === 2) || (s.startsWith('//') && f.endsWith('.js'));
    if (one && TOMB.test(s) && !KEEP.test(s)) out.push({ where: f + ':' + (i + 1), say: s.slice(0, 120) }); }));
  return out;
}
/* THE FOUR MEASURES OF HOW MUCH AN AI DOES (1040): effort a round, test-file and history-note size, and how far a typical change spreads. */
const N_COMMITS = 30, NOTE_MAX = 40 * 1024;
const median = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor((b.length - 1) / 2)] : 0; };
function rounds() {
  const out = []; let c = null;
  H.git(['log', '-' + N_COMMITS, '--no-merges', '--numstat', '--format=@%h']).split('\n').forEach(l => {
    if (l.startsWith('@')) { c = { commit: l.slice(1), lines: 0, files: [] }; out.push(c); return; }
    const m = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(l); if (!m || !c) return;
    c.lines += (Number(m[1]) || 0) + (Number(m[2]) || 0); c.files.push(m[3]); });
  return out;
}
function effort() {
  const R = rounds(), js = R.filter(r => r.files.some(f => f.startsWith('js/')));
  const tests = H.git(['ls-files', 'js/check-*.js', 'check/*.js']).split('\n').filter(f => /\.js$/.test(f)).map(f => ({ f, b: size(f) })).sort((a, b) => b.b - a.b);
  const notes = H.git(['ls-files', 'docs/history/*.md']).split('\n').filter(Boolean).map(f => ({ f, b: size(f) })).sort((a, b) => b.b - a.b);
  return {
    commits: R.length, medianLines: median(R.map(r => r.lines)), worstLines: Math.max(0, ...R.map(r => r.lines)),
    medianFiles: median(R.map(r => r.files.length)), worstFiles: Math.max(0, ...R.map(r => r.files.length)),
    testBytes: tests.reduce((a, t) => a + t.b, 0), testBiggest: (tests[0] || { b: 0 }).b, testBiggestFile: (tests[0] || {}).f || '',
    historyBytes: notes.reduce((a, t) => a + t.b, 0), historyBiggest: (notes[0] || { b: 0 }).b, historyBiggestFile: (notes[0] || {}).f || '',
    bigNotes: notes.filter(n => n.b > NOTE_MAX).map(n => n.f), spread: median(js.map(r => new Set(r.files).size)),
  };
}
function aiCost() {
  const app = H.git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/(check|_)/.test(f));
  const all = H.git(['ls-files', 'js/']).split('\n').filter(Boolean);
  const iso = require('./isolation.js').isolation();
  const elements = iso.map(r => { const own = size(r.file), linked = (r.inboundFiles || []).reduce((a, f) => a + size(f), 0);
    return { file: r.file, own, linked, read: own + linked, from: (r.inboundFiles || []).length }; }).sort((a, b) => b.read - a.read);
  let comment = 0, total = 0;
  app.concat(['style.css']).forEach(f => { const src = H.read(f), code = H.blank(src); total += src.replace(/\s/g, '').length; comment += src.replace(/\s/g, '').length - code.replace(/\s/g, '').length; });
  const tombs = tombstones(app.concat(all.filter(f => /^js\/check/.test(f)), ['style.css']));
  const claudeLines = H.read('CLAUDE.md').split('\n').length;
  const searchBytes = all.reduce((a, f) => a + size(f), 0);
  const E = effort();
  const avgRead = Math.round(elements.reduce((a, e) => a + e.read, 0) / (elements.length || 1));
  const ratio = total ? comment / total : 0;
  /* THE PART'S SCORE: 100 less a capped penalty per signal; the budgets in structure-budgets.json `aiCost` only go down. */
  const signals = [
    { id: 'read-bytes', count: avgRead, off: Math.min(40, Math.max(0, avgRead - 200000) / 25000), say: `an element costs ${Math.round(avgRead / 1024)} KB to read on average (its file + the files that use it)` },
    { id: 'comment-ratio', count: Math.round(ratio * 100), off: Math.min(20, Math.max(0, ratio - 0.25) * 100), say: `${Math.round(ratio * 100)}% of app code is comment` },
    { id: 'tombstones', count: tombs.length, off: Math.min(20, tombs.length * 2), say: `${tombs.length} tombstone comment(s)` },
    { id: 'claude-lines', count: claudeLines, off: claudeLines > 100 ? 10 : 0, say: `CLAUDE.md is ${claudeLines} lines (budget 100)` },
    { id: 'search-bytes', count: searchBytes, off: Math.min(10, Math.max(0, searchBytes - 4e6) / 1e6), say: `${Math.round(searchBytes / 1024)} KB searchable in js/` },
    /* effort is report-only (its trend is in data/health-trend.json); the other three cost points. */
    { id: 'effort', count: E.medianLines, off: 0, say: `a round changes ${E.medianLines} lines in ${E.medianFiles} files (median of ${E.commits}; worst ${E.worstLines} lines, ${E.worstFiles} files)` },
    { id: 'test-biggest', count: E.testBiggest, off: Math.min(5, Math.max(0, E.testBiggest - 400000) / 100000), say: `the biggest test file, ${E.testBiggestFile}, is ${Math.round(E.testBiggest / 1024)} KB (all tests ${Math.round(E.testBytes / 1024)} KB)` },
    { id: 'big-notes', count: E.bigNotes.length, off: Math.min(5, E.bigNotes.length), say: `${E.bigNotes.length} history note(s) over 40 KB (${E.bigNotes.join(', ')}): split each by topic, never delete` },
    { id: 'spread', count: E.spread, off: Math.min(5, Math.max(0, E.spread - 6) * 0.5), say: `a change to js/ touches ${E.spread} files (median)` },
  ].map(s => Object.assign(s, { off: Math.round(s.off * 10) / 10 }));
  const score = Math.round(Math.max(0, 100 - signals.reduce((a, s) => a + s.off, 0)) * 10) / 10;
  return { score, avgRead, commentRatio: Math.round(ratio * 1000) / 1000, tombstones: tombs, claudeLines, searchBytes, signals, effort: E, top: elements.slice(0, 10) };
}
module.exports = { aiCost, tombstones, effort };
if (require.main === module) {
  const C = aiCost();
  console.log(`ai-cost ${C.score}: avg read ${Math.round(C.avgRead / 1024)} KB, comments ${Math.round(C.commentRatio * 100)}%, tombstones ${C.tombstones.length}, CLAUDE.md ${C.claudeLines} lines, js/ ${Math.round(C.searchBytes / 1024)} KB`);
  console.log('  ' + C.signals.slice(5).map(s => s.say).join('\n  '));
  if (process.argv.includes('-v')) { C.top.forEach(e => console.log(`  ${e.file}\t${Math.round(e.read / 1024)} KB (own ${Math.round(e.own / 1024)}, ${e.from} files use it)`)); C.tombstones.forEach(t => console.log('  tombstone ' + t.where + '  ' + t.say)); }
}
