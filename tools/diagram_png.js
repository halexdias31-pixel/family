#!/usr/bin/env node
/* @family. — tools/diagram_png.js THE PNG TWIN OF EVERY DRAWING IN THE LIBRARY, FOR THE SUNDAY EMAIL § */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const REPO = path.resolve(__dirname, '..');
const OUT = path.join(REPO, 'data', 'diagrams');
const arg = k => { const a = process.argv.find(x => x === '--' + k || x.startsWith('--' + k + '=')); return a ? (a.split('=')[1] || true) : null; };
const FORCE = !!arg('force');
const SCALE = Number(arg('scale')) || 2;
/* THE SCREEN'S LOOK BY DEFAULT — light lines on the card's #0b0b0b, opaque, as the site draws a figure (20 Oct, 380); `--palette=paper` for cream. */
const PAPER = arg('palette') === 'paper';

/* THE NAME — written once here and once in the backend (`digestDiagram_`), and check-diagram-png.js holds
   the two to each other over every drawing. */
const nameOf = svg => crypto.createHash('sha256').update(String(svg), 'utf8').digest('hex').slice(0, 12);
/* THE DRAWING'S OWN WIDTH: its viewBox's, the widest when a cell holds two (one does: Figures 4 and 5). */
const widthOf = svg => {
  let w = 0;
  (String(svg).match(/<svg\b[^>]*>/gi) || []).forEach(t => {
    const vb = /\bviewBox="\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/i.exec(t);
    const wd = /\bwidth="([\d.]+)(?:px)?"/i.exec(t);
    w = Math.max(w, Math.round(Number(wd ? wd[1] : vb ? vb[1] : 340)) || 340);
  });
  return w || 340;
};

function drawings() {
  const rows = JSON.parse(fs.readFileSync(path.join(REPO, 'data', 'questions.json'), 'utf8'));
  const all = new Map();
  rows.forEach(r => {
    const svg = r && typeof r.diagram === 'string' ? r.diagram : '';
    if (!/^\s*<svg\b/i.test(svg)) return;
    const h = nameOf(svg);
    if (!all.has(h)) all.set(h, svg);
  });
  return all;
}

async function main() {
  const all = drawings();
  fs.mkdirSync(OUT, { recursive: true });
  const have = new Set(fs.readdirSync(OUT).filter(f => /^[0-9a-f]{12}\.png$/.test(f)).map(f => f.slice(0, 12)));
  /* A TWIN WHOSE DRAWING IS GONE GOES — the check fails on one, and the folder is this tool's. */
  let removed = 0;
  have.forEach(h => { if (!all.has(h)) { fs.unlinkSync(path.join(OUT, h + '.png')); removed++; } });
  const todo = [...all.keys()].filter(h => FORCE || !have.has(h));
  console.log(all.size + ' drawings; ' + todo.length + ' to draw; ' + removed + ' twin(s) of no drawing removed.');
  if (!todo.length) return report(all);

  const { chromium } = require('playwright');
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome']
    .find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const css = fs.readFileSync(path.join(REPO, 'style.css'), 'utf8');
  /* THE CARD'S WRAPPER AND ITS GROUND: the card's black and the screen's ink, so `currentColor` lines come out light; nothing transparent, so no client shows a box. */
  const bg = PAPER ? 'var(--paper)' : '#0b0b0b', fg = PAPER ? 'var(--paper-ink)' : 'var(--ink)';
  const page0 = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style><style>
    html, body { background: ${bg} !important; margin: 0 !important; padding: 0 !important; max-width: none !important; }
    .qcard.qfig { background: ${bg} !important; color: ${fg} !important; border: 0 !important;
                  padding: 0 !important; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; display: inline-block; }
    .qcard.qfig .qsheet { color: ${fg}; }
    .qcard.qfig figure { margin: 0 !important; padding: 0 !important; line-height: 0; display: inline-block; background: ${bg}; }
    .qcard.qfig figure svg { display: block; height: auto; }
  </style></head><body><div class="qcard qfig"><div class="qsheet"><figure id="fig"></figure></div></div></body></html>`;
  const LANES = 4;
  let next = 0, done = 0;
  const lane = async () => {
    const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: SCALE });
    await page.setContent(page0, { waitUntil: 'load' });
    while (next < todo.length) {
      const h = todo[next++], svg = all.get(h), w = widthOf(svg);
      await page.evaluate(([html, width]) => {
        const f = document.getElementById('fig');
        f.innerHTML = html;
        f.style.width = width + 'px';
        f.querySelectorAll(':scope > svg').forEach(s => { s.style.width = width + 'px'; s.style.maxWidth = 'none'; });
      }, [svg, w]);
      await (await page.$('#fig')).screenshot({ path: path.join(OUT, h + '.png'), omitBackground: false });
      if (++done % 200 === 0) console.log('  ' + done + ' of ' + todo.length);
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: LANES }, lane));
  await browser.close();
  report(all);
}

/* WHAT THE FOLDER WEIGHS — it is in git and on GitHub Pages, so the number is said every run. */
function report(all) {
  let bytes = 0, n = 0;
  all.forEach((svg, h) => { const f = path.join(OUT, h + '.png'); if (fs.existsSync(f)) { bytes += fs.statSync(f).size; n++; } });
  console.log(n + ' PNG twins in data/diagrams/, ' + (bytes / 1048576).toFixed(1) + ' MB.');
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
