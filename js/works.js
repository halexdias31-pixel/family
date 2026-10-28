/* ================= A WRITING'S OWN WORDS (499): ONE CARD A CHAPTER, IN EACH LANGUAGE ================= */
/* The owner: "this should be the work itself, in my database, each page can be a widget, treat it how you treat the Talmud".
   data/works/: the index when a finder paints, the words when a card is drawn. */

const WORKS = { index: null, asking: null, failed: false, texts: {}, loading: {}, missed: {}, items: null, from: null };
/* A RELIGIOUS WORK IS FOR A VIEWER OF AGE (490), as scripture is; a work's own `min_age` in the index says so. */
const worksGet_ = file => {
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  return Promise.resolve()
    .then(() => fetch('data/works/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
};

function worksIndex_() {
  if (WORKS.index) return WORKS.index;
  if (WORKS.asking || WORKS.failed || typeof fetch !== 'function' || !viewerOfAge_(scriptureMinAge_())) return null;
  WORKS.asking = worksGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.works) && d.works.every(w => w && /^WR-\d{4}$/.test(w.id) && /^WR-\d{4}\.json$/.test(w.file)
      && Array.isArray(w.chapters) && w.chapters.length > 0 && Array.isArray(w.languages) && w.languages.length > 0);
    WORKS.asking = null;
    if (!ok) { WORKS.failed = true; return null; }
    WORKS.index = d;
    if (typeof stuffForget_ === 'function') stuffForget_();
    if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
    return d;
  });
  return null;
}

/* ---------- ONE ITEM A CHAPTER A LANGUAGE, on the History shelf beside the writing's own row. */
function worksItems_() {
  const ix = WORKS.index;
  if (!ix) return [];
  if (WORKS.items && WORKS.from === ix) return WORKS.items;
  const list = [];
  ix.works.forEach(w => {
    const age = Number(w.min_age) || SCRIPTURE_MIN_AGE;
    w.languages.forEach(lang => w.chapters.forEach((say, i) => {
      list.push({
        kind: 'worktext', key: 'wt:' + w.id + ':' + lang + ':' + i, name: w.title + ' ' + say, image: '', row: null,
        /* ON THE ONE WRITINGS SHELF (504) beside the Bible, the Quran, the Talmud and the Hadith, still a Text of the history database. */
        shelf: BIBLE_SHELF, subject: SCRIPTURE_SUBJECT(), libBook: w.title, histKind: 'Texts', unit: WRITING_UNIT.worktext, min_age: age, sub: lang,
        text: [w.title, say, lang, w.id].join(' '),
        wtWork: w.title, wtChapter: say, wtLanguage: lang, wt: { id: w.id, file: w.file, i: i, lang: lang },
      });
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
      <p class="wt-credit">${esc(src.text || '')}${src.via ? ', via ' + esc(src.via) : ''} · ${esc(src.licence || '')}</p>`;
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
/* THE WRITING'S OWN CARD SAYS ITS WORDS ARE HERE: a tile to the first page, in Find (histCard_). */
function worksFirstKey_(id) {
  const w = WORKS.index && WORKS.index.works.find(v => v.id === id);
  return w ? 'wt:' + w.id + ':' + (w.languages.indexOf('English') >= 0 ? 'English' : w.languages[0]) + ':0' : '';
}
