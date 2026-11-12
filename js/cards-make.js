/* ---------- A CARD NEVER DRAWS ITS OWN INSIDES (owner, 10 Nov): a facts kind hands over words; findCard lays them out one way ---------- */
/* Before card-fields.json lands: the same `facts` and `icon` columns its rows hold (settings.js reads them into DATA.cardLook). */
const KC_LOOK_DEFAULT = Object.fromEntries(Object.entries({ receipt: 'pound', shop: 'cart', practical: 'tools', project: 'spark', content: 'doc', insert: 'doc', timeline: 'line', fight: 'hand', bible: 'doc', talmud: 'doc', quran: 'doc', worktext: 'doc', hadith: 'doc', writ: 'doc', pdtext: 'doc', orthotext: 'doc', hymn: 'sound', chem: 'spark', soon: 'spark', person: '', setting: 'tools', health: 'tick', offPosts: 'spark', offShop: 'cart', offBooking: 'book' }).map(([k, icon]) => [k, { facts: true, icon }]));
/* WHO HAS A FACE: a person's card keeps its photo or chosen picture; nobody else's is ever a profile picture. */
const KC_PERSON_KINDS = ['tutor', 'person', 'people', 'msg'];
const kcLook_ = kind => ((typeof DATA !== 'undefined' && DATA && DATA.cardLook) || KC_LOOK_DEFAULT)[kind] || {};
const kcEmpty_ = () => (typeof NOTHING_YET === 'string' ? NOTHING_YET : '');
/* A FORM STAYS A FORM: its own maker draws it, whole and unclamped, as the card's open content. */
/* A LIST OF THINGS EACH WITH ITS OWN TILES (`.kc-items` of `.kc-item`s, the checklist's) holds controls too, so it is drawn open and whole. */
const KC_FORM_SEL = 'input:not([type="hidden"]), select, textarea, form, .kc-items';
const KC_BLOCK = /^(P|LI|DIV|SECTION|ARTICLE|TR|DT|DD|H[1-6]|BLOCKQUOTE|PRE|UL|OL|DL|TABLE|FIGCAPTION|HEADER|FOOTER)$/;
/* SOME KIND HTML AS FACTS: plain lines, its buttons lifted out, the original kept hidden so a late filler still finds its target. */
function kcFacts_(html) {
  const out = { lines: '', tiles: '', form: '', src: '' };
  if (typeof document === 'undefined' || !String(html || '').trim()) return out;
  const t = document.createElement('template');
  t.innerHTML = html;
  if (!t.content || !t.content.querySelector) return out;
  /* A FORM CARD'S OWN HEADING GOES: the name is already the card's first tag. */
  if (t.content.querySelector(KC_FORM_SEL)) { const h = t.content.querySelector('h1, h2, h3, h4'); if (h) h.remove(); out.form = t.innerHTML; return out; }
  /* A BUTTON OR LINK INSIDE IS NO LINE: it joins the card's row (behind ⋯ unless it is the main). */
  t.content.querySelectorAll('[data-do], a[href], button').forEach(el => { if (el.parentNode && !el.closest('[data-kc-took]')) { el.setAttribute('data-kc-took', ''); out.tiles += el.outerHTML; el.remove(); } });
  out.tiles = out.tiles.replace(/ data-kc-took=""/g, '');
  const wait = t.content.querySelector('.loading');
  const said = [];
  const walk = node => {
    let buf = '';
    const flush = () => { const s = buf.replace(/\s+/g, ' ').trim(); if (s) said.push(s); buf = ''; };
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) { buf += n.nodeValue; return; }
      if (n.nodeType !== 1 || /^(SCRIPT|STYLE|SVG|IMG|CANVAS|VIDEO|TEMPLATE)$/i.test(n.nodeName) || n.hidden || n.classList.contains('loading')) return;
      if (n.nodeName === 'BR' || n.nodeName === 'HR') { flush(); return; }
      if (n.nodeName === 'TR') { flush(); const s = [...n.children].map(c => c.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join(': '); if (s) said.push(s); return; }
      if (KC_BLOCK.test(n.nodeName)) { flush(); walk(n); return; }
      buf += ' ' + n.textContent + ' ';
    });
    flush();
  };
  walk(t.content);
  out.lines = said.length ? said.map(s => `<p class="kc-line">${esc(s)}</p>`).join('') : wait ? wait.outerHTML : '';
  out.src = t.innerHTML;
  return out;
}
/* A LATE FILLER (an apps list, a count) writes into the hidden original; its card's lines are read again from it. */
function kcFactsWatch_() {
  if (kcFactsWatch_.on || typeof MutationObserver === 'undefined' || typeof document === 'undefined' || !document.body) return;
  kcFactsWatch_.on = true;
  let busy = false;
  /* A LIFTED BUTTON TAKES ITS NEW STATE (a count, disabled) from the redrawn original, matched by what it does. */
  const sync = (card, tiles) => { const t = document.createElement('template'); t.innerHTML = tiles;
    t.content.querySelectorAll('[data-do]').forEach(n => { const old = card.querySelector(`:scope > .kc-act [data-do="${n.getAttribute('data-do')}"]`); if (old) old.replaceWith(n); }); };
  const redo = src => { const card = src.closest('.card.kc'), box = card && card.querySelector(':scope > .kc-lines'); if (!box) return;
    const f = kcFacts_(src.innerHTML); box.firstChild && [...box.children].filter(k => k !== src).forEach(k => k.remove());
    box.insertAdjacentHTML('afterbegin', f.lines || `<p class="kc-line kc-empty">${kcEmpty_()}</p>`);
    if (f.tiles) { src.innerHTML = f.src; sync(card, f.tiles); } };
  /* AN OLD MAKER THAT REDRAWS ITS WHOLE CARD (`[data-libimp]`) has its new insides read as facts into the parts it pushed out. */
  const rewrap = (card, gone) => { const parts = gone.filter(n => n.nodeType === 1 && /^kc-(pic|head|tags|lines|form|act)$/.test(n.className)); if (!parts.length) return;
    const f = kcFacts_(card.innerHTML), lines = parts.find(n => n.className === 'kc-lines'), form = parts.find(n => n.className === 'kc-form');
    /* CONTROLS THAT ARRIVE LATE (a list loaded after the first draw) take a form part, open, in place of the lines. */
    if (f.form && !form && lines) { lines.className = 'kc-form'; lines.innerHTML = f.form; }
    else if (f.form && form) form.innerHTML = f.form;
    else if (lines) lines.innerHTML = (f.lines || `<p class="kc-line kc-empty">${kcEmpty_()}</p>`) + (f.src ? `<div class="kc-src" hidden>${f.src}</div>` : '');
    card.replaceChildren(...parts); if (f.tiles) sync(card, f.tiles); };
  new MutationObserver(list => { if (busy) return; busy = true; const seen = new Set();
    try {
      list.forEach(m => { const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (el && el.matches && el.matches('.card.kc.kc-facts') && m.removedNodes.length && !el.querySelector(':scope > .kc-act')) { rewrap(el, [...m.removedNodes]); return; }
        const src = el && el.closest && el.closest('.kc-src'); if (src) seen.add(src); });
      seen.forEach(redo);
    } catch (e) { oops_(e, 'card:facts'); } finally { busy = false; } }).observe(document.body, { subtree: true, childList: true, characterData: true });
}
/* ⋯ IS A CARD'S ONLY TOGGLE (owner, 10 Nov): a wrapping row of the other round buttons, under the row. */
on('kc-more', el => { const c = el.closest('.kc-row, .tile-row'), m = c && c.querySelector('.kc-more'); if (!m) return;
  m.hidden = !m.hidden; el.setAttribute('aria-expanded', m.hidden ? 'false' : 'true'); });
/* A KIND WHOSE CARD NEEDS ITS OWN ROW OR A TAIL (a conversation's messages) sets `window.KC_AROUND[kind] = (x, draw) => html`; `draw(extra)` is this card. */
function findCard(x, credits) {
  const around = x && !x.kcIn && (window.KC_AROUND || {})[x.kind];
  if (around) return around(x, extra => findCard(Object.assign({}, x, extra || {}, { kcIn: true })));
  /* A KIND WHOSE OWN FILE STILL WRITES ITS CARD (`window.KC_OWN[kind] = (x, credits) => html`) is cut into the parts; one already in the shape is kept whole. */
  const own = x && !x.kcOwn && x.kind && (window.KC_OWN || {})[x.kind];
  if (own) {
    let got = '';
    try { got = own(x, credits); } catch (e) { oops_(e, 'card:' + x.kind); }
    if (typeof got !== 'string' || !got || /^\s*<div class="card fc kc\b/.test(got)) return got || '';
    /* SEVERAL CARDS FROM ONE MAKER (site health's) are each cut into the shape. */
    const els = kcKids_(got), many = els.length > 1 && els.every(k => k.tag === 'div' && / card /.test(' ' + k.cls + ' '));
    const cuts = (many ? els.map(k => k.html) : [got]).map(kcSplit_);
    return cuts.every(Boolean) ? cuts.map(cut => findCard(Object.assign({}, x, { kcOwn: cut }))).join('') : got;
  }
  const it = x && (x.row || x.kcOwn) ? x : { kind: 'subject', row: x || {} };
  const t = kcRow_(it), name = it.name || t.title || t.name || '';
  const one = it.name ? it : Object.assign({}, it, { name });
  const s = it.kcOwn && kcSpec_(it.kind) === KC_BARE ? KC_OWN_SPEC : kcSpec_(it.kind);
  const run = list => (list || []).map(k => { try { const f = kcField_(k); return f ? f(one) || '' : ''; } catch (e) { oops_(e, 'card:' + k); return ''; } }).join('');
  const parts = { pic: run(s.pic), head: run(s.title), tags: run(s.tags), lines: run(s.lines), act: '' };
  parts.pic = kcPicOr_(one, parts.pic);
  /* A PANEL (card_) IS DRAWN WHILE FIND'S OWN LIST IS BEING MADE, so it never reads Find's chips back (that would build the list inside itself). */
  parts.tags = it.kcPanel ? parts.tags : kcUnpicked_(parts.tags);
  /* A CARD WITH NO TAGS OF ITS OWN STILL HAS ONE: its name (owner, 9 Nov: the name is a tag). */
  if (!parts.tags.trim() && name) parts.tags = `<div class="qtags">${qtag_(`${esc(name)}`, ` data-tag="0"`)}</div>`;
  /* NO TITLE LINE ON ANY CARD (owner, 9 Nov): the name is a tag, put first when the tags do not already say it. */
  if (name && parts.head && !kcSays_(parts.tags, name)) parts.tags = kcTagFirst_(parts.tags, name);
  parts.head = '';
  /* A ROW OF TILES ITS OWN MAKER DREW AMONG THE LINES joins the card's one row: its main leads, the rest wait behind ⋯. */
  const hoist = kcHoist_(parts.lines, it.kcPanel);
  parts.lines = hoist.lines;
  parts.act = kcActRow_(one, it.kcPanel ? '' : parts.lines, hoist.tiles);
  /* A FACTS KIND: its lines become plain words, a form its open content. */
  let facts = null;
  if (kcLook_(it.kind).facts || (it.kcPanel && KC_FORMY.test(parts.lines))) {
    facts = kcFacts_(parts.lines);
    if (facts.form) { parts.lines = ''; parts.form = facts.form; kcFactsWatch_(); }
    else { parts.lines = (facts.lines || `<p class="kc-line kc-empty">${kcEmpty_()}</p>`) + (facts.src ? `<div class="kc-src" hidden>${facts.src}</div>` : ''); kcFactsWatch_(); }
    if (facts.tiles) parts.act = kcActRow_(one, '', hoist.tiles + facts.tiles);
    parts.tags = kcTidy_(parts.tags, '', name).tags;
  }
  if (!facts && KC_WHOLE_KINDS.indexOf(it.kind) < 0) { const tidy = kcTidy_(parts.tags, parts.lines, name); parts.tags = tidy.tags; parts.lines = tidy.lines; }
  const off = (facts ? ' kc-facts' : '') + (it.kind === 'tutor' && t.listed === false ? ' is-off' : '') + (it.cardCls ? ' ' + esc(it.cardCls) : '');
  /* `cardData` BECOMES data-* ATTRIBUTES, so a card can be found again where it stands (a post's sheet, a conversation's redraw). */
  const data = Object.keys(it.cardData || {}).map(k => ` data-${k}="${esc(it.cardData[k])}"`).join('');
  /* ITS OWN MAKER'S CLASSES AND ATTRIBUTES STAY ON IT, so every handler's `closest('.qcard')` or `[data-key]` still finds it. */
  const mine = it.kcOwn || {}, ownCls = String(mine.cls || '').split(/\s+/).filter(c => c && !/^(card|fc|kc)$/.test(c)).join(' ');
  const label = /\saria-label=/.test(mine.attrs || '') ? '' : ` aria-label="${esc(name)}"`;
  return `<div class="card fc kc kc-${esc(it.kind || 'thing')}${s.cls ? ' ' + esc(s.cls) : ''}${ownCls ? ' ' + ownCls : ''}${off}"${data}${mine.attrs || ''}${label}>${
    (parts.form ? ['pic', 'head', 'tags', 'lines', 'form', 'act'] : KC_PARTS).map(p => `<div class="kc-${p}">${parts[p]}</div>`).join('')}</div>`;
}

/* EVERY OTHER CARD COMES HERE TOO (owner, 11 Nov: one template): its maker writes a plain `<div class="x">…</div>`; a form inside stays whole, the booking form's too. */
const KC_FORMY = /<(input(?![^>]*type="hidden")|select|textarea|form)\b|\bkc-items\b/;
function card_(html, kind, called) {
  const cut = kcSplit_(String(html || '').trim());
  if (!cut) return String(html || '');
  /* A DRAWING THAT IS NO PICTURE (a picker, an icon) stays among the lines, never dropped from the top. */
  /* A FACE BESIDE THE HEADING (a conversation's) is the card's picture when it is a real one. */
  const face = !cut.pic && /<img\b[^>]*>/.exec(cut.head || '');
  if (face) cut.pic = face[0];
  if (cut.pic && !kcRealPic_(cut.pic)) { cut.lines = cut.pic + cut.lines; cut.pic = ''; }
  const name = String((/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/.exec(cut.head || '') || [])[1] || cut.head || '').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  return findCard({ kind: kind || 'panel', kcOwn: cut, kcPanel: true, name: name || String(called || '') });
}

/* A CARD WHOSE INSIDES ARRIVE LATER (a list fetched after the screen drew) is built again round them, kept as the same element so its attributes stay. */
function cardFill_(el, inner, kind) {
  if (!el || typeof document === 'undefined') return;
  const cls = [...el.classList].filter(c => !/^(card|fc|kc|kc-[\w-]+)$/.test(c)).join(' ');
  const t = document.createElement('template');
  t.innerHTML = card_(`<div class="${cls}">${inner || ''}</div>`, kind);
  const fresh = t.content.firstElementChild;
  if (!fresh) return;
  el.className = fresh.className;
  el.replaceChildren(...fresh.childNodes);
}

/* Tapping one opens a sheet rather than expanding the card. § */

/* The switch. Admin only — a tutor who could list themselves could put themselves in front of
   clients before you had agreed to it. */
on('set-listed', el => {
  /* ---------- `el.checked` WAS READ HERE, AND THIS IS NO LONGER A CHECKBOX § */
  const on = !el.classList.contains('on');

  /* SAID BEFORE IT IS TRUE. It almost always becomes true, and the round trip is the only part
     anybody would notice. */
  tileSet_(el, { label: on ? 'Listed' : 'Not listed', on,
                 note: on ? 'clients can see them' : 'clients cannot see them' });

  api({ action: 'setListed',
    adminName: USER.name, name: USER.name,
    who: el.dataset.who, whoId: el.dataset.pid || '', on })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      toast(on ? 'Listed' : 'Hidden from clients');
      /* BY ID WHERE THERE IS ONE, for the reason the handler on the other end now records: a
         display name is derived from up to two cells and matching it is the fallback, not the
         route. */
      const id = el.dataset.pid || '';
      const t = (DATA.tutors || []).find(x => (id && String(x.personId) === id)
                                           || norm(x.title) === norm(el.dataset.who));
      /* AND NO LONGER PENDING: `setListed` writes TRUE or FALSE over the `PENDING` word either way. */
      if (t) { t.listed = on; t.pending = false; }
    })
    .catch(err => {
      /* PUT IT BACK. A switch that has not actually flipped must not keep saying it has — this is
         the one case where showing it early has a cost, and it is paid here. */
      tileSet_(el, { label: !on ? 'Listed' : 'Not listed', on: !on,
                     note: !on ? 'clients can see them' : 'clients cannot see them' });
      toast(why_(err));
    });
});

/* THE OTHER HALF OF THE CLICK HANDLER. § */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-do]');
  if (!el || !ACTIONS[el.dataset.do]) return;
  if (el.tagName !== 'SELECT' && !isCheckbox_(el)) return;
  /* The same reason as the click handler: an error that gets out of here loses its message. */
  try {
    ACTIONS[el.dataset.do](el, e);
  } catch (err) {
    console.error('[' + el.dataset.do + ']', err);
    toast(el.dataset.do + ' — ' + why_(err));
  }
});

/* Tapping a SUBJECT. It has emitted `data-do="subject"` since the screen was written and no
   handler was ever registered, so the third of the three lists on this tab was the one that did
   nothing when you pressed it. */

/* ---------- WHAT THE SITE ALREADY KNOWS IS NOT ASKED AGAIN (1040 friction) ---------- */
/* Once per form: only an EMPTY answer is filled, each still a dropdown to change; nothing here is a price, a payment or a send. */
let BOOK_PREFILLED = false;
function bookPrefill_() {
  if (BOOK_PREFILLED || !USER) return;
  BOOK_PREFILLED = true;
  const done = id => { BOOKING.done = uniq((BOOKING.done || []).concat([id])); };
  const only = st => { try { return (st.options() || []).filter(Boolean); } catch (e) { return []; } };
  /* THE USUAL CASE FIRST: an instant session, a new one, at home, no extra seats. */
  if (!BOOKING.how) BOOKING.how = 'Instant class';
  if (!BOOKING.joining) BOOKING.joining = NEW_LIST;
  /* AT HOME IS THE VENUE ROW MARKED `takes_all_seats` (48a), by its own label; none marked, the question stays open. */
  if (!BOOKING.loc) BOOKING.loc = ((bookableSpaces().find(x => x.takesAllSeats) || {}).label) || '';
  const seats = only(bookStep_('n'));
  if (!BOOKING.n && seats.length) BOOKING.n = seats[0];
  /* FIND'S CHIPS: a subject or level already picked there is the answer here. */
  const chip = f => ((typeof STUFF !== 'undefined' && STUFF.filters) || []).filter(x => x && x.field === f && !x.any).map(x => String(x.value))[0] || '';
  if (!(BOOKING.subjects || []).length && chip('subject')) { BOOKING.subjects = [chip('subject')]; done('subjects'); }
  if (!BOOKING.level && chip('level')) BOOKING.level = chip('level');
  if (!BOOKING.tutor && only(bookStep_('tutor'))[0] === 'No preference') BOOKING.tutor = 'No preference';
  /* THE FIRST TERM ON OFFER (the soonest), and the child when there is only one seat-holder to name. */
  const terms = only(bookStep_('interval'));
  if (!(BOOKING.interval || []).length && terms.length) { BOOKING.interval = [terms[0]]; done('interval'); }
  /* NEVER THE UNNAMED SEAT: it is no child the site knows, and an admin with no client yet kept it ticked beside the real child. */
  const named = only(bookStep_('kids')).filter(k => k !== UNNAMED);
  const kid = named.length === 1 ? named[0] : '';
  if (!(BOOKING.kids || []).length && kid) { BOOKING.kids = [kid]; done('kids'); }
}

/* ---------- BOOKING FROM A CARD § */
on('book-with', el => {
  closeSheet();
  /* WHAT THE CARD WAS ABOUT ANSWERS ITS ROW ON THE FORM (1040 friction): a tutor, a subject, a level. */
  const d = (el && el.dataset) || {};
  if (d.tutor) BOOKING.tutor = d.tutor;
  if (d.subject && !(BOOKING.subjects || []).length) { BOOKING.subjects = [d.subject]; BOOKING.done = uniq((BOOKING.done || []).concat(['subjects'])); }
  if (d.level && !BOOKING.level) BOOKING.level = d.level;
  BOOK_OPEN = true;
  finderSet_(FINDERS.stuff, { filters: [{ field: DOOR_FIELD, value: 'Booking' }], show: true });
  go('stuff');
});


/* `on('prof-shot')` WAS HERE — a tutor's extra photograph opened across its row on a tap. Taken out
   on request (10 Oct, `findCard`): the squares are pictures, not controls. */
