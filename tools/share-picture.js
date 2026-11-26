#!/usr/bin/env node
/* @family. — tools/share-picture.js THE SHARE-PICTURE CHECK (rule 1.75, owner 22 Nov: "Share is a picture" came out a blank square on
   an iPhone). A sample of question types is opened on an iPhone 13 (`?card=`), its Share button pressed, and the picture the phone
   would hand on (`rcHand_`'s blob) is looked at: a picture almost all one colour, or one a few pixels across, fails the build.
   WebKit (the engine every iPhone browser runs, where the blank picture happened) and Chromium both, when WebKit can start here;
   without it the line says so and Chromium alone is held. Run by tools/build.js after the bundles. */
'use strict';
const { main, report } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');
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

async function one(engine, key) {
  /* THE QUESTION WHOLE: its card drawn with its words, not the waiting card. */
  const pg = await SB.open({ engine, show: 'all', at: '?card=' + encodeURIComponent('q:' + key), ready: () => [...document.querySelectorAll('#screen .qcard')].some(e => !e.classList.contains('lib-wait') && e.offsetHeight > 0
      && e.querySelector('[data-do="card-share"]')) });
  try {
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
  } finally { await pg.close(); }
}

async function run() {
  const engines = [];
  try {
    for (const name of ['webkit', 'chromium']) {
      try { await SB.browser(name); engines.push({ name }); }
      catch (e) { console.log('  share-picture: ' + name + ' will not start here (' + String(e.message || e).split('\n').find(l => /missing|Executable|install/i.test(l)) + '); `npx playwright install-deps ' + name + '`'); }
    }
    if (!engines.some(x => x.name === 'chromium')) throw new Error('share-picture: no Chromium to check with');
    const rows = [];
    for (const { name } of engines) {
      await SB.pool(SAMPLE, 3, async ([kind, key]) => {
        let r; try { r = await one(name, key); } catch (e) { r = { err: String((e && e.message) || e).split('\n')[0] }; }
        rows.push({ name, kind, key, ...r });
      });
    }
    const bad = rows.filter(r => r.err || r.w < MIN_SIDE || r.h < MIN_SIDE || r.top >= ONE_COLOUR).map(r => r.name + ' › ' + r.kind + ' (' + r.key + '): '
      + (r.err ? r.err : r.w + 'x' + r.h + ', ' + Math.round(r.top * 100) + '% one colour'));
    console.log('share-picture: ' + (rows.length - bad.length) + '/' + rows.length + ' shared pictures show their question (' + engines.map(x => x.name).join(', ') + ')');
    report('share-picture', bad, 'blank shared picture(s): almost all one colour, or a few pixels across');
  } finally { await SB.done(); }
}
module.exports = { run };
main(module, run);
