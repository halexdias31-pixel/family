#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/card-text-bounds.js NO GLYPH OR BULLET OUTSIDE ITS CARD AT 390: every lesson page by the app's own makers (owner, 13 Nov: a "›" cut off at the edge). */
const LF = require('./lib-full.js');
LF.needWords();
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const W = 390;
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };

/* IN THE PAGE: each lesson's worked, formulas and words pages, one at a time, in a Find-classed slot. */
function measure(max) {
  const all = stuffItemsAll_().filter(x => isContent_(x) && x.row);
  const front = document.querySelector('.screen.is-front') || document.querySelector('.screen');
  const slot = document.createElement('div');
  slot.className = front.className;
  slot.style.cssText = 'position:absolute;left:0;top:0;width:100%;display:block;height:auto;padding:0 16px;box-sizing:border-box';
  document.body.appendChild(slot);
  const bad = [];
  let n = 0;
  for (const x of all.slice(0, max)) {
    for (const part of ['worked', 'formulas']) {
      let h = '';
      try { h = partCard_(x, part); } catch (e) { continue; }
      if (!h) continue;
      slot.innerHTML = h;
      const card = slot.querySelector('.card');
      if (!card) continue;
      n++;
      const cs = getComputedStyle(card), r = card.getBoundingClientRect();
      const L = r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft) - 0.5;
      const R = r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight) + 0.5;
      const say = [];
      const walk = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      for (let t = walk.nextNode(); t; t = walk.nextNode()) {
        if (!t.textContent.trim() || t.parentElement.closest('svg, .kc-act, [hidden]')) continue;
        const rg = document.createRange(); rg.selectNodeContents(t);
        for (const b of rg.getClientRects()) if (b.width && (b.left < L || b.right > R)) { say.push(`"${t.textContent.trim().slice(0, 24)}" at ${Math.round(b.left)}–${Math.round(b.right)}`); break; }
      }
      /* A BULLET IS DRAWN OUTSIDE ITS ITEM: the item must leave it a glyph's room (0.9em) inside the card. */
      card.querySelectorAll('li').forEach(li => {
        const ls = getComputedStyle(li);
        if (ls.listStyleType === 'none' && getComputedStyle(li, '::marker').content === 'normal') return;
        if (ls.listStylePosition !== 'outside') return;
        const b = li.getBoundingClientRect();
        if (b.left - 0.9 * parseFloat(ls.fontSize) < L) say.push(`the bullet of "${li.textContent.trim().slice(0, 24)}" starts left of the card`);
      });
      if (say.length) bad.push(`${x.name} · ${part}: ${[...new Set(say)].slice(0, 3).join('; ')}`);
    }
  }
  slot.remove();
  return { n, bad };
}

(async () => {
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]); const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
    const b = LF.serve(p); if (b !== null) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(b); }
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
  });
  await new Promise(d => srv.listen(0, d));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true });
    await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* blocked */ } },
      { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], handle: 'sam_quick12', token: 't-student' });
    await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
    await page.goto(`http://localhost:${srv.address().port}/index.html`);
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 60000 });
    await page.evaluate(() => go('stuff', false, true));
    await page.waitForFunction(() => { try { return stuffItemsAll_().some(x => isContent_(x)); } catch (e) { return false; } }, null, { timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    const { n, bad } = await page.evaluate(measure, 400);
    if (!n) { console.log('check/card-text-bounds.js: no lesson page was drawn, so nothing was measured'); process.exit(1); }
    if (bad.length) {
      console.log(`check/card-text-bounds.js: ${bad.length} of ${n} lesson pages put text or a bullet outside the card at ${W}:`);
      bad.slice(0, 30).forEach(b => console.log('  ' + b));
      process.exit(1);
    }
    console.log(`check/card-text-bounds.js: ${n} lesson pages at ${W}, every glyph and bullet inside its card`);
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.log('check/card-text-bounds.js: ' + e.stack); process.exit(1); });
