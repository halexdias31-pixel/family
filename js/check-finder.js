#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-finder.js ONE WRITER OF A FINDER'S QUESTION (R1): outside find.js chips and words are set only by `finderSet_`. */
/* Booking from a card once kept the typed words under its new chip, and found nothing (docs/history/522). */
/* Parsed with acorn, not matched by line: strings and comments are the parser's, and a write through an alias (`st.q =`) is followed to its finder. */
const fs = require('fs');
const path = require('path');
let acorn;
try { acorn = require('acorn'); } catch (e) { console.log('FAILED — acorn is not installed (npm install), so no file could be read'); process.exit(1); }

const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'js');
const bad = [];
const VERBOSE = process.argv.includes('-v') || process.env.VERBOSE === '1';

/* WHAT A VALUE IS: FMAP `FINDERS` · F a finder · FSA a list of states · FS a state (STUFF, RES_ST, F.st) ·
   CA the live chips (FS.filters) · CC a copy holding the live chips · C one chip. */
const ITER = new Set(['forEach', 'map', 'filter', 'find', 'findLast', 'some', 'every', 'flatMap', 'findIndex', 'findLastIndex']);
const MUTATE = new Set(['push', 'pop', 'splice', 'shift', 'unshift', 'sort', 'reverse', 'fill', 'copyWithin']);
const QUESTION = new Set(['q', 'filters']);
const FN = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

const propName = m => m.computed ? (m.property.type === 'Literal' ? String(m.property.value) : '*') : m.property.name;

function scanFile(name, src) {
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowHashBang: true }); }
  catch (e) { bad.push('js/' + name + ' does not parse (' + e.message + ') — nothing in it was checked'); return 0; }

  /* EVERY NODE, its parent, and the function (or the file) it belongs to. */
  const nodes = [];
  (function walk(n, parent, scope) {
    if (!n || typeof n.type !== 'string') return;
    n.$parent = parent; n.$scope = scope; nodes.push(n);
    const inner = FN.has(n.type) ? n : scope;
    if (FN.has(n.type)) { n.$vars = new Map(); n.$up = scope; }
    for (const k of Object.keys(n)) {
      if (k[0] === '$') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(c => walk(c, n, (k === 'id' && n.type === 'FunctionDeclaration') ? scope : inner));
      else if (v && typeof v.type === 'string') walk(v, n, (k === 'id' && n.type === 'FunctionDeclaration') ? scope : inner);
    }
  })(ast, null, null);
  ast.$vars = new Map();
  const scopeOf = n => n.$scope || ast;

  /* DECLARATIONS, so a local `st` that is not a finder's shadows one that is (and the reverse). */
  const declare = (scope, id) => {
    if (!id) return;
    if (id.type === 'Identifier') { if (!scope.$vars.has(id.name)) scope.$vars.set(id.name, { cls: null, from: [] }); return; }
    if (id.type === 'ObjectPattern') id.properties.forEach(p => declare(scope, p.type === 'RestElement' ? p.argument : p.value));
    else if (id.type === 'ArrayPattern') id.elements.forEach(e => declare(scope, e));
    else if (id.type === 'AssignmentPattern') declare(scope, id.left);
    else if (id.type === 'RestElement') declare(scope, id.argument);
  };
  const lookup = (name, scope) => {
    for (let s = scope; s; s = s.$up) if (s.$vars && s.$vars.has(name)) return s.$vars.get(name);
    return ast.$vars.get(name) || null;
  };
  nodes.forEach(n => {
    if (n.type === 'VariableDeclarator') declare(scopeOf(n), n.id);
    else if (FN.has(n.type)) n.params.forEach(p => declare(n, p));
    else if (n.type === 'FunctionDeclaration' && n.id) declare(scopeOf(n), n.id);
    else if (n.type === 'CatchClause' && n.param) declare(scopeOf(n), n.param);
  });

  /* WHAT AN EXPRESSION IS (see the key above), from the globals, the aliases and the calls that hand one on. */
  const elementOf = c => c === 'FSA' ? 'FS' : (c === 'CA' || c === 'CC') ? 'C' : null;
  function cls(e) {
    if (!e) return null;
    switch (e.type) {
      case 'Identifier': {
        const b = lookup(e.name, scopeOf(e));
        if (b) return b.cls;
        if (e.name === 'STUFF' || e.name === 'RES_ST') return 'FS';
        if (e.name === 'FINDER') return 'F';
        if (e.name === 'FINDERS') return 'FMAP';
        return null;
      }
      case 'MemberExpression': {
        const o = cls(e.object), p = propName(e);
        if (o === 'FMAP') return 'F';
        if (p === 'st' && (o === 'F' || o === null)) return 'FS';   // any `.st` is read as a finder's, as the old line check did
        if (o === 'FS' && p === 'filters') return 'CA';
        if (e.computed && elementOf(o)) return elementOf(o);
        return null;
      }
      case 'CallExpression': {
        const c = e.callee;
        if (c.type === 'Identifier') {
          if (c.name === 'finderStates_') return 'FSA';
          if (c.name === 'finderOf_' || c.name === 'finderAt_') return 'F';
          return null;
        }
        if (c.type === 'MemberExpression') {
          const o = cls(c.object), m = propName(c);
          if (o === 'FMAP' && m === 'values') return 'FA';
          if (['find', 'findLast', 'at'].includes(m)) return elementOf(o) || (o === 'FA' ? 'F' : null);
          if (['filter', 'slice', 'concat', 'toSorted', 'toReversed'].includes(m)) return o === 'FSA' ? 'FSA' : (o === 'CA' || o === 'CC') ? 'CC' : null;
        }
        return null;
      }
      case 'LogicalExpression': return cls(e.left) || cls(e.right);
      case 'ConditionalExpression': return cls(e.consequent) || cls(e.alternate);
      case 'SequenceExpression': return cls(e.expressions[e.expressions.length - 1]);
      case 'AssignmentExpression': return cls(e.right);
      case 'ArrayExpression': return e.elements.some(x => x && cls(x) === 'FS') ? 'FSA' : e.elements.some(x => x && cls(x) === 'C') ? 'CC' : null;
      default: return null;
    }
  }
  /* ALIASES, to a fixed point: `const st = …`, `x = …`, `for (const c of …)`, and a callback's parameter over a list. */
  const bind = (id, scope, c) => {
    if (!c || !id || id.type !== 'Identifier') return false;
    const b = lookup(id.name, scope);
    if (!b || b.cls === c) return false;
    if (b.cls && b.cls !== c) return false;   // first meaning wins; the scan is for writes, not types
    b.cls = c; return true;
  };
  for (let round = 0, moved = true; moved && round < 8; round++) {
    moved = false;
    nodes.forEach(n => {
      if (n.type === 'VariableDeclarator' && n.init) moved = bind(n.id, scopeOf(n), cls(n.init)) || moved;
      else if (n.type === 'AssignmentExpression' && n.operator === '=' && n.left.type === 'Identifier') moved = bind(n.left, scopeOf(n), cls(n.right)) || moved;
      else if (n.type === 'ForOfStatement') {
        const el = elementOf(cls(n.right)) || (cls(n.right) === 'FA' ? 'F' : null);
        const id = n.left.type === 'VariableDeclaration' ? n.left.declarations[0].id : n.left;
        moved = bind(id, scopeOf(n.left), el) || moved;
      } else if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression') {
        const m = propName(n.callee), o = cls(n.callee.object);
        const el = elementOf(o) || (o === 'FA' ? 'F' : null);
        const fn = n.arguments[0];
        if (el && fn && FN.has(fn.type)) {
          if (ITER.has(m) && fn.params[0]) moved = bind(fn.params[0], fn, el) || moved;
          if ((m === 'reduce' || m === 'reduceRight') && fn.params[1]) moved = bind(fn.params[1], fn, el) || moved;
        }
      }
    });
  }

  /* THE WRITES. A target is a finder's question when it is FS.q/FS.filters (or FS[anything]), the chips array, one chip, F.st, or STUFF/RES_ST themselves. */
  const at = n => 'js/' + name + ':' + n.loc.start.line;
  const said = n => src.slice(n.start, Math.min(n.end, n.start + 120)).replace(/\s+/g, ' ');
  function writes(t) {
    if (!t) return null;
    if (t.type === 'Identifier') {
      if ((t.name === 'STUFF' || t.name === 'RES_ST') && !lookup(t.name, scopeOf(t))) return 'replaces ' + t.name;
      return null;
    }
    if (t.type === 'MemberExpression') {
      const o = cls(t.object), p = propName(t);
      if (o === 'FS' && (QUESTION.has(p) || p === '*')) return 'sets a finder\'s ' + (p === '*' ? 'state by a computed key' : p);
      if (o === 'CA') return 'changes the chips array';
      if (o === 'C') return 'changes a chip';
      if (o === 'F' && p === 'st') return 'replaces a finder\'s state';
      return null;
    }
    if (t.type === 'ObjectPattern') { for (const p of t.properties) { const w = writes(p.type === 'RestElement' ? p.argument : p.value); if (w) return w; } }
    if (t.type === 'ArrayPattern') { for (const e of t.elements) { const w = writes(e); if (w) return w; } }
    if (t.type === 'AssignmentPattern') return writes(t.left);
    if (t.type === 'RestElement') return writes(t.argument);
    return null;
  }
  const flag = (n, how) => bad.push(at(n) + ' ' + how + ' by hand — call finderSet_(F, { filters, q }): `' + said(n) + '`');
  nodes.forEach(n => {
    let w = null;
    if (n.type === 'AssignmentExpression') w = writes(n.left);
    else if (n.type === 'UpdateExpression') w = writes(n.argument);
    else if (n.type === 'UnaryExpression' && n.operator === 'delete') w = writes(n.argument);
    else if (n.type === 'ForOfStatement' || n.type === 'ForInStatement') { if (n.left.type !== 'VariableDeclaration') w = writes(n.left); }
    else if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression') {
      const m = propName(n.callee), o = cls(n.callee.object);
      if (o === 'CA' && MUTATE.has(m)) w = 'changes the chips array in place (.' + m + ')';
      const host = n.callee.object.type === 'Identifier' ? n.callee.object.name : '';
      if ((host === 'Object' || host === 'Reflect') && ['assign', 'defineProperty', 'defineProperties', 'set', 'deleteProperty'].includes(m)) {
        const tc = cls(n.arguments[0]);
        if (tc === 'CA' || tc === 'C') w = 'changes the chips through ' + host + '.' + m;
        if (tc === 'FS') {
          /* `Object.assign(STUFF, { admit })` is not the question; any source that is not a literal without q/filters may be. */
          const touches = n.arguments.slice(1).some(a => a.type !== 'ObjectExpression'
            || a.properties.some(p => p.type !== 'Property' || p.computed || QUESTION.has(p.key.name || p.key.value)));
          if (m !== 'assign' || touches) w = 'sets a finder\'s question through ' + host + '.' + m;
        }
      }
    }
    if (w) flag(n, w);
  });
  return src.split('\n').length;
}

const files = fs.readdirSync(JS).filter(n => /\.js$/.test(n) && n !== 'find.js' && !/^check/.test(n));
let lines = 0;
files.forEach(n => { lines += scanFile(n, fs.readFileSync(path.join(JS, n), 'utf8')); });

/* AND THE ONE WRITER IS THERE TO CALL — a scan of a tree without it would pass by reading nothing. */
const find = fs.readFileSync(path.join(JS, 'find.js'), 'utf8');
if (!/\nfunction finderSet_\s*\(F, o\)/.test(find)) bad.push('js/find.js declares no `finderSet_(F, o)` — the one writer is gone');
if (files.length < 20 || lines < 10000) bad.push('only ' + files.length + ' file(s), ' + lines + ' line(s) were read — the scan did not reach js/, which is not a pass');

if (bad.length) {
  console.log('FAILED — a finder\'s question is written from outside find.js:');
  bad.forEach(b => console.log('  ' + b));
  process.exit(1);
}
if (VERBOSE) console.log('  ' + files.length + ' files, ' + lines + ' lines parsed; aliases followed through const/let, assignment, for…of and list callbacks');
console.log('OK — ' + files.length + ' files outside find.js set no finder\'s chips or words except through finderSet_.');
