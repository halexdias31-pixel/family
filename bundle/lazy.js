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
  return `<div class="oq-item" data-oq="${esc(q.id)}">
    <p class="oq-q">${q.philosophy ? qtag_('Philosophy') + ' ' : ''}${esc(q.question)}</p>
    <div class="tile-row">${opts.map(k => tile_({ form: true, kind: a && a.choice === k ? '' : 'quiet', label: k + ') ' + q.options[k], act: 'oq-answer', data: { id: q.id, choice: k } })).join('')}</div>
    <label class="field"><input type="text" data-oq-note value="${esc((a && a.note) || '')}" placeholder="Something else…" maxlength="500" aria-label="${esc(q.question)} — something else" autocomplete="off"></label>
    <div class="tile-row">${tile_({ form: true, kind: 'quiet', label: 'Send note', act: 'oq-answer', data: { id: q.id, choice: 'note' } })}</div>
    <p class="me-said oq-said">${esc(said) || '&nbsp;'}</p>
  </div>`;
}
/* THE INBOX: the five open questions that settle most (philosophy first, then `settles`, then file order); answered fold away. */
const OQ_SHOWN = 5;
const oqDone_ = q => q.status === 'answered' || !!(OQ.answers || {})[q.id];
const oqWeight_ = q => (q.philosophy ? 100 : 0) + (Number(q.settles) || 0);
function oqInbox_() {
  if (!OQ.list) { oqStart_(); return '<h4>Owner questions</h4>' + (typeof loading_ === 'function' ? loading_() : ''); }
  const open = OQ.list.filter(q => !oqDone_(q)).map((q, i) => ({ q, i })).sort((x, y) => oqWeight_(y.q) - oqWeight_(x.q) || x.i - y.i).map(x => x.q);
  const done = OQ.list.filter(oqDone_);
  return `<h4>Owner questions · ${open.length} open${open.length > OQ_SHOWN ? ', ' + OQ_SHOWN + ' shown' : ''}</h4>${OQ.error ? `<p class="me-said">${esc(OQ.error)}</p>` : ''}${open.slice(0, OQ_SHOWN).map(oqItem_).join('')}
    ${done.length ? `<details class="oq-done"><summary>Answered · ${done.length}</summary>${done.map(oqItem_).join('')}</details>` : ''}`;
}

function checksInner_() {
  const s = typeof HEALTH !== 'undefined' ? HEALTH.got : null;
  if (typeof siteHealthCard_ === 'function' && typeof HEALTH !== 'undefined' && !HEALTH.asked) siteHealthCard_();
  const head = '<div class="qtags">' + qtag_('Business') + qtag_('Admin only') + '</div><h3>Optimiser</h3>';
  if (!s) return head + (HEALTH && HEALTH.failed ? '<p class="me-said">The score could not be read. Run node tools/health.js and push.</p>' : (typeof loading_ === 'function' ? loading_() : '')) + oqInbox_();
  const A = checksAreas_(s);
  return `${head}<p class="stab-score">Optimiser: ${esc(String(checksTotal_(s, A)))}%</p>
    ${CHECK_AREAS.filter(([k]) => A[k]).map(([k, n]) => `<h4>${esc(n)} ${esc(String(A[k].score))}%${(s.weights || {})[k] ? '' : ' ' + qtag_('inside the others')}</h4>
      <ol class="stab-top">${(A[k].next || []).slice(0, 3).map(t => `<li>${esc(String(t))}</li>`).join('') || '<li>Nothing to do.</li>'}</ol>`).join('')}
    ${oqInbox_()}`;
}
/* THE ONE CARD, then the detail it sums (the Optimiser's code worklist with What's missing, and the business checker's ticks), nothing lost. */
function checksCard_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  let more = '';
  try { more = (typeof healthWithMissing_ === 'function' ? healthWithMissing_(siteHealthCard_(true)) : '') + (typeof window.bizCheckCard_ === 'function' ? window.bizCheckCard_() : ''); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'checks detail'); }
  if (!checksBizLive_()) setTimeout(checksWatchBiz_, 0);
  return card_(`<div class="checks-card" data-checks>${checksInner_()}</div>${more}`);
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
