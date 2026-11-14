/* @family. — flyer.js THE FLYER MAKER (owner, 11 Nov): marketing from ONE source. Every word on a flyer is the Web profile's (brand tab) or the chosen tutor's own card. */
/* The person chooses only which (the business, or a tutor — a tutor only themselves), a campaign, the layout and which listed subjects; nothing is typed. */

/* THE FIXED LAYOUTS: what each prints, in order; `fields` are keys of `flyerSource_`'s answer and nothing else (check-flyer). */
const FLY_LAYOUTS = [
  { id: 'a4', name: 'A4 poster', note: 'one A4 page', fields: ['logo', 'name', 'head', 'tagline', 'slogan', 'say', 'photo', 'subjects', 'price', 'area', 'phone', 'site', 'cta', 'qr'] },
  { id: 'a5', name: 'A5 flyer', note: 'one A5 page', fields: ['logo', 'name', 'head', 'tagline', 'say', 'subjects', 'price', 'area', 'phone', 'cta', 'qr'] },
  { id: 'slip', name: 'QR slips', note: '10 business cards on A4', fields: ['name', 'head', 'subjects', 'phone', 'site', 'qr'], many: 10 },
];
const FLY_SUBJECTS_MAX = 6;
let FLY = { who: '', layout: 'a4', subj: null, camp: '' };
/* THE CAMPAIGNS (the old flyer maker's, 1100): data/settings/campaigns.json and copy.json, read into DATA.campaigns by settings.js. */
/* Each gives a headline, a paragraph, a style and which blocks print; the facts stay the profile's. Its own hex colours are not used: */
/* a style is one of four fixed paper looks (`fl-st-*`, tokens in :root). */
const FLY_STYLES = ['minimal', 'elegant', 'detailed', 'loud'];
const flyCampaigns_ = () => ((typeof DATA !== 'undefined' && DATA && DATA.campaigns) || []).filter(c => c && c.id && c.name && ((c.copy || {}).head || []).length);
const flyCampaign_ = id => flyCampaigns_().find(c => c.id === id) || null;
const flyCopy_ = (c, slot) => String((((c && c.copy) || {})[slot] || [])[0] ? c.copy[slot][0].text || '' : '');

/* A SUBJECT ONCE, its level dropped ("Maths (GCSE)" is Maths): a flyer names what is taught, the card says the levels. */
const flySubjects_ = list => {
  const seen = new Set();
  return (list || []).map(s => String(s || '').replace(/\s*\(.*\)\s*$/, '').trim()).filter(s => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
};
const flyTutors_ = () => ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).filter(t => t && t.title && t.listed !== false);
const flyMine_ = () => (typeof passFor_ === 'function' && USER ? passFor_(USER.name) : null);
/* WHO THIS VIEWER MAY MAKE A FLYER FOR: an admin, the business and every listed tutor; a tutor, their own card only. */
function flyWhoList_() {
  if (typeof isAdmin === 'function' && isAdmin()) return [{ id: 'web', label: brand('name', '@family.') }].concat(flyTutors_().map(t => ({ id: flyTutorId_(t), label: t.title })));
  const me = flyMine_();
  return me ? [{ id: flyTutorId_(me), label: me.title }] : [];
}
const flyTutorId_ = t => String((t && (t.handle || t.personId)) || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* THE ONE SOURCE: the Web profile's lines (as `webProfilePages_` reads them) or a tutor's own card. Every value is a string or a list of strings. */
function flyerSource_(who) {
  const site = String(brand('site', '')).replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const common = { site, phone: String(brand('phone', '') || ''), logo: typeof brandLogo_ === 'function' ? brandLogo_() : '',
    cta: brand('flyer_cta', 'Scan to book'), area: brand('area', '') };
  if (!who || who === 'web') {
    const rates = flyTutors_().map(t => Number(t.rate) || 0).filter(n => n > 0);
    const listed = String(brand('web_subjects', '') || '').split(',');
    return Object.assign(common, { kind: 'web', id: 'web', handle: '', name: brand('name', '@family.'),
      tagline: brand('web_tagline', 'Tutoring for every age, at home and online.'), photo: '',
      subjects: flySubjects_(listed.some(s => s.trim()) ? listed : flyTutors_().reduce((a, t) => a.concat(t.teaches || []), [])),
      price: brand('web_price', '') || (rates.length ? 'From ' + perHour_(Math.min(...rates)) : '') });
  }
  const t = flyTutors_().concat(flyMine_() || []).find(x => flyTutorId_(x) === who);
  if (!t) return null;
  const pics = Array.isArray(t.photos) ? t.photos : [];
  return Object.assign(common, { kind: 'tutor', id: flyTutorId_(t), handle: String(t.handle || ''), name: String(t.title || ''),
    tagline: String(t.subtitle || t.description || ''), photo: String(pics[0] || ''), subjects: flySubjects_(t.teaches || t.focus || []),
    price: Number(t.rate) > 0 ? perHour_(Number(t.rate)) : '', area: (t.venues || []).join(' · ') || common.area });
}
/* A CAMPAIGN LAID OVER A SOURCE: its headline (a `|` is a line break), paragraph, style and blocks; a block it leaves out is not printed. */
function flyerWith_(src, campId) {
  const c = flyCampaign_(campId);
  if (!src || !c) return src ? Object.assign({}, src, { camp: '', style: 'minimal', blocks: null, head: [], say: '', slogan: '' }) : src;
  const blocks = String(c.blocks || '').split(/\s+/).filter(Boolean);
  return Object.assign({}, src, { camp: c.id.toLowerCase(), style: FLY_STYLES.indexOf(c.style) !== -1 ? c.style : 'minimal', blocks,
    head: flyCopy_(c, 'head').split('|').map(x => x.trim()).filter(Boolean), say: flyCopy_(c, 'say'),
    slogan: blocks.indexOf('slogan') !== -1 ? brand('slogan', '') : '' });
}
/* WHICH FIELDS A CAMPAIGN'S BLOCKS MAY LEAVE OUT: price, its paragraph and the slogan; the QR always stays, it is how a sign-up is traced. */
const FLY_BLOCK_OF = { price: 'price', say: 'say', slogan: 'slogan' };
const flyKeeps_ = (s, f) => !s.blocks || !FLY_BLOCK_OF[f] || s.blocks.indexOf(FLY_BLOCK_OF[f]) !== -1;

/* THE QR'S ADDRESS: the site, a tutor's own card when it is theirs, and the source tag `came_from` records at sign-up. */
function flyerUrl_(src, layout) {
  if (!src || !src.site) return '';
  const q = (src.kind === 'tutor' && src.handle ? 'tutor=' + encodeURIComponent(src.handle) + '&' : '') + 'from=flyer-' + layout + '-' + src.id + (src.camp ? '-' + src.camp : '');
  return 'https://' + src.site + (/[/?]/.test(src.site.slice(-1)) ? '' : '/') + '?' + q;
}

/* ONE FIELD, drawn from the source only, as a block for the one card maker (`cardBlock_`); an empty value draws nothing. */
const flyLine_ = (look, text) => (text ? { type: 'group', tag: 'p', look, text } : null);
const FLY_DRAW = {
  logo: s => (s.logo ? { type: 'media', kind: 'image', look: 'fl-logo', src: s.logo } : null),
  /* A LINE THAT IS A HEADING, not an <h2>: inside a screen an h2 is a section rule (`.screen h2`). */
  name: s => (s.name ? { type: 'group', tag: 'p', look: 'fl-name', attrs: { role: 'heading', 'aria-level': '2' }, text: s.name } : null),
  head: s => ((s.head || []).length ? { type: 'group', tag: 'p', look: 'fl-head', blocks: s.head.map(l => ({ type: 'group', tag: 'span', text: l })) } : null),
  slogan: s => flyLine_('fl-slogan', s.slogan),
  say: s => flyLine_('fl-say', s.say),
  tagline: s => flyLine_('fl-tag', s.tagline),
  photo: s => (s.photo ? { type: 'media', kind: 'image', look: 'fl-photo', src: s.photo } : null),
  subjects: (s, o) => { const l = flyPicked_(s, o.subj); return l.length ? { type: 'list', look: 'fl-subj', items: l } : null; },
  price: s => flyLine_('fl-price', s.price),
  area: s => flyLine_('fl-area', s.area),
  phone: s => flyLine_('fl-phone', s.phone),
  site: s => flyLine_('fl-site', s.site),
  cta: s => flyLine_('fl-cta', s.cta),
  /* THE QR is the QR maker's drawing, laid in as it is (`inner`). */
  qr: (s, o) => { const u = flyerUrl_(s, o.layout); return u ? { type: 'group', look: 'fl-qr', attrs: { 'data-url': u }, inner: typeof qrSvg_ === 'function' ? qrSvg_(u, 'fl-qrsvg') : '' } : null; },
};
const flyPicked_ = (s, subj) => (s.subjects || []).filter(x => !subj || subj.indexOf(x) !== -1).slice(0, FLY_SUBJECTS_MAX);

/* THE SHEET: the layout's fields from the source, nothing else; QR slips are one slip ten times. A spec; `flyerSheet_` draws it. */
function flyerSheetSpec_(src, layout, subj) {
  const L = FLY_LAYOUTS.find(x => x.id === layout) || FLY_LAYOUTS[0], o = { layout: L.id, subj };
  if (!src) return null;
  const one = L.fields.filter(f => flyKeeps_(src, f)).map(f => { try { return FLY_DRAW[f](src, o); } catch (e) { return null; } }).filter(Boolean);
  const blocks = L.many ? Array.from({ length: L.many }, () => ({ type: 'group', look: 'fl-slip', blocks: one })) : one;
  return { type: 'group', look: `fl-sheet fl-${L.id} fl-st-${src.style || 'minimal'}`, blocks };
}
const flyerSheet_ = (src, layout, subj) => cardBlock_(flyerSheetSpec_(src, layout, subj));

/* ---------- THE CARD: three choices, a live preview, Download PDF ---------- */
function flyerBody_() {
  const who = flyWhoList_();
  if (!who.length) return { type: 'group', look: 'fl-body', blocks: [{ type: 'text', look: 'empty', text: brand('flyer_none', 'Your flyer comes from your tutor card; fill that in first.') }] };
  if (!who.some(w => w.id === FLY.who)) FLY.who = who[0].id;
  if (FLY.camp && !flyCampaign_(FLY.camp)) FLY.camp = '';
  const src = flyerWith_(flyerSource_(FLY.who), FLY.camp);
  const subs = (src && src.subjects) || [];
  const row = (items, act, on) => ({ type: 'group', look: 'fl-row', tiles: items.map(i => ({ form: true, kind: on(i) ? '' : 'quiet', label: i.label, act, data: { v: i.id }, pressed: on(i) })) });
  return { type: 'group', look: 'fl-body', blocks: [
    who.length > 1 ? row(who, 'fly-who', i => i.id === FLY.who) : null,
    flyCampaigns_().length ? row([{ id: '', label: 'No campaign' }].concat(flyCampaigns_().map(c => ({ id: c.id, label: c.name }))), 'fly-camp', i => i.id === FLY.camp) : null,
    row(FLY_LAYOUTS.map(l => ({ id: l.id, label: l.name })), 'fly-layout', i => i.id === FLY.layout),
    subs.length ? row(subs.map(s => ({ id: s, label: s })), 'fly-subj', i => !FLY.subj || FLY.subj.indexOf(i.id) !== -1) : null,
    { type: 'group', look: 'fl-prev', blocks: [flyerSheetSpec_(src, FLY.layout, FLY.subj)] },
    { type: 'group', look: 'fl-row', tiles: [{ form: true, label: 'Download PDF', act: 'fly-print' }] },
  ] };
}
/* THE CARD'S SPEC: its name the tag, the maker its one body block; `fl-maker` is how a redraw finds every copy. */
const flyerCardSpec_ = () => ({ kind: 'panel', look: 'fl-maker', name: 'Flyer maker', tags: ['Flyer maker'], data: { 'lay-card': 'staff:flyer' }, body: [flyerBody_()] });
function flyerCards_() {
  if (!USER || !rankAtLeast_('staff')) return [];
  /* FITTED ONCE IT IS ON THE PAGE: a card is drawn as a string before it has a width. */
  try { setTimeout(flyerFit_, 0); setTimeout(flyerFit_, 400); } catch (e) { /* drawn unfitted */ }
  return [renderCard(flyerCardSpec_())];
}

/* THE PREVIEW IS THE PRINTED SHEET, scaled to the card's width (its sizes are in mm, as printed). */
function flyerFit_() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.fl-prev').forEach(p => {
    const s = p.querySelector('.fl-sheet'); if (!s) return;
    const k = p.clientWidth / (s.offsetWidth || 1);
    s.style.transform = `scale(${k})`; p.style.aspectRatio = 'auto'; p.style.height = Math.ceil(s.offsetHeight * k) + 'px';
  });
}
/* EVERY COPY ON THE PAGE (both finders) drawn again round the new choice, as the same element (`cardFill_`). */
function flyerRedraw_() {
  /* The card's insides drawn again, the element kept (its place and listeners stay). */
  document.querySelectorAll('.card.fl-maker').forEach(c => { const t = document.createElement('template'); t.innerHTML = renderCard(flyerCardSpec_());
    const fresh = t.content.firstElementChild; if (fresh) c.replaceChildren(...fresh.childNodes); });
  flyerFit_();
}
on('fly-who', el => { FLY.who = el.dataset.v || ''; FLY.subj = null; flyerRedraw_(el); });
on('fly-camp', el => { FLY.camp = el.dataset.v || ''; flyerRedraw_(el); });
on('fly-layout', el => { FLY.layout = el.dataset.v || 'a4'; flyerRedraw_(el); });
on('fly-subj', el => {
  const all = (flyerSource_(FLY.who) || {}).subjects || [], v = el.dataset.v || '';
  const now = FLY.subj ? FLY.subj.slice() : all.slice();
  const at = now.indexOf(v);
  if (at === -1) now.push(v); else if (now.length > 1) now.splice(at, 1);
  FLY.subj = now.length === all.length ? null : now;
  flyerRedraw_(el);
});
/* "DOWNLOAD PDF" IS THE PRINT DIALOGUE, as the statement's: the sheet unscaled at the end of the body, the rest hidden (`.printing-flyer`). */
on('fly-print', () => {
  const src = flyerWith_(flyerSource_(FLY.who), FLY.camp); if (!src) return;
  const paper = document.createElement('div');
  paper.className = 'fl-paper fl-paper-' + FLY.layout;
  paper.innerHTML = flyerSheet_(src, FLY.layout, FLY.subj);
  document.body.appendChild(paper);
  document.body.classList.add('printing-flyer');
  const was = document.title;
  document.title = 'Flyer ' + src.name + ' ' + FLY.layout;
  const done = () => { document.body.classList.remove('printing-flyer'); paper.remove(); document.title = was; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(done, 4000);
  window.print();
});
try { window.addEventListener('resize', () => flyerFit_()); } catch (e) { /* no window in a check */ }

/* ---------- WHERE THEY CAME FROM: a flyer's `?from=flyer-…` kept on this phone until sign-up sends it (`register`, `came_from`) ---------- */
const FLY_FROM_KEY = 'came_from';
function cameFromSave_() {
  try {
    const f = String(new URLSearchParams(location.search).get('from') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
    if (f) localStorage.setItem(FLY_FROM_KEY, f);
  } catch (e) { /* no storage: the sign-up is simply not traced */ }
}
const cameFrom_ = () => { try { return localStorage.getItem(FLY_FROM_KEY) || ''; } catch (e) { return ''; } };
cameFromSave_();
