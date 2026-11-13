#!/usr/bin/env node
/* @family. — check/bootslow.js THE SLOW BOX TELLS THE TRUTH (503): a cold load at 390px fetches no lazy library data; a hung or 404 data file never stops the boot; the box goes once the payload lands. Port BOOTSLOW_PORT. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.BOOTSLOW_PORT || 8167);
/* WHAT ONLY A CARD MAY ASK FOR — scripture, works, the icon masters, the race map, the e-ink sets. */
const LAZY = /^\/data\/(bible|quran|talmud|works|icons\/master)\/|^\/data\/(race-map|eink-)/;
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');

/* PER PAGE, by a header the page cannot forge: each scenario names what hangs and what is missing in its own query. */
function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const [url, q = ''] = rq.url.split('?');
      const ref = new URLSearchParams(((rq.headers.referer || '').split('?')[1]) || '');
      if (ref.get('hang') && url.indexOf(ref.get('hang')) !== -1) return;           // never answers
      if (ref.get('gone') && url.indexOf(ref.get('gone')) !== -1) { rs.writeHead(404); return rs.end(); }
      const f = path.join(ROOT, decodeURI(url === '/' ? '/index.html' : url));
      const lib = require('./lib-full.js').serve(f);
      if (lib !== null) { rs.writeHead(200, { 'content-type': 'application/json' }); return rs.end(lib); }
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); }
      const type = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html' }[path.extname(f)] || 'application/octet-stream';
      rs.writeHead(200, { 'content-type': type }); rs.end(fs.readFileSync(f));
    });
    srv.on('error', e => { console.log('FAIL — check/bootslow.js could not serve on port ' + PORT + ': ' + e.message); process.exit(1); });
    srv.listen(PORT, () => done(srv));
  });
}

async function visit(browser, { query, backendMs, user }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const asked = [];
  page.on('request', r => { try { asked.push({ path: new URL(r.url()).pathname, at: Date.now() }); } catch (e) {} });
  /* SIGNED IN, so Find draws its cards from the files while the payload is still out (owner's phone, 13 Nov). */
  if (user) await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* storage blocked */ } }, user);
  await page.addInitScript(([p, ms]) => {
    const real = window.fetch;
    window.fetch = function (u) {
      if (String((u && u.url) || u).indexOf('script.google.com') !== -1) {
        return new Promise(d => setTimeout(() => d(new Response(p, { status: 200, headers: { 'content-type': 'application/json' } })), ms));
      }
      return real.apply(this, arguments);
    };
  }, [FIXTURE, backendMs]);
  await page.goto(`http://localhost:${PORT}/index.html?${query}`, { waitUntil: 'commit' });
  return { ctx, page, asked, t0: Date.now() };
}
/* IN THE PAGE: every wait on screen (the slow box, a loading_() spinner) against every card's content box, and the slow box against painted content. */
function waitsOverContent() {
  const out = [], vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' ? r : null; };
  const slow = document.getElementById('boot-slow');
  const slowUp = slow && !slow.classList.contains('hidden') && vis(slow);
  const waits = [...document.querySelectorAll('#boot-slow:not(.hidden), .loading')].map(vis).filter(Boolean);
  /* CONTENT IS ANYTHING ON THE SCREEN WITH WORDS OF ITS OWN: a card's line, a chip, an answer row. */
  const boxes = [...document.querySelectorAll('#screen *')].filter(n => [...n.childNodes].some(t => t.nodeType === 3 && t.textContent.trim())).filter(n => !n.closest('#boot-slow') && !n.querySelector('.loading') && !n.closest('.loading')).map(vis).filter(Boolean);
  if (slowUp && boxes.length) out.push('the slow box is up though content has painted (' + boxes.length + ' things with words on screen)');
  waits.forEach(w => boxes.forEach(b => {
    if (Math.min(w.right, b.right) - Math.max(w.left, b.left) > 1 && Math.min(w.bottom, b.bottom) - Math.max(w.top, b.top) > 1)
      out.push(`a wait at (${Math.round(w.left)},${Math.round(w.top)}) ${Math.round(w.width)}x${Math.round(w.height)} sits over content at (${Math.round(b.left)},${Math.round(b.top)})`);
  }));
  return [...new Set(out)].slice(0, 5);
}
const loaded = page => page.evaluate(() => typeof LOADED !== 'undefined' && LOADED === true);
const boxUp = page => page.evaluate(() => { const b = document.getElementById('boot-slow'); return !!b && !b.classList.contains('hidden'); });

(async () => {
  const fails = [];
  const srv = await serve();
  const browser = await chromium.launch();
  try {
    const cold = await visit(browser, { query: 'v=cold', backendMs: 700 });
    const stuck = await visit(browser, { query: 'hang=textbooks.json&gone=practicals.json', backendMs: 700 });
    const late = await visit(browser, { query: 'v=late', backendMs: 33000,
      user: { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], handle: 'sam_quick12', token: 't-student' } });
    await cold.page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && FIRST_PAINT_DONE, null, { timeout: 60000 })
      .catch(() => fails.push('a cold load at 390px did not finish within 60 seconds'));
    await new Promise(r => setTimeout(r, 2000));
    const lazy = cold.asked.filter(a => LAZY.test(a.path)).map(a => a.path);
    if (lazy.length) fails.push('a cold load fetched library data before any card asked for it: ' + [...new Set(lazy)].join(', '));
    /* A PUPIL OPENS THE LIBRARY FROM THE FILES while the payload is still out, so content fills the screen under where the box comes up. */
    await new Promise(r => setTimeout(r, Math.max(0, late.t0 + 20000 - Date.now())));
    await late.page.getByText('Library', { exact: true }).first().click({ timeout: 5000 }).catch(() => fails.push('at 20 s the Library chip could not be pressed'));
    /* AT 31 SECONDS, BEFORE THE LATE PAYLOAD (owner, 13 Nov): a wait never sits over content, and none is up once content has painted. */
    await new Promise(r => setTimeout(r, Math.max(0, late.t0 + 31500 - Date.now())));
    (await late.page.evaluate(waitsOverContent)).forEach(f => fails.push('at 31 s with the payload still out: ' + f));
    /* PAST THE 30-SECOND WATCHDOG, with the late payload landing at 33. */
    await new Promise(r => setTimeout(r, Math.max(0, late.t0 + 38000 - Date.now())));
    if (!(await loaded(stuck.page))) fails.push('with data/textbooks.json hanging and data/practicals.json 404, the boot never finished');
    if (await boxUp(stuck.page)) fails.push('with a hung and a missing data file, the slow box came up after the code and payload had arrived');
    if (!(await loaded(late.page))) fails.push('a payload that answered at 33 seconds was never taken');
    if (await boxUp(late.page)) fails.push('the slow box stayed up after a late payload landed');
    if (await boxUp(cold.page)) fails.push('the slow box is up on a load that finished in seconds');
    if (process.env.VERBOSE === '1' || process.argv.includes('-v')) {
      console.log('   cold load asked for ' + cold.asked.length + ' files, none of them lazy library data');
    }
  } catch (e) {
    fails.push('the check itself threw: ' + (e && e.message));
  } finally {
    await browser.close(); srv.close();
  }
  if (fails.length) { fails.forEach(f => console.log('FAIL — ' + f)); process.exit(1); }
  console.log('OK — boot: no lazy data on a cold load; a hung or missing data file never holds it; the slow box only while code or payload is missing');
})();
