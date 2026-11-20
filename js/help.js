/* ---------- A HAND UP (455): a child asks the tutor over from a question; the tutor's column lists who. ---------- */
/* The child's side is device-kept (it survives a reload and a swipe); the backend's flag tells Staff. */

const HELP_STORE = 'familyHelpHand';
const HELP_TTL_MS = 30 * 60 * 1000;     // the backend's HANDS_TTL_MS: a hand nobody answered goes down by itself
const HELP_POLL_MS = 15000;
/* THE STUDENTS COLUMN, WHICH THE TUTOR'S LIST TOPS. One name, so the six-columns change moves it in one line. */
const HELP_COL = 'students';
let HELP_LIST = null;                   // the tutor's last answer: [{ personId, name, handle, q, label, at }]
let HELP_TIMER = null;

function helpGet_() {
  let h = null;
  h = keep_.json(HELP_STORE, null);
  if (!h || !(Date.now() - Number(h.at) < HELP_TTL_MS)) {
    if (h) helpPut_(null);
    return null;
  }
  return h;
}
function helpPut_(h) {
  keep_.put(HELP_STORE, h ? JSON.stringify(h) : null);
}
const helpOn_ = () => !!helpGet_();
/* WHICH PAGE A HAND IS UP ON: the part's key and its page ('' the part, 'ans', 'stem0', 'pre1'). The hand does nothing but stay pressed and make its sound -- nothing turns red (owner, 20 Nov). */
const helpQ_ = x => (x ? String(x.key || '') : '');
function helpHere_(x, pg) {
  const h = helpGet_();
  return !!h && h.q === helpQ_(x) && String(h.pg || '') === String(pg || '');
}

function helpOpts_(x, pg) {
  const on = helpHere_(x, pg);
  const data = { q: helpQ_(x), pg: String(pg || ''), label: x ? String(x.name || x.title || '') : '' };
  return on
    ? { icon: 'hand', label: 'I’m OK now', note: 'put my hand down', act: 'help-hand', cls: 'help-hand', on: true, pressed: true, data: data }
    : { icon: 'hand', label: 'Help', note: 'ask the tutor over', act: 'help-hand', cls: 'help-hand', pressed: false, data: data };
}
/* THE ROW ON EVERY QUESTION'S PAGES: the hand alone, pressed while it is up (owner, 20 Nov). */
function helpRow_(x, pg) {
  return cardBlock_({ type: 'group', look: 'tile-row qhelp-tiles', inner: tile_(helpOpts_(x, pg)) });
}

/* REDRAWN WHERE IT STANDS: the tile only, so the star and Suggest joined into its row stay (`tileRowsJoin_`). */
function helpPaint_() {
  /* EVERY HAND, wherever its row stands: the card's row is outside `.qcard` since 950 joined Help into it, and a tap there redrew nothing (960). */
  document.querySelectorAll('.help-hand').forEach(t => {
    const x = { key: t.getAttribute('data-q') || '', name: t.getAttribute('data-label') || '' }, pg = t.getAttribute('data-pg') || '';
    t.outerHTML = tile_(helpOpts_(x, pg));
  });
}

on('help-hand', el => {
  const q = el.getAttribute('data-q') || '', pg = el.getAttribute('data-pg') || '';
  /* PRESSED ON THE PAGE IT IS UP ON, the hand goes down; on any other page it moves there -- one hand, one page. */
  const was = helpGet_(), down = !!was && was.q === q && String(was.pg || '') === pg;
  const h = down ? null : { q: q, pg: pg, label: el.getAttribute('data-label') || '', at: Date.now() };
  helpPut_(h);
  helpPaint_();
  /* AND A SOUND (owner, 1 Nov: "should make a noise"; kept 20 Nov as the hand's only effect): the marking sounds' machine, `markSound_` in submit.js. */
  if (h && typeof markSound_ === 'function') markSound_('help');
  if (typeof USER === 'object' && USER && USER.token) {
    api({ action: 'raiseHand', on: !!h, q: h ? h.q : '', label: h ? h.label : '', personId: USER.personId || '' })
      .then(d => { if (d && d.error) toast('The tutor was not told: ' + d.error); })
      .catch(() => toast(text_('the-tutor-was-not-told-no')));
  }
  helpPoll_();
});

/* ---------- THE TUTOR'S LIST: who, which question, oldest first, a Done each ---------- */
const helpAgo_ = at => { const m = Math.max(0, Math.round((Date.now() - Number(at)) / 60000)); return m < 1 ? 'just now' : m + ' min'; };
function helpListCard_() {
  if (!(typeof rankAtLeast_ === 'function' && may_('staff'))) return '';
  helpPoll_();
  const list = HELP_LIST;
  const rows = list === null ? loading_()
    : !list.length ? cardBlock_({ type: 'group', tag: 'p', look: 'help-none', text: 'Nobody has a hand up.' })
    : cardBlocks_(list.map(h => ({ type: 'group', look: 'help-who', attrs: { 'data-id': h.personId }, blocks: [
      { type: 'group', tag: 'p', look: 'help-line', text: [{ b: h.name || h.handle || 'Someone' }, ` · ${h.label || h.q || 'a question'} · ${helpAgo_(h.at)}`] },
      { type: 'tiles', tiles: [{ icon: 'tick', label: 'Done', note: 'helped ' + (h.name || ''), act: 'help-done', data: { id: h.personId } }] }] })));
  return card_(cardBlock_({ type: 'group', look: 'help-list', attrs: { 'aria-busy': list === null ? 'true' : null }, blocks: [{ type: 'group', tag: 'h3', text: 'Needs help' }], inner: rows }));
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
    .catch(() => toast(text_('no-connection-that-hand-is-still')));
});

/* ---------- ONE POLL FOR BOTH SIDES, every 15 s, only while it has something to look at ---------- */
function helpPollWanted_() {
  const signed = typeof USER === 'object' && USER && USER.token;
  if (!signed) return false;
  const tutor = typeof rankAtLeast_ === 'function' && may_('staff') && typeof AT !== 'undefined' && AT === HELP_COL;
  return !!(tutor || helpOn_());
}
/* ONE LOOK: lowers the child's card if the tutor said Done, refreshes the tutor's list, books the next. */
function helpTick_() {
  HELP_TIMER = null;
  if (!helpPollWanted_()) { helpPaint_(); return Promise.resolve(); }
  if (typeof document !== 'undefined' && document.hidden) { HELP_TIMER = setTimeout(helpTick_, HELP_POLL_MS); return Promise.resolve(); }
  return api({ action: 'hands', personId: USER.personId || '' }).then(d => {
    if (!d || d.error) return;
    /* THE TUTOR SAID DONE (or 30 minutes passed there): the hand goes back to normal. */
    if (helpOn_() && !d.mine) { helpPut_(null); helpPaint_(); }
    /* NO LIST IS AN EMPTY LIST once the server has answered: the card never waits on a field an older backend leaves out. */
    HELP_LIST = Array.isArray(d.hands) ? d.hands : (HELP_LIST || []); helpListPaint_();
  }).catch(() => {}).then(() => { if (!HELP_TIMER && helpPollWanted_()) HELP_TIMER = setTimeout(helpTick_, HELP_POLL_MS); });
}
function helpPoll_() {
  if (HELP_TIMER || !helpPollWanted_()) return;
  HELP_TIMER = setTimeout(helpTick_, HELP_LIST === null && may_('staff') ? 0 : HELP_POLL_MS);
}
