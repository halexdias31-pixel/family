/* js/one-place.js: the owner's inbox — the questions data/settings/owner-questions.json, the answers the owner_answers tab — and What's missing under it. */
const OQ = { list: null, answers: null, error: '', asking: false, watching: false };

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

/* THE ONE CARD (rule 1.75, no scores): the owner's inbox, then What's missing. */
function checksInner_() {
  return cardBlocks_([{ type: 'group', look: 'qtags', inner: qtag_('Business') + qtag_('Admin only') }, { type: 'msgHead', text: 'Owner questions' }]) + oqInbox_();
}
function checksCard_() {
  if (!(typeof may_ === 'function' && may_('admin'))) return '';
  let more = '';
  try { more = typeof missingCard_ === 'function' && missingFor_() ? missingCard_() : ''; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'checks detail'); }
  return card_(cardBlock_({ type: 'group', look: 'checks-card', attrs: { 'data-checks': true }, inner: checksInner_() }) + more);
}
const checksDraw_ = () => { document.querySelectorAll('[data-checks]').forEach(c => { cardFill_(c, checksInner_()); }); };

on('oq-answer', el => {
  if (!may_('admin')) return;
  const id = el.dataset.id, choice = el.dataset.choice, box = el.closest('.oq-item');
  if (!box || !OQ.answers) { toast(text_('the-answers-are-still-on-their')); return; }
  const note = String((box.querySelector('[data-oq-note]') || {}).value || '').trim();
  if (choice === 'note' && !note) { toast(text_('write-the-note-first')); return; }
  send_({ action: 'item', door: 'save', item: 'ownerAnswer', name: USER && USER.name, id, choice, note },
        { button: el, where: box.querySelector('.oq-said'), busy: 'Saving…' })
    .then(d => { OQ.answers[id] = (d && d.answer) || { id, choice, note }; checksDraw_(); })
    .catch(() => { /* send_ already said why in the line */ });
});

/* CHECKS REGISTERS ITSELF as a health card (`healthCardOf_`, missing.js) once every file has run, whatever the load order. */
setTimeout(() => { if (typeof HEALTH_MORE_ !== 'undefined') HEALTH_MORE_.checks = checksCard_; }, 0);
