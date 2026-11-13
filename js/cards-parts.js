
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
  name: x => `<h3>${esc(x.name || '')}</h3>`,
  /* THE TUTOR'S COMPACT ONE-SCREEN CARD (547) as fields: face, role, the name line with the rate, then pills and lines. */
  /* A PHOTO, ELSE A DEFAULT PICTURE (owner, 9 Nov): never an avatar figure on a card. */
  face: x => { const t = kcRow_(x), k = typeof picKind_ === 'function' ? picKind_(t.image) : (t.image ? 'photo' : '');
    if (k === 'photo') return `<img class="prof-pic" src="${esc(pic(t.image))}" alt="" loading="lazy" decoding="async">`;
    return k === 'basic' && typeof pfpArt_ === 'function' ? pfpArt_(pfpChoice_(t.image), 96) : ''; },
  /* THE NAME IS A TAG (owner, 9 Nov): first name and an initial for everyone; the role and rate are tags beside it. */
  nameTag: x => { const t = kcRow_(x), tag = (v, n, c) => qtag_(esc(v), ` data-tag="${n}"`, c, 'prof-tag');
    return `<div class="qtags prof-tags prof-who-tags">${tag(displayName_(t, CARD_VIEWER), 0, 'prof-tag-name')}${
      [t.role || 'Tutor'].concat(profList_(t.titles)).map(v => tag(v, 1)).join('')}${
      t.rate && !childView_() ? tag(rateRange_(t), 4, 'prof-tag-rate') : ''}${t.activity ? tag(t.activity, 3, 'prof-act') : ''}${
      t.listed === false ? tag(t.pending ? 'asked to tutor' : 'not listed', 9, 'prof-off') : ''}</div>`; },
  /* A TICKED TUTOR BOX IS A QUESTION TO THE ADMIN, answered by the eye tile; the line says what pressing it means. */
  listedNote: x => { const t = kcRow_(x); if (!(t.listed === false && isAdmin())) return '';
    return t.pending ? `<p class="prof-say prof-hid">They ticked Tutor in their settings. Until you list them they are not on the site,
      cannot be booked and cannot take a session — the crossed-out eye below approves them.</p>`
      : '<p class="prof-say prof-hid">Clients cannot see them. The crossed-out eye below puts them back on the site.</p>'; },
  /* SUBJECT PILLS: one chip a subject, its levels raised (`teachGroups_`). */
  teaches: x => { const t = kcRow_(x), main = profList_(t.teachesSpec || t.teachesMain), also = profList_(t.teaches).filter(v => !main.includes(v));
    return (main.length ? `<div class="qtags prof-tags prof-teach">${
      PROF_MORE_(teachGroups_(main).map(g => teachChip_(g, true)), 3).join('')}</div>` : '')
      + (also.length ? `<div class="qtags prof-tags prof-teach">${
      PROF_MORE_(teachGroups_(also).map(g => teachChip_(g, false)), 2).join('')}</div>` : ''); },
  facts: x => { const f = profFacts_(kcRow_(x));
    return f.length ? `<div class="qtags prof-tags prof-teach prof-facts">${f.map(v => `<span class="prof-tag">${esc(v)}</span>`).join('')}</div>` : ''; },
  /* WHAT THEY WROTE: `doget.gs` already quotes it, so it is printed as said. */
  say: x => (kcRow_(x).description ? `<p class="prof-say cut2" data-do="cut-open">${esc(kcRow_(x).description)}</p>` : ''),
  photos: x => { const p = kcRow_(x).photos; return Array.isArray(p) && p.length ? `<div class="prof-photos">${PROF_MORE_(p.map(u =>
    `<span class="prof-shot"><img src="${esc(pic(u))}" alt="" loading="lazy" decoding="async" onerror="this.parentNode.remove()"></span>`), 4).join('')}</div>` : ''; },
  words: x => { const w = profList_(kcRow_(x).tags).slice(0, 3);
    return w.length ? `<p class="prof-words">${w.map(v => `<b>${esc(v)}</b>`).join('<i aria-hidden="true">·</i>')}</p>` : ''; },
  quals: x => profQuals_(kcRow_(x)),
  jobs: x => profJobs_(kcRow_(x)),
  /* THE MAP: the venues tab's `tutors_happy_here`; an older backend sends no key and nothing is drawn. */
  places: x => profPlaces_(profList_(kcRow_(x).venues)),
  /* DAY PILLS. */
  avail: x => profAvail_(kcRow_(x)),
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
  tutor: { cls: 'is-widget is-prof tcard', pic: ['face'], title: [], tags: ['nameTag', 'teaches', 'facts'], lines: ['listedNote', 'say', 'photos', 'words', 'quals', 'jobs', 'places', 'avail'], tiles: ['book-with:book:Book', 'msg-open:chat:Message'] },
  venue: { cls: 'venue-door', pic: [], title: [], tags: [], lines: [], tiles: [] },
  level: { cls: 'is-level', pic: [], title: [], tags: [], lines: [], tiles: ['book-with:book:Book'] },
  subject: { cls: 'is-subject', pic: [], title: [], tags: [], lines: [], tiles: ['book-with:book:Book'] },
  manuscript: { cls: 'hdb hdb-msc lib-c', pic: [], title: [], tags: [], lines: [], tiles: [] },
  writing: { cls: 'hdb lib-c', pic: [], title: [], tags: [], lines: [], tiles: [] },
  event: { cls: 'hdb lib-c', pic: [], title: [], tags: [], lines: [], tiles: [] },
  people: { cls: 'person lib-c', pic: [], title: [], tags: [], lines: [], tiles: [] },
  msg: { cls: 'msg-fc', pic: ['msgPic'], title: ['msgWho'], tags: ['msgTags'], lines: ['msgBody', 'msgTiles'], tiles: ['msg-reply:send:Reply'] },
  post: { cls: 'post-fc', pic: [], title: [], tags: [], lines: [], tiles: ['react:heart:Like'] },
  receipt: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['receiptTags'], lines: ['receiptSum', 'ownLines'], tiles: ['job-pay:pound:Pay'] },
  question: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  answer: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  shop: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: ['cart-add:cart:Buy'] },
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
  soon: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
  person: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  setting: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  health: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  offPosts: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
  offShop: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
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
    else if (/ [\w-]*tags /.test(c)) parts.tags = !parts.tags ? k.html : /<\/div>\s*$/.test(parts.tags) ? parts.tags.replace(/<\/div>\s*$/, k.inner + '</div>') : parts.tags + k.html;
    else parts.lines += k.html;
  });
  walk(kcKids_(card.inner));
  return parts;
}
/* ---------- EVERY CARD'S FOUR BUTTONS (owner, 9 Nov): main action, Message, Star, ⋯ -- the rest waits behind ⋯, opened in place. ---------- */
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
    || pick(t => KC_MAIN_ACTS.indexOf(kcAct_(t)) >= 0) || pick(t => !/^(fav|msg-open|card-share|find-top|rep-box|game-lock)$/.test(kcAct_(t)) && !/\bis-(admin|danger)\b/.test(t));
  const r = kcRow_(x), who = r.title || r.name || '';
  const msg = pick(t => kcAct_(t) === 'msg-open')
    || (x && x.key && typeof personTiles_ === 'function' && /^(tutor|person|people)$/.test(x.kind) ? personTiles_(x) : '')
    || tile_({ icon: 'chat', label: 'Message', act: 'msg-open', off: true, data: { to: who } });
  const star = pick(t => kcAct_(t) === 'fav')
    || tile_({ icon: 'star', label: 'Save', act: 'fav', off: true, data: { key: (x && x.key) || '', kind: (x && x.kind) || 'item' } });
  /* A CARD IS STATIC (owner, 10 Nov): with no main of its own, Share leads; the card already shows everything it holds. */
  const lead = main || pick(t => kcAct_(t) === 'card-share') || tile_({ icon: 'share', label: 'Share', act: 'card-share', off: !(x && x.key), data: { key: (x && x.key) || '' } });
  /* WHAT IS NOT A TILE (a verdict, a slot) stays beside the rest, behind ⋯. */
  const left = all.reduce((h, t) => h.replace(t, ''), [main, msg, star].reduce((h, t) => (t ? h.replace(t, '') : h), String(rest || '')));
  return `<span class="kc-four">${lead}${msg}${star}${tile_({ icon: 'more', label: 'More', act: 'kc-more' })}</span><span class="kc-more" hidden>${all.join('')}${left}</span>`;
}
/* THE CARD'S OWN ROW when no tool row of its own (a question's `qtRow_`) already carries the four. */
function kcActRow_(x, html, own) {
  if (/class="[^"]*\bkc-four\b/.test(html)) return '';
  let rest = own || '';
  try { rest += x && x.key && typeof cardRow_ === 'function' ? cardRow_(x, true) : ''; } catch (e) { oops_(e, 'card:tiles'); }
  /* A KIND'S TILE GREYED FOR WANT OF ONE goes when its own maker's row brought the real one. */
  const real = (String(own || '').match(KC_TILE_RE) || []).map(kcAct_);
  rest = rest.replace(KC_TILE_RE, t => (/\bkc-off\b/.test(t) && real.indexOf(kcAct_(t)) >= 0 ? '' : t));
  return `<div class="tile-row kc-row">${kcFour_(x, rest + tile_(kcOffOpts_(x, rest)))}</div>`;
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
  return /^\s*<(div|span) class="[^"]*\bqtags\b[^"]*"[^>]*>/.test(tags || '') ? String(tags).replace(/^(\s*<(?:div|span) class="[^"]*\bqtags\b[^"]*"[^>]*>)/, '$1' + tag) : `<div class="qtags">${tag}</div>` + (tags || '');
}
/* TAGS ARE SHORT FACTS, LINES HAVE NO HEADINGS (owner, 9 Nov): a longer tag (a credit) becomes a later line, open-only; a heading in the lines a plain line. */
const KC_TAG_MAX = 30;
/* A QUESTION, AN ANSWER, A SETTING AND SITE HEALTH hold a whole screen whose own checks read its headings: kept as drawn. */
const KC_WHOLE_KINDS = ['question', 'answer', 'setting', 'health'];
function kcTidy_(tags, lines, name) {
  const words = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/g, ' ').trim();
  const moved = [];
  tags = String(tags || '').replace(/<span class="qtag\b[^"]*"([^>]*)>((?:(?!<\/?span\b)[\s\S])*)<\/span>/g, (m, at, inner) =>
    (/data-tag="0"/.test(at) || words(inner).length <= KC_TAG_MAX ? m : (moved.push(`<p class="kc-credit">${inner}</p>`), '')));
  lines = String(lines || '').replace(/<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/g, (m, n, at, inner) => {
    if (name && norm(words(inner)) === norm(name)) return '';
    const a = /\sclass="/.test(at) ? at.replace(/\sclass="/, ' class="kc-h ') : ' class="kc-h"' + at;
    return `<p${a} role="heading" aria-level="${n}">${inner}</p>`;
  });
  return { tags, lines: lines + moved.join('') };
}
/* A TAG SAYS ONLY WHAT THE MENUS ABOVE HAVE NOT (owner, 6 Nov), on every kind: a tag whose words a picked chip already says goes. */
function kcUnpicked_(html) {
  const f0 = typeof STUFF !== 'undefined' && STUFF && STUFF.filters, f = Array.isArray(f0) ? f0 : [];
  const said = new Set();
  f.filter(c => c && !c.any).forEach(c => { said.add(norm(String(c.value))); try { if (typeof chipShow_ === 'function') said.add(norm(String(chipShow_(c) || ''))); } catch (e) { oops_(e, 'card:chip'); } });
  said.delete('');
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
  const list = named.length ? named : Object.keys(art);
  if (!list.length || typeof pfpArt_ !== 'function') return '';
  const r = kcRow_(x), k = String(r.personId || (x && (x.key || x.name)) || ''); let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return pfpArt_(list[h % list.length], 96);
}
/* A REAL PICTURE: a photo, a clip, or a drawing of this very thing (a manuscript, a car part, a timeline stop); a kind sign or icon is not one. */
const kcRealPic_ = h => /<(img|video|picture)\b|mfrclip-|class="(mech|tl)-pic"/.test(String(h || ''));
/* ---------- THE BOOKING KINDS AS SPECS (master template): a subject and a level are facts and their tutors' names as tags. ---------- */
const kcSurcharge_ = x => { const t = kcRow_(x); if (x.kind === 'level' && !t.priced) return { label: 'Surcharge', value: 'Not priced yet', tone: 'bad' };
  return kcPct_(t.mult) || t.mult === 1 ? { label: t.mult === 1 ? 'No surcharge' : 'Surcharge', value: kcPct_(t.mult) } : null; };
const kcTutorTags_ = x => (kcRow_(x).tutors || []).map(y => ({ text: y.title, colour: 3 }));
const kcName_ = x => ({ text: kcRow_(x).title || kcRow_(x).name || x.name || '', colour: 0 });
cardKind_('subject', x => { const t = kcRow_(x), lv = (t.levels || []).filter(Boolean), tut = kcTutorTags_(x);
  return { look: 'is-subject', tags: [kcName_(x)].concat(typeof tagList_ === 'function' && x.key ? tagList_(x) : [], tut),
    body: [{ type: 'list', items: [kcSurcharge_(x), lv.length ? { label: 'Levels', value: lv.join(', ') } : null,
      tut.length ? null : { label: 'Tutors', value: 'None yet', tone: 'bad' }].filter(Boolean) }] }; });
cardKind_('level', x => { const t = kcRow_(x), s = t.subjects || [], n = (t.tutors || []).length;
  return { look: 'is-level', tags: [kcName_(x)].concat(typeof tagList_ === 'function' && x.key ? tagList_(x) : [], kcTutorTags_(x)),
    body: [{ type: 'list', items: [kcSurcharge_(x), s.length ? { label: 'Subjects', value: s.map((v, i) => [i ? ', ' : '', { word: 'subject', text: v }]) } : { label: 'Subjects', value: 'None yet', tone: 'bad' },
      { label: 'Tutors', value: n ? String(n) : (typeof NO_TUTOR === 'string' ? NO_TUTOR : 'None yet'), tone: n ? '' : 'bad' },
      t.listed ? null : { label: 'Booking form', value: 'Not offered', tone: 'bad' }].filter(Boolean) }] }; });
/* A VENUE: its name and facets (its 8-bit building is no picture of it), its rooms as facts. A child is told the seats and not the price (398). */
const kcFacetTags_ = x => [kcName_(x)].concat(typeof tagList_ === 'function' && x.key ? tagList_(x) : []);
cardKind_('venue', x => { const t = kcRow_(x), kid = childView_();
  const say = (max, rate) => [max ? 'up to ' + max : '', kid ? '' : rate ? perHour_(rate) : 'free'].filter(Boolean).join(' · ');
  const one = (label, max, rate) => (say(max, rate) ? { label, value: say(max, rate) } : null);
  const rooms = (t.rooms || []).length ? t.rooms.slice(0, 4).map(r => one(r.name || 'Room', r.max, r.rate)) : [one('The room', t.maxCapacity, t.bestRate)];
  /* ITS 8-BIT BUILDING (find-doors.js), which the move to specs (2c2bab5) left behind. */
  const pix = typeof VENUE_PIX === 'object' && typeof venueShape_ === 'function' ? VENUE_PIX[venueShape_(x.row || {})] : null;
  return { look: 'venue-door', picture: pix ? { pix, alt: x.name } : null, tags: kcFacetTags_(x), body: [{ type: 'list', items: rooms.filter(Boolean) }] }; });
/* A WRITING AND AN EVENT: the name and the facets; a manuscript adds its own fragment, drawn where there is one. */
cardKind_('writing', x => ({ look: 'hdb lib-c', tags: kcFacetTags_(x) }));
cardKind_('event', x => ({ look: 'hdb lib-c', tags: kcFacetTags_(x) }));
cardKind_('manuscript', x => { const svg = typeof msFragSvg_ === 'function' ? msFragSvg_(kcRow_(x), x.msSideIx) : '';
  return { look: 'hdb hdb-msc lib-c', picture: svg ? { svg, alt: x.name } : null, tags: kcFacetTags_(x) }; });
