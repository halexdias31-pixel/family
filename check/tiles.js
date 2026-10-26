#!/usr/bin/env node
/* @family. — check/tiles.js ONE TILE SPEC (467): every tile is made by `tile_`, is a 44px plate with an 18px mark, and a row of them never overlaps, spills or leaves a lone orphan. Flags: --width=390. Port: TILES_PORT. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const WIDTH = Number((process.argv.find(a => a.startsWith('--width=')) || '').split('=')[1] || 0);
const SIZES = [320, 390, 768, 1280].filter(w => !WIDTH || w === WIDTH);
const bad = [];

/* ---------- STATIC: a tile not made by `tile_` is a look-alike, and drifts. */
const own = new Set(['tiles.js']);
fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f) && !own.has(f)).forEach(f => {
  fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').split('\n').forEach((l, i) => {
    if (/class="tile[ "]|classList\.add\('tile'\)|className\s*=\s*'tile[ ']/.test(l)) bad.push(`js/${f}:${i + 1}: a tile drawn by hand — use tile_()`);
  });
});
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
css.split('\n').forEach((l, i) => {
  if (/\.tile(\.[a-z-]+)*[^{,-]*\{[^}]*\b(width|height):\s*\d/.test(l) && !/is-busy::before/.test(l)) bad.push(`style.css:${i + 1}: a tile sized outside the spec: ${l.trim().slice(0, 90)}`);
  if (/\.tile-i[^{]*\{[^}]*\bwidth:\s*\d/.test(l) && /tile-row|\.tile[\s.]/.test(l)) bad.push(`style.css:${i + 1}: a row tile's mark sized outside the spec`);
});

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
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
    s.listen(Number(process.env.TILES_PORT || 0), () => ok(s));
  });
}

/* ---------- IN THE PAGE: one screen's rows, measured. */
function measure(id) {
  const out = [];
  const sec = document.getElementById('s-' + id);
  if (!sec) return { out, tiles: 0 };
  let tiles = 0;
  sec.querySelectorAll('.tile-row').forEach((row, ri) => {
    const rr = row.getBoundingClientRect();
    if (!rr.width) return;
    const ts = [...row.querySelectorAll('.tile')].filter(t => t.closest('.tile-row') === row && t.offsetWidth);
    const where = `#s-${id} row ${ri} (${row.className})`;
    ts.forEach(t => {
      tiles++;
      const b = t.getBoundingClientRect(), name = t.getAttribute('aria-label') || '?';
      if (!t.classList.contains('is-sure') && (t.offsetWidth !== 44 || t.offsetHeight !== 44)) out.push(`${where}: "${name}" is ${t.offsetWidth}x${t.offsetHeight}, not 44x44`);
      const i = t.querySelector('.tile-i');
      const iw = i ? parseFloat(getComputedStyle(i).width) : 18;
      if (Math.round(iw) !== 18) out.push(`${where}: "${name}" has a ${Math.round(iw)}px mark, not 18px`);
      if (b.right > rr.right + 1) out.push(`${where}: "${name}" spills ${Math.round(b.right - rr.right)}px past its row`);
    });
    for (let a = 0; a < ts.length; a++) for (let c = a + 1; c < ts.length; c++) {
      const x = ts[a].getBoundingClientRect(), y = ts[c].getBoundingClientRect();
      if (x.left < y.right - 1 && y.left < x.right - 1 && x.top < y.bottom - 1 && y.top < x.bottom - 1) out.push(`${where}: "${ts[a].getAttribute('aria-label')}" overlaps "${ts[c].getAttribute('aria-label')}"`);
    }
    const lines = [];
    ts.forEach(t => { const y = Math.round(t.getBoundingClientRect().top); const l = lines.find(q => Math.abs(q.y - y) < 4); if (l) l.n++; else lines.push({ y, n: 1 }); });
    lines.sort((p, q) => p.y - q.y);
    if (lines.length > 1 && lines[lines.length - 1].n === 1 && lines[lines.length - 2].n >= 3) out.push(`${where}: a lone tile wrapped under a line of ${lines[lines.length - 2].n}`);
  });
  return { out, tiles };
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('tiles: no browser — ' + e.message); process.exit(2); }
  let measured = 0;
  try {
    for (const w of SIZES) {
      const page = await browser.newPage({ viewport: { width: w, height: 844 } });
      await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
      await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(800);
      const ids = await page.evaluate(() => TABS.map(t => t.id || t));
      for (const id of ids) {
        await page.evaluate(i => { try { go(i); } catch (e) {} }, id);
        await page.waitForTimeout(250);
        const r = await page.evaluate(measure, id);
        measured += r.tiles;
        r.out.forEach(x => bad.push(`${w}px ${x}`));
      }
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
  if (!measured) { console.error('tiles: no tile was measured — the check cannot see its subject'); process.exit(1); }
  if (bad.length) { console.error(`tiles: ${bad.length} tile(s) off the spec`); bad.forEach(b => console.error('  ' + b)); process.exit(1); }
  console.log(`tiles: ${measured} tiles at ${SIZES.join('/')}px — one size, one mark, no overlap, spill or orphan`);
})();
