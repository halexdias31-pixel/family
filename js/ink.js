/* @family. — js/ink.js: what any finger-ink surface needs, as small helpers with no state of their own.
   The whiteboard (js/board.js) is the first user; the question cards' pen (find.js) is not wired to it yet (377). */

/* ---------- THE ONE EURO FILTER (Casiez, Roussel and Vogel, CHI 2012) ---------- */
/* A FINGER'S CONTACT POINT JITTERS A PIXEL OR TWO AT REST AND LAGS NOTHING WHEN FAST: so cut hard when slow, open up with speed. */
/* Tuned on a phone at 390px: `min` 1.5 Hz holds a resting finger still, `beta` 0.03 lets a 300px/s stroke through in about 15ms. */
const INK_EURO = { min: 1.5, beta: 0.03, d: 1 };
function inkEuro_(o) {
  const c = Object.assign({}, INK_EURO, o || {});
  const alpha = (cut, dt) => { const r = 2 * Math.PI * cut * dt; return r / (r + 1); };
  let x = null, dx = 0, t = 0;
  return {
    reset() { x = null; dx = 0; },
    /* `ts` in ms, as an event's `timeStamp`; a repeated time is taken as one millisecond later, never as zero. */
    step(v, ts) {
      if (x === null) { x = v; t = ts; return v; }
      const dt = Math.max((ts - t) / 1000, 0.001);
      t = ts;
      dx += alpha(c.d, dt) * ((v - x) / dt - dx);
      x += alpha(c.min + c.beta * Math.abs(dx), dt) * (v - x);
      return x;
    },
  };
}
/* TWO AT ONCE, for a point. */
function inkEuro2_(o) {
  const fx = inkEuro_(o), fy = inkEuro_(o);
  return { reset() { fx.reset(); fy.reset(); }, step: (x, y, ts) => [fx.step(x, ts), fy.step(y, ts)] };
}

/* ---------- EVERY SAMPLE THE SCREEN TOOK, AND WHERE THE FINGER IS ABOUT TO BE ---------- */
/* A PHONE SAMPLES TOUCH AT 120-240Hz BUT DELIVERS ONE EVENT A FRAME; the rest are in `getCoalescedEvents`, and a curve drawn from one in four is a polygon. */
function inkSamples_(e) {
  try { const l = e.getCoalescedEvents && e.getCoalescedEvents(); if (l && l.length) return l; } catch (x) {}
  return [e];
}
/* THE BROWSER'S OWN GUESS AT THE NEXT FEW MS, drawn for one frame and thrown away: it hides a frame of lag without ever being kept. */
function inkAhead_(e) {
  try { const l = e.getPredictedEvents && e.getPredictedEvents(); if (l && l.length) return l; } catch (x) {}
  return [];
}

/* ---------- A CANVAS AT THE SCREEN'S OWN RESOLUTION ---------- */
/* `desynchronized` LETS CHROME DRAW STRAIGHT TO THE SCREEN, a frame sooner (web.dev "low-latency canvas"); only for the layer under the finger. */
function inkContext_(cv, low) {
  if (!cv || !cv.getContext) return null;
  try { return cv.getContext('2d', low ? { desynchronized: true } : undefined) || null; } catch (e) {}
  try { return cv.getContext('2d') || null; } catch (e) { return null; }
}
/* SIZED IN DEVICE PIXELS AND DRAWN IN CSS PIXELS, so a 3x phone gets a line one device pixel wide rather than a blurred three. */
function inkFit_(cv, ctx, w, h) {
  const dpr = Math.min(3, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
  const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return dpr;
}

/* ---------- ONE STROKE, ROUND AND OF VARYING WIDTH ---------- */
/* QUADRATIC CURVES THROUGH THE MIDPOINTS: smooth without overshooting a corner the way a spline can, and cheap enough to redraw a page. */
/* `pts` are [x, y, w]; drawn at screen = point * a + (bx, by). One width a segment is what gives a fast stroke its taper. */
function inkStroke_(ctx, pts, a, bx, by) {
  const n = pts ? pts.length : 0;
  if (!ctx || !n) return;
  const X = i => pts[i][0] * a + bx, Y = i => pts[i][1] * a + by, Wd = i => Math.max(0.6, (pts[i][2] || 1.4) * a);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (n === 1 || (n === 2 && Math.hypot(X(1) - X(0), Y(1) - Y(0)) < 0.5)) {
    ctx.beginPath(); ctx.arc(X(0), Y(0), Wd(0) / 2, 0, 2 * Math.PI); ctx.fill();
    return;
  }
  if (n === 2) { ctx.lineWidth = (Wd(0) + Wd(1)) / 2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(1), Y(1)); ctx.stroke(); return; }
  let px = X(0), py = Y(0);
  for (let i = 1; i < n; i++) {
    const last = i === n - 1;
    const ex = last ? X(i) : (X(i) + X(i + 1)) / 2, ey = last ? Y(i) : (Y(i) + Y(i + 1)) / 2;
    ctx.lineWidth = Wd(i);
    ctx.beginPath(); ctx.moveTo(px, py);
    if (last) ctx.lineTo(ex, ey); else ctx.quadraticCurveTo(X(i), Y(i), ex, ey);
    ctx.stroke();
    px = ex; py = ey;
  }
}

/* ---------- MEASURES OF A LINE OF POINTS ([x, y, ...]) ---------- */
function inkBox_(pts) {
  const b = { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity };
  (pts || []).forEach(p => { if (p[0] < b.l) b.l = p[0]; if (p[0] > b.r) b.r = p[0]; if (p[1] < b.t) b.t = p[1]; if (p[1] > b.b) b.b = p[1]; });
  return b;
}
function inkLength_(pts) {
  let s = 0;
  for (let i = 1; i < (pts || []).length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return s;
}
/* HOW FAR THE LINE STRAYS FROM ITS CHORD, as a share of the chord: 0 is ruled, a bracket is about 0.3. */
function inkStray_(pts) {
  const n = (pts || []).length;
  if (n < 2) return 1;
  const a = pts[0], b = pts[n - 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (L < 1e-6) return 1;
  let m = 0;
  pts.forEach(p => { m = Math.max(m, Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L); });
  return m / L;
}
/* RAMER-DOUGLAS-PEUCKER: the same line to within `tol`, in a fraction of the points, so a long working stays under the board's ceiling. */
function inkThin_(pts, tol) {
  const n = (pts || []).length;
  if (n < 3) return (pts || []).slice();
  const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    const a = pts[i], b = pts[j], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-6;
    let m = -1, at = -1;
    for (let k = i + 1; k < j; k++) {
      const d = Math.abs((b[0] - a[0]) * (a[1] - pts[k][1]) - (a[0] - pts[k][0]) * (b[1] - a[1])) / L;
      if (d > m) { m = d; at = k; }
    }
    if (m > tol) { keep[at] = 1; stack.push([i, at], [at, j]); }
  }
  return pts.filter((p, i) => keep[i]);
}

/* ---------- SCRATCHING OUT (MyScript's and OneNote's gesture) ---------- */
/* BACK AND FORTH FOUR TIMES OR MORE ALONG ITS LONGER SIDE, tightly: an M turns three times, a scribble five or more. */
function inkScribble_(pts) {
  if (!pts || pts.length < 8) return false;
  const bx = inkBox_(pts), w = bx.r - bx.l, h = bx.b - bx.t, ext = Math.max(w, h);
  if (ext <= 0) return false;
  const ax = w >= h ? 0 : 1, hyst = Math.max(ext * 0.12, 1e-6);
  let dir = 0, turns = 0, far = pts[0][ax];
  pts.forEach(p => {
    const v = p[ax];
    if (dir > 0 && v > far) far = v; else if (dir < 0 && v < far) far = v;
    if (dir >= 0 && v < far - hyst) { if (dir > 0) turns++; dir = -1; far = v; }
    else if (dir <= 0 && v > far + hyst) { if (dir < 0) turns++; dir = 1; far = v; }
  });
  return turns >= 4 && inkLength_(pts) >= 4 * ext;
}
/* WHAT A SCRIBBLE COVERS: half a stroke's points inside its box, or the whole stroke inside it with a margin. */
function inkCovers_(scr, pts) {
  const s = inkBox_(scr), m = Math.max(s.r - s.l, s.b - s.t) * 0.08;
  const inside = p => p[0] >= s.l - m && p[0] <= s.r + m && p[1] >= s.t - m && p[1] <= s.b + m;
  const n = (pts || []).filter(inside).length;
  return n > 0 && n >= pts.length * 0.5;
}

/* ---------- AN EQUALS SIGN: two short dashes, one above the other, about the same length ---------- */
function inkDash_(pts) {
  const b = inkBox_(pts), w = b.r - b.l, h = b.b - b.t;
  return w > 0 && h <= w * 0.36 && inkStray_(pts) < 0.2;
}
function inkEquals_(a, b) {
  if (!inkDash_(a) || !inkDash_(b)) return false;
  const A = inkBox_(a), B = inkBox_(b), wa = A.r - A.l, wb = B.r - B.l;
  if (wa / wb > 2.2 || wb / wa > 2.2) return false;
  const over = Math.min(A.r, B.r) - Math.max(A.l, B.l);
  const gap = Math.abs((A.t + A.b) / 2 - (B.t + B.b) / 2), w = (wa + wb) / 2;
  return over >= 0.5 * Math.min(wa, wb) && gap >= 0.12 * w && gap <= 0.9 * w;
}

/* ---------- POINT IN A LASSO ---------- */
function inkInside_(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

/* ---------- A TICK UNDER THE FINGER, where the phone can give one (not iOS Safari) ---------- */
function inkTick_(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {}
}
