/* SWITCHED OFF (owner, 14 Nov): the Quran (quran.js). Lines 237-281 of check/flow/19-find-under.js before 14 Nov. */
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


/* SWITCHED OFF (owner, 14 Nov): the timelines (find-timelines.js). Lines 395-464 of check/flow/19-find-under.js before 14 Nov (after the Quran block was taken out). */
/* ---------- THE TIMELINE (461): EVENTS FOUND AS A FOURTH KIND, THE WORLD WAR 2 CARD LISTS THEM IN DATE ORDER, EVERY TILE LANDS IN PLACE ---------- */
check('the history timeline: events are found under Learning, Content, History, Events, the timeline under Learning, Timeline (545); the World War 2 timeline card is an animation of its events in date order (batch F), an event links to its figure, and the Animation tile opens the chapter with the drawing', async () => {
  const p = await resPayload_();
  if (!p) return ['the app did not load — NOT checked'];
  const one = boot();
  for (let i = 0; i < 80 && typeof one.w.libraryExtras_ !== 'function'; i++) await wait(25);
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { figures: read('figures'), writings: read('writings'), timeline: read('timeline'), timelines: read('timelines') })));
  const b = boot({ payload: Object.assign(p, { figures: made.figures || [], writings: made.writings || [], timeline: made.timeline || [], timelines: made.timelines || [] }), before: signedInAs_(Object.assign({}, MEMBER_, { profile: { dob_d: '1', dob_m: '1', dob_y: String(new Date().getFullYear() - 30) } })) });   // an adult: the history database is 14+ (505)
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  await wait(250);
  if (!b.w.__t) return ['the app did not boot — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  const all = w.stuffItemsAll_();
  const tl = all.find(x => x.kind === 'timeline' && x.era === 'World War 2');
  const evs = read('timeline').filter(e => e.era === 'World War 2');
  if (!tl || evs.length < 20) return ['no World War 2 timeline item, or data/timeline.json has fewer than 20 of its events — NOT checked'];
  const get = id => all.find(x => x.key === 'hdb:' + id);
  t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' },
                       { field: 'shelf', value: 'History' }, { field: 'histKind', value: 'Events' }];
  const found = w.stuffFiltered();
  /* A TIMELINE IS IN LIBRARY › HISTORY › TIMELINES (610, batch F), and Which says Timeline. */
  t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' },
                       { field: 'shelf', value: 'History' }, { field: 'histKind', value: 'Timelines' }];
  if (w.stuffFiltered().indexOf(tl) < 0) bad.push('the timeline is not under Library, History, Timelines (610)');
  t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Timeline' }];
  if (w.stuffFiltered().indexOf(tl) < 0) bad.push('the timeline is not found by Learning, Timeline');
  const lost = evs.filter(e => found.indexOf(get(e.id)) < 0).map(e => e.id);
  if (lost.length) bad.push(lost.length + ' event(s) not found by History, Events: ' + lost.slice(0, 5).join(', '));
  if (found.some(y => !y.hdb)) bad.push('History, Events keeps a thing that is not in the history database');
  const walk = w.finderWalk_(tl);
  t.STUFF().filters = walk;
  if (w.stuffFiltered().indexOf(tl) < 0) bad.push('the timeline is lost by the funnel\'s own walk: ' + JSON.stringify(walk));
  /* THE CARD IS AN ANIMATION (batch F): a scene per stop, the stops in date order, and an Animation tile to the chapter with the drawing. */
  t.STUFF().filters = [];
  const box = d.createElement('div'); box.innerHTML = w.stuffCard(tl);
  const stops = (tl.row && tl.row.stops) || [];
  if (stops.length < 5) bad.push('the timeline has ' + stops.length + ' stops — five at least');
  if (box.querySelectorAll('.tl-anim .tl-track .tl-ev').length !== stops.length) bad.push('the timeline card does not draw one scene per stop on its axis');
  const isos = stops.map(s => s.ev.date_iso);
  if (isos.some((v, k) => k && v.localeCompare(isos[k - 1]) < 0)) bad.push('the timeline\'s stops are not in date order: ' + isos.slice(0, 4).join(', ') + '…');
  const keys = [...box.querySelectorAll('[data-do="find-open"]')].map(e => e.getAttribute('data-key'));
  if (keys.some(k => /^ct:/.test(k))) bad.push('the timeline still has an Animation tile: its engine is in attic (88a)');
  if (box.querySelector('[data-do="find-open"][href], a[target]')) bad.push('a timeline tile opens a page instead of a card in place');
  const ev = get('EV-0003'), hit = get('FIG-0004');
  if (!ev || !hit) return bad.concat(['EV-0003 or FIG-0004 is not in the list — the links were NOT checked']);
  const el = d.createElement('div'); el.innerHTML = w.stuffCard(ev);
  /* THE NAME IS A TAG (decisions 10 Nov evening, check-card-shape): an empty head, the name the first tag and the card's aria-label. */
  const evc = el.querySelector('.card.hdb'), first = el.querySelector('.hdb > .kc-tags .qtag');
  if (!evc || evc.getAttribute('aria-label') !== ev.name || !first || first.textContent.trim() !== ev.name || evc.querySelector(':scope > .kc-head > *')) bad.push('the event card is not named by its first tag and aria-label');
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
  if (press(ev, hit.key)) { await wait(120); onCard(hit, 'the event\'s Figure tile'); }
  if (t.AT() !== 'stuff') bad.push('following the timeline left Find for ' + t.AT());
  return bad;
});
