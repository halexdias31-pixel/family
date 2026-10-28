#!/usr/bin/env node
/* @family. — check/centred.js A WIDGET THAT SHRINKS FLOATS BACK TO THE MIDDLE (508): on Find and Find 2, words typed and cleared, chips added and dropped, the card in front is centred after each. --shots=DIR. Port: CENTRED_PORT */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').slice(8);
const TOL = 6;

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      const lib = require('./lib-full.js').serve(p);
      if (lib !== null) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(lib); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(Number(process.env.CENTRED_PORT || 0), () => ok(s));
  });
}

/* IN THE PAGE: the card in front, against the glass. A card taller than the glass starts at its top. */
function where(id) {
  const host = document.getElementById('s-' + id);
  const pg = host && host.querySelector(':scope > .page.on');
  if (!pg) return null;
  const r = pg.getBoundingClientRect(), g = host.parentElement.getBoundingClientRect();
  const H = host.clientHeight || innerHeight;
  const top = r.top - g.top - host.offsetTop;
  const want = Math.max(0, (H - r.height) / 2);
  return { top: Math.round(top), want: Math.round(want), h: Math.round(r.height), left: Math.round(r.left), w: Math.round(r.width), vw: innerWidth };
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('centred: no browser — ' + e.message); process.exit(2); }
  const bad = [];
  let looked = 0, dropped = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
    await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 30000 }).catch(() => {});
    for (const id of ['stuff', 'res']) {
      await page.evaluate(i => { try { go(i); } catch (e) {} }, id);
      await page.waitForTimeout(900);
      const sel = `#s-${id} .page.on input[type="search"], #s-${id} .page.on input.search, #s-${id} .page.on .search-pill input`;
      const box = page.locator(sel).first();
      if (!(await box.count())) { bad.push(`${id}: no search box on the card in front — the check cannot see its subject`); continue; }
      /* A CARD THAT GREW UNDER A FINGER IS HELD WHERE IT WAS (`HOLD_AT`); only a card at rest or one that shrank must be centred. */
      let was = null;
      const look = async (when, grows) => {
        await page.waitForTimeout(900);
        const w = await page.evaluate(where, id);
        looked++;
        if (!w) { bad.push(`${id} ${when}: no card in front`); return; }
        const grew = was && w.h > was.h + 1;
        was = w;
        if (grows && grew) return;
        if (Math.abs(w.top - w.want) > TOL) bad.push(`${id} ${when}: the card's top is ${w.top}px, centred is ${w.want}px (height ${w.h})`);
        if (Math.abs(w.left + w.w / 2 - w.vw / 2) > TOL) bad.push(`${id} ${when}: the card's middle is ${Math.round(w.left + w.w / 2)}px across, not ${w.vw / 2}`);
      };
      await look('at rest');
      /* A CHIP FIRST, so the card is tall when a finger first holds it; then words typed and cleared, then the chips dropped. */
      for (let k = 0; k < 1; k++) {
        const ans = page.locator(`#s-${id} .page.on [data-do="facet-pick"]`).first();
        if (!(await ans.count())) break;
        await ans.click().catch(() => {});
        await look(`after chip ${k + 1} was added`, true);
      }
      /* AS IF ARRIVED AT NOW: let go of the hold the chips' taps made, so the next touch holds the card while it is tall. */
      await page.evaluate(() => { try { HOLD_AT = null; placeCells('y', true); } catch (e) {} });
      await look('re-centred while tall');
      await box.click();
      await box.fill('zzzz no such thing');
      await look('after words that match nothing', true);
      await box.fill('');
      await look('after the words were cleared', true);
      for (let k = 0; k < 3; k++) {
        const chip = page.locator(`#s-${id} .page.on [data-do="filter-drop"]`).first();
        if (!(await chip.count())) break;
        await chip.click().catch(() => {});
        await look(`after a chip was dropped`, true);
        dropped++;
      }
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `centred-${id}.png`) });
    }
    await page.close();
  } finally { await browser.close(); server.close(); }
  if (!dropped) bad.push('no chip was added and dropped — the check cannot see its subject');
  if (bad.length) {
    console.error(`centred: ${bad.length} card(s) not centred`);
    bad.forEach(b => console.error('  ' + b));
    process.exit(1);
  }
  console.log(`centred: Find and Find 2 stay centred across ${looked} changes (words, ${dropped} chips dropped) at 390px`);
})();
