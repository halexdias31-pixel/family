/* ---------- A PHOTO OF THE WORKING (501): up to three pages; they go with the part's one AI Mark (`aiMark`). Only the AI marks. § */
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
/* THE STRIP UNDER THE BOX: thumbnails; the part's one Mark sends them, and a failed mark keeps them. */
function workStrip_(x) {
  if (!x || !isQ_(x)) return '';
  const k = ansKey_(x);
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

/* THE PICKER: camera first on a phone (`capture`), the library a tap away. § */
on('qp-work', el => {
  const k = el.getAttribute('data-k');
  if (!k) return;
  if (typeof whoIs_ === 'function' && !whoIs_()) { toast(text_('sign-in-to-send-your-working')); return; }
  if ((WORK_PICS[k] || []).length >= WORK_MAX) { workPaint_(k); workSay_(k, WORK_MAX + ' pages at most — remove one to add another'); return; }
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
});
function workAdd_(k, files) {
  const room = WORK_MAX - (WORK_PICS[k] || []).length;
  const take = files.filter(f => f && /^image\//.test(f.type || 'image/')).slice(0, Math.max(0, room));
  if (!take.length) return Promise.resolve();
  workPaint_(k);
  workSay_(k, '');
  return Promise.all(take.map(f => workShrink_(f).then(url => ({ url }), () => null))).then(got => {
    const ok = got.filter(Boolean);
    WORK_PICS[k] = (WORK_PICS[k] || []).concat(ok).slice(0, WORK_MAX);
    workPaint_(k);
    if (ok.length < take.length) workSay_(k, 'A photo could not be read — try taking it again');
    else if (files.length > take.length) workSay_(k, WORK_MAX + ' pages at most — the rest were left out');
  });
}
on('qp-work-x', el => {
  const k = el.getAttribute('data-k'), i = Number(el.getAttribute('data-i'));
  (WORK_PICS[k] || []).splice(i, 1);
  workPaint_(k);
});

/* ---------- MARKED BY THE PART'S ONE MARK BUTTON (owner, 15 Nov): the photos go with the AI's mark (`aiImages_`, qtools.js); there is no second button. */

/* ---------- SEEN BY WHO MAY (`workingOf`): student, accepted parent, admin; fetched on the tap. § */
/* `workingMaySee_` (dopost.gs): a parent or Admin, never a tutor (owner, 28 Oct). § */
function workSeeOpts_(pid, asParent) {
  if (!pid || !(asParent === true || may_('admin'))) return null;
  return ({ icon: 'photo', label: 'Working photos', note: 'with the AI’s mark', act: 'work-see', data: { id: pid } });
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
function workVerdictSay_(v) {
  const m = /^ai:(\d+)\/(\d+)$/.exec(String(v || ''));
  return m ? m[1] + ' of ' + m[2] + ' by AI' : 'not marked';
}
/* A BOX'S PAGES, made if missing -- for a check that cannot run the phone's canvas shrink. */
function workPics_(k) { return WORK_PICS[k] || (WORK_PICS[k] = []); }
