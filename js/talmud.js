/* ================= THE TALMUD (473): THE VILNA PAGE, FOUND IN FIND ================= */
/* Content on a shelf of its own: one item a daf, asked by four ordinary facets (Order, Tractate, Chapter, Daf), and a
   page drawn as the Romm printers set it — Gemara in the middle, Rashi on the inner side, Tosafot on the outer. */

const TALMUD_SHELF = () => brand('talmud_shelf', 'Talmud');
const TALMUD_NAME = () => brand('talmud_name', 'Babylonian Talmud');
/* WHAT A SEARCH FINDS IT BY that a daf's own name does not say. */
const TALMUD_WORDS = 'Talmud Bavli Babylonian Gemara Mishnah Rashi Tosafot Vilna Romm Shas daf';
const TALMUD = { index: null, asking: null, failed: false, chunks: {}, loading: {}, missed: {}, items: null, from: null, at: null };

/* THE ORDERS AND TRACTATES IN THE PRINTED ORDER, not the alphabet's — `answerCmp_` reads `ANSWER_ORDERS`. */
const TALMUD_ORDER_SEDARIM = [], TALMUD_ORDER_TRACTATES = [];
ANSWER_ORDERS.push(TALMUD_ORDER_SEDARIM, TALMUD_ORDER_TRACTATES);

function talmudGet_(file) {
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  return Promise.resolve()
    .then(() => fetch('data/talmud/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
}

/* THE LIST OF TRACTATES, asked for the first time a finder is painted (`paintStuff`); ~34 KB, never part of the boot payload. */
function talmudIndex_() {
  if (TALMUD.index) return TALMUD.index;
  if (TALMUD.asking || TALMUD.failed || typeof fetch !== 'function') return null;
  TALMUD.asking = talmudGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.tractates) && d.tractates.length > 0 && Array.isArray(d.sedarim)
      && d.tractates.every(t => t && /^[a-z-]+$/.test(t.slug) && t.en && t.he && Number.isInteger(t.first)
        && t.last >= t.first && Array.isArray(t.chapters) && t.chapters.length > 0);
    TALMUD.asking = null;
    if (!ok) { TALMUD.failed = true; return null; }
    TALMUD.index = d;
    TALMUD_ORDER_SEDARIM.push(...d.sedarim);
    TALMUD_ORDER_TRACTATES.push(...d.tractates.map(t => t.en));
    if (typeof stuffForget_ === 'function') stuffForget_();
    if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
    return d;
  });
  return null;
}

/* ---------- HEBREW NUMERALS: 15 and 16 are ט״ו and ט״ז, never the Name. */
function talHeb_(n) {
  n = Number(n) || 0;
  const H = [[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'],
    [30, 'ל'], [20, 'כ'], [10, 'י'], [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']];
  let s = '';
  while (n > 0) {
    if (n % 100 === 15 || n % 100 === 16) { s += n % 100 === 15 ? 'טו' : 'טז'; n -= n % 100; continue; }
    const p = H.find(h => h[0] <= n);
    s += p[1]; n -= p[0];
  }
  return s.length > 1 ? s.slice(0, -1) + '״' + s.slice(-1) : s + '׳';
}
const talDafOf_ = i => Math.floor(i / 2) + 1;
const talSide_ = i => (i % 2 ? 'b' : 'a');
const talTractate_ = slug => (TALMUD.index ? TALMUD.index.tractates.find(t => t.slug === slug) : null) || null;
function talChapterAt_(t, i) {
  let at = 0;
  t.chapters.forEach((c, n) => { if (c.from <= i) at = n; });
  return at;
}

/* ---------- ONE ITEM A DAF, built once an index has come. */
function talmudItems_() {
  const ix = TALMUD.index;
  if (!ix) return [];
  if (TALMUD.items && TALMUD.from === ix) return TALMUD.items;
  const list = [], shelf = TALMUD_SHELF();
  ix.tractates.forEach(t => {
    for (let d = talDafOf_(t.first); d <= talDafOf_(t.last); d++) {
      const i = Math.max(t.first, 2 * d - 2), c = talChapterAt_(t, i), ch = t.chapters[c];
      list.push({
        kind: 'talmud', key: 'tal:' + t.slug + ':' + d, name: t.en + ' ' + d, image: '', row: null, shelf: shelf,
        sub: t.he + ' ' + talHeb_(d) + ' · ' + 'פרק ' + ch.he,
        talSeder: t.seder, talTractate: t.en, talChapter: 'Chapter ' + (c + 1) + ' · ' + ch.he, talDaf: String(d),
        text: [TALMUD_NAME(), TALMUD_WORDS, 'Seder ' + t.seder, t.en, t.he, ch.he].join(' '),
        tal: { slug: t.slug, d: d, first: i },
      });
    }
  });
  TALMUD.items = list; TALMUD.from = ix;
  return list;
}

function talmudCard_(x) {
  const t = x && x.tal ? talTractate_(x.tal.slug) : null;
  return `<div class="card fc tal" data-key="${esc(x.key)}">
    <div class="fc-head"><h3>${esc(x.name)}</h3></div>
    ${tagRow_(x)}
    <p class="sub tal-he" lang="he" dir="rtl">${esc(x.sub)}</p>
    <p class="fc-lede">${esc(TALMUD_NAME())}, ${t ? 'Seder ' + esc(t.seder) + ', ' : ''}the page as the Vilna edition
      printed it: the Gemara in the middle, Rashi on the inner side and Tosafot on the outer.</p>
  </div>`;
}

/* BOTH SIDES OF THE LEAF, a tile each; a side the tractate does not have (Tamid opens on 25b) is left out. */
function talmudTiles_(x) {
  if (!x || !x.tal) return '';
  const t = talTractate_(x.tal.slug);
  if (!t) return '';
  return [2 * x.tal.d - 2, 2 * x.tal.d - 1].filter(i => i >= t.first && i <= t.last).map(i =>
    tile_({ icon: 'open', label: 'Page ' + x.tal.d + talSide_(i), note: talHeb_(x.tal.d) + (i % 2 ? ' :' : ' .'),
      act: 'tal-open', data: { t: t.slug, i: i } })).join('');
}

/* ---------- THE TEXT OF ONE SIDE, from its file of ten dafim. */
const talChunkOf_ = i => Math.floor(talDafOf_(i) / ((TALMUD.index && TALMUD.index.chunk) || 10));
function talLoad_(slug, i) {
  const k = slug + '/' + talChunkOf_(i);
  if (TALMUD.chunks[k]) return Promise.resolve(TALMUD.chunks[k]);
  if (!TALMUD.loading[k]) {
    TALMUD.loading[k] = talmudGet_(k + '.json').then(d => {
      TALMUD.loading[k] = null;
      const ok = !!d && d.amudim && typeof d.amudim === 'object';
      TALMUD.missed[k] = !ok;
      if (ok) TALMUD.chunks[k] = d;
      return ok ? d : null;
    });
  }
  return TALMUD.loading[k];
}

/* ONLY THE PRINTER'S THREE MARKS SURVIVE: everything is escaped, then <big>, <strong> and <br> are let back. */
const talText_ = s => esc(String(s == null ? '' : s)).replace(/&lt;(\/?)(big|strong|br)&gt;/g, '<$1$2>');
/* A COMMENT'S OPENING WORDS (the dibbur ha-matchil) bold, as printed: up to the dash. */
function talComment_(s) {
  const m = /^(.{1,90}?)\s+[–-]\s+([\s\S]*)$/.exec(String(s || ''));
  return m ? `<b>${talText_(m[1])}</b> ${talText_(m[2])} ` : talText_(s) + ' ';
}
function talGemara_(segs) {
  return (segs || []).map(s => /הדרן עלך/.test(s)
    ? `<span class="tal-hadran">${talText_(s.replace(/<br>/g, ''))}</span>` : talText_(s) + ' ').join('');
}

/* ---------- THE PAGE ---------- */
function talCredit_(t) {
  const L = (t && t.licences) || {};
  const pd = k => !L[k] || L[k].license === 'Public Domain';
  return 'Gemara: Hebrew Wikisource via Sefaria, CC BY-SA 3.0 · Rashi and Tosafot: Vilna edition, '
    + (pd('r') && pd('t') ? 'public domain' : 'via Sefaria (CC BY-SA 3.0 here)');
}
function talPage_(t, i, d) {
  const a = d && d.amudim[String(i)];
  const c = t.chapters[talChapterAt_(t, i)], n = talDafOf_(i);
  const head = `<header class="tal-head">
      <span class="tal-hd-ch">${esc(c.he)}</span>
      <span class="tal-hd-pr">פרק ${talHeb_(talChapterAt_(t, i) + 1).replace(/[׳״]/g, '')}</span>
      <span class="tal-hd-tr">${esc(t.he)}</span>
      <span class="tal-hd-daf">${talHeb_(n).replace(/[׳״]/g, '')}${i % 2 ? ':' : '.'}</span>
    </header>
    <p class="tal-credit" dir="ltr" lang="en">${esc(talCredit_(t))}</p>`;
  if (!d) {
    const k = t.slug + '/' + talChunkOf_(i);
    return head + (TALMUD.missed[k] && !TALMUD.loading[k]
      ? `<p class="tal-miss" dir="ltr" lang="en">This page did not arrive. <button class="btn" data-do="tal-retry">Try again</button></p>`
      : loading_());
  }
  const g = a && a.g && a.g.length ? talGemara_(a.g)
    : '<span class="tal-blank" dir="ltr" lang="en">This side has no Gemara in the source text.</span>';
  const side = (cls, list) => `<div class="tal-layer ${cls}"><div class="tal-spacer"></div><div class="tal-spacer tal-spacer2"></div>
      <div class="tal-txt">${(list || []).map(talComment_).join('')}</div></div>`;
  return head + `<div class="tal-body tal-${talSide_(i)}">
      ${side('tal-rashi', a && a.r)}${side('tal-tos', a && a.t)}
      <div class="tal-layer tal-gem"><div class="tal-spacer tal-sp-r"></div><div class="tal-spacer tal-sp-l"></div>
        <div class="tal-txt">${g}</div></div>
    </div>`;
}

/* ---------- TZURAT HA-DAF: measured, then commentaries longer than the Gemara run under it at half the page, or a
   longer Gemara widens under them. Rashi is inner: right on an a side. */
function talLayout_(body) {
  if (!body || !body.isConnected) return;
  const W = body.clientWidth;
  if (!W) return;
  const page = body.closest('.tal-page');
  const fs = Math.max(11, Math.min(19, W / 40));
  if (page) page.style.setProperty('--tal-fs', fs.toFixed(2) + 'px');
  const gap = Math.round(fs * 0.9), gW = Math.round(W * 0.46), s = Math.floor((W - gW) / 2 - gap);
  const aSide = body.classList.contains('tal-a');
  const L = { r: body.querySelector('.tal-rashi'), t: body.querySelector('.tal-tos'), g: body.querySelector('.tal-gem') };
  const sp = el => el.querySelectorAll('.tal-spacer');
  const reset = el => { el.style.cssText = ''; sp(el).forEach(x => { x.style.cssText = 'display:none'; }); };
  [L.r, L.t, L.g].forEach(reset);
  const outer = (el, right) => Object.assign(el.style, { position: 'absolute', top: '0', width: s + 'px', [right ? 'right' : 'left']: '0' });
  const rRight = aSide, tRight = !aSide;
  outer(L.r, rRight); outer(L.t, tRight);
  Object.assign(L.g.style, { position: 'absolute', top: '0', width: gW + 'px', left: Math.round((W - gW) / 2) + 'px' });
  const Hr = L.r.offsetHeight, Ht = L.t.offsetHeight, Hg = L.g.offsetHeight;
  let H;
  if (Hr >= Hg && Ht >= Hg && Hg > 0) {
    /* EACH COMMENTARY TAKES HALF THE PAGE, with a hole the Gemara's height on the side towards it. */
    [[L.r, rRight], [L.t, tRight]].forEach(([el, right]) => {
      Object.assign(el.style, { width: Math.floor(W / 2 - gap / 2) + 'px' });
      const x = sp(el)[0];
      x.style.cssText = `display:block;float:${right ? 'left' : 'right'};width:${Math.ceil(gW / 2 + gap / 2)}px;height:${Hg + gap / 2}px`;
    });
    H = Math.max(L.r.offsetHeight, L.t.offsetHeight, Hg);
  } else {
    /* THE GEMARA TAKES THE WHOLE WIDTH, with a hole each commentary's height on its side. */
    Object.assign(L.g.style, { width: W + 'px', left: '0' });
    const hole = (x, right, h) => { x.style.cssText = `display:${h ? 'block' : 'none'};float:${right ? 'right' : 'left'};width:${s + gap}px;height:${h + gap / 2}px;clear:none`; };
    hole(L.g.querySelector('.tal-sp-r'), true, rRight ? Hr : Ht);
    hole(L.g.querySelector('.tal-sp-l'), false, rRight ? Ht : Hr);
    H = Math.max(L.g.offsetHeight, Hr, Ht);
  }
  body.style.height = Math.ceil(H) + 'px';
}

/* ---------- THE VIEW: one side at a time, in the sheet under the tile pressed (nothing opens over the app, 420). */
const talBodyEl_ = () => document.querySelector('#sheet-body .tal-sheet');
function talHtml_(t, i, d) {
  const opts = [];
  for (let n = talDafOf_(t.first); n <= talDafOf_(t.last); n++) opts.push(`<option value="${n}"${n === talDafOf_(i) ? ' selected' : ''}>${n} · ${talHeb_(n)}</option>`);
  const p = Math.max(t.first, i - 1), q = Math.min(t.last, i + 1);
  return `<div class="tal-sheet" aria-label="${esc(t.en + ' ' + talDafOf_(i) + talSide_(i))}"><div class="tal-bar">
      <span class="tal-where">${esc(t.en)} ${talDafOf_(i)}${talSide_(i)}</span>
      <button class="btn" data-do="tal-step" data-by="-1"${i <= t.first ? ' disabled' : ''} aria-label="Previous side">‹ ${talDafOf_(p)}${talSide_(p)}</button>
      <label class="tal-jump"><select data-tal-jump aria-label="Daf">${opts.join('')}</select></label>
      <button class="btn" data-do="tal-side" aria-label="Other side">Side ${i % 2 ? 'a' : 'b'}</button>
      <button class="btn" data-do="tal-step" data-by="1"${i >= t.last ? ' disabled' : ''} aria-label="Next side">${talDafOf_(q)}${talSide_(q)} ›</button>
    </div>
    <article class="tal-page" dir="rtl" lang="he">${talPage_(t, i, d)}</article></div>`;
}
function talDraw_(el) {
  const at = TALMUD.at;
  if (!at) return;
  const t = talTractate_(at.slug);
  if (!t) return;
  const i = at.i, k = t.slug + '/' + talChunkOf_(i), d = TALMUD.chunks[k] || null;
  const html = talHtml_(t, i, d), here = talBodyEl_();
  if (here && !el) {
    here.outerHTML = html;
    const ti = document.getElementById('sheet-title');
    if (ti) ti.textContent = TALMUD_NAME();
  } else {
    if (el) sheetHere_(el);
    openSheet(TALMUD_NAME(), html, () => { TALMUD.at = null; });
  }
  if (d) {
    const body = document.querySelector('#sheet-body .tal-body');
    talLayout_(body);
    try { document.fonts && document.fonts.ready.then(() => talLayout_(body)); } catch (e) {}
  } else if (!TALMUD.missed[k] || TALMUD.loading[k]) {
    talLoad_(t.slug, i).then(() => { if (TALMUD.at && TALMUD.at.slug === at.slug && TALMUD.at.i === i && talBodyEl_()) talDraw_(); });
  }
}
function talmudOpen_(slug, i, el) {
  const t = talTractate_(slug);
  if (!t) return;
  TALMUD.at = { slug: slug, i: Math.max(t.first, Math.min(t.last, Number(i) || t.first)) };
  talDraw_(el || null);
}
function talClose_() {
  if (TALMUD.at && talBodyEl_()) closeSheet();
  TALMUD.at = null;
}
function talGo_(i) {
  if (!TALMUD.at) return;
  const t = talTractate_(TALMUD.at.slug);
  if (!t) return;
  TALMUD.at.i = Math.max(t.first, Math.min(t.last, i));
  talDraw_();
}

on('tal-open', el => talmudOpen_(el.getAttribute('data-t'), Number(el.getAttribute('data-i')), el));
on('tal-step', el => { if (TALMUD.at) talGo_(TALMUD.at.i + Number(el.getAttribute('data-by') || 0)); });
on('tal-side', () => { if (TALMUD.at) talGo_(TALMUD.at.i % 2 ? TALMUD.at.i - 1 : TALMUD.at.i + 1); });
on('tal-retry', () => {
  if (!TALMUD.at) return;
  const k = TALMUD.at.slug + '/' + talChunkOf_(TALMUD.at.i);
  TALMUD.missed[k] = false;
  talDraw_();
});
if (typeof document !== 'undefined') {
  document.addEventListener('change', e => {
    const s = e.target && e.target.closest ? e.target.closest('#sheet-body select[data-tal-jump]') : null;
    if (s && TALMUD.at) { const t = talTractate_(TALMUD.at.slug); talGo_(Math.max(t.first, 2 * Number(s.value) - 2)); }
  });
  document.addEventListener('keydown', e => {
    if (!TALMUD.at || !talBodyEl_()) return;
    if (e.key === 'Escape') talClose_();
    /* A HEBREW BOOK TURNS LEFTWARDS: the left arrow is the next side. */
    else if (e.key === 'ArrowLeft') talGo_(TALMUD.at.i + 1);
    else if (e.key === 'ArrowRight') talGo_(TALMUD.at.i - 1);
  });
  window.addEventListener('resize', () => { const b = document.querySelector('#sheet-body .tal-body'); if (b) talLayout_(b); });
}
