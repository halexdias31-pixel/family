/* @family. — find-finder.js ONE FILE, SPLIT. § */

/* ---------- SHOP & RESOURCES § */
/* FILTERS YOU ADD, not a mode you pick. § */
/* WHAT YOU HAVE NARROWED TO, and nothing typed: Find is chips only (owner, 8 Nov). */
/* `whose` IS ONLY EVER SET WHILE NOBODY IS SIGNED IN: § */
/* A `let` SINCE THE SECOND FINDER (below): § */
let STUFF = { filters: [], whose: '' };

/* A FINDER'S RECORD: who it is and — while it is not the bound one — its parked state. § */
const finder_ = o => Object.assign({
  items: { key: null, from: null, items: null },
  found: { key: null, from: null, items: null, total: 0 },
  pages: { from: null, pages: [] },
  chips: { key: null, from: null, out: {} },
  late: 0, tried: false,
  /* THE PAGES ABOVE THE QUESTION (526) and how many: none, but Find's for an admin (What's missing, missing.js). */
  lead: () => [], leadN: () => 0, leadOn: 0,
}, o);
const FINDER_EMPTY = 'Nothing in the shop or the library yet.';
const FINDERS = {
  stuff: finder_({ id: 'stuff', st: STUFF, place: 'find', widgets: true,
                   front: () => [].concat(typeof window.offlinePages_ === 'function' ? window.offlinePages_() : [], bookingPages_(), feedPages_(), bundlePages_()),
                   lead: () => (typeof missingLead_ === 'function' ? missingLead_() : []),
                   leadN: () => (typeof missingLeadN_ === 'function' ? missingLeadN_() : 0),
                   empty: FINDER_EMPTY }),
};
let FINDER = FINDERS.stuff;
function finderPark_(F) {
  F.st = STUFF; F.items = ITEM_MEMO; F.found = FIND_MEMO; F.pages = STUFF_PAGES;
  F.late = STUFF_LATE; F.tried = FIND_PLACE_TRIED;
}
function finderUnpark_(F) {
  STUFF = F.st; ITEM_MEMO = F.items; FIND_MEMO = F.found; STUFF_PAGES = F.pages;
  STUFF_LATE = F.late; FIND_PLACE_TRIED = F.tried;
}
function inFinder_(F, fn) {
  if (!F || F === FINDER) return fn();
  const was = FINDER;
  finderPark_(was); finderUnpark_(F); FINDER = F;
  try { return fn(); }
  finally { finderPark_(F); finderUnpark_(was); FINDER = was; }
}
/* THE ONE WRITER of a finder's question (R1): its chips, set whole. A `q` from an old caller is ignored (no box since 8 Nov). `paint: false` only to count first. */
function finderSet_(F, o) {
  F = F || FINDERS.stuff;
  o = o || {};
  return inFinder_(F, () => {
    STUFF.filters = Array.isArray(o.filters) ? o.filters.map(c => Object.assign({}, c)) : [];
    if (o.show) findShow_();
    /* WITHOUT `keepPage`, paintStuff puts the column back on its question page. */
    if (o.paint !== false) paintStuff();
  });
}
/* By screen id; and by the screen an element is drawn in, falling back to the column in front and then Find — a handler pressed from a detached button § */
function finderOf_(id) { return Object.prototype.hasOwnProperty.call(FINDERS, id) ? FINDERS[id] : null; }
function finderAt_(el) {
  const s = el && el.closest ? el.closest('.screen') : null;
  return (s && finderOf_(String(s.id).replace(/^s-/, ''))) || finderOf_(typeof AT === 'string' ? AT : '') || FINDERS.stuff;
}
function finderEach_(fn) { Object.keys(FINDERS).forEach(id => inFinder_(FINDERS[id], () => fn(FINDERS[id]))); }
/* FORGET WHAT EVERY FINDER FOUND, for a change to something both of them list,
   whose memo `FIND_MEMO.key = null` from outside a binding cleared on Find alone. */
function finderForgetFound_() { finderEach_(() => { FIND_MEMO.key = null; }); }
/* A finder's state from outside, for the files that load before this one (me.js) and the checks. */
function finderStates_() { return Object.keys(FINDERS).map(id => FINDERS[id].st); }
function paintFinder_(id, keep) { const F = finderOf_(id); if (F) inFinder_(F, () => paintStuff(keep)); }
/* `PAGER.stuff` and `PAGER.res` in shell.js: the question, the pages in front, then the results — each
   counted in its own binding, so asking for Find's count from inside the second finder's draw cannot
   count the wrong list. */
function finderPageCount_(id) {
  return inFinder_(finderOf_(id) || FINDERS.stuff, () => FINDER.leadN() + 1 + frontPages_().length + stuffPageCount());
}
/* THE PAGES ABOVE THE QUESTION CAME OR WENT (526: an admin signed in or out): the page you were on moves with them. */
function finderLeadShift_(F, n) {
  const was = F.leadOn || 0;
  F.leadOn = n;
  if (n !== was) PAGE[F.id] = Math.max(0, (PAGE[F.id] || 0) + n - was);
}
/* `is-lead` is what `paintStuff` keeps: it redraws only what is below the question. One tile row per thing, as `pages` draws (489). */
const finderLeadHtml_ = lead => cardBlocks_(lead.map(c => ({ type: 'group', tag: 'section', look: 'page is-lead', blocks: [{ type: 'group', look: 'pane', inner: rowsOne_(c) }] })));

/* The fields a filter can be ON, what each is called, and where its values come from. One table,
   so adding a way to filter is a row here and nothing else — the picker, the matching and the
   chip label all read it. */
/* ---------- ONE QUESTION AT A TIME § */
/* WHAT KINDS OF THING CAN BE FOUND. § */
/* A KIND'S OWN FIND CARD (kinds.json `find.draw`): your own tutor pass, a message door not yet on, a widget on the shop shelf. */
const findTutorCard_ = x => (USER && typeof meCard === 'function' && norm((x.row || {}).title) === norm(USER.name) ? meCard() : findCard(x));
const findMsgCard_ = (x, c) => findCard(x.soon ? Object.assign({}, x, { kind: 'soon' }) : x, c);
const findShopCard_ = (x, c) => (x.widget ? widgetCard_(x) : findCard(x, c));

/* EACH KIND WHOSE OWN FILE STILL WRITES ITS CARD (owner 1a, 8 Nov): `findCard` cuts what it writes into the one shape. */
window.KC_OWN = Object.assign(window.KC_OWN || {}, {
  question: thingCard_, answer: thingCard_,
  bible: x => bibleCard_(x), talmud: x => window.talmudCard_(x), quran: x => window.quranCard_(x),
  worktext: x => window.worksCard_(x), hadith: x => window.hadithCard_(x), writ: x => textsCard_(x), pdtext: x => pdtextsCard_(x), orthotext: x => window.orthoCard_(x),
  hymn: x => window.hymnsCard_(x), person: x => (x.add && typeof personAddCard_ === 'function' ? personAddCard_() : ''), tool: x => widgetCard_(x), game: x => widgetCard_(x),
  setting: x => (x.soon ? soonCard_(x) : settingDoorCard_(x)), health: x => (typeof healthCardOf_ === 'function' ? healthCardOf_(x.which) : ''),
});

/* WHAT A QUESTION'S ANSWER PAGE IS CALLED, as the kinds tab names it. */
const ansKind_ = () => (kindMap_().answer || {}).label || 'Answers';

/* A WIDGET'S FIND CARD (790) IS THE CARD ITS COLUMN DREW — slot, star, padlock, Suggest — started and stopped by arcade.js as a column's are (`finderWidgets_`). */
function widgetCard_(x) {
  if (x.widget && typeof widgetOnColumn_ === 'function') return widgetOnColumn_(x.widget, true);   /* `true`: with the admin's group, which a Find card keeps short (`layoutOpts_`) */
  return cardBlock_({ type: 'group', look: 'tool-name', blocks: [{ type: 'group', tag: 'h3', text: x.name }] });
}

/* THE OFF WIDGETS' NAMES (880), for a card whose file is never fetched: written by tools/tiers.js from map.js's WIDGETS, never by hand. */
const SOON_WIDGET_NAMES = { videos: 'Videos', termdates: 'Term dates', pixel: 'Pixel editor', libcards: 'Library cards', console: 'Console', wordgames: 'Word games', boardgames: 'Board games' };
/* AN OFF WIDGET THAT WAITS UNDER ANOTHER FRONT ANSWER (owner, 6 Nov: Homework under Tools); the rest wait under Coming soon. */
const SOON_WIDGET_UNDER = { videos: 'Videos' };
/* A FRONT ANSWER HOLDING ONLY COMING SOON CARDS IS GREYED, never hidden (owner, 7 Nov P7/P8): Videos and Games until one is turned on. */
/* One walk per list for every front answer (slow taps, 8 Nov): the front menu asked it a dozen times, a walk each. */
const FRONT_SOON_MEMO = new WeakMap();
function frontSoonOnly_(value) {
  if (value === 'Coming soon') return false;
  try {
    const items = stuffItems();
    let by = FRONT_SOON_MEMO.get(items);
    if (!by) {
      by = {};
      items.forEach(x => asList_(kindTop_(x)).forEach(t => { const b = by[t] || (by[t] = { n: 0, soon: true }); b.n++; if (!x.soon) b.soon = false; }));
      FRONT_SOON_MEMO.set(items, by);
    }
    const b = by[value];
    return !b ? soonItems_().some(x => x.top === value) : b.soon;
  } catch (e) { return false; }
}
/* EVERY SWITCHED-OFF COLUMN AND WIDGET, from columns.json and tiers.json, so turning one on removes its card. */
function soonItems_() {
  /* A COLUMN WHOSE THINGS ARE FIND ITEMS NOW (batch C: settings, reels) is no Coming soon card. */
  const inFind = c => c.inFind || (typeof screenMoved_ === 'function' && /^find:Settings:/.test(screenMoved_()[c.screen] || ''));
  const cols = ((DATA && DATA.columnsOff) || []).filter(c => !inFind(c)).map(c => ({ kind: c.soonKind || 'soon', name: c.label, sub: c.what || '', image: '', key: 'soon:' + c.screen, soon: 'column', soonId: c.screen }));
  const ws = (typeof TIER_OFF_WIDGETS !== 'undefined' ? TIER_OFF_WIDGETS : []).map(id => ({ kind: 'soon', name: SOON_WIDGET_NAMES[id] || id,
    sub: SOON_WIDGET_NAMES[id] || id, image: '', key: 'soon:w:' + id, soon: 'widget', soonId: id, top: SOON_WIDGET_UNDER[id] || '' }));
  return cols.concat(ws).map(x => Object.assign(x, { text: [x.name, x.sub].join(' ') }));
}
/* A SWITCHED-OFF THING'S SPEC: "Coming soon" is a tag beside its name, never a line; what it is, below. */
const soonSpec_ = x => ({ look: 'soon-card', tags: [{ text: x.name, colour: 0 }, { text: brand('comingSoon', 'Coming soon') }],
  body: [{ type: 'text', text: x.sub && x.sub !== x.name ? x.sub : brand('soonSay', 'Not switched on yet.') }] });
['soon', 'offPosts', 'offShop', 'offBooking'].forEach(k => cardKind_(k, soonSpec_));
const soonCard_ = x => renderCard(Object.assign({ kind: x.kind || 'soon', key: x.key }, soonSpec_(x)));

/* The card a resource and a shop row share. Named rather than written twice, because the two
   entries above genuinely want the same thing and a copy each is a copy to keep in step. */
function thingCard_(x, credits) {
  /* A SHOP THING IS NOT DRAWN HERE ANY MORE: its card is its item map (ITEM_MAPS.product, cards-parts.js), its price tag `shopPriceTag_`. */
  {
    /* ---------- A QUESTION IS A QUESTION. THERE ARE NO DOCUMENTS ON THIS SCREEN. § */
    if (isQ_(x)) return findCard(x);

    /* THE CARD IS NO LONGER A BUTTON. § */
    /* NOTHING ON THIS LIST IS A TAP TARGET ANY MORE. § */
    /* A WEARABLE DRAWS ITSELF. § */
    /* ---------- A RESULT IS READ LIKE A SEARCH RESULT § */
    /* THE LEVEL, NOT THE KEY STAGE — `KS3, KS4` on a crumb is the grey area the owner asked to stop seeing; `levelOf_` says GCSE. § */
    /* Its own second line: § */
    /* THE YEAR, ON THE CARD. § */
    /* WHO IT IS FROM, FIRST. § */
    return cardBlock_({ type: 'group', look: 'fc' + (x.wearable ? ' is-wear' : x.kind === 'topic' ? ' is-subject' : '') + (x.off ? ' is-off' : ''), blocks: [
      { type: 'group', look: 'thing', blocks: [
        x.image ? { type: 'group', tag: 'img', look: 'thing-pic', attrs: { src: pic(x.image), alt: '', loading: 'lazy', decoding: 'async' } } : null,
        { type: 'group', look: 'thing-body', inner: (cardBlock_({ type: 'group', tag: 'p', look: 'crumb', text: [x.company].concat(levelSaid_(x).length ? levelSaid_(x) : [x.keystage]).concat([
              x.bandType === 'year' ? (x.bandValue && 'Year ' + x.bandValue)
            : x.bandType === 'grade' ? (x.bandValue && 'Grade ' + x.bandValue)
            : x.bandType === 'stage' ? '' : x.bandValue, x.tier, yearOf(x)])
            .filter(Boolean).map(v => String(v)).join('  ') }))
          + cardBlock_({ type: 'group', tag: 'h3', text: x.name, inner: x.off ? ' ' + qtag_('deleted') : '' }) }] }] });
  }
}

/* A THING'S ENTRY. Wearables are the one kind decided by a FIELD rather than by `kind` — the shop holds both, and which it is depends on whether the row names a § */
/* THE FUNNEL'S ANSWERS, AS THE SHEET WANTS THEM. § */
/* WHAT CAN BE FOUND (rule 1.80): each Find entry kind of each kind in kinds.json, in that file's order, with its group, label, door (`under`), card and `see`. */
let KIND_LIVE = null;
function kindMap_() {
  if (KIND_LIVE) return KIND_LIVE;
  const out = {};
  Object.keys(ITEM_KINDS.kinds).forEach(k => {
    const K = ITEM_KINDS.kinds[k], f = K.find || {};
    if (!f.group) return;
    Object.keys(f.entries || { [(K.card || {}).card || k]: 1 }).forEach(e => {
      if (out[e]) return;
      const o = Object.assign({ kind: k, group: f.group, label: f.label, under: f.under || '', draw: f.draw || '', see: (K.see || {}).who || 'anyone' }, (f.entries || {})[e]);
      out[e] = Object.assign(o, { at: (Object.keys(out).length + 1) * 10, card: (x, c) => { const d = o.draw && kindGlobal_(o.draw); return d ? d(x, c) : findCard(x, c); } });
    });
  });
  return (KIND_LIVE = out);
}
/* WHO IS LISTED AN ENTRY (kinds.json `see.who`): a kind named nowhere never; `self` and `family` rows reach only their own, as the backend sends no one else's. */
const kindSees_ = x => { const m = x && kindMap_()[x.kind];
  return !!m && String(m.see).split(',').map(w => w.trim()).some(w => w === 'anyone' || may_(/^(self|family)$/.test(w) ? 'signedIn' : w)); };

/* THE GROUPS IN THE ORDER THEY ARE OFFERED, lowest `sort_order` of any kind in the group first —
   so a group moves by moving any one of its kinds, and there is no second list to keep in step. */
/* HELD AGAINST THE KIND MAP IT WAS READ FROM, because `facetTally_`'s comparator asks for it on every comparison while it sorts a question's answers — an § */
let GROUP_ORDER = null, GROUP_ORDER_FOR = null;
function groupOrder_() {
  const m0 = kindMap_();
  if (GROUP_ORDER_FOR !== m0 || !GROUP_ORDER) { GROUP_ORDER = groupOrderFresh_(m0); GROUP_ORDER_FOR = m0; }
  return GROUP_ORDER.slice();
}
function groupOrderFresh_(m) {
  const seen = {};
  Object.keys(m).forEach(k => {
    /* EVERY GROUP THE KIND IS IN, so a kind belonging to two puts its number against both — and a
       group still moves by moving any one of its kinds. */
    asList_(m[k].group).forEach(g => {
      if (seen[g] === undefined || m[k].at < seen[g]) seen[g] = m[k].at;
    });
  });
  return Object.keys(seen).sort((a, b) => seen[a] - seen[b] || cmpText(a, b));
}

/* A CARD'S TAGS ON ONE FACET. */
const facetTags_ = (G, x, page) => asList_(G.tagOf ? G.tagOf(x, page) : facetOwn_(G, x));
/* ONE VALUE OR SEVERAL, ALWAYS READ AS SEVERAL. § */
/* ---------- AND THE COMMON CASE IS ONE STRING, WHICH USED TO COST FOUR ALLOCATIONS § */
const asList_ = v => {
  if (typeof v === 'string') { const t = v.trim(); return t ? [t] : []; }
  if (v == null || v === false) return [];
  if (!Array.isArray(v)) { const t = String(v).trim(); return t ? [t] : []; }
  const out = [];
  for (let i = 0; i < v.length; i++) { const t = String(v[i] == null ? '' : v[i]).trim(); if (t) out.push(t); }
  return out;
};

function kindOf_(x) {
  if (x && x.wearable) return { group: 'Shop', label: 'Wearables' };
  return (x && kindMap_()[x.kind]) || { group: 'Shop', label: 'Things' };
}

/* EVERY VALUE ONE FACET GIVES THIS ITEM — the one reader the funnel, the filter and the card all ask. No facet hides
   behind another any more (396): a repeat on a card is the tag row's duplicate rule. */
function facetOwn_(facet, x) {
  return asList_(facet.of(x));
}

/* ---------- THE SAME FIFTY WORDS, FIVE THOUSAND TIMES EACH § */
const SPELL_KEYS = new Map();
const spellKey_ = v => {
  const raw = String(v == null ? '' : v);
  let k = SPELL_KEYS.get(raw);
  if (k === undefined) {
    k = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    SPELL_KEYS.set(raw, k);
  }
  return k;
};

/* THE FUNNEL'S QUESTIONS (396): a field, a label and a reader (`of`) each, asked by `facetWhy_`, sorted by `answerCmp_`,
   said by `facetSay_`, coloured by `tagOf_`. */
/* Two optional readers, both about the value: `tagOf` is what one PAGE carries (the answer page says Answers), `showOf`
   the name of a value that is an id (a paper). */
/* The order here is only the fallback for a facet the facets tab does not place; the tab's sort_order is the order, and the tie-break between equal splits. */
const FACET_READ = {
  forLabel: { of: x => x.groups || kindOf_(x).group },
  /* `Answers` BESIDE THE ITEM'S OWN KIND: a question with an answer is found by either, and its answer page carries the tag. */
  /* A KIND UNDER ANOTHER (kinds.json `find.under`, 610) ANSWERS ONLY THAT ONE HERE: Questions are reached through Practice, a Timeline through Library. */
  kindLabel: { of: x => kindTop_(x) || x.kindLabel || kindOf_(x).label,
    tagOf: (x, page) => kindTopTag_(x) || (page === 'ans' && isQ_(x) ? ansKind_() : (x.kindLabel || kindOf_(x).label)) },
  /* AND ITS OWN KIND IS THE NEXT QUESTION, asked by the one rule like any other (`Answers` beside a question that has one, and on no tool or video). */
  kindOwn: { of: x => !kindTop_(x) ? '' : notTop_(x, isQ_(x) && questionHasAns_(x) ? [kindOf_(x).label, ansKind_()] : (x.kindLabel || kindOf_(x).label)),
    tagOf: (x, page) => !kindTop_(x) ? '' : notTop_(x, page === 'ans' && isQ_(x) ? ansKind_() : (x.kindLabel || kindOf_(x).label)) },
  /* SUBJECT STRAIGHT AFTER WHAT KIND (494), as the facets tab orders it: "the library should go subject first". */
  /* THE FRONT DOORS' OWN MENUS (batch C, find-doors.js): each item answers only its own. */
  ...Object.fromEntries(['postState', 'postBy', 'postWhen', 'msgWith', 'profileType', 'settingFor', 'vidSubject', 'vidTopic', 'vidChannel', 'vidLevel', 'vidType', 'venueArea', 'venueFor', 'venueSize'].map(f => [f, { of: x => x[f] || '' }])),
  /* A STORE KIND'S OWN FACETS (kinds.json `find.facetCols`), each read off its row's column when the entry was made (form.js storeItems_). */
  ...Object.fromEntries(storeFacets_().map(f => [f, { of: x => x[f] || '' }])),
  projectType: { of: x => x.projectType || '' },
  subject: { of: x => x.subject },
  shelf: { of: x => x.shelf || '' },
  /* ONE FACET SET FOR EVERY WRITTEN WORK (520): the Bible, the Quran, the Talmud, the Hadith, the hymns and every other text
     answer the same questions, read off `writingOf_` (writings.js) — no loader has a private one. */
  /* ONE KIND OF VALUE A FACET (546): the religion, the language and whose translation are three questions, never one menu. */
  wReligion: { of: x => writingAt_(x, 'religion') },
  /* A COLLECTION IS A GROUP OF WORKS (600), so it is asked before Work: Rabbinic, Second Temple, Kabbalah; New Testament; Hadith. */
  wCollection: { of: x => writingAt_(x, 'collection') },
  /* WHAT IT IS BEFORE HOW IT IS WRITTEN (590): the work and the section a passage sits in, then its source, language and translation. */
  wWork: { of: x => writingAt_(x, 'work') },
  wSection: { of: x => writingAt_(x, 'section') },
  wSource: { of: x => writingAt_(x, 'source') },
  /* ONE LANGUAGE QUESTION FOR EVERYTHING WRITTEN (546): a text's language and a manuscript's (the history database) are one kind of answer. */
  wLanguage: { of: x => writingLanguageOf_(writingAt_(x, 'text')) || histCol_(x, 'language') },
  wText: { of: x => writingVersionOf_(writingAt_(x, 'text')) },
  wTradition: { of: x => writingAt_(x, 'tradition') },
  wBook: { of: x => writingAt_(x, 'book') },
  wChapter: { of: x => writingAt_(x, 'chapter') },
  wUnit: { of: x => writingAt_(x, 'unit') },
  wAuthor: { of: x => writingAt_(x, 'author') },
  wForm: { of: x => writingAt_(x, 'form') },
  wPrimacy: { of: x => writingAt_(x, 'primacy') },
  /* MECHANICS (548): a car's facts as tags, read off the row; a row answers only what it has. */
  /* BATCH E: one exact car or any first (`choose`: asked however lopsided), then each car attribute its own question and tag. */
  mScope: { of: x => mechScope_(x), tagOf: () => '', choose: true },
  mMake: { of: x => mechFit_(x, 'mMake'), tagOf: x => mechFitTag_(x, 'mMake') },
  mModel: { of: x => mechFit_(x, 'mModel'), tagOf: x => mechFitTag_(x, 'mModel') },
  mGen: { of: x => mechFit_(x, 'mGen'), tagOf: x => mechFitTag_(x, 'mGen') },
  mEngine: { of: x => mechFit_(x, 'mEngine'), tagOf: x => mechFitTag_(x, 'mEngine') },
  /* A LESSON WRITTEN TO A SPEC IS ONE TYPE BESIDE CHEMISTRY'S ELEMENTS AND SUBSTANCES (16 Nov): Library › Chemistry › Exam topics › GCSE › AQA. */
  mKind: { of: x => x.mKind || (specTreeOf_(x).topic ? 'Exam topics' : '') },
  mSystem: { of: x => x.mSystem || '' },
  mPhase: { of: x => mechFit_(x, 'mPhase'), tagOf: x => mechFitTag_(x, 'mPhase') },
  mMarket: { of: x => mechFit_(x, 'mMarket'), tagOf: x => mechFitTag_(x, 'mMarket') },
  mYears: { of: x => mechFit_(x, 'mYears'), tagOf: x => mechFitTag_(x, 'mYears') },
  mSize: { of: x => mechFit_(x, 'mSize'), tagOf: x => mechFitTag_(x, 'mSize') },
  mValves: { of: x => mechFit_(x, 'mValves'), tagOf: x => mechFitTag_(x, 'mValves') },
  mBadge: { of: x => mechFit_(x, 'mBadge'), tagOf: x => mechFitTag_(x, 'mBadge') },
  mFuel: { of: x => mechFit_(x, 'mFuel'), tagOf: x => mechFitTag_(x, 'mFuel') },
  mPart: { of: x => (x.kind === 'mech' && x.mFile !== 'models' && x.name) || '' },
  mPrice: { of: x => mechOwn_(x, 'parts', 'value') },
  /* A PC PART (batch E): what it is, its socket or form factor, the interfaces it uses and what it plugs into. */
  pcType: { of: x => mechOwn_(x, 'pc', 'type') },
  pcSocket: { of: x => mechOwn_(x, 'pc', 'socket') },
  pcIface: { of: x => mechOwn_(x, 'pc', 'iface') },
  pcLinks: { of: x => mechOwn_(x, 'pc', 'links') },
  /* CHEMISTRY (550): an element's category or a substance's or reaction's type, then group, period and state, off the row. */
  cCategory: { of: x => x.cCategory || '' },
  cGroup: { of: x => x.cGroup || '' },
  cPeriod: { of: x => x.cPeriod || '' },
  cState: { of: x => x.cState || '' },
  /* BATCH D: one people kind; a person's name, years and home are tags (the card has no title). */
  boxKind: { of: x => x.boxKind || '' },
  /* A BOUT'S FACTS ARE TAGS (445), like a question's: who, when, how. A boxer answers Fighter too, so his name finds him and his bouts. */
  fighter: { of: x => isFight_(x) && x.row ? [x.row.a, x.row.b].filter(Boolean) : isBoxer_(x) ? x.name : '' },
  personName: { of: x => (isPerson_(x) ? x.name : '') },
  boutMonth: { of: x => boutDate_(x).month },
  boutYear: { of: x => boutDate_(x).year },
  decade: { of: x => decadesOf_(x) },
  division: { of: x => x.division || '' },
  boutRound: { of: x => isFight_(x) && x.row && Number(x.row.endRound) > 0 ? 'Round ' + Number(x.row.endRound) : '' },
  boutMethod: { of: x => (isFight_(x) && x.row && String(x.row.method || '').trim()) || '' },
  /* THE TITLE THE FIGHT CARD LOST (490) said who won and which night: tags now, like everything else. */
  boutWinner: { of: x => boutWinner_(x) },
  boutEvent: { of: x => (isFight_(x) && x.row && String(x.row.event || '').trim()) || '' },
  /* THE HISTORY DATABASE'S (459): which table, the era its years touch, and its columns as ordinary tags (`histCol_`). */
  histKind: { of: x => x.histKind || (/^(pdtext|worktext|writ|writing|content)$/.test(x.kind) && [].concat(x.subject || []).indexOf('History') >= 0 ? 'Writings' : '') },
  histPart: { of: x => x.histPart || '' },
  histEra: { of: x => histErasOf_(x) },
  histMaterial: { of: x => histCol_(x, 'material') },
  histFormat: { of: x => histCol_(x, 'format') },
  histGenre: { of: x => histCol_(x, 'genre') },
  histRole: { of: x => (isPerson_(x) ? x.roles || [] : histCol_(x, 'roles')) },
  personYears: { of: x => personYears_(x) },
  personFrom: { of: x => (isPerson_(x) && x.from) || '' },
  histTheme: { of: x => histCol_(x, 'themes') },
  histRepository: { of: x => histCol_(x, 'repository') },
  histFound: { of: x => msFound_(x) },
  histDated: { of: x => msDated_(x) },
  /* ONE SIDE A CARD (507): the owner, "make front a tag and back a tag, so each widget displays one side". */
  histSide: { of: x => x.msSide || '' },
  histTheatre: { of: x => histCol_(x, 'theatre') },
  /* A WRITING'S OWN WORDS (499): which work, which chapter, which language. */
  /* A SHOP ITEM'S TAGS (499): what it is, how you get it, its price band, the brand, who it is for. */
  shopKind: { of: x => x.shopKind || '' },
  shopHow: { of: x => x.shopHow || '' },
  shopPrice: { of: x => x.shopPrice || '' },
  shopBrand: { of: x => x.shopBrand || '' },
  shopFor: { of: x => x.shopFor || '' },
  /* A THEME (740): "just tags for items in shops… like history", from the shop tab's `theme` column. */
  shopTheme: { of: x => x.shopTheme || '' },
  practicalType: { of: x => x.practicalType || '' },
  required: { of: x => !isPractical_(x) || !x.row ? '' : PRAC_NEED[x.row.excluded ? 2 : x.row.required ? 0 : 1] },
  /* ONE TYPE QUESTION (owner, 15 Nov): a card's own type, no type under another; a 5-a-day answers the ordinary facets. */
  documentType: { of: x => x.documentType || '' },
  level: { of: x => levelOf_(x) },
  /* A RESOURCE CAN BELONG TO MORE THAN ONE KEY STAGE; a SATs row's is read off its year when the cell is blank. */
  keystage: { of: x => { const s = satsStagesOf_(x); return s.length ? s : keyStagesAt_(x); } },
  /* A CHAPTER TAUGHT OVER SEVERAL YEARS ANSWERS EACH (770: "it should ask what year, no?" under KS2). */
  yearGroup: { of: x => x.bandValue && x.bandType === 'year' ? 'Year ' + x.bandValue : (x.years || []).map(y => 'Year ' + y) },
  bandValue: { of: x => x.bandValue && x.bandType === 'grade' ? 'Grade ' + x.bandValue : '' },
  /* A CARD WRITTEN TO A SPEC ANSWERS THE SPEC'S OWN HEADINGS INSTEAD (16 Nov), asked after its board: Library › Biology › AQA › 4.1 Cell biology. */
  topic: { of: x => topicShown_(x) && !specTreeOf_(x).topic ? (x.topic || topicOf_(x)) : [] },
  examBoard: { of: x => boardOf_(x) },
  specTopic: { full: true, of: x => specTreeOf_(x).topic },
  specPoint: { full: true, of: x => specTreeOf_(x).point },
  /* A "PLUS" TIER IS ITS OWN TIER'S (owner, 15 Nov): Foundation Plus is Foundation, Higher Plus is Higher. */
  /* A COMMA PARTS TIERS (owner, 17 Nov, N-20261117-tiertag): `Foundation,Higher` is two tags, as a key stage list is. */
  tier: { of: x => [...new Set(String(x.tier || '').split(',').map(t => t.trim().replace(/\s+Plus$/i, '')).filter(Boolean))] },
  /* THE YEAR, THEN THE MONTH, THEN THE PAPER — like the folders they came from. */
  examYear: { of: x => sittingOf_(x).year },
  /* MONTH AND DAY READ ANY ITEM'S DATE (owner, 15 Nov): a sitting's month, else the item's own date (`itemDate_`) — a 5-a-day's "5 October". */
  examMonth: { of: x => sittingMonth_(x) || itemDate_(x).month },
  examDay: { of: x => itemDate_(x).day },
  /* ONE TAG ON EVERY QUESTION (388; owner 10 Nov): answer checked against the scheme and type machine-marked, or not -- asked before Paper (529). */
  verified: { of: x => verifyTags_(x).verified },
  /* THE ID DECIDES WHO ANSWERS; its cover code is what is said (owner 8 Nov) — year, month, tier, board are their own facets, and tellApart_ adds one where two collide. */
  paperId: { of: x => (x.row && x.row.paper_id) || '',
    showOf: id => paperTag_(id) || paperLabel_(id), tagSay: id => paperTag_(id),
    /* TWO PAPERS ONE NUMBER APART BY NOTHING ELSE (Combined Science's Paper 1 Biology, Chemistry, Physics): their titles, sitting last. */
    nameOf: id => { const t = paperLabel_(id); return [t.replace(/\s+—\s+[^—]+$/, ''), t]; } },
  /* THE SECTION OF A PAPER SAT IN SECTIONS (770): an ordinary facet, asked whenever it splits (owner, 15 Nov). */
  paperSection: { of: x => { const r = paperSectionOf_(x && x.row); return r ? r.section + (r.topic ? ': ' + r.topic : '') : paperNameSection_(x); } },
  /* WHICH QUESTION, WHICH PART, HOW MANY MARKS: the words are the value, so the card and the button agree. */
  qNumber: { of: x => isQ_(x) && x.qNumber != null && String(x.qNumber) !== '' ? 'Q' + x.qNumber : '' },
  qPart: { of: x => qSplitOf_(x).part },
  qSub: { of: x => qSplitOf_(x).sub },
  marks: { of: x => Number(x && x.marks) > 0 ? Number(x.marks) + ' mark' + (Number(x.marks) === 1 ? '' : 's') : '',
    /* SAID AS THE PAPER PRINTS IT (owner 8 Nov, 28b): "[1]", while the value stays "1 mark". */
    showOf: v => { const m = /^(\d+) marks?$/.exec(String(v)); return m ? '[' + m[1] + ']' : v; } },
  /* A WORKSHEET'S MAKER (O3): Publisher went, being the exam board twice or this. */
  source: { of: x => sourceOf_(x) },
  needs: { of: x => asList_(x.needs) },
  /* HOW YOU DID (463): the viewer's own latest press on a question; an ordinary facet (signed out it is blank, so it cannot split). */
  myAttempt: { of: x => myAttemptOf_(x) },
  myResult: { of: x => myResultOf_(x) },
};


/* THE FUNNEL'S QUESTIONS (rule 1.80): data/settings/facets.json (ITEM_KINDS.facets) is each one's label, order and whether it is asked; FACET_READ only how it reads an item. */
let FACET_LIVE = null;
function facetList() {
  return FACET_LIVE || (FACET_LIVE = ITEM_KINDS.facets.filter(f => f.active !== false && FACET_READ[f.field])
    .map((f, i) => Object.assign({ field: f.field, label: f.label, at: facetNum_(f.sort_order, 1000 + i) }, FACET_READ[f.field])).sort((x, y) => x.at - y.at));
}

/* ---------- WHAT A SPREADSHEET CELL IS ALLOWED TO DO TO THE FUNNEL § */
const facetNum_ = (v, fallback) => {
  const n = Number(v);
  return v === null || v === undefined || v === '' || !isFinite(n) ? fallback : n;
};

/* A FACET BY ITS FIELD. */
let FACET_BY = null;
const facetBy = f => (FACET_BY || (FACET_BY = new Map(facetList().map(x => [x.field, x])))).get(f);

/** Does one item satisfy one chosen filter? One comparison, because a facet says how to read
    itself — the old version had a switch with a case per field, which is a place to forget one. */
function filterHit(x, f) {
  const facet = facetBy(f.field);
  if (!facet) return true;
  /* ANY OF THEM COUNTS. A tutor is in Booking and in People, and choosing either has to keep them — an `===` against a joined string would have matched neither. § */
  return facetOwn_(facet, x).some(v => spellKey_(v) === spellKey_(f.value));
}

/* WHERE A NAME'S DATE STARTS: § */
const SITTING_CUT_ = new RegExp('\\s[\\u2014\\u2013]\\s|\\s\\u00b7\\s(?=(?:(?:19|20)\\d{2}|'
                               + MONTH_NAMES.join('|') + ')$)');

function nameForms_(s) {
  const full = String(s == null ? '' : s).trim();
  const out = [];
  const cut = re => {
    const m = re.exec(full);
    if (!m || !m.index) return;
    const v = full.slice(0, m.index).trim();
    if (v && v !== full && out.indexOf(v) === -1) out.push(v);
  };
  /* AN EM DASH WITH SPACES ROUND IT, and an en dash for the same reason. § */
  cut(SITTING_CUT_);
  cut(/\s*[:(]/);
  out.sort((a, b) => a.length - b.length);
  /* ---------- AND THE NUMBER WITH ITS DATE, WHEN THE YEAR WAS SKIPPED § */
  const q = /\s*[:(]/.exec(full);
  const d = SITTING_CUT_.exec(full);
  if (q && q.index && d && q.index < d.index) {
    const v = full.slice(0, q.index).trim() + full.slice(d.index);
    if (v !== full && out.indexOf(v) === -1) out.splice(1, 0, v);
  }
  out.push(full);
  return out;
}

/* ---------- THE FILE, NOT THE MAPPED LIST — AND THIS IS THE THIRD FUNCTION THAT NEEDED IT § */
function libDocRows_() {
  return (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS && LIBRARY_ROWS.length)
    ? LIBRARY_ROWS : ((DATA && DATA.questions) || []);
}

/* A DOCUMENT ROW IN EITHER SPELLING. § */
const libIsDoc_ = r => !!r && (String(r.kind || '').toLowerCase() === 'document' || !!r.isDoc);

/* WHAT A PAPER ID IS CALLED: its document row's name, or the id itself — an unreadable button beats a blank one. */
const paperLabel_ = id => {
  const d = typeof docById_ === 'function' ? docById_(id) : null;
  const name = String((d && d.name) || id || '').trim(), sec = paperSectionOf_(d);
  /* A PAPER SAT IN SECTIONS IS ITS REAL NUMBER (770): "Paper 31: Statistics" was the owner's "paper thirty-something" — Paper 3, Section A. */
  return sec ? name.replace(/^Paper \d+\b/, 'Paper ' + sec.paper + ', ' + sec.section) : name;
};
/* A PAPER'S TAG IS THE CODE ON ITS COVER (owner 8 Nov 2026: "1MA1/3F", by the barcode), else its own number (1040 r12). */
const paperTag_ = id => {
  const d = typeof docById_ === 'function' ? docById_(id) : null, sec = paperSectionOf_(d), n = String((d && d.paper) || '').trim();
  const code = String((d && d.paper_code) || '').trim();
  /* "PAPER 1/2/3" FIRST (owner, 9 Nov), the cover code only where a paper has no number. */
  if (sec) return 'Paper ' + sec.paper;
  if (n) return 'Paper ' + n;
  const lead = /^(?:Practice paper|Paper|Component|Unit) \w+/i.exec(String((d && d.name) || '').trim());
  return lead ? lead[0] : code;
};
/* A SECTION NAMED ONLY IN THE PAPER'S TITLE is its own tag too. */
const paperNameSection_ = x => (/, (Section [A-F])\b/.exec(String((docById_(((x && x.row) || {}).paper_id) || {}).name || '')) || [])[1] || '';
/* WHICH SECTION OF ITS PAPER A DOCUMENT IS (770): § */
function paperSectionOf_(row) {
  const id = String((row && (row.paper_id || row.paperId)) || '');
  /* OR ITS TITLE SAYS IT (owner, 10 Nov): imported ids ("RS…-514") end in a row number, so "Paper 31: Statistics" read Paper 3 twice. */
  let doc = null;
  try { doc = row && row.name ? row : (typeof docById_ === 'function' ? docById_(id) : null); } catch (e) { doc = null; }
  const t = /^Paper (\d)(\d)\b(?::\s*([^—]+?))?\s*(?:—|$)/.exec(String((doc && doc.name) || ''));
  const m = /-(\d)(\d)$/.exec(id) || t;
  if (!m || String((row && row.paper) || '') !== m[1] || Number(m[2]) < 1 || Number(m[2]) > 6) return null;
  return { paper: m[1], section: 'Section ' + 'ABCDEF'[Number(m[2]) - 1], topic: String(row.section || (t && t[3]) || '').trim() };
}

/* THE SHORTEST FORM OF A NAME THAT IS STILL UNIQUE AMONG THE NAMES BESIDE IT — for every facet, on the button, the chip
   and the card alike (396). Sets `show` on each value in place; the last rung is the full name. */
function shortLabels_(values) {
  /* `text` IS THE DISPLAY STRING WHERE THE VALUE IS AN IDENTITY. § */
  const forms = values.map(v => nameForms_(v.text || v.value));
  let deepest = 0;
  forms.forEach(f => { if (f.length > deepest) deepest = f.length; });
  /* ---------- UNIQUE TO A READER, NOT TO `===` § */
  for (let rung = 0; rung < deepest; rung++) {
    const at = forms.map(f => f[Math.min(rung, f.length - 1)]);
    if (new Set(at.map(spellKey_)).size === at.length) {
      values.forEach((v, i) => { v.show = at[i]; });
      return values;
    }
  }
  values.forEach(v => { v.show = v.text || v.value; });
  return values;
}

/* HOW MANY PIECES THE WRITER BROKE IT INTO. Not a score out of ten — just "did a person put gaps in
   this", which is what tells a name from a slug. */
const spellGaps_ = v => (String(v).match(/[\s\-_/&.,()]/g) || []).length;
