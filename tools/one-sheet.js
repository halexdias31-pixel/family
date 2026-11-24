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
const SB = require('./lib/site-browser.js');

/* NO TOOL, NO INK (owner, 24 Nov: the Pen tile turns drawing on and off): on a 390px phone a typed part and a drawn part are drawn as Find draws
   them, a finger dragged across each sheet with no tile picked must leave no ink and arm no pen; the Pen tile tapped, the same drag must ink.
   `armed` (for --prove) picks the pen before the first drag, which must be caught. */
async function inkCheck(armed) {
  const bad = [], said = [];
  const pg = await SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(isQ_) });
  try {
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.addStyleTag({ content: '#banner{display:none!important}' });
    for (const kind of ['typed', 'drawn']) {
      const ok = await pg.evaluate(kind => {
        const x = stuffItemsAll_().filter(isQ_).find(x => (qtFace_(x).face === 'draw') === (kind === 'drawn') && !qtFace_(x).cells);
        if (!x) return false;
        let host = document.getElementById('sheet-check');
        if (!host) { host = document.createElement('div'); host.id = 'sheet-check'; (document.querySelector('#s-' + AT + ' .page.on') || document.querySelector('#s-' + AT) || document.body).prepend(host); }
        host.innerHTML = findCard(x);
        return true;
      }, kind);
      if (!ok) { bad.push('no ' + kind + ' part to drag on'); continue; }
      const drag = async () => {
        const ink = pg.locator('#sheet-check .qp-sheet .qpad-ink').last();
        await ink.scrollIntoViewIfNeeded().catch(() => {});
        const r = await ink.boundingBox();
        if (!r) return;
        await pg.mouse.move(r.x + r.width * 0.2, r.y + r.height * 0.5); await pg.mouse.down();
        await pg.mouse.move(r.x + r.width * 0.8, r.y + r.height * 0.6, { steps: 8 }); await pg.mouse.up();
        await pg.waitForTimeout(100);
      };
      const inked = () => pg.evaluate(() => [...document.querySelectorAll('#sheet-check .qp-sheet .qpad')].reduce((n, p) => n + padRead_(p.getAttribute('data-k')).length, 0));
      if (armed) await pg.locator('#sheet-check [data-do="qt-pen"][data-tool="pen"]').first().click({ timeout: 5000 }).catch(() => {});
      await drag();
      const off = await inked();
      if (off) bad.push(kind + ' part: a drag with no tool left ' + off + ' mark(s)');
      await pg.locator('#sheet-check [data-do="qt-pen"][data-tool="pen"]').first().click({ timeout: 5000 }).catch(() => {});
      await pg.waitForTimeout(120);
      /* the pen on the lines: the last pad on the sheet */
      await pg.evaluate(() => { const ps = document.querySelectorAll('#sheet-check .qp-sheet .qpad'), p = ps[ps.length - 1]; if (p && typeof padToolPick_ === 'function' && PAD_ON !== p.getAttribute('data-k')) padToolPick_(p, 'pen'); });
      await drag();
      const on = await inked() - off;
      if (!on) bad.push(kind + ' part: the Pen tile on, a drag left no ink');
      said.push(kind + ' ' + off + ' off / ' + on + ' on');
      await pg.evaluate(() => { [...document.querySelectorAll('#sheet-check .qpad')].forEach(p => { try { keep_.del(p.getAttribute('data-k')); } catch (e) {} }); });
      await pg.evaluate(() => { const h = document.getElementById('sheet-check'); if (h) h.remove(); });
    }
  } finally { await pg.close(); await SB.done(); }
  return { bad, said };
}

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

async function run(o) {
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
  const ink = await inkCheck(false);
  console.log('  ink on a 390px phone, a drag with no tool, then with the Pen tile: ' + ink.said.join('; '));
  bad.push(...ink.bad);
  if (prove) { const p = await inkCheck(true); const caught = p.bad.some(b => /no tool left/.test(b)); console.log('  --prove a pen already in hand: ' + (caught ? 'caught' : 'MISSED')); if (!caught) bad.push('--prove: ink with a tool in hand was not caught'); }
  bad.forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('one-sheet: ' + bad.length + ' part(s) or file(s) not on the one sheet');
  return n;
}
module.exports = { run, wrong };
main(module, run);
