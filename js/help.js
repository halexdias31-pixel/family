/* ---------- A HAND UP (455): a child asks the tutor over from a question; the tutor's column lists who. ---------- */
/* The child's side is device-kept (it survives a reload and a swipe); the backend's flag tells Staff. */

const HELP_STORE = 'familyHelpHand';
const HELP_TTL_MS = 30 * 60 * 1000;     // the backend's HANDS_TTL_MS: a hand nobody answered goes down by itself
const HELP_POLL_MS = 15000;
/* THE STUDENTS COLUMN, WHICH THE TUTOR'S LIST TOPS. One name, so the six-columns change moves it in one line. */
const HELP_COL = 'account';
let HELP_LIST = null;                   // the tutor's last answer: [{ personId, name, handle, q, label, at }]
let HELP_TIMER = null;

function helpGet_() {
  let h = null;
  try { h = JSON.parse(localStorage.getItem(HELP_STORE) || 'null'); } catch (e) { h = null; }
  if (!h || !(Date.now() - Number(h.at) < HELP_TTL_MS)) {
    if (h) helpPut_(null);
    return null;
  }
  return h;
}
function helpPut_(h) {
  try { if (h) localStorage.setItem(HELP_STORE, JSON.stringify(h)); else localStorage.removeItem(HELP_STORE); } catch (e) {}
}
const helpOn_ = () => !!helpGet_();
/* THE CLASS A QUESTION'S CARD CARRIES WHILE THE HAND IS UP — every question's card, since it is the child's hand. */
const helpCls_ = () => (helpOn_() ? ' is-help' : '');

function helpTile_(x) {
  const on = helpOn_();
  const q = x ? String((typeof qId_ === 'function' && qId_(x)) || x.key || '') : '';
  const label = x ? String(x.name || x.title || '') : '';
  return on
    ? tile_({ icon: 'hand', label: 'I’m OK now', note: 'put my hand down', act: 'help-hand', cls: 'help-hand', on: true, data: { q: q, label: label } })
    : tile_({ icon: 'hand', label: 'Help', note: 'ask the tutor over', act: 'help-hand', cls: 'help-hand', data: { q: q, label: label } });
}
/* THE ROW ON EVERY QUESTION'S PAGES, and the words a room can read while it is up. */
function helpRow_(x) {
  return `<div class="tile-row qhelp-tiles">${helpTile_(x)}${helpOn_() ? '<span class="qhelp-say">Waiting for help</span>' : ''}</div>`;
}

/* REDRAWN WHERE IT STANDS: every question card on every column, without redrawing the pages. */
function helpPaint_() {
  const on = helpOn_();
  document.querySelectorAll('.qcard').forEach(c => {
    if (!c.querySelector('.qhelp-tiles')) return;
    c.classList.toggle('is-help', on);
  });
  document.querySelectorAll('.qhelp-tiles').forEach(row => {
    const t = row.querySelector('.help-hand');
    const x = { key: t ? t.getAttribute('data-q') : '', name: t ? t.getAttribute('data-label') : '' };
    row.outerHTML = helpRow_(x);
  });
}

on('help-hand', el => {
  const was = helpGet_();
  const h = was ? null : { q: el.getAttribute('data-q') || '', label: el.getAttribute('data-label') || '', at: Date.now() };
  helpPut_(h);
  helpPaint_();
  if (typeof USER === 'object' && USER && USER.token) {
    api({ action: 'raiseHand', on: !!h, q: h ? h.q : '', label: h ? h.label : '', personId: USER.personId || '' })
      .then(d => { if (d && d.error) toast('The tutor was not told: ' + d.error); })
      .catch(() => toast('The tutor was not told — no connection. Your card is still red.'));
  }
  helpPoll_();
});

/* ---------- THE TUTOR'S LIST: who, which question, oldest first, a Done each ---------- */
const helpAgo_ = at => { const m = Math.max(0, Math.round((Date.now() - Number(at)) / 60000)); return m < 1 ? 'just now' : m + ' min'; };
function helpListCard_() {
  if (!(typeof rankAtLeast_ === 'function' && rankAtLeast_('staff'))) return '';
  helpPoll_();
  const list = HELP_LIST;
  const rows = list === null ? loading_()
    : !list.length ? '<p class="help-none">Nobody has a hand up.</p>'
    : list.map(h => `<div class="help-who" data-id="${esc(h.personId)}">
        <p class="help-line"><b>${esc(h.name || h.handle || 'Someone')}</b> · ${esc(h.label || h.q || 'a question')} · ${esc(helpAgo_(h.at))}</p>
        <div class="tile-row">${tile_({ icon: 'tick', label: 'Done', note: 'helped ' + (h.name || ''), act: 'help-done', data: { id: h.personId } })}</div>
      </div>`).join('');
  return `<div class="card help-list"${list === null ? ' aria-busy="true"' : ''}><h3>Needs help</h3>${rows}</div>`;
}
function helpListPaint_() {
  const el = document.querySelector('.help-list');
  if (el) el.outerHTML = helpListCard_();
}

on('help-done', el => {
  const id = el.getAttribute('data-id') || '';
  if (HELP_LIST) HELP_LIST = HELP_LIST.filter(h => h.personId !== id);
  helpListPaint_();
  api({ action: 'raiseHand', on: false, for: id, personId: (USER && USER.personId) || '' })
    .then(d => { if (d && d.error) toast(d.error); else if (d && d.hands) { HELP_LIST = d.hands; helpListPaint_(); } })
    .catch(() => toast('No connection — that hand is still up.'));
});

/* ---------- ONE POLL FOR BOTH SIDES, every 15 s, only while it has something to look at ---------- */
function helpPollWanted_() {
  const signed = typeof USER === 'object' && USER && USER.token;
  if (!signed) return false;
  const tutor = typeof rankAtLeast_ === 'function' && rankAtLeast_('staff') && typeof AT !== 'undefined' && AT === HELP_COL;
  return !!(tutor || helpOn_());
}
/* ONE LOOK: lowers the child's card if the tutor said Done, refreshes the tutor's list, books the next. */
function helpTick_() {
  HELP_TIMER = null;
  if (!helpPollWanted_()) { helpPaint_(); return Promise.resolve(); }
  if (typeof document !== 'undefined' && document.hidden) { HELP_TIMER = setTimeout(helpTick_, HELP_POLL_MS); return Promise.resolve(); }
  return api({ action: 'hands', personId: USER.personId || '' }).then(d => {
    if (!d || d.error) return;
    /* THE TUTOR SAID DONE (or 30 minutes passed there): the card goes back to normal. */
    if (helpOn_() && !d.mine) { helpPut_(null); helpPaint_(); }
    if (d.hands) { HELP_LIST = d.hands; helpListPaint_(); }
  }).catch(() => {}).then(() => { if (!HELP_TIMER && helpPollWanted_()) HELP_TIMER = setTimeout(helpTick_, HELP_POLL_MS); });
}
function helpPoll_() {
  if (HELP_TIMER || !helpPollWanted_()) return;
  HELP_TIMER = setTimeout(helpTick_, HELP_LIST === null && rankAtLeast_('staff') ? 0 : HELP_POLL_MS);
}
