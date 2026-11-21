#!/usr/bin/env node
/* @family. — tools/one-box.js THE ONE-BOX CHECK (rule 1.75, owner 20 Nov: "a question must never show two answer boxes when it wants one answer").
   Every active question's answer face drawn by the site's own maker (find-cells.js `ansBox_`, which asks the one source, qtypes.js `qtFace_`),
   in a vm as tools/validate-questions.js loads the app. Boxes are counted in what it draws; a box a cell is allowed only in a table the part shows.
   Prints the count site-wide; any other question with more than one box fails the build. Run by tools/build.js after validate-questions. */
'use strict';
const fs = require('fs'), path = require('path');
const VQ = require('./validate-questions.js');
const { S, main } = require('./lib/gen.js');

function run() {
  if (!fs.existsSync(path.join(__dirname, '..', 'data-private', 'questions.json'))) { console.log('one-box: no data-private/questions.json here, skipped'); return null; }
  const { ctx, call } = VQ.appCode();
  call('qtFace_'); call('CARD_BLOCKS'); call('padGrid_');
  const n = { one: 0, table: 0, bad: 0, unseen: 0 }, faces = {}, bad = [];
  for (const r of VQ.rowsOf()) {
    if (r.kind !== 'question' || !(r.active === true || /^true$/i.test(S(r.active)))) continue;
    ctx.__r = r;
    let face, boxes;
    try {
      call('__x = libQuestion_(__r)');
      face = call('qtFace_(__x, cellsCardHtml_(__x))');
      /* THE BOXES DRAWN: every typed field the maker puts on the card (a table's cells are drawn into the question's own table) */
      const html = String(call('ansBox_(__x)') || '') + (face.face === 'table' ? String(call('cellsTable_(__x, cellsCardHtml_(__x))') || '') : '');
      boxes = (html.match(/class="[^"]*\b(qp-ans-in|qp-cell)\b/g) || []).length;
    } catch (e) { n.unseen++; continue; }
    faces[face.face] = (faces[face.face] || 0) + 1;
    if (face.face === 'table') { n.table++; continue; }
    if (boxes > 1) { n.bad++; bad.push(r.row_id + ' (' + face.face + ', ' + boxes + ' boxes)'); } else n.one++;
  }
  console.log('one-box: ' + n.one + '/' + (n.one + n.bad) + ' questions answered in one box; ' + n.table + ' fill a table a box a cell'
    + (n.unseen ? '; ' + n.unseen + ' not drawn here' : ''));
  console.log('  by face: ' + Object.keys(faces).sort().map(f => f + ' ' + faces[f]).join(', '));
  bad.slice(0, 40).forEach(b => console.log('  ' + b));
  if (n.bad) throw new Error('one-box: ' + n.bad + ' question(s) show more than one box for one answer');
  return n;
}
module.exports = { run };
main(module, run);
