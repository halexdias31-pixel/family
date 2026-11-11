
/* WHAT A DRAG MAKES, BY TOOL. `move` answers the stroke to preview (null: nothing new); `end` answers
   the stroke to keep (null: nothing -- a tap is a dot to the pen, and to a ruler or a compass a slip). */
const PAD_DRAW = {
  pen: {
    /* ONE POINT PER PIXEL OF THE PICTURE, not one per event. A pointer fires far faster than a
       finger moves anything visible, and every duplicated point is two more characters in storage
       for a mark nobody can see. */
    move: (g, at, st) => {
      /* AFTER A HOLD (374): a ring or an arc is done; a line's corner waits until the point leaves where it paused */
      if (g.frozen) return null;
      if (g.qz) { if (Math.hypot(at[0] * g.sx - g.qz[0], at[1] * g.sy - g.qz[1]) <= PAD_HOLD_PX) return null; g.qz = null; g.lz = null; }
      /* A SHORT STROKE IS DRAWN EXACTLY AS MOVED: the string engages once the pointer is more than its length from where it went down -- a tick, a cross's arm (368) */
      if (padSteady_(g) && (g.slack || Math.hypot((at[0] - g.raw[0]) * g.sx, (at[1] - g.raw[1]) * g.sy) > PAD_STRING_PX)) { g.slack = true; at = padLazy_(g, at, st); }
      if (!at || (st[st.length - 2] === at[0] && st[st.length - 1] === at[1])) return null;
      st.push(at[0], at[1]);
      return st;
    },
    /* A STEADIED STROKE ENDS WHERE THE POINTER LIFTED: the string's slack is paid out in two steps, so nothing lags */
    end: (g, st) => {
      /* A CLICK THAT NEVER MOVED IS A PLOTTED POINT: onto the grid or the figure's point as a finger's is (357), never onto your own mark, where it would vanish */
      if (padSteady_(g) && !g.board && !g.slack && g.tg && st && st.length === 2) {
        const t = padSnap_(Object.assign({}, g, { hold: null, tg: { own: [], pts: g.tg.pts } }), st[0] * g.sx, st[1] * g.sy, '');
        return t ? [Math.round(t.u[0]), Math.round(t.u[1])] : st;
      }
      if (padSteady_(g) && !g.frozen && !g.qz && g.at && st && st.length >= 2) {
        const x = st[st.length - 2], y = st[st.length - 1], a = g.at;
        if (x !== a[0] || y !== a[1]) {
          const m = [Math.round((x + a[0]) / 2), Math.round((y + a[1]) / 2)];
          if (m[0] !== x || m[1] !== y) st.push(m[0], m[1]);
          if (m[0] !== a[0] || m[1] !== a[1]) st.push(a[0], a[1]);
        }
      }
      return st;
    },
  },
  /* A RULER IS ITS TWO ENDS. The live line follows the finger from where it went down; what is kept
     is that line and nothing of the path the finger took to get there. */
  ruler: {
    move: (g, at) => [g.from[0], g.from[1], at[0], at[1]],
    end: (g, st) => (st.length === 4
      && Math.hypot((st[2] - st[0]) * g.sx, (st[3] - st[1]) * g.sy) >= padMinOf_(g) ? st : null),
  },
  compass: {
    move: (g, at) => padSwing_(g, at),
    end: (g, st) => (g.r >= padMinOf_(g) && st.length >= 4 ? st : null),
  },
};

/* ---------- WHAT IS SHOWN WHILE IT IS DRAWN, AND GONE WHEN IT IS NOT § */
function padAid_(g) {
  const aid = g.ink.querySelector('.qpad-aid');
  if (!aid) return;
  const c = g.from;
  /* AND A HALO ROUND A SNAP THAT IS HOLDING (357): 30px on the screen, an ellipse in the stretched units so it
     is round where it is seen. Shown, never stored -- the aid is emptied at the lift. */
  const h = g.hold;
  const halo = h ? `<ellipse class="qpad-halo" vector-effect="non-scaling-stroke" cx="${h.u[0]}" cy="${h.u[1]}" rx="${30 / g.sx}" ry="${30 / g.sy}"/>` : '';
  if (g.tool === 'pen') {
    /* AND WHERE THE FINGER IS ABOUT TO BE (374): the platform's prediction, one short segment, never stored -- the next frame replaces it */
    const n = PAD_ST ? PAD_ST.length : 0, q = g.pred;
    const html = halo + (q && n >= 2 ? `<path class="qpad-pred" vector-effect="non-scaling-stroke" d="M${PAD_ST[n - 2]} ${PAD_ST[n - 1]}L${q[0]} ${q[1]}"/>` : '');
    if (aid.innerHTML !== html) aid.innerHTML = html;
    return;
  }
  const pin = `<path class="qpad-pin" vector-effect="non-scaling-stroke" d="M${c[0]} ${c[1]}L${c[0]} ${c[1]}"/>`;
  const rad = g.tool === 'compass' && g.tip && g.r >= padMinOf_(g)
    ? `<path class="qpad-rad" vector-effect="non-scaling-stroke" d="M${c[0]} ${c[1]}L${Math.round(g.tip[0])} ${Math.round(g.tip[1])}"/>`
    : '';
  aid.innerHTML = pin + rad + halo;
}

/* A FINGER IS THE PEN, AND TWO FINGERS, A PALM OR A THUMB ARE NOT (docs/history/338). § */
const PAD_STILL_PX = 10;      // "a dot", and "has moved": the app's own drag decision (`PRESS_MOVED`), iOS's 10pt
const PAD_ALSO_PX = 5;        // "moving too": half of it -- by the time one finger of a pan has gone 10, the other has gone 5
const PAD_TOGETHER_MS = 200;  // twice Android's tap timeout, because children's fingers land less in step
const PAD_TOGETHER_PX = 200;  // two fingertips of one hand (38mm on an iPad, 31 on a phone), not a palm heel
const PAD_BAR_MS = 400;       // a resting hand's release becomes a click within this: Android's long press
/* AFTER REVIEW (11 Oct, docs/history/338): § */
const PAD_KEEPUP_PX = 30;     // 3 x the 10px: at a child's 300px/s, 100ms -- past the 50-80ms a thumb rolls or a palm settles in
const PAD_WITH = 0.5;         // "kept up": half as far as the one that went furthest (a pan or pinch is about 1, a settle falls away)
const PAD_LAG_MS = 40;        // a finger that reported within this is still reporting: a frame at 60Hz plus a report's spread

/* THE CONTACTS, by `pointerId` (jsdom's `undefined` is a key like any other). § */
const PAD_TOUCH = new Map();
/* HELD: the stroke is kept (`PAD_ST`, `PAD_GO`, so `padHold_` and `findKeep_` still hold its column) and its samples go on accumulating, but nothing of it is on § */
let PAD_HUSH = null;
/* TWO FINGERS: no stroke, and nothing drawn until every one of these has lifted. */
const PAD_TWO = new Set();
/* A DECISION NOT YET MADE: § */
let PAD_DUE = null;
let PAD_FRAME = 0;
/* UNDO AND CLEAR REFUSED UNTIL THIS TIME, by pad key -- a hand resting on the bar (`padRested_`). */
const PAD_RESTED = new Map();
/* `?pen=sizes` IN THE ADDRESS: the last eight contacts' widths, on the screen -- the reading increment 2
   waits for. Nothing reads it but the line that shows it. */
const PAD_SIZES = (() => { try { return /[?&]pen=sizes(&|$)/.test(location.search) ? [] : null; } catch (e) { return null; } })();

const padDist_ = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/* A CONTACT'S SIZE: the larger of its two sides, and only when the platform reports one -- 1 (or 0) is
   "not known", which is what a mouse, iOS before 18 and Android's `pointerup` say. */
const padSizeOf_ = e => { const s = Math.max(Number(e && e.width) || 0, Number(e && e.height) || 0); return s > 1 ? s : 0; };

/* WHETHER A FINGER IS ON THE ARMED DRAWING -- the swipe engine asks this before it takes a gesture (overworld.js, the axis decision), so a palm or a thumb that § */
function padBusy_(k) {
  const on = k === undefined ? PAD_ON : k;
  if (!on || on !== PAD_ON || !PAD_TOUCH.size) return false;
  for (const c of PAD_TOUCH.values()) if (c.onInk && c.k === on) return true;
  return false;
}
/* A PEN IS IN USE WHILE A STROKE OR A CONTACT IS ON IT, not merely for being the last pad touched: with no lock (368) nothing else ever lets go of it. */
const padInUse_ = k => !!k && k === PAD_ON && (!!PAD_GO || PAD_TOUCH.size > 0);
/* ---------- UNDO AND CLEAR UNDER A RESTING HAND § */
const padRested_ = k => padBusy_(k) || (PAD_RESTED.get(k) || 0) > performance.now();

/* WRITTEN ONCE A FRAME, NOT IN THE HANDLER (after review): § */
let PAD_SIZES_FRAME = 0;
function padSizesSay_(c, e) {
  if (!PAD_SIZES || typeof document === 'undefined') return;
  if (e.type === 'pointerdown') {
    c.say = { type: c.type || '?', w: Math.round(Number(e.width) || 0), h: Math.round(Number(e.height) || 0), big: c.size };
    PAD_SIZES.push(c.say);
    if (PAD_SIZES.length > 8) PAD_SIZES.shift();
  } else if (c.say) {
    const big = Math.max(c.say.big, padSizeOf_(e));
    if (big === c.say.big) return;
    c.say.big = big;
  }
  if (PAD_SIZES_FRAME || typeof requestAnimationFrame !== 'function') return;
  PAD_SIZES_FRAME = requestAnimationFrame(padSizesShow_);
}
function padSizesShow_() {
  PAD_SIZES_FRAME = 0;
  let el = document.querySelector('.pad-sizes');
  if (!el) {
    el = document.createElement('div');
    el.className = 'pad-sizes';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  el.textContent = PAD_SIZES.map(s => s.type + ' ' + s.w + 'x' + s.h + ' largest ' + Math.round(s.big)).join('\n');
}

/* A CONTACT, NEW. `busy` names the pad a finger was on when an OFF-ink touch went down, for the bar. */
function padContact_(e, ink, k) {
  const at = [e.clientX, e.clientY], ts = e.timeStamp;
  const c = { id: e.pointerId, type: e.pointerType || '', t0: ts, p0: at, p: at.slice(), pm: at.slice(), tm: ts, ts: ts,
              hist: [[ts, at[0], at[1]]], far: 0,
              onInk: !!ink, ink: ink || null, k: k || '', size: padSizeOf_(e), big: 0, role: 'rest', pts: null,
              m0: null, h0: null, late: false, busy: !ink && padBusy_() ? PAD_ON : '' };
  c.big = c.size;
  PAD_TOUCH.set(e.pointerId, c);
  padSizesSay_(c, e);
  return c;
}
/* AND WHERE IT HAS GOT TO: how far from where it went down, and when it last really moved. A "move" is
   `PAD_ALSO_PX`, so a resting palm's tremble is not a contact on the move. */
function padTrack_(c, x, y, ts) {
  c.p = [x, y];
  const d = padDist_(c.p0, c.p);
  if (d > c.far) c.far = d;
  /* AND WHEN IT FIRST WENT `PAD_KEEPUP_PX`, by this sample's clock -- the moment `padRace_` compares. */
  if (c.tk === undefined && d >= PAD_KEEPUP_PX) c.tk = ts;
  if (padDist_(c.pm, c.p) >= PAD_ALSO_PX) { c.pm = c.p.slice(); c.tm = ts; }
  /* AND WHEN, BY THE SAMPLE'S OWN CLOCK. § */
  if (ts > c.ts) c.ts = ts;
  c.hist.push([ts, x, y]);
  if (c.hist.length > 256) c.hist.splice(0, 128);
}
/* WHERE A CONTACT WAS AT A MOMENT: its last sample at or before it. */
function padPos_(c, t) {
  const h = c.hist;
  for (let i = h.length - 1; i >= 0; i--) if (h[i][0] <= t) return h[i];
  return h[0];
}

/* WHERE A POINT IS ON THE PICTURE, IN ITS 340 UNITS, from a box ALREADY READ -- one read per event. */
function padMap_(r, cx, cy) {
  if (!r || !r.width || !r.height) return null;
  return [Math.round((cx - r.left) / r.width * 340), Math.round((cy - r.top) / r.height * 340)];
}

/* A STEADY HAND FOR A MOUSE OR A STYLUS (368): a lazy brush -- the ink follows the pointer on a string -- then a light low-pass. A finger keeps 357's ink under it, untouched */
const PAD_STRING_PX = 6;      // the string: a pointer's jitter inside it moves no ink, and a straight pull draws a straight line
const PAD_STEADY_K = 0.55;    // the low-pass: each point this much of the way from the last kept one to the string's end
const padSteady_ = g => !!(g && g.c && isSteadyPointer_(g.c));
function padLazy_(g, at, st) {
  const sx = g.sx || 1, sy = g.sy || 1;
  if (!g.lz) { g.lz = st.length >= 2 ? [st[st.length - 2], st[st.length - 1]] : at.slice(); g.sm = g.lz.slice(); }
  const dx = (at[0] - g.lz[0]) * sx, dy = (at[1] - g.lz[1]) * sy, d = Math.hypot(dx, dy);
  if (d <= PAD_STRING_PX) return null;
  const t = (d - PAD_STRING_PX) / d;
  g.lz = [g.lz[0] + (at[0] - g.lz[0]) * t, g.lz[1] + (at[1] - g.lz[1]) * t];
  g.sm = [g.sm[0] + (g.lz[0] - g.sm[0]) * PAD_STEADY_K, g.sm[1] + (g.lz[1] - g.sm[1]) * PAD_STEADY_K];
  return [Math.round(g.sm[0]), Math.round(g.sm[1])];
}

/* A POINT PUT DOWN EXACTLY WITH A FINGER (docs/history/357). § */
const PAD_DOT_PX = 12;        // a dot while the point has gone less than this from landing: +-4px wobble is at most 11.3
const PAD_FINE_PX = 13;       // a grid square under this is finer than a wobble can hit (2 x 5.66px, the worst radial error)
const PAD_GAIN = 0.2;         // the slow mode's gain: measured best of 0.5 / 0.33 / 0.25 / 0.2 by check/pen.js 'plotfine' (357's table)
const PAD_GAIN_OFF_PX = 40;   // the finger this far from where the slow mode began: it is going somewhere, not aiming
const PAD_GAIN_MAX_PX = 48;   // and the point is never further than this from the finger, so no band is out of reach
const PAD_GAIN_STILL_PX = 5;  // a ruler's end is "still" when the finger moved less than this ...
const PAD_GAIN_STILL_MS = 120; // ... over this long: then the slow mode takes over to aim it
const PAD_SNAP_OWN = 24;      // the snap radius cap for your own marks, px
const PAD_SNAP_GRID = 20;     // and for the grid's intersections and the figure's points
const PAD_SNAP_KEEP = 1.25;   // a held snap lets go only past this many radii -- no flicker at the edge
const PAD_LOCK_DEG = 6;       // a ruler line this near level or upright IS level or upright: how a bar lands on a grid line

/* THE GRID IN A PICTURE'S MARKUP, in its own viewBox units: § */
const PAD_GRIDS = new Map();
function padGrid_(svg) {
  const s = String(svg || '');
  if (!s) return null;
  if (PAD_GRIDS.has(s)) return PAD_GRIDS.get(s);
  const m = /viewBox\s*=\s*["']\s*([-\d.eE+]+)[\s,]+([-\d.eE+]+)[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/.exec(s);
  let out = null;
  if (m) {
    const vb = [+m[1], +m[2], +m[3], +m[4]];
    const V = [], H = [];
    const seg = (x1, y1, x2, y2) => {
      if (Math.abs(x1 - x2) < 0.05 && Math.abs(y2 - y1) >= vb[3] * 0.25) V.push(x1);
      else if (Math.abs(y1 - y2) < 0.05 && Math.abs(x2 - x1) >= vb[2] * 0.25) H.push(y1);
    };
    const num = (t, k) => { const r = new RegExp('\\b' + k + '\\s*=\\s*["\']\\s*([-\\d.eE+]+)').exec(t); return r ? +r[1] : 0; };
    /* NOTHING INSIDE A TRANSFORM OR A DEFINITION: its numbers are not where it is drawn. */
    const plain = s.replace(/<(defs|clipPath|pattern|mask|symbol)\b[\s\S]*?<\/\1>/g, '').replace(/<g\b[^>]*\btransform\s*=[\s\S]*?<\/g>/g, '');
    (plain.match(/<line\b[^>]*>/g) || []).forEach(t => { if (!/\btransform\s*=/.test(t)) seg(num(t, 'x1'), num(t, 'y1'), num(t, 'x2'), num(t, 'y2')); });
    (plain.match(/<path\b[^>]*>/g) || []).forEach(t => {
      if (/\btransform\s*=/.test(t)) return;
      const d = /\bd\s*=\s*["']([^"']*)["']/.exec(t);
      /* ONLY ABSOLUTE MOVES AND LINES: anything curved or relative is a drawing, not a ruled grid. */
      if (!d || /[^MLHVZmz\d\s,.eE+-]/.test(d[1]) || /[a-y]/.test(d[1].replace(/[eE]/g, ''))) return;
      const tok = d[1].match(/[MLHVZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
      let cx = 0, cy = 0, c = '';
      for (let i = 0; i < tok.length;) {
        if (/[MLHVZz]/.test(tok[i])) { c = tok[i++]; if (c === 'Z' || c === 'z') continue; }
        if (c === 'M') { cx = +tok[i++]; cy = +tok[i++]; c = 'L'; }
        else if (c === 'L') { const x = +tok[i++], y = +tok[i++]; seg(cx, cy, x, y); cx = x; cy = y; }
        else if (c === 'H') { const x = +tok[i++]; seg(cx, cy, x, cy); cx = x; }
        else if (c === 'V') { const y = +tok[i++]; seg(cx, cy, cx, y); cy = y; }
        else i++;
      }
    });
    const run = list => {
      const p = [...new Set(list.filter(isFinite).map(v => Math.round(v * 10) / 10))].sort((a, b) => a - b);
      if (p.length < 5) return null;
      const d = p.slice(1).map((v, i) => v - p[i]);
      const med = d.slice().sort((a, b) => a - b)[d.length >> 1];
      if (!(med > 0)) return null;
      /* THE LONGEST RUN OF EVEN STEPS -- an axis drawn a little off the grid, or a frame round it, ends a run, not the grid. */
      let best = [0, 0];
      for (let i = 0, j = 0; i < d.length; i = j) {
        j = i;
        while (j < d.length && Math.abs(d[j] - med) <= med * 0.15) j++;
        if (j - i > best[1] - best[0]) best = [i, j];
        if (j === i) j++;
      }
      const r = p.slice(best[0], best[1] + 1);
      if (r.length < 5) return null;
      const st = r.slice(1).map((v, i) => v - r[i]);
      const mean = st.reduce((a, b) => a + b, 0) / st.length;
      const cv = Math.sqrt(st.reduce((a, b) => a + (b - mean) * (b - mean), 0) / st.length) / mean;
      return cv < 0.15 ? r : null;
    };
    const xs = run(V), ys = run(H);
    if (xs && ys) out = { vb, xs, ys };
  }
  if (PAD_GRIDS.size > 400) PAD_GRIDS.clear();
  PAD_GRIDS.set(s, out);
  return out;
}
/* AND THAT GRID ON THE SCREEN, for one pad at one box size: § */
function padLattice_(pad, r) {
  if (!pad || !r || !r.width || !r.height || padIsBoard_(pad.getAttribute('data-k'))) return null;
  const svg = pad.querySelector('.qpad-art > svg:first-child');
  if (!svg) return null;
  const key = Math.round(r.width) + 'x' + Math.round(r.height);
  if (svg.__lat && svg.__lat.key === key) return svg.__lat.val;
  const G = padGrid_(svg.__src || (svg.__src = svg.outerHTML));
  let val = null;
  if (G) {
    const [vx, vy, vw, vh] = G.vb;
    const xu = G.xs.map(v => (v - vx) / vw * 340), yu = G.ys.map(v => (v - vy) / vh * 340);
    const sx = r.width / 340, sy = r.height / 340;
    const xp = xu.map(u => u * sx), yp = yu.map(u => u * sy);
    const step = a => Math.min.apply(null, a.slice(1).map((v, i) => v - a[i]));
    val = { xu, yu, xp, yp, pitch: Math.min(step(xp), step(yp)) };
  }
  svg.__lat = { key, val };
  return val;
}
/* THE NEAREST OF A SORTED LIST, by halving: a 71-line grid is 7 looks, not 71. */
function padNearest_(a, v) {
  let lo = 0, hi = a.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (a[m] < v) lo = m; else hi = m; }
  return Math.abs(a[lo] - v) <= Math.abs(a[hi] - v) ? lo : hi;
}
/* WHAT A PLACEMENT CAN SNAP TO, IN 338 SECTION 8's ORDER, read once when the finger lands: § */
function padTargets_(g, pad) {
  const own = [], pts = [];
  const sx = g.sx, sy = g.sy;
  const add = (list, u) => { if (isFinite(u[0]) && isFinite(u[1])) list.push({ u: u, x: u[0] * sx, y: u[1] * sy }); };
  try {
    padRead_(pad.getAttribute('data-k') || '').forEach(st => {
      if (!Array.isArray(st) || st.length < 2) return;
      add(own, [st[0], st[1]]);
      if (st.length > 2) add(own, [st[st.length - 2], st[st.length - 1]]);
    });
  } catch (e) { /* an unreadable stroke list gives no own snap points */ }
  pad.querySelectorAll('.qpad-was path').forEach(p => {
    const n = (p.getAttribute('d') || '').match(/-?\d+(\.\d+)?/g) || [];
    if (n.length >= 2) add(own, [+n[0], +n[1]]);
    if (n.length >= 4) add(own, [+n[n.length - 2], +n[n.length - 1]]);
  });
  const svg = pad.querySelector('.qpad-art > svg:first-child');
  const vb = svg && /([-\d.eE+]+)[\s,]+([-\d.eE+]+)[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/.exec(svg.getAttribute('viewBox') || '');
  if (vb) svg.querySelectorAll('.pt').forEach(c => {
    const x = Number(c.getAttribute('cx')), y = Number(c.getAttribute('cy'));
    if (isFinite(x) && isFinite(y) && c.hasAttribute('cx')) add(pts, [(x - vb[1]) / vb[3] * 340, (y - vb[2]) / vb[4] * 340]);
  });
  const pitch = g.lat ? g.lat.pitch : Infinity;
  const merge = list => list.filter((t, i) => !list.slice(0, i).some(o => Math.hypot(o.x - t.x, o.y - t.y) < 2));
  const radii = (list, cap) => list.map(t => {
    let nn = pitch;
    list.forEach(o => { if (o !== t) nn = Math.min(nn, Math.hypot(o.x - t.x, o.y - t.y)); });
    t.r = Math.min(cap, 0.45 * nn);
    return t;
  });
  return { own: radii(merge(own), PAD_SNAP_OWN), pts: radii(merge(pts), PAD_SNAP_GRID) };
}
/* THE TARGET A POINT (px from the box's corner) SNAPS TO, or null: § */
function padSnap_(g, x, y, axis) {
  const L = g.lat, T = g.tg;
  if (axis) {
    if (!L) return null;
    const r = Math.min(PAD_SNAP_GRID, 0.45 * L.pitch);
    if (axis === 'x') { const i = padNearest_(L.xp, x); return Math.abs(L.xp[i] - x) <= r ? { u: [L.xu[i], y / g.sy], x: L.xp[i], y: y, r: r } : null; }
    const j = padNearest_(L.yp, y);
    return Math.abs(L.yp[j] - y) <= r ? { u: [x / g.sx, L.yu[j]], x: x, y: L.yp[j], r: r } : null;
  }
  const h = g.hold;
  if (h && Math.hypot(h.x - x, h.y - y) <= h.r * PAD_SNAP_KEEP) return h;
  const near = list => { let b = null, bd = Infinity; (list || []).forEach(t => { const d = Math.hypot(t.x - x, t.y - y); if (d <= t.r && d < bd) { b = t; bd = d; } }); return b; };
  let t = T ? near(T.own) : null;
  if (!t && L) {
    const i = padNearest_(L.xp, x), j = padNearest_(L.yp, y);
    const r = Math.min(PAD_SNAP_GRID, 0.45 * L.pitch);
    if (Math.hypot(L.xp[i] - x, L.yp[j] - y) <= r) t = { u: [L.xu[i], L.yu[j]], x: L.xp[i], y: L.yp[j], r: r };
  }
  if (!t && T) t = near(T.pts);
  return t;
}
/* THE SLOW MODE ON A FINE GRID: § */
function padGain_(g, f, start) {
  const P = g.gain;
  if (P && Math.hypot(f[0] - P.f[0], f[1] - P.f[1]) >= PAD_GAIN_OFF_PX) g.gain = null;
  if (!g.gain) {
    let on = start;
    if (!on && g.tool !== 'pen' && g.c && g.c.hist) {
      const h = g.c.hist, now = h[h.length - 1];
      let ok = now && now[0] - h[0][0] >= PAD_GAIN_STILL_MS;
      for (let i = h.length - 1; ok && i >= 0 && now[0] - h[i][0] <= PAD_GAIN_STILL_MS; i--) if (Math.hypot(h[i][1] - now[1], h[i][2] - now[2]) >= PAD_GAIN_STILL_PX) ok = false;
      on = ok;
    }
    if (!on) return f;
    g.gain = { f: f.slice(), c: f.slice() };
    return f;
  }
  let cx = g.gain.c[0] + PAD_GAIN * (f[0] - g.gain.f[0]), cy = g.gain.c[1] + PAD_GAIN * (f[1] - g.gain.f[1]);
  const d = Math.hypot(cx - f[0], cy - f[1]);
  if (d > PAD_GAIN_MAX_PX) { cx = f[0] + (cx - f[0]) * PAD_GAIN_MAX_PX / d; cy = f[1] + (cy - f[1]) * PAD_GAIN_MAX_PX / d; }
  return [cx, cy];
}
/* ONE PLACEMENT: the finger's point (units) through the slow mode and the snap, back to WHOLE units -- what is stored is always whole numbers § */
function padPlace_(g, at, start) {
  let f = [at[0] * g.sx, at[1] * g.sy];
  if (g.lat && g.lat.pitch < PAD_FINE_PX) f = padGain_(g, f, start);
  let axis = '';
  if (g.tool === 'ruler' && !start && g.fp) {
    const dx = f[0] - g.fp[0], dy = f[1] - g.fp[1], a = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;
    if (Math.hypot(dx, dy) >= PAD_MIN_PX) {
      if (a <= PAD_LOCK_DEG || a >= 180 - PAD_LOCK_DEG) { f = [f[0], g.fp[1]]; axis = 'x'; }
      else if (Math.abs(a - 90) <= PAD_LOCK_DEG) { f = [g.fp[0], f[1]]; axis = 'y'; }
    }
  }
  const t = padSnap_(g, f[0], f[1], axis);
  g.hold = t && !axis ? t : null;
  g.snapped = !!t;
  const u = t ? t.u : [f[0] / g.sx, f[1] / g.sy];
  g.at = [Math.round(u[0]), Math.round(u[1])];
  if (start) g.fp = t ? [t.x, t.y] : f;
  return g.at.slice();
}
/* ---------- HOLD TO STRAIGHTEN (374): a pen line paused at its end becomes straight, a ring round, an arc an arc -- QuickShape's gesture. A quick stroke is kept as drawn */
const PAD_HOLD_MS = 500;      // still this long at a stroke's end: iPad's QuickShape waits about as long, past a child's ordinary 100-300ms pause
const PAD_HOLD_PX = 8;        // "still": within this of where the pause began -- a fingertip's +-4px wobble is inside it
const PAD_SHAPE_MIN = 20;     // a run shorter than this is a tick, not a line
let PAD_HOLD_T = 0;
const padHoldClear_ = () => { if (PAD_HOLD_T) { clearTimeout(PAD_HOLD_T); PAD_HOLD_T = 0; } };
/* EVERY PEN SAMPLE: the pause's clock restarts whenever the point leaves the zone it began in */
function padHoldWatch_(g) {
  if (!g.at || g.frozen) return;
  const f = [g.at[0] * g.sx, g.at[1] * g.sy];
  if (g.hz && Math.hypot(f[0] - g.hz[0], f[1] - g.hz[1]) <= PAD_HOLD_PX) return;
  g.hz = f;
  padHoldClear_();
  if (typeof setTimeout === 'function') PAD_HOLD_T = setTimeout(() => { PAD_HOLD_T = 0; padHoldFire_(g); }, PAD_HOLD_MS);
}
function padHoldFire_(g) {
  if (PAD_GO !== g || !PAD_ST || g.tool !== 'pen' || g.dot || g.frozen || g.qz || PAD_HUSH || PAD_DUE || PAD_TWO.size || !padShown_(g)) return;
  if (!g.ink || !g.ink.isConnected) return;
  padStraighten_(g);
}
/* A LEAST-SQUARES CIRCLE (Kasa) through points in px, about their mean for precision: { c, r } or null */
function padCircleFit_(P) {
  const n = P.length;
  let mx = 0, my = 0;
  P.forEach(p => { mx += p[0]; my += p[1]; });
  mx /= n; my /= n;
  let xx = 0, yy = 0, xy = 0, xz = 0, yz = 0, z = 0;
  P.forEach(p => { const x = p[0] - mx, y = p[1] - my, q = x * x + y * y; xx += x * x; yy += y * y; xy += x * y; xz += x * q; yz += y * q; z += q; });
  /* with the mean at 0 the sums of x and y vanish: D, E from a 2x2, F = -z/n */
  const det = xx * yy - xy * xy;
  if (!(Math.abs(det) > 1e-9)) return null;
  const D = (-xz * yy + yz * xy) / det, E = (-yz * xx + xz * xy) / det, F = -z / n;
  const r2 = (D * D + E * E) / 4 - F;
  if (!(r2 > 0)) return null;
  return { c: [mx - D / 2, my - E / 2], r: Math.sqrt(r2) };
}
/* WHAT A RUN OF POINTS (px) WAS MEANT TO BE: a line, or -- the whole stroke only -- a ring or an arc; null leaves it as drawn */
function padShapeOf_(P, whole) {
  const n = P.length;
  if (n < 2) return null;
  let len = 0;
  for (let i = 1; i < n; i++) len += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  if (len < PAD_SHAPE_MIN) return null;
  const a = P[0], b = P[n - 1], chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let dev = 0;
  if (chord > 0) P.forEach(p => { dev = Math.max(dev, Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / chord); });
  const tol = Math.max(6, 0.1 * chord);
  if (chord >= PAD_SHAPE_MIN && dev <= tol && len <= 1.3 * chord) return { kind: 'line' };
  if (!whole || n < 8) return null;
  const fit = padCircleFit_(P);
  if (!fit || fit.r < 10) return null;
  let sum = 0, worst = 0, turn = 0, prev = null;
  P.forEach(p => {
    const d = Math.hypot(p[0] - fit.c[0], p[1] - fit.c[1]) - fit.r, t = Math.atan2(p[1] - fit.c[1], p[0] - fit.c[0]);
    sum += d * d; worst = Math.max(worst, Math.abs(d));
    if (prev !== null) { let s = t - prev; if (s > Math.PI) s -= 2 * Math.PI; else if (s < -Math.PI) s += 2 * Math.PI; turn += s; }
    prev = t;
  });
  const rms = Math.sqrt(sum / n), cover = Math.abs(turn) * 180 / Math.PI;
  const a0 = Math.atan2(a[1] - fit.c[1], a[0] - fit.c[0]);
  if (cover >= 300 && rms <= 0.1 * fit.r && worst <= 0.25 * fit.r) return { kind: 'ring', c: fit.c, r: fit.r, a0: a0 };
  /* AN ARC IS HELD TO TIGHTER: a sketched curve (a parabola, a sine) paused at its end must not turn into a circle's piece */
  if (cover >= 40 && cover < 300 && dev > tol && rms <= 0.05 * fit.r && worst <= 0.12 * fit.r) return { kind: 'arc', c: fit.c, r: fit.r, a0: a0, span: turn };
  return null;
}
/* A STRAIGHTENED END (px): through the grid's snap, the ruler's level/upright lock against the other end, and back onto the stroke's own start to close a shape */
function padEndAt_(g, p, from, home) {
  g.hold = null;
  let f = p, axis = '';
  if (from) {
    const dx = f[0] - from[0], dy = f[1] - from[1], ang = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;
    if (ang <= PAD_LOCK_DEG || ang >= 180 - PAD_LOCK_DEG) { f = [f[0], from[1]]; axis = 'x'; }
    else if (Math.abs(ang - 90) <= PAD_LOCK_DEG) { f = [from[0], f[1]]; axis = 'y'; }
  }
  if (home && Math.hypot(f[0] - home[0], f[1] - home[1]) <= PAD_SNAP_OWN) return home.slice();
  const t = g.board ? null : padSnap_(g, f[0], f[1], axis);
  g.hold = null;
  return t ? [t.x, t.y, t.u] : f;
}
const padUnit_ = (g, p) => p[2] ? [Math.round(p[2][0]), Math.round(p[2][1])] : [Math.round(p[0] / g.sx), Math.round(p[1] / g.sy)];
/* THE PAUSE, ACTED ON: the run since the last corner replaced by its shape, shown at once; a line's end is a corner the pen goes on from */
function padStraighten_(g) {
  const st = PAD_ST, q0 = g.q0 || 0, sx = g.sx, sy = g.sy, P = [];
  for (let i = 2 * q0; i + 1 < st.length; i += 2) P.push([st[i] * sx, st[i + 1] * sy]);
  /* THE TREMBLE OF THE PAUSE ITSELF IS NOT THE SHAPE: the points still inside the pause's zone are left out, the finger's place put back */
  const tip = [g.at[0] * sx, g.at[1] * sy], hz = g.hz || tip;
  while (P.length > 1 && Math.hypot(P[P.length - 1][0] - hz[0], P[P.length - 1][1] - hz[1]) <= PAD_HOLD_PX) P.pop();
  P.push(tip);
  const sh = padShapeOf_(P, !q0);
  if (!sh) return false;
  let out;
  if (sh.kind === 'line') {
    const home = q0 ? [st[0] * sx, st[1] * sy] : null;
    const a = q0 ? P[0] : padEndAt_(g, P[0], null, null);
    const b = padEndAt_(g, P[P.length - 1], a, home);
    const ua = padUnit_(g, a), ub = padUnit_(g, b);
    out = st.slice(0, 2 * q0).concat(ua);
    if (ub[0] !== ua[0] || ub[1] !== ua[1]) out.push(ub[0], ub[1]);
    g.q0 = out.length / 2 - 1;
    g.qz = tip;
    g.lz = null;
  } else {
    const t = g.board ? null : padSnap_(g, sh.c[0], sh.c[1], '');
    g.hold = null;
    const c = t ? t.u : [sh.c[0] / sx, sh.c[1] / sy];
    out = padArc_(c, sh.r, sx, sy, sh.a0, sh.kind === 'ring' ? 2 * Math.PI : sh.span);
    g.frozen = true;
  }
  g.shaped = sh.kind;
  PAD_ST = out;
  padLiveShow_();
  try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) { /* the browser may refuse this; nothing depends on it */ }
  return true;
}

/* ---------- A FINGER'S NEXT FEW MS, PREDICTED (374; 338 section 9's revisit): preview only, at most `PAD_PRED_PX` ahead, a finger's freehand line only */
const PAD_PRED_PX = 12;
function padPredict_(g, e, r) {
  if (g.tool !== 'pen' || g.dot || g.frozen || g.qz || !isTouchPointer_(g.c) || !PAD_ST || PAD_ST.length < 4) return null;
  const pr = typeof e.getPredictedEvents === 'function' ? e.getPredictedEvents() : null;
  const q = pr && pr.length ? pr[pr.length - 1] : null;
  const u = q ? padMap_(r, q.clientX, q.clientY) : null, n = PAD_ST.length;
  if (!u || (u[0] === PAD_ST[n - 2] && u[1] === PAD_ST[n - 1])) return null;
  return Math.hypot((u[0] - PAD_ST[n - 2]) * g.sx, (u[1] - PAD_ST[n - 1]) * g.sy) <= PAD_PRED_PX ? u : null;
}
/* ---------- EVERY SAMPLE THE FINGER GAVE § */
function padSamples_(e) {
  const co = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
  return co && co.length ? co : [e];
}

/* ---------- A STROKE STARTS: today's start, for one contact § */
function padStart_(c, at, r) {
  const pad = c.ink.closest('.qpad');
  PAD_GO = { tool: padToolNow_(pad), ink: c.ink, from: at, sx: r.width / 340, sy: r.height / 340,
             r: 0, rMax: 0, a: null, a0: 0, sweep: 0, held: false, tip: null, id: c.id,
             c: c, t0: c.t0, k: padAspectOf_(pad), est: false, pen: false, dirty: false, live: [], start: 0,
             box: r, board: !!pad && padIsBoard_(pad.getAttribute('data-k')), lat: null, tg: null, hold: null, gain: null,
             at: at.slice(), fp: null, raw: at.slice(), dot: false, far: 0, loupe: 0 };
  const g = PAD_GO;
  /* A PLACEMENT, PUT DOWN (357): the pin and the ruler's first end where they snap, and the pen's touch a
     DOT -- one point -- until it has gone `PAD_DOT_PX`. Not on the board: it never snaps, and its taps are as before. */
  if (!g.board) {
    g.lat = padLattice_(pad, r);
    g.tg = padTargets_(g, pad);
    /* A MOUSE OR A STYLUS IS NOT PLACING A DOT: it lands where it is put, so an arrowhead's 8px stroke stays a stroke and is not snapped onto the shaft (368) */
    g.dot = g.tool === 'pen' && !padSteady_(g);
    g.from = g.tool === 'pen' && !g.dot ? at.slice() : padPlace_(g, at, true);
  }
  PAD_ST = g.tool === 'compass' ? [] : g.from.slice();
  c.role = 'owner';
  padLoupeWant_(g);
  return g;
}
/* ONE SAMPLE OF THE OWNER, THROUGH ITS TOOL. § */
function padStep_(g, at) {
  let st;
  if (g.tool === 'pen' && g.dot) {
    const r = g.raw;
    if (r[r.length - 2] !== at[0] || r[r.length - 1] !== at[1]) r.push(at[0], at[1]);
    const p = padPlace_(g, at, false);
    const f = g.gain ? [g.at[0] * g.sx, g.at[1] * g.sy] : [at[0] * g.sx, at[1] * g.sy];
    g.far = Math.max(g.far, Math.hypot(f[0] - g.raw[0] * g.sx, f[1] - g.raw[1] * g.sy));
    if (g.far < PAD_DOT_PX) {
      if (PAD_ST.length === 2 && PAD_ST[0] === p[0] && PAD_ST[1] === p[1]) { padLoupeStep_(g, at); return; }
      st = p;
    } else { g.dot = false; g.hold = null; g.gain = null; g.at = at.slice(); st = r.slice(); }
  } else {
    if (g.tool === 'pen') g.at = at.slice();
    /* A COMPASS WHOSE SWING HOLDS ITS RADIUS IS DRAWING, not placing: no halo left at the radius's old target. */
    if (g.tool === 'compass' && g.held) g.hold = null;
    st = PAD_DRAW[g.tool].move(g, g.tool === 'pen' || g.board || (g.tool === 'compass' && g.held) ? at : padPlace_(g, at, false), PAD_ST);
  }
  padLoupeStep_(g, at);
  if (g.tool === 'pen' && !g.dot) padHoldWatch_(g);
  if (!st) return;
  PAD_ST = st;
  g.dirty = true;
}
/* A CANDIDATE'S OWN SAMPLES, in units of its own ink, for the day it turns out to be the finger. */
function padKeep_(pts, at) {
  if (pts.length && pts[pts.length - 2] === at[0] && pts[pts.length - 1] === at[1]) return;
  pts.push(at[0], at[1]);
}

/* ---------- WHAT IS ON THE SCREEN OF IT ----------------------------------------------------------- */
function padLiveOff_(g) {
  if (!g || !g.ink) return;
  (g.live || []).forEach(p => p.remove());
  g.live = [];
  g.ink.querySelectorAll('[data-live]').forEach(p => p.remove());
  const aid = g.ink.querySelector('.qpad-aid');
  if (aid) aid.innerHTML = '';
  padLoupeOff_(true);
}
function padLivePath_(g, d) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  path.setAttribute('data-live', '1');
  const host = g.ink.querySelector('.qpad-g');
  if (host) host.appendChild(path);
  return path;
}
/* ---------- THE PEN'S LIVE PATH, ONCE A FRAME, IN CHUNKS § */
const PAD_CHUNK = 128;
/* ONE CHUNK: points a..b, through the one segment writer `padPath_` uses. */
const padChunk_ = (st, k, a, b) => 'M' + st[2 * a] + ' ' + st[2 * a + 1] + padSegs_(st, k, a, b);
function padChunks_(g) {
  g.dirty = false;
  const st = PAD_ST, n = st.length / 2;
  let open = g.live[g.live.length - 1];
  /* A REPAINT OF THIS PAD TOOK THE CHUNKS (an Undo from the other hand, a copy repainted): drawn again whole. */
  if (!open || !open.isConnected) {
    g.live.forEach(p => p.remove());
    open = padLivePath_(g, '');
    g.live = [open];
    g.start = 0;
  }
  while (n - 1 - g.start >= PAD_CHUNK + 2) {
    const b = g.start + PAD_CHUNK;
    open.setAttribute('d', padChunk_(st, g.k, g.start, b));
    open = padLivePath_(g, '');
    g.live.push(open);
    g.start = b;
  }
  open.setAttribute('d', g.start ? padChunk_(st, g.k, g.start, n - 1) : padPath_(st, g.k, true));
}
/* THE PREVIEW, DRAWN WHOLE FROM EVERY SAMPLE KEPT -- at the start, and when a hold resolves. Now, not at
   the next frame: the dot is under the finger the moment it lands. */
function padLiveShow_() {
  const g = PAD_GO;
  if (!g) return;
  padLiveOff_(g);
  g.start = 0;
  /* NOR WHAT CANNOT BE KEPT: a pin's or a palm's ruler line or ring while it is not known to be the one drawing (`padRace_`)
     -- the third review watched a palm's line and ring follow it round the picture and vanish at the lift. */
  if (!padShown_(g)) { g.dirty = false; return; }
  g.live = [padLivePath_(g, '')];
  if (g.tool === 'pen') padChunks_(g);
  else { g.live[0].setAttribute('d', padPath_(PAD_ST, g.k, true)); g.dirty = false; padAid_(g); }
}
/* AND AS IT GROWS: the pen at the next frame, the ruler and the compass now. */
function padLive_() {
  const g = PAD_GO;
  if (!g || PAD_HUSH || !g.dirty) return;
  if (g.tool === 'pen') { padFrameWant_(); return; }
  g.dirty = false;
  if (!padShown_(g)) return;
  const live = g.live[0];
  if (live) live.setAttribute('d', padPath_(PAD_ST, g.k, true));
  padAid_(g);
}

/* ---------- THE TRANSITIONS --------------------------------------------------------------------- */
/* NOTHING OF THE STROKE: no preview, no aid, nothing stored. The owner's contact stays (it is still down). */
function padWithdraw_() {
  padHoldClear_();
  const g = PAD_GO;
  PAD_ST = null; PAD_GO = null; PAD_HUSH = null; PAD_DUE = null;
  if (g) { padLiveOff_(g); if (g.c && g.c.role === 'owner') g.c.role = 'rest'; }
}
/* HELD: see `PAD_HUSH`. The candidate's own samples are kept from now on, if it is on the ink. */
function padHush_(c, kind) {
  c.role = 'cand';
  c.h0 = c.p.slice();
  c.pts = null;
  if (c.onInk && c.ink && c.ink.isConnected) {
    const at = padMap_(c.ink.getBoundingClientRect(), c.p[0], c.p[1]);
    if (at) c.pts = at;
  }
  PAD_HUSH = { cand: c, kind: kind, from: PAD_GO.c.p.slice() };
  padLiveOff_(PAD_GO);
}
/* THE OWNER WAS THE FINGER: the preview comes back from every sample kept, and the other is a rest. */
function padResume_() {
  const h = PAD_HUSH;
  if (h && h.cand && h.cand.role === 'cand') { h.cand.role = 'rest'; h.cand.pts = null; }
  PAD_HUSH = null;
  padLiveShow_();
}
/* THE OTHER WAS THE FINGER (a palm landed first): § */
function padSwap_(c, held) {
  const old = PAD_GO ? PAD_GO.c : null;
  padWithdraw_();
  if (old && PAD_TOUCH.get(old.id) === old) old.role = 'rest';
  const pts = c.pts || [];
  c.pts = null;
  if (pts.length < 2 || !c.ink || !c.ink.isConnected) { c.role = 'rest'; return; }
  const r = c.ink.getBoundingClientRect();
  const g = padStart_(c, pts.slice(0, 2), r);
  for (let i = 2; i + 1 < pts.length; i += 2) padStep_(g, [pts[i], pts[i + 1]]);
  if (held) { PAD_HUSH = { cand: null, kind: 'b', from: c.h0.slice() }; padLiveOff_(g); }
  else padLiveShow_();
}
/* TWO FINGERS: whatever the owner drew goes, and nothing is drawn until every one of these lifts. */
function padTwo_(more) {
  const who = [];
  if (PAD_GO && PAD_GO.c) who.push(PAD_GO.c);
  if (PAD_HUSH && PAD_HUSH.cand) who.push(PAD_HUSH.cand);
  (more || []).forEach(c => { if (c) who.push(c); });
  padWithdraw_();
  who.forEach(c => { if (PAD_TOUCH.get(c.id) === c) { c.role = 'two'; c.pts = null; PAD_TWO.add(c.id); } });
  PAD_TOUCH.forEach(c => { if (c.role === 'watch' || c.role === 'cand') c.role = 'rest'; });
}
/* A STROKE IS TENTATIVE while its finger is still a dot, or younger than `PAD_TOGETHER_MS`, or held. */
const padTentative_ = now => !!PAD_GO && !PAD_GO.est
  && (!!PAD_HUSH || PAD_GO.c.far < PAD_STILL_PX || !(now - PAD_GO.t0 >= PAD_TOGETHER_MS));

/* ---------- WHO MOVED, AND WHETHER WITH THE OTHER: JUDGED AT ONE MOMENT § */
/* THE ONES BEING TOLD APART, each with the point it is measured from: § */
function padParties_() {
  const g = PAD_GO;
  if (!g) return [];
  const o = g.c, h = PAD_HUSH, out = [{ c: o, ref: h ? h.from : o.p0 }];
  if (h && h.cand && PAD_TOUCH.get(h.cand.id) === h.cand) out.push({ c: h.cand, ref: h.cand.h0 });
  PAD_TOUCH.forEach(x => { if (x.role === 'watch' && x.m0) out.push({ c: x, ref: x.m0 }); });
  return out;
}
/* THE DECISION, if it can be made. `force` is a lift, a cancel or the page going: decided from where each one is. */
function padJudge_(force) {
  PAD_DUE = null;
  if (!PAD_GO || PAD_TWO.size) return;
  const ps = padParties_();
  if (ps.length < 2 && !PAD_HUSH) return;
  /* THE MOMENT: the latest every one still reporting has reported. One silent for `PAD_LAG_MS` has not moved since. */
  let latest = -Infinity;
  ps.forEach(p => { if (p.c.ts > latest) latest = p.c.ts; });
  let tc = latest;
  if (!force) ps.forEach(p => { if (p.c.ts > latest - PAD_LAG_MS && p.c.ts < tc) tc = p.c.ts; });
  ps.forEach(p => {
    const at = force ? [0, p.c.p[0], p.c.p[1]] : padPos_(p.c, tc);
    p.d = Math.hypot(at[1] - p.ref[0], at[2] - p.ref[1]);
  });
  const far = ps.reduce((a, b) => (b.d > a.d ? b : a));
  if (far.d < PAD_STILL_PX) {
    /* NOBODY HAS GONE 10px AT A MOMENT ALL HAVE REPORTED -- though one has by its own latest: the others' reports are
       still coming. Asked again at the frame after their next event; a lift decides it. */
    if (ps.some(p => padDist_(p.ref, p.c.p) >= PAD_STILL_PX)) PAD_DUE = { at: tc };
    return;
  }
  const moving = ps.filter(p => p.d >= PAD_ALSO_PX);
  if (moving.length > 1) {
    /* MORE THAN ONE HAS MOVED: a pan, or a hand settling as the finger goes? Not yet known. */
    if (far.d < PAD_KEEPUP_PX && !force) { PAD_DUE = { at: tc }; return; }
    const kept = moving.filter(p => p.d >= PAD_WITH * far.d);
    if (kept.length > 1) { padTwo_(kept.map(p => p.c)); return; }
  }
  /* A LATER CONTACT IS HANDED THE STROKE ONLY ONCE IT HAS GONE `PAD_KEEPUP_PX` (fourth review, 12 Oct). § */
  if (padOwed_(far.c) && far.d < PAD_KEEPUP_PX) { if (!force) PAD_DUE = { at: tc }; return; }
  padAlone_(far.c);
}
/* THE ONE TO BE HANDED THE STROKE, NOT YET HAVING SHOWN IT IS DRAWING -- it waits for `PAD_KEEPUP_PX`: § */
const padOwed_ = c => !!PAD_HUSH && PAD_HUSH.kind === 'b' && (c === PAD_HUSH.cand ? padTakes_(c) : c === PAD_GO.c && (c.late || !PAD_HUSH.cand));
/* ONE OF THEM MOVED, ALONE. § */
function padAlone_(x) {
  const o = PAD_GO.c, h = PAD_HUSH, cand = h ? h.cand : null;
  if (x === o) {
    PAD_TOUCH.forEach(c => { if (c.role === 'watch') c.role = 'rest'; });
    if (h) padResume_();
    return;
  }
  if (x.role === 'watch') { x.role = 'rest'; return; }
  if (!h || x !== cand) return;
  if (h.kind === 'a') { padTwo_(); return; }
  if (padTakes_(cand)) { padSwap_(cand, false); return; }
  const pinned = padPinned_(cand);
  cand.role = 'rest'; cand.pts = null;
  /* REFUSED, SO THE STILL ONE IS THE STROKE AGAIN -- and a ruler's or a compass's still owner is a PIN or a PALM until it shows otherwise. § */
  if (PAD_GO.tool !== 'pen') PAD_GO.min = Math.max(PAD_GO.min || 0, PAD_STILL_PX);
  if (pinned) {
    (PAD_GO.refused || (PAD_GO.refused = [])).push(cand);
    /* THE RACE STARTS WHERE THE STILL ONE WAS WHEN THE FIRST REFUSED ONE LANDED (fourth review), by the samples' clock: § */
    if (PAD_GO.raceAt === undefined) { PAD_GO.raceAt = cand.t0; PAD_GO.raceFrom = padPos_(PAD_GO.c, cand.t0).slice(1); }
  }
  padResume_();
  padRace_(PAD_GO, false);
}
