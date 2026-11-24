/* ---------- WORKING (501): no photo is taken or marked any more (owner, 22 Nov: "no more photo marking") -- children draw on screen.
   What stays: a part's row as the type reads it, the phone's photo shrink (work-file.js scans a page with it), and old saved working, seen by who may. */
const WORK_EDGE = 1600, WORK_BYTES = 500 * 1024;

/* A PART AS ITS TYPE READS IT (qtypes.js): the row with the item's own fields over it -- the keypad and the tool row ask it. */
function workRow_(x) {
  const r = (x && x.row) || {};
  return Object.assign({}, r, { lead: x.lead, html: x.html, answer: x.answer, answer_type: x.answerType || r.answer_type,
    accept: x.accept || '', mark_words: x.markWords || '', cells: x.cells || '', draw_answer: x.drawAnswer || '',
    choices: (x.choices || []).join('|'), choice_right: (x.choiceRight || []).join('|'), marks: x.marks, subject: x.subject || r.subject });
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
  }).catch(() => { loaded_(box); box.textContent = text_('could-not-reach-the-server'); });
});
/* AN OLD AI SCORE IS STILL READ (kept, never made again: owner, 16 Nov) */
function workVerdictSay_(v) {
  /* ONE MARK RESULT (UNIFY item 5): read by `verdictOf_` and said as every other mark is. */
  const r = verdictOf_(v);
  return r && !r.state ? statusWord_(r) + ' · ' + r.marks + ' of ' + r.outOf : 'saved, not marked';
}
