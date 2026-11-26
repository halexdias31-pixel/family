
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

  /* ONE PAGE IS ONE ENTRY OF `stuffPages_`, which is the results with each practical expanded into its four parts. § */
  const pg = stuffPages_()[n];
  if (!pg) return '';
  /* COUNTED BEFORE ITS WORDS CAME (397): waiting, whether or not they have come since — the column is drawn again for them. */
  if (pg.slim) return rowsOne_(libWaitHtml_(pg.x) + findTopRow_());
  /* ONE TILE ROW PER THING (489, 495): a card's own row holds `Top` (950); a part page without one gets this one. */
  const html = pg.part === 'q' && pg.parts ? questionWhole_(pg.x, pg.parts, pg.open, pg.ans, pg.only)
    : pg.part ? partCard_(pg.x, pg.part) : stuffCard(pg.x, credits);
  /* NO TOP ON A QUESTION (owner, 22 Nov, queue step 5): qengine.json `cut` drops its card's Top, and the page adds none back. */
  return rowsOne_(html + (pg.part === 'q' || /data-do="find-top"/.test(html) ? '' : findTopRow_()));
}
/* BACK TO TOP (463): "a button to scroll back to the top of the finder"; on a kept card outside one, its column scrolls up. */
const findTopRow_ = () => cardBlock_({ type: 'tiles', look: 'find-top', tiles: [{ icon: 'up', label: 'Back to top', note: 'the first page of this finder', act: 'find-top' }] });
on('find-top', el => { const F = finderAt_(el), p = el.closest('.pane'); if (F) inFinder_(F, () => goPage(F.id, stuffQuestionPage_())); else if (p) p.scrollTop = 0; });

/* One card. Lifted out of the list so the pager and anything else can build one without rebuilding
   all four hundred around it. */
/* THE CARD FOR A THING, whatever kind it is. § */
/* FAVOURITES. ONE STAR FOR EVERY KIND, and that is only possible because every item in this list already carries a `key` — a tutor is `t.title`, a widget is § */
let FAVS = (() => {
  try { return new Set(JSON.parse(keep_.get('favs') || '[]')); }
  catch (e) { return new Set(); }
})();

/* AND WHAT THE SHEET SAYS, once a payload has arrived. § */
function adoptFavourites_() {
  if (!DATA || !DATA.favourites) return;
  FAVS = new Set(DATA.favourites.map(String));
  keep_.put('favs', JSON.stringify([...FAVS])); if (typeof finderForgetFound_ === 'function') finderForgetFound_();
}

const isFav = k => FAVS.has(String(k));

function toggleFav(k, kind) {
  const key = String(k);
  if (FAVS.has(key)) FAVS.delete(key); else FAVS.add(key);
  keep_.put('favs', JSON.stringify([...FAVS])); if (typeof finderForgetFound_ === 'function') finderForgetFound_();
  /* SAVED QUIETLY. A star is not worth a toast or a spinner — and if the save fails the star is
     still right on this device, which is the part that matters in the moment. */
  if (USER) {
    /* THE STAR HAS ALREADY MOVED and a refusal puts it back, so its save does not hold the tile (534). */
    if (typeof pressFree_ === 'function') pressFree_();
    /* ---------- `saveProfile` DOES NOT EXIST, AND NEVER HAS § */
    /* THE KEY IS NOT SPLITTABLE, so it is not split. § */
    /* ---------- AND IT WAS STILL CALLING `send` WITH TWO ARGUMENTS § */
    send({
      action: 'item', door: 'save', item: 'favourite',
      name: USER.name, personId: (USER && USER.personId) || '',
      kind: kind || 'item', itemId: key,
      on: FAVS.has(key) ? 'TRUE' : '',
    }).catch(err => {
      /* PUT THE STAR BACK. `.catch(() => {})` was the other half of the disguise: § */
      if (FAVS.has(key)) FAVS.delete(key); else FAVS.add(key);
      keep_.put('favs', JSON.stringify([...FAVS])); if (typeof finderForgetFound_ === 'function') finderForgetFound_();
      if (typeof repaint === 'function') { try { repaint(); } catch (e) { oops_(e, 'find:toggleFav') } }
      toast(why_(err));
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
  tileSet_(el, { label: on ? text_('saved') : text_('save'), on: on });

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

/* THE TAGS ARE THE TITLE (499): "the tags are titles" — a card's name heading goes when every word of it is a tag on
   the row; the name stays its accessible name. One rule for every kind. */
const TITLE_WORDS_ = t => String(t).replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').toLowerCase().split(/[^a-z0-9\u00c0-\uffff]+/).filter(Boolean);
function tagsAreTitle_(x, html) {
  if (!x || !x.name || typeof html !== 'string') return html;
  const h = /<h3>([\s\S]*?)<\/h3>/.exec(html);
  const named = out => (/^\s*<div class="[^"]*\bcard\b[^"]*"[^>]*\baria-label=/.test(out) ? out
    : out.replace(/(<div class="[^"]*\bcard\b[^"]*")/, (m, open) => open + ' role="group" aria-label="' + esc(x.name) + '"'));
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
  /* A kind with no card of its own falls back to the shared one, so a new row type shows as SOMETHING. */
  /* A SECONDARY KIND'S CARD (860) is guarded: its throw is a card saying so, never the Find column. */
  const card = kindOf_(x).card || thingCard_;
  const html = tagsAreTitle_(x, tagsOnTop_(x, tierCore_('kind', x.kind) ? card(x, credits) : tierRun_('card:' + x.kind, card, null, [x, credits], oopsHtml_)));
  const shown = html;
  if (!x.key) return shown;
  /* A ONE-MAKER CARD CARRIES ITS OWN FOUR BUTTONS (`kcFour_`); only a widget kind still gets the row under it. */
  return cardBlock_({ type: 'group', look: 'favwrap' + (isFav(x.key) ? ' is-fav' : ''), attrs: { 'data-state': 'fav' }, inner: shown }) + (/\bkc-four\b/.test(shown) ? '' : cardRow_(x));
}

/* LONG CARD TEXT IS CUT TO TWO LINES (owner 8 Nov, 29a); a tap on it shows the rest, a second tap cuts it again. */
on('cut-open', el => { if (el && el.classList) el.classList.toggle('is-open'); });
/* WHAT A CHIP READS: the words its button said, in the menu it was picked from (the chips before it), else `answerSay_`. */
/* The whole library's words can name a shared value by another work's chapter (Hebrew titles on Great Expectations, 1040 r10). */
function chipShow_(f, i) {
  const facet = facetBy(f.field), was = STUFF.filters;
  if (!facet) return f.value;
  /* ONE PRESS, SEVERAL FILTERS (an answer's `also`): each is said as the answer was, counted before the first of them. */
  if (i != null && Array.isArray(was)) while (i > 0 && was[i - 1] && was[i - 1].field === f.field && !was[i - 1].any) i--;
  const built = i != null && Array.isArray(was) ? chipShowBuilt_(was.slice(0, i), f) : null;
  if (built != null) return built;
  if (i != null && Array.isArray(was)) try { STUFF.filters = was.slice(0, i);
    const w = (facetTally_(stuffFiltered(), facet).values || []).find(v => [v.value].concat(v.also || []).some(u => spellKey_(u) === spellKey_(f.value)));
    if (w) return w.show || w.text || w.value; } catch (e) { oops_(e, 'find:chipShow_') } finally { STUFF.filters = was; }
  return answerSay_(facet, f.value);
}

/* ---------- ONE COLOUR PER MENU (1030): every answer of a facet, its chip and its card words wear the facet's --hue-N. § */
/* WRITTEN BY tools/facet-hues.js from the funnel's facet graph: two facets asked on one path never share a number. */
const TAG_OF = {kindLabel: 0, toolName: 1, kindOwn: 1, profileType: 1, settingFor: 2, venueArea: 8, venueFor: 9, venueSize: 2, partnerStatus: 6, foodMeal: 2, foodShop: 0, taskList: 6, taskRepeat: 7, taskDone: 5, subject: 2, shelf: 3, wReligion: 9, histKind: 5, wCollection: 8, histPart: 11, wWork: 7, wSection: 1, wSource: 11, wLanguage: 6, wForm: 11, wAuthor: 10, wText: 3, wBook: 11, wChapter: 3, wUnit: 4, wPrimacy: 0, mScope: 10, mMake: 7, mModel: 7, mGen: 5, mEngine: 5, mSystem: 8, pcType: 10, pcSocket: 9, pcIface: 7, pcLinks: 8, mPhase: 8, mMarket: 6, mYears: 1, mSize: 11, mValves: 0, mBadge: 2, mFuel: 4, mPart: 6, mPrice: 9, cCategory: 5, cGroup: 9, cPeriod: 10, cState: 6, fighter: 8, decade: 5, division: 6, boutRound: 4, boutMethod: 10, boutWinner: 2, boutEvent: 0, histEra: 3, histMaterial: 3, histFormat: 11, histRole: 4, personName: 7, personYears: 0, personFrom: 11, histRepository: 4, histSide: 0, histFound: 2, histDated: 1, histTheatre: 6, required: 9, level: 4, documentType: 3, keystage: 11, yearGroup: 3, bandValue: 0, topic: 7, examBoard: 9, specTopic: 7, specPoint: 10, tier: 10, examYear: 10, examMonth: 1, examDay: 0, paperId: 5, paperSection: 8, qNumber: 8, qPart: 9, qSub: 1, marks: 1, needCalc: 4, needs: 5, myTried: 3, myResult: 2, source: 4};
/* A FACET THE WALK NEVER MET (one the facets tab invented) still has a colour: the first. */
const tagOf_ = field => 'h' + (TAG_OF[field] || 0);
const tagAttr_ = field => ` data-tag="${tagOf_(field)}"`;

/* ---------- WHAT A CHOSEN CHIP SAYS: THE VALUE, AND ONLY WHERE THE VALUE IS NOT ENOUGH, MORE § */
function chipText_(f, i) {
  /* A CHIP ALWAYS HAS A NAME (queue item 9, 24 Nov): a facet no longer asked is named off the facets tab's phrasebook word, never its field; an empty value says the question. */
  const row = (ITEM_KINDS.facets || []).find(r => r.field === f.field) || {};
  const key = String((facetBy(f.field) || {}).label || (row.label ? text_(row.label) : '') || text_('doesnt-matter'));
  if (f.any) return 'Any ' + key.toLowerCase();
  const show = String(chipShow_(f, i)).trim();
  return !show || show === '*' ? key : /^\d{1,3}$/.test(show) ? key + ' ' + show : show;
}

/* THE CHIPS YOU HAVE CHOSEN, drawn with the list because this row grows and shrinks. Clear is not
   one of them — see `filterClear_`. */
/* 680: THE ROW NEVER SAYS THE SAME THING TWICE — a second chip with the same words is left out (its filter stays). */
/* THE MENU CARD'S TAGS (owner, 14 Nov: one template): sign-in's, the answers chosen, Booking's steps, each a chip with its ✕. */
function filterChipTags_() {
  const said = {};
  return signChips_().concat(STUFF.filters.map((f, i) => {
    const show = chipText_(f, i), key = spellKey_(show);
    if (said[key]) return null;
    said[key] = 1;
    /* TAP THE CHIP ANYWHERE TO TAKE IT OFF (owner, 9 Nov): the whole chip is the button, the ✕ only shows it; a skip is a chip like any other. */
    return { base: 'chip', look: 'sm', text: show, act: 'filter-drop', data: { i: i }, label: 'Remove ' + show, x: { label: 'Remove ' + show },
      colour: f.any ? false : tagOf_(f.field) };
  }).filter(Boolean), bookChips_());
}

/* NO CLEAR-ALL BIN (owner, 16 Nov: it broke the card template): each tag's × clears it; `filter-clear` stays for code that starts again. */
function filterClear_() { return ''; }

/* `on('noop')` was here: a handler that did nothing, for markup that wanted to swallow a tap.
   Nothing carries `data-do="noop"`, so it swallowed nothing. */
/* ANSWERING THE QUESTION ON THE PAGE. One tap: it becomes a chip, and the next question — if
   there is one worth asking — takes its place. */

/* EACH ON THE FINDER IT WAS PRESSED IN (`finderAt_`): an answer in the second finder is a chip there,
   and never one on Find. */
/* EACH ANSWER IS A STEP (owner, 22 Nov, ONE WAY TO OPEN): the model every other opener now follows. Back takes exactly this answer off again. */
function findStep_(el, make) {
  const F = finderAt_(el);
  let added = [];
  const id = openStep_({ draw: () => inFinder_(F, () => {
    writingFreeze_();
    added = make();
    STUFF.filters.push(...added);
    paintStuffSoon_();
  }), undo: () => inFinder_(F, () => {
    STUFF.filters = STUFF.filters.filter(g => added.indexOf(g) === -1);
    paintStuffSoon_();
  }) });
  added.forEach(f => { Object.defineProperty(f, 'step', { value: id, writable: true, configurable: true }); });
}
on('facet-pick', el => findStep_(el, () => {
  /* ONE ANSWER, SEVERAL VALUES (`tellApart_`'s `also`): each is a filter, so the field reads "either", and the row says it once. */
  let also = [];
  try { also = el.dataset.also ? JSON.parse(el.dataset.also) : []; } catch (e) { also = []; }
  return [el.dataset.value].concat(also).map(v => ({ field: el.dataset.field, value: v }));
  /* A BOOK OF THE BIBLE CHOSEN WAS FETCHED HERE TOO (docs/history/341), and the review of 12 Oct found nothing could tell: § */
}));
/* ---------- AND NOT ANSWERING IT IS ALSO AN ANSWER ----------------------------------------------
   Same step, same repaint, no value. See the `any` note in `stuffFind` for what that entry does and
   does not do. */
on('facet-skip', el => findStep_(el, () => [{ field: el.dataset.field, any: true }]));
/* A CHIP SAID ONCE FOR SEVERAL FILTERS (`filterChips`) takes all of them off. */
on('filter-drop', el => inFinder_(finderAt_(el), () => {
  const i = Number(el.dataset.i), f = STUFF.filters[i];
  const say = f && !f.any ? spellKey_(chipText_(f, i)) : null;
  const keep = STUFF.filters.filter((g, j) => j !== i && !(say && g.field === f.field && !g.any && spellKey_(chipText_(g, j)) === say));
  /* A CHIP TAKEN OFF ENDS ITS STEP (one closed under others is passed over by Back). */
  STUFF.filters.filter(g => keep.indexOf(g) === -1 && g.step).forEach(g => { if (keep.every(k => k.step !== g.step)) stepDone_(g.step, false); });
  STUFF.filters = keep;
  paintStuffSoon_();
}));
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
      cardBlock_({ type: 'group', tag: 'section', look: 'page is-res', blocks: [{ type: 'group', look: 'pane' }] }).repeat(size - res.length));
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
  if (d) window.scrollBy(0, -d);
}

/* EVERY LIBRARY INDEX `paintStuff` asks for, one call each. */
function stuffIndexesAsk_() {
  if (USER || !ruleOn_('finder-members') || guestLibrary_()) {
  if (typeof window.talmudIndex_ === 'function') window.talmudIndex_();
  if (typeof window.quranIndex_ === 'function') window.quranIndex_();
  if (typeof window.hadithIndex_ === 'function') window.hadithIndex_();
  if (typeof window.worksIndex_ === 'function') window.worksIndex_();
  if (typeof textsIndex_ === 'function') textsIndex_();
  if (typeof pdtextsIndex_ === 'function') pdtextsIndex_();
  if (typeof window.orthoIndex_ === 'function') window.orthoIndex_();
  if (typeof window.hymnsIndex_ === 'function') window.hymnsIndex_();
  if (typeof mechIndex_ === 'function') mechIndex_();
  if (typeof chemIndex_ === 'function') chemIndex_();
  if (typeof histTopicsIndex_ === 'function') histTopicsIndex_(); }
}

function paintStuff(keepPage) {
  /* EVERY LIBRARY INDEX IS ASKED FOR WHEN A FINDER IS PAINTED (473, 490), never by a widget drawing ahead; signed out only the library's, as Find answers Settings, Booking and the library (C+, 503; owner 15 Nov). */
  stuffIndexesAsk_();
  /* WORDS THAT CAME SINCE THE PAGES WERE COUNTED change how many pages a card is (397) — counted again as the pages are rebuilt. */
  libPagesFresh_();
  /* THE BIN, in its own slot above the chips — see `filterClear_`. */
  const clear = $(FINDER.id + '-clear');
  if (clear) clear.innerHTML = filterClear_();
  /* THE MENU CARD'S SLOTS, from its spec (`findMenuFill_`). */
  const groups = findMenuFill_(FINDER);
  try { frontWarm_(); } catch (e) { /* only ever a head start */ }
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
    if (el !== first && !el.classList.contains('is-res') && !el.classList.contains('is-lead')) el.remove();
  });

  /* ---------- ONE INSERT, IN THE ORDER `screen('stuff')` BUILDS § */
  /* ---------- SAVED IS A COLUMN AGAIN, SO IT IS NOT A PAGE HERE § */
  const lead = frontPages_()
    .map(c => cardBlock_({ type: 'group', tag: 'section', look: 'page', blocks: [{ type: 'group', look: 'pane', inner: c }] })).join('');
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
        cardLeft: r ? +r.left.toFixed(0) : dash_(),
        cardWidth: r ? +r.width.toFixed(0) : dash_(),
        widthPct: r ? +(100 * r.width / innerWidth).toFixed(1) : dash_(),
        onScreen: r ? +(Math.max(0, Math.min(innerWidth, r.right) - Math.max(0, r.left))).toFixed(0) : dash_(),
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

/* ---------- THE THREE UNDER YOUR THUMB NOW, THE OTHER EIGHT A FRAME LATER § */
let STUFF_LATE = 0;
const STUFF_SOON = 1;

/* ---------- A CARD TALLER THAN THE PANE, WHICH USED TO BE RARE § */
const PANE_REACH = 24;
