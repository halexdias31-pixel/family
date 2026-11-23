#!/usr/bin/env node
/* @family. — tools/one-cells.js THE FILL-A-TABLE CHECK (rule 1.75; owner 23 Nov: fill a table is typed, each empty cell the one answer box,
   tapped in any order, the table showing exactly what is marked). Through the site's own maker and marker (find-cells.js `ansBox_`,
   find-marking.js `mark_`), loaded in a vm as tools/validate-questions.js loads the app:
   1. AN ORDERED TABLE (a frequency tree, each blank under its given header): a box in each blank of its own table, no box outside the table,
      no other answer box; its right answers mark full, two swapped do not.
   2. AN UNORDERED TABLE ("list all the outcomes": rows written whole): its rows typed in a shuffled order still mark full, a wrong row does not.
   3. SITE-WIDE: every active question with `cells` draws a table holding one box per asked cell and no box outside it.
   4. THE SHOWN ANSWER (owner 23 Nov): every such question's answer card (find-parts.js `answerBlock_`) is its table with each cell's key in it.
   Run by tools/build.js after one-box; any miss fails the build. */
'use strict';
const SD = require('./lib/site-data.js');
const VQ = require('./validate-questions.js');
const { S, main } = require('./lib/gen.js');

const TREE = {
  key: 'one-cells-tree', marks: 3,
  html: '<p>Complete the frequency tree.</p><table><tr><th>Adults</th><th>Adults who passed</th><th>Adults who failed</th>'
    + '<th>Children</th><th>Children who passed</th><th>Children who failed</th></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr></table>',
  cells: 'Adults = 40 ; Adults who passed = 28 ; Adults who failed = 12 ; Children = 60 ; Children who passed = 45 ; Children who failed = 15'
};
/* two coins: the outcomes, a row each, written whole -- any order */
const COINS = {
  key: 'one-cells-coins', marks: 2,
  html: '<p>Two coins are thrown. List all the possible outcomes.</p><table><tr><th>First coin</th><th>Second coin</th></tr>'
    + '<tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>',
  cells: '1 = H ; 2 = H ; 3 = H ; 4 = T ; 5 = T ; 6 = H ; 7 = T ; 8 = T'
};

/* WHAT A MAKER DREW: its boxes, those inside a table, the order rule it carries */
const esc_ = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function seen(html) {
  const boxes = (html.match(/class="[^"]*\bqp-ans-in\b/g) || []).length;
  const tables = html.match(/<table[\s\S]*?<\/table>/g) || [];
  const inTable = tables.reduce((s, t) => s + (t.match(/class="[^"]*\bqp-ans-in\b/g) || []).length, 0);
  return { boxes, inTable, order: (/data-order="(\w+)"/.exec(html) || [])[1] || '' };
}

function run() {
  const { ctx, call } = VQ.appCode();
  call('qtMarker_(workRow_({row:{}}))'); call('padGrid_'); call('CARD_BLOCKS'); call('cellsKeyTable_');
  /* the form blocks are added to CARD_BLOCKS by a top-level line (cards-render.js), which the vm loader skips */
  call('Object.assign(CARD_BLOCKS, { control: kcfControl_, field: kcfField_, tick: kcfTickB_, many: kcfMany_, group: kcfGroup_ })');
  /* a block that fails is swallowed by cardBlock_ through oops_; here it is thrown, so the vm loads the name it missed */
  call('oops_ = e => { throw e; }');
  const fails = [];
  const look = x => { ctx.__x = x; return seen(String(call('ansBox_(__x)') || '')); };
  const mark = (x, a) => { ctx.__x = x; ctx.__a = a; return call('mark_(__x, __a)'); };

  const tree = Object.assign({}, TREE), t = look(tree);
  if (t.boxes !== 6 || t.inTable !== 6) fails.push('the tree draws ' + t.boxes + ' boxes, ' + t.inTable + ' in its table, not 6 and 6');
  if (t.order !== 'place') fails.push('the tree is marked by "' + t.order + '", not by place');
  const right = mark(tree, ['40', '28', '12', '60', '45', '15']);
  if (right.verdict !== 'right' || right.marks !== right.max) fails.push('the tree\'s right answers mark ' + right.verdict + ' ' + right.marks + '/' + right.max);
  if (mark(tree, ['28', '40', '12', '60', '45', '15']).verdict === 'right') fails.push('the tree: two answers swapped still mark right');

  const coins = Object.assign({}, COINS), c = look(coins);
  if (c.boxes !== 8 || c.inTable !== 8) fails.push('the coins draw ' + c.boxes + ' boxes, ' + c.inTable + ' in its table, not 8 and 8');
  if (c.order !== 'rows') fails.push('the coins\' outcomes are marked by "' + c.order + '", not as rows in any order');
  const shuffled = mark(coins, ['T', 'T', 'H', 'T', 'H', 'H', 'T', 'H']);
  if (shuffled.verdict !== 'right') fails.push('the coins\' rows shuffled mark ' + shuffled.verdict + ' ' + shuffled.marks + '/' + shuffled.max);
  if (mark(coins, ['T', 'T', 'H', 'T', 'H', 'H', 'H', 'H']).verdict === 'right') fails.push('the coins: a row twice, one missing, still marks right');

  /* SITE-WIDE: every active question with cells, a box a cell, all in a table */
  const n = { all: 0, own: 0, drawn: 0, rows: 0, cols: 0 };
  if (SD.hasPrivate()) {
    for (const r of VQ.rowsOf()) {
      if (r.kind !== 'question' || !S(r.cells) || !(r.active === true || /^true$/i.test(S(r.active)))) continue;
      ctx.__r = r;
      let s, asked;
      try { call('__x = libQuestion_(__r)'); s = look(ctx.__x); asked = call('cellsOf_(__x).filter(c => c.ways).length'); } catch (e) { continue; }
      n.all++;
      const own = call('!!cellsOrder_(__x).places');
      n[own ? 'own' : 'drawn']++;
      if (s.order === 'rows' || s.order === 'cols') n[s.order]++;
      /* the shown answer holds every cell's key, read as text (a typeset fraction's / and its tags folded away) */
      const flat = h => String(h).replace(/&frasl;|\u2044/g, '/').replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, m => ({ '&minus;': '-', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&#39;': "'", '&quot;': '"' })[m] || m).replace(/[\s\u2212()^]/g, '').replace(/\u2212/g, '-').toLowerCase();
      const shown = flat(call('answerBlock_(__x)') || '');
      const keys = call('cellsOf_(__x).filter(c => c.ways).map(c => cellsFirstWay_(c))');
      const lost = keys.filter(k => shown.indexOf(flat(esc_(k))) < 0);
      if (lost.length) fails.push(r.row_id + ': the shown answer lacks ' + lost.slice(0, 3).map(k => JSON.stringify(k)).join(', '));
      if (s.boxes !== asked || s.inTable !== s.boxes) fails.push(r.row_id + ': ' + s.boxes + ' box(es) for ' + asked + ' cells, ' + s.inTable + ' in a table');
    }
  }
  console.log('one-cells: a table a box a cell -- the tree by place 6/6, the coins\' rows in any order'
    + (n.all ? '; ' + (n.all - fails.length) + '/' + n.all + ' active questions with cells (' + n.own + ' in their own table, ' + n.drawn
      + ' in a drawn one; ' + n.rows + ' with rows and ' + n.cols + ' with columns in any order)' : ''));
  fails.slice(0, 40).forEach(f => console.log('  ' + f));
  if (fails.length) throw new Error('one-cells: ' + fails.length + ' miss(es)');
  return n;
}
module.exports = { run, TREE, COINS };
main(module, run);
