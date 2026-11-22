#!/usr/bin/env node
/* @family. — tools/validate-cache.js THE QUESTIONS' CACHE CHECK (rule 1.75, queue step 2, 22 Nov). tools/validate-questions.js keeps each verdict under a
   hash of its row, its stem's figure and the marker's code, and marks again only what changed; a stale verdict would offer a broken question to a
   child or hide one that works. On made-up questions, through the real marker: a cached run equals a fresh one byte for byte, a changed key is the
   only question marked again and the file equals a full run, a code change (salt), a line in mark_ or a broken cache marks everything, and a card body no marker calls (referenceBody_) marks nothing. Fails the build. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const VQ = require('./validate-questions.js');
const { main } = require('./lib/gen.js');

const q = (id, html, accept, answer, extra) => Object.assign({ row_id: id, kind: 'question', active: true, paper_id: 'P-test', question: id, html, accept, answer, marks: 1, subject: 'Maths', key_stage: 'KS3' }, extra || {});
const ROWS = () => [
  q('t1', 'What is 2 + 2?', '4', '4'),
  q('t2', 'What is 3 + 4?', '7', '7'),
  q('t3', 'Name the capital of France.', 'Paris', 'Paris'),
  q('t4', 'What is 10 - 3?', '', ''),
  q('t5', 'Explain why the sky is blue.', '', 'Light scatters off air molecules; blue scatters most.', { marks: 6 }),
];

function run() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-cache-'));
  const out = path.join(dir, 'status.json'), cache = path.join(dir, 'cache.json'), full = path.join(dir, 'full.json');
  const bad = [];
  const go = (rows, o) => VQ.run(Object.assign({ rows, out, cache, quiet: true }, o || {}));
  const bytes = f => fs.readFileSync(f, 'utf8');
  try {
    const a = go(ROWS());
    if (!a.full || a.rechecked.length !== 5) bad.push('no cache: expected all 5 marked, got ' + a.rechecked.length);
    const first = bytes(out);
    if (JSON.stringify(a.status) === JSON.stringify({})) bad.push('nothing marked');
    if (a.status.t1 !== 'ok' || a.status.t4 !== 'broken' || a.status.t5 !== 'tutor') bad.push('made-up verdicts wrong: ' + JSON.stringify(a.status));

    const b = go(ROWS());
    if (b.full || b.rechecked.length) bad.push('unchanged: expected none marked again, got ' + JSON.stringify(b.rechecked));
    if (bytes(out) !== first) bad.push('a cached run differs from a fresh one');

    /* a private key changed: taken away, the answer is the tutor's to mark */
    const rows = ROWS(); rows[1].accept = '';
    const c = go(rows);
    if (c.full || JSON.stringify(c.rechecked) !== '["t2"]') bad.push('changed key: expected only t2 marked again, got ' + JSON.stringify(c.rechecked));
    if (c.status.t2 !== 'tutor') bad.push('changed key: t2 should now be the tutor\'s, is ' + c.status.t2);
    VQ.run({ rows, out: full, cache: path.join(dir, 'unused.json'), full: true, quiet: true });
    if (bytes(out) !== bytes(full)) bad.push('incremental after a change differs from a full run');

    const d = go(rows, { salt: 'the marker changed' });
    if (!d.full || d.rechecked.length !== 5) bad.push('code change: expected all 5 marked again, got ' + d.rechecked.length);
    if (bytes(out) !== bytes(full)) bad.push('after a code change the file differs from a full run');

    /* A CARD BODY ONLY THE PAGE DRAWS (referenceBody_, a comment changed): not on the verdict path, so nothing is marked again */
    go(rows); /* the unsalted code's cache again */
    const comment = src => { if (!src) throw new Error('validate-cache: no such declaration to touch'); return src.replace(/=>/, '=> /* touched */'); };
    const h = go(rows, { touch: { referenceBody_: comment } });
    if (h.full || h.rechecked.length) bad.push('a card body changed: expected none marked again, got ' + h.rechecked.length);
    if (bytes(out) !== bytes(full)) bad.push('after a card body changed the file differs from a full run');
    /* THE MARKER ITSELF (a line in mark_ changed): everything is marked again */
    const touchMark = { mark_: src => { if (!src) throw new Error('validate-cache: no mark_ to touch'); return src.replace('{', '{\n  /* touched */'); } };
    const m = go(rows, { touch: touchMark });
    if (!m.full || m.rechecked.length !== 5) bad.push('mark_ changed: expected all 5 marked again, got ' + m.rechecked.length);
    if (bytes(out) !== bytes(full)) bad.push('after mark_ changed the file differs from a full run');

    fs.writeFileSync(cache, '{ not json');
    const e = go(rows);
    if (!e.full || e.rechecked.length !== 5) bad.push('corrupt cache: expected a full run, got ' + e.rechecked.length);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  bad.forEach(x => console.log('  ' + x));
  console.log('validate-cache: 5 made-up questions through 8 runs (fresh, cached, one key changed, code changed, a card body changed, mark_ changed, corrupt cache); ' + bad.length + ' wrong');
  if (bad.length) throw new Error('validate-cache: the questions\' cache gave a stale or partial verdict');
}
module.exports = { run };
main(module, run);
