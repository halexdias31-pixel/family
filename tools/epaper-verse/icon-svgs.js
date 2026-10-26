/* icon-svgs.js - an original 1-bit drawing of every icon in data/icons.json into its `svg`, and verse.cpp's verses into data/eink-verses.json (470). */
// node tools/epaper-verse/icon-svgs.js [--check]   Traditional compositions from parts here; nothing traced. Black on white only.
'use strict';
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', '..', 'data', 'icons.json');
const W = 120, H = 160;
const r1 = n => Math.round(n * 10) / 10;

/* ---------- THE PARTS ---------- */
const P = (d, a = '') => `<path d="${d}"${a}/>`;
const C = (x, y, r, a = '') => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}"${a}/>`;
const E = (x, y, rx, ry, a = '') => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}"${a}/>`;
const L = (x1, y1, x2, y2, a = '') => `<path d="M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}"${a}/>`;
const R = (x, y, w, h, a = '') => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"${a}/>`;
const BLK = ' fill="#000"', WHT = ' fill="#fff"', THIN = ' stroke-width="0.9"';
const T = (x, y, s, t) => `<text x="${r1(x)}" y="${r1(y)}" font-size="${s}" font-family="serif" text-anchor="middle" fill="#000" stroke="none">${t}</text>`;
const g = (dx, dy, k, inner) => `<g transform="translate(${r1(dx)} ${r1(dy)}) scale(${k})">${inner}</g>`;

const frame = () => R(3, 3, 114, 154) + R(7, 7, 106, 146, THIN);
function halo(x, y, r, cross) {
  let s = C(x, y, r, WHT) + C(x, y, r - 1.6, THIN);
  if (cross) [[0, -1], [-1, 0], [1, 0]].forEach(([u, v]) => {
    const a = r * 0.62;
    s += P(`M${r1(x + u * a - v * 2.2)} ${r1(y + v * a - u * 2.2)}L${r1(x + u * r - v * 3)} ${r1(y + v * r - u * 3)}M${r1(x + u * a + v * 2.2)} ${r1(y + v * a + u * 2.2)}L${r1(x + u * r + v * 3)} ${r1(y + v * r + u * 3)}`);
  });
  return s;
}
/* A face: o.beard, o.hair ('long' | 'short' | 'white'), o.veil (the maphorion, black), o.dark (a face blackened by age). */
function face(x, y, s, o = {}) {
  let out = '';
  if (o.veil) out += P(`M${x - s * 1.25} ${y + s * 1.6}Q${x - s * 1.3} ${y - s * 1.45} ${x} ${y - s * 1.45}Q${x + s * 1.3} ${y - s * 1.45} ${x + s * 1.25} ${y + s * 1.6}Z`, BLK);
  if (o.hair === 'long') out += P(`M${x - s * 0.95} ${y + s * 1.5}Q${x - s * 1.1} ${y - s * 1.25} ${x} ${y - s * 1.2}Q${x + s * 1.1} ${y - s * 1.25} ${x + s * 0.95} ${y + s * 1.5}Z`, BLK);
  if (o.hair === 'short') out += P(`M${x - s * 0.85} ${y}Q${x - s * 0.95} ${y - s * 1.2} ${x} ${y - s * 1.15}Q${x + s * 0.95} ${y - s * 1.2} ${x + s * 0.85} ${y}Z`, BLK);
  if (o.beard) out += P(`M${x - s * 0.62} ${y + s * 0.1}Q${x - s * 0.5} ${y + s * (o.beard === 'long' ? 1.9 : 1.45)} ${x} ${y + s * (o.beard === 'long' ? 2.1 : 1.55)}Q${x + s * 0.5} ${y + s * (o.beard === 'long' ? 1.9 : 1.45)} ${x + s * 0.62} ${y + s * 0.1}`, o.beard === 'white' ? WHT : (o.dark ? BLK : BLK));
  out += E(x, y, s * 0.68, s * 0.92, o.dark ? BLK : WHT);
  const ink = o.dark ? ' stroke="#fff"' : '';
  if (o.hair === 'white') out += P(`M${x - s * 0.68} ${y - s * 0.1}Q${x - s * 0.6} ${y - s * 0.95} ${x} ${y - s * 0.95}`, THIN);
  out += P(`M${x - s * 0.42} ${y - s * 0.12}q${s * 0.16} ${-s * 0.12} ${s * 0.3} 0M${x + s * 0.12} ${y - s * 0.12}q${s * 0.16} ${-s * 0.12} ${s * 0.3} 0`, THIN + ink);
  out += P(`M${x} ${y - s * 0.05}L${x - s * 0.06} ${y + s * 0.38}h${s * 0.12}M${x - s * 0.14} ${y + s * 0.58}h${s * 0.28}`, THIN + ink);
  return out;
}
/* Shoulders and robe from (x, y) down to `bot`, `w` wide; o.black fills it (the maphorion), o.band a himation across. */
function bust(x, y, w, bot, o = {}) {
  let s = P(`M${x - w / 2} ${bot}Q${x - w / 2} ${y + 6} ${x - w / 5} ${y}L${x + w / 5} ${y}Q${x + w / 2} ${y + 6} ${x + w / 2} ${bot}`, o.black ? BLK : WHT);
  if (!o.black) s += P(`M${x - w / 5} ${y}L${x} ${y + 10}L${x + w / 5} ${y}`, THIN);
  if (o.band) s += P(`M${x + w / 2 - 8} ${y + 10}Q${x} ${y + 30} ${x - w / 2 + 6} ${bot}M${x + w / 2 - 2} ${y + 18}Q${x + 4} ${y + 38} ${x - w / 2 + 16} ${bot}`, THIN);   // the himation over the left shoulder
  if (o.stars) s += star6(x - w / 3, y + 8, 2.6, '#fff') + star6(x + w / 3, y + 8, 2.6, '#fff');
  if (o.omophorion) { s += P(`M${x - w / 2 + 4} ${y + 10}Q${x} ${y + 26} ${x + w / 2 - 4} ${y + 10}M${x - 4} ${y + 18}V${bot}M${x + 4} ${y + 18}V${bot}`, ' stroke-width="1.3"'); [y + 26, y + 40].forEach(cy => cy < bot - 4 && (s += cross(x, cy, 3))); s += cross(x - w / 3, y + 13, 3) + cross(x + w / 3, y + 13, 3); }
  return s;
}
const star6 = (x, y, r, c) => P(`M${x - r} ${y}h${2 * r}M${x} ${y - r}v${2 * r}M${x - r * 0.7} ${y - r * 0.7}l${r * 1.4} ${r * 1.4}M${x + r * 0.7} ${y - r * 0.7}l${-r * 1.4} ${r * 1.4}`, ` stroke="${c}" stroke-width="0.9"`);
const cross = (x, y, r) => P(`M${x - r} ${y}h${2 * r}M${x} ${y - r}v${2 * r}`, ' stroke-width="1.4"');
const hand = (x, y, s = 1) => E(x, y, 3.2 * s, 4 * s, WHT) + P(`M${x - 1 * s} ${y - 3.5 * s}v${-4 * s}M${x + 1 * s} ${y - 3.5 * s}v${-4.5 * s}`, ' stroke-width="1.2"');
const book = (x, y, w = 14, h = 18) => R(x - w / 2, y - h / 2, w, h, WHT) + R(x - w / 2 + 2, y - h / 2 + 2, w - 4, h - 4, THIN) + P(`M${x} ${y - 4}l4 4-4 4-4-4z`, BLK);
const scroll = (x, y, h = 20) => R(x - 3, y - h / 2, 6, h, WHT) + E(x, y - h / 2, 4, 1.6, WHT) + E(x, y + h / 2, 4, 1.6, WHT);
function child(x, y, s, o = {}) {   // the Child: a cruciform halo, a face, a robe and a blessing hand
  return halo(x, y, s * 1.55, true) + bust(x, y + s * 1.05, s * 2.6, y + s * (o.long || 3.4), {}) + face(x, y, s, { hair: 'short' }) + (o.noBless ? '' : hand(x - s * 1.2, y + s * 2.1, s / 6)) + (o.scroll ? scroll(x + s * 0.9, y + s * 2.4, s * 1.6) : '');
}
const ICXC = (y = 18) => T(22, y, 9, 'IC') + T(98, y, 9, 'XC');
const MPOY = (y = 18) => T(22, y, 9, 'MP') + T(98, y, 9, 'ΘY');
const AG = (name, y = 18) => T(24, y, 7, 'Ο ΑΓ.') + T(96, y, 7, name);
/* A whole figure standing, head at (x, y), feet at `bot`; o.arms 'up' | 'out' | 'front'. */
function figure(x, y, s, bot, o = {}) {
  let out = '';
  if (o.halo !== false) out += halo(x, y, s * 1.55, o.cross);
  if (o.wings) out += P(`M${x - 3} ${y + s * 2}Q${x - s * 5} ${y - s} ${x - s * 4.2} ${y + s * 6}Q${x - s * 2} ${y + s * 5} ${x - 3} ${y + s * 4}ZM${x + 3} ${y + s * 2}Q${x + s * 5} ${y - s} ${x + s * 4.2} ${y + s * 6}Q${x + s * 2} ${y + s * 5} ${x + 3} ${y + s * 4}Z`, WHT) + P(`M${x - s * 3.4} ${y + s * 1.5}l${s} ${s * 2.5}M${x + s * 3.4} ${y + s * 1.5}l${-s} ${s * 2.5}`, THIN);
  out += P(`M${x - s * 0.9} ${y + s}L${x - s * 2.3} ${bot}H${x + s * 2.3}L${x + s * 0.9} ${y + s}Z`, o.black ? BLK : WHT);
  if (!o.black) out += P(`M${x - s * 0.5} ${y + s * 2.5}L${x - s * 1.2} ${bot}M${x + s * 0.4} ${y + s * 2.5}L${x + s} ${bot}`, THIN);
  if (o.arms === 'up') out += P(`M${x - s * 1.1} ${y + s * 1.8}L${x - s * 2.4} ${y + s * 0.6}M${x + s * 1.1} ${y + s * 1.8}L${x + s * 2.4} ${y + s * 0.6}`, ' stroke-width="2.2"') + hand(x - s * 2.6, y + s * 0.4, s / 7) + hand(x + s * 2.6, y + s * 0.4, s / 7);
  if (o.arms === 'out') out += P(`M${x - s * 1.1} ${y + s * 1.8}L${x - s * 2.8} ${y + s * 2.6}M${x + s * 1.1} ${y + s * 1.8}L${x + s * 2.8} ${y + s * 2.6}`, ' stroke-width="2.2"');
  out += face(x, y, s, o.face || {});
  return out;
}
const mandorla = (x, y, rx, ry) => E(x, y, rx, ry, WHT) + E(x, y, rx - 4, ry - 4, THIN) + E(x, y, rx - 8, ry - 8, THIN) + [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return L(x + Math.cos(a) * (rx - 8), y + Math.sin(a) * (ry - 8), x + Math.cos(a) * rx, y + Math.sin(a) * ry, THIN); }).join('');
const hill = (x, y, w, h) => P(`M${x - w / 2} ${y}L${x - w / 4} ${y - h * 0.7}l${w * 0.06} ${h * 0.12}L${x} ${y - h}l${w * 0.08} ${h * 0.2}L${x + w / 3} ${y - h * 0.55}L${x + w / 2} ${y}Z`, WHT) + P(`M${x - w / 4} ${y - h * 0.7}l${w * 0.05} ${h * 0.35}M${x} ${y - h}l${-w * 0.03} ${h * 0.4}M${x + w / 3} ${y - h * 0.55}l${-w * 0.04} ${h * 0.3}`, THIN);
const cave = (x, y, w, h) => P(`M${x - w / 2} ${y}Q${x - w / 2} ${y - h} ${x} ${y - h}Q${x + w / 2} ${y - h} ${x + w / 2} ${y}Z`, BLK);
const waves = (x1, x2, y, n = 3) => Array.from({ length: n }, (_, i) => P(`M${x1} ${y + i * 5}` + Array.from({ length: Math.round((x2 - x1) / 10) }, () => 'q2.5 -3 5 0t5 0').join(''), THIN)).join('');
const heads = (pts, s = 4) => pts.map(([x, y]) => halo(x, y, s * 1.5) + face(x, y, s, { hair: 'short' })).join('');
const domes = (x, y, w) => R(x - w / 2, y, w, 16, WHT) + P(`M${x - w / 4} ${y}Q${x - w / 4} ${y - 12} ${x} ${y - 12}Q${x + w / 4} ${y - 12} ${x + w / 4} ${y}`, WHT) + cross(x, y - 16, 3) + P(`M${x - 4} ${y + 16}v-8q4-5 8 0v8`, THIN);
function horse(x, y, dir = 1, black) {   // a horse rearing toward `dir`, its body at (x, y)
  const k = dir;
  return P(`M${x - 18 * k} ${y + 2}L${x - 22 * k} ${y + 24}M${x - 10 * k} ${y + 6}L${x - 8 * k} ${y + 26}M${x + 10 * k} ${y + 4}L${x + 20 * k} ${y + 18}M${x + 14 * k} ${y}L${x + 26 * k} ${y + 8}`, ' stroke-width="2.4"')
    + P(`M${x - 22 * k} ${y - 4}Q${x - 30 * k} ${y + 4} ${x - 28 * k} ${y + 16}`, ' stroke-width="2"')
    + E(x, y, 22, 9, black ? BLK : WHT) + P(`M${x + 16 * k} ${y - 4}L${x + 24 * k} ${y - 18}L${x + 32 * k} ${y - 14}L${x + 22 * k} ${y + 2}Z`, black ? BLK : WHT);
}
const dragon = (x, y, w) => P(`M${x - w / 2} ${y}q${w / 8} -10 ${w / 4} 0t${w / 4} 0t${w / 4} 0t${w / 6} -6l6 -3l-2 6`, ' stroke-width="3.2"');
function rider(x, y, o = {}) {   // a saint on horseback driving a spear down to the left
  return horse(x, y + 26, -1, o.black) + figure(x + 4, y - 4, 5, y + 24, { halo: true }) + L(x - 10, y + 6, x - 44, y + 58, ' stroke-width="1.8"') + (o.foe || dragon(x - 26, y + 64, 50));
}
const wings = (x, y, s) => P(`M${x} ${y}Q${x - s * 2} ${y - s * 2} ${x - s * 2.2} ${y + s * 1.5}ZM${x} ${y}Q${x + s * 2} ${y - s * 2} ${x + s * 2.2} ${y + s * 1.5}Z`, WHT);
const crown = (x, y, w) => P(`M${x - w / 2} ${y}v-5l${w / 4} 3l${w / 4} -5l${w / 4} 5l${w / 4} -3v5z`, BLK);
const mitre = (x, y, w) => P(`M${x - w / 2} ${y}Q${x - w / 2} ${y - w * 0.8} ${x} ${y - w * 0.85}Q${x + w / 2} ${y - w * 0.8} ${x + w / 2} ${y}Z`, BLK) + cross(x, y - w * 0.95, 2.5);

/* ---------- THE THEOTOKOS, IN EACH OF HER TYPES ---------- */
const MOTHER = (x, y, s, o = {}) => halo(x, y, s * 1.6) + bust(x, y + s * 1.3, s * 4.4, o.bot || 153, { black: true, stars: true }) + face(x, y, s, { veil: true, dark: o.dark });
function theotokos(type, extra = '') {
  let s = frame() + MPOY();
  if (type === 'hodegetria') s += MOTHER(52, 50, 13) + child(78, 92, 8) + hand(48, 112, 1.1);
  else if (type === 'frontal') s += MOTHER(60, 50, 13) + child(76, 94, 8) + hand(48, 112, 1.1);
  else if (type === 'eleousa') s += MOTHER(54, 52, 13) + child(72, 66, 8.5, { noBless: true }) + P('M64 92q10 4 18-8', ' stroke-width="2"');
  else if (type === 'platytera') s += figure(60, 36, 11, 153, { arms: 'up', black: true, face: { veil: true } }) + C(60, 98, 15, WHT) + C(60, 98, 13, THIN) + child(60, 94, 5.5);
  else if (type === 'orans') s += figure(60, 36, 11, 153, { arms: 'up', black: true, face: { veil: true } });
  else if (type === 'nikopoios') s += MOTHER(60, 46, 12) + child(60, 98, 8.5) + hand(44, 118, 1.1) + hand(76, 118, 1.1);
  else if (type === 'nursing') s += MOTHER(52, 50, 13) + child(70, 94, 8, { noBless: true }) + C(64, 98, 2, WHT);
  else if (type === 'entreating') s += halo(54, 50, 21) + bust(58, 66, 58, 153, { black: true, stars: true }) + face(54, 50, 13, { veil: true }) + hand(84, 92, 1.2) + hand(90, 104, 1.2);
  else if (type === 'scroll') s += figure(56, 34, 10, 153, { black: true, face: { veil: true } }) + scroll(80, 62, 34) + hand(80, 84, 1);
  else if (type === 'enthroned') s += R(30, 70, 60, 70, WHT) + R(26, 136, 68, 8, WHT) + wings(30, 30, 7) + wings(90, 30, 7) + MOTHER(60, 46, 11, { bot: 136 }) + child(60, 98, 7, { scroll: true });
  else if (type === 'sorrow') s += MOTHER(60, 54, 14) + [-3, -2, -1, 0, 1, 2, 3].map(i => L(60 + i * 12, 150 - Math.abs(i) * 4, 60 + i * 2, 112, ' stroke="#fff" stroke-width="1.8"')).join('');
  return s + extra;
}
const T_ = {   // a named icon is her type and a mark of its own story
  hodegetria: () => theotokos('hodegetria'),
  eleousa: () => theotokos('eleousa'),
  platytera: () => theotokos('platytera'),
  orans: () => theotokos('orans'),
  nikopoios: () => theotokos('nikopoios'),
  galaktotrophousa: () => theotokos('nursing'),
  pantanassa: () => theotokos('enthroned'),
  zoodochos_pigi: () => frame() + MPOY() + P('M24 112h72l-10 22H34z', WHT) + R(54, 134, 12, 14, WHT) + waves(34, 86, 120, 2) + MOTHER(60, 46, 10, { bot: 112 }) + child(60, 88, 6) + heads([[18, 146], [102, 146]], 3.5),
  unburnt_bush: () => frame() + MPOY() + R(25, 45, 70, 70, WHT) + P('M60 30L95 80L60 130L25 80Z', WHT) + P('M30 50L90 110M90 50L30 110', THIN) + MOTHER(60, 66, 9, { bot: 110 }) + child(60, 98, 5),
  strastnaya: () => theotokos('hodegetria', wings(20, 40, 5) + cross(20, 32, 6) + wings(100, 40, 5) + L(100, 26, 104, 52)) + P('M88 140l6 6l-4 3', ' stroke-width="1.8"'),
  agiosoritissa: () => theotokos('entreating'),
  trinity: () => frame() + domes(26, 26, 20) + P('M60 14v24M52 30q8-12 16 0', ' stroke-width="1.8"') + hill(94, 40, 26, 20)
    + [[30, 72], [60, 58], [90, 72]].map(([x, y]) => wings(x, y + 14, 8) + halo(x, y, 9) + face(x, y, 6, { hair: 'short' }) + P(`M${x - 9} ${y + 8}L${x - 12} ${y + 70}H${x + 12}L${x + 9} ${y + 8}Z`, WHT) + L(x + 5, y + 12, x + 8, y + 60, THIN)).join('')
    + R(38, 104, 44, 30, WHT) + P('M54 98h12l-3 6h-6z', BLK) + R(58, 104, 4, 2, BLK) + P('M38 104h44', ' stroke-width="2.4"'),
  portaitissa: () => theotokos('hodegetria', P('M42 56l4 2l-1 10M45 70v3M44 76v2', ' stroke="#fff" stroke-width="1.4"')),
  axion_estin: () => theotokos('eleousa', T(60, 150, 6, 'ΑΞΙΟΝ ΕΣΤΙΝ')),
  tricheirousa: () => theotokos('hodegetria', hand(30, 132, 1.5) + E(30, 132, 2, 2.5, BLK)),
  gorgoepikoos: () => theotokos('hodegetria', P('M12 152Q12 138 24 136', THIN)),
  paramythia: () => theotokos('hodegetria', hand(66, 82, 1.2) + L(62, 90, 54, 106, ' stroke-width="2"')),
  glykophilousa_philotheou: () => theotokos('eleousa') + waves(10, 110, 138, 3),
  elaiovrytissa: () => theotokos('hodegetria', P('M20 150v-14q-4-6 2-10h8q6 4 2 10v14z', WHT) + P('M22 126h8', THIN)),
  vimatarissa: () => theotokos('hodegetria', E(24, 136, 12, 4, WHT) + P('M12 136v14h24v-14', WHT) + P('M24 128q-3-4 0-8q3 4 0 8z', BLK)),
  fovera_prostasia: () => theotokos('platytera'),
  evangelistria_tinos: () => annunciation(),
  soumela: () => theotokos('hodegetria', hill(22, 150, 22, 30)),
  myrtidiotissa: () => frame() + MPOY() + MOTHER(52, 50, 13, { dark: true }) + child(78, 92, 8) + P('M14 150q6-20 14-26M20 140l-6-4M22 134l6-6M18 146l6 2', ' stroke-width="1.4"'),
  chozoviotissa: () => theotokos('hodegetria', R(12, 120, 14, 30, WHT) + R(15, 126, 4, 6, BLK) + waves(10, 40, 148, 1)),
  ekatontapyliani: () => theotokos('hodegetria', domes(22, 138, 18)),
  malevi: () => theotokos('hodegetria', [[40, 82], [46, 96], [36, 104]].map(([x, y]) => P(`M${x} ${y}q-3 5 0 6q3-1 0-6z`, ' fill="#fff" stroke="#fff"')).join('')),
  blachernitissa: () => theotokos('platytera'),
  vladimir: () => theotokos('eleousa', E(80, 104, 3, 5, BLK)),
  kazan: () => frame() + MPOY() + MOTHER(52, 54, 15) + child(84, 92, 7, { long: 6.5 }),
  tikhvin: () => theotokos('hodegetria', P('M12 40q4-6 10-2q6-4 10 2', THIN) + P('M88 40q4-6 10-2q6-4 10 2', THIN)),
  smolensk: () => theotokos('frontal'),
  znamenie: () => theotokos('platytera', L(30, 30, 44, 44, ' stroke-width="1.6"') + P('M44 44l-4-1l3-3z', BLK)),
  kursk_root: () => theotokos('platytera') + P('M40 150q10-6 20-2q10-4 20 2M60 148v-6', ' stroke-width="2.4"'),
  don: () => theotokos('eleousa'),
  pochaev: () => theotokos('eleousa', P('M22 150q-6-10 0-18q5 2 4 10q0 6-4 8z', BLK)),
  bogolyubskaya: () => theotokos('scroll'),
  feodorovskaya: () => theotokos('eleousa'),
  joy_of_all: () => frame() + MPOY() + figure(60, 36, 9, 112, { black: true, face: { veil: true }, arms: 'out' }) + heads([[24, 126], [42, 136], [78, 136], [96, 126]], 4) + wings(24, 60, 4) + wings(96, 60, 4) + R(14, 140, 92, 12, WHT),
  unexpected_joy: () => frame() + R(56, 18, 54, 70, WHT) + g(56, 18, 0.45, MOTHER(52, 50, 13, { bot: 150 }) + child(78, 92, 8)) + P('M20 150v-20q6-10 14-8l10 12', WHT) + face(30, 112, 6, { hair: 'short', beard: true }) + L(42, 128, 54, 110, ' stroke-width="2"') + T(30, 22, 8, 'MP ΘY'),
  softener: () => theotokos('sorrow'),
  hodegetria_named: () => theotokos('hodegetria'),
};
function annunciation() {
  return frame() + P('M8 8h30q-4 10-14 12z', BLK) + L(20, 16, 70, 70, THIN) + figure(34, 46, 8, 150, { wings: true }) + L(22, 54, 18, 140, ' stroke-width="1.6"') + hand(46, 64, 1)
    + R(70, 96, 36, 10, WHT) + halo(86, 64, 11) + P('M76 72L70 150H104L96 72Z', BLK) + face(86, 64, 7, { veil: true }) + P('M98 92q6 6 2 14', ' stroke-width="1.4"');
}

/* ---------- CHRIST ---------- */
const PANTO = (o = {}) => halo(60, 52, 24, true) + bust(60, 70, 80, 153, { band: true }) + face(60, 52, 14, { hair: 'long', beard: o.beard === undefined ? true : o.beard }) + (o.noHands ? '' : hand(36, 112, 1.3) + book(84, 116, 22, 30));
const X_ = {
  christ_pantokrator: () => frame() + ICXC() + PANTO() + T(60, 34, 5, 'Ο ΩΝ'),
  christ_mandylion: () => frame() + ICXC() + P('M10 46q25 -6 50 0t50 0v80q-25 -6 -50 0t-50 0z', WHT) + P('M10 46l-2 -6M110 46l2 -6M10 126l-2 6M110 126l2 6', THIN) + halo(60, 82, 26, true) + face(60, 82, 16, { hair: 'long', beard: true }),
  christ_high_priest: () => frame() + ICXC() + R(26, 68, 68, 76, WHT) + R(22, 140, 76, 8, WHT) + halo(60, 46, 17, true) + bust(60, 60, 54, 140, { omophorion: true }) + face(60, 46, 11, { beard: true }) + mitre(60, 36, 22) + hand(44, 96, 1.1) + book(76, 104, 16, 20),
  christ_emmanuel: () => frame() + ICXC() + C(60, 84, 46, WHT) + C(60, 84, 42, THIN) + halo(60, 74, 20, true) + bust(60, 90, 56, 120) + face(60, 74, 12, { hair: 'short' }) + scroll(76, 108, 16) + hand(44, 106, 1),
  christ_nymphios: () => frame() + ICXC() + halo(60, 50, 22, true) + bust(60, 66, 72, 153) + face(60, 50, 13, { hair: 'long', beard: true }) + P('M46 40q14-8 28 0', ' stroke-width="2.4" stroke-dasharray="2 2"') + P('M50 120l20 8M50 128l20-8', ' stroke-width="2"') + hand(50, 124, 1) + hand(70, 124, 1) + L(72, 98, 90, 150, ' stroke-width="1.6"'),
  christ_ampelos: () => frame() + ICXC() + PANTO({ noHands: true }) + [[-1, 0], [1, 0]].map(([k]) => P(`M60 112q${k * 30}-10 ${k * 40}-70M60 130q${k * 34}-6 ${k * 46}-30`, ' stroke-width="1.8"')).join('') + heads([[22, 46], [98, 46], [16, 96], [104, 96]], 4),
  deesis: () => frame() + ICXC() + R(44, 92, 32, 54, WHT) + halo(60, 60, 14, true) + bust(60, 72, 44, 146) + face(60, 60, 9, { hair: 'long', beard: true }) + hand(52, 98, 0.9) + book(68, 104, 12, 16)
    + halo(22, 70, 11) + bust(22, 80, 30, 146, { black: true }) + face(22, 70, 7, { veil: true }) + hand(34, 96, 0.9)
    + halo(98, 70, 11) + bust(98, 80, 30, 146) + face(98, 70, 7, { hair: 'long', beard: 'long' }) + hand(86, 96, 0.9),
  anastasis: () => frame() + T(60, 18, 7, 'Η ΑΝΑΣΤΑΣΙΣ') + mandorla(60, 76, 26, 52) + figure(60, 46, 8, 118, { cross: true, arms: 'out' }) + P('M30 136l60-14M30 122l60 14', ' stroke-width="3"')
    + R(8, 106, 22, 40, WHT) + figure(20, 92, 5, 120, { face: { beard: 'long', hair: 'white' } }) + R(90, 106, 22, 40, WHT) + figure(100, 92, 5, 120, { black: true, face: { veil: true } }) + L(36, 100, 26, 104, ' stroke-width="2"') + L(84, 100, 94, 104, ' stroke-width="2"') + cave(60, 152, 40, 14),
  crucifixion: () => frame() + ICXC(30) + R(57, 14, 6, 120, WHT) + R(18, 40, 84, 6, WHT) + R(40, 26, 40, 5, WHT) + L(50, 110, 70, 104, ' stroke-width="2.4"') + figure(60, 36, 5.5, 104, { cross: true, halo: true }) + P('M56 46L28 44M64 46L92 44', ' stroke-width="2.6"')
    + hill(60, 152, 60, 20) + cave(60, 152, 14, 9) + C(60, 148, 2.6, WHT) + figure(20, 92, 5.5, 150, { black: true, face: { veil: true } }) + figure(100, 92, 5.5, 150, { face: { hair: 'short' } }),
};

/* ---------- THE FEASTS ---------- */
const F_ = {
  f_nativity_theotokos: () => frame() + domes(20, 30, 20) + domes(100, 30, 20) + R(40, 50, 64, 20, WHT) + figure(76, 46, 6, 66, { face: { veil: true } }) + L(44, 52, 100, 52, THIN)
    + P('M46 126h28l-4 14H50z', WHT) + C(60, 120, 4, WHT) + figure(30, 100, 6, 150, { face: { veil: true }, halo: false }) + figure(90, 100, 6, 150, { face: { veil: true }, halo: false }),
  f_exaltation: () => frame() + domes(60, 28, 40) + R(42, 96, 36, 20, WHT) + figure(60, 64, 7, 96, { arms: 'up', face: { beard: 'white' } }) + R(57, 30, 6, 30, WHT) + R(48, 38, 24, 5, WHT) + heads([[18, 112], [30, 124], [90, 124], [102, 112], [20, 140], [100, 140]], 4) + figure(92, 68, 5, 110, { black: true, face: { veil: true } }) + crown(92, 60, 9),
  f_entry_theotokos: () => frame() + domes(86, 30, 30) + P('M20 150h40v-10h14v-10h14v-10h14', ' stroke-width="1.6"') + figure(88, 72, 7, 120, { face: { beard: 'long' } }) + figure(46, 110, 4, 140, { black: true, face: { veil: true } }) + figure(22, 98, 6, 150, { black: true, face: { veil: true } }),
  f_nativity: () => frame() + P('M48 8l12 18 12-18', ' stroke-width="1.4"') + L(60, 26, 60, 64, THIN) + hill(60, 152, 112, 130) + cave(60, 112, 46, 50)
    + R(48, 80, 24, 12, WHT) + E(60, 82, 8, 4, WHT) + face(54, 82, 3, {}) + E(48, 72, 6, 4, WHT) + E(72, 72, 6, 4, WHT) + P('M18 108q14-10 40 4q-20 12-40 4z', BLK) + face(20, 104, 5, { veil: true })
    + figure(24, 46, 4.5, 74, {}) + figure(100, 56, 4.5, 84, {}) + figure(96, 118, 4.5, 146, { face: { beard: 'white', hair: 'white' } }) + P('M30 140h18l-3 8H33z', WHT),
  f_theophany: () => frame() + P('M40 8h40q-8 12-20 12t-20-12z', BLK) + L(60, 20, 60, 46, THIN) + wings(60, 42, 4) + hill(14, 152, 26, 120) + hill(106, 152, 26, 120) + R(30, 70, 60, 82, WHT) + waves(30, 90, 74, 15)
    + figure(60, 62, 6.5, 136, { cross: true, halo: true }) + figure(22, 54, 5.5, 116, { face: { hair: 'long', beard: 'long' } }) + L(30, 64, 48, 58, ' stroke-width="2"') + figure(98, 54, 5.5, 110, { wings: true }),
  f_hypapante: () => frame() + domes(60, 22, 36) + R(42, 92, 36, 40, WHT) + P('M42 92q18-18 36 0', WHT) + child(60, 72, 5, { noBless: true }) + figure(90, 66, 7, 150, { face: { beard: 'long', hair: 'white' } }) + figure(30, 66, 7, 150, { black: true, face: { veil: true } }) + figure(106, 82, 5, 150, { black: true, face: { veil: true } }),
  f_annunciation: () => annunciation(),
  f_palm_sunday: () => frame() + hill(20, 70, 30, 50) + R(84, 46, 26, 44, WHT) + P('M84 46v-8h6v8M98 46v-8h6v8', THIN) + horse(54, 112, 1) + figure(52, 76, 6, 110, { cross: true }) + L(36, 30, 36, 72, ' stroke-width="2.2"') + P('M36 30q-10 0-14 8M36 30q10 0 14 8M36 30q-6-8-14-6M36 30q6-8 14-6', ' stroke-width="1.6"') + face(40, 42, 2.5) + heads([[90, 132], [102, 140], [16, 140]], 4),
  f_ascension: () => frame() + mandorla(60, 40, 22, 28) + figure(60, 28, 5, 58, { cross: true }) + wings(32, 54, 6) + wings(88, 54, 6)
    + figure(60, 88, 6.5, 150, { arms: 'up', black: true, face: { veil: true } }) + wings(34, 92, 5) + wings(86, 92, 5) + heads([[16, 110], [26, 120], [94, 120], [104, 110], [16, 134], [104, 134]], 3.8),
  f_pentecost: () => frame() + P('M24 40v60h72V40', ' stroke-width="1.4"') + Array.from({ length: 12 }, (_, i) => { const a = Math.PI * (0.05 + 0.9 * i / 11); return [60 - Math.cos(a) * 38, 98 - Math.sin(a) * 52]; }).map(([x, y]) => halo(x, y, 5.5) + face(x, y, 3.5, { hair: 'short' }) + P(`M${r1(x)} ${r1(y - 8)}q-2-3 0-6q2 3 0 6z`, BLK)).join('') + P('M8 8h104q-52 14-104 0z', BLK) + P('M36 150V122q24-18 48 0v28z', BLK) + crown(60, 128, 10) + face(60, 136, 4, { dark: true }),
  f_transfiguration: () => frame() + hill(20, 70, 34, 40) + hill(100, 70, 34, 40) + hill(60, 66, 40, 30) + mandorla(60, 52, 20, 26) + figure(60, 40, 5.5, 74, { cross: true, arms: 'out' }) + figure(18, 34, 4.5, 60, { face: { beard: true } }) + figure(102, 34, 4.5, 60, { face: { beard: true } })
    + [0, 1, 2].map(i => L(60, 70, 24 + i * 36, 112, THIN)).join('') + P('M10 152q14-20 30-14M44 152q10-24 30-18M80 152q14-20 30-14', WHT) + heads([[22, 132], [60, 124], [96, 132]], 4),
  f_dormition: () => frame() + domes(18, 30, 18) + domes(102, 30, 18) + mandorla(60, 64, 18, 34) + figure(60, 44, 6, 96, { cross: true }) + E(70, 60, 4, 6, WHT) + face(70, 56, 2) + R(14, 108, 92, 14, WHT) + P('M20 110h80', ' stroke-width="7"') + face(24, 110, 4, { veil: true }) + heads([[16, 92], [28, 86], [92, 86], [104, 92], [24, 140], [96, 140]], 4) + C(60, 140, 6, WHT) + cross(60, 140, 3),
  f_pokrov: () => frame() + domes(60, 100, 60) + P('M14 40q46-26 92 0', ' stroke-width="3.6"') + figure(60, 36, 6, 76, { arms: 'up', black: true, face: { veil: true } }) + figure(20, 120, 5.5, 152, { face: { beard: 'long', hair: 'white' } }) + L(26, 128, 40, 108, ' stroke-width="1.8"') + heads([[86, 136], [100, 136]], 4),
  f_orthodoxy: () => frame() + R(42, 18, 36, 46, WHT) + g(42, 18, 0.3, MOTHER(52, 50, 13, { bot: 150 }) + child(78, 92, 8)) + figure(22, 30, 6, 100, { face: { veil: true } }) + crown(22, 22, 10) + figure(98, 30, 6, 100, { face: { hair: 'short' } }) + L(30, 42, 42, 40, ' stroke-width="2"') + L(90, 42, 78, 40, ' stroke-width="2"') + heads([[18, 120], [34, 124], [50, 120], [70, 120], [86, 124], [102, 120], [26, 142], [60, 142], [94, 142]], 4.2),
  f_ladder: () => frame() + P('M16 150L96 26M28 152L108 30', ' stroke-width="1.6"') + Array.from({ length: 12 }, (_, i) => L(22 + i * 6.8 - 0, 141 - i * 10.4, 34 + i * 6.8, 143 - i * 10.4, THIN)).join('') + halo(104, 20, 9, true) + face(104, 20, 5.5, { beard: true }) + heads([[40, 104], [62, 70], [82, 40]], 3.6)
    + [[22, 96], [52, 132], [90, 100]].map(([x, y]) => P(`M${x} ${y}q4-10 8 0q-1 8-4 10q-3-2-4-10z`, BLK) + L(x + 4, y + 2, x + 14, y - 6, ' stroke-width="1.4"')).join(''),
  f_synaxis_archangels: () => frame() + figure(26, 40, 7, 150, { wings: true }) + figure(94, 40, 7, 150, { wings: true }) + C(60, 82, 22, WHT) + C(60, 82, 19, THIN) + child(60, 76, 7.5) + L(36, 70, 44, 76, ' stroke-width="1.6"') + L(84, 70, 76, 76, ' stroke-width="1.6"'),
};

/* ---------- THE SAINTS ---------- */
const BISHOP = (x, y, s, o = {}) => halo(x, y, s * 1.65) + bust(x, y + s * 1.4, s * 5, o.bot || 153, { omophorion: true }) + face(x, y, s, { beard: o.beard || 'white', hair: o.hair || 'white' });
const S_ = {
  s_nicholas: () => frame() + AG('ΝΙΚΟΛ.') + BISHOP(60, 54, 14) + hand(34, 112, 1.3) + book(86, 118, 22, 30),
  s_george: () => frame() + AG('ΓΕΩΡΓ.') + rider(68, 54) + face(96, 74, 3) + P('M92 78h8l-1 6h-6z', WHT),
  s_demetrios: () => frame() + AG('ΔΗΜΗΤΡ.') + rider(68, 54, { black: true, foe: figure(26, 118, 5, 148, { halo: false, face: { beard: true } }) }),
  s_forerunner: () => frame() + AG('ΠΡΟΔΡ.') + figure(60, 40, 9, 150, { wings: true, face: { hair: 'long', beard: 'long' } }) + E(42, 112, 12, 4, WHT) + face(42, 104, 4.5, { hair: 'long', beard: true }) + scroll(82, 100, 26),
  s_michael: () => frame() + AG('ΜΙΧΑΗΛ') + figure(60, 40, 9, 150, { wings: true, face: { hair: 'short' } }) + L(76, 30, 70, 100, ' stroke-width="3"') + L(66, 92, 78, 94, ' stroke-width="2"') + P('M30 108h24M42 108v12M34 120l-4 8h8zM50 120l-4 8h8z', THIN),
  s_constantine_helen: () => frame() + R(57, 24, 6, 126, WHT) + R(46, 34, 28, 5, WHT) + figure(28, 46, 7, 150, { face: { beard: true } }) + crown(28, 36, 12) + figure(92, 46, 7, 150, { black: true, face: { veil: true } }) + crown(92, 36, 12) + hand(48, 76, 1) + hand(72, 76, 1),
  s_panteleimon: () => frame() + AG('ΠΑΝΤ.') + halo(60, 54, 22) + bust(60, 72, 72, 153) + face(60, 54, 13, { hair: 'short' }) + R(70, 104, 20, 14, WHT) + L(70, 108, 90, 108, THIN) + L(38, 120, 48, 96, ' stroke-width="2"') + E(48, 94, 3, 2, WHT),
  s_paraskevi: () => frame() + AG('ΠΑΡΑΣΚ.') + halo(60, 52, 22) + bust(60, 70, 72, 153, { black: true }) + face(60, 52, 13, { veil: true }) + E(60, 118, 18, 6, WHT) + E(54, 116, 3, 2, BLK) + E(66, 116, 3, 2, BLK) + cross(40, 100, 5),
  s_catherine: () => frame() + AG('ΑΙΚΑΤ.') + figure(56, 42, 8.5, 150, { face: { veil: true } }) + crown(56, 30, 14) + C(92, 112, 14, WHT) + C(92, 112, 3, BLK) + [0, 1, 2, 3, 4, 5].map(i => L(92, 112, 92 + Math.cos(i) * 14, 112 + Math.sin(i) * 14, THIN)).join('') + P('M90 98l4 28', ' stroke="#fff" stroke-width="3"') + L(64, 60, 64, 120, ' stroke-width="2"'),
  s_spyridon: () => frame() + AG('ΣΠΥΡΙΔ.') + BISHOP(60, 58, 14, { beard: 'white', hair: 'none' }) + P('M44 46Q44 18 60 16Q76 18 76 46Z', WHT) + P('M46 38h28M47 30h26M50 22h20M54 18v26M60 16v28M66 18v26', THIN) + hand(34, 114, 1.3) + book(86, 120, 22, 30),
  s_elias: () => frame() + T(60, 18, 7, 'Ο ΠΡΟΦ. ΗΛΙΑΣ') + hill(60, 152, 112, 110) + cave(46, 152, 50, 66) + figure(46, 104, 6, 150, { face: { hair: 'long', beard: 'long' } }) + P('M86 58q6-6 12 0l6-2-4 6q-6 4-14-4z', BLK) + C(92, 30, 9) + [0, 1, 2, 3].map(i => L(92, 30, 92 + Math.cos(i * 0.8) * 9, 30 + Math.sin(i * 0.8) * 9, THIN)).join('') + P('M74 30q-6-8 0-14q2 6 6 2q2 8-6 12z', BLK),
  s_three_hierarchs: () => frame() + T(60, 18, 7, 'ΟΙ ΤΡΕΙΣ ΙΕΡΑΡΧΑΙ') + [[24, 56, 'long'], [60, 50, true], [96, 56, 'long']].map(([x, y, b]) => BISHOP(x, y, 9, { beard: b, hair: 'short' })).join('') + book(24, 120, 14, 18) + book(60, 116, 14, 18) + book(96, 120, 14, 18),
  s_nektarios: () => frame() + AG('ΝΕΚΤ.') + BISHOP(60, 58, 14, { beard: 'white', hair: 'none' }) + mitre(60, 46, 30) + P('M48 56h8M64 56h8M56 56h8', THIN) + C(52, 56, 3.4, THIN) + C(68, 56, 3.4, THIN) + hand(34, 116, 1.3) + book(86, 122, 22, 28),
  s_seraphim: () => frame() + AG('ΣΕΡΑΦ.') + P('M40 54L28 150H86L66 64Z', WHT) + halo(52, 48, 13) + face(52, 48, 8, { hair: 'white', beard: 'white' }) + L(86, 60, 92, 150, ' stroke-width="2.4"') + L(66, 80, 86, 70, ' stroke-width="2.2"') + P('M88 136q4-12 14-8q6 4 4 14l2 8h-22l2-6z', BLK) + C(98, 126, 3, BLK),
  s_silouan: () => frame() + AG('ΣΙΛΟΥΑΝ') + halo(56, 52, 22) + P('M30 153V70Q30 30 56 28Q82 30 82 70V153Z', BLK) + face(56, 54, 12, { beard: 'long' }) + [[42, 40], [70, 40], [56, 110]].map(([x, y]) => P(`M${x - 3} ${y}h6M${x} ${y - 3}v6`, ' stroke="#fff" stroke-width="1.4"')).join('') + R(80, 80, 30, 58, WHT) + T(95, 96, 5, 'ΚΡΑΤΕΙ') + T(95, 106, 5, 'ΤΟΝ ΝΟΥΝ') + T(95, 116, 5, 'ΣΟΥ ΕΙΣ') + T(95, 126, 5, 'ΤΟΝ ΑΔΗΝ'),
};

const DRAW = Object.assign({}, X_, T_, F_, S_);
function svgFor(row) {
  const fn = DRAW[row.id];
  if (!fn) throw new Error('no drawing for icon ' + row.id + ' - add one to icon-svgs.js');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="${W}" height="${H}" fill="#fff" stroke="none"/>${fn()}<path d="M0 0H${W}V${H}H0ZM3 3V${H - 3}H${W - 3}V3Z" fill="#fff" fill-rule="evenodd" stroke="none"/>${frame()}</svg>`;
}
const VFILE = path.join(__dirname, '..', '..', 'data', 'eink-verses.json');
const versesText = () => JSON.stringify([...fs.readFileSync(path.join(__dirname, 'verse.cpp'), 'utf8').matchAll(/^\s*\{ "(.*)", "(.*)" \},$/gm)]
  .map(m => ({ text: m[1], ref: m[2] })), null, 0).replace(/\},\{/g, '},\n{') + '\n';
module.exports = { svgFor, DRAW, versesText };

if (require.main === module) {
  const rows = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const check = process.argv.includes('--check');
  let off = 0;
  /* A row with its real image (479) carries no drawing; the drawing is only the fallback where Commons has no public-domain copy. */
  rows.forEach(r => { if (r.image) { if ('svg' in r) { off++; delete r.svg; } return; } const s = svgFor(r); if (r.svg !== s) { off++; r.svg = s; } });
  const vOff = !fs.existsSync(VFILE) || fs.readFileSync(VFILE, 'utf8') !== versesText();
  if (check) { if (vOff) { console.error('data/eink-verses.json is not verse.cpp\'s verses - run node tools/epaper-verse/icon-svgs.js'); process.exit(1); }
    if (off) { console.error(off + ' icon drawings are not what icon-svgs.js writes - run node tools/epaper-verse/icon-svgs.js'); process.exit(1); } console.log('icon svgs: ' + rows.length + ' current'); }
  else { fs.writeFileSync(VFILE, versesText()); fs.writeFileSync(FILE, '[\n' + rows.map(r => '{' + Object.entries(r).map(([k, v]) => JSON.stringify(k) + ': ' + JSON.stringify(v)).join(', ') + '}').join(',\n') + '\n]\n'); console.log('icon svgs: ' + rows.length + ' written, ' + off + ' changed'); }
}
