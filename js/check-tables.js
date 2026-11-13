#!/usr/bin/env node
/* @family. — js/check-tables.js EVERY TABLE IN A QUESTION, DRAWN AT 390 WIDE IN ITS REAL CARD: every cell bordered, none
   narrower than 1.5em, every row's columns under row one's, and each inside `.qtext` (the one shared rule). */
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const lib = require(path.join(ROOT, 'check', 'lib-full.js'));
lib.needWords('tables in question words', { fixture: ['questions'] });
const glass = require(path.join(ROOT, 'check', 'glass.js'));

/* IN THE PAGE: every question whose stems, parts or answers hold a table, drawn whole into the open question page. */
function scan() {
  return inFinder_(FINDERS.stuff, () => {
    const out = { tables: 0, cards: 0, fails: [] };
    const has = o => { try { return /<table/i.test(JSON.stringify(o, (k, v) => (k === 'row' ? undefined : v))); } catch (e) { return false; } };
    const qp = questionParts_();
    const pages = Object.keys(qp).map(k => qp[k] || []).filter(ps => ps.length && ps.some(has));
    const slot = document.querySelector('#s-stuff .page.on') || document.querySelector('#s-stuff');
    const host = document.createElement('div');
    slot.appendChild(host);
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
    const seen = new Set();
    pages.forEach(pg => {
      const k = qId_(pg[0]) || pg[0].key;
      host.innerHTML = rowsOne_(questionWhole_(pg[0], pg, new Set(pg), true));
      host.querySelectorAll('.qans-card.is-hidden').forEach(c => c.classList.remove('is-hidden'));
      out.cards++;
      host.querySelectorAll('table').forEach((t, ti) => {
        if (!vis(t)) return;
        const where = k + ' table ' + (ti + 1);
        const sig = t.outerHTML;
        if (seen.has(sig)) return;
        seen.add(sig);
        out.tables++;
        if (!t.closest('.qtext')) out.fails.push(where + ': not inside .qtext (' + (t.parentElement.className || t.parentElement.tagName) + ')');
        const bad = { border: 0, narrow: 0 };
        const cells = [...t.querySelectorAll('th, td')].filter(c => c.closest('table') === t);
        cells.forEach(c => {
          const s = getComputedStyle(c);
          const sides = ['Top', 'Right', 'Bottom', 'Left'].every(d => parseFloat(s['border' + d + 'Width']) > 0 && !/none|hidden/.test(s['border' + d + 'Style'])
            && !/rgba\(.*, 0\)$|transparent/.test(s['border' + d + 'Color']));
          if (!sides) bad.border++;
          if (c.getBoundingClientRect().width < 1.5 * parseFloat(s.fontSize) - 0.5) bad.narrow++;
        });
        if (bad.border) out.fails.push(where + ': ' + bad.border + ' of ' + cells.length + ' cells with no visible border');
        if (bad.narrow) out.fails.push(where + ': ' + bad.narrow + ' cells narrower than 1.5em');
        /* THE GRID: each cell's column from colspan and rowspan; a one-column cell must sit in row one's x-range. */
        const rows = [...t.rows], grid = [], taken = [];
        rows.forEach((r, ri) => {
          grid[ri] = [];
          let col = 0;
          [...r.cells].forEach(c => {
            while (taken[ri] && taken[ri][col]) col++;
            const cs = c.colSpan || 1, rs = c.rowSpan || 1;
            for (let a = 0; a < rs; a++) for (let b = 0; b < cs; b++) { taken[ri + a] = taken[ri + a] || []; taken[ri + a][col + b] = true; }
            if (cs === 1) grid[ri][col] = c;
            col += cs;
          });
        });
        const head = grid[0] || [];
        const off = [];
        grid.forEach((row, ri) => { if (!ri) return; row.forEach((c, ci) => { const h = head[ci]; if (!c || !h) return;
          const a = h.getBoundingClientRect(), b = c.getBoundingClientRect();
          if (Math.abs(a.left - b.left) > 2 || Math.abs(a.right - b.right) > 2) off.push('row ' + (ri + 1) + ' col ' + (ci + 1)); }); });
        /* A REAL TABLE, NEVER A BLOCK (13 Nov: Safari drew a block table's percentages a row low); every row's cells share one top. */
        if (getComputedStyle(t).display !== 'table') out.fails.push(where + ': drawn as display ' + getComputedStyle(t).display + ', not a table (the scroller is .q-tscroll round it)');
        rows.forEach((r, ri) => { const tops = [...r.cells].filter(c => (c.rowSpan || 1) === 1).map(c => c.getBoundingClientRect().top);
          if (tops.length && Math.max(...tops) - Math.min(...tops) > 2) off.push('row ' + (ri + 1) + ' cells at different heights'); });
        if (off.length) out.fails.push(where + ': cells out of line with row 1 (' + off.slice(0, 3).join(', ') + (off.length > 3 ? ' …' : '') + ')');
      });
    });
    host.remove();
    return out;
  });
}

(async () => {
  const t0 = Date.now();
  const server = await glass.serve('TABLES_PORT');
  const port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  let res;
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json',
      body: r.request().method() === 'POST' ? '{"success":true}' : glass.FIXTURE_ANON }));
    /* CI (LIB_PRIVATE=absent): the public fixture's rows, one with a table, in place of the metadata-only file. */
    if (lib.fixture()) {
      const file = lib.defs().files.questions.file;
      await page.route('**/' + file + '*', r => r.fulfill({ status: 200, contentType: 'application/json',
        body: require('fs').readFileSync(path.join(ROOT, 'check', 'fixtures', 'lib', 'questions.json'), 'utf8') }));
    }
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 90000 });
    await page.evaluate(() => { go('stuff'); inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true)); });
    await page.waitForTimeout(800);
    res = await page.evaluate(scan);
  } finally { await browser.close(); server.close(); }
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  /* NONE FOUND IS A FAILURE: the library (or CI's fixture) has tables, so zero means the walk found nothing to look at. */
  if (!res.tables) { console.log('FAIL — check-tables: no question table drawn (' + res.cards + ' cards), so nothing was checked'); process.exit(1); }
  if (res.fails.length) {
    console.log('FAIL — check-tables: ' + res.fails.length + ' of ' + res.tables + ' question tables drawn badly at 390 wide (' + secs + 's)');
    res.fails.slice(0, 40).forEach(f => console.log('  ' + f));
    process.exit(1);
  }
  if (process.env.VERBOSE) console.log('check-tables: ' + res.tables + ' question tables in ' + res.cards + ' cards, all bordered and aligned (' + secs + 's)');
})().catch(e => { console.log('FAIL — check-tables: ' + e.message); process.exit(1); });
