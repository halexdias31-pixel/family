/* ================= MORE WRITINGS (513): THE APOCRYPHA, ENOCH, JUBILEES, JOSEPHUS, THE MISHNAH, THE FATHERS, GILGAMESH ================= */
/* A card a verse, section or mishnah where the text is cited so, else a chapter; one text a card (504).
   The index when a finder paints, a work's words when one of its cards is drawn. Sources: data/texts/LICENSE. */

const TEXTS = { index: null, asking: null, failed: false, words: {}, loading: {}, missed: {}, items: null, from: null, adult: null };
const textsGet_ = file => {
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  return Promise.resolve()
    .then(() => fetch('data/texts/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
};
/* A PART IS [chapter tag, cite, n]: n verses numbered 1..n, a list of their numbers, or 0 when the chapter is the card. */
const textsUnits_ = p => p[2] === 0 ? [''] : Array.isArray(p[2]) ? p[2].map(String) : Array.from({ length: Number(p[2]) || 0 }, (_, i) => String(i + 1));

function textsIndex_() {
  if (TEXTS.index) return TEXTS.index;
  if (TEXTS.asking || TEXTS.failed || typeof fetch !== 'function') return null;
  TEXTS.asking = textsGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.texts) && d.texts.every(t => t && t.id && t.writing && t.text && Array.isArray(t.works)
      && t.works.every(w => w && /^[a-z0-9-]+\/[a-z0-9-]+\.json$/.test(w.file) && Array.isArray(w.parts)));
    TEXTS.asking = null;
    if (!ok) { TEXTS.failed = true; return null; }
    TEXTS.index = d;
    writingCame_('texts');
    return d;
  });
  return null;
}

/* ---------- ONE ITEM A UNIT A TEXT (520): a `writingUnit_` like every writing; the KJV Apocrypha are books of the Bible in its
   Deuterocanon collection, the Mishnah's tractates the Talmud's Books. */
function textsItems_() {
  const ix = TEXTS.index;
  if (!ix) return [];
  if (TEXTS.items && TEXTS.from === ix) return TEXTS.items;
  const list = [];
  ix.texts.forEach(t => {
    const reg = writingWork_('texts', t.id), bible = reg.work === 'Bible';
    const text = writingText_(writingTextOf_(t.text, t.lang));
    t.works.forEach((w, wi) => w.parts.forEach((p, pi) => textsUnits_(p).forEach((u, ui) => {
      const cite = p[1] ? p[1] + (u ? (/\./.test(p[1]) ? '.' : ':') + u : '') : u;
      const title = w.title || w.name, many = title !== t.writing;
      list.push(writingUnit_('texts', reg, {
        kind: 'writ', key: 'tx:' + t.id + ':' + w.file + ':' + pi + ':' + ui, name: (title + ' ' + cite).trim(), sub: text,
        text: [t.writing, title, p[0], t.text].join(' '),
        w: { work: bible ? 'Bible' : t.writing, book: bible || many ? title : '', chapter: p[0] || '', unit: u,
             text: text, collection: bible ? WRITING_DEUTERO : '' },
        tx: { t: t.id, file: w.file, p: pi, u: ui, lang: t.lang },
      }));
    })));
  });
  TEXTS.items = list; TEXTS.from = ix;
  return list;
}

function textsLoad_(file) {
  if (TEXTS.words[file]) return Promise.resolve(TEXTS.words[file]);
  if (!TEXTS.loading[file]) {
    TEXTS.loading[file] = textsGet_(file).then(d => {
      TEXTS.loading[file] = null;
      const ok = !!d && Array.isArray(d.chapters);
      TEXTS.missed[file] = !ok;
      if (ok) TEXTS.words[file] = d;
      return ok ? d : null;
    });
  }
  return TEXTS.loading[file];
}

/* THE WORDS THEMSELVES, in their own script and direction, and whose they are. */
function textsBody_(x) {
  const d = TEXTS.words[x.tx.file];
  if (d) {
    const t = (TEXTS.index && TEXTS.index.texts.find(v => v.id === x.tx.t)) || {};
    const words = ((d.chapters[x.tx.p] || [])[x.tx.u]) || '';
    const dir = x.tx.lang === 'he' ? ' dir="rtl"' : '';
    return `<p class="wt-text" lang="${esc(x.tx.lang || 'en')}"${dir}>${esc(words)}</p>
      <p class="wt-credit">${esc(t.source || '')} · ${esc(t.licence || '')}</p>`;
  }
  if (TEXTS.missed[x.tx.file] && !TEXTS.loading[x.tx.file]) return '<p class="fc-note">This text did not arrive.</p>';
  if (!TEXTS.loading[x.tx.file]) textsLoad_(x.tx.file).then(() => textsRedraw_(x.tx.file));
  return loading_();
}
function textsCard_(x) {
  return `<div class="card fc wt" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="wt-body tx-body" data-tx="${esc(x.tx ? x.tx.file : '')}" data-k="${esc(x.key)}">${x.tx ? textsBody_(x) : ''}</div>
  </div>`;
}
/* ITS WORDS CAME: every card of that file on screen is filled where it stands. */
function textsRedraw_(file) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.tx-body[data-tx="' + file + '"]').forEach(el => {
    const x = (TEXTS.items || []).find(i => i.key === el.getAttribute('data-k'));
    if (!x) return;
    el.innerHTML = textsBody_(x);
    const pane = el.closest('.pane');
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}
