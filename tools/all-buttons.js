#!/usr/bin/env node
/* @family. — tools/all-buttons.js THE ALL-BUTTONS CHECK (rule 1.75, owner 23 Nov: "I don't like how there's a button for more buttons. I hate it… I want all to display.").
   1. The question row's own maker (js/qtools-row.js `qtAll_`, reading data/settings/qengine.json `buttons`, `cut`) is run in a vm on many
      parts: the fullest row, the barest, each Check alone, and made-up mixes. Every part must show the `buttons` list, the same tiles in the
      same order, and every tile the row's makers can give must be in that list or `cut`.
   2. Nowhere on the site does a More, a ⋯ or a … hide actions: no More act or tile, no hidden More box, no ⋯ summary.
   Otherwise the build fails. Run by tools/build.js after the generators. */
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const { text, report, main } = require('./lib/gen.js');

const CHECKS = ['qp-check', 'qp-cells-check', 'pad-check', 'qp-noscheme', 'qp-send'], TOGGLE = ['qa-show', 'qa-hide'];
/* A More act is one that opens hidden tiles; Term dates' `td-more` (Later) shows more dates, not actions, so it is not one. */
const OVER = [[/act: *'(?!td-more')[\w-]*-more'/, 'a More act'], [/label: *'(More|More tools|Options|Actions)'/, 'a tile labelled More'], [/\bkc-more\b/, 'a hidden More box'],
  [/<summary[^>]*>\s*(\\u22ef|\\u2026|⋯|…|\.\.\.)\s*<\/summary>/, 'a ⋯ that opens more'], [/(icon|label): *'(⋯|…|\\u22ef|\\u2026|more)'/, 'a ⋯ tile']];

function run() {
  const Q = JSON.parse(text('data/settings/qengine.json'));
  const src = text('js/qtools-row.js'), tools = text('js/qtools.js');
  const from = src.indexOf('const QT_BUTTONS'), end = src.indexOf('function qtAll_'), to = end < 0 ? -1 : src.indexOf('\n}\n', end);
  const bad = [];
  if (from < 0 || to < 0) return report('all-buttons', ['js/qtools-row.js has no qtAll_ block'], 'missing row maker');
  const ctx = { QENGINE: { buttons: Q.buttons, cut: Q.cut },
    tile_: o => `<button type="button" class="tile${o.cls ? ' ' + o.cls : ''}" data-do="${o.act}"${o.data && o.data.tool ? ` data-tool="${o.data.tool}"` : ''}>${o.label}</button>` };
  vm.runInNewContext(src.slice(from, to + 3) + ';this.qtAll_ = qtAll_;', ctx);
  /* EVERY TILE A PART'S MAKERS CAN GIVE: QT_TOOLS by act and tool, then the row's other makers' acts */
  const toolTiles = [...tools.matchAll(/\{ id: '([\w-]+)',[^}]*act: '([\w-]*)'/g)].filter(m => m[2]).map(m => ({ act: m[2], tool: m[1] }));
  /* SEVEN BUTTONS (owner, 24 Nov): Clear, Show the answer, Help and Speed read are no longer made on a question part */
  const others = CHECKS.concat(['pad-undo', 'card-share', 'msg-open', 'find-top'])
    .map(act => ({ act, tool: '' }));
  const every = toolTiles.concat(others);
  const tile = t => `<button type="button" class="tile" data-do="${t.act}"${t.tool ? ` data-tool="${t.tool}"` : ''}>${t.act}</button>`;
  const want = (Q.buttons || []).map(s => String(s).split(':')[0]);
  /* WHICH `buttons` PLACE A TILE TAKES, by act and (where the place names one) its tool */
  const slotOf = (act, tool) => want.findIndex(w => { const [acts, wt] = w.split('/'); return acts.split('|').includes(act) && (!wt || wt === tool); });
  const seq = html => (html.match(/<button\b[^>]*>/g) || []).map(b => {
    const act = (/data-do="([^"]*)"/.exec(b) || [])[1] || '', tool = (/data-tool="([^"]*)"/.exec(b) || [])[1] || '';
    const i = slotOf(act, tool); return i < 0 ? act + (tool ? '/' + tool : '') : want[i];
  });
  if (!want.length) bad.push('qengine.json has no `buttons` list');
  every.forEach(t => { if (!(Q.cut || []).includes(t.act) && slotOf(t.act, t.tool) < 0) bad.push(t.act + (t.tool ? '/' + t.tool : '') + ' is drawn on a question but is not in qengine.json `buttons`'); });
  /* MANY PARTS (a fixed seed, so a failure repeats): one Check each, as a part carries it */
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  /* ONE CHECK AND ONE SHOW/HIDE A PART, as it carries them */
  const one = (r, set) => r.filter((t, j) => !set.includes(t.act) || r.findIndex(u => set.includes(u.act)) === j);
  const oneCheck = r => one(one(r, CHECKS), TOGGLE);
  const rows = [oneCheck(every), []].concat(CHECKS.map(c => [{ act: c, tool: '' }]));
  for (let i = 0; i < 60; i++) rows.push(oneCheck(every.filter(() => rnd() < 0.5).sort(() => rnd() - 0.5)));
  rows.forEach((r, i) => {
    const out = ctx.qtAll_(r.map(tile).join('')), got = seq(out);
    if (got.join(' ') !== want.join(' ')) bad.push('part ' + i + ': its buttons differ from `buttons`: ' + got.join(' '));
  });
  /* NO OVERFLOW ANYWHERE: the site's own code and page */
  const files = fs.readdirSync(path.join(__dirname, '..', 'js')).filter(f => /\.js$/.test(f)).map(f => 'js/' + f).concat(['index.html']);
  files.forEach(f => { const s = text(f); OVER.forEach(([re, what]) => { const m = s.match(re); if (m) bad.push(f + ': ' + what + ' (' + m[0] + ')'); }); });
  console.log('all-buttons: ' + want.length + ' buttons on every question part, the same in the same order across ' + rows.length + ' parts; '
    + (Q.cut || []).length + ' cut; no More in ' + files.length + ' files');
  report('all-buttons', bad, 'button problem(s)');
}
module.exports = { run };
main(module, run);
