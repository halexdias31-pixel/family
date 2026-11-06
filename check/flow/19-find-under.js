check('Find 2 across a sign-in: signed out it is the members card, signed in it is the finder; kept for the child whose session ended, cleared when an admin signs out or another child signs in', async () => {
  const bad = [];
  /* ---- SIGNED OUT: ONE CARD, MEMBERS ONLY (400); SIGNED IN: THE FINDER ---- */
  {
    const b = await resBoot_({ member: false });
    if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
    const { w } = b, t = w.__t, d = w.document;
    if (t.whoami()) return ['the app opened signed in — signed OUT was NOT checked'];
    t.go('res', false, true); await wait(100);
    if (!d.querySelector('#s-res .members-only') || d.getElementById('res-q')) bad.push('signed out, Find 2 is not the members card alone');
    w.signedIn_(Object.assign({ success: true }, KEEP_SOL_), 'sol');
    await wait(80);
    t.go('res', false, true); w.paint('res'); await wait(100);
    if ((t.whoami() || {}).personId !== 'P12') return ['the child did not sign in: ' + JSON.stringify(t.whoami())];
    if (!d.getElementById('res-q') || d.querySelector('#s-res .members-only')) bad.push('signed in, Find 2 is not the finder');
  }
  /* ---- AN ADMIN, ON THE BOOKS SHELF IN FIND 2 (both finders hold it), SIGNS OUT ---- */
  {
    const b = await resBoot_({ before: win => { win.localStorage.setItem('familyUser', JSON.stringify({ name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-a' })); } });
    if (!b) return bad.concat(['the admin boot did not load — NOT checked']);
    const { w } = b, t = w.__t, d = w.document;
    t.go('res', false, true);
    t.RES().filters = [{ field: 'shelf', value: 'Writings' }];
    t.RES().q = 'genesis';
    w.paintFinder_('res');
    if (!/\bWritings\b/.test((d.getElementById('res-chips') || {}).textContent || '')) bad.push('the setup: the admin\'s Find 2 chips do not name the Writings shelf, so its going was NOT checked');
    t.ACTIONS.signout(d.createElement('button'));
    await wait(60);
    if (t.whoami()) bad.push('Sign out left somebody signed in');
    if (t.RES().filters.length || t.RES().q) bad.push('an admin signed out from the Books shelf left Find 2 holding ' + JSON.stringify(t.RES().filters) + ' "' + t.RES().q + '"');
    t.go('res', false, true); await wait(60);
    if (/\bWritings\b/.test((d.getElementById('res-chips') || {}).textContent || '')) bad.push('signed out, Find 2\'s chips still name the Writings shelf');
  }
  /* ---- A CHILD'S SESSION ENDS ON FIND 2: kept for them, not for the next child ---- */
  {
    const b = await resBoot_({ before: signedInAs_(KEEP_SOL_) });
    if (!b) return bad.concat(['the child boot did not load — NOT checked']);
    const { w } = b, t = w.__t;
    t.go('res', false, true);
    t.RES().filters = [{ field: 'shelf', value: 'Boxing' }];
    w.paintFinder_('res');
    w.signedOut_({ ended: true, quiet: true });
    if (JSON.stringify(t.RES().filters) !== JSON.stringify([{ field: 'shelf', value: 'Boxing' }])) bad.push('a session ending under the child emptied Find 2: ' + JSON.stringify(t.RES().filters));
    if (t.RES().whose !== 'P12') bad.push('the kept Find 2 does not say whose it is: ' + JSON.stringify(t.RES().whose));
    w.signedIn_(Object.assign({ success: true }, KEEP_SOL_), 'sol');
    if (JSON.stringify(t.RES().filters) !== JSON.stringify([{ field: 'shelf', value: 'Boxing' }])) bad.push('the same child signing in again lost Find 2\'s chips');
    if (t.RES().whose) bad.push('signed in, RES.whose still names ' + JSON.stringify(t.RES().whose));
    w.signedOut_({ ended: true, quiet: true });
    w.signedIn_(Object.assign({ success: true }, KEEP_KIT_), 'kit');
    if (t.RES().filters.length) bad.push('the next child signing in over a dead session is handed the last child\'s Find 2: ' + JSON.stringify(t.RES().filters));
  }
  return bad;
});

/* ---------- A KEPT CARD SAVED CANNOT DRAW WHOLE OPENS IN FIND § */
check('a kept card Saved cannot draw whole opens in Find: Saved\'s Open under a kept content card, boxer and project lands on its card in Find; a kept fight and question get none, and no card in a finder does', async () => {
  const b = await resBoot_({ before: signedInAs_(ANS_ADA) });
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  const all = w.stuffItemsAll_();
  /* A CONTENT CARD WITH AN ANIMATION: its words are on the card, the drawing is a page after it. */
  const book = all.find(x => x.kind === 'content' && x.key === 'ct:TB-GCSE-STATS-15');
  const boxer = all.find(x => x.kind === 'people' && x.boxKind === 'Fighters');
  const fight = all.find(x => x.kind === 'fight');
  const proj = all.find(x => x.kind === 'project');
  if (!book || !boxer || !fight || !proj) return ['no Probability content card, boxer, fight or project in the whole list — NOT checked'];
  const onCard = (x, when, next) => {
    if (t.AT() !== 'stuff') bad.push(when + ': the column in front is ' + t.AT() + ', not Find');
    const pg = w.stuffPages_()[pg_(t).stuff - w.stuffFirstResult_()];
    if (!pg || pg.x !== x || pg.part) bad.push(when + ': Find is on ' + (pg ? (pg.x && pg.x.name) + ':' + (pg.part || 'card') : 'no result') + ', not ' + x.name + '\'s card');
    const after = w.stuffPages_()[pg_(t).stuff - w.stuffFirstResult_() + 1];
    if (next && !(after && after.x === x && after.part === next)) bad.push(when + ': the page after the card is ' + (after ? (after.x && after.x.name) + ':' + (after.part || 'card') : 'nothing') + ', not its ' + next);
    if (w.stuffFiltered().indexOf(x) < 0) bad.push(when + ': Find\'s chips lose it: ' + JSON.stringify(t.STUFF().filters));
  };
  /* ---- IN A FINDER: the card is already open there, its pages a swipe up — no tile, either column ---- */
  const tileIn = html => { const el = d.createElement('div'); el.innerHTML = html; return el.querySelector('[data-do="find-open"]'); };
  [book, boxer, proj].forEach(x => {
    if (tileIn(w.stuffCard(x))) bad.push('a ' + x.kind + ' drawn in Find carries an Open tile to where it already is');
    if (inRes_(w, () => tileIn(w.stuffCard(x)))) bad.push('a ' + x.kind + ' drawn in Find 2 carries an Open tile');
  });
  /* ---- ON SAVED: star each, and Find 2 holds a place of its own that opening must not touch ---- */
  [book, boxer, fight, proj].forEach(x => { const el = d.createElement('div'); el.innerHTML = w.stuffCard(x); const fav = el.querySelector('[data-do="fav"]'); if (fav) A.fav(fav); });
  t.RES().filters = [{ field: 'kindLabel', value: 'Library' }]; t.RES().q = 'ali';
  const r0 = JSON.stringify([t.RES().filters, t.RES().q]);
  t.STUFF().filters = [{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Projects' }];
  t.go('saved', false, true); await wait(150); await woken_();
  const openOn = x => [...d.getElementById('s-saved').querySelectorAll('[data-do="find-open"]')].find(el => el.getAttribute('data-key') === x.key);
  if (openOn(fight)) bad.push('a fight kept on Saved has an Open tile — Saved draws it whole');
  /* A QUESTION, KEPT: whole on Saved (its opening, figure and answer are Saved's pages too). */
  const q = { kind: 'question', name: 'Q9(a)', qNumber: '9', qPart: 'a', marks: 2, key: 'q:Q-OPEN-9a',
              row: { row_id: 'Q-OPEN-9a', paper_id: 'P-OPEN', subject: 'Maths', name: 'Paper 1' }, stems: [],
              html: '<p>Work out PR.</p>', answer: '<b>5 cm</b>', accept: '5' };
  if (tileIn(w.keptPages_([q], 0).join(''))) bad.push('a question kept on Saved has an Open tile — Saved draws it whole');
  const forBook = openOn(book), forBoxer = openOn(boxer), forProj = openOn(proj);
  if (!forBook) return bad.concat(['the content card kept on Saved has no Open tile — its animation cannot be reached from there']);
  if (!/\bin Find\b/.test(forBook.getAttribute('aria-label') || forBook.textContent || '')) bad.push('the Open tile does not say it goes to Find: ' + JSON.stringify(forBook.getAttribute('aria-label') || forBook.textContent));
  if (/Find 2|Resources/.test(forBook.getAttribute('aria-label') || '')) bad.push('the Open tile names the wrong column: ' + JSON.stringify(forBook.getAttribute('aria-label')));
  A['find-open'](forBook);
  await wait(150);
  onCard(book, 'a content card opened from Saved', 'an15-bayes');
  if (JSON.stringify([t.RES().filters, t.RES().q]) !== r0) bad.push('opening from Saved changed Find 2\'s place: ' + JSON.stringify([t.RES().filters, t.RES().q]));
  for (const [x, tile, next] of [[boxer, forBoxer, w.pageParts_(boxer)[1]], [proj, forProj, w.pageParts_(proj)[1]]]) {
    if (!tile) { bad.push('the ' + x.kind + ' kept on Saved has no Open tile'); continue; }
    t.go('saved', false, true); await wait(120);
    const again = openOn(x);
    A['find-open'](again || tile);
    await wait(150);
    onCard(x, 'a ' + x.kind + ' opened from Saved', next);
  }
  return bad;
});

/* ---------- ONE MODEL FOR EVERY WRITTEN WORK (520): THE SET A FUNNEL ANSWERS OVER IS FIXED WHEN IT STARTS ---------- */
check('writings (520): answering Doesn\'t matter at every step never raises the count nor adds a kind, though every writing index arrives after the first answer — and a fresh start has them all', async () => {
  const held = [];
  const serve = url => {
    const m = /(?:^|\/)data\/(talmud|quran|hadith|works|texts|pdtexts|orthodox|hymns|bible)\/index\.json(?:\?|$)/.exec(url);
    if (m) {
      const p = path.join(dir, '..', 'data', m[1], 'index.json');
      return new Promise(r => held.push(() => r(JSON.parse(fs.readFileSync(p, 'utf8')))));
    }
    /* EVERYTHING ELSE AT ONCE, the library's words put back as on the live site. */
    const any = /(?:^|\/)(data\/[a-z0-9_\-\/]+\.json)(?:\?|$)/.exec(url);
    if (!any) return undefined;
    const p = path.join(dir, '..', any[1]);
    try { return JSON.parse(LIB_FULL.serve(p) || fs.readFileSync(p, 'utf8')); } catch (e) { return undefined; }
  };
  const adult = Object.assign({}, MEMBER_, { profile: { dob_d: '2', dob_m: '3', dob_y: String(new Date().getFullYear() - 30) } });
  const b = boot({ serve, before: signedInAs_(adult) });
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  if (!b.w.__t) return ['the app did not boot — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, bad = [];
  t.go('stuff');
  w.paintStuff();
  await wait(100);
  const seen = () => { const f = w.stuffFind(w.stuffItems()); return { n: f.length, kinds: new Set(f.map(x => x.kind)) }; };
  /* DOESN'T MATTER, PRESSED THROUGH THE REAL HANDLER on whatever the funnel asks next. */
  const asked = () => { try { return w.nextFacet(w.stuffFiltered()); } catch (e) { return null; } };
  const skip = () => { const f = asked(); return f ? { click: () => t.ACTIONS['facet-skip']({ dataset: { field: f.field } }) } : null; };
  for (let i = 0; i < 60 && !skip(); i++) await wait(50);
  for (let i = 0; i < 80 && w.stuffItems().length < 1000; i++) await wait(50);
  if (!skip()) return ['Find asks no question at the start — NOT checked (' + w.stuffItems().length + ' items)'];
  skip().click();
  await wait(60);
  if (!held.length) bad.push('no writing index was asked for before the first answer — a late arrival was NOT exercised');
  let last = seen(), steps = 0;
  /* EVERY INDEX ARRIVES NOW, after the first answer: none of them may join this funnel. */
  held.splice(0).forEach(f => f());
  await wait(200);
  for (; steps < 40; steps++) {
    const now = seen(), added = [...now.kinds].filter(k => !last.kinds.has(k));
    if (now.n > last.n) bad.push('step ' + (steps + 1) + ': ' + last.n + ' cards became ' + now.n + ' on a Doesn\'t matter');
    if (added.length) bad.push('step ' + (steps + 1) + ': Doesn\'t matter added the kinds ' + added.join(', '));
    last = now;
    held.splice(0).forEach(f => f());
    if (!skip()) break;
    skip().click();
    await wait(60);
  }
  if (steps < 2) bad.push('only ' + steps + ' questions were answered Doesn\'t matter — the funnel was NOT walked');
  /* A FRESH START (no chip, no words) has every writing that came. */
  t.STUFF().filters = [];
  t.STUFF().q = '';
  w.paintStuff();
  await wait(100);
  const fresh = seen().kinds, want = ['bible', 'talmud', 'quran', 'hadith', 'worktext', 'writ', 'pdtext', 'orthotext', 'hymn'];
  const missing = want.filter(k => !fresh.has(k));
  if (missing.length) bad.push('a fresh start does not have ' + missing.join(', ') + ' though their indexes came');
  return bad;
});

/* ---------- THE HISTORY DATABASE (459): EACH KIND FOUND BY THE FUNNEL, ITS CARD OPENED, A LINK FOLLOWED IN PLACE ---------- */
check('the Talmud (473, 490): Berakhot 2a is a card of its own found under Learning, Library, Talmud, Zeraim, Berakhot, Chapter 1, Daf 2, Side a; the card itself draws the Vilna page from the real files, and its text-size tiles are remembered', async () => {
  const tdir = path.join(dir, '..', 'data', 'talmud');
  const serve = url => {
    const m = /(?:^|\/)data\/talmud\/([a-z-]+\/\d+\.json|index\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    const p = path.join(tdir, m[1]);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };
  const adult = Object.assign({}, MEMBER_, { profile: { dob_d: '2', dob_m: '3', dob_y: String(new Date().getFullYear() - 30) } });
  const b = boot({ serve, before: signedInAs_(adult) });
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  if (!b.w.__t) return ['the app did not boot — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, bad = [];
  if (typeof w.talmudItems_ !== 'function') return ['talmudItems_ is not declared — js/talmud.js did not load'];
  t.go('stuff');
  w.paintStuff();
  for (let i = 0; i < 80 && !w.talmudItems_().length; i++) await wait(25);
  if (!w.talmudItems_().length) return ['data/talmud/index.json never arrived — fetched: ' + b.gets.filter(u => /talmud/.test(u)).join(', ')];
  const x = w.stuffItemsAll_().find(y => y.key === 'tal:berakhot:2a');
  if (!x) return ['Berakhot 2a is not on the list of everything — NOT checked'];
  if (!w.stuffItemsAll_().some(y => y.key === 'tal:berakhot:2b')) bad.push('Berakhot 2b is not a card of its own');
  /* SUBJECT FIRST IN THE LIBRARY (494): "the library should go subject first"; under Religious Studies, which book before the Talmud's own. */
  const order = w.facetList().map(f => f.field), at = f => order.indexOf(f);
  if (!(at('kindLabel') < at('subject') && at('subject') < at('shelf') && at('shelf') < at('wWork') && at('wWork') < at('wSection') && at('wWork') < at('wText')))
    bad.push('the funnel does not ask What kind, Subject, Shelf, Which book, then each book’s own: ' + ['kindLabel', 'subject', 'shelf', 'wWork', 'wSection', 'wText'].map(f => f + '@' + at(f)).join(' '));
  if (x.subject !== 'Religious Studies' || x.shelf !== 'Writings' || x.w.work !== 'Talmud') bad.push('Berakhot 2a is ' + [x.subject, x.shelf, x.w.work].join(', ') + ' — wanted Religious Studies, on Writings, the Talmud (494)');
  t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' }, { field: 'shelf', value: 'Writings' }, { field: 'wWork', value: 'Talmud' },
    { field: 'wSection', value: 'Zeraim' }, { field: 'wBook', value: 'Berakhot' }, { field: 'wChapter', value: x.w.chapter },
    { field: 'wUnit', value: '2a' }];
  const got = w.stuffFiltered();
  if (got.length !== 1 || got[0] !== x) bad.push('the eight answers keep ' + got.length + ' thing(s), not Berakhot 2a alone');
  if (x.w.chapter !== 'Chapter 1 · מאימתי') bad.push('Berakhot 2a is in "' + x.w.chapter + '", not Chapter 1 · מאימתי');
  const walk = w.finderWalk_(x);
  t.STUFF().filters = walk;
  if (w.stuffFiltered().indexOf(x) < 0) bad.push('the funnel\'s own walk loses Berakhot 2a: ' + JSON.stringify(walk));
  const el = d.createElement('div'); el.innerHTML = w.stuffCard(x) + w.cardTiles_(x);
  d.body.appendChild(el);
  if (!el.querySelector('.card.tal .tal-card-page')) return bad.concat(['Berakhot 2a draws no page on its card']);
  if (el.querySelector('[data-do="tal-open"]')) bad.push('the card still has a tile to open the page — the card is the page (490)');
  w.talCardsFit_(el);
  for (let i = 0; i < 80 && !el.querySelector('.tal-card-page .tal-body'); i++) await wait(25);
  if (!el.querySelector('.tal-body')) return bad.concat(['the card never drew its page — fetched: ' + b.gets.filter(u => /talmud/.test(u)).join(', ')]);
  const txt = s2 => ((el.querySelector(s2) || {}).textContent || '').trim();
  if (!/מאימתי קורין את שמע בערבין/.test(txt('.tal-gem'))) bad.push('the Gemara of 2a does not open with the Mishnah');
  if (!txt('.tal-rashi')) bad.push('2a has no Rashi');
  if (!txt('.tal-tos')) bad.push('2a has no Tosafot');
  if (!/ברכות/.test(txt('.tal-head')) || !/ב\./.test(txt('.tal-hd-daf'))) bad.push('the header does not say ברכות and ב.');
  if (!/CC BY-SA/.test(txt('.tal-credit'))) bad.push('the page carries no attribution line');
  if (!el.querySelector('.tal-body.tal-a')) bad.push('2a is not laid out as an a side (Rashi inner, on the right)');
  const up = el.querySelector('[data-do="tal-size"][data-by="1"]');
  if (!up || !el.querySelector('[data-do="tal-size"][data-by="-1"]')) return bad.concat(['the card has no text-size tiles']);
  t.ACTIONS['tal-size'](up);
  if (w.localStorage.getItem('tal:scale') !== '1.15') bad.push('Text + did not remember a larger size: ' + w.localStorage.getItem('tal:scale'));
  return bad;
});

/* ---------- AN AGE LIMIT (490): the Talmud and the Quran carry min_age 18 — a child, an adult with no date of birth and a signed-out visitor are never sent them ---------- */
check('an age limit (490, 504): a ten-year-old, a member with no date of birth and a signed-out visitor are never shown or sent the Talmud, the Quran or the Bible; an adult is shown all three; an item with min_age is hidden alike', async () => {
  const serve = url => {
    const m = /(?:^|\/)data\/(talmud|quran|bible)\/([a-z0-9-]+\/[a-z0-9-]+\.json|[a-z0-9-]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    const p = path.join(dir, '..', 'data', m[1], m[2]);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };
  const y = new Date().getFullYear();
  const who = [['a ten-year-old', Object.assign({}, MEMBER_, { profile: { dob_d: '1', dob_m: '1', dob_y: String(y - 10) } }), false],
               ['a member with no date of birth', MEMBER_, false],
               ['a signed-out visitor', null, false],
               ['an adult', Object.assign({}, MEMBER_, { profile: { dob_d: '1', dob_m: '1', dob_y: String(y - 30) } }), true]];
  const bad = [];
  for (const [what, u, ok] of who) {
    const b = boot({ serve, before: u ? signedInAs_(u) : (() => {}) });
    for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
    if (!b.w.__t) { bad.push(what + ': the app did not boot — NOT checked'); continue; }
    const { w } = b, t = w.__t;
    t.go('stuff'); w.paintStuff();
    for (let i = 0; i < 160 && ok && !(w.talmudItems_().length && w.quranItems_().length && w.bibleItems_().length); i++) await wait(25);
    if (!ok) await wait(150);
    const all = w.stuffItemsAll_();
    const kinds = k => all.filter(x => x.kind === k).length;
    const sent = b.gets.filter(g => /data\/(talmud|quran|bible)\//.test(g));
    if (ok) {
      if (!kinds('talmud') || !kinds('quran')) bad.push(what + ' is not shown the Talmud (' + kinds('talmud') + ') and the Quran (' + kinds('quran') + ')');
      /* PUBLIC NOW (504): "bible should also be in there as it's open source" — `kjv-admin` is Universal until the owner switches it. */
      if (!kinds('bible')) bad.push(what + ' is not shown the Bible — it is open to anyone of age since 504');
    } else {
      if (kinds('talmud') || kinds('quran') || kinds('bible')) bad.push(what + ' is shown ' + ['talmud', 'quran', 'bible'].map(k => kinds(k) + ' ' + k).join(', '));
      if (sent.length) bad.push(what + ' was sent ' + sent.join(', '));
    }
    if (w.itemAgeOk_({ min_age: 18 }) !== ok) bad.push(what + ': an item with min_age 18 is ' + (ok ? 'hidden' : 'shown'));
    if (!w.itemAgeOk_({ row: {} })) bad.push(what + ': an item with no min_age is hidden');
  }
  return bad;
});

/* ---------- GCSE TOPICS FOR GCSE AGES (505): GCSE history, RS, psychology, sociology and the history database are 14+ by one derived rule ---------- */
check('GCSE topics for GCSE ages (505): a 12-year-old, a member with no date of birth and a visitor see no GCSE History question or card and no WW2 timeline; a 15-year-old and the admin do; a KS3 history item stays open to the 12-year-old', async () => {
  const y = new Date().getFullYear();
  const at = n => Object.assign({}, MEMBER_, { profile: { dob_d: '1', dob_m: '1', dob_y: String(y - n) } });
  const ADMIN = { name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], rank: 'admin', token: 'tk' };
  const who = [['a 12-year-old', at(12), false], ['a member with no date of birth', MEMBER_, false], ['a signed-out visitor', null, false],
               ['a 15-year-old', at(15), true], ['the admin', ADMIN, true]];
  const p0 = await resPayload_();
  if (!p0) return ['the app did not load — NOT checked'];
  const one = boot();
  for (let i = 0; i < 80 && typeof one.w.libraryExtras_ !== 'function'; i++) await wait(25);
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { figures: read('figures'), writings: read('writings'), timeline: read('timeline') })));
  const bad = [];
  for (const [what, u, ok] of who) {
    const payload = Object.assign(JSON.parse(JSON.stringify(p0)), { figures: made.figures || [], writings: made.writings || [], timeline: made.timeline || [] });
    const b = boot({ payload, before: u ? signedInAs_(u) : (() => {}) });
    for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
    await wait(250);
    if (!b.w.__t) { bad.push(what + ': the app did not boot — NOT checked'); continue; }
    const { w } = b;
    w.__t.go('stuff'); w.paintStuff();
    const raw = w.stuffItemsRaw_(), all = w.stuffItemsAll_();
    const gated = raw.filter(x => w.gcseAgeOf_(x) === 14);
    const hist = gated.filter(x => /histor/i.test(x.subject || '') && !x.hdb);
    const tl = raw.filter(x => x.kind === 'timeline' && x.era === 'World War 2');
    if (!hist.length || !tl.length) { bad.push(what + ': no GCSE History item (' + hist.length + ') or WW2 timeline (' + tl.length + ') to ask about (of ' + raw.length + ') — NOT checked'); continue; }
    const keys = new Set(all.map(x => x.key)), shown = x => keys.has(x.key);
    if (hist.some(shown) !== ok || hist.every(shown) !== ok) bad.push(what + (ok ? ' is not shown' : ' is shown') + ' GCSE History (' + hist.filter(shown).length + ' of ' + hist.length + ')');
    if (shown(tl[0]) !== ok) bad.push(what + (ok ? ' is not shown' : ' is shown') + ' the WW2 timeline');
    const ks3 = { kind: 'content', subject: 'History', level: 'KS3', name: 'The Norman Conquest', row: {} };
    if (w.gcseAgeOf_(ks3) || !w.itemAgeOk_(ks3)) bad.push(what + ': a KS3 History item is age-limited');
    const gq = { kind: 'question', subject: 'History', level: 'GCSE', name: 'Paper 1', row: {} };
    if (w.itemAgeOk_(gq) !== ok) bad.push(what + ': a GCSE History question is ' + (ok ? 'hidden' : 'shown'));
    if (what === 'the admin' && process.env.GCSE_AGE_COUNTS) {
      const c = {}; gated.forEach(x => { const k = (x.hdb ? 'History database' : x.subject || '?') + ' / ' + x.kind; c[k] = (c[k] || 0) + 1; });
      console.log('GCSE_AGE_COUNTS ' + JSON.stringify(c));
    }
  }
  return bad;
});

/* ---------- THE QURAN (490): a verse a card, its tags ordinary facets, its text fetched when its card is drawn ---------- */
check('the Quran (490): Al-Baqara 2:255 is a card of its own under Learning, Library, Quran, Surah, Ayah — tagged Juz 3 and Medinan — and its card draws the Arabic and Pickthall\'s English from the real files', async () => {
  const serve = url => {
    const m = /(?:^|\/)data\/quran\/([0-9]{3}\.json|index\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    const p = path.join(dir, '..', 'data', 'quran', m[1]);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };
  const adult = Object.assign({}, MEMBER_, { profile: { dob_d: '2', dob_m: '3', dob_y: String(new Date().getFullYear() - 30) } });
  const b = boot({ serve, before: signedInAs_(adult) });
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  if (!b.w.__t) return ['the app did not boot — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, bad = [];
  t.go('stuff'); w.paintStuff();
  for (let i = 0; i < 80 && !w.quranItems_().length; i++) await wait(25);
  /* ONE CARD, ONE LANGUAGE (504): the Arabic and Pickthall's English are a card each. */
  if (w.quranItems_().length !== 6236 * 2) return ['the Quran holds ' + w.quranItems_().length + ' cards, not 6236 verses in two languages — fetched: ' + b.gets.filter(u => /quran/.test(u)).join(', ')];
  if (b.gets.some(u => /quran\/\d{3}\.json/.test(u))) bad.push('a surah\'s text was fetched before any card of it was drawn');
  const x = w.stuffItemsAll_().find(y => y.key === 'qr:2:255');
  if (!x) return bad.concat(['Al-Baqara 2:255 is not on the list of everything']);
  if (x.w.section !== 'Juz 3') bad.push('2:255 is tagged ' + x.w.section + ' — not Juz 3');
  /* AN OLD STAR (504): `qr:2:255` was the two-language card; it is the Arabic one now. */
  if (x.w.text !== 'Arabic, Tanzil') bad.push('the old key qr:2:255 is the ' + x.w.text + ' card, not the Arabic');
  t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' }, { field: 'shelf', value: 'Writings' }, { field: 'wWork', value: 'Quran' },
    { field: 'wLanguage', value: 'Arabic' }, { field: 'wText', value: 'Tanzil' }, { field: 'wChapter', value: '2 · Al-Baqara' }, { field: 'wUnit', value: '255' }];
  const got = w.stuffFiltered();
  if (got.length !== 1 || got[0] !== x) bad.push('the six answers keep ' + got.length + ' thing(s), not 2:255 alone');
  const el = d.createElement('div'); el.innerHTML = w.stuffCard(x); d.body.appendChild(el);
  const tags = [...el.querySelectorAll('.qtag')].map(q => q.getAttribute('data-f'));
  ['wText', 'wChapter', 'wUnit', 'wSection'].forEach(f => { if (tags.indexOf(f) < 0) bad.push('the card has no ' + f + ' tag: ' + tags.join(', ')); });
  for (let i = 0; i < 80 && !el.querySelector('.qr-ar'); i++) await wait(25);
  if (!el.querySelector('.qr-ar')) return bad.concat(['the card never drew its verse']);
  const want = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'quran', '002.json'), 'utf8')).ar[254];
  if (el.querySelector('.qr-ar').textContent.indexOf(want) !== 0) bad.push('the Arabic is not the Throne Verse: ' + el.querySelector('.qr-ar').textContent.slice(0, 40));
  if (el.querySelector('.qr-en')) bad.push('the Arabic card draws the English too — one card is one language');
  if (!/Tanzil/.test((el.querySelector('.qr-credit') || {}).textContent || '')) bad.push('the verse carries no attribution');
  const en = w.stuffItemsAll_().find(y => y.key === 'qr:en:2:255');
  if (!en || en.w.text !== 'English, Pickthall (1930)') return bad.concat(['there is no English (Pickthall) card qr:en:2:255']);
  const e2 = d.createElement('div'); e2.innerHTML = w.stuffCard(en); d.body.appendChild(e2);
  for (let i = 0; i < 80 && !e2.querySelector('.qr-en'); i++) await wait(25);
  if (!/Allah! There is no deity save Him/.test((e2.querySelector('.qr-en') || {}).textContent || '')) bad.push('the English card is not Pickthall\'s 2:255');
  if (e2.querySelector('.qr-ar')) bad.push('the English card draws the Arabic too — one card is one language');
  return bad;
});

/* ---------- ONE VERSE, ONE TEXT (504): the Bible offered to an adult client; KJV and WEB a card each; the dots under Which writing end ---------- */
check('one verse, one text (504): an adult client is offered the Bible under Which writing, the dots there end, and Genesis 1:1 is a KJV card and a WEB card, each one text with its Text tag', async () => {
  const serve = url => {
    const m = /(?:^|\/)data\/(talmud|quran|bible|hadith|works)\/([a-z0-9-]+\/[a-z0-9-]+\.json|[A-Za-z0-9-]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    const p = path.join(dir, '..', 'data', m[1], m[2]);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };
  const adult = Object.assign({}, MEMBER_, { profile: { dob_d: '2', dob_m: '3', dob_y: String(new Date().getFullYear() - 30) } });
  const b = boot({ serve, before: signedInAs_(adult) });
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  if (!b.w.__t) return ['the app did not boot — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, bad = [];
  t.go('stuff'); w.paintStuff();
  for (let i = 0; i < 200 && !(w.bibleItems_().length && w.quranItems_().length && w.talmudItems_().length && w.hadithItems_().length); i++) await wait(25);
  if (!w.bibleItems_().length) return ['the Bible never came for an adult client — fetched: ' + b.gets.filter(u => /bible/.test(u)).join(', ')];
  t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' }, { field: 'subject', value: 'Religious Studies' }, { field: 'shelf', value: 'Writings' }];
  const items = w.stuffFiltered(), facet = w.nextFacet(items);
  /* RELIGION FIRST (546): "why is religion not coming up" — then Which writing, under Christianity. */
  if (!facet || facet.field !== 'wReligion') return bad.concat(['under Writings the next question is ' + (facet && facet.field) + ', not Religion']);
  t.STUFF().filters.push({ field: 'wReligion', value: 'Christianity' });
  const vR = w.facetValues(items, facet).map(v => String(v.value));
  ['Christianity', 'Islam', 'Judaism'].forEach(k => { if (vR.indexOf(k) < 0) bad.push('Religion does not offer ' + k + ': ' + vR.join(', ')); });
  t.STUFF().filters.pop();
  if (facet.label !== 'Religion') bad.push('the question is labelled ' + facet.label);
  const work = w.facetList().find(f => f.field === 'wWork'), vals = w.facetValues(items, work).map(v => String(v.value));
  if (work.label !== 'Work') bad.push('Which writing is labelled ' + work.label);
  /* The Hadith's six books are Works of the Hadith collection since 600, so a book stands for it. */
  ['Bible', 'Quran', 'Talmud', 'Sahih al-Bukhari'].forEach(k => { if (vals.indexOf(k) < 0) bad.push('Which writing does not offer ' + k + ': ' + vals.join(', ')); });
  if (w.scriptureWait_(items) !== '') bad.push('with every index in, the dots under Which writing still stand: ' + w.scriptureWait_(items));
  const k = w.stuffItemsAll_().find(y => y.key === 'bible:kjv:1:1:1'), e = w.stuffItemsAll_().find(y => y.key === 'bible:web:1:1:1');
  if (!k || !e) return bad.concat(['Genesis 1:1 is not a KJV card and a WEB card']);
  if (k.bb.translation !== 'KJV' || e.bb.translation !== 'WEB') bad.push('their Text tags are ' + k.bb.translation + ', ' + e.bb.translation);
  for (const [x, want, not] of [[k, /In the beginning God created the heaven/, /created the heavens/], [e, /created the heavens/, /created the heaven and/]]) {
    const el = d.createElement('div'); el.innerHTML = w.stuffCard(x); d.body.appendChild(el);
    for (let i = 0; i < 120 && !el.querySelector('.bb-v'); i++) await wait(25);
    const txt = [...el.querySelectorAll('.bb-v')].map(v => v.textContent).join(' | ');
    if (el.querySelectorAll('.bb-v').length !== 1) bad.push(x.key + ' draws ' + el.querySelectorAll('.bb-v').length + ' verses — one card is one text');
    if (!want.test(txt) || not.test(txt)) bad.push(x.key + ' draws "' + txt.slice(0, 80) + '"');
    if ([...el.querySelectorAll('.qtag')].map(q => q.getAttribute('data-f')).indexOf('wText') < 0) bad.push(x.key + ' has no Text tag');
  }
  return bad;
});

/* ---------- A MANUSCRIPT AS IT LOOKS (490): tags first, the drawing, then the facts ---------- */
check('a manuscript card (490): Papyrus 52 leads with its tags, then a drawing of the fragment, then one line of when it was found, dated to and held', async () => {
  const b = boot({});
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  if (!b.w.__t) return ['the app did not boot — NOT checked'];
  const { w } = b, d = w.document, bad = [];
  const rows = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'manuscripts.json'), 'utf8'));
  const r = rows.find(q => q.id === 'MS-0001');
  if (!r) return ['data/manuscripts.json has no MS-0001 — NOT checked'];
  const el = d.createElement('div'); el.innerHTML = w.histCard_({ kind: 'manuscript', name: r.name, key: 'hdb:MS-0001', row: r, histKind: 'Manuscripts' });
  const card = el.firstElementChild;
  if (!card || !card.firstElementChild || !card.firstElementChild.matches('.qcard-tags')) bad.push('the card does not start with its tags');
  if (card && card.querySelector('h3')) bad.push('the card still has a title');
  const svg = card && card.querySelector('.hdb-ms svg');
  if (!svg || !svg.querySelector('clipPath path') || !svg.querySelectorAll('text').length) bad.push('the card has no drawing of the fragment');
  /* ONE SIDE A CARD (507): the front card draws the recto alone; only letters that survive -- a whole line of 30 would be the old guess. */
  if (card && card.querySelectorAll('.hdb-ms-side svg').length !== 1) bad.push('the card draws ' + card.querySelectorAll('.hdb-ms-side svg').length + ' sides, not one');
  if (!/Recto/.test((card && card.querySelector('.hdb-ms-side figcaption') || {}).textContent || '')) bad.push('the front card does not draw the recto');
  /* THE OTHER SIDE IS ITS OWN ITEM (507): Front and Back tags, the bare key the Front's (a saved key still opens), the facts line on both. */
  const its = w.histItems_('manuscript', r);
  if (its.length !== 2 || its[0].msSide !== 'Front (recto)' || its[1].msSide !== 'Back (verso)' || its[0].key !== 'hdb:MS-0001' || its[1].key !== 'hdb:MS-0001:back')
    bad.push('Papyrus 52 is not two items, Front at hdb:MS-0001 and Back at hdb:MS-0001:back: ' + JSON.stringify(its.map(i => [i.key, i.msSide])));
  else {
    const e2 = d.createElement('div'); e2.innerHTML = w.histCard_(its[1]);
    if (!/Verso/.test((e2.querySelector('.hdb-ms-side figcaption') || {}).textContent || '') || e2.querySelectorAll('.hdb-ms-side svg').length !== 1) bad.push('the back card does not draw the verso alone');
    if (!/Held: John Rylands/.test((e2.querySelector('.hdb-facts') || {}).textContent || '')) bad.push('the back card has no facts line');
    if (!e2.querySelector('.qtag[data-f="histSide"]')) bad.push('the back card carries no Side tag');
  }
  const ca = rows.find(q => q.id === 'MS-0002');
  if (ca && JSON.stringify(w.histItems_('manuscript', ca).map(i => i.msSide)) !== '["Back (verso)"]') bad.push('Codex Alexandrinus fol. 41v is not one Back (verso) card');
  if (svg && svg.querySelectorAll('text').length > 80) bad.push('the recto draws ' + svg.querySelectorAll('text').length + ' letters; about 60 survive');
  const facts = (card && card.querySelector('.hdb-facts') || {}).textContent || '';
  if (!/Found: .*1920/.test(facts) || !/Dated: /.test(facts) || !/Held: John Rylands Library/.test(facts)) bad.push('the facts line says "' + facts + '"');
  return bad;
});

check('the history database: a manuscript and a historical figure are each found, a writing is its pages (520), under Learning, Content, History, open as a card of label and value lines, and a link tile lands on the linked row\'s card in the same finder', async () => {
  /* THE REAL FILES, through the app's own `libraryExtras_`, on the resources payload. */
  const p = await resPayload_();
  if (!p) return ['the app did not load — NOT checked'];
  const one = boot();
  for (let i = 0; i < 80 && typeof one.w.libraryExtras_ !== 'function'; i++) await wait(25);
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { manuscripts: read('manuscripts'), figures: read('figures'), writings: read('writings') })));
  const hp = Object.assign(p, { manuscripts: made.manuscripts || [], figures: made.figures || [], writings: made.writings || [] });
  /* THE RELIGIOUS ROWS ARE 18+ (499): a member of no known age is not given Papyrus 52, Codex Alexandrinus, Clement or First Clement; an adult is. */
  const young = boot({ payload: JSON.parse(JSON.stringify(hp)), member: true });
  for (let i = 0; i < 80 && !young.w.__t; i++) await wait(25);
  await wait(250);
  const youngHas = young.w.__t ? young.w.stuffItemsAll_().filter(x => /^hdb:(MS-0001|MS-0002|FIG-0003|WR-0001)$/.test(x.key)).map(x => x.key) : ['(did not boot)'];
  /* THE WORKS' PAGES SERVED (520): a writing is its pages, so a link to WR-0001 lands on First Clement's first page. */
  const serveWorks = url => {
    const m = /(?:^|\/)data\/works\/([A-Za-z0-9-]+\.json)(?:\?|$)/.exec(url);
    return m ? JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'works', m[1]), 'utf8')) : undefined;
  };
  const b = boot({ payload: hp, serve: serveWorks, before: signedInAs_(Object.assign({}, MEMBER_, { profile: { dob_d: '1', dob_m: '1', dob_y: String(new Date().getFullYear() - 30) } })) });
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  await wait(250);
  if (!b.w.__t) return ['the app did not boot — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  t.go('stuff'); w.paintStuff();
  for (let i = 0; i < 80 && !w.stuffItemsAll_().some(x => x.key === 'wt:WR-0001:English:0'); i++) await wait(25);
  if (youngHas.length) bad.push('a member of no known age is given ' + youngHas.join(', ') + ' — religious rows are 18+ (499)');
  const all = w.stuffItemsAll_();
  const get = id => all.find(x => x.key === 'hdb:' + id);
  const ms = get('MS-0002'), fig = get('FIG-0003'), wr = all.find(x => x.key === 'wt:WR-0001:English:0');
  if (!ms || !fig || !wr) return ['MS-0002, FIG-0003 or First Clement\'s first page is not in the list — data/manuscripts|figures.json or data/works did not load, NOT checked'];
  if (get('WR-0001')) bad.push('First Clement is still a profile row beside its pages (520)');
  const onCard = (x, when) => {
    const pg = w.stuffPages_()[pg_(t).stuff - w.stuffFirstResult_()];
    if (!pg || pg.x !== x || pg.part) bad.push(when + ': Find is on ' + (pg ? (pg.x && pg.x.name) + ':' + (pg.part || 'card') : 'no result') + ', not ' + x.name + '\'s card');
  };
  for (const [x, kind] of [[ms, 'Manuscripts'], [fig, 'People']]) {
    /* THE FUNNEL ITSELF: these four answers keep it, and the walk the funnel asks reaches it. */
    t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' },
                         { field: 'shelf', value: 'History' }, { field: 'histKind', value: kind }];
    if (w.stuffFiltered().indexOf(x) < 0) bad.push(x.name + ' is not found by Learning, Content, History, ' + kind);
    if (w.stuffFiltered().some(y => !y.hdb)) bad.push('History, ' + kind + ' keeps a thing that is not in the history database');
    const walk = w.finderWalk_(x);
    t.STUFF().filters = walk;
    if (w.stuffFiltered().indexOf(x) < 0) bad.push(x.name + ' is lost by the funnel\'s own walk: ' + JSON.stringify(walk));
    /* THE CARD: its name, its tags, one line per field, an era tag; a person (batch D) is the portrait under the tags, nothing else. */
    const el = d.createElement('div'); el.innerHTML = w.stuffCard(x);
    if (x.kind === 'people') {
      const pc = el.querySelector('.card.person');
      if (!pc || !pc.firstElementChild.matches('.qtags') || pc.querySelectorAll('svg.pp').length !== 1 || pc.querySelector('h3, dl, p')) bad.push(x.name + '\'s card is not its tags over one portrait');
      if (!el.querySelector('.qtag[data-f="histEra"]')) bad.push(x.name + '\'s card carries no era tag');
      continue;
    }
    const h3 = el.querySelector('.hdb .fc-head h3');
    /* A DRAWN MANUSCRIPT (490) leads with its tags and is named by its aria-label instead. */
    const drawn = el.querySelector('.hdb-msc');
    if (drawn ? drawn.getAttribute('aria-label') !== x.name || !drawn.firstElementChild.matches('.qtags')
              : (!h3 || h3.textContent.trim() !== x.name)) bad.push(x.name + '\'s card is not headed with its name');
    /* NO CARD TALLER THAN A PHONE (562): the lines a card does not keep are its pages after it, so the card and its pages together have them. */
    const lines = el.querySelectorAll('.hdb-lines dl > div').length
      + w.pageParts_(x).filter(p => /^facts\d+$/.test(String(p))).reduce((n, p) => { const e = d.createElement('div'); e.innerHTML = w.stuffPart_(x, p); return n + e.querySelectorAll('.hdb-lines dl > div').length; }, 0);
    if (lines < 4) bad.push(x.name + '\'s card and its pages have fewer than four label/value lines');
    if (!el.querySelector('.qtag[data-f="histEra"]')) bad.push(x.name + '\'s card carries no era tag');
    if (el.querySelector('.hdb-lines dd select, .hdb-lines dd input')) bad.push(x.name + '\'s card has a control in a line');
  }
  const eras = w.histEras_;
  if (JSON.stringify(eras(400, 500)) !== '["Ancient"]' || JSON.stringify(eras(-100, -44)) !== '["Ancient"]'
      || JSON.stringify(eras(1874, 1965)) !== '["Modern"]' || JSON.stringify(eras(null, 99)) !== '["Ancient"]'
      || JSON.stringify(eras(1400, 1600)) !== '["Medieval","Early modern"]') bad.push('histEras_ puts years in the wrong eras');
  /* OPEN THE WRITING, THEN FOLLOW ITS TILES: to its manuscript, from there back to it, and on to its author. */
  const press = (x, toId) => {
    const s = d.getElementById('s-stuff');
    const box = d.createElement('div'); box.innerHTML = w.stuffCard(x); s.appendChild(box);
    const to = toId === 'WR-0001' ? wr.key : 'hdb:' + toId;
    const tile = [...box.querySelectorAll('[data-do="find-open"]')].find(e => e.getAttribute('data-key') === to);
    if (!tile) { bad.push(x.name + '\'s card has no tile to ' + toId); box.remove(); return false; }
    A['find-open'](tile); box.remove(); return true;
  };
  /* THE PAGE CARRIES THE WORK'S FACTS (520): its author and its era are tags. */
  const wel = d.createElement('div'); wel.innerHTML = w.stuffCard(wr);
  if (!wel.querySelector('.qtag[data-f="histEra"]')) bad.push('First Clement\'s page carries no era tag');
  if (!wel.querySelector('.qtag[data-f="wAuthor"]')) bad.push('First Clement\'s page carries no author tag');
  const opener = d.createElement('button'); opener.setAttribute('data-key', ms.key); d.getElementById('s-stuff').appendChild(opener);
  A['find-open'](opener); await wait(120);
  onCard(ms, 'the manuscript opened');
  if (press(ms, 'WR-0001')) { await wait(120); onCard(wr, 'the manuscript\'s Writing tile'); }
  if (t.AT() !== 'stuff') bad.push('following links left Find for ' + t.AT());
  return bad;
});

/* ---------- THE TIMELINE (461): EVENTS FOUND AS A FOURTH KIND, THE WORLD WAR 2 CARD LISTS THEM IN DATE ORDER, EVERY TILE LANDS IN PLACE ---------- */
check('the history timeline: events are found under Learning, Content, History, Events, the timeline under Learning, Timeline (545); the World War 2 timeline card lists every event in date order as a tile to its card, an event links to its figure and back, and the Animation tile opens the chapter with the drawing', async () => {
  const p = await resPayload_();
  if (!p) return ['the app did not load — NOT checked'];
  const one = boot();
  for (let i = 0; i < 80 && typeof one.w.libraryExtras_ !== 'function'; i++) await wait(25);
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { figures: read('figures'), writings: read('writings'), timeline: read('timeline') })));
  const b = boot({ payload: Object.assign(p, { figures: made.figures || [], writings: made.writings || [], timeline: made.timeline || [] }), before: signedInAs_(Object.assign({}, MEMBER_, { profile: { dob_d: '1', dob_m: '1', dob_y: String(new Date().getFullYear() - 30) } })) });   // an adult: the history database is 14+ (505)
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  await wait(250);
  if (!b.w.__t) return ['the app did not boot — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  const all = w.stuffItemsAll_();
  const tl = all.find(x => x.kind === 'timeline' && x.name === 'World War 2 timeline');
  const evs = read('timeline').filter(e => e.era === 'World War 2');
  if (!tl || evs.length < 20) return ['no World War 2 timeline item, or data/timeline.json has fewer than 20 of its events — NOT checked'];
  const get = id => all.find(x => x.key === 'hdb:' + id);
  t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' },
                       { field: 'shelf', value: 'History' }, { field: 'histKind', value: 'Events' }];
  const found = w.stuffFiltered();
  /* A TIMELINE IS IN LIBRARY › HISTORY (610), and Which says Timeline. */
  if (found.indexOf(tl) < 0) bad.push('the timeline is not under Library, History (610)');
  t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Timeline' }];
  if (w.stuffFiltered().indexOf(tl) < 0) bad.push('the timeline is not found by Learning, Timeline');
  const lost = evs.filter(e => found.indexOf(get(e.id)) < 0).map(e => e.id);
  if (lost.length) bad.push(lost.length + ' event(s) not found by History, Events: ' + lost.slice(0, 5).join(', '));
  if (found.some(y => !y.hdb)) bad.push('History, Events keeps a thing that is not in the history database');
  const walk = w.finderWalk_(tl);
  t.STUFF().filters = walk;
  if (w.stuffFiltered().indexOf(tl) < 0) bad.push('the timeline is lost by the funnel\'s own walk: ' + JSON.stringify(walk));
  /* THE CARD: a tile per event, in date order, then the Animation tile. */
  const box = d.createElement('div'); box.innerHTML = w.stuffCard(tl);
  const keys = [...box.querySelectorAll('[data-do="find-open"]')].map(e => e.getAttribute('data-key'));
  const want = evs.slice().sort((a, c) => a.date_iso.localeCompare(c.date_iso)).map(e => 'hdb:' + e.id);
  if (JSON.stringify(keys.slice(0, want.length)) !== JSON.stringify(want)) bad.push('the timeline\'s tiles are not every event in date order: ' + keys.slice(0, 4).join(', ') + '…');
  const animKey = keys[want.length];
  if (!animKey || !/^ct:TB-GCSE-HIST-6$/.test(animKey)) bad.push('the timeline\'s last tile is not the Animation tile to GCSE History chapter 6: ' + animKey);
  if (box.querySelector('[data-do="find-open"][href], a[target]')) bad.push('a timeline tile opens a page instead of a card in place');
  const ev = get('EV-0003'), hit = get('FIG-0004');
  if (!ev || !hit) return bad.concat(['EV-0003 or FIG-0004 is not in the list — the links were NOT checked']);
  const el = d.createElement('div'); el.innerHTML = w.stuffCard(ev);
  if ((el.querySelector('.hdb .fc-head h3') || {}).textContent !== ev.name) bad.push('the event card is not headed with its name');
  if (!el.querySelector('.qtag[data-f="histTheatre"]')) bad.push('the event card carries no theatre tag');
  const onCard = (x, when) => {
    const pg = w.stuffPages_()[pg_(t).stuff - w.stuffFirstResult_()];
    if (!pg || pg.x !== x || pg.part) bad.push(when + ': Find is on ' + (pg ? (pg.x && pg.x.name) + ':' + (pg.part || 'card') : 'no result') + ', not ' + x.name + '\'s card');
  };
  const press = (x, toKey) => {
    const s = d.getElementById('s-stuff');
    const bx = d.createElement('div'); bx.innerHTML = w.stuffCard(x); s.appendChild(bx);
    const tile = [...bx.querySelectorAll('[data-do="find-open"]')].find(e => e.getAttribute('data-key') === toKey);
    if (!tile) { bad.push(x.name + '\'s card has no tile to ' + toKey); bx.remove(); return false; }
    A['find-open'](tile); bx.remove(); return true;
  };
  t.STUFF().filters = [];
  const opener = d.createElement('button'); opener.setAttribute('data-key', tl.key); d.getElementById('s-stuff').appendChild(opener);
  A['find-open'](opener); await wait(120);
  onCard(tl, 'the timeline opened');
  if (press(tl, ev.key)) { await wait(120); onCard(ev, 'the timeline\'s tile to ' + ev.name); }
  if (press(ev, hit.key)) { await wait(120); onCard(hit, 'the event\'s Figure tile'); }
  if (press(tl, animKey)) {
    await wait(150);
    const pg = w.stuffPages_()[pg_(t).stuff - w.stuffFirstResult_()];
    if (!pg || !pg.x || pg.x.key !== animKey) bad.push('the Animation tile lands on ' + (pg && pg.x ? pg.x.key : 'nothing') + ', not ' + animKey);
    else if (!(pg.x.row.animations || []).some(a => a.id === 'hww2')) bad.push('the chapter the Animation tile opens does not carry hww2');
  }
  if (t.AT() !== 'stuff') bad.push('following the timeline left Find for ' + t.AT());
  return bad;
});

/* THE REVIEW OF THE SECOND FINDER (docs/history/329, "the review"). § */

/* ---------- AN EMPTY SEARCH SAYS WHAT TO DO HERE, AND OFFERS NO OTHER COLUMN § */
check('an empty search on either finder says "take a filter off" under a chip that hides the hit, "Try fewer words." for a word nobody has, and offers no other column; a boxer\'s name is found where it is typed', async () => {
  const b = await resBoot_();
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, bad = [];
  const olivares = w.stuffItemsAll_().find(x => x.kind === 'people' && /Olivares/.test(x.name));
  if (!olivares) return ['no Ruben Olivares among the boxers — NOT checked'];
  for (const id of ['stuff', 'res']) {
    const name = id === 'stuff' ? 'Find' : 'Find 2';
    const st = () => (id === 'stuff' ? t.STUFF() : t.RES());
    const list = () => (id === 'stuff' ? w.stuffFiltered() : inRes_(w, () => w.stuffFiltered()));
    const said = () => ((d.getElementById(id + '-groups') || {}).textContent || '').replace(/\s+/g, ' ').trim();
    const tile = () => d.querySelector('#s-' + id + ' [data-do="finder-words"]');
    t.go(id, false, true); await wait(80); await woken_();
    st().filters = []; st().q = '';
    w.paintFinder_(id);
    /* HIS NAME, FOUND WHERE IT IS TYPED. */
    if (!resType_(w, id, 'Olivares')) { bad.push(name + ' has no search box — NOT checked'); continue; }
    await wait(260); await woken_();
    if (st().q !== 'Olivares') { bad.push('typing into #' + id + '-q did not reach ' + name + '\'s words — NOT checked'); continue; }
    if (list().indexOf(olivares) < 0) bad.push(name + ' does not find Ruben Olivares by name — both finders hold the boxers');
    /* UNDER A CHIP THAT HIDES HIM: take a filter off — and no tile to the other column. */
    st().filters = [{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Projects' }];
    w.paintFinder_(id);
    await wait(60); await woken_();
    if (list().length) bad.push('the setup: ' + name + ' still finds ' + list().length + ' thing(s) for "Olivares" under Projects — the empty answer was NOT checked');
    else {
      if (!/Try fewer words, or take a filter off/.test(said())) bad.push(name + '\'s empty search under a chip does not say "Try fewer words, or take a filter off.": "' + said() + '"');
      if (/\bin (Find|Find 2|Resources)\b/.test(said())) bad.push(name + '\'s empty search points to another column: "' + said() + '"');
      if (tile()) bad.push(name + '\'s empty search draws a finder-words tile — it would carry the words into the other column and clear its chips');
    }
    /* A WORD NOBODY HAS. */
    st().filters = [];
    resType_(w, id, 'zqxjv');
    await wait(260); await woken_();
    if (!/Try fewer words\./.test(said()) || /take a filter off/.test(said())) bad.push('a word nobody has does not say "Try fewer words." on ' + name + ': "' + said() + '"');
    if (tile()) bad.push('a word nobody has drew an Open tile to the other finder on ' + name);
    st().q = '';
  }
  return bad;
});

/* ---------- A PLACE KEPT INSIDE THE BIBLE COMES BACK INSIDE IT, FOR WHOEVER THE BIBLE IS FOR § */
check('a Find place kept inside the Bible comes back inside Genesis 1 for an admin, and without any Bible chip for somebody the Bible is not for', async () => {
  const ADMIN = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-a' };
  /* THE REAL BIBLE FILES, SERVED, so the Bible is on the admin's list as it is on the site — without its
     index there is no Bible item, and the chips would be measured against a list that has no Bible. */
  const bibleDir = path.join(dir, '..', 'data', 'bible');
  const serve = url => {
    const m = /(?:^|\/)data\/bible\/([a-z0-9-]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    const p = path.join(bibleDir, m[1]);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };
  const one = await resBoot_({ serve, before: signedInAs_(ADMIN) });
  if (!one) return ['the app or libraryExtras_ did not load — NOT checked'];
  const W = one.w, T = W.__t, bad = [];
  for (let i = 0; i < 80 && !(T.BIBLE() && T.BIBLE().index); i++) await wait(25);
  if (!(T.BIBLE() && T.BIBLE().index)) return ['the Bible\'s index never loaded for the admin — NOT checked'];
  T.go('stuff'); await wait(80);
  const chips = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' }, { field: 'shelf', value: 'Writings' },
    { field: 'wText', value: 'English, King James Version (1611)' }, { field: 'wBook', value: 'Genesis' }, { field: 'wChapter', value: '1' }];
  T.STUFF().filters = chips.map(f => Object.assign({}, f));
  W.localStorage.setItem('familyTabAt', String(Date.now() - 20 * 60 * 1000));
  W.dispatchEvent(new W.Event('pagehide'));
  const kept = keptStore_(W);
  const key = Object.keys(kept).find(x => /^draft:u:P001:find:place$/.test(x));
  if (!key) return ['nothing was kept under draft:u:P001:find:place — NOT checked'];
  /* ---- THE ADMIN: back inside Genesis 1, on Find ---- */
  const two = await resBoot_({ serve, before: fromStore_(kept) });
  if (!two) return ['the reload did not load — NOT checked'];
  const w = two.w, t = w.__t;
  for (let i = 0; i < 100 && !(t.STUFF().filters || []).length; i++) await wait(50);
  for (let i = 0; i < 80 && !(t.BIBLE() && t.BIBLE().index); i++) await wait(25);
  await wait(200); await woken_();
  if (t.AT() !== 'stuff') bad.push('the reload opened on ' + t.AT() + ', not Find — the place was NOT brought back');
  const fl = t.STUFF().filters || [];
  /* THE OLD SPELLING KEPT (before 546) COMES BACK AS ITS TRANSLATION: "English, King James Version (1611)" is King James Version (1611). */
  const wantBack = chips.map(f => (f.field === 'wText' ? Object.assign({}, f, { value: 'King James Version (1611)' }) : f));
  if (JSON.stringify(fl) !== JSON.stringify(wantBack)) bad.push('an admin\'s Find came back with ' + JSON.stringify(fl) + ' — wanted every chip, the Bible\'s too, its translation in today\'s words: ' + JSON.stringify(wantBack));
  /* EVERY VERSE A CARD (499): the place is Genesis 1's 31 verse cards on the everyday list, not a cover's inside. */
  const g1 = w.stuffFiltered();
  if (g1.length !== 31 || !g1.every(x => x.kind === 'bible' && x.bb && x.bb.book === 'Genesis' && x.ch === '1')) bad.push('an admin\'s Find is not on Genesis 1\'s 31 verses after the reload: ' + g1.length + ' item(s)');
  for (let i = 0; i < 80 && /Nothing matches/.test((w.document.getElementById('s-stuff') || {}).textContent || ''); i++) await wait(25);
  if (/Nothing matches/.test((w.document.getElementById('s-stuff') || {}).textContent || '')) bad.push('an admin\'s Find says "Nothing matches" after the reload');
  /* NEITHER FINDER DROPS AN ADMIN'S BIBLE CHIP. */
  const g = { field: 'wBook', value: 'Genesis' }, books = { field: 'shelf', value: 'Writings' };
  if (w.placeChipDead_(g) || w.placeChipDead_(books)) bad.push('Find would drop an admin\'s own Bible chip from a kept place');
  if (inRes_(w, () => w.placeChipDead_(g) || w.placeChipDead_(books))) bad.push('Find 2 would drop an admin\'s own Bible chip from a kept place');
  /* ---- THE SAME PLACE, KEPT BY SOMEBODY THE BIBLE IS NOT FOR: its chips go, the rest stay ---- */
  const theirs = {};
  Object.keys(kept).forEach(k => { theirs[k.replace(/^draft:u:P001:/, 'draft:u:P7:')] = kept[k]; });
  delete theirs.familyUser;
  const three = await resBoot_({ serve, before: win => { fromStore_(theirs)(win); signedInAs_(ANS_ADA)(win); } });
  if (!three) return bad.concat(['the non-admin reload did not load — NOT checked']);
  const t3 = three.w.__t;
  for (let i = 0; i < 100 && !(t3.STUFF().filters || []).length; i++) await wait(50);
  await wait(200);
  const want = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' }];
  if (JSON.stringify(t3.STUFF().filters) !== JSON.stringify(want)) bad.push('kept by somebody the Bible is not for, the place came back as ' + JSON.stringify(t3.STUFF().filters) + ' — wanted the Bible\'s chips and the Books shelf dropped: ' + JSON.stringify(want));
  if (three.w.stuffItemsAll_().some(x => x.kind === 'bible')) bad.push('a non-admin\'s Find holds Bible verses');
  return bad;
});

/* ---------- WORK THAT RUNS LATER, BOUND TO ITS FINDER § */
check('Find 2\'s search box repaints Find 2 after its debounce, even with an answer pressed on Find inside the 180ms', async () => {
  const b = await resBoot_();
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  t.go('res', false, true); await wait(120); await woken_();
  const resQ0 = d.getElementById('res-groups').innerHTML;
  resType_(w, 'res', 'frequency density');
  t.go('stuff', false, true);
  const pick = d.querySelector('#s-stuff #stuff-groups [data-do="facet-pick"]');
  if (pick) A['facet-pick'](pick); else bad.push('Find drew no answer to press inside the debounce');
  const findGroups = d.getElementById('stuff-groups').innerHTML;
  const findF = JSON.stringify(t.STUFF().filters);
  await wait(400); await woken_();
  if (t.RES().q !== 'frequency density') bad.push('Find 2\'s words are ' + JSON.stringify(t.RES().q));
  if (t.STUFF().q) bad.push('Find\'s words are ' + JSON.stringify(t.STUFF().q));
  /* NORMALISED THROUGH AN ELEMENT, as the screen's own markup is once the browser has parsed it. */
  const tmp = d.createElement('div'); tmp.innerHTML = inRes_(w, () => w.stuffQuestion());
  const want = tmp.innerHTML;
  if (want === resQ0) return bad.concat(['the setup: "frequency density" does not change Find 2\'s question, so its repaint was NOT checked']);
  if (d.getElementById('res-groups').innerHTML !== want) bad.push('Find 2\'s question on screen is not what its own state draws after the debounce (unchanged since before typing: ' + (d.getElementById('res-groups').innerHTML === resQ0) + ')');
  if (d.getElementById('stuff-groups').innerHTML !== findGroups) bad.push('Find\'s question was repainted by Find 2\'s debounce');
  if (JSON.stringify(t.STUFF().filters) !== findF) bad.push('Find\'s chips changed under Find 2\'s debounce');
  return bad;
});

check('a landing repaint on a Find 2 result leaves the page in front drawn (the draw\'s microtask fills in Find 2\'s binding)', async () => {
  const b = await resBoot_();
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, bad = [];
  t.go('res', false, true); await wait(80);
  t.RES().filters = [{ field: 'shelf', value: 'Boxing' }];
  w.paintFinder_('res');
  const first = inRes_(w, () => w.stuffFirstResult_());
  t.goPage('res', first + 7, true); await wait(200); await woken_();
  if (!inRes_(w, () => w.stuffHeld_())) return ['the setup: the page in front of Find 2 was not filled before the repaint — NOT checked'];
  w.landRepaint_();
  await wait(300); await woken_();
  if (!inRes_(w, () => w.stuffHeld_())) bad.push('after a landing repaint the page in front of Find 2 is empty (PAGE.res ' + pg_(t).res + ')');
  if (!w.document.querySelectorAll('#s-res > .page.is-res[data-filled="1"]').length) bad.push('no result page of Find 2 is filled after a landing repaint');
  return bad;
});

check('a page turn on Find 2 from outside any binding (a swipe) has the page in front drawn at once, near and far', async () => {
  const b = await resBoot_();
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, bad = [];
  t.go('res', false, true); await wait(80);
  t.RES().filters = [{ field: 'shelf', value: 'Boxing' }];
  w.paintFinder_('res');
  await wait(200); await woken_();
  const first = inRes_(w, () => w.stuffFirstResult_());
  if (inRes_(w, () => w.stuffPages_().length) < 45) return ['the setup: Shelf · Boxing has too few pages to jump 40 — NOT checked'];
  /* EACH READ SYNCHRONOUSLY, BEFORE ANY TIMER — the after-slide fill would hide a page drawn late. */
  t.goPage('res', first + 40, true);
  if (!inRes_(w, () => w.stuffHeld_())) bad.push('jumped to result 40: the page in front is not drawn synchronously');
  t.goPage('res', first + 41);
  if (!inRes_(w, () => w.stuffHeld_())) bad.push('turned one page: the page in front is not drawn synchronously');
  return bad;
});

/* ---------- A CHAPTER PLAYS ITS ANIMATION § */
/* ON FIND 2 (docs/history/329), a page after the Pythagoras content card (347, part 2). */
check('a content card plays its animation on Find 2: Pythagoras after the Pythagoras and trigonometry card, drawn from its row', async () => {
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable — NOT checked'];
  const rows = read('textbooks');
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { textbooks: rows })));
  const p = payload();
  Object.assign(p, { textbooks: made.textbooks || [] });
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  const bad = [];
  const row = rows.find(r => r.anim === 'pyth');
  if (!row) return ['data/textbooks.json has no pyth row — NOT checked'];
  const R = resView_(w);
  t.go('res');
  const S = t.RES();
  S.q = ''; S.filters.length = 0;
  S.filters.push({ field: 'kindLabel', value: 'Library' }, { field: 'subject', value: 'Maths' });
  w.paintFinder_('res');
  const pages = R.stuffPages_();
  const at = pages.findIndex(pg => pg.part === 'an17-pyth');
  if (at < 0) return ['Content · Maths has no an17-pyth page: ' + pages.map(pg => pg.part || 'card').slice(0, 30).join(' ')];
  if (!pages[at - 1] || pages[at - 1].part || !pages[at - 1].x || pages[at - 1].x.key !== 'ct:TB-GCSE-MATHS-17') bad.push('Pythagoras is not the page straight after the Pythagoras and trigonometry card (it follows ' + (pages[at - 1] && ((pages[at - 1].x || {}).name + ':' + (pages[at - 1].part || 'card'))) + ')');
  const first = R.stuffFirstResult_();
  t.goPage('res', first + at);
  await wait(450); await woken_();
  /* THE WINDOW FILLED AS THE BUILDER WOULD FILL IT IN THE QUIET — the builder is held here (it is the arrival this asks about), and since docs/history/341 a turn § */
  R.fillStuffPages(true);
  const host = w.document.getElementById('s-res');
  /* THE PAGE IN FRONT, AS THE FINDER MARKS IT — `.on` on the page the column is placed at. */
  const cardEl = host.querySelector('.card.is-an17-pyth');
  const here = cardEl && cardEl.closest('.page');
  const stage = here && here.querySelector('.tb-an-stage[data-anim="pyth"]');
  if (!stage) return bad.concat(['the page turned to has no Pythagoras stage']);
  if (!stage.classList.contains('is-on')) bad.push('the stage on the page in front is not `.is-on` — it stands paused');
  const others = [...host.querySelectorAll('.tb-an-stage.is-on')].filter(e => e !== stage);
  if (others.length) bad.push(others.length + ' other stage(s) are playing off the page in front: ' + others.map(e => e.dataset.anim).join(' '));
  /* ITS STYLESHEET: ONE, THE ROW'S. */
  const st = w.document.head.querySelectorAll('style[data-anim="pyth"]');
  if (st.length !== 1) bad.push(st.length + ' <style data-anim="pyth"> in the page — one, shared');
  else if (st[0].textContent !== row.css) bad.push('the page\'s Pythagoras stylesheet is not the row\'s CSS');
  /* ITS MARKUP: THE ROW'S, IDS ITS OWN. */
  const n = (/-t(\d+)"/.exec(stage.innerHTML) || [])[1];
  const box = w.document.createElement('div');
  box.innerHTML = w.animIds_(row.html, n || 1);
  if (stage.innerHTML !== box.innerHTML) bad.push('the stage is not the row\'s markup as `animIds_` gives it');
  const ids = [...host.querySelectorAll('.tb-an-stage [id]')].map(e => e.id);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) bad.push('ids shared between drawings on the page: ' + [...new Set(dup)].join(' '));
  const plain = ids.filter(v => !/-t\d+$/.test(v));
  if (plain.length) bad.push('ids inside a drawing that were not made its own: ' + plain.join(' '));
  if (!ids.length) bad.push('no drawing near the page has an id, so the id rule was NOT exercised (the Venn two pages on has four)');
  /* WHAT IT IS ABOUT, IN THE CHAPTER'S WORDS AND TYPESET. */
  const card = here.querySelector('.card.tb-an');
  if (!card) bad.push('the page is not drawn as a content card\'s animation');
  else {
    if (!/Pythagoras/.test(card.querySelector('h3').textContent)) bad.push('the page is not headed Pythagoras');
    /* THE KICKER NAMES THE SUBJECT AND THE CARD, AND NEVER A CHAPTER (347, part 2). */
    const kick = card.querySelector('.fc-kick').textContent;
    if (!/Maths · Pythagoras and trigonometry/.test(kick) || /chapter|book/i.test(kick)) bad.push('the kicker is "' + kick + '" — wanted the subject and the card, and no chapter');
    const fm = card.querySelector('.tb-about .tb-math .tb-fm');
    if (!fm || !fm.querySelector('sup')) bad.push('the Pythagoras formula under the drawing is not typeset (no raised power)');
    if (card.querySelectorAll('.tb-about li').length > 4) bad.push('the page lists ' + card.querySelectorAll('.tb-about li').length + ' lines — only what it is about, not the whole chapter');
    if (/@family\./.test(card.querySelector('.tb-an-stage').textContent)) bad.push('the drawing in the chapter signs itself');
  }
  /* THE CARD IS FOUND BY THE ANIMATION'S TITLE, AND ITS WORDS HOLD NO MARKUP. */
  const ch = (id, n) => (((made.textbooks || []).find(b => b.id === id) || {}).chapters || []).find(c => c.n === n);
  const words = w.contentText_(ch('TB-GCSE-MATHS', 17));
  /* NOT `<` ITSELF: the chapters' own words have inequalities in them. The drawing's tags and rules. */
  if (/class=|<svg|<div|@keyframes|py-cell|an-pyth/.test(words)) bad.push('the card\'s search words hold markup — the drawing\'s html or css went into the haystack');
  /* AND NOT ITS WORDS EITHER: the haystack strips tags, so markup put into it arrives as the drawing's
     own captions. Bayes's "people take a test" is on the drawing and nowhere in the chapter. */
  if (w.contentText_(ch('TB-GCSE-STATS', 15)).indexOf('people take a test') !== -1) bad.push('the Probability card is found by "people take a test", which is Bayes\'s drawing, not its words — the drawing went into the haystack');
  if (words.indexOf('Galton') !== -1) bad.push('the Pythagoras card\'s words hold Galton, which is a Statistics animation');
  if (w.contentText_(ch('TB-GCSE-STATS', 16)).indexOf('Galton board') < 0) bad.push('"Galton board" does not find the Probability distributions card');
  /* PLAY AGAIN PUTS THE MARKUP BACK, which starts it over. */
  const tile = card && card.querySelector('[data-do="tb-an-again"]');
  if (!tile || typeof t.ACTIONS['tb-an-again'] !== 'function') bad.push('no Play again tile, or no handler for it');
  else {
    const before = stage.firstElementChild;
    t.ACTIONS['tb-an-again'](tile);
    if (stage.firstElementChild === before) bad.push('Play again left the drawing\'s elements in place — nothing restarted');
    if (stage.innerHTML !== box.innerHTML) bad.push('Play again changed the drawing');
  }
  /* AND IT STOPS WHEN THE PAGE TURNS. */
  t.goPage('res', first + at + 1);
  await wait(450); await woken_();
  if (stage.isConnected && stage.classList.contains('is-on')) bad.push('turned to the next page, and Pythagoras is still `.is-on` — playing out of sight');
  return bad;
});

/* ---------- THE OWNER'S TEST: A TOPIC FINDS THE CONTENT CARD BESIDE THE QUESTIONS, ON EITHER FINDER § */
check('the owner\'s test, on Find and Find 2: Maths · GCSE · Topic Surds, Pythagoras\' Theorem, Standard Form, Simultaneous Equations, Histograms holds the content card, and typing the topic finds it beside the questions', async () => {
  const p = await resPayload_();
  if (!p) return ['libraryExtras_ is not reachable — the owner\'s test was NOT run'];
  const TOPICS = ['Surds', 'Pythagoras\' Theorem', 'Standard Form', 'Simultaneous Equations', 'Histograms'];
  const key = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const lib = LIB_FULL.rows('questions');
  const tops = r => String(r.topics || '').split(',').map(key);
  const rows = lib.filter(r => r.subject === 'Maths' && /^gcse$/i.test(String(r.level || '')) && TOPICS.some(T => tops(r).indexOf(key(T)) !== -1));
  const missing = TOPICS.filter(T => !rows.some(r => tops(r).indexOf(key(T)) !== -1));
  if (missing.length) return ['data/questions.json has no GCSE maths question on ' + missing.join(', ') + ' — the test has nothing to put the card beside'];
  const { w } = boot({ payload: p, serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  for (let i = 0; i < 120 && !(typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().some(x => x.kind === 'question')); i++) await wait(50);
  const t = w.__t, R = resView_(w), bad = [];
  if (!w.stuffItemsAll_().some(x => x.kind === 'question')) return ['the served questions never reached Find — the test was NOT run'];
  const finders = [['Find', w, () => t.STUFF()], ['Find 2', R, () => t.RES()]];
  TOPICS.forEach(T => {
    /* GCSE's OWN: a KS3 or A-level maths card on the same topic is rightly outside Maths · GCSE (438). */
    const cards = w.stuffItemsAll_().filter(x => x.kind === 'content' && x.subject === 'Maths' && w.levelOf_(x) === 'GCSE' && w.topicOf_(x).indexOf(T) !== -1);
    if (!cards.length) { bad.push('no GCSE Maths content card is tagged "' + T + '" — spelled as the library spells it'); return; }
    finders.forEach(([name, V, S]) => {
      const st = S();
      st.q = '';
      st.filters.length = 0;
      st.filters.push({ field: 'subject', value: 'Maths' }, { field: 'level', value: 'GCSE' }, { field: 'topic', value: T });
      const byChip = V.stuffFiltered();
      cards.forEach(c => { if (!byChip.some(x => x.key === c.key)) bad.push(name + ': Maths · GCSE · Topic ' + T + ' does not hold "' + c.name + '"'); });
      st.filters.length = 0;
      st.filters.push({ field: 'subject', value: 'Maths' }, { field: 'level', value: 'GCSE' });
      st.q = T.toLowerCase();
      const hits = V.stuffFiltered();
      const at = hits.findIndex(x => x.kind === 'content' && cards.some(c => c.key === x.key));
      const qs = hits.filter(x => x.kind === 'question' && tops(x.row || {}).indexOf(key(T)) !== -1).length;
      if (at < 0) bad.push(name + ': typing "' + T.toLowerCase() + '" under Maths · GCSE does not find the ' + T + ' card');
      else if (at >= 10) bad.push(name + ': typing "' + T.toLowerCase() + '" puts the ' + T + ' card at hit ' + (at + 1) + ' of ' + hits.length + ' — not beside the questions, 10 down at most');
      if (!qs) bad.push(name + ': typing "' + T.toLowerCase() + '" under Maths · GCSE finds no question tagged ' + T + ' — the card is not beside anything');
      /* AND FIND STAYS A PLACE TO DO QUESTIONS: a browse, or words in every worked example, opens on a
         question, not on a page of reading (13 Oct — the note over `sortKey_`). */
      st.q = '';
      const browse = V.stuffFiltered();
      if (browse.length && browse[0].kind === 'content') bad.push(name + ': Maths · GCSE with no words opens on a content card, "' + browse[0].name + '", not a question');
      st.q = 'work out';
      const worked = V.stuffFiltered();
      if (worked.length && worked[0].kind === 'content') bad.push(name + ': typing "work out" under Maths · GCSE leads with a content card, "' + worked[0].name + '" — words in its worked lines, not its title or topics');
      st.q = ''; st.filters.length = 0;
    });
  });
  return bad;
});

/* ---------- THE BOOKS AND THE SETTINGS ARE ASKED FOR WITH THE DEPLOY'S STAMP § */
check('the books and the settings files are fetched with the deploy stamp', async () => {
  const { w, gets } = boot({ before: w2 => { w2.LOAD = 'STAMP42'; } });
  for (let i = 0; i < 100 && !gets.some(u => /data\/textbooks\.json/.test(u)); i++) await wait(25);
  const bad = [];
  ['textbooks', 'practicals', 'settings/brand'].forEach(n => {
    const asked = gets.filter(u => u.indexOf('data/' + n + '.json') === 0);
    if (!asked.length) bad.push('data/' + n + '.json was never asked for — NOT checked');
    else if (!asked.every(u => u === 'data/' + n + '.json?t=STAMP42')) bad.push('data/' + n + '.json was asked for as ' + asked.join(', ') + ' — without the deploy stamp the worker keeps the first copy for good');
  });
  return bad;
});

/* ---------- THE BIBLE: SIX QUESTIONS AND A CARD A VERSE, AND NOBODY ELSE IS SHOWN IT OR SENT IT § */
check('the Bible, on Find 2 (and on Find): a card a verse on the everyday list (499) → Religious Studies → Bible → testament → group → book → chapter → verse, asked by the one rule, one text a card (504); nobody under age is shown it or fetches a byte of it', async () => {
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the shelves were NOT built — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { textbooks: read('textbooks'), boxers: read('boxers'), fights: read('fights'), projects: read('projects') })));
  /* THE SHELVES THE BIBLE STANDS BESIDE, so `Books` is pressed among real answers rather than alone. */
  const base = () => Object.assign(payload(), { textbooks: made.textbooks || [], boxers: made.boxers || [],
                                                fights: made.fights || [], projects: made.projects || [] });
  /* THE REAL FILES, SERVED AS THE SITE SERVES THEM, the deploy stamp and all; a name in `refuse` 404s. */
  const bibleDir = path.join(dir, '..', 'data', 'bible');
  const refuse = new Set();
  const serve = url => {
    const m = /(?:^|\/)data\/bible\/((?:[a-z]+\/)?[a-z0-9-]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    if (refuse.has(m[1])) return null;
    const p = path.join(bibleDir, m[1]);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };
  const seed = u => w => { try { w.localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} };
  const ofBible = gets => gets.filter(u => /data\/bible\//.test(u));
  const index = JSON.parse(fs.readFileSync(path.join(bibleDir, 'index.json'), 'utf8'));
  const bad = [];

  /* ---------- NOBODY BUT AN ADMIN ---------------------------------------------------------------- */
  const others = [
    ['somebody signed out', null],
    ['a parent', { name: 'Pat Parent', personId: 'P004', role: 'parent', roles: ['parent'] }],
    ['a student', { name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'] }],
    ['a tutor', { name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'] }],
  ];
  for (const [what, u] of others) {
    const b = boot({ payload: base(), serve, before: u ? seed(u) : undefined });
    await wait(300);
    const w = b.w, t = w.__t;
    const R = resView_(w);
    if (!t || !t.STUFF) { bad.push(what + ': the app did not load, so it was NOT checked'); continue; }
    if (u && !(t.whoami() && t.whoami().role === u.role)) { bad.push(what + ' was not signed in at boot, so it was NOT checked'); continue; }
    t.go('res');
    t.RES().q = '';
    t.RES().filters = [{ field: 'kindLabel', value: 'Library' }];
    w.paintFinder_('res');
    await wait(30);
    const shelf = w.facetList().find(f => f.field === 'shelf');
    const shelves = shelf ? R.facetValues(R.stuffFiltered(), shelf).map(v => String(v.value)) : [];
    if (shelves.indexOf('Books') >= 0) bad.push(what + ' is offered the Books shelf');
    if (shelves.indexOf('Boxing') < 0) bad.push(what + ' was not offered the Boxing shelf — the walk did not reach the resources, so the absence proves nothing');
    if (w.stuffItemsAll_().some(x => x.kind === 'bible')) bad.push(what + ' has the Bible on the list of everything the app holds');
    for (const q of ['bible', 'genesis', 'king james', 'kjv', 'psalms']) {
      t.RES().filters = []; t.RES().q = q;
      if (R.stuffFiltered().some(x => x.kind === 'bible')) bad.push(what + ' finds the Bible by searching "' + q + '"');
    }
    t.RES().q = '';
    t.RES().filters = [];
    w.paintFinder_('res');
    if (w.document.querySelector('.card.bible, [data-do^="bible-"]')) bad.push(what + ' has a Bible card or button drawn');
    /* AND THE BIBLE'S ANSWERS, PRESSED ANYWAY — forged, because nothing draws them for this visitor. */
    for (const [field, value] of [['wText', 'English, King James Version (1611)'], ['wBook', 'Genesis']]) {
      const fake = w.document.createElement('div');
      fake.dataset.field = field; fake.dataset.value = value;
      try { t.ACTIONS['facet-pick'](fake); } catch (e) { bad.push(what + ': pressing a forged ' + field + ' threw ' + e.message); }
    }
    await wait(60);
    if (R.stuffFiltered().length) bad.push(what + ' pressed a forged KJV and Genesis and was shown ' + R.stuffFiltered().length + ' thing(s)');
    if (w.document.querySelector('.card.bb-verse')) bad.push(what + ' has a verse card drawn');
    /* AND ITS TILES, PRESSED ANYWAY: the chips must not move and nothing may be fetched. */
    const was = JSON.stringify(t.RES().filters);
    for (const [act, attrs] of [['bible-go', { 'data-key': 'bible:kjv:1:1:3' }], ['bible-go', {}], ['bible-retry', { 'data-n': '1' }], ['bible-retry', {}]]) {
      const fake = w.document.createElement('button');
      Object.keys(attrs).forEach(k => fake.setAttribute(k, attrs[k]));
      try { t.ACTIONS[act](fake); } catch (e) { bad.push(what + ': pressing a forged ' + act + ' threw ' + e.message); }
    }
    await wait(60);
    if (JSON.stringify(t.RES().filters) !== was) bad.push(what + ' pressed a forged Bible tile and Find 2\'s chips changed to ' + JSON.stringify(t.RES().filters));
    const got = ofBible(b.gets);
    if (got.length) bad.push(what + ' fetched ' + got.length + ' file(s) of the Bible: ' + got.slice(0, 3).join(', '));
    if (!b.gets.length) bad.push(what + ': no fetch was recorded at all, so "nothing of the Bible" proves nothing');
  }

  /* ---------- AN ADMIN: EVERY VERSE AN ITEM, ASKED BY THE ONE RULE ------------------------------------ */
  const admin = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] };
  const a = boot({ payload: base(), serve, before: seed(admin) });
  const w = a.w, t = w.__t, d = w.document;
  const R = resView_(w);
  for (let i = 0; i < 80 && !(t && t.BIBLE && t.BIBLE() && t.BIBLE().index); i++) await wait(25);
  if (!t || !t.BIBLE || !t.BIBLE() || !t.BIBLE().index) return bad.concat(['an admin\'s Find never received data/bible/index.json — NOT checked']);
  if (ofBible(a.gets).some(u => !/index\.json/.test(u))) bad.push('an admin\'s boot fetched a book of the Bible before any verse was drawn: ' + ofBible(a.gets).join(', '));
  const verses = w.stuffItemsAll_().filter(x => x.kind === 'bible');
  /* A CARD A VERSE A TEXT (504): the KJV and the WEB on the KJV's numbering, each other text on its own books. */
  const wantN = index.totals.verses + (index.also || []).reduce((n, t) => n + (Array.isArray(t.books) ? t.books.reduce((m, b) => m + b.verses, 0) : index.totals.verses), 0);
  if (verses.length !== wantN) bad.push('an admin\'s list holds ' + verses.length + ' Bible items — wanted ' + wantN + ', a card a verse a text');
  if (verses.some(x => !x.bb || Number(x.min_age) !== 18)) bad.push('a Bible item is not a verse or is not 18+');
  if (!R.stuffItems().some(i => i.kind === 'bible')) bad.push('Find 2 does not carry the verses for an admin');
  t.go('res');
  const S = t.RES();
  S.q = ''; S.filters = [{ field: 'kindLabel', value: 'Library' }, { field: 'subject', value: 'Religious Studies' }, { field: 'wWork', value: 'Bible' }];
  /* WHAT IT IS FIRST (594): the testament and its section, then the language and whose translation (546); the New Testament's one Source is not asked. */
  const route = [['wCollection', 'New Testament'], ['wSection', 'Gospels'], ['wLanguage', 'English'], ['wText', 'King James Version (1611)'], ['wBook', 'John'], ['wChapter', '3'], ['wUnit', '16']];
  for (const [field, value] of route) {
    const list = R.stuffFiltered(), f = R.nextFacet(list);
    if (!f || f.field !== field) { bad.push('after ' + S.filters.map(x => x.value).join(' → ') + ' the funnel asks ' + (f ? f.field : 'nothing') + ', not ' + field); break; }
    if (!R.facetValues(list, f).some(v => String(v.value) === value)) { bad.push(field + ' does not offer ' + value); break; }
    S.filters.push({ field, value });
  }
  const john = R.stuffFiltered();
  if (john.length !== 1 || john[0].key !== 'bible:kjv:43:3:16') bad.push('the walk did not end on John 3:16 alone: ' + john.map(x => x.key).slice(0, 3).join(', '));
  else {
    const x = john[0];
    const host = d.createElement('div'); d.body.appendChild(host);
    host.innerHTML = w.stuffCard(x);
    for (let i = 0; i < 80 && !t.BIBLE().books[43]; i++) await wait(25);
    host.innerHTML = w.stuffCard(x);
    const txt = host.textContent.replace(/\s+/g, ' ');
    if (!/For God so loved the world/.test(txt)) bad.push('the John 3:16 card does not show the KJV: ' + txt.slice(0, 120));
    /* ONE CARD, ONE TEXT (504): "the bible shouldn't show multiple translations per card". */
    if (/one and only Son|only born Son/.test(txt)) bad.push('the KJV John 3:16 card shows the World English Bible too: ' + txt.slice(0, 200));
    if (host.querySelector('.card h3')) bad.push('a verse card carries a heading — its tags are its title (499)');
    if (host.querySelector('.card').getAttribute('aria-label') !== 'John 3:16') bad.push('a verse card is not named John 3:16 for a screen reader');
    host.remove();
  }
  return bad;
});

/* ---------- THE FUNNEL ASKS AN ADMIN WHAT IT ASKS A PARENT, THE BOOKS SHELF APART § */
check('the funnel asks an admin exactly what it asks a parent, the Bible apart — the Bible costs nobody else a question', async () => {
  /* EVERY `data/` FILE FROM DISK, the library included — `check-funnel.js`'s rule, so the walk is over
     the questions a phone holds rather than over a payload of two tutors. */
  const serveAll = url => {
    const m = /(?:^|\/)(data\/[a-z0-9_\-\/]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    const p = path.join(dir, '..', m[1]);
    try { return JSON.parse(LIB_FULL.serve(p) || fs.readFileSync(p, 'utf8')); } catch (e) { return undefined; }
  };
  const seed = u => w => { try { w.localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} };
  const who = [['a parent', { name: 'Pat Parent', personId: 'P004', role: 'parent', roles: ['parent'], profile: { dob_d: '1', dob_m: '1', dob_y: String(new Date().getFullYear() - 30) } }],
               ['an admin', { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] }]];
  /* BOTH FINDERS, THE SAME STARTS (docs/history/347): § */
  const PLACES = [
    ['the top', []],
    ['Learning', [['forLabel', 'Learning']]],
    ['Learning → Questions', [['forLabel', 'Learning'], ['kindLabel', 'Questions']]],
    ['Learning → skip', [['forLabel', 'Learning'], 'skip']],
    ['Learning → skip → skip', [['forLabel', 'Learning'], 'skip', 'skip']],
    ['Learning → Practicals', [['forLabel', 'Learning'], ['kindLabel', 'Practicals']]],
    ['Learning → Library', [['forLabel', 'Learning'], ['kindLabel', 'Library']]],
    ['Learning → Library → Boxing', [['forLabel', 'Learning'], ['kindLabel', 'Library'], ['shelf', 'Boxing']]],
  ];
  const STARTS = [].concat(...['stuff', 'res'].map(fid => PLACES.map(([say, steps]) => [(fid === 'res' ? 'Find 2, ' : 'Find, ') + say, steps, fid])));
  const bad = [];
  const traces = [];
  for (const [what, u] of who) {
    const b = boot({ serve: serveAll, before: seed(u) });
    const w = b.w, t = w.__t;
    const R = resView_(w);
    /* AND THE TALMUD'S INDEX (473), which both are given once a finder paints — or the two would differ by its timing. */
    try { t.go('stuff'); w.paintStuff(); } catch (e) {}
    for (let i = 0; i < 120 && !(t && t.STUFF && w.stuffItems().length > 1000 && w.talmudItems_().length && w.textsItems_().length && (u.role !== 'admin' || (t.BIBLE().index && R.stuffItems().some(x => x.kind === 'bible')))); i++) await wait(50);
    if (!t || w.stuffItems().length < 1000) { bad.push(what + ': the library did not load, so the walk was NOT checked'); return bad; }
    ['stuff', 'res'].forEach(fid => {
      const has = (fid === 'res' ? R : w).stuffItems().some(x => x.kind === 'bible');
      /* OPEN TO ANYONE OF AGE (504): a parent of thirty holds it as an admin does. */
      if (!has) bad.push(what + '\'s ' + (fid === 'res' ? 'Find 2' : 'Find') + ' holds no Bible — it is open to anyone of age since 504');
    });
    const trace = {};
    STARTS.forEach(([say, steps, fid]) => {
      const V = fid === 'res' ? R : w;
      const S = fid === 'res' ? t.RES() : t.STUFF();
      t.go(fid);
      S.q = '';
      S.filters = [];
      const out = [];
      steps.forEach(s => {
        if (s === 'skip') {
          const f = V.nextFacet(V.stuffFiltered()) || V.overFacet_(V.stuffFiltered());
          out.push('skip ' + (f ? f.field : 'nothing'));
          if (f) S.filters.push({ field: f.field, any: true });
        } else S.filters.push({ field: s[0], value: s[1] });
      });
      for (let step = 0; step < 8; step++) {
        const list = V.stuffFiltered();
        if (!list.length) { out.push('(empty)'); break; }
        const f = V.nextFacet(list) || V.overFacet_(list);
        if (!f) { out.push('(end, ' + list.length + ')'); break; }
        const vals = V.facetValues(list, f);
        out.push({ field: f.field, vals: vals.map(v => String(v.value)) });
        /* THE BIBLE'S VERSES ARE AN ADMIN'S ALONE (499), and 31,102 of them would be the commonest answer: the walk goes the way a parent's can. */
        const pool = vals.filter(v => String(v.value) !== 'Bible');
        let best = pool[0] || vals[0];
        pool.forEach(v => { if (v.n > best.n) best = v; });
        S.filters.push({ field: f.field, value: best.value });
      }
      trace[say] = out;
      S.filters = [];
    });
    /* THE SAME FINDER TWICE: Find 2's walk from every start is Find's walk, question for question. */
    PLACES.forEach(([say]) => {
      const f = JSON.stringify(trace['Find, ' + say]), r = JSON.stringify(trace['Find 2, ' + say]);
      if (f !== r) bad.push(what + ', from ' + say + ': Find asks ' + f.slice(0, 160) + ' and Find 2 ' + r.slice(0, 160));
    });
    traces.push(trace);
  }
  const [parent, admin] = traces;
  let compared = 0;
  STARTS.forEach(([say]) => {
    const p = parent[say] || [], a = (admin[say] || []).slice();
    /* THE ONE STEP ONLY AN ADMIN MAY BE ASKED: Which book, the Bible an admin's answer alone (Books is shared since 494),
       skipped for a parent left one book. Taken out of the admin's walk, the rest must match. */
    const k = a.findIndex((s, i) => s && typeof s === 'object' && s.field === 'wWork' && s.vals.filter(v => v !== 'Bible').length <= 1
      && !(p[i] && typeof p[i] === 'object' && p[i].field === 'wWork'));
    if (k >= 0) a.splice(k, 1);
    const n = Math.max(p.length, a.length);
    for (let i = 0; i < n; i++) {
      const ps = p[i], as = a[i];
      const show = s => (typeof s === 'string' ? s : s ? s.field + ' [' + s.vals.slice(0, 6).join(', ') + (s.vals.length > 6 ? '…' : '') + ']' : 'nothing');
      if (typeof ps === 'string' || typeof as === 'string' || !ps || !as) {
        /* AN END THE BIBLE'S COVER ALONE MAKES ONE LONGER (490): with the Quran and the Talmud both walks can end on the whole Learning shelf. */
        const endN = v => { const m = /^\(end, (\d+)\)$/.exec(typeof v === 'string' ? v : ''); return m ? Number(m[1]) : -1; };
        if (endN(ps) >= 0 && endN(as) - endN(ps) === 1) continue;
        if (show(ps) !== show(as)) { bad.push('from ' + say + ', step ' + (i + 1) + ': a parent is asked ' + show(ps) + ', an admin ' + show(as)); break; }
        continue;
      }
      const avals = as.vals;
      if (ps.field !== as.field || ps.vals.join('|') !== avals.join('|')) {
        const onlyAdmin = avals.filter(v => ps.vals.indexOf(v) < 0), onlyParent = ps.vals.filter(v => avals.indexOf(v) < 0);
        bad.push('from ' + say + ', step ' + (i + 1) + ': a parent is asked ' + show(ps) + ', an admin ' + show(as)
                 + (onlyAdmin.length || onlyParent.length ? ' — only the admin is offered ' + JSON.stringify(onlyAdmin)
                    + ', only the parent ' + JSON.stringify(onlyParent) : ' — the same answers in a different order'));
        break;
      }
      if (ps.field === 'wWork' && as.vals.indexOf('Bible') < 0) bad.push('from ' + say + ' an admin is asked Which book without the Bible');
      compared++;
    }
  });
  if (compared < 20) bad.push('only ' + compared + ' questions were compared — the walks did not get far enough to prove the sameness');
  return bad;
});

