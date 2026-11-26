/* @family. — shell.js ONE FILE, SPLIT. § */

/* ---------- ONE SINK FOR EVERY ERROR (R6, O5) ---------- */
/* Logged, a friendly line drawn in `host` if given, and one report per distinct message+where per visit — message, where, version, screen; never a name or an answer. */
const OOPS = { sent: new Set(), n: 0, max: 10, told: 0 };
function oopsDevice_() {
  try {
    let d = keep_.get('familyDevice');
    if (!d) { d = 'D' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); if (!keep_.put('familyDevice', d)) return 'nostore'; }
    return d;
  } catch (e) { return 'nostore'; }
}
function oopsHtml_() {
  return renderCard({ kind: 'oops', look: 'oops', tags: [{ text: 'This part did not load', colour: 0 }] });
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
    try { toast(text_('something-went-wrong-there')); } catch (e) { /* the report still goes */ }
  }
  const key = msg + '|' + where;
  if (OOPS.sent.has(key) || OOPS.n >= OOPS.max || typeof API !== 'string' || typeof fetch !== 'function' || typeof backendFetch_ !== 'function') return;
  OOPS.sent.add(key); OOPS.n++;
  const body = { action: 'clientError', message: msg, where: where, version: typeof SITE_VERSION === 'string' ? SITE_VERSION : '',
                 screen: typeof AT === 'string' ? AT : '', device: oopsDevice_() };
  try { backendFetch_(body, { quiet: true }); }
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
  if (!FIELD.on || FIELD.sent || typeof API !== 'string' || typeof fetch !== 'function' || typeof backendFetch_ !== 'function') return;
  FIELD.sent = true;
  let q = [];
  q = keep_.json('familyField', []);
  q.push(fieldRow_());
  if (q.length < 3 && !final) { if (!keep_.put('familyField', JSON.stringify(q.slice(-5)))) FIELD.lost = (FIELD.lost || 0) + 1; return; }
  if (!keep_.del('familyField')) FIELD.lost = (FIELD.lost || 0) + 1;
  try { backendFetch_({ action: 'healthLog', device: fieldDevice_(), rows: q.slice(-5) }, { quiet: true, keepalive: true }); }
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
const TIER_OFF_WIDGETS = [];
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
    return cardBlock_({ type: 'group', tag: 'p', look: 'note widget-off', text: say });
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

/* ONE SCROLLING PAGE (900): Find's sections in normal flow, scrolled by the browser; the sideways columns went 17 Nov (Find only). */
document.documentElement.classList.add('flow');

/* ---------- THE TABS § */
const TABS = [
  /* ONE SCREEN (owner, 16 Nov: Find is the only way around): every other column is a Find branch (screens-moved.json). */
  { id: 'stuff',   icon: '🔎', label: 'Find',    title: 'Find' },
];
/* SETTINGS ARE FIND › SETTINGS › <type>: each a card group Find draws (CARD_BUILD, find-doors.js), its cards keyed by id. */
/* THE GROUPS ARE the registry's `type:` rows (kinds.json setting.cards: col, label, admin), never a list here. */
const settingGroupList_ = () => { let t = {}; try { t = (DATA && DATA.settingFor) || {}; } catch (e) { t = {}; }
  return Object.keys(t).filter(k => /^type:/.test(k) && t[k].col).map(k => ({ id: t[k].col, label: t[k].label || '', admin: !!t[k].admin, cards: true, group: true })); };

/* A SETTINGS GROUP BY ID: its label and whether it is an admin's (me-roles.js, find-doors.js). */
const settingGroupOf_ = id => settingGroupList_().find(g => g.id === id) || null;

/* ---------- WHERE AN UNKNOWN ROUTE LANDS, NAMED RATHER THAN COUNTED § */
/* THE FIRST THING ANYBODY SEES IS FIND (1070): the core and the one front door; the other columns stand below it. */
const TAB_HOME = 'stuff';
/* WHERE AN OLD SCREEN'S NAME OPENS (461): its Find branch, `find:<door>[:<type> or :<field>=<value>]` — data/settings/screens-moved.json, the one table. */
function screenMoved_() { try { return (DATA && DATA.columnsMoved) || {}; } catch (e) { return {}; } }

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
let KEPT_GONE = '';
/* ---------- REMEMBERED FOR A RELOAD, NOT FOR TOMORROW § */
try {
  const kept = keep_.get('familyTab');
  const was = kept;
  const when = Number(keep_.get('familyTabAt') || 0);
  if (was && TABS.some(t => t.id === was) && when && Date.now() - when < AWAY_AGAIN) AT = was;
  /* A REMEMBERED COLUMN THAT IS A FIND BRANCH NOW (screens-moved.json `find:`) opens that branch once the payload is in (`loadFinish_`). */
  else if (was && when && Date.now() - when < AWAY_AGAIN) KEPT_GONE = was;
} catch { /* a bad stored tab opens the default one */ }
/* ---------- AND THE MOMENT IS WHEN YOU LEFT, NOT WHEN YOU ARRIVED § */
function tabStampLeft_() {
  if (keep_.get('familyTab') === AT) keep_.put('familyTabAt', String(Date.now()));
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
    return empty_('Couldn’t load.') + tileRow_(tile_({ icon: 'again', label: text_('try-again'), act: 'retry' }));
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
  return cardBlock_({ type: 'group', look: 'loading', attrs: { role: 'status', 'aria-label': 'Loading' }, blocks: [{ type: 'group', tag: 'span' }] });
}

/* EACH COLUMN'S SHAPE, KEPT ON THE DEVICE (700): page heights in px, no data, so a column waiting next visit holds its final size. */
const SHAPE_KEY = 'arrival:shape', SHAPE_PAGES = 6;
const shapeWidth_ = () => { try { return 'n' + innerWidth; } catch (e) { return ''; } };
function shapeAll_() { return keep_.json(SHAPE_KEY, {}); }
/* A SHAPE WITH NO HEIGHT IN IT (nothing laid out, as under jsdom) is no shape: the column keeps its one waiting page. */
function shapeOf_(id) { const w = shapeWidth_(), all = shapeAll_(), hs = all.at === w && all[id]; return Array.isArray(hs) && hs.some(h => h > 0) ? hs : null; }
/* A COLUMN WITH NO DRAWER YET: its remembered pages, each a quiet surface round the one loader; one page when it was never seen. */
function waitShape_(id) {
  const hs = shapeOf_(id) || [0];
  return hs.map(h => cardBlock_({ type: 'group', tag: 'section', look: 'page',
    blocks: [{ type: 'group', look: 'pane', attrs: h ? { 'data-keep': true, style: '--keep-h:' + h + 'px' } : null, inner: loading_() }] })).join('');
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
