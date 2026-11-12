/* @family. — js/layout-moves.js AN ADMIN'S MOVES: the tiles that move a widget or card, the move you can see, and the save for everybody (cut from layout.js; read as one by tools/piece-src.js). */
/* ---------- THE ADMIN'S GROUP AT THE END OF A WIDGET'S ONE TILE ROW: ▲ ▼ ◀ ▶ and Delete, as tile_'s options grouped by `widgetOnColumn_` (arcade.js) ---------- */
function layoutOpts_(w) {
  if (!w || !isAdmin()) return null;
  /* A FIND CARD (790) IS PLACED BY THE FUNNEL, so it has no ▲ ▼ ◀ ▶: its words, who sees it and Delete, which are the widget's own. */
  if (typeof widgetInFind_ === 'function' && widgetInFind_(w)) {
    const id = String(w.id);
    return [wordsOpts_('w:' + id, id), { icon: 'bin', label: 'Delete', act: 'lay-w-del', tone: 'admin', data: { w: id }, cls: 'lay-del' }];
  }
  if (!LAYOUT_EDIT || !LAYOUT_COL[w.kind]) return null;
  const id = String(w.id), L = layoutNow_(), col = layoutHome_(w, L);
  if (!col) return null;
  /* THE COLUMN'S UNITS AS DRAWN (710), widgets and cards together, so ▲ ▼ step over a card as over a widget. */
  const units = mergeUnits_(CARD_SEEN[col] || layoutSeen_(col, layoutDraftOf_(L)), L), ui = units.findIndex(u => u.indexOf(id) !== -1);
  const grp = mergedOf_(id, L), above = ui > 0 ? units[ui - 1] : null;
  /* A MERGE IS OF ONE KIND: a widget with the widget above, never with a card. */
  const up = above && above.every(isWidgetId_) && mergeOk_(mergeAll_(above[0], L).concat(grp || [id]));
  return [{ icon: 'up', label: 'Move up', act: 'lay-w-move', tone: 'admin', data: { w: id, d: -1 }, off: ui <= 0 },
    { icon: 'down', label: 'Move down', act: 'lay-w-move', tone: 'admin', data: { w: id, d: 1 }, off: ui === -1 || ui >= units.length - 1 },
    acrossOpts_(id, col, true, { w: id }), ...colOpts_(col, id),
    up ? { icon: 'merge', label: 'Merge with the card above', act: 'lay-merge', tone: 'admin', data: { m: id, col: col, w: 1 } } : null,
    grp ? { icon: 'split', label: 'Split', note: 'back into its ' + grp.length + ' cards', act: 'lay-unmerge', tone: 'admin', data: { m: id } } : null,
    startOpts_(col, id, ((L || {}).start || {})[col] || ''), frontOpts_(col, id), wordsOpts_('w:' + id, id),
    !(grp || [id]).some(basketKept_) ? { icon: 'bin', label: 'Delete', act: 'lay-w-del', tone: 'admin', data: { w: id }, cls: 'lay-del' } : null];
}
/* ◀ ▶ FOR EVERY UNIT (710): the neighbouring column whatever it holds; past an edge, a new column. */
function acrossOpts_(id, col, isW, data) {
  /* EACH ACT SPELT AS check-doors reads it, so both pair with their handlers. */
  const act = isW ? { act: 'lay-w-col' }.act : { act: 'lay-c-col' }.act;
  const cols = cardColsFor_(id), ci = cols.indexOf(col), last = ci !== -1 && ci >= cols.length - 1, adm = adminCol_(col), room = customRoom_();
  return [{ icon: 'left', label: ci === 0 && !adm ? 'Move to a new column on the left' : 'Move to previous column', act: act, tone: 'admin',
      data: Object.assign({ col: col, d: -1 }, data), off: ci === -1 || (ci === 0 && (adm || !room)) },
    { icon: 'right', label: last ? (adm ? 'Move to a new admin-only column' : 'Move to a new column') : 'Move to next column', act: act, tone: 'admin',
      data: Object.assign({ col: col, d: 1 }, data), off: ci === -1 || (last && !room) },
    /* A NEW COLUMN BETWEEN TWO (730): the owner, "insert a column in between two columns" — made here, beside this one, holding this unit. */
    { icon: 'plus', label: 'Move to a new column here, on the left', act: 'lay-newcol', tone: 'admin', data: Object.assign({ col: col, d: -1 }, data), off: ci === -1 || !room },
    { icon: 'plus', label: 'Move to a new column here, on the right', act: 'lay-newcol', tone: 'admin', data: Object.assign({ col: col, d: 1 }, data), off: ci === -1 || !room }];
}
/* THE NEW COLUMN STANDS BESIDE `col` by the saved `order` (colOrderApply_); empty again, it goes like any custom column. */
function layNewCol_(id, col, d, kind) {
  if (!customRoom_() || cardColsFor_(id).indexOf(col) === -1) return;
  const L = layoutNow_(), D = layoutDraftOf_(L), cu = D.custom || [];
  const to = 'custom-' + (cu.reduce((m, x) => Math.max(m, Number(x.id.slice(7)) || 0), 0) + 1);
  D.custom = cu.concat([adminCol_(col) ? { id: to, admin: true } : { id: to }]);
  const all = mergeAll_(id, L), from = cardListOf_(col, L).filter(x => all.indexOf(x) === -1);
  all.forEach(x => cardUnlist_(D, x));
  Object.keys(D.widgets).forEach(c => { D.widgets[c] = D.widgets[c].filter(x => all.indexOf(x) === -1); });
  colOrderSet_(D, col, from);
  colOrderSet_(D, to, all);
  const ord = COLUMNS.map(t => t.id).filter(x => x !== to), at = ord.indexOf(col);
  ord.splice(d < 0 ? at : at + 1, 0, to);
  D.order = ord;
  layMoveShow_(kind, id, col, () => layoutSave_(D), to);
}
on('lay-newcol', el => {
  const w = el.getAttribute('data-w'), c = el.getAttribute('data-lc');
  layNewCol_(w || c || '', el.getAttribute('data-col') || '', Number(el.getAttribute('data-d')) || 0, w ? 'w' : 'c');
});
/* ---------- A MOVE YOU CAN SEE (498): "add a transition so I can see where it goes" ----------
   Up or down: FLIP, drawn where it was and slid to where it is. Across: the column slides there and the thing is lit. */
/* LESS MOTION is the app's one question, `motionOK_` (537): the ring still lights, as a ring, for `--dur-mark`. */
const layCalm_ = () => !motionOK_();
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
  /* OFF WHEN ITS RING ENDS; the timer only for a ring that never ran (an element not drawn), and one per element, so a second light is not cut short by the first's. */
  clearTimeout(el.layLitT);
  const off = () => { clearTimeout(el.layLitT); el.classList.remove('lay-moved'); };
  el.addEventListener('animationend', e => { if (e.animationName === 'lay-moved') off(); }, { once: true });
  el.layLitT = setTimeout(off, MOTION_.mark + 200);
}
/* SAVE, THEN SHOW IT: `before` is where it stood; `to` the column it went to, when it went across. */
/* THE OTHERS MAKE ROOM (710): "I should see the other widgets moving out of the way" — every unit on the column, read before and glided after. */
function layUnitsAt_(col) {
  const host = col && document.getElementById('s-' + col), out = new Map();
  if (!host) return out;
  host.querySelectorAll('.card-admin[data-lay-for], .widget-slot[id^="wgt-"]').forEach(x => {
    const el = x.closest('.card') || x.closest('.page'), k = x.getAttribute('data-lay-for') || x.id;
    if (el && !out.has(k)) out.set(k, el.getBoundingClientRect());
  });
  return out;
}
function layMakeRoom_(col, before, skip) {
  if (layCalm_() || !before.size) return;
  const host = document.getElementById('s-' + col);
  if (!host) return;
  host.querySelectorAll('.card-admin[data-lay-for], .widget-slot[id^="wgt-"]').forEach(x => {
    const k = x.getAttribute('data-lay-for') || x.id, r0 = before.get(k), el = x.closest('.card') || x.closest('.page');
    if (!r0 || !el || el === skip || typeof el.animate !== 'function') return;
    const r1 = el.getBoundingClientRect(), dx = r0.left - r1.left, dy = r0.top - r1.top, z = el.currentCSSZoom || 1;
    if ((Math.abs(dx) < 1 && Math.abs(dy) < 1) || Math.abs(dx) > innerWidth) return;
    el.animate([{ translate: `${dx / z}px ${dy / z}px` }, { translate: '0 0' }], { duration: MOTION_.move, easing: MOTION_.spring });
  });
}
function layMoveShow_(kind, id, col, save, to) {
  const was = layThing_(kind, id, col), r0 = was && was.getBoundingClientRect(), room = layUnitsAt_(col);
  save();
  const after = () => {
    if (to && to !== col) {
      try { go(to); } catch (e) { /* the column went mid-move: the layout is saved, the view stays */ }
      /* ITS PAGE BY THE PAGER, never scrollIntoView: the parked columns are off-canvas by design and a scroll would move the whole app. */
      setTimeout(() => {
        const el = layThing_(kind, id, to), pg = el && el.closest('.page'), host = document.getElementById('s-' + to);
        const n = pg && host ? [...host.querySelectorAll('.page')].indexOf(pg) : -1;
        if (n > -1) { try { goPage(to, n, layCalm_()); } catch (e) { /* the page went mid-move: the layout is saved, the view stays */ } }
        layLight_(el);
      }, layCalm_() ? 0 : MOTION_.move + 140);
      return;
    }
    const el = layThing_(kind, id, col);
    if (!el) return;
    layMakeRoom_(col, room, el);
    if (!r0 || layCalm_()) { layLight_(el); return; }
    /* ONE GLIDE AT A TIME, WAAPI (537): a move during a move starts from where the eye sees it (`r0`, read with the old glide running) and the old one is cancelled before the new place is read. */
    if (el.layGlide) { try { el.layGlide.cancel(); } catch (e) { /* already gone */ } el.layGlide = null; }
    const r1 = el.getBoundingClientRect(), dx = r0.left - r1.left, dy = r0.top - r1.top;
    if ((Math.abs(dx) < 1 && Math.abs(dy) < 1) || Math.abs(dx) > innerWidth || typeof el.animate !== 'function') { layLight_(el); return; }
    const z = el.currentCSSZoom || 1;
    el.layGlide = el.animate([{ translate: `${dx / z}px ${dy / z}px` }, { translate: '0 0' }],
                             { duration: MOTION_.move, easing: MOTION_.spring });
    layLight_(el);
  };
  try { requestAnimationFrame(after); } catch (e) { after(); }
}
/* ---------- THE MOVES: each one a change to the whole layout, saved at once — the same two for a widget and a card (710) ---------- */
on('lay-w-move', el => {
  if (!isAdmin()) return;
  const id = el.getAttribute('data-w'), w = layoutWidgetOf_(id || '');
  if (w) layUpDown_(id, layoutHome_(w, layoutNow_()), Number(el.getAttribute('data-d')), 'w');
});
on('lay-w-col', el => {
  if (!isAdmin()) return;
  const id = el.getAttribute('data-w'), w = layoutWidgetOf_(id || '');
  if (w) layAcross_(id, layoutHome_(w, layoutNow_()), Number(el.getAttribute('data-d')), 'w');
});
/* A COLUMN'S ORDER WRITTEN BACK (710): its widgets to `widgets[col]`, and the whole mixed order to `cards[col]` when it holds a card. */
function colOrderSet_(D, col, order) {
  const wl = order.filter(isWidgetId_);
  if (wl.length || layoutWidgetCols_().indexOf(col) !== -1) D.widgets[col] = wl; else delete D.widgets[col];
  D.cards = D.cards || {};
  if (order.some(x => !isWidgetId_(x))) D.cards[col] = order.slice(); else delete D.cards[col];
  if (!Object.keys(D.cards).length) delete D.cards;
}
/* UP OR DOWN past the neighbouring unit, widget or card. */
function layUpDown_(id, col, d, kind) {
  const L = layoutNow_();
  if (!col || !hostIs_(col, L)) return;
  const list = cardListOf_(col, L), units = mergeUnits_(CARD_SEEN[col] || [], L);
  const ui = units.findIndex(u => u.indexOf(id) !== -1), next = units[ui + d];
  if (ui === -1 || !next) return;
  const D = layoutDraftOf_(L);
  colOrderSet_(D, col, unitPlace_(list, mergeAll_(id, L), next, d));
  layMoveShow_(kind, id, col, () => layoutSave_(D));
}
/* ACROSS: to the end of the neighbouring column, whatever it holds; past an edge a new unnamed column (466, 600, 710). */
function layAcross_(id, col, d, kind) {
  const cols = cardColsFor_(id), L = layoutNow_(), D = layoutDraftOf_(L);
  if (cols.indexOf(col) === -1) return;
  let to = cols[cols.indexOf(col) + d], fresh = false;
  if (!to && customRoom_() && (d > 0 || !adminCol_(col))) {
    fresh = true;
    const cu = D.custom || [], n = cu.reduce((m, x) => Math.max(m, Number(x.id.slice(7)) || 0), 0) + 1;
    to = 'custom-' + n;
    const made = d < 0 ? { id: to, first: true } : adminCol_(col) ? { id: to, admin: true } : { id: to };
    D.custom = d < 0 ? [made].concat(cu) : cu.concat([made]);
  }
  if (!to) return;
  /* A MERGED CARD MOVES WHOLE (480). */
  const all = mergeAll_(id, L), from = cardListOf_(col, L).filter(x => all.indexOf(x) === -1), there = fresh ? [] : cardListOf_(to, L).filter(x => all.indexOf(x) === -1);
  all.forEach(x => cardUnlist_(D, x));
  Object.keys(D.widgets).forEach(c => { D.widgets[c] = D.widgets[c].filter(x => all.indexOf(x) === -1); });
  colOrderSet_(D, col, from);
  colOrderSet_(D, to, there.concat(all));
  layMoveShow_(kind, id, col, () => layoutSave_(D), to);
}
/* ASKED TWICE THROUGH sure_ (534), so its 400 ms rule holds here too: the tile keeps its mark, the question is its label and, with `word`, a word beside it. */
function layArm_(el, say, rest, word) {
  return sure_(el, say, { ms: 3000,
    face: x => {
      x.classList.add('is-armed'); tileSet_(x, { label: say });
      const k = x.querySelector('.tile-i');
      if (word && k && !x.querySelector('.lay-again')) k.insertAdjacentHTML('afterend', `<span class="lay-again">${esc(say)}</span>`);
    },
    back: x => { x.classList.remove('is-armed'); tileSet_(x, { label: rest }); x.querySelector('.lay-again')?.remove(); } });
}
/* DELETE ASKS TWICE, IN PLACE, THEN IS FINAL (477): `deleted` only keeps it from being drawn again; there is no undo. */
on('lay-w-del', el => {
  if (!isAdmin()) return;
  const id = el.getAttribute('data-w');
  const all = mergeAll_(id, layoutNow_());
  if (all.some(basketKept_)) return;
  if (!layArm_(el, all.length > 1 ? 'Tap again to delete all ' + all.length + ' of its parts' : 'Tap again to delete', 'Delete', true)) return;
  const D = layoutDraftOf_(layoutNow_());
  Object.keys(D.widgets).forEach(c => { D.widgets[c] = D.widgets[c].filter(x => all.indexOf(x) === -1); });
  all.forEach(x => { cardUnlist_(D, x); if (D.deleted.indexOf(x) === -1) D.deleted.push(x); });
  layoutSave_(D);
});
/* ---------- SAVED FOR EVERYBODY, DRAWN AT ONCE, PUT BACK IF THE SHEET SAYS NO ---------- */
function layoutSave_(next) {
  if (!isAdmin() || !next) return Promise.resolve(false);
  const was = layoutNow_();
  customPrune_(next); mergePrune_(next);
  const set = v => { try { DATA.layout = v; } catch (e) { /* no payload yet: the device's copy below still holds it */ } layoutKeep_(v); layoutRelayout_(); };
  const val = layoutSane_(next);
  set(val);
  return send({ action: 'layoutSave', personId: (USER && USER.personId) || '', layout: val })
    .then(() => true)
    .catch(err => { set(was); toast(why_(err)); return false; });
}
