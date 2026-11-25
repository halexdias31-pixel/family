/* ---------- MEASURING (385): "There needs to be a protocol for this type of question. Like protractor tool." */
/* Ruler and Protractor are in every part's tool row (qtools.js); since 20 Nov each floats over the page like the calculator, by the one floating-tool mechanism below. */
const MEAS_SNAP_PX = 14;    // nearer than this (x1.5) to a corner of the figure, the tool's centre or zero sits on it
const MEAS_TURN_DEG = 8;    // nearer than this to an arm's direction, the baseline lies along it

/* THE FIGURE'S CORNERS AND ARMS, read from its lines, polygons and paths: { pts: [[x, y]], segs: [[x1, y1, x2, y2]] } */
function measGeom_(svg) {
  const segs = [], num = s => String(s || '').trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  svg.querySelectorAll('line').forEach(l => segs.push(['x1', 'y1', 'x2', 'y2'].map(a => +l.getAttribute(a) || 0)));
  svg.querySelectorAll('polygon, polyline').forEach(p => {
    const v = num(p.getAttribute('points')), P = [];
    for (let i = 0; i + 1 < v.length; i += 2) P.push([v[i], v[i + 1]]);
    if (p.tagName.toLowerCase() === 'polygon' && P.length > 2) P.push(P[0]);
    for (let i = 1; i < P.length; i++) segs.push([P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]]);
  });
  svg.querySelectorAll('path').forEach(p => {
    const d = p.getAttribute('d') || '';
    if (/[aAcCqQsStT]/.test(d)) return;
    let at = null;
    (d.match(/[MLml][^MLmlZz]*/g) || []).forEach(c => {
      const v = num(c.slice(1));
      for (let i = 0; i + 1 < v.length; i += 2) {
        const q = /[ml]/.test(c[0]) && at ? [at[0] + v[i], at[1] + v[i + 1]] : [v[i], v[i + 1]];
        if (at && !(/[Mm]/.test(c[0]) && i === 0)) segs.push([at[0], at[1], q[0], q[1]]);
        at = q;
      }
    });
  });
  const pts = [];
  segs.forEach(s => [[s[0], s[1]], [s[2], s[3]]].forEach(p => { if (!pts.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1)) pts.push(p); }));
  return { pts, segs };
}
function measFig_(k) {
  const card = [...document.querySelectorAll('#screen .page.on .qcard, .qcard')].find(c => c.querySelector(`[data-k="${CSS.escape(k)}"]`) || c.querySelector(`.q-meast[data-key="${CSS.escape(k)}"]`));
  /* THE FIGURE, else the pen's page (a made-up surface has no <figure>): the Ruler measures on either. */
  const pick = c => c && ([...c.querySelectorAll('figure svg')].find(s => !s.classList.contains('meas') && !s.closest('svg.meas') && s.parentNode.closest('figure'))
    || c.querySelector('.qpad-art > svg:first-child'));
  let svg = pick(card);
  /* A PART WHOSE WORDS RAN ON TO A SECOND PAGE has its figure on the page before: the tool goes there */
  if (!svg && card) {
    const page = card.closest('.page'), prev = page && page.previousElementSibling;
    if (prev && prev.classList.contains('page') && /continued on the next page/i.test(prev.textContent)) svg = pick(prev);
  }
  return svg ? svg.parentNode : null;
}
/* THE PAPER'S CENTIMETRE ON THE SCREEN: the longest line is as long as the scheme says (the middle of its band), else 1 cm is a tenth of the figure; no figure, a real 1 cm (38px). */
function measCmPx_(k) {
  const fig = measFig_(k), svg = fig && [...fig.children].find(c => c.tagName.toLowerCase() === 'svg');
  if (!svg) return 38;
  const vb = (svg.getAttribute('viewBox') || '0 0 340 340').split(/[\s,]+/).map(Number), r = svg.getBoundingClientRect();
  if (!r.width || !vb[2]) return 38;
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  let cm = vb[2] / 10;
  const G = measGeom_(svg), band = /(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*(cm|mm)/i.exec(String(x && (x.accept || (x.row || {}).accept) || ''));
  if (band && G.segs.length) {
    const len = Math.max(...G.segs.map(s => Math.hypot(s[2] - s[0], s[3] - s[1])));
    const want = (+band[1] + +band[2]) / 2 / (band[3].toLowerCase() === 'mm' ? 10 : 1);
    if (len > 0 && want > 0) cm = len / want;
  }
  const px = cm * r.width / vb[2];
  return px >= 12 && px <= 200 ? px : 38;
}
/* THE TOOLS AS SHAPES (data), in screen px, drawn by the one maker's `drawing` block: the ruler's zero, the protractor's centre, is the pin at (M, M) / (R + M, R + M). */
const MEAS_M = 10;
function measShape_(tool, k) {
  const body = [], P = (cls, d) => body.push({ el: 'path', a: { class: cls, d } }),
    N = (cls, x, y, fs, t) => body.push({ el: 'text', a: { class: cls, x: x.toFixed(1), y: y.toFixed(1), 'font-size': fs }, text: String(t) });
  const M = MEAS_M, room = Math.min(innerWidth || 390, 560) - 64;
  let w, h, pin;
  if (tool === 'protractor') {
    const R = Math.max(90, Math.min(150, room / 2)), cx = R + M, cy = R + M;
    w = 2 * R + 2 * M; h = R + 2 * M; pin = [cx, cy];
    P('meas-body', `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`);
    for (let a = 0; a <= 180; a += 5) {
      const t = a * Math.PI / 180, c = Math.cos(t), s = -Math.sin(t), L = a % 10 ? 0.05 : a % 30 ? 0.08 : 0.12;
      P('meas-tick', `M ${(cx + R * c).toFixed(1)} ${(cy + R * s).toFixed(1)} L ${(cx + R * (1 - L) * c).toFixed(1)} ${(cy + R * (1 - L) * s).toFixed(1)}`);
      if (!(a % 30)) {
        N('meas-num', cx + R * 0.8 * c, cy + R * 0.8 * s, 10, a);
        N('meas-num meas-in', cx + R * 0.64 * c, cy + R * 0.64 * s, 9, 180 - a);
      }
    }
    P('meas-tick', `M ${cx - R} ${cy} L ${cx + R} ${cy} M ${cx} ${cy - 10} L ${cx} ${cy}`);
  } else {
    const cmPx = measCmPx_(k), n = Math.max(3, Math.floor((room - 2 * M) / cmPx)), L = n * cmPx;
    w = L + 2 * M; h = 46; pin = [M, 0];
    body.push({ el: 'rect', a: { class: 'meas-body', x: '0', y: '0', width: w.toFixed(1), height: String(h), rx: '4' } });
    for (let mm = 0; mm <= n * 10; mm++) {
      const x = M + mm * cmPx / 10, t = mm % 10 ? (mm % 5 ? 0.2 : 0.32) : 0.45;
      P('meas-tick', `M ${x.toFixed(1)} 0 L ${x.toFixed(1)} ${(h * t).toFixed(1)}`);
      if (!(mm % 10)) N('meas-num', x, h * 0.72, 11, mm / 10);
    }
  }
  return { w, h, pin, body };
}
/* ---------- ONE FLOATING TOOL (owner, 20 Nov: "the calculator feels stable"): the calculator, the ruler and the protractor all float over the page by this one mechanism. */
/* Tap its tile: it appears over the question, the figure and the pen still there under it; tap again or ✕: gone. Its body carries it; a ruler or protractor's round handle turns it. */
const FLOATS = new Map();   // kind ('calc' | 'ruler' | 'protractor') -> { key, el }
const floatIs_ = (kind, key) => { const f = FLOATS.get(kind); return !!f && (key == null || f.key === key); };
/* EVERY TOOL TILE LIT AGAIN by the one rule (`qtLight_`, qtools-row.js) */
const floatLight_ = () => { if (typeof qtLight_ === 'function') qtLight_(document); };
function floatClose_(kind) {
  const f = FLOATS.get(kind);
  if (!f) return;
  FLOATS.delete(kind);
  f.el.remove();
  floatLight_();
}
/* OPENED, OR CLOSED WHEN IT IS ALREADY OUT FOR THIS PART: `html` is the tool's own markup; returns the element, or null when it closed */
function floatToggle_(kind, key, html) {
  const again = floatIs_(kind, key);
  floatClose_(kind);
  if (again) return null;
  document.body.insertAdjacentHTML('beforeend', html);
  const el = document.body.lastElementChild;
  el.classList.add('floaty', 'float-' + kind);
  el.setAttribute('data-float', kind);
  el.setAttribute('data-key', key);
  el.insertAdjacentHTML('beforeend', tile_({ form: true, look: 'float-x', act: 'float-close', aria: 'Close', label: '✕' }));
  FLOATS.set(kind, { key, el });
  floatLight_();
  return el;
}
on('float-close', el => { const f = el.closest('[data-float]'); if (f) floatClose_(f.getAttribute('data-float')); });
/* THE RULER OR PROTRACTOR, from its tile in the part's tool row (`qt-inst`, qtools.js): no pen, no new screen */
function measOpen_(el) {
  const k = el.getAttribute('data-key') || '';
  /* ONE MEASURE (owner, 24 Nov): out comes the ruler; tapped again, the protractor in its place; again, nothing */
  if (floatIs_('protractor', k)) { floatClose_('protractor'); return; }
  const tool = floatIs_('ruler', k) ? 'protractor' : 'ruler';
  if (tool === 'protractor') floatClose_('ruler');
  const S = measShape_(tool, k);
  const html = `<div class="meas-float" role="group" aria-label="${tool === 'protractor' ? 'Protractor: drag it over an angle; turn it by the round handle' : 'Ruler: drag it; turn it by the round handle'}" style="width:${S.w.toFixed(1)}px;height:${S.h.toFixed(1)}px;transform-origin:${S.pin[0].toFixed(1)}px ${S.pin[1].toFixed(1)}px" data-rot="0">`
    + `<svg class="meas" viewBox="0 0 ${S.w.toFixed(1)} ${S.h.toFixed(1)}" width="${S.w.toFixed(1)}" height="${S.h.toFixed(1)}" aria-hidden="true">${cardBlocks_({ type: 'drawing', node: { el: 'g', kids: S.body } })}</svg>`
    + `<i class="float-pin" style="left:${S.pin[0].toFixed(1)}px;top:${S.pin[1].toFixed(1)}px" aria-hidden="true"></i>`
    + tile_({ form: true, look: 'float-turn', aria: 'Turn the ' + tool, html: '<span aria-hidden="true">⟳</span>' }) + '</div>';
  const f = floatToggle_(tool, k, html);
  if (!f) return;
  /* LANDING OVER THE FIGURE when it is on the screen, else the middle of the window */
  const fig = measFig_(k), r = fig && fig.getBoundingClientRect(), seen = r && r.bottom > 40 && r.top < innerHeight - 40;
  const cx = seen ? r.left + r.width / 2 : innerWidth / 2, cy = seen ? Math.min(innerHeight - 60, Math.max(80, r.top + r.height * 0.6)) : innerHeight / 2;
  floatPlace_(f, cx - S.w / 2, tool === 'protractor' ? cy - S.pin[1] + S.h * 0.3 : cy);
}
/* THE SNAP when let go: the pin (zero or centre) onto a corner of the figure when near it; then its edge along an arm from that corner when near its direction */
const MEAS_GRID_DEG = 15, MEAS_GRID_NEAR = 3;   // turning settles on 0, 15, 30, 45, 90 ... within 3°
const measGridSnap_ = a => { const n = Math.round(a / MEAS_GRID_DEG) * MEAS_GRID_DEG; return Math.abs(a - n) <= MEAS_GRID_NEAR ? n : a; };
const measRot_ = (el, a) => { a = ((a % 360) + 360) % 360; el.setAttribute('data-rot', a.toFixed(1)); el.style.transform = 'rotate(' + a.toFixed(2) + 'deg)'; };
function measSnap_(el) {
  const kind = el.getAttribute('data-float'), fig = measFig_(el.getAttribute('data-key') || ''), pinEl = el.querySelector('.float-pin');
  const svg = fig && [...fig.children].find(c => c.tagName.toLowerCase() === 'svg'), m = svg && svg.getScreenCTM && svg.getScreenCTM();
  if (!m || !pinEl) return;
  const toScr = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; const z = q.matrixTransform(m); return [z.x, z.y]; };
  const G = measGeom_(svg), pr = pinEl.getBoundingClientRect(), pin = [pr.left, pr.top];
  const near = G.pts.map(p => { const s = toScr(p[0], p[1]); return { p, s, d: Math.hypot(s[0] - pin[0], s[1] - pin[1]) }; }).sort((a, b) => a.d - b.d)[0];
  if (!near || near.d > MEAS_SNAP_PX * 1.5) return;
  floatPlace_(el, el.offsetLeft + near.s[0] - pin[0], el.offsetTop + near.s[1] - pin[1], true);
  const dirs = [];
  G.segs.forEach(s => {
    const a = toScr(s[0], s[1]), b = toScr(s[2], s[3]);
    if (Math.hypot(a[0] - near.s[0], a[1] - near.s[1]) < 2) dirs.push(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI);
    if (Math.hypot(b[0] - near.s[0], b[1] - near.s[1]) < 2) dirs.push(Math.atan2(a[1] - b[1], a[0] - b[0]) * 180 / Math.PI);
  });
  const rot = +el.getAttribute('data-rot') || 0, diff = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
  /* A PROTRACTOR'S BASELINE IS A LINE BOTH WAYS from its centre; a ruler's edge runs one way from its zero */
  let best = null;
  dirs.forEach(a => [0, 180].forEach(f => {
    if (kind === 'ruler' && f) return;
    const d = diff(rot, a + f);
    if (d <= MEAS_TURN_DEG && (!best || d < best.d)) best = { d, a: a + f };
  }));
  if (best) measRot_(el, best.a);
}
/* A FLOATING TOOL IS HELD THE RULER'S WAY: the spot grabbed stays under the finger. The calculator never leaves the window; a ruler or protractor may hang off its edge, a thumb's width always left on it. */
function floatPlace_(el, x, y, free) {
  const w = el.offsetWidth, h = el.offsetHeight, whole = el.getAttribute('data-float') === 'calc', keep = 64;
  el.style.right = 'auto';
  el.style.left = (free ? x : whole ? Math.max(0, Math.min(innerWidth - w, x)) : Math.max(keep - w, Math.min(innerWidth - keep, x))) + 'px';
  el.style.top = (free ? y : whole ? Math.max(0, Math.min(innerHeight - h, y)) : Math.max(keep - h, Math.min(innerHeight - keep, y))) + 'px';
}
inputDrag_(e => {
  const el = e.target && e.target.closest && e.target.closest('.floaty');
  if (!el) return null;
  /* THE ROUND HANDLE TURNS IT about its pin (the ruler's zero, the protractor's centre) */
  if (e.target.closest('.float-turn')) {
    const p = el.querySelector('.float-pin').getBoundingClientRect();
    const a0 = Math.atan2(e.clientY - p.top, e.clientX - p.left) * 180 / Math.PI;
    el.classList.add('held');
    return { el, turn: true, c: [p.left, p.top], from: (+el.getAttribute('data-rot') || 0) - a0 };
  }
  /* A KEY IS TAPPED, NOT HELD: only the body and the edge carry it */
  if (e.target.closest('[data-do], button, .mc-display')) return null;
  el.classList.add('held');
  return { el, dx: e.clientX - el.offsetLeft, dy: e.clientY - el.offsetTop };
}, (g, e) => {
  if (g.turn) measRot_(g.el, measGridSnap_(g.from + Math.atan2(e.clientY - g.c[1], e.clientX - g.c[0]) * 180 / Math.PI));
  else floatPlace_(g.el, e.clientX - g.dx, e.clientY - g.dy);
}, g => { g.el.classList.remove('held'); if (g.el.querySelector('.float-pin')) measSnap_(g.el); }, { capture: true, early: true });
/* A MOUSE WHEEL TURNS A RULER OR PROTRACTOR 1° (Shift 0.2°) */
document.addEventListener('wheel', e => {
  const el = e.target && e.target.closest && e.target.closest('.floaty[data-float="ruler"], .floaty[data-float="protractor"]');
  if (!el) return;
  e.preventDefault();
  measRot_(el, (+el.getAttribute('data-rot') || 0) + (e.deltaY > 0 ? 1 : -1) * (e.shiftKey ? 0.2 : 1));
}, { passive: false });
/* NO SCROLL OR PINCH while a finger holds a floating tool */
document.addEventListener('touchmove', e => { const t = e.target; if (t && t.closest && t.closest('.floaty.held') && e.cancelable) e.preventDefault(); }, { capture: true, passive: false });
if (typeof addEventListener === 'function') addEventListener('resize', () => { document.querySelectorAll('.floaty').forEach(el => floatPlace_(el, el.offsetLeft, el.offsetTop)); });
