
/* ONE CARD FOR EVERY KIND (owner, 8 Nov): picture, title, tags, lines, then its tile row (`cardRow_`).
   card-fields.json picks each part's fields; check-card-shape holds the shape. */
const KC_PARTS = ['pic', 'head', 'tags', 'lines', 'act'];
/* WHO A CARD IS DRAWN FOR: undefined is whoever is signed in; a share sets 'public' while it draws (tutorPng_). */
let CARD_VIEWER;
/* BEFORE THE SETTINGS FILE ARRIVES, OR FOR A KIND IT DOES NOT NAME: its kind's picture, its name, its facet tags. */
const KC_BARE = { cls: '', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: [], tiles: [] };
const kcRow_ = x => (x && x.row) || {};
const kcPct_ = m => (typeof m !== 'number' || !isFinite(m) ? '' : m === 1 ? dash_() : (m > 1 ? '+' : '−') + Math.abs(Math.round((m - 1) * 100)) + '%');
/* EACH FIELD A CARD CAN SHOW, BY NAME: the settings file picks, and a field with nothing to say says ''. */
const KC_FIELDS = {
  kindPic: () => '',
  name: x => cardBlock_({ type: 'group', tag: 'h3', text: x.name || '' }),
  /* A KIND WHOSE OWN FILE WRITES ITS INSIDES (`KC_OWN`) hands them over cut into the four parts (`kcSplit_`); no tag line of its own gets its facets. */
  ownPic: x => (x.kcOwn || {}).pic || '',
  ownHead: x => (x.kcOwn || {}).head || '',
  ownTags: x => (x.kcOwn || {}).tags || (kcField_('facets') || (() => ''))(x),
  ownLines: x => (x.kcOwn || {}).lines || '',
};
/* A FIELD ITS OWN FILE DRAWS (tags, a venue's building, a manuscript, a boxer) is added to `window.KC_FIELDS_MORE` there; no load order needed. */
const kcField_ = k => KC_FIELDS[k] || (window.KC_FIELDS_MORE || {})[k];
/* THE FILE'S ROWS BEFORE IT ARRIVES (or if it never does): the same rows, held equal to the file by check-card-shape. */
const KC_DEFAULT = {
  tutor: { cls: 'is-widget is-prof', pic: [], title: [], tags: [], lines: [], tiles: ['book-with:book:Book'] },
  venue: { cls: 'venue-door', pic: [], title: [], tags: [], lines: [], tiles: [] },
  level: { cls: 'is-level', pic: [], title: [], tags: [], lines: [], tiles: ['book-with:book:Book'] },
  subject: { cls: 'is-subject', pic: [], title: [], tags: [], lines: [], tiles: ['book-with:book:Book'] },
  manuscript: { cls: 'hdb hdb-msc lib-c', pic: [], title: [], tags: [], lines: [], tiles: ['file-view:ext:Source'] },
  writing: { cls: 'hdb lib-c', pic: [], title: [], tags: [], lines: [], tiles: [] },
  event: { cls: 'hdb lib-c', pic: [], title: [], tags: [], lines: [], tiles: ['file-view:ext:Source'] },
  people: { cls: 'person lib-c', pic: [], title: [], tags: [], lines: [], tiles: [] },
  receipt: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: ['job-pay:pound:Pay'] },
  question: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  answer: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  practical: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
  project: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
  content: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  insert: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  spec: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  timeline: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  fight: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  bible: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  talmud: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  quran: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  worktext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  hadith: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  writ: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  pdtext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  orthotext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  hymn: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  mech: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
  chem: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
  hist: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
  soon: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
  person: { cls: 'is-prof', pic: [], title: [], tags: [], lines: [], tiles: [] },
  setting: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  health: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  offBooking: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
};
/* A KIND'S FIELDS: its row in data/settings/card-fields.json (`DATA.cardFields`, settings.js), else the built-in row, else the bare three. */
/* A KIND THE FILE DOES NOT NAME BUT WHOSE OWN MAKER DREW IT (a verse another file draws) keeps every part it drew. */
const KC_OWN_SPEC = { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] };
function kcSpec_(kind) {
  const rows = (typeof DATA !== 'undefined' && DATA && DATA.cardFields) || KC_DEFAULT;
  return rows[kind] || KC_BARE;
}
/* EVERY CARD OF A KIND SHOWS ITS KIND'S TILES (owner 35a, 8 Nov): one this card cannot use is drawn greyed (`off`), never left out. */
function kcOffOpts_(x, html) {
  const s = x && x.key ? kcSpec_(x.kind) : null;
  if (!s || !(s.tiles || []).length) return [];
  return s.tiles.map(t => { const [act, icon, label] = String(t).split(':');
    return new RegExp('data-do="' + act + '"').test(html) ? null : { icon, label: label || act, act, off: true, cls: 'kc-off' }; }).filter(Boolean);
}
/* ---------- A CARD ITS OWN FILE STILL WRITES, CUT INTO THE FOUR PARTS ---------- */
const KC_VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/;
const KC_ATTRS = '((?:\\s+[^\\s=>\\/]+(?:\\s*=\\s*(?:"[^"]*"|\'[^\']*\'|[^\\s>]+))?)*)';
/* THE TOP-LEVEL ELEMENTS OF SOME HTML, each with its tag, class, whole html and inside; loose text is an element with no tag. */
function kcKids_(html) {
  const re = new RegExp('<!--[\\s\\S]*?-->|<(\\/?)([a-zA-Z][\\w-]*)' + KC_ATTRS + '\\s*(\\/?)>', 'g'), out = [];
  let depth = 0, start = 0, top = null;
  const loose = to => { if (html.slice(start, to).trim()) out.push({ tag: '', cls: '', html: html.slice(start, to), inner: '' }); };
  for (let m; (m = re.exec(html));) {
    if (!m[2]) continue;
    const tag = m[2].toLowerCase(), close = !!m[1], self = !close && (!!m[4] || KC_VOID.test(tag));
    if (!close && depth === 0) { loose(m.index); top = { tag, cls: (/\bclass\s*=\s*"([^"]*)"/.exec(m[3]) || [, ''])[1], attrs: m[3], at: m.index, from: re.lastIndex }; start = m.index; }
    if (self) { if (depth === 0) { out.push(Object.assign(top, { html: m[0], inner: '' })); top = null; start = re.lastIndex; } continue; }
    if (!close) { depth++; continue; }
    if (depth === 0) continue;
    if (--depth === 0 && top) { out.push(Object.assign(top, { html: html.slice(top.at, re.lastIndex), inner: html.slice(top.from, m.index) })); top = null; start = re.lastIndex; }
  }
  loose(html.length);
  return out;
}
/* ONE CARD'S HTML AS PARTS: its first picture, its heading, its tag line, the rest as lines; a `.thing` wrapper is opened. null if it is not one card. */
function kcSplit_(html) {
  const els = kcKids_(String(html || '')), card = els.length === 1 ? els[0] : null;
  if (!card || card.tag !== 'div') return null;
  const parts = { cls: card.cls, attrs: String(card.attrs || '').replace(/\s+class\s*=\s*"[^"]*"/, ''), pic: '', head: '', tags: '', lines: '' };
  const walk = list => list.forEach(k => {
    const c = ' ' + k.cls + ' ';
    /* A BODY WRAPPER (`.tx-body`, `.rd-body`) IS OPENED TOO, so its heading is the name and its first line clamps to two. A `.kc-items` list stays whole: it holds controls. */
    if (/ (thing|[\w]+-body) /.test(c) && !/ kc-items /.test(c) && k.tag === 'div') return walk(kcKids_(k.inner));
    if (!parts.pic && (/^(img|svg|figure|canvas)$/.test(k.tag) || /[ -](pic|art) /.test(c))) parts.pic = k.html;
    else if (!parts.head && (/^h[1-4]$/.test(k.tag) || / ([\w-]+-)?(head|title) /.test(c))) parts.head = k.html;
    /* A SECOND TAG LINE (a verse's translation) joins the first: one tag part, never a tag line among the lines. */
    else if (/ [\w-]*tags /.test(c)) parts.tags = !parts.tags ? k.html : /<\/div>\s*$/.test(parts.tags) ? parts.tags.replace(/<\/div>\s*$/, m => k.inner + m) : parts.tags + k.html;
    else parts.lines += k.html;
  });
  walk(kcKids_(card.inner));
  return parts;
}
/* ---------- EVERY CARD'S FOUR BUTTONS (owner, 9 Nov): main action, Star, then every other tile shown beside them (no ⋯, owner 23 Nov). ---------- */
const KC_TILE_RE = /<(button|a)\b[^>]*\bclass="tile\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g;
const kcAct_ = t => (/\bdata-do="([^"]*)"/.exec(t) || [])[1] || '';
/* WHAT COUNTS AS A CARD'S MAIN ACTION when its kind names none first: a Send/Check, a buy-toned tile, Open. */
const KC_MAIN_ACTS = ['find-open', 'book-with'];
function kcFour_(x, rest, main) {
  const all = String(rest || '').match(KC_TILE_RE) || [];
  const spec = x && x.kind ? kcSpec_(x.kind) : KC_BARE;
  const first = String((spec.tiles || [])[0] || '').split(':')[0];
  const pick = test => { const t = all.find(test); if (t) all.splice(all.indexOf(t), 1); return t || ''; };
  main = main || pick(t => first && kcAct_(t) === first) || pick(t => /\bis-(submit|buy)\b/.test(t))
    || pick(t => KC_MAIN_ACTS.indexOf(kcAct_(t)) >= 0) || pick(t => !/^(fav|card-share|find-top|rep-flag|game-lock)$/.test(kcAct_(t)) && !/\bis-(admin|danger)\b/.test(t));
  /* A CARD WITH NO ITEM BEHIND IT (Find's menu) HAS NOTHING TO SHARE OR SAVE: only its own tiles, never greyed stand-ins (owner, 17 Nov). */
  if (!(x && x.key)) return cardBlock_({ type: 'group', tag: 'span', look: 'kc-four', inner: String(rest || '').replace(KC_TILE_RE, t => (/\sdisabled[\s>]/.test(t) && !/data-do="rep-flag"/.test(t) ? '' : t)) });
  /* NO STAR (owner, 24 Nov). */
  const star = '';
  /* A CARD IS STATIC (owner, 10 Nov): with no main of its own, Share leads; the card already shows everything it holds. */
  const lead = main || pick(t => kcAct_(t) === 'card-share') || tile_({ icon: 'share', label: 'Share', act: 'card-share', off: !(x && x.key), data: { key: (x && x.key) || '' } });
  /* ONE BUTTON LAW (owner, 15 Nov): every action is its own visible tile, and all of them flow like words -- fill the line, then wrap. */
  const left = all.reduce((h, t) => h.replace(t, ''), [main, lead, star].reduce((h, t) => (t ? h.replace(t, '') : h), String(rest || '')));
  return cardBlock_({ type: 'group', tag: 'span', look: 'kc-four', inner: lead + star + all.join('') + left });
}
/* THE CARD'S OWN ROW when no tool row of its own (a question's `qtRow_`) already carries the four. */
/* `o`: { look, key } -- a question's row is its tool row (`.qt-row`, its key on it) with every tile shown. */
function kcActRow_(x, html, own, o) {
  o = o || {};
  if (/class="[^"]*\bkc-four\b/.test(html)) return '';
  let rest = own || '';
  try { rest += x && x.key && typeof cardRow_ === 'function' ? cardRow_(x, true) : ''; } catch (e) { oops_(e, 'card:tiles'); }
  /* A KIND'S TILE GREYED FOR WANT OF ONE goes when its own maker's row brought the real one. */
  const real = (String(own || '').match(KC_TILE_RE) || []).map(kcAct_);
  rest = rest.replace(KC_TILE_RE, t => (/\bkc-off\b/.test(t) && real.indexOf(kcAct_(t)) >= 0 ? '' : t));
  return cardBlock_({ type: 'group', look: 'tile-row kc-row' + (o.look ? ' ' + o.look : ''), attrs: { 'data-key': o.look ? String(o.key || '') : null },
    inner: (f => (o.look === 'qt-row' && typeof qtAll_ === 'function' ? f.replace(/^(<span[^>]*>)([\s\S]*)(<\/span>)$/, (m, a, b, c) => a + qtAll_(b) + c) : f))(kcFour_(x, rest + tile_(kcOffOpts_(x, rest)), o.main)) });
}
/* THE TOP-LEVEL TILE ROWS OF SOME LINES, lifted out; a form's buttons (`.btn-row`, inside the form) stay where they are. */
function kcHoist_(html, panel) {
  /* A `.kc-items` LIST KEEPS EACH THING'S TILES BESIDE IT; a whole card in a panel's lines (a widget's) keeps its own row. */
  if (new RegExp('class="[^"]*\\b(' + (panel ? '' : 'kc-four|') + 'kc-items)\\b').test(html)) return { lines: html, tiles: '' };
  let tiles = '';
  const lines = kcKids_(String(html || '')).map(k => {
    if (k.tag === 'div' && / tile-row /.test(' ' + k.cls + ' ')) { tiles += k.inner; return ''; }
    return k.html;
  }).join('');
  return { lines, tiles };
}
/* WHETHER SOME TAGS ALREADY SAY A NAME, and the name put in front of them as a tag. */
const kcSays_ = (tags, name) => norm(String(tags || '').replace(/<[^>]+>/g, ' ').replace(/&#0*39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')).indexOf(norm(name)) >= 0;
function kcTagFirst_(tags, name) {
  const tag = `${qtag_(`${esc(name)}`, ` data-tag="0"`)}`;
  return /^\s*<(div|span) class="[^"]*\bqtags\b[^"]*"[^>]*>/.test(tags || '') ? String(tags).replace(/^(\s*<(?:div|span) class="[^"]*\bqtags\b[^"]*"[^>]*>)/, m => m + tag) : cardBlock_({ type: 'group', look: 'qtags', inner: tag }) + (tags || '');
}
/* TAGS ARE SHORT FACTS, LINES HAVE NO HEADINGS (owner, 9 Nov): a longer tag (a credit) becomes a later line, open-only; a heading in the lines a plain line. */
const KC_TAG_MAX = 30;
/* A QUESTION, AN ANSWER, A SETTING AND SITE HEALTH hold a whole screen whose own checks read its headings: kept as drawn. */
const KC_WHOLE_KINDS = ['question', 'answer', 'setting', 'health'];
/* A TAG'S ATTRIBUTES READ BACK AS DATA (`k="v"` or a bare `k`, the first of a name winning), unescaped, for the group block to write again. */
const kcAttrsOf_ = at => { const a = {};
  String(at || '').replace(/([\w:-]+)(?:="([^"]*)")?/g, (m, k, v) => { if (!(k in a)) a[k] = v == null ? true
    : v.replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); return m; }); return a; };
function kcTidy_(tags, lines, name) {
  const words = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/g, ' ').trim();
  const moved = [];
  tags = String(tags || '').replace(/<span class="qtag\b[^"]*"([^>]*)>((?:(?!<\/?span\b)[\s\S])*)<\/span>/g, (m, at, inner) =>
    (/data-tag="0"/.test(at) || words(inner).length <= KC_TAG_MAX ? m : (moved.push(cardBlock_({ type: 'group', tag: 'p', look: 'kc-credit', inner })), '')));
  lines = String(lines || '').replace(/<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/g, (m, n, at, inner) => {
    if (name && norm(words(inner)) === norm(name)) return '';
    const a = kcAttrsOf_(at);
    return cardBlock_({ type: 'group', tag: 'p', look: 'kc-h' + (a.class ? ' ' + a.class : ''), attrs: Object.assign(a, { class: null, role: 'heading', 'aria-level': n }), inner });
  });
  return { tags, lines: lines + moved.join('') };
}
/* A TAG SAYS ONLY WHAT THE MENUS ABOVE HAVE NOT (owner, 6 Nov), on every kind: a tag whose words a picked chip already says goes. */
function kcPicked_() {
  const f0 = typeof STUFF !== 'undefined' && STUFF && STUFF.filters, f = Array.isArray(f0) ? f0 : [];
  const said = new Set();
  f.filter(c => c && !c.any).forEach(c => { said.add(norm(String(c.value))); try { if (typeof chipShow_ === 'function') said.add(norm(String(chipShow_(c) || ''))); } catch (e) { oops_(e, 'card:chip'); } });
  said.delete('');
  return said;
}
function kcUnpicked_(html) {
  const said = kcPicked_();
  if (!said.size) return html;
  return String(html || '').replace(/<span class="(?:qtag|prof-tag)(?![^"]*prof-tag-name)[^"]*"[^>]*>([^<]*)<\/span>/g, (m, t) => (said.has(norm(t.replace(/&amp;/g, '&'))) ? '' : m));
}
/* IMAGE ON TOP ONLY WHEN REAL (owner, 10 Nov): a person's photo or steady profile picture; else a photo, figure or cover, or nothing. */
function kcPicOr_(x, html) {
  html = String(html || '');
  if (KC_PERSON_KINDS.indexOf(x && x.kind) < 0) return kcRealPic_(html) ? html : '';
  if (html.trim()) return html;
  const art = typeof PFP_ART === 'object' && PFP_ART ? PFP_ART : {};
  const named = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.defaultPictures) ? DATA.defaultPictures : []).filter(n => art[n]);
  const list = named.length ? named : (typeof PFP_PICTURES !== 'undefined' ? PFP_PICTURES : []).filter(n => art[n]);
  if (!list.length || typeof pfpArt_ !== 'function') return '';
  const r = kcRow_(x), k = String(r.personId || (x && (x.key || x.name)) || ''); let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return pfpArt_(list[h % list.length], 96);
}
/* A REAL PICTURE: a photo, a clip, or a drawing of this very thing (a manuscript, a car part, a timeline stop); a kind sign or icon is not one. */
const kcRealPic_ = h => /<(img|video|picture)\b|mfrclip-|class="(mech|tl)-pic"/.test(String(h || ''));
/* ---------- THE BOOKING KINDS (subject, level, venue) ARE ITEM MAPS (slice 3): their lines read the fields the payload computed live (`live`). ---------- */
const kcSurcharge_ = (t, kind) => { if (kind === 'level' && !t.priced) return { label: 'Surcharge', value: text_('not-priced-yet'), tone: 'bad' };
  return kcPct_(t.mult) || t.mult === 1 ? { label: t.mult === 1 ? text_('no-surcharge') : 'Surcharge', value: kcPct_(t.mult) } : null; };
/* THEIR FACT LINES (kinds.json `card.parts` {list: [...]}, drawn by referenceBody_): each a line, several or none, off the row and its live counts. */
/* A venue's rooms say seats, and the price unless the map's `childHides` took it (a child is told the seats and not the price, 398). */
const REFERENCE_LINES_ = {
  surcharge: (t, L, k) => kcSurcharge_(t, k),
  levels: (t, L) => (L.levels.length ? { label: 'Levels', value: L.levels.join(', ') } : null),
  noTutors: (t, L) => (L.tutors.length ? null : { label: 'Tutors', value: text_('none-yet'), tone: 'bad' }),
  subjects: (t, L) => (L.subjects.length ? { label: 'Subjects', value: L.subjects.map((v, i) => [i ? ', ' : '', { word: 'subject', text: v }]) } : { label: 'Subjects', value: text_('none-yet'), tone: 'bad' }),
  tutors: (t, L) => { const n = L.tutors.length; return { label: 'Tutors', value: n ? String(n) : (typeof NO_TUTOR === 'string' ? NO_TUTOR : text_('none-yet')), tone: n ? '' : 'bad' }; },
  listed: t => (t.listed ? null : { label: text_('booking-form'), value: text_('not-offered'), tone: 'bad' }),
  rooms: (t, L) => L.rooms.map(o => { const say = [o.seats ? 'up to ' + o.seats : '', 'price' in o ? (o.price ? fmtMoney_(o.price, 'hour') : 'free') : ''].filter(Boolean).join(' · ');
    return say ? { label: o.label, value: say } : null; })
};
const kcListOf_ = v => (Array.isArray(v) ? v : []).filter(Boolean);
/* ONE ITEM SHAPE, ONE DICTIONARY OF KINDS (owner, 16 Nov, the four step 1): every item is { id, kind, name, tags, body, links }, and every kind is */
/* described once, in data/settings/kinds.json (ITEM_KINDS, js/kinds.js): its columns, Find's facets, its card, its live fields, who sees what, its forms. */
/* ITEM_MAPS is read off it here, nothing per kind written by hand: a card slot is a column, or "fn(args)" naming a global function (a hook below, */
/* or the kind's own drawer in its file). */
const KIND_ARG_ = /^[A-Za-z_$][\w$]*$/;
/* A GLOBAL BY NAME, found when first asked (a LATER file's drawer may not be loaded yet, so a miss is not kept). Direct eval sees every file's top-level names. */
function kindGlobal_(n) { if (!KIND_ARG_.test(n)) return null; try { const f = eval(n); return typeof f === 'function' ? f : null; } catch (e) { return null; } }
function kindHook_(spec, empty) {
  if (spec == null) return null;
  const m = /^([A-Za-z_$][\w$]*)\((.*)\)$/.exec(String(spec));
  if (!m) return c => (c.row || {})[spec];
  const args = m[2].split(',').map(a => a.trim()).filter(Boolean).map(a => (KIND_ARG_.test(a) ? c => c[a] : (v => () => v)(JSON.parse(a))));
  let fn = null;
  return c => { fn = fn || kindGlobal_(m[1]); return fn ? fn(...args.map(g => g(c))) : empty; };
}
const KIND_EMPTY_ = { name: '', id: '', body: [], picture: null, pills: [], tagRows: [], tiles: [], sheet: [], tool: '', keep: null, data: null, look: '', off: false };
const kindCtx_ = (it, x, pic) => ({ item: it, entry: x, raw: it.raw, row: it.raw, live: it.live, entryRow: kcRow_(x), pic });
function itemMapOfKind_(k) {
  const K = ITEM_KINDS.kinds[k], c = K.card, see = K.see || {}, hide = see.hide || {}, H = f => kindHook_(c[f], KIND_EMPTY_[f]);
  const M = { facetOrder: (K.find || {}).facets || [] };
  ['card', 'tags', 'links', 'lines', 'nameTag', 'tagLook', 'entryTags', 'liveTags', 'facts', 'toolRow'].forEach(f => { if (c[f] !== undefined) M[f] = c[f]; });
  if ((K.find || {}).onCard === false) M.facets = false;
  if (hide.prices) M.childHides = hide.prices;
  if (hide.admin) M.adminOnly = hide.admin;
  if (Array.isArray(c.id)) M.id = c.id; else if (c.id) { const h = H('id'); M.id = r => h({ row: r }); }
  if (c.name) { const h = H('name'); M.name = r => h({ row: r }); }
  if (c.body) { const h = H('body'); M.body = (r, live) => h({ row: r, live }); }
  if (c.off) { const h = H('off'); M.off = r => !!h({ row: r }); }
  if (c.from) M.from = c.from === 'entry' ? x => x : c.from;
  if (c.when) M.when = x => !!x[c.when];
  if (c.look && typeof c.look === 'object') M.look = (it, x) => Object.keys(c.look).filter(f => x[f]).map(f => c.look[f]).join(' ');
  else if (c.look) { const h = /\(/.test(c.look) ? H('look') : null; M.look = h ? (it, x) => h(kindCtx_(it, x)) || c.lookElse || '' : c.look; }
  ['picture', 'pills', 'tagRows', 'tiles', 'keep', 'data', 'tool', 'sheet'].forEach(f => { if (c[f]) { const h = H(f); M[f] = (it, x, pic) => h(kindCtx_(it, x, pic)); } });
  /* THE ONE PERSON AND ITEM BODIES (CARD SHAPES): a Person draws its kind's `parts` (personBody_); a stored Item its form's lines, its sheet */
  /* and its tiles (form.js); a plain `picture` is the entry's column as a photo; `price` adds the price tag after Find's facets. */
  if (c.parts) M.body = (r, live) => (K.bodyAs === 'reference' ? referenceBody_ : personBody_)(r, live, k);
  else if (c.record) { const R = c.record; M.name = r => recordName_(R, r);
    if (R.pills) M.pills = it => recordPills_(R, it); if (R.sum) M.body = (r, live) => recordSum_(R, r, live); }
  else if (c.question) { const Q = c.question, stem = kindHook_(Q.stem, null), act = kindHook_(Q.actions, []);
    M.picture = (it, x) => stem(kindCtx_(it, x)); M.sheet = (it, x, pic) => questionBox_(Q, x, pic); M.tiles = (it, x) => act(kindCtx_(it, x)); }
  else if ((K.find || {}).from === 'store') { M.body = r => itemLines_(r, k); M.sheet = (it, x) => storeSheet_(it, x); M.tiles = (it, x) => storeTiles_(it, x); }
  if (c.picture && !/\(/.test(c.picture)) M.picture = (it, x) => (x[c.picture] && typeof pic === 'function' ? { src: pic(x[c.picture]), look: 'thing-pic', alt: '' } : null);
  else if (!c.picture && K.bodyAs === 'person') M.picture = it => (typeof personPicSpec_ === 'function' ? personPicSpec_(it.raw.id, it.name) : null);
  if (K.live) { M.live = {}; Object.keys(K.live).forEach(f => { const h = kindHook_(K.live[f], null); M.live[f] = r => h({ row: r }); }); }
  return M;
}
const ITEM_MAPS = Object.fromEntries(Object.keys(ITEM_KINDS.kinds).filter(k => ITEM_KINDS.kinds[k].card).map(k => [k, itemMapOfKind_(k)]));
/* ---------- KIND HOOKS: the few slots kinds.json names that no kind's own file already draws. ---------- */
function kcMsPic_(it, x) { const svg = typeof msFragSvg_ === 'function' ? msFragSvg_(it.raw, x && x.msSideIx) : ''; return svg ? { svg, alt: it.name } : null; }
function kcMechPic_(it) { return Array.isArray(it.raw.px) && typeof mechPic_ === 'function' ? { svg: mechPic_(it.raw.px, it.name), alt: it.name } : null; }
function kcFightName_(r) { return [r.a || r.boxer_a, r.b || r.boxer_b].filter(Boolean).join(' and '); }
function kcContentId_(r) { return r.id || [r.bookId || r.book_id, r.n == null ? r.chapter : r.n].filter(v => v != null && v !== '').join('-'); }
function kcLevels_(r) { return kcListOf_(r.levels); }
function kcSubjects_(r) { return Array.isArray(r.subjects) ? r.subjects : []; }
function kcTutorNames_(r) { return (Array.isArray(r.tutors) ? r.tutors : []).map(y => y.title); }
function kcRooms_(r) { return Array.isArray(r.rooms) && r.rooms.length ? r.rooms.slice(0, 4).map(o => ({ label: o.name || 'Room', seats: o.max, price: o.rate }))
  : [{ label: text_('the-room'), seats: r.maxCapacity, price: r.bestRate }]; }
/* A VENUE'S 8-BIT BUILDING (find-doors.js), picked off its name. */
function kcVenuePic_(it, x) { const pix = typeof VENUE_PIX === 'object' && typeof venueShape_ === 'function' ? VENUE_PIX[venueShape_(it.raw)] : null; return pix ? { pix, alt: x.name } : null; }
/* A QUESTION PART is named "Q5b"; its data- attributes say which part. */
function qCardName_(r) { return r.question != null && String(r.question) !== '' ? 'Q' + r.question + (typeof qPartName_ === 'function' ? qPartName_(r.part) : '') : ''; }
/* ITS `fav` STATE: the star's wrap (find-bundles.js), styled as the shape's state, never as the card's own `favwrap` class. */
function kcQData_(it, x) { return { part: x.key || '', of: it.id || x.key || '', state: 'fav' }; }
function kcUnlisted_(r) { return r.listed === false; }
function kcTutorMoney_(r) { return r.rate ? { rate: typeof rateRange_ === 'function' ? rateRange_(r) : '' } : {}; }
function kcTutorSay_(r) { return { note: typeof profNote_ === 'function' ? profNote_(r) : '' }; }
/* A BOOKING'S MONEY (kinds.json `live.money`): worked out here, only read by its Record pills and sum; a child is told neither (kinds.json `see.hide.prices`). */
function kcBookingMoney_(r) { const rate = Number(r.rate) || (/hour/i.test(String(r.unit || '')) ? Number(r.price) : 0) || 0;
  return { rate: rate > 0 ? fmtMoney_(rate, 'hour') : '', total: r.price !== '' && r.price != null && isFinite(Number(r.price)) ? fmtMoney_(Number(r.price)) + ' in all' : '' }; }
const itemLive_ = (r, M) => { const v = {}; Object.keys(M.live || {}).forEach(f => { v[f] = M.live[f](r); });
  const hide = (typeof may_ === 'function' && !may_('prices') ? M.childHides || [] : []).concat(typeof may_ === 'function' && may_('admin') ? [] : M.adminOnly || []);
  const strip = o => { if (Array.isArray(o)) o.forEach(strip); else if (o && typeof o === 'object') hide.forEach(k => { delete o[k]; }); };
  if (hide.length) Object.keys(v).forEach(f => strip(v[f]));
  return v; };
const itemList_ = v => (Array.isArray(v) ? v : String(v == null ? '' : v).split('|')).map(t => String(t).trim()).filter(Boolean);
/* ANY ROW → THE SHAPE. `raw` is kept beside it, for what only a kind's drawing needs (a manuscript's fragment). */
function item_(raw, kind) {
  const r = raw || {}, M = ITEM_MAPS[kind] || {}, words = col => [...new Set((M[col] || []).flatMap(c => itemList_(r[c])))];
  const lines = typeof HIST_LINES === 'object' && HIST_LINES[kind] ? HIST_LINES[kind].map(([label, col]) => ({ label, value: String((typeof col === 'function' ? col(r) : r[col]) || '') })).filter(l => l.value.trim()) : [];
  const live = itemLive_(r, M), own = M.body ? M.body(r, live) : null, body = Array.isArray(own) ? own : lines.length ? [{ type: 'list', items: lines }] : [];
  const id = typeof M.id === 'function' ? String(M.id(r) || '') : (M.id || ['id']).map(c => String(r[c] == null ? '' : r[c]).trim()).find(Boolean) || '';
  return { id, kind, name: String((M.name && M.name(r)) || r.title || r.name || r.title_english || r.title_original || r.handle || id || ''),
    tags: words('tags'), body, links: words('links'), raw: r, live };
}
/* THE SHAPE → A renderCard SPEC: its name, then Find's facets for it (`x`, the Find entry carrying it); its body drawn only where its map says `lines`. */
function cardOfItem_(it, x) {
  const M = ITEM_MAPS[it.kind] || {}, own = x || { kind: it.kind, key: '', name: it.name };
  if (M.keep) M.keep(it, own);
  const facets = itemFacets_(M, own);
  /* A KIND'S OWN EXTRA TAGS (`entryTags`, `liveTags`) only where the one tag set (data/settings/tags.json) names their field (owner, 23 Nov). */
  const more = tagsKept_(Object.keys(M.entryTags || {}).flatMap(f => (own[f] || []).map(t => ({ field: f, text: t, colour: M.entryTags[f], data: { f } })))
    .concat(Object.keys(M.liveTags || {}).flatMap(f => ((it.live || {})[f] || []).map(t => ({ field: f, text: t, colour: M.liveTags[f], data: { f } })))));
  /* `nameTag: false` still leads with the name when it has no facets at all: a card is never without a tag. */
  const pic = M.picture ? M.picture(it, own) : null, pills = M.pills ? M.pills(it, own) : null;
  /* ITS ROW IS ITS ENTRY'S OWN, never one made of its name: a card whose name is not a tag (`nameTag: false`) must not draw it elsewhere. */
  const tool = M.tool ? itemTool_(M.tool(it, own), cardBlocks_(it.body), !!M.facts) : null, name = it.name || own.name || '';
  const look = [(typeof M.look === 'function' ? M.look(it, own) : M.look) || '', tool ? tool.cls : '', M.facts ? 'kc-facts' : ''].filter(Boolean).join(' ');
  const tags = Array.isArray(pills) ? pills : (M.nameTag === false && facets.length ? [] : [{ text: name, colour: 0 }]).concat(facets, more);
  const body = tool ? [] : M.sheet ? M.sheet(it, own, pic) : M.lines ? it.body : [];
  return shapeCard_(it.kind, { look, name, row: own.row || {}, ...(M.off ? { off: !!M.off(it.raw || {}) } : {}), picture: pic,
    body, ...(tool ? { cut: tool } : {}), ...(M.facts && !tool && !body.length ? { empty: kcEmpty_() } : {}),
    ...(M.data || (tool && tool.state) ? { data: Object.assign(M.data ? M.data(it, own) : {}, tool && tool.state ? { state: tool.state } : {}) } : {}), ...(M.tagLook ? { tagLook: M.tagLook } : {}),
    ...(M.tiles ? { tiles: M.tiles(it, own) } : {}), ...(M.toolRow ? { toolRow: { key: own.key || '' } } : {}),
    ...(M.tagRows ? { tagRows: M.tagRows(it, own) } : {}),
    tags: M.facts ? itemFactsTags_(tags, name) : tags });
}
/* THE PERSON AND ITEM SHAPES (owner, 22 Nov, CARD SHAPES): which one a kind wears is kinds.json `shape`, never code. A Person is its picture, name,
   role tags, fact lines and links (tutor, person, figure, boxer); an Item its title, tags, lines, tiles and sheet (docket, task, food, partner,
   session, drive_area, assignment, product); a Reference its tags, fact lines, picture and links (spec, insert, content, practical, project,
   hist, manuscript, writing, event, chem, fooddb, venue, subject, level, mech); an Activity: Record its who/when tags, money or fact pills and status
   (post, booking and its receipt); a Learning: Question its tags, stem, answer box and actions (question). Each keeps only its own slots and is marked `data-shape` (and `data-item-kind`, read by tools/one-card.js). */
const kindShape_ = k => { const h = ((typeof ITEM_KINDS !== 'undefined' && ITEM_KINDS.kinds[k]) || {}).shape; return typeof h === 'string' ? h : ''; };
/* ONE CARD (owner, 25 Nov): every kind fills the question card's slots -- tags at the top, picture, body, sheet, tiles at the foot; a slot a kind
   has nothing for stays empty. */
const CARD_SLOTS_ = { Card: ['look', 'name', 'row', 'off', 'picture', 'tags', 'tagLook', 'tagRows', 'body', 'tiles', 'cut', 'empty', 'toolRow'] };
function shapeCard_(kind, s) {
  const shape = kindShape_(kind), keep = CARD_SLOTS_[shape];
  if (!keep) return s;
  const out = { shape, data: Object.assign({ 'item-kind': kind }, s.data || {}) };
  keep.concat('kind', 'key', 'id', 'card', 'item').forEach(f => { if (s[f] !== undefined) out[f] = s[f]; });
  return out;
}
/* FIND'S FACETS FOR AN ENTRY, in its kind's order (kinds.json `find.facets`), unless its kind keeps them off the card (`find.onCard: false`). */
function itemFacets_(M, own) {
  let f0 = [];
  try { f0 = M.facets !== false && typeof tagList_ === 'function' && own.key ? tagList_(own) : []; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'item:tags'); }
  if (!Array.isArray(f0)) return [];
  const at = f => { const i = (M.facetOrder || []).indexOf(f); return i < 0 ? 1e6 : i; };
  return f0.map((t, i) => [t, i]).sort((a, b) => (at(a[0].field) - at(b[0].field)) || (a[1] - b[1])).map(p => p[0]);
}
/* A FACTS CARD'S TAG LINE (`facts: true`), as findCard tidies one: a tag a picked chip already says goes (kcPicked_); the name leads unless a */
/* tag says it already (kcSays_); a tag longer than KC_TAG_MAX goes, unless it wears the name's colour. */
function itemFactsTags_(tags, name) {
  const said = kcPicked_(), lead = tags.length && tags[0].colour === 0 && String(tags[0].text) === name;
  const rest = (lead ? tags.slice(1) : tags).filter(t => !said.has(norm(String(t.text))));
  return (name && !kcSays_(rest.map(t => esc(String(t.text))).join('  '), name) ? [{ text: name, colour: 0 }] : []).concat(rest)
    .filter(t => t.colour === 0 || String(t.text).trim().length <= KC_TAG_MAX);
}
/* A TOOL'S HTML ON A CARD (`tool`): cut into the parts (kcSplit_), `lead` (the card's body) before its lines, its tile rows lifted (kcHoist_), */
/* then (a facts card) a form kept open and whole, else its words as lines and the original hidden for a late filler (kcFacts_). */
function itemTool_(html, lead, facts) {
  const cut = kcSplit_(String(html || '').trim()) || { cls: '', lines: String(html || '') };
  const hoist = kcHoist_(lead + cut.lines);
  const out = { cls: String(cut.cls || '').split(/\s+/).filter(c => c && !/^(card|fc|kc)$/.test(c)).join(' '), lines: hoist.lines, form: '', tiles: hoist.tiles,
    /* ITS SHAPE STATE (a receipt, done) goes with its classes onto the card. */
    state: (/\sdata-state="([^"]*)"/.exec(cut.attrs || '') || [])[1] || '' };
  if (!facts) { out.lines = kcTidy_('', out.lines, '').lines; return out; }
  const f = kcFacts_(out.lines);
  if (f.form) { out.lines = ''; out.form = f.form; } else out.lines = (f.lines || kcEmptyLine_()) + (f.src ? kcSrc_(f.src) : '');
  out.tiles += f.tiles;
  kcFactsWatch_();
  return out;
}
/* EACH CARD KIND DRAWN FROM MAPS: the map whose `when` the entry answers (else the first without one), its row from the entry's `from`. */
const itemMapOf_ = x => { const ks = Object.keys(ITEM_MAPS).filter(k => (ITEM_MAPS[k].card || k) === x.kind);
  return ks.find(k => ITEM_MAPS[k].when && ITEM_MAPS[k].when(x)) || ks.find(k => !ITEM_MAPS[k].when) || ks[0]; };
const itemOfEntry_ = x => { const k = itemMapOf_(x), f = ITEM_MAPS[k].from; return x.shape || item_((typeof f === 'function' ? f(x) : x[f || 'row']) || {}, k); };
[...new Set(Object.keys(ITEM_MAPS).map(k => ITEM_MAPS[k].card || k))].forEach(c => cardKind_(c, x => cardOfItem_(itemOfEntry_(x), x)));
/* A PERSON'S FACTS (owner, 16 Nov; kinds.json person `facts`): the owner's stated facts, aged to today, on the card for staff and admins only. */
function personFacts_(id, now) {
  const F = ITEM_KINDS.kinds.person.facts, d = now || new Date();
  return (typeof DATA === 'object' && DATA && Array.isArray(DATA.personFacts) ? DATA.personFacts : []).filter(f => f && String(f.who) === String(id) && F.keys.indexOf(f.what) >= 0)
    .map(f => ({ what: f.what, value: factAged_(f, F.ages[f.what], d) }));
}
/* "7-8" or "11" moved up by the Septembers since as_of (school_year) or the whole years (age); anything else as stated. */
function factAged_(f, how, now) {
  const at = new Date(f.as_of), v = String(f.value == null ? '' : f.value);
  if (!how || isNaN(at)) return v;
  let n = 0;
  if (how === 'year') n = Math.max(0, Math.floor((now - at) / 31557600000));
  else for (let y = at.getFullYear(); y <= now.getFullYear(); y++) { const s = new Date(y, 8, 1); if (s > at && s <= now) n++; }
  return n ? v.replace(/\d+/g, x => String(Number(x) + n)) : v;
}
/* ONE PERSON BODY (CARD SHAPES): its kind's `card.parts` in order, each drawn here. A tutor: where and when first (owner, 19 Nov), then who */
/* they are, then the record; the note only if `live` kept it. A person: their handle and Edit form, then the owner's facts to those `facts.see` names. */
const PERSON_PARTS_ = {
  note: (t, L) => (((L || {}).say || {}).note ? { type: 'text', look: 'prof-say prof-hid', text: L.say.note } : null),
  places: t => profPlaces_([String(t.town || '').trim()].filter(Boolean)),
  hours: t => profAvail_(t),
  about: t => (t.description ? { type: 'text', look: 'prof-say cut2', act: 'cut-open', text: t.description } : null),
  words: t => { const w = profList_(t.tags).slice(0, 3); return w.length ? { type: 'text', look: 'prof-words', text: w.map((v, i) => (i ? [{ i: '·' }, { b: v }] : [{ b: v }])) } : null; },
  photos: t => (Array.isArray(t.photos) && t.photos.length ? { type: 'photos', srcs: t.photos.map(u => pic(u)), more: 4 } : null),
  jobs: t => profJobs_(t),
  quals: (t, L, k) => profQuals_(t, k),
  door: t => (typeof personDoorBody_ === 'function' ? personDoorBody_(t) : []),
  facts: (t, L, k) => { const F = ITEM_KINDS.kinds[k].facts, facts = typeof may_ === 'function' && F.see.some(w => may_(w)) ? personFacts_(t.personId || t.id) : [];
    return facts.length ? { type: 'list', items: facts.map(f => ({ label: f.what.replace(/_/g, ' '), value: f.value })) } : null; }
};
/* ONE REFERENCE BODY (CARD SHAPES, Learning: Reference): its kind's `card.parts` in order. A part is data — {text: col, look} the row's column */
/* as a line, {tags: col} its words as tags, {paras: [col | "fields" | {each, f}]} one paragraph each (`fields` the kind's `card.fields`), {list: */
/* [line]} REFERENCE_LINES_ — or the name of the drawer a structured row's own file keeps (a spec's tree, an insert's sheet, the topic card's */
/* slots, a practical, a project, a history card). A drawer whose file is not loaded yet draws nothing. */
const REFERENCE_DRAWERS_ = { spec: 'specBody_', insert: 'insertBody_', topic: 'contentBody_', practical: 'practicalBody_', project: 'projectBody_', history: 'histTopicBody_' };
const referencePart_ = (p, r, L, k) => {
  if (typeof p === 'string') { if (p === 'insert' && typeof insWant_ === 'function') insWant_(r); const f = kindGlobal_(REFERENCE_DRAWERS_[p]); return f ? f(r) : []; }
  if (p.text) return r[p.text] ? Object.assign({ type: 'text', text: r[p.text] }, p.look ? { look: p.look } : {}) : null;
  if (p.tags) return (r[p.tags] || []).length ? { type: 'tags', tags: r[p.tags] } : null;
  if (p.paras) return { type: 'text', paras: [].concat(...p.paras.map(q => (q === 'fields' ? cardFieldsOf_(k, r).map(x => x.label + ' ' + x.value)
    : typeof q === 'object' ? (r[q.each] || []).map(e => String(e[q.f] || '')) : [r[q] || '']))) };
  return p.list ? { type: 'list', items: [].concat(...p.list.map(n => [].concat(REFERENCE_LINES_[n](r, L, k)))).filter(Boolean) } : null;
};
const referenceBody_ = (r, live, k) => ITEM_KINDS.kinds[k].card.parts.flatMap(p => [].concat(referencePart_(p, r, live, k))).filter(Boolean);
/* ONE RECORD BODY (CARD SHAPES, Activity: Record — a post, a booking and its receipt): its kind's `card.record` says it all as data. `name` is */
/* parts joined by " · ", each the first of its words that has a value (`nameMax` cuts it); `pills` the who/when tags; `status` the last pill, */
/* its look by its word (Unpaid is new); `sum` one line under them. A word is "=Words" said as is, a column, "col:name" a person's short name, */
/* "a.b" a live field (money maths stays in its hook, so a child, whose live prices are stripped, is told none) or a RECORD_FACTS_ entry. */
const RECORD_FACTS_ = {
  when: j => (typeof rcpWhen_ === 'function' ? rcpWhen_(j) : ''),
  paid: j => (typeof rcpPaid_ === 'function' ? rcpPaid_(j) : ''),
  who: j => (j.slots || []).map(sl => sl && sl.client).filter(Boolean).map(n => fmtName_(n)).join(', ') || (j.client ? fmtName_(j.client) : ''),
  weeks: j => { const n = Number(j.weeks || (typeof jobDates_ === 'function' ? jobDates_(j).length : 0)) || 0; return n ? n + (n === 1 ? ' week' : ' weeks') : ''; }
};
const recordWord_ = (w, r, live) => { const s = String(w), c = s.split(':');
  if (s[0] === '=') return s.slice(1);
  if (c[1] === 'name') return r[c[0]] ? fmtName_(r[c[0]]) : '';
  if (s.indexOf('.') > 0) return s.split('.').reduce((o, f) => (o || {})[f], live) || '';
  return RECORD_FACTS_[s] ? RECORD_FACTS_[s](r) : r[s]; };
const recordName_ = (R, r) => { const n = (R.name || []).map(p => [].concat(p).map(w => recordWord_(w, r, {})).find(Boolean)).filter(Boolean).join(' · ');
  return R.nameMax ? String(n).slice(0, R.nameMax) : n; };
const recordPills_ = (R, it) => { const st = R.status ? recordWord_(R.status.fact, it.raw, it.live) : '';
  return R.pills.map(w => ({ text: recordWord_(w, it.raw, it.live), colour: false }))
    .concat(R.status ? [{ text: st, colour: false, look: (R.status.look || {})[st] || '' }] : []).filter(t => t.text); };
const recordSum_ = (R, r, live) => { const said = R.sum.map(w => recordWord_(w, r, live)).filter(Boolean).join(' · ');
  return said ? [{ type: 'group', tag: 'p', look: 'rc-sum', text: said }] : []; };
const personBody_ = (r, live, k) => ITEM_KINDS.kinds[k].card.parts.flatMap(p => [].concat(PERSON_PARTS_[p](r, live, k))).filter(Boolean);
/* ONE QUESTION BODY (CARD SHAPES, Learning: Question): its kind's `card.question` says it as data. `stem` names the hook that draws its stem's */
/* figure (the card's picture); `box` the embed that draws its words and the one answer box (its look and tool); `actions` the hook for Check, */
/* the answer's reveal and the rest of its tiles. The marker is not here: the box and the tiles call it exactly as before. */
const questionBox_ = (Q, x, pic) => [{ type: 'embed', tool: Q.box.embed, look: Q.box.look, args: { key: x.key || '', pic: !!pic } }];
