/* @family. — js/fig-place.js ONE RULE FOR EVERY FIGURE (owner, 15 Nov): no label touches a line, an arc or another label. */
/* Axis numbers beside their axis, evenly spaced, the origin once; any other label on ink moves to the nearest clear spot. */
const FP_SKIP = 'defs, clipPath, mask, marker, pattern, symbol';
const FP_NUM = /^[−–-]?\d+(\.\d+)?$/;
const FP_GAP = 1.2;

function fpSeen_(el) {
  for (let n = el; n && n.tagName !== 'svg'; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (cs.display === 'none' || Number(cs.opacity) === 0) return false;
  }
  return true;
}

/* A LABEL'S INK IN THE DRAWING'S UNITS: cap height to baseline (a line box carries ascent and descent the glyphs do not fill). */
function fpInk_(el, inv) {
  const bb = el.getBBox();
  if (!bb.width) return null;
  const fs = parseFloat(getComputedStyle(el).fontSize) || 12;
  const m = inv.multiply(el.getScreenCTM());
  const lines = Math.max(1, Math.round(bb.height / (fs * 1.15)));
  const desc = lines === 1 && /[gjpqy(),;]/.test(el.textContent);
  const top = bb.y + (lines === 1 ? bb.height - 0.96 * fs : 0.1 * fs), bot = bb.y + bb.height - (desc ? 0 : 0.2 * fs);
  const xs = [m.a * bb.x + m.c * top + m.e, m.a * (bb.x + bb.width) + m.c * bot + m.e];
  const ys = [m.b * bb.x + m.d * top + m.f, m.b * (bb.x + bb.width) + m.d * bot + m.f];
  return { fs, x0: Math.min(xs[0], xs[1]), x1: Math.max(xs[0], xs[1]), y0: Math.min(ys[0], ys[1]), y1: Math.max(ys[0], ys[1]) };
}

/* EVERY DRAWN STROKE AS POINTS A UNIT APART, in a grid of 8-unit cells; a grid line is the paper and labels sit on it. */
function fpInk2_(svg, inv) {
  const cells = new Map(), axes = [];
  svg.querySelectorAll('line, path, polyline, polygon, rect, circle, ellipse').forEach(g => {
    if (g.closest(FP_SKIP) || g.classList.contains('grid') || !fpSeen_(g)) return;
    const cs = getComputedStyle(g);
    if (cs.stroke === 'none' || !(parseFloat(cs.strokeWidth) > 0.05) || Number(cs.strokeOpacity) === 0) return;
    let len; try { len = g.getTotalLength(); } catch (e) { return; }
    if (!(len > 0)) return;
    const m = inv.multiply(g.getScreenCTM()), n = Math.min(4000, Math.ceil(len));
    let a = null, b = null;
    for (let i = 0; i <= n; i++) {
      const p = g.getPointAtLength(len * i / n), x = m.a * p.x + m.c * p.y + m.e, y = m.b * p.x + m.d * p.y + m.f;
      const k = Math.floor(x / 8) + ',' + Math.floor(y / 8);
      (cells.get(k) || cells.set(k, []).get(k)).push(x, y);
      if (i === 0) a = { x, y }; if (i === n) b = { x, y };
    }
    /* A LONG STRAIGHT LINE, flat or upright, is a candidate axis. */
    if (g.tagName === 'line' && a && b) {
      if (Math.abs(a.y - b.y) < 0.5) axes.push({ h: true, at: a.y, lo: Math.min(a.x, b.x), hi: Math.max(a.x, b.x) });
      else if (Math.abs(a.x - b.x) < 0.5) axes.push({ h: false, at: a.x, lo: Math.min(a.y, b.y), hi: Math.max(a.y, b.y) });
    }
  });
  return { cells, axes };
}

function fpOnInk_(ink, b) {
  for (let cx = Math.floor(b.x0 / 8); cx <= Math.floor(b.x1 / 8); cx++) for (let cy = Math.floor(b.y0 / 8); cy <= Math.floor(b.y1 / 8); cy++) {
    const p = ink.cells.get(cx + ',' + cy);
    if (p) for (let i = 0; i < p.length; i += 2) if (p[i] > b.x0 && p[i] < b.x1 && p[i + 1] > b.y0 && p[i + 1] < b.y1) return true;
  }
  return false;
}
const fpMeet_ = (a, b) => Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);
const fpGrow_ = (b, g) => ({ x0: b.x0 - g, x1: b.x1 + g, y0: b.y0 - g, y1: b.y1 + g });
const fpAt_ = (b, dx, dy) => ({ x0: b.x0 + dx, x1: b.x1 + dx, y0: b.y0 + dy, y1: b.y1 + dy, fs: b.fs });

function fpUndo_(svg) {
  svg.querySelectorAll('[data-fp]').forEach(t => {
    const was = t.getAttribute('data-fp');
    if (was === '-') t.removeAttribute('transform'); else t.setAttribute('transform', was);
    t.removeAttribute('data-fp');
  });
  svg.querySelectorAll('[data-fp-hid]').forEach(t => { t.style.display = ''; t.removeAttribute('data-fp-hid'); });
}
function fpMove_(l, dx, dy) {
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
  const t = l.el;
  if (!t.hasAttribute('data-fp')) t.setAttribute('data-fp', t.getAttribute('transform') || '-');
  const was = t.getAttribute('data-fp');
  l.dx += dx; l.dy += dy;
  t.setAttribute('transform', `translate(${l.dx.toFixed(2)} ${l.dy.toFixed(2)})` + (was === '-' ? '' : ' ' + was));
  l.b = fpAt_(l.b, dx, dy);
}
function fpHide_(l) { l.el.style.display = 'none'; l.el.setAttribute('data-fp-hid', '1'); l.gone = true; }

/* ---------- AXIS NUMBERS: beside their axis, the origin once, thinned to every second (third...) when they would touch. */
function fpAxes_(labels, ink) {
  const H = ink.axes.filter(a => a.h), V = ink.axes.filter(a => !a.h);
  const own = new Set();
  const cx = b => (b.x0 + b.x1) / 2, cy = b => (b.y0 + b.y1) / 2;
  H.forEach(ax => {
    const vx = V.find(v => v.lo - 1 <= ax.at && v.hi + 1 >= ax.at && v.at >= ax.lo - 1 && v.at <= ax.hi + 1);
    const row = labels.filter(l => !own.has(l) && FP_NUM.test(l.s) && Math.abs(cy(l.b) - ax.at) < 1.8 * l.b.fs
      && cx(l.b) >= ax.lo - l.b.fs && cx(l.b) <= ax.hi + l.b.fs && !(vx && Math.abs(cx(l.b) - vx.at) < 0.3 * l.b.fs && Number(l.s.replace(/[−–]/, '-')) !== 0));
    if (row.length < 2) return;
    /* BELOW, unless the row was drawn above it. */
    const above = row.filter(l => cy(l.b) < ax.at).length > row.length / 2;
    row.forEach(l => { own.add(l); fpMove_(l, 0, above ? ax.at - FP_GAP - l.b.y1 : ax.at + FP_GAP - l.b.y0); });
    fpThin_(row, 'x');
  });
  V.forEach(ax => {
    const row = labels.filter(l => !own.has(l) && FP_NUM.test(l.s) && Math.abs(cx(l.b) - ax.at) < 2.5 * l.b.fs
      && cy(l.b) >= ax.lo - l.b.fs && cy(l.b) <= ax.hi + l.b.fs);
    if (row.length < 2) return;
    const right = row.filter(l => cx(l.b) > ax.at).length > row.length / 2;
    row.forEach(l => { own.add(l); fpMove_(l, right ? ax.at + FP_GAP - l.b.x0 : ax.at - FP_GAP - l.b.x1, 0); });
    fpThin_(row, 'y');
  });
  /* THE ORIGIN ONCE: an O or a 0 at the crossing, the first kept, set in the corner below and left of it. */
  H.forEach(h => V.forEach(v => {
    if (v.lo - 1 > h.at || v.hi + 1 < h.at || v.at < h.lo - 1 || v.at > h.hi + 1) return;
    const near = labels.filter(l => !l.gone && /^[O0]$/.test(l.s) && Math.abs(cx(l.b) - v.at) < 2 * l.b.fs && Math.abs(cy(l.b) - h.at) < 2 * l.b.fs);
    near.slice(1).forEach(fpHide_);
    if (near[0]) { own.add(near[0]); fpMove_(near[0], v.at - FP_GAP - near[0].b.x1, h.at + FP_GAP - near[0].b.y0); }
    /* a number on the other axis that now meets the origin's label gives way to it */
    if (near[0]) labels.forEach(l => { if (l !== near[0] && !l.gone && own.has(l) && fpMeet_(fpGrow_(l.b, 0.5), near[0].b)) fpHide_(l); });
  }));
  return own;
}
function fpThin_(row, k) {
  const lo = k === 'x' ? 'x0' : 'y0', hi = k === 'x' ? 'x1' : 'y1';
  row.sort((a, b) => a.b[lo] - b.b[lo]);
  for (let step = 1; step <= row.length; step++) {
    const keep = row.filter((l, i) => i % step === (row.length - 1) % step || step === 1);
    const ok = keep.every((l, i) => !i || keep[i - 1].b[hi] + 0.3 * l.b.fs <= l.b[lo]);
    if (ok) { row.forEach(l => { if (keep.indexOf(l) < 0) fpHide_(l); }); return; }
  }
}

/* ---------- EVERY OTHER LABEL: where it is if that is clear, else the nearest clear spot within a line height and a half. */
function fpOne_(svg) {
  let inv; try { inv = svg.getScreenCTM().inverse(); } catch (e) { return false; }
  const labels = [];
  svg.querySelectorAll('text').forEach(el => {
    if (el.closest(FP_SKIP) || !el.textContent.trim() || el.parentElement.closest('text') || !fpSeen_(el)) return;
    const b = fpInk_(el, inv);
    if (b) labels.push({ el, b, s: el.textContent.trim().replace(/\s+/g, ' '), dx: 0, dy: 0 });
  });
  if (!labels.length) return true;
  const ink = fpInk2_(svg, inv);
  const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : null;
  const axisOwn = fpAxes_(labels, ink);
  const live = labels.filter(l => !l.gone);
  const inside = b => !vb || (b.x0 >= vb.x && b.x1 <= vb.x + vb.width && b.y0 >= vb.y && b.y1 <= vb.y + vb.height);
  const clear = (l, b, done) => inside(b) && !fpOnInk_(ink, fpGrow_(b, FP_GAP)) && !done.some(d => fpMeet_(fpGrow_(b, FP_GAP), d.b));
  /* THE CLEAR ONES FIRST, so a label that already reads well keeps its place and the others go round it. */
  const done = [], todo = [];
  live.forEach(l => (clear(l, l.b, live.filter(o => o !== l)) ? done : todo).push(l));
  todo.sort((a, b) => (axisOwn.has(a) ? 0 : 1) - (axisOwn.has(b) ? 0 : 1));
  todo.forEach(l => {
    const R = 1.6 * l.b.fs;
    let best = null;
    for (let r = 1; r <= R && !best; r += 1) {
      const n = Math.max(8, Math.round(r * 1.5));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 2 * Math.PI, dx = r * Math.cos(a), dy = r * Math.sin(a);
        if (clear(l, fpAt_(l.b, dx, dy), done)) { best = [dx, dy]; break; }
      }
    }
    if (best) fpMove_(l, best[0], best[1]);
    else if (axisOwn.has(l)) { fpHide_(l); return; }
    done.push(l);
  });
  return true;
}

function figPlace_(root) {
  const r = root && root.querySelectorAll ? root : (typeof document !== 'undefined' && document.querySelectorAll ? document : null);
  if (!r) return;
  r.querySelectorAll('figure > svg, .qpad-art > svg:first-child').forEach(svg => {
    const t = svg.querySelector('text');
    if (!t) return;
    const key = getComputedStyle(t).fontSize;
    if (svg.getAttribute('data-fp-at') === key) return;
    if (!svg.getBoundingClientRect().width) return;
    fpUndo_(svg);
    try { if (fpOne_(svg)) svg.setAttribute('data-fp-at', key); } catch (e) { fpUndo_(svg); }
  });
}

/* AS DRAWINGS ARRIVE, AND WHEN THE TEXT SIZE OR THE FONT CHANGES UNDER THEM. */
try {
  /* NO LAYOUT, NOTHING TO MEASURE (jsdom): no observer either. */
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && window.SVGGraphicsElement && window.SVGGraphicsElement.prototype.getBBox) {
    let due = false;
    const soon = () => { if (due) return; due = true; requestAnimationFrame(() => { due = false; try { figPlace_(document); } catch (e) { /* a drawing left as drawn */ } }); };
    new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length)) soon(); }).observe(document.documentElement, { childList: true, subtree: true });
    addEventListener('resize', soon);
    if (document.fonts) { document.fonts.ready.then(soon); document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', soon); }
  }
} catch (e) { /* no observer: the drawings stay as the library drew them */ }
