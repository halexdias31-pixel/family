#!/usr/bin/env node
/* @family. — check-card-shape.js ONE CARD SHAPE (owner, 8 Nov): every `findCard` card has one
   class head and four parts in order, whatever its kind; every field card-fields.json names exists. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const bad = [];
const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/card-fields.json'), 'utf8'));
const cards = require('../tools/piece-src.js').pieceSrc('cards', ROOT);
const settings = require('../tools/piece-src.js').pieceSrc('settings', ROOT);
const finder = fs.readFileSync(path.join(ROOT, 'js/find-finder.js'), 'utf8');

/* EVERY NAME THE PAGE WOULD LOOK UP IS A HARMLESS STUB: the shape must hold even when a field's helpers are absent. */
const OWN = new Set();
(cards + '\n' + settings).replace(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm, (m, n) => OWN.add(n));
const stub = new Proxy(function () { return ''; }, { get: (f, k) => (k === Symbol.toPrimitive ? () => '' : stub), apply: () => '' });
const scope = new Proxy({
  esc: require('./check-esc.js').esc,
  libS: v => (v == null ? '' : String(v)), oops_: () => {}, on: () => {}, window: {}, console, Object, Array, String, Number, JSON, Math, Set, Map, Symbol, Boolean, RegExp, Date,
  DATA: {},
}, { has: (o, k) => !OWN.has(k), get: (o, k) => (k in o ? o[k] : k === Symbol.unscopables ? undefined : stub), set: (o, k, v) => { o[k] = v; return true; } });
/* A BUNDLE IS A CARD TOO (owner, 10 Nov): its maker and the lines it reads, lifted out of find-bundles.js by name. */
const bundles = fs.readFileSync(path.join(ROOT, 'js/find-bundles.js'), 'utf8');
const fnOf = n => (new RegExp('\\nfunction ' + n + '\\([\\s\\S]*?\\n\\}\\n').exec(bundles) || [''])[0];
const BUNDLE_SRC = ['bundleCard_', 'bundlePriceLine_', 'bundleStrayLine_'].map(n => fnOf(n) || (bad.push('find-bundles.js has no ' + n), '')).join('\n');
if (!/function bundleOf_\(\) \{\n(?:\s*\/\*[^\n]*\n)*\s*if \([^\n]*!findDone_\(\)\) return null;/.test(bundles)) bad.push('bundleOf_ does not wait for findDone_: a bundle is a card, shown only once the menus finish');
/* eslint-disable-next-line no-new-func */
const run = new Function('scope', 'with (scope) {\n' + cards.replace(/^(const|let) /gm, 'var ') + '\n'
  + settings.replace(/^(const|let) /gm, 'var ') + '\n' + BUNDLE_SRC + '\n}\nreturn { findCard, setCardFields_, KC_FIELDS, KC_DEFAULT, kcOffOpts_, bundleCard_, qtag_, cardKind_ };');
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
  /* NO ORPHANS (owner, 9 Nov): every word a card shows lives inside one of its parts, never loose in the frame. */
  const loose = html.slice(head[0].length).replace(/<div class="kc-(pic|head|tags|lines|act)"[\s\S]*$/, '').replace(/<[^>]+>/g, '').trim();
  if (loose) return 'text outside its parts: ' + loose.slice(0, 60);
  /* TAGS ARE SHORT FACTS (a credit is a later line); NO HEADING AMONG THE LINES (a widget's, a paper's): the name is a tag. */
  const tagsHtml = (/<div class="kc-tags">([\s\S]*?)<\/div><div class="kc-lines">/.exec(html) || [, ''])[1];
  const long = [];
  tagsHtml.replace(/<span class="qtag\b[^"]*"([^>]*)>([\s\S]*?)<\/span>/g, (m, at, t) => { t = t.replace(/<[^>]+>/g, '').trim(); if (!/data-tag="0"/.test(at) && t.length > 30) long.push(t); return m; });
  if (long.length) return 'a tag over 30 characters (a credit belongs in a later line): ' + long[0].slice(0, 60);
  const lines = (/<div class="kc-lines">([\s\S]*?)<div class="kc-act">/.exec(html) || [, ''])[1];
  if (!/^\s*<div class="card fc kc kc-(question|answer|setting|health)\b/.test(html) && /<h[1-4]\b/.test(lines)) return 'a heading (h1-h4) among its lines';
  /* NO TITLE LINE: the name is a tag. */
  if (!/<div class="kc-head"><\/div>/.test(html)) return 'a title line (the name belongs in the tags)';
  return fourOf(html);
};
/* EVERY CARD (owner, 9 Nov): tags, and exactly four buttons -- main, Message, Star, ⋯ -- the rest behind ⋯; a picture only when real. */
function fourOf(html) {
  const picH = (/<div class="kc-pic">([\s\S]*?)<\/div><div class="kc-head">/.exec(html) || [, ''])[1];
  if (picH && !/<(img|video|picture)\b|mfrclip-|class="(mech|tl)-pic"|pfp-art|person-pic|prof-pic|dm-pic/.test(picH)) return 'a stand-in picture: ' + picH.slice(0, 60);
  if (/<div class="kc-tags"><\/div>/.test(html)) return 'no tags';
  const rows = html.split('<span class="kc-four">').slice(1);
  if (rows.length < 1) return 'no four-button row';
  for (const r of rows) {
    const acts = []; r.split('</span>')[0].replace(/data-do="([^"]*)"/g, (m, a) => acts.push(a));
    if (acts.length !== 4 || acts[1] !== 'msg-open' || acts[2] !== 'fav' || acts[3] !== 'kc-more') return 'its row is [' + acts.join(', ') + '], not main, msg-open, fav, kc-more';
    /* FOUR BUTTONS, FOUR PICTURES: a Like that is a star beside Save reads as two Saves. */
    const icons = []; r.split('</span>')[0].replace(/<button\b[^>]*>[\s\S]*?<\/button>/g, b => { icons.push((/tile-i-([\w-]+)/.exec(b) || [, b.replace(/[\s\S]*data-do="([^"]*)"[\s\S]*/, '$1')])[1]); return b; });
    if (new Set(icons).size !== icons.length) return 'two buttons in its row share an icon: [' + icons.join(', ') + ']';
  }
  return '';
}
scope.tile_ = o => (o ? '<button class="tile" data-do="' + o.act + '"' + (o.off ? ' disabled' : '') + '><svg class="tile-i tile-i-' + o.icon + '"></svg></button>' : '');
const ROW = { title: 'Ada Tutor', name: 'Ada Tutor', handle: 'ada', rate: 30, role: 'Tutor', listed: true, mult: 1, levels: ['GCSE'], tutors: [{ title: 'Ada Tutor' }] };
rows.map(r => r.kind).concat(['some-new-kind']).forEach(kind => {
  let html = '';
  try { html = String(got.findCard({ kind, key: kind + ':1', name: 'One', row: ROW })); } catch (e) { bad.push(kind + ': findCard threw ' + e.message); return; }
  const why = shapeOf(html);
  if (why) bad.push(kind + ' card: ' + why);
});
try {
  const b = { title: 'STA · Maths · SATs', noun: '3 papers', ids: ['P1', 'P2', 'P3'], grouped: false, firsts: [], stray: {},
    papers: [{ ok: true, label: 'Paper 1' }, { ok: false, label: 'Paper 4' }], printable: [{ label: 'Paper 1', pages: 0 }, { label: 'Paper 2', pages: 0 }, { label: 'Paper 3', pages: 0 }] };
  const h = String(got.bundleCard_(b)), w = shapeOf(h);
  if (w) bad.push('bundle card: ' + w);
  if (!/class="card fc kc kc-bundle\b/.test(h)) bad.push('the bundle card is not drawn by findCard');
  if (!/<span class="kc-four"><button[^>]*data-do="cart-add"/.test(h)) bad.push('the bundle card does not lead with Add to basket');
  if (!/<div class="kc-tags">[\s\S]*STA · Maths · SATs/.test(h)) bad.push('the bundle card\'s name is not a tag');
} catch (e) { bad.push('bundle card: bundleCard_ threw ' + e.message); }
/* THE SAME TILES ON EVERY CARD OF A KIND (35a): a card without one of its kind's tiles shows it greyed, never twice; each has a handler. */
const allJs = fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f)).map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n');
scope.tile_ = o => '<button class="tile" data-do="' + o.act + '"' + (o.off ? ' disabled' : '') + '></button>';
const kcFill = (x, h) => h + (got.kcOffOpts_(x, h) || []).map(scope.tile_).join('');
rows.forEach(r => String(r.tiles || '').split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
  const act = t.split(':')[0], out = String(kcFill({ kind: r.kind, key: r.kind + ':1', row: {} }, ''));
  if (!new RegExp('data-do="' + act + '" disabled').test(out)) bad.push(r.kind + ': a card without its ' + act + ' tile does not show it greyed');
  if (String(kcFill({ kind: r.kind, key: 'k' }, '<button data-do="' + act + '"></button>')).split('data-do="' + act + '"').length !== 2) bad.push(r.kind + ': a card with its ' + act + ' tile gets a second, greyed one');
  if (!new RegExp("on\\('" + act + "'").test(allJs)) bad.push(r.kind + ': tile ' + act + ' has no on() handler');
}));
/* EVERY FIND KIND IS DRAWN BY `findCard` (owner 1a, 8 Nov), never a card maker of its own; its own file may still write the insides (`KC_OWN`). */
/* A BOOKING FORM IS A FORM, NOT A CARD (owner, 9 Nov): its fields and Send, drawn by its own file. */
const FORM_KINDS = ['bookform'];
const kindsSrc = (/\nconst KINDS = \{([\s\S]*?)\n\};/.exec(finder) || [, ''])[1];
const kindNames = [];
kindsSrc.replace(/\n  ([A-Za-z]\w*):\s+\{/g, (m, k) => { kindNames.push(k); return m; });
if (kindNames.length < 20) bad.push('find-finder.js KINDS was not found (' + kindNames.length + ' kinds read)');
kindNames.forEach(k => { if (k === 'tutor') return;
  if (FORM_KINDS.indexOf(k) >= 0) { if (!new RegExp('\\n  ' + k + ':[^\\n]*card: \\(\\) => bookFormCard_\\(\\)').test(kindsSrc)) bad.push(k + ' is a form: KINDS draws it with bookFormCard_()'); return; }
  const m = new RegExp('\\n  ' + k + ':\\s+\\{[^\\n]*?card: (\\([^)]*\\)|x) => ([^\\n]*?) \\},?\\n').exec(kindsSrc + '\n');
  if (!m) bad.push('find-finder.js KINDS has no one-line ' + k + ' entry');
  else if (!/findCard\(x[,)]|findCard\(x\.soon/.test(m[2])) bad.push('find-finder.js draws ' + k + ' with ' + m[2].trim() + ', not findCard'); });
rows.forEach(r => { if (kindNames.length && kindNames.indexOf(r.kind) < 0) bad.push('card-fields.json names a kind ' + r.kind + ' that KINDS has not'); });
/* CARDS ARE STATIC (owner, 10 Nov): no kind is drawn open or closed, no picture is a button; ⋯ is the only toggle. */
if (/\bKC_OPEN_KINDS\b|on\('kc-open'|data-do="kc-open"|is-open/.test(cards.slice(cards.indexOf('function kcFour_('), cards.indexOf('/* Tapping one opens')))) bad.push('js/cards.js still opens or closes a card (KC_OPEN_KINDS, kc-open or is-open): cards are static');
const mainOf = html => { const r = html.split('<span class="kc-four">')[1] || ''; return (/<button[^>]*>/.exec(r) || [''])[0]; };
rows.map(r => r.kind).concat(['some-new-kind']).forEach(kind => {
  const html = String(got.findCard({ kind, key: kind + ':1', name: 'One', row: ROW })), lead = mainOf(html), first = String((((d.cardFields || {})[kind] || {}).tiles || [])[0] || '');
  if (/data-do="kc-open"/.test(html)) bad.push(kind + ': a kc-open button; a card is static');
  if (/^(receipt|post|msg|shop)$/.test(kind) && !first) bad.push(kind + ': card-fields.json names no main action (Pay, Like, Reply, Buy) first in its tiles');
  if (/\bkc-off\b/.test(lead) && lead.indexOf('data-do="' + String(first).split(':')[0] + '"') < 0) bad.push(kind + ': leads with a greyed tile that is not its own main');
});
/* A KIND'S OWN MAKER, CUT INTO THE PARTS, STILL MAKES THE ONE SHAPE: a card that was its own `.thing`, a heading, tags and lines. */
/* AND ITS OWN TILE ROW AMONG THE LINES JOINS THE ONE ROW: no old insides' buttons left inside the frame. */
scope.window.KC_OWN = { legacy: () => '<div class="card x" data-k="1"><div class="thing"><img src="a"><div class="thing-body"><h3>One</h3><p class="sub">s</p></div><div class="tile-row"><button class="tile" data-do="own-go">Go</button></div></div><span class="qtags"><b>t</b></span></div>' };
try { const h = String(got.findCard({ kind: 'legacy', key: 'legacy:1', name: 'One' })), w = shapeOf(h);
  if (w) bad.push('a KC_OWN card: ' + w);
  if (/<div class="kc-lines">[\s\S]*tile-row[\s\S]*<div class="kc-act">/.test(h)) bad.push('a KC_OWN card keeps its own tile row among its lines');
  if (!/<span class="kc-four"><button class="tile" data-do="own-go"/.test(h)) bad.push('a KC_OWN card\'s own tile does not lead its row'); } catch (e) { bad.push('a KC_OWN card: findCard threw ' + e.message); }
/* A WIDGET'S OWN HEADING AND A PAPER'S SECTION HEADS LEAVE THE LINES; A LONG CREDIT TAG BECOMES A LINE (`kcTidy_`). */
scope.window.KC_OWN = { legacy: () => '<div class="card x"><span class="qtags"><span class="qtag" data-f="src">IUPAC standard atomic weights (abridged), NIST</span></span><div class="widget-slot"><div class="card"><h3>One</h3><div class="insh-sec"><h4 class="x">Area</h4><p>a</p></div></div></div></div>' };
try { const h = String(got.findCard({ kind: 'legacy', key: 'legacy:1', name: 'One' })), w = shapeOf(h);
  if (w) bad.push('a KC_OWN card with a heading in its lines and a long tag: ' + w);
  if (!/<div class="kc-lines">[\s\S]*class="kc-credit">IUPAC/.test(h)) bad.push('a long tag does not become a credit line');
  if (/>One<\/(h3|p)>/.test(h.split('<div class="kc-lines">')[1] || '')) bad.push('a widget\'s own heading (its name) is still among its lines'); } catch (e) { bad.push('a KC_OWN card: findCard threw ' + e.message); }
/* COMING SOON IS A TAG: its spec (`soonSpec_`) lifted out of find-finder.js by name and drawn by the one renderer. */
try { const soonSrc = (/\nconst soonSpec_ = [\s\S]*?\n\['soon'[^\n]*\n/.exec(finder) || [''])[0];
  scope.brand = (k, f) => f;
  /* eslint-disable-next-line no-new-func */
  new Function('scope', 'cardKind_', 'with (scope) {\n' + soonSrc.replace(/^const /gm, 'var ') + '\n}')(scope, got.cardKind_);
  const h = String(got.findCard({ kind: 'soon', key: 'soon:1', name: 'Timer', sub: 'Tools' })), w = shapeOf(h);
  if (!soonSrc) bad.push('find-finder.js has no soonSpec_ registered for soon');
  else if (w) bad.push('a Coming soon card: ' + w);
  else if (!/<div class="kc-tags">[\s\S]*Coming soon[\s\S]*<div class="kc-lines">/.test(h) || /Coming soon/.test(h.split('<div class="kc-lines">')[1])) bad.push('"Coming soon" is not a tag'); } catch (e) { bad.push('a Coming soon card: ' + e.message); }
delete scope.brand;
scope.window.KC_OWN = {};
if (!/\n  tutor:[\s\S]{0,300}?: findCard\(x\) \}/.test(finder)) bad.push('find-finder.js does not draw a tutor with findCard');

/* ONE CENTRED, STATIC ANATOMY: no closed-card rule, centred, round icons only, no stand-in picture. */
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
if (/\.card\.kc[^{]*(:not\(\.is-open\)|\.is-open)/.test(css)) bad.push('style.css still draws a closed or open card: cards are static');
if (!/\.card\.kc \{[^}]*align-items: center;[^}]*text-align: center;/.test(css)) bad.push('style.css does not centre the card anatomy (.card.kc align-items/text-align center)');
if (/\.kc-more > \.tile::after|attr\(data-word\)/.test(css)) bad.push('style.css writes a word under a round button: icons only, a long press says it');
if (!/\.card\.kc > \.kc-pic:empty \{[^}]*display: none/.test(css)) bad.push('style.css keeps room for a card with no real picture');
if (/kc-icon|lib-pic|kc-blank/.test(css + cards)) bad.push('a kind-icon or pixel-sign stand-in picture is still drawn');
/* A FACET'S SHOW FITS A TAG: the owner's short labels (labels.json facet-show:*) and every form showForms_ (find-facets.js) offers are ≤ KC_TAG_MAX. */
const tagMax = Number((/const KC_TAG_MAX = (\d+);/.exec(cards) || [])[1]);
const facetsSrc = fs.readFileSync(path.join(ROOT, 'js/find-facets.js'), 'utf8');
const showMax = Number((/const SHOW_MAX = (\d+);/.exec(facetsSrc) || [])[1]);
if (!tagMax || showMax !== tagMax) bad.push(`find-facets.js SHOW_MAX (${showMax}) is not cards.js KC_TAG_MAX (${tagMax}): a show could outgrow its tag`);
JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/labels.json'), 'utf8')).filter(r => /^facet-show:/.test(r.group || '')).forEach(r => {
  if (String(r.label || '').length > tagMax) bad.push(`labels.json ${r.group} "${r.key}": its label "${r.label}" is over ${tagMax} chars`); });
try { const fsrc = (/\nfunction showForms_\([\s\S]*?\n\}\n/.exec(facetsSrc) || [''])[0];
  /* eslint-disable-next-line no-new-func */
  const forms = new Function('SHOW_MAX', fsrc + '\nreturn showForms_;')(showMax);
  ['II-II.132.5 Whether the daughters of vainglory are suitably reckoned to be disobedience?', 'Funerals and Memorials, part 115', 'x'.repeat(80),
    '64 · Military Expeditions led by the Prophet (pbuh) (Al-Maghaazi)', 'Supercalifragilisticexpialidociousandmore words here'].forEach(s => {
    const f = forms(s); if (!f.length || f.some(t => t.length > showMax)) bad.push(`showForms_ gives no form ≤ ${showMax} for "${s.slice(0, 40)}…": ${JSON.stringify(f)}`); });
} catch (e) { bad.push('find-facets.js showForms_ could not be run: ' + e.message); }

if (bad.length) { console.log('✗ card shape:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('card shape: ' + rows.length + ' kinds, a kind the file does not name and a KC_OWN card, one shape (' + SHAPE.join(', ') + '), bundles too; every Find kind drawn by findCard');
