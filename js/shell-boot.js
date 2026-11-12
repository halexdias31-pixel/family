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
  return card_('<div class="oops"><h3>This part did not load</h3></div>');
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
const TIER_LAZY_WIDGETS = ['timer', 'calendar', 'timetable', 'typing', 'console', 'wordgames', 'newspaper', 'spotify', 'favlinks', 'pixel'];
const TIER_OFF_WIDGETS = ['homework', 'flyers', 'cart', 'rewrite', 'poster'];
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
  ['start', 'draw', 'stop'].forEach(k => { if (typeof w[k] === 'function') w[k] = () => (k === 'draw' ? false : undefined); });
  Object.defineProperty(w, 'html', { configurable: true, enumerable: true, get() {
    const say = typeof brand === 'function' ? brand('widgetOff', 'Coming soon') : 'Coming soon';
    /* ITS WORDS ONLY: every host wraps a widget in its card, name and Suggest already, so a card here was a card in a card. */
    return `<p class="note widget-off">${esc(say)}</p>`;
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
  /* ---------- AND THE BUSINESS'S OWN PAPERWORK, LAST, FOR AN ADMIN AND NOBODY ELSE § */
  { id: 'biz', icon: '📋', label: 'Biz settings', title: 'Biz settings', admin: true, cards: true },
  /* ---------- AND THE SITE'S OWN SETTINGS, SPLIT FROM BUSINESS (491), FOR AN ADMIN AND NOBODY ELSE ---------- */
  { id: 'site', icon: '🌐', label: 'Web settings', title: 'Web settings', admin: true, cards: true },
];

/* ---------- LEFT TO RIGHT, WHICH IS NOT THE ORDER THEY ARE WRITTEN IN § */
/* GROUPED BY PURPOSE, read left to right (392). columns.json lists the same order; check-doors fails if they part. § */
const TAB_ORDER = ['stuff', 'saved',                                  /* FIND FIRST, for everyone (1070): the one front door; Tools and Games are Find cards (790) */
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
/* WHERE A SCREEN THAT MOVED LIVES (461): a column, or `find:<kind>[:<type>]` — data/settings/screens-moved.json, the one table. */
function screenMoved_() { try { return (DATA && DATA.columnsMoved) || {}; } catch (e) { return {}; } }
const screenNow_ = id => { const to = screenMoved_()[id]; return to && to.indexOf(':') < 0 ? to : id; };

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
  const was = kept && screenNow_(kept);
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
/* A SPINNING RING (owner, 12 Nov): one ring with a gap, turning forever; style.css draws it. */
function loading_() {
  return '<div class="loading" role="status" aria-label="Loading">'
    + '<span></span></div>';
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

/* A BOX PUT TO WAIT: busy, with the one loader first in it -- what loaded_() below undoes. */
function waiting_(el) {
  if (!el || !el.setAttribute) return;
  el.setAttribute('aria-busy', 'true');
  el.insertAdjacentHTML('afterbegin', loading_());
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
