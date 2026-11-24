/* @family. — tools/lib/sets.js ONE QUESTION SET (owner, 23 Nov: UNIFY THE LIBRARY AND PRACTICE, item 3): an exam paper, a worksheet, a
   First Class Maths exercise, a Corbettmaths topic or 5-a-day, an Access Tuition set, a SATs paper — every grouping of questions is one
   kind, a SET: its own row (kind `document`) with a title (`name`) and its questions in file order (same `paper_id`). Who made it and
   which sitting it was are tags on that row: company (the source), exam_board, year, month, paper, tier. `document_type` holds the one
   word SET_KIND and nothing else; "an exam paper" is a set with an exam board, never a second kind.
   `unify` converts the file at the source (node tools/content.js sets --apply); tools/one-set.js holds it. */
'use strict';
const { S } = require('./gen.js');
const SET_KIND = 'Question set';
const isSet = r => !!r && S(r.kind) === 'document';
/* AN EXAM SET: a board's paper (past or specimen), read off its tags, not off a kind. */
const isExamSet = r => !!S(r && r.exam_board);
/* A SITTING: an exam set that was sat on a day (its month, wave or date, or a name ending "— June 2023"); a specimen was never sat. */
const hasSitting = r => isExamSet(r) && !!(S(r.month) || S(r.exam_wave) || S(r.exam_date) || /[\u2014\u2013]\s*(?:\d{1,2}\s+)?[A-Za-z]{3,9}\s+(?:19|20)\d{2}\s*$/.test(S(r.name)));

/* THE FILE'S SETS: each set's kind word, each question's set, every question in exactly one set. */
function measure(rows) {
  const sets = new Map(), kinds = new Set(), orphans = [], twice = [], wearing = [];
  rows.forEach(r => {
    if (!isSet(r)) return;
    kinds.add(S(r.document_type) || '(none)');
    if (sets.has(r.paper_id)) twice.push(r.paper_id); else sets.set(r.paper_id, r);
  });
  rows.forEach(r => {
    if (isSet(r)) return;
    if (!S(r.paper_id) || !sets.has(r.paper_id)) orphans.push(r.row_id);
    if (Object.prototype.hasOwnProperty.call(r, 'document_type')) wearing.push(r.row_id);
  });
  return { sets: sets.size, kinds: [...kinds].sort(), orphans, twice, wearing };
}

/* CONVERT: every set wears SET_KIND; a question carries no kind word of its own; a paper whose questions had no set row gets one,
   built from the paper facts its questions carried (kinds.json sheet.lib.joined), which then come off the questions. */
function unify(rows, joined) {
  const t = { kinds: 0, dropped: 0, made: [], moved: 0 };
  const have = new Set(rows.filter(isSet).map(r => r.paper_id));
  const out = [];
  const made = new Map();
  rows.forEach(r => {
    if (isSet(r)) {
      if (S(r.document_type) !== SET_KIND) { r.document_type = SET_KIND; t.kinds++; }
      out.push(r); return;
    }
    if (Object.prototype.hasOwnProperty.call(r, 'document_type')) { delete r.document_type; t.dropped++; }
    const pid = S(r.paper_id);
    if (pid && !have.has(pid)) {
      let d = made.get(pid);
      if (!d) {
        d = { row_id: 'D-' + pid, paper_id: pid, kind: 'document' };
        joined.forEach(f => { if (f !== 'document_type' && S(r[f])) d[f] = r[f]; });
        d.document_type = SET_KIND;
        if (S(r.active)) d.active = r.active;
        made.set(pid, d); t.made.push(pid);
        out.push(d);
      }
      joined.forEach(f => { if (Object.prototype.hasOwnProperty.call(r, f) && S(r[f]) === S(d[f])) { delete r[f]; t.moved++; } });
    }
    out.push(r);
  });
  return { rows: out, t };
}

module.exports = { SET_KIND, isSet, isExamSet, hasSitting, measure, unify };
