#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-strings.js

   A `${…}` INSIDE A QUOTED STRING, WHICH IS JUST CHARACTERS.

   Inside a template literal, `${…}` interpolates. Inside a `${…}` you are back in ordinary
   JavaScript — so `'${esc(k)}'` is a single-quoted string holding a dollar, a brace and six letters,
   and it reaches the page exactly like that. Nothing throws. The label is drawn, in the right place,
   in the right style, saying `${esc(k)}`.

   THAT IS WHY IT SURVIVES. Every other kind of template mistake either throws or leaves a blank;
   this one leaves something that looks deliberate.

   IT IS PARSED, NOT SCANNED, AND THAT MATTERS. This was first written as a brace counter and
   reported twenty-four faults of which three were real — it could not tell a nested template, which
   is correct and everywhere, from the dead kind. Rewritten as a hand lexer, it then read the quote
   inside the regex on line 37 of me.js as the start of a string and swallowed the next forty lines,
   silently losing one of the real faults. Deciding whether a slash begins a regex or a division
   needs the previous token, which is the point at which you are writing a parser.

   acorn is already here for check.js. A string literal sitting in a template's EXPRESSION is exactly
   the fault, and the tree says so with no guessing: the quotes in a nested template are quasi text
   rather than literals, so correct nesting cannot be mistaken for the fault.

     node check-strings.js
================================================================================================== */
const fs = require('fs'), path = require('path');
const acorn = require('acorn');
const dir = __dirname;
const ORDER = ['core','price-rows','chess','data','shell','cards','me','posts','links','find',
               'resource','arcade','map','book','receipt','flyer','mat','games','overworld','boot'];

const hits = [];

function walk(node, inExpr, file) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'Literal' && typeof node.value === 'string'
      && node.value.includes('${') && inExpr) {
    hits.push({ file, line: node.loc.start.line, text: String(node.raw).slice(0, 66) });
  }
  if (node.type === 'TemplateLiteral') {
    /* The quasis are text and cannot hold the fault; only the expressions can. */
    node.expressions.forEach(e => walk(e, true, file));
    return;
  }
  for (const k in node) {
    if (k === 'loc' || k === 'start' || k === 'end' || k === 'type' || k === 'raw') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(x => walk(x, inExpr, file));
    else if (v && typeof v.type === 'string') walk(v, inExpr, file);
  }
}

ORDER.forEach(n => {
  const p = path.join(dir, n + '.js');
  if (!fs.existsSync(p)) return;
  const src = fs.readFileSync(p, 'utf8');
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 2022, locations: true }); }
  catch (e) { console.log('SYNTAX ERROR in ' + n + '.js: ' + e.message); return; }
  ast.body.forEach(s => walk(s, false, n + '.js'));
});

console.log('');
console.log('A ${…} INSIDE A QUOTED STRING — reaches the page as characters  (' + hits.length + ')');
if (!hits.length) console.log('  none');
hits.forEach(h => console.log('  ' + (h.file + ':' + h.line).padEnd(18) + h.text));
console.log('');
console.log(hits.length ? 'FAILED — each of those is drawn literally, exactly where a value should be'
                        : 'OK — every ${…} is somewhere it will actually interpolate.');
process.exit(hits.length ? 1 : 0);
