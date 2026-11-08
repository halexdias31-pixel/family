#!/usr/bin/env node
/* @family. — check/fluid.js ANY SHAPE OF SCREEN (owner, 8 Nov): at seven phone, tablet and desktop sizes, Find, a question, the booking form and Settings scroll no wider than the window and leave no blank half. --shots=DIR */
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
const SIZES = [['iphone-p', 390, 844], ['iphone-l', 844, 390], ['ipad-p', 820, 1180], ['ipad-l', 1180, 820],
  ['desk-1020', 1020, 700], ['desk-1440', 1440, 900], ['desk-1920', 1920, 1080]];

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
    s.listen(Number(process.env.FLUID_PORT || 0), () => ok(s));
  });
}

/* IN THE PAGE: sideways overflow, and where the drawn content sits. A blank half is the content's middle more than a quarter of the window off centre, or a field behind it of another colour. */
function measure() {
  const d = document.documentElement, W = d.clientWidth;
  const b = document.body.getBoundingClientRect();
  const out = { W, scrollW: d.scrollWidth, left: Math.round(b.left), right: Math.round(W - b.right), width: Math.round(b.width) };
  const field = getComputedStyle(d).backgroundColor, page = getComputedStyle(document.body).backgroundColor;
  out.field = field; out.page = page;
  return out;
}

const VIEWS = {
  find: () => { go('stuff'); scrollTo(0, 0); },
  question: () => { go('stuff'); scrollTo(0, 0); },
  booking: () => { go('booking'); scrollTo(0, 0); },
  settings: () => { go('account'); scrollTo(0, 0); },
};

(async () => {
  const server = await serve();
  const port = server.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('fluid: no browser — ' + e.message); process.exit(2); }
  const bad = [];
  let looked = 0;
  try {
    for (const [name, w, h] of SIZES) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
      await page.route('**/exec*', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await page.route('**/macros/s/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await page.goto('http://127.0.0.1:' + port + '/', { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      for (const v of Object.keys(VIEWS)) {
        await page.evaluate('(' + VIEWS[v] + ')()');
        await page.waitForTimeout(500);
        if (v === 'question') {
          /* PRACTICE, THEN ITS FIRST ANSWERS, until a question card is drawn. */
          for (let k = 0; k < 4 && !(await page.locator('#s-stuff .qb, #s-stuff .qcard').count()); k++) {
            const pick = page.locator('#s-stuff [data-do="facet-pick"]', k ? {} : { hasText: 'Practice' }).first();
            if (!(await pick.count())) break;
            await pick.click().catch(() => {});
            await page.waitForTimeout(500);
          }
          await page.evaluate(() => { const q = document.querySelector('#s-stuff .qb, #s-stuff .qcard'); if (q) q.scrollIntoView({ block: 'start' }); });
        }
        const m = await page.evaluate(measure);
        looked++;
        const at = name + ' ' + w + 'x' + h + ' ' + v;
        if (m.scrollW > m.W + 1) bad.push(at + ': the page scrolls sideways (' + m.scrollW + 'px in ' + m.W + 'px)');
        if (Math.abs(m.left - m.right) > m.W / 4) bad.push(at + ': the column is off centre (' + m.left + 'px left, ' + m.right + 'px right) — a blank side');
        if (m.width < Math.min(m.W, 600) * 0.9) bad.push(at + ': the column is ' + m.width + 'px in a ' + m.W + 'px window — squeezed');
        if (m.field !== m.page && m.page !== 'rgba(0, 0, 0, 0)' && Math.min(m.left, m.right) > 16) bad.push(at + ': the sides are a different colour (' + m.field + ') from the page (' + m.page + ') — a side panel');
        if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '-' + v + '.png') }); }
      }
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
  if (bad.length) { console.log('fluid: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('fluid: ' + looked + ' views at ' + SIZES.length + ' sizes — no sideways scroll, no blank side');
})();
