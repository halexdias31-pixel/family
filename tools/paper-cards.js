#!/usr/bin/env node
/* @family. — tools/paper-cards.js THE PAPER-CARDS CHECK (rule 1.75, owner 23 Nov: "Find narrowed to one exam paper shows NOTHING under the chips"):
   a child on an iPad, signed in, taps Find down to one exam paper — the paper's own chips, then "Doesn't matter" on every question after —
   and its question cards must be drawn under the chips; a page with only the flag button, or no word why, fails the build.
   THE WORDS ARE MADE UP AND ANSWERED AT ONCE (the backend's `item get` replied here): a card still waiting for its words is kept whatever
   the chips say, so without them the page-by-page tag test (`stuffPages_`, find-levels.js) was never reached — the 23 Nov bug lived there
   (the chip said Exam paper, each page's own tag Past paper, so every page was dropped). Counted: each sample set, across boards, sources and subjects —
   exam papers, a Corbettmaths topic and 5-a-day, a First Class Maths exercise, an Access Tuition set (ONE QUESTION SET, UNIFY item 3).
   A SET WITH A SOURCE TEXT (`insert`, ONE ATTACHMENT KIND, item 6) opens it from a question card's Insert tile.
   Run by tools/build.js after `bundle`. */
'use strict';
const { main } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');

/* THE SAMPLE: the chips a child taps (any order the funnel asks them in) and the paper every card must come from. */
const PAPERS = [
  { name: 'Edexcel GCSE Maths June 2024 Foundation Paper 2', taps: ['Practice', 'Questions', 'Maths', 'GCSE', 'Edexcel', 'Foundation', '2024', 'June', 'Paper 2'], set: 'RS1786302107764-417' },
  { name: 'AQA GCSE Physics 2023 Higher Paper 1', taps: ['Practice', 'Physics', 'GCSE', 'AQA', 'Higher', '2023', 'Paper 1'], set: 'P-AQA-8463-2306-1H' },
  { name: 'Edexcel GCSE Maths November 2023 Foundation Paper 3', taps: ['Practice', 'Questions', 'Maths', 'GCSE', 'Edexcel', 'Foundation', '2023', 'November', 'Paper 3'], set: 'RS1786302107764-425' },
  { name: 'AQA GCSE English Language June 2023 Paper 1', taps: ['Practice', 'Questions', 'English Language', 'GCSE', '2023', 'June', 'Paper 1'], set: 'P-AQA-8700-2306-1', insert: 'English Language Paper 1 insert — June 2023' },
  /* ONE QUESTION SET (UNIFY item 3): every other set is found the same way, by its source and title, not a kind of its own. */
  { name: 'Corbettmaths worksheet Times Tables', taps: ['Practice', 'Questions', 'Maths', 'Corbettmaths', 'Times Tables'], set: 'W-CBM-times-tables' },
  { name: 'First Class Maths exercise HCF and LCM', taps: ['Practice', 'Questions', 'Maths', '1st Class Maths', 'HCF and LCM'], set: 'W-1CM-hcf-and-lcm' },
  { name: 'Corbettmaths 5-a-day Foundation 1 June', taps: ['Practice', 'Questions', 'Maths', 'GCSE', 'Corbettmaths', 'Foundation', '5-a-day Foundation — 1 June'], set: 'P-CBM-5AD-F-0601' },
  { name: 'Access Tuition Physics Momentum', taps: ['Practice', 'Questions', 'Physics', 'GCSE', 'Momentum'], set: 'W-AT-P-momentum' },
  /* A TOPIC SET OF ONE BOARD'S QUESTIONS (24 Nov): Physics & Maths Tutor's AQA Foundation sub-topic paper, most of its parts the past
     papers' own questions shown again (same_as), their words asked for by the row they are. */
  /* AN @FAMILY SET (owner, 20 Nov: questions from the library): one idea's questions, made from its card's facts (tools/lib/family-q.js) */
  { name: '@family AQA Biology Cell differentiation (F)', taps: ['Practice', 'Questions', 'Biology', 'GCSE', 'AQA', 'Foundation', 'Cell differentiation'], set: 'P-FAM-AQA-bio-cell-differentiation' },
  { name: 'Physics & Maths Tutor AQA Biology 1.1 Cell Structure (F)', taps: ['Practice', 'Questions', 'Biology', 'GCSE', 'AQA', 'Foundation', '1.1 Cell Structure'], set: 'P-PMT-AQA-BF-1-1-cell-structure' },
];
const ANY = "Doesn't matter";
const IPAD = { width: 820, height: 1180 };

/* ONE PAPER: tap a sample chip whenever one is offered, else "Doesn't matter", until the funnel asks nothing more. */
async function onePaper(P) {
  const pg = await SB.open({ as: 'child', show: 'all', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(isQ_) });
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
      const own = it.map(x => String((x.row && x.row.paper_id) || ''));
      const cards = [...document.querySelectorAll('.qcard, [data-item-kind="question"]')].filter(e => e.offsetParent);
      const menu = (document.querySelector('[id$="-groups"]') || {}).textContent || '';
      return { found: it.length, own, pages: stuffPages_().length, cards: cards.length, said: menu.replace(/\s+/g, ' ').trim() };
    });
    /* A SET WITH AN ATTACHMENT (ONE ATTACHMENT KIND, queue item 6): its source opens from a card's Insert tile, one step, its card in the sheet. */
    if (false && P.insert && r.cards) {
      await pg.locator('.qcard [data-do="att-open"]:not(.kc-off)').locator('visible=true').first().click({ timeout: 5000 }).catch(() => {});
      await pg.waitForTimeout(800);
      r.insert = await pg.evaluate(() => { const sh = document.getElementById('sheet');
        return !!sh && !sh.classList.contains('hidden') ? sh.textContent.replace(/\s+/g, ' ') : ''; });
    }
    return Object.assign(r, { P, left, seen });
  } finally { await pg.close(); }
}

async function run() {
  const bad = [];
  const out = await SB.pool(PAPERS, 3, P => SB.retry(() => onePaper(P), r => !r.left.length, 1));
  out.forEach(r => {
    const P = r.P;
    if (r.left.length) return bad.push(P.name + ': the funnel never offered ' + r.left.join(', ') + ' (tapped ' + r.seen.join(' › ') + ')');
    const other = r.own.filter(id => id !== P.set);
    if (!r.found) return bad.push(P.name + ': nothing found under ' + r.seen.join(' › '));
    if (other.length) bad.push(P.name + ': ' + other.length + ' result(s) from another paper (' + other.slice(0, 3).join(', ') + ')');
    /* NO INSERT TILE ON A QUESTION SINCE 24 NOV (owner: seven buttons): the attachment is not opened from a card any more */
    if (false && P.insert && r.cards && (r.insert || '').indexOf(P.insert) < 0) bad.push(P.name + ': its Insert tile did not open "' + P.insert + '"' + (r.insert ? ' (the sheet said "' + r.insert.slice(0, 80) + '")' : ' (no sheet)'));
    if (!r.cards) bad.push(P.name + ': ' + r.found + ' found, ' + r.pages + ' page(s), but no question card under the chips' + (r.said ? ' (said: "' + r.said.slice(0, 80) + '")' : ' and no word why'));
  });
  console.log('paper-cards: ' + (PAPERS.length - new Set(bad.map(b => b.split(':')[0])).size) + '/' + PAPERS.length + ' sample sets drew their question cards for a child on an iPad'
    + ' — ' + out.map(r => r.P.set + ' ' + r.cards).join(', '));
  bad.forEach(b => console.log('  ' + b));
  await SB.done();
  if (bad.length) throw new Error('paper-cards: ' + bad.length + ' sample paper(s) drew no cards under their chips');
}
module.exports = { run };
main(module, run);
