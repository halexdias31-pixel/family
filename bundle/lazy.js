/* ==== js/one-place.js ==== */
/* CHECKS (1060), js/one-place.js: the one place — the one score per area, each area's next three, then the owner's inbox. docs/philosophy.md is the why. */
/* Scores are data/health.json (tools/health.js); the questions data/settings/owner-questions.json; answers the owner_answers tab. */
const OQ = { list: null, answers: null, error: '', asking: false, watching: false };
const CHECK_AREAS = [['code', 'Code'], ['logic', 'Find logic'], ['ui', 'Design and UI'], ['friction', 'Friction'], ['cost', 'AI cost'], ['speed', 'Speed'], ['business', 'Business']];

/* THE BUSINESS AREA, LIVE: the checker's sorted share once its ticks came, else the file's figure. */
/* THE BUSINESS CHECKER IS SWITCHED OFF (attic/js/biz-check.js, owner 13 Nov): the file's figure stands. */
function checksBizLive_() { return null; }
function checksAreas_(s) {
  const A = Object.assign({}, (s && s.areas) || {}), live = checksBizLive_();
  if (live) A.business = Object.assign({}, A.business || {}, { score: live.score, next: live.next, live: true });
  return A;
}
/* THE TOTAL: the file's weights over the weighted areas, with business live when it is. */
function checksTotal_(s, A) {
  const W = (s && s.weights) || {};
  const ks = Object.keys(W).filter(k => A[k] && isFinite(Number(A[k].score)));
  const sum = ks.reduce((a, k) => a + W[k], 0);
  return sum ? Math.round(ks.reduce((a, k) => a + W[k] * Number(A[k].score), 0) / sum * 10) / 10 : (s && s.score);
}

function oqStart_() {
  if (OQ.asking || OQ.list) return;
  OQ.asking = true;
  const list = fetch('data/settings/owner-questions.json' + (typeof deployStamp_ === 'function' ? deployStamp_() : ''), { cache: 'default' })
    .then(r => r.json()).then(j => { OQ.list = Array.isArray(j && j.questions) ? j.questions : []; })
    .catch(() => { OQ.list = []; OQ.error = 'The questions could not be fetched — check the connection.'; });
  const got = api({ action: 'listOwnerAnswers', name: USER && USER.name })
    .then(d => { OQ.answers = oqOf_(d && !d.error ? d.answers : []); if (d && d.error) OQ.error = String(d.error); })
    .catch(() => { OQ.answers = {}; OQ.error = 'The answers could not be fetched — the questions show unanswered.'; });
  Promise.all([list, got]).then(() => { OQ.asking = false; checksDraw_(); });
}
const oqOf_ = rows => { const o = {}; (Array.isArray(rows) ? rows : []).forEach(r => { if (r && r.id) o[r.id] = r; }); return o; };

/* ONE LINE PER QUESTION: its words, its answers as form buttons, Something else with its box; nothing appears or moves on a press. */
function oqItem_(q) {
  const a = (OQ.answers || {})[q.id] || (q.status === 'answered' ? { choice: q.answer || 'note', note: q.note || '' } : null);
  const opts = Object.keys(q.options || {}).filter(k => q.options[k]);
  const said = a ? 'Answered: ' + (a.choice === 'note' ? '' : '(' + a.choice + ') ' + ((q.options || {})[a.choice] || '')) + (a.note ? ' “' + a.note + '”' : '') : '';
  return cardBlock_({ type: 'group', look: 'oq-item', attrs: { 'data-oq': q.id }, blocks: [
    { type: 'group', tag: 'p', look: 'oq-q', inner: (q.philosophy ? qtag_('Philosophy') + ' ' : '') + esc(q.question) },
    { type: 'tiles', tiles: opts.map(k => ({ form: true, kind: a && a.choice === k ? '' : 'quiet', label: k + ') ' + q.options[k], act: 'oq-answer', data: { id: q.id, choice: k } })) },
    { type: 'field', blocks: [{ type: 'control', tag: 'input', attrs: { type: 'text', 'data-oq-note': true, value: (a && a.note) || '', placeholder: 'Something else…', maxlength: 500,
      'aria-label': q.question + ' — something else', autocomplete: 'off' } }] },
    { type: 'tiles', tiles: [{ form: true, kind: 'quiet', label: 'Send note', act: 'oq-answer', data: { id: q.id, choice: 'note' } }] },
    { type: 'group', tag: 'p', look: 'me-said oq-said', text: said || '\u00a0' }] });
}
/* THE INBOX: the five open questions that settle most (philosophy first, then `settles`, then file order); answered fold away. */
const OQ_SHOWN = 5;
const oqDone_ = q => q.status === 'answered' || !!(OQ.answers || {})[q.id];
const oqWeight_ = q => (q.philosophy ? 100 : 0) + (Number(q.settles) || 0);
function oqInbox_() {
  if (!OQ.list) { oqStart_(); return cardBlock_({ type: 'group', tag: 'h4', text: 'Owner questions' }) + (typeof loading_ === 'function' ? loading_() : ''); }
  const open = OQ.list.filter(q => !oqDone_(q)).map((q, i) => ({ q, i })).sort((x, y) => oqWeight_(y.q) - oqWeight_(x.q) || x.i - y.i).map(x => x.q);
  const done = OQ.list.filter(oqDone_);
  return cardBlocks_([{ type: 'group', tag: 'h4', text: 'Owner questions · ' + open.length + ' open' + (open.length > OQ_SHOWN ? ', ' + OQ_SHOWN + ' shown' : '') },
    OQ.error ? { type: 'group', tag: 'p', look: 'me-said', text: OQ.error } : null]) + open.slice(0, OQ_SHOWN).map(oqItem_).join('')
    + (done.length ? cardBlock_({ type: 'group', tag: 'details', look: 'oq-done', blocks: [{ type: 'group', tag: 'summary', text: 'Answered · ' + done.length }], inner: done.map(oqItem_).join('') }) : '');
}

function checksInner_() {
  const s = typeof HEALTH !== 'undefined' ? HEALTH.got : null;
  if (typeof siteHealthCard_ === 'function' && typeof HEALTH !== 'undefined' && !HEALTH.asked) siteHealthCard_();
  const head = cardBlocks_([{ type: 'group', look: 'qtags', inner: qtag_('Business') + qtag_('Admin only') }, { type: 'msgHead', text: 'Optimiser' }]);
  if (!s) return head + (HEALTH && HEALTH.failed ? cardBlock_({ type: 'group', tag: 'p', look: 'me-said', text: 'The score could not be read. Run node tools/health.js and push.' }) : (typeof loading_ === 'function' ? loading_() : '')) + oqInbox_();
  const A = checksAreas_(s);
  return head + cardBlock_({ type: 'group', tag: 'p', look: 'stab-score', text: 'Optimiser: ' + checksTotal_(s, A) + '%' })
    + CHECK_AREAS.filter(([k]) => A[k]).map(([k, n]) => cardBlocks_([
      { type: 'group', tag: 'h4', text: n + ' ' + A[k].score + '%', inner: (s.weights || {})[k] ? '' : ' ' + qtag_('inside the others') },
      { type: 'list', ordered: true, look: 'stab-top', items: (A[k].next || []).slice(0, 3).map(t => String(t)).concat((A[k].next || []).length ? [] : ['Nothing to do.']) }])).join('')
    + oqInbox_();
}
/* THE ONE CARD, then the detail it sums (the Optimiser's code worklist with What's missing, and the business checker's ticks), nothing lost. */
function checksCard_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  let more = '';
  try { more = (typeof healthWithMissing_ === 'function' ? healthWithMissing_(siteHealthCard_(true)) : '') + (typeof window.bizCheckCard_ === 'function' ? window.bizCheckCard_() : ''); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'checks detail'); }
  if (!checksBizLive_()) setTimeout(checksWatchBiz_, 0);
  return card_(cardBlock_({ type: 'group', look: 'checks-card', attrs: { 'data-checks': true }, inner: checksInner_() }) + more);
}
const checksDraw_ = () => { document.querySelectorAll('[data-checks]').forEach(c => { cardFill_(c, checksInner_()); }); };
/* THE LIVE BUSINESS SCORE: redraw once the checker's ticks have come (or a minute passes), without the checker knowing about this card. */
function checksWatchBiz_() {
  if (OQ.watching) return;
  OQ.watching = true;
  const t0 = Date.now();
  (function tick() { if (checksBizLive_() || Date.now() - t0 > 60000) { OQ.watching = false; checksDraw_(); } else setTimeout(tick, 500); })();
}

on('oq-answer', el => {
  if (!isAdmin()) return;
  const id = el.dataset.id, choice = el.dataset.choice, box = el.closest('.oq-item');
  if (!box || !OQ.answers) { toast('The answers are still on their way — a moment.'); return; }
  const note = String((box.querySelector('[data-oq-note]') || {}).value || '').trim();
  if (choice === 'note' && !note) { toast('Write the note first.'); return; }
  send_({ action: 'saveOwnerAnswer', name: USER && USER.name, id, choice, note },
        { button: el, where: box.querySelector('.oq-said'), busy: 'Saving…' })
    .then(d => { OQ.answers[id] = (d && d.answer) || { id, choice, note }; checksDraw_(); })
    .catch(() => { /* send_ already said why in the line */ });
});

/* CHECKS REGISTERS ITSELF as a health card (`healthCardOf_`, missing.js) once every file has run, whatever the load order. */
setTimeout(() => { if (typeof HEALTH_MORE_ !== 'undefined') HEALTH_MORE_.checks = checksCard_; }, 0);

;
/* ==== js/inbox.js ==== */
/* @family. — inbox.js — THE EMAIL WIDGET (493): the owner's Gmail, read-only, admin only, a static overview (547). backend/inbox.gs; docs/history/493, 547. */

/* ONE STATE, the list as last asked. Never stored: an inbox is not kept on a phone or in a sheet. */
const INBOX_ = { rows: [], said: '', busy: false };
/* THE LAST FOUR, STATIC (owner, 29 Oct and 1 Nov): "just static overview" -- sender, subject, time, snippet; nothing opens, no search, chips or More (547). */
const INBOX_SHOWN = 4;

function inboxWhen_(ms) {
  if (!ms) return '';
  const d = new Date(ms), now = new Date();
  return d.toDateString() === now.toDateString() ? time_(d) : date_(d);
}
function inboxRowHtml_(r) {
  return `<div class="row ib-item${r.unread ? ' is-unread' : ''}">
    <span class="ib-dot" aria-label="${r.unread ? 'Unread' : ''}"></span>
    <span class="ib-from">${esc(r.from || '(no sender)')}${r.count > 1 ? ` <small>${r.count}</small>` : ''}</span>
    <span class="ib-at">${esc(inboxWhen_(r.at))}</span>
    <span class="ib-subj">${esc(r.subject || '(no subject)')}</span>
    <span class="ib-snip">${esc(r.snippet)}</span>
  </div>`;
}

function inboxHtml_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  const list = INBOX_.rows.length ? INBOX_.rows.slice(0, INBOX_SHOWN).map(inboxRowHtml_).join('')
    : (INBOX_.busy || INBOX_.said ? '' : empty_());
  return `<div class="ib-list"${INBOX_.busy ? ' aria-busy="true"' : ''}>${list}${INBOX_.busy ? loading_() : ''}</div>`;
}

/* THE CARD ON SITE (500): the owner asked for it there, beside the weekly email, not in Tools. Drawn with what is already known; initInbox asks. */
function inboxCard_() {
  /* THE CARD ASKS FOR ITSELF WHEN DRAWN, wherever it is drawn (Find › Settings, not only its old column). */
  if (!INBOX_.rows.length && !INBOX_.busy) setTimeout(() => { try { initInbox(); } catch (e) {} }, 0);
  return card_(`<div class="biz inbox-card">
    <h3>Email</h3>
    <div class="ib-box" id="ib-box">${inboxHtml_()}</div>
  </div>`);
}

function inboxPaint_() {
  document.querySelectorAll('.ib-box').forEach(b => { b.innerHTML = inboxHtml_(); });
}

/* ---------- ASKING: the inbox's newest threads, the first four kept. Read-only: nothing here writes to Gmail. */
function inboxFetch_() {
  if (!can_(myRole_(), 'action', 'inboxList') || INBOX_.busy) return;
  const f = (typeof DATA !== 'undefined' && DATA && DATA.features) || [];
  if (f.length && f.indexOf('inboxList') < 0) {
    INBOX_.said = 'The live backend has no Email yet. In Apps Script: sync, run authoriseGmail and Allow (tick every box), THEN Deploy → New version.';
    inboxPaint_(); return;
  }
  INBOX_.busy = true;
  INBOX_.rows = [];
  INBOX_.said = '';
  inboxPaint_();
  send_({ action: 'inboxList', q: 'in:inbox', page: '', name: USER.name, personId: USER.personId }, {})
    .then(d => {
      INBOX_.busy = false;
      if (!d || d.error) { INBOX_.said = (d && d.error) || 'Gmail did not answer.'; }
      else {
        INBOX_.rows = (d.rows || []).slice(0, INBOX_SHOWN);
        if (!INBOX_.rows.length) INBOX_.said = 'Nothing in the inbox.';
      }
      inboxPaint_();
    })
    .catch(err => { INBOX_.busy = false; INBOX_.said = why_(err); inboxPaint_(); });
}

function initInbox() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  inboxPaint_();
  if (!INBOX_.rows.length && !INBOX_.busy) inboxFetch_();
}

;
