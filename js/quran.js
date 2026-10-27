/* ================= THE QURAN (490): ONE CARD A VERSE, FOUND IN FIND ================= */
/* The owner: "each verse can be a widget ... all tags like everything else". Ordinary facets; the index when a finder paints, a surah's text
   only when one of its cards is drawn. */

const QURAN_SHELF = () => brand('quran_shelf', 'Quran');
const QURAN_NAME = () => brand('quran_name', 'The Quran');
/* WHAT A SEARCH FINDS IT BY that a verse's own name does not say. */
const QURAN_WORDS = 'Quran Koran Qur\'an surah sura ayah aya verse Pickthall Tanzil';
const QURAN = { index: null, asking: null, failed: false, surahs: {}, loading: {}, missed: {}, items: null, from: null };
/* THE SURAHS IN THE MUSHAF'S ORDER, not the alphabet's — `answerCmp_` reads `ANSWER_ORDERS`. */
const QURAN_ORDER = [];
ANSWER_ORDERS.push(QURAN_ORDER);
/* ONLY FOR A VIEWER OF AGE (490), like the Bible and the Talmud: under it, or signed out, nothing is fetched. */
const quranFor_ = () => viewerOfAge_(SCRIPTURE_MIN_AGE);

function quranGet_(file) {
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  return Promise.resolve()
    .then(() => fetch('data/quran/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
}

function quranIndex_() {
  if (QURAN.index) return QURAN.index;
  if (!quranFor_() || QURAN.asking || QURAN.failed || typeof fetch !== 'function') return null;
  QURAN.asking = quranGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.surahs) && d.surahs.length === 114
      && d.surahs.every((s, i) => s && s.n === i + 1 && s.name && s.ayahs > 0 && Array.isArray(s.juz) && s.juz.length > 0);
    QURAN.asking = null;
    if (!ok) { QURAN.failed = true; return null; }
    QURAN.index = d;
    QURAN_ORDER.push(...d.surahs.map(quranSurahSay_));
    if (typeof stuffForget_ === 'function') stuffForget_();
    if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
    return d;
  });
  return null;
}
const quranSurahSay_ = s => s.n + ' · ' + s.name;
function quranJuzOf_(s, a) {
  let j = s.juz[0][0];
  s.juz.forEach(r => { if (r[1] <= a) j = r[0]; });
  return j;
}

/* ---------- ONE ITEM A VERSE, built once the index has come. */
function quranItems_() {
  const ix = QURAN.index;
  if (!ix || !quranFor_()) return [];
  if (QURAN.items && QURAN.from === ix) return QURAN.items;
  const list = [], shelf = QURAN_SHELF(), sajda = {};
  (ix.sajda || []).forEach(p => { sajda[p[0] + ':' + p[1]] = 1; });
  ix.surahs.forEach(s => {
    const say = quranSurahSay_(s), words = [QURAN_NAME(), QURAN_WORDS, s.name, s.meaning, s.ar, s.place].join(' ');
    for (let a = 1; a <= s.ayahs; a++) {
      list.push({
        kind: 'quran', key: 'qr:' + s.n + ':' + a, name: s.name + ' ' + s.n + ':' + a, image: '', row: null, shelf: shelf,
        sub: s.meaning, min_age: SCRIPTURE_MIN_AGE, text: words,
        quranSurah: say, quranAyah: String(a), quranJuz: 'Juz ' + quranJuzOf_(s, a), quranPlace: s.place,
        quranSajda: sajda[s.n + ':' + a] ? 'Prostration' : '',
        qr: { s: s.n, a: a },
      });
    }
  });
  QURAN.items = list; QURAN.from = ix;
  return list;
}

/* ONE SURAH'S TEXT, held to the index's count of its verses. */
function quranLoad_(n) {
  if (QURAN.surahs[n]) return Promise.resolve(QURAN.surahs[n]);
  if (QURAN.loading[n]) return QURAN.loading[n];
  const s = QURAN.index && QURAN.index.surahs[n - 1];
  if (!s || !quranFor_()) return Promise.resolve(null);
  QURAN.loading[n] = quranGet_(String(n).padStart(3, '0') + '.json').then(d => {
    QURAN.loading[n] = null;
    const ok = !!d && Array.isArray(d.ar) && Array.isArray(d.en) && d.ar.length === s.ayahs && d.en.length === s.ayahs;
    QURAN.missed[n] = !ok;
    if (ok) QURAN.surahs[n] = d;
    return ok ? d : null;
  });
  return QURAN.loading[n];
}

/* THE VERSE ITSELF: the Arabic as Tanzil gives it, Pickthall's English under it, and whose words they are. */
function quranBody_(x) {
  const n = x.qr.s, d = QURAN.surahs[n];
  if (d) {
    return `<p class="qr-ar" dir="rtl" lang="ar">${esc(d.ar[x.qr.a - 1])} <span class="qr-no">﴿${x.qr.a}﴾</span></p>
      <p class="qr-en">${esc(d.en[x.qr.a - 1])}</p>
      <p class="qr-credit">Arabic: Tanzil Quran Text (Simple 1.1), CC BY 3.0, tanzil.net · English: Pickthall (1930), public domain</p>`;
  }
  if (QURAN.missed[n] && !QURAN.loading[n]) {
    return `<p class="fc-note">This surah did not arrive. <button class="btn" data-do="qr-retry" data-s="${n}">Try again</button></p>`;
  }
  if (!QURAN.loading[n]) quranLoad_(n).then(() => quranRedraw_(n));
  return loading_();
}
function quranCard_(x) {
  return `<div class="card fc qr" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="qr-body" data-qs="${x.qr ? x.qr.s : 0}" data-qa="${x.qr ? x.qr.a : 0}">${x.qr ? quranBody_(x) : ''}</div>
  </div>`;
}
/* ITS TEXT CAME: every card of that surah on screen is filled where it stands. */
function quranRedraw_(n) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.qr-body[data-qs="' + Number(n) + '"]').forEach(el => {
    el.innerHTML = quranBody_({ qr: { s: Number(n), a: Number(el.getAttribute('data-qa')) } });
    const pane = el.closest('.pane');
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}
on('qr-retry', el => {
  const n = Number(el && el.getAttribute('data-s')) || 0;
  if (!n) return;
  QURAN.missed[n] = false;
  quranRedraw_(n);
});
