#!/usr/bin/env node
/* @family. — tools/spec-links.js A SPEC POINT'S QUESTIONS ARE GENERATED (docs/library-structure.md §1, 18 Nov): a question part's `spec_ref`
   (data/questions.json, `aqa-8461:4.1.1.2`, several space-separated) is the one truth; each AQA science point's `q:` links to Access Tuition
   worksheet parts (q:Q-W-AT-*) are written from it, in the worksheets' own order, so none is hand-kept. Past-paper `q:` links stay as they are
   until their parts carry `spec_ref` too.
   THE CHECK (rule 1.75): every tagged part opens a card — its spec point exists and has a point-by-point card (`ct:`). A part that would open
   nothing fails the build. Run by tools/build.js. */
'use strict';
const SD = require('./lib/site-data.js');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const CODES = ['8461', '8462', '8463'];
const KEY = /^aqa-(846[123]):([\d.]+)$/;

function run() {
  const qs = SD.questions();
  const files = {}, bad = [];
  CODES.forEach(c => { const f = path.join(ROOT, 'data/spec/aqa-' + c + '.json'); files[c] = { f, raw: fs.readFileSync(f, 'utf8') }; files[c].s = JSON.parse(files[c].raw); });
  const want = {};
  let tagged = 0;
  qs.forEach(r => {
    if (r.kind !== 'question' || !r.spec_ref || !/^W-AT-/.test(r.paper_id || '')) return;
    tagged++;
    String(r.spec_ref).split(/\s+/).filter(Boolean).forEach(k => {
      const m = KEY.exec(k), p = m && files[m[1]].s.points.find(x => x.id === m[2]);
      if (!p || !(p.links || []).some(l => /^ct:/.test(l))) return bad.push(r.row_id + ' ' + k);
      (want[k] = want[k] || []).push('q:' + r.row_id);
    });
  });
  let points = 0;
  CODES.forEach(c => {
    const { f, raw, s } = files[c];
    s.points.forEach(p => {
      const mine = want['aqa-' + c + ':' + p.id] || [];
      if (mine.length) points++;
      if (!p.links && !mine.length) return;
      p.links = (p.links || []).filter(l => !/^q:Q-W-AT-/.test(l)).concat(mine);
    });
    const out = JSON.stringify(s, null, 1) + (raw.endsWith('\n') ? '\n' : '');
    if (out !== raw) fs.writeFileSync(f, out);
  });
  /* AND THE INDEX FIND READS (data/specs.json, the spec files without their matching hints): the same links, copied on. */
  const ix = path.join(ROOT, 'data/specs.json'), ixRaw = fs.readFileSync(ix, 'utf8'), all = JSON.parse(ixRaw);
  all.forEach(e => { const c = CODES.find(k => e.id === 'aqa-' + k); if (!c) return;
    e.points.forEach(p => { const src = files[c].s.points.find(x => x.id === p.id); if (src && src.links) p.links = src.links.slice(); }); });
  const ixOut = JSON.stringify(all) + '\n';
  if (ixOut !== ixRaw) fs.writeFileSync(ix, ixOut);
  console.log('spec-links: ' + tagged + ' worksheet parts tagged; ' + points + ' AQA science points have one or more');
  if (bad.length) throw new Error('spec-links: ' + bad.length + ' tagged parts open no card: ' + bad.slice(0, 5).join(', '));
}
if (require.main === module) run();
module.exports = { run };
