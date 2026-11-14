/* ---------- WORK ON FILE (owner, 11 Nov): a student photographs or scans a page and it stays on their account, in their own private Drive folder. */
/* The backend (workfile.gs) decides who may see: the student, a parent they accepted, a booked tutor, the admin; only the student or admin deletes. */
const WF_MAX = 6;
/* PER STUDENT, IN MEMORY ONLY: `rows` as `workFilesOf` sent them (null until asked), `pending` the pages picked and not yet saved. */
const WF = {};
const wfOf_ = pid => WF[pid] || (WF[pid] = { rows: null, asked: false, mayDelete: false, pending: [], others: [], say: '' });

/* THE CARD: the same one in your own settings and under a student a parent or the admin may see; one master template (renderCard). */
function workFileCard_(pid) {
  const of = String(pid || (USER && USER.personId) || '');
  if (!of || !USER || USER.lockedPreview) return '';
  return renderCard(wfSpec_(of));
}
/* ITS SPEC: the scan and save tiles stand in the card's own tile row; under someone else's student they sit among the lines (`wfBody_`). */
const wfSpec_ = of => ({ kind: 'panel', look: 'workfile-card', name: 'Work on file', tags: [{ text: 'Work on file' }], data: { of },
  body: wfBody_(of, true), tiles: wfTeach_(of) ? [] : wfTiles_(of) });
/* A TUTOR'S OWN CARD holds no scans of theirs: it opens each booked student's file (`others`, from the backend). */
const wfTeach_ = of => !!USER && String(of) === String(USER.personId || '') && typeof rank_ === 'function' && rank_() === 'staff';
const wfNote_ = text => ({ type: 'group', tag: 'p', look: 'note', text });
const wfTiles_ = of => { const s = wfOf_(of);
  return (s.pending.length ? [{ icon: 'save', label: 'Save to file', note: s.pending.length + ' page' + (s.pending.length === 1 ? '' : 's'), act: 'wf-save', cls: 'is-submit', data: { of } }] : [])
    .concat({ icon: 'photo', label: 'Scan a page', note: 'camera or photos', act: 'wf-pick', data: { of } }); };
/* THE INSIDES AS BLOCKS: `inCard` leaves the scan and save tiles to the card's row. */
function wfBody_(of, inCard) {
  const s = wfOf_(of);
  if (!s.asked) setTimeout(() => wfLoad_(of), 0);
  if (wfTeach_(of)) return [s.rows === null ? { type: 'wait', on: true } : (s.others || []).length
    ? { type: 'tiles', tiles: s.others.map(o => workFileOpts_(o.id, o.name)) }
    : wfNote_('Your booked students\' scanned work shows here.')];
  const line = (text, box) => ({ type: 'group', tag: 'label', look: 'wf-line', text: text + ' ', blocks: [box] });
  const pend = s.pending.length ? { type: 'group', look: 'wf-pend', blocks: [{ type: 'group', look: 'qp-work-pics', blocks: s.pending.map((p, i) => ({ type: 'group', tag: 'span', look: 'qp-work-pic',
      blocks: [{ type: 'media', kind: 'image', src: p, title: 'New page ' + (i + 1) }],
      tiles: [{ form: true, look: 'qp-work-x', act: 'wf-x', data: { of, i }, aria: 'Remove page ' + (i + 1), label: '×' }] })) },
    line('Title', { type: 'control', attrs: { class: 'wf-title', 'data-of': of, maxlength: 80, placeholder: 'Optional' } }),
    line('Subject', { type: 'control', attrs: { class: 'wf-subject', 'data-of': of, maxlength: 40, placeholder: 'Optional' } })] } : null;
  return [pend, inCard ? null : { type: 'tiles', tiles: wfTiles_(of).reverse() },
    { type: 'group', tag: 'p', look: 'wf-say note', attrs: { role: 'status', 'aria-live': 'polite' }, text: s.say },
    { type: 'group', look: 'wf-list', blocks: wfList_(of) }];
}
function wfList_(of) {
  const s = wfOf_(of);
  if (s.rows === null) return [{ type: 'wait', on: true }];
  if (!s.rows.length) return [wfNote_('Nothing on file yet. Scan a page to keep it here.')];
  const span = (look, text) => ({ type: 'group', tag: 'span', look, text });
  return [{ type: 'group', look: 'wf-rows', attrs: { role: 'list' }, blocks: s.rows.map(r => ({ type: 'group', look: 'row wf-item', attrs: { role: 'listitem' },
    blocks: [r.thumb ? { type: 'media', kind: 'image', look: 'wf-thumb', src: r.thumb } : { type: 'group', tag: 'span', look: 'wf-thumb', attrs: { 'aria-hidden': 'true' } },
      { type: 'group', tag: 'span', look: 'wf-what', blocks: [span('wf-name', r.title || r.subject || 'Scanned work'),
        span('wf-when note', wfDate_(r.at) + (r.subject && r.title ? ' · ' + r.subject : '') + ' · ' + String(r.pages || 1) + ' page' + (r.pages === 1 ? '' : 's') + (r.by && r.by !== 'you' ? ' · by ' + r.by : ''))] }],
    tiles: [{ icon: 'open', label: 'Open', note: 'see the pages', act: 'wf-open', data: { id: r.id, title: r.title || 'Scanned work' } }]
      .concat(s.mayDelete ? [{ icon: 'bin', label: 'Delete', note: 'from your file', act: 'wf-del', data: { id: r.id, of } }] : []) })) }];
}
const wfDate_ = ms => { try { return ms ? date_(Number(ms)) : ''; } catch (e) { return ''; } };
/* THE CARD IS DRAWN AGAIN WHOLE from its spec, kept as the same element so its place in the column stays. */
function wfPaint_(of) {
  document.querySelectorAll('.workfile-card[data-of], .wf-seen[data-of]').forEach(el => {
    if (el.getAttribute('data-of') !== of) return;
    const keep = {};
    el.querySelectorAll('.wf-title, .wf-subject').forEach(i => { keep[i.className] = i.value; });
    if (el.classList.contains('wf-seen')) el.innerHTML = cardBlocks_(wfBody_(of));
    else { const t = document.createElement('template'); t.innerHTML = renderCard(wfSpec_(of));
      const fresh = t.content.firstElementChild; if (fresh) { el.className = fresh.className; el.replaceChildren(...fresh.childNodes); } }
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
  openSheet(title, cardBlock_({ type: 'wait', look: 'wf-pages', on: true }));
  api({ action: 'workFileOpen', personId: USER.personId || '', id }).then(d => {
    const box = document.querySelector('.wf-pages');
    if (!box) return;
    loaded_(box);
    if (!d || !d.success) { box.textContent = (d && (d.message || d.error)) || 'Could not open it'; return; }
    box.innerHTML = cardBlocks_((d.pages || []).length ? d.pages.map((u, i) => ({ type: 'media', kind: 'image', look: 'wf-page', src: u, title: 'Page ' + (i + 1) })) : [wfNote_('No pages could be read.')]);
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
function workFileOpts_(pid, name) {
  return pid ? ({ icon: 'doc', label: name ? String(name) : 'Work on file', note: name ? 'their work on file' : 'their scanned pages', act: 'wf-see', data: { id: pid } }) : null;
}
on('wf-see', el => {
  const pid = el.getAttribute('data-id'), row = el.closest('.tile-row') || el;
  const next = row.nextElementSibling;
  if (next && next.classList.contains('wf-seen')) { next.remove(); return; }
  const box = document.createElement('div');
  box.className = 'wf-seen';
  box.setAttribute('data-of', pid);
  box.innerHTML = cardBlocks_(wfBody_(pid));
  row.insertAdjacentElement('afterend', box);
});
