/* ---------- A PHOTO OF THE WORKING (501): up to three pages; the part's Save keeps them on the account (`markWorking`, its old name). Nothing marks them (owner, 16 Nov), but a photo of a drawn answer is read by its geometry (below, 17 Nov). */
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
    if (ok.length) workDrawRead_(k, ok[ok.length - 1].url);
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
      tell_(out, 'saved', 'Saved, with ' + pics.length + ' ' + plural_(pics.length, 'photo'));
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

/* ---------- THE PHOTOS PERSIST (owner, 16 Nov): in the part's one record on this device (`partRec_`, field `photos`) and on the
   account, as the student's own Work on file (workfile.gs), one row per part named by its answer key -- so coming back to the
   question shows them, on any device, as a typed answer does. The newest row replaces the last. */
const WORK_TAG = 'Working ';
const workTitle_ = k => (WORK_TAG + (typeof ansServerKey_ === 'function' ? ansServerKey_(k) : k)).slice(0, 80);
const workRecKey_ = k => partKeyOfAns_(k);
let WORK_ROWS = null;
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
const WORK_SYNC = new Map();
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
function workKeep_(k) {
  workKeepHere_(k);
  if (!workSignedIn_() || typeof api !== 'function') return;
  clearTimeout(WORK_SYNC.get(k));
  WORK_SYNC.set(k, setTimeout(() => workSend_(k), 1200));
}


/* ---------- A PHOTO OF A DRAWN ANSWER IS READ BY ITS GEOMETRY (owner, 17 Nov): no model, no network -- the photo's ink becomes
   strokes and the one draw marker (`DRAW_MARK`, find-pen.js) marks them as it marks the pen. Pie charts first; each drawn kind
   that follows adds its reader to `PHOTO_READ`. Words in a photo stay unmarked. */
/* THE INK: grey minus the paper behind it (a wide blur), so shadow and off-white paper fall away; Otsu's cut on what is left */
function photoInk_(gray, w, h) {
  const R = Math.max(4, Math.round(Math.max(w, h) / 40)), I = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) for (let x = 0, s = 0; x < w; x++) { s += gray[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + s; }
  const d = new Float64Array(w * h), hist = new Array(256).fill(0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const x0 = Math.max(0, x - R), x1 = Math.min(w, x + R + 1), y0 = Math.max(0, y - R), y1 = Math.min(h, y + R + 1);
    const m = (I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0]) / ((x1 - x0) * (y1 - y0));
    const v = Math.max(0, Math.min(255, m * 1.04 - gray[y * w + x]));
    d[y * w + x] = v; hist[v | 0]++;
  }
  let sum = 0, n = w * h, sB = 0, wB = 0, best = 0, cut = 20;
  hist.forEach((c, i) => { sum += i * c; });
  for (let t = 0; t < 256; t++) {
    wB += hist[t]; if (!wB || wB === n) continue;
    sB += t * hist[t];
    const mB = sB / wB, mF = (sum - sB) / (n - wB), v = wB * (n - wB) * (mB - mF) * (mB - mF);
    if (v > best) { best = v; cut = t; }
  }
  cut = Math.max(10, cut);
  const pts = [];
  for (let i = 0; i < w * h; i++) if (d[i] > cut) pts.push([i % w, (i / w) | 0]);
  return pts;
}
/* A CONIC THROUGH POINTS (least squares, ax²+bxy+cy²+dx+ey = 1) and the map that makes it the unit circle: centre, then M^½/√k */
function photoConic_(P0) {
  if (P0.length < 10) return null;
  const ox = P0.reduce((s, p) => s + p[0], 0) / P0.length, oy = P0.reduce((s, p) => s + p[1], 0) / P0.length;
  const P = P0.map(p => [p[0] - ox, p[1] - oy]), A = [0, 1, 2, 3, 4].map(() => new Array(6).fill(0));
  P.forEach(p => { const r = [p[0] * p[0], p[0] * p[1], p[1] * p[1], p[0], p[1]]; for (let i = 0; i < 5; i++) { for (let j = 0; j < 5; j++) A[i][j] += r[i] * r[j]; A[i][5] += r[i]; } });
  for (let i = 0; i < 5; i++) {
    let p = i; for (let r = i + 1; r < 5; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    if (!A[i][i]) return null;
    for (let r = 0; r < 5; r++) if (r !== i) { const f = A[r][i] / A[i][i]; for (let c = i; c < 6; c++) A[r][c] -= f * A[i][c]; }
  }
  const [a, b, c, d, e] = A.map((r, i) => r[5] / r[i]);
  const det = a * c - b * b / 4;
  if (!(det > 0)) return null;
  const cx = (b * e / 2 - c * d) / (2 * det), cy = (b * d / 2 - a * e) / (2 * det);
  const k = 1 + a * cx * cx + b * cx * cy + c * cy * cy;
  if (!(k > 0) || a < 0) return null;
  /* M = [[a, b/2], [b/2, c]] by its eigenvectors; the root of each eigenvalue scales its own axis */
  const tr = a + c, q = Math.sqrt(Math.max(0, tr * tr / 4 - det)), l1 = tr / 2 + q, l2 = tr / 2 - q;
  if (!(l2 > 0) || l2 / l1 < 0.35) return null;
  const th = Math.abs(b) < 1e-12 ? (a >= c ? 0 : Math.PI / 2) : Math.atan2(l1 - a, b / 2), co = Math.cos(th), si = Math.sin(th);
  const s1 = Math.sqrt(l1 / k), s2 = Math.sqrt(l2 / k);
  const m = [co * co * s1 + si * si * s2, co * si * (s1 - s2), si * si * s1 + co * co * s2];
  return { c: [cx + ox, cy + oy], r: Math.sqrt(k / Math.sqrt(l1 * l2)), to: p => { const x = p[0] - ox - cx, y = p[1] - oy - cy; return [m[0] * x + m[1] * y, m[1] * x + m[2] * y]; } };
}
/* THE PIE: the largest ring of ink (three points at a time, the circle most ink lies on), made an ellipse by the photo's tilt; then the
   lines from its centre, each a peak of ink by its bearing (clockwise from up), straightened by a fit. Pure: grey bytes in, numbers out. */
function photoPie_(gray, w, h) {
  const all = photoInk_(gray, w, h);
  if (all.length < 50) return { ok: false, why: 'no ink was found' };
  let seed = 12345;
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const P = all.length > 6000 ? Array.from({ length: 6000 }, () => all[rnd(all.length)]) : all;
  const minR = Math.min(w, h) * 0.12, maxR = Math.max(w, h) * 0.6;
  let best = null;
  for (let t = 0; t < 1500; t++) {
    const a = P[rnd(P.length)], b = P[rnd(P.length)], c = P[rnd(P.length)];
    const D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    if (Math.abs(D) < 1e-6) continue;
    const s = [a, b, c].map(p => p[0] * p[0] + p[1] * p[1]);
    const x = (s[0] * (b[1] - c[1]) + s[1] * (c[1] - a[1]) + s[2] * (a[1] - b[1])) / D, y = (s[0] * (c[0] - b[0]) + s[1] * (a[0] - c[0]) + s[2] * (b[0] - a[0])) / D;
    const r = Math.hypot(a[0] - x, a[1] - y);
    if (r < minR || r > maxR) continue;
    const band = Math.max(2, r * 0.03);
    let n = 0;
    for (let i = 0; i < P.length; i += 3) if (Math.abs(Math.hypot(P[i][0] - x, P[i][1] - y) - r) < band) n++;
    if (!best || n > best.n) best = { x, y, r, n };
  }
  if (!best) return { ok: false, why: 'no circle was found' };
  /* the ring's ink, taken in a wider band (a tilted photo makes it an ellipse), fitted again twice */
  let E = null, ring = all.filter(p => Math.abs(Math.hypot(p[0] - best.x, p[1] - best.y) - best.r) < best.r * 0.12);
  for (let t = 0; t < 2; t++) {
    const e = photoConic_(ring);
    if (!e) break;
    E = e;
    ring = all.filter(p => { const q = e.to(p); return Math.abs(Math.hypot(q[0], q[1]) - 1) < 0.07; });
  }
  if (!E) { const r = best.r; E = { c: [best.x, best.y], r, to: p => [(p[0] - best.x) / r, (p[1] - best.y) / r] }; }
  const N = all.map(p => ({ p, q: E.to(p) }));
  /* HOW SURE: the ring goes most of the way round */
  const round = new Array(72).fill(0);
  N.forEach(o => { const d = Math.hypot(o.q[0], o.q[1]); if (Math.abs(d - 1) < 0.07) round[((Math.atan2(o.q[0], -o.q[1]) * 180 / Math.PI + 360) % 360 / 5) | 0] = 1; });
  const cover = round.reduce((s, v) => s + v, 0) / 72;
  if (cover < 0.8) return { ok: false, why: 'the circle was not clear all the way round', cover };
  const thick = Math.max(1, ring.length / (2 * Math.PI * E.r));
  /* THE LINES: ink between a fifth and nine-tenths of the way out, binned by bearing; a line is a peak worth half a full one */
  const H = new Array(360).fill(0), inner = N.filter(o => { const d = Math.hypot(o.q[0], o.q[1]); return d > 0.2 && d < 0.9; });
  inner.forEach(o => { H[Math.round((Math.atan2(o.q[0], -o.q[1]) * 180 / Math.PI + 360) % 360) % 360]++; });
  const S = H.map((v, i) => [-2, -1, 0, 1, 2].reduce((s, j) => s + H[(i + j + 360) % 360], 0));
  const full = 0.7 * E.r * thick, peaks = [];
  S.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).forEach(([v, i]) => {
    if (v < full * 0.45) return;
    if (peaks.some(p => Math.abs(((p - i + 540) % 360) - 180) < 8)) return;
    peaks.push(i);
  });
  /* each peak straightened: the line through its ink (principal axis), its bearing read outward */
  const lines = peaks.map(g0 => {
    const pts = inner.filter(o => Math.abs((((Math.atan2(o.q[0], -o.q[1]) * 180 / Math.PI) - g0 + 540) % 360) - 180) < 5).map(o => o.q);
    const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
    let xx = 0, xy = 0, yy = 0;
    pts.forEach(p => { xx += (p[0] - mx) ** 2; xy += (p[0] - mx) * (p[1] - my); yy += (p[1] - my) ** 2; });
    const th = 0.5 * Math.atan2(2 * xy, xx - yy);
    let dx = Math.cos(th), dy = Math.sin(th);
    if (dx * mx + dy * my < 0) { dx = -dx; dy = -dy; }
    return Math.round(((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360) * 10) / 10;
  }).sort((a, b) => a - b);
  if (!lines.length) return { ok: false, why: 'no lines from the centre were found', cover };
  if (lines.length > 10) return { ok: false, why: 'too much stray ink to tell the lines apart', cover };
  /* back to the photo, for showing what was read: the bearing g on the unit circle, mapped by the ellipse's inverse */
  const inv = q => { let p = E.c.slice(); for (let i = 0; i < 30; i++) { const z = E.to(p); p = [p[0] + (q[0] - z[0]) * E.r, p[1] + (q[1] - z[1]) * E.r]; } return p; };
  const at = g => inv([Math.sin(g * Math.PI / 180), -Math.cos(g * Math.PI / 180)]);
  return { ok: true, lines, cover, c: E.c, r: E.r, at };
}
/* THE READ PIE AS PEN STROKES on the question's own circle, in the pad's 340 space: the photo's circle laid on the figure's. A printed
   starting radius (`given`) anchors the turn of the photo: the read line nearest it is taken to be it. */
function photoPieStrokes_(read, spec, fig) {
  const it = (spec.items || []).find(i => i.k === 'pie');
  if (!it || !read.ok) return null;
  const F = DRAW_MARK.frameOf(spec, fig), c = F.v(it.c), r = Math.abs(it.r * F.u[0]), vb = F.vb;
  let turn = 0;
  if (it.given && it.given.length) {
    const off = g => ((g - it.given[0] + 540) % 360) - 180, near = read.lines.slice().sort((a, b) => Math.abs(off(a)) - Math.abs(off(b)))[0];
    if (Math.abs(off(near)) < 45) turn = -off(near);
  }
  const at = (g, d) => [c[0] + d * Math.sin(g * Math.PI / 180), c[1] - d * Math.cos(g * Math.PI / 180)];
  const flat = pl => [].concat.apply([], pl.map(p => [(p[0] - vb[0]) / vb[2] * 340, (p[1] - vb[1]) / vb[3] * 340]));
  const ring = []; for (let g = 0; g <= 360; g += 10) ring.push(at(g, r));
  return [flat(ring)].concat(read.lines.map(g => flat([c, at(g + turn, r)])));
}
/* EACH DRAWN KIND THE PHOTO READER KNOWS: the reader, and its strokes for the marker */
const PHOTO_READ = { pie: { read: photoPie_, strokes: photoPieStrokes_ } };

/* ON THE PHONE: a page just added to a part whose answer is a drawing is read; the lines read are drawn over it beside the verdict */
function workDrawRead_(k, url) {
  const row = [].find.call(document.querySelectorAll('.qpad-send'), r => r.getAttribute('data-k') === k);
  if (!row || typeof DRAW_MARK !== 'object') return;
  let spec = row.getAttribute('data-draw') || '';
  try { spec = JSON.parse(spec); } catch (e) { return; }
  const kind = spec && (spec.items || []).map(i => i.k).find(x => PHOTO_READ[x]);
  if (!kind) { workSay_(k, 'A photo of this kind of drawing is not read yet — it is kept for your tutor'); return; }
  const img = new Image();
  img.onload = () => {
    const s = Math.min(1, 480 / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'); g.drawImage(img, 0, 0, w, h);
    const px = g.getImageData(0, 0, w, h).data, gray = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) gray[i] = (px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114) | 0;
    const R = PHOTO_READ[kind], read = R.read(gray, w, h);
    if (!read.ok) { workSay_(k, 'The drawing in the photo could not be read clearly (' + read.why + ') — it is left unmarked for your tutor'); return; }
    const pad = typeof padOfRow_ === 'function' ? padOfRow_(row) : null, art = pad && pad.querySelector('.qpad-art > svg:first-child');
    const fig = drawFig_(art ? (art.__src || art.outerHTML) : ''), strokes = R.strokes(read, spec, fig);
    const res = strokes && DRAW_MARK.mark(strokes, spec, fig, row.getAttribute('data-marks'));
    g.lineWidth = Math.max(2, w / 160); g.strokeStyle = token_('--accent', '#d33');
    g.beginPath(); for (let a = 0; a <= 360; a += 5) { const p = read.at(a); a ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
    read.lines.forEach(a => { const p = read.at(a); g.beginPath(); g.moveTo(read.c[0], read.c[1]); g.lineTo(p[0], p[1]); g.stroke(); });
    const say = !res ? 'The drawing was read but could not be marked' : res.got + ' of ' + res.of + ' marks, from the lines read in your photo';
    document.querySelectorAll('.qp-work').forEach(el => {
      if (el.getAttribute('data-k') !== k) return;
      const p = el.querySelector('.qp-work-say');
      if (!p) return;
      p.textContent = say;
      const im = document.createElement('img');
      im.src = cv.toDataURL('image/jpeg', 0.8); im.alt = 'The lines read from your photo'; im.className = 'qp-work-read';
      p.appendChild(document.createElement('br')); p.appendChild(im);
    });
  };
  img.src = url;
}
