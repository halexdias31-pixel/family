/* @family. — find.js ONE FILE, SPLIT. § */


/* ---------- SHOP & RESOURCES § */
/* FILTERS YOU ADD, not a mode you pick. § */
/* `sort` was here and is gone with the control that set it — see `stuffFiltered`. What is left is
   the two things this screen actually holds: what you typed, and what you have narrowed to. */
/* `groupBy` WAS HERE — the field the list was currently collected by. § */
/* `whose` IS ONLY EVER SET WHILE NOBODY IS SIGNED IN: § */
/* A `let` SINCE THE SECOND FINDER (below): § */
let STUFF = { q: '', filters: [], whose: '' };

/* ---------- ONE FINDER, TWICE § */
const RES_ST = { q: '', filters: [], whose: '' };
/* A FINDER'S RECORD: who it is and — while it is not the bound one — its parked state. § */
const finder_ = o => Object.assign({
  items: { key: null, from: null, items: null },
  found: { key: null, from: null, items: null, total: 0 },
  pages: { from: null, pages: [] },
  chips: { key: null, from: null, out: {} },
  late: 0, typing: null, tried: false,
}, o);
const FINDER_EMPTY = 'Nothing in the shop or the library yet.';
const FINDERS = {
  stuff: finder_({ id: 'stuff', st: STUFF, place: 'find', widgets: true,
                   front: () => [].concat(bookingPages_(), feedPages_(), bundlePages_()),
                   empty: FINDER_EMPTY }),
  res:   finder_({ id: 'res', st: RES_ST, place: 'res', widgets: false,
                   /* A RULE (496), locked: `find-front` — the front pages are Find's alone. */
                   front: () => (typeof ruleOn_ !== 'function' || ruleOn_('find-front')) ? [] : [].concat(bookingPages_(), feedPages_(), bundlePages_()),
                   empty: FINDER_EMPTY }),
};
let FINDER = FINDERS.stuff;
function finderPark_(F) {
  F.st = STUFF; F.items = ITEM_MEMO; F.found = FIND_MEMO; F.pages = STUFF_PAGES; F.chips = CHIP_SHOW;
  F.late = STUFF_LATE; F.typing = stuffTimer; F.tried = FIND_PLACE_TRIED;
}
function finderUnpark_(F) {
  STUFF = F.st; ITEM_MEMO = F.items; FIND_MEMO = F.found; STUFF_PAGES = F.pages; CHIP_SHOW = F.chips;
  STUFF_LATE = F.late; stuffTimer = F.typing; FIND_PLACE_TRIED = F.tried;
}
function inFinder_(F, fn) {
  if (!F || F === FINDER) return fn();
  const was = FINDER;
  finderPark_(was); finderUnpark_(F); FINDER = F;
  try { return fn(); }
  finally { finderPark_(F); finderUnpark_(was); FINDER = was; }
}
/* By screen id; and by the screen an element is drawn in, falling back to the column in front and then Find — a handler pressed from a detached button § */
function finderOf_(id) { return Object.prototype.hasOwnProperty.call(FINDERS, id) ? FINDERS[id] : null; }
function finderAt_(el) {
  const s = el && el.closest ? el.closest('.screen') : null;
  return (s && finderOf_(String(s.id).replace(/^s-/, ''))) || finderOf_(typeof AT === 'string' ? AT : '') || FINDERS.stuff;
}
function finderEach_(fn) { Object.keys(FINDERS).forEach(id => inFinder_(FINDERS[id], () => fn(FINDERS[id]))); }
/* FORGET WHAT EVERY FINDER FOUND, for a change to something both of them list — the friends (me.js),
   whose memo `FIND_MEMO.key = null` from outside a binding cleared on Find alone. */
function finderForgetFound_() { finderEach_(() => { FIND_MEMO.key = null; }); }
/* A finder's state from outside, for the files that load before this one (me.js) and the checks. */
function finderStates_() { return Object.keys(FINDERS).map(id => FINDERS[id].st); }
function paintFinder_(id, keep) { const F = finderOf_(id); if (F) inFinder_(F, () => paintStuff(keep)); }
/* `PAGER.stuff` and `PAGER.res` in shell.js: the question, the pages in front, then the results — each
   counted in its own binding, so asking for Find's count from inside the second finder's draw cannot
   count the wrong list. */
function finderPageCount_(id) {
  return inFinder_(finderOf_(id) || FINDERS.stuff, () => 1 + frontPages_().length + stuffPageCount());
}

/* The fields a filter can be ON, what each is called, and where its values come from. One table,
   so adding a way to filter is a row here and nothing else — the picker, the matching and the
   chip label all read it. */
/* ---------- ONE QUESTION AT A TIME § */
/* WHAT KINDS OF THING CAN BE FOUND. § */
const KINDS = {
  /* A person, a place and a subject already have a card each — written for the Find screen and carrying the class that colours the name. § */
  /* ---------- A TUTOR IS TWO THINGS AND THE GROUP HAD ROOM FOR ONE § */
  /* ---------- `People` IS GONE AND A TUTOR IS JUST A BOOKING THING AGAIN § */
  tutor:   { group: 'Booking', label: 'Tutors',
             /* ---------- YOUR OWN PASS IS YOUR OWN CARD § */
             card: x => (USER && typeof meCard === 'function'
                         && norm((x.row || {}).title) === norm(USER.name))
                        ? meCard()
                        : findCard({ kind: x.kind, row: x.row }) },
  /* ---------- A VENUE IS A BOOKING THING AGAIN, AND THAT IS WHAT TAKES IT OFF FIND § */
  venue:   { group: 'Booking', label: 'Venues',
             card: x => findCard({ kind: x.kind, row: x.row }) },
  subject: { group: 'Booking', label: 'Subjects', card: x => findCard({ kind: x.kind, row: x.row }) },
  /* A LEVEL IS THE FOURTH THING A BOOKING IS ASSEMBLED FROM — who, where, what, and how far on — and it was the one you could not look at. § */
  level:   { group: 'Booking', label: 'Levels',   card: x => findCard({ kind: x.kind, row: x.row }) },

  /* ---------- YOUR OWN SESSIONS ARE ANSWERS UNDER BOOKING § */
  /* ---------- THE WHOLE RECEIPT, NOT A STUB THAT OPENS ONE § */
  /* ---------- ONE ANSWER, NOT THREE § */
  receipt:  { group: 'Booking', label: 'Receipts',  card: x => jobPage_(x.row) },

  /* `coupon` WAS A KIND HERE — the classes with seats going. § */

  /* A FRIEND. Their figure, their level, and a way to stop being one. */
  /* ---------- YOU ARE FINDABLE, AND YOU ARE THE ONLY PERSON WHO IS § */
  /* ---------- BACK UNDER `People`, AND THERE IS NO `You` ANSWER § */
  /* `me` WAS HERE — you, under `People`, found the way every other person is found. § */

  /* ---------- POSTS ARE A THING YOU LOOK FOR § */
  /* `post` WAS HERE — the real post card, reactions and all, answering under `Posts`. § */

  friend: { group: 'Friends', label: 'Friends', card: x => {
    const f = x.row;
    const xp = Number(f.xp) || 0;
    return `<div class="card">
      <div class="thing">
        <span class="thing-pic art">${avatarFor(f.handle, 44, f.avatar)}</span>
        <div class="thing-body">
          <h3>${esc(x.name)}</h3>
          <p class="sub">${esc(f.handle)}${f.name ? ' · level ' + levelFromXp(xp) : ''}</p>
        </div>
        ${/* A BUTTON, NOT A SPAN — the fourth one of these. § */
              ''}
        <button class="text-drop" data-do="friend-drop" title="Remove"
          data-handle="${esc(f.handle)}">✕</button>
      </div>
    </div>`;

  } },

  /* THE KEY ORDER IS THE DEFAULT ORDER OF What kind's ANSWERS (`answerCmp_`), so the work comes first; the kinds tab can move any. */
  question: { group: 'Learning', label: 'Questions', card: (x, c) => thingCard_(x, c) },
  /* `answer` NAMES NO ITEM: it is the label of a question's answer page (`kindLabel`'s `tagOf`), placed here so the kinds tab orders it too. */
  answer: { group: 'Learning', label: 'Answers', card: (x, c) => thingCard_(x, c) },
  /* A widget's card is its name and nothing else — the thing itself is the page it opens. */
  /* A PRACTICAL IS A THING YOU FIND, which is why it is in the funnel at all and tools and games are not. § */
  practical: { group: 'Learning', label: 'Practicals', card: x => practicalCard_(x) },
  /* ---------- A PROJECT IS THE PRACTICAL'S SIBLING, NOT ONE OF ITS SHAPES § */
  project: { group: 'Learning', label: 'Projects', card: x => projectCard_(x) },
  /* ---------- `film` WAS A KIND HERE, AND THE FILMS ARE OFF FIND § */
  /* ---------- `textbook` WAS HERE, AND EACH OF ITS CHAPTERS IS A CONTENT CARD NOW § */
  content: { group: 'Learning', label: 'Library', card: x => contentCard_(x) },
  /* AN INSERT IS WHAT THE EXAM HANDS YOU (455), and Content (463): the owner, "inserts count as content" -- no tag of its own. */
  insert: { group: 'Learning', label: 'Library', card: x => insertCard_(x) },
  /* THE HISTORY DATABASE (459): three kinds, Library on the History shelf as boxers are on Boxing's; `histKind` says which. */
  manuscript: { group: 'Learning', label: 'Library', card: x => histCard_(x) },
  figure: { group: 'Learning', label: 'Library', card: x => histCard_(x) },
  writing: { group: 'Learning', label: 'Library', card: x => histCard_(x) },
  /* ITS FOURTH (461): an event, and a timeline — every event of one `era`, in date order, a tile each. */
  event: { group: 'Learning', label: 'Library', card: x => histCard_(x) },
  timeline: { group: 'Learning', label: 'Library', card: x => histTimelineCard_(x) },
  /* ---------- BOXING IS A SUBJECT, NOT A DEPARTMENT § */
  /* CONTENT, NOT `Resources` (445): the owner — "boxes and fights can go under content"; the Bible goes with them. */
  boxer: { group: 'Learning', label: 'Library', card: x => boxerCard_(x) },
  /* THE BOUTS. `boxers` is who; this is what happened. 157 of them sat in the sheet unread,
     because nothing in the app had ever been told the tab existed. */
  fight: { group: 'Learning', label: 'Library', card: x => fightCard_(x) },
  /* ---------- THE BIBLE, AND THE ONE KIND THE PHONE ITSELF KEEPS FROM ALL BUT AN ADMIN § */
  bible: { group: 'Learning', label: 'Library', card: x => bibleCard_(x) },
  /* THE TALMUD (473): one item a daf, its page drawn by js/talmud.js. */
  talmud: { group: 'Learning', label: 'Library', card: x => talmudCard_(x) },
  /* THE QURAN (490): one card a verse. */
  quran: { group: 'Learning', label: 'Library', card: x => quranCard_(x) },
  /* A WRITING'S OWN WORDS (499): one card a chapter a language, js/works.js. */
  worktext: { group: 'Learning', label: 'Library', card: x => worksCard_(x) },
  /* THE HADITH (504): one card a hadith, js/hadith.js. */
  hadith: { group: 'Learning', label: 'Library', card: x => hadithCard_(x) },
  /* MORE WRITINGS (513): a verse, section or chapter a card, one text each — js/texts.js. */
  writ: { group: 'Learning', label: 'Library', card: x => textsCard_(x) },
  /* PUBLIC-DOMAIN TEXTS (514): history's documents and English literature, a card a place, js/pdtexts.js. */
  pdtext: { group: 'Learning', label: 'Library', card: x => pdtextsCard_(x) },
  /* ORTHODOX TEXTS AND CHURCH HISTORY (516): one card a canon, section or chapter, js/orthodox.js. */
  orthotext: { group: 'Learning', label: 'Library', card: x => orthoCard_(x) },
  /* THE HYMNS SHELF (517): one card a hymn, js/hymns.js. */
  hymn: { group: 'Learning', label: 'Library', card: x => hymnsCard_(x) },

  /* ---------- TWO GROUPS, NOT ONE GROUP AND THEN THE SAME QUESTION AGAIN § */
  /* ---------- THESE TWO STAY IN THE TABLE AND NO LONGER ANSWER THE FIRST QUESTION § */
  tool: { group: 'Tools', label: 'Tools', card: x => widgetCard_(x) },
  game: { group: 'Games', label: 'Games', card: x => widgetCard_(x) },

  /* ---------- `link` WAS A KIND HERE, AND THE LINKS ARE OFF FIND § */

  /* A resource and a shop row share a card: to somebody looking for one they are the same kind of
     thing — a picture, a name, what it belongs to, and what it costs if it costs anything. */
  /* `topic` WAS HERE — the documents, labelled `Resources`. The funnel lists the questions inside
     them now and not the boxes; see the note above `questionItems`. */
  /* ---------- A QUESTION IS NOT A DIFFERENT KIND OF THING FROM ITS PAPER § */
  /* ---------- `question` WAS A KIND AND IS NOT ANY MORE § */
  /* ---------- THE SHOP HAS A COLUMN OF ITS OWN, AND THIS IS NOT A DOOR ANY MORE § */
  shop:  { group: 'Shop',     label: 'Things',    card: (x, c) => thingCard_(x, c) },
};

/* WHAT A QUESTION'S ANSWER PAGE IS CALLED, as the kinds tab names it. */
const ansKind_ = () => (kindMap_().answer || {}).label || 'Answers';

function widgetCard_(x) {
  /* NO LONGER A TAP TARGET. § */
  return `<div class="card">
    <h3>${esc(x.name)}</h3>
  </div>`;
}

/* The card a resource and a shop row share. Named rather than written twice, because the two
   entries above genuinely want the same thing and a copy each is a copy to keep in step. */
function thingCard_(x, credits) {
  /* One card shape for both, because they are the same kind of thing to a person looking for one: § */
  {
    const free = x.cost === 0;
    const afford = x.kind === 'shop' && !free && !x.pence && credits >= x.cost;
    /* WHAT IT TAKES TO HAVE IT. § */
    const myLevel = Math.floor((Number(USER && USER.xp) || 0) / 10);
    /* ---------- AND A FOURTH ANSWER: NOBODY HAS PRICED IT § */
    const price = x.kind !== 'shop' ? ''
      : x.level > 0
        ? `<span class="price ${myLevel >= x.level ? 'can' : ''}">${
            myLevel >= x.level ? 'Level ' + x.level + ' — yours' : 'Level ' + x.level}</span>`
      : x.cost === undefined
        ? ''   /* "Not priced yet" is its Price tag now (499) */
      : `<span class="price ${free ? 'free' : afford ? 'can' : ''}">${
          free ? 'free' : x.pence ? money(x.cost / 100) : x.cost + ' credits'}</span>`;
    /* A wearable is a THIRD kind of thing on this list, beside a resource and a bought object —
       so it is marked as one and coloured as one, the same way a subject and a venue are. */
    /* ---------- A QUESTION IS A QUESTION. THERE ARE NO DOCUMENTS ON THIS SCREEN. § */
    if (x.kind === 'question') return questionCard_(x);

    /* THE CARD IS NO LONGER A BUTTON. § */
    /* NOTHING ON THIS LIST IS A TAP TARGET ANY MORE. § */
    return `<div class="card${x.wearable ? ' is-wear'
             : x.kind === 'topic' ? ' is-subject' : ''}${x.off ? ' is-off' : ''}">
      <div class="thing">
        ${/* A WEARABLE DRAWS ITSELF. § */
              ''}
        ${x.wearable && x.artId && itemArt(x.slot, x.artId)
          ? `<span class="thing-pic art">${itemArt(x.slot, x.artId, 44)}</span>`
          : x.image ? `<img class="thing-pic" src="${esc(pic(x.image))}" alt="" loading="lazy" decoding="async">` : ''}
        <div class="thing-body">
          ${/* ---------- A RESULT IS READ LIKE A SEARCH RESULT § */
                ''}
          ${/* THE LEVEL, NOT THE KEY STAGE — `KS3, KS4` on a crumb is the grey area the owner asked to stop seeing; `levelOf_` says GCSE. § */
                ''}
          ${x.kind === 'shop' ? tagRow_(x) : `<p class="crumb">${[x.company].concat(levelSaid_(x).length ? levelSaid_(x) : [x.keystage]).concat([
              x.bandType === 'year' ? (x.bandValue && 'Year ' + x.bandValue)
            : x.bandType === 'grade' ? (x.bandValue && 'Grade ' + x.bandValue)
            : x.bandType === 'stage' ? '' : x.bandValue, x.tier, yearOf(x)])
            .filter(Boolean).map(v => esc(String(v))).join(' <span class="faint">·</span> ')}</p>`}
          <h3>${esc(x.name)}${x.off ? ' <span class="faint">— deleted</span>' : ''}</h3>
          ${/* Its own second line: § */
                ''}
          ${/* THE YEAR, ON THE CARD. § */
                ''}
          ${/* WHO IT IS FROM, FIRST. § */
                ''}
          ${x.kind === 'shop' ? '' : `<p class="sub">${x.company
            ? `${mark(x.company)}${x.sub || x.subject ? ' <span class="faint">· </span>' : ''}` : ''}${
            mark(x.sub || x.subject || '')}${yearOf(x)
            ? ` <span class="mono faint">· ${esc(yearOf(x))}</span>` : ''}${x.wearable && x.slot
            /* WHERE IT GOES. Until there are drawings, the slot is the only thing on the card that
               says what the object actually is — "Cape · shoulders" is a garment and "Cape" on its
               own is a word. */
            ? ` <span class="faint">· ${esc(x.slot)}</span>` : ''}</p>`}
          ${price}
        </div>
      </div>
      </div>`;
  }
}


/* A THING'S ENTRY. Wearables are the one kind decided by a FIELD rather than by `kind` — the shop holds both, and which it is depends on whether the row names a § */
/* THE FUNNEL'S ANSWERS, AS THE SHEET WANTS THEM. § */
let KIND_LIVE = null, KIND_FROM = null;

function kindMap_() {
  const src = DATA.kinds || null;
  if (KIND_LIVE && KIND_FROM === src) return KIND_LIVE;
  KIND_FROM = src;
  const said = {};
  (src || []).forEach(k => { if (k && k.kind) said[k.kind] = k; });

  /* ---------- A KIND THE SHEET INVENTED § */
  const out = {};
  const order = Object.keys(KINDS)
    .concat(Object.keys(said).filter(k => !KINDS[k]));
  order.forEach((k, i) => {
    const base = KINDS[k] || {}, s = said[k];
    if (s && s.active === false) return;
    /* A SHEET-ONLY KIND WITH NO GROUP WOULD LAND IN `undefined`, which `groupOrder_` would then offer as an answer to the first question. § */
    if (!KINDS[k] && !asList_(s && s.group).length) base.group = 'Learning';
    if (!KINDS[k]) base.fromSheet = true;
    out[k] = Object.assign({}, base, {
      /* THE SHEET WINS WHEN IT HAS SAID ANYTHING. § */
      group: asList_(s && s.group).length ? s.group : base.group,
      /* A KIND THE SHEET INVENTED AND DID NOT NAME falls back to the kind itself rather than to
         `undefined`, which would print as an empty answer in the second question. */
      /* `Content` IS `Library` NOW (490): the owner, "it's the library for all the resources" -- a sheet still saying the old word is read as the new. */
      label: ((s && s.label) === 'Content' ? 'Library' : (s && s.label)) || base.label || k,
      at:    facetNum_(s && s.order, (i + 1) * 10),
    });
  });
  return (KIND_LIVE = out);
}

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

/* ONE VALUE OR SEVERAL, ALWAYS READ AS SEVERAL. § */
/* ---------- AND THE COMMON CASE IS ONE STRING, WHICH USED TO COST FOUR ALLOCATIONS § */
const asList_ = v => {
  if (typeof v === 'string') { const t = v.trim(); return t ? [t] : []; }
  if (v == null || v === false) return [];
  if (!Array.isArray(v)) { const t = String(v).trim(); return t ? [t] : []; }
  const out = [];
  for (let i = 0; i < v.length; i++) {
    const x = v[i];
    const t = String(x == null ? '' : x).trim();
    if (t) out.push(t);
  }
  return out;
};

function kindOf_(x) {
  if (x && x.wearable) return { group: 'Shop', label: 'Wearables' };
  return (x && kindMap_()[x.kind]) || { group: 'Shop', label: 'Things' };
}

/* ---------- A PRICE THAT NOBODY HAS TYPED IS NOT A PRICE OF ZERO § */
function priced_(v) {
  if (v === null || v === undefined || String(v).trim() === '') return undefined;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return isFinite(n) ? n : undefined;
}

/* The raw reader of a facet, off `FACETS` rather than off `facetList()`, built on first use. */
let FACET_RAW = null;
const facetRaw_ = field => {
  if (!FACET_RAW) { FACET_RAW = new Map(); FACETS.forEach(f => { if (!FACET_RAW.has(f.field)) FACET_RAW.set(f.field, f); }); }
  return FACET_RAW.get(field);
};

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
   said by `facetSay_`, coloured by `TAG_OF`. */
/* Two optional readers, both about the value: `tagOf` is what one PAGE carries (the answer page says Answers), `showOf`
   the name of a value that is an id (a paper). */
/* The order here is only the fallback for a facet the facets tab does not place; the tab's sort_order is the order. */
const FACETS = [
  { field: 'forLabel',  label: 'What for',    of: x => x.groups || kindOf_(x).group },
  /* `Answers` BESIDE THE ITEM'S OWN KIND: a question with an answer is found by either, and its answer page carries the tag. */
  { field: 'kindLabel', label: 'What kind',
    of: x => {
      const k = x.kindLabel || kindOf_(x).label;
      return x && x.kind === 'question' && questionHasAns_(x) ? [k, ansKind_()] : k;
    },
    tagOf: (x, page) => page === 'ans' ? ansKind_() : (x.kindLabel || kindOf_(x).label) },
  /* SUBJECT STRAIGHT AFTER WHAT KIND (494), as the facets tab orders it: "the library should go subject first". */
  { field: 'projectType',   label: 'Project or coursework', of: x => x.projectType || '' },
  { field: 'subject',   label: 'Subject',     of: x => x.subject },
  { field: 'shelf',     label: 'Shelf',       of: x => x.shelf || '' },
  /* ONE FACET SET FOR EVERY WRITTEN WORK (520): the Bible, the Quran, the Talmud, the Hadith, the hymns and every other text
     answer the same questions, read off `writingOf_` (writings.js) — no loader has a private one. */
  { field: 'wWork',      label: 'Work',       of: x => writingAt_(x, 'work') },
  { field: 'wText',      label: 'Text',       of: x => writingAt_(x, 'text') },
  { field: 'wTradition', label: 'Tradition',  of: x => writingAt_(x, 'tradition') },
  { field: 'wCollection', label: 'Collection', of: x => writingAt_(x, 'collection') },
  { field: 'wSection',   label: 'Section',    of: x => writingAt_(x, 'section') },
  { field: 'wBook',      label: 'Book',       of: x => writingAt_(x, 'book') },
  { field: 'wChapter',   label: 'Chapter',    of: x => writingAt_(x, 'chapter') },
  { field: 'wUnit',      label: 'Unit',       of: x => writingAt_(x, 'unit') },
  { field: 'wAuthor',    label: 'Author',     of: x => writingAt_(x, 'author') },
  { field: 'wForm',      label: 'Kind of writing', of: x => writingAt_(x, 'form') },
  { field: 'boxKind',   label: 'Boxers or fights', of: x => x.boxKind || '' },
  /* A BOUT'S FACTS ARE TAGS (445), like a question's: who, when, how. A boxer answers Fighter too, so his name finds him and his bouts. */
  { field: 'fighter',   label: 'Fighter',     of: x => x.kind === 'fight' && x.row ? [x.row.a, x.row.b].filter(Boolean) : x.kind === 'boxer' ? x.name : '' },
  { field: 'boutMonth', label: 'Month',       of: x => boutDate_(x).month },
  { field: 'boutYear',  label: 'Year',        of: x => boutDate_(x).year },
  { field: 'decade',    label: 'Decade',      of: x => decadesOf_(x) },
  { field: 'division',  label: 'Division',    of: x => x.division || '' },
  { field: 'boutRound', label: 'Round',       of: x => x.kind === 'fight' && x.row && Number(x.row.endRound) > 0 ? 'Round ' + Number(x.row.endRound) : '' },
  { field: 'boutMethod', label: 'Result',     of: x => (x.kind === 'fight' && x.row && String(x.row.method || '').trim()) || '' },
  /* THE TITLE THE FIGHT CARD LOST (490) said who won and which night: tags now, like everything else. */
  { field: 'boutWinner', label: 'Winner',     of: x => boutWinner_(x) },
  { field: 'boutEvent', label: 'Event',       of: x => (x.kind === 'fight' && x.row && String(x.row.event || '').trim()) || '' },
  /* THE HISTORY DATABASE'S (459): which table, the era its years touch, and its columns as ordinary tags (`histCol_`). */
  { field: 'histKind',  label: 'Manuscripts, figures, works or events', of: x => x.histKind || '' },
  { field: 'histEra',   label: 'Era',         of: x => histErasOf_(x) },
  { field: 'histLanguage', label: 'Language', of: x => histCol_(x, 'language') },
  { field: 'histMaterial', label: 'Material', of: x => histCol_(x, 'material') },
  { field: 'histFormat', label: 'Format',     of: x => histCol_(x, 'format') },
  { field: 'histGenre', label: 'Genre',       of: x => histCol_(x, 'genre') },
  { field: 'histRole',  label: 'Role',        of: x => histCol_(x, 'roles') },
  { field: 'histTheme', label: 'Theme',       of: x => histCol_(x, 'themes') },
  { field: 'histRepository', label: 'Held at', of: x => histCol_(x, 'repository') },
  /* ONE SIDE A CARD (507): the owner, "make front a tag and back a tag, so each widget displays one side". */
  { field: 'histSide',  label: 'Side',        of: x => x.msSide || '' },
  { field: 'histTheatre', label: 'Theatre',   of: x => histCol_(x, 'theatre') },
  /* A WRITING'S OWN WORDS (499): which work, which chapter, which language. */
  /* A SHOP ITEM'S TAGS (499): what it is, how you get it, its price band, the brand, who it is for. */
  { field: 'shopKind',  label: 'Category',    of: x => x.shopKind || '' },
  { field: 'shopHow',   label: 'How you get it', of: x => x.shopHow || '' },
  { field: 'shopPrice', label: 'Price',       of: x => x.shopPrice || '' },
  { field: 'shopBrand', label: 'Brand',       of: x => x.shopBrand || '' },
  { field: 'shopFor',   label: 'For',         of: x => x.shopFor || '' },
  { field: 'practicalType', label: 'Experiment or build', of: x => x.practicalType || '' },
  { field: 'required',  label: 'Required',
    of: x => x.kind !== 'practical' || !x.row ? '' : PRAC_NEED[x.row.excluded ? 2 : x.row.required ? 0 : 1] },
  { field: 'documentType', label: 'Type',     of: x => x.documentType },
  /* A 5-A-DAY IS FOUND BY ITS LEVEL, ITS MONTH AND ITS DAY, each read off its paper id. */
  { field: 'fiveLevel', label: 'Level',       of: x => fiveADay_(x) ? x.tier || '' : '' },
  { field: 'fiveMonth', label: 'Month',       of: x => { const d = fiveADay_(x); return d ? d.month : ''; } },
  { field: 'fiveDay',   label: 'Day',         of: x => { const d = fiveADay_(x); return d ? d.day + ' ' + d.month : ''; } },
  { field: 'level',     label: 'Level',       of: x => levelOf_(x) },
  /* A RESOURCE CAN BELONG TO MORE THAN ONE KEY STAGE; a SATs row's is read off its year when the cell is blank. */
  { field: 'keystage',  label: 'Key stage',   of: x => { const s = satsStagesOf_(x); return s.length ? s : keyStagesOf_(x); } },
  { field: 'yearGroup', label: 'School year', of: x => x.bandValue && x.bandType === 'year' ? 'Year ' + x.bandValue : '' },
  { field: 'bandValue', label: 'Grade',       of: x => x.bandValue && x.bandType === 'grade' ? 'Grade ' + x.bandValue : '' },
  { field: 'topic',     label: 'Topic',       of: x => topicShown_(x) ? (x.topic || topicOf_(x)) : [] },
  { field: 'examBoard', label: 'Exam board',  of: x => x.examBoard },
  { field: 'tier',      label: 'Tier',        of: x => x.tier },
  /* THE YEAR, THEN THE MONTH, THEN THE PAPER — like the folders they came from. */
  { field: 'examYear',  label: 'Year',        of: x => sittingOf_(x).year },
  { field: 'examMonth', label: 'Month',       of: x => sittingMonth_(x) },
  /* THE ID DECIDES WHO ANSWERS and the document row's name is what is said, shortened against the names beside it. */
  { field: 'paperId',   label: 'Paper',       of: x => (x.row && x.row.paper_id) || '',
    showOf: id => paperLabel_(id) },
  /* WHICH QUESTION, WHICH PART, WHICH PAGE, HOW MANY MARKS: the words are the value, so the card and the button agree. */
  { field: 'qNumber',   label: 'Question',
    of: x => x.kind === 'question' && x.qNumber != null && String(x.qNumber) !== '' ? 'Q' + x.qNumber : '' },
  { field: 'qPart',     label: 'Part',        of: x => qSplitOf_(x).part },
  { field: 'qSub',      label: 'Sub-part',    of: x => qSplitOf_(x).sub },
  { field: 'qPage',     label: 'Page',
    of: x => { const n = qPagesOf_(x); return n > 1 ? Array.from({ length: n }, (_, i) => 'Page ' + (i + 1)) : ''; },
    /* THE ONE PAGE THIS IS, of the pages above. */
    tagOf: (x, page) => { const i = qPageAt_(x, page); return i && qPagesOf_(x) > 1 ? 'Page ' + i : ''; } },
  { field: 'qPages',    label: 'Pages',
    of: x => { const n = qPagesOf_(x); return n > 1 ? n + ' pages' : ''; },
    tagOf: (x, page) => { const n = qPagesOf_(x); return n > 1 && qPageAt_(x, page) ? n + ' pages' : ''; } },
  { field: 'marks',     label: 'Marks',
    of: x => Number(x && x.marks) > 0 ? Number(x.marks) + ' mark' + (Number(x.marks) === 1 ? '' : 's') : '' },
  { field: 'company',   label: 'Publisher',   of: x => x.company },
  { field: 'needs',     label: 'What you need', of: x => asList_(x.needs) },
  /* TWO TAGS ON EVERY QUESTION (388): the answer checked against the official scheme, and the type machine-marked. */
  { field: 'accuracy',  label: 'Accuracy',    of: x => verifyTags_(x).accuracy },
  { field: 'function',  label: 'Function',    of: x => verifyTags_(x).fn },
  /* HOW YOU DID (463): the viewer's own latest press on a question; signed out it is blank everywhere, so it is never asked. */
  { field: 'myResult',  label: 'Your result', of: x => myResultOf_(x) },
];

/* THE ONLY KEYS A FACET MAY CARRY (396) — `check-funnel` fails on any other, so a behaviour flag cannot creep back in. */
const FACET_KEYS = ['field', 'label', 'of', 'tagOf', 'showOf'];

/* THE FUNNEL'S QUESTIONS, AS THE SHEET WANTS THEM. § */
/* ---------- KEYED ON THE PAYLOAD, THE WAY `allTopics` DOES IT § */
let FACET_LIVE = null, FACET_FROM = null;

/* ---------- A QUESTION THE SHEET INVENTED § */
const facetFromSheet_ = f => ({
  field: f.field,
  label: f.label || String(f.field).replace(/_/g, ' '),
  fromSheet: true,
  of: x => {
    const v = (x && x[f.field] !== undefined && x[f.field] !== null && x[f.field] !== '')
      ? x[f.field]
      : (x && x.row ? x.row[f.field] : undefined);
    if (Array.isArray(v)) return v;
    return String(v === undefined || v === null ? '' : v)
      .split(',').map(t => t.trim()).filter(Boolean);
  },
});

/* FIELDS WHOSE CODE FACET WAS DELETED ON PURPOSE, AND WHICH THE SHEET MAY NOT RESURRECT. § */
const RETIRED_FACETS = {
  libBook: 'a writing\'s private facet; one facet set asks every writing now (520).',
  bibleTranslation: 'a writing\'s private facet; one facet set asks every writing now (520).',
  bibleTestament: 'a writing\'s private facet; one facet set asks every writing now (520).',
  bibleGroup: 'a writing\'s private facet; one facet set asks every writing now (520).',
  bibleBook: 'a writing\'s private facet; one facet set asks every writing now (520).',
  bibleChapter: 'a writing\'s private facet; one facet set asks every writing now (520).',
  bibleVerse: 'a writing\'s private facet; one facet set asks every writing now (520).',
  wtWork: 'a writing\'s private facet; one facet set asks every writing now (520).',
  wtChapter: 'a writing\'s private facet; one facet set asks every writing now (520).',
  wtSection: 'a writing\'s private facet; one facet set asks every writing now (520).',
  wtLanguage: 'a writing\'s private facet; one facet set asks every writing now (520).',
  wtVerse: 'a writing\'s private facet; one facet set asks every writing now (520).',
  txWriting: 'a writing\'s private facet; one facet set asks every writing now (520).',
  txBook: 'a writing\'s private facet; one facet set asks every writing now (520).',
  txChapter: 'a writing\'s private facet; one facet set asks every writing now (520).',
  txSection: 'a writing\'s private facet; one facet set asks every writing now (520).',
  txText: 'a writing\'s private facet; one facet set asks every writing now (520).',
  txAnthology: 'a writing\'s private facet; one facet set asks every writing now (520).',
  orTradition: 'a writing\'s private facet; one facet set asks every writing now (520).',
  orGenre: 'a writing\'s private facet; one facet set asks every writing now (520).',
  orCollection: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hymnTradition: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hymnTheme: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hymnAuthor: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hymnLanguage: 'a writing\'s private facet; one facet set asks every writing now (520).',
  talSeder: 'a writing\'s private facet; one facet set asks every writing now (520).',
  talTractate: 'a writing\'s private facet; one facet set asks every writing now (520).',
  talChapter: 'a writing\'s private facet; one facet set asks every writing now (520).',
  quranTranslation: 'a writing\'s private facet; one facet set asks every writing now (520).',
  quranSurah: 'a writing\'s private facet; one facet set asks every writing now (520).',
  quranAyah: 'a writing\'s private facet; one facet set asks every writing now (520).',
  quranJuz: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hadithTranslation: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hadithCollection: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hadithBook: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hadithNumber: 'a writing\'s private facet; one facet set asks every writing now (520).',
  orEra: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hymnSeason: 'a writing\'s private facet; one facet set asks every writing now (520).',
  hymnTune: 'a writing\'s private facet; one facet set asks every writing now (520).',
  talDaf: 'a writing\'s private facet; one facet set asks every writing now (520).',
  talSide: 'a writing\'s private facet; one facet set asks every writing now (520).',
  quranPlace: 'a writing\'s private facet; one facet set asks every writing now (520).',
  quranSajda: 'a writing\'s private facet; one facet set asks every writing now (520).',
  iconGroup: 'what an icon mark was for; the icons left Find at the owner\'s word (445).',
  borough: 'venues only, and venues left Find; nothing else answers it (396 took the dead facet out).',
  slot: 'where a wearable goes; nothing in Find carries one since the shop left it (396 took the dead facet out).',
  afford: 'the price question; nothing in Find is priced (396 took the dead facet out).',
  year: 'the year a paper was sat is asked as `examYear`, so asking both narrowed twice (396 took the dead facet out).',
  health: 'the paper health score was deleted (388); a question carries Accuracy and Function tags instead.',
  answerable: 'the paper health score was deleted (388); a question carries Accuracy and Function tags instead.',
  paper: 'the "Printed?" facet was deleted for reading a literal — and the `paper` COLUMN it would '
       + 'now read means which paper of the set (1, 2, 3), so the sheet\'s old label sits over '
       + 'completely different data. Use `Paper`, which asks the same thing by name.',
  examWave: 'the sitting is asked as two questions now, `examYear` (2018) and then `examMonth` '
          + '(June). A sheet row naming `examWave` would read the raw column and offer `Summer 2018` '
          + 'beside them, which is the one answer wearing two questions this split took apart.',
  examSeries: 'the owner asked for months rather than seasons -- "I don\'t want it to ask summer or '
            + 'autumn I\'d rather it just do the months" -- so `examMonth` asks it. A sheet row naming '
            + '`examSeries` would offer `Summer` beside `May` and `June`, two vocabularies for one fact.',
  category: 'the links\' own question, and the links are gone -- "Get rid of links that\'s almost '
          + 'redundant now." A sheet row naming `category` would read that column off whatever else '
          + 'carries one and offer it as a question nobody wrote a label for.',
  /* ---------- THE ROW'S SPELLINGS OF THE QUESTION NUMBER AND THE PART § */
  question: 'the row\'s spelling of `qNumber`; `qNumber` asks it, as the Question door on a paper.',
  part: 'the row\'s raw `part` cell would offer `3i` beside `qPart` and `qSub`, which split it.',
  topicArea: 'the owner: "why is there a topic area menu? ... im fin with names of pdfs which are the '
           + 'names of the topics themselves". A sheet\'s topic is its PDF\'s name, which `Paper` asks; '
           + 'the strands above it were a grouping over a list that did not need one.',
  book: 'which @family. textbook -- and there are no textbooks on screen since 12 Oct: every chapter is '
      + 'a content card of its own (docs/history/347, part 2), so nothing answers it. A sheet row naming '
      + '`book` would read a field no item has; a kept `Book` chip would hold an empty list.',
};

function facetList() {
  const src = DATA.facets || null;
  if (FACET_LIVE && FACET_FROM === src) return FACET_LIVE;
  FACET_FROM = src;
  const said = {};
  (src || []).forEach(f => { if (f && f.field) said[f.field] = f; });
  const known = {};
  FACETS.forEach(f => { known[f.field] = true; });

  FACET_LIVE = FACETS
    .map((f, i) => {
      const s = said[f.field];
      if (!s) return Object.assign({}, f, { at: (i + 1) * 10 });
      if (s.active === false) return null;
      return Object.assign({}, f, { label: s.label || f.label, at: facetNum_(s.order, (i + 1) * 10) });
    })
    /* ---------- AND THE ONES THE CODE HAS NEVER HEARD OF § */
    .concat((src || [])
      .filter(f => f && f.field && !known[f.field] && f.active !== false && !RETIRED_FACETS[f.field])
      .map((f, i) => Object.assign(facetFromSheet_(f), { at: facetNum_(f.order, 1000 + i) })))
    .filter(Boolean)
    /* THE TAB'S sort_order IS THE ORDER, ALL OF IT (396): no facet is held in front of the others. */
    .sort((a, b) => a.at - b.at);
  return FACET_LIVE;
}


/* ---------- WHAT A SPREADSHEET CELL IS ALLOWED TO DO TO THE FUNNEL § */
const facetNum_ = (v, fallback) => {
  const n = Number(v);
  return v === null || v === undefined || v === '' || !isFinite(n) ? fallback : n;
};


/* A MAP OVER THE LIVE LIST, rebuilt only when `facetList` hands back a different array. § */
let FACET_BY_FROM = null, FACET_BY = null;
const facetBy = f => {
  const live = facetList();
  if (FACET_BY_FROM !== live) {
    FACET_BY = new Map();
    FACETS.forEach(x => { if (!FACET_BY.has(x.field)) FACET_BY.set(x.field, x); });
    [].concat(live).reverse().forEach(x => FACET_BY.set(x.field, x));
    FACET_BY_FROM = live;
  }
  return FACET_BY.get(f);
};

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
  return String((d && d.name) || id || '').trim();
};

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
/* THE SAME WORDS THE BUTTON WOULD SAY FOR THIS VALUE OVER `items` — the shortest unique form among its neighbours. Only a
   name that has a shorter form is looked up, so a card's ordinary tags cost nothing. */
function facetShort_(facet, v, items) {
  const say = facetSay_(facet, v);
  if (nameForms_(say).length < 2) return say;
  try {
    const hit = facetTally_(items || stuffFiltered(), facet).values.find(w => spellKey_(w.value) === spellKey_(v));
    if (hit) return hit.show || hit.text || say;
  } catch (e) { /* the full name, below */ }
  return say;
}

/* A CARD'S TAG IS SAID AS ITS BUTTON WOULD BE ONCE EVERY QUESTION BEFORE IT WAS ANSWERED THE CARD'S WAY (396) — the
   paper among the papers sharing its level, board, tier and sitting is `Paper 1`, wherever the card is drawn. */
let CARD_LISTS = { from: null, at: new Map() };
function cardList_(facet, x) {
  if (CARD_LISTS.from !== DATA) CARD_LISTS = { from: DATA, at: new Map() };
  const chips = [];
  for (const g of facetList()) {
    if (g.field === facet.field) break;
    let vals = [];
    try { vals = asList_(g.of(x)); } catch (e) { vals = []; }
    vals.forEach(v => chips.push({ field: g.field, value: v }));
  }
  /* EACH PREFIX OF THE ANSWERS IS NARROWED ONCE, from the one before it — the cards of one paper share all of them. */
  let list = stuffItems(), key = '';
  const byField = [];
  chips.forEach(c => { const last = byField[byField.length - 1]; if (last && last[0].field === c.field) last.push(c); else byField.push([c]); });
  for (const same of byField) {
    key += '\u0001' + same.map(c => c.field + '=' + spellKey_(c.value)).join('|');
    let hit = CARD_LISTS.at.get(key);
    if (!hit) { hit = stuffNarrow_(list, same, [], 0); CARD_LISTS.at.set(key, hit); }
    list = hit;
  }
  return list;
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
  Object.keys(m).sort((a, b) => m[a].at - m[b].at).forEach(k => { if (!labels.has(m[k].label)) labels.set(m[k].label, labels.size); });
  const groups = new Map(groupOrder_().map((g, i) => [g, i]));
  return { labels, groups };
}
/* LISTS WHOSE OWN ORDER IS THE ORDER (473): a file pushes one, and answers all in it sort by it — the Talmud's orders and tractates. */
const ANSWER_ORDERS = [];
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
  items.forEach(x => {
    /* COUNTED ONCE PER VALUE, NOT ONCE PER ITEM. § */
    const vals = facetOwn_(facet, x);
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
  const wt = writingWeights_(items);
  let top = 0, whole = 0;
  const wBy = {};
  items.forEach((x, i) => {
    whole += wt[i];
    const vals = facetOwn_(facet, x);
    new Set(vals.map(spellKey_).filter(Boolean)).forEach(k => { wBy[k] = (wBy[k] || 0) + wt[i]; });
  });
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
function facetValues(items, facet) {
  return facetTally_(items, facet).values;
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
function facetWhy_(items, facet, over) {
  const vals = facetValues(items, facet).length;
  if (vals < 2) return (vals ? 'one answer' : 'nobody can answer it') + ' — nothing to decide';
  if (!over && vals > FACET_MAX_ANSWERS) return 'too many answers — that is a list, not a question (max ' + FACET_MAX_ANSWERS + ')';
  const cov = facetCoverage(items, facet);
  if (cov < FACET_COVERAGE) return 'thin — needs ' + Math.round(FACET_COVERAGE * 100) + '%';
  const echo = facetEcho_(items, facet);
  if (echo) return 'the same split as ' + echo + ', answered Any — its answers are that question\'s under other names';
  const split = facetSplit_(items, facet);
  if (split < FACET_MIN_MINORITY) {
    return 'lopsided — pressing its commonest answer would leave ' + Math.round(split * 1000) / 10
         + '% of the list, needs ' + Math.round(FACET_MIN_MINORITY * 100) + '%';
  }
  return '';
}

/* A QUESTION THAT RE-ASKS ONE ANSWERED ANY (499): each answer sits inside one answer of it, a different one each — Shelf after Any subject
   is Subject again (Books, Boxing, History). Every facet, by its items; nothing per-facet. */
function facetEcho_(items, facet) {
  const skipped = (STUFF.filters || []).filter(f => f.any && f.field !== facet.field);
  for (const g of skipped) {
    const G = facetList().find(f => f.field === g.field);
    if (!G) continue;
    const to = {}, from = {};
    let ok = true;
    for (const x of items) {
      const a = facetOwn_(facet, x);
      if (!a.length) continue;
      const b = facetOwn_(G, x);
      if (b.length !== 1 || a.length !== 1) { ok = false; break; }
      const ka = spellKey_(a[0]), kb = spellKey_(b[0]);
      if ((to[ka] && to[ka] !== kb) || (from[kb] && from[kb] !== ka)) { ok = false; break; }
      to[ka] = kb; from[kb] = ka;
    }
    if (ok && Object.keys(to).length > 1) return G.label || G.field;
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

/* `whyThisQuestion()` — THE FUNNEL, SHOWING ITS WORKING. § */
function whyThisQuestion(all) {
  const items = all ? stuffItems() : stuffFiltered();
  const asked = STUFF.filters.map(f => f.field);
  /* BUILT AS STRINGS, NOT WITH `%s`. § */
  const pad = (v, n) => (String(v) + '                  ').slice(0, n);
  const num = (v, n) => ('        ' + String(v)).slice(-n);
  console.log('');
  console.log(items.length + ' result(s) in hand'
              + (asked.length ? '   answered: ' + asked.join(', ') : '   nothing answered yet'));
  console.log('');
  console.log('  ' + pad('field', 14) + pad('label', 18)
              + num('answers', 8) + num('cover', 7) + '  why');
  let chosen = null;
  facetList().forEach(f => {
    const vals = facetValues(items, f);
    const cov = facetCoverage(items, f);
    let why = asked.indexOf(f.field) !== -1 ? 'asked already' : facetWhy_(items, f);
    if (!why) { why = chosen ? 'would do, but comes after ' + chosen : '← THIS ONE'; chosen = chosen || f.field; }
    console.log('  ' + pad(f.field + (f.fromSheet ? ' *' : ''), 14) + pad(f.label, 18)
                + num(vals.length, 8) + num(Math.round(cov * 100) + '%', 7) + '  ' + why);
  });
  if (!chosen) console.log('\n  nothing left to ask — the list is the answer');
  if (facetList().some(f => f.fromSheet)) {
    console.log('  * invented in the `facets` tab rather than written in code — see facetFromSheet_');
  }
  console.log('');
  /* THE VALUES TOO, for the one it chose, because "seven answers" and WHICH seven are different
     facts and the second is the one you act on. */
  if (chosen) {
    const f = facetList().find(x => x.field === chosen);
    console.log('  ' + f.label + ': ' + facetValues(items, f)
      .map(v => (v.show || v.value) + ' (' + v.n + ')').join(', '));
    console.log('');
  }
  return chosen;
}


/* THE RESOURCES, flattened out of where the payload actually puts them. § */
/* WALKED ONCE PER PAYLOAD, not once per caller. § */
let TOPICS_MEMO = { from: null, list: null };

/* ---------- QUESTIONS AS SEARCHABLE PARTS § */
/* ---------- THE CLASSES THAT LIVE IN THE SHEET § */
const QUESTION_CLASSES = ['roman', 'lbl', 'num', 'ax', 'axis', 'grid', 'pt',
                          'stat', 'marks', 'parts'];

/* THE CARD. Small — a reference, the marks, and the first line of the question, because a list of
   ninety parts is scanned rather than read. The whole thing opens on a tap. */
/* THE RECORD IS THE FACE OF IT. W-L-D first, KOs under it, and the date the count was taken —
   because a record with no date is the one number on the card that can quietly go wrong. */
/* ---------- ONE BOUT § */
function fightCard_(x) {
  const f = x.row;
  /* ---------- WHO WON, BY ID WHERE THERE IS ONE § */
  const byId = f.winnerId && (f.aId || f.bId);
  const wonA = byId ? String(f.winnerId) === String(f.aId)
                    : !!(f.winner && norm(f.winner) === norm(f.a));
  const wonB = byId ? String(f.winnerId) === String(f.bId)
                    : !!(f.winner && norm(f.winner) === norm(f.b));

  /* HOW IT ENDED, AS A PHRASE. "KO" and "round 2" are two facts and one sentence; a card that
     printed them as two rows would be a form rather than a result. */
  /* A DECISION THAT WENT THE DISTANCE has no end round to tag, so its length is said here; method and round are tags. */
  const how2 = (!f.endRound && f.rounds) ? f.rounds + ' rounds' : '';

  const where = [f.venue, f.city].filter(Boolean).join(', ');
  const bout = f.boutTotal > 1 ? `Bout ${f.boutNo} of ${f.boutTotal}` : '';

  /* ---------- THE SAME HEAD, LINE AND META AS EVERY OTHER KIND § */
  const about = [f.titles, where ? where + (f.attendance ? ' · ' + f.attendance + ' there' : '') : '']
    .filter(Boolean).join(' · ');
  /* ---------- THE TWO FACES, SQUARED UP § */
  /* A CORNER WITH NO ROW IS A WOMAN WHEN THE OTHER CORNER IS ONE. § */
  const rowA = boxerOf_(f.aId, f.a), rowB = boxerOf_(f.bId, f.b);
  const women = [rowA, rowB].some(r => r && String(r.sex || '').trim().toUpperCase() === 'F');
  const bxA = rowA || { name: f.a, sex: women ? 'F' : '' }, bxB = rowB || { name: f.b, sex: women ? 'F' : '' };
  /* EACH CREDIT IS A LINK TO THE PHOTO'S OWN FILE PAGE where one can be named — `boxerCredit_`, the
     profile's rule, so the two cards cannot credit the same picture two ways. */
  const credits = [bxA, bxB].filter(bx => boxerPicSrc_(bx)).map(bx =>
    boxerCredit_(bx, 'Photo of ' + bx.name + ': ' + bx.imageCredit.replace(/^photo:\s*/i, '')));
  /* NO "A v B" TITLE (490): the owner, "it's redundant: just have the tags of both boxes' names" -- the Fighter, Winner and Event tags say it. */
  return `<div class="card fc fight" aria-label="${esc(f.a + ' and ' + f.b)}">
    ${/* THE FACTS ARE THE TAGS (445) — fighters, month, year, weight, round, result — so no line repeats them; the picture last, as a question's. */
      tagRow_(x)}
    ${bout || how2 ? `<p class="fc-meta">${esc([bout, how2].filter(Boolean).join(' · '))}</p>` : ''}
    ${f.notes ? `<p class="fc-lede">${esc(f.notes)}</p>` : ''}
    ${about ? `<p class="fc-note">${esc(about)}</p>` : ''}
    ${f.verified ? '' : '<p class="fc-note">Not checked yet</p>'}
    <div class="fight-faces" aria-hidden="true">${boxerPic_(bxA, 'a', wonA, f.trunksA)}<span class="fight-v">v</span>${
      boxerPic_(bxB, 'b', wonB, f.trunksB)}</div>
    ${credits.length ? `<p class="fight-credit">${credits.join(' ')}</p>` : ''}
  </div>`;
}

/* WHO WON A BOUT, by id where there is one (as the card frames the face), else by the name the row gives. */
function boutWinner_(x) {
  const f = x && x.kind === 'fight' ? x.row : null;
  if (!f) return '';
  if (f.winnerId && String(f.winnerId) === String(f.aId)) return f.a || '';
  if (f.winnerId && String(f.winnerId) === String(f.bId)) return f.b || '';
  return String(f.winner || '').trim();
}
/* A BOUT'S MONTH AND YEAR, off its `YYYY-MM-DD` date; blank for anything else. */
function boutDate_(x) {
  const m = x && x.kind === 'fight' && x.row ? /^(\d{4})(?:-(\d{2}))?/.exec(String(x.row.date || '')) : null;
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
  if (!r || (x && x.kind !== 'boxer' && x.kind !== 'fight')) return [];
  const one = d => d ? String(d) + 's' : '';
  /* A BOUT IS ONE DAY. `date` is the fight; everything else on the row is about the fighters. */
  if (x.kind === 'fight') return [one(decadeOf_(r.date))].filter(Boolean);
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
  const send = subSendTile_();
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
    subject: c.subject, level: c.level, keystage: c.keystage, topics: c.topics,
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

/* ---------- AN EXAM INSERT (455): ONE CARD, THE WHOLE SHEET, TAGGED AS A PAPER IS ---------- */
function insertItem_(r) {
  return {
    kind: 'insert', name: r.name, key: 'in:' + r.id, sub: r.summary, image: '',
    subject: r.subject, level: r.levels.length > 1 ? r.levels : r.levels[0] || '', keystage: r.keystage,
    examBoard: r.boards, tier: r.tiers,
    text: plainText_([r.name, r.summary, 'insert formula formulae equation sheet booklet data']
      .concat(...r.sections.map(s => [s.head].concat((s.lines || []).map(l => l.name)))).join(' ')),
    row: r,
  };
}
/* WHICH INSERTS A QUESTION'S PAPER COMES WITH: its subject, level, tier and board, read as the facets read them; a blank list is any. */
function insertsFor_(x) {
  if (!x || x.kind !== 'question' || !/paper/i.test(String(x.documentType || ''))) return [];
  const has = (list, v) => !list.length || asList_(v).some(a => list.indexOf(String(a)) !== -1);
  /* A READING INSERT IS ONE PAPER'S (458): its paper ids, and nothing else, say which */
  const paper = String((x.row && x.row.paper_id) || '');
  return (DATA.inserts || []).filter(r => (r.forPapers || []).length ? r.forPapers.indexOf(paper) !== -1
    : has(r.forSubjects, x.subject) && has(r.forLevels, levelOf_(x)) && has(r.forTiers, x.tier) && has(r.boards, x.examBoard));
}
/* ---------- A READING INSERT'S EXTRACT (458): private, so asked for when it is opened and drawn when it lands ---------- */
const insReading_ = r => !!r && (!!(r.forPapers || []).length || !!r.sourceText || !!r.libHas);
/* THE TEXT IS PARAGRAPHS (a blank line between), `# ` a heading, `> ` the paper's note above it, `[n]` where the paper prints line n */
function insSource_(r) {
  const lines = !!r.lineNumbers;
  return String(r.sourceText || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => {
    if (/^# /.test(p)) return `<h4 class="insrc-h">${esc(p.slice(2))}</h4>`;
    if (/^> /.test(p)) return `<p class="insrc-note">${esc(p.replace(/^> /gm, ''))}</p>`;
    const body = esc(p).replace(/\[(\d{1,3})\]\s*/g, (m, n) => lines ? `<span class="insrc-ln" aria-label="line ${n}">${n}</span>` : '');
    return `<p class="insrc-p">${body}</p>`;
  }).join('');
}
/* WHAT A READING INSERT SAYS UNTIL ITS WORDS COME: sign in, the dots, coming soon, or why not */
function insSay_(r) {
  if (typeof USER === 'undefined' || !USER || !USER.token) return '<p class="sub lib-sign">Sign in to read the source — your account is a few screens to the right.</p>';
  const t = 'in:' + r.id;
  if (LIB.gone.has(t)) return '<p class="empty">' + (r.pending ? 'Coming soon.' : 'This source is not in the library yet.') + '</p>';
  if (LIB.failed) return `<p class="empty">Couldn’t load this.<br><span class="faint">${esc(LIB.failed)}</span><br><span class="text-action" data-do="lib-retry">Try again</span></p>`;
  return loading_();
}
/* ASKED FOR, if it has words in the Ledger and they are not here yet */
function insWant_(r) {
  if (r && !r.sourceText && (r.libHas || r.pending)) libAsk_(['in:' + r.id]);
}
/* AND WHEN AN ANSWER LANDS, every open wait for an insert says where things stand, or becomes the source */
function insLanded_() {
  document.querySelectorAll('.insrc-wait[data-ins]').forEach(el => {
    const r = insertRow_(el.getAttribute('data-ins'));
    if (!r) return;
    if (r.sourceText) { el.classList.remove('insrc-wait'); el.innerHTML = insSource_(r); }
    else el.innerHTML = insSay_(r);
  });
}
/* NO INSERT TILE ON A QUESTION (463): the owner, "they can open it in their 2nd finder" -- an insert is Library, found like any card. */
const insertRow_ = id => (DATA.inserts || []).find(r => r.id === id) || null;
/* THE SHEET ITSELF, on paper: each line a name and its formula, typeset as a question's maths is (`typeset_`). */
function insertSheet_(r) {
  const mark = l => (l.higher ? '<span class="tb-h" title="Higher tier only">H</span>' : '')
    + (l.only ? `<span class="insh-only">${esc(l.only)} only</span>` : '');
  const body = r.table === 'periodic' ? insertTable_(r) : r.sections.map(s => `<section class="insh-sec">
      <h4>${esc(s.head || '')}</h4>
      <ul>${(s.lines || []).map(l => `<li><span class="insh-fn">${esc(l.name || '')}${mark(l)}</span>
        <span class="insh-fm">${typeset_(String(l.math || ''))}</span>${l.note ? `<span class="insh-note">${esc(l.note)}</span>` : ''}</li>`).join('')}</ul>
    </section>`).join('');
  if (insReading_(r)) {
    return `<div class="insh-sheet insh-reading">
    <p class="insh-kick">${esc(['Insert'].concat(r.boards).join(' · '))}</p>
    <h3>${esc(r.name)}</h3>
    ${r.summary ? `<p class="insh-sum">${esc(r.summary)}</p>` : ''}
    ${r.sourceText ? `<div class="insrc${r.lineNumbers ? ' has-lines' : ''}">${insSource_(r)}</div>`
      : `<div class="insrc insrc-wait${r.lineNumbers ? ' has-lines' : ''}" data-ins="${esc(r.id)}">${insSay_(r)}</div>`}
  </div>`;
  }
  return `<div class="insh-sheet">
    <p class="insh-kick">${esc(['Insert'].concat(r.boards).join(' · '))}</p>
    <h3>${esc(r.name)}</h3>
    ${body}
    <p class="insh-check"><b>${r.verified ? 'Checked' : 'Not yet checked'}</b> ${esc(r.verifiedNote)}</p>
  </div>`;
}
/* THE PERIODIC TABLE: 18 columns, an element where its group and period put it. */
function insertTable_(r) {
  const cells = r.elements.map(e => `<div class="insh-el" style="grid-column:${Number(e[4])};grid-row:${Number(e[5])}">
      <span class="insh-ar">${esc(String(e[3]))}</span><b>${esc(e[1])}</b><span class="insh-nm">${esc(e[2])}</span><span class="insh-z">${Number(e[0])}</span></div>`).join('');
  return `<div class="insh-pt-wrap"><div class="insh-pt" role="table" aria-label="Periodic table">${cells}</div></div>
    <p class="insh-key">In each box: relative atomic mass, symbol, name, atomic number.</p>`;
}
function insertCard_(x) {
  const r = x.row;
  insWant_(r);
  return `<div class="card insh">
    ${tagRow_(x)}
    ${insertSheet_(r)}
    <div class="tile-row">${tile_({ icon: 'print', label: 'Print', note: 'or save as PDF', act: 'ins-print', data: { id: r.id } })}${
      r.official.map(o => tile_({ icon: 'open', label: 'Official', note: o.label, act: 'ins-official', data: { url: o.url } })).join('')}</div>
  </div>`;
}
on('ins-official', el => {
  const u = String(el.getAttribute('data-url') || '');
  if (/^https:\/\//.test(u)) window.open(u, '_blank', 'noopener');
});
/* PRINTED ALONE, as a statement is (`stmt-print`): a paper copy of the sheet and nothing else of the app. */
on('ins-print', el => {
  const r = insertRow_(el.getAttribute('data-id'));
  if (!r) return;
  const paper = document.createElement('div');
  paper.className = 'insh-paper insh';
  paper.innerHTML = insertSheet_(r);
  document.body.appendChild(paper);
  document.body.classList.add('printing-insh');
  const done = () => {
    document.body.classList.remove('printing-insh');
    paper.remove();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  setTimeout(done, 4000);
  window.print();
});

/* ---------- THE HISTORY DATABASE (459): MANUSCRIPTS, FIGURES, WRITINGS — ONE CARD A ROW, LINKED BY ID. docs/history-db.md ---------- */
/* A list cell is split on " | "; an id is MS-, FIG- or WR- and digits, and any cell may name one. */
const HIST_ID = /^(MS|FIG|WR|EV)-\d+$/;
const histList_ = v => String(v == null ? '' : v).split('|').map(t => t.trim()).filter(Boolean);
const histSpec_ = kind => (typeof HIST_DB === 'undefined' ? [] : HIST_DB).find(t => t.kind === kind) || null;
/* THE ROW AN ID NAMES, in whichever table its prefix says. */
function histRow_(id) {
  const t = (typeof HIST_DB === 'undefined' ? [] : HIST_DB).find(s => String(id).indexOf(s.prefix) === 0);
  return t ? (DATA[t.file] || []).find(r => r.id === id) || null : null;
}
const histName_ = r => (r && (r.name || r.title_english || r.title_original || r.id)) || '';
/* A YEAR AS SAID: negative is BC. */
const histYear_ = n => (n == null || !isFinite(n) ? '' : n < 0 ? -n + ' BC' : n < 1000 ? 'AD ' + n : String(n));
/* THE ERAS, in order; a row is in every one its years touch (`histErasOf_`) and the funnel sorts them in this order (`answerCmp_`). */
const HIST_ERAS = [
  { name: 'Ancient', to: 500 },
  { name: 'Medieval', to: 1500 },
  { name: 'Early modern', to: 1800 },
  { name: 'Modern', to: Infinity },
];
/* THE SHARED HELPER: from and to (either may be missing) → the eras they overlap; a range ending on a boundary stays on its side. */
function histEras_(from, to) {
  const a = from != null ? from : to, b = to != null ? to : from;
  if (a == null || !isFinite(a)) return [];
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return HIST_ERAS.filter((e, i) => {
    const s = i ? HIST_ERAS[i - 1].to : -Infinity;
    return lo === hi ? lo >= s && lo < e.to : lo < e.to && hi > s;
  }).map(e => e.name);
}
function histErasOf_(x) {
  /* A WRITING'S UNIT CARRIES ITS WORK'S DATE (520), so Era asks a page of First Clement as it asked the row it replaced. */
  if (x && x.wDate) return histEras_(x.wDate[0], x.wDate[1]);
  const r = x && x.hdb ? x.row : null;
  if (!r) return [];
  return x.kind === 'figure' ? histEras_(r.born_year, r.died_year) : histEras_(r.date_from, r.date_to);
}
/* ONE READER FOR EVERY HISTORY FACET: a column of the row, split as a list; nothing on any other kind. */
const histCol_ = (x, col) => (x && x.hdb && x.row ? histList_(x.row[col]) : []);

/* THE LINKS, BOTH WAYS: what a row names, and what names it — a link typed on one side only still shows on both. */
function histLinks_(r) {
  const out = [], seen = new Set();
  const add = (id, label) => {
    /* A WRITING IS ITS PAGES (520): a WR- link lands on the work's first unit card, never a profile row. */
    const to = histRow_(id) || (typeof worksRowOf_ === 'function' ? worksRowOf_(id) : null);
    if (!to || seen.has(id) || id === r.id) return;
    seen.add(id); out.push({ id: id, label: label, row: to });
  };
  const K = { MS: 'Manuscript', FIG: /^EV-/.test(r.id) ? 'Figure' : 'Author', WR: 'Writing', EV: 'Event' };
  const kindOfId = id => K[String(id).split('-')[0]] || '';
  ['writings', 'manuscripts', 'author_id', 'figures', 'events'].forEach(c => histList_(r[c]).forEach(id => { if (HIST_ID.test(id)) add(id, kindOfId(id)); }));
  histList_(r.relations).forEach(p => {
    const m = /^([^:]+):\s*(.+)$/.exec(p);
    if (m && HIST_ID.test(m[2].trim())) add(m[2].trim(), histCap_(m[1]));
  });
  (DATA.writings || []).forEach(w => {
    if (w.author_id === r.id || histList_(w.manuscripts).indexOf(r.id) >= 0) add(w.id, 'Writing');
  });
  (DATA.manuscripts || []).forEach(m => { if (histList_(m.writings).indexOf(r.id) >= 0) add(m.id, 'Manuscript'); });
  (DATA.figures || []).forEach(f => { if (histList_(f.writings).indexOf(r.id) >= 0) add(f.id, 'Author'); });
  (DATA.timeline || []).forEach(e => { if (histList_(e.figures).concat(histList_(e.writings)).indexOf(r.id) >= 0) add(e.id, 'Event'); });
  (DATA.figures || []).forEach(f => { if (histList_(f.events).indexOf(r.id) >= 0) add(f.id, 'Figure'); });
  return out;
}
const histCap_ = s => { const t = String(s || '').trim(); return t ? t[0].toUpperCase() + t.slice(1) : ''; };

/* THE ITEM: Library, on the History shelf, as boxers are on Boxing's. */
function histItem_(kind, r) {
  const fig = kind === 'figure';
  const life = fig ? [histYear_(r.born_year), histYear_(r.died_year)] : [];
  const span = fig ? (life[0] || life[1] ? (life[0] || '?') + '–' + (life[1] || '?') : '') : r.date_text;
  const ev = kind === 'event';
  return {
    kind: kind, hdb: true, name: histName_(r), key: 'hdb:' + r.id, image: '',
    sub: (ev ? [span, r.theatre] : [fig ? span : kind === 'writing' ? r.title_original : r.repository, fig ? histList_(r.roles)[0] : span]).filter(Boolean).join(' · '),
    histKind: kind === 'manuscript' ? 'Manuscripts' : fig ? 'Historical figures' : ev ? 'Events' : 'Works',
    shelf: 'History', subject: 'History',
    text: plainText_(Object.keys(r).map(k => r[k]).join(' ')),
    row: r,
  };
}
/* A DRAWN MANUSCRIPT IS ONE CARD A SIDE (507), tagged Front (recto) or Back (verso); the first drawn keeps the bare key, so a saved key still opens. */
const MS_SIDE_SAY = { front: 'Front (recto)', back: 'Back (verso)' };
function histItems_(kind, r) {
  const one = histItem_(kind, r), L = kind === 'manuscript' && MS_LOOK[r.id];
  if (!L || !L.sides) return [one];
  return L.sides.map((sd, i) => Object.assign({}, one, { key: i ? one.key + ':' + (sd.side || i) : one.key,
    msSide: MS_SIDE_SAY[sd.side] || '', msSideIx: i, sub: [MS_SIDE_SAY[sd.side], one.sub].filter(Boolean).join(' · ') }));
}

/* THE LINES OF A CARD, one thing each (421): a label and the row's column, said as written. */
const HIST_LINES = {
  manuscript: [['Also known as', 'catalog_ids'], ['Repository', 'repository'], ['City', 'city'], ['Shelfmark', 'shelfmark'],
    ['Date', 'date_text'], ['Dated by', 'date_basis'], ['Material', 'material'], ['Format', 'format'], ['Language', 'language'],
    ['Script', 'script'], ['Contents', 'contents'], ['Size', 'size'], ['Provenance', 'provenance'], ['Condition', 'condition'], ['Notes', 'notes']],
  figure: [['Also known as', 'aliases'], ['Born', r => [r.born_text, r.born_place].filter(Boolean).join(', ')],
    ['Died', r => [r.died_text, r.died_place].filter(Boolean).join(', ')], ['Places', 'places'], ['Eras', 'eras'], ['Roles', 'roles'],
    ['Achievements', 'achievements'], ['Relations', r => histList_(r.relations).map(p => {
      const m = /^([^:]+):\s*(.+)$/.exec(p);
      return m ? histCap_(m[1]) + ': ' + (HIST_ID.test(m[2].trim()) ? histName_(histRow_(m[2].trim())) || m[2] : m[2]) : p;
    }).join(' | ')], ['Notes', 'notes']],
  writing: [['Original title', 'title_original'], ['Author', r => r.author_text || histName_(histRow_(r.author_id))],
    ['Date', 'date_text'], ['Dated by', 'date_basis'], ['Language', 'language'], ['Genre', 'genre'], ['Context', 'context'],
    ['Themes', 'themes'], ['Manuscripts', r => histList_(r.manuscripts).map(v => HIST_ID.test(v) ? histName_(histRow_(v)) || v : v).join(' | ')],
    ['Public-domain translations', 'pd_translation']],
  event: [['Date', 'date_text'], ['Places', 'places'], ['Theatre', 'theatre'], ['Part of', 'era'], ['What happened', 'summary']],
};
/* ---------- A MANUSCRIPT AS IT LOOKS (490, 495): a drawing traced over a public-domain photograph (`ref`) -- its true outline, line count and § */
const MS_LOOK = {
  'MS-0001': { stuff: 'papyrus', box: [30, 80, 630, 940],
    ref: 'Commons: File:P52 recto.jpg (PD-Art, PD-old-100) and File:P52 verso.jpg (PD-scan, PD-old-70)',
    edge: [[48, 92], [90, 88], [150, 95], [210, 92], [260, 100], [310, 98], [360, 108], [400, 112], [430, 125], [435, 150], [410, 175],
      [415, 240], [420, 300], [440, 330], [455, 340], [462, 300], [465, 230], [475, 215], [520, 210], [580, 215], [640, 222], [645, 300],
      [638, 350], [645, 400], [635, 460], [620, 500], [605, 545], [595, 560], [590, 620], [590, 690], [560, 695], [530, 680], [500, 700],
      [470, 690], [420, 700], [420, 760], [410, 830], [415, 880], [400, 890], [360, 900], [330, 920], [320, 975], [300, 1000], [250, 1005],
      [205, 995], [200, 940], [205, 900], [140, 890], [130, 860], [120, 820], [115, 760], [110, 700], [115, 640], [105, 600], [110, 550],
      [100, 490], [110, 430], [105, 375], [85, 360], [65, 320], [50, 250], [45, 180], [42, 120]],
    sides: [
      { name: 'Recto', side: 'front', what: 'John 18:31–33', lines: [[135, 640, 365, 'ΟΙΙΟΥΔΑΙ·····ΗΜΕ'], [135, 635, 462, 'ΟΥΔΕΝΑΙΝΑΟΛ'],
        [130, 600, 552, 'ΠΕΝΣΗΜΑΙΝΩ'], [150, 560, 648, 'ΘΝΗΣΚΕΙΝΙΣ'], [150, 415, 748, 'ΡΙΟΝΟΠ'], [135, 400, 838, 'ΚΑΙΕΙΠ'],
        [205, 320, 958, 'ΑΙΩ', 'trace']] },
      /* THE SAME LEAF TURNED OVER: its outline mirrored, the lines' surviving ends on the other side. */
      { name: 'Verso', side: 'back', what: 'John 18:37–38', mirror: true, lines: [[93, 560, 378, 'ΤΟΓ··ΕΝΝΗΜΑΙΚΑ'], [57, 560, 465, 'ΣΜΟΝΙΝΑΜΑΡΤΥ'],
        [180, 557, 568, 'ΤΗΣΑΛΗΘΕ'], [170, 547, 660, 'ΛΕΓΕΙΑΥΤΩ'], [280, 480, 760, 'ΙΤΟΥΤ'], [280, 453, 857, 'ΟΥΣΚ'],
        [365, 440, 948, 'ΑΙ', 'trace']] },
    ] },
  /* ONE WHOLE PAGE (fol. 41v): Luke 24:32-53 in two columns, paragraphs hanging into the margin, then the tailpiece and the title. */
  'MS-0002': { stuff: 'parchment', box: [0, 0, 700, 902],
    ref: 'Commons: File:Codex Alexandrinus f41v - Luke.jpg (PD-old-100-1923), British Library Royal MS 1 D VIII, fol. 41v',
    edge: [[22, 14], [600, 10], [640, 30], [688, 70], [692, 880], [22, 884]],
    sides: [{ name: 'Folio 41v', side: 'back', what: 'Luke 24:32–53, the end of the Gospel',
      cols: [{ x0: 100, x1: 365, y0: 84, lh: 12.95, rows: 51, paras: [
        '+ΗΝΟΙΓΕΝΗΜΙΝΤΑΣΓΡΑΦΑΣ',
        'ΚΑΙΑΝΑΣΤΑΝΤΕΣΑΥΤΗΤΗΩΡΑΥΠΕΣΤΡΕΨΑΝΕΙΣΙΕΡΟΥΣΑΛΗΜΚΑΙΕΥΡΟΝΣΥΝΗΘΡΟΙΣΜΕΝΟΥΣΤΟΥΣΕΝΔΕΚΑΚΑΙΤΟΥΣΣΥΝΑΥΤΟΙΣΛΕΓΟΝΤΑΣΟΤΙΗΓΕΡΘΗΟΚΣΟΝΤΩΣΚΑΙΩΦΘΗΣΙΜΩΝΙΚΑΙΑΥΤΟΙΕΞΗΓΟΥΝΤΟΤΑΕΝΤΗΟΔΩΚΑΙΩΣΕΓΝΩΣΘΗΑΥΤΟΙΣΕΝΤΗΚΛΑΣΕΙΤΟΥΑΡΤΟΥ',
        'ΤΑΥΤΑΔΕΑΥΤΩΝΛΑΛΟΥΝΤΩΝΑΥΤΟΣΟΙΣΕΣΤΗΕΝΜΕΣΩΑΥΤΩΝΚΑΙΛΕΓΕΙΑΥΤΟΙΣΕΙΡΗΝΗΥΜΙΝΠΤΟΗΘΕΝΤΕΣΔΕΚΑΙΕΜΦΟΒΟΙΓΕΝΟΜΕΝΟΙΕΔΟΚΟΥΝΠΝΑΘΕΩΡΕΙΝΚΑΙΕΙΠΕΝΑΥΤΟΙΣΤΙΤΕΤΑΡΑΓΜΕΝΟΙΕΣΤΕΚΑΙΔΙΑΤΙΔΙΑΛΟΓΙΣΜΟΙΑΝΑΒΑΙΝΟΥΣΙΝΕΝΤΑΙΣΚΑΡΔΙΑΙΣΥΜΩΝΙΔΕΤΕΤΑΣΧΕΙΡΑΣΜΟΥΚΑΙΤΟΥΣΠΟΔΑΣΜΟΥΟΤΙΑΥΤΟΣΕΓΩΕΙΜΙΨΗΛΑΦΗΣΑΤΕΜΕΚΑΙΙΔΕΤΕΟΤΙΠΝΑΣΑΡΚΑΚΑΙΟΣΤΕΑΟΥΚΕΧΕΙΚΑΘΩΣΕΜΕΘΕΩΡΕΙΤΕΕΧΟΝΤΑΚΑΙΤΟΥΤΟΕΙΠΩΝΕΔΕΙΞΕΝΑΥΤΟΙΣΤΑΣΧΕΙΡΑΣΚΑΙΤΟΥΣΠΟΔΑΣ',
        'ΕΤΙΔΕΑΠΙΣΤΟΥΝΤΩΝΑΥΤΩΝΑΠΟΤΗΣΧΑΡΑΣΚΑΙΘΑΥΜΑΖΟΝΤΩΝΕΙΠΕΝΑΥΤΟΙΣΕΧΕΤΕΤΙΒΡΩΣΙΜΟΝΕΝΘΑΔΕΟΙΔΕΕΠΕΔΩΚΑΝΑΥΤΩΙΧΘΥΟΣΟΠΤΟΥΜΕΡΟΣΚΑΙΑΠΟΜΕΛΙΣΣΙΟΥΚΗΡΙΟΥΚΑΙΛΑΒΩΝΕΝΩΠΙΟΝΑΥΤΩΝΕΦΑΓΕΝ',
        'ΕΙΠΕΝΔΕΑΥΤΟΙΣΟΥΤΟΙΟΙΛΟΓΟΙΟΥΣΕΛΑΛΗΣΑΠΡΟΣΥΜΑΣΕΤΙΩΝΣΥΝΥΜΙΝΟΤΙΔΕΙΠΛΗΡΩΘΗΝΑΙΠΑΝΤΑΤΑΓΕΓΡΑΜΜΕΝΑΕΝΤΩΝΟΜΩΜΩΣΕΩΣΚΑΙΠΡΟΦΗΤΑΙΣΚΑΙΨΑΛΜΟΙΣΠΕΡΙΕΜΟΥ',
        'ΤΟΤΕΔΙΗΝΟΙΞΕΝΑΥΤΩΝΤΟΝΝΟΥΝΤΟΥΣΥΝΙΕΝΑΙΤΑΣΓΡΑΦΑΣΚΑΙΕΙΠΕΝΑΥΤΟΙΣΟΤΙΟΥΤΩΣΓΕΓΡΑΠΤΑΙΚΑΙΟΥΤΩΣΕΔΕΙΠΑΘΕΙΝΤΟΝΧΝΚΑΙΑΝΑΣΤΗΝΑΙΕΚΝΕΚΡΩΝΤΗΤΡΙΤΗΗΜΕΡΑΚΑΙΚΗΡΥΧΘΗΝΑΙΕΠΙΤΩΟΝΟΜΑΤΙΑΥΤΟΥΜΕΤΑΝΟΙΑΝΚΑΙΑΦΕΣΙΝΑΜΑΡΤΙΩΝΕΙΣΠΑΝΤΑ'] },
      { x0: 410, x1: 665, y0: 84, lh: 12.95, rows: 20, paras: [
        '+ΤΑΕΘΝΗΑΡΞΑΜΕΝΟΝΑΠΟΙΕΡΟΥΣΑΛΗΜΥΜΕΙΣΔΕΕΣΤΕΜΑΡΤΥΡΕΣΤΟΥΤΩΝΚΑΙΙΔΟΥΕΓΩΑΠΟΣΤΕΛΛΩΤΗΝΕΠΑΓΓΕΛΙΑΝΤΟΥΠΡΣΜΟΥΕΦΥΜΑΣΥΜΕΙΣΔΕΚΑΘΙΣΑΤΕΕΝΤΗΠΟΛΕΙΙΕΡΟΥΣΑΛΗΜΕΩΣΟΥΕΝΔΥΣΗΣΘΕΔΥΝΑΜΙΝΕΞΥΨΟΥΣΕΞΗΓΑΓΕΝΔΕΑΥΤΟΥΣΕΞΩΕΩΣΕΙΣΒΗΘΑΝΙΑΝΚΑΙΕΠΑΡΑΣΤΑΣΧΕΙΡΑΣΑΥΤΟΥΕΥΛΟΓΗΣΕΝΑΥΤΟΥΣ',
        'ΚΑΙΕΓΕΝΕΤΟΕΝΤΩΕΥΛΟΓΕΙΝΑΥΤΟΝΑΥΤΟΥΣΔΙΕΣΤΗΑΠΑΥΤΩΝΚΑΙΑΝΕΦΕΡΕΤΟΕΙΣΤΟΝΟΥΡΑΝΟΝΚΑΙΑΥΤΟΙΠΡΟΣΚΥΝΗΣΑΝΤΕΣΑΥΤΟΝΥΠΕΣΤΡΕΨΑΝΕΙΣΙΕΡΟΥΣΑΛΗΜΜΕΤΑΧΑΡΑΣΜΕΓΑΛΗΣΚΑΙΗΣΑΝΔΙΑΠΑΝΤΟΣΕΝΤΩΙΕΡΩΑΙΝΟΥΝΤΕΣΚΑΙΕΥΛΟΓΟΥΝΤΕΣΤΟΝΘΝΑΜΗΝ'] }],
      /* THE TAILPIECE as the page draws it: three bands across, one down, three sprays, then the book's title. */
      orn: '<path class="mfr-band" d="M425 340H665M425 366H665M425 388H665M440 400V635"/>'
        + '<path class="mfr-spray" d="M510 490c-2-14 4-24 12-30M510 490c-8-8-14-12-14-20M565 505c0-26 0-40-2-55M565 505c-8-14-20-22-26-34M565 505c8-14 18-22 26-34M635 490c0-12 4-22 10-28M635 490c-6-6-12-10-12-18"/>',
      lines: [[495, 655, 552, 'ΕΥΑΓΓΕΛΙΟΝΚΑΤΑΛΟΥΚΑΝ', 'title']] }] },
};
/* THE HAND'S OWN LETTER SHAPES: a round epsilon, a lunate sigma, a rounded omega and alpha, as the uncial scribes wrote them. */
const msHand_ = s => String(s).replace(/Ε/g, 'ϵ').replace(/Σ/g, 'Ϲ').replace(/Ω/g, 'ω').replace(/Α/g, 'α');
/* A COLUMN'S PARAGRAPHS, broken into its real number of lines: the narrowest measure that fits; a paragraph's first letter hangs in the margin; `+` carries one on from the page before. */
function msColLines_(c) {
  for (let w = 10; w < 40; w++) {
    const out = [];
    c.paras.forEach(q => { const p = q.replace(/^\+/, ''); for (let i = 0; i < p.length; i += w) out.push([p.slice(i, i + w), i === 0 && p === q]); });
    if (out.length <= c.rows) {
      const step = (c.x1 - c.x0) / w;
      return out.map(([t, first], i) => [c.x0, c.x0 + t.length * step, c.y0 + i * c.lh, t, first ? 'big' : '']);
    }
  }
  return [];
}
/* THE DRAWING: one side, the card's own (507); each line's surviving letters spread over the room they take in the photograph. */
function msFragSvg_(r, ix) {
  const L = MS_LOOK[r.id];
  if (!L) return '';
  const side = L.sides[ix | 0] || L.sides[0];
  const [bx, by, bw, bh] = L.box;
  const tag = 'mfrclip-' + String(r.id).replace(/[^A-Za-z0-9]/g, '');
  const leaf = (s, k) => {
    const flip = p => s.mirror ? [2 * bx + bw - p[0], p[1]] : p;
    const d = 'M' + L.edge.map(flip).map(p => p[0] + ' ' + p[1]).join('L') + 'Z';
    const lines = (s.cols || []).flatMap(msColLines_).concat(s.lines || []);
    const text = lines.map(([x0, x1, y, t, cls]) => {
      const step = (x1 - x0) / t.length;
      /* A PARAGRAPH'S BIG LETTER is its first only, standing out in the margin (ekthesis). */
      return t.split('').map((ch, i) => {
        if (ch === '·') return '';
        const big = cls === 'big', c = big ? (i ? '' : 'big') : cls, x = x0 + step * (i + .5) - (big && !i ? step * 1.4 : 0);
        return `<text${c ? ` class="mfr-${c}"` : ''} x="${x.toFixed(1)}" y="${y}">${esc(msHand_(ch))}</text>`;
      }).join('');
    }).join('');
    const fibres = L.stuff === 'papyrus'
      ? Array.from({ length: Math.ceil(bh / 9) }, (_, i) => `<line x1="${bx}" x2="${bx + bw}" y1="${by + i * 9}" y2="${by + i * 9 + (i % 3) - 1}"/>`).join('')
        + Array.from({ length: Math.ceil(bw / 14) }, (_, i) => `<line class="mfr-up" x1="${bx + i * 14}" x2="${bx + i * 14 + (i % 2)}" y1="${by}" y2="${by + bh}"/>`).join('')
      : '';
    const id = tag + '-' + k;
    return `<figure class="hdb-ms-side">
      <svg viewBox="${bx} ${by} ${bw} ${bh}" role="img" aria-label="${esc('A drawing of ' + (r.name || 'the manuscript') + ', ' + s.name.toLowerCase() + ': ' + s.what)}">
        <defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
        <g clip-path="url(#${id})"><rect class="mfr-leaf" x="${bx}" y="${by}" width="${bw}" height="${bh}"/><g class="mfr-fibre">${fibres}</g>${s.orn || ''}<g class="mfr-ink">${text}</g></g>
        <path class="mfr-edge" d="${d}"/>
      </svg>
      <figcaption>${esc(s.name + ' · ' + s.what)}</figcaption>
    </figure>`;
  };
  return `<figure class="hdb-ms hdb-ms-${L.stuff}">
    <div class="hdb-ms-sides">${leaf(side, ix | 0)}</div>
    <figcaption>A drawing after the original, traced from a public-domain photograph (${esc(L.ref)}); the letters are the ones that survive.</figcaption>
  </figure>`;
}
/* THE LINES THE FACTS LINE ALREADY SAYS, left out of the list under it. */
const MS_SAID = ['Repository', 'City', 'Date'];
/* THE FACTS UNDER IT, one short line: when and where it was found, when it is dated to, where it is held. */
function msFacts_(r) {
  const found = histList_(r.provenance)[0] || '';
  const held = [r.repository, r.city].filter(Boolean).join(', ');
  return [found ? 'Found: ' + found : '', r.date_text ? 'Dated: ' + r.date_text : '', held ? 'Held: ' + held : '']
    .filter(Boolean).map(esc).join(' · ');
}

/* REFERENCES (504): the owner's bibliography, word for word and without page numbers, shown only on the cards each one is about. */
const WRITING_REFS = [
  'Karen H. Jobes and Moisés Silva, Invitation to the Septuagint, 2nd edn (Grand Rapids, MI: Baker Academic, 2015).',
  '\'The Letter of Aristeas\', trans. by H. T. Andrews, in The Apocrypha and Pseudepigrapha of the Old Testament in English, ed. by R. H. Charles, 2 vols (Oxford: Clarendon Press, 1913), II, 83–122.',
  'Philo, On the Life of Moses, trans. by C. D. Yonge (1854–55).',
  'Jennifer M. Dines, The Septuagint, ed. by Michael A. Knibb (London: T&T Clark, 2004).',
  'Emanuel Tov, Textual Criticism of the Hebrew Bible, 3rd edn (Minneapolis: Fortress Press, 2012).',
  'Timothy Michael Law, When God Spoke Greek: The Septuagint and the Making of the Christian Bible (Oxford: Oxford University Press, 2013).',
];
/* WHICH CARDS: the Septuagint (Greek and Brenton's English), the Masoretic (Tov), the Letter of Aristeas, Ptolemy II. Numbers into WRITING_REFS. */
const WRITING_REFS_ON = { 'bible:lxx': [0, 1, 2, 3, 5], 'bible:brenton': [0, 1, 2, 3, 5], 'bible:hbo': [4],
  'WR-0002': [1, 0, 3, 5], 'FIG-0010': [1, 2, 3] };
const writingRefs_ = on => {
  const at = WRITING_REFS_ON[on];
  return at ? '<section class="fc-sec wt-refs"><p class="wt-refs-h">Sources</p><ol>' + at.map(i => '<li>' + esc(WRITING_REFS[i]) + '</li>').join('') + '</ol></section>' : '';
};

const HIST_TILE_LINKS = 3;
function histCard_(x) {
  const r = x.row || {};
  const rows = (HIST_LINES[x.kind] || []).map(([label, col]) => [label, typeof col === 'function' ? col(r) : r[col]])
    .filter(l => String(l[1] == null ? '' : l[1]).trim());
  const read = x.kind === 'writing' && typeof worksFirstKey_ === 'function' ? worksFirstKey_(r.id) : '';
  /* THE ESSENTIALS (498): the owner, "what are all these tiles, don't need so many" -- three links and one source, on the card's one row (`stuffCard`). */
  const tiles = (read ? [tile_({ icon: 'book', label: 'Read it', note: 'a page a chapter', act: 'find-open', data: { key: read } })] : []).concat(histLinks_(r).slice(0, HIST_TILE_LINKS).map(l => tile_({ icon: l.id.indexOf('MS-') === 0 ? 'doc' : l.id.indexOf('WR-') === 0 ? 'book' : 'star',
    label: l.label, note: histName_(l.row), act: 'find-open', data: { key: l.row.key || 'hdb:' + l.id } })))
    .concat(histList_(r.sources).filter(u => /^https:\/\//.test(u)).slice(0, 1).map(u =>
      tile_({ icon: 'ext', label: 'Source', note: u.replace(/^https:\/\/(www\.)?/, '').split('/')[0], href: u })));
  /* A MANUSCRIPT WITH A DRAWING (490): its tags first, then the leaf, then one line of facts; its other columns stay below as before. */
  const look = x.kind === 'manuscript' ? msFragSvg_(r, x.msSideIx) : '';
  if (look) {
    return `<div class="card fc hdb hdb-msc" aria-label="${esc(x.name)}">
    ${tagRow_(x)}
    ${look}
    <p class="fc-meta hdb-facts">${msFacts_(r)}</p>
    <section class="fc-sec hdb-lines"><dl>${rows.filter(l => MS_SAID.indexOf(l[0]) < 0).map(l => `<div><dt>${esc(l[0])}</dt><dd>${
      histList_(l[1]).map(esc).join('<br>')}</dd></div>`).join('')}</dl></section>
    ${tiles.length ? `<div class="tile-row">${tiles.join('')}</div>` : ''}
  </div>`;
  }
  return `<div class="card fc hdb">
    <div class="fc-head"><h3>${esc(x.name)}</h3></div>
    ${tagRow_(x)}
    <section class="fc-sec hdb-lines"><dl>${rows.map(l => `<div><dt>${esc(l[0])}</dt><dd>${
      histList_(l[1]).map(esc).join('<br>')}</dd></div>`).join('')}</dl></section>
    ${writingRefs_(r.id)}
    ${tiles.length ? `<div class="tile-row">${tiles.join('')}</div>` : ''}
  </div>`;
}

/* THE TIMELINES (461): one item per `era` of data/timeline.json, its events in date order (`date_iso`); its years span theirs. */
const histTimelineKey_ = era => 'hdb:tl:' + String(era).toLowerCase().replace(/[^a-z0-9]+/g, '-');
function histTimelines_() {
  const by = new Map();
  (DATA.timeline || []).forEach(e => { const era = String(e.era || '').trim(); if (era) by.set(era, (by.get(era) || []).concat([e])); });
  return [...by].map(([era, evs]) => {
    const list = evs.slice().sort((a, b) => String(a.date_iso || a.date_from).localeCompare(String(b.date_iso || b.date_from)));
    const ys = list.flatMap(e => [e.date_from, e.date_to]).filter(n => n != null && isFinite(n));
    const row = { id: 'TL-' + era, name: era + ' timeline', date_from: Math.min(...ys), date_to: Math.max(...ys),
      theatre: [...new Set(list.flatMap(e => histList_(e.theatre)))].join(' | '), events: list };
    return { kind: 'timeline', hdb: true, name: row.name, key: histTimelineKey_(era), image: '',
      sub: list.length + ' events · ' + row.date_from + '–' + row.date_to, histKind: 'Events', shelf: 'History', subject: 'History',
      text: plainText_(row.name + ' ' + list.map(e => e.name).join(' ')), row: row, era: era };
  });
}
/* THE CHAPTER WHOSE DRAWING IS THIS TIMELINE: an animation titled with the era ("World War 2, 1939–45"). check-history-db holds it. */
function histTimelineChapter_(era) {
  for (const b of DATA.textbooks || []) for (const c of b.chapters || []) {
    const a = (c.animations || []).find(n => String(n.title).indexOf(era) === 0);
    if (a) return { key: 'ct:' + b.id + '-' + c.n, title: a.title };
  }
  return null;
}
/* A DAY AS A LINE OF THE TIMELINE SAYS IT: 1939-09-01 → 1 Sep 1939; anything else as written. */
const histDay_ = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? +m[3] + ' ' + MONTH_NAMES[+m[2] - 1].slice(0, 3) + ' ' + m[1] : String(iso || ''); };
/* ONE LINE PER EVENT (421): its first day, its name and the tile to its card; then the Animation tile under the list. */
function histTimelineCard_(x) {
  const r = x.row || {};
  const lines = (r.events || []).map(e => `<div><dt>${esc(histDay_(e.date_iso) || String(e.date_from))}</dt><dd class="hdb-ev"><span>${esc(e.name)}</span>${
    tile_({ icon: 'flag', label: e.name, note: e.date_text, act: 'find-open', data: { key: 'hdb:' + e.id } })}</dd></div>`);
  const ch = histTimelineChapter_(x.era);
  const tiles = ch ? [tile_({ icon: 'play', label: 'Animation', note: ch.title, act: 'find-open', data: { key: ch.key } })] : [];
  return `<div class="card fc hdb hdb-tl">
    <div class="fc-head"><h3>${esc(x.name)}</h3></div>
    ${tagRow_(x)}
    <section class="fc-sec hdb-lines"><dl>${lines.join('')}</dl></section>
    ${tiles.length ? `<div class="tile-row">${tiles.join('')}</div>` : ''}
  </div>`;
}

/* THE BIBLE (KING JAMES VERSION) — ASKED LIKE EVERYTHING ELSE ON FIND, AND SHOWN ONLY TO AN ADMIN. § */
const BIBLE_NAME = 'The Bible';
/* `Books`, A SHELF OF ITS OWN, BESIDE `@family. textbooks` AND `Boxing`. § */
/* `Writings` (504), not `Books`: the owner, "remove the word Books and replace with Writings as it encompasses more". */
const WRITINGS_SHELF = 'Writings', BIBLE_SHELF = WRITINGS_SHELF;
/* THE WORDS A SEARCH FINDS IT BY, on the cover and on every verse: what somebody types for the
   Bible that its name does not already say. */
const BIBLE_WORDS = 'scripture';
/* EACH TRANSLATION'S OWN WORDS (504), on its cards only, so "KJV" finds no WEB verse. */
const BIBLE_TR_WORDS = { KJV: 'KJV King James Authorized Version', WEB: 'WEB World English Bible',
  HBO: 'Masoretic Hebrew Tanakh original', LXX: 'Septuagint LXX Greek original', BRENTON: 'Brenton English Septuagint',
  GNT: 'Greek New Testament original Byzantine Robinson Pierpont' };

/* EVERYTHING IT KNOWS, IN ONE PLACE. § */
const BIBLE = { index: null, asking: null, failed: false, books: {}, loading: {}, missed: {}, also: {},
                item: null, verses: null, rank: null, hays: null };


/* ---------- WHO IS SHOWN IT § */
/* A RULE (496, 504): `kjv-admin` — Universal by default now, anyone of age like the Talmud and the Quran; Exception, an admin only. check-bible reads this line. */
const bibleFor_ = () => (typeof isAdmin === 'function' && isAdmin()) || (typeof ruleOn_ === 'function' && !ruleOn_('kjv-admin') && viewerOfAge_(scriptureMinAge_()));
/* THE AGE LIMIT ON SCRIPTURE (490) -- the Bible, the Quran and the Talmud: the owner, "it needs to have an age limit", 18. */
const SCRIPTURE_MIN_AGE = 18;
/* A RULE (496): `scripture-age` — Universal, scripture has no age limit, like every other item. */
const scriptureMinAge_ = () => (typeof ruleOn_ !== 'function' || ruleOn_('scripture-age')) ? SCRIPTURE_MIN_AGE : 0;
/* SCRIPTURE IS RELIGIOUS STUDIES, ON THE BOOKS SHELF (494): "quran and talmud should be in religious studies and in books"; `libBook` says which book. */
const SCRIPTURE_SUBJECT = () => brand('scripture_subject', 'Religious Studies');


/* THE DOTS UNDER A SCRIPTURE QUESTION (504) wait for its indexes, never the payload, which adds no answer there; a failed index is said.
   null: not scripture's question. */
const SCRIPTURE_KINDS = { bible: 1, quran: 1, talmud: 1, hadith: 1, worktext: 1 };
function scriptureWait_(items) {
  if (!items || !items.length || !items.every(x => x && SCRIPTURE_KINDS[x.kind])) return null;
  const books = [['the Bible', BIBLE, bibleFor_()],
    ['the Quran', typeof QURAN !== 'undefined' ? QURAN : null, typeof quranFor_ === 'function' && quranFor_()],
    ['the Talmud', typeof TALMUD !== 'undefined' ? TALMUD : null, typeof talmudFor_ === 'function' && talmudFor_()],
    ['the Hadith', typeof HADITH !== 'undefined' ? HADITH : null, typeof hadithFor_ === 'function' && hadithFor_()],
    ['the other writings', typeof WORKS !== 'undefined' ? WORKS : null, viewerOfAge_(scriptureMinAge_())]]
    .filter(b => b[1] && b[2]);
  if (books.some(b => b[1].asking)) return loading_();
  const gone = books.filter(b => b[1].failed).map(b => b[0]);
  return gone.length ? '<p class="find-end">The list of ' + esc(gone.join(' and ')) + ' did not arrive. <b>Pull down to try again.</b></p>' : '';
}

/* ONE FETCH FOR EVERY FILE OF IT, stamped with the deploy so the service worker's exact-URL cache hands back a fresh copy after one — `videosAsk_`'s reasoning § */
function bibleGet_(file) {
  if (!bibleFor_()) return Promise.resolve(null);
  return scriptureFetch_(o => fetch('data/bible/' + file + scriptureStamp_(), o));
}
/* SCRIPTURE'S FETCHES END (504): a request that hangs is given up after this long and said as a miss, so no wait lasts for ever. */
const SCRIPTURE_WAIT_MS = 20000;
const scriptureStamp_ = () => (window.LOAD ? '?t=' + window.LOAD : '');
function scriptureFetch_(ask) {
  return new Promise(done => {
    let over = false, ab = null;
    try { if (typeof AbortController === 'function') ab = new AbortController(); } catch (e) {}
    const t = setTimeout(() => { over = true; try { if (ab) ab.abort(); } catch (e) {} done(null); }, SCRIPTURE_WAIT_MS);
    Promise.resolve().then(() => ask(ab ? { cache: 'default', signal: ab.signal } : { cache: 'default' }))
      .then(res => (res && res.ok) ? res.json() : null)
      .catch(() => null)
      .then(d => { clearTimeout(t); if (!over) done(d); });
  });
}

/* THE LIST OF BOOKS — asked for once, the first time an admin's Find is built, which is long before a finger reaches the shelf. § */
function bibleIndex_() {
  if (BIBLE.index) return BIBLE.index;
  if (!BIBLE.asking && !BIBLE.failed && bibleFor_()) {
    BIBLE.asking = bibleGet_('index.json').then(d => {
      const ok = !!d && typeof d.translation === 'string' && /^[A-Za-z0-9]+$/.test(d.translation)
        && Array.isArray(d.books) && d.books.length > 0
        && d.books.every((b, i) => b && b.n === i + 1 && b.book && /^\d\d-[a-z0-9-]+\.json$/.test(b.file)
                                   && b.chapters > 0 && (b.testament === 'OT' || b.testament === 'NT')
                                   && typeof b.group === 'string' && b.group.trim() !== ''
                                   && Array.isArray(b.chapterVerses) && b.chapterVerses.length === b.chapters
                                   && b.chapterVerses.every(c => Number.isInteger(c) && c > 0)
                                   && b.chapterVerses.reduce((s, c) => s + c, 0) === b.verses);
      BIBLE.asking = null;
      if (ok) { BIBLE.index = d; BIBLE.rank = bibleRankOf_(d); BIBLE.hays = d.books.map(bibleHay_); WRITING_CAME.bible = true; }
      else BIBLE.failed = true;
      /* THE VERSES ARRIVE: every finder's list is built again with them (499). */
      bibleRedraw_();
      finderEach_(F => {
        if (ok) {
          FIND_MEMO.key = null;
          STUFF_PAGES = { from: null, pages: [] };
        }
        if ($(F.id + '-controls')) paintStuff(true);
      });
      /* A STARRED VERSE IS NAMED FROM THE INDEX, so Saved could not draw one until now. */
      if (AT === 'saved') repaint(true); else markStale_('saved');
      return BIBLE.index;
    });
  }
  return null;
}
/* ONE CARD, ONE TRANSLATION (504): the owner, "1 widget is one verse ... the translation is a tag". The KJV keeps its own slot `n`, a second
   translation `dir:n`, so a KJV star's key and every KJV caller stay as they were. */
/* EACH TEXT (504): its code, the Text tag it answers (`say`), its language, and its own books when its numbering is its own. */
function bibleTrs_(ix) {
  return [{ tr: String(ix.translation), dir: '', say: String(ix.translation), lang: 'en', books: ix.books }].concat((ix.also || [])
    .filter(t => t && /^[a-z]+$/.test(String(t.dir || '')) && /^[A-Za-z0-9]+$/.test(String(t.translation || '')))
    .map(t => ({ tr: String(t.translation), dir: String(t.dir), say: String(t.say || t.translation), lang: String(t.lang || 'en'),
                 books: Array.isArray(t.books) ? t.books : ix.books })));
}
/* ONE BOOK OF ONE TEXT, by its number: its own record (chapters, verse counts, file). */
function bibleBookIn_(n, dir) {
  const t = BIBLE.index && bibleTrs_(BIBLE.index).find(t => t.dir === (dir || ''));
  return (t && t.books.find(b => b.n === Number(n))) || null;
}
const bibleSlot_ = (n, dir) => dir ? dir + ':' + n : n;
/* THE WORDS OF ONE VERSE in its card's own translation, or '' until its book has come. */
function bibleText_(x) {
  const d = x && x.bb && BIBLE.books[x.bb.slot];
  const c = d && d.chapters[Number(x.ch) - 1];
  return c && c[Number(x.v) - 1] != null ? c[Number(x.v) - 1] : '';
}
const bibleBook_ = n => (BIBLE.index && BIBLE.index.books[n - 1]) || null;
const bibleTestament_ = t => (t === 'NT' ? 'New Testament' : 'Old Testament');
/* `Psalm 23`, NOT `Psalms 23` — the book is the Psalms and a chapter of it is a psalm. The one book
   whose chapters are cited by a different word from its title. */
const bibleCite_ = (b, ch) => (b.book === 'Psalms' ? 'Psalm' : b.book) + ' ' + ch;
/* THE WORDS EVERY VERSE OF ONE BOOK CARRIES — its Bible, its testament, its group and its book — so a search that names any of them finds it. § */
const bibleBookWords_ = b => [BIBLE_NAME, BIBLE_WORDS, bibleTestament_(b.testament), b.group, b.book].join(' ');
/* WHAT EVERY VERSE OF ONE BOOK IS FOUND BY, BAR ITS OWN NUMBERS: § */
const bibleHay_ = b => stuffHay_({ name: bibleCite_(b, ''), sub: b.book, text: bibleBookWords_(b) });

/* ---------- THE ORDER THE ANSWERS ARE DRAWN IN, WHICH IS THE BIBLE'S § */
function bibleRankOf_(ix) {
  const r = { t: { oldtestament: 0, newtestament: 1 }, g: {}, b: {} };
  [].concat(...bibleTrs_(ix).map(t => t.books)).forEach(b => {
    const g = spellKey_(b.group);
    if (!(g in r.g)) r.g[g] = b.n;
    r.b[spellKey_(b.book)] = b.n;
  });
  return r;
}

/* ONE BOOK OF ONE TRANSLATION, ONCE A VISIT. Held to the index's own count of every chapter's verses, so a file that came
   back half-written is a failure said on the card rather than a verse drawn from the wrong place. */
function bibleLoad_(n, dir) {
  const k = bibleSlot_(n, dir || '');
  if (BIBLE.books[k]) return Promise.resolve(BIBLE.books[k]);
  if (BIBLE.loading[k]) return BIBLE.loading[k];
  const b = bibleBookIn_(n, dir);
  if (!b || !bibleFor_()) return Promise.resolve(null);
  BIBLE.loading[k] = bibleGet_((dir ? dir + '/' : '') + b.file).then(d => {
    delete BIBLE.loading[k];
    const ok = !!d && Array.isArray(d.chapters) && d.chapters.length === b.chapters
      && d.chapters.every((c, i) => Array.isArray(c) && c.length === b.chapterVerses[i]
                                    && c.every(v => typeof v === 'string'));
    BIBLE.missed[k] = !ok;
    if (!ok) return null;
    BIBLE.books[k] = d;
    return d;
  });
  return BIBLE.loading[k];
}

/* ---------- THE CHOSEN BOOK, ASKED FOR BEFORE ITS VERSES ARE DRAWN (docs/history/341) § */
function bibleChosen_() {
  const st = typeof RES_ST !== 'undefined' ? RES_ST : STUFF;
  const f = (st.filters || []).find(x => x.field === 'wBook' && x.value != null);
  if (!f || !BIBLE.rank || !BIBLE.rank.b) return 0;
  return BIBLE.rank.b[spellKey_(f.value)] || 0;
}
/* THE CHOSEN TRANSLATION'S FOLDER: '' for the KJV, or when none is chosen yet. */
function bibleChosenDir_() {
  const st = typeof RES_ST !== 'undefined' ? RES_ST : STUFF;
  const f = (st.filters || []).find(x => x.field === 'wText' && x.value != null);
  const t = f && BIBLE.index ? bibleTrs_(BIBLE.index).find(t => writingText_(writingTextOf_(t.tr)) === f.value) : null;
  return t ? t.dir : '';
}
function bibleAhead_() {
  const n = bibleChosen_(), dir = bibleChosenDir_(), k = bibleSlot_(n, dir);
  if (!n || !bibleFor_() || BIBLE.books[k] || BIBLE.loading[k] || BIBLE.missed[k]) return;
  bibleLoad_(n, dir).then(() => bibleRedraw_(k));
}
function bibleJobs_() {
  const n = TABS.some(t => t.id === 'res') ? bibleChosen_() : 0, k = bibleSlot_(n, bibleChosenDir_());
  if (!n || !bibleFor_() || BIBLE.books[k] || BIBLE.loading[k] || BIBLE.missed[k]) return [];
  return [{ key: 'bible:' + n, kind: 'bible', d: aheadDist_('res', null), run: bibleAhead_ }];
}
AHEAD_KINDS.push(bibleJobs_);

/* ---------- A VERSE, DRAWN § */
const bibleVerse_ = t => esc(String(t == null ? '' : t).replace(/^#\s*/, ''))
  .replace(/\[([^\[\]]*)\]/g, '<i>$1</i>');

/* ---------- THE VERSE AS THE CARD READS IT § */
const bibleV_ = t => '<p class="bb-v">'
  + (/^#/.test(String(t == null ? '' : t)) ? '<span class="bb-para" aria-hidden="true">¶</span> ' : '')
  + bibleVerse_(t) + '</p>';

/* ---------- EVERY VERSE, AS AN ITEM § */
function bibleVerseList_(ix) {
  const num = [], N = i => num[i] || (num[i] = String(i));
  const list = [], starts = {}, rs = SCRIPTURE_SUBJECT(), reg = writingWork_('bible'), age = writingAge_(reg);
  bibleTrs_(ix).forEach(t => {
    const text = writingText_(writingTextOf_(t.tr));
    const head = 'bible:' + t.tr.toLowerCase() + ':', st = starts[t.tr.toLowerCase()] = [];
    t.books.forEach(b => {
      const bb = { n: b.n, book: b.book, testament: bibleTestament_(b.testament), group: b.group, translation: t.say, text: text,
                   dir: t.dir, lang: t.lang, slot: bibleSlot_(b.n, t.dir), words: bibleBookWords_(b) + ' ' + (BIBLE_TR_WORDS[t.tr] || t.say) };
      const at = st[b.n - 1] = [];
      b.chapterVerses.forEach((count, ci) => {
        const c = ci + 1, cite = bibleCite_(b, c) + ':';
        at.push(list.length);
        for (let v = 1; v <= count; v++) {
          list.push({ kind: 'bible', key: head + b.n + ':' + c + ':' + v, name: cite + v, sub: b.book,
                      shelf: WRITINGS_SHELF, wSrc: 'bible', topic: reg.topic, subject: rs, image: '', row: null, text: bb.words, bb: bb, ch: N(c), v: N(v),
                      min_age: age });
        }
      });
    });
  });
  return { list: list, starts: starts };
}

/* THE VERSE LIST, BUILT ONCE A VISIT — the first time the Bible is opened, never for anybody else. § */
function bibleVerses_() {
  if (!bibleFor_()) return [];
  const ix = BIBLE.index;
  if (!ix) return [];
  if (!BIBLE.verses || BIBLE.verses.from !== ix) {
    const made = bibleVerseList_(ix);
    SORTED_ITEMS.set(made.list, made.list);
    BIBLE.verses = { from: ix, list: made.list, starts: made.starts };
  }
  return BIBLE.verses.list;
}

/* ONE VERSE BY ITS KEY, by arithmetic: § */
function bibleByKey_(k) {
  const m = /^bible:([a-z0-9]+):(\d+):(\d+):(\d+)$/.exec(String(k || ''));
  const ix = BIBLE.index;
  if (!m || !ix) return null;
  const list = bibleVerses_();
  const st = BIBLE.verses && BIBLE.verses.starts[m[1]];
  const at = st && st[Number(m[2]) - 1];
  const i = at ? at[Number(m[3]) - 1] : undefined;
  if (i == null) return null;
  const x = list[i + Number(m[4]) - 1];
  return x && x.key === k ? x : null;
}

/* ---------- THE LAST LINE UNDER THE QUESTION, ONCE NOTHING IS LEFT TO ASK § */
function bibleEnd_(items) {
  if (!items.length || !items.every(x => x && x.kind === 'bible')) return '';
  const first = items[0], last = items[items.length - 1];
  if (!first.bb) {
    if (BIBLE.index) return '';
    return BIBLE.failed
      ? '<p class="find-end">The list of the Bible&rsquo;s books did not arrive. <b>Try again is under the cover.</b></p>'
      : loading_();
  }
  if (items.length === 1) return `<p class="find-end">${esc(first.name)}. <b>Swipe up for it.</b></p>`;
  const to = first.bb === last.bb ? last.ch + ':' + last.v : last.name;
  return `<p class="find-end">${esc(first.name)} to ${esc(to)}.
      <b>Swipe up for the ${items.length.toLocaleString('en-GB')} verses.</b></p>`;
}

/* EVERY VERSE A CARD ON THE EVERYDAY LIST (499), as the Quran's: "each verse should be a widget like quran". An admin's alone, 18+;
   a book's words only when one of its cards is drawn. */
function bibleItems_() {
  if (!bibleFor_()) return [];
  bibleIndex_();
  if (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null) return [];
  const list = bibleVerses_();
  BIBLE.item = list[0] || null;
  return list;
}

/* ---------- A VERSE (the cover went in 499). */
function bibleCard_(x) {
  return x && x.bb ? bibleVerseCard_(x) : '';
}

/* ---------- ONE VERSE, A CARD OF ITS OWN § */
function bibleVerseCard_(x) {
  const bb = x.bb, n = bb.n, k = bb.slot, d = BIBLE.books[k];
  const also = bb.dir && BIBLE.index ? (BIBLE.index.also || []).find(a => a.dir === bb.dir) : null;
  let body;
  if (d) {
    const w = bibleText_(x), he = bb.lang === 'he';
    body = '<p class="bb-tr">' + esc(bb.translation) + '</p>'
      + (!w ? '<p class="fc-note">This text has no verse with this number.</p>'
        : he || bb.lang === 'grc' ? `<p class="bb-v bb-${he ? 'he' : 'grc'}"${he ? ' dir="rtl"' : ''} lang="${he ? 'he' : 'grc'}">${esc(w)}</p>`
        : bibleV_(w))
      + '<p class="bb-credit">' + (also ? esc(also.name || also.translation) : 'King James Version (1611)') + ': public domain</p>'
      + writingRefs_('bible:' + bb.dir);
  }
  else if (BIBLE.missed[k] && !BIBLE.loading[k]) body = `<p class="fc-note bb-miss">${esc(bb.book)} did not arrive.</p>`;
  else {
    /* WAITING FOR ITS BOOK: the one loader, where the verse will be. */
    body = loading_();
    if (!BIBLE.loading[k]) {
      bibleLoad_(n, bb.dir).then(got => {
        if (!got) toast(bb.book + ' did not arrive — Try again is under the verse.');
        bibleRedraw_(k);
      });
    }
  }
  return `<div class="card fc bible bb-verse" data-bb="v" data-bn="${esc(String(k))}" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    ${body}
  </div>`;
}

/* ---------- THE TILES UNDER IT § */
function bibleTiles_(x) {
  if (!bibleFor_() || !x) return '';
  if (!x.bb) {
    if (BIBLE.index) return tile_({ icon: 'open', label: 'Open', note: BIBLE.index.translation, act: 'bible-go' });
    return BIBLE.failed ? tile_({ icon: 'undo', label: 'Try again', note: 'the list of books', act: 'bible-retry' }) : '';
  }
  const bb = x.bb;
  const again = BIBLE.missed[bb.slot] && !BIBLE.loading[bb.slot]
    ? tile_({ icon: 'undo', label: 'Try again', note: bb.book, act: 'bible-retry', data: { n: bb.slot } }) : '';
  return again + (bibleHere_(x) ? ''
    : tile_({ icon: 'book', label: 'Chapter', note: bibleCite_(bb, x.ch), act: 'bible-go', data: { key: x.key } }));
}
/* IN THIS VERSE'S CHAPTER ALREADY: its Book and Chapter answered, no Verse answer and no words
   narrowing the chapter — the strip is the chapter, so the tile would land where you are. */
function bibleHere_(x) {
  if (String(STUFF.q || '').trim()) return false;
  const leaf = f => f && !f.any;
  const fs = STUFF.filters || [];
  if (fs.some(f => leaf(f) && f.field === 'wUnit')) return false;
  return fs.some(f => leaf(f) && f.field === 'wBook' && spellKey_(f.value) === spellKey_(x.bb.book))
      && fs.some(f => leaf(f) && f.field === 'wChapter' && String(f.value) === String(x.ch));
}

/* ---------- KEPT ON SAVED § */
function bibleKept_(has) {
  if (!bibleFor_()) return [];
  if (!BIBLE.index) return [];
  const re = /^bible:[a-z0-9]+:\d+:\d+:\d+$/;
  const keys = [];
  const add = k => { const s = String(k); if (re.test(s) && has(s) && keys.indexOf(s) < 0) keys.push(s); };
  FAVS.forEach(k => add(k));
  if (typeof SPOT !== 'undefined') SPOT.forEach(k => add(k));
  if (!keys.length) return [];
  return keys.map(k => bibleByKey_(k)).filter(Boolean)
    .sort((a, b) => (a.bb.n - b.bb.n) || (Number(a.ch) - Number(b.ch)) || (Number(a.v) - Number(b.v)));
}

/* ---------- DRAWING IT AGAIN WHERE IT ALREADY IS § */
function bibleRedraw_(n) {
  if (typeof document === 'undefined') return;
  const sel = n ? '.card.bb-verse[data-bn="' + String(n).replace(/[^a-z0-9:]/g, '') + '"]' : '.card.bible[data-bb="card"]';
  document.querySelectorAll(sel).forEach(el => {
    const x = n ? bibleByKey_(el.getAttribute('data-key')) : BIBLE.item;
    if (!x) return;
    const t = document.createElement('div');
    t.innerHTML = bibleCard_(x);
    const card = t.firstElementChild;
    if (!card) return;
    const pane = el.closest('.pane');
    el.replaceWith(card);
    const wrap = card.parentElement && card.parentElement.classList.contains('favwrap') ? card.parentElement : null;
    const row = wrap && wrap.nextElementSibling && wrap.nextElementSibling.classList.contains('tile-row')
      ? wrap.nextElementSibling : null;
    const tiles = wrap ? cardTiles_(x) : '';
    if (row) { if (tiles) row.outerHTML = tiles; else row.remove(); }
    else if (wrap && tiles) wrap.insertAdjacentHTML('afterend', tiles);
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}

/* ---------- INTO THE BIBLE, FROM WHEREVER THE TAP WAS § */
/* INTO THE FINDER THE TAP WAS IN — a verse's Chapter or the cover's Open pressed in Find 2 stays in Find 2, where the student is reading — and into Find from § */
on('bible-go', el => {
  if (!bibleFor_() || !BIBLE.index || !BIBLE.item) return;
  const k = el && el.getAttribute('data-key');
  const x = k ? bibleByKey_(k) : null;
  if (k && !x) return;
  const F = finderAt_(el);
  const f = [{ field: 'shelf', value: WRITINGS_SHELF }, { field: 'wWork', value: 'Bible' },
    { field: 'wText', value: x ? x.bb.text : writingText_(writingTextOf_(BIBLE.index.translation)) }];
  if (x) f.push({ field: 'wBook', value: x.bb.book }, { field: 'wChapter', value: x.ch });
  inFinder_(F, () => {
    STUFF.q = '';
    const box = $(F.id + '-q');
    if (box) box.value = '';
    STUFF.filters = f;
    paintStuff();
    if (AT !== F.id) go(F.id);
    goPage(F.id, x ? stuffFirstResult_() + stuffPageOf_(x) : stuffQuestionPage_());
  });
});
/* AGAIN, AFTER A FAILURE: a book (`data-n`), which redrawing its cards fetches; or the list of books. */
on('bible-retry', el => {
  if (!bibleFor_()) return;
  const a = String((el && el.getAttribute('data-n')) || ''), n = /^\d+$/.test(a) ? Number(a) : a;
  if (n) { delete BIBLE.missed[n]; bibleRedraw_(n); return; }
  BIBLE.failed = false;
  bibleIndex_();
  bibleRedraw_();
  /* EVERY FINDER WHOSE QUESTION IS DRAWN — both hold the Bible's shelf now. */
  finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
});

/* ---------- A KEPT CARD SAVED CANNOT DRAW WHOLE OPENS IN FIND § */
function finderWalk_(x) {
  const out = [];
  for (let guard = 0; guard < 16; guard++) {
    STUFF.filters = out.slice();
    const items = stuffFiltered();
    if (items.length <= 1) break;
    const facet = nextFacet(items);
    if (!facet) break;
    const own = (() => { try { return facetOwn_(facet, x); } catch (e) { return []; } })();
    out.push(own.length ? { field: facet.field, value: String(own[0]) } : { field: facet.field, any: true });
    STUFF.filters = out.slice();
    if (stuffFiltered().indexOf(x) < 0) { out.pop(); break; }
  }
  return out;
}
/* `F` IS WHICH FINDER, said by the caller — Find when nobody says (`find-open` passes the finder the
   press was in, which from Saved and the Spotlight is Find). */
function finderOpen_(x, part, F) {
  F = F || FINDERS.stuff;
  inFinder_(F, () => {
    STUFF.q = '';
    const box = $(F.id + '-q');
    if (box) box.value = '';
    STUFF.filters = finderWalk_(x);
    paintStuff();
    if (AT !== F.id) go(F.id);
    const pages = stuffPages_();
    let i = pages.findIndex(pg => pg.x === x && (pg.part || null) === (part || null));
    /* A PART THE ITEM NO LONGER HAS -- a figure page kept before figures moved into their cards (356) --
       OPENS ON THE ITEM'S CARD, not on the first page of the list. */
    if (i < 0) i = pages.findIndex(pg => pg.x === x && !pg.part);
    goPage(F.id, i >= 0 ? stuffFirstResult_() + i : stuffQuestionPage_());
  });
}
/* WHICH OF A THING'S PAGES A KEPT LIST DRAWS: § */
const keptPart_ = p => !p || p === 'fig' || p === 'ans' || /^(stem\d+(-\d+)?|pre\d+)$/.test(p);
/* SET WHILE A KEPT LIST IS BEING DRAWN (`keptPages_`, for Saved and the Spotlight), in the way `SPOT_TILES` is: § */
let KEPT_DRAW = false;
/* THE TILE: under a kept card that is not whole on the column, `Open · in Find` — the column's name from `TABS`, so a renamed column says so. § */
function finderOpenTile_(x) {
  if (!KEPT_DRAW || !x || !x.key || x.kind === 'bible') return '';
  let parts;
  try { parts = pageParts_(x); } catch (e) { return ''; }
  if (parts.every(keptPart_)) return '';
  const t = (typeof TABS !== 'undefined' ? TABS : []).find(r => r.id === 'stuff');
  /* A MAGNIFIER, NOT THE LEAVE-THE-SITE ARROW (489): it opens the card in Find, not "a new place". */
  return tile_({ icon: 'search', label: 'Open', note: 'in ' + (t ? t.label : 'Find'), act: 'find-open', data: { key: x.key } });
}
on('find-open', el => {
  const k = el && el.getAttribute('data-key');
  const x = k ? stuffItemsAll_().find(i => i && i.key === k) : null;
  if (x) finderOpen_(x, null, finderAt_(el));
});

/* `finderElsewhere_`, `finderWordsCount_` AND THE `finder-words` TILE WERE HERE: § */
/* THE ONE EMPTY ANSWER, for the question page and a results page alike — they were two copies of the
   same three sentences. */
function stuffNoneHtml_() {
  if (!FIND_MEMO.total) return nothingHere(FINDER.empty, true);
  const why = STUFF.q && STUFF.filters.length ? 'Try fewer words, or take a filter off.'
            : STUFF.q                          ? 'Try fewer words.'
            : STUFF.filters.length             ? 'Nothing matches all of those together.'
            : '';
  return `<p class="empty">Nothing matches.${why ? `<br><span class="faint">${esc(why)}</span>` : ''}</p>`;
}

/* ---------- WHICH PAGES A PRACTICAL TAKES, OFF WHAT THE ROW ACTUALLY HAS § */
function pageParts_(x, prev) {
  /* ---------- A QUESTION IS ITS WORDS, ITS FIGURE AND ITS ANSWER, in the order they are used § */
  /* ---------- AND IN THE PAPER'S ORDER, WHICH PUTS THE SHARED OPENING AND ITS FIGURE FIRST § */
  /* ---------- AND NO FIGURE IS A PAGE OF ITS OWN (356) § */
  if (x && x.kind === 'question') {
    const had = prev && prev.kind === 'question' ? (prev.stems || []).map(stemId_) : [];
    const out = [];
    const carried = stemOnCard_(x);
    (x.stems || []).forEach((p, i) => {
      if (!p || had.indexOf(stemId_(p)) >= 0 || p === carried) return;
      /* A LONG STEM IS SEVERAL PAGES, `stemN`, `stemN-1`, `stemN-2` -- see `stemPlan_`. A stem with nothing
         left to show (only a figure, which a part draws on) is no page. */
      stemPlan_(p).chunks.forEach((c, j) => out.push('stem' + i + (j ? '-' + j : '')));
    });
    /* AND A LONG PART IS ITS FIRST PAGES (`preN`) AND THEN THE CARD, which keeps the last of its words
       with the answer -- and its figure among them wherever `partPlan_` stands it. */
    const plan = partPlan_(x);
    plan.chunks.forEach((c, j) => out.push(j === plan.chunks.length - 1 ? null : 'pre' + j));
    if (questionHasAns_(x)) out.push('ans');
    return out;
  }
  /* A PROJECT IS ITS CARD, ITS MATERIALS, ITS STEPS AND "SHARE IT" — the share page always, since
     every project ends in something to send. */
  if (x && x.kind === 'project' && x.row) {
    const out = [null];
    if (x.row.materials && x.row.materials.length) out.push('kit');
    if (x.row.steps && x.row.steps.length) out.push('steps');
    out.push('share');
    return out;
  }
  /* A CONTENT CARD IS ITSELF, A PAGE PER ANIMATION in the file's order, then its Formulas and its Worked examples (408):
     one titled page per thing, and a page only where the row has the thing. */
  if (x && x.kind === 'content' && x.row) {
    const c = x.row;
    return [null].concat((c.animations || []).map(a => 'an' + c.n + '-' + a.id),
      (c.formulas || []).length ? ['formulas'] : [], (c.points || []).length ? ['worked'] : []);
  }
  /* THE BIBLE HAS NO BRANCH HERE ANY MORE. Its cover and each of its verses are one page, the
     default below; the cover's three lists of books and the open book's pages went with the reader
     (see the head of the Bible section). */
  /* A BOXER IS THEIR CARD AND, WHERE THEY HAVE ANY, THEIR FIGHTS — seven bouts a page, see
     `boxerFightPages_`. */
  if (x && x.kind === 'boxer' && x.row) return [null].concat(boxerFightPages_(x.row));
  if (!x || x.kind !== 'practical' || !x.row || x.row.excluded) return [null];
  const p = x.row, out = [null];
  /* THE PICTURE IS ITS OWN PAGE, straight after the card — "across the board of all resources the diagrams should be its own widgets" (204), and the owner asked § */
  if (p.diagram) out.push('fig');
  if (p.equipment && p.equipment.length) out.push('kit');
  if (p.steps && p.steps.length) out.push('steps');
  out.push('work');
  return out;
}

/* ONE PAGE THAT IS NOT A RESULT'S OWN CARD, whichever kind it belongs to. */
/* ---------- AND THE CARD WITH ITS FIGURE, FOR A COLUMN THAT LISTS THINGS ONE PAGE EACH § */
/* A KEPT BIBLE IS ITS COVER ALONE NOW, with the `Open` tile under it — its three lists of books were
   kept here once, because the cover was a card with no other way into the book. */
/* `prev` IS THE KEPT THING IN FRONT, as on Find -- see `keptPages_`. */
function cardPages_(x, credits, prev) {
  /* ONE WAITING PAGE UNTIL ITS WORDS COME (397), as on Find. */
  if (libSlim_(x)) { libWant_(x); return [libWaitHtml_(x)]; }
  return pageParts_(x, prev).filter(keptPart_)
    .map(p => (p ? stuffPart_(x, p) : stuffCard(x, credits)));
}

/* ---------- SAVED AND SPOTLIGHT DRAW A QUESTION'S OPENING ONCE, AS FIND DOES § */
function keptPages_(items, credits) {
  const by = {}, done = {}, seq = [];
  const key = x => x._sk || (x._sk = sortKey_(x));
  (items || []).forEach(x => { const k = qId_(x); if (k) (by[k] = by[k] || []).push(x); });
  (items || []).forEach(x => {
    const k = qId_(x);
    if (!k) { seq.push(x); return; }
    if (done[k]) return;
    done[k] = true;
    by[k].slice().sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)).forEach(p => seq.push(p));
  });
  /* `KEPT_DRAW` FOR THE DRAW, so a card that is not whole here is given its way to Find — see
     `finderOpenTile_`. In a `finally`, so a throw cannot leave Find's own cards carrying it. */
  const was = KEPT_DRAW;
  KEPT_DRAW = true;
  try { return [].concat(...seq.map((x, i) => cardPages_(x, credits, seq[i - 1]))); }
  finally { KEPT_DRAW = was; }
}
function stuffPart_(x, part) {
  if (libSlim_(x)) { libWant_(x); return libWaitHtml_(x); }
  if (x && x.kind === 'project') return projectPart_(x, part);
  if (x && x.kind === 'content') return contentPart_(x, part);
  if (x && x.kind === 'boxer') return boxerPart_(x, part);
  if (x && x.kind === 'question' && part === 'ans') return questionAnsCard_(x);
  if (x && x.kind === 'question' && /^stem\d+(-\d+)?$/.test(part)) {
    const m = /^stem(\d+)(?:-(\d+))?$/.exec(part);
    return questionStemCard_(x, +m[1], +(m[2] || 0));
  }
  if (x && x.kind === 'question' && /^pre\d+$/.test(part)) return questionPreCard_(x, +part.slice(3));
  /* A PART THE QUESTION NO LONGER HAS (a figure page kept in a place from before 356) IS ITS CARD. */
  if (x && x.kind === 'question') return stuffCard(x);
  return practicalPart_(x, part);
}

/* `on('prac-guide')` WAS HERE and is gone with the tile that opened it. § */


/* `filmCard_` WAS HERE — a film's card in Find, a title, its flags and a link out to Drive. § */

/* THE FIGHTER'S PROFILE — A TALE OF THE TAPE, AND HIS FIGHTS ON THE PAGE AFTER IT. § */

/* ---------- A FLAG FOR THE COUNTRY, WHERE THE COUNTRY IS ONE OF THESE § */
const BOXER_FLAG = {
  'usa': 'US', 'united states': 'US', 'uk': 'GB', 'united kingdom': 'GB', 'great britain': 'GB',
  'england': 'GB', 'scotland': 'GB', 'wales': 'GB', 'northern ireland': 'GB',
  'mexico': 'MX', 'ukraine': 'UA', 'puerto rico': 'PR', 'argentina': 'AR', 'ireland': 'IE',
  'germany': 'DE', 'canada': 'CA', 'panama': 'PA', 'philippines': 'PH', 'kazakhstan': 'KZ',
  'sweden': 'SE', 'italy': 'IT', 'nigeria': 'NG', 'nicaragua': 'NI', 'cuba': 'CU', 'jamaica': 'JM',
  'australia': 'AU', 'japan': 'JP', 'norway': 'NO', 'netherlands': 'NL', 'france': 'FR',
  'ghana': 'GH', 'south africa': 'ZA', 'russia': 'RU', 'dominican republic': 'DO', 'venezuela': 'VE',
  'colombia': 'CO', 'brazil': 'BR', 'thailand': 'TH', 'south korea': 'KR', 'china': 'CN',
  'new zealand': 'NZ', 'spain': 'ES', 'poland': 'PL', 'uzbekistan': 'UZ', 'belgium': 'BE',
  'denmark': 'DK', 'hungary': 'HU', 'cameroon': 'CM', 'uganda': 'UG', 'zambia': 'ZM',
};
/* TWO REGIONAL-INDICATOR LETTERS ARE A FLAG, which is the whole of the encoding. § */
function boxerFlag_(country) {
  const cc = BOXER_FLAG[norm(country)];
  return cc ? String.fromCodePoint(...[...cc].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '';
}

/* ---------- A DATE AS A FIGHT POSTER WRITES ONE § */
const BOXER_ISO = /^\d{4}-\d{1,2}-\d{1,2}/;
function boxerDate_(v) {
  const s = String(v || '').trim();
  const d = BOXER_ISO.test(s) ? parseWhen(s) : null;
  return d ? d.getDate() + ' ' + MONTH_NAMES[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear() : s;
}
/* WHOLE YEARS BETWEEN TWO DATES, or null when either is not one. A birthday not yet reached in the
   last year is taken off, which is the one step a subtraction of years gets wrong. */
function boxerAge_(from, to) {
  const a = BOXER_ISO.test(String(from || '')) ? parseWhen(from) : null;
  const b = to instanceof Date ? to : (BOXER_ISO.test(String(to || '')) ? parseWhen(to) : null);
  if (!a || !b || b < a) return null;
  let n = b.getFullYear() - a.getFullYear();
  if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) n--;
  return n;
}
/* CENTIMETRES, WITH WHAT A BOXING FAN ACTUALLY QUOTES beside them. A reach is said in inches alone
   ("a 78-inch reach"), a height in feet and inches. Rounded to the inch first and then split, so
   six foot twelve cannot happen. */
function boxerCm_(cm, height) {
  if (!(cm > 0)) return '';
  const inches = Math.round(cm / 2.54);
  return cm + ' cm · ' + (height ? Math.floor(inches / 12) + '′ ' + (inches % 12) + '″' : inches + '″');
}
/* THE NAMES, SPLIT ON THE PIPE THE SHEET USES FOR EVERY LIST, blanks and repeats taken out. */
const boxerNames_ = v => String(v || '').split('|').map(s => s.trim())
  .filter((s, i, a) => s && a.indexOf(s) === i);
/* TWO LETTERS FOR THE PLACEHOLDER: § */
const BOXER_PARTICLE = /^(de|la|del|della|van|von|da|di|du|le|der|den|dos|das)$/i;
function boxerInitials_(name) {
  const words = String(name || '').split(/\s+/).filter(s => s && !/^(jr|sr|ii|iii|iv)\.?$/i.test(s));
  const at = words.findIndex((s, i) => i > 0 && BOXER_PARTICLE.test(s));
  const w = (at > 0 ? words.slice(0, 1).concat(words[at]) : words)
    .map(s => (s.match(/[A-Za-zÀ-ÿ]/) || [''])[0]).filter(Boolean);
  return (w.length > 1 ? w[0] + w[w.length - 1] : (w[0] || '?')).toUpperCase();
}

/* ---------- THE BOXER IN A BOUT'S CORNER § */
function boxerOf_(id, name) {
  const all = (DATA && DATA.boxers) || [];
  return (id && all.find(b => String(b.id) === String(id)))
      || (name && all.find(b => norm(b.name) === norm(name))) || null;
}

/* ---------- HIS BOUTS, NEWEST FIRST, EACH ONE READ FROM HIS SIDE § */
function boxerBouts_(b) {
  const id = String((b && b.id) || ''), name = norm(b && b.name);
  if (!id && !name) return [];
  const mine = (cid, cname) => (id && cid) ? String(cid) === id : (!cid && !!name && norm(cname) === name);
  return ((DATA && DATA.fights) || []).map(f => {
    const side = mine(f.aId, f.a) ? 'a' : mine(f.bId, f.b) ? 'b' : '';
    if (!side) return null;
    const me = side === 'a' ? { id: f.aId, n: f.a } : { id: f.bId, n: f.b };
    const them = side === 'a' ? { id: f.bId, n: f.b } : { id: f.aId, n: f.a };
    let res;
    if (f.winnerId) res = String(f.winnerId) === String(me.id || id) ? 'W' : 'L';
    else if (f.winner) res = norm(f.winner) === norm(me.n) ? 'W' : 'L';
    else res = /no.?contest|^nc$/i.test(String(f.result || '')) ? 'NC' : 'D';
    return { f, res, opp: them.n, oppId: them.id };
  }).filter(Boolean).sort((p, q) => String(q.f.date || '').localeCompare(String(p.f.date || '')));
}
/* HOW IT ENDED, as a record writes it: § */
function boxerHow_(f) {
  const m = String(f.method || '').trim();
  const dist = (!m || /^(UD|SD|MD|TD|PTS|D|DRAW)$/i.test(m)) ? (f.rounds || '') : '';
  return [m, f.endRound || dist].filter(Boolean).join(' ');
}

/* ---------- THE RECORD BAR'S WIDTHS, WHICH ADD UP TO A HUNDRED EXACTLY § */
function boxerSplit_(parts) {
  const live = parts.filter(p => p.n > 0);
  const total = live.reduce((s, p) => s + p.n, 0);
  if (!total) return [];
  let used = 0;
  return live.map((p, i) => {
    const w = i === live.length - 1 ? +(100 - used).toFixed(2) : +(p.n / total * 100).toFixed(2);
    const out = Object.assign({}, p, { x: +used.toFixed(2), w });
    used += w;
    return out;
  });
}

/* ---------- THE PHOTO, OR A RING WITH THE BOXER IN IT, AT EIGHT BITS § */

/* ---------- THE WORDS A LOOK MAY USE, AND THE ONLY ONES § */
const BOXER_LOOK = {
  skin: ['s1', 's2', 's3', 's4', 's5', 's6'],
  hair: ['bald', 'shaved', 'short', 'crop-top', 'flat-top', 'afro', 'curly', 'wavy', 'slicked', 'long',
         'ponytail', 'cornrows', 'dreads'],
  hair_colour: ['black', 'dark-brown', 'brown', 'light-brown', 'blond', 'red', 'grey', 'white'],
  facial: ['none', 'moustache', 'goatee', 'beard', 'stubble', 'sideburns'],
  trunks: ['black', 'white', 'red', 'maroon', 'blue', 'navy', 'sky', 'green', 'gold', 'yellow', 'orange',
           'purple', 'pink', 'silver', 'grey', 'tan', 'leopard'],
};

/* ---------- THE GUARD POSE, AS ROWS OF GAME PIXELS § */
const BOXER_BODY = {
  head: '1:6-9 2:5-10 3:5-11 4:5-11 5:5-11 6:6-9',
  body: '7:7-8 8:4-9 9:3-10 10:3-7,11 11:3-7 12:4-8 17:4-5,10-11 18:3-4,11-12 19:3-4,11-12',
  eye: '4:10',
  glove: '6:11-13 7:10-14 8:10-14 9:11-13 10:8-10 11:8-11 12:9-11',
  band: '13:4-10',
  trunks: '14:4-10 15:4-10 16:4-6,9-11',
  stripe: '14:5 15:5 16:5',
  spots: '14:5,9 15:7 16:5,10',
  boot: '20:2-4,11-13 21:2-4,11-14',
  /* HER TOP: the chest from the shoulders to the ribs, the back arm (x 3) and the midriff (row 12)
     left bare, so it reads as a crop top over the trunks and not as a long-sleeved shirt. */
  top: '8:5-8 9:4-9 10:4-7 11:4-7',
};
/* EACH HAIR STYLE IS ITS OWN SHAPE, and has to read as that style at this size or it is not worth a word of its own: § */
const BOXER_HAIR = {
  bald: '', shaved: '',
  short: '1:6-9 2:5-10 3:5-6 4:5 5:5',
  'crop-top': '1:6-9 2:6-10',
  'flat-top': '-1:6-10 0:5-10 1:5-10 2:5-10 3:5-6 4:5',
  afro: '-2:6-9 -1:5-10 0:4-11 1:4-11 2:4-10 3:4-6 4:4-5 5:4-5 6:5',
  curly: '0:6-7,9-10 1:5-10 2:5-11 3:4-6 4:4-5 5:5',
  wavy: '0:7-9 1:5-10 2:5-11 3:4-6 4:4-5 5:4-5 6:5',
  slicked: '1:6-10 2:5-10 3:4-6 4:5',
  long: '1:6-9 2:5-10 3:4-6 4:4-5 5:4-5 6:4-5 7:4-5',
  ponytail: '1:6-9 2:5-10 3:3-6 4:2-3,5 5:2,5 6:2 7:2',
  cornrows: '1:6-9 2:5,10 3:5-6 4:5 5:5',
  dreads: '1:6-9 2:3-10 3:3,5-6 4:3,5 5:3,5 6:3,5 7:3',
};
/* HAIR NOBODY DESCRIBED, AND NOT A WORD OF THE VOCABULARY: § */
const BOXER_HAIR_UNSAID = { M: BOXER_HAIR.short, F: '1:6-9 2:5-10 3:4-6 4:4-5 5:5' };
/* FACIAL HAIR, OVER THE FACE, in his hair colour. § */
const BOXER_FACE = {
  none: '',
  moustache: '5:10-11',
  goatee: '5:10-11 6:8-9',
  beard: '4:6 5:6-9,11 6:6-9',
  stubble: '4:6 5:6-9,11 6:6-9',
  sideburns: '3:6 4:6 5:6',
};
function boxerRuns_(spec) {
  return String(spec || '').split(/\s+/).filter(Boolean).map(row => {
    const at = row.indexOf(':'), y = row.slice(0, at);
    return row.slice(at + 1).split(',').map(r => {
      const ab = r.split('-').map(Number), w = (ab.length > 1 ? ab[1] : ab[0]) - ab[0] + 1;
      return `M${ab[0]} ${y}h${w}v1h-${w}z`;
    }).join('');
  }).join('');
}

/* ---------- A TRUNKS CELL, READ: `{ main, trim }`, OR NOTHING § */
function boxerTrunks_(v) {
  const parts = String(v || '').trim().toLowerCase().split('/');
  const ok = c => BOXER_LOOK.trunks.indexOf(c) >= 0;
  if (parts.length > 2 || !parts.every(ok) || (parts.length === 2 && parts[0] === parts[1])) return null;
  return { main: parts[0], trim: parts[1] || '' };
}

/* ---------- THE FIGHTER: ONE RENDERER, FROM A LOOK AND A PAIR OF TRUNKS § */
function boxerFigure_(look, trunks, blue, sex) {
  const L = look || {};
  const woman = String(sex || '').trim().toUpperCase() === 'F';
  const word = (k, v) => { const w = String(v || '').trim().toLowerCase(); return BOXER_LOOK[k].indexOf(w) >= 0 ? w : ''; };
  const skin = word('skin', L.skin), hair = word('hair', L.hair),
        hc = word('hair_colour', L.hairColour), face = word('facial', L.facial);
  const t = boxerTrunks_(trunks);
  const cls = ['bf', blue ? 'bf-r' : 'bf-l'], vars = [];
  if (woman) cls.push('bf-f');
  if (skin || hair || hc || face) cls.push('bf-seen');
  if (skin) { cls.push('bf-sk-' + skin); vars.push('--bf-skin:var(--bf-' + skin + ')'); }
  if (hair) cls.push('bf-hs-' + hair);
  if (hc) { cls.push('bf-hc-' + hc); vars.push('--bf-hair:var(--bf-hc-' + hc + ')'); }
  if (face && face !== 'none') cls.push('bf-fh-' + face);
  if (t) {
    cls.push('bf-tk-' + t.main);
    if (t.trim) cls.push('bf-tt-' + t.trim);
    vars.push('--bf-main:var(--bf-tk-' + t.main + ')', '--bf-trim:var(--bf-tk-' + (t.trim || t.main) + ')');
  }
  const p = (c, spec) => (spec ? `<path class="${c}" d="${boxerRuns_(spec)}"/>` : '');
  return `<g class="${cls.join(' ')}" transform="${blue ? 'translate(29 21) scale(-1 1)' : 'translate(11 21)'}"${
      vars.length ? ` style="${vars.join(';')}"` : ''}>`
    + p('bf-skin', BOXER_BODY.head + ' ' + BOXER_BODY.body)
    + p('bf-hair', hair ? BOXER_HAIR[hair] : BOXER_HAIR_UNSAID[woman ? 'F' : 'M'])
    + p('bf-face' + (face === 'stubble' ? ' bf-stubble' : ''), BOXER_FACE[face])
    + p('bf-eye', BOXER_BODY.eye)
    /* HER TOP IS IN HER TRUNKS' COLOUR — a fighter's kit — and in the same muted corner colour as
       the trunks when those are not on file; painted before the gloves, which are held over it. */
    + (woman ? p('bf-top', BOXER_BODY.top) : '')
    + p('bf-glove', BOXER_BODY.glove)
    + p('bf-band', BOXER_BODY.band)
    + p('bf-trunks', BOXER_BODY.trunks)
    /* LEOPARD IS TWO TONES, the spots painted over the trunks — or over the waistband, when it is
       the trim — in the figure's own dark brown. */
    + (t && t.main === 'leopard' ? p('bf-spot', BOXER_BODY.spots) : '')
    + (t && t.trim === 'leopard' ? p('bf-spot', '13:5,8') : '')
    + (t && t.trim ? p('bf-stripe', BOXER_BODY.stripe) : '')
    + p('bf-boot', BOXER_BODY.boot)
    + '</g>';
}

/* THE RING, SIDE ON: two posts, three ropes, the pads in each corner's colour, the mat and the apron, and his initials over the top rope like the name on a § */
function boxerRing_(name, blue, look, trunks, sex) {
  const ropes = [23, 29, 35].map((y, i) =>
    `<rect class="${i === 1 ? 'bf-rope-mid' : 'bf-rope'}" x="3" y="${y}" width="34" height="1"/>`
    + `<rect class="bf-pad-l" x="0" y="${y - 1}" width="3" height="3"/>`
    + `<rect class="bf-pad-r" x="37" y="${y - 1}" width="3" height="3"/>`).join('');
  return `<svg class="boxer-ring" viewBox="0 0 40 50" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true">`
    + `<rect class="bf-stage" x="0" y="17" width="40" height="26"/>`
    + `<rect class="bf-post" x="1" y="18" width="2" height="25"/><rect class="bf-post" x="37" y="18" width="2" height="25"/>`
    + ropes
    + `<rect class="bf-mat" x="0" y="43" width="40" height="2"/><rect class="bf-mat-edge" x="0" y="43" width="40" height="1"/>`
    + `<rect class="bf-apron" x="0" y="45" width="40" height="5"/><rect class="bf-apron-band" x="0" y="46" width="40" height="1"/>`
    + boxerFigure_(look, trunks, blue, sex)
    + `<text class="boxer-ini" x="20" y="15" font-size="10" text-anchor="middle">${esc(boxerInitials_(name))}</text></svg>`;
}

/* AN ADDRESS THAT ALREADY FAILED ON THIS PHONE IS NOT ASKED FOR AGAIN. § */
const BOXER_PIC_DEAD = new Set();

/* THE ADDRESS A CARD MAY SHOW, or nothing. § */
function boxerPicSrc_(b) {
  const src = pic((b && b.image) || '');
  return /^https:\/\//i.test(src) && !!(b && b.imageCredit) && !BOXER_PIC_DEAD.has(src) ? src : '';
}

/* `corner` IS THE FIGHT CARD'S: § */
function boxerPic_(b, corner, won, trunks) {
  const src = boxerPicSrc_(b);
  const frame = `<span class="boxer-frame">${boxerRing_(b.name, corner === 'b', b.look, corner ? trunks : b.trunks, b.sex)}${src
    ? `<img class="boxer-img" src="${esc(src)}" alt="${esc(b.name)}" loading="lazy" decoding="async">` : ''}</span>`;
  if (corner) return `<span class="boxer-pic is-small${src ? '' : ' is-none'}${won ? ' won' : ''}">${frame}</span>`;
  /* THE CREDIT IS A LINE OF ITS OWN UNDER THE PHOTO AND THE NAME, NOT A CAPTION IN THE PHOTO'S COLUMN. § */
  return `<figure class="boxer-pic${src ? '' : ' is-none'}">${frame}</figure>${src
    ? `<p class="boxer-credit">${boxerCredit_(b, b.imageCredit)}</p>` : ''}`;
}

/* ---------- THE CREDIT LINKS TO THE PHOTO'S FILE PAGE § */
const BOXER_COMMONS = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/i;
function boxerCommons_(src) {
  const m = String(src || '').match(BOXER_COMMONS);
  return m ? 'https://commons.wikimedia.org/wiki/File:' + m[1] : '';
}
/* `data-src` IS THE ADDRESS THE CREDIT IS FOR, so a picture that fails takes its own credit away
   and leaves another's — the fight card has two (`boxerPicFail_`). */
function boxerCredit_(b, text) {
  const src = boxerPicSrc_(b), page = boxerCommons_(src);
  return /^https:\/\/commons\.wikimedia\.org\//.test(page)
    ? `<a class="boxer-src" data-src="${esc(src)}" href="${esc(page)}" target="_blank" rel="noopener">${esc(text)}</a>`
    : `<span class="boxer-src" data-src="${esc(src)}">${esc(text)}</span>`;
}

/* A PICTURE THAT DID NOT COME LEAVES THE RING. § */
function boxerPicFail_(img) {
  if (!img || !img.parentNode) return;
  BOXER_PIC_DEAD.add(img.getAttribute('src') || '');
  const fig = img.closest('.boxer-pic');
  const card = img.closest('.card');
  img.remove();
  if (fig) fig.classList.add('is-none');
  /* THE CREDIT FOR THIS PICTURE GOES, BY ITS ADDRESS — on the profile it is the line under the photo, on a fight card one of two, so it is found by `data-src` § */
  if (card) card.querySelectorAll('.boxer-credit [data-src], .fight-credit [data-src]').forEach(el => {
    if (el.getAttribute('data-src') === img.getAttribute('src')) el.remove();
  });
  if (card) card.querySelectorAll('.boxer-credit, .fight-credit').forEach(line => {
    if (!line.querySelector('[data-src]')) line.remove();
  });
}
document.addEventListener('error', e => {
  const el = e.target;
  if (el && el.matches && el.matches('img.boxer-img')) boxerPicFail_(el);
}, true);

/* ---------- WHAT HE IS NOW, AND THE YEARS THAT GO WITH IT § */
function boxerStatus_(b) {
  const s = norm(b.status), y = v => (String(v || '').match(/\d{4}/) || [''])[0];
  if (s === 'active') return { k: 'is-active', t: 'Active' + (y(b.activeFrom) ? ' · since ' + y(b.activeFrom) : '') };
  if (s === 'retired') return { k: 'is-retired', t: 'Retired' + (y(b.activeTo) ? ' · ' + y(b.activeTo) : '') };
  if (s === 'deceased') {
    const born = y(b.dob), died = y(b.dod);
    return { k: 'is-dead', t: 'Deceased' + (born && died ? ' · ' + born + '–' + died : died ? ' · ' + died : '') };
  }
  return b.status ? { k: '', t: b.status } : null;
}

/* ---------- THE RECORD § */
/* ---------- A NOTE TO THE EDITOR IS NOT A NOTE TO THE READER § */
const BOXER_EDITOR_NOTE = /\bcheck(ing)?\b/i;
function boxerNote_(b) {
  const s = String((b && b.notes) || '').trim();
  return s && !BOXER_EDITOR_NOTE.test(s) ? s : '';
}
function boxerRecord_(b) {
  const has = v => typeof v === 'number' && isFinite(v);
  if (!has(b.wins) && !has(b.losses) && !has(b.draws)) {
    return '<section class="boxer-rec is-none"><p class="fc-note">No fight record on file yet.</p></section>';
  }
  const W = b.wins || 0, L = b.losses || 0, D = b.draws || 0, NC = b.noContests || 0;
  const cols = [
    { k: 'w', n: W, label: W === 1 ? 'Win' : 'Wins', ko: has(b.winsKo) && W ? b.winsKo : null },
    { k: 'l', n: L, label: L === 1 ? 'Loss' : 'Losses', ko: has(b.lossesKo) && L ? b.lossesKo : null },
    { k: 'd', n: D, label: D === 1 ? 'Draw' : 'Draws', ko: null },
  ].concat(NC ? [{ k: 'nc', n: NC, label: 'NC', say: NC === 1 ? 'no contest' : 'no contests', ko: null }] : []);
  /* `NC` ON THE SCOREBOARD, because "NO CONTEST" in the label's capitals is wider than a quarter of a
     320px card; the words are what a screen reader hears. */
  const said = cols.map(c => c.n + ' ' + (c.say || c.label.toLowerCase())).join(', ');
  const bar = boxerSplit_(cols);
  const fights = W + L + D + NC;
  const koRate = W && has(b.winsKo) ? Math.round(b.winsKo / W * 100) : null;
  /* THE DATE THE COUNT WAS TAKEN, FOR A FIGHTER STILL FIGHTING. § */
  const asOf = norm(b.status) === 'active' && b.recordAsOf ? 'Record as of ' + boxerDate_(b.recordAsOf) : '';
  const line = [koRate != null ? 'KO rate ' + koRate + '%' : '',
                fights + (fights === 1 ? ' fight' : ' fights')].filter(Boolean).join(' · ');
  return `<section class="boxer-rec" aria-label="Record: ${esc(said)}">
    <div class="boxer-tally">${cols.map(c => `<div class="boxer-n is-${c.k}${c.n ? '' : ' is-zero'}"><b>${c.n}</b><span class="boxer-k">${
      c.label}</span>${c.ko != null ? `<span class="boxer-ko">${c.ko} KO</span>` : ''}</div>`).join('')}</div>
    ${bar.length ? `<svg class="boxer-bar" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true">${
      bar.map(s => `<rect class="is-${s.k}" x="${s.x}" y="0" width="${s.w}" height="4"/>`).join('')}</svg>` : ''}
    <p class="fc-meta boxer-line">${esc(line)}</p>
    ${asOf || boxerNote_(b) ? `<p class="fc-note">${esc([asOf, boxerNote_(b)].filter(Boolean).join(' · '))}</p>` : ''}
  </section>`;
}

/* ---------- THE WEIGHTS HE BOXED AT, SAID IN ONE LINE WHEN THERE ARE MANY § */
const BOXER_LADDER = [
  ['minimumweight', 'strawweight', 'mini flyweight', 'atomweight'], ['light flyweight', 'junior flyweight'],
  ['flyweight'], ['super flyweight', 'junior bantamweight'], ['bantamweight'],
  ['super bantamweight', 'junior featherweight'], ['featherweight'], ['super featherweight', 'junior lightweight'],
  ['lightweight'], ['light welterweight', 'super lightweight', 'junior welterweight'], ['welterweight'],
  ['light middleweight', 'super welterweight', 'junior middleweight'], ['middleweight'], ['super middleweight'],
  ['light heavyweight'], ['cruiserweight', 'junior heavyweight'], ['bridgerweight'], ['heavyweight']];
const boxerRung_ = w => BOXER_LADDER.findIndex(r => r.indexOf(norm(w)) >= 0);
function boxerWeights_(list) {
  if (list.length < 2) return list[0] || '';
  if (list.length <= 3) return list.join(', ');
  const ranked = list.every(w => boxerRung_(w) >= 0)
    ? list.slice().sort((p, q) => boxerRung_(p) - boxerRung_(q)) : list;
  return list.length + ' · ' + ranked[0] + ' → ' + ranked[ranked.length - 1];
}

/* ---------- THE TALE OF THE TAPE § */
function boxerTape_(b) {
  const dead = !!b.dod || norm(b.status) === 'deceased';
  const born = [boxerDate_(b.dob), b.bornIn].filter(Boolean).join(' · ');
  const reached = b.dod ? boxerAge_(b.dob, b.dod) : null;
  const age = dead ? null : boxerAge_(b.dob, new Date());
  const y = v => (String(v || '').match(/\d{4}/) || [''])[0];
  const from = y(b.activeFrom), to = y(b.activeTo);
  const career = from && to ? from + '–' + to : from ? 'since ' + from : to ? 'to ' + to : '';
  const weights = String(b.divisions || '').split(/[|,;]/).map(s => s.trim()).filter(Boolean);
  const rows = [
    ['Age', age != null ? String(age) : ''],
    ['Born', born],
    ['Died', b.dod ? boxerDate_(b.dod) + (reached != null ? ' · aged ' + reached : '') : ''],
    ['Height', boxerCm_(b.heightCm, true)],
    ['Reach', boxerCm_(b.reachCm, false)],
    ['Stance', b.stance],
    /* EVERY WEIGHT HE BOXED AT, ONLY WHEN THERE WAS MORE THAN ONE — the one he is known at is under
       his name already, and a tape row repeating it is the same fact twice on one card. */
    [weights.length > 1 ? 'Weights' : 'Weight', weights.length > 1 ? boxerWeights_(weights) : (!b.bestDivision && weights[0]) || ''],
    ['Career', career],
    ['Trainer', b.trainer],
    ['Promoter', b.promoter],
    ['Ranked', b.ringRank],
  ].filter(r => r[1]);
  if (!rows.length) return '';
  return `<section class="fc-sec boxer-tape"><h4>Tale of the tape</h4>
    <dl>${rows.map(r => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
  </section>`;
}

/* ---------- THE BELTS AND THE HONOURS § */
function boxerTitles_(b) {
  const badges = (b.hallOfFame ? '<li class="is-hof">Hall of Fame</li>' : '')
               + (b.lineal ? '<li>Lineal champion</li>' : '');
  if (!b.worldTitles && !badges) return '';
  /* THE BADGES RIDE ON THE HEADING'S LINE, at its right, the way a broadcast pins "HALL OF FAME" to the corner of a fighter's caption. § */
  return `<section class="fc-sec boxer-titles"><div class="boxer-titles-head"><h4>${b.worldTitles ? 'Titles' : 'Honours'}</h4>${
    badges ? `<ul class="boxer-badges">${badges}</ul>` : ''}</div>
    ${b.worldTitles ? `<p class="boxer-belt">${esc(b.worldTitles)}</p>` : ''}
  </section>`;
}

/* WHO HE BEAT AND WHO BEAT HIM, as names: two rows of chips under one heading, the won ones edged
   in the win colour and the lost ones in the loss colour, so the two lists are told apart before
   their labels are read. */
function boxerNotable_(b) {
  const won = boxerNames_(b.notableWins), lost = boxerNames_(b.notableLosses);
  if (!won.length && !lost.length) return '';
  const row = (label, k, names) => names.length ? `<div class="boxer-vs is-${k}"><span class="boxer-vs-k">${
    label}</span><ul class="boxer-names">${names.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>` : '';
  return `<section class="fc-sec boxer-notable"><h4>Notable fights</h4>${row('Beat', 'w', won)}${row('Lost to', 'l', lost)}</section>`;
}

/* ---------- THE BOUTS ON FILE § */
const BOXER_BOUTS_PAGE = 7;
function boxerBoutList_(b, n) {
  const bouts = boxerBouts_(b);
  if (!bouts.length) return '';
  const page = n || 1, from = (page - 1) * BOXER_BOUTS_PAGE;
  const here = bouts.slice(from, from + BOXER_BOUTS_PAGE);
  if (!here.length) return '';
  /* THE COUNT IS THE WHOLE FILE'S, and a page that holds part of it says which part. */
  const count = bouts.length > BOXER_BOUTS_PAGE
    ? (from + 1) + '–' + (from + here.length) + ' of ' + bouts.length : String(bouts.length);
  const word = { W: 'Won', L: 'Lost', D: 'Drew', NC: 'No contest' };
  return `<section class="fc-sec boxer-bouts"><h4>Fights on file · ${count}</h4>
    <ul>${here.map(o => `<li class="is-${o.res.toLowerCase()}"><span class="boxer-res" aria-hidden="true">${
      o.res}</span><span class="boxer-say">${word[o.res]}, </span><span class="boxer-opp">${esc(o.opp || 'Unknown')}</span><span class="boxer-how">${
      esc([boxerHow_(o.f), boxerDate_(o.f.date)].filter(Boolean).join(' · '))}${o.f.titles
      ? `<span class="boxer-tt" title="${esc(o.f.titles)}">title</span>` : ''}</span></li>`).join('')}</ul>
  </section>`;
}

function boxerCard_(x) {
  const b = x.row || {};
  const flag = boxerFlag_(b.country);
  /* COUNTRY, THEN THE WEIGHT HE IS KNOWN AT, ONE LINE EACH. § */
  const where = (b.country ? `<span class="boxer-country">${flag ? `<span class="boxer-flag" aria-hidden="true">${flag}</span>` : ''}${
    esc(b.country)}</span>` : '') + (b.bestDivision ? `<span class="boxer-weight">${esc(b.bestDivision)}</span>` : '');
  const st = boxerStatus_(b);
  /* `.boxer-rec` IS STILL THE RECORD'S NAME, on the whole record box now rather than on one gold line. § */
  return `<div class="card fc boxer">
    <div class="fc-head">
      <h3>${esc(b.name || x.name)}${b.nickname ? `<span class="boxer-nick">“${esc(b.nickname)}”</span>` : ''}</h3>
    </div>
    ${tagRow_(x)}
    ${where ? `<p class="sub boxer-from">${where}</p>` : ''}
    ${st ? `<p class="boxer-status ${st.k}">${esc(st.t)}</p>` : ''}
    ${boxerPic_(b)}
    ${boxerRecord_(b)}
    ${boxerTape_(b)}
    ${boxerTitles_(b)}
  </div>`;
}

/* ---------- HIS FIGHTS, THE PAGE AFTER HIS CARD § */
function boxerHasFights_(b) {
  return !!b && (boxerNames_(b.notableWins).length > 0 || boxerNames_(b.notableLosses).length > 0
                 || boxerBouts_(b).length > 0);
}
/* ---------- AND AS MANY PAGES OF THEM AS IT TAKES, SEVEN BOUTS A PAGE § */
function boxerFightPages_(b) {
  if (!boxerHasFights_(b)) return [];
  const n = Math.max(1, Math.ceil(boxerBouts_(b).length / BOXER_BOUTS_PAGE));
  return Array.from({ length: n }, (_, i) => i ? 'fights' + (i + 1) : 'fights');
}
/* HEADED WITH WHOSE PAGE IT IS, as every part page is — `.fc-kick` and then the page's own `h3` — because it is somewhere you can land from a flick four results § */
function boxerPart_(x, part) {
  const b = x.row || {};
  const m = /^fights(\d*)$/.exec(String(part || ''));
  if (!m) return '';
  const n = Number(m[1] || 1);
  return `<div class="card fc prac-part boxer is-fights">
    <p class="fc-kick">${esc(b.name || x.name)}</p><h3>${n > 1 ? 'Fights, continued' : 'Fights'}</h3>
    ${n === 1 ? boxerNotable_(b) : ''}
    ${boxerBoutList_(b, n)}
  </div>`;
}


/* A COLUMN VECTOR AS TYPED ON THE KEYPAD (`⟮5,-4⟯`, 385) DRAWN TOP OVER BOTTOM in one pair of brackets -- the box, the card, Saved */
function vecHtml_(html) {
  return String(html == null ? '' : html).replace(/\u27ee([^\u27ee\u27ef,]*),([^\u27ee\u27ef]*)\u27ef/g,
    '<span class="vec"><span class="vec-a">$1</span><span class="vec-b">$2</span></span>');
}
/* `typeset_` — A FRACTION IS DRAWN OVER ITS LINE, AND A POWER IS RAISED. § */
function typeset_(html) {
  let s = String(html == null ? '' : html);
  if (s.indexOf('\u27ee') !== -1) s = vecHtml_(s);
  /* NOTHING TO DO IS THE COMMON CASE -- most of the library is prose -- so it is the first thing
     asked, before a regex is built or a tag is read. */
  if (s.indexOf('^') === -1 && !/&frasl;|\u2044|&#8260;/.test(s)) return s;

  /* AN ELEMENT A TERM MAY BE MADE OF. `<p>` and `<li>` are not -- they are where a term ends. */
  const INLINE = /^(i|b|em|strong|sup|sub|span|u|var|small)$/;
  /* ENTITIES THAT ARE OPERATORS OR SPACES, so a term stops at them. Everything else written as an
     entity -- &radic;, &pi;, &deg;, &theta; -- is part of the number it touches. */
  const OP = /^(minus|times|divide|plusmn|middot|cdot|sdot|nbsp|ensp|emsp|thinsp|mdash|ndash|frasl|lt|gt|le|ge|ne|asymp|equiv|approx|rarr|larr|harr|rArr|hellip|amp|quot|lsquo|rsquo|ldquo|rdquo|there4|#8260|#8722|#160)$/;
  /* A CHARACTER A TERM MAY BE MADE OF: § */
  const ATOM = /[0-9A-Za-z\u00b0\u00b2\u00b3\u00b9\u00bc-\u00be\u0307\u0370-\u03ff\u2070-\u209f\u2032\u2033\u2150-\u215e\u221a\u221e]/;
  const PAIR = { '(': ')', '[': ']', '{': '}' }, BACK = { ')': '(', ']': '[', '}': '{' };
  const FN = /^(sin|cos|tan|log|ln|lg|exp)$/;

  /* WHERE A POSITION SITS: inside a tag, inside an <svg>, and how many <sup>/<sub> deep. Read from
     the start each time, because the string changes under it as fractions are drawn. */
  const where = p => {
    const re = /<(\/?)([a-zA-Z][\w-]*)[^>]*>/g;
    let m, deep = 0, raw = 0;
    while ((m = re.exec(s)) && m.index < p) {
      if (p < m.index + m[0].length) return { tag: true, deep: deep, raw: raw > 0 };
      const n = m[2].toLowerCase(), by = m[1] ? -1 : (/\/>$/.test(m[0]) ? 0 : 1);
      if (n === 'sup' || n === 'sub') deep += by;
      if (n === 'svg' || n === 'math' || n === 'script' || n === 'style') raw += by;
    }
    return { tag: false, deep: deep, raw: raw > 0 };
  };
  /* THE ELEMENT CLOSING AT `end` (just past `</name>`): where its own opening tag starts. Counted,
     not matched, because a numerator holds superscripts of its own -- d<sup>2</sup>y. */
  const openOf = (end, name) => {
    const re = new RegExp('<(/?)' + name + '\\b[^>]*>', 'gi'), all = [];
    let m;
    while ((m = re.exec(s)) && m.index < end) all.push(m);
    for (let k = all.length - 1, d = 0; k >= 0; k--) {
      d += all[k][1] ? 1 : -1;
      if (d === 0) return all[k].index;
    }
    return -1;
  };
  /* AND THE OTHER WAY: the element opening at `at`, and just past its closing tag. */
  const shutOf = (at, name) => {
    const re = new RegExp('<(/?)' + name + '\\b[^>]*>', 'gi');
    re.lastIndex = at;
    for (let m, d = 0; (m = re.exec(s));) {
      d += m[1] ? -1 : 1;
      if (d === 0) return m.index + m[0].length;
    }
    return -1;
  };
  /* BRACKETS, counted in the text and stepping over tags, on any string -- `bare` asks it of an
     operand rather than of the whole. */
  const brFwd = (t, at) => {
    const o = t[at], c = PAIR[o];
    for (let i = at, d = 0; i < t.length; i++) {
      if (t[i] === '<') { const g = t.indexOf('>', i); if (g < 0) return -1; i = g; continue; }
      if (t[i] === o) d++;
      else if (t[i] === c && --d === 0) return i;
    }
    return -1;
  };
  const brBack = at => {
    const c = s[at], o = BACK[c];
    for (let i = at, d = 0; i >= 0; i--) {
      if (s[i] === '>') { const l = s.lastIndexOf('<', i); if (l < 0) return -1; i = l; continue; }
      if (s[i] === c) d++;
      else if (s[i] === o && --d === 0) return i;
    }
    return -1;
  };
  /* THE TERM ENDING AT `end`, read leftwards: elements, bracket groups, entities that are not
     operators, and the characters above, until a space or an operator. Returns where it starts. */
  const termBack = end => {
    let i = end;
    while (i > 0) {
      const c = s[i - 1];
      if (c === '>') {
        const l = s.lastIndexOf('<', i - 1), t = /^<\/([a-zA-Z]\w*)>$/.exec(s.slice(l, i));
        if (!t || !INLINE.test(t[1].toLowerCase())) break;
        const o = openOf(i, t[1].toLowerCase());
        if (o < 0) break;
        i = o;
      } else if (BACK[c]) {
        const o = brBack(i - 1);
        if (o < 0) break;
        i = o;
      } else if (c === ';') {
        const a = s.lastIndexOf('&', i - 1), e = a < 0 ? null : /^&(#?\w+);$/.exec(s.slice(a, i));
        if (!e || OP.test(e[1])) break;
        i = a;
      } else if (c === '.' && /\d/.test(s[i - 2] || '') && /\d/.test(s[i] || '')) {
        i--;
      } else if (ATOM.test(c)) {
        i--;
      } else break;
    }
    return i;
  };
  /* AND THE TERM STARTING AT `from`, read rightwards. Returns where it ends. */
  const TAG = /<([a-zA-Z]\w*)\b[^>]*>/y;
  const termFwd = from => {
    let i = from;
    while (i < s.length) {
      const c = s[i];
      if (c === '<') {
        TAG.lastIndex = i;
        const t = TAG.exec(s);
        if (!t || !INLINE.test(t[1].toLowerCase())) break;
        const z = shutOf(i, t[1].toLowerCase());
        if (z < 0) break;
        i = z;
      } else if (PAIR[c]) {
        const z = brFwd(s, i);
        if (z < 0) break;
        i = z + 1;
      } else if (c === '&') {
        const e = /^&(#?\w+);/.exec(s.slice(i, i + 12));
        if (!e || OP.test(e[1])) break;
        i += e[0].length;
      } else if (c === '.' && /\d/.test(s[i - 1] || '') && /\d/.test(s[i + 1] || '')) {
        i++;
      } else if (ATOM.test(c)) {
        i++;
      } else break;
    }
    return i;
  };
  const GAP = /^(?:\s|&nbsp;)+/;
  const gapBack = at => {
    let i = at;
    for (;;) {
      if (i > 0 && /\s/.test(s[i - 1])) i--;
      else if (s.slice(i - 6, i) === '&nbsp;') i -= 6;
      else return i;
    }
  };
  const bare = t => {
    const u = t.replace(/^(?:\s|&nbsp;)+|(?:\s|&nbsp;)+$/g, '');
    return u[0] === '(' && brFwd(u, 0) === u.length - 1 ? u.slice(1, -1) : u;
  };
  const stack = (n, d) => '<span class="frac"><span class="frac-n">' + bare(n)
    + '</span><span class="frac-s">/</span><span class="frac-d">' + bare(d) + '</span></span>';

  /* ---------- POWERS FIRST, so `x^(5/2)` is a power before anything looks at its slash ---------- */
  for (let from = 0; ;) {
    const p = s.indexOf('^', from);
    if (p === -1) break;
    from = p + 1;
    const w = where(p);
    if (w.tag || w.raw) continue;
    let exp = '', end = p + 1;
    if (PAIR[s[p + 1]]) {
      const z = brFwd(s, p + 1);
      if (z < 0) continue;
      exp = s.slice(p + 2, z);
      end = z + 1;
    } else {
      const t = /^(?:-|&minus;|\u2212|\+)?(?:\d+(?:\.\d+)?|[A-Za-z\u0370-\u03ff]+|[\u00bc-\u00be\u2150-\u215e]|<i>[^<]*<\/i>)/
        .exec(s.slice(p + 1, p + 40));
      if (!t) continue;
      exp = t[0];
      end = p + 1 + t[0].length;
    }
    if (!exp.trim()) continue;
    /* A HYPHEN IN AN INDEX IS A MINUS SIGN, and set as one: 4<sup>−2</sup>, not 4<sup>-2</sup>. */
    s = s.slice(0, p) + '<sup>' + exp.replace(/^-/, '&minus;') + '</sup>' + s.slice(end);
    from = p;
  }

  /* ---------- THEN EVERY FRACTION SLASH, left to right -------------------------------------------- */
  const SL = /&frasl;|\u2044|&#8260;/g;
  for (let from = 0; ;) {
    SL.lastIndex = from;
    const m = SL.exec(s);
    if (!m) break;
    const p = m.index, q = p + m[0].length;
    from = q;
    const w = where(p);
    if (w.tag || w.raw || w.deep) continue;
    /* THE TOP. */
    const le = gapBack(p);
    let ls = termBack(le), whole = '', num;
    if (ls === le) continue;
    if (s.slice(le - 6, le) === '</sup>') {
      const o = openOf(le, 'sup');
      const pre = s.slice(ls, o), inner = s.slice(s.indexOf('>', o) + 1, le - 6);
      if (!pre) num = inner;
      else if (/^\(?\d+\)?$/.test(pre)) { whole = pre; num = inner; }
      else num = s.slice(ls, le);
    } else {
      const f = /(sin|cos|tan|log|ln|lg|exp)(?:\s|&nbsp;)+$/.exec(s.slice(0, ls));
      if (f && !/[A-Za-z]/.test(s[f.index - 1] || '')) ls = f.index;
      num = s.slice(ls, le);
    }
    /* THE BOTTOM. */
    const g = GAP.exec(s.slice(q, q + 40));
    const rs = q + (g ? g[0].length : 0);
    let re, den;
    if (/^<sub\b/i.test(s.slice(rs, rs + 5))) {
      re = shutOf(rs, 'sub');
      if (re < 0) continue;
      den = s.slice(s.indexOf('>', rs) + 1, re - 6);
    } else {
      re = termFwd(rs);
      if (re === rs) continue;
      if (FN.test(s.slice(rs, re))) {
        const h = GAP.exec(s.slice(re, re + 40));
        const more = h ? termFwd(re + h[0].length) : re;
        if (h && more > re + h[0].length) re = more;
      }
      den = s.slice(rs, re);
    }
    const out = whole ? '<span class="frac-mixed">' + whole + stack(num, den) + '</span>' : stack(num, den);
    s = s.slice(0, ls) + out + s.slice(re);
    /* FROM WHERE THIS ONE STARTED, not after it: a fraction inside its numerator was inside a
       <sup> a moment ago and skipped as an index, and it is in a span now and should be drawn. */
    from = ls;
  }
  return s;
}


/* ---------- THE ANSWER: SHOWN, THEN SPLIT BY WHO WAS READING, AND NOW ONE PAGE FOR EVERYBODY § */
/* ---------- THE RESULT, AND THE REASON FOR IT, AS TWO THINGS § */
function answerParts_(raw) {
  const s = String(raw || '');
  const DASH = /\s+(?:—|–|&mdash;|&ndash;|&#8212;|&#8211;)\s+/g;
  const VOID = /^(?:br|img|hr|wbr|input)$/i;
  const BLOCK = /^(?:table|thead|tbody|tfoot|tr|td|th|ul|ol|li|dl|dt|dd|div|figure)$/i;
  const CODE = '(?:[BMAPC][1-5]|SC[1-5]?|cao|oe|ft|isw|awrt)';
  const RUN = new RegExp('(?:<b>)?\\(?\\b' + CODE + '\\b\\)?(?:</b>)?(?:[\\s,]+(?:<b>)?\\(?\\b' + CODE
    + '\\b\\)?(?:</b>)?)*', 'g');
  const seen = t => String(t).replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;/g, ' ').trim();
  let head = s, why = '', m;
  while ((m = DASH.exec(s))) {
    const before = s.slice(0, m.index);
    const open = [];
    const T = /<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi;
    let t;
    while ((t = T.exec(before))) {
      const name = t[2].toLowerCase();
      if (VOID.test(name)) continue;
      if (t[1]) {
        const k = open.map(o => o[0]).lastIndexOf(name);
        if (k >= 0) open.splice(k);
      } else open.push([name, t[0]]);
    }
    if (open.some(o => BLOCK.test(o[0]))) continue;
    if (!seen(before)) continue;
    head = before + open.slice().reverse().map(o => '</' + o[0] + '>').join('');
    why = open.map(o => o[1]).join('') + s.slice(m.index + m[0].length);
    break;
  }
  /* THE HEAD: every code, wherever it stands, and the commas it leaves behind. § */
  head = head.replace(/\s+(?:\(\d(?: marks?)?\)|\[\d\])|\s*✓/g, '');
  /* AN ENTITY'S OWN SEMICOLON IS NOT PUNCTUATION. The first version of `tidy` took the `;` off
     `50&deg;` because it ended the head, and drew "50&deg". Entities are parked while it works. */
  const tidy = h => h.replace(/&(#?\w+);/g, '&$1\u0001').replace(/<(b|i|em|strong)>\s*<\/\1>/g, '')
    .replace(/[ \t]+([,;.])/g, '$1').replace(/([,;])(?:\s*[,;])+/g, '$1').replace(/,(\s*[.;])/g, '$1')
    .replace(/[\s,;:]+((?:<\/[a-z]+>)*)\s*$/i, '$1').replace(/^\s*[,;]\s*/, '').trim()
    .replace(/\u0001/g, ';');
  const bare = tidy(head.replace(RUN, ''));
  /* AN ANSWER THAT IS NOTHING BUT CODES ("B1 — and the scheme accepts 8 or −8") would be drawn as
     an empty line with the meaning behind the fold, which is worse than leaving the codes in. */
  if (seen(bare)) head = bare;
  /* THE WHY: only the codes that stand alone. § */
  const KEEP_AFTER = /^[\s,]*(?:for\b|dependent\b|following\b|follows\b|is\b|mark|on\b|&rdquo;|”)/i;
  const KEEP_BEFORE = /(?:\b(?:the|a|an|its|that|this|of)\s+(?:<b>)?|&ldquo;|“)$/i;
  why = why.replace(RUN, (run, at, all) =>
    (KEEP_AFTER.test(all.slice(at + run.length, at + run.length + 16))
      || KEEP_BEFORE.test(all.slice(Math.max(0, at - 12), at))) ? run : '\u0002');
  const cap = (a, c) => a + (c || '').toUpperCase();
  why = why
    /* "— B1, cao, and nothing else scores" -- a code opening the why, or a sentence. FIRST, or
       "= 3. B1 cao. The" is read as a code closing a clause and comes out "= 3.. The". */
    .replace(/^(\s*(?:<[^>]+>)*)\u0002[\s,;:.]*(?:and\s+)?((?:[a-z](?=[a-z]))?)/, (w, a, c) => cap(a, c))
    .replace(/([.!?]\s+(?:<[^>]+>)*)\u0002[\s,;:.]*(?:and\s+)?((?:[a-z](?=[a-z]))?)/g, (w, a, c) => cap(a, c))
    /* "36, cao." -- a code closing a clause takes its comma with it. */
    .replace(/[\s,;]*\u0002[\s,;]*(?=[.!?]|$)/g, '')
    .replace(/\s*\u0002[\s,;]*/g, ' ');
  why = tidy(why);
  /* A WHY THAT STARTS MID-SENTENCE starts with a capital in the fold, which is a box of its own.
     A WORD, not a letter: "<i>x</i> = 3 is a vertical line" must not become "X = 3". */
  why = why.replace(/^((?:\s*<[a-z][^>]*>)*\s*)([a-z])(?=[a-z])/, (w, tags, c) => tags + c.toUpperCase());
  return { head: head, why: seen(why) ? why : '' };
}

function answerBlock_(x) {
  if (!x || !String(x.answer || '').trim()) return '';
  /* WHO MAY SEE THIS IS NOT DECIDED HERE. `questionAnsCard_` asks `ansOpen_` before it draws any of
     this, so a page that has not been shown holds no answer to find. */
  /* WHAT KIND OF ANSWER IT IS, over the result, when the sheet says -- "ANSWER · EXPLAIN" in the
     small capitals the answer box's "YOUR ANSWER" wears on the question card. */
  const kind = String(x.answerType || '').trim();
  /* ---------- THE ANSWER, AND NOTHING ELSE § */
  const p = answerParts_(x.answer);
  return `<div class="qans">
    <span class="qans-head">Answer${kind ? ` &middot; ${esc(kind)}` : ''}</span>
    <div class="qans-body">${typeset_(p.head)}</div>
  </div>`;
}

/* OPENING ONE SHOWS THE STEM, THE LEAD AND THE PART — in that order, because that is the order it is printed and because a part without them cannot be answered. § */
/* ---------- `on('question')` WAS HERE § */

/* ---------- WHAT A PART IS CALLED § */
/* WHOLE NUMERAL FIRST, so "iv" is four and not letter i followed by v. Trying letter-then-numeral
   first would match that greedily and be wrong on exactly the parts nobody checks. */
const ROMAN_ONLY = /^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;
const LETTER_ROMAN = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;

function qPartBits_(part) {
  const s = String(part == null ? '' : part).trim();
  if (!s) return null;
  if (ROMAN_ONLY.test(s)) return { letter: '', roman: s };
  const m = s.match(LETTER_ROMAN);
  return m ? { letter: m[1], roman: m[2] } : null;
}

/* The name on a card: Q1.1 · Q5b · Q5a(i) · Q1.3(i) § */
const NUM_ROMAN = /^(\d+)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;
function qPartName_(part) {
  const s = String(part == null ? '' : part).trim();
  if (!s) return '';
  if (/^\d+$/.test(s)) return '.' + s;
  const n = NUM_ROMAN.exec(s);
  if (n) return '.' + n[1] + '(' + n[2].toLowerCase() + ')';
  const b = qPartBits_(s);
  return b ? b.letter + '(' + b.roman + ')' : s;
}

/* `qPartShow_` WAS HERE — the marker down the left of an open question, "1) · b) · a(i)". § */

/* ---------- ONE READER FOR THE PAPER'S ID § */
function paperIdOf_(r) {
  return (r && (r.paperId || r.paper_id || r.paper)) || '';
}

/* ---------- THE ORDER OF A QUESTION'S PARTS, DECIDED FOR THE WHOLE QUESTION AT ONCE § */
const romanVal_ = s => {
  const v = { i: 1, v: 5, x: 10 };
  let n = 0;
  for (let k = 0; k < s.length; k++) {
    const a = v[s[k]] || 0, b = v[s[k + 1]] || 0;
    n += a < b ? -a : a;
  }
  return n;
};
const partBare_ = p => String(p == null ? '' : p).trim().toLowerCase().replace(/[()\s]/g, '');
function partKeyOf_(part, numerals) {
  const s = partBare_(part);
  if (!s) return '';
  if (/^\d+$/.test(s)) return padNums_(s);
  if (numerals && ROMAN_ONLY.test(s)) return padNums_(String(romanVal_(s)));
  /* `3ix` after `3v`, by value — as letters "ix" sorts first. */
  const n = NUM_ROMAN.exec(s);
  if (n) return padNums_(n[1]) + padNums_(String(romanVal_(n[2].toLowerCase())));
  const m = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
  if (m) return m[1] + (m[2] ? padNums_(String(romanVal_(m[2]))) : '');
  return padNums_(s);
}
/* THE DECISION ITSELF, ONE PER QUESTION AND KEYED BY THE ROW: § */
function partNumerals_(rows) {
  const by = {};
  (rows || []).forEach(r => {
    if (!r || r.kind === 'preamble' || r.kind === 'document') return;
    const k = paperIdOf_(r) + '|' + (r.q == null ? '' : r.q);
    (by[k] = by[k] || []).push(r);
  });
  const out = new Map();
  Object.keys(by).forEach(k => {
    const list = by[k];
    const numerals = list.every(r => { const s = partBare_(r.part); return !s || ROMAN_ONLY.test(s); });
    list.forEach(r => out.set(r, numerals));
  });
  return out;
}
function partKeys_(rows) {
  const numerals = partNumerals_(rows);
  const out = new Map();
  numerals.forEach((n, r) => out.set(r, partKeyOf_(r.part, n)));
  return out;
}

/* ---------- A PART, TAKEN APART FOR ITS TAGS: `ai` IS [a] [ii] § */
/* AN ITEM'S SPLIT: the one `questionItems` worked out with its question's numeral decision, or -- for an item built anywhere else, a harness's or a kept copy's § */
const qSplitOf_ = x => (x && x.kind === 'question'
  && (x.qSplit || partSplit_(x.qPart, true))) || { part: '', sub: '' };
function partSplit_(part, numerals) {
  const s = partBare_(part);
  if (!s) return { part: '', sub: '' };
  if (/^\d+$/.test(s)) return { part: '.' + Number(s), sub: '' };
  if (numerals && ROMAN_ONLY.test(s)) return { part: '', sub: s };
  const n = NUM_ROMAN.exec(s);
  if (n) return { part: '.' + Number(n[1]), sub: n[2] };
  const m = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
  return m ? { part: m[1], sub: m[2] || '' } : null;
}

/* ---------- WHAT A QUESTION IS ABOUT, AS WORDS § */
/* THE PUBLISHER'S NAME IN BOTH SPELLINGS, because the file holds one and people type the other. § */
function companyAtoms_(v) {
  const said = String(v || '').trim();
  if (!said) return '';
  const key = spellKey_(said);
  return key && key !== said.toLowerCase() ? said + ' ' + key : said;
}

/* ---------- THE CODE PRINTED ON THE COVER, WHICH THE SEARCH BOX COULD NOT SEE § */
/* THE CODE IS A FACT ABOUT THE PAPER, so it is read off the paper's own row rather than copied onto every question under it. § */
function specIndex_() {
  const rows = libDocRows_();
  const at = {};
  rows.forEach(r => {
    if (!libIsDoc_(r)) return;
    const pid = paperIdOf_(r);
    const code = String(r.spec_code || (r.row && r.row.spec_code) || '').trim();
    if (pid && code) at[pid] = code;
  });
  return at;
}

function paperCodeAtoms_(row, at) {
  const out = [];
  const spec = String((row && row.spec_code) || (at && at[paperIdOf_(row)]) || '').trim();
  if (spec) { out.push(spec); const k = spellKey_(spec); if (k && k !== spec.toLowerCase()) out.push(k); }
  String((row && row.paper_id) || '').split(/[^A-Za-z0-9]+/).forEach(seg => {
    if (seg.length < 4 || seg.length > 8) return;
    if (!/[A-Za-z]/.test(seg) || !/\d/.test(seg)) return;
    out.push(seg);
  });
  return out.join(' ');
}

/* ---------- MARKUP INTO WORDS, IN ONE PLACE § */
function plainText_(s) {
  return String(s == null ? '' : s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|minus|frasl|deg|pi|times|divide|radic|rsquo|ldquo|rdquo|mdash);/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchText_(r) {
  return plainText_((r && (r.html || '')) + ' ' + (r && (r.lead || '')));
}

/* `practicalText_` — THE GUIDE IS WHAT SOMEBODY IS LOOKING FOR, AND THE SEARCH COULD NOT SEE IT. § */
function practicalText_(p) {
  return plainText_([p.aim, p.outcome, p.science, p.safety, p.feasible, p.venue, p.excluded,
                     p.notes, p.mathsLink, p.specRef, p.hazard,
                     /* THE KIT IS `{name, qty}` NOW AND BOTH HALVES GO IN. § */
                     (p.equipment || []).map(e => e.name + ' ' + e.qty).join(' '),
                     (p.steps || []).join(' '),
                     (p.risks || []).join(' '), (p.variables || []).join(' '),
                     (p.log || []).join(' ')].filter(Boolean).join(' '));
}

/* `projectText_` — `practicalText_`'s move for the projects: § */
/* A COURSEWORK IS LOOKED FOR BY ITS NAMES, whether or not its row happens to say them: § */
/* ---------- THE NAMES A SUBJECT GOES BY IN A TIMETABLE § */
const PROJ_SUBJECT_SAID = { 'Design and Technology': 'DT D&T' };

function projectText_(p) {
  const said = plainText_([p.projectType === 'coursework' ? 'coursework NEA non-exam assessment' : '',
                           PROJ_SUBJECT_SAID[p.subject] || '',
                           p.board, p.specRef, p.summary, p.makes, p.safety, p.share,
                           (p.materials || []).map(e => e.name + ' ' + e.qty).join(' '),
                           (p.steps || []).join(' ')].filter(Boolean).join(' '));
  /* AND EVERY HYPHENATED WORD AGAIN WITHOUT ITS HYPHEN. § */
  const joined = (said.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+/g) || []).map(w => w.replace(/-/g, ''));
  return joined.length ? said + ' ' + joined.join(' ') : said;
}

/* `paperText_` AND ITS MEMO WERE HERE. § */




/* ---------- EVERY PAPER, DERIVED FROM ITS OWN QUESTIONS § */
/* `allTopics()`, `topicBy`, `paperText_`, `paperPages_` AND `paperMismatches()` WERE ALL HERE. § */

/* ---------- ONE ITEM PER PART § */
/* A PREAMBLE IS ONE IDEA AT THREE SCOPES, NOT THREE FEATURES. § */
/* ---------- A SCOPE HOLDS SEVERAL PREAMBLES, AND IT USED TO HOLD EXACTLY ONE § */
/* ---------- AND A FOURTH SCOPE, A LETTER: THE "(d)" OPENING § */
const stemLetter_ = p => { const s = partBare_(p && p.part); return /^[a-z]$/.test(s) ? s : ''; };
function stemIndex_(all) {
  const at = { paper: {}, section: {}, question: {}, letter: {} };
  const put = (bag, key, r) => { (bag[key] || (bag[key] = [])).push(r); };
  all.forEach(r => {
    if (!r || r.kind !== 'preamble') return;
    const pid = paperIdOf_(r);
    if (!pid) return;
    const has = r.q !== undefined && r.q !== null && r.q !== '';
    if (has && stemLetter_(r)) put(at.letter, pid + '|' + r.q + '|' + stemLetter_(r), r);
    else if (has) put(at.question, pid + '|' + r.q, r);
    else if (r.section) put(at.section, pid + '|' + r.section, r);
    else put(at.paper, pid, r);
  });
  /* Stable, because `sort` is stable in every engine this runs on and a preamble with no
     `sort_order` must not be reordered against its neighbours by the sort that exists for the
     ones that do. */
  [at.paper, at.section, at.question, at.letter].forEach(bag => {
    Object.keys(bag).forEach(k => { bag[k].sort((a, b) => (a.order || 0) - (b.order || 0)); });
  });
  return at;
}

/* OUTERMOST FIRST, because that is the order the paper prints them in and the order they have to be read in: § */
function preamble_(r, at) {
  const pid = paperIdOf_(r);
  const out = [];
  /* EACH SCOPE IS A LIST NOW — see `stemIndex_` above for what a single row cost. `|| []` rather
     than a guard, because a scope nothing wrote has no key at all and every caller below already
     handles an empty list. */
  /* A STEM WHOSE WORDS ARE STILL IN THE LEDGER COUNTS (397): `libHasField_` reads `libHas` as well as the field. */
  const add = xs => (xs || []).forEach(x => { if (x && (x.html || x.diagram || libHasField_(x, 'html') || libHasField_(x, 'diagram'))) out.push(x); });
  add(at.paper[pid]);
  if (r.section) add(at.section[pid + '|' + r.section]);
  if (r.q !== undefined && r.q !== null && r.q !== '') {
    add(at.question[pid + '|' + r.q]);
    /* THE PART'S LETTER, read the way a typed reference is (`qRefBits_`): "d(ii)" and "dii" are (d). */
    const bits = qRefBits_(partBare_(r.part));
    if (bits && bits.letter && at.letter) add(at.letter[pid + '|' + r.q + '|' + bits.letter]);
  }
  return out;
}

/* WHAT YOU HAVE TO HAVE IN FRONT OF YOU, FROM THE PAPER AND FROM THE QUESTION. § */
/* ---------- OFF THE FILE, FOR THE REASON `libDocRows_` IS WRITTEN DOWN ONCE § */
function needsIndex_(all) {
  const rows = (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS && LIBRARY_ROWS.length)
    ? LIBRARY_ROWS : (all || []);
  const at = {};
  rows.forEach(r => {
    if (!libIsDoc_(r)) return;
    const pid = paperIdOf_(r);
    if (pid) at[pid] = asList_(String(r.needs || '').split(','));
  });
  return at;
}

/* THE CELL'S CALCULATOR, IN THE WORDS A PERSON SAYS — the value itself, so the button, the chip and the tag agree (396). */
const NEED_WORDS = { 'no calculator': 'Non-calculator', 'calculator': 'Calculator allowed' };
function needsOf_(r, at) {
  const out = [];
  const add = v => { v = NEED_WORDS[String(v || '').trim().toLowerCase()] || v; if (v && out.indexOf(v) === -1) out.push(v); };
  ((at && at[paperIdOf_(r)]) || []).forEach(add);
  asList_(String((r && r.needs) || '').split(',')).forEach(add);
  /* ---------- AND THE PRINTED SHEET, WHICH IS READ RATHER THAN RE-TYPED § */
  if (r && r.needsPrint) add('Printed sheet');
  return out;
}

/* THE SEARCH HAYSTACK FOR ONE QUESTION — see the `text` getter in `questionItems`, which is the
   only caller and the reason this is a function rather than an expression in the object literal. */
function questionText_(r, lead, spec) {
  return searchText_(r) + lead.map(p => ' ' + searchText_(p)).join('')
            + ' ' + topicAtoms_(r.row ? r.row.topics : r.topics).join(' ')
            + ' ' + companyAtoms_(r.row ? r.row.company : r.company)
            /* AND THE CODE ON THE COVER — see `paperCodeAtoms_`. Off the raw file row, because
               `spec_code` and `paper_id` are both columns of it and neither is enumerated onto the
               payload object. */
            + ' ' + paperCodeAtoms_(r.row || r, spec);
}

function questionItems() {
  const all = DATA.questions || [];
  if (!all.length) return [];

  const stems = stemIndex_(all);
  /* BUILT ONCE PER DRAW, not looked up per question — `all` is 4,682 rows and this walks it once.
     Same reason `stemIndex_` is a map rather than a filter inside the loop. */
  const kit = needsIndex_(all);
  /* AND THE CODE ON EACH PAPER'S COVER — see `specIndex_`. Built once per draw, off the file. */
  const spec = specIndex_();
  /* EACH PART'S PLACE IN ITS QUESTION -- see `partKeys_`. */
  const partKey = partKeys_(all), numerals = partNumerals_(all);

  return all.filter(r => r.kind !== 'preamble' && r.kind !== 'document').map(r => {
    const lead = preamble_(r, stems);
    return {
      kind: 'question',
      /* "Q5b" IS THE NAME AND THE PAPER IS THE SUBTITLE. A list of parts all called
         "Paper 31: Statistics — June 2022" is a list nobody can read down. */
      name: 'Q' + r.q + qPartName_(r.part),
      key: 'q:' + r.id,
      sub: r.name || '',
      subject: r.subject || '',
      /* THE SAME DERIVATION `allTopics` DID, and the only one it did: a grade is a band value when
         the band is a grade, and blank when it is a stage. Two ladders, one column. */
      grade: r.bandType === 'grade' ? (r.bandValue || '') : '',
      bandType: r.bandType || '', bandValue: r.bandValue || '',
      keystage: r.keystage || '', tier: r.tier || '',
      examBoard: r.examBoard || '', company: r.company || '',
      documentType: r.documentType || '', examWave: r.examWave || '',
      year: r.year || '',
      /* `paper: true` WAS HERE and it was write-only — see the deleted `Printed?` facet above, which was its one reader. § */
      /* ---------- WHERE THIS QUESTION SITS IN ITS PAPER § */
      qNumber: r.q, qPart: r.part || '', qPartKey: partKey.get(r) || '',
      /* THE PART AS ITS TWO TAGS -- see `partSplit_`. `qPart` stays the raw cell beside it, because the
         sort, `usesAt_`, `qRef` and the checks' fixtures all read the cell. */
      qSplit: partSplit_(r.part, numerals.get(r)),
      /* THE TOPICS, RESOLVED ONCE. § */
      topic: topicOf_({ row: r.row || r }),
      marks: r.marks, section: r.section,
      /* THE WORDS, THE FIGURE AND THE MARK SCHEME — `questionContent_`, so a row whose words come later (397) is given them in place. */
      ...questionContent_(r),
      /* THE SAME SPLIT `topics` AND `keystage` GET — one helper, because a comma is a comma. */
      images: topicAtoms_(r.images || (r.row && r.row.images)),
      /* WHAT TO ANSWER ON when the answer is a mark rather than words -- see `padSurface_`. */
      surface: r.surface || '',
      /* AND WHICH EARLIER PART'S DRAWING IT READS -- see `usesOf_`. */
      uses: r.uses || '',
      /* EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST — see `preamble_`. § */
      stems: lead,
      /* THE STEM'S WORDS TOO. § */
      /* AND THE TOPICS, WHICH THE SEARCH BOX COULD NOT SEE EITHER. § */
      /* ---------- AND WHO PUBLISHED IT, WHICH WAS NEITHER ASKABLE NOR SEARCHABLE § */
      /* ---------- BUILT THE FIRST TIME SOMETHING READS IT, NOT FOR EVERY ROW AT BOOT § */
      get text() {
        const v = questionText_(r, lead, spec);
        Object.defineProperty(this, 'text', { value: v, writable: true, enumerable: true, configurable: true });
        return v;
      },
      /* THE RAW FILE ROW WHERE THERE IS ONE, not the payload object built from it — see the note on `row:` in js/library.js. § */
      /* THE PAPER'S REQUIREMENT AND THE QUESTION'S OWN, already unioned — see `needsOf_`. A list,
         so the facet is multi-valued the way `keystage` is, and so a question can need two things. */
      needs: needsOf_(r, kit),
      row: r.row || r,
    };
  });
}

/* A QUESTION ITEM'S PRIVATE HALF (397): what the Ledger sends, off the mapped row. Spread into the item when it is built,
   and assigned onto it again when the words arrive (`libMerge_`, library.js). */
function questionContent_(r) {
  return {
    lead: r.lead, html: r.html, diagram: r.diagram || '',
    /* THE MARK SCHEME, WHICH THE BACKEND SENT TO NOBODY FOR MONTHS. § */
    answer: r.answer || '', answerType: r.answerType || '',
    /* THE EXPECTED DRAWING AS GEOMETRY, which Check marks the strokes against (366). */
    drawAnswer: r.drawAnswer || '',
    accept: r.accept || '', cells: r.cells || '', markWords: r.markWords || '',
    choices: r.choices || [], choiceRight: r.choiceRight || [],
    /* AN ORDERING'S EVERY RIGHT ORDER AND ITS TWO ENDS -- see `orderBox_` and library.js. */
    choiceWays: r.choiceWays || [], orderEnds: r.orderEnds || [],
    examinerNote: r.examinerNote || '',
  };
}

/* ================= A CARD WHOSE WORDS ARE IN THE LEDGER (397) =================
   Its title and tags, waiting, until `libItems` brings its words; a question comes with its stems and its other parts. */
function libSlim_(x) {
  if (!x) return false;
  if (x.kind === 'question') return libWaits_(x.row) || (x.stems || []).some(p => libWaits_(p));
  if (x.kind === 'practical' || x.kind === 'project' || x.kind === 'content') return libWaits_(x.row);
  return false;
}
function libIdsFor_(x) {
  if (!x || !x.row) return [];
  if (x.kind === 'practical') return ['pr:' + x.row.id];
  if (x.kind === 'project') return ['pj:' + x.row.id];
  if (x.kind === 'content') return ['ct:' + x.row.bookId + '#' + x.row.n];
  if (x.kind !== 'question') return [];
  const rows = [x.row].concat((x.stems || []).map(p => p.row || p));
  const k = qId_(x);
  try { if (k) (questionParts_()[k] || []).forEach(s => rows.push(s.row)); } catch (e) {}
  return [...new Set(rows.filter(libWaits_).map(libWireQ_))];
}
/* ASK FOR ONE CARD'S WORDS (nothing, signed out — the card says so). */
function libWant_(x) { if (libSlim_(x)) libAsk_(libIdsFor_(x)); }
/* AN ITEM BY ITS KEY, off the list both finders are built from — for a merge to give the item its words in place. */
const LIB_ITEMS = new WeakMap();
function libItemByKey_(k) {
  let all;
  try { all = typeof ALL_MEMO !== 'undefined' && ALL_MEMO.items; } catch (e) { all = null; }
  if (!Array.isArray(all)) return null;
  let m = LIB_ITEMS.get(all);
  if (!m) { m = new Map(); all.forEach(x => { if (x && x.key) m.set(x.key, x); }); LIB_ITEMS.set(all, m); }
  return m.get(k) || null;
}
/* WHAT A WAITING CARD SAYS UNDER ITS TAGS: sign in, the dots, or why it did not come and Try again. */
function libSay_(x) {
  if (typeof USER === 'undefined' || !USER || !USER.token) {
    return '<p class="sub lib-sign">Sign in to see this — your account is a few screens to the right.</p>';
  }
  /* A CARD NEWER THAN ITS WORDS (`lib_pending`, docs/library.md): the Ledger has not had them imported yet. */
  if (libIdsFor_(x).some(t => LIB.gone.has(t))) return '<p class="empty">' + (x && x.row && (x.row.pending === true || libTrue(x.row.lib_pending)) ? 'Coming soon.' : 'This one is not in the library yet.') + '</p>';
  if (LIB.failed) {
    return `<p class="empty">Couldn’t load this.<br><span class="faint">${esc(LIB.failed)}</span><br>
      <span class="text-action" data-do="lib-retry">Try again</span></p>`;
  }
  return loading_();
}
function libWaitHtml_(x) {
  const q = x && x.kind === 'question';
  return `<div class="${q ? 'qcard' : 'card fc'} lib-wait" data-lib="${esc((x && x.key) || '')}">
    ${q ? '' : `<div class="fc-head"><h3>${esc((x && x.name) || '')}</h3></div>`}
    ${tagRow_(x)}
    <div class="lib-say">${libSay_(x)}</div>
  </div>`;
}
/* THE PAGES ARE COUNTED AGAIN ONLY WHERE THEY ARE DRAWN AGAIN — counting them anywhere else would move every page under a column already drawn. */
function libPagesFresh_() {
  if (STUFF_PAGES && STUFF_PAGES.gen !== undefined && STUFF_PAGES.gen !== LIB.gen) STUFF_PAGES = { from: null, pages: [] };
}
/* WORDS AHEAD OF THE READER (447): fewer than LIB_AHEAD cards ahead whole or on their way asks the next LIB_AHEAD_BATCH
   in one call; on the question page, the first screenful once typing stops. */
function libAheadCards_(pages, from, n) {
  const out = [];
  for (let i = Math.max(0, from); i < pages.length && out.length < n; i++) {
    const x = pages[i] && pages[i].x;
    if (x && out.indexOf(x) === -1) out.push(x);
  }
  return out;
}
const libOnWay_ = x => !libSlim_(x) || libIdsFor_(x).every(t => LIB.pending.has(t) || LIB.flying.has(t) || LIB.gone.has(t) || LIB.refused.has(t));
function libAheadAsk_(cards) {
  if (cards.slice(0, LIB_AHEAD).every(libOnWay_)) return;
  cards.forEach(x => { if (libSlim_(x)) libWant_(x); });
}
function libAhead_() {
  const F = FINDER;
  let pages, at;
  try { pages = stuffPages_(); at = (PAGE[F.id] || 0) - stuffFirstResult_(); } catch (e) { return; }
  if (!pages.length) return;
  if (at < 0) {
    clearTimeout(LIB.ahead);
    const first = libAheadCards_(pages, 0, LIB_AHEAD);
    if (first.some(libSlim_)) {
      LIB.ahead = setTimeout(() => inFinder_(F, () => { const p = stuffPages_(); if (p[0] && p[0].x === first[0]) libAheadAsk_(libAheadCards_(p, 0, LIB_AHEAD)); }), 700);
    }
    return;
  }
  libAheadAsk_(libAheadCards_(pages, at, LIB_AHEAD_BATCH));
  /* THE CARD IN FRONT WAS COUNTED BEFORE ITS WORDS CAME, and they are here: drawn again, a moment from now. */
  const pg = pages[at];
  if (pg && pg.slim && !libSlim_(pg.x)) setTimeout(() => libRepaintFinder_(F), 0);
}
/* THE FINDER DRAWN AGAIN WHERE IT STANDS, and onto the first page of the card that was waiting in front. */
function libRepaintFinder_(F) {
  if (!F || typeof AT === 'undefined') return;
  if (AT !== F.id || (typeof findKeep_ === 'function' && findKeep_(F.id))) { markStale_(F.id); return; }
  inFinder_(F, () => {
    const pg = stuffPages_()[(PAGE[F.id] || 0) - stuffFirstResult_()];
    const key = pg && pg.x ? pg.x.key : '', part = pg && !pg.slim ? (pg.part || null) : undefined;
    paintStuff(true);
    if (!key) return;
    /* THE SAME PAGE IN FRONT AFTER THE COUNT: its own part if it was whole, else the first page of the card that waited. */
    const pages = stuffPages_(), first = stuffFirstResult_();
    const now = pages[(PAGE[F.id] || 0) - first];
    const i = pages.findIndex(p => p && p.x && p.x.key === key && (part === undefined || (p.part || null) === part));
    if (i >= 0 && (!now || !now.x || now.x.key !== key || (now.part || null) !== (pages[i].part || null))) goPage(F.id, first + i, true);
  });
}
/* AN ANSWER CAME BACK (or did not): the card in front, if it was waiting, is drawn again; every other waiting card says
   where things stand without being rebuilt. */
function libLanded_() {
  try { insLanded_(); } catch (e) {}
  try {
    document.querySelectorAll('.lib-wait').forEach(el => {
      const x = libItemByKey_(el.getAttribute('data-lib') || '');
      const say = el.querySelector('.lib-say');
      if (say && x && libSlim_(x)) say.innerHTML = libSay_(x);
    });
  } catch (e) {}
  if (typeof AT === 'undefined') return;
  const F = finderOf_(AT);
  if (F) {
    /* AND THE CARDS AHEAD THAT ARE WHOLE NOW are counted again while they are off the glass, so none changes in front (447). */
    inFinder_(F, () => {
      const pages = stuffPages_(), at = (PAGE[F.id] || 0) - stuffFirstResult_();
      const end = Math.min(pages.length, Math.max(0, at) + LIB_AHEAD_BATCH * 3);
      for (let i = Math.max(0, at); i < end; i++) {
        const pg = pages[i];
        if (pg && pg.slim && !libSlim_(pg.x)) { libRepaintFinder_(F); break; }
      }
    });
    return;
  }
  /* SAVED, THE SPOTLIGHT, ANY COLUMN THAT DREW A WAITING CARD: drawn again where it stands once one of them is whole. */
  const host = $('s-' + AT);
  const ready = host && [].some.call(host.querySelectorAll('.lib-wait'), el => {
    const x = libItemByKey_(el.getAttribute('data-lib') || '');
    return x && !libSlim_(x);
  });
  if (ready) { try { repaint(true); } catch (e) {} }
}
on('lib-retry', el => {
  libRetry_();
  const card = el && el.closest ? el.closest('.lib-wait') : null;
  const x = card ? libItemByKey_(card.getAttribute('data-lib') || '') : null;
  if (x) libWant_(x);
});

/* ---------- THE WHOLE QUESTION, NOT A PEEK § */
/* ---------- SOMEWHERE TO WRITE THE ANSWER § */
/* ---------- WHOSE ANSWER IT IS, AND IT IS WHOEVER IS SIGNED IN § */
function whoIs_() {
  try {
    if (typeof USER !== 'undefined' && USER && (USER.personId || USER.name)) {
      return 'u:' + (USER.personId || USER.name);
    }
  } catch (e) {}
  return '';
}

const ansKey_ = x => 'ans:' + (whoIs_() ? whoIs_() + ':' : '') + ((x && (x.key || x.name)) || '?');

/* `signedName_` WAS HERE -- the first name over the answer box ("Ada's answer"). § */

function ansRead_(k) {
  /* THE VISIT'S COPY OF A WRITE THE STORE REFUSED (`keepHeld_`, data.js), never the older stored one or the empty box a browser keeping nothing answers with: § */
  const held = typeof keepHeld_ === 'function' ? keepHeld_(k) : undefined;
  if (held !== undefined) return held || '';
  try {
    const v = localStorage.getItem(k);
    if (v !== null) return v;
    /* ---------- AN ANSWER TYPED BEFORE ANYBODY SIGNED IN, FOUND AND MOVED § */
    const bare = k.replace(/^ans:u:[^:]*:/, 'ans:');
    if (bare === k) return '';
    /* THE SIGNED-OUT ONE AS ITS WRITER'S OWN READER READS IT (`ansValue_`), the visit's copy of a write
       the store refused first — `padAdopt_`'s reason below (317, "Six edges"). */
    const was = typeof ansValue_ === 'function' ? ansValue_(bare) : localStorage.getItem(bare);
    if (was === null) return '';
    /* NOT INTO SOMEBODY ELSE'S BOX: § */
    if (typeof ansMayMove_ === 'function' && !ansMayMove_(bare, k)) return '';
    if (typeof ansStore_ === 'function') ansStore_(k, was); else localStorage.setItem(k, was);
    /* AND THE SIGNED-OUT COPY GOES THROUGH THE WRITER — the stored one, the visit's held one (or the page
       going would write it back, `keepRetry_`) and its mark (`ansGoneMark_`), all at once. */
    if (typeof ansLocalPut_ === 'function') ansLocalPut_(bare, null); else localStorage.removeItem(bare);
    return was;
  } catch (e) { return ''; }
}

/* ---------- `Done 4 Oct` WAS HERE, AND THE `attempts` TAB UNDER IT § */
/* ---------- A DONE QUESTION'S NAME, AS A PARENT READS IT § */
function doneTier_(it) {
  if (!it || it.kind !== 'question') return '';
  const t = String(it.tier || '').trim();
  if (/^(foundation|higher)$/i.test(t)) return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  const said = [t, it.bandValue, it.level, it.row && it.row.level].map(x => String(x || '').toLowerCase().replace(/[^a-z]/g, ''));
  if (said.indexOf('alevel') !== -1) return 'A-level';
  if (said.indexOf('as') !== -1 || said.indexOf('aslevel') !== -1) return 'AS';
  return '';
}
function doneLabel_(k, index) {
  try {
    const slot = /#[^#]*$/.test(k), base = slot ? k.replace(/#[^#]*$/, '') : k;
    const it = doneItem_(base, index);
    if (!it) return '';
    const subj = String(it.subject || '');
    let sub = String(it.sub || '').split(' · ').filter(x => !/^\d+ min$/.test(x.trim())).join(' · ');
    const tier = doneTier_(it);
    if (sub && tier && sub.toLowerCase().indexOf(tier.toLowerCase()) === -1) sub += ' (' + tier + ')';
    return [subj && sub.toLowerCase().indexOf(subj.toLowerCase()) === -1 ? subj : '', sub, it.name,
            slot ? 'Worksheet' : ''].filter(Boolean).join(' · ');
  } catch (e) { return ''; }
}

/* ---------- THE QUESTION ITSELF, AS A PARENT WILL READ IT § */
const DONE_WORDS_STEM = 500, DONE_WORDS_ASK = 600;
const DONE_FRAC_SPAN = /<span class="frac"><span class="frac-n">((?:(?!<\/?span\b)[\s\S])*)<\/span>(?:<span class="frac-s">[^<]*<\/span>)?<span class="frac-d">((?:(?!<\/?span\b)[\s\S])*)<\/span><\/span>/g;
const DONE_FRAC_SUP = /<sup>((?:(?!<\/?sup\b)[\s\S])*)<\/sup>\s*(?:&frasl;|&#8260;|\u2044)\s*<sub>((?:(?!<\/?sub\b)[\s\S])*)<\/sub>/g;
/* A HALF THAT ALREADY WEARS ITS OWN BRACKETS keeps them and gains no second pair: `5/((x − 9))` was the
   library's `<sub>(x &minus; 9)</sub>` bracketed again. */
const doneHalf_ = h => {
  const bare = String(h).replace(/<[^>]*>/g, '').trim();
  if (/^\(/.test(bare) && /\)$/.test(bare)) {
    let depth = 0, whole = true;
    for (let i = 0; i < bare.length; i++) {
      if (bare[i] === '(') depth++;
      else if (bare[i] === ')') { depth--; if (depth === 0 && i < bare.length - 1) { whole = false; break; } }
    }
    if (whole) return h;
  }
  return /\S\s+\S|[+\-\u2212]|&minus;/.test(bare) ? '(' + h + ')' : h;
};
/* SUPERSCRIPT AND SUBSCRIPT DIGITS, for an index or a subscript that is only digits: `x₁`, `⁴√`. */
const DONE_SUP_DIG = '\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079', DONE_SUB_DIG = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089';
const doneDigits_ = (t, map) => t.replace(/\d/g, d => map[+d]);
const doneFrac_ = (m, n, d) => doneHalf_(n) + '/' + doneHalf_(d);
function doneWordsPlain_(html) {
  const s = String(html || '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(DONE_FRAC_SPAN, doneFrac_)
    .replace(DONE_FRAC_SUP, doneFrac_)
    .replace(/<sup>2<\/sup>/g, '\u00b2').replace(/<sup>3<\/sup>/g, '\u00b3')
    .replace(DONE_FRAC_SUP, doneFrac_)
    /* AN ORDINAL IS NOT A POWER — "the 3rd term", not "the 3^rd term" — and a root's index sits on the root, ⁴√, not ^4√. § */
    .replace(/<sup>\s*(st|nd|rd|th)\s*<\/sup>/gi, '$1')
    .replace(/<sup>\s*(\d+)\s*<\/sup>(?=\s*\u221a|\s*&radic;)/g, (m, d) => doneDigits_(d, DONE_SUP_DIG))
    .replace(/<sub>\s*(\d+)\s*<\/sub>/g, (m, d) => doneDigits_(d, DONE_SUB_DIG))
    .replace(/<sub>((?:(?!<\/?sub\b)[\s\S])*)<\/sub>/g, (m, e) => '_' + doneHalf_(e))
    .replace(/<sup>((?:(?!<\/?sup\b)[\s\S])*)<\/sup>/g, (m, e) => '^' + doneHalf_(e))
    .replace(/&frasl;|&#8260;|\u2044/g, '/')
    /* A TABLE KEEPS ITS CELLS APART, ` | ` between them and a row a line, because two spaces did not
       survive the collapse below and "0 < t ≤ 10 20" is a class and its frequency run together. */
    .replace(/<\/t[dh]>\s*(?=<t[dh]\b)/gi, ' | ')
    .replace(/<(br|\/p|\/li|\/div|\/tr|\/h\d|\/table)\b[^>]*>/gi, '\n');
  let t = '';
  try { t = new DOMParser().parseFromString(s, 'text/html').body.textContent || ''; }
  catch (e) { t = s.replace(/<[^>]*>/g, ' '); }
  return t.split('\n').map(l => l.replace(/[ \t\u00a0]+/g, ' ').trim()).filter(Boolean).join('\n');
}
/* THE CARD FOR AN ANSWER KEY. § */
function doneItem_(k, index) {
  if (index) return index.get(k) || null;
  return stuffItemsAll_().find(y => ansKey_(y) === k) || null;
}
function doneWords_(k, index) {
  try {
    if (/#[^#]*$/.test(k)) return '';
    const it = doneItem_(k, index);
    if (!it || it.kind !== 'question') return '';
    const own = st => st && st.q !== undefined && st.q !== null && st.q !== '';
    const stems = (it.stems || []).filter(own);
    const cap = (t, n) => (t.length > n ? t.slice(0, n - 1).trim() + '…' : t);
    const stem = cap(stems.map(st => doneWordsPlain_(st.html)).filter(Boolean).join('\n'), DONE_WORDS_STEM);
    let ask = cap([it.lead, it.html].map(doneWordsPlain_).filter(Boolean).join('\n'), DONE_WORDS_ASK);
    /* THE SITE'S OWN TEST FOR A PICTURE (`questionHasFig_`, `stemHasFig_`), never the `figure` cell: § */
    const pic = questionHasFig_(it) || stems.some(stemHasFig_);
    if (pic) ask += (ask ? ' ' : '') + '(picture on the site)';
    return stem ? stem + '\n---\n' + ask : ask;
  } catch (e) { return ''; }
}

/* ---------- MARKING IT § */
function markNorm_(s) {
  return String(s == null ? '' : s)
    /* ONLY A REAL TAG IS A TAG. § */
    .replace(/<\/?[a-z][^>]*>/gi, ' ')
    /* AND THE ENTITIES A CELL IS WRITTEN IN ARE THE CHARACTERS A CHILD TYPES. § */
    .replace(/&pound;/g, '£').replace(/&euro;/g, '€').replace(/&minus;/g, '−')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    /* WHAT A PASTE OR A PHONE'S SMART PUNCTUATION ADDS (508): invisible characters go, curly quotes are straight, full-width digits are digits. */
    .replace(/[\u200b-\u200d\u2060\ufeff\u00ad]/g, '')
    .replace(/[\u2018\u2019\u02bc]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[\uff10-\uff19]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xff10 + 48))
    .toLowerCase()
    .replace(/[−–—]/g, '-')          /* minus, en dash, em dash */
    .replace(/[£$€]/g, '')
    /* A THOUSANDS SEPARATOR IS A COMMA, A SPACE, OR A THIN SPACE, and which one you get depends on who printed the paper. § */
    .replace(/(\d)[,\u2009\u00a0 ](?=\d\d\d\b)/g, '$1')
    /* A FRACTION HAS FOUR SPELLINGS AND A CHILD TYPES ONE OF THEM. § */
    .replace(/[\u2044\u2215]/g, '/')
    .replace(/[\u00bc\u00bd\u00be\u2150-\u215e]/g, c => ' ' + {
      '\u00bc': '1/4', '\u00bd': '1/2', '\u00be': '3/4', '\u2150': '1/7', '\u2151': '1/9',
      '\u2152': '1/10', '\u2153': '1/3', '\u2154': '2/3', '\u2155': '1/5', '\u2156': '2/5',
      '\u2157': '3/5', '\u2158': '4/5', '\u2159': '1/6', '\u215a': '5/6', '\u215b': '1/8',
      '\u215c': '3/8', '\u215d': '5/8', '\u215e': '7/8' }[c] + ' ')
    .replace(/\s*\/\s*/g, '/')
    /* ---------- WHAT THE MATHS KEYPAD WRITES, WHICH IS A BRACKET ROUND EVERY SLOT § */
    .replace(/sqrt\s*/g, '√').replace(/(^|[^a-z])root\s*(?=[\d(])/g, '$1√')
    .replace(/(^|[^a-z])pi(?![a-z])/g, '$1π')
    .replace(/(\d)\s+(?=[√π])/g, '$1')
    .replace(/([√^])\((-?[a-z0-9.π]+)\)/g, '$1$2')
    .replace(/\((-?√?[a-z0-9.π]+(?:\^-?[a-z0-9.π]+)?)\)(?=\/)/g, '$1')
    .replace(/([\/^√])\((-?√?[a-z0-9.π]+)\)/g, '$1$2')
    /* AND THE SPACES ROUND A COLON, FOR THE SAME REASON ONE LINE UP. § */
    .replace(/\s*:\s*/g, ':')
    /* ---------- AND ROUND AN OPERATOR, WHICH IS THE COLON RULE FOR A THIRD CLASS OF CHARACTER § */
    .replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=')
    .replace(/\*/g, '×').replace(/([\d²³¹⁰⁴-⁹])\s*x\s*(?=\d)/g, '$1×')
    .replace(/\s*([-+×÷=<>!])\s*/g, '$1')
    .replace(/\band\b|&/g, ',')
    .replace(/[.\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* A LIST IS A SET. "1, 2, 5, 10" and "10, 5, 2, 1" are the same answer to "list the factors", and a child who works outwards from the middle writes the second. § */
function markParts_(s) {
  return markNorm_(s).split(/\s*,\s*/).map(p => markNum_(p.trim())).filter(Boolean).sort();
}

/* A NUMBER IS COMPARED AS A NUMBER, so 8.50 is 8.5 and 07 is 7. Anything that is not a bare
   number is left as text -- "banana" has no numeric value and must not become NaN. */
function markNum_(p) {
  const m = /^-?\d+(\.\d+)?$/.exec(p);
  if (!m) return p;
  const n = Number(p);
  return isFinite(n) ? String(n) : p;
}

/* THE UNIT IS PART OF THE ANSWER'S SENTENCE AND NOT PART OF THE ANSWER. § */
/* The solidus is in the leading class because a fraction is a number too: `1/2 km` is a value
   and a unit exactly as `70.5 kg` is, and without it the km stayed attached and a student
   typing `6/12` against it was marked wrong. */
/* ---------- A UNIT, AND NOT EVERYTHING AFTER THE FIRST NUMBER § */
const MARK_NUM = '(?:√[\\d.]*\\d|π|\\d)';
const MARK_SYM = '(?:[a-z][a-z][a-z]+|[cmkd]m|kg|mg|ml|cl|hr|am|pm|pc|ly|kj|°[cf]?|%)';
const MARK_POW = '(?:\\^-?\\d+|[²³]|[23](?!\\d))';
const MARK_BARE = new RegExp('^(-?[\\d.,\\/\\s]*' + MARK_NUM + ')(?:' + MARK_SYM + MARK_POW + '?'
  + '|\\s+(?:[gmlpshkjvnw]|' + MARK_SYM + ')' + MARK_POW + '?|\\s+[a-z]+(?=\\/))'
  + '(?:\\/(?:[gmlpshkjvnw]|' + MARK_SYM + ')' + MARK_POW + '?)*'
  + '(?:\\s+per\\s+(?:[gmlpshkjvnw]|' + MARK_SYM + '))?(?:\\s+\\(.*\\))?$');
const markBare_ = s => markNorm_(s).replace(MARK_BARE, '$1').trim();

/* A FRACTION IS A NUMBER, AND "OR EQUIVALENT" IS WHAT THE MARK SCHEME ACTUALLY SAYS. § */
function markFrac_(s) {
  const t = markNorm_(s).replace(/^\(|\)$/g, '').trim();
  let m = /^(-?)(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(t);
  if (m) {
    const d = Number(m[4]);
    if (!d) return null;
    const n = Number(m[2] || 0) * d + Number(m[3]);
    return { n: m[1] ? -n : n, d: d };
  }
  m = /^(-?\d+)(?:\.(\d+))?$/.exec(t);
  if (m) {
    const dec = m[2] || '';
    const d = Math.pow(10, dec.length);
    return { n: Number(m[1]) * d + (m[1][0] === '-' ? -1 : 1) * Number(dec || 0), d: d };
  }
  return null;
}

/* A MARK SCHEME THAT TAKES A BAND TAKES EVERY NUMBER IN IT, AND THIS ONE WAS TAKING TWO OF THEM. § */
function markRange_(w) {
  /* ---------- THE SEPARATOR IS READ BEFORE `markNorm_` FLATTENS IT § */
  const m = /^(-?\d+(?:\.\d+)?)\s*(?:to)\s*(-?\d+(?:\.\d+)?)(?:\s*([a-z\u00b0%].*))?$/
    .exec(markNorm_(String(w == null ? '' : w).replace(/[\u2013\u2014]/g, ' to ')));
  if (!m) return null;
  const lo = markFrac_(m[1]), hi = markFrac_(m[2]);
  if (!lo || !hi) return null;
  if (lo.n * hi.d > hi.n * lo.d) return null;   /* backwards is not a band */
  return { lo: lo, hi: hi, unit: (m[3] || '').trim() };
}

/* ---------- A UNIT THE CHILD TYPED, AND THE BRACKETS ROUND A COORDINATE § */
const MARK_WORD = '(?:(?:[mcdk]?m|units?)(?:\\^[23]|[23\u00b2\u00b3])|[a-z\u00b0%][a-z\u00b0%]*)';
const MARK_UNIT = new RegExp('^(-?[\\d.\\/]*' + MARK_NUM + ')\\s*(?:' + MARK_WORD + '(?:\\/' + MARK_WORD
  + ')*(?![a-z0-9\u00b0%\u00b2\u00b3^])\\.?\\s*)+$');
/* The unit a way carries, for `unitOf` in `markAnswer_` — built once, not once a way. § */
const MARK_UNIT_OF = new RegExp('^\\(?-?[\\d.,\\/\\s]*' + MARK_NUM + '\\s*(' + MARK_WORD + '(?:\\/' + MARK_WORD
  + ')*(?:\\s+' + MARK_WORD + '(?:\\/' + MARK_WORD + ')*)*)(?![a-z0-9\u00b0%\u00b2\u00b3^])');
function markUnitOff_(t) {
  let s = t.replace(/^\((.*)\)$/, '$1').trim();
  const parts = s.split(/\s*,\s*/);
  if (parts.length > 1 && parts.every(p => MARK_UNIT.test(p) || /^-?[\d.\/]+$/.test(p)))
    s = parts.map(p => p.replace(MARK_UNIT, '$1')).join(', ');
  else s = s.replace(MARK_UNIT, '$1');
  return s;
}

/* ---------- AN ANSWER WITH MANY RIGHT FORMS, MARKED BY WHAT MAKES IT RIGHT (360) */
/* `rule: count 3, distinct, each factor 36, sum 31..34` in `accept`: the typed numbers are tested, not matched. */
/* Clauses: count, distinct, mixed, decimal, each <tests>, at N <tests>, hcf N, sum, diff, from a/b/…, rounddiff R V, digits ##4###, once D, lowest, set a+b/c+d (word groups). */
function markRuleNums_(typed) {
  const t = markNorm_(typed).replace(/[,;=+×]/g, ' , ').replace(/(\d)-(?=\d)/g, '$1 , ');
  const out = [];
  const re = /(?<![\d.\/a-z^])(-?)(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+)|\/(\d+))?(p?)(?![\d.\/a-z^\u00b2\u00b3])/g;
  let m;
  while ((m = re.exec(t))) {
    let v = m[3] ? Number(m[2]) + Number(m[3]) / Number(m[4]) : m[5] ? Number(m[2]) / Number(m[5]) : Number(m[2]);
    if (m[6]) v /= 100;
    out.push({ v: m[1] ? -v : v, s: m[0].trim() });
  }
  return out;
}
function markRuleVal_(s) {
  const n = markRuleNums_(s);
  return n.length ? n[0].v : NaN;
}
function markRuleIs_(v, test, arg) {
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  const whole = near(v, Math.round(v));
  const a = markRuleVal_(arg);
  const prime = n => n > 1 && whole && [...Array(Math.floor(Math.sqrt(n)) + 1).keys()].slice(2).every(k => n % k);
  switch (test) {
    case 'mult': return whole && near(v % a, 0);
    case 'notmult': return whole && !near(v % a, 0);
    case 'factor': return whole && v > 0 && near(a % v, 0);
    case 'notfactor': return whole && v > 0 && !near(a % v, 0);
    case 'prime': return prime(v);
    case 'notprime': return whole && v >= 0 && !prime(v);
    case 'square': return whole && v >= 0 && near(Math.round(Math.sqrt(v)) ** 2, v);
    case 'cube': return whole && near(Math.round(Math.cbrt(v)) ** 3, v);
    case 'odd': return whole && Math.abs(v % 2) === 1;
    case 'even': return whole && v % 2 === 0;
    case 'over': return v > a;
    case 'under': return v < a;
    case 'eq': return near(v, a);
    case 'ne': return !near(v, a);
    default: return false;
  }
}
function markRuleSet_(typed, spec, spell) {
  const words = s => String(s).toLowerCase().match(/[a-z]+|\d+/g) || [];
  const fill = /^(and|with|then|a|an|the|on|of)$/;
  if (spell) return markRuleSeq_(typed, spec, spell, words, fill);
  const syn = {};
  const want = spec.split('/').map(item => item.split('+').map(w => {
    const ways = w.trim().toLowerCase().split('~');
    ways.forEach(x => (syn[x] = ways[0]));
    return ways[0];
  }).join('+').split('+').sort().join(' ')).sort();
  const got = String(typed).split(/[,;\n]+/).map(item => words(item).filter(w => !fill.test(w)).map(w => syn[w] || w).sort().join(' '))
    .filter(Boolean).sort();
  return got.length === want.length && got.every((g, i) => g === want[i]);
}
/* `spell h~heads t~tails`: each item is an ORDERED run of letters (HHT is not THH); typed as HHT, H H T, H,H,T or heads heads tails (454) */
function markRuleSeq_(typed, spec, spell, words, fill) {
  const map = {};
  spell.trim().toLowerCase().split(/\s+/).forEach(g => { const w = g.split('~'); w.forEach(x => (map[x] = w[0])); });
  const want = spec.split('/').map(x => x.trim().toLowerCase()).sort();
  const len = want[0] ? want[0].length : 0;
  if (!len || want.some(w => w.length !== len)) return false;
  let run = '';
  for (const w of words(typed)) {
    if (fill.test(w)) continue;
    if (map[w]) { run += map[w]; continue; }
    if (![...w].every(c => map[c] === c)) return false;
    run += w;
  }
  if (!run.length || run.length % len) return false;
  const got = (run.match(new RegExp('.{' + len + '}', 'g')) || []).sort();
  return got.length === want.length && got.every((g, i) => g === want[i]);
}
/* ---------- AN ALGEBRAIC ANSWER, MARKED BY ITS VALUE (365) */
/* `rule: expr R`: any expression equal to R at sample values; `v = R` wants v as the subject; `eqn A = B`: any equation a multiple of it. */
/* `fn g` makes g( a function call, not g times a bracket, so y = g(-x) is not y = -g(x) (376) */
function markExprParse_(t, fns) {
  let i = 0;
  const peek = () => t[i];
  const starts = c => !!c && /[a-z0-9.(√∛π]/.test(c);
  const atom = () => {
    const c = peek();
    if (c === '(') { i++; const n = sum(); if (!n || peek() !== ')') return null; i++; return n; }
    if (c === '√' || c === '∛') { i++; const n = power(); return n && [c, n]; }
    if (c === 'π') { i++; return ['n', Math.PI]; }
    if (fns && fns.indexOf(c) >= 0 && t[i + 1] === '(') { i++; const n = atom(); return n && ['f', c, n]; }
    if (/^[a-z]$/.test(c || '')) { i++; return ['v', c]; }
    const m = /^\d*\.?\d+/.exec(t.slice(i));
    if (!m) return null;
    i += m[0].length;
    return ['n', Number(m[0])];
  };
  const power = () => {
    const b = atom();
    if (b && peek() === '^') { i++; const e = unary(); return e && ['^', b, e]; }
    return b;
  };
  const unary = () => {
    if (peek() === '-') { i++; const n = unary(); return n && ['neg', n]; }
    if (peek() === '+') { i++; return unary(); }
    return power();
  };
  const product = () => {
    let n = unary();
    while (n) {
      if (peek() === '*' || peek() === '/') { const op = t[i++], r = unary(); n = r && [op, n, r]; }
      else if (starts(peek())) { const r = power(); n = r && ['*', n, r]; }
      else break;
    }
    return n;
  };
  const sum = () => {
    let n = product();
    while (n && (peek() === '+' || peek() === '-')) { const op = t[i++], r = product(); n = r && [op, n, r]; }
    return n;
  };
  const n = sum();
  return n && i === t.length ? n : null;
}
function markExprVal_(n, at) {
  const [k, a, b] = n;
  if (k === 'n') return a;
  if (k === 'v') return at[a];
  /* a named function: one fixed curve per letter, neither odd nor even, so g(-x), -g(x) and g(x) all differ */
  if (k === 'f') { const v = markExprVal_(b, at), s = a.charCodeAt(0) % 7 + 1; return Math.exp(0.3 * v) * s + v * v * v / s + s; }
  const x = markExprVal_(a, at), y = b && markExprVal_(b, at);
  switch (k) {
    case 'neg': return -x;
    case '√': return Math.sqrt(x);
    case '∛': return Math.cbrt(x);
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
    case '/': return x / y;
    default: return Math.pow(x, y);
  }
}
/* `{ sides: [tree, tree?], vars }`, or null for anything that is not an expression. */
function markExprRead_(s, fns) {
  const t = String(s == null ? '' : s).toLowerCase().replace(/<[^>]*>/g, '').replace(/&minus;/g, '-')
    .replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/[⁄∕]/g, '/')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/sqrt|root/g, '√').replace(/cbrt/g, '∛')
    .replace(/pi/g, 'π').replace(/\s+/g, '');
  if (!t || /[^a-z0-9.+\-*\/^()√∛π=]/.test(t)) return null;
  const sides = t.split('=').map(x => markExprParse_(x, fns));
  if (sides.length > 2 || sides.some(x => !x)) return null;
  return { sides: sides, vars: (t.match(/[a-z]/g) || []).filter((v, i, a) => a.indexOf(v) === i && !(fns && fns.indexOf(v) >= 0)) };
}
/* `parallel`: the gradient of a straight line in x and y, or null when it is not one (a line parallel to M, 376) */
function markExprGrad_(R) {
  if (!R || R.sides.length !== 2 || R.vars.some(v => v !== 'x' && v !== 'y')) return null;
  const F = (x, y) => markExprVal_(R.sides[0], { x: x, y: y }) - markExprVal_(R.sides[1], { x: x, y: y });
  const c = F(0, 0), a = F(1, 0) - c, b = F(0, 1) - c, size = 1 + Math.abs(a) + Math.abs(b) + Math.abs(c);
  const flat = [[1.37, 2.71], [0.53, -3.19], [-1.83, 4.07]].every(p => Math.abs(F(p[0], p[1]) - (a * p[0] + b * p[1] + c)) < 1e-7 * size);
  return flat && Math.abs(b) > 1e-12 ? -a / b : null;
}
function markExpr_(typed, want, eqn, fns) {
  const T = markExprRead_(typed, fns), W = markExprRead_(want, fns);
  if (!T || !W) return false;
  let f, g;
  if (eqn) {
    if (T.sides.length !== 2 || W.sides.length !== 2) return false;
    f = at => markExprVal_(T.sides[0], at) - markExprVal_(T.sides[1], at);
    g = at => markExprVal_(W.sides[0], at) - markExprVal_(W.sides[1], at);
  } else {
    /* a subject wants that letter alone on the left, or nothing on the left, and nowhere on the right */
    const subj = W.sides.length === 2 && W.sides[0][0] === 'v' ? W.sides[0][1] : null;
    if (W.sides.length === 2 && !subj) return false;
    let tr = T.sides;
    if (tr.length === 2) { if (!subj || tr[0][0] !== 'v' || tr[0][1] !== subj) return false; tr = [tr[1]]; }
    if (subj && T.vars.indexOf(subj) >= 0 && T.sides.length === 1) return false;
    if (subj && JSON.stringify(tr[0]).indexOf('["v","' + subj + '"]') >= 0) return false;
    const w = W.sides[W.sides.length - 1];
    f = at => markExprVal_(tr[0], at);
    g = at => markExprVal_(w, at);
  }
  const vars = T.vars.concat(W.vars).filter((v, i, a) => a.indexOf(v) === i);
  const SEEDS = [1.37, 2.71, 0.53, 3.19, 1.83, 4.07, 0.29, 2.23];
  let ratio = null, used = 0;
  for (let s = 0; s < 6; s++) {
    const at = {};
    vars.forEach((v, j) => { at[v] = SEEDS[(s + 3 * j) % SEEDS.length] + 0.11 * j; });
    const a = f(at), b = g(at);
    if (!isFinite(b) || Math.abs(b) < 1e-12) continue;
    if (!isFinite(a)) return false;
    const r = a / b;
    if (!eqn && Math.abs(r - 1) > 1e-7) return false;
    if (eqn && (Math.abs(r) < 1e-9 || (ratio !== null && Math.abs(r - ratio) > 1e-7 * Math.max(1, Math.abs(ratio))))) return false;
    ratio = r;
    used++;
  }
  return used >= 3;
}
function markRule_(typed, rule) {
  const body = String(rule || '').replace(/^\s*rule:\s*/i, '');
  /* `expr`/`eqn` is the whole rule but for `nobracket` (multiplied out), `fn g`, `parallel` and `not E` (any but that one) */
  const ex = /(?:^|,)\s*(expr|eqn)\s+([^,]+)/.exec(body);
  if (ex) {
    const eqn = ex[1] === 'eqn', fns = (/(?:^|,)\s*fn\s+([a-z]+)/.exec(body) || [])[1] || '';
    const not = /(?:^|,)\s*not\s+([^,]+)/.exec(body);
    if (not && markExpr_(typed, not[1], eqn, fns)) return false;
    if (/(?:^|,)\s*parallel\s*(?:,|$)/.test(body)) {
      const g = markExprGrad_(markExprRead_(typed)), h = markExprGrad_(markExprRead_(ex[2]));
      return g !== null && h !== null && Math.abs(g - h) < 1e-9;
    }
    return markExpr_(typed, ex[2], eqn, fns) && !(/(?:^|,)\s*nobracket\b/.test(body) && /\(/.test(String(typed)));
  }
  const set = /(?:^|,)\s*set\s+([^,]+)/.exec(body);
  if (set) return markRuleSet_(typed, set[1], (/(?:^|,)\s*spell\s+([^,]+)/.exec(body) || [])[1]);
  const nums = markRuleNums_(typed), vs = nums.map(n => n.v);
  if (!nums.length) return false;
  const sum = vs.reduce((s, v) => s + v, 0);
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  return body.split(',').map(c => c.trim()).filter(Boolean).every(c => {
    const w = c.split(/\s+/), k = w[0];
    if (k === 'count') return vs.length === Number(w[1]);
    /* `decimal`: written as a decimal, where the question asks for one (0.25, not 1/4) */
    if (k === 'decimal') return nums.every(n => /^-?\d*\.\d+$/.test(n.s));
    if (k === 'mixed') return nums.every(n => {
      const q = /^\d+ (\d+)\/(\d+)$/.exec(n.s);
      return !!q && Number(q[1]) < Number(q[2]);
    });
    /* `lowest`: each written as a fraction in its lowest terms, where the question asks for the simplest form (439) */
    if (k === 'lowest') return nums.every(n => {
      const q = /(\d+)\/(\d+)$/.exec(n.s), g = (a, b) => (b ? g(b, a % b) : a);
      return !!q && g(Number(q[1]), Number(q[2])) === 1;
    });
    if (k === 'distinct') return new Set(nums.map(n => n.s)).size === nums.length;
    if (k === 'each') {
      const tests = [];
      for (let i = 1; i < w.length; i++) tests.push(/^(mult|notmult|factor|notfactor|over|under|eq|ne)$/.test(w[i]) ? [w[i], w[++i]] : [w[i]]);
      return vs.every(v => tests.every(x => markRuleIs_(v, x[0], x[1])));
    }
    /* `at 2 even`: the tests for one value by its place, where each value has its own condition (m a multiple of 5, n even) */
    if (k === 'at') {
      const v = vs[Number(w[1]) - 1];
      if (v === undefined) return false;
      for (let i = 2; i < w.length; i++) {
        const t = w[i], arg = /^(mult|notmult|factor|notfactor|over|under|eq|ne)$/.test(t) ? w[++i] : undefined;
        if (!markRuleIs_(v, t, arg)) return false;
      }
      return true;
    }
    if (k === 'hcf') {
      const g = (a, b) => (b ? g(b, a % b) : a);
      return vs.every(v => near(v, Math.round(v)) && v > 0) && near(vs.map(Math.round).reduce(g), markRuleVal_(w[1]));
    }
    if (k === 'sum') {
      const r = w[1].split('..');
      return r.length === 2 ? sum >= markRuleVal_(r[0]) - 1e-9 && sum <= markRuleVal_(r[1]) + 1e-9 : near(sum, markRuleVal_(r[0]));
    }
    /* `pairs prod 100`: the values taken two at a time, in order, each pair making it -- opposite faces of a net (366) */
    if (k === 'pairs') {
      if (vs.length % 2) return false;
      for (let i = 0; i < vs.length; i += 2) if (!near(w[1] === 'sum' ? vs[i] + vs[i + 1] : vs[i] * vs[i + 1], markRuleVal_(w[2]))) return false;
      return true;
    }
    /* `digits ##4###`: each a whole number whose digits fit, # any digit, no leading 0; `once 4`: that digit appears exactly once (439) */
    if (k === 'digits') return nums.every(n => /^\d+$/.test(n.s) && !/^0\d/.test(n.s) && n.s.length === w[1].length
      && [...w[1]].every((d, i) => d === '#' || d === n.s[i]));
    if (k === 'once') return nums.every(n => n.s.split(w[1]).length === 2);
    if (k === 'diff') return vs.length === 2 && near(Math.abs(vs[0] - vs[1]), markRuleVal_(w[1]));
    if (k === 'rounddiff') {
      const r = Number(w[1]), rd = v => Math.round(v / r) * r;
      return vs.length === 2 && near(Math.abs(rd(vs[0]) - rd(vs[1])), markRuleVal_(w[2]));
    }
    if (k === 'from') {
      const pool = w.slice(1).join(' ').split('/').map(markRuleVal_);
      return vs.every(v => {
        const i = pool.findIndex(p => near(p, v));
        return i >= 0 && pool.splice(i, 1);
      });
    }
    return false;
  });
}

function markAnswer_(typed, accept, again) {
  /* ONE BOX PER VALUE hands the values as a list (362): read as the comma list the scheme writes. */
  if (Array.isArray(typed)) typed = typed.map(v => String(v == null ? '' : v).trim()).filter(Boolean).join(', ');
  const t = markNorm_(typed);
  if (!t) return null;                              /* nothing typed is not a wrong answer */
  /* A `rule:` WAY IS TESTED, NOT MATCHED (markRule_); the other ways are matched as before. */
  const rules = String(accept || '').split('|').filter(w => /^\s*rule:/i.test(w));
  if (rules.length) {
    if (rules.some(w => markRule_(typed, w))) return true;
    accept = String(accept).split('|').filter(w => !/^\s*rule:/i.test(w)).join('|');
    /* a form asked for (`mixed`, `decimal`) is not given by the value: beside it a written way counts only as written, so 28/5 is not 5 3/5 (376) */
    if (rules.some(w => /(?:^|[:,])\s*(mixed|decimal|lowest)\s*(?:,|$)/i.test(w))) {
      const tight = v => v.replace(/(\d)\s+(?=[a-z])/g, '$1');   // 0.25 kg is 0.25kg; 5 3/5 stays apart
      return accept.split('|').some(w => tight(markNorm_(w)) === tight(t));
    }
  }
  if (!again) {
    /* A NAME IN FRONT IS THE SENTENCE TOO. § */
    const named = t.replace(/^[a-z]+=(?=-?[\d.])/, '');
    const off = markUnitOff_(named);
    /* ONLY AGAINST A WAY THAT HAS NO UNIT, OR THE SAME ONE: § */
    const unitOf = v => ((MARK_UNIT_OF.exec(markNorm_(v)) || [])[1] || '')
      .replace(/(^|[\/\s])([mcdk]?m|units?)\^?([23\u00b2\u00b3])(?=[\/\s]|$)/g,
        (m, at, u, p) => at + u + (p === '\u00b2' ? '2' : p === '\u00b3' ? '3' : p));
    const tu = unitOf(named);
    const all = String(accept || '').split('|').map(w => w.trim()).filter(Boolean);
    /* ---------- A BARE WAY LETS A UNIT THROUGH AFTER A NUMBER, AND ONLY THERE § */
    const exact = /[√π]/.test(off);
    const strict = tu && (exact || tu.indexOf('/') >= 0);
    const units = all.map(unitOf).filter(Boolean);
    const first = u => u.split(' ')[0];
    const ways = (strict ? (units.indexOf(tu) >= 0 ? all : units.length || exact ? [] : all)
      : all.filter(w => !unitOf(w) || first(unitOf(w)) === first(tu))).join(' | ');
    if (off !== t && ways && markAnswer_(off, ways, true)) return true;
  }
  /* ---------- AND THE SPACE BETWEEN A NUMBER AND ITS LETTERS SAYS NOTHING § */
  const tight = s => s.replace(/([\dπ])\s+(?=[a-z\u00b0%])/g, '$1');
  const tt = tight(t);
  const ways = String(accept || '').split('|').map(w => w.trim()).filter(Boolean);
  for (let i = 0; i < ways.length; i++) {
    const w = ways[i];
    if (tt === tight(markNorm_(w))) return true;
    if (markNum_(t) === markNum_(markNorm_(w))) return true;
    if (t === markBare_(w) || markNum_(t) === markNum_(markBare_(w))) return true;
    const a = markParts_(t).map(tight).sort(), b = markParts_(w).map(tight).sort();
    if (a.length && a.length === b.length && a.join('|') === b.join('|')) return true;
    /* the same value written another way -- see `markFrac_` above */
    const p = markFrac_(t), q = markFrac_(markBare_(w));
    if (p && q && p.n * q.d === q.n * p.d) return true;
    /* anywhere inside a band the scheme prints -- see `markRange_` above */
    const band = markRange_(w);
    /* A READING WITH ITS UNIT OR DEGREE SIGN (385): the number inside the band, the unit the band's own or a degree */
    const ru = band && !p && /^(-?\d+(?:\.\d+)?)\s*([a-z\u00b0%]+)\.?$/.exec(t);
    if (ru && (ru[2] === band.unit || /^(\u00b0|degrees?|deg)$/.test(ru[2]))) {
      const pv = markFrac_(ru[1]);
      if (pv && pv.n * band.lo.d >= band.lo.n * pv.d && pv.n * band.hi.d <= band.hi.n * pv.d) return true;
    }
    if (p && band
      && p.n * band.lo.d >= band.lo.n * p.d
      && p.n * band.hi.d <= band.hi.n * p.d) return true;
  }
  return false;
}

/* ---------- A MULTIPLE-CHOICE QUESTION IS TAPPED, NOT TYPED § */
function choiceBox_(x) {
  /* AN ORDERING HAS `choices` TOO, and they are not options to pick one of: every one is used, and the
     answer is the order. Its own box, below (`orderBox_`). */
  if (orderIs_(x)) return orderBox_(x);
  const k = ansKey_(x);
  const right = (x.choiceRight || []).slice().sort((a, b) => a - b);
  const need = Math.max(1, right.length);
  const picked = String(ansRead_(k) || '').split(',').map(t => parseInt(t, 10)).filter(n => n > 0);
  const done = right.length && picked.length >= need;
  const ok = done && picked.slice().sort((a, b) => a - b).join(',') === right.join(',');
  /* SETTLED (`is-done`) ONLY WHEN RIGHT; a miss (`is-miss`) stays tappable so the child picks again and is marked again (385). */
  return `<div class="qp-ans qp-choices${ok ? ' is-done' : done ? ' is-miss' : ''}" data-k="${esc(k)}" data-need="${need}"
      data-right="${esc(right.join(','))}">
    ${/* NO "<NAME>'S ANSWER" OVER THE OPTIONS -- *"remove 'names answer'. that is redundant."* The
          person signed in is on the You column; the only thing worth saying here is how many to pick. */
      need > 1 ? `<span class="qp-ans-k">Choose ${need}</span>` : ''}
    <div class="qp-opts">${x.choices.map((c, i) => {
      const n = i + 1, on = picked.includes(n);
      /* THE TICK GOES ON YOUR PICK WHEN IT IS RIGHT, AND NOWHERE WHEN IT IS NOT. § */
      const cls = (on ? ' is-picked' : '') + (ok && on ? ' is-ans' : '');
      /* THE OPTION'S OWN MARKUP, as the question's html is drawn: § */
      return `<button type="button" class="qp-opt${cls}" data-do="qp-choose"
        data-n="${n}" aria-pressed="${on}">${typeset_(c)}</button>`;
    }).join('')}</div>
  </div>${right.length ? `<div class="qp-mark${done ? (ok ? ' is-right' : ' is-near') : ''}">
    <span class="qp-verdict" role="status" aria-live="polite">${done
      /* WHERE THE ANSWER IS, NOT WHAT IT IS -- and short enough for one line at 320px: § */
      ? (ok ? 'Correct' : 'Not yet — have another go')
      : ''}</span>
  </div>` : ''}
  <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>`;
}

/* A tap picks; on "choose two" a second tap adds and a tap on a chosen one takes it back off. § */
/* THE OPTIONS DRAWN AGAIN FROM THE STORED PICK, where they stand — the verdict row and the saved line under them replaced with them, or the old ones would stay § */
function choiceRedraw_(box) {
  const k = box && box.getAttribute('data-k');
  const x = k && stuffItemsAll_().find(it => ansKey_(it) === k);
  if (!x) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = choiceBox_(x);
  for (let n = box.nextElementSibling; n && (n.classList.contains('qp-mark') || n.classList.contains('qp-saved'));) {
    const next = n.nextElementSibling;
    n.remove();
    n = next;
  }
  box.replaceWith(...wrap.childNodes);
}

/* AN ORDERING IS TAPPED IN ORDER, NOT TYPED. § */
const ORDER_HOLE = new Map();

function orderIs_(x) {
  return !!x && String(x.answerType || '').trim().toLowerCase() === 'order'
    && Array.isArray(x.choices) && x.choices.length >= 2;
}

/* THE STORED ROW READ BACK AS n PLACES, 0 FOR AN EMPTY ONE -- AND ONLY IF IT IS A ROW AT ALL. § */
function orderSeq_(v, n) {
  const out = [];
  const s = String(v == null ? '' : v);
  const parts = s.split(',');
  const row = /^\s*\d*\s*(,\s*\d*\s*)*$/.test(s) && parts.length <= n;
  const seen = new Set();
  if (row) {
    for (const t of parts) {
      if (t.trim() === '') { out.push(0); continue; }
      const m = parseInt(t, 10);
      if (!(m >= 1 && m <= n) || seen.has(m)) { out.length = 0; break; }
      seen.add(m);
      out.push(m);
    }
  }
  while (out.length < n) out.push(0);
  return out;
}
/* AND WRITTEN: `3,,5` for a hole, nothing after the last placed item, '' for an empty row. */
function orderSay_(seq) {
  const s = seq.map(m => (m ? String(m) : ''));
  while (s.length && s[s.length - 1] === '') s.pop();
  return s.join(',');
}
/* EVERY RIGHT ORDER THE ROW KNOWS. `choiceWays` from the loader; a card built by hand with only
   `choiceRight` is one order. */
function orderWays_(x) {
  const ways = (x && x.choiceWays) || [];
  if (ways.length) return ways;
  return x && (x.choiceRight || []).length ? [x.choiceRight] : [];
}

/* ---------- MARKING AN ORDER § */
function markOrder_(seq, ways) {
  const list = v => (Array.isArray(v) ? v : String(v == null ? '' : v).split(',')).map(t => String(t).trim());
  const alts = (Array.isArray(ways) ? ways : String(ways == null ? '' : ways).split('|'))
    .map(w => list(w).filter(Boolean).map(t => String(parseInt(t, 10))).join(','))
    .filter(Boolean);
  if (!alts.length) return null;
  const got = list(seq);
  if (got.length < alts[0].split(',').length || got.some(t => t === '')) return null;
  return alts.indexOf(got.map(t => String(parseInt(t, 10))).join(',')) !== -1;
}

function orderBox_(x) {
  const k = ansKey_(x);
  const n = x.choices.length;
  const seq = orderSeq_(ansRead_(k), n);
  const said = orderSay_(seq);
  const ways = orderWays_(x);
  /* THE QUESTION'S OWN WORDS FOR ITS ENDS, and a neutral pair where the row has none --
     `check-library.js` fails such a row, and the box still has to make sense while it does. */
  const ends = (x.orderEnds || []).length === 2 ? x.orderEnds : ['first', 'last'];
  const latest = typeof subLatest_ === 'function' ? subLatest_(k) : null;
  const sent = !!said && !!latest && latest.a === said && (latest.v === 'right' || latest.v === 'wrong');
  const holed = !sent && ORDER_HOLE.has(k) && ORDER_HOLE.get(k) === said;
  const verdict = sent ? latest.v === 'right' : holed ? null : undefined;
  const cls = verdict === true ? ' is-right' : verdict === false ? ' is-near' : '';
  const say = holed ? 'Put all ' + n + ' in the row first'
    : verdict === true ? 'Correct' : verdict === false ? 'Not yet — have another go' : '';
  const placed = new Set(seq.filter(Boolean));
  /* EVERY SLOT AS WIDE AS THE WIDEST ITEM, EMPTY OR FULL, so the strip is the same shape from the first tap to the last. § */
  const wide = Math.max(1, ...x.choices.map(c => String(c).replace(/<[^>]*>/g, '')
    .replace(/&[a-z0-9#]+;/gi, '_').replace(/\s+/g, ' ').trim().length));
  /* THE FACE IS ONE ELEMENT, `.qp-face`, IN THE SLOT AND IN THE ROW. § */
  const face = c => `<span class="qp-face">${typeset_(c)}</span>`;
  /* A PLACED ITEM IS A BUTTON IN ITS SLOT, to take it back; an empty slot is a numbered space and not a button, because pressing it does nothing. § */
  const slots = seq.map((m, i) => (m
    ? `<button type="button" class="qp-slot is-full" data-do="qp-place" data-n="${m}"><span class="qp-slot-i">${i + 1}</span>${face(x.choices[m - 1])}</button>`
    : `<span class="qp-slot"><span class="qp-slot-i">${i + 1}</span></span>`)).join('');
  /* THE ITEMS STAY WHERE THE PAPER PRINTS THEM. § */
  const items = x.choices.map((c, i) => {
    const on = placed.has(i + 1);
    return `<button type="button" class="qp-item${on ? ' is-placed' : ''}" data-do="qp-place" data-n="${i + 1}"
      aria-pressed="${on}"${on ? ' disabled' : ''}>${face(c)}</button>`;
  }).join('');
  /* THE VERDICT'S LINE IS RESERVED AND THE TILES SIT IN IT, so "Correct" lands in a space that was already there and marking moves nothing (261). § */
  const clear = tile_({ icon: 'bin', label: 'Clear', note: 'put them all back', act: 'qp-order-clear', cls: 'qp-order-clear', off: !placed.size });
  const send = ways.length ? checkTile_({ act: 'qp-order-send', cls: 'qp-order-send' }) : '';
  /* THE TWO ENDS ARE THE ONLY WORDS SAYING WHICH WAY THE ROW RUNS, so they are a line of their own over the slots, one at each edge with an arrow between, at the § */
  const word = e => String(e).charAt(0).toUpperCase() + String(e).slice(1);
  return `<div class="qp-order${cls}" data-k="${esc(k)}" data-n="${n}">
    <div class="qp-slots" role="group" style="--qp-ch:${wide}" aria-label="${esc('Your order, ' + ends[0] + ' to ' + ends[1])}">
      <div class="qp-ends" aria-hidden="true"><span class="qp-end">${esc(word(ends[0]))}</span><span class="qp-way"></span><span class="qp-end">${esc(word(ends[1]))}</span></div>${slots}
    </div>
    <div class="qp-items">${items}</div>
    <div class="qp-mark${cls}">
      <span class="qp-verdict" role="status" aria-live="polite">${esc(say)}</span>${clear}${send}
    </div>
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>
  </div>`;
}

/* DRAWN AGAIN FROM THE STORE, where it stands -- a tap, Clear and Send do this, and so does a row arriving from the account on another device § */
function orderRedraw_(box, focus) {
  const k = box && box.getAttribute('data-k');
  const x = k && stuffItemsAll_().find(it => ansKey_(it) === k);
  if (!x || !orderIs_(x)) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = orderBox_(x);
  const next = wrap.firstElementChild;
  box.replaceWith(next);
  const f = focus && next.querySelector(focus);
  if (f) { try { f.focus({ preventScroll: true }); } catch (e) {} }
}
const orderOf_ = el => {
  const box = el && el.closest('.qp-order');
  const k = box && box.getAttribute('data-k');
  const n = box ? +box.getAttribute('data-n') || 0 : 0;
  return k && n ? { box, k, n, seq: orderSeq_(ansRead_(k), n), had: document.activeElement === el } : null;
};

on('qp-place', (el) => {
  const o = orderOf_(el);
  const m = +el.getAttribute('data-n');
  if (!o || !(m >= 1 && m <= o.n)) return;
  const at = o.seq.indexOf(m);
  /* A SLOT TAKES BACK AND AN ITEM PLACES, AND NOTHING ELSE. § */
  const fromSlot = el.classList.contains('qp-slot');
  if (fromSlot !== (at !== -1)) { orderRedraw_(o.box, ''); return; }
  /* WHERE THE FOCUS GOES: taken back, to the item, live again in its row; placed, to the next item still
     to place (its ghost is disabled and cannot hold it), and to Send once every one is placed. */
  let focus = '.qp-item[data-n="' + m + '"]';
  if (fromSlot) o.seq[at] = 0;
  else {
    const free = o.seq.indexOf(0);
    if (free === -1) return;
    o.seq[free] = m;
    const left = [];
    for (let i = 1; i <= o.n; i++) if (o.seq.indexOf(i) === -1) left.push(i);
    const next = left.find(i => i > m) || left[0];
    focus = next ? '.qp-item[data-n="' + next + '"]' : '.qp-order-send';
  }
  /* THROUGH `ansStore_`, the one writer -- kept on this device. A tap is not a submission: Send is. */
  ansStore_(o.k, orderSay_(o.seq));
  orderRedraw_(o.box, o.had ? focus : '');
});

on('qp-order-clear', (el) => {
  const o = orderOf_(el);
  if (!o) return;
  ansStore_(o.k, '');
  orderRedraw_(o.box, o.had ? '.qp-item[data-n="1"]' : '');
});

on('qp-order-send', (el) => {
  const o = orderOf_(el);
  if (!o) return;
  const said = orderSay_(o.seq);
  /* MARKED IS A SUBMISSION, right or not yet -- and a row with a place still empty is neither: it says
     so, and nothing is recorded. */
  const x = stuffItemsAll_().find(it => ansKey_(it) === o.k);
  const v = x ? markOrder_(said, orderWays_(x)) : null;
  if (v === null) ORDER_HOLE.set(o.k, said);
  else {
    ORDER_HOLE.delete(o.k);
    subRecord_(o.k, said, v ? 'right' : 'wrong');
  }
  orderRedraw_(o.box, o.had ? '.qp-order-send' : '');
});

on('qp-choose', (el) => {
  const box = el.closest('.qp-choices');
  const card = el.closest('.qcard');
  if (!box || !card) return;
  const k = box.getAttribute('data-k');
  const need = +box.getAttribute('data-need') || 1;
  const right = box.getAttribute('data-right');
  const n = +el.getAttribute('data-n');
  let picked = String(ansRead_(k) || '').split(',').map(t => parseInt(t, 10)).filter(v => v > 0);
  const sorted = a => a.slice().sort((p, q) => p - q).join(',');
  /* ONLY A RIGHT PICK IS FINAL: after "Not yet" any tap is a new try (385, Theo tapping and tapping). */
  if (right && picked.length >= need && sorted(picked) === right) return;
  if (need === 1) picked = [n];
  else if (picked.includes(n)) picked = picked.filter(v => v !== n);
  else picked = picked.concat(n).slice(-need);
  /* THROUGH `ansStore_`, the one writer — kept on this device. */
  ansStore_(k, picked.join(','));
  /* ENOUGH CHOSEN IS A SUBMISSION, marked at once: § */
  if (picked.length >= need) {
    const said = picked.join(',');
    subRecord_(k, said, !right ? 'sent' : picked.slice().sort((a, b) => a - b).join(',') === right ? 'right' : 'wrong');
  }
  choiceRedraw_(box);
  /* RIGHT DOES NOT OPEN THE ANSWER PAGE ANY MORE. § */
});

/* ---------- A WORDED ANSWER OF A MARK OR TWO, MARKED BY RULE BEFORE ANY AI (359) */
/* `mark_words`: points split by `;`, a mark each; ways by `|`; words that must all be there joined by `+`; a number is
   compared as a number. Words are matched on their stems, and a word straight after "not" or "no" does not count. */
const MW_STOP = /^(the|a|an|of|to|is|it|and|or|in|on|be|as|so|by|at|for)$/;
function mwStem_(w) {
  /* a full stop ends the sentence, not the word: "No." is "no" and "the same." is "same" */
  let s = String(w || '').toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.+$/, '');
  if (/^-?\d/.test(s)) return s;
  const cut = s.replace(/(ations?|ings?|edly|ed|es|ly|er|est|s)$/, '');
  return cut.length >= 3 ? cut : s;
}
function mwToks_(t) {
  /* "No, the powers ...": a No stopped by its punctuation is the verdict, and must not negate the next word */
  return String(t || '').toLowerCase().replace(/^\s*no\s*[,.:;!\u2013\u2014]+/, 'no verdict ').replace(/['\u2019]/g, '').replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/[^a-z0-9.\s-]/g, ' ')
    .split(/[\s-]+/).filter(Boolean).map(mwStem_).filter(Boolean);
}
/* A PAIR, A VECTOR AND A LINE READ WITH THEIR SIGNS (385), one token each beside the words: `(5, -4)`, `(5/-4)`, `⟮5,-4⟯`,
   "5 right 4 down" are `pr5nm4`; `x = -2` is `lnxm2`, `y = -x` `lnymx` */
const mwNum_ = n => (+n < 0 ? 'm' : '') + String(Math.abs(+n));
function mwShapes_(t) {
  const s = String(t || '').toLowerCase().replace(/[\u2212\u2013]/g, '-').replace(/&minus;/g, '-');
  const out = [], N = '(-?\\d+(?:\\.\\d+)?)';
  const pair = (a, b) => out.push('pr' + mwNum_(a) + 'n' + mwNum_(b));
  s.replace(new RegExp('[(\u27ee]\\s*' + N + '\\s*(?:[,/]\\s*|\\s(?=\\s*-?\\d))' + N + '\\s*[)\u27ef]', 'g'), (m, a, b) => pair(a, b));
  const mv = { right: [1, 0], left: [-1, 0], up: [0, 1], down: [0, -1] };
  const steps = [];
  s.replace(/(\d+(?:\.\d+)?)\s*(?:squares?|units?)?\s*(?:to\s+the\s+)?(right|left|up|down)\b|\b(right|left|up|down)\s*(\d+(?:\.\d+)?)/g, (m, n1, d1, d2, n2) => { steps.push([mv[d1 || d2], +(n1 || n2)]); });
  if (steps.length) { let x = 0, y = 0; steps.forEach(([d, n]) => { x += d[0] * n; y += d[1] * n; }); pair(x, y); }
  s.replace(new RegExp('\\b([xy])\\s*=\\s*(-?)\\s*(x|y|\\d+(?:\\.\\d+)?)\\b', 'g'), (m, v, sg, w) => out.push('ln' + v + (/[xy]/.test(w) ? (sg ? 'm' : '') + w : mwNum_(sg + w))));
  s.replace(/\b([xy])[\s-]*axis\b/g, (m, v) => out.push('ln' + (v === 'x' ? 'y' : 'x') + '0'));
  return out;
}
function mwHas_(toks, term) {
  const sh = /^\s*(\(.*\)|[xy]\s*=.*)\s*$/.test(term) ? mwShapes_(term) : [];
  if (sh.length) return toks.indexOf(sh[0]) !== -1;
  const want = mwToks_(term).filter(w => !MW_STOP.test(w));
  if (!want.length) return false;
  for (let i = 0; i + want.length <= toks.length; i++) {
    let b = i - 1;
    while (b >= 0 && MW_STOP.test(toks[b])) b--;
    if (b >= 0 && /^(not|no|never|isnt|wasnt)$/.test(toks[b])) continue;
    if (want.every((w, j) => toks[i + j] === w || (/^-?[\d.]+$/.test(w) && parseFloat(toks[i + j]) === parseFloat(w)))) return true;
  }
  return false;
}
/* `{ got, of }`, or null for nothing typed. */
function markWords_(typed, rule) {
  if (!String(typed || '').trim()) return null;
  const toks = mwToks_(typed).concat(mwShapes_(typed));
  const points = String(rule || '').split(';').map(p => p.trim()).filter(Boolean);
  const got = points.filter(p => p.split('|').some(way => way.split('+').every(term => mwHas_(toks, term)))).length;
  return { got: got, of: points.length };
}

/* ---------- A GRID OR TABLE WITH BLANKS IS FILLED IN WHERE IT STANDS, A CELL AT A TIME (359) */
/* a blank is empty however many spaces the transcriber left in it (`&nbsp;&nbsp;&nbsp;&nbsp;` is one blank) */
const CELL_BLANK = /<(td|th)([^>]*)>(?:\s|&nbsp;|\u00a0)*<\/\1>/g;
/* `cells` READ: one entry a blank, in reading order -- `{ label, ways }`, and `ways` empty for a blank not asked. */
function cellsOf_(x) {
  const raw = String((x && x.cells) || '').trim();
  if (!raw) return [];
  return raw.split(';').map((c, i) => {
    const m = /^\s*([^=|]{1,12}?)\s*=\s*(.*)$/.exec(c);
    const ways = (m ? m[2] : c).trim();
    return { label: m ? m[1].trim() : String(i + 1), ways: ways === '-' ? '' : ways };
  });
}
/* EACH CELL MARKED ON ITS OWN by `markAnswer_`: `{ right, of, each }`, `each[i]` true, false, or null for nothing typed. */
function markCells_(vals, cells) {
  const each = cells.map((c, i) => c.ways ? markAnswer_(vals[i] || '', c.ways) : undefined);
  const asked = each.filter(v => v !== undefined);
  return { right: asked.filter(v => v === true).length, of: asked.length, each: each };
}
const cellsVals_ = v => String(v == null ? '' : v).split(' ; ');
function cellInput_(k, c, i, v) {
  if (!c.ways) return '';
  /* a cell holding a list (`24, 68`) needs the comma, which a phone's number pad does not have */
  const num = /^[-\d.,\s|£$%°/]+$/.test(c.ways) && !/,\s/.test(c.ways);
  return `<input class="qp-cell" data-k="${esc(k)}" data-n="${i}" aria-label="Blank ${esc(c.label)}" autocomplete="off"
    inputmode="${num ? 'decimal' : 'text'}" value="${esc(v || '')}">`;
}
/* THE QUESTION'S OWN TABLE, ITS BLANKS MADE CELLS -- or '' when it has none with as many blanks as `cells`. */
function cellsTable_(x, html) {
  const cells = cellsOf_(x);
  if (!cells.length) return '';
  const k = ansKey_(x), vals = cellsVals_(ansRead_(k));
  let n = 0;
  const out = String(html || '').replace(/<table[\s\S]*?<\/table>/, t => {
    const blanks = (t.match(CELL_BLANK) || []).length;
    if (blanks !== cells.length) return t;
    return t.replace(CELL_BLANK, (m, tag, at) => {
      const i = n++;
      return `<${tag}${at} class="qp-cell-at">${cellInput_(k, cells[i], i, vals[i])}</${tag}>`;
    }).replace(/^<table/, '<table data-cells="1"');
  });
  return n ? out : '';
}
/* THE BOX UNDER IT: Check marks every cell; with no table to fill, the cells stand in a row of their own. */
const cellsHere_ = (x, html) => (cellsOf_(x).length && cellsTable_(x, html)) || html;
/* THE WORDS THE ANSWER CARD ITSELF SHOWS -- its last chunk, as `questionCard_` draws it; the part's whole words where it has no plan */
const cellsCardHtml_ = x => {
  try { const c = partChunks_(x); return c.length ? chunkHtml_(c[c.length - 1], null, x) : String((x && x.html) || ''); }
  catch (e) { return String((x && x.html) || ''); }
};
function cellsBox_(x) {
  const cells = cellsOf_(x), k = ansKey_(x);
  /* IN THE TABLE ON THIS CARD, not merely in the part's words: a long part's table on a page in front had no box anywhere (457) */
  const inTable = !!cellsTable_(x, cellsCardHtml_(x));
  const vals = cellsVals_(ansRead_(k));
  const row = inTable ? '' : `<div class="qp-cells">${cells.map((c, i) => c.ways
    ? `<label class="qp-cell-l"><span>${esc(c.label)}</span>${cellInput_(k, c, i, vals[i])}</label>` : '').join('')}</div>`;
  const said = subBoxSay_(k, ansRead_(k));
  return `<div class="qp-mark qp-compose qp-cells-box${said.cls ? ' ' + said.cls : ''}" data-k="${esc(k)}">${row}
    <div class="tile-row">${measTiles_(x)}${checkTile_({ act: 'qp-cells-check', cls: 'qp-check' })}</div>
    <span class="qp-verdict" role="status" aria-live="polite">${esc(said.text)}</span>
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span></div>`;
}
const cellsIn_ = el => { const card = el && el.closest('.qcard'); return card ? [].slice.call(card.querySelectorAll('.qp-cell')) : []; };
function cellsRead_(el) {
  const vals = [];
  cellsIn_(el).forEach(c => { vals[+c.getAttribute('data-n')] = c.value; });
  return vals;
}
document.addEventListener('input', e => {
  const el = e.target && e.target.classList && e.target.classList.contains('qp-cell') ? e.target : null;
  if (!el) return;
  const vals = cellsRead_(el);
  for (let i = 0; i < vals.length; i++) if (vals[i] == null) vals[i] = '';
  ansStore_(el.getAttribute('data-k') || '', vals.join(' ; '));
  el.classList.remove('is-right', 'is-near');
});
on('qp-cells-check', el => {
  const box = el.closest('.qp-cells-box');
  const out = box && box.querySelector('.qp-verdict');
  const x = box && stuffItemsAll_().find(it => ansKey_(it) === box.getAttribute('data-k'));
  if (!x || !out) return;
  const vals = cellsRead_(box), m = markCells_(vals, cellsOf_(x));
  cellsIn_(box).forEach(c => {
    const v = m.each[+c.getAttribute('data-n')];
    c.classList.toggle('is-right', v === true);
    c.classList.toggle('is-near', v === false);
  });
  box.classList.remove('is-right', 'is-near');
  if (!m.each.some(v => v === true || v === false)) { out.textContent = 'Fill a cell first'; return; }
  const all = m.right === m.of;
  box.classList.add(all ? 'is-right' : 'is-near');
  out.textContent = all ? 'Correct — every cell' : m.right + ' of ' + m.of + ' cells right';
  subRecord_(box.getAttribute('data-k'), vals.join(' ; '), all ? 'right' : 'wrong');
});

/* "and" parts values only between numbers or letters ("36 and 48", "C and D"), never "two hundred and nine" */
function multiSplit_(s) {
  return [].concat(...String(s).split(/\s*,\s*/).map(v => (/\d|^[a-z]{1,2}\s+(and|&)\s+[a-z]{1,2}$/i.test(v)
    ? v.replace(/^and\s+/i, '').split(/\s+and\s+|\s*&\s*/) : [v])));
}
/* ---------- ONE BOX PER VALUE (362): an answer of several values gets a box each, not one box and commas to type. */
/* How many, from `accept`: a rule's `count N`, a `set`'s groups, a way's comma list; a rule with no count grows a box at a time. */
function multiOf_(x) {
  const all = String((x && x.accept) || '').split('|').map(w => w.trim()).filter(Boolean);
  const ways = all.filter(w => !/^rule:/i.test(w));
  for (const r of all.filter(w => /^rule:/i.test(w))) {
    const body = r.replace(/^rule:\s*/i, '');
    if (/(?:^|,)\s*(expr|eqn)\s/.test(body)) continue;   /* one expression, one box */
    const set = /(?:^|,)\s*set\s+([^,]+)/.exec(body);
    if (set) return { n: set[1].split('/').length, words: true, wrap: '', labels: [] };
    const c = /(?:^|,)\s*count\s+(\d+)/.exec(body);
    if (c && +c[1] >= 2) return { n: +c[1], wrap: '', labels: [] };
    if (!c) return { n: 0, grow: true, wrap: '', labels: [] };
  }
  /* a way splits only into short values: never a thousands comma (1,000) or a sentence */
  const split = w => {
    const p = /^\((.*)\)$/.exec(w), s = p ? p[1] : w;
    if (/\d,\d{3}(?!\d)/.test(s) || !/,|\sand\s|&/.test(s)) return null;
    const parts = multiSplit_(s);
    if (parts.length < 2 || parts.some(v => !/^[-a-z]{0,2}\s*=?\s*[-\d.\/£$%°a-z²³√π ]{1,14}$/i.test(v) || v.split(' ').length > 3)) return null;
    return { parts: parts, wrap: p ? '()' : '' };
  };
  const first = ways.length ? split(ways[0]) : null;
  if (!first || first.parts.length > 16 || ways.map(split).some(g => g && g.parts.length !== first.parts.length)) return null;
  return { n: first.parts.length, wrap: first.wrap, labels: first.parts.map(v => (/^([a-z])\s*=/i.exec(v) || [])[1] || '') };
}
/* A SAVED ANSWER INTO ITS BOXES — an old one typed with commas too: brackets and `x =` off, split at the commas. */
function multiVals_(val, m) {
  let s = String(val == null ? '' : val).trim();
  if (m.wrap) s = s.replace(/^\((.*)\)$/, '$1');
  const out = s ? multiSplit_(s).map((v, i) => (m.labels[i] ? v.replace(new RegExp('^' + m.labels[i] + '\\s*=\\s*', 'i'), '') : v)) : [];
  return out;
}
/* AND THE BOXES INTO ONE ANSWER: what the marker and the account receive, written as the scheme writes it. */
function multiJoin_(vals, m) {
  const v = vals.map(s => String(s == null ? '' : s).trim());
  while (v.length && !v[v.length - 1]) v.pop();
  if (!v.length) return '';
  const s = v.map((s, i) => (m.labels[i] ? m.labels[i] + ' = ' + s : s)).join(', ');
  return m.wrap ? '(' + s + ')' : s;
}
function multiField_(k, i, v, kind, signs) {
  return kpField_(k + '#' + i, v, kind, signs, 'Answer ' + (i + 1), { n: i, k: k });
}
function multiBoxes_(x, k, val, m, maths, signs) {
  const vals = multiVals_(val, m);
  const n = m.grow ? vals.filter(Boolean).length + 1 : m.n;
  const kind = m.words || !maths ? 'words' : 'maths';
  const one = i => `<label class="qp-ans qp-multi-f">${m.labels[i] ? `<span class="qp-multi-l">${esc(m.labels[i])} =</span>` : ''}${
    multiField_(k, i, vals[i] || '', kind, signs)}</label>`;
  const boxes = [];
  for (let i = 0; i < n; i++) boxes.push(one(i));
  /* the joined answer, first in the box, is what Check, Send and every verdict painter read in place of `.qp-ans-in` */
  return `<div class="qp-multi${m.wrap ? ' is-pair' : ''}" data-mk="${esc(k)}" data-m="${esc(JSON.stringify(m))}" data-kind="${kind}"${
    signs ? ` data-signs="${+signs}"` : ''}${m.grow ? ' data-grow="1"' : ''}><input type="hidden" class="qp-multi-val" data-k="${esc(k)}" value="${esc(multiJoin_(vals, m))}">${boxes.join('')}</div>`;
}
const multiIns_ = box => [].slice.call(box.querySelectorAll('.kp-in[data-do="qp-multi"]'));
/* EVERY KEY IN A BOX: the joined answer kept under the question's own key, and a filled last box grows another where the count is open. */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-multi"]');
  const box = el && el.closest('.qp-multi');
  if (!box) return;
  let m;
  try { m = JSON.parse(box.getAttribute('data-m')); } catch (err) { return; }
  const ins = multiIns_(box), all = box.querySelector('.qp-multi-val');
  const v = multiJoin_(ins.map(i => i.value), m);
  if (all) all.value = v;
  ansStore_(box.getAttribute('data-mk') || '', v);
  if (box.hasAttribute('data-grow') && ins.length && ins[ins.length - 1] === el && el.value.trim()) {
    const at = document.createElement('div');
    const kind = box.getAttribute('data-kind');
    at.innerHTML = `<label class="qp-ans qp-multi-f">${multiField_(box.getAttribute('data-mk'), ins.length, '', kind, +box.getAttribute('data-signs') || 0)}</label>`;
    box.appendChild(at.firstChild);
  }
  const mark = box.closest('.qp-mark');
  if (mark && all && typeof subVerdictPaint_ === 'function') subVerdictPaint_(mark, all);
});
/* AN ANSWER ARRIVING FROM ANOTHER DEVICE OR TAB (answers.js) lands on the joined value; its boxes take it too. */
function multiFill_(all) {
  const box = all && all.closest && all.closest('.qp-multi');
  if (!box) return;
  let m;
  try { m = JSON.parse(box.getAttribute('data-m')); } catch (err) { return; }
  const vals = multiVals_(all.value, m);
  multiIns_(box).forEach((inp, i) => {
    if (inp.value === (vals[i] || '')) return;
    inp.value = vals[i] || '';
    if (typeof kpRender_ === 'function') kpRender_(inp);
  });
}
/* THE BOX AFTER THIS ONE, for ✓ and the comma key on the pad: one tap from box to box. */
function multiNext_(inp) {
  const box = inp && inp.closest && inp.closest('.qp-multi');
  if (!box) return null;
  const ins = multiIns_(box), i = ins.indexOf(inp);
  return i >= 0 && i < ins.length - 1 ? ins[i + 1] : null;
}

function ansBox_(x) {
  if (x && Array.isArray(x.choices) && x.choices.length >= 2) return choiceBox_(x);
  if (cellsOf_(x).length) return cellsBox_(x);
  const k = ansKey_(x);
  /* MARKABLE ONLY WHERE `accept` SAYS SO. § */
  const can = String(x && x.accept || '').trim();
  /* EVERY ANSWER IS TYPED ON THE SITE'S OWN PAD, a maths one opening on the maths keys and a worded one on the letters. § */
  const maths = ansMaths_(x);
  /* THE SIGNS ROW GOES BY THE SCHEME, WHATEVER KIND OF BOX IT IS. § */
  const signs = (kpSigns_(x) ? 1 : 0) | (kpVec_(x) ? 2 : 0);
  /* NO CAPTION OVER THE BOX. § */
  /* ---------- THE FIGURE TILE STANDS BESIDE THE BOX, NOT IN THE ROW UNDER IT § */
  const fig = measTiles_(x);
  /* ---------- THE ANSWER BOX IS A CHAT BAR, WITH A SEND TILE § */
  const rule = can ? '' : String(x && x.markWords || '').trim();
  const aiNow = can ? '' : aiTile_(x);
  /* A RULE MARKS FIRST; the AI tile stays hidden until the rule cannot give every mark (`qp-rule`). */
  const ai = rule && aiNow ? `<span class="qp-ai-later" hidden>${aiNow}</span>` : aiNow;
  const send = can ? checkTile_({ act: 'qp-check', cls: 'qp-check' })
    : rule ? checkTile_({ act: 'qp-rule', cls: 'qp-check' }) + ai
    : ai || subSendTile_();
  const val = ansRead_(k);
  /* A PHOTO OF THE WORKING (501, working.js): its tile in this row, its photos in a strip under the box. */
  const wk = typeof workTile_ === 'function' ? workTile_(x) : '', ws = wk && typeof workStrip_ === 'function' ? workStrip_(x) : '';
  /* ---------- AN ESSAY IS WRITTEN ON A SHEET, NOT IN A CHAT BAR § */
  /* THE REVIEW OF 9 OCT ADDED TWO THINGS TO THIS ROW. § */
  /* AND SINCE 9 OCT (note 308) THE SHEET IS SENT LIKE EVERY OTHER BOX: § */
  if (ansEssay_(x)) {
    const v = val;
    const note = ai || can ? '' : aiWhyNot_(x);
    const kept = ai && typeof aiKeptView_ === 'function' ? aiKeptView_(k, v) : null;
    const said = subBoxSay_(k, v);
    const own = kept && (kept.fresh || !said.text) ? kept : null;
    const vcls = own ? own.cls : said.cls, vsay = own ? own.verdict : said.text;
    const foot = `<div class="tile-row qp-sheet-foot">${fig}${send}${wk}${note ? `<span class="qp-ai-note">${esc(note)}</span>` : ''}
      <span class="qp-words">${esc(kpWordsSay_(kpWordCount_(v)))}</span></div>`;
    const sheet = `<label class="qp-ans qp-sheet" aria-label="Your answer">${kpField_(k, v, 'essay', signs)}</label>`;
    return `<div class="${send ? 'qp-mark ' : ''}qp-compose qp-essay${ai ? ' qp-ai' : ''}${send && vcls ? ' ' + vcls : ''}"${can ? ` data-accept="${esc(can)}"` : ''}>
    ${sheet}${foot}${ws}
    ${send ? `<span class="qp-verdict" role="status" aria-live="polite">${esc(vsay)}</span>` : ''}
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>
  </div>${ai ? `<p class="qp-ai-why">${own ? esc(own.why) : ''}</p>` : ''}`;
  }
  const many = can ? multiOf_(x) : null;
  const bar = many ? `<div class="qp-ans-row qp-bar qp-multi-bar">${multiBoxes_(x, k, val, many, maths, signs)}${fig}${send}${wk}</div>`
    : `<div class="qp-ans-row qp-bar"><label class="qp-ans${maths ? ' qp-ans-maths' : ''}" aria-label="Your answer">
    ${kpField_(k, val, maths ? 'maths' : 'words', signs)}
  </label>${fig}${send}${wk}</div>`;
  if (!send) return `<div class="qp-compose">${bar}${ws}
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span></div>`;
  /* THE VERDICT IS THE LATEST SUBMISSION'S, WHILE THE BOX HOLDS WHAT WAS SENT -- on this device or on the account, next sign-in § */
  const said = subBoxSay_(k, val);
  return `<div class="qp-mark qp-compose${ai ? ' qp-ai' : ''}${said.cls ? ' ' + said.cls : ''}"${can ? ` data-accept="${esc(can)}"` : ''}${rule ? ` data-rule="${esc(rule)}" data-marks="${esc(String(Number(x.marks) || ''))}"` : ''}>
    ${bar}${ws}
    <span class="qp-verdict" role="status" aria-live="polite">${esc(said.text)}</span>
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>
  </div>${ai ? '<p class="qp-ai-why"></p>' : ''}`;
}
/* THE PLAIN SEND, for somebody signed in -- see `ansBox_`. The Check tile every Send on a question's
   pages is, under its own name, so nothing that runs Check runs it. */
function subSendTile_() {
  if (!(typeof whoIs_ === 'function' && whoIs_())) return '';
  return checkTile_({ act: 'qp-send', cls: 'qp-send' });
}
/* WHAT A BOX'S VERDICT LINE SAYS AS IT IS DRAWN: the latest submission's verdict, if the box holds it. */
function subBoxSay_(k, val) {
  const latest = typeof subLatest_ === 'function' ? subLatest_(k) : null;
  return latest && latest.a === String(val == null ? '' : val) && typeof subSay_ === 'function'
    ? subSay_(latest.v) : { text: '', cls: '' };
}

/* ---------- THE VERDICT § */
on('qp-check', (el) => {
  const box = el.closest('.qp-mark');
  const card = el.closest('.qcard');
  /* ITS OWN BOX'S FIELD FIRST (508), as `qp-rule` and `qp-send` read it: a card with two boxes marked the first one's. */
  const inp = (box && box.querySelector('.qp-multi-val, .qp-ans-in')) || (card && card.querySelector('.qp-multi-val, .qp-ans-in'));
  const out = box && box.querySelector('.qp-verdict');
  if (!box || !inp || !out) return;
  const verdict = markAnswer_(inp.value, box.getAttribute('data-accept'));
  box.classList.remove('is-right', 'is-near');
  if (verdict === null) {
    out.textContent = 'Write something first';
    return;
  }
  box.classList.add(verdict ? 'is-right' : 'is-near');
  out.textContent = verdict ? 'Correct' : 'Not yet — have another go';
  /* MARKED IS A SUBMISSION, right or not yet -- each one its own event on the account, and the latest is
     what the card and every device show (js/submit.js). Signed out it is this visit's alone. */
  subRecord_(inp.getAttribute('data-k'), inp.value, verdict ? 'right' : 'wrong');
  /* A RIGHT ANSWER DOES NOT OPEN THE ANSWER PAGE. § */
});

/* ---------- BY RULE: full marks is decided; anything less says what the rule found and offers the AI, if it is on (359). */
on('qp-rule', (el) => {
  const box = el.closest('.qp-mark');
  const inp = box && box.querySelector('.qp-multi-val, .qp-ans-in');
  const out = box && box.querySelector('.qp-verdict');
  if (!inp || !out) return;
  const m = markWords_(inp.value, box.getAttribute('data-rule'));
  box.classList.remove('is-right', 'is-near');
  if (!m) { out.textContent = 'Write something first'; return; }
  const of = Math.max(1, Math.min(m.of, Number(box.getAttribute('data-marks')) || m.of));
  const got = Math.min(m.got, of);
  box.classList.add(got >= of ? 'is-right' : 'is-near');
  const later = box.querySelector('.qp-ai-later');
  if (later) later.hidden = got >= of;
  out.textContent = got + ' of ' + of + ' mark' + (of === 1 ? '' : 's') + ' · by key words' + (got < of && later ? ' — or mark it with AI' : '');
  subRecord_(inp.getAttribute('data-k'), inp.value, 'rule:' + got + '/' + of);
});

/* ---------- SEND, WHERE NOTHING CAN MARK IT § */
on('qp-send', (el) => {
  const box = el.closest('.qp-mark');
  const inp = box && box.querySelector('.qp-multi-val, .qp-ans-in');
  const out = box && box.querySelector('.qp-verdict');
  if (!inp || !out || el.disabled) return;
  box.classList.remove('is-right', 'is-near');
  if (!String(inp.value || '').trim()) { out.textContent = 'Write something first'; return; }
  out.textContent = subRecord_(inp.getAttribute('data-k'), inp.value, 'sent') ? 'Sent' : 'Sign in to send it';
});

/* ---------- WHO IS WORKING § */
/* ---------- `on('qp-who')` WAS HERE § */


/* SAVED AS IT IS TYPED, through a delegated listener rather than a handler per box — there are thousands of these and only one of them is ever being typed into. § */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  if (!el) return;
  /* THROUGH `ansStore_`, which keeps it on this device. § */
  ansStore_(el.getAttribute('data-k') || '', el.value || '', el.getAttribute('data-kp') === 'words');
  /* A WORDED ANSWER GROWS AS IT IS TYPED, the way a message bar does: § */
  if (el.tagName === 'TEXTAREA' && el.closest('.qp-bar') && !el.classList.contains('kp-in')) {
    el.style.height = '';
    if (el.scrollHeight) el.style.height = el.scrollHeight + 'px';
  }
  /* A VERDICT IS ABOUT THE ANSWER IT MARKED, and the moment a letter changes it is about an answer that is no longer there. § */
  const mark = el.closest('.qp-mark');
  if (mark && typeof subVerdictPaint_ === 'function') subVerdictPaint_(mark, el);
});


/* SOME ANSWERS ARE A MARK ON THE PICTURE, AND A TEXTAREA CANNOT HOLD ONE. § */
/* ---------- AND THEY ARE WHOEVER IS SIGNED IN'S, AS THE TYPED ANSWER IS § */
const padItemKey_ = x => (x && (x.key || x.name)) || '?';
/* ---------- `pad:` IS A QUESTION'S, AND A PEN THAT IS NOT ON A QUESTION SAYS SO IN ITS KEY § */
const padPrefix_ = x => (x && x.prefix) || 'pad';
const padKey_ = x => padPrefix_(x) + ':' + (whoIs_() ? whoIs_() + ':' : '') + padItemKey_(x);
function padAdopt_(k, bare) {
  if (!k || !bare || k === bare) return;
  try {
    /* "EMPTY" IS ASKED OF THE WRITER'S OWN READER (`ansValue_`, answers.js), the visit's copy first. § */
    const read = typeof ansValue_ === 'function' ? ansValue_ : (x => localStorage.getItem(x));
    if (read(k) !== null) return;
    const v = read(bare);
    if (v === null) return;
    /* NOR A DRAWING SOMEBODY ELSE MADE SIGNED OUT — `ansRead_`'s rule, asked of the same `ansMayMove_`
       (answers.js). Only into an empty pad, so any answer but "no" moves it. */
    if (typeof ansMayMove_ === 'function' && !ansMayMove_(bare, k)) return;
    /* THROUGH `ansStore_`, so the marks that became this person's go up to their account with the rest. */
    if (typeof ansStore_ === 'function') ansStore_(k, v); else localStorage.setItem(k, v);
    /* AND OFF THE SIGNED-OUT KEY THROUGH THE WRITER: the store's copy, the visit's, and the mark. */
    if (typeof ansLocalPut_ === 'function') ansLocalPut_(bare, null); else localStorage.removeItem(bare);
  } catch (e) {}
}

/* WHICH QUESTIONS GET ONE. § */
const PAD_TYPES = { drawing: 1, annotate: 1 };
const padWanted_ = x => !!PAD_TYPES[String((x && x.answerType) || '').trim().toLowerCase()];

/* THE PICTURE IT DRAWS ON, WHICH IS NOT ALWAYS THE QUESTION'S OWN. § */
function padSource_(x) {
  if (!x) return null;
  /* A ROW WITH OPTIONS IS ANSWERED BY CHOOSING ONE, and is given nothing to draw on (18 Oct, 356): § */
  if (Array.isArray(x.choices) && x.choices.length && (typeof ruleOn_ !== 'function' || ruleOn_('pen-chosen'))) return null;
  /* AND A ROW WITH CELLS IS ANSWERED IN ITS TABLE (`cellsTable_`), so nothing to draw on either. */
  if (String(x.cells || '').trim()) return null;
  const surf = padSurface_(x);
  if (!padWanted_(x) && (!surf || surf === 'text')) return null;
  if (x.diagram) return { svg: x.diagram, from: 'part' };
  const stems = (x.stems || []).filter(p => p && p.diagram);
  if (stems.length === 1) return { svg: stems[0].diagram, from: stems[0] };
  if (surf && surf !== 'text') return { svg: surfaceSvg_(surf), from: 'surface', surface: surf };
  return null;
}

/* ---------- WHAT A QUESTION IS ANSWERED WITH: A DRAWING, A VALUE, OR BOTH § */
function answerKinds_(x) {
  const draw = !!padSource_(x);
  /* key words mark it too (`mark_words`): the box is what is marked, the pen is the working (366) */
  return { draw: draw, value: !draw || !!String((x && x.accept) || '').trim() || !!String((x && x.markWords) || '').trim() || cellsOf_(x).length > 0 };
}

/* ---------- WHICH TOOLS A QUESTION'S PEN COMES WITH § */
function padTools_(x) {
  /* IN ONE ORDER WHATEVER ORDER THEY WERE FOUND IN, so the bar reads Pen, Ruler, Compass on every
     card and a thumb learns where each one is. */
  const ORDER = ['pen', 'ruler', 'compass', 'protractor'];
  const want = { pen: 1 };
  const add = t => { want[t] = 1; };
  const out = () => ORDER.filter(t => want[t]);
  if (!x) return out();
  const needs = (Array.isArray(x.needs) ? x.needs : String(x.needs || '').split(','))
    .map(v => String(v == null ? '' : v).trim().toLowerCase()).filter(Boolean);
  needs.forEach(v => {
    if (/geometry set|maths set|mathematical instruments/.test(v)) { add('ruler'); add('compass'); add('protractor'); }
    if (/ruler|straight ?edge/.test(v)) add('ruler');
    if (/compass/.test(v)) add('compass');
    if (/protractor|angle measurer/.test(v)) add('protractor');
  });
  const words = [x.lead, x.html].concat((x.stems || []).map(p => p && p.html))
    .map(h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' '))
    .join(' ').replace(/\s+/g, ' ').toLowerCase().replace(/plotting compass(es)?/g, ' ');
  if (/\b(use|using|with) (a |an |your )?ruler\b|\bruler and (a pair of )?compasses\b|\bstraight ?edge\b/.test(words)) add('ruler');
  if (/\bcompasses\b/.test(words)) add('compass');
  const built = /\bconstruct(ion|ions|ed|ing)?\b/.test(words)
    && !/\bconstruct(ion|ions|ed|ing)? (an? |the |your )?([\w-]+ )?([\w-]+ )?(table|tree|graph|chart|diagram|histogram|polygon|sentence|argument|frequency)s?\b/.test(words);
  if (built || /\b(locus|loci|bisector|bisect)\b/.test(words)) { add('ruler'); add('compass'); }
  if (/\bprotractor\b|\bangle measurer\b/.test(words)) add('protractor');
  return out();
}

/* THROUGH `ansValue_`, THE WRITER'S OWN READER (js/answers.js), and not `localStorage` beside it. § */
function padRead_(k) {
  try {
    const raw = typeof ansValue_ === 'function' ? ansValue_(k) : localStorage.getItem(k);
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
}

/* A STROKE IS A POLYLINE AND THAT IS THE WHOLE FORMAT. § */
/* ---------- A FAST LINE IS DRAWN ROUND: CORNER-KEEPING CENTRIPETAL CATMULL-ROM (338) § */
const PAD_CORNER_DEG = 50;
const PAD_CURVE_MIN = 8;
const PAD_CORNER_COS = Math.cos(PAD_CORNER_DEG * Math.PI / 180);
/* A CONTROL POINT TO ONE DECIMAL, "12.3" or "12" -- whole units would bend a curve by up to half a unit. */
const padNum_ = v => String(Math.round(v * 10) / 10);
/* SEGMENTS a..b-1 OF A STROKE `st` (a flat list with no point repeated), with neighbours from the whole of it -- the one writer the stored path and the live § */
function padSegs_(st, k, a, b) {
  const m = st.length / 2;
  const X = i => st[2 * i], Y = i => k * st[2 * i + 1];
  const corner = i => {
    if (i <= 0 || i >= m - 1) return true;
    const ux = X(i) - X(i - 1), uy = Y(i) - Y(i - 1), vx = X(i + 1) - X(i), vy = Y(i + 1) - Y(i);
    return ux * vx + uy * vy <= PAD_CORNER_COS * Math.hypot(ux, uy) * Math.hypot(vx, vy);
  };
  let d = '', c0 = corner(a);
  for (let i = a; i < b; i++) {
    const c1 = corner(i + 1);
    const x0 = X(i), y0 = Y(i), x1 = X(i + 1), y1 = Y(i + 1);
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len < PAD_CURVE_MIN || (c0 && c1)) d += 'L' + st[2 * i + 2] + ' ' + st[2 * i + 3];
    else {
      const d1 = Math.sqrt(len);
      let b1x, b1y, b2x, b2y;
      if (c0) { b1x = x0 + (x1 - x0) / 3; b1y = y0 + (y1 - y0) / 3; }
      else {
        const px = X(i - 1), py = Y(i - 1), d0 = Math.sqrt(Math.hypot(x0 - px, y0 - py));
        const q = 3 * d0 * (d0 + d1), w = 2 * d0 * d0 + 3 * d0 * d1 + d1 * d1;
        b1x = (d0 * d0 * x1 - d1 * d1 * px + w * x0) / q; b1y = (d0 * d0 * y1 - d1 * d1 * py + w * y0) / q;
      }
      if (c1) { b2x = x1 - (x1 - x0) / 3; b2y = y1 - (y1 - y0) / 3; }
      else {
        const nx = X(i + 2), ny = Y(i + 2), d2 = Math.sqrt(Math.hypot(nx - x1, ny - y1));
        const q = 3 * d2 * (d2 + d1), w = 2 * d2 * d2 + 3 * d2 * d1 + d1 * d1;
        b2x = (d2 * d2 * x0 - d1 * d1 * nx + w * x1) / q; b2y = (d2 * d2 * y0 - d1 * d1 * ny + w * y1) / q;
      }
      d += 'C' + padNum_(b1x) + ' ' + padNum_(b1y / k) + ' ' + padNum_(b2x) + ' ' + padNum_(b2y / k)
        + ' ' + st[2 * i + 2] + ' ' + st[2 * i + 3];
    }
    c0 = c1;
  }
  return d;
}
/* A STROKE AS A PATH. `k` is the pad's aspect (`data-aspect`, `padAspect_`); a wrong or missing one only changes how a curve bends, never where a point is. § */
const PAD_PATHS = new Map();
const PAD_PATHS_MAX = 4e6;    // characters, keys and paths together: about 8MB
let PAD_PATHS_SIZE = 0;
function padPath_(st, k, live) {
  const plain = () => {
    let d = '';
    for (let i = 0; i + 1 < st.length; i += 2) d += (i ? 'L' : 'M') + st[i] + ' ' + st[i + 1];
    /* A SINGLE TAP IS A DOT, and a dot is a real answer — "mark with a cross" starts as one, and a `<path>` with one point paints nothing at all. § */
    return st.length === 2 ? `M${st[0]} ${st[1]}L${st[0]} ${st[1]}` : d;
  };
  if (!Array.isArray(st) || st.length < 6 || st.length % 2) return plain();
  const q = k > 0 && isFinite(k) ? k : 1;
  const s = [];
  for (let i = 0; i < st.length; i += 2) {
    const x = st[i], y = st[i + 1];
    if (typeof x !== 'number' || typeof y !== 'number' || !isFinite(x) || !isFinite(y)) return plain();
    if (s.length && s[s.length - 2] === x && s[s.length - 1] === y) continue;
    s.push(x, y);
  }
  if (s.length < 6) return plain();
  /* EVERY VALUE IS A FINITE NUMBER HERE, so the key cannot mistake "12" for 12. */
  const key = live ? '' : q + '|' + st.join(',');
  if (key) { const was = PAD_PATHS.get(key); if (was !== undefined) return was; }
  const segs = padSegs_(s, q, 0, s.length / 2 - 1);
  const d = segs.indexOf('C') === -1 ? plain() : 'M' + s[0] + ' ' + s[1] + segs;
  if (key) {
    if (PAD_PATHS_SIZE + key.length + d.length > PAD_PATHS_MAX) { PAD_PATHS.clear(); PAD_PATHS_SIZE = 0; }
    PAD_PATHS.set(key, d);
    PAD_PATHS_SIZE += key.length + d.length;
  }
  return d;
}
/* THE PAD'S SHAPE, H/W OF ITS BOX: § */
function padAspect_(x, svg) {
  if (x && padPrefix_(x) === 'board') return Math.round(4 / 3 * 1e4) / 1e4;
  const m = /viewBox\s*=\s*["']\s*[-\d.eE+]+[\s,]+[-\d.eE+]+[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/.exec(String(svg || ''));
  const w = m ? Number(m[1]) : 0, h = m ? Number(m[2]) : 0;
  return w > 0 && h > 0 && isFinite(w) && isFinite(h) ? Math.round(h / w * 1e4) / 1e4 : 1;
}
/* AND WHAT A PAD ELEMENT SAYS IT IS. */
const padAspectOf_ = pad => Number(pad && pad.getAttribute && pad.getAttribute('data-aspect')) || 1;

/* ---------- THE PEN'S BAR IS A ROW OF TILES § */
/* ---------- AND WHAT THE PEN DRAWS WITH, WHERE THE QUESTION ASKS FOR MORE THAN A PEN § */
const PAD_TOOL_FACE = {
  pen:     { icon: 'pen',     label: 'Pen',     note: 'draw freehand' },
  ruler:   { icon: 'ruler',   label: 'Ruler',   note: 'drag a straight line' },
  compass: { icon: 'compass', label: 'Compass', note: 'press the centre, drag out' },
  protractor: { icon: 'protractor', label: 'Protractor', note: 'on the page: drag it, turn it' },
};
const padToolTile_ = (t, on) => tile_(Object.assign({ act: 'pad-tool', cls: 'qpad-tool', data: { tool: t },
  on: on, pressed: on }, PAD_TOOL_FACE[t]));
/* AND A RULER ON EVERY GRID (357): § */
/* AND ON A QUESTION, EVERY INSTRUMENT, ALWAYS (457): the toolkit says so (`qToolkit_`); a row's words or `needs` can only add. */
const padToolsOf_ = (x, svg) => {
  const t = padTools_(x).filter(k => PAD_TOOL_FACE[k]);
  if (t.indexOf('ruler') === -1 && svg && padGrid_(svg)) t.splice(1, 0, 'ruler');
  const kit = qToolkit_(x);
  if (kit) kit.pen.forEach(k => { if (PAD_TOOL_FACE[k] && t.indexOf(k) === -1) t.push(k); });
  return ['pen', 'ruler', 'compass', 'protractor'].filter(k => t.indexOf(k) !== -1);
};

/* TWO GROUPS IN THE ROW, so it breaks BETWEEN them and never inside one. § */
/* THE PROTRACTOR IS LIT WHILE IT LIES ON THE PAGE, beside whichever tool draws (458): it is put down, not drawn with. */
const padBar_ = (pen, tools, tool, k) => `<div class="qpad-bar tile-row" role="toolbar" aria-label="Drawing">
      ${tools.length > 1 ? `<span class="qpad-group">${tools.map(t => padToolTile_(t, t === 'protractor' ? padProtOn_(k) : t === tool)).join('')}</span>` : ''}
      <span class="qpad-group">${tile_({ icon: 'undo', label: 'Undo', note: 'the last mark', act: 'pad-undo', cls: 'qpad-undo' })}${
      tile_({ icon: 'bin', label: 'Clear', note: 'every mark', act: 'pad-clear', cls: 'qpad-clear' })}</span>
    </div>`;

/* A PICTURE TOO THIN TO DRAW ON IS GIVEN ROOM ABOVE AND BELOW (385): a number line 340x35 was a 31px strip at 390, and its circles go above the line */
const PAD_MIN_ASPECT = 0.3;
function padRoom_(svg) {
  const m = /viewBox\s*=\s*(["'])\s*([-\d.eE+]+)[\s,]+([-\d.eE+]+)[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)\s*\1/.exec(String(svg || ''));
  if (!m) return svg;
  const x0 = +m[2], y0 = +m[3], w = +m[4], h = +m[5];
  if (!(w > 0 && h > 0) || h / w >= PAD_MIN_ASPECT) return svg;
  const H = Math.round(w * PAD_MIN_ASPECT * 100) / 100, y = Math.round((y0 - (H - h) / 2) * 100) / 100;
  return svg.replace(m[0], `viewBox="${x0} ${y} ${w} ${H}"`);
}

function padWrap_(x, svg, foot) {
  /* THE PICTURE AS THE LIBRARY HAS IT names the parts that share it; the roomier copy is only what is drawn */
  const src = svg;
  if (!(x && padPrefix_(x) === 'board')) svg = padRoom_(svg);
  const k = padKey_(x);
  /* DRAWING THE PAD IS OPENING IT, so this is where the phone's old marks become this person's. */
  padAdopt_(k, padPrefix_(x) + ':' + padItemKey_(x));
  const marks = padRead_(k);
  /* AND THE MARKS AN EARLIER PART MADE ON THIS SAME PICTURE, under this part's own and out of reach of
     its Undo and Clear -- (ii)'s cross goes on the scale (i) already marked. See `usesOf_`. */
  const under = padUnderParts_(x, src), was = [].concat(...under.map(usesMine_));
  /* THE MODE IS READ OFF `PAD_ON`, NOT LEFT ON THE ELEMENT BY THE PRESS THAT SET IT. § */
  const pen = PAD_ON === k;
  /* THE PAD'S SHAPE, written on it for the live path and every repaint to read -- one number for all of them,
     so the stroke under the finger and the same stroke drawn again agree byte for byte (`padPath_`). */
  const ka = padAspect_(x, svg);
  const tools = padToolsOf_(x, svg);
  const held = PAD_TOOL.get(k);
  const tool = held && held !== 'protractor' && tools.indexOf(held) !== -1 ? held : 'pen';
  /* THE OVERLAY TAKES ITS BOX FROM THE PICTURE UNDER IT, by stretching to the same box, rather than by parsing a viewBox out of the drawing's markup. § */
  const zm = pen && PAD_ZOOM.has(k) ? PAD_ZOOM.get(k) : null;
  return `<div class="qpad${pen ? ' is-drawing' : ''}${zm ? ' is-zoomed' : ''}" data-k="${esc(k)}" data-aspect="${ka}"${
    under.length ? ` data-under="${esc(under.map(padKey_).join(' '))}"` : ''}${zm ? ` style="--pad-zoom: ${padZoomVar_(zm)}; --pad-zoom-s: ${zm.s.toFixed(4)}"` : ''}>
    <div class="qpad-art">${svg}
      <svg class="qpad-ink" data-noswipe viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true">
        ${under.length ? usesInk_(was, ka) : ''}
        <g class="qpad-g" vector-effect="non-scaling-stroke">${marks.map(st =>
          `<path vector-effect="non-scaling-stroke" d="${padPath_(st, ka)}"/>`).join('')}</g>
        <g class="qpad-aid"></g>
      </svg>
      ${tools.indexOf('protractor') !== -1 && padProtOn_(k) ? padProtHtml_(k) : ''}
    </div>
    ${padBar_(pen, tools, tool, k)}
    ${/* WHERE THE MARKS GO, AND ONLY A `pad:` KEY GOES ANYWHERE: § */
          ''}
    <p class="qpad-note" data-kept-k="${esc(k)}">${esc(padNoteSay_(k))}</p>
    ${/* CHECK IS AT THE CARD'S FOOT, UNDER THE PART'S OWN WORDS, where every other part has it (381): here only for a pad that is itself the foot */
          foot ? padSendRow_(x, marks) : ''}
  </div>`;
}

/* ---------- A DRAWN ANSWER IS SENT LIKE A TYPED ONE (362) */
/* What the submission says: the drawing itself rides under its `pad:` key; this names it, and changes when a mark does. */
function padSay_(marks) {
  const n = (marks || []).length;
  if (!n) return '';
  let h = 0;
  const raw = JSON.stringify(marks);
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return 'drawing \u00b7 ' + n + ' mark' + (n === 1 ? '' : 's') + ' \u00b7 #' + (h >>> 0).toString(36);
}
/* ONLY UNDER A QUESTION ANSWERED BY DRAWING ALONE; one with a value as well is sent by its box. */
function padSendRow_(x, marks) {
  if (!x || x.prefix || !x.key || answerKinds_(x).value) return '';
  const k = ansKey_(x), said = subBoxSay_(k, padSay_(marks));
  /* WITH ITS ANSWER AS GEOMETRY (`draw_answer`, 366) it is marked here, on Check, like a typed one; without, it is sent */
  const geo = String(x.drawAnswer || '').trim();
  const tile = geo ? checkTile_({ act: 'pad-check', cls: 'qp-check' }) : checkTile_({ act: 'pad-send', cls: 'qp-check' });
  return `<div class="qp-mark qpad-send${said.cls ? ' ' + said.cls : ''}" data-k="${esc(k)}" data-pad="${esc(padKey_(x))}"${geo ? ` data-draw="${esc(geo)}" data-marks="${esc(String(Number(x.marks) || ''))}"` : ''}>
      <div class="tile-row">${tile}</div>
      <span class="qp-verdict" role="status" aria-live="polite">${esc(padSaid_(said.text))}</span>
    </div>`;
}
/* a drawing's verdict line: marks counted by the drawing say so, and a sent one is waiting */
const padSaid_ = t => t === 'Sent' ? PAD_SENT_SAY : String(t || '').replace(/ \u00b7 by key words$/, ' \u00b7 by the drawing');
const PAD_SENT_SAY = 'Sent \u2014 waiting to be marked';
/* THE PAD A CHECK ROW MARKS: its own card's, by key -- the row stands under the words, not inside the pad (381) */
function padOfRow_(row) {
  if (!row) return null;
  const k = row.getAttribute('data-pad');
  const inPad = row.closest('.qpad');
  if (inPad || !k) return inPad;
  const mine = p => p.getAttribute('data-k') === k;
  const card = row.closest('.qcard');
  return (card && [].find.call(card.querySelectorAll('.qpad[data-k]'), mine))
    || [].find.call(document.querySelectorAll('.qpad[data-k]'), mine) || null;
}
on('pad-send', el => {
  const row = el.closest('.qpad-send'), pad = padOfRow_(row);
  const out = row && row.querySelector('.qp-verdict');
  if (!row || !pad || !out) return;
  const say = padSay_(padRead_(pad.getAttribute('data-k')));
  if (!say) { out.textContent = 'Draw your answer first'; return; }
  const signed = typeof whoIs_ === 'function' && !!whoIs_();
  const e = subRecord_(row.getAttribute('data-k'), say, 'sent');
  out.textContent = !e ? 'Could not send it \u2014 try again' : signed ? PAD_SENT_SAY : 'Kept on this device \u2014 sign in to send it for marking';
  if (typeof answersPush_ === 'function') answersPush_(true);
});

/* ---------- A DRAWN ANSWER IS MARKED BY ITS GEOMETRY (366) */
/* The figure as numbers: its viewBox, its ruled grid (`padGrid_`) and its numeric labels, which give an axis its scale. */
function drawFig_(svg) {
  const s = String(svg || '');
  const m = /viewBox\s*=\s*["']\s*([-\d.eE+]+)[\s,]+([-\d.eE+]+)[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/.exec(s);
  const vb = m ? [+m[1], +m[2], +m[3], +m[4]] : [0, 0, 340, 340];
  /* a figure wrapped whole in one translate (the metric-units dial): its items are in the group's units, so the frame shifts by it */
  const tm = /^<svg\b[^>]*>\s*<g\s+transform\s*=\s*["']\s*translate\(\s*([-\d.eE+]+)(?:[\s,]+([-\d.eE+]+))?\s*\)\s*["']\s*>/.exec(s.trim());
  const shift = tm ? [+tm[1], +(tm[2] || 0)] : [0, 0];
  const labels = [];
  (s.match(/<text\b[^>]*>[\s\S]*?<\/text>/g) || []).forEach(t => {
    if (/\btransform\s*=/.test(t)) return;
    const num = k => { const r = new RegExp('\\s' + k + '\\s*=\\s*["\']\\s*([-\\d.eE+]+)').exec(t); return r ? +r[1] : NaN; };
    /* a tick drawn as a dash after the number ("40 \u2212") is not part of it */
    const words = t.replace(/<[^>]*>/g, '').replace(/&minus;|\u2212|&#8722;/g, '-').replace(/&[a-z#0-9]+;/gi, '').trim().replace(/\s+-$/, '');
    if (/^-?\d+(\.\d+)?$/.test(words) && isFinite(num('x')) && isFinite(num('y'))) labels.push([+words, num('x') + shift[0], num('y') + shift[1]]);
  });
  return { vb: vb, grid: typeof padGrid_ === 'function' ? padGrid_(s) : null, labels: labels, shift: shift };
}

/* THE MARKER, pure: strokes in the pen's 340 by 340 space, the row's `draw_answer`, the figure. Distances are in the picture's own units, tolerances in grid squares. */
function drawMarker_() {
  const H = Math.hypot, R = Math.PI / 180;
  const near = (a, b) => H(a[0] - b[0], a[1] - b[1]);
  function dSeg(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
    return H(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function dLine(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = H(dx, dy) || 1;
    return Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / L;
  }
  const dPoly = (p, pl) => pl.length === 1 ? near(p, pl[0]) : pl.slice(1).reduce((m, q, i) => Math.min(m, dSeg(p, pl[i], q)), Infinity);
  const len = pl => pl.slice(1).reduce((s, q, i) => s + near(q, pl[i]), 0);
  function rdp(pl, eps) {
    if (pl.length < 3) return pl.slice();
    let k = 0, dm = 0;
    for (let i = 1; i < pl.length - 1; i++) { const d = dSeg(pl[i], pl[0], pl[pl.length - 1]); if (d > dm) { dm = d; k = i; } }
    if (dm <= eps) return [pl[0], pl[pl.length - 1]];
    return rdp(pl.slice(0, k + 1), eps).slice(0, -1).concat(rdp(pl.slice(k), eps));
  }
  function inside(p, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  const area = poly => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  /* clockwise from straight up, in degrees, as a clock and a protractor on screen read it */
  const bearing = (c, p) => ((Math.atan2(p[0] - c[0], c[1] - p[1]) / R) + 360) % 360;
  const dirOf = (a, b) => ((Math.atan2(b[1] - a[1], b[0] - a[0]) / R) + 180) % 180;
  const dDir = (a, b) => { const d = Math.abs(a - b) % 180; return Math.min(d, 180 - d); };

  /* THE FRAME: figure units to the picture's. Labels give an axis its scale; a grid alone counts squares from its bottom-left corner, y up. */
  function fitAxis(fig, axis, not) {
    const L = (fig.labels || []).filter(l => !(not && not.indexOf(l) !== -1)), by = {};
    L.forEach(l => { const key = Math.round((axis === 'x' ? l[2] : l[1]) / 8); (by[key] = by[key] || []).push(l); });
    let best = null;
    Object.keys(by).forEach(k => {
      const g = by[k].filter((l, i, a) => a.findIndex(o => o[0] === l[0]) === i);
      if (g.length < 3) return;
      /* a y label's number sits on its baseline, about a third of a line below the grid line it names */
      const vs = g.map(l => l[0]), ps = g.map(l => axis === 'x' ? l[1] : l[2] - 3.5);
      const n = vs.length, mv = vs.reduce((a, b) => a + b) / n, mp = ps.reduce((a, b) => a + b) / n;
      const sxx = vs.reduce((s, v) => s + (v - mv) * (v - mv), 0);
      if (!sxx) return;
      const b = vs.reduce((s, v, i) => s + (v - mv) * (ps[i] - mp), 0) / sxx, a = mp - b * mv;
      const res = Math.max.apply(null, vs.map((v, i) => Math.abs(a + b * v - ps[i])));
      const span = Math.abs(b) * (Math.max.apply(null, vs) - Math.min.apply(null, vs));
      if (!b || res > span * 0.04 + 3) return;
      if (axis === 'x' ? b < 0 : b > 0) return;
      if (!best || n > best.n) best = { a: a, b: b, n: n, v0: vs[0], g: g };
    });
    if (!best) return null;
    const G = fig.grid, lines = G ? (axis === 'x' ? G.xs : G.ys) : null;
    if (lines && lines.length > 1) {
      const pitch = (lines[lines.length - 1] - lines[0]) / (lines.length - 1);
      /* a square is a round number of units: 1, 2, 2.5 or 5 times a power of ten */
      const u = pitch / Math.abs(best.b), e = Math.pow(10, Math.floor(Math.log10(u)));
      const nice = [1, 2, 2.5, 5, 10].map(f => f * e).find(n => Math.abs(n - u) <= 0.06 * n);
      if (nice) best.b = Math.sign(best.b) * pitch / nice;
      const p0 = best.a + best.b * best.v0;
      const g = lines.reduce((m, l) => Math.abs(l - p0) < Math.abs(m - p0) ? l : m, lines[0]);
      if (Math.abs(g - p0) < pitch * 0.4) best.a += g - p0;
    }
    return best;
  }
  function frameOf(spec, fig) {
    const G = fig.grid, vb = fig.vb;
    const sq = G && G.xs.length > 1 ? (G.xs[G.xs.length - 1] - G.xs[0]) / (G.xs.length - 1) : (spec.sq || 20);
    let o, u;
    const f = spec.frame;
    const sh = fig.shift || [0, 0];
    if (f && f.o && f.u) { o = [f.o[0] + sh[0], f.o[1] + sh[1]]; u = f.u; }
    else if (f === 'vb') { o = sh.slice(); u = [1, 1]; }
    else {
      /* each axis by its own numbers where it has them; one without counts squares (or the picture's units) */
      const ax = f === 'grid' ? null : fitAxis(fig, 'x'), ay = f === 'grid' ? null : fitAxis(fig, 'y', ax && ax.g);
      const at = (f && f.grid) || [0, 0], py = G ? (G.ys[G.ys.length - 1] - G.ys[0]) / (G.ys.length - 1) : 1;
      o = [ax ? ax.a : G ? G.xs[0] - at[0] * sq : 0, ay ? ay.a : G ? G.ys[G.ys.length - 1] + at[1] * py : 0];
      u = [ax ? ax.b : G ? sq : 1, ay ? ay.b : G ? -py : 1];
    }
    return { o: o, u: u, sq: sq, vb: vb, grid: G,
      v: p => [o[0] + p[0] * u[0], o[1] + p[1] * u[1]],
      f: p => [(p[0] - o[0]) / u[0], (p[1] - o[1]) / u[1]] };
  }

  /* THE INK: each stroke as a polyline in the picture's units, its corners snapped to grid points (357's snap, read back). */
  function inkOf(strokes, F) {
    const vb = F.vb, G = F.grid, snap = F.sq * 0.22;
    const gp = (v, list) => list.reduce((m, l) => Math.abs(l - v) < Math.abs(m - v) ? l : m, list[0]);
    return (strokes || []).filter(s => Array.isArray(s) && s.length >= 2).map(s => {
      const pl = [];
      for (let i = 0; i + 1 < s.length; i += 2) pl.push([vb[0] + s[i] / 340 * vb[2], vb[1] + s[i + 1] / 340 * vb[3]]);
      /* a hand's wobble leaves a corner that is no corner: one turning under 12 degrees and close to the line is dropped, so a straight side stays one piece */
      const kept = rdp(pl, F.sq * 0.15);
      for (let i = kept.length - 2; i > 0; i--) {
        const a = kept[i - 1], b = kept[i], c = kept[i + 1];
        const t = Math.abs(Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0])) / R;
        if (Math.min(t, 360 - t) < 12 && dSeg(b, a, c) <= F.sq * 0.3) kept.splice(i, 1);
      }
      const segs = kept.map(p => {
        if (!G) return p;
        const q = [gp(p[0], G.xs), gp(p[1], G.ys)];
        return near(p, q) <= snap ? q : p;
      });
      return { pl: pl, segs: segs, len: len(pl), c: pl.reduce((a, p) => [a[0] + p[0] / pl.length, a[1] + p[1] / pl.length], [0, 0]),
        size: H(Math.max.apply(null, pl.map(p => p[0])) - Math.min.apply(null, pl.map(p => p[0])),
                Math.max.apply(null, pl.map(p => p[1])) - Math.min.apply(null, pl.map(p => p[1]))) };
    });
  }
  const samples = (a, b, step) => { const n = Math.max(2, Math.ceil(near(a, b) / step)); const out = []; for (let i = 0; i <= n; i++) out.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); return out; };
  const dInk = (p, ink) => ink.reduce((m, s) => Math.min(m, dPoly(p, s.pl)), Infinity);
  /* a line, a side or a curve is drawn when nearly all of it has ink within the tolerance */
  const covered = (a, b, ink, tol, from, to, frac) => {
    const pts = samples(a, b, tol / 2).filter((p, i, all) => i / (all.length - 1) >= (from || 0) - 1e-9 && i / (all.length - 1) <= (to == null ? 1 : to) + 1e-9);
    return pts.filter(p => dInk(p, ink) <= tol).length >= pts.length * (frac || 0.85);
  };
  /* straight pieces of ink, for the kinds that ask about directions and corners */
  const straights = (ink, min) => {
    const out = [];
    ink.forEach(s => s.segs.slice(1).forEach((q, i) => { if (near(q, s.segs[i]) >= min) out.push([s.segs[i], q]); }));
    return out;
  };
  /* hands, pointers and radii: each stroke cut where it passes nearest the centre, in either direction; an arm's way is the mean way of its outer half, so a wobble or a start off the centre cancels */
  const rays = (ink, c, r, inR, min) => {
    const out = [];
    ink.forEach(s => {
      let k = 0;
      s.pl.forEach((p, i) => { if (near(p, c) < near(s.pl[k], c)) k = i; });
      if (near(s.pl[k], c) > r * inR) return;
      [s.pl.slice(0, k + 1).reverse(), s.pl.slice(k)].forEach(arm => {
        const L = Math.max.apply(null, arm.map(p => near(p, c)));
        if (L < r * min) return;
        let x = 0, y = 0;
        arm.filter(p => near(p, c) >= L * 0.5).forEach(p => { const d = near(p, c) || 1; x += (p[0] - c[0]) / d; y += (p[1] - c[1]) / d; });
        out.push({ g: bearing(c, [c[0] + x, c[1] + y]), L: L });
      });
    });
    return out;
  };
  /* closed shapes in the ink: corners joined across strokes, straight-on corners dropped */
  function polygons(ink, F, join) {
    const S = straights(ink, F.sq * 0.3), nodes = [], edges = [];
    const node = p => { let i = nodes.findIndex(n => near(n, p) <= join); if (i < 0) { nodes.push(p.slice()); i = nodes.length - 1; } return i; };
    S.forEach(s => { const a = node(s[0]), b = node(s[1]); if (a !== b && !edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) edges.push([a, b]); });
    const nb = nodes.map((n, i) => edges.filter(e => e[0] === i || e[1] === i).map(e => e[0] === i ? e[1] : e[0]));
    const seen = new Set(), out = [];
    nodes.forEach((n, i) => {
      if (seen.has(i)) return;
      const comp = [], st = [i];
      while (st.length) { const k = st.pop(); if (seen.has(k)) continue; seen.add(k); comp.push(k); nb[k].forEach(j => st.push(j)); }
      if (comp.length < 3 || comp.some(k => nb[k].length !== 2)) return;
      const ring = [comp[0]];
      let prev = -1, cur = comp[0];
      for (;;) { const nx = nb[cur][0] !== prev ? nb[cur][0] : nb[cur][1]; if (nx === comp[0]) break; ring.push(nx); prev = cur; cur = nx; if (ring.length > comp.length) return; }
      let cyc = ring.map(k => nodes[k]);
      for (let again = true; again && cyc.length > 3;) {
        again = false;
        for (let k = 0; k < cyc.length; k++) {
          const a = cyc[(k + cyc.length - 1) % cyc.length], b = cyc[k], c = cyc[(k + 1) % cyc.length];
          if (dDir(dirOf(a, b), dirOf(b, c)) < 8) { cyc.splice(k, 1); again = true; break; }
        }
      }
      out.push(cyc);
    });
    return out;
  }
  const sides = poly => poly.map((p, i) => near(p, poly[(i + 1) % poly.length]));
  const corners = poly => poly.map((b, i) => {
    const a = poly[(i + poly.length - 1) % poly.length], c = poly[(i + 1) % poly.length];
    const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
    return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (H(u[0], u[1]) * H(v[0], v[1]) || 1)))) / R;
  });
  const same = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(a, b);
  const SHAPE = {
    kite: (p, s) => p.length === 4 && ((same(s[0], s[1], 0.08) && same(s[2], s[3], 0.08)) || (same(s[1], s[2], 0.08) && same(s[3], s[0], 0.08))),
    scalene: (p, s) => p.length === 3 && !same(s[0], s[1], 0.06) && !same(s[1], s[2], 0.06) && !same(s[0], s[2], 0.06),
    right: (p, s, a) => p.length === 3 && a.some(x => Math.abs(x - 90) <= 4),
    acute: (p, s, a) => p.length === 3 && a.every(x => x < 87),
    notacute: (p, s, a) => p.length === 3 && a.some(x => x >= 88),
    equilateral: (p, s) => p.length === 3 && same(Math.min.apply(null, s), Math.max.apply(null, s), 0.07),
    square: (p, s, a) => p.length === 4 && same(Math.min.apply(null, s), Math.max.apply(null, s), 0.07) && a.every(x => Math.abs(x - 90) <= 4),
    /* two lines of symmetry and no more: a rectangle or a rhombus that is not a square */
    twosym: (p, s, a) => p.length === 4 && !SHAPE.square(p, s, a) && (a.every(x => Math.abs(x - 90) <= 4) || same(Math.min.apply(null, s), Math.max.apply(null, s), 0.07)),
    perpdiag: (p, s, a) => p.length === 4 && !SHAPE.square(p, s, a) && dDir(dirOf(p[0], p[2]), dirOf(p[1], p[3])) >= 86,
    notperpdiag: (p) => p.length === 4 && dDir(dirOf(p[0], p[2]), dirOf(p[1], p[3])) < 84,
    isosceles: (p, s) => p.length === 3 && (same(s[0], s[1], 0.06) || same(s[1], s[2], 0.06) || same(s[0], s[2], 0.06)),
    /* both pairs of opposite sides parallel: a rectangle, rhombus or square is one too (439) */
    parallelogram: (p) => p.length === 4 && dDir(dirOf(p[0], p[1]), dirOf(p[3], p[2])) <= 4 && dDir(dirOf(p[1], p[2]), dirOf(p[0], p[3])) <= 4,
  };

  /* EACH KIND: is it there, and which ink does it account for (the rest is stray). */
  const KIND = {
    pts(it, ink, F, tol) {
      const P = it.at.map(F.v), small = F.sq * (it.dot || 1);
      const marks = [];
      ink.forEach(s => { if (s.size <= small) marks.push(s.c); s.segs.forEach(p => marks.push(p)); });
      ink.forEach((s, i) => ink.forEach((t, j) => { if (j > i && s.size <= small && t.size <= small && near(s.c, t.c) <= small) marks.push([(s.c[0] + t.c[0]) / 2, (s.c[1] + t.c[1]) / 2]); }));
      const got = P.filter(p => marks.some(m => near(m, p) <= tol) || (it.onink && dInk(p, ink) <= tol)).length;
      return { ok: got >= (it.need || P.length), ex: q => P.some(p => near(p, q) <= Math.max(tol * 1.5, F.sq * 0.7)) };
    },
    segs(it, ink, F, tol) {
      const base = (it.at || []).map(s => [[s[0], s[1]], [s[2], s[3]]]);
      if (it.poly || it.path) {
        const P = it.poly || it.path;
        P.forEach((p, i) => { if (i + 1 < P.length) base.push([p, P[i + 1]]); });
        if (it.poly) base.push([P[P.length - 1], P[0]]);
      }
      const also = (it.also || []).map(s => [F.v([s[0], s[1]]), F.v([s[2], s[3]])]);
      const tries = [];
      /* `fity`: a sketch on an axis with no numbers up it -- the curve's height is the drawer's, so it is fitted */
      if (it.fity) {
        const ys = [].concat.apply([], ink.map(s => s.pl.map(p => F.f(p)[1]))), top = Math.max.apply(null, base.map(s => Math.max(Math.abs(s[0][1]), Math.abs(s[1][1]))));
        const k0 = ys.length && top ? Math.max.apply(null, ys.map(Math.abs)) / top : 1;
        [0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.4].forEach(f => tries.push(base.map(s => s.map(p => F.v([p[0], p[1] * k0 * f])))));
      }
      const flips = it.fity ? [] : it.turn ? [[1, 0, 0, 1], [0, -1, 1, 0], [-1, 0, 0, -1], [0, 1, -1, 0], [-1, 0, 0, 1], [1, 0, 0, -1], [0, 1, 1, 0], [0, -1, -1, 0]] : [[1, 0, 0, 1]];
      flips.forEach(m => {
        const S = base.map(s => s.map(p => F.v([m[0] * p[0] + m[1] * p[1], m[2] * p[0] + m[3] * p[1]])));
        if (!it.move) { tries.push(S); return; }
        /* placed anywhere (a plan, a vector, a box plot's height): laid where the ink is, by its box and by its middle */
        const bx = list => { const xs = list.map(p => p[0]), ys = list.map(p => p[1]); return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)]; };
        const ip = [].concat.apply([], ink.map(s => s.pl)), sp = [].concat.apply([], S);
        if (!ip.length) return;
        const a = bx(ip), b = bx(sp);
        /* and by each corner of the ink, so two shapes drawn side by side are each found where they are */
        const anchors = [].concat.apply([], ink.map(s => s.segs)).slice(0, 60).map(p => [p[0] - sp[0][0], p[1] - sp[0][1]]);
        [[a[0] - b[0], a[1] - b[1]], [a[2] - b[2], a[3] - b[3]], [(a[0] + a[2] - b[0] - b[2]) / 2, (a[1] + a[3] - b[1] - b[3]) / 2]].concat(anchors).forEach(d => {
          let dx = it.move === 'y' ? 0 : d[0], dy = it.move === 'x' ? 0 : d[1];
          if (F.grid && it.snap !== false) { dx = Math.round(dx / F.sq) * F.sq; dy = Math.round(dy / F.sq) * F.sq; }
          tries.push(S.map(s => s.map(p => [p[0] + dx, p[1] + dy])));
        });
      });
      let best = null;
      tries.forEach(S => {
        const n = S.filter(s => covered(s[0], s[1], ink, tol, 0, 1, it.cover)).length;
        if (!best || n > best.n) best = { n: n, S: S };
      });
      const S = best ? best.S : [];
      /* `head`: a vector's arrowhead, ink at the far end that is not the shaft */
      const headOk = !it.head || (S.length === 1 && ink.some(s => s.pl.some(p => near(p, S[0][1]) <= F.sq * 1.2 && near(p, S[0][1]) > tol * 0.5 && dLine(p, S[0][0], S[0][1]) > tol * 0.4)));
      return { ok: !!best && best.n >= (it.need || S.length) && headOk, ex: q => S.concat(also).some(s => dSeg(q, s[0], s[1]) <= tol * 1.5) || (it.head && S.length === 1 && near(q, S[0][1]) <= F.sq * 1.4) };
    },
    line(it, ink, F, tol) {
      const a = F.v(it.thru[0]), b = F.v(it.thru[1]);
      /* `cover`: how much of it must be inked -- a dashed line (a strict inequality) is about half */
      return { ok: covered(a, b, ink, tol, it.from == null ? 0.15 : it.from, it.to == null ? 0.85 : it.to, it.cover),
        ex: q => dLine(q, a, b) <= tol * 1.5 };
    },
    cells(it, ink, F) {
      const C = (it.cells || []).map(c => c.map(F.v)).concat((it.rects || []).map(r => [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0] + r[2], r[1] + r[3]], [r[0], r[1] + r[3]]].map(F.v)));
      const given = it.given || [];
      const on = C.map((c, i) => {
        if (given.indexOf(i) !== -1) return false;
        const m = c.reduce((s, p) => [s[0] + p[0] / c.length, s[1] + p[1] / c.length], [0, 0]);
        const sh = c.map(p => [m[0] + (p[0] - m[0]) * 0.85, m[1] + (p[1] - m[1]) * 0.85]);
        let L = 0;
        ink.forEach(s => s.pl.forEach((p, k) => { if (k && inside(p, sh) && inside(s.pl[k - 1], sh)) L += near(p, s.pl[k - 1]); }));
        return L >= (it.shade || 1.2) * Math.sqrt(area(c));
      });
      const chosen = on.map((v, i) => v ? i : -1).filter(i => i >= 0);
      /* `touch`: how many sides the chosen cells share, which is what a perimeter asks of them */
      const shared = (a, b) => a.filter(p => b.some(q => near(p, q) <= F.sq * 0.1)).length >= 2;
      let touch = 0;
      chosen.forEach((i, x) => chosen.forEach((j, y) => { if (y > x && shared(C[i], C[j])) touch++; }));
      const ok = (it.set ? it.set.some(w => w.length === chosen.length && w.every(i => chosen.indexOf(i) !== -1))
        : chosen.length === it.need) && (it.touch == null || touch === it.touch);
      return { ok: ok, ex: q => C.some(c => inside(q, c)) };
    },
    radius(it, ink, F, tol) {
      const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
      const S = straights(ink, r * 0.4);
      const rim = p => Math.abs(near(p, c) - r) <= tol;
      const hit = S.find(s => it.dia ? rim(s[0]) && rim(s[1]) && dSeg(c, s[0], s[1]) <= tol
        : (near(s[0], c) <= tol && rim(s[1])) || (near(s[1], c) <= tol && rim(s[0])));
      return { ok: !!hit, ex: q => S.some(s => dSeg(q, s[0], s[1]) <= tol * 1.5) };
    },
    dir(it, ink, F, tol) {
      const to = it.to ? [F.v([it.to[0], it.to[1]]), F.v([it.to[2], it.to[3]])] : null;
      const want = to ? (dirOf(to[0], to[1]) + (it.rel === 'perp' ? 90 : 0)) % 180 : it.ang;
      const S = straights(ink, F.sq * (it.min || 1.5));
      const ok = S.filter(s => (want == null || dDir(dirOf(s[0], s[1]), want) <= (it.atol || 4))
        && (!it.len || Math.abs(near(F.f(s[0]), F.f(s[1])) - it.len) <= (it.ltol || 0.2))
        && (!it.meet || !to || dSeg(s[0], to[0], to[1]) <= tol || dSeg(s[1], to[0], to[1]) <= tol || cross(s, to))
        && (!it.apart || !to || dLine(s[0], to[0], to[1]) > tol * 2)).length >= (it.need || 1);
      return { ok: ok, ex: q => S.some(s => dSeg(q, s[0], s[1]) <= tol * 1.5) };
    },
    pair(it, ink, F, tol) {
      const S = straights(ink, F.sq * (it.min || 2));
      let ok = false;
      S.forEach((s, i) => S.forEach((t, j) => {
        if (j <= i) return;
        const d = dDir(dirOf(s[0], s[1]), dirOf(t[0], t[1]));
        if (it.rel === 'perp' ? Math.abs(d - 90) <= (it.atol || 4) : d <= (it.atol || 3) && dLine(t[0], s[0], s[1]) > tol * 2) ok = true;
      }));
      return { ok: ok, ex: q => S.some(s => dSeg(q, s[0], s[1]) <= tol * 1.5) };
    },
    angle(it, ink, F) {
      const S = straights(ink, F.sq * (it.min || 1.5)), j = F.sq * 0.5;
      let ok = false;
      S.forEach((s, i) => S.forEach((t, k) => {
        if (k <= i) return;
        [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(e => {
          if (near(s[e[0]], t[e[1]]) > j) return;
          const v = s[e[0]], a = s[1 - e[0]], b = t[1 - e[1]];
          const g = corners([a, v, b])[1];
          if (Math.abs(g - it.deg) <= (it.atol || 2)) ok = true;
        });
      }));
      return { ok: ok, ex: q => S.some(s => dSeg(q, s[0], s[1]) <= F.sq * 0.4) };
    },
    polygon(it, ink, F, tol) {
      const join = F.sq * (it.join || 0.5);
      const all = polygons(ink, F, join).map(p => ({ v: p, f: p.map(F.f) }));
      const good = all.filter(P => {
        const p = P.f, s = sides(p), a = corners(p);
        if (it.n && p.length !== it.n) return false;
        if (it.is && !(SHAPE[it.is] && SHAPE[it.is](p, s, a))) return false;
        if (it.side && !s.every(x => Math.abs(x - it.side) <= (it.ltol || 0.25))) return false;
        if (it.area && Math.abs(area(p) - it.area) > (it.atol || 0.5)) return false;
        if (it.on && !P.v.every(q => onDots(q, it.on, F, tol))) return false;
        if (it.sas) {
          const [l1, l2, g] = it.sas, lt = it.ltol || 0.25;
          /* `sim`: the right shape at any size, where the screen cannot be a ruler -- the two sides' ratio and the angle between them */
          const fits = (x, y) => it.sim ? Math.abs(x / y - l1 / l2) <= 0.06 * l1 / l2 : Math.abs(x - l1) <= lt && Math.abs(y - l2) <= lt;
          if (p.length !== 3 || !p.some((v, i) => {
            const x = s[(i + 2) % 3], y = s[i];
            return Math.abs(a[i] - g) <= 4 && (fits(x, y) || fits(y, x));
          })) return false;
        }
        return true;
      });
      return { ok: good.length >= (it.count || 1), ex: q => all.some(P => dPoly(q, P.v.concat([P.v[0]])) <= tol * 1.5) };
    },
    clock(it, ink, F) {
      const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
      const hands = [];
      rays(ink, c, r, 0.3, 0.2).sort((a, b) => b.L - a.L).forEach(h => { if (!hands.some(o => Math.abs(((o.g - h.g + 540) % 360) - 180) < 5)) hands.push(h); });
      const off = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
      const mi = (it.min % 60) * 6, hr = ((it.h % 12) * 30 + it.min * 0.5) % 360;
      const ok = hands.length === 2 && off(hands[0].g, mi) <= (it.mtol || 6) && off(hands[1].g, hr) <= (it.htol || 9) && hands[0].L > hands[1].L * 1.05;
      return { ok: ok, ex: q => near(q, c) <= r * 1.05 };
    },
    dial(it, ink, F) {
      const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
      /* a pointer from the centre, or an arrow outside pointing in: the way of the ink's outer half, read from the centre */
      let P = rays(ink, c, r, 0.35, 0.3).sort((a, b) => b.L - a.L)[0];
      if (!P) {
        const pts = [].concat.apply([], ink.map(s => s.pl)).filter(p => near(p, c) >= r * 0.5 && near(p, c) <= r * 1.6);
        if (!pts.length) return { ok: false, ex: () => false };
        let x = 0, y = 0;
        pts.forEach(p => { const d = near(p, c); x += (p[0] - c[0]) / d; y += (p[1] - c[1]) / d; });
        P = { g: bearing(c, [c[0] + x, c[1] + y]) };
      }
      const g = (P.g - it.a[0] + 360) % 360, span = (it.a[1] - it.a[0] + 360) % 360 || 360;
      const v = it.v[0] + g / span * (it.v[1] - it.v[0]);
      return { ok: Math.abs(v - it.want) <= it.vtol, ex: q => near(q, c) <= r * 1.6 };
    },
    scale(it, ink, F, tol) {
      const a = F.v(it.a), b = F.v(it.b);
      const S = straights(ink, F.sq * 0.4).sort((p, q) => near(q[0], q[1]) - near(p[0], p[1]));
      const dots = ink.filter(s => s.size <= F.sq * 0.6).map(s => [s.c, s.c]);
      const s = S[0] || dots[0];
      if (!s) return { ok: false, ex: () => false };
      const tip = dSeg(s[0], a, b) <= dSeg(s[1], a, b) ? s[0] : s[1];
      const t = ((tip[0] - a[0]) * (b[0] - a[0]) + (tip[1] - a[1]) * (b[1] - a[1])) / (near(a, b) * near(a, b));
      const v = it.v[0] + t * (it.v[1] - it.v[0]);
      return { ok: dSeg(tip, a, b) <= F.sq * 2 && Math.abs(v - it.want) <= it.vtol, ex: () => true };
    },
    pie(it, ink, F) {
      const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
      const g = (it.given || []).slice();
      rays(ink, c, r, 0.18, 0.5).forEach(h => { const b = h.g; if (!g.some(x => Math.abs(((x - b + 540) % 360) - 180) < 3)) g.push(b); });
      g.sort((a, b) => a - b);
      const gaps = g.map((x, i) => ((g[(i + 1) % g.length] - x + 360) % 360) || 360);
      const want = it.sect.slice(), at = it.atol || 2;
      let hit = 0;
      gaps.forEach(d => { const k = want.findIndex(w => Math.abs(w - d) <= at); if (k >= 0) { want.splice(k, 1); hit++; } });
      const ok = it.need ? hit >= it.need : (hit === it.sect.length && gaps.length === it.sect.length);
      return { ok: ok, ex: q => near(q, c) <= r * 1.1 };
    },
    /* a cuboid on dotted paper: its outline is a hexagon whose sides, in dots, go a b c a b c, and a times b times c is its volume */
    cuboid(it, ink, F, tol) {
      const pts = [];
      straights(ink, F.sq * 0.5).forEach(s => s.forEach(p => pts.push(p)));
      const L = it.on && it.on.lat, hull = convex(pts.map(p => L ? latSnap(p, L) : p));
      const ok = (() => {
        if (hull.length !== 6) return false;
        const e = hull.map((p, i) => near(p, hull[(i + 1) % 6]) / F.sq);
        if (!e.every(v => Math.abs(v - Math.round(v)) < 0.15 && Math.round(v) > 0)) return false;
        const n = e.map(Math.round);
        return n[0] === n[3] && n[1] === n[4] && n[2] === n[5] && n[0] * n[1] * n[2] === it.vol
          && hull.every((p, i) => covered(p, hull[(i + 1) % 6], ink, tol));
      })();
      return { ok: ok, ex: q => hull.length > 2 && (inside(q, hull) || dPoly(q, hull.concat([hull[0]])) <= tol * 1.5) };
    },
    /* HISTOGRAM OR BAR CHART: each bar's top, read off the ink; an axis with no numbers (`fx`, `fy`) is scaled from the bars themselves */
    hist(it, ink, F, tol) {
      const base = F.v([0, 0])[1];
      const tops = straights(ink, F.sq * 0.5).filter(s => dDir(dirOf(s[0], s[1]), 0) <= 6 && Math.abs((s[0][1] + s[1][1]) / 2 - base) > F.sq * 0.4)
        .map(s => { const a = Math.min(s[0][0], s[1][0]), b = Math.max(s[0][0], s[1][0]); return { a: a, b: b, y: (s[0][1] + s[1][1]) / 2 }; })
        .sort((p, q) => p.a - q.a);
      /* `seq`: bars whose order and heights are known but not where they stand (a dual bar chart): the heights read left to right */
      if (it.seq) {
        let best = 0;
        it.seq.forEach(h => {
          if (tops.length !== h.length) return;
          const r = h.map((v, i) => (tops[i].y - base) / v).sort((p, q) => p - q), sy = it.fy ? r[r.length >> 1] : F.u[1];
          best = Math.max(best, h.filter((v, i) => Math.abs(base + sy * v - tops[i].y) <= tol).length);
        });
        return { ok: best >= (it.need || it.seq[0].length), ex: q => q[1] <= base + tol };
      }
      const X = it.x, n = X.length - 1;
      let sx = F.u[0], ox = F.o[0];
      if (it.fx && tops.length) { sx = (tops[tops.length - 1].b - tops[0].a) / (X[n] - X[0]); ox = tops[0].a - sx * X[0]; }
      const px = v => ox + sx * v;
      const mine = tops.map(t => X.findIndex((v, i) => i < n && Math.abs(px(v) - t.a) <= tol && Math.abs(px(X[i + 1]) - t.b) <= tol));
      let sy = F.u[1];
      if (it.fy) {
        const r = mine.map((i, k) => i >= 0 && it.h[i] ? (tops[k].y - base) / it.h[i] : null).filter(v => v != null).sort((p, q) => p - q);
        sy = r.length ? r[r.length >> 1] : sy;
      }
      let good = 0;
      mine.forEach((i, k) => { if (i >= 0 && Math.abs(base + sy * it.h[i] - tops[k].y) <= tol) good++; });
      const want = it.only != null ? it.only : n;
      const ok = good >= (it.need || want) && (it.need || tops.length <= want);
      return { ok: ok, ex: q => q[1] <= base + tol && X.some((v, i) => i < n && q[0] >= px(v) - tol && q[0] <= px(X[i + 1]) + tol) };
    },
    /* A BOX PLOT: the box's three upright lines at the quartiles and the median, the whiskers out to the least and greatest -- at whatever height it is drawn */
    box(it, ink, F, tol) {
      const S = straights(ink, F.sq * 0.4), up = S.filter(s => dDir(dirOf(s[0], s[1]), 90) <= 8), across = S.filter(s => dDir(dirOf(s[0], s[1]), 0) <= 8);
      const X = v => F.v([v, 0])[0], v = it.v;
      const atUp = x => up.some(s => Math.abs((s[0][0] + s[1][0]) / 2 - x) <= tol);
      const ends = across.map(s => [Math.min(s[0][0], s[1][0]), Math.max(s[0][0], s[1][0])]);
      const end = x => atUp(x) || ends.some(e => Math.abs(e[0] - x) <= tol || Math.abs(e[1] - x) <= tol);
      const good = [end(X(v[0])), atUp(X(v[1])), atUp(X(v[2])), atUp(X(v[3])), end(X(v[4]))].filter(Boolean).length;
      return { ok: good >= (it.need || 5), ex: q => q[0] >= X(v[0]) - tol * 1.5 && q[0] <= X(v[4]) + tol * 1.5 };
    },
    /* AN INEQUALITY ON A NUMBER LINE: a line from a to b, and at each end a circle, filled where the end is included */
    interval(it, ink, F, tol) {
      const S = straights(ink, F.sq * 1).filter(s => dDir(dirOf(s[0], s[1]), 0) <= 6).sort((p, q) => near(q[0], q[1]) - near(p[0], p[1]));
      if (!S.length) return { ok: false, ex: () => false };
      const L = S[0], xs = [L[0][0], L[1][0]].sort((p, q) => p - q), ya = (L[0][1] + L[1][1]) / 2;
      const A = F.v([it.a, 0])[0], B = F.v([it.b, 0])[0], r = F.sq * 0.9;
      const end = x => {
        const near_ = ink.filter(s => s !== L && Math.abs(s.c[0] - x) <= r && Math.abs(s.c[1] - ya) <= r * 1.5 && s.size <= r * 2.5);
        if (!near_.length) return null;
        const size = Math.max.apply(null, near_.map(s => s.size)), Lsum = near_.reduce((t, s) => t + s.len, 0);
        return Lsum >= 1.2 * Math.PI * Math.max(size, 1) ? 'filled' : 'open';
      };
      const ea = end(A), eb = end(B);
      const at = Math.abs(xs[0] - A) <= tol * 1.6 && Math.abs(xs[1] - B) <= tol * 1.6;
      const circles = it.loose ? !!ea && !!eb : ea === (it.ca ? 'filled' : 'open') && eb === (it.cb ? 'filled' : 'open');
      return { ok: at && circles, ex: q => q[0] >= A - r * 1.5 && q[0] <= B + r * 1.5 && Math.abs(q[1] - ya) <= r * 2 };
    },
    /* AREA: the closed shapes drawn inside a box, their areas added (a pictogram's symbols) */
    area(it, ink, F) {
      const box = it.in.map(F.v), inBox = p => p[0] >= Math.min(box[0][0], box[1][0]) && p[0] <= Math.max(box[0][0], box[1][0]) && p[1] >= Math.min(box[0][1], box[1][1]) && p[1] <= Math.max(box[0][1], box[1][1]);
      const P = polygons(ink, F, F.sq * 0.4).filter(p => p.every(inBox));
      const A = P.reduce((t, p) => t + area(p.map(F.f)), 0);
      return { ok: Math.abs(A - it.want) <= (it.rtol || 0.08) * it.want, ex: inBox };
    },
    /* CONSTRUCTION ARCS: compass curves, near where the construction puts them */
    curves(it, ink, F) {
      const c = it.near ? F.v(it.near) : null, R_ = it.r ? it.r * Math.abs(F.u[0]) : Infinity;
      const C = ink.filter(s => s.segs.length >= 4 && s.len >= F.sq * 0.8 && (!c || s.pl.some(p => near(p, c) <= R_)));
      return { ok: C.length >= (it.n || 2), ex: q => C.some(s => dPoly(q, s.pl) <= F.sq * 0.3) };
    },
    /* A SKETCH: the curve's shape, read in the figure's own axes -- rising or falling, above the axis, where it crosses */
    sketch(it, ink, F, tol) {
      const pts = [].concat.apply([], ink.map(s => s.pl.map(p => F.f(p)))).sort((p, q) => p[0] - q[0]);
      if (pts.length < 4) return { ok: false, ex: () => false };
      const yt = tol / Math.abs(F.u[1]);
      const k = Math.max(1, Math.floor(pts.length / 8)), steps = [];
      for (let i = k; i < pts.length; i += k) steps.push(pts[i][1] - pts[i - k][1]);
      const T = it.test || [];
      const ok = T.every(t => {
        if (t === 'inc') return steps.filter(d => d < -yt).length === 0;
        if (t === 'dec') return steps.filter(d => d > yt).length === 0;
        if (t === 'above') return pts.every(p => p[1] > -yt);
        if (t === 'crossy') { const at = pts.filter(p => Math.abs(p[0]) <= 2 * tol / Math.abs(F.u[0])); return at.length && at.every(p => p[1] > yt); }
        if (t === 'flatleft') { const L = pts.slice(0, Math.max(2, pts.length >> 3)); return L.every(p => Math.abs(p[1]) <= 3 * yt); }
        /* `asym`: a vertical asymptote at each value -- no ink on it, and the curve running away up on its left and down on its right (tan) */
        if (t === 'asym') return (it.asym || []).every(a => { const w = 2 * tol / Math.abs(F.u[0]); return !pts.some(p => Math.abs(p[0] - a) < w * 0.5)
          && pts.some(p => p[0] < a && p[0] > a - 8 * w && p[1] > 3 * yt) && pts.some(p => p[0] > a && p[0] < a + 8 * w && p[1] < -3 * yt); });
        if (t === 'steepright') { const L = pts.slice(-Math.max(2, pts.length >> 3)); return L[L.length - 1][1] - L[0][1] > 4 * yt; }
        return false;
      });
      return { ok: ok, ex: () => true };
    },
    inside(it, ink, F) {
      const P = it.poly.map(F.v);
      let L = 0;
      ink.forEach(s => s.pl.forEach((p, k) => { if (k && inside(p, P) && inside(s.pl[k - 1], P)) L += near(p, s.pl[k - 1]); }));
      return { ok: L >= F.sq * (it.min || 0.5), ex: q => inside(q, P) };
    },
    /* `join` (402): a matching line — one stroke from inside box `a` to inside box `b`, either way. Boxes [x, y, w, h] in figure units, padded by `pad`. */
    join(it, ink, F) {
      const pad = it.pad == null ? 10 : it.pad;
      const box = r => { const p = F.v([r[0], r[1]]), q = F.v([r[0] + r[2], r[1] + r[3]]);
        return [Math.min(p[0], q[0]) - pad, Math.min(p[1], q[1]) - pad, Math.max(p[0], q[0]) + pad, Math.max(p[1], q[1]) + pad]; };
      const A = box(it.a), B = box(it.b), inB = (q, X) => q[0] >= X[0] && q[0] <= X[2] && q[1] >= X[1] && q[1] <= X[3];
      const ca = [(A[0] + A[2]) / 2, (A[1] + A[3]) / 2], cb = [(B[0] + B[2]) / 2, (B[1] + B[3]) / 2];
      const ok = ink.some(s => { const e0 = s.pl[0], e1 = s.pl[s.pl.length - 1]; return (inB(e0, A) && inB(e1, B)) || (inB(e0, B) && inB(e1, A)); });
      const band = Math.max(A[3] - A[1], B[3] - B[1]) / 2;
      return { ok: ok, ex: q => inB(q, A) || inB(q, B) || dSeg(q, ca, cb) <= band };
    },
  };
  /* a dotted grid as two steps from one dot, so the row does not list every dot */
  function latSnap(q, L) {
    const d = L[2] * L[5] - L[3] * L[4], x = q[0] - L[0], y = q[1] - L[1];
    const i = Math.round((x * L[5] - y * L[4]) / d), j = Math.round((L[2] * y - L[3] * x) / d);
    return [L[0] + i * L[2] + j * L[4], L[1] + i * L[3] + j * L[5]];
  }
  const onDots = (q, on, F, tol) => on.lat ? near(latSnap(q, on.lat), q) <= tol : on.some(o => near(F.v(o), q) <= tol);
  function convex(P) {
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]).filter((q, i, a) => !i || near(q, a[i - 1]) > 1e-6);
    if (p.length < 3) return p;
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-6) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 1e-6) hi.pop(); hi.push(q); });
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }
  function cross(s, t) {
    const o = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    return o(s[0], s[1], t[0]) !== o(s[0], s[1], t[1]) && o(t[0], t[1], s[0]) !== o(t[0], t[1], s[1]);
  }
  function one(it, ink, F, spec) {
    const tol = F.sq * (it.tol || spec.tol || 0.3);
    if (it.k === 'any') {
      const rs = it.of.map(o => one(o, ink, F, spec)), hit = rs.find(r => r.ok);
      return hit || { ok: false, ex: q => rs.some(r => r.ex(q)) };
    }
    const f = KIND[it.k];
    return f ? f(it, ink, F, tol) : { ok: false, ex: () => false };
  }

  /* `draw_answer`: `{ frame?, tol?, loose?, items: [{ k, m, ..., or }] }`. An item's `or` is what the scheme gives fewer marks for. Ink that no item accounts for costs a mark. */
  function mark(strokes, spec, fig, marks) {
    if (typeof spec === 'string') { try { spec = JSON.parse(spec); } catch (e) { return null; } }
    if (!spec || !Array.isArray(spec.items)) return null;
    const F = frameOf(spec, fig), ink = inkOf(strokes, F);
    const total = spec.items.reduce((s, it) => s + (it.m == null ? 1 : it.m), 0);
    const of = Math.max(1, Number(marks) || spec.marks || total);
    if (!ink.length) return { got: 0, of: of, each: [], stray: 0, empty: true };
    let got = 0;
    const exs = [], each = [];
    spec.items.forEach(it => {
      let cur = it, r = one(cur, ink, F, spec);
      exs.push(r.ex);
      while (!r.ok && cur.or) { cur = cur.or; r = one(cur, ink, F, spec); exs.push(r.ex); }
      each.push(r.ok ? (cur.m == null ? 1 : cur.m) : 0);
      if (r.ok) got += cur.m == null ? 1 : cur.m;
    });
    let all = 0, lost = 0;
    ink.forEach(s => {
      const pts = s.pl.length === 1 ? s.pl : [].concat.apply([], s.pl.slice(1).map((q, i) => samples(s.pl[i], q, F.sq * 0.25).slice(1)));
      pts.forEach(p => { all++; if (!exs.some(e => e(p))) lost++; });
    });
    const stray = all ? lost / all : 0;
    if (!spec.loose && stray > 0.12 && lost * F.sq * 0.25 > F.sq) got = Math.max(0, got - 1);
    return { got: Math.min(of, Math.floor(got * of / Math.max(1, total) + 1e-9)), of: of, each: each, stray: Math.round(stray * 100) / 100 };
  }
  /* A RIGHT DRAWING OF THE ANSWER, as strokes the pen would store: the row's own `eg` (figure units) or one made from its items. The checks mark it full and a near miss less. */
  function example(spec, fig) {
    if (typeof spec === 'string') { try { spec = JSON.parse(spec); } catch (e) { return []; } }
    const F = frameOf(spec, fig), vb = F.vb, out = [];
    const put = pl => out.push([].concat.apply([], pl.map(p => [Math.round((p[0] - vb[0]) / vb[2] * 3400) / 10, Math.round((p[1] - vb[1]) / vb[3] * 3400) / 10])));
    const at = (c, g, r) => [c[0] + r * Math.sin(g * R), c[1] - r * Math.cos(g * R)];
    const zig = poly => { const m = poly.reduce((s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length], [0, 0]);
      const k = poly.map(p => [m[0] + (p[0] - m[0]) * 0.6, m[1] + (p[1] - m[1]) * 0.6]); put(k.concat([k[0], k[2 % k.length], m, k[1 % k.length]])); };
    if (spec.eg) { spec.eg.forEach(pl => put(pl.map(F.v))); return out; }
    const one = it => {
      const q = F.sq;
      if (it.k === 'any') return one(it.of[0]);
      if (it.k === 'pts') it.at.map(F.v).forEach(p => { put([[p[0] - q * 0.2, p[1] - q * 0.2], [p[0] + q * 0.2, p[1] + q * 0.2]]); put([[p[0] + q * 0.2, p[1] - q * 0.2], [p[0] - q * 0.2, p[1] + q * 0.2]]); });
      if (it.k === 'segs') {
        (it.at || []).forEach(t => put([[t[0], t[1]], [t[2], t[3]]].map(F.v)));
        if (it.poly) put(it.poly.concat([it.poly[0]]).map(F.v));
        if (it.path) put(it.path.map(F.v));
      }
      if (it.k === 'segs' && it.head && it.at && it.at[0]) {
        const t = it.at[0], a = F.v([t[0], t[1]]), b = F.v([t[2], t[3]]), L = H(b[0] - a[0], b[1] - a[1]) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        put([[b[0] - u[0] * q * 0.8 - u[1] * q * 0.5, b[1] - u[1] * q * 0.8 + u[0] * q * 0.5], b, [b[0] - u[0] * q * 0.8 + u[1] * q * 0.5, b[1] - u[1] * q * 0.8 - u[0] * q * 0.5]]);
      }
      if (it.k === 'hist') {
        /* an axis with no numbers: drawn to a scale that fills most of the grid */
        const G = F.grid, W = G ? G.xs[G.xs.length - 1] - G.xs[0] : vb[2], Hh = G ? G.ys[G.ys.length - 1] - G.ys[0] : vb[3];
        const hs = it.seq ? it.seq[0] : it.h, top = Math.max.apply(null, hs.filter(Boolean));
        const ky = it.fy ? Math.round(Hh * 0.7 / top / Math.abs(F.u[1]) * 4) / 4 || 1 : 1;
        const X = it.seq ? hs.map((h, i) => [i * 2 + 1, i * 2 + 2]) : it.x.slice(0, -1).map((x, i) => [x, it.x[i + 1]]);
        const x0 = it.seq ? 0 : it.x[0], span = it.seq ? hs.length * 2 + 1 : it.x[it.x.length - 1] - x0;
        const kx = it.fx || it.seq ? Math.max(1, Math.floor(W * 0.85 / span / Math.abs(F.u[0]))) : 1, ox = it.fx || it.seq ? 1 - x0 * kx : 0;
        hs.forEach((h, i) => { if (h) put([[X[i][0] * kx + ox, 0], [X[i][0] * kx + ox, h * ky], [X[i][1] * kx + ox, h * ky], [X[i][1] * kx + ox, 0]].map(F.v)); });
      }
      if (it.k === 'box') {
        const v = it.v, y = F.f([0, F.vb[1] + F.vb[3] * 0.35])[1], h = F.sq * 0.8 / Math.abs(F.u[1]);
        put([[v[0], y], [v[1], y]].map(F.v)); put([[v[3], y], [v[4], y]].map(F.v));
        put([[v[1], y - h], [v[1], y + h], [v[3], y + h], [v[3], y - h], [v[1], y - h]].map(F.v)); put([[v[2], y - h], [v[2], y + h]].map(F.v));
      }
      if (it.k === 'interval') {
        const a = F.v([it.a, 0]), b = F.v([it.b, 0]), y = it.y != null ? F.v([0, it.y])[1] : a[1] - q * 1.5, r = q * 0.35;
        put([[a[0] + r, y], [b[0] - r, y]]);
        [[a, it.ca], [b, it.cb]].forEach(e => { const c = [e[0][0], y], ring = []; for (let g = 0; g <= 360; g += 30) ring.push(at(c, g, r)); put(ring); if (e[1]) { put(ring.map(p => [c[0] + (p[0] - c[0]) * 0.5, c[1] + (p[1] - c[1]) * 0.5])); put([at(c, 0, r * 0.8), at(c, 180, r * 0.8)]); put([at(c, 90, r * 0.8), at(c, 270, r * 0.8)]); put(ring.map(p => [c[0] + (p[0] - c[0]) * 0.75, c[1] + (p[1] - c[1]) * 0.75])); } });
      }
      if (it.k === 'line') put(it.thru.map(F.v));
      if (it.k === 'join') put([it.a, it.b].map(r => F.v([r[0] + r[2] / 2, r[1] + r[3] / 2])));
      if (it.k === 'cells') {
        const C = (it.cells || []).concat((it.rects || []).map(r => [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0] + r[2], r[1] + r[3]], [r[0], r[1] + r[3]]]));
        const pick = it.set ? it.set[0] : C.map((c, i) => i).filter(i => (it.given || []).indexOf(i) === -1).slice(0, it.need);
        pick.forEach(i => { const c = C[i].map(F.v); zig(c); zig(c); });
      }
      if (it.k === 'radius') { const c = F.v(it.c), r = Math.abs(it.r * F.u[0]); put(it.dia ? [at(c, 60, r), at(c, 240, r)] : [c, at(c, 60, r)]); }
      if (it.k === 'dir' && it.to) {
        const a = F.v([it.to[0], it.to[1]]), b = F.v([it.to[2], it.to[3]]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const d = [b[0] - a[0], b[1] - a[1]], L = H(d[0], d[1]), u = it.rel === 'perp' ? [-d[1] / L, d[0] / L] : [d[0] / L, d[1] / L];
        const o = it.rel === 'perp' ? [0, 0] : [-d[1] / L * q * 3, d[0] / L * q * 3], h = q * 2.5;
        put([[m[0] + o[0] - u[0] * h, m[1] + o[1] - u[1] * h], [m[0] + o[0] + u[0] * h, m[1] + o[1] + u[1] * h]]);
      }
      if (it.k === 'clock') { const c = F.v(it.c), r = Math.abs(it.r * F.u[0]); put([c, at(c, (it.min % 60) * 6, r * 0.8)]); put([c, at(c, ((it.h % 12) * 30 + it.min * 0.5) % 360, r * 0.5)]); }
      if (it.k === 'dial') {
        const c = F.v(it.c), r = Math.abs(it.r * F.u[0]), span = (it.a[1] - it.a[0] + 360) % 360 || 360;
        const g = it.a[0] + (it.want - it.v[0]) / (it.v[1] - it.v[0]) * span;
        put(it.out ? [at(c, g, r * 1.12), at(c, g, r)] : [c, at(c, g, r * 0.9)]);
      }
      if (it.k === 'scale') {
        const a = F.v(it.a), b = F.v(it.b), t = (it.want - it.v[0]) / (it.v[1] - it.v[0]), p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        put([[p[0], p[1] - q * 1.5], p]);
      }
      if (it.k === 'pie') {
        const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
        let g = (it.given || [0])[0];
        it.sect.slice(0, -1).forEach(d => { g += d; put([c, at(c, g, r)]); });
      }
      if (it.k === 'inside') zig(it.poly.map(F.v));
    };
    spec.items.forEach(one);
    return out;
  }
  return { mark: mark, frameOf: frameOf, inkOf: inkOf, polygons: polygons, example: example };
}
const DRAW_MARK = drawMarker_();

/* CHECK: the strokes read in the figure's own units and held against `draw_answer` (366) -- a verdict and marks, as a typed answer gets */
function padCheck_(row, pad) {
  const out = row && row.querySelector('.qp-verdict');
  if (!row || !pad || !out) return null;
  const marks = padRead_(pad.getAttribute('data-k')), say = padSay_(marks);
  row.classList.remove('is-right', 'is-near');
  if (!say) { out.textContent = 'Draw your answer first'; return null; }
  const art = pad.querySelector('.qpad-art > svg:first-child');
  const r = DRAW_MARK.mark(marks, row.getAttribute('data-draw'), drawFig_(art ? (art.__src || art.outerHTML) : ''), row.getAttribute('data-marks'));
  if (!r) { out.textContent = 'Could not mark it \u2014 try again'; return null; }
  const v = r.of === 1 ? (r.got ? 'right' : 'wrong') : 'rule:' + r.got + '/' + r.of;
  row.classList.add(r.got >= r.of ? 'is-right' : 'is-near');
  out.textContent = padSaid_(subSay_(v).text);
  subRecord_(row.getAttribute('data-k'), say, v);
  if (typeof answersPush_ === 'function') answersPush_(true);
  return r;
}
on('pad-check', el => { const row = el.closest('.qpad-send'); padCheck_(row, padOfRow_(row)); });

/* ---------- ARMING ONE PAD, EVERY PART OF IT TOGETHER § */
function padArm_(pad, on) {
  if (!pad) return;
  if (!on && pad.getAttribute('data-k')) padZoomOff_(pad.getAttribute('data-k'));
  pad.classList.toggle('is-drawing', !!on);
  /* AND THE TOOL IN HAND, lit whether or not this pad was the last touched -- the rule `padBar_` draws by. */
  const tool = padToolNow_(pad);
  pad.querySelectorAll('.qpad-tool').forEach(t => {
    const lit = t.getAttribute('data-tool') === tool;
    tileSet_(t, { on: lit, pressed: lit });
  });
}

/* ---------- THE PEN § */
let PAD_ON = '';                  // the key of the pad currently taking the pen, '' for none
let PAD_ST = null;                // the stroke being drawn, already in the shape it is stored in
let PAD_GO = null;                // the drag behind it: which tool, on which ink, measured how, from where
/* WHICH TOOL EACH PAD IS HOLDING, by the pad's key, for the visit: a card is rebuilt on every repaint
   and a tool left on the element would be dropped with it, the `PAD_ON` argument one line up. */
const PAD_TOOL = new Map();
/* WHAT CLEAR LAST TOOK OFF EACH PAD, by key, for the visit -- so Undo straight after it puts the marks back. § */
const PAD_CLEARED = new Map();
const PAD_CLEARED_MARK = new Map();

/* THE TOOL A DRAG ON THIS PAD USES: § */
function padToolNow_(pad) {
  const t = (pad && PAD_TOOL.get(pad.getAttribute('data-k') || '')) || 'pen';
  /* the protractor is laid on the page, never drawn with (458) */
  return t !== 'pen' && t !== 'protractor' && pad.querySelector('.qpad-tool[data-tool="' + t + '"]') ? t : 'pen';
}

/* ---------- SCREEN PIXELS, NOT PICTURE UNITS, FOR ANYTHING ROUND § */
const PAD_MIN_PX = 4;                     // shorter than this a line or a radius is a slip, not a mark
/* AND LONGER FOR ONE STROKE: § */
const padMinOf_ = g => (!g ? PAD_MIN_PX : g.refused && !g.mine ? Infinity : g.min || PAD_MIN_PX);
const PAD_SWING_PX = 16;                  // nearer the point than this, its angle is noise
const PAD_ARC_MIN = Math.PI / 6;          // a swing of 30 degrees or more is an arc rather than a circle

/* A RING OR AN ARC AS THE POLYLINE THE PEN STORES: § */
function padArc_(c, R, sx, sy, a0, span) {
  const full = Math.abs(span) >= 2 * Math.PI;
  if (full) span = 2 * Math.PI;
  const n = Math.max(8, Math.min(120, Math.ceil(Math.abs(span) * R / 4)));
  const out = [];
  const put = (x, y) => {
    if (out.length && out[out.length - 2] === x && out[out.length - 1] === y) return;
    out.push(x, y);
  };
  for (let i = 0; i < n; i++) {
    const t = a0 + span * i / n;
    put(Math.round(c[0] + R * Math.cos(t) / sx), Math.round(c[1] + R * Math.sin(t) / sy));
  }
  if (full) put(out[0], out[1]);
  else put(Math.round(c[0] + R * Math.cos(a0 + span) / sx), Math.round(c[1] + R * Math.sin(a0 + span) / sy));
  return out;
}

/* ---------- THE COMPASS: THE POINT WHERE YOU PRESS, THE WIDTH WHERE YOU DRAG TO, THE ARC YOU SWING § */
function padSwing_(g, at) {
  const dx = (at[0] - g.from[0]) * g.sx, dy = (at[1] - g.from[1]) * g.sy;
  const r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  if (r >= Math.max(PAD_SWING_PX, g.rMax * 0.6)) {
    if (g.a === null) g.a0 = a;
    else {
      let d = a - g.a;
      if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
      g.sweep += d;
    }
    g.a = a;
  }
  g.rMax = Math.max(g.rMax, r);
  if (!g.held) { g.r = r; if (Math.abs(g.sweep) >= PAD_ARC_MIN) g.held = true; }
  const arc = g.held && Math.abs(g.sweep) >= PAD_ARC_MIN && Math.abs(g.sweep) < 2 * Math.PI;
  /* THE PENCIL'S END, where the radius line is drawn to: on the ring, in the finger's direction. */
  g.tip = [g.from[0] + g.r * Math.cos(a) / g.sx, g.from[1] + g.r * Math.sin(a) / g.sy];
  return padArc_(g.from, g.r, g.sx, g.sy, arc ? g.a0 : a, arc ? g.sweep : 2 * Math.PI);
}

/* WHAT A DRAG MAKES, BY TOOL. `move` answers the stroke to preview (null: nothing new); `end` answers
   the stroke to keep (null: nothing -- a tap is a dot to the pen, and to a ruler or a compass a slip). */
const PAD_DRAW = {
  pen: {
    /* ONE POINT PER PIXEL OF THE PICTURE, not one per event. A pointer fires far faster than a
       finger moves anything visible, and every duplicated point is two more characters in storage
       for a mark nobody can see. */
    move: (g, at, st) => {
      /* AFTER A HOLD (374): a ring or an arc is done; a line's corner waits until the point leaves where it paused */
      if (g.frozen) return null;
      if (g.qz) { if (Math.hypot(at[0] * g.sx - g.qz[0], at[1] * g.sy - g.qz[1]) <= PAD_HOLD_PX) return null; g.qz = null; g.lz = null; }
      /* A SHORT STROKE IS DRAWN EXACTLY AS MOVED: the string engages once the pointer is more than its length from where it went down -- a tick, a cross's arm (368) */
      if (padSteady_(g) && (g.slack || Math.hypot((at[0] - g.raw[0]) * g.sx, (at[1] - g.raw[1]) * g.sy) > PAD_STRING_PX)) { g.slack = true; at = padLazy_(g, at, st); }
      if (!at || (st[st.length - 2] === at[0] && st[st.length - 1] === at[1])) return null;
      st.push(at[0], at[1]);
      return st;
    },
    /* A STEADIED STROKE ENDS WHERE THE POINTER LIFTED: the string's slack is paid out in two steps, so nothing lags */
    end: (g, st) => {
      /* A CLICK THAT NEVER MOVED IS A PLOTTED POINT: onto the grid or the figure's point as a finger's is (357), never onto your own mark, where it would vanish */
      if (padSteady_(g) && !g.board && !g.slack && g.tg && st && st.length === 2) {
        const t = padSnap_(Object.assign({}, g, { hold: null, tg: { own: [], pts: g.tg.pts } }), st[0] * g.sx, st[1] * g.sy, '');
        return t ? [Math.round(t.u[0]), Math.round(t.u[1])] : st;
      }
      if (padSteady_(g) && !g.frozen && !g.qz && g.at && st && st.length >= 2) {
        const x = st[st.length - 2], y = st[st.length - 1], a = g.at;
        if (x !== a[0] || y !== a[1]) {
          const m = [Math.round((x + a[0]) / 2), Math.round((y + a[1]) / 2)];
          if (m[0] !== x || m[1] !== y) st.push(m[0], m[1]);
          if (m[0] !== a[0] || m[1] !== a[1]) st.push(a[0], a[1]);
        }
      }
      return st;
    },
  },
  /* A RULER IS ITS TWO ENDS. The live line follows the finger from where it went down; what is kept
     is that line and nothing of the path the finger took to get there. */
  ruler: {
    move: (g, at) => [g.from[0], g.from[1], at[0], at[1]],
    end: (g, st) => (st.length === 4
      && Math.hypot((st[2] - st[0]) * g.sx, (st[3] - st[1]) * g.sy) >= padMinOf_(g) ? st : null),
  },
  compass: {
    move: (g, at) => padSwing_(g, at),
    end: (g, st) => (g.r >= padMinOf_(g) && st.length >= 4 ? st : null),
  },
};

/* ---------- WHAT IS SHOWN WHILE IT IS DRAWN, AND GONE WHEN IT IS NOT § */
function padAid_(g) {
  const aid = g.ink.querySelector('.qpad-aid');
  if (!aid) return;
  const c = g.from;
  /* AND A HALO ROUND A SNAP THAT IS HOLDING (357): 30px on the screen, an ellipse in the stretched units so it
     is round where it is seen. Shown, never stored -- the aid is emptied at the lift. */
  const h = g.hold;
  const halo = h ? `<ellipse class="qpad-halo" vector-effect="non-scaling-stroke" cx="${h.u[0]}" cy="${h.u[1]}" rx="${30 / g.sx}" ry="${30 / g.sy}"/>` : '';
  if (g.tool === 'pen') {
    /* AND WHERE THE FINGER IS ABOUT TO BE (374): the platform's prediction, one short segment, never stored -- the next frame replaces it */
    const n = PAD_ST ? PAD_ST.length : 0, q = g.pred;
    const html = halo + (q && n >= 2 ? `<path class="qpad-pred" vector-effect="non-scaling-stroke" d="M${PAD_ST[n - 2]} ${PAD_ST[n - 1]}L${q[0]} ${q[1]}"/>` : '');
    if (aid.innerHTML !== html) aid.innerHTML = html;
    return;
  }
  const pin = `<path class="qpad-pin" vector-effect="non-scaling-stroke" d="M${c[0]} ${c[1]}L${c[0]} ${c[1]}"/>`;
  const rad = g.tool === 'compass' && g.tip && g.r >= padMinOf_(g)
    ? `<path class="qpad-rad" vector-effect="non-scaling-stroke" d="M${c[0]} ${c[1]}L${Math.round(g.tip[0])} ${Math.round(g.tip[1])}"/>`
    : '';
  aid.innerHTML = pin + rad + halo;
}

/* A FINGER IS THE PEN, AND TWO FINGERS, A PALM OR A THUMB ARE NOT (docs/history/338). § */
const PAD_STILL_PX = 10;      // "a dot", and "has moved": the app's own drag decision (`PRESS_MOVED`), iOS's 10pt
const PAD_ALSO_PX = 5;        // "moving too": half of it -- by the time one finger of a pan has gone 10, the other has gone 5
const PAD_TOGETHER_MS = 200;  // twice Android's tap timeout, because children's fingers land less in step
const PAD_TOGETHER_PX = 200;  // two fingertips of one hand (38mm on an iPad, 31 on a phone), not a palm heel
const PAD_BAR_MS = 400;       // a resting hand's release becomes a click within this: Android's long press
/* AFTER REVIEW (11 Oct, docs/history/338): § */
const PAD_KEEPUP_PX = 30;     // 3 x the 10px: at a child's 300px/s, 100ms -- past the 50-80ms a thumb rolls or a palm settles in
const PAD_WITH = 0.5;         // "kept up": half as far as the one that went furthest (a pan or pinch is about 1, a settle falls away)
const PAD_LAG_MS = 40;        // a finger that reported within this is still reporting: a frame at 60Hz plus a report's spread

/* THE CONTACTS, by `pointerId` (jsdom's `undefined` is a key like any other). § */
const PAD_TOUCH = new Map();
/* HELD: the stroke is kept (`PAD_ST`, `PAD_GO`, so `padHold_` and `findKeep_` still hold its column) and its samples go on accumulating, but nothing of it is on § */
let PAD_HUSH = null;
/* TWO FINGERS: no stroke, and nothing drawn until every one of these has lifted. */
const PAD_TWO = new Set();
/* A DECISION NOT YET MADE: § */
let PAD_DUE = null;
let PAD_FRAME = 0;
/* UNDO AND CLEAR REFUSED UNTIL THIS TIME, by pad key -- a hand resting on the bar (`padRested_`). */
const PAD_RESTED = new Map();
/* `?pen=sizes` IN THE ADDRESS: the last eight contacts' widths, on the screen -- the reading increment 2
   waits for. Nothing reads it but the line that shows it. */
const PAD_SIZES = (() => { try { return /[?&]pen=sizes(&|$)/.test(location.search) ? [] : null; } catch (e) { return null; } })();

const padDist_ = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/* A CONTACT'S SIZE: the larger of its two sides, and only when the platform reports one -- 1 (or 0) is
   "not known", which is what a mouse, iOS before 18 and Android's `pointerup` say. */
const padSizeOf_ = e => { const s = Math.max(Number(e && e.width) || 0, Number(e && e.height) || 0); return s > 1 ? s : 0; };

/* WHETHER A FINGER IS ON THE ARMED DRAWING -- the swipe engine asks this before it takes a gesture (overworld.js, the axis decision), so a palm or a thumb that § */
function padBusy_(k) {
  const on = k === undefined ? PAD_ON : k;
  if (!on || on !== PAD_ON || !PAD_TOUCH.size) return false;
  for (const c of PAD_TOUCH.values()) if (c.onInk && c.k === on) return true;
  return false;
}
/* A PEN IS IN USE WHILE A STROKE OR A CONTACT IS ON IT, not merely for being the last pad touched: with no lock (368) nothing else ever lets go of it. */
const padInUse_ = k => !!k && k === PAD_ON && (!!PAD_GO || PAD_TOUCH.size > 0);
/* ---------- UNDO AND CLEAR UNDER A RESTING HAND § */
const padRested_ = k => padBusy_(k) || (PAD_RESTED.get(k) || 0) > performance.now();

/* WRITTEN ONCE A FRAME, NOT IN THE HANDLER (after review): § */
let PAD_SIZES_FRAME = 0;
function padSizesSay_(c, e) {
  if (!PAD_SIZES || typeof document === 'undefined') return;
  if (e.type === 'pointerdown') {
    c.say = { type: c.type || '?', w: Math.round(Number(e.width) || 0), h: Math.round(Number(e.height) || 0), big: c.size };
    PAD_SIZES.push(c.say);
    if (PAD_SIZES.length > 8) PAD_SIZES.shift();
  } else if (c.say) {
    const big = Math.max(c.say.big, padSizeOf_(e));
    if (big === c.say.big) return;
    c.say.big = big;
  }
  if (PAD_SIZES_FRAME || typeof requestAnimationFrame !== 'function') return;
  PAD_SIZES_FRAME = requestAnimationFrame(padSizesShow_);
}
function padSizesShow_() {
  PAD_SIZES_FRAME = 0;
  let el = document.querySelector('.pad-sizes');
  if (!el) {
    el = document.createElement('div');
    el.className = 'pad-sizes';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  el.textContent = PAD_SIZES.map(s => s.type + ' ' + s.w + 'x' + s.h + ' largest ' + Math.round(s.big)).join('\n');
}

/* A CONTACT, NEW. `busy` names the pad a finger was on when an OFF-ink touch went down, for the bar. */
function padContact_(e, ink, k) {
  const at = [e.clientX, e.clientY], ts = e.timeStamp;
  const c = { id: e.pointerId, type: e.pointerType || '', t0: ts, p0: at, p: at.slice(), pm: at.slice(), tm: ts, ts: ts,
              hist: [[ts, at[0], at[1]]], far: 0,
              onInk: !!ink, ink: ink || null, k: k || '', size: padSizeOf_(e), big: 0, role: 'rest', pts: null,
              m0: null, h0: null, late: false, busy: !ink && padBusy_() ? PAD_ON : '' };
  c.big = c.size;
  PAD_TOUCH.set(e.pointerId, c);
  padSizesSay_(c, e);
  return c;
}
/* AND WHERE IT HAS GOT TO: how far from where it went down, and when it last really moved. A "move" is
   `PAD_ALSO_PX`, so a resting palm's tremble is not a contact on the move. */
function padTrack_(c, x, y, ts) {
  c.p = [x, y];
  const d = padDist_(c.p0, c.p);
  if (d > c.far) c.far = d;
  /* AND WHEN IT FIRST WENT `PAD_KEEPUP_PX`, by this sample's clock -- the moment `padRace_` compares. */
  if (c.tk === undefined && d >= PAD_KEEPUP_PX) c.tk = ts;
  if (padDist_(c.pm, c.p) >= PAD_ALSO_PX) { c.pm = c.p.slice(); c.tm = ts; }
  /* AND WHEN, BY THE SAMPLE'S OWN CLOCK. § */
  if (ts > c.ts) c.ts = ts;
  c.hist.push([ts, x, y]);
  if (c.hist.length > 256) c.hist.splice(0, 128);
}
/* WHERE A CONTACT WAS AT A MOMENT: its last sample at or before it. */
function padPos_(c, t) {
  const h = c.hist;
  for (let i = h.length - 1; i >= 0; i--) if (h[i][0] <= t) return h[i];
  return h[0];
}

/* WHERE A POINT IS ON THE PICTURE, IN ITS 340 UNITS, from a box ALREADY READ -- one read per event. */
function padMap_(r, cx, cy) {
  if (!r || !r.width || !r.height) return null;
  return [Math.round((cx - r.left) / r.width * 340), Math.round((cy - r.top) / r.height * 340)];
}

/* A STEADY HAND FOR A MOUSE OR A STYLUS (368): a lazy brush -- the ink follows the pointer on a string -- then a light low-pass. A finger keeps 357's ink under it, untouched */
const PAD_STRING_PX = 6;      // the string: a pointer's jitter inside it moves no ink, and a straight pull draws a straight line
const PAD_STEADY_K = 0.55;    // the low-pass: each point this much of the way from the last kept one to the string's end
const padSteady_ = g => !!(g && g.c && (g.c.type === 'mouse' || g.c.type === 'pen'));
function padLazy_(g, at, st) {
  const sx = g.sx || 1, sy = g.sy || 1;
  if (!g.lz) { g.lz = st.length >= 2 ? [st[st.length - 2], st[st.length - 1]] : at.slice(); g.sm = g.lz.slice(); }
  const dx = (at[0] - g.lz[0]) * sx, dy = (at[1] - g.lz[1]) * sy, d = Math.hypot(dx, dy);
  if (d <= PAD_STRING_PX) return null;
  const t = (d - PAD_STRING_PX) / d;
  g.lz = [g.lz[0] + (at[0] - g.lz[0]) * t, g.lz[1] + (at[1] - g.lz[1]) * t];
  g.sm = [g.sm[0] + (g.lz[0] - g.sm[0]) * PAD_STEADY_K, g.sm[1] + (g.lz[1] - g.sm[1]) * PAD_STEADY_K];
  return [Math.round(g.sm[0]), Math.round(g.sm[1])];
}

/* A POINT PUT DOWN EXACTLY WITH A FINGER (docs/history/357). § */
const PAD_DOT_PX = 12;        // a dot while the point has gone less than this from landing: +-4px wobble is at most 11.3
const PAD_FINE_PX = 13;       // a grid square under this is finer than a wobble can hit (2 x 5.66px, the worst radial error)
const PAD_GAIN = 0.2;         // the slow mode's gain: measured best of 0.5 / 0.33 / 0.25 / 0.2 by check/pen.js 'plotfine' (357's table)
const PAD_GAIN_OFF_PX = 40;   // the finger this far from where the slow mode began: it is going somewhere, not aiming
const PAD_GAIN_MAX_PX = 48;   // and the point is never further than this from the finger, so no band is out of reach
const PAD_GAIN_STILL_PX = 5;  // a ruler's end is "still" when the finger moved less than this ...
const PAD_GAIN_STILL_MS = 120; // ... over this long: then the slow mode takes over to aim it
const PAD_SNAP_OWN = 24;      // the snap radius cap for your own marks, px
const PAD_SNAP_GRID = 20;     // and for the grid's intersections and the figure's points
const PAD_SNAP_KEEP = 1.25;   // a held snap lets go only past this many radii -- no flicker at the edge
const PAD_LOCK_DEG = 6;       // a ruler line this near level or upright IS level or upright: how a bar lands on a grid line

/* THE GRID IN A PICTURE'S MARKUP, in its own viewBox units: § */
const PAD_GRIDS = new Map();
function padGrid_(svg) {
  const s = String(svg || '');
  if (!s) return null;
  if (PAD_GRIDS.has(s)) return PAD_GRIDS.get(s);
  const m = /viewBox\s*=\s*["']\s*([-\d.eE+]+)[\s,]+([-\d.eE+]+)[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/.exec(s);
  let out = null;
  if (m) {
    const vb = [+m[1], +m[2], +m[3], +m[4]];
    const V = [], H = [];
    const seg = (x1, y1, x2, y2) => {
      if (Math.abs(x1 - x2) < 0.05 && Math.abs(y2 - y1) >= vb[3] * 0.25) V.push(x1);
      else if (Math.abs(y1 - y2) < 0.05 && Math.abs(x2 - x1) >= vb[2] * 0.25) H.push(y1);
    };
    const num = (t, k) => { const r = new RegExp('\\b' + k + '\\s*=\\s*["\']\\s*([-\\d.eE+]+)').exec(t); return r ? +r[1] : 0; };
    /* NOTHING INSIDE A TRANSFORM OR A DEFINITION: its numbers are not where it is drawn. */
    const plain = s.replace(/<(defs|clipPath|pattern|mask|symbol)\b[\s\S]*?<\/\1>/g, '').replace(/<g\b[^>]*\btransform\s*=[\s\S]*?<\/g>/g, '');
    (plain.match(/<line\b[^>]*>/g) || []).forEach(t => { if (!/\btransform\s*=/.test(t)) seg(num(t, 'x1'), num(t, 'y1'), num(t, 'x2'), num(t, 'y2')); });
    (plain.match(/<path\b[^>]*>/g) || []).forEach(t => {
      if (/\btransform\s*=/.test(t)) return;
      const d = /\bd\s*=\s*["']([^"']*)["']/.exec(t);
      /* ONLY ABSOLUTE MOVES AND LINES: anything curved or relative is a drawing, not a ruled grid. */
      if (!d || /[^MLHVZmz\d\s,.eE+-]/.test(d[1]) || /[a-y]/.test(d[1].replace(/[eE]/g, ''))) return;
      const tok = d[1].match(/[MLHVZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
      let cx = 0, cy = 0, c = '';
      for (let i = 0; i < tok.length;) {
        if (/[MLHVZz]/.test(tok[i])) { c = tok[i++]; if (c === 'Z' || c === 'z') continue; }
        if (c === 'M') { cx = +tok[i++]; cy = +tok[i++]; c = 'L'; }
        else if (c === 'L') { const x = +tok[i++], y = +tok[i++]; seg(cx, cy, x, y); cx = x; cy = y; }
        else if (c === 'H') { const x = +tok[i++]; seg(cx, cy, x, cy); cx = x; }
        else if (c === 'V') { const y = +tok[i++]; seg(cx, cy, cx, y); cy = y; }
        else i++;
      }
    });
    const run = list => {
      const p = [...new Set(list.filter(isFinite).map(v => Math.round(v * 10) / 10))].sort((a, b) => a - b);
      if (p.length < 5) return null;
      const d = p.slice(1).map((v, i) => v - p[i]);
      const med = d.slice().sort((a, b) => a - b)[d.length >> 1];
      if (!(med > 0)) return null;
      /* THE LONGEST RUN OF EVEN STEPS -- an axis drawn a little off the grid, or a frame round it, ends a run, not the grid. */
      let best = [0, 0];
      for (let i = 0, j = 0; i < d.length; i = j) {
        j = i;
        while (j < d.length && Math.abs(d[j] - med) <= med * 0.15) j++;
        if (j - i > best[1] - best[0]) best = [i, j];
        if (j === i) j++;
      }
      const r = p.slice(best[0], best[1] + 1);
      if (r.length < 5) return null;
      const st = r.slice(1).map((v, i) => v - r[i]);
      const mean = st.reduce((a, b) => a + b, 0) / st.length;
      const cv = Math.sqrt(st.reduce((a, b) => a + (b - mean) * (b - mean), 0) / st.length) / mean;
      return cv < 0.15 ? r : null;
    };
    const xs = run(V), ys = run(H);
    if (xs && ys) out = { vb, xs, ys };
  }
  if (PAD_GRIDS.size > 400) PAD_GRIDS.clear();
  PAD_GRIDS.set(s, out);
  return out;
}
/* AND THAT GRID ON THE SCREEN, for one pad at one box size: § */
function padLattice_(pad, r) {
  if (!pad || !r || !r.width || !r.height || padIsBoard_(pad.getAttribute('data-k'))) return null;
  const svg = pad.querySelector('.qpad-art > svg:first-child');
  if (!svg) return null;
  const key = Math.round(r.width) + 'x' + Math.round(r.height);
  if (svg.__lat && svg.__lat.key === key) return svg.__lat.val;
  const G = padGrid_(svg.__src || (svg.__src = svg.outerHTML));
  let val = null;
  if (G) {
    const [vx, vy, vw, vh] = G.vb;
    const xu = G.xs.map(v => (v - vx) / vw * 340), yu = G.ys.map(v => (v - vy) / vh * 340);
    const sx = r.width / 340, sy = r.height / 340;
    const xp = xu.map(u => u * sx), yp = yu.map(u => u * sy);
    const step = a => Math.min.apply(null, a.slice(1).map((v, i) => v - a[i]));
    val = { xu, yu, xp, yp, pitch: Math.min(step(xp), step(yp)) };
  }
  svg.__lat = { key, val };
  return val;
}
/* THE NEAREST OF A SORTED LIST, by halving: a 71-line grid is 7 looks, not 71. */
function padNearest_(a, v) {
  let lo = 0, hi = a.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (a[m] < v) lo = m; else hi = m; }
  return Math.abs(a[lo] - v) <= Math.abs(a[hi] - v) ? lo : hi;
}
/* WHAT A PLACEMENT CAN SNAP TO, IN 338 SECTION 8's ORDER, read once when the finger lands: § */
function padTargets_(g, pad) {
  const own = [], pts = [];
  const sx = g.sx, sy = g.sy;
  const add = (list, u) => { if (isFinite(u[0]) && isFinite(u[1])) list.push({ u: u, x: u[0] * sx, y: u[1] * sy }); };
  try {
    padRead_(pad.getAttribute('data-k') || '').forEach(st => {
      if (!Array.isArray(st) || st.length < 2) return;
      add(own, [st[0], st[1]]);
      if (st.length > 2) add(own, [st[st.length - 2], st[st.length - 1]]);
    });
  } catch (e) {}
  pad.querySelectorAll('.qpad-was path').forEach(p => {
    const n = (p.getAttribute('d') || '').match(/-?\d+(\.\d+)?/g) || [];
    if (n.length >= 2) add(own, [+n[0], +n[1]]);
    if (n.length >= 4) add(own, [+n[n.length - 2], +n[n.length - 1]]);
  });
  const svg = pad.querySelector('.qpad-art > svg:first-child');
  const vb = svg && /([-\d.eE+]+)[\s,]+([-\d.eE+]+)[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/.exec(svg.getAttribute('viewBox') || '');
  if (vb) svg.querySelectorAll('.pt').forEach(c => {
    const x = Number(c.getAttribute('cx')), y = Number(c.getAttribute('cy'));
    if (isFinite(x) && isFinite(y) && c.hasAttribute('cx')) add(pts, [(x - vb[1]) / vb[3] * 340, (y - vb[2]) / vb[4] * 340]);
  });
  const pitch = g.lat ? g.lat.pitch : Infinity;
  const merge = list => list.filter((t, i) => !list.slice(0, i).some(o => Math.hypot(o.x - t.x, o.y - t.y) < 2));
  const radii = (list, cap) => list.map(t => {
    let nn = pitch;
    list.forEach(o => { if (o !== t) nn = Math.min(nn, Math.hypot(o.x - t.x, o.y - t.y)); });
    t.r = Math.min(cap, 0.45 * nn);
    return t;
  });
  return { own: radii(merge(own), PAD_SNAP_OWN), pts: radii(merge(pts), PAD_SNAP_GRID) };
}
/* THE TARGET A POINT (px from the box's corner) SNAPS TO, or null: § */
function padSnap_(g, x, y, axis) {
  const L = g.lat, T = g.tg;
  if (axis) {
    if (!L) return null;
    const r = Math.min(PAD_SNAP_GRID, 0.45 * L.pitch);
    if (axis === 'x') { const i = padNearest_(L.xp, x); return Math.abs(L.xp[i] - x) <= r ? { u: [L.xu[i], y / g.sy], x: L.xp[i], y: y, r: r } : null; }
    const j = padNearest_(L.yp, y);
    return Math.abs(L.yp[j] - y) <= r ? { u: [x / g.sx, L.yu[j]], x: x, y: L.yp[j], r: r } : null;
  }
  const h = g.hold;
  if (h && Math.hypot(h.x - x, h.y - y) <= h.r * PAD_SNAP_KEEP) return h;
  const near = list => { let b = null, bd = Infinity; (list || []).forEach(t => { const d = Math.hypot(t.x - x, t.y - y); if (d <= t.r && d < bd) { b = t; bd = d; } }); return b; };
  let t = T ? near(T.own) : null;
  if (!t && L) {
    const i = padNearest_(L.xp, x), j = padNearest_(L.yp, y);
    const r = Math.min(PAD_SNAP_GRID, 0.45 * L.pitch);
    if (Math.hypot(L.xp[i] - x, L.yp[j] - y) <= r) t = { u: [L.xu[i], L.yu[j]], x: L.xp[i], y: L.yp[j], r: r };
  }
  if (!t && T) t = near(T.pts);
  return t;
}
/* THE SLOW MODE ON A FINE GRID: § */
function padGain_(g, f, start) {
  const P = g.gain;
  if (P && Math.hypot(f[0] - P.f[0], f[1] - P.f[1]) >= PAD_GAIN_OFF_PX) g.gain = null;
  if (!g.gain) {
    let on = start;
    if (!on && g.tool !== 'pen' && g.c && g.c.hist) {
      const h = g.c.hist, now = h[h.length - 1];
      let ok = now && now[0] - h[0][0] >= PAD_GAIN_STILL_MS;
      for (let i = h.length - 1; ok && i >= 0 && now[0] - h[i][0] <= PAD_GAIN_STILL_MS; i--) if (Math.hypot(h[i][1] - now[1], h[i][2] - now[2]) >= PAD_GAIN_STILL_PX) ok = false;
      on = ok;
    }
    if (!on) return f;
    g.gain = { f: f.slice(), c: f.slice() };
    return f;
  }
  let cx = g.gain.c[0] + PAD_GAIN * (f[0] - g.gain.f[0]), cy = g.gain.c[1] + PAD_GAIN * (f[1] - g.gain.f[1]);
  const d = Math.hypot(cx - f[0], cy - f[1]);
  if (d > PAD_GAIN_MAX_PX) { cx = f[0] + (cx - f[0]) * PAD_GAIN_MAX_PX / d; cy = f[1] + (cy - f[1]) * PAD_GAIN_MAX_PX / d; }
  return [cx, cy];
}
/* ONE PLACEMENT: the finger's point (units) through the slow mode and the snap, back to WHOLE units -- what is stored is always whole numbers § */
function padPlace_(g, at, start) {
  let f = [at[0] * g.sx, at[1] * g.sy];
  if (g.lat && g.lat.pitch < PAD_FINE_PX) f = padGain_(g, f, start);
  let axis = '';
  if (g.tool === 'ruler' && !start && g.fp) {
    const dx = f[0] - g.fp[0], dy = f[1] - g.fp[1], a = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;
    if (Math.hypot(dx, dy) >= PAD_MIN_PX) {
      if (a <= PAD_LOCK_DEG || a >= 180 - PAD_LOCK_DEG) { f = [f[0], g.fp[1]]; axis = 'x'; }
      else if (Math.abs(a - 90) <= PAD_LOCK_DEG) { f = [g.fp[0], f[1]]; axis = 'y'; }
    }
  }
  const t = padSnap_(g, f[0], f[1], axis);
  g.hold = t && !axis ? t : null;
  g.snapped = !!t;
  const u = t ? t.u : [f[0] / g.sx, f[1] / g.sy];
  g.at = [Math.round(u[0]), Math.round(u[1])];
  if (start) g.fp = t ? [t.x, t.y] : f;
  return g.at.slice();
}
/* ---------- HOLD TO STRAIGHTEN (374): a pen line paused at its end becomes straight, a ring round, an arc an arc -- QuickShape's gesture. A quick stroke is kept as drawn */
const PAD_HOLD_MS = 500;      // still this long at a stroke's end: iPad's QuickShape waits about as long, past a child's ordinary 100-300ms pause
const PAD_HOLD_PX = 8;        // "still": within this of where the pause began -- a fingertip's +-4px wobble is inside it
const PAD_SHAPE_MIN = 20;     // a run shorter than this is a tick, not a line
let PAD_HOLD_T = 0;
const padHoldClear_ = () => { if (PAD_HOLD_T) { clearTimeout(PAD_HOLD_T); PAD_HOLD_T = 0; } };
/* EVERY PEN SAMPLE: the pause's clock restarts whenever the point leaves the zone it began in */
function padHoldWatch_(g) {
  if (!g.at || g.frozen) return;
  const f = [g.at[0] * g.sx, g.at[1] * g.sy];
  if (g.hz && Math.hypot(f[0] - g.hz[0], f[1] - g.hz[1]) <= PAD_HOLD_PX) return;
  g.hz = f;
  padHoldClear_();
  if (typeof setTimeout === 'function') PAD_HOLD_T = setTimeout(() => { PAD_HOLD_T = 0; padHoldFire_(g); }, PAD_HOLD_MS);
}
function padHoldFire_(g) {
  if (PAD_GO !== g || !PAD_ST || g.tool !== 'pen' || g.dot || g.frozen || g.qz || PAD_HUSH || PAD_DUE || PAD_TWO.size || !padShown_(g)) return;
  if (!g.ink || !g.ink.isConnected) return;
  padStraighten_(g);
}
/* A LEAST-SQUARES CIRCLE (Kasa) through points in px, about their mean for precision: { c, r } or null */
function padCircleFit_(P) {
  const n = P.length;
  let mx = 0, my = 0;
  P.forEach(p => { mx += p[0]; my += p[1]; });
  mx /= n; my /= n;
  let xx = 0, yy = 0, xy = 0, xz = 0, yz = 0, z = 0;
  P.forEach(p => { const x = p[0] - mx, y = p[1] - my, q = x * x + y * y; xx += x * x; yy += y * y; xy += x * y; xz += x * q; yz += y * q; z += q; });
  /* with the mean at 0 the sums of x and y vanish: D, E from a 2x2, F = -z/n */
  const det = xx * yy - xy * xy;
  if (!(Math.abs(det) > 1e-9)) return null;
  const D = (-xz * yy + yz * xy) / det, E = (-yz * xx + xz * xy) / det, F = -z / n;
  const r2 = (D * D + E * E) / 4 - F;
  if (!(r2 > 0)) return null;
  return { c: [mx - D / 2, my - E / 2], r: Math.sqrt(r2) };
}
/* WHAT A RUN OF POINTS (px) WAS MEANT TO BE: a line, or -- the whole stroke only -- a ring or an arc; null leaves it as drawn */
function padShapeOf_(P, whole) {
  const n = P.length;
  if (n < 2) return null;
  let len = 0;
  for (let i = 1; i < n; i++) len += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  if (len < PAD_SHAPE_MIN) return null;
  const a = P[0], b = P[n - 1], chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let dev = 0;
  if (chord > 0) P.forEach(p => { dev = Math.max(dev, Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / chord); });
  const tol = Math.max(6, 0.1 * chord);
  if (chord >= PAD_SHAPE_MIN && dev <= tol && len <= 1.3 * chord) return { kind: 'line' };
  if (!whole || n < 8) return null;
  const fit = padCircleFit_(P);
  if (!fit || fit.r < 10) return null;
  let sum = 0, worst = 0, turn = 0, prev = null;
  P.forEach(p => {
    const d = Math.hypot(p[0] - fit.c[0], p[1] - fit.c[1]) - fit.r, t = Math.atan2(p[1] - fit.c[1], p[0] - fit.c[0]);
    sum += d * d; worst = Math.max(worst, Math.abs(d));
    if (prev !== null) { let s = t - prev; if (s > Math.PI) s -= 2 * Math.PI; else if (s < -Math.PI) s += 2 * Math.PI; turn += s; }
    prev = t;
  });
  const rms = Math.sqrt(sum / n), cover = Math.abs(turn) * 180 / Math.PI;
  const a0 = Math.atan2(a[1] - fit.c[1], a[0] - fit.c[0]);
  if (cover >= 300 && rms <= 0.1 * fit.r && worst <= 0.25 * fit.r) return { kind: 'ring', c: fit.c, r: fit.r, a0: a0 };
  /* AN ARC IS HELD TO TIGHTER: a sketched curve (a parabola, a sine) paused at its end must not turn into a circle's piece */
  if (cover >= 40 && cover < 300 && dev > tol && rms <= 0.05 * fit.r && worst <= 0.12 * fit.r) return { kind: 'arc', c: fit.c, r: fit.r, a0: a0, span: turn };
  return null;
}
/* A STRAIGHTENED END (px): through the grid's snap, the ruler's level/upright lock against the other end, and back onto the stroke's own start to close a shape */
function padEndAt_(g, p, from, home) {
  g.hold = null;
  let f = p, axis = '';
  if (from) {
    const dx = f[0] - from[0], dy = f[1] - from[1], ang = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;
    if (ang <= PAD_LOCK_DEG || ang >= 180 - PAD_LOCK_DEG) { f = [f[0], from[1]]; axis = 'x'; }
    else if (Math.abs(ang - 90) <= PAD_LOCK_DEG) { f = [from[0], f[1]]; axis = 'y'; }
  }
  if (home && Math.hypot(f[0] - home[0], f[1] - home[1]) <= PAD_SNAP_OWN) return home.slice();
  const t = g.board ? null : padSnap_(g, f[0], f[1], axis);
  g.hold = null;
  return t ? [t.x, t.y, t.u] : f;
}
const padUnit_ = (g, p) => p[2] ? [Math.round(p[2][0]), Math.round(p[2][1])] : [Math.round(p[0] / g.sx), Math.round(p[1] / g.sy)];
/* THE PAUSE, ACTED ON: the run since the last corner replaced by its shape, shown at once; a line's end is a corner the pen goes on from */
function padStraighten_(g) {
  const st = PAD_ST, q0 = g.q0 || 0, sx = g.sx, sy = g.sy, P = [];
  for (let i = 2 * q0; i + 1 < st.length; i += 2) P.push([st[i] * sx, st[i + 1] * sy]);
  /* THE TREMBLE OF THE PAUSE ITSELF IS NOT THE SHAPE: the points still inside the pause's zone are left out, the finger's place put back */
  const tip = [g.at[0] * sx, g.at[1] * sy], hz = g.hz || tip;
  while (P.length > 1 && Math.hypot(P[P.length - 1][0] - hz[0], P[P.length - 1][1] - hz[1]) <= PAD_HOLD_PX) P.pop();
  P.push(tip);
  const sh = padShapeOf_(P, !q0);
  if (!sh) return false;
  let out;
  if (sh.kind === 'line') {
    const home = q0 ? [st[0] * sx, st[1] * sy] : null;
    const a = q0 ? P[0] : padEndAt_(g, P[0], null, null);
    const b = padEndAt_(g, P[P.length - 1], a, home);
    const ua = padUnit_(g, a), ub = padUnit_(g, b);
    out = st.slice(0, 2 * q0).concat(ua);
    if (ub[0] !== ua[0] || ub[1] !== ua[1]) out.push(ub[0], ub[1]);
    g.q0 = out.length / 2 - 1;
    g.qz = tip;
    g.lz = null;
  } else {
    const t = g.board ? null : padSnap_(g, sh.c[0], sh.c[1], '');
    g.hold = null;
    const c = t ? t.u : [sh.c[0] / sx, sh.c[1] / sy];
    out = padArc_(c, sh.r, sx, sy, sh.a0, sh.kind === 'ring' ? 2 * Math.PI : sh.span);
    g.frozen = true;
  }
  g.shaped = sh.kind;
  PAD_ST = out;
  padLiveShow_();
  try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
  return true;
}

/* ---------- A FINGER'S NEXT FEW MS, PREDICTED (374; 338 section 9's revisit): preview only, at most `PAD_PRED_PX` ahead, a finger's freehand line only */
const PAD_PRED_PX = 12;
function padPredict_(g, e, r) {
  if (g.tool !== 'pen' || g.dot || g.frozen || g.qz || !g.c || g.c.type !== 'touch' || !PAD_ST || PAD_ST.length < 4) return null;
  const pr = typeof e.getPredictedEvents === 'function' ? e.getPredictedEvents() : null;
  const q = pr && pr.length ? pr[pr.length - 1] : null;
  const u = q ? padMap_(r, q.clientX, q.clientY) : null, n = PAD_ST.length;
  if (!u || (u[0] === PAD_ST[n - 2] && u[1] === PAD_ST[n - 1])) return null;
  return Math.hypot((u[0] - PAD_ST[n - 2]) * g.sx, (u[1] - PAD_ST[n - 1]) * g.sy) <= PAD_PRED_PX ? u : null;
}
/* ---------- EVERY SAMPLE THE FINGER GAVE § */
function padSamples_(e) {
  const co = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
  return co && co.length ? co : [e];
}

/* ---------- A STROKE STARTS: today's start, for one contact § */
function padStart_(c, at, r) {
  const pad = c.ink.closest('.qpad');
  PAD_GO = { tool: padToolNow_(pad), ink: c.ink, from: at, sx: r.width / 340, sy: r.height / 340,
             r: 0, rMax: 0, a: null, a0: 0, sweep: 0, held: false, tip: null, id: c.id,
             c: c, t0: c.t0, k: padAspectOf_(pad), est: false, pen: false, dirty: false, live: [], start: 0,
             box: r, board: !!pad && padIsBoard_(pad.getAttribute('data-k')), lat: null, tg: null, hold: null, gain: null,
             at: at.slice(), fp: null, raw: at.slice(), dot: false, far: 0, loupe: 0 };
  const g = PAD_GO;
  /* A PLACEMENT, PUT DOWN (357): the pin and the ruler's first end where they snap, and the pen's touch a
     DOT -- one point -- until it has gone `PAD_DOT_PX`. Not on the board: it never snaps, and its taps are as before. */
  if (!g.board) {
    g.lat = padLattice_(pad, r);
    g.tg = padTargets_(g, pad);
    /* A MOUSE OR A STYLUS IS NOT PLACING A DOT: it lands where it is put, so an arrowhead's 8px stroke stays a stroke and is not snapped onto the shaft (368) */
    g.dot = g.tool === 'pen' && !padSteady_(g);
    g.from = g.tool === 'pen' && !g.dot ? at.slice() : padPlace_(g, at, true);
  }
  PAD_ST = g.tool === 'compass' ? [] : g.from.slice();
  c.role = 'owner';
  padLoupeWant_(g);
  return g;
}
/* ONE SAMPLE OF THE OWNER, THROUGH ITS TOOL. § */
function padStep_(g, at) {
  let st;
  if (g.tool === 'pen' && g.dot) {
    const r = g.raw;
    if (r[r.length - 2] !== at[0] || r[r.length - 1] !== at[1]) r.push(at[0], at[1]);
    const p = padPlace_(g, at, false);
    const f = g.gain ? [g.at[0] * g.sx, g.at[1] * g.sy] : [at[0] * g.sx, at[1] * g.sy];
    g.far = Math.max(g.far, Math.hypot(f[0] - g.raw[0] * g.sx, f[1] - g.raw[1] * g.sy));
    if (g.far < PAD_DOT_PX) {
      if (PAD_ST.length === 2 && PAD_ST[0] === p[0] && PAD_ST[1] === p[1]) { padLoupeStep_(g, at); return; }
      st = p;
    } else { g.dot = false; g.hold = null; g.gain = null; g.at = at.slice(); st = r.slice(); }
  } else {
    if (g.tool === 'pen') g.at = at.slice();
    /* A COMPASS WHOSE SWING HOLDS ITS RADIUS IS DRAWING, not placing: no halo left at the radius's old target. */
    if (g.tool === 'compass' && g.held) g.hold = null;
    st = PAD_DRAW[g.tool].move(g, g.tool === 'pen' || g.board || (g.tool === 'compass' && g.held) ? at : padPlace_(g, at, false), PAD_ST);
  }
  padLoupeStep_(g, at);
  if (g.tool === 'pen' && !g.dot) padHoldWatch_(g);
  if (!st) return;
  PAD_ST = st;
  g.dirty = true;
}
/* A CANDIDATE'S OWN SAMPLES, in units of its own ink, for the day it turns out to be the finger. */
function padKeep_(pts, at) {
  if (pts.length && pts[pts.length - 2] === at[0] && pts[pts.length - 1] === at[1]) return;
  pts.push(at[0], at[1]);
}

/* ---------- WHAT IS ON THE SCREEN OF IT ----------------------------------------------------------- */
function padLiveOff_(g) {
  if (!g || !g.ink) return;
  (g.live || []).forEach(p => p.remove());
  g.live = [];
  g.ink.querySelectorAll('[data-live]').forEach(p => p.remove());
  const aid = g.ink.querySelector('.qpad-aid');
  if (aid) aid.innerHTML = '';
  padLoupeOff_(true);
}
function padLivePath_(g, d) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  path.setAttribute('data-live', '1');
  const host = g.ink.querySelector('.qpad-g');
  if (host) host.appendChild(path);
  return path;
}
/* ---------- THE PEN'S LIVE PATH, ONCE A FRAME, IN CHUNKS § */
const PAD_CHUNK = 128;
/* ONE CHUNK: points a..b, through the one segment writer `padPath_` uses. */
const padChunk_ = (st, k, a, b) => 'M' + st[2 * a] + ' ' + st[2 * a + 1] + padSegs_(st, k, a, b);
function padChunks_(g) {
  g.dirty = false;
  const st = PAD_ST, n = st.length / 2;
  let open = g.live[g.live.length - 1];
  /* A REPAINT OF THIS PAD TOOK THE CHUNKS (an Undo from the other hand, a copy repainted): drawn again whole. */
  if (!open || !open.isConnected) {
    g.live.forEach(p => p.remove());
    open = padLivePath_(g, '');
    g.live = [open];
    g.start = 0;
  }
  while (n - 1 - g.start >= PAD_CHUNK + 2) {
    const b = g.start + PAD_CHUNK;
    open.setAttribute('d', padChunk_(st, g.k, g.start, b));
    open = padLivePath_(g, '');
    g.live.push(open);
    g.start = b;
  }
  open.setAttribute('d', g.start ? padChunk_(st, g.k, g.start, n - 1) : padPath_(st, g.k, true));
}
/* THE PREVIEW, DRAWN WHOLE FROM EVERY SAMPLE KEPT -- at the start, and when a hold resolves. Now, not at
   the next frame: the dot is under the finger the moment it lands. */
function padLiveShow_() {
  const g = PAD_GO;
  if (!g) return;
  padLiveOff_(g);
  g.start = 0;
  /* NOR WHAT CANNOT BE KEPT: a pin's or a palm's ruler line or ring while it is not known to be the one drawing (`padRace_`)
     -- the third review watched a palm's line and ring follow it round the picture and vanish at the lift. */
  if (!padShown_(g)) { g.dirty = false; return; }
  g.live = [padLivePath_(g, '')];
  if (g.tool === 'pen') padChunks_(g);
  else { g.live[0].setAttribute('d', padPath_(PAD_ST, g.k, true)); g.dirty = false; padAid_(g); }
}
/* AND AS IT GROWS: the pen at the next frame, the ruler and the compass now. */
function padLive_() {
  const g = PAD_GO;
  if (!g || PAD_HUSH || !g.dirty) return;
  if (g.tool === 'pen') { padFrameWant_(); return; }
  g.dirty = false;
  if (!padShown_(g)) return;
  const live = g.live[0];
  if (live) live.setAttribute('d', padPath_(PAD_ST, g.k, true));
  padAid_(g);
}

/* ---------- THE TRANSITIONS --------------------------------------------------------------------- */
/* NOTHING OF THE STROKE: no preview, no aid, nothing stored. The owner's contact stays (it is still down). */
function padWithdraw_() {
  padHoldClear_();
  const g = PAD_GO;
  PAD_ST = null; PAD_GO = null; PAD_HUSH = null; PAD_DUE = null;
  if (g) { padLiveOff_(g); if (g.c && g.c.role === 'owner') g.c.role = 'rest'; }
}
/* HELD: see `PAD_HUSH`. The candidate's own samples are kept from now on, if it is on the ink. */
function padHush_(c, kind) {
  c.role = 'cand';
  c.h0 = c.p.slice();
  c.pts = null;
  if (c.onInk && c.ink && c.ink.isConnected) {
    const at = padMap_(c.ink.getBoundingClientRect(), c.p[0], c.p[1]);
    if (at) c.pts = at;
  }
  PAD_HUSH = { cand: c, kind: kind, from: PAD_GO.c.p.slice() };
  padLiveOff_(PAD_GO);
}
/* THE OWNER WAS THE FINGER: the preview comes back from every sample kept, and the other is a rest. */
function padResume_() {
  const h = PAD_HUSH;
  if (h && h.cand && h.cand.role === 'cand') { h.cand.role = 'rest'; h.cand.pts = null; }
  PAD_HUSH = null;
  padLiveShow_();
}
/* THE OTHER WAS THE FINGER (a palm landed first): § */
function padSwap_(c, held) {
  const old = PAD_GO ? PAD_GO.c : null;
  padWithdraw_();
  if (old && PAD_TOUCH.get(old.id) === old) old.role = 'rest';
  const pts = c.pts || [];
  c.pts = null;
  if (pts.length < 2 || !c.ink || !c.ink.isConnected) { c.role = 'rest'; return; }
  const r = c.ink.getBoundingClientRect();
  const g = padStart_(c, pts.slice(0, 2), r);
  for (let i = 2; i + 1 < pts.length; i += 2) padStep_(g, [pts[i], pts[i + 1]]);
  if (held) { PAD_HUSH = { cand: null, kind: 'b', from: c.h0.slice() }; padLiveOff_(g); }
  else padLiveShow_();
}
/* TWO FINGERS: whatever the owner drew goes, and nothing is drawn until every one of these lifts. */
function padTwo_(more) {
  const who = [];
  if (PAD_GO && PAD_GO.c) who.push(PAD_GO.c);
  if (PAD_HUSH && PAD_HUSH.cand) who.push(PAD_HUSH.cand);
  (more || []).forEach(c => { if (c) who.push(c); });
  padWithdraw_();
  who.forEach(c => { if (PAD_TOUCH.get(c.id) === c) { c.role = 'two'; c.pts = null; PAD_TWO.add(c.id); } });
  PAD_TOUCH.forEach(c => { if (c.role === 'watch' || c.role === 'cand') c.role = 'rest'; });
}
/* A STROKE IS TENTATIVE while its finger is still a dot, or younger than `PAD_TOGETHER_MS`, or held. */
const padTentative_ = now => !!PAD_GO && !PAD_GO.est
  && (!!PAD_HUSH || PAD_GO.c.far < PAD_STILL_PX || !(now - PAD_GO.t0 >= PAD_TOGETHER_MS));

/* ---------- WHO MOVED, AND WHETHER WITH THE OTHER: JUDGED AT ONE MOMENT § */
/* THE ONES BEING TOLD APART, each with the point it is measured from: § */
function padParties_() {
  const g = PAD_GO;
  if (!g) return [];
  const o = g.c, h = PAD_HUSH, out = [{ c: o, ref: h ? h.from : o.p0 }];
  if (h && h.cand && PAD_TOUCH.get(h.cand.id) === h.cand) out.push({ c: h.cand, ref: h.cand.h0 });
  PAD_TOUCH.forEach(x => { if (x.role === 'watch' && x.m0) out.push({ c: x, ref: x.m0 }); });
  return out;
}
/* THE DECISION, if it can be made. `force` is a lift, a cancel or the page going: decided from where each one is. */
function padJudge_(force) {
  PAD_DUE = null;
  if (!PAD_GO || PAD_TWO.size) return;
  const ps = padParties_();
  if (ps.length < 2 && !PAD_HUSH) return;
  /* THE MOMENT: the latest every one still reporting has reported. One silent for `PAD_LAG_MS` has not moved since. */
  let latest = -Infinity;
  ps.forEach(p => { if (p.c.ts > latest) latest = p.c.ts; });
  let tc = latest;
  if (!force) ps.forEach(p => { if (p.c.ts > latest - PAD_LAG_MS && p.c.ts < tc) tc = p.c.ts; });
  ps.forEach(p => {
    const at = force ? [0, p.c.p[0], p.c.p[1]] : padPos_(p.c, tc);
    p.d = Math.hypot(at[1] - p.ref[0], at[2] - p.ref[1]);
  });
  const far = ps.reduce((a, b) => (b.d > a.d ? b : a));
  if (far.d < PAD_STILL_PX) {
    /* NOBODY HAS GONE 10px AT A MOMENT ALL HAVE REPORTED -- though one has by its own latest: the others' reports are
       still coming. Asked again at the frame after their next event; a lift decides it. */
    if (ps.some(p => padDist_(p.ref, p.c.p) >= PAD_STILL_PX)) PAD_DUE = { at: tc };
    return;
  }
  const moving = ps.filter(p => p.d >= PAD_ALSO_PX);
  if (moving.length > 1) {
    /* MORE THAN ONE HAS MOVED: a pan, or a hand settling as the finger goes? Not yet known. */
    if (far.d < PAD_KEEPUP_PX && !force) { PAD_DUE = { at: tc }; return; }
    const kept = moving.filter(p => p.d >= PAD_WITH * far.d);
    if (kept.length > 1) { padTwo_(kept.map(p => p.c)); return; }
  }
  /* A LATER CONTACT IS HANDED THE STROKE ONLY ONCE IT HAS GONE `PAD_KEEPUP_PX` (fourth review, 12 Oct). § */
  if (padOwed_(far.c) && far.d < PAD_KEEPUP_PX) { if (!force) PAD_DUE = { at: tc }; return; }
  padAlone_(far.c);
}
/* THE ONE TO BE HANDED THE STROKE, NOT YET HAVING SHOWN IT IS DRAWING -- it waits for `PAD_KEEPUP_PX`: § */
const padOwed_ = c => !!PAD_HUSH && PAD_HUSH.kind === 'b' && (c === PAD_HUSH.cand ? padTakes_(c) : c === PAD_GO.c && (c.late || !PAD_HUSH.cand));
/* ONE OF THEM MOVED, ALONE. § */
function padAlone_(x) {
  const o = PAD_GO.c, h = PAD_HUSH, cand = h ? h.cand : null;
  if (x === o) {
    PAD_TOUCH.forEach(c => { if (c.role === 'watch') c.role = 'rest'; });
    if (h) padResume_();
    return;
  }
  if (x.role === 'watch') { x.role = 'rest'; return; }
  if (!h || x !== cand) return;
  if (h.kind === 'a') { padTwo_(); return; }
  if (padTakes_(cand)) { padSwap_(cand, false); return; }
  const pinned = padPinned_(cand);
  cand.role = 'rest'; cand.pts = null;
  /* REFUSED, SO THE STILL ONE IS THE STROKE AGAIN -- and a ruler's or a compass's still owner is a PIN or a PALM until it shows otherwise. § */
  if (PAD_GO.tool !== 'pen') PAD_GO.min = Math.max(PAD_GO.min || 0, PAD_STILL_PX);
  if (pinned) {
    (PAD_GO.refused || (PAD_GO.refused = [])).push(cand);
    /* THE RACE STARTS WHERE THE STILL ONE WAS WHEN THE FIRST REFUSED ONE LANDED (fourth review), by the samples' clock: § */
    if (PAD_GO.raceAt === undefined) { PAD_GO.raceAt = cand.t0; PAD_GO.raceFrom = padPos_(PAD_GO.c, cand.t0).slice(1); }
  }
  padResume_();
  padRace_(PAD_GO, false);
}
/* WHICH OF THE TWO IS DRAWING, after the pin rule refused the later one: § */
function padRace_(g, force) {
  if (!g || !g.refused || g.mine || g.never || g !== PAD_GO) return;
  const o = g.c;
  let tk = Infinity, latest = o.ts;
  g.refused.forEach(c => { if (c.tk < tk) tk = c.tk; if (c.ts > latest) latest = c.ts; });
  let tl = Infinity;
  for (const h of o.hist) {
    if (h[0] < g.raceAt) continue;
    if (h[0] >= tk) break;
    if (Math.hypot(h[1] - g.raceFrom[0], h[2] - g.raceFrom[1]) >= PAD_KEEPUP_PX) { tl = h[0]; break; }
  }
  const told = (c, t) => force || c.ts >= t || latest - c.ts > PAD_LAG_MS || PAD_TOUCH.get(c.id) !== c;
  if (tl < tk) {
    if (!g.refused.every(c => told(c, tl))) return;
    g.mine = true;
    if (!PAD_HUSH) padLiveShow_();
    return;
  }
  if (tk < Infinity && told(o, tk)) g.never = true;
}
/* WHETHER ANY OF A STROKE IS SHOWN: all of it, unless the still one may not mark yet (`padRace_`). */
const padShown_ = g => !g.refused || !!g.mine;
/* WHETHER THE OTHER MAY TAKE THE STROKE: § */
function padTakes_(c) {
  if (!c || !c.late || !c.onInk || c.k !== PAD_ON || !c.pts) return false;
  return !padPinned_(c);
}
/* THE PIN RULE ITSELF, apart from the other reasons a contact may not take the stroke: § */
function padPinned_(c) {
  const g = PAD_GO;
  return !!c && !!g && c.late && c.onInk && c.k === PAD_ON && !!c.pts && g.tool !== 'pen' && c.t0 - g.t0 > PAD_TOGETHER_MS;
}
/* EVERY MOVE OF ONE OF THEM, AFTER ITS SAMPLES: once one has gone 10px by its own latest, the question is asked at the
   next frame (`padFrame_`). A frame is asked for only then, so a held stroke whose fingers are still costs nothing. */
function padRules_(c) {
  if (!PAD_GO || PAD_TWO.size) return;
  let watching = false;
  PAD_TOUCH.forEach(x => { if (x.role === 'watch') watching = true; });
  if (!PAD_HUSH && !watching) return;
  if (c !== PAD_GO.c && c.role !== 'cand' && c.role !== 'watch') return;
  if (!PAD_DUE && !padParties_().some(p => padDist_(p.ref, p.c.p) >= PAD_STILL_PX)) return;
  if (!PAD_DUE) PAD_DUE = { at: c.ts };
  padFrameWant_();
}
/* ---------- THE LOUPE: WHAT IS UNDER THE FINGER, ABOVE IT (357; 338 section 7's increment 2) § */
const PAD_LOUPE_PX = 128;
const PAD_LOUPE_RISE = 112;
let PAD_LOUPE_T = 0;
/* EVERY STROKE, EVERY TOOL, EVERY SURFACE (359): the loupe is up from the touch, above the finger, not only for a placement or after a pause. */
function padLoupeWant_(g) {
  if (PAD_LOUPE_T) { clearTimeout(PAD_LOUPE_T); PAD_LOUPE_T = 0; }
  g.lnow = true;
  padFrameWant_();
}
/* A SAMPLE: the loupe follows at the next frame. */
function padLoupeStep_(g) { if (g.lnow || g.loupe) padFrameWant_(); }
/* `hide` ONLY HIDES IT: the preview redrawn (`padLiveShow_`, at every landing) or held keeps the pause's timer, which a
   lift, a drop or the page going away ends. */
function padLoupeOff_(hide) {
  if (PAD_LOUPE_T && !hide) { clearTimeout(PAD_LOUPE_T); PAD_LOUPE_T = 0; }
  if (PAD_GO) PAD_GO.loupe = 0;
  if (typeof document === 'undefined') return;
  const el = document.querySelector('body > .pad-loupe');
  if (el && el.classList.contains('on')) { el.classList.remove('on'); el.removeAttribute('data-at'); }
}
/* AT THE FRAME: shown or not, and where. */
function padLoupe_(g) {
  if (!g || PAD_HUSH || PAD_TWO.size || !padShown_(g) || !g.ink || !g.ink.isConnected) { if (g && g.loupe) padLoupeOff_(); return; }
  if (!g.loupe && !g.lnow) return;
  let el = document.querySelector('body > .pad-loupe');
  if (!el) {
    el = document.createElement('div');
    el.className = 'pad-loupe';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="pad-loupe-in"></div><i class="pad-loupe-x"></i>';
    document.body.appendChild(el);
  }
  const box = g.box, inner = el.firstChild;
  if (!g.loupe) {
    const art = g.ink.closest('.qpad-art');
    if (!art || !box) return;
    const copy = art.cloneNode(true);
    copy.removeAttribute('data-do'); copy.removeAttribute('title');
    copy.querySelectorAll('[data-live]').forEach(p => p.removeAttribute('data-live'));
    copy.querySelectorAll('[data-noswipe]').forEach(p => p.removeAttribute('data-noswipe'));
    copy.style.width = box.width + 'px';
    copy.style.height = box.height + 'px';
    inner.textContent = '';
    inner.appendChild(copy);
    g.lcopy = { g: copy.querySelector('.qpad-g'), aid: copy.querySelector('.qpad-aid'), paths: [], aidWas: '' };
    copy.querySelectorAll('.qpad-g path:not([d])').forEach(p => p.remove());
    el.classList.toggle('is-paper', g.board);
    g.loupe = 1;
  }
  /* THE LIVE LINE AND THE AID, COPIED: only what changed is written. */
  const C = g.lcopy;
  if (C && C.g) {
    (g.live || []).forEach((p, i) => {
      let q = C.paths[i];
      if (!q) { q = document.createElementNS('http://www.w3.org/2000/svg', 'path'); q.setAttribute('vector-effect', 'non-scaling-stroke'); C.g.appendChild(q); C.paths[i] = q; q.was = ''; }
      const d = p.getAttribute('d') || '';
      if (q.was !== d) { q.setAttribute('d', d); q.was = d; }
    });
    const aid = g.ink.querySelector('.qpad-aid'), html = aid ? aid.innerHTML : '';
    if (C.aid && C.aidWas !== html) { C.aid.innerHTML = html; C.aidWas = html; }
  }
  const L = g.lat, z = Math.max(2, Math.min(4, L ? 12 / L.pitch : 2));
  const at = g.tool === 'compass' && g.held && g.tip ? [Math.round(g.tip[0]), Math.round(g.tip[1])] : g.at || g.from;
  const P = [at[0] * g.sx, at[1] * g.sy], f = g.c && g.c.p ? g.c.p : [box.left + P[0], box.top + P[1]];
  const half = PAD_LOUPE_PX / 2, W = window.innerWidth || 0;
  let cx = f[0], cy = f[1] - PAD_LOUPE_RISE;
  if (cy - half < 4) { cx = f[0] + (f[0] < W / 2 ? 1 : -1) * PAD_LOUPE_RISE; cy = Math.max(half + 4, f[1]); }
  if (W) cx = Math.max(half + 4, Math.min(W - half - 4, cx));
  inner.style.transform = `translate(${half - P[0] * z}px, ${half - P[1] * z}px) scale(${z})`;
  el.style.transform = `translate(${cx - half}px, ${cy - half}px)`;
  el.setAttribute('data-at', at[0] + ',' + at[1]);
  if (!el.classList.contains('on')) el.classList.add('on');
}
/* ---------- PINCH TO LOOK CLOSER (374): two fingers on an armed picture zoom and pan it; one finger draws on it zoomed; pinched back under 1.1x it is whole again § */
const PAD_ZOOM_MAX = 5;       // 338 section 9's ceiling: a 3.3px square becomes 16px, past a fingertip's wobble
const PAD_ZOOM_SNAP = 1.1;    // let go under this and the picture is whole again -- no near-1 zoom left behind by accident
const PAD_PINCH_START = 0.15; // the fingers' spread must change this much before an unzoomed picture zooms: a palm sliding with a finger does not
const PAD_ZOOM = new Map();   // by pad key: { s, x, y }, x and y the shift as a fraction of the picture's box
let PAD_PINCH = null;
const padZoomOf_ = k => PAD_ZOOM.get(k) || { s: 1, x: 0, y: 0 };
const padZoomVar_ = z => `translate(${(z.x * 100).toFixed(3)}%, ${(z.y * 100).toFixed(3)}%) scale(${z.s.toFixed(4)})`;
/* EVERY COPY OF THE PAD: the picture and its ink move together, so the box `padMap_` reads is where the finger is */
function padZoomPaint_(k) {
  const z = PAD_ZOOM.get(k), on = !!z && z.s > 1.001;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.qpad[data-k]').forEach(p => {
    if (p.getAttribute('data-k') !== k) return;
    p.classList.toggle('is-zoomed', on);
    if (on) { p.style.setProperty('--pad-zoom', padZoomVar_(z)); p.style.setProperty('--pad-zoom-s', z.s.toFixed(4)); }
    else { p.style.removeProperty('--pad-zoom'); p.style.removeProperty('--pad-zoom-s'); }
  });
}
function padZoomOff_(k) {
  const keys = k ? [k] : [...PAD_ZOOM.keys()];
  PAD_PINCH = null;
  keys.forEach(key => { if (PAD_ZOOM.delete(key)) padZoomPaint_(key); });
}
const padClamp_ = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/* ZOOM s ABOUT A SCREEN POINT m, keeping the picture's point u under it, and never showing past the picture's edge */
function padZoomAt_(k, s, u, m, A) {
  s = padClamp_(s, 1, PAD_ZOOM_MAX);
  const x = padClamp_((m[0] - A.left) / A.width - u[0] * s, 1 - s, 0), y = padClamp_((m[1] - A.top) / A.height - u[1] * s, 1 - s, 0);
  PAD_ZOOM.set(k, { s: s, x: x, y: y });
}
const padZoomU_ = (z, m, A) => [(m[0] - A.left - z.x * A.width) / (z.s * A.width), (m[1] - A.top - z.y * A.height) / (z.s * A.height)];
/* TWO FINGERS ALREADY JUDGED TWO (`padTwo_`), BOTH ON THE ARMED INK: their spread is the zoom, their midpoint the pan */
function padPinch_() {
  const two = [];
  PAD_TOUCH.forEach(x => { if (x.role === 'two' && x.onInk && x.ink && x.ink.isConnected) two.push(x); });
  if (two.length !== 2 || two[0].ink !== two[1].ink || two[0].k !== PAD_ON) return;
  const pad = two[0].ink.closest('.qpad'), art = pad && pad.querySelector('.qpad-art');
  if (!art) return;
  const A = art.getBoundingClientRect();
  if (!A.width || !A.height) return;
  const a = two[0].p, b = two[1].p, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d = Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1]));
  const P = PAD_PINCH;
  if (!P || P.a !== two[0] || P.b !== two[1]) {
    /* MEASURED FROM WHERE THE FINGERS LANDED, so the spread before they were known to be two is not lost */
    const z = padZoomOf_(PAD_ON), a0 = two[0].p0, b0 = two[1].p0, m0 = [(a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2];
    PAD_PINCH = { a: two[0], b: two[1], k: PAD_ON, d0: Math.max(1, Math.hypot(a0[0] - b0[0], a0[1] - b0[1])), s0: z.s, u: padZoomU_(z, m0, A), on: z.s > 1.001 };
  }
  padPinchMove_(PAD_PINCH, d, m, A);
}
function padPinchMove_(P, d, m, A) {
  if (!P.on) { if (Math.abs(d / P.d0 - 1) < PAD_PINCH_START) return; P.on = true; }
  padZoomAt_(P.k, P.s0 * d / P.d0, P.u, m, A);
  P.dirty = true;
  padFrameWant_();
}
/* A FINGER OF THE PINCH LIFTED: a zoom near 1 lets go */
function padPinchEnd_(c) {
  const P = PAD_PINCH;
  if (!P || (P.a !== c && P.b !== c)) return;
  PAD_PINCH = null;
  const z = PAD_ZOOM.get(P.k);
  if (z && z.s < PAD_ZOOM_SNAP) PAD_ZOOM.delete(P.k);
  padZoomPaint_(P.k);
}
/* A MOUSE OR A TRACKPAD: ctrl + wheel (a trackpad's pinch) zooms about the pointer; the wheel alone pans a zoomed picture */
document.addEventListener('wheel', e => {
  const ink = PAD_ON && e.target && e.target.closest && e.target.closest('.qpad-ink');
  const pad = ink && ink.closest('.qpad');
  if (!pad || pad.getAttribute('data-k') !== PAD_ON) return;
  const k = PAD_ON, z = padZoomOf_(k), art = pad.querySelector('.qpad-art');
  if (!art || (!e.ctrlKey && z.s <= 1.001)) return;
  const A = art.getBoundingClientRect();
  if (!A.width || !A.height) return;
  e.preventDefault(); e.stopPropagation();
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? A.height : 1;
  if (e.ctrlKey) {
    const m = [e.clientX, e.clientY];
    padZoomAt_(k, z.s * Math.exp(-e.deltaY * unit * 0.01), padZoomU_(z, m, A), m, A);
    const n = PAD_ZOOM.get(k);
    if (n && n.s < 1.01) PAD_ZOOM.delete(k);
  } else {
    PAD_ZOOM.set(k, { s: z.s, x: padClamp_(z.x - e.deltaX * unit / A.width, 1 - z.s, 0), y: padClamp_(z.y - e.deltaY * unit / A.height, 1 - z.s, 0) });
  }
  padZoomPaint_(k);
}, { passive: false, capture: true });
/* THE PEN'S FRAME: a decision waiting (`padJudge_`), then the live path's open chunk, written once a frame
   (`padChunks_`). */
function padFrameWant_() {
  if (PAD_FRAME || typeof requestAnimationFrame !== 'function') return;
  PAD_FRAME = requestAnimationFrame(padFrame_);
}
function padFrame_() {
  PAD_FRAME = 0;
  if (PAD_PINCH && PAD_PINCH.dirty) { PAD_PINCH.dirty = false; padZoomPaint_(PAD_PINCH.k); }
  if (PAD_DUE) padJudge_(false);
  if (PAD_GO && PAD_GO.refused) padRace_(PAD_GO, false);
  const g = PAD_GO;
  if (g && g.dirty && !PAD_HUSH && g.tool === 'pen') { padChunks_(g); if (padShown_(g)) padAid_(g); }
  /* AND THE LOUPE, here and nowhere else (357). */
  if (g) padLoupe_(g);
}

/* ---------- A CONTACT LANDS § */
function padLand_(e, ink, k) {
  const old = PAD_TOUCH.get(e.pointerId);
  /* THE SAME ID GOING DOWN AGAIN means its own lift never came -- a mouse is always pointer 1 -- so it
     starts afresh rather than wedging the pen; and so does a stroke whose ink a repaint has replaced. */
  if (old) padGone_(old, e.timeStamp, 'lost');
  if (PAD_GO && !(PAD_GO.ink && PAD_GO.ink.isConnected)) { const g = PAD_GO; padWithdraw_(); if (g.c) PAD_TOUCH.delete(g.c.id); }
  const c = padContact_(e, ink, k);
  const now = e.timeStamp;
  if (PAD_TWO.size) {
    let going = false;
    PAD_TWO.forEach(id => { const x = PAD_TOUCH.get(id); if (x && now - x.tm <= PAD_TOGETHER_MS) going = true; });
    if (going) { if (ink) { c.role = 'two'; PAD_TWO.add(c.id); } return; }
    PAD_TWO.forEach(id => { const x = PAD_TOUCH.get(id); if (x) x.role = 'rest'; });
    PAD_TWO.clear();
  }
  if (PAD_GO && PAD_GO.pen) return;
  if (PAD_HUSH) {
    /* A THIRD CONTACT is two fingers and more (T4). Held ALONE -- the other has lifted -- it is a second. */
    if (PAD_HUSH.cand) { padTwo_([c]); return; }
    c.late = true;
    padHush_(c, 'b');
    return;
  }
  if (PAD_ST && PAD_GO) {
    const o = PAD_GO.c;
    c.late = true;
    if (PAD_GO.est || (o.far >= PAD_STILL_PX && now - PAD_GO.t0 >= PAD_TOGETHER_MS)) return;
    if (o.far < PAD_STILL_PX) { padHush_(c, 'b'); return; }
    if (now - PAD_GO.t0 < PAD_TOGETHER_MS && padDist_(c.p0, o.p) <= PAD_TOGETHER_PX) { padHush_(c, 'a'); return; }
    return;
  }
  if (!ink) return;
  /* A COLUMN OR A PANE ALREADY MOVING IS NOT DRAWN ON: the swipe engine is carrying another finger. */
  if (e.isPrimary === false && typeof SWIPE !== 'undefined' && SWIPE.live && SWIPE.axis && SWIPE.id !== e.pointerId) return;
  const r = ink.getBoundingClientRect();
  const at = padMap_(r, e.clientX, e.clientY);
  if (!at) { PAD_TOUCH.delete(c.id); return; }
  padStart_(c, at, r);
  padLiveShow_();
  if (c.type === 'mouse' || c.type === 'pen') {
    PAD_GO.est = true;
    /* A STYLUS: every touch already down, and every one to come, is the hand holding it. */
    if (c.type === 'pen') { PAD_GO.pen = true; PAD_TOUCH.forEach(x => { if (x !== c) x.role = 'rest'; }); }
    return;
  }
  const young = [];
  PAD_TOUCH.forEach(x => {
    if (x === c) return;
    /* EVERY ONE OF THEM WAS DOWN BEFORE THIS OWNER, whatever it was to the stroke before -- so none may take this one over. */
    x.late = false;
    const moving = padDist_(x.p0, x.p) >= PAD_STILL_PX && now - x.tm <= PAD_TOGETHER_MS;
    if (now - x.t0 <= PAD_TOGETHER_MS || moving) young.push(x);
    else { x.role = 'watch'; x.m0 = x.p.slice(); }
  });
  if (young.length > 1) padTwo_(young);
  else if (young.length) padHush_(young[0], 'b');
}

/* ---------- A CONTACT GOES § */
function padGone_(c, now, how) {
  if (PAD_TOUCH.get(c.id) === c) PAD_TOUCH.delete(c.id);
  if (c.busy && !c.onInk) PAD_RESTED.set(c.busy, performance.now() + PAD_BAR_MS);
  padPinchEnd_(c);
  if (PAD_TWO.has(c.id)) { PAD_TWO.delete(c.id); return; }
  const g = PAD_GO;
  if (g && g.c === c) {
    if (how === 'lost') { padWithdraw_(); return; }
    if (PAD_HUSH) {
      const cand = PAD_HUSH.cand, takes = padTakes_(cand);
      padWithdraw_();
      if (takes) padSwap_(cand, true);
      else if (cand) { cand.role = 'rest'; cand.pts = null; }
      return;
    }
    /* A PIN-RULE PAIR NOT YET TOLD APART: decided now, from what has come (`padRace_`). */
    if (g.refused) padRace_(g, true);
    /* THE LOCK PRESSED OFF BY ANOTHER HAND mid-stroke: an established stroke is kept, as it always was. */
    if ((how === 'cancel' || PAD_ON !== c.k) && padTentative_(now)) { padWithdraw_(); return; }
    padCommit_();
    return;
  }
  if (PAD_HUSH && PAD_HUSH.cand === c) { PAD_HUSH.cand = null; c.pts = null; }
}
/* T6: THE STROKE KEPT. Today's lift, unchanged: the tool's end, the board's thinning, `padSave_`. */
function padCommit_() {
  const g = PAD_GO;
  padHoldClear_();
  if (!g) return;
  let st = PAD_DRAW[g.tool].end(g, PAD_ST);
  PAD_ST = null; PAD_GO = null; PAD_HUSH = null; PAD_DUE = null;
  /* THE FRAME NOT YET RUN IS DONE HERE, NOW: the stroke is stored from every sample fed, and drawn below
     from what was stored -- never from what the last frame happened to have drawn. */
  if (PAD_FRAME && typeof cancelAnimationFrame === 'function') { cancelAnimationFrame(PAD_FRAME); PAD_FRAME = 0; }
  if (g.c && g.c.role === 'owner') g.c.role = 'rest';
  padLoupeOff_();
  const lives = [].slice.call(g.ink.querySelectorAll('[data-live]'));
  const aid = g.ink.querySelector('.qpad-aid');
  if (aid) aid.innerHTML = '';
  /* A SLIP IS TAKEN BACK OFF THE SCREEN as well as never stored: the preview is not a mark. */
  if (!st) { lives.forEach(p => p.remove()); return; }
  const pad = g.ink.closest('.qpad');
  const k = (pad && pad.getAttribute('data-k')) || '';
  /* THE WHITEBOARD'S STROKE IS STORED THINNED -- see `PAD_BOARD_MAX`. A question's keeps every point. */
  if (padIsBoard_(k) && typeof ansSimplify_ === 'function') st = ansSimplify_(st, 1);
  lives.slice(1).forEach(p => p.remove());
  /* AND DRAWN EVEN IF A REPAINT OF THIS PAD TOOK THE PREVIEW (an Undo pressed by the other hand, a copy
     repainted): a stored stroke that is not on the screen is the one Undo then takes off unseen. */
  const live = lives[0] || padLivePath_(g, '');
  live.removeAttribute('data-live');
  live.setAttribute('d', padPath_(st, g.k));
  if (!pad) return;
  const all = padRead_(k); all.push(st);
  padSave_(pad, k, all);
}
/* ---------- T8: LEAVING, AND T0: A LIFT THAT NEVER CAME § */
function padDrop_(keepZoom) {
  padHoldClear_();
  if (!keepZoom) padZoomOff_();
  if (PAD_FRAME && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(PAD_FRAME);
  PAD_FRAME = 0;
  const g = PAD_GO;
  PAD_ST = null; PAD_GO = null; PAD_HUSH = null; PAD_DUE = null;
  PAD_TOUCH.clear(); PAD_TWO.clear();
  if (g) padLiveOff_(g);
  padLoupeOff_();
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.qpad-ink [data-live]').forEach(p => p.remove());
  document.querySelectorAll('.qpad-aid').forEach(a => { if (a.firstChild) a.innerHTML = ''; });
}
/* THE PAGE GOING AWAY, OR THE WINDOW LOSING FOCUS, MID-STROKE: the cancel rule, and every contact forgotten
   -- their lifts will not come here. */
function padAway_(e) {
  padLoupeOff_();
  if (PAD_DUE) padJudge_(true);
  if (PAD_GO && PAD_GO.refused) padRace_(PAD_GO, true);
  if (PAD_ST && PAD_GO) {
    const now = e && typeof e.timeStamp === 'number' ? e.timeStamp : PAD_GO.t0;
    if (padTentative_(now)) padWithdraw_(); else padCommit_();
  }
  if (PAD_TOUCH.size || PAD_TWO.size || PAD_GO) padDrop_();
}

/* ---------- THE LISTENERS § */
/* T0: A PRIMARY POINTER IS THE PLATFORM SAYING NO OTHER OF ITS KIND IS DOWN -- so every contact of that kind still here lost its lift. § */
function padPrimary_(e) {
  const type = e.pointerType || '';
  let other = false;
  PAD_TOUCH.forEach(c => { if (c.type !== type) other = true; });
  if (!other) { if (PAD_TOUCH.size || PAD_GO || PAD_TWO.size) padDrop_(true); return; }
  const mine = [];
  PAD_TOUCH.forEach(c => { if (c.type === type) mine.push(c); });
  mine.forEach(c => padGone_(c, e.timeStamp, 'lost'));
  /* WHAT IS LEFT, IF ITS STROKE WENT WITH THEM, IS ORDINARY. */
  if (!PAD_GO) PAD_TOUCH.forEach(c => { if (c.role !== 'rest' && c.role !== 'two') { c.role = 'rest'; c.pts = null; } });
}
document.addEventListener('pointerdown', e => {
  if (e.isPrimary === true && (PAD_TOUCH.size || PAD_GO || PAD_TWO.size)) padPrimary_(e);
  const ink = e.target && e.target.closest && e.target.closest('.qpad-ink');
  const pad = ink && ink.closest('.qpad');
  const k = pad ? pad.getAttribute('data-k') || '' : '';
  /* THE FIRST TOUCH DRAWS (368): a contact on a pad's ink with nothing else down takes the pen to that pad; there is no lock. */
  if (pad && k && k !== PAD_ON && !PAD_TOUCH.size && !PAD_GO && !PAD_TWO.size) padTake_(pad, k);
  if (!pad || !PAD_ON || k !== PAD_ON) {
    if (PAD_ON && e.pointerType === 'touch') padLand_(e, null, '');
    return;
  }
  e.preventDefault();
  padLand_(e, ink, k);
  try { ink.setPointerCapture(e.pointerId); } catch (err) {}
});

document.addEventListener('pointermove', e => {
  if (!PAD_TOUCH.size) return;
  const c = PAD_TOUCH.get(e.pointerId);
  if (!c) return;
  const s = padSizeOf_(e);
  if (s > c.big) c.big = s;
  if (PAD_SIZES) padSizesSay_(c, e);
  const g = PAD_GO && PAD_GO.c === c ? PAD_GO : null;
  /* THE OWNER'S SAMPLES ONLY FROM ITS OWN INK: a repaint that replaced it ends what this stroke can take,
     and the lift stores what it has. A candidate's, from its own. */
  const feed = !!g && !!e.target && !!e.target.closest && e.target.closest('.qpad-ink') === g.ink;
  const keep = !feed && c.role === 'cand' && !!c.pts && !!c.ink && c.ink.isConnected;
  const r = feed ? g.ink.getBoundingClientRect() : keep ? c.ink.getBoundingClientRect() : null;
  padSamples_(e).forEach(p => {
    const x = p.clientX, y = p.clientY;
    padTrack_(c, x, y, p.timeStamp || e.timeStamp);
    if (!r) return;
    const at = padMap_(r, x, y);
    if (!at) return;
    if (feed) padStep_(g, at); else padKeep_(c.pts, at);
  });
  /* THE BOX THIS EVENT READ, for the loupe's frame to place itself by -- read once, here, as it always was. */
  if (feed && r) { g.box = r; g.pred = padPredict_(g, e, r); }
  /* WHICH OF A PIN-RULE PAIR IS DRAWING, asked at the frame after any move while it is not known (`padRace_`) -- the
     refused one's moves too, though it is only a rest now: how far it goes is the evidence. */
  if (PAD_GO && PAD_GO.refused && !PAD_GO.mine && !PAD_GO.never) padFrameWant_();
  padRules_(c);
  if (c.role === 'two') padPinch_();
  if (feed && PAD_GO === g) padLive_();
});

function padEnd_(e) {
  const c = PAD_TOUCH.get(e ? e.pointerId : undefined);
  /* ONE OF THEM LIFTING DECIDES what was not yet decided, from where each one got to. A rest lifting does not. */
  if (PAD_DUE && c && PAD_GO && (c === PAD_GO.c || c.role === 'cand' || c.role === 'watch')) padJudge_(true);
  if (c) { padGone_(c, e ? e.timeStamp : 0, e && e.type === 'pointercancel' ? 'cancel' : 'up'); return; }
  /* A LIFT THE PEN KEPT NO CONTACT FOR: another finger's, which is not the end of this stroke. */
}

/* ---------- A STROKE THE DEVICE REFUSED STAYS ON THE SCREEN, AND THE NOTE SAYS IT IS NOT SAVED § */
function padSave_(pad, k, all) {
  const v = JSON.stringify(all);
  if (padIsBoard_(k) && v.length > PAD_BOARD_MAX) {
    padRepaint_(pad, padRead_(k));
    toast('The board is full. Clear it to carry on.');
    return false;
  }
  ansStore_(k, v);
  padCopies_(k, pad, all);
  /* A VERDICT IS ABOUT THE DRAWING IT WAS FOR: a mark added or taken away says so again under Send. */
  document.querySelectorAll('.qpad-send[data-pad]').forEach(row => {
    const out = row.querySelector('.qp-verdict');
    if (row.getAttribute('data-pad') !== k || !out) return;
    const said = subBoxSay_(row.getAttribute('data-k'), padSay_(all));
    row.classList.remove('is-right', 'is-near');
    out.textContent = padSaid_(said.text);
  });
  return true;
}
/* AND EVERY PAD THAT SHOWS THIS PART'S INK UNDER ITS OWN (`data-under`, 381), drawn again from the store */
function padUnderRepaint_(k) {
  document.querySelectorAll('.qpad[data-under]').forEach(p => {
    const keys = String(p.getAttribute('data-under')).split(' ');
    const g = keys.indexOf(k) >= 0 && p.querySelector('.qpad-was');
    if (!g) return;
    const ka = padAspectOf_(p);
    g.innerHTML = [].concat(...keys.map(padRead_)).map(st => `<path vector-effect="non-scaling-stroke" d="${padPath_(st, ka)}"/>`).join('');
  });
}
/* ---------- AND EVERY OTHER COPY OF THE SAME PAD, FROM THE STORE § */
function padCopies_(k, pad, all) {
  document.querySelectorAll('.qpad[data-k]').forEach(p => {
    if (p !== pad && p.getAttribute('data-k') === k) padRepaint_(p, all);
  });
  padUnderRepaint_(k);
}
document.addEventListener('pointerup', padEnd_);
document.addEventListener('pointercancel', padEnd_);
/* NO CALLOUT AND NO MENU FROM A FINGER HELD ON THE ARMED DRAWING -- the keypad's precedent (keypad.js). */
document.addEventListener('contextmenu', e => {
  const ink = e.target && e.target.closest && e.target.closest('.qpad-ink');
  const pad = ink && ink.closest('.qpad');
  if (pad && PAD_ON && pad.getAttribute('data-k') === PAD_ON) e.preventDefault();
});
/* THE PAGE HIDDEN OR LEFT, OR THE WINDOW LOSING FOCUS, MID-GESTURE: `padAway_`. */
document.addEventListener('visibilitychange', e => { if (document.visibilityState === 'hidden') padAway_(e); });
window.addEventListener('pagehide', padAway_);
window.addEventListener('blur', padAway_);

/* WHICH PAD TAKES THE PEN: the one a finger, a stylus or a mouse lands on, or whose tool is chosen. One at a time, so 338's palm and two-finger rules have one ink to ask about. */
function padTake_(pad, k) {
  [].slice.call(document.querySelectorAll('.qpad')).forEach(p => padArm_(p, false));
  PAD_ON = k;
  padArm_(pad, true);
  padForgetOthers_();
}
function padForgetOthers_() {
  const keep = PAD_GO ? PAD_GO.c : null;
  PAD_TOUCH.forEach((c, id) => { if (c !== keep) PAD_TOUCH.delete(id); });
  PAD_TWO.clear();
  if (PAD_HUSH) PAD_HUSH.cand = null;
  PAD_DUE = null;
}

/* ---------- PEN, RULER, COMPASS: CHOOSING ONE ALSO GIVES THIS PAD THE PEN (368: there is no lock; the first touch does the same) */
on('pad-tool', (el) => {
  const pad = el.closest('.qpad'); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  const t = el.getAttribute('data-tool') || 'pen';
  /* THE PROTRACTOR IS PUT DOWN OR PICKED UP, and the tool in hand stays in hand (458). */
  if (t === 'protractor') {
    const st = padProtOf_(k);
    st.on = !st.on;
    if (PAD_ON !== k) padTake_(pad, k);
    padProtSync_(k);
    return;
  }
  PAD_TOOL.set(k, t);
  if (PAD_ON !== k) padTake_(pad, k); else padArm_(pad, true);
});

/* ---------- THE PROTRACTOR (458): a 180° scale lying over the pen's page, moved by its body, turned by its knob ---------- */
/* where it lies, per pad key for the visit: its centre in % of the picture, its turn in degrees */
const PAD_PROT = new Map();
function padProtOf_(k) { if (!PAD_PROT.has(k)) PAD_PROT.set(k, { on: false, x: 50, y: 70, a: 0 }); return PAD_PROT.get(k); }
const padProtOn_ = k => !!(k && PAD_PROT.has(k) && PAD_PROT.get(k).on);
/* THE PIVOT (the centre of the base line) inside the drawing's box, in %: the box is -8 -26 216 134 */
const PROT_PX = 50, PROT_PY = 126 / 134 * 100;
/* WITHIN THIS MANY DEGREES OF LEVEL OR UPRIGHT IT SETTLES THERE, as a ruler laid on a line does */
const PROT_SNAP_DEG = 2;
let PROT_SVG = '';
function padProtSvg_() {
  if (PROT_SVG) return PROT_SVG;
  const R = 100, cx = 100, cy = 100, P = (r, d) => { const t = (180 - d) * Math.PI / 180; return [(cx + r * Math.cos(t)).toFixed(2), (cy - r * Math.sin(t)).toFixed(2)]; };
  let ticks = '', nums = '';
  for (let d = 0; d <= 180; d++) {
    const len = d % 10 === 0 ? 12 : d % 5 === 0 ? 8 : 4, a = P(R, d), b = P(R - len, d);
    ticks += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
    if (d % 10 === 0) {
      const o = P(R - 19, d), i = P(R - 31, d);
      nums += `<text x="${o[0]}" y="${o[1]}">${d}</text><text class="qprot-in" x="${i[0]}" y="${i[1]}">${180 - d}</text>`;
    }
  }
  PROT_SVG = `<svg viewBox="-8 -26 216 134" aria-hidden="true">
    <path class="qprot-body" d="M0 100A100 100 0 0 1 200 100Z"/>
    <path class="qprot-ticks" d="${ticks}M${cx} ${cy}L${cx} ${cy - 40}M${cx - 6} ${cy}L${cx + 6} ${cy}"/>
    <g class="qprot-nums">${nums}</g>
    <circle class="qprot-pin" cx="${cx}" cy="${cy}" r="2.5"/>
    <line class="qprot-stem" x1="${cx}" y1="0" x2="${cx}" y2="-14"/>
    <circle class="qprot-knob" data-prot="turn" cx="${cx}" cy="-16" r="9"/>
    <circle class="qprot-hit" data-prot="turn" cx="${cx}" cy="-16" r="22"/>
  </svg>`;
  return PROT_SVG;
}
function padProtHtml_(k) {
  const st = padProtOf_(k);
  return `<div class="qpad-prot" data-noswipe data-prot-k="${esc(k)}" role="img" aria-label="Protractor, turned ${Math.round(st.a)} degrees"
    style="left:${st.x.toFixed(2)}%;top:${st.y.toFixed(2)}%;transform:translate(-${PROT_PX}%,-${PROT_PY.toFixed(3)}%) rotate(${st.a}deg);transform-origin:${PROT_PX}% ${PROT_PY.toFixed(3)}%">${padProtSvg_()}</div>`;
}
/* EVERY COPY OF THIS PAD ON THE PAGE, with the protractor down or up as its state says, and the tile lit to match -- in place, no repaint */
function padProtSync_(k) {
  document.querySelectorAll('.qpad').forEach(pad => {
    if ((pad.getAttribute('data-k') || '') !== k) return;
    const art = pad.querySelector('.qpad-art'), tile = pad.querySelector('.qpad-tool[data-tool="protractor"]');
    if (!art || !tile) return;
    const was = art.querySelector(':scope > .qpad-prot');
    if (was) was.remove();
    const on = padProtOn_(k);
    if (on) art.insertAdjacentHTML('beforeend', padProtHtml_(k));
    tile.classList.toggle('on', on);
    tile.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
/* ITS OWN DRAG, AHEAD OF THE PEN'S (capture), so a finger on the protractor moves it and never draws or swipes */
let PROT_GO = null;
document.addEventListener('pointerdown', e => {
  const el = e.target && e.target.closest && e.target.closest('.qpad-prot');
  if (!el) return;
  const art = el.parentNode, k = el.getAttribute('data-prot-k') || '';
  if (!art || !art.getBoundingClientRect) return;
  e.preventDefault(); e.stopPropagation();
  const st = padProtOf_(k), r = art.getBoundingClientRect();
  PROT_GO = { id: e.pointerId, el, k, r, turn: !!(e.target.closest('[data-prot="turn"]')), x0: e.clientX, y0: e.clientY, sx: st.x, sy: st.y };
  try { el.setPointerCapture(e.pointerId); } catch (err) {}
}, true);
document.addEventListener('pointermove', e => {
  const g = PROT_GO;
  if (!g || e.pointerId !== g.id) return;
  e.preventDefault(); e.stopPropagation();
  const st = padProtOf_(g.k);
  if (g.turn) {
    const cx = g.r.left + st.x / 100 * g.r.width, cy = g.r.top + st.y / 100 * g.r.height;
    let a = Math.round(Math.atan2(e.clientX - cx, cy - e.clientY) * 180 / Math.PI);
    [-180, -90, 0, 90, 180].forEach(s => { if (Math.abs(a - s) <= PROT_SNAP_DEG) a = s; });
    st.a = a;
  } else {
    st.x = Math.max(0, Math.min(100, g.sx + (e.clientX - g.x0) / g.r.width * 100));
    st.y = Math.max(0, Math.min(100, g.sy + (e.clientY - g.y0) / g.r.height * 100));
  }
  g.el.style.left = st.x.toFixed(2) + '%';
  g.el.style.top = st.y.toFixed(2) + '%';
  g.el.style.transform = `translate(-${PROT_PX}%,-${PROT_PY.toFixed(3)}%) rotate(${st.a}deg)`;
  g.el.setAttribute('aria-label', 'Protractor, turned ' + Math.round(st.a) + ' degrees');
}, true);
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, e => {
  if (!PROT_GO || e.pointerId !== PROT_GO.id) return;
  e.stopPropagation();
  PROT_GO = null;
}, true));

on('pad-undo', (el) => {
  const pad = el.closest('.qpad'); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  /* NOT UNDER A RESTING HAND -- `padRested_`. */
  if (padRested_(k)) return;
  const all = padRead_(k);
  /* AN EMPTY PAD THAT CLEAR EMPTIED: the last thing done was the Clear, so it is what Undo undoes. */
  if (!all.length && PAD_CLEARED.has(k)) {
    const back = PAD_CLEARED.get(k);
    const mark = PAD_CLEARED_MARK.get(k) || null;
    PAD_CLEARED.delete(k);
    PAD_CLEARED_MARK.delete(k);
    /* WITH WHOSE THEY WERE, not judged as strokes drawn now over an empty pad. */
    const put = () => ansStore_(k, JSON.stringify(back));
    if (typeof ansPutBack_ === 'function') ansPutBack_(k, mark, put); else put();
    padRepaint_(pad, back);
    padCopies_(k, pad, back);
    toast('Put back');
    return;
  }
  if (!all.length) { toast('Nothing to undo'); return; }
  all.pop();
  ansStore_(k, JSON.stringify(all));
  padRepaint_(pad, all);
  padCopies_(k, pad, all);
});

/* ---------- CLEAR CAN BE UNDONE § */
on('pad-clear', (el) => {
  const pad = el.closest('.qpad'); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  if (padRested_(k)) return;
  const had = padRead_(k);
  if (!had.length) return;
  PAD_CLEARED.set(k, had);
  /* READ BEFORE THE CLEAR BELOW TAKES THE MARK WITH THE STROKES. */
  PAD_CLEARED_MARK.set(k, typeof ansMarkable_ === 'function' && ansMarkable_(k) && typeof ansGoneOf_ === 'function' ? ansGoneOf_(k) : null);
  /* CLEARED IS A VALUE TOO — sent as nothing, so the drawing goes from the other device as well. */
  ansStore_(k, null);
  padRepaint_(pad, []);
  padCopies_(k, pad, []);
  toast('Cleared. Undo puts it back.');
});

/* REPAINTED FROM THE STORED MARKS RATHER THAN BY REMOVING A NODE, so that what is on the screen is always exactly what would come back on a reload. § */
function padRepaint_(pad, all) {
  const g = pad.querySelector('.qpad-g');
  if (!g) return;
  const k = padAspectOf_(pad);
  const want = (all || []).map(st => padPath_(st, k));
  const have = g.children;
  let i = 0;
  while (i < want.length && i < have.length) {
    const p = have[i];
    if (String(p.tagName).toLowerCase() !== 'path' || p.attributes.length !== 2
        || p.getAttribute('vector-effect') !== 'non-scaling-stroke' || p.getAttribute('d') !== want[i]) break;
    i++;
  }
  if (!i) { g.innerHTML = want.map(d => `<path vector-effect="non-scaling-stroke" d="${d}"/>`).join(''); return; }
  while (have.length > i) g.removeChild(have[have.length - 1]);
  for (; i < want.length; i++) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    p.setAttribute('d', want[i]);
    g.appendChild(p);
  }
}

/* THE WHITEBOARD IS THIS PEN, ON NOTHING. § */
const WB_ITEM = { key: 'whiteboard', prefix: 'board' };
const PAD_HERE_ONLY = 'Kept on this device only.';
/* EMPTY, BECAUSE THE BOX IS THE BOARD. § */
const WB_SURF = '<svg class="wb-surf" viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true"></svg>';

/* THE BOARD'S KEYS -- `board:` signed out, `board:u:<who>:` signed in -- which the pen asks about in
   two places: `padEnd_` thins the board's strokes and `padSave_` holds it to its ceiling. */
const padIsBoard_ = k => String(k || '').indexOf(WB_ITEM.prefix + ':') === 0;

/* ---------- HOW BIG A BOARD MAY GET, AND WHAT A STROKE ON IT COSTS § */
const PAD_BOARD_MAX = 100000;

/* ---------- AND NO COLUMN IS REDRAWN UNDER A STROKE § */
function padHold_(id) {
  try {
    if (!PAD_ST || !PAD_GO || !PAD_GO.ink || !PAD_GO.ink.isConnected) return false;
    const host = document.getElementById('s-' + id);
    return !!host && host.contains(PAD_GO.ink);
  } catch (e) { return false; }
}

/* ---------- A CHANGE OF PERSON PUTS THE PEN DOWN AND DRAWS EVERY BOARD AGAIN § */
function padWhoChanged_() {
  [].slice.call(document.querySelectorAll('.qpad')).forEach(p => padArm_(p, false));
  PAD_ON = '';
  /* THE STROKE, ITS PREVIEW AND EVERY CONTACT, PUT DOWN AND NOTHING STORED -- `padDrop_`. */
  padDrop_();
  PAD_CLEARED.clear();
  PAD_CLEARED_MARK.clear();
  wbPaint_();
}

/* EVERY COPY, BY CLASS -- `tmtPaint_`'s reason: § */
/* AND EACH SLOT IT DRAWS INTO IS SAID TO BE DRAWN FOR WHOEVER IS SIGNED IN NOW (`slot.WHO`). § */
function wbPaint_() {
  const html = `<div class="wb">${padWrap_(WB_ITEM, WB_SURF, true)}</div>`;
  const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
  document.querySelectorAll('.wb-box').forEach(el => {
    if (PAD_ST && PAD_GO && el.contains(PAD_GO.ink)) return;
    el.innerHTML = html;
    const slot = el.closest('.widget-slot');
    /* `OWN` AS WELL: the board is drawn from this person's strokes on this device and from no fact, so a
       landing or a repaint for the same person leaves it drawn (`widgetsReveil_`). */
    if (slot) { slot.WHO = who; slot.OWN = who; }
  });
}
function initWhiteboard() { wbPaint_(); }

/* "USE YOUR GRAPH" SHOWS YOUR GRAPH. § */
const usesPart_ = p => String(p == null ? '' : p).toLowerCase().replace(/[^a-z0-9]/g, '');
const usesAt_ = (x, part) => paperIdOf_(x.row || x) + '|' + String(x.qNumber == null ? '' : x.qNumber) + '|' + usesPart_(part);
/* BUILT ONCE PER LIST OF ITEMS, which is once per payload and person (`stuffItemsAll_`'s own memo). */
let USES_MEMO = { from: null, at: null };
function usesOf_(x) {
  if (!x || x.kind !== 'question' || !usesPart_(x.uses)) return null;
  let all = [];
  try { all = stuffItemsAll_() || []; } catch (e) { return null; }
  if (USES_MEMO.from !== all) {
    const at = new Map();
    all.forEach(y => { if (y && y.kind === 'question') at.set(usesAt_(y, y.qPart), y); });
    USES_MEMO = { from: all, at: at };
  }
  const y = USES_MEMO.at.get(usesAt_(x, x.uses));
  return y && y.key !== x.key ? y : null;
}
/* A PART'S OWN MARKS, FOR WHOEVER IS SIGNED IN -- opening them anywhere is opening them (`padAdopt_`). */
function usesMine_(y) {
  const k = padKey_(y);
  padAdopt_(k, 'pad:' + padItemKey_(y));
  return padRead_(k);
}
/* THE PARTS `x` USES WHOSE MARKS ARE ON THE PICTURE `svg`, earliest first, stopping where the picture changes. § */
function usesChain_(x, svg) {
  const out = [];
  const seen = new Set([x && x.key]);
  let y = usesOf_(x);
  while (y && !seen.has(y.key)) {
    seen.add(y.key);
    const p = padSource_(y);
    if (!p || p.svg !== svg) break;
    out.unshift(y);
    y = usesOf_(y);
  }
  return out;
}
/* EVERY MARK THOSE PARTS MADE, earliest part first. */
const usesUnder_ = (x, svg) => [].concat(...usesChain_(x, svg).map(usesMine_));
/* ---------- ONE FIGURE, SEVERAL PARTS DRAWING ON IT (381): every other part's ink is under this part's, faint and out of reach of its Undo, Clear and Check: the paper prints one figure, and each part is marked on its own ink */
function padUnderParts_(x, svg) {
  const out = usesChain_(x, svg);
  if (!x || x.prefix) return out;
  let sib = [];
  try { sib = (questionParts_()[qId_(x)]) || []; } catch (e) { sib = []; }
  sib.forEach(y => {
    if (!y || y === x || y.key === x.key || out.indexOf(y) >= 0) return;
    const p = padSource_(y);
    if (p && p.from !== 'surface' && p.svg === svg) out.push(y);
  });
  return out;
}
/* THE EARLIER MARKS AS AN INK GROUP, beside the pad's own and never inside it: `padRepaint_` rewrites
   `.qpad-g` from this part's storage, so nothing it does can reach these. */
const usesInk_ = (all, k) => `<g class="qpad-was" vector-effect="non-scaling-stroke">${all.map(st =>
  `<path vector-effect="non-scaling-stroke" d="${padPath_(st, k)}"/>`).join('')}</g>`;
/* A PICTURE WITH MARKS ON IT AND NO PEN: § */
const usesSeen_ = (svg, all) => `<div class="qseen">
    <div class="qpad-art">${svg}
      <svg class="qpad-ink" viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true">${usesInk_(all, padAspect_(null, svg))}</svg>
    </div>
  </div>`;
/* A PART THAT ONLY LOOKS AT THE PICTURE AN EARLIER PART DREW ON: its own copy, with those marks. */
function usesFig_(x) {
  const was = x && x.diagram ? usesUnder_(x, x.diagram) : [];
  return was.length ? usesSeen_(x.diagram, was) : '';
}

/* DOES THIS PART'S CARD DRAW THE EARLIER PICTURE IN FRONT OF ITS WORDS -- see the note above. § */
function usesPage_(x, prev) {
  const y = usesOf_(x);
  const p = y && padSource_(y);
  if (!p) return false;
  if (x.diagram && x.diagram === p.svg) return false;
  /* NOR WHEN THIS PART DRAWS ON THAT SAME PICTURE (its stem's): the marks are under its own pen, and a second copy is what 381 ended */
  const own = padSource_(x);
  return !(own && own.from !== 'surface' && own.svg === p.svg);
}
/* THE PAGE: the earlier part's picture with the marks on it, and nothing said under it -- the lines naming whose marks they were went with every credit on 18 Oct § */
/* `questionUsesCard_` WAS HERE, that picture as a page in front of the part. It is drawn inside the part's
   own card now, in front of its words, with no header or caption (`usesBlock_`, `figHtml_`; 356). */

/* A SURFACE TO ANSWER ON, FOR EVERY QUESTION ANSWERED ON ONE. § */
function padSurface_(x) {
  const KINDS = ['grid', 'coord', 'blank', 'text'];
  if (!x) return '';
  const said = String(x.surface || (x.row && x.row.surface) || '').trim().toLowerCase();
  if (KINDS.indexOf(said) !== -1) return said;
  if (!padWanted_(x)) return '';
  const f = String(x.figure || (x.row && x.row.figure) || '').trim().toLowerCase();
  if (/coordinate/.test(f)) return 'coord';
  if (/grid/.test(f) && !/isometric/.test(f)) return 'grid';
  return 'blank';
}
/* WHAT EACH IS CALLED, where a paper figure is called "Figure": § */
const SURFACE_NAME = { grid: 'Squared grid', coord: 'Axes', blank: 'Space to draw' };

/* ---------- THE SURFACE ITSELF § */
function surfaceSvg_(kind) {
  const S = 20, A = 10, B = 330;
  const out = [];
  if (kind === 'grid' || kind === 'coord') {
    for (let v = A; v <= B; v += S) {
      out.push(`<line class="grid" x1="${v}" y1="${A}" x2="${v}" y2="${B}"/>`,
               `<line class="grid" x1="${A}" y1="${v}" x2="${B}" y2="${v}"/>`);
    }
  }
  if (kind === 'coord') {
    out.push(`<line class="axis" x1="${A}" y1="170" x2="${B}" y2="170"/>`,
             `<line class="axis" x1="170" y1="${A}" x2="170" y2="${B}"/>`,
             `<text class="ax" x="${B - 2}" y="164" text-anchor="end">x</text>`,
             `<text class="ax" x="176" y="${A + 8}">y</text>`);
    for (let n = -8; n <= 8; n += 2) {
      if (!n) continue;
      const at = 170 + n * S;
      out.push(`<text class="ax" x="${at}" y="182" text-anchor="middle">${n < 0 ? '&minus;' + (-n) : n}</text>`,
               `<text class="ax" x="164" y="${340 - at + 3}" text-anchor="end">${n < 0 ? '&minus;' + (-n) : n}</text>`);
    }
    out.push('<text class="ax" x="164" y="182" text-anchor="end">0</text>');
  }
  if (kind === 'blank') {
    out.push(`<rect class="axis" x="${A}" y="${A}" width="${B - A}" height="${B - A}" rx="8" fill="none" stroke-dasharray="6 6"/>`);
  }
  return `<svg class="qsurf is-${kind}" viewBox="0 0 340 340" role="img" aria-label="${SURFACE_NAME[kind] || 'Space to draw'}">${out.join('')}</svg>`;
}

/* A QUESTION ANSWERED BY DRAWING IS DRAWN, ON ITS CARD, AND THERE IS NOTHING TO SWITCH. § */
const surfaceOf_ = x => { const p = padSource_(x); return p && p.from === 'surface' ? p : null; };

/* ---------- THE ANSWER AREA AT THE CARD'S FOOT § */
function ansArea_(x) {
  const p = x && x.key ? padSource_(x) : null;
  if (!p) return ansBox_(x);
  const box = answerKinds_(x).value ? ansBox_(x) : '';
  /* A FIGURE AMONG THE WORDS IS THE PEN (`figHtml_`); ITS CHECK IS HERE, at the foot, as a typed part's is (381) */
  /* THE RULER AND PROTRACTOR ON EVERY FIGURE (502): a drawn answer with no typed box gets them in a row of their own */
  const meas = box ? '' : measTiles_(x);
  if (p.from !== 'surface') return box + (meas ? `<div class="tile-row qp-meas-row">${meas}</div>` : '') + padSendRow_(x, padRead_(padKey_(x)));
  return `<div class="qp-area" data-q="${esc(x.key)}">${padWrap_(x, p.svg, true)}</div>${box}`;
}

/* ---------- A CARD WITH A FIGURE IN IT GIVES WAY BEFORE IT IS DRAWN SMALLER, AND NEVER WHOLE § */
const FIG_FLOOR = 180;
const FIG_KEEP = '.qpad, .qseen, figure, .qp-area, .qp-compose, .qp-mark, .tile-row, .qp-choices';
const cardFigs_ = card => (card ? [].slice.call(card.querySelectorAll('.qpad-art > svg:first-child, .qsheet figure > svg')) : []);
function cardFigFit_(pane) {
  try {
    pane.querySelectorAll('[data-face-zoom]').forEach(e => { e.style.zoom = ''; e.removeAttribute('data-face-zoom'); });
    pane.querySelectorAll('[data-fig-fit]').forEach(e => { e.style.width = ''; e.removeAttribute('data-fig-fit'); });
    const card = pane.querySelector('.qcard');
    const figs = cardFigs_(card);
    if (!figs.length) return;
    const over = () => pane.scrollHeight - pane.clientHeight;
    let by = over();
    if (!(by > 2)) return;
    /* THE WORDS: every element of the card that holds no picture and is none of what keeps its size, found by walking down only through what holds a picture -- so a § */
    const words = [];
    const walk = el => [].forEach.call(el.children, e => {
      if (e.matches(FIG_KEEP)) return;
      if (figs.some(f => e.contains(f)) || e.querySelector(FIG_KEEP)) walk(e); else words.push(e);
    });
    walk(card);
    const hw = words.reduce((n, e) => n + e.getBoundingClientRect().height, 0);
    if (hw > 0) {
      const z = Math.max(PANE_ZOOM_MIN, Math.floor((hw - by - 4) / hw * 1000) / 1000);
      if (z < 1) words.forEach(e => { e.style.zoom = String(z); e.setAttribute('data-face-zoom', ''); });
      by = over();
    }
    if (!(by > 2)) return;
    /* THE TALLEST PICTURE NARROWS, which takes the most height for the least width. */
    const svg = figs.slice().sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
    const box = svg.getBoundingClientRect();
    const w = box.width, h = box.height;
    if (!(w > 0 && h > 0)) return;
    const fit = Math.max(FIG_FLOOR, Math.floor(w * (h - by - 4) / h));
    /* A MARKED PICTURE (`.qseen`) HAS ITS WIDTH ON ITS BOX, which the ink is stretched to: narrowed there,
       or the marks would stay where the wider picture was. */
    const el = svg.parentElement && svg.parentElement.matches('.qseen .qpad-art') ? svg.parentElement : svg;
    if (fit < w) { el.style.width = fit + 'px'; el.setAttribute('data-fig-fit', ''); }
  } catch (e) { /* the stylesheet's size stands, and `paneReach_` scrolls what is left */ }
}

/* ---------- AND A PASSAGE YOU MARK BY TAPPING ITS WORDS § */
const circKey_ = x => padKey_(x) + ':words';
const CIRC_HELD = new Map();
function circRead_(k) {
  try {
    /* THE VISIT'S COPY FIRST when the store refused it — `ansRead_`'s reason (317). */
    const held = typeof keepHeld_ === 'function' ? keepHeld_(k) : undefined;
    const raw = held !== undefined ? (held === null ? '[]' : held) : localStorage.getItem(k);
    if (raw !== null) {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v.map(String) : [];
    }
  } catch (e) {}
  return (CIRC_HELD.get(k) || []).slice();
}
/* EVERY WORD OF A BLOCK OF MARKUP, WRAPPED, AND NOTHING ELSE TOUCHED. § */
function circWords_(html, block, on) {
  let n = 0, skip = 0;
  const WORD = /(&(?:rsquo|#8217|apos);)|(&[#\w]+;)|([\p{L}\p{N}]+(?:(?:['’]|&rsquo;|&#8217;|&apos;)[\p{L}\p{N}]+)*)/gu;
  return String(html || '').replace(/(<[^>]*>)|([^<]+)/g, (m, tag, text) => {
    if (tag) {
      if (/^<(svg|script|style)\b/i.test(tag)) skip++;
      else if (/^<\/(svg|script|style)\b/i.test(tag)) skip = Math.max(0, skip - 1);
      return tag;
    }
    if (skip) return text;
    /* NOT TILES, for the reason the multiple-choice options are not (`choiceBox_`): a ringed word is
       the answer being given, and it has to stay where the sentence put it. */
    return text.replace(WORD, (w, apos, ent, word) => {
      if (!word) return w;
      const k = block + '.' + (n++);
      const lit = on && on.indexOf(k) !== -1;
      return `<span class="qw${lit ? ' is-circled' : ''}" data-do="qw-tap" data-w="${k}" role="button" aria-pressed="${lit}">${word}</span>`;
    });
  });
}

on('qw-tap', (el) => {
  const host = el.closest('[data-circ]');
  if (!host) return;
  const k = host.getAttribute('data-circ') || '';
  const w = el.getAttribute('data-w') || '';
  if (!k || !w) return;
  const all = circRead_(k);
  const i = all.indexOf(w);
  if (i >= 0) all.splice(i, 1); else all.push(w);
  CIRC_HELD.set(k, all.slice());
  ansStore_(k, all.length ? JSON.stringify(all) : null);
  /* EVERY COPY OF THE WORD, on every page built, by key -- the card and a page of the same question peeking under it are two copies of one passage, and a ring on § */
  const lit = i < 0;
  document.querySelectorAll('[data-circ]').forEach(h => {
    if (h.getAttribute('data-circ') !== k) return;
    h.querySelectorAll('.qw').forEach(s => {
      if (s.getAttribute('data-w') !== w) return;
      s.classList.toggle('is-circled', lit);
      s.setAttribute('aria-pressed', lit ? 'true' : 'false');
    });
  });
});

/* ---------- `FIG_BY` AND `figCredit_` WERE HERE: a line under every picture this site redrew ("drawn for § */
/* ---------- A PICTURE THE QUESTION CAME WITH § */
const pics_ = list => (list || []).map(src =>
  `<figure class="qpic"><img src="${esc(src)}" alt="Picture printed with this question"
     loading="lazy" decoding="async"></figure>`).join('');


/* EVERY TAG ON A CARD IS AN ANSWER YOU CAN PICK IN THE FINDER: § */
const TAG_NAME = /[A-Za-z]/;
/* A TAG THAT IS ONLY TAGS ALREADY ON THE ROW, SIDE BY SIDE — `5-a-day Foundation` after `5-a-day` and `Foundation` — says nothing new. */
function tagMadeOf_(text, said) {
  const t = String(text).toLowerCase(), parts = said.map(w => String(w).toLowerCase()).filter(Boolean);
  const from = i => i === t.length || parts.some(p => t.startsWith(p, i) && (i + p.length === t.length || (t[i + p.length] === ' ' && from(i + p.length + 1))));
  return parts.length > 1 && t.indexOf(' ') > 0 && from(0);
}
function tagRow_(x, page) {
  const out = [], words = new Set(), ids = new Set(), said = [];
  if (!x) return '';
  /* EVERY FACET IS A TAG (396), said as its button would say it (`cardList_`); a word already on the row is not said twice. */
  facetList().forEach(facet => {
    let vals;
    try { vals = asList_(facet.tagOf ? facet.tagOf(x, page) : facetOwn_(facet, x)); } catch (e) { vals = []; }
    vals.forEach(v => {
      const raw = String(v == null ? '' : v).trim();
      if (!raw) return;
      let text = raw;
      try {
        const say = facetSay_(facet, raw);
        text = String((nameForms_(say).length > 1 ? facetShort_(facet, raw, cardList_(facet, x)) : say) || raw).trim();
      } catch (e) { text = raw; }
      const w = norm(text);
      if ((TAG_NAME.test(text) && (words.has(w) || tagMadeOf_(text, said))) || (TAG_NAME.test(raw) && ids.has(raw))) return;
      words.add(w); ids.add(raw); said.push(text);
      out.push(`<span class="qtag"${tagAttr_(facet.field)} data-f="${esc(facet.field)}">${esc(text)}</span>`);
    });
  });
  return `<div class="qtags qcard-tags">${out.join('')}</div>`;
}


/* ---------- A PART'S READING PAGES, FOR THE PAGE TAGS § */
const qPagesOf_ = x => (x && x.kind === 'question' ? partChunks_(x).length : 0);
function qPageAt_(x, page) {
  if (!x || x.kind !== 'question') return 0;
  if (page == null || page === '') return qPagesOf_(x);
  const m = /^pre(\d+)$/.exec(String(page));
  return m ? Number(m[1]) + 1 : 0;
}


/* A QUESTION'S BODY IS NEVER BLANK (432): no words, figure or picture in it says why — the library's reason, or that it is missing. */
function qWordsOr_(x, html) {
  if (/<(img|svg|figure|canvas|input|table)\b/i.test(html) || String(html).replace(/<[^>]*>|&nbsp;|\s/g, '')) return html;
  if (libSlim_(x)) return `<div class="lib-say">${libSay_(x)}</div>`;
  return '<p class="empty">This question’s words are missing — flag it and we will put them back.</p>';
}
function questionCard_(x) {
  return `<div class="qcard${typeof helpCls_ === 'function' ? helpCls_() : ''}">
    ${/* THE ROW, AND NOTHING ELSE ABOVE THE QUESTION: every fact is a tag (`tagRow_`), and every tag
          is an answer the finder offers. THE DAY YOU LAST DID IT is in the tile row, beside the star --
          see `questionTiles_`. */''}
    ${tagRow_(x)}
    <div class="qsheet">
      ${/* NO STEM HERE. The paragraph a part hangs from is its own page in front of the first part that shares it -- `questionStemCard_`, in `pageParts_`'s order -- so § */
            ''}
      ${/* THE LAST OF THE WORDS, which is all of them unless the part is too long for one page -- then the pages in front (`questionPreCard_`) hold the rest and this § */
            ''}
      ${qWordsOr_(x, cellsHere_(x, chunkHtml_(partChunks_(x).slice(-1)[0], circOf_(x), x)))}
    </div>
    ${/* YOUR BOX, AND THE MARK SCHEME IS NOT UNDER IT ANY MORE. § */
          ''}
    ${ansArea_(x)}
    ${/* HELP (455): a hand up for the tutor, last in the card so it never moves the answer's controls. */
          typeof helpRow_ === 'function' ? helpRow_(x) : ''}
  </div>`;
}

/* ---------- THE STEM, ITS OWN PAGE IN FRONT OF ITS PARTS § */
const stemId_ = p => (p && (p.id || (p.row && p.row.row_id) || p.html || p.diagram)) || '';
const stemHasFig_ = p => !!(p && (p.diagram || figImgs_(p.images).length));
const qNum_ = x => 'Q' + ((x.qNumber != null && x.qNumber !== '') ? x.qNumber
  : String(x.name || '').replace(/^Q(\d+).*$/, '$1'));
function questionStemCard_(x, i, j) {
  const p = (x.stems || [])[i];
  if (!p) return '';
  const chunks = stemChunks_(p);
  j = Math.min(+j || 0, chunks.length - 1);
  const last = j === chunks.length - 1;
  /* THE STEM'S WORDS, A RUN AT A TIME, with its figure among them where `stemPlan_` stands it -- and no
     caption under it, and no line pointing at a page it is not on (356). */
  const html = [];
  let run = [];
  const flush = () => { if (run.length) html.push(typeset_(run.join(''))); run = []; };
  chunks[j].forEach(b => {
    if (b.k === 'pb') { run.push(b.h); return; }
    flush();
    html.push((p.diagram ? `<figure>${p.diagram}</figure>` : '') + pics_(figImgs_(p.images)));
  });
  flush();
  return `<div class="qcard qstem" data-of="${esc(stemId_(p))}">
    ${tagRow_(x, 'stem' + i)}
    <div class="qsheet">
      <div class="qsheet-stem${p.placeholder ? ' is-standin' : ''}">${
        p.lines && !j ? `<p class="qsheet-lines">${esc(p.lines)}</p>` : ''}${html.join('')}</div>${
      !last ? '<p class="qsheet-more">Continued on the next page &rarr;</p>' : ''}
    </div>
    ${qPageTools_(x)}
  </div>`;
}

/* ---------- A LONG PART'S FIRST PAGES § */
function questionPreCard_(x, j) {
  const chunks = partChunks_(x);
  if (j >= chunks.length - 1) return '';
  return `<div class="qcard qpre" data-of="${esc((x.row && x.row.row_id) || x.key || '')}">
    ${tagRow_(x, 'pre' + j)}
    <div class="qsheet">
      ${chunkHtml_(chunks[j], circOf_(x), x)}
      <p class="qsheet-more">Continued on the next page &rarr;</p>
    </div>
    ${qPageTools_(x)}
  </div>`;
}

/* A PAGE IS SMALLER THAN A PHONE, SO LONG WORDS ARE CUT BETWEEN PARAGRAPHS. § */
const CHUNK_PAGE = 640;
const PART_LAST = 300;
const CHUNK_MIN = 160;          // a first page lighter than this joins the next -- see `packBlocks_`
const CHUNK_BLOCK = /^(p|div|table|ul|ol|h[1-6]|blockquote|figure|pre|section|dl)$/i;
const CHUNK_VOID = /^(br|img|hr|input|meta|link|col|wbr|source|area|base|param|track|embed)$/i;
function htmlBlocks_(html) {
  const s = String(html || '');
  const out = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  let m, depth = 0, from = 0;
  while ((m = re.exec(s))) {
    if (CHUNK_VOID.test(m[2]) || m[3]) continue;
    if (!m[1]) { depth++; continue; }
    depth = Math.max(0, depth - 1);
    if (!depth && CHUNK_BLOCK.test(m[2])) { out.push(s.slice(from, re.lastIndex)); from = re.lastIndex; }
  }
  if (s.slice(from).trim()) out.push(s.slice(from));
  return out;
}
const chunkWeight_ = h => String(h).replace(/<[^>]*>/g, '').replace(/&[a-z0-9#]+;/gi, 'x')
  .replace(/\s+/g, ' ').trim().length
  + 45 * (String(h).match(/<(p|li|tr|br|h[1-6]|div)\b/gi) || []).length
  + (/<svg|<img/i.test(h) ? 400 : 0);
/* FROM THE END, the last page first, so the page with the room taken (`last`) is the one that holds
   the end of the text. Returns lists of blocks, in reading order, never an empty list. */
function packBlocks_(blocks, page, last) {
  /* ---------- A FIGURE IS NEVER A PAGE BY ITSELF, AND A PEN'S FIGURE IS ALWAYS ON THE CARD (356) § */
  const isFig = b => b.k === 'fig' || b.k === 'sfig' || b.k === 'use' || b.k === 'nofig';
  const units = [];
  let open = null;
  blocks.forEach(b => {
    if (open) { open.push(b); if (!isFig(b)) open = null; return; }
    const u = [b];
    units.push(u);
    if (isFig(b)) open = u;
  });
  if (open && open.every(isFig) && units.length > 1) units[units.length - 2].push(...units.pop());
  const pinAt = units.findIndex(u => u.some(b => b.pin));
  const out = [];
  let cur = [], w = 0, cap = last;
  for (let i = units.length - 1; i >= 0; i--) {
    const uw = units[i].reduce((n, b) => n + (b.w != null ? b.w : chunkWeight_(b.h)), 0);
    if (cur.length && w + uw > cap && !(pinAt >= 0 && i >= pinAt)) { out.unshift(cur); cur = []; w = 0; cap = page; }
    cur.unshift(...units[i]); w += uw;
  }
  /* NO PAGE FOR ONE SENTENCE. § */
  if (cur.length && out.length && w < CHUNK_MIN) { out[0] = cur.concat(out[0]); return out; }
  if (cur.length || !out.length) out.unshift(cur);
  return out;
}
/* ---------- WHAT A FIGURE WEIGHS: ITS HEIGHT AT THE NARROWEST PANE'S WIDTH § */
const FIG_PANE_W = 288;
const FIG_PX_WEIGHT = 1.8;
function figWeight_(svg) {
  const m = /viewBox\s*=\s*["']\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(String(svg || ''));
  const w = m ? +m[1] : 1, h = m ? +m[2] : 1;
  const px = w > 0 && h > 0 ? FIG_PANE_W * h / w : FIG_PANE_W;
  return Math.round(Math.min(px, 568) * FIG_PX_WEIGHT);
}
const picsWeight_ = imgs => 400 * (imgs || []).length;
/* ---------- WHERE THE PAPER PRINTS THE FIGURE: `<!--fig-->` § */
const FIG_MARK = /<!--\s*fig\s*-->/gi;
function figBlocks_(html) {
  const out = [];
  let at = -1;
  htmlBlocks_(html).forEach(b => {
    const hit = b.search(/<!--\s*fig\s*-->/i);
    const clean = b.replace(FIG_MARK, '');
    const keep = !!clean.trim();
    if (hit >= 0 && at < 0 && !b.slice(0, hit).trim()) at = out.length;
    if (keep) out.push(clean);
    if (hit >= 0 && at < 0) at = out.length;
  });
  return { blocks: out, at: at };
}

/* MEMOISED ON THE OBJECT, because `pageParts_` asks for every result on every new filter and the
   library is seven thousand rows; a row's words change only when the Ledger's land (`LIB.gen`). */
const CHUNK_MEMO = new WeakMap();
/* A PLAN HOLDS FOR ONE LIBRARY GENERATION (432): planned while the words were in the Ledger, it was a page with none in it. */
const chunkGen_ = () => (typeof LIB !== 'undefined' && LIB ? LIB.gen : 0);
const chunkHad_ = o => { const had = CHUNK_MEMO.get(o); return had && had.gen === chunkGen_() ? had : null; };
/* AN EMPTY STEM IS NO PAGE AT ALL (`packBlocks_` alone would hand back one empty page, which is right for a
   card that must exist and wrong for a stem with nothing left on it). */
const packSeg_ = (blocks, page, last) => (blocks.length ? packBlocks_(blocks, page, last) : []);

/* ---------- A STEM'S PAGES, WITH ITS FIGURE AMONG ITS WORDS § */
function stemPlan_(p) {
  if (!p || typeof p !== 'object') return { chunks: [] };
  const had = chunkHad_(p);
  if (had) return had;
  const fb = figBlocks_(p.html);
  const pb = fb.blocks.map(h => ({ k: 'pb', h: h }));
  /* THE FIGURE STANDS AT ITS MARKER, ELSE AFTER THE WORDS -- digest.gs's rule for a stem, so the Sunday email and the page agree -- AND NOT AT ALL WHEN A PART § */
  const fig = stemHasFig_(p) && !stemPenned_(p)
    ? [{ k: 'fig', h: '', w: (p.diagram ? figWeight_(p.diagram) : 0) + picsWeight_(figImgs_(p.images)) }] : [];
  const at = fb.at >= 0 ? fb.at : pb.length;
  const plan = { chunks: packSeg_(pb.slice(0, at).concat(fig, pb.slice(at)), CHUNK_PAGE, CHUNK_PAGE), gen: chunkGen_() };
  CHUNK_MEMO.set(p, plan);
  return plan;
}
/* ---------- A STEM WHOSE FIGURE A PART DRAWS ON § */
let STEM_PEN = { from: null, svgs: null };
function stemPenned_(p) {
  if (!p || !p.diagram) return false;
  let all = [];
  try { all = stuffItemsAll_() || []; } catch (e) { return false; }
  if (STEM_PEN.from !== all) {
    const svgs = new Set();
    all.forEach(y => {
      if (!y || y.kind !== 'question' || !(y.stems || []).length) return;
      const src = padSource_(y);
      if (src && src.from && typeof src.from === 'object') svgs.add(src.svg);
    });
    STEM_PEN = { from: all, svgs: svgs };
  }
  return STEM_PEN.svgs.has(p.diagram);
}
/* ---------- THE STEM WHOSE FIGURE THIS PART DRAWS ON, CARRIED ONTO ITS CARD (381): the first part to share it, its innermost stem, words and one figure only */
function stemCarried_(x) {
  const src = x && x.kind === 'question' ? padSource_(x) : null;
  const p = src && src.from && typeof src.from === 'object' ? src.from : null;
  if (!p || p.placeholder || p.lines || figImgs_(p.images).length) return null;
  const st = x.stems || [];
  if (st[st.length - 1] !== p) return null;
  let sib = [];
  try { sib = (questionParts_()[qId_(x)]) || []; } catch (e) { return null; }
  const id = stemId_(p);
  const first = sib.find(y => (y.stems || []).some(q => stemId_(q) === id));
  return first === x || (first && first.key === x.key) ? p : null;
}
/* THE QUESTION'S OWN OPENING ON EVERY PART'S CARD (500): a short stem with a figure is read with
   each part, its figure too, so 16(a) and 16(b) both have the graph they ask about. Outer stems stay pages. */
function stemOnCard_(x) {
  const pen = stemCarried_(x);
  if (pen) return pen;
  const st = (x && x.kind === 'question' && x.stems) || [];
  const p = st[st.length - 1];
  if (!p || !p.diagram || p.placeholder || p.lines || figImgs_(p.images).length || stemPenned_(p)) return null;
  if (!(p.q !== undefined && p.q !== null && p.q !== '') && !(p.row && p.row.question)) return null;
  const w = figBlocks_(p.html).blocks.reduce((n, h) => n + chunkWeight_(h), 0) + (p.diagram ? figWeight_(p.diagram) : 0);
  return w <= CHUNK_PAGE ? p : null;
}
function stemChunks_(p) {
  const c = stemPlan_(p).chunks;
  return c.length ? c : [[]];
}

/* ---------- A PART'S PAGES, WITH ITS FIGURE AMONG ITS WORDS § */
function partPlan_(x) {
  if (!x || typeof x !== 'object') return { chunks: [[]] };
  const had = chunkHad_(x);
  if (had) return had;
  const lead = x.lead ? [{ k: 'lead', h: String(x.lead).replace(FIG_MARK, '') }] : [];
  const fb = figBlocks_(x.html);
  /* `i` IS THE BLOCK'S PLACE IN THE ROW, carried onto every page it lands on, so a ringed word
     (`circWords_`) is named the same whichever page the cut put it on. */
  const pb = fb.blocks.map((h, i) => ({ k: 'pb', h: h, i: i }));
  const f = cardFigBlock_(x);
  let seq;
  if (!f) seq = lead.concat(pb);
  else if (fb.at >= 0 && f.k === 'fig') seq = lead.concat(pb.slice(0, fb.at), [f], pb.slice(fb.at));
  else if (lead.length) seq = lead.concat([f], pb);
  else seq = [f].concat(pb);
  /* THE STEM IN FRONT, ITS FIGURE UNDER THIS PART'S PEN AT THE STEM'S OWN PLACE FOR IT (its marker, else after its words) -- the paper's order on one card */
  const sc = f ? stemCarried_(x) : null, so = sc ? null : stemOnCard_(x);
  if (so) {
    const sb = figBlocks_(so.html), sw = sb.blocks.map(h => ({ k: 'sb', h: h }));
    const at = sb.at >= 0 ? sb.at : sw.length;
    const sf = so.diagram ? [{ k: 'sfig', h: '', w: figWeight_(so.diagram), from: so }] : [];
    seq = sw.slice(0, at).concat(sf, sw.slice(at), seq);
  }
  if (sc) {
    const sb = figBlocks_(sc.html), sw = sb.blocks.map(h => ({ k: 'sb', h: h }));
    const at = sb.at >= 0 ? sb.at : sw.length;
    seq = sw.slice(0, at).concat([f], sw.slice(at), lead, pb);
  }
  const u = usesBlock_(x);
  if (u) seq = [u].concat(seq);
  /* A PART THAT FITS A PAGE IS ONE CARD (500): "Work out x" on one page and "to 3 s.f." with the box on the next read as two questions. */
  const all = seq.reduce((n, b) => n + (b.w != null ? b.w : chunkWeight_(b.h)), 0);
  const plan = { chunks: all <= CHUNK_PAGE ? [seq] : packBlocks_(seq, CHUNK_PAGE, PART_LAST), gen: chunkGen_() };
  CHUNK_MEMO.set(x, plan);
  return plan;
}
/* ---------- THE FIGURE A PART'S CARD DRAWS, AS A BLOCK TO PLACE § */
function cardFigBlock_(x) {
  const p = padSource_(x);
  if (questionHasFig_(x)) {
    return { k: 'fig', h: '', pin: !!(p && p.from === 'part'),
             w: (x.diagram ? figWeight_(x.diagram) : 0) + picsWeight_(figImgs_(x.images)) };
  }
  if (p && p.from && typeof p.from === 'object') return { k: 'fig', h: '', pin: true, w: figWeight_(p.svg) };
  if (figGap_(x)) return { k: 'nofig', h: '', w: 45 };
  return null;
}
/* THE FIRST OF A RUN OF PARTS THAT NAME A FIGURE NOBODY HAS DRAWN, in the paper's order -- the run is one gap, and saying it under every part of it was a line § */
function figGap_(x) {
  if (!figMissing_(x)) return false;
  const k = qId_(x);
  const sib = k ? ((questionParts_()[k]) || []) : [];
  const at = sib.indexOf(x);
  return !(at > 0 && figMissing_(sib[at - 1]));
}
/* THE PICTURE AN EARLIER PART DREW ON, WITH THOSE MARKS, where this part reads it and has no copy of its own
   (`usesPage_`) -- weighed as the picture. */
function usesBlock_(x) {
  if (!usesPage_(x)) return null;
  const p = padSource_(usesOf_(x));
  return { k: 'use', h: '', w: figWeight_(p.svg) };
}/* THE LEAD IS ONE BLOCK, kept whole and in its own wrapper: it is the part's own sentence of setting,
   and it is short (`lead` is 436 cells, none past a page). */
function partChunks_(x) {
  return partPlan_(x).chunks;
}
/* A CHUNK IN THE WRAPPERS THE CARD ALWAYS USED -- the lead in `.qsheet-lead`, the part's words in `.qsheet-part > .qsheet-pb` -- so the typesetting rules and § */
/* `circ` IS A PASSAGE THAT IS ITS OWN ANSWER SURFACE ("Circle the three adjectives in the passage below") -- `circOf_` -- and then every word of the part is a § */
function chunkHtml_(chunk, circ, x) {
  const c = chunk || [];
  const lead = c.filter(b => b.k === 'lead').map(b => b.h).join('');
  /* WHAT STANDS IN FRONT OF THE LEAD -- the earlier part's marked picture, or a figure that opens the part
     where it has no lead -- and the rest, the part's words with any figure among them in its place. */
  let n = 0;
  while (n < c.length && c[n].k !== 'lead' && c[n].k !== 'pb') n++;
  const head = c.slice(0, n), rest = c.slice(n).filter(b => b.k !== 'lead');
  const words = rest.filter(b => b.k === 'pb');
  /* THE WORDS ARE TYPESET A RUN AT A TIME, between figures, so a picture is never handed to `typeset_` as
     text; with no figure in the chunk it is the one run it always was. */
  let pb = '', run = [];
  const flush = () => {
    if (!run.length) return;
    pb += circ ? run.map(b => circWords_(typeset_(b.h), b.i, circ.on)).join('') : typeset_(run.map(b => b.h).join(''));
    run = [];
  };
  rest.forEach(b => { if (b.k === 'pb') run.push(b); else { flush(); pb += figHtml_(x, b); } });
  flush();
  /* A CARRIED STEM'S WORDS (`sb`) ARE TYPESET A RUN AT A TIME in the stem's own wrapper, between its figures */
  let top = '', sbs = [];
  const sbFlush = () => { if (sbs.length) top += `<div class="qsheet-stem is-over">${typeset_(sbs.join(''))}</div>`; sbs = []; };
  head.forEach(b => { if (b.k === 'sb') sbs.push(b.h); else { sbFlush(); top += figHtml_(x, b); } });
  sbFlush();
  return `${top}${lead ? `<div class="qsheet-lead">${typeset_(lead)}</div>` : ''}
      <div class="qsheet-part${circ ? ' is-text' : ''}"${circ ? ` data-circ="${esc(circ.k)}"` : ''}>
        <div class="qsheet-pb">${pb}</div>
      </div>${circ && words.length ? `<p class="qpad-note qw-note">Tap a word to ring it, and again to take
        the ring off. <span data-kept-k="${esc(circ.k)}">${esc(padNoteSay_(circ.k))}</span></p>` : ''}`;
}
/* ---------- A FIGURE BLOCK, DRAWN § */
function figHtml_(x, b) {
  if (!x || !b) return '';
  if (b.k === 'nofig') return '<p class="qfig-missing">Figure not drawn yet.</p>';
  if (b.k === 'sfig') return b.from && b.from.diagram ? `<figure class="qstem-fig">${b.from.diagram}</figure>` : '';
  if (b.k === 'use') {
    const y = usesOf_(x);
    const p = y && padSource_(y);
    return p ? usesSeen_(p.svg, usesUnder_(y, p.svg).concat(usesMine_(y))) : '';
  }
  const p = padSource_(x);
  const pics = pics_(figImgs_(x.images));
  if (p && p.from !== 'surface') return padWrap_(x, p.svg) + pics;
  return (x.diagram ? usesFig_(x) || `<figure>${x.diagram}</figure>` : '') + pics;
}
/* THE PHONE'S OLD RINGS MOVE TO THE FIRST PERSON WHO OPENS THEM, as the pen's do in `padWrap_` -- and
   so do the visit's (`CIRC_HELD`), which are the only copy when storage throws. */
function circOf_(x) {
  if (padSurface_(x) !== 'text') return null;
  const k = circKey_(x), bare = 'pad:' + padItemKey_(x) + ':words';
  padAdopt_(k, bare);
  /* THE VISIT'S RINGS ARE A SIGNED-OUT ANSWER TOO, and move only where `padAdopt_` would move the stored
     ones: the one question every move asks (`ansMayMove_`, answers.js). */
  if (k !== bare && !CIRC_HELD.has(k) && CIRC_HELD.has(bare)
      && (typeof ansMayMove_ !== 'function' || ansMayMove_(bare, k))) {
    CIRC_HELD.set(k, CIRC_HELD.get(bare));
    CIRC_HELD.delete(bare);
  }
  return { k: k, on: circRead_(k) };
}
/* `figWhat_` WAS HERE: § */

/* `questionStemFigCard_` WAS HERE, the stem's figure as a page of its own after its words (204, 268). The
   figure is among the stem's words now, or under the pen of the part that draws on it (356). */

/* ---------- A FIGURE'S PAGE IS NAMED FOR THE FIGURE, NOT FOR A QUESTION NUMBER § */
function figLabel_(html, not) {
  const seen = String(html || '').replace(/<[^>]*>/g, ' ').match(/\bFigure\s+\d+[a-z]?\b/gi) || [];
  const hit = seen.map(t => 'Figure ' + t.replace(/^figure\s+/i, ''))
    .find(t => (not || []).indexOf(t) < 0);
  return hit || 'Figure';
}

/* ---------- `qHead_` AND `figHead_` WERE HERE: ONE GOLD HEADER LINE FOR EVERY PAGE OF A QUESTION § */


/* THE FIGURE IS IN ITS QUESTION'S CARD, WHERE THE PAPER PRINTS IT. § */
const figImgs_ = v => (Array.isArray(v) ? v : topicAtoms_(v));
function questionHasFig_(x) {
  if (!x || x.kind !== 'question') return false;
  return !!(x.diagram || figImgs_(x.images).length);
}
/* `questionFigCard_` WAS HERE, the part's figure as a page of its own where the paper prints it (204, 268, 270, 337). § */

/* ---------- A FIGURE THE PAPER PRINTS AND THIS SITE HAS NOT DRAWN YET § */
const FIG_NAMED = /\b(?:figure\s*\d+[a-z]?|the\s+(?:graphs?|diagrams?|grid|chart|bar\s+chart|pie\s+chart|scatter\s+(?:graph|diagram)|map)\b|the\s+table\s+below)/i;
function figWanted_(words, figured) {
  if (figured) return false;
  const h = String(words || '');
  if (/<(svg|img|table)\b/i.test(h)) return false;
  return FIG_NAMED.test(h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' '));
}
function figMissing_(x) {
  if (!x || x.kind !== 'question' || padSurface_(x)) return false;
  /* NOT A PART THAT USES AN EARLIER PART'S DRAWING: § */
  if (usesOf_(x)) return false;
  const own = p => !!(p && (p.diagram || figImgs_(p.images).length));
  let figured = own(x) || (x.stems || []).some(stemHasFig_);
  if (!figured) {
    const k = qId_(x);
    figured = !!k && ((questionParts_()[k]) || []).some(own);
  }
  return figWanted_(String(x.lead || '') + ' ' + String(x.html || ''), figured);
}
/* `questionNoFigCard_` WAS HERE, a page saying so. It is one line in the card now, where the figure would
   stand (`cardFigBlock_`, `figHtml_`; 356). */

/* THE ANSWER IS ITS OWN CARD, THE PAGE AFTER ITS QUESTION (AND AFTER ITS FIGURE). § */
function questionHasAns_(x) {
  /* OR AN ANSWER THE LEDGER HOLDS FOR IT (397), so `Answers` is still asked, and counted, before any words arrive. */
  return !!(x && x.kind === 'question' && (String(x.answer || '').trim() || libHasField_(x.row, 'answer')));
}

/* ---------- WHO SEES IT OPEN: WHOEVER ASKED, AND NOBODY ELSE § */
const ANS_SHOWN = new Set();
/* CHOOSING `Answers` IS THE ASK, so in that view every answer is open -- forty pages each reading
   "Answer hidden" is not *"only see answers"* -- and Hide on one still hides it (`ANS_HID`). */
const ANS_HID = new Set();
function ansOpen_(x) {
  if (!x) return false;
  const k = ansKey_(x);
  return ANS_SHOWN.has(k) || (answersAsked_() && !ANS_HID.has(k));
}

function questionAnsCard_(x) {
  const id = (x.row && x.row.row_id) || x.key || '';
  const k = ansKey_(x);
  const open = ansOpen_(x);
  /* ---------- ONE TILE, IN ONE PLACE, AND IT SAYS WHICH WAY IT GOES § */
  return `<div class="qcard qans-card${open ? '' : ' is-hidden'}${typeof helpCls_ === 'function' ? helpCls_() : ''}" data-of="${esc(id)}" data-k="${esc(k)}">
    ${tagRow_(x, 'ans')}
    <div class="tile-row qans-tiles">${open
      ? tile_({ icon: 'hide', label: 'Hide the answer', note: 'one tap', act: 'qa-hide', cls: 'qa-toggle', data: { k: k } })
      : tile_({ icon: 'show', label: 'Show the answer', note: 'one tap', act: 'qa-show', cls: 'qa-toggle', data: { k: k } })}${
      /* "ANSWER HIDDEN", AND NOT "HAVE A GO FIRST". § */
      open ? '' : '<span class="qans-wait-k">Answer hidden</span>'}</div>
    ${open ? answerBlock_(x) : ''}
    ${typeof helpRow_ === 'function' ? helpRow_(x) : ''}
  </div>`;
}

/* THE QUESTION A KEY BELONGS TO, by the same lookup `qp-choose` makes. */
function ansItem_(k) {
  if (!k) return null;
  try { return stuffItemsAll_().find(it => it && it.kind === 'question' && ansKey_(it) === k) || null; }
  catch (e) { return null; }
}

/* ---------- SHOWING IT AND HIDING IT: REMEMBERED, AND DRAWN WHEREVER IT ALREADY STANDS § */
function ansSet_(x, open) {
  if (!x) return;
  const k = ansKey_(x);
  if (open) { ANS_SHOWN.add(k); ANS_HID.delete(k); } else { ANS_SHOWN.delete(k); ANS_HID.add(k); }
  document.querySelectorAll('.qans-card').forEach(el => {
    if (el.getAttribute('data-k') !== k) return;
    const t = document.createElement('div');
    t.innerHTML = questionAnsCard_(x);
    const card = t.firstElementChild;
    if (!card) return;
    const had = el.contains(document.activeElement);
    el.replaceWith(card);
    if (had) { try { const tl = card.querySelector('.qa-toggle'); if (tl) tl.focus({ preventScroll: true }); } catch (e) {} }
  });
}
function ansShow_(x) { ansSet_(x, true); }
function ansHide_(x) { ansSet_(x, false); }

/* ---------- `To the answer` AND `ansWhere_` WERE HERE § */
/* ---------- AND HOW YOUR LAST ANSWER WENT, BESIDE THE STAR § */
function questionTiles_(x) {
  /* THE FIGURE TILE IS HERE ONLY FOR A PART ANSWERED BY TAPPING AN OPTION -- a typed box carries it at
     its own end (`ansBox_`), where the keypad cannot cover it. */
  const fig = Array.isArray(x.choices) && x.choices.length >= 2 ? measTiles_(x) : '';
  /* `Draw` / `Type` WAS HERE, the switch between the answer's two faces (327, 337). A question answered by
     drawing is drawn on its card now, with nothing to switch (`ansArea_`, 356). */
  /* NO WAY TO THE ANSWER IN THIS ROW ANY MORE -- see where `To the answer` was, above. */
  /* NO VERDICT BESIDE THE STAR (368), AND NO SOUND SWITCH (374): the verdict is always heard */
  /* AND THE TOOLS EVERY QUESTION PAGE HAS (457, 463): the Magnifier and the padlock, first, from one place (`qToolTiles_`). */
  return qToolTiles_(x) + fig;
}

/* ---------- THE ONE TOOLKIT (457) ---------------------------------------------------------------- */
/* What a question page has is decided HERE, from what the page is, never from a flag a row can lack (docs/history/457). */
/* SUBJECTS OF WORDS, whose figures are pictures to look at rather than drawings to measure (502, rule `meas-wordy`) */
const QT_WORDY_SUBJECT = /english|literature|spanish|french|german|language|religio|philosoph|scripture|bible|quran|talmud/i;
function qToolkit_(x) {
  if (!x || x.kind !== 'question') return null;
  const pen = padSource_(x);
  return {
    magnify: true,                 // the Magnifier (463): words, figures, pictures and the pen, under the glass
    lock: true,                    // every page has an input, a figure or a pen
    read: true,                    // Read aloud on every question, not only a primary one (394)
    help: true, report: true,      // `helpRow_` in the card, `suggestTile_` in the row
    pen: pen ? ['pen', 'ruler', 'compass', 'protractor'] : [],
    measure: measTools_(x).length > 0,
  };
}
/* THE ROW'S FIRST TWO TILES ON EVERY PAGE OF A QUESTION: the Magnifier and the padlock. */
function qToolTiles_(x) {
  const kit = qToolkit_(x);
  if (!kit) return '';
  return (kit.magnify ? magTile_() : '')
    + (kit.lock ? qLockTile_() : '');
}
/* A STEM'S OR A LONG PART'S OWN PAGE has the same, under its words, with Read aloud. */
const qPageTools_ = x => `<div class="tile-row qtool-tiles">${qToolTiles_(x)}${readAloudTile_(x)}</div>`;

/* ---------- THE MAGNIFIER (463): the owner, "a magnifying tool instead -- you hold it to see better" ---------- */
/* On, a circle 2.5 times bigger follows the mouse over the page, or shows above a held finger; a copy of the page drawn big, so words, figures, pictures and the pen's ink alike. */
const MAG = { on: '', live: false, el: null, page: null, at: 0, tid: 0, pid: null, x0: 0, y0: 0 };
const MAG_Z = 2.5, MAG_R = 80, MAG_HOLD = 220;
const magLook_ = on => ({ icon: 'zoom', label: on ? 'Magnifier on' : 'Magnifier', note: on ? 'tap to put it away' : 'hold it over the page', on: on, pressed: on });
function magTile_() { return tile_(Object.assign(magLook_(!!MAG.on), { act: 'q-mag', cls: 'q-mag' })); }
function magPaint_() {
  document.querySelectorAll('.q-mag').forEach(el => tileSet_(el, magLook_(!!MAG.on)));
  if (document.body) document.body.classList.toggle('mag-on', !!MAG.on);
}
on('q-mag', () => { MAG.on = MAG.on ? '' : qLockHere_(); if (!MAG.on) magHide_(); magPaint_(); });
/* AND ON EVERY THING FIND HOLDS (502): a library card or a verse is words and figures too; a question's pages have theirs already (`qToolTiles_`) */
const MAG_ITEM_KINDS = { content: 1, practical: 1, project: 1, bible: 1, quran: 1, talmud: 1, hadith: 1, paper: 1, document: 1 };
function magCardTile_(x) {
  if (!x || !x.key || x.kind === 'question' || x.kind === 'me') return '';
  if (!MAG_ITEM_KINDS[x.kind] && (typeof ruleOn_ !== 'function' || ruleOn_('mag-items'))) return '';
  return magTile_();
}
/* PUT AWAY WHEN A TAB OR A LINK LEAVES THE PAGE IT WAS TAKEN OUT ON, as the padlock is (`qLockStray_`) */
function magStray_() { if (MAG.on && MAG.on !== qLockHere_()) { MAG.on = ''; magHide_(); magPaint_(); } }
const magBusy_ = () => !!MAG.live;
/* WHICH PAGE A POINT IS OVER, if it is a question's page with the magnifier on */
function magPageAt_(t) {
  const page = MAG.on && t && t.closest ? t.closest('.page') : null;
  return page && page.querySelector('.q-mag') ? page : null;
}
/* THE COPY: the page's children, ids off, typed values and canvases carried over; taken again when the page changes or a second has passed */
function magCopy_(page) {
  const box = document.createElement('div');
  box.className = 'mag-in';
  box.style.width = page.offsetWidth + 'px';
  box.style.height = page.offsetHeight + 'px';
  [].slice.call(page.children).forEach(k => { if (!k.classList.contains('mag')) box.appendChild(k.cloneNode(true)); });
  box.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
  const from = [].slice.call(page.querySelectorAll('input, textarea, canvas')).filter(e => !e.closest('.mag'));
  const to = box.querySelectorAll('input, textarea, canvas');
  from.forEach((e, i) => {
    const c = to[i];
    if (!c) return;
    if (e.tagName === 'CANVAS') { try { c.getContext('2d').drawImage(e, 0, 0); } catch (err) { /* a tainted canvas stays blank */ } }
    else c.value = e.value;
  });
  return box;
}
function magShow_(page, cx, cy, touch) {
  if (!page) return magHide_();
  if (MAG.page !== page || !MAG.el || !MAG.el.isConnected || Date.now() - MAG.at > 1000) {
    magHide_();
    const el = document.createElement('div');
    el.className = 'mag';
    el.setAttribute('aria-hidden', 'true');
    el.appendChild(magCopy_(page));
    page.classList.add('mag-host');
    page.appendChild(el);
    MAG.el = el; MAG.page = page; MAG.at = Date.now();
  }
  const r = page.getBoundingClientRect(), k = page.offsetWidth ? r.width / page.offsetWidth : 1;
  const x = (cx - r.left) / k, y = (cy - r.top) / k;
  /* ABOVE THE FINGER, which would hide what it holds; round the pointer on a mouse */
  const up = touch ? MAG_R + 28 : 0;
  MAG.el.style.left = (x - MAG_R) + 'px';
  MAG.el.style.top = (y - MAG_R - up) + 'px';
  MAG.el.firstChild.style.transform = `translate(${MAG_R - x * MAG_Z}px, ${MAG_R - y * MAG_Z}px) scale(${MAG_Z})`;
  MAG.live = true;
}
function magHide_() {
  clearTimeout(MAG.tid); MAG.tid = 0;
  if (MAG.el) MAG.el.remove();
  if (MAG.page) MAG.page.classList.remove('mag-host');
  MAG.el = null; MAG.page = null; MAG.live = false;
}
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('pointermove', e => {
    if (!MAG.on) return;
    if (e.pointerType === 'touch') {
      if (e.pointerId !== MAG.pid) return;
      if (MAG.live) magShow_(MAG.page, e.clientX, e.clientY, true);
      else if (Math.abs(e.clientX - MAG.x0) > 10 || Math.abs(e.clientY - MAG.y0) > 10) { clearTimeout(MAG.tid); MAG.pid = null; }
      return;
    }
    const page = magPageAt_(e.target);
    if (page) magShow_(page, e.clientX, e.clientY, false); else if (MAG.live) magHide_();
  });
  /* A FINGER HELD STILL BRINGS IT UP; one that moves first was scrolling or turning the page, and does that */
  document.addEventListener('pointerdown', e => {
    if (!MAG.on || e.pointerType !== 'touch') return;
    const page = magPageAt_(e.target);
    if (!page) return;
    MAG.pid = e.pointerId; MAG.x0 = e.clientX; MAG.y0 = e.clientY;
    clearTimeout(MAG.tid);
    MAG.tid = setTimeout(() => { if (MAG.pid === e.pointerId) magShow_(page, MAG.x0, MAG.y0, true); }, MAG_HOLD);
  });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, e => {
    if (e.pointerType !== 'touch' || e.pointerId !== MAG.pid) return;
    MAG.pid = null;
    magHide_();
  }));
  document.addEventListener('mouseleave', () => { if (MAG.live && MAG.pid === null) magHide_(); });
  /* WHILE IT IS UP THE FINGER MOVES THE GLASS, NOT THE PAGE */
  document.addEventListener('touchmove', e => { if (MAG.live && e.cancelable) e.preventDefault(); }, { passive: false });
}

/* ---------- THE PADLOCK ON A QUESTION (457): the page held still while you write, draw or read (`PADLOCK`, overworld.js) ---------- */
const qLockLook_ = on => ({ icon: on ? 'lock' : 'unlock', label: on ? 'Locked' : 'Lock', note: on ? 'tap to let the page move' : 'hold this page still',
                            on: on, pressed: on });
const qLockHere_ = () => String(typeof AT !== 'undefined' ? AT : '') + ':' + String((typeof PAGE !== 'undefined' && PAGE[AT]) || 0);
function qLockTile_() { return tile_(Object.assign(qLockLook_(!!PADLOCK.q), { act: 'q-lock', cls: 'q-lock' })); }
function qLockPaint_() { document.querySelectorAll('.q-lock').forEach(el => tileSet_(el, qLockLook_(!!PADLOCK.q))); }
on('q-lock', () => { PADLOCK.q = PADLOCK.q ? '' : qLockHere_(); qLockPaint_(); });
/* LET GO WHEN A TAB OR A LINK LEAVES THE PAGE IT WAS PRESSED ON: a lock nobody can see is a broken swipe */
function qLockStray_() { if (PADLOCK.q && PADLOCK.q !== qLockHere_()) { PADLOCK.q = ''; qLockPaint_(); } }

/* THE FIGURE, OVER THE CARD, ONE TAP AWAY. § */
function figsBefore_(x) {
  if (!x || x.kind !== 'question') return [];
  const out = [];
  const k = qId_(x);
  const sib = k ? ((questionParts_()[k]) || []) : [];
  const at = sib.indexOf(x);
  const drew = sib.slice(0, at < 0 ? 0 : at);
  const seen = svg => {
    const by = drew.filter(y => { const p = padSource_(y); return p && p.svg === svg; })
      .map(y => usesMine_(y)).filter(all => all.length);
    return by.length ? usesSeen_(svg, [].concat(...by)) : '';
  };
  const pic = (p, label, onlyMarked) => {
    const marked = p.diagram ? seen(p.diagram) : '';
    if (onlyMarked && !marked) return;
    const html = (marked || (p.diagram ? `<figure>${p.diagram}</figure>` : '')) + pics_(figImgs_(p.images));
    if (html) out.push({ label: label, html: html });
  };
  /* NOT THE STEM'S PICTURE THIS PART DRAWS ON: it is under the pen on this very card (356). */
  const penOn = padSource_(x);
  /* NOR ONE AN EARLIER PART DREW ON (381): a later part that reads it says so (`uses`) and has it, marked, on its card; one that does not has nothing for it */
  const drawnOn = p => drew.some(y => { const q = padSource_(y); return q && q.from !== 'surface' && q.svg === p.diagram; });
  (x.stems || []).forEach(p => { if (stemHasFig_(p) && !(penOn && penOn.from === p) && !(p.diagram && drawnOn(p))) pic(p, figLabel_(p.html)); });
  const own = p => !!(p.diagram || figImgs_(p.images).length);
  /* ---------- AND THE PICTURE A `uses` PART READS, ONLY WITH SOMETHING ON IT § */
  const bare = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]/g, '');
  const used = new Set();
  for (let y = x, n = 0; y && n < 9; n++) {
    const u = bare(y.uses || (y.row && y.row.uses));
    if (!u || used.has(u)) break;
    used.add(u);
    y = sib.find(p => bare(p.qPart) === u) || null;
  }
  sib.slice(0, at < 0 ? 0 : at).forEach(p => {
    if (own(p)) pic(p, figLabel_(String(p.lead || '') + ' ' + String(p.html || '')), used.has(bare(p.qPart)));
  });
  /* NOT ITS OWN FIGURE ANY MORE: that is on its card, among its words (356). The tile is for what is NOT on
     the card -- the stems' pictures and the earlier parts'. */
  return out;
}
/* NO FIGURE TILE (463): the owner, "if they want to see the figure, they scroll up"; `figsBefore_` still tells Read aloud there is one. */

/* ---------- READ ALOUD, ON EVERY PRIMARY QUESTION (394) ---------------------------------------- */
/* PRIMARY IS THE SATs LEVEL (`levelOf_`, `ksFallback_` behind it) or a school year 1 to 6, whatever the level cell says;
   the owner's words are in docs/history/394. */
function readAloudFor_(x) {
  if (!x) return false;
  /* EVERY QUESTION (457): the toolkit's, so it can never be missing from one */
  if (x.kind === 'question') return !!(qToolkit_(x) || {}).read;
  /* EVERY CONTENT CARD AT EVERY LEVEL, and every other thing with words to read (502); the SATs-and-years-1-to-6 limit is gone */
  if (x.kind === 'content') return true;
  return typeof speedText_ === 'function' && (x.kind === 'practical' || x.kind === 'project' || x.kind === 'bible') && !!speedText_(x);
}
/* WHAT IS BEING READ, AND WHERE IT WAS PRESSED: a slide to another column or page stops it (`readAloudStray_`, from `placeCells`). */
let READ_NOW = null;
const readAloudLook_ = on => ({ icon: 'speak', label: on ? 'Stop reading' : 'Read aloud', note: on ? 'one tap' : 'reads the question out',
                                 on: !!on, pressed: !!on });
function readAloudTile_(x) {
  if (!readAloudFor_(x) || !canSay_() || !x.key) return '';
  const on = !!READ_NOW && READ_NOW.key === x.key;
  return tile_(Object.assign(readAloudLook_(on), { act: 'read-aloud', cls: 'read-aloud', data: { key: x.key } }));
}
function readAloudPaint_(k) {
  const on = !!READ_NOW && READ_NOW.key === k;
  document.querySelectorAll('.read-aloud').forEach(el => { if (el.getAttribute('data-key') === k) tileSet_(el, readAloudLook_(on)); });
}
function readAloudStop_() {
  if (!READ_NOW) return;
  const k = READ_NOW.key;
  READ_NOW = null;
  hush_();
  readAloudPaint_(k);
}
function readAloudStray_() {
  if (READ_NOW && (AT !== READ_NOW.at || (PAGE[AT] || 0) !== READ_NOW.page)) readAloudStop_();
}
/* EVERY LINE QUEUED INSIDE THE TAP, because iPhone Safari speaks only from a tap's own handler; a line at a time, because Chrome cuts one long utterance off at about fifteen seconds. */
on('read-aloud', el => {
  const k = el && el.getAttribute('data-key');
  const was = READ_NOW && READ_NOW.key;
  readAloudStop_();
  if (!k || was === k) return;
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  const lines = readAloudLines_(x);
  if (!lines.length || !canSay_()) return;
  const me = READ_NOW = { key: k, at: AT, page: PAGE[AT] || 0 };
  readAloudPaint_(k);
  const done = () => { if (READ_NOW === me) { READ_NOW = null; readAloudPaint_(k); } };
  lines.forEach((l, i) => say_(l, { onend: i === lines.length - 1 ? done : null }));
});

/* ---------- HEAR IT, ON A LANGUAGE'S CONTENT CARD (427) ---------------------------------------- */
/* The worked lines' own-language halves (before " — "), in that language's voice; the English is on the card to read. */
const HEAR_LANG = { Spanish: 'es-ES', French: 'fr-FR', German: 'de-DE', Russian: 'ru-RU' };
const hearItLang_ = x => (x && x.kind === 'content' && (typeof ruleOn_ !== 'function' || ruleOn_('hear-lang')) && HEAR_LANG[x.subject]) || '';
const hearItLines_ = x => ((x && x.row && x.row.points) || []).map(p => String(p.text || '').split(' — ')[0].trim()).filter(Boolean);
function hearItTile_(x) {
  if (!hearItLang_(x) || !canSay_() || !x.key || !hearItLines_(x).length) return '';
  return tile_({ icon: 'speak', label: 'Hear it', note: 'the ' + x.subject + ', read out', act: 'hear-it', cls: 'hear-it', data: { key: x.key } });
}
/* QUEUED INSIDE THE TAP, as Read aloud's lines are; a second tap starts it again from the top. */
on('hear-it', el => {
  const k = el && el.getAttribute('data-key');
  readAloudStop_();
  hush_();
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  const lang = hearItLang_(x);
  if (lang) hearItLines_(x).forEach(l => say_(l, { lang: lang }));
});

/* ---------- WHAT IS SAID: THE QUESTION AS THE CARD SHOWS IT, NEVER THE ANSWER OR THE MARKS ---------- */
/* In the card's order (`partChunks_`): a stem carried onto the card, the lead, the part's words, "Look at the picture." where
   a figure stands; then the options as A, B, C, or the cards to order, and how many answers to give. */
function readAloudLines_(x) {
  if (!x) return [];
  const out = [];
  const add = h => speakLines_(h).forEach(l => out.push(l));
  if (x.kind !== 'question' && x.kind !== 'content') return typeof speedText_ === 'function' ? speakLines_(speedText_(x).replace(/\n\s*\n/g, '. ')) : [];
  if (x.kind === 'content') {
    const c = x.row || {};
    add(x.name || c.title);
    [].concat(c.words || [], c.formulas || [], c.points || []).forEach(i => {
      if (i && (i.name || i.text)) add([i.name, i.text].filter(Boolean).join(': '));
    });
    return out;
  }
  let pic = false;
  const look = () => { if (!pic) { out.push('Look at the picture.'); pic = true; } };
  [].concat(...partChunks_(x)).forEach(b => {
    if (b.k === 'sb' || b.k === 'lead' || b.k === 'pb') {
      if (/<(svg|img)\b/i.test(b.h)) look();
      add(b.h);
    } else if (b.k === 'fig' || b.k === 'use') look();
  });
  if (!pic && (questionHasFig_(x) || figsBefore_(x).length)) look();
  const ch = Array.isArray(x.choices) ? x.choices : [];
  const said = ch.map(c => speakLines_(c).join(' ').replace(/\.$/, ''));
  /* AN ORDERING WHOSE WORDS ALREADY LIST ITS CARDS IS NOT READ THE LIST TWICE. */
  const listed = said.every(c => out.join(' ').indexOf(c) >= 0);
  if (ch.length >= 2 && orderIs_(x)) {
    if (!listed) out.push('Put these in order: ' + said.join(', ') + '.');
  } else if (ch.length >= 2) {
    const need = (x.choiceRight || []).length;
    if (need > 1) out.push('Choose ' + need + '.');
    said.forEach((c, i) => out.push(String.fromCharCode(65 + i) + ': ' + c + (/[?!:]$/.test(c) ? '' : '.')));
  } else {
    let m = null;
    try { m = String(x.accept || '').trim() ? multiOf_(x) : null; } catch (e) { m = null; }
    if (m && m.n >= 2) out.push('Give ' + m.n + ' answers.');
  }
  return out;
}

/* ---------- MATHS, SAID THE WAY A TEACHER SAYS IT -------------------------------------------- */
const SAY_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const SAY_NTH = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'],
  6: ['sixth', 'sixths'], 7: ['seventh', 'sevenths'], 8: ['eighth', 'eighths'], 9: ['ninth', 'ninths'], 10: ['tenth', 'tenths'],
  11: ['eleventh', 'elevenths'], 12: ['twelfth', 'twelfths'], 100: ['hundredth', 'hundredths'], 1000: ['thousandth', 'thousandths'] };
const SAY_UNIT = { mm: 'millimetre', cm: 'centimetre', m: 'metre', km: 'kilometre', g: 'gram', kg: 'kilogram',
  ml: 'millilitre', l: 'litre' };
const SAY_ENT = { times: '×', divide: '÷', minus: '−', pound: '£', nbsp: ' ', thinsp: '', frasl: '/', deg: '°', sup2: '²',
  sup3: '³', lt: '<', gt: '>', le: '≤', ge: '≥', ndash: ' – ', mdash: ' – ', hellip: '…', amp: '&', radic: '√', pi: 'π',
  rsquo: "'", lsquo: "'", ldquo: '', rdquo: '', quot: '', eacute: 'é', percnt: '%', plus: '+', equals: '=' };
const isBox_ = s => /^\s*(\?|□|☐|)\s*$/.test(s);
/* "three quarters" where the words are plain, "17 over 40" where they are not; a box to fill is "how many twelfths". */
function sayFrac_(n, d) {
  n = String(n).trim(); d = String(d).trim();
  const nth = /^\d+$/.test(d) ? SAY_NTH[+d] : null;
  if (nth && /^\d+$/.test(n) && +n <= 12) return SAY_NUM[+n] + ' ' + nth[+n === 1 ? 0 : 1];
  if (nth && isBox_(n)) return 'how many ' + nth[1];
  return (isBox_(n) ? 'what' : n) + ' over ' + (isBox_(d) ? 'what' : d);
}
function sayMoney_(p, d) {
  const pounds = Number(String(p).replace(/,/g, '')), pence = d ? Number(d) : 0;
  if (!pounds && d) return pence + (pence === 1 ? ' penny' : ' pence');
  return String(p) + (pounds === 1 ? ' pound' : ' pounds') + (pence ? ' ' + (pence < 10 ? 'oh ' + pence : pence) : '');
}
function sayTime_(h, m) {
  return +m === 0 ? String(+h) + " o'clock" : String(+h) + ' ' + (+m < 10 ? 'oh ' + +m : m);
}
/* HTML IN, SENTENCES OUT: one per paragraph or line, table cells read across with commas. */
function speakLines_(html) {
  let s = String(html == null ? '' : html)
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ').replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<span\b[^>]*class=['"][^'"]*\bbox\b[^'"]*['"][^>]*>[\s\S]*?<\/span>/gi, '□')
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n))
    .replace(/&([a-z]+\d?);/gi, (m, n) => (SAY_ENT[n.toLowerCase()] != null ? SAY_ENT[n.toLowerCase()] : ' '));
  /* A FRACTION AS THE CARD SETS IT, <sup>a</sup>⁄<sub>b</sub>, with a whole number in front making it mixed. */
  s = s.replace(/(\d+)?\s?<sup[^>]*>([^<]*)<\/sup>\s*[\/⁄]\s*<sub[^>]*>([^<]*)<\/sub>/gi,
    (m, w, n, d) => ' ' + (w ? w + ' and ' : '') + sayFrac_(n, d) + ' ')
    .replace(/<sup[^>]*>\s*2\s*<\/sup>/gi, '²').replace(/<sup[^>]*>\s*3\s*<\/sup>/gi, '³')
    .replace(/<sup[^>]*>([^<]*)<\/sup>/gi, ' to the power of $1 ')
    .replace(/<\/(p|li|tr|h\d|div)>|<br\s*\/?>/gi, '\n').replace(/<\/t[dh]>/gi, ', ')
    .replace(/<[^>]*>/g, '');
  return s.split('\n').map(sayLine_).filter(Boolean);
}
function sayLine_(t) {
  t = String(t)
    .replace(/[“”"]/g, '').replace(/[‘’]/g, "'")
    /* THE ANSWER LINE AND THE MARKS ARE NOT THE QUESTION. */
    .replace(/\.{3,}|_{3,}|…+/g, ' ')
    .replace(/[\[(]\s*\d+\s*marks?\s*[\])]|^\s*\d+\s*marks?\s*$|^\s*\(?total for question\b.*$/gi, ' ')
    .replace(/(^|[^\d])(\d{1,2})\s*\/\s*(\d{1,3})(?![\d\/])/g, (m, a, n, d) => a + sayFrac_(n, d))
    .replace(/£\s?(\d[\d,]*)(?:\.(\d\d))?/g, (m, p, d) => sayMoney_(p, d))
    .replace(/\b([01]?\d|2[0-3]):([0-5]\d)(?!\d)/g, (m, h, mm) => sayTime_(h, mm))
    .replace(/(\d)\s?([ap])m\b/g, '$1 $2.m.')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 to $2')
    .replace(/(\d)\.(\d+)/g, (m, a, b) => a + ' point ' + b.split('').join(' '))
    .replace(/(\d)\s*(mm|cm|km|kg|ml|m|g|l)([²³])?(?![a-zA-Z])/g, (m, n, u, p) =>
      n + ' ' + (p === '²' ? 'square ' : p === '³' ? 'cubic ' : '') + SAY_UNIT[u] + 's')
    .replace(/\b1 ((?:square |cubic )?[a-z]+metre|gram|kilogram|millilitre|litre)s\b/g, '1 $1')
    .replace(/\b(mm|cm|km|kg|ml)\b/g, u => SAY_UNIT[u] + 's')
    .replace(/°\s?C\b/g, ' degrees Celsius').replace(/°\s?F\b/g, ' degrees Fahrenheit').replace(/°/g, ' degrees')
    .replace(/%/g, ' percent').replace(/²/g, ' squared').replace(/³/g, ' cubed')
    .replace(/√\s*/g, ' the square root of ').replace(/π/g, ' pi ')
    .replace(/(\S)\s*=\s*(□|☐|\?)?\s*$/, '$1 equals what?')
    .replace(/(^|\s)[?□☐](?=\s|$)/g, '$1box').replace(/[□☐]/g, ' box ')
    .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/\+/g, ' plus ').replace(/−/g, ' minus ')
    .replace(/(\d|\s)-(?=\s|\d)/g, '$1 minus ').replace(/=/g, ' equals ')
    .replace(/≤/g, ' is less than or equal to ').replace(/≥/g, ' is greater than or equal to ')
    .replace(/</g, ' is less than ').replace(/>/g, ' is greater than ')
    .replace(/✓/g, ' tick ').replace(/✗/g, ' cross ').replace(/△/g, ' triangle ')
    .replace(/\s+([,.?!:;)])/g, '$1').replace(/\.{2,}/g, '.').replace(/\(\s+/g, '(').replace(/,\s*$/, '').replace(/\s+/g, ' ').trim();
  if (!t || !/[a-z0-9]/i.test(t)) return '';
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.?!:]$/.test(t) ? t : t + '.';
}

/* `on('qa-go')` WAS HERE -- the ↓ tile's handler, which turned forward by the answer's place among its
   question's pages. It went with the tile (see where `To the answer` was, above). */

/* ON THE ANSWER PAGE ITSELF, THE ONE CONTROL, BOTH WAYS -- you are already there. */
on('qa-show', (el) => {
  ansShow_(ansItem_(el.getAttribute('data-k')));
});
on('qa-hide', (el) => {
  ansHide_(ansItem_(el.getAttribute('data-k')));
});

/* `topicBy` WAS HERE — a document by id, falling back to its name. Nothing has a document to look
   up any more; see the note above `questionItems`. */

/* ---------- WHAT A PRINTED COPY COSTS, WHICH HAS A CALLER AGAIN § */
function printOffered_() {
  const v = (DATA.constants || {}).vars || {};
  const rate = num(v.print_rate_per_page);
  return !isNaN(rate) && rate > 0;
}
function printPrice(pages) {
  const n = Number(pages) || 0;
  if (n <= 0 || !printOffered_()) return null;
  const v = (DATA.constants || {}).vars || {};
  const min = num(v.print_minimum) || 0;
  return Math.max(min, Math.round(n * num(v.print_rate_per_page) * 100) / 100);
}



/* ---------- AND WHAT LAMINATING ONE COSTS § */
function laminatePrice(pages) {
  const n = Number(pages) || 0;
  if (n <= 0) return null;
  const v = (DATA.constants || {}).vars || {};
  const rate = num(v.laminate_rate_per_page);
  if (isNaN(rate) || rate <= 0) return null;      // rate not set: laminating is off, not free
  const min = num(v.laminate_minimum) || 0;
  return Math.max(min, Math.round(n * rate * 100) / 100);
}

/* WHAT A BASKET LINE ACTUALLY COSTS, in one place. § */
/* ---------- AND A PRINTED LINE IS PRICED THE SAME WAY, WITH ONE EXCEPTION § */
const cartPrint_ = c => {
  if (!c) return null;
  if (Number(c.money) > 0) return Number(c.money);
  return c.kind === 'print' ? printPrice(c.pages) : 0;
};
/* NOT YET PRICED — a paper nobody has counted the pages of, or a print when printing is off. It is
   what the basket draws as "tbc" and what the order message says will be priced when it is sent. */
const cartUnpriced_ = c => cartPrint_(c) === null;
const cartMoney_ = c => (cartPrint_(c) || 0)
  + (c && c.laminate ? (laminatePrice(c.pages) || 0) : 0);

/* WHETHER LAMINATING IS OFFERED AT ALL, which is a different question from what one costs. § */
function laminateOffered_() {
  const rate = num(((DATA.constants || {}).vars || {}).laminate_rate_per_page);
  return !isNaN(rate) && rate > 0;
}

/* ---------- `canPrint` CAME BACK WITH THE BUNDLE, AND ITS RULE CAME BACK UNCHANGED § */
const canPrint_ = doc => !!doc && String(doc.printable == null ? '' : doc.printable)
  .trim().toLowerCase() !== 'false';



/* ---------- THE THREE PASSES WERE HERE, AND THEY ARE NOT COMING BACK IN THIS SHAPE § */

/* The rate as a number of pence, for the line that spells the sum out. */
const printRatePence = () => {
  const r = num(((DATA.constants || {}).vars || {}).print_rate_per_page);
  return isNaN(r) ? 0 : Math.round(r * 100);
};

/* One list, so the four controls act on everything rather than on one half — a filter that silently ignores the shop is a filter nobody trusts twice. § */
/* ---------- THE SAME LIST, NOT THE SAME LIST REBUILT § */
let ITEM_MEMO = { key: null, from: null, items: null };
/* ---------- AND THE SAME MEMO AGAIN FOR THE UNFILTERED LIST § */
let ALL_MEMO = { key: null, from: null, items: null };

/* WHO IS SIGNED IN, AND NOT WHETHER THEY ARE AN ADMIN. § */
const itemMemoKey_ = () => (USER ? (USER.personId || USER.name || 'u') : '-')
  + (typeof bibleFor_ === 'function' && bibleFor_() ? '+bible' : '') + '@' + viewerAgeCapKey_();

/* ---------- AN AGE LIMIT ON ANY ITEM (490): `min_age` on the item or its row. Under it, of no known age or signed out, it is
   not listed and so cannot be opened; an admin sees all (`viewerAgeCap_`, games.js). */
const viewerAgeCapKey_ = () => { try { return String(typeof viewerAgeCap_ === 'function' ? viewerAgeCap_() : 0); } catch (e) { return '0'; } };
/* GCSE TOPICS FOR GCSE AGES (505): GCSE-and-above history, RS, philosophy, psychology, sociology and sensitive topics, and the history database, are 14+. */
const GCSE_AGE = 14;
const GCSE_AGE_SUBJECT = /histor|religio|philosoph|ethic|psycholog|sociolog/i;
const GCSE_AGE_TOPIC = /\bdrugs?\b|\balcohol\b|abortion|euthanas|\bcrime\b|deviance|religion and life|health and disease/i;
const GCSE_AGE_LEVEL = /^(gcse|igcse|as|a-?level|alevel|ks4|ks5)$/i;
function gcseAgeOf_(x) {
  if (!x || (typeof ruleOn_ === 'function' && !ruleOn_('gcse-sensitive-age'))) return 0;
  const lv = levelOf_(x);
  if (x.hdb && !lv) return GCSE_AGE;
  if (!GCSE_AGE_LEVEL.test(lv)) return 0;
  const said = [x.name, x.topics, x.row && x.row.topics, x.row && x.row.section].filter(Boolean).join(' ');
  return GCSE_AGE_SUBJECT.test(String(x.subject || '')) || GCSE_AGE_TOPIC.test(said) ? GCSE_AGE : 0;
}
const itemMinAge_ = x => Math.max(gcseAgeOf_(x), Number((x && (x.min_age || (x.row && x.row.min_age))) || 0) || 0);
function itemAgeOk_(x) {
  const m = itemMinAge_(x);
  if (!m) return true;
  try { return (typeof viewerAgeCap_ === 'function' ? viewerAgeCap_() : 0) >= m; } catch (e) { return false; }
}
/* WHETHER THIS VIEWER MAY HAVE A WHOLE SHELF OF A GIVEN AGE, asked before its files are even fetched (the Talmud, the Quran). */
const viewerOfAge_ = m => itemAgeOk_({ min_age: m });
const FIGHT_VIDEO_AGE = 13;

/* ---------- EVERY ITEM THE APP HAS, INCLUDING THE ONES THE FUNNEL DOES NOT OFFER § */
function stuffItemsAll_() {
  const key = itemMemoKey_();
  if (ALL_MEMO.from === DATA && ALL_MEMO.key === key) return ALL_MEMO.items;
  const built = stuffItemsRaw_().filter(itemAgeOk_);
  ALL_MEMO = { key: key, from: DATA, items: built };
  return built;
}

/* ---------- FORGET EVERY LIST BUILT FROM `DATA`, FOR A WRITE THAT CHANGED `DATA` IN PLACE § */
function stuffForget_() {
  ALL_MEMO = { key: null, from: null, items: null };
  FUNNEL_MEMO = { key: null, from: null, items: null };
  /* EVERY FINDER'S, not the bound one's: a sign-out that forgot Find's list and left Find 2's would
     hand the next child the last one's Books shelf — which is on both finders' lists (347). */
  finderEach_(() => {
    ITEM_MEMO = { key: null, from: null, items: null };
    FIND_MEMO = { key: null, from: null, items: null, total: 0 };
  });
}

/* ---------- WHERE YOU WERE IN FIND, KEPT FOR A RELOAD § */
function findPlaceKeep_(F) {
  if (!F || !F.id) { Object.keys(FINDERS).forEach(id => findPlaceKeep_(FINDERS[id])); return; }
  try {
    if (typeof AT === 'undefined' || AT !== F.id || typeof draftKeep_ !== 'function') return;
    inFinder_(F, () => {
      const at = (PAGE[F.id] || 0) - stuffFirstResult_();
      const pg = at >= 0 ? (stuffPages_()[at] || null) : null;
      const key = pg && pg.x ? String(pg.x.key || pg.x.name || '') : '';
      /* QUIET (`keepPut_`): a place is a convenience, so it never asks the browser to hold the page. */
      draftKeep_(F.place, 'place', JSON.stringify({ f: STUFF.filters || [], q: STUFF.q || '',
        key: key, part: key ? (pg.part || null) : null, at: Date.now() }), true);
    });
  } catch (e) {}
}
/* EACH FINDER UNDER ITS OWN NAME — Find's `find:place` as it always was, the second finder's `res:place` — and only the one in front, which is the only one a § */
window.addEventListener('pagehide', () => findPlaceKeep_());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') findPlaceKeep_(); });
let FIND_PLACE_TRIED = false;
function findPlaceBack_(F) {
  if (!F || !F.id) { Object.keys(FINDERS).forEach(id => findPlaceBack_(FINDERS[id])); return; }
  if (typeof draftRead_ !== 'function') return;
  inFinder_(F, () => {
    if (FIND_PLACE_TRIED) return;
    FIND_PLACE_TRIED = true;
    try {
      const raw = draftRead_(F.place, 'place');
      if (raw === null) return;
      const p = JSON.parse(raw);
      if (!p || typeof p !== 'object' || !(Date.now() - (Number(p.at) || 0) < AWAY_AGAIN)) return;
      if (AT !== F.id || (STUFF.filters || []).length || STUFF.q) return;
      STUFF.filters = (Array.isArray(p.f) ? p.f : [])
        .filter(f => f && typeof f === 'object' && typeof f.field === 'string')
        .map(placeChipMoved_)
        .filter(f => !placeChipDead_(f));
      STUFF.q = typeof p.q === 'string' ? p.q : '';
      const box = $(F.id + '-q');
      if (box) box.value = STUFF.q;
      paintStuff();
      if (!p.key) return;
      const pages = stuffPages_();
      const mine = pg => pg && pg.x && String(pg.x.key || pg.x.name || '') === p.key;
      let i = pages.findIndex(pg => mine(pg) && (pg.part || null) === (p.part || null));
      /* A PLACE KEPT ON A PART THE ITEM NO LONGER HAS -- a figure page (`fig`, `sfigN`, `use`, `nofig`), all
         gone into their cards on 18 Oct (356) -- comes back on that item's card, not on page one. */
      if (i < 0) i = pages.findIndex(pg => mine(pg) && !pg.part);
      if (i >= 0) goPage(F.id, stuffFirstResult_() + i, true);
    } catch (e) {}
  });
}
/* ---------- A KEPT CHIP NOTHING WILL EVER ANSWER § */
const RETIRED_SHELVES = ['@family. textbooks', 'Icons'];
/* AN ANSWER THAT WENT, by its facet: the textbooks shelf (347), and `Bundles`, which stopped being a kind to ask for (396). */
const RETIRED_ANSWERS = { shelf: RETIRED_SHELVES, kindLabel: ['Bundles', 'Icons', 'Inserts', 'Content'], documentType: ['Insert'] };
/* AN ANSWER THAT WAS RENAMED (504): the `Books` shelf is `Writings`, so a kept place on it stands on Writings. */
const MOVED_ANSWERS = { shelf: { Books: BIBLE_SHELF } };
const placeChipMoved_ = f => (f && MOVED_ANSWERS[f.field] && MOVED_ANSWERS[f.field][f.value]
  ? Object.assign({}, f, { value: MOVED_ANSWERS[f.field][f.value] }) : f);
function placeChipDead_(f) {
  if (!f || typeof f.field !== 'string') return true;
  if (f.field === 'shelf' && f.value === BIBLE_SHELF) return !viewerOfAge_(scriptureMinAge_());
  /* A WRITING'S CHIP (520) kept by a viewer under the writings' age: most of what answers it is not theirs, so it is dropped. */
  if (/^w[A-Z]/.test(f.field) && typeof writingFor_ === 'function') return !writingFor_(writingWork_('bible'));
  if (RETIRED_FACETS[f.field]) return true;
  /* A RANGE CHIP (`bucket`) — the groupings went in 290 and their tables in 396, so nothing answers one. */
  if (f.bucket) return true;
  /* A SHELF THAT WENT. `@family. textbooks` held the books, and each chapter is a content card now with no shelf at all — so a kept place standing on it would come § */
  if ((RETIRED_ANSWERS[f.field] || []).indexOf(f.value) !== -1) return true;
  return !facetBy(f.field) && Array.isArray(DATA.facets) && DATA.facets.length > 0;
}

/* ---------- ONE LIST FOR BOTH FINDERS, COUNTED ONCE § */
let FUNNEL_MEMO = { key: null, from: null, items: null };
function stuffItems() {
  const key = itemMemoKey_();
  if (!(FUNNEL_MEMO.from === DATA && FUNNEL_MEMO.key === key)) {
    FUNNEL_MEMO = { key: key, from: DATA, items: stuffItemsBuild_() };
  }
  /* THE WRITINGS THIS FUNNEL STARTED WITH (520): an index that comes after an answer joins at the next fresh start. */
  const admit = writingAdmit_();
  if (ITEM_MEMO.from === DATA && ITEM_MEMO.key === key + '|' + admit) return ITEM_MEMO.items;
  /* ONE LIST STILL, while a finder has everything that came; a narrower set is made once and shared by every finder on it. */
  const cut = FUNNEL_MEMO.cut || (FUNNEL_MEMO.cut = {});
  const items = admit === writingNow_() ? FUNNEL_MEMO.items : cut[admit] || (cut[admit] = FUNNEL_MEMO.items.filter(x => writingAdmitted_(x, admit)));
  ITEM_MEMO = { key: key + '|' + admit, from: DATA, items: items };
  return ITEM_MEMO.items;
}

/* ---------- BOOKING IS NOT IN THE FUNNEL, AND THIS IS THE TOOLS AND GAMES DECISION AGAIN § */
/* ---------- AND THE SHOP LEFT WITH IT, ONCE IT HAD A COLUMN TO GO TO § */
const FUNNEL_NOT_FOR = ['Booking', 'Shop'];

function stuffItemsBuild_() {
  return stuffItemsAll_().filter(x => {
    /* READ EXACTLY AS THE `forLabel` FACET READS IT — `x.groups || kindOf_(x).group`, through `asList_` — so what leaves the funnel is what would have answered § */
    const g = asList_(x.groups || kindOf_(x).group);
    if (g.length && g.every(k => FUNNEL_NOT_FOR.indexOf(k) >= 0)) return false;
    /* AND NOTHING ELSE: BOTH FINDERS CARRY EVERYTHING (347). § */
    return true;
  });
}

function stuffItemsRaw_() {
  return [
    /* ---------- PEOPLE, PLACES AND SUBJECTS § */
    ...(DATA.tutors || []).filter(t => t.title).map(t => ({
      kind: 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
      cost: priced_(t.rate), off: t.listed === false, row: t,
    })),
    ...(DATA.venues || []).filter(v => v.title).map(v => ({
      kind: 'venue', name: v.title, key: v.title, sub: v.subtitle || '', image: v.image,
      cost: priced_(v.bestRate), row: v, borough: v.borough || v.city || '',
    })),
    /* The widgets, findable like everything else. § */
    /* ---------- THE WIDGETS ARE NOT IN THE FUNNEL, AND THIS IS THE SECOND DECISION ON IT § */
    /* FRIENDS. People are found on the Find tab like everything else — they were a card on You, which made them a setting about yourself rather than a set of people § */
    ...(canTrack() ? friendHandles().map(h => {
      const s2 = (DATA.students || []).find(x => norm(x.handle) === norm(h)) || {};
      return {
        kind: 'friend', name: s2.name || h, key: 'friend:' + h, sub: h, image: '',
        row: Object.assign({ handle: h }, s2),
      };
    }) : []),
    /* ---------- THE POSTS § */
    /* THE POSTS WERE BUILT HERE and are not any more: § */
    /* ---------- THE LINKS WERE BUILT HERE, AND THEY ARE GONE FROM THE APP § */
    ...(typeof subjectRows === 'function' ? subjectRows() : []).map(x => ({
      kind: 'subject', name: x.name, key: x.name, sub: '', image: '',
      subject: x.name, row: x,
    })),
    /* ---------- LEVELS § */
    /* ---------- YOU, ONE ROW, ONLY WHEN SIGNED IN --------------------------------------------
       Everything on it is already on this device because it is yours — see the note on the `me`
       kind above for why nobody else joins it. */
    /* ---------- WHAT YOU ARE IN, WHAT YOU ARE WAITING FOR, AND WHAT IS DONE § */
    ...(typeof myJobs_ === 'function' ? myJobs_() : []).map(j => ({
      /* ONE KIND FOR ALL OF THEM — see the note on `receipt` above. `jobIsPast_` and `isWaitJob_`
         still decide how a card DRAWS and how the widgets split their lists; they no longer decide
         which answer a session lives under. */
      kind: 'receipt',
      name: [j.subject || 'Session', j.level].filter(Boolean).join(' · '),
      key: 'job:' + (j.id || j.jobId || ''),
      sub: [j.tutor, j.venue, j.weekday].filter(Boolean).join(' · '),
      cost: priced_(j.price), subject: j.subject || '', row: j,
      bandValue: j.level || '',
    })),
    /* YOU WERE AN ITEM HERE, under `People`, when you had no tutor row of your own. § */
    ...(typeof levelRows === 'function' ? levelRows() : []).map(x => ({
      kind: 'level', name: x.name, key: 'lvl:' + x.name,
      /* The subjects, under the name, so the list is readable before anything is opened. */
      sub: (x.subjects || []).join(' · '), image: '',
      row: x,
    })),
    /* `name` and `price`, which is what the payload actually calls them. I had written `title`
       and `cost` — so every shop item drew with no name and a price of zero. */
    ...(DATA.shop || []).map(x => ({
      kind: 'shop', name: x.name, key: x.name, sub: x.description || '', image: x.image,
      /* A SHOP ROW IS THE ONE PLACE `0` GENUINELY MEANS FREE — it is priced, and the price is
         nought. Everything else that used to write `cost: 0` was saying "I have no price", which
         is a different answer; see `priced_`. */
      /* ---------- AND A BLANK PRICE CELL IS NOT A PRICE OF NOUGHT, ON THIS MAPPER TOO § */
      cost: priced_(x.price), slot: x.slot || '',
      /* PENCE ARE MONEY (463): the basket takes them as money (`cartPrice_`), so the card says £, not credits. */
      pence: String(x.unit || '').trim() === 'p',
      /* THE EXAM FIELDS ARE NOT WRITTEN BLANK ANY MORE. § */
      /* WHETHER IT IS A WEARABLE, AND WHAT IT COSTS TO REACH. § */
      wearable: isWearable(x),
      level: Number(x.level) || 0,
      artId: x.artId || '',
      /* ITS TAGS (499): "these need to have all the tags instead ... way more helpful ... more automatable" — read off the row's own fields. */
      ...shopTags_(x),
    })),
    /* A resource costs nothing, and the zero is written here rather than left undefined — so
       every sort, filter and label downstream sees a number and not a hole. */
    /* ---------- QUESTIONS, AS PARTS § */

    /* A FIGHTER ANSWERS THE FUNNEL'S QUESTIONS IN HIS OWN WORDS. § */
    ...(DATA.boxers || []).filter(b => b.name).map(b => ({
      kind: 'boxer', name: b.name, key: 'bx:' + (b.id || b.name),
      sub: [b.bestDivision, b.country].filter(Boolean).join(' · '), image: b.image,
      /* ---------- A DIVISION IS NOT A SUBJECT § */
      /* WHICH OF THE TWO, asked before the weight. § */
      boxKind: 'Boxers', shelf: 'Boxing',
      subject: 'Physical Education', division: divisionOf_(b.bestDivision), row: b,
      /* ---------- `year: b.activeTo` WAS HERE, AND IT WAS HIS LAST YEAR DRAWN AS "Year" § */
    })),

    /* A BOUT ANSWERS THE FUNNEL LIKE A BOXER DOES: PE as the subject (499), the weight as the
       division. Everything school-shaped stays blank, and blank is what keeps a fight out of a
       list of past papers. */
    ...(DATA.fights || []).map(f => ({
      kind: 'fight', name: f.a + ' v ' + f.b,
      key: 'ft:' + (f.id || f.a + f.b + f.date),
      sub: [(f.date || '').slice(0, 4), f.division, f.venue].filter(Boolean).join(' · '),
      image: '',
      boxKind: 'Fights', shelf: 'Boxing',
      /* THE FIGHT FOOTAGE (499 audit): its Watch link is violent media, so under 13 (or of no known age) the row goes without it. */
      subject: 'Physical Education', division: divisionOf_(f.division), row: f.video && !viewerOfAge_(FIGHT_VIDEO_AGE) ? Object.assign({}, f, { video: '' }) : f,
      year: (f.date || '').slice(0, 4),
    })),

    /* ---------- THE QUESTIONS, AND NOT THE DOCUMENTS THEY CAME OUT OF § */
    /* ---------- THE PRACTICALS § */
    ...(DATA.practicals || []).map(p => ({
      kind: 'practical', name: p.name, key: 'pr:' + p.id,
      sub: [p.subject, p.required ? 'Required practical' : 'Extra',
            p.minutes ? p.minutes + ' min' : ''].filter(Boolean).join(' · '),
      image: '',
      subject: p.subject, topics: p.topics, level: p.level,
      /* IN THE CARD'S SPELLING, as `projectType` is on a project: the facet reads this, so its answer,
         its chip and the card's tag say `Experiment` and never the file's `experiment`. */
      practicalType: PRAC_TYPE[p.practicalType] || p.practicalType || '',
      examBoard: p.board, company: p.board,
      /* WHAT YOU HAVE TO HAVE IN FRONT OF YOU, in the column that already means that. A practical
         needing a lab is the same kind of fact as a question needing a compass, and `needsOf_`
         already reads `needs` as a comma-list. */
      needs: [p.venue === 'lab' ? 'Lab' : '', p.feasible === 'needs a lab' ? 'Lab' : '']
             .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      /* EVERY WORD OF THE GUIDE, so the thing you are looking for is what you can search by. § */
      text: practicalText_(p) + ' ' + topicAtoms_(p.topics).join(' '),
      row: p,
    })),

    /* ---------- THE PROJECTS § */
    ...(DATA.projects || []).map(p => ({
      kind: 'project', name: p.name, key: 'pj:' + p.id,
      sub: [p.subject, p.sessions ? p.sessions + ' sessions' : ''].filter(Boolean).join(' · '),
      image: '',
      subject: p.subject, topics: p.topics, level: p.level,
      /* ---------- PROJECT OR COURSEWORK, ASKED ONCE `Projects` IS CHOSEN § */
      projectType: projType_(p),
      /* A BOARD WHERE THE ROW NAMES ONE, in the column a practical's board already fills -- so a second coursework under another board is told apart by the Exam board § */
      examBoard: p.board || '',
      text: projectText_(p) + ' ' + topicAtoms_(p.topics).join(' '),
      row: p,
    })),

    /* ---------- THE CONTENT CARDS: ONE ITEM PER CHAPTER OF data/textbooks.json § */
    ...[].concat(...(DATA.textbooks || []).map(b => (b.chapters || []).map(c => contentItem_(b, c)))),

    /* ---------- THE EXAM INSERTS (455) */
    ...(DATA.inserts || []).map(insertItem_),

    /* ---------- THE HISTORY DATABASE (459) */
    ...(typeof HIST_DB === 'undefined' ? [] : HIST_DB).flatMap(t => (DATA[t.file] || []).flatMap(r => histItems_(t.kind, r))),
    ...histTimelines_(),

    /* ---------- THE BIBLE, FOR AN ADMIN AND NOBODY ELSE § */
    ...bibleItems_(),

    /* ---------- THE TALMUD (473), once its index has come */
    ...(typeof talmudItems_ === 'function' ? talmudItems_() : []),

    /* ---------- THE QURAN (490), one item a verse, once its index has come */
    ...(typeof quranItems_ === 'function' ? quranItems_() : []),
    ...(typeof hadithItems_ === 'function' ? hadithItems_() : []),
    ...(typeof worksItems_ === 'function' ? worksItems_() : []),
    ...(typeof textsItems_ === 'function' ? textsItems_() : []),
    ...(typeof pdtextsItems_ === 'function' ? pdtextsItems_() : []),
    ...(typeof orthoItems_ === 'function' ? orthoItems_() : []),
    ...(typeof hymnsItems_ === 'function' ? hymnsItems_() : []),

    /* ---------- `DATA.films` WAS MAPPED HERE, ONE ITEM PER FILM OR SERIES, AND IS NOT ANY MORE § */

    ...questionItems(),
  ];
}

/* THE YEAR OF A THING, from the column or from the wave. § */
/* `topicOf_` — WHAT THE QUESTION IS ABOUT, WHICH THE FUNNEL HAD NEVER ASKED. § */
/* A COMMA IS A LIST SEPARATOR AND NOTHING ELSE IS. Same shape as `keystage`'s split, kept as a
   helper because two places need it and the second is the search haystack. */
const topicAtoms_ = v => String(v == null ? '' : v).split(',').map(s => s.trim()).filter(Boolean);

/* ---------- THE VOTE MOVED, AND IT NOW APPLIES TO EVERY QUESTION § */
/* Whether this item's topic is shown in the funnel at all — see `topicArea WAS HERE` among the
   facets. A practical or a project is ABOUT its topic by construction, so it answers. */
/* AND NO QUESTION AT ALL NOW, the 1st Class Maths sheets included. § */
function topicShown_(x) {
  return !x || x.kind !== 'question';
}
function topicOf_(x) {
  return topicAtoms_(x && ((x.row && x.row.topics) || x.topics));
}

/* ---------- THE TOPIC TREE WAS READ HERE § */

/* WHAT LEVEL A THING IS TAUGHT AT, FROM WHICHEVER OF THE TWO COLUMNS HAS IT. § */
function levelOf_(x) {
  const band = (x && x.bandType === 'stage' && x.bandValue) ? String(x.bandValue) : '';
  const own  = band || String((x && x.level) || (x && x.row && x.row.level) || '').trim()
            || ksFallback_(x);
  if (!own) return '';
  /* ---------- ONLY THE ONE THE GENERAL RULE CANNOT DO § */
  if (/^as(\s*-?\s*level)?$/i.test(own)) return 'AS';
  /* ---------- `KS2 SATs` IS TWO FACTS, AND THE LEVEL IS ONE OF THEM § */
  if (/^ks\s*[12](\s*sats)?$/i.test(own)) return 'SATs';
  return own;
}

/* ---------- WHICH KEY STAGE A SATs ROW IS, AND ONLY A SATs ROW § */
function satsStagesOf_(x) {
  const yr = (x && x.bandType === 'year') ? Number(x.bandValue) : NaN;
  if (yr >= 1 && yr <= 6) return [yr <= 2 ? 'KS1' : 'KS2'];
  const named = /\bks\s*([12])\b/i.exec(String((x && x.bandType === 'stage' && x.bandValue)
    || (x && x.level) || (x && x.row && x.row.level) || ''));
  if (named) return ['KS' + named[1]];
  const out = [];
  keyStagesOf_(x).forEach(k => {
    const m = /^ks\s*([12])$/i.exec(k);
    if (m && out.indexOf('KS' + m[1]) < 0) out.push('KS' + m[1]);
  });
  return out.sort();
}
/* THE LEVEL AND, INSIDE SATs, THE KEY STAGE BESIDE IT -- `['SATs', 'KS2']`, `['GCSE']` -- for the places that SAY a level rather than filter by it: § */
function levelSaid_(x) {
  const lv = levelOf_(x);
  if (!lv) return [];
  return lv === 'SATs' ? [lv].concat(satsStagesOf_(x)) : [lv];
}

/* ---------- A KEY STAGE, SAID AS THE QUALIFICATION AT THE END OF IT § */
function ksLevel_(k) {
  const q = { ks1: 'SATs', ks2: 'SATs', ks3: 'KS3', ks4: 'GCSE', ks5: 'A-Level' }[spellKey_(k)];
  return q || String(k || '');
}
/* The `key_stage` cell as a list — `KS3, KS4` is two key stages, as the facet has always read it. */
function keyStagesOf_(x) {
  return String((x && x.keystage) || '').split(',').map(s => s.trim()).filter(Boolean);
}
/* ---------- WHERE A ROW HAS NO LEVEL, ITS KEY STAGE SAYS ONE § */
function ksFallback_(x) {
  const yr = (x && x.bandType === 'year') ? Number(x.bandValue) : NaN;
  if (yr >= 1 && yr <= 11) return yr <= 6 ? 'SATs' : yr <= 9 ? 'KS3' : 'GCSE';
  const ks = keyStagesOf_(x).filter(k => /^ks[1-5]$/i.test(k)).sort();
  return ks.length ? ksLevel_(ks[ks.length - 1]) : '';
}

function yearOf(x) {
  const own = String((x && x.year) || '').trim();

  /* ---------- THE COLUMN HOLDS DATES, NOT YEARS § */
  const inOwn = own.match(/\b(19|20)\d{2}\b/);
  if (inOwn) return inOwn[0];

  /* A short label that is not a date and not a year — "Spec", "Sample" — is somebody being
     deliberate, so it is kept. Anything long enough to be a sentence is not a year, and passing it
     through is what produced the mess above. */
  if (own && own.length <= 9 && !/\s/.test(own)) return own;

  const m = String((x && x.examWave) || '').match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '';
}

/* THE NAME OF AN EXAM SERIES, FROM THE MONTH IT SAT IN. § */
function seriesOf_(m) {
  /* `MONTH_NAMES` FROM data.js — this file had TWO private copies of the twelve months and games.js
     had a third until somebody deleted it with a note saying why. One list, one place. */
  const MONTH = MONTH_NAMES;
  const n = Number(m);
  if (!isFinite(n) || n < 1 || n > 12) return '';
  if (n >= 5 && n <= 7) return SERIES_SUMMER;
  if (n >= 10 && n <= 12) return SERIES_AUTUMN;
  return MONTH[n - 1];
}

/* THE TWO SEASON WORDS ARE CONSTANTS BECAUSE TWO OTHER PLACES HAVE TO AGREE WITH THEM, and a word spelled out in three files is the fault this whole file is § */
const SERIES_SUMMER = 'Summer';
const SERIES_AUTUMN = 'Autumn';
const SERIES_AT = { Summer: 6, Autumn: 11 };

/* THE WAVE OF A THING, AS A HUMAN WOULD SAY IT. § */
function waveOf(x) {
  const raw = String((x && x.examWave) || '').trim();
  if (!raw) return waveFromDoc_(x);

  const MONTH = MONTH_NAMES;

  /* ---------- A PHASE WORD IS A THIRD SPELLING OF THE SAME THING § */
  const phase = raw.match(/^(first|second|third)\s+wave$/i);
  if (phase) {
    const mth = Number((x && x.month) || (x && x.row && x.row.month) || 0);
    const yr  = yearOf(x);
    const series = seriesOf_(mth) || (/^first$/i.test(phase[1]) ? SERIES_SUMMER : SERIES_AUTUMN);
    return yr ? series + ' ' + yr : raw;
  }

  /* ALREADY A SITTING. "June 2024", "Nov 2023" — somebody typed what they meant. */
  const said = raw.match(/^([A-Za-z]{3,9})\s+((?:19|20)\d{2})$/);
  if (said) {
    const i = MONTH.findIndex(m => m.toLowerCase().startsWith(said[1].toLowerCase().slice(0, 3)));
    return i < 0 ? raw : seriesOf_(i + 1) + ' ' + said[2];
  }

  /* A DATE THAT CAME THROUGH AS TEXT. § */
  const long = raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b[^]*?\b((?:19|20)\d{2})\b/);
  if (long) {
    const i = MONTH.findIndex(m => m.slice(0, 3) === long[1]);
    return i < 0 ? long[2] : seriesOf_(i + 1) + ' ' + long[2];
  }

  const iso = raw.match(/\b((?:19|20)\d{2})-(\d{2})-\d{2}\b/);
  if (iso) {
    return seriesOf_(parseInt(iso[2], 10)) + ' ' + iso[1];
  }

  /* Nothing recognisable but a year in it somewhere — better than the whole string. */
  const bare = raw.match(/\b(19|20)\d{2}\b/);
  return bare ? bare[0] : raw;
}

/* ---------- A PAST PAPER WITH NO SITTING OF ITS OWN TAKES ITS PAPER'S § */
function waveFromDoc_(x) {
  const r = (x && x.row) || x || {};
  const type = String((x && x.documentType) || r.document_type || '').toLowerCase();
  if (type !== 'past paper') return '';
  const doc = docById_(paperIdOf_(r)) || {};
  /* AND THE NAME, WHICH IS WHAT THE COVER PRINTS. § */
  const named = /\s[\u2014\u2013]\s([A-Za-z]{3,9})\s+((?:19|20)\d{2})\s*$/.exec(String(doc.name || r.name || ''));
  const fromName = named ? MONTH_NAMES.findIndex(m => m.toLowerCase().startsWith(named[1].toLowerCase().slice(0, 3))) + 1 : 0;
  const mth = Number((x && x.month) || r.month || doc.month || 0) || fromName;
  const yr = yearOf(x) || String(doc.year || '').trim() || (named ? named[2] : '');
  /* A YEAR WITH NO MONTH IS NOT A SITTING, and it is refused rather than returned bare: § */
  const series = seriesOf_(mth);
  return series && /^(19|20)\d{2}$/.test(yr) ? series + ' ' + yr : '';
}

/* ---------- THE MONTH OF A SITTING, FOR THE `Month` QUESTION § */
const SITTING_MONTH = new WeakMap();
function sittingMonth_(x) {
  if (!x || typeof x !== 'object') return '';
  if (SITTING_MONTH.has(x)) return SITTING_MONTH.get(x);
  let out = '';
  if (sittingOf_(x).year) {
    const r = x.row || x;
    const doc = docById_(paperIdOf_(r)) || {};
    const ofDate = v => { const m = /\b(?:19|20)\d{2}-(\d{2})-\d{2}\b/.exec(String(v || '')); return m ? Number(m[1]) : 0; };
    const ofWord = v => {
      const i = MONTH_NAMES.findIndex(n => n.slice(0, 3).toLowerCase() === String(v || '').slice(0, 3).toLowerCase());
      return i < 0 ? 0 : i + 1;
    };
    const ofName = v => {
      const m = /\s[\u2014\u2013]\s(?:\d{1,2}\s+)?([A-Za-z]{3,9})\s+(?:19|20)\d{2}\s*$/.exec(String(v || ''));
      return m ? ofWord(m[1]) : 0;
    };
    const ofWave = v => {
      const m = /^([A-Za-z]{3,9})\s+(?:19|20)\d{2}$/.exec(String(v || '').trim());
      return m ? ofWord(m[1]) : ofDate(v);
    };
    const n = ofName(doc.name || r.name || x.sub) || Number(r.month || x.month || 0)
      || ofDate(r.exam_date || x.examDate) || Number(doc.month || 0) || ofDate(doc.exam_date)
      || ofWave(x.examWave);
    out = n >= 1 && n <= 12 ? MONTH_NAMES[n - 1] : '';
  }
  SITTING_MONTH.set(x, out);
  return out;
}

/* ---------- THE SITTING IN ITS TWO HALVES, FOR THE TWO QUESTIONS THAT ASK THEM § */
const SITTING_MEMO = new WeakMap();
function sittingOf_(x) {
  if (!x || typeof x !== 'object') return { series: '', year: '' };
  const had = SITTING_MEMO.get(x);
  if (had) return had;
  const w = String(waveOf(x) || '').trim();
  const m = /^(.*\S)\s+((?:19|20)\d{2})$/.exec(w);
  const out = m ? { series: m[1], year: m[2] }
    : /^(19|20)\d{2}$/.test(w) ? { series: '', year: w }
    : { series: w, year: '' };
  SITTING_MEMO.set(x, out);
  return out;
}

/* THE SERIES IN THE ORDER THEY COME IN A YEAR, not the alphabet: § */
function seriesCmp_(a, b) {
  const at = v => SERIES_AT[v] !== undefined ? SERIES_AT[v]
    : MONTH_NAMES.indexOf(v) >= 0 ? MONTH_NAMES.indexOf(v) + 1 : 99;
  return (at(a) - at(b)) || cmpText(a, b);
}

/* Numeric-aware, so Grade 2 comes before Grade 10. Plain alphabetical put Grade 10 first, and that
   reads as the list being unsorted rather than sorted by a rule nobody wanted. */
const cmpText = (a, b) =>
  String(a).localeCompare(String(b), 'en', { sensitivity: 'base', numeric: true });

/* `sortsWorthOffering` was here — which orders were worth putting in the dropdown, given what was
   actually on screen. The dropdown is gone, so the question is gone with it. */


/* NO HEADINGS AT ALL, and no grouping behind them. § */

/* Every word must appear SOMEWHERE — so "maths 7" finds a Grade 7 Maths topic without the two words having to sit next to each other. § */
/* ---------- THE HAYSTACK IS BUILT ONCE PER ITEM, NOT ONCE PER KEYSTROKE § */
function stuffHay_(x) {
  /* and the item's own tags (365): "june 2024 foundation paper 1" and "edexcel higher 2019" found nothing, the tier, board and level being on no word searched */
  return x._hay || (x._hay = norm([x.name, x.sub, x.subject, x.slot,
                                   x.grade && 'grade ' + x.grade, x.text, x.tier, x.examBoard || x.company, x.documentType,
                                   x.row && x.row.level].filter(Boolean).join(' ')));
}

function stuffFind(items, credits) {
  /* ALREADY IN ORDER — see `stuffSorted_`. Filtering keeps it, so nothing below re-sorts. */
  let out = stuffSorted_(items);

  /* THE TWO RULES, in four lines. Filters are grouped by field, and an item must satisfy at least
     one from EVERY group — `some` within a field, `every` across them, which is exactly what
     "either / both" means written out. */
  /* ---------- A SKIPPED QUESTION IS ASKED AND ANSWERED "ANY" § */
  out = stuffNarrow_(out, STUFF.filters, stuffWords_(STUFF.q), credits);

  /* ONE KEY, then the name to settle ties. § */
  /* BY NAME, AND ONLY BY NAME. § */
  /* ---------- QUESTIONS SORT WITH THEIR PAPER, AND NUMERICALLY § */
  /* ---------- ONE STRING PER ITEM, BUILT ONCE, COMPARED WITH `<` § */
  /* THE CARDS A SEARCH NAMES, FIRST — see the note over `sortKey_`. Their own order kept, and the rest's. */
  const words = stuffWords_(STUFF.q);
  if (words.length) {
    const named = x => x.kind === 'content' && (() => {
      const hay = norm([x.name, (x.row && x.row.topics) || x.topics].filter(Boolean).join(" "));
      return words.every(w => hay.indexOf(w) !== -1);
    })();
    const lead = out.filter(named);
    if (lead.length) out = lead.concat(out.filter(x => !named(x)));
  }
  return out;
}
/* THE NARROWING ITSELF, split out of `stuffFind` so `stuffFiltered` can run it over the list it already has rather than over the whole library — see the note § */
/* "paper 2" is one word to look for: as two, the 2 was found in every Q2 and every 2024 of every paper */
const stuffWords_ = q => norm(q).replace(/\bpaper\s+(?=\d)/g, 'paper\u0000').split(/\s+/).filter(Boolean).map(w => w.replace('\u0000', ' '));
function stuffNarrow_(out, filters, words, credits) {
  const byField = {};
  filters.forEach(f => {
    if (f.any) return;
    (byField[f.field] = byField[f.field] || []).push(f);
  });
  Object.keys(byField).forEach(field => {
    const list = byField[field];
    out = out.filter(x => list.some(f => filterHit(x, f, credits)));
  });
  /* ---------- "q8", "8ii", "1dii", "1d(ii)", "Q 8" IS A QUESTION, NOT FOUR LETTERS § */
  const ref = words.length ? qRef_(words.join('')) : null;
  if (ref) out = out.filter(x => qRefHit_(x, ref));
  /* AN ITEM THAT STANDS FOR OTHERS IS ASKED ABOUT THEM. § */
  else if (words.length) out = out.filter(x => x.holds ? x.holds(words) : words.every(w => stuffHay_(x).includes(w)));
  return out;
}

/* WHAT A REFERENCE LOOKS LIKE: § */
const QREF_PART = /^([a-z]?)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/;
function qRef_(s) {
  const m = /^(q?)0*(\d+)(.*)$/.exec(String(s || '').toLowerCase().replace(/\s+/g, ''));
  if (!m) return null;
  const rest = partBare_(m[3]);
  const bits = qRefBits_(rest);
  if (!bits) return null;
  if (!m[1] && !/i/.test(bits.roman)) return null;
  return { q: m[2], letter: bits.letter, roman: bits.roman };
}
/* ONE READING OF A PART FOR BOTH SIDES, so "8i" typed and a part "i" stored are read the same way --
   a lone numeral is a numeral, as `qPartBits_` already says of the sheet's spelling. */
function qRefBits_(s) {
  if (!s) return { letter: '', roman: '' };
  if (ROMAN_ONLY.test(s)) return { letter: '', roman: s };
  const m = QREF_PART.exec(s);
  return m ? { letter: m[1] || '', roman: m[2] || '' } : null;
}
function qRefHit_(x, ref) {
  if (!x || x.kind !== 'question') return false;
  if (String(x.qNumber == null ? '' : x.qNumber).replace(/^0+(?=\d)/, '') !== ref.q) return false;
  const b = qRefBits_(partBare_(x.qPart)) || { letter: '', roman: '' };
  if (ref.letter && b.letter !== ref.letter) return false;
  if (ref.roman && b.roman !== ref.roman) return false;
  return true;
}

/* ---------- SORTED ONCE, NOT ONCE PER FILTER § */
const SORTED_ITEMS = new WeakMap();
function stuffSorted_(items) {
  let out = SORTED_ITEMS.get(items);
  if (out) return out;
  out = items.slice().sort((a, b) => {
    const ka = a._sk || (a._sk = sortKey_(a)), kb = b._sk || (b._sk = sortKey_(b));
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  SORTED_ITEMS.set(items, out);
  return out;
}

/* PADDED SO THE ALPHABET AGREES WITH ARITHMETIC. § */
/* ---------- AND THE PAPER ITSELF STRAIGHT AFTER ITS NAME, THEN THE PART BY `qPartKey` § */
/* ---------- CONTENT CARDS AFTER THE REST, IN THE ORDER THEY TEACH — AND FIRST ONLY WHEN THEY ARE ASKED FOR § */
const sortKey_ = x => [
  x.kind === 'content' ? '2' + String((x.row && x.row.bookId) || '') + '\u0000' + padNums_(String((x.row && x.row.n) || 0)) : '1',
  padNums_(String(x.sub || x.name || '').toLowerCase()),
  x.kind === 'question' ? String(paperIdOf_(x.row) || '').toLowerCase() : '',
  padNums_(String(x.qNumber == null ? '' : x.qNumber)),
  x.qPartKey != null ? x.qPartKey : String(x.qPart || '').toLowerCase(),
  padNums_(String(x.name || '').toLowerCase()),
].join('\u0000');

const padNums_ = s => s.replace(/\d+/g, d => ('00000000' + d).slice(-8));

/* How many cards to a page. § */
/* `STUFF_PER_PAGE` was 8 — how many cards went on a page. There is one thing to a page now, so
   there is no number to hold. See `stuffPerPage`. */

/* THE FILTERED LIST, held between calls. § */
let FIND_MEMO = { key: null, from: null, items: null, total: 0 };

function stuffFiltered() {
  /* KEYED ON THE PAYLOAD ITSELF, by object identity, not on `DATA.version`. § */
  /* NO ROLE IN THE KEY, for the reason `itemMemoKey_` gives: nothing below filters by one. */
  const key = JSON.stringify([STUFF.q, STUFF.filters, USER ? USER.credits : -1]);
  /* ---------- AND WHICH LIST, BECAUSE THERE ARE TWO § */
  const all = stuffItems();
  if (FIND_MEMO.key === key && FIND_MEMO.from === DATA && FIND_MEMO.all === all) return FIND_MEMO.items;
  const credits = USER ? (USER.credits || 0) : 0;
  /* ---------- A TAP ONLY EVER NARROWS, SO IT NARROWS WHAT IS ALREADY HERE § */
  const prev = FIND_MEMO;
  const words = stuffWords_(STUFF.q);
  let items = null;
  if (prev.key !== null && prev.from === DATA && prev.all === all && prev.credits === credits
      && prev.filters && prev.words
      && prev.filters.length <= STUFF.filters.length
      && prev.words.every(w => words.some(n => n.includes(w)))
      /* A QUESTION REFERENCE IS NOT A WORD, so "q8" is not a narrowing of "q" -- see `qRef_`. */
      && !qRef_(words.join('')) && !qRef_(prev.words.join(''))) {
    const same = prev.filters.every((f, i) => JSON.stringify(f) === JSON.stringify(STUFF.filters[i]));
    const had = {};
    prev.filters.forEach(f => { if (!f.any) had[f.field] = true; });
    const added = STUFF.filters.slice(prev.filters.length);
    if (same && added.every(f => f.any || !had[f.field])) {
      items = stuffNarrow_(prev.items, added, words, credits);
    }
  }
  if (!items) items = stuffFind(all, credits);
  FIND_MEMO = { key: key, from: DATA, items: items, total: all.length, all: all, credits: credits,
                words: words,
                filters: STUFF.filters.map(f => Object.assign({}, f)) };
  return items;
}

/* ---------- THE PAGES, WHICH ARE NOT THE SAME LIST AS THE RESULTS § */
let STUFF_PAGES = { from: null, pages: [] };
function stuffPages_() {
  const items = stuffFiltered();
  if (STUFF_PAGES.from === items) return STUFF_PAGES.pages;
  const pages = [];
  /* EACH RESULT IS TOLD THE ONE IN FRONT OF IT, so a shared stem is drawn once, before the first of
     its parts, as the paper prints it -- see `pageParts_`. */
  /* AND A PART FOUND ON ITS OWN BRINGS ITS WHOLE QUESTION -- see `wholeQuestions_`. § */
  const seq = wholeQuestions_(items);
  /* A PAGE IS KEPT WHEN ITS OWN TAGS AGREE WITH THE CHIPS (396): a chip on a facet with a page reader (`tagOf`) keeps
     the pages carrying it — `Answers` the answer pages, `Questions` the rest. */
  const byPage = (STUFF.filters || []).filter(f => f && !f.any && (facetBy(f.field) || {}).tagOf);
  const kept = (x, part) => byPage.every(f => {
    let v = [];
    try { v = asList_(facetBy(f.field).tagOf(x, part)); } catch (e) { v = []; }
    return !v.length || v.some(t => spellKey_(t) === spellKey_(f.value));
  });
  seq.forEach((x, i) => {
    /* A CARD WHOSE WORDS ARE STILL IN THE LEDGER (397) IS ONE PAGE, kept whatever the chips say: its shape is decided by its
       words, so it is drawn waiting (`slim`) and the column drawn again when they come (`libLanded_`). */
    if (libSlim_(x)) { pages.push({ x: x, part: null, slim: true }); return; }
    pageParts_(x, seq[i - 1]).forEach(part => {
      if (kept(x, part)) pages.push({ x: x, part: part });
    });
  });
  STUFF_PAGES = { from: items, pages: pages, gen: LIB.gen };
  return pages;
}

/* THE ANSWERS WERE ASKED FOR — a chip on the answer pages' own tag — so they are drawn open (`ansOpen_`). */
function answersAsked_() {
  return (STUFF.filters || []).some(f => f && f.field === 'kindLabel' && !f.any && spellKey_(f.value) === spellKey_(ansKind_()));
}

/* ---------- THE LAST LINE UNDER A CHOSEN PAPER COUNTS WHAT THE STRIP HOLDS § */
/* ---------- YOUR RESULT (463): the owner, "attempted / unattempted, correct / incorrect" ---------- */
/* The latest press per question, the account's and this device's (`progressPresses_`), read once per change: a press (`subRecord_`) or a payload bumps it. */
const MY_RESULT = { gen: 0, key: null, from: null, map: null };
function myResults_() {
  const who = typeof whoIs_ === 'function' ? whoIs_() : '';
  if (!who) return null;
  const key = who + '|' + MY_RESULT.gen;
  if (MY_RESULT.key === key && MY_RESULT.from === (DATA && DATA.submissions)) return MY_RESULT.map;
  const map = new Map();
  try { (typeof progressPresses_ === 'function' ? progressPresses_() : []).forEach(p => map.set(p.key, p.v)); } catch (e) {}
  MY_RESULT.key = key; MY_RESULT.from = DATA && DATA.submissions; MY_RESULT.map = map;
  return map;
}
/* ATTEMPTED IS EVERY PRESS; a marked one also says how it went, as Progress scores it (`progressScore_`). */
function myResultOf_(x) {
  if (!x || x.kind !== 'question') return '';
  const map = myResults_();
  if (!map) return '';
  const k = String(x.key || x.name || '');
  if (!map.has(k)) return 'Unattempted';
  const sc = typeof progressScore_ === 'function' ? progressScore_(map.get(k)) : null;
  if (!sc) return 'Attempted';
  return ['Attempted', sc.got >= sc.of ? 'Correct' : sc.got <= 0 ? 'Incorrect' : 'Part marks'];
}
/* A PRESS CHANGES IT AT ONCE: every finder forgets what it found, and the tags on the pressed question's own page are said again. */
function myResultNew_(k) {
  MY_RESULT.gen++;
  try { finderForgetFound_(); } catch (e) {}
  try {
    const x = stuffItemsAll_().find(i => i && i.kind === 'question' && ansKey_(i) === k);
    if (!x) return;
    const tags = asList_(myResultOf_(x)).map(v => `<span class="qtag"${tagAttr_('myResult')} data-f="myResult">${esc(v)}</span>`).join('');
    document.querySelectorAll('[data-k]').forEach(b => {
      if (b.getAttribute('data-k') !== k) return;
      const pg = b.closest('.page');
      (pg ? pg.querySelectorAll('.qcard-tags') : []).forEach(row => {
        row.querySelectorAll('[data-f="myResult"]').forEach(t => t.remove());
        row.insertAdjacentHTML('beforeend', tags);
      });
    });
  } catch (e) { /* the tag is right on the next draw */ }
}
/* A QUESTION'S TWO VERIFIED TAGS (388). Accuracy is a stored claim; Function is read off the row by qtypes.js. */
function verifyTags_(x) {
  if (!x || x.kind !== 'question' || !x.row) return { accuracy: '', fn: '' };
  let fn = false;
  /* WORDS STILL IN THE LEDGER (397): the file's `function_verified`, worked out from the whole row when it was split off. */
  if (libWaits_(x.row)) fn = libTrue(x.row.function_verified);
  else try { fn = !qtIncomplete_(x.row).length && qtMachine_(x.row); } catch (e) { fn = false; }
  return { accuracy: libTrue(x.row.verified) ? 'Accuracy verified' : 'Accuracy unverified',
           fn: fn ? 'Function verified' : 'Function unverified' };
}


/* ---------- A SEARCH HIT ON ONE PART BRINGS THE REST OF ITS QUESTION, IN ORDER § */
const qId_ = x => (x && x.kind === 'question' && x.qNumber != null && String(x.qNumber) !== ''
  ? paperIdOf_(x.row) + '|' + x.qNumber : '');
const WHOLE_MEMO = new WeakMap();
function questionParts_() {
  const all = stuffSorted_(stuffItems());
  let by = WHOLE_MEMO.get(all);
  if (by) return by;
  by = {};
  all.forEach(x => { const k = qId_(x); if (k) (by[k] = by[k] || []).push(x); });
  WHOLE_MEMO.set(all, by);
  return by;
}
function wholeQuestions_(items) {
  const out = [], done = {};
  let by = null;
  (items || []).forEach(x => {
    const k = qId_(x);
    if (!k) { out.push(x); return; }
    by = by || questionParts_();
    const sib = by[k] || [];
    /* A RESULT THE FUNNEL'S LIST DOES NOT HOLD (a harness's own item) stands as itself. */
    if (sib.indexOf(x) < 0) { out.push(x); return; }
    if (done[k]) return;
    done[k] = true;
    sib.forEach(s => out.push(s));
  });
  return out;
}

/* THE PAGE AN ITEM STARTS ON, counted from the first result. § */
function stuffPageOf_(x, part) {
  const i = stuffPages_().findIndex(pg => pg.x === x && (pg.part || null) === (part || null));
  return i < 0 ? 0 : i;
}

/* ---------- AND BACK ONTO THE CARD YOU WERE ON WHEN THE LIST UNDER IT CHANGES § */
const stuffPageId_ = pg => (pg && pg.x ? String(pg.x.key || pg.x.name || '') + '\u0000' + (pg.part || '') : '');
const stuffAsk_ = () => JSON.stringify([S_(STUFF.q), STUFF.filters || []]);
function stuffHeld_() {
  try {
    const host = $('s-' + FINDER.id);
    const el = host && host.querySelectorAll(':scope > .page')[domIndex_(FINDER.id, PAGE[FINDER.id] || 0)];
    const at = el && el.dataset.filled === '1' && el.FIND_AT;
    return at && at.ask === stuffAsk_() ? at.id : '';
  } catch (e) { return ''; }
}
function stuffBackTo_(id, keep) {
  if (!id) return;
  const pages = stuffPages_();
  /* STILL WHERE IT WAS — the commonest case by far (a star, the same list again), and one comparison
     rather than a walk over a list that can be thousands of pages long. */
  if (stuffPageId_(pages[(PAGE[FINDER.id] || 0) - keep]) === id) return;
  const i = pages.findIndex(pg => stuffPageId_(pg) === id);
  if (i >= 0) PAGE[FINDER.id] = keep + i;
}

/* ---------- THE COLLECTION WENT, AND WHAT IT KNEW IS IN THE FACET LIST § */


/* ARE WE LOOKING AT WIDGETS AND NOTHING ELSE? § */
const showingWidgets = () => {
  const items = stuffFiltered();
  return items.length > 0 && items.every(x => x.kind === 'tool' || x.kind === 'game');
};

/* ONE THING TO A PAGE, ALWAYS. § */
const stuffPerPage = () => 1;

/* HOW MANY PAGES, WITHOUT BUILDING ANY OF THEM. § */
/** HAS ANYBODY ASKED FOR ANYTHING YET? A search typed, or a filter pressed. Until one of those,
    this screen is a question and not a list. */
function stuffAsked() {
  return !!(S_(STUFF.q).trim() || STUFF.filters.length);
}
const S_ = v => String(v == null ? '' : v);

/* ---------- WHERE THE RESULTS START § */
/* ---------- IS THE FUNNEL ASKING ABOUT BOOKING? § */
/* ONE SESSION, OPENED OUT — and it is the receipt and nothing else now, with every action on its foot. § */
/* ---------- "THE PAPER, AND NOTHING ELSE" WAS TRUE WHILE SOMETHING ELSE ADDED THE TILES § */
/* ---------- AND THE TILES ARE ON THE PAPER NOW, NOT UNDER IT § */
/* ---------- AND THE WAY IN, FOR SOMEBODY NOT ON IT, IS IN THE SAME ROW § */
function jobPage_(j) {
  const stage = typeof jobStage_ === 'function' ? jobStage_(j) : '';
  const yes = typeof jobAccepted_ === 'function' ? jobAccepted_(j) : false;
  const admin = typeof isAdmin === 'function' && isAdmin();
  const tiles = (typeof jobTiles_ === 'function' ? jobTiles_({ row: j }) : '')
    /* ---------- AND SHARE, WHICH THE FORM HAD AND THE BOOKING ITSELF DID NOT § */
    + tile_({ icon: 'share', label: 'Share this booking', act: 'book-share' })
    + (typeof suggestTile_ === 'function' && j && j.id ? suggestTile_('session', String(j.id), 'Booking') : '')
    + (admin && typeof jobAdminTiles_ === 'function' ? jobAdminTiles_(j, stage, yes) : '');
  /* THE REQUEST'S STANDING, one paragraph under the row (488). */
  const said = typeof requestSaid_ === 'function' ? requestSaid_(j) : '';
  const foot = (tiles.trim() ? tileRow_(tiles, 'rc-tiles') : '')
    + (said ? '<p class="note rc-request" role="status">' + esc(said) + '</p>' : '');
  return typeof jobReceipt === 'function' ? jobReceipt(j, foot) : '';
}

const forIs_ = want => (STUFF.filters || [])
  .some(f => f.field === 'forLabel' && norm(f.value) === want);

/* ---------- `goFor_` WAS HERE, AND IT WAS NAVIGATING TO ANSWERS THAT NO LONGER EXIST § */

function bookingPages_(o) {
  /* ---------- THE COLUMN ASKS FOR IT DIRECTLY § */
  if (!(o && o.column) && !forIs_('booking')) return [];
  /* ---------- THE FORM IS THE ANSWER TO `Booking`, NOT TO EVERYTHING UNDER IT § */
  /* ---------- AND THE COLUMN IS EXEMPT FROM THIS TOO, WHICH IT WAS NOT § */
  const narrowed = (STUFF.filters || []).some(f => f.field === 'kindLabel');
  if (!(o && o.column) && narrowed) return [];
  /* ---------- NOT BEFORE THE PAYLOAD § */
  if (typeof USER !== 'undefined' && USER && typeof awaiting_ === 'function' && awaiting_()) return [loading_()];
  const form = (typeof bookBlocks === 'function' ? bookBlocks() : []).filter(Boolean);
  /* ---------- THE BASKET IS NOT HERE ANY MORE, AND IT WAS HERE FOR ONE GOOD REASON § */
  return form;
}

/* ---------- THE FEED, BEHIND ITS OWN ANSWER § */
function feedPages_() {
  if (!forIs_('posts')) return [];
  return (typeof postsBlocks === 'function' ? postsBlocks() : []).filter(Boolean);
}

/* ---------- `youPages_` WAS HERE AND LASTED ONE VERSION § */

/* ---------- SIGNING IN AND OUT, ON A PAGE OF ITS OWN § */
/* ---------- WHICH ROW IS YOU, ASKED IN ONE PLACE § */
function mineIs_(t) {
  /* ---------- AND A STRANGER HAS NO ROW, WHICH THIS DID NOT HAVE TO KNOW BEFORE § */
  if (typeof USER === 'undefined' || !USER) return false;
  /* ---------- AN ID ON BOTH SIDES DECIDES, AND THE NAME IS ONLY FOR A ROW WITHOUT ONE § */
  if (t && USER.personId && t.personId) return String(t.personId) === String(USER.personId);
  return !!t && (
    (USER.handle && t.handle && norm(t.handle) === norm(USER.handle)) ||
    (USER.name && t.title && norm(t.title) === norm(USER.name)) ||
    (USER.name && t.name && norm(t.name) === norm(USER.name)));
}

/* ---------- YOUR OWN ROW, WHEREVER IT COMES FROM § */
function myCardRow_() {
  return (DATA.tutors || []).filter(mineIs_)[0] || {
    /* ---------- THE HANDLE IS PRINTED UNDER THE NAME, SO IT IS NOT SAID IN IT TOO § */
    title: nameBesideHandle_(USER.name, USER.handle) || 'Signed in',
    role:  roleOf(USER.role || 'student'),
    handle: USER.handle,
    /* YOUR PICTURE AS THE PICKER LAST KEPT IT (`USER.profile.photo`, written by `pfpTake_`), else the sign-in reply's. § */
    image: (USER.profile && typeof USER.profile.photo === 'string') ? USER.profile.photo : (USER.image || USER.photo || ''),
    avatar: USER.avatar || '',
    rate:  USER.rate,
    teaches: [],
    personId: USER.personId,
    /* ---------- `dbs` IS DELIBERATELY ABSENT HERE, AND ABSENT IS NOT `false` § */
  };
}

/* `col` IS THE PEOPLE COLUMN (453): 'tutors', 'students' or 'parents' — a card per person you may already see, by category. */
function accountPages_(col) {
  if (!col) return ['tutors', 'students', 'parents'].reduce((a, c) => a.concat(accountPages_(c)), []);
  if (!USER) return [];
  const myRow = myCardRow_();

  /* ---------- AN ITEM, NOT A ROW, AND THAT IS WHY THE MESSAGE TILE WAS MISSING § */
  /* `account: true` IS WHERE A CARD CAN BE EDITED, and `col` which column: a people column, and nowhere else the same person is drawn. */
  const asItem_ = (t, kind) => ({
    kind: kind || 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
    cost: priced_(t.rate), off: t.listed === false, row: t, account: true, col: col,
    more: typeof peopleTiles_ === 'function' ? peopleTiles_(t) : '',
  });

  /* ---------- A CARD OPEN FOR EDITING IS ITS OWN FORM, IN ITS OWN PLACE § */
  const editing_ = t => typeof cardEditing_ === 'function' && cardEditing_(t, col);
  /* AN ADMIN'S PERSON FORM (373, me.js) TAKES THE CARD'S PLACE the same way, in the column it was opened on. */
  const personForm_ = t => typeof personFormFor_ === 'function' ? personFormFor_(t, col) : '';
  const card_ = t => typeof findCard === 'function' ? findCard({ kind: 'tutor', row: t }) : '';
  const withTiles_ = t => personForm_(t) || (editing_(t) ? cardEditHtml_(t)
    : card_(t) + (typeof cardTiles_ === 'function' ? cardTiles_(asItem_(t)) : ''));

  /* ---------- YOUR FAMILY ---------- */
  /* `sibling` ON *"students should be able to see their parents and siblings likewise"*. § */
  const famLabel_ = { parent: 'Your parent', child: 'Your child', sibling: 'Your brother or sister' };
  const famMine = !!(USER.personId && DATA.familyFor && String(DATA.familyFor) === String(USER.personId));
  const family = (famMine && Array.isArray(DATA.family) ? DATA.family : [])
    .filter(f => f && f.personId && f.title && famLabel_[f.relation]
      && !(USER.personId && String(f.personId) === String(USER.personId)));
  const famCard_ = f => {
    const asTutor = (DATA.tutors || []).find(t => t && t.personId && String(t.personId) === String(f.personId));
    const row = Object.assign({}, asTutor || {}, {
      title: f.title, handle: f.handle || (asTutor || {}).handle, personId: f.personId,
      image: f.image || (asTutor || {}).image || '',
      /* AND THE FIGURE THAT CAME WITH THE FACE — `doGet` sends `avatar` on a family card only when the face is `pfp:avatar` (`faceFig_`). */
      avatar: f.image ? f.avatar : (asTutor || {}).avatar,
      role: famLabel_[f.relation] + (asTutor ? ' · ' + (asTutor.role || 'Tutor') : ''),
    });
    /* A CHILD'S PHOTOGRAPHED WORKING (501), to the parent they accepted; staff see it on the admin's list below. */
    const more = (f.relation === 'child' && typeof workSeeTile_ === 'function' ? workSeeTile_(f.personId) : '')
      + (typeof peopleTiles_ === 'function' ? peopleTiles_(row) : '');
    return personMark_(f.personId, personForm_(row) || card_(row) + (more ? tileRow_(more, 'person-tiles') : ''));
  };
  /* A CHILD OR A BROTHER OR SISTER IS A STUDENT; A PARENT IS A PARENT. A family member who teaches is on Tutors as well. */
  const famIn = c => family.filter(f => (f.relation === 'parent' ? 'parents' : 'students') === c);
  const famIds = family.map(f => String(f.personId));

  /* ---------- AND FOR AN ADMIN, EVERYBODY ELSE AS WELL, by their main role (`doGet` sends no tutor or admin here) ---------- */
  const everyone = (typeof isAdmin === 'function' && isAdmin() && Array.isArray(DATA.everyone) ? DATA.everyone : [])
    .filter(p => p && p.title && !mineIs_(p) && !(p.personId && famIds.indexOf(String(p.personId)) !== -1))
    .filter(p => (/student/i.test(String(p.role || '')) ? 'students' : 'parents') === col)
    /* A BLANK HANDLE IS SAID, NOT FILLED WITH THE FIRST NAME. § */
    .map(p => Object.assign({}, p, { activity: subsLine_(p.personId),
                                     role: (p.role || 'Client') + (p.handle ? '' : ' · no handle yet') }))
    /* AND "NEW PIN" BESIDE "MESSAGE" — the admin is who a child with no email and no linked parent goes to. § */
    /* THROUGH `tileRow_`, which puts six tiles on even lines rather than leaving one alone (453: Parents is narrower company). */
    /* A PERSON'S ROW STANDS ALONE (498): the list's layout row was joined onto the last person's, so one client "has loads of tile options". */
    .map(p => personMark_(p.personId, personForm_(p) || card_(p)
      + (typeof tile_ === 'function' ? tileRow_(tile_({ icon: 'chat',
          label: 'Message', note: 'a note to them', act: 'msg-open',
          data: { to: p.title, id: p.personId || '' } }) + (p.personId ? tile_({ icon: 'key',
          label: 'New PIN', note: 'to sign in with', act: 'kid-pin',
          data: { id: p.personId, name: String(p.title || '').split(' ')[0] } }) : '')
          + (col === 'students' && typeof workSeeTile_ === 'function' ? workSeeTile_(p.personId) : '')
          + (typeof peopleTiles_ === 'function' ? peopleTiles_(p) : ''), 'person-tiles') : '')));

  /* ---------- YOUR OWN CARD, FIRST IN EVERY COLUMN YOU BELONG TO, ITS EDIT THAT FACE'S (`ownCardSections_(col)`) ---------- */
  const mine = [];
  if (typeof peopleBelong_ === 'function' && peopleBelong_(col, family)) {
    const row = col === 'tutors' ? (cardMine_() || myRow) : myRow;
    /* NEVER AN EDITOR HERE (464): your own card is edited on your role's settings column (`ownCardSetPage_`, me.js). */
    const face = row !== myRow ? card_(row) : (typeof meCard === 'function' ? meCard(row) : card_(row));
    /* SHARE MY PROFILE (400): their own `?tutor=` link, to send a family — on the tutor face. */
    const share = col === 'tutors' && rankAtLeast_('staff') && USER.handle
      ? tile_({ icon: 'share', label: 'Share my profile', note: 'your link', act: 'tutor-share', data: { handle: USER.handle } }) : '';
    /* SHARE only: Edit is on your settings column (464); Sign out and Send the link again on Student settings (453). */
    /* AND REPORT (486): everything has one, your own card too. */
    const tiles = share + (typeof suggestTile_ === 'function' ? suggestTile_('person', String(USER.personId), row.title || '') : '');
    mine.push(personMark_(USER.personId, face + (tiles ? tileRow_(tiles, 'own-tiles', true) : '')));
  }

  const coming = typeof awaiting_ === 'function' && awaiting_() ? [loading_()] : [];
  /* "+ ADD A …", the very first card for an admin (373, 440), the new person's role ticked for this column. */
  const add = typeof peopleAddPage_ === 'function' ? [peopleAddPage_(col)].filter(Boolean) : [];
  const fam = famIn(col).map(famCard_);
  let out;
  if (col === 'tutors') {
    /* THE DIRECTORY EVERYBODY SIGNED IN READS, less you (your card is above). */
    const others = (DATA.tutors || []).filter(t => t && t.title && !mineIs_(t)).map(t => personMark_(t.personId, withTiles_(t)));
    /* EACH LIST A CARD OF ITS OWN (465): the admin's layout tiles go on the list, not on each person. */
    out = cardMark_('ppl:tutors:add', add).concat(cardMark_('ppl:tutors:dir', mine.concat(others)));
  } else if (col === 'students') {
    /* FIND BY HANDLE ON TOP (442), then you, your brothers, sisters and children, then MANAGE YOUR CHILD (339) — the owner:
       "each user can edit their student people in student column". */
    const search = typeof peopleSearchPage_ === 'function' ? [peopleSearchPage_()].filter(Boolean) : [];
    const manage = typeof mayAddChild_ === 'function' && mayAddChild_() && typeof childManageCard_ === 'function' ? [childManageCard_()] : [];
    /* NEEDS HELP (455) ABOVE ALL, for Staff — help.js `HELP_COL` names this column. */
    const help = typeof helpListCard_ === 'function' ? [helpListCard_()].filter(Boolean) : [];
    out = cardMark_('ppl:students:help', help).concat(cardMark_('ppl:students:add', add), cardMark_('ppl:students:search', search),
      cardMark_('ppl:students:family', mine.concat(fam)), cardMark_('ppl:students:manage', manage), cardMark_('ppl:students:all', everyone));
  } else {
    /* A PARENT'S CLAIM ("X says they are your parent") is answered here, by the child. */
    const claims = (famMine && Array.isArray(DATA.claims) && typeof claimCard_ === 'function')
      ? DATA.claims.filter(c => c && c.rowIndex && c.from).map(claimCard_) : [];
    out = cardMark_('ppl:parents:add', add).concat(cardMark_('ppl:parents:you', mine), cardMark_('ppl:parents:claims', claims),
      cardMark_('ppl:parents:family', fam), cardMark_('ppl:parents:all', everyone));
  }
  return out.concat(coming);
}

/* ---------- HOW A LEARNER IS GETTING ON, IN ONE LINE UNDER THEIR NAME § */
function subsLine_(pid) {
  try {
    const a = DATA && DATA.submissions;
    if (!pid || !a || !a.people || !USER || String(a.for || '') !== String(USER.personId || '')) return '';
    const p = a.people[String(pid)];
    if (!p || !(Number(p.n) > 0)) return '';
    const last = subDayText_(p.last);
    return Number(p.n) + (Number(p.n) === 1 ? ' question' : ' questions') + (last ? ' · last ' + last : '');
  } catch (e) { return ''; }
}
/* `4 Oct`, and the year only when it is not this one -- a day from last October that read like this
   October's would be wrong by a year in the one place a date is the whole message. */
function subDayText_(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return '';
  const names = typeof MONTH_NAMES !== 'undefined' ? MONTH_NAMES : [];
  const mon = String(names[+m[2] - 1] || m[2]).slice(0, 3);
  return (+m[3]) + ' ' + mon + (+m[1] !== new Date().getFullYear() ? ' ' + m[1] : '');
}

/* THE PEOPLE COLUMNS (453); `peoplePages_` (me.js) adds the signed-out card and the empty one. Student settings is `studentSetPages_`. */
screen('tutors', () => pages('tutors', typeof cardsOf_ === 'function' ? cardsOf_('tutors') : peoplePages_('tutors')));
screen('students', () => pages('students', typeof cardsOf_ === 'function' ? cardsOf_('students') : peoplePages_('students')));
screen('parents', () => pages('parents', typeof cardsOf_ === 'function' ? cardsOf_('parents') : peoplePages_('parents')));

/** Everything spliced between the question and the results, whichever answer is showing. */
/* THE BUNDLE IS THE LAST OF THEM — see `bundlePages_`. § */
/* THE BOUND FINDER'S, since there are two (`FINDERS`): § */
function frontPages_() {
  return FINDER.front();
}

/* A BUNDLE — THE PAPERS ON THE SCREEN, AS ONE THING YOU CAN ORDER. § */
const BUNDLE_MIN = 2;
const BUNDLE_MAX = 24;
const BUNDLE_STRAY = 0.1;

/* HOW MANY QUESTIONS EACH PAPER HAS, OVER THE SAME LIST THE FUNNEL FILTERS. § */
const PAPER_QUESTIONS = new WeakMap();
function paperQuestionCounts_() {
  const all = stuffItems();
  let m = PAPER_QUESTIONS.get(all);
  if (m) return m;
  m = {};
  all.forEach(x => {
    if (!x || x.kind !== 'question') return;
    const id = String(paperIdOf_(x.row || x) || '');
    if (id) m[id] = (m[id] || 0) + 1;
  });
  PAPER_QUESTIONS.set(all, m);
  return m;
}

/* A DOCUMENT ROW BY ITS ID, off the file rather than the mapped list — `libDocRows_`'s own note says why: § */
const DOC_BY_ID = new WeakMap();
function docById_(id) {
  const rows = libDocRows_();
  let m = DOC_BY_ID.get(rows);
  if (!m) {
    m = {};
    rows.forEach(r => {
      if (!libIsDoc_(r)) return;
      const k = String(paperIdOf_(r) || '');
      if (k && !m[k]) m[k] = r;
    });
    DOC_BY_ID.set(rows, m);
  }
  return m[String(id)] || null;
}

/* A TYPE, IN THE PLURAL, for a title naming several of them. `5-a-day` is already a count noun. */
const typePlural_ = t => /(s|day)$/i.test(String(t)) ? String(t) : String(t) + 's';

/* ---------- WHAT THE BUNDLE IS CALLED, BUILT FROM THE CHIPS AND THE DATA § */
const BUNDLE_TITLE_FIELDS = ['examBoard', 'company', 'subject', 'level', 'keystage', 'yearGroup',
                             'bandValue', 'tier', 'documentType', 'sitting', 'examYear',
                             'examMonth'];
/* `sitting` IS NOT A FUNNEL QUESTION ANY MORE — the funnel asks the year and then the month — and it is still the right TITLE word: § */
const SITTING_READER_ = { field: 'sitting', label: 'Sitting', of: x => {
  const m = sittingMonth_(x), y = sittingOf_(x).year;
  return m && y ? m + ' ' + y : waveOf(x);
} };
function bundleTitle_(items) {
  const parts = [];
  const said = {};
  BUNDLE_TITLE_FIELDS.forEach(field => {
    /* `if (field === 'keystage' && said.level) return;` WAS HERE. § */
    /* THE YEAR ONLY WHERE THE SITTING DID NOT SAY IT. § */
    if ((field === 'examMonth' || field === 'examYear') && said.sitting) return;
    const n = parts.length;
    try { titlePart_(field); } finally { if (parts.length > n) said[field] = true; }
  });
  /* THE SEARCH, IN QUOTES, UNLESS THE TITLE ALREADY SAYS IT — `… · 2017 · “2017”` is the year
     twice, and the search is only there to say what the chips cannot. */
  const q = String(STUFF.q || '').trim();
  if (q && !norm(parts.join(' ')).includes(norm(q))) parts.push('“' + q + '”');
  return parts.join(' · ');

  function titlePart_(field) {
    const facet = field === 'sitting' ? SITTING_READER_ : facetBy(field);
    if (!facet) return;
    let t = null;
    try { t = facetTally_(items, facet); } catch (e) { t = null; }
    const vals = (t && t.values) || [];
    if (vals.length === 1 && t.coverage >= 1) {
      const w = String(vals[0].show || vals[0].value || '');
      if (w) parts.push(field === 'documentType' ? typePlural_(w) : w);
      return;
    }
    /* THE LAST CHIP ON THE FIELD, because a bucket refined by a later answer is that answer. */
    const chip = (STUFF.filters || []).slice().reverse().find(f => f.field === field && !f.any);
    if (chip) parts.push(String(chipShow_(chip)));
  }
}

/* PAPERS, WORKSHEETS OR DOCUMENTS — whatever every one of them is. */
function bundleNoun_(papers, n) {
  const types = papers.map(p => String(p.type || '').toLowerCase());
  const one = types.every(t => /paper/.test(t)) ? 'paper'
    : types.every(t => t === 'worksheet') ? 'worksheet' : 'document';
  return n + ' ' + one + (n === 1 ? '' : 's');
}

const BUNDLE_MEMO = new WeakMap();
function bundleOf_() {
  if (!stuffAsked() || !printOffered_()) return null;
  const items = stuffFiltered();
  if (BUNDLE_MEMO.has(items)) return BUNDLE_MEMO.get(items);
  let out = null;
  try { out = bundleBuild_(items); } catch (e) { out = null; }
  BUNDLE_MEMO.set(items, out);
  return out;
}

/* ---------- ONE FLOOR, READ BY BOTH GATES § */
function bundleBuild_(items) {
  if (!items.length) return null;
  const floor = BUNDLE_MIN;
  /* ---------- WHICH PAPERS ARE WHOLE ON THIS LIST, AND WHAT IS LEFT OVER § */
  const count = {};
  const first = {};
  const order = [];
  let other = 0;
  for (const x of items) {
    const id = x && x.kind === 'question' ? String(paperIdOf_(x.row || x) || '') : '';
    if (!id) { other++; continue; }
    if (!count[id]) { count[id] = 0; order.push(id); first[id] = x; }
    count[id]++;
  }
  const whole = paperQuestionCounts_();
  const kept = order.filter(id => count[id] === whole[id]);
  if (kept.length < floor || kept.length > BUNDLE_MAX) return null;
  const partial = order.filter(id => count[id] !== whole[id]);
  const strayQs = partial.reduce((n, id) => n + count[id], 0);
  if (strayQs + other > items.length * BUNDLE_STRAY) return null;

  /* ---------- IN THE ORDER THEY WERE SAT § */
  const int_ = v => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
  const sortKey = id => {
    const d = docById_(id) || (first[id] && first[id].row) || {};
    return [int_(d.year), int_(d.month), int_(d.paper), String(paperLabel_(id))];
  };
  kept.sort((a, b) => {
    const ka = sortKey(a), kb = sortKey(b);
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] < kb[i]) return -1;
      if (ka[i] > kb[i]) return 1;
    }
    return 0;
  });

  /* ---------- AND GROUPED BY SITTING WHEN THERE IS MORE THAN ONE § */
  const sitOf = id => {
    try { return String(SITTING_READER_.of(first[id]) || ''); } catch (e) { return ''; }
  };
  const tierOf = id => String((docById_(id) || {}).tier || '').trim();
  const sits = kept.map(sitOf);
  const tiers = kept.map(tierOf);
  const bySit = sits.every(Boolean) && new Set(sits).size >= 2;
  const byTier = tiers.every(Boolean) && new Set(tiers.map(spellKey_)).size >= 2;
  const grouped = bySit || byTier;
  const groupOf = i => [bySit ? sits[i] : '', byTier ? tiers[i] : ''].filter(Boolean).join(' · ');

  /* THE SHORTEST NAME THAT IS STILL UNIQUE — among the whole bundle when it is one list, among its own group when it is grouped. § */
  const shortIn = ids => shortLabels_(ids.map(id => ({ value: id, text: paperLabel_(id) })));
  const label = {};
  const groupAt = {};
  const groups = [];
  if (grouped) {
    kept.forEach((id, i) => {
      const s = groupOf(i);
      groupAt[id] = s;
      let g = groups.find(x => x.group === s);
      if (!g) groups.push(g = { group: s, ids: [] });
      g.ids.push(id);
    });
    groups.forEach(g => shortIn(g.ids).forEach(v => { label[v.value] = v.show || v.text; }));
  } else {
    shortIn(kept).forEach(v => { label[v.value] = v.show || v.text; });
  }

  /* `group` IS WHAT THE CARD PRINTS OVER A PAPER, and `short` is the two together — the name that is unique inside the bundle and nowhere else, which is what the § */
  const papers = kept.map(id => {
    const doc = docById_(id) || {};
    const g = groupAt[id] || '';
    const l = String(label[id] || id);
    return { id: id, label: l, name: paperLabel_(id), group: g, short: (g ? g + ' · ' : '') + l,
             pages: Number(doc.pages) || 0, ok: canPrint_(doc), type: doc.document_type || '' };
  });
  const printable = papers.filter(p => p.ok);
  if (printable.length < floor) return null;

  /* THE TITLE IS WRITTEN FROM THE BUNDLE'S OWN QUESTIONS, not the whole list — a stray from a June
     2019 paper would otherwise stop the sitting and the year from being one thing each. */
  const inBundle = items.filter(x => x && x.kind === 'question'
    && count[String(paperIdOf_(x.row || x) || '')] === whole[String(paperIdOf_(x.row || x) || '')]);
  return { papers: papers, printable: printable, ids: printable.map(p => p.id), grouped: grouped,
           title: bundleTitle_(inBundle), noun: bundleNoun_(printable, printable.length),
           stray: { questions: strayQs, other: other, papers: partial.map(id => paperLabel_(id)) } };
}

/* WHETHER EVERY PAPER IN IT IS ALREADY A LINE IN THE BASKET — the tile fills when it is, exactly as
   the trolley on a shop card does. */
const bundleInCart_ = b => !!b && b.ids.every(id =>
  (typeof CART !== 'undefined' ? CART : []).some(c => c.kind === 'print' && String(c.key) === id));

/* WHAT IT COSTS, SAID HONESTLY. A paper with no page count is not free and is not guessed at. */
function bundlePriceLine_(b) {
  const priced = b.printable.filter(p => printPrice(p.pages) !== null);
  const pages = priced.reduce((n, p) => n + p.pages, 0);
  const cash = priced.reduce((n, p) => n + printPrice(p.pages), 0);
  const left = b.printable.length - priced.length;
  if (!priced.length) return 'Priced when it is sent — no page counts yet';
  if (!left) return pages + ' pages · ' + money(cash);
  return money(cash) + ' for ' + priced.length + ' · ' + left + ' priced when sent';
}

/* WHAT IS ON THE LIST AND NOT IN THE BUNDLE, in one sentence — see the note above `BUNDLE_MIN`. § */
function bundleStrayLine_(b) {
  const s = b.stray || {};
  const bits = [];
  if (s.questions) {
    const named = (s.papers || []).slice(0, 3).join(', ');
    const more = (s.papers || []).length - 3;
    bits.push(s.questions + ' question' + (s.questions === 1 ? '' : 's') + ' from '
      + named + (more > 0 ? ' and ' + more + ' more' : ''));
  }
  if (s.other) bits.push(s.other + ' thing' + (s.other === 1 ? '' : 's') + ' that ' + (s.other === 1 ? 'is' : 'are')
    + ' not a paper');
  return bits.length ? 'Also on this list and not in the bundle: ' + bits.join('; ') + '.' : '';
}

/* WHAT A BUNDLE CARD'S TAG ROW IS ASKED OF: § */
const BUNDLE_ITEM = { kind: 'bundle', kindLabel: 'Bundles' };
function bundleCard_(b) {
  const inCart = bundleInCart_(b);
  const off = b.papers.filter(p => !p.ok);
  const note = b.noun + ' · ' + bundlePriceLine_(b);
  const pp = p => p.pages ? ` <span class="mono faint">${p.pages}pp</span>` : '';
  /* ONE LINE PER GROUP WHEN IT IS GROUPED — a sitting, a tier, or both — one per paper when it is
     not. Numbered either way: the count down the edge is how many LINES, and the title already says
     how many papers. */
  const list = b.grouped
    ? (() => {
        const groups = [];
        b.printable.forEach(p => {
          let g = groups.find(x => x.group === p.group);
          if (!g) groups.push(g = { group: p.group, papers: [] });
          g.papers.push(p);
        });
        return groups.map(g => `<li><span class="bundle-when">${esc(g.group)}</span> ${
          g.papers.map(p => `<span class="bundle-name">${esc(p.label)}</span>${pp(p)}`)
            .join('<span class="faint"> · </span>')}</li>`).join('');
      })()
    : b.printable.map(p => `<li><span class="bundle-name">${esc(p.label)}</span>${pp(p)}</li>`).join('');
  const stray = bundleStrayLine_(b);
  /* ---------- THE QUESTION CARD'S HEADER, BECAUSE IT IS THE SAME FAMILY § */
  return `<div class="card bundle qcard">
      ${tagRow_(BUNDLE_ITEM)}
      <h3 class="bundle-title">${esc(b.title || 'These papers')}</h3>
      <p class="bundle-sub">Printed and sent &middot; ${esc(b.noun)} &middot; ${esc(bundlePriceLine_(b))}</p>
      <ol class="bundle-list">${list}</ol>
      ${/* NAMED, NOT DROPPED. A paper the library marks `printable: FALSE` is on the list above the card and missing from the bundle, and a card that said "these papers" § */
            ''}
      ${off.length ? `<p class="bundle-off">Not in the bundle, marked not printable: ${
        off.map(p => esc(p.label)).join(', ')}</p>` : ''}
      ${stray ? `<p class="bundle-off">${esc(stray)}</p>` : ''}
    </div>
    <div class="tile-row">${tile_({ icon: 'cart',
        label: inCart ? 'In your basket' : 'Add bundle to basket', note: note,
        act: 'cart-add', on: inCart, off: inCart,
        data: { kind: 'bundle', ids: b.ids.join(','), key: b.title || '' } })}${
      tile_({ icon: 'open', label: 'See your basket', act: 'cart-open' })}${
      typeof suggestTile_ === 'function' ? suggestTile_('bundle', 'b:' + String(b.ids[0] || 'x').replace(/[^A-Za-z0-9_.:-]/g, '') + ':' + b.ids.length, b.title || 'Bundle') : ''}</div>`;
}


/* THE ONE BUNDLE A LIST OF WHOLE PAPERS OFFERS, in front of its questions. `Bundles` is not a kind to ask for (396). */
function bundlePages_() {
  const b = bundleOf_();
  return b ? [bundleCard_(b)] : [];
}

/* WHICH PAGE THE QUESTION IS ON. Saved things sit in front of it and their number changes with a
   star, so this is asked rather than assumed — off the id on the page itself. */
function stuffQuestionPage_() {
  const el = $(FINDER.id + '-controls');
  const page = el && el.closest('.page');
  if (!page || !page.parentNode) return 0;
  return [].indexOf.call(page.parentNode.children, page);
}

function stuffFirstResult_() {
  /* PAST THE BOOKING PAGES TOO. § */
  /* THE BASKET IS NOT COUNTED ANY MORE — it moved to the Booking column. See `bookingPages_`.
     NOR ARE THE SAVED PAGES — they are the Saved column now. See the note in `paintStuff`. */
  return stuffQuestionPage_() + 1 + frontPages_().length;
}

function stuffPageCount() {
  /* ---------- NOTHING IS LISTED UNTIL SOMEBODY NARROWS § */
  /* ZERO, NOT ONE. This is how many pages of RESULTS there are, and it is added to the question page rather than including it — `stuffPages` is § */
  if (!stuffAsked()) return 0;
  /* PAGES, NOT RESULTS — a practical is four of them. See `stuffPages_`. */
  const n = stuffPages_().length;
  /* AND ZERO AGAIN WHEN A SEARCH FINDS NOTHING. § */
  return n ? Math.ceil(n / stuffPerPage()) : 0;
}

/* ONE PAGE'S MARKUP, built when it is needed and not before. § */
function stuffPageHtml(n) {
  const items = stuffFiltered();
  const credits = USER ? (USER.credits || 0) : 0;

  /* `stuffNoneHtml_`: the same empty answer as the question's, and the way to the other finder. */
  if (!items.length) return stuffNoneHtml_();

  /* Cards, in order, and nothing between them. § */
  /* A WHOLE SCREEN EACH. The widget's own markup rather than a card standing in for it — the
     card was only ever a door, and there is nothing behind that door which could not be here. */
  if (showingWidgets()) {
    const wgt = items[n] && items[n].row;
    /* A SOLID WIDGET SAYS SO ON THE PAGE, so the stylesheet can turn the glass off underneath it
       without knowing which widget it is. */
    return wgt ? `<div class="widget-full${wgt.solid ? ' solid' : ''}">${wgt.html}</div>` : '';
  }

  /* ONE PAGE IS ONE ENTRY OF `stuffPages_`, which is the results with each practical expanded into its four parts. § */
  const pg = stuffPages_()[n];
  if (!pg) return '';
  /* COUNTED BEFORE ITS WORDS CAME (397): waiting, whether or not they have come since — the column is drawn again for them. */
  /* ONE TILE ROW PER THING (489, 495): a Find page is a card, its star row and Back to top -- joined like every other screen's pages (`rowsOne_`). */
  if (pg.slim) return rowsOne_(libWaitHtml_(pg.x) + findTopRow_());
  return rowsOne_((pg.part ? stuffPart_(pg.x, pg.part) : stuffCard(pg.x, credits)) + findTopRow_());
}
/* BACK TO TOP (463): the owner, "a button to scroll back to the top of the finder when they're at the bottom" -- under every result, so it is at the bottom of a long one. */
const findTopRow_ = () => `<div class="tile-row find-top">${tile_({ icon: 'up', label: 'Back to top', note: 'the first page of this finder', act: 'find-top' })}</div>`;
on('find-top', el => {
  const F = finderAt_(el);
  if (!F) return;
  inFinder_(F, () => goPage(F.id, 0));
});

/* One card. Lifted out of the list so the pager and anything else can build one without rebuilding
   all four hundred around it. */
/* THE CARD FOR A THING, whatever kind it is. § */
/* FAVOURITES. ONE STAR FOR EVERY KIND, and that is only possible because every item in this list already carries a `key` — a tutor is `t.title`, a widget is § */
let FAVS = (() => {
  try { return new Set(JSON.parse(localStorage.getItem('favs') || '[]')); }
  catch (e) { return new Set(); }
})();

/* AND WHAT THE SHEET SAYS, once a payload has arrived. § */
function adoptFavourites_() {
  if (!DATA || !DATA.favourites) return;
  FAVS = new Set(DATA.favourites.map(String));
  favsMerged_();
  try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) {}
}

/* A STAR ON A WIDGET THAT WAS FOLDED INTO ANOTHER (441) lands on the one it went into, with that game chosen — the choice set once per device, so a later pick stands. */
const FAV_MERGED = { 'w:flabby': ['w:console', 'cs-game', 'flabby'], 'w:racer': ['w:console', 'cs-game', 'racer'],
  'w:wordsearch': ['w:wordgames', 'wg-game', 'ws'], 'w:scramble': ['w:wordgames', 'wg-game', 'ss'],
  'w:tables': ['w:wordgames', 'wg-game', 'tt'], 'w:chess': ['w:boardgames', 'bg-game', 'chess'], 'w:maze': ['w:boardgames', 'bg-game', 'maze'] };
function favsMerged_() {
  Object.keys(FAV_MERGED).forEach(old => {
    if (!FAVS.has(old)) return;
    const [to, store, k] = FAV_MERGED[old];
    FAVS.delete(old); FAVS.add(to);
    try { if (!localStorage.getItem('merged:' + old)) { localStorage.setItem('merged:' + old, '1'); localStorage.setItem(store, k); } } catch (e) {}
  });
}
favsMerged_();
const isFav = k => FAVS.has(String(k));

function toggleFav(k, kind) {
  const key = String(k);
  if (FAVS.has(key)) FAVS.delete(key); else FAVS.add(key);
  try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) {}
  /* SAVED QUIETLY. A star is not worth a toast or a spinner — and if the save fails the star is
     still right on this device, which is the part that matters in the moment. */
  if (USER) {
    /* ---------- `saveProfile` DOES NOT EXIST, AND NEVER HAS § */
    /* THE KEY IS NOT SPLITTABLE, so it is not split. § */
    /* ---------- AND IT WAS STILL CALLING `send` WITH TWO ARGUMENTS § */
    send({
      action: 'favourite',
      name: USER.name, personId: (USER && USER.personId) || '',
      kind: kind || 'item', itemId: key,
      on: FAVS.has(key) ? 'TRUE' : '',
    }).catch(err => {
      /* PUT THE STAR BACK. `.catch(() => {})` was the other half of the disguise: § */
      if (FAVS.has(key)) FAVS.delete(key); else FAVS.add(key);
      try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) {}
      if (typeof repaint === 'function') { try { repaint(); } catch (e) {} }
      toast(String((err && err.message) || 'That did not save'));
    });
  }
}

on('fav', el => {
  toggleFav(el.getAttribute('data-key'), el.getAttribute('data-kind'));
  /* THE ONE CARD, not the whole list. Redrawing the page would lose the scroll position, and
     somebody starring their way down a list of ninety would be thrown back to the top each time. */
  /* THE WRAPPER, WHICH IS WHAT THE STYLE READS. § */
  const on = isFav(el.getAttribute('data-key'));
  const wrap = el.closest('.favwrap');
  if (wrap) wrap.classList.toggle('is-fav', on);
  /* THE TILE'S OWN LABEL, not a glyph — the same correction `on('spot')` needed when it was still
     writing ✦ over a control that had become two spans. */
  tileSet_(el, { label: on ? 'Saved' : 'Save', on: on });

  /* ---------- AND THE PAGES IN FRONT OF THE QUESTION § */
  /* STAY ON THE CARD YOU STARRED. A star adds or removes a page in front of the question, so the
     index shifts — `paintStuff` moves it by exactly that much rather than sending you to the top. */

  /* ---------- AND EVERY OTHER COLUMN THAT LISTS WHAT IS KEPT § */
  markStale_(TABS.map(t => t.id).filter(id => id !== AT));
  if (AT === 'saved') { repaint(true); return; }
  /* EITHER FINDER, whichever is in front — a star on a boxer is pressed in the second one. */
  const F = finderOf_(AT);
  if (F && $('s-' + F.id)) paintFinder_(F.id, true);
});

/* A SHOP ITEM'S TAGS (499), every one from a field the row already has: what it is, how you get it, a price band, the brand, who it is for. */
const SHOP_HOW = { buy: 'Buy', ticks: 'Earn with ticks', level: 'Unlock by level', loan: 'Borrow', issued: 'Given out' };
const SHOP_KIND_SAY = { bundle: 'Bundle', game: 'Game', kit: 'Kit', equipment: 'Equipment', stationery: 'Stationery', consumable: 'Consumable',
                        service: 'Made to order', thing: 'Thing', trip: 'Trip' };
function shopTags_(r) {
  const k = String(r.kindRaw || 'thing').trim().toLowerCase();
  const how = String(r.acquire || 'buy').trim().toLowerCase();
  const p = priced_(r.price), pence = String(r.unit || '').trim() === 'p';
  const band = how === 'level' ? 'Level ' + (Number(r.level) || 1)
    : p === undefined ? 'Not priced yet' : p === 0 ? 'Free'
    : !pence ? 'Credits'
    : p < 500 ? 'Under £5' : p <= 2000 ? '£5 to £20' : 'Over £20';
  const who = String(r.audience || 'all').trim().toLowerCase();
  return { shopKind: SHOP_KIND_SAY[k] || (k.charAt(0).toUpperCase() + k.slice(1)), shopHow: SHOP_HOW[how] || '', shopPrice: band,
           shopBrand: String((r.fields && r.fields.brand) || r.brand || '').trim(),
           shopFor: who === 'all' ? '' : who === 'tutor' ? 'Tutors' : who === 'admin' ? 'Admins' : who.charAt(0).toUpperCase() + who.slice(1) };
}

/* THE TAGS ARE THE TITLE (499): "the tags are titles" — a card's name heading goes when every word of it is a tag on
   the row; the name stays its accessible name. One rule for every kind. */
const TITLE_WORDS_ = t => String(t).replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').toLowerCase().split(/[^a-z0-9\u00c0-\uffff]+/).filter(Boolean);
function tagsAreTitle_(x, html) {
  if (!x || !x.name || typeof html !== 'string') return html;
  const h = /<h3>([\s\S]*?)<\/h3>/.exec(html);
  const named = out => (/^\s*<div class="[^"]*\bcard\b[^"]*"[^>]*\baria-label=/.test(out) ? out
    : out.replace(/<div class="([^"]*\bcard\b[^"]*)"/, (m, c) => `<div class="${c}" role="group" aria-label="${esc(x.name)}"`));
  /* A CARD THAT NEVER HAD A HEADING (a verse, a daf, a bout) is named the same way. */
  if (!h) return /qtag/.test(html) ? named(html) : html;
  if (TITLE_WORDS_(h[1]).join(' ') !== TITLE_WORDS_(esc(x.name)).join(' ')) return html;
  const tags = new Set();
  html.replace(/<span class="qtag"[^>]*>([\s\S]*?)<\/span>/g, (m, t) => { TITLE_WORDS_(t).forEach(w => tags.add(w)); return m; });
  const words = TITLE_WORDS_(h[1]);
  if (!words.length || !words.every(w => tags.has(w))) return html;
  return named(html.replace(h[0], '').replace(/<div class="fc-head">\s*<\/div>/, ''));
}

function stuffCard(x, credits) {
  /* ITS WORDS ARE STILL IN THE LEDGER (397): its title and tags, waiting — and asked for, wherever it is drawn. */
  if (libSlim_(x)) { libWant_(x); return libWaitHtml_(x); }
  /* `credits` is passed IN rather than read from `USER` here, because the page works it out once and hands it to every card — reading it per card would be the same § */
  /* A kind with no card of its own falls back to the shared one — a new row type appears on the
     screen as SOMETHING rather than as nothing, which is the failure that is easy to miss. */
  const html = tagsAreTitle_(x, (kindOf_(x).card || thingCard_)(x, credits));
  if (!x.key) return html;
  /* THE STAR IS NOT HERE ANY MORE — it is the first tile in the action row, drawn by `favTile_` inside `cardTiles_`, which every card builder already calls. § */
  const out = `<div class="favwrap${isFav(x.key) ? ' is-fav' : ''}">${html}</div>${cardTiles_(x)}`;
  /* A HISTORY CARD'S LINKS AND ITS STAR ON ONE LINE (498): "they don't even appear on the same line". */
  return x.hdb && typeof tileRowsJoin_ === 'function' ? tileRowsJoin_(out) : out;
}

/* WHAT A CHIP READS: the words its button said (`facetShort_`), memoised per finder. */
let CHIP_SHOW = { key: null, from: null, out: {} };   /* a `let`: one per finder, see `inFinder_` */
function chipShow_(f, i) {
  const facet = facetBy(f.field);
  if (!facet) return f.value;
  const say = facetSay_(facet, f.value);
  /* THE WORDS ITS BUTTON SAID (396): shortened against the answers it was chosen from, and only a name with a shorter form is looked up. */
  if (typeof i !== 'number' || nameForms_(say).length < 2) return say;
  const key = JSON.stringify([STUFF.q || '', STUFF.filters.slice(0, i + 1)]);
  if (CHIP_SHOW.from !== DATA) { CHIP_SHOW.from = DATA; CHIP_SHOW.out = {}; }
  if (key in CHIP_SHOW.out) return CHIP_SHOW.out[key];
  let show = '';
  try {
    const before = STUFF.filters.slice(0, i).filter(g => g.field !== f.field);
    const credits = USER ? (USER.credits || 0) : 0;
    show = facetShort_(facet, f.value, stuffNarrow_(stuffItems(), before, stuffWords_(STUFF.q), credits));
  } catch (e) { show = ''; }
  return (CHIP_SHOW.out[key] = show || say);
}

/* ---------- WHAT KIND OF TAG THIS IS, WHICH IS ITS COLOUR § */
const TAG_OF = {
  /* WHICH ONE: the paper, and inside it the question, part, sub-part and page -- all red, because each names one thing of several as `Paper 1` does. § */
  paperId: 'paper', fiveDay: 'paper',
  qNumber: 'paper', qPart: 'paper', qSub: 'paper', qPage: 'paper', qPages: 'paper', marks: 'paper',
  subject: 'subject',
  level: 'level', keystage: 'level', yearGroup: 'level', bandValue: 'level', fiveLevel: 'level',
  examMonth: 'sitting', examYear: 'sitting', fiveMonth: 'sitting', decade: 'sitting',
  documentType: 'type', practicalType: 'type', boxKind: 'type', projectType: 'type', boutMethod: 'type', boutWinner: 'topic', boutEvent: 'board',
  fighter: 'topic', boutMonth: 'sitting', boutYear: 'sitting', boutRound: 'paper',
  examBoard: 'board', company: 'board',
  tier: 'tier', division: 'tier',
  topic: 'topic',
  needs: 'needs',
  /* WHAT IT IS AND WHERE IT IS KEPT (396): the first questions, a colour of their own. */
  forLabel: 'kind', kindLabel: 'kind', shelf: 'kind',
  /* THE HISTORY DATABASE'S (459), in colours that already mean the same. */
  histKind: 'type', histEra: 'sitting', histLanguage: 'board', histRepository: 'board', histSide: 'type', histMaterial: 'tier',
  histFormat: 'type', histGenre: 'type', histRole: 'topic', histTheme: 'topic', histTheatre: 'board',
  /* A CLAIM ABOUT THE THING — checked, machine-marked, required by a board. */
  accuracy: 'check', function: 'check', required: 'check',
  /* YOUR OWN RESULT (463), its own colour. */
  myResult: 'mine',
  /* EVERY WRITING'S (520), in kinds that already have colours. */
  wWork: 'topic', wText: 'board', wTradition: 'board', wCollection: 'level', wSection: 'level', wBook: 'topic',
  wChapter: 'paper', wUnit: 'paper', wAuthor: 'type', wForm: 'type',
  shopKind: 'topic', shopHow: 'check', shopPrice: 'level', shopBrand: 'board', shopFor: 'paper',
};
/* A FACET NOBODY LISTED — one the facets tab invented — is still coloured: `other` (396). */
const tagOf_ = field => TAG_OF[field] || 'other';
const tagAttr_ = field => ` data-tag="${tagOf_(field)}"`;

/* `chipKeyIn_` WAS HERE, and the small grey field name in front of every chosen answer with it (`.chip-k`). § */
/* ---------- WHAT A CHOSEN CHIP SAYS: THE VALUE, AND ONLY WHERE THE VALUE IS NOT ENOUGH, MORE § */
function chipText_(f, i) {
  const key = String((facetBy(f.field) || {}).label || f.field);
  if (f.any) return 'Any ' + key.toLowerCase();
  const show = String(chipShow_(f, i));
  return /^\d{1,3}$/.test(show.trim()) ? key + ' ' + show.trim() : show;
}

/* THE CHIPS YOU HAVE CHOSEN. Drawn with the list rather than with the search box above it, because
   this row grows and shrinks and a fixed control does not. Clear is not one of them — see
   `filterClear_`. */
function filterChips() {
  return `<div class="chips">
    ${STUFF.filters.map((f, i) => {
      const show = chipText_(f, i);
      return `
      <button class="chip sm" data-do="filter-drop" data-i="${i}"${tagAttr_(f.field)}>
        ${/* A SKIP IS A CHIP LIKE ANY OTHER, with the same ✕, because it is a decision somebody made and has to be able to unmake. § */
             ''}
        ${/* ---------- THE CHIP SHOWS WHAT THE BUTTON SHOWED, NOT WHAT IT MATCHES ON § */
             ''}
        ${esc(show)}<span class="chip-x">✕</span>
      </button>`;
    }).join('')}
  </div>`;
}

/* ---------- CLEAR IS A TILE BESIDE THE SEARCH BOX, NOT A CHIP AT THE END OF THE ROW § */
function filterClear_() {
  return STUFF.filters.length
    ? tile_({ icon: 'bin', label: 'Clear', note: 'every answer', act: 'filter-clear', cls: 'find-clear' })
    : '';
}

/* THE PICKER SHEET IS GONE. § */

/* `on('noop')` was here: a handler that did nothing, for markup that wanted to swallow a tap.
   Nothing carries `data-do="noop"`, so it swallowed nothing. */
/* ANSWERING THE QUESTION ON THE PAGE. One tap: it becomes a chip, and the next question — if
   there is one worth asking — takes its place. */
/* `on('book-jump')` WAS HERE, with the line that used it. */

/* `on('group-by')` AND `on('group-open')` WERE HERE — press to see the papers, press one to open it. § */
/* EACH ON THE FINDER IT WAS PRESSED IN (`finderAt_`): an answer in the second finder is a chip there,
   and never one on Find. */
on('facet-pick', el => inFinder_(finderAt_(el), () => {
  writingFreeze_();
  STUFF.filters.push({ field: el.dataset.field, value: el.dataset.value });
  paintStuff();
  /* A BOOK OF THE BIBLE CHOSEN WAS FETCHED HERE TOO (docs/history/341), and the review of 12 Oct found nothing could tell: § */
}));
/* ---------- AND NOT ANSWERING IT IS ALSO AN ANSWER ----------------------------------------------
   Same push, same repaint, no value. See the `any` note in `stuffFind` for what that entry does and
   does not do. */
on('facet-skip', el => inFinder_(finderAt_(el), () => {
  writingFreeze_();
  STUFF.filters.push({ field: el.dataset.field, any: true });
  paintStuff();
}));
on('filter-drop', el => inFinder_(finderAt_(el), () => { STUFF.filters.splice(Number(el.dataset.i), 1); paintStuff(); }));
on('filter-clear', el => inFinder_(finderAt_(el), () => { STUFF.filters = []; paintStuff(); }));

/* REDRAW THE RESULTS AND NOTHING ELSE. § */
/* `keepPage` — STAY WHERE YOU ARE --------------------------------------------------------------- THIS ALWAYS JUMPED YOU BACK TO THE QUESTION, and for a filter § */
/* THE RESULT PAGES ARE A WINDOW, AND THERE ARE FIFTEEN OF THEM WHATEVER THE LIBRARY HOLDS. § */
/* ---------- FORTY-ONE, ALL OF THEM FILLED, AND MOVED IN THE QUIET (docs/history/341) § */
const STUFF_WIN = 41;
const STUFF_STEP = 6;
const STUFF_LAG = 8;
function stuffBehind_() { return STUFF_LAG + (typeof glassRows_ === 'function' ? glassRows_() : 2) + 2; }

/* A PAGE THAT NOW STANDS FOR A DIFFERENT RESULT MUST NOT KEEP THE OLD ONE'S MARKUP. § */
/* AND ITS SCROLL PUT BACK, which the emptying beyond `STUFF_NEAR` used to do: § */
function stuffBlank_(el) {
  if (!el) return;
  const pane = el.querySelector(':scope > .pane');
  if (pane && pane.style.overflowY) { pane.scrollTop = 0; pane.style.overflowY = ''; }
  if (el.dataset.filled === '1') stuffPin_(el, pane);
  delete el.dataset.filled;
  if (pane) pane.innerHTML = '';
}

/* WHERE THE WINDOW STARTS, given how many results there are, how many pages come before them and where it started last time. § */
/* `centre`: THE BUILDER'S RE-CENTRING, in the quiet — the page in front put `stuffBehind_()` from the end it is leaving. § */
function stuffLo_(want, keep, had, mode) {
  const size = Math.min(want, STUFF_WIN);
  const maxLo = Math.max(0, want - size);
  const fit = v => Math.max(0, Math.min(maxLo, v));
  /* WHICH RESULT WE ARE ON, counted from the first one rather than from the top of the column. */
  const r = Math.max(0, (PAGE[FINDER.id] || 0) - keep);
  /* THE WAY THIS COLUMN WAS LAST TURNED (`goPage`), down when nobody has turned it yet. */
  const dir = (typeof AHEAD !== 'undefined' && AHEAD.dir.y[FINDER.id]) || 1;
  const behind = Math.min(stuffBehind_(), size - 1);
  const centred = fit(dir < 0 ? r - (size - 1 - behind) : r - behind);
  let lo = fit(had || 0);
  if (mode === 'centre' || r < lo || r > lo + size - 1) return centred;
  const need = (typeof glassRows_ === 'function' ? glassRows_() : 2) + 3;
  const ahead = lo + size - 1 - r, back = r - lo;
  if (dir > 0 && ahead < need) lo = fit(lo + Math.max(STUFF_STEP, need - ahead));
  else if (dir < 0 && back < need) lo = fit(lo - Math.max(STUFF_STEP, need - back));
  return lo;
}

function stuffWindow_(mode) {
  const host = $('s-' + FINDER.id);
  if (!host) return;
  /* A WINDOW THAT MAY MOVE IS PAGES THAT MAY MOVE — the next placement walks them (`placePages_`). */
  host.PG_SIG = null;
  /* ASKED OF THE DOM, because a star adds a page in front of the question and the number of pages
     before the results is exactly what this has to be right about. */
  const keep = stuffFirstResult_();
  const want = stuffPageCount();
  PAGE_KEEP[FINDER.id] = keep;

  const size = Math.min(want, STUFF_WIN);
  const maxLo = Math.max(0, want - size);
  const had = Math.max(0, Math.min(maxLo, PAGE_LO[FINDER.id] || 0));
  const lo = stuffLo_(want, keep, had, mode);

  /* ---------- THE COUNT FIRST, AT THE TAIL § */
  let res = [].slice.call(host.querySelectorAll(':scope > .page.is-res'));
  if (res.length > size) {
    for (let i = res.length - 1; i >= size; i--) res[i].remove();
  } else if (res.length < size) {
    host.insertAdjacentHTML('beforeend',
      '<section class="page is-res"><div class="pane"></div></section>'.repeat(size - res.length));
  }

  PAGE_LO[FINDER.id] = lo;
  const k = lo - had;
  if (!k) return;
  res = [].slice.call(host.querySelectorAll(':scope > .page.is-res'));
  /* A JUMP FURTHER THAN THE WINDOW IS WIDE keeps nothing, so there is nothing to move. */
  if (Math.abs(k) >= res.length) { res.forEach(stuffBlank_); return; }
  /* THE FIRST PAGE THAT STAYS, and where it sat — see `stuffKeepPlace_` below. Read before anything
     moves, when the layout is the one the last frame already drew. */
  const ref = k > 0 ? res[k] : res[0];
  const top0 = ref ? stuffTop_(ref) : 0;
  if (k > 0) {
    for (let i = 0; i < k; i++) { stuffBlank_(res[i]); host.appendChild(res[i]); }
  } else {
    /* BEFORE THE FIRST RESULT, which is the element just past the ones that are always kept. Taken
       from the end one at a time, so they arrive in their own order rather than reversed. */
    for (let i = 0; i < -k; i++) {
      const el = res[res.length - 1 - i];
      stuffBlank_(el);
      host.insertBefore(el, host.children[keep] || null);
    }
  }
  if (ref) stuffKeepPlace_(host, top0 - stuffTop_(ref));
}

/* ---------- THE WINDOW MOVES, AND THE CARDS ON THE GLASS DO NOT § */
/* WHERE A PAGE SITS, TO THE FRACTION OF A PIXEL. § */
function stuffTop_(el) { return el.getBoundingClientRect().top; }
function stuffKeepPlace_(host, d) {
  try { colShiftNow_(host, d); } catch (e) { /* the column left as it was is the jump this exists to stop, and nothing worse */ }
}

function paintStuff(keepPage) {
  /* THE TALMUD'S INDEX IS ASKED FOR WHEN A FINDER IS PAINTED (473), never by a widget drawing the list ahead. */
  if (typeof talmudIndex_ === 'function') talmudIndex_();
  /* AND THE QURAN'S (490), the same way. */
  if (typeof quranIndex_ === 'function') quranIndex_();
  if (typeof hadithIndex_ === 'function') hadithIndex_();
  if (typeof worksIndex_ === 'function') worksIndex_();
  if (typeof textsIndex_ === 'function') textsIndex_();
  if (typeof pdtextsIndex_ === 'function') pdtextsIndex_();
  if (typeof orthoIndex_ === 'function') orthoIndex_();
  if (typeof hymnsIndex_ === 'function') hymnsIndex_();
  /* WORDS THAT CAME SINCE THE PAGES WERE COUNTED change how many pages a card is (397) — counted again as the pages are rebuilt. */
  libPagesFresh_();
  const chips = $(FINDER.id + '-chips');
  if (chips) chips.innerHTML = filterChips();
  /* THE BIN BESIDE THE BOX, in its own slot so the box itself is never rewritten — see `filterClear_`. */
  const clear = $(FINDER.id + '-clear');
  if (clear) clear.innerHTML = filterClear_();
  const groups = $(FINDER.id + '-groups');
  if (groups) groups.innerHTML = stuffQuestion();
  /* ---------- A NEW QUESTION IS READ FROM THE TOP OF ITS PANE § */
  if (groups && !keepPage) {
    const qp = groups.closest('.pane');
    if (qp && qp.scrollTop) qp.scrollTop = 0;
  }

  const host = $('s-' + FINDER.id);
  if (!host) return;
  host.PG_SIG = null;
  /* THE QUESTION PAGE, BY ITS ID. `:scope > .page` was "the first one", which is a saved thing now
     — so this kept a favourite and deleted the search box. */
  const ctrl = $(FINDER.id + '-controls');
  const first = ctrl && ctrl.closest('.page');
  if (!first) return;
  /* WHERE WE WERE, AND WHERE THE QUESTION WAS, both read before anything is rebuilt — the second is
     what says how much the pages in front moved by. */
  const was = PAGE[FINDER.id] || 0;
  /* AND WHICH CARD THAT IS, off the page itself before it is replaced — see `stuffHeld_`. */
  const held = keepPage ? stuffHeld_() : '';
  /* ---------- WHAT MOVED IS THE FIRST RESULT, NOT THE QUESTION § */
  const oldRes = host.querySelector(':scope > .page.is-res');
  const wasFirst = oldRes
    ? [].indexOf.call(host.children, oldRes)
    : stuffFirstResult_();

  /* ---------- THE QUESTION PAGE IS NOT REDRAWN, AND THAT IS THE WHOLE POINT § */
  /* ---------- THE RESULT PAGES ARE REUSED, AND THIS LINE USED TO DESTROY ALL OF THEM § */
  [].slice.call(host.querySelectorAll(':scope > .page')).forEach(el => {
    if (el !== first && !el.classList.contains('is-res')) el.remove();
  });

  /* ---------- ONE INSERT, IN THE ORDER `screen('stuff')` BUILDS § */
  /* ---------- SAVED IS A COLUMN AGAIN, SO IT IS NOT A PAGE HERE § */
  const lead = frontPages_()
    .map(c => `<section class="page"><div class="pane">${c}</div></section>`).join('');
  if (lead) first.insertAdjacentHTML('afterend', lead);

  /* ---------- AND THE BLANKS, BY DIFFERENCE § */
  /* ---------- AND THE RESULTS, WHICH ARE A WINDOW § */
  [].slice.call(host.querySelectorAll(':scope > .page.is-res')).forEach(el => el.remove());
  PAGE_LO[FINDER.id] = 0;


  /* AND BACK TO THE TOP OF THE RESULTS. § */
  /* ON THE QUESTION, NOT ONE BEFORE THE RESULTS. § */
  /* ONLY WHAT IS PAST THE LEADING PAGES MOVES. § */
  /* CLAMPED TO THE COLUMN'S PAGE COUNT, NOT TO `host.children.length`. § */
  PAGE[FINDER.id] = keepPage
    ? Math.max(0, Math.min(was >= wasFirst ? was + (stuffFirstResult_() - wasFirst) : was,
                           pageCount(FINDER.id) - 1))
    : stuffQuestionPage_();
  /* THE SHIFT ABOVE IS WHAT MOVED IN FRONT OF THE RESULTS; THIS IS WHAT MOVED AMONG THEM — the card
     looked up by name in the list as it is now (`stuffBackTo_`), when the list has changed under it. */
  if (keepPage) stuffBackTo_(held, stuffFirstResult_());
  /* AND THE WINDOW IS BUILT AROUND THE PAGE WE ARE GOING TO BE ON, so it is decided first. § */
  stuffWindow_();

  fillStuffPages();
  /* AND A NEW WINDOW IN FRONT IS FILLED AS FAR AS THE GLASS SHOWS — the question's own page is the one in front,
     and an iPad shows four or five results under it (`stuffBandFill_`). */
  if (stuffOnGlass_(FINDER.id) && stuffBandFill_()) settle_(true);
  paintPager(FINDER.id, true);
  /* A NEW QUESTION IS A NEW WINDOW TO FILL — the builder is asked to look (`ahead_`, shell.js; 341). It runs
     nothing periodic, so whatever makes work says so. */
  if (typeof aheadKick_ === 'function') aheadKick_();
}

/* THE PAGES YOU CAN SEE, AND ONE EITHER SIDE. § */
/* ---------- THE ONE RULE THIS SCREEN KEPT BREAKING § */
/* THE LAYOUT DOCTOR — `layout()` in the console, or tap the version line on the You screen. § */
function layout(which) {
  const id = which || AT;
  const host = $('s-' + id);
  if (!host) { console.log('no screen called ' + id); return; }
  const pages = [].slice.call(host.querySelectorAll(':scope > .page'));
  const cs = getComputedStyle(host);
  const rows = [];
  let overlaps = 0, unfilled = 0;

  const box = el => { const r = el.getBoundingClientRect(); return { top: r.top, bot: r.bottom, h: r.height }; };

  pages.forEach((el, i) => {
    const pane = el.querySelector(':scope > .pane');
    const b = box(el);
    const prev = i ? box(pages[i - 1]) : null;
    const gap = prev ? +(b.top - prev.bot).toFixed(1) : null;
    if (gap !== null && gap < -0.5) overlaps++;
    const filled = el.dataset.filled === '1' || i === 0;
    if (!filled) unfilled++;
    rows.push({
      page: i,
      at: i === (PAGE[id] || 0) ? '<<' : '',
      filled: filled ? 'yes' : 'NO',
      top: +b.top.toFixed(1),
      height: +b.h.toFixed(1),
      pane: pane ? +pane.getBoundingClientRect().height.toFixed(1) : 'none',
      gapAbove: gap === null ? '' : gap,
      overlap: gap !== null && gap < -0.5 ? 'YES' : '',
    });
  });

  /* ---------- ACROSS, BEFORE ANYTHING ELSE § */
  {
    const rows = TABS.map(t => {
      const el = $('s-' + t.id);
      if (!el) return { tab: t.id, drawn: 'NO SCREEN' };
      const cs = getComputedStyle(el);
      const page = el.querySelector(':scope > .page');
      const r = page ? page.getBoundingClientRect() : null;
      return {
        tab: t.id,
        cardLeft: r ? +r.left.toFixed(0) : '—',
        cardWidth: r ? +r.width.toFixed(0) : '—',
        widthPct: r ? +(100 * r.width / innerWidth).toFixed(1) : '—',
        onScreen: r ? +(Math.max(0, Math.min(innerWidth, r.right) - Math.max(0, r.left))).toFixed(0) : '—',
        opacity: +cs.opacity,
        visibility: cs.visibility,
      };
    });
    console.log('ACROSS — screen is ' + innerWidth + 'px wide');
    console.table(rows);
    const near = rows.filter(x => x.onScreen > 0 && x.opacity > 0);
    console.log(near.length > 1
      ? 'you should see ' + (near.length - 1) + ' neighbour(s); the widest sliver is '
        + Math.max.apply(null, near.map(x => x.onScreen).filter(n => n < innerWidth)) + 'px'
      : '*** NO NEIGHBOUR IS BOTH ON SCREEN AND VISIBLE — that is why you cannot see one');
    console.log('');
  }

  console.log('screen        : ' + id + '   pages ' + pages.length + '   at ' + (PAGE[id] || 0));
  console.log('screen display: ' + cs.display + '  gap ' + cs.gap + '  contain ' + cs.contain
    + '  overflow ' + cs.overflow);
  console.log('screen height : ' + host.clientHeight + '   transform ' + cs.transform);
  console.table(rows);
  console.log(overlaps ? '*** ' + overlaps + ' OVERLAPPING PAIR(S) — cards are on top of each other'
                       : 'no overlaps');
  console.log(unfilled ? unfilled + ' page(s) have nothing in them' : 'every page is filled');
  return { screen: id, overlaps, unfilled, rows };
}

/* `STUFF_NEAR` WAS HERE — five pages either side filled, and everything past them emptied again. § */

/* ---------- THE THREE UNDER YOUR THUMB NOW, THE OTHER EIGHT A FRAME LATER § */
let STUFF_LATE = 0;
const STUFF_SOON = 1;

/* ---------- A CARD TALLER THAN THE PANE, WHICH USED TO BE RARE § */
const PANE_REACH = 24;
/* HOW SMALL A CARD MAY BE DRAWN TO FIT ITS PANE before it scrolls instead. See `paneReach_`. */
const PANE_ZOOM_MIN = 0.7;
/* ---------- AND AN ESSAY'S CARD, NO SMALLER THAN KEEPS ITS TILES AT 44px § */
const PANE_ZOOM_ESSAY = 0.92;

/* EVERY READ, THEN EVERY WRITE, AND IT IS THE WHOLE COST OF THIS FUNCTION. § */
function paneReach_(panes) {
  const list = [].slice.call(panes || []);
  if (!list.length) return;
  try {
    /* ---------- SHRINK TO FIT FIRST, AND SCROLL ONLY PAST THE FLOOR § */
    const kids = list.map(p => [].slice.call(p.children));
    const was = kids.map(ks => ks.map(k => k.style.zoom || ''));
    kids.forEach(ks => ks.forEach(k => {
      if (k.style.zoom) {
        k.style.zoom = ''; k.style.width = '';
        k.style.marginInline = ''; k.style.marginLeft = ''; k.style.marginRight = '';
      }
    }));
    /* AN ESSAY'S SHEET GIVES WAY BEFORE ITS CARD IS DRAWN SMALLER -- `kpSheetFit_` in keypad.js. § */
    if (typeof kpSheetFit_ === 'function') list.forEach(p => { if (p.querySelector('.qp-essay')) kpSheetFit_(p); });
    /* AND A LIBRARY CARD GIVES UP ITS BLANK BAND FIRST — `libFit_` in me.js, the sheet's rule for the one card whose height follows its width: § */
    if (typeof libFit_ === 'function') list.forEach(p => { if (p.querySelector('.lib-face')) libFit_(p); });
    /* A TALMUD SIDE IS FETCHED AND LAID OUT AS ITS PANE IS REACHED (490) -- `talCardsFit_`, talmud.js. */
    if (typeof talCardsFit_ === 'function') list.forEach(p => { if (p.querySelector('.tal-card-page')) talCardsFit_(p); });
    /* AND A CARD WITH A FIGURE IN IT GIVES WAY THE SAME WAY -- `cardFigFit_`, the sheet's answer for a picture (356): § */
    list.forEach(p => { if (cardFigs_(p.querySelector('.qcard')).length) cardFigFit_(p); });
    /* ---------- AND A CARD WITH A FIGURE IN IT IS NEVER DRAWN SMALLER WHOLE § */
    const drawn = list.map(p => !!cardFigs_(p.querySelector('.qcard')).length);
    const pad = p => {
      const cs = getComputedStyle(p);
      return (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    };
    const essay = list.map(p => !!p.querySelector('.qp-essay'));
    /* ---------- AND A LIST OF TICKS THAT IS OPEN IS NEVER DRAWN SMALLER § */
    const ticks = list.map(p => !!p.querySelector('.bk-many-list, details.many-d[open]'));
    /* ---------- AND NEITHER IS A CARD BEING EDITED (`cardEditHtml_`, me.js; docs/history/330) § */
    /* ---------- NOR "MANAGE YOUR CHILD" (`childManageCard_`, me.js; the review of docs/history/339) § */
    const forms = list.map(p => !!p.querySelector('.card-ed .me-form, .kid-manage'));
    /* ---------- NOR A CARD ANSWERED BY TAPPING ITS OPTIONS, ITS ORDER OR ITS CELLS (374): drawn smaller they fell to 39-41px at 320; it scrolls and they stay 44 */
    /* AND THE CONSOLE (419) THE SAME WAY: drawn smaller its pad keys fell to 31px, and every line it showed or hid re-zoomed the whole console under a thumb. */
    const picks = list.map(p => !!p.querySelector('.qcard .qp-opts, .qcard .qp-order, .qcard .qp-cells-box, .nes-wrap'));
    const want = list.map((p, i) => {
      const room = p.clientHeight - pad(p);
      const used = p.scrollHeight - pad(p);
      if (room <= 0 || used - room <= 2) return 1;
      if (ticks[i] || forms[i] || drawn[i] || picks[i]) return 1;
      /* FOUR PIXELS SHORT OF THE ROOM, because a 1px border and a sub-pixel line box do not scale:
         measured, a card zoomed to exactly room / used ended 4px past its pane. */
      const z = Math.max(PANE_ZOOM_MIN, Math.floor((room - 4) / used * 1000) / 1000);
      /* AN ESSAY'S CARD: that zoom, or none and a scrolling pane -- `PANE_ZOOM_ESSAY`. */
      return essay[i] && z < PANE_ZOOM_ESSAY ? 1 : z;
    });
    /* AND THE CARD KEEPS ITS OWN WIDTH, so it is the same card drawn smaller rather than a wider card re-flowed. § */
    /* ---------- AND IT STAYS CENTRED WHERE IT WAS, WHICH `margin-inline: auto` DID NOT DO § */
    const box = list.map(p => {
      const r = p.getBoundingClientRect(), cs = getComputedStyle(p);
      return r.left + (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.paddingLeft) || 0);
    });
    const rects = kids.map(ks => ks.map(k => k.getBoundingClientRect()));
    list.forEach((p, i) => {
      if (want[i] < 1) kids[i].forEach((k, j) => {
        const r = rects[i][j], z = want[i];
        const left = (r.left - box[i]) + r.width / 2 - r.width * z / 2;
        k.style.width = r.width + 'px';
        k.style.marginLeft = (left / z) + 'px';
        k.style.marginRight = 'auto';
        k.style.zoom = String(z);
      });
    });
    /* ---------- A ZOOM THAT CHANGED MOVES THE PAGES UNDER IT, SO THE COLUMN IS PLACED AGAIN § */
    const moved = new Set();
    list.forEach((p, i) => {
      const now = want[i] < 1 ? String(want[i]) : '';
      if (was[i].some(z => z !== now)) {
        const scr = p.closest && p.closest('.screen');
        if (scr && scr.id) moved.add(scr.id.replace(/^s-/, ''));
      }
    });
    if (moved.size && typeof placeCells === 'function') {
      moved.forEach(id => placeCells('y', true, 0, id));
    }
    /* `overflow-y` AND NOT `touch-action`, WHICH IS THE OPPOSITE OF WHAT `padReach_` DOES AND IS DELIBERATE. § */
    /* READ AFTER THE ZOOM, and only matters at the floor: anything above it fits by construction. */
    /* AN OPEN LIST SCROLLS FROM ITS FIRST PIXEL OVER, not from `PANE_REACH`'s 24: § */
    /* A CARD BEING EDITED THE SAME: its Save and Cancel are its foot, and the pane has to reach them — and
       "Manage your child", whose foot is Ask them. */
    const over = list.map((p, i) => (want[i] <= PANE_ZOOM_MIN || ((essay[i] || ticks[i] || forms[i] || drawn[i] || picks[i]) && want[i] === 1))
      && p.scrollHeight - p.clientHeight > (ticks[i] || forms[i] || drawn[i] || picks[i] ? 2 : PANE_REACH));
    /* WRITTEN ONLY WHERE IT CHANGES, which is what stops `paneWatch_` below feeding itself: § */
    list.forEach((p, i) => {
      const to = over[i] ? 'auto' : '';
      if (p.style.overflowY !== to) {
        p.style.overflowY = to;
        /* A CARD WITH A PEN THAT HAS TO SCROLL OPENS SCROLLED TOWARDS ITS FOOT -- the picture to draw on and its bar on the glass -- AND NO FURTHER THAN PUTS THE § */
        const art = to && drawn[i] ? p.querySelector('.qcard .qpad .qpad-art') : null;
        if (art) {
          const top = art.getBoundingClientRect().top - p.getBoundingClientRect().top - (p.clientTop || 0) + p.scrollTop - 8;
          p.scrollTop = Math.max(0, Math.min(p.scrollHeight - p.clientHeight, Math.floor(top)));
        }
      }
    });
  } catch (e) {}
}

/* ---------- AND A CARD THAT GROWS AFTER ITS SCREEN WAS PLACED § */
/* ---------- AND IT MEASURES A FRAME LATER, NOT INSIDE THE OBSERVER'S OWN CALLBACK § */
let PANE_WATCH = null;
let PANE_WATCH_DUE = null;
/* THE WINDOW'S SIZE, KEPT UNTIL IT RESIZES: reading `innerWidth` straight after a placement forced a whole-app layout on every release (401). */
let PANE_VP_NOW = '';
const paneVp_ = () => PANE_VP_NOW || (PANE_VP_NOW = innerWidth + 'x' + innerHeight);
addEventListener('resize', () => { PANE_VP_NOW = ''; }, { passive: true });
if (window.visualViewport) visualViewport.addEventListener('resize', () => { PANE_VP_NOW = ''; }, { passive: true });
function paneWatch_(host) {
  if (!host || !host.querySelectorAll) return;
  const panes = host.querySelectorAll('.pane');
  /* ---------- ONLY THE PANES IT HAS NOT ALREADY MEASURED § */
  const vp = paneVp_();
  const all = host.PANE_VP !== vp;
  host.PANE_VP = vp;
  paneReach_(all ? panes : [].filter.call(panes, p =>
    !(p.PANE_SEEN && p.PANE_SEEN === p.firstElementChild && p.PANE_N === p.children.length)));
  [].forEach.call(panes, p => { p.PANE_SEEN = p.firstElementChild; p.PANE_N = p.children.length; });
  if (typeof ResizeObserver !== 'function') return;
  try {
    if (!PANE_WATCH) PANE_WATCH = new ResizeObserver(rows => {
      const due = PANE_WATCH_DUE || (PANE_WATCH_DUE = []);
      const first = due.length === 0;
      const held = new Set();
      /* ---------- AND HOW TALL EACH PANE WAS, FOR THE DAY IT IS EMPTIED § */
      rows.forEach(r => {
        const pane = r.target && r.target.parentElement;
        if (pane && pane.classList.contains('pane')) pane.LAST_H = pane.getBoundingClientRect().height;
      });
      rows.forEach(r => {
        const pane = r.target && r.target.parentElement;
        if (pane && due.indexOf(pane) === -1) due.push(pane);
        const scr = pane && pane.closest && pane.closest('.screen');
        if (scr && scr.id && !held.has(scr.id)) {
          held.add(scr.id);
          /* NOW, INSIDE THE DELIVERY, and not with the measuring a frame later — see `holdColumn_` in shell.js: § */
          if (typeof holdColumn_ === 'function') holdColumn_(scr.id.replace(/^s-/, ''));
        }
      });
      if (first && due.length) requestAnimationFrame(() => {
        const mine = PANE_WATCH_DUE || [];
        PANE_WATCH_DUE = null;
        paneReach_(mine.filter(p => p.isConnected));
      });
    });
    /* ONLY WHAT CHANGED IS UNOBSERVED OR OBSERVED. § */
    const kids = [].slice.call(panes).map(p => p.firstElementChild).filter(Boolean);
    const had = host.PANE_KIDS || [];
    const now = new Set(kids);
    had.forEach(k => { if (!now.has(k)) { try { PANE_WATCH.unobserve(k); } catch (e) {} } });
    const old = new Set(had);
    kids.forEach(k => { if (!old.has(k)) PANE_WATCH.observe(k); });
    host.PANE_KIDS = kids;
  } catch (e) {}
}

/* ---------- ONE PAGE, FILLED: THE LOOP'S BODY, AND THE FAR EDGE OF THE GLASS § */
function stuffFillOne_(i, ctx) {
  const host = $('s-' + FINDER.id);
  if (!host) return false;
  const c = ctx || {};
  const first = c.first != null ? c.first : stuffFirstResult_();
  /* THE PAGE COUNT, not the result count — a practical is four pages. See `stuffPages_`. */
  if (i < first || i > first + stuffPages_().length - 1) return false;
  const pages = c.pages || host.querySelectorAll(':scope > .page');
  const el = pages[domIndex_(FINDER.id, i)];
  if (!el || el.dataset.filled === '1') return false;
  /* INTO THE PANE, not over it — see the note in `fillStuffPages`. `paneOf_` makes one if the page
     has not got one. */
  const pane = paneOf_(el);
  pane.innerHTML = stuffPageHtml(i - first);
  el.dataset.filled = '1';
  /* WHICH CARD THIS IS, AND FOR WHICH QUESTION — so a redraw over a changed list can find it again
     (`stuffHeld_`). An expando, as `pane.LAST_H` is: nothing reads it out of the markup. */
  el.FIND_AT = { ask: stuffAsk_(), id: stuffPageId_(stuffPages_()[i - first]) };
  /* THE HEIGHT IT WAS HELD AT WHILE EMPTY GOES, in the same task as the card arrives, so the page is
     its card's height from the first frame it is drawn — see `stuffPin_`. */
  el.style.minHeight = '';
  /* AND DRAWN WHILE IT IS BUILT, if it is one of the ten that do not loop. § */
  const items = c.items || stuffFiltered();
  const w = showingWidgets() && items[i - first] && items[i - first].row;
  if (w && !w.stop) drawWidget_(w);
  return true;
}

/* ---------- THE RELEASE'S FLOOR: EVERY PAGE THE BAND WILL SHOW, FILLED BEFORE THE COLUMN MOVES § */
/* `least`: THE FLOOR, in pages — `glassRows_() + 3` for a turn (above); 1 for `stuffBandFill_`, which asks for
   the band and no more. */
function stuffEdgeFill_(n, dir, least) {
  const id = FINDER.id, host = $('s-' + id);
  if (!host) return 0;
  const pages = host.querySelectorAll(':scope > .page');
  const cur = pages[domIndex_(id, n)];
  if (!cur) return 0;
  const rows = typeof glassRows_ === 'function' ? glassRows_() : 2;
  const floor = least == null ? rows + 3 : least;
  const glassH = host.clientHeight || innerHeight;
  const top = cur.offsetTop, h = cur.offsetHeight;
  const gTop = top - Math.max(0, (glassH - h) / 2);
  const reach = dir > 0 ? gTop + 2 * glassH : gTop - glassH;
  let y = dir > 0 ? top + h : top;
  let filled = 0;
  for (let k = 1; k <= STUFF_WIN; k++) {
    const i = n + dir * k;
    const el = pages[domIndex_(id, i)];
    if (!el || !el.classList.contains('is-res')) break;
    if (k > floor && (dir > 0 ? y >= reach : y <= reach)) break;
    if (el.dataset.filled !== '1' && stuffFillOne_(i)) filled++;
    y += dir * el.offsetHeight;
    if (filled >= rows + 3) break;
  }
  return filled;
}

/* ---------- A WINDOW DRAWN AFRESH ON THE GLASS IS FILLED AS FAR AS THE GLASS SHOWS, BOTH WAYS § */
function stuffBandFill_() {
  const at = PAGE[FINDER.id] || 0;
  let n = stuffFillOne_(at) ? 1 : 0;
  n += stuffEdgeFill_(at, 1, 1);
  n += stuffEdgeFill_(at, -1, 1);
  return n;
}
/* WHETHER THIS FINDER'S COLUMN IS ONE THE GLASS SHOWS — in front, or beside it on a wide window. */
function stuffOnGlass_(id) {
  return id === AT || (typeof GLASS !== 'undefined' && GLASS.at === AT && GLASS.cols.indexOf(id) !== -1);
}

/* ---------- THE BUILDER'S FINDER JOBS: THE WHOLE WINDOW FILLED, AND RE-CENTRED, IN THE QUIET § */
function stuffAheadJobs_() {
  const out = [];
  Object.keys(FINDERS).forEach(fid => {
    const F = FINDERS[fid];
    if (!TABS.some(t => t.id === fid) || STALE[fid]) return;
    const host = $('s-' + fid);
    if (!host || !host.querySelector(':scope > .page.is-res')) return;
    inFinder_(F, () => {
      if (!$(fid + '-controls')) return;
      const first = stuffFirstResult_();
      const n = stuffPages_().length;
      if (!n) return;
      const want = stuffPageCount();
      const size = Math.min(want, STUFF_WIN);
      const had = PAGE_LO[fid] || 0;
      const ask = stuffAsk_();
      const at = PAGE[fid] || 0;
      if (stuffLo_(want, first, had, 'centre') !== had) {
        out.push({ key: 'centre:' + fid, kind: 'centre', d: aheadDist_(fid, at), run: () => stuffAheadCentre_(F, ask) });
      }
      const pages = host.querySelectorAll(':scope > .page');
      let best = null;
      for (let i = first + had; i < first + had + size && i < first + n; i++) {
        const el = pages[domIndex_(fid, i)];
        if (!el) continue;
        if (el.dataset.filled === '1' && !(el.FIND_AT && el.FIND_AT.ask !== ask)) continue;
        const d = aheadDist_(fid, i);
        if (!best || d < best.d) best = { i: i, d: d };
      }
      if (best) {
        const i = best.i;
        out.push({ key: 'fill:' + fid + ':' + i, kind: 'fill', d: best.d, run: () => stuffAheadFill_(F, i, ask) });
      }
    });
  });
  return out;
}
/* ONE CARD, AND ITS PANE MEASURED NOW — `paneWatch_` measures the panes it has not seen, which is this one — so nothing later measures the window; and a card § */
function stuffAheadFill_(F, i, ask) {
  return inFinder_(F, () => {
    if (stuffAsk_() !== ask) return;
    const id = F.id, host = $('s-' + id);
    if (!host) return;
    const pages = host.querySelectorAll(':scope > .page');
    const el = pages[domIndex_(id, i)];
    if (!el || !el.classList.contains('is-res')) return;
    if (el.dataset.filled === '1' && el.FIND_AT && el.FIND_AT.ask === ask) return;
    if (el.dataset.filled === '1') stuffBlank_(el);
    const at = PAGE[id] || 0;
    const ref = i < at ? pages[domIndex_(id, at)] : null;
    const top0 = ref ? stuffTop_(ref) : 0;
    if (!stuffFillOne_(i)) return false;
    if (typeof paneWatch_ === 'function') paneWatch_(host);
    if (ref) stuffKeepPlace_(host, top0 - stuffTop_(ref));
  });
}
function stuffAheadCentre_(F, ask) {
  return inFinder_(F, () => {
    if (stuffAsk_() !== ask) return;
    stuffWindow_('centre');
    if (typeof placeOne_ === 'function') placeOne_(F.id);
  });
}
AHEAD_KINDS.push(stuffAheadJobs_);

/* ---------- A FINDER DRAWN FROM NOTHING IS WARMED IN FOUR SLICES BEFORE ITS PAINT (`warm`) § */
const STUFF_WARM = {};
const STUFF_WARM_STEPS = [
  () => stuffItems(),
  () => stuffItems().forEach(x => { if (!x._sk) x._sk = sortKey_(x); }),
  () => stuffFiltered(),
  () => stuffQuestion(),
];
function stuffWarmJobs_() {
  const out = [];
  Object.keys(FINDERS).forEach(fid => {
    if (fid === AT || !STALE[fid] || !TABS.some(t => t.id === fid) || !$('s-' + fid)) return;
    const F = FINDERS[fid];
    inFinder_(F, () => {
      const ask = stuffAsk_(), who = itemMemoKey_();
      const w = STUFF_WARM[fid];
      const step = w && w.data === DATA && w.ask === ask && w.who === who ? w.step : 0;
      if (step >= STUFF_WARM_STEPS.length) return;
      out.push({ key: 'warm:' + fid + ':' + step, kind: 'paint', d: aheadDist_(fid, null) - 0.01, run: () => stuffWarm_(F, ask, step) });
    });
  });
  return out;
}
function stuffWarm_(F, ask, step) {
  return inFinder_(F, () => {
    if (stuffAsk_() !== ask) return false;
    STUFF_WARM_STEPS[step]();
    STUFF_WARM[F.id] = { data: DATA, ask: ask, who: itemMemoKey_(), step: step + 1 };
  });
}
AHEAD_KINDS.push(stuffWarmJobs_);

/* ---------- AN EMPTIED PAGE KEEPS ITS HEIGHT § */
function stuffPin_(el, pane) {
  const h = pane && pane.LAST_H;
  if (el && h > 0) el.style.minHeight = h + 'px';
}

/* `all` WAS THE LATE PASS SAYING "DO THE REST", and the late pass is gone (`STUFF_LATE`'s note). § */
function fillStuffPages(all) {
  const host = $('s-' + FINDER.id);
  if (!host) return;
  let changed = false;
  const pages = host.querySelectorAll(':scope > .page');
  const at = PAGE[FINDER.id] || 0;
  const items = stuffFiltered();
  const first = stuffFirstResult_();
  /* ---------- THE THREE YOU ARE ON, NOT THE FIVE THOUSAND YOU ARE NOT § */
  /* EVERY NUMBER HERE IS A PAGE NUMBER and every lookup goes through `domIndex_`, because the
     results are a window and the element standing for page 400 is not the four-hundredth child.
     See `stuffWindow_`. */
  const last = first + stuffPages_().length - 1;
  const winLo = first + (PAGE_LO[FINDER.id] || 0);
  const lo = Math.max(first, all ? winLo : at - STUFF_SOON);
  const hi = Math.min(last, all ? winLo + STUFF_WIN - 1 : at + STUFF_SOON);
  const ask = stuffAsk_();
  const drawn = [];
  for (let i = lo; i <= hi; i++) {
    const el = pages[domIndex_(FINDER.id, i)];
    if (!el) continue;
    if (el.dataset.filled === '1' && el.FIND_AT && el.FIND_AT.ask !== ask) stuffBlank_(el);
    if (el.dataset.filled === '1') continue;
    /* THE CARD, ITS WIDGET DRAWN WITH IT — see `stuffFillOne_`, which the far edge of the glass in
       `goPage` and the builder share. */
    if (stuffFillOne_(i, { pages: pages, first: first, items: items })) {
      changed = true;
      drawn.push(el);
    }
  }

  /* AND THE CARDS THIS PASS DREW ARE MEASURED ON THE NEXT TURN OF THE EVENT LOOP — only those, never the whole window: § */
  /* THE FINDER IS CAPTURED, because the timer fires outside every binding (`inFinder_`). */
  clearTimeout(STUFF_LATE);
  if (drawn.length) {
    STUFF_LATE = setTimeout(() => paneReach_(drawn.filter(el => el.isConnected && el.dataset.filled === '1')
      .map(el => el.querySelector(':scope > .pane')).filter(Boolean)), 0);
  }

  /* A TEXTBOOK'S ANIMATION ON THE PAGE IN FRONT PLAYS, AND ONLY THAT ONE — see `tbAnimWatch_`. Here,
     after the pages near you are filled, because a stage that was not on the page a moment ago is
     on it now. */
  tbAnimWatch_();
  /* AND THE WORDS OF THE CARD IN FRONT AND THE NEXT FEW, from the Ledger (397) — asked here, where a turn lands. */
  libAhead_();

  /* AND START THE ONE YOU ARE LOOKING AT — if it is one that runs. § */
  if (!FINDER.widgets) { settle_(changed); return; }
  if (!showingWidgets()) { stopWidget_(); settle_(changed); return; }
  const wgt = items[at - first] && items[at - first].row;
  if (!wgt) { stopWidget_(); settle_(changed); return; }
  if (!wgt.stop) {
    /* Already drawn with its page. Landing on a still widget still has to stop whatever was running
       on the page you came from, or Flabby Pird goes on drawing behind the calendar. */
    stopWidget_();
    settle_(changed);
    return;
  }
  startWidget_(wgt);
  /* A widget that has just started may have sized itself — a canvas takes its box — so the telling
     comes after that too, not before. */
  settle_(true);
}

/* The grid measures the panes again and puts everything where it now belongs. § */
/* ---------- HELD, NOT PLACED § */
function settle_(changed) {
  if (!changed) return;
  const host = $('s-' + FINDER.id);
  if (host && typeof paneWatch_ === 'function') paneWatch_(host);
  if (!holdColumn_(FINDER.id)) placeCells('y', true, 0, FINDER.id);
}

/* BRING ONE WIDGET TO LIFE, and say so in its own space if it does not. § */
/* ---------- A WIDGET THAT IS NOT BEING LOOKED AT MUST NOT BE RUNNING § */
let WIDGET_ON = null;

function stopWidget_() {
  if (!WIDGET_ON) return;
  const was = WIDGET_ON;
  WIDGET_ON = null;
  try { if (was.stop) was.stop(); } catch (e) { console.warn('[widget stop]', was.id, e); }
}

/* ---------- DRAWING ONE IS NOT THE SAME AS RUNNING ONE § */
function drawWidget_(wgt) {
  let err = null;
  try { wgt.start(); } catch (e) { err = e; console.warn('[widget]', wgt.id, e); }

  const into = $(wgt.into);
  if (!into) { console.warn('[widget]', wgt.id, 'has nowhere to draw: #' + wgt.into); return; }
  /* A canvas and a textarea draw into themselves, so their emptiness says nothing about them. */
  if (wgt.into === 'flappy-canvas' || wgt.into === 'notepad') return;
  if (String(into.innerHTML || '').trim()) return;
  into.innerHTML = `<p class="note" style="padding:1rem;text-align:center">
    ${esc(wgt.what)} did not start.<br>
    <span class="faint">${esc(err ? String(err.message || err) : 'It drew nothing.')}</span></p>`;
}

/* ---------- EVERY WIDGET, FIXED AND MADE § */
function allWidgets() {
  /* THE STATIC ONES, THEN THE TWO SETS THAT ARE MADE FROM DATA — a widget per conversation and a widget per session you are in. § */
  /* ---------- AND CONVERSATIONS ARE NOT AMONG THEM ANY MORE § */
  return WIDGETS
    .concat(typeof liveWidgets_ === 'function' ? liveWidgets_() : []);
}

function startWidget_(wgt) {
  /* NOT ONE THIS PERSON MAY NOT OPEN, whoever handed it here — see `widgetFor_` in arcade.js. */
  if (typeof widgetFor_ === 'function' && !widgetFor_(wgt)) return;
  /* The same one again is already running — restarting would throw away a game in progress and a
     clock somebody is watching. */
  if (WIDGET_ON && WIDGET_ON.id === wgt.id) return;
  stopWidget_();
  WIDGET_ON = wgt;
  drawWidget_(wgt);
}

/* THE QUESTION, ON THE PAGE. § */
/* NAMED FOR WHAT IT WAS, not what it is. § */
/* ---------- CARRY ON WAS HERE, AND IT WAS AN ANSWER TO A QUESTION NOBODY ASKED § */


function stuffQuestion() {
  const items = stuffFiltered();
  /* NOBODY YET, and a way to fix that. § */
  if (STUFF.filters.some(f => f.value === 'Friends') && !items.length) {
    return `<p class="empty">No friends yet.<br>
      <span class="text-action" data-do="friend-add-open">Add someone by their handle</span></p>`;
  }
  /* ---------- AN EMPTY FUNNEL SAID NOTHING AT ALL, WHICH IS THE WORST OF THE THREE ANSWERS § */
  /* AND WHEN THE WORDS ARE IN THE OTHER FINDER, SAYS SO — `stuffNoneHtml_`, one copy for both. */
  if (!items.length) return stuffNoneHtml_();

  /* ---------- THE ORDINARY QUESTION FIRST, AND THE LAST RESORT BEHIND IT § */
  const facet = nextFacet(items) || overFacet_(items);
  const adding = STUFF.filters.some(f => f.value === 'Friends')
    ? `<p class="find-end"><span class="text-action" data-do="friend-add-open"
        >Add someone by their handle</span></p>` : '';
  if (!facet) {
    /* ---------- "NOTHING LEFT TO NARROW" WAS NOT TRUE, AND IT WAS THE LAST THING ON THE SCREEN § */
    const n = items.length === 1 ? 'one' : items.length;
    /* AND WHEN A PAPER ENDED IT, IT SAYS SO. § */
    /* ---------- ONE CLASS FOR THE LAST LINE, NOT AN INLINE MARGIN ON EACH § */
    /* AND OVER THE BIBLE, WHICH VERSES — or why there is no question over its cover yet. */
    const be = bibleEnd_(items);
    if (be) return be + adding;
    return `<p class="find-end">Nothing left to narrow.
      <b>Swipe up for the ${n}.</b></p>` + adding;
  }

  /* THE FRONT DOOR TO THE BOOKING FORM WAS HERE — a line above the funnel's answers, on the first question only, that filtered to Booking and turned to the form. § */

  /* ---------- EVERY ANSWER, IN THE ORDER EVERY OTHER QUESTION USES § */
  /* ---------- NOTHING IS TRIMMED HERE ANY MORE, BECAUSE NOTHING ARRIVES OVERSIZED § */
  const values = facetValues(items, facet);
  /* THE HEADING IS GONE — it read `> WHAT FOR 5` above five rows that were about to say the same thing. § */
  /* `counted` TAKES THE CHEVRON OFF. § */
  /* ---------- "DOESN'T MATTER", UNDER EVERY QUESTION § */
  /* `counted` WITHOUT A COUNT, which is not a contradiction: § */
  const skip = `<div class="counted row tap is-skip" data-do="facet-skip"
        data-field="${esc(facet.field)}">
        <span class="k">Doesn't matter</span>
      </div>`;
  /* ---------- THE COUNT BESIDE EACH ANSWER IS GONE § */
  /* THE "and N more" LINE WENT WITH THE TRIM. § */
  /* `data-value` IS THE FULL NAME AND THE TEXT IS THE SHORT ONE — see `shortLabels_`. The chip this
     row creates has to find the rows it names, and `filterHit` matches on what is in `data-value`. */
  /* `.answers` IS WHAT MAKES THEM CHIPS ON A LINE rather than rows down the card — see the block of that name in style.css. § */
  /* ---------- A NUMBERED RUN IS A GRID — any facet whose answers are all bare numbers (396) § */
  const grid = values.length > 1 && values.every(v => /^\d+$/.test(String(v.show || v.value)));
  /* ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, MORE ANSWERS ARE COMING § */
  const sw = scriptureWait_(items);
  const more = sw != null ? sw : typeof awaiting_ === 'function' && awaiting_() ? loading_() : '';
  return '<div class="answers' + (grid ? ' is-grid' : '') + '">' + values.map(v => `<div class="counted row tap" data-do="facet-pick"${tagAttr_(facet.field)}
        data-field="${esc(facet.field)}" data-value="${esc(v.value)}"${
        grid ? ` aria-label="${esc(facet.label + ' ' + (v.show || v.value))}"` : ''}>
        <span class="k">${mark(v.show || v.value)}</span>
      </div>`).join('') + skip + '</div>' + more;
}

/* `stuff-jump` went with the group list. § */

/* `paperish_` WAS HERE — "is this row actually an exam paper", by its `resource_type` or a paper
   number in its name. It chose between the exam cover and an ordinary card, and both callers went
   with the cover. */



/* ---------- `paperCard`, `openPaper_` AND `on('paper-read')` WERE ALL HERE § */

/* `stuffCount` was here. Removed with the line it fed — a function whose only caller has gone is
   the thing `check-dead.js` would name next time anyway. */


/* ---------- ONE DRAW FOR BOTH FINDERS § */
/* ---------- THE FINDER IS FOR MEMBERS (400): signed out, Find and Find 2 are one card, Sign in or Join ----------
   Find's booking and feed pages stay (they are not results); the bundle is made of results, so it goes. */
function finderMembersCard_(F) {
  return `<div class="card members-only" id="${F.id}-members"><h3>Members only</h3>
    <p class="sub">The finder is for members. Sign in, or join free as a student or a client.</p>
    <div class="tile-row">${tile_({ icon: 'in', label: 'Sign in', tone: 'buy', act: 'members-signin' })}${
      tile_({ icon: 'join', label: 'Join', note: 'free', act: 'members-join' })}</div></div>`;
}
function finderMembersOnly_(F) {
  const front = F.id === 'stuff' ? [].concat(bookingPages_(), feedPages_()) : [];
  PAGE_KEEP[F.id] = 1 + front.length;
  return pages(F.id, [finderMembersCard_(F)].concat(front));
}
on('members-signin', () => go('account'));
on('members-join', () => { if (typeof registerSheet_ === 'function') registerSheet_(); });

function finderScreen_() {
  const F = FINDER;
  if (!USER && (typeof ruleOn_ !== 'function' || ruleOn_('finder-members'))) return finderMembersOnly_(F);
  const credits = USER ? (USER.credits || 0) : 0;
  /* The control must SAY what it is doing. § */
  const sel = (what, v) => STUFF[what] === v ? ' selected' : '';

  /* `#stuff-controls` MARKS THIS PAGE so the rest of the screen can find it. § */
  /* THE CREDITS STAY ON THE QUESTION and the way in and out does not — see `accountPages_`. A number
     is a fact about you and belongs beside the thing it is spent on; a button is a control and has
     earned a page of its own. */
  /* ---------- YOUR CREDITS WERE HERE, AND A BALANCE IS NOT A SEARCH CONTROL § */
  /* THE BOX AND THE BIN ARE ONE ROW — see `filterClear_`. `#stuff-clear` is the slot `paintStuff`
     rewrites; the input is never rewritten, which is what keeps its focus across a press. */
  const controls = `<div id="${F.id}-controls">`
    + `<div class="find-search"><input class="search" id="${F.id}-q" placeholder="Search…" value="${esc(STUFF.q)}"><span id="${F.id}-clear">${filterClear_()}</span></div>
    ${/* THE SORT WAS HERE — a dropdown offering A–Z and, when anything had a price, cheapest first. § */
          ''}
    <div id="${F.id}-chips">${filterChips()}</div>
    ${/* THE COUNT LINE WAS HERE — "565 of 565 · 27 pages". § */
          ''}
    <div id="${F.id}-groups">${stuffQuestion()}</div>
    ${/* SAVED IS NOT ON THIS PAGE AT ALL. It is the pages BEFORE this one — see `savedPages_`. */''}
    ${/* THE FINDER ITSELF TAKES A SUGGESTION TOO (494): "should be on finder widget too". */
      typeof suggestTile_ === 'function' && suggestTile_('finder', F.id, F.id === 'res' ? 'Find 2' : 'Find')
        ? `<div class="tile-row rep-row find-sg">${suggestTile_('finder', F.id, F.id === 'res' ? 'Find 2' : 'Find')}</div>` : ''}
  </div>`;

  /* THE CONTROLS ARE A PAGE, and the results are the pages after it. § */
  /* Empty pages. `fillStuffPages` puts markup in the ones you can reach, after the screen exists
     — a page cannot be measured or moved until it is in the document. */
  /* ---------- BOOKING IS A THING YOU FIND § */
  /* WHAT YOU ARE PAYING FOR, THEN WHAT YOU KEPT, THEN THE QUESTION. The basket first because it is
     the one with a deadline on it — a thing you meant to buy and forgot is a worse outcome than a
     thing you meant to look at again. */
  /* ---------- WHAT IS PUT IN FRONT OF YOU, THE QUESTION, THEN WHAT YOU KEPT § */
  /* ---------- SPOTLIGHT WAS THE FIRST GROUP HERE AND IT IS A COLUMN NOW § */
  /* ---------- THE DRAW BUILDS THE WINDOW, NOT ONE EMPTY PAGE PER RESULT § */
  /* ---------- AND THE CARD YOU WERE ON, BY NAME, NOT BY NUMBER § */
  libPagesFresh_();
  const held = stuffHeld_();
  const front = frontPages_();
  const keep = 1 + front.length;
  const want = stuffPageCount();
  stuffBackTo_(held, keep);
  PAGE_KEEP[F.id] = keep;
  PAGE_LO[F.id] = stuffLo_(want, keep, PAGE_LO[F.id]);
  /* AND THE WINDOW IS FILLED A MOMENT LATER, because a page cannot be filled until it is in the document and `paint` writes the markup after this returns. § */
  /* `F` CAPTURED: the microtask runs after this binding has ended (`inFinder_`). */
  /* NOT WHEN THE BUILDER DRAWS IT (`AHEAD.running`, shell.js; docs/history/341). § */
  const ahead = typeof AHEAD !== 'undefined' && !!AHEAD.running;
  if (typeof queueMicrotask === 'function' && !ahead) {
    queueMicrotask(() => { try { inFinder_(F, () => {
      if (!$(F.id + '-controls')) return;
      fillStuffPages();
      if (stuffOnGlass_(F.id) && stuffBandFill_()) settle_(true);
    }); } catch (e) {} });
  }
  /* `is-res` IS "A PAGE OF RESULTS", as it always was — older than Find 2's `res` id, and nothing to
     do with it: `#s-res .page.is-res` is a result page of Find 2. */
  return pages(F.id, [controls].concat(front))
    + '<section class="page is-res"><div class="pane"></div></section>'.repeat(Math.min(want, STUFF_WIN));
}
screen('stuff', () => inFinder_(FINDERS.stuff, finderScreen_));
/* FIND 2 — the owner's *"finder 2"*, the column right of Find: *"an identical second finder"* (12 Oct),
   the same list and the same questions with a state of its own. */
screen('res', () => inFinder_(FINDERS.res, finderScreen_));
/* THE `basket ‧ 2` LINK WENT WITH THE SHEET IT OPENED. The basket is the page in front of this one
   — one swipe, and the pager names it — so a control that jumps there is a shortcut to somewhere
   already visible. */

/* Typed into rather than pressed, so it cannot go through the click handler. § */
/* EACH FINDER'S BOX TYPES INTO ITS OWN WORDS, with its own debounce (`stuffTimer` is parked per
   finder), and the repaint the timer books is bound again — it fires after this binding has ended. */
let stuffTimer = null;
document.addEventListener('input', e => {
  const m = /^([a-z]+)-q$/.exec(String((e.target && e.target.id) || ''));
  const F = m && finderOf_(m[1]);
  if (!F) return;
  inFinder_(F, () => {
    STUFF.q = e.target.value;
    clearTimeout(stuffTimer);
    stuffTimer = setTimeout(() => inFinder_(F, paintStuff), 180);
  });
});

/* `on('stuff-set')` WAS HERE, and the dropdown that sent it went when the funnel replaced the filter row. § */

/* ---------- THE DOCKET § */
/* ---------- `x ` AS THE DONE MARKER CORRUPTED ANY LINE STARTING WITH AN X § */
const DOCK_DONE = /^-\s*\[\s*x\s*\]\s+/i;
const DOCK_OPEN = /^-\s*\[\s*\]\s+/;
const DOCK_OLD  = /^(x|\u2713)\s+/i;

function docketLines() {
  return String((USER && USER.todo) || '').split(/\r?\n/)
    .map(t => t.trim()).filter(Boolean)
    .map(t => {
      if (DOCK_DONE.test(t)) return { done: true,  text: t.replace(DOCK_DONE, '') };
      if (DOCK_OPEN.test(t)) return { done: false, text: t.replace(DOCK_OPEN, '') };
      /* THE OLD FORM, READ ONLY — tried last, so a new-style line can never reach it. */
      if (DOCK_OLD.test(t))  return { done: true,  text: t.replace(DOCK_OLD, '') };
      return { done: false, text: t };
    })
    /* A LINE THAT WAS NOTHING BUT A MARKER leaves an empty text, and an empty row is a row you
       cannot tick, delete or read. Dropped here rather than drawn. */
    .filter(l => l.text);
}

/* WRITTEN WITH THE BOX EVERY TIME, done or not. An undone line with no marker would read back
   correctly today, and then two forms would be in circulation and the next person would have to
   know that. One form out. */
const docketText = list =>
  list.map(l => (l.done ? '- [x] ' : '- [ ] ') + l.text).join('\n');

/* Kept in step on the phone first, then sent. A tick that waits for a round trip before moving is
   a tick that feels broken on a train — and this is a scrap of paper, not a payment. */
let dockTimer = null;
function docketSave(list) {
  if (!USER) return;
  USER.todo = docketText(list);
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  paintDocket();

  /* Debounced, because ticking four things off in four seconds is one intention and four writes
     to a spreadsheet cell. The last one wins and the three before it were never worth sending. */
  clearTimeout(dockTimer);
  const said = $('dock-said');
  if (said) said.textContent = 'Saving…';
  /* AND BOOKED TO GO AS THE PAGE GOES (`keepDue_`, data.js; 317). */
  const sendTodo = keepalive => {
    clearTimeout(dockTimer);
    keepDue_('docket', null);
    if (!USER) return;
    return api({ action: 'saveTodo',
      name: USER.name, personId: USER.personId, todo: USER.todo }, keepalive ? { keepalive: true } : undefined)
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        const el = $('dock-said');
        if (el) el.textContent = 'Saved';
      })
      .catch(err => {
        /* SAID, not swallowed. A list that looks saved and is not is worse than one that never
           pretended — you find out by opening it tomorrow to nothing. */
        const el = $('dock-said');
        if (el) el.textContent = String(err.message || 'Not saved — no connection.');
      });
  };
  dockTimer = setTimeout(sendTodo, 900);
  keepDue_('docket', sendTodo);
}

function paintDocket() {
  const host = $('docket-body');
  if (!host) return;
  if (!USER) { host.innerHTML = '<p class="empty">Sign in to keep a docket.</p>'; return; }
  /* Google Tasks lives with the tasks it copies, not in Student settings (491). */
  const gt = $('docket-gtasks');
  if (gt) gt.innerHTML = typeof gtasksCard_ === 'function' ? gtasksCard_() : '';

  const list = docketLines();
  if (!list.length) {
    host.innerHTML = '<p class="faint" style="padding:.4rem 0">Nothing on it.</p>';
    return;
  }
  const left = list.filter(l => !l.done).length;

  /* ---------- A ROW IS IDENTIFIED BY ITS TEXT, NOT BY WHERE IT SITS § */
  host.innerHTML = list.map((l, i) => `
    <label class="dock-row${l.done ? ' done' : ''}">
      <input type="checkbox" data-do="dock-tick" data-i="${i}" data-t="${esc(l.text)}"
             ${l.done ? 'checked' : ''}>
      <span class="box"></span>
      <span class="dock-text">${mark(l.text)}</span>
      ${/* A BUTTON, NOT A SPAN. § */
            ''}
      <button type="button" class="text-drop" data-do="dock-drop" data-i="${i}"
              data-t="${esc(l.text)}" aria-label="Remove ${esc(l.text)}">\u2715</button>
    </label>`).join('')
    + `<div class="row" style="border:0;padding:.4rem 0 0">
        <span class="k">${left ? left + ' left' : 'All done'}</span>
        ${list.length > left
          ? '<span class="v"><button class="btn quiet tiny" data-do="dock-clear">Clear done</button></span>'
          : ''}
      </div>`;
}

/* WHICH ROW THE TAP MEANT. See the note in `paintDocket`: the index is a hint, the text is the
   identity, because the list can be renumbered between the draw and the tap. */
function dockRow_(list, el) {
  const i = Number(el.dataset.i);
  const t = el.dataset.t;
  if (t === undefined) return list[i] ? i : -1;        // no text to match on: markup from before
  if (list[i] && list[i].text === t) return i;
  return list.findIndex(l => l.text === t);
}

on('dock-tick', el => {
  const list = docketLines();
  const i = dockRow_(list, el);
  /* REDRAWN IF THE ROW HAS GONE, so the box does not sit checked against a line that is not there
     — the checkbox has already moved itself by the time this runs. */
  if (i < 0) { paintDocket(); return; }
  list[i].done = !!el.checked;
  docketSave(list);
});

/* Dropping one is immediate and has no undo, which is right for a line somebody wrote thirty
   seconds ago — a confirmation on a scrap of paper is a confirmation nobody reads. */
on('dock-drop', (el, e) => {
  /* It sits inside the label, so without this a tap would toggle the tick on its way past. § */
  e?.preventDefault?.();
  e?.stopPropagation?.();
  const list = docketLines();
  const i = dockRow_(list, el);
  if (i < 0) { paintDocket(); return; }               // already gone: redraw, delete nothing
  list.splice(i, 1);
  docketSave(list);
});

on('dock-clear', () => docketSave(docketLines().filter(l => !l.done)));

on('dock-add', () => {
  const box = $('dock-add');
  const text = (box && box.value || '').trim();
  if (!text) { box?.focus(); return; }
  const list = docketLines();
  /* NEW LINES GO AT THE BOTTOM. A list that grows from the top moves everything you were reading
     every time you add to it, which on a phone means losing your place to your own typing. */
  list.push({ done: false, text });
  if (box) { box.value = ''; box.focus(); }
  docketSave(list);
});

/* Enter adds it. A phone keyboard shows "return" over that field and pressing it doing nothing is
   the smallest possible way to make a form feel broken. */
document.addEventListener('keydown', e => {
  if (e.target && e.target.id === 'dock-add' && e.key === 'Enter') {
    e.preventDefault();
    ACTIONS['dock-add']?.();
  }
});

/* ---------- THE NOTEPAD § */
/* WHETHER THIS BOX MAY KEEP A SWIPE IS A FACT ABOUT WHAT IS IN IT, AND ONLY THE APP CAN ASK. § */
function padReach_(pad) {
  if (!pad) return;
  try {
    pad.style.touchAction = pad.scrollHeight > pad.clientHeight + 6 ? 'pan-y' : 'none';
  } catch (e) {}
}

function initPad() {
  const pad = $('notepad');
  if (!pad) return;
  pad.value = (USER && USER.notepad) || '';
  pad.disabled = !USER;
  padReach_(pad);
  const said = $('pad-said');
  if (said) said.textContent = USER ? 'Saves as you type.' : 'Sign in to keep notes.';
}

let padTimer = null;
document.addEventListener('input', e => {
  if (e.target.id !== 'notepad' || !USER) return;
  padReach_(e.target);
  USER.notepad = e.target.value;
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  clearTimeout(padTimer);
  const said = $('pad-said');
  if (said) said.textContent = 'Saving…';
  /* Longer than the docket's, because this is typed continuously rather than tapped. § */
  padTimer = setTimeout(padSend_, 1400);
  keepDue_('notepad', padSend_);
});
function padSend_(keepalive) {
  clearTimeout(padTimer);
  keepDue_('notepad', null);
  if (!USER) return;
  return api({ action: 'saveNotepad',
    name: USER.name, personId: USER.personId, notepad: USER.notepad }, keepalive ? { keepalive: true } : undefined)
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      const el = $('pad-said');
      if (el) el.textContent = 'Saved';
    })
    .catch(err => {
      const el = $('pad-said');
      if (el) el.textContent = String(err.message || 'Not saved — no connection.');
    });
}
/* ---------- MEASURING ON THE FIGURE (385): "There needs to be a protocol for this type of question. Like protractor tool." */
/* WHICH TOOLS A PART NEEDS: a protractor where it asks for an angle or a bearing, a ruler where it asks for a length -- only where it says "measure" and has a figure */
/* THE FIGURE ON A PART'S CARD: its own, else its question's opening's carried onto it (500) -- so 16(a)'s graph has the ruler too. */
const cardDiagram_ = x => (x && (x.diagram || (x.kind === 'question' && (stemOnCard_(x) || {}).diagram))) || '';
function measTools_(x) {
  if (!x || x.kind !== 'question' || !cardDiagram_(x)) return [];
  /* UNDER THE PEN the picture is the pen's, and its bar has the instruments (`padToolsOf_`) */
  const pen = padSource_(x);
  if (pen && pen.from === 'part' && (typeof ruleOn_ !== 'function' || ruleOn_('meas-under-pen'))) return [];
  /* EVERY FIGURE HAS BOTH (502): the subject list and the word "measure" were flags a row could lack; only a subject of words is left out, and the admin can flip that */
  const subj = String(x.subject || (x.row && x.row.subject) || '');
  if (subj && QT_WORDY_SUBJECT.test(subj) && (typeof ruleOn_ !== 'function' || ruleOn_('meas-wordy'))) return [];
  return ['protractor', 'ruler'];
}
const MEAS_FACE = { protractor: { icon: 'protractor', label: 'Protractor', note: 'on the figure' },
                    ruler: { icon: 'ruler', label: 'Ruler', note: 'on the figure' } };
function measTiles_(x) {
  const k = x && x.key || '';
  /* A CARD DRAWN AGAIN WHILE ITS TOOL IS OUT gets the tool back on its new figure, once the markup is in */
  if (MEAS && MEAS.k === k && typeof setTimeout === 'function') setTimeout(measRepaint_, 0);
  return measTools_(x).map(t => tile_(Object.assign({ act: 'q-measure', cls: 'q-meast', data: { tool: t, key: k },
    on: !!(MEAS && MEAS.k === k && MEAS.tool === t), pressed: !!(MEAS && MEAS.k === k && MEAS.tool === t) }, MEAS_FACE[t]))).join('');
}
/* THE TOOL ON THE GLASS: which card, which tool, its centre (protractor) or zero (ruler) in the figure's own units, its turn in degrees */
let MEAS = null;
const MEAS_SNAP_PX = 14;    // nearer than this to a corner, the tool's centre or zero sits on it
const MEAS_TURN_DEG = 8;    // nearer than this to an arm's direction, the baseline lies along it

/* THE FIGURE'S CORNERS AND ARMS, read from its lines, polygons and paths: { pts: [[x, y]], segs: [[x1, y1, x2, y2]] } */
function measGeom_(svg) {
  const segs = [], num = s => String(s || '').trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  svg.querySelectorAll('line').forEach(l => segs.push(['x1', 'y1', 'x2', 'y2'].map(a => +l.getAttribute(a) || 0)));
  svg.querySelectorAll('polygon, polyline').forEach(p => {
    const v = num(p.getAttribute('points')), P = [];
    for (let i = 0; i + 1 < v.length; i += 2) P.push([v[i], v[i + 1]]);
    if (p.tagName.toLowerCase() === 'polygon' && P.length > 2) P.push(P[0]);
    for (let i = 1; i < P.length; i++) segs.push([P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]]);
  });
  svg.querySelectorAll('path').forEach(p => {
    const d = p.getAttribute('d') || '';
    if (/[aAcCqQsStT]/.test(d)) return;
    let at = null;
    (d.match(/[MLml][^MLmlZz]*/g) || []).forEach(c => {
      const v = num(c.slice(1));
      for (let i = 0; i + 1 < v.length; i += 2) {
        const q = /[ml]/.test(c[0]) && at ? [at[0] + v[i], at[1] + v[i + 1]] : [v[i], v[i + 1]];
        if (at && !(/[Mm]/.test(c[0]) && i === 0)) segs.push([at[0], at[1], q[0], q[1]]);
        at = q;
      }
    });
  });
  const pts = [];
  segs.forEach(s => [[s[0], s[1]], [s[2], s[3]]].forEach(p => { if (!pts.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1)) pts.push(p); }));
  return { pts, segs };
}
/* THE OVERLAY, in the figure's own units over its picture -- so a reading on it is a reading on the paper's drawing */
function measDraw_(fig) {
  fig.querySelectorAll('.meas').forEach(o => o.remove());
  if (!MEAS) return;
  const svg = [...fig.children].find(c => c.tagName.toLowerCase() === 'svg' && !c.classList.contains('meas'));
  if (!svg) return;
  const vb = (svg.getAttribute('viewBox') || '0 0 340 340').split(/[\s,]+/).map(Number);
  const r = svg.getBoundingClientRect(), u = r.width ? vb[2] / r.width : 1;   // figure units per screen px
  const g = MEAS, R = g.R, T = 'translate(' + g.c[0].toFixed(2) + ' ' + g.c[1].toFixed(2) + ') rotate(' + g.rot.toFixed(2) + ')';
  let body = '';
  if (g.tool === 'protractor') {
    body += `<path class="meas-body" d="M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 Z"/>`;
    for (let a = 0; a <= 180; a += 5) {
      const t = a * Math.PI / 180, c = Math.cos(t), s = -Math.sin(t), L = a % 10 ? 0.05 : a % 30 ? 0.08 : 0.12;
      body += `<path class="meas-tick" d="M ${(R * c).toFixed(2)} ${(R * s).toFixed(2)} L ${(R * (1 - L) * c).toFixed(2)} ${(R * (1 - L) * s).toFixed(2)}"/>`;
      if (!(a % 30)) {
        const o = R * 0.8, i = R * 0.64;
        body += `<text class="meas-num" x="${(o * c).toFixed(2)}" y="${(o * s).toFixed(2)}" font-size="${(R * 0.08).toFixed(2)}">${a}</text>`
          + `<text class="meas-num meas-in" x="${(i * c).toFixed(2)}" y="${(i * s).toFixed(2)}" font-size="${(R * 0.07).toFixed(2)}">${180 - a}</text>`;
      }
    }
    body += `<path class="meas-tick" d="M ${-R} 0 L ${R} 0 M 0 ${-R * 0.06} L 0 ${R * 0.06} M ${-R * 0.06} 0 L ${R * 0.06} 0"/>`;
  } else {
    const W = g.L, H = Math.max(8, 30 * u), cm = g.cm;
    body += `<rect class="meas-body" x="0" y="0" width="${W.toFixed(2)}" height="${H.toFixed(2)}"/>`;
    for (let mm = 0, x = 0; x <= W + 1e-6; mm++, x = mm * cm / 10) {
      const L = mm % 10 ? (mm % 5 ? 0.25 : 0.4) : 0.55;
      body += `<path class="meas-tick" d="M ${x.toFixed(2)} 0 L ${x.toFixed(2)} ${(H * L).toFixed(2)}"/>`;
      if (!(mm % 10)) body += `<text class="meas-num" x="${x.toFixed(2)}" y="${(H * 0.85).toFixed(2)}" font-size="${(H * 0.32).toFixed(2)}">${mm / 10}</text>`;
    }
  }
  /* THE TURNING HANDLE, a fingertip wide wherever the figure is drawn small, at whichever end of the tool is on the glass */
  const reach = 30 * u, m = svg.getScreenCTM();
  /* ONLY WHERE THE FIGURE IS: a handle past the picture's edge cannot be pressed; failing all, it sits on the tool itself */
  const spots = g.tool === 'protractor' ? [[-R - reach, 0], [R + reach, 0], [0, -R - reach], [-R * 0.45, -R * 0.3], [R * 0.45, -R * 0.3]]
    : [[g.L + reach, 0], [-reach, 0], [g.L / 2, -reach], [g.L * 0.75, 20 * u]];
  const box = r;
  const onGlass = p => {
    if (!m) return true;
    const t = g.rot * Math.PI / 180, q = svg.createSVGPoint();
    q.x = g.c[0] + p[0] * Math.cos(t) - p[1] * Math.sin(t); q.y = g.c[1] + p[0] * Math.sin(t) + p[1] * Math.cos(t);
    const z = q.matrixTransform(m);
    return z.x > Math.max(26, box.left + 24) && z.x < Math.min(innerWidth - 26, box.right - 24) && z.y > Math.max(26, box.top + 24) && z.y < Math.min(innerHeight - 26, box.bottom - 24);
  };
  if (!g.hold) g.h = spots.find(onGlass) || spots[spots.length - 1];
  const hx = g.h[0], hy = g.h[1];
  body += `<circle class="meas-turn" cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" r="${(24 * u).toFixed(2)}"/>`
    + `<path class="meas-turn-i" d="M ${(hx - 8 * u).toFixed(2)} ${hy.toFixed(2)} A ${(8 * u).toFixed(2)} ${(8 * u).toFixed(2)} 0 1 1 ${hx.toFixed(2)} ${(hy + 8 * u).toFixed(2)}"/>`;
  const o = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  o.setAttribute('class', 'meas');
  o.setAttribute('viewBox', vb.join(' '));
  o.setAttribute('data-noswipe', '');
  o.setAttribute('data-tool', g.tool);
  o.setAttribute('data-c', g.c.map(v => v.toFixed(2)).join(','));
  o.setAttribute('data-rot', g.rot.toFixed(2));
  o.setAttribute('aria-label', g.tool === 'protractor' ? 'Protractor: drag it, turn it with two fingers or the round handle' : 'Ruler: drag it, turn it with two fingers or the round handle');
  o.innerHTML = `<g transform="${T}">${body}</g>`;
  fig.classList.add('meas-host');
  /* EXACTLY OVER THE PICTURE, not the figure's whole box: the same viewBox on the same rectangle is the same units */
  const hr = fig.getBoundingClientRect();
  o.style.left = (r.left - hr.left) + 'px'; o.style.top = (r.top - hr.top) + 'px';
  o.style.width = r.width + 'px'; o.style.height = r.height + 'px';
  o.setAttribute('preserveAspectRatio', svg.getAttribute('preserveAspectRatio') || 'xMidYMid meet');
  fig.appendChild(o);
}
function measFig_(k) {
  const card = [...document.querySelectorAll('#screen .page.on .qcard, .qcard')].find(c => c.querySelector(`[data-k="${CSS.escape(k)}"]`) || c.querySelector(`.q-meast[data-key="${CSS.escape(k)}"]`));
  const pick = c => c && [...c.querySelectorAll('figure svg')].find(s => !s.classList.contains('meas') && !s.closest('svg.meas') && s.parentNode.closest('figure'));
  let svg = pick(card);
  /* A PART WHOSE WORDS RAN ON TO A SECOND PAGE has its figure on the page before: the tool goes there */
  if (!svg && card) {
    const page = card.closest('.page'), prev = page && page.previousElementSibling;
    if (prev && prev.classList.contains('page') && /continued on the next page/i.test(prev.textContent)) svg = pick(prev);
  }
  return svg ? svg.parentNode : null;
}
on('q-measure', el => {
  const k = el.getAttribute('data-key') || '', tool = el.getAttribute('data-tool');
  const again = MEAS && MEAS.k === k && MEAS.tool === tool;
  const was = MEAS && measFig_(MEAS.k);
  MEAS = null;
  if (was) measDraw_(was);
  document.querySelectorAll('.q-meast').forEach(t => tileSet_(t, { on: false, pressed: false }));
  if (again) return;
  const fig = measFig_(k), svg = fig && fig.querySelector('svg');
  if (!svg) return;
  /* ON ANOTHER PAGE: turned to it, so the tool is where the child can see it */
  const pg = fig.closest('.page'), here = el.closest('.page');
  if (pg && here && pg !== here && typeof goPage === 'function') { const all = [...pg.parentNode.children].filter(c => c.classList.contains('page')); goPage('stuff', all.indexOf(pg), true); }
  const vb = (svg.getAttribute('viewBox') || '0 0 340 340').split(/[\s,]+/).map(Number);
  const G = measGeom_(svg);
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  /* THE RULER READS TRUE TO THE PAPER: the longest line is as long as the scheme says it is (the middle of its band), else 1 cm is a tenth of the figure */
  let cm = vb[2] / 10;
  const band = /(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*(cm|mm)/i.exec(String(x && (x.accept || (x.row || {}).accept) || ''));
  if (band && G.segs.length) {
    const len = Math.max(...G.segs.map(s => Math.hypot(s[2] - s[0], s[3] - s[1])));
    const want = (+band[1] + +band[2]) / 2 / (band[3].toLowerCase() === 'mm' ? 10 : 1);
    if (len > 0 && want > 0) cm = len / want;
  }
  MEAS = { k, tool, rot: 0, R: Math.min(vb[2], vb[3] * 2) * 0.36, cm, L: Math.min(vb[2] * 0.9, cm * Math.max(5, Math.floor(vb[2] * 0.9 / cm))),
           c: tool === 'protractor' ? [vb[0] + vb[2] / 2, vb[1] + vb[3] * 0.7] : [vb[0] + vb[2] * 0.05, vb[1] + vb[3] * 0.75], geom: G, vb };
  el.closest('.tile-row, .qp-bar') && el.parentNode.querySelectorAll(`.q-meast[data-tool="${tool}"]`).forEach(t => tileSet_(t, { on: true, pressed: true }));
  measDraw_(fig);
});
/* THE SNAP: the centre (or zero) onto a corner when near it; then the baseline (or edge) along an arm from that corner when near its direction */
function measSnap_(svg) {
  const g = MEAS, r = svg.getBoundingClientRect(), u = r.width ? g.vb[2] / r.width : 1;
  const near = g.geom.pts.map(p => ({ p, d: Math.hypot(p[0] - g.c[0], p[1] - g.c[1]) })).sort((a, b) => a.d - b.d)[0];
  if (!near || near.d > MEAS_SNAP_PX * u) return;
  g.c = near.p.slice();
  const dirs = [];
  g.geom.segs.forEach(s => {
    if (Math.hypot(s[0] - g.c[0], s[1] - g.c[1]) < 1) dirs.push(Math.atan2(s[3] - s[1], s[2] - s[0]) * 180 / Math.PI);
    if (Math.hypot(s[2] - g.c[0], s[3] - g.c[1]) < 1) dirs.push(Math.atan2(s[1] - s[3], s[0] - s[2]) * 180 / Math.PI);
  });
  const diff = (a, b) => { let d = ((a - b) % 360 + 540) % 360 - 180; return d; };
  /* A PROTRACTOR'S BASELINE IS A LINE BOTH WAYS from its centre; a ruler's edge runs one way from its zero */
  let best = null;
  dirs.forEach(a => [0, 180].forEach(f => {
    if (g.tool === 'ruler' && f) return;
    const d = Math.abs(diff(g.rot, a + f));
    if (d <= MEAS_TURN_DEG && (!best || d < best.d)) best = { d, a: a + f };
  }));
  if (best) g.rot = ((best.a % 360) + 360) % 360;
}
/* THE GESTURES (502): the tool is a rigid thing under the fingers -- each finger keeps the spot of the tool it first touched, by pointerId, so two fingers move and turn it exactly and may cross. */
/* One finger on the body drags; one on a ruler's end turns it about the other end; one on the round handle turns it about its centre; the wheel turns it 1° (Shift 0.2°). */
const MEAS_PT = new Map();   // pointerId -> { p: where it is now, l: the tool's own spot under it } in figure units
let MEAS_GO = null;          // { o: the overlay, mode: 'drag' | 'turn' | 'end' | 'two', piv: the tool's own spot that stays put }
const MEAS_GRID_DEG = 15, MEAS_GRID_NEAR = 2;   // within 2° of a multiple of 15° it settles there (0, 15, 30, 45, 90 ...)
const measAt_ = (svg, e) => { const m = svg.getScreenCTM(); if (!m) return [0, 0]; const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; const p = q.matrixTransform(m.inverse()); return [p.x, p.y]; };
const measRad_ = () => MEAS.rot * Math.PI / 180;
/* A FIGURE POINT TO THE TOOL'S OWN, AND BACK */
const measLocal_ = p => { const t = measRad_(), dx = p[0] - MEAS.c[0], dy = p[1] - MEAS.c[1]; return [dx * Math.cos(t) + dy * Math.sin(t), -dx * Math.sin(t) + dy * Math.cos(t)]; };
const measWorld_ = l => { const t = measRad_(); return [MEAS.c[0] + l[0] * Math.cos(t) - l[1] * Math.sin(t), MEAS.c[1] + l[0] * Math.sin(t) + l[1] * Math.cos(t)]; };
const measGridSnap_ = a => { const n = Math.round(a / MEAS_GRID_DEG) * MEAS_GRID_DEG; return Math.abs(a - n) <= MEAS_GRID_NEAR ? n : a; };
/* TURNED TO `rot` WITH THE TOOL'S OWN SPOT `l` LYING ON THE FIGURE POINT `p` */
function measPin_(rot, l, p) { MEAS.rot = rot; const w = measWorld_(l); MEAS.c = [MEAS.c[0] + p[0] - w[0], MEAS.c[1] + p[1] - w[1]]; }
/* ONLY THE POSE CHANGES WHILE A FINGER IS DOWN: the overlay is never rebuilt under it (that dropped the captured finger and moved the handle, 502) */
function measPose_(o) {
  const g = o && o.querySelector(':scope > g');
  if (!g || !MEAS) return;
  g.setAttribute('transform', 'translate(' + MEAS.c[0].toFixed(2) + ' ' + MEAS.c[1].toFixed(2) + ') rotate(' + MEAS.rot.toFixed(2) + ')');
  o.setAttribute('data-c', MEAS.c.map(v => v.toFixed(2)).join(','));
  o.setAttribute('data-rot', MEAS.rot.toFixed(2));
}
/* EVERY FINGER STILL DOWN TAKES THE SPOT IT IS ON NOW, so a finger added or lifted never makes the tool jump */
function measAnchor_() { MEAS_PT.forEach(v => { v.l = measLocal_(v.p); }); }
function measMode_(o, target) {
  const n = MEAS_PT.size;
  if (n >= 2) return { o, mode: 'two' };
  if (target && target.closest('.meas-turn, .meas-turn-i')) return { o, mode: 'turn', piv: [0, 0] };
  const f = [...MEAS_PT.values()][0];
  if (MEAS.tool === 'ruler' && f) {
    /* AN END is its last eighth, or a fingertip, whichever is shorter: turned about the other end */
    const r = o.getBoundingClientRect(), u = r.width ? MEAS.vb[2] / r.width : 1, E = Math.min(MEAS.L * 0.125, 40 * u);
    if (f.l[0] <= E) return { o, mode: 'end', piv: [MEAS.L, 0] };
    if (f.l[0] >= MEAS.L - E) return { o, mode: 'end', piv: [0, 0] };
  }
  return { o, mode: 'drag' };
}
document.addEventListener('pointerdown', e => {
  const o = e.target && e.target.closest && e.target.closest('svg.meas');
  const host = !o && MEAS_PT.size && e.target && e.target.closest && e.target.closest('.meas-host');
  if ((!o && !host) || !MEAS) return;
  const onTool = o && e.target.closest('.meas-body, .meas-tick, .meas-num, .meas-turn, .meas-turn-i');
  /* A SECOND FINGER MAY LAND ANYWHERE ON THE FIGURE, beside the tool, and turns it */
  if (!onTool && !MEAS_PT.size) return;
  const ov = o || host.querySelector('svg.meas');
  if (!ov) return;
  e.preventDefault();
  e.stopPropagation();
  try { ov.setPointerCapture(e.pointerId); } catch (err) {}
  const p = measAt_(ov, e);
  MEAS_PT.set(e.pointerId, { p, l: measLocal_(p) });
  measAnchor_();
  MEAS.hold = true;
  MEAS_GO = measMode_(ov, e.target);
}, true);
document.addEventListener('pointermove', e => {
  const G = MEAS_GO;
  if (!G || !MEAS || !MEAS_PT.has(e.pointerId)) return;
  if (e.cancelable) e.preventDefault();
  const me = MEAS_PT.get(e.pointerId);
  me.p = measAt_(G.o, e);
  if (G.mode === 'two') {
    const [a, b] = [...MEAS_PT.values()];
    const want = Math.atan2(b.p[1] - a.p[1], b.p[0] - a.p[0]) - Math.atan2(b.l[1] - a.l[1], b.l[0] - a.l[0]);
    /* THE MIDPOINT OF THE TWO FINGERS STAYS UNDER THEM, whatever the snap took off the turn */
    const mid = [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2], lmid = [(a.l[0] + b.l[0]) / 2, (a.l[1] + b.l[1]) / 2];
    measPin_(measGridSnap_(want * 180 / Math.PI), lmid, mid);
  } else if (G.mode === 'drag') {
    measPin_(MEAS.rot, me.l, me.p);
  } else {
    const pw = measWorld_(G.piv);
    const want = Math.atan2(me.p[1] - pw[1], me.p[0] - pw[0]) - Math.atan2(me.l[1] - G.piv[1], me.l[0] - G.piv[0]);
    measPin_(measGridSnap_(want * 180 / Math.PI), G.piv, pw);
  }
  measPose_(G.o);
}, { capture: true, passive: false });
const measUp_ = e => {
  if (!MEAS_PT.has(e.pointerId)) return;
  MEAS_PT.delete(e.pointerId);
  const G = MEAS_GO;
  if (!G || !MEAS) { MEAS_GO = null; MEAS_PT.clear(); return; }
  if (MEAS_PT.size) {
    /* THE FINGER LEFT ON IT CARRIES ON from where it is now, dragging */
    measAnchor_();
    MEAS_GO = { o: G.o, mode: MEAS_PT.size >= 2 ? 'two' : 'drag' };
    return;
  }
  MEAS.hold = false;
  MEAS_GO = null;
  const fig = G.o.parentNode, svg = fig && [...fig.children].find(c => c.tagName.toLowerCase() === 'svg' && !c.classList.contains('meas'));
  if (svg) measSnap_(svg);
  if (fig) measDraw_(fig);
};
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, measUp_, true));
/* NO PINCH-ZOOM, SCROLL OR COLUMN SLIDE while a finger holds the tool */
['touchstart', 'touchmove'].forEach(ev => document.addEventListener(ev, e => {
  if (!MEAS) return;
  const t = e.target, on = t && t.closest && (t.closest('svg.meas .meas-body, svg.meas .meas-tick, svg.meas .meas-num, svg.meas .meas-turn, svg.meas .meas-turn-i') || (MEAS_PT.size && t.closest('.meas-host')));
  if ((on || MEAS_PT.size) && e.cancelable) e.preventDefault();
}, { capture: true, passive: false }));
document.addEventListener('wheel', e => {
  const o = e.target && e.target.closest && e.target.closest('svg.meas');
  if (!o || !MEAS) return;
  e.preventDefault();
  MEAS.rot += (e.deltaY > 0 ? 1 : -1) * (e.shiftKey ? 0.2 : 1);
  const fig = o.parentNode, svg = [...fig.children].find(c => c.tagName.toLowerCase() === 'svg' && !c.classList.contains('meas'));
  if (svg) measSnap_(svg);
  measDraw_(fig);
}, { passive: false });
/* A REPAINT REBUILDS THE CARD: the tool is drawn again on the new figure */
function measRepaint_() { if (MEAS) { const f = measFig_(MEAS.k); if (f) measDraw_(f); } }
/* A TURNED PHONE OR A RESIZED WINDOW moves the picture: the tool is laid over it again */
if (typeof addEventListener === 'function') addEventListener('resize', () => { if (MEAS) setTimeout(measRepaint_, 120); });
