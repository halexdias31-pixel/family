/* ================= THE TALMUD (473): THE VILNA PAGE, FOUND IN FIND ================= */
/* One card a side of a daf (490), asked by ordinary facets; the card IS the page as the Romm printers set it — Gemara in the middle, Rashi
   inner, Tosafot outer — scaled to the card. */

const TALMUD_SHELF = () => brand('talmud_shelf', BIBLE_SHELF);
const TALMUD_NAME = () => brand('talmud_name', 'Babylonian Talmud');
/* WHAT A SEARCH FINDS IT BY that a daf's own name does not say. */
const TALMUD_WORDS = 'Talmud Bavli Babylonian Gemara Mishnah Rashi Tosafot Vilna Romm Shas daf';
const TALMUD = { index: null, asking: null, failed: false, chunks: {}, loading: {}, missed: {}, items: null, from: null, at: null };

/* THE ORDERS AND TRACTATES IN THE PRINTED ORDER, not the alphabet's — `answerCmp_` reads `ANSWER_ORDERS`. */
const TALMUD_ORDER_SEDARIM = [], TALMUD_ORDER_TRACTATES = [];
ANSWER_ORDERS.push(TALMUD_ORDER_SEDARIM, TALMUD_ORDER_TRACTATES);

function talmudGet_(file) {
  return scriptureFetch_(o => fetch('data/talmud/' + file + scriptureStamp_(), o));
}

/* THE LIST OF TRACTATES, asked for the first time a finder is painted (`paintStuff`); ~34 KB, never part of the boot payload. */
/* ONLY FOR A VIEWER OF AGE (490): under it, or signed out, the index is never even fetched. */
const talmudFor_ = () => viewerOfAge_(scriptureMinAge_());
function talmudIndex_() {
  if (TALMUD.index) return TALMUD.index;
  if (!talmudFor_()) return null;
  if (TALMUD.asking || TALMUD.failed || typeof fetch !== 'function') return null;
  TALMUD.asking = talmudGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.tractates) && d.tractates.length > 0 && Array.isArray(d.sedarim)
      && d.tractates.every(t => t && /^[a-z-]+$/.test(t.slug) && t.en && t.he && Number.isInteger(t.first)
        && t.last >= t.first && Array.isArray(t.chapters) && t.chapters.length > 0);
    TALMUD.asking = null;
    /* A MISS IS REDRAWN TOO (504), so the dots under its question end in words. */
    if (!ok) { TALMUD.failed = true; if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); }); return null; }
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

/* ---------- ONE ITEM A SIDE (490): the owner expected "one page of the Talmud" as the card, not a card that opens one. */
function talmudItems_() {
  const ix = TALMUD.index;
  if (!ix || !talmudFor_()) return [];
  if (TALMUD.items && TALMUD.from === ix) return TALMUD.items;
  const list = [], shelf = TALMUD_SHELF(), rs = SCRIPTURE_SUBJECT();
  ix.tractates.forEach(t => {
    for (let i = t.first; i <= t.last; i++) {
      const d = talDafOf_(i), c = talChapterAt_(t, i), ch = t.chapters[c], side = talSide_(i);
      list.push({
        kind: 'talmud', key: 'tal:' + t.slug + ':' + d + side, name: t.en + ' ' + d + side, image: '', row: null, shelf: shelf, libBook: 'Talmud', unit: WRITING_UNIT.talmud, subject: rs,
        sub: t.he + ' ' + talHeb_(d) + (i % 2 ? ' :' : ' .') + ' · ' + 'פרק ' + ch.he, min_age: scriptureMinAge_(),
        talSeder: t.seder, talTractate: t.en, talChapter: 'Chapter ' + (c + 1) + ' · ' + ch.he, talDaf: String(d), talSide: 'Side ' + side,
        text: [TALMUD_NAME(), TALMUD_WORDS, 'Seder ' + t.seder, t.en, t.he, ch.he].join(' '),
        tal: { slug: t.slug, d: d, i: i },
      });
    }
  });
  TALMUD.items = list; TALMUD.from = ix;
  return list;
}

/* THE TEXT SIZE, the viewer's own: a factor on the page's fitted size, kept on this device only. */
const TAL_SCALE_KEY = 'tal:scale', TAL_SCALES = [0.6, 0.75, 0.9, 1, 1.15, 1.35, 1.6, 2];
function talScale_() {
  let v = 1;
  try { v = Number(localStorage.getItem(TAL_SCALE_KEY)) || 1; } catch (e) {}
  return TAL_SCALES.indexOf(v) >= 0 ? v : 1;
}
function talScaleSet_(by) {
  const at = TAL_SCALES.indexOf(talScale_());
  const v = TAL_SCALES[Math.max(0, Math.min(TAL_SCALES.length - 1, at + by))];
  try { localStorage.setItem(TAL_SCALE_KEY, String(v)); } catch (e) {}
  return v;
}

/* THE CARD: the tags, then the side itself — drawn when its file of ten dafim is here, the one loader until then. */
function talmudCard_(x) {
  const t = x && x.tal ? talTractate_(x.tal.slug) : null;
  if (!t) return `<div class="card fc tal" data-key="${esc(x.key)}">${tagRow_(x)}</div>`;
  const i = x.tal.i, d = TALMUD.chunks[t.slug + '/' + talChunkOf_(i)] || null;
  return `<div class="card fc tal" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <article class="tal-page tal-card-page" dir="rtl" lang="he" data-t="${esc(t.slug)}" data-i="${i}" data-drawn="${d ? 1 : 0}"
      aria-label="${esc(x.name)}">${talPage_(t, i, d)}</article>
  </div>`;
}

/* THE TEXT-SIZE TILES, one each way; the page grows downward and the card with it. */
function talmudTiles_(x) {
  if (!x || !x.tal) return '';
  const v = talScale_();
  return tile_({ icon: 'down', label: 'Text −', note: 'smaller', act: 'tal-size', data: { by: -1 }, off: v <= TAL_SCALES[0] })
    + tile_({ icon: 'up', label: 'Text +', note: 'larger', act: 'tal-size', data: { by: 1 }, off: v >= TAL_SCALES[TAL_SCALES.length - 1] });
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

/* ---------- TZURAT HA-DAF (494): the Gemara centred, Rashi (inner) and Tosafot round it; whatever runs longer
   continues under the rest across the freed width — a balanced rectangle, never one long column. */
function talLayout_(body) {
  if (!body || !body.isConnected) return;
  const W = body.clientWidth;
  if (!W) return;
  const page = body.closest('.tal-page');
  const fs = Math.max(4, Math.min(48, W / 40 * talScale_()));
  if (page) page.style.setProperty('--tal-fs', fs.toFixed(2) + 'px');
  const gap = Math.round(fs * 0.9), gW = Math.round(W * 0.46), s = Math.floor((W - gW) / 2 - gap);
  const aSide = body.classList.contains('tal-a');
  const L = { r: body.querySelector('.tal-rashi'), t: body.querySelector('.tal-tos'), g: body.querySelector('.tal-gem') };
  const sp = el => el.querySelectorAll('.tal-spacer');
  const reset = el => { el.style.cssText = ''; sp(el).forEach(x => { x.style.cssText = 'display:none'; }); };
  [L.r, L.t, L.g].forEach(reset);
  const put = (el, right, w) => Object.assign(el.style, { position: 'absolute', top: '0', width: w + 'px', left: right ? (W - w) + 'px' : '0' });
  const hole = (x, right, w, h, clear) => { x.style.cssText = h > 0 ? `display:block;float:${right ? 'right' : 'left'};width:${Math.ceil(w)}px;height:${Math.ceil(h)}px;clear:${clear ? (right ? 'right' : 'left') : 'none'}` : 'display:none'; };
  const empty = el => !el.querySelector('.tal-txt').textContent.trim();
  const rRight = aSide;
  put(L.r, rRight, s); put(L.t, !rRight, s);
  Object.assign(L.g.style, { position: 'absolute', top: '0', width: gW + 'px', left: Math.round((W - gW) / 2) + 'px' });
  const Hr = empty(L.r) ? 0 : L.r.offsetHeight, Ht = empty(L.t) ? 0 : L.t.offsetHeight, Hg = L.g.offsetHeight;
  /* C is the shorter commentary, B the longer; cR/bR say which side each stands on. */
  const [C, Hc, cR, B, Hb, bR] = Hr <= Ht ? [L.r, Hr, rRight, L.t, Ht, !rRight] : [L.t, Ht, !rRight, L.r, Hr, rRight];
  let H;
  if (Hb <= Hg) {
    /* THE GEMARA IS LONGEST: it takes the whole width, with a hole each commentary's height on its side. */
    put(L.g, false, W);
    hole(L.g.querySelector('.tal-sp-r'), true, s + gap, rRight ? (Hr && Hr + gap / 2) : (Ht && Ht + gap / 2));
    hole(L.g.querySelector('.tal-sp-l'), false, s + gap, rRight ? (Ht && Ht + gap / 2) : (Hr && Hr + gap / 2));
    H = Math.max(L.g.offsetHeight, Hr, Ht);
  } else if (Hc <= Hg) {
    /* ONE COMMENTARY ENDS BESIDE THE GEMARA: the Gemara widens under it, and the longer one runs under both across the page. */
    const gw = W - s - gap;
    put(L.g, cR, gw);
    hole(L.g.querySelector(cR ? '.tal-sp-r' : '.tal-sp-l'), cR, s + gap, Hc && Hc + gap / 2);
    const Hg2 = L.g.offsetHeight;
    put(B, bR, W);
    hole(sp(B)[0], !bR, gw + gap, Hg2 + gap / 2);
    H = Math.max(B.offsetHeight, Hg2, Hc);
  } else {
    /* BOTH OUTRUN THE GEMARA: under it they share the page in two columns; the longer one, once the other ends, takes the full width. */
    const half = Math.floor(W / 2 - gap / 2), cut = Math.ceil(gW / 2 + gap / 2);
    [[C, cR], [B, bR]].forEach(([el, right]) => { put(el, right, half); hole(sp(el)[0], !right, cut, Hg + gap / 2); });
    const Hc2 = C.offsetHeight, Hb2 = B.offsetHeight;
    if (Hb2 - Hc2 > fs * 3) {
      put(B, bR, W);
      hole(sp(B)[0], !bR, W - half + cut, Hg + gap / 2);
      hole(sp(B)[1], !bR, W - half, Hc2 + gap / 2 - (Hg + gap / 2), true);
    }
    H = Math.max(C.offsetHeight, B.offsetHeight, Hg);
  }
  body.style.height = Math.ceil(H) + 'px';
}

/* ---------- THE PAGES IN A PANE, as the pane is reached (`paneReach_`): fetched then, laid out to the card's width. */
function talCardsFit_(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('.tal-card-page').forEach(el => {
    const t = talTractate_(el.getAttribute('data-t')), i = Number(el.getAttribute('data-i'));
    if (!t) return;
    const k = t.slug + '/' + talChunkOf_(i), d = TALMUD.chunks[k];
    if (d && el.getAttribute('data-drawn') !== '1') { el.innerHTML = talPage_(t, i, d); el.setAttribute('data-drawn', '1'); }
    if (d) {
      const body = el.querySelector('.tal-body');
      talLayout_(body);
      try { document.fonts && document.fonts.ready.then(() => talLayout_(body)); } catch (e) {}
      return;
    }
    if (TALMUD.missed[k] && !TALMUD.loading[k]) { el.innerHTML = talPage_(t, i, null); return; }
    talLoad_(t.slug, i).then(got => {
      if (!el.isConnected) return;
      el.setAttribute('data-drawn', '0');
      if (!got) { el.innerHTML = talPage_(t, i, null); return; }
      talCardsFit_(el.parentElement);
      const pane = el.closest('.pane');
      if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
    });
  });
}
const talAllFit_ = () => { if (typeof document !== 'undefined') document.querySelectorAll('.tal-card-page .tal-body').forEach(talLayout_); };

on('tal-size', el => {
  talScaleSet_(Number(el.getAttribute('data-by')) || 0);
  talAllFit_();
  /* THE TILES SAY WHICH WAY IS LEFT: redrawn where they stand. */
  if (typeof document !== 'undefined') document.querySelectorAll('.card.tal').forEach(c => {
    const x = (typeof talmudItems_ === 'function' ? talmudItems_() : []).find(y => y.key === c.getAttribute('data-key'));
    const wrap = c.parentElement && c.parentElement.classList.contains('favwrap') ? c.parentElement : null;
    const row = wrap && wrap.nextElementSibling && wrap.nextElementSibling.classList.contains('tile-row') ? wrap.nextElementSibling : null;
    if (x && row) row.outerHTML = cardTiles_(x);
  });
});
on('tal-retry', el => {
  const page = el && el.closest ? el.closest('.tal-card-page') : null;
  if (!page) return;
  TALMUD.missed[page.getAttribute('data-t') + '/' + talChunkOf_(Number(page.getAttribute('data-i')))] = false;
  page.setAttribute('data-drawn', '0');
  talCardsFit_(page.parentElement);
});
if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('resize', talAllFit_);
