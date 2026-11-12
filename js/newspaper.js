/* @family. — newspaper.js SUNDAY FUNDAY (owner, 12 Nov): a Sunday paper's fun section on one card, one page, read from data/settings/newspaper.json. */

/* ASKED ONCE, when the card first starts: no other screen reads it, so it is never on the first load. */
let NP = null, NP_ASK = null, NP_SHOW = false;
function npAsk_() {
  if (NP_ASK) return NP_ASK;
  NP_ASK = fetch('data/settings/newspaper.json' + deployStamp_(), { cache: 'default' }).then(r => (r.ok ? r.json() : null))
    .then(j => { NP = j && Array.isArray(j.rows) ? j : { rows: [] }; }, () => { NP = { rows: [] }; });
  return NP_ASK;
}
function npHtml_() {
  if (!NP) return loading_();
  const rows = (NP.rows || []).filter(r => r && r.q);
  if (!rows.length) return '<p class="note">This week\'s paper did not arrive.</p>';
  const any = rows.some(r => r.a);
  return rows.map(r => `<div class="np-item"><p class="np-head">${esc(r.head || '')}</p><p class="np-q">${esc(r.q)}</p>${
    r.a && NP_SHOW ? `<p class="np-a">${esc(r.a)}</p>` : ''}</div>`).join('')
    + (any ? `<div class="tile-row">${tile_({ icon: NP_SHOW ? 'hide' : 'show', label: NP_SHOW ? 'Hide' : 'Answers', note: NP_SHOW ? 'the answers' : 'show them', act: 'np-answers', pressed: NP_SHOW })}</div>` : '');
}
function npPaint_() { document.querySelectorAll('[id="np-box"]').forEach(el => { el.innerHTML = npHtml_(); }); }
function initNewspaper_() { npPaint_(); npAsk_().then(npPaint_); }
on('np-answers', () => { NP_SHOW = !NP_SHOW; npPaint_(); });
