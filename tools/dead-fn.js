#!/usr/bin/env node
/* @family. — tools/dead-fn.js THE DEAD-FUNCTION CHECK (rule 1.75, unify batch 6 lane E, 21 Nov): one rule, counted site-wide.
   A top-level function in js/ (`function f(`, `async function f(`, `const f = (…) =>` / `x =>` / `function`) that nothing names is
   dead weight a child's phone downloads. Each name is held against the words of js/, index.html, backend/, tools/ and data/
   (strings count, so 'name' dispatch and window[...] are alive); a name whose only appearances are its own definitions fails.
   Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

function files_(dir, re, out) {
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (f.name !== 'node_modules') files_(p, re, out); } else if (re.test(f.name)) out.push(p);
  }
  return out;
}
const DEF = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(|^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/;
function run() {
  const jsFiles = files_(path.join(ROOT, 'js'), /\.js$/, []);
  const defs = new Map();
  for (const f of jsFiles) fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
    const m = DEF.exec(l); if (!m) return;
    const n = m[1] || m[2];
    if (!defs.has(n)) defs.set(n, path.relative(ROOT, f) + ':' + (i + 1));
  });
  const src = [...jsFiles, path.join(ROOT, 'index.html'), ...files_(path.join(ROOT, 'backend'), /\.gs$/, []),
    ...files_(path.join(ROOT, 'tools'), /\.(js|py)$/, []), ...files_(path.join(ROOT, 'data'), /\.(json|js)$/, [])]
    .filter(f => fs.existsSync(f));
  const uses = new Map(), defsSeen = new Map();
  for (const f of src) for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = DEF.exec(l), own = m && (m[1] || m[2]);
    if (own && defs.has(own)) defsSeen.set(own, (defsSeen.get(own) || 0) + 1);
    for (const w of l.match(/[A-Za-z_$][\w$]*/g) || []) if (defs.has(w)) uses.set(w, (uses.get(w) || 0) + 1);
  }
  const dead = [...defs.keys()].filter(n => (uses.get(n) || 0) <= (defsSeen.get(n) || 0)).map(n => n + ' (' + defs.get(n) + ')');
  if (dead.length) throw new Error('dead-fn: ' + dead.length + ' top-level function(s) in js/ that nothing names — delete them:\n  ' + dead.join('\n  '));
  console.log('dead-fn: ' + defs.size + ' top-level functions in js/, every one named somewhere');
}
module.exports = { run };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
