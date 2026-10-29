/* ---------- A PHOTO OF THE WORKING (501): up to three pages photographed; `markWorking` has Gemini mark them and keeps them on the submission row. Only the AI marks. */
const WORK_MAX = 3, WORK_EDGE = 1600, WORK_BYTES = 500 * 1024;
/* WHAT EACH BOX HOLDS, by answer key: [{ url }] -- data URLs, in memory only; a photo is never kept in browser storage. */
const WORK_PICS = {};

/* EVERY PART TAKES A PHOTO OF THE WORKING (round 3): its tile is in the part's one tool row (qtools.js), its strip under the box. */
function workRow_(x) {
  const r = (x && x.row) || {};
  return Object.assign({}, r, { lead: x.lead, html: x.html, answer: x.answer, answer_type: x.answerType || r.answer_type,
    accept: x.accept || '', mark_words: x.markWords || '', cells: x.cells || '', draw_answer: x.drawAnswer || '',
    choices: (x.choices || []).join('|'), choice_right: (x.choiceRight || []).join('|'), marks: x.marks, subject: x.subject || r.subject });
}
/* THE STRIP UNDER THE BOX: thumbnails, then Mark my working -- the AI's alone ("A human never marks"); a failed mark keeps the photos to try again. */
function workStrip_(x) {
  if (!x || x.kind !== 'question') return '';
  const k = ansKey_(x);
  return `<div class="qp-work" data-k="${esc(k)}"${(WORK_PICS[k] || []).length ? '' : ' hidden'}>${workStripInner_(k)}</div>`;
}
function workStripInner_(k) {
  const pics = WORK_PICS[k] || [];
  const thumbs = pics.map((p, i) => `<span class="qp-work-pic"><img src="${esc(p.url)}" alt="Page ${i + 1} of your working">
    <button type="button" class="qp-work-x" data-do="qp-work-x" data-k="${esc(k)}" data-i="${i}" aria-label="Remove page ${i + 1}">×</button></span>`).join('');
  const go = pics.length ? tile_({ icon: 'tick', label: 'Mark my working', note: 'AI reads the photos',
    act: 'qp-work-send', cls: 'qp-work-send is-submit', data: { k } }) : '';
  return `<div class="qp-work-pics">${thumbs}</div><div class="tile-row qp-work-row">${go}</div>
    <p class="qp-work-say" role="status" aria-live="polite"></p>`;
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
        g.fillStyle = '#fff';
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

/* THE PICKER: camera first on a phone (`capture`), the library one tap away; several at once where the phone allows. */
on('qp-work', el => {
  const k = el.getAttribute('data-k');
  if (!k) return;
  if (typeof whoIs_ === 'function' && !whoIs_()) { toast('Sign in to send your working'); return; }
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

/* ---------- SENT: the photos, the question, the scheme and anything typed, as one `markWorking`. § */
on('qp-work-send', el => {
  const k = el.getAttribute('data-k');
  const pics = WORK_PICS[k] || [];
  if (!pics.length || el.disabled) return;
  if (typeof USER !== 'object' || !USER || !USER.token) { workSay_(k, 'Sign in to send your working'); return; }
  const x = typeof ansItem_ === 'function' ? ansItem_(k) : null;
  if (!x) { workSay_(k, 'Could not find this question'); return; }
  const inp = [].find.call(document.querySelectorAll('.qp-ans-in, .qp-multi-val'), i => i.getAttribute('data-k') === k);
  el.disabled = true;
  el.classList.add('is-busy');
  workSay_(k, '');
  const strip = el.closest('.qp-work');
  const wait = strip && strip.querySelector('.qp-work-say');
  if (wait) wait.innerHTML = loading_();
  api({ action: 'markWorking', personId: USER.personId || '', id: subId_(), sent: Date.now(), key: k,
        label: typeof doneLabel_ === 'function' ? (doneLabel_(k) || '') : '',
        question: aiQuestion_(x), scheme: aiScheme_(x), marks: Number(x.marks) || 1,
        answer: inp ? inp.value : '', photos: pics.map(p => p.url) })
    .then(d => {
      el.disabled = false;
      el.classList.remove('is-busy');
      if (wait) loaded_(wait);
      if (!d || !d.success) { workSay_(k, (d && (d.message || d.error)) || 'Marking isn\u2019t available right now \u2014 tap Mark my working again later'); return; }
      const said = d.awarded + ' of ' + d.available + ' mark' + (d.available === 1 ? '' : 's') + ' · AI from your photos';
      workSay_(k, said + (d.feedback ? ' — ' + d.feedback : ''));
    })
    .catch(() => {
      el.disabled = false;
      el.classList.remove('is-busy');
      workSay_(k, 'Could not reach the marker — check the connection');
    });
});

/* ---------- AND SEEN BY THE PEOPLE WHO MAY (`workingOf`): the student, a parent they accepted, staff and admin. Fetched on the tap, never in the payload. */
function workSeeTile_(pid) {
  if (!pid) return '';
  return tile_({ icon: 'photo', label: 'Working photos', note: 'with the AI’s mark', act: 'work-see', data: { id: pid } });
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
    box.innerHTML = rows.map(r => `<div class="work-seen-row"><p class="work-seen-say">${esc(r.label || r.key)} · ${esc(workVerdictSay_(r.verdict))}</p>
      <div class="qp-work-pics">${(r.photos || []).map((u, i) => `<a class="qp-work-pic" href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Page ${i + 1}"></a>`).join('')}</div></div>`).join('');
  }).catch(() => { loaded_(box); box.textContent = 'Could not reach the server'; });
});
function workVerdictSay_(v) {
  const m = /^ai:(\d+)\/(\d+)$/.exec(String(v || ''));
  return m ? m[1] + ' of ' + m[2] + ' by AI' : 'not marked';
}
/* A BOX'S PAGES, made if missing -- for a check that cannot run the phone's canvas shrink. */
function workPics_(k) { return WORK_PICS[k] || (WORK_PICS[k] = []); }
