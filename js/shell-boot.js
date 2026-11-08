/* @family. — shell.js ONE FILE, SPLIT. § */

/* ---------- ONE SINK FOR EVERY ERROR (R6, O5) ---------- */
/* Logged, a friendly line drawn in `host` if given, and one report per distinct message+where per visit — message, where, version, screen; never a name or an answer. */
const OOPS = { sent: new Set(), n: 0, max: 10, told: 0 };
function oopsDevice_() {
  try {
    let d = localStorage.getItem('familyDevice');
    if (!d) { d = 'D' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); localStorage.setItem('familyDevice', d); }
    return d;
  } catch (e) { return 'nostore'; }
}
function oopsHtml_() {
  return '<div class="card oops"><h3>This part did not load</h3><p class="sub">The rest of the app is fine.</p></div>';
}
function oops_(err, where, host, o) {
  o = o || {};
  if (err && typeof err === 'object') { if (err.__oops) return; try { err.__oops = true; } catch (e) { /* a frozen error is still reported */ } }
  /* QUOTED TEXT CUT before it leaves: a parse error quotes the answer it choked on. */
  const msg = String((err && err.message) || err || 'unknown').replace(/\x22[^\x22]*\x22|\x60[^\x60]*\x60|(^|[^\w])\x27[^\x27]*\x27(?=[^\w]|$)/g, (m0, pre) => (pre || '') + '[quoted]').replace(/\s+/g, ' ').slice(0, 300);
  where = String(where || 'unknown').slice(0, 120);
  try { console.error('[' + where + ']', err); } catch (e) { /* no console, nothing to lose */ }
  if (host && host.nodeType === 1) { try { host.innerHTML = oopsHtml_(); host.removeAttribute('aria-busy'); } catch (e) { /* the report still goes */ } }
  else if (o.toast && Date.now() - OOPS.told > 5000 && typeof toast === 'function') {
    OOPS.told = Date.now();
    try { toast('Something went wrong there.'); } catch (e) { /* the report still goes */ }
  }
  const key = msg + '|' + where;
  if (OOPS.sent.has(key) || OOPS.n >= OOPS.max || typeof API !== 'string' || typeof fetch !== 'function') return;
  OOPS.sent.add(key); OOPS.n++;
  const body = { action: 'clientError', message: msg, where: where, version: typeof SITE_VERSION === 'string' ? SITE_VERSION : '',
                 screen: typeof AT === 'string' ? AT : '', device: oopsDevice_() };
  try { Promise.resolve(fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify(body) })).catch(() => {}); }
  catch (e) { /* a report that cannot leave is only lost */ }
}
window.addEventListener('error', e => oops_(e && (e.error || e.message), 'onerror', null, { toast: true }));
window.addEventListener('unhandledrejection', e => oops_(e && e.reason, 'promise', null, { toast: true }));
/* REAL-PHONE HEALTH (920): one visit in ten measured, queued and sent five at a time to healthLog; a rank and a device class, never a name. */
const FIELD = { on: Math.random() < 0.1, longs: 0, longMs: 0, find: 0, t0: Date.now() };
function fieldDevice_() {
  try {
    const w = Math.min(screen.width || 0, screen.height || 0), mem = navigator.deviceMemory || 0, cpu = navigator.hardwareConcurrency || 0;
    return (w && w < 600 ? 'phone' : w < 1000 ? 'tablet' : 'desk') + '-' + (mem ? mem + 'gb' : 'gb') + '-' + (cpu ? cpu + 'c' : 'c');
  } catch (e) { return 'unknown'; }
}
function fieldRow_() {
  const nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  const r = (typeof USER !== 'undefined' && USER) ? String(USER.rank || USER.role || 'student').toLowerCase() : 'out';
  return { version: typeof SITE_VERSION === 'string' ? SITE_VERSION : '', rank: r, device: fieldDevice_(),
    load_ms: Math.round(nav.loadEventEnd || 0), find_ms: FIELD.find, long_tasks: FIELD.longs, long_ms: Math.round(FIELD.longMs),
    heap_mb: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 104857.6) / 10 : '', errors: OOPS.n };
}
function fieldSend_(final) {
  if (!FIELD.on || FIELD.sent || typeof API !== 'string' || typeof fetch !== 'function') return;
  FIELD.sent = true;
  let q = [];
  try { q = JSON.parse(localStorage.getItem('familyField') || '[]'); } catch (e) { q = []; }
  q.push(fieldRow_());
  if (q.length < 3 && !final) { try { localStorage.setItem('familyField', JSON.stringify(q.slice(-5))); } catch (e) { FIELD.lost = (FIELD.lost || 0) + 1; } return; }
  try { localStorage.removeItem('familyField'); } catch (e) { FIELD.lost = (FIELD.lost || 0) + 1; }
  try { Promise.resolve(fetch(API, { method: 'POST', cache: 'no-store', keepalive: true, body: JSON.stringify({ action: 'healthLog', device: fieldDevice_(), rows: q.slice(-5) }) })).catch(() => {}); }
  catch (e) { FIELD.lost = (FIELD.lost || 0) + 1; }
}
if (FIELD.on) {
  try { new window.PerformanceObserver(l => l.getEntries().forEach(e => { FIELD.longs++; FIELD.longMs += e.duration; })).observe({ type: 'longtask', buffered: true }); } catch (e) { FIELD.longs = -1; }
  /* TIME TO FIND: the first menu answer on the glass, looked for twice a second for a minute and never again. */
  const look = setInterval(() => { try {
    if (!FIELD.find && document.querySelector('#s-stuff [data-do="facet-pick"]')) FIELD.find = Date.now() - FIELD.t0;
    if (FIELD.find || Date.now() - FIELD.t0 > 60000) { clearInterval(look); setTimeout(() => fieldSend_(false), 2000); }
  } catch (e) { clearInterval(look); } }, 500);
  try { addEventListener('pagehide', () => fieldSend_(true)); } catch (e) { FIELD.lost = (FIELD.lost || 0) + 1; }
}
/* A STEP THAT MAY THROW, RUN SO THAT IT CANNOT TAKE ITS CALLER WITH IT. */
function oopsTry_(where, fn, host) {
  try { return fn(); } catch (err) { oops_(err, where, host); return undefined; }
}
/* TWO TIERS (860): data/settings/tiers.json. What is not core runs through tierRun_, so its throw is reported and never reaches boot, the pager or Find. check-tiers holds these lists to the file. */
const TIER_CORE_WIDGETS = [];
const TIER_LAZY_WIDGETS = [];
const TIER_OFF_WIDGETS = ['console', 'boardgames', 'wordgames', 'reels', 'videos', 'newspaper', 'homework', 'flyers', 'mat', 'timer', 'docket', 'notepad', 'spotify', 'speedread', 'timetable', 'typing', 'cart', 'shopfind', 'calendar', 'termdates', 'countdowns', 'favlinks', 'rewrite', 'poster', 'pixel', 'verse', 'whiteboard'];
const TIER_CORE_KINDS = ['question', 'content', 'insert', 'practical', 'project', 'level'];
const tierCore_ = (what, id) => (what === 'kind' ? TIER_CORE_KINDS : TIER_CORE_WIDGETS).indexOf(String(id)) !== -1;
const TIER_RUN = { depth: 0 };
/* A GUARDED CALL: a throw is oops_'s and gives `fallback`; a timer or frame asked for while it runs is guarded the same way, never rethrown. */
function tierRun_(where, fn, self, args, fallback, host) {
  const W = typeof window !== 'undefined' ? window : null;
  let keep = null;
  if (W && !TIER_RUN.depth) {
    keep = { t: W.setTimeout, i: W.setInterval, r: W.requestAnimationFrame };
    const wrap = real => function (cb) {
      const a = Array.prototype.slice.call(arguments);
      if (typeof cb === 'function') a[0] = function () { return tierRun_(where, cb, this, arguments); };
      return real.apply(W, a);
    };
    W.setTimeout = wrap(keep.t); W.setInterval = wrap(keep.i);
    if (typeof keep.r === 'function') W.requestAnimationFrame = wrap(keep.r);
  }
  TIER_RUN.depth++;
  try { return fn.apply(self, args || []); }
  catch (err) { oops_(err, where, typeof host === 'function' ? host() : host); return typeof fallback === 'function' ? fallback(err) : fallback; }
  finally {
    TIER_RUN.depth--;
    if (keep) { W.setTimeout = keep.t; W.setInterval = keep.i; if (typeof keep.r === 'function') W.requestAnimationFrame = keep.r; }
  }
}
/* OFF (860): nothing of its own runs; its card is its name, "Coming soon" and Suggest, so a person can still ask for it back. */
function tierOff_(w) {
  const name = String(w.name || w.title || w.id);
  ['start', 'draw', 'stop'].forEach(k => { if (typeof w[k] === 'function') w[k] = () => (k === 'draw' ? false : undefined); });
  Object.defineProperty(w, 'html', { configurable: true, enumerable: true, get() {
    const say = typeof brand === 'function' ? brand('widgetOff', 'Coming soon') : 'Coming soon';
    const sug = typeof suggestTile_ === 'function' ? suggestTile_('widget', String(w.id), name) : '';
    return `<div class="card widget-off"><h3>${esc(name)}</h3><p class="sub">${esc(say)}</p>${sug ? `<div class="tile-row">${sug}</div>` : ''}</div>`;
  } });
  try { Object.defineProperty(w, '__tier', { value: 'off' }); } catch (e) { /* a frozen widget is still off */ }
}
/* EVERY SECONDARY WIDGET'S start, draw, stop and markup, guarded once where WIDGETS is written (map.js) — so every caller is covered, whichever file calls. */
function tierGuardWidgets_(list) {
  (Array.isArray(list) ? list : []).forEach(w => {
    if (!w || typeof w !== 'object' || w.__tier || tierCore_('widget', w.id)) return;
    if (TIER_OFF_WIDGETS.indexOf(String(w.id)) !== -1) return tierOff_(w);
    const where = 'widget:' + w.id;
    const slot = () => (w.into && typeof document !== 'undefined' ? document.getElementById(w.into) : null);
    ['start', 'draw', 'stop'].forEach(k => {
      const f = w[k];
      if (typeof f === 'function') w[k] = function () { return tierRun_(where, f, this, arguments, k === 'draw' ? false : undefined, k === 'start' ? slot : null); };
    });
    if (TIER_LAZY_WIDGETS.indexOf(String(w.id)) !== -1) tierLazy_(w, slot);
    const d = Object.getOwnPropertyDescriptor(w, 'html');
    if (d && typeof d.get === 'function') {
      Object.defineProperty(w, 'html', { configurable: true, enumerable: d.enumerable, get() { return tierRun_(where, d.get, this, [], oopsHtml_); } });
    }
    try { Object.defineProperty(w, '__tier', { value: 'secondary' }); } catch (e) { /* a frozen widget is still guarded */ }
  });
  return list;
}

/* ITS FILE IS IN THE SECOND BATCH (1080): the first start shows the wait and fetches LAZY, then starts it if its slot is still there; draw and stop wait too. */
function tierLazy_(w, slot) {
  const ready = () => typeof lazyFiles_ !== 'function' || !!lazyFiles_.in;
  const g = { start: w.start, draw: w.draw, stop: w.stop };
  if (g.draw) w.draw = function () { return ready() ? g.draw.apply(this, arguments) : false; };
  if (g.stop) w.stop = function () { return ready() ? g.stop.apply(this, arguments) : undefined; };
  if (g.start) w.start = function () {
    if (ready()) return g.start.apply(this, arguments);
    const self = this, a = arguments, el = slot();
    if (el && !el.firstChild) el.innerHTML = loading_();
    lazyFiles_().then(() => { const s = slot(); if (s && s.isConnected) g.start.apply(self, a); });
    return undefined;
  };
}

/* ONE SCROLLING PAGE (900): sections in normal flow, scrolled by the browser. false brings back the sideways columns, the pager and the glass. */
const FLOW_LAYOUT = true;
document.documentElement.classList.toggle('flow', FLOW_LAYOUT);

/* ---------- THE TABS § */
const TABS = [
  /* Posts leftmost: the one screen somebody opens with no errand. Every other tab answers a
     question, and a person with no question needs somewhere to land. */
  /* ---------- ONE TAB § */
  { id: 'stuff',   icon: '🔎', label: 'Find',    title: 'Find' },
  /* ---------- WHO YOU ARE, AT THE START OF THE YOU GROUP (392) § */
  { id: 'account', icon: '⚙', label: 'Kids settings', title: 'Kids settings', cards: true },

  /* ---------- AND SEVEN MORE, WHICH IS THIS TABLE GOING BACK THE WAY IT CAME § */
  { id: 'feed',    icon: '🏠', label: 'Feed',    title: 'Feed' },
  { id: 'booking', icon: '📅', label: 'Book',    title: 'Booking' },
  /* `tools` AND `games` WERE COLUMNS HERE; their widgets are Find cards since 790 (data/settings/widgets-in-find.json). */

  /* ---------- AND THE TWO THE LAYOUT SHEET ASKED FOR § */
  { id: 'reel',    icon: '▶',  label: 'Reels',   title: 'Reels' },
  { id: 'dm',      icon: '✉',  label: 'DMs',     title: 'Messages' },
  /* ---------- SAVED, RIGHT OF FIND 2 WITH THE LEARNING COLUMNS (392) § */
  { id: 'saved',   icon: '★',  label: 'Saved',   title: 'Saved' },
  { id: 'spotlight', icon: '✦', label: 'Spotlight', title: 'Spotlight', cards: true },
  /* ---------- SIX COLUMNS (461): each account type's settings, then a card per tutor, student and parent. */
  /* THE OWNER'S ELEVEN (730): five profiles, then six settings; `cards` marks a card column (columns.json says the same; check-doors). */
  { id: 'web',      icon: '🌍', label: 'Web profile',        title: 'Web profile', cards: true },
  { id: 'tutors',   icon: '🎓', label: 'Tutor profile',      title: 'Tutor profile', cards: true },
  { id: 'students', icon: '👤', label: 'Student profile',    title: 'Student profile', cards: true },
  { id: 'parents',  icon: '👪', label: 'Parent profile',     title: 'Parent profile', cards: true },
  { id: 'apprentices', icon: '🧰', label: 'Apprentice profile', title: 'Apprentice profile', cards: true },
  { id: 'family',  icon: '🔧', label: 'Parent settings',  title: 'Parent settings', cards: true },
  { id: 'staff',   icon: '🛠', label: 'Tutor settings',   title: 'Tutor settings', cards: true },
  /* APPRENTICE: work experience, a placeholder column beside Tutor settings until it is built (docs/history/570). */
  { id: 'apprentice', icon: '🧑‍🔧', label: 'Apprentice settings', title: 'Apprentice settings', cards: true },
  /* ---------- AND THE SHOP, RIGHT OF BOOKING § */
  { id: 'shop',    icon: '🛒', label: 'Shop',    title: 'Shop' },
  /* ---------- AND PROGRESS, RIGHT OF SAVED (392), WAITING TO BE BUILT § */
  /* ---------- FIND 2: THE SAME FINDER AGAIN, RIGHT OF FIND § */
  { id: 'res',     icon: '🔎', label: 'Find 2', title: 'Find 2' },
  /* ---------- AND THE BUSINESS'S OWN PAPERWORK, LAST, FOR AN ADMIN AND NOBODY ELSE § */
  { id: 'biz', icon: '📋', label: 'Biz settings', title: 'Biz settings', admin: true, cards: true },
  /* ---------- AND THE SITE'S OWN SETTINGS, SPLIT FROM BUSINESS (491), FOR AN ADMIN AND NOBODY ELSE ---------- */
  { id: 'site', icon: '🌐', label: 'Web settings', title: 'Web settings', admin: true, cards: true },
];

/* ---------- LEFT TO RIGHT, WHICH IS NOT THE ORDER THEY ARE WRITTEN IN § */
/* GROUPED BY PURPOSE, read left to right (392). columns.json lists the same order; check-doors fails if they part. § */
const TAB_ORDER = ['stuff', 'res', 'saved',                           /* FIND FIRST, for everyone (1070): the one front door; Tools and Games are Find cards (790) */
                   'spotlight', 'feed', 'reel', 'dm',                 /* social (392), below Find; Spotlight left of the posts (461) */
                   'booking', 'shop',                                 /* business */
                   'web', 'tutors', 'students', 'parents', 'apprentices', /* the five profiles (730) */
                   'staff', 'site', 'account', 'family', 'apprentice', 'biz']; /* the six settings, the owner's order (730); site and biz admin-only */
TABS.sort((a, b) => TAB_ORDER.indexOf(a.id) - TAB_ORDER.indexOf(b.id));

/* ---------- EVERY COLUMN THE BUILD HAS, AND THE ONES THIS VIEWER IS GIVEN § */
const TABS_BUILT = TABS.slice();
/* THE CARD COLUMNS (730), left to right: TAB_ORDER and each tab's `cards`, which data/settings/columns.json repeats (check-doors). */
const CARD_COLS = TAB_ORDER.filter(id => TABS_BUILT.some(t => t.id === id && t.cards));
const COLUMNS = TABS.slice();

/* ---------- WHICH COLUMNS THIS VIEWER IS GIVEN — THE SMALLEST RULE THAT LEAVES ONE OUT § */
function columnsFor_() {
  let admin = false;
  try { admin = typeof isAdmin === 'function' && isAdmin(); } catch (e) { admin = false; }
  /* AN ADMIN'S CUSTOM COLUMNS (466, layout.js) put into `COLUMNS` before Business, as the layout in force names them. */
  try { if (typeof customTabsSync_ === 'function') customTabsSync_(); } catch (e) { oops_(e, 'shell:columnsFor_') }
  const want = COLUMNS.filter(t => !t.admin || admin);
  const changed = want.length !== TABS.length || want.some((t, i) => TABS[i] !== t);
  if (changed) {
    /* WHERE YOU ARE, IF IT IS THE COLUMN GOING — the nearest column left of it that stays. */
    let at = null;
    try { at = AT; } catch (e) { at = null; }
    if (at && !want.some(t => t.id === at) && COLUMNS.some(t => t.id === at)) {
      const i = COLUMNS.findIndex(t => t.id === at);
      const left = COLUMNS.slice(0, i).reverse().find(t => want.indexOf(t) !== -1);
      AT = (left || want.find(t => t.id === TAB_HOME) || want[0]).id;
    }
    TABS.length = 0;
    want.forEach(t => TABS.push(t));
  }
  /* AND THE SECTIONS, every time — cheap, and it puts the document right even where `TABS` did not
     change (the first call, when index.html has just been parsed). */
  const host = typeof document !== 'undefined' && document.getElementById('screen');
  if (!host) return changed;
  /* A CUSTOM COLUMN'S SECTION is made while it is a tab and removed when it is not, like Business's. */
  host.querySelectorAll(':scope > section[data-custom]').forEach(el => { if (!TABS.some(t => t.custom && 's-' + t.id === el.id)) el.remove(); });
  TABS.forEach(t => {
    if (!t.custom || document.getElementById('s-' + t.id)) return;
    const s = document.createElement('section');
    s.className = 'screen hidden';
    s.id = 's-' + t.id;
    s.setAttribute('data-custom', '');
    const biz = document.getElementById('s-biz');
    if (biz && biz.parentNode === host) host.insertBefore(s, biz); else host.appendChild(s);
  });
  TABS_BUILT.forEach(t => {
    if (!t.admin) return;
    const el = document.getElementById('s-' + t.id);
    const mine = TABS.indexOf(t) !== -1;
    if (mine && !el) {
      const s = document.createElement('section');
      s.className = 'screen hidden';
      s.id = 's-' + t.id;
      host.appendChild(s);
    } else if (!mine && el) {
      el.remove();
    }
  });
  return changed;
}

/* ---------- AND THE SHEET DECIDES, ONCE THERE IS ONE § */
function applyColumns_() {
  const rows = (DATA && DATA.columns) || [];
  if (!rows.length) return;

  const known = {};
  TABS_BUILT.forEach(t => { known[t.id] = t; });

  const want = rows.map(r => known[String(r.screen || '').trim()])
                   .filter(Boolean);
  if (!want.length) return;      /* the sheet names nothing this build has — leave it alone */
  /* FIND STANDS FIRST WHATEVER ORDER A SHEET GIVES (1070): the one front door; the rest keep their order below it. */
  want.sort((a, b) => (b.id === TAB_HOME) - (a.id === TAB_HOME));

  /* THE LABEL AND THE ICON COME FROM THE SHEET TOO, where it gives them. A blank cell means "keep
     what the code says" rather than "make it empty", which is the same rule every other tab in this
     system follows. */
  rows.forEach(r => {
    const t = known[String(r.screen || '').trim()];
    if (!t) return;
    if (String(r.label || '').trim()) t.label = String(r.label).trim();
    if (String(r.icon  || '').trim()) t.icon  = String(r.icon).trim();
  });

  COLUMNS.length = 0;
  want.forEach(t => COLUMNS.push(t));
  columnsFor_();

  /* WHERE `AT` IS NOW. Somebody remembered on a column the sheet has just switched off would be on a
     screen that no longer exists, and `go` would silently send them home without saying why. */
  if (!TABS.some(t => t.id === AT)) AT = (TABS.find(t => t.id === TAB_HOME) || TABS[0]).id;
}

/* ---------- WHERE AN UNKNOWN ROUTE LANDS, NAMED RATHER THAN COUNTED § */
/* THE FIRST THING ANYBODY SEES IS FIND (1070): the core and the one front door; the other columns stand below it. */
const TAB_HOME = 'stuff';
/* A COLUMN THAT WAS DISSOLVED, AND WHERE ITS THINGS WENT: an old link or a remembered place lands there (461). */
const TAB_GONE = { progress: 'account' };

/* ---------- HOW LONG AWAY COUNTS AS OPENING IT AGAIN § */
const AWAY_AGAIN = 6 * 60 * 1000;

/* What each screen draws. Registered separately from the tab list so a screen can be built and
   swapped without touching the navigation — which is the whole reason for splitting them. */
const SCREENS = {};

/* Register a screen. `draw` returns the markup for it, and that is the whole contract. § */
function screen(id, draw) { SCREENS[id] = { draw }; }

/* ---------- WHERE YOU WERE, IF IT IS STILL A PLACE § */
/* FIRST VISIT LANDS ON FIND — see `TAB_HOME` above. */
let AT = TAB_HOME;
/* ---------- REMEMBERED FOR A RELOAD, NOT FOR TOMORROW § */
/* THE VIEWER'S COLUMNS FIRST — `USER` is already read out of storage (data.js), so an admin reloading on
   Business is put back on it, and anybody else's remembered `biz` is not a column and is let go. */
try { columnsFor_(); } catch (e) { oops_(e, 'shell:screen') }
try {
  const kept = localStorage.getItem('familyTab');
  const was = TAB_GONE[kept] || kept;
  const when = Number(localStorage.getItem('familyTabAt') || 0);
  if (was && TABS.some(t => t.id === was) && when && Date.now() - when < AWAY_AGAIN) AT = was;
} catch { /* a bad stored tab opens the default one */ }
/* ---------- AND THE MOMENT IS WHEN YOU LEFT, NOT WHEN YOU ARRIVED § */
function tabStampLeft_() {
  try { if (localStorage.getItem('familyTab') === AT) localStorage.setItem('familyTabAt', String(Date.now())); } catch { /* storage blocked: the tab is not remembered */ }
}
window.addEventListener('pagehide', tabStampLeft_);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') tabStampLeft_(); });

/* ---------- THE COLUMN BEFORE THIS ONE § */
let PREV_AT = '';
function go(id, remember, instant) {
  id = TAB_GONE[id] || id; if (typeof settingsGone_ === 'function' && settingsGone_(id)) return; if (typeof bookingGone_ === 'function' && bookingGone_(id)) return;  /* a settings column is Find › Settings now (batch C) */
  const tab = TABS.find(t => t.id === id)
           || TABS.find(t => t.id === TAB_HOME)
           || TABS[0];
  const was = AT;
  AT = tab.id;
  if (was && was !== AT) PREV_AT = was;
  if (remember !== false) {
    try {
      localStorage.setItem('familyTab', AT);
      /* THE STAMP IS WRITTEN WITH THE ID AND NEVER WITHOUT IT — see the note over `AT` above. A
         stamp left behind by an id that was not written is a column remembered by its timestamp. */
      localStorage.setItem('familyTabAt', String(Date.now()));
    } catch { /* storage blocked: the tab is not remembered */ }
  }

  /* NOTHING IS HIDDEN ANY MORE. § */
  /* IT ARRIVES FROM THE SIDE IT CAME FROM. One class and one keyframe, rather than eight screens
     held in position so that one of them could be seen sliding in. */
  const from = TABS.findIndex(t => t.id === was), to = TABS.findIndex(t => t.id === AT);
  const way = (was && was !== AT) ? (to > from ? 1 : -1) : 0;
  /* THE WAY THE ROW WAS LAST TRAVELLED — the builder takes the columns on that side first (`ahead_`). */
  if (way) AHEAD.dir.x = way;
  /* AND A COLUMN THIS LANDING WILL SHOW THAT STILL HOLDS THE BOOT'S LOADER IS DRAWN NOW — see `bootGlass_`. */
  oopsTry_('go:glass', bootGlass_);

  /* PAINT FIRST, PLACE SECOND, ALWAYS. § */
  oopsTry_('go:neighbours', paintNeighbours);
  oopsTry_('go:place', () => placeCells('x', instant));

  /* ---------- WHY A SIDEWAYS SWIPE WAS THE ROUGH ONE § */
  /* OR IF IT IS STALE — something changed while you were elsewhere. See the note on `STALE`. */
  const painted = !screenHasMarkup_(AT) || !!STALE[AT];
  if (painted) oopsTry_('go:paint:' + AT, () => paint(AT));
  if (was !== AT && typeof widgetsBeforeSlide_ === 'function') oopsTry_('go:beforeSlide', () => widgetsBeforeSlide_(AT));
  /* Anything that needs to start running once its markup exists — a canvas, a board, a clock.
     After paint, because none of it can find an element that has not been drawn yet. */
  /* A hoisted FUNCTION, not a const. § */
  /* WHEN, and it is not simply "after the slide". § */

  /* THE TOOLS AND THE GAMES ARE STARTED WHEN THEIR COLUMN ARRIVES, and stopped when it leaves. § */
  /* AND THE CAMERA, for the same reason and with more force: a canvas loop behind a screen nobody
     is looking at is a flat battery, and a live camera behind one is a recording light on for
     nothing. */
  /* THE CAMERA IS A PAGE OF THE FEED NOW, so leaving the FEED is what lets it go. Turning a page
     within the feed is the other half, and it is `feedCamWatch_` — booked from `goPage` and from
     `startScreen_` below. */
  /* ---------- ONLY WHEN LEAVING THE FEED, OR WITH A CAMERA ACTUALLY OPEN § */
  /* PARKED, NOT STOPPED (427): coming back must not ask again, and a parked stream is no reason to run this on other columns. */
  if (typeof camStop_ === 'function' && AT !== 'feed'
      && (was === 'feed' || (typeof camOn_ === 'function' && camOn_()))) camStop_(false, true);
  /* AND THE REEL, which is the third of these and was the one nobody had written. § */
  if (typeof reelsStop_ === 'function' && AT !== 'reel') reelsStop_();
  /* A PIN SHOWN ON A CARD (452) goes when its column is left. */
  if (was !== AT && typeof pinHideAll_ === 'function') pinHideAll_();
  /* AND THE MESSAGE POLL, which is the fourth. § */
  if (typeof dmStop_ === 'function' && AT !== 'dm') dmStop_();
  /* STARTED AFTER THE SLIDE, in one list rather than two. `repaint` needs the same list — it has
     just rebuilt this screen's markup too — and two copies of "what does this screen need running"
     is two places to forget the camera. */
  /* `true`: ARRIVING, so a column of widgets starts the ones in view first — see `widgetsWake_`. § */
  if (was !== AT || painted) afterSlide_(() => startScreen_(AT, true), 'start');
  aheadKick_(AHEAD_QUIET);

  /* EITHER FINDER (find.js, `FINDERS`): § */
  const finder = typeof finderOf_ === 'function' ? finderOf_(AT) : null;
  if (finder) {
    const host = $('s-' + finder.id);
    const drawn = host && host.querySelector('.page[data-filled]');
    if (instant || !drawn) oopsTry_('go:fill:' + finder.id, () => finderSoon_(finder, fillStuffPages));
    else afterSlide_(() => finderSoon_(finder, fillStuffPages), 'fill:' + finder.id);
  }
  /* After wake, because a page holding a canvas has to exist and be sized before it is moved. § */
  oopsTry_('go:pager', () => paintPager(AT, instant));
  if (FLOW_LAYOUT) oopsTry_('go:flow', () => { topbarPaint_(); if (was && was !== AT) $('s-' + AT).scrollIntoView({ block: 'start' }); });

}

/* DRAW THE SCREEN EITHER SIDE, so a sideways drag reveals one rather than an empty rectangle. § */
/* ---------- WHAT EACH SCREEN NEEDS RUNNING ONCE ITS MARKUP EXISTS § */
function startScreen_(id, arriving) {
  /* NOT A COLUMN A LANDING PAYLOAD LEFT ALONE — its markup was not replaced, so what runs in it is still
     running, and restarting it is what moves the caret: the notepad's `start` writes its value back.
     See `landRepaint_`. */
  if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) return;
  /* NOR ONE `paint` HELD UNDER A STROKE (`padHold_`, find.js), for the same reason and one more: § */
  if (typeof padHold_ === 'function' && padHold_(id)) return;
  /* NOR A WIDGET COLUMN `paint` HELD FOR A FORM WITH TYPING IN IT (`settingsKeep_`, me.js) — the library cards on Tools, and their starred copy on Saved § */
  if (!arriving && ['saved', 'stuff', 'res'].indexOf(id) !== -1 && typeof settingsKeep_ === 'function' && settingsKeep_(id)) return;
  /* THE SAVED COLUMN HOLDS WIDGETS TOO, so it starts them — from its own list rather than from a
     kind, because what is on it is whatever was starred. */
  if (id === 'saved' && typeof savedStart_ === 'function') { savedStart_(arriving); }
  /* AND THE SHOP, whose first page is the basket — a widget, with a `start` that draws its lines.
     Without this the basket arrived as a heading over an empty box. */
  else if (id === 'shop' && typeof toolsStart_ === 'function') { toolsStart_('shop', arriving); }
  /* AND THE WIDGETS LEADING THE REELS (414) — Videos and One more thing, the pages before the first reel. */
  else if (id === 'reel' && typeof toolsStart_ === 'function') { toolsStart_('reel', arriving); }
  /* AND A WIDGET MOVED ONTO ANY OTHER COLUMN (710, layout.js). */
  else if (typeof WIDGET_COLS !== 'undefined' && WIDGET_COLS.indexOf(id) !== -1 && typeof widgetsWake_ === 'function') {
    const ws = widgetsOn_(id);
    if (ws.length) { widgetsWake_(ws, id, arriving); if (id === AT) placeCells('y', true, 0, id); }
  }
  /* ---------- AND A COLUMN WHOSE CARDS JUST GREW IS PLACED AGAIN § */
  if ((id === 'saved' || id === 'shop' || id === 'reel') && id === AT) {
    placeCells('y', true, 0, id);
  }
  /* THE CAMERA STARTS ON ARRIVAL rather than on a tap. § */
  /* ONLY ON ITS OWN PAGE. § */
  if (id === 'feed' && typeof feedCamWatch_ === 'function') feedCamWatch_();
  /* AND THE REEL COLUMN PLAYS THE ONE YOU ARE ON. § */
  if (id === 'reel' && typeof reelsWatch_ === 'function') reelsWatch_();
  /* AND A TEXTBOOK'S ANIMATION PLAYS ONLY ON FIND, ONLY ON THE PAGE IN FRONT — for EVERY screen, because
     arriving anywhere else is what pauses the one on Find. See `tbAnimWatch_` in find.js. */
  if (typeof tbAnimWatch_ === 'function') tbAnimWatch_();
  /* AND AN ADMIN'S BUSINESS RECORDS ARE ASKED FOR — a POST, once, and never the payload (see js/records.js). § */
  if (id === 'biz' && typeof bizStart_ === 'function') bizStart_();
  /* AND A CONVERSATION OPENS AT ITS NEWEST MESSAGE. A scroller's natural state is the top, which on
     a thread is last month — so something has to say otherwise, once the markup exists. */
  if (id === 'dm' && typeof dmFoot_ === 'function') dmFoot_();
  /* AND IT KEEPS ITSELF UP TO DATE WHILE IT IS THE SCREEN YOU ARE ON — see `dmPoll_` in posts.js,
     which is where the interval and what it costs are written down. */
  if (id === 'dm' && typeof dmPoll_ === 'function') dmPoll_();
}

/* ---------- A COLUMN THE LANDING WILL SHOW, STILL ON THE BOOT'S LOADER, IS DRAWN BEFORE THE SLIDE § */
function bootGlass_() {
  if (!PRE_PAYLOAD.size || typeof GLASS === 'undefined') return;
  const ti = TABS.findIndex(t => t.id === AT);
  if (ti < 0) return;
  const k = WIDE ? Math.max(1, GLASS.reach || 1) : 1;
  TABS.forEach((t, i) => {
    if (t.id === AT || Math.abs(i - ti) > k || !PRE_PAYLOAD.has(t.id) || !STALE[t.id]) return;
    paint(t.id);
    if (!STALE[t.id] && PAGER[t.id]) paintPager(t.id, true);
  });
}

/** Has this screen been drawn? A screen with markup needs no redrawing to be arrived at. */
function screenHasMarkup_(id) {
  /* BY ID, NOT `$`: a section is on the page once, and a check that saw data.js fail to load crashed here on `$` */
  const el = document.getElementById('s-' + id);
  /* THE FIRST CHILD, NOT `innerHTML`, which serialises every screen's whole markup to answer yes or no — about a millisecond across eleven at 1x and four at 4x § */
  return !!(el && el.firstElementChild);
}

function paintNeighbours() {
  /* EVERY SCREEN, not the two either side. § */
  TABS.forEach((t, i) => {
    const id = t.id;
    if (id === AT) return;
    const el = $('s-' + id);
    if (!el || el.firstChild) return;         // already drawn; redrawing would only cost
    paint(id);
    /* And placed, if it is a paged screen. A neighbour whose pages have no position shows nothing
       when a drag reveals it, which is worse than showing an empty rectangle because it looks like
       the screen itself is empty. */
    if (PAGER[id]) paintPager(id, true);
  });
  /* The screen in front is NOT repainted here. `go` has already drawn it, and drawing it a second
     time is what threw its placement away. */
}

/** Redraw one screen where it stands. Called after anything that changes what it should say. */
/* ---------- WHICH SCREENS ARE OUT OF DATE § */
let STALE = {};
/* ---------- TWO MARKS NOW, AND TWO CLOCKS § */
let ACT_EPOCH = 0;
let DRAW_EPOCH = 0;
/* ---------- A MARK MADE OUTSIDE `repaint` IS ONE CALL, AND IT TELLS THE BUILDER § */
function markStale_(ids) {
  [].concat(ids).forEach(id => { if (id) STALE[id] = 1; });
  if (typeof aheadKick_ === 'function') aheadKick_();
}
/* WHICH MARK `repaint` WRITES — 1, except for the length of a landing. */
let REPAINT_MARK = 1;
/* THE COLUMNS WHOSE MARKUP WAS DRAWN BEFORE THE FIRST PAYLOAD — drawn again from nothing (`fresh`) whenever
   they are drawn, so a widget started on the boot's markup is started again in the payload's (331). */
const PRE_PAYLOAD = new Set();
/* HOW MANY TIMES EACH COLUMN WAS DRAWN, for the journeys that ask what a landing drew (check-flow). */
const PAINT_N = {};

/* A REDRAW KEEPS THE READER'S PLACE (561, U2): each scrolled box's offset, keyed by its path of child indexes from the column, and focus by id. */
function placeKeep_(el) {
  const out = [];
  el.querySelectorAll('*').forEach(n => {
    if (!n.scrollTop && !n.scrollLeft) return;
    const path = [];
    for (let x = n; x && x !== el; x = x.parentElement) path.unshift([...x.parentElement.children].indexOf(x) + ':' + x.tagName);
    out.push({ path: path, top: n.scrollTop, left: n.scrollLeft });
  });
  const f = document.activeElement;
  return { boxes: out, focus: f && f.id && el.contains(f) ? f.id : '' };
}
function placeBack_(el, kept) {
  kept.boxes.forEach(k => {
    let n = el;
    for (const step of k.path) {
      const [i, tag] = step.split(':');
      n = n && n.children[+i];
      if (!n || n.tagName !== tag) return;
    }
    n.scrollTop = k.top; n.scrollLeft = k.left;
  });
  if (kept.focus) { const f = document.getElementById(kept.focus); if (f && el.contains(f)) try { f.focus({ preventScroll: true }); } catch (e) { /* focus is a courtesy: a box that cannot take it keeps the place anyway */ } }
}

/* `fresh`: DRAWN FROM NOTHING, because the caller starts again whatever runs in it — `repaint`, for the column in front. § */
function paint(id, fresh, o) {
  /* ---------- A SETTINGS CARD WITH SOMETHING TYPED INTO IT IS NOT REDRAWN UNDER THE TYPING § */
  if (typeof settingsKeep_ === 'function' && settingsKeep_(id)) { STALE[id] = 1; return; }
  /* ---------- AND NEITHER FINDER IS REDRAWN UNDER A CHILD WHO IS WRITING § */
  if (typeof findKeep_ === 'function' && findKeep_(id)) { STALE[id] = 1; return; }
  /* AND NO COLUMN IS REBUILT BY A PAYLOAD LANDING UNDER SOMEBODY TYPING IN IT — see `landRepaint_`. */
  if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) { STALE[id] = 1; return; }
  /* ---------- AND NO COLUMN IS REDRAWN UNDER A STROKE, WHICHEVER COLUMN IT IS § */
  if (typeof padHold_ === 'function' && padHold_(id)) { STALE[id] = 1; return; }
  /* Drawn is fresh, by definition, whoever asked for it. THE MARK IS KEPT FOR ONE QUESTION FIRST: whether
     a landing's `'maybe'` may be answered by writing nothing (below). */
  const mark = STALE[id];
  delete STALE[id];
  /* A COLUMN STILL HOLDING THE BOOT'S MARKUP: § */
  const pre = PRE_PAYLOAD.has(id);
  /* A PAGED SCREEN HAS NO PADDING OF ITS OWN — each page supplies it, because a page is positioned against the screen's padding box and would otherwise be inset by § */
  $('s-' + id)?.classList.toggle('paged', !!PAGER[id]);
  const el = $('s-' + id);
  const s = SCREENS[id];
  if (!el) return;

  /* ONE SCREEN THAT WILL NOT DRAW MUST NOT TAKE THE OTHERS WITH IT. § */
  let html;
  try {
    /* A COLUMN WHOSE FILE IS STILL ON ITS WAY (670, `LATER`) waits, and `load()` paints it once it is in. */
    html = s ? s.draw() : (filesIn_() ? null : waitShape_(id));
  } catch (err) {
    /* ITS CODE NOT IN YET (670, `LATER`): the column waits, and is drawn again when the payload lands. */
    if (!filesIn_() && err instanceof ReferenceError) { el.innerHTML = waitShape_(id); STALE[id] = 1; return; }
    oops_(err, 'draw:' + id);
    el.innerHTML = `<div class="pane"><div class="card">
        <h3>This screen did not draw</h3>
        <p class="faint">The rest of the app is fine — swipe across. If a file did not load, the
          banner at the top says which.</p>
      </div></div>`;
    return;
  }
  /* ---------- AND A WIDGET RUNNING ON THIS COLUMN KEEPS THE SLOT IT IS RUNNING IN § */
  /* ---------- A LANDING THAT CHANGES NOTHING WRITES NOTHING § */
  const want = (o && o.land && mark !== 1) ? 'maybe' : mark;
  if (want === 'maybe' && !fresh && html !== null && !PRE_PAYLOAD.has(id)
      && !(typeof finderOf_ === 'function' && finderOf_(id))
      && el.DRAWN && el.DRAWN.html === html && el.DRAWN.epoch === ACT_EPOCH && el.firstElementChild) {
    if (typeof widgetsReveil_ === 'function') widgetsReveil_(id, false);
    return 'kept';
  }
  const held = !fresh && typeof widgetsHeld_ === 'function' ? widgetsHeld_(id, pre) : [];
  const waited = waitingPages_(el);
  const kept = pre ? null : placeKeep_(el);
  el.innerHTML = html !== null
    ? html
    : empty_('Nothing here yet.');
  el.DRAWN = { html: html, epoch: ACT_EPOCH };
  PRE_PAYLOAD.delete(id);
  PAINT_N[id] = (PAINT_N[id] || 0) + 1;
  if (held.length) {
    const left = widgetsBack_(id, held);
    if (typeof finderOf_ === 'function' && finderOf_(id)) WIDGET_HELD[id] = left;
  }
  shapeHold_(el, id);
  arrivePages_(el, waited);
  if (kept) placeBack_(el, kept);
  /* NEW MARKUP IS NEW PAGES, so the next placement walks this column's pages whatever its signature says
     (`placePages_`). */
  el.PG_SIG = null;

  /* ---------- AND THE COLUMN IS CENTRED ON WHAT WAS JUST DRAWN § */
  if (typeof PLACED_ONCE !== 'undefined' && PLACED_ONCE && !(o && o.ahead)
      && !(typeof SWIPE !== 'undefined' && SWIPE.live && SWIPE.axis)) {
    placeCells('y', true, 0, id);
  }

  /* ---------- AND WHETHER THE NEW CARDS FIT THE PANES THEY ARE IN § */
  if (typeof afterSlide_ === 'function' && typeof paneWatch_ === 'function' && !(o && o.ahead)) {
    afterSlide_(() => paneWatch_($('s-' + id)), 'panes:' + id);
  }
}

/* WHAT TO SAY WHEN THERE IS NOTHING. § */
function nothingHere(whenEmpty, needsLibrary) {
  /* EITHER REQUEST CAN BE THE ONE THAT FAILED. § */
  /* ---------- BUT NOT WHILE THE APP IS ASKING AGAIN BY ITSELF § */
  /* AND THE COLUMN'S WAIT IS THE ONE LOADER. § */
  /* `retrying_` (below, beside `awaiting_`), so this and every card that waits for the payload read
     the retry through one definition. */
  const asking = retrying_();
  if (asking && !LIBRARY_FAILED) return loading_();
  const why = (asking ? '' : LOAD_FAILED) || LIBRARY_FAILED;
  if (why) {
    return empty_('Couldn’t load.') + tileRow_(tile_({ icon: 'again', label: 'Try again', act: 'retry' }));
  }
  /* ---------- AND STILL COMING IS NOT THE SAME AS EMPTY § */
  /* ---------- AND THE WAIT IS THE ONE LOADER NOW, NOT A SENTENCE OF ITS OWN § */
  if (needsLibrary && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null) {
    return loading_();
  }
  return empty_(whenEmpty);
}

/* WAITING — ONE LOADER FOR EVERY CARD, AND THIS IS THE ONLY PLACE IT IS WRITTEN § */
function loading_() {
  return '<div class="loading" role="status" aria-label="Loading">'
    + '<span></span><span></span><span></span></div>';
}

/* EACH COLUMN'S SHAPE, KEPT ON THE DEVICE (700): page heights in px, no data, so a column waiting next visit holds its final size. */
const SHAPE_KEY = 'arrival:shape', SHAPE_PAGES = 6;
const shapeWidth_ = () => { try { return WIDE ? 'w' + Math.round(wideCard_().card) : 'n' + innerWidth; } catch (e) { return ''; } };
function shapeAll_() { try { return JSON.parse(localStorage.getItem(SHAPE_KEY) || '{}') || {}; } catch (e) { return {}; } }
/* A SHAPE WITH NO HEIGHT IN IT (nothing laid out, as under jsdom) is no shape: the column keeps its one waiting page. */
function shapeOf_(id) { const w = shapeWidth_(), all = shapeAll_(), hs = all.at === w && all[id]; return Array.isArray(hs) && hs.some(h => h > 0) ? hs : null; }
/* A COLUMN WITH NO DRAWER YET: its remembered pages, each a quiet surface round the one loader; one page when it was never seen. */
function waitShape_(id) {
  const hs = shapeOf_(id) || [0];
  return hs.map(h => `<section class="page"><div class="pane"${h ? ` data-keep style="--keep-h:${h}px"` : ''}>${loading_()}</div></section>`).join('');
}
/* AND A PANE A DRAWER LEFT WAITING gets the height its page had last time. */
function shapeHold_(el, id) {
  const hs = shapeOf_(id);
  if (!hs || !el || (LOADED && LATER_IN)) return;   /* the arrival only: a column paging itself later is its own business */
  el.querySelectorAll(':scope > .page > .pane').forEach((p, i) => {
    if (hs[i] && p.querySelector(':scope > .loading:only-child')) { p.setAttribute('data-keep', ''); p.style.setProperty('--keep-h', hs[i] + 'px'); }
  });
}
/* WRITTEN ONCE THE COLUMNS HAVE LANDED, and again after the library. */
function shapeSave_() {
  try {
    const w = shapeWidth_(), old = shapeAll_(), out = { at: w };
    TABS.forEach(t => {
      const el = $('s-' + t.id);
      const panes = el ? [].slice.call(el.querySelectorAll(':scope > .page > .pane'), 0, SHAPE_PAGES) : [];
      const was = (old.at === w && old[t.id]) || [];
      /* A PANE STILL ONLY WAITING says nothing of its size: the last good height stands, or none. */
      const hs = panes.map((p, i) => (p.querySelector(':scope > .loading:only-child') ? (was[i] || 0) : Math.round(p.getBoundingClientRect().height)));
      if (hs.some(h => h > 0)) out[t.id] = hs;
    });
    keepPut_(SHAPE_KEY, JSON.stringify(out), true);
  } catch (e) { /* storage blocked: the column shapes are measured again next visit */ }
}

/* AND TAKEN OFF AGAIN — the one way a box drawn `aria-busy="true"` with a loader over it shows what
   is under it. Silent on a box that was never waiting, so a caller need not know whether it was. */
function loaded_(el) {
  if (!el || !el.removeAttribute) return;
  el.removeAttribute('aria-busy');
  const dots = el.querySelectorAll(':scope > .loading');
  if (!dots.length) return;
  dots.forEach(l => l.remove());
  /* WHAT WAS UNDER THE DOTS FADES IN where it already stood (428). */
  [].forEach.call(el.children, arrive_);
}

/* ---------- AND WHAT ARRIVES, ARRIVES: ONE FADE FOR EVERYTHING THAT TOOK THE DOTS’ PLACE (docs/history/428) */
function arrive_(el) {
  if (!el || !el.classList || el.classList.contains('loading') || el.classList.contains('arrive')) return;
  el.classList.add('arrive');
  /* TAKEN OFF AGAIN, so a slot moved to another column later (`widgetsBack_`) is not faded a second time. */
  setTimeout(() => el.classList.remove('arrive'), 700);
}
/* EVERY OTHER WAY THE DOTS ARE REPLACED (`box.innerHTML = …` over a `loading_()`), and an image that took its time. */
function arriveWatch_() {
  if (typeof MutationObserver !== 'function' || !document.body) return;
  new MutationObserver(ms => {
    const t = performance.now();
    ms.forEach(m => {
      let was = false;
      m.removedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('loading')) was = true; });
      let words = false;
      m.addedNodes.forEach(n => {
        if (n.nodeType === 3 && was && n.textContent.trim()) words = true;
        if (n.nodeType !== 1) return;
        if (was && !m.target.classList.contains('pane')) arrive_(n);
        if (n.tagName === 'IMG') n.arriveT = t;
        else if (n.firstElementChild) n.querySelectorAll('img').forEach(i => { i.arriveT = t; });
      });
      /* A PANE THAT WAS ONLY THE DOTS had no frame (306), so the pane fades in, frame and all. */
      if (was && m.target.classList.contains('pane') && !m.target.querySelector(':scope > .loading')) arrive_(m.target);
      else if (words && !m.target.classList.contains('screen')) arrive_(m.target);
    });
  }).observe(document.body, { childList: true, subtree: true });
  /* A PICTURE THAT CAME FROM THE CACHE (inside 80ms) is shown as it is: fading it on every redraw would be a flicker. */
  document.addEventListener('load', e => {
    const i = e.target;
    if (i && i.tagName === 'IMG' && i.arriveT && performance.now() - i.arriveT > 80) arrive_(i);
  }, true);
}
if (document.body) arriveWatch_(); else document.addEventListener('DOMContentLoaded', arriveWatch_);
/* A COLUMN DRAWN AGAIN OVER PAGES THAT WERE WAITING (`paint`): what is new on them fades in; what was already there stays put. */
function arrivePages_(el, was) {
  if (!was) return;
  const pages = el.querySelectorAll(':scope > .page > .pane');
  was.forEach((html, i) => {
    const pane = pages[i];
    if (!pane) return;
    if (html === null) { if (!pane.querySelector(':scope > .loading')) arrive_(pane); return; }
    [].forEach.call(pane.children, card => {
      /* A WIDGET'S SLOT IS LEFT TO `loaded_`: one carried across the redraw is running, and fading it would flicker. */
      if (slotIn_(card) || html.indexOf(card.outerHTML) !== -1) return;
      if (!card.children.length) { arrive_(card); return; }
      [].forEach.call(card.children, k => { if (!slotIn_(k) && html.indexOf(k.outerHTML) === -1) arrive_(k); });
    });
  });
}
const slotIn_ = el => el.classList.contains('widget-slot') || !!el.querySelector('.widget-slot');
function waitingPages_(el) {
  if (!el.querySelector('.loading')) return null;
  const was = new Map();
  el.querySelectorAll(':scope > .page > .pane').forEach((pane, i) => {
    if (!pane.querySelector('.loading')) return;
    was.set(i, pane.querySelector(':scope > .loading:only-child') ? null : pane.innerHTML);
  });
  return was.size ? was : null;
}

/* ---------- AND WHEN IS THE PAYLOAD STILL ON ITS WAY: ONE ANSWER, ASKED BY EVERY CARD § */
function retrying_() {
  try { return !!LOAD_FAILED && typeof reconnecting_ === 'function' && reconnecting_(); }
  catch (e) { return false; }
}
function awaiting_() {
  try {
    if (!LOADED) return true;
    return retrying_() && !RECONNECT.shown;
  } catch (e) { return typeof LOADED !== 'undefined' && !LOADED; }
}
