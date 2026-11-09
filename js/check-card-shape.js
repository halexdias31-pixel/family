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

const SHAPE = ['kc-pic', 'kc-head', 'kc-tags', 'kc-lines', 'kc-act'];
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
  if (kids.join(' ') !== SHAPE.join(' ')) return 'parts are [' + kids.join(', ') + '], not [' + SHAPE.join(', ') + ']';
  return fourOf(html);
};
/* EVERY CARD (owner, 9 Nov): a picture, tags, and exactly four buttons -- main, Message, Star, ⋯ -- the rest behind ⋯. */
function fourOf(html) {
  if (/<div class="kc-pic"[^>]*><\/div>/.test(html)) return 'no picture';
  if (/<div class="kc-tags"><\/div>/.test(html)) return 'no tags';
  const rows = html.split('<span class="kc-four">').slice(1);
  if (rows.length < 1) return 'no four-button row';
  for (const r of rows) {
    const acts = []; r.split('</span>')[0].replace(/data-do="([^"]*)"/g, (m, a) => acts.push(a));
    if (acts.length !== 4 || acts[1] !== 'msg-open' || acts[2] !== 'fav' || acts[3] !== 'kc-more') return 'its row is [' + acts.join(', ') + '], not main, msg-open, fav, kc-more';
  }
  return '';
}
scope.tile_ = o => (o ? '<button class="tile" data-do="' + o.act + '"' + (o.off ? ' disabled' : '') + '></button>' : '');
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
/* EVERY FIND KIND IS DRAWN BY `findCard` (owner 1a, 8 Nov), never a card maker of its own; its own file may still write the insides (`KC_OWN`). */
/* A TOOL, GAME OR REEL IS THE LIVE WIDGET ITSELF (790: its slot, star and padlock, started by arcade.js), so it alone keeps its column's card. */
const WIDGET_KINDS = ['tool', 'game', 'reel'];
const kindsSrc = (/\nconst KINDS = \{([\s\S]*?)\n\};/.exec(finder) || [, ''])[1];
const kindNames = [];
kindsSrc.replace(/\n  ([A-Za-z]\w*):\s+\{/g, (m, k) => { kindNames.push(k); return m; });
if (kindNames.length < 20) bad.push('find-finder.js KINDS was not found (' + kindNames.length + ' kinds read)');
kindNames.forEach(k => { if (k === 'tutor' || WIDGET_KINDS.indexOf(k) >= 0) return;
  const m = new RegExp('\\n  ' + k + ':\\s+\\{[^\\n]*?card: (\\([^)]*\\)|x) => ([^\\n]*?) \\},?\\n').exec(kindsSrc + '\n');
  if (!m) bad.push('find-finder.js KINDS has no one-line ' + k + ' entry');
  else if (!/findCard\(x[,)]|findCard\(x\.soon/.test(m[2])) bad.push('find-finder.js draws ' + k + ' with ' + m[2].trim() + ', not findCard'); });
rows.forEach(r => { if (kindNames.length && kindNames.indexOf(r.kind) < 0) bad.push('card-fields.json names a kind ' + r.kind + ' that KINDS has not'); });
/* A KIND'S OWN MAKER, CUT INTO THE PARTS, STILL MAKES THE ONE SHAPE: a card that was its own `.thing`, a heading, tags and lines. */
scope.window.KC_OWN = { legacy: () => '<div class="card x" data-k="1"><div class="thing"><img src="a"><div class="thing-body"><h3>One</h3><p class="sub">s</p></div></div><span class="qtags"><b>t</b></span></div>' };
try { const w = shapeOf(String(got.findCard({ kind: 'legacy', key: 'legacy:1', name: 'One' }))); if (w) bad.push('a KC_OWN card: ' + w); } catch (e) { bad.push('a KC_OWN card: findCard threw ' + e.message); }
scope.window.KC_OWN = {};
if (!/\n  tutor:[\s\S]{0,300}?: findCard\(x\) \}/.test(finder)) bad.push('find-finder.js does not draw a tutor with findCard');

/* CLOSED IS TWO LINES: the closed card's lines are cut at two lines' height. */
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
if (!/\.card\.kc:not\(\.is-open\) > \.kc-lines \{[^}]*max-height: 3em;[^}]*line-height: 1\.5/.test(css)) bad.push('style.css no longer cuts a closed card\'s lines at two (max-height: 3em at line-height 1.5)');

if (bad.length) { console.log('✗ card shape:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('card shape: ' + rows.length + ' kinds, a kind the file does not name and a KC_OWN card, one shape (' + SHAPE.join(', ') + '); every Find kind but ' + WIDGET_KINDS.join(', ') + ' drawn by findCard');
