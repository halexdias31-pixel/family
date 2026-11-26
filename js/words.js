/* @family. — words.js THE ADMIN CHANGES THE SITE WITHOUT ASKING (497): the words on every widget and card edited in place. */
/* Words: config's one `words` row, `{key: text}`, sent as `words`; a key is `<card or w:widget>|<slot>`. */
/* A CARD'S OR WIDGET'S WORDS SCOPE: `w:<widget>`, a card's id (`set:account:contact`), an item's (`item:<kind>:<id>`). */
const WORDS_SCOPE = /^[A-Za-z0-9_:.#-]{1,64}$/;

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
    try { const s = JSON.stringify(w); if (s !== WORDS_KEPT) { WORDS_KEPT = s; keep_.put(WORDS_STORE, s); } } catch (e) {}
    return w;
  }
  try { const k = JSON.parse(keep_.get(WORDS_STORE) || '{}'); return k && typeof k === 'object' && !Array.isArray(k) ? k : {}; } catch (e) { return {}; }
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
  if (!h || !WORDS_SCOPE.test(String(scope || ''))) return h;
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
    .replace(/(<span class="note card-say">)([^<]{1,400})(<\/span>)/g, (m, o, t, c) => piece('s', t, o, c) || m)
    .replace(/(<(?:input|textarea)\b[^>]*?)\splaceholder="([^"]{1,200})"/g, (m, o, t) => {
      if (/\sdata-wkp=/.test(o)) return m;
      const k = scope + '|' + wordsSlot_('ph', t), v = words_(k, ''), set = !!v;
      return `${o} data-wkp="${k}" data-wko="${wordsAttr_(t)}" placeholder="${set ? esc(v) : t}"`;
    });
}

/* ---------- THE ADMIN'S TILE on every widget, card and item: Edit words ---------- */
function wordsOpts_(scope) {
  if (!may_('admin')) return null;
  return [{ icon: 'edit', label: 'Edit words', note: 'type over this card\'s words, for everyone', act: 'words-edit', tone: 'admin', data: { ws: scope } }];
}
const wordsRoot_ = el => el.closest('.wk-editing') || el.closest('.card, .own-set');
const wordsText_ = s => String(s || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, WORDS_PIECE_MAX);

/* ---------- EDITING IN PLACE: each marked piece editable where it stands, Reset beside any the admin has changed, Save and Done under ---------- */
function wordsEditOn_(root) {
  root.classList.add('wk-editing');
  root.querySelectorAll('[data-wkp]').forEach(inp => {
    if (inp.nextElementSibling && inp.nextElementSibling.classList.contains('wk-ph-row')) return;
    const k = inp.getAttribute('data-wkp'), set = Object.prototype.hasOwnProperty.call(wordsNow_(), k);
    const ph = cardBlock_({ type: 'group', tag: 'span', look: 'wk-ph', text: inp.getAttribute('placeholder') || '',
      attrs: { contenteditable: 'plaintext-only', 'data-wk': k, 'data-wko': inp.getAttribute('data-wko') || '', 'data-wk-set': set ? '' : null } });
    inp.insertAdjacentHTML('afterend', cardBlock_({ type: 'group', tag: 'span', look: 'wk-ph-row', inner: qtag_('Placeholder') + ' ' + ph }));
  });
  const all = [...root.querySelectorAll('[data-wk]')];
  all.forEach(p => {
    if (p.hasAttribute('data-wk-set')) p.insertAdjacentHTML('afterend', cardBlock_({ type: 'group', tag: 'span', look: 'tile-row wk-reset',
      tiles: [{ icon: 'undo', label: 'Reset this text', note: 'back to the code\'s wording', act: 'words-reset', tone: 'admin', data: { wk: p.getAttribute('data-wk') } }] }));
  });
  root.insertAdjacentHTML('beforeend', cardBlock_({ type: 'group', look: 'wk-bar', blocks: [{ type: 'tiles', tiles: [
    all.length ? { icon: 'save', label: 'Save words', act: 'words-save', tone: 'admin' } : null,
    { icon: 'close', label: 'Done', note: 'stop editing words', act: 'words-done', tone: 'admin' }].filter(Boolean) }] }));
  if (all[0]) try { all[0].focus(); } catch (e) {}
}
/* REDRAWN EDITABLE (or not), then the bar put on the card found again by its tile. */
function wordsEditSet_(scope) {
  WORDS_EDIT = scope;
  /* FIND'S LIST HOLDS THE WIDGET CARDS (790): forgotten, so the card is drawn again editable (`repaint` leaves the one in front). */
  try { if (typeof stuffForget_ === 'function') stuffForget_(); } catch (e) { /* find.js not in yet: nothing is memoised */ }
  try { repaint(true); } catch (e) {}
  try { if (typeof finderOf_ === 'function' && finderOf_(AT)) paint(AT, true); } catch (e) { /* paint reports its own draw errors */ }
  if (!scope) return;
  wordsBarOn_(scope, 10);
}
/* A FIND CARD (790) IS FILLED A MOMENT AFTER ITS PAINT, so the card is looked for again a few times before giving up. */
function wordsBarOn_(scope, tries) {
  if (WORDS_EDIT !== scope) return;
  const t = [...document.querySelectorAll('[data-do="words-edit"]')].find(x => x.getAttribute('data-ws') === scope);
  const root = t && wordsRoot_(t);
  if (root && !root.classList.contains('wk-editing')) wordsEditOn_(root);
  else if (!root && tries > 0) setTimeout(() => wordsBarOn_(scope, tries - 1), 30);
}
on('words-edit', el => {
  if (!may_('admin')) return;
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
  return send({ action: 'item', door: 'save', item: 'words', personId: (USER && USER.personId) || '', set: set, reset: reset })
    .then(d => { if (d && d.words && typeof d.words === 'object') { try { DATA.words = d.words; } catch (e) {} } toast(text_('saved-for-everyone')); return true; })
    .catch(err => { put(was); toast(why_(err)); return false; });
}
on('words-save', el => {
  if (!may_('admin')) return;
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
  if (!Object.keys(set).length && !reset.length) { toast(text_('nothing-changed')); return; }
  wordsSend_(set, reset);
});
on('words-reset', el => {
  if (!may_('admin') || !sure_(el, 'Reset?')) return;
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

/* ---------- A CARD'S TILE ROW PUT INSIDE IT: only when the last `</div>` closes the card; else after it ---------- */
function cardRowIn_(h, row) {
  const t = h.replace(/\s+$/, '');
  if (/^\s*<div\b[^>]*\sclass="(card|own-set)/.test(t) && /<\/div>$/.test(t)) {
    let depth = 0, end = -1;
    const re = /<(\/?)div\b[^>]*>/g;
    for (let m; (m = re.exec(t));) { depth += m[1] ? -1 : 1; if (!depth) { end = re.lastIndex; break; } }
    if (end === t.length) return t.slice(0, -6) + row + t.slice(-6);
  }
  return h + row;
}
/* AN ITEM FIND'S OWN CODE PLACES (487), `item:<where>:<name>`: its words the admin's, and Edit words on it for an admin. */
function itemMark_(id, html) {
  if (!html) return '';
  const h = wordsIn_(id, String(html)).replace(/^(\s*<div)\b/, `$1 data-item="${esc(id)}"`);
  if (!may_('admin')) return h;
  return cardRowIn_(h, cardBlock_({ type: 'group', look: 'tile-row wgt-admin card-admin item-admin no-move', attrs: { 'data-lay-for': id }, inner: tile_(wordsOpts_(id)) }));
}
