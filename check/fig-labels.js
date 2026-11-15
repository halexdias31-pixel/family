#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/fig-labels.js EVERY LIBRARY FIGURE IN A QUESTION CARD AT 390 AND 820: no label touches another label, a drawn line or arc, or the edge (owner, 13 and 15 Nov). */
const LF = require('./lib-full.js');
LF.needWords();
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
/* A PHONE AND AN IPAD (owner, 15 Nov: the photos were an iPad's). */
const WIDTHS = [390, 820];
/* HALF A USER UNIT EACH WAY: a stroke's own half-width, and glyph boxes include side bearings, so a kiss is not a fault. */
const TOL = 0.5;
/* THE PLACER UNDER TEST (js/fig-place.js), run as the app runs it; --bare measures the figures as the data draws them. */
const BARE = process.argv.includes('--bare');
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

/* BOTH PLACES A QUESTION'S FIGURE IS DRAWN: among the words (qsheet-stem) and as the pen's page (padWrap_, `.qpad-art`). */
/* The pen's page is not a <figure>: its labels took the card's text size (owner's iPad photos, 15 Nov). */
const cardHtml = (d, i) => `<div class="card fc kc" data-i="${i}"><div class="kc-lines"><div class="qsheet-stem qtext qb-stem kc-lines"><figure>${d.svg}</figure></div>`
  + `<div class="qp-area"><div class="qpad"><div class="qpad-art">${d.svg}</div></div></div></div></div>`;

/* IN THE FIGURE'S UNITS: each label's ink (cap height to baseline), each stroke sampled every unit (a grid line is paper). */
/* No label may touch another label, a stroke, or the edge (owner, 15 Nov: "no text may overlap any line, arc or other text"). */
function inspect(tol) {
  const bad = [];
  const SKIP = 'defs, clipPath, mask, marker, pattern, symbol';
  const seen = el => { for (let n = el; n && n.tagName !== 'svg'; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || Number(cs.opacity) === 0) return false; } return true; };
  document.querySelectorAll('[data-i]').forEach(card => {
    card.querySelectorAll('figure > svg, .qpad-art > svg:first-child').forEach(svg => {
    const where = svg.parentElement.tagName === 'FIGURE' ? 'words' : 'pen';
    const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : null;
    let inv; try { inv = svg.getScreenCTM().inverse(); } catch (e) { return; }
    const toUser = el => inv.multiply(el.getScreenCTM());
    const labels = [];
    svg.querySelectorAll('text').forEach(el => {
      if (el.closest(SKIP) || !el.textContent.trim() || !seen(el) || el.parentElement.closest('text')) return;
      const bb = el.getBBox(); if (!bb.width) return;
      const fs = parseFloat(getComputedStyle(el).fontSize) || 12;
      const m = toUser(el);
      const lines = Math.max(1, Math.round(bb.height / (fs * 1.15)));
      const desc = lines === 1 && /[gjpqy(),;]/.test(el.textContent);
      /* A LINE BOX IS ASCENT+DESCENT (about 1.1em); the ink is about .72em above the baseline, which sits .2em above the box's foot. */
      const top = bb.y + (lines === 1 ? bb.height - 0.22 * fs - 0.74 * fs : 0.1 * fs), bot = bb.y + bb.height - (desc ? 0 : 0.2 * fs);
      const xs = [m.a * bb.x + m.c * top + m.e, m.a * (bb.x + bb.width) + m.c * bot + m.e], ys = [m.b * bb.x + m.d * top + m.f, m.b * (bb.x + bb.width) + m.d * bot + m.f];
      labels.push({ el, s: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 24), x0: Math.min(...xs) + tol, x1: Math.max(...xs) - tol, y0: Math.min(...ys) + tol, y1: Math.max(...ys) - tol });
    });
    const say = [];
    if (vb) labels.forEach(l => { if (l.x0 < vb.x - tol || l.x1 > vb.x + vb.width + tol || l.y0 < vb.y - tol || l.y1 > vb.y + vb.height + tol) say.push(`"${l.s}" leaves the viewBox`); });
    for (let a = 0; a < labels.length; a++) for (let c = a + 1; c < labels.length; c++) {
      const A = labels[a], B = labels[c];
      if (Math.min(A.x1, B.x1) > Math.max(A.x0, B.x0) && Math.min(A.y1, B.y1) > Math.max(A.y0, B.y0)) say.push(`"${A.s}" overlaps "${B.s}"`);
    }
    const hit = new Set();
    svg.querySelectorAll('line, path, polyline, polygon, rect, circle, ellipse').forEach(g => {
      if (g.closest(SKIP) || g.classList.contains('grid') || !seen(g)) return;
      const cs = getComputedStyle(g);
      if (cs.stroke === 'none' || !(parseFloat(cs.strokeWidth) > 0.05) || Number(cs.strokeOpacity) === 0) return;
      let len; try { len = g.getTotalLength(); } catch (e) { return; }
      if (!(len > 0)) return;
      const m = toUser(g), n = Math.min(4000, Math.ceil(len));
      for (let i = 0; i <= n; i++) {
        const p = g.getPointAtLength(len * i / n), x = m.a * p.x + m.c * p.y + m.e, y = m.b * p.x + m.d * p.y + m.f;
        labels.forEach(l => { if (!hit.has(l) && x > l.x0 && x < l.x1 && y > l.y0 && y < l.y1) { hit.add(l); say.push(`"${l.s}" sits on a ${g.tagName === 'path' ? 'path or arc' : g.tagName}`); } });
      }
    });
    if (say.length) bad.push({ i: Number(card.dataset.i), say: say.map(x => where + ' ' + x) });
    });
  });
  return bad;
}

(async () => {
  const list = figures();
  const srv = http.createServer((rq, rs) => {
    const f = path.join(ROOT, decodeURI(rq.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); }
    rs.writeHead(200, { 'content-type': { '.css': 'text/css', '.html': 'text/html', '.woff2': 'font/woff2', '.js': 'text/javascript' }[path.extname(f)] || 'text/plain' });
    rs.end(fs.readFileSync(f));
  });
  await new Promise(d => srv.listen(0, d));
  const port = srv.address().port;
  const browser = await chromium.launch();
  const bad = [];
  const N = 150;
  const place = !BARE && fs.existsSync(path.join(ROOT, 'js', 'fig-place.js'));
  for (const W of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: W, height: 800 } });
    for (let s = 0; s < list.length; s += N) {
      const part = list.slice(s, s + N);
      const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="http://127.0.0.1:${port}/style.css"></head>`
        + `<body><main id="screen"><section class="screen card-grid">${part.map((d, i) => cardHtml(d, s + i)).join('')}</section></main>`
        + (place ? `<script src="http://127.0.0.1:${port}/js/fig-place.js"></script>` : '') + `</body></html>`;
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      if (place) await page.evaluate(() => figPlace_(document));
      (await page.evaluate(inspect, TOL)).forEach(b => {
        const id = list[b.i].id, had = bad.find(x => x.id === id);
        if (!had) bad.push({ id, say: b.say.map(x => W + ' ' + x) });
        else had.say = had.say.concat(b.say.map(x => W + ' ' + x));
      });
    }
    await page.close();
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
    console.log(`check/fig-labels.js: ${fresh.length} of ${list.length} figures have labels that overlap or leave the drawing at ${WIDTHS.join(' or ')}:`);
    (process.argv.includes('--all') ? fresh : fresh.slice(0, 40)).forEach(b => console.log('  ' + b.id + ': ' + b.say.slice(0, 4).join('; ') + (b.say.length > 4 ? ` (+${b.say.length - 4})` : '')));
    process.exit(1);
  }
  const mended = Object.keys(base).filter(k => !bad.some(b => b.id === k));
  console.log(`check/fig-labels.js: ${list.length} figures at ${WIDTHS.join(' and ')}, no new label overlap or overflow (${bad.length} known in the baseline`
    + (mended.length ? `; ${mended.length} now pass, run --write to drop them` : '') + ')');
})().catch(e => { console.log('check/fig-labels.js: ' + e.stack); process.exit(1); });
