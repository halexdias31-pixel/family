/* ---------- WORK ON FILE (owner, 11 Nov): a student photographs or scans a page and it stays on their account, in their own private Drive folder. */
/* The backend (workfile.gs) decides who may see: the student, a parent they accepted, a booked tutor, the admin; only the student or admin deletes. */
const WF_MAX = 6;
/* PER STUDENT, IN MEMORY ONLY: `rows` as `workFilesOf` sent them (null until asked), `pending` the pages picked and not yet saved. */
const WF = {};
const wfOf_ = pid => WF[pid] || (WF[pid] = { rows: null, asked: false, mayDelete: false, pending: [], others: [], say: '' });

/* THE CARD: the same one in your own settings and under a student a parent or the admin may see; one master template (card_). */
function workFileCard_(pid) {
  const of = String(pid || (USER && USER.personId) || '');
  if (!of || !USER || USER.lockedPreview) return '';
  return card_(`<div class="workfile-card" data-of="${esc(of)}"><h3>Work on file</h3>${wfBody_(of)}</div>`);
}
/* A TUTOR'S OWN CARD holds no scans of theirs: it opens each booked student's file (`others`, from the backend). */
const wfTeach_ = of => !!USER && String(of) === String(USER.personId || '') && typeof rank_ === 'function' && rank_() === 'staff';
function wfBody_(of) {
  const s = wfOf_(of);
  if (!s.asked) setTimeout(() => wfLoad_(of), 0);
  if (wfTeach_(of)) return s.rows === null ? loading_() : (s.others || []).length
    ? `<div class="tile-row">${s.others.map(o => workFileTile_(o.id, o.name)).join('')}</div>`
    : '<p class="note">Your booked students\' scanned work shows here.</p>';
  const pend = s.pending.length ? `<div class="wf-pend"><div class="qp-work-pics">${s.pending.map((p, i) => `<span class="qp-work-pic"><img src="${esc(p)}" alt="New page ${i + 1}">
      ${tile_({ form: true, look: 'qp-work-x', act: 'wf-x', data: { of, i }, aria: 'Remove page ' + (i + 1), label: '×' })}</span>`).join('')}</div>
    <label class="wf-line">Title <input class="wf-title" data-of="${esc(of)}" maxlength="80" placeholder="Optional"></label>
    <label class="wf-line">Subject <input class="wf-subject" data-of="${esc(of)}" maxlength="40" placeholder="Optional"></label></div>` : '';
  const tiles = tile_({ icon: 'photo', label: 'Scan a page', note: 'camera or photos', act: 'wf-pick', data: { of } })
    + (s.pending.length ? tile_({ icon: 'save', label: 'Save to file', note: s.pending.length + ' page' + (s.pending.length === 1 ? '' : 's'), act: 'wf-save', cls: 'is-submit', data: { of } }) : '');
  return `${pend}<div class="tile-row">${tiles}</div>
    <p class="wf-say note" role="status" aria-live="polite">${esc(s.say)}</p>
    <div class="wf-list">${wfList_(of)}</div>`;
}
function wfList_(of) {
  const s = wfOf_(of);
  if (s.rows === null) return loading_();
  if (!s.rows.length) return '<p class="note">Nothing on file yet. Scan a page to keep it here.</p>';
  return `<ul class="wf-rows">${s.rows.map(r => `<li class="wf-row">
    ${r.thumb ? `<img class="wf-thumb" src="${esc(r.thumb)}" alt="">` : '<span class="wf-thumb" aria-hidden="true"></span>'}
    <span class="wf-what"><span class="wf-name">${esc(r.title || r.subject || 'Scanned work')}</span>
      <span class="wf-when note">${esc(wfDate_(r.at))}${r.subject && r.title ? ' · ' + esc(r.subject) : ''} · ${esc(String(r.pages || 1))} page${r.pages === 1 ? '' : 's'}${r.by && r.by !== 'you' ? ' · by ' + esc(r.by) : ''}</span></span>
    ${tile_({ icon: 'open', label: 'Open', note: 'see the pages', act: 'wf-open', data: { id: r.id, title: r.title || 'Scanned work' } })}
    ${s.mayDelete ? tile_({ icon: 'bin', label: 'Delete', note: 'from your file', act: 'wf-del', data: { id: r.id, of } }) : ''}</li>`).join('')}</ul>`;
}
const wfDate_ = ms => { try { return ms ? date_(Number(ms)) : ''; } catch (e) { return ''; } };
/* THE CARD IS DRAWN AGAIN WHOLE (cardFill_): the template cuts its insides into its own parts, so there is no inner box to refill. */
function wfPaint_(of) {
  document.querySelectorAll('.workfile-card[data-of], .wf-seen[data-of]').forEach(el => {
    if (el.getAttribute('data-of') !== of) return;
    const keep = {};
    el.querySelectorAll('.wf-title, .wf-subject').forEach(i => { keep[i.className] = i.value; });
    if (el.classList.contains('wf-seen')) el.innerHTML = wfBody_(of);
    else if (typeof cardFill_ === 'function') cardFill_(el, '<h3>Work on file</h3>' + wfBody_(of));
    el.querySelectorAll('.wf-title, .wf-subject').forEach(i => { if (keep[i.className]) i.value = keep[i.className]; });
  });
}
function wfLoad_(of) {
  const s = wfOf_(of);
  if (s.asked || typeof api !== 'function' || !USER || !USER.token) return;
  s.asked = true;
  apiKept_({ action: 'workFilesOf', personId: USER.personId || '', of }, d => {
    if (!d || !d.success) { s.rows = []; s.say = (d && (d.message || d.error)) || 'Could not load the work on file'; }
    else { s.rows = Array.isArray(d.work) ? d.work : []; s.mayDelete = !!d.mayDelete; s.others = Array.isArray(d.others) ? d.others : []; }
    wfPaint_(of);
  }).catch(() => { s.rows = []; s.say = 'Could not reach the server'; wfPaint_(of); });
}
const wfAgain_ = of => { const s = wfOf_(of); s.asked = false; s.rows = null; wfLoad_(of); };

/* THE PICKER (working.js's): camera first on a phone, the library one tap away, several at once; each page shrunk on the phone. */
on('wf-pick', el => {
  const of = el.getAttribute('data-of'), s = wfOf_(of);
  if (s.pending.length >= WF_MAX) { s.say = WF_MAX + ' pages at most — save these first'; wfPaint_(of); return; }
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*'; /* any picture the phone can take or holds */
  inp.multiple = true;
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')) inp.setAttribute('capture', 'environment');
  inp.hidden = true;
  inp.addEventListener('change', () => { wfAdd_(of, [].slice.call(inp.files || [])); inp.remove(); });
  document.body.appendChild(inp);
  inp.click();
});
function wfAdd_(of, files) {
  const s = wfOf_(of), take = files.filter(f => f && /^image\//.test(f.type || 'image/')).slice(0, Math.max(0, WF_MAX - s.pending.length));
  if (!take.length || typeof workShrink_ !== 'function') return Promise.resolve();
  return Promise.all(take.map(f => workShrink_(f).catch(() => null))).then(got => {
    const ok = got.filter(Boolean);
    s.pending = s.pending.concat(ok).slice(0, WF_MAX);
    s.say = ok.length < take.length ? 'A photo could not be read — try taking it again' : '';
    wfPaint_(of);
  });
}
on('wf-x', el => { const of = el.getAttribute('data-of'); wfOf_(of).pending.splice(Number(el.getAttribute('data-i')), 1); wfPaint_(of); });

on('wf-save', el => {
  const of = el.getAttribute('data-of'), s = wfOf_(of);
  if (!s.pending.length || el.disabled || !USER || !USER.token) return;
  const box = el.closest('.workfile-card, .wf-seen');
  const val = c => { const i = box && box.querySelector(c); return i ? i.value : ''; };
  el.disabled = true;
  api({ action: 'workFileSave', personId: USER.personId || '', of, title: val('.wf-title'), subject: val('.wf-subject'), pages: s.pending.slice() })
    .then(d => {
      el.disabled = false;
      if (!d || !d.success) { s.say = (d && (d.message || d.error)) || 'Could not save — try again'; wfPaint_(of); return; }
      s.pending = []; s.say = 'Saved to file';
      if (box) box.querySelectorAll('.wf-title, .wf-subject').forEach(i => { i.value = ''; });
      wfAgain_(of);
      wfPaint_(of);
    })
    .catch(() => { el.disabled = false; s.say = 'Could not reach the server — your pages are still here'; wfPaint_(of); });
});

on('wf-open', el => {
  const id = el.getAttribute('data-id'), title = el.getAttribute('data-title') || 'Scanned work';
  if (!id || !USER || !USER.token) return;
  openSheet(title, `<div class="wf-pages">${loading_()}</div>`);
  api({ action: 'workFileOpen', personId: USER.personId || '', id }).then(d => {
    const box = document.querySelector('.wf-pages');
    if (!box) return;
    loaded_(box);
    if (!d || !d.success) { box.textContent = (d && (d.message || d.error)) || 'Could not open it'; return; }
    box.innerHTML = (d.pages || []).map((u, i) => `<img class="wf-page" src="${esc(u)}" alt="Page ${i + 1}">`).join('') || '<p class="note">No pages could be read.</p>';
  }).catch(() => { const box = document.querySelector('.wf-pages'); if (box) { loaded_(box); box.textContent = 'Could not reach the server'; } });
});

on('wf-del', el => {
  const id = el.getAttribute('data-id'), of = el.getAttribute('data-of');
  if (!id || typeof sure_ === 'function' && !sure_(el, 'Delete?')) return;
  api({ action: 'workFileDelete', personId: USER.personId || '', id }).then(d => {
    const s = wfOf_(of);
    if (!d || !d.success) { s.say = (d && (d.message || d.error)) || 'Could not delete it'; wfPaint_(of); return; }
    s.rows = (s.rows || []).filter(r => r.id !== id); s.say = 'Deleted';
    wfPaint_(of);
  }).catch(() => toast('Could not reach the server'));
});

/* AND UNDER A STUDENT SOMEONE ELSE MAY SEE (a parent's child, the admin's list): the same card, opened in place. */
function workFileTile_(pid, name) {
  return pid ? tile_({ icon: 'doc', label: name ? String(name) : 'Work on file', note: name ? 'their work on file' : 'their scanned pages', act: 'wf-see', data: { id: pid } }) : '';
}
on('wf-see', el => {
  const pid = el.getAttribute('data-id'), row = el.closest('.tile-row') || el;
  const next = row.nextElementSibling;
  if (next && next.classList.contains('wf-seen')) { next.remove(); return; }
  const box = document.createElement('div');
  box.className = 'wf-seen';
  box.setAttribute('data-of', pid);
  box.innerHTML = wfBody_(pid);
  row.insertAdjacentElement('afterend', box);
});
