#!/usr/bin/env node
/* @family. — check-card-shape.js ONE CARD SHAPE (owner, 8 Nov): every `findCard` card has one
   class head and four parts in order, whatever its kind; every field card-fields.json names exists. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const bad = [];
const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/card-fields.json'), 'utf8'));
const cards = fs.readFileSync(path.join(ROOT, 'js/cards.js'), 'utf8');
const settings = fs.readFileSync(path.join(ROOT, 'js/settings.js'), 'utf8');
const finder = fs.readFileSync(path.join(ROOT, 'js/find-finder.js'), 'utf8');

/* EVERY NAME THE PAGE WOULD LOOK UP IS A HARMLESS STUB: the shape must hold even when a field's helpers are absent. */
const OWN = new Set();
(cards + '\n' + settings).replace(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm, (m, n) => OWN.add(n));
const stub = new Proxy(function () { return ''; }, { get: (f, k) => (k === Symbol.toPrimitive ? () => '' : stub), apply: () => '' });
const scope = new Proxy({
  esc: s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  libS: v => (v == null ? '' : String(v)), oops_: () => {}, on: () => {}, window: {}, console, Object, Array, String, Number, JSON, Math, Set, Map, Symbol, Boolean, RegExp, Date,
  DATA: {},
}, { has: (o, k) => !OWN.has(k), get: (o, k) => (k in o ? o[k] : k === Symbol.unscopables ? undefined : stub), set: (o, k, v) => { o[k] = v; return true; } });
/* eslint-disable-next-line no-new-func */
const run = new Function('scope', 'with (scope) {\n' + cards.replace(/^(const|let) /gm, 'var ') + '\n'
  + settings.replace(/^(const|let) /gm, 'var ') + '\n}\nreturn { findCard, setCardFields_, KC_FIELDS, KC_DEFAULT, kcTilesFill_ };');
let got = {};
try { got = run(scope); } catch (e) { bad.push('js/cards.js or js/settings.js would not load in the shape check: ' + e.message); }

const d = {};
try { got.setCardFields_(d, { 'settings/card-fields': rows }); } catch (e) { bad.push('setCardFields_ threw: ' + e.message); }
scope.DATA = d;
if (JSON.stringify(got.KC_DEFAULT) !== JSON.stringify(d.cardFields)) bad.push('KC_DEFAULT in js/cards.js is not data/settings/card-fields.json as settings.js reads it — change both together');
const fields = got.KC_FIELDS && typeof got.KC_FIELDS === 'object' ? Object.keys(got.KC_FIELDS) : [];
/* AND THE FIELDS OTHER FILES ADD (`window.KC_FIELDS_MORE`), read by name off their source. */
fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f)).forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), re = /window\.KC_FIELDS_MORE = Object\.assign\(window\.KC_FIELDS_MORE \|\| \{\}, \{\s*([\s\S]*?)\}\);\n/g;
  for (let m; (m = re.exec(src));) m[1].replace(/(?:^|,)\s*([A-Za-z_$][\w$]*):\s*x\s*=>/g, (a, n) => { fields.push(n); return a; });
});
if (!fields.length) bad.push('KC_FIELDS is not found in js/cards.js');
rows.forEach(r => ['pic', 'title', 'tags', 'lines'].forEach(p => String(r[p] || '').split(',').map(s => s.trim()).filter(Boolean)
  .forEach(f => { if (fields.indexOf(f) < 0) bad.push('card-fields.json ' + r.kind + ' names a ' + p + ' field "' + f + '" that KC_FIELDS has not'); })));

const SHAPE = ['kc-pic', 'kc-head', 'kc-tags', 'kc-lines'];
const shapeOf = html => {
  const head = /^\s*<div class="card fc kc kc-[a-z-]+[^"]*"[^>]*>/.exec(html);
  if (!head) return 'no "card fc kc kc-<kind>" head: ' + html.slice(0, 80);
  let depth = 0, at = head[0].length; const kids = [];
  const re = /<(\/?)div\b([^>]*)>/g; re.lastIndex = at;
  for (let m; (m = re.exec(html));) {
    if (m[1]) { if (depth === 0) break; depth--; continue; }
    if (depth === 0) kids.push((/class="([^"]*)"/.exec(m[2]) || [, ''])[1]);
    depth++;
  }
  return kids.join(' ') === SHAPE.join(' ') ? '' : 'parts are [' + kids.join(', ') + '], not [' + SHAPE.join(', ') + ']';
};
const ROW = { title: 'Ada Tutor', name: 'Ada Tutor', handle: 'ada', rate: 30, role: 'Tutor', listed: true, mult: 1, levels: ['GCSE'], tutors: [{ title: 'Ada Tutor' }] };
rows.map(r => r.kind).concat(['some-new-kind']).forEach(kind => {
  let html = '';
  try { html = String(got.findCard({ kind, key: kind + ':1', name: 'One', row: ROW })); } catch (e) { bad.push(kind + ': findCard threw ' + e.message); return; }
  const why = shapeOf(html);
  if (why) bad.push(kind + ' card: ' + why);
});
/* THE SAME TILES ON EVERY CARD OF A KIND (35a): a card without one of its kind's tiles shows it greyed, never twice; each has a handler. */
const allJs = fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f)).map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n');
scope.tile_ = o => '<button class="tile" data-do="' + o.act + '"' + (o.off ? ' disabled' : '') + '></button>';
rows.forEach(r => String(r.tiles || '').split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
  const act = t.split(':')[0], out = String(got.kcTilesFill_({ kind: r.kind, key: r.kind + ':1', row: {} }, ''));
  if (!new RegExp('data-do="' + act + '" disabled').test(out)) bad.push(r.kind + ': a card without its ' + act + ' tile does not show it greyed');
  if (String(got.kcTilesFill_({ kind: r.kind, key: 'k' }, '<button data-do="' + act + '"></button>')).split('data-do="' + act + '"').length !== 2) bad.push(r.kind + ': a card with its ' + act + ' tile gets a second, greyed one');
  if (!new RegExp("on\\('" + act + "'").test(allJs)) bad.push(r.kind + ': tile ' + act + ' has no on() handler');
}));
/* EVERY KIND THE SETTINGS FILE SHAPES IS DRAWN BY `findCard` IN FIND, not by a card maker of its own. */
rows.forEach(r => { if (r.kind === 'tutor') return;
  const m = new RegExp('\\n  ' + r.kind + ':\\s+\\{[^\\n]*?card: x => ([^}]*?) \\}').exec(finder);
  if (!m) bad.push('find-finder.js KINDS has no one-line ' + r.kind + ' entry');
  else if (!/findCard\(x\)/.test(m[1])) bad.push('find-finder.js draws ' + r.kind + ' with ' + m[1].trim() + ', not findCard'); });
if (!/\n  tutor:[\s\S]{0,300}?: findCard\(x\) \}/.test(finder)) bad.push('find-finder.js does not draw a tutor with findCard');

if (bad.length) { console.log('✗ card shape:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('card shape: ' + rows.length + ' kinds and a kind the file does not name, one shape (' + SHAPE.join(', ') + ')');
