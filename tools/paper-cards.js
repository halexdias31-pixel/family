#!/usr/bin/env node
/* @family. — tools/paper-cards.js THE PAPER-CARDS CHECK (rule 1.75, owner 23 Nov: "Find narrowed to one exam paper shows NOTHING under the chips"):
   a child on an iPad, signed in, taps Find down to one exam paper — the paper's own chips, then "Doesn't matter" on every question after —
   and its question cards must be drawn under the chips; a page with only the flag button, or no word why, fails the build.
   THE WORDS ARE MADE UP AND ANSWERED AT ONCE (the backend's `item get` replied here): a card still waiting for its words is kept whatever
   the chips say, so without them the page-by-page tag test (`stuffPages_`, find-levels.js) was never reached — the 23 Nov bug lived there
   (the chip said Exam paper, each page's own tag Past paper, so every page was dropped). Counted: each sample paper, across boards and subjects.
   Run by tools/build.js after `bundle`. */
'use strict';
const { main } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');

/* THE SAMPLE: the chips a child taps (any order the funnel asks them in) and the paper every card must come from. */
const PAPERS = [
  { name: 'Edexcel GCSE Maths June 2024 Foundation Paper 2', taps: ['Practice', 'Questions', 'Maths', 'GCSE', 'Exam paper', 'Edexcel', 'Foundation', '2024', 'June', 'Paper 2'], id: 'Q-1MA1-2406-2F-' },
  { name: 'AQA GCSE Physics 2023 Higher Paper 1', taps: ['Practice', 'Physics', 'GCSE', 'Exam paper', 'AQA', 'Higher', '2023', 'Paper 1'], id: 'Q-AQA-8463-2306-1H-' },
  { name: 'Edexcel GCSE Maths November 2023 Foundation Paper 3', taps: ['Practice', 'Questions', 'Maths', 'GCSE', 'Exam paper', 'Edexcel', 'Foundation', '2023', 'November', 'Paper 3'], id: 'Q-1MA1-2311-3F-' },
  { name: 'AQA GCSE English Language June 2023 Paper 1', taps: ['Practice', 'Questions', 'English Language', 'GCSE', '2023', 'June', 'Paper 1'], id: 'Q-AQA-8700-2306-1-' },
];
const ANY = "Doesn't matter";
const IPAD = { width: 820, height: 1180 };

/* ONE PAPER: tap a sample chip whenever one is offered, else "Doesn't matter", until the funnel asks nothing more. */
async function onePaper(P) {
  const pg = await SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(isQ_) });
  try {
    await pg.route(/script\.google\.com/, (r, req) => {
      let b = null; try { b = JSON.parse(req.postData() || 'null'); } catch (e) { b = null; }
      if (!b || b.action !== 'item' || b.door !== 'get') return r.fallback();
      const items = {};
      (b.ids || []).forEach(t => { items[t] = { html: '<p>A made-up question.</p>', answer: '1', accept: '1' }; });
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, items, gen: 1 }) });
    });
    await pg.setViewportSize(IPAD);
    const left = P.taps.slice(), seen = [];
    for (let i = 0; i < 30; i++) {
      const vis = await pg.evaluate(() => [...document.querySelectorAll('button,a,[role=button]')].filter(e => e.offsetParent).map(e => e.textContent.trim()));
      const chips = vis.indexOf(ANY) >= 0;
      const next = left.find(t => vis.indexOf(t) >= 0 && (chips || t === left[0]));
      const t = next && chips ? next : chips ? ANY : null;
      if (!t) break;
      if (next) left.splice(left.indexOf(next), 1);
      seen.push(t);
      await SB.tap(pg, t);
    }
    /* THE WORDS LAND, THEN THE COLUMN IS DRAWN AGAIN. */
    await pg.waitForFunction(() => !document.querySelector('.lib-wait'), null, { timeout: 20000 }).catch(() => {});
    await pg.waitForTimeout(1000);
    const r = await pg.evaluate(() => {
      const it = stuffFiltered();
      const own = it.map(x => String((x.row && x.row.row_id) || ''));
      const cards = [...document.querySelectorAll('.qcard, [data-item-kind="question"]')].filter(e => e.offsetParent);
      const menu = (document.querySelector('[id$="-groups"]') || {}).textContent || '';
      return { found: it.length, own, pages: stuffPages_().length, cards: cards.length, said: menu.replace(/\s+/g, ' ').trim() };
    });
    return Object.assign(r, { P, left, seen });
  } finally { await pg.close(); }
}

async function run() {
  const bad = [];
  const out = await SB.pool(PAPERS, 3, P => SB.retry(() => onePaper(P), r => !r.left.length, 1));
  out.forEach(r => {
    const P = r.P;
    if (r.left.length) return bad.push(P.name + ': the funnel never offered ' + r.left.join(', ') + ' (tapped ' + r.seen.join(' › ') + ')');
    const other = r.own.filter(id => id.indexOf(P.id) !== 0);
    if (!r.found) return bad.push(P.name + ': nothing found under ' + r.seen.join(' › '));
    if (other.length) bad.push(P.name + ': ' + other.length + ' result(s) from another paper (' + other.slice(0, 3).join(', ') + ')');
    if (!r.cards) bad.push(P.name + ': ' + r.found + ' found, ' + r.pages + ' page(s), but no question card under the chips' + (r.said ? ' (said: "' + r.said.slice(0, 80) + '")' : ' and no word why'));
  });
  console.log('paper-cards: ' + (PAPERS.length - new Set(bad.map(b => b.split(':')[0])).size) + '/' + PAPERS.length + ' sample papers drew their question cards for a child on an iPad'
    + ' — ' + out.map(r => r.P.id.slice(2, -1) + ' ' + r.cards).join(', '));
  bad.forEach(b => console.log('  ' + b));
  await SB.done();
  if (bad.length) throw new Error('paper-cards: ' + bad.length + ' sample paper(s) drew no cards under their chips');
}
module.exports = { run };
main(module, run);
