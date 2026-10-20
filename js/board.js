/* @family. — js/board.js: the Tools whiteboard, a maths notebook for one finger (377). Write big in the pad;
   it lands small at the caret on the page above, and the pad moves on as the writing nears its edge. */

/* ---------- THE PAGE, IN NOTEBOOK UNITS (nu): one width on every device, so a board drawn on a phone reads the same on a laptop ---------- */
const NB = { W: 360, LEFT: 14, RIGHT: 346, LINE: 64, BASE: 40, XH: 12, GAP: 4, Q: 4 };
const nbBase_ = line => line * NB.LINE + NB.BASE;
/* A LINE OWNS FROM 0.7 OF A LINE ABOVE ITS BASELINE TO 0.3 BELOW: a fraction's denominator and a g's tail stay on the line they hang from. */
const nbLineOf_ = y => Math.max(0, Math.floor((y - NB.BASE) / NB.LINE + 0.7));

/* ---------- THE HAND (px, ms) ---------- */
const NB_PALM_PX = 44;     // wider than this is a palm, but only beside a narrower contact: an iPhone fingertip alone reports 42-63 (2 x UITouch radius)
const NB_EDGE_PX = 12;     // a touch landing this near the screen's side is a grip or the system's back swipe
const NB_SECOND_MS = 180;  // a second finger this soon is a gesture; later, it is a hand settling while the first one writes
const NB_SECOND_PX = 16;
const NB_TAP_MS = 450, NB_TAP_PX = 12;
const NB_STILL_PX = 5, NB_HOLD_MS = 480;  // held this still this long at the end of a line: straighten it
const NB_SNAP_DEG = 8;                    // and within this of level or upright, make it exactly so
const NB_AIM_MS = 220, NB_PICK_MS = 520, NB_LASSO_MS = 800;
const NB_IDLE_MS = 400;                   // a pause this long after a stroke is the end of a glyph: the pad may move on
const NB_KEEP = 0.3;                      // a fresh or tapped caret sits this far into the pad
/* THE PAD MOVES ON ONLY WHEN LITTLE ROOM IS LEFT (under 28% of it, or a stroke reaching 90%), and then just far enough to leave 60% free: the 40% behind keeps the last word, as a ghost. */
const NB_ROOM_LOW = 0.28, NB_ROOM = 0.6, NB_EDGE_NOW = 0.9;
const NB_GLIDE_MS = 340;                  // every move of the pad or the page is a glide this long, eased out; a dropped frame slows it, never skips it
/* A CARRIAGE RETURN: a quick, long, level stroke from right to left. No sign in maths is written that way, so it cannot be writing. */
const NB_RETURN_PX = 100, NB_RETURN_W = 0.35, NB_RETURN_MS = 400;
const NB_SUPER_K = 0.62;

/* ---------- THE SHAPES THE TILES PUT DOWN: which boxes each has, and how tall the pad's view of it is (nu) ---------- */
const NB_SHAPES = {
  frac: { roles: ['n', 'd'], h: 56, icon: 'frac', label: 'Fraction' },
  pow: { roles: ['e'], h: 34, icon: 'power', label: 'Power' },
  root: { roles: ['r'], h: 40, icon: 'root', label: 'Root' },
  int: { roles: ['u', 'l'], h: 58, icon: 'integral', label: 'Integral' },
};

/* ---------- ONE STATE PER STORAGE KEY, so a repaint, a second copy on Saved and Undo all see the same board ---------- */
const NB_STATE = new Map();
const NB_LIVE = new Set();
const NB_PTR = new Map();   // every finger down on a board: id -> { x, y, x0, y0 } in client px
const NB_REJ = new Set();   // ids refused at landing (palm, edge, a hand settling), ignored until they lift
let NB_G = null;            // the gesture in progress, on one board

function nbState_(k) {
  const raw = typeof ansValue_ === 'function' ? ansValue_(k) : null;
  let st = NB_STATE.get(k);
  if (st && st.raw === raw) return st;
  st = { k, raw, items: nbDecode_(raw), undo: [], redo: [], caret: { line: 0, x: NB.LEFT }, mode: null, pv: null,
         nv: { x: 0, y: 0, z: 1 }, runR: NB.LEFT - NB.GAP, sel: null, sup: null, prev: null, ver: 1, cver: 0 };
  nbCaretEnd_(st);
  NB_STATE.set(k, st);
  return st;
}

/* ---------- THE STORED FORMAT: the pen's JSON array of strokes, still, so `ansJoin_`'s union and `ansKeeps_` work unchanged ---------- */
/* A stroke is { p: [x0, y0, dx, dy, ...] in quarter units, w: a width digit a point, b: 'shape:box' inside a shape, e: 1 in an equals sign }. */
function nbDecode_(raw) {
  let arr = [];
  try { arr = JSON.parse(raw || '[]'); } catch (e) {}
  return (Array.isArray(arr) ? arr : []).map(nbItem_);
}
function nbItem_(el) {
  /* THE PEN'S FLAT POLYLINE, 340 units across, from before 377: drawn where it was, and stored exactly as it was until it is moved. */
  if (Array.isArray(el)) {
    const f = NB.W / 340, pts = [];
    for (let i = 0; i + 1 < el.length; i += 2) pts.push([(+el[i] || 0) * f, (+el[i + 1] || 0) * f, 1.4]);
    return pts.length ? nbMeta_({ pts, b: '', e: 0, enc: el }) : { other: 1, enc: el };
  }
  if (el && typeof el === 'object' && Array.isArray(el.p)) {
    const pts = [], w = String(el.w || '');
    let x = 0, y = 0;
    for (let i = 0; i + 1 < el.p.length; i += 2) {
      x += +el.p[i] || 0; y += +el.p[i + 1] || 0;
      const d = w[i / 2];
      pts.push([x / NB.Q, y / NB.Q, 0.7 + (d === undefined ? 5 : +d || 0) * 0.13]);
    }
    return pts.length ? nbMeta_({ pts, b: String(el.b || ''), e: el.e ? 1 : 0, enc: el }) : { other: 1, enc: el };
  }
  if (el && typeof el === 'object' && NB_SHAPES[el.t]) return { t: el.t, id: String(el.i || ''), x: (+el.x || 0) / NB.Q, y: (+el.y || 0) / NB.Q, enc: el };
  /* ANYTHING ELSE IS KEPT AS IT IS AND NOT DRAWN: a newer board's element must survive an older page saving over it. */
  return { other: 1, enc: el };
}
function nbMeta_(s) {
  s.box = inkBox_(s.pts);
  s.line = s.b ? -1 : nbLineOf_((s.box.t + s.box.b) / 2);
  return s;
}
/* WHAT IS KEPT IN MEMORY IS WHAT WAS STORED, quantised and thinned the same, so the page and the store never disagree by a rounding. */
function nbStroke_(pts, b, e) {
  const p = [], w = [];
  let px = 0, py = 0;
  inkThin_(pts, 0.15).forEach(q => {
    const x = Math.round(q[0] * NB.Q), y = Math.round(q[1] * NB.Q);
    p.push(x - px, y - py); px = x; py = y;
    w.push(Math.max(0, Math.min(9, Math.round(((q[2] || 1.4) - 0.7) / 0.13))));
  });
  const o = { p, w: w.join('') };
  if (b) o.b = b;
  if (e) o.e = 1;
  return nbItem_(o);
}
const nbShapeItem_ = (t, id, x, y) => nbItem_({ t, i: id, x: Math.round(x * NB.Q), y: Math.round(y * NB.Q) });
const nbId_ = () => Math.random().toString(36).slice(2, 8);

/* ---------- WHERE EVERYTHING IS: shapes laid out, box strokes placed, rebuilt once per change ---------- */
function nbCache_(st) {
  if (st.cver === st.ver && st.inks) return;
  st.tms = new Map(); st.kids = new Map(); st.lays = new Map(); st.inks = [];
  st.items.forEach(i => { if (i.t) st.tms.set(i.id, i); });
  st.items.forEach(i => {
    if (!i.pts || !i.b) return;
    const [tid, role] = i.b.split(':');
    let m = st.kids.get(tid);
    if (!m) st.kids.set(tid, m = {});
    (m[role] = m[role] || []).push(i);
  });
  st.tms.forEach(tm => st.lays.set(tm.id, nbLay_(st, tm)));
  st.items.forEach(i => {
    if (i.t) { st.lays.get(i.id).glyph.forEach(g => st.inks.push({ pts: g, item: i, tm: i, box: inkBox_(g) })); return; }
    if (!i.pts) return;
    if (i.b) {
      const [tid, role] = i.b.split(':');
      const lay = st.lays.get(tid), B = lay && lay.boxes[role];
      if (!B) return;
      const pts = i.pts.map(p => [p[0] + B.x, p[1] + B.base, p[2]]);
      st.inks.push({ pts, item: i, tm: st.tms.get(tid), box: inkBox_(pts) });
      return;
    }
    st.inks.push({ pts: i.pts, item: i, tm: null, box: i.box });
  });
  st.cver = st.ver;
}

/* ---------- A SHAPE'S LAYOUT: its boxes grow with what is written in them, so nothing has to be sized in advance ---------- */
function nbLay_(st, tm) {
  const kids = st.kids.get(tm.id) || {};
  const wOf = (r, min) => { let R = -Infinity; (kids[r] || []).forEach(s => { R = Math.max(R, s.box.r); }); return Math.max(min, R + 1.5); };
  const X = tm.x, Y = tm.y, o = { boxes: {}, glyph: [], l: X - 1, r: X };
  const box = (role, x, base, w, A, D) => { o.boxes[role] = { x, base, w, A, D, n: (kids[role] || []).length }; };
  if (tm.t === 'frac') {
    const wn = wOf('n', 9), wd = wOf('d', 9), W = Math.max(wn, wd) + 4, bar = Y - 5;
    box('n', X + 2 + (W - 4 - wn) / 2, bar - 6, wn, 15, 4);
    box('d', X + 2 + (W - 4 - wd) / 2, bar + 17, wd, 15, 4);
    o.glyph.push([[X, bar, 1.5], [X + W, bar, 1.5]]);
    o.r = X + W;
  } else if (tm.t === 'pow') {
    const w = wOf('e', 7);
    box('e', X, Y - 10, w, 10, 3);
    o.r = X + w;
  } else if (tm.t === 'root') {
    const w = wOf('r', 10), top = Y - 19;
    box('r', X + 11, Y, w, 17, 5);
    o.glyph.push([[X, Y - 6, 1.4], [X + 2.5, Y - 7.5, 1.4], [X + 6, Y + 4, 1.5], [X + 10, top, 1.4], [X + 13 + w, top, 1.4]]);
    o.r = X + 13 + w;
  } else if (tm.t === 'int') {
    const wu = wOf('u', 6), wl = wOf('l', 6);
    box('u', X + 9, Y - 21, wu, 8, 2);
    box('l', X + 5, Y + 10, wl, 8, 2);
    o.glyph.push([[X - 1, Y + 6, 1.5], [X + 0.5, Y + 9, 1.5], [X + 2.5, Y + 7, 1.6], [X + 4, Y - 8, 1.8],
                  [X + 5.5, Y - 24, 1.6], [X + 7.5, Y - 27, 1.5], [X + 9, Y - 25, 1.5]]);
    o.r = Math.max(X + 9 + wu, X + 5 + wl, X + 10) + 1;
  }
  let t = Y - 4, b = Y + 2;
  Object.keys(o.boxes).forEach(r => { const B = o.boxes[r]; t = Math.min(t, B.base - B.A); b = Math.max(b, B.base + B.D); });
  o.glyph.forEach(g => g.forEach(p => { t = Math.min(t, p[1]); b = Math.max(b, p[1]); }));
  o.t = t; o.b = b;
  return o;
}

/* ---------- THE CARET ---------- */
function nbLineRight_(st, line) {
  nbCache_(st);
  let R = -Infinity;
  st.inks.forEach(k => {
    const on = k.tm ? nbLineOf_(k.tm.y) === line : k.item.line === line;
    if (on) R = Math.max(R, k.tm ? st.lays.get(k.tm.id).r : k.box.r);
  });
  return R;
}
const nbLineEmpty_ = (st, line) => !isFinite(nbLineRight_(st, line));
function nbFreeLine_(st, from) { let L = from; while (!nbLineEmpty_(st, L) && L < from + 500) L++; return L; }
/* OPENED, THE CARET IS AFTER THE LAST THING WRITTEN — the line furthest down, at its end. */
function nbCaretEnd_(st) {
  nbCache_(st);
  let line = 0;
  st.inks.forEach(k => { line = Math.max(line, k.tm ? nbLineOf_(k.tm.y) : k.item.line); });
  const R = nbLineRight_(st, line);
  st.caret = { line, x: isFinite(R) ? Math.min(R + NB.GAP, NB.RIGHT) : NB.LEFT };
  st.runR = st.caret.x - NB.GAP;
  st.mode = null; st.pv = null; st.sup = null; st.prev = null;
  st.gx = st.runR;
}

/* ---------- THE EQUALS COLUMN: the first = of a run of lines that each hold one ---------- */
function nbEqCol_(st, line, skip) {
  nbCache_(st);
  let col = null;
  for (let i = line; i >= 0; i--) {
    let x = Infinity;
    st.inks.forEach(k => { if (!k.tm && k.item.e && k.item.line === i && !(skip && skip.has(k.item))) x = Math.min(x, k.box.l); });
    if (!isFinite(x)) { if (i === line) continue; break; }
    col = x;
  }
  return col;
}

/* ---------- CHANGES, AND UNDO: every change is one { add, del } and Undo is the same change backwards ---------- */
function nbSave_(st, mark) {
  st.ver++;
  const v = st.items.length ? JSON.stringify(st.items.map(i => i.enc)) : null;
  const max = typeof PAD_BOARD_MAX === 'number' ? PAD_BOARD_MAX : 100000;
  if (v && v.length > max) {
    try { toast('The board is full. Clear it to carry on.'); } catch (e) {}
    return false;
  }
  /* THROUGH THE APP'S ONE WRITER: a `board:` key is marked as whose it is, adopted at sign-in, held for the visit if refused, and never sent. */
  const put = () => { if (typeof ansStore_ === 'function') ansStore_(st.k, v); else if (v === null) localStorage.removeItem(st.k); else localStorage.setItem(st.k, v); };
  /* PUT BACK WITH WHOSE IT WAS (`ansPutBack_`), when Undo refills an emptied board: not judged as new writing over nothing. */
  try { if (mark !== undefined && typeof ansPutBack_ === 'function') ansPutBack_(st.k, mark, put); else put(); } catch (e) {}
  st.raw = typeof ansValue_ === 'function' ? ansValue_(st.k) : v;
  return true;
}
function nbApply_(st, add, del) {
  const gone = new Set(del);
  st.items = st.items.filter(i => !gone.has(i)).concat(add);
}
function nbDo_(st, add, del) {
  const was = st.items;
  let mark = null;
  try { if (typeof ansMarkable_ === 'function' && ansMarkable_(st.k) && typeof ansGoneOf_ === 'function') mark = ansGoneOf_(st.k); } catch (e) {}
  nbApply_(st, add, del);
  if (!nbSave_(st)) { st.items = was; st.ver++; return false; }
  st.undo.push({ add, del, mark });
  if (st.undo.length > 1000) st.undo.shift();
  st.redo.length = 0;
  return true;
}
function nbUndo_(b, back) {
  const st = nbState_(b.k);
  const from = back ? st.redo : st.undo, to = back ? st.undo : st.redo;
  const op = from.pop();
  if (!op) return false;
  const was = st.items;
  if (back) nbApply_(st, op.add, op.del); else nbApply_(st, op.del, op.add);
  if (!nbSave_(st, !back && !was.length ? op.mark : undefined)) { st.items = was; st.ver++; from.push(op); return false; }
  to.push(op);
  nbSettle_(st);
  inkTick_(6);
  nbRefresh_(st);
  return true;
}
/* WHAT A CHANGE FROM ELSEWHERE (Undo, a scribble) CAN LEAVE POINTING AT NOTHING. */
function nbSettle_(st) {
  nbCache_(st);
  if (st.mode && !st.tms.has(st.mode)) st.mode = null;
  st.sup = null; st.prev = null;
  if (st.sel) { const live = new Set(st.items); st.sel = st.sel.filter(i => live.has(i)); if (!st.sel.length) st.sel = null; }
}

/* ---------- THE PAD'S MAPPING: pad px to nu, for the line or for a shape being filled ---------- */
function nbPadS_(b) { return NB.XH / Math.max(34, Math.min(56, b.pad.h * 0.14)); }
function nbMap_(b, st, x0, y0) {
  const P = b.pad, S = nbPadS_(b);
  if (st.pv === null) st.pv = { x: st.caret.x - NB_KEEP * P.w * S };
  const X = x0 === undefined ? st.pv.x : x0;
  nbCache_(st);
  const tm = st.mode && st.tms.get(st.mode);
  if (tm) {
    const lay = st.lays.get(tm.id);
    return { x0: X, y0: (lay.t + lay.b) / 2, py0: P.h / 2, s: Math.min(S * 0.7, NB_SHAPES[tm.t].h / P.h), tm, S };
  }
  return { x0: X, y0: y0 === undefined || y0 === null ? nbBase_(st.caret.line) : y0, py0: P.h * 0.6, s: S, tm: null, S };
}
const nbToNu_ = (m, p) => [m.x0 + p[0] * m.s, m.y0 + (p[1] - m.py0) * m.s, (p[2] || 1.4) * m.s];

/* ---------- COMMITTING A STROKE WRITTEN IN THE PAD ---------- */
function nbCommit_(b, m, padPts, ruled) {
  const st = nbState_(b.k);
  nbCache_(st);
  let nu = padPts.map(p => nbToNu_(m, p));
  /* RUBBED OUT: a scribble over ink takes the ink away and is not kept itself. Over nothing, it is writing. */
  if (!ruled && inkScribble_(nu) && nbErase_(st, nu)) { nbRefresh_(st); return; }
  if (m.tm && st.tms.has(m.tm.id)) {
    const role = nbRoleAt_(st, m.tm, nu);
    if (role) {
      const B = st.lays.get(m.tm.id).boxes[role];
      nbDo_(st, [nbStroke_(nu.map(p => [p[0] - B.x, p[1] - B.base, p[2]]), m.tm.id + ':' + role, 0)], []);
      nbRefresh_(st);
      return;
    }
    /* WRITTEN BESIDE THE SHAPE: out of it and onto the line, at the line's size — the integrand after an integral's limits. */
    const lay = st.lays.get(m.tm.id), bx = inkBox_(nu), k = m.S / m.s;
    st.mode = null;
    st.caret = { line: nbLineOf_(m.tm.y), x: lay.r + NB.GAP };
    st.runR = lay.r;
    nu = nu.map(p => [lay.r + NB.GAP + (p[0] - bx.l) * k, nbBase_(st.caret.line) + (p[1] - m.tm.y) * k, p[2]]);
    st.pv = { x: lay.r - 0.15 * b.pad.w * m.S };
  }
  nbLineInk_(b, st, nu);
  nbRefresh_(st);
}
/* WHICH BOX OF A SHAPE A STROKE WAS WRITTEN IN: the nearest, unless it is well clear of them all. */
function nbRoleAt_(st, tm, nu) {
  const lay = st.lays.get(tm.id), bx = inkBox_(nu), cx = (bx.l + bx.r) / 2, cy = (bx.t + bx.b) / 2;
  if (cx > lay.r + 3) return null;
  let best = null, bd = Infinity;
  NB_SHAPES[tm.t].roles.forEach(r => {
    const B = lay.boxes[r];
    const dx = Math.max(B.x - 2 - cx, 0, cx - (B.x + B.w + 6)), dy = Math.max(B.base - B.A - 2 - cy, 0, cy - (B.base + B.D + 2));
    const d = Math.hypot(dx, dy);
    if (d < bd) { bd = d; best = r; }
  });
  return bd > 8 ? null : best;
}
/* ---------- ON THE LINE: superscripts, equals signs and where the caret goes ---------- */
function nbLineInk_(b, st, nu) {
  const line = st.caret.line, base = nbBase_(line);
  let box = inkBox_(nu);
  const sup = box.b < base - NB.XH * 1.05 && box.b - box.t < NB.XH * 2.2 && st.runR > NB.LEFT
    && (st.sup ? box.l >= st.sup.l - 2 : box.l >= st.runR - 1);
  if (!sup && st.sup) {
    const sh = nbShrink_(st);
    /* THE GAP THE SHRINK OPENED IS CLOSED: the stroke after an exponent follows the exponent, not where its big copy ended. */
    if (sh && box.l >= sh.rOld - 3) { const d = sh.rOld - sh.rNew; nu = nu.map(p => [p[0] - d, p[1], p[2]]); box = inkBox_(nu); }
  }
  const it = nbStroke_(nu, '', 0);
  it.line = line;
  const prev = st.prev && Date.now() - st.prev.t < 3000 && st.items.indexOf(st.prev.item) !== -1 ? st.prev.item : null;
  if (!sup && prev && prev.line === line && inkEquals_(prev.pts, it.pts)) { nbEquals_(b, st, prev, it); return; }
  if (!nbDo_(st, [it], [])) return;
  st.prev = { item: it, t: Date.now() };
  if (sup) {
    if (!st.sup) st.sup = { items: [], l: box.l, b: box.b, from: st.runR };
    st.sup.items.push(it);
    st.sup.b = Math.max(st.sup.b, box.b);
  }
  st.runR = Math.max(st.runR, box.r);
}
/* WRITTEN HIGH, LANDED SMALL: an exponent is written at full size in the pad's top band and shrunk to an exponent once the pause says it is done. */
function nbShrink_(st) {
  const sp = st.sup;
  st.sup = null;
  if (!sp) return null;
  const live = sp.items.filter(i => st.items.indexOf(i) !== -1);
  if (!live.length) return null;
  const k = NB_SUPER_K, line = live[0].line, O2 = [sp.from + 1, nbBase_(line) - NB.XH * 0.55];
  const moved = live.map(s => {
    const n = nbStroke_(s.pts.map(p => [O2[0] + k * (p[0] - sp.l), O2[1] + k * (p[1] - sp.b), p[2] * 0.85]), '', 0);
    n.line = line;
    return n;
  });
  let rOld = -Infinity, rNew = -Infinity;
  live.forEach(s => { rOld = Math.max(rOld, s.box.r); });
  moved.forEach(s => { rNew = Math.max(rNew, s.box.r); });
  if (!nbDo_(st, moved, live)) return null;
  if (st.runR <= rOld + 0.01) st.runR = Math.max(sp.from, rNew);
  st.caret.x = st.runR + NB.GAP;
  return { rOld, rNew };
}
/* AN = AFTER AN = STARTS THE NEXT LINE, under the first = of the working: long algebra lines itself up with no tap. */
function nbEquals_(b, st, prev, it) {
  const both = prev.pts.concat(it.pts), bx = inkBox_(both), line = st.caret.line;
  nbCache_(st);
  const pair = new Set([prev]);
  const earlier = st.inks.some(k => !k.tm && k.item.e && k.item.line === line && !pair.has(k.item) && k.box.r < bx.l - 2);
  const before = st.inks.some(k => (k.tm ? nbLineOf_(k.tm.y) === line : k.item.line === line && k.item !== prev) && k.box.r < bx.l - 1);
  const col = nbEqCol_(st, line, pair);
  let dx = 0, to = line;
  if (earlier) { to = nbFreeLine_(st, line + 1); dx = (col !== null ? col : bx.l) - bx.l; }
  else if (col !== null && !before) dx = col - bx.l;
  const dy = (to - line) * NB.LINE;
  const mk = s => { const n = nbStroke_(s.map(p => [p[0] + dx, p[1] + dy, p[2]]), '', 1); n.line = to; return n; };
  const a = mk(prev.pts), c = mk(it.pts);
  if (!nbDo_(st, [a, c], [prev])) return;
  st.prev = null;
  st.caret = { line: to, x: bx.r + dx + NB.GAP };
  st.runR = bx.r + dx;
  if (to !== line) { st.pv = { x: bx.l + dx - 0.25 * b.pad.w * nbPadS_(b) }; st.gx = -Infinity; inkTick_(8); nbFollow_(b, st); }
}
/* ---------- RUBBING OUT ---------- */
function nbErase_(st, nu) {
  nbCache_(st);
  const hit = new Set();
  st.inks.forEach(k => { if (inkCovers_(nu, k.pts)) hit.add(k.tm && !k.item.b ? k.tm : k.item); });
  if (st.sel) {
    const sb = nbSelBox_(st), s = inkBox_(nu);
    if (sb && s.l < sb.r && s.r > sb.l && s.t < sb.b && s.b > sb.t) st.sel.forEach(i => hit.add(i));
  }
  if (!hit.size) return false;
  /* A SHAPE GOES WITH EVERYTHING WRITTEN IN IT. */
  st.items.forEach(i => { if (i.b && hit.has(st.tms.get(i.b.split(':')[0]))) hit.add(i); });
  if (!nbDo_(st, [], [...hit])) return false;
  nbSettle_(st);
  inkTick_(10);
  return true;
}

/* ---------- MOVING ON: after a pause, if little room is left in the pad, it glides on just far enough ---------- */
function nbAdvance_(b) {
  const st = nbState_(b.k);
  if (st.sup) nbShrink_(st);
  nbCache_(st);
  const P = b.pad, m = nbMap_(b, st);
  if (!m.tm && st.runR > NB.RIGHT - 6) {
    /* THE LINE IS FULL: on to the next free one, indented under the working's = when there is one. */
    const col = nbEqCol_(st, st.caret.line);
    nbToLine_(b, st, nbFreeLine_(st, st.caret.line + 1), col !== null ? Math.min(col + 12, 120) : NB.LEFT);
    return;
  }
  const R = m.tm ? st.lays.get(m.tm.id).r : st.runR;
  if (!m.tm) st.caret.x = Math.max(st.caret.x, R + NB.GAP);
  if ((R - st.pv.x) / m.s > (1 - NB_ROOM_LOW) * P.w) {
    st.pv.x = R - (1 - NB_ROOM) * P.w * m.s;
    /* WHAT WAS WRITTEN BEFORE THE SLIDE FADES TO A GHOST at the pad's left: where the child is continuing from. */
    if (!m.tm) st.gx = R;
    inkTick_(6);
  }
  nbFollow_(b, st);
  nbRefresh_(st);
}
/* TO THE START OF ANOTHER LINE (a full line, a swipe back, the New line tile): the page scrolls and the pad glides back to its left. */
function nbToLine_(b, st, line, x) {
  if (b.idle) { clearTimeout(b.idle); b.idle = 0; }
  st.caret = { line, x };
  st.runR = x - NB.GAP;
  st.pv = { x: x - 0.08 * b.pad.w * nbPadS_(b) };
  st.gx = -Infinity; st.prev = null; st.sel = null;
  inkTick_(8);
  nbFollow_(b, st);
  nbRefresh_(st);
}
function nbNewLine_(b) {
  const st = nbState_(b.k);
  nbLeave_(b, st);
  if (st.sup) nbShrink_(st);
  nbToLine_(b, st, nbFreeLine_(st, st.caret.line + 1), NB.LEFT);
}
/* A QUICK, LONG, LEVEL STROKE FROM RIGHT TO LEFT, measured on the raw finger. */
function nbReturn_(b, g) {
  const a = g.raw[0], z = g.raw[g.raw.length - 1], dx = a[0] - z[0], dy = Math.abs(z[1] - a[1]);
  return dx >= Math.max(NB_RETURN_PX, NB_RETURN_W * b.pad.w) && dy <= 0.35 * dx
    && performance.now() - g.t0 <= NB_RETURN_MS && inkStray_(g.raw) < 0.15;
}
/* THE NOTEBOOK KEEPS THE CARET'S LINE IN VIEW, scrolling only when it would otherwise leave. */
function nbFollow_(b, st) {
  const B = b.book, a = B.w / NB.W * st.nv.z, H = B.h / a, Wn = B.w / a;
  const base = nbBase_(st.caret.line);
  if (base - NB.LINE * 0.75 < st.nv.y || base + NB.LINE * 0.45 > st.nv.y + H) st.nv.y = Math.max(0, base - H * 0.55);
  if (st.nv.z > 1 && (st.caret.x < st.nv.x + 10 || st.caret.x > st.nv.x + Wn - 10)) st.nv.x = Math.max(0, Math.min(NB.W - Wn, st.caret.x - Wn * 0.6));
}

/* ---------- THE TILES: a shape at the caret, or the whole board cleared ---------- */
function nbShape_(b, t) {
  if (!NB_SHAPES[t]) return;
  const st = nbState_(b.k);
  nbLeave_(b, st);
  if (st.sup) nbShrink_(st);
  let line = st.caret.line, x = t === 'pow' ? st.runR + 0.8 : st.caret.x;
  if (x > NB.RIGHT - 30) { line = nbFreeLine_(st, line + 1); x = NB.LEFT; }
  const tm = nbShapeItem_(t, nbId_(), x, nbBase_(line));
  if (!nbDo_(st, [tm], [])) return;
  st.caret = { line, x };
  st.mode = tm.id;
  st.prev = null;
  nbCache_(st);
  const lay = st.lays.get(tm.id), m = nbMap_(b, st, 0);
  st.pv = { x: lay.l - 0.12 * b.pad.w * m.s };
  nbFollow_(b, st);
  nbRefresh_(st);
}
/* OUT OF A SHAPE, the caret after it. */
function nbLeave_(b, st) {
  nbCache_(st);
  const tm = st.mode && st.tms.get(st.mode);
  st.mode = null;
  if (!tm) return;
  const lay = st.lays.get(tm.id);
  st.caret = { line: nbLineOf_(tm.y), x: lay.r + NB.GAP };
  st.runR = lay.r;
  st.gx = -Infinity;
  st.pv = { x: lay.r - NB_KEEP * b.pad.w * nbPadS_(b) };
}
function nbClear_(b) {
  const st = nbState_(b.k);
  if (!st.items.length) return;
  if (!nbDo_(st, [], st.items.slice())) return;
  st.mode = null; st.sel = null; st.sup = null; st.prev = null;
  st.caret = { line: 0, x: NB.LEFT }; st.runR = NB.LEFT - NB.GAP; st.pv = null; st.nv = { x: 0, y: 0, z: 1 }; st.gx = -Infinity;
  nbRefresh_(st);
}

/* ---------- TAPPING THE PAGE: the caret goes there, or into the shape under the finger ---------- */
function nbTap_(b, nx, ny) {
  const st = nbState_(b.k);
  nbCache_(st);
  if (st.sup) nbShrink_(st);
  nbCache_(st);
  const tm = [...st.tms.values()].find(t => { const l = st.lays.get(t.id); return nx >= l.l - 2 && nx <= l.r + 2 && ny >= l.t - 2 && ny <= l.b + 2; });
  st.sel = null; st.prev = null;
  if (tm) {
    st.mode = tm.id;
    st.caret = { line: nbLineOf_(tm.y), x: st.lays.get(tm.id).r + NB.GAP };
    const m = nbMap_(b, st, 0);
    st.pv = { x: st.lays.get(tm.id).l - 0.12 * b.pad.w * m.s };
  } else {
    st.mode = null;
    const line = nbLineOf_(ny), R = nbLineRight_(st, line);
    let x = nx;
    if (isFinite(R) && nx > R) x = R + NB.GAP;
    else if (!isFinite(R) && nx < NB.LEFT + 30) x = NB.LEFT;
    x = Math.max(NB.LEFT, Math.min(NB.RIGHT - 4, x));
    st.caret = { line, x };
    st.runR = x - NB.GAP;
    st.gx = st.runR;
    st.pv = { x: x - NB_KEEP * b.pad.w * nbPadS_(b) };
  }
  nbFollow_(b, st);
  nbRefresh_(st);
}

/* ---------- SELECTING: a long press on writing takes the term it is part of; on paper, a lasso ---------- */
function nbHit_(st, nx, ny, r) {
  nbCache_(st);
  let best = null, bd = r;
  st.inks.forEach(k => {
    if (nx < k.box.l - r || nx > k.box.r + r || ny < k.box.t - r || ny > k.box.b + r) return;
    /* TO THE SEGMENTS, not the points: a thinned straight stroke is two points with nothing between them. */
    k.pts.forEach((p, i) => {
      const q = k.pts[Math.max(0, i - 1)], dx = p[0] - q[0], dy = p[1] - q[1], L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, ((nx - q[0]) * dx + (ny - q[1]) * dy) / L)) : 0;
      const d = Math.hypot(q[0] + t * dx - nx, q[1] + t * dy - ny);
      if (d < bd) { bd = d; best = k.tm || k.item; }
    });
  });
  return best;
}
const nbItemBox_ = (st, i) => (i.t ? (l => ({ l: l.l, r: l.r, t: l.t, b: l.b }))(st.lays.get(i.id)) : i.box);
const nbItemLine_ = i => (i.t ? nbLineOf_(i.y) : i.line);
function nbCluster_(st, first) {
  nbCache_(st);
  const line = nbItemLine_(first), pool = st.items.filter(i => (i.t || (i.pts && !i.b)) && nbItemLine_(i) === line);
  const out = [first];
  let grew = true;
  while (grew) {
    grew = false;
    pool.forEach(i => {
      if (out.indexOf(i) !== -1) return;
      const a = nbItemBox_(st, i);
      if (out.some(o => { const c = nbItemBox_(st, o); return a.l <= c.r + 3 && a.r >= c.l - 3 && a.t <= c.b + 3 && a.b >= c.t - 3; })) { out.push(i); grew = true; }
    });
  }
  return out;
}
function nbSelBox_(st) {
  if (!st.sel || !st.sel.length) return null;
  nbCache_(st);
  const u = { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity };
  st.sel.forEach(i => { const a = nbItemBox_(st, i); u.l = Math.min(u.l, a.l); u.t = Math.min(u.t, a.t); u.r = Math.max(u.r, a.r); u.b = Math.max(u.b, a.b); });
  return u;
}
function nbLasso_(st, poly) {
  nbCache_(st);
  if (poly.length < 3) return null;
  const sel = st.items.filter(i => {
    if (i.t) { const l = st.lays.get(i.id); return inkInside_(poly, (l.l + l.r) / 2, (l.t + l.b) / 2); }
    if (!i.pts || i.b) return false;
    return i.pts.filter(p => inkInside_(poly, p[0], p[1])).length >= i.pts.length * 0.6;
  });
  return sel.length ? sel : null;
}
function nbMoveSel_(st, dx, dy) {
  if (!st.sel || (!dx && !dy)) return;
  const add = st.sel.map(i => {
    if (i.t) return nbShapeItem_(i.t, i.id, i.x + dx, i.y + dy);
    const n = nbStroke_(i.pts.map(p => [p[0] + dx, p[1] + dy, p[2]]), '', i.e);
    return n;
  });
  if (nbDo_(st, add, st.sel)) st.sel = add;
}

/* ---------- DRAWING ---------- */
/* PAPER COLOURS, READ FROM THE STYLESHEET'S TOKENS: a canvas cannot take `var()`, and the house rule is no paper colour written twice. */
function nbColours_(el) {
  let cs = null;
  try { cs = getComputedStyle(el); } catch (e) {}
  const v = (n, or) => { const s = cs && cs.getPropertyValue(n).trim(); return s || or; };
  const c = { paper: v('--paper', 'Canvas'), ink: v('--paper-ink', 'CanvasText'), dim: v('--paper-dim', 'GrayText'),
              faint: v('--paper-faint', 'GrayText'), strip: v('--paper-strip', 'Canvas'), rule: v('--paper-rule', 'GrayText') };
  c.inkRgb = nbRgb_(c.ink); c.paperRgb = nbRgb_(c.paper);
  return c;
}
/* A COLOUR AS [r, g, b], read back from a canvas so any CSS colour works; null when it cannot be. */
function nbRgb_(col) {
  try {
    const x = document.createElement('canvas').getContext('2d');
    x.fillStyle = '#000'; x.fillStyle = col;
    const s = String(x.fillStyle);
    if (/^#[0-9a-f]{6}$/i.test(s)) return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
    const m = s.match(/[\d.]+/g);
    return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null;
  } catch (e) { return null; }
}
/* INK PART WAY TO PAPER, as one solid colour: an alpha would darken where a stroke's segments overlap. */
function nbFade_(c, k) {
  if (!c.inkRgb || !c.paperRgb) return c.faint;
  return 'rgb(' + c.inkRgb.map((v, i) => Math.round(v * k + c.paperRgb[i] * (1 - k))).join(',') + ')';
}
function nbDrawAll_(b) {
  if (!b.el.isConnected) return;
  const st = nbState_(b.k);
  b.col = nbColours_(b.el);
  nbDrawBook_(b, st);
  nbDrawPad_(b, st);
}
function nbView_(b, st) {
  /* A STATE MADE AFRESH UNDER THIS COPY (a change from another tab, a check's reset) starts its view where it is, not where the last one was. */
  if (!b.view || b.vst !== st) { b.view = nbTarget_(st); b.vst = st; }
  return b.view;
}
/* WHERE THE VIEWS ARE GOING: the pad along the line (px) and down the page (py, a line's baseline), and the page's scroll (ny). */
const nbTarget_ = st => ({ px: st.pv ? st.pv.x : null, ny: st.nv.y, py: st.mode ? null : nbBase_(st.caret.line) });
function nbDrawBook_(b, st) {
  const B = b.book, ctx = B.ctx;
  if (!ctx) return;
  inkFit_(B.c, ctx, B.w, B.h);
  nbCache_(st);
  const c = b.col, v = nbView_(b, st), a = B.w / NB.W * st.nv.z, bx = -st.nv.x * a, by = -v.ny * a;
  ctx.fillStyle = c.paper; ctx.fillRect(0, 0, B.w, B.h);
  /* THE PAD'S WINDOW, shaded on the page: where the next stroke will land, before it is written. */
  const m = nbMap_(b, st, v.px === null ? undefined : v.px, v.py);
  ctx.fillStyle = c.strip;
  ctx.fillRect(m.x0 * a + bx, (m.y0 - m.py0 * m.s) * a + by, b.pad.w * m.s * a, b.pad.h * m.s * a);
  ctx.strokeStyle = c.rule; ctx.lineWidth = 1;
  const top = Math.floor(v.ny / NB.LINE) - 1, bottom = Math.ceil((v.ny + B.h / a) / NB.LINE) + 1;
  for (let i = Math.max(0, top); i <= bottom; i++) {
    const y = Math.round(nbBase_(i) * a + by) + 0.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(B.w, y); ctx.stroke();
  }
  /* THE = COLUMN, faintly, while the caret is in a run of = lines: where the next = will be put. */
  const col = st.mode ? null : nbEqCol_(st, st.caret.line);
  if (col !== null) {
    ctx.save(); ctx.setLineDash([2, 4]); ctx.strokeStyle = c.rule;
    const x = Math.round(col * a + bx) + 0.5;
    ctx.beginPath(); ctx.moveTo(x, (nbBase_(st.caret.line) - NB.LINE * 0.6) * a + by); ctx.lineTo(x, (nbBase_(st.caret.line) + 6) * a + by); ctx.stroke();
    ctx.restore();
  }
  nbDrawBoxes_(ctx, st, a, bx, by, c);
  const hide = b.drag ? new Set(st.sel || []) : null;
  ctx.fillStyle = ctx.strokeStyle = c.ink;
  const vt = v.ny - 20, vb = v.ny + B.h / a + 20;
  st.inks.forEach(k => {
    if (k.box.b < vt || k.box.t > vb) return;
    if (hide && hide.has(k.tm || k.item)) return;
    inkStroke_(ctx, k.pts, a, bx, by);
  });
  if (st.sel && !b.drag) {
    const s = nbSelBox_(st);
    ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = c.dim; ctx.lineWidth = 1;
    ctx.strokeRect((s.l - 2) * a + bx, (s.t - 2) * a + by, (s.r - s.l + 4) * a, (s.b - s.t + 4) * a);
    ctx.restore();
  }
  if (!st.mode) {
    const base = nbBase_(st.caret.line);
    ctx.fillStyle = c.ink;
    ctx.fillRect(Math.round(st.caret.x * a + bx) - 0.75, (base - NB.XH * 1.6) * a + by, 1.5, (NB.XH * 1.6 + 3) * a);
  }
}
/* A SHAPE'S EMPTY BOXES, dashed: where to write. The shape being filled shows all of them. */
function nbDrawBoxes_(ctx, st, a, bx, by, c) {
  st.tms.forEach(tm => {
    const lay = st.lays.get(tm.id), on = st.mode === tm.id;
    Object.keys(lay.boxes).forEach(r => {
      const B = lay.boxes[r];
      if (B.n && !on) return;
      ctx.save(); ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.strokeStyle = on ? c.dim : c.rule;
      ctx.strokeRect((B.x - 1) * a + bx, (B.base - B.A) * a + by, (B.w + 2) * a, (B.A + B.D) * a);
      ctx.restore();
    });
  });
}
function nbDrawPad_(b, st) {
  const P = b.pad, ctx = P.ctx;
  if (!ctx) return;
  inkFit_(P.c, ctx, P.w, P.h);
  const c = b.col, v = nbView_(b, st), m = nbMap_(b, st, v.px === null ? undefined : v.px, v.py);
  const a = 1 / m.s, bx = -m.x0 / m.s, by = m.py0 - m.y0 / m.s;
  ctx.fillStyle = c.paper; ctx.fillRect(0, 0, P.w, P.h);
  /* PAST THE PAGE'S RIGHT EDGE, shaded: the line is about to wrap. */
  const edge = (NB.RIGHT - m.x0) / m.s;
  if (edge < P.w) { ctx.fillStyle = c.strip; ctx.fillRect(Math.max(0, edge), 0, P.w, P.h); }
  if (!m.tm) {
    /* THE GUIDES: baseline, x-height (dashed) and the top of a tall letter. Above the x-height and right of the writing is an exponent's place. */
    const yb = Math.round(m.py0) + 0.5, yx = Math.round(m.py0 - NB.XH / m.s) + 0.5, ya = Math.round(m.py0 - 2 * NB.XH / m.s) + 0.5;
    ctx.lineWidth = 1;
    ctx.strokeStyle = c.dim; ctx.beginPath(); ctx.moveTo(0, yb); ctx.lineTo(P.w, yb); ctx.stroke();
    ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = c.rule;
    ctx.beginPath(); ctx.moveTo(0, yx); ctx.lineTo(P.w, yx); ctx.stroke();
    ctx.setLineDash([2, 8]);
    ctx.beginPath(); ctx.moveTo(0, ya); ctx.lineTo(P.w, ya); ctx.stroke();
    ctx.restore();
    const cx = Math.round((st.caret.x - m.x0) / m.s) + 0.5;
    ctx.strokeStyle = c.faint; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, yx); ctx.lineTo(cx, yb); ctx.stroke();
  }
  nbDrawBoxes_(ctx, st, a, bx, by, c);
  /* AN EMPTY BOARD SAYS HOW, IN THE PAD ITSELF: words under the board would move the pad when they went. */
  if (!st.items.length) {
    let font = 'monospace';
    try { font = getComputedStyle(b.el).fontFamily || font; } catch (e) {}
    ctx.font = '11px ' + font;
    const wide = Math.max(...NB_HOW.map(t => ctx.measureText(t).width)), px = Math.max(6, Math.min(11, 11 * (P.w - 12) / Math.max(1, wide)));
    ctx.fillStyle = c.faint; ctx.textAlign = 'center'; ctx.font = px.toFixed(1) + 'px ' + font;
    /* AT THE PAD'S TOP, above the tall letters' line: the New line tile has the bottom corner. */
    NB_HOW.forEach((t, i) => ctx.fillText(t, P.w / 2, 6 + px * 1.2 + i * px * 1.4));
  }
  const vl = m.x0 - 4, vr = m.x0 + P.w * m.s + 4, vt = m.y0 - m.py0 * m.s - 4, vb = m.y0 + (P.h - m.py0) * m.s + 4;
  const line = st.caret.line, ghost = nbFade_(c, 1 - 0.55 * (b.gk === undefined ? 1 : b.gk));
  st.inks.forEach(k => {
    if (k.box.r < vl || k.box.l > vr || k.box.b < vt || k.box.t > vb) return;
    const mine = m.tm ? k.tm === m.tm : (k.tm ? nbLineOf_(k.tm.y) === line : k.item.line === line);
    const old = mine && !m.tm && (k.tm ? st.lays.get(k.tm.id).r : k.box.r) <= st.gx + 0.5;
    ctx.fillStyle = ctx.strokeStyle = old ? ghost : mine ? c.ink : c.faint;
    inkStroke_(ctx, k.pts, a, bx, by);
  });
}
/* THE STROKE UNDER THE FINGER: on the pad as written and on the page as it will land, every event. */
function nbDrawLive_(b, g) {
  const P = b.pad, B = b.book, c = b.col || nbColours_(b.el);
  const pts = g.ruled ? [g.pts[0], g.end] : g.pts.concat(g.ahead || []);
  if (P.lctx) {
    inkFit_(P.l, P.lctx, P.w, P.h);
    P.lctx.clearRect(0, 0, P.w, P.h);
    P.lctx.fillStyle = P.lctx.strokeStyle = c.ink;
    inkStroke_(P.lctx, pts, 1, 0, 0);
  }
  if (B.lctx) {
    const st = nbState_(b.k), a = B.w / NB.W * st.nv.z, v = nbView_(b, st);
    inkFit_(B.l, B.lctx, B.w, B.h);
    B.lctx.clearRect(0, 0, B.w, B.h);
    B.lctx.fillStyle = B.lctx.strokeStyle = c.ink;
    inkStroke_(B.lctx, pts.map(p => nbToNu_(g.m, p)), a, -st.nv.x * a, -v.ny * a);
  }
}
function nbClearLive_(b) {
  [b.pad, b.book].forEach(S => { if (S.lctx) { inkFit_(S.l, S.lctx, S.w, S.h); S.lctx.clearRect(0, 0, S.w, S.h); } });
}
/* THE LOUPE: what is under the finger, twice the size and above it, with the caret where it would go. */
function nbDrawLoupe_(b, g) {
  const B = b.book, ctx = B.lctx;
  if (!ctx) return;
  const st = nbState_(b.k), c = b.col || nbColours_(b.el);
  inkFit_(B.l, ctx, B.w, B.h);
  ctx.clearRect(0, 0, B.w, B.h);
  if (g.kind === 'lasso' && g.poly) {
    const a = B.w / NB.W * st.nv.z, v = nbView_(b, st);
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = c.dim; ctx.lineWidth = 1.5; ctx.beginPath();
    g.poly.forEach((p, i) => { const x = (p[0] - st.nv.x) * a, y = (p[1] - v.ny) * a; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.closePath(); ctx.stroke(); ctx.restore();
    return;
  }
  if (g.kind === 'drag') {
    const a = B.w / NB.W * st.nv.z, v = nbView_(b, st);
    ctx.fillStyle = ctx.strokeStyle = c.ink;
    nbCache_(st);
    const sel = new Set(st.sel || []);
    st.inks.forEach(k => { if (sel.has(k.tm || k.item)) inkStroke_(ctx, k.pts, a, (g.off[0] - st.nv.x) * a, (g.off[1] - v.ny) * a); });
    return;
  }
  if (g.kind !== 'aim') return;
  const R = 40, Z = 2, cx = g.cx, cy = g.cy, lx = Math.max(R, Math.min(B.w - R, cx)), ly = cy - 70 < R ? cy + 70 : cy - 70;
  const dpr = B.c.width / Math.max(1, B.w);
  ctx.save();
  ctx.beginPath(); ctx.arc(lx, ly, R, 0, 2 * Math.PI); ctx.clip();
  try { ctx.drawImage(B.c, (cx - R / Z) * dpr, (cy - R / Z) * dpr, (2 * R / Z) * dpr, (2 * R / Z) * dpr, lx - R, ly - R, 2 * R, 2 * R); } catch (e) {}
  ctx.fillStyle = c.ink;
  ctx.fillRect(lx - 1, ly - 14, 2, 18);
  ctx.restore();
  ctx.strokeStyle = c.dim; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(lx, ly, R, 0, 2 * Math.PI); ctx.stroke();
}
/* EVERY COPY OF THIS BOARD, drawn again — the Saved column's too. */
function nbRefresh_(st) {
  NB_LIVE.forEach(b => {
    if (!b.el.isConnected) { NB_LIVE.delete(b); return; }
    if (b.k !== st.k) return;
    nbGlide_(b);
  });
}
/* THE PAD AND THE PAGE GLIDE TO WHERE THEY ARE GOING, eased out over NB_GLIDE_MS, so the eye keeps its place in the working. */
function nbGlide_(b) {
  const st = nbState_(b.k), v = nbView_(b, st);
  const same = (p, q) => ['px', 'ny', 'py'].every(n => (p[n] === null) === (q[n] === null) && Math.abs((p[n] || 0) - (q[n] || 0)) < 0.01);
  const step = now => {
    const T = nbTarget_(st);
    if (!b.tw || !same(b.tw.T, T)) b.tw = { F: Object.assign({}, v), T, t: 0, line: v.py !== T.py };
    const w = b.tw;
    w.t += Math.max(0, Math.min(24, now - b.last));
    b.last = now;
    const k = Math.min(1, w.t / NB_GLIDE_MS), e = 1 - (1 - k) * (1 - k);
    ['px', 'ny', 'py'].forEach(n => { v[n] = w.F[n] === null || w.T[n] === null ? w.T[n] : w.F[n] + (w.T[n] - w.F[n]) * e; });
    b.gk = e;
    nbDrawAll_(b);
    if (k < 1) b.glide = requestAnimationFrame(step); else { b.glide = 0; b.tw = null; }
  };
  if (typeof requestAnimationFrame !== 'function' || !b.book.ctx) { Object.assign(v, nbTarget_(st)); b.gk = 1; nbDrawAll_(b); return; }
  if (b.glide) return;
  if (same(v, nbTarget_(st))) { nbDrawAll_(b); return; }
  b.last = performance.now();
  b.glide = requestAnimationFrame(step);
}
function nbStopGlide_(b) {
  if (b.glide && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(b.glide);
  b.glide = 0; b.tw = null; b.gk = 1;
}
/* MOVED BY THE FINGERS THEMSELVES (two on the pad, a pinch, a wheel): the view is where they put it. */
function nbSnapView_(b) {
  const st = nbState_(b.k);
  nbStopGlide_(b);
  Object.assign(nbView_(b, st), nbTarget_(st));
}
/* A FINGER LANDS MID-GLIDE: a slide along the line stops where it is, never jumping on under the finger; a change of line is finished, as the stroke is for the new line. */
function nbHoldView_(b) {
  const st = nbState_(b.k), v = nbView_(b, st), w = b.tw;
  if (b.glide && w && !w.line) {
    if (st.pv && v.px !== null) st.pv.x = v.px;
    st.nv.y = v.ny;
  }
  nbSnapView_(b);
}

/* ---------- THE HAND ON THE PAD AND THE PAGE ---------- */
/* REFUSED AT LANDING: a touch at the screen's side edge (a grip, or the system's back swipe). Never for its size alone: on an iPhone a lone fingertip is as wide as a palm (docs/history/377) */
function nbRefuse_(e) {
  if (e.pointerType === 'mouse' || e.pointerType === 'pen') return false;
  const W = (typeof innerWidth === 'number' && innerWidth) || 0;
  return W > 0 && (e.clientX < NB_EDGE_PX || e.clientX > W - NB_EDGE_PX);
}
/* A PALM IS A WIDE CONTACT BESIDE A NARROWER ONE: alone, a wide contact is the finger writing */
const nbWide_ = e => e.pointerType !== 'mouse' && e.pointerType !== 'pen' && Math.max(Number(e.width) || 0, Number(e.height) || 0) > NB_PALM_PX;
function nbRect_(S) {
  const r = S.box.getBoundingClientRect ? S.box.getBoundingClientRect() : null;
  return r && r.width ? r : { left: 0, top: 0, width: S.w, height: S.h };
}
function nbSize_(b) {
  [[b.book, 300, 240], [b.pad, 300, 300]].forEach(([S, w, h]) => {
    const r = S.box.getBoundingClientRect ? S.box.getBoundingClientRect() : null;
    S.w = r && r.width ? r.width : w; S.h = r && r.height ? r.height : h;
    /* THE CANVASES ARE ASKED FOR THEIR CONTEXT ONCE THEY HAVE A BOX: a board laid out nowhere (a check's jsdom, a closed column) draws nothing, and needs nothing. */
    if (S.ctx === undefined && r && r.width) { S.ctx = inkContext_(S.c, false); S.lctx = inkContext_(S.l, true); }
  });
}
function nbNoSwipe_(b, on) {
  try { if (on) b.book.box.setAttribute('data-noswipe', ''); else b.book.box.removeAttribute('data-noswipe'); } catch (e) {}
}
function nbEndG_() {
  const g = NB_G;
  NB_G = null;
  if (!g) return;
  (g.timers || []).forEach(t => clearTimeout(t));
  if (g.b) { nbNoSwipe_(g.b, false); g.b.drag = false; nbClearLive_(g.b); }
}
/* A CHANGE OF PERSON, A HIDDEN PAGE: whatever was half drawn is dropped, never kept under the wrong key. */
function nbDrop_() {
  nbEndG_();
  NB_PTR.clear(); NB_REJ.clear();
}

function nbDown_(b, surf, e) {
  if (e.pointerType === 'mouse' && e.button) return;
  if (e.target && e.target.closest && e.target.closest('.tile')) return;
  const id = e.pointerId;
  if (nbRefuse_(e)) { NB_REJ.add(id); return; }
  try { e.preventDefault(); } catch (x) {}
  const S = surf === 'pad' ? b.pad : b.book;
  NB_PTR.set(id, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
  try { S.box.setPointerCapture && S.box.setPointerCapture(id); } catch (x) {}
  const now = performance.now();
  const wide = nbWide_(e);
  let g = NB_G;
  /* A PALM DOWN FIRST, THEN A FINGER: the palm's half-stroke goes and the finger writes. A wide contact beside a finger is the palm, ignored to its lift */
  if (g && g.wide && !wide && g.kind !== 'multi') { g.ids.forEach(x => NB_REJ.add(x)); nbEndG_(); g = null; }
  if (g && wide) { NB_REJ.add(id); return; }
  if (g && (g.b !== b || g.surf !== surf)) { NB_REJ.add(id); return; }
  if (g && g.kind === 'multi') { g.ids.add(id); g.max = Math.max(g.max, g.ids.size); g.c = null; return; }
  if (g) {
    /* A SECOND FINGER SOON AFTER THE FIRST is a two-finger gesture and takes back the first one's start; later, it is a hand coming to rest. */
    /* HOW FAR THE FINGER HAS GONE, raw: the filtered line trails it, and a hand must not pass for a gesture because the filter was slow. */
    const far = g.far || 0, young = far < NB_SECOND_PX || (now - g.t0 < NB_SECOND_MS && far < 4 * NB_SECOND_PX);
    if ((g.kind === 'ink' && young) || g.kind === 'press' || (g.kind === 'aim' && young)) {
      (g.timers || []).forEach(t => clearTimeout(t));
      nbClearLive_(b);
      NB_G = { b, surf, kind: 'multi', ids: new Set([...g.ids, id]), max: g.ids.size + 1, t0: g.t0, moved: false, c: null, d: 0 };
      if (surf === 'book') nbNoSwipe_(b, true);
      return;
    }
    NB_REJ.add(id);
    return;
  }
  nbSize_(b);
  nbHoldView_(b);
  const r = nbRect_(S), st = nbState_(b.k);
  if (b.idle) { clearTimeout(b.idle); b.idle = 0; }
  if (surf === 'pad') {
    const x = e.clientX - r.left, y = e.clientY - r.top, m = nbMap_(b, st);
    const euro = inkEuro2_();
    const f = euro.step(x, y, e.timeStamp || now);
    const w = 1.6 / m.s;
    NB_G = { b, surf, kind: 'ink', ids: new Set([id]), id, t0: now, r, m, euro, pts: [[f[0], f[1], w]], raw: [[x, y]], len: 0,
             w: 1.6, last: [f[0], f[1], e.timeStamp || now], hold: [x, y], timers: [], ruled: false, wide };
    b.col = nbColours_(b.el);
    nbDrawLive_(b, NB_G);
    return;
  }
  /* THE PAGE: a tap moves the caret; a finger that stays puts a loupe over itself; held longer on writing it picks the term up. */
  const a = b.book.w / NB.W * st.nv.z, cx = e.clientX - r.left, cy = e.clientY - r.top;
  const nx = st.nv.x + cx / a, ny = st.nv.y + cy / a;
  const G = NB_G = { b, surf, kind: 'press', ids: new Set([id]), id, t0: now, r, a, cx, cy, nx, ny, moved: 0, timers: [], wide };
  const sb = nbSelBox_(st);
  if (sb && nx >= sb.l - 6 && nx <= sb.r + 6 && ny >= sb.t - 6 && ny <= sb.b + 6) {
    G.kind = 'drag'; G.off = [0, 0]; b.drag = true; nbNoSwipe_(b, true);
    nbDrawAll_(b); nbDrawLoupe_(b, G);
    return;
  }
  G.timers.push(setTimeout(() => {
    if (NB_G !== G || G.kind !== 'press') return;
    G.kind = 'aim'; nbNoSwipe_(b, true); nbDrawLoupe_(b, G);
  }, NB_AIM_MS));
  G.timers.push(setTimeout(() => {
    if (NB_G !== G || G.kind !== 'aim' || G.moved > 8) return;
    const hit = nbHit_(st, G.nx, G.ny, 6);
    if (!hit) return;
    st.sel = nbCluster_(st, hit);
    G.kind = 'drag'; G.off = [0, 0]; b.drag = true;
    inkTick_(12);
    nbDrawAll_(b); nbDrawLoupe_(b, G);
  }, NB_PICK_MS));
  G.timers.push(setTimeout(() => {
    if (NB_G !== G || G.kind !== 'aim' || G.moved > 8) return;
    G.kind = 'lasso'; G.poly = [[G.nx, G.ny]];
    inkTick_(12);
    nbDrawLoupe_(b, G);
  }, NB_LASSO_MS));
}

function nbMove_(b, surf, e) {
  const id = e.pointerId;
  if (NB_REJ.has(id)) return;
  const p = NB_PTR.get(id);
  if (p) { p.x = e.clientX; p.y = e.clientY; }
  const g = NB_G;
  if (!g || g.b !== b || !g.ids.has(id)) return;
  try { e.preventDefault(); } catch (x) {}
  if (g.kind === 'multi') { nbMultiMove_(g); return; }
  if (g.kind === 'ink') { nbInkMove_(b, g, e); return; }
  const st = nbState_(b.k);
  const cx = e.clientX - g.r.left, cy = e.clientY - g.r.top;
  g.moved = Math.max(g.moved, Math.hypot(cx - g.cx, cy - g.cy));
  if (g.kind === 'press') {
    /* MOVED BEFORE IT WAS HELD: a swipe, and the grid's, not ours. */
    if (g.moved > NB_TAP_PX) nbEndG_();
    return;
  }
  const nx = st.nv.x + cx / g.a, ny = st.nv.y + cy / g.a;
  if (g.kind === 'aim') { g.cx = cx; g.cy = cy; g.nx = nx; g.ny = ny; nbDrawLoupe_(b, g); return; }
  if (g.kind === 'drag') { g.off = [nx - g.nx, ny - g.ny]; nbDrawLoupe_(b, g); return; }
  if (g.kind === 'lasso') { g.poly.push([nx, ny]); nbDrawLoupe_(b, g); }
}

function nbInkMove_(b, g, e) {
  const list = inkSamples_(e);
  list.forEach(s => {
    const x = s.clientX - g.r.left, y = s.clientY - g.r.top, t = s.timeStamp || e.timeStamp || performance.now();
    g.raw.push([x, y]);
    g.far = Math.max(g.far || 0, Math.hypot(x - g.raw[0][0], y - g.raw[0][1]));
    if (Math.hypot(x - g.hold[0], y - g.hold[1]) > NB_STILL_PX) {
      g.hold = [x, y];
      if (g.ht) clearTimeout(g.ht);
      g.ht = setTimeout(() => nbStraighten_(b, g), NB_HOLD_MS);
      g.timers.push(g.ht);
    }
    if (g.ruled) { g.end = nbSnap_(g.pts[0], [x, y, g.pts[0][2]]); return; }
    const f = g.euro.step(x, y, t);
    const L = g.last, d = Math.hypot(f[0] - L[0], f[1] - L[1]);
    if (d < 0.25) return;
    /* FASTER IS THINNER, as with a pen: a gentle taper (1.0-1.9 nu) that reads as handwriting rather than as a plotter's line. */
    const v = d / Math.max(1, t - L[2]);
    g.w = g.w * 0.7 + Math.max(1.0, Math.min(1.9, 1.85 - 0.45 * Math.min(v, 2))) * 0.3;
    g.pts.push([f[0], f[1], g.w / g.m.s]);
    g.len += d;
    g.last = [f[0], f[1], t];
  });
  /* THE PREDICTION, moved to start where the filtered line is: the browser predicts the raw finger, which the filter trails. */
  const ahead = inkAhead_(e), lr = g.raw[g.raw.length - 1], lf = g.pts[g.pts.length - 1];
  g.ahead = g.ruled ? [] : ahead.map(s => [s.clientX - g.r.left - lr[0] + lf[0], s.clientY - g.r.top - lr[1] + lf[1], lf[2]]);
  nbDrawLive_(b, g);
}
/* HELD STILL AT THE END OF A NEARLY STRAIGHT STROKE: it becomes a ruled line, and the finger can still swing its end. Procreate's QuickShape. */
function nbStraighten_(b, g) {
  if (NB_G !== g || g.ruled || g.len < 24 || inkStray_(g.pts) > 0.16) return;
  g.ruled = true;
  g.end = nbSnap_(g.pts[0], [g.hold[0], g.hold[1], g.pts[0][2]]);
  inkTick_(12);
  nbDrawLive_(b, g);
}
function nbSnap_(a, p) {
  const dx = p[0] - a[0], dy = p[1] - a[1], t = Math.tan(NB_SNAP_DEG * Math.PI / 180);
  if (Math.abs(dy) <= Math.abs(dx) * t) return [p[0], a[1], p[2]];
  if (Math.abs(dx) <= Math.abs(dy) * t) return [a[0], p[1], p[2]];
  return p;
}
function nbMultiMove_(g) {
  const b = g.b, st = nbState_(b.k);
  const ps = [...g.ids].map(id => NB_PTR.get(id)).filter(Boolean);
  if (!g.moved && ps.some(p => Math.hypot(p.x - p.x0, p.y - p.y0) > NB_TAP_PX)) g.moved = true;
  if (ps.length < 2) { g.c = null; return; }
  const c = { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 }, d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
  if (g.c && g.moved) {
    if (g.surf === 'pad') {
      /* TWO FINGERS ON THE PAD SLIDE IT along the line, to go back and add to something. */
      const m = nbMap_(b, st);
      st.pv.x = Math.max(-NB.W * 0.2, Math.min(NB.W, st.pv.x - (c.x - g.c.x) * m.s));
    } else {
      /* TWO FINGERS ON THE PAGE SCROLL IT, AND PINCH IT, about the point between them. */
      const r = nbRect_(b.book), a0 = b.book.w / NB.W * st.nv.z;
      const z = Math.max(1, Math.min(4, st.nv.z * (g.d ? d / g.d : 1))), a1 = b.book.w / NB.W * z;
      const ux = st.nv.x + (g.c.x - r.left) / a0, uy = st.nv.y + (g.c.y - r.top) / a0;
      st.nv.z = z;
      st.nv.x = Math.max(0, Math.min(NB.W - b.book.w / a1, ux - (c.x - r.left) / a1));
      st.nv.y = Math.max(0, uy - (c.y - r.top) / a1);
    }
    nbSnapView_(b);
    nbDrawAll_(b);
  }
  g.c = c; g.d = d;
}

function nbUp_(b, surf, e, cancel) {
  const id = e.pointerId;
  NB_PTR.delete(id);
  if (NB_REJ.has(id)) { NB_REJ.delete(id); return; }
  const g = NB_G;
  if (!g || g.b !== b || !g.ids.has(id)) return;
  if (g.kind === 'multi') {
    g.ids.delete(id);
    g.c = null;
    if (g.ids.size) return;
    nbEndG_();
    /* TWO FINGERS TAPPED: undo. THREE: redo. Procreate's and Notability's gesture, and no button to reach for. */
    if (!g.moved && performance.now() - g.t0 < NB_TAP_MS && !cancel) nbUndo_(b, g.max >= 3);
    return;
  }
  const st = nbState_(b.k);
  if (g.kind === 'ink') {
    nbEndG_();
    if (cancel && g.len < 12) return;
    let pts = g.pts;
    if (g.ruled) pts = [g.pts[0], g.end];
    else {
      /* THE LINE ENDS WHERE THE FINGER LIFTED, not where the filter had got to. */
      const lr = g.raw[g.raw.length - 1], lf = pts[pts.length - 1];
      if (Math.hypot(lr[0] - lf[0], lr[1] - lf[1]) > 0.5) pts = pts.concat([[lr[0], lr[1], lf[2]]]);
    }
    if (!g.ruled && nbReturn_(b, g)) { nbNewLine_(b); return; }
    nbCommit_(b, g.m, pts, g.ruled);
    /* AT THE PAD'S VERY EDGE, MOVE ON NOW; otherwise after the pause that ends a glyph, so a two-stroke x is not split by a slide. */
    const right = Math.max(...pts.map(p => p[0]));
    if (b.idle) clearTimeout(b.idle);
    if (right > NB_EDGE_NOW * b.pad.w) nbAdvance_(b);
    else b.idle = setTimeout(() => { b.idle = 0; if (!NB_G) nbAdvance_(b); }, NB_IDLE_MS);
    return;
  }
  nbEndG_();
  if (cancel) { nbDrawAll_(b); return; }
  if (g.kind === 'press' || g.kind === 'aim') { nbTap_(b, g.nx, g.ny); return; }
  if (g.kind === 'drag') { nbMoveSel_(st, g.off[0], g.off[1]); nbRefresh_(st); return; }
  if (g.kind === 'lasso') { st.sel = nbLasso_(st, g.poly); if (st.sel) inkTick_(8); nbRefresh_(st); }
}

/* ---------- BUILDING ONE, AND EVERY COPY ON THE PAGE ---------- */
const NB_HOW = ['Write big here; it lands small above.', 'Swipe back, right to left: a new line.', 'Tap two fingers: undo. Three: redo.', 'Scribble: rub out. Hold still: straighten.'];
function nbHtml_(k) {
  const tiles = Object.keys(NB_SHAPES).map(t => tile_({ icon: NB_SHAPES[t].icon, label: NB_SHAPES[t].label, note: 'boxes to write in',
    act: 'nb-shape', cls: 'nb-shape', data: { shape: t } })).join('');
  const say = typeof padNoteSay_ === 'function' ? padNoteSay_(k) : 'Kept on this device only.';
  /* NEW LINE SITS IN THE PAD'S CORNER, under the writing hand: the row above is full at 390px, and a second row would cost the pad its height. */
  const ret = tile_({ icon: 'newline', label: 'New line', note: 'or swipe back across the pad', act: 'nb-line', cls: 'nb-line' });
  return `<div class="nb" data-k="${esc(k)}">
    <div class="nb-book" aria-label="The page"><canvas class="nb-c"></canvas><canvas class="nb-l"></canvas></div>
    <div class="nb-bar tile-row" role="toolbar" aria-label="Maths">${tiles}${tile_({ icon: 'bin', label: 'Clear', note: 'the whole board', act: 'nb-clear', cls: 'nb-clear' })}</div>
    <div class="nb-pad" data-noswipe aria-label="Write here"><canvas class="nb-c"></canvas><canvas class="nb-l"></canvas>${ret}</div>
    <p class="nb-note" data-kept-k="${esc(k)}">${esc(say)}</p>
  </div>`;
}
function nbBuild_(host, k) {
  host.innerHTML = nbHtml_(k);
  const el = host.querySelector('.nb');
  const surf = sel => {
    const box = el.querySelector(sel), c = box.querySelector('.nb-c'), l = box.querySelector('.nb-l');
    return { box, c, l, ctx: undefined, lctx: undefined, w: 0, h: 0 };
  };
  const b = { host, el, k, book: surf('.nb-book'), pad: surf('.nb-pad'), view: null, glide: 0, idle: 0 };
  host.NB = b;
  NB_LIVE.add(b);
  [['pad', b.pad.box], ['book', b.book.box]].forEach(([s, box]) => {
    box.addEventListener('pointerdown', e => nbDown_(b, s, e));
    box.addEventListener('pointermove', e => nbMove_(b, s, e));
    box.addEventListener('pointerup', e => nbUp_(b, s, e, false));
    box.addEventListener('pointercancel', e => nbUp_(b, s, e, true));
  });
  b.book.box.addEventListener('wheel', e => nbWheel_(b, e), { passive: false });
  if (typeof ResizeObserver === 'function') {
    try { const ro = new ResizeObserver(() => { if (!el.isConnected) { ro.disconnect(); return; } nbSize_(b); nbDrawAll_(b); }); ro.observe(b.book.box); ro.observe(b.pad.box); } catch (e) {}
  }
  nbSize_(b);
  nbDrawAll_(b);
  return b;
}
/* A WHEEL SCROLLS THE PAGE WHILE THE PAGE HAS SOMEWHERE TO GO, then the column has it, as any box that scrolls; with Ctrl (a trackpad's pinch) it zooms. */
function nbWheel_(b, e) {
  const st = nbState_(b.k), r = nbRect_(b.book), a0 = b.book.w / NB.W * st.nv.z;
  if (!e.ctrlKey) {
    nbCache_(st);
    let last = st.caret.line;
    st.inks.forEach(k => { last = Math.max(last, k.tm ? nbLineOf_(k.tm.y) : k.item.line); });
    const maxY = Math.max(0, (last + 2) * NB.LINE - b.book.h / a0);
    if ((e.deltaY < 0 && st.nv.y <= 0) || (e.deltaY > 0 && st.nv.y >= maxY - 0.5)) return;
    st.nv.y = Math.max(0, Math.min(maxY, st.nv.y + e.deltaY / a0));
    if (st.nv.z > 1) st.nv.x = Math.max(0, Math.min(NB.W - b.book.w / a0, st.nv.x + e.deltaX / a0));
  }
  try { e.preventDefault(); e.stopPropagation(); } catch (x) {}
  if (e.ctrlKey) {
    const z = Math.max(1, Math.min(4, st.nv.z * Math.exp(-e.deltaY / 200))), a1 = b.book.w / NB.W * z;
    const ux = st.nv.x + (e.clientX - r.left) / a0, uy = st.nv.y + (e.clientY - r.top) / a0;
    st.nv.z = z;
    st.nv.x = Math.max(0, Math.min(NB.W - b.book.w / a1, ux - (e.clientX - r.left) / a1));
    st.nv.y = Math.max(0, uy - (e.clientY - r.top) / a1);
  }
  nbSnapView_(b);
  nbDrawAll_(b);
}

/* EVERY `.nb-box` ON THE PAGE, for whoever is signed in — Tools and the Saved column's copy. Not one under a finger. */
function initBoard_() {
  const k = padKey_(WB_ITEM);
  /* OPENING IT IS WHERE THE PHONE'S SIGNED-OUT BOARD BECOMES THIS PERSON'S (`padAdopt_`, as the pen's board did). */
  padAdopt_(k, WB_ITEM.prefix + ':' + WB_ITEM.key);
  const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
  document.querySelectorAll('.nb-box').forEach(host => {
    const slot = host.closest('.widget-slot');
    if (slot) { slot.WHO = who; slot.OWN = who; }
    const b = host.NB;
    if (b && NB_G && NB_G.b === b && host.contains(b.el)) return;
    if (b && b.k === k && host.contains(b.el)) { nbDrawAll_(b); return; }
    if (b) NB_LIVE.delete(b);
    nbBuild_(host, k);
  });
}
/* A CHANGE OF PERSON: the half-drawn stroke dropped, every copy drawn again under the new key. Called from `signedOut_` and `signedIn_`. */
function boardWhoChanged_() {
  nbDrop_();
  initBoard_();
}
/* NO COLUMN IS REDRAWN UNDER A FINGER ON THE BOARD (`paint` and `startScreen_` ask, as they ask `padHold_`). */
function boardHold_(id) {
  try {
    if (!NB_G || !NB_G.b || !NB_G.b.el.isConnected) return false;
    const host = document.getElementById('s-' + id);
    return !!host && host.contains(NB_G.b.el);
  } catch (e) { return false; }
}
const nbOf_ = el => { const h = el && el.closest && el.closest('.nb-box'); return h && h.NB && h.NB.el.isConnected ? h.NB : null; };

on('nb-shape', el => { const b = nbOf_(el); if (b) nbShape_(b, el.getAttribute('data-shape')); });
on('nb-line', el => { const b = nbOf_(el); if (b) nbNewLine_(b); });
on('nb-clear', el => { const b = nbOf_(el); if (b) nbClear_(b); });

/* CTRL+Z AND CTRL+SHIFT+Z (OR CTRL+Y) FOR A MOUSE, on the board in view, unless a box is being typed in. */
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const key = String(e.key || '').toLowerCase();
  if (key !== 'z' && key !== 'y') return;
  const t = e.target;
  if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return;
  const b = [...NB_LIVE].find(x => {
    if (!x.el.isConnected) return false;
    const r = x.el.getBoundingClientRect();
    return r.width > 0 && r.left >= -1 && r.right <= (innerWidth || 0) + 1 && r.bottom > 0 && r.top < (innerHeight || 0);
  });
  if (!b) return;
  e.preventDefault();
  nbUndo_(b, key === 'y' || e.shiftKey);
});
/* NO CALLOUT OR MENU FROM A FINGER HELD ON THE BOARD. */
document.addEventListener('contextmenu', e => { if (e.target && e.target.closest && e.target.closest('.nb')) e.preventDefault(); });
/* THE PAGE HIDDEN MID-STROKE: dropped, as the pen does (`padAway_`). */
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && NB_G) nbDrop_(); });
