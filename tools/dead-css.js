#!/usr/bin/env node
/* @family. — tools/dead-css.js THE DEAD-CSS CHECK (rule 1.75, owner 20 Nov): one rule, counted site-wide.
   A class style.css styles that nothing writes is dead weight a child's phone downloads. Every class in style.css is held against
   the text of js/, index.html, data/settings and the backend card generator (backend/cards-gen.gs): written whole as a word there, or
   under a prefix the code builds at run time ('pp-' + x, `is-${x}`, look: 'kc-' + x), it is alive. The rest are counted.
   The count may not rise above BUDGET; lower BUDGET whenever classes are removed. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
/* THE BUDGET: today's count (20 Nov). Lower it as classes go; the build fails if the count rises above it. */
const BUDGET = 77;

function files_(dir, re, out) {
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) files_(p, re, out); else if (re.test(f.name)) out.push(p);
  }
  return out;
}
function classesOf_(css) {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
  const set = new Set();
  /* SELECTORS ONLY: the text before each `{`, not values (1.5em, url(x.png)) */
  for (const m of bare.matchAll(/([^{}]+)\{/g)) {
    if (/^\s*@/.test(m[1])) continue;
    for (const c of m[1].matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) set.add(c[1]);
  }
  return set;
}
function run() {
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const src = [...files_(path.join(ROOT, 'js'), /\.js$/, []), path.join(ROOT, 'index.html'),
    ...files_(path.join(ROOT, 'data', 'settings'), /\.json$/, []), path.join(ROOT, 'backend', 'cards-gen.gs')]
    .filter(f => fs.existsSync(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
  const words = new Set(src.match(/[_a-zA-Z][\w-]*/g) || []);
  /* PREFIXES BUILT AT RUN TIME: a hyphened word ending a string that is joined to more ('pp-' + k, 'kp-s' + n, `is-${k}`) */
  const prefixes = new Set();
  for (const m of src.matchAll(/([a-zA-Z][\w]*-[\w-]*)['"`]\s*\+/g)) prefixes.add(m[1]);
  for (const m of src.matchAll(/([a-zA-Z][\w]*-[\w-]*)\$\{/g)) prefixes.add(m[1]);
  const dead = [...classesOf_(css)].filter(c => !words.has(c) && ![...prefixes].some(p => c.startsWith(p))).sort();
  console.log('dead-css: ' + dead.length + ' unused classes (budget ' + BUDGET + ')');
  if (process.argv.includes('--list')) dead.forEach(c => console.log('  .' + c));
  if (dead.length > BUDGET) throw new Error('dead-css: ' + dead.length + ' unused classes, over the budget of ' + BUDGET + ' (node tools/dead-css.js --list)');
  return dead.length;
}
module.exports = { run };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
