
/* ---------- ONE VERSE, A CARD OF ITS OWN § */
function bibleVerseCard_(x) {
  const bb = x.bb, n = bb.n, k = bb.slot, d = BIBLE.books[k];
  const also = bb.dir && BIBLE.index ? (BIBLE.index.also || []).find(a => a.dir === bb.dir) : null;
  let body;
  if (d) {
    const w = bibleText_(x), he = bb.lang === 'he';
    /* ITS TRANSLATION IS ITS CREDIT, a later line (open-only), not a tag among the verse's lines. */
    body = (!w ? '<p class="fc-note">This text has no verse with this number.</p>'
        : he || bb.lang === 'grc' ? `<p class="bb-v bb-${he ? 'he' : 'grc'}"${he ? ' dir="rtl"' : ''} lang="${he ? 'he' : 'grc'}">${esc(w)}</p>`
        : bibleV_(w))
      + '<p class="bb-credit">' + (also ? esc(also.name || also.translation) : esc(bb.translation || 'King James Version (1611)')) + ': public domain</p>'
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
  return readingCard_(x, { cls: 'bible bb-verse', cardData: { bb: 'v', bn: String(k) }, body: body });
}

/* ---------- THE TILES UNDER IT § */
/* DATA FOR `tile_`, not tiles: the list it draws, empty for anybody but an admin. */
function bibleOpts_(x) {
  if (!bibleFor_() || !x) return [];
  if (!x.bb) {
    if (BIBLE.index) return [{ icon: 'open', label: 'Open', note: BIBLE.index.translation, act: 'bible-go' }];
    return BIBLE.failed ? [{ icon: 'undo', label: 'Try again', note: 'the list of books', act: 'bible-retry' }] : [];
  }
  const bb = x.bb;
  return [BIBLE.missed[bb.slot] && !BIBLE.loading[bb.slot]
    ? { icon: 'undo', label: 'Try again', note: bb.book, act: 'bible-retry', data: { n: bb.slot } } : null,
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
function stuffNoneHtml_() {
  if (!FIND_MEMO.total) return nothingHere(FINDER.empty, true);
  const why = STUFF.filters.length ? 'Nothing matches all of those together.' : '';
  return empty_(why ? 'Nothing matches. ' + why : 'Nothing matches.');
}

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
  /* A CONTENT CARD IS ITSELF, then its Formulas and its Worked examples (408):
     one titled page per thing, and a page only where the row has the thing. */
  if (x && isContent_(x) && x.row) {
    const c = x.row;
    return [null].concat(c.diagram ? ['fig'] : [], (c.formulas || []).length ? ['formulas'] : [], (c.points || []).length ? ['worked'] : []);
  }
  /* THE BIBLE HAS NO BRANCH HERE ANY MORE. § */
  if (x && x.hdb && x.row && HIST_LINES[x.kind]) return [null].concat(histPages_(x));
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
  const key = sortKey_;
  (items || []).forEach(x => { const k = qId_(x); if (k) (by[k] = by[k] || []).push(x); });
  (items || []).forEach(x => {
    const k = qId_(x);
    if (!k) { seq.push(x); return; }
    if (done[k]) return;
    done[k] = true;
    by[k].slice().sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)).forEach(p => seq.push(p));
  });
  /* `KEPT_DRAW` FOR THE DRAW, so a card that is not whole here is given its way to Find — see
     `finderOpenOpts_`. In a `finally`, so a throw cannot leave Find's own cards carrying it. */
  const was = KEPT_DRAW;
  KEPT_DRAW = true;
  try { return [].concat(...seq.map((x, i) => cardPages_(x, credits, seq[i - 1]))); }
  finally { KEPT_DRAW = was; }
}
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

/* TWO LETTERS FOR THE PLACEHOLDER: § */
const BOXER_PARTICLE = /^(de|la|del|della|van|von|da|di|du|le|der|den|dos|das)$/i;
function boxerInitials_(name) {
  const words = String(name || '').split(/\s+/).filter(s => s && !/^(jr|sr|ii|iii|iv)\.?$/i.test(s));
  const at = words.findIndex((s, i) => i > 0 && BOXER_PARTICLE.test(s));
  const w = (at > 0 ? words.slice(0, 1).concat(words[at]) : words)
    .map(s => (s.match(/[A-Za-zÀ-ÿ]/) || [''])[0]).filter(Boolean);
  return (w.length > 1 ? w[0] + w[w.length - 1] : (w[0] || '?')).toUpperCase();
}
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
/* `flip` TURNS THE FACE LEFT: a fight's second corner faces the first. */
function personPic_(id, name, flip) {
  const r = personPix_(id, name);
  return pixSvg_(r && Array.isArray(r.px) ? r.px : PIX_NONE, name, flip, r ? '' : ' is-none');
}
/* ONE 8-BIT DRAWER (batch E): portraits, cars, car parts and PC parts are all 16 rows of palette letters (`.pp-<letter>`). */
function pixSvg_(rows, name, flip, cls) {
  const byC = {};
  (rows || []).forEach((line, y) => {
    for (let x = 0; x < line.length;) {
      const c = line[x];
      let w = 1;
      while (line[x + w] === c) w++;
      if (c !== '.') (byC[c] = byC[c] || []).push(`M${x} ${y}h${w}v1h-${w}z`);
      x += w;
    }
  });
  const paths = Object.keys(byC).map(c => `<path class="pp-${c}" d="${byC[c].join('')}"/>`).join('');
  return `<svg class="pp${cls || ''}" viewBox="0 0 16 16" shape-rendering="crispEdges" role="img" aria-label="${esc(name || '')}">${
    flip ? `<g transform="translate(16 0) scale(-1 1)">${paths}</g>` : paths}</svg>`;
}

/* A COLUMN VECTOR AS TYPED ON THE KEYPAD (`⟮5,-4⟯`, 385) DRAWN TOP OVER BOTTOM in one pair of brackets -- the box, the card, Saved */
function vecHtml_(html) {
  return String(html == null ? '' : html).replace(/\u27ee([^\u27ee\u27ef,]*),([^\u27ee\u27ef]*)\u27ef/g,
    '<span class="vec"><span class="vec-a">$1</span><span class="vec-b">$2</span></span>');
}
window.CARD_EXTRAS_MORE = Object.assign(window.CARD_EXTRAS_MORE || {}, { bible: bibleOpts_, insert: insertExtras_, manuscript: histExtras_, writing: histExtras_, event: histExtras_ });
/* A BOXER'S OR FIGURE'S PIXEL PORTRAIT AS A FIELD OF THE ONE CARD SHAPE (card-fields.json). */
window.KC_FIELDS_MORE = Object.assign(window.KC_FIELDS_MORE || {}, { boxerPic: x => `<figure class="person-pic">${personPic_(x.pixId, x.name)}</figure>` });
