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
      ' printPrice, laminatePrice, money, docById_,' +
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
function papersIn(pick) {
  const docs = {};
  LIBRARY.forEach(r => { if (r.kind === 'document' && r.paper_id && !docs[r.paper_id]) docs[r.paper_id] = r; });
  const ids = new Set();
  LIBRARY.forEach(r => {
    if (r.kind !== 'question' || !ON(r.active) || !r.paper_id) return;
    if (!pick(r)) return;
    const d = docs[r.paper_id];
    if (d && String(d.printable == null ? '' : d.printable).trim().toLowerCase() === 'false') return;
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
     Edexcel maths past papers from Summer 2017, narrowed the way the funnel narrows — the chips a
     thumb would set, in order. */
  const DOORS = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Questions' },
                 { field: 'subject', value: 'Maths' }, { field: 'documentType', value: 'Past paper' },
                 { field: 'level', value: 'GCSE' }];
  const SUMMER = r => String(r.year) === '2017' && ['5', '6'].includes(String(r.month));
  const MATHS = r => r.subject === 'Maths' && r.document_type === 'Past paper';
  const cases = [
    { name: 'Summer 2017, Higher',
      filters: DOORS.concat([{ field: 'tier', value: 'Higher' }, { field: 'examWave', value: 'Summer 2017' }]),
      want: papersIn(r => MATHS(r) && r.tier === 'Higher' && SUMMER(r)), title: ['Edexcel', 'Maths', 'Summer 2017'] },
    /* BOTH TIERS, WHERE TWO PAPERS SHARE A NAME. `Paper 1 (Non-Calculator)` and `Paper 1
       (Non-calculator)` are one letter's case apart, so the card has to say which is which. */
    { name: 'Summer 2017, both tiers',
      filters: DOORS.concat([{ field: 'examWave', value: 'Summer 2017' }]),
      want: papersIn(r => MATHS(r) && SUMMER(r)), title: ['Edexcel', 'Maths', 'Summer 2017'] },
    /* THE BUCKET, which is what the Sitting question offers first: four sittings, twelve papers. */
    { name: '2017 & 2018, Higher',
      filters: DOORS.concat([{ field: 'tier', value: 'Higher' },
                             { field: 'examWave', value: '2017 & 2018', bucket: true }]),
      want: papersIn(r => MATHS(r) && r.tier === 'Higher' && ['2017', '2018'].includes(String(r.year))),
      title: ['Edexcel', 'Maths', '2017 & 2018'] },
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
  [{ name: 'GCSE · Algebra', filters: DOORS.slice(0, 3).concat([{ field: 'level', value: 'GCSE' },
                                                                   { field: 'topicArea', value: 'Algebra' }]) },
   /* BY QUESTION NUMBER, NOT BY TOPIC: a past paper answers no topic question any more (see
      `topicShown_`), and the first ten questions of three papers is the same shape — three papers
      inside every bound, none of them whole. */
   { name: 'Summer 2017 · Higher · Q1–10', filters: cases[0].filters.concat([{ field: 'qNumber', value: '1–10', bucket: true }]) },
  ].forEach(t => {
    narrow(t.filters);
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
     every paper is in — so that press proves the tile, not the rule. `2017 & 2018` holds the three
     Summer 2017 papers already in the basket and nine more; its trolley is live, and pressing it
     must add the nine and only the nine. */
  const had = b.CART().map(c => Object.assign({}, c));
  const wide = cases[2];
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
               + 'the two sittings are [' + list(wide.want) + ']');
    }
  }
  b.setCart(had);

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
  b.go('tools');
  b.initCart();
  const send = () => w.document.querySelector('#s-tools .cart-box [data-do="cart-send"]');
  if (!send()) { bad.push('the basket on the Tools column has no Send button'); return done(); }

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
