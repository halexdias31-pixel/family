/* ================= ORTHODOX TEXTS AND CHURCH HISTORY (516): ONE CARD A CANON, SECTION OR CHAPTER ================= */
/* The owner: "to learn all about church history, how we got from 0 to 2026". data/orthodox/, written by tools/orthodox-texts.py;
   the works.js pattern with its own folder, on the Writings shelf under Religious Studies. */

const ORTHO = { index: null, asking: null, failed: false, texts: {}, loading: {}, missed: {}, items: null, from: null };
const orthoGet_ = file => {
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  return Promise.resolve()
    .then(() => fetch('data/orthodox/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
};

function orthoIndex_() {
  if (ORTHO.index) return ORTHO.index;
  if (ORTHO.asking || ORTHO.failed || typeof fetch !== 'function' || !writingFor_(WRITING_WORKS.orthodox)) return null;
  ORTHO.asking = orthoGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.works) && d.works.every(w => w && /^OR-\d{4}$/.test(w.id) && /^OR-\d{4}\.json$/.test(w.file)
      && Array.isArray(w.chapters) && w.chapters.length > 0 && Array.isArray(w.languages) && w.languages.length > 0);
    ORTHO.asking = null;
    if (!ok) { ORTHO.failed = true; return null; }
    ORTHO.index = d;
    writingCame_('orthodox');
    return d;
  });
  return null;
}

/* A WORK'S TAGS ARE ITS INDEX ROW'S, split as lists ("Orthodox | Catholic"), so the owner browses by tradition, era and kind. */
const orthoList_ = s => String(s || '').split('|').map(v => v.trim()).filter(Boolean);

function orthoItems_() {
  const ix = ORTHO.index;
  if (!ix) return [];
  if (ORTHO.items && ORTHO.from === ix) return ORTHO.items;
  const list = [], reg = writingWork_('orthodox');
  ix.works.forEach(w => {
    w.languages.forEach(lang => w.chapters.forEach((say, i) => {
      list.push(writingUnit_('orthodox', reg, {
        kind: 'orthotext', key: 'or:' + w.id + ':' + lang + ':' + i, name: w.title + ', ' + say, sub: w.about || lang,
        text: [w.title, say, lang, w.author, w.collection, w.genre, w.era].join(' '),
        w: { work: w.title, chapter: say, text: writingText_(writingTextOf_(lang)), tradition: orthoList_(w.tradition),
             collection: orthoList_(w.collection), author: w.author || '', form: w.genre || '' },
        ot: { id: w.id, file: w.file, i: i, lang: lang },
      }));
    }));
  });
  ORTHO.items = list; ORTHO.from = ix;
  return list;
}

/* THE BIBLE'S OWN VERSES, TAGGED (516): the Anagignoskomena, and the Psalter's twenty kathismata (Septuagint numbering) on the
   Septuagint and Brenton cards. No second copy of a verse. */
const ORTHO_ANAG = ['Tobit', 'Judith', 'Wisdom of Solomon', 'Sirach', 'Baruch', 'Letter of Jeremiah', 'Susanna', 'Bel and the Dragon',
  '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees', '1 Esdras', 'Prayer of Manasseh'];
const ORTHO_KATHISMA = [8, 16, 23, 31, 36, 45, 54, 63, 69, 76, 84, 90, 100, 104, 108, 117, 118, 133, 142, 150];
function orthoBibleTags_(x) {
  const bb = x && x.kind === 'bible' ? x.bb : null;
  if (!bb) return [];
  const greek = bb.dir === 'lxx' || bb.dir === 'brenton';
  if (ORTHO_ANAG.indexOf(bb.book) >= 0) return [WRITING_DEUTERO];
  if (!greek) return [];
  const c = Number(x.ch);
  if (bb.book === 'Psalms') {
    if (c === 151) return [WRITING_DEUTERO];
    const k = ORTHO_KATHISMA.findIndex(last => c <= last);
    return k >= 0 ? ['Psalter', 'Kathisma ' + (k + 1)] : [];
  }
  if (bb.book === 'Esther' || (bb.book === 'Daniel' && c === 3)) return ['Septuagint additions'];
  return [];
}

function orthoLoad_(id, file) {
  if (ORTHO.texts[id]) return Promise.resolve(ORTHO.texts[id]);
  if (!ORTHO.loading[id]) {
    ORTHO.loading[id] = orthoGet_(file).then(d => {
      ORTHO.loading[id] = null;
      const ok = !!d && d.id === id && Array.isArray(d.chapters);
      ORTHO.missed[id] = !ok;
      if (ok) ORTHO.texts[id] = d;
      return ok ? d : null;
    });
  }
  return ORTHO.loading[id];
}

/* THE PAGE ITSELF: its paragraphs, and whose words they are. */
function orthoBody_(x) {
  const d = ORTHO.texts[x.ot.id], L = (typeof WORK_LANG !== 'undefined' && WORK_LANG[x.ot.lang]) || { k: 'en', lang: 'en' };
  if (d) {
    const c = d.chapters[x.ot.i] || {};
    const src = (d.sources || []).find(s => s.language === x.ot.lang) || {};
    return String(c[L.k] || '').split('\n').map(p => `<p class="wt-text" lang="${L.lang}">${esc(p)}</p>`).join('')
      + `<p class="wt-credit">${esc(src.text || '')} · ${esc(src.licence || '')}</p>`;
  }
  if (ORTHO.missed[x.ot.id] && !ORTHO.loading[x.ot.id]) return '<p class="fc-note">This text did not arrive.</p>';
  if (!ORTHO.loading[x.ot.id]) orthoLoad_(x.ot.id, x.ot.file).then(() => orthoRedraw_(x.ot.id));
  return loading_();
}
function orthoCard_(x) {
  return `<div class="card fc wt" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="wt-body" data-ot="${esc(x.ot ? x.ot.id : '')}" data-k="${esc(x.key)}">${x.ot ? orthoBody_(x) : ''}</div>
  </div>`;
}
function orthoRedraw_(id) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.wt-body[data-ot="' + id + '"]').forEach(el => {
    const x = (ORTHO.items || []).find(i => i.key === el.getAttribute('data-k'));
    if (!x) return;
    el.innerHTML = orthoBody_(x);
    const pane = el.closest('.pane');
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}
