/* WHICH OF THE TWO IS DRAWING, after the pin rule refused the later one: § */
function padRace_(g, force) {
  if (!g || !g.refused || g.mine || g.never || g !== PAD_GO) return;
  const o = g.c;
  let tk = Infinity, latest = o.ts;
  g.refused.forEach(c => { if (c.tk < tk) tk = c.tk; if (c.ts > latest) latest = c.ts; });
  let tl = Infinity;
  for (const h of o.hist) {
    if (h[0] < g.raceAt) continue;
    if (h[0] >= tk) break;
    if (Math.hypot(h[1] - g.raceFrom[0], h[2] - g.raceFrom[1]) >= PAD_KEEPUP_PX) { tl = h[0]; break; }
  }
  const told = (c, t) => force || c.ts >= t || latest - c.ts > PAD_LAG_MS || PAD_TOUCH.get(c.id) !== c;
  if (tl < tk) {
    if (!g.refused.every(c => told(c, tl))) return;
    g.mine = true;
    if (!PAD_HUSH) padLiveShow_();
    return;
  }
  if (tk < Infinity && told(o, tk)) g.never = true;
}
/* WHETHER ANY OF A STROKE IS SHOWN: all of it, unless the still one may not mark yet (`padRace_`). */
const padShown_ = g => !g.refused || !!g.mine;
/* WHETHER THE OTHER MAY TAKE THE STROKE: § */
function padTakes_(c) {
  if (!c || !c.late || !c.onInk || c.k !== PAD_ON || !c.pts) return false;
  return !padPinned_(c);
}
/* THE PIN RULE ITSELF, apart from the other reasons a contact may not take the stroke: § */
function padPinned_(c) {
  const g = PAD_GO;
  return !!c && !!g && c.late && c.onInk && c.k === PAD_ON && !!c.pts && g.tool !== 'pen' && c.t0 - g.t0 > PAD_TOGETHER_MS;
}
/* EVERY MOVE OF ONE OF THEM, AFTER ITS SAMPLES: once one has gone 10px by its own latest, the question is asked at the
   next frame (`padFrame_`). A frame is asked for only then, so a held stroke whose fingers are still costs nothing. */
function padRules_(c) {
  if (!PAD_GO || PAD_TWO.size) return;
  let watching = false;
  PAD_TOUCH.forEach(x => { if (x.role === 'watch') watching = true; });
  if (!PAD_HUSH && !watching) return;
  if (c !== PAD_GO.c && c.role !== 'cand' && c.role !== 'watch') return;
  if (!PAD_DUE && !padParties_().some(p => padDist_(p.ref, p.c.p) >= PAD_STILL_PX)) return;
  if (!PAD_DUE) PAD_DUE = { at: c.ts };
  padFrameWant_();
}
/* ---------- THE LOUPE: WHAT IS UNDER THE FINGER, ABOVE IT (357; 338 section 7's increment 2) § */
const PAD_LOUPE_PX = 128;
const PAD_LOUPE_RISE = 112;
let PAD_LOUPE_T = 0;
/* EVERY STROKE, EVERY TOOL, EVERY SURFACE (359): the loupe is up from the touch, above the finger, not only for a placement or after a pause. */
function padLoupeWant_(g) {
  if (PAD_LOUPE_T) { clearTimeout(PAD_LOUPE_T); PAD_LOUPE_T = 0; }
  g.lnow = true;
  padFrameWant_();
}
/* A SAMPLE: the loupe follows at the next frame. */
function padLoupeStep_(g) { if (g.lnow || g.loupe) padFrameWant_(); }
/* `hide` ONLY HIDES IT: the preview redrawn (`padLiveShow_`, at every landing) or held keeps the pause's timer, which a
   lift, a drop or the page going away ends. */
function padLoupeOff_(hide) {
  if (PAD_LOUPE_T && !hide) { clearTimeout(PAD_LOUPE_T); PAD_LOUPE_T = 0; }
  if (PAD_GO) PAD_GO.loupe = 0;
  if (typeof document === 'undefined') return;
  const el = document.querySelector('body > .pad-loupe');
  if (el && el.classList.contains('on')) { el.classList.remove('on'); el.removeAttribute('data-at'); }
}
/* AT THE FRAME: shown or not, and where. */
function padLoupe_(g) {
  if (!g || PAD_HUSH || PAD_TWO.size || !padShown_(g) || !g.ink || !g.ink.isConnected) { if (g && g.loupe) padLoupeOff_(); return; }
  if (!g.loupe && !g.lnow) return;
  let el = document.querySelector('body > .pad-loupe');
  if (!el) {
    el = document.createElement('div');
    el.className = 'pad-loupe';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="pad-loupe-in"></div><i class="pad-loupe-x"></i>';
    document.body.appendChild(el);
  }
  const box = g.box, inner = el.firstChild;
  if (!g.loupe) {
    const art = g.ink.closest('.qpad-art');
    if (!art || !box) return;
    const copy = art.cloneNode(true);
    copy.removeAttribute('data-do'); copy.removeAttribute('title');
    copy.querySelectorAll('[data-live]').forEach(p => p.removeAttribute('data-live'));
    copy.querySelectorAll('[data-noswipe]').forEach(p => p.removeAttribute('data-noswipe'));
    copy.style.width = box.width + 'px';
    copy.style.height = box.height + 'px';
    inner.textContent = '';
    inner.appendChild(copy);
    g.lcopy = { g: copy.querySelector('.qpad-g'), aid: copy.querySelector('.qpad-aid'), paths: [], aidWas: '' };
    copy.querySelectorAll('.qpad-g path:not([d])').forEach(p => p.remove());
    el.classList.toggle('is-paper', g.board);
    g.loupe = 1;
  }
  /* THE LIVE LINE AND THE AID, COPIED: only what changed is written. */
  const C = g.lcopy;
  if (C && C.g) {
    (g.live || []).forEach((p, i) => {
      let q = C.paths[i];
      if (!q) { q = document.createElementNS('http://www.w3.org/2000/svg', 'path'); q.setAttribute('vector-effect', 'non-scaling-stroke'); C.g.appendChild(q); C.paths[i] = q; q.was = ''; }
      const d = p.getAttribute('d') || '';
      if (q.was !== d) { q.setAttribute('d', d); q.was = d; }
    });
    const aid = g.ink.querySelector('.qpad-aid'), html = aid ? aid.innerHTML : '';
    if (C.aid && C.aidWas !== html) { C.aid.innerHTML = html; C.aidWas = html; }
  }
  const L = g.lat, z = Math.max(2, Math.min(4, L ? 12 / L.pitch : 2));
  const at = g.tool === 'compass' && g.held && g.tip ? [Math.round(g.tip[0]), Math.round(g.tip[1])] : g.at || g.from;
  const P = [at[0] * g.sx, at[1] * g.sy], f = g.c && g.c.p ? g.c.p : [box.left + P[0], box.top + P[1]];
  const half = PAD_LOUPE_PX / 2, W = window.innerWidth || 0;
  let cx = f[0], cy = f[1] - PAD_LOUPE_RISE;
  if (cy - half < 4) { cx = f[0] + (f[0] < W / 2 ? 1 : -1) * PAD_LOUPE_RISE; cy = Math.max(half + 4, f[1]); }
  if (W) cx = Math.max(half + 4, Math.min(W - half - 4, cx));
  inner.style.transform = `translate(${half - P[0] * z}px, ${half - P[1] * z}px) scale(${z})`;
  el.style.transform = `translate(${cx - half}px, ${cy - half}px)`;
  el.setAttribute('data-at', at[0] + ',' + at[1]);
  if (!el.classList.contains('on')) el.classList.add('on');
}
/* ---------- PINCH TO LOOK CLOSER (374): two fingers on an armed picture zoom and pan it; one finger draws on it zoomed; pinched back under 1.1x it is whole again § */
const PAD_ZOOM_MAX = 5;       // 338 section 9's ceiling: a 3.3px square becomes 16px, past a fingertip's wobble
const PAD_ZOOM_SNAP = 1.1;    // let go under this and the picture is whole again -- no near-1 zoom left behind by accident
const PAD_PINCH_START = 0.15; // the fingers' spread must change this much before an unzoomed picture zooms: a palm sliding with a finger does not
const PAD_ZOOM = new Map();   // by pad key: { s, x, y }, x and y the shift as a fraction of the picture's box
let PAD_PINCH = null;
const padZoomOf_ = k => PAD_ZOOM.get(k) || { s: 1, x: 0, y: 0 };
const padZoomVar_ = z => `translate(${(z.x * 100).toFixed(3)}%, ${(z.y * 100).toFixed(3)}%) scale(${z.s.toFixed(4)})`;
/* EVERY COPY OF THE PAD: the picture and its ink move together, so the box `padMap_` reads is where the finger is */
function padZoomPaint_(k) {
  const z = PAD_ZOOM.get(k), on = !!z && z.s > 1.001;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.qpad[data-k]').forEach(p => {
    if (p.getAttribute('data-k') !== k) return;
    p.classList.toggle('is-zoomed', on);
    if (on) { p.style.setProperty('--pad-zoom', padZoomVar_(z)); p.style.setProperty('--pad-zoom-s', z.s.toFixed(4)); }
    else { p.style.removeProperty('--pad-zoom'); p.style.removeProperty('--pad-zoom-s'); }
  });
}
function padZoomOff_(k) {
  const keys = k ? [k] : [...PAD_ZOOM.keys()];
  PAD_PINCH = null;
  keys.forEach(key => { if (PAD_ZOOM.delete(key)) padZoomPaint_(key); });
}
const padClamp_ = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/* ZOOM s ABOUT A SCREEN POINT m, keeping the picture's point u under it, and never showing past the picture's edge */
function padZoomAt_(k, s, u, m, A) {
  s = padClamp_(s, 1, PAD_ZOOM_MAX);
  const x = padClamp_((m[0] - A.left) / A.width - u[0] * s, 1 - s, 0), y = padClamp_((m[1] - A.top) / A.height - u[1] * s, 1 - s, 0);
  PAD_ZOOM.set(k, { s: s, x: x, y: y });
}
const padZoomU_ = (z, m, A) => [(m[0] - A.left - z.x * A.width) / (z.s * A.width), (m[1] - A.top - z.y * A.height) / (z.s * A.height)];
/* TWO FINGERS ALREADY JUDGED TWO (`padTwo_`), BOTH ON THE ARMED INK: their spread is the zoom, their midpoint the pan */
function padPinch_() {
  const two = [];
  PAD_TOUCH.forEach(x => { if (x.role === 'two' && x.onInk && x.ink && x.ink.isConnected) two.push(x); });
  if (two.length !== 2 || two[0].ink !== two[1].ink || two[0].k !== PAD_ON) return;
  const pad = two[0].ink.closest('.qpad'), art = pad && pad.querySelector('.qpad-art');
  if (!art) return;
  const A = art.getBoundingClientRect();
  if (!A.width || !A.height) return;
  const a = two[0].p, b = two[1].p, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d = Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1]));
  const P = PAD_PINCH;
  if (!P || P.a !== two[0] || P.b !== two[1]) {
    /* MEASURED FROM WHERE THE FINGERS LANDED, so the spread before they were known to be two is not lost */
    const z = padZoomOf_(PAD_ON), a0 = two[0].p0, b0 = two[1].p0, m0 = [(a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2];
    PAD_PINCH = { a: two[0], b: two[1], k: PAD_ON, d0: Math.max(1, Math.hypot(a0[0] - b0[0], a0[1] - b0[1])), s0: z.s, u: padZoomU_(z, m0, A), on: z.s > 1.001 };
  }
  padPinchMove_(PAD_PINCH, d, m, A);
}
function padPinchMove_(P, d, m, A) {
  if (!P.on) { if (Math.abs(d / P.d0 - 1) < PAD_PINCH_START) return; P.on = true; }
  padZoomAt_(P.k, P.s0 * d / P.d0, P.u, m, A);
  P.dirty = true;
  padFrameWant_();
}
/* A FINGER OF THE PINCH LIFTED: a zoom near 1 lets go */
function padPinchEnd_(c) {
  const P = PAD_PINCH;
  if (!P || (P.a !== c && P.b !== c)) return;
  PAD_PINCH = null;
  const z = PAD_ZOOM.get(P.k);
  if (z && z.s < PAD_ZOOM_SNAP) PAD_ZOOM.delete(P.k);
  padZoomPaint_(P.k);
}
/* A MOUSE OR A TRACKPAD: ctrl + wheel (a trackpad's pinch) zooms about the pointer; the wheel alone pans a zoomed picture */
document.addEventListener('wheel', e => {
  const ink = PAD_ON && e.target && e.target.closest && e.target.closest('.qpad-ink');
  const pad = ink && ink.closest('.qpad');
  if (!pad || pad.getAttribute('data-k') !== PAD_ON) return;
  const k = PAD_ON, z = padZoomOf_(k), art = pad.querySelector('.qpad-art');
  if (!art || (!e.ctrlKey && z.s <= 1.001)) return;
  const A = art.getBoundingClientRect();
  if (!A.width || !A.height) return;
  e.preventDefault(); e.stopPropagation();
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? A.height : 1;
  if (e.ctrlKey) {
    const m = [e.clientX, e.clientY];
    padZoomAt_(k, z.s * Math.exp(-e.deltaY * unit * 0.01), padZoomU_(z, m, A), m, A);
    const n = PAD_ZOOM.get(k);
    if (n && n.s < 1.01) PAD_ZOOM.delete(k);
  } else {
    PAD_ZOOM.set(k, { s: z.s, x: padClamp_(z.x - e.deltaX * unit / A.width, 1 - z.s, 0), y: padClamp_(z.y - e.deltaY * unit / A.height, 1 - z.s, 0) });
  }
  padZoomPaint_(k);
}, { passive: false, capture: true });
/* THE PEN'S FRAME: a decision waiting (`padJudge_`), then the live path's open chunk, written once a frame
   (`padChunks_`). */
function padFrameWant_() {
  if (PAD_FRAME || typeof requestAnimationFrame !== 'function') return;
  PAD_FRAME = requestAnimationFrame(padFrame_);
}
function padFrame_() {
  PAD_FRAME = 0;
  if (PAD_PINCH && PAD_PINCH.dirty) { PAD_PINCH.dirty = false; padZoomPaint_(PAD_PINCH.k); }
  if (PAD_DUE) padJudge_(false);
  if (PAD_GO && PAD_GO.refused) padRace_(PAD_GO, false);
  const g = PAD_GO;
  if (g && g.dirty && !PAD_HUSH && g.tool === 'pen') { padChunks_(g); if (padShown_(g)) padAid_(g); }
  /* AND THE LOUPE, here and nowhere else (357). */
  if (g) padLoupe_(g);
}

/* ---------- A CONTACT LANDS § */
function padLand_(e, ink, k) {
  const old = PAD_TOUCH.get(e.pointerId);
  /* THE SAME ID GOING DOWN AGAIN means its own lift never came -- a mouse is always pointer 1 -- so it
     starts afresh rather than wedging the pen; and so does a stroke whose ink a repaint has replaced. */
  if (old) padGone_(old, e.timeStamp, 'lost');
  if (PAD_GO && !(PAD_GO.ink && PAD_GO.ink.isConnected)) { const g = PAD_GO; padWithdraw_(); if (g.c) PAD_TOUCH.delete(g.c.id); }
  const c = padContact_(e, ink, k);
  const now = e.timeStamp;
  if (PAD_TWO.size) {
    let going = false;
    PAD_TWO.forEach(id => { const x = PAD_TOUCH.get(id); if (x && now - x.tm <= PAD_TOGETHER_MS) going = true; });
    if (going) { if (ink) { c.role = 'two'; PAD_TWO.add(c.id); } return; }
    PAD_TWO.forEach(id => { const x = PAD_TOUCH.get(id); if (x) x.role = 'rest'; });
    PAD_TWO.clear();
  }
  if (PAD_GO && PAD_GO.pen) return;
  if (PAD_HUSH) {
    /* A THIRD CONTACT is two fingers and more (T4). Held ALONE -- the other has lifted -- it is a second. */
    if (PAD_HUSH.cand) { padTwo_([c]); return; }
    c.late = true;
    padHush_(c, 'b');
    return;
  }
  if (PAD_ST && PAD_GO) {
    const o = PAD_GO.c;
    c.late = true;
    if (PAD_GO.est || (o.far >= PAD_STILL_PX && now - PAD_GO.t0 >= PAD_TOGETHER_MS)) return;
    if (o.far < PAD_STILL_PX) { padHush_(c, 'b'); return; }
    if (now - PAD_GO.t0 < PAD_TOGETHER_MS && padDist_(c.p0, o.p) <= PAD_TOGETHER_PX) { padHush_(c, 'a'); return; }
    return;
  }
  if (!ink) return;
  /* A COLUMN OR A PANE ALREADY MOVING IS NOT DRAWN ON: the swipe engine is carrying another finger. */
  if (e.isPrimary === false && typeof SWIPE !== 'undefined' && SWIPE.live && SWIPE.axis && SWIPE.id !== e.pointerId) return;
  const r = ink.getBoundingClientRect();
  const at = padMap_(r, e.clientX, e.clientY);
  if (!at) { PAD_TOUCH.delete(c.id); return; }
  padStart_(c, at, r);
  padLiveShow_();
  if (isSteadyPointer_(c)) {
    PAD_GO.est = true;
    /* A STYLUS: every touch already down, and every one to come, is the hand holding it. */
    if (c.type === 'pen') { PAD_GO.pen = true; PAD_TOUCH.forEach(x => { if (x !== c) x.role = 'rest'; }); }
    return;
  }
  const young = [];
  PAD_TOUCH.forEach(x => {
    if (x === c) return;
    /* EVERY ONE OF THEM WAS DOWN BEFORE THIS OWNER, whatever it was to the stroke before -- so none may take this one over. */
    x.late = false;
    const moving = padDist_(x.p0, x.p) >= PAD_STILL_PX && now - x.tm <= PAD_TOGETHER_MS;
    if (now - x.t0 <= PAD_TOGETHER_MS || moving) young.push(x);
    else { x.role = 'watch'; x.m0 = x.p.slice(); }
  });
  if (young.length > 1) padTwo_(young);
  else if (young.length) padHush_(young[0], 'b');
}

/* ---------- A CONTACT GOES § */
function padGone_(c, now, how) {
  if (PAD_TOUCH.get(c.id) === c) PAD_TOUCH.delete(c.id);
  if (c.busy && !c.onInk) PAD_RESTED.set(c.busy, performance.now() + PAD_BAR_MS);
  padPinchEnd_(c);
  if (PAD_TWO.has(c.id)) { PAD_TWO.delete(c.id); return; }
  const g = PAD_GO;
  if (g && g.c === c) {
    if (how === 'lost') { padWithdraw_(); return; }
    if (PAD_HUSH) {
      const cand = PAD_HUSH.cand, takes = padTakes_(cand);
      padWithdraw_();
      if (takes) padSwap_(cand, true);
      else if (cand) { cand.role = 'rest'; cand.pts = null; }
      return;
    }
    /* A PIN-RULE PAIR NOT YET TOLD APART: decided now, from what has come (`padRace_`). */
    if (g.refused) padRace_(g, true);
    /* THE LOCK PRESSED OFF BY ANOTHER HAND mid-stroke: an established stroke is kept, as it always was. */
    if ((how === 'cancel' || PAD_ON !== c.k) && padTentative_(now)) { padWithdraw_(); return; }
    padCommit_();
    return;
  }
  if (PAD_HUSH && PAD_HUSH.cand === c) { PAD_HUSH.cand = null; c.pts = null; }
}
/* T6: THE STROKE KEPT. Today's lift, unchanged: the tool's end, the board's thinning, `padSave_`. */
function padCommit_() {
  const g = PAD_GO;
  padHoldClear_();
  if (!g) return;
  let st = PAD_DRAW[g.tool].end(g, PAD_ST);
  PAD_ST = null; PAD_GO = null; PAD_HUSH = null; PAD_DUE = null;
  /* THE FRAME NOT YET RUN IS DONE HERE, NOW: the stroke is stored from every sample fed, and drawn below
     from what was stored -- never from what the last frame happened to have drawn. */
  if (PAD_FRAME && typeof cancelAnimationFrame === 'function') { cancelAnimationFrame(PAD_FRAME); PAD_FRAME = 0; }
  if (g.c && g.c.role === 'owner') g.c.role = 'rest';
  padLoupeOff_();
  const lives = [].slice.call(g.ink.querySelectorAll('[data-live]'));
  const aid = g.ink.querySelector('.qpad-aid');
  if (aid) aid.innerHTML = '';
  /* A SLIP IS TAKEN BACK OFF THE SCREEN as well as never stored: the preview is not a mark. */
  if (!st) { lives.forEach(p => p.remove()); return; }
  const pad = g.ink.closest('.qpad');
  const k = (pad && pad.getAttribute('data-k')) || '';
  /* THE WHITEBOARD'S STROKE IS STORED THINNED -- see `PAD_BOARD_MAX`. A question's keeps every point. */
  if (padIsBoard_(k) && typeof ansSimplify_ === 'function') st = ansSimplify_(st, 1);
  lives.slice(1).forEach(p => p.remove());
  /* AND DRAWN EVEN IF A REPAINT OF THIS PAD TOOK THE PREVIEW (an Undo pressed by the other hand, a copy
     repainted): a stored stroke that is not on the screen is the one Undo then takes off unseen. */
  const live = lives[0] || padLivePath_(g, '');
  live.removeAttribute('data-live');
  live.setAttribute('d', padPath_(st, g.k));
  if (!pad) return;
  const all = padRead_(k); all.push(st);
  padSave_(pad, k, all);
}
/* ---------- T8: LEAVING, AND T0: A LIFT THAT NEVER CAME § */
function padDrop_(keepZoom) {
  padHoldClear_();
  if (!keepZoom) padZoomOff_();
  if (PAD_FRAME && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(PAD_FRAME);
  PAD_FRAME = 0;
  const g = PAD_GO;
  PAD_ST = null; PAD_GO = null; PAD_HUSH = null; PAD_DUE = null;
  PAD_TOUCH.clear(); PAD_TWO.clear();
  if (g) padLiveOff_(g);
  padLoupeOff_();
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.qpad-ink [data-live]').forEach(p => p.remove());
  document.querySelectorAll('.qpad-aid').forEach(a => { if (a.firstChild) a.innerHTML = ''; });
}
/* THE PAGE GOING AWAY, OR THE WINDOW LOSING FOCUS, MID-STROKE: the cancel rule, and every contact forgotten
   -- their lifts will not come here. */
function padAway_(e) {
  padLoupeOff_();
  if (PAD_DUE) padJudge_(true);
  if (PAD_GO && PAD_GO.refused) padRace_(PAD_GO, true);
  if (PAD_ST && PAD_GO) {
    const now = e && typeof e.timeStamp === 'number' ? e.timeStamp : PAD_GO.t0;
    if (padTentative_(now)) padWithdraw_(); else padCommit_();
  }
  if (PAD_TOUCH.size || PAD_TWO.size || PAD_GO) padDrop_();
}

/* ---------- THE LISTENERS § */
/* T0: A PRIMARY POINTER IS THE PLATFORM SAYING NO OTHER OF ITS KIND IS DOWN -- so every contact of that kind still here lost its lift. § */
function padPrimary_(e) {
  const type = e.pointerType || '';
  let other = false;
  PAD_TOUCH.forEach(c => { if (c.type !== type) other = true; });
  if (!other) { if (PAD_TOUCH.size || PAD_GO || PAD_TWO.size) padDrop_(true); return; }
  const mine = [];
  PAD_TOUCH.forEach(c => { if (c.type === type) mine.push(c); });
  mine.forEach(c => padGone_(c, e.timeStamp, 'lost'));
  /* WHAT IS LEFT, IF ITS STROKE WENT WITH THEM, IS ORDINARY. */
  if (!PAD_GO) PAD_TOUCH.forEach(c => { if (c.role !== 'rest' && c.role !== 'two') { c.role = 'rest'; c.pts = null; } });
}
document.addEventListener('pointerdown', e => {
  if (e.isPrimary === true && (PAD_TOUCH.size || PAD_GO || PAD_TWO.size)) padPrimary_(e);
  const ink = e.target && e.target.closest && e.target.closest('.qpad-ink');
  const pad = ink && ink.closest('.qpad');
  const k = pad ? pad.getAttribute('data-k') || '' : '';
  /* THE PEN IS OFF UNTIL PICKED (owner, 7 Nov): only the pad whose tool was chosen (`padToolPick_`) draws, so scrolling never inks */
  if (!pad || !PAD_ON || k !== PAD_ON) {
    if (PAD_ON && e.pointerType === 'touch') padLand_(e, null, '');
    return;
  }
  e.preventDefault();
  padLand_(e, ink, k);
  try { ink.setPointerCapture(e.pointerId); } catch (err) { /* focus and scrolling are niceties */ }
});

document.addEventListener('pointermove', e => {
  if (!PAD_TOUCH.size) return;
  const c = PAD_TOUCH.get(e.pointerId);
  if (!c) return;
  const s = padSizeOf_(e);
  if (s > c.big) c.big = s;
  if (PAD_SIZES) padSizesSay_(c, e);
  const g = PAD_GO && PAD_GO.c === c ? PAD_GO : null;
  /* THE OWNER'S SAMPLES ONLY FROM ITS OWN INK: a repaint that replaced it ends what this stroke can take,
     and the lift stores what it has. A candidate's, from its own. */
  const feed = !!g && !!e.target && !!e.target.closest && e.target.closest('.qpad-ink') === g.ink;
  const keep = !feed && c.role === 'cand' && !!c.pts && !!c.ink && c.ink.isConnected;
  const r = feed ? g.ink.getBoundingClientRect() : keep ? c.ink.getBoundingClientRect() : null;
  padSamples_(e).forEach(p => {
    const x = p.clientX, y = p.clientY;
    padTrack_(c, x, y, p.timeStamp || e.timeStamp);
    if (!r) return;
    const at = padMap_(r, x, y);
    if (!at) return;
    if (feed) padStep_(g, at); else padKeep_(c.pts, at);
  });
  /* THE BOX THIS EVENT READ, for the loupe's frame to place itself by -- read once, here, as it always was. */
  if (feed && r) { g.box = r; g.pred = padPredict_(g, e, r); }
  /* WHICH OF A PIN-RULE PAIR IS DRAWING, asked at the frame after any move while it is not known (`padRace_`) -- the
     refused one's moves too, though it is only a rest now: how far it goes is the evidence. */
  if (PAD_GO && PAD_GO.refused && !PAD_GO.mine && !PAD_GO.never) padFrameWant_();
  padRules_(c);
  if (c.role === 'two') padPinch_();
  if (feed && PAD_GO === g) padLive_();
});

function padEnd_(e) {
  const c = PAD_TOUCH.get(e ? e.pointerId : undefined);
  /* ONE OF THEM LIFTING DECIDES what was not yet decided, from where each one got to. A rest lifting does not. */
  if (PAD_DUE && c && PAD_GO && (c === PAD_GO.c || c.role === 'cand' || c.role === 'watch')) padJudge_(true);
  if (c) { padGone_(c, e ? e.timeStamp : 0, e && e.type === 'pointercancel' ? 'cancel' : 'up'); return; }
  /* A LIFT THE PEN KEPT NO CONTACT FOR: another finger's, which is not the end of this stroke. */
}

/* ---------- A STROKE THE DEVICE REFUSED STAYS ON THE SCREEN, AND THE NOTE SAYS IT IS NOT SAVED § */
function padSave_(pad, k, all) {
  const v = JSON.stringify(all);
  if (padIsBoard_(k) && v.length > PAD_BOARD_MAX) {
    padRepaint_(pad, padRead_(k));
    toast('The board is full. Clear it to carry on.');
    return false;
  }
  ansStore_(k, v);
  padCopies_(k, pad, all);
  padDim_(pad, all);
  /* A VERDICT IS ABOUT THE DRAWING IT WAS FOR: a mark added or taken away says so again under Send. */
  document.querySelectorAll('.qpad-send[data-pad]').forEach(row => {
    const out = row.querySelector('.qp-verdict');
    if (row.getAttribute('data-pad') !== k || !out) return;
    const said = subBoxSay_(row.getAttribute('data-k'), padSay_(all));
    row.classList.remove('is-right', 'is-near');
    out.textContent = padSaid_(said.text);
  });
  return true;
}
/* AND EVERY PAD THAT SHOWS THIS PART'S INK UNDER ITS OWN (`data-under`, 381), drawn again from the store */
function padUnderRepaint_(k) {
  document.querySelectorAll('.qpad[data-under]').forEach(p => {
    const keys = String(p.getAttribute('data-under')).split(' ');
    const g = keys.indexOf(k) >= 0 && p.querySelector('.qpad-was');
    if (!g) return;
    const ka = padAspectOf_(p);
    g.innerHTML = [].concat(...keys.map(padRead_)).map(st => `<path vector-effect="non-scaling-stroke" d="${padPath_(st, ka)}"/>`).join('');
  });
}
/* ---------- AND EVERY OTHER COPY OF THE SAME PAD, FROM THE STORE § */
function padCopies_(k, pad, all) {
  document.querySelectorAll('.qpad[data-k]').forEach(p => {
    if (p !== pad && p.getAttribute('data-k') === k) padRepaint_(p, all);
  });
  padUnderRepaint_(k);
}
document.addEventListener('pointerup', padEnd_);
document.addEventListener('pointercancel', padEnd_);
/* NO CALLOUT AND NO MENU FROM A FINGER HELD ON THE ARMED DRAWING -- the keypad's precedent (keypad.js). */
document.addEventListener('contextmenu', e => {
  const ink = e.target && e.target.closest && e.target.closest('.qpad-ink');
  const pad = ink && ink.closest('.qpad');
  if (pad && PAD_ON && pad.getAttribute('data-k') === PAD_ON) e.preventDefault();
});
/* THE PAGE HIDDEN OR LEFT, OR THE WINDOW LOSING FOCUS, MID-GESTURE: `padAway_`. */
document.addEventListener('visibilitychange', e => { if (document.visibilityState === 'hidden') padAway_(e); });
window.addEventListener('pagehide', padAway_);
window.addEventListener('blur', padAway_);

/* WHICH PAD TAKES THE PEN: the one a finger, a stylus or a mouse lands on, or whose tool is chosen. One at a time, so 338's palm and two-finger rules have one ink to ask about. */
function padTake_(pad, k) {
  [].slice.call(document.querySelectorAll('.qpad')).forEach(p => padArm_(p, false));
  PAD_ON = k;
  padArm_(pad, true);
  padForgetOthers_();
}
function padForgetOthers_() {
  const keep = PAD_GO ? PAD_GO.c : null;
  PAD_TOUCH.forEach((c, id) => { if (c !== keep) PAD_TOUCH.delete(id); });
  PAD_TWO.clear();
  if (PAD_HUSH) PAD_HUSH.cand = null;
  PAD_DUE = null;
}

/* ---------- A TOOL TAKEN UP ON A PAD (the tool row's Pen, Ruler, Compass, Protractor): it also gives this pad the pen (368) */
function padToolPick_(pad, t) {
  if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  /* THE PROTRACTOR IS PUT DOWN OR PICKED UP, and the tool in hand stays in hand (458). */
  if (t === 'protractor') {
    const st = padProtOf_(k);
    st.on = !st.on;
    if (PAD_ON !== k) padTake_(pad, k);
    padProtSync_(k);
    return;
  }
  /* THE SAME TOOL TAPPED AGAIN PUTS IT DOWN (1020): one obvious way back to no tool, and the card stays as it was */
  if (PAD_ON === k && (PAD_TOOL.get(k) || 'pen') === (t || 'pen')) { padArm_(pad, false); PAD_ON = ''; padDrop_(); return; }
  PAD_TOOL.set(k, t || 'pen');
  if (PAD_ON !== k) padTake_(pad, k); else padArm_(pad, true);
}

/* ---------- THE PROTRACTOR (458): a 180° scale lying over the pen's page, moved by its body, turned by its knob ---------- */
/* where it lies, per pad key for the visit: its centre in % of the picture, its turn in degrees */
const PAD_PROT = new Map();
function padProtOf_(k) { if (!PAD_PROT.has(k)) PAD_PROT.set(k, { on: false, x: 50, y: 70, a: 0 }); return PAD_PROT.get(k); }
const padProtOn_ = k => !!(k && PAD_PROT.has(k) && PAD_PROT.get(k).on);
/* THE PIVOT (the centre of the base line) inside the drawing's box, in %: the box is -8 -26 216 134 */
const PROT_PX = 50, PROT_PY = 126 / 134 * 100;
/* WITHIN THIS MANY DEGREES OF LEVEL OR UPRIGHT IT SETTLES THERE, as a ruler laid on a line does */
const PROT_SNAP_DEG = 2;
let PROT_SVG = '';
function padProtSvg_() {
  if (PROT_SVG) return PROT_SVG;
  const R = 100, cx = 100, cy = 100, P = (r, d) => { const t = (180 - d) * Math.PI / 180; return [(cx + r * Math.cos(t)).toFixed(2), (cy - r * Math.sin(t)).toFixed(2)]; };
  let ticks = '', nums = '';
  for (let d = 0; d <= 180; d++) {
    const len = d % 10 === 0 ? 12 : d % 5 === 0 ? 8 : 4, a = P(R, d), b = P(R - len, d);
    ticks += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
    if (d % 10 === 0) {
      const o = P(R - 19, d), i = P(R - 31, d);
      nums += `<text x="${o[0]}" y="${o[1]}">${d}</text><text class="qprot-in" x="${i[0]}" y="${i[1]}">${180 - d}</text>`;
    }
  }
  PROT_SVG = `<svg viewBox="-8 -26 216 134" aria-hidden="true">
    <path class="qprot-body" d="M0 100A100 100 0 0 1 200 100Z"/>
    <path class="qprot-ticks" d="${ticks}M${cx} ${cy}L${cx} ${cy - 40}M${cx - 6} ${cy}L${cx + 6} ${cy}"/>
    <g class="qprot-nums">${nums}</g>
    <circle class="qprot-pin" cx="${cx}" cy="${cy}" r="2.5"/>
    <line class="qprot-stem" x1="${cx}" y1="0" x2="${cx}" y2="-14"/>
    <circle class="qprot-knob" data-prot="turn" cx="${cx}" cy="-16" r="9"/>
    <circle class="qprot-hit" data-prot="turn" cx="${cx}" cy="-16" r="22"/>
  </svg>`;
  return PROT_SVG;
}
function padProtHtml_(k) {
  const st = padProtOf_(k);
  return `<div class="qpad-prot" data-noswipe data-prot-k="${esc(k)}" role="img" aria-label="Protractor, turned ${Math.round(st.a)} degrees"
    style="left:${st.x.toFixed(2)}%;top:${st.y.toFixed(2)}%;transform:translate(-${PROT_PX}%,-${PROT_PY.toFixed(3)}%) rotate(${st.a}deg);transform-origin:${PROT_PX}% ${PROT_PY.toFixed(3)}%">${padProtSvg_()}</div>`;
}
/* EVERY COPY OF THIS PAD ON THE PAGE, with the protractor down or up as its state says, and the tile lit to match -- in place, no repaint */
function padProtSync_(k) {
  document.querySelectorAll('.qpad').forEach(pad => {
    if ((pad.getAttribute('data-k') || '') !== k) return;
    const art = pad.querySelector('.qpad-art');
    if (!art) return;
    const was = art.querySelector(':scope > .qpad-prot');
    if (was) was.remove();
    const on = padProtOn_(k);
    if (on) art.insertAdjacentHTML('beforeend', padProtHtml_(k));
    const card = pad.closest('.qcard'), tile = card && card.querySelector('.qt-row .qt-t[data-tool="protractor"]');
    if (tile) tileSet_(tile, { on: on, pressed: on });
  });
}
/* ITS OWN DRAG, AHEAD OF THE PEN'S (capture), so a finger on the protractor moves it and never draws or swipes */
let PROT_GO = null;
document.addEventListener('pointerdown', e => {
  const el = e.target && e.target.closest && e.target.closest('.qpad-prot');
  if (!el) return;
  const art = el.parentNode, k = el.getAttribute('data-prot-k') || '';
  if (!art || !art.getBoundingClientRect) return;
  e.preventDefault(); e.stopPropagation();
  const st = padProtOf_(k), r = art.getBoundingClientRect();
  PROT_GO = { id: e.pointerId, el, k, r, turn: !!(e.target.closest('[data-prot="turn"]')), x0: e.clientX, y0: e.clientY, sx: st.x, sy: st.y };
  try { el.setPointerCapture(e.pointerId); } catch (err) { /* focus and scrolling are niceties */ }
}, true);
document.addEventListener('pointermove', e => {
  const g = PROT_GO;
  if (!g || e.pointerId !== g.id) return;
  e.preventDefault(); e.stopPropagation();
  const st = padProtOf_(g.k);
  if (g.turn) {
    const cx = g.r.left + st.x / 100 * g.r.width, cy = g.r.top + st.y / 100 * g.r.height;
    let a = Math.round(Math.atan2(e.clientX - cx, cy - e.clientY) * 180 / Math.PI);
    [-180, -90, 0, 90, 180].forEach(s => { if (Math.abs(a - s) <= PROT_SNAP_DEG) a = s; });
    st.a = a;
  } else {
    st.x = Math.max(0, Math.min(100, g.sx + (e.clientX - g.x0) / g.r.width * 100));
    st.y = Math.max(0, Math.min(100, g.sy + (e.clientY - g.y0) / g.r.height * 100));
  }
  g.el.style.left = st.x.toFixed(2) + '%';
  g.el.style.top = st.y.toFixed(2) + '%';
  g.el.style.transform = `translate(-${PROT_PX}%,-${PROT_PY.toFixed(3)}%) rotate(${st.a}deg)`;
  g.el.setAttribute('aria-label', 'Protractor, turned ' + Math.round(st.a) + ' degrees');
}, true);
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, e => {
  if (!PROT_GO || e.pointerId !== PROT_GO.id) return;
  e.stopPropagation();
  PROT_GO = null;
}, true));

/* UNDO AND CLEAR IN THE PART'S TOOL ROW (1020) name their pad by key; the board's own bar sits inside it */
const padOfTile_ = el => el.closest('.qpad') || (() => { const c = el.closest('.qcard'), k = el.getAttribute('data-k');
  return c && k ? [...c.querySelectorAll('.qpad')].find(p => p.getAttribute('data-k') === k) || null : null; })();
on('pad-undo', (el) => {
  const pad = padOfTile_(el); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  /* NOT UNDER A RESTING HAND -- `padRested_`. */
  if (padRested_(k)) return;
  const all = padRead_(k);
  /* AN EMPTY PAD THAT CLEAR EMPTIED: the last thing done was the Clear, so it is what Undo undoes. */
  if (!all.length && PAD_CLEARED.has(k)) {
    const back = PAD_CLEARED.get(k);
    const mark = PAD_CLEARED_MARK.get(k) || null;
    PAD_CLEARED.delete(k);
    PAD_CLEARED_MARK.delete(k);
    /* WITH WHOSE THEY WERE, not judged as strokes drawn now over an empty pad. */
    const put = () => ansStore_(k, JSON.stringify(back));
    if (typeof ansPutBack_ === 'function') ansPutBack_(k, mark, put); else put();
    padRepaint_(pad, back);
    padCopies_(k, pad, back);
    toast('Put back');
    return;
  }
  if (!all.length) return;
  all.pop();
  ansStore_(k, JSON.stringify(all));
  padRepaint_(pad, all);
  padCopies_(k, pad, all);
});

/* ---------- CLEAR CAN BE UNDONE § */
on('pad-clear', (el) => {
  const pad = padOfTile_(el); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  if (padRested_(k)) return;
  const had = padRead_(k);
  if (!had.length) return;
  PAD_CLEARED.set(k, had);
  /* READ BEFORE THE CLEAR BELOW TAKES THE MARK WITH THE STROKES. */
  PAD_CLEARED_MARK.set(k, typeof ansMarkable_ === 'function' && ansMarkable_(k) && typeof ansGoneOf_ === 'function' ? ansGoneOf_(k) : null);
  /* CLEARED IS A VALUE TOO — sent as nothing, so the drawing goes from the other device as well. */
  ansStore_(k, null);
  padRepaint_(pad, []);
  padCopies_(k, pad, []);
  toast('Cleared. Undo puts it back.');
});

/* UNDO AND CLEAR LIT OR DIMMED BY THEIR OWN LOOK ONLY, in the pad's bar or the part's tool row (1020) */
const padDim_ = (pad, all) => { const pk = pad.getAttribute('data-k') || '', card = pad.closest('.qcard') || pad;
  [...pad.querySelectorAll('.qpad-undo, .qpad-clear'), ...[...card.querySelectorAll('.qt-row .qpad-undo, .qt-row .qpad-clear')].filter(b => b.getAttribute('data-k') === pk)]
    .forEach(b => { b.disabled = !(all || []).length && !(b.classList.contains('qpad-undo') && PAD_CLEARED.has(pk)); }); };
/* REPAINTED FROM THE STORED MARKS RATHER THAN BY REMOVING A NODE, so that what is on the screen is always exactly what would come back on a reload. § */
function padRepaint_(pad, all) {
  /* NOTHING TO UNDO OR CLEAR IS SAID BY A DIMMED TILE, not a tap that does nothing (990). */
  padDim_(pad, all);
  const g = pad.querySelector('.qpad-g');
  if (!g) return;
  const k = padAspectOf_(pad);
  const want = (all || []).map(st => padPath_(st, k));
  const have = g.children;
  let i = 0;
  while (i < want.length && i < have.length) {
    const p = have[i];
    if (String(p.tagName).toLowerCase() !== 'path' || p.attributes.length !== 2
        || p.getAttribute('vector-effect') !== 'non-scaling-stroke' || p.getAttribute('d') !== want[i]) break;
    i++;
  }
  if (!i) { g.innerHTML = want.map(d => `<path vector-effect="non-scaling-stroke" d="${d}"/>`).join(''); return; }
  while (have.length > i) g.removeChild(have[have.length - 1]);
  for (; i < want.length; i++) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    p.setAttribute('d', want[i]);
    g.appendChild(p);
  }
}

/* THE WHITEBOARD IS THIS PEN, ON NOTHING. § */
const WB_ITEM = { key: 'whiteboard', prefix: 'board' };
const PAD_HERE_ONLY = 'Kept on this device only.';
/* EMPTY, BECAUSE THE BOX IS THE BOARD. § */
const WB_SURF = '<svg class="wb-surf" viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true"></svg>';

/* THE BOARD'S KEYS -- `board:` signed out, `board:u:<who>:` signed in -- which the pen asks about in
   two places: `padEnd_` thins the board's strokes and `padSave_` holds it to its ceiling. */
const padIsBoard_ = k => String(k || '').indexOf(WB_ITEM.prefix + ':') === 0;

/* ---------- HOW BIG A BOARD MAY GET, AND WHAT A STROKE ON IT COSTS § */
const PAD_BOARD_MAX = 100000;

/* ---------- AND NO COLUMN IS REDRAWN UNDER A STROKE § */
function padHold_(id) {
  try {
    if (!PAD_ST || !PAD_GO || !PAD_GO.ink || !PAD_GO.ink.isConnected) return false;
    const host = document.getElementById('s-' + id);
    return !!host && host.contains(PAD_GO.ink);
  } catch (e) { return false; }
}

/* ---------- A CHANGE OF PERSON PUTS THE PEN DOWN AND DRAWS EVERY BOARD AGAIN § */
function padWhoChanged_() {
  [].slice.call(document.querySelectorAll('.qpad')).forEach(p => padArm_(p, false));
  PAD_ON = '';
  /* THE STROKE, ITS PREVIEW AND EVERY CONTACT, PUT DOWN AND NOTHING STORED -- `padDrop_`. */
  padDrop_();
  PAD_CLEARED.clear();
  PAD_CLEARED_MARK.clear();
  wbPaint_();
}

/* EVERY COPY, BY CLASS -- `tmtPaint_`'s reason: § */
/* AND EACH SLOT IT DRAWS INTO IS SAID TO BE DRAWN FOR WHOEVER IS SIGNED IN NOW (`slot.WHO`). § */
function wbPaint_() {
  const html = `<div class="wb">${padWrap_(WB_ITEM, WB_SURF, true)}</div>`;
  const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
  document.querySelectorAll('.wb-box').forEach(el => {
    if (PAD_ST && PAD_GO && el.contains(PAD_GO.ink)) return;
    el.innerHTML = html;
    const slot = el.closest('.widget-slot');
    /* `OWN` AS WELL: the board is drawn from this person's strokes on this device and from no fact, so a
       landing or a repaint for the same person leaves it drawn (`widgetsReveil_`). */
    if (slot) { slot.WHO = who; slot.OWN = who; }
  });
}
function initWhiteboard() { wbPaint_(); }

/* "USE YOUR GRAPH" SHOWS YOUR GRAPH. § */
const usesPart_ = p => String(p == null ? '' : p).toLowerCase().replace(/[^a-z0-9]/g, '');
const usesAt_ = (x, part) => paperIdOf_(x.row || x) + '|' + String(x.qNumber == null ? '' : x.qNumber) + '|' + usesPart_(part);
/* BUILT ONCE PER LIST OF ITEMS, which is once per payload and person (`stuffItemsAll_`'s own memo). */
let USES_MEMO = { from: null, at: null };
function usesOf_(x) {
  if (!isQ_(x) || !usesPart_(x.uses)) return null;
  let all = [];
  try { all = stuffItemsAll_() || []; } catch (e) { return null; }
  if (USES_MEMO.from !== all) {
    const at = new Map();
    all.forEach(y => { if (isQ_(y)) at.set(usesAt_(y, y.qPart), y); });
    USES_MEMO = { from: all, at: at };
  }
  const y = USES_MEMO.at.get(usesAt_(x, x.uses));
  return y && y.key !== x.key ? y : null;
}
/* A PART'S OWN MARKS, FOR WHOEVER IS SIGNED IN -- opening them anywhere is opening them (`padAdopt_`). */
function usesMine_(y) {
  const k = padKey_(y);
  padAdopt_(k, 'pad:' + padItemKey_(y));
  return padRead_(k);
}
/* THE PARTS `x` USES WHOSE MARKS ARE ON THE PICTURE `svg`, earliest first, stopping where the picture changes. § */
function usesChain_(x, svg) {
  const out = [];
  const seen = new Set([x && x.key]);
  let y = usesOf_(x);
  while (y && !seen.has(y.key)) {
    seen.add(y.key);
    const p = padSource_(y);
    if (!p || p.svg !== svg) break;
    out.unshift(y);
    y = usesOf_(y);
  }
  return out;
}
/* EVERY MARK THOSE PARTS MADE, earliest part first. */
const usesUnder_ = (x, svg) => [].concat(...usesChain_(x, svg).map(usesMine_));
/* ---------- ONE FIGURE, SEVERAL PARTS DRAWING ON IT (381): every other part's ink is under this part's, faint and out of reach of its Undo, Clear and Check: the paper prints one figure, and each part is marked on its own ink */
function padUnderParts_(x, svg) {
  const out = usesChain_(x, svg);
  if (!x || x.prefix) return out;
  let sib = [];
  try { sib = (questionParts_()[qId_(x)]) || []; } catch (e) { sib = []; }
  sib.forEach(y => {
    if (!y || y === x || y.key === x.key || out.indexOf(y) >= 0) return;
    const p = padSource_(y);
    if (p && p.from !== 'surface' && p.svg === svg) out.push(y);
  });
  return out;
}
/* THE EARLIER MARKS AS AN INK GROUP, beside the pad's own and never inside it: `padRepaint_` rewrites
   `.qpad-g` from this part's storage, so nothing it does can reach these. */
const usesInk_ = (all, k) => `<g class="qpad-was" vector-effect="non-scaling-stroke">${all.map(st =>
  `<path vector-effect="non-scaling-stroke" d="${padPath_(st, k)}"/>`).join('')}</g>`;
