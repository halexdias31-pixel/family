/* @family. — layout.js THE ADMIN'S LAYOUT (462, 463): admin tiles on every widget move it up, down, across, or delete it, for everybody. */
/* One JSON value, config's `layout` row (`layoutSave`), sent as `layout`: unknown ids ignored, missing ones appended, a broken value ignored. */

/* ---------- WHICH COLUMN A WIDGET OF EACH KIND LIVES ON BY DEFAULT — the only columns that draw widgets ---------- */
const LAYOUT_COL = { reel: 'reel', tool: 'tools', game: 'games', shop: 'shop' };
/* THE DEVICE'S COPY of the last layout the payload sent, so the first paint before the payload is already arranged. */
const LAYOUT_STORE = 'familyLayout';
const LAYOUT_ID = /^[A-Za-z0-9_:.-]{1,64}$/;
/* NEVER DELETED: the basket, the one place a shop order is paid (Shop's `cart-open` lands on it). Settings and profiles are not widgets. */
const LAYOUT_KEEP = ['cart'];
/* A SPLITTABLE CARD'S ID: `set:<column>:<group>` for a settings card, `biz:<card>` for a Business one (464). */
const LAYOUT_SPLIT_ID = /^(set|biz):[A-Za-z0-9_:.-]{1,60}$/;

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
  /* SPLIT CARDS (464): a settings or Business card drawn a field a card. */
  const split = ids(o.split).filter(x => LAYOUT_SPLIT_ID.test(x));
  if (split.length) out.split = split;
  /* CARDS ON THE RIGHT-HAND COLUMNS (465): `cards: {col: [ids]}`, only the columns that hold cards. */
  const c = o.cards && typeof o.cards === 'object' && !Array.isArray(o.cards) ? o.cards : {};
  const cards = {};
  Object.keys(c).forEach(k => { if (CARD_COLS.indexOf(k) !== -1) cards[k] = ids(c[k]).slice(0, 300); });
  if (Object.keys(cards).length) out.cards = cards;
  /* START HERE (465): `start: {col: cardId | 'person:<id>' | 'first-person'}`, where a column opens. */
  const st = o.start && typeof o.start === 'object' && !Array.isArray(o.start) ? o.start : {}, start = {};
  Object.keys(st).forEach(k => { if (CARD_COLS.indexOf(k) !== -1 && typeof st[k] === 'string' && LAYOUT_START_ID.test(st[k])) start[k] = st[k]; });
  if (Object.keys(start).length) out.start = start;
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
  const out = { v: 1, widgets: widgets, deleted: L ? L.deleted.slice() : [] };
  if (L && L.split && L.split.length) out.split = L.split.slice();
  if (L && L.start) out.start = Object.assign({}, L.start);
  if (L && L.cards) { out.cards = {}; Object.keys(L.cards).forEach(c => { out.cards[c] = L.cards[c].slice(); }); }
  return out;
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
on('lay-w-undel', el => {
  if (!layoutIsAdmin_()) return;
  const s = (el && el.closest && el.closest('.card') && el.closest('.card').querySelector('.lay-del-pick')) || document.querySelector('.lay-del-pick');
  const id = s && s.value, L = layoutNow_();
  if (!id || !L) return;
  const D = layoutDraftOf_(L);
  D.deleted = D.deleted.filter(x => x !== id);
  /* A CARD GOES BACK TO ITS OWN COLUMN, last there: out of every column's list, so its default places it. */
  if (!layoutWidgetOf_(id) && cardIs_(id)) { cardUnlist_(D, id); return layoutSave_(D); }
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
  /* DELETED CARDS TOO (465), by their titles — Add back returns one to its own column. */
  const del = ((L && L.deleted) || []).filter(id => layoutWidgetOf_(id) || cardIs_(id));
  const opts = del.map(id => `<option value="${esc(id)}">${esc(layoutWidgetOf_(id) ? (layoutWidgetOf_(id).name || id) : cardLabel_(id))}</option>`).join('');
  return `<div class="card layout-card"><h3>Layout</h3>
    <p class="faint">${L ? 'Your own order of widgets, for everyone.' : 'The default order of widgets.'} Each widget's and each card's admin tiles move or delete it.</p>
    ${del.length ? `<label class="field"><span>Deleted widgets and cards</span><select class="lay-del-pick" aria-label="Deleted widgets and cards">${opts}</select></label>` : ''}
    ${del.length || L ? `<div class="tile-row">${del.length ? tile_({ icon: 'undo', label: 'Add back', act: 'lay-w-undel' }) : ''}${
      L ? tile_({ icon: 'undo', label: 'Reset layout', act: 'layout-reset' }) : ''}</div>` : ''}</div>`;
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
    ? tile_({ icon: 'merge', label: 'Join', note: 'back into one card', act: 'lay-join', tone: 'admin', data: { card: id } })
    : tile_({ icon: 'split', label: 'Split', note: 'a card a field', act: 'lay-split', tone: 'admin', data: { card: id } })}</div>`;
}
function splitSet_(id, on) {
  if (!layoutIsAdmin_() || !LAYOUT_SPLIT_ID.test(id)) return;
  const D = layoutDraftOf_(layoutNow_());
  const was = D.split || [];
  D.split = on ? (was.indexOf(id) === -1 ? was.concat([id]) : was) : was.filter(x => x !== id);
  if (!D.split.length) delete D.split;
  layoutSave_(D);
}
on('lay-split', el => splitSet_(el.getAttribute('data-card') || '', true));
on('lay-join', el => splitSet_(el.getAttribute('data-card') || '', false));

/* ---------- CARDS ON THE RIGHT-HAND COLUMNS (465): ▲ ▼ ◀ ▶, Delete and Start here on every settings, profiles and Business card ---------- */
/* The owner: "I especially need them on the right-hand columns". A moved card is the same card, drawn by its own column's builder: one home still. */
const CARD_COLS = ['family', 'staff', 'account', 'tutors', 'students', 'parents', 'biz'];
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
  { id: 'own:account', col: 'account', label: 'Your card (Student settings)', only: 'your card', say: 'Your picture, figure, name and handle, as other people see them.' },
  { id: 'own:family', col: 'family', label: 'Your card (Parent settings)', only: 'your card', say: 'Your picture, figure, name and handle, as other people see them.' },
  { id: 'own:staff', col: 'staff', label: 'Your card (Tutor settings)', only: 'your card', say: 'Your public tutor card: picture, name, headline, what you teach and where.' },
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
  { id: 'biz:setup', col: 'biz', label: 'Setup', re: /^<div class="card setup-card/, say: 'What ran when the backend was last set up.' },
  { id: 'biz:posts', col: 'biz', label: 'Posts waiting', re: /^<div class="card biz posts-wait/, say: 'Posts waiting for you to approve.' },
  { id: 'biz:apps', col: 'biz', label: 'Applications to teach', re: /^<div class="card biz apps/, say: 'People asking to teach, to approve or decline.' },
  { id: 'biz:staff', col: 'biz', label: 'Staff', re: /^<div class="card biz staff-card/, say: 'Who teaches, whether they agreed the terms, and their statements.' },
  { id: 'biz:reports', col: 'biz', label: 'Reports', re: /^<div class="card biz reports/, say: 'Reports people have sent about posts or questions.' },
  { id: 'biz:libimp', col: 'biz', label: 'Library import', re: /^<div class="card biz libimp/, say: 'Bring new questions and their words into the library.' },
  { id: 'biz:layout', col: 'biz', label: 'Layout', re: /^<div class="card layout-card/, say: 'Deleted cards and widgets back, and Reset layout.' },
  { id: 'biz:build', col: 'biz', label: 'Build', re: /class="me-build"/, say: 'Which version of the site and backend is running.' },
];
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
function cardSayIn_(h, id) {
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
const CARD_DYN = /^(set:(family|staff|account):[A-Za-z0-9_:.-]+|biz:rec:[A-Za-z0-9_:.-]+|biz:profit-terms)$/;
const cardIs_ = id => !!(cardReg_(id) || CARD_DYN.test(String(id || '')));
function cardHome0_(id) {
  const r = cardReg_(id);
  if (r) return r.col;
  const m = /^set:([a-z]+):/.exec(id);
  return m ? m[1] : /^biz:/.test(id) ? 'biz' : '';
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
  m = /^\s*<div[^>]*\sdata-(?:lay-card|split)="([^"]+)"/.exec(h);
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
  biz: () => adminPages_(),
};
/* THE CARD COLUMNS LEFT TO RIGHT; Business only for its own cards — anything else moved there would vanish for everyone but an admin. */
function cardColsFor_(id) {
  let seq = [];
  try { seq = COLUMNS.map(t => t.id); } catch (e) { seq = []; }
  return CARD_COLS.filter(c => seq.indexOf(c) !== -1 && (c !== 'biz' || cardHome0_(id) === 'biz'))
    .sort((a, b) => seq.indexOf(a) - seq.indexOf(b));
}
function cardHome_(id, L) {
  const c = (L && L.cards) || {};
  for (const k of CARD_COLS) if (c[k] && c[k].indexOf(id) !== -1 && (k !== 'biz' || cardHome0_(id) === 'biz')) return k;
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
  const groupsIn = c => { if (!built[c]) { try { built[c] = (CARD_BUILD[c]() || []).filter(Boolean); } catch (e) { built[c] = []; } } return cardGroups_(built[c]); };
  const mine = groupsIn(col).map((g, i) => Object.assign(g, { i: i }))
    .filter(g => !g.id || (cardHome_(g.id, L) === col && del.indexOf(g.id) === -1));
  const n = mine.length;
  list.forEach((id, k) => {
    const from = cardHome0_(id);
    if (from === col || !CARD_BUILD[from] || cardHome_(id, L) !== col || del.indexOf(id) !== -1 || mine.some(g => g.id === id)) return;
    const g = groupsIn(from).find(x => x.id === id);
    if (g) mine.push(Object.assign(g, { i: n + k }));
  });
  const at = g => { const x = g.id ? list.indexOf(g.id) : -1; return x === -1 ? list.length + g.i : x; };
  let out = mine.sort((a, b) => at(a) - at(b) || a.i - b.i);
  /* A COLUMN'S BARE TITLE CARD IS FOR WHEN IT HOLDS NOTHING — not above a card moved into it. */
  if (out.some(g => g.id)) out = out.filter(g => g.id || !/^\s*<div class="card(?: people-none)?">\s*<h3>[^<]*<\/h3>(?:\s*<p[^>]*>[^<]*<\/p>)?\s*<\/div>\s*$/.test(g.pages.join('')));
  out.forEach(g => { if (g.id && !cardReg_(g.id)) { const m = /<h3[^>]*>([^<]{1,80})<\/h3>/.exec(g.pages[0]); if (m) CARD_TITLE[g.id] = m[1].trim(); } });
  CARD_SEEN[col] = out.filter(g => g.id).map(g => g.id);
  return out;
}
/* WHERE A COLUMN OPENS (Start here), as a page number of the column last drawn — `PAGE_HOME` asks. */
const CARD_START_AT = {};
const cardStartOf_ = (col, L) => { const s = L && L.start && L.start[col]; return typeof s === 'string' ? s : ''; };
/* THE COLUMN DRAWN: unchanged when there is no layout of cards and nobody to arrange them; else arranged, an admin's row on each card. */
function cardsOf_(col) {
  const raw = (CARD_BUILD[col] ? CARD_BUILD[col]() : []).filter(Boolean);
  const L = layoutNow_(), admin = layoutIsAdmin_();
  delete CARD_START_AT[col];
  const strip = h => String(h).replace(/^\s*<!--card:[^>]*-->/, '').replace(/^\s*<!--person:[^>]*-->/, '');
  if (!admin && !(L && (L.cards || L.start || (L.deleted || []).some(cardIs_))))
    return cardGroups_(raw).reduce((a, g) => a.concat(g.pages.map((h, i) => strip(i === 0 && g.id ? cardSayIn_(h, g.id) : h))), []);
  const groups = cardArrange_(col, raw);
  const start = cardStartOf_(col, L);
  const out = [];
  let firstP = -1;
  groups.forEach(g => {
    const row = admin && g.id ? cardAdminRow_(g.id, col) : '';
    const each = g.pages.length > 1 && /^(set|biz):/.test(g.id);
    let firstInList = true;
    g.pages.forEach((h, i) => {
      const pid = personOf_(h), at = out.length;
      if (pid && firstP === -1) firstP = at;
      if (start && ((g.id && start === g.id && i === 0) || (pid && start === 'person:' + pid))) CARD_START_AT[col] = at;
      let page = strip(i === 0 && g.id ? cardSayIn_(h, g.id) : h);
      if (admin && pid) {
        page += `<div class="tile-row wgt-admin start-tiles">${startTile_(col, 'person:' + pid, start)}${
          firstInList ? startTile_(col, 'first-person', start, 'the first person') : ''}</div>`;
        firstInList = false;
      }
      if (row && (each || i === g.pages.length - 1)) page = cardRowIn_(page, row);
      out.push(page);
    });
  });
  if (start === 'first-person' && firstP !== -1) CARD_START_AT[col] = firstP;
  /* BUSINESS'S LAST LINE WHILE ANYTHING IS DELETED and the Layout card is gone with it: the way back, never a pop-up (465). */
  if (col === 'biz' && admin && L && (L.deleted || []).length && !CARD_SEEN.biz.includes('biz:layout')) out.push(layoutFoot_(L));
  if (!out.length) return [`<div class="card"><h3>${esc(typeof tabLabel_ === 'function' ? tabLabel_(col, col) : col)}</h3></div>`];
  return out;
}
function startTile_(col, id, start, note) {
  return tile_({ icon: 'flag', label: start === id ? 'Start here (on)' : 'Start here', note: note || '', act: 'lay-start', tone: 'admin',
    on: start === id, data: { lc: id, col: col } });
}
function cardRowIn_(h, row) {
  const t = h.replace(/\s+$/, '');
  if (/^\s*<div class="(card|own-set)/.test(t) && /<\/div>$/.test(t)) return t.slice(0, -6) + row + '</div>';
  return h + row;
}
function cardAdminRow_(id, col) {
  if (!layoutIsAdmin_()) return '';
  const seen = CARD_SEEN[col] || [], i = seen.indexOf(id), cols = cardColsFor_(id), ci = cols.indexOf(col);
  const start = cardStartOf_(col, layoutNow_());
  return `<div class="tile-row wgt-admin card-admin" data-lay-for="${esc(id)}">${
    tile_({ icon: 'up', label: 'Move up', act: 'lay-c-move', tone: 'admin', data: { lc: id, col: col, d: -1 }, off: i <= 0 })}${
    tile_({ icon: 'down', label: 'Move down', act: 'lay-c-move', tone: 'admin', data: { lc: id, col: col, d: 1 }, off: i === -1 || i >= seen.length - 1 })}${
    tile_({ icon: 'left', label: 'Move to previous column', act: 'lay-c-col', tone: 'admin', data: { lc: id, col: col, d: -1 }, off: ci <= 0 })}${
    tile_({ icon: 'right', label: 'Move to next column', act: 'lay-c-col', tone: 'admin', data: { lc: id, col: col, d: 1 }, off: ci === -1 || ci >= cols.length - 1 })}${
    startTile_(col, id, start)}${
    tile_({ icon: 'bin', label: 'Delete', act: 'lay-c-del', tone: 'admin', data: { lc: id }, cls: 'lay-del' })}</div>`;
}
/* THE WAY BACK WHEN THE LAYOUT CARD ITSELF IS DELETED: one small line at the foot of Business, while anything is deleted. */
function layoutFoot_(L) {
  const del = (L.deleted || []).filter(id => layoutWidgetOf_(id) || cardIs_(id));
  const opts = del.map(id => `<option value="${esc(id)}">${esc(layoutWidgetOf_(id) ? (layoutWidgetOf_(id).name || id) : cardLabel_(id))}</option>`).join('');
  return `<div class="card lay-foot"><p class="faint">Deleted cards (${del.length})</p>
    ${del.length ? `<select class="lay-del-pick" aria-label="Deleted widgets and cards">${opts}</select>` : ''}
    <div class="tile-row">${del.length ? tile_({ icon: 'undo', label: 'Add back', act: 'lay-w-undel' }) : ''}${tile_({ icon: 'undo', label: 'Reset layout', act: 'layout-reset' })}</div></div>`;
}
/* A COLUMN'S LIST AS THE ADMIN SEES IT, with any card named there but not drawn for them kept at the end. */
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
  const L = layoutNow_(), list = cardListOf_(col, L), seen = CARD_SEEN[col] || [];
  const next = seen[seen.indexOf(id) + d];
  if (CARD_COLS.indexOf(col) === -1 || seen.indexOf(id) === -1 || !next) return;
  list.splice(list.indexOf(id), 1);
  list.splice(list.indexOf(next) + (d > 0 ? 1 : 0), 0, id);
  const D = layoutDraftOf_(L);
  D.cards = D.cards || {};
  D.cards[col] = list;
  layoutSave_(D);
});
/* ACROSS: to the end of the neighbouring card column — the same card, its one home moved with it. */
on('lay-c-col', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc'), col = el.getAttribute('data-col'), d = Number(el.getAttribute('data-d'));
  const cols = cardColsFor_(id), to = cols[cols.indexOf(col) + d];
  if (cols.indexOf(col) === -1 || !to) return;
  const L = layoutNow_(), from = cardListOf_(col, L).filter(x => x !== id), there = cardListOf_(to, L).filter(x => x !== id);
  const D = layoutDraftOf_(L);
  cardUnlist_(D, id);
  D.cards = D.cards || {};
  D.cards[col] = from;
  D.cards[to] = there.concat([id]);
  layoutSave_(D);
});
/* DELETE ASKS TWICE, IN PLACE; the second step says when it is the only place a setting is edited — still one tap, never a pop-up. */
on('lay-c-del', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc');
  if (!cardIs_(id)) return;
  if (el.getAttribute('data-armed') !== '1') {
    const only = cardOnly_(id), say = only ? 'Tap again — this removes the only place to edit ' + only : 'Tap again to delete';
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
  cardUnlist_(D, id);
  if (D.deleted.indexOf(id) === -1) D.deleted.push(id);
  layoutSave_(D);
});
/* START HERE: the column opens on this card (or person, or "the first person"); pressed again, the default comes back. */
on('lay-start', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc'), col = el.getAttribute('data-col');
  if (CARD_COLS.indexOf(col) === -1 || !LAYOUT_START_ID.test(id || '')) return;
  const D = layoutDraftOf_(layoutNow_());
  const s = Object.assign({}, D.start || {});
  if (s[col] === id) delete s[col]; else s[col] = id;
  if (Object.keys(s).length) D.start = s; else delete D.start;
  try { PAGE_OPENED[col] = false; } catch (e) {}
  layoutSave_(D);
});
const LAYOUT_START_ID = /^(first-person|person:[A-Za-z0-9_.-]{1,48}|[A-Za-z0-9_:.-]{1,64})$/;
/* THE PAGER'S LANDING FOR EACH CARD COLUMN: Start here's page when it is drawn, else what it was before. */
CARD_COLS.forEach(c => {
  const was = PAGE_HOME[c];
  PAGE_HOME[c] = () => {
    const n = CARD_START_AT[c];
    if (typeof n === 'number' && n >= 0) return n;
    try { return was ? was() : 0; } catch (e) { return 0; }
  };
});
/* FOR THE JOURNEYS: a column's arranged cards, and the page it opens on. */
function cardSeen_(col) { return (CARD_SEEN[col] || []).slice(); }
function cardStartAt_(col) { try { return PAGE_HOME[col](); } catch (e) { return 0; } }
