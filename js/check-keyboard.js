#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-keyboard.js THE @family KEYPAD IS THE ONLY ON-SCREEN KEYBOARD, ON EVERY BOX THE SITE DRAWS (526). § */
/* Two halves. THE SOURCE: every <input>, <textarea> and editable piece any shipped file can draw, put into the real app, bound by the
   time a finger could reach it. THE SCREENS: every column drawn as an Admin, every box on it tapped. */
'use strict';
const fs = require('fs');
const path = require('path');
const { app, tick, ROOT } = require('../check/jsdom-app');
let acorn;
try { acorn = require(path.join(ROOT, 'node_modules', 'acorn')); }
catch (e) { console.log('check-keyboard: acorn is not installed (npm install) — NOTHING was checked'); process.exit(1); }

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
if (!m) { console.log('check-keyboard: cannot read window.FILES out of index.html — NOTHING was checked'); process.exit(1); }
const FILES = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1] + '.js');
const SRC = {};
FILES.forEach(f => { SRC[f] = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'); });

/* ---------- WHAT TAKES TEXT, written here and not read from keypad.js, so a rule narrowed there is caught here ---------- */
const TEXT_TYPES = ['', 'text', 'search', 'email', 'url', 'tel', 'password', 'number'];
/* EVERY OTHER TYPE A SHIPPED FILE DRAWS, and why the pad is not its keyboard. A type on neither list fails: it is a box nobody decided about. */
const NOT_TEXT = {
  checkbox: 'a tick', radio: 'a choice', range: 'a slider', color: 'the browser\'s colour picker', date: 'the browser\'s date picker',
  time: 'the browser\'s time picker', file: 'a file chosen, never typed', hidden: 'never seen', button: 'a press', submit: 'a press',
};
const takesText = el => {
  if (el.classList.contains('kp-in')) return false;
  if (el.tagName === 'TEXTAREA') return true;
  if (el.tagName === 'INPUT') return TEXT_TYPES.indexOf(String(el.getAttribute('type') || '').trim().toLowerCase()) !== -1;
  const ce = el.getAttribute('contenteditable');
  return ce != null && /^(|true|plaintext-only)$/i.test(ce.trim());
};
/* THE FACE A BOX OPENS ON, from what its markup says it is */
const faceOf = (el, was) => {
  const ty = String(el.getAttribute('type') || '').toLowerCase();
  const im = String(was || '').toLowerCase();
  if (/^(number|tel)$/.test(ty) || /^(numeric|decimal|tel)$/.test(im)) return 'num';
  if (/^(email|url)$/.test(ty) || /^(email|url)$/.test(im)) return 'mail';
  return 'abc';
};

/* ---------- THE SOURCE: every box any file can draw ---------- */
function tagAt(src, p) {
  let i = p, depth = 0;
  while (i < src.length) {
    const c = src[i];
    if (depth === 0 && c === '>') return src.slice(p, i + 1);
    if (c === '$' && src[i + 1] === '{') { depth++; i += 2; continue; }
    if (depth > 0 && c === '{') depth++;
    else if (depth > 0 && c === '}') depth--;
    i++;
  }
  return src.slice(p, p + 300);
}
/* A TAG WITH ITS EXPRESSIONS TAKEN OUT: `${…}` inside a quoted value is a word, and one standing alone writes attributes this cannot know, so it goes */
function plainTag(text) {
  let out = '', i = 0, q = '';
  while (i < text.length) {
    const c = text[i];
    if (c === '$' && text[i + 1] === '{') {
      let depth = 1, j = i + 2;
      while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; }
      if (q) out += 'x';
      i = j;
      continue;
    }
    if (!q && (c === '"' || c === '\'')) q = c; else if (q && c === q) q = '';
    out += c;
    i++;
  }
  return out.replace(/\\(["'`])/g, '$1');
}
const sites = [];
const bad = [];
for (const f of FILES) {
  const src = SRC[f];
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true }); }
  catch (e) { console.log('check-keyboard: ' + f + ' does not parse (' + e.message + ') — NOTHING was checked'); process.exit(1); }
  (function walk(n, fn) {
    if (!n || typeof n.type !== 'string') return;
    let name = fn;
    if (/Function/.test(n.type) && n.id && n.id.name) name = n.id.name;
    if (n.type === 'VariableDeclarator' && n.id && n.id.name && n.init && /Function/.test(n.init.type)) name = n.id.name;
    const spans = [];
    if (n.type === 'Literal' && typeof n.value === 'string') spans.push([n.start, n.end]);
    if (n.type === 'TemplateElement') spans.push([n.start, n.end]);
    for (const [a, b] of spans) {
      const seg = src.slice(a, b);
      const re = /<([a-z][\w-]*)\b/gi;
      let t;
      while ((t = re.exec(seg))) {
        const tag = t[1].toLowerCase();
        const text = tagAt(src, a + t.index);
        if (!(tag === 'input' || tag === 'textarea' || /\scontenteditable\b/i.test(text))) continue;
        sites.push({ file: f, fn: name, line: src.slice(0, a + t.index).split('\n').length, tag, text: text.replace(/\s+/g, ' ') });
      }
    }
    if (n.type === 'CallExpression' && n.callee && n.callee.property && n.callee.property.name === 'createElement'
        && n.arguments[0] && /^(input|textarea)$/.test(n.arguments[0].value)) {
      sites.push({ file: f, fn: name, line: n.loc.start.line, tag: n.arguments[0].value, text: '<' + n.arguments[0].value + '>', made: true });
    }
    for (const k in n) {
      if (k === 'loc') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(c => c && typeof c === 'object' && walk(c, name));
      else if (v && typeof v === 'object' && typeof v.type === 'string') walk(v, name);
    }
  })(ast, '(top)');
}
/* AN EDITABLE PIECE OF WORDS (words.js, 497) is written as an attribute string, not a tag, so the walk above cannot see it: asked here in the shape words.js draws */
if (/contenteditable="plaintext-only"/.test(SRC['words.js'] || '')) sites.push({ file: 'words.js', fn: 'wordsIn_', line: 0, tag: 'p', text: '<p data-wk="x|p:1" contenteditable="plaintext-only" spellcheck="true">' });
else bad.push('words.js no longer draws an editable piece as contenteditable="plaintext-only" — update the shape this check asks about');
/* AND WHAT NO FILE BUT keypad.js MAY DO: write `data-kpb` (the binding's own mark), or hide a box where the binding cannot see (a shadow root) */
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
FILES.forEach(f => {
  const s = strip(SRC[f]);
  if (f !== 'keypad.js' && /data-kpb|dataset\.kpb/.test(s)) bad.push('js/' + f + ' writes or names `data-kpb` — only kpBind_ (keypad.js) binds a box to the pad');
  if (/attachShadow\s*\(/.test(s)) bad.push('js/' + f + ' opens a shadow root — a box drawn in one is out of the binding\'s sight, and the phone\'s keyboard comes up on it');
});
const kp = strip(SRC['keypad.js'] || '');
if (!/new MutationObserver\([\s\S]{0,160}kpBindIn_\([\s\S]{0,120}\.observe\(document\.documentElement, \{ childList: true, subtree: true \}\)/.test(kp)) {
  bad.push('keypad.js has no MutationObserver over the whole document calling `kpBindIn_` — a box drawn after the first screen keeps the phone\'s keyboard');
}
if (!/document\.addEventListener\('focusin', e => \{\s*const t = e\.target;\s*kpBind_\(t\);/.test(kp)) bad.push('keypad.js does not bind a box on its way in (`focusin`, capture) — a box drawn and focused in one go is not bound in time');

(async () => {
  let FIX;
  try { FIX = JSON.parse(fs.readFileSync(path.join(ROOT, 'check/fixture.json'), 'utf8')); }
  catch (e) { console.log('check-keyboard: cannot read check/fixture.json — NOTHING was checked'); process.exit(1); }
  const a = await app(FIX);
  const { w, h } = a;
  const d = w.document;
  if (typeof w.kpBind_ !== 'function' || typeof w.kpOpen_ !== 'function' || typeof w.kpClose_ !== 'function') {
    console.log('check-keyboard: the keypad\'s binding is not in the app (kpBind_, kpOpen_, kpClose_) — NOTHING was checked');
    process.exit(1);
  }
  const pad = () => d.getElementById('kp');
  const said = [];
  const types = {};
  let taps = 0;
  /* ONE BOX: bound (inputmode none, its face, no readonly the markup did not write), and a tap brings the pad up on that face — or, readonly or disabled, not at all */
  /* `was` IS THE inputmode THE MARKUP WROTE, which the binding has written over; null on a screen, where only the type is known */
  const ask = (el, where, ro, was) => {
    if (!takesText(el)) {
      if (el.hasAttribute('data-kpb') || (el.getAttribute('inputmode') === 'none' && !el.classList.contains('kp-in'))) bad.push(where + ' is not a text box and was bound to the pad: ' + el.outerHTML.slice(0, 140));
      return 'other';
    }
    const face = el.getAttribute('data-kpb');
    if (el.getAttribute('inputmode') !== 'none') { bad.push(where + ' takes text and has inputmode=' + JSON.stringify(el.getAttribute('inputmode')) + ' — the phone\'s keyboard comes up on it: ' + el.outerHTML.slice(0, 160)); return 'open'; }
    const want = faceOf(el, was);
    if (was === null ? (want !== 'abc' && face !== want) || ['abc', 'mail', 'num'].indexOf(face) === -1 : face !== want) bad.push(where + ' opens on the ' + JSON.stringify(face) + ' face, wanted ' + JSON.stringify(want) + ': ' + el.outerHTML.slice(0, 160));
    if (el.hasAttribute('readonly') && !ro) bad.push(where + ' was made readonly by a script — the readonly lock is the answer box\'s; a box elsewhere is a field a reader can edit');
    const writable = !el.readOnly && !el.disabled;
    w.kpClose_();
    el.dispatchEvent(new w.Event('pointerdown', { bubbles: true }));
    try { el.focus(); } catch (e) { /* asked below */ }
    const p = pad();
    const isUp = !!p && !p.hidden && d.activeElement === el;
    if (writable && d.activeElement === el) {
      if (!isUp) bad.push(where + ' was tapped and the pad did not come up: ' + el.outerHTML.slice(0, 140));
      else {
        const want = face === 'num' ? 'maths' : 'abc';
        if (p.getAttribute('data-layer') !== want) bad.push(where + ' opened the pad on ' + p.getAttribute('data-layer') + ', wanted ' + want);
        if (!!p.querySelector('.kp-key[data-v="@"]') !== (face === 'mail' || face === 'num')) bad.push(where + (face === 'mail' ? ' is an address and its letters have no @' : ' has @ on its ' + p.getAttribute('data-layer') + ' face, which only an address\'s letters and the digits carry'));
        if (p.querySelector('.kp-key[data-v="!frac"], .kp-key[data-v="!vec"]')) bad.push(where + ' is not an answer box and its pad has the answer box\'s fraction or vector key');
      }
    } else if (!writable && isUp) bad.push(where + ' is readonly or disabled and a tap still brought the pad up');
    else if (writable) bad.push(where + ' could not take the focus, so whether the pad comes up on it was not asked');
    if (isUp) taps++;
    try { el.blur(); } catch (e) { /* the next box takes the focus anyway */ }
    w.kpClose_();
    types[face] = (types[face] || 0) + 1;
    return 'bound';
  };

  /* 1. THE SOURCE: each box any file can draw, put into the running app and asked after the binding has had its turn */
  const host = d.createElement('div');
  d.body.appendChild(host);
  let fromSource = 0, notText = 0;
  for (const s of sites) {
    const where = 'js/' + s.file + ':' + s.line + ' (' + s.fn + ')';
    const tag = plainTag(s.text);
    const ty = (/\btype\s*=\s*["']([^"']*)["']/i.exec(tag) || [])[1];
    if (s.tag === 'input' && ty !== undefined && ty !== 'x' && TEXT_TYPES.indexOf(ty.toLowerCase()) === -1 && !NOT_TEXT[ty.toLowerCase()]) {
      bad.push(where + ' draws an <input type="' + ty + '"> — neither a text box the pad types into nor a type this check knows the pad leaves alone (NOT_TEXT)');
      continue;
    }
    if (/\bkp-in\b/.test(tag)) continue;
    host.innerHTML = s.tag === 'textarea' ? tag + '</textarea>' : s.tag === 'input' ? tag : tag + '</' + s.tag + '>';
    await tick(0);
    const el = host.firstElementChild;
    if (!el) { bad.push(where + ' could not be drawn from ' + tag.slice(0, 120)); continue; }
    const r = ask(el, where, /\sreadonly\b/i.test(tag), (/\binputmode\s*=\s*["']([^"']*)["']/i.exec(tag) || [])[1] || '');
    if (r === 'other') notText++; else fromSource++;
  }
  host.remove();

  /* 2. THE SCREENS: every column as an Admin, and the sign-in card a visitor sees, every box on them */
  for (const t of h.TABS) { try { h.go(t.id, false, true); h.paint(t.id, true); } catch (e) { bad.push(t.id + ' threw while drawing: ' + e.message); } }
  const extra = d.createElement('div');
  d.body.appendChild(extra);
  try { extra.innerHTML = w.signInCard_() + w.msgForm_('Tom Tutor', 'P-TOM'); } catch (e) { bad.push('the sign-in card or the composer did not draw: ' + e.message); }
  await tick(50);
  const onScreen = [...d.querySelectorAll('input, textarea, [contenteditable]')].filter(el => !el.closest('#kp'));
  let screenBoxes = 0;
  for (const el of onScreen) {
    const s = el.closest('.screen');
    const where = (s ? s.id : 'a sheet') + ' ' + el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.getAttribute('data-me') ? '[data-me=' + el.getAttribute('data-me') + ']' : '');
    if (el.classList.contains('kp-in')) continue;
    if (ask(el, where, true, null) === 'bound') screenBoxes++;
  }
  if (fromSource < 60) bad.push('only ' + fromSource + ' text boxes were drawn from the source — the walk did not find them all');
  if (screenBoxes < 40) bad.push('only ' + screenBoxes + ' text boxes on the screens — the columns did not draw');
  /* THE FACE IS READ FROM THE MARKUP BEFORE THE BINDING WRITES OVER IT: the sign-in PIN's inputmode="numeric" is the digits */
  const pin = d.getElementById('in-pin');
  if (!pin || pin.getAttribute('data-kpb') !== 'num') bad.push('the sign-in PIN box is bound to ' + JSON.stringify(pin && pin.getAttribute('data-kpb')) + ' — its markup asks for digits');
  said.push(sites.length + ' boxes in the source of ' + FILES.length + ' files: ' + fromSource + ' text boxes bound, ' + notText + ' that take no text left alone; '
    + screenBoxes + ' text boxes on ' + h.TABS.length + ' columns and the sign-in card; ' + taps + ' taps brought the pad up (faces: ' + Object.keys(types).sort().map(k => k + ' ' + types[k]).join(', ') + ')');
  a.close();
  console.log('');
  said.forEach(s => console.log('  ' + s));
  console.log('\nWRONG  (' + bad.length + ')');
  if (!bad.length) console.log('  none');
  bad.forEach(b => console.log('  ' + b));
  if (bad.length) {
    console.log('\nFAILED — a box the pad does not own is a box the phone\'s keyboard comes up on (docs/history/526).');
    process.exit(1);
  }
  console.log('\nOK — every box the site can draw types on the @family keypad, and the phone\'s keyboard has no way in.');
  process.exit(0);
})().catch(e => { console.log('check-keyboard could not run: ' + (e && e.stack || e)); process.exit(1); });
