
/* ---------- EACH PAGE OF ONE COLUMN, AND ONLY WHAT CHANGED § */
/* ---------- THE TRAIL, DOWN ONE COLUMN § */
/* ---------- A SLIDE ENDS `dur` AFTER THE FRAME IT STARTS IN, NOT AFTER THE WRITE THAT ASKED FOR IT § */
/* ---------- AND A SLIDE STILL RUNNING IS STILL A SLIDE, WHATEVER THE CLOCK SAYS § */
/* AND ACROSS THE ROW: the column indices the row has swept while its sideways slide still runs, the index
   it is leaving and the one it is going to. `at` is the index this placement was for. */
/* ONE PAGE'S WRITES, EACH ONLY IF IT DIFFERS FROM WHAT THIS ELEMENT WAS LAST GIVEN. § */
function pageWrite_(el, st) {
  const was = el.PG;
  if (!was) { el.style.position = 'static'; el.style.transform = 'none'; }
  if (!was || was.on !== st.on) {
    el.classList.toggle('on', st.on);
    el.style.pointerEvents = 'auto';
    /* AND THE KEYBOARD WITH IT (561, U15): a page a finger cannot reach is out of the Tab order too. */
    el.inert = false;
  }
  if (!was || was.op !== st.op) el.style.opacity = st.op;
  if (!was || was.vis !== st.vis) el.style.visibility = st.vis;
  el.PG = st;
}

/* ---------- THE ONE SCROLLING PAGE (900) ---------- */
/* Find is always shown; another section only while it is the one asked for (the sign-in card, above Find). */
const flowHome_ = () => (TABS.some(t => t.id === FIND_HOME_) ? FIND_HOME_ : AT);
/* No transform and no glass: each section's inline placement cleared, every page in flow and touchable; `.on` is the page being read. */
function flowPlace_() {
  topbarPaint_();
  const home = flowHome_();
  TABS.forEach(t => {
    const host = $('s-' + t.id);
    if (!host) return;
    if (host.style.cssText) host.style.cssText = '';
    host.classList.toggle('hidden', t.id !== AT && t.id !== home);
    host.classList.toggle('is-front', t.id === AT);
    host.PLACED_P = PAGE[t.id] || 0;
    host.querySelectorAll(':scope > .page').forEach((el, pos) => pageWrite_(el,
      { on: logIndex_(t.id, pos) === (PAGE[t.id] || 0), op: '1', vis: 'visible' }));
  });
  /* PLACED, AS THE GLASS SAYS IT (one column, its page being read): else `GLASS.at !== AT` holds the builder and the widgets' wake for ever. */
  const front = $('s-' + AT);
  GLASS = { at: AT, cols: [AT], pages: front ? [...front.querySelectorAll(':scope > .page.on')] : [], reach: 0 };
}
/* THE PAGE BEING READ is the first whose foot is past a quarter of the window; turning to it is `goPage`, so Find's window and fills follow the scroll. */
let FLOW_FRAME = 0, FLOW_TURNING = false;
function flowScrolled_() {
  FLOW_FRAME = 0;
  const id = flowHome_(), host = $('s-' + id);
  if (!host || host.classList.contains('hidden') || !PAGER[id]) return;
  const pages = host.querySelectorAll(':scope > .page'), line = innerHeight / 4;
  let at = -1;
  for (let pos = 0; pos < pages.length && at < 0; pos++) {
    const r = pages[pos].getBoundingClientRect();
    if (r.height && r.bottom > line) at = pos;
  }
  if (at < 0) return;
  FLOW_TURNING = true;
  try { if (logIndex_(id, at) !== (PAGE[id] || 0)) goPage(id, logIndex_(id, at)); } finally { FLOW_TURNING = false; }
  /* NEAR THE FOOT OF WHAT IS DRAWN, the next few results are drawn (`flowMore_`, find.js). */
  if (typeof flowMore_ === 'function' && document.documentElement.scrollHeight - window.scrollY - innerHeight < innerHeight) flowMore_(id);
}
addEventListener('scroll', () => { if (!FLOW_FRAME) FLOW_FRAME = requestAnimationFrame(flowScrolled_); }, { passive: true });
/* A PAGE TURNED TO BY A TAP (a question opened, its answer shown) is scrolled to, once the turn's fills have run. */
function flowShow_(id, n) {
  if (FLOW_TURNING) return;
  afterSlide_(() => {
    const host = $('s-' + id), el = host && host.querySelectorAll(':scope > .page')[domIndex_(id, n)];
    if (el && (PAGE[id] || 0) === n) el.scrollIntoView({ block: 'start' });
  }, 'flow-show');
}

/* THE TOP BAR (900): the one logo (N-20261116-logo), its words the brand's; who is signed in is Find's first chip (owner, 13 Nov). */
function topbarPaint_() {
  const mark = document.querySelector('#topbar > .logo'), name = brand('name', '@family.');
  if (mark && mark.textContent !== name) mark.textContent = name;
}

/* ---------- ONE COLUMN PLACED ON ITS OWN, WITH NOTHING MOVING § */
/* ONE PLACEMENT PER FRAME, AND ANIMATION WINS § */
let PLACE_WANT = null;      // { which, instant, id } — what has been asked for this turn
let PLACED_ONCE = false;    // the very first placement runs now, not next frame
let PLACE_FRAME = 0;

function placeCells(which, instant, dragPx, id) {
  /* A DRAG IS NOT A REQUEST. It is already once-per-frame — `pointermove` books its own frame —
     and it must land now rather than next frame. Straight through. */
  if (dragPx) return placeNow_(which, instant, dragPx, id);
  /* A QUESTION BEING READ ALOUD STOPS WHEN ITS PAGE OR COLUMN IS LEFT (394). */
  if (typeof readAloudStray_ === 'function') readAloudStray_();
  /* AND A QUESTION'S PADLOCK IS LET GO WHEN A TAB OR LINK LEAVES ITS PAGE (457). */
  if (typeof qLockStray_ === 'function') qLockStray_();
  if (typeof magStray_ === 'function') magStray_();
  if (typeof gameLockStray_ === 'function') gameLockStray_();

  /* THE FIRST ONE IS NOT DEFERRED. § */
  if (!PLACED_ONCE) { PLACED_ONCE = true; return placeNow_(which, instant, 0, id); }

  if (!PLACE_WANT) {
    PLACE_WANT = { which, instant: !!instant, id };
  } else {
    /* ANIMATION WINS. One asker wanting a slide and another wanting it instant is the exact
       collision above, and the slide is the one that must survive. */
    PLACE_WANT.instant = PLACE_WANT.instant && !!instant;
    if (which) PLACE_WANT.which = which;
    if (id !== undefined) PLACE_WANT.id = id;
  }

  if (PLACE_FRAME) return;
  PLACE_FRAME = requestAnimationFrame(() => {
    PLACE_FRAME = 0;
    const w = PLACE_WANT;
    PLACE_WANT = null;
    if (w) placeNow_(w.which, w.instant, 0, w.id);
  });
}

/* THE PLACEMENT ITSELF. Everything that used to be `placeCells` — nothing about it changed except
   that it is no longer what the rest of the app calls. */
function placeNow_(which, instant, dragPx, id) {
  placeGrid(instant, dragPx ? { which, px: dragPx } : null);

  /* `bookDropMove_` WAS CALLED HERE, before the drag guard below, for the one thing this app ever placed against the viewport rather than the grid: § */

  /* THE TWO SWEEPS BELOW DO NOT RUN WHILE A FINGER IS DOWN. § */
  if (dragPx) return;

  /* ---------- AND WHAT RUNS IN THE CARDS THIS LEFT ON THE GLASS § */
  if (typeof widgetsGlass_ === 'function') widgetsGlass_();

  /* ---------- AND WHICH CARDS ARE TOO TALL FOR THE PANE THEY ARE IN § */
  if (typeof paneWatch_ === 'function') paneWatch_($('s-' + AT));
  /* THE NEXT PICTURES OF THE COLUMN IN FRONT, asked for six pages ahead — see `picsAhead_` in posts.js. § */
  if (typeof window.picsAhead_ === 'function') window.picsAhead_(AT);

  /* ANY SCREEN NO TAB POINTS AT. index.html lists eight sections and the tab table decides which of
     them exist, so removing a tab leaves a section behind that nothing places. */
  const mine = TABS.map(t => $('s-' + t.id));
  document.querySelectorAll('#screen > .screen').forEach(el => {
    if (mine.indexOf(el) === -1) {
      el.style.display = 'none';
      el.classList.add('hidden');
    }
  });
}

/* ---------- WIDGETS AS PAGES § */
const PAGER = {
  /* POSTS ARE HOWEVER MANY THERE ARE, so this is a function rather than a list. § */
  /* EVERY SCREEN IS PAGED. § */
  /* ---------- THESE KEYS ARE SCREEN IDS, AND TWO OF THEM NAMED SCREENS THAT DO NOT EXIST § */
  /* ---------- THE PAGER COUNTED A LIST THE SCREEN DOES NOT DRAW § */

  /* Empty names, one per post. § */
  /* One name per page, and the ＋ card is a page — so it is counted here too, or the pager stops one short and the last post can never be reached. § */
  /* The ＋ card is a page and everybody signed in has one, so everybody's count includes it. § */
  /* ---------- THE FEED IS FOUR KINDS OF PAGE NOW, NOT TWO § */
  /* GUARDED, because shell.js is file five and collections.js is file twenty-one. § */
  /* THE SAME LIST THE COLUMN IS BUILT FROM, which is the rule every other entry here follows: § */
  stuff:  () => (typeof finderPageCount_ === 'function' ? finderPageCount_('stuff') : 1),
};

/** The page names for a screen, whether they are a list or worked out each time. */
function pagerNames(id) {
  const v = PAGER[id];
  return typeof v === 'function' ? v() : (v || []);
}

/* Which page each paged screen is showing. § */
/* ---------- WHERE EACH COLUMN OPENS § */
/* A FUNCTION, NOT A NUMBER, and the Posts column is why. § */
const PAGE_HOME = {
};
/* ---------- THE TAB AND HOME-SCREEN ICON ARE THE REPO'S FILES (owner's logo, 6 Nov): a sheet `logo_square` still drives posts and avatars, never these. */
function applyBrandIcon_() {
  /* `?v=` BECAUSE CHROME KEEPS A TAB ICON BY ITS URL: bump it when the logo changes. */
  [['favicon', 'favicon.png?v=1106'], ['favicon-ios', 'icon.png?v=1106']].forEach(([id, file]) => {
    const el = document.getElementById(id);
    if (el && el.getAttribute('href') !== file) el.setAttribute('href', file);
  });
}

/* KEYED BY SCREEN ID, like `PAGER` and `PAGE_HOME` — and `posts` and `me` are not screen ids. See
   the long note on `PAGER`. Every screen that pages needs an entry here or its position is not
   remembered between visits. */
/* `booking` WAS MISSING, and this table's own sentence above is the rule they broke: § */
const PAGE = { feed: 0, stuff: 0, reel: 0, make: 0,
               saved: 0, tutors: 0, students: 0, parents: 0, spotlight: 0, shop: 0, res: 0 };

/* A COLUMN MAY HOLD FEWER PAGE ELEMENTS THAN IT HAS PAGES. § */
const PAGE_KEEP = {};
const PAGE_LO = {};
/* WHICH ELEMENT IS PAGE `i` — AND -1 FOR A PAGE THAT HAS SCROLLED OFF THE FRONT OF THE WINDOW. § */
const domIndex_ = (id, i) => {
  const keep = PAGE_KEEP[id] || 0;
  if (i < keep) return i;
  const d = i - (PAGE_LO[id] || 0);
  return d < keep ? -1 : d;
};
/* AND WHICH PAGE ELEMENT `p` IS. */
const logIndex_ = (id, p) => (p < (PAGE_KEEP[id] || 0) ? p : p + (PAGE_LO[id] || 0));

/* WHETHER A COLUMN HAS BEEN OPENED YET. The home position applies once — after that `PAGE` is where
   somebody left it, and putting them back at the top every time is a pager they have to
   re-navigate on every glance at another tab. */
const PAGE_OPENED = {};
function pageHome_(id) {
  if (PAGE_OPENED[id]) return;
  const home = PAGE_HOME[id];
  if (!home) { PAGE_OPENED[id] = true; return; }

  /* ---------- NOT UNTIL THE COLUMN IS THE SHAPE IT WILL BE § */
  if (pageCount(id) < 2) return;
  if (!LOADED) return;

  PAGE_OPENED[id] = true;
  const n = home();
  PAGE[id] = Math.max(0, Math.min(n, Math.max(0, pageCount(id) - 1)));
}

/* A NUMBER OR A LIST. The names were read by the header and there is no header, so `pagerNames` is only ever asked for its LENGTH -- and `PAGER.stuff` was § */
/* ---------- AND COUNTED ONCE A HANDLER, NOT FIVE TIMES A FLICK § */
let COUNT_HOLD = null;
/* ---------- AND NOT BUILT AT ALL WHILE THE COLUMN IS THE ONE IT WAS § */
const COUNT_MEMO = new Map();
const pageCount = id => {
  if (COUNT_HOLD && COUNT_HOLD.has(id)) return COUNT_HOLD.get(id);
  const host = typeof finderOf_ === 'function' && finderOf_(id) ? null : document.getElementById('s-' + id);
  const k = host && host.firstElementChild;
  const m = k ? COUNT_MEMO.get(id) : null;
  let n;
  if (m && m.k === k && m.len === host.childElementCount) n = m.n;
  else {
    const v = pagerNames(id);
    n = typeof v === 'number' ? Math.max(0, v | 0) : v.length;
    if (k) COUNT_MEMO.set(id, { k: k, len: host.childElementCount, n: n });
  }
  if (COUNT_HOLD) COUNT_HOLD.set(id, n);
  return n;
};

/* THE DIAL. Every widget sits on the same spindle and only the one at the front is full size. § */
/* ---------- WORK THAT MUST NOT HAPPEN DURING A SLIDE § */
/* ---------- ONE TIMER HELD ONE JOB, AND THERE HAVE ALWAYS BEEN THREE § */
let AFTER_SLIDE = null;
const AFTER_SLIDE_JOBS = new Map();
let AFTER_SLIDE_HELD = 0;   // when the booked jobs first found a finger down, for the cap below

function afterSlide_(fn, key) {
  AFTER_SLIDE_JOBS.set(key || fn, fn);
  if (AFTER_SLIDE) clearTimeout(AFTER_SLIDE);
  AFTER_SLIDE = setTimeout(function run() {
    /* NOT INSIDE A SETTLE, AND NOT UNDER A FINGER. § */
    /* ---------- A FINGER DOWN AT ALL, NOT ONLY ONE THAT HAS CHOSEN ITS AXIS § */
    const now = performance.now();
    AFTER_SLIDE_HELD = 0;
    const wait = 0;
    if (wait) { AFTER_SLIDE = setTimeout(run, wait); return; }
    AFTER_SLIDE_HELD = 0;
    const jobs = [...AFTER_SLIDE_JOBS.values()];
    AFTER_SLIDE_JOBS.clear();
    /* ---------- AND STILL "BOOKED" UNTIL THE LAST OF THEM HAS RUN (`AFTER_SLIDE` is this run's mark) § */
    const mark = {};
    AFTER_SLIDE = mark;
    /* ONE JOB THAT THROWS MUST NOT TAKE THE REST WITH IT. § */
    const next = () => {
      const f = jobs.shift();
      if (f) oopsTry_('afterSlide', f);
      if (jobs.length) { setTimeout(next, 0); return; }
      if (AFTER_SLIDE === mark) AFTER_SLIDE = null;
      /* AND THEN THE BUILDER, which waits for exactly this list to be empty — see `ahead_` below. */
      if (typeof aheadKick_ === 'function') aheadKick_();
    };
    next();
  }, 0);
}

/* AHEAD: WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE § */
const AHEAD = { open: false, pre: false, opened: 0, input: 0, booked: 0, timer: 0, dir: { x: 0, y: {} }, stuck: new Set(), running: false };
const AHEAD_SLOW = new Set();
const AHEAD_QUIET = 400, AHEAD_QUIET_SLOW = 1000, AHEAD_SLOW_MS = 150;
/* ---------- THE SLOW BIT IS KEPT ON THE DEVICE, AND A COLUMN'S FIRST DRAW IS SLOW UNTIL IT HAS BEEN TIMED § */
const AHEAD_SLOW_KEY = 'familyAheadSlow';
try { (JSON.parse(keep_.get(AHEAD_SLOW_KEY) || '[]') || []).forEach(k => { if (typeof k === 'string') AHEAD_SLOW.add(k); }); } catch (e) { /* a bad stored list reads as none */ }
function aheadSlowKeep_() {
  keep_.put(AHEAD_SLOW_KEY, JSON.stringify([...AHEAD_SLOW].filter(k => /^(paint|widget):/.test(k))));
}
/* THE LAST TWO HUNDRED SLICES, for the harness and the journeys: what ran, for how long, and whether any
   gate was open that should not have been. */
window.__aheadLog = [];
/* ONE PASSIVE LISTENER FOR THE QUIET — the time of the last thing a hand did. A pointer lifting is a stroke
   or a swipe ending, which is a reason to look again once the quiet has come. */
['pointerdown', 'pointermove', 'wheel', 'keydown'].forEach(t =>
  addEventListener(t, () => { AHEAD.input = performance.now(); }, { capture: true, passive: true }));
addEventListener('pointerup', () => { AHEAD.input = performance.now(); aheadKick_(AHEAD_QUIET); }, { capture: true, passive: true });
document.addEventListener('focusout', () => { AHEAD.stuck.clear(); aheadKick_(AHEAD_QUIET); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) aheadKick_(); });

/* OPENED TWO FRAMES AFTER THE FIRST GOOD PAYLOAD'S LANDING TASK — the screen in front has been drawn and
   shown before anything is built behind it. */
function aheadOpen_() {
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f => setTimeout(f, 16));
  raf(() => raf(() => { AHEAD.open = true; AHEAD.opened = performance.now(); AHEAD.input = Math.max(AHEAD.input, AHEAD.opened); aheadKick_(); }));
}

/* AND BEFORE THE PAYLOAD, WHICH TAKES 15–45s FROM THE REAL BACKEND: § */
function aheadPreOpen_() {
  try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) { /* the browser may refuse this; nothing depends on it */ }
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f => setTimeout(f, 16));
  raf(() => raf(() => { if (AHEAD.open) return; AHEAD.pre = true; AHEAD.input = Math.max(AHEAD.input, performance.now()); aheadKick_(); }));
}

/* -1: SHUT UNTIL SOMETHING KICKS IT (not open, hidden, held, somebody writing). >0: shut for about that
   long — looked at again then. 0: open, apart from the quiet, which the caller weighs per job. */
function aheadGate_() {
  if (!(AHEAD.open || AHEAD.pre) || document.hidden || window.__aheadHold) return -1;
  const now = performance.now();
  if (GLASS.at !== AT || PLACE_FRAME) return 50;
  if (AFTER_SLIDE || AFTER_SLIDE_JOBS.size || (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length)) return 150;
  /* SOMEBODY WRITING: a box focused anywhere — Find's answer box too, whatever `typingBox_` leaves out for
     its own reasons — or the pen's ink in a stroke. Kicked again by `focusout` and by the pointer lifting. */
  const a = document.activeElement;
  if (a && a.matches && a.matches(TYPING_)) return -1;
  if (typeof PAD_GO !== 'undefined' && PAD_GO) return -1;
  /* AN INPUT ALREADY WAITING FOR THE PAGE — `inputWaiting_`, below. */
  if (inputWaiting_()) return 50;
  return 0;
}
/* ---------- AND NOT WHILE AN INPUT IS ALREADY WAITING FOR THE PAGE § */
function inputWaiting_() {
  try { return !!(navigator.scheduling && navigator.scheduling.isInputPending && navigator.scheduling.isInputPending({ includeContinuous: true })); }
  catch (e) { return false; }
}

/* LOOK AGAIN IN `ms` — once; a look already booked is the one that happens. */
function aheadKick_(ms) {
  if (AHEAD.timer || AHEAD.booked) return;
  AHEAD.timer = setTimeout(aheadCheck_, ms == null ? 30 : Math.max(16, ms));
}
function aheadCheck_() {
  AHEAD.timer = 0;
  if (AHEAD.booked) return;
  const g = aheadGate_();
  if (g < 0) return;
  if (g > 0) { AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, Math.max(16, g))); return; }
  const quiet = performance.now() - AHEAD.input;
  if (quiet < AHEAD_QUIET) { AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, AHEAD_QUIET - quiet + 5)); return; }
  const pick = aheadPick_(quiet >= AHEAD_QUIET_SLOW);
  if (!pick.job) {
    if (pick.slow) AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, AHEAD_QUIET_SLOW - quiet + 5));
    return;
  }
  AHEAD.booked = 1;
  if (typeof requestIdleCallback === 'function') requestIdleCallback(aheadSlice_);
  else setTimeout(aheadSlice_, 60);
}
function aheadSlice_() {
  AHEAD.booked = 0;
  const g = aheadGate_();
  const quiet = performance.now() - AHEAD.input;
  if (g !== 0 || quiet < AHEAD_QUIET) { aheadKick_(g > 0 ? g : AHEAD_QUIET - quiet); return; }
  const job = aheadPick_(quiet >= AHEAD_QUIET_SLOW).job;
  if (!job) { aheadKick_(AHEAD_QUIET_SLOW - quiet); return; }
  const t0 = performance.now();
  /* THE JOB'S KEY WHILE IT RUNS — truthy, so `AHEAD.running` still says "a slice is running"; and what a draw
     or a check asks to know which job it is inside (the dm draw asks nobody when drawn ahead, posts.js). */
  AHEAD.running = job.key || true;
  let left = false;
  try { left = job.run() === false; }
  catch (e) { left = true; try { console.warn('[ahead]', job.key, e); } catch (x) { oops_(x, 'shell:aheadSlice_') } }
  finally { AHEAD.running = false; }
  const ms = performance.now() - t0;
  const was = AHEAD_SLOW.has(job.key);
  if (ms > AHEAD_SLOW_MS) AHEAD_SLOW.add(job.key); else AHEAD_SLOW.delete(job.key);
  if (was !== AHEAD_SLOW.has(job.key) && /^(paint|widget):/.test(job.key)) aheadSlowKeep_();
  /* A JOB WHOSE REASON IS STILL STANDING AFTER IT RAN is not picked again until something kicks — a paint
     refused under typing, a widget whose start threw. Without this it would be picked every slice. */
  if (left || aheadStill_(job)) AHEAD.stuck.add(job.key);
  const log = window.__aheadLog;
  log.push({ key: job.key, ms: Math.round(ms * 10) / 10, t: Math.round(t0), quiet: Math.round(quiet),
    after: !!(AFTER_SLIDE || AFTER_SLIDE_JOBS.size) });
  if (log.length > 200) log.splice(0, log.length - 200);
  aheadKick_(0);
}
/* WHETHER A JOB THAT JUST RAN IS STILL WANTED — asked of the picker, which is the one place a job is made. */
function aheadStill_(job) {
  try { return aheadJobs_(true).some(j => j.key === job.key); } catch (e) { return false; }
}

/* ---------- THE JOBS, AS THEY STAND NOW § */
const AHEAD_KINDS = [];
const AHEAD_RANK = ['paint', 'fill', 'widget', 'pics', 'reels', 'centre', 'bible'];
function aheadJobs_(all) {
  const out = [];
  AHEAD_KINDS.forEach(k => { try { (k() || []).forEach(j => { if (AHEAD.open || j.pre) out.push(j); }); } catch (e) { /* a look-ahead kind that fails adds nothing */ } });
  return all ? out : out.filter(j => !AHEAD.stuck.has(j.key));
}
/* HOW FAR, IN MOVES, AND HALF A MOVE NEARER IN THE DIRECTION OF TRAVEL. */
function aheadDist_(id, page) {
  const ti = TABS.findIndex(t => t.id === AT), ci = TABS.findIndex(t => t.id === id);
  if (ci < 0 || ti < 0) return Infinity;
  const dc = ci - ti;
  let d = Math.abs(dc);
  if (dc && AHEAD.dir.x && Math.sign(dc) === AHEAD.dir.x) d -= 0.5;
  if (page != null) {
    const dp = page - (PAGE[id] || 0);
    d += Math.abs(dp);
    const dy = AHEAD.dir.y[id] || 0;
    if (dp && dy && Math.sign(dp) === dy) d -= 0.5;
  }
  return d;
}
function aheadPick_(slowOk) {
  let best = null, slow = false;
  aheadJobs_(false).forEach(j => {
    if ((AHEAD_SLOW.has(j.key) || j.cold) && !slowOk) { slow = true; return; }
    if (!best || j.d < best.d - 1e-9
        || (Math.abs(j.d - best.d) < 1e-9 && AHEAD_RANK.indexOf(j.kind) < AHEAD_RANK.indexOf(best.kind))) best = j;
  });
  return { job: best, slow: slow };
}

/* ---------- PAINT: A COLUMN MARKED `STALE`, DRAWN AGAIN BEFORE ANYBODY ARRIVES § */
AHEAD_KINDS.push(() => TABS.filter(t => t.id !== AT && STALE[t.id] && $('s-' + t.id)).map(t => ({
  key: 'paint:' + t.id, kind: 'paint', d: aheadDist_(t.id, null),
  /* NEVER TIMED ON A PAYLOAD YET — slow until it has been (see `AHEAD_SLOW_KEY`'s note). */
  cold: PRE_PAYLOAD.has(t.id),
  run: () => aheadPaint_(t.id),
})));
function aheadPaint_(id) {
  const host = $('s-' + id);
  if (!host || id === AT) return;
  paint(id, false, { ahead: true });
  if (STALE[id]) return false;
  PRE_PAYLOAD.delete(id);
  if (PAGER[id] && host.querySelector(':scope > .page')) {
    pageHome_(id);
    PAGE[id] = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
  }
  /* A FINDER ON THE GLASS (beside the one in front, on a wide window) is filled as far as the glass shows, in this slice and before it is placed — its draw no § */
  const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
  if (F && typeof stuffOnGlass_ === 'function' && stuffOnGlass_(id)) {
    try { finderSoon_(F, () => { if ($(id + '-controls')) stuffBandFill_(); }); } catch (e) { /* a finder gone mid-draw keeps its old band */ }
  }
  if (typeof paneWatch_ === 'function') paneWatch_(host);
  drawnScreen_(id);
}
/* THE HALF OF `startScreen_` THAT RUNS NOTHING — a screen's own `drawn` hook. */
function drawnScreen_(id) {
  const H = SCREEN_HOOKS[id] || {};
  if (H.drawn) H.drawn();
}

function paintPager(id, instant) {
  if (!PAGER[id]) return;
  const host = $('s-' + id);
  if (!host || !host.querySelector(':scope > .page')) return;
  /* THE HOME POSITION, on first sight of this column only. § */
  pageHome_(id);
  const n = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
  PAGE[id] = n;

  /* THE SAME PLACER THE TABS USE. There were two of these — one setting `--o` on a page and one
     that did not exist at all for screens — which is precisely why the two axes drifted apart. */
  placeCells('y', instant, 0, id);

  /* The page's name used to be written into the header here. There is no header, so it is not.
     `pagerNames` is still what decides how many pages a screen has, which was always the
     load-bearing half of it. */
}

function goPage(id, to, instant) {
  if (!PAGER[id]) return;
  /* A FINDER IS TURNED IN ITS OWN BINDING — Find, or the second finder (find.js, `inFinder_`) — so its window, its fills and its kept place below are its own and § */
  const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
  return finderSoon_(F, () => goPageHere_(id, to, instant, F));
}
function goPageHere_(id, to, instant, F) {
  const n = Math.max(0, Math.min(pageCount(id) - 1, to));
  const was = PAGE[id] || 0;
  if (n === was && !instant) return;
  PAGE[id] = n;
  /* AND WHICH WAY THIS COLUMN WAS LAST TURNED — the builder fills and fetches on that side first. */
  if (n !== was) AHEAD.dir.y[id] = n > was ? 1 : -1;
  aheadKick_(AHEAD_QUIET);
  /* MOVE FIRST, FILL AFTER — as long as the page being turned to is already there. § */
  /* Page 0 is the question, which is drawn with the screen and never filled lazily — so it has no
     `filled` mark and must not be mistaken for an empty one. */
  /* ---------- THE WINDOW FIRST, BECAUSE EVERYTHING BELOW MEASURES ELEMENTS § */
  if (F && typeof stuffWindow_ === 'function') { try { stuffWindow_(); } catch (e) { oops_(e, 'shell:goPage') } }
  const bare = !!F && n > 0 && (() => {
    const host = $('s-' + id);
    const el = host && host.querySelectorAll(':scope > .page')[domIndex_(id, n)];
    return !el || el.dataset.filled !== '1';
  })();
  /* ---------- AND THE FAR EDGE OF THE GLASS, ONE CARD PER TURN § */
  /* ---------- AND NOW AS FAR AS THE BAND WILL SHOW, IN ITS OWN UNITS (docs/history/341) § */
  const edge = !!F && n !== was && Math.abs(n - was) <= glassRows_() && typeof stuffEdgeFill_ === 'function';
  /* ---------- AND A CARD DRAWN ABOVE THE ONE IN FRONT DOES NOT MOVE IT § */
  const above = !!F && (bare || (edge && n < was));
  const ref = above && $('s-' + id) ? $('s-' + id).querySelectorAll(':scope > .page')[domIndex_(id, n)] : null;
  const top0 = ref ? (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop) : 0;
  if (bare) fillStuffPages();
  /* AND THE WORDS AHEAD, ON EVERY TURN — not after the slide, which a quick reader never lets end (453). */
  else if (F && typeof libAhead_ === 'function') { try { libAhead_(); } catch (e) { oops_(e, 'shell:goPage') } }
  if (edge) { try { stuffEdgeFill_(n, n > was ? 1 : -1); } catch (e) { oops_(e, 'shell:goPage') } }
  if (ref && typeof stuffKeepPlace_ === 'function') stuffKeepPlace_($('s-' + id), top0 - (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop));
  /* A WIDGET STILL WAITING ITS TURN to start is started now if this is its page — see `widgetsNear_` in arcade.js. § */
  if (typeof widgetsNear_ === 'function') widgetsNear_(id);
  /* AND THE REELS KEPT SIX AHEAD, one slide appended now if fewer are left — markup only (`reelAhead_`). */
  const H = SCREEN_HOOKS[id] || {};
  if (H.paged) H.paged(n);
  if (id === AT) placeCells('y', instant);
  /* AFTER THE SLIDE, THE LANDING'S OWN WORK — the page in front and one either side if a jump left them empty, its textbook animation and its running widget. § */
  if (F && !bare) afterSlide_(() => finderSoon_(F, fillStuffPages), 'fill:' + id);
  /* ---------- AFTER THE SLIDE, THE SCREEN'S OWN WORK: the reel being watched, the feed's camera started or put at rest (SCREEN_HOOKS). */
  if (H.slid) H.slid(n);
  paintPager(id);
  flowShow_(id, n);
}
