#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/fig-labels.js EVERY LIBRARY FIGURE IN A LESSON CARD AT 390: no label overlaps another or leaves the viewBox, whatever the card text size (owner, 13 Nov). */
const LF = require('./lib-full.js');
LF.needWords();
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const W = 390;
/* HALF A USER UNIT EACH WAY: glyph boxes include side bearings, so two labels that only kiss are not a fault. */
const TOL = 1.5;
const ONLY = (process.argv.find(a => a.startsWith('--rows=')) || '').slice(7).split(',').filter(Boolean);
const MATCH = (process.argv.find(a => a.startsWith('--match=')) || '').slice(8);

function figures() {
  const out = [];
  fs.readdirSync(path.join(ROOT, 'data')).filter(f => f.endsWith('.json')).sort().forEach(f => {
    const lib = f.replace(/\.json$/, '');
    if (!LF.isLib(lib)) return;
    let rows;
    try { rows = LF.rows(lib); } catch (e) { return; }
    if (!Array.isArray(rows)) return;
    rows.forEach((r, i) => {
      if (!r || typeof r !== 'object' || r.anim) return;   // an animation hides labels by time, not a still figure
      Object.keys(r).forEach(k => {
        const v = r[k];
        if (typeof v !== 'string' || v.indexOf('<svg') === -1) return;
        const id = (r.row_id || r.practical_id || r.id || f + ':' + i) + (k === 'diagram' ? '' : '.' + k);
        if (ONLY.length && !ONLY.includes(id)) return;
        if (MATCH && v.indexOf(MATCH) === -1) return;
        out.push({ id, svg: v });
      });
    });
  });
  return out;
}

/* THE CARD A LESSON'S FIGURE IS DRAWN IN (find-facets.js), so the card's text size is the one under test. */
const cardHtml = (d, i) => `<div class="card fc kc" data-i="${i}"><div class="kc-lines"><div class="gd"><figure>${d.svg}</figure></div></div></div>`;

function inspect(tol) {
  const bad = [];
  const box = r => ({ x0: r.left, y0: r.top, x1: r.right, y1: r.bottom });
  document.querySelectorAll('[data-i]').forEach(card => {
    const svg = card.querySelector('figure > svg');
    if (!svg) return;
    const sb = box(svg.getBoundingClientRect());
    const k = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? sb.x1 - sb.x0 > 0 ? (sb.x1 - sb.x0) / svg.viewBox.baseVal.width : 1 : 1;
    const t = tol * k;
    const labels = [...svg.querySelectorAll('text')].filter(el => {
      if (el.closest('defs, clipPath, mask, marker, pattern, symbol')) return false;
      if (!el.textContent.trim()) return false;
      /* NOT visibility: a card still arriving is hidden for a frame, and its labels are what is under test. */
      for (let n = el; n && n !== svg; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || Number(cs.opacity) === 0) return false;
      }
      return true;
    }).map(el => {
      /* THE GLYPHS' BOX AS DRAWN (a Range is empty on SVG text). */
      return { el, b: box(el.getBoundingClientRect()), s: el.textContent.trim().slice(0, 30) };
    }).filter(l => l.b.x1 > l.b.x0);
    const say = [];
    labels.forEach(l => {
      if (l.b.x0 < sb.x0 - t || l.b.x1 > sb.x1 + t || l.b.y0 < sb.y0 - t || l.b.y1 > sb.y1 + t) say.push(`"${l.s}" leaves the viewBox`);
    });
    for (let a = 0; a < labels.length; a++) for (let c = a + 1; c < labels.length; c++) {
      const A = labels[a], B = labels[c];
      if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const ox = Math.min(A.b.x1, B.b.x1) - Math.max(A.b.x0, B.b.x0);
      const oy = Math.min(A.b.y1, B.b.y1) - Math.max(A.b.y0, B.b.y0);
      /* LINE BOXES CARRY ASCENT AND DESCENT: stacked lines overlap a little by design, so a third of the shorter one is the line. */
      const h = Math.min(A.b.y1 - A.b.y0, B.b.y1 - B.b.y0);
      if (ox > t && oy > Math.max(t, h / 3)) say.push(`"${A.s}" overlaps "${B.s}"`);
    }
    if (say.length) bad.push({ i: Number(card.dataset.i), say });
  });
  return bad;
}

(async () => {
  const list = figures();
  const srv = http.createServer((rq, rs) => {
    const f = path.join(ROOT, decodeURI(rq.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); }
    rs.writeHead(200, { 'content-type': { '.css': 'text/css', '.html': 'text/html', '.woff2': 'font/woff2' }[path.extname(f)] || 'text/plain' });
    rs.end(fs.readFileSync(f));
  });
  await new Promise(d => srv.listen(0, d));
  const port = srv.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: 800 } });
  const bad = [];
  const N = 150;
  for (let s = 0; s < list.length; s += N) {
    const part = list.slice(s, s + N);
    const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="http://127.0.0.1:${port}/style.css"></head>`
      + `<body><main id="screen"><section class="screen card-grid">${part.map((d, i) => cardHtml(d, s + i)).join('')}</section></main></body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    (await page.evaluate(inspect, TOL)).forEach(b => bad.push({ id: list[b.i].id, say: b.say }));
  }
  await browser.close(); srv.close();
  /* THE FIGURES THAT FAILED BEFORE THIS CHECK, each with its count of faults: a ratchet, so the list only shrinks (--write rewrites it). */
  const BASE = path.join(__dirname, 'fig-labels-baseline.json');
  if (process.argv.includes('--write')) {
    const o = {}; bad.forEach(b => { o[b.id] = b.say.length; });
    fs.writeFileSync(BASE, JSON.stringify(o, null, 1) + '\n');
    console.log(`check/fig-labels.js: wrote ${bad.length} known figure(s) to check/fig-labels-baseline.json`);
    return;
  }
  let base = {}; try { base = JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch (e) { /* none: every fault is new */ }
  const fresh = bad.filter(b => !(b.id in base) || b.say.length > base[b.id]);
  if (fresh.length) {
    console.log(`check/fig-labels.js: ${fresh.length} of ${list.length} figures have labels that overlap or leave the drawing at ${W}:`);
    fresh.slice(0, 40).forEach(b => console.log('  ' + b.id + ': ' + b.say.slice(0, 4).join('; ') + (b.say.length > 4 ? ` (+${b.say.length - 4})` : '')));
    process.exit(1);
  }
  const mended = Object.keys(base).filter(k => !bad.some(b => b.id === k));
  console.log(`check/fig-labels.js: ${list.length} figures at ${W}, no new label overlap or overflow (${bad.length} known in the baseline`
    + (mended.length ? `; ${mended.length} now pass, run --write to drop them` : '') + ')');
})().catch(e => { console.log('check/fig-labels.js: ' + e.stack); process.exit(1); });
