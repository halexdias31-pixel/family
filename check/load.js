#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/load.js

   HOW LONG THE APP TAKES TO OPEN ON A PHONE, MEASURED RATHER THAN GUESSED.

   REPORTED AS "the website is kinda slow when loading it up on mobile. not sure why. not sure if
   its just a mobile thing but i think it is." The right first move is not to optimise anything: it
   is to find out which of the several things happening at once is the slow one. CLAUDE.md already
   records one round of this, and the number it quotes as the cost of never caching — "about 230KB"
   — was measured before the library moved into the repository. It is over a megabyte now. A number
   in a sentence nobody re-reads is this project's most reliable source of wrong beliefs, so this
   file takes the measurement instead of holding the answer.

   THE CONDITIONS ARE A PHONE AT A CLIENT'S HOUSE, not a laptop on the office wifi:

     - 1.6 Mbps down, 750 Kbps up, 80 ms of latency. Slow 4G, which is what a back bedroom in
       Merton actually gives you.
     - 4x CPU throttling. A three-year-old Android parses JavaScript about that much slower than
       this container does, and parsing is most of what a cold start here IS.
     - GitHub Pages' own response headers, because caching is the entire question and a server
       that answers differently measures a different app. Pages sends `max-age=600` and an ETag,
       and `Last-Modified` is what `LOAD` in index.html is built from.

   THREE VISITS, BECAUSE THEY ARE THREE DIFFERENT QUESTIONS:

     - COLD — nothing in the cache. A parent opening the link for the first time.
     - WARM — everything in the cache, no deploy since. The common case by far, and the one the
       versioned-URL scheme in index.html exists to make fast.
     - AFTER A DEPLOY — the cache is full and every URL has changed, because `LOAD` moved. This is
       the case nobody measures and it is exactly the state you are in at a client's house on the
       afternoon you pushed something.

   IT DOES NOT FAIL A BUILD AND IT IS NOT IN `npm run check`. Timings move with the machine, and a
   check whose answer depends on what else the container is doing is a check people learn to
   ignore — the same argument as the nine red clasp runs. It prints, and a person reads it.

     node check/load.js               the three visits
     node check/load.js --detail      and every request, biggest first
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = 8153;
const DETAIL = process.argv.includes('--detail');

/* ---------- THE NETWORK, AS A PHONE HAS IT -------------------------------------------------------
   THROUGH CDP RATHER THAN PLAYWRIGHT'S OWN ROUTING, because `Network.emulateNetworkConditions` is
   the browser's real shaper — it delays and rate-limits the actual transfers, where a route handler
   that sleeps before fulfilling only delays the FIRST byte and lets a megabyte arrive instantly
   after it. The difference is the whole measurement on a file this size. */
const PHONE = { offline: false, latency: 80, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 };
const CPU = 4;

/* ---------- THE SERVER, ANSWERING THE WAY GITHUB PAGES DOES ---------------------------------------
   `max-age=600` AND AN ETAG is what Pages sends for every static file, and it is what makes the
   versioned URLs in index.html worth having: within ten minutes the browser does not even ask, and
   after ten minutes it asks conditionally and gets a 304 of no bytes. Answering `no-cache` here
   would measure an app nobody runs.

   `index.html` ITSELF IS `no-cache`, deliberately and to match: it has no URL of its own to put a
   version on, so it is the one file that must be re-checked every time. */
/* ---------- AND THE SERVER COUNTS, BECAUSE THE PAGE CANNOT SEE ITS OWN WORKER --------------------
   A SERVICE WORKER'S `fetch` HAPPENS IN THE WORKER, WHICH IS A DIFFERENT CDP TARGET. So the page's
   `Network` events do not carry it, and the post-deploy row came back "0 requests, 0 bytes" — which
   is the answer this exercise was hoping for, about thirty conditional requests the instrument
   could not see. Third time in this one file that a measurement has been confidently wrong in the
   flattering direction, which is why the count now comes from the only place that cannot miss one:
   the socket. */
const WIRE = { hits: [] };
function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const url = rq.url.split('?')[0];
      const f = path.join(ROOT, decodeURI(url));
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

/* WHAT "OPEN" MEANS, AND IT IS NOT `load`. The browser's `load` event fires when the last
   subresource has finished, which on this site includes a 369 KB library file the first screen does
   not need. What somebody at a client's house is waiting for is the moment the app is ON — the
   funnel drawn, a question in front of them — so that is what is timed, alongside the two browser
   marks for context. */
async function visit(page, cdp, label, note) {
  /* ---------- COUNTED THROUGH CDP, AND IT TAKES THREE EVENTS, NOT ONE -----------------------------
     `page.on('response')` FIRES FOR A CACHE HIT TOO, with a 200 and the body's own length, so
     counting those events said the warm visit fetched all thirty-three files over the network —
     the exact claim this check exists to test, answered wrongly, in the direction that makes
     caching look broken. That version would have had me "fix" a cache that was working.

     AND `encodedDataLength` ON `responseReceived` IS THE HEADERS ONLY. The second version counted
     it and reported 0.3 KB per file and 9 KB for the whole app, which is a claim about a page that
     does not exist — three hundred bytes for `find.js`. The body's size arrives later, on
     `loadingFinished`, and that is the number a phone's data allowance sees.

     SO: `responseReceived` says what a URL is, `requestServedFromCache` says it cost nothing, and
     `loadingFinished` says what it cost. Two wrong readings in a row on the same question is why
     this is written down rather than left as three event names. */
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
  cdp.off('Network.responseReceived', onResp);
  cdp.off('Network.requestServedFromCache', onCached);
  cdp.off('Network.loadingFinished', onFinish);
  const reqs = [...seen.values()];
  /* A CONDITIONAL REQUEST THAT COMES BACK 304 STILL COSTS A ROUND TRIP AND SOME HEADERS, and that
     is the price this worker trades a megabyte for — so it is counted and shown separately rather
     than folded into either "free" or "downloaded". Calling it free would be the same overclaim
     the credit line under a redrawn diagram made. */
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

(async () => {
  const srv = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
  /* THE BACKEND, STOOD IN FOR, AND DELAYED. Apps Script answers a cold `doGet` in about a second
     and a warm one in a few hundred milliseconds; answering instantly would hide every place the
     app waits on it. The number is a stand-in and the log says so. */


  /* ---------- THE BACKEND, STOOD IN FOR INSIDE THE PAGE AND NOT THROUGH `page.route` -------------
     `page.route` TURNS THE BROWSER'S HTTP CACHE OFF — for every request, not just the routed one.
     Proved rather than assumed: with one route registered the server sees all 32 requests on the
     second visit and on the third; with none it sees 1. So the first honest run of this file
     reported the warm visit re-downloading 1,176 KB and all three rows identical, which reads as
     "the versioned URLs in index.html do not cache" and is instead the instrument switching off
     the thing it came to measure. `Network.setCacheDisabled: false` does not undo it either — the
     route re-applies on every navigation.

     `addInitScript` RUNS BEFORE ANY OF THE PAGE'S OWN SCRIPTS, so the boot fetch in the head of
     index.html already sees the patched `fetch`. Nothing is intercepted at the network layer, and
     the cache behaves as a phone's does.

     THE 700 ms IS A STAND-IN for Apps Script, which answers a cold `doGet` in about a second and a
     warm one in a few hundred milliseconds. Answering instantly would hide every place the app
     waits on it. */
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
  /* ---------- AND THE CACHE BACK ON, WHICH IS THE WHOLE SUBJECT ----------------------------------
     PLAYWRIGHT TURNS THE BROWSER'S HTTP CACHE OFF THE MOMENT ANY ROUTE IS REGISTERED, and this file
     registers one to stand in for the backend. So the first honest run of it reported the warm
     visit downloading all 1,176 KB a second time — see the note on the backend stub below.

     KEPT AS A BELT-AND-BRACES LINE even though nothing turns it off any more: a future edit that
     adds a route would otherwise put the file silently back into the state above. */
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });

  console.log(`a phone: 1.6 Mbps down, 80 ms latency, CPU throttled ${CPU}x, `
            + `GitHub Pages' own cache headers,\n`
            + `and the backend stood in for with a 700 ms answer.`);

  const out = [];
  out.push(await visit(page, cdp, 'COLD           ', 'nothing cached anywhere — the first time anybody opens the link'));
  out.push(await visit(page, cdp, 'WARM           ', "everything in the browser's own cache, no deploy since"));

  /* THE WORKER IS REGISTERED AFTER `load` AND DOES NOT CONTROL THE PAGE THAT REGISTERED IT, so it
     is in charge from the next visit on. Waited for rather than assumed: a run that measured an
     uncontrolled page and labelled it "with the worker" would be this repository's oldest fault
     wearing a new hat. */
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

  /* ---------- A DEPLOY, SIMULATED IN THE ONLY WAY THAT ACTUALLY SIMULATES ONE -------------------
     `LOAD` IS `Math.floor(document.lastModified / 300000)` — FIVE-MINUTE BUCKETS. Setting the
     file's date to "now" therefore changes nothing at all four times out of five, and an earlier
     version of this file duly reported the post-deploy visit at 0 KB: the number the whole exercise
     was hoping for, about a deploy that had not happened. An hour forward cannot land in the same
     bucket.

     AND IT HAS TO HAPPEN HERE, after the store is full and not before. Bumping it earlier meant the
     worker filled its store at the NEW stamp and the "after a deploy" row was an exact cache hit —
     0 KB again, for the second wrong reason in a row.

     THE STAMP IS READ BACK, because "I changed the input" and "the output changed" are different
     claims and this file has been wrong about which is which more than once. */
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

  /* ---------- NO SIGNAL, BY TAKING THE SERVER AWAY ----------------------------------------------
     NOT `Network.emulateNetworkConditions { offline: true }`, WHICH DOES NOT REACH LOOPBACK: with
     it "on", the run still fetched index.html and 36 KB crossed the wire, so the offline row was a
     row about being online. Closing the server is unambiguous — there is nothing there to answer.

     NOT THE POINT OF ANY OF THIS AND POSSIBLY THE BEST PART OF IT: a back bedroom with one bar is
     where this app is used. The payload is never cached — it is the database — so what should come
     up is the app and the library with the backend unreachable, which is a state `nothingHere` has
     drawn a reason and a `Try again` for since it was written. */
  await new Promise(d => srv.close(d));
  out.push(await visit(page, cdp, 'NO SIGNAL      ', 'the server is gone — everything from the worker'));

  console.log('\n(These are one machine on one afternoon. What is worth reading is the gap between'
            + '\n the three rows, not the absolute figures.)');
  await browser.close();
  try { srv.close(); } catch (e) {}
})();
