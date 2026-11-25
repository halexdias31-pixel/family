
/* ---------- ONE VERSE, A CARD OF ITS OWN § */
function bibleVerseCard_(x) {
  const bb = x.bb, n = bb.n, k = bb.slot, d = BIBLE.books[k];
  const also = bb.dir && BIBLE.index ? (BIBLE.index.also || []).find(a => a.dir === bb.dir) : null;
  let body;
  if (d) {
    const w = bibleText_(x), he = bb.lang === 'he';
    /* ITS TRANSLATION IS ITS CREDIT, a later line (open-only), not a tag among the verse's lines. */
    body = (!w ? cardBlock_({ type: 'group', tag: 'p', look: 'fc-note', text: 'This text has no verse with this number.' })
        : he || bb.lang === 'grc' ? cardBlock_({ type: 'group', tag: 'p', look: 'bb-v bb-' + (he ? 'he' : 'grc'), attrs: { dir: he ? 'rtl' : null, lang: he ? 'he' : 'grc' }, text: w })
        : bibleV_(w))
      + cardBlock_({ type: 'group', tag: 'p', look: 'bb-credit', text: (also ? also.name || also.translation : bb.translation || 'King James Version (1611)') + ': public domain' })
      + writingRefs_('bible:' + bb.dir);
  }
  else if (BIBLE.missed[k] && !BIBLE.loading[k]) body = cardBlock_({ type: 'group', tag: 'p', look: 'fc-note bb-miss', text: bb.book + ' did not arrive.' });
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
  return readingCard_(x, { cls: 'bible bb-verse', cardData: { bb: 'v', bn: String(k) }, body: body });
}

/* ---------- THE TILES UNDER IT § */
/* DATA FOR `tile_`, not tiles: the list it draws, empty for anybody but an admin. */
function bibleOpts_(x) {
  if (!bibleFor_() || !x) return [];
  if (!x.bb) {
    if (BIBLE.index) return [{ icon: 'open', label: 'Open', note: BIBLE.index.translation, act: 'bible-go' }];
    return BIBLE.failed ? [{ icon: 'undo', label: text_('try-again'), note: 'the list of books', act: 'bible-retry' }] : [];
  }
  const bb = x.bb;
  return [BIBLE.missed[bb.slot] && !BIBLE.loading[bb.slot]
    ? { icon: 'undo', label: text_('try-again'), note: bb.book, act: 'bible-retry', data: { n: bb.slot } } : null,
  bibleHere_(x) ? null : { icon: 'book', label: 'Chapter', note: bibleCite_(bb, x.ch), act: 'bible-go', data: { key: x.key } }];
}
/* IN THIS VERSE'S CHAPTER ALREADY: its Book and Chapter answered and no Verse answer — the strip is
   the chapter, so the tile would land where you are. */
function bibleHere_(x) {
  const leaf = f => f && !f.any;
  const fs = STUFF.filters || [];
  if (chipsOn_(fs, 'wUnit').some(leaf)) return false;
  return chipsOn_(fs, 'wBook').some(f => leaf(f) && spellKey_(f.value) === spellKey_(x.bb.book))
      && chipsOn_(fs, 'wChapter').some(f => leaf(f) && String(f.value) === String(x.ch));
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
    const tiles = wrap ? cardRow_(x) : '';
    if (row) { if (tiles) row.outerHTML = tiles; else row.remove(); }
    else if (wrap && tiles) wrap.insertAdjacentHTML('afterend', tiles);
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) { oops_(e, 'find:bibleRedraw_') } }
  });
}

/* ---------- INTO THE BIBLE, FROM WHEREVER THE TAP WAS § */
/* INTO THE FINDER THE TAP WAS IN — a verse's Chapter or the cover's Open — and into Find from § */
on('bible-go', el => {
  if (!bibleFor_() || !BIBLE.index || !BIBLE.item) return;
  const k = el && el.getAttribute('data-key');
  const x = k ? bibleByKey_(k) : null;
  if (k && !x) return;
  const F = finderAt_(el);
  const text = x ? writingAt_(x, 'text') : writingText_(writingTextOf_(BIBLE.index.translation));
  const f = [{ field: 'shelf', value: WRITINGS_SHELF }, { field: 'wWork', value: 'Bible' }, { field: 'wLanguage', value: writingLanguageOf_(text) }]
    .concat(writingVersionOf_(text) ? [{ field: 'wText', value: writingVersionOf_(text) }] : []);
  /* ITS SOURCE TEXT TOO, asked before the Translation: a verse's is its Text's base for its testament (writingSourceOf_) */
  if (x) f.splice(2, 0, { field: 'wSource', value: writingAt_(x, 'source') });
  if (x) f.push({ field: 'wBook', value: x.bb.book }, { field: 'wChapter', value: x.ch });
  inFinder_(F, () => {
    finderSet_(F, { filters: f, show: !!x });
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
    /* LOOKED UP, NOT COUNTED (1100): a chip path the build walked names its next question; only past it is the list tallied. */
    const looked = finderTagsNext_(out);
    if (looked && !(looked.n > 1)) break;
    const facet = looked ? looked.facet : (() => { const items = stuffFiltered(); return items.length <= 1 ? null : nextFacet(items); })();
    if (!facet) break;
    /* A FACET READ OFF PAGES (`tagOf`) TAKES THE CARD'S OWN TAG, the one `stuffPages_` keeps it by, not the first of its values. */
    const own = (() => { try { const t = facet.tagOf ? asList_(facet.tagOf(x, null)) : []; return t.length ? t : facetOwn_(facet, x); } catch (e) { return []; } })();
    out.push(own.length ? { field: facet.field, value: String(own[0]) } : { field: facet.field, any: true });
    /* A LOOKED-UP ANSWER IS ONE OF THE BUILD'S, so the item is still in the list; a counted one is checked against it. */
    if (looked) { if (own.length && !looked.has(own[0])) { out.pop(); break; } continue; }
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
    /* EMPTIED FIRST: the walk asks `stuffFiltered`, which reads the chips. */
    finderSet_(F, { paint: false });
    finderSet_(F, { filters: finderWalk_(x), show: true });
    if (AT !== F.id) go(F.id);
    const pages = stuffPages_();
    let i = pages.findIndex(pg => pg.x === x && (pg.part || null) === (part || null));
    /* A PART THE ITEM NO LONGER HAS -- a figure page kept before figures moved into their cards (356) --
       OPENS ON THE ITEM'S CARD, not on the first page of the list. */
    if (i < 0) i = pages.findIndex(pg => pg.x === x && !pg.part);
    if (i < 0) { i = pages.findIndex(pg => pageHas_(pg, x)); if (i >= 0 && pages[i].x !== x) Q_SCROLL_TO = x.key || ''; }
    goPage(F.id, i >= 0 ? stuffFirstResult_() + i : stuffQuestionPage_());
  });
}
/* WHICH OF A THING'S PAGES A KEPT LIST DRAWS: § */
const keptPart_ = p => !p || p === 'q' || p === 'fig' || p === 'ans' || /^(stem\d+(-\d+)?|pre\d+|facts\d+)$/.test(p);
/* SET WHILE A KEPT LIST IS BEING DRAWN (`keptPages_`, for Saved and the Spotlight), in the way `SPOT_TILES` is: § */
let KEPT_DRAW = false;
/* THE TILE: under a kept card that is not whole on the column, `Open · in Find` — one finder, so its name is fixed. */
function finderOpenOpts_(x) {
  if (!KEPT_DRAW || !x || !x.key || isBible_(x)) return null;
  let parts;
  try { parts = pageParts_(x); } catch (e) { return null; }
  if (parts.every(keptPart_)) return null;
  /* A MAGNIFIER, NOT THE LEAVE-THE-SITE ARROW (489): it opens the card in Find, not "a new place". */
  return { icon: 'search', label: 'Open', note: 'in Find', act: 'find-open', data: { key: x.key } };
}
on('find-open', el => {
  const k = el && el.getAttribute('data-key');
  const x = k ? stuffItemsAll_().find(i => i && i.key === k) : null;
  if (x) finderOpen_(x, null, finderAt_(el));
});

/* THE ONE EMPTY ANSWER, for the question page and a results page alike — they were two copies of the
   same three sentences. */
/* AS BLOCKS for the menu card; nothing loaded at all is the column's own answer (`nothingHere`), drawn as its embed. */
function stuffNoneBlocks_() {
  if (!FIND_MEMO.total) return [{ type: 'embed', tool: 'nothing-here', args: { empty: FINDER.empty } }];
  return [{ type: 'text', look: 'empty', text: STUFF.filters.length ? 'Nothing matches all of those together.' : 'Nothing matches.' }];
}
CARD_EMBEDS['nothing-here'] = a => nothingHere(a.empty, true);
function stuffNoneHtml_() { return cardBlocks_(stuffNoneBlocks_()); }

/* ---------- WHICH PAGES A PRACTICAL TAKES, OFF WHAT THE ROW ACTUALLY HAS § */
function pageParts_(x, prev) {
  /* ONE PAGE PER QUESTION NUMBER (960): its first part stands for the card, the rest are in it (`questionWhole_`). */
  if (isQ_(x)) return qId_(x) && prev && qId_(prev) === qId_(x) ? [] : ['q'];
  /* A PROJECT IS ITS CARD, ITS MATERIALS, ITS STEPS AND "SHARE IT" — the share page always, since
     every project ends in something to send. */
  if (x && isProject_(x) && x.row) {
    const out = [null];
    if (x.row.materials && x.row.materials.length) out.push('kit');
    if (x.row.steps && x.row.steps.length) out.push('steps');
    out.push('share');
    return out;
  }
  /* A TOPIC CARD IS ONE CARD (rule 1.80): its three slots are its body (contentBody_), no pages after it. */
  if (x && isContent_(x) && x.row) return [null];
  /* THE BIBLE HAS NO BRANCH HERE ANY MORE. § */
  if (histLinesOf_(x)) return [null].concat(histPages_(x));
  if (!x || !isPractical_(x) || !x.row || x.row.excluded) return [null];
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

function stuffPart_(x, part) {
  if (libSlim_(x)) { libWant_(x); return libWaitHtml_(x); }
  if (x && isProject_(x)) return projectPart_(x, part);
  if (x && isContent_(x)) return contentPart_(x, part);
  if (x && x.hdb && /^facts\d+$/.test(String(part))) return histFactsPart_(x, part);
  /* A PART THE QUESTION NO LONGER HAS (a stem, a page or an answer kept in a place from before 960) IS ITS CARD. */
  if (isQ_(x)) return part === 'q' ? questionWhole_(x, (questionParts_()[qId_(x)] || [x]), null, true) : stuffCard(x);
  return practicalPart_(x, part);
}

/* A PART IS A CARD LIKE ANY OTHER (owner, 12 Nov: one template): a practical's, a lesson's or a history page's own markup, cut into the parts by card_. */
function partCard_(x, part) {
  const h = stuffPart_(x, part);
  return isQ_(x) || /^\s*<div class=.card\b/.test(h) ? h : card_(h, 'part');
}






/* AN ADDRESS THAT ALREADY FAILED ON THIS PHONE IS NOT ASKED FOR AGAIN. § */
const BOXER_PIC_DEAD = new Set();



/* `data-src` IS THE ADDRESS THE CREDIT IS FOR, so a picture that fails takes its own credit away
   and leaves another's — the fight card has two (`boxerPicFail_`). */

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

/* ---------- ONE PEOPLE KIND (batch D): every person, boxer or figure, is a pixel portrait under their tags, and nothing else ---------- */
/* The portraits are rows of data/portraits.json, written by tools/people_pix.py: 16 strings of palette letters, '.' empty. */
let PIX_BY = null, PIX_FROM = null;
function personPix_(id, name) {
  const all = (typeof DATA !== 'undefined' && DATA && DATA.portraits) || [];
  if (PIX_FROM !== all) { PIX_BY = new Map(); all.forEach(r => { if (r && r.id) PIX_BY.set(String(r.id), r); }); PIX_FROM = all; }
  return PIX_BY.get(String(id || '')) || PIX_BY.get('name:' + String(name || '')) || null;
}
/* A PORTRAIT NOT YET ARRIVED (or never written) is a plain grey bust, the same shape, so the card never jumps. */
const PIX_NONE = ['', '', '......ssss', '.....ssssss', '.....ssssss', '.....ssssss', '.....sssssss', '.....ssssss', '.....ssssss',
  '......ssss', '.......ss', '...ssssssssss', '..ssssssssssss', '.ssssssssssssss', '.ssssssssssssss', '.ssssssssssssss'];
const personYear_ = v => { const m = /^-?\d{1,4}/.exec(String(v == null ? '' : v).trim()); return m ? Number(m[0]) : 0; };
function personYears_(x) {
  if (!isPerson_(x) || !(x.born || x.died)) return '';
  const y = n => (n < 0 ? -n + ' BC' : n ? String(n) : '?');
  return x.died ? y(x.born) + '–' + y(x.died) : 'Born ' + y(x.born);
}
/* A COLUMN VECTOR AS TYPED ON THE KEYPAD (`⟮5,-4⟯`, 385) DRAWN TOP OVER BOTTOM in one pair of brackets -- the box, the card, Saved */
function vecHtml_(html) {
  return String(html == null ? '' : html).replace(/\u27ee([^\u27ee\u27ef,]*),([^\u27ee\u27ef]*)\u27ef/g,
    (m, a, b) => cardBlock_({ type: 'group', tag: 'span', look: 'vec', blocks: [{ type: 'group', tag: 'span', look: 'vec-a', inner: a }, { type: 'group', tag: 'span', look: 'vec-b', inner: b }] }));
}
window.CARD_EXTRAS_MORE = Object.assign(window.CARD_EXTRAS_MORE || {}, { bible: bibleOpts_, insert: insertExtras_, spec: specExtras_, manuscript: histExtras_, writing: histExtras_, event: histExtras_ });
/* A BOXER'S OR FIGURE'S PIXEL PORTRAIT AS A FIELD OF THE ONE CARD SHAPE (card-fields.json). */
/* A PERSON IN THE LIBRARY (a boxer, a figure): their 8-bit portrait, their name and facets (master template). */
const personPicSpec_ = (id, name, flip) => { const r = personPix_(id, name); return { pix: r && Array.isArray(r.px) ? r.px : PIX_NONE, alt: name, flip, none: !r }; };
/* Their card is their item map (ITEM_MAPS.figure and .boxer, cards-parts.js), drawn as kind `people`. */
