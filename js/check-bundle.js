#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-bundle.js A BUNDLE NAMES EXACTLY THE PAPERS THE LIST IS, AND THE ORDER REACHES THE OWNER. § */
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

/* ---------- THE BACKEND, STOOD IN FOR — WITH SOMEBODY TO SEND AN ORDER TO § */
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
  /* SIGNED IN THE WAY THE APP SIGNS ITSELF IN — `data.js` reads this key as it loads, so this is a returning visitor rather than a hand on `USER` after the fact. § */
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

/* ---------- THE PAPERS A SITTING HOLDS, READ STRAIGHT OFF THE FILE § */
const ON = v => String(v == null ? '' : v).trim().toLowerCase() === 'true';
const DOCS = {};
LIBRARY.forEach(r => { if (r.kind === 'document' && r.paper_id && !DOCS[r.paper_id]) DOCS[r.paper_id] = r; });
/* THE DOCUMENT ROW SAYS NO — the paper-level cell, never the question row's own. § */
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

  /* ---------- 1. NOTHING BEFORE ANYTHING IS ASKED § */
  narrow([]);
  if (b.bundleOf_()) bad.push('a bundle is offered on the funnel\'s very first, unanswered state');
  if (w.document.querySelector('#s-stuff .card.bundle')) {
    bad.push('a bundle card is drawn on the funnel\'s first state');
  }
  narrow([{ field: 'forLabel', value: 'Learning' }]);
  if (b.bundleOf_()) bad.push('a bundle is offered for the whole of `What for · Learning`');

  /* ---------- 2. THE OWNER'S OWN EXAMPLE, NAMED PAPER FOR PAPER § */
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
    /* BOTH TIERS, WHERE TWO PAPERS SHARE A NAME. § */
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
    /* `2017 & 2018` WAS HERE — the Year question's bucket. § */
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
    /* EVERY LABEL UNIQUE INSIDE THE BUNDLE, where it is read — `short` is the name the basket and the order message put under the bundle's title, so two papers § */
    const shorts = bun.printable.map(p => String(p.short || p.label).toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (new Set(shorts).size !== shorts.length) {
      bad.push(c.name + ': two papers in the bundle read the same — '
               + bun.printable.map(p => p.short || p.label).join(' / '));
    }
    /* ---------- THE CARD IS WHERE THE PAGER SAYS IT IS § */
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

  /* ---------- 3. A LIST THAT IS NOT WHOLE PAPERS IS NOT A BUNDLE § */
  /* TWICE, AND THE SECOND IS THE ONE THAT CAN FAIL. § */
  /* `GCSE · Algebra` WAS A `Topic area` CHIP, and that question is retired (find.js). The same
     shape — every GCSE paper, none of them whole — is reached by typing it. */
  [{ name: 'GCSE · "algebra"', filters: DOORS.slice(0, 3).concat([{ field: 'level', value: 'GCSE' }]), q: 'algebra' },
   /* BY THE SEARCH BOX, NOT BY QUESTION NUMBER AND NOT BY TOPIC. § */
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

  /* ---------- 4. THE TROLLEY PUTS EACH PAPER IN ONCE § */
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
  /* AND AN OVERLAPPING BUNDLE, which is where "not twice" is actually decided. § */
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

  /* ---------- 4b. `Bundles` IS A KIND, AND ITS RESULTS ARE BUNDLES § */
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

  /* ---------- 4c. ONE PAPER IS A SITTING TOO, AND IT GETS ITS CARD § */
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

  /* ---------- 4d. A PAPER THAT CANNOT BE PRINTED IS NOT A BUNDLE'S QUESTION § */
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

  /* ---------- 4e. THE LAST LINE UNDER THE FUNNEL SAYS BUNDLES WHEN BUNDLES ARE WHAT IS BELOW § */
  /* ---------- AND ALL THREE OF ITS BRANCHES, NOT ONLY THE ONE THAT HAS ONE BUNDLE § */
  {
    const BUNDLES = DOORS.map(f => f.field === 'kindLabel' ? { field: 'kindLabel', value: 'Bundles' } : f);
    const JUNE19 = BUNDLES.concat([{ field: 'tier', value: 'Higher' }, { field: 'examYear', value: '2019' },
                                   { field: 'examMonth', value: 'June' }]);
    const NOV19 = BUNDLES.concat([{ field: 'tier', value: 'Higher' }, { field: 'examYear', value: '2019' },
                                  { field: 'examMonth', value: 'November' }, { field: 'paperId', any: true }]);
    /* THE NONE CASE, FOUND BY A SEARCH. § */
    narrow(NOV19);
    const askedNeeds = [...w.document.querySelectorAll('#s-stuff [data-do="facet-pick"][data-field="needs"]')].length;
    if (askedNeeds) bad.push('Bundles, Higher · November 2019: ' + askedNeeds + ' `What you need` answer(s) offered — it is tagOnly and never asked in Bundles (355)');
    narrow(NOV19, 'work out');
    const none = !b.bundlesBySitting_().length && b.stuffFiltered().length ? NOV19 : null;
    if (!none) {
      bad.push('Bundles, Higher · November 2019, searched "work out": ' + b.bundlesBySitting_().length
               + ' bundle(s) over ' + b.stuffFiltered().length + ' item(s), so the no-bundle line was NOT asked — not a pass');
    }
    [{ name: 'a paper chosen', paper: true, filters: JUNE19.concat([{ field: 'paperId', value: 'P-1MA1-1906-2H' }]),
       want: 1 },
     { name: '`Doesn\'t matter` on Paper', filters: JUNE19.concat([{ field: 'paperId', any: true }]), want: 1 },
     /* SEVERAL: a year with every month, every paper and every need left open. */
     { name: '2019, every month, paper and need', want: 'several',
       filters: BUNDLES.concat([{ field: 'examYear', value: '2019' }, { field: 'examMonth', any: true },
                                { field: 'paperId', any: true }, { field: 'needs', any: true }]) },
     ...(none ? [{ name: 'Higher · November 2019, searched "work out"', want: 0, filters: none, q: 'work out' }] : []),
    ].forEach(t => {
      narrow(t.filters, t.q);
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
      /* NONE IS NOT A COUNT. § */
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

    /* ---------- THE DEAD END SAYS WHICH ANSWER TOOK THE PAPERS APART § */
    /* AND ONLY WHAT WAS CHOSEN. § */
    const dead = () => [...w.document.querySelectorAll('#s-stuff .card.bundle')].find(x => /No whole/.test(x.textContent));
    const deadEnds = [];
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

  /* ---------- 5. A BASKET SAVED BEFORE BUNDLES STILL DRAWS, AND AN UNCOUNTED PAPER IS NOT FREE § */
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

  /* ---------- 6. SEND: THE RIGHT PERSON, EVERY LINE, AND THE BASKET GOES ONLY ON A YES § */
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
