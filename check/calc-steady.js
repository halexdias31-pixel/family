#!/usr/bin/env node
/* @family. — check/calc-steady.js A REAL CALCULATOR DOES NOT CHANGE SHAPE (472): keys pressed, held and released leave the device, its display and every key where and as big as they were. Port: CALC_PORT */
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
/* Twenty-three digits overflow the glass; then a fraction, a power, SHIFT and its keys, a root, S⇔D, a division by nought, trig. */
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '=', 'C',
  'frac', '1', 'down', '2', 'right', '+', 'frac', '3', 'down', '4', '=', 'pow', '2', '=', 'shift', 'sqrt', '8', '=', 'shift', '7', '=',
  'sqrt', '2', '=', 'sd', '1', '÷', '0', '=', 'C', 'shift', 'shift', 'sin', '3', '0', ')', '=', 'Ans', '×', '(', '2', '+', 'frac', '7', 'down', '9', '='];

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
    s.listen(Number(process.env.CALC_PORT || 0), () => ok(s));
  });
}

/* IN THE PAGE: every box that must not move, as text, so two snapshots compare as strings. */
function snap() {
  const c = document.querySelector('#s-tools #wgt-calculator .calc');
  if (!c) return null;
  const R = e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * 10) / 10).join(','); };
  const out = { device: R(c), display: R(c.querySelector('.mc-display')) };
  c.querySelectorAll('.mc-btn').forEach(k => { out['key ' + k.dataset.mc] = R(k) + ' face ' + R(k.querySelector('.mc-lab') || k); });
  return out;
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('calc-steady: no browser — ' + e.message); process.exit(2); }
  const bad = new Set();
  let pressed = 0, keys = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
    await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => { try { go('tools'); } catch (e) {} });
    await page.waitForFunction(() => !!document.querySelector('#s-tools #wgt-calculator #mc-display .mc-out'), null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800);
    const base = await page.evaluate(snap);
    if (!base) { console.error('calc-steady: no calculator on Tools — the check cannot see its subject'); process.exit(1); }
    keys = Object.keys(base).length - 2;
    const cmp = (now, when) => Object.keys(base).forEach(k => { if (now[k] !== base[k]) bad.add(`${when}: ${k} was ${base[k]}, now ${now[k]}`); });
    for (const k of KEYS) {
      const box = await page.locator(`#s-tools #wgt-calculator [data-mc="${k}"]`).boundingBox();
      if (!box) { bad.add(`no key "${k}" to press`); continue; }
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(90);
      cmp(await page.evaluate(snap), `holding ${k}`);
      await page.mouse.up();
      await page.waitForTimeout(90);
      cmp(await page.evaluate(snap), `after ${k}`);
      pressed++;
    }
    await page.close();
  } finally { await browser.close(); server.close(); }
  if (bad.size) {
    console.error(`calc-steady: the calculator changed shape (${bad.size} finding(s))`);
    [...bad].slice(0, 30).forEach(b => console.error('  ' + b));
    process.exit(1);
  }
  console.log(`calc-steady: ${pressed} presses, the device, its display and ${keys} keys never moved or resized`);
})();
