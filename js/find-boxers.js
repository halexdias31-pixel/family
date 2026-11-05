
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
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) { oops_(e, 'find:bibleRedraw_') } }
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
  const text = x ? writingAt_(x, 'text') : writingText_(writingTextOf_(BIBLE.index.translation));
  const f = [{ field: 'shelf', value: WRITINGS_SHELF }, { field: 'wWork', value: 'Bible' }, { field: 'wLanguage', value: writingLanguageOf_(text) }]
    .concat(writingVersionOf_(text) ? [{ field: 'wText', value: writingVersionOf_(text) }] : []);
  /* ITS SOURCE TEXT TOO, asked before the Translation: a verse's is its Text's base for its testament (writingSourceOf_) */
  if (x) f.splice(2, 0, { field: 'wSource', value: writingAt_(x, 'source') });
  if (x) f.push({ field: 'wBook', value: x.bb.book }, { field: 'wChapter', value: x.ch });
  inFinder_(F, () => {
    finderSet_(F, { filters: f });
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
    /* THE WORDS GO FIRST: the walk asks `stuffFiltered`, which reads them. */
    finderSet_(F, { paint: false });
    finderSet_(F, { filters: finderWalk_(x) });
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
/* THE TILE: under a kept card that is not whole on the column, `Open · in Find` — the column's name from `TABS`, so a renamed column says so. § */
function finderOpenOpts_(x) {
  if (!KEPT_DRAW || !x || !x.key || x.kind === 'bible') return null;
  let parts;
  try { parts = pageParts_(x); } catch (e) { return null; }
  if (parts.every(keptPart_)) return null;
  const t = (typeof TABS !== 'undefined' ? TABS : []).find(r => r.id === 'stuff');
  /* A MAGNIFIER, NOT THE LEAVE-THE-SITE ARROW (489): it opens the card in Find, not "a new place". */
  return { icon: 'search', label: 'Open', note: 'in ' + (t ? t.label : 'Find'), act: 'find-open', data: { key: x.key } };
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
  const why = STUFF.q && STUFF.filters.length ? 'Try fewer words, or take a filter off.'
            : STUFF.q                          ? 'Try fewer words.'
            : STUFF.filters.length             ? 'Nothing matches all of those together.'
            : '';
  return `<p class="empty">Nothing matches.${why ? `<br><span class="faint">${esc(why)}</span>` : ''}</p>`;
}

/* ---------- WHICH PAGES A PRACTICAL TAKES, OFF WHAT THE ROW ACTUALLY HAS § */
/* A QUESTION'S PART, one test for the page model (960). */
const isQ_ = x => !!x && x.kind === 'question';
function pageParts_(x, prev) {
  /* ONE PAGE PER QUESTION NUMBER (960): its first part stands for the card, the rest are in it (`questionWhole_`). */
  if (isQ_(x)) return qId_(x) && prev && qId_(prev) === qId_(x) ? [] : ['q'];
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
  if (x && x.hdb && x.row && HIST_LINES[x.kind]) return [null].concat(histPages_(x));
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
     `finderOpenOpts_`. In a `finally`, so a throw cannot leave Find's own cards carrying it. */
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
  if (x && x.hdb && /^facts\d+$/.test(String(part))) return histFactsPart_(x, part);
  /* A PART THE QUESTION NO LONGER HAS (a stem, a page or an answer kept in a place from before 960) IS ITS CARD. */
  if (isQ_(x)) return part === 'q' ? questionWhole_(x, (questionParts_()[qId_(x)] || [x]), null, true) : stuffCard(x);
  return practicalPart_(x, part);
}

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
window.CARD_EXTRAS_MORE = Object.assign(window.CARD_EXTRAS_MORE || {}, { bible: bibleOpts_, insert: insertExtras_, manuscript: histExtras_, figure: histExtras_, writing: histExtras_, event: histExtras_, timeline: tlExtras_ });
