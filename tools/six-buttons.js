#!/usr/bin/env node
/* @family. — tools/six-buttons.js THE SIX-BUTTONS CHECK (rule 1.75, owner 22 Nov: queue step 5, "question buttons, 13 → about 6 + More").
   The question row's own splitter (js/qtools-row.js `qtSplit_`, reading data/settings/qengine.json `visible`, `more`, `cut`) is run in a vm on
   the fullest row a question part can carry: every QT_TOOLS tile, each Check, the pen's Undo and Clear, Show/Hide the answer, Help, Speed read,
   and the card's Share, Save, Flag, Message and Top. A child must see at most six tiles and one More, and every tile not cut must still be
   reachable behind More; otherwise the build fails. Run by tools/build.js after the generators. */
'use strict';
const vm = require('vm');
const { text, report, main } = require('./lib/gen.js');

function run() {
  const Q = JSON.parse(text('data/settings/qengine.json'));
  const src = text('js/qtools-row.js'), tools = text('js/qtools.js');
  const from = src.indexOf('const QT_VISIBLE'), to = src.indexOf('/* MORE IS A STEP');
  if (from < 0 || to < 0) return report('six-buttons', ['js/qtools-row.js has no qtSplit_ block'], 'missing splitter');
  const ctx = { QENGINE: { visible: Q.visible, more: Q.more, cut: Q.cut },
    tile_: o => `<button type="button" class="tile" data-do="${o.act}">${o.label}</button>` };
  vm.runInNewContext(src.slice(from, to) + ';this.qtSplit_ = qtSplit_;', ctx);
  /* THE FULLEST ROW: every act the row's makers can give a question part. */
  const acts = [...new Set([...tools.matchAll(/act: '([\w-]+)'/g)].map(m => m[1]).filter(Boolean).concat(
    ['qp-check', 'qp-cells-check', 'pad-check', 'qp-noscheme', 'qp-send', 'pad-undo', 'pad-clear', 'qa-show', 'help-hand', 'speed-open',
     'card-share', 'fav', 'rep-flag', 'msg-open', 'find-top', 'offline-get']))];
  const bad = [];
  if ((Q.visible || []).length > 6) bad.push('qengine.json `visible` lists ' + Q.visible.length + ' tiles; at most 6');
  /* ONE CHECK AT A TIME, as a part carries it */
  ['qp-check', 'qp-send', 'pad-check'].forEach(check => {
    const row = acts.filter(a => !/^(qp-check|qp-cells-check|pad-check|qp-noscheme|qp-send)$/.test(a) || a === check)
      .map(a => `<button type="button" class="tile" data-do="${a}">${a}</button>`).join('');
    const out = ctx.qtSplit_(row), cut = out.indexOf('<span class="kc-more"');
    const seen = (cut < 0 ? out : out.slice(0, cut)).match(/data-do="[\w-]+"/g) || [];
    const hidden = cut < 0 ? '' : out.slice(cut);
    if (seen.filter(s => s !== 'data-do="qt-more"').length > 6) bad.push(check + ': ' + (seen.length - 1) + ' tiles shown before More; at most 6');
    if (seen.length > 7 || (seen.length === 7 && seen[6] !== 'data-do="qt-more"')) bad.push(check + ': the row is not six tiles and More');
    acts.filter(a => !(Q.cut || []).includes(a) && (!/^(qp-check|qp-cells-check|pad-check|qp-noscheme|qp-send)$/.test(a) || a === check))
      .forEach(a => { if (!seen.includes('data-do="' + a + '"') && !hidden.includes('data-do="' + a + '"')) bad.push(check + ': ' + a + ' is neither shown nor behind More'); });
  });
  console.log('six-buttons: ' + (Q.visible || []).length + ' tiles + More on a question part; ' + (acts.length - (Q.cut || []).length) + ' tiles reachable, ' + (Q.cut || []).length + ' cut');
  report('six-buttons', bad, 'question row problem(s)');
}
module.exports = { run };
main(module, run);
