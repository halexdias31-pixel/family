/* @family. — js/submit-suggest.js SUGGEST A CHANGE (494): the one tile, its box in place, pictures and files sent (cut from submit.js; read as one by tools/piece-src.js). */
/* ---------- SUGGEST A CHANGE (494): one tile on every thing, one box in place ----------
   An admin's goes to Notes for Claude; anybody else's waits for Confirm. A message's says "Tell the admin" (413). */
/* VIRTUALLY UNLIMITED (562, owner note 119), the backend's CLAUDE_NOTE_MAX: a sheet cell's 50,000 less room for the rest of the row. */
const SUGGEST_NOTE_MAX = 40000;
/* A RULE (496): `tell-admin` — the words only; the quiet safeguarding path stays either way. */
const suggestTell_ = kind => suggestPeople_(kind) && (typeof ruleOn_ !== 'function' || ruleOn_('tell-admin'));
/* WHAT HAS AN OPEN NOTE FOR CLAUDE, by `kind|id` — sent to everybody as `reportedItems`, no names in it. */
const reportedNow_ = (kind, id) => ((typeof DATA !== 'undefined' && DATA && DATA.reportedItems) || []).indexOf(kind + '|' + id) !== -1;
/* THE ONE TILE'S OPTIONS, on every thing, drawn by `tile_`: Student rank and up; signed out, null (no tile). `check-suggest` holds every such tile to it. */
function suggestOpts_(kind, id, label, cls) {
  if (!kind || !id || typeof rankAtLeast_ !== 'function' || !rankAtLeast_('student')) return null;
  return ({ icon: 'suggest', label: suggestTell_(kind) ? 'Tell the admin' : 'Suggest a change', note: reportedNow_(kind, id) ? 'to change' : '',
                 act: 'rep-box', cls: 'rep-tile' + (cls ? ' ' + cls : ''), data: { rk: kind, ri: id, rl: String(label || '').slice(0, 120) } });
}
/* A CARD WITH NO TILE ROW OF ITS OWN takes the tile in one of its own, put inside the card by `cardRowIn_`. */
function suggestRowIn_(html, kind, id, label) {
  const t = tile_(suggestOpts_(kind, id, label));
  return t && typeof cardRowIn_ === 'function' ? cardRowIn_(html, `<div class="tile-row rep-row">${t}</div>`) : html;
}
/* A FIND CARD'S KIND AND ID: a question by its key (`q:…`); a coming-soon card by what is coming. */
function suggestOptsFor_(x) {
  if (!x || !x.key) return null;
  return suggestOpts_(x.soon || x.kind, x.soon ? String(x.soonId) : x.key, [x.name, x.sub].filter(Boolean).join(' · '));
}
/* WHAT KIND OF SCREEN IT WAS SEEN ON — enough for the owner to try it on the same, and nothing that names a device. */
function reportDevice_() {
  try {
    /* `screen` IS shell.js's column maker in this scope, so the window's size, not the display's. */
    const w = Math.min(innerWidth, innerHeight);
    const touch = matchMedia('(pointer: coarse)').matches;
    return !touch ? 'computer' : w < 600 ? 'phone' : 'tablet';
  } catch (e) { return ''; }
}
/* IN PLACE OF THE THING (489, `boxInPlace_`): one text area, a picture, Send and Cancel. No notes listed (498): Done is Claude's, by data/notes-done.json. */
function reportBoxHtml_(kind, id, label, finder, path) {
  const admin = isAdmin();
  const dk = kind + '|' + id, people = suggestPeople_(kind), files = admin && !people;
  return `<div class="me-form rep-form rep-box" data-rk="${esc(kind)}" data-ri="${esc(id)}" data-rl="${esc(label)}" data-finder="${esc(finder || '')}" data-path="${esc(path || '')}">
    <textarea class="rep-note-in" rows="3" maxlength="${SUGGEST_NOTE_MAX}" autocomplete="off"
      placeholder="${people ? 'What is wrong? (you can leave this empty)' : 'What should change here?'}" aria-label="${suggestTell_(kind) ? 'Tell the admin' : 'Suggest a change'}"${draftAttr_('rep', dk)}>${esc(draftVal_('rep', dk))}</textarea>
    <input type="file" accept="${files ? 'image/*,video/*' : 'image/*'}" class="rep-pic-in" hidden aria-hidden="true" tabindex="-1">
    <img class="rep-pic-show" alt="The picture going with it" hidden>${files ? `
    <div class="rep-vids" hidden></div>
    <input type="file" multiple class="rep-files-in" hidden aria-hidden="true" tabindex="-1">
    <input type="file" multiple webkitdirectory directory class="rep-dir-in" hidden aria-hidden="true" tabindex="-1">
    <ol class="note rep-file-list" hidden></ol><p class="note rep-file-total" aria-live="polite" hidden></p>
    ` : ''}
    <div class="tile-row">${tile_({ icon: 'send', label: 'Send', note: admin ? 'to Claude' : 'to the admin', act: 'rep-send', cls: 'rep-send is-submit' })}${
      people ? '' : tile_({ icon: 'photo', label: files ? 'Add a picture or video' : 'Add a picture', note: 'camera or library', act: 'rep-pic', cls: 'rep-pic' })}${
      files ? tile_({ icon: 'doc', label: 'Add files', note: 'PDFs, pictures, docx, zip', act: 'rep-files', cls: 'rep-files-t' }) : ''}${
      files && !repNoDir_() ? tile_({ icon: 'plus', label: 'Add a folder', note: 'keeps its subfolders', act: 'rep-dir', cls: 'rep-dir-t' }) : ''}${
      tile_({ icon: 'close', label: 'Cancel', act: 'rep-cancel' })}</div>
    <p class="note me-said rep-said" aria-live="polite">${admin
      ? 'Yours goes straight to Notes for Claude.'
      : people ? 'Only the admin sees this, and they are told at once.' : 'The admin reads it first; nothing changes until they do.'}</p>
  </div>`;
}
/* THE FUNNEL PATH (498): a suggestion made on Find says which answers and words led there, in the chips' own words (660), never a field name. */
function reportPath_(el) {
  try {
    const sc = el && el.closest ? el.closest('.screen') : null;
    const F = sc && typeof finderOf_ === 'function' ? finderOf_(String(sc.id).replace(/^s-/, '')) : null;
    if (!F) return '';
    return inFinder_(F, () => {
      const steps = (STUFF.filters || []).map((f, i) => { try { return String(chipText_(f, i)); } catch (e) { return f.any ? 'any' : String(f.value || ''); } }).filter(Boolean);
      return 'Find' + (steps.length ? ' › ' + steps.join(' › ') : '');
    });
  } catch (e) { return ''; }
}
/* A PICTURE, SHRUNK ON THE PHONE (498): the long side down to 1280px, then the JPEG quality down until it is under about 300 KB. */
const REP_PIC_MAX = 300 * 1024, REP_PIC_SIDE = 1280;
/* THE SHRUNK PICTURE, by its box: a data URL is too long for an attribute. */
const REP_PIC = new WeakMap();
function reportPicShrink_(file, sideMax, bytesMax) {
  const SIDE = sideMax || REP_PIC_SIDE, MAX = bytesMax || REP_PIC_MAX;
  return new Promise((ok, no) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); no(new Error('That is not a picture this phone can read.')); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      let side = SIDE, out = '';
      for (let tries = 0; tries < 6; tries++) {
        const k = Math.min(1, side / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        for (const q of [0.8, 0.65, 0.5]) { out = c.toDataURL('image/jpeg', q); if (out.length * 0.75 <= MAX) return ok(out); }
        side = Math.round(side * 0.7);
      }
      ok(out);
    };
    img.src = url;
  });
}
on('rep-pic', el => { const f = el.closest('.rep-box'); const i = f && f.querySelector('.rep-pic-in'); if (i) i.click(); });
document.addEventListener('change', e => {
  const i = e.target;
  if (!i || !i.classList || !i.classList.contains('rep-pic-in')) return;
  const form = i.closest('.rep-box'), file = i.files && i.files[0];
  if (!form || !file) return;
  const said = form.querySelector('.rep-said'), show = form.querySelector('.rep-pic-show');
  /* A VIDEO FROM THE CAMERA ROLL (640) goes the admin's files route, with its frames; a picture stays the note's picture. */
  if (/^video\//.test(file.type || '') || /\.(mov|mp4|m4v|webm)$/i.test(file.name || '')) {
    if (form.querySelector('.rep-files-in')) repFilesAdd_(form, [file], false);
    else if (said) said.textContent = 'A video cannot go from here: send a picture instead.';
    try { i.value = ''; } catch (err) { /* a picker that will not clear only means the same file cannot be picked twice */ }
    return;
  }
  reportPicShrink_(file).then(data => {
    REP_PIC.set(form, data);
    if (show) { show.src = data; show.hidden = false; }
    const t = form.querySelector('.rep-pic');
    if (t) tileSet_(t, { icon: 'photo', label: 'Change the picture', on: true });
  }).catch(err => { if (said) said.textContent = why_(err); });
});
/* ---------- FILES AND FOLDERS FOR CLAUDE (515), the admin's alone: each file sent in parts to Drive "Claude inbox", one at a time, then the note names them. */
/* ANY KIND OF FILE (owner, 1 Nov: "python is what I was trying to add but can't"): no `accept` list, only the size limit (547). */
/* 8 MiB a part, a multiple of Drive's 256 KiB, about 11 MB once base64 — well under Apps Script's 50 MB a request. */
const REP_PART = 8 * 1048576, REP_FILE_MAX = 500 * 1048576, REP_TRIES = 3;
/* IPHONE AND IPAD SAFARI CANNOT PICK A FOLDER (the input opens as plain files), so the tile is not drawn and the box says so. */
const repNoDir_ = () => { try { return /iP(hone|ad|od)/.test(navigator.userAgent || '') || !('webkitdirectory' in window.HTMLInputElement.prototype); } catch (e) { return true; } };
/* THE CHOSEN FILES, by box: [{ file, rel, state: 'wait'|'sending'|'done'|'failed', sent }]. */
const REP_FILES = new WeakMap();
const repMb_ = n => (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB';
function repFilesDraw_(form) {
  const list = REP_FILES.get(form) || [], ol = form.querySelector('.rep-file-list'), tot = form.querySelector('.rep-file-total');
  if (!ol || !tot) return;
  repVidsDraw_(form, list);
  ol.hidden = tot.hidden = !list.length;
  ol.innerHTML = list.slice(0, 50).map(x => `<li class="rep-file is-${x.state}">${esc(x.rel)} · ${
    x.state === 'done' ? 'sent' : x.state === 'failed' ? 'failed — Send tries it again' : x.state === 'sending' ? Math.floor(100 * x.sent / Math.max(1, x.file.size)) + '%' : repMb_(x.file.size)}</li>`).join('')
    + (list.length > 50 ? `<li>… and ${list.length - 50} more</li>` : '');
  const all = list.reduce((a, x) => a + x.file.size, 0), sent = list.reduce((a, x) => a + (x.state === 'done' ? x.file.size : x.sent || 0), 0);
  const done = list.filter(x => x.state === 'done').length;
  tot.textContent = `${done} of ${list.length} file${list.length === 1 ? '' : 's'} sent · ${repMb_(sent)} of ${repMb_(all)}`;
}
/* THE BATCH'S FOLDER NAME: the chosen folder's own name, else "Files" and the minute, so loose files never mix with an earlier batch. */
function repBatch_(list) {
  const top = list.map(x => x.rel.split('/')[0]);
  if (list.length && list.every(x => x.rel.indexOf('/') > 0) && top.every(t => t === top[0])) return { batch: top[0], strip: true };
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return { batch: `Files ${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}${p(d.getMinutes())}`, strip: false };
}
const repB64_ = blob => new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result || '').replace(/^data:[^,]*,/, ''));
  r.onerror = () => no(new Error('That file could not be read.'));
  r.readAsDataURL(blob);
});
/* ONE FILE, PART BY PART; a failed part starts the file again (a fresh Drive session), up to REP_TRIES times. */
async function repSendFile_(form, x, b) {
  const rel = b.strip ? x.rel.split('/').slice(1).join('/') : x.rel.split('/').pop();
  for (let tries = 0; tries < REP_TRIES; tries++) {
    const upload = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    x.state = 'sending'; x.sent = 0; repFilesDraw_(form);
    try {
      let start = 0;
      do {
        const part = x.file.slice(start, start + REP_PART);
        const d = await api({ action: 'suggestUpload', personId: USER.personId || '', batch: b.batch, rel, upload,
          size: x.file.size, start, mime: x.file.type || '', data: await repB64_(part) });
        if (!d || d.error) throw new Error((d && d.error) || 'That part did not go.');
        start += part.size; x.sent = start; repFilesDraw_(form);
      } while (start < x.file.size);
      x.state = 'done'; repFilesDraw_(form);
      await repSmallCopy_(x, b, rel);
      await repFramesSend_(form, x, b, rel);
      return true;
    } catch (e) { x.error = why_(e); }
  }
  x.state = 'failed'; repFilesDraw_(form);
  return false;
}
/* A PICTURE ALSO GOES AS `<name>.small.jpg` (600), 640 px and under 40 KB, so a Claude session can read it without the 1.4 MB original. Best effort. */
const REP_SMALL_SIDE = 640, REP_SMALL_MAX = 40 * 1024;
async function repSmallCopy_(x, b, rel) {
  if (!/^image\//.test(x.file.type || '') || /\.small\.jpg$/i.test(rel)) return;
  try {
    const data = String(await reportPicShrink_(x.file, REP_SMALL_SIDE, REP_SMALL_MAX)).replace(/^data:[^,]*,/, '');
    const size = Math.floor(data.length * 3 / 4) - (/==$/.test(data) ? 2 : /=$/.test(data) ? 1 : 0);
    await api({ action: 'suggestUpload', personId: USER.personId || '', batch: b.batch, rel: rel.replace(/\.[^./]*$/, '') + '.small.jpg',
      upload: Date.now() + '-s' + Math.random().toString(36).slice(2, 8), size, start: 0, mime: 'image/jpeg', data });
  } catch (e) { /* best effort: the original is already in Drive */ }
}
function repFilesAdd_(form, files, dir) {
  const said = form.querySelector('.rep-said'), list = REP_FILES.get(form) || [], big = [];
  [...(files || [])].forEach(f => {
    const rel = String((dir && f.webkitRelativePath) || f.name).replace(/^\/+/, '');
    if (f.size > REP_FILE_MAX) { big.push(f.name); return; }
    if (!f.size || list.some(x => x.rel === rel && x.file.size === f.size)) return;
    const x = { file: f, rel, state: 'wait', sent: 0 };
    list.push(x);
    if (repIsVideo_(f)) repFramesMake_(form, x);
  });
  REP_FILES.set(form, list);
  repFilesDraw_(form);
  if (said && big.length) said.textContent = `Too large (over ${repMb_(REP_FILE_MAX)}), left out: ${big.slice(0, 3).join(', ')}${big.length > 3 ? '…' : ''}`;
}
on('rep-files', el => { const i = el.closest('.rep-box') && el.closest('.rep-box').querySelector('.rep-files-in'); if (i) i.click(); });
on('rep-dir', el => { const i = el.closest('.rep-box') && el.closest('.rep-box').querySelector('.rep-dir-in'); if (i) i.click(); });
document.addEventListener('change', e => {
  const i = e.target;
  if (!i || !i.classList || !(i.classList.contains('rep-files-in') || i.classList.contains('rep-dir-in'))) return;
  const form = i.closest('.rep-box');
  if (form) repFilesAdd_(form, i.files, i.classList.contains('rep-dir-in'));
  try { i.value = ''; } catch (err) { oops_(err, 'submit:repFilesAdd_') }
});
/* ---------- A VIDEO ALSO GOES AS FRAMES (640): Claude reads Drive through a connector that cannot watch video, so the phone makes `<name>.frames-N.jpg` contact sheets and a `.small.jpg`. */
const REP_FRAMES_MAX = 24, REP_FRAMES_STEP = 0.5, REP_SHEET_W = 1280, REP_SHEET_COLS = 4, REP_SHEET_PER = 12, REP_SHEET_BYTES = 150 * 1024, REP_SEEK_MS = 8000;
const repIsVideo_ = f => /^video\//.test((f && f.type) || '') || /\.(mov|mp4|m4v|webm)$/i.test((f && f.name) || '');
/* ONE TILE PER VIDEO: attached, its frames being made (the dots), made, or not made — said plainly. */
function repVidsDraw_(form, list) {
  const el = form.querySelector('.rep-vids');
  if (!el) return;
  const vids = list.filter(x => repIsVideo_(x.file));
  el.hidden = !vids.length;
  el.innerHTML = vids.map(x => {
    const note = x.frames === 'making' ? 'video attached · making its frames'
      : Array.isArray(x.frames) ? `video attached · ${x.frameCount} frames on ${x.frames.length} sheet${x.frames.length === 1 ? '' : 's'}`
      : 'video attached · no frames: ' + (x.framesError || 'this browser could not read it') + '. The video still goes.';
    return `<div class="tile-row rep-vid${x.frames === 'making' ? ' is-making' : ''}"${x.frames === 'making' ? ' aria-busy="true"' : ''}>${
      tile_({ icon: 'play', label: x.rel.split('/').pop(), note, act: 'rep-pic', cls: 'rep-vid-t' })}${x.frames === 'making' ? loading_() : ''}</div>`
      + `<p class="note rep-vid-said">${esc(x.rel.split('/').pop())} · ${esc(note)}</p>`;
  }).join('');
}
const repSeek_ = (v, t) => new Promise((ok, no) => {
  const done = () => { clearTimeout(k); v.removeEventListener('seeked', done); ok(); };
  const k = setTimeout(() => { v.removeEventListener('seeked', done); no(new Error('the video would not move to ' + t.toFixed(1) + ' s')); }, REP_SEEK_MS);
  v.addEventListener('seeked', done);
  v.currentTime = t;
});
const repStamp_ = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') + '.' + Math.floor((t % 1) * 10);
/* A CANVAS AS A JPEG UNDER `max` bytes, trying lower quality first, then a smaller copy. */
function repJpeg_(c, max) {
  let out = '';
  for (let k = 1; k > 0.3; k *= 0.75) {
    let src = c;
    if (k < 1) { src = document.createElement('canvas'); src.width = Math.max(1, Math.round(c.width * k)); src.height = Math.max(1, Math.round(c.height * k)); src.getContext('2d').drawImage(c, 0, 0, src.width, src.height); }
    for (const q of [0.75, 0.6, 0.45]) { out = src.toDataURL('image/jpeg', q); if (out.length * 0.75 <= max) return out; }
  }
  return out;
}
/* THE FRAMES: one every half second, or spread over the whole video when it is longer than 12 s; 12 to a sheet, 4 across, each stamped with its time. */
async function repVideoFrames_(file) {
  const v = document.createElement('video'), url = URL.createObjectURL(file);
  v.muted = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('playsinline', '');
  try {
    await new Promise((ok, no) => {
      const k = setTimeout(() => no(new Error('the video did not open')), REP_SEEK_MS);
      v.onloadeddata = () => { clearTimeout(k); ok(); };
      v.onerror = () => { clearTimeout(k); no(new Error('this browser cannot play that video')); };
      v.src = url;
    });
    const len = isFinite(v.duration) && v.duration > 0 ? Number(v.duration) : 0, W = v.videoWidth, H = v.videoHeight;
    if (!W || !H) throw new Error('the video has no picture');
    const step = Math.max(REP_FRAMES_STEP, len / REP_FRAMES_MAX), times = [];
    for (let t = 0; t < Math.max(len, 0.01) && times.length < REP_FRAMES_MAX; t += step) times.push(Math.min(t, Math.max(0, len - 0.05)));
    const cw = Math.floor(REP_SHEET_W / REP_SHEET_COLS), ch = Math.round(cw * H / W), sheets = [];
    let small = '';
    for (let s = 0; s < times.length; s += REP_SHEET_PER) {
      const part = times.slice(s, s + REP_SHEET_PER), rows = Math.ceil(part.length / REP_SHEET_COLS);
      const c = document.createElement('canvas');
      c.width = cw * Math.min(REP_SHEET_COLS, part.length); c.height = ch * rows;
      const g = c.getContext('2d');
      g.fillStyle = token_('--black', 'black'); g.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < part.length; i++) {
        await repSeek_(v, part[i]);
        const x0 = (i % REP_SHEET_COLS) * cw, y0 = Math.floor(i / REP_SHEET_COLS) * ch;
        g.drawImage(v, x0, y0, cw, ch);
        if (!small) { const sc = document.createElement('canvas'), k = Math.min(1, REP_SMALL_SIDE / Math.max(W, H)); sc.width = Math.round(W * k); sc.height = Math.round(H * k); sc.getContext('2d').drawImage(v, 0, 0, sc.width, sc.height); small = repJpeg_(sc, REP_SMALL_MAX); }
        const lab = repStamp_(part[i]);
        g.font = 'bold 16px sans-serif'; g.fillStyle = token_('--black', 'black'); g.fillRect(x0 + 4, y0 + 4, g.measureText(lab).width + 10, 22);
        g.fillStyle = token_('--white', 'white'); g.fillText(lab, x0 + 9, y0 + 21);
      }
      sheets.push(repJpeg_(c, REP_SHEET_BYTES));
    }
    if (!sheets.length || sheets.some(x => !/^data:image\/jpeg/.test(x))) throw new Error('the frames could not be drawn');
    return { sheets, small, count: times.length };
  } finally { try { v.removeAttribute('src'); v.load(); } catch (e) { /* letting go of the video is a courtesy */ } URL.revokeObjectURL(url); }
}
function repFramesMake_(form, x) {
  x.frames = 'making';
  x.framesJob = repVideoFrames_(x.file).then(r => { x.frames = r.sheets; x.small = r.small; x.frameCount = r.count; },
    e => { x.frames = null; x.framesError = String((e && e.message) || e || 'unknown'); })
    .then(() => repFilesDraw_(form));
}
/* ONE JPEG BY ITS DATA URL, in one part; best effort. */
async function repSendJpeg_(b, rel, url) {
  const data = String(url || '').replace(/^data:[^,]*,/, '');
  if (!data) return false;
  const size = Math.floor(data.length * 3 / 4) - (/==$/.test(data) ? 2 : /=$/.test(data) ? 1 : 0);
  const d = await api({ action: 'suggestUpload', personId: USER.personId || '', batch: b.batch, rel,
    upload: Date.now() + '-f' + Math.random().toString(36).slice(2, 8), size, start: 0, mime: 'image/jpeg', data });
  return !!(d && !d.error);
}
/* AFTER THE VIDEO: its sheets and its small copy beside it. A failure is said under the row, and the video stays sent. */
async function repFramesSend_(form, x, b, rel) {
  if (!repIsVideo_(x.file)) return;
  await Promise.resolve(x.framesJob);
  const base = rel.replace(/\.[^./]*$/, ''), said = form.querySelector('.rep-said');
  if (!Array.isArray(x.frames)) { if (said) said.textContent = `${rel} went, but its frames could not be made (${x.framesError || 'unknown'}): Claude will have only the video.`; return; }
  try {
    let ok = true;
    for (let i = 0; i < x.frames.length; i++) ok = (await repSendJpeg_(b, `${base}.frames-${i + 1}.jpg`, x.frames[i])) && ok;
    if (x.small) ok = (await repSendJpeg_(b, base + '.small.jpg', x.small)) && ok;
    if (!ok && said) said.textContent = `${rel} went, but some of its frames did not.`;
  } catch (e) { if (said) said.textContent = `${rel} went, but its frames did not: ${why_(e)}`; }
}
/* EVERY FILE NOT YET SENT, in order; resolves to the note's `files`, or null when one failed (Send again retries only those). */
async function repFilesSend_(form) {
  const list = REP_FILES.get(form) || [];
  if (!list.length) return undefined;
  const b = form.dataset.batch ? JSON.parse(form.dataset.batch) : repBatch_(list);
  form.dataset.batch = JSON.stringify(b);
  for (const x of list) if (x.state !== 'done' && !(await repSendFile_(form, x, b))) return null;
  return { batch: b.batch, count: list.length, names: list.map(x => b.strip ? x.rel.split('/').slice(1).join('/') : x.rel) };
}
const reportBoxOf_ = (kind, id) => [...document.querySelectorAll('.rep-box')].find(b => b.dataset.rk === kind && b.dataset.ri === id) || null;
on('rep-box', el => {
  if (!(typeof rankAtLeast_ === 'function' && rankAtLeast_('student'))) { toast('Sign in to suggest a change.'); return; }
  const kind = el.getAttribute('data-rk') || '', id = el.getAttribute('data-ri') || '';
  const had = reportBoxOf_(kind, id);
  if (had) { boxOut_(had); return; }
  let finder = '';
  try { finder = (finderAt_(el) || {}).id || ''; } catch (e) { /* outside any finder reads as none */ }
  /* IN PLACE OF THE THING (489, `boxInPlace_`); a message's box still goes under the whole message. */
  /* A TILE DRAWN WITHOUT A NAME (a widget with no title field) takes its thing's heading, so the note names what a person sees. */
  const home = el.closest('.card, .own-set, .post');
  const h = home && home.querySelector('h2, h3, .wgt-title');
  const label = el.getAttribute('data-rl') || ((h && h.textContent) || '').trim().slice(0, 120);
  const box = boxInPlace_(el, reportBoxHtml_(kind, id, label, finder, reportPath_(el)));
  const s = box && box.querySelector('textarea');
  if (s) try { s.focus({ preventScroll: true }); } catch (e) { /* an element that cannot take focus is left as it is */ }
});
/* CANCEL CLOSES THE BOX AND KEEPS THE WORDS as the draft, for the next open. */
on('rep-cancel', el => { boxOut_(el.closest('.rep-box')); });
on('rep-send', el => {
  const form = el.closest('.rep-box');
  if (!form || form.classList.contains('is-sending') || !USER) return;
  const said = form.querySelector('.rep-said');
  const kind = form.dataset.rk, id = form.dataset.ri;
  const box = form.querySelector('.rep-note-in');
  const note = String((box && box.value) || '').trim().slice(0, SUGGEST_NOTE_MAX);
  const hasFiles = (REP_FILES.get(form) || []).length > 0;
  if (!note && !hasFiles && !suggestPeople_(kind)) { if (said) said.textContent = 'Write what should change first.'; return; }
  /* THE BOOKING WIDGET'S FIELDS GO WITH IT (29 Oct), so the note says what was filled in — `bookFieldsSaid_`, book.js. */
  const fields = kind === 'widget' && id === 'booking' && typeof bookFieldsSaid_ === 'function' ? bookFieldsSaid_() : '';
  form.classList.add('is-sending');
  (hasFiles ? repFilesSend_(form) : Promise.resolve(undefined)).catch(() => null).then(files => {
  form.classList.remove('is-sending');
  if (files === null) { const bad = (REP_FILES.get(form) || []).find(x => x.state === 'failed'); if (said) said.textContent = 'A file did not go' + (bad && bad.error ? ': ' + bad.error : '') + '. Press Send to try the rest again.'; return; }
  return send_({ action: 'suggest', personId: USER.personId || '', kind, itemId: id, label: form.dataset.rl || '', note: [note, fields].filter(Boolean).join('\n\n'),
          finder: form.dataset.finder || '', path: form.dataset.path || '', image: REP_PIC.get(form) || '', device: reportDevice_(), ...(files ? { files } : {}) },
        { button: el, where: said })
    .then(d => {
      /* SENT, SO THE DRAFT GOES — a reload must not bring back words already in the sheet. */
      try { draftDrop_('rep', kind + '|' + id); } catch (e) { oops_(e, 'submit:repFilesSend_') }
      if (box) box.value = '';
      boxOut_(form);
      if (d && d.serious && DATA) {
        DATA.reportedItems = (DATA.reportedItems || []).concat(kind + '|' + id);
        if (Array.isArray(d.notes)) DATA.claudeNotes = d.notes;
      }
      toast(d && d.already ? 'Thanks — you already sent that one today' : d && d.serious ? 'Sent to Notes for Claude' : 'Thanks — sent to the admin');
    })
    .catch(() => {});
  });
});
