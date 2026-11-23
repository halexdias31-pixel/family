#!/usr/bin/env node
/* @family. — tools/hist-db.js THE ONE-HISTORY-SHAPE CHECK (rule 1.75, unify batch 4): the four history kinds (manuscripts, figures,
   writings, events) are written once, in js/library.js HIST_DB (prefix, kind, years, icon, sub-line, link columns), and their words once,
   in data/settings/labels.json `hist-link` / `hist-kind`. A child would notice a copy drifting as a link that reads the wrong word, a tile
   with the wrong icon, or a card that no longer links back. Counted site-wide over js/*.js: a history prefix list or bare prefix, a kind
   label, or a list of link columns written anywhere but the source fails the build; so does a kind or prefix the labels do not name.
   tools/build.js runs it. */
'use strict';
const vm = require('vm');
const { text, srcFiles, main } = require('./lib/gen.js');

function find() {
  const bad = [];
  const lib = text('js/library.js');
  const m = /\nconst HIST_DB = \[[\s\S]*?\n\];\n/.exec(lib);
  if (!m) return { bad: ['js/library.js has no HIST_DB'], count: 0 };
  const DB = vm.runInNewContext(m[0].replace('const HIST_DB =', '').trim().replace(/;$/, ''));
  const labels = require('./lib/site-data.js').labels();
  const rows = Array.isArray(labels) ? labels : labels.rows || Object.values(labels).find(Array.isArray) || [];
  const has = (g, k) => rows.some(r => r.group === g && r.key === k && r.active !== false);
  const FIELDS = ['file', 'prefix', 'kind', 'years', 'icon', 'sub', 'links'];
  DB.forEach(t => {
    FIELDS.forEach(f => { if (t[f] == null) bad.push('HIST_DB ' + (t.kind || '?') + ': no `' + f + '`'); });
    if (!/^[A-Z]+-$/.test(t.prefix || '')) bad.push('HIST_DB ' + t.kind + ': prefix `' + t.prefix + '` is not LETTERS-');
    if (!has('hist-link', String(t.prefix).slice(0, -1))) bad.push('labels.json: no hist-link ' + t.prefix);
    if (!has('hist-kind', t.kind)) bad.push('labels.json: no hist-kind ' + t.kind);
  });
  const P = DB.map(t => t.prefix.slice(0, -1));
  const linkLabels = rows.filter(r => r.group === 'hist-link').map(r => r.label);
  const kindLabels = rows.filter(r => r.group === 'hist-kind').map(r => r.label);
  const cols = [...new Set(DB.reduce((a, t) => a.concat(t.links), []))];
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const RULES = [
    ['a history prefix list', new RegExp('\\b(' + P.join('|') + ')\\|(' + P.join('|') + ')\\b')],
    ['a bare history prefix', new RegExp('[\'"`/^](' + P.join('|') + ')-(?![\\dA-Z])')],
    ['a hist-link label by hand', new RegExp('\\b(' + P.join('|') + ')\\s*:\\s*[\'"](' + linkLabels.map(esc).join('|') + ')[\'"]')],
    ['a hist-kind label by hand', new RegExp('(say|histKind)\\s*:\\s*[\'"](' + kindLabels.map(esc).join('|') + ')[\'"]|labelOf_\\(\'hist-(kind|link)\',[^)]*,\\s*\'[^\']+\'\\)')],
    ['a link column list', new RegExp('\\[\\s*\'(' + cols.join('|') + ')\'\\s*,\\s*\'(' + cols.join('|') + ')\'')],
  ];
  let count = 0;
  for (const p of srcFiles('js', /\.js$/)) {
    const f = p.slice(3);
    let s = text(p);
    if (f === 'library.js') s = s.replace(m[0], '\n');
    s.split('\n').forEach((line, i) => {
      for (const [what, re] of RULES) if (re.test(line)) { count++; bad.push('js/' + f + ':' + (i + 1) + ': ' + what + ' outside HIST_DB / labels.json'); }
    });
  }
  return { bad, count, kinds: DB.length };
}

function run() {
  const { bad, kinds } = find();
  console.log('hist-db: ' + kinds + ' history kinds from HIST_DB; ' + bad.length + ' cop' + (bad.length === 1 ? 'y' : 'ies') + ' outside the source');
  if (bad.length) throw new Error('hist-db: FAILED\n  ' + bad.join('\n  '));
}
module.exports = { find, run };
main(module, run);
