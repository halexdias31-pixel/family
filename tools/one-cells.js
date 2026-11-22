#!/usr/bin/env node
/* @family. — tools/one-cells.js THE ONE-CELLS CHECK (rule 1.75, owner 22 Nov: a question of several parts is the one answer box, not a grid).
   A made-up frequency tree with 6 named parts, through the site's own maker and marker (find-cells.js `ansBox_`, find-marking.js `mark_`),
   loaded in a vm as tools/validate-questions.js loads the app: it must draw one box and a hint naming the parts in order, no grid cell,
   and its right answers typed in order with commas must mark full (a wrong one must not). Then every active `cells` question here draws
   one box and a hint. Run by tools/build.js after one-box; any miss fails the build. */
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

function run() {
  const { ctx, call } = VQ.appCode();
  call('qtMarker_(workRow_({row:{}}))'); call('padGrid_'); call('CARD_BLOCKS');
  /* the form blocks are added to CARD_BLOCKS by a top-level line (cards-render.js), which the vm loader skips */
  call('Object.assign(CARD_BLOCKS, { control: kcfControl_, field: kcfField_, tick: kcfTickB_, many: kcfMany_, group: kcfGroup_ })');
  /* a block that fails is swallowed by cardBlock_ through oops_; here it is thrown, so the vm loads the name it missed */
  call('oops_ = e => { throw e; }');
  const fails = [];
  const look = x => {
    ctx.__x = x;
    const html = String(call('ansBox_(__x)') || '');
    return { boxes: (html.match(/class="[^"]*\bqp-ans-in\b/g) || []).length, grid: /\bqp-cell\b(?!s)/.test(html), hint: (/<p[^>]*class="[^"]*\bq-hint\b[^"]*"[^>]*>([^<]*)/.exec(html) || [])[1] || '' };
  };
  const tree = Object.assign({}, TREE);
  const seen = look(tree);
  if (seen.boxes !== 1) fails.push('the tree draws ' + seen.boxes + ' boxes, not 1');
  if (seen.grid) fails.push('the tree still draws a grid cell');
  if (!/^Adults, Adults who passed, Adults who failed, Children, Children who passed, Children who failed\b/.test(seen.hint)) fails.push('the tree\'s hint does not name its parts in order: "' + seen.hint + '"');
  const mark = a => { ctx.__a = a; return call('mark_(__x, __a)'); };
  const right = mark('40, 28, 12, 60, 45, 15');
  if (right.verdict !== 'right' || right.marks !== right.max) fails.push('the right answers in order mark ' + right.verdict + ' ' + right.marks + '/' + right.max);
  const swapped = mark('28, 40, 12, 60, 45, 15');
  if (swapped.verdict === 'right') fails.push('two answers swapped still mark right');
  /* SITE-WIDE: every active question with cells, one box and a hint */
  let n = 0;
  if (SD.hasPrivate()) {
    for (const r of VQ.rowsOf()) {
      if (r.kind !== 'question' || !S(r.cells) || !(r.active === true || /^true$/i.test(S(r.active)))) continue;
      ctx.__r = r;
      let s;
      try { call('__x = libQuestion_(__r)'); s = look(ctx.__x); } catch (e) { continue; }
      n++;
      if (s.boxes !== 1 || s.grid || !s.hint) fails.push(r.row_id + ': ' + s.boxes + ' box(es)' + (s.grid ? ', a grid cell' : '') + (s.hint ? '' : ', no hint'));
    }
  }
  console.log('one-cells: the frequency tree draws one box and a hint, marks ' + right.marks + '/' + right.max + ' in order'
    + (n ? '; ' + (n - fails.length) + '/' + n + ' active questions with cells drawn as one box and a hint' : ''));
  fails.slice(0, 40).forEach(f => console.log('  ' + f));
  if (fails.length) throw new Error('one-cells: ' + fails.length + ' miss(es)');
  return { n };
}
module.exports = { run };
main(module, run);
