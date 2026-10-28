/* @family. — layout.js THE ADMIN'S LAYOUT (462, 463): admin tiles on every widget move it up, down, across, or delete it, for everybody. */
/* One JSON value, config's `layout` row (`layoutSave`), sent as `layout`: unknown ids ignored, missing ones appended, a broken value ignored. */

/* ---------- WHICH COLUMN A WIDGET OF EACH KIND LIVES ON BY DEFAULT — the only columns that draw widgets ---------- */
const LAYOUT_COL = { reel: 'reel', tool: 'tools', game: 'games', shop: 'shop' };
/* THE DEVICE'S COPY of the last layout the payload sent, so the first paint before the payload is already arranged. */
const LAYOUT_STORE = 'familyLayout';
/* `#` joins a split card's piece to its card (`set:account:contact#email`, 466): a piece is a card of its own. */
const LAYOUT_ID = /^[A-Za-z0-9_:.#-]{1,64}$/;
/* NEVER DELETED: the basket, the one place a shop order is paid (Shop's `cart-open` lands on it). Settings and profiles are not widgets. */
const LAYOUT_KEEP = ['cart'];
/* A SPLITTABLE CARD'S ID: `set:<column>:<group>` for a settings card, `biz:<card>` for a Business one (464). */
const LAYOUT_SPLIT_ID = /^(set|biz):[A-Za-z0-9_:.-]{1,60}$/;
/* AN ADMIN'S OWN COLUMN (466): `custom-N`, made by ▶ on the last right-hand column, before Business; at most twelve. */
const CUSTOM_ID = /^custom-\d{1,3}$/;
const CUSTOM_MAX = 12;
/* NEVER MERGED — each needs the whole page: it is sized, zoomed or scrolled to the pane, and a second thing under it would be cut off or squeezed. */
/* A RULE (496): `whole-widgets` on the Rules card; Universal lets them merge like any widget. */
const wholeBars_ = x => (x in WIDGET_WHOLE) && (typeof ruleOn_ !== 'function' || ruleOn_('whole-widgets'));
/* A RULE (496), locked: `keep-basket`. */
const basketKept_ = x => LAYOUT_KEEP.indexOf(x) !== -1 && (typeof ruleOn_ !== 'function' || ruleOn_('keep-basket'));
const WIDGET_WHOLE = {
  console: 'a console screen sized to the whole page', boardgames: 'a board drawn to the whole page', wordgames: 'a game board drawn to the whole page',
  calculator: 'zoomed to fit the page and must keep its shape (472)', whiteboard: 'a drawing surface the size of the page', reels: 'a feed that scrolls the whole page',
};

/* ---------- ONE SHAPE, WHATEVER ARRIVED (a string, an object, rubbish) — or null ---------- */
/* A 462 value's `columns` and `hidden` are dropped (463): columns no longer move and nothing hides. */
/* A LAYOUT SAVED BEFORE 469 named `own:staff:picture` and `own:family:name`; each section has one id now. */
function ownIdNow_(x) {
  const m = /^own:(account|family|staff):([a-z]+)$/.exec(x), c = m && typeof OWN_SET_OF_SEC_ === 'function' ? OWN_SET_OF_SEC_(m[2]) : '';
  return c ? 'own:' + c + ':' + m[2] : x;
}
/* THE LAYOUT'S SHAPE NUMBER: 2 since 489's one-off repair below; `layoutClean_` (backend/core.gs) keeps the same rule. */
const LAYOUT_V = 2;
/* WHO SEES WHAT (497): the levels an admin may narrow a widget or card to, lowest first; `seenOk_` (words.js) asks them. */
const SEEN_ORDER = ['out', 'in', 'student', 'client', 'staff', 'admin'];
/* ONE-OFF (489): a layout older than v2 gets the camera back and the festive card deleted, as the owner meant; saved as v2, it never runs again. */
function layoutMigrate2_(o, deleted) {
  if ((Number(o.v) || 1) >= 2) return;
  const cam = deleted.indexOf('item:feed:camera');
  if (cam === -1) return;
  deleted.splice(cam, 1);
  if (deleted.indexOf('item:feed:festive') === -1) deleted.push('item:feed:festive');
}
function layoutSane_(v) {
  let o = v;
  try {
    if (typeof o === 'string') { if (!o.trim() || o.length > 8000) return null; o = JSON.parse(o); }
  } catch (e) { return null; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const ids = a => (Array.isArray(a) ? a : []).map(String).filter(x => LAYOUT_ID.test(x)).map(ownIdNow_)
    .filter((x, i, all) => all.indexOf(x) === i);
  const out = { v: LAYOUT_V, widgets: {}, deleted: ids(o.deleted) };
  layoutMigrate2_(o, out.deleted);
  const w = o.widgets && typeof o.widgets === 'object' && !Array.isArray(o.widgets) ? o.widgets : {};
  Object.keys(w).forEach(k => { if (LAYOUT_ID.test(k)) out.widgets[k] = ids(w[k]); });
  /* SPLIT CARDS (464): a settings or Business card drawn a field a card. */
  const split = ids(o.split).filter(x => LAYOUT_SPLIT_ID.test(x));
  if (split.length) out.split = split;
  /* CARDS ON THE RIGHT-HAND COLUMNS (465): `cards: {col: [ids]}`, only the columns that hold cards. */
  const c = o.cards && typeof o.cards === 'object' && !Array.isArray(o.cards) ? o.cards : {};
  const cards = {};
  /* CUSTOM COLUMNS (466): `custom: [{id: 'custom-N', title}]`, made by ▶ past the last right-hand column. */
  const cu = (Array.isArray(o.custom) ? o.custom : []).filter(x => x && typeof x === 'object' && CUSTOM_ID.test(String(x.id)))
    .map(x => ({ id: String(x.id), title: String(x.title == null ? '' : x.title).replace(/\s+/g, ' ').trim().slice(0, 40) || 'New column' }))
    .filter((x, i, all) => all.findIndex(y => y.id === x.id) === i).slice(0, CUSTOM_MAX);
  if (cu.length) out.custom = cu;
  const colOk = k => CARD_COLS.indexOf(k) !== -1 || cu.some(x => x.id === k);
  Object.keys(c).forEach(k => { if (colOk(k)) cards[k] = ids(c[k]).slice(0, 300); });
  /* A WIDGET COLUMN HAS A START HERE TOO (489): "why can't I make the 1st widget… for this page". */
  const startOk = k => colOk(k) || Object.keys(LAYOUT_COL).some(x => LAYOUT_COL[x] === k);
  if (Object.keys(cards).length) out.cards = cards;
  /* START HERE (465): `start: {col: cardId | 'person:<id>' | 'first-person'}`, where a column opens. */
  const st = o.start && typeof o.start === 'object' && !Array.isArray(o.start) ? o.start : {}, start = {};
  Object.keys(st).forEach(k => { if (startOk(k) && typeof st[k] === 'string' && LAYOUT_START_ID.test(st[k])) start[k] = st[k]; });
  if (Object.keys(start).length) out.start = start;
  /* MERGED CARDS (480): `merged: [[top, …, bottom]]`, two to twelve ids each, an id in one group only. */
  const mg = mergeSane_(o.merged);
  if (mg.length) out.merged = mg;
  /* FRONT DOOR (489): `front: {col, id}`, the one place everybody lands on opening the app. */
  const fr = o.front && typeof o.front === 'object' && !Array.isArray(o.front) ? o.front : null;
  if (fr && LAYOUT_ID.test(String(fr.col || '')) && LAYOUT_ID.test(String(fr.id || ''))) out.front = { col: String(fr.col), id: String(fr.id) };
  /* WHO SEES WHAT (497): `seen: {id: level}`, narrowing only; `layoutClean_` keeps the same rule. */
  const sn = o.seen && typeof o.seen === 'object' && !Array.isArray(o.seen) ? o.seen : {}, seen = {};
  Object.keys(sn).filter(k => LAYOUT_ID.test(k) && SEEN_ORDER.indexOf(sn[k]) !== -1).slice(0, 300).forEach(k => { seen[k] = sn[k]; });
  if (Object.keys(seen).length) out.seen = seen;
  return out;
}
const MERGE_MAX = 12;
function mergeSane_(v) {
  const used = {};
  return (Array.isArray(v) ? v : []).filter(Array.isArray).map(g => g.map(String).filter(x => LAYOUT_ID.test(x) && !used[x] && !wholeBars_(x))
    .filter((x, i, all) => all.indexOf(x) === i).slice(0, MERGE_MAX)).filter(g => g.length > 1 && g.every(x => (used[x] = 1))).slice(0, 100);
}

/* ---------- THE LAYOUT IN FORCE: the payload's once it has come, else the device's copy of the last one ---------- */
let LAYOUT_MEMO = { src: undefined, out: null };
let LAYOUT_KEPT = undefined;
function layoutKept_() {
  if (LAYOUT_KEPT !== undefined) return LAYOUT_KEPT;
  try { LAYOUT_KEPT = layoutSane_(localStorage.getItem(LAYOUT_STORE)); } catch (e) { LAYOUT_KEPT = null; }
  return LAYOUT_KEPT;
}
function layoutKeep_(L) {
  LAYOUT_KEPT = L || null;
  try { if (L) localStorage.setItem(LAYOUT_STORE, JSON.stringify(L)); else localStorage.removeItem(LAYOUT_STORE); } catch (e) {}
}
function layoutNow_() {
  let sent = false, src;
  try { sent = !!DATA && Object.prototype.hasOwnProperty.call(DATA, 'layout'); src = sent ? DATA.layout : undefined; } catch (e) { sent = false; }
  if (!sent) return layoutKept_();
  if (src === LAYOUT_MEMO.src) return LAYOUT_MEMO.out;
  const out = layoutSane_(src);
  LAYOUT_MEMO = { src: src, out: out };
  /* WRITTEN DOWN ONLY WHEN IT CHANGED, so a phone's next cold start is drawn the admin's way from the first frame. */
  if (JSON.stringify(out) !== JSON.stringify(layoutKept_())) layoutKeep_(out);
  return out;
}

/* ---------- THE WIDGET COLUMNS, LEFT TO RIGHT as the columns stand ---------- */
function layoutWidgetCols_() {
  const cols = Object.keys(LAYOUT_COL).map(k => LAYOUT_COL[k]);
  let seq = [];
  try { seq = COLUMNS.map(t => t.id); } catch (e) { seq = []; }
  return cols.slice().sort((a, b) => seq.indexOf(a) - seq.indexOf(b));
}

/* ---------- WHICH COLUMN A WIDGET IS ON ---------- */
function layoutHome_(w, L) {
  const def = LAYOUT_COL[w && w.kind];
  if (!def) return '';
  if (L) {
    const id = String(w.id);
    const cols = Object.keys(LAYOUT_COL).map(k => LAYOUT_COL[k]);
    for (const c of Object.keys(L.widgets || {})) if (cols.indexOf(c) !== -1 && L.widgets[c].indexOf(id) !== -1) return c;
  }
  return def;
}

/* ---------- THE WIDGETS ON ONE COLUMN, IN ORDER — `widgetsOf_` (arcade.js) asks, through `widgetFor_` after ---------- */
function layoutWidgetsIn_(col, all, L) {
  /* DELETED IS GONE EVERYWHERE — never drawn, started or paged. */
  const mine = all.filter(w => layoutHome_(w, L) === col && !(L && L.deleted.indexOf(String(w.id)) !== -1));
  const list = (L && L.widgets && L.widgets[col]) || [];
  return mine.map((w, i) => [w, i])
    .sort((a, b) => {
      const x = list.indexOf(String(a[0].id)), y = list.indexOf(String(b[0].id));
      return (x === -1 ? list.length + a[1] : x) - (y === -1 ? list.length + b[1] : y) || a[1] - b[1];
    }).map(p => p[0]);
}
function layoutWidgets_(kind, all) {
  const col = LAYOUT_COL[kind];
  const L = col ? layoutNow_() : null;
  if (!L) return all.filter(w => w.kind === kind);
  return layoutWidgetsIn_(col, all, L);
}

/* ---------- AFTER A CHANGE: every column out of date, the one in front drawn now ---------- */
function layoutRelayout_() {
  /* A CUSTOM COLUMN MADE OR GONE (466): the tab list and its sections first, then every column redrawn. */
  try { columnsFor_(); } catch (e) {}
  try { markStale_(TABS.map(t => t.id)); } catch (e) {}
  try { repaint(true); } catch (e) {}
}

/* THE WIDGETS AN ADMIN ARRANGES: the code's own (not a session's live widget), whatever audience each is for. */
function layoutAllWidgets_() {
  return (typeof WIDGETS !== 'undefined' ? WIDGETS : []).filter(w => LAYOUT_COL[w.kind]);
}
function layoutWidgetOf_(id) { return layoutAllWidgets_().find(w => String(w.id) === id); }
function layoutIsAdmin_() { return typeof rankAtLeast_ === 'function' && rankAtLeast_('admin'); }

/* THE WHOLE LAYOUT WRITTEN OUT from the one in force (the code's when `L` is null), so a move is a change to full lists. */
function layoutDraftOf_(L) {
  const widgets = {}, all = layoutAllWidgets_();
  layoutWidgetCols_().forEach(c => { widgets[c] = layoutWidgetsIn_(c, all, L).map(w => String(w.id)); });
  const out = { v: LAYOUT_V, widgets: widgets, deleted: L ? L.deleted.slice() : [] };
  if (L && L.front) out.front = Object.assign({}, L.front);
  if (L && L.split && L.split.length) out.split = L.split.slice();
  if (L && L.start) out.start = Object.assign({}, L.start);
  if (L && L.cards) { out.cards = {}; Object.keys(L.cards).forEach(c => { out.cards[c] = L.cards[c].slice(); }); }
  if (L && L.custom && L.custom.length) out.custom = L.custom.map(x => ({ id: x.id, title: x.title }));
  if (L && L.merged && L.merged.length) out.merged = L.merged.map(g => g.slice());
  if (L && L.seen) out.seen = Object.assign({}, L.seen);
  return out;
}
/* WHAT THE ADMIN SEES ON A COLUMN — a move steps over a widget they cannot see, or it would look like nothing happened. */
function layoutSeen_(col, D) {
  return (D.widgets[col] || []).filter(id => { const w = layoutWidgetOf_(id); return w && widgetFor_(w); });
}
function layoutColOf_(D, id) { return Object.keys(D.widgets).find(c => D.widgets[c].indexOf(id) !== -1) || ''; }

/* ---------- THE ADMIN'S GROUP AT THE END OF A WIDGET'S ONE TILE ROW: ▲ ▼ ◀ ▶ and Delete — drawn by `widgetOnColumn_` (arcade.js) ---------- */
function layoutTiles_(w) {
  if (!w || !LAYOUT_COL[w.kind] || !layoutIsAdmin_()) return '';
  const id = String(w.id), D = layoutDraftOf_(layoutNow_()), col = layoutColOf_(D, id);
  if (!col) return '';
  const units = mergeUnits_(layoutSeen_(col, D), D), ui = units.findIndex(u => u.indexOf(id) !== -1), cols = layoutWidgetCols_(), ci = cols.indexOf(col);
  const i = ui, seen = units, grp = mergedOf_(id, D);
  const up = ui > 0 && mergeOk_(units[ui - 1].concat(grp || [id]));
  return `<span class="tile-group is-admin wgt-admin">${
    tile_({ icon: 'up', label: 'Move up', act: 'lay-w-move', tone: 'admin', data: { w: id, d: -1 }, off: i <= 0 })}${
    tile_({ icon: 'down', label: 'Move down', act: 'lay-w-move', tone: 'admin', data: { w: id, d: 1 }, off: i === -1 || i >= seen.length - 1 })}${
    tile_({ icon: 'left', label: 'Move to previous column', act: 'lay-w-col', tone: 'admin', data: { w: id, d: -1 }, off: ci <= 0 })}${
    tile_({ icon: 'right', label: 'Move to next column', act: 'lay-w-col', tone: 'admin', data: { w: id, d: 1 }, off: ci >= cols.length - 1 })}${
    up ? tile_({ icon: 'merge', label: 'Merge with the card above', act: 'lay-merge', tone: 'admin', data: { m: id, col: col, w: 1 } }) : ''}${
    grp ? tile_({ icon: 'split', label: 'Split', note: 'back into its ' + grp.length + ' cards', act: 'lay-unmerge', tone: 'admin', data: { m: id } }) : ''}${
    startTile_(col, id, ((layoutNow_() || {}).start || {})[col] || '')}${
    frontTile_(col, id)}${wordsTiles_('w:' + id, id)}${
    notePair_(!(grp || [id]).some(basketKept_) ? tile_({ icon: 'bin', label: 'Delete', act: 'lay-w-del', tone: 'admin', data: { w: id }, cls: 'lay-del' }) : '',
      '')}</span>`;
}

/* ---------- A MOVE YOU CAN SEE (498): "add a transition so I can see where it goes" ----------
   Up or down: FLIP, drawn where it was and slid to where it is. Across: the column slides there and the thing is lit. */
const layCalm_ = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function layThing_(kind, id, col) {
  const host = col ? document.getElementById('s-' + col) : document;
  if (!host || !id) return null;
  const css = s => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));
  const el = kind === 'w' ? host.querySelector('#wgt-' + css(id)) : host.querySelector('[data-lay-for="' + css(id) + '"]');
  return el ? (el.closest('.card') || el.closest('.page')) : null;
}
function layLight_(el) {
  if (!el) return;
  el.classList.remove('lay-moved');
  void el.offsetWidth;
  el.classList.add('lay-moved');
  setTimeout(() => el.classList.remove('lay-moved'), 1400);
}
/* SAVE, THEN SHOW IT: `before` is where it stood; `to` the column it went to, when it went across. */
function layMoveShow_(kind, id, col, save, to) {
  const was = layThing_(kind, id, col), r0 = was && was.getBoundingClientRect();
  save();
  const after = () => {
    if (to && to !== col) {
      try { go(to); } catch (e) {}
      /* ITS PAGE BY THE PAGER, never scrollIntoView: the parked columns are off-canvas by design and a scroll would move the whole app. */
      setTimeout(() => {
        const el = layThing_(kind, id, to), pg = el && el.closest('.page'), host = document.getElementById('s-' + to);
        const n = pg && host ? [...host.querySelectorAll('.page')].indexOf(pg) : -1;
        if (n > -1) { try { goPage(to, n, layCalm_()); } catch (e) {} }
        layLight_(el);
      }, layCalm_() ? 0 : 420);
      return;
    }
    const el = layThing_(kind, id, col);
    if (!el) return;
    if (!r0 || layCalm_()) { layLight_(el); return; }
    const r1 = el.getBoundingClientRect(), dx = r0.left - r1.left, dy = r0.top - r1.top;
    if ((Math.abs(dx) < 1 && Math.abs(dy) < 1) || Math.abs(dx) > innerWidth) { layLight_(el); return; }
    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    void el.offsetWidth;
    el.style.transition = 'transform 320ms cubic-bezier(.2,.7,.2,1)';
    el.style.transform = '';
    setTimeout(() => { el.style.transition = ''; }, 360);
    layLight_(el);
  };
  try { requestAnimationFrame(after); } catch (e) { after(); }
}

/* ---------- THE MOVES: each one a change to the whole layout, saved at once ---------- */
on('lay-w-move', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-w'), d = Number(el.getAttribute('data-d'));
  const D = layoutDraftOf_(layoutNow_()), col = layoutColOf_(D, id);
  const units = mergeUnits_(layoutSeen_(col, D), D), ui = units.findIndex(u => u.indexOf(id) !== -1), next = units[ui + d];
  if (!col || ui === -1 || !next) return;
  D.widgets[col] = unitPlace_(D.widgets[col], mergeAll_(id, D), next, d);
  layMoveShow_('w', id, col, () => layoutSave_(D));
});
/* ACROSS: to the end of the neighbouring widget column. */
on('lay-w-col', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-w'), d = Number(el.getAttribute('data-d'));
  const D = layoutDraftOf_(layoutNow_()), col = layoutColOf_(D, id), cols = layoutWidgetCols_();
  const to = cols[cols.indexOf(col) + d];
  if (!col || !to || !D.widgets[to]) return;
  /* A MERGED CARD MOVES WHOLE (480). */
  const all = mergeAll_(id, D);
  Object.keys(D.widgets).forEach(c => { D.widgets[c] = D.widgets[c].filter(x => all.indexOf(x) === -1); });
  D.widgets[to] = D.widgets[to].concat(all);
  layMoveShow_('w', id, col, () => layoutSave_(D), to);
});
/* DELETE ASKS TWICE, IN PLACE, THEN IS FINAL (477): `deleted` only keeps it from being drawn again; there is no undo. */
on('lay-w-del', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-w');
  const all = mergeAll_(id, layoutNow_());
  if (all.some(basketKept_)) return;
  if (el.getAttribute('data-armed') !== '1') {
    const say = all.length > 1 ? 'Tap again to delete all ' + all.length + ' of its parts' : 'Tap again to delete';
    el.setAttribute('data-armed', '1');
    el.classList.add('is-armed');
    tileSet_(el, { label: say });
    const k = el.querySelector('.tile-i');
    if (k && !el.querySelector('.lay-again')) k.insertAdjacentHTML('afterend', `<span class="lay-again">${esc(say)}</span>`);
    clearTimeout(el.ARM_T);
    el.ARM_T = setTimeout(() => { if (el.isConnected) { el.removeAttribute('data-armed'); el.classList.remove('is-armed');
      tileSet_(el, { label: 'Delete' }); el.querySelector('.lay-again')?.remove(); } }, 3000);
    return;
  }
  const D = layoutDraftOf_(layoutNow_());
  Object.keys(D.widgets).forEach(c => { D.widgets[c] = D.widgets[c].filter(x => all.indexOf(x) === -1); });
  all.forEach(x => { if (D.deleted.indexOf(x) === -1) D.deleted.push(x); });
  layoutSave_(D);
});
/* ---------- SAVED FOR EVERYBODY, DRAWN AT ONCE, PUT BACK IF THE SHEET SAYS NO ---------- */
function layoutSave_(next) {
  if (!layoutIsAdmin_() || !next) return Promise.resolve(false);
  const was = layoutNow_();
  customPrune_(next); mergePrune_(next);
  const set = v => { try { DATA.layout = v; } catch (e) {} layoutKeep_(v); layoutRelayout_(); };
  const val = layoutSane_(next);
  set(val);
  return send({ action: 'layoutSave', personId: (USER && USER.personId) || '', layout: val })
    .then(() => true)
    .catch(err => { set(was); toast(String((err && err.message) || 'The layout did not save')); return false; });
}

/* ---------- SPLIT AND JOIN (464): an admin draws a card of several fields as a card a field, in the same place, for everybody § */
const splitId_ = (kind, a, b) => kind + ':' + [a, b].filter(Boolean).map(x => String(x).toLowerCase().replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '').slice(0, 28) || 'x').join(':');
function splitOn_(id) { const L = layoutNow_(); return !!(L && L.split && L.split.indexOf(id) !== -1); }
/* THE ADMIN'S TILE UNDER A SPLITTABLE CARD (Split) or under each of its pieces (Join); '' for anybody else. */
function splitTiles_(id, n) {
  if (!layoutIsAdmin_() || !LAYOUT_SPLIT_ID.test(id)) return '';
  if (!splitOn_(id) && !(n > 1)) return '';
  return `<div class="tile-row wgt-admin split-tiles">${splitOn_(id)
    ? tile_({ icon: 'merge', label: 'Join', note: 'gathers every piece back into one card', act: 'lay-join', tone: 'admin', data: { card: id } })
    : tile_({ icon: 'split', label: 'Split', note: 'a card a field', act: 'lay-split', tone: 'admin', data: { card: id } })}</div>`;
}
function splitSet_(id, on) {
  if (!layoutIsAdmin_() || !LAYOUT_SPLIT_ID.test(id)) return;
  const D = layoutDraftOf_(layoutNow_());
  const was = D.split || [];
  D.split = on ? (was.indexOf(id) === -1 ? was.concat([id]) : was) : was.filter(x => x !== id);
  if (!D.split.length) delete D.split;
  /* JOIN GATHERS THE PIECES BACK (466): wherever each was moved, deleted or started, the whole card returns to its card's place. */
  if (!on) {
    const mine = x => cardBase_(x) === id;
    Object.keys(D.cards || {}).forEach(c => { D.cards[c] = D.cards[c].filter(x => !mine(x)); if (!D.cards[c].length) delete D.cards[c]; });
    if (D.cards && !Object.keys(D.cards).length) delete D.cards;
    D.deleted = D.deleted.filter(x => !mine(x));
    if (D.start) { Object.keys(D.start).forEach(c => { if (mine(D.start[c])) delete D.start[c]; }); if (!Object.keys(D.start).length) delete D.start; }
  }
  layoutSave_(D);
}
on('lay-split', el => splitSet_(el.getAttribute('data-card') || '', true));
on('lay-join', el => splitSet_(el.getAttribute('data-card') || '', false));

/* ---------- CARDS ON THE RIGHT-HAND COLUMNS (465): ▲ ▼ ◀ ▶, Delete and Start here on every settings, profiles and Business card ---------- */
/* The owner: "I especially need them on the right-hand columns". A moved card is the same card, drawn by its own column's builder: one home still. */
const CARD_COLS = ['family', 'staff', 'account', 'tutors', 'students', 'parents', 'biz', 'site'];
/* THE ADMIN'S TWO COLUMNS (491): Business and Site; a card moves between them, and no other card moves onto either. */
const ADMIN_COLS_ = ['biz', 'site'];
const adminCol_ = c => ADMIN_COLS_.indexOf(c) !== -1;
/* A RULE (496), locked: `admin-cols` — Business and Site cards stay put and nothing else moves onto them. */
const adminKeep_ = (c, id) => !adminCol_(c) || adminCol_(cardHome0_(id)) || !(typeof ruleOn_ !== 'function' || ruleOn_('admin-cols'));
/* THE REGISTRY: id, own column, name, how its root is known (`re`; else `data-lay-card`/`data-split` or a `<!--card:id-->` mark), and `only`
   when it is the only place a setting is edited (Delete's second step says so). */
const CARD_REG = [
  { id: 'acct:signed-in', col: 'account', label: 'Signed in', re: /^<div class="card signed-in"/, say: 'Who you are signed in as on this phone, and Sign out.' },
  { id: 'acct:pin', col: 'account', label: 'Signing in', re: /data-do="pin-save"/, only: 'your PIN', say: 'Change the PIN you sign in with.' },
  { id: 'acct:roles', col: 'account', label: 'Your role', re: /^<div class="card roles-card/, only: 'your role', say: 'Whether this account is a student\'s or a parent\'s.' },
  { id: 'acct:notify', col: 'account', label: 'Notifications', re: /^<div class="card notify-card/, only: 'which emails you get', say: 'Which emails we send you.' },
  { id: 'acct:voice', col: 'account', label: 'Reading aloud', re: /^<div class="card voice-card/, say: 'How questions sound when they are read aloud on this device.' },
  { id: 'acct:prog-answered', col: 'account', label: 'Progress: answered', re: /^<div class="card prog-w prog-answered/, say: 'How many questions you have answered, and how many were right.' },
  { id: 'acct:prog-activity', col: 'account', label: 'Progress: activity', re: /^<div class="card prog-w prog-activity/, say: 'What you have done lately.' },
  { id: 'acct:prog-weakest', col: 'account', label: 'Progress: weakest topics', re: /^<div class="card prog-w prog-weakest/, say: 'The topics to practise next.' },
  { id: 'acct:prog-series', col: 'account', label: 'Papers and worksheets', re: /^<div class="card prog-w prog-series/, say: 'How far you are through each paper and worksheet.' },
  { id: 'acct:prog-grade', col: 'account', label: 'Progress: grade', re: /^<div class="card prog-w prog-grade/, say: 'A rough grade from the questions you have answered.' },
  { id: 'acct:prog-sessions', col: 'account', label: 'Progress: sessions', re: /^<div class="card prog-w prog-sessions/, say: 'Your booked and past sessions.' },
  { id: 'staff:hub', col: 'staff', label: 'Staff hub', re: /^<div class="card staff-top/, only: 'your rate and hours', say: 'Your terms, weekly hours, prices and statement as a tutor.' },
  { id: 'ppl:tutors:add', col: 'tutors', label: 'Add a tutor', say: 'Make an account for a new tutor.' },
  { id: 'ppl:tutors:dir', col: 'tutors', label: 'Tutor directory', say: 'Every tutor, with what they teach, where and when.' },
  { id: 'ppl:students:help', col: 'students', label: 'Needs help', say: 'Students who have asked for help with a question.' },
  { id: 'ppl:students:add', col: 'students', label: 'Add a student', say: 'Make an account for a new student.' },
  { id: 'ppl:students:search', col: 'students', label: 'Find by handle', say: 'Find a student by their handle, to add them as your child.' },
  { id: 'ppl:students:family', col: 'students', label: 'You and your family (students)', say: 'You and the children linked to you.' },
  { id: 'ppl:students:manage', col: 'students', label: 'Manage your child', say: 'Link your child\'s account to yours, or answer a link.' },
  { id: 'ppl:students:all', col: 'students', label: 'Every student', say: 'Every student account.' },
  { id: 'ppl:parents:add', col: 'parents', label: 'Add a parent', say: 'Make an account for a new parent.' },
  { id: 'ppl:parents:you', col: 'parents', label: 'Your card (Parent profiles)', say: 'Your own card as a parent.' },
  { id: 'ppl:parents:family', col: 'parents', label: 'You and your family (parents)', say: 'The parents linked to you.' },
  { id: 'ppl:parents:claims', col: 'parents', label: 'Parent claims', say: 'Parents asking to be linked to a child.' },
  { id: 'ppl:parents:all', col: 'parents', label: 'Every parent', say: 'Every parent account.' },
  { id: 'biz:profit-sum', col: 'biz', label: 'Profit', re: /data-profit="sum"/, say: 'What came in and went out, and what is left.' },
  { id: 'biz:setup', col: 'site', label: 'Setup', re: /^<div class="card setup-card/, say: 'What ran when the backend was last set up.' },
  { id: 'biz:posts', col: 'site', label: 'Posts waiting', re: /^<div class="card biz posts-wait/, say: 'Posts waiting for you to approve.' },
  { id: 'biz:apps', col: 'biz', label: 'Applications to teach', re: /^<div class="card biz apps/, say: 'People asking to teach, to approve or decline.' },
  { id: 'biz:staff', col: 'biz', label: 'Staff', re: /^<div class="card biz staff-card/, say: 'Who teaches, whether they agreed the terms, and their statements.' },
  { id: 'biz:reports', col: 'site', label: 'Suggestions', re: /^<div class="card biz reports/, say: 'Changes people have suggested, waiting for Confirm or Dismiss.' },
  { id: 'biz:libimp', col: 'site', label: 'Library import', re: /^<div class="card biz libimp/, say: 'Bring new questions and their words into the library.' },
  { id: 'site:digest', col: 'site', label: 'Weekly email', re: /^<div class="card biz digest-look/, say: 'How Sunday\'s email to parents looks, live.' },
  { id: 'site:digest-words', col: 'site', label: 'Weekly email\'s words', re: /^<div class="card biz digest-words/, only: 'the weekly email\'s words', say: 'The subject, greeting, first and last lines of Sunday\'s email.' },
  { id: 'site:rules', col: 'site', label: 'Rules', re: /^<div class="card biz rules-card/, only: 'the site\'s rules', say: 'Where the site does something differently. Universal makes it behave like everywhere else, for everybody; Undo takes back the last change.' },
  { id: 'site:inbox', col: 'site', label: 'Email', re: /^<div class="card biz inbox-card/, say: 'The admin Gmail, read-only.' },
  { id: 'biz:build', col: 'site', label: 'Build', re: /class="me-build"/, say: 'Which version of the site and backend is running.' },
].concat(ownSecReg_());
/* YOUR OWN CARD'S SECTIONS, A CARD EACH (468): `own:<col>:<section>`, the col the lowest rank it applies to, the same for everyone (469). */
function ownSecReg_() {
  const S = { picture: ['Picture', 'your picture', 'The picture beside your name.'], figure: ['Your figure', 'your figure', 'The figure that stands for you in games.'],
    name: ['Name', 'your name', 'Your first and last name.'], handle: ['Handle', 'your handle', 'The @name people find you by.'],
    rate: ['Rate and class size', 'your class size', 'Your rate, extra seats and how many in a class.'], headline: ['Headline', 'your headline', 'The line under your name on your tutor card.'],
    photos: ['Photographs', 'your photographs', 'The photos and video on your tutor card.'], words: ['Three words', 'your three words', 'Three words that describe you.'],
    glance: ['At a glance', 'your experience and ages', 'Your experience, the ages you teach and your hours.'], quals: ['Qualifications', 'your qualifications', 'What you are qualified in and teach.'],
    where: ['Where you teach', 'where you teach', 'The venues you teach at and how far you travel.'], week: ['Available', 'your weekly hours', 'The hours you can teach each week.'] };
  const of = OWN_SEC_OF_SET_;
  const where = { account: 'Student settings', family: 'Parent settings', staff: 'Tutor settings' };
  return [].concat(...Object.keys(of).map(c => of[c].map(k => ({ id: 'own:' + c + ':' + k, col: c, label: S[k][0] + ' (' + where[c] + ')', only: S[k][1], say: S[k][2] }))));
}
/* WHAT EACH CARD IS FOR, one faint line under its title (467) — the owner: "I should know what they are even if I can't edit." */
const CARD_SAY_DYN = { 'about-you': 'Your name and the details about you.', 'contact-address': 'How to reach you, and your address.',
  'photos': 'The photos and video on your tutor card.', 'your-rate-and-group-size': 'Your rate, extra seats and group sizes.',
  'qualifications': 'What you are qualified in and teach.', 'availability': 'The hours you can teach each week.',
  'where-you-teach': 'Where you teach and how far you travel.', 'about-you-as-a-tutor': 'Your headline, experience and the ages you teach.',
  'insurance': 'The business\'s insurance policies and when they renew.', 'tax': 'Tax registrations and when returns are due.',
  'legal-and-data': 'Data protection, privacy notice and terms, and when to review them.',
  'safeguarding': 'Safeguarding policy, DBS checks and training.', 'money-and-company': 'Bank, bookkeeping and company filings.',
  'profit-terms': 'The figures the profit sum is worked out from.' };
function cardSayOf_(id) {
  const r = cardReg_(id);
  if (r) return r.say || '';
  if (!/^(set|biz):/.test(String(id || ''))) return '';
  return CARD_SAY_DYN[String(id).split(':').pop()] || '';
}
/* THE LINE PUT IN: after the card's first title, else first inside it; a button card (+ Add) gets it as a span. */
function cardSayIn_(h, id) { return wordsIn_(id, cardSayIn0_(h, id)); }
function cardSayIn0_(h, id) {
  const say = cardSayOf_(id);
  /* AN EMPTY WIDGET STAYS ITS TITLE ALONE (414). */
  if (!say || /class="[^"]*card-say/.test(h) || /^\s*(?:<!--[^>]*-->)*\s*<div class="card[^"]*\bis-empty\b/.test(h)) return h;
  const head = (/^\s*(?:<!--[^>]*-->)*/.exec(h) || [''])[0], body = h.slice(head.length);
  if (/^\s*<button\b/.test(body)) return head + body.replace(/<\/button>\s*$/, `<span class="faint card-say">${esc(say)}</span></button>`);
  const p = `<p class="faint card-say">${esc(say)}</p>`;
  if (/<\/h3>/.test(body)) return head + body.replace(/<\/h3>/, '</h3>' + p);
  return head + body.replace(/^(\s*<div\b[^>]*>)/, '$1' + p);
}
const PROG_EMPTY_ = { 'Questions': 'acct:prog-answered', 'Recent activity': 'acct:prog-activity', 'Work on next': 'acct:prog-weakest',
  'Grade estimate': 'acct:prog-grade', 'Papers and worksheets': 'acct:prog-series', 'Sessions': 'acct:prog-sessions' };
const cardReg_ = id => CARD_REG.find(r => r.id === id);
/* A SETTINGS GROUP (`set:<col>:<group>`) or a Business record card (`biz:rec:<page>`, `biz:profit-terms`) is known by its id alone. */
/* A SPLIT CARD'S PIECE is `<card>#<field>` (466); a progress series card is `prog:series:<name>`. */
const CARD_DYN = /^(item:[a-z]+:[A-Za-z0-9_.-]{1,48}|(set:(family|staff|account):[A-Za-z0-9_:.-]+|biz:rec:[A-Za-z0-9_:.-]+|biz:profit-terms)(#[A-Za-z0-9_.-]{1,40})?|prog:series:[A-Za-z0-9_.-]{1,48})$/;
const cardIs_ = id => !!(cardReg_(id) || CARD_DYN.test(String(id || '')));
function cardHome0_(id) {
  const r = cardReg_(id);
  if (r) return r.col;
  const m = /^set:([a-z]+):/.exec(id);
  return m ? m[1] : /^biz:/.test(id) ? 'biz' : /^site:/.test(id) ? 'site' : /^prog:series:/.test(id) ? 'account' : '';
}
/* A PIECE'S CARD: `set:account:contact#email` is a piece of `set:account:contact`; '' for a whole card. */
const cardBase_ = id => { const i = String(id || '').indexOf('#'); return i === -1 ? '' : String(id).slice(0, i); };
const pieceId_ = (id, key) => id + '#' + (String(key || '').toLowerCase().replace(/[^a-z0-9_.-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'x');
/* EVERY COLUMN A CARD MAY STAND ON: the seven, then an admin's own (466). */
function cardCols_(L) {
  const cu = ((L === undefined ? layoutNow_() : L) || {}).custom || [];
  return CARD_COLS.concat(cu.map(x => x.id));
}
/* ITS NAME: the registry's, else the title it was last drawn with, else its id in words. */
const CARD_TITLE = {};
function cardLabel_(id) {
  const r = cardReg_(id);
  if (r) return r.label;
  if (CARD_TITLE[id]) return CARD_TITLE[id];
  const tail = String(id).split(':').pop().replace(/-/g, ' ');
  return tail.charAt(0).toUpperCase() + tail.slice(1);
}
function cardOnly_(id) {
  const r = cardReg_(id);
  if (r) return r.only || '';
  return /^(set:|biz:rec:)/.test(id) ? cardLabel_(id) : '';
}
/* A MARK FOR A CARD WITH NO ROOT OF ITS OWN (a people list is a page a person): each page carries the list's id. */
const cardMark_ = (id, list) => (list || []).filter(Boolean).map(h => '<!--card:' + id + '-->' + h);
/* AND A PERSON'S PAGE ITS PERSON, for Start here (`person:<id>`). */
const personMark_ = (pid, h) => h && pid ? '<!--person:' + String(pid).replace(/[^A-Za-z0-9_.-]/g, '') + '-->' + h : h;

/* WHICH CARD A PAGE IS — its mark, its `data-lay-card` or `data-split`, then the registry; '' for a column's own line (a padlock, a wait). */
function cardIdOf_(html) {
  const h = String(html || '');
  let m = /^\s*<!--card:([A-Za-z0-9_:.-]{1,64})-->/.exec(h);
  if (m) return m[1];
  /* A PIECE'S OWN ID (`data-lay-card`) BEFORE ITS CARD'S (`data-split`), so a piece is a card of its own (466). */
  const tag = (/^\s*<div[^>]*>/.exec(h) || [''])[0];
  m = /\sdata-lay-card="([^"]+)"/.exec(tag) || /\sdata-split="([^"]+)"/.exec(tag);
  if (m && cardIs_(m[1])) return m[1];
  const t = h.trim();
  /* AN EMPTY PROGRESS WIDGET IS ITS TITLE ALONE (414), so its title says which it is. */
  m = /^<div class="card prog-w is-empty"><h3>([^<]*)<\/h3>/.exec(t);
  if (m && PROG_EMPTY_[m[1]]) return PROG_EMPTY_[m[1]];
  const r = CARD_REG.find(x => x.re && x.re.test(t));
  return r ? r.id : '';
}
const personOf_ = h => ((/^\s*(?:<!--card:[^>]*-->)?<!--person:([A-Za-z0-9_.-]+)-->/.exec(String(h || '')) || [])[1]) || '';
/* EACH COLUMN'S OWN BUILDER — the code's cards for whoever is signed in, role gates and all. */
const CARD_BUILD = {
  family: () => familyPages_(), staff: () => staffPages_(), account: () => studentSetPages_(),
  tutors: () => peoplePages_('tutors'), students: () => peoplePages_('students'), parents: () => peoplePages_('parents'),
  biz: () => adminPages_(), site: () => sitePages_(),
};
/* THE CARD COLUMNS LEFT TO RIGHT; Business only for its own cards — anything else moved there would vanish for everyone but an admin. */
function cardColsFor_(id) {
  let seq = [];
  try { seq = COLUMNS.map(t => t.id); } catch (e) { seq = []; }
  return cardCols_().filter(c => seq.indexOf(c) !== -1 && adminKeep_(c, id))
    .sort((a, b) => seq.indexOf(a) - seq.indexOf(b));
}
function cardHome_(id, L) {
  const c = (L && L.cards) || {};
  for (const k of cardCols_(L)) if (c[k] && c[k].indexOf(id) !== -1 && adminKeep_(k, id)) return k;
  return cardHome0_(id);
}
function cardGroups_(raw) {
  const out = [];
  (raw || []).forEach(h => {
    if (!h) return;
    const id = cardIdOf_(h), last = out[out.length - 1];
    if (id && last && last.id === id) last.pages.push(h);
    else out.push({ id: id, pages: [h] });
  });
  return out;
}
const CARD_SEEN = {};
/* THE CARDS ON ONE COLUMN, IN ORDER: its own less those moved away or deleted, plus those moved here, drawn by their own column's builder. */
function cardArrange_(col, raw) {
  const L = layoutNow_();
  const del = (L && L.deleted) || [], list = (L && L.cards && L.cards[col]) || [];
  const built = { [col]: raw };
  const groupsIn = c => { if (!built[c]) { try { built[c] = (CARD_BUILD[c] ? CARD_BUILD[c]() || [] : []).filter(Boolean); } catch (e) { built[c] = []; } } return cardGroups_(built[c]); };
  const mine = groupsIn(col).map((g, i) => Object.assign(g, { i: i }))
    .filter(g => !g.id || (cardHome_(g.id, L) === col && del.indexOf(g.id) === -1 && seenOk_(g.id)));
  const n = mine.length;
  list.forEach((id, k) => {
    const from = cardHome0_(id);
    if (from === col || !CARD_BUILD[from] || cardHome_(id, L) !== col || del.indexOf(id) !== -1 || !seenOk_(id) || mine.some(g => g.id === id)) return;
    const g = groupsIn(from).find(x => x.id === id);
    if (g) mine.push(Object.assign(g, { i: n + k }));
  });
  const at = g => { const x = g.id ? list.indexOf(g.id) : -1; return x === -1 ? list.length + g.i : x; };
  let out = mine.sort((a, b) => at(a) - at(b) || a.i - b.i);
  /* A COLUMN'S BARE TITLE CARD IS FOR WHEN IT HOLDS NOTHING — not above a card moved into it. */
  if (out.some(g => g.id)) out = out.filter(g => g.id || !/^\s*<div class="card(?: people-none)?">\s*<h3>[^<]*<\/h3>(?:\s*<p[^>]*>[^<]*<\/p>)?\s*<\/div>\s*$/.test(g.pages.join('')));
  out.forEach(g => { if (g.id && !cardReg_(g.id)) { const m = /<h3[^>]*>([^<]{1,80})<\/h3>/.exec(g.pages[0]); if (m) CARD_TITLE[g.id] = m[1].trim(); } });
  CARD_SEEN[col] = out.filter(g => g.id).map(g => g.id);
  return cardMergeGroups_(out, L);
}
/* WHERE A COLUMN OPENS (Start here), as a page number of the column last drawn — `PAGE_HOME` asks. */
const CARD_START_AT = {};
const cardStartOf_ = (col, L) => { const s = L && L.start && L.start[col]; return typeof s === 'string' ? s : L && L.front && L.front.col === col ? L.front.id : ''; };
/* THE COLUMN DRAWN: unchanged when there is no layout of cards and nobody to arrange them; else arranged, an admin's row on each card. */
function cardsOf_(col) {
  const raw = (CARD_BUILD[col] ? CARD_BUILD[col]() : []).filter(Boolean);
  const L = layoutNow_(), admin = layoutIsAdmin_();
  delete CARD_START_AT[col];
  const strip = h => String(h).replace(/^\s*<!--card:[^>]*-->/, '').replace(/^\s*<!--person:[^>]*-->/, '');
  if (!admin && !(L && (L.cards || L.start || L.merged || L.seen || (L.deleted || []).some(cardIs_))))
    return cardGroups_(raw).reduce((a, g) => a.concat(g.pages.map((h, i) => {
      const page = strip(i === 0 && g.id ? cardSayIn_(h, g.id) : h);
      /* AND `Report` UNDER EVERY CARD THAT HAS AN ID (486), the last page of it — one row of its own. */
      const rep = g.id && i === g.pages.length - 1 && !personOf_(h) ? cardReportRow_(g.id, page) : '';
      return rep ? cardRowIn_(page, rep) : page;
    })), []);
  const groups = cardArrange_(col, raw);
  const start = cardStartOf_(col, L);
  const out = [];
  let firstP = -1;
  /* AN ADMIN'S OWN COLUMN OPENS ON ITS NAME, with Rename and Delete column (466); nobody else sees the line. */
  if (admin && cardCustom_(col)) out.push(customHead_(col));
  groups.forEach((g, gi) => {
    /* MERGE WITH THE CARD ABOVE (480): only a card of one page, under a card of one page — a page a person cannot be stacked. */
    const above = groups.slice(0, gi).reverse().find(x => x.id), one = x => x && (x.parts || x.pages.length === 1 || !(typeof ruleOn_ !== 'function' || ruleOn_('people-no-merge')));
    const row = admin && g.id ? cardAdminRow_(g.id, col, one(g) && one(above)) : '';
    if (g.parts) {
      if (start && g.merged.indexOf(start) !== -1) CARD_START_AT[col] = out.length;
      const body = g.parts.map(p => `<div class="merged-part" data-part="${esc(p.id)}">${p.pages.map((h, i) => strip(i === 0 ? cardSayIn_(h, p.id) : h)).join('')}</div>`).join('');
      out.push(`<div class="card is-merged" data-lay-card="${esc(g.id)}">${body}${row}</div>`);
      return;
    }
    const each = g.pages.length > 1 && /^(set|biz):/.test(g.id);
    g.pages.forEach((h, i) => {
      const pid = personOf_(h), at = out.length;
      if (pid && firstP === -1) firstP = at;
      if (start && ((g.id && start === g.id && i === 0) || (pid && start === 'person:' + pid))) CARD_START_AT[col] = at;
      let page = strip(i === 0 && g.id ? cardSayIn_(h, g.id) : h);
      /* THE CARD'S ROW FIRST, then the person's one Start here: appended after, the card row was spliced INSIDE the start row (467). */
      if (row && (each || i === g.pages.length - 1)) page = cardRowIn_(page, pid ? row.replace(/<button[^>]*data-do="lay-start"[\s\S]*?<\/button>/, '') : row);
      if (admin && pid) page = cardRowIn_(page, `<div class="tile-row wgt-admin start-tiles">${startTile_(col, 'person:' + pid, start)}</div>`);
      out.push(page);
    });
  });
  if (start === 'first-person' && firstP !== -1) CARD_START_AT[col] = firstP;
  if (!out.length) return [`<div class="card"><h3>${esc(typeof tabLabel_ === 'function' ? tabLabel_(col, col) : col)}</h3></div>`];
  return out;
}
/* A HOUSE, NOT A FLAG (466): the owner, "I had no idea what it was" — the column's home is here. */
function startTile_(col, id, start, note) {
  return tile_({ icon: 'home', label: start === id ? 'Start here (on)' : 'Start here', note: note || '', act: 'lay-start', tone: 'admin',
    on: start === id, pressed: start === id, data: { lc: id, col: col } });
}
function cardRowIn_(h, row) {
  const t = h.replace(/\s+$/, '');
  /* ONLY WHEN THE LAST `</div>` CLOSES THE CARD: a page that is a card then a tile row took the row inside that row (467). */
  if (/^\s*<div\b[^>]*\sclass="(card|own-set)/.test(t) && /<\/div>$/.test(t)) {
    let depth = 0, end = -1;
    const re = /<(\/?)div\b[^>]*>/g;
    for (let m; (m = re.exec(t));) { depth += m[1] ? -1 : 1; if (!depth) { end = re.lastIndex; break; } }
    if (end === t.length) return t.slice(0, -6) + row + '</div>';
  }
  return h + row;
}
function cardAdminRow_(id, col, mergeable) {
  if (!layoutIsAdmin_()) return '';
  const L = layoutNow_(), seen = mergeUnits_(CARD_SEEN[col] || [], L), i = seen.findIndex(u => u.indexOf(id) !== -1), cols = cardColsFor_(id), ci = cols.indexOf(col);
  const grp = mergedOf_(id, L);
  const start = cardStartOf_(col, layoutNow_());
  return `<div class="tile-row wgt-admin card-admin" data-lay-for="${esc(id)}">${
    tile_({ icon: 'up', label: 'Move up', act: 'lay-c-move', tone: 'admin', data: { lc: id, col: col, d: -1 }, off: i <= 0 })}${
    tile_({ icon: 'down', label: 'Move down', act: 'lay-c-move', tone: 'admin', data: { lc: id, col: col, d: 1 }, off: i === -1 || i >= seen.length - 1 })}${
    tile_({ icon: 'left', label: 'Move to previous column', act: 'lay-c-col', tone: 'admin', data: { lc: id, col: col, d: -1 }, off: ci <= 0 })}${
    tile_({ icon: 'right', label: ci !== -1 && ci >= cols.length - 1 && !adminCol_(col) ? 'Move to a new column' : 'Move to next column', act: 'lay-c-col', tone: 'admin',
      data: { lc: id, col: col, d: 1 }, off: ci === -1 || (ci >= cols.length - 1 && (adminCol_(col) || !customRoom_())) })}${
    startTile_(col, id, start)}${
    frontTile_(col, id)}${wordsTiles_(id, id)}${
    mergeable && i > 0 ? tile_({ icon: 'merge', label: 'Merge with the card above', act: 'lay-merge', tone: 'admin', data: { m: id, col: col } }) : ''}${
    grp ? tile_({ icon: 'split', label: 'Split', note: 'back into its ' + grp.length + ' cards', act: 'lay-unmerge', tone: 'admin', data: { m: id } }) : ''}${
    typeof gameLockTile_ === 'function' ? gameLockTile_('k:' + id) : ''}${
    notePair_(tile_({ icon: 'bin', label: 'Delete', act: 'lay-c-del', tone: 'admin', data: { lc: id }, cls: 'lay-del' }),
      typeof suggestTile_ === 'function' ? suggestTile_('card', id, CARD_TITLE[id] || id) : '')}</div>`;
}
/* A CARD'S REPORT ROW FOR SOMEBODY WHO DOES NOT ARRANGE CARDS (486); an admin's is in `cardAdminRow_`. */
function cardReportRow_(id, page) {
  /* NOT ON A LOCKED CARD (467: nothing pressable) NOR AN EMPTY ONE (its title alone). */
  if (/^\s*(?:<!--[^>]*-->)*\s*<div class="card[^"]*\b(is-empty|is-locked)\b/.test(page)) return '';
  const t = typeof suggestTile_ === 'function' ? suggestTile_('card', id, CARD_TITLE[id] || ((/<h3[^>]*>([^<]{1,80})<\/h3>/.exec(page) || [])[1] || id).trim()) : '';
  return t ? `<div class="tile-row card-rep">${typeof gameLockTile_ === 'function' ? gameLockTile_('k:' + id) : ''}${t}</div>` : '';
}

/* A THING OFF THE CARD COLUMNS (487), `item:<col>:<name>`: Delete and Note for an admin, gone for everyone once deleted (477). No move: its column's code draws it. */
const itemGone_ = id => { try { return ((layoutNow_() || {}).deleted || []).indexOf(id) !== -1 || !seenOk_(id); } catch (e) { return false; } };
function itemMark_(id, col, html) {
  if (!html || itemGone_(id)) return '';
  /* ITS ID ON ITS OWN BOX (489), so a Delete is read from the thing it sits on and the front door can find it. */
  const h = wordsIn_(id, String(html)).replace(/^(\s*<div)\b/, `$1 data-item="${esc(id)}"`);
  if (!layoutIsAdmin_()) return h;
  /* A RULE (496), locked: `items-no-move` — Delete and the door only, marked `no-move`. */
  const still = typeof ruleOn_ !== 'function' || ruleOn_('items-no-move');
  return cardRowIn_(h, `<div class="tile-row wgt-admin card-admin item-admin${still ? ' no-move' : ''}" data-lay-for="${esc(id)}">${
    frontTile_(col, id)}${wordsTiles_(id, id)}${tile_({ icon: 'bin', label: 'Delete', act: 'lay-c-del', tone: 'admin', data: { lc: id }, cls: 'lay-del' })}</div>`);
}

/* ---------- FRONT DOOR (489): `front: {col, id}`, one for the site; the door tile on every widget, card and item sets it, again clears it ---------- */
const frontNow_ = () => { const f = (layoutNow_() || {}).front; return f && f.col && f.id ? f : null; };
function frontTile_(col, id) {
  if (!layoutIsAdmin_() || !col || !id) return '';
  const f = frontNow_(), on = !!(f && f.col === col && f.id === id);
  return tile_({ icon: 'door', label: on ? 'Front door (on)' : 'Front door', note: on ? 'everybody lands here' : 'land everybody here', act: 'lay-front', tone: 'admin',
    on: on, pressed: on, data: { lc: id, col: col } });
}
on('lay-front', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc'), col = el.getAttribute('data-col');
  if (!LAYOUT_ID.test(id || '') || !LAYOUT_ID.test(col || '')) return;
  const D = layoutDraftOf_(layoutNow_()), f = D.front;
  if (f && f.col === col && f.id === id) delete D.front; else D.front = { col: col, id: id };
  layoutSave_(D);
});
/* THE PAGE THE FRONT DOOR'S THING IS ON in its column, or -1: a widget by its column's order, an item by the feed's, a card by Start here's count. */
function frontPageOf_(col) {
  const L = layoutNow_() || {}, st = (L.start || {})[col], fr = frontNow_();
  const kind = Object.keys(LAYOUT_COL).find(k => LAYOUT_COL[k] === col);
  /* A WIDGET COLUMN'S OWN START HERE when the door is elsewhere. */
  const f = fr && fr.col === col ? fr : kind && st ? { col: col, id: st } : null;
  if (!f) return -1;
  if (kind && typeof widgetPagesOf_ === 'function') {
    const n = widgetPagesOf_(kind).findIndex(w => String(w.id) === f.id || (w.parts || []).some(p => String(p.id) === f.id));
    if (n !== -1) return n;
  }
  if (col === 'feed' && typeof feedCamAt_ === 'function') {
    if (f.id === 'item:feed:camera') return feedCamAt_();
  }
  const n = CARD_START_AT[col];
  return typeof n === 'number' && n >= 0 ? n : -1;
}
/* THE DOOR'S COLUMN OPENS ON ITS THING; every other column as before. */
function frontHomes_() {
  const cols = Object.keys(LAYOUT_COL).map(k => LAYOUT_COL[k]).concat(['feed', 'dm']).concat(CARD_COLS);
  cols.forEach(c => {
    const was = PAGE_HOME[c];
    PAGE_HOME[c] = () => { const n = frontPageOf_(c); if (n >= 0) return n; try { return was ? was() : 0; } catch (e) { return 0; } };
  });
}
/* A REMEMBERED COLUMN (shell.js, a reload within minutes) wins; otherwise the app opens at the door, once. */
const FRONT_KEPT = (() => { try { return AT !== TAB_HOME; } catch (e) { return true; } })();
let FRONT_GONE = false;
function frontGo_() {
  const f = frontNow_();
  if (FRONT_GONE || FRONT_KEPT || !f || !seenOk_(f.id)) return;
  if (!TABS.some(t => t.id === f.col)) return;
  FRONT_GONE = true;
  if (AT !== TAB_HOME && AT !== f.col) return;
  try { PAGE_OPENED[f.col] = false; } catch (e) {}
  if (AT !== f.col) go(f.col, false);
}

/* ---------- NOTES FOR CLAUDE (484, 494): made by Suggest a change now (submit.js); here the open ones and Done ----------
   Kept in the Ledger's `claude_notes` and the Drive file "Notes for Claude", where a session reads them. */
/* NO NOTES ARE LISTED ON THE SITE (498): the owner, "I don't even need to be able to tick or see old tasks" -- Claude marks them done (data/notes-done.json). */
/* DELETE THEN THE NOTE, in the one flow (487). */
function notePair_(del, note) { return del + note; }
/* IN PLACE OF THE THING (489): the box takes its footprint, its content hidden while writing; Cancel or Send gives it back. A message keeps its box under it. */
function boxInPlace_(el, html) {
  const thing = el.closest('.msg') ? null : el.closest('.card, .own-set, .post');
  if (!thing) return boxBeside_(el, html);
  thing.querySelectorAll(':scope > .rep-box').forEach(b => b.remove());
  const h = thing.getBoundingClientRect().height;
  thing.insertAdjacentHTML('beforeend', html);
  thing.classList.add('is-writing');
  if (h) thing.style.setProperty('--writing-h', Math.round(h) + 'px');
  return thing.lastElementChild;
}
/* A ROW OUTSIDE ITS THING (498): a Find card's row stands after its `.favwrap`; both are hidden and the box takes their place. A message keeps its box under it. */
const BOX_HID = new WeakMap();
function boxBeside_(el, html) {
  const msg = el.closest('.msg'), row = el.closest('.tile-row');
  if (msg || !row) { const at = msg || row; if (!at) return null; at.insertAdjacentHTML('afterend', html); return at.nextElementSibling; }
  const prev = row.previousElementSibling, hid = [row].concat(prev && prev.matches('.favwrap, .card, .fc') ? [prev] : []);
  if (row.nextElementSibling && row.nextElementSibling.classList.contains('rep-box')) row.nextElementSibling.remove();
  const h = hid.reduce((n, e) => n + e.getBoundingClientRect().height, 0);
  row.insertAdjacentHTML('afterend', html);
  const box = row.nextElementSibling;
  hid.forEach(e => { e.hidden = true; });
  box.classList.add('is-beside');
  if (h) box.style.minHeight = Math.round(h) + 'px';
  BOX_HID.set(box, hid);
  return box;
}
function boxOut_(box) {
  if (!box) return;
  const thing = box.parentElement;
  (BOX_HID.get(box) || []).forEach(e => { e.hidden = false; });
  box.remove();
  if (thing && thing.classList.contains('is-writing') && !thing.querySelector(':scope > .rep-box')) {
    thing.classList.remove('is-writing');
    thing.style.removeProperty('--writing-h');
  }
}
function cardListOf_(col, L) {
  if (!CARD_SEEN[col]) { try { cardArrange_(col, (CARD_BUILD[col]() || []).filter(Boolean)); } catch (e) {} }
  const seen = (CARD_SEEN[col] || []).slice(), had = (L && L.cards && L.cards[col]) || [];
  return seen.concat(had.filter(x => seen.indexOf(x) === -1));
}
function cardUnlist_(D, id) {
  Object.keys(D.cards || {}).forEach(c => { D.cards[c] = D.cards[c].filter(x => x !== id); if (!D.cards[c].length) delete D.cards[c]; });
  if (D.cards && !Object.keys(D.cards).length) delete D.cards;
}
on('lay-c-move', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc'), col = el.getAttribute('data-col'), d = Number(el.getAttribute('data-d'));
  const L = layoutNow_(), list = cardListOf_(col, L), seen = mergeUnits_(CARD_SEEN[col] || [], L);
  const ui = seen.findIndex(u => u.indexOf(id) !== -1), next = seen[ui + d];
  if (cardCols_(L).indexOf(col) === -1 || ui === -1 || !next) return;
  const D = layoutDraftOf_(L);
  D.cards = D.cards || {};
  D.cards[col] = unitPlace_(list, mergeAll_(id, L), next, d);
  layMoveShow_('c', id, col, () => layoutSave_(D));
});
/* ACROSS: to the end of the neighbouring card column — the same card, its one home moved with it. */
on('lay-c-col', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc'), col = el.getAttribute('data-col'), d = Number(el.getAttribute('data-d'));
  const cols = cardColsFor_(id), L = layoutNow_(), D = layoutDraftOf_(L);
  let to = cols[cols.indexOf(col) + d];
  if (cols.indexOf(col) === -1) return;
  /* ▶ PAST THE LAST RIGHT-HAND COLUMN MAKES A NEW ONE (466), before Business; ◀ from the first stays put. */
  if (!to && d > 0 && !adminCol_(col) && customRoom_()) {
    const cu = D.custom || [], n = cu.reduce((m, x) => Math.max(m, Number(x.id.slice(7)) || 0), 0) + 1;
    to = 'custom-' + n;
    D.custom = cu.concat([{ id: to, title: 'New column' }]);
  }
  if (!to) return;
  const all = mergeAll_(id, L), from = cardListOf_(col, L).filter(x => all.indexOf(x) === -1), there = cardListOf_(to, L).filter(x => all.indexOf(x) === -1);
  all.forEach(x => cardUnlist_(D, x));
  D.cards = D.cards || {};
  D.cards[col] = from;
  D.cards[to] = there.concat(all);
  layMoveShow_('c', id, col, () => layoutSave_(D), to);
});
/* DELETE ASKS TWICE, IN PLACE; the second step says when it is the only place a setting is edited — still one tap, never a pop-up. */
on('lay-c-del', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc');
  if (!cardIs_(id)) return;
  const all = mergeAll_(id, layoutNow_());
  if (el.getAttribute('data-armed') !== '1') {
    const only = all.map(cardOnly_).filter(Boolean).join(', ');
    const say = only ? 'Tap again — this removes the only place to edit ' + only : all.length > 1 ? 'Tap again to delete all ' + all.length + ' of its parts' : 'Tap again to delete';
    el.setAttribute('data-armed', '1');
    el.classList.add('is-armed');
    tileSet_(el, { label: say });
    const k = el.querySelector('.tile-i');
    if (k && !el.querySelector('.lay-again')) k.insertAdjacentHTML('afterend', `<span class="lay-again">${esc(say)}</span>`);
    clearTimeout(el.ARM_T);
    el.ARM_T = setTimeout(() => { if (el.isConnected) { el.removeAttribute('data-armed'); el.classList.remove('is-armed');
      tileSet_(el, { label: 'Delete' }); el.querySelector('.lay-again')?.remove(); } }, 3000);
    return;
  }
  const D = layoutDraftOf_(layoutNow_());
  all.forEach(x => { cardUnlist_(D, x); if (D.deleted.indexOf(x) === -1) D.deleted.push(x); });
  layoutSave_(D);
});
/* START HERE: the column opens on this card (or person, or "the first person"); pressed again, the default comes back. */
on('lay-start', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc'), col = el.getAttribute('data-col');
  if ((cardCols_().indexOf(col) === -1 && !Object.keys(LAYOUT_COL).some(k => LAYOUT_COL[k] === col)) || !LAYOUT_START_ID.test(id || '')) return;
  const D = layoutDraftOf_(layoutNow_());
  const s = Object.assign({}, D.start || {});
  if (s[col] === id) delete s[col]; else s[col] = id;
  if (Object.keys(s).length) D.start = s; else delete D.start;
  try { PAGE_OPENED[col] = false; } catch (e) {}
  layoutSave_(D);
});
const LAYOUT_START_ID = /^(first-person|person:[A-Za-z0-9_.-]{1,48}|[A-Za-z0-9_:.#-]{1,64})$/;
/* THE PAGER'S LANDING FOR EACH CARD COLUMN: Start here's page when it is drawn, else what it was before. */
CARD_COLS.forEach(c => {
  const was = PAGE_HOME[c];
  PAGE_HOME[c] = () => {
    const n = CARD_START_AT[c];
    if (typeof n === 'number' && n >= 0) return n;
    try { return was ? was() : 0; } catch (e) { return 0; }
  };
});
frontHomes_();
/* THE KEPT LAYOUT'S DOOR FROM THE FIRST FRAME, before the payload; `frontGo_` again once it has come (shell.js `load`). */
try { const f = frontNow_(); if (f && !FRONT_KEPT && TABS.some(t => t.id === f.col)) { AT = f.col; FRONT_GONE = true; } } catch (e) {}
/* FOR THE JOURNEYS: a column's arranged cards, and the page it opens on. */
function cardSeen_(col) { return (CARD_SEEN[col] || []).slice(); }
function cardStartAt_(col) { try { return PAGE_HOME[col](); } catch (e) { return 0; } }

/* ---------- AN ADMIN'S OWN COLUMNS (466): ▶ past the last right-hand column makes one, before Business, for everybody ---------- */
/* The owner: "moving right, right, right should eventually go into a new column." Its cards keep their own role gates. */
const CUSTOM_TABS = {};
const cardCustom_ = col => CUSTOM_ID.test(String(col || ''));
const customRoom_ = () => (((layoutNow_() || {}).custom) || []).length < CUSTOM_MAX;
/* INTO `COLUMNS` BEFORE BUSINESS, as the layout in force names them — `columnsFor_` (shell.js) asks first, every time. */
function customTabsSync_() {
  const want = ((layoutNow_() || {}).custom) || [];
  for (let i = COLUMNS.length - 1; i >= 0; i--) if (COLUMNS[i].custom) COLUMNS.splice(i, 1);
  let at = COLUMNS.findIndex(t => t.id === 'biz');
  if (at === -1) at = COLUMNS.length;
  want.forEach((c, k) => {
    const t = CUSTOM_TABS[c.id] || (CUSTOM_TABS[c.id] = { id: c.id, icon: '▦', custom: true });
    t.label = t.title = c.title;
    COLUMNS.splice(at + k, 0, t);
    if (!SCREENS[c.id]) screen(c.id, () => pages(c.id, cardsOf_(c.id)));
    if (!PAGE_HOME[c.id]) PAGE_HOME[c.id] = () => { const n = CARD_START_AT[c.id]; return typeof n === 'number' && n >= 0 ? n : 0; };
  });
}
/* AN EMPTY CUSTOM COLUMN GOES, at every save: the last card moved or deleted out of it takes the column with it. */
function customPrune_(D) {
  if (!D || !D.custom) return D;
  const del = D.deleted || [];
  D.custom = D.custom.filter(x => ((D.cards || {})[x.id] || []).some(id => del.indexOf(id) === -1));
  const gone = id => !D.custom.some(x => x.id === id) && cardCustom_(id);
  Object.keys(D.cards || {}).forEach(c => { if (gone(c)) delete D.cards[c]; });
  if (D.start) Object.keys(D.start).forEach(c => { if (gone(c)) delete D.start[c]; });
  if (!D.custom.length) delete D.custom;
  return D;
}
/* ITS FIRST LINE, AN ADMIN'S: the name as a one-line form, Rename, and Delete column (its cards go home). */
function customHead_(col) {
  const c = (((layoutNow_() || {}).custom) || []).find(x => x.id === col) || { title: 'New column' };
  return `<div class="card custom-head" data-custom-col="${esc(col)}"><label class="field"><span>Column name</span>
    <input class="lay-col-name" maxlength="40" value="${esc(c.title)}" aria-label="Column name"></label>
    <div class="tile-row wgt-admin card-admin">${
      tile_({ icon: 'edit', label: 'Rename', note: 'this column', act: 'lay-col-rename', tone: 'admin', data: { col: col } })}${
      tile_({ icon: 'bin', label: 'Delete column', note: 'its cards go back home', act: 'lay-col-del', tone: 'admin', data: { col: col }, cls: 'lay-del' })}</div></div>`;
}
on('lay-col-rename', el => {
  if (!layoutIsAdmin_()) return;
  const col = el.getAttribute('data-col'), box = el.closest('.custom-head')?.querySelector('.lay-col-name');
  const title = String((box && box.value) || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  const D = layoutDraftOf_(layoutNow_()), c = (D.custom || []).find(x => x.id === col);
  if (!c || !title || title === c.title) return;
  c.title = title;
  layoutSave_(D);
});
on('lay-col-del', el => {
  if (!layoutIsAdmin_()) return;
  const col = el.getAttribute('data-col'), D = layoutDraftOf_(layoutNow_());
  if (!(D.custom || []).some(x => x.id === col)) return;
  if (el.getAttribute('data-armed') !== '1') {
    el.setAttribute('data-armed', '1'); el.classList.add('is-armed'); tileSet_(el, { label: 'Tap again to delete this column' });
    clearTimeout(el.ARM_T);
    el.ARM_T = setTimeout(() => { if (el.isConnected) { el.removeAttribute('data-armed'); el.classList.remove('is-armed'); tileSet_(el, { label: 'Delete column' }); } }, 3000);
    return;
  }
  if (D.cards) delete D.cards[col];
  D.custom = D.custom.filter(x => x.id !== col);
  layoutSave_(D);
});

/* ---------- MERGE WITH THE CARD ABOVE (480): any two neighbours in a column become one card, for everybody; again, and three are one */
/* The owner: "each item to be mergeable with another item… merge with the item above only, and then once that becomes one widget, I can merge with the item above again". */
function mergedOf_(id, L) {
  const M = ((L === undefined ? layoutNow_() : L) || {}).merged;
  return (M && M.find(g => g.indexOf(id) !== -1)) || null;
}
const mergeAll_ = (id, L) => (mergedOf_(id, L) || [id]).slice();
const mergeOk_ = ids => ids.length <= MERGE_MAX && !ids.some(wholeBars_);
/* A COLUMN'S IDS AS ITS UNITS: a merged card's parts gathered at the first one drawn, in the merged order. */
function mergeUnits_(ids, L) {
  const out = [], at = {};
  (ids || []).forEach(id => { const g = mergedOf_(id, L); if (!g) return out.push([id]); if (at[g[0]]) at[g[0]].push(id); else out.push(at[g[0]] = [id]); });
  out.forEach(u => { const g = mergedOf_(u[0], L); if (g) u.sort((a, b) => g.indexOf(a) - g.indexOf(b)); });
  return out;
}
/* A UNIT MOVED PAST ITS NEIGHBOUR UNIT, its parts kept together. */
function unitPlace_(list, move, next, d) {
  const rest = list.filter(x => move.indexOf(x) === -1), anchor = d > 0 ? next[next.length - 1] : next[0];
  let at = rest.indexOf(anchor);
  at = at === -1 ? rest.length : at + (d > 0 ? 1 : 0);
  rest.splice(at, 0, ...move.filter(x => list.indexOf(x) !== -1));
  return rest;
}
/* A COLUMN'S CARD GROUPS WITH EACH MERGED CARD'S PARTS IN ONE — what a viewer cannot see is simply absent; one part left is a plain card. */
function cardMergeGroups_(groups, L) {
  if (!L || !L.merged) return groups;
  const res = [], at = {};
  groups.forEach(g => {
    const m = g.id && mergedOf_(g.id, L);
    if (!m) return res.push(g);
    if (at[m[0]]) at[m[0]].parts.push(g); else res.push(at[m[0]] = { id: g.id, parts: [g], merged: m, i: g.i });
  });
  return res.map(c => {
    if (!c.parts) return c;
    c.parts.sort((a, b) => c.merged.indexOf(a.id) - c.merged.indexOf(b.id));
    if (c.parts.length === 1) return c.parts[0];
    c.id = c.parts[0].id;
    c.pages = [c.parts.map(p => p.pages.join('')).join('')];
    return c;
  });
}
/* A WIDGET COLUMN'S PAGES (`widgetPagesOf_`, arcade.js): each merged card's visible widgets as one `{parts}`. */
function layoutMergeWidgets_(list) {
  const L = layoutNow_();
  if (!L || !L.merged) return list;
  const res = [], at = {};
  list.forEach(w => {
    const m = mergedOf_(String(w.id), L);
    if (!m) return res.push(w);
    if (at[m[0]]) at[m[0]].parts.push(w); else res.push(at[m[0]] = { parts: [w], merged: m });
  });
  return res.map(c => {
    if (!c.parts) return c;
    c.parts.sort((a, b) => c.merged.indexOf(String(a.id)) - c.merged.indexOf(String(b.id)));
    return c.parts.length === 1 ? c.parts[0] : Object.assign(c, { id: c.parts[0].id, kind: c.parts[0].kind, name: c.parts.map(w => w.name || '').join(' · ') });
  });
}
/* AT EVERY SAVE: a deleted part leaves its group, and a group of one is no group. */
function mergePrune_(D) {
  if (!D || !D.merged) return D;
  const del = D.deleted || [];
  D.merged = D.merged.map(g => g.filter(x => del.indexOf(x) === -1)).filter(g => g.length > 1);
  if (!D.merged.length) delete D.merged;
  return D;
}
on('lay-merge', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-m'), col = el.getAttribute('data-col'), isW = el.getAttribute('data-w') === '1';
  const L = layoutNow_(), D = layoutDraftOf_(L);
  const seen = isW ? layoutSeen_(col, D) : (CARD_SEEN[col] || []);
  const units = mergeUnits_(seen, D), ui = units.findIndex(u => u.indexOf(id) !== -1), above = units[ui - 1];
  if (ui < 1 || !above) return;
  const up = mergeAll_(above[0], D), mine = mergeAll_(id, D), g = up.concat(mine.filter(x => up.indexOf(x) === -1));
  if (!mergeOk_(g)) return;
  D.merged = (D.merged || []).filter(x => !x.some(y => g.indexOf(y) !== -1)).concat([g]);
  layoutSave_(D);
});
/* SPLIT: the parts stand apart again where they are — arranging, not undoing. */
on('lay-unmerge', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-m'), D = layoutDraftOf_(layoutNow_());
  if (!mergedOf_(id, D)) return;
  D.merged = D.merged.filter(g => g.indexOf(id) === -1);
  if (!D.merged.length) delete D.merged;
  layoutSave_(D);
});
/* FOR THE JOURNEYS: the merged groups in force. */
function mergedNow_() { return (((layoutNow_() || {}).merged) || []).map(g => g.slice()); }
