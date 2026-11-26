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
const FINDER_EMPTY = 'Nothing in the library yet.';
const FINDERS = {
  stuff: finder_({ id: 'stuff', st: STUFF, place: 'find', widgets: true,
                   front: () => [].concat(typeof window.offlinePages_ === 'function' ? window.offlinePages_() : [], bookingPages_(), feedPages_()),
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
/* A KIND'S OWN FIND CARD (kinds.json `find.draw`): your own tutor pass. */
const findTutorCard_ = x => (USER && typeof meCard === 'function' && norm((x.row || {}).title) === norm(USER.name) ? meCard() : findCard(x));

/* EACH KIND WHOSE OWN FILE STILL WRITES ITS CARD (owner 1a, 8 Nov): `findCard` cuts what it writes into the one shape. */
window.KC_OWN = Object.assign(window.KC_OWN || {}, {
  question: thingCard_, answer: thingCard_,
  bible: x => bibleCard_(x), talmud: x => window.talmudCard_(x), quran: x => window.quranCard_(x),
  worktext: x => window.worksCard_(x), hadith: x => window.hadithCard_(x), writ: x => textsCard_(x), pdtext: x => pdtextsCard_(x), orthotext: x => window.orthoCard_(x),
  hymn: x => window.hymnsCard_(x), person: x => (x.add && typeof personAddCard_ === 'function' ? personAddCard_() : ''), tool: x => widgetCard_(x), game: x => widgetCard_(x),
  setting: x => (x.add ? (typeof personAddCard_ === 'function' ? personAddCard_() : '') : x.soon ? soonCard_(x) : settingDoorCard_(x)), health: x => (typeof healthCardOf_ === 'function' ? healthCardOf_(x.which) : ''),
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
const NEED_CALC_ = { 'Non-calculator': 1, 'Calculator allowed': 1 };
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
/* EVERY SWITCHED-OFF WIDGET, from tiers.json, so turning one on removes its card. */
function soonItems_() {
  const ws = (typeof TIER_OFF_WIDGETS !== 'undefined' ? TIER_OFF_WIDGETS : []).map(id => ({ kind: 'soon', name: SOON_WIDGET_NAMES[id] || id,
    sub: SOON_WIDGET_NAMES[id] || id, image: '', key: 'soon:w:' + id, soon: 'widget', soonId: id, top: SOON_WIDGET_UNDER[id] || '' }));
  return ws.map(x => Object.assign(x, { text: [x.name, x.sub].join(' ') }));
}
/* A SWITCHED-OFF THING'S SPEC: "Coming soon" is a tag beside its name, never a line; what it is, below. */
const soonSpec_ = x => ({ look: 'soon-card', tags: [{ text: x.name, colour: 0 }, { text: brand('comingSoon', 'Coming soon') }],
  body: [{ type: 'text', text: x.sub && x.sub !== x.name ? x.sub : brand('soonSay', 'Not switched on yet.') }] });
['soon', 'offPosts', 'offBooking'].forEach(k => cardKind_(k, soonSpec_));
const soonCard_ = x => renderCard(Object.assign({ kind: x.kind || 'soon', key: x.key }, soonSpec_(x)));

/* The card a resource draws. Named rather than written twice, because the two
   entries above genuinely want the same thing and a copy each is a copy to keep in step. */
function thingCard_(x, credits) {
  {
    /* ---------- A QUESTION IS A QUESTION. THERE ARE NO DOCUMENTS ON THIS SCREEN. § */
    if (isQ_(x)) return findCard(x);

    /* THE CARD IS NO LONGER A BUTTON. § */
    /* NOTHING ON THIS LIST IS A TAP TARGET ANY MORE. § */
    /* ---------- A RESULT IS READ LIKE A SEARCH RESULT § */
    /* THE LEVEL, NOT THE KEY STAGE — `KS3, KS4` on a crumb is the grey area the owner asked to stop seeing; `levelOf_` says GCSE. § */
    /* Its own second line: § */
    /* THE YEAR, ON THE CARD. § */
    /* WHO IT IS FROM, FIRST. § */
    return cardBlock_({ type: 'group', look: 'fc' + (x.kind === 'topic' ? ' is-subject' : '') + (x.off ? ' is-off' : ''), blocks: [
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
      out[e] = Object.assign(o, { at: (Object.keys(out).length + 1) * 10, card: (x, c) => { if (o.draw === 'none') return ''; const d = o.draw && kindGlobal_(o.draw); return d ? d(x, c) : findCard(x, c); } });
    });
  });
  return (KIND_LIVE = out);
}
const toolNameOf_ = x => { const door = ((ITEM_KINDS.kinds.tool || {}).find || {}).under;
  return door && asList_(kindTop_(x)).indexOf(door) !== -1 ? String((x.widget && (x.widget.name || x.widget.id)) || kindOf_(x).label || '') : ''; };
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
  return (x && kindMap_()[x.kind]) || { group: '', label: '' };
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
/* TAXONOMY:start — written by tools/taxonomy.js from data/settings/taxonomy.json; never edit here */
const TAXONOMY = {"History":{"subject":"History","library":{"levels":[{"facet":"histKind","label":"Topic","field":"histKind"},{"facet":"histPart","label":"Part","field":"histPart"}],"parts":{"timeline":"Timeline","people":"People","sources":"Sources","items":"Items"},"writings":{"kinds":["pdtext","worktext","writ","writing","content"],"answer":"Writings"}},"questions":{"levels":["exam_board","level","spec_code"],"boards":[{"board":"AQA","specs":[{"code":"8145","level":"GCSE","spec":"aqa-8145","components":[{"code":"8145/1AA","name":"Paper 1 Section A Option A America, 1840-1895: Expansion and consolidation"},{"code":"8145/1AB","name":"Paper 1 Section A Option B Germany, 1890-1945: Democracy and dictatorship"},{"code":"8145/1AC","name":"Paper 1 Section A Option C Russia, 1894-1945: Tsardom and communism"},{"code":"8145/1AD","name":"Paper 1 Section A Option D America, 1920-1973: Opportunity and inequality"},{"code":"8145/2AA","name":"Paper 2 Section A Option A Britain: Health and the people: c1000 to the present day"},{"code":"8145/2AB","name":"Paper 2 Section A Option B Britain: Power and the people: c1170 to the present day"},{"code":"8145/2AC","name":"Paper 2 Section A Option C Britain: Migration, empires and the people: c790 to the present day"},{"code":"8145/2BA","name":"Paper 2 Section B Option A Norman England, c1066-c1100"},{"code":"8145/2BB","name":"Paper 2 Section B Option B Medieval England: the reign of Edward I, 1272-1307"},{"code":"8145/2BC","name":"Paper 2 Section B Option C Elizabethan England, c1568-1603"},{"code":"8145/2BD","name":"Paper 2 Section B Option D Restoration England, 1660-1685"}]},{"code":"7042","level":"A-Level","spec":"aqa-7042","components":[{"code":"7042/1A","name":"Component 1A The Age of the Crusades, c1071-1204"},{"code":"7042/1B","name":"Component 1B Spain in the Age of Discovery, 1469-1598"},{"code":"7042/1C","name":"Component 1C The Tudors: England, 1485-1603"},{"code":"7042/1D","name":"Component 1D Stuart Britain and the Crisis of Monarchy, 1603-1702"},{"code":"7042/1E","name":"Component 1E Russia in the Age of Absolutism and Englightenment, 1682-1796"},{"code":"7042/1F","name":"Component 1F Industrialisation and the people: Britain, c1783-1885"},{"code":"7042/1G","name":"Component 1G Challenge and transformation: Britain, c1851-1964"},{"code":"7042/1H","name":"Component 1H Tsarist and Communist Russia, 1855-1964"},{"code":"7042/1J","name":"Component 1J The British Empire, c1857-1967"},{"code":"7042/1K","name":"Component 1K The making of a Superpower: USA, 1865-1975"},{"code":"7042/1L","name":"Component 1L The quest for political stability: Germany, 1871-1991"},{"code":"7042/2A","name":"Component 2A Royal Authority and the Angevin Kings, 1154-1216"},{"code":"7042/2B","name":"Component 2B The Wars of the Roses, 1450-1499"},{"code":"7042/2C","name":"Component 2C The Reformation in Europe, c1500-1564"},{"code":"7042/2D","name":"Component 2D Religious conflict and the Church in England, c1529-1570"},{"code":"7042/2E","name":"Component 2E The English Revolution, 1625-1660"},{"code":"7042/2F","name":"Component 2F The Sun King: Louis XIV, France and Europe, 1643-1715"},{"code":"7042/2G","name":"Component 2G The Birth of the USA, 1760-1801"},{"code":"7042/2H","name":"Component 2H France in Revolution, 1774-1815"},{"code":"7042/2J","name":"Component 2J America: A Nation Divided, c1845-1877"},{"code":"7042/2K","name":"Component 2K International Relations and Global Conflict, c1890-1941"},{"code":"7042/2L","name":"Component 2L Italy and Fascism, c1900-1945"},{"code":"7042/2M","name":"Component 2M Wars and Welfare: Britain in Transition, 1906-1957"},{"code":"7042/2N","name":"Component 2N Revolution and dictatorship: Russia, 1917-1953"},{"code":"7042/2O","name":"Component 2O Democracy and Nazism: Germany, 1918-1945"},{"code":"7042/2P","name":"Component 2P The Transformation of China, 1936-1997"},{"code":"7042/2Q","name":"Component 2Q The American Dream: reality and illusion, 1945-1980"},{"code":"7042/2R","name":"Component 2R The Cold War, c1945-1991"},{"code":"7042/2S","name":"Component 2S The Making of Modern Britain, 1951-2007"},{"code":"7042/2T","name":"Component 2T The Crisis of Communism: The USSR and the Soviet Empire, 1953-2000"}]}]},{"board":"Edexcel","specs":[]},{"board":"OCR","specs":[]}]}},"Maths":{"subject":"Maths","ideaNames":{"ma.alg.algebraic-proof":"Equations and identities","ma.alg.area-under-a-curve":"Gradients and areas under graphs","ma.alg.equation-of-a-circle":"Equation of a circle","ma.alg.equation-of-a-line":"Gradients and intercepts","ma.alg.equations":"Forming equations","ma.alg.expanding-brackets":"Expanding Brackets","ma.alg.formulae":"Formulae","ma.alg.function-machines":"Functions","ma.alg.gradient-of-a-curve":"Instantaneous rate of change","ma.alg.iteration":"Iteration","ma.alg.linear-equations":"Linear Equations","ma.alg.nth-term-of-a-linear-sequence":"nth Term of a Linear Sequence","ma.alg.quadratic-graphs":"Quadratic and other graphs","ma.alg.real-life-graphs":"Kinematics with constant acceleration, with worked examples","ma.alg.real-life-graphs-real-life-graph":"Real-Life Graphs","ma.alg.rearranging-formulae":"Rearranging Formulae","ma.alg.recognising-graph-shapes":"Recognising graphs","ma.alg.sequences":"Generating sequences","ma.alg.simplifying-and-collecting-terms":"Simplifying & Collecting Terms","ma.alg.simultaneous-equations":"Simultaneous equations","ma.alg.solving-inequalities":"Inequalities","ma.alg.solving-quadratics":"Solving Quadratics","ma.alg.straight-line-graphs":"Straight Line Graphs","ma.alg.substitution":"Substitution","ma.alg.transformations-of-graphs":"Transforming graphs","ma.alg.turning-points":"Quadratic graphs: roots and turning points","ma.alg.types-of-sequence":"Special sequences","ma.alstat.binomial-distribution":"Probability and the binomial distribution","ma.alstat.hypothesis-testing":"Hypothesis testing","ma.alstat.normal-distribution":"The normal distribution","ma.alstat.statistical-sampling":"Data, sampling and correlation","ma.geo.2-d-shapes":"Special triangles and quadrilaterals","ma.geo.2-d-shapes-2-d-shape":"2-D Shapes","ma.geo.3-d-shapes":"3-D Shapes","ma.geo.angles-at-a-point-and-on-a-line":"Angle facts","ma.geo.angles-in-polygons":"Angles in Polygons","ma.geo.angles-in-triangles-and-quadrilaterals":"Geometric reasoning","ma.geo.arcs-and-sectors":"Arcs and sectors","ma.geo.area-and-circumference-of-circles":"Circles, cylinders and spheres","ma.geo.area-of-any-triangle":"Area of Any Triangle","ma.geo.bearings":"Measuring and bearings","ma.geo.circle-theorems":"Circle Theorems","ma.geo.congruent-triangles":"Congruent triangles","ma.geo.constructions-and-loci":"Constructions & Loci","ma.geo.coordinates":"Coordinates","ma.geo.describing-a-single-transformation":"Describing a Single Transformation","ma.geo.exact-trig-values":"Exact Trig Values","ma.geo.parts-of-a-circle":"Parts of a Circle","ma.geo.perimeter":"Perimeter and area","ma.geo.plans-and-elevations":"Plans & Elevations","ma.geo.properties-of-shapes":"Properties of shapes","ma.geo.pythagoras-theorem":"Pythagoras' theorem","ma.geo.right-angled-trigonometry":"Right-Angled Trigonometry","ma.geo.rotations":"Position, direction and turns","ma.geo.similar-areas-and-volumes":"Comparing with ratio and scale factors","ma.geo.similar-shapes":"Similar shapes","ma.geo.similarity-and-congruence":"Transformations, congruence and similarity","ma.geo.the-sine-rule":"Sine and cosine rules","ma.geo.translations":"Position and direction","ma.geo.translations-vector-translation":"Vectors and translations","ma.geo.types-of-angle":"Angles","ma.geo.types-of-angle-geometric-term-notation":"Geometric terms and notation","ma.geo.units-and-measures":"Measuring: length, mass, capacity and temperature","ma.geo.units-and-measures-telling-time":"Telling the time","ma.geo.units-and-measures-unit-measure":"Units & Measures","ma.geo.vectors":"Vectors","ma.geo.volume-and-surface-area":"Volume & Surface Area","ma.mech.forces-and-newton-s-laws":"Forces & Newton's Laws","ma.mech.forces-and-newton-s-laws-friction-inclined-plane-worked":"Friction and inclined planes, with worked examples","ma.mech.kinematics":"Kinematics and projectiles","ma.mech.moments":"Moments","ma.num.adding-and-subtracting-fractions":"Adding, subtracting and multiplying fractions","ma.num.addition":"Number bonds","ma.num.addition-adding":"Adding","ma.num.addition-adding-subtracting":"Adding and subtracting","ma.num.addition-money":"Money","ma.num.bounds-and-error-intervals":"Bounds and error intervals","ma.num.calculating-with-decimals":"Decimals","ma.num.division":"Sharing and grouping","ma.num.equivalent-and-simplifying-fractions":"Equivalent & Simplifying Fractions","ma.num.estimation":"Estimation","ma.num.fraction-decimal-percentage-conversion":"Fraction Decimal Percentage Conversion","ma.num.fractions-of-an-amount":"Halves, quarters and thirds","ma.num.fractions-of-an-amount-fraction-amount":"Fractions of an Amount","ma.num.laws-of-indices":"Index laws","ma.num.long-multiplication":"Long multiplication and long division","ma.num.multiplication":"Doubling and halving","ma.num.multiplication-2-5-10-time":"The 2, 5 and 10 times tables","ma.num.multiplying-and-dividing-fractions":"How many fit? Dividing by measuring","ma.num.negative-numbers":"Negative Numbers","ma.num.order-of-operations":"Order of operations","ma.num.ordering-numbers-and-decimals":"Ordering numbers","ma.num.percentage-of-an-amount":"Percentage of an Amount","ma.num.place-value-and-ordering":"Place Value & Ordering","ma.num.primes-and-prime-factorisation":"Primes & Prime Factorisation","ma.num.reading-and-writing-numbers":"Counting to 100 and back","ma.num.rounding":"Rounding","ma.num.simplifying-surds":"Exact calculation","ma.num.squares-and-square-roots":"Powers and roots","ma.num.standard-form":"Standard Form","ma.num.subtraction":"Subtracting","ma.num.the-four-operations":"The four operations","ma.prob.basic-probability":"Basic Probability","ma.prob.conditional-probability":"Conditional Probability","ma.prob.listing-outcomes-and-sample-space":"Listing Outcomes & Sample Space","ma.prob.probability":"Probability, with worked examples","ma.prob.probability-binomial-distribution-worked-example":"The binomial distribution, with worked examples","ma.prob.relative-frequency-and-expectation":"Relative Frequency & Expectation","ma.prob.relative-frequency-and-expectation-expected-outcome":"Expected outcomes","ma.prob.relative-frequency-and-expectation-experiment-theory":"Experiment and theory","ma.prob.tree-diagrams":"Combined events and tree diagrams","ma.prob.venn-diagrams-and-set-notation":"Sets, Venn diagrams and outcomes","ma.pure.area-under-a-curve-by-integration":"Integration","ma.pure.binomial-expansion":"Sequences, series and binomial expansion","ma.pure.coordinate-geometry-a-level":"Coordinate geometry and parametric equations","ma.pure.differentiation":"Variable acceleration, with worked examples","ma.pure.differentiation-from-first-principles":"Differentiation","ma.pure.implicit-differentiation":"Further differentiation","ma.pure.iterative-methods":"Numerical methods","ma.pure.laws-of-logarithms":"Exponentials and logarithms","ma.pure.modulus-functions":"Algebra and functions","ma.pure.proof-by-deduction":"Proof","ma.pure.radians":"Trigonometry and radians","ma.pure.vectors-a-level":"Projectiles, with worked examples","ma.rat.compound-measures":"Compound Measures","ma.rat.direct-proportion":"Direct Proportion","ma.rat.growth-and-decay":"Growth and decay","ma.rat.inverse-proportion":"Inverse proportion equations","ma.rat.ratio-problems":"Ratio Problems","ma.rat.ratio-problems-multiplicative-relationship":"Multiplicative relationships","ma.rat.scale-drawings-and-maps":"Scale Drawings & Maps","ma.rat.sharing-in-a-ratio":"Sharing in a ratio","ma.stat.averages-from-a-table":"Averages from a Table","ma.stat.bar-charts-and-pictograms":"Tables, bar charts and line graphs","ma.stat.charts-and-diagrams":"Charts and diagrams","ma.stat.cumulative-frequency":"Histograms and cumulative frequency","ma.stat.histograms":"Data presentation and interpretation, with worked examples","ma.stat.pie-charts":"Pie charts and the mean","ma.stat.sampling":"Sampling","ma.stat.sampling-describing-population":"Describing a population","ma.stat.scatter-graphs-and-correlation":"Scatter Graphs & Correlation","ma.stat.statistics":"Data and statistics","ma.stat.statistics-hypothesi-testing-binomial-worked":"Hypothesis testing with the binomial, with worked examples","ma.stat.statistics-normal-distribution-worked-example":"The normal distribution, with worked examples"},"cards":{"levels":["part_of","idea_id"],"tree":"data/topics.json","boards":[{"board":"AQA","specs":[{"code":"8300","level":"GCSE","spec":"aqa-8300"}]},{"board":"Edexcel","specs":[{"code":"1MA1","level":"GCSE","spec":"edexcel-1ma1"}]}]},"dfe":{"dfe.ma.n":["Number",""],"dfe.ma.n.place":["Place value and ordering","dfe.ma.n"],"dfe.ma.n.place.count":["Counting, reading and writing numbers","dfe.ma.n.place"],"dfe.ma.n.place.value":["Place value","dfe.ma.n.place"],"dfe.ma.n.place.order":["Ordering and comparing numbers (=, ≠, <, >)","dfe.ma.n.place"],"dfe.ma.n.place.negative":["Negative numbers","dfe.ma.n.place"],"dfe.ma.n.place.roman":["Roman numerals","dfe.ma.n.place"],"dfe.ma.n.calc":["Calculating","dfe.ma.n"],"dfe.ma.n.calc.bonds":["Number bonds and mental adding","dfe.ma.n.calc"],"dfe.ma.n.calc.addsub":["Adding and subtracting","dfe.ma.n.calc"],"dfe.ma.n.calc.tables":["Times tables, doubling and halving","dfe.ma.n.calc"],"dfe.ma.n.calc.muldiv":["Multiplying and dividing","dfe.ma.n.calc"],"dfe.ma.n.calc.long":["Long multiplication and long division","dfe.ma.n.calc"],"dfe.ma.n.calc.decimals":["Calculating with decimals","dfe.ma.n.calc"],"dfe.ma.n.calc.order":["Order of operations and inverse operations","dfe.ma.n.calc"],"dfe.ma.n.calc.money":["Money","dfe.ma.n.calc"],"dfe.ma.n.prop":["Properties of number","dfe.ma.n"],"dfe.ma.n.prop.factors":["Factors, multiples and primes","dfe.ma.n.prop"],"dfe.ma.n.prop.counting":["Systematic listing and the product rule","dfe.ma.n.prop"],"dfe.ma.n.prop.powers":["Powers and roots","dfe.ma.n.prop"],"dfe.ma.n.prop.indices":["Index laws and fractional indices","dfe.ma.n.prop"],"dfe.ma.n.prop.surds":["Exact calculation and surds","dfe.ma.n.prop"],"dfe.ma.n.prop.stdform":["Standard form","dfe.ma.n.prop"],"dfe.ma.n.frac":["Fractions, decimals and percentages","dfe.ma.n"],"dfe.ma.n.frac.parts":["Halves, quarters and thirds","dfe.ma.n.frac"],"dfe.ma.n.frac.equiv":["Equivalent fractions and simplifying","dfe.ma.n.frac"],"dfe.ma.n.frac.addsub":["Adding and subtracting fractions","dfe.ma.n.frac"],"dfe.ma.n.frac.muldiv":["Multiplying and dividing fractions","dfe.ma.n.frac"],"dfe.ma.n.frac.mixed":["Mixed numbers and improper fractions","dfe.ma.n.frac"],"dfe.ma.n.frac.amount":["Fractions of an amount","dfe.ma.n.frac"],"dfe.ma.n.frac.fdp":["Fractions, decimals and percentages: converting","dfe.ma.n.frac"],"dfe.ma.n.frac.recurring":["Recurring decimals as fractions","dfe.ma.n.frac"],"dfe.ma.n.frac.pct":["Percentages of amounts","dfe.ma.n.frac"],"dfe.ma.n.frac.pctchange":["Percentage change and interest","dfe.ma.n.frac"],"dfe.ma.n.acc":["Measures and accuracy","dfe.ma.n"],"dfe.ma.n.acc.round":["Rounding","dfe.ma.n.acc"],"dfe.ma.n.acc.estimate":["Estimating and checking","dfe.ma.n.acc"],"dfe.ma.n.acc.bounds":["Error intervals and bounds","dfe.ma.n.acc"],"dfe.ma.a":["Algebra",""],"dfe.ma.a.expr":["Expressions and formulae","dfe.ma.a"],"dfe.ma.a.expr.notation":["Algebraic notation and collecting terms","dfe.ma.a.expr"],"dfe.ma.a.expr.subst":["Substitution","dfe.ma.a.expr"],"dfe.ma.a.expr.expand":["Expanding brackets","dfe.ma.a.expr"],"dfe.ma.a.expr.factorise":["Factorising","dfe.ma.a.expr"],"dfe.ma.a.expr.algfrac":["Algebraic fractions","dfe.ma.a.expr"],"dfe.ma.a.expr.formulae":["Formulae and changing the subject","dfe.ma.a.expr"],"dfe.ma.a.expr.proof":["Identities and algebraic proof","dfe.ma.a.expr"],"dfe.ma.a.expr.functions":["Functions, inverse and composite","dfe.ma.a.expr"],"dfe.ma.a.graph":["Graphs","dfe.ma.a"],"dfe.ma.a.graph.coords":["Coordinates","dfe.ma.a.graph"],"dfe.ma.a.graph.line":["Straight-line graphs","dfe.ma.a.graph"],"dfe.ma.a.graph.quad":["Quadratic graphs: roots and turning points","dfe.ma.a.graph"],"dfe.ma.a.graph.shapes":["Recognising and sketching graphs","dfe.ma.a.graph"],"dfe.ma.a.graph.transform":["Transforming graphs","dfe.ma.a.graph"],"dfe.ma.a.graph.real":["Real-life graphs","dfe.ma.a.graph"],"dfe.ma.a.graph.gradarea":["Gradients and areas under graphs","dfe.ma.a.graph"],"dfe.ma.a.graph.circle":["Equation of a circle and its tangents","dfe.ma.a.graph"],"dfe.ma.a.solve":["Equations and inequalities","dfe.ma.a"],"dfe.ma.a.solve.linear":["Linear equations","dfe.ma.a.solve"],"dfe.ma.a.solve.quad":["Quadratic equations","dfe.ma.a.solve"],"dfe.ma.a.solve.sim":["Simultaneous equations","dfe.ma.a.solve"],"dfe.ma.a.solve.iter":["Iteration","dfe.ma.a.solve"],"dfe.ma.a.solve.form":["Forming equations","dfe.ma.a.solve"],"dfe.ma.a.solve.ineq":["Inequalities","dfe.ma.a.solve"],"dfe.ma.a.seq":["Sequences","dfe.ma.a"],"dfe.ma.a.seq.gen":["Generating sequences","dfe.ma.a.seq"],"dfe.ma.a.seq.types":["Special sequences","dfe.ma.a.seq"],"dfe.ma.a.seq.nth":["nth term","dfe.ma.a.seq"],"dfe.ma.r":["Ratio, proportion and rates of change",""],"dfe.ma.r.units":["Units and compound measures","dfe.ma.r"],"dfe.ma.r.units.convert":["Converting units","dfe.ma.r.units"],"dfe.ma.r.units.compound":["Speed, density and other compound measures","dfe.ma.r.units"],"dfe.ma.r.ratio":["Ratio","dfe.ma.r"],"dfe.ma.r.ratio.scale":["Scale drawings and maps","dfe.ma.r.ratio"],"dfe.ma.r.ratio.fraction":["One quantity as a fraction of another","dfe.ma.r.ratio"],"dfe.ma.r.ratio.simplify":["Ratio notation and simplest form","dfe.ma.r.ratio"],"dfe.ma.r.ratio.share":["Sharing in a ratio","dfe.ma.r.ratio"],"dfe.ma.r.ratio.mult":["Ratios, fractions and multiplicative relationships","dfe.ma.r.ratio"],"dfe.ma.r.ratio.compare":["Comparing lengths, areas and volumes with ratio","dfe.ma.r.ratio"],"dfe.ma.r.prop":["Proportion and rates of change","dfe.ma.r"],"dfe.ma.r.prop.direct":["Direct proportion","dfe.ma.r.prop"],"dfe.ma.r.prop.inverse":["Inverse proportion","dfe.ma.r.prop"],"dfe.ma.r.prop.rate":["Gradient as a rate of change","dfe.ma.r.prop"],"dfe.ma.r.prop.instant":["Instantaneous rate of change","dfe.ma.r.prop"],"dfe.ma.r.prop.growth":["Growth and decay","dfe.ma.r.prop"],"dfe.ma.g":["Geometry and measures",""],"dfe.ma.g.shape":["Shapes and constructions","dfe.ma.g"],"dfe.ma.g.shape.terms":["Geometric terms and notation","dfe.ma.g.shape"],"dfe.ma.g.shape.2d":["2-D shapes and their properties","dfe.ma.g.shape"],"dfe.ma.g.shape.3d":["3-D shapes: faces, edges and vertices","dfe.ma.g.shape"],"dfe.ma.g.shape.plans":["Plans and elevations","dfe.ma.g.shape"],"dfe.ma.g.shape.construct":["Constructions and loci","dfe.ma.g.shape"],"dfe.ma.g.shape.congruent":["Congruent triangles","dfe.ma.g.shape"],"dfe.ma.g.shape.reason":["Geometric reasoning and proof","dfe.ma.g.shape"],"dfe.ma.g.shape.circleparts":["Parts of a circle","dfe.ma.g.shape"],"dfe.ma.g.shape.circlethm":["Circle theorems","dfe.ma.g.shape"],"dfe.ma.g.shape.coordgeom":["Geometry on coordinate axes","dfe.ma.g.shape"],"dfe.ma.g.angle":["Angles","dfe.ma.g"],"dfe.ma.g.angle.types":["Types of angle; measuring and drawing angles","dfe.ma.g.angle"],"dfe.ma.g.angle.facts":["Angles at a point, on a line and in parallel lines","dfe.ma.g.angle"],"dfe.ma.g.angle.triquad":["Angles in triangles and quadrilaterals","dfe.ma.g.angle"],"dfe.ma.g.angle.polygon":["Angles in polygons","dfe.ma.g.angle"],"dfe.ma.g.angle.bearings":["Bearings","dfe.ma.g.angle"],"dfe.ma.g.trans":["Position and transformations","dfe.ma.g"],"dfe.ma.g.trans.position":["Position, direction and turns","dfe.ma.g.trans"],"dfe.ma.g.trans.translate":["Translations and reflections","dfe.ma.g.trans"],"dfe.ma.g.trans.rotenlarge":["Rotations and enlargements","dfe.ma.g.trans"],"dfe.ma.g.trans.describe":["Describing and combining transformations","dfe.ma.g.trans"],"dfe.ma.g.trans.similar":["Similar shapes","dfe.ma.g.trans"],"dfe.ma.g.mens":["Measures and mensuration","dfe.ma.g"],"dfe.ma.g.mens.measure":["Measuring length, mass, capacity and temperature","dfe.ma.g.mens"],"dfe.ma.g.mens.time":["Telling the time","dfe.ma.g.mens"],"dfe.ma.g.mens.perimarea":["Perimeter and area","dfe.ma.g.mens"],"dfe.ma.g.mens.circle":["Circumference and area of a circle","dfe.ma.g.mens"],"dfe.ma.g.mens.volume":["Volume and surface area","dfe.ma.g.mens"],"dfe.ma.g.mens.arcs":["Arcs and sectors","dfe.ma.g.mens"],"dfe.ma.g.mens.simareavol":["Similar areas and volumes","dfe.ma.g.mens"],"dfe.ma.g.mens.pythag":["Pythagoras' theorem","dfe.ma.g.mens"],"dfe.ma.g.mens.trig":["Right-angled trigonometry","dfe.ma.g.mens"],"dfe.ma.g.mens.exact":["Exact trig values","dfe.ma.g.mens"],"dfe.ma.g.mens.sinecos":["Sine and cosine rules","dfe.ma.g.mens"],"dfe.ma.g.mens.areatri":["Area of any triangle (½ab sin C)","dfe.ma.g.mens"],"dfe.ma.g.vec":["Vectors","dfe.ma.g"],"dfe.ma.g.vec.vectors":["Vectors","dfe.ma.g.vec"],"dfe.ma.p":["Probability",""],"dfe.ma.p.prob":["Probability","dfe.ma.p"],"dfe.ma.p.prob.basic":["The probability scale","dfe.ma.p.prob"],"dfe.ma.p.prob.freq":["Relative frequency and expected outcomes","dfe.ma.p.prob"],"dfe.ma.p.prob.outcomes":["Listing outcomes and sample spaces","dfe.ma.p.prob"],"dfe.ma.p.prob.venn":["Sets and Venn diagrams","dfe.ma.p.prob"],"dfe.ma.p.prob.tree":["Combined events and tree diagrams","dfe.ma.p.prob"],"dfe.ma.p.prob.cond":["Conditional probability","dfe.ma.p.prob"],"dfe.ma.s":["Statistics",""],"dfe.ma.s.data":["Collecting and showing data","dfe.ma.s"],"dfe.ma.s.data.sample":["Sampling and populations","dfe.ma.s.data"],"dfe.ma.s.data.charts":["Tables, tally charts, pictograms and bar charts","dfe.ma.s.data"],"dfe.ma.s.data.pie":["Pie charts","dfe.ma.s.data"],"dfe.ma.s.data.line":["Line graphs and time series","dfe.ma.s.data"],"dfe.ma.s.data.grouped":["Histograms and cumulative frequency","dfe.ma.s.data"],"dfe.ma.s.analyse":["Analysing data","dfe.ma.s"],"dfe.ma.s.analyse.averages":["Averages and range","dfe.ma.s.analyse"],"dfe.ma.s.analyse.table":["Averages from a frequency table","dfe.ma.s.analyse"],"dfe.ma.s.analyse.spread":["Quartiles, box plots and comparing data","dfe.ma.s.analyse"],"dfe.ma.s.analyse.scatter":["Scatter graphs and correlation","dfe.ma.s.analyse"]}},"Science":{"subject":"Science","subjects":["Biology","Chemistry","Physics"],"ideaNames":{"sc.bio.abiotic-factors":"Abiotic factors","sc.bio.active-transport":"Active transport","sc.bio.adaptations":"Adaptations","sc.bio.advantages-and-disadvantages-of-sexual-and-asexual-reproduction":"Advantages and disadvantages of sexual and asexual reproduction","sc.bio.aerobic-and-anaerobic-respiration":"Aerobic and anaerobic respiration","sc.bio.animal-and-plant-cells":"Animal and plant cells","sc.bio.antibiotics-and-painkillers":"Antibiotics and painkillers","sc.bio.bacterial-diseases":"Bacterial diseases","sc.bio.biodiversity":"Biodiversity","sc.bio.biotic-factors":"Biotic factors","sc.bio.blood":"Blood","sc.bio.cancer":"Cancer","sc.bio.cell-differentiation":"Cell differentiation","sc.bio.cell-specialisation":"Cell specialisation","sc.bio.chromosomes":"Chromosomes","sc.bio.classification-of-living-organisms":"Classification of living organisms","sc.bio.cloning":"Cloning","sc.bio.communicable-infectious-diseases":"Communicable (infectious) diseases","sc.bio.communities":"Communities","sc.bio.contraception":"Contraception","sc.bio.control-and-coordination":"Control and coordination","sc.bio.control-of-blood-glucose-concentration":"Control of blood glucose concentration","sc.bio.control-of-body-temperature":"Control of body temperature","sc.bio.coronary-heart-disease-a-non-communicable-disease":"Coronary heart disease: a non-communicable disease","sc.bio.culturing-microorganisms":"Culturing microorganisms","sc.bio.decomposition":"Decomposition","sc.bio.deforestation":"Deforestation","sc.bio.detection-and-identification-of-plant-diseases":"Detection and identification of plant diseases","sc.bio.diffusion":"Diffusion","sc.bio.discovery-and-development-of-drugs":"Discovery and development of drugs","sc.bio.dna-and-the-genome":"DNA and the genome","sc.bio.dna-structure":"DNA structure","sc.bio.eukaryotes-and-prokaryotes":"Eukaryotes and prokaryotes","sc.bio.evidence-for-evolution":"Evidence for evolution","sc.bio.evolution":"Evolution","sc.bio.extinction":"Extinction","sc.bio.factors-affecting-food-security":"Factors affecting food security","sc.bio.farming-techniques":"Farming techniques","sc.bio.fossils":"Fossils","sc.bio.fungal-diseases":"Fungal diseases","sc.bio.genetic-engineering":"Genetic engineering","sc.bio.genetic-inheritance":"Genetic inheritance","sc.bio.global-warming":"Global warming","sc.bio.health-issues":"Health issues","sc.bio.homeostasis":"Homeostasis","sc.bio.hormones-in-human-reproduction":"Hormones in human reproduction","sc.bio.how-materials-are-cycled":"How materials are cycled","sc.bio.human-defence-systems":"Human defence systems","sc.bio.human-endocrine-system":"Human endocrine system","sc.bio.impact-of-environmental-change":"Impact of environmental change","sc.bio.inherited-disorders":"Inherited disorders","sc.bio.land-use":"Land use","sc.bio.levels-of-organisation":"Levels of organisation","sc.bio.maintaining-biodiversity":"Maintaining biodiversity","sc.bio.maintaining-water-and-nitrogen-balance-in-the-body":"Maintaining water and nitrogen balance in the body","sc.bio.meiosis":"Meiosis","sc.bio.metabolism":"Metabolism","sc.bio.microscopy":"Microscopy","sc.bio.mitosis-and-the-cell-cycle":"Mitosis and the cell cycle","sc.bio.negative-feedback":"Negative feedback","sc.bio.osmosis":"Osmosis","sc.bio.photosynthetic-reaction":"Photosynthetic reaction","sc.bio.plant-defence-responses":"Plant defence responses","sc.bio.plant-organ-system":"Plant organ system","sc.bio.plant-tissues":"Plant tissues","sc.bio.principles-of-organisation":"Principles of organisation","sc.bio.producing-monoclonal-antibodies":"Producing monoclonal antibodies","sc.bio.protist-diseases":"Protist diseases","sc.bio.pyramids-of-biomass":"Pyramids of biomass","sc.bio.rate-of-photosynthesis":"Rate of photosynthesis","sc.bio.resistant-bacteria":"Resistant bacteria","sc.bio.response-to-exercise":"Response to exercise","sc.bio.role-of-biotechnology":"Role of biotechnology","sc.bio.selective-breeding":"Selective breeding","sc.bio.sex-determination":"Sex determination","sc.bio.sexual-and-asexual-reproduction":"Sexual and asexual reproduction","sc.bio.speciation":"Speciation","sc.bio.stem-cells":"Stem cells","sc.bio.structure-and-function":"Structure and function","sc.bio.sustainable-fisheries":"Sustainable fisheries","sc.bio.the-brain":"The brain","sc.bio.the-effect-of-lifestyle-on-some-non-communicable-diseases":"The effect of lifestyle on some non-communicable diseases","sc.bio.the-eye":"The eye","sc.bio.the-heart-and-blood-vessels":"The heart and blood vessels","sc.bio.the-human-digestive-system":"The human digestive system","sc.bio.the-understanding-of-genetics":"The understanding of genetics","sc.bio.the-use-of-hormones-to-treat-infertility":"The use of hormones to treat infertility","sc.bio.theory-of-evolution":"Theory of evolution","sc.bio.transfer-of-biomass":"Transfer of biomass","sc.bio.trophic-levels":"Trophic levels","sc.bio.use-of-plant-hormones":"Use of plant hormones","sc.bio.uses-of-glucose-from-photosynthesis":"Uses of glucose from photosynthesis","sc.bio.uses-of-monoclonal-antibodies":"Uses of monoclonal antibodies","sc.bio.vaccination":"Vaccination","sc.bio.variation":"Variation","sc.bio.viral-diseases":"Viral diseases","sc.bio.waste-management":"Waste management","sc.chem.addition-polymerisation":"Addition polymerisation","sc.chem.alcohols":"Alcohols","sc.chem.alloys-as-useful-materials":"Alloys as useful materials","sc.chem.alternative-methods-of-extracting-metals":"Alternative methods of extracting metals","sc.chem.amino-acids":"Amino acids","sc.chem.amounts-of-substances-in-equations":"Amounts of substances in equations","sc.chem.atmospheric-pollutants-from-fuels":"Atmospheric pollutants from fuels","sc.chem.atom-economy":"Atom economy","sc.chem.atoms-elements-and-compounds":"Atoms, elements and compounds","sc.chem.calculating-rates-of-reactions":"Calculating rates of reactions","sc.chem.carbonates":"Carbonates","sc.chem.carboxylic-acids":"Carboxylic acids","sc.chem.catalysts":"Catalysts","sc.chem.cells-and-batteries":"Cells and batteries","sc.chem.ceramics-polymers-and-composites":"Ceramics, polymers and composites","sc.chem.chemical-bonds":"Chemical bonds","sc.chem.chemical-measurements-and-uncertainty":"Chemical measurements and uncertainty","sc.chem.chromatography":"Chromatography","sc.chem.collision-theory-and-activation-energy":"Collision theory and activation energy","sc.chem.concentration-of-solutions":"Concentration of solutions","sc.chem.condensation-polymerisation":"Condensation polymerisation","sc.chem.conservation-of-mass-and-balanced-chemical-equations":"Conservation of mass and balanced chemical equations","sc.chem.corrosion-and-its-prevention":"Corrosion and its prevention","sc.chem.covalent-bonding":"Covalent bonding","sc.chem.cracking-and-alkenes":"Cracking and alkenes","sc.chem.crude-oil-hydrocarbons-and-alkanes":"Crude oil, hydrocarbons and alkanes","sc.chem.development-of-the-periodic-table":"Development of the periodic table","sc.chem.diamond":"Diamond","sc.chem.dna-and-other-natural-polymers":"DNA and other natural polymers","sc.chem.electrolysis-of-aqueous-solutions":"Electrolysis of aqueous solutions","sc.chem.electrolysis-of-molten-ionic-compounds":"Electrolysis of molten ionic compounds","sc.chem.electronic-structure":"Electronic structure","sc.chem.energy-changes-and-reversible-reactions":"Energy changes and reversible reactions","sc.chem.energy-transfer-during-exothermic-and-endothermic-reactions":"Energy transfer during exothermic and endothermic reactions","sc.chem.equilibrium":"Equilibrium","sc.chem.extraction-of-metals-and-reduction":"Extraction of metals and reduction","sc.chem.factors-which-affect-the-rates-of-chemical-reactions":"Factors which affect the rates of chemical reactions","sc.chem.flame-emission-spectroscopy":"Flame emission spectroscopy","sc.chem.flame-tests":"Flame tests","sc.chem.formulations":"Formulations","sc.chem.fractional-distillation-and-petrochemicals":"Fractional distillation and petrochemicals","sc.chem.fuel-cells":"Fuel cells","sc.chem.giant-covalent-structures":"Giant covalent structures","sc.chem.global-climate-change":"Global climate change","sc.chem.graphene-and-fullerenes":"Graphene and fullerenes","sc.chem.graphite":"Graphite","sc.chem.greenhouse-gases":"Greenhouse gases","sc.chem.group-0":"Group 0","sc.chem.group-1":"Group 1","sc.chem.group-7":"Group 7","sc.chem.halides":"Halides","sc.chem.how-carbon-dioxide-decreased":"How carbon dioxide decreased","sc.chem.how-oxygen-increased":"How oxygen increased","sc.chem.human-activities-that-increase-greenhouse-gases":"Human activities that increase greenhouse gases","sc.chem.instrumental-methods":"Instrumental methods","sc.chem.ionic-bonding":"Ionic bonding","sc.chem.ionic-compounds":"Ionic compounds","sc.chem.life-cycle-assessment":"Life cycle assessment","sc.chem.limiting-reactants":"Limiting reactants","sc.chem.mass-changes-when-a-reactant-or-product-is-a-gas":"Mass changes when a reactant or product is a gas","sc.chem.metal-hydroxides":"Metal hydroxides","sc.chem.metal-oxides":"Metal oxides","sc.chem.metallic-bonding":"Metallic bonding","sc.chem.metals-and-non-metals":"Metals and non-metals","sc.chem.metals-as-conductors":"Metals as conductors","sc.chem.mixtures":"Mixtures","sc.chem.moles":"Moles","sc.chem.neutralisation-of-acids-and-salt-production":"Neutralisation of acids and salt production","sc.chem.oxidation-and-reduction-in-terms-of-electrons":"Oxidation and reduction in terms of electrons","sc.chem.percentage-yield":"Percentage yield","sc.chem.polymers":"Polymers","sc.chem.potable-water":"Potable water","sc.chem.production-and-uses-of-npk-fertilisers":"Production and uses of NPK fertilisers","sc.chem.properties-and-effects-of-atmospheric-pollutants":"Properties and effects of atmospheric pollutants","sc.chem.properties-of-hydrocarbons":"Properties of hydrocarbons","sc.chem.properties-of-ionic-compounds":"Properties of ionic compounds","sc.chem.properties-of-metals-and-alloys":"Properties of metals and alloys","sc.chem.properties-of-small-molecules":"Properties of small molecules","sc.chem.pure-substances":"Pure substances","sc.chem.reaction-profiles":"Reaction profiles","sc.chem.reactions-of-acids-with-metals":"Reactions of acids with metals","sc.chem.reactions-of-alkenes":"Reactions of alkenes","sc.chem.relative-atomic-mass":"Relative atomic mass","sc.chem.relative-electrical-charges-of-subatomic-particles":"Relative electrical charges of subatomic particles","sc.chem.relative-formula-mass":"Relative formula mass","sc.chem.representation-of-reactions-at-electrodes-as-half-equations":"Representation of reactions at electrodes as half equations","sc.chem.reversible-reactions":"Reversible reactions","sc.chem.size-and-mass-of-atoms":"Size and mass of atoms","sc.chem.sizes-of-particles-and-their-properties":"Sizes of particles and their properties","sc.chem.soluble-salts":"Soluble salts","sc.chem.state-symbols":"State symbols","sc.chem.strong-and-weak-acids":"Strong and weak acids","sc.chem.structure-and-formulae-of-alkenes":"Structure and formulae of alkenes","sc.chem.sulfates":"Sulfates","sc.chem.test-for-carbon-dioxide":"Test for carbon dioxide","sc.chem.test-for-chlorine":"Test for chlorine","sc.chem.test-for-hydrogen":"Test for hydrogen","sc.chem.test-for-oxygen":"Test for oxygen","sc.chem.the-carbon-footprint-and-its-reduction":"The carbon footprint and its reduction","sc.chem.the-development-of-the-model-of-the-atom":"The development of the model of the atom","sc.chem.the-earths-early-atmosphere":"The Earth's early atmosphere","sc.chem.the-effect-of-changing-concentration":"The effect of changing concentration","sc.chem.the-effect-of-changing-conditions-on-equilibrium":"The effect of changing conditions on equilibrium","sc.chem.the-effect-of-pressure-changes-on-equilibrium":"The effect of pressure changes on equilibrium","sc.chem.the-effect-of-temperature-changes-on-equilibrium":"The effect of temperature changes on equilibrium","sc.chem.the-energy-change-of-reactions":"The energy change of reactions","sc.chem.the-haber-process":"The Haber process","sc.chem.the-periodic-table":"The periodic table","sc.chem.the-ph-scale-and-neutralisation":"The pH scale and neutralisation","sc.chem.the-process-of-electrolysis":"The process of electrolysis","sc.chem.the-proportions-of-different-gases-in-the-atmosphere":"The proportions of different gases in the atmosphere","sc.chem.the-reactivity-series":"The reactivity series","sc.chem.the-three-states-of-matter":"The three states of matter","sc.chem.titrations":"Titrations","sc.chem.transition-metals-compared-with-group-1":"Transition metals compared with Group 1","sc.chem.typical-properties-of-transition-metals":"Typical properties of transition metals","sc.chem.use-of-amount-of-substance-in-relation-to-volumes-of-gases":"Use of amount of substance in relation to volumes of gases","sc.chem.uses-of-nanoparticles":"Uses of nanoparticles","sc.chem.using-concentrations-in-mol-dm":"Using concentrations in mol/dm³","sc.chem.using-electrolysis-to-extract-metals":"Using electrolysis to extract metals","sc.chem.using-moles-to-balance-equations":"Using moles to balance equations","sc.chem.using-the-earths-resources-and-sustainable-development":"Using the Earth's resources and sustainable development","sc.chem.waste-water-treatment":"Waste water treatment","sc.chem.ways-of-reducing-the-use-of-resources":"Ways of reducing the use of resources","sc.phys.acceleration":"Acceleration","sc.phys.atmospheric-pressure":"Atmospheric pressure","sc.phys.background-radiation":"Background radiation","sc.phys.changes-in-energy":"Changes in energy","sc.phys.changes-in-momentum":"Changes in momentum","sc.phys.changes-of-state":"Changes of state","sc.phys.changes-of-state-and-specific-latent-heat":"Changes of state and specific latent heat","sc.phys.conservation-of-momentum":"Conservation of momentum","sc.phys.contact-and-non-contact-forces":"Contact and non-contact forces","sc.phys.current-resistance-and-potential-difference":"Current, resistance and potential difference","sc.phys.density-of-materials":"Density of materials","sc.phys.different-half-lives-of-radioactive-isotopes":"Different half-lives of radioactive isotopes","sc.phys.direct-and-alternating-potential-difference":"Direct and alternating potential difference","sc.phys.distance-and-displacement":"Distance and displacement","sc.phys.efficiency":"Efficiency","sc.phys.electric-fields":"Electric fields","sc.phys.electric-motors":"Electric motors","sc.phys.electrical-charge-and-current":"Electrical charge and current","sc.phys.electrical-power":"Electrical power","sc.phys.electromagnetism":"Electromagnetism","sc.phys.emission-and-absorption-of-infrared-radiation":"Emission and absorption of infrared radiation","sc.phys.energy-changes-in-systems":"Energy changes in systems","sc.phys.energy-stores-and-systems":"Energy stores and systems","sc.phys.energy-transfers-in-a-system":"Energy transfers in a system","sc.phys.energy-transfers-in-everyday-appliances":"Energy transfers in everyday appliances","sc.phys.factors-affecting-braking-distance-road-and-vehicle":"Factors affecting braking distance: road and vehicle","sc.phys.factors-affecting-braking-distance-speed-and-energy":"Factors affecting braking distance: speed and energy","sc.phys.flemings-left-hand-rule":"Fleming's left-hand rule","sc.phys.forces-and-elasticity":"Forces and elasticity","sc.phys.gravity":"Gravity","sc.phys.half-lives-and-the-random-nature-of-radioactive-decay":"Half-lives and the random nature of radioactive decay","sc.phys.increasing-the-pressure-of-a-gas":"Increasing the pressure of a gas","sc.phys.induced-potential":"Induced potential","sc.phys.internal-energy":"Internal energy","sc.phys.lenses":"Lenses","sc.phys.loudspeakers":"Loudspeakers","sc.phys.magnetic-fields":"Magnetic fields","sc.phys.mains-electricity":"Mains electricity","sc.phys.mass-number-atomic-number-and-isotopes":"Mass number, atomic number and isotopes","sc.phys.microphones":"Microphones","sc.phys.moments-levers-and-gears":"Moments, levers and gears","sc.phys.momentum-is-a-property-of-moving-objects":"Momentum is a property of moving objects","sc.phys.national-and-global-energy-resources":"National and global energy resources","sc.phys.newtons-first-law":"Newton's First Law","sc.phys.newtons-second-law":"Newton's Second Law","sc.phys.newtons-third-law":"Newton's Third Law","sc.phys.nuclear-equations":"Nuclear equations","sc.phys.nuclear-fission":"Nuclear fission","sc.phys.nuclear-fusion":"Nuclear fusion","sc.phys.orbital-motion-natural-and-artificial-satellites":"Orbital motion, natural and artificial satellites","sc.phys.our-solar-system":"Our solar system","sc.phys.particle-motion-in-gases":"Particle motion in gases","sc.phys.perfect-black-bodies-and-radiation":"Perfect black bodies and radiation","sc.phys.poles-of-a-magnet":"Poles of a magnet","sc.phys.power-the-rate-of-energy-transfer":"Power: the rate of energy transfer","sc.phys.pressure-in-a-fluid-depth-and-upthrust":"Pressure in a fluid: depth and upthrust","sc.phys.pressure-in-a-fluid-force-on-an-area":"Pressure in a fluid: force on an area","sc.phys.pressure-in-gases":"Pressure in gases","sc.phys.properties-of-electromagnetic-waves-1":"Properties of electromagnetic waves 1","sc.phys.properties-of-electromagnetic-waves-2":"Properties of electromagnetic waves 2","sc.phys.properties-of-waves":"Properties of waves","sc.phys.radioactive-contamination":"Radioactive contamination","sc.phys.radioactive-decay-and-nuclear-radiation":"Radioactive decay and nuclear radiation","sc.phys.reaction-time":"Reaction time","sc.phys.red-shift":"Red-shift","sc.phys.reflection-of-waves":"Reflection of waves","sc.phys.resistors":"Resistors","sc.phys.resultant-forces":"Resultant forces","sc.phys.scalar-and-vector-quantities":"Scalar and vector quantities","sc.phys.series-and-parallel-circuits":"Series and parallel circuits","sc.phys.sound-waves":"Sound waves","sc.phys.speed":"Speed","sc.phys.standard-circuit-diagram-symbols":"Standard circuit diagram symbols","sc.phys.static-charge":"Static charge","sc.phys.stopping-distance":"Stopping distance","sc.phys.temperature-changes-in-a-system-and-specific-heat-capacity":"Temperature changes in a system and specific heat capacity","sc.phys.the-distance-time-relationship":"The distance–time relationship","sc.phys.the-life-cycle-of-a-star":"The life cycle of a star","sc.phys.the-national-grid":"The National Grid","sc.phys.the-structure-of-an-atom":"The structure of an atom","sc.phys.transformers":"Transformers","sc.phys.transverse-and-longitudinal-waves":"Transverse and longitudinal waves","sc.phys.types-of-electromagnetic-waves":"Types of electromagnetic waves","sc.phys.uses-and-applications-of-electromagnetic-waves":"Uses and applications of electromagnetic waves","sc.phys.uses-of-nuclear-radiation":"Uses of nuclear radiation","sc.phys.uses-of-the-generator-effect":"Uses of the generator effect","sc.phys.velocity":"Velocity","sc.phys.visible-light":"Visible light","sc.phys.waves-for-detection-and-exploration":"Waves for detection and exploration","sc.phys.work-done-and-energy-transfer":"Work done and energy transfer"},"cards":{"levels":["part_of","idea_id"],"tree":"data/topics.json"},"dfe":{"dfe.sc.b":["Biology",""],"dfe.sc.b.cell":["Cell biology","dfe.sc.b"],"dfe.sc.b.cell.cells":["Animal, plant and bacterial cells","dfe.sc.b.cell"],"dfe.sc.b.cell.division":["Cell division, stem cells and growth","dfe.sc.b.cell"],"dfe.sc.b.cell.enzymes":["Enzymes and respiration","dfe.sc.b.cell"],"dfe.sc.b.trans":["Transport systems","dfe.sc.b"],"dfe.sc.b.trans.cells":["Diffusion, osmosis and active transport","dfe.sc.b.trans"],"dfe.sc.b.trans.organs":["Tissues, organs and organ systems","dfe.sc.b.trans"],"dfe.sc.b.trans.heart":["The heart, blood and breathing","dfe.sc.b.trans"],"dfe.sc.b.trans.plants":["Transport in plants","dfe.sc.b.trans"],"dfe.sc.b.health":["Health and disease","dfe.sc.b"],"dfe.sc.b.health.communicable":["Infectious diseases and the body's defences","dfe.sc.b.health"],"dfe.sc.b.health.medicines":["Treating and preventing disease","dfe.sc.b.health"],"dfe.sc.b.health.plants":["Plant disease","dfe.sc.b.health"],"dfe.sc.b.health.noncommunicable":["Lifestyle, diet and non-infectious disease","dfe.sc.b.health"],"dfe.sc.b.coord":["Coordination and control","dfe.sc.b"],"dfe.sc.b.coord.nerves":["The nervous system","dfe.sc.b.coord"],"dfe.sc.b.coord.hormones":["Hormones in humans","dfe.sc.b.coord"],"dfe.sc.b.coord.homeostasis":["Homeostasis","dfe.sc.b.coord"],"dfe.sc.b.coord.planthormones":["Plant hormones","dfe.sc.b.coord"],"dfe.sc.b.photo":["Photosynthesis","dfe.sc.b"],"dfe.sc.b.photo.photo":["Photosynthesis and what affects it","dfe.sc.b.photo"],"dfe.sc.b.photo.plants":["Plants: parts and growth","dfe.sc.b.photo"],"dfe.sc.b.eco":["Ecosystems","dfe.sc.b"],"dfe.sc.b.eco.habitats":["Living things and their habitats","dfe.sc.b.eco"],"dfe.sc.b.eco.levels":["Communities, adaptation and food webs","dfe.sc.b.eco"],"dfe.sc.b.eco.cycles":["Material cycling and decay","dfe.sc.b.eco"],"dfe.sc.b.eco.biomass":["Pyramids of biomass and food production","dfe.sc.b.eco"],"dfe.sc.b.eco.biodiversity":["Biodiversity and human impact","dfe.sc.b.eco"],"dfe.sc.b.inherit":["Inheritance, variation and evolution","dfe.sc.b"],"dfe.sc.b.inherit.repro":["Reproduction","dfe.sc.b.inherit"],"dfe.sc.b.inherit.genome":["DNA, genes and inheritance","dfe.sc.b.inherit"],"dfe.sc.b.inherit.evolution":["Variation, evolution and classification","dfe.sc.b.inherit"],"dfe.sc.b.inherit.breeding":["Selective breeding and genetic engineering","dfe.sc.b.inherit"],"dfe.sc.b.body":["Animals and the human body","dfe.sc.b"],"dfe.sc.b.body.animals":["Animals, the body and senses","dfe.sc.b.body"],"dfe.sc.b.body.skeleton":["Skeleton, muscles and teeth","dfe.sc.b.body"],"dfe.sc.b.body.digestion":["Nutrition and digestion","dfe.sc.b.body"],"dfe.sc.c":["Chemistry",""],"dfe.sc.c.atom":["Atomic structure and the periodic table","dfe.sc.c"],"dfe.sc.c.atom.model":["Atoms, elements, compounds and isotopes","dfe.sc.c.atom"],"dfe.sc.c.atom.table":["The periodic table and its groups","dfe.sc.c.atom"],"dfe.sc.c.atom.transition":["Transition metals","dfe.sc.c.atom"],"dfe.sc.c.bond":["Bonding, structure and properties","dfe.sc.c"],"dfe.sc.c.bond.types":["Ionic, covalent and metallic bonding","dfe.sc.c.bond"],"dfe.sc.c.bond.carbon":["Structures of carbon","dfe.sc.c.bond"],"dfe.sc.c.bond.nano":["Nanoparticles","dfe.sc.c.bond"],"dfe.sc.c.change":["Chemical changes","dfe.sc.c"],"dfe.sc.c.change.equations":["Formulae and equations","dfe.sc.c.change"],"dfe.sc.c.change.metals":["Reactivity of metals","dfe.sc.c.change"],"dfe.sc.c.change.acids":["Acids, alkalis and salts","dfe.sc.c.change"],"dfe.sc.c.change.electrolysis":["Electrolysis","dfe.sc.c.change"],"dfe.sc.c.energy":["Energy changes in chemistry","dfe.sc.c"],"dfe.sc.c.energy.exo":["Exothermic and endothermic reactions","dfe.sc.c.energy"],"dfe.sc.c.energy.cells":["Chemical cells and fuel cells","dfe.sc.c.energy"],"dfe.sc.c.rate":["Rates and equilibrium","dfe.sc.c"],"dfe.sc.c.rate.rate":["Rates of reaction and catalysts","dfe.sc.c.rate"],"dfe.sc.c.rate.equilibrium":["Reversible reactions and equilibrium","dfe.sc.c.rate"],"dfe.sc.c.organic":["Organic chemistry","dfe.sc.c"],"dfe.sc.c.organic.crude":["Crude oil, fuels and cracking","dfe.sc.c.organic"],"dfe.sc.c.organic.series":["Alkenes, alcohols and carboxylic acids","dfe.sc.c.organic"],"dfe.sc.c.organic.polymers":["Polymers","dfe.sc.c.organic"],"dfe.sc.c.analysis":["Chemical analysis and quantities","dfe.sc.c"],"dfe.sc.c.analysis.purity":["Purity, mixtures and chromatography","dfe.sc.c.analysis"],"dfe.sc.c.analysis.gases":["Testing for gases","dfe.sc.c.analysis"],"dfe.sc.c.analysis.ions":["Identifying ions","dfe.sc.c.analysis"],"dfe.sc.c.analysis.mass":["Conservation of mass and relative formula mass","dfe.sc.c.analysis"],"dfe.sc.c.analysis.moles":["Moles and amounts","dfe.sc.c.analysis"],"dfe.sc.c.analysis.yield":["Yield, atom economy, concentration and gas volumes","dfe.sc.c.analysis"],"dfe.sc.c.earth":["Earth, atmosphere and resources","dfe.sc.c"],"dfe.sc.c.earth.atmosphere":["The atmosphere: its history and greenhouse gases","dfe.sc.c.earth"],"dfe.sc.c.earth.pollution":["Air pollution","dfe.sc.c.earth"],"dfe.sc.c.earth.water":["Water and the Earth's resources","dfe.sc.c.earth"],"dfe.sc.c.earth.lca":["Life cycle assessment and recycling","dfe.sc.c.earth"],"dfe.sc.c.earth.materials":["Using materials, the Haber process and fertilisers","dfe.sc.c.earth"],"dfe.sc.c.earth.rocks":["Rocks and soils","dfe.sc.c.earth"],"dfe.sc.c.materials":["Materials and their properties","dfe.sc.c"],"dfe.sc.c.materials.everyday":["Everyday materials and their uses","dfe.sc.c.materials"],"dfe.sc.c.materials.states":["Solids, liquids and gases","dfe.sc.c.materials"],"dfe.sc.c.materials.changes":["Properties and changes of materials","dfe.sc.c.materials"],"dfe.sc.p":["Physics",""],"dfe.sc.p.energy":["Energy","dfe.sc.p"],"dfe.sc.p.energy.stores":["Energy stores, transfers and power","dfe.sc.p.energy"],"dfe.sc.p.energy.efficiency":["Conservation, dissipation and efficiency","dfe.sc.p.energy"],"dfe.sc.p.energy.resources":["Energy resources","dfe.sc.p.energy"],"dfe.sc.p.forces":["Forces and motion","dfe.sc.p"],"dfe.sc.p.forces.interact":["Forces, weight and resultant forces","dfe.sc.p.forces"],"dfe.sc.p.forces.work":["Work done and elasticity","dfe.sc.p.forces"],"dfe.sc.p.forces.moments":["Moments, levers and gears","dfe.sc.p.forces"],"dfe.sc.p.forces.pressure":["Pressure in fluids","dfe.sc.p.forces"],"dfe.sc.p.forces.motion":["Speed, acceleration and Newton's laws","dfe.sc.p.forces"],"dfe.sc.p.forces.momentum":["Momentum and stopping safely","dfe.sc.p.forces"],"dfe.sc.p.waves":["Waves, light and sound","dfe.sc.p"],"dfe.sc.p.waves.light":["Light and seeing","dfe.sc.p.waves"],"dfe.sc.p.waves.sound":["Sound","dfe.sc.p.waves"],"dfe.sc.p.waves.properties":["Wave properties","dfe.sc.p.waves"],"dfe.sc.p.waves.em":["The electromagnetic spectrum","dfe.sc.p.waves"],"dfe.sc.p.waves.lenses":["Lenses, visible light and black bodies","dfe.sc.p.waves"],"dfe.sc.p.elec":["Electricity","dfe.sc.p"],"dfe.sc.p.elec.circuits":["Simple circuits","dfe.sc.p.elec"],"dfe.sc.p.elec.current":["Current, potential difference and resistance","dfe.sc.p.elec"],"dfe.sc.p.elec.series":["Series and parallel circuits","dfe.sc.p.elec"],"dfe.sc.p.elec.mains":["Mains electricity, power and the National Grid","dfe.sc.p.elec"],"dfe.sc.p.elec.static":["Static electricity","dfe.sc.p.elec"],"dfe.sc.p.magnet":["Magnetism and electromagnetism","dfe.sc.p"],"dfe.sc.p.magnet.fields":["Magnets and magnetic fields","dfe.sc.p.magnet"],"dfe.sc.p.magnet.motor":["Electromagnets and the motor effect","dfe.sc.p.magnet"],"dfe.sc.p.magnet.induction":["Induction, generators and transformers","dfe.sc.p.magnet"],"dfe.sc.p.matter":["Particle model of matter","dfe.sc.p"],"dfe.sc.p.matter.states":["Density and changes of state","dfe.sc.p.matter"],"dfe.sc.p.matter.internal":["Internal energy and specific heat","dfe.sc.p.matter"],"dfe.sc.p.matter.pressure":["Gas pressure","dfe.sc.p.matter"],"dfe.sc.p.atomic":["Atomic structure and radioactivity","dfe.sc.p"],"dfe.sc.p.atomic.isotopes":["Atoms and isotopes","dfe.sc.p.atomic"],"dfe.sc.p.atomic.radiation":["Nuclear radiation and half-life","dfe.sc.p.atomic"],"dfe.sc.p.atomic.hazards":["Hazards and uses of radiation","dfe.sc.p.atomic"],"dfe.sc.p.atomic.fission":["Fission and fusion","dfe.sc.p.atomic"],"dfe.sc.p.space":["Space physics","dfe.sc.p"],"dfe.sc.p.space.earth":["Earth, Sun, Moon and seasons","dfe.sc.p.space"],"dfe.sc.p.space.solar":["The solar system, orbits and stars","dfe.sc.p.space"],"dfe.sc.p.space.redshift":["Red-shift and the Big Bang","dfe.sc.p.space"]}}};
/* TAXONOMY:end */
/* ONE ENGINE FOR EVERY SUBJECT'S LIBRARY LEVELS: each level's facet reads its field; a writing of the subject answers the subject's `writings` answer at the first level. */
function taxonomyRead_() {
  const out = {};
  Object.keys(TAXONOMY).filter(k => TAXONOMY[k] && TAXONOMY[k].library).forEach(k => {
    const T = TAXONOMY[k], L = T.library, w = L.writings;
    (L.levels || []).forEach((lv, i) => {
      out[lv.facet] = { of: x => x[lv.field] || (i === 0 && w && w.kinds.indexOf(x.kind) >= 0 && [].concat(x.subject || []).indexOf(T.subject) >= 0 ? w.answer : '') };
    });
  });
  return out;
}
/* THE HELPERS A facets.json `read` {by: "fn"} MAY NAME (batch 6): const arrows in other files, so each is called through here, never looked up on window; `col` "name.key" reads one key of its answer. */
/* ONE WHAT SORT (UNIFY AFTER 3, 23 Nov): an item's own sort, whichever kind it is (facets.json documentType); no item carries two of these. */
const sortOf_ = x => x.documentType || x.projectType || x.practicalType || x.boxKind || x.mKind || (specTreeOf_(x).topic ? 'Exam topics' : '');
const FACET_FN = {
  mechScope_: x => mechScope_(x),
  decadesOf_: x => decadesOf_(x),
  boutWinner_: x => boutWinner_(x),
  boutDate_: x => boutDate_(x),
  histErasOf_: x => histErasOf_(x),
  personYears_: x => personYears_(x),
  msFound_: x => msFound_(x),
  msDated_: x => msDated_(x),
  levelOf_: x => levelOf_(x),
  boardOf_: x => boardOf_(x),
  sourceOf_: x => sourceOf_(x),
  myTriedOf_: x => myTriedOf_(x),
  myResultOf_: x => myResultOf_(x),
  verifyTags_: x => verifyTags_(x),
  sittingOf_: x => sittingOf_(x),
  itemYear_: x => itemYear_(x),
  itemDate_: x => itemDate_(x),
  qSplitOf_: x => qSplitOf_(x),
  toolNameOf_: x => toolNameOf_(x),
  sortOf_: x => sortOf_(x),
};
const facetFn_ = c => { const [f, k] = c.split('.'); return k ? x => (FACET_FN[f](x) || {})[k] : FACET_FN[f]; };
/* ONE-LINE COLUMN READERS ARE DATA (batch 4): a facets.json row's `read` {by, col} names one of these; FACET_READ keeps only facets with real code. */
const FACET_BY_READ_ = {
  row: c => ({ of: x => x[c] || '' }),
  writing: c => ({ of: x => writingAt_(x, c) }),
  hist: c => ({ of: x => histCol_(x, c) }),
  mech: c => ({ of: x => mechFit_(x, c), tagOf: x => mechFitTag_(x, c) }),
  own: c => { const [t, k] = c.split('.'); return { of: x => mechOwn_(x, t, k) }; },
  /* A BOUT'S OWN COLUMN (445), trimmed; nothing on anything that is not a fight. */
  fight: c => ({ of: x => (isFight_(x) && x.row && String(x.row[c] || '').trim()) || '' }),
  fn: c => ({ of: facetFn_(c) }),
};
/* `tag: false` is asked but never a card's tag; `choose` is asked however lopsided (mScope). */
/* `or` (UNIFY AFTER 3, ONE BRAND): a column read where the reader leaves an item empty. */
const facetOr_ = (r, c) => Object.assign({}, r, { of: x => r.of(x) || x[c] || '', tagOf: (x, p) => (r.tagOf || r.of)(x, p) || x[c] || '' });
const facetReadData_ = () => Object.fromEntries(ITEM_KINDS.facets.filter(f => f.read && FACET_BY_READ_[f.read.by]).map(f => { const r0 = FACET_BY_READ_[f.read.by](f.read.col), r = f.read.or ? facetOr_(r0, f.read.or) : r0;
  return [f.field, Object.assign(r, f.read.tag === false ? { tagOf: () => '' } : {}, f.read.choose ? { choose: true } : {})]; }));
const FACET_READ = {
  ...facetReadData_(),
  forLabel: { of: x => x.groups || kindOf_(x).group },
  /* `Answers` BESIDE THE ITEM'S OWN KIND: a question with an answer is found by either, and its answer page carries the tag. */
  /* A KIND UNDER ANOTHER (kinds.json `find.under`, 610) ANSWERS ONLY THAT ONE HERE: Questions are reached through Practice, a Timeline through Library. */
  /* ONE OPENING QUESTION (queue item 9, 24 Nov): a question that has an answer is found under Answers too, as Which once offered it. */
  kindLabel: { of: x => kindTop_(x) || x.kindLabel || kindOf_(x).label,
    tagOf: (x, page) => kindTopTag_(x) || (page === 'ans' && isQ_(x) ? ansKind_() : (x.kindLabel || kindOf_(x).label)) },
  /* AND ITS OWN KIND IS THE NEXT QUESTION, asked by the one rule like any other (`Answers` beside a question that has one, and on no tool or video). */
  kindOwn: { of: x => !kindTop_(x) ? '' : notTop_(x, isQ_(x) && questionHasAns_(x) ? [kindOf_(x).label, ansKind_()] : (x.kindLabel || kindOf_(x).label)),
    tagOf: (x, page) => !kindTop_(x) ? '' : notTop_(x, page === 'ans' && isQ_(x) ? ansKind_() : (x.kindLabel || kindOf_(x).label)) },
  /* SUBJECT STRAIGHT AFTER WHAT KIND (494), as the facets tab orders it: "the library should go subject first". */
  /* A STORE KIND'S OWN FACETS (kinds.json `find.facetCols`), each read off its row's column when the entry was made (form.js storeItems_). */
  ...Object.fromEntries(storeFacets_().map(f => [f, { of: x => x[f] || '' }])),
  /* ONE FACET SET FOR EVERY WRITTEN WORK (520): the Bible, the Quran, the Talmud, the Hadith, the hymns and every other text
     answer the same questions, read off `writingOf_` (writings.js) — no loader has a private one. */
  /* ONE LANGUAGE QUESTION FOR EVERYTHING WRITTEN (546): a text's language and a manuscript's (the history database) are one kind of answer. */
  wLanguage: { of: x => writingLanguageOf_(writingAt_(x, 'text')) || histCol_(x, 'language') },
  wText: { of: x => writingVersionOf_(writingAt_(x, 'text')) },
  /* MECHANICS (548): a car's facts as tags, read off the row; a row answers only what it has. */
  /* A LESSON WRITTEN TO A SPEC IS ONE TYPE BESIDE CHEMISTRY'S ELEMENTS AND SUBSTANCES (16 Nov): Library › Chemistry › Exam topics › GCSE › AQA. */
  mPart: { of: x => (x.kind === 'mech' && x.mFile !== 'models' && x.name) || '' },
  /* BATCH D: one people kind; a person's name, years and home are tags (the card has no title). */
  /* A BOUT'S FACTS ARE TAGS (445), like a question's: who, when, how. A boxer answers Fighter too, so his name finds him and his bouts. */
  fighter: { of: x => isFight_(x) && x.row ? [x.row.a, x.row.b].filter(Boolean) : isBoxer_(x) ? x.name : '' },
  personName: { of: x => (isPerson_(x) ? x.name : '') },
  boutRound: { of: x => isFight_(x) && x.row && Number(x.row.endRound) > 0 ? 'Round ' + Number(x.row.endRound) : '' },
  /* THE HISTORY DATABASE'S (459): which table, the era its years touch, and its columns as ordinary tags (`histCol_`). */
  /* ITS LIBRARY LEVELS (topic, part) ARE DATA: data/settings/taxonomy.json, read by `taxonomyRead_` below, never a subject case here. */
  ...taxonomyRead_(),
  histRole: { of: x => (isPerson_(x) ? x.roles || [] : histCol_(x, 'roles')) },
  personFrom: { of: x => (isPerson_(x) && x.from) || '' },
  required: { of: x => !isPractical_(x) || !x.row ? '' : PRAC_NEED[x.row.excluded ? 2 : x.row.required ? 0 : 1] },
  /* A RESOURCE CAN BELONG TO MORE THAN ONE KEY STAGE; a SATs row's is read off its year when the cell is blank. */
  keystage: { of: x => { const s = satsStagesOf_(x); return s.length ? s : keyStagesAt_(x); } },
  /* A CHAPTER TAUGHT OVER SEVERAL YEARS ANSWERS EACH (770: "it should ask what year, no?" under KS2). */
  yearGroup: { of: x => x.bandValue && x.bandType === 'year' ? 'Year ' + x.bandValue : (x.years || []).map(y => 'Year ' + y) },
  bandValue: { of: x => x.bandValue && x.bandType === 'grade' ? 'Grade ' + x.bandValue : '' },
  /* A CARD WRITTEN TO A SPEC ANSWERS THE SPEC'S OWN HEADINGS INSTEAD (16 Nov), asked after its board: Library › Biology › AQA › 4.1 Cell biology. */
  topic: { of: x => topicShown_(x) && !specTreeOf_(x).topic ? (x.topic || topicOf_(x)) : [] },
  specTopic: { full: true, of: x => specTreeOf_(x).topic },
  specPoint: { full: true, of: x => specTreeOf_(x).point },
  /* A "PLUS" TIER IS ITS OWN TIER'S (owner, 15 Nov): Foundation Plus is Foundation, Higher Plus is Higher. */
  /* A COMMA PARTS TIERS (owner, 17 Nov, N-20261117-tiertag): `Foundation,Higher` is two tags, as a key stage list is. */
  tier: { of: x => [...new Set(String(x.tier || '').split(',').map(t => t.trim().replace(/\s+Plus$/i, '')).filter(Boolean))] },
  /* THE YEAR, THEN THE MONTH, THEN THE PAPER — like the folders they came from. */
  /* MONTH AND DAY READ ANY ITEM'S DATE (owner, 15 Nov): a sitting's month, else the item's own date (`itemDate_`) — a 5-a-day's "5 October". */
  examMonth: { of: x => sittingMonth_(x) || itemDate_(x).month },
  /* THE ID DECIDES WHO ANSWERS; its cover code is what is said (owner 8 Nov) — year, month, tier, board are their own facets, and tellApart_ adds one where two collide. */
  paperId: { of: x => (x.row && x.row.paper_id) || '',
    showOf: id => paperTag_(id) || paperLabel_(id), tagSay: id => paperTag_(id),
    /* TWO PAPERS ONE NUMBER APART BY NOTHING ELSE (Combined Science's Paper 1 Biology, Chemistry, Physics): their titles, sitting last. */
    nameOf: id => { const t = paperLabel_(id); return [t.replace(/\s+—\s+[^—]+$/, ''), t]; } },
  /* THE SECTION OF A PAPER SAT IN SECTIONS (770): an ordinary facet, asked whenever it splits (owner, 15 Nov). */
  paperSection: { of: x => { const r = paperSectionOf_(x && x.row); return r ? r.section + (r.topic ? ': ' + r.topic : '') : paperNameSection_(x); } },
  /* WHICH QUESTION, WHICH PART, HOW MANY MARKS: the words are the value, so the card and the button agree. */
  qNumber: { of: x => isQ_(x) && x.qNumber != null && String(x.qNumber) !== '' ? 'Q' + x.qNumber : '' },
  marks: { of: x => Number(x && x.marks) > 0 ? Number(x.marks) + ' ' + plural_(Number(x.marks), 'mark') : '',
    /* SAID AS THE PAPER PRINTS IT (owner 8 Nov, 28b): "[1]", while the value stays "1 mark". */
    showOf: v => { const m = /^(\d+) marks?$/.exec(String(v)); return m ? '[' + m[1] + ']' : v; } },
  /* THE CALCULATOR IS ITS OWN STEP (owner, R204): Calculator allowed or Non-calculator; What you need keeps the rest (compasses, the printed sheet), so both can be wanted. */
  needCalc: { of: x => asList_(x.needs).filter(v => NEED_CALC_[v]) },
  needs: { of: x => asList_(x.needs).filter(v => !NEED_CALC_[v]) },
  /* WHAT YOU STARRED (17 Nov): the Saved column is this tag now; blank signed out or with nothing saved, so it cannot split. */
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
