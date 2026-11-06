/* @family. — find-finder.js ONE FILE, SPLIT. § */

/* ---------- SHOP & RESOURCES § */
/* FILTERS YOU ADD, not a mode you pick. § */
/* `sort` was here and is gone with the control that set it — see `stuffFiltered`. What is left is
   the two things this screen actually holds: what you typed, and what you have narrowed to. */
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
  /* THE PAGES ABOVE THE QUESTION (526) and how many: none, but Find's for an admin (What's missing, missing.js). */
  lead: () => [], leadN: () => 0, leadOn: 0,
}, o);
const FINDER_EMPTY = 'Nothing in the shop or the library yet.';
const FINDERS = {
  stuff: finder_({ id: 'stuff', st: STUFF, place: 'find', widgets: true,
                   front: () => [].concat(bookingPages_(), feedPages_(), bundlePages_()),
                   lead: () => (typeof missingLead_ === 'function' ? missingLead_() : []),
                   leadN: () => (typeof missingLeadN_ === 'function' ? missingLeadN_() : 0),
                   empty: FINDER_EMPTY }),
  res:   finder_({ id: 'res', st: RES_ST, place: 'res', widgets: false,
                   /* A RULE (496), locked: `find-front` — the front pages are Find's alone. */
                   front: () => (typeof ruleOn_ !== 'function' || ruleOn_('find-front')) ? [] : [].concat(bookingPages_(), feedPages_(), bundlePages_()),
                   empty: FINDER_EMPTY }),
};
let FINDER = FINDERS.stuff;
function finderPark_(F) {
  F.st = STUFF; F.items = ITEM_MEMO; F.found = FIND_MEMO; F.pages = STUFF_PAGES;
  F.late = STUFF_LATE; F.typing = stuffTimer; F.tried = FIND_PLACE_TRIED;
}
function finderUnpark_(F) {
  STUFF = F.st; ITEM_MEMO = F.items; FIND_MEMO = F.found; STUFF_PAGES = F.pages;
  STUFF_LATE = F.late; stuffTimer = F.typing; FIND_PLACE_TRIED = F.tried;
}
function inFinder_(F, fn) {
  if (!F || F === FINDER) return fn();
  const was = FINDER;
  finderPark_(was); finderUnpark_(F); FINDER = F;
  try { return fn(); }
  finally { finderPark_(F); finderUnpark_(was); FINDER = was; }
}
/* THE ONE WRITER of a finder's question (R1): chips, words and box set together, so a door opened from a card never keeps old words under its new chips. `paint: false` only to count first. */
function finderSet_(F, o) {
  F = F || FINDERS.stuff;
  o = o || {};
  return inFinder_(F, () => {
    clearTimeout(stuffTimer);
    stuffTimer = null;
    STUFF.filters = Array.isArray(o.filters) ? o.filters.map(c => Object.assign({}, c)) : [];
    STUFF.q = typeof o.q === 'string' ? o.q : '';
    const box = $(F.id + '-q');
    if (box) box.value = STUFF.q;
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
  return inFinder_(finderOf_(id) || FINDERS.stuff, () => FINDER.leadN() + 1 + frontPages_().length + stuffPageCount());
}
/* THE PAGES ABOVE THE QUESTION CAME OR WENT (526: an admin signed in or out): the page you were on moves with them. */
function finderLeadShift_(F, n) {
  const was = F.leadOn || 0;
  F.leadOn = n;
  if (n !== was) PAGE[F.id] = Math.max(0, (PAGE[F.id] || 0) + n - was);
}
/* `is-lead` is what `paintStuff` keeps: it redraws only what is below the question. One tile row per thing, as `pages` draws (489). */
const finderLeadHtml_ = lead => lead.map(c => `<section class="page is-lead"><div class="pane">${rowsOne_(c)}</div></section>`).join('');

/* The fields a filter can be ON, what each is called, and where its values come from. One table,
   so adding a way to filter is a row here and nothing else — the picker, the matching and the
   chip label all read it. */
/* ---------- ONE QUESTION AT A TIME § */
/* WHAT KINDS OF THING CAN BE FOUND. § */
const KINDS = {
  /* A person, a place and a subject already have a card each — written for the Find screen and carrying the class that colours the name. § */
  /* ---------- A TUTOR IS TWO THINGS AND THE GROUP HAD ROOM FOR ONE § */
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

  /* ---------- POSTS ARE A THING YOU LOOK FOR § */

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
  content: { group: 'Learning', label: 'Library', card: x => contentCard_(x) },
  /* AN INSERT IS WHAT THE EXAM HANDS YOU (455), and Content (463): the owner, "inserts count as content" -- no tag of its own. */
  insert: { group: 'Learning', label: 'Library', card: x => insertCard_(x) },
  /* THE HISTORY DATABASE (459): three kinds, Library on the History shelf as boxers are on Boxing's; `histKind` says which. */
  manuscript: { group: 'Learning', label: 'Library', card: x => histCard_(x) },
  figure: { group: 'Learning', label: 'Library', card: x => histCard_(x) },
  writing: { group: 'Learning', label: 'Library', card: x => histCard_(x) },
  /* ITS FOURTH (461): an event, and a timeline — every event of one `era`, in date order, a tile each. */
  event: { group: 'Learning', label: 'Library', card: x => histCard_(x) },
  /* A TIMELINE IS ITS OWN KIND OF ITEM (545): the owner, "timelines should have a tag called timeline". */
  timeline: { group: 'Learning', label: 'Timeline', card: x => histTimelineCard_(x) },
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
  /* MECHANICS (548, 650): parts and cars, Library like the rest; `mKind` says which, js/mechanics.js. */
  mech: { group: 'Learning', label: 'Library', card: x => mechCard_(x) },
  /* CHEMISTRY (550): elements, substances and reactions, Library like the rest; `mKind` says which, js/chemistry.js. */
  chem: { group: 'Learning', label: 'Library', card: x => chemCard_(x) },

  /* ---------- TWO GROUPS, NOT ONE GROUP AND THEN THE SAME QUESTION AGAIN § */
  /* ---------- THESE TWO STAY IN THE TABLE AND NO LONGER ANSWER THE FIRST QUESTION § */
  tool: { group: 'Tools', label: 'Tools', card: x => widgetCard_(x) },
  game: { group: 'Games', label: 'Games', card: x => widgetCard_(x) },
  reel: { group: 'Videos', label: 'Videos', card: x => widgetCard_(x) },
  /* COMING SOON (880): a switched-off column or widget, its name, one line, Coming soon and Suggest; nothing on it works. */
  soon: { group: 'Coming soon', label: 'Coming soon', card: x => soonCard_(x) },
  /* PEOPLE (owner, 4 Nov): everybody an admin may see, one card each, drawn like the people columns drew them. */
  person: { group: 'Profiles', label: 'Profiles', card: x => profileDoorCard_(x) }, video: { group: 'Videos', label: 'Videos', card: x => videoDoorCard_(x) },
  /* SETTINGS (owner, 4 Nov): their own answer in Find; each card Coming soon until it is turned back on. */
  setting: { group: 'Settings', label: 'Settings', card: x => (x.soon ? soonCard_(x) : settingDoorCard_(x)) },
  /* MESSAGES (owner, 4 Nov): its own answer; Coming soon while the DM column is off. */
  msg: { group: 'Messages', label: 'Messages', card: x => (x.soon ? soonCard_(x) : msgDoorCard_(x)) },
  /* THE SWITCHED-OFF AREAS' ONE CARD EACH (OFF_KINDS). */
  offPosts: { group: 'Posts', label: 'Posts', card: x => soonCard_(x) },
  offShop: { group: 'Shop', label: 'Shop', card: x => soonCard_(x) },
  offBooking: { group: 'Booking', label: 'Booking', card: x => soonCard_(x) },
  /* SITE HEALTH (owner, 4 Nov): Logic health and What's missing, an admin's, as Find cards. */
  health: { group: 'Settings', label: 'Settings', card: x => (typeof healthCardOf_ === 'function' ? healthCardOf_(x.which) : '') },
  /* POSTS (owner, 4 Nov): the feed's posts as Find cards, drawn by the feed's own postCard_. */
  post: { group: 'Posts', label: 'Posts', card: x => `<div class="card post-door">${typeof postCard_ === 'function' ? postCard_(x.row, 0) : `<p>${esc(x.name)}</p>`}</div>` },

  /* ---------- `link` WAS A KIND HERE, AND THE LINKS ARE OFF FIND § */

  /* A resource and a shop row share a card: to somebody looking for one they are the same kind of
     thing — a picture, a name, what it belongs to, and what it costs if it costs anything. */
  /* `topic` WAS HERE — the documents, labelled `Resources`. The funnel lists the questions inside
     them now and not the boxes; see the note above `questionItems`. */
  /* ---------- A QUESTION IS NOT A DIFFERENT KIND OF THING FROM ITS PAPER § */
  /* ---------- `question` WAS A KIND AND IS NOT ANY MORE § */
  /* ---------- THE SHOP HAS A COLUMN OF ITS OWN, AND THIS IS NOT A DOOR ANY MORE § */
  shop:  { group: 'Shop',     label: 'Things',    card: (x, c) => (x.widget ? widgetCard_(x) : thingCard_(x, c)) },
};

/* WHAT A QUESTION'S ANSWER PAGE IS CALLED, as the kinds tab names it. */
const ansKind_ = () => (kindMap_().answer || {}).label || 'Answers';

/* A WIDGET'S FIND CARD (790) IS THE CARD ITS COLUMN DREW — slot, star, padlock, Suggest — started and stopped by arcade.js as a column's are (`finderWidgets_`). */
function widgetCard_(x) {
  if (x.widget && typeof widgetOnColumn_ === 'function') return widgetOnColumn_(x.widget, true);   /* `true`: with the admin's group, which a Find card keeps short (`layoutTiles_`) */
  return `<div class="card">
    <h3>${esc(x.name)}</h3>
  </div>`;
}

/* THE OFF WIDGETS' NAMES (880), for a card whose file is never fetched; which are off is tiers.json's (TIER_OFF_WIDGETS). */
const SOON_WIDGET_NAMES = { console: 'Console', boardgames: 'Board games', wordgames: 'Word & number games', reels: 'One more thing', videos: 'Videos',
  newspaper: 'Newspaper', calculator: 'Calculator', flyers: 'Make a flyer', mat: 'Cheat sheet maker (maths mat)', timer: 'Timer', docket: 'Docket',
  notepad: 'Notepad', spotify: 'Spotify', speedread: 'Speed reader (one word at a time)', timetable: 'Timetable', typing: 'Touch typing (keyboard practice)',
  cart: 'Basket', shopfind: 'Search the shop', calendar: 'Calendar', termdates: 'Term dates', countdowns: 'Countdowns', favlinks: 'Favourite links',
  rewrite: 'Rewrite coach', poster: 'Poster planner', pixel: 'Pixel editor', verse: 'E-ink screen', whiteboard: 'Whiteboard', libcards: 'Library cards' };
/* EVERY SWITCHED-OFF COLUMN AND WIDGET, from columns.json and tiers.json, so turning one on removes its card. */
function soonItems_() {
  /* A COLUMN WHOSE THINGS ARE FIND ITEMS NOW (batch C: settings, reels) is no Coming soon card. */
  const inFind = c => c.screen === 'reel' || (typeof SETTINGS_HOME !== 'undefined' && !!SETTINGS_HOME[c.screen]);
  const cols = ((DATA && DATA.columnsOff) || []).filter(c => !inFind(c)).map(c => ({ kind: c.screen === 'dm' ? 'msg' : 'soon', name: c.label, sub: c.what || '', image: '', key: 'soon:' + c.screen, soon: 'column', soonId: c.screen }));
  const ws = (typeof TIER_OFF_WIDGETS !== 'undefined' ? TIER_OFF_WIDGETS : []).map(id => ({ kind: 'soon', name: SOON_WIDGET_NAMES[id] || id,
    sub: SOON_WIDGET_NAMES[id] || id, image: '', key: 'soon:w:' + id, soon: 'widget', soonId: id }));
  /* YOUR SETTINGS (880): off the sign-in column while SETTINGS_OFF; one card each, so the owner sees what is waiting. */
  const set = (typeof SETTINGS_OFF !== 'undefined' && SETTINGS_OFF ? [['picture', 'Picture'], ['figure', 'Your figure'], ['name', 'Name'], ['handle', 'Handle'],
    ['settings', 'Your settings'], ['push', 'Phone notifications'], ['progress', 'Progress'], ['brownie', 'Brownie points'], ['roadmap', 'Roadmap'], ['conduct', 'Code of conduct']] : [])
    .map(([id, n]) => ({ kind: 'setting', name: n, sub: 'Settings', image: '', key: 'soon:set:' + id, soon: 'setting', soonId: id }));
  return cols.concat(ws, set).map(x => Object.assign(x, { text: [x.name, x.sub].join(' ') }));
}
function soonCard_(x) {
  return `<div class="card soon-card"><h3>${esc(x.name)}</h3>${x.sub && x.sub !== x.name ? `<p>${esc(x.sub)}</p>` : ''}<p class="sub">${esc(brand('comingSoon', 'Coming soon'))}</p></div>`;
}

/* The card a resource and a shop row share. Named rather than written twice, because the two
   entries above genuinely want the same thing and a copy each is a copy to keep in step. */
function thingCard_(x, credits) {
  /* One card shape for both, because they are the same kind of thing to a person looking for one: § */
  {
    const free = x.cost === 0;
    const afford = isShop_(x) && !free && !x.pence && credits >= x.cost;
    /* WHAT IT TAKES TO HAVE IT. § */
    const myLevel = Math.floor((Number(USER && USER.xp) || 0) / 10);
    /* ---------- AND A FOURTH ANSWER: NOBODY HAS PRICED IT § */
    const price = !isShop_(x) ? ''
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
    if (isQ_(x)) return questionCard_(x);

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
          ${isShop_(x) ? tagRow_(x) : `<p class="crumb">${[x.company].concat(levelSaid_(x).length ? levelSaid_(x) : [x.keystage]).concat([
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
          ${isShop_(x) ? '' : `<p class="sub">${x.company
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
/* The order here is only the fallback for a facet the facets tab does not place; the tab's sort_order is the order. */
const FACETS = [
  { field: 'forLabel',  label: 'What for',    of: x => x.groups || kindOf_(x).group },
  /* `Answers` BESIDE THE ITEM'S OWN KIND: a question with an answer is found by either, and its answer page carries the tag. */
  /* A KIND UNDER ANOTHER (`KIND_UNDER`, 610) ANSWERS ONLY THAT ONE HERE: Questions are reached through Practice, a Timeline through Library. */
  { field: 'kindLabel', label: 'What kind',
    of: x => kindTop_(x) || x.kindLabel || kindOf_(x).label,
    tagOf: (x, page) => kindTop_(x) || (page === 'ans' && isQ_(x) ? ansKind_() : (x.kindLabel || kindOf_(x).label)) },
  /* AND ITS OWN KIND IS THE NEXT QUESTION, asked by the one rule like any other (`Answers` beside a question that has one, and on no tool or video). */
  { field: 'kindOwn', label: 'Which',
    of: x => !kindTop_(x) ? '' : notTop_(x, isQ_(x) && questionHasAns_(x) ? [kindOf_(x).label, ansKind_()] : (x.kindLabel || kindOf_(x).label)),
    tagOf: (x, page) => !kindTop_(x) ? '' : notTop_(x, page === 'ans' && isQ_(x) ? ansKind_() : (x.kindLabel || kindOf_(x).label)) },
  /* SUBJECT STRAIGHT AFTER WHAT KIND (494), as the facets tab orders it: "the library should go subject first". */
  /* THE FRONT DOORS' OWN MENUS (batch C, find-doors.js): each item answers only its own. */
  ...[['postState', 'Which posts'], ['postBy', 'Who posted'], ['postWhen', 'When'], ['msgWith', 'Who with'], ['profileType', 'Who'], ['settingFor', 'Account type'],
    ['vidSubject', 'Subject'], ['vidTopic', 'Topic'], ['vidChannel', 'Channel'], ['vidLevel', 'Level']].map(([f, l]) => ({ field: f, label: l, of: x => x[f] || '' })),
  { field: 'projectType',   label: 'Project or coursework', of: x => x.projectType || '' },
  { field: 'subject',   label: 'Subject',     of: x => x.subject },
  { field: 'shelf',     label: 'Shelf',       of: x => x.shelf || '' },
  /* ONE FACET SET FOR EVERY WRITTEN WORK (520): the Bible, the Quran, the Talmud, the Hadith, the hymns and every other text
     answer the same questions, read off `writingOf_` (writings.js) — no loader has a private one. */
  /* ONE KIND OF VALUE A FACET (546): the religion, the language and whose translation are three questions, never one menu. */
  { field: 'wReligion',  label: 'Religion',   of: x => writingAt_(x, 'religion') },
  /* A COLLECTION IS A GROUP OF WORKS (600), so it is asked before Work: Rabbinic, Second Temple, Kabbalah; New Testament; Hadith. */
  { field: 'wCollection', label: 'Collection', of: x => writingAt_(x, 'collection') },
  /* WHAT IT IS BEFORE HOW IT IS WRITTEN (590): the work and the section a passage sits in, then its source, language and translation. */
  { field: 'wWork',      label: 'Work',       of: x => writingAt_(x, 'work') },
  { field: 'wSection',   label: 'Section',    of: x => writingAt_(x, 'section') },
  { field: 'wSource',    label: 'Source text', of: x => writingAt_(x, 'source') },
  /* ONE LANGUAGE QUESTION FOR EVERYTHING WRITTEN (546): a text's language and a manuscript's (the history database) are one kind of answer. */
  { field: 'wLanguage',  label: 'Language',   of: x => writingLanguageOf_(writingAt_(x, 'text')) || histCol_(x, 'language') },
  { field: 'wText',      label: 'Translation', of: x => writingVersionOf_(writingAt_(x, 'text')) },
  { field: 'wTradition', label: 'Tradition',  of: x => writingAt_(x, 'tradition') },
  { field: 'wBook',      label: 'Book',       of: x => writingAt_(x, 'book') },
  { field: 'wChapter',   label: 'Chapter',    of: x => writingAt_(x, 'chapter') },
  { field: 'wUnit',      label: 'Unit',       of: x => writingAt_(x, 'unit') },
  { field: 'wAuthor',    label: 'Author',     of: x => writingAt_(x, 'author') },
  { field: 'wForm',      label: 'Kind of writing', of: x => writingAt_(x, 'form') },
  /* MECHANICS (548): a car's facts as tags, read off the row; a row answers only what it has. */
  { field: 'mKind',     label: 'Card type',   of: x => x.mKind || '' },
  { field: 'mSystem',   label: 'System',      of: x => x.mSystem || '' },
  { field: 'mEngine',   label: 'Engine',      of: x => x.mEngine || '' },
  /* CHEMISTRY (550): an element's category or a substance's or reaction's type, then group, period and state, off the row. */
  { field: 'cCategory', label: 'Chemical type', of: x => x.cCategory || '' },
  { field: 'cGroup',    label: 'Group',       of: x => x.cGroup || '' },
  { field: 'cPeriod',   label: 'Period',      of: x => x.cPeriod || '' },
  { field: 'cState',    label: 'State',       of: x => x.cState || '' },
  { field: 'boxKind',   label: 'Boxers or fights', of: x => x.boxKind || '' },
  /* A BOUT'S FACTS ARE TAGS (445), like a question's: who, when, how. A boxer answers Fighter too, so his name finds him and his bouts. */
  { field: 'fighter',   label: 'Fighter',     of: x => isFight_(x) && x.row ? [x.row.a, x.row.b].filter(Boolean) : isBoxer_(x) ? x.name : '' },
  { field: 'boutMonth', label: 'Month',       of: x => boutDate_(x).month },
  { field: 'boutYear',  label: 'Year',        of: x => boutDate_(x).year },
  { field: 'decade',    label: 'Decade',      of: x => decadesOf_(x) },
  { field: 'division',  label: 'Division',    of: x => x.division || '' },
  { field: 'boutRound', label: 'Round',       of: x => isFight_(x) && x.row && Number(x.row.endRound) > 0 ? 'Round ' + Number(x.row.endRound) : '' },
  { field: 'boutMethod', label: 'Result',     of: x => (isFight_(x) && x.row && String(x.row.method || '').trim()) || '' },
  /* THE TITLE THE FIGHT CARD LOST (490) said who won and which night: tags now, like everything else. */
  { field: 'boutWinner', label: 'Winner',     of: x => boutWinner_(x) },
  { field: 'boutEvent', label: 'Event',       of: x => (isFight_(x) && x.row && String(x.row.event || '').trim()) || '' },
  /* THE HISTORY DATABASE'S (459): which table, the era its years touch, and its columns as ordinary tags (`histCol_`). */
  { field: 'histKind',  label: 'Manuscripts, figures, works or events', of: x => x.histKind || '' },
  { field: 'histEra',   label: 'Era',         of: x => histErasOf_(x) },
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
  /* A THEME (740): "just tags for items in shops… like history", from the shop tab's `theme` column. */
  { field: 'shopTheme', label: 'Theme',       of: x => x.shopTheme || '' },
  { field: 'practicalType', label: 'Experiment or build', of: x => x.practicalType || '' },
  { field: 'required',  label: 'Required',
    of: x => !isPractical_(x) || !x.row ? '' : PRAC_NEED[x.row.excluded ? 2 : x.row.required ? 0 : 1] },
  /* A TYPE UNDER ANOTHER (545, 660): Type offers the one above alone ("spec paper should be in past papers"); Which type, after it, its own. */
  { field: 'documentType', label: 'Type',     of: x => underTop_(DOC_TYPE_UNDER, x.documentType) },
  { field: 'typeOwn',      label: 'Which type', of: x => underOwn_(DOC_TYPE_UNDER, x.documentType) },
  /* A 5-A-DAY IS FOUND BY ITS LEVEL, ITS MONTH AND ITS DAY, each read off its paper id. */
  { field: 'fiveLevel', label: 'Level',       of: x => fiveADay_(x) ? x.tier || '' : '' },
  { field: 'fiveMonth', label: 'Month',       of: x => { const d = fiveADay_(x); return d ? d.month : ''; } },
  { field: 'fiveDay',   label: 'Day',         of: x => { const d = fiveADay_(x); return d ? d.day + ' ' + d.month : ''; } },
  { field: 'level',     label: 'Level',       of: x => levelOf_(x) },
  /* A RESOURCE CAN BELONG TO MORE THAN ONE KEY STAGE; a SATs row's is read off its year when the cell is blank. */
  { field: 'keystage',  label: 'Key stage',   of: x => { const s = satsStagesOf_(x); return s.length ? s : keyStagesOf_(x); } },
  /* A CHAPTER TAUGHT OVER SEVERAL YEARS ANSWERS EACH (770: "it should ask what year, no?" under KS2). */
  { field: 'yearGroup', label: 'School year', of: x => x.bandValue && x.bandType === 'year' ? 'Year ' + x.bandValue : (x.years || []).map(y => 'Year ' + y) },
  { field: 'bandValue', label: 'Grade',       of: x => x.bandValue && x.bandType === 'grade' ? 'Grade ' + x.bandValue : '' },
  { field: 'topic',     label: 'Topic',       of: x => topicShown_(x) ? (x.topic || topicOf_(x)) : [] },
  { field: 'examBoard', label: 'Exam board',  of: x => boardOf_(x) },
  { field: 'tier',      label: 'Tier',        of: x => x.tier },
  /* THE YEAR, THEN THE MONTH, THEN THE PAPER — like the folders they came from. */
  { field: 'examYear',  label: 'Year',        of: x => sittingOf_(x).year },
  { field: 'examMonth', label: 'Month',       of: x => sittingMonth_(x) },
  /* TWO TAGS ON EVERY QUESTION (388): the answer checked against the official scheme, and the type machine-marked -- asked before Paper (529). */
  { field: 'accuracy',  label: 'Accuracy',    of: x => verifyTags_(x).accuracy },
  { field: 'function',  label: 'Function',    of: x => verifyTags_(x).fn },
  /* THE ID DECIDES WHO ANSWERS and the document row's name is what is said, shortened against the names beside it. */
  { field: 'paperId',   label: 'Paper',       of: x => (x.row && x.row.paper_id) || '',
    showOf: id => paperLabel_(id), tagSay: id => paperTag_(id) },
  /* THE SECTION OF A PAPER SAT IN SECTIONS (770), a tag on its cards; after Paper it has one answer, so it is a detail, never a question. */
  { field: 'paperSection', label: 'Paper section',  of: x => { const r = paperSectionOf_(x && x.row); return r ? r.section + (r.topic ? ': ' + r.topic : '') : ''; } },
  /* WHICH QUESTION, WHICH PART, WHICH PAGE, HOW MANY MARKS: the words are the value, so the card and the button agree. */
  { field: 'qNumber',   label: 'Question',
    of: x => isQ_(x) && x.qNumber != null && String(x.qNumber) !== '' ? 'Q' + x.qNumber : '' },
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
  /* A WORKSHEET'S MAKER (O3): Publisher went, being the exam board twice or this. */
  { field: 'source',    label: 'Source',      of: x => sourceOf_(x) },
  { field: 'needs',     label: 'What you need', of: x => asList_(x.needs) },
  /* HOW YOU DID (463): the viewer's own latest press on a question; signed out it is blank everywhere, so it is never asked. */
  { field: 'myResult',  label: 'Your result', of: x => myResultOf_(x) },
];

/* THE ONLY KEYS A FACET MAY CARRY (396) — `check-funnel` fails on any other, so a behaviour flag cannot creep back in. */
const FACET_KEYS = ['field', 'label', 'of', 'tagOf', 'showOf', 'tagSay'];

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
  histLanguage: 'a manuscript\'s language is the one Language question every written thing answers (`wLanguage`, 546).',
  company: 'Publisher was the exam board said twice, or a worksheet maker; a maker is the Source now (O3).',
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
      if (!s) return Object.assign({}, f, { at: f.at || (i + 1) * 10 });
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
  const name = String((d && d.name) || id || '').trim(), sec = paperSectionOf_(d);
  /* A PAPER SAT IN SECTIONS IS ITS REAL NUMBER (770): "Paper 31: Statistics" was the owner's "paper thirty-something" — Paper 3, Section A. */
  return sec ? name.replace(/^Paper \d+\b/, 'Paper ' + sec.paper + ', ' + sec.section) : name;
};
/* A PAPER'S TAG IS ITS OWN NUMBER (1040 r12): the title "Paper 1 (Non-calculator) — June 2019" repeats the card's Non-calculator, June and 2019 tags. */
const paperTag_ = id => {
  const d = typeof docById_ === 'function' ? docById_(id) : null, sec = paperSectionOf_(d), n = String((d && d.paper) || '').trim();
  if (sec) return 'Paper ' + sec.paper + ', ' + sec.section;
  /* ITS OWN FIRST WORDS where it has them ("Component 1A", "Practice paper 1, Section A"), else its number; with neither, its other tags (a 5-a-day's level and day) name it. */
  const lead = /^(?:Practice paper|Paper|Component|Unit) \w+(?:, Section [A-F])?/i.exec(String((d && d.name) || '').trim());
  return lead ? lead[0] : n ? 'Paper ' + n : '';
};
/* WHICH SECTION OF ITS PAPER A DOCUMENT IS (770): § */
function paperSectionOf_(row) {
  const m = /-(\d)(\d)$/.exec(String((row && (row.paper_id || row.paperId)) || ''));
  if (!m || String(row.paper || '') !== m[1] || Number(m[2]) < 1 || Number(m[2]) > 6) return null;
  return { paper: m[1], section: 'Section ' + 'ABCDEF'[Number(m[2]) - 1], topic: String(row.section || '').trim() };
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
