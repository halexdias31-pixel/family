/* A PICTURE WITH MARKS ON IT AND NO PEN: § */
const usesSeen_ = (svg, all) => `<div class="qseen">
    <div class="qpad-art">${svg}
      <svg class="qpad-ink" viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true">${usesInk_(all, padAspect_(null, svg))}</svg>
    </div>
  </div>`;
/* A PART THAT ONLY LOOKS AT THE PICTURE AN EARLIER PART DREW ON: its own copy, with those marks. */
function usesFig_(x) {
  const was = x && x.diagram ? usesUnder_(x, x.diagram) : [];
  return was.length ? usesSeen_(x.diagram, was) : '';
}

/* DOES THIS PART'S CARD DRAW THE EARLIER PICTURE IN FRONT OF ITS WORDS -- see the note above. § */
function usesPage_(x, prev) {
  const y = usesOf_(x);
  const p = y && padSource_(y);
  if (!p) return false;
  if (x.diagram && x.diagram === p.svg) return false;
  /* NOR WHEN THIS PART DRAWS ON THAT SAME PICTURE (its stem's): the marks are under its own pen, and a second copy is what 381 ended */
  const own = padSource_(x);
  return !(own && own.from !== 'surface' && own.svg === p.svg);
}
/* THE PAGE: the earlier part's picture with the marks on it, and nothing said under it -- the lines naming whose marks they were went with every credit on 18 Oct § */
/* `questionUsesCard_` WAS HERE, that picture as a page in front of the part. It is drawn inside the part's
   own card now, in front of its words, with no header or caption (`usesBlock_`, `figHtml_`; 356). */

/* A SURFACE TO ANSWER ON, FOR EVERY QUESTION ANSWERED ON ONE. § */
function padSurface_(x) {
  const KINDS = ['grid', 'coord', 'blank', 'text'];
  if (!x) return '';
  const said = String(x.surface || (x.row && x.row.surface) || '').trim().toLowerCase();
  if (KINDS.indexOf(said) !== -1) return said;
  if (!padDrawn_(x)) return '';
  const f = String(x.figure || (x.row && x.row.figure) || '').trim().toLowerCase();
  if (/coordinate/.test(f)) return 'coord';
  if (/grid/.test(f) && !/isometric/.test(f)) return 'grid';
  return 'blank';
}
/* WHAT EACH IS CALLED, where a paper figure is called "Figure": § */
const SURFACE_NAME = { grid: 'Squared grid', coord: 'Axes', blank: 'Space to draw' };

/* ---------- THE SURFACE ITSELF § */
function surfaceSvg_(kind) {
  const S = 20, A = 10, B = 330;
  const out = [];
  if (kind === 'grid' || kind === 'coord') {
    for (let v = A; v <= B; v += S) {
      out.push(`<line class="grid" x1="${v}" y1="${A}" x2="${v}" y2="${B}"/>`,
               `<line class="grid" x1="${A}" y1="${v}" x2="${B}" y2="${v}"/>`);
    }
  }
  if (kind === 'coord') {
    out.push(`<line class="axis" x1="${A}" y1="170" x2="${B}" y2="170"/>`,
             `<line class="axis" x1="170" y1="${A}" x2="170" y2="${B}"/>`,
             `<text class="ax" x="${B - 2}" y="164" text-anchor="end">x</text>`,
             `<text class="ax" x="176" y="${A + 8}">y</text>`);
    for (let n = -8; n <= 8; n += 2) {
      if (!n) continue;
      const at = 170 + n * S;
      out.push(`<text class="ax" x="${at}" y="182" text-anchor="middle">${n < 0 ? '&minus;' + (-n) : n}</text>`,
               `<text class="ax" x="164" y="${340 - at + 3}" text-anchor="end">${n < 0 ? '&minus;' + (-n) : n}</text>`);
    }
    out.push('<text class="ax" x="164" y="182" text-anchor="end">0</text>');
  }
  if (kind === 'blank') {
    out.push(`<rect class="axis" x="${A}" y="${A}" width="${B - A}" height="${B - A}" rx="8" fill="none" stroke-dasharray="6 6"/>`);
  }
  return `<svg class="qsurf is-${kind}" viewBox="0 0 340 340" role="img" aria-label="${SURFACE_NAME[kind] || 'Space to draw'}">${out.join('')}</svg>`;
}

/* ---------- THE ANSWER AREA AT THE CARD'S FOOT § */
function ansArea_(x) {
  /* ONE PAGE FOR EVERY PART (round 3): a made-up surface above the one answer box; a figure among the words is the pen in place */
  const p = x && x.key ? padSource_(x) : null;
  const pad = p && p.from === 'surface' ? `<div class="qp-area" data-q="${esc(x.key)}">${padWrap_(x, p.svg, 'row')}</div>` : '';
  return pad + ansBox_(x);
}

/* ---------- A CARD WITH A FIGURE IN IT GIVES WAY BEFORE IT IS DRAWN SMALLER, AND NEVER WHOLE § */
const FIG_FLOOR = 180;
const FIG_KEEP = '.qpad, .qseen, figure, .qp-area, .qp-compose, .qp-mark, .tile-row, .qp-choices';
const cardFigs_ = card => (card ? [].slice.call(card.querySelectorAll('.qpad-art > svg:first-child, .qsheet figure > svg')) : []);
function cardFigFit_(pane) {
  try {
    pane.querySelectorAll('[data-face-zoom]').forEach(e => { e.style.zoom = ''; e.removeAttribute('data-face-zoom'); });
    pane.querySelectorAll('[data-fig-fit]').forEach(e => { e.style.width = ''; e.removeAttribute('data-fig-fit'); });
    /* A WHOLE QUESTION SCROLLS (960): nothing in it is shrunk to fit the pane. */
    if (pane.querySelector('.qwhole')) return;
    const card = pane.querySelector('.qcard');
    const figs = cardFigs_(card);
    if (!figs.length) return;
    const over = () => pane.scrollHeight - pane.clientHeight;
    let by = over();
    if (!(by > 2)) return;
    /* THE WORDS: every element of the card that holds no picture and is none of what keeps its size, found by walking down only through what holds a picture -- so a § */
    const words = [];
    /* A TABLE OF CELLS TO TYPE IN keeps its size too: its cells are 44px fingertips, and the tool row under every part (round 3) made such cards zoom them to 31 */
    const keep = e => e.matches(FIG_KEEP) || (e.tagName === 'TABLE' && !!e.querySelector('.qp-cell'));
    const walk = el => [].forEach.call(el.children, e => {
      if (keep(e)) return;
      if (figs.some(f => e.contains(f)) || e.querySelector(FIG_KEEP + ', .qp-cell')) walk(e); else words.push(e);
    });
    walk(card);
    const hw = words.reduce((n, e) => n + e.getBoundingClientRect().height, 0);
    if (hw > 0) {
      /* ON THE LADDER AND OVER THE WORDS' FLOOR (533): the step that fits, else the smallest the floor allows, and the picture narrows for the rest. */
      const f = Math.min.apply(null, words.map(e => parseFloat(getComputedStyle(e).fontSize) || 99).concat(99));
      const ok = PANE_ZOOM_STEPS.filter(s => s < 1 && s >= PANE_FLOOR_TEXT / f - 1e-6);
      const raw = (hw - by - 4) / hw;
      const z = ok.length ? (ok.find(s => s <= raw) || ok[ok.length - 1]) : 1;
      if (z < 1) words.forEach(e => { e.style.zoom = String(z); e.setAttribute('data-face-zoom', ''); });
      by = over();
    }
    if (!(by > 2)) return;
    /* THE TALLEST PICTURE NARROWS, which takes the most height for the least width. */
    const svg = figs.slice().sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
    const box = svg.getBoundingClientRect();
    const w = box.width, h = box.height;
    if (!(w > 0 && h > 0)) return;
    const fit = Math.max(FIG_FLOOR, Math.floor(w * (h - by - 4) / h));
    /* A MARKED PICTURE (`.qseen`) HAS ITS WIDTH ON ITS BOX, which the ink is stretched to: narrowed there,
       or the marks would stay where the wider picture was. */
    const el = svg.parentElement && svg.parentElement.matches('.qseen .qpad-art') ? svg.parentElement : svg;
    if (fit < w) { el.style.width = fit + 'px'; el.setAttribute('data-fig-fit', ''); }
  } catch (e) { /* the stylesheet's size stands, and `paneReach_` scrolls what is left */ }
}

/* ---------- AND A PASSAGE YOU MARK BY TAPPING ITS WORDS § */
const circKey_ = x => padKey_(x) + ':words';
const CIRC_HELD = new Map();
function circRead_(k) {
  try {
    /* THE VISIT'S COPY FIRST when the store refused it — `ansRead_`'s reason (317). */
    const held = typeof keepHeld_ === 'function' ? keepHeld_(k) : undefined;
    const raw = held !== undefined ? (held === null ? '[]' : held) : localStorage.getItem(k);
    if (raw !== null) {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v.map(String) : [];
    }
  } catch (e) { /* a bad stored list reads as none */ }
  return (CIRC_HELD.get(k) || []).slice();
}
/* EVERY WORD OF A BLOCK OF MARKUP, WRAPPED, AND NOTHING ELSE TOUCHED. § */
function circWords_(html, block, on) {
  let n = 0, skip = 0;
  const WORD = /(&(?:rsquo|#8217|apos);)|(&[#\w]+;)|([\p{L}\p{N}]+(?:(?:['’]|&rsquo;|&#8217;|&apos;)[\p{L}\p{N}]+)*)/gu;
  return String(html || '').replace(/(<[^>]*>)|([^<]+)/g, (m, tag, text) => {
    if (tag) {
      if (/^<(svg|script|style)\b/i.test(tag)) skip++;
      else if (/^<\/(svg|script|style)\b/i.test(tag)) skip = Math.max(0, skip - 1);
      return tag;
    }
    if (skip) return text;
    /* NOT TILES, for the reason the multiple-choice options are not (`choiceBox_`): a ringed word is
       the answer being given, and it has to stay where the sentence put it. */
    return text.replace(WORD, (w, apos, ent, word) => {
      if (!word) return w;
      const k = block + '.' + (n++);
      const lit = on && on.indexOf(k) !== -1;
      return `<span class="qw${lit ? ' is-circled' : ''}" data-do="qw-tap" data-w="${k}" role="button" tabindex="0" aria-pressed="${lit}">${word}</span>`;
    });
  });
}

on('qw-tap', (el) => {
  const host = el.closest('[data-circ]');
  if (!host) return;
  const k = host.getAttribute('data-circ') || '';
  const w = el.getAttribute('data-w') || '';
  if (!k || !w) return;
  const all = circRead_(k);
  const i = all.indexOf(w);
  if (i >= 0) all.splice(i, 1); else all.push(w);
  CIRC_HELD.set(k, all.slice());
  ansStore_(k, all.length ? JSON.stringify(all) : null);
  /* EVERY COPY OF THE WORD, on every page built, by key -- the card and a page of the same question peeking under it are two copies of one passage, and a ring on § */
  const lit = i < 0;
  document.querySelectorAll('[data-circ]').forEach(h => {
    if (h.getAttribute('data-circ') !== k) return;
    h.querySelectorAll('.qw').forEach(s => {
      if (s.getAttribute('data-w') !== w) return;
      s.classList.toggle('is-circled', lit);
      s.setAttribute('aria-pressed', lit ? 'true' : 'false');
    });
  });
});

/* ---------- A PICTURE THE QUESTION CAME WITH § */
const pics_ = list => (list || []).map(src =>
  `<figure class="qpic"><img src="${esc(src)}" alt="Picture printed with this question"
     loading="lazy" decoding="async"></figure>`).join('');

/* EVERY TAG ON A CARD IS AN ANSWER YOU CAN PICK IN THE FINDER: § */
const TAG_NAME = /[A-Za-z]/;
/* A TAG THAT IS ONLY TAGS ALREADY ON THE ROW, SIDE BY SIDE — `5-a-day Foundation` after `5-a-day` and `Foundation` — says nothing new. */
function tagMadeOf_(text, said) {
  const t = String(text).toLowerCase(), parts = said.map(w => String(w).toLowerCase()).filter(Boolean);
  const from = i => i === t.length || parts.some(p => t.startsWith(p, i) && (i + p.length === t.length || (t[i + p.length] === ' ' && from(i + p.length + 1))));
  return parts.length > 1 && t.indexOf(' ') > 0 && from(0);
}
function tagRow_(x, page) {
  const out = [], words = new Map(), ids = new Map(), said = [];
  if (!x) return '';
  /* A TAG SHOWS ONLY WHAT IS NOT ALREADY PICKED AS A CHIP (owner, 6 Nov): the chip above already says it. */
  const picked = new Set(), pickedWords = new Set();
  (STUFF.filters || []).filter(f => f && !f.any).forEach(f => { picked.add(f.field + '\u0000' + f.value);
    pickedWords.add(norm(String(f.value))); if (typeof chipShow_ === 'function') pickedWords.add(norm(String(chipShow_(f) || ''))); });
  /* EVERY FACET IS A TAG (396), said as its button says it (`answerSay_`); a word already on the row is not said twice, */
  /* but that tag names this facet too (`data-also`, 1030), so every attribute is on the line. */
  facetList().forEach(facet => {
    let vals;
    try { vals = facetTags_(facet, x, page); } catch (e) { vals = []; }
    vals.forEach(v => {
      const raw = String(v == null ? '' : v).trim();
      if (!raw || picked.has(facet.field + '\u0000' + raw)) return;
      let text = raw;
      try { text = String((facet.tagSay ? facet.tagSay(raw) : answerSay_(facet, raw) || raw) || '').trim(); } catch (e) { text = raw; }
      if (!text) return;
      const w = norm(text);
      if (pickedWords.has(w)) return;
      const twin = TAG_NAME.test(text) && words.has(w) ? words.get(w) : TAG_NAME.test(raw) && ids.has(raw) ? ids.get(raw) : null;
      if (twin) { if (twin.field !== facet.field && twin.also.indexOf(facet.field) < 0) twin.also.push(facet.field); return; }
      if (TAG_NAME.test(text) && tagMadeOf_(text, said)) return;
      const t = { field: facet.field, raw, text, also: [] };
      words.set(w, t); ids.set(raw, t); said.push(text); out.push(t);
    });
  });
  return `<div class="qtags qcard-tags">${out.map(t => `<span class="qtag"${tagAttr_(t.field)} data-f="${esc(t.field)}"${
    t.also.length ? ` data-also="${esc(t.also.join(' '))}"` : ''}>${esc(t.text)}</span>`).join('')}</div>`;
}
/* TAGS AT THE TOP OF EVERY CARD (1030, 1040 r10): a card with no tag line gets one, and one drawn under its title moves above it. */
function tagsOnTop_(x, html) {
  if (!x || typeof html !== 'string' || !html) return html;
  const top = /^(\s*<div\b[^>]*>)/, had = /<div class="qtags qcard-tags">[\s\S]*?<\/div>/.exec(html);
  if (had) { const h = html.search(/<h3\b|<p\b/); return h < 0 || had.index < h ? html : html.replace(had[0], '').replace(top, '$1' + had[0]); }
  if (/class="qtags\b/.test(html)) return html;
  const row = tagRow_(x);
  return /class="qtag"/.test(row) ? html.replace(top, '$1' + row) : html;
}

/* A CREDIT LINE IS A TAG (A+): a card's small source, licence or edition line (`-credit`, or marked `as-tag`), however late it is drawn, moves into its tag row. */
function creditsToTags_(root) {
  const at = root && root.querySelectorAll ? root : document;
  if (at && at.querySelectorAll) at.querySelectorAll('.card :is([class$="-credit"], .as-tag):not(.qtag)').forEach(el => {
    const card = el.closest('.card'), row = card && card.querySelector('.qcard-tags'), w = (el.textContent || '').trim();
    if (!row || !w || el.closest('.qcard-tags')) return;
    const t = document.createElement('span');
    t.className = 'qtag q-credit'; t.textContent = w;
    row.appendChild(t); el.remove();
  });
}
/* ONCE A FRAME, however many things were drawn in it. */
let CREDIT_DUE = false;
try { if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined')
  new MutationObserver(() => { if (CREDIT_DUE) return; CREDIT_DUE = true; requestAnimationFrame(() => { CREDIT_DUE = false; creditsToTags_(document); }); }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) { oops_(e, 'credits'); }

/* ---------- A PART'S READING PAGES, FOR THE PAGE TAGS § */
const qPagesOf_ = x => (isQ_(x) ? partChunks_(x).length : 0);
function qPageAt_(x, page) {
  if (!isQ_(x)) return 0;
  if (page == null || page === '') return qPagesOf_(x);
  const m = /^pre(\d+)$/.exec(String(page));
  return m ? Number(m[1]) + 1 : 0;
}

/* A QUESTION'S BODY IS NEVER BLANK (432): no words, figure or picture in it says why — the library's reason, or that it is missing. */
function qWordsOr_(x, html) {
  if (/<(img|svg|figure|canvas|input|table)\b/i.test(html) || String(html).replace(/<[^>]*>|&nbsp;|\s/g, '')) return html;
  if (libSlim_(x)) return `<div class="lib-say">${libSay_(x)}</div>`;
  return '<p class="empty">This question’s words are missing — flag it and we will put them back.</p>';
}
/* `was`, A CARD DRAWN AGAIN (qtools.js): a part of a whole question (960) is drawn as that part again. */
function questionCard_(x, was) {
  if (was && was.classList.contains('qb-part')) return qPartCard_(x, !!was.querySelector('.qans-card'));
  return `<div class="qcard${typeof helpCls_ === 'function' ? helpCls_(x, '') : ''}">
    ${/* THE ROW, AND NOTHING ELSE ABOVE THE QUESTION: every fact is a tag (`tagRow_`), and every tag
          is an answer the finder offers. THE DAY YOU LAST DID IT is in the tile row, beside the star --
          see `qtRow_`. */''}
    ${tagRow_(x)}
    <div class="qsheet">
      ${/* NO STEM HERE: a whole question draws its openings once, above its parts (`questionWhole_`). § */''}
      ${qWordsOr_(x, cellsHere_(x, chunkHtml_(partChunks_(x).slice(-1)[0], circOf_(x), x)))}
    </div>
    ${/* YOUR BOX, AND THE MARK SCHEME IS NOT UNDER IT ANY MORE. § */
          ''}
    ${ansArea_(x)}
    ${/* HELP (455): a hand up for the tutor, last in the card so it never moves the answer's controls -- the first of the card's foot. */
          typeof helpRow_ === 'function' ? helpRow_(x, '') : ''}
  </div>`;
}

/* ---------- EVERY PART IS ITS OWN CARD, ALL AT ONE LEFT EDGE (owner, 8 Nov; history 1160) */
/* A STEM WHOLE: its words and its figure, no page-cuts (a card scrolls). */
function qStemWhole_(x, p) {
  const html = [];
  stemChunks_(p).forEach(ch => {
    let run = [];
    const flush = () => { if (run.length) html.push(typeset_(run.join(''))); run = []; };
    ch.forEach(b => {
      if (b.k === 'pb') { run.push(b.h); return; }
      flush();
      html.push((p.diagram ? `<figure>${p.diagram}</figure>` : '') + pics_(figImgs_(p.images)));
    });
    flush();
  });
  if (stemFigOwed_(x, p)) html.push('<p class="qfig-missing">Figure not drawn yet.</p>');
  return `<div class="qsheet-stem qb-stem${p.placeholder ? ' is-standin' : ''}" data-of="${esc(stemId_(p))}">${p.lines ? `<p class="qsheet-lines">${esc(p.lines)}</p>` : ''}${html.join('')}</div>`;
}
/* A PART'S WORDS AND ANSWER ROW, a `.qcard` of its own so every handler's `closest('.qcard')` finds this part and no other. */
function qPartCard_(x, ans) {
  const words = partChunks_(x).map(c => chunkHtml_(c, circOf_(x), x)).join('');
  const has = ans && (questionHasAns_(x) || schemeOwed_(x));
  const a = has ? questionAnsCard_(x, true) : '';
  /* EVERY TILE OF THE PART IN ITS ONE TOOL ROW (owner, 8 Nov): Show the answer, Help and the card's tiles handed to `qtRow_` */
  const more = (has && !schemeOwed_(x) ? qaToggle_(ansKey_(x), ansOpen_(x)) : '') + qPartFoot_(x);
  QT_MORE.html = more; QT_MORE.used = false;
  const area = ansArea_(x);
  const left = QT_MORE.used ? '' : (more ? `<div class="tile-row">${more}</div>` : '');
  QT_MORE.html = ''; QT_MORE.used = false;
  return `<div class="qcard qb-part" data-of="${esc((x.row && x.row.row_id) || x.key || '')}"><div class="qsheet">${qWordsOr_(x, cellsHere_(x, words))}</div>${area}${left}${a}</div>`;
}
/* THE CARD'S OWN TILES (share, star, message, top, help) as bare tiles, without the row `cardTiles_` wraps them in */
function qPartFoot_(p) {
  const help = tile_(typeof helpOpts_ === 'function' ? helpOpts_(p, '') : null);
  const row = String(cardTiles_(Object.assign(Object.create(p), { lead: help })) || '').trim();
  const m = /^<div class="tile-row[^"]*">([\s\S]*)<\/div>$/.exec(row);
  return m ? m[1] : row;
}
/* ONE PART, THE SHAPE OF ANY CARD: its tags, a shared stem the first time a drawn part needs it, its words and box, its whole tile row. */
function qOneCard_(p, ctx) {
  const stems = (p.stems || []).filter(s => !ctx.carried.has(s) && !ctx.drawn[stemId_(s)])
    .map(s => { ctx.drawn[stemId_(s)] = true; return qStemWhole_(p, s); }).join('');
  return `<div class="qb favwrap${isFav(p.key) ? ' is-fav' : ''}" data-part="${esc(p.key || '')}">${tagRow_(p)}${stems}${qPartCard_(p, ctx.ans)}</div>`;
}
/* A QUESTION NUMBER: its parts the search kept, one card each, one after another; none indented under another. */
function questionWhole_(x, parts, open, ans) {
  const list = parts && parts.length ? parts : [x];
  const shown = list.filter(p => !open || !open.size || open.has(p));
  const ctx = { ans: ans !== false, drawn: {}, carried: new Set(list.map(stemCarried_).filter(Boolean)) };
  return `<div class="qwhole${typeof helpCls_ === 'function' ? helpCls_(x, '') : ''}" data-q="${esc(qId_(x) || x.key || '')}">${shown.map(p => qOneCard_(p, ctx)).join('')}</div>`;
}

/* ---------- THE STEM, ITS OWN PAGE IN FRONT OF ITS PARTS § */
const stemId_ = p => (p && (p.id || (p.row && p.row.row_id) || p.html || p.diagram)) || '';
const stemHasFig_ = p => !!(p && (p.diagram || figImgs_(p.images).length));
function stemFigOwed_(x, p) {
  if (!p || stemHasFig_(p)) return false;
  const own = q => !!(q && (q.diagram || figImgs_(q.images).length));
  const k = qId_(x);
  const figured = (x.stems || []).some(stemHasFig_) || (!!k && ((questionParts_()[k]) || []).some(own));
  return figWanted_(String(p.html || ''), figured);
}
/* A PAGE IS SMALLER THAN A PHONE, SO LONG WORDS ARE CUT BETWEEN PARAGRAPHS. § */
const CHUNK_PAGE = 640;
const PART_LAST = 300;
const CHUNK_MIN = 160;          // a first page lighter than this joins the next -- see `packBlocks_`
const CHUNK_BLOCK = /^(p|div|table|ul|ol|h[1-6]|blockquote|figure|pre|section|dl)$/i;
const CHUNK_VOID = /^(br|img|hr|input|meta|link|col|wbr|source|area|base|param|track|embed)$/i;
function htmlBlocks_(html) {
  const s = String(html || '');
  const out = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  let m, depth = 0, from = 0;
  while ((m = re.exec(s))) {
    if (CHUNK_VOID.test(m[2]) || m[3]) continue;
    if (!m[1]) { depth++; continue; }
    depth = Math.max(0, depth - 1);
    if (!depth && CHUNK_BLOCK.test(m[2])) { out.push(s.slice(from, re.lastIndex)); from = re.lastIndex; }
  }
  if (s.slice(from).trim()) out.push(s.slice(from));
  return out;
}
const chunkWeight_ = h => String(h).replace(/<[^>]*>/g, '').replace(/&[a-z0-9#]+;/gi, 'x')
  .replace(/\s+/g, ' ').trim().length
  + 45 * (String(h).match(/<(p|li|tr|br|h[1-6]|div)\b/gi) || []).length
  + (/<svg|<img/i.test(h) ? 400 : 0);
/* FROM THE END, the last page first, so the page with the room taken (`last`) is the one that holds
   the end of the text. Returns lists of blocks, in reading order, never an empty list. */
function packBlocks_(blocks, page, last) {
  /* ---------- A FIGURE IS NEVER A PAGE BY ITSELF, AND A PEN'S FIGURE IS ALWAYS ON THE CARD (356) § */
  const isFig = b => b.k === 'fig' || b.k === 'use' || b.k === 'nofig';
  const units = [];
  let open = null;
  blocks.forEach(b => {
    if (open) { open.push(b); if (!isFig(b)) open = null; return; }
    const u = [b];
    units.push(u);
    if (isFig(b)) open = u;
  });
  if (open && open.every(isFig) && units.length > 1) units[units.length - 2].push(...units.pop());
  const pinAt = units.findIndex(u => u.some(b => b.pin));
  const out = [];
  let cur = [], w = 0, cap = last;
  for (let i = units.length - 1; i >= 0; i--) {
    const uw = units[i].reduce((n, b) => n + (b.w != null ? b.w : chunkWeight_(b.h)), 0);
    if (cur.length && w + uw > cap && !(pinAt >= 0 && i >= pinAt)) { out.unshift(cur); cur = []; w = 0; cap = page; }
    cur.unshift(...units[i]); w += uw;
  }
  /* NO PAGE FOR ONE SENTENCE. § */
  if (cur.length && out.length && w < CHUNK_MIN) { out[0] = cur.concat(out[0]); return out; }
  if (cur.length || !out.length) out.unshift(cur);
  return out;
}
/* ---------- WHAT A FIGURE WEIGHS: ITS HEIGHT AT THE NARROWEST PANE'S WIDTH § */
const FIG_PANE_W = 288;
const FIG_PX_WEIGHT = 1.8;
function figWeight_(svg) {
  const m = /viewBox\s*=\s*["']\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(String(svg || ''));
  const w = m ? +m[1] : 1, h = m ? +m[2] : 1;
  const px = w > 0 && h > 0 ? FIG_PANE_W * h / w : FIG_PANE_W;
  return Math.round(Math.min(px, 568) * FIG_PX_WEIGHT);
}
const picsWeight_ = imgs => 400 * (imgs || []).length;
/* ---------- WHERE THE PAPER PRINTS THE FIGURE: `<!--fig-->` § */
const FIG_MARK = /<!--\s*fig\s*-->/gi;
function figBlocks_(html) {
  const out = [];
  let at = -1;
  htmlBlocks_(html).forEach(b => {
    const hit = b.search(/<!--\s*fig\s*-->/i);
    const clean = b.replace(FIG_MARK, '');
    const keep = !!clean.trim();
    if (hit >= 0 && at < 0 && !b.slice(0, hit).trim()) at = out.length;
    if (keep) out.push(clean);
    if (hit >= 0 && at < 0) at = out.length;
  });
  return { blocks: out, at: at };
}

/* MEMOISED ON THE OBJECT, because `pageParts_` asks for every result on every new filter and the
   library is seven thousand rows; a row's words change only when the Ledger's land (`LIB.gen`). */
const CHUNK_MEMO = new WeakMap();
/* A PLAN HOLDS FOR ONE LIBRARY GENERATION (432): planned while the words were in the Ledger, it was a page with none in it. */
const chunkGen_ = () => (typeof LIB !== 'undefined' && LIB ? LIB.gen : 0);
const chunkHad_ = o => { const had = CHUNK_MEMO.get(o); return had && had.gen === chunkGen_() ? had : null; };
/* AN EMPTY STEM IS NO PAGE AT ALL (`packBlocks_` alone would hand back one empty page, which is right for a
   card that must exist and wrong for a stem with nothing left on it). */
const packSeg_ = (blocks, page, last) => (blocks.length ? packBlocks_(blocks, page, last) : []);

/* ---------- A STEM'S PAGES, WITH ITS FIGURE AMONG ITS WORDS § */
function stemPlan_(p) {
  if (!p || typeof p !== 'object') return { chunks: [] };
  const had = chunkHad_(p);
  if (had) return had;
  const fb = figBlocks_(p.html);
  const pb = fb.blocks.map(h => ({ k: 'pb', h: h }));
  /* THE FIGURE STANDS AT ITS MARKER, ELSE AFTER THE WORDS -- digest.gs's rule for a stem, so the Sunday email and the page agree -- AND NOT AT ALL WHEN A PART § */
  const fig = stemHasFig_(p) && !stemPenned_(p)
    ? [{ k: 'fig', h: '', w: (p.diagram ? figWeight_(p.diagram) : 0) + picsWeight_(figImgs_(p.images)) }] : [];
  const at = fb.at >= 0 ? fb.at : pb.length;
  const plan = { chunks: packSeg_(pb.slice(0, at).concat(fig, pb.slice(at)), CHUNK_PAGE, CHUNK_PAGE), gen: chunkGen_() };
  CHUNK_MEMO.set(p, plan);
  return plan;
}
/* ---------- A STEM WHOSE FIGURE A PART DRAWS ON § */
let STEM_PEN = { from: null, svgs: null };
function stemPenned_(p) {
  if (!p || !p.diagram) return false;
  let all = [];
  try { all = stuffItemsAll_() || []; } catch (e) { return false; }
  if (STEM_PEN.from !== all) {
    const svgs = new Set();
    all.forEach(y => {
      if (!isQ_(y) || !(y.stems || []).length) return;
      const src = padSource_(y);
      if (src && src.from && typeof src.from === 'object') svgs.add(src.svg);
    });
    STEM_PEN = { from: all, svgs: svgs };
  }
  return STEM_PEN.svgs.has(p.diagram);
}
/* ---------- THE STEM WHOSE FIGURE THIS PART DRAWS ON, CARRIED ONTO ITS CARD (381): the first part to share it, its innermost stem, words and one figure only */
function stemCarried_(x) {
  const src = isQ_(x) ? padSource_(x) : null;
  const p = src && src.from && typeof src.from === 'object' ? src.from : null;
  if (!p || p.placeholder || p.lines || figImgs_(p.images).length) return null;
  const st = x.stems || [];
  if (st[st.length - 1] !== p) return null;
  let sib = [];
  try { sib = (questionParts_()[qId_(x)]) || []; } catch (e) { return null; }
  const id = stemId_(p);
  const first = sib.find(y => (y.stems || []).some(q => stemId_(q) === id));
  return first === x || (first && first.key === x.key) ? p : null;
}
function stemChunks_(p) {
  const c = stemPlan_(p).chunks;
  return c.length ? c : [[]];
}

/* ---------- A PART'S PAGES, WITH ITS FIGURE AMONG ITS WORDS § */
function partPlan_(x) {
  if (!x || typeof x !== 'object') return { chunks: [[]] };
  const had = chunkHad_(x);
  if (had) return had;
  const lead = x.lead ? [{ k: 'lead', h: String(x.lead).replace(FIG_MARK, '') }] : [];
  const fb = figBlocks_(x.html);
  /* `i` IS THE BLOCK'S PLACE IN THE ROW, carried onto every page it lands on, so a ringed word
     (`circWords_`) is named the same whichever page the cut put it on. */
  const pb = fb.blocks.map((h, i) => ({ k: 'pb', h: h, i: i }));
  const f = cardFigBlock_(x);
  let seq;
  if (!f) seq = lead.concat(pb);
  else if (fb.at >= 0 && f.k === 'fig') seq = lead.concat(pb.slice(0, fb.at), [f], pb.slice(fb.at));
  else if (lead.length) seq = lead.concat([f], pb);
  else seq = [f].concat(pb);
  /* THE STEM IN FRONT, ITS FIGURE UNDER THIS PART'S PEN AT THE STEM'S OWN PLACE FOR IT (its marker, else after its words) -- the paper's order on one card */
  const sc = f ? stemCarried_(x) : null;
  if (sc) {
    const sb = figBlocks_(sc.html), sw = sb.blocks.map(h => ({ k: 'sb', h: h }));
    const at = sb.at >= 0 ? sb.at : sw.length;
    seq = sw.slice(0, at).concat([f], sw.slice(at), lead, pb);
  }
  const u = usesBlock_(x);
  if (u) seq = [u].concat(seq);
  /* A PART THAT FITS A PAGE IS ONE CARD (500): "Work out x" on one page and "to 3 s.f." with the box on the next read as two questions. */
  const all = seq.reduce((n, b) => n + (b.w != null ? b.w : chunkWeight_(b.h)), 0);
  const plan = { chunks: all <= CHUNK_PAGE ? [seq] : packBlocks_(seq, CHUNK_PAGE, PART_LAST), gen: chunkGen_() };
  CHUNK_MEMO.set(x, plan);
  return plan;
}
/* ---------- THE FIGURE A PART'S CARD DRAWS, AS A BLOCK TO PLACE § */
function cardFigBlock_(x) {
  const p = padSource_(x);
  if (questionHasFig_(x)) {
    return { k: 'fig', h: '', pin: !!(p && p.from === 'part'),
             w: (x.diagram ? figWeight_(x.diagram) : 0) + picsWeight_(figImgs_(x.images)) };
  }
  if (p && p.from && typeof p.from === 'object') return { k: 'fig', h: '', pin: true, w: figWeight_(p.svg) };
  if (figGap_(x)) return { k: 'nofig', h: '', w: 45 };
  return null;
}
/* THE FIRST OF A RUN OF PARTS THAT NAME A FIGURE NOBODY HAS DRAWN, in the paper's order -- the run is one gap, and saying it under every part of it was a line § */
function figGap_(x) {
  if (!figMissing_(x)) return false;
  const k = qId_(x);
  const sib = k ? ((questionParts_()[k]) || []) : [];
  const at = sib.indexOf(x);
  return !(at > 0 && figMissing_(sib[at - 1]));
}
/* THE PICTURE AN EARLIER PART DREW ON, WITH THOSE MARKS, where this part reads it and has no copy of its own
   (`usesPage_`) -- weighed as the picture. */
function usesBlock_(x) {
  if (!usesPage_(x)) return null;
  const p = padSource_(usesOf_(x));
  return { k: 'use', h: '', w: figWeight_(p.svg) };
}/* THE LEAD IS ONE BLOCK, kept whole and in its own wrapper: it is the part's own sentence of setting,
   and it is short (`lead` is 436 cells, none past a page). */
function partChunks_(x) {
  return partPlan_(x).chunks;
}
/* A CHUNK IN THE WRAPPERS THE CARD ALWAYS USED -- the lead in `.qsheet-lead`, the part's words in `.qsheet-part > .qsheet-pb` -- so the typesetting rules and § */
/* `circ` IS A PASSAGE THAT IS ITS OWN ANSWER SURFACE ("Circle the three adjectives in the passage below") -- `circOf_` -- and then every word of the part is a § */
function chunkHtml_(chunk, circ, x) {
  const c = chunk || [];
  const lead = c.filter(b => b.k === 'lead').map(b => b.h).join('');
  /* WHAT STANDS IN FRONT OF THE LEAD -- the earlier part's marked picture, or a figure that opens the part
     where it has no lead -- and the rest, the part's words with any figure among them in its place. */
  let n = 0;
  while (n < c.length && c[n].k !== 'lead' && c[n].k !== 'pb') n++;
  const head = c.slice(0, n), rest = c.slice(n).filter(b => b.k !== 'lead');
  const words = rest.filter(b => b.k === 'pb');
  /* THE WORDS ARE TYPESET A RUN AT A TIME, between figures, so a picture is never handed to `typeset_` as
     text; with no figure in the chunk it is the one run it always was. */
  let pb = '', run = [];
  const flush = () => {
    if (!run.length) return;
    pb += circ ? run.map(b => circWords_(typeset_(b.h), b.i, circ.on)).join('') : typeset_(run.map(b => b.h).join(''));
    run = [];
  };
  rest.forEach(b => { if (b.k === 'pb') run.push(b); else { flush(); pb += figHtml_(x, b); } });
  flush();
  /* A CARRIED STEM'S WORDS (`sb`) ARE TYPESET A RUN AT A TIME in the stem's own wrapper, between its figures */
  let top = '', sbs = [];
  const sbFlush = () => { if (sbs.length) top += `<div class="qsheet-stem is-over">${typeset_(sbs.join(''))}</div>`; sbs = []; };
  head.forEach(b => { if (b.k === 'sb') sbs.push(b.h); else { sbFlush(); top += figHtml_(x, b); } });
  sbFlush();
  return `${top}${lead ? `<div class="qsheet-lead">${typeset_(lead)}</div>` : ''}
      <div class="qsheet-part${circ ? ' is-text' : ''}"${circ ? ` data-circ="${esc(circ.k)}"` : ''}>
        <div class="qsheet-pb">${pb}</div>
      </div>${circ && words.length ? `<p class="qpad-note qw-note">Tap a word to ring it, and again to take
        the ring off. <span data-kept-k="${esc(circ.k)}">${esc(padNoteSay_(circ.k))}</span></p>` : ''}`;
}
/* ---------- A FIGURE BLOCK, DRAWN § */
function figHtml_(x, b) {
  if (!x || !b) return '';
  if (b.k === 'nofig') return '<p class="qfig-missing">Figure not drawn yet.</p>';
  if (b.k === 'use') {
    const y = usesOf_(x);
    const p = y && padSource_(y);
    return p ? usesSeen_(p.svg, usesUnder_(y, p.svg).concat(usesMine_(y))) : '';
  }
  const p = padSource_(x);
  const pics = pics_(figImgs_(x.images));
  if (p && p.from !== 'surface') return padWrap_(x, p.svg, 'row') + pics;
  return (x.diagram ? usesFig_(x) || `<figure>${x.diagram}</figure>` : '') + pics;
}
/* THE PHONE'S OLD RINGS MOVE TO THE FIRST PERSON WHO OPENS THEM, as the pen's do in `padWrap_` -- and
   so do the visit's (`CIRC_HELD`), which are the only copy when storage throws. */
function circOf_(x) {
  if (padSurface_(x) !== 'text') return null;
  const k = circKey_(x), bare = 'pad:' + padItemKey_(x) + ':words';
  padAdopt_(k, bare);
  /* THE VISIT'S RINGS ARE A SIGNED-OUT ANSWER TOO, and move only where `padAdopt_` would move the stored
     ones: the one question every move asks (`ansMayMove_`, answers.js). */
  if (k !== bare && !CIRC_HELD.has(k) && CIRC_HELD.has(bare)
      && (typeof ansMayMove_ !== 'function' || ansMayMove_(bare, k))) {
    CIRC_HELD.set(k, CIRC_HELD.get(bare));
    CIRC_HELD.delete(bare);
  }
  return { k: k, on: circRead_(k) };
}

/* `questionStemFigCard_` WAS HERE, the stem's figure as a page of its own after its words (204, 268). The
   figure is among the stem's words now, or under the pen of the part that draws on it (356). */

/* ---------- A FIGURE'S PAGE IS NAMED FOR THE FIGURE, NOT FOR A QUESTION NUMBER § */
function figLabel_(html, not) {
  const seen = String(html || '').replace(/<[^>]*>/g, ' ').match(/\bFigure\s+\d+[a-z]?\b/gi) || [];
  const hit = seen.map(t => 'Figure ' + t.replace(/^figure\s+/i, ''))
    .find(t => (not || []).indexOf(t) < 0);
  return hit || 'Figure';
}

/* THE FIGURE IS IN ITS QUESTION'S CARD, WHERE THE PAPER PRINTS IT. § */
const figImgs_ = v => (Array.isArray(v) ? v : topicAtoms_(v));
function questionHasFig_(x) {
  if (!isQ_(x)) return false;
  return !!(x.diagram || figImgs_(x.images).length);
}

/* ---------- A FIGURE THE PAPER PRINTS AND THIS SITE HAS NOT DRAWN YET § */
const FIG_NAMED = /\b(?:figure\s*\d+[a-z]?|the\s+(?:graphs?|diagrams?|grid|chart|bar\s+chart|pie\s+chart|scatter\s+(?:graph|diagram)|map)\b|the\s+table\s+below)/i;
function figWanted_(words, figured) {
  if (figured) return false;
  const h = String(words || '');
  if (/<(svg|img|table)\b/i.test(h)) return false;
  return FIG_NAMED.test(h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' '));
}
function figMissing_(x) {
  if (!isQ_(x) || padSurface_(x)) return false;
  /* NOT A PART THAT USES AN EARLIER PART'S DRAWING: § */
  if (usesOf_(x)) return false;
  const own = p => !!(p && (p.diagram || figImgs_(p.images).length));
  let figured = own(x) || (x.stems || []).some(stemHasFig_);
  if (!figured) {
    const k = qId_(x);
    figured = !!k && ((questionParts_()[k]) || []).some(own);
  }
  return figWanted_(String(x.lead || '') + ' ' + String(x.html || ''), figured);
}
/* `questionNoFigCard_` WAS HERE, a page saying so. It is one line in the card now, where the figure would
   stand (`cardFigBlock_`, `figHtml_`; 356). */

/* THE ANSWER IS ITS OWN CARD, THE PAGE AFTER ITS QUESTION (AND AFTER ITS FIGURE). § */
function questionHasAns_(x) {
  /* OR AN ANSWER THE LEDGER HOLDS FOR IT (397), so `Answers` is still asked, and counted, before any words arrive. */
  return !!(isQ_(x) && (String(x.answer || '').trim() || libHasField_(x.row, 'answer')));
}

/* ---------- WHO SEES IT OPEN: WHOEVER ASKED, AND NOBODY ELSE § */
const ANS_SHOWN = new Set();
/* CHOOSING `Answers` IS THE ASK, so in that view every answer is open -- forty pages each reading
   "Answer hidden" is not *"only see answers"* -- and Hide on one still hides it (`ANS_HID`). */
const ANS_HID = new Set();
function ansOpen_(x) {
  if (!x) return false;
  const k = ansKey_(x);
  return ANS_SHOWN.has(k) || (answersAsked_() && !ANS_HID.has(k));
}

/* A PAST-PAPER PART IMPORTED WITHOUT ITS MARK SCHEME (584): no answer of any kind anywhere, so its answer page says so plainly. */
function schemeOwed_(x) {
  const r = x && x.row;
  if (!r || !isQ_(x) || questionHasAns_(x) || libTrue(r.verified) || String(r.document_type || '') !== 'Past paper') return false;
  return !['accept', 'cells', 'mark_words', 'draw_answer', 'choice_right'].some(f => libHasField_(r, f));
}
/* SHOW OR HIDE THE ANSWER, one tile that says which way it goes */
const qaToggle_ = (k, open) => open
  ? tile_({ icon: 'hide', label: 'Hide the answer', note: 'one tap', act: 'qa-hide', cls: 'qa-toggle', data: { k: k } })
  : tile_({ icon: 'show', label: 'Show the answer', note: 'one tap', act: 'qa-show', cls: 'qa-toggle', data: { k: k } });
/* `inRow`: a part of a whole question, whose toggle and Help are in its one tool row, so this card holds no row of its own */
function questionAnsCard_(x, inRow) {
  const id = (x.row && x.row.row_id) || x.key || '';
  if (schemeOwed_(x)) return `<div class="qcard qans-card" data-of="${esc(id)}">${tagRow_(x, 'ans')}
    <p class="qans-none">No checked answer yet: this paper's mark scheme has not been added.</p></div>`;
  const k = ansKey_(x);
  const open = ansOpen_(x);
  /* ---------- ONE TILE, IN ONE PLACE, AND IT SAYS WHICH WAY IT GOES § */
  return `<div class="qcard qans-card${open ? '' : ' is-hidden'}${typeof helpCls_ === 'function' ? helpCls_(x, 'ans') : ''}" data-of="${esc(id)}" data-k="${esc(k)}">
    ${tagRow_(x, 'ans')}
    ${inRow ? '' : `<div class="tile-row qans-tiles">${qaToggle_(k, open)}${
      /* "ANSWER HIDDEN", AND NOT "HAVE A GO FIRST". § */
      open ? '' : '<span class="qans-wait-k">Answer hidden</span>'}</div>`}
    ${open ? answerBlock_(x) : ''}
    ${!inRow && typeof helpRow_ === 'function' ? helpRow_(x, 'ans') : ''}
  </div>`;
}

/* THE QUESTION A KEY BELONGS TO, by the same lookup `qp-choose` makes. */
function ansItem_(k) {
  if (!k) return null;
  try { return stuffItemsAll_().find(it => isQ_(it) && ansKey_(it) === k) || null; }
  catch (e) { return null; }
}

/* ---------- SHOWING IT AND HIDING IT: REMEMBERED, AND DRAWN WHEREVER IT ALREADY STANDS § */
function ansSet_(x, open) {
  if (!x) return;
  const k = ansKey_(x);
  if (open) { ANS_SHOWN.add(k); ANS_HID.delete(k); } else { ANS_SHOWN.delete(k); ANS_HID.add(k); }
  document.querySelectorAll('.qans-card').forEach(el => {
    if (el.getAttribute('data-k') !== k) return;
    const t = document.createElement('div');
    const part = el.closest('.qb-part');
    t.innerHTML = questionAnsCard_(x, !!part);
    const card = t.firstElementChild;
    if (!card) return;
    const row = part ? [].find.call(part.querySelectorAll('.qa-toggle'), b => b.getAttribute('data-k') === k) : null;
    const had = el.contains(document.activeElement) || (!!row && row === document.activeElement);
    el.replaceWith(card);
    if (row) { const r = document.createElement('div'); r.innerHTML = qaToggle_(k, open); if (r.firstElementChild) row.replaceWith(r.firstElementChild); }
    const scope = part || card;
    if (had) { try { const tl = scope.querySelector('.qa-toggle'); if (tl) tl.focus({ preventScroll: true }); } catch (e) { /* an element that cannot take focus is left as it is */ } }
  });
}
function ansShow_(x) { ansSet_(x, true); }
function ansHide_(x) { ansSet_(x, false); }

/* ---------- AND HOW YOUR LAST ANSWER WENT, BESIDE THE STAR § */

/* ---------- THE MAGNIFIER (463): the owner, "a magnifying tool instead -- you hold it to see better" ---------- */
/* On, a circle 2.5 times bigger follows the mouse over the page, or shows above a held finger; a copy of the page drawn big, so words, figures, pictures and the pen's ink alike. */
const MAG = { on: '', live: false, el: null, page: null, at: 0, tid: 0, pid: null, x0: 0, y0: 0 };
const MAG_Z = 2.5, MAG_R = 80, MAG_HOLD = 220;
const magLook_ = on => ({ icon: 'zoom', label: on ? 'Magnifier on' : 'Magnifier', note: on ? 'tap to put it away' : 'hold it over the page', on: on, pressed: on });
const magOpts_ = () => Object.assign(magLook_(!!MAG.on), { act: 'q-mag', cls: 'q-mag' });
function magPaint_() {
  document.querySelectorAll('.q-mag').forEach(el => tileSet_(el, magLook_(!!MAG.on)));
  if (document.body) document.body.classList.toggle('mag-on', !!MAG.on);
}
on('q-mag', () => { MAG.on = MAG.on ? '' : qLockHere_(); if (!MAG.on) magHide_(); magPaint_(); });
/* AND ON EVERY THING FIND HOLDS (502): a library card or a verse is words and figures too; a question's is in each part's row (`qtRow_`) */
const MAG_ITEM_KINDS = { content: 1, practical: 1, project: 1, bible: 1, quran: 1, talmud: 1, hadith: 1, paper: 1, document: 1 };
function magCardOpts_(x) {
  if (!x || !x.key || isQ_(x) || isMeCard_(x)) return null;
  if (!MAG_ITEM_KINDS[x.kind] && (typeof ruleOn_ !== 'function' || ruleOn_('mag-items'))) return null;
  return magOpts_();
}
/* PUT AWAY WHEN A TAB OR A LINK LEAVES THE PAGE IT WAS TAKEN OUT ON, as the padlock is (`qLockStray_`) */
function magStray_() { if (MAG.on && MAG.on !== qLockHere_()) { MAG.on = ''; magHide_(); magPaint_(); } }
const magBusy_ = () => !!MAG.live;
/* WHICH PAGE A POINT IS OVER, if it is a question's page with the magnifier on */
function magPageAt_(t) {
  const page = MAG.on && t && t.closest ? t.closest('.page') : null;
  return page && page.querySelector('.q-mag') ? page : null;
}
