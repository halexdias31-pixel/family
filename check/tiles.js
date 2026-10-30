#!/usr/bin/env node
/* @family. — check/tiles.js ONE TILE SPEC (467, 487, 489): each tile is `tile_`, a 36px plate with a 16px mark (Check/Send 44px, 508), flowing left like words, one row per thing, no spill. Flags: --width=390. Port: TILES_PORT. */
/* AND AS DRAWN (533): every tile in every state of check/states.js, student and admin, at 320 and 390, is 36px on the glass (44 a Check) after any zoom. --no-states skips it. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const STUDENT = { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], handle: 'sam_quick12' };
/* A STUDENT IS SENT WHAT doGet SENDS A STUDENT, as check/ui.js does: no admin-only films. */
const FIXTURE_ANON = (() => { try { const o = JSON.parse(FIXTURE); o.films = []; delete o.filmsSync; return JSON.stringify(o); } catch (e) { return FIXTURE; } })();
const { statesOf } = require('./states.js');
const NO_STATES = process.argv.includes('--no-states');
/* THE FINGERTIP FLOOR ON THE GLASS (533, U10): half a pixel under 36 and 44, because a rectangle is a sum and not a size. */
const FLOOR = 35.5, FLOOR_SUBMIT = 43.5;
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
      const want = t.classList.contains('is-submit') ? 44 : 36;
      /* ROUND (508): every plate a circle, a pill for the wide "are you sure" one. */
      const rs = getComputedStyle(t).borderTopLeftRadius, rad = /%$/.test(rs) ? parseFloat(rs) * t.offsetWidth / 100 : parseFloat(rs) || 0;
      if (rad < Math.min(t.offsetWidth, t.offsetHeight) / 2 - 0.5) out.push(`${where}: "${name}" is not round (radius ${rad}px)`);
      if (!t.classList.contains('is-sure') && (t.offsetWidth !== want || t.offsetHeight !== want)) out.push(`${where}: "${name}" is ${t.offsetWidth}x${t.offsetHeight}, not ${want}x${want}`);
      const i = t.querySelector('.tile-i');
      const iw = i ? parseFloat(getComputedStyle(i).width) : 16;
      if (Math.round(iw) !== 16) out.push(`${where}: "${name}" has a ${Math.round(iw)}px mark, not 16px`);
      if (b.right > rr.right + 1) out.push(`${where}: "${name}" spills ${Math.round(b.right - rr.right)}px past its row`);
    });
    for (let a = 0; a < ts.length; a++) for (let c = a + 1; c < ts.length; c++) {
      const x = ts[a].getBoundingClientRect(), y = ts[c].getBoundingClientRect();
      if (x.left < y.right - 1 && y.left < x.right - 1 && x.top < y.bottom - 1 && y.top < x.bottom - 1) out.push(`${where}: "${ts[a].getAttribute('aria-label')}" overlaps "${ts[c].getAttribute('aria-label')}"`);
    }
    /* LEFT-ALIGNED FLOW (487): a row starting with a tile starts at its left edge, and tiles side by side sit one gap apart -- no spreading or centring. */
    if (ts.length && row.firstElementChild && (row.firstElementChild === ts[0] || row.firstElementChild.contains(ts[0])) && ts[0].getBoundingClientRect().left > rr.left + 1) out.push(`${where}: the first tile is not at the row's left edge`);
    for (let k = 1; k < ts.length; k++) {
      const p = ts[k - 1].getBoundingClientRect(), q = ts[k].getBoundingClientRect();
      if (Math.abs(p.top - q.top) < 4 && q.left - p.right > 8 && ts[k - 1].nextElementSibling === ts[k]) out.push(`${where}: "${ts[k].getAttribute('aria-label')}" sits ${Math.round(q.left - p.right)}px from the tile before it, not one gap`);
    }
  });
  /* ONE TILE ROW PER THING (489): "none are separated by a return" -- no tile row stands straight under another, nor under a box ending in one. */
  const lastKid = e => { let k = e.lastElementChild; while (k && k.tagName === 'P' && !k.textContent.trim()) k = k.previousElementSibling; return k; };
  sec.querySelectorAll('.tile-row').forEach(row => {
    if (!row.getBoundingClientRect().width || row.closest('.ncl-box, .rep-box') || (row.parentElement && row.parentElement.closest('.me-form')) || (row.previousElementSibling && row.previousElementSibling.hidden)) return;
    const prev = row.previousElementSibling;
    let d = prev;
    while (d && !d.classList.contains('tile-row') && lastKid(d) && !d.matches('.merged-part, .widget-slot, .me-form, form, [class*="qual"], ul, ol, table')) d = lastKid(d);
    /* A PERSON'S OWN ROW (498) is about them; the list's layout row under it is about the list, so the two stay apart. */
    if (d && d.classList.contains('tile-row') && !d.classList.contains('person-tiles') && !row.classList.contains('wgt-foot') && !(prev && prev.matches('.merged-part, .widget-slot'))) {
      const c = row.closest('.card, .own-set, .fest'), h = c && c.querySelector('h2, h3, .wgt-title');
      out.push(`#s-${id}: "${((h && h.textContent) || '?').trim().slice(0, 40)}" has its tiles in two rows, one under the other`);
    }
  });
  /* ONE PLACE FOR A WIDGET'S TILES (472): the star, padlock and admin group sit in one `.wgt-foot` row, the card's last child, in that order. */
  sec.querySelectorAll('.card.is-widget').forEach(c => {
    const name = (c.querySelector('.widget-slot') || {}).id || '?';
    const foot = c.querySelector(':scope > .wgt-foot');
    c.querySelectorAll('.wgt-keep, .wgt-admin').forEach(g => { if (g.parentElement !== foot) out.push(`#s-${id} ${name}: its ${g.className} is not in the widget's one tile row`); });
    if (foot && c.lastElementChild !== foot) out.push(`#s-${id} ${name}: its tile row is not after its content`);
    if (foot) {
      const order = [...foot.children].map(g => g.classList.contains('wgt-keep') ? 1 : g.classList.contains('wgt-admin') ? 2 : 9);
      if (order.some((o, i) => o === 9 || (i && o < order[i - 1]))) out.push(`#s-${id} ${name}: its tile row is not star, padlock, then admin`);
    }
  });
  /* EVERY THING HAS THE ADMIN'S TILES (487): "you haven't given it a delete button" -- each card or widget on a page carries a `.wgt-admin` row for an admin. */
  sec.querySelectorAll(':scope > .page > .pane > .card, :scope > .page > .pane > .fest').forEach(c => {
    /* NOT A LAYOUT THING: a person (a row of people, with Start here), a reel (a row of the media tab), a column's empty line or the inbox's. */
    if (c.matches('.is-prof, .is-empty, .set-none') || c.querySelector(':scope > .widget-slot > .reel') || (id === 'dm' && !c.className.replace('card', '').trim())) return;
    if (!c.getBoundingClientRect().height || c.closest('.wgt-admin') || c.querySelector('.wgt-admin') || (c.nextElementSibling && c.nextElementSibling.classList.contains('wgt-admin'))) return;
    const h = c.querySelector('h2, h3, .wgt-title');
    out.push(`#s-${id}: "${((h && h.textContent) || "").trim().slice(0, 40) + " [" + c.className + "]"}" has no admin tiles (move, delete, note)`);
  });
  return { out, tiles };
}

/* ---------- IN THE PAGE: every tile of one screen as drawn, zoom and all -- what a finger meets. */
function drawn([id, floor, floorSubmit]) {
  const sec = document.getElementById('s-' + id);
  if (!sec) return { n: 0, out: [] };
  const out = [];
  let n = 0;
  sec.querySelectorAll('.tile').forEach(t => {
    const b = t.getBoundingClientRect();
    if (!b.width || !b.height || t.closest('[hidden]')) return;
    n++;
    const want = t.classList.contains('is-submit') ? floorSubmit : floor;
    if (b.width < want || b.height < want) out.push(`"${t.getAttribute('aria-label') || '?'}" is drawn ${Math.round(b.width * 10) / 10}x${Math.round(b.height * 10) / 10}`);
  });
  return { n, out };
}

/* ---------- EVERY STATE, AS EACH VISITOR SEES IT: entered, arrived (asked up to 2.5s), measured, put back. */
async function statesPass(browser, port) {
  let n = 0, states = 0;
  /* A STATE THIS PASS COULD NOT REACH IS PRINTED AND COUNTED, NOT FAILED: reaching states is check/ui.js's rule, and some ask for its visitor and its payload. */
  const missed = [];
  const run = (page, src) => page.evaluate(x => { try { (0, eval)('(' + x + ')')(); return true; } catch (e) { return String(e && e.message || e); } }, String(src));
  for (const w of [320, 390].filter(x => !WIDTH || x === WIDTH)) {
    for (const who of [{ as: 'student', user: STUDENT, body: FIXTURE_ANON }, { as: 'admin', user: USER, body: FIXTURE }]) {
      const page = await browser.newPage({ viewport: { width: w, height: w === 320 ? 568 : 844 }, hasTouch: true, isMobile: true });
      await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, who.user);
      await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: who.body }));
      await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(800);
      const ids = await page.evaluate(() => { try { columnsFor_(); } catch (e) {} return TABS.map(t => t.id || t); });
      for (const id of ids) {
        for (const st of statesOf(id)) {
          const where = `${w}px ${who.as} #s-${id}${st.name ? ' · ' + st.name : ''}`;
          await page.evaluate(i => { try { closeSheet(); } catch (e) {} try { go(i, false, true); } catch (e) {} }, id);
          await page.waitForTimeout(250);
          if (st.only && !(await page.evaluate(x => { try { return !!(0, eval)('(' + x + ')')(); } catch (e) { return false; } }, String(st.only)))) continue;
          if (st.enter) {
            const ok = await run(page, st.enter);
            if (ok !== true) { missed.push(`${where}: could not be entered (${ok})`); if (st.leave) await run(page, st.leave); continue; }
            await page.waitForTimeout(300);
          }
          if (st.expect) {
            const got = await page.evaluate(async x => {
              const t0 = performance.now();
              for (;;) { let ok = 0; try { ok = (0, eval)('(' + x + ')')(); } catch (e) {} if (ok || performance.now() - t0 > 2500) return ok; await new Promise(r => setTimeout(r, 100)); }
            }, String(st.expect));
            if (!got) { missed.push(`${where}: entered and never arrived`); if (st.leave) await run(page, st.leave); continue; }
          }
          /* AFTER THE PANES ARE REACHED: `paneReach_` runs a frame after a placement. */
          await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
          const r = await page.evaluate(drawn, [id, FLOOR, FLOOR_SUBMIT]);
          n += r.n; states++;
          r.out.forEach(x => bad.push(`${where}: ${x}, under a fingertip`));
          if (st.leave) { await run(page, st.leave); await page.waitForTimeout(150); }
        }
      }
      await page.close();
    }
  }
  missed.forEach(m => console.log('  not reached, its tiles not measured: ' + m));
  return { n, states, missed: missed.length };
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('tiles: no browser — ' + e.message); process.exit(2); }
  let measured = 0, floor = { n: 0, states: 0 };
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
      /* A FIND CARD (495): a front page is never a result, so open a library card and measure the page it lands on -- its tiles, star row and Back to top are one row. */
      const opened = await page.evaluate(async () => {
        for (let i = 0; i < 60; i++) {
          const x = (typeof stuffItemsAll_ === 'function' ? stuffItemsAll_() : []).find(y => y && y.key === 'hdb:MS-0001');
          if (x) { go('stuff'); finderOpen_(x); return true; }
          await new Promise(ok => setTimeout(ok, 100));
        }
        return false;
      });
      if (!opened) bad.push(`${w}px Find: Papyrus 52 never reached the list -- the Find card was NOT checked`);
      else {
        await page.waitForTimeout(900);
        const r = await page.evaluate(measure, 'stuff');
        const rows = await page.evaluate(() => { const c = document.querySelector('#s-stuff .hdb-msc'); const p = c && c.closest('.pane'); return p ? [...p.querySelectorAll('.tile-row')].filter(e => e.getBoundingClientRect().width).length : -1; });
        if (rows < 0) bad.push(`${w}px Find: Papyrus 52's card was not drawn -- NOT checked`);
        else if (rows !== 1) bad.push(`${w}px Find: Papyrus 52's page has ${rows} tile rows, not one`);
        measured += r.tiles;
        r.out.forEach(x => bad.push(`${w}px ${x}`));
      }
      await page.close();
    }
    if (!NO_STATES) floor = await statesPass(browser, port);
  } finally { await browser.close(); server.close(); }
  if (!measured) { console.error('tiles: no tile was measured — the check cannot see its subject'); process.exit(1); }
  if (!NO_STATES && !floor.n) { console.error('tiles: no tile was measured as drawn in any state — the floor reached nothing'); process.exit(1); }
  if (bad.length) { console.error(`tiles: ${bad.length} tile(s) off the spec`); bad.forEach(b => console.error('  ' + b)); process.exit(1); }
  console.log(`tiles: ${measured} tiles at ${SIZES.join('/')}px — one size, one mark, left-aligned, no overlap or spill`
    + (NO_STATES ? '' : `; ${floor.n} drawn in ${floor.states} states (student and admin, 320/390) and none under a fingertip (${floor.missed} not reached, -v names them)`));
})();
