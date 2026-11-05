#!/usr/bin/env node
/* @family. — tools/ai-cost.js WHAT A CHANGE COSTS AN AI TO READ (940): per element (a loaded js file), its bytes plus the bytes of the files
   that use its names; the comment share; tombstones; CLAUDE.md's length; and every searchable byte in js/. Static, a second or two. */
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
  const avgRead = Math.round(elements.reduce((a, e) => a + e.read, 0) / (elements.length || 1));
  const ratio = total ? comment / total : 0;
  /* THE PART'S SCORE: 100 less a capped penalty per signal; the budgets in structure-budgets.json `aiCost` only go down. */
  const signals = [
    { id: 'read-bytes', count: avgRead, off: Math.min(40, Math.max(0, avgRead - 200000) / 25000), say: `an element costs ${Math.round(avgRead / 1024)} KB to read on average (its file + the files that use it)` },
    { id: 'comment-ratio', count: Math.round(ratio * 100), off: Math.min(20, Math.max(0, ratio - 0.25) * 100), say: `${Math.round(ratio * 100)}% of app code is comment` },
    { id: 'tombstones', count: tombs.length, off: Math.min(20, tombs.length * 2), say: `${tombs.length} tombstone comment(s)` },
    { id: 'claude-lines', count: claudeLines, off: claudeLines > 100 ? 10 : 0, say: `CLAUDE.md is ${claudeLines} lines (budget 100)` },
    { id: 'search-bytes', count: searchBytes, off: Math.min(10, Math.max(0, searchBytes - 4e6) / 1e6), say: `${Math.round(searchBytes / 1024)} KB searchable in js/` },
  ].map(s => Object.assign(s, { off: Math.round(s.off * 10) / 10 }));
  const score = Math.round(Math.max(0, 100 - signals.reduce((a, s) => a + s.off, 0)) * 10) / 10;
  return { score, avgRead, commentRatio: Math.round(ratio * 1000) / 1000, tombstones: tombs, claudeLines, searchBytes, signals, top: elements.slice(0, 10) };
}
module.exports = { aiCost, tombstones };
if (require.main === module) {
  const C = aiCost();
  console.log(`ai-cost ${C.score}: avg read ${Math.round(C.avgRead / 1024)} KB, comments ${Math.round(C.commentRatio * 100)}%, tombstones ${C.tombstones.length}, CLAUDE.md ${C.claudeLines} lines, js/ ${Math.round(C.searchBytes / 1024)} KB`);
  if (process.argv.includes('-v')) { C.top.forEach(e => console.log(`  ${e.file}\t${Math.round(e.read / 1024)} KB (own ${Math.round(e.own / 1024)}, ${e.from} files use it)`)); C.tombstones.forEach(t => console.log('  tombstone ' + t.where + '  ' + t.say)); }
}
