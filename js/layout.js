/* @family. — layout.js EDIT LAYOUT (462): an admin moves, hides and deletes widgets and moves columns, for everybody. */
/* One JSON value, config's `layout` row (`layoutSave`), sent as `layout`: unknown ids ignored, missing ones appended, a broken value ignored. */

/* ---------- WHICH COLUMN A WIDGET OF EACH KIND LIVES ON BY DEFAULT — the only columns that draw widgets ---------- */
const LAYOUT_COL = { reel: 'reel', tool: 'tools', game: 'games', shop: 'shop' };
/* THE DEVICE'S COPY of the last layout the payload sent, so the first paint before the payload is already arranged. */
const LAYOUT_STORE = 'familyLayout';
const LAYOUT_ID = /^[A-Za-z0-9_:.-]{1,64}$/;
/* THE EDITOR'S STATE while it is open: the draft, the column shown, the saved value it started from. */
let LAYOUT_EDIT = null;
/* A PRESS BEING HELD (`hold`) AND THE THING BEING DRAGGED (`drag`) on the board. */
const LAY_PTR = { hold: null, drag: null, edgeT: 0, edgeSide: 0, swallow: false };

/* ---------- ONE SHAPE, WHATEVER ARRIVED (a string, an object, rubbish) — or null ---------- */
function layoutSane_(v) {
  let o = v;
  try {
    if (typeof o === 'string') { if (!o.trim() || o.length > 8000) return null; o = JSON.parse(o); }
  } catch (e) { return null; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const ids = a => (Array.isArray(a) ? a : []).map(String).filter(x => LAYOUT_ID.test(x))
    .filter((x, i, all) => all.indexOf(x) === i);
  const out = { v: 1, columns: ids(o.columns), widgets: {}, hidden: ids(o.hidden), deleted: ids(o.deleted) };
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

/* ---------- THE ORDER: the layout's ids that exist, then every other in the code's order ---------- */
function layoutOrder_(defaults, want) {
  if (!want || !want.length) return defaults.slice();
  const listed = want.filter((id, i) => defaults.indexOf(id) !== -1 && want.indexOf(id) === i);
  return listed.concat(defaults.filter(id => listed.indexOf(id) === -1));
}

/* ---------- THE COLUMNS, laid over `base` (the sheet's or the code's) into `COLUMNS` — `applyColumns_` asks ---------- */
function layoutColumns_(base, L) {
  const lay = L === undefined ? layoutNow_() : L;
  const ids = layoutOrder_(base.map(t => t.id), lay && lay.columns);
  const by = {};
  base.forEach(t => { by[t.id] = t; });
  COLUMNS.length = 0;
  ids.forEach(id => COLUMNS.push(by[id]));
}

/* ---------- THE WIDGET COLUMNS, LEFT TO RIGHT as the columns now stand ---------- */
function layoutWidgetCols_(order) {
  const cols = Object.keys(LAYOUT_COL).map(k => LAYOUT_COL[k]);
  const seq = order || COLUMNS.map(t => t.id);
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
function layoutWidgetsIn_(col, all, L, withHidden) {
  /* DELETED IS GONE EVERYWHERE — never drawn, started or paged; hidden is gone from the column only, and the editor still lists it. */
  const mine = all.filter(w => layoutHome_(w, L) === col && !(L && L.deleted.indexOf(String(w.id)) !== -1)
    && (withHidden || !L || L.hidden.indexOf(String(w.id)) === -1));
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
  return layoutWidgetsIn_(col, all, L, false);
}

/* ---------- AFTER A CHANGE: the columns again, every column out of date, the one in front drawn now ---------- */
function layoutRelayout_() {
  try { applyColumns_(); } catch (e) {}
  try { if (!TABS.some(t => t.id === AT)) AT = (TABS.find(t => t.id === TAB_HOME) || TABS[0]).id; } catch (e) {}
  try { markStale_(TABS.map(t => t.id)); } catch (e) {}
  try { repaint(true); } catch (e) {}
}

/* ---------- THE EDITOR: a mode over the whole app with its own Done bar; nothing behind it is pressed or swiped ---------- */

/* THE WIDGETS AN ADMIN ARRANGES: the code's own (not a session's live widget), whatever audience each is for. */
function layoutAllWidgets_() {
  return (typeof WIDGETS !== 'undefined' ? WIDGETS : []).filter(w => LAYOUT_COL[w.kind]);
}

/* THE DRAFT, written out whole from a layout (or the code's defaults when `L` is null). */
function layoutDraftOf_(L) {
  const base = TABS_BUILT.filter(t => COLUMNS.indexOf(t) !== -1 || t.admin);
  let rows = [];
  try { rows = (DATA && DATA.columns) || []; } catch (e) { rows = []; }
  const sheet = rows.map(r => String(r.screen || '').trim()).filter(id => base.some(t => t.id === id));
  const start = sheet.length ? sheet.concat(base.map(t => t.id).filter(id => sheet.indexOf(id) === -1)) : base.map(t => t.id);
  const columns = layoutOrder_(start, L && L.columns);
  const widgets = {};
  const all = layoutAllWidgets_();
  layoutWidgetCols_(columns).forEach(c => { widgets[c] = layoutWidgetsIn_(c, all, L, true).map(w => String(w.id)); });
  return { v: 1, columns: columns, widgets: widgets, hidden: L ? L.hidden.slice() : [], deleted: L ? L.deleted.slice() : [] };
}

function layoutTabOf_(id) { return TABS_BUILT.find(t => t.id === id) || { id: id, label: id, icon: '' }; }
function layoutWidgetOf_(id) { return layoutAllWidgets_().find(w => String(w.id) === id); }

function layoutEditOpen_() {
  if (!(typeof rankAtLeast_ === 'function' && rankAtLeast_('admin'))) return;
  const L = layoutNow_();
  const draft = layoutDraftOf_(L);
  const col = layoutWidgetCols_(draft.columns).indexOf(AT) !== -1 ? AT : 'tools';
  LAYOUT_EDIT = { draft: draft, col: col, from: JSON.stringify(layoutDraftOf_(L)), reset: false, was: L };
  let b = document.getElementById('layout-board');
  if (!b) {
    b = document.createElement('div');
    b.id = 'layout-board';
    b.className = 'layout-board';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Edit layout');
    document.body.appendChild(b);
    layoutWire_(b);
  }
  document.body.classList.add('is-laying-out');
  layoutDraw_();
}

function layoutEditClose_() {
  const b = document.getElementById('layout-board');
  if (b) b.remove();
  document.body.classList.remove('is-laying-out');
  LAYOUT_EDIT = null;
  LAY_PTR.hold = null; LAY_PTR.drag = null;
}

/* ---------- THE BOARD, DRAWN FROM THE DRAFT ---------- */
function layoutDraw_() {
  const b = document.getElementById('layout-board');
  if (!b || !LAYOUT_EDIT) return;
  const E = LAYOUT_EDIT, D = E.draft;
  const wcols = layoutWidgetCols_(D.columns);
  const chips = D.columns.map(id => {
    const t = layoutTabOf_(id);
    return `<button type="button" class="lay-chip${id === E.col ? ' on' : ''}${wcols.indexOf(id) !== -1 ? ' has-widgets' : ''}"
      data-do="lay-col" data-col="${esc(id)}" aria-pressed="${id === E.col ? 'true' : 'false'}" role="listitem"
      ><span class="lay-chip-i" aria-hidden="true">${esc(t.icon || '')}</span><span class="lay-chip-k">${esc(t.label || id)}</span></button>`;
  }).join('');
  const at = D.columns.indexOf(E.col);
  const t = layoutTabOf_(E.col);
  const colRow = `<div class="lay-colrow"><span class="lay-colname">${esc(t.label || E.col)}${E.col === TAB_HOME ? ' · where the app opens' : ''}${t.admin ? ' · admin only' : ''}</span>
    <div class="tile-row">${tile_({ icon: 'left', label: 'Move column left', act: 'lay-col-move', data: { d: -1 }, off: at <= 0 })}${
      tile_({ icon: 'right', label: 'Move column right', act: 'lay-col-move', data: { d: 1 }, off: at >= D.columns.length - 1 })}</div></div>`;
  b.innerHTML = `<div class="lay-bar"><h2>Edit layout</h2><div class="tile-row">${
      tile_({ icon: 'undo', label: 'Reset layout', act: 'layout-reset' })}${tile_({ icon: 'tick', label: 'Done', act: 'layout-done', cls: 'lay-done' })}</div></div>
    <p class="faint lay-say">Hold a widget or a column and drag it. Drag a widget to a column's name, or to the edge, to move it there.</p>
    <div class="lay-cols" role="list" aria-label="Columns">${chips}</div>
    ${colRow}
    <div class="lay-grid" role="list" aria-label="Widgets on ${esc(t.label || E.col)}">${layoutGridHtml_()}</div>
    ${layoutDeletedHtml_()}`;
}

function layoutGridHtml_() {
  const E = LAYOUT_EDIT, D = E.draft;
  const wcols = layoutWidgetCols_(D.columns);
  if (wcols.indexOf(E.col) === -1) return `<p class="faint lay-none">This column draws its own cards; only its place can move.</p>`;
  const ids = D.widgets[E.col] || [];
  if (!ids.length) return `<p class="faint lay-none">No widgets here. Drag one onto this column's name.</p>`;
  const ci = wcols.indexOf(E.col);
  const opts = wcols.map(c => `<option value="${esc(c)}"${c === E.col ? ' selected' : ''}>${esc(layoutTabOf_(c).label || c)}</option>`).join('');
  return ids.map((id, i) => {
    const w = layoutWidgetOf_(id);
    const hid = D.hidden.indexOf(id) !== -1;
    return `<div class="lay-w${hid ? ' is-hidden' : ''}" data-w="${esc(id)}" role="listitem">
      <div class="lay-w-name">${esc((w && w.name) || id)}${hid ? ' <span class="faint">· hidden</span>' : ''}</div>
      <div class="tile-row">${
        tile_({ icon: 'up', label: 'Move up', act: 'lay-w-move', data: { w: id, d: -1 }, off: i === 0 })}${
        tile_({ icon: 'down', label: 'Move down', act: 'lay-w-move', data: { w: id, d: 1 }, off: i === ids.length - 1 })}${
        tile_({ icon: 'left', label: 'To the column on the left', act: 'lay-w-col', data: { w: id, d: -1 }, off: ci <= 0 })}${
        tile_({ icon: 'right', label: 'To the column on the right', act: 'lay-w-col', data: { w: id, d: 1 }, off: ci >= wcols.length - 1 })}${
        tile_({ icon: hid ? 'show' : 'hide', label: hid ? 'Show' : 'Hide', act: 'lay-w-hide', data: { w: id } })}${
        LAYOUT_KEEP.indexOf(id) === -1 ? tile_({ icon: 'bin', label: 'Delete', act: 'lay-w-del', data: { w: id }, cls: 'lay-del' }) : ''}</div>
      <label class="field lay-to"><span>Move to</span><select data-lay-to="${esc(id)}" aria-label="Move ${esc((w && w.name) || id)} to">${opts}</select></label>
    </div>`;
  }).join('');
}

/* ---------- DELETED WIDGETS: one line, a native select and Add back, to its default column ---------- */
function layoutDeletedHtml_() {
  const D = LAYOUT_EDIT.draft;
  if (!D.deleted.length) return '';
  const opts = D.deleted.map(id => { const w = layoutWidgetOf_(id);
    return `<option value="${esc(id)}">${esc((w && w.name) || id)}</option>`; }).join('');
  return `<div class="lay-deleted"><label class="field lay-to"><span>Deleted widgets</span><select class="lay-del-pick" aria-label="Deleted widgets">${opts}</select></label>
    <div class="tile-row">${tile_({ icon: 'undo', label: 'Add back', act: 'lay-w-undel' })}</div></div>`;
}

/* ---------- THE MOVES, each a change to the draft and a redraw ---------- */
function layoutTouched_() { if (LAYOUT_EDIT) LAYOUT_EDIT.reset = false; }
function layoutMoveCol_(id, d) {
  const c = LAYOUT_EDIT.draft.columns, i = c.indexOf(id), j = i + d;
  if (i < 0 || j < 0 || j >= c.length) return;
  c.splice(i, 1); c.splice(j, 0, id);
  layoutTouched_();
}
function layoutMoveW_(id, d) {
  const list = LAYOUT_EDIT.draft.widgets[LAYOUT_EDIT.col] || [], i = list.indexOf(id), j = i + d;
  if (i < 0 || j < 0 || j >= list.length) return;
  list.splice(i, 1); list.splice(j, 0, id);
  layoutTouched_();
}
/* TO ANOTHER COLUMN, at `at` (its end when not given). */
function layoutWTo_(id, col, at) {
  const W = LAYOUT_EDIT.draft.widgets;
  if (!W[col]) return;
  Object.keys(W).forEach(c => { const i = W[c].indexOf(id); if (i !== -1) W[c].splice(i, 1); });
  const n = at == null ? W[col].length : Math.max(0, Math.min(at, W[col].length));
  W[col].splice(n, 0, id);
  layoutTouched_();
}

on('layout-edit', () => layoutEditOpen_());
on('lay-col', el => {
  if (!LAYOUT_EDIT || LAY_PTR.swallow) return;
  LAYOUT_EDIT.col = el.getAttribute('data-col');
  layoutDraw_();
});
on('lay-col-move', el => { if (!LAYOUT_EDIT) return; layoutMoveCol_(LAYOUT_EDIT.col, Number(el.getAttribute('data-d'))); layoutDraw_(); });
on('lay-w-move', el => { if (!LAYOUT_EDIT) return; layoutMoveW_(el.getAttribute('data-w'), Number(el.getAttribute('data-d'))); layoutDraw_(); });
on('lay-w-col', el => {
  if (!LAYOUT_EDIT) return;
  const cols = layoutWidgetCols_(LAYOUT_EDIT.draft.columns);
  const to = cols[cols.indexOf(LAYOUT_EDIT.col) + Number(el.getAttribute('data-d'))];
  if (to) layoutWTo_(el.getAttribute('data-w'), to);
  layoutDraw_();
});
on('lay-w-hide', el => {
  if (!LAYOUT_EDIT) return;
  const id = el.getAttribute('data-w'), h = LAYOUT_EDIT.draft.hidden, i = h.indexOf(id);
  if (i === -1) h.push(id); else h.splice(i, 1);
  layoutTouched_();
  layoutDraw_();
});
/* NEVER DELETED: the basket, the one place a shop order is paid (Shop's `cart-open` lands on it). Settings and profiles are not widgets. */
const LAYOUT_KEEP = ['cart'];
/* DELETE ASKS TWICE, IN PLACE: the tile says "Tap again to delete" for three seconds — never a pop-up. */
on('lay-w-del', el => {
  if (!LAYOUT_EDIT) return;
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
  const D = LAYOUT_EDIT.draft;
  Object.keys(D.widgets).forEach(c => { const i = D.widgets[c].indexOf(id); if (i !== -1) D.widgets[c].splice(i, 1); });
  D.hidden = D.hidden.filter(x => x !== id);
  if (D.deleted.indexOf(id) === -1) D.deleted.push(id);
  layoutTouched_();
  layoutDraw_();
});
on('lay-w-undel', () => {
  if (!LAYOUT_EDIT) return;
  const s = document.querySelector('#layout-board .lay-del-pick');
  const id = s && s.value, D = LAYOUT_EDIT.draft;
  if (!id) return;
  D.deleted = D.deleted.filter(x => x !== id);
  const w = layoutWidgetOf_(id), col = w && LAYOUT_COL[w.kind];
  if (col && D.widgets[col]) D.widgets[col].push(id);
  layoutTouched_();
  layoutDraw_();
});
document.addEventListener('change', e => {
  const s = e.target && e.target.closest && e.target.closest('select[data-lay-to]');
  if (!s || !LAYOUT_EDIT) return;
  layoutWTo_(s.getAttribute('data-lay-to'), s.value);
  layoutDraw_();
});

/* ---------- RESET: the editor's draft back to the code's order (saved at Done); outside it, saved at once ---------- */
on('layout-reset', () => {
  if (LAYOUT_EDIT) {
    LAYOUT_EDIT.draft = layoutDraftOf_(null);
    LAYOUT_EDIT.reset = true;
    layoutDraw_();
    return;
  }
  layoutSave_(null);
});

/* ---------- DONE: saved for everybody, drawn at once, put back if the sheet says no ---------- */
on('layout-done', () => {
  if (!LAYOUT_EDIT) return;
  const E = LAYOUT_EDIT;
  const same = JSON.stringify(E.draft) === E.from;
  layoutEditClose_();
  if (same && !E.reset) return;
  layoutSave_(E.reset ? null : E.draft);
});

function layoutSave_(next) {
  if (!(typeof rankAtLeast_ === 'function' && rankAtLeast_('admin'))) return Promise.resolve(false);
  const was = layoutNow_();
  const set = v => { try { DATA.layout = v; } catch (e) {} layoutKeep_(v); layoutRelayout_(); };
  set(next ? layoutSane_(next) : null);
  return send({ action: 'layoutSave', personId: (USER && USER.personId) || '',
    layout: next ? layoutSane_(next) : null, reset: next ? '' : 'TRUE' })
    .then(() => { toast(next ? 'Layout saved for everyone' : 'Layout back to the default'); return true; })
    .catch(err => { set(was); toast(String((err && err.message) || 'The layout did not save')); return false; });
}

/* ---------- DRAGGING: hold, then the widget or column follows the finger ---------- */
const LAY_HOLD_MS = 280, LAY_EDGE_PX = 28, LAY_EDGE_MS = 450;
function layoutWire_(b) {
  b.addEventListener('contextmenu', e => e.preventDefault());
  b.addEventListener('pointerdown', e => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const t = e.target;
    if (t.closest('button.tile, select, label.field')) return;
    const item = t.closest('.lay-w, .lay-chip');
    if (!item) return;
    const kind = item.classList.contains('lay-w') ? 'w' : 'col';
    const id = kind === 'w' ? item.getAttribute('data-w') : item.getAttribute('data-col');
    LAY_PTR.swallow = false;
    LAY_PTR.hold = { kind, id, x: e.clientX, y: e.clientY, pid: e.pointerId,
      t: setTimeout(() => layoutDragStart_(b), e.pointerType === 'mouse' ? 120 : LAY_HOLD_MS) };
  });
  b.addEventListener('pointermove', e => {
    const h = LAY_PTR.hold;
    if (h && !LAY_PTR.drag) {
      if (Math.abs(e.clientX - h.x) > 8 || Math.abs(e.clientY - h.y) > 8) { clearTimeout(h.t); LAY_PTR.hold = null; }
      return;
    }
    if (LAY_PTR.drag && e.pointerType !== 'touch') { e.preventDefault(); layoutDragMove_(e.clientX, e.clientY); }
  });
  const end = e => {
    /* A PHONE CANCELS THE POINTER OF A LONG PRESS; a finger's drag carries on by its touch events below. */
    if (e.type === 'pointercancel' && e.pointerType === 'touch' && LAY_PTR.drag) return;
    if (LAY_PTR.hold) { clearTimeout(LAY_PTR.hold.t); LAY_PTR.hold = null; }
    if (LAY_PTR.drag) layoutDragEnd_(e.type === 'pointercancel' ? null : { x: e.clientX, y: e.clientY });
  };
  b.addEventListener('pointerup', end);
  b.addEventListener('pointercancel', end);
  /* A FINGER'S TOUCHES GO ON TO THE ELEMENT IT FIRST TOUCHED even once it is drawn again and detached, so they are heard there. */
  b.addEventListener('touchstart', e => { layoutTouchOn_(e.target); }, { passive: true });
  /* THE APP BEHIND HEARS NOTHING from the board — no swipe, padlock, wheel or page turn. */
  ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'wheel'].forEach(type =>
    b.addEventListener(type, e => e.stopPropagation(), { passive: true }));
}

function layoutTouchOn_(el) {
  if (!el || el.LAY_TOUCH) return;
  el.LAY_TOUCH = true;
  el.addEventListener('touchmove', e => {
    const p = e.touches && e.touches[0];
    if (!LAY_PTR.drag || !p) return;
    if (e.cancelable) e.preventDefault();
    layoutDragMove_(p.clientX, p.clientY);
  }, { passive: false });
  const done = () => { if (LAY_PTR.drag) layoutDragEnd_({ x: LAY_PTR.drag.x, y: LAY_PTR.drag.y }); };
  el.addEventListener('touchend', done);
  el.addEventListener('touchcancel', done);
}

function layoutDragStart_(b) {
  const h = LAY_PTR.hold;
  if (!h || !LAYOUT_EDIT) return;
  LAY_PTR.hold = null;
  LAY_PTR.drag = { kind: h.kind, id: h.id, x: h.x, y: h.y, over: null };
  try { b.setPointerCapture(h.pid); } catch (e) {}
  try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {}
  layoutDragMark_();
  layoutGhost_(h.x, h.y);
}
function layoutDragEl_() {
  const d = LAY_PTR.drag, b = document.getElementById('layout-board');
  if (!d || !b) return null;
  return d.kind === 'w' ? b.querySelector(`.lay-w[data-w="${CSS.escape(d.id)}"]`) : b.querySelector(`.lay-chip[data-col="${CSS.escape(d.id)}"]`);
}
function layoutDragMark_() {
  const el = layoutDragEl_();
  if (el) el.classList.add('is-dragging');
  document.getElementById('layout-board')?.classList.add('is-dragging');
}
/* A COPY UNDER THE FINGER; the real one stays in the list as the gap it will drop into. */
function layoutGhost_(x, y) {
  let g = document.getElementById('lay-ghost');
  const el = layoutDragEl_();
  if (!g && el) {
    g = el.cloneNode(true);
    g.id = 'lay-ghost';
    g.classList.add('lay-ghost');
    g.classList.remove('is-dragging');
    g.setAttribute('aria-hidden', 'true');
    const r = el.getBoundingClientRect();
    g.style.width = r.width + 'px';
    LAY_PTR.drag.dx = x - r.left; LAY_PTR.drag.dy = y - r.top;
    document.body.appendChild(g);
  }
  if (g) g.style.transform = `translate(${Math.round(x - (LAY_PTR.drag.dx || 0))}px, ${Math.round(y - (LAY_PTR.drag.dy || 0))}px)`;
}
function layoutUnder_(x, y) {
  const g = document.getElementById('lay-ghost');
  if (g) g.style.display = 'none';
  const el = document.elementFromPoint(x, y);
  if (g) g.style.display = '';
  return el;
}

function layoutDragMove_(x, y) {
  const d = LAY_PTR.drag, E = LAYOUT_EDIT;
  if (!d || !E) return;
  d.x = x; d.y = y;
  layoutGhost_(x, y);
  const under = layoutUnder_(x, y);
  const chip = under && under.closest && under.closest('.lay-chip');
  document.querySelectorAll('.lay-chip.is-target').forEach(c => c.classList.remove('is-target'));
  d.target = '';
  if (d.kind === 'col') {
    if (chip && chip.getAttribute('data-col') !== d.id) {
      const c = E.draft.columns, to = c.indexOf(chip.getAttribute('data-col'));
      c.splice(c.indexOf(d.id), 1); c.splice(to, 0, d.id);
      layoutTouched_(); layoutDraw_(); layoutDragMark_();
    }
    return;
  }
  /* A WIDGET OVER A COLUMN'S NAME: that column lights, and a drop puts it there. */
  if (chip) {
    const c = chip.getAttribute('data-col');
    if (c !== E.col && layoutWidgetCols_(E.draft.columns).indexOf(c) !== -1) { chip.classList.add('is-target'); d.target = c; }
    layoutEdgeClear_();
    return;
  }
  /* OVER ANOTHER WIDGET: it takes that place. */
  const over = under && under.closest && under.closest('.lay-w');
  if (over && over.getAttribute('data-w') !== d.id) {
    const list = E.draft.widgets[E.col], to = list.indexOf(over.getAttribute('data-w'));
    if (to !== -1 && list.indexOf(d.id) !== -1) { list.splice(list.indexOf(d.id), 1); list.splice(to, 0, d.id); layoutTouched_(); layoutRegrid_(); }
  }
  /* AT THE EDGE, LIKE AN iPHONE'S PAGES: held there, the board turns to the next widget column and the widget goes with it. */
  const side = x < LAY_EDGE_PX ? -1 : x > innerWidth - LAY_EDGE_PX ? 1 : 0;
  if (!side) { layoutEdgeClear_(); return; }
  if (LAY_PTR.edgeSide === side && LAY_PTR.edgeT) return;
  layoutEdgeClear_();
  LAY_PTR.edgeSide = side;
  document.getElementById('layout-board')?.classList.add(side < 0 ? 'edge-l' : 'edge-r');
  LAY_PTR.edgeT = setTimeout(() => {
    LAY_PTR.edgeT = 0;
    if (!LAY_PTR.drag || !LAYOUT_EDIT) return;
    const cols = layoutWidgetCols_(LAYOUT_EDIT.draft.columns);
    const to = cols[cols.indexOf(LAYOUT_EDIT.col) + side];
    if (!to) return;
    layoutWTo_(LAY_PTR.drag.id, to, side < 0 ? undefined : 0);
    LAYOUT_EDIT.col = to;
    layoutDraw_(); layoutDragMark_();
    LAY_PTR.edgeSide = 0;
  }, LAY_EDGE_MS);
}
function layoutEdgeClear_() {
  clearTimeout(LAY_PTR.edgeT); LAY_PTR.edgeT = 0; LAY_PTR.edgeSide = 0;
  const b = document.getElementById('layout-board');
  if (b) b.classList.remove('edge-l', 'edge-r');
}
/* THE GRID ALONE, so the column names and the bar are not drawn again under the finger. */
function layoutRegrid_() {
  const g = document.querySelector('#layout-board .lay-grid');
  if (g) g.innerHTML = layoutGridHtml_();
  layoutDragMark_();
}

function layoutDragEnd_(at) {
  const d = LAY_PTR.drag, E = LAYOUT_EDIT;
  layoutEdgeClear_();
  LAY_PTR.drag = null;
  document.getElementById('lay-ghost')?.remove();
  /* THE CLICK THAT FOLLOWS A DRAG IS NOT A TAP on the column name it ended over. */
  LAY_PTR.swallow = true;
  setTimeout(() => { LAY_PTR.swallow = false; }, 400);
  /* THE COLUMN NAME LIT BY THE LAST MOVE is where it drops — a lifted finger's own position is not always reported. */
  if (d && E && at && d.kind === 'w' && d.target) layoutWTo_(d.id, d.target);
  document.getElementById('layout-board')?.classList.remove('is-dragging');
  layoutDraw_();
}

/* ---------- AND THE KEYS: an arrow or a page key does not turn the app behind the board ---------- */
addEventListener('keydown', e => {
  if (!LAYOUT_EDIT) return;
  const t = e.target;
  if (t && t.closest && t.closest('#layout-board select, #layout-board input')) return;
  if (/^(Arrow|Page|Home|End| )/.test(e.key)) e.stopImmediatePropagation();
}, true);

/* ---------- THE BUSINESS CARD: the way in, and Reset ---------- */
function layoutCard_() {
  if (!(typeof rankAtLeast_ === 'function' && rankAtLeast_('admin'))) return '';
  const L = layoutNow_();
  return `<div class="card layout-card"><h3>Layout</h3>
    <p class="faint">${L ? 'Your own order of columns and widgets, for everyone.' : 'The default order of columns and widgets.'}</p>
    <div class="tile-row">${tile_({ icon: 'edit', label: 'Edit layout', act: 'layout-edit' })}${
      L ? tile_({ icon: 'undo', label: 'Reset layout', act: 'layout-reset' }) : ''}</div></div>`;
}

/* AT LOAD, BEFORE THE FIRST PAINT: the device's copy of the last layout over the code's columns. */
try { applyColumns_(); } catch (e) {}
