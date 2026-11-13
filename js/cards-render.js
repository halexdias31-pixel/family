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
  const x = Object.assign({}, spec.item || {}, { kind, key: spec.key || '', row: spec.row || { title: typeof name === 'string' ? name : '' } });
  /* THE KIND'S OWN TILES (read aloud, admin, the padlock, its extras off `item`) join the spec's, through the one row maker. */
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
  return spec ? renderCard(Object.assign({ kind: x.kind, key: x.key, row: x.row, item: x }, spec)) : '';
}
/* A QUESTION'S TABLE SCROLLS IN A BOX OF ITS OWN and stays a real table: as `display:block` Safari laid the iPad's isotope table out a row out of line (13 Nov). */
const qTables_ = h => String(h).replace(/<table\b/gi, '<div class="q-tscroll"><table').replace(/<\/table>/gi, '</table></div>');
/* THE BOOKING PAPER (one master template): a receipt's rows, controls, week and roster are drawn here from data the booking hands over. */
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
  return `<div class="bk-row ${esc(cls)}${bare ? ' is-bare' : ''}${heads ? ' is-head' : ''}"><span class="bk-n">${esc(r.n)}</span>`
    + (r.ctl && r.sel ? `<label for="${esc(r.ctl)}" class="bk-k">${esc(r.k)}</label>` : `<span class="bk-k">${esc(r.k)}</span>`)
    + `<span class="bk-v">${heads && r.dash != null && String(r.v) === r.dash ? '' : value}</span><span class="bk-m">${esc(r.mul)}</span>`
    + `<span class="bk-r">${esc(r.rate)}</span><span class="bk-t">${esc(r.total)}</span>${r.open || ''}</div>`
    + (r.say ? `<p class="bk-say${r.say.warn ? ' is-warn' : ''}">${esc(r.say.text)}</p>` : '');
}
const paperTotal_ = (k, t, cls) => `<div class="bk-row rc-total${cls ? ' ' + esc(cls) : ''}"><span class="bk-n"></span><span class="bk-k">${esc(k)}</span><span class="bk-v"></span><span class="bk-m"></span><span class="bk-r"></span><span class="bk-t">${esc(t)}</span></div>`;
const paperHead_ = () => '<div class="bk-row is-cols"><span class="bk-n"></span><span class="bk-k"></span><span class="bk-v"></span><span class="bk-m">×</span><span class="bk-r">+/h</span><span class="bk-t">=</span></div>';
/* `rows`, `before`, `roster` and `foot` arrive already drawn by these same paper blocks. */
function paperDoc_(r) {
  const head = !!(r.cols && (r.rows || []).length);
  const lines = (r.lines || []).filter(Boolean).length && typeof qtag_ === 'function'
    ? `<div class="qtags qcard-tags">${(r.lines || []).map((l, i) => (l ? qtag_(esc(l), ` data-tag="${[6, 9, 4][i] || 0}"`) : '')).join('')}</div>` : '';
  return `<div class="rc${r.done ? ' is-done' : ''}"><div class="rc-head">${lines}</div>${head ? '' : '<div class="rc-rule"></div>'}`
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
const paperNote_ = b => `<p class="note${b.look ? ' ' + esc(b.look) : ''}">${cardRuns_(b.text)}</p>`;
const paperLinks_ = b => `<p class="note policy-links">${esc(b.say || '')}${(b.links || []).map(l => `<a href="${esc(l.href)}" data-do="file-view" target="_blank" rel="noopener">${esc(l.text)}</a>`).join(' · ')}</p>`;
const paperBox_ = b => `<div${b.id ? ` id="${esc(b.id)}"` : ''} class="${esc(b.look || '')}">${b.inner || ''}</div>`;
Object.assign(CARD_BLOCKS, { paperRow: paperRow_, paperDoc: paperDoc_, paperRoster: paperRoster_, paperWhenCould: paperWhenCould_, paperWeek: paperWeek_,
  paperStrip: paperStrip_, paperSelect: paperSelect_, paperSet: paperSet_, paperInput: paperInput_, paperNote: paperNote_, paperLinks: paperLinks_, paperBox: paperBox_ });
/* A BOOKING AS A PICTURE: the paper's own markup (`xml`, already serialised) laid in an SVG at the screen's width; `css` is the page's own rules. */
const paperSnap_ = b => `<svg xmlns="http://www.w3.org/2000/svg" width="${Number(b.cw) || 1}" height="${Number(b.ch) || 1}" viewBox="0 0 ${(Number(b.cw) || 1) / (Number(b.k) || 1)} ${(Number(b.ch) || 1) / (Number(b.k) || 1)}">`
  + `<style>${String(b.css || '').replace(/<\//g, '<\\/')}</style><foreignObject x="0" y="0" width="${Number(b.w) || 1}" height="${Number(b.h) || 1}">${b.xml || ''}</foreignObject></svg>`;
/* TURNING A REQUEST DOWN asks why, in one optional line. */
const paperWhy_ = b => `<form class="req-why" data-id="${esc(b.id)}"><label>Why not? <input name="why" maxlength="200" placeholder="optional, one line" autocomplete="off"></label>${tile_({ form: true, submit: true, label: 'Decline' })}</form>`;
Object.assign(CARD_BLOCKS, { paperSnap: paperSnap_, paperWhy: paperWhy_ });
