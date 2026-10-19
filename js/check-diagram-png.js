#!/usr/bin/env node
/* node js/check-diagram-png.js — EVERY DRAWING IN THE LIBRARY HAS ITS PNG TWIN, AND EVERY TWIN A DRAWING § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const REPO = path.resolve(__dirname, '..');
const DIR = path.join(REPO, 'data', 'diagrams');
const bad = [];

let rows = [];
try { rows = JSON.parse(fs.readFileSync(path.join(REPO, 'data', 'questions.json'), 'utf8')); }
catch (e) { console.log('data/questions.json could not be read (' + e.message + '), so NOTHING was checked — not a pass.'); process.exit(1); }

const nameOf = svg => crypto.createHash('sha256').update(String(svg), 'utf8').digest('hex').slice(0, 12);
const widthOf = svg => {
  let w = 0;
  (String(svg).match(/<svg\b[^>]*>/gi) || []).forEach(t => {
    const vb = /\bviewBox="\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/i.exec(t);
    const wd = /\bwidth="([\d.]+)(?:px)?"/i.exec(t);
    w = Math.max(w, Math.round(Number(wd ? wd[1] : vb ? vb[1] : 340)) || 340);
  });
  return w || 340;
};

const drawings = new Map();           // hash -> { svg, rows: [row_id] }
let cells = 0;
rows.forEach(r => {
  const svg = r && typeof r.diagram === 'string' ? r.diagram : '';
  if (!svg.trim()) return;
  cells++;
  if (!/^\s*<svg\b/i.test(svg)) { bad.push(r.row_id + ': its diagram is not an <svg> — the email cannot draw it'); return; }
  const h = nameOf(svg);
  if (!drawings.has(h)) drawings.set(h, { svg: svg, rows: [] });
  drawings.get(h).rows.push(r.row_id);
});
if (!drawings.size) { console.log('no drawing found in data/questions.json, so NOTHING was checked — not a pass.'); process.exit(1); }

/* 1. EVERY DRAWING HAS ITS TWIN, A REAL PNG OF ITS WIDTH. */
let files = [];
try { files = fs.readdirSync(DIR); } catch (e) { files = []; }
const have = new Set(files);
let bytes = 0;
const missing = [], wrong = [];
drawings.forEach((d, h) => {
  const f = h + '.png';
  if (!have.has(f)) { missing.push(f + ' (' + d.rows.slice(0, 2).join(', ') + (d.rows.length > 2 ? ', …' : '') + ')'); return; }
  const buf = fs.readFileSync(path.join(DIR, f));
  bytes += buf.length;
  const png = buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.toString('latin1', 12, 16) === 'IHDR';
  const px = png ? buf.readUInt32BE(16) : 0, w = widthOf(d.svg);
  if (!png || (Math.abs(px - w) > 1 && Math.abs(px - 2 * w) > 2)) wrong.push(f + ' (' + (png ? px + ' px wide for a drawing ' + w + ' wide' : 'not a PNG') + ')');
});
if (missing.length) bad.push(missing.length + ' drawing(s) with no PNG twin — run node tools/diagram_png.js: ' + missing.slice(0, 5).join('; '));
if (wrong.length) bad.push(wrong.length + ' twin(s) that are not a PNG of the drawing’s width — run node tools/diagram_png.js --force: ' + wrong.slice(0, 5).join('; '));

/* 2. NO TWIN OF NO DRAWING, and nothing else in the folder. */
const orphans = files.filter(f => !/^[0-9a-f]{12}\.png$/.test(f) || !drawings.has(f.slice(0, 12)));
if (orphans.length) bad.push(orphans.length + ' file(s) in data/diagrams/ that are no drawing’s twin — run node tools/diagram_png.js, which removes them: ' + orphans.slice(0, 5).join(', '));

/* 3. THE BACKEND'S NAME FOR EACH DRAWING IS THE SAME — through the real `digestDiagram_`. */
let asked = 0;
try {
  const { world } = require('./check-mail-load.js');
  const { b, G } = world();
  const site = 'https://example.org/family/';
  G.__D = [...drawings.values()].map(d => d.svg);
  const got = JSON.parse(JSON.stringify(b.ev('__D.map(s => digestDiagram_(s, ' + JSON.stringify(site) + '))')));
  const keys = [...drawings.keys()], svgs = [...drawings.values()].map(d => d.svg);
  const off = [];
  got.forEach((g, i) => {
    asked++;
    const label = /\baria-label="([^"]*)"/i.exec(svgs[i]);
    const want = site + 'data/diagrams/' + keys[i] + '.png';
    if (!g || g.src !== want || g.width !== widthOf(svgs[i]) || !label || g.alt.length < 3
        || g.html.indexOf('<img src="' + want + '" width="' + widthOf(svgs[i]) + '" alt="') === -1 || g.text !== '[Picture: ' + g.alt + ']')
      off.push(keys[i] + ' → ' + JSON.stringify(g && { src: g.src, width: g.width, alt: (g.alt || '').slice(0, 40) }));
  });
  if (off.length) bad.push(off.length + ' drawing(s) the backend names otherwise than the tool (digestDiagram_ against tools/diagram_png.js): ' + off.slice(0, 3).join('; '));
} catch (e) {
  bad.push('the backend could not be asked how it names a drawing (' + (e && e.message || e) + ') — not a pass');
}

console.log(cells + ' diagram cells, ' + drawings.size + ' drawings, ' + (drawings.size - missing.length) + ' PNG twins ('
  + (bytes / 1048576).toFixed(1) + ' MB); ' + asked + ' named by the backend.');
if (bad.length) {
  console.log('FAILED — ' + bad.length + ' thing(s):');
  bad.forEach(x => console.log('  ' + x));
  process.exit(1);
}
console.log('OK — every drawing has its PNG twin, named as the backend names it, and no twin is orphaned.');
