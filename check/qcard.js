#!/usr/bin/env node
/* @family. — check/qcard.js ONE CARD PER QUESTION NUMBER (960), and every tile answering a tap at once: a browser walk, data/qcard-health.json. */
/* Static over every question the fixture's library holds (stuffPages_ under Questions): card-split, orphan-part. On drawn cards (a sample */
/* spread over the papers): dup-tagline, tile-groups, card-order, indent. Then tap-response: each tile act on a question card and in Settings, */
/* tapped twice 300 ms apart, must change something on the page within 100 ms each time. Then text-overflow at 390 and 1024 wide. tools/health.js reads the file; ideal 0 each. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'qcard-health.json');
const glass = require('./glass.js');
const SAMPLE = Number(process.env.QCARD_SAMPLE) || 60;
/* NOT TAPPED: what leaves the screen, signs out or changes the account for good. */
const SKIP = /filter-clear|facet-|chip-|sign-?out|delete|remove|danger|^go-|^tab-|find-top|find-open|card-edit|spot|set-listed|^nav|close|logout/;

/* IN THE PAGE: every question's page and the structure of a drawn card. */
function staticPass(sample) {
  return inFinder_(FINDERS.stuff, () => {
    /* THE FUNNEL'S OWN FIRST TWO ANSWERS for a question (Practice, Questions): every question is under them. */
    const any = stuffItemsAll_().find(i => i && i.kind === 'question');
    finderSet_(FINDERS.stuff, { filters: any ? finderWalk_(any).slice(0, 2) : [], q: '' });
    const pages = stuffPages_(), seen = {}, out = { pages: pages.length, split: [], orphan: [], dupTag: [], rows: [], order: [], indent: [] };
    pages.forEach(pg => {
      if (!pg.x || pg.x.kind !== 'question') return;
      const k = qId_(pg.x) || pg.x.key;
      if (seen[k] || pg.part !== 'q') out.split.push(k + ' ' + (pg.part || 'card'));
      seen[k] = true;
      if (!(pg.parts || []).length) out.orphan.push(k);
    });
    const qs = pages.filter(pg => pg.part === 'q'), step = Math.max(1, Math.floor(qs.length / sample));
    const host = document.createElement('div');
    for (let i = 0; i < qs.length; i += step) {
      const pg = qs[i], k = qId_(pg.x) || pg.x.key;
      host.innerHTML = rowsOne_(questionWhole_(pg.x, pg.parts, pg.open, pg.ans));
      const card = host.querySelector('.qwhole');
      if (!card) { out.orphan.push(k + ' (no card)'); continue; }
      if (card.querySelectorAll('.qcard-tags').length !== 1) out.dupTag.push(k);
      const rows = [...host.querySelectorAll('.tile-row')].filter(r => !r.closest('.qwhole'));
      if (rows.length > 1) out.rows.push(k + ' ' + rows.length);
      const rank = e => e.matches('.qb-head') ? 0 : e.matches('.qb-stem') ? 1 : e.matches('.qb-part') ? 2 : e.matches('.qb') ? 3 : -1;
      card.querySelectorAll('.qb').forEach(b => {
        const r = [...b.children].map(rank).filter(n => n >= 0);
        if (r.some((n, j) => j && n < r[j - 1])) out.order.push(k + ' ' + (b.getAttribute('data-part') || 'root'));
        const d = Number((/qb-d(\d+)/.exec(b.className) || [])[1]), up = b.parentElement.closest('.qb');
        const pd = up ? Number((/qb-d(\d+)/.exec(up.className) || [])[1]) : -1;
        if (d !== pd + 1) out.indent.push(k + ' depth ' + d + ' under ' + pd);
      });
    }
    out.sampled = Math.ceil(qs.length / step);
    return out;
  });
}

/* IN THE PAGE: tap one act twice; each tap must change the page (any mutation, a toast) within 100 ms. */
function tapTwice(sel) {
  const pick = () => [...document.querySelectorAll(sel)].find(e => { const b = e.getBoundingClientRect(); return b.width && b.left >= 0 && b.left < innerWidth; });
  const once = () => new Promise(ok => {
    const el = pick();
    if (!el) return ok(-1);
    let hit = 0;
    const t0 = performance.now();
    const mo = new MutationObserver(() => { if (!hit) hit = performance.now() - t0; });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    el.scrollIntoView({ block: 'center' });
    el.click();
    setTimeout(() => { mo.disconnect(); ok(hit ? Math.round(hit) : 999); }, 120);
  });
  return once().then(a => new Promise(ok => setTimeout(() => once().then(b => ok([a, b])), 300)));
}

/* IN THE PAGE: every chip, tile and button on the glass whose words spill out of their box or break inside a word. */
function overflowScan(screen) {
  const out = [];
  const sel = e => e.tagName.toLowerCase() + (e.getAttribute('data-do') ? `[data-do="${e.getAttribute('data-do')}"]` : '') + '.' + [...e.classList].slice(0, 2).join('.') + ' "' + e.textContent.trim().slice(0, 24) + '"';
  document.querySelectorAll('.chip, .tile, .btn, button, .answers > *').forEach(e => {
    const b = e.getBoundingClientRect();
    if (!b.width || b.right < 0 || b.left > innerWidth || b.bottom < 0 || b.top > innerHeight || !e.textContent.trim()) return;
    let why = '';
    if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible') why = 'scrollWidth ' + e.scrollWidth + ' > ' + e.clientWidth;
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n && !why; n = w.nextNode()) {
      const r = document.createRange(), t = n.textContent;
      r.selectNodeContents(n);
      const tr = r.getBoundingClientRect();
      if (tr.width && (tr.left < b.left - 1 || tr.right > b.right + 1 || tr.top < b.top - 1 || tr.bottom > b.bottom + 1)) why = 'text outside its border';
      const re = /\S+/g; let m;
      while (!why && (m = re.exec(t))) { r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const lines = new Set([...r.getClientRects()].map(q => Math.round(q.top))); if (lines.size > 1) why = 'word "' + m[0] + '" broken across lines'; }
    }
    if (why) out.push(screen + ': ' + sel(e) + ' — ' + why);
  });
  return out;
}

(async () => {
  const server = await glass.serve('QCARD_PORT');
  const port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  const ADMIN = glass.VIEWERS.find(v => v.as === 'admin').user;
  await page.route('**://script.google.com/**', r => {
    if (r.request().method() !== 'POST') return r.fulfill({ status: 200, contentType: 'application/json', body: glass.FIXTURE_ANON });
    let a = {}; try { a = JSON.parse(r.request().postData() || '{}'); } catch (e) { a = {}; }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(a.action === 'verifyLogin' ? Object.assign({ success: true }, ADMIN) : { success: true }) });
  });
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 90000 });
  await page.evaluate(() => new Promise(ok => { go('account'); setTimeout(() => { document.getElementById('in-name').value = 'test@example.org'; document.getElementById('in-pin').value = '0000';
    document.querySelector('[data-do="do-signin"]').click(); const t = setInterval(() => { if (USER) { clearInterval(t); ok(); } }, 50); }, 400); }));
  await page.evaluate(() => go('stuff'));
  await page.waitForTimeout(1000);
  const st = await page.evaluate(staticPass, SAMPLE);

  /* TAPS: a drawn question card (its whole page), then Settings. */
  const taps = [];
  const actsIn = scope => page.evaluate(scope => [...new Set([...document.querySelectorAll(scope + ' .tile[data-do]')]
    .filter(e => { const b = e.getBoundingClientRect(); return b.width && b.left >= 0 && b.left < innerWidth; }).map(e => e.getAttribute('data-do')))], scope);
  await page.evaluate(() => inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true)));
  await page.waitForTimeout(1200);
  const where = { question: '#s-stuff', settings: '#s-account' };
  for (const screen of Object.keys(where)) {
    if (screen === 'settings') { await page.evaluate(() => go('account')); await page.waitForTimeout(1200); }
    for (const act of (await actsIn(where[screen])).filter(a => !SKIP.test(a))) {
      if (screen === 'question') { await page.evaluate(() => { go('stuff'); inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true)); }); await page.waitForTimeout(500); }
      const ms = await page.evaluate(tapTwice, `${where[screen]} .tile[data-do="${act}"]`);
      taps.push({ screen, act, ms });
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(200);
    }
  }
  /* TEXT-OVERFLOW at a phone and a tablet: Find's opening menu, the SATs worksheet menu, a question card, Settings. */
  const spill = [];
  for (const [w, h] of [[390, 844], [1024, 1366]]) {
    await page.setViewportSize({ width: w, height: h });
    const menus = { 'find menu': () => { finderSet_(FINDERS.stuff, { filters: [], q: '' }); go('stuff'); },
      'SATs worksheet menu': () => { const want = /KS2/; let f = [];
        const has = i => Object.values(i).some(v => v === 'SATs' || (Array.isArray(v) && v.indexOf('SATs') >= 0));
        const all = stuffItemsAll_().filter(i => i && i.kind === 'question' && /^W-/.test(qId_(i)) && has(i));
        const x = all.find(i => want.test(String(i.keystage))) || all[0] || (questionParts_()['W-CBM-2d-shapes|1'] || [])[0];
        const w = x ? finderWalk_(x) : [], at = w.findIndex(c => c.value === 'SATs');
        f = at >= 0 ? w.slice(0, at + 1) : [];
        finderSet_(FINDERS.stuff, { filters: f, q: '' }); go('stuff'); },
      'question card': () => inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true)),
      settings: () => go('account') };
    for (const name of Object.keys(menus)) {
      await page.evaluate('(' + menus[name].toString() + ')()');
      await page.waitForTimeout(1200);
      if (name === 'SATs worksheet menu') await page.screenshot({ path: path.join(process.env.QCARD_SHOTS || '/tmp', `sats-menu-${w}.png`) });
      (await page.evaluate(overflowScan, name + ' ' + w + 'x' + h)).forEach(f => spill.push(f));
    }
  }
  const lag = taps.filter(t => t.ms.some(m => m > 100) || (t.ms[0] >= 0 && t.ms[1] < 0));
  const out = { at: new Date().toISOString().slice(0, 10), pages: st.pages, sampled: st.sampled,
    checks: { 'card-split': st.split.length, 'orphan-part': st.orphan.length, 'dup-tagline': st.dupTag.length, 'tile-groups': st.rows.length,
              'card-order': st.order.length, indent: st.indent.length, 'tap-response': lag.length, 'text-overflow': spill.length },
    where: { 'card-split': st.split.slice(0, 20), 'orphan-part': st.orphan.slice(0, 20), 'dup-tagline': st.dupTag.slice(0, 20), 'tile-groups': st.rows.slice(0, 20),
             'card-order': st.order.slice(0, 20), indent: st.indent.slice(0, 20), 'tap-response': lag.map(t => `${t.screen} ${t.act}: ${t.ms.join(' / ')} ms`), 'text-overflow': spill.slice(0, 40) },
    taps, errors };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(Object.entries(out.checks).map(([k, v]) => `${k} ${v}`).join(', ') + ` (${st.pages} pages, ${st.sampled} cards drawn, ${taps.length} acts tapped)`);
  spill.slice(0, 15).forEach(f => console.log('  spill: ' + f));
  lag.forEach(t => console.log('  lag: ' + t.screen + ' ' + t.act + ' ' + t.ms.join(' / ') + ' ms'));
  await browser.close(); server.close();
  process.exit(Object.values(out.checks).some(n => n > 0) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
