
function spellBetter_(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ga = spellGaps_(a.value), gb = spellGaps_(b.value);
  if (ga !== gb) return ga > gb ? a : b;
  if (a.n !== b.n) return a.n > b.n ? a : b;
  return cmpText(a.value, b.value) <= 0 ? a : b;
}

/* ONE WAY TO SAY A VALUE, FOR EVERY FACET (396): its first letter capitalised, unless it is a single lower-case letter or a
   roman numeral — a part `a` and a sub-part `ii` as the paper prints them. */
const SAY_AS_IS = /^(?:[a-z]|[ivx]+)$/;
const sayCase_ = v => {
  const s = String(v == null ? '' : v).trim();
  return SAY_AS_IS.test(s) ? s : s.charAt(0).toUpperCase() + s.slice(1);
};
function facetSay_(facet, v) {
  let s = v;
  if (facet && typeof facet.showOf === 'function') { try { s = facet.showOf(v) || v; } catch (e) { s = v; } }
  return sayCase_(s);
}
/* ONE RULE FOR AN ANSWER'S WORDS (940): § */
const ANSWER_SAY = new WeakMap();
function answerSay_(facet, v) {
  const say = facetSay_(facet, v);
  if (!facet) return say;
  let items = [];
  try { items = stuffItems() || []; } catch (e) { return say; }
  let per = ANSWER_SAY.get(items);
  if (!per) { per = {}; ANSWER_SAY.set(items, per); }
  let m = per[facet.field];
  if (!m || m.facet !== facet) {
    m = { facet: facet, by: new Map() };
    try { facetTally_(items, facet).values.forEach(w => m.by.set(spellKey_(w.value), w.show || w.text || w.value)); } catch (e) { /* said in full, below */ }
    per[facet.field] = m;
  }
  return m.by.get(spellKey_(v)) || say;
}

/* ONE ORDER FOR EVERY FACET'S ANSWERS, BY WHAT THEY ARE (396): years and dates newest first, numbers by size, months
   by the calendar, roman numerals by value, kinds by the kinds tab, the rest A–Z with numbers as numbers. */
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
/* LISTS WHOSE OWN ORDER IS THE ORDER (473): a file pushes one, and answers all in it sort by it — the Talmud's orders and tractates. */
/* FIND'S FRONT MENU, in the owner's order (4 Nov): the first question's answers, whatever kinds stand under them. */
const FRONT_ORDER = ['Practice', 'Library', 'Videos', 'Reels', 'Newspaper', 'Flyers', 'Posters', 'Verse', 'Coming soon', 'Posts', 'Messages', 'Profiles', 'Booking', 'Shop', 'Settings', 'Tools', 'Games'];
/* THE DOORS' OWN MENUS IN THE OWNER'S ORDER (batch C): account types, who, which posts, when. */
const ANSWER_ORDERS = [FRONT_ORDER, ['Student', 'Parent', 'Staff', 'Apprentice', 'Business', 'Site'], ['Parent', 'Over 18', 'Under 18', 'Student', 'Tutor', 'Apprentice', 'Admin'],
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

/* TWO ANSWERS THAT WOULD BE DRAWN THE SAME SAY WHAT TELLS THEM APART (396): the other facets, in the tab's order, added
   until each reads differently — `Paper 1 · Higher` beside `Paper 1 · Foundation`. */
function tellApart_(items, facet, values) {
  const by = {}, told = [];
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
  /* A FACET THAT SPLITS WHAT STILL COLLIDES IS SAID, and each part goes on to the facets after it. */
  const part = (sub, from, tails) => {
    for (let i = from; i < facets.length && sub.length > 1; i++) {
      const said = sub.map(k => one(facets[i], k.list));
      if (!said.every(Boolean) || new Set(said.map(spellKey_)).size < 2) continue;
      sub.forEach((k, j) => tails.get(k).push(facetSay_(facets[i], said[j])));
      const by2 = {};
      sub.forEach((k, j) => { (by2[spellKey_(said[j])] = by2[spellKey_(said[j])] || []).push(k); });
      Object.keys(by2).forEach(w => part(by2[w], i + 1, tails));
      return;
    }
  };
  groups.forEach(same => {
    const sub = same.map(v => ({ v: v, list: of.get(spellKey_(v.value)) || [] }));
    const tails = new Map(sub.map(k => [k, []]));
    part(sub, 0, tails);
    sub.forEach(k => {
      const t = tails.get(k);
      if (!t.length) return;
      const tail = t.map(w => ' \u00b7 ' + w).join('');
      told.push({ v: k.v, full: (k.v.text || k.v.value) + tail });
      k.v.show = nameForms_(k.v.text || k.v.value)[0] + tail;
    });
  });
  /* THE SHORT NAME WITH WHAT TELLS IT APART, unless that collides with another answer — then the whole name with it. */
  if (told.length && new Set(values.map(v => spellKey_(v.show))).size !== values.length) told.forEach(t => { t.v.show = t.full; });
  /* AND AN ANSWER NOTHING COLLIDED WITH IS SAID SHORT TOO, when no other answer's short name is the same. */
  if (!told.length) return;
  const isTold = new Set(told.map(t => t.v));
  const shortOf = v => nameForms_(v.text || v.value)[0];
  const taken = new Map();
  values.forEach(v => { [spellKey_(v.show), spellKey_(shortOf(v))].forEach(k => taken.set(k, (taken.get(k) || 0) + 1)); });
  values.forEach(v => {
    if (isTold.has(v) || v.show !== (v.text || v.value)) return;
    const k = spellKey_(shortOf(v));
    if (k !== spellKey_(v.show) && (taken.get(k) || 0) === 1) v.show = shortOf(v);
  });
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
  /* ONE READ PER ITEM (930): the weighed split below once read every item's values again, half of Find's wait on a phone. */
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
  /* `value` IS WHAT IS MATCHED, `text` WHAT IT IS CALLED, `show` WHAT IS DRAWN — the shortest unique form (`shortLabels_`). */
  const values = Object.keys(folded)
    .map(k => ({ value: String(folded[k].best.value), n: folded[k].n }));
  values.forEach(v => { v.text = facetSay_(facet, v.value); });
  const cmp = answerCmp_(values.map(v => v.text));
  values.sort((a, b) => cmp(a.text, b.text) || cmpText(a.value, b.value));
  shortLabels_(values);
  tellApart_(items, facet, values);

  /* THE SPLIT IS MEASURED IN THINGS, NOT CARDS (517): a writing (`libBook`) weighs one however many verses it is, so the
     Bible's 31,000 cards cannot make Subject look lopsided. Every facet, one rule. */
  Object.keys(wBy).forEach(k => { if (wBy[k] > top) top = wBy[k]; });

  const out = {
    facet: facet,
    values: values,
    coverage: items.length ? answered / items.length : 0,
    /* ---------- HOW MUCH OF THE LIST THE COMMONEST ANSWER DOES *NOT* KEEP § */
    split: values.length < 2 || !whole ? 0 : (whole - top) / whole,
  };
  perList[facet.field] = out;
  return out;
}

/** The distinct values of one facet across a set, with how many each would leave. */
/* AN ANSWER SPELT LIKE A CHOSEN CHIP IS NEVER OFFERED (830), under any question: the chip already says it (680 is the chips' side). */
function facetValues(items, facet) {
  const all = facetTally_(items, facet).values;
  const chips = ((STUFF && STUFF.filters) || []).filter(c => c && !c.any && c.field !== facet.field).map(c => spellKey_(c.value));
  if (!chips.length) return all;
  const said = v => chips.includes(spellKey_(v.value)) || chips.includes(spellKey_(v.show || v.text || v.value));
  return all.some(said) ? all.filter(v => !said(v)) : all;
}

/* HOW MANY OF THESE COULD EVEN ANSWER IT. Not how many distinct answers there are — how many
   items have one at all. */
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

const DOC_TYPE_UNDER = { 'Specimen paper': 'Past paper', '5-a-day': 'Worksheet' };
/* KINDS UNDER KINDS (546, 610): "questions and answers should be under practice … practicals … projects too", "timeline should be in library under history". */
/* What kind offers the one above (`kindLabel`); the kind itself is asked after it (`kindOwn`). */
const KIND_UNDER = { question: 'Practice', answer: 'Practice', practical: 'Practice', project: 'Practice', timeline: 'Library',
  /* THE OWNER'S FRONT MENU (4 Nov): each kind under one of FRONT_ORDER's answers. */
  tutor: 'Booking', venue: 'Booking', subject: 'Booking', level: 'Booking', receipt: 'Booking', shop: 'Shop',
  friend: 'Profiles', person: 'Profiles', video: 'Videos', setting: 'Settings', health: 'Settings', soon: 'Coming soon', msg: 'Messages',
  post: 'Posts', tool: 'Tools', game: 'Games', reel: 'Videos', offPosts: 'Posts', offShop: 'Shop', offBooking: 'Booking' };
/* A RETURNED WIDGET THAT IS A BROWSABLE THING (batch B) is its own front answer: FIND_WIDGET_GROUPS (arcade.js). */
function kindTop_(x) { return (x && x.widget && typeof FIND_WIDGET_GROUPS !== 'undefined' && FIND_WIDGET_GROUPS[x.widget.id]) || (x && KIND_UNDER[x.kind]) || ''; }
/* ONE RULE FOR A VALUE UNDER ANOTHER (660): the first question answers the one above, the second the value itself — only in a family that has one. */
function underTop_(table, v) { return (v && table[v]) || v || ''; }
/* 680: the second offers only what is BELOW the one above, never the parent's own name again; Doesn't matter covers the rest. */
function underOwn_(table, v) { return v && table[v] && table[v] !== v ? v : ''; }
/* 680: a kind spelt like the kind above it is never offered twice (What kind, then Which). */
function notTop_(x, v) { const top = spellKey_(kindTop_(x)); const l = [].concat(v || []).filter(k => k && spellKey_(k) !== top); return l.length > 1 ? l : (l[0] || ''); }

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

/* THE ONE RULE EVERY FACET IS ASKED BY (396), as a reason it is NOT asked, or '' when it may be: two answers at least,
   half the list able to answer, a split worth making. `over` lets a question past FACET_MAX_ANSWERS through. */
/* A NUMBERED RUN IS DRAWN AS A GRID (396): bare numbers, or one word and a number (`Chapter 7`, drawn as 7). Up to FACET_MAX_GRID it is a question, not a list (600). */
const FACET_MAX_GRID = 200;
const runNumber_ = v => (/^(?:([A-Za-z]+) )?(\d+)$/.exec(String(v.show || v.value)) || []);
const numberedRun_ = values => values.length > 1 && values.every(v => runNumber_(v)[2]) && new Set(values.map(v => runNumber_(v)[1] || '')).size === 1;
function facetWhy_(items, facet, over) {
  const all = facetValues(items, facet), vals = all.length;
  /* 680: answers that are all BELOW an answer already chosen are asked even alone — Doesn't matter is the parent's own. */
  if (vals > 1 && underChosen_(all)) return ''; /* owner 5 Nov: one answer is never a question, even below a chosen one */
  if (vals < 2) return (vals ? 'one answer' : 'nobody can answer it') + ' — nothing to decide';
  if (!over && vals > (vals <= FACET_MAX_GRID && numberedRun_(all) ? FACET_MAX_GRID : FACET_MAX_ANSWERS)) return 'too many answers — that is a list, not a question (max ' + FACET_MAX_ANSWERS + ')';
  const cov = facetCoverage(items, facet);
  if (cov < FACET_COVERAGE) return 'thin — needs ' + Math.round(FACET_COVERAGE * 100) + '%';
  const echo = facetEcho_(items, facet);
  if (echo) return echo + ' asked finer, and it was answered Any — each answer sits inside one of that question\'s';
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

/* A QUESTION WHOSE EVERY ANSWER IS A KIND'S NAME (the kinds tab) chooses what a card IS, not how many (660): two answers make it
   worth asking, however lopsided. Decided by the values, never by the field. */
function kindNamed_(values) {
  const m = kindMap_(), names = new Set(Object.keys(m).map(k => spellKey_(m[k].label)).concat(spellKey_(ansKind_())));
  return values.length > 1 && values.every(v => names.has(spellKey_(v.value)));
}

/* A QUESTION THAT RE-ASKS ONE ANSWERED ANY (499, 660): every answer sits inside one answer of it — Shelf after Any subject is Subject
   again; Which or Shelf after Any kind is What kind asked finer. Every facet, by its items. */
function facetEcho_(items, facet) {
  const skipped = (STUFF.filters || []).filter(f => f.any && f.field !== facet.field);
  for (const g of skipped) {
    const G = facetList().find(f => f.field === g.field);
    if (!G) continue;
    const to = {};
    let ok = true;
    for (const x of items) {
      const a = facetOwn_(facet, x);
      if (!a.length) continue;
      const b = facetOwn_(G, x);
      if (b.length !== 1) { ok = false; break; }
      const kb = spellKey_(b[0]);
      if (a.some(v => { const ka = spellKey_(v); if (to[ka] && to[ka] !== kb) return true; to[ka] = kb; return false; })) { ok = false; break; }
    }
    /* A skipped question the list answers one way was never a choice, so nothing re-asks it (a list of projects alone, 660). */
    const gAll = new Set();
    if (ok) for (const x of items) { facetOwn_(G, x).forEach(v => gAll.add(spellKey_(v))); if (gAll.size > 1) break; }
    if (ok && gAll.size > 1 && Object.keys(to).length > 1) return G.label || G.field;
  }
  return '';
}

/* THE NEXT QUESTION WORTH ASKING, or nothing: the first in the tab's order that the one rule lets through. */
function nextFacet(items) {
  const asked = STUFF.filters.map(f => f.field);
  for (const facet of facetList()) {
    if (asked.indexOf(facet.field) !== -1) continue;
    if (!facetWhy_(items, facet)) return facet;
  }
  return null;
}

/* AND WHEN NOTHING QUALIFIES, THE CLOSEST THING TO A QUESTION RATHER THAN A DEAD END: of those held back only for having
   too many answers, the one with fewest. § */
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

/* THE CARD. Small — a reference, the marks, and the first line of the question, because a list of
   ninety parts is scanned rather than read. The whole thing opens on a tap. */
/* THE RECORD IS THE FACE OF IT. W-L-D first, KOs under it, and the date the count was taken —
   because a record with no date is the one number on the card that can quietly go wrong. */
/* ---------- ONE BOUT (batch D): the two fighters' portraits facing each other under the tags, and nothing else ---------- */
function fightCard_(x) {
  const f = x.row || {};
  return `<div class="card fc fight" aria-label="${esc(f.a + ' and ' + f.b)}">${tagRow_(x)}
    <div class="fight-faces">${personPic_(f.aId, f.a)}${personPic_(f.bId, f.b, true)}</div></div>`;
}

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
/* THE `required` FACET'S THREE ANSWERS, IN THE ORDER A TUTOR READS THEM: what a board demands, what is
   worth doing anyway, and what was turned down. The words the card's pill said, unchanged. */
const PRAC_NEED = ['Required practical', 'Extra', 'Not for now'];

function practicalCard_(x) {
  const p = x.row;
  /* THE STRIP SAID "lab · needs a lab" AND A SCREENSHOT IS WHAT CAUGHT IT. § */
  const kit = /with kit/i.test(p.feasible) ? 'needs kit' : '';
  /* ---------- AGE, HAZARD AND COST JOIN THE STRIP, AND ONLY WHERE THEY WERE ANSWERED § */
  const money = p.costPerRun == null ? ''
    : p.costPerRun === 0 ? 'free to run'
    : '£' + p.costPerRun.toFixed(2) + ' a run';
  const strip = [p.minutes ? p.minutes + ' min' : '',
                 p.ageMin ? p.ageMin + '+' : '',
                 p.groupSize > 1 ? p.groupSize + ' students' : '',
                 p.venue, kit, money].filter(Boolean).join(' · ');

  /* ---------- A REFUSED EXPERIMENT SAYS SO BEFORE IT SAYS ANYTHING ELSE § */
  const off = p.excluded;
  return `<div class="card fc prac${off ? ' is-off' : ''}">
    <div class="fc-head">
      <h3>${esc(x.name)}</h3>
    </div>
    ${/* WHAT KIND OF AFTERNOON THIS IS AND WHETHER A BOARD DEMANDS IT -- `Build · Extra` -- were two pills of the head's own § */
          ''}
    ${tagRow_(x)}
    <p class="sub">${esc([p.subject, p.specRef || p.level].filter(Boolean).join(' · '))}</p>
    ${off ? `<p class="prac-no"><b>Why not</b> ${esc(p.excluded)}${p.reconsiderAt
      ? ' <span class="prac-again">Worth another look at ' + p.reconsiderAt + ', in a lab.</span>'
      : ''}</p>` : ''}
    <p class="fc-lede">${esc(p.aim)}</p>
    <p class="fc-meta">${esc(strip)}${p.hazard
      ? ` <span class="prac-haz haz-${esc(p.hazard.replace(/\s+/g, '-'))}">${
          esc(p.hazard)} hazard</span>` : ''}</p>
    ${p.outcome ? `<p class="fc-say"><b>You end up with</b> ${esc(p.outcome)}</p>` : ''}
    ${/* ---------- `wow` STAYS ON THE CARD, WHERE EVERYTHING ELSE MOVED INTO THE GUIDE § */
          ''}
    ${(!off && (p.wow === 'high' || p.wow === 'very high'))
      ? `<p class="prac-open">Worth opening a session with.</p>` : ''}
    ${/* ---------- FOUR CARDS NOW, AND THIS IS THE FIRST OF THEM § */
          ''}
  </div>`;
}

/* THE GUIDE — WHAT A PRACTICAL NEEDS AROUND IT BEFORE ANYBODY RUNS ONE. § */

/* ---------- ONE BOX, ONE SLOT § */
function guideBox_(x, slot, ask, hint) {
  const k = ansKey_(x) + '#' + slot;
  /* ---------- THE BOX IS `ansBox_`'S BOX, DOWN TO THE CLASS NAMES § */
  const val = ansRead_(k);
  const field = `<label class="qp-ans gd-box">
    <span class="gd-ask">${esc(ask)}</span>
    ${hint ? `<span class="gd-hint">${esc(hint)}</span>` : ''}
    ${kpField_(k, val, 'words', false, ask)}
  </label>`;
  /* ---------- AND A SEND UNDER EACH, SIGNED IN § */
  const send = typeof whoIs_ === 'function' && whoIs_() ? tile_({ send: true, act: 'qp-send', cls: 'qp-send' }) : '';
  if (!send) return field;
  const said = subBoxSay_(k, val);
  return `<div class="qp-mark gd-mark${said.cls ? ' ' + said.cls : ''}">${field}${send}
    <span class="qp-verdict" role="status" aria-live="polite">${esc(said.text)}</span>
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>
  </div>`;
}

/* ---------- THE KIT, AS A LIST AGAIN § */
function kitList_(list) {
  return `<ul class="fc-list">${list.map(e => `<li>${esc(e.name)}${
    e.qty ? ': ' + esc(e.qty) : ''}</li>`).join('')}</ul>`;
}

function practicalPart_(x, part) {
  const p = x.row;
  /* ---------- FIVE THINGS, IN THIS ORDER, AND NOTHING ELSE FOR NOW § */
  /* ---------- ONE PAGE EACH, HEADED WITH WHOSE PAGE IT IS § */
  const head = what => `<p class="fc-kick">${esc(x.name)}</p><h3>${what}</h3>`;
  let inner = '';
  if (part === 'fig') {
    /* THE DRAWING, ON A PAGE OF ITS OWN. `.gd` round it so every `.gd figure` rule applies. */
    inner = `${head('Diagram')}<div class="gd"><figure>${p.diagram}</figure></div>`;
  } else if (part === 'kit') {
    inner = `${head('Equipment')}<div class="gd"><section class="prac-kit">
      ${kitList_(p.equipment)}</section></div>
      ${/* The one-off cost is about the KIT, so it is on the kit's page rather than the first. */''}
      ${p.setupCost ? `<p class="prac-cost">About £${p.setupCost.toFixed(2)} of kit to set up,
        and it is bought once.</p>` : ''}`;
  } else if (part === 'steps') {
    inner = `${head('Steps')}<div class="gd"><section class="prac-steps">
      <ol class="fc-list">${p.steps.map(e => `<li>${esc(e)}</li>`).join('')}</ol></section></div>`;
  } else if (part === 'work') {
    /* ---------- THE WORKSHEET, AND THE CANDIDATE LISTS ARE PART OF IT § */
    inner = `${head('Worksheet')}<div class="gd"><section class="fc-sec">
      ${(p.variables.length || p.log.length) ? `<div class="prac-tab">
        ${p.variables.length ? `<div><h4>Things you could change</h4><ul class="fc-list">${
          p.variables.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
        ${p.log.length ? `<div><h4>Things you could measure</h4><ul class="fc-list">${
          p.log.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
      </div>` : ''}
      ${guideBox_(x, 'iv', 'Independent variable — the one thing you will change',
        'One only. Everything else has to stay still, or you will not know which of them did it.')}
      ${guideBox_(x, 'dv', 'Dependent variable — what you will measure',
        'How will you measure it, and in what units?')}
      ${guideBox_(x, 'cv', 'Control variables — what you must keep the same',
        'Usually the longest of the three. Everything you are NOT changing.')}
    </section></div>`;
  }
  return inner ? `<div class="card fc prac prac-part is-${part}">${inner}</div>` : '';
}

/* A PROJECT — THREE OR FOUR SESSIONS THAT END IN SOMETHING A CHILD MADE. § */
/* ---------- A PROJECT OR A COURSEWORK § */
const PROJ_TYPE = { project: 'Project', coursework: 'Coursework' };
const projType_ = p => PROJ_TYPE[(p && p.projectType) || 'project'] || String(p.projectType);

function projectCard_(x) {
  const p = x.row;
  /* AGES AS A RANGE, because "8+" on a podcast for sixteen-year-olds would be true and useless. */
  const ages = p.ageMin && p.ageMax ? 'ages ' + p.ageMin + '–' + p.ageMax
    : p.ageMin ? p.ageMin + '+' : '';
  const strip = [p.sessions ? p.sessions + (p.sessions === 1 ? ' session' : ' sessions') : '',
                 ages].filter(Boolean).join(' · ');
  /* THE BOARD AND THE SPEC ON THE SUBJECT'S LINE -- `AQA 8552` is which qualification the work counts towards, and a project has neither, so its line is unchanged. § */
  const qual = [p.board, p.specRef].filter(Boolean).join('\u00a0');
  return `<div class="card fc prac proj">
    <div class="fc-head">
      <h3>${esc(x.name)}</h3>
    </div>
    ${tagRow_(x)}
    <p class="sub">${esc([p.subject, p.level, qual].filter(Boolean).join(' · '))}</p>
    <p class="fc-lede">${esc(p.summary)}</p>
    ${strip ? `<p class="fc-meta">${esc(strip)}</p>` : ''}
    ${p.makes ? `<p class="fc-say"><b>You end up with</b> ${esc(p.makes)}</p>` : ''}
  </div>`;
}

function projectPart_(x, part) {
  const p = x.row;
  /* THE PRACTICAL'S PAGE HEADING, for its reason: a page you land on from a flick four results
     away has to say whose page it is. */
  const head = what => `<p class="fc-kick">${esc(x.name)}</p><h3>${what}</h3>`;
  let inner = '';
  if (part === 'kit') {
    inner = `${head('Materials')}<div class="gd"><section class="prac-kit">
      ${kitList_(p.materials)}</section></div>`;
  } else if (part === 'steps') {
    /* THE SAFETY LINE IS UNDER THE STEPS, ONE PARAGRAPH, which is `jobAdminTiles_`'s rule. On a
       project it is mostly about who is in the shot and what stays offline, which is a thing to
       read before filming rather than after. */
    /* A COURSEWORK'S STEPS ARE ITS STAGES -- brief, research, specification, ideas, development, models, making, evaluation -- and that is the word a GCSE pupil and § */
    inner = `${head(p.projectType === 'coursework' ? 'Stages' : 'Steps')}<div class="gd"><section class="prac-steps">
      <ol class="fc-list">${p.steps.map(e => `<li>${esc(e)}</li>`).join('')}</ol></section></div>
      ${p.safety ? `<p class="fc-note"><b>Before you start</b> ${esc(p.safety)}</p>` : ''}`;
  } else if (part === 'share') {
    /* A THING HAS TILES: the one action on this page is going to Messages, so it is a tile in a
       `.tile-row`, not a button — `check-doors` pairs `proj-share` with its handler below. */
    /* "SEND IT IN MESSAGES", NOT "TO YOUR TUTOR". § */
    /* ---------- AND ON A COURSEWORK, WHOSE WORK IT IS § */
    const own = p.projectType === 'coursework'
      ? `<p class="fc-note"><b>Your real coursework</b> This brief is practice. The one you hand in
          starts from the context your exam board sets, and it must be your own work: a tutor can
          teach the stages on this brief, but must not comment on, correct or improve work that
          will be handed in. Tell your teacher about any help you have outside school.</p>`
      : '';
    inner = `${head('Share it')}
      <p class="fc-lede">When it is finished, send it in Messages.</p>
      ${p.share ? `<p class="fc-say"><b>What to send</b> ${esc(p.share)}</p>` : ''}
      <div class="tile-row">${tile_({ icon: 'chat', label: 'Messages', note: 'send it',
        act: 'proj-share' })}</div>${own}`;
  }
  return inner ? `<div class="card fc prac prac-part proj is-${part}">${inner}</div>` : '';
}

/* TO MESSAGES, AND NOTHING ELSE. Who to write to is the Messages screen's question — it already
   knows who a student may reach (`MESSAGING` in constants.gs) — so this does not open a composer
   of its own with a guessed recipient. */
on('proj-share', () => go('dm'));

/* THE @family. TEXTBOOK — A CONTENTS CARD, THEN ONE PAGE PER CHAPTER. § */
const tbMath_ = s => tbSub_(typeset_(esc(s).replace(/\//g, '&frasl;')));
/* A SUBSCRIPT IS DRAWN AS ONE, NOT AS THE FONT'S OWN GLYPH. § */
const TB_SUB = '₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₙₛₜ', TB_SUB_AS = '0123456789aeoxnst';
const tbSub_ = html => String(html).replace(/[₀-₉ₐₑₒₓₙₛₜ]+/g,
  run => '<sub>' + [...run].map(c => TB_SUB_AS[TB_SUB.indexOf(c)]).join('') + '</sub>');
/* THE MARK ITSELF. A letter rather than a colour, because the tier is a fact somebody has to read
   in a photocopy too; `title` says it in full for anybody who does not know the convention. */
const tbHigher_ = on => on ? '<span class="tb-h" title="Higher tier only">H</span>' : '';

/* ---------- A CONTENT CARD: ONE CHAPTER, WHOLE, WITH THE QUESTIONS' TAGS ON IT § */
/* ONE WIDGET PER THING (408): the card is its title, its tags and its key words; formulas, worked lines and each drawing are
   pages of their own, each titled (`contentPart_`). */
function contentCard_(x) {
  const c = x.row;
  return `<div class="card fc prac tb ct">
    <div class="fc-head"><h3>${esc(x.name)}</h3></div>
    ${tagRow_(x)}
    ${tbSections_(c, null, { only: 'words' })}
  </div>`;
}

/* A CONTENT CARD'S OTHER PAGES AND THEIR TITLES, ONE PLACE (408): `check-flow`'s one-widget journey reads the same table. */
const CONTENT_PAGE = { formulas: 'Formulas', worked: 'Worked examples' };
function contentPageTitle_(x, part) {
  if (!part) return String((x && x.name) || '');
  if (CONTENT_PAGE[part]) return CONTENT_PAGE[part];
  const m = /^an(\d+)-([a-z0-9]+)$/.exec(String(part));
  const a = m && x && x.row && ((x.row.animations || []).find(y => y.id === m[2]));
  return a ? 'Watch: ' + a.title : '';
}
function contentPart_(x, part) {
  if (!CONTENT_PAGE[part]) return textbookAnimPart_(x, part);
  const c = x.row;
  return `<div class="card fc prac prac-part tb tb-page is-${part}">
    <p class="fc-kick">${esc([c.subject, c.title].filter(Boolean).join(' · '))}${tbHigher_(c.higher)}</p>
    <h3>${esc(CONTENT_PAGE[part])}</h3>
    ${tbSections_(c, null, { only: part === 'worked' ? 'points' : 'formulas', bare: true })}
  </div>`;
}

/* ---------- A CHAPTER'S KEY WORDS, FORMULAS AND WORKED LINES — ALL OF THEM, OR THE ONES ASKED FOR § */
/* `opt.only` draws one section ('words' | 'formulas' | 'points'); `opt.bare` drops its heading, as the page's own title says it (408). */
function tbSections_(c, keep, opt) {
  opt = opt || {};
  const want = s => !opt.only || opt.only === s;
  const h4 = t => (opt.bare ? '' : `<h4>${t}</h4>`);
  const line = (i, body) => `<li>${body}${tbHigher_(i.higher)}</li>`;
  const named = i => !keep || keep.indexOf(i.name) !== -1;
  /* A WORKED LINE IS NAMED BY HOW IT OPENS — "Exact values: sin 30° …" is about Exact values — and the
     next character must not carry the word on: "Mean" is not the opening of "Meanwhile". */
  const opens = p => !keep || keep.some(k => p.text.indexOf(k) === 0 && !/[A-Za-z0-9]/.test(p.text.charAt(k.length)));
  const words = want('words') ? c.words.filter(named) : [], formulas = want('formulas') ? c.formulas.filter(named) : [];
  const points = want('points') ? c.points.filter(opens) : [];
  return `${words.length ? `<section class="fc-sec tb-words">${h4('Key words')}<ul class="fc-list">${
      words.map(w => line(w, `<b>${esc(w.name)}</b> — ${tbSub_(esc(w.text))}`)).join('')}</ul></section>` : ''}
    ${/* THE MARK ON THE FORMULA'S NAME, not after the formula: a stacked fraction is two lines tall
         and an `H` trailing it sat alone on a third, measured at 320px. */''}
    ${formulas.length ? `<section class="fc-sec tb-math">${h4('Formulas')}<ul>${
      formulas.map(f => `<li><span class="tb-fn">${esc(f.name)}${tbHigher_(f.higher)}</span><span class="tb-fm">${
        tbMath_(f.text)}</span></li>`).join('')}</ul></section>` : ''}
    ${points.length ? `<section class="fc-sec tb-points">${h4('Worked')}<ul class="fc-list">${
      points.map(p => line(p, tbMath_(p.text))).join('')}</ul></section>` : ''}`;
}

/* A CHAPTER'S ANIMATION, ON A PAGE OF ITS OWN STRAIGHT AFTER IT. § */
let TB_AN_SEQ = 0;
/* THE PART IS STILL `an17-pyth` — the chapter's number in the file, then the drawing's id — because the number is what tells two cards' drawings apart in a class § */
function textbookAnimPart_(x, part) {
  const m = /^an(\d+)-([a-z0-9]+)$/.exec(String(part || ''));
  const c = x && x.row;
  const a = m && c && c.n === Number(m[1]) && (c.animations || []).find(y => y.id === m[2]);
  if (!a) return '';
  animStyle_(a);
  return `<div class="card fc prac prac-part tb tb-an is-${esc(part)}">
    <p class="fc-kick">${esc([c.subject, c.title].filter(Boolean).join(' · '))}${tbHigher_(c.higher)}</p>
    <h3>${esc(contentPageTitle_(x, part))}</h3>
    <div class="tb-an-stage" data-anim="${esc(a.id)}">${animIds_(a.html, ++TB_AN_SEQ)}</div>
    ${/* ITS CAPTION, NOT A SECOND WIDGET (408): the lines `about` names, under the drawing with no headings, then its tile. */''}
    <section class="tb-about">${tbSections_(c, a.about, { bare: true })}</section>
    <div class="tile-row">${tile_({ icon: 'undo', label: 'Play again', note: 'from the start', act: 'tb-an-again' })}</div>
  </div>`;
}

/* ---------- AN ANIMATION'S STYLESHEET, ONCE, SHARED WITH THE SPLASH § */
function animStyle_(a) {
  if (!a || !a.id) return;
  let st = document.head.querySelector('style[data-anim="' + a.id + '"]');
  if (st && st.getAttribute('data-h') === a.h) return;
  if (!st) {
    st = document.createElement('style');
    st.setAttribute('data-anim', a.id);
    document.head.appendChild(st);
  }
  st.textContent = a.css;
  st.setAttribute('data-h', a.h);
}

/* ---------- AN id IS ONE ELEMENT, AND A DRAWING CAN BE ON THE PAGE TWICE § */
function animIds_(html, n) {
  const ids = [...String(html).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  if (!ids.length) return String(html);
  const any = ids.map(i => i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return String(html).replace(new RegExp('(\\sid="|url\\(#|href="#)(' + any + ')(?=["\\)])', 'g'),
    (all, at, id) => at + id + '-t' + n);
}

/* ---------- ONLY THE ONE ON THE PAGE IN FRONT PLAYS, AND IT PLAYS FROM THE START § */
function tbAnimWatch_() {
  Object.keys(FINDERS).forEach(id => {
    const host = $('s-' + id);
    if (!host) return;
    const stages = host.querySelectorAll('.tb-an-stage');
    if (!stages.length) return;
    const here = AT === id ? host.querySelectorAll(':scope > .page')[domIndex_(id, PAGE[id] || 0)] : null;
    tbAnimSet_(stages, here);
  });
}
function tbAnimSet_(stages, here) {
  stages.forEach(st => {
    const on = !!here && here.contains(st);
    if (on && !st.classList.contains('is-on')) {
      st.innerHTML = st.innerHTML;
      st.classList.add('is-on');
    } else if (!on && st.classList.contains('is-on')) st.classList.remove('is-on');
  });
}
/* PLAY AGAIN: the same restart, on the tile's own stage. */
on('tb-an-again', el => {
  const card = el && el.closest('.card');
  const st = card && card.querySelector('.tb-an-stage');
  if (st) st.innerHTML = st.innerHTML;
});

/* ---------- ONE CHAPTER, AS AN ITEM THE FUNNEL ASKS THE QUESTIONS' QUESTIONS OF § */
function contentItem_(b, c) {
  return {
    kind: 'content', name: c.title, key: 'ct:' + b.id + '-' + c.n,
    sub: [c.subject, c.level].filter(Boolean).join(' · '),
    image: '',
    subject: c.subject, level: c.level, keystage: c.keystage, topics: c.topics, years: c.years || [],
    examBoard: c.board || '', tier: c.higher ? 'Higher' : '',
    text: contentText_(c) + ' ' + topicAtoms_(c.topics).join(' '),
    row: c,
  };
}

/* `contentText_` — `projectText_`'s move for one content card: § */
/* AN ANIMATION IS FOUND BY ITS TITLE — "Galton board" finds the card it is under — and never by its
   markup or its CSS, which are not words anybody types. */
function contentText_(c) {
  const parts = [c.title, c.subject, c.level, c.board, c.spec];
  c.words.concat(c.formulas, c.points).forEach(i => parts.push(i.name, i.text));
  (c.animations || []).forEach(a => parts.push(a.title));
  return plainText_(parts.filter(Boolean).join(' '));
}
