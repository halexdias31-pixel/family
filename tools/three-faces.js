#!/usr/bin/env node
/* @family. — tools/three-faces.js THE THREE-FACES CHECK (rule 1.75, owner 22 Nov: answer input types -> type, draw; 23 Nov: pick merged into type).
   Every active question's answer face, as the one source gives it (js/qtypes.js `qtFace_`), is one of QT_FACES: type (the one box
   and keypad, options typed by their letters) or draw (the drawing pad); and every question type in data/settings/qengine.json carries one of the
   three as its `face`. No camera, no photo: their code must not come back. Prints the count site-wide; anything else fails the build. */
'use strict';
const SD = require('./lib/site-data.js');
const fs = require('fs'), path = require('path');
const VQ = require('./validate-questions.js');
const { ROOT, S, main } = require('./lib/gen.js');

function run() {
  const bad = [];
  const { ctx, call } = VQ.appCode();
  const FACES = call('QT_FACES');
  if (JSON.stringify([...FACES]) !== '["type","draw"]') bad.push('QT_FACES is ' + JSON.stringify(FACES));
  const types = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/qengine.json'), 'utf8')).types;
  Object.entries(types).forEach(([t, p]) => { if (FACES.indexOf(p.face) === -1) bad.push('qengine type ' + t + ' has face ' + JSON.stringify(p.face)); });
  /* THE CAMERA AND THE PHOTO READER STAY GONE */
  ['js/working.js', 'js/qtools.js', 'js/qtools-row.js'].forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    (src.match(/getUserMedia|ANS_FACES\.camera|qp-cam-|'qp-work'|PHOTO_READ|WORK_PICS/g) || []).forEach(m => bad.push(f + ' still has ' + m));
  });
  const counts = {};
  if (SD.hasPrivate()) {
    for (const r of VQ.rowsOf()) {
      if (r.kind !== 'question' || !(r.active === true || /^true$/i.test(S(r.active)))) continue;
      ctx.__r = r;
      let f;
      try { f = call('qtFace_(libQuestion_(__r)).face'); } catch (e) { f = 'error: ' + (e && e.message); }
      counts[f] = (counts[f] || 0) + 1;
      if (FACES.indexOf(f) === -1 && bad.length < 40) bad.push(r.row_id + ' has face ' + f);
    }
    console.log('three-faces: ' + Object.keys(counts).sort().map(f => f + ' ' + counts[f]).join(', ') + ' (active questions)');
  } else console.log('three-faces: no data-private/questions.json here, the questions skipped');
  bad.forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('three-faces: ' + bad.length + ' face(s) not type or draw');
  return counts;
}
module.exports = { run };
main(module, run);
