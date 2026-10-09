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
        is a `select`, or a class or id that some `<select>` in the app is drawn with — or, because the
        property is INHERITED, an element some `<select>` is drawn inside (`.mat-sel`, `label.field`),
        or a subject that names no element at all (`.field > *`), which reaches a select as surely as
        `select` does. That one rule was what kept every platform's list shut, and it is invisible to
        every journey: jsdom has no cascade, so `check-flow.js` cannot see it. The same in a script:
        `style.pointerEvents = 'none'`, or a `style="…pointer-events:none…"` on a select or a wrapper of
        one, in a function that is about a select. `check/press.js` asks the same question of the real
        cascade with a real finger, on every page of every column that draws a select.
     2. A PANEL FOR IT TO OPEN. `#drop` / `#drop-back` in index.html, or any other element there with a
        `role="listbox"` — a list the app draws for itself, outside every card.
     3. A LISTENER THAT CANCELS A SELECT'S PRESS OR TAKES ITS FOCUS. A `click`, `mousedown`,
        `pointerdown`, `touchstart`, `touchend`, `focus` or `focusin` listener that calls
        `preventDefault()` or `.blur()` and is about a select (it, or a function it calls by name, says
        `select` or `SELECT`). ONE STATEMENT is allowed and named: the swipe guard beside `PRESS_MOVED`
        in shell.js, `if (….closest(FIELD_ACTS_)) e.preventDefault();`, which cancels a press only once
        the app has taken it as a swipe. Those statements are taken out and the REST of the listener is
        still read — the guard lives in the app's own click dispatcher, the likeliest place of all for
        a panel's front door to come back, and for one commit the whole dispatcher was let off because
        it mentioned the guard's name (found by review, 9 October). Anything else is the panel's front
        door being rebuilt.

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
const classesIn = text => {
  const out = [];
  for (const m of String(text).matchAll(/\bclass="([^"]*)"/g)) {
    m[1].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/).filter(c => /^[\w-]+$/.test(c)).forEach(c => out.push(c));
  }
  return out;
};
for (const f of appFiles.map(f => 'js/' + f).concat(['index.html'])) {
  const src = read(f);
  for (const m of src.matchAll(/<select\b([^>]*)>/g)) {
    selectsSeen++;
    const attrs = m[1].replace(/\$\{[^}]*\}/g, ' ');
    classesIn(attrs).forEach(c => selClasses.add(c));
    const id = /\bid="([\w-]+)"/.exec(attrs);
    if (id) selIds.add(id[1]);
  }
  /* AND A CLASS A SCRIPT LOOKS A SELECT UP BY — `select.q-name` — which names a select's class however
     its markup was assembled. */
  for (const m of src.matchAll(/\bselect((?:\.[\w-]+)+)/g)) m[1].split('.').filter(Boolean).forEach(c => selClasses.add(c));
}

/* ---------- 1. THE STYLESHEET ------------------------------------------------------------------------
   Comments out, then every `selectors { declarations }` at any depth of `@media` / `@supports`. The
   SUBJECT of a selector is its last compound — `.f-row select` styles the select, `select + span`
   styles the span — so only the last compound is asked whether it is a select. */
/* ---------- WHAT A SELECT IS DRAWN INSIDE ---------------------------------------------------------------
   `pointer-events` IS INHERITED (shell.js says so where it writes it on the columns), so a rule on a
   select's wrapper reaches the select as surely as one on the select. Every `<select` the app writes is
   found in its template, and the elements still open around it in that template — and in the template
   it is interpolated into — are its wrappers: `<label class="mat-sel"><select …>`, fieldHtml's
   `<label class="field">`. A wrapper assembled in another function is beyond this; `check/press.js`
   asks the real cascade for that half. */
const wrappers = [];                 /* { tag, classes, id, where } */
const inlineNone = [];               /* a `style="…pointer-events:none…"` on a select or a wrapper */
const VOID = new Set(['input', 'br', 'img', 'hr', 'meta', 'link', 'source', 'wbr', 'col', 'area', 'base', 'track', 'embed']);
function tagsThrough(text, stack, onSelect) {
  for (const m of text.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    const close = m[1] === '/', name = m[2].toLowerCase(), attrs = m[3] || '';
    if (close) {
      const at = stack.map(t => t.tag).lastIndexOf(name);
      if (at >= 0) stack.length = at;
      continue;
    }
    const id = (/\bid="([\w-]+)"/.exec(attrs) || [])[1] || '';
    const none = /pointer-events\s*:\s*none/i.test(attrs);
    if (name === 'select') { onSelect(stack.slice(), none); continue; }
    if (VOID.has(name) || /\/\s*$/.test(attrs)) continue;
    stack.push({ tag: name, classes: classesIn(attrs), id, none });
  }
  return stack;
}
const seenWrap = (where, stack, none) => {
  stack.forEach(t => wrappers.push(Object.assign({ where }, t)));
  if (none) inlineNone.push(`${where} — a select drawn with \`pointer-events: none\` in its own style`);
  stack.filter(t => t.none).forEach(t => inlineNone.push(`${where} — a select inside a <${t.tag}> drawn with \`pointer-events: none\``));
};
function walkTemplate(node, stack, where, srcOf) {
  /* THE QUASIS IN ORDER, each expression between them walked with the wrappers open at that point. */
  node.quasis.forEach((q, i) => {
    tagsThrough(q.value.raw, stack, (st, none) => seenWrap(where(q.start), st, none));
    const ex = node.expressions[i];
    if (ex) walkInside(ex, stack.slice(), where, srcOf);
  });
}
function walkInside(node, stack, where, srcOf) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'TemplateLiteral') return walkTemplate(node, stack.slice(), where, srcOf);
  if (node.type === 'Literal' && typeof node.value === 'string') {
    tagsThrough(node.value, stack.slice(), (st, none) => seenWrap(where(node.start), st, none));
    return;
  }
  for (const k of Object.keys(node)) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(x => walkInside(x, stack, where, srcOf));
    else if (v && typeof v.type === 'string') walkInside(v, stack, where, srcOf);
  }
}

/* ---------- 1. THE STYLESHEET ------------------------------------------------------------------------
   Comments out, then every `selectors { declarations }` at any depth of `@media` / `@supports`. The
   SUBJECT of a selector is its last compound — `.f-row select` styles the select, `select + span`
   styles the span — so only the last compound is asked about. Inside an `:is()` or a `:where()` each
   alternative is a subject of its own; `:not()` and `:has()` narrow and name nothing. The value is read
   in any case (`NONE` is `none`). */
const css = read('style.css').replace(/\/\*[\s\S]*?\*\//g, '');
let rulesRead = 0;
const cssRules = [];
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
    else { rulesRead++; if (/(^|[;\s{])pointer-events\s*:\s*none\b/i.test(body)) cssRules.push(head); }
    i = j;
  }
})(css);
/* A SELECTOR LIST SPLIT AT ITS TOP-LEVEL COMMAS, so `:is(a, b)` stays one piece. */
const splitTop = (text, at) => {
  const out = []; let depth = 0, cur = '';
  for (const ch of text) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    if (depth === 0 && at.test(ch)) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map(x => x.trim()).filter(Boolean);
};
const lastCompound = sel => {
  const parts = []; let depth = 0, cur = '';
  for (const ch of sel) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    if (depth === 0 && /[\s>+~]/.test(ch)) { if (cur) parts.push(cur); cur = ''; } else cur += ch;
  }
  if (cur) parts.push(cur);
  return parts.pop() || '';
};
/* WHAT ONE COMPOUND NAMES: its type, classes and id, and the subjects of any `:is()`/`:where()` in it. */
function compound(c) {
  /* A PSEUDO-ELEMENT IS ITS OWN BOX, not the element it hangs off and not its children: `.card::after
     { pointer-events: none }` is a veil that lets taps through, the opposite of a wall. */
  if (/::?(before|after|marker|placeholder|backdrop|first-line|first-letter|selection|file-selector-button|-webkit-[\w-]+)\b/i.test(c)) {
    return { type: '', classes: [], ids: [], alts: [], pseudo: true };
  }
  const alts = [];
  const plain = c.replace(/:(is|where|matches|-webkit-any)\(((?:[^()]|\([^()]*\))*)\)/gi, (m, f, inner) => {
    splitTop(inner, /,/).forEach(a => alts.push(compound(lastCompound(a))));
    return '';
  }).replace(/:(not|has)\(((?:[^()]|\([^()]*\))*)\)/gi, '')
    .replace(/::?[\w-]+(\([^)]*\))?/g, '').replace(/\[[^\]]*\]/g, '');
  const type = (/^([a-zA-Z][\w-]*|\*)/.exec(plain) || [])[1] || '';
  return { type: type === '*' ? '' : type.toLowerCase(), classes: [...plain.matchAll(/\.([\w-]+)/g)].map(m => m[1]),
           ids: [...plain.matchAll(/#([\w-]+)/g)].map(m => m[1]), alts };
}
function reaches(cp) {
  if (cp.pseudo) return '';
  if (cp.alts.length) return cp.alts.map(reaches).find(Boolean) || '';
  const named = cp.type || cp.classes.length || cp.ids.length;
  if (!named) return 'it names no element, so it reaches every select it can match';
  if (cp.type === 'select' || cp.classes.some(c => selClasses.has(c)) || cp.ids.some(i => selIds.has(i))) {
    return 'a select under it never takes the finger';
  }
  const w = wrappers.find(t => (!cp.type || cp.type === t.tag) && cp.classes.every(c => t.classes.includes(c))
    && cp.ids.every(i => i === t.id) && (cp.classes.length || cp.ids.length || cp.type === t.tag));
  if (w) return `it is what a select is drawn inside (<${w.tag}${w.classes.length ? ' class="' + w.classes.join(' ') + '"' : ''}> at ${w.where}), and the property is inherited`;
  return '';
}

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
/* ONE STATEMENT, AS WRITTEN IN shell.js: `if (<anything>.closest(FIELD_ACTS_)) e.preventDefault();`. */
const GUARD_ = /if\s*\(\s*[^;{}]*\.closest\(\s*FIELD_ACTS_\s*\)\s*\)\s*e\.preventDefault\(\s*\)\s*;?/g;
let guardsSeen = 0;
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

/* THE WRAPPERS, NOW THAT EVERY FILE IS PARSED — every template and string, top level down. */
for (const [f, { src, ast }] of Object.entries(asts)) walkInside(ast, [], at => `js/${f}:${lineOf(src, at)}`);
{
  const html = read('index.html').replace(/<!--[\s\S]*?-->/g, '');
  tagsThrough(html, [], (st, none) => seenWrap('index.html', st, none));
}
/* AND A CLASS HANDED TO A SELECT THROUGH AN ARGUMENT — `<select ${attrs}>` in a function, and the
   `class="…"` in what its callers pass for `attrs`. The qualification shelf's `.q-name` is drawn that
   way, and for a commit a rule on it was invisible here. */
for (const [f, { src, ast }] of Object.entries(asts)) {
  walk(ast, n => {
    if (n.type !== 'FunctionDeclaration' || !n.id) return;
    const body = src.slice(n.body.start, n.body.end);
    n.params.forEach((p, i) => {
      if (p.type !== 'Identifier' || !new RegExp('<select\\b[^>]*\\$\\{\\s*' + p.name + '\\s*\\}').test(body)) return;
      for (const [, o] of Object.entries(asts)) walk(o.ast, c => {
        if (c.type !== 'CallExpression' || c.callee.type !== 'Identifier' || c.callee.name !== n.id.name) return;
        const a = c.arguments[i];
        if (a) classesIn(o.src.slice(a.start, a.end)).forEach(k => selClasses.add(k));
      });
    });
  });
}
cssRules.forEach(head => splitTop(head, /,/).forEach(sel => {
  const why = reaches(compound(lastCompound(sel)));
  if (why) bad.css.push(`\`${sel} { pointer-events: none }\` — ${why}, so the platform's list cannot open`);
}));
inlineNone.forEach(x => bad.css.push(x));
/* AND A SCRIPT THAT WRITES IT: `….style.pointerEvents = 'none'` or `setProperty('pointer-events', 'none')`
   in a function that is about a select. The columns' own `pointerEvents` writes in shell.js are about
   a column, and say nothing of a select. */
for (const [f, { src, ast }] of Object.entries(asts)) {
  const fns = [];
  walk(ast, n => { if (/Function/.test(n.type)) fns.push(n); });
  const about = at => {
    const fn = fns.filter(n => n.start <= at && at < n.end).sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];
    const text = (fn ? src.slice(fn.start, fn.end) : '').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
    return /\bselect\b|SELECT/.test(text);
  };
  const none = v => v && ((v.type === 'Literal' && /^none$/i.test(String(v.value)))
    || (v.type === 'ConditionalExpression' && (none(v.consequent) || none(v.alternate))));
  walk(ast, n => {
    const set = n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && n.left.property
      && n.left.property.name === 'pointerEvents' && none(n.right);
    const prop = n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.property
      && n.callee.property.name === 'setProperty' && n.arguments[0] && n.arguments[0].value === 'pointer-events'
      && none(n.arguments[1]);
    if ((set || prop) && about(n.start)) {
      bad.css.push(`js/${f}:${lineOf(src, n.start)} — a script sets \`pointer-events: none\` in a function about a select`);
    }
  });
}

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
    /* THE SWIPE GUARD'S OWN STATEMENTS OUT, AND THE REST READ — see the header. Its name is not a pass
       for the listener it sits in. */
    const guards = (body.match(GUARD_) || []).length;
    guardsSeen += guards;
    body = body.replace(GUARD_, ' ');
    const called = new Set();
    for (const m of body.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (tops[m[1]]) called.add(m[1]);
    const reach = [body].concat([...called].map(k => tops[k])).join('\n');
    const cancels = /\.preventDefault\s*\(|\.blur\s*\(/.test(reach);
    const aboutSelect = /\bselect\b|SELECT/.test(reach.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''));
    if (!cancels || !aboutSelect) return;
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
/* THE GUARD IS THREE STATEMENTS IN shell.js TODAY. None found means the pattern no longer matches what
   is written there, and the listener it sits in would be read with the guard still in it. */
if (!guardsSeen) blind.push('the swipe guard\'s `closest(FIELD_ACTS_)` statements were not found — the exemption matched nothing');
if (!wrappers.length) blind.push('no element was found around any select — the wrapper half of section 1 read nothing');
if (blind.length) say('COULD NOT REACH ITS SUBJECT', blind);
console.log(`\nread ${rulesRead} rules, ${selectsSeen} <select>s drawn with ${selClasses.size} class(es) and ${selIds.size} id(s) `
          + `inside ${new Set(wrappers.map(w => w.tag + '.' + w.classes.join('.'))).size} kinds of wrapper, `
          + `and ${listenersRead} press/focus listeners in ${Object.keys(asts).length} files (${guardsSeen} swipe-guard statements taken out)`);
const n = bad.css.length + bad.markup.length + bad.listeners.length + blind.length;
console.log(n ? '\nFAIL — something stands between a finger and the platform\'s own list.'
              : '\nOK — every dropdown is the platform\'s own, and nothing stands in front of one.');
process.exit(n ? 1 : 0);
