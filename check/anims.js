#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/anims.js

   EVERY TEXTBOOK ANIMATION, IN ITS CHAPTER, IN A REAL BROWSER — AND STILL WHEN STILLNESS IS ASKED FOR.

   "Add the animations from loading to respective subject text books." — the owner, 8 Oct. Drawings
   made for one place — the middle of a black screen as wide as the phone; twenty-seven at the move,
   and the solar system since — are drawn in a second: a card, narrower than the phone by its padding,
   with words above and below.
   `check-anims.js` proves the rows are one source, kept and drawn as written; this asks what only a
   browser can answer about each one, on the page Find turns to after its chapter, at 320 and 390:

     · THE DRAWING IS THERE: the stage holds its root, with a size;
     · NOTHING OF IT LEAVES THE CARD: every part of it, sampled at six moments of its loop (a hop, a
       flip and a regrouping all travel), stays inside the card's edges — a drawing that reaches past
       one is a page that scrolls sideways or a picture cut off, and either is the fault;
     · AND WITH LESS MOVEMENT ASKED FOR, IT HOLDS STILL: eight frames a quarter-second apart are the
       same picture, in the chapter and on the splash drawn from the device's copy — the global
       `.01ms` rule turns anything left moving into a flicker, which is the one thing reduced motion
       is there to stop;
     · AND IT IS STILL BECAUSE ITS OWN BLOCK STILLED IT: no animation of the drawing is left running.
       Eight equal frames did not prove that. Multiples' `animation: none` lost to a per-cell rule that
       outranked it and the protractor's wedge had no rule at all, and both held still — on whatever
       frame the global `.01ms` loop happened to stop at, which is not the picture their blocks meant:
       no threes lit under "multiples of 3" at 390, the threes lit at 820, the 5s lit on the splash.

   AND A FIRST VISIT, WHICH HAS NOTHING KEPT: the still name and the one loader. "delete all animations
   for loading which dont come from text books or arnt educational." — the owner, 10 Oct; the splashes
   that taught nothing went (docs/history/322), and a device with no copy of the books' drawings yet is
   shown the name, not moving, and the loader every card waits with. At 320 and 390, with the backend
   never answering so the splash stays up: the splash is `is-still` with nothing drawn; NO ANIMATION
   touches the name and four frames of it a quarter-second apart are the same picture; the loader under
   it is `loading_()`'s own markup, its three dots moving — and, with less movement asked for, still;
   the name and the loader sit inside the screen, the loader centred under the name. `--shots` writes
   check/shots/splash-first-<width>.png.

   WHAT THE STILL SHOWS IS FOR A PERSON TO LOOK AT. Holding still is not showing the lesson: the
   sorting bars all came out full height (`transform: none` wiped out their `scaleY`), and ½, 0.5 and
   50% printed on top of one another as one orange glyph — both perfectly still. `--shots` writes each
   chapter card under reduced motion to check/shots/anim-still-<id>.png, the drawing with the words
   under it, the way a pupil who asked for less movement reads it.

   SLOW, and in the suite's browser pool beside `check/ui.js`.

     node check/anims.js            all of them
     node check/anims.js pyth sf    just these
     node check/anims.js --shots    and the reduced-motion stills, for a person
================================================================================================== */
'use strict';
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
/* THE BOOK'S NAME AS FIND SHOWS IT: its title page's title, read off the file. This was a map of three
   books written out, and the first drawing to land in a fourth (the solar system, in Physics) would
   have been looked for under no book at all. */
const TITLES = {};
fs.readFileSync(path.join(ROOT, 'data', 'textbooks.json'), 'utf8').split('\n').forEach(l => {
  const s = l.trim().replace(/,$/, '');
  if (!s.startsWith('{')) return;
  try { const r = JSON.parse(s); if (r.chapter === 0 && !('anim' in r)) TITLES[r.book_id] = r.title; } catch (e) {}
});
const bookOf = r => TITLES[r.book_id];

async function boot(ctx) {
  const page = await ctx.newPage();
  await route(page, true);
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA && (DATA.textbooks || []).length > 0
    && document.getElementById('splash').classList.contains('done'), null, { timeout: 90000 });
  await page.waitForTimeout(600);
  return page;
}
/* TO THE ANIMATION'S PAGE, THE WAY A READER GETS THERE: the book's chips, then its page. */
async function turnTo(page, r) {
  const part = 'an' + r.chapter + '-' + r.anim;
  return page.evaluate(async ([book, part]) => {
    if (AT !== 'stuff') go('stuff');
    const x = stuffItemsAll_().find(it => it.kind === 'textbook' && it.name === book);
    if (!x) return 'no book ' + book;
    STUFF.q = '';
    STUFF.filters = [{ field: 'kindLabel', value: kindOf_(x).label }, { field: 'shelf', value: x.shelf }, { field: 'book', value: x.name }];
    paintStuff();
    const at = stuffPages_().findIndex(pg => pg.part === part);
    if (at < 0) return 'no ' + part + ' page';
    goPage('stuff', stuffFirstResult_() + at, true);
    for (let i = 0; i < 60; i++) {
      await new Promise(d => setTimeout(d, 100));
      const st = document.querySelector('#s-stuff .card.is-' + part + ' .tb-an-stage');
      if (st && st.classList.contains('is-on')) return '';
    }
    return 'the stage never came on';
  }, [bookOf(r), part]);
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
        const card = document.querySelector('#s-stuff .card.is-' + part);
        const root = card && card.querySelector('.tb-an-stage > .an-' + id);
        if (!root) return { missing: true };
        /* WHERE THE SLIDE STOPS. Find's columns slide sideways into place, so a card measured while
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
        /* WHAT IS PAINTED, NOT WHAT IS LAID OUT. Inside an `<svg>` that clips (`overflow` not visible)
           nothing reaches past the svg's own box, which is measured itself; and a shape under a mask or
           a clip-path, or in `<defs>`, is drawn only where they let it — the sine wave runs a period
           either side of its mask, the Venn's hatching is a hundred lines clipped to one region. */
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

  /* ---------- 2. LESS MOVEMENT: STILL, IN THE CHAPTER AND ON THE SPLASH ------------------------------
     At 390, one device: a real boot fills the copy the splash draws from, the chapter is read in that
     same boot, and then each splash is drawn the app's own way — everything else retired in `splashOff`
     — with the backend never answering so it stays up. */
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
    /* WHAT IS STILL RUNNING INSIDE THE DRAWING after the frames above (two seconds): under the global
       rule an animation its block stilled is gone, one that ran once has finished, and one left
       `infinite` is looping every .01ms — still to the eye, on no frame anybody chose. */
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
      const card = '#s-stuff .card.is-an' + r.chapter + '-' + r.anim;
      const n = await still(page, card + ' .tb-an-stage');
      if (n) bad.push(r.anim + ' with less movement, in its chapter: ' + (n < 0 ? 'no stage' : n + ' of 7 frames changed'));
      looping(r, 'in its chapter', await running(page, card + ' .tb-an-stage > .an-' + r.anim));
      if (SHOTS) await (await page.$(card)).screenshot({ path: path.join(__dirname, 'shots', 'anim-still-' + r.anim + '.png') });
    }
    const ids = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('splashAnims')).ids; } catch (e) { return []; } });
    await page.close();
    for (const r of want) {
      if (ids.indexOf(r.anim) < 0) { bad.push(r.anim + ': the boot kept no copy of it, so its splash was NOT measured'); continue; }
      const pg = await ctx.newPage();
      await route(pg, false);
      /* EVERY OTHER DRAWING RETIRED: the books' copy is the whole pool, so this is the app choosing. */
      await pg.addInitScript(off => { try { localStorage.setItem('splashOff', JSON.stringify(off)); } catch (e) {} },
        ids.filter(k => k !== r.anim).map(k => 'is-' + k));
      await pg.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(500);
      const drew = await pg.evaluate(id => !!document.querySelector('#splash > .an-' + id), r.anim);
      if (!drew) { bad.push(r.anim + ': with every other splash retired, the splash did not draw it from the copy'); await pg.close(); continue; }
      const n = await still(pg, '#splash');
      if (n) bad.push(r.anim + ' with less movement, on the splash: ' + n + ' of 7 frames changed');
      looping(r, 'on the splash', await running(pg, '#splash > .an-' + r.anim));
      await pg.close();
    }
    await ctx.close();
  }

  /* ---------- 3. A FIRST VISIT: THE NAME, STILL, AND THE ONE LOADER UNDER IT ------------------------
     A fresh device — nothing in its storage — and a backend that never answers, so the splash stays up
     for as long as this looks at it. Asked at both widths, with motion and with less of it. */
  let firsts = 0;
  for (const [W, H] of SIZES) for (const reduced of [false, true]) {
    const where = 'a first visit at ' + W + (reduced ? ', less movement' : '');
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block',
      reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    await route(pg, false);
    await pg.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    const up = await pg.waitForFunction(() => typeof loading_ === 'function', null, { timeout: 60000 }).then(() => true, () => false);
    if (!up) { bad.push(where + ': shell.js never loaded, so the splash\'s loader could NOT be compared'); await ctx.close(); continue; }
    await pg.waitForTimeout(400);
    const got = await pg.evaluate(() => {
      const sp = document.getElementById('splash'), still = document.getElementById('splash-still');
      const name = still && still.querySelector('.sp-name'), ld = still && still.querySelector(':scope > .loading');
      const box = el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
      const anims = el => document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target && el.contains(a.effect.target))
        .map(a => a.animationName || '?');
      const dots = ld ? [...ld.children] : [];
      /* AND NOTHING ELSE IN THE SPLASH MOVES. The name being still and the loader being the loader
         said nothing about a third thing: a decoration put in `#splash` with a class — or drawn by a
         `::before` with no markup at all — ran on every first visit beside the loader and this
         passed. Every running animation whose target is the splash or anything in it, pseudo-elements
         included, unless it is the loader's own. */
      const others = document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target
          && sp.contains(a.effect.target) && !(ld && ld.contains(a.effect.target)))
        .map(a => (a.animationName || '?') + ' on ' + (a.effect.target.id ? '#' + a.effect.target.id : a.effect.target.tagName.toLowerCase()
          + (a.effect.target.getAttribute('class') ? '.' + a.effect.target.getAttribute('class').trim().split(/\s+/).join('.') : ''))
          + (a.effect.pseudoElement || ''));
      return {
        others,
        cls: sp.className, drawn: !!sp.querySelector(':scope > [class|="an"]'), sw: document.documentElement.clientWidth,
        still: !!still, shown: !!(still && still.getClientRects().length), name: name ? name.textContent.trim() : null,
        nameBox: name ? box(name) : null, nameAnims: name ? anims(name) : [], nameKf: name ? getComputedStyle(name).animationName : '',
        loader: ld ? ld.outerHTML : null, want: loading_(), ldAnims: ld ? anims(ld) : [],
        dotsBox: dots.length ? (() => { const bs = dots.map(box); return { l: Math.min(...bs.map(b => b.l)), r: Math.max(...bs.map(b => b.r)), t: Math.min(...bs.map(b => b.t)) }; })() : null,
      };
    });
    if (got.cls !== 'is-still' || got.drawn) bad.push(where + ': the splash is "' + got.cls + '"' + (got.drawn ? ' with a drawing in it' : '') + ' — nothing is kept, so it is the still name and the loader');
    if (!got.still || !got.shown) bad.push(where + ': #splash-still is ' + (got.still ? 'not shown' : 'not in the page') + ' — a first visit is a black screen');
    else {
      if (got.name !== '@family.') bad.push(where + ': the name reads "' + got.name + '"');
      if (got.nameAnims.length || got.nameKf !== 'none') bad.push(where + ': the name is animated (' + (got.nameAnims.join(', ') || got.nameKf) + ') — it is set plainly and does not move');
      if (got.others.length) bad.push(where + ': something else on the splash moves beside the loader — ' + got.others.join(', ') + ' — a first visit is the name, still, and the one loader, and nothing more');
      if (got.loader !== got.want) bad.push(where + ': the loader under the name is ' + JSON.stringify(got.loader) + ', and loading_() draws ' + JSON.stringify(got.want));
      if (!reduced && got.ldAnims.length < 3) bad.push(where + ': ' + got.ldAnims.length + ' of the loader\'s three dots are moving');
      if (reduced && got.ldAnims.length) bad.push(where + ': the loader keeps moving with less movement asked for (' + got.ldAnims.join(', ') + ')');
      const n = got.nameBox, d = got.dotsBox;
      if (n && (n.l < 0 || n.r > got.sw || n.w <= 0)) bad.push(where + ': the name runs off the screen (' + Math.round(n.l) + ' to ' + Math.round(n.r) + ' of ' + got.sw + ')');
      if (n && d) {
        if (Math.abs((n.l + n.r) / 2 - (d.l + d.r) / 2) > 2) bad.push(where + ': the loader is not centred under the name (' + ((n.l + n.r) / 2).toFixed(1) + ' against ' + ((d.l + d.r) / 2).toFixed(1) + ')');
        if (d.t < n.b) bad.push(where + ': the loader is not under the name');
      }
      /* AND STILL TO THE EYE, not only by what the browser says is running: four frames of the name. */
      let prev = null, moved = 0;
      for (let i = 0; i < 4; i++) {
        const el = await pg.$('#splash-still .sp-name');
        const buf = el ? await el.screenshot() : null;
        if (prev && buf && Buffer.compare(prev, buf)) moved++;
        prev = buf;
        await pg.waitForTimeout(250);
      }
      if (moved) bad.push(where + ': ' + moved + ' of 3 frames of the name changed — it is meant to hold still');
      if (SHOTS && !reduced) { fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true }); await pg.screenshot({ path: path.join(__dirname, 'shots', 'splash-first-' + W + '.png') }); }
      firsts++;
    }
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log('\n' + want.length + ' animations, ' + looked + ' chapter pages measured at ' + SIZES.map(s => s[0]).join(' and ')
    + ', six moments each; and with less movement, each in its chapter and on the splash, with nothing left looping.'
    + '\nA first visit, ' + firsts + ' of ' + (SIZES.length * 2) + ' ways (' + SIZES.map(s => s[0]).join(' and ') + ', with motion and without): the name still, the one loader under it, nothing else on the splash moving.'
    + (SHOTS ? '\nThe reduced-motion stills are in check/shots/anim-still-<id>.png — look at them: still is not the same as showing the lesson.' : ''));
  if (bad.length) {
    console.log('\nBROKEN  (' + bad.length + ')');
    bad.forEach(b => console.log('  ' + b));
    console.log('\nFAILED — a textbook animation that is not whole, inside its card, and still when asked.');
    process.exit(1);
  }
  console.log('OK — every animation is drawn in its chapter, stays inside its card, and holds still when asked.');
})().catch(e => { console.log('COULD NOT RUN — ' + (e && e.stack || e)); process.exit(1); });
