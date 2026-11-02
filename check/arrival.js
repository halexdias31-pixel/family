#!/usr/bin/env node
/* @family. — check/arrival.js THE FIRST ELEVEN SECONDS ON A PHONE (630). Port ARRIVAL_PORT; SHOTS=<dir> writes the filmstrip, PREFIX names it; -v a line a frame. */
/* 390x844, CPU 4x, slow 4G, a cold cache and the payload 5 s late, then a warm second visit: no layout shift past 0.1, and no empty box or dots in view once it lands. */
'use strict';
require('./quiet');
const fs = require('fs'), path = require('path'), http = require('http'), zlib = require('zlib');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.ARRIVAL_PORT || 8173);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const SHOTS = process.env.SHOTS || '', PREFIX = process.env.PREFIX || 'shot';
const DELAY = Number(process.env.ARRIVAL_DELAY || 5000);
const VERBOSE = !!process.env.VERBOSE || process.argv.includes('-v');
const COLD = [0.5, 1, 2, 3, 5, 8, 11], WARM = [0.5, 1, 2, 5];
const CLS_MAX = 0.1;
const lib = require('./lib-full.js');
const GZ = new Map();
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

/* COMPRESSED AND CACHEABLE AS PAGES SENDS IT, so the second visit is a real warm one. */
function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const url = rq.url.split('?')[0], f = path.join(ROOT, decodeURI(url));
      let body = null;
      const full = lib.serve(f);
      if (full !== null) body = () => Buffer.from(full);
      else if (f.startsWith(ROOT) && fs.existsSync(f) && !fs.statSync(f).isDirectory()) body = () => fs.readFileSync(f);
      if (!body) { rs.writeHead(404); return rs.end(); }
      const type = TYPES[path.extname(f)] || 'text/plain', head = { 'content-type': type, 'cache-control': 'max-age=600' };
      if (/gzip/.test(rq.headers['accept-encoding'] || '') && /json|text|javascript/.test(type)) {
        if (!GZ.has(f)) GZ.set(f, zlib.gzipSync(body(), { level: 1 }));
        rs.writeHead(200, Object.assign(head, { 'content-encoding': 'gzip' }));
        return rs.end(GZ.get(f));
      }
      rs.writeHead(200, head);
      rs.end(body());
    }).listen(PORT, () => done(srv));
  });
}

/* EVERY SHIFT NOBODY CAUSED. */
function WATCH() {
  window.__cls = []; window.__drawn = 0;
  const tick = setInterval(() => { const m = document.getElementById('screen'); if (m && m.querySelector('.screen > *')) { window.__drawn = Math.round(performance.now()); clearInterval(tick); } }, 100);
  try {
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls.push({ t: Math.round(e.startTime), v: e.value }); })
      .observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
}

/* WHAT LOOKS UNFINISHED IN VIEW: dots still waiting, and a box drawn with nothing in it. */
function LOOK() {
  const vh = innerHeight, vw = innerWidth;
  /* ON TOP, not merely inside the window: the columns are stacked and slid (placeCells), so a parked one's box can sit under the shown one. */
  const seen = el => {
    const r = el.getBoundingClientRect();
    if (!(r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw)) return false;
    const x = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(x, y);
    return !!top && el.contains(top);
  };
  const dotEls = [...document.querySelectorAll('.loading')].filter(seen), dots = dotEls.length;
  const where = dotEls.map(el => { const p = el.parentElement; return p ? (p.id || String(p.className).slice(0, 30)) : ''; });
  const empty = [...document.querySelectorAll('.widget, .card, .tile-row, .tile')].filter(el => seen(el) && !el.querySelector('[aria-busy]')
    && !(el.textContent || '').trim() && !el.querySelector('img,svg,canvas,video,input,button,iframe')).map(el => String(el.className).slice(0, 40));
  return { dots, where, empty, loaded: typeof LOADED !== 'undefined' && !!LOADED };
}

async function visit(ctx, tag) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  /* SLOW 4G, as DevTools' preset has it. */
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(WATCH);
  /* THE PAYLOAD LATE, as a cold Apps Script answers. */
  await page.addInitScript(([payload, ms]) => {
    const real = window.fetch;
    window.fetch = function (u) {
      if (String((u && u.url) || u).indexOf('script.google.com') !== -1)
        return new Promise(d => setTimeout(() => d(new Response(payload, { status: 200, headers: { 'content-type': 'application/json' } })), ms));
      return real.apply(this, arguments);
    };
  }, [FIXTURE, DELAY]);
  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'commit' });
  const frames = [];
  for (const s of (tag === 'cold' ? COLD : WARM)) {
    const wait = t0 + s * 1000 - Date.now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    let look = null;
    try { look = await page.evaluate(LOOK); } catch (e) {}
    if (SHOTS) { try { await page.screenshot({ path: path.join(SHOTS, `${PREFIX}-${tag}-${String(s).replace('.', '_')}s.png`) }); } catch (e) {} }
    frames.push({ s, look });
  }
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 120000, polling: 250 });
  const landedAt = (Date.now() - t0) / 1000;
  await new Promise(r => setTimeout(r, 1500));
  if (SHOTS) { try { await page.screenshot({ path: path.join(SHOTS, `${PREFIX}-${tag}-landed.png`) }); } catch (e) {} }
  const after = await page.evaluate(LOOK);
  const shifts = await page.evaluate(() => window.__cls), drawnAt = await page.evaluate(() => window.__drawn / 1000);
  await page.close();
  return { frames, after, shifts, landedAt, drawnAt, cls: shifts.reduce((a, e) => a + e.v, 0) };
}

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();
  const bad = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    for (const tag of ['cold', 'warm']) {
      const r = await visit(ctx, tag);
      if (VERBOSE) {
        for (const f of r.frames) console.log(tag, f.s + 's', JSON.stringify(f.look));
        console.log(tag, 'shifts', JSON.stringify(r.shifts), 'after', JSON.stringify(r.after), 'first drawn at', r.drawnAt + 's', 'landed at', r.landedAt + 's');
      }
      if (r.cls > CLS_MAX) bad.push(`${tag}: layout shift ${r.cls.toFixed(3)} > ${CLS_MAX} (${r.shifts.map(e => e.t + 'ms ' + e.v.toFixed(3)).join(', ')})`);
      if (r.after.empty.length) bad.push(`${tag}: empty boxes in view after the payload: ${r.after.empty.join(' | ')}`);
      if (r.after.dots) bad.push(`${tag}: ${r.after.dots} loading dots still in view after the payload`);
    }
  } catch (e) { bad.push('could not run: ' + e.message); }
  await browser.close(); srv.close();
  if (bad.length) { console.error('FAIL — arrival:\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log(`OK — arrival at 390px, 4x CPU, slow 4G, payload ${DELAY / 1000} s late: no layout shift past ${CLS_MAX}, nothing empty or waiting in view once it lands, cold and warm`);
})();
