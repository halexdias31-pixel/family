#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-const.js

   A `const` THAT IS ASSIGNED TO. The throw is real, it is silent wherever a `try` is standing over
   it, and everything before the assignment has already happened — which is what makes it survive.

   THE ONE THAT PROMPTED THIS, in `shell.js`:

       const d = await res.json();
       …
       try {
         d = libraryInto_(d, await libraryRows_());   // <- "Assignment to constant variable"
       } catch (e) {
         d.questions = d.questions || [];             // <- finds it already populated, does nothing
       }

   IT HAD BEEN THROWING ON EVERY SINGLE LOAD and nothing anywhere said so. `libraryInto_` MUTATES
   `d` and returns the same object, so the questions were written before the assignment was
   attempted; the throw came after the useful work, and the catch's own repair found the key already
   there and left it alone. A correct fallback standing over a broken line — the same shape as the
   `check-flow` stub with no `text()`, and as `.mat-out` being "fixed" twice on a measurement nobody
   took. Every one of those is in CLAUDE.md.

   WHAT IT COST was not the questions, which were fine. It was that NOTHING AFTER THAT LINE INSIDE
   THE TRY COULD EVER RUN, and for as long as the line was last in its block that was invisible. The
   first code put on the next line simply did not execute, and only a test that booted the app and
   asked what was in `DATA` found it.

   WHAT THIS CHECKS, deliberately narrow so it does not have to be a whole scope analyser: within
   ONE function body, a name declared `const` and later the target of an assignment. That is the
   shape above and it is high-confidence — a `const` and an `=` on the same name in the same
   function is never anything else.

   NOT CHECKED, because it would need a real scope tree and would report things that are fine: a
   `const` in one function and an assignment to the same NAME in another (that is a different
   binding), and shadowing. Narrow and certain beats broad and noisy — `check-rows.js` records what
   95 findings with 2 real ones in them is worth.

     node js/check-const.js
================================================================================================== */
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

  /* ---------- ONE BODY AT A TIME, AND IT MUST NOT LOOK INSIDE THE NEXT ONE ---------------------
     THE FIRST VERSION OF THIS CHECK REPORTED 95 FINDINGS AND EVERY ONE WAS WRONG. It collected the
     bodies correctly and then walked each one with the ordinary walker, which descends into nested
     functions — so the top-level pass gathered every `const` and every assignment in the whole
     file and matched them against each other across scopes. It "found" a `const` declared at line
     552 being assigned at line 153, four hundred lines EARLIER and in a different function.

     THAT IS THE `check-rows.js` FAULT EXACTLY, recorded in CLAUDE.md: one binding map per file
     instead of per scope, 95 findings with 2 real ones in them, which is worse than no check at
     all because the real ones are indistinguishable from the noise.

     SO THE WALK STOPS AT A FUNCTION BOUNDARY. `ownWalk` visits the body's own nodes and refuses to
     enter a nested function — that function gets its own pass, with its own bindings, from the
     list below. */
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
    /* ---------- A NAME THAT IS ALSO A `let` SOMEWHERE IS NOT OURS TO JUDGE ---------------------
     THE THREE THAT SURVIVED THE SCOPE FIX WERE ALL THE SAME SHAPE and all three were wrong:

         for (let k = 0; k < n; k++) { … }      // one binding
         const k = 32 / Math.max(w, h);         // a different one, further down

     A `for` header and a later `const` are separate blocks and separate bindings; the `k++`
     belongs to the loop. Getting that right properly means a block-level scope tree, which is more
     machinery than this rule is worth.

     SO IT DECLINES TO ANSWER INSTEAD. If a name is declared `let` or `var` anywhere in the same
     function, the assignment might legitimately be to that one, and this says nothing. It is
     deliberately the conservative direction: a missed case is a check that is merely incomplete,
     a false one is a check nobody reads. The fault this exists for — a lone `const d` with no
     `let d` anywhere near it — is untouched by the exemption, which is the thing to verify and is
     verified by mutation below. */
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
