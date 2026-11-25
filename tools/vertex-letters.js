#!/usr/bin/env node
/* @family. — tools/vertex-letters.js THE CORNER-LETTERS CHECK (rule 1.75, owner 25 Nov: "shapes lose the letters at their corners").
   Every active question part with a figure (its own, or its stem's) whose words name corner letters ("triangle ABC", "angle PQR", "side AB",
   "AB = 5 cm") draws each of those letters on that figure, unless the question asks the child to place it ("the coordinates of D",
   "Complete a possible trapezium ABCD") -- tools/lib/vertex-labels.js says which. Counted site-wide; Corbettmaths (W-CBM-*) and First Class
   Maths (W-1CM-*) must owe none but the few listed below, every other set held to a budget that can only fall. `--write` mends the library's
   figures where their own description fixes the corner (the importer, tools/content.js, mends every new one). `--prove` takes a letter off a
   good figure and fails unless it is caught. */
'use strict';
const fs = require('fs'), path = require('path');
const SD = require('./lib/site-data.js');
const VL = require('./lib/vertex-labels.js');
const { ROOT, S, main } = require('./lib/gen.js');

/* A LETTER THE FIGURE CANNOT BE TOLD WHERE TO PUT (no coordinates, no lettered polygon): named, waiting for its corner by hand. Only ever fewer. */
const OWED_CBM = { 'Q-1CM-circles-segment-area-3': 'A and C on the arc: the sector is drawn without its arc ends lettered',
  'Q-1CM-volume-and-surface-area-of-pyramids-8': 'VABCD: the two pyramids are drawn with their lengths, none of their corners lettered' };
/* EVERY OTHER SET: parts whose figure owes a letter, today. Only ever fewer. */
const OTHER_BUDGET = 8;

function parts() {
  const P = SD.privateQuestions(), out = [];
  for (const r of SD.questions()) {
    if (r.kind !== 'question' || !/^true$/i.test(S(r.active))) continue;
    const w = P[r.row_id] || {};
    const base = r.row_id.replace(/[a-z]+$/, ''), stemKey = ['S-' + base, 'S-' + r.row_id].find(k => P[k] && P[k].diagram);
    const own = /^\s*<svg\b/i.test(S(w.diagram)) ? 'own' : stemKey ? 'stem' : '';
    if (!own) continue;
    out.push({ id: r.row_id, set: S(r.paper_id), html: S(w.html), key: own === 'own' ? r.row_id : stemKey, svg: own === 'own' ? w.diagram : P[stemKey].diagram });
  }
  return { P, out };
}
const CBM = /^W-(CBM|1CM)-/;

function run() {
  if (!SD.hasPrivate()) { console.log('vertex-letters: no data-private/questions.json here, skipped'); return null; }
  const write = process.argv.includes('--write'), prove = process.argv.includes('--prove');
  let { P, out } = parts();
  if (write) {
    let mended = 0;
    out.forEach(p => { const now = VL.mend(P[p.key].diagram, p.html); if (now !== P[p.key].diagram) { P[p.key].diagram = now; mended++; } });
    /* THROUGH THE IMPORTER'S OWN WRITER (tools/lib/import.js), as every tool that changes the library */
    if (mended) require('./lib/import.js').writeWords('questions', P);
    console.log('vertex-letters: --write mended ' + mended + ' figure(s) in data-private/questions.json');
    out = parts().out;
  }
  const n = { cbm: 0, cbmOk: 0, other: 0, otherOk: 0 }, bad = [], owedOther = [];
  out.forEach(p => {
    if (!VL.named(p.html).size) return;
    const owed = VL.owed(p.svg, p.html), cbm = CBM.test(p.set);
    if (cbm) { n.cbm++; if (!owed.length) n.cbmOk++; else if (!OWED_CBM[p.id]) bad.push(p.id + ': its figure has no ' + owed.join(', ')); }
    else { n.other++; if (!owed.length) n.otherOk++; else owedOther.push(p.id + ' ' + owed.join('')); }
  });
  Object.keys(OWED_CBM).forEach(id => { const p = out.find(q => q.id === id); if (p && !VL.owed(p.svg, p.html).length) bad.push(id + ' is listed as owing a letter but draws them all: take it off OWED_CBM'); });
  console.log('vertex-letters: Corbettmaths and First Class Maths ' + n.cbmOk + '/' + n.cbm + ' figures draw every corner letter their question names ('
    + Object.keys(OWED_CBM).length + ' listed); every other set ' + n.otherOk + '/' + n.other + ' (' + owedOther.length + ' owing, budget ' + OTHER_BUDGET + ')');
  if (owedOther.length > OTHER_BUDGET) bad.push(owedOther.length + ' figures in other sets owe a corner letter, over the budget of ' + OTHER_BUDGET);
  if (prove) {
    const p = out.find(q => CBM.test(q.set) && VL.named(q.html).size && !VL.owed(q.svg, q.html).length && VL.drawn(q.svg).size);
    const c = p && [...VL.named(p.html)].find(x => VL.drawn(p.svg).has(x) && !VL.asked(p.html).has(x));
    const cut = c && p.svg.replace(new RegExp('(<text\\b[^>]*>)\\s*' + c + '\\s*(</text>)'), '$1$2');
    const caught = !!cut && VL.owed(cut, p.html).indexOf(c) >= 0;
    console.log('  --prove ' + (p ? p.id + ' without its ' + c : 'no figure to break') + ': ' + (caught ? 'caught' : 'MISSED'));
    if (!caught) bad.push('--prove: a figure without its letter was not caught');
  }
  bad.slice(0, 40).forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('vertex-letters: ' + bad.length + ' figure(s) without the corner letters their question names');
  return n;
}
module.exports = { run };
main(module, run);
