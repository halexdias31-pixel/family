/* @family. — cards-render.js THE ONE MASTER TEMPLATE (owner, 12 Nov: "go all the way"; rules.md 3.11). */
/* A card is DATA: { kind, picture?, tags, body: [blocks], tiles }. renderCard is the only code that writes card markup. */
/* Every string in a spec is TEXT and is escaped here; a spec never carries markup (check-card-spec holds that). */

/* INLINE TEXT: a string, or runs — { b }, { i }, { sup }, { sub }, { math }, { mono }, { tone, text } — each escaped. */
function cardRuns_(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(cardRuns_).join('');
  if (typeof v !== 'object') return esc(String(v));
  if (v.b != null) return `<b>${cardRuns_(v.b)}</b>`;
  if (v.i != null) return `<i>${cardRuns_(v.i)}</i>`;
  if (v.sup != null) return `<sup>${cardRuns_(v.sup)}</sup>`;
  if (v.sub != null) return `<sub>${cardRuns_(v.sub)}</sub>`;
  if (v.math != null) return `<span class="kc-math">${cardRuns_(v.math)}</span>`;
  if (v.mono != null) return `<span class="mono">${cardRuns_(v.mono)}</span>`;
  /* TEXT WITH THE SITE'S LAWS COLOURED (`mark`, which escapes first): still only text in the spec. */
  if (v.marked != null) return typeof mark === 'function' ? mark(String(v.marked)) : esc(String(v.marked));
  /* A NAMED WORD (a subject, green as a subject is everywhere): one of a fixed set, never a free class. */
  if (v.word && /^(subject|venue|level)$/.test(v.word)) return `<span class="${v.word}">${cardRuns_(v.text)}</span>`;
  if (v.tone) return `<span class="${esc('is-' + v.tone)}">${cardRuns_(v.text)}</span>`;
  return cardRuns_(v.text);
}
const cardAttrs_ = d => Object.keys(d || {}).map(k => ` data-${esc(k)}="${esc(String(d[k]))}"`).join('');
/* A PICTURE: a photo (`src`), a clip (`video`), an 8-bit drawing (`pix`: 16 rows of palette letters), or a drawing a picture maker drew (`svg`). */
function cardPic_(p) {
  if (!p) return '';
  if (p.src) return `<img src="${esc(p.src)}" alt="${esc(p.alt || '')}" loading="lazy" decoding="async">`;
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

/* ONE TAG, ONE SIZE: `colour` is the palette's tag number (data-tag; the name 0, the rest 1 unless said), never a literal. */
function cardTag_(t, i) {
  t = typeof t === 'string' ? { text: t } : (t || {});
  const n = t.colour != null ? t.colour : i ? 1 : 0;
  return `<span class="qtag${t.look ? ' ' + esc(t.look) : ''}" data-tag="${esc(n)}"${
    t.act ? ` data-do="${esc(t.act)}" role="button" tabindex="0"` : ''}${cardAttrs_(t.data)}>${cardRuns_(t.text)}</span>`;
}
/* A ROW OF TAGS on its own (a Find line, a list beside a card): the same tag maker. */
const renderTags = (tags, look) => ((tags || []).length ? `<div class="qtags${look ? ' ' + esc(look) : ''}">${tags.map(cardTag_).join('')}</div>` : '');
/* A FORM'S ONE CONTROL: input, number, date, select, textarea or check; the label is its row's left side. */
/* `draft: { surface, id }` keeps what is typed over a reload (draftAttr_/draftVal_); without it, its builder keeps it or says why (check-drafts). */
function cardControl_(c) {
  c = Object.assign({}, c || {});
  if (c.draft && typeof draftVal_ === 'function') { c.drafted = draftAttr_(c.draft.surface, c.draft.id, c.value); c.value = draftVal_(c.draft.surface, c.draft.id, c.value); }
  const id = c.id ? ` id="${esc(c.id)}"` : '', name = c.name ? ` name="${esc(c.name)}"` : '', act = c.act ? ` data-do="${esc(c.act)}"` : '';
  const more = id + name + act + cardAttrs_(c.data) + (c.off ? ' disabled' : '') + (c.required ? ' required' : '') + (c.aria ? ` aria-label="${esc(c.aria)}"` : '') + (c.drafted ? ' ' + c.drafted : '');
  if (c.kind === 'select') return `<select${more}>${(c.options || []).map(o => { o = typeof o === 'object' ? o : { value: o, text: o };
    return `<option value="${esc(o.value)}"${String(o.value) === String(c.value) ? ' selected' : ''}>${esc(o.text == null ? o.value : o.text)}</option>`; }).join('')}</select>`;
  if (c.kind === 'textarea') return `<textarea rows="${Number(c.rows) || 3}" placeholder="${esc(c.placeholder || '')}"${more}>${esc(c.value || '')}</textarea>`;
  if (c.kind === 'check') return `<input type="checkbox"${c.value ? ' checked' : ''}${more}>`;
  const type = /^(number|date|time|email|tel|password|search|file)$/.test(c.kind) ? c.kind : 'text';
  return `<input type="${type}" value="${esc(c.value == null ? '' : c.value)}" placeholder="${esc(c.placeholder || '')}"${
    c.min != null ? ` min="${esc(c.min)}"` : ''}${c.max != null ? ` max="${esc(c.max)}"` : ''}${c.step != null ? ` step="${esc(c.step)}"` : ''}${more}>`;
}
/* THE ONE ANSWER BOX, five variants: text, cells (several short boxes), choices (one tile each), pad (a keypad below), essay. */
function cardAnswer_(b) {
  const at = ` data-q="${esc(b.q || '')}"`;
  if (b.variant === 'choices') return `<div class="kc-answer is-choices"${at}>${tile_((b.choices || []).map((c, i) =>
    ({ form: true, look: 'btn quiet kc-choice', label: typeof c === 'object' ? c.text : c, act: b.act || 'answer-pick', data: { i, q: b.q || '' } })))}</div>`;
  if (b.variant === 'cells') return `<div class="kc-answer is-cells"${at}>${(b.cells || []).map((c, i) =>
    `<label class="kc-cell"><span>${cardRuns_(c.label || '')}</span>${cardControl_({ kind: 'text', name: 'c' + i, aria: c.aria || c.label || 'answer ' + (i + 1) })}</label>`).join('')}</div>`;
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
  return `<div class="kc-embed" data-embed="${esc(b.tool || '')}">${inner || ''}</div>`;
}
/* THE BODY BLOCKS, each with its one renderer. */
const CARD_BLOCKS = {
  text: b => [].concat(b.paras || [b.text]).filter(p => p != null && p !== '').map(p => `<p class="kc-line${b.tone ? ' ' + esc('is-' + b.tone) : ''}${b.look ? ' ' + esc(b.look) : ''}">${cardRuns_(p)}</p>`).join(''),
  figure: b => { const p = cardPic_(b); return p ? `<figure class="kc-fig">${p}${b.caption ? `<figcaption>${cardRuns_(b.caption)}</figcaption>` : ''}</figure>` : ''; },
  table: b => `<table class="kc-table">${(b.head || []).length ? `<thead><tr>${b.head.map(h => `<th>${cardRuns_(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${
    (b.rows || []).map(r => `<tr>${r.map(c => `<td>${cardRuns_(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`,
  /* A LIST: plain items, or label–value facts (the one `row` look). */
  list: b => { const items = b.items || [];
    if (items.some(x => x && typeof x === 'object' && 'label' in x)) return items.map(x =>
      `<div class="row"><span class="k">${esc(x.label)}</span><span class="v${x.tone ? ' ' + esc(x.tone) : ''}">${cardRuns_(x.value)}</span></div>`).join('');
    const tag = b.ordered ? 'ol' : 'ul';
    return items.length ? `<${tag} class="kc-list">${items.map(x => `<li>${cardRuns_(x)}</li>`).join('')}</${tag}>` : ''; },
  answer: cardAnswer_,
  formRow: b => `<label class="kc-form-row"><span class="k">${cardRuns_(b.label || '')}</span>${cardControl_(b.control)}</label>`,
  embed: cardEmbed_,
};
function cardBlock_(b) {
  if (b == null || b === '') return '';
  if (typeof b === 'string') return CARD_BLOCKS.text({ text: b });
  const r = CARD_BLOCKS[b.type];
  try { return r ? r(b) : ''; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'block:' + b.type); return ''; }
}
/* THE CARD. Its tile row is the one round row: the first tile leads, Message and Save stand beside it, the rest wait behind ⋯. */
function renderCard(spec) {
  spec = spec || {};
  const kind = spec.kind || 'thing', name = spec.name || ((spec.tags || [])[0] && ((spec.tags[0].text != null ? spec.tags[0].text : spec.tags[0]))) || '';
  /* THE NAME IS SAID ONCE: a facet tag that says the first tag again is left out. */
  const said = t => String(typeof t === 'object' ? t.text : t).trim().toLowerCase();
  const tags = (spec.tags || []).filter(t => t != null && t !== '' && (typeof t !== 'object' || (t.text != null && t.text !== '')))
    .filter((t, i, all) => !i || said(t) !== said(all[0]));
  const body = (spec.body || []).map(cardBlock_).join('');
  const x = { kind, key: spec.key || '', row: spec.row || { title: typeof name === 'string' ? name : '' } };
  /* THE KIND'S OWN TILES (read aloud, admin, the padlock) join the spec's, through the one row maker. */
  let row = '';
  try { row = typeof kcActRow_ === 'function' ? kcActRow_(x, '', tile_(spec.tiles || [])) : `<div class="tile-row kc-row">${tile_(spec.tiles || [])}</div>`; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'card:tiles'); }
  const cls = 'card fc kc kc-' + kind + (spec.look ? ' ' + spec.look : '') + (spec.off ? ' is-off' : '');
  return `<div class="${esc(cls)}"${spec.id ? ` id="${esc(spec.id)}"` : ''}${cardAttrs_(spec.data)} aria-label="${esc(typeof name === 'string' ? name : '')}">`
    + `<div class="kc-pic">${cardPic_(spec.picture)}</div><div class="kc-head"></div>`
    + `<div class="kc-tags">${renderTags(tags)}</div>`
    + `<div class="kc-lines">${body || (spec.empty ? `<p class="kc-line kc-empty">${esc(spec.empty)}</p>` : '')}</div>`
    + `<div class="kc-act">${row}</div></div>`;
}
/* SEVERAL CARDS, or a message where there are none (the one empty card). */
const renderCards = (specs, empty) => ((specs || []).length ? specs.map(renderCard).join('') : renderCard(Object.assign({ kind: 'empty', tags: [{ text: (empty && empty.name) || 'Nothing yet' }] }, empty || {}, { empty: (empty && empty.say) || (typeof NOTHING_YET === 'string' ? NOTHING_YET : '') })));
/* EACH CARD KIND'S BUILDER: `cardKind_('kind', x => spec)`; findCard draws a registered kind from its spec (check-card-spec runs each one). */
const CARD_KINDS = {};
function cardKind_(kind, build) { CARD_KINDS[kind] = build; }
function cardOfKind_(x) {
  let spec = null;
  try { spec = CARD_KINDS[x.kind](x); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'spec:' + x.kind); }
  return spec ? renderCard(Object.assign({ kind: x.kind, key: x.key, row: x.row }, spec)) : '';
}
