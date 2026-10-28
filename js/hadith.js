/* ================= THE HADITH (504): THE SIX BOOKS IN ARABIC, ONE CARD A HADITH ================= */
/* The owner: "add open source original hadith to the collection of writings". data/hadith/: the index when a finder paints,
   a book's words when one of its cards is drawn. */

const HADITH = { index: null, asking: null, failed: false, books: {}, loading: {}, missed: {}, items: null, from: null };
/* THE COLLECTIONS AND THEIR BOOKS IN THEIR OWN ORDER, not the alphabet's — `answerCmp_` reads `ANSWER_ORDERS`. */
const HADITH_ORDER = [];
ANSWER_ORDERS.push(HADITH_ORDER);
const HADITH_WORDS = 'Hadith hadeeth sunnah Kutub al-Sittah six books Arabic';
/* FOR A VIEWER OF AGE (490), like all scripture. */
const hadithFor_ = () => writingFor_(writingWork_('hadith'));

function hadithGet_(file) {
  return scriptureFetch_(o => fetch('data/hadith/' + file + scriptureStamp_(), o));
}

function hadithIndex_() {
  if (HADITH.index) return HADITH.index;
  if (!hadithFor_() || HADITH.asking || HADITH.failed || typeof fetch !== 'function') return null;
  HADITH.asking = hadithGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.collections) && d.collections.length > 0
      && d.collections.every(c => c && /^[a-z]+$/.test(c.id) && c.name && Array.isArray(c.books)
        && c.books.every(b => b && Number.isInteger(b.n) && b.name && /^[a-z]+\/\d{3}\.json$/.test(b.file) && Array.isArray(b.nums)));
    HADITH.asking = null;
    if (!ok) HADITH.failed = true;
    else {
      HADITH.index = d;
      d.collections.forEach(c => { HADITH_ORDER.push(c.name); c.books.forEach(b => HADITH_ORDER.push(hadithBookSay_(b))); });
      writingCame_('hadith');
    }
    if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
    return ok ? d : null;
  });
  return null;
}
const hadithBookSay_ = b => b.n + ' · ' + b.name;
/* A BOOK'S HADITH NUMBERS from the index's runs: [first, last] or a lone "3.1". */
const hadithNums_ = b => [].concat(...b.nums.map(r => {
  if (!Array.isArray(r)) return [String(r)];
  const out = [];
  for (let i = r[0]; i <= r[1]; i++) out.push(String(i));
  return out;
}));

/* ---------- ONE ITEM A HADITH, built once the index has come. */
function hadithItems_() {
  const ix = HADITH.index;
  if (!ix || !hadithFor_()) return [];
  if (HADITH.items && HADITH.from === ix) return HADITH.items;
  const list = [], reg = writingWork_('hadith'), text = writingText_(writingTextOf_('Arabic'));
  ix.collections.forEach(c => c.books.forEach(b => {
    const say = hadithBookSay_(b), words = [HADITH_WORDS, c.name, c.ar, b.name].join(' ');
    hadithNums_(b).forEach((n, i) => {
      /* ONE SHAPE (520): which of the six is the Collection, its book the Book, the number the Unit. */
      list.push(writingUnit_('hadith', reg, {
        kind: 'hadith', key: 'hd:' + c.id + ':' + n, name: c.name + ' ' + n, sub: b.name, text: words,
        w: { collection: c.name, book: say, unit: n, text: text },
        hd: { c: c.id, b: b.n, file: b.file, i: i },
      }));
    });
  }));
  HADITH.items = list; HADITH.from = ix;
  return list;
}

/* ONE BOOK'S WORDS, held to the index's count. */
function hadithLoad_(file, count) {
  if (HADITH.books[file]) return Promise.resolve(HADITH.books[file]);
  if (HADITH.loading[file]) return HADITH.loading[file];
  if (!hadithFor_()) return Promise.resolve(null);
  HADITH.loading[file] = hadithGet_(file).then(d => {
    HADITH.loading[file] = null;
    const ok = !!d && Array.isArray(d.h) && (!count || d.h.length === count);
    HADITH.missed[file] = !ok;
    if (ok) HADITH.books[file] = d;
    return ok ? d : null;
  });
  return HADITH.loading[file];
}
function hadithCountOf_(file) {
  let n = 0;
  (HADITH.index ? HADITH.index.collections : []).forEach(c => c.books.forEach(b => { if (b.file === file) n = b.count; }));
  return n;
}

/* THE HADITH ITSELF, in Arabic, and whose edition it is. */
function hadithBody_(hd) {
  const d = HADITH.books[hd.file], f = hd.file;
  if (d) {
    const h = d.h[hd.i];
    return h ? `<p class="qr-ar hd-ar" dir="rtl" lang="ar">${esc(h[1])}</p>
      <p class="qr-credit">Arabic text, public domain · digital edition: fawazahmed0/hadith-api, The Unlicense</p>` : '';
  }
  if (HADITH.missed[f] && !HADITH.loading[f]) {
    return `<p class="fc-note">This book did not arrive. <button class="btn" data-do="hd-retry" data-f="${esc(f)}">Try again</button></p>`;
  }
  if (!HADITH.loading[f]) hadithLoad_(f, hadithCountOf_(f)).then(() => hadithRedraw_(f));
  return loading_();
}
function hadithCard_(x) {
  return `<div class="card fc qr hd" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="hd-body" data-hf="${x.hd ? esc(x.hd.file) : ''}" data-hi="${x.hd ? x.hd.i : 0}">${x.hd ? hadithBody_(x.hd) : ''}</div>
  </div>`;
}
/* ITS WORDS CAME: every card of that book on screen is filled where it stands. */
function hadithRedraw_(f) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.hd-body').forEach(el => {
    if (el.getAttribute('data-hf') !== f) return;
    el.innerHTML = hadithBody_({ file: f, i: Number(el.getAttribute('data-hi')) });
    const pane = el.closest('.pane');
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}
on('hd-retry', el => {
  const f = String((el && el.getAttribute('data-f')) || '');
  if (!/^[a-z]+\/\d{3}\.json$/.test(f)) return;
  HADITH.missed[f] = false;
  hadithRedraw_(f);
});
