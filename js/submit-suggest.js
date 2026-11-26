/* @family. — js/submit-suggest.js THE FLAG (owner, 16 Nov): one switch on every thing, nothing typed (cut from submit.js; read as one by tools/piece-src.js). */
/* ---------- THE FLAG: one tap on, one tap off ----------
   An admin's goes to Notes for Claude; anybody else's waits for Confirm. */
/* ON IS THE VIEWER'S OWN FLAG STILL WAITING: `myFlags` from the backend, `kind|id`. */
const flagMine_ = (kind, id) => ((typeof DATA !== 'undefined' && DATA && DATA.myFlags) || []).indexOf(kind + '|' + id) !== -1;
/* THE ONE TILE'S OPTIONS, on every thing, drawn by `tile_`: Student rank and up; signed out, null (no tile). */
function suggestOpts_(kind, id, label, cls) {
  /* NO FLAG ANYWHERE (owner, 24 Nov) */
  return null;
}
/* A CARD WITH NO TILE ROW OF ITS OWN takes the tile in one of its own, put inside the card by `cardRowIn_`. */
function suggestRowIn_(html, kind, id, label) {
  const t = tile_(suggestOpts_(kind, id, label));
  return t && typeof cardRowIn_ === 'function' ? cardRowIn_(html, cardBlock_({ type: 'group', look: 'tile-row rep-row', inner: t })) : html;
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
    const touch = matchMedia(COARSE_).matches;
    return !touch ? 'computer' : w < 600 ? 'phone' : 'tablet';
  } catch (e) { return ''; }
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
/* EVERY FLAG TILE ON A THING SHOWS THE ONE STATE (`tileSet_` writes the plate and `aria-pressed`). */
function flagPaint_(kind, id) {
  document.querySelectorAll('[data-do="rep-flag"]').forEach(t => {
    if (t.getAttribute('data-rk') === kind && t.getAttribute('data-ri') === id) { const v = flagMine_(kind, id); tileSet_(t, { on: v, pressed: v }); }
  });
}
/* THE SCREEN AS THE PERSON SEES IT (owner, 18 Nov): the `.screen.on` the tile is in, through the one picture maker
   (`rcPng_`), cut to the part inside the window and redrawn ≤1000px wide as a JPEG. Resolves a data URL, or '' on any failure or after 6 s. */
function flagShot_(el) {
  const scr = el.closest('.screen.on') || document.querySelector('.screen.on');
  if (!scr || typeof rcPng_ !== 'function') return Promise.resolve('');
  const r = scr.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
  const x0 = Math.max(0, -r.left), y0 = Math.max(0, -r.top), x1 = Math.min(r.width, vw - r.left), y1 = Math.min(r.height, vh - r.top);
  if (!(x1 > x0 && y1 > y0)) return Promise.resolve('');
  const make = rcPng_(scr).then(p => new Promise((ok, no) => {
    const u = URL.createObjectURL(p.blob), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(u); no(new Error('flag picture')); };
    img.onload = () => {
      const k = p.w / r.width, sw = (x1 - x0) * k, sh = (y1 - y0) * k, f = Math.min(1, 1000 / sw);
      const cv = document.createElement('canvas'); cv.width = Math.round(sw * f); cv.height = Math.round(sh * f);
      cv.getContext('2d').drawImage(img, x0 * k, y0 * k, sw, sh, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(u);
      let d = ''; for (const q of [0.7, 0.5, 0.35]) { d = cv.toDataURL('image/jpeg', q); if (d.length < 400000) break; }
      ok(d.length < 400000 ? d : '');
    };
    img.src = u;
  }));
  return Promise.race([make, new Promise(ok => setTimeout(() => ok(''), 6000))]).catch(e => { if (typeof oops_ === 'function') oops_(e, 'flag:shot'); return ''; });
}
/* ONE TAP: on if off, off if on — at once on the screen, put back if the backend says no. */
on('rep-flag', el => {
  if (!(typeof may_ === 'function' && may_('signedIn')) || !USER) { toast(text_('sign-in-to-suggest-a-change')); return; }
  if (el.classList.contains('is-sending')) return;
  const kind = el.getAttribute('data-rk') || '', id = el.getAttribute('data-ri') || '', key = kind + '|' + id;
  const was = flagMine_(kind, id);
  const set = v => { if (DATA) DATA.myFlags = ((DATA.myFlags || []).filter(k => k !== key)).concat(v ? [key] : []); flagPaint_(kind, id); };
  const home = el.closest('.card, .own-set');
  const h = home && home.querySelector('h2, h3, .wgt-title');
  const label = el.getAttribute('data-rl') || ((h && h.textContent) || '').trim().slice(0, 120);
  let finder = '';
  try { finder = (finderAt_(el) || {}).id || ''; } catch (e) { /* outside any finder reads as none */ }
  set(!was);
  el.classList.add('is-sending');
  const body = { action: 'suggest', flag: was ? 'off' : 'on', personId: USER.personId || '', kind, itemId: id, label, finder, path: reportPath_(el), device: reportDevice_() };
  /* A FLAG TURNED ON CARRIES A PICTURE OF WHAT WAS SEEN (owner, 18 Nov); a picture that fails or is slow is left out, never the flag. */
  (was ? Promise.resolve('') : flagShot_(el)).then(shot => send_(shot ? Object.assign(body, { shot }) : body, { button: el }))
    .then(d => {
      if (d && DATA) {
        if (Array.isArray(d.myFlags)) DATA.myFlags = d.myFlags;
        if (Array.isArray(d.reportedItems)) DATA.reportedItems = d.reportedItems;
        if (Array.isArray(d.notes)) DATA.claudeNotes = d.notes;
      }
      flagPaint_(kind, id);
    })
    .catch(() => set(was))
    .then(() => el.classList.remove('is-sending'));
});
