#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/splash.js IS THE LOADING SCREEN STILL MOVING? § */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 8853);
const SECONDS = Number(process.env.SECONDS || 8);
const EVERY = 250;                                  // ms between frames

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png',
               '.ico':'image/x-icon' };

/* THE POOL, READ OFF index.html RATHER THAN LISTED HERE. A checker holding its own copy of the list
   it checks passes for ever the day somebody adds a splash — the sentence `check-spine.js` already
   carries. */
/* ---------- AND NONE OF IT IS IN index.html ANY MORE § */
function kinds() {
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return /<script id="pick-splash">/.test(src) ? [] : null;
}
function serve() {
  const srv = http.createServer((q, r) => {
    const rel = decodeURIComponent(q.url.split('?')[0]);
    const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
    /* THE LIBRARY WITH ITS WORDS (397): the repository's copy is card metadata, check/lib-full.js puts them back. */
    const libBody = require('./lib-full.js').serve(p);
    if (libBody !== null) { r.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return r.end(libBody); }
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      r.writeHead(404); return r.end('no');
    }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(r);
  });
  return new Promise(ok => srv.listen(PORT, () => ok(srv)));
}

(async () => {
  const ALL = kinds();
  if (!ALL) {
    /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST SAY SO AND EXIT NON-ZERO — "I did not check" is not
       the same answer as "I checked and it was fine". */
    console.log('COULD NOT RUN — the picker (`<script id="pick-splash">`) was not found in index.html');
    process.exitCode = 1; return;
  }
  const srv = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  /* ONE CONTEXT FOR THE WHOLE RUN, because the device's copy of the books' drawings lives in its storage. § */
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  {
    const seed = await ctx.newPage();
    const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
    await seed.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
    await seed.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await seed.waitForFunction(() => { try { return !!JSON.parse(localStorage.getItem('splashAnims') || 'null'); } catch (e) { return false; } },
      null, { timeout: 60000 }).catch(() => {});
    const kept = await seed.evaluate(() => { try { return JSON.parse(localStorage.getItem('splashAnims')).ids; } catch (e) { return null; } });
    await seed.close();
    if (!kept) {
      console.log('COULD NOT RUN — a real boot kept no copy of the textbooks\' animations, so they were NOT measured');
      process.exitCode = 1; await browser.close(); srv.close(); return;
    }
    kept.forEach(k => ALL.push('is-' + k));
  }
  const asked = process.argv.slice(2).filter(x => /^is-/.test(x));
  const want = asked.length ? asked : ALL;

  const frames = Math.round(SECONDS * 1000 / EVERY);
  console.log(`\n${want.length} splash${want.length === 1 ? '' : 'es'}, ${SECONDS}s each, a frame `
            + `every ${EVERY}ms, nothing throttled.\n`);
  console.log('splash        moved   longest still');

  const rows = [];
  for (const kind of want) {
    const page = await ctx.newPage();
    /* THE PAYLOAD NEVER ANSWERS, so the splash stays up for the whole run — which is the state this
       is about: somebody on a bad signal looking at the loading screen. */
    await page.route('**://script.google.com/**', () => {});
    /* PICKED THE APP'S OWN WAY. § */
    await page.addInitScript(off => {
      try { localStorage.setItem('splashOff', JSON.stringify(off)); } catch (e) {}
    }, ALL.filter(k => k !== kind));

    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    /* A KEPT DRAWING IS `is-an` AND ITS ROOT, an inline one is its class. */
    const drew = await page.evaluate(() => {
      const el = document.getElementById('splash');
      const root = el && el.querySelector(':scope > [class|="an"]');
      return el ? (root ? 'is-' + root.className.replace(/^an-/, '') : el.className) : '';
    });
    if (drew !== kind) {
      console.log(`  ! asked for ${kind} and the page drew "${drew}" — not measured.`);
      await page.close(); process.exitCode = 1; continue;
    }

    const box = await page.$('#splash');
    let prev = null, moved = 0, n = 0, run = 0, worst = 0;
    for (let i = 0; i < frames; i++) {
      let buf;
      try { buf = await box.screenshot(); } catch (e) { break; }
      if (prev) {
        n++;
        /* IDENTICAL BYTES IS THE WHOLE TEST. § */
        if (Buffer.compare(prev, buf) === 0) { run++; worst = Math.max(worst, run); }
        else { moved++; run = 0; }
      }
      prev = buf;
      await page.waitForTimeout(EVERY);
    }
    rows.push({ kind, moved, n, worst });
    console.log(kind.padEnd(13) + String(moved).padStart(4) + '/' + String(n).padEnd(6)
              + String(worst * EVERY).padStart(8) + 'ms');
    await page.close();
  }
  await ctx.close();

  /* ---------- WHAT IS WORTH LOOKING AT, AND IT IS A JUDGEMENT RATHER THAN A THRESHOLD § */
  const dull = rows.filter(r => r.n && (r.n - r.moved) / r.n > 1 / 3)
                   .sort((a, b) => (b.n - b.moved) / b.n - (a.n - a.moved) / a.n);
  console.log(`\nSTILL FOR MORE THAN A THIRD OF THE TIME  (${dull.length})`);
  if (!dull.length) console.log('  none');
  dull.forEach(r => console.log('  ' + r.kind.padEnd(13)
    + Math.round((r.n - r.moved) / r.n * 100) + '% of frames identical to the one before, '
    + 'longest hold ' + (r.worst * EVERY) + 'ms'));

  console.log('\nPRINTED, NOT FAILED. Which of these is a rhythm and which is a freeze is a');
  console.log('judgement about the animation, and the pool is the sheet\'s — `splashOff`.');
  if (!process.exitCode) console.log('OK — ' + rows.length + ' splash(es) measured; ' + dull.length
    + ' still for more than a third of the time (-v lists them).');

  await browser.close();
  srv.close();
})();
