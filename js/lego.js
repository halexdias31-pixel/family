/* @family. — lego.js THE LEGO PIECE CHECK (owner, 12 Nov): "make sure all the pieces of a set are there", for the trade-in. */
/* A set is picked (data/lego-sets.json, or a typed number) with its parts list pasted; then batch by batch, three photos of one pile */
/* shaken between shots, each batch counted by the marking model (`legoCount`) and added to a tally kept on this device. */

const LEGO_SHOTS = 3;
let LEGO_SETS = null;
let LEGO_PICS = [];
let LEGO_BUSY = false;
const legoKey_ = () => KEPT_PREFIX + payloadFor_().who + ':lego';
const legoFresh_ = () => ({ set: '', name: '', parts: [], batch: 1, tally: {}, done: false, say: '', typed: { num: '', parts: '' } });
/* THE KEPT STORE (data-text.js), the device's one store: finished batches survive a refresh; a half-shot batch's photos are retaken. */
function legoRead_() {
  let o = null;
  try { o = payloadFor_().who ? keptGet_(legoKey_(), true) : null; } catch (e) { o = null; }
  return Object.assign(legoFresh_(), o || {});
}
let LEGO = null;
const legoNow_ = () => (LEGO || (LEGO = legoRead_()));
function legoWrite_() { try { if (payloadFor_().who) keptPut_(legoKey_(), JSON.stringify(legoNow_())); } catch (e) { /* not kept: this visit still counts */ } }

/* ONE NAME PER PIECE: part and colour, case and spaces ignored, so the model's "3001 | Red" meets the list's "3001, red". */
const legoId_ = (part, colour) => (String(part || '').trim() + '|' + String(colour || '').trim()).toLowerCase().replace(/\s+/g, ' ');
/* A PASTED LIST, one piece a line: "part, colour, qty" (commas, tabs or semicolons), or "part colour qty" with spaces. */
function legoParse_(text) {
  return String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
    let f = l.split(/\s*[,\t;]\s*/).filter(Boolean);
    if (f.length < 2) f = l.split(/\s+/);
    const qty = /^\d+$/.test(f[f.length - 1]) ? Number(f.pop()) : 1;
    return { part: f[0] || '', colour: f.slice(1).join(' '), qty: qty };
  }).filter(p => p.part && p.qty > 0);
}

/* FOUND AGAINST NEEDED: every listed piece with what the batches counted, and the ones short. */
function legoResult_(s) {
  const tally = s.tally || {};
  const rows = (s.parts || []).map(p => ({ part: p.part, colour: p.colour, need: p.qty, got: Number(tally[legoId_(p.part, p.colour)]) || 0 }));
  const total = Object.keys(tally).reduce((n, k) => n + (Number(tally[k]) || 0), 0);
  return { rows: rows, missing: rows.filter(r => r.got < r.need), total: total, need: rows.reduce((n, r) => n + r.need, 0) };
}

function legoSets_() {
  if (LEGO_SETS || typeof fetch !== 'function') return;
  LEGO_SETS = [];
  fetch('data/lego-sets.json' + (typeof deployStamp_ === 'function' ? deployStamp_() : ''), { cache: 'default' })
    .then(r => r.json()).then(rows => { LEGO_SETS = (Array.isArray(rows) ? rows : []).filter(r => r && r.set_number); legoRedraw_(); })
    .catch(() => { /* no list: a number can still be typed */ });
}

const legoLine_ = t => `<p>${esc(t)}</p>`;
/* THE CARD'S ONE ROUND TILE IS THE STEP DUE NOW; the other steps are the form's buttons, which stay in the card (`kcHoist_`). */
const legoBtns_ = list => `<div class="btn-row">${list.map(o => tile_(Object.assign({ form: true, kind: 'quiet' }, o))).join('')}</div>`;
function legoPick_() {
  const sets = LEGO_SETS || [];
  return `${legoLine_('Pick the set, or type its number, then paste its parts list: one piece a line, "part, colour, qty".')}
    ${sets.map((r, i) => (i % 2 ? '' : legoBtns_(sets.slice(i, i + 2).map(x => ({ label: x.set_number + ' ' + (x.name || '').replace(/^LEGO\s+/, ''), act: 'lego-set', data: { v: x.set_number }, cls: 'lego-pick', pressed: false }))))).join('')}
    <label class="field">Set number <input type="text" class="lego-num" value="${esc(legoNow_().typed.num)}" maxlength="12" autocomplete="off" aria-label="Set number"></label>
    <label class="field">Parts list <textarea class="lego-parts" rows="5" placeholder="3001, Red, 4" aria-label="Parts list">${esc(legoNow_().typed.parts)}</textarea></label>
    <div class="tile-row">${tile_({ icon: 'play', label: 'Start', act: 'lego-start' })}</div>`;
}
function legoSteps_() {
  const s = legoNow_(), n = LEGO_PICS.length;
  const next = n === 0 ? 'Spread the pile out and take photo 1.' : n < LEGO_SHOTS ? 'Shake the pile, then take photo ' + (n + 1) + '.' : LEGO_SHOTS + ' photos taken: next batch, or finished.';
  const sent = s.batch - 1;
  const step = n < LEGO_SHOTS ? { icon: 'photo', label: 'Photo ' + (n + 1), act: 'lego-shot', off: LEGO_BUSY } : { icon: 'send', label: 'Next batch', act: 'lego-next', off: LEGO_BUSY };
  return `${legoLine_(s.set + (s.name ? ' ' + s.name : '') + ' · ' + (s.parts || []).length + ' kinds of piece listed')}
    <h4>Batch ${s.batch} · photo ${Math.min(n + 1, LEGO_SHOTS)} of ${LEGO_SHOTS}</h4>
    ${legoLine_(LEGO_BUSY ? 'Counting batch ' + s.batch + '…' : next)}
    ${LEGO_BUSY ? loading_() : ''}
    ${legoLine_('Counted so far: ' + legoResult_(s).total + ' pieces in ' + sent + ' batch' + (sent === 1 ? '' : 'es') + '.')}
    ${s.say ? legoLine_(s.say) : ''}
    ${legoBtns_([
      { label: 'Next batch', act: 'lego-next', off: LEGO_BUSY || !n, hidden: n >= LEGO_SHOTS },
      { label: 'Finished', act: 'lego-done', off: LEGO_BUSY },
      { label: 'Start again', act: 'lego-reset', off: LEGO_BUSY },
    ].filter(o => !o.hidden))}
    <div class="tile-row">${tile_(step)}</div>`;
}
function legoEnd_() {
  const s = legoNow_(), r = legoResult_(s);
  const found = r.rows.reduce((n, x) => n + Math.min(x.got, x.need), 0);
  return `${legoLine_(s.set + (s.name ? ' ' + s.name : '') + ' · ' + (s.batch - 1) + ' batches')}
    <h4>Found ${found} of ${r.need}</h4>
    ${r.rows.length ? (r.missing.length
      ? `<p><b>Missing</b></p>${r.missing.map(m => legoLine_(m.part + (m.colour ? ' ' + m.colour : '') + ': ' + (m.need - m.got) + ' short (' + m.got + ' of ' + m.need + ')')).join('')}`
      : legoLine_('Every listed piece was counted.'))
    : legoLine_('No parts list was given, so nothing is missing by it: ' + r.total + ' pieces counted.')}
    ${s.say ? legoLine_(s.say) : ''}
    <div class="tile-row">${tile_({ icon: 'undo', label: 'Start again', act: 'lego-reset' })}</div>`;
}
const legoBody_ = () => '<h3>LEGO piece check</h3>' + (legoNow_().done ? legoEnd_() : legoNow_().set ? legoSteps_() : legoPick_());

function legoCards_() {
  if (!USER || !rankAtLeast_('staff')) return [];
  legoSets_();
  return [card_(`<div class="lego-check" data-lay-card="staff:lego">${legoBody_()}</div>`)];
}
/* EVERY COPY ON THE PAGE (both finders) drawn again, as the same element (`cardFill_`), as the flyer maker's. */
function legoRedraw_() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.card.lego-check').forEach(c => cardFill_(c, legoBody_()));
}

/* PICKING A SET ONLY FILLS THE NUMBER: the parts list is pasted before Start. */
on('lego-set', el => {
  const box = el.closest('.lego-check'), num = box && box.querySelector('.lego-num');
  if (num) num.value = el.dataset.v || '';
  legoNow_().typed.num = el.dataset.v || ''; legoWrite_();
  if (box) box.querySelectorAll('.lego-pick').forEach(t => t.setAttribute('aria-pressed', t === el ? 'true' : 'false'));
});
on('lego-start', el => {
  const box = el.closest('.lego-check');
  const num = String(((box && box.querySelector('.lego-num')) || {}).value || legoNow_().set).trim();
  if (!num) { toast('Pick a set or type its number'); return; }
  const row = (LEGO_SETS || []).find(r => String(r.set_number) === num);
  LEGO = Object.assign(legoFresh_(), { set: num, name: row ? String(row.name || '').replace(/^LEGO\s+/, '') : '', parts: legoParse_(((box && box.querySelector('.lego-parts')) || {}).value) });
  LEGO_PICS = [];
  legoWrite_();
  legoRedraw_();
});
/* THE CAMERA: one shot a press, the back camera first (`capture`), shrunk as a working photo is (`workShrink_`). */
on('lego-shot', () => {
  if (LEGO_PICS.length >= LEGO_SHOTS || typeof document === 'undefined') return;
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.setAttribute('capture', 'environment');
  inp.className = 'lego-file';
  inp.hidden = true;
  inp.addEventListener('change', () => { legoAdd_((inp.files || [])[0]); inp.remove(); });
  document.body.appendChild(inp);
  inp.click();
});
function legoAdd_(file) {
  if (!file) return Promise.resolve();
  const shrink = typeof workShrink_ === 'function' ? workShrink_(file) : Promise.reject(new Error('no shrinker'));
  return shrink.then(url => { LEGO_PICS.push(url); legoNow_().say = ''; legoRedraw_(); })
    .catch(() => { toast('That photo could not be used — try again'); });
}
/* ONE ASK PER BATCH, all its photos together; the reply's counts (the most seen in any one shot) are added to the tally. */
function legoSend_() {
  const s = legoNow_();
  if (!LEGO_PICS.length) return Promise.resolve(true);
  LEGO_BUSY = true;
  legoRedraw_();
  return Promise.resolve(api({ action: 'legoCount', personId: (USER && USER.personId) || '', set: s.set + (s.name ? ' ' + s.name : ''),
    parts: (s.parts || []).map(p => ({ part: p.part, colour: p.colour })), images: LEGO_PICS.slice() }))
    .then(d => {
      if (!d || !d.success) { s.say = (d && (d.message || d.error)) || 'The batch could not be counted — try again.'; return false; }
      (d.counts || []).forEach(c => { const k = legoId_(c.part, c.colour); s.tally[k] = (Number(s.tally[k]) || 0) + (Number(c.count) || 0); });
      s.batch += 1; s.say = ''; LEGO_PICS = [];
      return true;
    })
    .catch(e => { s.say = typeof why_ === 'function' ? why_(e) : 'The batch could not be counted — try again.'; return false; })
    .then(ok => { LEGO_BUSY = false; legoWrite_(); legoRedraw_(); return ok; });
}
on('lego-next', () => { if (!LEGO_BUSY) legoSend_(); });
on('lego-done', () => {
  if (LEGO_BUSY) return;
  legoSend_().then(ok => { if (!ok) return; legoNow_().done = true; legoWrite_(); legoRedraw_(); });
});
on('lego-reset', el => {
  if (LEGO_BUSY || !sure_(el, 'Tap again to start again')) return;
  LEGO = legoFresh_(); LEGO_PICS = [];
  legoWrite_();
  legoRedraw_();
});
/* WHAT IS TYPED IS KEPT AS IT IS TYPED (the kept store, `legoWrite_`), so a reload before Start keeps the number and the pasted list. */
try {
  document.addEventListener('input', e => {
    const t = e.target, k = t && t.classList ? (t.classList.contains('lego-num') ? 'num' : t.classList.contains('lego-parts') ? 'parts' : '') : '';
    if (!k) return;
    legoNow_().typed[k] = String(t.value || ''); legoWrite_();
  });
} catch (e) { /* no document in a check */ }
