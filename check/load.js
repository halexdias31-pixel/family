#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/load.js HOW LONG THE APP TAKES TO OPEN ON A PHONE, MEASURED RATHER THAN GUESSED. § */
const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
/* OVERRIDABLE, like every other harness's port: parallel runs in worktrees share one machine. */
const PORT = Number(process.env.LOAD_PORT || 8153);
const DETAIL = process.argv.includes('--detail');
/* --shifts: only the shift rule below; --no-shifts: only the timings. */
const SHIFTS_ONLY = process.argv.includes('--shifts'), NO_SHIFTS = process.argv.includes('--no-shifts');

/* ---------- THE NETWORK, AS A PHONE HAS IT § */
const PHONE = { offline: false, latency: 80, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 };
const CPU = 4;

/* ---------- THE SERVER, ANSWERING THE WAY GITHUB PAGES DOES § */
/* ---------- AND THE SERVER COUNTS, BECAUSE THE PAGE CANNOT SEE ITS OWN WORKER § */
const WIRE = { hits: [] };
function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const url = rq.url.split('?')[0];
      const f = path.join(ROOT, decodeURI(url));
      /* THE LIBRARY WITH ITS WORDS (397): the repository's copy is card metadata, check/lib-full.js puts them back. */
      const libBody = require('./lib-full.js').serve(f);
      if (libBody !== null) { rs.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return rs.end(libBody); }
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        rs.writeHead(404); return rs.end();
      }
      const body = fs.readFileSync(f);
      const st = fs.statSync(f);
      const tag = '"' + st.size.toString(16) + '-' + st.mtimeMs.toString(16) + '"';
      const type = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
                     '.html': 'text/html', '.png': 'image/png' }[path.extname(f)] || 'text/plain';
      const isPage = url === '/' || url.endsWith('index.html');
      const head = {
        'content-type': type,
        'last-modified': st.mtime.toUTCString(),
        etag: tag,
        'cache-control': isPage ? 'no-cache' : 'max-age=600',
      };
      if (process.env.LOADDBG && /\.(js|css|json)$/.test(url)) {
        console.log('      [server]', url.slice(-22).padStart(22),
          'inm=' + (rq.headers['if-none-match'] ? 'yes' : 'no '),
          rq.headers['if-none-match'] === tag ? 'MATCH' : '');
      }
      if (rq.headers['if-none-match'] === tag) {
        WIRE.hits.push({ url, status: 304, bytes: 0 });
        rs.writeHead(304, head); return rs.end();
      }
      /* COMPRESSED, BECAUSE PAGES COMPRESSES. Measuring 3.9 MB of JSON over a shaped link when the
         real one sends 369 KB would put the blame on the wrong file by a factor of ten. */
      if (/\b(gzip)\b/.test(rq.headers['accept-encoding'] || '')
          && /text|json|javascript/.test(type)) {
        const gz = zlib.gzipSync(body, { level: 6 });
        WIRE.hits.push({ url, status: 200, bytes: gz.length });
        rs.writeHead(200, Object.assign(head, { 'content-encoding': 'gzip',
                                                'content-length': gz.length }));
        return rs.end(gz);
      }
      WIRE.hits.push({ url, status: 200, bytes: body.length });
      rs.writeHead(200, Object.assign(head, { 'content-length': body.length }));
      rs.end(body);
    });
    srv.listen(PORT, () => done(srv));
  });
}

/* WHAT "OPEN" MEANS, AND IT IS NOT `load`. § */
async function visit(page, cdp, label, note) {
  /* ---------- COUNTED THROUGH CDP, AND IT TAKES THREE EVENTS, NOT ONE § */
  const seen = new Map();
  const onResp = e => {
    const r = e.response || {};
    seen.set(e.requestId, {
      url: String(r.url || '').split('?')[0].replace(`http://localhost:${PORT}/`, ''),
      status: r.status,
      bytes: 0,
      cached: !!r.fromDiskCache || !!r.fromPrefetchCache || r.status === 304,
    });
  };
  const onCached = e => { const r = seen.get(e.requestId); if (r) r.cached = true; };
  const onFinish = e => {
    const r = seen.get(e.requestId);
    if (r) r.bytes = Number(e.encodedDataLength || 0);
  };
  cdp.on('Network.responseReceived', onResp);
  cdp.on('Network.requestServedFromCache', onCached);
  cdp.on('Network.loadingFinished', onFinish);
  WIRE.hits = [];
  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'commit' });

  const marks = { appUp: null, library: null };
  /* WHAT "OPEN" MEANS: `paint(id)` writes the screen into `#s-<id>`, and the root screen is
     `stuff`. A pane with something in it is the app on the screen. */
  try {
    await page.waitForFunction(
      () => { const el = document.getElementById('s-stuff');
              return el && el.textContent.trim().length > 20; }, null, { timeout: 90000 });
    marks.appUp = Date.now() - t0;
  } catch (e) { marks.appUp = -1; }
  try {
    await page.waitForFunction(
      () => typeof DATA !== 'undefined' && (DATA.questions || []).length > 100,
      null, { timeout: 90000 });
    marks.library = Date.now() - t0;
  } catch (e) { marks.library = -1; }
  await page.waitForLoadState('load').catch(() => {});
  const loaded = Date.now() - t0;
  /* ---------- AND WHETHER THE SPLASH WAS CHOSEN BEFORE ANYTHING WAS PAINTED § */
  const pickAt = await page.evaluate(() => {
    const m = performance.getEntriesByName('splash-pick')[0];
    const p = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
    return { pick: m ? m.startTime : null, paint: p ? p.startTime : null };
  }).catch(() => ({ pick: null, paint: null }));
  marks.pick = pickAt.pick; marks.paint = pickAt.paint;
  cdp.off('Network.responseReceived', onResp);
  cdp.off('Network.requestServedFromCache', onCached);
  cdp.off('Network.loadingFinished', onFinish);
  const reqs = [...seen.values()];
  /* A CONDITIONAL REQUEST THAT COMES BACK 304 STILL COSTS A ROUND TRIP AND SOME HEADERS, and that is the price this worker trades a megabyte for — so it is counted § */
  const fresh = reqs.filter(r => !r.cached && r.bytes > 0);
  const asked = reqs.filter(r => r.status === 304).length;
  const wire = WIRE.hits.slice();
  const got = wire.filter(h => h.status === 200);
  const same = wire.filter(h => h.status === 304);
  const bytes = got.reduce((n, h) => n + h.bytes, 0);
  console.log(`\n${label}   ${note}`);
  console.log(`   app on screen   ${String(marks.appUp).padStart(6)} ms`
            + `      library ready ${String(marks.library).padStart(6)} ms`
            + `      load event ${String(loaded).padStart(6)} ms`);
  console.log(`   splash picked   ${marks.pick == null ? '  none' : String(Math.round(marks.pick)).padStart(6)} ms`
            + `      first contentful paint ${marks.paint == null ? '  none' : String(Math.round(marks.paint)).padStart(6)} ms`
            + (marks.pick != null && marks.paint != null && marks.paint < marks.pick ? '      PAINTED BEFORE THE PICK' : ''));
  console.log(`   the browser asked for ${String(reqs.length).padStart(3)} file(s)`
            + `   ·  the server sent ${String(got.length).padStart(3)}`
            + `   ·  answered "unchanged" ${String(same.length).padStart(3)}`
            + `   ·  over the wire ${(bytes / 1024).toFixed(0)} KB`);
  if (DETAIL) {
    got.sort((a, b) => b.bytes - a.bytes).slice(0, 12).forEach(h =>
      console.log(`      ${String((h.bytes / 1024).toFixed(1)).padStart(8)} KB  ${h.url}`));
  }
  return { label, ...marks, loaded, reqs: reqs.length, sent: got.length, same: same.length, bytes };
}

/* ---------- NOTHING MOVES ONCE IT IS DRAWN (docs/history/382) § */
function SHIFT_READER() {
  const S = window.__shift = { moves: [], key: '', armed: false };
  const mc = new MessageChannel();
  const cards = host => [...host.querySelectorAll(':scope > .page.on, :scope > .page.on .card')].slice(0, 8);
  const vis = r => r.height > 4 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  let seen = new Map();
  mc.port1.onmessage = () => {
    try {
      if (typeof AT !== 'undefined' && typeof PAGE !== 'undefined') {
        const sp = document.getElementById('splash');
        const key = AT + ':' + (PAGE[AT] || 0);
        if (key !== S.key || (sp && !sp.classList.contains('done')) || S.arrive) { S.key = key; seen = new Map(); }
        else {
          const host = document.getElementById('s-' + AT);
          if (host && !(typeof SWIPE !== 'undefined' && SWIPE.live)) cards(host).forEach((el, i) => {
            const r = el.getBoundingClientRect();
            if (!vis(r)) return;
            const was = seen.get(el);
            if (!was) { seen.set(el, r.top); return; }
            if (Math.abs(r.top - was) > 2 && S.moves.length < 40) {
              S.moves.push(AT + ' ' + (i ? 'card ' + i : 'page') + ' ' + Math.round(was) + '→' + Math.round(r.top) + 'px at ' + Math.round(performance.now()) + 'ms');
              seen.set(el, r.top);
            }
          });
        }
        if (S.arrive) {
          const host = document.getElementById('s-' + S.arrive.col);
          const pg = host && host.querySelector(':scope > .page.on');
          const r = pg && pg.getBoundingClientRect();
          if (r && vis(r)) S.arrive.tops.push(r.top);
        }
      }
    } catch (e) { S.err = String(e && e.message); }
    requestAnimationFrame(() => mc.port2.postMessage(0));
  };
  requestAnimationFrame(() => mc.port2.postMessage(0));
  /* EACH FROM THE COLUMN OPENED ON, so no arrival is helped by the one before it drawing its neighbours. */
  S.go = async (col, home) => {
    if (AT !== home) { go(home, false, true); await new Promise(r => setTimeout(r, 700)); }
    S.arrive = { col, tops: [] };
    go(col);
    await new Promise(r => setTimeout(r, 1500));
    const t = S.arrive.tops; S.arrive = null;
    if (t.length < 3) return { col, err: t.length + ' frame(s) read' };
    const end = t[t.length - 1];
    return { col, travel: Math.round(Math.max(...t.map(y => Math.abs(y - end)))), frames: t.length };
  };
}

async function shifts(browser) {
  const found = [];
  const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
  for (const [W, H] of [[390, 844], [320, 568], [412, 915]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', PHONE);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
    /* SIGNED IN AS AN ADMIN, WHO SEES EVERY WIDGET; THE BUILDER HELD, so every arrival is one made before it got there. */
    await page.addInitScript(() => {
      try { localStorage.setItem('familyUser', JSON.stringify({ name: 'Sam Student', personId: 'P9', role: 'admin', roles: ['admin'] })); } catch (e) {}
      if (!window.__noHold) window.__aheadHold = true;
    });
    await page.addInitScript(SHIFT_READER);
    await page.addInitScript(payload => {
      const real = window.fetch;
      window.fetch = function (u, o) {
        if (String((u && u.url) || u).indexOf('script.google.com') !== -1) {
          return new Promise(done => setTimeout(() => done(new Response(payload, { status: 200, headers: { 'content-type': 'application/json' } })), 700));
        }
        return real.apply(this, arguments);
      };
    }, FIXTURE);
    for (const visit of ['cold', 'warm']) {
      const where = `${W}x${H} ${visit}`;
      try {
        if (visit === 'cold') await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'commit' });
        else await page.reload({ waitUntil: 'commit' });
        await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof FIRST_PAINT_DONE !== 'undefined' && FIRST_PAINT_DONE, null, { timeout: 120000, polling: 100 });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await new Promise(r => setTimeout(r, 2500));
        const front = await page.evaluate(() => window.__shift.moves.splice(0));
        front.forEach(m => found.push(`${where}, the column it opened on: ${m}`));
        const home = await page.evaluate(() => AT);
        const cols = await page.evaluate(() => ['shop', 'tools', 'games', 'saved'].filter(c => TABS.some(t => t.id === c)));
        if (cols.length < 4) found.push(`${where}: only ${cols.join(', ')} of shop, tools, games, saved are columns — nothing was asked of the rest`);
        for (const col of cols) {
          const a = await page.evaluate(([c, h]) => window.__shift.go(c, h), [col, home]);
          if (a.err) found.push(`${where}, arriving at ${col}: ${a.err} — nothing was measured`);
          else if (a.travel > 2) found.push(`${where}, arriving at ${col}: the card travelled ${a.travel}px up or down while the slide brought it in`);
          console.log(`   ${where.padEnd(14)} arriving at ${col.padEnd(6)} ${a.err || a.travel + 'px of vertical travel in ' + a.frames + ' frames'}`);
        }
        /* AND SAVED AFTER A STAR ON TOOLS: the star makes Saved taller while it is off the glass, and the arrival draws it. */
        const st = await page.evaluate(async h => {
          go('tools', false, true);
          await new Promise(r => setTimeout(r, 700));
          const k = (allWidgets().find(w => w.kind === 'tool' && w.pure && !isFav(WIDGET_KEY(w))) || {}).id;
          if (!k) return { err: 'no unstarred tool to star' };
          toggleFav('w:' + k, 'widget');
          markStale_(TABS.map(t => t.id).filter(id => id !== AT));
          const a = await window.__shift.go('saved', 'tools');
          toggleFav('w:' + k, 'widget');
          markStale_(TABS.map(t => t.id).filter(id => id !== AT));
          go(h, false, true);
          return a;
        }, home);
        if (st.err) found.push(`${where}, Saved after a star: ${st.err} — nothing was measured`);
        else if (st.travel > 2) found.push(`${where}, arriving at saved after a star on tools: the card travelled ${st.travel}px up or down while the slide brought it in`);
        console.log(`   ${where.padEnd(14)} saved after a star ${st.err || st.travel + 'px of vertical travel in ' + st.frames + ' frames'}`);
        const after = await page.evaluate(() => window.__shift.moves.splice(0));
        after.forEach(m => found.push(`${where}, after arriving: ${m}`));
        const err = await page.evaluate(() => window.__shift.err);
        if (err) found.push(`${where}: the reader threw — ${err}`);
      } catch (e) { found.push(`${where}: the run threw — ${String(e && e.message || e).slice(0, 160)}`); }
    }
    await ctx.close();
  }
  console.log('\nNOTHING MOVED ONCE DRAWN — the column opened on, and shop, tools, games and saved arrived at before the builder'
            + (found.length ? ' — NOT TRUE:\n' + found.map(f => '   ' + f).join('\n') : ': true at 390, 320 and 412, cold and warm'));
  if (found.length) process.exitCode = 1;
}

(async () => {
  const srv = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  if (!NO_SHIFTS) await shifts(browser);
  if (SHIFTS_ONLY) { await browser.close(); srv.close(); return; }
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
  /* THE BACKEND, STOOD IN FOR, AND DELAYED. § */


  /* ---------- THE BACKEND, STOOD IN FOR INSIDE THE PAGE AND NOT THROUGH `page.route` § */
  await page.addInitScript(payload => {
    const real = window.fetch;
    window.fetch = function (u, o) {
      if (String((u && u.url) || u).indexOf('script.google.com') !== -1) {
        return new Promise(done => setTimeout(() => done(new Response(payload, {
          status: 200, headers: { 'content-type': 'application/json' } })), 700));
      }
      return real.apply(this, arguments);
    };
  }, FIXTURE);

  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', PHONE);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  /* ---------- AND THE CACHE BACK ON, WHICH IS THE WHOLE SUBJECT § */
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });

  console.log(`a phone: 1.6 Mbps down, 80 ms latency, CPU throttled ${CPU}x, `
            + `GitHub Pages' own cache headers,\n`
            + `and the backend stood in for with a 700 ms answer.`);

  const out = [];
  out.push(await visit(page, cdp, 'COLD           ', 'nothing cached anywhere — the first time anybody opens the link'));
  out.push(await visit(page, cdp, 'WARM           ', "everything in the browser's own cache, no deploy since"));

  /* THE WORKER IS REGISTERED AFTER `load` AND DOES NOT CONTROL THE PAGE THAT REGISTERED IT, so it is in charge from the next visit on. § */
  let controlled = false;
  try {
    await page.waitForFunction(() => navigator.serviceWorker
      && navigator.serviceWorker.controller, null, { timeout: 20000 });
    controlled = true;
  } catch (e) {
    console.log('\n   ! NO SERVICE WORKER TOOK CONTROL. Every row below is without one, and none of'
              + '\n     them is evidence about it either way.');
  }
  if (controlled) {
    console.log('\n   (the worker is in control from here on. Its own store starts empty, so the'
              + '\n    next row is it filling up — that cost is paid once.)');
  }
  out.push(await visit(page, cdp, 'WORKER FILLING ', 'the worker is in charge and its store is empty'));
  out.push(await visit(page, cdp, 'WARM, WORKER   ', 'nothing changed — the common case, under the worker'));

  /* ---------- A DEPLOY, SIMULATED IN THE ONLY WAY THAT ACTUALLY SIMULATES ONE § */
  const page_ = path.join(ROOT, 'index.html');
  const was = fs.statSync(page_).mtime;
  const stampOf = () => page.evaluate(() => {
    const el = document.querySelector('script[src*="js/boot.js"]');
    return el ? el.getAttribute('src') : '';
  });
  const before = await stampOf();
  fs.utimesSync(page_, new Date(Date.now() + 3600e3), new Date(Date.now() + 3600e3));
  try {
    out.push(await visit(page, cdp, 'AFTER A DEPLOY ', 'every versioned URL just changed at once'));
    const after = await stampOf();
    if (before && after === before) {
      console.log(`   ! THE DEPLOY DID NOT TAKE — every URL is still ${after}.`
                + `\n     The row above is not about a deploy. Do not read it as if it were.`);
    }
    out.push(await visit(page, cdp, 'AND THE NEXT   ', 'the same deploy, opened a second time'));
  } finally { fs.utimesSync(page_, was, was); }

  /* ---------- NO SIGNAL, BY TAKING THE SERVER AWAY § */
  await new Promise(d => srv.close(d));
  out.push(await visit(page, cdp, 'NO SIGNAL      ', 'the server is gone — everything from the worker'));

  console.log('\n(These are one machine on one afternoon. What is worth reading is the gap between'
            + '\n the three rows, not the absolute figures.)');
  /* THE ONE LINE HERE THAT IS A RULE RATHER THAN A READING. § */
  const early = out.filter(r => r.pick == null || r.paint == null || r.paint < r.pick);
  console.log('\nTHE SPLASH CHOSEN BEFORE ANYTHING WAS PAINTED in ' + (out.length - early.length) + ' of ' + out.length + ' loads'
            + (early.length ? ' — NOT in: ' + early.map(r => r.label.trim() + ' (pick ' + r.pick + ', paint ' + r.paint + ')').join(', ') : ''));
  if (early.length) process.exitCode = 1;
  await browser.close();
  try { srv.close(); } catch (e) {}
})();
