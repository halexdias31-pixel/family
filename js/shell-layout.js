
/** Redraw whatever is showing. What almost everything calls after a change. */
/* THE ORDER A REDRAW HAPPENS IN, WRITTEN DOWN ONCE § */
const repaint = (instant) => {
  /* 00. WHICH COLUMNS THERE ARE, for whoever is signed in now — every sign-in and sign-out ends here, so
         an admin's column comes and goes with them, without a reload. See `columnsFor_`. */
  try { columnsFor_(); } catch (e) { oops_(e, 'shell:awaiting_') }
  /* 000. A CHANGE OF PERSON PUTS AWAY WHAT WAS DRAWN FOR THE LAST ONE, NOW — before this returns, with no idle moment in between: § */
  const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
  if (REPAINT_WHO !== null && who !== REPAINT_WHO) {
    ACT_EPOCH++;
    if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => widgetsReveil_(c, true));
  }
  REPAINT_WHO = who;
  DRAW_EPOCH++;
  /* 0. EVERY OTHER SCREEN IS NOW OUT OF DATE — see the note on `STALE`. § */
  TABS.forEach(t => { if (t.id !== AT) STALE[t.id] = STALE[t.id] === 1 ? 1 : REPAINT_MARK; });
  /* 0b. AND EVERY WIDGET DRAWN FROM THE FACTS THAT HAVE JUST MOVED IS PUT BACK UNDER ITS LOADER NOW, on every column just marked — not when the column is next § */
  if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => { if (c !== AT && STALE[c]) widgetsReveil_(c, false); });
  /* 1. THE SCREEN YOU ARE ON, drawn from nothing (it is restarted below) — UNLESS A LANDING FINDS IT AS IT WAS. § */
  const land = REPAINT_MARK === 'maybe' && !(typeof WIDGET_COLS !== 'undefined' && WIDGET_COLS.indexOf(AT) !== -1)
            && !(typeof finderOf_ === 'function' && finderOf_(AT));
  const kept = paint(AT, !land, land ? { land: true } : undefined) === 'kept';
  /* 1b. AND WHATEVER THAT SCREEN HAS RUNNING, because `paint` has just replaced the markup it was running in. § */
  if (!kept && typeof startScreen_ === 'function') startScreen_(AT);
  paintNeighbours();               // 2. the ones either side
  /* 3. A repaint rebuilds the markup, which throws the positions away with it — so the page you were on would silently become the first one every time anything § */
  paintPager(AT, true);
  placeCells('x', instant !== false);   // 4. and only now, positions
  /* 5. AND EVERY COLUMN JUST MARKED IS DRAWN AGAIN IN THE NEXT QUIET MOMENTS, nearest first — see `ahead_`. */
  if (typeof aheadKick_ === 'function') aheadKick_();
};
/* WHO THE LAST REPAINT DREW FOR — see step 000 above. Null until the first, which has nobody before it. */
let REPAINT_WHO = null;

/* ONE GRID. TWO AXES. THE SAME BEHAVIOUR ON BOTH. § */
const AXES = {
  /* X — the tabs. */
  x: {
    prop: '--dx',                                   // the drag offset, in the cell's transform
    /* HOW FAR A SIDEWAYS SWIPE HAS TO TRAVEL to count, and it is a share of the APP's width rather than the window's — the same mistake `stepX_` had. § */
    span: () => appWidth_(),
    /* The same signature as the other axis, `id` ignored — there is only one row of tabs. Written
       the same way so nothing calling an axis has to know which one it has. */
    at:    () => Math.max(0, TABS.findIndex(t => t.id === AT)),
    count: () => TABS.length,
    /* IN TAB ORDER, not in the order the sections happen to appear in index.html. § */
    cells: () => TABS.map(t => $('s-' + t.id)).filter(Boolean),
    /* CLAMPED. The other axis clamps inside `goPage` and this one did not, so a swipe past the last tab asked for `TABS[4]` and read `.id` off nothing. § */
    go:    (n, instant) => {
      const at = Math.max(0, Math.min(TABS.length - 1, n));
      go(TABS[at].id, true, instant);
    },
  },
  /* Y — the widgets on a paged screen. Absent on a screen that is not paged, which is what makes
     a vertical drag there fall through to ordinary scrolling. */
  y: {
    prop: '--dy',
    /* THE SAME DISTANCE the threshold and the settle use — see `stepY_`. This said `innerHeight`,
       which is the SCREEN rather than the step, so a vertical gesture was judged against a number
       it was never travelling. */
    span: () => stepY_(),
    /* EVERY ONE OF THESE TAKES AN `id`, defaulting to the screen in front. § */
    at:    id => PAGE[id || AT] || 0,
    count: id => PAGER[id || AT] ? pageCount(id || AT) : 0,
    /* WHAT MOVES, which is the screen — the pages are stacked inside it by CSS and never carry a transform of their own. § */
    cells: id => [$('s-' + (id || AT))].filter(Boolean),
    go:    (n, instant) => goPage(AT, n, instant),
  },
};

/* PLACE EVERY CELL ON AN AXIS. § */
/* PLACE EVERY CELL, ON BOTH AXES AT ONCE. § */
/* HOW BIG A CELL IS, AND THE ONE GAP BETWEEN THEM. § */
/* HOW MUCH OF THE VIEWPORT A CELL TAKES, and it is the same number for every cell on the grid, always. § */
/* ---------- HOW WIDE A CARD IS, AND HOW MUCH OF THE NEXT ONE YOU CAN SEE § */
const CARD_W       = 0.84;    // a card, as a fraction of the screen's width
const EDGE_SHOWING = 0.06;    // how much of the card either side you can see, same units

/* ---------- ON A WIDE WINDOW THE GRID SHOWS MORE OF ITSELF § */
const WIDE_FROM     = 700;    // px of WINDOW — a phone held either way, and a small tablet upright, are below it
const WIDE_CARD_MIN = 21;     // rem — the narrowest card that is put beside another
const WIDE_CARD_MAX = 28;     // rem — the widest a card grows to fill the room
const WIDE_EDGE     = 24;     // px — at least this much of the next column shows past the last whole one
let WIDE = false;

/* SAID ON `<html>` AS `.wide`, which is what lets `body` stop being a phone (style.css, THE WIDE WINDOW). § */
function wideSet_() {
  let w;
  try { w = matchMedia('(min-width: ' + WIDE_FROM + 'px)').matches; } catch (e) { w = innerWidth >= WIDE_FROM; }
  if (FLOW_LAYOUT) w = false;   /* one centred column at every width (900) */
  if (w !== WIDE || document.documentElement.classList.contains('wide') !== w) {
    WIDE = w;
    document.documentElement.classList.toggle('wide', w);
    /* AND WHAT THE POINTER WAS SAYING ON A WIDE WINDOW GOES WITH IT — see `wideOverClear_`. */
    if (!w) wideOverClear_();
  }
  return WIDE;
}

/* THE CARD'S WIDTH ON A WIDE WINDOW, in px, and how many whole ones fit — see above. */
function wideCard_() {
  const W = appWidth_();
  let rem = 16;
  try { rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; } catch (e) { oops_(e, 'shell:wideCard_') }
  const lo = WIDE_CARD_MIN * rem, hi = WIDE_CARD_MAX * rem;
  let k = 1;
  while ((k + 2) * lo + (k + 1) * CELL_GAP + 2 * WIDE_EDGE <= W) k += 2;
  const card = Math.min(hi, (W - 2 * WIDE_EDGE - (k - 1) * CELL_GAP) / k);
  return { card: Math.max(lo, card), k: k };
}

/* THESE TWO COME OUT OF THE SAME WIDTH, which is the whole thing to understand before changing either. § */
/* Kept under its old name because the vertical spacing still uses it and 16px is right there —
   a column of cards is read one after another, and the gap only has to say "these are separate". */
const CELL_GAP   = 16;        // pixels between one card and the next, going DOWN

/* HOW FAR APART TWO PANES SIT, so that the gap between what you SEE is `CELL_GAP`. § */
/* ---------- THE BROWSER STACKS THE COLUMN, NOT THIS FILE § */
/* ---------- THE CARD YOU ARE ON SITS IN THE MIDDLE OF THE SCREEN § */
/* THE PART OF A COLUMN'S GLASS THAT CAN BE SEEN (720): all of it, or only what is above the keypad while it is up, so a card is centred where it shows. */
function glassSeenH_(host) {
  const boxH = host.clientHeight || innerHeight;
  if (!document.documentElement.classList.contains('kp-up')) return boxH;
  try {
    const pad = document.getElementById('kp');
    if (!pad || pad.hidden) return boxH;
    const base = (host.offsetParent || host.parentElement).getBoundingClientRect().top + host.offsetTop;
    const seen = pad.getBoundingClientRect().top - 12 - base;
    return seen > 120 ? Math.min(boxH, seen) : boxH;
  } catch (e) { return boxH; }
}
function columnShift_(host, at) {
  const pages = host.querySelectorAll(':scope > .page');
  const cur = pages[Math.max(0, Math.min(pages.length - 1, at))];
  if (!cur) return 0;
  const boxH = glassSeenH_(host);
  const h = HOLD_AT;
  /* A FINDER IS NOT HELD ONCE NOTHING IN IT HAS FOCUS (720, owner: "the finder widget should always stay centred"): the hold is for typing, and typing is over. */
  const loose = h && typeof finderOf_ === 'function' && finderOf_(h.id) && !(document.activeElement && host.contains(document.activeElement));
  if (h && !loose && host.id === 's-' + h.id && (PAGE[h.id] || 0) === h.p && at === domIndex_(h.id, h.p)
      && h.vp === innerWidth + 'x' + innerHeight) {
    const room = boxH - cur.offsetHeight;
    /* HELD ONLY WHILE IT GROWS (508): a card that shrank (words or chips cleared) is centred again, and held from there. */
    if (h.h != null && cur.offsetHeight < h.h - 1) h.top = Math.max(0, room / 2);
    h.h = cur.offsetHeight;
    /* `lift` IS THE MATHS KEYPAD'S, and only the keypad's — see `kpLift_` in keypad.js. § */
    return (room <= 0 ? 0 : Math.max(0, Math.min(room, h.top))) - (h.lift || 0) - cur.offsetTop;
  }
  return Math.max(0, (boxH - cur.offsetHeight) / 2) - cur.offsetTop;
}

/* ---------- ONCE YOU ARE USING A CARD, IT STAYS WHERE IT IS § */
let HOLD_AT = null;      // { id, p, top, h, vp, lift } — the card being used, where its top is held, and how far the keypad lifted it

function holdHere_(t) {
  try {
    const pg = t && t.closest && t.closest('#screen .page.on');
    const host = pg && pg.parentElement;
    if (!host || host.id !== 's-' + AT) return;
    /* ONCE PER CARD. The first touch says where it is; asking again on every keystroke would force a
       layout per letter typed, for the answer the first one already gave. */
    if (HOLD_AT && HOLD_AT.id === AT && HOLD_AT.p === (PAGE[AT] || 0)) return;
    const at = colPlaced_(host);
    if (!at) return;
    HOLD_AT = { id: AT, p: PAGE[AT] || 0, top: at[1] + pg.offsetTop, h: pg.offsetHeight, vp: innerWidth + 'x' + innerHeight };
  } catch (e) { HOLD_AT = null; }
}

/* ---------- A CARD ABOVE CHANGED HEIGHT, SO THE COLUMN IS HELD ON THE PAGE YOU ARE READING § */
/* ---------- AND ONLY ON THE PAGE IT WAS PLACED FOR, AND IT SAYS WHETHER IT COULD § */
function holdColumn_(id) {
  try {
    const host = $('s-' + id);
    if (!host) return false;
    if (PLACE_FRAME && PLACE_WANT && !PLACE_WANT.instant) return false;
    if (host.PLACED_P !== (PAGE[id] || 0)) return false;
    const at = colPlaced_(host);
    if (!at) return false;
    /* A FINGER IS DOWN: this column's entry in this drag's plan, or nothing to correct — a plan
       made for another card in front is one the next drag frame throws away and measures afresh. */
    let plan = null;
    if (host.classList.contains('dragging')) {
      const p = DRAG_PLAN;
      plan = p && p.at === AT && p.page === (PAGE[AT] || 0) ? p.cols.find(c => c.host === host) : null;
      if (!plan) return true;
    }
    const want = columnShift_(host, domIndex_(id, PAGE[id] || 0));
    const rest = plan ? plan.y : at[1];
    if (!isFinite(want)) return false;
    if (Math.abs(rest - want) < 0.5) return true;
    const run = typeof host.getAnimations === 'function'
      && host.getAnimations().find(a => a.playState === 'running' && a.transitionProperty === colProp_('y'));
    if (plan) plan.y = want;
    /* ---------- MID-SLIDE, THE SLIDE IS MOVED WITH THE LAYOUT, NOT RETARGETED UNDER IT § */
    if (run && !plan) {
      let left = 0;
      try { const tm = run.effect.getComputedTiming(); left = Math.max(0, tm.endTime - tm.localTime); } catch (e) { oops_(e, 'shell:holdColumn_') }
      colShiftNow_(host, want - rest);
      colTransition_(host, null, { d: Math.max(80, Math.round(left)) + 'ms', tf: 'cubic-bezier(.25, .6, .25, 1)', delay: '0s' });
    } else if (!run) colTransition_(host, null, SLIDE_NONE);
    colWrite_(host, at[0], want + (at[1] - rest));
    return true;
  } catch (e) { /* a column left where it was is the behaviour before this existed */ return false; }
}

/* ---------- HOW FAR IT IS TO THE NEXT CARD DOWN § */
function stepY_() {
  const host = $('s-' + AT);
  const pages = host ? host.querySelectorAll(':scope > .page') : [];
  const at = Math.max(0, Math.min(pages.length - 1, domIndex_(AT, PAGE[AT] || 0)));
  const here = pages[at], next = pages[at + 1] || pages[at - 1];
  if (here && next) {
    const gap = Math.abs(next.offsetTop - here.offsetTop);
    if (gap > 20) return gap;
  }
  return innerHeight * 0.66;
}

/* ACROSS IS A CONSTANT — every card is the same width by rule, so there is nothing to measure. */
/* WHERE THE NEXT CARD SITS, from the two fractions above and nothing else. § */
/* ---------- ONE SOURCE FOR THE CARD'S WIDTH § */
function publishCardWidth_() {
  /* A WIDE WINDOW'S CARD IS A WIDTH, NOT A SHARE — see THE GRID SHOWS MORE OF ITSELF. `wideSet_`
     first, because the class it writes is what decides the width `wideCard_` measures. */
  if (wideSet_()) {
    document.documentElement.style.setProperty('--card-w', wideCard_().card.toFixed(1) + 'px');
  } else {
    document.documentElement.style.setProperty('--card-w', (CARD_W * 100).toFixed(2) + '%');
  }
  /* AND HOW SOFT A CARD OUT OF FOCUS IS, for the same reason: § */
  document.documentElement.style.setProperty('--soft-blur', SOFT_BLUR + 'px');
}

/* ---------- THE WIDTH THAT MATTERS IS THE APP'S, NOT THE WINDOW'S § */
function appWidth_() {
  const el = $('screen');
  return (el && el.clientWidth) || innerWidth;
}

function stepX_() {
  /* THE GAP THE TWO FRACTIONS LEAVE, and a refusal if they leave none. § */
  /* ON A WIDE WINDOW: ONE CARD AND ONE GAP. § */
  if (WIDE) return wideCard_().card + CELL_GAP;
  const gap = Math.max(0.005, 0.5 - CARD_W / 2 - EDGE_SHOWING);
  return appWidth_() * (CARD_W + gap);
}

/* ---------- THE SETTLE AFTER A SWIPE, MATCHED TO THE FINGER § */
let SETTLE_FROM = null;        // { axis, v, at } — the release the next placement settles from
/* { axis, dur, tf, until } — the settle the columns are running now. THE AXIS IS PART OF IT: a
   settle is one axis's transition and the other axis keeps its own — see `colWrite_`. */
let SETTLE_ON = null;
function settleFrom_(axis, v) {
  SETTLE_FROM = axis ? { axis: axis, v: Number(v) || 0, at: performance.now() } : null;
}
/* THE SETTLE IS A CRITICALLY DAMPED SPRING (527), iOS's: done within half a pixel, so its time follows distance and speed. */
/* WRITTEN AS A CSS `linear()` sampled from it, so the compositor runs it; without `linear()`, the old bezier at the spring's time. */
const SPRING_W = 0.02;         // natural frequency, per ms: nine tenths of the way in about 195ms from rest
const SPRING_MAX = 900;        // ms, the longest a settle may take
const SPRING_LINEAR = (() => {
  try { return !!(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)')); } catch (e) { return false; }
})();
/* THE SHARE OF THE WAY AT TIME t, released at `a` shares per ms: x(t) = 1 − (1 + (ω − a)t)·e^(−ωt). */
function springAt_(a, t) { return 1 - (1 + (SPRING_W - a) * t) * Math.exp(-SPRING_W * t); }
/* THE RELEASE SPEED AS A SHARE OF THE WAY, capped at ω (more would sail past the target) and at −ω/2 the other way. */
function springOf_(D, v) {
  const dist = Math.abs(D);
  const a = dist >= 1 ? Math.max(-SPRING_W / 2, Math.min(SPRING_W, (Number(v) || 0) * Math.sign(D) / dist)) : 0;
  const eps = 0.5 / Math.max(1, dist);
  let T = 16;
  while (T < SPRING_MAX && Math.abs(1 - springAt_(a, T)) > eps) T += 8;
  return { a: a, dur: T };
}
function settleCurve_(D, v) {
  const s = springOf_(D, v), dur = s.dur;
  if (SPRING_LINEAR) {
    const n = Math.max(12, Math.min(48, Math.round(dur / 12))), pts = [0];
    for (let i = 1; i < n; i++) pts.push(+springAt_(s.a, dur * i / n).toFixed(4));
    pts.push(1);
    return { dur: dur, a: s.a, tf: 'linear(' + pts.join(', ') + ')' };
  }
  /* THE FALLBACK: a bezier whose first slope is the release speed — the curve before 527. */
  const k = s.a * dur;
  if (!(k > 0.02)) return { dur: dur, a: s.a, tf: 'cubic-bezier(.3, 0, .2, 1)' };
  let x1 = 0.3, y1 = 0.3 * k;
  if (y1 > 1) { x1 = 1 / k; y1 = 1; }
  return { dur: dur, a: s.a, tf: 'cubic-bezier(' + x1.toFixed(3) + ', ' + y1.toFixed(3) + ', .25, 1)' };
}
/* LESS MOTION ASKED FOR: every placement lands at once — a release snaps, a tab jumps (527). */
const motionLess_ = () => !motionOK_();   // one question for less motion, asked through motionOK_ (531)

/* ---------- EACH AXIS HAS ITS OWN CLOCK § */
const SPLIT_AXES = (() => {
  try { return !(window.CSS && window.CSS.supports) || window.CSS.supports('translate', '1px 2px'); }
  catch (e) { return false; }
})();
/* THE SLIDE NOBODY'S FINGER IS IN — a tab tapped, a tile that turns a page — and the stylesheet's
   `.screen` transition says the same, for the moment before anything is placed. */
const SLIDE_TAP = { d: '.3s', tf: 'cubic-bezier(.3, 0, .2, 1)', delay: '0s' };
const SLIDE_NONE = { d: '0s', tf: 'linear', delay: '0s' };
const colProp_ = axis => (SPLIT_AXES && axis === 'y' ? 'translate' : 'transform');

function colWrite_(host, x, y) {
  if (SPLIT_AXES) {
    host.style.transform = `translateX(${x.toFixed(1)}px)`;
    host.style.translate = `0px ${y.toFixed(1)}px`;
  } else {
    host.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }
}
/* ---------- A COLUMN MOVED BY WHAT ITS LAYOUT MOVED, FROM WHERE IT IS DRAWN § */
/* AND WITH NO TRANSITION AT ALL, NOT A SHORT ONE. § */
function colShiftNow_(host, d) {
  if (!host || !(Math.abs(d) >= 0.5)) return;
  const at = colPlaced_(host);
  if (!at) return;
  const now = colNow_(host);
  colTransition_(host, null, SLIDE_NONE);
  const list = host.style.transitionProperty;
  host.style.transitionProperty = SPLIT_AXES ? 'transform, opacity' : 'opacity';
  colWrite_(host, SPLIT_AXES ? at[0] : now[0], now[1] + d);
  void getComputedStyle(host).getPropertyValue(colProp_('y'));
  host.style.transitionProperty = list;
}

/* WHERE THE LAST PLACEMENT PUT IT — the inline values, which are where it is going, not where it is
   drawn mid-slide (that is `colNow_`). `translate: 0px 0px` reads back as `0px`, so a missing second
   half is nought. */
function colPlaced_(host) {
  if (SPLIT_AXES) {
    const mx = /translateX\(\s*(-?[\d.]+)px/.exec(host.style.transform || '');
    if (!mx) return null;
    const t = String(host.style.translate || '').trim().split(/\s+/);
    return [parseFloat(mx[1]), parseFloat(t[1]) || 0];
  }
  const m = /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/.exec(host.style.transform || '');
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
}
/* AND WHERE IT IS DRAWN NOW, off the running transitions. § */
function colNow_(host) {
  const cs = getComputedStyle(host);
  const m = String(cs.transform || '').match(/matrix\(([^)]+)\)/);
  const v6 = m ? m[1].split(',').map(Number) : [1, 0, 0, 1, 0, 0];
  if (!SPLIT_AXES) return [v6[4], v6[5]];
  const t = String(cs.translate || '').trim().split(/\s+/);
  return [v6[4], parseFloat(t[1]) || 0];
}
/* THE THREE TRANSITIONS, AS LONGHANDS. `x` and `y` are `{ d, tf, delay }`; a `null` keeps what this
   column had, which is how `holdColumn_` zeroes the vertical without touching a sideways slide. */
function colTransition_(host, x, y, o) {
  const t = host._slide || (host._slide = { x: SLIDE_TAP, y: SLIDE_TAP, o: { d: '.22s', tf: 'ease', delay: '0s' } });
  if (x) t.x = x;
  if (y) t.y = y;
  if (o) t.o = o;
  /* ONE TRANSFORM, ONE CLOCK: whichever axis a finger holds wins, then a settle, then the tap. */
  const one = t.x === SLIDE_NONE || t.y === SLIDE_NONE ? SLIDE_NONE : (t.x !== SLIDE_TAP ? t.x : t.y);
  const list = SPLIT_AXES ? [t.x, t.y, t.o] : [one, t.o];
  host.style.transitionProperty = SPLIT_AXES ? 'transform, translate, opacity' : 'transform, opacity';
  host.style.transitionDuration = list.map(v => v.d).join(', ');
  host.style.transitionTimingFunction = list.map(v => v.tf).join(', ');
  host.style.transitionDelay = list.map(v => v.delay).join(', ');
}

/* WHERE A SETTLING COLUMN REALLY IS, against where it is going — for a drag that starts before the last one has landed (`SWIPE.catch` in overworld.js). § */
function settleLeft_(axis) {
  try {
    const host = $('s-' + AT);
    const prop = colProp_(axis);
    if (!host || !host.getAnimations || !host.getAnimations().some(a => a.transitionProperty === prop)) return 0;
    const placed = colPlaced_(host);
    if (!placed) return 0;
    const now = colNow_(host);
    const off = axis === 'x' ? now[0] - placed[0] : now[1] - placed[1];
    return Math.abs(off) < 0.5 ? 0 : off;
  } catch (e) { return 0; }
}

/* A FINGER LANDING ON THE ROW WHILE IT SLIDES HOLDS IT THERE (527), as on iOS. A sideways drag picks it up (`grabTake_`); */
/* anything else, or a plain lift, lets the spring go on from where it was held (`grabLet_`). Never left half-way. */
let GRAB = null;               // { hosts: [{ host, rest, now }], off } — the row held, and where each column was going
function grabRow_() {
  /* A HOLD WHOSE LIFT NEVER CAME is let go first, so no row is left frozen where a finger once held it. */
  if (GRAB) grabLet_(0);
  GRAB = null;
  /* ONE TRANSFORM FOR BOTH AXES (no `translate`): holding the row would stop a page slide with it, so the catch at the lock does it. */
  if (!SPLIT_AXES || motionLess_()) return 0;
  try {
    const front = $('s-' + AT);
    if (!slideRunning_(front, 'transform')) return 0;
    const hosts = [];
    TABS.forEach(t => {
      const host = $('s-' + t.id), at = host && colPlaced_(host);
      if (at) hosts.push({ host: host, rest: at[0], now: colNow_(host)[0] });
    });
    const f = hosts.find(h => h.host === front);
    if (!f || Math.abs(f.now - f.rest) < 0.5) return 0;
    hosts.forEach(h => {
      colTransition_(h.host, SLIDE_NONE, null);
      h.host.REST_X = h.rest;
      h.host.style.transform = `translateX(${h.now.toFixed(1)}px)`;
    });
    GRAB = { hosts: hosts, off: f.now - f.rest };
    SETTLE_ON = null;
    return GRAB.off;
  } catch (e) { GRAB = null; return 0; }
}
/* THE DRAG TAKES IT: the offset becomes the drag's catch, and the columns' rests stay in `REST_X` for `dragPlan_`. */
function grabTake_() {
  const g = GRAB;
  GRAB = null;
  return g ? g.off : 0;
}
/* NOBODY TOOK IT: the spring goes on from where it was held to where it was going, unless a placement has been since. */
function grabLet_(v) {
  const g = GRAB;
  GRAB = null;
  if (!g || g.hosts.some(h => h.host.REST_X !== h.rest)) return;
  const c = settleCurve_(-g.off, v || 0), run = { d: c.dur + 'ms', tf: c.tf, delay: '0s' };
  g.hosts.forEach(h => {
    h.host.REST_X = null;
    if (!h.host.isConnected) return;
    colTransition_(h.host, run, null);
    h.host.style.transform = `translateX(${h.rest.toFixed(1)}px)`;
  });
  SETTLE_ON = { axis: 'x', dur: c.dur, tf: c.tf, until: performance.now() + c.dur };
  SLIDE_UNTIL = Math.max(SLIDE_UNTIL, SETTLE_ON.until);
  TRAIL_X.until = Math.max(TRAIL_X.until, SETTLE_ON.until + 50);
}

/* ---------- THE CARDS NOT IN FRONT ARE SLIGHTLY OUT OF FOCUS § */
const SOFT_BLUR = 2;              // px — the stylesheet reads it as `--soft-blur`, published once
let SOFT_DRAG = null;             // { ok, b, keep } — the gesture the out-of-focus look is following
const SOFT_EASE = new Set();      // panes carrying an inline filter, will-change and transition
let SOFT_DONE = 0;

function softMotion_() {
  try { return !matchMedia('(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce)').matches; }
  catch (e) { return true; }
}
const glassOf_ = page => (page && page.querySelector(':scope > .pane')) || null;
/* A PANE THAT REPAINTS ITSELF is dimmed rather than blurred — see above. § */
const softDim_ = page => !!(page && (
  [...page.querySelectorAll('iframe')].some(f => !f.closest('.feed-yt:not(.is-live)'))
  || [...page.querySelectorAll('video')].some(v => !v.paused && !v.ended)));
/* AND ONE THE KEYBOARD IS TYPING INTO is left sharp while a finger drags it away. */
function softKeep_(page) {
  if (!page) return true;
  if (SOFT_DRAG && SOFT_DRAG.keep.has(page)) return SOFT_DRAG.keep.get(page);
  const fe = document.activeElement;
  const k = softDim_(page) || !!(fe && fe !== document.body && page.contains(fe)
    && /^(INPUT|TEXTAREA|SELECT)$/.test(fe.tagName));
  if (SOFT_DRAG) SOFT_DRAG.keep.set(page, k);
  return k;
}
function softHold_(glass) {
  if (!glass) return;
  if (!SOFT_EASE.has(glass)) SOFT_EASE.add(glass);
  if (glass.style.willChange !== 'filter') glass.style.willChange = 'filter';
  if (glass.style.transition !== 'none') glass.style.transition = 'none';
}

function softDrag_(which, px, stepX) {
  /* A WIDE WINDOW BLURS ITS NEIGHBOURS TOO NOW (see `placeGrid`), so the finger eases it there as well. */
  if (!SOFT_DRAG) SOFT_DRAG = { ok: softMotion_(), b: null, keep: new Map() };
  if (!SOFT_DRAG.ok) return;
  /* THE NEIGHBOUR AND HOW FAR AWAY IT IS, WORKED OUT ONCE A DIRECTION. § */
  const key = which + (px < 0 ? '+' : '-');
  const seen = DRAG_PLAN ? DRAG_PLAN.near || (DRAG_PLAN.near = new Map()) : new Map();
  let a, b = null, step = 0;
  if (seen.has(key)) {
    ({ a, b, step } = seen.get(key));
  } else {
    const host = $('s-' + AT);
    a = host && host.querySelector(':scope > .page.on');
    if (!a) return;
    if (which === 'x') {
      const next = TABS[TABS.findIndex(t => t.id === AT) + (px < 0 ? 1 : -1)];
      const col = next && $('s-' + next.id);
      b = col ? col.querySelectorAll(':scope > .page')[domIndex_(next.id, PAGE[next.id] || 0)] || null : null;
      step = stepX;
    } else {
      b = px < 0 ? a.nextElementSibling : a.previousElementSibling;
      if (b && !b.classList.contains('page')) b = null;
      if (b) step = Math.abs((b.offsetTop + b.offsetHeight / 2) - (a.offsetTop + a.offsetHeight / 2));
    }
    seen.set(key, { a, b, step });
  }
  if (!a) return;
  /* THE ONE THE FINGER TURNED AWAY FROM goes back to the look its class gives it. */
  if (SOFT_DRAG.b && SOFT_DRAG.b !== b) { const g = glassOf_(SOFT_DRAG.b); if (g) g.style.filter = ''; }
  SOFT_DRAG.b = b;
  const f = b && step > 0 ? Math.min(1, Math.abs(px) / step) : 0;
  if (f < 0.01) return;
  if (!softKeep_(a)) { const g = glassOf_(a); softHold_(g); g.style.filter = `blur(${(SOFT_BLUR * f).toFixed(2)}px)`; }
  if (b && !softKeep_(b)) { const g = glassOf_(b); softHold_(g); g.style.filter = `blur(${(SOFT_BLUR * (1 - f)).toFixed(2)}px)`; }
}

/* THE RELEASE, OR ANY PLACEMENT THAT MOVED THE FOCUS: § */
function softSettle_(timing, instant) {
  /* NOT UNDER A FINGER: a placement asked for by something else mid-drag must not take the blur the
     finger is easing off the two cards it is between. */
  if (typeof SWIPE !== 'undefined' && SWIPE.live && SWIPE.axis) return;
  SOFT_DRAG = null;
  if (!SOFT_EASE.size) return;
  SOFT_EASE.forEach(g => { g.style.transition = 'none'; g.style.filter = ''; });
  clearTimeout(SOFT_DONE);
  const ms = instant ? 0 : (parseFloat(timing.d) || 0) * (/ms$/.test(timing.d) ? 1 : 1000);
  SOFT_DONE = setTimeout(function done() {
    /* A FINGER DOWN AGAIN OWNS THESE NOW — wait for it rather than pull its inline blur away. */
    if (SOFT_DRAG) { SOFT_DONE = setTimeout(done, 120); return; }
    SOFT_EASE.forEach(g => { g.style.willChange = ''; g.style.transition = ''; g.style.filter = ''; });
    SOFT_EASE.clear();
  }, ms + 80);
}

/* ---------- A TAP ON A CARD STILL SLIDING IS NOT A PRESS § */
let SLIDE_UNTIL = 0;

/* The two axes still call in — one placer underneath, so a horizontal move and a vertical one
   cannot disagree about where a cell is. */

/* ---------- A DRAG FRAME MOVES THE CARDS AND DOES NOTHING ELSE § */
let DRAG_PLAN = null;    // { which, at, page, stepX, cols: [{ host, x, y, front }], near } — this drag's sums
function dragPlan_(drag) {
  if (PLACE_FRAME) return null;
  const cols = [];
  for (const t of TABS) {
    const host = $('s-' + t.id);
    if (!host) continue;
    const at = colPlaced_(host);
    if (!at || !host._slide) return null;
    /* A ROW HELD MID-SLIDE (`grabRow_`) is drawn where it was held; the drag is placed from where it was going, as every drag is. */
    cols.push({ host: host, x: host.REST_X != null ? host.REST_X : at[0], y: at[1], front: t.id === AT });
  }
  if (!cols.some(c => c.front)) return null;
  cols.forEach(c => {
    c.host.classList.add('dragging');
    if (drag.which === 'x') colTransition_(c.host, SLIDE_NONE, null);
    else if (c.front) colTransition_(c.host, null, SLIDE_NONE);
  });
  return { which: drag.which, at: AT, page: PAGE[AT] || 0, stepX: drag.which === 'x' ? stepX_() : 0, cols: cols };
}
function dragFast_(drag) {
  if (!DRAG_PLAN) DRAG_PLAN = dragPlan_(drag);
  const p = DRAG_PLAN;
  if (!p || p.which !== drag.which || p.at !== AT || p.page !== (PAGE[AT] || 0)) return false;
  if (!p.cols.every(c => c.host.isConnected)) return false;
  const dx = drag.which === 'x' ? drag.px : 0, dy = drag.which === 'y' ? drag.px : 0;
  p.cols.forEach(c => { if (dx || c.front) colWrite_(c.host, c.x + dx, c.y + (c.front ? dy : 0)); });
  softDrag_(drag.which, drag.px, p.stepX);
  return true;
}

/* ---------- HOW MANY CARDS ABOVE AND BELOW THE ONE IN FRONT THE GLASS SHOWS § */
const glassRows_ = () => (WIDE ? 3 : 2);

/* ---------- WHICH CARDS ARE ON THE GLASS, SAID ONCE PER PLACEMENT § */
let GLASS = { at: null, cols: [], pages: [] };

function glassNow_(hosts, ti, stepX) {
  const out = { at: AT, cols: [], pages: [] };
  const W = appWidth_();
  const card = WIDE ? stepX - CELL_GAP : 0;
  /* `reach`: HOW MANY COLUMNS EITHER SIDE OF THE ONE IN FRONT THIS WINDOW SHOWS — the same sum as `across` below, for any column. § */
  out.reach = 0;
  if (WIDE && stepX > 0) while (out.reach < TABS.length && W / 2 + card / 2 - (out.reach + 1) * stepX > WIDE_EDGE) out.reach++;
  hosts.forEach(h => {
    const dx = h.i - ti;
    /* HOW MUCH OF THIS COLUMN'S CARD IS INSIDE THE WINDOW, ACROSS — all of it for the column in front. */
    const across = dx ? W / 2 + card / 2 - Math.abs(dx) * stepX : Infinity;
    if (dx && !(WIDE && across > WIDE_EDGE)) return;
    out.cols.push(h.id);
    const H = h.host.clientHeight || innerHeight;
    const at = PAGE[h.id] || 0;
    h.host.querySelectorAll(':scope > .page').forEach((el, pos) => {
      if (Math.abs(logIndex_(h.id, pos) - at) > glassRows_()) return;
      if (glassShows_(el, h.shift + el.offsetTop, H, across)) out.pages.push(el);
    });
  });
  return out;
}

/* IS A PAGE'S WIDGET ON THE GLASS — its slot, or the page when it has none, showing more than `WIDE_EDGE` of itself inside a window `H` tall, with the page's top § */
function glassShows_(el, top, H, across) {
  const sl = el.querySelector('.widget-slot');
  const at = sl && glassOffset_(sl, el);
  const y = at ? top + at.top : top;
  const tall = at ? sl.offsetHeight : el.offsetHeight;
  if (!tall) return y > 0 && y < H;
  const down = Math.min(y + tall, H) - Math.max(y, 0);
  const side = Math.min((at ? sl.offsetWidth : el.offsetWidth) || Infinity, across - (at ? at.left : 0));
  return down > WIDE_EDGE && side > WIDE_EDGE;
}

/* WHERE A SLOT SITS INSIDE ITS PAGE, by offsets — the same untransformed layout the page's own `offsetTop` is, so it agrees with where this placement puts the § */
function glassOffset_(sl, page) {
  let top = 0, left = 0, n = sl;
  const base = page.offsetParent;
  while (n && n !== page && n !== base) { top += n.offsetTop; left += n.offsetLeft; n = n.offsetParent; }
  if (!n) return null;
  if (n !== page) { top -= page.offsetTop; left -= page.offsetLeft; }
  for (let p = sl.parentNode; p && p !== page; p = p.parentNode) top -= p.scrollTop || 0;
  return { top, left };
}

function placeGrid(instant, drag) {
  if (FLOW_LAYOUT) return flowPlace_();
  if (drag && dragFast_(drag)) return;
  DRAG_PLAN = null;
  /* Said before anything is measured or moved, so the width the stylesheet draws and the width
     this function spaces by cannot be different on the same frame. Setting a custom property that
     already holds that value costs nothing. */
  publishCardWidth_();
  const tabs = TABS.map(t => t.id);
  const ti = Math.max(0, tabs.indexOf(AT));
  const dxPx = (drag && drag.which === 'x') ? drag.px : 0;
  const dyPx = (drag && drag.which === 'y') ? drag.px : 0;
  const stepX = stepX_();

  /* ---------- THREE PASSES — WRITE, READ, WRITE — AND THAT IS THE WHOLE OF THE SPEED § */
  /* ---------- AN INSTANT PLACEMENT DOES NOT CANCEL A SLIDE THAT IS STILL RUNNING § */
  if (instant && !drag && SETTLE_ON && performance.now() < SETTLE_ON.until) instant = false;
  if (!drag && motionLess_()) { instant = true; SETTLE_FROM = null; SETTLE_ON = null; }
  const hosts = [];
  tabs.forEach((id, i) => {
    const host = $('s-' + id);
    if (!host) return;
    hosts.push({ id: id, i: i, host: host, wasFront: host.classList.contains('is-front') });

    /* A SCREEN IS THE COLUMN, and the column is what moves. § */
    host.classList.remove('hidden');
    host.style.display = 'flex';
    host.style.position = 'absolute';
    host.style.top = '0'; host.style.right = '0'; host.style.bottom = '0'; host.style.left = '0';
    host.style.overflow = 'visible';
    /* `is-front`, NOT `on`. § */
    host.classList.toggle('is-front', id === AT);
    /* A FINGER IS DOWN — read by `holdColumn_`. It used to be `no-anim`, which switched off every
       transition on the column; a drag now zeroes only its own axis (`colTransition_` below). */
    host.classList.toggle('dragging', !!drag);
  });
  /* A CARD HELD BECAUSE YOU WERE USING IT IS LET GO THE MOMENT ANOTHER ONE IS IN FRONT — see
     `HOLD_AT`. Before the shifts are read, so the card arrived at is centred. */
  if (HOLD_AT && (HOLD_AT.id !== AT || (PAGE[AT] || 0) !== HOLD_AT.p)) HOLD_AT = null;
  /* Slid so the page being read sits in the middle — see `columnShift_`. A vertical drag only ever
     moves the screen in front; the others have no finger on them. READ ONLY — see the three passes
     above. */
  hosts.forEach(h => {
    h.shift = columnShift_(h.host, domIndex_(h.id, PAGE[h.id] || 0)) + (h.id === AT ? dyPx : 0);
  });
  /* AND WHICH CARDS THAT LEAVES ON THE GLASS — see `GLASS`. Still in the reading pass. */
  if (!drag) GLASS = glassNow_(hosts, ti, stepX);
  /* THE SETTLE, if this placement is the one a release asked for. § */
  /* WHENEVER IT COMES. A window of 150ms was the first version, and on a slow phone the placement a release asks for can start later than that — it then fell back § */
  const rel = !instant && !drag && SETTLE_FROM ? SETTLE_FROM : null;
  if (rel) {
    SETTLE_FROM = null;
    let D = 0;
    hosts.forEach(({ i, host, shift }) => {
      const was = colPlaced_(host);
      if (!was) return;
      const d = rel.axis === 'x' ? (i - ti) * stepX - was[0] : shift - was[1];
      if (Math.abs(d) > Math.abs(D)) D = d;
    });
    const c = settleCurve_(D, rel.v);
    /* SIXTEEN MILLISECONDS IN ALREADY — see the delay below. */
    SETTLE_ON = { axis: rel.axis, dur: c.dur, tf: c.tf, until: performance.now() + c.dur - 16 };
  }
  const settle = !instant && !drag && SETTLE_ON && performance.now() < SETTLE_ON.until ? SETTLE_ON : null;
  /* ON THE COLUMN, NOT THE ROOT — see `settleCurve_`. § */
  const runs = ax => (settle && settle.axis === ax
    ? { d: settle.dur + 'ms', tf: settle.tf, delay: '-16ms' } : SLIDE_TAP);
  const front = hosts.find(h => h.id === AT);
  const before = front && !instant && !drag ? colPlaced_(front.host) : null;
  /* ON A WIDE WINDOW, how far from the middle a column can be and still have a card on the glass:
     half the window and half a card, and one step more, so a column a drag is about to bring in is
     already drawn. */
  const glass = WIDE ? appWidth_() / 2 + stepX * 1.5 : 0;
  /* ---------- AND WHAT A SLIDE CARRIES ACROSS THE GLASS STAYS DRAWN WHILE IT IS CARRIED § */
  const now = performance.now();
  if (!drag) TRAIL_X = trailX_(ti, now, !!instant, settle);
  const xRun = now < TRAIL_X.until || !drag;
  const xlo = xRun ? Math.min(TRAIL_X.lo, ti) : ti, xhi = xRun ? Math.max(TRAIL_X.hi, ti) : ti;
  let wider = xlo < xhi;
  hosts.forEach(h => {
    const dx = h.i - ti;
    const at = PAGE[h.id] || 0;
    const acrossT = h.i < xlo ? xlo - h.i : h.i > xhi ? h.i - xhi : 0;
    const glassH = h.host.clientHeight || innerHeight;
    const dur = settle ? settle.dur : 300;
    const band = trailY_(h.host, h.shift, glassH, now, !!drag, !!instant, dur);
    if (band.top < -h.shift - 1 || band.bot > -h.shift + glassH + 1) wider = true;
    const c = { at: at, across: Math.abs(dx), acrossT: acrossT,
      onGlass: WIDE && acrossT * stepX < glass,
      drag: !!drag, lo: band.top - glassH, hi: band.bot + glassH };
    c.skip = !drag && h.id !== AT && GLASS.cols.indexOf(h.id) === -1;
    h.c = c;
    h.pg = pagesRead_(h.host, h.id, c);
  });
  /* PUT BACK TO THE GLASS ONCE THE SLIDE HAS ENDED — see `trailEnd_`. */
  if (wider && !drag && typeof afterSlide_ === 'function') afterSlide_(trailEnd_, 'trail');
  hosts.forEach(({ id, i, host, shift, c, pg, wasFront }) => {
    const dx = i - ti;
    const at = c.at;
    const x = dx * stepX + dxPx;
    /* A COLUMN ARRIVING ON THE PAGE IT WAS PLACED FOR, WHOSE CARD CHANGED HEIGHT SINCE, TAKES ITS NEW HEIGHT NOW: the slide carries it across, never down (382). */
    if (!instant && !drag && !wasFront && host.PLACED_P === at) {
      const was = colPlaced_(host);
      if (was && Math.abs(shift - was[1]) > 0.5) colShiftNow_(host, shift - was[1]);
    }

    /* EACH AXIS ITS OWN CLOCK — see `colWrite_`. The finger's axis follows the finger; the other
       keeps whatever slide it is in the middle of. */
    colTransition_(host,
      instant || (drag && drag.which === 'x') ? SLIDE_NONE : runs('x'),
      instant || (drag && drag.which === 'y' && id === AT) ? SLIDE_NONE : runs('y'),
      instant ? SLIDE_NONE : { d: '.22s', tf: 'ease', delay: '0s' });
    colWrite_(host, x, shift);
    host.REST_X = null;
    /* WHICH PAGE THIS SHIFT WAS WORKED OUT FOR — read by `holdColumn_`, which corrects a column only
       for the page it was sent to. */
    host.PLACED_P = at;
    /* Only the screen in front takes presses. A sliver of the next tab showing at the edge is
       something to look at, not something to tap. */
    /* STILL TRUE ON A WIDE WINDOW, where the columns beside are whole and readable: § */
    host.style.pointerEvents = dx === 0 ? 'auto' : 'none';
    const across = Math.abs(dx);
    /* ---------- THE NEIGHBOUR IS BARELY DIMMED, AND HERE IS WHY § */
    /* ---------- AND THE ROW KEEPS DRAWN THE COLUMNS A SLIDE CROSSES § */
    const onGlass = c.onGlass;
    const lit = WIDE && c.acrossT * stepX < glass + stepX;
    const op = across === 0 ? '1' : WIDE ? (lit ? '1' : '0')
      : c.acrossT <= 3 ? '.92' : '0';
    /* ---------- AND A COLUMN COMING BACK FROM NOUGHT IS DRAWN AT ONCE, NOT FADED IN § */
    const was = +host.style.opacity || 0;
    if (!instant && was <= 0.05 && +op > 0.05) colTransition_(host, null, null, { d: '0s', tf: 'linear', delay: '0s' });
    host.style.opacity = op;
    /* AND SIDEWAYS, THE SAME. § */
    host.style.visibility = c.acrossT > 4 && !lit ? 'hidden' : 'visible';

    /* AND EACH PAGE — `placePages_`, below, which a builder placing one column alone (`placeOne_`) shares. § */
    placePages_({ id: id, host: host }, c, pg);
  });

  if (drag) {
    /* THE SUMS THIS FRAME DID, KEPT FOR THE REST OF THE DRAG — see `dragFast_`. The finger's own
       offset taken back out, so the plan is where each column RESTS. */
    DRAG_PLAN = { which: drag.which, at: AT, page: PAGE[AT] || 0, stepX: stepX,
      cols: hosts.map(h => ({ host: h.host, x: (h.i - ti) * stepX, y: h.shift - (h.id === AT ? dyPx : 0), front: h.id === AT })) };
    softDrag_(drag.which, drag.px, stepX);
    return;
  }
  softSettle_(settle ? runs(settle.axis) : SLIDE_TAP, instant);

  /* A SLIDE THE EYE CAN FOLLOW — the column in front going somewhere new — is a window in which a tap
     is not a press. See `SLIDE_UNTIL`. */
  if (before && front) {
    const now = colPlaced_(front.host);
    if (now && (Math.abs(now[0] - before[0]) > 2 || Math.abs(now[1] - before[1]) > 2)) {
      SLIDE_UNTIL = performance.now() + (settle ? settle.dur : 300);
    }
  }

  /* ---------- A FIELD ON A CARD THAT HAS LEFT IS LET GO OF § */
  try {
    const fe = document.activeElement;
    const pg = fe && fe !== document.body && fe.closest ? fe.closest('#screen .page') : null;
    if (pg && !pg.classList.contains('on') && typeof fe.blur === 'function') fe.blur();
  } catch (e) { /* a field that keeps its focus is the behaviour before this existed */ }
}
