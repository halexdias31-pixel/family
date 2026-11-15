#!/usr/bin/env node
/* @family. — check/table-cells.js A TABLE'S BLANKS ARE CELLS OF THE TABLE (N-20261115-tb1): § */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').slice(8);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
/* THE OWNER'S QUESTION (Q24a): y = x² − x, given at −2, 0, 2; asked at −1, 1, 3. Public words, invented here. */
const ITEM = { id: 'tb1-check', key: 'tb1-check', kind: 'question', subject: 'Maths', topic: 'Graphs',
  html: '<p>Complete the table of values for <i>y</i> = <i>x</i><sup>2</sup> &minus; <i>x</i></p><table><tbody><tr><th scope="row"><i>x</i></th><td>&minus;2</td><td>&minus;1</td><td>0</td><td>1</td><td>2</td><td>3</td></tr><tr><th scope="row"><i>y</i></th><td>6</td><td></td><td>0</td><td></td><td>2</td><td></td></tr></tbody></table>',
  cells: '(i) = 2 ; (ii) = 0 ; (iii) = 6' };

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
      const lib = require('./lib-full.js').serve(f);
      if (lib !== null) { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(lib); }
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
    });
    s.listen(0, () => ok(s));
  });
}

(async () => {
  const srv = await serve(), port = srv.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.log('table-cells: no browser — ' + e.message); process.exit(2); }
  const bad = [];
  try {
    for (const width of [820, 390]) {
      const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1180 }, hasTouch: true, isMobile: width === 390, deviceScaleFactor: 1, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      await page.addInitScript(() => { try { localStorage.setItem('familyUser', JSON.stringify({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'], handle: 'sam' })); } catch (e) {} });
      await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof questionWhole_ === 'function', null, { timeout: 90000 });
      await page.waitForTimeout(500);
      const drawn = await page.evaluate(x => {
        const html = inFinder_(FINDERS.stuff, () => questionWhole_(x, [x], new Set([x]), true));
        const box = document.createElement('div');
        box.id = 'tb1-box';
        box.style.cssText = 'position:fixed;inset:0;overflow:auto;z-index:1;background:var(--paper, #fff)';
        box.innerHTML = `<div class="pane" style="position:static;overflow:visible">${html}</div>`;
        document.body.appendChild(box);
        const t = box.querySelector('table[data-cells]');
        if (t) t.scrollIntoView({ block: 'center' });
        return !!t;
      }, ITEM);
      if (!drawn) { bad.push(`${width}px: the table was not drawn with its cells`); await ctx.close(); continue; }
      const m = await page.evaluate(() => {
        const t = document.querySelector('#tb1-box table[data-cells]'), rows = [...t.rows];
        const w = el => Math.round(el.getBoundingClientRect().width * 10) / 10;
        const cols = [...rows[0].cells].map((c, i) => rows.map(r => r.cells[i] ? w(r.cells[i]) : null));
        const ins = [...t.querySelectorAll('.qp-cell')].map(i => { const r = i.getBoundingClientRect(), td = i.closest('td, th').getBoundingClientRect();
          return { w: r.width, h: r.height, tdw: td.width, im: i.getAttribute('inputmode'), ro: i.readOnly, kp: i.classList.contains('kp-in') }; });
        return { cols, ins, tw: t.getBoundingClientRect().width };
      });
      const given = m.cols.slice(1).map(c => c[0]);
      const span = Math.max(...given) - Math.min(...given);
      if (span > 1) bad.push(`${width}px: the columns are not one width — ${given.join(', ')}px`);
      m.ins.forEach((c, i) => {
        if (c.w > c.tdw + 1) bad.push(`${width}px: answer cell ${i + 1} is ${Math.round(c.w)}px, wider than its own column (${Math.round(c.tdw)}px)`);
        if (c.im !== 'none' || !c.kp) bad.push(`${width}px: answer cell ${i + 1} opens the device's keyboard (inputmode="${c.im}", ${c.kp ? '' : 'not '}a pad box)`);
      });
      /* A TAP ON THE FIRST ANSWER CELL BRINGS UP THE PAD, AND A KEY ON IT LANDS IN THAT CELL. */
      const cell = page.locator('#tb1-box .qp-cell').first();
      await cell.tap().catch(() => cell.click());
      await page.waitForTimeout(400);
      const up = await page.evaluate(() => { const kp = document.getElementById('kp'); return !!(kp && !kp.hidden && kp.getBoundingClientRect().height); });
      if (!up) bad.push(`${width}px: a tap on an answer cell did not bring up the @family. pad`);
      else {
        const key = page.locator('#kp [data-v="2"]').first();
        if (await key.count()) { await key.click({ timeout: 5000 }).catch(() => {}); await page.waitForTimeout(150); }
        const v = await page.evaluate(() => document.querySelector('#tb1-box .qp-cell').value);
        if (v !== '2') bad.push(`${width}px: the pad's 2 did not land in the cell (it holds "${v}")`);
      }
      if (SHOTS) {
        fs.mkdirSync(SHOTS, { recursive: true });
        await page.screenshot({ path: path.join(SHOTS, `table-${width}.png`) });
      }
      await ctx.close();
    }
  } finally { await browser.close(); srv.close(); }
  if (bad.length) { console.log('FAIL — check/table-cells.js:\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('ok — check/table-cells.js: every column one width, every answer cell its column\'s size and on the @family. pad, at 820 and 390');
})();
