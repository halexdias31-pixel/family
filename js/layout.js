/* @family. — layout.js THE ADMIN'S LAYOUT (462, 463): admin tiles on every widget move it up, down, across, or delete it, for everybody. */
/* One JSON value, config's `layout` row (`layoutSave`), sent as `layout`: unknown ids ignored, missing ones appended, a broken value ignored. */

/* ---------- WHICH COLUMN A WIDGET OF EACH KIND LIVES ON BY DEFAULT — the only columns that draw widgets ---------- */
const LAYOUT_COL = { reel: 'reel', tool: 'tools', game: 'games', shop: 'shop' };
/* THE DEVICE'S COPY of the last layout the payload sent, so the first paint before the payload is already arranged. */
const LAYOUT_STORE = 'familyLayout';
const LAYOUT_ID = /^[A-Za-z0-9_:.-]{1,64}$/;
/* NEVER DELETED: the basket, the one place a shop order is paid (Shop's `cart-open` lands on it). Settings and profiles are not widgets. */
const LAYOUT_KEEP = ['cart'];

/* ---------- ONE SHAPE, WHATEVER ARRIVED (a string, an object, rubbish) — or null ---------- */
/* A 462 value's `columns` and `hidden` are dropped (463): columns no longer move and nothing hides. */
function layoutSane_(v) {
  let o = v;
  try {
    if (typeof o === 'string') { if (!o.trim() || o.length > 8000) return null; o = JSON.parse(o); }
  } catch (e) { return null; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const ids = a => (Array.isArray(a) ? a : []).map(String).filter(x => LAYOUT_ID.test(x))
    .filter((x, i, all) => all.indexOf(x) === i);
  const out = { v: 1, widgets: {}, deleted: ids(o.deleted) };
  const w = o.widgets && typeof o.widgets === 'object' && !Array.isArray(o.widgets) ? o.widgets : {};
  Object.keys(w).forEach(k => { if (LAYOUT_ID.test(k)) out.widgets[k] = ids(w[k]); });
  return out;
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
  return { v: 1, widgets: widgets, deleted: L ? L.deleted.slice() : [] };
}
/* WHAT THE ADMIN SEES ON A COLUMN — a move steps over a widget they cannot see, or it would look like nothing happened. */
function layoutSeen_(col, D) {
  return (D.widgets[col] || []).filter(id => { const w = layoutWidgetOf_(id); return w && widgetFor_(w); });
}
function layoutColOf_(D, id) { return Object.keys(D.widgets).find(c => D.widgets[c].indexOf(id) !== -1) || ''; }

/* ---------- THE ADMIN'S ROW UNDER A WIDGET'S OWN TILES: ▲ ▼ ◀ ▶ and Delete — drawn by `widgetOnColumn_` (arcade.js) ---------- */
function layoutTiles_(w) {
  if (!w || !LAYOUT_COL[w.kind] || !layoutIsAdmin_()) return '';
  const id = String(w.id), D = layoutDraftOf_(layoutNow_()), col = layoutColOf_(D, id);
  if (!col) return '';
  const seen = layoutSeen_(col, D), i = seen.indexOf(id), cols = layoutWidgetCols_(), ci = cols.indexOf(col);
  return `<div class="tile-row wgt-admin">${
    tile_({ icon: 'up', label: 'Move up', act: 'lay-w-move', tone: 'admin', data: { w: id, d: -1 }, off: i <= 0 })}${
    tile_({ icon: 'down', label: 'Move down', act: 'lay-w-move', tone: 'admin', data: { w: id, d: 1 }, off: i === -1 || i >= seen.length - 1 })}${
    tile_({ icon: 'left', label: 'Move to previous column', act: 'lay-w-col', tone: 'admin', data: { w: id, d: -1 }, off: ci <= 0 })}${
    tile_({ icon: 'right', label: 'Move to next column', act: 'lay-w-col', tone: 'admin', data: { w: id, d: 1 }, off: ci >= cols.length - 1 })}${
    LAYOUT_KEEP.indexOf(id) === -1 ? tile_({ icon: 'bin', label: 'Delete', act: 'lay-w-del', tone: 'admin', data: { w: id }, cls: 'lay-del' }) : ''}</div>`;
}

/* ---------- THE MOVES: each one a change to the whole layout, saved at once ---------- */
on('lay-w-move', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-w'), d = Number(el.getAttribute('data-d'));
  const D = layoutDraftOf_(layoutNow_()), col = layoutColOf_(D, id);
  const seen = layoutSeen_(col, D), next = seen[seen.indexOf(id) + d];
  if (!col || !next) return;
  const list = D.widgets[col];
  list.splice(list.indexOf(id), 1);
  list.splice(list.indexOf(next) + (d > 0 ? 1 : 0), 0, id);
  layoutSave_(D);
});
/* ACROSS: to the end of the neighbouring widget column. */
on('lay-w-col', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-w'), d = Number(el.getAttribute('data-d'));
  const D = layoutDraftOf_(layoutNow_()), col = layoutColOf_(D, id), cols = layoutWidgetCols_();
  const to = cols[cols.indexOf(col) + d];
  if (!col || !to || !D.widgets[to]) return;
  D.widgets[col].splice(D.widgets[col].indexOf(id), 1);
  D.widgets[to].push(id);
  layoutSave_(D);
});
/* DELETE ASKS TWICE, IN PLACE: the tile says "Tap again to delete" for three seconds — never a pop-up. */
on('lay-w-del', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-w');
  if (LAYOUT_KEEP.indexOf(id) !== -1) return;
  if (el.getAttribute('data-armed') !== '1') {
    el.setAttribute('data-armed', '1');
    el.classList.add('is-armed');
    tileSet_(el, { label: 'Tap again to delete' });
    const k = el.querySelector('.tile-i');
    if (k && !el.querySelector('.lay-again')) k.insertAdjacentHTML('afterend', '<span class="lay-again">Tap again to delete</span>');
    clearTimeout(el.ARM_T);
    el.ARM_T = setTimeout(() => { if (el.isConnected) { el.removeAttribute('data-armed'); el.classList.remove('is-armed');
      tileSet_(el, { label: 'Delete' }); el.querySelector('.lay-again')?.remove(); } }, 3000);
    return;
  }
  const D = layoutDraftOf_(layoutNow_());
  Object.keys(D.widgets).forEach(c => { const i = D.widgets[c].indexOf(id); if (i !== -1) D.widgets[c].splice(i, 1); });
  if (D.deleted.indexOf(id) === -1) D.deleted.push(id);
  layoutSave_(D);
});
/* ADD BACK: to the end of its own default column. */
on('lay-w-undel', () => {
  if (!layoutIsAdmin_()) return;
  const s = document.querySelector('.layout-card .lay-del-pick');
  const id = s && s.value, L = layoutNow_();
  if (!id || !L) return;
  const D = layoutDraftOf_(L);
  D.deleted = D.deleted.filter(x => x !== id);
  const w = layoutWidgetOf_(id), col = w && LAYOUT_COL[w.kind];
  if (col && D.widgets[col]) D.widgets[col].push(id);
  layoutSave_(D);
});
on('layout-reset', () => { if (layoutIsAdmin_()) layoutSave_(null); });

/* ---------- SAVED FOR EVERYBODY, DRAWN AT ONCE, PUT BACK IF THE SHEET SAYS NO ---------- */
function layoutSave_(next) {
  if (!layoutIsAdmin_()) return Promise.resolve(false);
  const was = layoutNow_();
  const set = v => { try { DATA.layout = v; } catch (e) {} layoutKeep_(v); layoutRelayout_(); };
  const val = next ? layoutSane_(next) : null;
  set(val);
  return send({ action: 'layoutSave', personId: (USER && USER.personId) || '', layout: val, reset: next ? '' : 'TRUE' })
    .then(() => { if (!next) toast('Layout back to the default'); return true; })
    .catch(err => { set(was); toast(String((err && err.message) || 'The layout did not save')); return false; });
}

/* ---------- THE BUSINESS CARD: a deleted widget back, and Reset ---------- */
function layoutCard_() {
  if (!layoutIsAdmin_()) return '';
  const L = layoutNow_();
  const del = ((L && L.deleted) || []).filter(id => layoutWidgetOf_(id));
  const opts = del.map(id => `<option value="${esc(id)}">${esc((layoutWidgetOf_(id) || {}).name || id)}</option>`).join('');
  return `<div class="card layout-card"><h3>Layout</h3>
    <p class="faint">${L ? 'Your own order of widgets, for everyone.' : 'The default order of widgets.'} Each widget's admin tiles move or delete it.</p>
    ${del.length ? `<label class="field"><span>Deleted widgets</span><select class="lay-del-pick" aria-label="Deleted widgets">${opts}</select></label>` : ''}
    ${del.length || L ? `<div class="tile-row">${del.length ? tile_({ icon: 'undo', label: 'Add back', act: 'lay-w-undel' }) : ''}${
      L ? tile_({ icon: 'undo', label: 'Reset layout', act: 'layout-reset' }) : ''}</div>` : ''}</div>`;
}
