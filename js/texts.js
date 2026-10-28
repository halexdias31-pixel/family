/* ================= PUBLIC-DOMAIN TEXTS (514): HISTORY'S DOCUMENTS AND ENGLISH LITERATURE, A CARD A PLACE ================= */
/* data/texts/: the index when a finder paints, a text's words only when one of its cards is drawn (as js/works.js does). */

const TEXTS = { index: null, asking: null, failed: false, files: {}, loading: {}, missed: {}, items: null, from: null };
const textsGet_ = file => {
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  return Promise.resolve()
    .then(() => fetch('data/texts/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
};

function textsIndex_() {
  if (TEXTS.index) return TEXTS.index;
  if (TEXTS.asking || TEXTS.failed || typeof fetch !== 'function') return null;
  TEXTS.asking = textsGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.texts) && d.texts.every(w => w && /^TX-\d{4}$/.test(w.id) && w.file === w.id + '.json'
      && Array.isArray(w.cards) && w.cards.length > 0 && Array.isArray(w.texts) && w.texts.length > 0);
    TEXTS.asking = null;
    if (!ok) { TEXTS.failed = true; return null; }
    TEXTS.index = d;
    if (typeof stuffForget_ === 'function') stuffForget_();
    if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
    return d;
  });
  return null;
}

/* ONE ITEM A CARD A TEXT: History's on the History shelf under Texts, literature on its own subject's shelf. */
function textsItems_() {
  const ix = TEXTS.index;
  if (!ix) return [];
  if (TEXTS.items && TEXTS.from === ix) return TEXTS.items;
  const list = [];
  ix.texts.forEach(w => {
    const hist = w.subject === 'History';
    w.texts.forEach((label, t) => w.cards.forEach((at, i) => {
      const place = (at || []).filter(Boolean);
      list.push({
        kind: 'pdtext', key: 'tx:' + w.id + ':' + t + ':' + i, name: [w.title].concat(place).join(' '), image: '', row: null,
        shelf: w.subject, subject: w.subject, histKind: hist ? 'Texts' : '', sub: label,
        text: [w.title, w.author].concat(place, [label, w.id]).join(' '),
        txWriting: w.title, txBook: at[0] || '', txChapter: at[1] || '', txSection: at[2] || '', txText: label, txAnthology: w.anthology || '',
        tx: { id: w.id, file: w.file, i: i, t: t },
      });
    }));
  });
  TEXTS.items = list; TEXTS.from = ix;
  return list;
}

function textsLoad_(id, file) {
  if (TEXTS.files[id]) return Promise.resolve(TEXTS.files[id]);
  if (!TEXTS.loading[id]) {
    TEXTS.loading[id] = textsGet_(file).then(d => {
      TEXTS.loading[id] = null;
      const ok = !!d && d.id === id && Array.isArray(d.cards);
      TEXTS.missed[id] = !ok;
      if (ok) TEXTS.files[id] = d;
      return ok ? d : null;
    });
  }
  return TEXTS.loading[id];
}

/* THE PAGE ITSELF: the words, a paragraph or a stanza a block, and whose words they are. */
function textsBody_(x) {
  const d = TEXTS.files[x.tx.id];
  if (d) {
    const words = String(((d.cards[x.tx.i] || [])[x.tx.t]) || '');
    const src = (d.sources || []).map(s => esc(s.text || '') + ' · ' + esc(s.licence || '')).join('<br>');
    const lang = /^Latin$/.test((d.texts || [])[x.tx.t] || '') ? 'la' : 'en';
    return `<div class="tx-text" lang="${lang}">${words.split(/\n\s*\n/).map(p => '<p>' + esc(p) + '</p>').join('')}</div>
      <p class="wt-credit">${src}</p>`;
  }
  if (TEXTS.missed[x.tx.id] && !TEXTS.loading[x.tx.id]) return '<p class="fc-note">This text did not arrive.</p>';
  if (!TEXTS.loading[x.tx.id]) textsLoad_(x.tx.id, x.tx.file).then(() => textsRedraw_(x.tx.id));
  return loading_();
}
function textsCard_(x) {
  return `<div class="card fc tx" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="tx-body" data-tx="${esc(x.tx ? x.tx.id : '')}" data-k="${esc(x.key)}">${x.tx ? textsBody_(x) : ''}</div>
  </div>`;
}
/* ITS WORDS CAME: every card of that text on screen is filled where it stands. */
function textsRedraw_(id) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.tx-body[data-tx="' + id + '"]').forEach(el => {
    const x = (TEXTS.items || []).find(i => i.key === el.getAttribute('data-k'));
    if (!x) return;
    el.innerHTML = textsBody_(x);
    const pane = el.closest('.pane');
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}
