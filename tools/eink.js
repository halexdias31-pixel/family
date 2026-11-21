#!/usr/bin/env node
/* @family. — tools/eink.js THE E-INK CHECK (rule 1.75; owner 21 Nov: NOW, NEXT step 2): the e-ink page (?eink) shows exactly what the Docket's Now/Next widget
   shows, or the owner reads two plans. js/map.js dkNowNext_ (the widget's blocks) and dkEinkHtml_ (the e-ink page) are run as served on tools/docket-plan.js's
   fixed day at each of its clock times: the same heading, the same items in the same order with the same tick address and tags (missed ones marked), the
   same Next. Counted: every clock time printed; one that differs fails the build. Run by tools/build.js. */
'use strict';
const { ROOT, read, report, main } = require('./lib/gen.js');
const fs = require('fs'), path = require('path');
const { fnOf, NOW, DAY, PHASES } = require('./docket-plan.js');
function drawers() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'map.js'), 'utf8'), words = (read('data/settings/words.json') || {}).words || {};
  const text_ = (k, v) => { const s = typeof words[k] === 'string' ? words[k] : k; return v ? s.replace(/\{(\w+)\}/g, (a, x) => (v[x] == null ? a : String(v[x]))) : s; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fns = ['dkPlan_', 'dkPhase_', 'dkNowNextOf_', 'dkNowNext_', 'dkEinkHtml_'].map(n => fnOf(src, n)).join('');
  return new Function('text_', 'esc', fns + '; return { dkPhase_, dkNowNext_, dkEinkHtml_ };')(text_, esc);
}
const unesc = s => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/* WHAT EACH SHOWS, as lines: the heading, one line per item ('at|title|tags'), the Next line. */
function widgetLines(blocks) {
  const s = blocks[0]; if (!s) return [];
  return [s.head].concat(s.blocks.map(b => (b.type === 'text' ? b.text
    : b.blocks[0].attrs['data-dkf'] + '|' + b.blocks[0].text + '|' + ((b.blocks[1] || {}).tags || []).join(' · '))));
}
function einkLines(html) {
  const out = [], re = /<h1 class="ek-now">([^<]*)<\/h1>|<input type="checkbox" data-dkf="([^"]*)"[^>]*><span class="ek-t">([^<]*)<\/span>(?:<span class="ek-tags">([^<]*)<\/span>)?|<p class="ek-(?:say|next)">([^<]*)<\/p>/g;
  let m; while ((m = re.exec(html))) out.push(m[1] != null ? unesc(m[1]) : m[5] != null ? unesc(m[5]) : unesc(m[2]) + '|' + unesc(m[3]) + '|' + unesc(m[4] || ''));
  return out;
}
function run() {
  const d = drawers(), day = NOW.slice(0, 10), bad = [];
  PHASES.forEach(c => {
    const lists = DAY();
    lists.forEach(L => L.items.forEach(it => { if ((c.tick || []).includes(it.title)) { it.doneOn = c.tickOn || day; if (it.repeat !== 'daily') it.done = true; } }));
    const p = d.dkPhase_(lists, day + ' ' + c.at), w = widgetLines(d.dkNowNext_(lists, p)), e = einkLines(d.dkEinkHtml_(lists, p));
    const missedOk = p.rows.filter(r => r.missed).length === (d.dkEinkHtml_(lists, p).match(/ek-row is-missed/g) || []).length;
    if (w.length < 2 || w.join('\n') !== e.join('\n') || !missedOk) bad.push(c.name + ' (' + c.at + '): widget [' + w.join(' / ') + '] e-ink [' + e.join(' / ') + ']');
  });
  if (!/ek-say/.test(d.dkEinkHtml_([{ name: 'x', items: [] }], null)) || d.dkNowNext_([], null).length) bad.push('no phases: the e-ink page and the widget disagree');
  console.log('eink: ' + PHASES.length + ' clock times on docket-plan\'s day; ' + (PHASES.length - bad.length) + ' show the widget\'s Now/Next on the e-ink page, ' + bad.length + ' differ');
  report('eink', bad, 'clock time(s) where the e-ink page and the widget differ');
  return { n: PHASES.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
