#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/ruler.js TWO FINGERS ON THE RULER (502): a real Chromium with two touch points moves, turns and crosses over the ruler and protractor laid on a figure; each finger's spot must stay under it. */
/* Flags: --shots=DIR writes PNGs (ruler turned, protractor, compass). Port: RULER_PORT (22811). Needs playwright (npm i). */
const fs = require('fs');
const path = require('path');
const http = require('http');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('COULD NOT RUN — playwright is not installed'); process.exit(1); }

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.RULER_PORT || 22811);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const SHOTS = ((process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || '');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
/* A MEASURE ROW WITH A FIGURE (check/types.js pins it too), and a construction for the compass */
const ROW = 'Q-1MA1-2406-2F-7b';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fail = [];
const ok = [];

function serve() {
  return new Promise((res0, no) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      const libBody = require('./lib-full.js').serve(p);
      if (libBody !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(libBody); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not here'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.on('error', no);
    s.listen(PORT, () => res0(s));
  });
}

/* OPEN A ROW'S CARD IN FIND, as check/types.js does, and lay one tool on its figure */
async function openTool(page, row, tool) {
  return page.evaluate(async ([r, tool]) => {
    go('stuff', false, true);
    const hit = stuffItemsAll_().find(x => x.row && x.row.row_id === r);
    if (!hit) return 'not in the library';
    STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: hit.row.paper_id }];
    paintStuff(true);
    await new Promise(z => setTimeout(z, 600));
    const h2 = stuffFiltered().find(x => x.row && x.row.row_id === r) || hit;
    goPage('stuff', stuffPageOf_(h2) + stuffFirstResult_(), true);
    await new Promise(z => setTimeout(z, 1400));
    const t = [...document.querySelectorAll('#s-stuff .page.on .q-meast')].find(e => e.getAttribute('data-key') === h2.key && e.getAttribute('data-tool') === tool);
    if (!t) return 'no ' + tool + ' tile on its card';
    t.click();
    await new Promise(z => setTimeout(z, 300));
    const o = document.querySelector('#s-stuff svg.meas');
    if (!o) return 'the tile put nothing on the figure';
    o.scrollIntoView({ block: 'center' });
    await new Promise(z => setTimeout(z, 300));
    MEAS.rot = 0; MEAS.c = tool === 'protractor' ? [MEAS.vb[0] + MEAS.vb[2] / 2, MEAS.vb[1] + MEAS.vb[3] * 0.6] : [MEAS.vb[0] + MEAS.vb[2] * 0.05, MEAS.vb[1] + MEAS.vb[3] * 0.4];
    measDraw_(o.parentNode);
    return '';
  }, [row, tool]);
}
/* WHERE A SPOT OF THE TOOL (its own units) IS ON THE SCREEN, and the pose */
const where = (page, ls) => page.evaluate(ls => {
  const o = document.querySelector('#s-stuff svg.meas'), m = o.getScreenCTM();
  return { pose: { c: MEAS.c.slice(), rot: MEAS.rot, L: MEAS.L, R: MEAS.R }, at: AT, pg: PAGE[AT] || 0,
    pts: ls.map(l => { const w = measWorld_(l), q = o.createSVGPoint(); q.x = w[0]; q.y = w[1]; const z = q.matrixTransform(m); return [z.x, z.y]; }) };
}, ls);
const tp = pts => pts.map((p, i) => ({ x: p[0], y: p[1], radiusX: 6, radiusY: 6, force: 1, id: i + 1 }));
/* A TWO-FINGER GESTURE: `path(t)` gives both fingers at t in 0..1; `mid` runs at the middle with the fingers still down */
async function two(cdp, path, n, mid) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(path(0)) });
  let seen = null;
  for (let i = 1; i <= n; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(path(i / n)) });
    await sleep(12);
    if (mid && i === n) seen = await mid();
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(150);
  return seen;
}
const near = (a, b, tol) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= tol;
const turn = (p, c, deg) => { const t = deg * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(t) - dy * Math.sin(t), c[1] + dx * Math.sin(t) + dy * Math.cos(t)]; };
const adiff = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
    await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS && typeof stuffItemsAll_ === 'function', null, { timeout: 90000 });
    await sleep(1200);
    const cdp = await ctx.newCDPSession(page);

    /* 0. EVERY FIGURE HAS THE TOOLS (502): each question with a figure has Ruler and Protractor unless a registered rule keeps them off */
    const cover = await page.evaluate(() => {
      const qs = stuffItemsAll_().filter(x => x && x.kind === 'question' && cardDiagram_(x));
      const bare = qs.filter(x => !measTools_(x).length && !(padSource_(x) && padSource_(x).from === 'part') && !QT_WORDY_SUBJECT.test(String(x.subject || (x.row && x.row.subject) || '')));
      return { n: qs.length, with: qs.filter(x => measTools_(x).length === 2).length, bare: bare.slice(0, 5).map(x => x.key), rules: ['meas-wordy', 'meas-under-pen', 'pen-chosen', 'mag-items', 'speed-long', 'hear-lang'].filter(id => !RULE_OF_(id)) };
    });
    if (!cover.n) fail.push('no question with a figure reached the page -- nothing to prove the tools on');
    if (cover.bare.length) fail.push('figure questions with no Ruler or Protractor and no rule saying why: ' + cover.bare.join(', '));
    if (cover.rules.length) fail.push('tool rules missing from the Rules card: ' + cover.rules.join(', '));
    ok.push(cover.with + ' of ' + cover.n + ' figure questions with both tools');
    let e = await openTool(page, ROW, 'ruler');
    if (e) { console.log('COULD NOT RUN — ' + ROW + ': ' + e); process.exit(1); }
    let w = await where(page, [[0, 0]]);
    const L = w.pose.L;
    /* TWO SPOTS ON ITS BODY, a third and two thirds along, half-way down its width */
    const spots = await page.evaluate(() => { const H = +document.querySelector('#s-stuff svg.meas .meas-body').getAttribute('height'); return [[MEAS.L * 0.3, H / 2], [MEAS.L * 0.7, H / 2]]; });
    const s0 = await where(page, spots);

    /* 1. MOVE: both fingers 40px right, 30px down -- each spot stays under its finger, and the turn does not change */
    const d = [40, 30];
    let got = await two(cdp, t => s0.pts.map(p => [p[0] + d[0] * t, p[1] + d[1] * t]), 12, () => where(page, spots));
    got.pts.forEach((p, i) => { const want = [s0.pts[i][0] + d[0], s0.pts[i][1] + d[1]]; if (!near(p, want, 1.5)) fail.push(`move: finger ${i + 1}'s spot is at ${p.map(Math.round)}, its finger at ${want.map(Math.round)}`); });
    if (adiff(got.pose.rot, s0.pose.rot) > 0.5) fail.push(`move: two fingers moved together turned it ${got.pose.rot.toFixed(1)}°`);
    if (got.at !== s0.at || got.pg !== s0.pg) fail.push('move: the column or page slid under the fingers');
    ok.push('move');

    /* 2. TURN: 37° about the fingers' midpoint -- the ruler turns 37° and both spots stay under their fingers */
    const s1 = await where(page, spots);
    const mid1 = [(s1.pts[0][0] + s1.pts[1][0]) / 2, (s1.pts[0][1] + s1.pts[1][1]) / 2];
    got = await two(cdp, t => s1.pts.map(p => turn(p, mid1, 37 * t)), 16, () => where(page, spots));
    if (adiff(got.pose.rot, s1.pose.rot + 37) > 0.6) fail.push(`turn: fingers turned 37°, the ruler ${(got.pose.rot - s1.pose.rot).toFixed(1)}°`);
    got.pts.forEach((p, i) => { const want = turn(s1.pts[i], mid1, 37); if (!near(p, want, 1.5)) fail.push(`turn: finger ${i + 1}'s spot drifted to ${p.map(Math.round)} from ${want.map(Math.round)}`); });
    ok.push('turn');

    /* 3. CROSS OVER: a half turn, the fingers passing each other -- no flip, no lost finger: 180° and still under them */
    const s2 = await where(page, spots);
    const mid2 = [(s2.pts[0][0] + s2.pts[1][0]) / 2, (s2.pts[0][1] + s2.pts[1][1]) / 2];
    const trail = [];
    got = await two(cdp, t => s2.pts.map(p => turn(p, mid2, 180 * t)), 30, () => where(page, spots));
    if (adiff(got.pose.rot, s2.pose.rot + 180) > 0.6) fail.push(`cross over: fingers turned 180°, the ruler ${(got.pose.rot - s2.pose.rot).toFixed(1)}°`);
    got.pts.forEach((p, i) => { const want = turn(s2.pts[i], mid2, 180); if (!near(p, want, 1.5)) fail.push(`cross over: finger ${i + 1}'s spot is ${p.map(Math.round)}, its finger ${want.map(Math.round)}`); });
    ok.push('cross over');

    /* 4. SNAP: turned to 1.5° short of 45° from level, it settles on 45° */
    const s3 = await where(page, spots);
    const mid3 = [(s3.pts[0][0] + s3.pts[1][0]) / 2, (s3.pts[0][1] + s3.pts[1][1]) / 2];
    const by = (((45 - 1.5 - s3.pose.rot) % 360) + 540) % 360 - 180;
    got = await two(cdp, t => s3.pts.map(p => turn(p, mid3, by * t)), 16, () => where(page, spots));
    if (adiff(got.pose.rot, 45) > 0.01) fail.push(`snap: 1.5° off 45° the ruler lies at ${got.pose.rot.toFixed(2)}°, not 45°`);
    ok.push('snap');

    /* 5. ONE FINGER ON AN END turns it about the other end, which stays put */
    await page.evaluate(() => { MEAS.rot = 0; MEAS.c = [MEAS.vb[0] + MEAS.vb[2] * 0.05, MEAS.vb[1] + MEAS.vb[3] * 0.4]; measDraw_(document.querySelector('#s-stuff svg.meas').parentNode); });
    const ends = await where(page, [[L * 0.97, 4], [0, 0]]);
    if (process.env.VERBOSE) console.log('end', JSON.stringify(ends), await page.evaluate(p => { const e = document.elementFromPoint(p[0], p[1]); return e && (e.getAttribute('class') || e.tagName); }, ends.pts[0]));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp([ends.pts[0]]) });
    for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp([turn(ends.pts[0], ends.pts[1], 25 * i / 12)]) }); await sleep(12); }
    const e5 = await where(page, [[0, 0]]);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    if (!near(e5.pts[0], ends.pts[1], 1)) fail.push(`end: turning by one end moved the other end ${e5.pts[0].map(Math.round)} from ${ends.pts[1].map(Math.round)}`);
    if (adiff(e5.pose.rot, 25) > 0.6) fail.push(`end: the end was swung 25°, the ruler turned ${e5.pose.rot.toFixed(1)}°`);
    ok.push('one end');

    /* 6. ONE FINGER ON ITS MIDDLE drags it, without turning */
    const s6 = await where(page, [[L * 0.5, 4]]);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(s6.pts) });
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp([[s6.pts[0][0] - 3 * i, s6.pts[0][1] + 2 * i]]) }); await sleep(12); }
    const e6 = await where(page, [[L * 0.5, 4]]);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    if (!near(e6.pts[0], [s6.pts[0][0] - 30, s6.pts[0][1] + 20], 1.5) || adiff(e6.pose.rot, s6.pose.rot) > 0.5) fail.push('drag: one finger on the middle did not carry the ruler without turning it');
    ok.push('drag');

    if (SHOTS) {
      fs.mkdirSync(SHOTS, { recursive: true });
      await page.evaluate(() => { MEAS.rot = 30; measDraw_(document.querySelector('#s-stuff svg.meas').parentNode); });
      await sleep(200);
      await page.screenshot({ path: path.join(SHOTS, 'ruler-turned-390.png') });
    }

    /* 7. THE PROTRACTOR, the same two fingers: a 50° turn, its centre between them staying under them */
    e = await openTool(page, ROW, 'protractor');
    if (e) fail.push('protractor: ' + e);
    else {
      const ps = await page.evaluate(() => [[-MEAS.R * 0.5, -MEAS.R * 0.25], [MEAS.R * 0.5, -MEAS.R * 0.25]]);
      const p0 = await where(page, ps);
      if (process.env.VERBOSE) console.log('prot', JSON.stringify(p0), await page.evaluate(p => { const e = document.elementFromPoint(p[0], p[1]); return e && (e.getAttribute('class') || e.tagName); }, p0.pts[0]));
      const pm = [(p0.pts[0][0] + p0.pts[1][0]) / 2, (p0.pts[0][1] + p0.pts[1][1]) / 2];
      got = await two(cdp, t => p0.pts.map(p => turn([p[0] + 20 * t, p[1]], [pm[0] + 20 * t, pm[1]], 50 * t)), 16, () => where(page, ps));
      if (adiff(got.pose.rot, p0.pose.rot + 50) > 0.6) fail.push(`protractor: fingers turned 50°, it turned ${(got.pose.rot - p0.pose.rot).toFixed(1)}°`);
      got.pts.forEach((p, i) => { const want = turn([p0.pts[i][0] + 20, p0.pts[i][1]], [pm[0] + 20, pm[1]], 50); if (!near(p, want, 1.5)) fail.push(`protractor: finger ${i + 1}'s spot is ${p.map(Math.round)}, its finger ${want.map(Math.round)}`); });
      ok.push('protractor');
      if (SHOTS) { await page.evaluate(() => { MEAS.rot = 0; measDraw_(document.querySelector('#s-stuff svg.meas').parentNode); }); await sleep(200); await page.screenshot({ path: path.join(SHOTS, 'protractor-390.png') }); }
    }
    /* 8. THE COMPASS, on a construction's pen: the point pressed, the width dragged out, the arc swung (a picture only) */
    if (SHOTS) {
      const r = await page.evaluate(async () => {
        const hit = stuffItemsAll_().find(x => x.kind === 'question' && x.row && /construct/i.test(String(x.html || '') + (x.row.lead || '')) && padSource_(x) && padSource_(x).from === 'part');
        if (!hit) return null;
        go('stuff', false, true);
        STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: hit.row.paper_id }];
        paintStuff(true);
        await new Promise(z => setTimeout(z, 600));
        const h2 = stuffFiltered().find(x => x.key === hit.key) || hit;
        goPage('stuff', stuffPageOf_(h2) + stuffFirstResult_(), true);
        await new Promise(z => setTimeout(z, 1400));
        const pad = document.querySelector('#s-stuff .page.on .qpad[data-k="' + CSS.escape(padKey_(h2)) + '"]');
        const t = pad && pad.querySelector('.qpad-tool[data-tool="compass"]');
        if (!t) return null;
        t.click();
        await new Promise(z => setTimeout(z, 200));
        const art = pad.querySelector('.qpad-art') || pad;
        art.scrollIntoView({ block: 'center' });
        await new Promise(z => setTimeout(z, 300));
        const b = art.getBoundingClientRect();
        return [b.left + b.width * 0.45, b.top + b.height * 0.5, b.width * 0.22];
      });
      if (r) {
        const [cx, cy, rad] = r, pts = [[cx, cy], [cx + rad, cy]];
        for (let i = 1; i <= 8; i++) pts.push([cx + rad * Math.cos(-i * 0.15), cy + rad * Math.sin(-i * 0.15)]);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp([pts[0]]) });
        for (let i = 1; i < pts.length; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp([pts[i]]) }); await sleep(i === 1 ? 500 : 60); }
        await page.screenshot({ path: path.join(SHOTS, 'compass-390.png') });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
    }
    if (errs.length) fail.push('page errors: ' + errs.join(' | '));
  } finally {
    await browser.close();
    server.close();
  }
  if (fail.length) { console.log('FAILED — two fingers on the ruler and protractor:\n  ' + fail.join('\n  ')); process.exit(1); }
  console.log('OK — ruler and protractor follow two touch points exactly: ' + ok.join(', '));
})().catch(e => { console.log('COULD NOT RUN — ' + (e && e.stack || e)); process.exit(1); });
