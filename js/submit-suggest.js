/* @family. — js/submit-suggest.js THE FLAG (owner, 16 Nov): one switch on every thing, nothing typed (cut from submit.js; read as one by tools/piece-src.js). */
/* ---------- THE FLAG: one tap on, one tap off ----------
   An admin's goes to Notes for Claude; anybody else's waits for Confirm. A message's says "Tell the admin" (413). */
/* A RULE (496): `tell-admin` — the words only; the quiet safeguarding path stays either way. */
const suggestTell_ = kind => suggestPeople_(kind) && (typeof ruleOn_ !== 'function' || ruleOn_('tell-admin'));
/* ON IS THE VIEWER'S OWN FLAG STILL WAITING: `myFlags` from the backend, `kind|id`. */
const flagMine_ = (kind, id) => ((typeof DATA !== 'undefined' && DATA && DATA.myFlags) || []).indexOf(kind + '|' + id) !== -1;
/* THE ONE TILE'S OPTIONS, on every thing, drawn by `tile_`: Student rank and up; signed out, null (no tile). */
function suggestOpts_(kind, id, label, cls) {
  if (!kind || !id || typeof may_ !== 'function' || !may_('signedIn')) return null;
  const on = flagMine_(kind, id);
  return ({ icon: 'flag', label: suggestTell_(kind) ? 'Tell the admin' : 'Flag', on, pressed: on,
                 act: 'rep-flag', cls: 'rep-tile' + (cls ? ' ' + cls : ''), data: { rk: kind, ri: id, rl: String(label || '').slice(0, 120) } });
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
    const touch = matchMedia('(pointer: coarse)').matches;
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
/* ONE TAP: on if off, off if on — at once on the screen, put back if the backend says no. */
on('rep-flag', el => {
  if (!(typeof may_ === 'function' && may_('signedIn')) || !USER) { toast(text_('sign-in-to-suggest-a-change')); return; }
  if (el.classList.contains('is-sending')) return;
  const kind = el.getAttribute('data-rk') || '', id = el.getAttribute('data-ri') || '', key = kind + '|' + id;
  const was = flagMine_(kind, id);
  const set = v => { if (DATA) DATA.myFlags = ((DATA.myFlags || []).filter(k => k !== key)).concat(v ? [key] : []); flagPaint_(kind, id); };
  const home = el.closest('.card, .own-set, .post');
  const h = home && home.querySelector('h2, h3, .wgt-title');
  const label = el.getAttribute('data-rl') || ((h && h.textContent) || '').trim().slice(0, 120);
  let finder = '';
  try { finder = (finderAt_(el) || {}).id || ''; } catch (e) { /* outside any finder reads as none */ }
  set(!was);
  el.classList.add('is-sending');
  send_({ action: 'suggest', flag: was ? 'off' : 'on', personId: USER.personId || '', kind, itemId: id, label, finder, path: reportPath_(el), device: reportDevice_() }, { button: el })
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
