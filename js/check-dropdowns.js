#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-dropdowns.js

   EVERY DROPDOWN IS THE PLATFORM'S OWN, AND NOTHING IN THE APP STANDS IN FRONT OF ONE.

   THE OWNER, 9 OCTOBER: *"i dont like currect drop down list thing. i want a more stable standard
   simple conventional drop down list."* For the week before, every single-choice `<select>` in the
   app was `pointer-events: none` and a tap near one was caught, cancelled and answered with the app's
   own floating panel, `#drop` (note 226) — and a list of several answers hung the same panel off its
   row (notes 147, 153). The reversal is note 315; the banner over `dropOnFront_` in book.js says what
   the panel cost and what to say to the next request for it.

   A PANEL LIKE THAT COMES BACK ONE SMALL PIECE AT A TIME — a `pointer-events` rule here, a listener
   that cancels a press there — and each piece is reasonable on its own. So this fails on any of the
   three pieces it was built from:

     1. A RULE THAT TAKES THE POINTER OFF A SELECT. `pointer-events: none` on a selector whose subject
        is a `select`, or a class or id that some `<select>` in the app is drawn with. That one rule
        was what kept every platform's list shut, and it is invisible to every journey: jsdom has no
        cascade, so `check-flow.js` cannot see it, and only a real finger in a real browser could.
     2. A PANEL FOR IT TO OPEN. `#drop` / `#drop-back` in index.html, or any other element there with a
        `role="listbox"` — a list the app draws for itself, outside every card.
     3. A LISTENER THAT CANCELS A SELECT'S PRESS OR TAKES ITS FOCUS. A `click`, `mousedown`,
        `pointerdown`, `touchstart`, `touchend`, `focus` or `focusin` listener that calls
        `preventDefault()` or `.blur()` and is about a select (it, or a function it calls by name, says
        `select` or `SELECT`). ONE is allowed and named: the swipe guard beside `PRESS_MOVED` in
        shell.js, which cancels a press only once the app has taken it as a swipe, and says so by
        asking `FIELD_ACTS_`. Anything else is the panel's front door being rebuilt.

   `check-flow.js` HOLDS THE OTHER HALF — a journey that presses a real select through the app's own
   dispatcher and asks that nothing cancels it, nothing blurs it and nothing appears in the document.
   Between them: the stylesheet, the markup, the listeners and the behaviour.

   PROVED BY MUTATION, which is the only way to know a check can fail: run against the commit before
   note 315 (c332f6b), all three sections name the panel; on this one, none does.

     node js/check-dropdowns.js
================================================================================================== */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const dir = __dirname;
const root = path.join(dir, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const appFiles = fs.readdirSync(dir).filter(f => /\.js$/.test(f) && !/^check/.test(f) && !/^_/.test(f));
const bad = { css: [], markup: [], listeners: [] };

/* ---------- WHAT A SELECT IS DRAWN WITH ---------------------------------------------------------------
   Every class and id on a `<select …>` the app writes, in a template or in index.html. A rule naming
   `.bk-sel` reaches a select exactly as `select` does, so both are asked about. `${…}` pieces are left
   out: an attribute assembled at run time names nothing this can read. */
const selClasses = new Set(), selIds = new Set();
let selectsSeen = 0;
for (const f of appFiles.map(f => 'js/' + f).concat(['index.html'])) {
  const src = read(f);
  for (const m of src.matchAll(/<select\b([^>]*)>/g)) {
    selectsSeen++;
    const attrs = m[1].replace(/\$\{[^}]*\}/g, ' ');
    const cls = /\bclass="([^"]*)"/.exec(attrs);
    if (cls) cls[1].split(/\s+/).filter(c => /^[\w-]+$/.test(c)).forEach(c => selClasses.add(c));
    const id = /\bid="([\w-]+)"/.exec(attrs);
    if (id) selIds.add(id[1]);
  }
}

/* ---------- 1. THE STYLESHEET ------------------------------------------------------------------------
   Comments out, then every `selectors { declarations }` at any depth of `@media` / `@supports`. The
   SUBJECT of a selector is its last compound — `.f-row select` styles the select, `select + span`
   styles the span — so only the last compound is asked whether it is a select. */
const css = read('style.css').replace(/\/\*[\s\S]*?\*\//g, '');
let rulesRead = 0;
(function rules(text) {
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open < 0) break;
    const head = text.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; }
    const body = text.slice(open + 1, j - 1);
    if (head.startsWith('@')) rules(body);
    else {
      rulesRead++;
      if (/(^|[;\s{])pointer-events\s*:\s*none\b/.test(body)) {
        head.split(',').map(s => s.trim()).filter(Boolean).forEach(sel => {
          const last = sel.split(/\s*[>+~]\s*|\s+/).filter(Boolean).pop() || '';
          const base = last.replace(/::?[\w-]+(\([^)]*\))?/g, m => (/^:(not|where|is|has)\(/.test(m) ? '' : m));
          const isSel = /^select\b/.test(base)
            || [...base.matchAll(/\.([\w-]+)/g)].some(m => selClasses.has(m[1]))
            || [...base.matchAll(/#([\w-]+)/g)].some(m => selIds.has(m[1]));
          if (isSel) bad.css.push(`\`${sel} { pointer-events: none }\` — a select under it never takes the finger, so the platform's list cannot open`);
        });
      }
    }
    i = j;
  }
})(css);

/* ---------- 2. THE MARKUP ------------------------------------------------------------------------------ */
const html = read('index.html').replace(/<!--[\s\S]*?-->/g, '');
for (const id of ['drop', 'drop-back']) {
  if (new RegExp('\\bid="' + id + '"').test(html)) bad.markup.push(`index.html draws #${id} — the floating panel a select's list was redrawn in`);
}
if (/role="listbox"/.test(html)) bad.markup.push('index.html draws a role="listbox" — a list of the app\'s own, outside every card');

/* ---------- 3. THE LISTENERS ----------------------------------------------------------------------------
   Parsed, not grepped: a listener is an `addEventListener(type, fn)` call (or `onclick = …` style is
   not used by this app for these events) with a literal type. Its source is the function's own, plus
   the source of every top-level function it calls by name — `selAt_(e)` is where the old click
   listener asked "is this a select", so one level is what it takes to see it. */
const PRESS = new Set(['click', 'mousedown', 'pointerdown', 'touchstart', 'touchend', 'focus', 'focusin']);
let listenersRead = 0;
function walk(node, fn) {
  if (!node || typeof node.type !== 'string') return;
  fn(node);
  for (const k of Object.keys(node)) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(x => walk(x, fn));
    else if (v && typeof v.type === 'string') walk(v, fn);
  }
}
const asts = {};
const tops = {};
for (const f of appFiles) {
  const src = read('js/' + f);
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' }); }
  catch (e) { bad.listeners.push(`js/${f} could not be parsed (${e.message}) — its listeners were NOT read`); continue; }
  asts[f] = { src, ast };
  for (const n of ast.body) {
    if (n.type === 'FunctionDeclaration' && n.id) tops[n.id.name] = src.slice(n.start, n.end);
    if (n.type === 'VariableDeclaration') n.declarations.forEach(d => {
      if (d.id && d.id.type === 'Identifier' && d.init && /Function/.test(d.init.type)) tops[d.id.name] = src.slice(d.init.start, d.init.end);
    });
  }
}
const lineOf = (src, at) => src.slice(0, at).split('\n').length;
for (const [f, { src, ast }] of Object.entries(asts)) {
  walk(ast, n => {
    if (n.type !== 'CallExpression') return;
    const c = n.callee;
    const name = c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && c.property ? c.property.name : '';
    if (name !== 'addEventListener') return;
    const [t, fn] = n.arguments;
    if (!t || t.type !== 'Literal' || !PRESS.has(t.value) || !fn) return;
    listenersRead++;
    let body = src.slice(fn.start, fn.end);
    if (fn.type === 'Identifier' && tops[fn.name]) body = tops[fn.name];
    const called = new Set();
    for (const m of body.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (tops[m[1]]) called.add(m[1]);
    const reach = [body].concat([...called].map(k => tops[k])).join('\n');
    const cancels = /\.preventDefault\s*\(|\.blur\s*\(/.test(reach);
    const aboutSelect = /\bselect\b|SELECT/.test(reach.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''));
    if (!cancels || !aboutSelect) return;
    if (/\bFIELD_ACTS_\b/.test(body)) return;            /* the swipe guard, named above */
    bad.listeners.push(`js/${f}:${lineOf(src, n.start)} — a \`${t.value}\` listener that cancels or blurs a select${
      called.size ? ' (through ' + [...called].join(', ') + ')' : ''} — the panel's front door`);
  });
}

/* ---------- WHAT IT FOUND --------------------------------------------------------------------------------
   A COUNT FOR EVERY SECTION, because "no select is pointer-events: none" and "no select was found to
   ask about" print the same silence. A section that read nothing fails rather than passes. */
const say = (title, rows) => {
  console.log(`\n${title}  (${rows.length})`);
  console.log(rows.length ? rows.map(r => '  ' + r).join('\n') : '  none');
};
say('A SELECT THE FINGER CANNOT REACH', bad.css);
say('A PANEL FOR A SELECT\'S LIST, IN THE MARKUP', bad.markup);
say('A LISTENER STANDING IN FRONT OF A SELECT', bad.listeners);
const blind = [];
if (!selectsSeen) blind.push('no `<select` found in js/ or index.html — the class list for section 1 is empty');
if (rulesRead < 500) blind.push(`only ${rulesRead} rules read from style.css — the stylesheet was NOT read`);
if (listenersRead < 10) blind.push(`only ${listenersRead} press listeners read — js/ was NOT read`);
if (blind.length) say('COULD NOT REACH ITS SUBJECT', blind);
console.log(`\nread ${rulesRead} rules, ${selectsSeen} <select>s drawn with ${selClasses.size} class(es) and ${selIds.size} id(s), `
          + `and ${listenersRead} press/focus listeners in ${Object.keys(asts).length} files`);
const n = bad.css.length + bad.markup.length + bad.listeners.length + blind.length;
console.log(n ? '\nFAIL — something stands between a finger and the platform\'s own list.'
              : '\nOK — every dropdown is the platform\'s own, and nothing stands in front of one.');
process.exit(n ? 1 : 0);
