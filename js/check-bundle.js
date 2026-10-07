#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-bundle.js

   A BUNDLE NAMES EXACTLY THE PAPERS THE LIST IS, AND THE ORDER REACHES THE OWNER.

   ASKED FOR AS *"what happened to collection/bundle in the finder. like what if someone wants a
   bundle of 2017 past papers for maths edexcell to add to cart and have me send it to them?"* Three
   halves — the card, the basket, the message — and each of them can be wrong in a way that draws
   perfectly and is noticed by nobody until an order arrives with the wrong papers on it:

     · a bundle that names a paper the list does not hold, or leaves out one it does
     · a trolley that puts a paper in twice, or an old basket that stops drawing
     · a Send that empties the basket when the server said no, or writes to the wrong person

   `check-flow.js` CANNOT ASK ANY OF IT. Its fake backend answers every GET — `data/questions.json`
   included — with the payload, so its funnel has no library in it and no bundle can ever form. This
   boots the real app over the REAL files, the way `check-funnel.js` does, and a fixture only for
   what is not a file.

   THE EXPECTED PAPERS ARE WORKED OUT FROM THE FILE, NOT FROM THE APP. `bundleBuild_` groups the
   funnel's own list; the rule below reads `data/questions.json` row by row — subject, type, tier,
   year, month — and asks which papers have a question in that sitting. The two methods share
   nothing, so they cannot agree by sharing a mistake.

     node js/check-bundle.js
================================================================================================== */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const bad = [];
const said = [];

function loadOrder_() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  if (!m) { console.error('cannot read window.FILES out of index.html'); process.exit(1); }
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}

const LIBRARY = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));

/* ---------- THE BACKEND, STOOD IN FOR — WITH SOMEBODY TO SEND AN ORDER TO -------------------------
   THE FIXTURE HAS ONE TUTOR AND NO ADMIN, so an order from it has nowhere to go and the Send path
   would take its "nobody to send this to" branch and report nothing wrong. `doGet` sends admins
   among the tutors with their `personId`, so one is added in that shape. INVENTED, like every row in
   that file — this repository is public. */
const OWNER = { title: 'Owner Person', role: 'Admin', personId: 'P-OWNER', handle: 'owner',
                listed: true, rate: 0, teaches: [] };
const FIXTURE = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
FIXTURE.tutors = (FIXTURE.tutors || []).concat([OWNER]);
const VARS = (FIXTURE.constants || {}).vars || {};
const VISITOR = { name: 'Test Parent', personId: 'P-PARENT', person_id: 'P-PARENT', role: 'client',
                  roles: ['client'], handle: 'testparent', postcode: 'SW19 1AA' };

/* THE ANSWER THE NEXT POST GETS, changed by a journey that wants a refusal. */
let REPLY = { success: true };

function boot() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true,
                                url: 'https://example.org/' });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLMediaElement.prototype.pause = () => {};
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  /* SIGNED IN THE WAY THE APP SIGNS ITSELF IN — `data.js` reads this key as it loads, so this is a
     returning visitor rather than a hand on `USER` after the fact. `cart-add` and `cart-send` both
     refuse a stranger, and a check run as one would be measuring the refusal. */
  w.localStorage.setItem('familyUser', JSON.stringify(VISITOR));
  w.localStorage.removeItem('familyCart');

  const posts = [];
  w.fetch = (url, o) => {
    const body_ = t => ({ ok: true, status: 200,
      text: () => Promise.resolve(JSON.stringify(t)), json: () => Promise.resolve(t) });
    if (o && o.body) {
      let b = {};
      try { b = JSON.parse(o.body); } catch (e) {}
      posts.push(b);
      return Promise.resolve(body_(b.action === 'sendMessage' ? REPLY : { success: true }));
    }
    /* EVERY `data/**.json` FROM DISK — the rule `check-funnel.js` arrived at after being blind to
       the practicals, the topic tree and the funnel's own order in turn. */
    const file_ = /(data\/[a-z0-9_\-\/]+\.json)/.exec(String(url));
    if (file_) {
      try {
        return Promise.resolve(body_(JSON.parse(fs.readFileSync(path.join(ROOT, file_[1]), 'utf8'))));
      } catch (e) { /* not a file on disk — the fixture answers below */ }
    }
    return Promise.resolve(body_(FIXTURE));
  };
  const errs = [];
  w.onerror = m => errs.push(String(m));
  const src = loadOrder_().map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n');
  try {
    w.eval(src + '\n;window.__b = { STUFF, stuffFiltered, bundleOf_, paintStuff, stuffFirstResult_,' +
      ' stuffPageCount, frontPages_, pageCount, go, goPage, initCart, cartCard_, orderText_,' +
      ' printPrice, laminatePrice, money, docById_, bundlesBySitting_, stuffPages_, facetBy, facetValues,' +
      ' CART: () => CART, setCart: v => { CART = v; }, USER: () => USER };');
  } catch (e) {
    return { err: 'the app did not load: ' + e.message };
  }
  return { w, posts, errs };
}

/* ---------- THE PAPERS A SITTING HOLDS, READ STRAIGHT OFF THE FILE --------------------------------
   A question row whose own columns say it is that subject, that type, that tier and that sitting,
   and whose paper is printable — the only paper-level fact that can keep a whole paper out of an
   order, and the one the bundle card names rather than drops. */
const ON = v => String(v == null ? '' : v).trim().toLowerCase() === 'true';
const DOCS = {};
LIBRARY.forEach(r => { if (r.kind === 'document' && r.paper_id && !DOCS[r.paper_id]) DOCS[r.paper_id] = r; });
/* THE DOCUMENT ROW SAYS NO — the paper-level cell, never the question row's own. 229 past-paper and
   28 specimen question rows have no `printable` cell while their paper's row says FALSE, and reading
   the question row is how `Bundles` came to offer Religious Studies (review of PR #130, finding 6). */
const OFF = id => { const d = DOCS[id];
  return !!d && String(d.printable == null ? '' : d.printable).trim().toLowerCase() === 'false'; };
function papersIn(pick) {
  const ids = new Set();
  LIBRARY.forEach(r => {
    if (r.kind !== 'question' || !ON(r.active) || !r.paper_id) return;
    if (!pick(r)) return;
    if (OFF(r.paper_id)) return;
    ids.add(r.paper_id);
  });
  return ids;
}
const sameSet = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
const list = s => [...s].sort().join(', ');

const tick = ms => new Promise(ok => setTimeout(ok, ms));

(async () => {
  const app = boot();
  if (app.err) { bad.push(app.err); return done(); }
  await tick(2000);
  const { w, posts } = app;
  const b = w.__b;
  if (!b || !b.USER()) {
    bad.push('the visitor was not signed in, so the basket refuses every press and nothing below '
             + 'would be measuring the basket');
    return done();
  }
  b.go('stuff');
  const narrow = (filters, q) => {
    b.STUFF.q = q || '';
    b.STUFF.filters = filters.map(f => Object.assign({}, f));
    b.paintStuff();
  };

  /* ---------- 1. NOTHING BEFORE ANYTHING IS ASKED --------------------------------------------------
     The funnel's first state is the whole library — 266 papers — and a card offering it is a card
     between somebody and the question they came to answer. Asked on the first door too, because
     `Learning` is still the whole library.

     TWO GUARDS ANSWER THIS TODAY AND ONLY ONE OF THEM IS VISIBLE HERE. `bundleOf_` refuses before
     anything is asked, AND the whole library is 266 papers, past `BUNDLE_MAX`. Taking the first
     guard out was tried and this stays green, because the second still says no — said rather than
     implied, so nobody reads this assertion as having proved the first one. It is here for the day
     the library is small enough that only the first guard is left standing. */
  narrow([]);
  if (b.bundleOf_()) bad.push('a bundle is offered on the funnel\'s very first, unanswered state');
  if (w.document.querySelector('#s-stuff .card.bundle')) {
    bad.push('a bundle card is drawn on the funnel\'s first state');
  }
  narrow([{ field: 'forLabel', value: 'Learning' }]);
  if (b.bundleOf_()) bad.push('a bundle is offered for the whole of `What for · Learning`');

  /* ---------- 2. THE OWNER'S OWN EXAMPLE, NAMED PAPER FOR PAPER -----------------------------------
     Edexcel maths past papers from 2017, narrowed the way the funnel narrows — the chips a thumb
     would set, in order. It was `Summer 2017` until the owner asked for months rather than seasons:
     the funnel asks Year and then Month now, so the papers a thumb can reach as one set are the
     ones in one MONTH folder, and the title says `June 2017` the way the folder does. */
  const DOORS = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Questions' },
                 { field: 'subject', value: 'Maths' }, { field: 'documentType', value: 'Past paper' },
                 { field: 'level', value: 'GCSE' }];
  const JUNE = r => String(r.year) === '2017' && String(r.month) === '6';
  const MATHS = r => r.subject === 'Maths' && r.document_type === 'Past paper';
  const cases = [
    { name: 'June 2017, Higher',
      filters: DOORS.concat([{ field: 'tier', value: 'Higher' }, { field: 'examYear', value: '2017' },
                             { field: 'examMonth', value: 'June' }]),
      want: papersIn(r => MATHS(r) && r.tier === 'Higher' && JUNE(r)), title: ['Edexcel', 'Maths', 'June 2017'],
      not: ['Summer'] },
    /* BOTH TIERS, WHERE TWO PAPERS SHARE A NAME. `Paper 1 (Non-Calculator)` and `Paper 1
       (Non-calculator)` are one letter's case apart, so the card has to say which is which. May, because
       that is the month both tiers sat Paper 1 in -- the June folder here holds Higher papers only. */
    { name: 'May 2017, both tiers',
      filters: DOORS.concat([{ field: 'examYear', value: '2017' }, { field: 'examMonth', value: 'May' }]),
      want: papersIn(r => MATHS(r) && String(r.year) === '2017' && String(r.month) === '5'),
      title: ['Edexcel', 'Maths', 'May 2017'], not: ['Summer'] },
    /* THE WHOLE YEAR FOLDER, three months in it: the title says the year and no month or season. */
    { name: '2017, Higher',
      filters: DOORS.concat([{ field: 'tier', value: 'Higher' }, { field: 'examYear', value: '2017' }]),
      want: papersIn(r => MATHS(r) && r.tier === 'Higher' && String(r.year) === '2017'),
      title: ['Edexcel', 'Maths', '2017'], not: ['Summer', 'Autumn', 'June', 'November'],
      /* AND THE LINES INSIDE IT ARE THE MONTH FOLDERS, `May 2017` / `June 2017` / `November 2017` --
         they listed `Summer 2017` and `Autumn 2017` under a Month question offering May and June. */
      groups: ['May 2017', 'June 2017', 'November 2017'] },
    /* `2017 & 2018` WAS HERE — the Year question's bucket. The owner took the buckets out (6 Oct:
       *"No more of these artificial categories"*), so that filter matches nothing now; the overlap
       it stood for below is the whole-year folder, which holds the June papers and more. */
  ];
  cases.forEach(c => {
    if (c.want.size < 2) {
      bad.push(c.name + ': the file holds ' + c.want.size + ' paper(s) for this sitting, so this case '
               + 'measures nothing — NOT a pass');
      return;
    }
    narrow(c.filters);
    const bun = b.bundleOf_();
    if (!bun) { bad.push(c.name + ': no bundle is offered for ' + c.want.size + ' whole papers'); return; }
    const got = new Set(bun.ids);
    if (!sameSet(got, c.want)) {
      bad.push(c.name + ': the bundle names [' + list(got) + '] and the file says the sitting is ['
               + list(c.want) + ']');
    }
    const miss = c.title.filter(word => !String(bun.title).includes(word));
    if (miss.length) bad.push(c.name + ': the title "' + bun.title + '" does not say ' + miss.join(', '));
    if (c.groups) {
      const got = [...new Set(bun.papers.map(p => String(p.group || '')))];
      const want = c.groups;
      if (got.length !== want.length || want.some(g => got.indexOf(g) === -1)) {
        bad.push(c.name + ': the bundle groups its papers as [' + got.join(' | ') + '] where the Month '
                 + 'folders are [' + want.join(' | ') + ']');
      }
    }
    const extra = (c.not || []).filter(word => String(bun.title).includes(word));
    if (extra.length) bad.push(c.name + ': the title "' + bun.title + '" says ' + extra.join(', ')
                               + ' — the funnel asks months, and a season in the title is a word it no longer offers');
    /* EVERY LABEL UNIQUE INSIDE THE BUNDLE, where it is read — `short` is the name the basket and
       the order message put under the bundle's title, so two papers sharing one is an order the
       owner cannot fill. Compared as a reader would, case and punctuation folded. */
    const shorts = bun.printable.map(p => String(p.short || p.label).toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (new Set(shorts).size !== shorts.length) {
      bad.push(c.name + ': two papers in the bundle read the same — '
               + bun.printable.map(p => p.short || p.label).join(' / '));
    }
    /* ---------- THE CARD IS WHERE THE PAGER SAYS IT IS ----------------------------------------
       ONE PAGE BETWEEN THE QUESTION AND THE FIRST RESULT, counted by the same function that draws
       it. Asked of the DOM against the count, because the fault that could come of this is the
       pager and the strip disagreeing about how many pages lead: every result would then be drawn
       one page off from the one it is counted as. */
    const host = w.document.querySelector('#s-stuff .card.bundle');
    const page = host && host.closest('.page');
    if (!page) { bad.push(c.name + ': the bundle card is not drawn on the Find screen'); return; }
    const at = [].indexOf.call(page.parentNode.children, page);
    if (at !== b.stuffFirstResult_() - 1) {
      bad.push(c.name + ': the bundle card is page ' + at + ' and the first result is counted from '
               + b.stuffFirstResult_() + ' — the card should be the page just before it');
    }
    const firstRes = w.document.querySelector('#s-stuff > .page.is-res, #s-stuff .page.is-res');
    const resAt = firstRes ? [].indexOf.call(firstRes.parentNode.children, firstRes) : -1;
    if (resAt !== b.stuffFirstResult_()) {
      bad.push(c.name + ': the strip draws its first result at page ' + resAt + ' and the pager counts it '
               + 'at ' + b.stuffFirstResult_());
    }
    if (b.pageCount('stuff') !== b.stuffFirstResult_() + b.stuffPageCount()) {
      bad.push(c.name + ': the pager counts ' + b.pageCount('stuff') + ' pages for '
               + b.stuffFirstResult_() + ' leading pages and ' + b.stuffPageCount() + ' results');
    }
    const drawn = host.querySelectorAll('.bundle-name').length;
    if (drawn !== c.want.size) {
      bad.push(c.name + ': the card lists ' + drawn + ' paper(s) for a bundle of ' + c.want.size);
    }
    said.push(c.name + ': ' + bun.noun + ' — ' + bun.title);
  });

  /* ---------- 3. A LIST THAT IS NOT WHOLE PAPERS IS NOT A BUNDLE ---------------------------------
     GCSE maths narrowed by TOPIC is questions from dozens of papers, not one of them whole. A card
     offering "the papers these are in" would be describing a different thing from the list under
     it — hundreds of printed pages for a few hundred questions. */
  /* TWICE, AND THE SECOND IS THE ONE THAT CAN FAIL. The whole of GCSE algebra is thirty-odd papers,
     past `BUNDLE_MAX`, so it would offer nothing even if wholeness were never asked — a case the
     bounds answer is not a case about wholeness. One sitting's algebra is three papers, inside
     every bound, and only the wholeness test keeps it out. */
  /* `GCSE · Algebra` WAS A `Topic area` CHIP, and that question is retired (find.js). The same
     shape — every GCSE paper, none of them whole — is reached by typing it. */
  [{ name: 'GCSE · "algebra"', filters: DOORS.slice(0, 3).concat([{ field: 'level', value: 'GCSE' }]), q: 'algebra' },
   /* BY THE SEARCH BOX, NOT BY QUESTION NUMBER AND NOT BY TOPIC. A past paper answers no topic
      question any more (see `topicShown_`), and this case was `Q1–10` until the owner retired the
      question number (*"no more asking for questions 1-10 or question part 1 or b."*) — a `qNumber`
      chip now matches nothing, so `filterHit` lets everything through and the list WAS whole papers.
      Typing `work out` over the same sitting is the same shape a person can still reach: measured,
      17 questions from both papers (10 of 29, 7 of 28), inside every bound, neither whole. */
   { name: 'June 2017 · Higher · "work out"', filters: cases[0].filters, q: 'work out' },
  ].forEach(t => {
    narrow(t.filters, t.q);
    if (b.stuffFiltered().length < 10) {
      bad.push(t.name + ' returned ' + b.stuffFiltered().length + ' items, so this wholeness case '
               + 'measures nothing — NOT a pass');
    } else if (b.bundleOf_()) {
      bad.push(t.name + ' — questions from several papers, none whole — offers a bundle of ' + b.bundleOf_().noun
               + ', and not one of those papers is whole on that list');
    }
  });

  /* ---------- 4. THE TROLLEY PUTS EACH PAPER IN ONCE ----------------------------------------------
     PRESSED, through the app's own delegated click, twice. The second press must add nothing — an
     order with a paper on it twice is the owner printing it twice. */
  const first = cases[0];
  narrow(first.filters);
  const bun = b.bundleOf_();
  const trolley = () => w.document.querySelector('#s-stuff [data-do="cart-add"][data-kind="bundle"]');
  if (!bun || !trolley()) {
    bad.push('the bundle for ' + first.name + ' has no trolley to press');
    return done();
  }
  trolley().click();
  await tick(30);
  const lines = () => b.CART().filter(c => c.kind === 'print');
  const inCart = new Set(lines().map(c => String(c.key)));
  if (!sameSet(inCart, first.want)) {
    bad.push('the trolley put [' + list(inCart) + '] in the basket for a bundle of [' + list(first.want) + ']');
  }
  lines().forEach(c => {
    if (c.from !== bun.title) bad.push('a basket line from the bundle says it came from "' + c.from + '"');
    const doc = b.docById_(c.key) || {};
    if (Number(c.pages || 0) !== (Number(doc.pages) || 0)) {
      bad.push(c.key + ' went in with ' + c.pages + ' pages where its document row says ' + doc.pages);
    }
  });
  narrow(first.filters);
  if (trolley()) trolley().click();
  await tick(30);
  if (b.CART().length !== first.want.size) {
    bad.push('pressing the same bundle twice left ' + b.CART().length + ' lines for '
             + first.want.size + ' papers');
  }
  /* AND AN OVERLAPPING BUNDLE, which is where "not twice" is actually decided. Pressing the same
     bundle again is stopped before the handler by the tile itself — it is drawn filled and off once
     every paper is in — so that press proves the tile, not the rule. `2017, Higher` holds the two
     June 2017 papers already in the basket and the rest of that year; its trolley is live, and
     pressing it must add the rest and only the rest. Found by name rather than by position, so a
     case added above it cannot quietly make this press a different bundle. */
  const had = b.CART().map(c => Object.assign({}, c));
  const wide = cases.find(c => c.name === '2017, Higher');
  narrow(wide.filters);
  if (!trolley()) {
    bad.push('the overlapping bundle (' + wide.name + ') has no trolley to press');
  } else {
    trolley().click();
    await tick(30);
    const keys = b.CART().map(c => String(c.key));
    if (keys.length !== new Set(keys).size) {
      bad.push('an overlapping bundle put a paper in twice: ' + keys.length + ' lines for '
               + new Set(keys).size + ' papers');
    }
    if (!sameSet(new Set(keys), wide.want)) {
      bad.push('after the overlapping bundle the basket holds [' + list(new Set(keys)) + '] where '
               + 'the year holds [' + list(wide.want) + ']');
    }
  }
  b.setCart(had);

  /* ---------- 4b. `Bundles` IS A KIND, AND ITS RESULTS ARE BUNDLES ---------------------------------
     The owner, 6 Oct: *"bundle is a tag option too"*. Chosen under `What kind`, the list is every
     question on a printable paper, the funnel narrows it as usual, and what is drawn is one bundle per
     sitting — no question pages, and each bundle exactly that sitting's papers. */
  {
    const kind = b.facetBy('kindLabel');
    narrow(DOORS.map(f => f.field === 'kindLabel' ? { field: 'kindLabel', value: 'Bundles' } : f));
    const sits = b.bundlesBySitting_();
    if (!kind) bad.push('there is no `What kind` facet to find `Bundles` under');
    if (!sits.length) bad.push('`Bundles` under Edexcel · Maths · GCSE drew no bundle at all');
    if (b.stuffPages_().length) bad.push('`Bundles` still draws ' + b.stuffPages_().length + ' question pages under its bundles');
    const front = b.frontPages_().filter(h => /class="card bundle/.test(h)).length;
    if (front !== sits.length) bad.push('`Bundles` found ' + sits.length + ' sittings and drew ' + front + ' bundle cards');
    const june = papersIn(r => MATHS(r) && r.tier === 'Higher' && JUNE(r));
    const hit = sits.find(x => [...june].every(id => x.ids.includes(id)));
    if (!hit) bad.push('no bundle under `Bundles` holds the June 2017 Higher papers');
    else if (hit.ids.some(id => { const d = b.docById_(id) || {}; return String(d.year) !== '2017' || String(d.month) !== '6'; })) {
      bad.push('the June 2017 bundle under `Bundles` also holds papers from another sitting: ' + hit.ids.join(', '));
    }
    for (let i = 1; i < sits.length; i++) {
      const y = s => +((b.docById_(s.ids[0]) || {}).year || 0);
      if (y(sits[i]) > y(sits[i - 1])) { bad.push('`Bundles` are not newest first'); break; }
    }
  }

  /* ---------- 4c. ONE PAPER IS A SITTING TOO, AND IT GETS ITS CARD ---------------------------------
     THE REVIEW OF PR #130, FINDING 5. `bundlesBySitting_` asks `bundleBuild_` with `min` 1, and the
     first gate obeyed it while the second — how many papers are PRINTABLE — still asked for
     `BUNDLE_MIN`. So every one-paper sitting came back null: Maths · GCSE · 2019 drew June and
     November and left May out, and pressing `May` under Month drew "No whole sitting left on this
     list to bundle" over the one whole paper it is. Every journey that answered `Paper` — which the
     funnel always asks — ended on the same card. 4b only ever looked at sittings of several papers.

     THE MONTHS ARE READ OFF THE FILE, and the bundles' months off their papers' document rows, so a
     year's view is asked to draw a card for every month the file says that year was sat in. */
  {
    const BUNDLES = DOORS.map(f => f.field === 'kindLabel' ? { field: 'kindLabel', value: 'Bundles' } : f);
    const Y2019 = r => MATHS(r) && r.level === 'GCSE' && String(r.year) === '2019';
    /* BY ITS TITLE — the dead-end card is a `.card.bundle` too, and has none. */
    const cardsDrawn = () => w.document.querySelectorAll('#s-stuff .card.bundle .bundle-title').length;
    const deadEnd = () => /No whole/.test((w.document.querySelector('#s-stuff') || {}).textContent || '');

    narrow(BUNDLES.concat([{ field: 'examYear', value: '2019' }]));
    const wantMonths = new Set();
    LIBRARY.forEach(r => {
      if (r.kind === 'question' && ON(r.active) && Y2019(r) && !OFF(r.paper_id)) wantMonths.add(String(r.month));
    });
    const gotMonths = new Set(b.bundlesBySitting_().map(s => String((b.docById_(s.ids[0]) || {}).month)));
    if (wantMonths.size < 2) {
      bad.push('Bundles · GCSE · 2019: the file holds ' + wantMonths.size + ' month(s), so this case measures '
               + 'nothing — NOT a pass');
    } else if (!sameSet(gotMonths, wantMonths)) {
      bad.push('Bundles · GCSE · 2019 draws bundles for month(s) [' + list(gotMonths) + '] where the file '
               + 'sat it in [' + list(wantMonths) + '] — a one-paper sitting has no card');
    }

    const one = [
      { name: 'Bundles · GCSE · May 2019',
        filters: BUNDLES.concat([{ field: 'examYear', value: '2019' }, { field: 'examMonth', value: 'May' }]),
        want: papersIn(r => Y2019(r) && String(r.month) === '5') },
      /* THE END OF EVERY JOURNEY: the Paper question answered, which leaves one paper. */
      { name: 'Bundles · GCSE · Higher · June 2019 · Paper 2',
        filters: BUNDLES.concat([{ field: 'tier', value: 'Higher' }, { field: 'examYear', value: '2019' },
                                 { field: 'examMonth', value: 'June' },
                                 { field: 'paperId', value: 'P-1MA1-1906-2H' }]),
        want: papersIn(r => r.paper_id === 'P-1MA1-1906-2H') },
    ];
    one.forEach(c => {
      if (c.want.size !== 1) {
        bad.push(c.name + ': the file holds ' + c.want.size + ' printable paper(s), not one, so this case '
                 + 'measures nothing — NOT a pass');
        return;
      }
      narrow(c.filters);
      const sits = b.bundlesBySitting_();
      if (sits.length !== 1 || !sameSet(new Set(sits[0].ids), c.want)) {
        bad.push(c.name + ': one whole printable paper (' + list(c.want) + ') gives ' + sits.length
                 + ' bundle(s)' + (sits.length ? ' [' + sits.map(s => s.ids.join(' + ')).join(' | ') + ']' : ''));
      }
      if (cardsDrawn() !== 1 || deadEnd()) {
        bad.push(c.name + ': the screen draws ' + cardsDrawn() + ' bundle card(s)'
                 + (deadEnd() ? ' and the "No whole sitting" dead end' : '') + ' for one whole paper');
      }
    });
  }

  /* ---------- 4d. A PAPER THAT CANNOT BE PRINTED IS NOT A BUNDLE'S QUESTION ---------------------------
     THE REVIEW OF PR #130, FINDING 6. `bundleable_` — which questions answer `What kind · Bundles` —
     read `printable` off the QUESTION row while `bundleBuild_` read it off the PAPER's, through
     `canPrint_`. Every AQA Religious Studies paper and both Greek ones say FALSE on the paper and
     nothing on the question, so Bundles offered `Religious Studies 152` and `Greek 78` under Subject
     and both led only to the "No whole sitting" card — blaming a topic or a paper nobody had chosen.

     ASKED AT THE ROOT FIRST: every question `Bundles` holds sits on a paper the file says can be
     printed. Then the symptom the owner would see: no subject whose every paper says FALSE is an
     answer — and Religious Studies and Greek must be among those, or the case measures nothing. */
  {
    narrow([{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Bundles' }]);
    const items = b.stuffFiltered();
    const off = items.filter(x => x && x.kind === 'question' && OFF(String((x.row || x).paper_id || '')));
    if (!items.length) bad.push('`What kind · Bundles` holds nothing, so 4d measures nothing — NOT a pass');
    if (off.length) {
      bad.push('`Bundles` holds ' + off.length + ' question(s) on papers whose document row says not printable, '
               + 'from [' + [...new Set(off.map(x => (x.row || x).subject))].join(', ') + ']');
    }
    const onPaper = new Set();
    const canPrint = new Set();
    LIBRARY.forEach(r => {
      if (r.kind !== 'question' || !ON(r.active) || !/paper/i.test(String(r.document_type || ''))) return;
      onPaper.add(r.subject);
      if (!OFF(r.paper_id)) canPrint.add(r.subject);
    });
    const never = [...onPaper].filter(s => !canPrint.has(s));
    const missing = ['Religious Studies', 'Greek'].filter(s => never.indexOf(s) === -1);
    if (missing.length) {
      bad.push('the file now has a printable paper for ' + missing.join(' and ') + ', so 4d no longer '
               + 'measures the case it was written for — NOT a pass');
    }
    const facet = b.facetBy('subject');
    const offered = facet ? b.facetValues(items, facet).map(v => String(v.value)) : [];
    if (!offered.length) bad.push('`Bundles` offers no Subject answers at all, so 4d measures nothing — NOT a pass');
    const dead = never.filter(s => offered.indexOf(s) !== -1);
    if (dead.length) {
      bad.push('`Bundles` offers ' + dead.join(', ') + ' under Subject, and not one of its papers can be printed');
    }
  }

  /* ---------- 4e. THE LAST LINE UNDER THE FUNNEL SAYS BUNDLES WHEN BUNDLES ARE WHAT IS BELOW ---------
     THE REVIEW OF PR #130, FINDING 7. `stuffPages_` draws no question pages under `Bundles`, and the
     funnel's last line still said "That is the paper, in order. Swipe up for its 20 questions." — and,
     with `Doesn't matter` pressed on Paper, "Nothing left to narrow. Swipe up for the 60." over one
     bundle card. Read off the DOM, because the line is what somebody reads. */
  /* ---------- AND ALL THREE OF ITS BRANCHES, NOT ONLY THE ONE THAT HAS ONE BUNDLE -------------------
     THE ROUND-1 REVIEW OF THIS CASE FOUND IT ASKED ONLY STATES WITH EXACTLY ONE BUNDLE. `bundlesEnd_`
     has three sentences — none, one, several — and the paper-or-not half in front of them, and three
     mutations of the other branches stayed green: the zero-bundle line falling back to "Nothing left
     to narrow. Swipe up for the 1." (finding 7's own fault, on the branch nobody asked), the plural
     saying "the 3 questions", and "That is the paper." said after `Doesn't matter` on Paper. All
     three branches are reachable — 368 journeys end on none and 432 on several — so all three are
     asked, and the paper half is held to whether a paper was actually chosen.

     THE COUNT IS MATCHED AS A WHOLE NUMBER. `includes('1')` would fail any line holding a 1 anywhere,
     so the list's length is looked for between word boundaries, and only where it differs from the
     bundle count — a line that says "the 3 bundles" over 3 items is not repeating the list. */
  {
    const BUNDLES = DOORS.map(f => f.field === 'kindLabel' ? { field: 'kindLabel', value: 'Bundles' } : f);
    const JUNE19 = BUNDLES.concat([{ field: 'tier', value: 'Higher' }, { field: 'examYear', value: '2019' },
                                   { field: 'examMonth', value: 'June' }]);
    const NOV19 = BUNDLES.concat([{ field: 'tier', value: 'Higher' }, { field: 'examYear', value: '2019' },
                                  { field: 'examMonth', value: 'November' }, { field: 'paperId', any: true }]);
    /* THE NONE CASE IS FOUND, NOT NAMED. Each `What you need` answer the screen offers at Higher ·
       November 2019 · Paper `Doesn't matter` is pressed — the button itself, through the app's own
       handler — until one leaves no whole paper. Measured: `Compass` does, keeping one question. A
       library where none does says so as a case that measures nothing, rather than passing. */
    const needsPick = () => [...w.document.querySelectorAll('#s-stuff [data-do="facet-pick"][data-field="needs"]')];
    narrow(NOV19);
    const offered = needsPick().map(e => e.dataset.value);
    let none = null;
    for (const v of offered) {
      narrow(NOV19);
      const btn = needsPick().find(e => e.dataset.value === v);
      if (!btn) continue;
      btn.click();
      if (!b.bundlesBySitting_().length && b.stuffFiltered().length) {
        none = b.STUFF.filters.map(f => Object.assign({}, f));
        break;
      }
    }
    if (!none) {
      bad.push('Bundles, Higher · November 2019: none of the ' + offered.length + ' `What you need` answer(s) ['
               + offered.join(', ') + '] leaves no whole paper, so the no-bundle line was NOT asked — not a pass');
    }
    [{ name: 'a paper chosen', paper: true, filters: JUNE19.concat([{ field: 'paperId', value: 'P-1MA1-1906-2H' }]),
       want: 1 },
     { name: '`Doesn\'t matter` on Paper', filters: JUNE19.concat([{ field: 'paperId', any: true }]), want: 1 },
     /* SEVERAL: a year with every month, every paper and every need left open. */
     { name: '2019, every month, paper and need', want: 'several',
       filters: BUNDLES.concat([{ field: 'examYear', value: '2019' }, { field: 'examMonth', any: true },
                                { field: 'paperId', any: true }, { field: 'needs', any: true }]) },
     ...(none ? [{ name: 'Higher · November 2019 · ' + (none[none.length - 1].value || '?') + ' under What you need',
                   want: 0, filters: none }] : []),
    ].forEach(t => {
      narrow(t.filters);
      const end = w.document.querySelector('#stuff-groups .find-end');
      const text = end ? end.textContent.replace(/\s+/g, ' ').trim() : '';
      const n = b.bundlesBySitting_().length;
      const items = b.stuffFiltered().length;
      if (!end) { bad.push('Bundles, ' + t.name + ': the funnel draws no last line at all'); return; }
      const shape = t.want === 'several' ? n >= 2 : n === t.want;
      if (!shape) {
        bad.push('Bundles, ' + t.name + ': ' + n + ' bundle(s) formed where the case is for '
                 + (t.want === 'several' ? 'several' : t.want) + ', so it measures nothing — NOT a pass');
      }
      const repeats = items !== n && new RegExp('\\b' + items + '\\b').test(text);
      if (/question/i.test(text) || !/bundle/i.test(text) || repeats) {
        bad.push('Bundles, ' + t.name + ': the last line reads "' + text + '" over ' + n + ' bundle card(s), '
                 + items + ' item(s) and ' + b.stuffPages_().length + ' question pages');
      }
      /* NONE IS NOT A COUNT. The round-2 review deleted the zero branch and the line fell through to
         "Nothing left to narrow. Swipe up for the 0 bundles." — which held every rule above: no
         `question`, a `bundle`, and the list's 1 item never repeated. Over no bundle the line must
         say there is none, and promise no number of anything to swipe to. */
      if (n === 0 && (!/\bno bundles?\b/i.test(text) || /\d/.test(text) || /the bundles?\b/i.test(text))) {
        bad.push('Bundles, ' + t.name + ': the last line reads "' + text + '" over no bundle card — it must '
                 + 'say there is none, and promise nothing to swipe to');
      }
      if (n >= 2 && !new RegExp('\\b' + n + ' bundles\\b').test(text)) {
        bad.push('Bundles, ' + t.name + ': the last line reads "' + text + '" over ' + n + ' bundle cards — it '
                 + 'does not say how many');
      }
      if (/That is the paper/i.test(text) !== !!t.paper) {
        bad.push('Bundles, ' + t.name + ': the last line reads "' + text + '" and a paper was '
                 + (t.paper ? '' : 'NOT ') + 'chosen');
      }
      said.push('Bundles, ' + t.name + ': ' + text);
    });

    /* ---------- THE DEAD END SAYS WHICH ANSWER TOOK THE PAPERS APART ---------------------------------
       ROUND-1 REVIEW OF PR #130: the card read "a search or a topic narrows it past whole papers" over
       a list nobody had searched and that offers no topic — every one of the 368 dead ends passes
       through `What you need`. It names what was chosen now (`bundleCutBy_`), so it is asked both
       ways: the `What you need` dead end found above must name that question and nothing else, and
       a typed search that breaks the papers must name the search and nothing else. The card is read
       off the DOM, because the sentence is what somebody reads. */
    /* AND ONLY WHAT WAS CHOSEN. The sentence bolds each question it blames, the way the chip above
       names it, so the names are read off those and compared as a list: a card that blamed every
       answer on the row — `Subject`, `Year`, `Month` and all — would still contain the right one,
       and "contains" is the test that let "a search or a topic" through over a list with neither. */
    const dead = () => [...w.document.querySelectorAll('#s-stuff .card.bundle')].find(x => /No whole/.test(x.textContent));
    const needsLabel = (b.facetBy('needs') || {}).label || 'What you need';
    const deadEnds = [];
    if (none) deadEnds.push({ name: 'a `' + needsLabel + '` answer', filters: none, q: '', named: [needsLabel] });
    deadEnds.push({ name: 'a search, "work out"', filters: NOV19, q: 'work out', named: [], search: true });
    deadEnds.forEach(t => {
      narrow(t.filters, t.q);
      if (b.bundlesBySitting_().length || !b.stuffFiltered().length) {
        bad.push('Bundles dead end, ' + t.name + ': ' + b.bundlesBySitting_().length + ' bundle(s) over '
                 + b.stuffFiltered().length + ' item(s), so this case measures nothing — NOT a pass');
        return;
      }
      const card = dead();
      if (!card) { bad.push('Bundles dead end, ' + t.name + ': no "No whole sitting" card is drawn'); return; }
      const text = card.textContent.replace(/\s+/g, ' ').trim();
      const named = [...card.querySelectorAll('.bundle-sub b')].map(x => x.textContent.trim());
      const faults = [];
      if (named.join(' | ') !== t.named.join(' | ')) {
        faults.push('it names [' + named.join(', ') + '] where the answer that broke the papers is ['
                    + t.named.join(', ') + ']');
      }
      if (/search/i.test(text) !== !!t.search) {
        faults.push(t.search ? 'it does not name the search that was typed' : 'it blames a search nobody typed');
      }
      if (/topic/i.test(text)) faults.push('it blames a topic, and `Bundles` asks none');
      if (faults.length) bad.push('Bundles dead end, ' + t.name + ': the card reads "' + text + '" — ' + faults.join('; '));
      said.push('Bundles dead end, ' + t.name + ': ' + text);
    });
    narrow([]);
  }

  /* ---------- 5. A BASKET SAVED BEFORE BUNDLES STILL DRAWS, AND AN UNCOUNTED PAPER IS NOT FREE ----
     `localStorage` outlives a deploy. A print line with its own `money` from the days of the paper
     card, and a shop item, must draw exactly as they did; a paper nobody has counted the pages of
     must say `tbc` rather than `free` — the `cost: 0` fault on the one column that is a price. */
  const was = b.CART().slice();
  b.setCart([{ key: 'OLD-1', kind: 'print', name: 'Paper 31', pages: 8, money: 0.86 },
             { key: 'I001', kind: 'shop', name: 'Trundle wheel', cost: 0, money: 12 },
             { key: 'NOPAGES', kind: 'print', name: 'An uncounted paper', pages: 0, cost: 0 }]);
  let old = '';
  try { old = b.cartCard_(); } catch (e) { bad.push('an old basket throws when drawn: ' + e.message); }
  ['Paper 31', '£0.86', 'Trundle wheel'].forEach(s => {
    if (old && !old.includes(s)) bad.push('an old basket no longer draws "' + s + '"');
  });
  if (old && !/>\s*tbc\s*</.test(old)) bad.push('a paper with no page count is not drawn as tbc');
  if (old && />\s*free\s*</.test(old)) bad.push('a paper with no page count is drawn as free');
  b.setCart(was);

  /* ---------- 6. SEND: THE RIGHT PERSON, EVERY LINE, AND THE BASKET GOES ONLY ON A YES -----------
     One line laminated, so the message has to carry the upgrade and the total has to include it.
     The total is worked out here from the fixture's own rates and the file's own page counts —
     not by asking `cartMoney_`, which is the thing being checked. */
  b.CART()[0].laminate = true;
  const rate = Number(VARS.print_rate_per_page) || 0;
  const lamRate = Number(VARS.laminate_rate_per_page) || 0;
  const lamMin = Number(VARS.laminate_minimum) || 0;
  const r2 = n => Math.round(n * 100) / 100;
  const want = b.CART().reduce((n, c, i) => {
    const pages = Number(c.pages) || 0;
    return n + r2(pages * rate) + (i === 0 ? Math.max(lamMin, r2(pages * lamRate)) : 0);
  }, 0);
  /* THE SHOP COLUMN, where the basket is the first page now — it was a tool, and this went to Tools
     and asked for a Send button that had moved. */
  b.go('shop');
  b.initCart();
  const send = () => w.document.querySelector('#s-shop .cart-box [data-do="cart-send"]');
  if (!send()) { bad.push('the basket on the Shop column has no Send button'); return done(); }

  /* A REFUSAL FIRST. The server's own sentence, and the basket exactly as it was. */
  REPLY = { error: 'One message every five minutes — 3 minutes to go.' };
  const before = b.CART().length;
  send().click();
  await tick(60);
  const toastEl = () => w.document.getElementById('toast');
  if (b.CART().length !== before) {
    bad.push('a refused order emptied the basket — ' + before + ' lines became ' + b.CART().length);
  }
  if (!toastEl() || !/five minutes/.test(toastEl().textContent)) {
    bad.push('a refused order did not say the server\'s sentence (toast: "'
             + (toastEl() ? toastEl().textContent : '') + '")');
  }

  REPLY = { success: true };
  posts.length = 0;
  b.initCart();
  if (!send()) { bad.push('the Send button went after a refusal'); return done(); }
  send().click();
  await tick(60);
  const sent = posts.filter(p => p.action === 'sendMessage');
  if (sent.length !== 1) {
    bad.push('pressing Send posted ' + sent.length + ' sendMessage request(s), not one');
  } else {
    const m = sent[0];
    if (m.toId !== OWNER.personId || m.to !== OWNER.title) {
      bad.push('the order went to ' + m.to + ' (' + m.toId + ') rather than the admin, ' + OWNER.title);
    }
    const text = String(m.body || '');
    if (!text.includes(bun.title)) bad.push('the order does not name the bundle it came from');
    /* EVERY PAPER, BY THE NAME THE CARD GAVE IT, ON A NUMBERED LINE OF ITS OWN — and no other. */
    const numbered = text.split('\n').filter(l => /^\d+\. /.test(l)).map(l => l.replace(/^\d+\. /, '').split(' — ')[0]);
    const expected = bun.printable.map(p => p.short || p.label);
    if (numbered.join(' | ') !== expected.join(' | ')) {
      bad.push('the order lists [' + numbered.join(' | ') + '] and the bundle is [' + expected.join(' | ') + ']');
    }
    if (!/laminated/.test(text)) bad.push('the order does not say which paper is laminated');
    if (!text.includes('Printing: ' + b.money(want))) {
      bad.push('the order does not total ' + b.money(want) + ' — it says: '
               + (text.split('\n').find(l => /^Printing/.test(l)) || '(no Printing line)'));
    }
    if (!text.includes(VISITOR.postcode)) bad.push('the order does not say where to send it');
    if (b.CART().length) bad.push('a sent order left ' + b.CART().length + ' lines in the basket');
    if (!toastEl() || !/Order sent/.test(toastEl().textContent)) {
      bad.push('a sent order did not say so (toast: "' + (toastEl() ? toastEl().textContent : '') + '")');
    }
    said.push('the order, as sent:\n    ' + text.split('\n').join('\n    '));
  }
  done();
})().catch(e => { bad.push('the check itself threw: ' + (e && e.stack || e)); done(); });

function done() {
  said.forEach(s => console.log('  ' + s));
  console.log('');
  console.log('A BUNDLE THAT IS WRONG ABOUT ITS PAPERS, OR AN ORDER THAT IS WRONG ABOUT ITSELF  ('
              + bad.length + ')');
  console.log(bad.length ? '  ' + bad.join('\n  ') : '  none');
  console.log('');
  console.log(bad.length ? 'FAILED — see above.'
    : 'OK — nothing is offered before anything is asked, each bundle names exactly the papers the '
      + 'file says, a topic is not a bundle, a paper goes in once, and an order reaches the owner '
      + 'and empties the basket only on a yes.');
  process.exit(bad.length ? 1 : 0);
}
