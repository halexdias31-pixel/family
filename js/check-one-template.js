#!/usr/bin/env node
/* @family. — check-one-template.js ONE TEMPLATE (owner, 11 Nov): only findCard writes `class="card`; every other maker hands card_ a plain div, the booking form too (owner, 12 Nov). */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const files = [...new Set([...html.matchAll(/'([a-z][\w-]*)'/g)].map(m => 'js/' + m[1] + '.js'))].filter(f => fs.existsSync(path.join(ROOT, f)));
const bad = [];
/* A CARD CLASS WRITTEN AS TEXT (`class="card"`, `class="card x"`), or set on an element (`className = 'card…'`, `classList.add('card')`). */
const WRITES = /class=\\?"card(?:["\s$])/;
let seen = 0;
files.forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true }); } catch (e) { bad.push(f + ': would not parse (' + e.message + ')'); return; }
  /* THE BUILDER ITSELF: findCard's own body may write the class, nothing else in any file. */
  const builder = [];
  const walk = (n, inBuilder) => {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'FunctionDeclaration' && n.id && n.id.name === 'findCard' && f === 'js/cards-make.js') inBuilder = true;
    const say = (what) => { if (!inBuilder) bad.push(f + ':' + (src.slice(0, n.start).split('\n').length) + ': ' + what); else builder.push(n); };
    if (n.type === 'TemplateLiteral') n.quasis.forEach(q => { if (WRITES.test(q.value.raw)) say('writes class="card… itself; hand card_() a plain div'); });
    if (n.type === 'Literal' && typeof n.value === 'string' && WRITES.test(n.value)) say('writes class="card… itself; hand card_() a plain div');
    if (n.type === 'AssignmentExpression' && n.left && n.left.property && n.left.property.name === 'className' && n.right && typeof n.right.value === 'string' && /^card\b/.test(n.right.value)) say('sets className card itself');
    if (n.type === 'CallExpression' && n.callee && n.callee.property && n.callee.property.name === 'add' && n.callee.object && n.callee.object.property && n.callee.object.property.name === 'classList'
      && n.arguments.some(a => a.type === 'Literal' && a.value === 'card')) say("adds the class 'card' itself");
    for (const k in n) { if (k === 'type' || k === 'start' || k === 'end') continue; const v = n[k];
      if (Array.isArray(v)) v.forEach(c => walk(c, inBuilder)); else if (v && typeof v.type === 'string') walk(v, inBuilder); }
  };
  walk(ast, false);
  seen++;
  if (f === 'js/cards-make.js' && !builder.length) bad.push('js/cards-make.js: findCard no longer writes the card class; this check names the wrong builder');
});
if (!seen) bad.push('no served file was read: index.html lists none');
if (bad.length) {
  console.error('one template: ' + bad.length + ' card(s) built outside findCard/card_');
  bad.slice(0, 60).forEach(b => console.error('  ' + b));
  process.exit(1);
}
console.log('one template: ' + seen + ' served files, every card through findCard (card_), no exception');
