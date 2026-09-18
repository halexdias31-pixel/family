#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/splash.js

   IS THE LOADING SCREEN STILL MOVING?

   ASKED FOR AS "make animations more stable for loading", and the first thing to find out is what
   was actually wrong — because there were two candidate answers and the measurement says one of
   them is not true.

   ---------------------------------------------------------------------------------------------
   THE ONE THAT IS NOT TRUE: IT DOES NOT STUTTER.

   `index.html`'s case for the splash is that *"the animation is CSS, so it runs even while the main
   thread is busy parsing eighteen files"*. That is true of `transform` and `opacity`, which the
   compositor runs on its own thread, and false of a `background`, a `box-shadow`, a colour or a
   `width`, which the MAIN thread recomputes and repaints — the same thread parsing 566KB of
   JavaScript and decoding a 3.4MB library at exactly that moment.

   ASKED OF THE BROWSER, 23 of the 39 splashes animate at least one property the compositor cannot
   run, and the worst of them runs 47 `background`-and-`box-shadow` animations at once. That reads
   like a diagnosis and is not one. Measured at the moment of boot with the CPU throttled 6x and
   then 20x, with the payload never answering so the splash stays up: **every splash moved in every
   frame**, the 47-animation one exactly as much as the pure-`transform` one. There is no stutter to
   fix, and writing the fix without taking the measurement would have been the `.mat-out` mistake —
   two rules changed on a reading nobody had checked.

   ---------------------------------------------------------------------------------------------
   THE ONE THAT IS: SOME OF THEM STOP.

   Measured at full speed, where nothing is competing for anything, four splashes are IDENTICAL from
   one frame to the next for more than a third of their frames, and hold a single still picture for
   up to a second at a time. `index.html` has already deleted a splash for exactly this, and its own
   sentence is the standard: *"it read as a tartan square holding still, which is a picture rather
   than an animation, and a loading screen that looks frozen reads as an app that has."*

   A HOLD IS NOT AUTOMATICALLY A FAULT. Several of these teach something — standard form, the angle
   at the centre — and a beat to read the result on is the point. That is why this PRINTS and does
   not fail: which of them is a rhythm and which is a freeze is a judgement about the animation, and
   the pool is the sheet's (`splashOff`, read by the picker in index.html). A number is something
   somebody can act on; a silence is how a frozen loading screen stays in the pool.

   AND IT IS NOT IN `npm run check`, for `check/load.js`'s reason: it drives a real browser and its
   answer moves with what else the machine is doing, and a check whose result depends on that is a
   check people learn to ignore.

   RUN IT:  npm run splash          every splash, 8 seconds each — about six minutes
            npm run splash -- is-sf is-tri      just these
================================================================================================== */
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
function kinds() {
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const a = src.indexOf("var kinds = ['is-tag'");
  if (a < 0) return null;
  const b = src.indexOf('];', a);
  const out = [...src.slice(a, b).matchAll(/'(is-[a-z0-9]+)'/g)].map(m => m[1]);
  return out.length ? out : null;
}

function serve() {
  const srv = http.createServer((q, r) => {
    const rel = decodeURIComponent(q.url.split('?')[0]);
    const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
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
    console.log('COULD NOT RUN — the splash list was not found in index.html');
    process.exitCode = 1; return;
  }
  const asked = process.argv.slice(2).filter(x => /^is-/.test(x));
  const want = asked.length ? asked : ALL;

  const srv = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});

  const frames = Math.round(SECONDS * 1000 / EVERY);
  console.log(`\n${want.length} splash${want.length === 1 ? '' : 'es'}, ${SECONDS}s each, a frame `
            + `every ${EVERY}ms, nothing throttled.\n`);
  console.log('splash        moved   longest still');

  const rows = [];
  for (const kind of want) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                           deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    /* THE PAYLOAD NEVER ANSWERS, so the splash stays up for the whole run — which is the state this
       is about: somebody on a bad signal looking at the loading screen. */
    await page.route('**://script.google.com/**', () => {});
    /* PICKED THE APP'S OWN WAY. `splashOff` is the switch the sheet already has and the picker in
       index.html reads it BEFORE it picks — so seeding it with everything-but-one is the app
       choosing rather than a hand on the element afterwards. Setting the class from a
       DOMContentLoaded handler instead put this measurement wrong once: it runs after index.html's
       own replay loop, which had already captured the animations of whatever the coin chose. */
    await page.addInitScript(off => {
      try { localStorage.setItem('splashOff', JSON.stringify(off)); } catch (e) {}
    }, ALL.filter(k => k !== kind));

    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    const drew = await page.evaluate(() => {
      const el = document.getElementById('splash');
      return el ? el.className : '';
    });
    if (drew.indexOf(kind) === -1) {
      console.log(`  ! asked for ${kind} and the page drew "${drew}" — not measured.`);
      await ctx.close(); process.exitCode = 1; continue;
    }

    const box = await page.$('#splash');
    let prev = null, moved = 0, n = 0, run = 0, worst = 0;
    for (let i = 0; i < frames; i++) {
      let buf;
      try { buf = await box.screenshot(); } catch (e) { break; }
      if (prev) {
        n++;
        /* IDENTICAL BYTES IS THE WHOLE TEST. A PNG of the same pixels is the same PNG, and it is the
           only question that can tell a compositor animation from a main-thread one: a page can be
           busy and still be moving, and a page can be idle and be a photograph. */
        if (Buffer.compare(prev, buf) === 0) { run++; worst = Math.max(worst, run); }
        else { moved++; run = 0; }
      }
      prev = buf;
      await page.waitForTimeout(EVERY);
    }
    rows.push({ kind, moved, n, worst });
    console.log(kind.padEnd(13) + String(moved).padStart(4) + '/' + String(n).padEnd(6)
              + String(worst * EVERY).padStart(8) + 'ms');
    await ctx.close();
  }

  /* ---------- WHAT IS WORTH LOOKING AT, AND IT IS A JUDGEMENT RATHER THAN A THRESHOLD ------------
     A THIRD OF THE FRAMES IS THE LINE THIS PRINTS AT, and it is a place to start reading rather
     than a rule: a splash that teaches something has earned a beat to read the answer on, and one
     that is calm has earned a slow cycle. What it is not allowed to be is a picture. */
  const dull = rows.filter(r => r.n && (r.n - r.moved) / r.n > 1 / 3)
                   .sort((a, b) => (b.n - b.moved) / b.n - (a.n - a.moved) / a.n);
  console.log(`\nSTILL FOR MORE THAN A THIRD OF THE TIME  (${dull.length})`);
  if (!dull.length) console.log('  none');
  dull.forEach(r => console.log('  ' + r.kind.padEnd(13)
    + Math.round((r.n - r.moved) / r.n * 100) + '% of frames identical to the one before, '
    + 'longest hold ' + (r.worst * EVERY) + 'ms'));

  console.log('\nPRINTED, NOT FAILED. Which of these is a rhythm and which is a freeze is a');
  console.log('judgement about the animation, and the pool is the sheet\'s — `splashOff`.');

  await browser.close();
  srv.close();
})();
