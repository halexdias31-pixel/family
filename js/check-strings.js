#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-strings.js A `${…}` INSIDE A QUOTED STRING, WHICH IS JUST CHARACTERS. § */
const fs = require('fs'), path = require('path');
const acorn = require('acorn');
const dir = __dirname;
const ORDER = ['core','price-rows','chess','data','shell-boot','shell-layout','shell-pages','shell-click','shell-api','shell-hold','cards','me-account','me-messages','me-roles','me-shelves','me-settings','me-card','me-people','posts','links','find-finder','find-facets','find-history','find-boxers','find-parts','find-marking','find-cells','find-pen','find-pad','find-loupe','find-figures','find-aloud','find-levels','find-bundles','find-pages','find-measure',
               'resource','arcade','map','book-steps','book-rows','book-spine','receipt','mat','calc','overworld',
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

/* CONTROLS ARE CONTROLS (561, U15): a data-do on a non-control element needs role + tabindex, or Tab never reaches it. */
const ROLE_OK = { 'feed-tap': 'a delegated surface: the cards inside it are the controls' };
const roleBad = [];
ORDER.forEach(n => {
  const src = fs.readFileSync(path.join(__dirname, n + '.js'), 'utf8');
  for (const m of src.matchAll(/<(div|span|li|canvas|img|video|section|article)\b([^>]*?)data-do="([\w-]+)"([^>]*)>/g)) {
    const at = m[2] + m[4];
    if (ROLE_OK[m[3]] || (/role=/.test(at) && /tabindex=/.test(at))) continue;
    roleBad.push(n + '.js:' + src.slice(0, m.index).split('\n').length + '  <' + m[1] + ' data-do="' + m[3] + '">');
  }
});
console.log('A data-do ON A <div>/<span>/<canvas> WITHOUT role AND tabindex  (' + roleBad.length + ')');
roleBad.forEach(x => console.log('  ' + x));

console.log('');
console.log('A ${…} INSIDE A QUOTED STRING — reaches the page as characters  (' + hits.length + ')');
if (!hits.length) console.log('  none');
hits.forEach(h => console.log('  ' + (h.file + ':' + h.line).padEnd(18) + h.text));
console.log('');
console.log(hits.length ? 'FAILED — each of those is drawn literally, exactly where a value should be'
                        : 'OK — every ${…} is somewhere it will actually interpolate.');
if (roleBad.length) console.log('FAILED — give each a role and tabindex="0" (or make it a <button type="button">)');
process.exit(hits.length || roleBad.length ? 1 : 0);
