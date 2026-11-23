#!/usr/bin/env node
/* @family. — tools/one-box.js THE ONE-BOX CHECK (rule 1.75, owner 20 Nov: "a question must never show two answer boxes when it wants one answer").
   Every active question's answer face drawn by the site's own maker (find-cells.js `ansBox_`, which asks the one source, qtypes.js `qtFace_`),
   in a vm as tools/validate-questions.js loads the app. Boxes are counted in what it draws; a table's blanks are a box a cell (owner, 23 Nov), checked by tools/one-cells.js.
   Prints the count site-wide; any other question with more than one box fails the build. Run by tools/build.js after validate-questions. */
'use strict';
const SD = require('./lib/site-data.js');
const VQ = require('./validate-questions.js');
const { S, main } = require('./lib/gen.js');

function run() {
  if (!SD.hasPrivate()) { console.log('one-box: no data-private/questions.json here, skipped'); return null; }
  const { ctx, call } = VQ.appCode();
  call('qtFace_'); call('CARD_BLOCKS'); call('padGrid_');
  const n = { one: 0, table: 0, bad: 0, unseen: 0 }, faces = {}, bad = [];
  for (const r of VQ.rowsOf()) {
    if (r.kind !== 'question' || !(r.active === true || /^true$/i.test(S(r.active)))) continue;
    ctx.__r = r;
    let face, boxes;
    try {
      call('__x = libQuestion_(__r)');
      face = call('qtFace_(__x)');
      /* THE BOXES DRAWN: every typed field the maker puts on the card */
      boxes = (String(call('ansBox_(__x)') || '').match(/class="[^"]*\bqp-ans-in\b/g) || []).length;
    } catch (e) { n.unseen++; continue; }
    faces[face.face] = (faces[face.face] || 0) + 1;
    /* A TABLE TO FILL: a box a cell, its own check (tools/one-cells.js) */
    if (face.cells) { n.table++; continue; }
    if (boxes > 1) { n.bad++; bad.push(r.row_id + ' (' + face.face + ', ' + boxes + ' boxes)'); } else n.one++;
  }
  console.log('one-box: ' + n.one + '/' + (n.one + n.bad) + ' questions answered in one box; ' + n.table + ' fill a table, a box a cell'
    + (n.unseen ? '; ' + n.unseen + ' not drawn here' : ''));
  console.log('  by face: ' + Object.keys(faces).sort().map(f => f + ' ' + faces[f]).join(', '));
  bad.slice(0, 40).forEach(b => console.log('  ' + b));
  if (n.bad) throw new Error('one-box: ' + n.bad + ' question(s) show more than one box for one answer');
  return n;
}
module.exports = { run };
main(module, run);
