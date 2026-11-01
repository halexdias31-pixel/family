/* ================= PUBLIC-DOMAIN PDTEXTS (514): HISTORY'S DOCUMENTS AND ENGLISH LITERATURE, A CARD A PLACE ================= */
/* data/pdtexts/: the index when a finder paints, a text's words only when one of its cards is drawn (as js/works.js does). */

const PDTEXTS = { index: null, asking: null, failed: false, files: {}, loading: {}, missed: {}, items: null, from: null };
const pdtextsGet_ = file => {
  const stamp = deployStamp_();
  return Promise.resolve()
    .then(() => fetch('data/pdtexts/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
};

function pdtextsIndex_() {
  if (PDTEXTS.index) return PDTEXTS.index;
  if (PDTEXTS.asking || PDTEXTS.failed || typeof fetch !== 'function') return null;
  PDTEXTS.asking = pdtextsGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.texts) && d.texts.every(w => w && /^TX-\d{4}$/.test(w.id) && w.file === w.id + '.json'
      && Array.isArray(w.cards) && w.cards.length > 0 && Array.isArray(w.texts) && w.texts.length > 0);
    PDTEXTS.asking = null;
    if (!ok) { PDTEXTS.failed = true; return null; }
    PDTEXTS.index = d;
    writingCame_('pdtexts');
    return d;
  });
  return null;
}

/* ONE ITEM A CARD A TEXT (520): a `writingUnit_` on the Writings shelf of its own subject (English Literature, History); an
   anthology is its Collection. */
function pdtextsItems_() {
  const ix = PDTEXTS.index;
  if (!ix) return [];
  if (PDTEXTS.items && PDTEXTS.from === ix) return PDTEXTS.items;
  const list = [];
  ix.texts.forEach(w => {
    /* ITS OWN REGISTRY ENTRY (520): a religious text (Ancient Egypt's, 546) is that religion's, in Religious Studies. */
    const reg = writingWork_('pdtexts', w.id);
    w.texts.forEach((label, t) => {
      const text = writingText_(writingTextOf_(label, '', w.year));
      w.cards.forEach((at, i) => {
        const place = (at || []).filter(Boolean);
        list.push(writingUnit_('pdtexts', reg, {
          kind: 'pdtext', key: 'tx:' + w.id + ':' + t + ':' + i, name: [w.title].concat(place).join(' '), sub: text,
          subject: w.subject, text: [w.title, w.author].concat(place, [label, w.id]).join(' '),
          w: { work: w.title, book: at[0] || '', chapter: at[1] || '', unit: at[2] || '', text: text,
               collection: w.anthology || '', author: w.author || '', form: w.form || '' },
          tx: { id: w.id, file: w.file, i: i, t: t },
        }));
      });
    });
  });
  PDTEXTS.items = list; PDTEXTS.from = ix;
  return list;
}

function pdtextsLoad_(id, file) {
  if (PDTEXTS.files[id]) return Promise.resolve(PDTEXTS.files[id]);
  if (!PDTEXTS.loading[id]) {
    PDTEXTS.loading[id] = pdtextsGet_(file).then(d => {
      PDTEXTS.loading[id] = null;
      const ok = !!d && d.id === id && Array.isArray(d.cards);
      PDTEXTS.missed[id] = !ok;
      if (ok) PDTEXTS.files[id] = d;
      return ok ? d : null;
    });
  }
  return PDTEXTS.loading[id];
}

/* THE PAGE ITSELF: the words, a paragraph or a stanza a block, and whose words they are. */
function pdtextsBody_(x) {
  const d = PDTEXTS.files[x.tx.id];
  if (d) {
    const words = String(((d.cards[x.tx.i] || [])[x.tx.t]) || '');
    const src = (d.sources || []).map(s => esc(s.text || '') + ' · ' + esc(s.licence || '')).join('<br>');
    const lang = /^Latin$/.test((d.texts || [])[x.tx.t] || '') ? 'la' : 'en';
    return `<div class="tx-text" lang="${lang}">${words.split(/\n\s*\n/).map(p => '<p>' + esc(p) + '</p>').join('')}</div>
      <p class="wt-credit">${src}</p>`;
  }
  if (PDTEXTS.missed[x.tx.id] && !PDTEXTS.loading[x.tx.id]) return '<p class="fc-note">This text did not arrive.</p>';
  if (!PDTEXTS.loading[x.tx.id]) pdtextsLoad_(x.tx.id, x.tx.file).then(() => pdtextsRedraw_(x.tx.id));
  return loading_();
}
function pdtextsCard_(x) {
  return `<div class="card fc tx" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="tx-body" data-tx="${esc(x.tx ? x.tx.id : '')}" data-k="${esc(x.key)}">${x.tx ? pdtextsBody_(x) : ''}</div>
  </div>`;
}
/* ITS WORDS CAME: every card of that text on screen is filled where it stands. */
function pdtextsRedraw_(id) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.tx-body[data-tx="' + id + '"]').forEach(el => {
    const x = (PDTEXTS.items || []).find(i => i.key === el.getAttribute('data-k'));
    if (!x) return;
    el.innerHTML = pdtextsBody_(x);
    const pane = el.closest('.pane');
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}
