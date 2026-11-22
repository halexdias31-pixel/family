#!/usr/bin/env node
/* @family. — tools/share-picture.js THE SHARE-PICTURE CHECK (rule 1.75, owner 22 Nov: "Share is a picture" came out a blank square on
   an iPhone). A sample of question types is opened on an iPhone 13 (`?card=`), its Share button pressed, and the picture the phone
   would hand on (`rcHand_`'s blob) is looked at: a picture almost all one colour, or one a few pixels across, fails the build.
   WebKit (the engine every iPhone browser runs, where the blank picture happened) and Chromium both, when WebKit can start here;
   without it the line says so and Chromium alone is held. Run by tools/build.js after the bundles. */
'use strict';
const fs = require('fs'), http = require('http'), path = require('path');
const { ROOT, main, report } = require('./lib/gen.js');
const PORT = 8133;
/* ONE OF EACH FACE A CHILD SHARES: words and a box, a frequency tree as cells, a table with boxes in it, a tally table, a choice, a drawing. */
const SAMPLE = [
  ['words and a box', 'Q-1MA1-2311-2F-16'],
  ['frequency tree, cells', 'Q-1MA1-2311-3F-15a'],
  ['table with boxes', 'Q-1MA1-2406-2F-24a'],
  ['tally table', 'Q-1MA1-2311-1F-8a'],
  ['choice', 'Q-1MA1-2311-2F-11a'],
  ['diagram', 'Q-1MA1-2306-1H-5a'],
];
/* BLANK: this share of the picture or more is one colour (within a small tolerance), or it is under 40px a side. */
const ONE_COLOUR = 0.97, MIN_SIDE = 40;
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };

function serve() {
  const lib = require('./lib/lib-full.js');
  const payload = fs.readFileSync(path.join(ROOT, 'tools/lib/payload.json'), 'utf8');
  const srv = http.createServer((q, s) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    /* THE LIBRARY WITH ITS WORDS where this machine has them; a file it cannot join is served as the repository has it. */
    let body = null; try { body = lib.serve(file); } catch (e) { body = null; }
    if (body !== null) { s.writeHead(200, { 'content-type': 'application/json' }); return s.end(body); }
    if (!file.startsWith(ROOT)) { s.writeHead(404); return s.end(); }
    fs.readFile(file, (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(b); });
  }).listen(PORT);
  return { srv, payload };
}

/* IN THE PAGE: the picture drawn back onto a canvas and its colours counted. */
function measure_(b64) {
  return new Promise((ok, no) => {
    const im = new Image();
    im.onload = () => {
      const w = im.naturalWidth, h = im.naturalHeight, s = Math.min(1, 256 / Math.max(w, h));
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
      const g = c.getContext('2d'); g.drawImage(im, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height).data, n = d.length / 4, count = new Map();
      for (let i = 0; i < d.length; i += 4) { const k = (d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4); count.set(k, (count.get(k) || 0) + 1); }
      ok({ w, h, top: Math.max(...count.values()) / n });
    };
    im.onerror = () => no(new Error('the picture would not decode'));
    im.src = 'data:image/png;base64,' + b64;
  });
}

async function one(browser, devices, payload, key) {
  const c = await browser.newContext({ ...devices['iPhone 13'] });
  try {
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { localStorage.setItem('familyUser', JSON.stringify({ name: 'Test Admin', handle: 'testadmin', personId: 'P001', role: 'admin', token: 'tok' })); } catch (e) {} });
    await pg.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: payload }));
    await pg.goto('http://localhost:' + PORT + '/?card=' + encodeURIComponent('q:' + key));
    /* THE QUESTION WHOLE: its card drawn with its words, not the waiting card. */
    await pg.waitForFunction(() => [...document.querySelectorAll('#screen .qcard')].some(e => !e.classList.contains('lib-wait') && e.offsetHeight > 0
      && e.querySelector('[data-do="card-share"]')), null, { timeout: 90000 });
    await pg.waitForTimeout(1500);
    /* THE PRESS AS A FINGER MAKES IT, the picture caught where it would go to the phone's sheet. */
    await pg.evaluate(() => { window.__shot = null;
      window.rcHand_ = blob => { window.__shot = { blob }; };
      window.rcShareFail_ = e => { window.__shot = { err: String((e && e.message) || e) }; }; });
    const ok = await pg.evaluate(() => { const b = [...document.querySelectorAll('#screen .qcard [data-do="card-share"]')].find(e => e.offsetWidth > 0);
      if (b) b.click(); return !!b; });
    if (!ok) return { err: 'no Share button on the card' };
    await pg.waitForFunction(() => window.__shot, null, { timeout: 30000 });
    const got = await pg.evaluate(async () => { const s = window.__shot; if (s.err) return s;
      const u = await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(s.blob); });
      return { b64: String(u).split(',')[1] }; });
    if (got.err) return { err: got.err };
    return await pg.evaluate(measure_, got.b64);
  } finally { await c.close(); }
}

async function run() {
  const PW = require('playwright'), { devices } = PW;
  const { srv, payload } = serve();
  const engines = [];
  try {
    for (const name of ['webkit', 'chromium']) {
      try { engines.push({ name, b: await PW[name].launch() }); }
      catch (e) { console.log('  share-picture: ' + name + ' will not start here (' + String(e.message || e).split('\n').find(l => /missing|Executable|install/i.test(l)) + '); `npx playwright install-deps ' + name + '`'); }
    }
    if (!engines.some(x => x.name === 'chromium')) throw new Error('share-picture: no Chromium to check with');
    const rows = [];
    for (const { name, b } of engines) {
      const todo = SAMPLE.slice();
      await Promise.all([0, 1, 2].map(async () => {
        while (todo.length) {
          const [kind, key] = todo.shift();
          let r; try { r = await one(b, devices, payload, key); } catch (e) { r = { err: String((e && e.message) || e).split('\n')[0] }; }
          rows.push({ name, kind, key, ...r });
        }
      }));
    }
    const bad = rows.filter(r => r.err || r.w < MIN_SIDE || r.h < MIN_SIDE || r.top >= ONE_COLOUR).map(r => r.name + ' › ' + r.kind + ' (' + r.key + '): '
      + (r.err ? r.err : r.w + 'x' + r.h + ', ' + Math.round(r.top * 100) + '% one colour'));
    console.log('share-picture: ' + (rows.length - bad.length) + '/' + rows.length + ' shared pictures show their question (' + engines.map(x => x.name).join(', ') + ')');
    report('share-picture', bad, 'blank shared picture(s): almost all one colour, or a few pixels across');
  } finally { await Promise.all(engines.map(x => x.b.close())); srv.close(); }
}
module.exports = { run };
main(module, run);
