/* @family. — words.js THE ADMIN CHANGES THE SITE WITHOUT ASKING (497): the words on every widget and card edited in place, and who sees each. */
/* Words: config's one `words` row, `{key: text}`, sent as `words`; a key is `<card or w:widget>|<slot>`. Who sees: the layout's `seen`. */

/* ---------- THE WORDS IN FORCE: the payload's, else the device's copy of the last, else the code's own ---------- */
const WORDS_STORE = 'familyWords';
const WORDS_KEY_RE = /^[A-Za-z0-9_:.#-]{1,64}\|[a-z]{1,2}:[a-z0-9]{1,10}$/;
const WORDS_PIECE_MAX = 300;
let WORDS_KEPT;
/* WHICH CARD OR WIDGET IS BEING EDITED, by its words scope; '' for none. */
let WORDS_EDIT = '';
function wordsNow_() {
  let w;
  try { w = DATA && DATA.words; } catch (e) { w = null; }
  if (w && typeof w === 'object' && !Array.isArray(w)) {
    try { const s = JSON.stringify(w); if (s !== WORDS_KEPT) { WORDS_KEPT = s; localStorage.setItem(WORDS_STORE, s); } } catch (e) {}
    return w;
  }
  try { const k = JSON.parse(localStorage.getItem(WORDS_STORE) || '{}'); return k && typeof k === 'object' && !Array.isArray(k) ? k : {}; } catch (e) { return {}; }
}
/* THE ONE LOOKUP, like `brand(k, or)`: the admin's text, else the code's. Plain text — whoever draws it escapes it. */
function words_(key, or) {
  const v = wordsNow_()[key];
  return typeof v === 'string' && v.trim() ? v : or;
}
/* A SLOT IS NAMED BY ITS KIND AND THE CODE'S OWN WORDS, so a card's pieces keep their keys when the code reorders them. */
function wordsSlot_(kind, raw) {
  let h = 5381;
  const t = String(raw).trim();
  for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return kind + ':' + h.toString(36);
}
const wordsAttr_ = s => String(s).replace(/"/g, '&quot;');

/* ---------- EVERY PIECE OF A CARD'S WORDS MARKED, AND THE ADMIN'S TEXT PUT IN: headings, plain lines, a card's say line, placeholders ---------- */
/* Only a piece that is text alone (no markup inside); what replaces it is escaped, so typed `<script>` is shown as text. */
function wordsIn_(scope, html) {
  const h = String(html == null ? '' : html);
  if (!h || !LAYOUT_ID.test(String(scope || ''))) return h;
  /* THE CARD BEING EDITED IS DRAWN EDITABLE: the lock is written in the markup, never set by script (the answer boxes' rule). */
  const edit = WORDS_EDIT === scope ? ' contenteditable="plaintext-only" spellcheck="true"' : '';
  const piece = (kind, raw, open, close) => {
    if (!raw.trim() || /\sdata-wk=/.test(open)) return null;
    const k = scope + '|' + wordsSlot_(kind, raw), v = words_(k, ''), set = !!v;
    const tag = open.replace(/^<([a-z0-9]+)/i, `<$1 data-wk="${k}" data-wko="${wordsAttr_(raw.trim())}"${set ? ' data-wk-set=""' : ''}${edit}`);
    return tag + (set ? esc(v) : raw) + close;
  };
  return h
    .replace(/(<h[1-4]\b[^>]*>)([^<]{1,200})(<\/h[1-4]>)/g, (m, o, t, c) => piece('h', t, o, c) || m)
    .replace(/(<p\b[^>]*>)([^<]{1,400})(<\/p>)/g, (m, o, t, c) => piece('p', t, o, c) || m)
    .replace(/(<span class="faint card-say">)([^<]{1,400})(<\/span>)/g, (m, o, t, c) => piece('s', t, o, c) || m)
    .replace(/(<(?:input|textarea)\b[^>]*?)\splaceholder="([^"]{1,200})"/g, (m, o, t) => {
      if (/\sdata-wkp=/.test(o)) return m;
      const k = scope + '|' + wordsSlot_('ph', t), v = words_(k, ''), set = !!v;
      return `${o} data-wkp="${k}" data-wko="${wordsAttr_(t)}" placeholder="${set ? esc(v) : t}"`;
    });
}

/* ---------- THE ADMIN'S TWO TILES on every widget, card and item, in the layout group: Edit words, Who sees this ---------- */
function wordsTiles_(scope, id) {
  if (!layoutIsAdmin_()) return '';
  const s = seenOf_(id);
  return tile_({ icon: 'edit', label: 'Edit words', note: 'type over this card\'s words, for everyone', act: 'words-edit', tone: 'admin', data: { ws: scope } })
    + tile_({ icon: 'show', label: 'Who sees this', note: s ? SEEN_SAY[s] : 'Everyone', act: 'seen-open', tone: 'admin', on: !!s, data: { lc: id } });
}
const wordsRoot_ = el => el.closest('.wk-editing') || el.closest('.card, .own-set, .post');
const wordsText_ = s => String(s || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, WORDS_PIECE_MAX);

/* ---------- EDITING IN PLACE: each marked piece editable where it stands, Reset beside any the admin has changed, Save and Done under ---------- */
function wordsEditOn_(root) {
  root.classList.add('wk-editing');
  root.querySelectorAll('[data-wkp]').forEach(inp => {
    if (inp.nextElementSibling && inp.nextElementSibling.classList.contains('wk-ph-row')) return;
    const k = inp.getAttribute('data-wkp'), set = Object.prototype.hasOwnProperty.call(wordsNow_(), k);
    inp.insertAdjacentHTML('afterend', `<span class="wk-ph-row"><span class="faint">Placeholder</span> <span class="wk-ph" contenteditable="plaintext-only" data-wk="${esc(k)}" data-wko="${esc(inp.getAttribute('data-wko') || '')}"${
      set ? ' data-wk-set=""' : ''}>${esc(inp.getAttribute('placeholder') || '')}</span></span>`);
  });
  const all = [...root.querySelectorAll('[data-wk]')];
  all.forEach(p => {
    if (p.hasAttribute('data-wk-set')) p.insertAdjacentHTML('afterend', `<span class="tile-row wk-reset">${
      tile_({ icon: 'undo', label: 'Reset this text', note: 'back to the code\'s wording', act: 'words-reset', tone: 'admin', data: { wk: p.getAttribute('data-wk') } })}</span>`);
  });
  root.insertAdjacentHTML('beforeend', `<div class="wk-bar"><p class="faint wk-say">${all.length
    ? 'Type over any outlined words. Save changes them for everyone; Reset returns a piece to the code\'s wording.'
    : 'This card has no words that can be changed here.'}</p><div class="tile-row">${
    all.length ? tile_({ icon: 'save', label: 'Save words', act: 'words-save', tone: 'admin' }) : ''}${
    tile_({ icon: 'close', label: 'Done', note: 'stop editing words', act: 'words-done', tone: 'admin' })}</div></div>`);
  if (all[0]) try { all[0].focus(); } catch (e) {}
}
/* REDRAWN EDITABLE (or not), then the bar put on the card found again by its tile. */
function wordsEditSet_(scope) {
  WORDS_EDIT = scope;
  try { layoutRelayout_(); } catch (e) {}
  if (!scope) return;
  const t = [...document.querySelectorAll('[data-do="words-edit"]')].find(x => x.getAttribute('data-ws') === scope);
  const root = t && wordsRoot_(t);
  if (root && !root.classList.contains('wk-editing')) wordsEditOn_(root);
}
on('words-edit', el => {
  if (!layoutIsAdmin_()) return;
  const scope = el.getAttribute('data-ws') || '';
  wordsEditSet_(WORDS_EDIT === scope ? '' : scope);
});
on('words-done', () => wordsEditSet_(''));

/* ---------- SAVED FOR EVERYBODY, DRAWN AT ONCE, PUT BACK IF THE SHEET SAYS NO ---------- */
function wordsSend_(set, reset) {
  const was = Object.assign({}, wordsNow_()), next = Object.assign({}, was);
  Object.keys(set).forEach(k => { next[k] = set[k]; });
  reset.forEach(k => { delete next[k]; });
  const put = v => { try { DATA.words = v; } catch (e) {} wordsEditSet_(WORDS_EDIT); };
  put(next);
  return send({ action: 'wordsSave', personId: (USER && USER.personId) || '', set: set, reset: reset })
    .then(d => { if (d && d.words && typeof d.words === 'object') { try { DATA.words = d.words; } catch (e) {} } toast('Saved for everyone'); return true; })
    .catch(err => { put(was); toast(String((err && err.message) || 'The words did not save')); return false; });
}
on('words-save', el => {
  if (!layoutIsAdmin_()) return;
  const root = el.closest('.wk-editing');
  if (!root) return;
  const W = wordsNow_(), set = {}, reset = [];
  root.querySelectorAll('[data-wk]').forEach(p => {
    const k = p.getAttribute('data-wk'), or = wordsText_(p.getAttribute('data-wko'));
    if (!WORDS_KEY_RE.test(k || '')) return;
    /* `textContent`, never `innerHTML`: whatever was typed or pasted is kept as text. */
    const t = wordsText_(p.textContent), had = Object.prototype.hasOwnProperty.call(W, k);
    if (!t || t === or) { if (had && reset.indexOf(k) === -1) reset.push(k); return; }
    if (t !== (had ? W[k] : or)) set[k] = t;
  });
  if (!Object.keys(set).length && !reset.length) { toast('Nothing changed'); return; }
  wordsSend_(set, reset);
});
on('words-reset', el => {
  if (!layoutIsAdmin_()) return;
  const k = el.getAttribute('data-wk');
  if (WORDS_KEY_RE.test(k || '')) wordsSend_({}, [k]);
});
/* ONE LINE A PIECE: Enter does not start a second; a paste arrives as plain text wherever `plaintext-only` is not known. */
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.closest && e.target.closest('.wk-editing [data-wk]')) e.preventDefault(); }, true);
document.addEventListener('paste', e => {
  const p = e.target && e.target.closest && e.target.closest('.wk-editing [data-wk]');
  if (!p || p.contentEditable === 'plaintext-only') return;
  e.preventDefault();
  const t = ((e.clipboardData && e.clipboardData.getData('text/plain')) || '').replace(/\s+/g, ' ');
  try { document.execCommand('insertText', false, t); } catch (x) {}
}, true);

/* ---------- WHO SEES THIS (497): `seen: {id: level}` on the layout; it narrows only, the code's own gate always wins ---------- */
const SEEN_SAY = { out: 'Signed out only', in: 'Signed in', student: 'Students', client: 'Parents (Client)', staff: 'Tutors (Staff)', admin: 'Admin only' };
function seenOf_(id) { const s = (((layoutNow_() || {}).seen) || {})[id]; return SEEN_ORDER.indexOf(s) !== -1 ? s : ''; }
/* AN ADMIN STILL SEES EVERYTHING, or a thing narrowed away from them could never be widened again. */
function seenOk_(id) {
  const s = seenOf_(id);
  if (!s || layoutIsAdmin_()) return true;
  const signed = typeof USER !== 'undefined' && !!USER;
  if (s === 'out') return !signed;
  if (s === 'in') return signed;
  return typeof rankAtLeast_ === 'function' && rankAtLeast_(s);
}
/* THE CODE'S OWN GATE, where it is known: a widget's flags, a card on an admin column; '' when it is for everyone or decided inside its builder. */
function seenGate_(id) {
  const w = typeof layoutWidgetOf_ === 'function' ? layoutWidgetOf_(id) : null;
  if (w) return w.admin ? 'admin' : w.tutor ? 'staff' : w.signedIn ? 'in' : '';
  try { if (adminCol_(cardHome0_(id))) return 'admin'; } catch (e) {}
  return '';
}
/* A LEVEL BELOW THE CODE'S GATE WOULD WIDEN IT, so it is not offered (and would not work: both are asked). */
const seenWider_ = (lvl, gate) => !!gate && lvl !== '' && (lvl === 'out' || SEEN_ORDER.indexOf(lvl) < SEEN_ORDER.indexOf(gate));
function seenBox_(id) {
  const now = seenOf_(id), gate = seenGate_(id);
  const opt = (v, say) => `<option value="${v}"${v === now ? ' selected' : ''}${seenWider_(v, gate) && v !== now ? ' disabled' : ''}>${esc(say)}</option>`;
  return `<div class="seen-box" data-seen-for="${esc(id)}">
    <label class="seen-row"><span class="seen-l">Who sees this</span><select data-do="seen-set" data-lc="${esc(id)}" aria-label="Who sees this">${
      opt('', 'Everyone')}${SEEN_ORDER.map(v => opt(v, SEEN_SAY[v])).join('')}</select></label>
    <p class="faint seen-say">${gate ? 'The code already shows this to ' + esc(SEEN_SAY[gate]) + ' and above; that gate always wins, so it can only be narrowed.'
      : 'This can only narrow who sees it: the code\'s own gates (sign-in, roles, admin) always win.'} You still see it, as admin.</p>
    <div class="tile-row">${tile_({ icon: 'close', label: 'Close', act: 'seen-close', tone: 'admin' })}</div>
  </div>`;
}
on('seen-open', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc'), row = el.closest('.tile-row');
  if (!row || !LAYOUT_ID.test(id || '')) return;
  const open = row.parentElement && [...row.parentElement.querySelectorAll(':scope > .seen-box')].find(b => b.getAttribute('data-seen-for') === id);
  if (open) { open.remove(); return; }
  row.insertAdjacentHTML('afterend', seenBox_(id));
});
on('seen-close', el => { el.closest('.seen-box')?.remove(); });
on('seen-set', el => {
  if (!layoutIsAdmin_()) return;
  const id = el.getAttribute('data-lc'), v = String(el.value || '');
  if (!LAYOUT_ID.test(id || '') || (v && SEEN_ORDER.indexOf(v) === -1) || (seenWider_(v, seenGate_(id)) && v !== '')) return;
  const D = layoutDraftOf_(layoutNow_());
  D.seen = Object.assign({}, D.seen || {});
  if (v) D.seen[id] = v; else delete D.seen[id];
  if (!Object.keys(D.seen).length) delete D.seen;
  layoutSave_(D);
});
