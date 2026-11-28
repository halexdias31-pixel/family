#!/usr/bin/env node
/* @family. — tools/eink.js THE E-INK CHECK (rule 1.75; owner 21 Nov; one list, 25 Nov night): the e-ink page (?eink) shows the Docket's open items in the
   card's order (js/map.js dkSort_, the plan, which dkCard_ draws: the open, the later, the missed), or the owner reads two orders. js/map.js dkEinkHtml_ is run as served on a made-up list at three
   clock times: the same items in the same order with the tick address of each (its place in the list), the overdue ones marked, the heading; with nothing
   open, the all-done line. Counted: every clock time and the empty list; one that differs fails the build. Run by tools/build.js. */
'use strict';
const SD = require('./lib/site-data.js');
const { ROOT, report, main } = require('./lib/gen.js');
const fs = require('fs'), path = require('path');
function drawers() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'map.js'), 'utf8'), form = fs.readFileSync(path.join(ROOT, 'js', 'form.js'), 'utf8'), text_ = SD.textOf();
  const c = (n, s) => { const m = new RegExp('\\nconst ' + n + ' = .*;\\n').exec(s || src); if (!m) throw new Error('eink: no ' + n); return m[0]; };
  const f = (n, s) => { const m = new RegExp('\\nfunction ' + n + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(s || src); if (!m) throw new Error('eink: no ' + n); return m[0]; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  /* the tick box is the form maker's (js/form.js formInput_); here only its attributes matter, so a plain input stands in for it */
  const formInput_ = a => '<input ' + a + '>';
  return new Function('text_', 'esc', 'formInput_', c('CLASH_DAYS', form) + f('clashDays_', form) + f('clashMin_', form) + ['dkMin_', 'dkIso_', 'dkEv_', 'dkRep_', 'DK_CYCLE', 'dkOn_', 'dkIsDone_'].map(n => c(n)).join('')
    + ['dkOccur_', 'dkSlot_', 'dkSort_', 'dkLeaves_', 'dkOption_', 'dkTitle_', 'dkWhen_', 'dkNowNextOf_', 'dkEinkHtml_'].map(n => f(n)).join('')
    + 'return { dkSort_, dkTitle_, dkEinkHtml_ };')(text_, esc, formInput_);
}
const unesc = s => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function einkRows(html) {
  const out = [], re = /<li class="ek-row( is-missed)?"><label class="ek-tick"><input type="checkbox" data-dkf="([^"]*)"[^>]*><span class="ek-t">([^<]*)<\/span>/g;
  let m; while ((m = re.exec(html))) out.push(m[2] + '|' + unesc(m[3]) + (m[1] ? '|over' : ''));
  return out;
}
const DAY = '2026-11-25';
const LIST = () => [{ title: 'Undated "A"' }, { title: 'Cycle <B>', repeat: '8h', doneOn: DAY + '/2' }, { title: 'Late C', date: '2026-11-01' }, { title: 'Soon D', date: '2026-11-29' }, { title: 'Done E', done: true, doneOn: DAY },
  { title: 'Windowed F', repeat: '8h', minutes: 5, runs: 60, from: '09:00', until: '21:00' }, { title: 'Slot G', repeat: '8h', options: ['x', 'y'], picks: ['x'] }];
function run() {
  const d = drawers(), bad = [], times = ['07:00', '10:00', '20:00'];
  times.forEach(at => {
    const L = LIST(), g = d.dkSort_(L, DAY + ' ' + at, []), want = g.open.concat(g.later, g.missed).map(i => i + '|' + d.dkTitle_(L[i], DAY + ' ' + at) + (g.missed.indexOf(i) >= 0 ? '|over' : '')), html = d.dkEinkHtml_(L, DAY + ' ' + at, []), got = einkRows(html);
    if (!want.length || got.join('\n') !== want.join('\n') || !/<h1 class="ek-now">Docket<\/h1>/.test(html)) bad.push(at + ': card [' + want.join(' / ') + '] e-ink [' + got.join(' / ') + ']');
  });
  const empty = d.dkEinkHtml_([{ title: 'x', done: true, doneOn: DAY }], DAY + ' 10:00');
  if (einkRows(empty).length || empty.indexOf('<p class="ek-say">' + SD.textOf()('dk-all-done') + '</p>') < 0) bad.push('nothing open: the e-ink page does not say all done');
  console.log('eink: ' + times.length + ' clock times and the empty list; ' + bad.length + ' where the e-ink page and the card\'s order differ');
  report('eink', bad, 'clock time(s) where the e-ink page and the card differ');
  return { n: times.length + 1, bad: bad.length };
}
module.exports = { run };
main(module, run);
