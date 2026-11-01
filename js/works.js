/* ================= A WRITING'S OWN WORDS (499): ONE CARD A CHAPTER, IN EACH LANGUAGE ================= */
/* The owner: "this should be the work itself, in my database, each page can be a widget, treat it how you treat the Talmud".
   data/works/: the index when a finder paints, the words when a card is drawn. */

const WORKS = { index: null, asking: null, failed: false, texts: {}, loading: {}, missed: {}, items: null, from: null };
/* A RELIGIOUS WORK IS FOR A VIEWER OF AGE (490), as scripture is; a work's own `min_age` in the index says so. */
const worksGet_ = file => {
  const stamp = deployStamp_();
  return Promise.resolve()
    .then(() => fetch('data/works/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
};

function worksIndex_() {
  if (WORKS.index) return WORKS.index;
  if (WORKS.asking || WORKS.failed || typeof fetch !== 'function' || !writingFor_(writingWork_('works'))) return null;
  WORKS.asking = worksGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.works) && d.works.every(w => w && /^WR-\d{4}$/.test(w.id) && /^WR-\d{4}\.json$/.test(w.file)
      && Array.isArray(w.chapters) && w.chapters.length > 0 && Array.isArray(w.languages) && w.languages.length > 0);
    WORKS.asking = null;
    if (!ok) { WORKS.failed = true; return null; }
    WORKS.index = d;
    writingCame_('works');
    return d;
  });
  return null;
}

/* ---------- ONE ITEM A CHAPTER (or numbered section) A LANGUAGE (520): a `writingUnit_`; the history database's row of the same
   work links here (`worksFirstKey_`), so the work is held once. */
function worksItems_() {
  const ix = WORKS.index;
  if (!ix) return [];
  if (WORKS.items && WORKS.from === ix) return WORKS.items;
  const list = [];
  ix.works.forEach(w => {
    const reg = writingWork_('works', w.id);
    w.languages.forEach(lang => w.chapters.forEach((say, i) => {
      const text = writingText_(writingTextOf_((w.says && w.says[lang]) || lang));
      list.push(writingUnit_('works', reg, {
        kind: 'worktext', key: 'wt:' + w.id + ':' + lang + ':' + i, name: w.title + ' ' + say, sub: text,
        text: [w.title, say, lang, w.id].join(' '),
        /* THE WORK'S FACTS ON EVERY PAGE (520): no profile card; its author, kind and date are each unit's tags. */
        w: { work: w.title, chapter: w.unit === 'section' ? '' : say, unit: w.unit === 'section' ? say : '', text: text,
             author: w.author || '', form: w.genre || '' },
        wDate: [w.date_from, w.date_to],
        wt: { id: w.id, file: w.file, i: i, lang: lang },
      }));
    }));
  });
  WORKS.items = list; WORKS.from = ix;
  return list;
}

function worksLoad_(id, file) {
  if (WORKS.texts[id]) return Promise.resolve(WORKS.texts[id]);
  if (!WORKS.loading[id]) {
    WORKS.loading[id] = worksGet_(file).then(d => {
      WORKS.loading[id] = null;
      const ok = !!d && d.id === id && Array.isArray(d.chapters);
      WORKS.missed[id] = !ok;
      if (ok) WORKS.texts[id] = d;
      return ok ? d : null;
    });
  }
  return WORKS.loading[id];
}

const WORK_LANG = { Greek: { k: 'grc', lang: 'grc' }, English: { k: 'en', lang: 'en' }, Latin: { k: 'la', lang: 'la' } };
/* THE PAGE ITSELF: the chapter in its language, and whose words they are. */
function worksBody_(x) {
  const d = WORKS.texts[x.wt.id], L = WORK_LANG[x.wt.lang] || { k: 'en', lang: 'en' };
  if (d) {
    const c = d.chapters[x.wt.i] || {};
    const src = (d.sources || []).find(s => s.language === x.wt.lang) || {};
    return `<p class="wt-text" lang="${L.lang}">${esc(c[L.k] || '')}</p>
      <p class="wt-credit">${esc(src.text || '')}${src.via ? ', via ' + esc(src.via) : ''} · ${esc(src.licence || '')}</p>${writingRefs_(x.wt.id)}`;
  }
  if (WORKS.missed[x.wt.id] && !WORKS.loading[x.wt.id]) return '<p class="fc-note">This text did not arrive.</p>';
  if (!WORKS.loading[x.wt.id]) worksLoad_(x.wt.id, x.wt.file).then(() => worksRedraw_(x.wt.id));
  return loading_();
}
function worksCard_(x) {
  return `<div class="card fc wt" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="wt-body" data-wt="${esc(x.wt ? x.wt.id : '')}" data-k="${esc(x.key)}">${x.wt ? worksBody_(x) : ''}</div>
  </div>`;
}
/* ITS TEXT CAME: every card of that work on screen is filled where it stands. */
function worksRedraw_(id) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.wt-body[data-wt="' + id + '"]').forEach(el => {
    const x = (WORKS.items || []).find(i => i.key === el.getAttribute('data-k'));
    if (!x) return;
    el.innerHTML = worksBody_(x);
    const pane = el.closest('.pane');
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}
/* A HISTORY ROW'S LINK TO A WORK (520): the work as a row-like name and the key of its first page, for `histLinks_`. */
function worksRowOf_(id) {
  const w = WORKS.index && WORKS.index.works.find(v => v.id === id);
  return w ? { id: w.id, title_english: w.title, key: worksFirstKey_(id) } : null;
}
/* THE FIRST PAGE OF A WORK: a link to it from a history row lands here (histCard_). */
function worksFirstKey_(id) {
  const w = WORKS.index && WORKS.index.works.find(v => v.id === id);
  return w ? 'wt:' + w.id + ':' + (w.languages.indexOf('English') >= 0 ? 'English' : w.languages[0]) + ':0' : '';
}
