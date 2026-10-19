#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-const.js A `const` THAT IS ASSIGNED TO. § */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const dir = __dirname;
const files = fs.readdirSync(dir)
  .filter(f => /\.js$/.test(f) && !/^check/.test(f))
  .map(f => path.join(dir, f));

const bad = [];

/* Every node, depth first. Written out rather than pulled from a walker package so the check has
   one dependency (acorn) and not two. */
function walk(node, fn, parent) {
  if (!node || typeof node.type !== 'string') return;
  fn(node, parent);
  for (const k of Object.keys(node)) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && walk(c, fn, node));
    else if (v && typeof v.type === 'string') walk(v, fn, node);
  }
}

/* The names bound by one declarator, so `const { a, b } = x` and `const [c] = y` count too. */
function namesIn(pat, out) {
  if (!pat) return out;
  if (pat.type === 'Identifier') out.push(pat.name);
  else if (pat.type === 'ObjectPattern') pat.properties.forEach(p =>
    namesIn(p.value || p.argument, out));
  else if (pat.type === 'ArrayPattern') pat.elements.forEach(e => e && namesIn(e, out));
  else if (pat.type === 'AssignmentPattern') namesIn(pat.left, out);
  else if (pat.type === 'RestElement') namesIn(pat.argument, out);
  return out;
}

const FN = { FunctionDeclaration: 1, FunctionExpression: 1, ArrowFunctionExpression: 1 };

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script', locations: true });
  } catch (e) {
    bad.push(path.basename(file) + ' does not parse: ' + e.message);
    continue;
  }

  /* ---------- ONE BODY AT A TIME, AND IT MUST NOT LOOK INSIDE THE NEXT ONE § */
  const bodies = [ast];
  walk(ast, n => { if (FN[n.type]) bodies.push(n); });

  const ownWalk = (root, fn) => {
    const inner = (node, isRoot) => {
      if (!node || typeof node.type !== 'string') return;
      if (!isRoot && FN[node.type]) return;         /* a different scope; not ours to read */
      fn(node);
      for (const k of Object.keys(node)) {
        if (k === 'type' || k === 'start' || k === 'end' || k === 'loc') continue;
        const v = node[k];
        if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && inner(c, false));
        else if (v && typeof v.type === 'string') inner(v, false);
      }
    };
    inner(root, true);
  };

  for (const body of bodies) {
    const consts = new Map();
    const assigns = [];
    /* ---------- A NAME THAT IS ALSO A `let` SOMEWHERE IS NOT OURS TO JUDGE § */
    const mutable = new Set();
    ownWalk(body, n => {
      if (n.type === 'VariableDeclaration' && n.kind !== 'const') {
        n.declarations.forEach(dec => namesIn(dec.id, []).forEach(name => mutable.add(name)));
      }
      if (FN[n.type] && n.params) n.params.forEach(pp => namesIn(pp, []).forEach(x => mutable.add(x)));
    });
    ownWalk(body, n => {
      if (n.type === 'VariableDeclaration' && n.kind === 'const') {
        n.declarations.forEach(dec => namesIn(dec.id, []).forEach(name => {
          if (!consts.has(name)) consts.set(name, n.loc.start.line);
        }));
      }
      if (n.type === 'AssignmentExpression' && n.left && n.left.type === 'Identifier') {
        assigns.push({ name: n.left.name, line: n.loc.start.line });
      }
      if (n.type === 'UpdateExpression' && n.argument && n.argument.type === 'Identifier') {
        assigns.push({ name: n.argument.name, line: n.loc.start.line, update: true });
      }
    });
    assigns.forEach(a => {
      if (!consts.has(a.name) || mutable.has(a.name)) return;
      const at = consts.get(a.name);
      if (a.line === at) return;                 /* the declaration itself */
      bad.push(path.basename(file) + ':' + a.line + '  `' + a.name + '` is declared `const` at line '
               + at + ' and ' + (a.update ? 'incremented' : 'assigned to') + ' here — this throws at '
               + 'runtime, and everything after it in the same block never runs');
    });
  }
}

console.log('');
if (bad.length) {
  console.log('A CONSTANT IS BEING ASSIGNED TO:');
  [...new Set(bad)].forEach(b => console.log('  ' + b));
  console.log('');
  process.exit(1);
}
console.log('OK — checked ' + files.length + ' files; nothing declared `const` is assigned to.');
process.exit(0);
