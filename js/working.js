/* ---------- A PHOTO OF THE WORKING (501): up to three pages; the part's Save keeps them on the account (`markWorking`, its old name). Nothing marks them (owner, 16 Nov). */
const WORK_MAX = 3, WORK_EDGE = 1600, WORK_BYTES = 500 * 1024;
/* EACH BOX'S PHOTOS by answer key: data URLs, in memory only, never browser storage. § */
const WORK_PICS = {};

/* A PART THE AI MARKS TAKES A PHOTO OF THE WORKING: its tile in the part's tool row (qtools.js), its strip under the box. § */
function workRow_(x) {
  const r = (x && x.row) || {};
  return Object.assign({}, r, { lead: x.lead, html: x.html, answer: x.answer, answer_type: x.answerType || r.answer_type,
    accept: x.accept || '', mark_words: x.markWords || '', cells: x.cells || '', draw_answer: x.drawAnswer || '',
    choices: (x.choices || []).join('|'), choice_right: (x.choiceRight || []).join('|'), marks: x.marks, subject: x.subject || r.subject });
}
/* THE STRIP UNDER THE BOX: thumbnails; the part's Save sends them, and a failed save keeps them. */
function workStrip_(x) {
  if (!x || !isQ_(x)) return '';
  const k = ansKey_(x);
  workLoad_(k);
  return cardBlock_({ type: 'group', look: 'qp-work', attrs: { 'data-k': k, hidden: !(WORK_PICS[k] || []).length }, inner: workStripInner_(k) });
}
function workStripInner_(k) {
  const pics = WORK_PICS[k] || [];
  return cardBlocks_([{ type: 'group', look: 'qp-work-pics', blocks: pics.map((p, i) => ({ type: 'group', tag: 'span', look: 'qp-work-pic',
    blocks: [{ type: 'group', tag: 'img', attrs: { src: p.url, alt: `Page ${i + 1} of your working` } }],
    tiles: [{ form: true, look: 'qp-work-x', act: 'qp-work-x', data: { k: k, i: i }, aria: 'Remove page ' + (i + 1), label: '×' }] })) },
  { type: 'group', tag: 'p', look: 'qp-work-say', attrs: { role: 'status', 'aria-live': 'polite' } }]);
}
function workPaint_(k) {
  document.querySelectorAll('.qp-work').forEach(el => {
    if (el.getAttribute('data-k') !== k) return;
    el.innerHTML = workStripInner_(k);
    el.hidden = !(WORK_PICS[k] || []).length;
  });
}
function workSay_(k, text) {
  document.querySelectorAll('.qp-work').forEach(el => {
    if (el.getAttribute('data-k') !== k) return;
    const p = el.querySelector('.qp-work-say');
    if (p) p.textContent = text;
  });
}

/* ---------- SHRUNK ON THE PHONE: long edge 1600px, JPEG 0.8, stepped down until it is under 500 KB. */
function workShrink_(file) {
  return new Promise((ok, bad) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const s = Math.min(1, WORK_EDGE / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * s));
        c.height = Math.max(1, Math.round(img.naturalHeight * s));
        const g = c.getContext('2d');
        g.fillStyle = token_('--white', 'white');
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        let q = 0.8, out = c.toDataURL('image/jpeg', q);
        while (workBytes_(out) > WORK_BYTES && q > 0.35) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
        URL.revokeObjectURL(url);
        workBytes_(out) > WORK_BYTES ? bad(new Error('too big')) : ok(out);
      } catch (e) { URL.revokeObjectURL(url); bad(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); bad(new Error('not a picture')); };
    img.src = url;
  });
}
const workBytes_ = d => Math.floor((String(d).length - String(d).indexOf(',') - 1) * 3 / 4);

/* THE CAMERA TILE (owner, 16 Nov): the live camera fills the answer box's slot (`camOpen_`, answer-face.js); no overlay. */
on('qp-work', el => {
  const k = el.getAttribute('data-k');
  if (!k) return;
  if (typeof whoIs_ === 'function' && !whoIs_()) { toast(text_('sign-in-to-send-your-working')); return; }
  if ((WORK_PICS[k] || []).length >= WORK_MAX) { workPaint_(k); workSay_(k, WORK_MAX + ' pages at most — remove one to add another'); return; }
  if (typeof camOpen_ === 'function') camOpen_(el, k); else workPick_(k);
});
/* THE PICKER, where there is no live camera: camera first on a phone (`capture`), the library a tap away. § */
function workPick_(k) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.multiple = true;
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')) inp.setAttribute('capture', 'environment');
  inp.className = 'qp-work-file';
  inp.hidden = true;
  inp.addEventListener('change', () => { workAdd_(k, [].slice.call(inp.files || [])); inp.remove(); });
  document.body.appendChild(inp);
  inp.click();
}
function workAdd_(k, files) {
  const room = WORK_MAX - (WORK_PICS[k] || []).length;
  const take = files.filter(f => f && /^image\//.test(f.type || 'image/')).slice(0, Math.max(0, room));
  if (!take.length) return Promise.resolve();
  workPaint_(k);
  workSay_(k, '');
  return Promise.all(take.map(f => workShrink_(f).then(url => ({ url }), () => null))).then(got => {
    const ok = got.filter(Boolean);
    WORK_PICS[k] = (WORK_PICS[k] || []).concat(ok).slice(0, WORK_MAX);
    workKeep_(k);
    workPaint_(k);
    if (ok.length < take.length) workSay_(k, 'A photo could not be read — try taking it again');
    else if (files.length > take.length) workSay_(k, WORK_MAX + ' pages at most — the rest were left out');
  });
}
on('qp-work-x', el => {
  const k = el.getAttribute('data-k'), i = Number(el.getAttribute('data-i'));
  (WORK_PICS[k] || []).splice(i, 1);
  workKeep_(k);
  workPaint_(k);
});

/* ---------- SAVED BY THE PART'S ONE SAVE (owner, 16 Nov): the photos and anything typed, as one `markWorking` -- kept on the submission row, marked by nothing. */
function workSave_(k, typed, el, out) {
  const pics = WORK_PICS[k] || [];
  if (!pics.length || el.disabled) return;
  if (typeof USER !== 'object' || !USER || !USER.token) { tell_(out, 'error', text_('sign-in-to-send-your-working')); return; }
  el.disabled = true;
  tell_(el, 'busy');
  api({ action: 'markWorking', personId: USER.personId || '', id: subId_(), sent: Date.now(), key: k,
        label: typeof doneLabel_ === 'function' ? (doneLabel_(k) || '') : '', answer: typed || '', photos: pics.map(p => p.url) })
    .then(d => {
      el.disabled = false;
      tell_(el, '');
      if (!d || !d.success) { tell_(out, 'error', (d && (d.message || d.error)) || 'Your working could not be saved just now \u2014 try again later'); return; }
      tell_(out, 'saved', 'Saved, with ' + pics.length + ' photo' + (pics.length === 1 ? '' : 's'));
    })
    .catch(() => { el.disabled = false; tell_(el, ''); tell_(out, 'error', 'Could not reach the server \u2014 your photos are still here'); });
}

/* ---------- SEEN BY WHO MAY (`workingOf`): student, accepted parent, admin; fetched on the tap. § */
/* `workingMaySee_` (dopost.gs): a parent or Admin, never a tutor (owner, 28 Oct). § */
function workSeeOpts_(pid, asParent) {
  if (!pid || !(asParent === true || may_('admin'))) return null;
  return ({ icon: 'photo', label: 'Working photos', note: 'saved with the answer', act: 'work-see', data: { id: pid } });
}
on('work-see', el => {
  const pid = el.getAttribute('data-id');
  const card = el.closest('.person-mark, [data-person]') || el.parentElement;
  if (!pid || !USER || !USER.token) return;
  let box = card && card.querySelector('.work-seen');
  if (box) { box.remove(); return; }
  box = document.createElement('div');
  box.className = 'work-seen';
  box.innerHTML = loading_();
  (el.closest('.tile-row') || el).insertAdjacentElement('afterend', box);
  api({ action: 'workingOf', personId: USER.personId || '', of: pid }).then(d => {
    loaded_(box);
    if (!d || !d.success) { box.textContent = (d && (d.message || d.error)) || 'Could not load their working'; return; }
    const rows = Array.isArray(d.work) ? d.work : [];
    if (!rows.length) { box.textContent = 'No photographed working yet'; return; }
    box.innerHTML = cardBlocks_(rows.map(r => ({ type: 'group', look: 'work-seen-row', blocks: [
      { type: 'group', tag: 'p', look: 'work-seen-say', text: `${r.label || r.key} · ${workVerdictSay_(r.verdict)}` },
      { type: 'group', look: 'qp-work-pics', blocks: (r.photos || []).map((u, i) => ({ type: 'group', tag: 'a', look: 'qp-work-pic',
        attrs: { href: u, 'data-do': 'file-view', target: '_blank', rel: 'noopener' }, blocks: [{ type: 'group', tag: 'img', attrs: { src: u, alt: `Page ${i + 1}` } }] })) }] })));
  }).catch(() => { loaded_(box); box.textContent = 'Could not reach the server'; });
});
/* AN OLD AI SCORE IS STILL READ (kept, never made again: owner, 16 Nov) */
function workVerdictSay_(v) {
  const m = /^ai:(\d+)\/(\d+)$/.exec(String(v || ''));
  return m ? m[1] + ' of ' + m[2] + ' by AI' : 'saved, not marked';
}
/* A BOX'S PAGES, made if missing -- for a check that cannot run the phone's canvas shrink. */
function workPics_(k) { return WORK_PICS[k] || (WORK_PICS[k] = []); }

/* ---------- THE PHOTOS PERSIST (owner, 16 Nov): in the part's one record on this device (`partRec_`, field `photos`) and on the
   account, as the student's own Work on file (workfile.gs), one row per part named by its answer key -- so coming back to the
   question shows them, on any device, as a typed answer does. The newest row replaces the last. */
const WORK_TAG = 'Working ';
const workTitle_ = k => (WORK_TAG + (typeof ansServerKey_ === 'function' ? ansServerKey_(k) : k)).slice(0, 80);
const workRecKey_ = k => partKeyOfAns_(k);
let WORK_ROWS = null;
const WORK_SYNC = new Map();
/* WORK_PICS FILLED FROM THE RECORD the first time a box is drawn this visit; then from the account where the device has none */
function workLoad_(k) {
  if (!k || WORK_PICS[k]) return;
  const rec = partRecAt_(workRecKey_(k));
  const urls = (Array.isArray(rec.photos) ? rec.photos : []).filter(u => /^data:image\/jpeg;base64,/.test(String(u || ''))).slice(0, WORK_MAX);
  WORK_PICS[k] = urls.map(url => ({ url }));
  if (!urls.length) workFromAccount_(k);
}
function workSignedIn_() { return typeof USER !== 'undefined' && USER && USER.token && USER.personId && !USER.lockedPreview; }
function workRows_() {
  if (WORK_ROWS) return WORK_ROWS;
  WORK_ROWS = api({ action: 'workFilesOf', personId: USER.personId, of: USER.personId })
    .then(d => (d && d.success && Array.isArray(d.work) ? d.work : []), () => { WORK_ROWS = null; return []; });
  return WORK_ROWS;
}
function workFromAccount_(k) {
  if (!workSignedIn_() || typeof api !== 'function') return;
  workRows_().then(rows => {
    const row = rows.find(r => r && r.title === workTitle_(k));
    if (!row) return;
    return api({ action: 'workFileOpen', personId: USER.personId, id: row.id }).then(d => {
      if (!d || !d.success || (WORK_PICS[k] || []).length) return;
      WORK_PICS[k] = (d.pages || []).filter(u => /^data:image\/jpeg;base64,/.test(String(u || ''))).slice(0, WORK_MAX).map(url => ({ url }));
      partRecPutAt_(workRecKey_(k), 'photoFile', row.id);
      workKeepHere_(k);
      workPaint_(k);
    });
  }).catch(() => { /* the device's own copy stands */ });
}
function workKeepHere_(k) {
  const urls = (WORK_PICS[k] || []).map(p => p.url);
  partRecPutAt_(workRecKey_(k), 'photos', urls.length ? urls : null);
}
/* KEPT AS THEY CHANGE: here at once; to the account a moment later, the old row deleted once the new one is saved */
function workKeep_(k) {
  workKeepHere_(k);
  if (!workSignedIn_() || typeof api !== 'function') return;
  clearTimeout(WORK_SYNC.get(k));
  WORK_SYNC.set(k, setTimeout(() => workSend_(k), 1200));
}
function workSend_(k) {
  const pages = (WORK_PICS[k] || []).map(p => p.url);
  const old = partRecAt_(workRecKey_(k)).photoFile || '';
  const drop = () => (old ? api({ action: 'workFileDelete', personId: USER.personId, id: old }).catch(() => null) : Promise.resolve());
  if (!pages.length) { drop().then(() => partRecPutAt_(workRecKey_(k), 'photoFile', null)); WORK_ROWS = null; return; }
  api({ action: 'workFileSave', personId: USER.personId, of: USER.personId, title: workTitle_(k), subject: 'Question working', pages })
    .then(d => {
      if (!d || !d.success) { workSay_(k, (d && d.message) || 'Not saved to your account yet — kept on this device'); return; }
      drop();
      partRecPutAt_(workRecKey_(k), 'photoFile', d.id);
      WORK_ROWS = null;
    })
    .catch(() => workSay_(k, 'Could not reach the server — the photos are kept on this device'));
}
