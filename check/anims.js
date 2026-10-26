#!/usr/bin/env node
/* @family. — check/anims.js EVERY TEXTBOOK ANIMATION, IN ITS CHAPTER, IN A REAL BROWSER — AND STILL WHEN STILLNESS IS ASKED FOR. § */
'use strict';
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { readAnimRows } = require('../js/check-anims.js');

const ROOT = path.join(__dirname, '..');
/* ITS OWN PORT, OR ONE THE SYSTEM PICKS: the suite runs browsers side by side. */
const PORT_WANTED = Number(process.env.ANIMS_PORT || 0);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const SIZES = [[320, 568], [390, 844]];
const MOMENTS = [0, 900, 1800, 2700, 3600, 4500];

const rows = readAnimRows().filter(r => /^(true|yes|1|y|on|)$/i.test(String(r.active == null ? '' : r.active).trim()));
const asked = process.argv.slice(2).filter(a => /^[a-z0-9]+$/.test(a));
const SHOTS = process.argv.includes('--shots');
const want = asked.length ? rows.filter(r => asked.includes(r.anim)) : rows;
if (!want.length) { console.log('COULD NOT RUN — no animation rows in data/textbooks.json' + (asked.length ? ' named ' + asked.join(' ') : '')); process.exit(1); }

const serve = () => new Promise(ok => {
  const srv = http.createServer((q, r) => {
    const rel = decodeURIComponent(q.url.split('?')[0]);
    const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
    /* THE LIBRARY WITH ITS WORDS (397): the repository's copy is card metadata, check/lib-full.js puts them back. */
    const libBody = require('./lib-full.js').serve(p);
    if (libBody !== null) { r.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return r.end(libBody); }
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end('no'); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(p).pipe(r);
  });
  srv.listen(PORT_WANTED, () => ok(srv));
});
/* NOTHING LEAVES THE MACHINE: the backend answers with the fixture, or never; everything else that is
   not this server is refused. */
const route = (page, backend) => page.route('**/*', r => {
  const u = r.request().url();
  if (/^http:\/\/localhost:/.test(u)) return r.continue();
  if (/script\.google\.com/.test(u)) return backend ? r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }) : undefined;
  return r.abort();
});
/* THE CARD AN ANIMATION IS UNDER, BY KEY: § */
const cardOf = r => 'ct:' + r.book_id + '-' + r.chapter;
async function boot(ctx) {
  const page = await ctx.newPage();
  await route(page, true);
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA && (DATA.textbooks || []).length > 0
    && document.documentElement.classList.contains('is-loaded'), null, { timeout: 90000 });
  await page.waitForTimeout(600);
  return page;
}
/* TO THE ANIMATION'S PAGE, THE WAY A READER GETS THERE: § */
async function turnTo(page, r) {
  const part = 'an' + r.chapter + '-' + r.anim;
  return page.evaluate(async ([key, part]) => {
    if (AT !== 'res') go('res');
    const x = stuffItemsAll_().find(it => it.kind === 'content' && it.key === key);
    if (!x) return 'no content card ' + key;
    const miss = inFinder_(finderOf_('res'), () => {
      STUFF.q = '';
      STUFF.filters = [{ field: 'kindLabel', value: 'Content' }, { field: 'subject', value: x.subject }];
      paintStuff();
      const at = stuffPages_().findIndex(pg => pg.part === part);
      if (at < 0) return 'no ' + part + ' page';
      goPage('res', stuffFirstResult_() + at, true);
      return '';
    });
    if (miss) return miss;
    for (let i = 0; i < 60; i++) {
      await new Promise(d => setTimeout(d, 100));
      const st = document.querySelector('#s-res .card.is-' + part + ' .tb-an-stage');
      if (st && st.classList.contains('is-on')) {
        /* AND THE BUILDER DONE (`aheadBusy_`, docs/history/341), as press.js and ui.js wait for it. § */
        for (let k = 0; k < 300 && typeof aheadBusy_ === 'function' && aheadBusy_(); k++) await new Promise(d => setTimeout(d, 100));
        await new Promise(d => requestAnimationFrame(() => requestAnimationFrame(d)));
        return '';
      }
    }
    return 'the stage never came on';
  }, [cardOf(r), part]);
}

let PORT = 0;
(async () => {
  const srv = await serve();
  PORT = srv.address().port;
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const bad = [];
  let looked = 0;

  /* ---------- 1. IN ITS CHAPTER, AT 320 AND 390: THERE, AND INSIDE THE CARD AT EVERY MOMENT ---------- */
  for (const [W, H] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const page = await boot(ctx);
    for (const r of want) {
      const why = await turnTo(page, r);
      if (why) { bad.push(r.anim + ' at ' + W + ': ' + why); continue; }
      const got = await page.evaluate(async ([part, id, moments]) => {
        const card = document.querySelector('#s-res .card.is-' + part);
        const root = card && card.querySelector('.tb-an-stage > .an-' + id);
        if (!root) return { missing: true };
        /* WHERE THE SLIDE STOPS. The columns slide sideways into place, so a card measured while
           its column is still travelling is a card in the wrong place; this waits for it to be on the
           glass and holding still. */
        for (let k = 0, last = null; k < 40; k++) {
          await new Promise(d => setTimeout(d, 50));
          const r0 = card.getBoundingClientRect();
          if (last !== null && r0.left === last && r0.left >= 0 && r0.right <= innerWidth + 1) break;
          last = r0.left;
        }
        const box = root.getBoundingClientRect();
        if (box.width < 4 || box.height < 4) return { tiny: [box.width, box.height] };
        const c = card.getBoundingClientRect();
        const out = [];
        /* WHAT IS PAINTED, NOT WHAT IS LAID OUT. § */
        const counted = el => {
          let s = el.ownerSVGElement;
          if (!s) return true;
          while (s.ownerSVGElement) s = s.ownerSVGElement;
          if (getComputedStyle(s).overflow !== 'visible') return false;
          return !el.closest('defs, clipPath, mask, [mask], [clip-path]');
        };
        const anims = document.getAnimations().filter(a => a.effect && a.effect.target && root.contains(a.effect.target));
        for (const t of moments) {
          anims.forEach(a => { a.pause(); a.currentTime = t; });
          await new Promise(d => requestAnimationFrame(() => requestAnimationFrame(d)));
          let L = Infinity, R = -Infinity;
          [root, ...root.querySelectorAll('*')].filter(counted).forEach(el => {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
            const b = el.getBoundingClientRect();
            if (!b.width && !b.height) return;
            L = Math.min(L, b.left); R = Math.max(R, b.right);
          });
          if (L < c.left - 1 || R > c.right + 1) out.push({ t, by: Math.round(Math.max(c.left - L, R - c.right)) });
        }
        anims.forEach(a => a.play());
        /* AND THE PANE ITSELF: a sideways scroll on the glass the card stands on. */
        const pane = card.closest('.pane');
        const side = pane && !/(auto|scroll)/.test(getComputedStyle(pane).overflowX) ? pane.scrollWidth - pane.clientWidth : 0;
        return { w: Math.round(box.width), h: Math.round(box.height), card: Math.round(c.width), out, side };
      }, ['an' + r.chapter + '-' + r.anim, r.anim, MOMENTS]);
      looked++;
      if (got.missing) { bad.push(r.anim + ' at ' + W + ': the stage holds no .an-' + r.anim); continue; }
      if (got.tiny) { bad.push(r.anim + ' at ' + W + ': the drawing is ' + got.tiny.join('x') + ' — not there'); continue; }
      got.out.forEach(o => bad.push(r.anim + ' at ' + W + ': at ' + o.t + 'ms part of it is ' + o.by + 'px past the card\'s edge (' + got.card + 'px wide)'));
      if (got.side > 1) bad.push(r.anim + ' at ' + W + ': the pane scrolls sideways by ' + got.side + 'px');
      console.log('  ' + String(W).padEnd(4) + r.anim.padEnd(7) + String(got.w).padStart(4) + ' x ' + String(got.h).padEnd(4) + ' in a ' + got.card + 'px card'
        + (got.out.length ? '   OUT at ' + got.out.map(o => o.t).join(',') : ''));
    }
    await ctx.close();
  }

  /* ---------- 2. LESS MOVEMENT: STILL, IN THE CHAPTER (the splash it was also drawn on went in 466) */
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await boot(ctx);
    const still = async (pg, sel) => {
      let prev = null, moved = 0;
      for (let i = 0; i < 8; i++) {
        const el = await pg.$(sel);
        if (!el) return -1;
        const buf = await el.screenshot();
        if (prev && Buffer.compare(prev, buf)) moved++;
        prev = buf;
        await pg.waitForTimeout(250);
      }
      return moved;
    };
    /* WHAT IS STILL RUNNING INSIDE THE DRAWING after the frames above (two seconds): § */
    const running = (pg, sel) => pg.evaluate(sel => {
      const root = document.querySelector(sel);
      if (!root) return null;
      return [...new Set(document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target && root.contains(a.effect.target))
        .map(a => { const t = a.effect.target, c = t.getAttribute('class'); return (c ? '.' + c.split(' ')[0] : '<' + t.localName + '>') + ' (' + (a.animationName || '?') + ')'; }))];
    }, sel);
    const looping = (r, where, list) => {
      if (list && list.length) bad.push(r.anim + ' with less movement, ' + where + ': ' + list.length + ' animation(s) of it still looping under the global `.01ms` rule — '
        + list.slice(0, 3).join(', ') + ' — so it stops on whatever frame that loop is on, not on the still its own block meant');
    };
    if (SHOTS) fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
    for (const r of want) {
      const why = await turnTo(page, r);
      if (why) { bad.push(r.anim + ' with less movement: ' + why); continue; }
      const card = '#s-res .card.is-an' + r.chapter + '-' + r.anim;
      const n = await still(page, card + ' .tb-an-stage');
      if (n) bad.push(r.anim + ' with less movement, in its chapter: ' + (n < 0 ? 'no stage' : n + ' of 7 frames changed'));
      looping(r, 'in its chapter', await running(page, card + ' .tb-an-stage > .an-' + r.anim));
      if (SHOTS) await (await page.$(card)).screenshot({ path: path.join(__dirname, 'shots', 'anim-still-' + r.anim + '.png') });
    }
    await page.close();
    await ctx.close();
  }

  /* ---------- 3. A FIRST VISIT: THE FIRST SCREEN AT ONCE, NOTHING OVER IT, NOTHING MOVING IN FRONT (466) ---------- */
  let firsts = 0;
  for (const [W, H] of SIZES) for (const reduced of [false, true]) {
    const where = 'a first visit at ' + W + (reduced ? ', less movement' : '');
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block',
      reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    await route(pg, false);
    await pg.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    const up = await pg.waitForFunction(() => typeof go === 'function' && typeof AT !== 'undefined', null, { timeout: 60000 }).then(() => true, () => false);
    if (!up) { bad.push(where + ': the app never loaded, so the first screen could NOT be looked at'); await ctx.close(); continue; }
    await pg.waitForTimeout(300);
    const got = await pg.evaluate(() => {
      const host = document.getElementById('s-' + AT), r = host && host.getBoundingClientRect();
      const hit = r ? document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + Math.min(r.height, innerHeight) / 3)) : null;
      return { at: AT, splash: !!document.getElementById('splash'), text: host ? host.textContent.trim().length : 0,
        over: hit && host && !host.contains(hit) ? (hit.id || hit.className || hit.tagName) : '' };
    });
    if (got.splash) bad.push(where + ': there is a #splash again — the app opens straight onto ' + got.at);
    if (!got.text) bad.push(where + ': ' + got.at + ' is empty before the payload — the first screen must draw from the markup and the device\'s copy');
    if (got.over) bad.push(where + ': something (' + String(got.over).slice(0, 60) + ') sits over ' + got.at + ' before the payload');
    if (SHOTS && !reduced) { fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true }); await pg.screenshot({ path: path.join(__dirname, 'shots', 'first-' + W + '.png') }); }
    firsts++;
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log('\n' + want.length + ' animations, ' + looked + ' chapter pages measured at ' + SIZES.map(s => s[0]).join(' and ')
    + ', six moments each; and with less movement, each in its chapter, with nothing left looping.'
    + '\nA first visit, ' + firsts + ' of ' + (SIZES.length * 2) + ' ways (' + SIZES.map(s => s[0]).join(' and ') + ', with motion and without): the first screen drawn at once, with nothing over it.'
    + (SHOTS ? '\nThe reduced-motion stills are in check/shots/anim-still-<id>.png — look at them: still is not the same as showing the lesson.' : ''));
  if (bad.length) {
    console.log('\nBROKEN  (' + bad.length + ')');
    bad.forEach(b => console.log('  ' + b));
    console.log('\nFAILED — a content card\'s animation that is not whole, inside its card, and still when asked.');
    process.exit(1);
  }
  console.log('OK — every animation is drawn in its chapter, stays inside its card, and holds still when asked.');
})().catch(e => { console.log('COULD NOT RUN — ' + (e && e.stack || e)); process.exit(1); });
