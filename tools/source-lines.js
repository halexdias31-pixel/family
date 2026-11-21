#!/usr/bin/env node
/* @family. — tools/source-lines.js THE SOURCE-LINES CHECK (rule 1.75, owner 20 Nov: "in the real exam the extract lines are printed with the question").
   1. WRITES, where data-private/ is here: every AQA English (8700, 8702) row whose words name "Source X, lines N to M" (or "lines N–M",
      "line N to the end") gets `source_lines: "X:N-M"` ("X:N-end") on its data/questions.json row, read once from its words; a row whose
      lines cannot be shown (no insert for its paper and source, or the insert's words are not in the Ledger) gets `source_lines_withheld` too,
      and keeps its caption only. Without data-private/ the rows are left as they are.
   2. CHECKS, site-wide: every row with `source_lines` either shows them (its paper's reading insert holds that source; with data-private/ here,
      the site's own `insSource_` cuts non-empty lines from it) or is withheld. Prints the count; anything else fails the build. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT, read, S } = require('./lib/gen.js');
const plain = h => S(h).replace(/<[^>]*>/g, ' ').replace(/&ndash;|&mdash;/g, '–').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
const LINES = /\blines?\s+(\d{1,3})\s*(?:to|–|—|-)\s*(\d{1,3}|the end)\b/i;
const ENGLISH = /^P-AQA-870[02]-/;

/* THE SPAN A ROW'S WORDS NAME, or null: its source the "Source X" nearest before the lines, else any in its words, else A */
function spanOf(text) {
  const t = plain(text), m = LINES.exec(t);
  if (!m) return null;
  const before = t.slice(0, m.index).match(/Source\s+([A-D])\b/gi), any = /Source\s+([A-D])\b/i.exec(t);
  const src = before ? before[before.length - 1].slice(-1).toUpperCase() : any ? any[1].toUpperCase() : 'A';
  return src + ':' + m[1] + '-' + (/end/i.test(m[2]) ? 'end' : m[2]);
}
/* THE PRINTED NUMBERS (`[n]`) IN ONE SOURCE OF AN INSERT'S WORDS (a two-source insert numbers each from 1, after its `# Source X`) */
function marks(text, span) {
  const src = span.split(':')[0], parts = String(text).split(/^# Source /m);
  const sec = parts.length > 1 ? (parts.find(p => p.charAt(0).toUpperCase() === src) || '') : String(text);
  return (sec.match(/\[(\d{1,3})\]/g) || []).map(m => +m.slice(1, -1));
}
const insFor = (inserts, paper, src) => inserts.find(i => S(i.for_papers).split(/[\s,]+/).indexOf(paper) !== -1
  && (!S(i.sources) || S(i.sources).split(/[\s,]+/).indexOf(src) !== -1));

function run() {
  const pubPath = path.join(ROOT, 'data', 'questions.json');
  const rows = read('data/questions.json') || [], inserts = read('data/inserts.json') || [];
  const priv = read('data-private/questions.json'), privIns = read('data-private/inserts.json');
  /* the site's own cutter, to see the lines come out */
  let cut = null;
  if (privIns) {
    /* the site's own insSource_ (find-history.js), read out of the file, its blocks flattened to their words */
    const acorn = require(path.join(ROOT, 'node_modules', 'acorn')), vm = require('vm');
    const src = fs.readFileSync(path.join(ROOT, 'js', 'find-history.js'), 'utf8');
    const fn = acorn.parse(src, { ecmaVersion: 2022 }).body.find(n => n.type === 'FunctionDeclaration' && n.id.name === 'insSource_');
    if (!fn) throw new Error('source-lines: insSource_ is gone from js/find-history.js');
    const ctx = vm.createContext({ cardBlocks_: bs => bs.map(b => [].concat(b.text).map(t => typeof t === 'string' ? t : '').join('')).join(' ') });
    vm.runInContext(src.slice(fn.start, fn.end), ctx);
    cut = (text, span) => {
      const m = /^([A-Z]):(\d+)-(\d+|end)$/.exec(span);
      return S(ctx.insSource_({ sourceText: text, lineNumbers: true }, +m[2], m[3] === 'end' ? 999 : +m[3], m[1]));
    };
  }
  const why = (r, span) => {
    const ins = insFor(inserts, S(r.paper_id), span.split(':')[0]);
    if (!ins) return 'no insert for this paper and source';
    if (!/\bsource_text\b/.test(S(ins.lib_has))) return 'insert words withheld';
    if (privIns) {
      const t = privIns[ins.insert_id] && privIns[ins.insert_id].source_text;
      if (!S(t)) return 'insert words not in the Ledger';
      /* THE FIRST LINE MUST BE A PRINTED NUMBER (`[n]`) in that source, or the cut would start somewhere else */
      const from = +span.split(/[:-]/)[1];
      if (from !== 1 && marks(t, span).indexOf(from) === -1) return 'line ' + from + ' is not marked in the insert';
      if (!cut(t, span)) return 'those lines are not in the insert';
    }
    return '';
  };
  /* 1. WRITE */
  if (priv) {
    let changed = 0;
    /* the English papers: 8700 and 8702 by id, and any paper an English insert is for (the R0 practice papers) */
    const eng = new Set(inserts.filter(i => /English/i.test(S(i.subject))).flatMap(i => S(i.for_papers).split(/[\s,]+/).filter(Boolean)));
    for (const r of rows) {
      if (!ENGLISH.test(S(r.paper_id)) && !eng.has(S(r.paper_id))) continue;
      const p = priv[r.row_id] || {};
      const span = spanOf([r.lines, p.lead, p.html].join(' '));
      const was = S(r.source_lines) + '|' + S(r.source_lines_withheld);
      delete r.source_lines; delete r.source_lines_withheld;
      if (span) { r.source_lines = span; const w = why(r, span); if (w) r.source_lines_withheld = w; }
      if (S(r.source_lines) + '|' + S(r.source_lines_withheld) !== was) changed++;
    }
    if (changed) fs.writeFileSync(pubPath, '[\n' + rows.map(r => JSON.stringify(r)).join(',\n') + '\n]\n');
    console.log('source-lines: ' + changed + ' row(s) rewritten');
  } else console.log('source-lines: no data-private/questions.json here, rows left as they are');
  /* 2. CHECK */
  const n = { shown: 0, withheld: 0, bad: 0 }, bad = [], held = [];
  for (const r of rows) {
    const span = S(r.source_lines);
    if (!span) continue;
    if (!/^[A-Z]:\d{1,3}-(\d{1,3}|end)$/.test(span)) { n.bad++; bad.push(r.row_id + ' (source_lines "' + span + '")'); continue; }
    if (S(r.source_lines_withheld)) { n.withheld++; held.push(r.row_id + ' ' + span + ': ' + S(r.source_lines_withheld)); continue; }
    const w = why(r, span);
    if (w) { n.bad++; bad.push(r.row_id + ' ' + span + ': ' + w); continue; }
    n.shown++;
    /* AN END THE INSERT DOES NOT MARK (no `[to+1]`): the cut runs on to its next printed number; counted, not failed */
    const to = span.split('-')[1], ins = privIns && insFor(inserts, S(r.paper_id), span.split(':')[0]);
    if (ins && to !== 'end' && marks(privIns[ins.insert_id].source_text, span).indexOf(+to + 1) === -1) n.runOn = (n.runOn || 0) + 1;
  }
  console.log('source-lines: ' + n.shown + '/' + (n.shown + n.withheld + n.bad) + ' rows naming source lines show them; ' + n.withheld + ' withheld (caption only)'
    + (n.runOn ? '; ' + n.runOn + ' end on a line the insert does not number, so run on to its next number' : ''));
  held.forEach(h => console.log('  withheld ' + h));
  bad.slice(0, 40).forEach(b => console.log('  ' + b));
  if (n.bad) throw new Error('source-lines: ' + n.bad + ' row(s) name source lines they neither show nor withhold');
  return n;
}
module.exports = { run, spanOf };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
