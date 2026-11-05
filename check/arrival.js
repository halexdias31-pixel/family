#!/usr/bin/env node
/* @family. — check/arrival.js THE FIRST ELEVEN SECONDS ON A PHONE (630). Port ARRIVAL_PORT; SHOTS=<dir> writes the filmstrip, PREFIX names it; -v a line a frame. */
/* 390x844, and 1440x900 and 1920x1080 as an admin (700); CPU 4x, slow 4G, cold then warm, payload 5 s late: no shift past 0.1, nothing empty in view once in, no column late without a reserved box. */
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
const SIZES = [{ name: 'phone', w: 390, h: 844 }, { name: 'desk1440', w: 1440, h: 900, admin: true }, { name: 'desk1920', w: 1920, h: 1080, admin: true }];
const COLD = [0.5, 1, 2, 3, 5, 8, 11], WARM = [0.5, 1, 2, 5];
const CLS_MAX = 0.1;
/* 700: how late a column may come in after the first without a reserved box; Find's two wait for the library by promise (546), and say so with one loader. */
const POP_LATE = 1.5, LIB_COLS = ['s-stuff', 's-res'];
/* 670: the cold first paint, and how far ahead of the library the feed must be. */
const PAINT_MAX = Number(process.env.ARRIVAL_PAINT_MAX || 5), FEED_LEAD = 1;
/* THE FEED IS OFF (owner, 4 Nov: everything off but Find, columns.json active FALSE): its two checks wait until it is back on. */
const FEED_ON = (() => { try { return String((require('../data/settings/columns.json').find(c => c.screen === 'feed') || {}).active).toUpperCase() !== 'FALSE'; } catch (e) { return true; } })();
const lib = require('./lib-full.js');
const GZ = new Map();
/* WHAT EACH VISIT COST OVER THE WIRE (750), counted where it leaves the server: bytes, and the code files asked for at all. */
const SENT = { bytes: 0, code: [], by: {} };
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
      if (/^\/(js\/|style\.css)/.test(url)) SENT.code.push(url);
      const type = TYPES[path.extname(f)] || 'text/plain', head = { 'content-type': type, 'cache-control': 'max-age=600' };
      if (/gzip/.test(rq.headers['accept-encoding'] || '') && /json|text|javascript/.test(type)) {
        if (!GZ.has(f)) GZ.set(f, zlib.gzipSync(body(), { level: 1 }));
        rs.writeHead(200, Object.assign(head, { 'content-encoding': 'gzip' }));
        SENT.bytes += GZ.get(f).length; SENT.by[url] = (SENT.by[url] || 0) + GZ.get(f).length;
        return rs.end(GZ.get(f));
      }
      rs.writeHead(200, head);
      const b = body();
      SENT.bytes += b.length; SENT.by[url] = (SENT.by[url] || 0) + b.length;
      rs.end(b);
    }).listen(PORT, () => done(srv));
  });
}

/* EVERY SHIFT NOBODY CAUSED. */
function WATCH() {
  window.__cls = []; window.__drawn = 0;
  const tick = setInterval(() => { const m = document.getElementById('screen'); if (m && m.querySelector('.screen > *')) { window.__drawn = Math.round(performance.now()); clearInterval(tick); } }, 100);
  /* THE FEED IN, AND THE LIBRARY IN (670): the feed drawn from the payload with no dots in it, and the questions merged into DATA. */
  window.__feed = 0; window.__lib = 0;
  const tick2 = setInterval(() => {
    try {
      const f = document.getElementById('s-feed');
      if (!window.__feed && typeof LOADED !== 'undefined' && LOADED && f && f.querySelector('.card, .widget') && !f.querySelector('.loading')) window.__feed = Math.round(performance.now());
      if (!window.__lib && typeof DATA !== 'undefined' && DATA && DATA.questions && DATA.questions.length && !(typeof LIBRARY_LATE !== 'undefined' && LIBRARY_LATE)) window.__lib = Math.round(performance.now());
      if (window.__feed && window.__lib) clearInterval(tick2);
    } catch (e) {}
  }, 100);
  /* EACH COLUMN IN VIEW, WHEN IT CAME IN (700): first drawn whole with no dots, and whether, waiting, it held a reserved box (`data-keep`). */
  window.__cols = {};
  const tick3 = setInterval(() => {
    try {
      const t = Math.round(performance.now()), vw = innerWidth;
      document.querySelectorAll('#screen > .screen').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!(r.right > 0 && r.left < vw && r.width > 8)) return;
        const c = window.__cols[el.id] || (window.__cols[el.id] = { in: 0, kept: false, waited: false });
        if (c.in) return;
        const waits = el.querySelectorAll(':scope > .page > .pane > .loading, :scope > .loading');
        if (waits.length) {
          c.waited = true;
          if ([].every.call(waits, w => w.parentElement.hasAttribute('data-keep'))) c.kept = true;
        } else if (el.querySelector(':scope > .page > .pane > *') && typeof LOADED !== 'undefined' && LOADED) c.in = t;
      });
    } catch (e) {}
  }, 100);
  setTimeout(() => clearInterval(tick3), 120000);
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

/* SIGNED IN AS AN ADMIN ON A DESKTOP, as the owner recorded it (700). */
const ADMIN = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
async function visit(ctx, tag, size) {
  const page = await ctx.newPage();
  if (size.admin) await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, ADMIN);
  const asked = [];
  page.on('request', q => asked.push({ t: Date.now(), u: q.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 90) }));
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
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'commit' });
  const frames = [];
  for (const s of (tag === 'cold' ? COLD : WARM)) {
    const wait = t0 + s * 1000 - Date.now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    let look = null;
    try { look = await page.evaluate(LOOK); } catch (e) {}
    if (SHOTS) { try { await page.screenshot({ path: path.join(SHOTS, `${PREFIX}-${size.name}-${tag}-${String(s).replace('.', '_')}s.png`) }); } catch (e) {} }
    frames.push({ s, look });
  }
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 120000, polling: 250 });
  const landedAt = (Date.now() - t0) / 1000;
  await page.waitForFunction(on => (!on || window.__feed) && window.__lib, FEED_ON, { timeout: 120000, polling: 250 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  if (SHOTS) { try { await page.screenshot({ path: path.join(SHOTS, `${PREFIX}-${size.name}-${tag}-landed.png`) }); } catch (e) {} }
  const after = await page.evaluate(LOOK);
  const shifts = await page.evaluate(() => window.__cls), drawnAt = await page.evaluate(() => window.__drawn / 1000);
  const cols = await page.evaluate(() => window.__cols);
  const feedAt = await page.evaluate(() => window.__feed / 1000), libAt = await page.evaluate(() => window.__lib / 1000);
  if (VERBOSE) for (const a of asked) console.log(size.name, tag, 'asked', ((a.t - t0) / 1000).toFixed(1) + 's', a.u);
  await page.close();
  return { cols, frames, after, shifts, landedAt, drawnAt, feedAt, libAt, errs, cls: shifts.reduce((a, e) => a + e.v, 0) };
}

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();
  const bad = [];
  try {
    const only = process.env.ARRIVAL_SIZE || '';
    for (const size of SIZES.filter(z => !only || only.split(',').includes(z.name))) {
    const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, isMobile: !size.admin, hasTouch: !size.admin, deviceScaleFactor: 1 });
    for (const tag0 of ['cold', 'warm']) {
      SENT.bytes = 0; SENT.code = []; SENT.by = {};
      const r = await visit(ctx, tag0, size), tag = size.name + ' ' + tag0;
      if (VERBOSE) console.log(tag, 'sent', Math.round(SENT.bytes / 1024) + ' KB', SENT.code.length + ' code files', Object.entries(SENT.by).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([u, n]) => u + ' ' + Math.round(n / 1024) + 'KB').join(', '));
      /* WARM IS WARM (750): the stamp is the files' hash, so a second visit with nothing deployed between asks for no code file again. */
      if (tag0 === 'warm' && SENT.code.length) bad.push(`${tag}: downloaded ${SENT.code.length} code files again with nothing deployed (${SENT.code.slice(0, 3).join(', ')}…)`);
      if (VERBOSE) {
        for (const f of r.frames) console.log(tag, f.s + 's', JSON.stringify(f.look));
        console.log(tag, 'shifts', JSON.stringify(r.shifts), 'after', JSON.stringify(r.after), 'first drawn at', r.drawnAt + 's', 'landed at', r.landedAt + 's',
          'feed in at', r.feedAt + 's', 'library in at', r.libAt + 's');
      }
      if (r.errs.length) bad.push(`${tag}: the page threw: ${[...new Set(r.errs)].join(' | ')}`);
      if (FEED_ON && !r.feedAt) bad.push(`${tag}: the feed never drew from the payload`);
      if (!r.libAt) bad.push(`${tag}: the library never merged in`);
      /* FEED FIRST (670): cold, the library (a megabyte) lands long after the payload; a feed that waits for it is drawn with it, or after. */
      if (FEED_ON && tag0 === 'cold' && r.feedAt && r.libAt && r.feedAt >= r.libAt - FEED_LEAD) bad.push(`cold: the feed waited for the library (feed ${r.feedAt}s, library ${r.libAt}s; it must lead by ${FEED_LEAD}s)`);
      if (tag0 === 'cold' && r.drawnAt > PAINT_MAX) bad.push(`cold: first drawn at ${r.drawnAt}s, over ${PAINT_MAX}s`);
      if (r.cls > CLS_MAX) bad.push(`${tag}: layout shift ${r.cls.toFixed(3)} > ${CLS_MAX} (${r.shifts.map(e => e.t + 'ms ' + e.v.toFixed(3)).join(', ')})`);
      if (r.after.empty.length) bad.push(`${tag}: empty boxes in view after the payload: ${r.after.empty.join(' | ')}`);
      /* NO COLUMN POPS IN LATE (700): one that came in over POP_LATE after the first, from a wait with no reserved box, is the owner's empty gap. */
      const ins = Object.keys(r.cols).filter(k => r.cols[k].in && r.cols[k].waited);
      const first = Math.min(...ins.map(k => r.cols[k].in));
      if (VERBOSE) console.log(tag, 'columns in', ins.map(k => k + ' ' + (r.cols[k].in / 1000) + 's' + (r.cols[k].kept ? ' kept' : '')).join(', '));
      for (const k of ins) if (r.cols[k].in - first > POP_LATE * 1000 && !r.cols[k].kept && !LIB_COLS.includes(k))
        bad.push(`${tag}: ${k} popped in ${((r.cols[k].in - first) / 1000).toFixed(1)}s after the first column, with no reserved box`);
      if (r.after.dots) bad.push(`${tag}: ${r.after.dots} loading dots still in view after the payload`);
    }
    await ctx.close();
    }
  } catch (e) { bad.push('could not run: ' + e.message); }
  await browser.close(); srv.close();
  if (bad.length) { console.error('FAIL — arrival:\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log(`OK — arrival at 390px, 4x CPU, slow 4G, payload ${DELAY / 1000} s late: no layout shift past ${CLS_MAX}, nothing empty or waiting in view once it lands, cold and warm; the feed before the library, first paint under ${PAINT_MAX} s`);
})();
