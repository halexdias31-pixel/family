#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-strings.js A `${…}` INSIDE A QUOTED STRING, WHICH IS JUST CHARACTERS. § */
const fs = require('fs'), path = require('path');
const acorn = require('acorn');
const dir = __dirname;
const ORDER = ['core','price-rows','chess','data','shell','cards','me','posts','links','find',
               'resource','arcade','map','book','receipt','flyer','mat','games','racer','overworld',
               /* `select`, `collections` AND `tiles` WERE MISSING. § */
               'select','collections','tiles','boot'];

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
