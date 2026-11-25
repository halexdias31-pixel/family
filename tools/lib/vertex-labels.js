/* @family. — tools/lib/vertex-labels.js THE LETTERS AT A SHAPE'S CORNERS (owner, 25 Nov: Corbettmaths and First Class Maths shapes lost the
   A, B, C the PDF prints). One place says which corner letters a question names, which its figure draws, and puts back the ones a drawing
   dropped where its own description fixes the corner: tools/content.js `figures` runs it on every figure it imports, tools/vertex-letters.js
   checks every figure (and, with --write, mends those already in the library). */
'use strict';

/* THE LETTERS A QUESTION NAMES as corners: "triangle ABC", "angle ABC", "side AB", "AB = 5 cm", "ABCDE is a pentagon" */
const SHAPE = 'triangle|angle|side|sides|line|lines|segment|quadrilateral|rectangle|square|kite|parallelogram|trapezium|rhombus|polygon|pentagon|hexagon|heptagon|octagon|points?|vertex|vertices|chord|arc|sector';
const NAMES = new RegExp('\\b(?:' + SHAPE + ')\\s+((?:[A-Z]\\s?){2,8})\\b|\\b([A-Z]{2,8})\\s*(?:=|is an?\\s+(?:' + SHAPE + '))|∠\\s*([A-Z]{3})', 'g');
const plain = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;|&#\d+;/gi, ' ').replace(/\s+/g, ' ');
function named(html) {
  const out = new Set(), t = plain(html);
  let m;
  NAMES.lastIndex = 0;
  while ((m = NAMES.exec(t))) { const s = (m[1] || m[2] || m[3] || '').replace(/\s/g, ''); if (/^[A-Z]{2,8}$/.test(s)) s.split('').forEach(c => out.add(c)); }
  return out;
}
/* THE LETTERS THE CHILD IS ASKED TO PUT THERE: "the coordinates of D", "Complete a possible trapezium ABCD", "plot C" -- not the drawing's to show */
function asked(html) {
  const t = plain(html), out = new Set();
  [/coordinates of (?:the )?(?:point |vertex )?([A-Z])\b/g, /\b(?:plot|mark|draw|label) (?:the )?(?:point |points |vertex )?([A-Z](?:\s*(?:,|and)\s*[A-Z])*)\b/gi].forEach(re => {
    let m; while ((m = re.exec(t))) (m[1] || '').replace(/[^A-Z]/g, '').split('').forEach(c => out.add(c)); });
  /* "Complete a possible trapezium ABCD" / "draw quadrilateral CDEF": the corners not drawn yet are the child's */
  const c = /\b(?:complete|draw) (?:a |the )?(?:possible )?(?:\w+ )?([A-Z]{3,8})\b/i.exec(t);
  if (c) c[1].split('').forEach(x => out.add(x));
  /* "work out possible coordinates of B" */
  const p = /possible coordinates (?:of|for) (?:the )?(?:point |vertex )?([A-Z])\b/.exec(t);
  if (p) out.add(p[1]);
  /* "C = (1, 2)": a point given by its coordinates in the words, not on the drawing */
  [...t.matchAll(/\b([A-Z])\s*=\s*\(/g)].forEach(m => out.add(m[1]));
  return out;
}
/* THE LETTERS A FIGURE DRAWS: a <text> that is one capital (with a dash or prime) */
function drawn(svg) {
  const out = new Set(), re = /<text\b[^>]*>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(String(svg || '')))) { const t = plain(m[1]).trim(); if (/^[A-Z]['′]?$/.test(t)) out.add(t[0]); }
  return out;
}
/* ---------- MENDING: the corner a dropped letter belongs at, from the drawing's own words ---------- */
const num = s => Number(String(s).replace(/&amp;minus;|&minus;|−/g, '-'));
/* every polygon or straight-sided path's corners, in order */
function shapesOf(svg) {
  const out = [];
  String(svg).replace(/<polygon\b[^>]*\bpoints="([^"]+)"/g, (m, p) => { const v = p.trim().split(/[\s,]+/).map(Number); const pts = []; for (let i = 0; i + 1 < v.length; i += 2) pts.push([v[i], v[i + 1]]); out.push(pts); return m; });
  String(svg).replace(/<path\b[^>]*\bd="(M[^"]*)"/g, (m, d) => {
    if (/[CcQqAaSsTt]/.test(d)) return m;
    const pts = (d.match(/-?[\d.]+\s*[ ,]\s*-?[\d.]+/g) || []).map(s => s.split(/[\s,]+/).map(Number));
    if (pts.length >= 3) { const f = pts[0], l = pts[pts.length - 1]; if (Math.hypot(f[0] - l[0], f[1] - l[1]) < 1) pts.pop(); out.push(pts); }
    return m;
  });
  return out;
}
const labelsOf = svg => { const out = []; String(svg).replace(/<text\b([^>]*)>([^<]*)<\/text>/g, (m, a, t) => {
  const x = /\bx="(-?[\d.]+)"/.exec(a), y = /\by="(-?[\d.]+)"/.exec(a);
  if (x && y && /^[A-Z]$/.test(t.trim())) out.push({ c: t.trim(), x: +x[1], y: +y[1], raw: m, attrs: a });
  return m; }); return out; };
/* THE LETTER, outside its corner: 13px from the corner, away from the shape's middle, in the drawing's own label look */
function put(svg, c, at, mid, like) {
  const dx = at[0] - mid[0], dy = at[1] - mid[1], d = Math.hypot(dx, dy) || 1;
  const x = (at[0] + dx / d * 13).toFixed(1), y = (at[1] + dy / d * 13 + 4).toFixed(1);
  const attrs = like ? like.replace(/\s*\bx="[^"]*"/, '').replace(/\s*\by="[^"]*"/, '').replace(/\s*\bstyle="[^"]*"/, '').trim() : 'fill="currentColor" font-size="12"';
  return svg.replace(/<\/svg>\s*$/, '<text x="' + x + '" y="' + y + '" ' + attrs + ' style="text-anchor:middle" data-vertex="' + c + '">' + c + '</text></svg>');
}
const middle = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
/* (a) THE DESCRIPTION GIVES EACH CORNER'S COORDINATES ("Triangle ABC: A(1, 3), B(3, 3), C(3, 2)") and a shape has those corners in that order:
   the grid's scale read off the shape itself, each letter put at its corner; a lone shape-name letter in its middle (the old "Shape A") goes */
function byCoords(svg, want) {
  const aria = (/aria-label="([^"]*)"/.exec(svg) || [])[1] || '';
  const pairs = [...aria.matchAll(/\b([A-Z])\s*\(\s*(-?[\d.]+|&amp;minus;[\d.]+|&minus;[\d.]+)\s*,\s*(-?[\d.]+|&amp;minus;[\d.]+|&minus;[\d.]+)\s*\)/g)].map(m => ({ c: m[1], x: num(m[2]), y: num(m[3]) }));
  if (pairs.length < 3) return null;
  const shape = shapesOf(svg).find(s => s.length === pairs.length);
  if (!shape) return null;
  const xs = pairs.map(p => p.x), ys = pairs.map(p => p.y);
  const i = xs.findIndex(v => v !== xs[0]), j = ys.findIndex(v => v !== ys[0]);
  if (i < 0 || j < 0) return null;
  const sx = (shape[i][0] - shape[0][0]) / (xs[i] - xs[0]), sy = (shape[j][1] - shape[0][1]) / (ys[j] - ys[0]);
  const fits = pairs.every((p, k) => Math.abs(shape[0][0] + (p.x - xs[0]) * sx - shape[k][0]) < 1.5 && Math.abs(shape[0][1] + (p.y - ys[0]) * sy - shape[k][1]) < 1.5);
  if (!fits) return null;
  const mid = middle(shape), like = (labelsOf(svg)[0] || {}).attrs;
  let out = svg;
  labelsOf(svg).forEach(l => { if (Math.hypot(l.x - mid[0], l.y - 4 - mid[1]) < 20 && pairs.some(p => p.c === l.c)) out = out.replace(l.raw, ''); });
  const have = drawn(out);
  pairs.forEach((p, k) => { if (want.has(p.c) && !have.has(p.c)) out = put(out, p.c, shape[k], mid, like); });
  return out;
}
/* (b) A NAMED POLYGON ("Pentagon ABCDE") WITH EVERY CORNER LETTERED BUT ONE: the one letter left goes to the one corner left */
function byPolygon(svg, want) {
  const aria = (/aria-label="([^"]*)"/.exec(svg) || [])[1] || '';
  const name = (/\b(?:triangle|quadrilateral|pentagon|hexagon|heptagon|octagon|polygon)\s+([A-Z]{3,8})\b/i.exec(aria) || [])[1];
  if (!name) return null;
  const shape = shapesOf(svg).find(s => s.length === name.length);
  if (!shape) return null;
  const labs = labelsOf(svg), took = new Set(), left = [];
  shape.forEach(v => { const l = labs.filter(l => name.indexOf(l.c) >= 0 && !took.has(l.c)).map(l => ({ l, d: Math.hypot(l.x - v[0], l.y - 4 - v[1]) })).sort((a, b) => a.d - b.d)[0];
    if (l && l.d < 30) took.add(l.l.c); else left.push(v); });
  const lost = name.split('').filter(c => !took.has(c) && want.has(c));
  if (left.length !== 1 || lost.length !== 1) return null;
  return put(svg, lost[0], left[0], middle(shape), (labs[0] || {}).attrs);
}
/* THE LETTERS A FIGURE OWES: named by its question, not the child's to place, not drawn */
function owed(svg, html) {
  const want = named(html), ask = asked(html), have = drawn(svg);
  return [...want].filter(c => !ask.has(c) && !have.has(c));
}
/* THE ONE MENDER: a figure given every letter its question names that the drawing can say where; unchanged when it cannot */
function mend(svg, html) {
  if (!/^\s*<svg\b/i.test(String(svg || ''))) return svg;
  if (!owed(svg, html).length) return svg;
  const want = new Set(named(html));
  return byCoords(svg, want) || byPolygon(svg, want) || svg;
}
module.exports = { named, asked, drawn, owed, mend };
