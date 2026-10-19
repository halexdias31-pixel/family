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
                   front: () => [],
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

  /* ---------- THE PAPERWORK, AND IT IS A DEPARTMENT § */
  doc: { group: 'Paperwork', label: 'Documents', card: x => docCard_(x) },

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

  /* A widget's card is its name and nothing else — the thing itself is the page it opens. */
  /* ---------- BOXING IS A SUBJECT, NOT A DEPARTMENT § */
  /* LABELLED `Resources`, LIKE A TOPIC AND A PAST PAPER, because that is what the second question is asking: § */
  boxer: { group: 'Learning', label: 'Resources', card: x => boxerCard_(x) },
  /* A PRACTICAL IS A THING YOU FIND, which is why it is in the funnel at all and tools and games are not. § */
  practical: { group: 'Learning', label: 'Practicals', card: x => practicalCard_(x) },
  /* ---------- A PROJECT IS THE PRACTICAL'S SIBLING, NOT ONE OF ITS SHAPES § */
  project: { group: 'Learning', label: 'Projects', card: x => projectCard_(x) },
  /* ---------- `film` WAS A KIND HERE, AND THE FILMS ARE OFF FIND § */
  /* THE BOUTS. `boxers` is who; this is what happened. 157 of them sat in the sheet unread,
     because nothing in the app had ever been told the tab existed. */
  fight: { group: 'Learning', label: 'Resources', card: x => fightCard_(x) },
  /* ---------- `textbook` WAS HERE, AND EACH OF ITS CHAPTERS IS A CONTENT CARD NOW § */
  content: { group: 'Learning', label: 'Content', card: x => contentCard_(x) },
  /* ---------- THE BIBLE, AND THE ONE KIND THE PHONE ITSELF KEEPS FROM ALL BUT AN ADMIN § */
  bible: { group: 'Learning', label: 'Resources', card: x => bibleCard_(x) },

  /* ---------- TWO GROUPS, NOT ONE GROUP AND THEN THE SAME QUESTION AGAIN § */
  /* ---------- THESE TWO STAY IN THE TABLE AND NO LONGER ANSWER THE FIRST QUESTION § */
  tool: { group: 'Tools', label: 'Tools', card: x => widgetCard_(x) },
  game: { group: 'Games', label: 'Games', card: x => widgetCard_(x) },

  /* ---------- `link` WAS A KIND HERE, AND THE LINKS ARE OFF FIND § */

  /* A resource and a shop row share a card: to somebody looking for one they are the same kind of
     thing — a picture, a name, what it belongs to, and what it costs if it costs anything. */
  /* `topic` WAS HERE — the documents, labelled `Resources`. The funnel lists the questions inside
     them now and not the boxes; see the note above `questionItems`. */
  question: { group: 'Learning', label: 'Questions', card: (x, c) => thingCard_(x, c) },
  /* ---------- A QUESTION IS NOT A DIFFERENT KIND OF THING FROM ITS PAPER § */
  /* ---------- `question` WAS A KIND AND IS NOT ANY MORE § */
  /* ---------- THE SHOP HAS A COLUMN OF ITS OWN, AND THIS IS NOT A DOOR ANY MORE § */
  shop:  { group: 'Shop',     label: 'Things',    card: (x, c) => thingCard_(x, c) },
};

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
    const afford = x.kind === 'shop' && !free && credits >= x.cost;
    /* WHAT IT TAKES TO HAVE IT. § */
    const myLevel = Math.floor((Number(USER && USER.xp) || 0) / 10);
    /* ---------- AND A FOURTH ANSWER: NOBODY HAS PRICED IT § */
    const price = x.kind !== 'shop' ? ''
      : x.level > 0
        ? `<span class="price ${myLevel >= x.level ? 'can' : ''}">${
            myLevel >= x.level ? 'Level ' + x.level + ' — yours' : 'Level ' + x.level}</span>`
      : x.cost === undefined
        ? `<span class="price is-unpriced">not priced yet</span>`
      : `<span class="price ${free ? 'free' : afford ? 'can' : ''}">${
          free ? 'free' : x.cost + ' credits'}</span>`;
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
          <p class="crumb">${[x.company].concat(levelSaid_(x).length ? levelSaid_(x) : [x.keystage]).concat([
              x.bandType === 'year' ? (x.bandValue && 'Year ' + x.bandValue)
            : x.bandType === 'grade' ? (x.bandValue && 'Grade ' + x.bandValue)
            : x.bandType === 'stage' ? '' : x.bandValue, x.tier, yearOf(x)])
            .filter(Boolean).map(v => esc(String(v))).join(' <span class="faint">·</span> ')}</p>
          <h3>${esc(x.name)}${x.off ? ' <span class="faint">— deleted</span>' : ''}</h3>
          ${/* Its own second line: § */
                ''}
          ${/* THE YEAR, ON THE CARD. § */
                ''}
          ${/* WHO IT IS FROM, FIRST. § */
                ''}
          <p class="sub">${x.company
            ? `${mark(x.company)}${x.sub || x.subject ? ' <span class="faint">· </span>' : ''}` : ''}${
            mark(x.sub || x.subject || '')}${yearOf(x)
            ? ` <span class="mono faint">· ${esc(yearOf(x))}</span>` : ''}${x.wearable && x.slot
            /* WHERE IT GOES. Until there are drawings, the slot is the only thing on the card that
               says what the object actually is — "Cape · shoulders" is a garment and "Cape" on its
               own is a word. */
            ? ` <span class="faint">· ${esc(x.slot)}</span>` : ''}</p>
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
      label: (s && s.label) || base.label || k,
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

/* ONE WORD, ONE QUESTION — AND TWELVE WORDS WERE ANSWERS TO TWO. § */
const FACET_SAME_AS = {
  /* The Standards & Testing Agency publishes the KS2 SATs papers AND is the board on them, so its own name is in both columns on all 228 rows — spelled out in one § */
  standardstestingagency: 'sta',
};

const facetSame_ = v => {
  const k = spellKey_(v);
  return FACET_SAME_AS[k] || k;
};

/* The raw reader of another facet, off `FACETS` rather than off `facetList()`: § */
/* A MAP, BUILT ON FIRST USE — this is asked once per item per deferring facet while a question is tallied, and `FACETS` is a fixed array, so a `find` along it § */
let FACET_RAW = null;
const facetRaw_ = field => {
  if (!FACET_RAW) { FACET_RAW = new Map(); FACETS.forEach(f => { if (!FACET_RAW.has(f.field)) FACET_RAW.set(f.field, f); }); }
  return FACET_RAW.get(field);
};

/* Every value of one facet that the facet it defers to does NOT already give this item. */
function facetOwn_(facet, x) {
  const mine = asList_(facet.of(x));
  if (!facet.not || !mine.length) return mine;
  const other = facetRaw_(facet.not);
  if (!other) return mine;
  const theirs = new Set(asList_(other.of(x)).map(facetSame_));
  if (!theirs.size) return mine;
  const out = mine.filter(v => !theirs.has(facetSame_(v)));
  return out;
}

/* ---------- WHY THESE ARE UP HERE AND NOT BESIDE `bucketValues_` § */
/* THE GROUPINGS THEMSELVES — "grouping many subtopics into first larger topics", written out. § */
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

/* ---------- A VALUE -> LABEL TABLE, INVERTED ONCE SO THE LOOKUP IS A MAP RATHER THAN A SCAN § */
function bucketTable_(pairs) {
  const at = {};
  pairs.forEach(row => row[1].forEach(v => { at[norm(v)] = row[0]; }));
  const spelt = {};
  Object.keys(at).forEach(k => { spelt[spellKey_(k)] = at[k]; });
  const of = v => at[norm(v)] || spelt[spellKey_(v)] || '';
  of.order = pairs.map(row => row[0]);
  /* AND THE ANSWERS IN THE ORDER THE TABLE LISTS THEM, for a facet whose answers have an order of
     their own that the alphabet does not give -- see `orderOf` on What kind. */
  of.within = [].concat(...pairs.map(row => row[1]));
  return of;
}

/* WHAT YOU ARE HERE TO DO WITH IT. The six kinds are three errands, and which errand somebody is
   on is the thing they know before they know anything else. */
/* `People & places` (Tutors, Venues) WAS A THIRD ROW, and nothing could answer it: § */
/* `Links` left `Read or watch it` with the links themselves — see the note where `link` was in
   `KINDS`. */
/* `Projects` JOINS `Work through it`, BESIDE `Practicals`, and it has to be in this table at all: § */
/* `Bundles` IS AN ERRAND OF ITS OWN — printed papers, ordered — so it is placed beside the other two
   rather than filed under working through something; see `bundlesView_`. */
/* ---------- `Films` LEFT `Read or watch it`, AND THE ROW STAYS, HOLDING `Resources` ALONE § */
const KIND_BUCKET = bucketTable_([
  ['Work through it',  ['Questions', 'Answers', 'Practicals', 'Projects']],
  ['Order it',         ['Bundles']],
  /* `Content` FIRST, then the boxing and the Bible: a chapter is read, and it is the one a student
     reaches for beside a question, so it stands next to the work and ahead of the shelves. */
  ['Read or watch it', ['Content', 'Resources']],
]);

/* THE FOUR SCIENCES ARE ONE ANSWER UNTIL SOMEBODY WANTS ONE OF THEM. § */
const SUBJECT_BUCKET = bucketTable_([
  /* `Statistics` IS GCSE STATISTICS — the @family. § */
  ['Maths',             ['Maths', 'Statistics']],
  ['English',           ['English Language', 'English Literature']],
  ['Science',           ['Biology', 'Chemistry', 'Physics', 'Combined Science']],
  /* ---------- THE REST OF THE GCSE TIMETABLE, ONE @family. TEXTBOOK EACH § */
  ['Humanities',        ['Geography', 'History', 'Religious Studies']],
  /* A LANGUAGE IS NOT ENGLISH, which is the bucket it would otherwise have been guessed into. Greek
     was the first; the next language joins this row rather than getting one of its own. */
  ['Languages',         ['Greek', 'French', 'Spanish', 'German']],
  ['Social sciences',   ['Psychology', 'Sociology']],
  ['Business',          ['Business']],
  ['Technology',        ['Computer Science', 'Design and Technology', 'Food Preparation and Nutrition']],
  ['Arts',              ['Art and Design', 'Music', 'Drama', 'Media Studies']],
  ['Physical Education', ['Physical Education']],
  ['Boxing',            ['Boxing']],
]);

/* `AREA_BUCKET` WAS HERE — the national curriculum's strands, `Topic area`'s seven buckets, with A-level pure maths filed under Algebra. § */

/* GRADES IN THREES, which is how a tutor talks about them — "a grade 4 to 6 question" is a sentence somebody says and "Grade 4" alone is a precision nobody has § */
const GRADE_BUCKET = bucketTable_([
  ['Grades 1–3', ['Grade 1', 'Grade 2', 'Grade 3']],
  ['Grades 4–6', ['Grade 4', 'Grade 5', 'Grade 6']],
  ['Grades 7–9', ['Grade 7', 'Grade 8', 'Grade 9']],
]);

/* WHAT YOU HAVE TO HAVE IN FRONT OF YOU, by where you get it from: § */
const NEEDS_BUCKET = bucketTable_([
  ['Calculator allowed', ['Calculator']],
  ['Non-calculator',     ['No calculator']],
  ['Drawing kit',     ['Ruler', 'Protractor', 'Compass']],
  ['A sheet with it', ['Printed sheet', 'Equation booklet', 'Periodic table']],
  ['A lab',           ['Lab']],
]);

/* `PART_BUCKET` WAS HERE — Numbered, Lettered and Roman, the grouping for the `Question part`
   answers. The question is retired (see `RETIRED_FACETS`), so the table had nothing left to group. */

/* THE WEIGHT CLASSES, GROUPED THE WAY BOXING GROUPS THEM. § */
const DIVISION_BUCKET = bucketTable_([
  ['Heavyweight',          ['Heavyweight', 'Cruiserweight', 'Light heavyweight']],
  ['Middleweight',         ['Super middleweight', 'Middleweight', 'Light middleweight']],
  ['Welterweight',         ['Super welterweight', 'Welterweight', 'Light welterweight']],
  ['Lightweight',          ['Super lightweight', 'Lightweight', 'Super featherweight']],
  ['Featherweight',        ['Featherweight', 'Super bantamweight']],
  ['Bantamweight & below', ['Bantamweight', 'Super flyweight', 'Flyweight',
                            'Light flyweight', 'Minimumweight']],
]);

/* A SPAN IS FILED UNDER THE LEVEL IT GOES UP TO, and that is a decision rather than an observation. § */
const LEVEL_BUCKET = bucketTable_([
  /* `SATs`, ONE ANSWER, WHERE THIS WAS `KS1 SATs` AND `KS2 SATs` -- and before that `KS1` and `KS2`. § */
  ['SATs',    ['SATs', 'KS1 SATs', 'KS2 SATs', 'KS1', 'KS2']],
  ['KS3',     ['KS3', 'KS2–KS3']],
  ['GCSE',    ['GCSE', 'KS2–GCSE', 'KS3–GCSE']],
  /* FUNCTIONAL SKILLS IS ITS OWN QUALIFICATION, NOT A RUNG OF THIS ONE. § */
  ['Functional Skills', ['Functional Skills Entry Level', 'Functional Skills L1', 'Functional Skills L2']],
  ['A-Level', ['A-Level', 'AS', 'GCSE–A-level']],
]);

/* ---------- AND THE TWO THAT ARE COMPUTED RATHER THAN LISTED § */


function decadeBucket_(v) {
  const n = Number((String(v).match(/\d{4}/) || [])[0]);
  if (!n) return '';
  if (n < 1930) return 'Before 1930';
  if (n < 1950) return '1930s & 1940s';
  if (n < 1970) return '1950s & 1960s';
  if (n < 1990) return '1970s & 1980s';
  if (n < 2010) return '1990s & 2000s';
  return '2010s onwards';
}
decadeBucket_.order = ['Before 1930', '1930s & 1940s', '1950s & 1960s',
                       '1970s & 1980s', '1990s & 2000s', '2010s onwards'];

/* The 5-a-day levels and weeks, above `FACETS` because it is built as the file loads — see
   `fiveADayOf_` for the rest. */
const FIVE_LEVELS = ['Foundation', 'Foundation Plus', 'Higher', 'Higher Plus'];

const FACETS = [
  /* What sort of thing, first. It is the one question that changes which of the others make any
     sense at all — a wearable has a slot and no exam board, a paper the reverse. */
  /* WHAT FOR, before what kind. § */
  /* ---------- AN ITEM MAY OVERRIDE THE GROUP ITS KIND PUTS IT IN § */
  /* ---------- A DOOR IS NOT A FILTER, AND THE BALANCE RULE HAD TO BE TOLD § */
  { field: 'forLabel',  label: 'What for',    always: true,
    of: x => x.groups || kindOf_(x).group },
  /* `kindLabel` ON THE ITEM WINS, the same way `groups` does on the line above — so a thing placed
     under a group its kind does not belong to can also say what it is called there. */
  /* ---------- `Answers` IS A KIND, BESIDE `Questions` § */
  /* ---------- AND `Questions` MEANS QUESTIONS, NOT QUESTIONS AND THEIR ANSWERS § */
  { field: 'kindLabel', tag: true, orderOf: v => KIND_BUCKET.within.indexOf(v),
    bucketOf: KIND_BUCKET, bucketOrder: KIND_BUCKET.order, label: 'What kind',   always: true,
    of: x => {
      const k = x.kindLabel || kindOf_(x).label;
      if (!x || x.kind !== 'question') return k;
      const out = [k];
      if (questionHasAns_(x)) out.push('Answers');
      if (bundleable_(x)) out.push('Bundles');
      return out.length > 1 ? out : k;
    },
    /* THE TAG IS WHAT THIS PAGE IS, NOT EVERY DOOR THE ITEM STANDS BEHIND. § */
    tagOf: (x, page) => page === 'ans' ? 'Answers' : (x.kindLabel || kindOf_(x).label) },
  /* ---------- THE THIRD DOOR: WHICH SHELF OF THE RESOURCES § */
  { field: 'shelf', tag: true,     label: 'Shelf',       always: true, of: x => x.shelf || '' },
  /* ---------- THE BIBLE'S SIX QUESTIONS, IN THE OWNER'S ORDER § */
  { field: 'bibleTranslation', tag: true, label: 'Translation', only: 'bible', folder: true,
    of: x => x.kind !== 'bible' ? '' : x.bb ? x.bb.translation : (BIBLE.index ? BIBLE.index.translation : '') },
  { field: 'bibleTestament', tag: true, label: 'Testament', only: 'bible', folder: true,
    of: x => (x.bb ? x.bb.testament : ''), orderOf: v => bibleRank_('t', v) },
  { field: 'bibleGroup', tag: true, label: 'Group', only: 'bible', folder: true,
    of: x => (x.bb ? x.bb.group : ''), orderOf: v => bibleRank_('g', v) },
  { field: 'bibleBook', tag: true, label: 'Book', only: 'bible', folder: true,
    of: x => (x.bb ? x.bb.book : ''), orderOf: v => bibleRank_('b', v) },
  /* NO ORDER NEEDED: `cmpText` is numeric, so 2 comes before 10 and 100. */
  { field: 'bibleChapter', tag: true, label: 'Chapter', only: 'bible', folder: true, grid: true,
    of: x => (x.bb ? x.ch : '') },
  { field: 'bibleVerse', tag: true, label: 'Verse', only: 'bible', folder: true, grid: true,
    of: x => (x.bb ? x.v : '') },
  /* Only venues have one, so it is only ever asked once you are looking at venues — which is the coverage rule doing the work that a per-kind filter list would § */
  { field: 'borough',   label: 'Where',       of: x => x.borough || '' },
  /* `category` WAS HERE — `Category`, the links' own question. It went with the links; see
     `RETIRED_FACETS`, which stops a sheet row reading the column back off whatever else has one. */
  { field: 'subject', tag: true,
    bucketOf: SUBJECT_BUCKET, bucketOrder: SUBJECT_BUCKET.order,   label: 'Subject',     of: x => x.subject },
  /* `book` WAS HERE — `Book`, which @family. § */
  /* ---------- THE QUESTION THE FUNNEL HAD NEVER ASKED § */
  /* ---------- A QUESTION ANSWERS THESE ONLY IF IT IS A 1ST CLASS MATHS WORKSHEET § */
  /* ---------- `topicArea` WAS HERE — `Topic area`, the branch above the topic § */
  { field: 'topic', tag: true,     label: 'Topic',
    of: x => topicShown_(x) ? (x.topic || topicOf_(x)) : [] },
  /* Only boxers and bouts carry one, so the coverage rule keeps it out of the way of everything
     else — the same rule that hides `borough` unless you are looking at venues. */
  /* BEFORE THE WEIGHT, because "a boxer or a bout" is the question somebody has first and there
     are two answers to it, not twenty. */
  { field: 'boxKind', tag: true,   label: 'Boxers or fights', of: x => x.boxKind || '' },
  /* ---------- WHAT KIND OF PROJECT OR PRACTICAL, AND WHETHER A BOARD ASKS FOR IT § */
  { field: 'projectType', tag: true, label: 'Project or coursework', of: x => x.projectType || '' },
  { field: 'practicalType', tag: true, label: 'Experiment or build', of: x => x.practicalType || '' },
  { field: 'required', tag: true, label: 'Required', tagOnly: true,
    orderOf: v => PRAC_NEED.indexOf(v),
    of: x => x.kind !== 'practical' || !x.row ? ''
      : PRAC_NEED[x.row.excluded ? 2 : x.row.required ? 0 : 1] },
  /* ---------- THE DECADE COMES BEFORE THE WEIGHT § */
  { field: 'decade', tag: true,
    bucketOf: decadeBucket_, bucketOrder: decadeBucket_.order,    label: 'Decade',      of: x => decadesOf_(x) },
  { field: 'division', tag: true,
    bucketOf: DIVISION_BUCKET, bucketOrder: DIVISION_BUCKET.order,  label: 'Division',    of: x => x.division || '' },
  /* THIRD, and it was seventh. § */
  { field: 'documentType', tag: true, label: 'Type',     of: x => x.documentType },
  /* ---------- THREE BANDS, THREE QUESTIONS, BECAUSE THEY ARE NOT THE SAME QUESTION § */
  { field: 'bandValue', tag: true,
    bucketOf: GRADE_BUCKET, bucketOrder: GRADE_BUCKET.order, label: 'Grade',       of: x => x.bandValue && x.bandType === 'grade'
                                                    ? 'Grade ' + x.bandValue : '' },
  /* `School year`, NOT `Year`. § */
  { field: 'yearGroup', tag: true, label: 'School year',        of: x => x.bandValue && x.bandType === 'year'
                                                    ? 'Year ' + x.bandValue : '' },
  /* ---------- ONE LADDER, NOT TWO, AND THE SPELLING IS PART OF THE FAULT § */
  /* `not: keystage` WAS HERE — 27 rows had `KS3` typed into the level column and Key stage asked it first. § */
  { field: 'level', tag: true,
    bucketOf: LEVEL_BUCKET, bucketOrder: LEVEL_BUCKET.order,     label: 'Level',       of: x => levelOf_(x) },
  /* ---------- A RESOURCE CAN BELONG TO MORE THAN ONE KEY STAGE § */
  { field: 'keystage', tag: true,  label: 'Key stage', of: x =>
      (LEVEL_BUCKET(levelOf_(x)) === 'SATs' ? satsStagesOf_(x) : []) },
  { field: 'examBoard', tag: true, label: 'Exam board',  of: x => x.examBoard },
  /* ---------- `A-Level` IS NOT A TIER, AND IT WAS AN ANSWER TO THIS QUESTION § */
  { field: 'tier', tag: true,      label: 'Tier',        not: 'level', of: x => x.tier },
  /* Through `waveOf`, for the same reason `year` goes through `yearOf` one line below: § */
  /* `Sitting`, NOT `Exam wave`. "Wave" is the column's name and nobody outside this repo says it.
     The facets tab can still relabel it. */
  /* ---------- A SITTING IS TWO QUESTIONS: THE SERIES, THEN THE YEAR § */
  /* ---------- THE YEAR, THEN THE MONTH, THEN THE PAPER — LIKE THE FOLDERS THEY CAME FROM § */
  /* NO LONGER PAIRED INTO `2023 & 2024` -- the years are drawn as they are (see `bucketLabels_`). */
  { field: 'examYear', tag: true, folder: true,
    label: 'Year', cmp: (a, b) => Number(b) - Number(a), of: x => sittingOf_(x).year },
  { field: 'examMonth', tag: true, folder: true, label: 'Month',
    cmp: (a, b) => MONTH_NAMES.indexOf(a) - MONTH_NAMES.indexOf(b), of: x => sittingMonth_(x) },
  /* Through `yearOf`, so a paper whose year lives only inside "June 2024" is filterable by year
     without anybody having to type it into a second column to make the filter work. */
  { field: 'year',      label: 'Year',        of: x => yearOf(x) },
  /* ---------- `Publisher`, AND IT WAS LABELLED `Paper code` OVER PUBLISHERS § */
  { field: 'company',   label: 'Publisher',   not: 'examBoard', of: x => x.company },
  /* ---------- WHAT YOU NEED IN FRONT OF YOU § */
  /* `showOf` SAYS THE CALCULATOR THE WAY THE CARD'S TAG DOES -- `Non-calculator`, `Calculator allowed`
     -- and matches by the cell's own value, which is what `showOf` is for. See `needsSay_`. */
  /* `tagOnly` SINCE 18 Oct: § */
  { field: 'needs', tag: true, tagOnly: true,
    bucketOf: NEEDS_BUCKET, bucketOrder: NEEDS_BUCKET.order,     label: 'What you need', of: x => asList_(x.needs),
    showOf: v => needsSay_(v) },
  /* ---------- `paper` — "PRINTED?" — WAS HERE, AND IT WAS NOT A QUESTION § */
  /* ---------- `paperName` — "WHICH PAPER" — WAS HERE § */
  /* ---------- TWO MORE RUNGS ON THE SAME LADDER § */
  /* ---------- ONLY WHERE A QUESTION NUMBER MEANS SOMETHING § */
  /* ---------- THE FACET THAT IS ALWAYS TOO BIG TO ASK, DELIBERATELY § */
  /* ---------- A PAPER IS AN ANSWER, NOT A SECOND WAY OF ASKING § */
  /* ---------- A 5-A-DAY IS FOUND BY ITS LEVEL, ITS MONTH AND ITS DAY § */
  { field: 'fiveLevel', tag: true, label: 'Level',       of: x => fiveADay_(x) ? x.tier || '' : '',
    orderOf: v => FIVE_LEVELS.indexOf(v) },
  { field: 'fiveMonth', tag: true, label: 'Month',       of: x => { const d = fiveADay_(x); return d ? d.month : ''; },
    orderOf: v => MONTH_NAMES.indexOf(v) },
  { field: 'fiveDay', tag: true,   label: 'Day',         of: x => fiveADay_(x) ? x.row.paper_id : '',
    showOf: (id, ids) => fiveDayLabel_(id, ids) },
  { field: 'paperId', tag: true,   label: 'Paper', folder: true,
    of: x => (x.row && x.row.paper_id) || '',
    /* `said` IS WHAT THE YEAR AND MONTH CHIPS HAVE ALREADY SAID, and the label drops it — see `sittingUnsaid_`. § */
    showOf: (id, ids, said) => sittingUnsaid_(paperLabel_(id, ids), said),
    /* THE TAG IS THE ANSWER AS ITS OWN FOLDER DRAWS IT -- `Paper 1`, not the library-unique `Paper 1 (Non-Calculator) · Foundation — June 2024`: § */
    tagSay: (id, x) => paperTag_(x) },
  /* ---------- WHICH QUESTION, WHICH PART, WHICH PAGE, HOW MANY MARKS § */
  { field: 'qNumber', tag: true, label: 'Question', tagOnly: true,
    cmp: (a, b) => Number(a) - Number(b),
    of: x => x.kind === 'question' && x.qNumber != null && String(x.qNumber) !== '' ? String(x.qNumber) : '',
    showOf: v => 'Q' + v },
  { field: 'qPart', tag: true, label: 'Part', tagOnly: true, of: x => qSplitOf_(x).part },
  { field: 'qSub', tag: true, label: 'Sub-part', tagOnly: true,
    orderOf: v => romanVal_(String(v)), of: x => qSplitOf_(x).sub },
  { field: 'qPage', tag: true, label: 'Page', tagOnly: true, cmp: (a, b) => Number(a) - Number(b),
    of: x => { const n = qPagesOf_(x); return n > 1 ? Array.from({ length: n }, (_, i) => String(i + 1)) : ''; },
    /* THE ONE PAGE THIS IS, of the pages above. */
    tagOf: (x, page) => { const i = qPageAt_(x, page); return i && qPagesOf_(x) > 1 ? String(i) : ''; } },
  { field: 'qPages', tag: true, label: 'Pages', tagOnly: true, cmp: (a, b) => Number(a) - Number(b),
    of: x => { const n = qPagesOf_(x); return n > 1 ? String(n) : ''; },
    showOf: v => 'of ' + v,
    /* `of 2` IS HALF OF `2`: drawn where the page number is, because alone, on the answer or the
       opening, it is a count of nothing on the screen. */
    tagOf: (x, page) => { const n = qPagesOf_(x); return n > 1 && qPageAt_(x, page) ? String(n) : ''; } },
  { field: 'marks', tag: true, label: 'Marks', tagOnly: true, cmp: (a, b) => Number(a) - Number(b),
    of: x => Number(x && x.marks) > 0 ? String(Number(x.marks)) : '',
    showOf: v => v + ' mark' + (String(v) === '1' ? '' : 's') },
  { field: 'slot',      label: 'Goes on',     of: x => x.slot },
  /* ---------- "FREE" AND "NOT PRICED" ARE DIFFERENT ANSWERS, AND THIS SAID FREE TO BOTH § */
  { field: 'afford',    label: 'Price',
    of: x => x.cost == null ? ''
           : x.cost === 0 ? 'Free'
           : x.cost <= (USER ? USER.credits || 0 : 0) ? 'Can afford' : '' },
  /* ---------- HOW READY A PAPER IS, AS AN ANSWER YOU CAN PICK § */
  { field: 'health', tag: true,    label: 'Faithful', tagOnly: true,
    orderOf: v => HEALTH_BANDS.findIndex(b => b[0] === v),
    of: x => { const h = healthOf_(x); return h ? h.band : ''; } },
  /* THE SECOND HEALTH: can every part be answered here and marked without AI (library.js, `ableOf_`). */
  { field: 'answerable', tag: true, label: 'Answerable', tagOnly: true,
    orderOf: v => HEALTH_BANDS.findIndex(b => b[0] === v),
    of: x => { const h = healthOf_(x); return h && h.able ? h.able.band : ''; } },
];

/* ---------- THE FENCE: A CLOSED KIND'S QUESTIONS, AND ONLY ITS QUESTIONS § */
const FACET_ONLY = new Set(FACETS.map(f => f.only).filter(Boolean));
const LIST_KIND = new WeakMap();
function listKind_(items) {
  const k = items && items.length ? items[0].kind : '';
  if (!k || !FACET_ONLY.has(k)) return '';
  let out = LIST_KIND.get(items);
  if (out === undefined) { out = items.every(x => x && x.kind === k) ? k : ''; LIST_KIND.set(items, out); }
  return out;
}
const facetFenced_ = (items, facet) => (facet.only ? facet.only !== listKind_(items) : !!listKind_(items));

/* THE FUNNEL'S QUESTIONS, AS THE SHEET WANTS THEM. § */
/* ---------- KEYED ON THE PAYLOAD, THE WAY `allTopics` DOES IT § */
let FACET_LIVE = null, FACET_FROM = null;

/* ---------- A QUESTION THE SHEET INVENTED § */
/* ---------- A GROUPING FOR A QUESTION THE SHEET INVENTED § */
const SHEET_BUCKETS = {};

const facetFromSheet_ = f => ({
  field: f.field,
  label: f.label || String(f.field).replace(/_/g, ' '),
  fromSheet: true,
  bucketOf: SHEET_BUCKETS[f.field],
  bucketOrder: SHEET_BUCKETS[f.field] && SHEET_BUCKETS[f.field].order,
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
      if (!s) return Object.assign({}, f, { at: (i + 1) * 10, min: FACET_COVERAGE });
      if (s.active === false) return null;
      return Object.assign({}, f, {
        label: s.label || f.label,
        at:    facetNum_(s.order, (i + 1) * 10),
        /* A THRESHOLD OF ZERO IS A REAL ANSWER — "ask this however few can answer it" — so it
           cannot be treated as absent the way an empty cell is. `null` means the cell was blank;
           0 means somebody typed it. */
        min:   facetMin_(s.minCoverage),
      });
    })
    /* ---------- AND THE ONES THE CODE HAS NEVER HEARD OF § */
    .concat((src || [])
      .filter(f => f && f.field && !known[f.field] && f.active !== false && !RETIRED_FACETS[f.field])
      .map((f, i) => Object.assign(facetFromSheet_(f), {
        at:  facetNum_(f.order, 1000 + i),
        min: facetMin_(f.minCoverage),
      })))
    .filter(Boolean)
    /* ---------- A DOOR IS ASKED BEFORE A FILTER, AND THE SHEET CANNOT REORDER THAT § */
    .sort((a, b) => (b.always ? 1 : 0) - (a.always ? 1 : 0) || a.at - b.at);
  return FACET_LIVE;
}


/* ---------- WHAT A SPREADSHEET CELL IS ALLOWED TO DO TO THE FUNNEL § */
const facetNum_ = (v, fallback) => {
  const n = Number(v);
  return v === null || v === undefined || v === '' || !isFinite(n) ? fallback : n;
};

const facetMin_ = v => {
  const n = facetNum_(v, FACET_COVERAGE);
  if (n > 1) return Math.min(n / 100, 1);   /* typed as a percentage */
  return n < 0 ? 0 : n;
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
  /* ---------- A BAND MATCHES BY MEMBERSHIP, NOT BY LETTERS § */
  /* `facetOwn_` HERE TOO, OR THE FILTER DISAGREES WITH THE BUTTON. § */
  /* ---------- A BUCKET MATCHES BY MEMBERSHIP, AND IT SAYS SO RATHER THAN LOOKING LIKE IT § */
  if (f.bucket) return facetOwn_(facet, x).some(v => bucketHas_(facet, f.value, v));
  return facetOwn_(facet, x).some(v => spellKey_(v) === spellKey_(f.value));
}

/* THE SHORTEST FORM OF A NAME THAT IS STILL UNIQUE AMONG THE NAMES BESIDE IT. § */
/* A SITTING IS A YEAR AND A MONTH, AND THE FUNNEL ASKS THEM APART. § */
function sittingParts_(date) {
  const m = /^((?:\d{1,2}\s+)?([A-Za-z]+))\s+((?:19|20)\d{2})$/.exec(String(date == null ? '' : date).trim());
  if (!m || !MONTH_NAMES.some(n => n.toLowerCase() === m[2].toLowerCase())) return null;
  return { year: m[3], month: m[1], word: m[2] };
}
function sittingSaid_(filters) {
  const said = { year: '', month: '' };
  (filters || []).forEach(c => {
    if (!c || c.any || c.bucket) return;
    if (c.field === 'examYear') said.year = String(c.value == null ? '' : c.value);
    else if (c.field === 'examMonth') said.month = String(c.value == null ? '' : c.value);
  });
  return said;
}
function sittingUnsaid_(label, said) {
  const s = String(label == null ? '' : label);
  if (!said || (!said.year && !said.month)) return s;
  const dash = /\s[—–]\s/.exec(s);
  const parts = dash ? sittingParts_(s.slice(dash.index + dash[0].length)) : null;
  if (!parts) return s;
  const left = [];
  if (!(said.year && said.year === parts.year)) left.push(parts.year);
  if (!(said.month && spellKey_(said.month) === spellKey_(parts.word))) left.push(parts.month);
  if (left.length === 2) return s;
  return s.slice(0, dash.index) + (left.length ? ' · ' + left[0] : '');
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

/* Sets `show` on each value in place. Ascending rungs, first one where every label is distinct —
   and the last rung is always the full name, which is distinct by construction because these are
   the keys of a tally. */
/* WHAT A PAPER IS CALLED ON A BUTTON, AND WHY IT IS NOT JUST ITS NAME. § */
/* ---------- AND THE RUNGS STAYED ON AFTER THE QUESTION THEY NAME HAD BEEN ANSWERED § */
/* ---------- THE FILE, NOT THE MAPPED LIST — AND THIS IS THE THIRD FUNCTION THAT NEEDED IT § */
function libDocRows_() {
  return (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS && LIBRARY_ROWS.length)
    ? LIBRARY_ROWS : ((DATA && DATA.questions) || []);
}

/* A DOCUMENT ROW IN EITHER SPELLING. § */
const libIsDoc_ = r => !!r && (String(r.kind || '').toLowerCase() === 'document' || !!r.isDoc);

const PAPER_LABEL = new WeakMap();
/* ---------- AND ONE MAP PER ANSWER LIST, NOT ONE PER ANSWER § */
const PAPER_LABEL_FOR = new WeakMap();

function paperLabels_(ids) {
  const rows = libDocRows_();
  if (ids && ids.length && typeof ids === 'object') {
    const hit = PAPER_LABEL_FOR.get(ids);
    if (hit && hit.rows === rows) return hit.map;
  }
  const only = ids && ids.length ? new Set(ids.map(String)) : null;
  let map = only ? null : PAPER_LABEL.get(rows);
  if (map) return map;
  map = {};
  const byName = {};
  const docs = [];
  rows.forEach(r => {
    const id = r && (r.paper_id || r.paper);
    if (!r || String(r.kind) !== 'document' || !id) return;
    /* THE FIELD IS THE ANSWERS ON SCREEN WHERE THERE ARE ANY. A paper not in the list cannot make
       one that is ambiguous, so it must not add a rung to it. */
    if (only && !only.has(String(id))) return;
    const name = String(r.name || '').trim();
    if (!name) return;
    docs.push({ id: id, name: name, subject: r.subject, tier: r.tier, exam_board: r.exam_board });
    const k = spellKey_(name);
    (byName[k] = byName[k] || []).push(r);
  });
  docs.forEach(r => {
    const name = r.name;
    const share = byName[spellKey_(name)] || [];
    if (share.length < 2) { map[r.id] = name; return; }
    /* ONLY WHAT DIFFERS, AND ONLY WHERE IT SEPARATES. § */
    const bits = [name];
    let field = share;
    ['subject', 'tier', 'exam_board'].forEach(col => {
      if (field.length < 2) return;
      const mine = String(r[col] || '').trim();
      if (mine && new Set(field.map(d => String(d[col] || '').trim())).size > 1) bits.push(mine);
      field = field.filter(d => String(d[col] || '').trim() === mine);
    });
    /* ---------- THE RUNGS GO BEFORE THE DATE, NOT AFTER IT § */
    const extra = bits.slice(1).join(' \u00b7 ');
    const dash = /\s[\u2014\u2013]\s/.exec(name);
    map[r.id] = !extra ? name
      : dash ? name.slice(0, dash.index) + ' \u00b7 ' + extra + name.slice(dash.index)
      : name + ' \u00b7 ' + extra;
  });
  if (!only) PAPER_LABEL.set(rows, map);
  else if (typeof ids === 'object') PAPER_LABEL_FOR.set(ids, { rows: rows, map: map });
  return map;
}

/* AN ID WITH NO DOCUMENT ROW IS DRAWN AS ITSELF rather than as nothing — an unreadable button beats a blank one, and `check-library.js` already fails on a § */
const paperLabel_ = (id, ids) => paperLabels_(ids)[id] || paperLabels_()[id] || String(id || '');

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

/* A LONG LIST OF PLAIN NUMBERS IS ASKED IN TENS. § */

/* AND THE SAME MOVE FOR EVERY OTHER KIND OF ANSWER — NEVER MORE THAN SEVEN, EVER. § */
/* AT MOST SEVEN, WHICH IS `FACET_MAX_SHOWN` RATHER THAN A SECOND NUMBER. The cap on what fits on a
   card and the cap on when to group are the same fact about the same card, and two constants for it
   is two things to keep in step. */

/* ---------- THE SEVEN LETTER RANGES ARE BUILT, NOT DECLARED § */
function alphaKey_(v) { return String(v == null ? '' : v).trim().toLowerCase(); }

/* ---------- AND A RANGE IS MEASURED ON WHAT IS READ, NOT ON WHAT IS MATCHED § */
function bucketKeyOf_(facet, v) {
  if (facet && typeof facet.showOf === 'function') {
    try { const s = facet.showOf(v); if (s) return String(s); } catch (e) { /* fall through */ }
  }
  return String(v == null ? '' : v);
}

/* ---------- IS THIS LABEL ONE THE FACET'S OWN GROUPING MADE? § */
function bucketDeclares_(facet, b) {
  if (!facet || typeof facet.bucketOf !== 'function') return false;
  const order = facet.bucketOrder;
  if (order && order.indexOf(b) >= 0) return true;
  try { return facet.bucketOf(b) === b; } catch (e) { return false; }
}


/* ---------- IS THIS VALUE INSIDE THAT BUCKET § */
function bucketHas_(facet, bucket, v) {
  const b = String(bucket || '');
  if (!b) return false;
  /* ---------- A DECLARED LABEL IS THE TABLE'S, BOTH WAYS § */
  if (bucketDeclares_(facet, b)) {
    try { return facet.bucketOf(v) === b; } catch (e) { return false; }
  }
  /* A TENS BAND. Both ends have to be digits, so `9–A` is not one and falls through to the prefix test below — which is the branch that was refusing it. § */
  const num = /^(\d+)–(\d+)$/.exec(b);
  /* ONLY FOR A VALUE THAT IS ITSELF AN INTEGER. § */
  if (num && intAnswer_(v)) {
    return Number(v) >= Number(num[1]) && Number(v) <= Number(num[2]);
  }
  /* ---------- A PREFIX RANGE, AND IT MUST NOT INSIST ON A LETTER § */
  const ends = b.split('–');
  const lo = alphaKey_(ends[0]);
  const hi = alphaKey_(ends.length > 1 ? ends[1] : ends[0]);
  if (!lo) return false;
  /* THE SAME STRING THE RANGE WAS BUILT FROM — see `bucketKeyOf_`. § */
  const k = alphaKey_(bucketKeyOf_(facet, v));
  return k.slice(0, lo.length) >= lo && k.slice(0, hi.length) <= hi;
}

/* ---------- AND THE ANSWERS, REPLACED BY THE BUCKETS THEY FALL IN § */
/* ---------- AND NOW NOTHING IS GROUPED AT ALL § */
function bucketValues_(values) {
  return values;
}


/* A plain non-negative integer and nothing else. § */
const intAnswer_ = v => /^\d+$/.test(String(v == null ? '' : v).trim());


/* ---------- `FACET_BAND_AT` AND `bandNumbers_` WERE HERE § */

/** The distinct values of one facet across a set, with how many each would leave. */
/* ---------- THE FIRST QUESTION IS NOT ALPHABETICAL § */

/* ONE ANSWER, ONE BUTTON, WHATEVER IT IS SPELLED LIKE. § */
/* `SPELL_KEYS` AND `spellKey_` WERE HERE, and they are above `bucketTable_` now because that function keys its second index on them and is CALLED AT LOAD. § */

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

const spellShow_ = v => String(v).charAt(0).toUpperCase() + String(v).slice(1);

/* `facetTally_` — ONE WALK OF THE LIST PER QUESTION, NOT THREE. § */
const FACET_TALLY = new WeakMap();

/* ---------- THE BUCKET THIS QUESTION IS ALREADY INSIDE, IF ANY § */
function facetWithin_(facet) {
  let at = '';
  (STUFF.filters || []).forEach(c => {
    if (c && c.bucket && c.field === facet.field) at = String(c.value);
  });
  return at;
}

function facetTally_(items, facet) {
  let perList = FACET_TALLY.get(items);
  if (!perList) { perList = {}; FACET_TALLY.set(items, perList); }
  /* ---------- KEYED ON THE BUCKET TOO, OR THE SECOND ASK READS A TALLY FROM THE FIRST § */
  const within = facetWithin_(facet);
  /* AND ON WHAT THE YEAR AND MONTH CHIPS HAVE SAID, which a Paper answer's LABEL now depends on (`sittingUnsaid_`). § */
  const said = sittingSaid_(STUFF.filters);
  const tallyKey = facet.field + '|' + within + (facet.showOf ? '|' + said.year + '|' + said.month : '');
  const had = perList[tallyKey];
  /* KEYED ON THE FACET OBJECT AS WELL AS ITS NAME. § */
  if (had && had.facet === facet) return had;

  const by = {};
  let answered = 0;
  items.forEach(x => {
    /* COUNTED ONCE PER VALUE, NOT ONCE PER ITEM. § */
    /* THROUGH `facetOwn_`, so a facet that defers to another never counts a value that other
       question already owns for this item — see the block above `FACETS`. */
    const vals = facetOwn_(facet, x);
    if (!vals.length) return;
    answered++;
    /* ONE VALUE IS THE OVERWHELMING CASE and a `Set` of one is an allocation to prove it. § */
    if (vals.length === 1) { by[vals[0]] = (by[vals[0]] || 0) + 1; return; }
    new Set(vals).forEach(v => { by[v] = (by[v] || 0) + 1; });
  });

  const rank = v => {
    const ord = groupOrder_();
    const i = ord.indexOf(v);
    return i === -1 ? ord.length : i;
  };
  /* ---------- AND AN ANSWER THAT IS A DATE SORTS AS A DATE § */
  const dateKey_ = v => {
    const m = /^([A-Za-z]+)\s+((?:19|20)\d{2})$/.exec(String(v));
    if (!m) return null;
    /* A SEASON IS A POSITION IN THE YEAR TOO. § */
    const i = SERIES_AT[m[1]] !== undefined ? SERIES_AT[m[1]] - 1 : MONTH_NAMES.indexOf(m[1]);
    return i === -1 ? null : Number(m[2]) * 12 + i;
  };
  const answers = Object.keys(by);
  const allDates = answers.length > 1 && answers.every(v => dateKey_(v) !== null);

  /* `cmp` IS A FACET SAYING ITS OWN ORDER, for an answer that HAS one and is not a date the test above can read: § */
  const order = facet.field === 'forLabel'
    ? (a, b) => (rank(a) - rank(b)) || cmpText(a, b)
    : typeof facet.cmp === 'function' ? facet.cmp
    /* A FACET MAY SAY ITS OWN ORDER when its answers have one their letters do not give — a month
       name is the case: alphabetical puts August first. An answer the facet does not know sorts last. */
    : typeof facet.orderOf === 'function'
    ? (a, b) => { const o = v => { const i = facet.orderOf(v); return i < 0 ? 1e6 : i; };
                  return (o(a) - o(b)) || cmpText(a, b); }
    : allDates
    ? (a, b) => dateKey_(b) - dateKey_(a)
    : cmpText;
  /* ---------- THE VARIANTS ARE FOLDED HERE, BEFORE ANYTHING COUNTS THEM § */
  const folded = {};
  Object.keys(by).forEach(v => {
    const k = spellKey_(v);
    if (!k) return;
    const seen = folded[k];
    const best = spellBetter_(seen && seen.best, { value: v, n: by[v] });
    folded[k] = { best: best, n: (seen ? seen.n : 0) + by[v] };
  });
  let values = Object.keys(folded)
    .map(k => ({ value: spellShow_(folded[k].best.value), n: folded[k].n }))
    .sort((a, b) => order(a.value, b.value));
  /* ---------- AND A QUESTION ASKED INSIDE A BUCKET OFFERS ONLY WHAT IS IN IT § */
  if (within) values = values.filter(v => bucketHas_(facet, within, v.value));
  /* ---------- AN IDENTITY IS NOT A SPELLING, AND ONE FACET HAD BEEN USING A NAME AS BOTH § */
  /* THE WHOLE ANSWER LIST GOES TO `showOf`, so a facet whose label has to be disambiguated can do
     it against the answers beside it rather than against the library — see `paperLabels_`. */
  if (facet.showOf) {
    const ids = values.map(v => v.value);
    /* AND WHAT THE CHIPS HAVE SAID, so a Paper answer under a `June` chip does not say June again.
       See `sittingUnsaid_`; `said` is in the memo key above for the same reason. */
    values.forEach(v => { v.text = facet.showOf(v.value, ids, said); });
  }
  /* ---------- AND THE LABEL IS THE SHORTEST FORM THAT IS STILL UNIQUE ---------------------------
     `show` IS WHAT IS DRAWN; `value` GOES ON STILL BEING WHAT IS MATCHED. See `shortLabels_`. */
  shortLabels_(values);
  /* ---------- AND NO QUESTION EVER DRAWS MORE THAN SEVEN ANSWERS § */
  values = bucketValues_(values, facet, items);

  let top = 0;
  values.forEach(v => { if (v.n > top) top = v.n; });

  const out = {
    facet: facet,
    within: within,
    values: values,
    coverage: items.length ? answered / items.length : 0,
    /* ---------- HOW MUCH OF THE LIST THE COMMONEST ANSWER DOES *NOT* KEEP § */
    split: values.length < 2 || !items.length ? 0 : (items.length - top) / items.length,
  };
  perList[tallyKey] = out;
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

/* HOW MUCH OF THE SET A QUESTION HAS TO COVER BEFORE IT IS WORTH ASKING. */
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

/* THE NEXT QUESTION WORTH ASKING, or nothing. § */
/* A QUESTION WHOSE ANSWERS ARE ONLY UNIQUE INSIDE ANOTHER QUESTION'S ANSWER. § */
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
/* `1 June`, and the level beside it only where the answers on screen span two levels — the same
   rule `paperLabels_` applies: say only what differs. */
function fiveDayLabel_(id, ids) {
  const d = fiveADayOf_(id);
  if (!d) return '';
  const lvl = i => { const m = /^P-CBM-5AD-([A-Z+]+)-/.exec(String(i)); return m ? m[1] : ''; };
  const mixed = Array.isArray(ids) && new Set(ids.map(lvl)).size > 1;
  const name = { F: 'Foundation', FP: 'Foundation Plus', H: 'Higher', HP: 'Higher Plus' }[lvl(id)] || lvl(id);
  return d.day + ' ' + d.month + (mixed ? ' · ' + name : '');
}

/* ---------- THE QUESTION'S OWN DOORS WAIT FOR A PAPER § */
const PAPER_FIRST = ['paperId', 'fiveDay'];
const FACET_NEEDS_FIRST = {
  fiveDay:  'fiveMonth',
  /* ---------- THE BIBLE'S RUNGS, EACH BEHIND THE ONE ABOVE IT § */
  bibleTestament: 'bibleTranslation', bibleGroup: 'bibleTestament', bibleBook: 'bibleGroup',
  bibleChapter: 'bibleBook', bibleVerse: 'bibleChapter',
  qNumber: PAPER_FIRST, qPart: PAPER_FIRST, qSub: PAPER_FIRST, qPage: PAPER_FIRST, qPages: PAPER_FIRST,
  marks: PAPER_FIRST, needs: PAPER_FIRST,
};
/* HAS WHAT THIS FACET WAITS FOR BEEN ASKED? A name, or a list of which any one will do. */
const facetNeedsMet_ = (field, asked) => {
  const first = FACET_NEEDS_FIRST[field];
  return !first || [].concat(first).some(f => asked.indexOf(f) !== -1);
};

/* ---------- A PAPER IS THE LAST FOLDER, AND WHAT IS INSIDE IT IS THE LIST § */
const FACET_ENDS = { paperId: true, fiveDay: true };
const funnelEnded_ = () => (STUFF.filters || []).some(f => f && FACET_ENDS[f.field] && !f.any && !f.bucket);

/* ---------- A FOLDER WITH ONE ANSWER THAT A CHIP ALREADY OPENED IS NOT ASKED AGAIN § */
function folderOpened_(items, facet) {
  if (!facet || !facet.folder) return false;
  const vals = facetValues(items, facet);
  if (vals.length !== 1) return false;
  const only = String(vals[0].value || '');
  return STUFF.filters.some(f => !f.any && String(f.value) === only);
}

function nextFacet(items) {
  if (funnelEnded_()) return null;
  const asked = STUFF.filters.map(f => f.field);
  /* ---------- A BUCKET IS HALF AN ANSWER, SO THE QUESTION IS ASKED AGAIN § */
  const settled = STUFF.filters
    .filter(f => !f.bucket)
    .map(f => f.field);

  for (const facet of facetList()) {
    if (facet.tagOnly) continue;
    if (settled.indexOf(facet.field) !== -1) continue;
    /* ---------- A CLOSED KIND'S QUESTIONS, AND ONLY TO ITS OWN LIST § */
    if (facetFenced_(items, facet)) continue;
    /* ---------- NOT UNTIL THE QUESTION IT HANGS OFF HAS BEEN ANSWERED § */
    if (!facetNeedsMet_(facet.field, asked)) continue;
    const vals = facetValues(items, facet).length;
    /* A GRID IS A NUMBERED RUN AND IS NOT CAPPED — see `grid` on the Bible's Chapter and Verse. */
    if (vals < (facet.folder ? 1 : 2) || (vals > FACET_MAX_ANSWERS && !facet.grid)) continue;
    if (folderOpened_(items, facet)) continue;
    /* THE THRESHOLD IS THE FACET'S OWN, falling back to the one below. A question the sheet has
       given a lower bar to is one somebody decided is worth asking early even though it is thin. */
    const min = isFinite(facet.min) ? facet.min : FACET_COVERAGE;
    if (facetCoverage(items, facet) < min) continue;
    /* AND IT HAS TO SPLIT SOMETHING. § */
    /* A FOLDER IS ASKED WHETHER OR NOT IT NARROWS -- that is what makes it a folder. See `examYear`. */
    if (!facet.always && !facet.folder && facetSplit_(items, facet) < FACET_MIN_MINORITY) continue;
    return facet;
  }
  return null;
}

/* AND WHEN NOTHING QUALIFIES, THE CLOSEST THING TO A QUESTION RATHER THAN A DEAD END. § */
function overFacet_(items) {
  /* THE LAST RESORT DOES NOT REOPEN A PAPER. See `FACET_ENDS`: inside one paper the list is the
     answer, and a question this function found would be the same tap `nextFacet` just refused. */
  if (funnelEnded_()) return null;
  const asked = STUFF.filters.map(f => f.field);
  let best = null;
  for (const facet of facetList()) {
    if (facet.tagOnly || asked.indexOf(facet.field) !== -1) continue;
    /* THE FENCE HERE TOO. This runs when `nextFacet` found nothing, and a Bible list nextFacet has finished with would otherwise tally every one of the other § */
    if (facetFenced_(items, facet)) continue;
    const vals = facetValues(items, facet).length;
    if (vals <= FACET_MAX_ANSWERS) continue;
    const min = isFinite(facet.min) ? facet.min : FACET_COVERAGE;
    if (facetCoverage(items, facet) < min) continue;
    if (!facet.always && facetSplit_(items, facet) < FACET_MIN_MINORITY) continue;
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
    /* A FENCED QUESTION IS NOT TALLIED HERE EITHER — it is not tallied by the funnel, and this prints
       what the funnel did. Its columns read `-`. */
    const fenced = facetFenced_(items, f);
    const vals = fenced ? [] : facetValues(items, f);
    const cov = fenced ? 0 : facetCoverage(items, f);
    const min = isFinite(f.min) ? f.min : FACET_COVERAGE;
    const first = FACET_NEEDS_FIRST[f.field];
    let why;
    if (asked.indexOf(f.field) !== -1) why = 'asked already';
    else if (fenced) why = f.only ? 'kept to lists that are all ' + f.only + ' (only)'
                                  : 'this list is all ' + listKind_(items) + ': only its own questions';
    else if (!facetNeedsMet_(f.field, asked)) why = 'waits for ' + [].concat(first).join(' or ') + ' (FACET_NEEDS_FIRST)';
    else if (!all && funnelEnded_()) why = 'a paper is chosen — its questions are the list (FACET_ENDS)';
    else if (vals.length < (f.folder ? 1 : 2)) why = (vals.length ? 'one answer' : 'nobody can answer it')
                                    + ' — nothing to decide';
    else if (folderOpened_(items, f)) why = 'one answer, and a chip already opened that folder';
    else if (vals.length > FACET_MAX_ANSWERS && !f.grid)
      why = 'too many answers — that is a list, not a question (max ' + FACET_MAX_ANSWERS + ')';
    else if (cov < min) why = 'thin — needs ' + Math.round(min * 100) + '%';
    /* THE NEW RULE HAS TO BE VISIBLE HERE OR IT IS THE OLD FAULT WEARING A HAT. A question that
       vanishes for a reason nothing prints is exactly what `whyThisQuestion` was written for. */
    else if (!f.always && !f.folder && facetSplit_(items, f) < FACET_MIN_MINORITY)
      why = 'lopsided — pressing its commonest answer would leave '
            + Math.round(facetSplit_(items, f) * 1000) / 10 + '% of the list, needs '
            + Math.round(FACET_MIN_MINORITY * 100) + '%';
    else if (!chosen) { why = '← THIS ONE'; chosen = f.field; }
    else why = 'would do, but comes after ' + chosen;
    console.log('  ' + pad(f.field + (f.fromSheet ? ' *' : ''), 14) + pad(f.label, 18)
                + num(fenced ? '-' : vals.length, 8) + num(fenced ? '-' : Math.round(cov * 100) + '%', 7)
                + '  ' + why);
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
      .map(v => v.value + ' (' + v.n + ')').join(', '));
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
  const corner = (name, won) => `<span class="fight-who${won ? ' won' : ''}">${esc(name)}</span>`;

  /* HOW IT ENDED, AS A PHRASE. "KO" and "round 2" are two facts and one sentence; a card that
     printed them as two rows would be a form rather than a result. */
  const how = [f.method, f.endRound ? 'round ' + f.endRound : '',
               (!f.endRound && f.rounds) ? f.rounds + ' rounds' : '']
    .filter(Boolean).join(' · ');

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
  return `<div class="card fc fight">
    <div class="fc-head">
      <h3 class="fight-line">${corner(f.a, wonA)}<em>v</em>${corner(f.b, wonB)}</h3>
    </div>
    ${tagRow_(x)}
    ${/* THE DATE AS THE FIGHTER'S PAGE WRITES IT. § */
          ''}
    <p class="sub">${esc([boxerDate_(f.date), f.division, bout].filter(Boolean).join(' · '))}</p>
    <div class="fight-faces" aria-hidden="true">${boxerPic_(bxA, 'a', wonA, f.trunksA)}<span class="fight-v">v</span>${
      boxerPic_(bxB, 'b', wonB, f.trunksB)}</div>
    ${credits.length ? `<p class="fight-credit">${credits.join(' ')}</p>` : ''}
    ${how ? `<p class="fc-meta">${esc(how)}</p>` : ''}
    ${f.notes ? `<p class="fc-lede">${esc(f.notes)}</p>` : ''}
    ${about ? `<p class="fc-note">${esc(about)}</p>` : ''}
    ${/* THE WATCH LINK MOVED into `fightTiles_`, so it sits in the tile row with every other action
          on every other card rather than as a lone button halfway up this one. */''}
    ${f.verified ? '' : '<p class="fc-note">Not checked yet</p>'}
  </div>`;
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
function contentCard_(x) {
  const c = x.row;
  return `<div class="card fc prac tb ct">
    <div class="fc-head"><h3>${esc(x.name)}</h3></div>
    ${tagRow_(x)}
    ${tbSections_(c)}
  </div>`;
}

/* ---------- A CHAPTER'S KEY WORDS, FORMULAS AND WORKED LINES — ALL OF THEM, OR THE ONES ASKED FOR § */
function tbSections_(c, keep) {
  const line = (i, body) => `<li>${body}${tbHigher_(i.higher)}</li>`;
  const named = i => !keep || keep.indexOf(i.name) !== -1;
  /* A WORKED LINE IS NAMED BY HOW IT OPENS — "Exact values: sin 30° …" is about Exact values — and the
     next character must not carry the word on: "Mean" is not the opening of "Meanwhile". */
  const opens = p => !keep || keep.some(k => p.text.indexOf(k) === 0 && !/[A-Za-z0-9]/.test(p.text.charAt(k.length)));
  const words = c.words.filter(named), formulas = c.formulas.filter(named), points = c.points.filter(opens);
  return `${words.length ? `<section class="fc-sec tb-words"><h4>Key words</h4><ul class="fc-list">${
      words.map(w => line(w, `<b>${esc(w.name)}</b> — ${tbSub_(esc(w.text))}`)).join('')}</ul></section>` : ''}
    ${/* THE MARK ON THE FORMULA'S NAME, not after the formula: a stacked fraction is two lines tall
         and an `H` trailing it sat alone on a third, measured at 320px. */''}
    ${formulas.length ? `<section class="fc-sec tb-math"><h4>Formulas</h4><ul>${
      formulas.map(f => `<li><span class="tb-fn">${esc(f.name)}${tbHigher_(f.higher)}</span><span class="tb-fm">${
        tbMath_(f.text)}</span></li>`).join('')}</ul></section>` : ''}
    ${points.length ? `<section class="fc-sec tb-points"><h4>Worked</h4><ul class="fc-list">${
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
    <h3>${esc(a.title)}</h3>
    <div class="tb-an-stage" data-anim="${esc(a.id)}">${animIds_(a.html, ++TB_AN_SEQ)}</div>
    <div class="tile-row">${tile_({ icon: 'undo', label: 'Play again', note: 'from the start', act: 'tb-an-again' })}</div>
    <section class="tb-about">${tbSections_(c, a.about)}</section>
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

/* THE BIBLE (KING JAMES VERSION) — ASKED LIKE EVERYTHING ELSE ON FIND, AND SHOWN ONLY TO AN ADMIN. § */
const BIBLE_NAME = 'The Bible (King James Version)';
/* `Books`, A SHELF OF ITS OWN, BESIDE `@family. textbooks` AND `Boxing`. § */
const BIBLE_SHELF = 'Books';
/* THE WORDS A SEARCH FINDS IT BY, on the cover and on every verse: what somebody types for the
   Bible that its name does not already say. */
const BIBLE_WORDS = 'KJV King James Authorized Version scripture';

/* EVERYTHING IT KNOWS, IN ONE PLACE. § */
const BIBLE = { index: null, asking: null, failed: false, books: {}, loading: {}, missed: {},
                item: null, verses: null, rank: null, hays: null };

/* THE SIX FIELDS, read off `FACETS` rather than written out a second time, so a chip on any of them is
   a Bible chip without this file keeping a list in step with that one. */
const BIBLE_FIELDS = {};
FACETS.forEach(f => { if (f.only === 'bible') BIBLE_FIELDS[f.field] = 1; });

/* ---------- WHO IS SHOWN IT § */
const bibleFor_ = () => typeof isAdmin === 'function' && isAdmin();

/* ONE FETCH FOR EVERY FILE OF IT, stamped with the deploy so the service worker's exact-URL cache hands back a fresh copy after one — `videosAsk_`'s reasoning § */
function bibleGet_(file) {
  if (!bibleFor_()) return Promise.resolve(null);
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  return Promise.resolve()
    .then(() => fetch('data/bible/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
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
      if (ok) { BIBLE.index = d; BIBLE.rank = bibleRankOf_(d); BIBLE.hays = d.books.map(bibleHay_); }
      else BIBLE.failed = true;
      /* THE SEARCH LEARNS THE BOOKS, so typing `psalms` finds the Bible — through `bibleHolds_`, which reads `BIBLE.hays` and so changes its answer the moment they are § */
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
const bibleBook_ = n => (BIBLE.index && BIBLE.index.books[n - 1]) || null;
const bibleTestament_ = t => (t === 'NT' ? 'New Testament' : 'Old Testament');
/* `Psalm 23`, NOT `Psalms 23` — the book is the Psalms and a chapter of it is a psalm. The one book
   whose chapters are cited by a different word from its title. */
const bibleCite_ = (b, ch) => (b.book === 'Psalms' ? 'Psalm' : b.book) + ' ' + ch;
/* THE WORDS EVERY VERSE OF ONE BOOK CARRIES — its Bible, its testament, its group and its book — so a search that names any of them finds it. § */
const bibleBookWords_ = b => [BIBLE_NAME, BIBLE_WORDS, bibleTestament_(b.testament), b.group, b.book].join(' ');
/* WHAT EVERY VERSE OF ONE BOOK IS FOUND BY, BAR ITS OWN NUMBERS: § */
const bibleHay_ = b => stuffHay_({ name: bibleCite_(b, ''), sub: b.book, text: bibleBookWords_(b) });

/* ---------- A SEARCH KEEPS THE COVER EXACTLY WHEN IT WOULD KEEP A VERSE § */
function bibleHolds_(x, words) {
  const ix = BIBLE.index, hays = BIBLE.hays;
  if (!ix || !hays) return words.every(w => stuffHay_(x).includes(w));
  return ix.books.some((b, i) => {
    const rest = words.filter(w => !hays[i].includes(w));
    if (!rest.length) return true;
    if (!rest.every(w => /^[\d:]+$/.test(w))) return false;
    return b.chapterVerses.some((count, ci) => {
      for (let v = 1; v <= count; v++) {
        const cv = (ci + 1) + ':' + v;
        if (rest.every(w => cv.includes(w))) return true;
      }
      return false;
    });
  });
}

/* ---------- THE ORDER THE ANSWERS ARE DRAWN IN, WHICH IS THE BIBLE'S § */
function bibleRankOf_(ix) {
  const r = { t: { oldtestament: 0, newtestament: 1 }, g: {}, b: {} };
  ix.books.forEach(b => {
    const g = spellKey_(b.group);
    if (!(g in r.g)) r.g[g] = b.n;
    r.b[spellKey_(b.book)] = b.n;
  });
  return r;
}
const bibleRank_ = (k, v) => {
  const r = BIBLE.rank && BIBLE.rank[k];
  const i = r ? r[spellKey_(v)] : undefined;
  return i == null ? -1 : i;
};

/* ONE BOOK, ONCE A VISIT. Held to the index's own count of every chapter's verses, so a file that came
   back half-written is a failure said on the card rather than a verse drawn from the wrong place. */
function bibleLoad_(n) {
  if (BIBLE.books[n]) return Promise.resolve(BIBLE.books[n]);
  if (BIBLE.loading[n]) return BIBLE.loading[n];
  const b = bibleBook_(n);
  if (!b || !bibleFor_()) return Promise.resolve(null);
  BIBLE.loading[n] = bibleGet_(b.file).then(d => {
    delete BIBLE.loading[n];
    const ok = !!d && Array.isArray(d.chapters) && d.chapters.length === b.chapters
      && d.chapters.every((c, i) => Array.isArray(c) && c.length === b.chapterVerses[i]
                                    && c.every(v => typeof v === 'string'));
    BIBLE.missed[n] = !ok;
    if (!ok) return null;
    BIBLE.books[n] = d;
    return d;
  });
  return BIBLE.loading[n];
}

/* ---------- THE CHOSEN BOOK, ASKED FOR BEFORE ITS VERSES ARE DRAWN (docs/history/341) § */
function bibleChosen_() {
  const st = typeof RES_ST !== 'undefined' ? RES_ST : STUFF;
  const f = (st.filters || []).find(x => x.field === 'bibleBook' && x.value != null);
  if (!f || !BIBLE.rank || !BIBLE.rank.b) return 0;
  return BIBLE.rank.b[spellKey_(f.value)] || 0;
}
function bibleAhead_() {
  const n = bibleChosen_();
  if (!n || !bibleFor_() || BIBLE.books[n] || BIBLE.loading[n] || BIBLE.missed[n]) return;
  bibleLoad_(n).then(() => bibleRedraw_(n));
}
function bibleJobs_() {
  const n = TABS.some(t => t.id === 'res') ? bibleChosen_() : 0;
  if (!n || !bibleFor_() || BIBLE.books[n] || BIBLE.loading[n] || BIBLE.missed[n]) return [];
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
  const list = [], starts = [];
  const tr = String(ix.translation), head = 'bible:' + tr.toLowerCase() + ':';
  ix.books.forEach(b => {
    const bb = { n: b.n, book: b.book, testament: bibleTestament_(b.testament), group: b.group, translation: tr,
                 words: bibleBookWords_(b) };
    const at = starts[b.n - 1] = [];
    b.chapterVerses.forEach((count, ci) => {
      const c = ci + 1, cite = bibleCite_(b, c) + ':';
      at.push(list.length);
      for (let v = 1; v <= count; v++) {
        list.push({ kind: 'bible', key: head + b.n + ':' + c + ':' + v, name: cite + v, sub: b.book,
                    shelf: BIBLE_SHELF, image: '', row: null, text: bb.words, bb: bb, ch: N(c), v: N(v) });
      }
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
  if (!m || !ix || m[1] !== String(ix.translation).toLowerCase()) return null;
  const list = bibleVerses_();
  const at = BIBLE.verses && BIBLE.verses.starts[Number(m[2]) - 1];
  const i = at ? at[Number(m[3]) - 1] : undefined;
  if (i == null) return null;
  const x = list[i + Number(m[4]) - 1];
  return x && x.key === k ? x : null;
}

/* ---------- IS THE BIBLE OPEN? § */
function bibleInside_() {
  return bibleFor_() && !!BIBLE.index
    && (STUFF.filters || []).some(f => f && BIBLE_FIELDS[f.field] && !f.bucket);
}

/* ---------- THE BIBLE'S RESULTS § */
function bibleFind_(verses, words, credits) {
  const all = stuffItems();
  const x = BIBLE.item;
  if (!x || all.indexOf(x) < 0) return [];
  const own = [], rest = [];
  const tr = spellKey_(BIBLE.index ? BIBLE.index.translation : '');
  (STUFF.filters || []).forEach(f => {
    if (!BIBLE_FIELDS[f.field]) rest.push(f);
    else if (!(f.field === 'bibleTranslation' && !f.any && !f.bucket && spellKey_(f.value) === tr)) own.push(f);
  });
  if (!stuffNarrow_([x], rest, [], credits).length) return [];
  return stuffNarrow_(verses, own.slice().reverse(), words, credits);
}

/* ---------- THE LAST LINE UNDER THE QUESTION, ONCE NOTHING IS LEFT TO ASK § */
function bibleEnd_(items) {
  if (listKind_(items) !== 'bible') return '';
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

/* THE COVER. One item, for an admin; none for anybody else — which is the whole of what a non-admin's Find knows about it: § */
function bibleItems_() {
  if (!bibleFor_()) return [];
  bibleIndex_();
  /* ---------- NOT BEFORE THE LIBRARY § */
  if (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null) return [];
  /* NO `sub`, AND ONLY THE WORDS EVERY VERSE CARRIES. § */
  const x = { kind: 'bible', name: BIBLE_NAME, key: 'bible:kjv', image: '', shelf: BIBLE_SHELF,
              text: BIBLE_WORDS, row: null };
  x.holds = words => bibleHolds_(x, words);
  BIBLE.item = x;
  return [x];
}

/* ---------- THE COVER, OR A VERSE § */
function bibleCard_(x) {
  if (x && x.bb) return bibleVerseCard_(x);
  const ix = BIBLE.index, t = ix && ix.totals;
  const num = v => Number(v || 0).toLocaleString('en-GB');
  /* THE HOW-TO NEEDS THE INDEX — the translation's name and the counts come from it — so until it is here the cover says what the book is and the one loader holds § */
  const how = ix ? ` Choose ${esc(ix.translation)}, then the testament, the group, the book, the chapter
      and the verse: every verse is a card of its own.` : '';
  return `<div class="card fc prac bible" data-bb="card">
    <div class="fc-head">
      <h3>${esc(BIBLE_NAME)}</h3>
    </div>
    ${tagRow_(x)}
    <p class="sub">The Authorized Version of 1611</p>
    <p class="fc-lede">The Old and New Testaments, whole${t ? ` — ${num(t.books)} books, ${num(t.chapters)} chapters, ${num(t.verses)} verses` : ''}.${how}</p>
    ${!ix && BIBLE.failed ? '<p class="fc-note bb-miss">The list of books did not arrive.</p>' : !ix ? loading_() : ''}
    <p class="fc-note">Words in <i>italics</i> are the translators' own, added for the sense, as the
      King James prints them.</p>
    ${/* WHO CAN SEE IT, in the colour this app keeps for exactly that (`--admin`), so the owner is
         never left wondering whether a student is reading this card too. */''}
    <p class="fc-meta bb-who">Only admins are shown this book</p>
  </div>`;
}

/* ---------- ONE VERSE, A CARD OF ITS OWN § */
function bibleVerseCard_(x) {
  const bb = x.bb, n = bb.n, d = BIBLE.books[n];
  let body;
  if (d) body = bibleV_(d.chapters[Number(x.ch) - 1][Number(x.v) - 1]);
  else if (BIBLE.missed[n] && !BIBLE.loading[n]) body = `<p class="fc-note bb-miss">${esc(bb.book)} did not arrive.</p>`;
  else {
    /* WAITING FOR ITS BOOK: the one loader, where the verse will be. It was a faint "…" with
       `aria-busy` — the Bible's own wait, one of the twenty-four the owner was looking at on 9 Oct. */
    body = loading_();
    if (!BIBLE.loading[n]) {
      bibleLoad_(n).then(got => {
        if (!got) toast(bb.book + ' did not arrive — Try again is under the verse.');
        bibleRedraw_(n);
      });
    }
  }
  return `<div class="card fc bible bb-verse" data-bb="v" data-bn="${n}" data-key="${esc(x.key)}">
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
  const again = BIBLE.missed[bb.n] && !BIBLE.loading[bb.n]
    ? tile_({ icon: 'undo', label: 'Try again', note: bb.book, act: 'bible-retry', data: { n: bb.n } }) : '';
  return again + (bibleHere_(x) ? ''
    : tile_({ icon: 'book', label: 'Chapter', note: bibleCite_(bb, x.ch), act: 'bible-go', data: { key: x.key } }));
}
/* IN THIS VERSE'S CHAPTER ALREADY: its Book and Chapter answered, no Verse answer and no words
   narrowing the chapter — the strip is the chapter, so the tile would land where you are. */
function bibleHere_(x) {
  if (String(STUFF.q || '').trim()) return false;
  const leaf = f => f && !f.any && !f.bucket;
  const fs = STUFF.filters || [];
  if (fs.some(f => leaf(f) && f.field === 'bibleVerse')) return false;
  return fs.some(f => leaf(f) && f.field === 'bibleBook' && spellKey_(f.value) === spellKey_(x.bb.book))
      && fs.some(f => leaf(f) && f.field === 'bibleChapter' && String(f.value) === String(x.ch));
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
  const sel = n ? '.card.bb-verse[data-bn="' + Number(n) + '"]' : '.card.bible[data-bb="card"]';
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
  const f = [{ field: 'shelf', value: BIBLE_SHELF }, { field: 'bibleTranslation', value: BIBLE.index.translation }];
  if (x) {
    f.push({ field: 'bibleTestament', value: x.bb.testament }, { field: 'bibleGroup', value: x.bb.group },
           { field: 'bibleBook', value: x.bb.book }, { field: 'bibleChapter', value: x.ch });
  }
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
  const n = Number(el && el.getAttribute('data-n')) || 0;
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
  return tile_({ icon: 'open', label: 'Open', note: 'in ' + (t ? t.label : 'Find'), act: 'find-open', data: { key: x.key } });
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
    (x.stems || []).forEach((p, i) => {
      if (!p || had.indexOf(stemId_(p)) >= 0) return;
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
  /* A CONTENT CARD IS ITSELF AND A PAGE PER ANIMATION, in the file's order: § */
  if (x && x.kind === 'content' && x.row) {
    return [null].concat((x.row.animations || []).map(a => 'an' + x.row.n + '-' + a.id));
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
  if (x && x.kind === 'project') return projectPart_(x, part);
  if (x && x.kind === 'content') return textbookAnimPart_(x, part);
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


/* `typeset_` — A FRACTION IS DRAWN OVER ITS LINE, AND A POWER IS RAISED. § */
function typeset_(html) {
  let s = String(html == null ? '' : html);
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
  const add = xs => (xs || []).forEach(x => { if (x && (x.html || x.diagram)) out.push(x); });
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

function needsOf_(r, at) {
  const out = [];
  const add = v => { if (v && out.indexOf(v) === -1) out.push(v); };
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
      lead: r.lead, html: r.html, diagram: r.diagram || '',
      /* THE SAME SPLIT `topics` AND `keystage` GET — one helper, because a comma is a comma. */
      images: topicAtoms_(r.images || (r.row && r.row.images)),
      /* THE MARK SCHEME, WHICH THE BACKEND SENT TO NOBODY FOR MONTHS. § */
      answer: r.answer || '', answerType: r.answerType || '',
      /* WHAT TO ANSWER ON when the answer is a mark rather than words -- see `padSurface_`. */
      surface: r.surface || '',
      /* AND WHICH EARLIER PART'S DRAWING IT READS -- see `usesOf_`. */
      uses: r.uses || '',
      accept: r.accept || '', cells: r.cells || '', markWords: r.markWords || '',
      choices: r.choices || [], choiceRight: r.choiceRight || [],
      /* AN ORDERING'S EVERY RIGHT ORDER AND ITS TWO ENDS -- see `orderBox_` and library.js. */
      choiceWays: r.choiceWays || [], orderEnds: r.orderEnds || [],
      examinerNote: r.examinerNote || '',
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
function subSlot_(x) {
  const k = ansKey_(x);
  const m = typeof subMark_ === 'function' && typeof subLatest_ === 'function' ? subMark_((subLatest_(k) || {}).v) : { text: '', cls: '' };
  return `<i class="qcard-verdict${m.cls}" data-k="${esc(k)}">${esc(m.text)}</i>`;
}
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
  const m = /^(-?\d+(?:\.\d+)?)\s*(?:to)\s*(-?\d+(?:\.\d+)?)(?:\s+[a-z\u00b0%].*)?$/
    .exec(markNorm_(String(w == null ? '' : w).replace(/[\u2013\u2014]/g, ' to ')));
  if (!m) return null;
  const lo = markFrac_(m[1]), hi = markFrac_(m[2]);
  if (!lo || !hi) return null;
  if (lo.n * hi.d > hi.n * lo.d) return null;   /* backwards is not a band */
  return { lo: lo, hi: hi };
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

function markAnswer_(typed, accept, again) {
  const t = markNorm_(typed);
  if (!t) return null;                              /* nothing typed is not a wrong answer */
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
  /* `is-done` SAYS THE QUESTION IS SETTLED, which `qp-choose` below already enforces by ignoring any further tap. § */
  return `<div class="qp-ans qp-choices${done ? ' is-done' : ''}" data-k="${esc(k)}" data-need="${need}"
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
      ? (ok ? 'Correct' : 'Not yet — see Answers')
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
  const send = ways.length ? tile_({ icon: 'send', label: 'Send', note: 'mark the order', act: 'qp-order-send', cls: 'qp-order-send', tone: 'send' }) : '';
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
  if (right && picked.length >= need) return;
  if (need === 1) picked = [n];
  else picked = picked.includes(n) ? picked.filter(v => v !== n) : picked.concat(n);
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
  let s = String(w || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  if (/^-?\d/.test(s)) return s.replace(/\.$/, '');
  const cut = s.replace(/(ations?|ings?|edly|ed|es|ly|er|est|s)$/, '');
  return cut.length >= 3 ? cut : s;
}
function mwToks_(t) {
  return String(t || '').toLowerCase().replace(/['\u2019]/g, '').replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/[^a-z0-9.\s-]/g, ' ')
    .split(/[\s-]+/).filter(Boolean).map(mwStem_).filter(Boolean);
}
function mwHas_(toks, term) {
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
  const toks = mwToks_(typed);
  const points = String(rule || '').split(';').map(p => p.trim()).filter(Boolean);
  const got = points.filter(p => p.split('|').some(way => way.split('+').every(term => mwHas_(toks, term)))).length;
  return { got: got, of: points.length };
}

/* ---------- A GRID OR TABLE WITH BLANKS IS FILLED IN WHERE IT STANDS, A CELL AT A TIME (359) */
const CELL_BLANK = /<(td|th)([^>]*)>\s*(?:&nbsp;|\u00a0)?\s*<\/\1>/g;
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
  const num = /^[-\d.,\s|£$%°/]+$/.test(c.ways);
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
function cellsBox_(x) {
  const cells = cellsOf_(x), k = ansKey_(x);
  const inTable = !!cellsTable_(x, x.html);
  const vals = cellsVals_(ansRead_(k));
  const row = inTable ? '' : `<div class="qp-cells">${cells.map((c, i) => c.ways
    ? `<label class="qp-cell-l"><span>${esc(c.label)}</span>${cellInput_(k, c, i, vals[i])}</label>` : '').join('')}</div>`;
  const said = subBoxSay_(k, ansRead_(k));
  return `<div class="qp-mark qp-compose qp-cells-box${said.cls ? ' ' + said.cls : ''}" data-k="${esc(k)}">${row}
    <div class="tile-row">${tile_({ icon: 'send', label: 'Check', note: 'every cell', act: 'qp-cells-check', cls: 'qp-check', tone: 'send' })}${figTile_(x)}</div>
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

function ansBox_(x) {
  if (x && Array.isArray(x.choices) && x.choices.length >= 2) return choiceBox_(x);
  if (cellsOf_(x).length) return cellsBox_(x);
  const k = ansKey_(x);
  /* MARKABLE ONLY WHERE `accept` SAYS SO. § */
  const can = String(x && x.accept || '').trim();
  /* EVERY ANSWER IS TYPED ON THE SITE'S OWN PAD, a maths one opening on the maths keys and a worded one on the letters. § */
  const maths = ansMaths_(x);
  /* THE SIGNS ROW GOES BY THE SCHEME, WHATEVER KIND OF BOX IT IS. § */
  const signs = kpSigns_(x);
  /* NO CAPTION OVER THE BOX. § */
  /* ---------- THE FIGURE TILE STANDS BESIDE THE BOX, NOT IN THE ROW UNDER IT § */
  const fig = figTile_(x);
  /* ---------- THE ANSWER BOX IS A CHAT BAR, WITH A SEND TILE § */
  const rule = can ? '' : String(x && x.markWords || '').trim();
  const aiNow = can ? '' : aiTile_(x);
  /* A RULE MARKS FIRST; the AI tile stays hidden until the rule cannot give every mark (`qp-rule`). */
  const ai = rule && aiNow ? `<span class="qp-ai-later" hidden>${aiNow}</span>` : aiNow;
  const send = can ? tile_({ icon: 'send', label: 'Send', note: 'mark it', act: 'qp-check', cls: 'qp-check', tone: 'send' })
    : rule ? tile_({ icon: 'send', label: 'Check', note: 'marked by its key words', act: 'qp-rule', cls: 'qp-check', tone: 'send' }) + ai
    : ai || subSendTile_();
  const val = ansRead_(k);
  /* ---------- AN ESSAY IS WRITTEN ON A SHEET, NOT IN A CHAT BAR § */
  /* THE REVIEW OF 9 OCT ADDED TWO THINGS TO THIS ROW. § */
  /* AND SINCE 9 OCT (note 308) THE SHEET IS SENT LIKE EVERY OTHER BOX: § */
  if (ansEssay_(x)) {
    const v = val;
    const note = ai || can ? '' : aiWhyNot_(x);
    const say = ai ? '<span class="qp-ai-say" aria-hidden="true">Mark with AI</span>' : '';
    const kept = ai && typeof aiKeptView_ === 'function' ? aiKeptView_(k, v) : null;
    const said = subBoxSay_(k, v);
    const own = kept && (kept.fresh || !said.text) ? kept : null;
    const vcls = own ? own.cls : said.cls, vsay = own ? own.verdict : said.text;
    const foot = `<div class="tile-row qp-sheet-foot">${send}${say}${fig}${kpWideTile_(k)}${note ? `<span class="qp-ai-note">${esc(note)}</span>` : ''}
      <span class="qp-words">${esc(kpWordsSay_(kpWordCount_(v)))}</span></div>`;
    const sheet = `<label class="qp-ans qp-sheet" aria-label="Your answer">${kpField_(k, v, 'essay', signs)}</label>`;
    return `<div class="${send ? 'qp-mark ' : ''}qp-compose qp-essay${ai ? ' qp-ai' : ''}${send && vcls ? ' ' + vcls : ''}"${can ? ` data-accept="${esc(can)}"` : ''}>
    ${sheet}${foot}
    ${send ? `<span class="qp-verdict" role="status" aria-live="polite">${esc(vsay)}</span>` : ''}
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>
  </div>${ai ? `<p class="qp-ai-why">${own ? esc(own.why) : ''}</p>` : ''}`;
  }
  const bar = `<div class="qp-ans-row qp-bar"><label class="qp-ans${maths ? ' qp-ans-maths' : ''}" aria-label="Your answer">
    ${kpField_(k, val, maths ? 'maths' : 'words', signs)}
  </label>${fig}${kpWideTile_(k)}${send}</div>`;
  if (!send) return `<div class="qp-compose">${bar}
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span></div>`;
  /* THE VERDICT IS THE LATEST SUBMISSION'S, WHILE THE BOX HOLDS WHAT WAS SENT -- on this device or on the account, next sign-in § */
  const said = subBoxSay_(k, val);
  return `<div class="qp-mark qp-compose${ai ? ' qp-ai' : ''}${said.cls ? ' ' + said.cls : ''}"${can ? ` data-accept="${esc(can)}"` : ''}${rule ? ` data-rule="${esc(rule)}" data-marks="${esc(String(Number(x.marks) || ''))}"` : ''}>
    ${bar}
    <span class="qp-verdict" role="status" aria-live="polite">${esc(said.text)}</span>
    <span class="qp-saved" data-k="${esc(k)}">${esc(ansSavedSay_(k))}</span>
  </div>${ai ? '<p class="qp-ai-why"></p>' : ''}`;
}
/* THE PLAIN SEND, for somebody signed in -- see `ansBox_`. The gold disc every Send on a question's
   pages is, under its own name, so nothing that runs Check runs it. */
function subSendTile_() {
  if (!(typeof whoIs_ === 'function' && whoIs_())) return '';
  return tile_({ icon: 'send', label: 'Send', note: 'to your account', act: 'qp-send', cls: 'qp-send', tone: 'send' });
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
  const inp = card && card.querySelector('.qp-ans-in');
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
  const inp = box && box.querySelector('.qp-ans-in');
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
  const inp = box && box.querySelector('.qp-ans-in');
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
  if (Array.isArray(x.choices) && x.choices.length) return null;
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
  return { draw: draw, value: !draw || !!String((x && x.accept) || '').trim() || cellsOf_(x).length > 0 };
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

/* ---------- WHAT THE CONTROL SAYS, IN ONE PLACE § */
const PAD_TAP = 'Hold the card still and draw on this';
const padLockFace_ = pen => ({ icon: pen ? 'lock' : 'unlock',
  label: pen ? 'Done drawing' : 'Lock it to draw', note: pen ? 'the card moves again' : 'holds the card still',
  on: !!pen, pressed: !!pen });

/* ---------- THE PEN'S BAR IS A ROW OF TILES § */
/* ---------- AND WHAT THE PEN DRAWS WITH, WHERE THE QUESTION ASKS FOR MORE THAN A PEN § */
const PAD_TOOL_FACE = {
  pen:     { icon: 'pen',     label: 'Pen',     note: 'draw freehand' },
  ruler:   { icon: 'ruler',   label: 'Ruler',   note: 'drag a straight line' },
  compass: { icon: 'compass', label: 'Compass', note: 'press the centre, drag out' },
};
const padToolTile_ = (t, on) => tile_(Object.assign({ act: 'pad-tool', cls: 'qpad-tool', data: { tool: t },
  on: on, pressed: on }, PAD_TOOL_FACE[t]));
/* AND A RULER ON EVERY GRID (357): § */
const padToolsOf_ = (x, svg) => {
  const t = padTools_(x).filter(k => PAD_TOOL_FACE[k]);
  if (t.indexOf('ruler') === -1 && svg && padGrid_(svg)) t.splice(1, 0, 'ruler');
  return t;
};

/* TWO GROUPS IN THE ROW, so it breaks BETWEEN them and never inside one. § */
const padBar_ = (pen, tools, tool) => `<div class="qpad-bar tile-row" role="toolbar" aria-label="Drawing">
      <span class="qpad-group">${tile_(Object.assign({ act: 'pad-draw', cls: 'qpad-lock', tone: 'lead' }, padLockFace_(pen)))}${
      tools.length > 1 ? tools.map(t => padToolTile_(t, pen && t === tool)).join('') : ''}</span>
      <span class="qpad-group">${tile_({ icon: 'undo', label: 'Undo', note: 'the last mark', act: 'pad-undo', cls: 'qpad-undo' })}${
      tile_({ icon: 'bin', label: 'Clear', note: 'every mark', act: 'pad-clear', cls: 'qpad-clear' })}</span>
    </div>`;

function padWrap_(x, svg) {
  const k = padKey_(x);
  /* DRAWING THE PAD IS OPENING IT, so this is where the phone's old marks become this person's. */
  padAdopt_(k, padPrefix_(x) + ':' + padItemKey_(x));
  const marks = padRead_(k);
  /* AND THE MARKS AN EARLIER PART MADE ON THIS SAME PICTURE, under this part's own and out of reach of
     its Undo and Clear -- (ii)'s cross goes on the scale (i) already marked. See `usesOf_`. */
  const was = usesUnder_(x, svg);
  /* THE MODE IS READ OFF `PAD_ON`, NOT LEFT ON THE ELEMENT BY THE PRESS THAT SET IT. § */
  const pen = PAD_ON === k;
  /* THE PAD'S SHAPE, written on it for the live path and every repaint to read -- one number for all of them,
     so the stroke under the finger and the same stroke drawn again agree byte for byte (`padPath_`). */
  const ka = padAspect_(x, svg);
  const tools = padToolsOf_(x, svg);
  const held = PAD_TOOL.get(k);
  const tool = held && tools.indexOf(held) !== -1 ? held : 'pen';
  /* THE OVERLAY TAKES ITS BOX FROM THE PICTURE UNDER IT, by stretching to the same box, rather than by parsing a viewBox out of the drawing's markup. § */
  return `<div class="qpad${pen ? ' is-drawing' : ''}" data-k="${esc(k)}" data-aspect="${ka}">
    <div class="qpad-art"${pen ? '' : ` data-do="pad-draw" title="${esc(PAD_TAP)}"`}>${svg}
      <svg class="qpad-ink"${pen ? ' data-noswipe' : ''} viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true">
        ${was.length ? usesInk_(was, ka) : ''}
        <g class="qpad-g" vector-effect="non-scaling-stroke">${marks.map(st =>
          `<path vector-effect="non-scaling-stroke" d="${padPath_(st, ka)}"/>`).join('')}</g>
        <g class="qpad-aid"></g>
      </svg>
    </div>
    ${padBar_(pen, tools, tool)}
    ${/* WHERE THE MARKS GO, AND ONLY A `pad:` KEY GOES ANYWHERE: § */
          ''}
    <p class="qpad-note" data-kept-k="${esc(k)}">${esc(padNoteSay_(k))}</p>
  </div>`;
}

/* ---------- ARMING ONE PAD, EVERY PART OF IT TOGETHER § */
function padArm_(pad, on) {
  if (!pad) return;
  pad.classList.toggle('is-drawing', !!on);
  const ink = pad.querySelector('.qpad-ink');
  if (ink) { if (on) ink.setAttribute('data-noswipe', ''); else ink.removeAttribute('data-noswipe'); }
  /* THE PICTURE IS A DOOR ONLY WHILE THE PEN IS OFF. § */
  const art = pad.querySelector('.qpad-art');
  if (art) {
    if (on) { art.removeAttribute('data-do'); art.removeAttribute('title'); }
    else { art.setAttribute('data-do', 'pad-draw'); art.setAttribute('title', PAD_TAP); }
  }
  /* `.qpad-lock` RATHER THAN THE ACTION, because the art carries the same action when the pen is off and `querySelector` would hand back whichever comes first in § */
  const b = pad.querySelector('.qpad-lock');
  if (b) tileSet_(b, padLockFace_(!!on));
  /* AND THE TOOL IN HAND, lit only while the pen is on -- the same rule `padBar_` draws by, so a
     repaint and a press cannot disagree about which tile is lit. */
  const tool = padToolNow_(pad);
  pad.querySelectorAll('.qpad-tool').forEach(t => {
    const lit = !!on && t.getAttribute('data-tool') === tool;
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
  return t !== 'pen' && pad.querySelector('.qpad-tool[data-tool="' + t + '"]') ? t : 'pen';
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
      if (st[st.length - 2] === at[0] && st[st.length - 1] === at[1]) return null;
      st.push(at[0], at[1]);
      return st;
    },
    end: (g, st) => st,
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
  if (g.tool === 'pen') { if (aid.innerHTML !== halo) aid.innerHTML = halo; return; }
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
    g.dot = g.tool === 'pen';
    g.from = padPlace_(g, at, true);
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
/* THE PEN'S FRAME: a decision waiting (`padJudge_`), then the live path's open chunk, written once a frame
   (`padChunks_`). */
function padFrameWant_() {
  if (PAD_FRAME || typeof requestAnimationFrame !== 'function') return;
  PAD_FRAME = requestAnimationFrame(padFrame_);
}
function padFrame_() {
  PAD_FRAME = 0;
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
function padDrop_() {
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
  if (!other) { if (PAD_TOUCH.size || PAD_GO || PAD_TWO.size) padDrop_(); return; }
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
  if (feed && r) g.box = r;
  /* WHICH OF A PIN-RULE PAIR IS DRAWING, asked at the frame after any move while it is not known (`padRace_`) -- the
     refused one's moves too, though it is only a rest now: how far it goes is the evidence. */
  if (PAD_GO && PAD_GO.refused && !PAD_GO.mine && !PAD_GO.never) padFrameWant_();
  padRules_(c);
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
  return true;
}
/* ---------- AND EVERY OTHER COPY OF THE SAME PAD, FROM THE STORE § */
function padCopies_(k, pad, all) {
  document.querySelectorAll('.qpad[data-k]').forEach(p => {
    if (p !== pad && p.getAttribute('data-k') === k) padRepaint_(p, all);
  });
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

/* THE BAR'S TILES. `Lock it to draw` is a MODE and not an action, so it says which it is with `aria-pressed` and a class — see the note at the top of this block § */
on('pad-draw', (el) => {
  /* TWO DOORS, ONE HANDLER. § */
  const pad = el.closest('.qpad'); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  const want = PAD_ON !== k;
  [].slice.call(document.querySelectorAll('.qpad')).forEach(p => padArm_(p, false));
  PAD_ON = want ? k : '';
  if (want) padArm_(pad, true);
  /* AND EVERY CONTACT BUT THE ONE DRAWING IS FORGOTTEN, either way: § */
  padForgetOthers_();
});
function padForgetOthers_() {
  const keep = PAD_GO ? PAD_GO.c : null;
  PAD_TOUCH.forEach((c, id) => { if (c !== keep) PAD_TOUCH.delete(id); });
  PAD_TWO.clear();
  if (PAD_HUSH) PAD_HUSH.cand = null;
  PAD_DUE = null;
}

/* ---------- PEN, RULER, COMPASS: CHOOSING ONE IS ALSO LOCKING THE CARD § */
on('pad-tool', (el) => {
  const pad = el.closest('.qpad'); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  PAD_TOOL.set(k, el.getAttribute('data-tool') || 'pen');
  if (PAD_ON !== k) {
    [].slice.call(document.querySelectorAll('.qpad')).forEach(p => padArm_(p, false));
    PAD_ON = k;
    padForgetOthers_();
  }
  padArm_(pad, true);
});

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
  const html = `<div class="wb">${padWrap_(WB_ITEM, WB_SURF)}</div>`;
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
  return true;
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
  if (p.from !== 'surface') return box;
  return `<div class="qp-area" data-q="${esc(x.key)}">${padWrap_(x, p.svg)}</div>${box}`;
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

/* THE DAY A PAPER WAS SAT, WHEN THE ROW SAYS — "Thursday 25 May 2017". § */
function satOn_(x) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String((x && x.row && x.row.exam_date) || ''));
  if (!m) return '';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (!isFinite(d.getTime()) || d.getUTCMonth() !== Number(m[2]) - 1) return '';
  /* `WEEKDAYS` RUNS MONDAY-FIRST — it is the booking grid's list, and a week that starts on Monday
     is what every UK timetable in this app already assumes. `getUTCDay()` counts from Sunday. */
  return `${WEEKDAYS[(d.getUTCDay() + 6) % 7]} ${d.getUTCDate()} `
       + `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/* EVERY TAG ON A CARD IS AN ANSWER YOU CAN PICK IN THE FINDER: § */
const TAG_NAME = /[A-Za-z]/;
function tagRow_(x, page) {
  const out = [], words = new Set(), ids = new Set();
  if (!x) return '';
  facetList().forEach(facet => {
    if (!facet.tag) return;
    let vals;
    try { vals = asList_(facet.tagOf ? facet.tagOf(x, page) : facetOwn_(facet, x)); } catch (e) { vals = []; }
    vals.forEach(v => {
      const raw = String(v == null ? '' : v).trim();
      if (!raw) return;
      let text = raw;
      try {
        text = String((facet.tagSay ? facet.tagSay(raw, x) : facet.showOf ? facet.showOf(raw) : raw) || raw).trim();
      } catch (e) { text = raw; }
      const w = norm(text);
      if ((TAG_NAME.test(text) && words.has(w)) || (TAG_NAME.test(raw) && ids.has(raw))) return;
      words.add(w); ids.add(raw);
      out.push(`<span class="qtag"${tagAttr_(facet.field)} data-f="${esc(facet.field)}">${esc(text)}</span>`);
    });
  });
  return `<div class="qtags qcard-tags">${out.join('')}</div>`;
}

/* ---------- THE PAPER TAG, AS ITS OWN FOLDER NAMES IT § */
let PAPER_TAG = { from: null, by: {} };
function paperTag_(x) {
  const pid = String((x && x.row && x.row.paper_id) || '');
  if (!pid) return '';
  if (PAPER_TAG.from !== DATA) PAPER_TAG = { from: DATA, by: {} };
  if (pid in PAPER_TAG.by) return PAPER_TAG.by[pid];
  const facet = facetRaw_('paperId');
  let show = '';
  try {
    const FOLDER = ['level', 'examBoard', 'subject', 'tier', 'documentType', 'examYear', 'examMonth'];
    const key = i => FOLDER.map(f => { try { return asList_(facetRaw_(f).of(i)).join(','); } catch (e) { return ''; } }).join('|');
    const mine = key(x);
    const sib = [];
    stuffItemsAll_().forEach(i => {
      const id = String((i && i.row && i.row.paper_id) || '');
      if (id && sib.indexOf(id) < 0 && key(i) === mine) sib.push(id);
    });
    if (sib.indexOf(pid) < 0) sib.push(pid);
    const said = { year: String(asList_(facetRaw_('examYear').of(x))[0] || ''),
                   month: String(asList_(facetRaw_('examMonth').of(x))[0] || '') };
    const values = sib.map(v => ({ value: v, text: facet.showOf(v, sib, said) }));
    shortLabels_(values);
    const me = values.find(v => v.value === pid);
    show = me ? (me.show || me.text) : '';
  } catch (e) { show = ''; }
  if (!show) { try { show = facet.showOf(pid); } catch (e) { show = pid; } }
  return (PAPER_TAG.by[pid] = show);
}

/* ---------- A PART'S READING PAGES, FOR THE PAGE TAGS § */
const qPagesOf_ = x => (x && x.kind === 'question' ? partChunks_(x).length : 0);
function qPageAt_(x, page) {
  if (!x || x.kind !== 'question') return 0;
  if (page == null || page === '') return qPagesOf_(x);
  const m = /^pre(\d+)$/.exec(String(page));
  return m ? Number(m[1]) + 1 : 0;
}

/* ---------- WHAT TO BRING, IN ONE SPELLING § */
const NEEDS_SAY = { 'no calculator': 'Non-calculator', 'calculator': 'Calculator allowed' };
const needsSay_ = v => NEEDS_SAY[String(v == null ? '' : v).trim().toLowerCase()] || String(v == null ? '' : v).trim();

function questionCard_(x) {
  return `<div class="qcard">
    ${/* THE ROW, AND NOTHING ELSE ABOVE THE QUESTION: every fact is a tag (`tagRow_`), and every tag
          is an answer the finder offers. THE DAY YOU LAST DID IT is in the tile row, beside the star --
          see `questionTiles_`. */''}
    ${tagRow_(x)}
    <div class="qsheet">
      ${/* NO STEM HERE. The paragraph a part hangs from is its own page in front of the first part that shares it -- `questionStemCard_`, in `pageParts_`'s order -- so § */
            ''}
      ${/* THE LAST OF THE WORDS, which is all of them unless the part is too long for one page -- then the pages in front (`questionPreCard_`) hold the rest and this § */
            ''}
      ${cellsHere_(x, chunkHtml_(partChunks_(x).slice(-1)[0], circOf_(x), x))}
    </div>
    ${/* YOUR BOX, AND THE MARK SCHEME IS NOT UNDER IT ANY MORE. § */
          ''}
    ${ansArea_(x)}
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
  const isFig = b => b.k === 'fig' || b.k === 'use' || b.k === 'nofig';
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
   library is seven thousand rows; the html of a row does not change under it. */
const CHUNK_MEMO = new WeakMap();
/* AN EMPTY STEM IS NO PAGE AT ALL (`packBlocks_` alone would hand back one empty page, which is right for a
   card that must exist and wrong for a stem with nothing left on it). */
const packSeg_ = (blocks, page, last) => (blocks.length ? packBlocks_(blocks, page, last) : []);

/* ---------- A STEM'S PAGES, WITH ITS FIGURE AMONG ITS WORDS § */
function stemPlan_(p) {
  if (!p || typeof p !== 'object') return { chunks: [] };
  const had = CHUNK_MEMO.get(p);
  if (had) return had;
  const fb = figBlocks_(p.html);
  const pb = fb.blocks.map(h => ({ k: 'pb', h: h }));
  /* THE FIGURE STANDS AT ITS MARKER, ELSE AFTER THE WORDS -- digest.gs's rule for a stem, so the Sunday email and the page agree -- AND NOT AT ALL WHEN A PART § */
  const fig = stemHasFig_(p) && !stemPenned_(p)
    ? [{ k: 'fig', h: '', w: (p.diagram ? figWeight_(p.diagram) : 0) + picsWeight_(figImgs_(p.images)) }] : [];
  const at = fb.at >= 0 ? fb.at : pb.length;
  const plan = { chunks: packSeg_(pb.slice(0, at).concat(fig, pb.slice(at)), CHUNK_PAGE, CHUNK_PAGE) };
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
function stemChunks_(p) {
  const c = stemPlan_(p).chunks;
  return c.length ? c : [[]];
}

/* ---------- A PART'S PAGES, WITH ITS FIGURE AMONG ITS WORDS § */
function partPlan_(x) {
  if (!x || typeof x !== 'object') return { chunks: [[]] };
  const had = CHUNK_MEMO.get(x);
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
  const u = usesBlock_(x);
  if (u) seq = [u].concat(seq);
  const plan = { chunks: packBlocks_(seq, CHUNK_PAGE, PART_LAST) };
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
  return `${head.map(b => figHtml_(x, b)).join('')}${lead ? `<div class="qsheet-lead">${typeset_(lead)}</div>` : ''}
      <div class="qsheet-part${circ ? ' is-text' : ''}"${circ ? ` data-circ="${esc(circ.k)}"` : ''}>
        <div class="qsheet-pb">${pb}</div>
      </div>${circ && words.length ? `<p class="qpad-note qw-note">Tap a word to ring it, and again to take
        the ring off. <span data-kept-k="${esc(circ.k)}">${esc(padNoteSay_(circ.k))}</span></p>` : ''}`;
}
/* ---------- A FIGURE BLOCK, DRAWN § */
function figHtml_(x, b) {
  if (!x || !b) return '';
  if (b.k === 'nofig') return '<p class="qfig-missing">Figure not drawn yet.</p>';
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
  return !!(x && x.kind === 'question' && String(x.answer || '').trim());
}

/* ---------- WHO SEES IT OPEN: WHOEVER ASKED, AND NOBODY ELSE § */
const ANS_SHOWN = new Set();
/* CHOOSING `Answers` IS THE ASK, so in that view every answer is open -- forty pages each reading
   "Answer hidden" is not *"only see answers"* -- and Hide on one still hides it (`ANS_HID`). */
const ANS_HID = new Set();
function ansOpen_(x) {
  if (!x) return false;
  const k = ansKey_(x);
  return ANS_SHOWN.has(k) || (answersView_() && !ANS_HID.has(k));
}

function questionAnsCard_(x) {
  const id = (x.row && x.row.row_id) || x.key || '';
  const k = ansKey_(x);
  const open = ansOpen_(x);
  /* ---------- ONE TILE, IN ONE PLACE, AND IT SAYS WHICH WAY IT GOES § */
  return `<div class="qcard qans-card${open ? '' : ' is-hidden'}" data-of="${esc(id)}" data-k="${esc(k)}">
    ${tagRow_(x, 'ans')}
    <div class="tile-row qans-tiles">${open
      ? tile_({ icon: 'hide', label: 'Hide the answer', note: 'one tap', act: 'qa-hide', cls: 'qa-toggle', data: { k: k } })
      : tile_({ icon: 'show', label: 'Show the answer', note: 'one tap', act: 'qa-show', cls: 'qa-toggle', data: { k: k } })}${
      /* "ANSWER HIDDEN", AND NOT "HAVE A GO FIRST". § */
      open ? '' : '<span class="qans-wait-k">Answer hidden</span>'}</div>
    ${open ? answerBlock_(x) : ''}
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
  const fig = Array.isArray(x.choices) && x.choices.length >= 2 ? figTile_(x) : '';
  /* `Draw` / `Type` WAS HERE, the switch between the answer's two faces (327, 337). A question answered by
     drawing is drawn on its card now, with nothing to switch (`ansArea_`, 356). */
  /* NO WAY TO THE ANSWER IN THIS ROW ANY MORE -- see where `To the answer` was, above. */
  /* AND THE SOUND SWITCH, JUST BEFORE THE SLOT, on a card that can be marked -- signed in or out, since a signed-out child is marked and hears it too § */
  return fig + (typeof markSoundTile_ === 'function' ? markSoundTile_(x) : '') + (whoIs_() ? subSlot_(x) : '');
}

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
  (x.stems || []).forEach(p => { if (stemHasFig_(p) && !(penOn && penOn.from === p)) pic(p, figLabel_(p.html)); });
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
function figTile_(x) {
  const figs = figsBefore_(x);
  if (!figs.length) return '';
  const one = figs.length === 1;
  return tile_({ icon: 'figure', label: one ? figs[0].label : 'Figures', note: 'over this page', cls: 'q-figt',
                 act: 'q-fig', data: { key: x.key || '' } });
}
on('q-fig', el => {
  const k = el.getAttribute('data-key');
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  const figs = figsBefore_(x);
  if (!figs.length) return;
  /* EACH NAMED WHEN THERE IS MORE THAN ONE, in the words its own page's header uses (`figLabel_`). */
  openSheet(figs.length === 1 ? figs[0].label : 'Figures', `<div class="qfig-sheet">${figs.map(f =>
    `${figs.length > 1 ? `<p class="qfig-sheet-k">${esc(f.label)}</p>` : ''}<div class="qsheet">${f.html}</div>`).join('')}</div>`);
});

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
  + (typeof bibleFor_ === 'function' && bibleFor_() ? '+bible' : '');

/* ---------- EVERY ITEM THE APP HAS, INCLUDING THE ONES THE FUNNEL DOES NOT OFFER § */
function stuffItemsAll_() {
  const key = itemMemoKey_();
  if (ALL_MEMO.from === DATA && ALL_MEMO.key === key) return ALL_MEMO.items;
  const built = stuffItemsRaw_();
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
const RETIRED_SHELVES = ['@family. textbooks'];
function placeChipDead_(f) {
  if (!f || typeof f.field !== 'string') return true;
  if (BIBLE_FIELDS[f.field] || (f.field === 'shelf' && f.value === BIBLE_SHELF)) return !bibleFor_();
  if (RETIRED_FACETS[f.field]) return true;
  /* A SHELF THAT WENT. `@family. textbooks` held the books, and each chapter is a content card now with no shelf at all — so a kept place standing on it would come § */
  if (f.field === 'shelf' && RETIRED_SHELVES.indexOf(f.value) !== -1) return true;
  return !facetBy(f.field) && Array.isArray(DATA.facets) && DATA.facets.length > 0;
}

/* ---------- ONE LIST FOR BOTH FINDERS, COUNTED ONCE § */
let FUNNEL_MEMO = { key: null, from: null, items: null };
function stuffItems() {
  const key = itemMemoKey_();
  if (ITEM_MEMO.from === DATA && ITEM_MEMO.key === key) return ITEM_MEMO.items;
  if (!(FUNNEL_MEMO.from === DATA && FUNNEL_MEMO.key === key)) {
    FUNNEL_MEMO = { key: key, from: DATA, items: stuffItemsBuild_() };
  }
  ITEM_MEMO = { key: key, from: DATA, items: FUNNEL_MEMO.items };
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
    /* THE DOCUMENTS THE BUSINESS PUBLISHES. Built in terms.js from the `terms` tab, so a clause
       changes in a spreadsheet rather than in a file — and an empty tab is an empty list rather
       than a group with nothing in it. */
    ...(typeof docItems_ === 'function' ? docItems_() : []),
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
      /* THE EXAM FIELDS ARE NOT WRITTEN BLANK ANY MORE. § */
      /* WHETHER IT IS A WEARABLE, AND WHAT IT COSTS TO REACH. § */
      wearable: isWearable(x),
      level: Number(x.level) || 0,
      artId: x.artId || '',
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
      subject: 'Boxing', division: divisionOf_(b.bestDivision), row: b,
      /* ---------- `year: b.activeTo` WAS HERE, AND IT WAS HIS LAST YEAR DRAWN AS "Year" § */
    })),

    /* A BOUT ANSWERS THE FUNNEL LIKE A BOXER DOES: Boxing as the subject, the weight as the
       division. Everything school-shaped stays blank, and blank is what keeps a fight out of a
       list of past papers. */
    ...(DATA.fights || []).map(f => ({
      kind: 'fight', name: f.a + ' v ' + f.b,
      key: 'ft:' + (f.id || f.a + f.b + f.date),
      sub: [(f.date || '').slice(0, 4), f.division, f.venue].filter(Boolean).join(' · '),
      image: '',
      boxKind: 'Fights', shelf: 'Boxing',
      subject: 'Boxing', division: divisionOf_(f.division), row: f,
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

    /* ---------- THE BIBLE, FOR AN ADMIN AND NOBODY ELSE § */
    ...bibleItems_(),

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
  return LEVEL_BUCKET(lv) === 'SATs' ? [lv].concat(satsStagesOf_(x)) : [lv];
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
  return x._hay || (x._hay = norm([x.name, x.sub, x.subject, x.slot,
                                   x.grade && 'grade ' + x.grade, x.text].filter(Boolean).join(' ')));
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
const stuffWords_ = q => norm(q).split(/\s+/).filter(Boolean);
function stuffNarrow_(out, filters, words, credits) {
  const byField = {};
  filters.forEach(f => {
    if (f.any) return;
    (byField[f.field] = byField[f.field] || []).push(f);
  });
  /* ---------- AN ANSWER GIVEN INSIDE A BUCKET REFINES IT, IT DOES NOT SIT BESIDE IT § */
  Object.keys(byField).forEach(field => {
    const list = byField[field].filter((f, i, all) => !(f.bucket && i < all.length - 1));
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
  const open = bibleInside_();
  const all = open ? bibleVerses_() : stuffItems();
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
  if (!items) items = open ? bibleFind_(all, words, credits) : stuffFind(all, credits);
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
  /* AND ONLY THE ANSWERS when `Answers` is the kind chosen -- see `kindLabel`. Built in full and then
     kept, so every page that is drawn is the page it would have been. */
  const only = answersView_();
  /* AND NO ANSWER AT ALL when `Questions` is -- *"answers shouldnt even be showing up when all ive done is clicked questions"* (8 Oct; see `kindLabel`). § */
  const qOnly = !only && questionsView_();
  /* AND NONE AT ALL when `Bundles` is -- the bundles are the results, drawn in front (`bundlePages_`). */
  if (bundlesView_()) { STUFF_PAGES = { from: items, pages: pages }; return pages; }
  seq.forEach((x, i) => pageParts_(x, seq[i - 1]).forEach(part => {
    if (only && part !== 'ans') return;
    if (qOnly && part === 'ans') return;
    pages.push({ x: x, part: part });
  }));
  STUFF_PAGES = { from: items, pages: pages };
  return pages;
}

/* IS `Answers` THE KIND CHOSEN? -- the one switch the answers view hangs on. */
function answersView_() {
  return (STUFF.filters || []).some(f => f && f.field === 'kindLabel' && !f.any && f.value === 'Answers');
}
/* IS `Questions` THE KIND CHOSEN? -- its pair: question pages, and never an answer page. */
function questionsView_() {
  return (STUFF.filters || []).some(f => f && f.field === 'kindLabel' && !f.any && f.value === 'Questions');
}

/* ---------- THE LAST LINE UNDER A CHOSEN PAPER COUNTS WHAT THE STRIP HOLDS § */
/* A PAPER'S HEALTH, READ BY THE FINDER — the tag, the optional row of answers, and the list. § */
let HEALTH_MEMO = { from: null, by: {} };
function healthBy_() {
  const rows = typeof LIBRARY_ROWS !== 'undefined' ? LIBRARY_ROWS : null;
  if (!Array.isArray(rows)) return {};
  if (HEALTH_MEMO.from !== rows) {
    let by = {};
    try { by = paperHealth_(rows); } catch (e) { by = {}; }
    HEALTH_MEMO = { from: rows, by: by };
  }
  return HEALTH_MEMO.by;
}
function healthOf_(x) {
  const pid = x && x.row && x.row.paper_id;
  return pid ? healthBy_()[String(pid)] || null : null;
}

/* ---------- THE OPTIONAL ROWS: EVERY TAG THE FUNNEL DOES NOT ASK, AS A DOOR § */
function tagDoors_(items) {
  const filters = STUFF.filters || [];
  const asked = filters.map(f => f && f.field);
  return facetList().filter(f => f.tagOnly).map(facet => {
    if (filters.some(f => f && f.field === facet.field && !f.bucket)) return '';
    if (!facetNeedsMet_(facet.field, asked)) return '';
    let vals = [];
    try { vals = facetValues(items, facet); } catch (e) { vals = []; }
    if (vals.length < 2) return '';
    /* `.tag-answers`, NOT `.answers`: § */
    return `<div class="tag-door" data-field="${esc(facet.field)}"><p class="tag-door-k">${esc(facet.label)}</p><div class="tag-answers">${vals.map(v =>
      `<div class="counted row tap" data-do="facet-pick"${tagAttr_(facet.field)} data-field="${esc(facet.field)}"
        data-value="${esc(v.value)}"${v.bucket ? ' data-bucket="1"' : ''}><span class="k">${esc(v.show || v.text || v.value)}</span></div>`).join('')}</div></div>`;
  }).join('');
}

/* ---------- WHAT IS WRONG, ONE TAP AWAY § */
function healthTiles_(items) {
  const x = (items || []).find(i => healthOf_(i));
  const h = x ? healthOf_(x) : null;
  if (!h) return '';
  return `<div class="tile-row health-tiles">${tile_({ icon: 'pulse', label: 'Health',
    note: 'Faithful ' + h.pct + '% · Answerable ' + (h.able ? h.able.pct : 0) + '%', act: 'paper-health', data: { pid: x.row.paper_id } })}</div>`;
}
function healthListHtml_(h, pid) {
  /* THE BAND IS THE TAG, AS ON EVERY CARD -- the Health answer, [Ready] -- and the exact score is the
     sentence after it: a tag is a word the finder can pick, and nobody picks `99%`. */
  const head = `<p class="health-sum"><span class="qtag"${tagAttr_('health')}>${esc(h.band)}</span>
    Faithful ${esc(h.pct + '%')} of its points pass &middot; ${h.questions} question${h.questions === 1 ? '' : 's'}${h.total != null ? ', ' + h.marks + ' of ' + h.total + ' marks' : ''}</p>`;
  const a = h.able || { pct: 0, band: '', fails: [] };
  const able = `<p class="health-sum able-sum"><span class="qtag"${tagAttr_('answerable')}>${esc(a.band)}</span>
    ${esc(a.pct + '%')} answerable here and marked without AI</p>` + (a.fails.length
    ? `<ul class="health-list able-list">${a.fails.map(f => `<li><b class="health-ref">${esc(f.ref)}</b> — ${esc(f.why)}</li>`).join('')}</ul>`
    : '<p class="health-none">Every part can be answered and marked.</p>');
  if (!h.fails.length) return head + '<p class="health-none">Nothing wrong found.</p>' + able;
  /* IN THE CARD'S OWN WORDS FOR THE QUESTION. § */
  const said = {};
  try {
    stuffItemsAll_().forEach(i => { if (i && i.row && i.row.paper_id === pid && i.name) said[i.row.row_id] = i.name; });
  } catch (e) { /* the row's own reference stands */ }
  return head + `<ul class="health-list faith-list">${h.fails.map(f =>
    `<li><b class="health-ref">${esc((f.row && said[f.row]) || f.ref)}</b> — ${esc(f.why)}</li>`).join('')}</ul>` + able;
}
on('paper-health', el => {
  const h = healthBy_()[String(el.getAttribute('data-pid') || '')];
  if (!h) return;
  openSheet('Health · ' + (h.name || 'this paper'), healthListHtml_(h, String(el.getAttribute('data-pid') || '')));
});

/* ---------- THE PAPER'S OWN PAGE: ITS COVER, WHERE TO GO, AND ITS DOORS § */
function paperCover_(items) {
  const x = (items || []).find(i => i && i.kind === 'question' && i.sub);
  if (!x) return '';
  const day = satOn_(x);
  return `<p class="paper-cover">${esc(x.sub)}${day ? ' &middot; sat ' + esc(day) : ''}</p>`;
}
function paperEnd_(items) {
  const seq = wholeQuestions_(items);
  const qs = new Set(seq.map(x => qId_(x) || x)).size;
  const searched = !!String(STUFF.q || '').trim();
  const tail = healthTiles_(items) + tagDoors_(items);
  if (answersView_()) {
    const a = stuffPages_().length;
    return paperCover_(items) + `<p class="find-end">${searched ? 'The answers it found.' : 'The paper&rsquo;s answers, in order.'}
        <b>Swipe up for ${a === 1 ? 'the one answer' : 'its ' + a + ' answers'}.</b></p>` + tail;
  }
  const first = seq.find(x => qId_(x));
  if (searched) {
    return paperCover_(items) + `<p class="find-end">In this paper:
        <b>swipe up for ${qs === 1 && first ? esc(qNum_(first)) : 'its ' + qs + ' questions'}.</b></p>` + tail;
  }
  return paperCover_(items) + `<p class="find-end">That is the paper, in order.
        <b>Swipe up for ${qs === 1 ? 'its one question' : 'its ' + qs + ' questions'}.</b></p>` + tail;
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
    + (admin && typeof jobAdminTiles_ === 'function' ? jobAdminTiles_(j, stage, yes) : '');
  const foot = tiles.trim() ? `<div class="tile-row rc-tiles">${tiles}</div>` : '';
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

function accountPages_() {
  if (!USER) {
    /* THE GOOGLE BUTTON IS MOUNTED A FRAME LATE — Google renders into an element that has to exist
       first, and the element is in the card this returns. */
    if (typeof mountGoogleWhenDrawn === 'function') mountGoogleWhenDrawn();
    return (typeof signInCard_ === 'function' ? [signInCard_()] : []).filter(Boolean);
  }
  /* ---------- YOU FIRST, THEN EVERYBODY ELSE § */
  /* ---------- AND YOU WERE THE ONE PERSON `findCard` DID NOT DRAW § */
  const myRow = myCardRow_();

  /* ---------- AN ITEM, NOT A ROW, AND THAT IS WHY THE MESSAGE TILE WAS MISSING § */
  /* ---------- AND YOUR OWN CARD IS `me`, WHICH IS THE KIND NOTHING HAD EVER BUILT § */
  /* `account: true` IS WHERE A CARD CAN BE EDITED — this column, and nowhere else the same tutor is drawn (a star puts them on Saved too). § */
  const asItem_ = (t, kind) => ({
    kind: kind || 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
    cost: priced_(t.rate), off: t.listed === false, row: t, account: true,
  });

  /* ---------- A CARD OPEN FOR EDITING IS ITS OWN FORM, IN ITS OWN PLACE § */
  const editing_ = t => typeof cardEditing_ === 'function' && cardEditing_(t);
  const withTiles_ = t => editing_(t) ? cardEditHtml_(t)
    : (typeof findCard === 'function' ? findCard({ kind: 'tutor', row: t }) : '')
    + (typeof cardTiles_ === 'function' ? cardTiles_(asItem_(t)) : '');

  /* ---------- AND THE PRIVATE HALF WENT DARK WHEN BOOKING LEFT THE FUNNEL § */
  const me = [
    /* YOUR OWN CARD, OR YOUR OWN CARD BEING EDITED — the form, then its Save and Cancel, in place. */
    (editing_(myRow) ? cardEditHtml_(myRow)
      : (typeof meCard === 'function' ? meCard(myRow) : withTiles_(myRow)))
    /* SIGN OUT IS IN THIS ROW, beside the star — see `cardActions_`'s `me` branch in tiles.js. § */
      + (typeof cardTiles_ === 'function' ? cardTiles_(asItem_(myRow, 'me'))
        : `<div class="tile-row">${tile_({ icon: 'out', label: 'Sign out', act: 'signout' })}</div>`),
    /* "WE WILL EMAIL YOU ONCE YOU OPEN THE LINK" — one line under the row while your own address is unproved, because `notify` sends it nothing until then and a § */
    typeof mailHeldNote_ === 'function' ? mailHeldNote_() : '',
  ].join('');

  /* ---------- AND AN UNLISTED TUTOR WAS DELETED FROM THE ONE SCREEN THAT CAN SWITCH HIM BACK ON -- § */
  /* ---------- YOUR FAMILY, BETWEEN YOU AND EVERYBODY ELSE § */
  /* `sibling` ON *"students should be able to see their parents and siblings likewise"*. § */
  const famLabel_ = { parent: 'Your parent', child: 'Your child', sibling: 'Your brother or sister' };
  const famMine = !!(USER.personId && DATA.familyFor && String(DATA.familyFor) === String(USER.personId));
  const family = (famMine && Array.isArray(DATA.family) ? DATA.family : [])
    .filter(f => f && f.personId && f.title && famLabel_[f.relation]
      && !(USER.personId && String(f.personId) === String(USER.personId)));
  /* AND THE REQUESTS THAT BECOME ONE. § */
  const claimPages = (famMine && Array.isArray(DATA.claims) && typeof claimCard_ === 'function')
    ? DATA.claims.filter(c => c && c.rowIndex && c.from).map(claimCard_) : [];
  const famIds = family.map(f => String(f.personId));
  const famPages = family.map(f => {
    const asTutor = (DATA.tutors || []).find(t => t && t.personId && String(t.personId) === String(f.personId));
    const row = Object.assign({}, asTutor || {}, {
      title: f.title, handle: f.handle || (asTutor || {}).handle, personId: f.personId,
      image: f.image || (asTutor || {}).image || '',
      /* AND THE FIGURE THAT CAME WITH THE FACE — `doGet` sends `avatar` on a family card only when the face is `pfp:avatar` (`faceFig_`), and this row was rebuilt § */
      avatar: f.image ? f.avatar : (asTutor || {}).avatar,
      role: famLabel_[f.relation] + (asTutor ? ' · ' + (asTutor.role || 'Tutor') : ''),
    });
    /* ---------- "NEW PIN" WAS HERE, ON YOUR CHILD'S CARD § */
    return asTutor ? withTiles_(row) : (typeof findCard === 'function' ? findCard({ kind: 'tutor', row }) : '');
  });

  const others = (DATA.tutors || [])
    .filter(t => t && t.title)
    .filter(t => !(t.personId && famIds.indexOf(String(t.personId)) !== -1))
    /* NOT YOU, TWICE. With a tutor row of your own you would otherwise appear at the top as your account and again below as a tutor — the same duplication the `me` § */
    .filter(t => !mineIs_(t))
    .map(withTiles_);

  /* ---------- AND FOR AN ADMIN, EVERYBODY ELSE AS WELL § */
  const everyone = (typeof isAdmin === 'function' && isAdmin() && Array.isArray(DATA.everyone)
      ? DATA.everyone : [])
    .filter(p => p && p.title)
    .filter(p => !(p.personId && famIds.indexOf(String(p.personId)) !== -1))
    .filter(p => !mineIs_(p))
    /* A BLANK HANDLE IS SAID, NOT FILLED WITH THE FIRST NAME. § */
    .map(p => Object.assign({}, p, { activity: subsLine_(p.personId),
                                     role: (p.role || 'Client') + (p.handle ? '' : ' · no handle yet') }))
    /* AND "NEW PIN" BESIDE "MESSAGE" — the admin is who a child with no email and no linked parent goes to, and the only remedy was four digits typed into the sheet § */
    .map(p => (typeof findCard === 'function' ? findCard({ kind: 'tutor', row: p }) : '')
      + (typeof tile_ === 'function' ? `<div class="tile-row">${tile_({ icon: 'chat',
          label: 'Message', note: 'a note to them', act: 'msg-open',
          data: { to: p.title, id: p.personId || '' } })}${p.personId ? tile_({ icon: 'key',
          label: 'New PIN', note: 'to sign in with', act: 'kid-pin',
          data: { id: p.personId, name: String(p.title || '').split(' ')[0] } }) : ''}</div>` : ''));

  /* ---------- THE WRAPPER WENT WHEN THE PASS DID, AND LEAVING IT WOULD HAVE NESTED TWO CARDS § */
  /* ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, THE COLUMN SAYS MORE IS COMING § */
  const coming = typeof awaiting_ === 'function' && awaiting_() ? [loading_()] : [];
  return [me].concat(claimPages, famPages, others, everyone, coming);
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

/* THE COLUMN ITSELF. One page when signed out — the sign-in card — and one when signed in. § */
/* ANYTHING UNSIGNED RIDES WITH THE ACCOUNT. The library is in the funnel, which is where somebody
   goes to CHECK a document; this is where somebody is TOLD about one. See the long note at the top
   of terms.js on why both exist. */
screen('account', () => pages('account',
  accountPages_().concat(typeof termsPages_ === 'function' ? termsPages_() : [])));

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
                             'examMonth', 'year'];
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
    if (field === 'year' && (said.sitting || said.examYear)) return;
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
    if (vals.length === 1 && t.coverage >= 1 && !vals[0].bucket) {
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
  if (!stuffAsked() || !printOffered_() || bundlesView_()) return null;
  const items = stuffFiltered();
  if (BUNDLE_MEMO.has(items)) return BUNDLE_MEMO.get(items);
  let out = null;
  try { out = bundleBuild_(items); } catch (e) { out = null; }
  BUNDLE_MEMO.set(items, out);
  return out;
}

/* `min` IS ONE FOR A SITTING ASKED FOR BY NAME (`bundlesBySitting_`): somebody who chose `Bundles`
   came to order, and the friction `BUNDLE_MIN` keeps off a working journey is the errand here. */
/* ---------- ONE FLOOR, READ BY BOTH GATES § */
function bundleBuild_(items, min) {
  if (!items.length) return null;
  const floor = min || BUNDLE_MIN;
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
  const labels = paperLabels_(kept);
  const shortIn = ids => shortLabels_(ids.map(id => ({ value: id, text: labels[id] || id })));
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
      tile_({ icon: 'open', label: 'See your basket', act: 'cart-open' })}</div>`;
}

/* ---------- WHICH OF THE ANSWERS ABOVE TOOK PART OF A PAPER AWAY § */
const BUNDLE_CUT_MEMO = new WeakMap();
function bundleCutBy_() {
  const items = stuffFiltered();
  if (BUNDLE_CUT_MEMO.has(items)) return BUNDLE_CUT_MEMO.get(items);
  const idOf = x => (x && x.kind === 'question' ? String(paperIdOf_(x.row || x) || '') : '');
  const listed = new Set(items.map(idOf).filter(Boolean));
  const papers = stuffItems().filter(x => listed.has(idOf(x)));
  const credits = USER ? (USER.credits || 0) : 0;
  const byField = {};
  (STUFF.filters || []).forEach(f => {
    if (f && !f.any) (byField[f.field] = byField[f.field] || []).push(f);
  });
  const cut = [];
  Object.keys(byField).forEach(field => {
    if (stuffNarrow_(papers, byField[field], [], credits).length < papers.length) {
      const facet = facetBy(field);
      cut.push(facet && facet.label ? facet.label : field);
    }
  });
  const words = stuffWords_(STUFF.q);
  if (words.length && stuffNarrow_(papers, [], words, credits).length < papers.length) cut.push('the search');
  BUNDLE_CUT_MEMO.set(items, cut);
  return cut;
}

/* THE DEAD END'S SENTENCE, from `bundleCutBy_` — each answer by the name its question has above it. § */
function bundleDeadEnd_() {
  const cut = bundleCutBy_();
  const names = cut.map((n, i) => n === 'the search' ? (i ? 'the search' : 'The search')
                                                      : `<b>${esc(n)}</b>`);
  const said = names.length > 1
    ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0];
  const undo = cut.length === 1 && cut[0] === 'the search' ? 'Clear it'
             : names.length > 1 ? 'Take them back' : 'Take it back';
  const why = !names.length
    ? 'Take an answer back above — a bundle is whole papers, and nothing on this list is one.'
    : `${said} ${names.length > 1 ? 'keep' : 'keeps'} only some of a paper's questions, and a bundle
        is whole papers. ${undo} above.`;
  return `<div class="card bundle qcard">${tagRow_(BUNDLE_ITEM)}
        <p class="bundle-sub">No whole sitting left on this list to bundle. ${why}</p></div>`;
}

function bundlePages_() {
  if (bundlesView_()) {
    const all = bundlesBySitting_();
    /* "A SINGLE PAPER" WAS IN THIS SENTENCE, and it was true only because of the fault over `bundleBuild_`'s floor: § */
    if (!all.length) return [bundleDeadEnd_()];
    return all.map(bundleCard_);
  }
  const b = bundleOf_();
  return b ? [bundleCard_(b)] : [];
}

/* ---------- THE FUNNEL'S LAST LINE, WHEN THE RESULTS ARE BUNDLES § */
function bundlesEnd_() {
  const n = bundlesBySitting_().length;
  if (!n) return `<p class="find-end">No bundle on this list. <b>Swipe up for why.</b></p>`;
  return `<p class="find-end">${funnelEnded_() ? 'That is the paper.' : 'Nothing left to narrow.'}
      <b>Swipe up for ${n === 1 ? 'the bundle' : 'the ' + n + ' bundles'}.</b></p>`;
}

/* ---------- `Bundles` IS A KIND, BESIDE `Questions` AND `Answers` § */
/* ---------- PRINTABLE IS A FACT ABOUT THE PAPER, SO IT IS READ OFF THE PAPER § */
function bundleable_(x) {
  const r = (x && x.row) || x || {};
  const doc = docById_(paperIdOf_(r));
  return canPrint_(doc) && /paper/i.test(String(doc.document_type || '')) && printOffered_();
}
function bundlesView_() {
  return (STUFF.filters || []).some(f => f && f.field === 'kindLabel' && !f.any && f.value === 'Bundles');
}
const BUNDLES_MEMO = new WeakMap();
function bundlesBySitting_() {
  if (!printOffered_()) return [];
  const items = stuffFiltered();
  if (BUNDLES_MEMO.has(items)) return BUNDLES_MEMO.get(items);
  const groups = new Map();
  items.forEach(x => {
    const r = (x && x.row) || x || {};
    if (!x || x.kind !== 'question') return;
    const k = [r.exam_board || r.company, r.subject, r.level, r.year, r.month].join('|');
    if (!groups.has(k)) groups.set(k, { year: +r.year || 0, month: +r.month || 0, items: [] });
    groups.get(k).items.push(x);
  });
  const out = [...groups.values()]
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .map(g => { try { return bundleBuild_(g.items, 1); } catch (e) { return null; } })
    .filter(Boolean);
  BUNDLES_MEMO.set(items, out);
  return out;
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
  return pg.part ? stuffPart_(pg.x, pg.part) : stuffCard(pg.x, credits);
}

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
  try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) {}
}

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

function stuffCard(x, credits) {
  /* `credits` is passed IN rather than read from `USER` here, because the page works it out once and hands it to every card — reading it per card would be the same § */
  /* A kind with no card of its own falls back to the shared one — a new row type appears on the
     screen as SOMETHING rather than as nothing, which is the failure that is easy to miss. */
  const html = (kindOf_(x).card || thingCard_)(x, credits);
  if (!x.key) return html;
  /* THE STAR IS NOT HERE ANY MORE — it is the first tile in the action row, drawn by `favTile_` inside `cardTiles_`, which every card builder already calls. § */
  return `<div class="favwrap${isFav(x.key) ? ' is-fav' : ''}">${html}</div>${cardTiles_(x)}`;
}

/* WHAT A CHIP READS. The facet's own `showOf` where it has one, so the chip says the same words
   the answer row said; the value itself otherwise, which is every facet but `paperId`. */
/* ---------- AND THE SAME WORDS, WHICH MEANS THE SAME SHORTENING § */
let CHIP_SHOW = { key: null, from: null, out: {} };   /* a `let`: one per finder, see `inFinder_` */
function chipShow_(f, i) {
  const facet = facetBy(f.field);
  if (!facet || !facet.showOf) return f.value;
  const fallback = () => { try { return facet.showOf(f.value) || f.value; } catch (e) { return f.value; } };
  if (typeof i !== 'number') return fallback();
  const key = JSON.stringify([STUFF.q || '', STUFF.filters.slice(0, i + 1)]);
  if (CHIP_SHOW.from !== DATA) { CHIP_SHOW.from = DATA; CHIP_SHOW.out = {}; }
  if (key in CHIP_SHOW.out) return CHIP_SHOW.out[key];
  let show = '';
  try {
    const before = STUFF.filters.slice(0, i).filter(g => g.field !== f.field);
    const credits = USER ? (USER.credits || 0) : 0;
    const items = stuffNarrow_(stuffItems(), before, stuffWords_(STUFF.q), credits);
    const ids = [];
    const seen = new Set();
    items.forEach(x => {
      let v;
      try { v = facet.of(x); } catch (e) { v = ''; }
      asList_(v).forEach(one => { if (one && !seen.has(String(one))) { seen.add(String(one)); ids.push(String(one)); } });
    });
    if (!seen.has(String(f.value))) ids.push(String(f.value));
    /* WHAT THE CHIPS BEFORE IT SAID, the same `said` the answer row was drawn with — so a Paper chip
       pressed under `June` reads `Paper 1 · 2023` exactly as its button did. */
    const said = sittingSaid_(before);
    const values = ids.map(v => ({ value: v, text: facet.showOf(v, ids, said) }));
    shortLabels_(values);
    const mine = values.find(v => v.value === String(f.value));
    show = mine ? (mine.show || mine.text) : '';
  } catch (e) { show = ''; }
  return (CHIP_SHOW.out[key] = show || fallback());
}

/* ---------- WHAT KIND OF TAG THIS IS, WHICH IS ITS COLOUR § */
const TAG_OF = {
  /* WHICH ONE: the paper, and inside it the question, part, sub-part and page -- all red, because each names one thing of several as `Paper 1` does. § */
  paperId: 'paper', fiveDay: 'paper',
  qNumber: 'paper', qPart: 'paper', qSub: 'paper', qPage: 'paper', qPages: 'paper',
  subject: 'subject',
  level: 'level', keystage: 'level', yearGroup: 'level', bandValue: 'level', fiveLevel: 'level',
  examMonth: 'sitting', examYear: 'sitting', year: 'sitting', fiveMonth: 'sitting', decade: 'sitting',
  documentType: 'type', practicalType: 'type', boxKind: 'type',
  /* A COURSEWORK OR A PROJECT IS WHAT KIND OF THING IT IS, as experiment-or-build is: the same colour. */
  projectType: 'type',
  examBoard: 'board', company: 'board',
  tier: 'tier', division: 'tier',
  /* `topicArea` was `topic` too, and is retired — see `RETIRED_FACETS`. */
  topic: 'topic',
  /* ---------- `needs` IS A KIND AGAIN, AND STILL NOT GOLD § */
  needs: 'needs',
  /* ---------- THE BIBLE'S SIX, IN KINDS THAT ALREADY HAVE COLOURS § */
  bibleTranslation: 'board', bibleTestament: 'level', bibleGroup: 'topic',
  bibleBook: 'paper', bibleChapter: 'paper', bibleVerse: 'paper',
  /* A PAPER'S HEALTH IS NOT ANY OTHER KIND — it is about the transcription, not the paper — so it has
     a token of its own, `--tag-health`. */
  health: 'health', answerable: 'answerable',
};
const tagOf_ = field => TAG_OF[field] || '';
const tagAttr_ = field => tagOf_(field) ? ` data-tag="${tagOf_(field)}"` : '';

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
  /* A BUCKET IS HALF AN ANSWER — see `bucketValues_`. The flag rides on the chip so `filterHit`
     knows to test membership and `nextFacet` knows the question is not finished with. */
  const f = { field: el.dataset.field, value: el.dataset.value };
  if (el.dataset.bucket) f.bucket = true;
  STUFF.filters.push(f);
  paintStuff();
  /* A BOOK OF THE BIBLE CHOSEN WAS FETCHED HERE TOO (docs/history/341), and the review of 12 Oct found nothing could tell: § */
}));
/* ---------- AND NOT ANSWERING IT IS ALSO AN ANSWER ----------------------------------------------
   Same push, same repaint, no value. See the `any` note in `stuffFind` for what that entry does and
   does not do. */
on('facet-skip', el => inFinder_(finderAt_(el), () => {
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
    const want = list.map((p, i) => {
      const room = p.clientHeight - pad(p);
      const used = p.scrollHeight - pad(p);
      if (room <= 0 || used - room <= 2) return 1;
      if (ticks[i] || forms[i] || drawn[i]) return 1;
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
    const over = list.map((p, i) => (want[i] <= PANE_ZOOM_MIN || ((essay[i] || ticks[i] || forms[i] || drawn[i]) && want[i] === 1))
      && p.scrollHeight - p.clientHeight > (ticks[i] || forms[i] || drawn[i] ? 2 : PANE_REACH));
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
function paneWatch_(host) {
  if (!host || !host.querySelectorAll) return;
  const panes = host.querySelectorAll('.pane');
  /* ---------- ONLY THE PANES IT HAS NOT ALREADY MEASURED § */
  const vp = innerWidth + 'x' + innerHeight;
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
    if (bundlesView_()) return bundlesEnd_() + adding;
    /* AND OVER THE BIBLE, WHICH VERSES — or why there is no question over its cover yet. */
    const be = bibleEnd_(items);
    if (be) return be + adding;
    if (funnelEnded_()) return paperEnd_(items) + adding;
    return `<p class="find-end">Nothing left to narrow.
      <b>Swipe up for the ${n}.</b></p>` + tagDoors_(items) + adding;
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
  /* `data-bucket` SAYS WHICH KIND OF ANSWER THIS IS, and it is carried rather than worked out later: § */
  /* `.answers` IS WHAT MAKES THEM CHIPS ON A LINE rather than rows down the card — see the block of that name in style.css. § */
  /* ---------- A NUMBERED RUN IS A GRID § */
  const grid = !!facet.grid;
  /* ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, MORE ANSWERS ARE COMING § */
  const more = typeof awaiting_ === 'function' && awaiting_() ? loading_() : '';
  return '<div class="answers' + (grid ? ' is-grid' : '') + '">' + values.map(v => `<div class="counted row tap" data-do="facet-pick"${tagAttr_(facet.field)}
        data-field="${esc(facet.field)}" data-value="${esc(v.value)}"${v.bucket ? ' data-bucket="1"' : ''}${
        grid ? ` aria-label="${esc(facet.label + ' ' + (v.show || v.value))}"` : ''}>
        <span class="k">${mark(v.show || v.value)}</span>
      </div>`).join('') + skip + '</div>' + tagDoors_(items) + more;
}

/* `stuff-jump` went with the group list. § */

/* `paperish_` WAS HERE — "is this row actually an exam paper", by its `resource_type` or a paper
   number in its name. It chose between the exam cover and an ordinary card, and both callers went
   with the cover. */



/* ---------- `paperCard`, `openPaper_` AND `on('paper-read')` WERE ALL HERE § */

/* `stuffCount` was here. Removed with the line it fed — a function whose only caller has gone is
   the thing `check-dead.js` would name next time anyway. */


/* ---------- ONE DRAW FOR BOTH FINDERS § */
function finderScreen_() {
  const F = FINDER;
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