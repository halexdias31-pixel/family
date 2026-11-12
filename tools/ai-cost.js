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
const N_COMMITS = 30, NOTE_MAX = 40 * 1024, TEST_MAX = 400000, READ_MAX = 200000, COMMENT_MAX = 0.25;
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
    bigNotes: notes.filter(n => n.b > NOTE_MAX).map(n => n.f), notes: notes.length, tests: tests.length, bigTests: tests.filter(t => t.b > TEST_MAX).length, spread: median(js.map(r => new Set(r.files).size)), spreadOk: js.filter(r => new Set(r.files).size <= 6).length, spreadOf: js.length,
  };
}
function aiCost() {
  const app = H.git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/(check|_)/.test(f));
  const all = H.git(['ls-files', 'js/']).split('\n').filter(Boolean);
  const iso = require('./isolation.js').isolation();
  const elements = iso.map(r => { const own = size(r.file), linked = (r.inboundFiles || []).reduce((a, f) => a + size(f), 0);
    return { file: r.file, own, linked, read: own + linked, from: (r.inboundFiles || []).length }; }).sort((a, b) => b.read - a.read);
  let comment = 0, total = 0, wordy = 0;
  app.concat(['style.css']).forEach(f => { const src = H.read(f), code = H.blank(src), t = src.replace(/\s/g, '').length, c = t - code.replace(/\s/g, '').length;
    total += t; comment += c; if (t && c / t > COMMENT_MAX) wordy++; });
  const tombs = tombstones(app.concat(all.filter(f => /^js\/check/.test(f)), ['style.css']));
  const claudeLines = H.read('CLAUDE.md').split('\n').length;
  const searchBytes = all.reduce((a, f) => a + size(f), 0);
  const E = effort();
  const avgRead = Math.round(elements.reduce((a, e) => a + e.read, 0) / (elements.length || 1));
  const ratio = total ? comment / total : 0;
  /* WHAT EACH MEASURE READS NOW, said plainly; the budgets in structure-budgets.json `aiCost` only go down. */
  const signals = [
    { id: 'read-bytes', count: avgRead, say: `an element costs ${Math.round(avgRead / 1024)} KB to read on average (its file + the files that use it)` },
    { id: 'comment-ratio', count: Math.round(ratio * 100), say: `${Math.round(ratio * 100)}% of app code is comment` },
    { id: 'tombstones', count: tombs.length, say: `${tombs.length} tombstone comment(s)` },
    { id: 'claude-lines', count: claudeLines, say: `CLAUDE.md is ${claudeLines} lines (budget 100)` },
    { id: 'search-bytes', count: searchBytes, say: `${Math.round(searchBytes / 1024)} KB searchable in js/` },
    /* effort is report-only: its trend is in data/health-trend.json. */
    { id: 'effort', count: E.medianLines, say: `a round changes ${E.medianLines} lines in ${E.medianFiles} files (median of ${E.commits}; worst ${E.worstLines} lines, ${E.worstFiles} files)` },
    { id: 'test-biggest', count: E.testBiggest, say: `the biggest test file, ${E.testBiggestFile}, is ${Math.round(E.testBiggest / 1024)} KB (all tests ${Math.round(E.testBytes / 1024)} KB)` },
    { id: 'big-notes', count: E.bigNotes.length, say: `${E.bigNotes.length} history note(s) over 40 KB (${E.bigNotes.join(', ')}): split each by topic, never delete` },
    { id: 'spread', count: E.spread, say: `a change to js/ touches ${E.spread} files (median)` },
  ];
  /* THE RULES (owner, 12 Nov): each measure as followed ÷ applies over a real population, or 1/1 and 0/1 where there is one thing; the score is their plain average. */
  const scanned = app.length + all.filter(f => /^js\/check/.test(f)).length + 1, tombFiles = new Set(tombs.map(t => t.where.replace(/:\d+$/, ''))).size;
  const rules = [
    { id: 'read-bytes', label: `Elements that cost under ${READ_MAX / 1000} KB to read with the files that use them`, ok: elements.filter(e => e.read <= READ_MAX).length, of: elements.length },
    { id: 'comment-ratio', label: `Files whose comments are at most ${COMMENT_MAX * 100}% of them`, ok: app.length + 1 - wordy, of: app.length + 1 },
    { id: 'tombstones', label: 'Files with no tombstone comment', ok: scanned - tombFiles, of: scanned },
    { id: 'claude-lines', label: 'CLAUDE.md within 100 lines', ok: claudeLines > 100 ? 0 : 1, of: 1 },
    { id: 'search-bytes', label: 'js/ within 4 MB to search', ok: searchBytes > 4e6 ? 0 : 1, of: 1 },
    { id: 'test-biggest', label: `Test files under ${TEST_MAX / 1000} KB`, ok: E.tests - E.bigTests, of: E.tests },
    { id: 'big-notes', label: `History notes under ${NOTE_MAX / 1024} KB`, ok: E.notes - E.bigNotes.length, of: E.notes },
    { id: 'spread', label: 'Commits to js/ that touch at most 6 files', ok: E.spreadOk, of: E.spreadOf },
  ];
  const score = Math.round(rules.reduce((a, r) => a + (r.of ? r.ok / r.of : 1), 0) / rules.length * 1000) / 10;
  return { score, rules, avgRead, commentRatio: Math.round(ratio * 1000) / 1000, tombstones: tombs, claudeLines, searchBytes, signals, effort: E, top: elements.slice(0, 10) };
}
module.exports = { aiCost, tombstones, effort };
if (require.main === module) {
  const C = aiCost();
  console.log(`ai-cost ${C.score}: avg read ${Math.round(C.avgRead / 1024)} KB, comments ${Math.round(C.commentRatio * 100)}%, tombstones ${C.tombstones.length}, CLAUDE.md ${C.claudeLines} lines, js/ ${Math.round(C.searchBytes / 1024)} KB`);
  console.log('  ' + C.signals.slice(5).map(s => s.say).join('\n  '));
  if (process.argv.includes('-v')) { C.top.forEach(e => console.log(`  ${e.file}\t${Math.round(e.read / 1024)} KB (own ${Math.round(e.own / 1024)}, ${e.from} files use it)`)); C.tombstones.forEach(t => console.log('  tombstone ' + t.where + '  ' + t.say)); }
}
