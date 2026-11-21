#!/usr/bin/env node
/* @family. — tools/taxonomy.js THE ONE-TAXONOMY CHECK (rule 1.75, owner 21 Nov: ONE LIBRARY SHAPE BY TAXONOMY; unify batch 3 job L).
   Each subject's levels live in data/settings/taxonomy.json; this writes them into js/find-finder.js (TAXONOMY), whose one engine
   `taxonomyRead_` reads them. A child would notice a paper or card no menu reaches, so this fails the build if a History past paper
   (data/questions.json) names a board, level, spec or component outside the taxonomy, a History topic holds a part outside it, the
   boards leave the order AQA, Edexcel, OCR, or a subject case (a quoted subject name, HTOP_PARTS, a hand histKind/histPart reader)
   comes back in the Find/library code. tools/build.js runs it before the bundle. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const S = v => String(v == null ? '' : v).trim();
const TAX_FILE = path.join(ROOT, 'data/settings/taxonomy.json');
const ENGINE = 'js/find-finder.js';
const WATCHED = ['js/history-topics.js', 'js/find-history.js', ENGINE];
const BLOCK_RE = /(\/\* TAXONOMY:start[^\n]*\n)[\s\S]*?(\/\* TAXONOMY:end \*\/)/;
const BOARD_ORDER = ['AQA', 'Edexcel', 'OCR'];

function taxonomy() { const t = JSON.parse(fs.readFileSync(TAX_FILE, 'utf8')); delete t._note; return t; }

function write(t) {
  const file = path.join(ROOT, ENGINE), src = fs.readFileSync(file, 'utf8');
  if (!BLOCK_RE.test(src)) throw new Error('taxonomy: no TAXONOMY block in ' + ENGINE);
  const out = src.replace(BLOCK_RE, (m, a, b) => a + 'const TAXONOMY = ' + JSON.stringify(t) + ';\n' + b);
  if (out !== src) fs.writeFileSync(file, out);
}

function paperProblems(t, rows) {
  const bad = [];
  Object.keys(t).forEach(subj => {
    const T = t[subj], Q = T.questions;
    if (!Q) return;
    const boards = Q.boards.map(b => b.board), known = boards.filter(b => BOARD_ORDER.includes(b));
    if (known.join() !== BOARD_ORDER.filter(b => known.includes(b)).join()) bad.push(subj + ': boards out of order (AQA, Edexcel, OCR): ' + boards.join(', '));
    const specs = {};
    Q.boards.forEach(b => b.specs.forEach(s => { specs[b.board + '|' + s.code] = { level: s.level, comps: new Set(s.components.map(c => c.code)) }; }));
    rows.filter(d => d && d.subject === T.subject && d.kind === 'document' && S(d.active) === 'True').forEach(d => {
      const code = S(d.spec_code), s = specs[S(d.exam_board) + '|' + code.split('/')[0]];
      if (!s) bad.push(d.row_id + ': board/spec ' + d.exam_board + ' ' + code + ' not in the taxonomy');
      else if (s.level !== S(d.level)) bad.push(d.row_id + ': level ' + d.level + ' is not the spec\'s ' + s.level);
      else if (!s.comps.has(code)) bad.push(d.row_id + ': component ' + code + ' not in the taxonomy');
    });
  });
  return bad;
}

function topicProblems(t) {
  const bad = [], H = t.History;
  if (!H || !H.library) return ['History: no library levels in the taxonomy'];
  const dir = path.join(ROOT, 'data/library/history'), parts = H.library.parts;
  JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).forEach(id => {
    const top = JSON.parse(fs.readFileSync(path.join(dir, id + '.json'), 'utf8'));
    if (top.timeline && !parts.timeline) bad.push('history topic ' + id + ': a timeline, but no timeline part');
    Object.keys(top).filter(k => Array.isArray(top[k]) && k !== 'spec' && !parts[k]).forEach(k => bad.push('history topic ' + id + ': part "' + k + '" not in the taxonomy'));
  });
  return bad;
}

/* NO SUBJECT CASE IN THE ENGINE: a subject's name reaches the code only through TAXONOMY. */
function codeProblems(t, read) {
  const bad = [], subjects = Object.keys(t).map(k => t[k].subject);
  WATCHED.forEach(f => {
    read(f).replace(BLOCK_RE, '').split('\n').forEach((line, i) => {
      if (/^\s*(\/\*|\*)/.test(line)) return;
      subjects.forEach(s => { if (line.includes("'" + s + "'") || line.includes('"' + s + '"')) bad.push(f + ':' + (i + 1) + ': subject "' + s + '" named in code'); });
      if (/HTOP_PARTS|^\s*hist(Kind|Part)\s*:\s*\{\s*of:/.test(line)) bad.push(f + ':' + (i + 1) + ': a hand-built history level');
    });
  });
  return bad;
}

function run() {
  const t = taxonomy();
  write(t);
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/questions.json'), 'utf8'));
  const bad = [].concat(paperProblems(t, rows), topicProblems(t), codeProblems(t, f => fs.readFileSync(path.join(ROOT, f), 'utf8')));
  const papers = rows.filter(d => d && d.subject === 'History' && d.kind === 'document' && S(d.active) === 'True').length;
  if (bad.length) { console.error('taxonomy: ' + bad.length + ' problem(s):\n  ' + bad.slice(0, 40).join('\n  ')); throw new Error('taxonomy check failed'); }
  console.log('taxonomy: ' + Object.keys(t).length + ' subject(s) as data; ' + papers + ' History papers and every topic part inside it; no subject case in the engine');
}
module.exports = { run, paperProblems, topicProblems, codeProblems, taxonomy };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
