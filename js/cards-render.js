/* @family. — cards-render.js THE ONE MASTER TEMPLATE (owner, 12 Nov: "go all the way"; rules.md 3.11). */
/* A card is DATA: { kind, picture?, tags, body: [blocks], tiles }. renderCard is the only code that writes card markup. */
/* Every string in a spec is TEXT and is escaped here; a spec never carries markup (check-card-spec holds that). */

/* INLINE TEXT: a string, or runs — { b }, { i }, { sup }, { sub }, { math }, { mono }, { tone, text } — each escaped. */
function cardRuns_(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(cardRuns_).join('');
  if (typeof v !== 'object') return esc(String(v));
  /* A SUBJECT'S LEVELS RAISED after it (a tutor's pill), each level held whole so a long list breaks between levels. */
  if (Array.isArray(v.levels)) return `<sup class="prof-lv">&nbsp;${v.levels.map(l => `<span>${cardRuns_({ marked: l })}</span>`).join(', ')}</sup>`;
  /* A QUALIFICATION WRITTEN LIKE AN ISOTOPE: the level raised and the grade lowered, held to the subject's last word. */
  if (v.iso != null) { const said = cardRuns_({ marked: v.iso }), cut = cardLastGap_(said), sup = cardRuns_(v.sup), sub = cardRuns_(v.sub);
    return `${cut > 0 ? said.slice(0, cut) + ' ' : ''}<span class="prof-q-end">${said.slice(cut + 1)}<span class="prof-iso">${sup ? `<sup>${sup}</sup>` : ''}${sub ? `<sub>${sub}</sub>` : ''}</span></span>`; }
  if (v.b != null) return `<b>${cardRuns_(v.b)}</b>`;
  if (v.i != null) return `<i>${cardRuns_(v.i)}</i>`;
  if (v.sup != null) return `<sup>${cardRuns_(v.sup)}</sup>`;
  if (v.sub != null) return `<sub>${cardRuns_(v.sub)}</sub>`;
  if (v.math != null) return `<span class="kc-math">${cardRuns_(v.math)}</span>`;
  if (v.mono != null) return `<span class="mono">${cardRuns_(v.mono)}</span>`;
  /* A LINK: an https, mailto: or tel: address, or a site path; `act` (file-view) opens it in place, the href its fallback; `look: 'link'` its one class, `out` a new tab. */
  if (v.link != null) { const h = String(v.href || ''); if (!/^(https:|mailto:|tel:|docs\/|data\/)/i.test(h)) return cardRuns_(v.link);
    return `<a${v.look === 'link' ? ' class="link"' : ''} href="${esc(h)}"${v.out ? ' target="_blank" rel="noopener"' : ''}${v.act ? ` data-do="${esc(v.act)}"` : ''}>${cardRuns_(v.link)}</a>`; }
  /* A LINE BREAK inside one line's words (the build stamp's three lines). */
  if (v.br) return '<br>';
  /* A LINE NUMBER in a margin, as a printed text numbers its lines: read aloud as `line n`. */
  if (v.ln != null) return `<span class="kc-ln" aria-label="line ${esc(String(v.ln))}">${esc(String(v.ln))}</span>`;
  /* MATHS AS TYPED (`x^2`, `a/b`): escaped first, then the typesetter raises and stacks it. */
  /* then typeset_ like any maths, so a printed `<sup>a</sup>&frasl;<sub>b</sub>` is stacked over its line, not left as a slash (owner, 20 Nov). */
  if (v.typeset != null && !v.frac && cardHasMarkup_(v.typeset)) { const h = cardRuns_(cardMarkupRuns_(v.typeset));
    return `<span class="kc-math">${typeof typeset_ === 'function' ? typeset_(h) : h}</span>`; }
  if (v.typeset != null) return `<span class="kc-math">${v.frac ? cardFrac_(String(v.typeset)) : typeof typeset_ === 'function' ? typeset_(esc(String(v.typeset))) : esc(String(v.typeset))}</span>`;
  /* A SMALL MARK BESIDE A WORD (Higher tier's `H`, `only Foundation`): text, one fixed class. */
  if (v.badge != null) return `<span class="kc-badge"${v.hint ? ` title="${esc(v.hint)}"` : ''}>${esc(String(v.badge))}</span>`;
  /* TEXT WITH THE SITE'S LAWS COLOURED (`mark`, which escapes first): still only text in the spec. */
  if (v.marked != null) return typeof mark === 'function' ? mark(String(v.marked)) : esc(String(v.marked));
  /* A NAMED WORD (a subject, green as a subject is everywhere): one of a fixed set, never a free class. */
  if (v.word && /^(subject|venue|level)$/.test(v.word)) return `<span class="${v.word}">${cardRuns_(v.text)}</span>`;
  /* A NAMED PART OF A LINE (a qualification's subject, notation, mark): a span with a plain class, its text escaped; `span: ''` is a bare span. */
  if (v.span != null && /^[a-z][\w -]*$|^$/.test(String(v.span))) return `<span${v.span ? ` class="${esc(v.span)}"` : ''}>${cardRuns_(v.text)}</span>`;
  if (v.tone) return `<span class="${esc('is-' + v.tone)}">${cardRuns_(v.text)}</span>`;
  return cardRuns_(v.text);
}
/* PRINTED MATHS AS DATA (owner, 15 Nov: the Cosine rule showed its <i>/<sup> as text): an insert's few tags and named characters, read into runs. */
/* So cardRuns_ escapes every word and no markup passes through; plain typed maths (`x^2`) still goes to the typesetter. */
const CARD_ENT = { frasl: '\u2044', times: '\u00d7', pi: '\u03c0', minus: '\u2212', ne: '\u2260', nbsp: '\u00a0', plusmn: '\u00b1', radic: '\u221a',
  rho: '\u03c1', theta: '\u03b8', lambda: '\u03bb', infin: '\u221e', lt: '<', gt: '>', amp: '&', hellip: '\u2026', rarr: '\u2192', prime: '\u2032',
  int: '\u222b', asymp: '\u2248', cup: '\u222a', cap: '\u2229', mu: '\u03bc', sigma: '\u03c3', epsilon: '\u03b5', alpha: '\u03b1', phi: '\u03c6',
  omega: '\u03c9', tau: '\u03c4', Delta: '\u0394', Phi: '\u03a6', rsquo: '\u2019', lsquo: '\u2018', delta: '\u03b4', Omega: '\u03a9', Sigma: '\u03a3', eta: '\u03b7', gamma: '\u03b3', beta: '\u03b2', nu: '\u03bd', psi: '\u03c8', ndash: '\u2013', le: '\u2264', ge: '\u2265', deg: '\u00b0', frac12: '\u00bd', divide: '\u00f7', quot: '"' };
const cardHasMarkup_ = s => /<\/?(i|b|sup|sub|span)\b[^>]*>|&[a-z]+;|&#\d+;/i.test(String(s || ''));
function cardMarkupRuns_(s) {
  const top = [], stack = [{ runs: top }];
  const put = r => stack[stack.length - 1].runs.push(r);
  const txt = t => t && put(t.replace(/&([a-z]+);|&#(\d+);/gi, (m, n, d) => d ? String.fromCharCode(Number(d)) : (CARD_ENT[n] != null ? CARD_ENT[n] : CARD_ENT[n.toLowerCase()] != null ? CARD_ENT[n.toLowerCase()] : m)));
  String(s || '').split(/(<\/?[a-z]+\b[^>]*>)/i).forEach(part => {
    const t = /^<(\/?)([a-z]+)\b([^>]*)>$/i.exec(part);
    if (!t) return txt(part);
    const tag = t[2].toLowerCase();
    if (!t[1]) { const cls = /insh-rad/.test(t[3]) ? 'insh-rad' : /overline/.test(t[3]) ? 'kc-over' : '';
      return stack.push({ tag, cls, runs: [] }); }
    if (stack.length < 2) return;
    const o = stack.pop(), inner = o.runs;
    put(o.tag === 'i' ? { i: inner } : o.tag === 'b' ? { b: inner } : o.tag === 'sup' ? { sup: inner } : o.tag === 'sub' ? { sub: inner }
      : o.cls ? { span: o.cls, text: inner } : inner);
  });
  while (stack.length > 1) { const o = stack.pop(); put(o.runs); }
  return top;
}
/* A FORMULA (`frac`, a textbook's): its slashes stacked as fractions, and a Unicode subscript drawn as a real one. */
const CARD_SUB = '₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₙₛₜ', CARD_SUB_AS = '0123456789aeoxnst';
const cardSub_ = html => String(html).replace(/[₀-₉ₐₑₒₓₙₛₜ]+/g, run => '<sub>' + [...run].map(c => CARD_SUB_AS[CARD_SUB.indexOf(c)]).join('') + '</sub>');
const cardFrac_ = s => cardSub_(typeof typeset_ === 'function' ? typeset_(esc(s).replace(/\//g, '&frasl;')) : esc(s));
/* THE LAST SPACE IN SOME HTML THAT IS NEITHER INSIDE A TAG NOR INSIDE A COLOURED SPAN, or -1 (an isotope's subject breaks there). */
function cardLastGap_(html) {
  let depth = 0, at = -1;
  for (let i = 0; i < html.length; i++) {
    if (html[i] === '<') { const end = html.indexOf('>', i); if (end < 0) break; depth += html[i + 1] === '/' ? -1 : html[end - 1] === '/' ? 0 : 1; i = end; }
    else if (html[i] === ' ' && depth <= 0) at = i;
  }
  return at;
}
const cardAttrs_ = d => Object.keys(d || {}).map(k => ` data-${esc(k)}="${esc(String(d[k]))}"`).join('');
/* A PICTURE: a photo (`src`), a clip (`video`), an 8-bit drawing (`pix`: 16 rows of palette letters), or a drawing a picture maker drew (`svg`). */
function cardPic_(p) {
  if (!p) return '';
  if (p.src) return `<img${p.look ? ` class="${esc(p.look)}"` : ''} src="${esc(p.src)}" alt="${esc(p.alt || '')}" loading="lazy" decoding="async">`;
  if (p.video) return `<video src="${esc(p.video)}" muted playsinline loop aria-label="${esc(p.alt || '')}"></video>`;
  if (Array.isArray(p.pix)) return `<figure class="person-pic">${pixSvg_(p.pix, p.alt, p.flip, p.none ? ' is-none' : '')}</figure>`;
  if (p.svg && /^\s*<(svg|figure)\b[\s\S]*<\/svg>[\s\S]*$/.test(String(p.svg))) return String(p.svg);
  return '';
}
/* THE PICTURE MAKER'S 8-BIT DRAWER (batch E): portraits, cars, car parts and PC parts are all 16 rows of palette letters (`.pp-<letter>`). */
function pixSvg_(rows, name, flip, cls) {
  const byC = {};
  (rows || []).forEach((line, y) => {
    for (let x = 0; x < line.length;) {
      const c = line[x];
      let w = 1;
      while (line[x + w] === c) w++;
      if (c !== '.') (byC[c] = byC[c] || []).push(`M${x} ${y}h${w}v1h-${w}z`);
      x += w;
    }
  });
  const paths = Object.keys(byC).map(c => `<path class="pp-${c}" d="${byC[c].join('')}"/>`).join('');
  return `<svg class="pp${cls || ''}" viewBox="0 0 16 16" shape-rendering="crispEdges" role="img" aria-label="${esc(name || '')}">${
    flip ? `<g transform="translate(16 0) scale(-1 1)">${paths}</g>` : paths}</svg>`;
}

/* A DRAWN PICTURE FROM DATA: shapes `{ t, ...attrs, kids }` on a round `ground`, at `size` pixels (links.js's ten pictures). */
const ART_TAGS = /^(path|circle|ellipse|rect|g)$/;
/* A PAINT NAMED BY TOKEN (`--pfp-fox`) is that token from style.css's :root; anything else ('none') is as written. */
const artPaint_ = v => (/^--pfp-[a-z-]+$/.test(String(v)) ? `var(${v})` : v);
const artShapes_ = list => (list || []).filter(o => o && ART_TAGS.test(o.t)).map(o => `<${o.t}${Object.keys(o).filter(k => k !== 't' && k !== 'kids')
  .map(k => ` ${esc(k)}="${esc(k === 'fill' || k === 'stroke' ? artPaint_(o[k]) : o[k])}"`).join('')}${o.kids ? `>${artShapes_(o.kids)}</${o.t}>` : '/>'}`).join('');
const artSvg_ = (art, ground, size) => `<svg class="pfp-art" viewBox="0 0 48 48" width="${esc(size)}" height="${esc(size)}" aria-hidden="true">`
  + `<circle cx="24" cy="24" r="24" fill="${esc(artPaint_(ground))}"/>${artShapes_(art)}</svg>`;
/* A PERSON'S FACE FROM DATA: a photo (`src`), a drawing (`art`), or an initial (`text`), in the one class `cls`. */
function renderFace_(f) {
  if (f.src != null) return `<img class="${esc(f.cls)}" src="${esc(f.src)}" alt="${esc(f.alt || '')}"${f.eager ? '' : ' loading="lazy"'} decoding="async">`;
  if (f.art) return `<span class="${esc(f.cls)} face-pic">${artSvg_(f.art, f.ground, f.size)}</span>`;
  return `<span class="${esc(f.cls)}">${esc(f.text || '')}</span>`;
}

/* ONE TAG, ONE SIZE: `colour` is the palette's tag number (data-tag; the name 0, the rest 1 unless said), never a literal. */
/* A `pill` is a profile's pill (`prof-tag`), coloured by its row unless it names a colour; `say` reads it aloud whole, `title` names what a "+N" hides. */
function cardTag_(t, i) {
  t = typeof t === 'string' ? { text: t } : (t || {});
  /* `base` names a chip (`chip`); `colour: false` wears none; `x` is the chip's always-shown ✕ (a Find menu's chosen path); `hidden` is read by no one (a PIN's ●). */
  const n = t.colour === false ? null : t.colour != null ? t.colour : t.pill ? null : i ? 1 : 0;
  return `<span class="${t.base ? esc(t.base) : t.pill ? 'prof-tag' : 'qtag'}${t.look ? ' ' + esc(t.look) : ''}"${n != null ? ` data-tag="${esc(n)}"` : ''}${
    t.say ? ` role="img" aria-label="${esc(t.say)}" title="${esc(t.say)}"` : t.title ? ` title="${esc(t.title)}"` : ''}${
    t.act ? ` data-do="${esc(t.act)}" role="button" tabindex="0"` : ''}${t.label ? ` aria-label="${esc(t.label)}"` : ''}${t.hidden ? ' aria-hidden="true"' : ''}${cardAttrs_(t.data)}>${cardRuns_(t.text)}${
    t.x && typeof tile_ === 'function' ? tile_({ icon: 'close', label: t.x.label || '', act: t.x.act || t.act, data: t.x.data || t.data, cls: 'chip-x' }) : ''}</span>`;
}
/* A ROW OF TAGS on its own (a Find line, a list beside a card): the same tag maker. */
/* `keep`: a menu's row of chips, drawn even empty, its chips apart as words (a reader's textContent never runs two together). */
const renderTags = (tags, look, keep) => ((tags || []).length || keep ? `<div class="qtags${look ? ' ' + esc(look) : ''}">${(tags || []).map(cardTag_).join(keep ? ' ' : '')}</div>` : '');
/* A FORM'S ONE CONTROL: input, number, date, select, textarea or check; the label is its row's left side. */
/* `draft: { surface, id }` keeps what is typed over a reload (draftAttr_/draftVal_); without it, its builder keeps it or says why (check-drafts). */
function cardControl_(c) {
  c = Object.assign({}, c || {});
  if (c.draft && typeof draftVal_ === 'function') { c.drafted = draftAttr_(c.draft.surface, c.draft.id, c.value); c.value = draftVal_(c.draft.surface, c.draft.id, c.value); }
  const id = c.id ? ` id="${esc(c.id)}"` : '', name = c.name ? ` name="${esc(c.name)}"` : '', act = c.act ? ` data-do="${esc(c.act)}"` : '';
  const more = id + name + act + (c.look ? ` class="${esc(c.look)}"` : '') + cardAttrs_(c.data) + (c.off ? ' disabled' : '') + (c.required ? ' required' : '') + (c.aria ? ` aria-label="${esc(c.aria)}"` : '') + (c.drafted ? ' ' + c.drafted : '');
  if (c.kind === 'select') return `<select${more}>${(c.options || []).map(o => { o = typeof o === 'object' ? o : { value: o, text: o };
    return `<option value="${esc(o.value)}"${cardAttrs_(o.data)}${String(o.value) === String(c.value) ? ' selected' : ''}>${esc(o.text == null ? o.value : o.text)}</option>`; }).join('')}</select>`;
  if (c.kind === 'textarea') return `<textarea rows="${Number(c.rows) || 3}" placeholder="${esc(c.placeholder || '')}"${more}>${esc(c.value || '')}</textarea>`;
  if (c.kind === 'check') return `<input type="checkbox"${c.value ? ' checked' : ''}${more}>`;
  const type = /^(number|date|time|email|tel|password|search|file)$/.test(c.kind) ? c.kind : 'text';
  return `<input type="${type}" value="${esc(c.value == null ? '' : c.value)}" placeholder="${esc(c.placeholder || '')}"${
    c.min != null ? ` min="${esc(c.min)}"` : ''}${c.max != null ? ` max="${esc(c.max)}"` : ''}${c.step != null ? ` step="${esc(c.step)}"` : ''}${more}>`;
}
/* THE ONE ANSWER BOX, four variants: text (several gaps too, one box), choices (one tile each), pad (a keypad below), essay. */
function cardAnswer_(b) {
  const at = ` data-q="${esc(b.q || '')}"`;
  if (b.variant === 'choices') return `<div class="kc-answer is-choices"${at}>${tile_((b.choices || []).map((c, i) =>
    ({ form: true, look: 'btn quiet kc-choice', label: typeof c === 'object' ? c.text : c, act: b.act || 'answer-pick', data: { i, q: b.q || '' } })))}</div>`;
  if (b.variant === 'essay') return `<div class="kc-answer is-essay"${at}>${cardControl_({ kind: 'textarea', rows: 8, name: 'essay', placeholder: b.placeholder || '' })}</div>`;
  const box = cardControl_({ kind: 'text', name: 'answer', placeholder: b.placeholder || '', aria: 'your answer', data: b.variant === 'pad' ? { pad: '1' } : null });
  return `<div class="kc-answer is-${b.variant === 'pad' ? 'pad' : 'text'}"${at}>${box}</div>`;
}
/* AN EMBED (the one exception): a tool or game draws its own controls inside the content block, from its registered maker. */
const CARD_EMBEDS = {};
function cardEmbed_(b) {
  const make = CARD_EMBEDS[b.tool];
  let inner = '';
  try { inner = make ? make(b.args || {}) : ''; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'embed:' + b.tool); }
  return `<div class="kc-embed${b.look ? ' ' + esc(b.look) : ''}" data-embed="${esc(b.tool || '')}"${cardAttrs_(b.data)}>${inner || ''}</div>`;
}
/* A TREE: headed nodes, each with its words, its tiles (`tile_` specs) and its children; `fold` folds the top level. */
function cardTree_(nodes, fold, top) {
  const one = n => { const head = `<span class="kc-tree-k">${cardRuns_(n.label)}</span>`;
    const inner = (n.text != null && n.text !== '' ? `<span class="kc-tree-v">${cardRuns_(n.text)}</span>` : '')
      + ((n.tiles || []).length ? tileWrap_(tile_(n.tiles)) : '')
      + (n.more ? `<p class="kc-tree-more">${cardRuns_(n.more)}</p>` : '') + cardTree_(n.kids, false, false);
    return fold && top ? `<details class="kc-tree-sec"><summary class="kc-h">${cardRuns_(n.label)}</summary>${inner}</details>`
      : `<li class="kc-tree-n">${head}${inner}</li>`; };
  const list = (nodes || []).map(one).join('');
  return !list ? '' : fold && top ? list : `<ul class="kc-tree">${list}</ul>`;
}
/* A GRID OF CELLS AT THEIR COLUMN AND ROW (the periodic table): each cell's parts are text. */
const cardGrid_ = b => `<div class="kc-grid-wrap"><div class="kc-grid" role="table" aria-label="${esc(b.caption || '')}">${(b.cells || []).map(c =>
  `<div class="kc-cell kc-c${Math.min(18, Number(c.col) || 1)} kc-r${Math.min(10, Number(c.row) || 1)}">${
    (c.parts || []).map((t, i) => `<span class="kc-cell-${i}">${esc(String(t == null ? '' : t))}</span>`).join('')}</div>`).join('')}</div></div>`;
/* A MENU'S CHOICES (owner, 14 Nov: one template for everything): § */
function cardChoice_(o) {
  /* A BOX'S `type` (text, date, number), its bounds, and `lines` for a text area of several lines (Ctrl+Enter answers it). */
  if (o.box) { const b = o.box;
    const at = `${b.id ? ` id="${esc(b.id)}"` : ''} class="${esc(b.cls || '')}" inputmode="${esc(b.inputmode || 'text')}" autocomplete="off"
  autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="${esc(b.enterkeyhint || 'next')}" data-1p-ignore data-lpignore="true" aria-label="${esc(b.label || '')}"${b.placeholder ? ` placeholder="${esc(b.placeholder)}"` : ''}`
      + ['min', 'max', 'step'].map(k => (b[k] != null && b[k] !== '' ? ` ${k}="${esc(String(b[k]))}"` : '')).join('');
    if (b.lines) return `<label class="counted row${o.look ? ' ' + esc(o.look) : ''}"><textarea${at} rows="${esc(String(b.lines))}">${esc(b.value || '')}</textarea></label>`;
    return answerBox_(`${at} type="${esc(b.type || 'text')}" value="${esc(b.value || '')}"`, o.look || ''); }
  const d = o.data || {};
  const attrs = (o.act ? ` data-do="${esc(o.act)}"` : '') + Object.keys(d).map(k => d[k] === true ? ` data-${esc(k)}` : ` data-${esc(k)}="${esc(String(d[k]))}"`).join('')
    + (o.label ? ` aria-label="${esc(o.label)}"` : '') + (o.pressed ? ' aria-pressed="true"' : '') + (o.disabled ? ' aria-disabled="true"' : '');
  return answerTag_(o.marked && typeof mark === 'function' ? mark(o.text) : esc(String(o.text == null ? '' : o.text)), attrs, o.look || '');
}
function cardChoices_(b) {
  const inner = (b.ask ? `<p class="book-ask">${esc(b.ask)}</p>` : '')
    + (b.rows || []).map(r => answersRow_((r.options || []).map(cardChoice_).join(''), r.look ? esc(r.look) : '', r.id ? esc(r.id) : '')).join('')
    + (b.wait && typeof loading_ === 'function' ? loading_() : '') + cardBlocks_(b.then);
  return b.id ? `<div id="${esc(b.id)}" class="kc-choices">${inner}</div>` : inner;
}
/* THE BODY BLOCKS, each with its one renderer. */
const CARD_BLOCKS = {
  text: b => [].concat(b.paras || [b.text]).filter(p => p != null && p !== '').map(p => `<p class="kc-line${b.tone ? ' ' + esc('is-' + b.tone) : ''}${b.look ? ' ' + esc(b.look) : ''}"${
    b.act ? ` data-do="${esc(b.act)}"` : ''}>${cardRuns_(p)}</p>`).join(''),
  /* A ROW OF TAGS among the lines (a tutor's quals, jobs, places), its look naming its colour family. */
  tags: b => ((b.tags || []).length ? `<div class="qtags${b.look ? ' ' + esc(b.look) : ''}">${b.tags.map(cardTag_).join('')}</div>` : ''),
  /* PHOTOS, small and square, every one shown (no "+N", owner 17 Nov); one that will not load takes itself away. */
  photos: b => { const all = (b.srcs || []).filter(Boolean);
    return all.length ? `<div class="prof-photos">${all.map(u => `<span class="prof-shot"><img src="${esc(u)}" alt="" loading="lazy" decoding="async" onerror="this.parentNode.remove()"></span>`).join('')}</div>` : ''; },
  /* A WEEK'S HOURS: one pill a day free, then the hours already taught; `say` reads every hour aloud. */
  hours: b => `<div class="prof-week prof-hours" data-avail="${esc(b.count || 0)}" aria-label="${esc(b.say || '')}">${
    (b.free || []).length ? `<p class="prof-hour-line">${b.free.map(d => cardTag_({ pill: true, look: 'prof-day', text: d })).join('<span class="prof-sep"> </span>')}</p>` : ''}${
    (b.busy || []).length ? `<p class="prof-key prof-busy">${cardRuns_(b.busyLabel || text_('already-teaching'))} ${b.busy.map(d => cardTag_({ pill: true, look: 'prof-day', text: d })).join('<span class="prof-sep"> </span>')}</p>` : ''}</div>`,
  figure: b => { const p = cardPic_(b); return p ? `<figure class="kc-fig">${p}${b.caption ? `<figcaption>${cardRuns_(b.caption)}</figcaption>` : ''}</figure>` : ''; },
  table: b => `<table class="kc-table">${(b.head || []).length ? `<thead><tr>${b.head.map(h => `<th>${cardRuns_(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${
    (b.rows || []).map(r => `<tr>${r.map(c => `<td>${cardRuns_(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`,
  /* A LIST: plain items, or label–value facts (the one `row` look). */
  list: b => { const items = b.items || [];
    if (items.some(x => x && typeof x === 'object' && 'label' in x)) return items.map(x =>
      `<div class="row"><span class="k">${esc(x.label)}</span><span class="v${x.tone ? ' ' + esc(x.tone) : ''}">${cardRuns_(x.value)}</span></div>`).join('');
    const tag = b.ordered ? 'ol' : 'ul';
    return items.length ? `<${tag} class="kc-list${b.look ? ' ' + esc(b.look) : ''}">${items.map(x => `<li>${cardRuns_(x)}</li>`).join('')}</${tag}>` : ''; },
  answer: cardAnswer_,
  formRow: b => `<label class="kc-form-row"><span class="k">${cardRuns_(b.label || '')}</span>${cardControl_(b.control)}</label>`,
  embed: cardEmbed_,
  /* A HEADED SECTION: a small heading, then any blocks. */
  section: b => `<section class="kc-sec${b.look ? ' ' + esc(b.look) : ''}"${b.live ? ' aria-live="polite"' : ''}>${b.head ? `<h4 class="kc-h${b.headLook ? ' ' + esc(b.headLook) : ''}">${cardRuns_(b.head)}</h4>` : ''}${(b.blocks || []).map(cardBlock_).join('')}</section>`,
  tree: b => cardTree_(b.nodes, !!b.fold, true),
  /* A TIMELINE (history topics, the one timeline renderer): a dated stop a row down one line, each drawn in after the one above (style.css `.kc-tl`). */
  timeline: b => ((b.events || []).length ? `<ol class="kc-tl"${b.label ? ` aria-label="${esc(b.label)}"` : ''}>${b.events.map(e => `<li class="kc-tl-stop"><span class="kc-tl-when">${esc(e.when || '')}</span>`
    + `<div class="kc-tl-what"><b>${cardRuns_(e.title)}</b>${e.text ? `<p>${cardRuns_(e.text)}</p>` : ''}${e.who ? `<p class="kc-tl-who">${cardRuns_(e.who)}</p>` : ''}</div></li>`).join('')}</ol>` : ''),
  grid: cardGrid_,
  /* A WAIT is `loading_()` and nothing else; `look` and `data` name a region its redraw finds (`.err-body`). */
  choices: cardChoices_,
  /* A WHOLE CARD AMONG THE BLOCKS (Make an account inside Find's menu): its spec, drawn by `renderCard`. */
  card: b => (b.spec ? renderCard(b.spec) : ''),
  /* A ROW OF TILES among the lines (`tile_` specs), its look added to `tile-row`. */
  tiles: b => ((b.tiles || []).length ? tileWrap_(tile_(b.tiles), b.look ? esc(b.look) : '') : ''),
  /* A PERSON ON ONE LINE: their face (`personFace_`'s who and options), name, @handle, then their tiles. */
  who: b => `<div class="row${b.look ? ' ' + esc(b.look) : ''}">${b.face && typeof personFace_ === 'function' ? personFace_(b.face.who || {}, b.face.o || {}) : ''}<p class="${esc(b.whoLook || 'who')}"><b>${cardRuns_(b.name)}</b>${
    b.handle ? `<span class="prof-handle">@${esc(b.handle)}</span>` : ''}</p>${(b.tiles || []).length ? tileWrap_(tile_(b.tiles)) : ''}</div>`,
  /* ONE TICK BOX in a labelled cell (an hour on a week you tick): `control` is `cardControl_`'s. */
  tickCell: b => `<label class="${esc(b.look || '')}"${b.label ? ` aria-label="${esc(b.label)}"` : ''}>${cardControl_(Object.assign({ kind: 'check' }, b.control || {}))}</label>`,
  /* A FILE SHOWN IN PLACE: a page framed, a clip with its controls, or a picture; `look` names its size. */
  media: b => { const u = String(b.src || ''), look = b.look ? ` class="${esc(b.look)}"` : '', name = esc(b.title || '');
    /* A PICTURE MAY ALSO BE A TYPED http LINK OR ONE THIS PHONE JUST CROPPED (`data:image/`). */
    if (!/^(https:|data\/|docs\/|[\w-]+\.(png|jpe?g|svg|webp|gif)$)/i.test(u) && !(b.kind === 'image' && /^(http:|data:image\/)/i.test(u))) return '';
    if (b.kind === 'video') return `<video${look} src="${esc(u)}" controls playsinline preload="metadata"></video>`;
    if (b.kind === 'image') return `<img${look} src="${esc(u)}" alt="${name}"${b.async ? ' decoding="async"' : ''}>`;
    return `<iframe${look} src="${esc(u)}" title="${name}" loading="lazy" allow="${esc(b.allow || 'encrypted-media; picture-in-picture')}"${b.full ? ' allowfullscreen' : ''}></iframe>`; },
  /* A DRAWING AS DATA: shapes `{ el, a: { attrs }, text, kids }`, each a vector element of a fixed set, every value escaped. */
  drawing: b => cardDraw_(b.node),
  /* A STATUS LINE (what was saved, what went wrong, what is waiting): its room kept from the start; `saved` marks the one a form's autosave writes to. */
  status: b => `<p class="note${b.saved ? ' me-said' : ''}${b.look ? ' ' + esc(b.look) : ''}"${b.id ? ` id="${esc(b.id)}"` : ''}${b.live ? ' aria-live="polite"' : ''}>${cardRuns_(b.text == null ? '' : b.text)}</p>`,
  wait: b => `<div class="kc-wait${b.look ? ' ' + esc(b.look) : ''}"${cardAttrs_(b.data)}${b.on ? ' aria-busy="true"' : ''}>${b.on && typeof loading_ === 'function' ? loading_() : ''}</div>`,
};
/* THE PADLOCK a shut card wears, first inside it. */
const cardLockMark_ = () => `<span class="card-lock" title="Locked" aria-label="Locked">${typeof tileIcon_ === 'function' ? tileIcon_('lock') : ''}</span>`;
const CARD_DRAW_ELS = /^(svg|g|defs|clipPath|path|rect|line|circle|ellipse|polygon|polyline|text|figure|div|image)$/;
function cardDraw_(n) {
  if (n == null) return '';
  if (Array.isArray(n)) return n.map(cardDraw_).join('');
  if (typeof n !== 'object' || !CARD_DRAW_ELS.test(n.el)) return '';
  const a = n.a || {}, attrs = Object.keys(a).filter(k => /^[a-zA-Z][\w:-]*$/.test(k) && !/^on/i.test(k) && a[k] != null && a[k] !== '')
    .map(k => ` ${k}="${esc(String(a[k]))}"`).join('');
  /* `inner`: a drawing another maker drew already (a question's diagram, the pen's ink), laid inside as it is. */
  return `<${n.el}${attrs}>${n.text != null ? esc(String(n.text)) : ''}${n.inner || ''}${cardDraw_(n.kids)}</${n.el}>`;
}
function cardBlock_(b) {
  if (b == null || b === '') return '';
  if (typeof b === 'string') return CARD_BLOCKS.text({ text: b });
  const r = CARD_BLOCKS[b.type];
  try { return r ? r(b) : ''; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'block:' + b.type); return ''; }
}
/* BLOCKS IN A ROW (a choices block's `then`, a menu's repaint): each through `cardBlock_`. */
const cardBlocks_ = bs => [].concat(bs == null ? [] : bs).map(cardBlock_).join('');
/* THE CARD. Its tile row is the one round row: the first tile leads, Message and Save stand beside it, every other tile beside them (nothing behind a More). */
function renderCard(spec) {
  spec = spec || {};
  if (spec.inline) return cardLetter_(spec);
  const kind = spec.kind || 'thing', name = spec.name || ((spec.tags || [])[0] && ((spec.tags[0].text != null ? spec.tags[0].text : spec.tags[0]))) || '';
  /* THE NAME IS SAID ONCE: a facet tag that says the first tag again is left out. */
  const said = t => String(typeof t === 'object' ? t.text : t).trim().toLowerCase();
  const tags = (spec.tags || []).filter(t => t != null && t !== '' && (typeof t !== 'object' || (t.text != null && t.text !== '')))
    .filter((t, i, all) => !i || said(t) !== said(all[0]));
  const body = (spec.body || []).map(cardBlock_).join('');
  const x = Object.assign({}, spec.item || {}, { kind, key: spec.key || '', row: spec.row || { title: typeof name === 'string' ? name : '' } });
  /* THE KIND'S OWN TILES (read aloud, admin, the padlock, its extras off `item`) join the spec's, through the one row maker. */
  let row = '';
  /* `toolRow: { key }` (a question): every tile shown, nothing behind a More, the row its part's tool row (`.qt-row`). */
  const tr = spec.toolRow ? { look: 'qt-row', key: spec.toolRow.key || '' } : null;
  /* `cut` (a card holding a tool, cardOfItem_'s `tool`): its laid-out lines after the body, its open form (`kc-form`), its lifted tiles in the row. */
  const cut = spec.cut || {}, lines = body + (cut.lines || '');
  try { row = typeof kcActRow_ === 'function' ? kcActRow_(x, '', tile_(spec.tiles || []) + (cut.tiles || ''), tr) : tileWrap_(tile_(spec.tiles || []), 'kc-row'); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'card:tiles'); }
  const cls = 'card fc kc kc-' + kind + (spec.look ? ' ' + spec.look : '') + (spec.off ? ' is-off' : '');
  return `<div class="${esc(cls)}"${spec.id ? ` id="${esc(spec.id)}"` : ''}${spec.card ? ` data-card="${esc(spec.card)}"` : ''}${spec.shape ? ` data-shape="${esc(spec.shape)}"` : ''}${cardAttrs_(spec.data)} aria-label="${esc(typeof name === 'string' ? name : '')}">`
    + `<div class="kc-pic">${cardPic_(spec.picture)}</div><div class="kc-head"></div>`
    + `<div class="kc-tags"${spec.tagsId ? ` id="${esc(spec.tagsId)}"` : ''}>${renderTags(tags, spec.tagLook, spec.tagsKeep)}${(spec.tagRows || []).map(CARD_BLOCKS.tags).join('')}</div>`
    + `<div class="kc-lines">${lines || (spec.empty ? `<p class="kc-line kc-empty">${esc(spec.empty)}</p>` : '')}</div>${cut.form ? `<div class="kc-form">${cut.form}</div>` : ''}`
    + `<div class="kc-act">${row}</div></div>`;
}
/* THE CARD IN A LETTER (owner, 16 Nov: one card maker everywhere — the Sunday email, every booking email, the backend's copy by tools/cards-gen.js). */
/* `inline: 'text'` writes the kind's lines as plain text; an ink object (the email's colours, `hues` its tag inks) writes a table with every style inline, */
/* as mail clients read no stylesheet. The lines, labels, sizes and styles are the kind's `card.letter` in kinds.json and nowhere else. */
const cardLetterOf_ = kind => (((ITEM_KINDS.kinds[kind] || {}).card || {}).letter || {});
/* THE SITE CARD'S PARTS IN ITS ORDER (owner, 23 Nov: EVERY EMAIL CARD IS THE SITE CARD): a question's `card.question.parts.order`; a record's */
/* (a booking) its name, then its tags, pills, status and sum, each once. The email draws these and no list of its own. */
function cardSiteParts_(kind) {
  const c = (ITEM_KINDS.kinds[kind] || {}).card || {}, R = c.record || {};
  if (c.question && c.question.parts) return c.question.parts.order.slice();
  return [...new Set([].concat(R.name ? ['name'] : [], c.tags || [], R.pills || [], R.status ? [R.status.fact] : [], R.sum || []))];
}
/* THE PARTS A LETTER SAYS: the site's, in its order, those its `words` say how (`use`: only those of one of its `rows`). */
function cardLetterParts_(kind, use) {
  const L = cardLetterOf_(kind), only = use ? (L.rows || {})[use] || [] : null;
  return cardSiteParts_(kind).filter(p => p !== 'say' && (L.words || {})[p] && (!only || only.indexOf(p) >= 0));
}
/* THE MASTER DECIDES CARD FIELDS (unify job J): the row a letter is written from carries the fields its parts `need`, read from `src`, and no list of our own. */
/* `use` names one of the letter's `rows` (fewer parts); a field the row lacks is read by its `aliases`. */
function cardLetterRow_(kind, src, use) {
  const L = cardLetterOf_(kind), s = src || {}, al = L.aliases || {};
  const want = [...new Set(cardLetterParts_(kind, use).flatMap(p => L.words[p].need || []))];
  return Object.assign({}, ...want.map(f => ({ [f]: s[f] !== undefined ? s[f] : s[[].concat(al[f] || []).find(a => s[a] !== undefined)] })));
}
/* A KIND'S FACT LINES (kinds.json `card.fields.list`): each `label` with the row's `f`, in that order, an empty one left out. */
const cardFieldsOf_ = (kind, row) => ((((ITEM_KINDS.kinds[kind] || {}).card || {}).fields || {}).list || [])
  .map(x => ({ label: x.label, value: (row || {})[x.f] })).filter(x => x.value || x.value === 0);
/* A KIND'S LINES FROM ITS ROW, each {part, line} through the words file, in the site card's order; a price part (`money.*`) is never said to a child */
/* (`see.kid` or a kid role) or with `see.prices === false`. `use`: one of the letter's `rows`. */
function cardLetterLines_(kind, row, see, use) {
  const L = cardLetterOf_(kind), r = row || {}, s = see || {}, str = v => String(v == null ? '' : v).trim();
  const kid = s.kid === true || s.child === true || [].concat(s.roles || [], s.role || []).join(',').split(/[,\s]+/).some(v => /^(kid|child|student)$/i.test(v));
  return cardLetterParts_(kind, use).map(p => {
    const l = L.words[p];
    if (/^money\./.test(p) && (kid || s.prices === false)) return null;
    const said = {}, as = l.as || {};
    (l.need || []).forEach(f => { const v = str(r[f]); if (!v || (l.money && !isFinite(Number(r[f])))) return;
      said[as[f] || f] = l.date ? fmtDate_(r[f], f) : l.money ? fmtMoney_(r[f]) : v; });
    const got = (l.need || []).map(f => said[as[f] || f]).filter(Boolean);
    const line = l.word && got.length === (l.need || []).length ? text_(l.word, said) : l.alone === 'any' ? got[0] || '' : l.alone ? said[l.alone] || '' : '';
    return line ? { part: p, line: line } : null;
  }).filter(Boolean);
}
function cardLetter_(spec) {
  const L = cardLetterOf_(spec.kind), I = spec.inline, cut = spec.cut || {};
  if (I === 'text') return cardLetterLines_(spec.kind, spec.row, spec.see, spec.use).map(l => (L.bullet || '') + l.line).join('\n');
  const Z = Object.assign({}, L.sizes, I);
  const st = (k, more) => String((L.styles || {})[k] || '').replace(/\{(\w+)\}/g, (m, n) => { const v = more && n in more ? more[n] : Z[n]; return v == null ? '' : v; });
  const cl = k => ((L.cls || {})[k] ? ` class="${esc(L.cls[k])}"` : '');
  const p = (k, inner, more) => `<p${cl(k)} style="${st(k, more)}">${inner}</p>`;
  const tag = t => { t = typeof t === 'object' ? t : { text: t }; const hue = (I.hues || {})[t.colour];
    return `<span${cl('tag')} style="${st('tag', { hue: hue || I.dim, edge: hue ? '' : ' ' + I.chip })}">${cardRuns_(t.text).replace(/ /g, ' ')}</span>`; };
  /* A FACT's value is `cut` when the email's own sanitiser laid it out already (an answer's power or fraction), else its runs; `box` draws it in the answer box. */
  const fact = x => p('label', cardRuns_(x.label)) + (x.box
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${esc(I.box || '')}" style="${st('box')}">${x.cut != null ? x.cut : cardRuns_(x.value)}</td></tr></table>`
    : p('value', x.cut != null ? x.cut : cardRuns_(x.value)));
  /* `html`: markup the email's own sanitiser laid out already (a question's words), in its style's div. */
  const one = b => (b && b.type === 'text' ? p(b.look || 'line', cardRuns_(b.text), { tone: b.tone }) : b && b.type === 'list' ? (b.items || []).map(fact).join('')
    : b && b.type === 'html' ? (b.html ? `<div style="${st(b.look || 'line')}">${b.html}</div>` : '') : cardBlock_(b));
  /* A BLOCK THAT IS ONE OF THE CARD'S PARTS (`part`, kinds.json `card.question.parts`) says so in a comment, which tools/one-question-card.js reads. */
  const mark = n => (n ? `<!--part:${esc(n)}-->` : '');
  const block = b => { const h = one(b); return h && b && b.part ? mark(b.part) + h : h; };
  const tags = (spec.tags || []).filter(t => t != null && t !== '');
  /* PICTURE, NAME, TAGS, LINES: the laid-out lines (`cut.lines`, the library's question) lead, the body's lines follow. */
  const parts = { pic: cut.pic ? mark(spec.marked && 'pic') + `<div style="${st('pic')}">${cut.pic}</div>` : '', head: spec.name ? mark(spec.marked && 'head') + p('head', cardRuns_(spec.name)) : '',
    tags: tags.length ? mark(spec.marked && 'tags') + `<div style="${st('tags')}">${tags.map(tag).join(' ')}</div>` : '', lines: (cut.lines || '') + (spec.body || []).map(block).join('') };
  return `<table role="presentation" class="kc" width="100%" cellpadding="0" cellspacing="0" border="0" style="${st('card')}"><tr><td style="${st('cell')}">`
    + ['pic', 'head', 'tags', 'lines'].map(k => parts[k]).join('') + '</td></tr></table>';
}
/* EACH CARD KIND'S BUILDER: `cardKind_('kind', x => spec)`; findCard draws a registered kind from its spec (check-card-spec runs each one). */
const CARD_KINDS = {};
function cardKind_(kind, build) { CARD_KINDS[kind] = build; }
function cardOfKind_(x) {
  let spec = null;
  try { spec = CARD_KINDS[x.kind](x); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'spec:' + x.kind); }
  return spec ? renderCard(Object.assign({ kind: x.kind, key: x.key, row: x.row, item: x }, spec)) : '';
}
/* A QUESTION'S TABLE SCROLLS IN A BOX OF ITS OWN and stays a real table: as `display:block` Safari laid the iPad's isotope table out a row out of line (13 Nov). */
const qTables_ = h => String(h).replace(/<table\b/gi, '<div class="q-tscroll"><table').replace(/<\/table>/gi, '</table></div>');
/* THE BOOKING PAPER (one master template): a receipt's rows, controls, week and roster are drawn here from data the booking hands over. */
/* THE SIX BK-* CELLS of a paper row (n, k, v, m, r, t: drawn HTML); `kTag` stands for the label cell, `tail` follows the cells. */
const paperCells_ = (cls, c, kTag, tail) => `<div class="bk-row ${cls}"><span class="bk-n">${c[0]}</span>${kTag || `<span class="bk-k">${c[1]}</span>`}`
  + `<span class="bk-v">${c[2]}</span><span class="bk-m">${c[3]}</span><span class="bk-r">${c[4]}</span><span class="bk-t">${c[5]}</span>${tail || ''}</div>`;
function paperRow_(r) {
  const cls = [r.blank ? 'is-blank' : '', r.day ? 'bk-day' : '', r.end ? 'bk-end' : '', r.free ? 'bk-free' : '', r.wide ? 'is-wide' : '',
    r.strip ? 'bk-wk' : '', r.strip && r.shut ? 'is-shut' : '', r.strip && r.off ? 'is-off' : '', r.tally ? 'bk-tally' : '', r.cls || ''].filter(Boolean).join(' ');
  const has = v => v != null && String(v).trim() !== '';
  const value = r.tick !== undefined
    ? `${has(r.v) ? `<span class="bk-when">${esc(r.v)}</span> ` : ''}<span class="bk-tick${r.tick ? ' on' : ''}" role="img" aria-label="${r.tick ? 'done' : 'not yet'}">✓</span>`
    : r.strip ? r.strip : r.sel ? r.sel : r.tally ? r.tally
    : r.hourCells ? `<span class="bk-hrs">${r.hourCells.map(h => `<span class="bk-hr${h.on ? ' on' : ''}">${esc(h.h)}</span>`).join('')}</span>`
    : r.dates ? `<span class="bk-dates">${esc(r.v)}</span>` : esc(r.v);
  const bare = (!r.id || !!r.open || !!r.strip) && !has(r.mul) && !has(r.rate) && !has(r.total);
  const heads = !!r.open || !!r.strip || !!r.tally;
  return paperCells_(esc(cls) + (bare ? ' is-bare' : '') + (heads ? ' is-head' : ''),
    [esc(r.n), esc(r.k), heads && r.dash != null && String(r.v) === r.dash ? '' : value, esc(r.mul), esc(r.rate), esc(r.total)],
    r.ctl && r.sel ? `<label for="${esc(r.ctl)}" class="bk-k">${esc(r.k)}</label>` : '', r.open || '')
    + (r.say ? `<p class="bk-say${r.say.warn ? ' is-warn' : ''}">${esc(r.say.text)}</p>` : '');
}
const paperTotal_ = (k, t, cls) => paperCells_('rc-total' + (cls ? ' ' + esc(cls) : ''), ['', esc(k), '', '', '', esc(t)]);
const paperHead_ = () => paperCells_('is-cols', ['', '', '', '×', '+/h', '=']);
/* `rows`, `before`, `roster` and `foot` arrive already drawn by these same paper blocks. */
function paperDoc_(r) {
  const head = !!(r.cols && (r.rows || []).length);
  const lines = (r.lines || []).filter(Boolean).length && typeof qtag_ === 'function'
    ? `<div class="qtags qcard-tags">${(r.lines || []).map((l, i) => (l ? qtag_(esc(l), ` data-tag="${[6, 9, 4][i] || 0}"`) : '')).join('')}</div>` : '';
  return `<div class="rc${r.done ? ' is-done' : ''}" data-state="receipt${r.done ? ' done' : ''}"><div class="rc-head">${lines}</div>${head ? '' : '<div class="rc-rule"></div>'}`
    + `<div class="bk">${head ? paperHead_() : ''}${(r.rows || []).join('')}${r.before || ''}${r.noTotal ? '' : paperTotal_(r.totalLabel || 'Cost', r.total || '')}`
    + (r.more || []).map(m => paperTotal_(m.k, m.t, 'rc-more' + (m.cls ? ' ' + m.cls : ''))).join('')
    + `${r.moreSay ? `<p class="bk-say rc-money-say">${esc(r.moreSay)}</p>` : ''}</div>`
    + `${r.roster ? '<div class="rc-rule"></div>' + r.roster : ''}<div class="rc-rule"></div>${r.foot || ''}${r.ref ? `<p class="rc-ref">${esc(r.ref)}</p>` : ''}</div>`;
}
const paperRoster_ = b => `<div class="rost">${(b.slots || []).map(sl => `<div class="rost-slot${sl.filled ? ' on' : ''}${sl.tutor ? ' tut' : ''}"><span class="rost-pic">${
  sl.filled ? (sl.face || '') : '<span class="rost-plus">+</span>'}</span><span class="rost-name">${esc(sl.said)}</span>${sl.filled ? `<span class="rost-role">${esc(sl.role)}</span>` : ''}</div>`).join('')}</div>`;
/* A BAR'S LENGTH IS ONE OF ELEVEN STEPS (`data-f`, 0–100 by tens), a class in style.css rather than a style written here. */
const paperWhenCould_ = b => `<div class="wc">${(b.slots || []).map(s => `<div class="wc-row${s.all ? ' is-all' : ''}"><span class="wc-n">${esc(s.n)}/${esc(b.people)}</span>`
  + `<span class="wc-slot">${esc(s.slot)}</span><i data-f="${esc(s.f)}"></i></div>`).join('')}</div>`;
const paperHours_ = cols => `<div class="slot-row slot-head" aria-hidden="true"><span class="slot-day"></span><div class="slot-hours">${cols.map(h => `<span class="slot-hh">${esc(h)}</span>`).join('')}</div></div>`;
/* A WEEK: `days` [{ label, cells }], each day's cells already drawn by the caller's own cell maker. */
const paperWeek_ = b => `<div class="slot-grid">${paperHours_(b.cols || [])}${(b.days || []).map(d => `<div class="slot-row"><span class="slot-day">${esc(d.label)}</span><div class="slot-hours">${d.cells || ''}</div></div>`).join('')}</div>`;
const paperStrip_ = b => (b.head === 'ruler' ? `<span class="wk-hh wk-rule" aria-hidden="true">${esc(b.from)} – ${esc(b.to)}</span>`
  : b.head === 'cols' ? `<span class="wk-hh" aria-hidden="true">${(b.cols || []).map(h => `<span class="slot-hh">${esc(h)}</span>`).join('')}</span>` : '')
  + `<span class="slot-hours">${b.cells || ''}</span>`;
/* THE PAPER'S CONTROLS: a select (`face` lays words over it), a typed box, or a settled answer as text. */
function paperSelect_(b) {
  const opt = o => `<option value="${esc(o.value)}"${o.on ? ' selected' : ''}${o.off ? ' disabled' : ''}>${esc(o.text)}</option>`;
  const sel = `<select class="bk-sel" id="${esc(b.id)}" data-do="book-set" data-step="${esc(b.step)}"${b.off ? ' disabled' : ''} aria-label="${esc(b.aria)}">${(b.options || []).map(opt).join('')}</select>`;
  return b.face == null ? sel : `<span class="bk-face${b.set ? ' is-set' : ''}"><span class="bk-said" aria-hidden="true">${esc(b.face)}</span>${sel}</span>`;
}
const paperSet_ = b => `<span class="bk-set">${esc(b.text)}</span>`;
const paperInput_ = b => `<input class="bk-in${b.wide ? ' bk-in-l' : ''}"${b.id ? ` id="${esc(b.id)}"` : ''}${b.act ? ` data-do="${esc(b.act)}"` : ''}${b.field ? ` data-field="${esc(b.field)}"` : ''} type="${b.kind === 'number' ? 'number' : 'text'}"`
  + `${b.kind === 'number' ? ' inputmode="decimal" min="0" max="100" step="1"' : ''} value="${esc(b.value == null ? '' : b.value)}" placeholder="${esc(b.placeholder || '')}"${b.off ? ' disabled' : ''} aria-label="${esc(b.aria || '')}">`;
const paperNote_ = b => `<p class="note${b.look ? ' ' + esc(b.look) : ''}"${b.live ? ' aria-live="polite"' : ''}${b.alert ? ' role="alert"' : ''}>${cardRuns_(b.text)}</p>`;
const paperLinks_ = b => `<p class="note policy-links">${esc(b.say || '')}${(b.links || []).map(l => `<a href="${esc(l.href)}" data-do="file-view" target="_blank" rel="noopener">${esc(l.text)}</a>`).join(' · ')}</p>`;
const paperBox_ = b => `<div${b.id ? ` id="${esc(b.id)}"` : ''} class="${esc(b.look || '')}">${b.inner || ''}</div>`;
/* A PLAIN BOX (rule 1.1, one template): a `div`, `p`, `ul` or `span` with its id, class and flags; `text` as runs, then `parts` — a drawn string kept as is, a block drawn. */
const BOX_TAGS = { div: 1, p: 1, ul: 1, span: 1 };
const cardBox_ = b => { const t = BOX_TAGS[b.tag] ? b.tag : 'div';
  return `<${t}${b.id ? ` id="${esc(b.id)}"` : ''}${b.look ? ` class="${esc(b.look)}"` : ''}${b.hidden ? ' hidden' : ''}${b.live ? ` role="${esc(b.live)}"` : ''}${b.label ? ` aria-label="${esc(b.label)}"` : ''}>`
    + (b.text != null ? cardRuns_(b.text) : '') + [].concat(b.parts || []).map(x => (typeof x === 'string' ? x : cardBlock_(x))).join('') + `</${t}>`; };
CARD_BLOCKS.box = cardBox_;
Object.assign(CARD_BLOCKS, { paperRow: paperRow_, paperDoc: paperDoc_, paperRoster: paperRoster_, paperWhenCould: paperWhenCould_, paperWeek: paperWeek_,
  paperStrip: paperStrip_, paperSelect: paperSelect_, paperSet: paperSet_, paperInput: paperInput_, paperNote: paperNote_, paperLinks: paperLinks_, paperBox: paperBox_ });
/* A BOOKING AS A PICTURE: the paper's own markup (`xml`, already serialised) laid in an SVG at the screen's width; `css` is the page's own rules. */
const paperSnap_ = b => `<svg xmlns="http://www.w3.org/2000/svg" width="${Number(b.cw) || 1}" height="${Number(b.ch) || 1}" viewBox="0 0 ${(Number(b.cw) || 1) / (Number(b.k) || 1)} ${(Number(b.ch) || 1) / (Number(b.k) || 1)}">`
  + `<style>${String(b.css || '').replace(/<\//g, '<\\/')}</style><foreignObject x="0" y="0" width="${Number(b.w) || 1}" height="${Number(b.h) || 1}">${b.xml || ''}</foreignObject></svg>`;
/* TURNING A REQUEST DOWN asks why, in one optional line. */
const paperWhy_ = b => `<form class="req-why" data-id="${esc(b.id)}"><label>Why not? ${formInput_('name="why" maxlength="200" placeholder="optional, one line" autocomplete="off"')}</label>${tile_({ form: true, submit: true, label: 'Decline' })}</form>`;
Object.assign(CARD_BLOCKS, { paperSnap: paperSnap_, paperWhy: paperWhy_ });
/* A SETTINGS FORM'S PARTS (me-shelves): a control, a captioned field, a tick, a several-of-a-list and a plain group, all from data. */
/* ATTRIBUTES ARE DATA: { name: value | true }, each escaped; an `on…` handler is never written. */
const kcfAttrs_ = a => Object.keys(a || {}).filter(k => /^[a-z][\w:-]*$/i.test(k) && !/^on/i.test(k) && a[k] != null && a[k] !== false)
  .map(k => (a[k] === true ? ` ${k}` : ` ${k}="${esc(String(a[k]))}"`)).join('');
/* ATTRIBUTE TEXT AS DATA (form.js's makers take `type="x" data-me="k" checked`): each name once, the first kept as a tag keeps it, its value unescaped so kcfAttrs_ escapes it once. */
const CARD_UNESC_ = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const cardUnesc_ = v => String(v).replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e) => (e[0] === '#'
  ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : CARD_UNESC_[e.toLowerCase()]));
function cardAttrsOf_(s) {
  if (s && typeof s === 'object') return s;
  const a = {}, re = /([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g; let m;
  while ((m = re.exec(String(s || '')))) { if (Object.prototype.hasOwnProperty.call(a, m[1])) continue;
    const v = m[2] != null ? m[2] : m[3] != null ? m[3] : m[4]; a[m[1]] = v == null ? true : cardUnesc_(v); }
  return a;
}
const kcfOpts_ = opts => (opts || []).map(o => (o && o.group != null ? `<optgroup label="${esc(o.group)}">${kcfOpts_(o.options)}</optgroup>`
  : `<option value="${esc(o.value == null ? '' : o.value)}"${cardAttrs_(o.data)}${o.on ? ' selected' : ''}${o.off ? ' disabled' : ''}>${esc(o.text == null ? (o.value == null ? '' : o.value) : o.text)}</option>`)).join('');
/* `textarea` holds its `value` as text; a select's `inner` is options another maker drew already (a game picker's). */
const kcfControl_ = b => (b.tag === 'select' ? `<select${kcfAttrs_(b.attrs)}>${b.options ? kcfOpts_(b.options) : (b.inner || '')}</select>` : b.tag === 'textarea' ? `<textarea${kcfAttrs_(b.attrs)}>${esc(b.value == null ? '' : b.value)}</textarea>` : `<input${kcfAttrs_(b.attrs)}>`);
/* `parts`, in order: blocks, or parts another maker drew already (a string), nested lists flattened. */
const kcfPart_ = x => (Array.isArray(x) ? x.map(kcfPart_).join('') : x == null || x === false ? '' : typeof x === 'string' ? x : cardBlock_(x));
const kcfKids_ = b => (b.text != null ? cardRuns_(b.text) : '') + cardBlocks_(b.blocks) + (b.inner || '') + kcfPart_(b.parts || []);
const kcfField_ = b => `<label class="field${b.look ? ' ' + esc(b.look) : ''}"${kcfAttrs_(b.attrs)}>${
  b.caps ? b.caps.map((c, i) => `<span class="${i ? 'q-cap-cert' : 'q-cap-std'}">${esc(c)}</span>`).join('') : b.cap != null && b.cap !== '' ? `<span>${esc(b.cap)}</span>` : ''}${kcfKids_(b)}</label>`;
const kcfTickB_ = b => `<label class="check${b.look ? ' ' + esc(b.look) : ''}"${kcfAttrs_(b.labelAttrs)}><input${kcfAttrs_(Object.assign({ type: 'checkbox' }, b.attrs))}><span class="box"></span><span>${cardRuns_(b.text)}</span></label>`;
const kcfMany_ = b => `<div class="field many"><span class="many-cap">${esc(b.label)}</span>${kcfControl_(b.hidden || {})}<details class="many-d" data-many="${esc(b.key)}"${b.open ? ' open' : ''}>`
  + `<summary class="many-sum${b.said ? '' : ' is-unset'}" aria-label="${esc(b.label + ': ' + (b.said || 'nothing chosen'))}">${esc(b.said || text_('tap-to-choose'))}</summary>`
  + `<div class="many-list" role="group" aria-label="${esc(b.label)}">${(b.ticks || []).map(kcfTickB_).join('')}</div></details></div>`;
/* A GROUP: a div (or a span, a line, a label, a heading between cards, or a fold and its summary) with its class and attributes, holding text, blocks, tiles, or parts already drawn here. */
/* `img` is void (its attrs only); an `a` or `img` whose href or src is a script is not written at all. */
const kcfGroup_ = b => { const tag = /^(span|p|details|summary|label|h2|h3|h4|section|b|i|small|sup|mark|ol|ul|li|a|img)$/.test(b.tag) ? b.tag : 'div';
  if (/^\s*(javascript|vbscript):/i.test(String((b.attrs || {}).href || (b.attrs || {}).src || ''))) return '';
  const open = `<${tag}${b.id ? ` id="${esc(b.id)}"` : ''}${b.look != null ? ` class="${esc(b.look)}"` : ''}${kcfAttrs_(b.attrs)}>`;
  if (tag === 'img') return open;
  return `${open}${kcfKids_(b)}${
    (b.tiles || []).length && typeof tile_ === 'function' ? tile_(b.tiles) : ''}</${tag}>`; };
Object.assign(CARD_BLOCKS, { control: kcfControl_, field: kcfField_, tick: kcfTickB_, many: kcfMany_, group: kcfGroup_ });
/* THE ONE FOLD (owner, 25 Nov): a line that opens in place to show what is under it -- a <details> whose summary is `head` (a block: a tick, a
   text), any card's. Its open state is kept by `key` across a redraw (CARD_OPEN), so a card drawn again opens where it was. Plain row, thin line: .kc-fold. */
const CARD_OPEN = new Set();
const cardFold_ = (key, head, blocks, look) => { const kids = [].concat(blocks || []).filter(Boolean);
  return { type: 'group', tag: 'details', look: 'kc-fold' + (look ? ' ' + look : ''), attrs: { 'data-fold-key': key, open: CARD_OPEN.has(key) },
    blocks: [{ type: 'group', tag: 'summary', look: 'kc-fold-sum', blocks: [head] }].concat(kids.length ? [{ type: 'group', look: 'kc-fold-in', blocks: kids }] : []) }; };
if (typeof document !== 'undefined') document.addEventListener('toggle', e => { const el = e.target, k = el && el.getAttribute && el.getAttribute('data-fold-key');
  if (k) { if (el.open) CARD_OPEN.add(k); else CARD_OPEN.delete(k); } }, true);
/* A TICK ON THE LINE IS THE TICK, NOT THE FOLD: a label inside a summary would open the fold and leave the box as it was, so here it ticks (a `change`, as a tap makes). */
if (typeof document !== 'undefined') document.addEventListener('click', e => { const lab = e.target && e.target.closest && e.target.closest('.kc-fold-sum label.check');
  const inp = lab && lab.querySelector('input'); if (!inp || inp.disabled) return;
  e.preventDefault(); inp.checked = !inp.checked; inp.dispatchEvent(new Event('change', { bubbles: true })); }, true);
/* THE ONE TAG MAKER for a finder's menu (owner, 13 Nov): every answer, Doesn't matter, and the sign-in step's tags. `inner` is markup, escaped already. */
const answerTag_ = (inner, attrs, cls) => `<div class="counted row tap${cls ? ' ' + cls : ''}" role="button" tabindex="0"${attrs || ''}><span class="k">${inner}</span></div>`;
/* A MENU'S ROW OF TAGS, and the blank tag typed on (the sign-in name); `id` names a slot something else fills, Google's button. */
const answersRow_ = (tags, cls, id) => `<div${id ? ` id="${id}"` : ''} class="answers${cls ? ' ' + cls : ''}">${tags || ''}</div>`;
const answerBox_ = (attrs, cls) => `<label class="counted row${cls ? ' ' + cls : ''}"><input${attrs || ''}></label>`;
/* THE MESSAGE BLOCKS (owner, 14 Nov: one template for everything): a conversation's chips, attachments, bubbles and composer, and Check uploads' report, drawn from data. */
const msgAtt_ = b => ((b.items || []).length ? `<div class="msg-att">${b.items.map(a => a.kind === 'image'
  ? `<a class="msg-pic" href="${esc(a.href)}" data-do="file-view" target="_blank" rel="noopener" aria-label="Open ${esc(a.name || 'the photo')}"><img src="${esc(a.src)}" alt="${esc(a.name || 'photo')}" loading="lazy" decoding="async"></a>`
  : a.kind === 'video' ? `<video class="msg-vid post-vid" src="${esc(a.src)}" data-open="${esc(a.href)}" controls playsinline preload="metadata"></video>`
  : `<a class="msg-file" href="${esc(a.href)}" data-do="file-view" target="_blank" rel="noopener"><b>${esc(a.mark)}</b><span>${esc(a.name || 'a file')}</span></a>`).join('')}</div>` : '');
const msgLinks_ = b => (b.links || []).map(l => `<a class="msg-act" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.text)}</a>`).join('');
const msgChips_ = b => (b.chips || []).map(c => `<span class="msg-chip">${c.img ? `<img src="${esc(c.img)}" alt="" decoding="async">` : `<b>${esc(c.mark)}</b>`}`
  + ` <span class="msg-chip-name">${esc(c.name)}</span> ${tile_(c.x)}</span>`).join('');
function msgBubble_(b) {
  const fail = b.fail ? `<p class="msg-when msg-fail"><span class="msg-fail-why">${esc(b.fail.said)}</span>${msgLinks_(b.fail)}</p>${tileRow_(tile_(b.fail.tiles), 'msg-acts')}` : '';
  const bub = `<div class="msg-bub${b.words ? '' : ' is-bare'}">${msgAtt_({ items: b.att })}${b.words ? `<p class="msg-body-text">${cardRuns_({ marked: b.words })}</p>` : ''}</div>`;
  return `${b.day ? `<p class="msg-day"><span>${esc(b.day)}</span></p>` : ''}<div class="msg${b.look ? ' ' + esc(b.look) : ''}">`
    + (b.flag ? `<div class="msg-line">${bub}${tile_(b.flag)}</div>` : bub) + `${fail}</div>`;
}
const msgFormBlock_ = b => `<div class="msg-form" data-k="${esc(b.k)}"><div class="msg-queue">${msgChips_(b)}</div>`
  + (b.clip ? `${tile_({ icon: 'plus', label: text_('attach-a-photo-video-or-file'), act: 'msg-attach', cls: 'msg-clip' })}<input type="file" class="msg-file-in" multiple hidden aria-label="Choose files to send">` : '')
  + `<textarea class="msg-text" rows="${Number(b.rows) || 1}" maxlength="${Number(b.max) || 2000}" placeholder="Message…" aria-label="Message ${esc(b.to)}"${b.off ? ' disabled' : ''}${b.drafted || ''}>${esc(b.value || '')}</textarea>`
  + `${tile_(b.send)}<p class="note msg-said">${esc(b.note || '')}</p>${(b.also || []).map(a => `<p class="note msg-said${a.look ? ' ' + esc(a.look) : ''}">${esc(a.text || '')}</p>`).join('')}</div>`;
/* A BOX ROUND PARTS THESE BLOCKS ALREADY DREW (a message's card, a claim, a section), its look and data its own. */
const msgBox_ = b => `<div class="${esc(b.look || '')}"${cardAttrs_(b.data)}>${(b.parts || []).join('')}</div>`;
const msgHead_ = b => { const h = b.h === 4 ? 'h4' : 'h3'; return `<${h}${b.look ? ` class="${esc(b.look)}"` : ''}>${cardRuns_(b.text)}</${h}>`; };
const msgText_ = b => `<p class="${esc(b.look || '')}">${b.marked ? cardRuns_({ marked: b.text }) : cardRuns_(b.text)}</p>`;
const msgPic_ = b => `<figure class="msg-fc-pic">${b.face || ''}</figure>`;
const upReport_ = b => `<ul class="up-list">${(b.checks || []).map(c => `<li class="row up-item ${c.ok ? 'is-ok' : 'is-bad'}"><b class="up-mark" role="img" aria-label="${c.ok ? 'yes' : 'no'}">${c.ok ? '✓' : '✗'}</b>`
  + `<span><span class="up-k">${esc(c.label)}</span> <span class="up-v">${esc(c.said)}</span></span></li>`).join('')}</ul>`
  + `<p class="up-said ${b.ok ? 'up-good' : 'up-bad'}">${esc(b.said)}</p>${(b.steps || []).length ? `<ol class="up-steps">${b.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}`;
Object.assign(CARD_BLOCKS, { msgAtt: msgAtt_, msgLinks: msgLinks_, msgChips: msgChips_, msgBubble: msgBubble_, msgForm: msgFormBlock_, msgBox: msgBox_, msgHead: msgHead_,
  msgText: msgText_, msgPic: msgPic_, upReport: upReport_ });
