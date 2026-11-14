
function spellBetter_(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ga = spellGaps_(a.value), gb = spellGaps_(b.value);
  if (ga !== gb) return ga > gb ? a : b;
  if (a.n !== b.n) return a.n > b.n ? a : b;
  return cmpText(a.value, b.value) <= 0 ? a : b;
}

/* ONE WAY TO SAY A VALUE, FOR EVERY FACET (396): § */
const SAY_AS_IS = /^(?:[a-z]|[ivx]+)$/;
const sayCase_ = v => {
  const s = String(v == null ? '' : v).trim();
  return SAY_AS_IS.test(s) ? s : s.charAt(0).toUpperCase() + s.slice(1);
};
function facetSay_(facet, v) {
  let s = v;
  if (facet && typeof facet.showOf === 'function') { try { s = facet.showOf(v) || v; } catch (e) { s = v; } }
  s = sayCase_(s);
  let own = '';
  try { own = facet ? labelOf_('facet-show:' + facet.field, s, '') : ''; } catch (e) { own = ''; }
  return own || s;
}
/* A SHOW FITS A TAG (kcTidy_'s KC_TAG_MAX, 30), or the card moves it to an open-only line: § */
/* facet-show:<field>, in facetSay_), else the first of its reference ("II-II.122.3"), its name before a § */
const SHOW_MAX = 30;
function showForms_(s) {
  s = String(s == null ? '' : s).trim();
  if (s.length <= SHOW_MAX) return [s];
  const trim = t => t.replace(/[\s,;:.?!'’·/&…-]+$/, '');
  const head = t => trim(t.slice(0, SHOW_MAX - 1).replace(/\s+\S*$/, ''));
  const out = [], ref = /^((?:[IVX]+(?:-[IVX]+)*\.)?\d+(?:\.\d+)+)\s/.exec(s), cut = trim(s.replace(/\s*[([].*$/, ''));
  /* A NUMBERED PART ("…, part 55", "…, Canon 8") KEEPS ITS NUMBER: the end is what tells it from its neighbours. */
  const num = /(?:^|[\s,;:.-])((?:part|canon|section|chapter|book|article|question|no\.?|act|scene)\s+[\w.]+|\d+[\w.]*)$/i.exec(s);
  const ends = tail => trim(s.slice(0, SHOW_MAX - tail.length - 2).replace(/\s+\S*$/, '')) + '… ' + tail;
  if (ref) out.push(ref[1]);
  /* A TITLE AND ITS SUBTITLE ("Paper 3 · Section A: Statistics") says the title, never "Section A…". */
  const head1 = trim(s.replace(/:\s.*$/, ''));
  if (!ref && head1 !== s && head1.length >= 4 && head1.length <= SHOW_MAX) out.push(head1);
  if (num && !ref) out.push(ends(num[1]));
  if (cut.length >= 4 && cut.length <= SHOW_MAX) out.push(cut);
  const h = head(cut.length >= 4 ? cut : s);
  if (h.length >= 4) out.push(h + '…');
  out.push(ends(s.slice(-12).replace(/^\S*\s/, '').replace(/^[\s,;:.-]+/, '')), s.slice(0, SHOW_MAX - 1).trim() + '…');
  return out.filter(t => t.length <= SHOW_MAX && t.length > 2);
}
const showShort_ = s => showForms_(s)[0] || String(s).slice(0, SHOW_MAX);
/* EACH OVER-LONG SHOW TAKES ITS FIRST FORM NO OTHER ANSWER IN THE MENU ALREADY SAYS. */
function showFit_(values) {
  const taken = new Set(values.filter(v => String(v.show || '').length <= SHOW_MAX).map(v => spellKey_(v.show)));
  values.forEach(v => { if (String(v.show || '').length <= SHOW_MAX) return;
    const forms = showForms_(v.show), pick = forms.find(t => !taken.has(spellKey_(t))) || forms[forms.length - 1] || showShort_(v.show);
    taken.add(spellKey_(pick)); v.show = pick; });
}
/* ONE RULE FOR AN ANSWER'S WORDS (940): § */
const ANSWER_SAY = new WeakMap();
function answerSay_(facet, v) {
  const say = showShort_(facetSay_(facet, v));
  if (!facet) return say;
  let items = [];
  try { items = stuffItems() || []; } catch (e) { return say; }
  const pre = answerSaysBuilt_(items);
  if (pre) return (pre[facet.field] && pre[facet.field].get(spellKey_(v))) || say;
  let per = ANSWER_SAY.get(items);
  if (!per) { per = {}; ANSWER_SAY.set(items, per); }
  let m = per[facet.field];
  if (!m || m.facet !== facet) {
    m = { facet: facet, by: new Map() };
    try { facetTally_(items, facet).values.forEach(w => [w.value].concat(w.also || []).forEach(u => m.by.set(spellKey_(u), w.show || w.text || w.value))); } catch (e) { /* said in full, below */ }
    per[facet.field] = m;
  }
  return m.by.get(spellKey_(v)) || say;
}

/* ONE ORDER FOR EVERY FACET'S ANSWERS, BY WHAT THEY ARE (396): § */
const ROMAN_SAY = /^(x{0,3})(ix|iv|v?i{0,3})$/i;
const yearKey_ = v => (/^(?:19|20)\d{2}$/.test(v) ? Number(v) : null);
const dateKey_ = v => {
  const m = /^([A-Za-z]+)\s+((?:19|20)\d{2})$/.exec(String(v));
  if (!m) return null;
  /* A SEASON IS A POSITION IN THE YEAR TOO. */
  const i = SERIES_AT[m[1]] !== undefined ? SERIES_AT[m[1]] - 1 : MONTH_NAMES.indexOf(m[1]);
  return i === -1 ? null : Number(m[2]) * 12 + i;
};
/* THE KINDS TAB'S ORDER, for answers that are all kinds (What kind) or all groups of them (What for). */
function kindRank_() {
  const m = kindMap_(), labels = new Map();
  /* AN ANSWER ABOVE KINDS (`KIND_UNDER`) STANDS JUST BEFORE THE FIRST OF THEM. */
  Object.keys(m).sort((a, b) => m[a].at - m[b].at).forEach(k => {
    if (KIND_UNDER[k] && !labels.has(KIND_UNDER[k])) labels.set(KIND_UNDER[k], labels.size);
    if (!labels.has(m[k].label)) labels.set(m[k].label, labels.size);
  });
  const groups = new Map(groupOrder_().map((g, i) => [g, i]));
  return { labels, groups };
}
/* LISTS WHOSE OWN ORDER IS THE ORDER (473): § */
/* FIND'S FRONT MENU, in the owner's order (4 Nov): the first question's answers, whatever kinds stand under them. */
const FRONT_ORDER = ['Practice', 'Library', 'Videos', 'Newspaper', 'Coming soon', 'Posts', 'Messages', 'Profiles', 'Booking', 'Venues', 'Shop', 'Settings', 'Tools', 'Games', 'Reels', 'Flyers', 'Posters'];
/* THE DOORS' OWN MENUS IN THE OWNER'S ORDER (batch C): account types, who, which posts, when. */
const ANSWER_ORDERS = [FRONT_ORDER, ['Student', 'Parent', 'Staff', 'Apprentice', 'Admin', 'Business', 'Site'], ['Parent', 'Over 18', 'Under 18', 'Student', 'Tutor', 'Apprentice', 'Admin'],
  ['Approved', 'Waiting for approval', 'Deleted'], ['Today', 'This week', 'This month', 'This year', 'Older']];
function answerCmp_(texts) {
  const every = test => texts.length > 0 && texts.every(test);
  if (every(t => yearKey_(t) !== null)) return (a, b) => yearKey_(b) - yearKey_(a);
  if (every(t => dateKey_(t) !== null)) return (a, b) => dateKey_(b) - dateKey_(a);
  if (every(t => /^-?\d+(?:\.\d+)?$/.test(t))) return (a, b) => Number(a) - Number(b);
  if (every(t => MONTH_NAMES.indexOf(t) !== -1)) return (a, b) => MONTH_NAMES.indexOf(a) - MONTH_NAMES.indexOf(b);
  if (every(t => !!t && ROMAN_SAY.test(t))) return (a, b) => romanVal_(a.toLowerCase()) - romanVal_(b.toLowerCase());
  /* ERAS IN TIME ORDER (459), not the alphabet's. */
  const era = t => HIST_ERAS.findIndex(e => e.name === t);
  if (every(t => era(t) !== -1)) return (a, b) => era(a) - era(b);
  for (const list of ANSWER_ORDERS) {
    if (list.length && every(t => list.indexOf(t) !== -1)) return (a, b) => list.indexOf(a) - list.indexOf(b);
  }
  const k = kindRank_();
  for (const by of [k.labels, k.groups]) {
    if (every(t => by.has(t))) return (a, b) => by.get(a) - by.get(b);
  }
  return cmpText;
}

/* TWO ANSWERS DRAWN THE SAME ARE ONE ANSWER (owner, 12 Nov): what another facet tells apart is that facet's own question, never glued on as ` · 2017`. § */
function tellApart_(items, facet, values) {
  const by = {};
  values.forEach(v => { const k = spellKey_(v.show || v.text || v.value); (by[k] = by[k] || []).push(v); });
  const groups = Object.keys(by).map(k => by[k]).filter(g => g.length > 1);
  if (!groups.length) return;
  /* ONE WALK FOR EVERY COLLISION: the items of each colliding answer. */
  const of = new Map();
  groups.forEach(g => g.forEach(v => of.set(spellKey_(v.value), [])));
  items.forEach(x => facetOwn_(facet, x).forEach(w => { const l = of.get(spellKey_(w)); if (l) l.push(x); }));
  const one = (g, list) => {
    const seen = new Set();
    list.forEach(x => { let v = []; try { v = asList_(g.of(x)); } catch (e) { v = []; } seen.add(v.length === 1 ? v[0] : ''); });
    return seen.size === 1 ? [...seen][0] : '';
  };
  const facets = facetList().filter(g => g.field !== facet.field);
  /* SPLIT BY ANOTHER FACET: one answer, its values `also` (a press chips them all), and that facet is asked on its own. */
  groups.forEach(same => {
    const lists = same.map(v => of.get(spellKey_(v.value)) || []);
    const splits = facets.some(g => { const said = lists.map(l => one(g, l)); return new Set(said.filter(Boolean).map(spellKey_)).size > 1; });
    if (!splits) return;
    const head = same[0];
    head.also = (head.also || []).concat(...same.slice(1).map(v => [v.value].concat(v.also || [])));
    head.n = same.reduce((a, v) => a + (v.n || 0), 0);
    same.slice(1).forEach(v => values.splice(values.indexOf(v), 1));
  });
  /* STILL TWIN, NO FACET SPLITS THEM: § */
  const left = {};
  values.forEach(v => { const k = spellKey_(v.show || v.text || v.value); (left[k] = left[k] || []).push(v); });
  Object.keys(left).forEach(k => { const g = left[k];
    if (g.length < 2) return;
    /* ITS OWN NAME (`nameOf`, a paper's title) where the facet has one, else what it is called: § */
    const names = v => { let n = []; try { n = facet.nameOf ? asList_(facet.nameOf(v.value)) : []; } catch (e) { n = []; } return n.concat([v.text || v.value]); };
    const rungs = g.map(names), deep = Math.max(...rungs.map(r => r.length));
    for (let i = 0; i < deep; i++) { const at = rungs.map(r => String(r[Math.min(i, r.length - 1)] || ''));
      if (at.every(Boolean) && new Set(at.map(spellKey_)).size === g.length) { g.forEach((v, j) => { v.show = at[j]; }); return; } } });
}

/* `facetTally_` — ONE WALK OF THE LIST PER QUESTION, NOT THREE. § */
const FACET_TALLY = new WeakMap();

/* Each item's weight in a split: 1, or 1/n for the n cards of one writing. Memoised per list. */
const WRITING_WEIGHTS = new WeakMap();
function writingWeights_(items) {
  let w = WRITING_WEIGHTS.get(items);
  if (w) return w;
  const n = {};
  items.forEach(x => { if (x && x.libBook) n[x.libBook] = (n[x.libBook] || 0) + 1; });
  w = items.map(x => x && x.libBook ? 1 / n[x.libBook] : 1);
  WRITING_WEIGHTS.set(items, w);
  return w;
}
function facetTally_(items, facet) {
  let perList = FACET_TALLY.get(items);
  if (!perList) { perList = {}; FACET_TALLY.set(items, perList); }
  const had = perList[facet.field];
  /* KEYED ON THE FACET OBJECT AS WELL AS ITS NAME. § */
  if (had && had.facet === facet) return had;

  const by = {};
  let answered = 0;
  /* ONE READ PER ITEM (930): § */
  const wt = writingWeights_(items);
  let top = 0, whole = 0;
  const wBy = {};
  items.forEach((x, i) => {
    /* COUNTED ONCE PER VALUE, NOT ONCE PER ITEM. § */
    const vals = facetOwn_(facet, x);
    whole += wt[i];
    if (vals.length === 1) { const k = spellKey_(vals[0]); if (k) wBy[k] = (wBy[k] || 0) + wt[i]; }
    else if (vals.length) new Set(vals.map(spellKey_).filter(Boolean)).forEach(k => { wBy[k] = (wBy[k] || 0) + wt[i]; });
    if (!vals.length) return;
    answered++;
    /* ONE VALUE IS THE OVERWHELMING CASE and a `Set` of one is an allocation to prove it. § */
    if (vals.length === 1) { by[vals[0]] = (by[vals[0]] || 0) + 1; return; }
    new Set(vals).forEach(v => { by[v] = (by[v] || 0) + 1; });
  });

  /* ---------- THE VARIANTS ARE FOLDED HERE, BEFORE ANYTHING COUNTS THEM § */
  const folded = {};
  Object.keys(by).forEach(v => {
    const k = spellKey_(v);
    if (!k) return;
    const seen = folded[k];
    const best = spellBetter_(seen && seen.best, { value: v, n: by[v] });
    folded[k] = { best: best, n: (seen ? seen.n : 0) + by[v] };
  });
  /* `value` IS WHAT IS MATCHED, `text` WHAT IT IS CALLED, `show` WHAT IS DRAWN — the shortest unique form § */
  /* NAMED AND SORTED ONLY WHEN READ: § */
  let values = null;
  const named = () => {
    if (values) return values;
    values = Object.keys(folded).map(k => ({ value: String(folded[k].best.value), n: folded[k].n, text: facetSay_(facet, String(folded[k].best.value)) }));
    const cmp = answerCmp_(values.map(v => v.text));
    values.sort((a, b) => cmp(a.text, b.text) || cmpText(a.value, b.value));
    shortLabels_(values); tellApart_(items, facet, values); showFit_(values);
    return values;
  };

  /* THE SPLIT IS MEASURED IN THINGS, NOT CARDS (517): § */
  Object.keys(wBy).forEach(k => { if (wBy[k] > top) top = wBy[k]; });

  const out = {
    facet: facet,
    get values() { return named(); },
    count: Object.keys(folded).length,
    coverage: items.length ? answered / items.length : 0,
    /* ---------- HOW MUCH OF THE LIST THE COMMONEST ANSWER DOES *NOT* KEEP § */
    split: Object.keys(folded).length < 2 || !whole ? 0 : (whole - top) / whole,
  };
  perList[facet.field] = out;
  return out;
}

/** The distinct values of one facet across a set, with how many each would leave. */
/* AN ANSWER SPELT LIKE A CHOSEN CHIP IS NEVER OFFERED (830), under any question: § */
function facetValues(items, facet) {
  const all = facetTally_(items, facet).values;
  const chips = ((STUFF && STUFF.filters) || []).filter(c => c && !c.any && c.field !== facet.field).map(c => spellKey_(c.value));
  if (!chips.length) return all;
  const said = v => chips.includes(spellKey_(v.value)) || chips.includes(spellKey_(v.show || v.text || v.value));
  return all.some(said) ? all.filter(v => !said(v)) : all;
}

/* HOW MANY OF THESE COULD EVEN ANSWER IT. § */
function facetCoverage(items, facet) {
  return facetTally_(items, facet).coverage;
}

/* HOW MUCH OF THE SET A QUESTION HAS TO COVER BEFORE IT IS WORTH ASKING — one bar for every facet (396). */
const FACET_COVERAGE = 0.5;

/* ---------- A QUESTION WITH FORTY ANSWERS IS NOT A QUESTION, IT IS THE LIST § */
const FACET_MAX_ANSWERS = 40;
/* ---------- HOW MANY ANSWERS ARE DRAWN, WHICH IS NOT HOW MANY MAKE A QUESTION ASKABLE § */
const FACET_MAX_SHOWN = 7;

/* ---------- AND A QUESTION EVERYBODY ANSWERS THE SAME WAY IS NOT A QUESTION EITHER § */
const FACET_MIN_MINORITY = 0.02;

/* Does answering this actually split the list? § */
function facetSplit_(items, facet) {
  return facetTally_(items, facet).split;
}

const DOC_TYPE_UNDER = { 'Specimen paper': 'Past paper', '5-a-day': 'Worksheet', 'End of topic test': 'Worksheet' };
/* KINDS UNDER KINDS (546, 610): § */
/* What kind offers the one above (`kindLabel`); the kind itself is asked after it (`kindOwn`). */
const KIND_UNDER = { question: 'Practice', answer: 'Practice', practical: 'Practice', project: 'Library', timeline: 'Library', spec: 'Library',
  /* THE OWNER'S FRONT MENU (4 Nov): each kind under one of FRONT_ORDER's answers. */
  /* A TUTOR ANSWERS TWO FRONT DOORS (owner, 8 Nov): § */
  tutor: ['Booking', 'Profiles'], venue: 'Booking', subject: 'Booking', level: 'Booking', receipt: 'Booking', bookform: 'Booking', shop: 'Shop',
  person: 'Profiles', video: 'Videos', setting: 'Settings', health: 'Settings', soon: 'Coming soon', msg: 'Messages',
  post: 'Posts', tool: 'Tools', game: 'Games', offPosts: 'Posts', offShop: 'Shop', offBooking: 'Booking' };
/* A RETURNED WIDGET THAT IS A BROWSABLE THING (batch B) is its own front answer: FIND_WIDGET_GROUPS (arcade.js). */
/* ITS TAG SAYS ONE DOOR: § */
function kindTopTag_(x) {
  const l = asList_(kindTop_(x)); if (l.length < 2) return l[0] || '';
  let g = '';
  try { const f = chipsOn_(STUFF.filters, 'kindLabel').find(f => l.indexOf(f.value) >= 0); g = f ? f.value : kindOf_(x).group; } catch (e) { g = ''; }
  return l.indexOf(g) >= 0 ? g : l[0];
}
function kindTop_(x) { return (x && x.top) || (x && x.widget && typeof FIND_WIDGET_GROUPS !== 'undefined' && FIND_WIDGET_GROUPS[x.widget.id]) || (x && KIND_UNDER[x.kind]) || ''; }
/* ONE RULE FOR A VALUE UNDER ANOTHER (660): § */
function underTop_(table, v) { return (v && table[v]) || v || ''; }
/* 680: the second offers only what is BELOW the one above, never the parent's own name again; Doesn't § */
function underOwn_(table, v) { return v && table[v] && table[v] !== v ? v : ''; }
/* 680: a kind spelt like the kind above it is never offered twice (What kind, then Which). */
function notTop_(x, v) { const top = asList_(kindTop_(x)).map(spellKey_); const l = [].concat(v || []).filter(k => k && top.indexOf(spellKey_(k)) === -1); return l.length > 1 ? l : (l[0] || ''); }

/* ---------- A 5-A-DAY'S DATE, READ OFF ITS PAPER ID § */
function fiveADayOf_(id) {
  const m = /^P-CBM-5AD-[A-Z+]+-(\d{2})(\d{2})$/.exec(String(id || ''));
  if (!m) return null;
  const month = MONTH_NAMES[Number(m[1]) - 1];
  return month ? { month, day: Number(m[2]) } : null;
}
function fiveADay_(x) {
  return x && x.row && String(x.row.document_type || '') === '5-a-day' ? fiveADayOf_(x.row.paper_id) : null;
}

/* THE ONE RULE EVERY FACET IS ASKED BY (396), as a reason it is NOT asked, or '' when it may be: § */
/* A NUMBERED RUN IS DRAWN AS A GRID (396): § */
const FACET_MAX_GRID = 200;
const runNumber_ = v => (/^(?:([A-Za-z]+) )?(\d+)$/.exec(String(v.show || v.value)) || []);
const numberedRun_ = values => values.length > 1 && values.every(v => runNumber_(v)[2]) && new Set(values.map(v => runNumber_(v)[1] || '')).size === 1;
function facetWhy_(items, facet, over) {
  /* COUNTED BEFORE NAMED: § */
  if (!over && facetTally_(items, facet).count - ((STUFF && STUFF.filters) || []).length > Math.max(FACET_MAX_GRID, Object.keys(DOC_TYPE_UNDER).length)) return 'too many answers — that is a list, not a question (max ' + FACET_MAX_ANSWERS + ')';
  const all = facetValues(items, facet), vals = all.length;
  /* 680: answers that are all BELOW an answer already chosen are asked even alone — Doesn't matter is the § */
  if (vals > 1 && underChosen_(all)) return ''; /* owner 5 Nov: one answer is never a question, even below a chosen one */
  if (vals < 2) return (vals ? 'one answer' : 'nobody can answer it') + ' — nothing to decide';
  if (!over && vals > (vals <= FACET_MAX_GRID && numberedRun_(all) ? FACET_MAX_GRID : FACET_MAX_ANSWERS)) return 'too many answers — that is a list, not a question (max ' + FACET_MAX_ANSWERS + ')';
  const cov = facetCoverage(items, facet);
  if (cov < FACET_COVERAGE) return 'thin — needs ' + Math.round(FACET_COVERAGE * 100) + '%';
  const echo = facetEcho_(items, facet);
  if (echo) return echo + ' asked finer, and it was answered Any — each answer sits inside one of that question\'s';
  const local = facetLocal_(items, facet);
  if (local) return 'counts within each ' + local + ' — asked once one ' + local + ' is left';
  const split = facetSplit_(items, facet);
  if (split < FACET_MIN_MINORITY && !kindNamed_(all) && !facet.choose) {
    return 'lopsided — pressing its commonest answer would leave ' + Math.round(split * 1000) / 10
         + '% of the list, needs ' + Math.round(FACET_MIN_MINORITY * 100) + '%';
  }
  return '';
}

function underChosen_(values) {
  const chosen = new Set((STUFF.filters || []).filter(f => !f.any).map(f => spellKey_(f.value)));
  return values.every(v => DOC_TYPE_UNDER[v.value] && chosen.has(spellKey_(DOC_TYPE_UNDER[v.value])));
}

/* A QUESTION WHOSE EVERY ANSWER IS A KIND'S NAME (the kinds tab) chooses what a card IS, not how many (660): § */
function kindNamed_(values) {
  const m = kindMap_(), names = new Set(Object.keys(m).map(k => spellKey_(m[k].label)).concat(spellKey_(ansKind_())));
  return values.length > 1 && values.every(v => names.has(spellKey_(v.value)));
}

/* A QUESTION THAT RE-ASKS ONE ANSWERED ANY (499, 660): § */
function facetEcho_(items, facet) {
  const skipped = (STUFF.filters || []).filter(f => f.any && f.field !== facet.field);
  for (const g of skipped) {
    const G = facetList().find(f => f.field === g.field);
    if (!G) continue;
    /* FINER BY WHAT IT IS, NOT BY THIS LIST (8 Nov): § */
    const to = echoInside_(facet, G) && echoTo_(items, facet, G), ok = !!to && Object.keys(to).length > 1;
    /* A skipped question the list answers one way was never a choice, so nothing re-asks it § */
    const gAll = new Set();
    if (ok) for (const x of items) { facetOwn_(G, x).forEach(v => gAll.add(spellKey_(v))); if (gAll.size > 1) break; }
    if (ok && gAll.size > 1) return G.label || G.field;
  }
  return '';
}
/* Each F answer's one G answer over a list, or null when one F answer spans two G answers or a card holds § */
function echoTo_(items, F, G) {
  const to = {};
  for (const x of items) {
    const a = facetOwn_(F, x);
    if (!a.length) continue;
    const b = facetOwn_(G, x);
    if (b.length !== 1) return null;
    const kb = spellKey_(b[0]);
    if (a.some(v => { const ka = spellKey_(v); if (to[ka] && to[ka] !== kb) return true; to[ka] = kb; return false; })) return null;
  }
  return to;
}
const ECHO_MEMO_ = { from: null, m: {} };
function echoInside_(F, G) {
  const all = stuffItems();
  if (ECHO_MEMO_.from !== all) { ECHO_MEMO_.from = all; ECHO_MEMO_.m = {}; }
  const k = F.field + '>' + G.field;
  if (!(k in ECHO_MEMO_.m)) ECHO_MEMO_.m[k] = !!echoTo_(all, F, G);
  return ECHO_MEMO_.m[k];
}

/* A COUNT WITHIN EACH ANSWER OF ANOTHER QUESTION (Question within Paper): § */
/* Not when G's answers also run, unevenly, inside F's: § */
function runsInside_(items, F, G) {
  const by = {};
  let cards = 0, cells = 0;
  for (const x of items) {
    const a = facetOwn_(F, x), b = facetOwn_(G, x);
    if (!a.length) continue;
    /* A count lives only inside its parent: § */
    if (b.length !== 1) return 0;
    const s = by[spellKey_(b[0])] || (by[spellKey_(b[0])] = new Set());
    cards++;
    a.forEach(v => s.add(spellKey_(v)));
  }
  for (const k in by) cells += by[k].size;
  /* A parent holds more cards than counts; one card a cell is the card's own address (Question by Part), a grid. */
  if (cards <= cells) return 0;
  const sets = Object.values(by).filter(s => s.size > 1).sort((p, q) => p.size - q.size);
  /* A count runs longer than its parents are many: § */
  if (sets.length < 2 || sets[sets.length - 1].size <= Object.keys(by).length) return 0;
  if (!sets.every((s, i) => !i || [...sets[i - 1]].every(v => s.has(v)))) return 0;
  return sets[0].size === sets[sets.length - 1].size ? 1 : 2;
}
const LOCAL_MEMO_ = new WeakMap();
function facetLocal_(items, F) {
  let m = LOCAL_MEMO_.get(items);
  if (!m) LOCAL_MEMO_.set(items, m = {});
  /* A G ALREADY ASKED NEVER HOLDS F (8 Nov): § */
  const asked = (STUFF.filters || []).map(f => f.field), key = F.field + '|' + asked.join(',');
  if (key in m) return m[key];
  let say = '';
  const nF = facetValues(items, F).length;
  /* ONLY A COARSER G, one the tab puts before F (8 Nov): § */
  for (const G of facetList()) {
    if (G === F) break;
    const nG = asked.indexOf(G.field) !== -1 ? 0 : facetValues(items, G).length;
    if (nG < 2 || nG >= nF || !runsInside_(items, F, G) || runsInside_(items, G, F) === 2) continue;
    /* A G NEVER ASKED HERE NEVER HOLDS F (1180): § */
    if (facetWhy_(items, G)) continue;
    say = G.label || G.field;
    break;
  }
  return (m[key] = say);
}

/* HOW WELL A QUESTION SPLITS THE LIST, in bits, the score the menu-rule check measures (920). § */
const FACET_BITS_ENOUGH = 2;
function facetBits_(items, facet) {
  const vs = facetValues(items, facet), t = vs.reduce((a, v) => a + v.n, 0);
  const bits = t ? vs.reduce((a, v) => v.n ? a - v.n / t * Math.log2(v.n / t) : a, 0) : 0;
  return Math.min(FACET_BITS_ENOUGH, Math.round(bits * 100) / 100);
}

/* THE NEXT QUESTION WORTH ASKING, or nothing (rule 7, owner 6 Nov): § */
function nextFacet(items) {
  const asked = STUFF.filters.map(f => f.field);
  const ok = [];
  for (const facet of facetList()) {
    if (asked.indexOf(facet.field) !== -1 || facetWhy_(items, facet)) continue;
    const vals = facetValues(items, facet);
    /* What a card IS is asked first (660), the front's answers are FRONT_ORDER's (4 Nov), and a choose question § */
    if (kindNamed_(vals) || facet.choose || (!asked.length && vals.every(v => FRONT_ORDER.indexOf(v.value) !== -1))) return facet;
    ok.push({ facet, bits: facetBits_(items, facet) });
  }
  const pick = list => list.reduce((b, c) => (!b || c.bits > b.bits ? c : b), null);
  let best = pick(ok);
  /* A finer question splits more, but its coarser one comes first (the subtype rule): Subject before Topic. */
  /* THE COARSEST HOLDING IT, BY THE TAB (1180): § */
  const at = new Map(facetList().map((f, i) => [f, i]));
  for (let hop = 0; best && hop < 4; hop++) {
    const up = ok.filter(c => c !== best && at.get(c.facet) < at.get(best.facet)
      && facetInside_(best.facet, c.facet, items) && !facetInside_(c.facet, best.facet, items))
      .reduce((b, c) => (!b || at.get(c.facet) < at.get(b.facet) ? c : b), null);
    if (!up) break;
    best = up;
  }
  return best ? best.facet : null;
}

/* EVERY ANSWER OF F SITS INSIDE ONE ANSWER OF G, and G has two answers at least: F is G asked finer. */
/* One walk per list and pair, kept as FACET_TALLY keeps its tallies: a tap never re-walks the library. */
const INSIDE_MEMO_ = new WeakMap();
function facetInside_(F, G, items) {
  let m = INSIDE_MEMO_.get(items);
  if (!m) INSIDE_MEMO_.set(items, m = {});
  const key = F.field + '>' + G.field;
  if (key in m) return m[key];
  /* A CARD MAY HOLD TWO OF G (the Masoretic Text is Christianity and Judaism, 660): § */
  const to = {};
  let any = 0;
  for (const x of items) {
    const a = facetOwn_(F, x), b = facetOwn_(G, x);
    if (!a.length || !b.length) continue;
    const kb = new Set(b.map(spellKey_));
    for (const v of a) {
      const k = spellKey_(v);
      to[k] = to[k] ? to[k].filter(g => kb.has(g)) : [...kb];
      if (!to[k].length) return (m[key] = false);
      any++;
    }
  }
  /* G's two answers are the list's, not only F's cards': § */
  return (m[key] = any > 0 && facetValues(items, G).length > 1);
}

/* AND WHEN NOTHING QUALIFIES, THE CLOSEST THING TO A QUESTION RATHER THAN A DEAD END: § */
function overFacet_(items) {
  const asked = STUFF.filters.map(f => f.field);
  let best = null;
  for (const facet of facetList()) {
    if (asked.indexOf(facet.field) !== -1) continue;
    const vals = facetValues(items, facet).length;
    if (vals <= FACET_MAX_ANSWERS || facetWhy_(items, facet, true)) continue;
    if (!best || vals < best.n) best = { facet: facet, n: vals };
  }
  return best ? best.facet : null;
}

/* THE CARD. Small — a reference, the marks, and the first line of the question, because a list of ninety § */
/* THE RECORD IS THE FACE OF IT. § */
/* ---------- ONE BOUT (batch D): the two fighters' portraits facing each other under the tags, and nothing else § */
/* Its card is its item map (ITEM_MAPS.fight, cards-parts.js); these portraits are its body. */
const fightBody_ = f => [{ type: 'figure', ...personPicSpec_(f.aId, f.a) }, { type: 'figure', ...personPicSpec_(f.bId, f.b, true) }];

/* WHO WON A BOUT, by id where there is one (as the card frames the face), else by the name the row gives. */
function boutWinner_(x) {
  const f = x && isFight_(x) ? x.row : null;
  if (!f) return '';
  if (f.winnerId && String(f.winnerId) === String(f.aId)) return f.a || '';
  if (f.winnerId && String(f.winnerId) === String(f.bId)) return f.b || '';
  return String(f.winner || '').trim();
}
/* A BOUT'S MONTH AND YEAR, off its `YYYY-MM-DD` date; blank for anything else. */
function boutDate_(x) {
  const m = x && isFight_(x) && x.row ? /^(\d{4})(?:-(\d{2}))?/.exec(String(x.row.date || '')) : null;
  return m ? { year: m[1], month: m[2] ? (MONTH_NAMES[Number(m[2]) - 1] || '') : '' } : { year: '', month: '' };
}

/* ---------- ONE DIVISION, HOWEVER IT WAS TYPED § */
function divisionOf_(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/* ---------- EVERY DECADE A CAREER TOUCHED § */
const DECADE_MAX = 9;

function decadeOf_(v) {
  const m = /\b(1[89]\d{2}|20\d{2})\b/.exec(String(v == null ? '' : v));
  return m ? (Math.floor(Number(m[1]) / 10) * 10) : 0;
}

function decadesOf_(x) {
  const r = (x && x.row) || {};
  if (!r || (x && !isBoxer_(x) && !isFight_(x))) return [];
  const one = d => d ? String(d) + 's' : '';
  /* A BOUT IS ONE DAY. `date` is the fight; everything else on the row is about the fighters. */
  if (isFight_(x)) return [one(decadeOf_(r.date))].filter(Boolean);
  const from = decadeOf_(r.activeFrom);
  const to = decadeOf_(r.activeTo) || decadeOf_(r.recordAsOf) || from;
  if (!from && !to) return [];
  if (!from || !to || to < from) return [...new Set([one(from), one(to)])].filter(Boolean);
  const out = [];
  for (let d = from; d <= to && out.length <= DECADE_MAX; d += 10) out.push(one(d));
  return out;
}

/* ---------- A PRACTICAL § */
/* ---------- THE TWO SHAPES A PRACTICAL COMES IN § */
const PRAC_TYPE = { experiment: 'Experiment', build: 'Build' };
/* THE `required` FACET'S THREE ANSWERS, IN THE ORDER A TUTOR READS THEM: § */
const PRAC_NEED = ['Required practical', 'Extra', 'Not for now'];

/* A FACTS CARD (master template): each line plain words, said in the order a tutor reads them; a refused one says why first. */
cardKind_('practical', x => {
  const p = x.row || {}, off = p.excluded;
  /* THE STRIP SAID "lab · needs a lab" AND A SCREENSHOT IS WHAT CAUGHT IT. § */
  const kit = /with kit/i.test(p.feasible) ? 'needs kit' : '';
  const money = p.costPerRun == null ? '' : p.costPerRun === 0 ? 'free to run' : money_(p.costPerRun) + ' a run';
  const strip = [p.minutes ? p.minutes + ' min' : '', p.ageMin ? p.ageMin + '+' : '', p.groupSize > 1 ? p.groupSize + ' students' : '',
    p.venue, kit, money].filter(Boolean).join(' · ');
  const lines = [off ? 'Why not ' + off + (p.reconsiderAt ? ' Worth another look at ' + p.reconsiderAt + ', in a lab.' : '') : '', p.aim,
    [strip, p.hazard ? p.hazard + ' hazard' : ''].filter(Boolean).join(' '), p.outcome ? 'You end up with ' + p.outcome : '',
    !off && (p.wow === 'high' || p.wow === 'very high') ? 'Worth opening a session with.' : ''];
  return { look: 'prac kc-facts', off: !!off, tags: kcFacetTags_(x), body: [{ type: 'text', paras: lines }] };
});

/* THE GUIDE — WHAT A PRACTICAL NEEDS AROUND IT BEFORE ANYBODY RUNS ONE. § */

/* ---------- ONE BOX, ONE SLOT § */
/* THE BOX IS A TOOL (the keypad's field, its Send and its verdict), so the page carries it as an embed block. */
function guideBox_(x, slot, ask, hint) {
  const k = ansKey_(x) + '#' + slot, val = ansRead_(k);
  const field = cardBlock_({ type: 'group', tag: 'label', look: 'qp-ans gd-box', blocks: [{ type: 'group', tag: 'span', look: 'gd-ask', text: ask },
    hint ? { type: 'group', tag: 'span', look: 'gd-hint', text: hint } : ''], inner: kpField_(k, val, 'words', false, ask) });
  /* ---------- AND A SEND UNDER EACH, SIGNED IN § */
  const send = typeof whoIs_ === 'function' && whoIs_() ? tile_({ send: true, act: 'qp-send', cls: 'qp-send' }) : '';
  if (!send) return field;
  const said = subBoxSay_(k, val);
  return cardBlock_({ type: 'group', look: 'qp-mark gd-mark' + (said.cls ? ' ' + said.cls : ''), inner: field + send + cardBlocks_([
    { type: 'group', tag: 'span', look: 'qp-verdict', attrs: { role: 'status', 'aria-live': 'polite' }, text: said.text },
    { type: 'group', tag: 'span', look: 'qp-saved', attrs: { 'data-k': k }, text: ansSavedSay_(k) }]) });
}
CARD_EMBEDS['guide-box'] = a => (a.x ? guideBox_(a.x, a.slot, a.ask, a.hint) : '');

/* A PART IS A PAGE: its title the tag, whose page it is the first line, then its blocks (the master template). */
const partPage_ = (look, part, kick, what, body, tiles) => renderCard({ kind: 'part', look: look + ' prac-part is-' + part, name: what,
  tags: [{ text: what }], body: [{ type: 'text', look: 'fc-kick', text: kick }].concat(body.filter(Boolean)), tiles: tiles || [] });
/* ---------- THE KIT, AS A LIST AGAIN § */
const kitList_ = list => ({ type: 'list', items: (list || []).map(e => e.name + (e.qty ? ': ' + e.qty : '')) });
const gdSec_ = (look, blocks) => ({ type: 'section', look: 'gd' + (look ? ' ' + look : ''), blocks });
const figPage_ = svg => gdSec_('', [{ type: 'figure', svg }]);
const stepsList_ = steps => gdSec_('prac-steps', [{ type: 'list', ordered: true, items: steps || [] }]);
const guideSlot_ = (x, slot, ask, hint) => ({ type: 'embed', tool: 'guide-box', args: { x, slot, ask, hint } });

function practicalPart_(x, part) {
  const p = x.row;
  /* ---------- FIVE THINGS, IN THIS ORDER, AND NOTHING ELSE FOR NOW § */
  /* ---------- ONE PAGE EACH, HEADED WITH WHOSE PAGE IT IS § */
  const page = (what, body) => partPage_('prac', part, x.name, what, body);
  /* THE DRAWING, ON A PAGE OF ITS OWN. `.gd` round it so every `.gd figure` rule applies. */
  if (part === 'fig') return page('Diagram', [figPage_(p.diagram)]);
  /* The one-off cost is about the KIT, so it is on the kit's page rather than the first. */
  if (part === 'kit') return page('Equipment', [gdSec_('prac-kit', [kitList_(p.equipment)]),
    p.setupCost ? { type: 'text', look: 'prac-cost', text: 'About ' + money_(p.setupCost) + ' of kit to set up, and it is bought once.' } : null]);
  if (part === 'steps') return page('Steps', [stepsList_(p.steps)]);
  /* ---------- THE WORKSHEET, AND THE CANDIDATE LISTS ARE PART OF IT § */
  if (part === 'work') return page('Worksheet', [gdSec_('fc-sec', [
    p.variables.length ? { type: 'section', look: 'prac-tab', head: 'Things you could change', blocks: [{ type: 'list', items: p.variables }] } : null,
    p.log.length ? { type: 'section', look: 'prac-tab', head: 'Things you could measure', blocks: [{ type: 'list', items: p.log }] } : null,
    guideSlot_(x, 'iv', 'Independent variable — the one thing you will change', 'One only. Everything else has to stay still, or you will not know which of them did it.'),
    guideSlot_(x, 'dv', 'Dependent variable — what you will measure', 'How will you measure it, and in what units?'),
    guideSlot_(x, 'cv', 'Control variables — what you must keep the same', 'Usually the longest of the 3. Everything you are NOT changing.'),
  ].filter(Boolean))]);
  return '';
}

/* A PROJECT — THREE OR FOUR SESSIONS THAT END IN SOMETHING A CHILD MADE. § */
/* ---------- A PROJECT OR A COURSEWORK § */
const PROJ_TYPE = { project: 'Project', coursework: 'Coursework' };
const projType_ = p => PROJ_TYPE[(p && p.projectType) || 'project'] || String(p.projectType);

cardKind_('project', x => {
  const p = x.row || {};
  /* AGES AS A RANGE, because "8+" on a podcast for sixteen-year-olds would be true and useless. */
  const ages = p.ageMin && p.ageMax ? 'ages ' + p.ageMin + '–' + p.ageMax : p.ageMin ? p.ageMin + '+' : '';
  const strip = [p.sessions ? p.sessions + (p.sessions === 1 ? ' session' : ' sessions') : '', ages].filter(Boolean).join(' · ');
  /* THE BOARD AND THE SPEC (`AQA 8552`): which qualification the work counts towards. */
  const qual = [p.board, p.specRef].filter(Boolean).join('\u00a0');
  return { look: 'prac proj lib-c kc-facts', tags: kcFacetTags_(x), body: [{ type: 'text', paras: [qual, p.summary, strip, p.makes ? 'You end up with ' + p.makes : ''] }] };
});

function projectPart_(x, part) {
  const p = x.row;
  /* THE PRACTICAL'S PAGE HEADING, for its reason: § */
  const page = (what, body, tiles) => partPage_('prac proj', part, x.name, what, body, tiles);
  if (part === 'kit') return page('Materials', [gdSec_('prac-kit', [kitList_(p.materials)])]);
  /* THE SAFETY LINE IS UNDER THE STEPS, ONE PARAGRAPH, which is `jobAdminOpts_`'s rule. § */
  /* A COURSEWORK'S STEPS ARE ITS STAGES -- brief, research, specification, ideas, development, models § */
  if (part === 'steps') return page(p.projectType === 'coursework' ? 'Stages' : 'Steps', [stepsList_(p.steps),
    p.safety ? { type: 'text', look: 'fc-note', text: [{ b: 'Before you start' }, ' ', p.safety] } : null]);
  if (part !== 'share') return '';
  /* A THING HAS TILES: the one action on this page is going to Messages, so it is a tile in a `.tile-row` § */
  /* "SEND IT IN MESSAGES", NOT "TO YOUR TUTOR". § */
  /* ---------- AND ON A COURSEWORK, WHOSE WORK IT IS § */
  const own = p.projectType === 'coursework' ? { type: 'text', look: 'fc-note', text: [{ b: 'Your real coursework' }, ' This brief is practice. The one you hand in '
    + 'starts from the context your exam board sets, and it must be your own work: a tutor can teach the stages on this brief, but must not comment on, '
    + 'correct or improve work that will be handed in. Tell your teacher about any help you have outside school.'] } : null;
  return page('Share it', [{ type: 'text', look: 'fc-lede', text: 'When it is finished, send it in Messages.' },
    p.share ? { type: 'text', look: 'fc-say', text: [{ b: 'What to send' }, ' ', p.share] } : null, own],
  [{ icon: 'chat', label: 'Messages', note: 'send it', act: 'proj-share' }]);
}

/* TO MESSAGES, AND NOTHING ELSE. § */
on('proj-share', () => go('dm'));

/* THE @family. TEXTBOOK — A CONTENTS CARD, THEN ONE PAGE PER CHAPTER. § */
/* A FORMULA IS TYPESET BY THE RENDERER (`{ typeset, frac }`, cardFrac_ in cards-render.js): its slashes stacked, its subscripts drawn as such. */
const tbMath_ = s => ({ typeset: s, frac: true });
/* A SUBSCRIPT IS DRAWN AS ONE, NOT AS THE FONT'S OWN GLYPH. § */
const TB_SUB = '₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₙₛₜ', TB_SUB_AS = '0123456789aeoxnst';
const tbSub_ = s => String(s).split(/([₀-₉ₐₑₒₓₙₛₜ]+)/).map((run, i) => (i % 2 ? { sub: [...run].map(c => TB_SUB_AS[TB_SUB.indexOf(c)]).join('') } : run)).filter(r => r !== '');

/* ---------- A CONTENT CARD: ONE CHAPTER, WHOLE, WITH THE QUESTIONS' TAGS ON IT § */
/* ONE WIDGET PER THING (408): § */
const tbMark_ = on => (on ? [' ', { badge: 'H', hint: 'Higher tier only' }] : []);
cardKind_('content', x => { const c = x.row || {};
  const words = c.words || [];
  return { look: 'prac tb ct lib-c', name: x.name, tags: kcFacetTags_(x), body: [
    words.length ? { type: 'section', look: 'tb-words', head: 'Key words', blocks: [{ type: 'list', items: words.map(w => [{ b: w.name }, ' — ', w.text].concat(tbMark_(w.higher))) }] } : null,
  ].filter(Boolean) }; });

/* A CONTENT CARD'S OTHER PAGES AND THEIR TITLES, ONE PLACE (408): § */
const CONTENT_PAGE = { fig: 'Diagram', formulas: 'Formulas', worked: 'Worked examples' };
function contentPageTitle_(x, part) {
  if (!part) return String((x && x.name) || '');
  return CONTENT_PAGE[part] || '';
}
function contentPart_(x, part) {
  if (!CONTENT_PAGE[part]) return '';
  const c = x.row;
  return renderCard({ kind: 'part', look: 'prac prac-part tb tb-page is-' + part, name: CONTENT_PAGE[part], tags: [{ text: CONTENT_PAGE[part] }],
    body: [{ type: 'text', look: 'fc-kick', text: [[c.subject, c.title].filter(Boolean).join(' · ')].concat(tbMark_(c.higher)) }]
      .concat(part === 'fig' ? [figPage_(c.diagram)] : tbSections_(c, null, { only: part === 'worked' ? 'points' : 'formulas', bare: true })) });
}

/* ---------- A CHAPTER'S KEY WORDS, FORMULAS AND WORKED LINES — ALL OF THEM, OR THE ONES ASKED FOR § */
/* `opt.only` draws one section ('words' | 'formulas' | 'points'); `opt.bare` drops its heading, as the § */
function tbSections_(c, keep, opt) {
  opt = opt || {};
  const want = s => !opt.only || opt.only === s;
  const sec = (look, head, items) => (items.length ? { type: 'section', look: 'fc-sec ' + look, head: opt.bare ? '' : head, blocks: [{ type: 'list', items }] } : null);
  const named = i => !keep || keep.indexOf(i.name) !== -1;
  /* A WORKED LINE IS NAMED BY HOW IT OPENS — "Exact values: sin 30° …" is about Exact values — and the next § */
  const opens = p => !keep || keep.some(k => p.text.indexOf(k) === 0 && !/[A-Za-z0-9]/.test(p.text.charAt(k.length)));
  const words = want('words') ? c.words.filter(named) : [], formulas = want('formulas') ? c.formulas.filter(named) : [];
  const points = want('points') ? c.points.filter(opens) : [];
  /* THE MARK ON THE FORMULA'S NAME, not after the formula: § */
  return [sec('tb-words', 'Key words', words.map(w => [{ b: w.name }, ' — '].concat(tbSub_(w.text), tbMark_(w.higher)))),
    sec('tb-math', 'Formulas', formulas.map(f => [{ b: f.name }].concat(tbMark_(f.higher), ' ', tbMath_(f.text)))),
    sec('tb-points', 'Worked', points.map(p => [tbMath_(p.text)].concat(tbMark_(p.higher))))].filter(Boolean);
}

/* ---------- ONE CHAPTER, AS AN ITEM THE FUNNEL ASKS THE QUESTIONS' QUESTIONS OF § */
/* ONE SUBJECT STAYS A WORD; A COMMA LIST IS AN ARRAY, ONE ANSWER EACH (1213). */
function subjectsOf_(s) { const a = String(s || '').split(/\s*,\s*/).filter(Boolean); return a.length > 1 ? a : (a[0] || ''); }
function contentItem_(b, c) {
  return {
    kind: 'content', name: c.title, key: 'ct:' + b.id + '-' + c.n,
    sub: [c.subject, c.level].filter(Boolean).join(' · '),
    image: '',
    /* A CHAPTER CAN SIT IN SEVERAL SUBJECTS ("Biology, Chemistry, Physics"): one answer each, never an umbrella "Science" (12 Nov). */
    subject: subjectsOf_(c.subject), level: c.level, keystage: c.keystage, topics: c.topics, years: c.years || [],
    examBoard: c.board || '', tier: c.tier || '',
    text: contentText_(c) + ' ' + topicAtoms_(c.topics).join(' '),
    row: c,
  };
}

/* `contentText_` — `projectText_`'s move for one content card: § */
function contentText_(c) {
  const parts = [c.title, c.subject, c.level, c.board, c.spec];
  c.words.concat(c.formulas, c.points).forEach(i => parts.push(i.name, i.text));
  return plainText_(parts.filter(Boolean).join(' '));
}
