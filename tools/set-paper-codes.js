#!/usr/bin/env node
/* @family. — tools/set-paper-codes.js THE CODE PRINTED BY THE BARCODE, AS ITS OWN CELL (owner 8 Nov 2026). § */
'use strict';
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'questions.json');
const S = v => String(v == null ? '' : v).trim();

/* ONE PATTERN PER BOARD, as each prints its reference; js/check-library.js holds every cover to these. */
const PATTERNS = {
  AQA: /^\d{4}(\/[A-Z])?\/\d[A-Z0-9]{0,3}$/,
  Edexcel: /^(\d[A-Z]{2}\d\/\d{1,2}[A-Z]{0,2}|PRAC[A-Z0-9]+\/\d{2})$/,
  OCR: /^[A-Z]\d{3}\/\d{2}$/,
};

/* THE ROW'S OWN CELL, written several ways over the years: "9MA0-31", "8700-01-01", "8463/1H". */
function fromSpec(spec, board) {
  let c = S(spec).toUpperCase();
  if (!c) return '';
  let m = /^(\d{4})-0?(\d)-0?1$/.exec(c);            // AQA "8700-01-01": spec, paper, version
  if (m && board === 'AQA') return m[1] + '/' + m[2];
  m = /^(\d[A-Z]{2}\d)-(\d{1,2}[A-Z]{0,2})$/.exec(c); // Edexcel "9MA0-31"
  if (m) return m[1] + '/' + m[2];
  m = /^(\d[A-Z]{2}\d)\/(\d)$/.exec(c);              // Edexcel prints a lone paper number as two digits: 9MA0/03
  if (m) return m[1] + '/0' + m[2];
  return c.includes('/') ? c : '';
}

/* A QUESTION ID SPELLS ITS PAPER: Q-<spec>-<sitting>-<paper+tier>-<number>. */
function fromQuestions(ids, board, doc) {
  for (const id of ids) {
    let m = /^Q-(\d[A-Z]{2}\d)-(?:\d{4}|SAM|SPEC)-(\d{1,2}[FH]?)-/.exec(id);
    if (m && board === 'Edexcel') return m[1] + '/' + (/^\d$/.test(m[2]) ? '0' + m[2] : m[2]);
    /* AQA RS: 7061 is the AS (first sat 2017, "Study of religion"), 7062 the A-level ("…and dialogues"); the digit after is the paper. */
    m = /^Q-(706[12])(\d)-(?:\d{4}|SPEC)-/.exec(id);
    if (m && board === 'AQA') {
      const part = /^(?:Specimen p|P)aper (\d[A-Z]?)\b/.exec(S(doc.name));
      return m[1] + '/' + (part ? part[1] : m[2]);
    }
  }
  return '';
}

/* THE FILE NAME THE PAPER WAS DOWNLOADED AS: "1ma1-3f-que-…", "1MA1_2H_QP", "Questionpaper-Paper1F-…". */
function fromUrl(url, doc) {
  const u = S(url).split('/').pop();
  let m = /1ma1[-_]?(\d)([fh])/i.exec(u);
  if (m) return '1MA1/' + m[1] + m[2].toUpperCase();
  m = /Paper(\d)([FH])-/.exec(u);
  if (m && doc.exam_board === 'Edexcel' && doc.level === 'GCSE' && doc.subject === 'Maths') return '1MA1/' + m[1] + m[2];
  return '';
}

/* EDEXCEL A-LEVEL MATHS IS 9MA0 (AS 8MA0) and its paper is the number in the title ("Paper 31: Statistics"). */
function fromTitle(doc) {
  if (doc.exam_board !== 'Edexcel' || doc.subject !== 'Maths') return '';
  const spec = doc.level === 'A-Level' ? '9MA0' : doc.level === 'AS' ? '8MA0' : '';
  const m = /^Paper (\d{1,2})\b/.exec(S(doc.name));
  return spec && m ? spec + '/' + (m[1].length === 1 ? '0' + m[1] : m[1]) : '';
}

function codeFor(doc, qids) {
  const board = S(doc.exam_board);
  const tries = [fromSpec(doc.spec_code, board), fromQuestions(qids, board, doc), fromUrl(doc.source_url, doc), fromTitle(doc)];
  return tries.find(c => c && PATTERNS[board] && PATTERNS[board].test(c)) || '';
}

/* A COVER OF A BOARD; `shown` adds that it is on the site: active, or the paper of a question that is. */
const isCover = r => !!r && r.kind === 'document' && /^(Past|Specimen) paper$/.test(S(r.document_type))
  && Object.prototype.hasOwnProperty.call(PATTERNS, S(r.exam_board));
function shownCovers(rows) {
  const asked = new Set();
  rows.forEach(r => { if (r && r.kind !== 'document' && S(r.active) !== 'False' && r.paper_id) asked.add(S(r.paper_id)); });
  return rows.filter(r => isCover(r) && (S(r.active) !== 'False' || asked.has(S(r.paper_id))));
}

module.exports = { PATTERNS, isCover, shownCovers, codeFor };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const lines = fs.readFileSync(FILE, 'utf8').split('\n');
  const rows = lines.map(l => (l.startsWith('{') ? JSON.parse(l.replace(/,$/, '')) : null));
  const qids = {};
  rows.forEach(r => { if (r && r.kind !== 'document' && r.paper_id) (qids[r.paper_id] = qids[r.paper_id] || []).push(S(r.row_id)); });
  let set = 0, kept = 0;
  const none = [], shown = new Set(shownCovers(rows.filter(Boolean)));
  rows.forEach((r, i) => {
    if (!isCover(r)) return;
    if (S(r.paper_code)) { kept++; return; }
    const code = codeFor(r, qids[r.paper_id] || []);
    if (!code) { if (shown.has(r)) none.push(r.paper_id + ' (' + r.name + ')'); return; }
    const out = {};
    Object.keys(r).forEach(k => { out[k] = r[k]; if (k === 'spec_code') out.paper_code = code; });
    if (!out.paper_code) out.paper_code = code;
    lines[i] = JSON.stringify(out) + (lines[i].endsWith(',') ? ',' : '');
    set++;
  });
  if (!check && set) fs.writeFileSync(FILE, lines.join('\n'));
  console.log((check ? 'would set ' : 'set ') + set + ' paper_code cell(s); ' + kept + ' already filled; ' + none.length + ' on the site with no code found');
  none.forEach(n => console.log('  no code: ' + n));
  if (check && set) process.exit(1);
}
