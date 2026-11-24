#!/usr/bin/env node
/* @family. — tools/one-sheet.js THE ONE-SHEET CHECK (rule 1.75, owner 24 Nov: "one answer sheet, the same for every question part, so nothing
   changes shape under a child"). Every active question part, drawn by the site's own maker (find-cells.js `ansBox_`) in a vm as
   tools/validate-questions.js loads the app, has exactly one `.qp-sheet`, its lines the count `ansLines_` reads off the question's data, and
   no answer element outside it: every typed field, table cell and drawing pad is on the sheet. No face-swap tile or face anywhere: no
   `qp-paper`/`qp-face` act or class in js/, qengine.json's buttons or style.css. Prints the count site-wide; anything else fails the build.
   `--prove` breaks the drawn markup three ways (a second sheet, a box outside it, a face-swap tile) and fails unless each is caught. */
'use strict';
const fs = require('fs'), path = require('path');
const SD = require('./lib/site-data.js');
const VQ = require('./validate-questions.js');
const { ROOT, S, main } = require('./lib/gen.js');

/* THE SHEET'S OWN MARKUP, by matching its <div>s; what is left is everything outside it */
function split(html) {
  const re = /<div\b[^>]*\bclass="qp-sheet"[^>]*>/g, sheets = [];
  let m, outside = html;
  while ((m = re.exec(html))) {
    let depth = 0, i = m.index;
    const tag = /<(\/?)div\b[^>]*>/g;
    tag.lastIndex = i;
    let t;
    while ((t = tag.exec(html))) { depth += t[1] ? -1 : 1; if (!depth) break; }
    const end = t ? t.index + t[0].length : html.length;
    sheets.push(html.slice(m.index, end));
    outside = outside.replace(html.slice(m.index, end), '');
  }
  return { sheets, outside };
}
/* WHAT ONE PART'S MARKUP GETS WRONG, '' when nothing */
function wrong(html, lines) {
  const { sheets, outside } = split(String(html || ''));
  if (sheets.length !== 1) return sheets.length + ' sheets';
  if (/\bkp-in\b|\bqpad\b|\bqp-cell\b|<textarea|<input/.test(outside)) return 'an answer element outside the sheet';
  if (/\bqp-face\b|data-do="qp-paper|\bqp-ans-row\b|\bqp-bar\b/.test(html)) return 'a face or face-swap tile';
  const n = (/data-lines="(\d+)"/.exec(sheets[0]) || [])[1];
  if (String(n) !== String(lines)) return 'lines ' + n + ', the data says ' + lines;
  if ((sheets[0].match(/class="qpad-note\b/g) || []).length > 1) return 'more than one note on the sheet';
  if (!/\bqp-sheet-lines\b[\s\S]*\bqpad\b/.test(sheets[0])) return 'no lined paper under the pen';
  return '';
}
/* THE SWAP'S CODE STAYS GONE */
function noSwap() {
  const bad = [];
  if (fs.existsSync(path.join(ROOT, 'js/answer-face.js'))) bad.push('js/answer-face.js is back');
  fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/\.min\.js$/.test(f)).forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
    (src.match(/'qp-paper'|ANS_FACES|ansFace_|qp-face\b|paperPadPick_/g) || []).forEach(m => bad.push('js/' + f + ' has ' + m));
  });
  const Q = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/qengine.json'), 'utf8'));
  (Q.buttons || []).concat(Q.row || []).forEach(b => { if (/qp-paper|^paper$/.test(b)) bad.push('qengine.json lists ' + b); });
  if (/\.qp-face\b|\.qp-paper\b|\.qp-bar\b/.test(fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8'))) bad.push('style.css styles a face or the old bar');
  return bad;
}

function run(o) {
  const prove = (o && o.prove) || process.argv.includes('--prove');
  const bad = noSwap();
  const n = { parts: 0, ok: 0, typed: 0, table: 0, drawn: 0, unseen: 0 }, byLines = {};
  let sample = null;
  if (SD.hasPrivate()) {
    const { ctx, call } = VQ.appCode();
    call('qtFace_'); call('CARD_BLOCKS'); call('padGrid_');
    /* A BLOCK THAT FAILS IS SAID, NOT SWALLOWED (cards-render.js `cardBlock_` hands it to `oops_`): the name it lacked is loaded and it is drawn again */
    require('vm').runInContext('var oops_ = e => { throw e; }', ctx);
    /* AND THE BLOCKS cards-render.js adds at load (top-level statements the vm does not load by name) */
    (fs.readFileSync(path.join(ROOT, 'js/cards-render.js'), 'utf8').match(/^Object\.assign\(CARD_BLOCKS, \{[\s\S]*?\}\);/gm) || []).forEach(st => call(st));
    for (const r of VQ.rowsOf()) {
      if (r.kind !== 'question' || !(r.active === true || /^true$/i.test(S(r.active)))) continue;
      ctx.__r = r;
      let html, lines, face;
      try {
        call('__x = libQuestion_(__r)');
        html = String(call('ansBox_(__x)') || '');
        lines = call('ansLines_(__x)');
        face = call('qtFace_(__x)');
      } catch (e) { n.unseen++; continue; }
      n.parts++;
      const w = wrong(html, lines);
      if (w) { if (bad.length < 40) bad.push(r.row_id + ': ' + w); continue; }
      n.ok++;
      byLines[lines] = (byLines[lines] || 0) + 1;
      if (face.cells) n.table++; else if (face.face === 'draw') n.drawn++; else n.typed++;
      if (!sample && !face.cells) sample = { html, lines };
    }
    console.log('one-sheet: ' + n.ok + '/' + n.parts + ' parts on one sheet (' + n.typed + ' typed, ' + n.drawn + ' drawn, ' + n.table + ' tables)'
      + (n.unseen ? '; ' + n.unseen + ' not drawn here' : ''));
    console.log('  by lines: ' + Object.keys(byLines).sort((a, b) => a - b).map(k => k + ': ' + byLines[k]).join(', '));
  } else console.log('one-sheet: no data-private/questions.json here, the parts skipped');
  /* --prove: each break must be caught */
  if (prove && sample) {
    const breaks = {
      'a second sheet': sample.html + '<div class="qp-sheet" data-lines="1"></div>',
      'a box outside it': sample.html + '<label class="qp-ans"><textarea class="qp-ans-in kp-in"></textarea></label>',
      'a face-swap tile': sample.html.replace('</div>', '<button class="tile" data-do="qp-paper">Paper</button></div>'),
      'two notes on one sheet': sample.html.replace(/(<p class="qpad-note)/, '<p class="qpad-note"></p>$1'),
      'the wrong line count': sample.html.replace(/data-lines="\d+"/, 'data-lines="99"'),
    };
    Object.entries(breaks).forEach(([k, h]) => { const w = wrong(h, sample.lines); console.log('  --prove ' + k + ': ' + (w ? 'caught (' + w + ')' : 'MISSED')); if (!w) bad.push('--prove: ' + k + ' was not caught'); });
  }
  bad.forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('one-sheet: ' + bad.length + ' part(s) or file(s) not on the one sheet');
  return n;
}
module.exports = { run, wrong };
main(module, run);
