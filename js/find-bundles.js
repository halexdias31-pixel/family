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
    if (!isQ_(x)) return;
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
const BUNDLE_TITLE_FIELDS = ['examBoard', 'source', 'subject', 'level', 'keystage', 'yearGroup',
                             'bandValue', 'tier', 'documentType', 'sitting', 'examYear',
                             'examMonth'];
/* A TITLE FIELD'S OWN WAYS: read by another reader, said in the plural, or left out when an earlier field said it (`after`). */
const BUNDLE_TITLE_HOW = {
  sitting: { reader: () => SITTING_READER_ },
  documentType: { say: w => typePlural_(w) },
  examYear: { after: 'sitting' },
  examMonth: { after: 'sitting' },
};
const bundleHow_ = field => (Object.prototype.hasOwnProperty.call(BUNDLE_TITLE_HOW, field) ? BUNDLE_TITLE_HOW[field] : {});
/* `sitting` IS NOT A FUNNEL QUESTION ANY MORE — the funnel asks the year and then the month — and it is still the right TITLE word: § */
const SITTING_READER_ = { field: 'sitting', label: 'Sitting', of: x => {
  const m = sittingMonth_(x), y = sittingOf_(x).year;
  return m && y ? m + ' ' + y : waveOf(x);
} };
function bundleTitle_(items) {
  const parts = [];
  const said = {};
  BUNDLE_TITLE_FIELDS.forEach(field => {
    /* THE YEAR ONLY WHERE THE SITTING DID NOT SAY IT. § */
    if (bundleHow_(field).after && said[bundleHow_(field).after]) return;
    const n = parts.length;
    try { titlePart_(field); } finally { if (parts.length > n) said[field] = true; }
  });
  return parts.join(' · ');

  function titlePart_(field) {
    const how = bundleHow_(field);
    const facet = how.reader ? how.reader() : facetBy(field);
    if (!facet) return;
    let t = null;
    try { t = facetTally_(items, facet); } catch (e) { t = null; }
    const vals = (t && t.values) || [];
    if (vals.length === 1 && t.coverage >= 1) {
      const w = String(vals[0].show || vals[0].value || '');
      if (w) parts.push(how.say ? how.say(w) : w);
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
  /* CARDS ONLY ONCE THE MENUS FINISH (owner, 9 Nov): a bundle is a card, so it waits for `findDone_` as every card does. */
  if (!stuffAsked() || !printOffered_() || !findDone_()) return null;
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
    const id = isQ_(x) ? String(paperIdOf_(x.row || x) || '') : '';
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
  const inBundle = items.filter(x => isQ_(x)
    && count[String(paperIdOf_(x.row || x) || '')] === whole[String(paperIdOf_(x.row || x) || '')]);
  return { papers: papers, printable: printable, ids: printable.map(p => p.id), grouped: grouped,
           title: bundleTitle_(inBundle), firsts: printable.map(p => first[p.id]).filter(Boolean), noun: bundleNoun_(printable, printable.length),
           stray: { questions: strayQs, other: other, papers: partial.map(id => paperLabel_(id)) } };
}

/* WHETHER EVERY PAPER IN IT IS ALREADY A LINE IN THE BASKET — the tile fills when it is, exactly as
   the trolley on a shop card does. */
const bundleInCart_ = b => !!b && b.ids.every(id =>
  (typeof CART !== 'undefined' ? CART : []).some(c => isPrint_(c) && String(c.key) === id));

/* WHAT IT COSTS, SAID HONESTLY. A paper with no page count is not free and is not guessed at. */
function bundlePriceLine_(b) {
  const priced = b.printable.filter(p => printPrice(p.pages) !== null);
  const pages = priced.reduce((n, p) => n + p.pages, 0);
  const cash = priced.reduce((n, p) => n + printPrice(p.pages), 0);
  const left = b.printable.length - priced.length;
  if (!priced.length) return 'Priced when it is sent — no page counts yet';
  if (!left) return pages + ' pages · ' + money_(cash);
  return money_(cash) + ' for ' + priced.length + ' · ' + left + ' priced when sent';
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
/* A BUNDLE CARRIES EVERY TAG ITS PAPERS SHARE (owner, 6 Nov: "the same tags the sections have"), after its own Bundles tag. */
function bundleTagsOf_(b) {
  /* Tags as DATA (one template): a paper's tag is the same tag when it draws the same; the row is drawn once, by `renderTags`. */
  const skip = /^(kindLabel|kindOwn|qNumber|qPart|qSub|marks|myResult)$/, same = t => cardTag_(t, 1);
  const sets = ((b && b.firsts) || []).map(x => { const m = new Map(); tagList_(x).forEach(t => { if (!skip.test(String((t.data || {}).f || ''))) m.set(same(t), t); }); return m; });
  const all = tagList_(BUNDLE_ITEM).concat(sets.length ? [...sets[0].keys()].filter(k => sets.every(m => m.has(k))).map(k => sets[0].get(k)) : []);
  return renderTags(all, 'qcard-tags', !all.length);
}
function bundleCard_(b) {
  const inCart = bundleInCart_(b);
  const off = b.papers.filter(p => !p.ok);
  const note = b.noun + ' · ' + bundlePriceLine_(b);
  const pp = p => p.pages ? [' ', { span: 'qtag mono', text: p.pages + 'pp' }] : [];
  const named = p => [{ span: 'bundle-name', text: p.label }].concat(pp(p));
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
        return groups.map(g => [{ span: 'bundle-when', text: g.group }, ' '].concat(...g.papers.map(named)));
      })()
    : b.printable.map(named);
  const stray = bundleStrayLine_(b);
  /* THE ONE CARD (owner, 9 Nov): picture, name as a tag, two lines closed, Add to basket / Message / Star / ⋯; the papers show open. */
  const tiles = [{ icon: 'cart', label: inCart ? 'In your basket' : 'Add to basket', note: note, act: 'cart-add', on: inCart, off: inCart, tone: 'buy',
      data: { kind: 'bundle', ids: b.ids.join(','), key: b.title || '' } },
    { icon: 'open', label: 'See your basket', act: 'cart-open' }]
    .concat(typeof suggestOpts_ === 'function' ? [suggestOpts_('bundle', 'b:' + String(b.ids[0] || 'x').replace(/[^A-Za-z0-9_.:-]/g, '') + ':' + b.ids.length, b.title || 'Bundle')] : []);
  const lines = cardBlocks_([
    { type: 'group', tag: 'p', text: 'Printed and sent \u00b7 ' + b.noun + ' \u00b7 ' + bundlePriceLine_(b) },
    { type: 'list', ordered: true, look: 'bundle-list', items: list },
    off.length ? { type: 'group', tag: 'p', look: 'bundle-off', text: 'Not in the bundle, marked not printable: ' + off.map(p => p.label).join(', ') } : null,
    stray ? { type: 'group', tag: 'p', look: 'bundle-off', text: stray } : null,
    { type: 'tiles', tiles: tiles }]);
  const name = b.title || 'These papers', x = { kind: 'bundle', name: name, key: 'bundle:' + b.ids.join(',') };
  return findCard(Object.assign(x, { kcOwn: { cls: 'bundle', attrs: '', pic: '', head: cardBlock_({ type: 'msgHead', text: name }), tags: bundleTags_(b), lines: lines } }));
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

  /* ONE PAGE IS ONE ENTRY OF `stuffPages_`, which is the results with each practical expanded into its four parts. § */
  const pg = stuffPages_()[n];
  if (!pg) return '';
  /* COUNTED BEFORE ITS WORDS CAME (397): waiting, whether or not they have come since — the column is drawn again for them. */
  if (pg.slim) return rowsOne_(libWaitHtml_(pg.x) + findTopRow_());
  /* ONE TILE ROW PER THING (489, 495): a card's own row holds `Top` (950); a part page without one gets this one. */
  const html = pg.part === 'q' && pg.parts ? questionWhole_(pg.x, pg.parts, pg.open, pg.ans)
    : pg.part ? partCard_(pg.x, pg.part) : stuffCard(pg.x, credits);
  return rowsOne_(html + (/data-do="find-top"/.test(html) ? '' : findTopRow_()));
}
/* BACK TO TOP (463): "a button to scroll back to the top of the finder"; on a kept card outside one, its column scrolls up. */
const findTopRow_ = () => cardBlock_({ type: 'tiles', look: 'find-top', tiles: [{ icon: 'up', label: 'Back to top', note: 'the first page of this finder', act: 'find-top' }] });
on('find-top', el => { const F = finderAt_(el), p = el.closest('.pane'); if (F) inFinder_(F, () => goPage(F.id, stuffQuestionPage_())); else if (p) p.scrollTop = 0; });

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
  try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) { /* storage can be blocked; the app runs without it */ }
}

const isFav = k => FAVS.has(String(k));

function toggleFav(k, kind) {
  const key = String(k);
  if (FAVS.has(key)) FAVS.delete(key); else FAVS.add(key);
  try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) { /* storage can be blocked; the app runs without it */ }
  /* SAVED QUIETLY. A star is not worth a toast or a spinner — and if the save fails the star is
     still right on this device, which is the part that matters in the moment. */
  if (USER) {
    /* THE STAR HAS ALREADY MOVED and a refusal puts it back, so its save does not hold the tile (534). */
    if (typeof pressFree_ === 'function') pressFree_();
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
      try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) { /* storage can be blocked; the app runs without it */ }
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
           shopTheme: String(r.theme || (r.fields && r.fields.theme) || '').trim(),
           shopFor: who === 'all' ? '' : who === 'tutor' ? 'Tutors' : who === 'admin' ? 'Admins' : who.charAt(0).toUpperCase() + who.slice(1) };
}

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
  return cardBlock_({ type: 'group', look: 'favwrap' + (isFav(x.key) ? ' is-fav' : ''), inner: shown }) + (/\bkc-four\b/.test(shown) ? '' : cardRow_(x));
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
const TAG_OF = {forLabel: 0, kindLabel: 0, kindOwn: 2, postState: 1, postBy: 9, postWhen: 10, msgWith: 7, profileType: 1, settingFor: 1, vidSubject: 10, vidTopic: 11, vidChannel: 8, vidLevel: 9, vidType: 0, venueArea: 6, venueFor: 10, venueSize: 8, projectType: 11, subject: 1, shelf: 5, wReligion: 5, histKind: 4, wCollection: 4, wWork: 8, wSection: 7, wSource: 2, wLanguage: 6, wText: 11, wTradition: 2, wBook: 9, wChapter: 10, wUnit: 2, wAuthor: 10, wForm: 1, wPrimacy: 2, mScope: 8, mMake: 6, mModel: 4, mGen: 2, mEngine: 3, mKind: 3, mSystem: 9, pcType: 5, pcSocket: 4, pcIface: 2, pcLinks: 3, mPhase: 5, mMarket: 3, mYears: 10, mSize: 8, mValves: 9, mBadge: 0, mFuel: 1, mPart: 7, mPrice: 6, cCategory: 11, cGroup: 2, cPeriod: 4, cState: 5, boxKind: 3, fighter: 8, boutMonth: 10, boutYear: 4, decade: 2, division: 4, boutRound: 0, boutMethod: 0, boutWinner: 7, boutEvent: 0, histEra: 1, histMaterial: 5, histFormat: 2, histGenre: 3, histRole: 7, personName: 7, personYears: 8, personFrom: 6, histTheme: 10, histRepository: 6, histFound: 7, histDated: 9, histSide: 8, histTheatre: 9, practicalType: 10, shopKind: 3, shopHow: 1, shopPrice: 6, shopBrand: 3, shopFor: 4, shopTheme: 5, required: 11, documentType: 4, typeOwn: 7, fiveLevel: 10, fiveMonth: 11, fiveDay: 9, level: 3, keystage: 7, yearGroup: 3, bandValue: 5, topic: 6, examBoard: 7, tier: 9, examYear: 5, examMonth: 8, verified: 0, paperId: 8, paperSection: 1, qNumber: 9, qPart: 1, qSub: 2, qPage: 11, qPages: 0, marks: 11, needs: 0, myResult: 11, source: 6};
/* A FACET THE WALK NEVER MET (one the facets tab invented) still has a colour: the first. */
const tagOf_ = field => 'h' + (TAG_OF[field] || 0);
const tagAttr_ = field => ` data-tag="${tagOf_(field)}"`;

/* ---------- WHAT A CHOSEN CHIP SAYS: THE VALUE, AND ONLY WHERE THE VALUE IS NOT ENOUGH, MORE § */
function chipText_(f, i) {
  const key = String((facetBy(f.field) || {}).label || f.field);
  if (f.any) return 'Any ' + key.toLowerCase();
  const show = String(chipShow_(f, i));
  return /^\d{1,3}$/.test(show.trim()) ? key + ' ' + show.trim() : show;
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
function filterChips() { return renderTags(filterChipTags_(), 'chips', true); }

/* CLEAR-ALL IS A TILE ABOVE THE CHIPS, not a chip at the end of the row: it empties every answer at once. */
function filterClear_() {
  return STUFF.filters.length
    ? tile_({ icon: 'bin', label: 'Clear', note: 'every answer', act: 'filter-clear', cls: 'find-clear' })
    : '';
}

/* `on('noop')` was here: a handler that did nothing, for markup that wanted to swallow a tap.
   Nothing carries `data-do="noop"`, so it swallowed nothing. */
/* ANSWERING THE QUESTION ON THE PAGE. One tap: it becomes a chip, and the next question — if
   there is one worth asking — takes its place. */

/* EACH ON THE FINDER IT WAS PRESSED IN (`finderAt_`): an answer in the second finder is a chip there,
   and never one on Find. */
on('facet-pick', el => inFinder_(finderAt_(el), () => {
  writingFreeze_();
  /* ONE ANSWER, SEVERAL VALUES (`tellApart_`'s `also`): each is a filter, so the field reads "either", and the row says it once. */
  let also = [];
  try { also = el.dataset.also ? JSON.parse(el.dataset.also) : []; } catch (e) { also = []; }
  [el.dataset.value].concat(also).forEach(v => STUFF.filters.push({ field: el.dataset.field, value: v }));
  paintStuffSoon_();
  /* A BOOK OF THE BIBLE CHOSEN WAS FETCHED HERE TOO (docs/history/341), and the review of 12 Oct found nothing could tell: § */
}));
/* ---------- AND NOT ANSWERING IT IS ALSO AN ANSWER ----------------------------------------------
   Same push, same repaint, no value. See the `any` note in `stuffFind` for what that entry does and
   does not do. */
on('facet-skip', el => inFinder_(finderAt_(el), () => {
  writingFreeze_();
  STUFF.filters.push({ field: el.dataset.field, any: true });
  paintStuffSoon_();
}));
/* A CHIP SAID ONCE FOR SEVERAL FILTERS (`filterChips`) takes all of them off. */
on('filter-drop', el => inFinder_(finderAt_(el), () => {
  const i = Number(el.dataset.i), f = STUFF.filters[i];
  const say = f && !f.any ? spellKey_(chipText_(f, i)) : null;
  STUFF.filters = STUFF.filters.filter((g, j) => j !== i && !(say && g.field === f.field && !g.any && spellKey_(chipText_(g, j)) === say));
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
  if (FLOW_LAYOUT) { if (d) window.scrollBy(0, -d); return; }
  try { colShiftNow_(host, d); } catch (e) { /* the column left as it was is the jump this exists to stop, and nothing worse */ }
}

/* EVERY LIBRARY INDEX `paintStuff` asks for, one call each. */
function stuffIndexesAsk_() {
  if (USER || !ruleOn_('finder-members')) {
  if (typeof window.talmudIndex_ === 'function') window.talmudIndex_();
  if (typeof window.quranIndex_ === 'function') window.quranIndex_();
  if (typeof window.hadithIndex_ === 'function') window.hadithIndex_();
  if (typeof window.worksIndex_ === 'function') window.worksIndex_();
  if (typeof textsIndex_ === 'function') textsIndex_();
  if (typeof pdtextsIndex_ === 'function') pdtextsIndex_();
  if (typeof window.orthoIndex_ === 'function') window.orthoIndex_();
  if (typeof window.hymnsIndex_ === 'function') window.hymnsIndex_();
  if (typeof mechIndex_ === 'function') mechIndex_();
  if (typeof chemIndex_ === 'function') chemIndex_(); }
}

function paintStuff(keepPage) {
  /* EVERY LIBRARY INDEX IS ASKED FOR WHEN A FINDER IS PAINTED (473, 490), never by a widget drawing ahead; signed out none, as Find answers only Settings (C+, 503). */
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
