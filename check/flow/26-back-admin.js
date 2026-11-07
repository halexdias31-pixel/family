/* 432: THE OWNER'S SCREENSHOT — Q1(a)–(c) of a paper with a shared stem: tags, the answer box, and no words. A plan of the part's pages was kept from while it waited. */
check('a part with an answer box, its words landed from the Ledger, shows them on its card — and an old backend is said plainly, never a blank body (432)', async () => {
  const PID = 'P-1MA1-2211-2H';
  const full = LIB_FULL.rows('questions').filter(r => r.paper_id === PID);
  if (full.length < 10) return ['the paper ' + PID + ' is not in the library — nothing was checked'];
  const bad = [];
  const strip = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const open_ = async (W, rid) => {
    for (let i = 0; i < 100 && !(typeof W.stuffItemsAll_ === 'function' && W.stuffItemsAll_().some(x => x.row && x.row.row_id === rid)); i++) await wait(50);
    W.__t.STUFF().filters = [{ field: 'paperId', value: PID }];
    W.__t.go('stuff');
    W.paintStuff();
    const i = W.stuffPages_().findIndex(pg => pg.x.row && pg.x.row.row_id === rid);
    if (i < 0) return false;
    W.__t.goPage('stuff', W.stuffFirstResult_() + i, true);
    await wait(700);
    return true;
  };
  /* THE BACKEND ANSWERS AS IT SHOULD: every part's own card carries its words, under the tags and over the box. */
  {
    const one = boot({ serve: url => (/data\/questions\.json/.test(url) ? libSlimRows_(full) : undefined), before: signedInAs_(ANS_ADA),
      reply: b => (b.action === 'libItems' ? libReply_(full, b.ids) : undefined) });
    const W = one.w;
    if (!(await open_(W, 'Q-1MA1-2211-2H-1c'))) return ['Q1(c) of ' + PID + ' did not come into Find — nothing was checked'];
    const host = W.document.getElementById('s-stuff');
    const cards = [...host.querySelectorAll(':scope > .page')];
    ['1a', '1b', '1c'].forEach(p => {
      const row = full.find(r => r.row_id === 'Q-1MA1-2211-2H-' + p);
      const want = strip(W.document.createRange().createContextualFragment('<div>' + row.html + '</div>').firstChild).slice(0, 30);
      /* ONE CARD PER QUESTION NUMBER (960): each part is its own block (`.qb-part`) on Q1's one page */
      const k = W.stuffPages_().findIndex(pg => pg.part === 'q' && (pg.parts || [pg.x]).some(y => y.row && y.row.row_id === row.row_id));
      const card = k >= 0 ? cards[W.__t.domIndex('stuff', W.stuffFirstResult_() + k)] : null;
      const page = card ? card.querySelector('.qb-part[data-of="' + row.row_id + '"]') : null;
      if (!page) { bad.push('Q' + p + ' has no block on its card once its words came'); return; }
      const sheet = page.querySelector('.qsheet');
      if (!page.querySelector('.qp-area, textarea, input')) bad.push('Q' + p + '\'s card has no answer box — not the card in the screenshot');
      if (!sheet || strip(sheet).indexOf(want) === -1) bad.push('Q' + p + '\'s card shows tags and a box but not its words ("' + want + '"): ' + strip(sheet).slice(0, 100));
    });
    cards.forEach((pg, i) => {
      const sh = pg.querySelector('.qcard:not(.lib-wait) .qsheet');
      if (sh && !strip(sh) && !sh.querySelector('svg, img, figure, canvas, input, table')) bad.push('page ' + i + ' is a question with a blank body: ' + strip(pg).slice(0, 100));
    });
    if (one.errs.length) bad.push('errors: ' + one.errs.join(' | '));
  }
  /* A BACKEND OLDER THAN `libItems`: said to an admin as a deploy, under the tags, with Try again. */
  {
    const ADMIN = Object.assign({}, ANS_ADA, { role: 'admin', roles: ['admin'] });
    const one = boot({ serve: url => (/data\/questions\.json/.test(url) ? libSlimRows_(full) : undefined), before: signedInAs_(ADMIN),
      reply: b => (b.action === 'libItems' ? { error: 'Unknown action: libItems' } : undefined) });
    const W = one.w;
    if (!(await open_(W, 'Q-1MA1-2211-2H-1a'))) return bad.concat(['Q1(a) did not come into Find for the admin']);
    const front = libFront_(W), say = front && front.querySelector('.lib-say');
    if (!say || !/needs the latest backend — deploy it/.test(say.textContent) || !say.querySelector('[data-do="lib-retry"]')) bad.push('an old backend is not said plainly to an admin with Try again: ' + strip(say || front).slice(0, 140));
  }
  return bad;
});

/* A NEW CHAPTER PUBLIC BEFORE ITS WORDS ARE IMPORTED (`lib_pending`, 417; one rule with 411's since 436): asked for like any card; whole if the Ledger has the words, "Coming soon" if it answers missing. */
check('a new content card (lib_pending) is asked for, drawn whole when the Ledger has its words, and says Coming soon over its title when the Ledger answers missing', async () => {
  const def = LIB_FULL.defs().files.textbooks, full = LIB_FULL.rows('textbooks');
  const pend = full.filter(r => /^true$/i.test(String(r.lib_pending || '')) && !Object.prototype.hasOwnProperty.call(r, 'anim') && +r.chapter > 0);
  if (!pend.length) return ['no lib_pending chapter in data/textbooks.json — nothing was checked'];
  /* ITS WORDS AS THE LEDGER WOULD SEND THEM: this machine's, or a stand-in when a fresh clone has none (the rule is the same either way). */
  const target = pend.find(r => LIB_FULL.privateOf(def, r)) || pend[0];
  const words = LIB_FULL.privateOf(def, target) || { words: 'Stand-in word — sent by the Ledger in this check', points: 'Stand-in word: one worked line' };
  const slim = full.map(r => {
    const c = r === target ? words : LIB_FULL.privateOf(def, r);
    if (!c) return r;
    const out = {};
    Object.keys(r).forEach(k => { if (!(k in c)) out[k] = r[k]; });
    out.lib_has = def.private.filter(f => String(c[f] == null ? '' : c[f]).trim() !== '').join(' ');
    return out;
  });
  const wire = 'ct:' + target.book_id + '#' + target.chapter;
  const word = String(words.words || '').split('|')[0].split(' — ')[0].replace(/^\[H\] /, '').trim();
  const bad = [];
  for (const has of [true, false]) {
    const held = [];
    /* A COPY PER BOOT: `libFill_` writes the words back onto the row it was served, which would hand the second boot the first's. */
    const one = boot({ serve: url => (/data\/textbooks\.json/.test(url) ? JSON.parse(JSON.stringify(slim)) : undefined), before: signedInAs_(ANS_ADA),
      reply: b => (b.action === 'libItems' ? new Promise(ok => held.push(() => {
        const items = {}, missing = [];
        (b.ids || []).forEach(t => { if (t === wire && has) items[t] = words; else missing.push(t); });
        ok({ success: true, items: items, missing: missing, refused: [], left: 390, cap: 400 });
      })) : undefined) });
    const W = one.w, as = has ? 'with its words in the Ledger' : 'with the Ledger answering missing';
    for (let i = 0; i < 100 && !(typeof W.stuffItemsAll_ === 'function' && W.stuffItemsAll_().some(x => x.kind === 'content' && x.row && x.row.pending)); i++) await wait(50);
    const x = W.stuffItemsAll_().find(it => it.kind === 'content' && it.row && it.row.bookId === target.book_id && it.row.n === +target.chapter);
    if (!x) return [target.book_id + ' chapter ' + target.chapter + ' did not come into Find as a content card — nothing was checked'];
    if (!x.row.pending) bad.push('the chapter row says lib_pending and its content card is not marked pending');
    W.__t.STUFF().filters = [{ field: 'kindLabel', value: 'Library' }];
    W.__t.go('stuff');
    W.paintStuff();
    const i = W.stuffPages_().findIndex(pg => pg.x === x);
    if (i < 0) return ['the pending card is not among the pages of Content — nothing was checked'];
    W.__t.goPage('stuff', W.stuffFirstResult_() + i, true);
    await wait(300);
    let front = libFront_(W);
    const waiting = front && front.querySelector('.lib-wait');
    if (!waiting) bad.push(as + ': the pending card in front is not the waiting card before the answer: ' + (front ? front.textContent.replace(/\s+/g, ' ').slice(0, 120) : 'no page'));
    else if (waiting.textContent.indexOf(target.title) === -1) bad.push(as + ': the waiting card does not carry its title, ' + target.title);
    if (!(await libAskWent_(one, b => (b.ids || []).indexOf(wire) !== -1))) bad.push(as + ': no libItems request went for ' + wire);
    held.splice(0).forEach(f => f());
    await wait(500);
    front = libFront_(W);
    const txt = front ? front.textContent.replace(/\s+/g, ' ') : '';
    if (has && (!front || front.querySelector('.lib-wait') || txt.indexOf(word) === -1)) bad.push(as + ': the card is not drawn whole (wanted the key word "' + word + '"): ' + txt.slice(0, 120));
    if (!has && !/Coming soon\./.test(txt)) bad.push(as + ': it does not say Coming soon: ' + txt.slice(0, 120));
    if (!has && /not in the library yet/.test(txt)) bad.push(as + ': a pending card says "not in the library yet"');
    if (one.errs.length) bad.push(as + ': errors: ' + one.errs.join(' | '));
  }
  return bad;
});

/* A PAPER'S READING INSERT (458, 463): a Content card of its own in Find, no tile on its question; its private half asked for when the card is drawn, drawn with its line numbers; Coming soon, or Sign in */
check('a reading insert is Content in Find (no Insert tile on its question), asks the Ledger for its extract, and draws it with margin line numbers; Coming soon if missing, Sign in if signed out', async () => {
  const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'inserts.json'), 'utf8'));
  const card = cards.find(r => r.insert_id === 'INS-AQA-8700-R0389') || cards.find(r => r.for_papers && /source_text/.test(String(r.lib_has || '')));
  if (!card) return ['no reading insert card (for_papers, lib_has source_text) in data/inserts.json — nothing was checked'];
  if ('source_text' in card) return ['data/inserts.json carries the extract of ' + card.insert_id + ' — it belongs in the Ledger'];
  /* STAND-IN WORDS, never the extract: the rule is the same whatever the words */
  const words = { source_text: '# Source A\n\n> A stand-in note.\n\n[1] Stand-in words on the first line, and [5] more on the fifth.' };
  const wire = 'in:' + card.insert_id, bad = [];
  /* ITS PAPER'S QUESTION CARDS, as the repository has them (no words: the insert is what is asked) */
  const qrows = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8')).filter(r => r.paper_id === card.for_papers.split(',')[0].trim());
  for (const mode of ['has', 'missing', 'out']) {
    const held = [];
    const one = boot({ before: mode === 'out' ? undefined : signedInAs_(ANS_ADA),
      serve: url => (/data\/questions\.json/.test(url) ? JSON.parse(JSON.stringify(qrows)) : /data\/inserts\.json/.test(url) ? JSON.parse(JSON.stringify(cards)) : undefined),
      reply: b => (b.action === 'libItems' ? new Promise(ok => held.push(() => {
        const items = {}, missing = [];
        (b.ids || []).forEach(t => { if (t === wire && mode === 'has') items[t] = words; else missing.push(t); });
        ok({ success: true, items: items, missing: missing, refused: [], left: 390, cap: 400 });
      })) : undefined) });
    const W = one.w, d = W.document, A = W.__t.ACTIONS;
    const pid = card.for_papers.split(',')[0].trim();
    for (let i = 0; i < 200 && !(typeof W.stuffItemsAll_ === 'function' && W.stuffItemsAll_().some(x => x.kind === 'insert' && x.row && x.row.id === card.insert_id)
      && W.stuffItemsAll_().some(x => x.kind === 'question' && x.row && x.row.paper_id === pid)); i++) await wait(50);
    const x = W.stuffItemsAll_().find(it => it.kind === 'question' && it.row && it.row.paper_id === card.for_papers.split(',')[0].trim());
    if (!x) return ['no question of ' + card.for_papers + ' reached Find — nothing was checked'];
    /* NO INSERT TILE ON THE QUESTION (463): "they can open it in their 2nd finder" */
    if (/data-do="ins-show"/.test(W.stuffCard(x, 0)) || A['ins-show']) bad.push(mode + ': a question still carries an Insert tile, or ins-show still has a handler');
    const ins = W.stuffItemsAll_().find(it => it.kind === 'insert' && it.row && it.row.id === card.insert_id);
    const kinds = W.__t.facetBy('kindLabel').of(ins), type = W.__t.facetBy('documentType').of(ins);
    if (String(kinds) !== 'Library' || type) bad.push(mode + ': the insert is What kind ' + JSON.stringify(kinds) + ', Type ' + JSON.stringify(type) + ' -- wanted Content and no Type (463)');
    const host = d.createElement('div');
    host.innerHTML = W.stuffCard(ins, 0);
    d.querySelector('#s-stuff').appendChild(host);
    await wait(100);
    const sheet = () => host;
    const txt = () => (sheet() ? sheet().textContent.replace(/\s+/g, ' ') : '');
    if (mode === 'out') {
      if (!/Sign in to read the source/.test(txt())) bad.push('signed out: the sheet does not say Sign in to read the source: ' + txt().slice(0, 120));
      if (one.sent.some(b => b.action === 'libItems')) bad.push('signed out: a libItems request went anyway');
      continue;
    }
    if (!sheet() || !sheet().querySelector('.insrc-wait .loading')) bad.push(mode + ': the sheet is not the dots while the extract comes: ' + txt().slice(0, 120));
    if (!one.sent.some(b => b.action === 'libItems' && (b.ids || []).indexOf(wire) !== -1)) bad.push(mode + ': no libItems request went for ' + wire);
    held.splice(0).forEach(f => f());
    await wait(300);
    if (mode === 'has') {
      const lns = sheet() ? [...sheet().querySelectorAll('.insrc-ln')].map(e => e.textContent) : [];
      if (lns.join() !== '1,5') bad.push('with its words: the margin line numbers are [' + lns + '], wanted [1,5]');
      if (!/Stand-in words on the first line/.test(txt()) || /\[5\]/.test(txt())) bad.push('with its words: the extract is not drawn as text with its [n] made line numbers: ' + txt().slice(0, 160));
      if (!sheet() || !sheet().querySelector('.insrc-h') || !sheet().querySelector('.insrc-note')) bad.push('with its words: the heading or the paper\'s note is not drawn as one');
    } else if (!/Coming soon\./.test(txt())) bad.push('missing: a pending insert does not say Coming soon: ' + txt().slice(0, 120));
    if (one.errs.length) bad.push(mode + ': errors: ' + one.errs.join(' | '));
  }
  return bad;
});

/* WORDS AHEAD OF THE READER (447): a slow Ledger, a list shown, then scrolled a page at a time — the cards are whole before they are reached. */
const LIB_AHEAD_PID = 'P-AQA-8462-2406-2F';
async function libScrollRun_(o) {
  const full = LIB_FULL.rows('questions').filter(r => r.paper_id === LIB_AHEAD_PID);
  const slim = libSlimRows_(full);
  const calls = [];
  const one = boot({ serve: url => (/data\/questions\.json/.test(url) ? JSON.parse(JSON.stringify(slim)) : undefined),
    payload: o.gen ? Object.assign(payload(), { libGen: o.gen }) : undefined, before: signedInAs_(ANS_ADA),
    reply: b => (b.action === 'libItems' ? new Promise(ok => {
      const at = Date.now(), r = libReply_(full, b.ids);
      if (o.gen) r.gen = o.gen;
      setTimeout(() => { calls.push({ ids: (b.ids || []).length, bytes: JSON.stringify(r).length, ms: Date.now() - at }); ok(r); }, o.lat);
    }) : undefined) });
  const W = one.w;
  /* THE DEVICE'S STORE, stood in for (jsdom has no IndexedDB): the same three promises over a Map the journey keeps. */
  if (o.disk) W.libDisk_ = () => o.disk;
  for (let i = 0; i < 100 && !(typeof W.stuffItemsAll_ === 'function' && W.stuffItemsAll_().some(x => x.row && x.row.paper_id === LIB_AHEAD_PID)); i++) await wait(50);
  W.__t.STUFF().filters = [{ field: 'paperId', value: LIB_AHEAD_PID }];
  W.__t.go('stuff');
  W.paintStuff();
  await wait(o.lat + 1200);
  const cards = [];
  W.stuffPages_().forEach(pg => { if (pg.x && cards.indexOf(pg.x) === -1) cards.push(pg.x); });
  const wholeBefore = cards.slice(0, o.n).filter(x => !W.libSlim_(x)).length;
  W.__t.goPage('stuff', W.stuffFirstResult_(), true);
  await wait(50);
  let waits = 0, turns = 0, shifts = 0;
  const seen = new Set();
  for (let k = 0; k < o.turns; k++) {
    const at = pg_(W.__t).stuff || 0;
    const pg = W.stuffPages_()[at - W.stuffFirstResult_()];
    if (!pg) break;
    turns++;
    if (pg.x) seen.add(pg.x.key);
    if (pg.slim && W.libSlim_(pg.x)) waits++;
    const key = pg.x && pg.x.key, part = pg.part || '';
    await wait(o.pace);
    const now = W.stuffPages_()[(pg_(W.__t).stuff || 0) - W.stuffFirstResult_()];
    if ((pg_(W.__t).stuff || 0) !== at || !now || (now.x && now.x.key) !== key || (now.part || '') !== part) { shifts++; if (process.env.LIB_MEASURE) console.log('  shift at turn ' + k + ': page ' + at + '→' + (pg_(W.__t).stuff || 0) + ' ' + key + '/' + part + ' → ' + (now && now.x && now.x.key) + '/' + (now && now.part)); }
    W.__t.goPage('stuff', at + 1, true);
    await wait(20);
  }
  await wait(o.lat + 200);
  return { W: W, one: one, calls: calls, cards: cards.length, wholeBefore: wholeBefore, waits: waits, turns: turns, shifts: shifts, passed: seen.size };
}
const libRunSay_ = r => r.calls.length + ' calls (ids ' + r.calls.map(c => c.ids).join('/') + ', ' + Math.round(r.calls.reduce((s, c) => s + c.bytes, 0) / 1024) + ' KB, ' + (r.calls.length ? Math.round(r.calls.reduce((s, c) => s + c.ms, 0) / r.calls.length) : 0) + ' ms each); ' + r.wholeBefore + ' of the first cards whole before scrolling; ' + r.waits + ' of ' + r.turns + ' pages (' + r.passed + ' cards) waited in front; ' + r.shifts + ' moved under the reader';

check('words ahead: with a slow Ledger the first cards are whole before they are reached, scrolling never meets a waiting card, and nothing moves when words land (447)', async () => {
  /* `LIB_MEASURE=lat,pace,turns,n` measures another pace and prints what it saw. */
  const m = String(process.env.LIB_MEASURE || '').split(',').map(Number);
  const N = m[3] || 8;
  const r = await libScrollRun_({ lat: m[0] || 1500, pace: m[1] || 200, turns: m[2] || 40, n: N });
  if (process.env.LIB_MEASURE) console.log('  measured: ' + libRunSay_(r) + '; sent ' + r.one.sent.filter(b => b.action === 'libItems').map(b => b.ids.length).join('/') + '; LIB ' + JSON.stringify({ f: r.W.__t.lib().failed, p: r.W.__t.lib().pending.size, fl: r.W.__t.lib().flying.size }));
  const bad = [];
  if (r.cards < N + 4) return ['the paper ' + LIB_AHEAD_PID + ' gave ' + r.cards + ' cards — nothing was checked'];
  if (r.wholeBefore < N) bad.push('only ' + r.wholeBefore + ' of the first ' + N + ' cards were whole before the reader scrolled to them');
  if (r.waits) bad.push(r.waits + ' of ' + r.turns + ' pages were still waiting when they came in front: ' + libRunSay_(r));
  if (r.shifts) bad.push(r.shifts + ' times the page in front changed under the reader when words landed');
  if (r.calls.length > Math.ceil(r.turns / 4)) bad.push(r.calls.length + ' calls for ' + r.turns + ' pages — the words are not being asked for in batches');
  if (r.calls.some(c => c.ids > 60)) bad.push('a call carried more than 60 ids');
  if (r.one.errs.length) bad.push('errors: ' + r.one.errs.join(' | '));
  return bad;
});

/* A STORE LIKE `libDisk_`'s, over a Map. */
function libFakeDisk_() {
  const m = new Map();
  return { m: m, all: () => Promise.resolve([...m.values()].map(r => JSON.parse(JSON.stringify(r)))),
    put: recs => { recs.forEach(r => m.set(r.id, JSON.parse(JSON.stringify(r)))); return Promise.resolve(); },
    drop: ids => { ids.forEach(id => m.delete(id)); return Promise.resolve(); },
    clear: () => { m.clear(); return Promise.resolve(); } };
}
check('words on the device: a second visit is whole with no call, a new Ledger generation (`libGen`) never shows the old words, and signing out forgets them (447)', async () => {
  const disk = libFakeDisk_(), bad = [];
  const a = await libScrollRun_({ lat: 300, pace: 60, turns: 12, n: 4, gen: 'g1', disk: disk });
  const kept = [...disk.m.values()];
  if (!kept.length) return ['nothing was kept on the device after a visit — nothing was checked'];
  if (kept.some(r => r.gen !== 'g1' || r.who !== ANS_ADA.personId || !r.item)) bad.push('a kept record is not for g1 and this person: ' + JSON.stringify(kept[0]).slice(0, 160));
  if (a.one.errs.length) bad.push('first visit errors: ' + a.one.errs.join(' | '));
  const b = await libScrollRun_({ lat: 300, pace: 60, turns: 4, n: 4, gen: 'g1', disk: disk });
  const asked = b.one.sent.filter(x => x.action === 'libItems').map(x => x.ids).flat();
  const firstIds = new Set(kept.map(r => r.id));
  const again = asked.filter(t => firstIds.has(t));
  if (again.length) bad.push('the second visit asked the Ledger again for ' + again.length + ' items the device held: ' + again.slice(0, 4).join(', '));
  if (b.wholeBefore < 4) bad.push('on the second visit only ' + b.wholeBefore + ' of the first 4 cards were whole before scrolling');
  if (b.waits) bad.push('on the second visit ' + b.waits + ' pages waited in front');
  /* THE LEDGER WAS IMPORTED AGAIN: the old words must not be used, and they leave the device. */
  const c = await libScrollRun_({ lat: 300, pace: 60, turns: 4, n: 4, gen: 'g2', disk: disk });
  const asked2 = new Set(c.one.sent.filter(x => x.action === 'libItems').map(x => x.ids).flat());
  if (!asked2.size) bad.push('with a new generation nothing was asked of the Ledger — the old words were used');
  if ([...disk.m.values()].some(r => r.gen !== 'g2')) bad.push('records of the old generation are still on the device: ' + [...disk.m.values()].filter(r => r.gen !== 'g2').length);
  /* SIGNED OUT, THE DEVICE FORGETS. */
  c.W.signedOut_();
  await wait(50);
  if (disk.m.size) bad.push('after sign-out the device still holds ' + disk.m.size + ' items');
  if (c.one.errs.length) bad.push('errors: ' + c.one.errs.join(' | '));
  return bad;
});

check('a child sees a tutor card, the booking form and her session without any £, and is told to ask a parent (398)', async () => {
  /* THE OWNER, 23 Oct: "Kids' profiles shouldn't be able to see tutors' prices." The payload already sends her none (`kidPricesOff_`, check-kid-prices.js); this is the phone drawing none even when a figure is in hand. */
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (!w.findCard || !t.bookerCard || !t.jobPage || !t.jobTiles) return ['findCard, bookerCard, jobPage or jobTiles is not exported — cannot check'];
  const KID = { name: 'Mo Learner', personId: 'P-MO', role: 'kid', roles: ['kid'], token: 'tk-mo' };
  const PARENT = { name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] };
  const tutor = Object.assign({}, t.DATA().tutors[0], { rate: 22, extraSeat: 3, personId: 'P-GP' });
  const venue = t.DATA().venues[0];
  const job = { id: 'J-K', jobId: 'J-K', kind: '', subject: 'Maths', level: 'GCSE', price: 240, tutor: 'GeorgePovey',
    location: 'Colliers Wood Library', dates: '06/10/26, 13/10/26', status: 'unconfirmed',
    slots: [{ n: 1, client: 'Mo Learner', status: 'Agreed' }], tutorSlots: [{ key: 'a', name: 'GeorgePovey', status: 'Confirmed' }], events: [] };
  const other = Object.assign({}, job, { id: 'J-O', jobId: 'J-O', slots: [{ n: 1, client: '', status: 'Agreed' }], canAsk: true, openToOthers: true });
  const draw = () => {
    const B = t.BOOKING;
    B.how = 'Instant class'; B.loc = 'Colliers Wood Library'; B.subjects = ['Maths']; B.level = 'GCSE'; B.tutor = 'GeorgePovey';
    return {
      card: String(w.findCard({ kind: 'tutor', row: tutor }) || ''),
      venue: String(w.findCard({ kind: 'venue', row: venue }) || ''),
      paper: String(t.bookerCard() || ''),
      job: String(t.jobPage(job) || ''),
      tiles: String(t.jobTiles({ row: job }) || '') + String(t.jobTiles({ row: other }) || ''),
    };
  };
  const bad = [];
  /* THE PARENT FIRST — the proof that every surface below draws a price at all. */
  t.USER(PARENT);
  const p = draw();
  Object.keys(p).filter(k => k !== 'tiles').forEach(k => { if (!/£/.test(p[k])) bad.push('the parent\'s ' + k + ' shows no £, so the child\'s cannot prove anything'); });
  t.USER(KID);
  const k = draw();
  Object.keys(k).forEach(s => {
    const m = /[^<>]{0,30}£[^<>]{0,20}/.exec(k[s].replace(/<[^>]*>/g, ' '));
    if (m) bad.push('the child\'s ' + s + ' shows a price: "' + m[0].trim() + '"');
  });
  if (/prof-price|prof-rate|prof-seat/.test(k.card)) bad.push('the child\'s tutor card still holds the price box (an empty one is still a hole)');
  if (!/GeorgePovey/.test(k.card)) bad.push('the child is not drawn the tutor card at all');
  if (/class="bk-row rc-total"/.test(k.paper) || /class="bk-row rc-total"/.test(k.job)) bad.push('the child\'s form or session still draws a total row');
  if (/<span class="bk-r">\+\/h<\/span>/.test(k.paper)) bad.push('the child\'s form still draws the figure columns\' header');
  if (/data-do="book-send"/.test(k.paper)) bad.push('the child\'s form still offers "Ask for it" — she has no price to send, so a parent books');
  if (!/ask yours to book/i.test(k.paper)) bad.push('the child\'s form does not say a parent books it');
  if (/job-pay|job-join|job-take-seat/.test(k.tiles)) bad.push('the child is offered Pay or Join on a session: ' + (k.tiles.match(/job-(pay|join|take-seat)/g) || []).join(', '));
  /* AND THE SCREEN ITSELF: the booking column, drawn whole, has no £. */
  try { t.repaint(true); t.go('booking', false, true); } catch (e) { return bad.concat(['go("booking") threw: ' + e.message]); }
  await wait(150);
  const col = (d.getElementById('s-booking') || {}).textContent || '';
  if (!col.trim()) bad.push('the booking column drew nothing for the child');
  if (/£/.test(col)) bad.push('the child\'s booking column shows a price: "' + /.{0,30}£.{0,20}/.exec(col)[0] + '"');
  return bad;
});

/* ---------- POSTS WAIT FOR APPROVAL, PICTURES ARE FILES, A POST SHARES AS A PNG (413) ----------
   Through the real doPost and doGet: Ada's waiting post as she, a parent and the admin see it; Approve; a child's columns. */
const POST_ACTIONS_ = ['approvePost', 'editPost', 'deletePost', 'addPost', 'savePhoto', 'myProfile', 'messages', 'flagMessage', 'report', 'suggest', 'listSuggestions', 'decideSuggestion', 'readMessage'];
const postWorld_ = () => {
  const W = cardWorld_();
  W.real.seed('posts', [
    { post_id: 'PO-UP1', author: W.real.ev('brandName()'), posted_by: 'Hal Admin', image: 'https://drive.google.com/file/d/UPxxxxxxxxxxxxxxxxxxxxxx/view',
      caption: 'Open day on Saturday', approved: '', active: 'TRUE', posted_on: '01/10/2026' },
    { post_id: 'PO-W1', author: 'Ada Tutor', posted_by: 'Ada Tutor', image: 'https://drive.google.com/file/d/WAITxxxxxxxxxxxxxxxxxxxx/view',
      caption: 'Our volcano worksheet', approved: 'PENDING', active: 'TRUE', posted_on: '20/10/2026' },
  ]);
  return W;
};
const postOpen_ = async (W, who, more) => {
  more = more || {};
  const u = who ? W.user(who) : null;
  if (who && !u) return { err: who + ' could not sign in to the real backend' };
  /* THE POSTS AS `doGet` SENDS THEM TO THIS VIEWER, laid over the card world's payload, on every load. */
  const G = () => { W.real.ev('clearCache()'); const g = W.real.get(u ? { token: u.token } : {}); return Object.assign(W.GET(), { posts: g.posts }); };
  const b = boot({ payload: G(), before: w => { if (u) signedInAs_(u)(w); if (more.before) more.before(w); },
    serve: url => (/script\.google\.com/.test(url) ? G() : undefined),
    reply: bd => (POST_ACTIONS_.indexOf(bd.action) !== -1 ? W.real.post(bd) : { success: true, messages: [] }) });
  for (let k = 0; k < 80 && !b.w.__t; k++) await wait(100);
  if (!b.w.__t) return { err: 'the app did not finish loading' };
  await wait(600);
  const t = b.w.__t, d = b.w.document;
  try { t.go('feed', false, true); b.w.paint('feed'); } catch (e) { return { err: 'drawing the feed threw: ' + e.message }; }
  await wait(250);
  return { b, w: b.w, t, d, u, sent: b.sent, A: (act, el) => t.ACTIONS[act](el),
    post: id => d.querySelector('#s-feed [data-post="' + id + '"]'),
    tiles: id => { const p = d.querySelector('#s-feed [data-post="' + id + '"]'); return p ? [...p.querySelectorAll('.tile-row [data-do]')].map(x => x.dataset.do + (x.dataset.on !== undefined ? ':' + x.dataset.on : '')) : []; },
    errs: b.errs };
};

check('a waiting post (413): dotted with "Waiting for approval" for its author and the admin only; the admin\'s Approve puts it up for everyone, and Business glows until then', async () => {
  const W = postWorld_(), bad = [];
  const ada = await postOpen_(W, 'tutor@example.org');
  if (ada.err) return [ada.err];
  const mine = ada.post('PO-W1');
  if (!mine) return ['Ada is not drawn her own waiting post'];
  if (!mine.classList.contains('is-pending')) bad.push('Ada\'s waiting post has no dotted outline (is-pending)');
  const line = mine.querySelector('.post-pending');
  if (!line || !/Waiting for approval/.test(line.textContent) || !/only you and the admin/.test(line.textContent)) bad.push('Ada\'s waiting post does not say it waits and who sees it: ' + (line ? line.textContent : 'no line'));
  const at = ada.tiles('PO-W1');
  if (at.some(x => /^post-approve/.test(x))) bad.push('Ada is offered Approve on her own post: ' + at.join(','));
  if (!at.includes('post-edit') || !at.includes('post-delete') || !at.includes('share')) bad.push('Ada\'s waiting post lacks Edit, Delete or Share: ' + at.join(','));
  const ut = ada.tiles('PO-UP1');
  if (ut.includes('post-edit') || ut.includes('post-delete')) bad.push('Ada is offered Edit or Delete on the business\'s post: ' + ut.join(','));

  const pat = await postOpen_(W, 'parent@example.org');
  if (pat.err) return bad.concat([pat.err]);
  if (pat.post('PO-W1')) bad.push('a parent is drawn somebody else\'s waiting post');
  if (!pat.post('PO-UP1')) bad.push('a parent is not drawn the post that is up, so the rule above proves nothing');

  const hal = await postOpen_(W, 'admin@example.org');
  if (hal.err) return bad.concat([hal.err]);
  const waits = hal.post('PO-W1');
  if (!waits || !waits.classList.contains('is-pending') || !/Waiting for approval/.test((waits.querySelector('.post-pending') || {}).textContent || '')) bad.push('the admin is not drawn the waiting post dotted, with its line');
  const ht = hal.tiles('PO-W1');
  if (!ht.includes('post-approve:1') || !ht.includes('post-approve:')) bad.push('the admin has no Approve and Decline tiles on the waiting post: ' + ht.join(','));
  if (ht.includes('post-edit')) bad.push('the admin is offered Edit on somebody\'s waiting post: ' + ht.join(','));
  /* BUSINESS GLOWS: the posts card needs you, and the dot counts it. */
  try { hal.t.go('site', false, true); hal.w.paint('site'); } catch (e) { bad.push('drawing Business threw: ' + e.message); }
  await wait(300);
  const card = hal.d.querySelector('#s-site [data-need="posts"]');
  if (!card || !card.classList.contains('needs-you')) bad.push('the Business posts card does not glow with a post waiting');
  const dot = hal.d.getElementById('biz-dot');
  if (!dot || !/\d/.test(dot.textContent)) bad.push('no red dot counts what Business needs');
  try { hal.t.go('feed', false, true); hal.w.paint('feed'); } catch (e) {}
  await wait(200);
  const yes = hal.d.querySelector('#s-feed [data-post="PO-W1"] [data-do="post-approve"][data-on="1"]');
  if (yes) { hal.A('post-approve', yes); await wait(900); }
  if (String(W.sheet('S(read(TAB.posts).rows.find(r => r.post_id === "PO-W1").approved)')) !== '') bad.push('Approve did not put it up on the sheet');
  const upNow = hal.post('PO-W1');
  if (!upNow || upNow.classList.contains('is-pending')) bad.push('after Approve the admin\'s feed still draws it waiting');
  else if (hal.tiles('PO-W1').some(x => /^post-approve/.test(x))) bad.push('after Approve the post still offers Approve');
  const pat2 = await postOpen_(W, 'parent@example.org');
  if (!pat2.err && !pat2.post('PO-W1')) bad.push('after Approve a parent is still not drawn it');
  /* UP IS FINAL: its author has Delete and no Edit now. */
  const ada2 = await postOpen_(W, 'tutor@example.org');
  if (!ada2.err) { const t2 = ada2.tiles('PO-W1'); if (t2.includes('post-edit') || !t2.includes('post-delete')) bad.push('once up, Ada\'s post should offer Delete and no Edit: ' + t2.join(',')); }
  [ada, pat, hal].forEach(x => { if (x.errs.length) bad.push('errors: ' + x.errs.join(' | ')); });
  return bad;
});

check('Edit post (453) turns the post card into its editor in place — no page over the feed; Back gives the card back', async () => {
  const W = postWorld_(), bad = [];
  const ada = await postOpen_(W, 'tutor@example.org');
  if (ada.err) return [ada.err];
  const d = ada.d;
  const card = ada.post('PO-W1');
  const ed = card && card.querySelector('[data-do="post-edit"]');
  if (!ed) return ['Ada\'s waiting post has no Edit tile — NOT checked'];
  ada.A('post-edit', ed);
  await wait(100);
  const sheet = d.getElementById('sheet');
  if (!sheet || sheet.classList.contains('hidden')) return bad.concat(['Edit opened nothing']);
  if (!sheet.closest('[data-post="PO-W1"]')) bad.push('the editor is not inside the post card');
  if (!card.classList.contains('sheet-swap')) bad.push('the card did not turn into the editor');
  /* jsdom draws no stylesheet, so the rule that hides the card's own content is read from style.css. */
  if (sheet.parentElement !== card) bad.push('the editor is not a direct child of the card, so its hiding rule cannot reach it');
  const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  if (!/\.sheet-swap\s*>\s*:not\(#sheet\)\s*\{[^}]*display:\s*none/.test(css)) bad.push('nothing in style.css hides the post beside its editor');
  if (d.body.classList.contains('sheet-open') || (d.getElementById('screen') || {}).inert) bad.push('Edit took the screen over');
  if (/fixed|absolute/.test(ada.w.getComputedStyle(sheet).position || '')) bad.push('the editor floats');
  if (!d.getElementById('pe-cap')) bad.push('the editor has no caption box');
  d.getElementById('sheet-close').click(); await wait(100);
  if (!sheet.classList.contains('hidden')) bad.push('Back did not close the editor');
  if (card.classList.contains('sheet-swap') || sheet.closest('[data-post]')) bad.push('Back left the card as an editor');
  if (ada.errs.length) bad.push('errors: ' + ada.errs.join(' | '));
  return bad;
});

check('Write a post (448) turns the camera card into the composer in place — no sheet, no picture picker; the poll is one box per option, 2 to 6; Back brings the camera back; Post sends the options joined', async () => {
  const W = postWorld_(), bad = [];
  const pat = await postOpen_(W, 'parent@example.org');
  if (pat.err) return [pat.err];
  const d = pat.d;
  const write = d.querySelector('#s-feed .cam-card .cam-bar [data-do="new-post"]');
  const pick = d.querySelector('#s-feed .cam-card .cam-bar label.cam-pick');
  if (!write || !write.classList.contains('cam-round')) bad.push('Write a post is not a round button in the camera bar');
  if (!pick || !pick.classList.contains('cam-round')) bad.push('Photos is not a round button in the camera bar');
  pat.A('new-post', write);
  await wait(100);
  const sheet = d.getElementById('sheet');
  if (sheet && !sheet.classList.contains('hidden')) bad.push('Write a post opened a sheet over the page');
  if (d.body.classList.contains('sheet-open')) bad.push('the body is marked sheet-open');
  if (d.querySelector('[role="dialog"]:not(.hidden) #post-cap, dialog #post-cap')) bad.push('the composer is in a dialog');
  const comp = d.querySelector('#s-feed .cam-card #post-compose');
  if (!comp) return bad.concat(['the composer is not drawn inside the feed\'s camera card — NOT checked further']);
  if (d.querySelector('#s-feed .cam-card #cam-view')) bad.push('the viewfinder is still on the card beside the composer');
  if (comp.querySelector('input[type="file"]')) bad.push('the text composer offers a picture picker');
  const pos = (pat.w.getComputedStyle(comp).position || '');
  if (/fixed|absolute/.test(pos)) bad.push('the composer is positioned ' + pos + ', which is an overlay');
  const boxes = () => comp.querySelectorAll('.post-poll-in').length;
  if (boxes() !== 2) bad.push('the poll starts with ' + boxes() + ' option boxes, wanted 2');
  for (let k = 0; k < 8; k++) { const m = d.getElementById('poll-more'); if (m && !m.hidden) pat.A('poll-more', m); }
  if (boxes() !== 6) bad.push('Add option stopped at ' + boxes() + ' boxes, wanted 6');
  if (!d.getElementById('poll-more').hidden) bad.push('Add option still shows at the maximum');
  d.getElementById('post-cap').value = 'Which day?';
  d.getElementById('post-poll-0').value = 'Saturday';
  pat.A('post-send', comp.querySelector('[data-do="post-send"]'));
  await wait(50);
  if (!/two options/.test(d.getElementById('post-said').textContent)) bad.push('a poll of one option was not refused');
  d.getElementById('post-poll-1').value = 'Sunday, after lunch';
  const n0 = pat.sent.length;
  pat.A('post-send', comp.querySelector('[data-do="post-send"]'));
  await wait(400);
  const got = pat.sent.slice(n0).find(x => x && x.action === 'addPost');
  if (!got) bad.push('Post it sent no addPost');
  else {
    if (got.poll !== 'Saturday, Sunday after lunch') bad.push('the poll went as ' + JSON.stringify(got.poll));
    if (got.data || (got.media && got.media.length)) bad.push('a words-only post sent pictures');
  }
  await wait(600);
  if (got && d.querySelector('#s-feed #post-compose')) bad.push('after posting the composer is still open: ' + JSON.stringify((d.getElementById('post-said') || {}).textContent));
  pat.A('new-post', d.querySelector('#s-feed [data-do="new-post"]'));
  await wait(50);
  pat.A('post-cancel');
  await wait(50);
  if (d.querySelector('#s-feed #post-compose') || !d.querySelector('#s-feed .cam-card #cam-view')) bad.push('Back did not bring the camera back');
  if (pat.errs.length) bad.push('errors: ' + pat.errs.join(' | '));
  return bad;
});

check('a child (413) is drawn no picker anywhere: no camera on the feed, no + in a message, no Choose photo; a parent has all three', async () => {
  const W = postWorld_(), bad = [];
  const kid = await postOpen_(W, 'student@example.org');
  if (kid.err) return [kid.err];
  const feedFiles = kid.d.querySelectorAll('#s-feed input[type="file"]').length;
  if (feedFiles) bad.push('the child\'s feed has ' + feedFiles + ' file picker(s)');
  if (!kid.d.querySelector('#s-feed .cam-kid')) bad.push('the child\'s feed does not say a grown-up puts pictures up');
  if (/msg-file-in|msg-attach/.test(String(kid.w.msgForm_('Hal Admin', 'P-A1')))) bad.push('the child\'s message box offers to attach a file');
  try { kid.t.ACTIONS['new-post'](); } catch (e) { bad.push('Write a post threw for the child: ' + e.message); }
  await wait(100);
  if (kid.d.querySelector('#post-compose, #sheet-body #post-cap')) bad.push('the child was opened a composer');
  const kidPfp = String(kid.w.photoPicker_ ? kid.w.photoPicker_(() => '', '') : '');
  if (kidPfp && /pfp-pick|pfp-in/.test(kidPfp)) bad.push('the child\'s picture card offers Choose photo');
  const pat = await postOpen_(W, 'parent@example.org');
  if (pat.err) return bad.concat([pat.err]);
  if (!pat.d.querySelector('#s-feed input#cam-pick[type="file"]')) bad.push('a parent\'s feed has no Photos picker, so the child rule proves nothing');
  if (!/msg-file-in/.test(String(pat.w.msgForm_('Ada Tutor', 'P-T1')))) bad.push('a parent\'s message box has no attach');
  if (pat.d.querySelector('#s-feed #cam-as')) bad.push('a parent is asked whether to post as the business');
  const hal = await postOpen_(W, 'admin@example.org');
  if (!hal.err && !hal.d.querySelector('#s-feed #cam-as')) bad.push('the admin is not asked to post as the business or as themselves');
  return bad;
});

check('Share on a post (413) draws the whole post on a canvas and hands a PNG to the share sheet; with no file sharing it downloads it', async () => {
  const W = postWorld_(), bad = [];
  const drawn = [], clicks = [];
  const a = await postOpen_(W, 'parent@example.org', { before: w => {
    w.Image = class { set src(v) { this._src = v; this.naturalWidth = 1200; this.naturalHeight = 900; setTimeout(() => this.onload && this.onload(), 0); }
                      get src() { return this._src; } };
    const ctx = new Proxy({ measureText: s => ({ width: String(s).length * 18 }), fillText: (s) => drawn.push(String(s)),
      getImageData: () => ({ data: [0, 0, 0, 0] }), createRadialGradient: () => ({ addColorStop() {} }) },
      { get: (o, k) => (k in o ? o[k] : () => {}), set: () => true });
    w.HTMLCanvasElement.prototype.getContext = function () { return ctx; };
    w.HTMLCanvasElement.prototype.toBlob = function (cb, type) { const b = new w.Blob(['\x89PNG'], { type }); setTimeout(() => cb(b), 0); };
    w.URL.createObjectURL = () => 'blob:post'; w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = function () { clicks.push({ href: this.href, download: this.download }); };
  } });
  if (a.err) return [a.err];
  const tile = a.d.querySelector('#s-feed [data-post="PO-UP1"] [data-do="share"]');
  if (!tile) return ['the post has no Share tile'];
  const shared = [];
  a.w.navigator.canShare = x => !!(x && x.files && x.files.length);
  a.w.navigator.share = x => { shared.push(x); return Promise.resolve(); };
  a.A('share', tile);
  for (let k = 0; k < 60 && !shared.length; k++) await wait(50);
  const f = shared[0] && (shared[0].files || [])[0];
  if (!f) bad.push('navigator.share was not handed a file: ' + JSON.stringify(shared[0] || null));
  else {
    if (f.type !== 'image/png' || !/\.png$/.test(f.name)) bad.push('the file shared is ' + f.type + ' "' + f.name + '", not a .png');
    if (!/\?post=PO-UP1/.test(shared[0].text || '')) bad.push('the share does not carry the post\'s link: ' + shared[0].text);
  }
  const words = drawn.join(' ');
  if (!/Open day on Saturday/.test(words)) bad.push('the picture does not carry the caption: ' + words.slice(0, 160));
  if (!words.includes(String(W.real.ev('brandName()')))) bad.push('the picture does not carry the brand at its foot');
  /* NO FILE SHARING: the picture is downloaded instead. */
  a.w.navigator.canShare = () => false;
  a.A('share', tile);
  for (let k = 0; k < 60 && !clicks.length; k++) await wait(50);
  if (!clicks.length || !/\.png$/.test(clicks[0].download || '')) bad.push('with no file sharing the PNG was not downloaded: ' + JSON.stringify(clicks));
  if (a.errs.length) bad.push('errors: ' + a.errs.join(' | '));
  return bad;
});

check('a child sends on a message she was sent (413, 494): the one Tell the admin tile on received messages only, words optional, "Thanks — sent to the admin"; it waits on Suggestions, glowing, until dismissed', async () => {
  const W = postWorld_(), bad = [];
  W.real.seed('messages', [
    { message_id: 'M-IN1', from_id: 'P-A1', to_id: 'P-S1', sent_at: '23/10/2026 10:00', body: 'Homework is due Friday' },
    { message_id: 'M-OUT1', from_id: 'P-S1', to_id: 'P-A1', sent_at: '23/10/2026 10:05', body: 'OK thanks' },
  ]);
  const kid = await postOpen_(W, 'student@example.org');
  if (kid.err) return [kid.err];
  try { kid.t.go('dm', false, true); kid.w.paint('dm'); } catch (e) { return ['opening Messages threw: ' + e.message]; }
  for (let k = 0; k < 40 && !kid.d.querySelector('#s-dm .msg'); k++) { await wait(100); try { kid.w.paint('dm'); } catch (e) {} }
  const flags = [...kid.d.querySelectorAll('#s-dm [data-do="rep-box"][data-rk="message"]')].map(x => x.dataset.ri);
  if (JSON.stringify(flags) !== JSON.stringify(['M-IN1'])) return ['the Tell the admin tiles are on ' + JSON.stringify(flags) + ' — wanted the received message only'];
  kid.A('rep-box', kid.d.querySelector('#s-dm [data-do="rep-box"][data-rk="message"]'));
  await wait(150);
  /* ONE BOX FOR EVERY REPORT (486), in place under the message. */
  const form = kid.d.querySelector('#s-dm .rep-box[data-rk="message"]');
  if (!form) return ['Tell the admin did not open its box under the message'];
  if (form.querySelector('select')) bad.push('the box still asks for a reason');
  const tl = kid.d.querySelector('#s-dm [data-do="rep-box"][data-rk="message"]');
  if (tl.getAttribute('aria-label') !== 'Tell the admin') bad.push('the message tile is called ' + tl.getAttribute('aria-label'));
  const note = form.querySelector('.rep-note-in'); note.value = 'it was scary';
  kid.A('rep-send', form.querySelector('[data-do="rep-send"]'));
  for (let k = 0; k < 30 && !/Thanks — sent/.test((kid.d.getElementById('toast') || {}).textContent || ''); k++) await wait(50);
  const post = kid.sent.find(b => b.action === 'suggest');
  if (!post || post.kind !== 'message' || post.itemId !== 'M-IN1' || !/it was scary/.test(post.note)) bad.push('the send did not carry the message and the words: ' + JSON.stringify(post));
  if (!/Thanks — sent/.test((kid.d.getElementById('toast') || {}).textContent || '')) bad.push('no "Thanks — sent"');
  if (String(W.sheet('S((read(TAB.claude_notes).rows.find(r => r.item_id === "message|M-IN1") || {}).status)')) !== 'pending') bad.push('it is not a waiting row of claude_notes');
  const hal = await postOpen_(W, 'admin@example.org');
  if (hal.err) return bad.concat([hal.err]);
  try { hal.t.go('site', false, true); hal.w.paint('site'); } catch (e) {}
  for (let k = 0; k < 40 && !hal.d.querySelector('#s-site .rep-item'); k++) await wait(100);
  await wait(300);   // the glow is painted just after the column (`bizNeedsPaint_`)
  const item = [...hal.d.querySelectorAll('#s-site .rep-item')].find(n => /Homework is due Friday/.test(n.textContent));
  if (!item || !/scary/.test(item.textContent)) bad.push('the Suggestions card does not show the message and the words');
  const card = hal.d.querySelector('#s-site [data-need="reports"]');
  if (!card || !card.classList.contains('needs-you')) bad.push('the Suggestions card does not glow with a message waiting');
  const done = item && item.querySelector('[data-do="rep-status"][data-decision="dismiss"]');
  if (!done) bad.push('no Dismiss tile on the reported message');
  else { hal.A('rep-status', done); await wait(400); }
  if ([...hal.d.querySelectorAll('#s-site .rep-item')].some(n => /Homework is due Friday/.test(n.textContent))) bad.push('Dismiss left the message on the card');
  if (String(W.sheet('S((read(TAB.claude_notes).rows.find(r => r.item_id === "message|M-IN1") || {}).status)')) !== 'dismissed') bad.push('Dismiss did not write dismissed on the sheet');
  [kid, hal].forEach(x => { if (x.errs.length) bad.push('errors: ' + x.errs.join(' | ')); });
  return bad;
});

/* ---------- AFTER A WRONG CHECK, THE ANSWER CAN ALWAYS BE DELETED AND CHECKED AGAIN (docs/history/454) ---------- */
check('after a wrong Check every answer can be deleted and checked again — typed on the keypad, picked, ordered — and after a reload', async () => {
  const bad = [];
  const TYPED = { kind: 'question', key: 'q:Q-DEL-1', name: 'Q1', marks: 1, subject: 'Maths', answerType: 'calculation', accept: '727',
    row: { row_id: 'Q-DEL-1', paper_id: 'P-DEL', subject: 'Maths', name: 'Paper 1: Arithmetic' }, html: '<p>689 + 38 =</p>', answer: '<b>727</b>' };
  const PICK = { kind: 'question', key: 'q:Q-DEL-2', name: 'Q2', marks: 1, subject: 'Maths', choices: ['14', '15', '16'], choiceRight: [2],
    row: { row_id: 'Q-DEL-2', paper_id: 'P-DEL', subject: 'Maths', name: 'Del' }, html: '<p>5/8 of 24</p>', answer: '<b>15</b>' };
  const ORD = { kind: 'question', key: 'q:Q-DEL-3', name: 'Q3', marks: 1, subject: 'Maths', answerType: 'order',
    row: { row_id: 'Q-DEL-3', paper_id: 'P-DEL', subject: 'Maths', name: 'Del' }, html: '<p>Smallest first.</p>',
    choices: ['3', '1', '2'], choiceRight: [2, 3, 1], choiceWays: [[2, 3, 1]], orderEnds: ['smallest', 'largest'], answer: '<b>1, 2, 3</b>' };
  const ALL = [TYPED, PICK, ORD];
  const run = async (b, when) => {
    const { w, errs } = b;
    const d = w.document, A = w.__t.ACTIONS;
    const held = w.stuffItemsAll_;
    w.stuffItemsAll_ = () => (held ? held() : []).concat(ALL);
    const host = d.createElement('div');
    d.body.appendChild(host);
    host.innerHTML = ALL.map(x => w.questionCard_(x, 0)).join('');
    const inp = host.querySelector('.qp-ans-in[data-k="' + w.__t.ansKey(TYPED) + '"]');
    const pad = () => d.getElementById('kp');
    const press = v => { const k = pad() && pad().querySelector('.kp-key[data-v="' + v + '"]'); if (k) A['kp-key'](k); else bad.push(when + ': no key ' + v); };
    /* TYPED: wrong, Check, then back into the box by a TAP ON ITS DRAWING, as a finger does -- the tap that put the caret at 0 and froze ⌫ */
    if (!inp) { bad.push(when + ': no keypad box'); return; }
    const mark = inp.closest('.qp-mark');
    if (!inp.value) { inp.focus(); press('7'); press('1'); press('7'); press('!done'); }
    else A['qp-check'](mark.querySelector('.qp-check'));
    if (inp.value !== '717' || !mark.classList.contains('is-near')) bad.push(when + ': 717 was not marked "not yet" in the box: ' + JSON.stringify(inp.value) + ' ' + mark.className);
    inp.blur(); await wait(10);
    const show = inp.parentNode.querySelector('.kp-show');
    show.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1, clientX: 1, clientY: 1 }));
    if (d.activeElement !== inp || pad().hidden) bad.push(when + ': a tap on the marked answer did not bring the keypad back to it');
    press('!back');
    if (inp.value !== '71') bad.push(when + ': ⌫ after tapping back into a wrong answer left ' + JSON.stringify(inp.value) + ', wanted "71"');
    if (mark.classList.contains('is-near')) bad.push(when + ': the edit left "not yet" on a different answer');
    /* THE CARET AT THE START is never a dead ⌫ in a maths box */
    inp.setSelectionRange(0, 0);
    press('!back');
    if (inp.value !== '7') bad.push(when + ': ⌫ with the caret before the answer left ' + JSON.stringify(inp.value) + ', wanted "7"');
    inp.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    if (inp.value !== '') bad.push(when + ': a keyboard Backspace left ' + JSON.stringify(inp.value));
    press('7'); press('2'); press('7'); press('!done');
    if (!mark.classList.contains('is-right')) bad.push(when + ': 727 typed after deleting was not marked right: ' + mark.className);
    /* PICKED: a wrong pick, then another */
    const box = host.querySelector('.qp-choices');
    A['qp-choose'](box.querySelector('.qp-opt[data-n="1"]'));
    const box2 = host.querySelector('.qp-choices');
    if (!box2.classList.contains('is-miss')) bad.push(when + ': a wrong pick was not "not yet"');
    A['qp-choose'](box2.querySelector('.qp-opt[data-n="2"]'));
    if (!host.querySelector('.qp-choices.is-done .qp-opt[data-n="2"].is-picked')) bad.push(when + ': a second pick after a wrong one was not taken');
    /* ORDERED: a wrong row sent, then a place taken back and Clear */
    const ob = () => host.querySelector('.qp-order');
    [1, 2, 3].forEach(n => { const it = ob().querySelector('.qp-item[data-n="' + n + '"]'); if (it) it.click(); });
    ob().querySelector('.qp-order-send').click();
    await wait(20);
    if (!ob().classList.contains('is-near')) bad.push(when + ': a wrong ordering was not "not yet": ' + ob().className);
    const full = ob().querySelector('.qp-slot.is-full');
    if (full) full.click(); else bad.push(when + ': no placed item to take back');
    if (ob().querySelectorAll('.qp-slot.is-full').length !== 2) bad.push(when + ': taking a place back after a wrong Send did nothing');
    const clr = ob().querySelector('[data-do="qp-order-clear"]');
    if (clr) { clr.click(); if (ob().querySelectorAll('.qp-slot.is-full').length) bad.push(when + ': Clear after a wrong Send left items placed'); }
    await wait(360);   // a person's second go, not a double tap's second half (534)
    [2, 3, 1].forEach(n => ob().querySelector('.qp-item[data-n="' + n + '"]').click());
    ob().querySelector('.qp-order-send').click();
    await wait(20);
    if (!/Correct/.test((ob().querySelector('.qp-verdict') || {}).textContent || '')) bad.push(when + ': the right order sent after a wrong one was not Correct');
    if (errs.length) bad.push(when + ': errors: ' + errs.join(' | '));
    host.remove();
  };
  const b1 = boot();
  await wait(300);
  if (typeof b1.w.questionCard_ !== 'function' || !b1.w.__t.ACTIONS['kp-key']) return ['questionCard_ or the keypad is not reachable — NOT checked'];
  await run(b1, 'first visit');
  /* AND AFTER A RELOAD, the wrong answer back in the box from the device */
  const b2 = boot({ before: win => { try { win.localStorage.setItem('ans:q:Q-DEL-1', '717'); } catch (e) {} } });
  await wait(300);
  await run(b2, 'after a reload');
  return bad;
});

/* ---------- THE ONE TOOLKIT ON EVERY KIND OF QUESTION PAGE (docs/history/457) ---------- */
check('the one toolkit: a typed, a chosen, a table, a drawn and an essay part, and a stem page, each have the Magnifier, the padlock, Read aloud, Help and Report; the Magnifier follows a mouse and a held finger, the padlock holds and lets go, the pen has its instruments', async () => {
  const LIB = LIB_FULL.rows('questions');
  const { w } = boot({ member: true, serve: url => (/data\/questions\.json/.test(url) ? LIB : undefined),
    before: win => {
      signedInAs_(MEMBER_)(win);
      win.SpeechSynthesisUtterance = function (txt) { this.text = String(txt); };
      win.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [] };
    } });
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (typeof w.qtRow_ !== 'function' || !A['q-mag'] || !A['q-lock'] || !t.padlock) return ['qtRow_, the q-mag or q-lock handler, or PADLOCK is not reachable — NOT checked'];
  /* NO ZOOM SHEET AND NO FIGURE TILE ANY MORE (463) */
  ['q-zoom', 'q-zoom-fig', 'q-zoom-by', 'q-fig', 'ins-show'].forEach(a => { if (A[a]) bad.push(a + ' still has a handler -- it went in 463'); });
  t.STUFF().filters = [];
  const all = w.stuffItemsAll_().filter(x => x && x.kind === 'question' && x.row && !/^true$/i.test(String(x.row.lib_pending || '')));
  const T = x => w.qType_(x);
  const pick = {
    typed: all.find(x => T(x) === 'value' && x.diagram && /math/i.test(x.subject || '') && w.partChunks_(x).length === 1),
    chosen: all.find(x => T(x) === 'choose1' && String(x.row.choice_right || '').trim()),
    table: all.find(x => T(x) === 'table'),
    drawn: all.find(x => String(x.drawAnswer || '').trim() && /math/i.test(x.subject || '')),
    essay: all.find(x => T(x) === 'essay'),
  };
  Object.keys(pick).forEach(k => { if (!pick[k]) bad.push('no ' + k + ' part in the library to hold the toolkit against'); });
  if (bad.length) return bad;
  /* THE WHOLE CARD (960): the Magnifier and padlock are its foot's since 1040 r12, not a lone part's */
  const whole = x => w.questionWhole_(x, [x]);
  const host = d.createElement('div');
  d.body.appendChild(host);
  for (const k of Object.keys(pick)) {
    const x = pick[k];
    host.innerHTML = whole(x);
    const missing = ['q-mag', 'q-lock', 'read-aloud', 'help-hand', 'rep-box'].filter(a => !host.querySelector('[data-do="' + a + '"]'));
    if (missing.length) bad.push(k + ' part ' + x.row.row_id + ' has no ' + missing.join(', '));
    const gone = ['q-zoom', 'q-fig', 'ins-show'].filter(a => host.querySelector('[data-do="' + a + '"]'));
    if (gone.length) bad.push(k + ' part ' + x.row.row_id + ' still has ' + gone.join(', ') + ' (463)');
  }
  /* THE PEN HAS PEN, RULER, COMPASS AND PROTRACTOR whatever its words say (the Protractor since 458) */
  host.innerHTML = whole(pick.drawn);
  const tools = [...host.querySelectorAll('.qt-row .qt-t:is([data-do="qt-inst"], [data-do="qt-pen"])')].map(e => e.getAttribute('data-tool'));
  if (tools.join() !== 'pen,line,ruler,protractor,compass') bad.push('the drawn part ' + pick.drawn.row.row_id + ' has the tools ' + JSON.stringify(tools) + ', not pen, straight line, ruler, protractor, compass');
  /* A TYPED PART WITH A FIGURE MEASURES IT: Protractor and Ruler, without the word "measure" */
  host.innerHTML = whole(pick.typed);
  const meas = [...host.querySelectorAll('.q-meast')].map(e => e.getAttribute('data-tool'));
  if (meas.join() !== 'ruler,protractor') bad.push('the typed part ' + pick.typed.row.row_id + ' with a figure measures with ' + JSON.stringify(meas));
  /* THE MAGNIFIER (463): on, a mouse over the page carries a 2.5x copy of it, figure and all; a held finger brings it up above the finger and lifting puts it away */
  const ptr = (type, o) => { const e = new w.Event(type, { bubbles: true, cancelable: true }); Object.keys(o).forEach(k => Object.defineProperty(e, k, { value: o[k] })); return e; };
  host.className = 'page';
  /* A PART WITH ITS OWN FIGURE IS A PAD FROM THE START (1020): the figure is the pad's art */
  const fig = host.querySelector('.qsheet figure, .qsheet .qpad-art');
  A['q-mag'](host.querySelector('[data-do="q-mag"]'));
  if (host.querySelector('[data-do="q-mag"]').getAttribute('aria-pressed') !== 'true') bad.push('the Magnifier tile does not say it is on');
  (fig || host).dispatchEvent(ptr('pointermove', { pointerType: 'mouse', pointerId: 1, clientX: 40, clientY: 30 }));
  const glass = host.querySelector('.mag .mag-in');
  if (!glass) bad.push('a mouse over the page, Magnifier on, brought up no glass');
  else {
    if (!/scale\(2\.5\)/.test(glass.style.transform)) bad.push('the glass is not 2.5 times: ' + glass.style.transform);
    if (!glass.querySelector('figure svg, .qpad-art svg')) bad.push('the glass has no copy of the figure');
    if (glass.querySelector('[id]')) bad.push('the copy under the glass keeps ids');
  }
  d.body.dispatchEvent(ptr('pointermove', { pointerType: 'mouse', pointerId: 1, clientX: 5, clientY: 5 }));
  if (host.querySelector('.mag')) bad.push('the mouse left the page and the glass stayed');
  (fig || host).dispatchEvent(ptr('pointerdown', { pointerType: 'touch', pointerId: 7, clientX: 50, clientY: 300 }));
  await wait(320);
  const held = host.querySelector('.mag');
  if (!held) bad.push('a held finger brought up no glass');
  else if (!(parseFloat(held.style.top) < 300 - 80)) bad.push('the glass is not above the finger: top ' + held.style.top);
  d.body.dispatchEvent(ptr('pointerup', { pointerType: 'touch', pointerId: 7, clientX: 50, clientY: 300 }));
  if (host.querySelector('.mag')) bad.push('lifting the finger left the glass up');
  A['q-mag'](host.querySelector('[data-do="q-mag"]'));
  (fig || host).dispatchEvent(ptr('pointermove', { pointerType: 'mouse', pointerId: 1, clientX: 40, clientY: 30 }));
  if (host.querySelector('.mag')) bad.push('the Magnifier is off and a mouse still brings up the glass');
  host.className = '';
  /* A STEM PAGE HAS THE MAGNIFIER AND THE PADLOCK */
  const stemmed = all.find(x => (x.stems || []).some(p => p && p.diagram));
  if (!stemmed) bad.push('no part with a stem figure to try a stem page on');
  else {
    /* NO STEM PAGE SINCE 960: the stem is drawn once above its parts, on the one card */
    host.innerHTML = whole(stemmed);
    if (!host.querySelector('[data-do="q-mag"]') || !host.querySelector('[data-do="q-lock"]')) bad.push('the stem page of ' + stemmed.row.row_id + ' has no Magnifier or no padlock');
  }
  /* THE PADLOCK: pressed, the column will not swipe; pressed again, it will; left by a tab, it lets go */
  host.innerHTML = whole(pick.chosen);
  const lock = host.querySelector('[data-do="q-lock"]');
  A['q-lock'](lock);
  if (!t.padlock().q) bad.push('the padlock did not lock');
  if (lock.getAttribute('aria-pressed') !== 'true') bad.push('the padlock tile does not say it is pressed');
  if (w.axisFree(host, 'x', 1) !== false) bad.push('locked, a sideways drag still belongs to the grid');
  A['q-lock'](host.querySelector('[data-do="q-lock"]'));
  if (t.padlock().q) bad.push('pressed again, the padlock did not let go');
  A['q-lock'](host.querySelector('[data-do="q-lock"]'));
  try { t.go(t.screenAt() === 'stuff' ? 'feed' : 'stuff', false, true); } catch (e) {}
  await wait(80);
  if (t.padlock().q) bad.push('a tab to another column left the padlock on');
  return bad;
});

/* ---------- BACK TO TOP, AND YOUR RESULT (docs/history/463) ---------- */
check('back to top: every result page of either finder ends in a Back to top tile, and it turns that finder, and only that one, to its first page', async () => {
  const Q = LIB_FULL.rows('questions').slice(0, 60);
  const { w } = boot({ member: true, before: signedInAs_(MEMBER_), serve: url => (/data\/questions\.json/.test(url) ? JSON.parse(JSON.stringify(Q)) : undefined) });
  await wait(300); await woken_();
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['find-top'] || typeof w.finderOf_ !== 'function') return ['find-top has no handler, or finderOf_ is not reachable — NOT checked'];
  let tried = 0;
  for (const id of ['stuff', 'res']) {
    const F = w.finderOf_(id), other = id === 'stuff' ? 'res' : 'stuff';
    t.go(id, false, true); await wait(120); await woken_();
    /* EVERY QUESTION, as a child narrowing to Questions would have them */
    (id === 'stuff' ? t.STUFF() : t.RES()).filters = [{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }];
    w.finderForgetFound_();
    w.paintFinder_(id); await wait(150); await woken_();
    const n = w.inFinder_(F, () => w.stuffPageCount());
    if (!n) { bad.push(id + ': Questions listed nothing — NOT checked'); continue; }
    for (let i = 0; i < n; i++) {
      if (!/data-do="find-top"/.test(w.inFinder_(F, () => w.stuffPageHtml(i)))) { bad.push(id + ': result page ' + (i + 1) + ' of ' + n + ' has no Back to top'); break; }
    }
    const last = w.inFinder_(F, () => 1 + w.frontPages_().length) + n - 1;
    t.goPage(id, last, true); await wait(80);
    const was = pg_(t)[other] || 0;
    if (!(pg_(t)[id] > 0)) { bad.push(id + ': could not turn to its last page — NOT checked'); continue; }
    const tile = d.querySelector('#s-' + id + ' [data-do="find-top"]');
    if (!tile) { bad.push(id + ': no Back to top drawn in the column'); continue; }
    A['find-top'](tile); await wait(80);
    tried++;
    if (pg_(t)[id] !== 0) bad.push(id + ': Back to top left it on page ' + pg_(t)[id]);
    if ((pg_(t)[other] || 0) !== was) bad.push(id + ': Back to top moved the other finder too');
  }
  if (!tried && !bad.length) bad.push('no finder was tried');
  return bad;
});

check('your result: a question is Unattempted, then Attempted, Correct, Incorrect or Part marks by the viewer\'s own latest press, live on its page; signed out it is not a tag at all', async () => {
  const bad = [];
  for (const who of ['in', 'out']) {
    const Q = LIB_FULL.rows('questions').slice(0, 30);
    const { w } = boot({ member: who === 'in', before: who === 'in' ? signedInAs_(ANS_ADA) : undefined,
      serve: url => (/data\/questions\.json/.test(url) ? JSON.parse(JSON.stringify(Q)) : undefined) });
    await wait(300); await woken_();
    const t = w.__t;
    if (typeof t.facetBy !== 'function' || typeof w.subRecord_ !== 'function' || typeof t.ansKey !== 'function') return ['facetBy, subRecord_ or ansKey_ not reachable — NOT checked'];
    const f = t.facetBy('myResult');
    if (!f) return ['there is no myResult facet'];
    const qs = w.stuffItemsAll_().filter(x => x && x.kind === 'question');
    if (!qs.length) return ['no question in the fixture — NOT checked'];
    const x = qs[0], say = () => [].concat(f.of(x) || []).join(',');
    if (who === 'out') {
      const said = qs.find(q => [].concat(f.of(q) || []).join(''));
      if (said) bad.push('signed out, a question says ' + JSON.stringify(f.of(said)));
      continue;
    }
    if (say() !== 'Unattempted') bad.push('before a press it says ' + JSON.stringify(say()));
    const host = w.document.createElement('section');
    host.className = 'page';
    host.innerHTML = w.stuffCard(x, 0) + '<span data-k="' + t.ansKey(x).replace(/"/g, '&quot;') + '"></span>';
    w.document.body.appendChild(host);
    const tag = () => [...host.querySelectorAll('.qtag[data-f="myResult"]')].map(e => e.textContent).join(',');
    if (host.querySelector('.qcard-tags') && tag() !== 'Unattempted') bad.push('the card\'s tag says ' + JSON.stringify(tag()) + ' before a press');
    for (const [v, want] of [['right', 'Attempted,Correct'], ['wrong', 'Attempted,Incorrect'], ['ai:1/3', 'Attempted,Part marks'], ['sent', 'Attempted']]) {
      w.subRecord_(t.ansKey(x), '42', v, 'none');
      if (say() !== want) bad.push('after a ' + v + ' press it says ' + JSON.stringify(say()) + ', not ' + want);
      if (host.querySelector('.qcard-tags') && tag() !== want) bad.push('after a ' + v + ' press the card\'s own tag says ' + JSON.stringify(tag()) + ', not ' + want);
    }
    if (!host.querySelector('.qcard-tags')) bad.push('the card drew no tag row, so the live tag was NOT checked');
  }
  return bad;
});

/* ---------- A CARD WHOSE LEDGER ROW HAS NO DRAWING SHOWS ITS PNG TWIN (docs/history/460) ---------- */
check('a twin only: a question whose words came without its drawing shows its PNG twin in the figure box, under the Magnifier, and a drawn part keeps its pen over it', async () => {
  const LIB = LIB_FULL.rows('questions');
  const { w } = boot({ member: true, serve: url => (/data\/questions\.json/.test(url) ? LIB : undefined), before: signedInAs_(MEMBER_) });
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (typeof w.libQuestion_ !== 'function') return ['libQuestion_ is not reachable — NOT checked'];
  t.STUFF().filters = [];
  const all = w.stuffItemsAll_().filter(x => x && x.kind === 'question' && x.row && x.row.diagram_twin && x.diagram && !/^true$/i.test(String(x.row.lib_pending || '')));
  const typed = all.find(x => w.qType_(x) === 'value' && /math/i.test(x.subject || '') && w.partChunks_(x).length === 1);
  const drawn = all.find(x => String(x.drawAnswer || '').trim() && /math/i.test(x.subject || ''));
  if (!typed || !drawn) return ['no typed and drawn parts with a twin to strip — NOT checked'];
  const host = d.createElement('div');
  d.body.appendChild(host);
  [typed, drawn].forEach((x, i) => {
    /* THE LEDGER ROW CAME WITHOUT ITS DRAWING: the row loses it and the item is made again, as libMerge_ makes it */
    delete x.row.diagram;
    x.diagram = w.libQuestion_(x.row).diagram;
    const src = 'data/diagrams/' + x.row.diagram_twin + '.png';
    /* THE WHOLE CARD (960): its foot holds the Magnifier since 1040 r12 */
    host.innerHTML = w.questionWhole_(x, [x]);
    const img = host.querySelector('svg.qtwin image');
    if (!img || img.getAttribute('href') !== src) bad.push(x.row.row_id + ': the card shows no ' + src);
    if (i === 0) {
      /* A PART WITH ITS OWN FIGURE IS A PAD FROM THE START (1020): the twin is the pad's art */
      const fig = host.querySelector('.qsheet figure, .qsheet .qpad-art');
      if (!fig || !fig.querySelector('svg.qtwin')) bad.push(x.row.row_id + ': the twin is not in the figure box');
      if (!host.querySelector('[data-do="q-mag"]')) bad.push(x.row.row_id + ': the page has no Magnifier to see the twin bigger');
    } else if (!host.querySelector('.qpad svg.qtwin') || !host.querySelector('[data-do="qt-pen"]')) bad.push(x.row.row_id + ': the drawn part has no pen over its twin');
  });
  return bad;
});

/* ---------- THE ADMIN'S LAYOUT (462, 463): tiles on every widget move it up, down, across, or delete it, for everybody ---------- */
const LAY_ADMIN_ = { name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], rank: 'admin', token: 'tk', handle: 'adaadmin' };
const layIds_ = (t, k) => t.widgetsOf(k).map(x => String(x.id));
const layBoot_ = (o) => boot(Object.assign({ before: signedInAs_(LAY_ADMIN_) }, o || {}));
const layTile_ = (d, id, act, dir) => d.querySelector(`#wgt-${id}`)?.closest('.card')
  ?.querySelector(`.wgt-admin [data-do="${act}"]${dir ? `[data-d="${dir}"]` : ''}`);

check('layout tiles (463): an admin sees ▲ ▼ ◀ ▶ Delete on each widget; a move up, down and to the next column each saves one layoutSave and redraws at once, a reload keeps it, a refusal puts it back, Reset restores; there is no board', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-w-move'] || typeof w.layoutTiles_ !== 'function') return ['no lay-w-move handler or layoutTiles_ — NOT checked'];
  if (A['layout-edit'] || A['layout-done'] || typeof w.layoutEditOpen_ === 'function') bad.push('the Edit layout board is still there');
  /* TOOLS ARE FIND CARDS, placed by the funnel (790): the Reels column's widgets are the ones that move. */
  t.go('reel', false, true); await wait(300);
  const tools0 = layIds_(t, 'reel');
  const [a, b, c] = tools0;
  const row = d.querySelector(`#wgt-${a}`)?.closest('.card')?.querySelector('.wgt-admin');
  if (!row) return bad.concat(['the first reel widget has no admin row']);
  const labels = [...row.querySelectorAll('[data-do]')].map(x => x.getAttribute('aria-label') || '').join('|');
  ['Move up', 'Move down', 'Move to previous column', 'Move to next column', 'Delete'].forEach(l => { if (labels.indexOf(l) === -1) bad.push('the admin row has no ' + l + ': ' + labels); });
  if (!row.querySelectorAll('.is-admin').length) bad.push('the admin row is not in the admin tone');
  if (!layTile_(d, a, 'lay-w-move', '-1')?.disabled) bad.push('the first widget can move up');
  /* DOWN: the first goes second, saved at once and drawn. */
  A['lay-w-move'](layTile_(d, a, 'lay-w-move', '1')); await wait(200);
  let posts = sent.filter(x => x.action === 'layoutSave');
  if (posts.length !== 1) bad.push(posts.length + ' layoutSave posts after one move, not one');
  if (layIds_(t, 'reel').slice(0, 2).join() !== [b, a].join()) bad.push('Move down left Reels ' + layIds_(t, 'reel').join());
  const drawn = [...d.querySelectorAll('#s-reel .widget-slot')].map(x => x.id.replace('wgt-', ''));
  if (drawn.indexOf(b) > drawn.indexOf(a)) bad.push('Move down did not redraw Reels: ' + drawn.join());
  /* UP: back again. */
  A['lay-w-move'](layTile_(d, a, 'lay-w-move', '-1')); await wait(200);
  if (layIds_(t, 'reel').join() !== tools0.join()) bad.push('Move up did not put it back: ' + layIds_(t, 'reel').join());
  /* ACROSS: to the end of the next widget column. */
  const cols = w.layoutWidgetCols_(), next = cols[cols.indexOf('reel') + 1];
  A['lay-w-col'](layTile_(d, c, 'lay-w-col', '1')); await wait(200);
  const kindOf = { reel: 'reel', tools: 'tool', games: 'game', shop: 'shop' };
  const there = layIds_(t, kindOf[next]);
  if (layIds_(t, 'reel').indexOf(c) !== -1 || there[there.length - 1] !== c) bad.push('the widget moved to ' + next + ' is not last there: ' + there.join());
  posts = sent.filter(x => x.action === 'layoutSave');
  if (posts.length !== 3) bad.push(posts.length + ' layoutSave posts after three moves');
  const L = posts[posts.length - 1] && posts[posts.length - 1].layout;
  if (!L || 'columns' in L || 'hidden' in L) bad.push('the post carried columns or hidden: ' + JSON.stringify(L));
  /* A RELOAD keeps it. */
  const p2 = payload(); p2.layout = L;
  const r = layBoot_({ payload: p2 }); await wait(300);
  const t2 = r.w.__t;
  if (layIds_(t2, kindOf[next]).join() !== there.join()) bad.push('a reload did not keep the layout');
  /* NO RESET (477): the moved layout IS the layout. */
  r.w.__t.go('biz', false, true); await wait(200);
  if (r.w.document.querySelector('[data-do="layout-edit"], [data-do="layout-reset"], .layout-card')) bad.push('Business still has a Layout card, Edit or Reset');
  if (t2.ACTIONS['layout-reset']) bad.push('a layout-reset handler still exists');
  /* A REFUSAL: drawn at once, then put back with a toast. */
  const no = layBoot_({ reply: b2 => b2.action === 'layoutSave' ? { success: false, error: 'No.' } : undefined }); await wait(300);
  no.w.__t.go('reel', false, true); await wait(300);
  no.w.__t.ACTIONS['lay-w-move'](layTile_(no.w.document, a, 'lay-w-move', '1')); await wait(300);
  if (layIds_(no.w.__t, 'reel').join() !== tools0.join()) bad.push('a refused move was not put back: ' + layIds_(no.w.__t, 'reel').join());
  return bad;
});

check('layout tiles (463): Delete asks twice in place and is final (477), the deleted widget is not drawn or paged, no Add back or Reset (Deleted on Business is the one way back); the basket has no Delete; Saved has no admin row; a non-admin sees no tiles and cannot post', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-w-del']) return ['no lay-w-del handler — NOT checked'];
  t.findGroup('Games', 'wordgames'); await wait(300);
  const tile = () => layTile_(d, 'wordgames', 'lay-w-del');
  if (!tile()) return bad.concat(['Word games has no Delete tile — NOT checked']);
  A['lay-w-del'](tile());
  if (sent.some(x => x.action === 'layoutSave') || layIds_(t, 'game').indexOf('wordgames') === -1) bad.push('one tap deleted');
  if (!/Tap again to delete/.test(tile().getAttribute('aria-label') || '')) bad.push('the first tap did not say "Tap again to delete"');
  if (d.querySelector('#sheet:not(.hidden) #sheet-body *')) bad.push('delete opened a sheet');
  await wait(450); A['lay-w-del'](tile()); await wait(300);
  if (layIds_(t, 'game').indexOf('wordgames') !== -1 || d.querySelector('#wgt-wordgames')) bad.push('the second tap did not delete');
  if (w.findWidgetList_().some(x => String(x.id) === 'wordgames')) bad.push('Find still lists the deleted Word games');   /* Find is paged by its cards (790) */
  const L = (sent.filter(x => x.action === 'layoutSave')[0] || {}).layout;
  if (!L || (L.deleted || []).indexOf('wordgames') === -1) bad.push('the post did not carry deleted');
  /* THE BASKET STAYS. */
  t.go('shop', false, true); await wait(300);
  if (!d.querySelector('#wgt-cart')?.closest('.card')?.querySelector('.wgt-admin')) bad.push('the basket has no admin row');
  if (layTile_(d, 'cart', 'lay-w-del')) bad.push('the basket has a Delete tile');
  /* SAVED DRAWS NO ADMIN ROW (only a widget's own column does). */
  if (w.widgetOnColumn_(w.allWidgets().find(x => x.kind === 'tool'), 0).indexOf('wgt-admin') !== -1) bad.push('the Saved drawing carries the admin row');
  /* NO OLD WAY BACK (477): no Add back, no Reset, no deleted-picker; the Deleted card's Put back is the one. */
  t.go('biz', false, true); await wait(300);
  if (A['lay-w-undel'] || A['layout-reset']) bad.push('an Add back or Reset handler still exists');
  if (d.querySelector('.lay-del-pick, .lay-foot, .layout-card, [data-do="lay-w-undel"], [data-do="layout-reset"]')) bad.push('a way back is still drawn');
  if (/Add back|Reset layout|Deleted cards/.test(d.body.textContent)) bad.push('the page still says Add back, Reset layout or Deleted cards');
  /* A NON-ADMIN: no tiles, no post. */
  const m = boot({ member: true }); await wait(300);
  for (const col of ['stuff', 'shop', 'reel']) { m.w.__t.go(col, false, true); await wait(150); }
  if (m.w.document.querySelector('.wgt-admin, [data-do="lay-w-move"], [data-do="lay-w-del"]')) bad.push('a member sees layout tiles');
  if (m.sent.some(x => x.action === 'layoutSave')) bad.push('a member posted layoutSave');
  return bad;
});

check('Deleted on Business: the whiteboard deleted is listed by name with Put back, which saves it out of deleted and draws it again; an empty list says Nothing deleted; a refusal puts it back', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-putback']) return ['no lay-putback handler — NOT checked'];
  t.go('biz', false, true); await wait(300);
  const card = () => d.querySelector('#s-biz .deleted-card');
  if (!card()) return ['Business has no Deleted card — NOT checked'];
  if (!/Nothing deleted/.test(card().textContent)) bad.push('an empty Deleted card does not say Nothing deleted');
  t.findGroup('Tools', 'whiteboard'); await wait(300);
  const x = layTile_(d, 'whiteboard', 'lay-w-del');
  if (!x) return bad.concat(['the whiteboard has no Delete tile — NOT checked']);
  A['lay-w-del'](x); await wait(450); A['lay-w-del'](x); await wait(300);
  if (layIds_(t, 'tool').indexOf('whiteboard') !== -1) return bad.concat(['the whiteboard was not deleted — NOT checked']);
  t.go('biz', false, true); await wait(300);
  const row = card() && card().querySelector('[data-deleted="whiteboard"]');
  if (!row) return bad.concat(['the deleted whiteboard is not on the Deleted card']);
  if (!/Whiteboard/.test(row.textContent)) bad.push('the Deleted card does not name it Whiteboard');
  const put = row.querySelector('.tile[data-do="lay-putback"], [data-do="lay-putback"]');
  if (!put) return bad.concat(['no Put back tile']);
  A['lay-putback'](put); await wait(300);
  const L = (sent.filter(p => p.action === 'layoutSave').pop() || {}).layout;
  if (!L || (L.deleted || []).indexOf('whiteboard') !== -1) bad.push('the save still carries the whiteboard in deleted');
  t.findGroup('Tools', 'whiteboard'); await wait(300);
  if (layIds_(t, 'tool').indexOf('whiteboard') === -1 || !d.querySelector('#wgt-whiteboard')) bad.push('the whiteboard was not drawn again');
  t.go('biz', false, true); await wait(300);
  if (card() && card().querySelector('[data-deleted="whiteboard"]')) bad.push('the whiteboard is still listed as deleted');
  /* A REFUSAL: drawn at once, then put back. */
  const no = layBoot_({ reply: b => b.action === 'layoutSave' && (b.layout.deleted || []).indexOf('whiteboard') === -1 ? { success: false, error: 'No.' } : undefined }); await wait(300);
  no.w.__t.findGroup('Tools', 'whiteboard'); await wait(300);
  const y = layTile_(no.w.document, 'whiteboard', 'lay-w-del');
  no.w.__t.ACTIONS['lay-w-del'](y); await wait(450); no.w.__t.ACTIONS['lay-w-del'](y); await wait(300);
  no.w.__t.go('biz', false, true); await wait(300);
  const p2 = no.w.document.querySelector('#s-biz [data-deleted="whiteboard"] [data-do="lay-putback"]');
  if (!p2) bad.push('refusal: no Put back tile');
  else { no.w.__t.ACTIONS['lay-putback'](p2); await wait(300);
    if (layIds_(no.w.__t, 'tool').indexOf('whiteboard') !== -1) bad.push('a refused Put back was not undone'); }
  return bad;
});

check('no undo (477): a deleted widget stays gone for everyone after a reload and a moved one keeps its place for a client; no Add back or Reset for the admin', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  t.findGroup('Games', 'wordgames'); await wait(300);
  const x = layTile_(d, 'wordgames', 'lay-w-del');
  if (!x) return ['Word games has no Delete tile — NOT checked'];
  A['lay-w-del'](x); await wait(450); A['lay-w-del'](x); await wait(300);
  /* A REELS WIDGET DOWN, past the next (790: tools are Find cards, placed by the funnel). */
  t.go('reel', false, true); await wait(300);
  const tools0 = layIds_(t, 'reel'), a = tools0[0], f = tools0[1];
  A['lay-w-move'](layTile_(d, a, 'lay-w-move', '1')); await wait(300);
  const posts = sent.filter(p => p.action === 'layoutSave'), L = posts.length && posts[posts.length - 1].layout;
  if (!L) return bad.concat(['no layoutSave was posted — NOT checked']);
  if (posts.some(p => p.reset)) bad.push('a layoutSave carried reset');
  const moved = layIds_(t, 'reel');
  /* AN ADMIN RELOADS: still gone, nothing to bring it back. */
  const p1 = payload(); p1.layout = L;
  const r = layBoot_({ payload: p1 }); await wait(300);
  for (const col of ['stuff', 'biz']) { r.w.__t.go(col, false, true); await wait(200); }
  if (layIds_(r.w.__t, 'game').indexOf('wordgames') !== -1 || r.w.document.querySelector('#wgt-wordgames')) bad.push('the deleted widget came back for the admin');
  if (r.w.__t.ACTIONS['lay-w-undel'] || r.w.__t.ACTIONS['layout-reset'] || /Add back|Reset layout/.test(r.w.document.body.textContent)) bad.push('the admin still has Add back or Reset');
  /* A CLIENT RELOADS: the same layout. */
  const CL = { name: 'Cleo Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'cleo' };
  const p2 = payload(); p2.layout = L;
  const c = boot({ payload: p2, before: signedInAs_(CL) }); await wait(300);
  for (const col of ['stuff', 'reel']) { c.w.__t.go(col, false, true); await wait(200); }
  if (layIds_(c.w.__t, 'game').indexOf('wordgames') !== -1 || c.w.document.querySelector('#wgt-wordgames')) bad.push('the deleted widget is drawn for a client');
  /* A CLIENT SEES FEWER TOOLS (role-gated ones), so compare the order of the ones both see — and the moved one must be after its old follower. */
  const cl = layIds_(c.w.__t, 'reel'), both = moved.filter(x => cl.indexOf(x) !== -1);
  if (cl.filter(x => both.indexOf(x) !== -1).join() !== both.join()) bad.push('the move did not keep for a client: ' + cl.join() + ' not ' + both.join());
  if (cl.indexOf(a) === -1 || cl.indexOf(f) === -1) bad.push(a + ' or ' + f + ' is not seen by a client — the move NOT checked');
  else if (cl.indexOf(a) < cl.indexOf(f)) bad.push('the moved tool is not below ' + f + ' for a client: ' + cl.join());
  return bad;
});

/* ---------- SPLIT AND JOIN (464): an admin draws a settings or Business card of several fields as a card a field, and back ---------- */
check('split cards (464): an admin\'s Split draws a settings card and a Business card a field a card in the same place, each piece with its own Save and a Join, one layoutSave each way, a reload keeps it; a piece\'s Save posts only its own record; a non-admin sees no Split and cannot post', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-split'] || !A['lay-join'] || typeof w.splitTiles_ !== 'function') return ['no lay-split / lay-join handler — NOT checked'];
  ['account', 'staff', 'family', 'biz'].forEach(c => { try { w.paint(c); } catch (e) {} });
  await wait(200);
  const cardsOf = id => [...d.querySelectorAll('.card[data-split="' + id + '"]')];
  /* A SETTINGS CARD: the first splittable one on any settings column. */
  const st = d.querySelector('#s-account [data-do="lay-split"], #s-staff [data-do="lay-split"], #s-family [data-do="lay-split"]');
  if (!st) return ['no settings card offers Split to an admin — NOT checked'];
  const sid = st.dataset.card, col = st.closest('section.screen').id;
  if (!/^set:/.test(sid)) bad.push('a settings card\'s split id is ' + sid);
  const whole = cardsOf(sid);
  const fields = whole.length === 1 ? [...new Set([...whole[0].querySelectorAll('[data-me]')].map(x => x.dataset.me))] : [];
  if (whole.length !== 1 || fields.length < 2) return bad.concat([sid + ' is ' + whole.length + ' cards of ' + fields.length + ' fields before Split']);
  t.go(col.slice(2), false, true); await wait(200);
  const pagesBefore = [...d.querySelectorAll('#' + col + ' .card')].map(c => c.dataset.split || '');
  A['lay-split'](d.querySelector('#' + col + ' [data-do="lay-split"][data-card="' + sid + '"]')); await wait(250);
  let posts = sent.filter(x => x.action === 'layoutSave');
  if (posts.length !== 1 || (((posts[0] || {}).layout || {}).split || []).indexOf(sid) === -1) bad.push('Split did not post one layoutSave carrying ' + sid + ': ' + JSON.stringify(posts.map(p => p.layout)));
  const pieces = cardsOf(sid);
  if (pieces.length < 2) bad.push('after Split ' + sid + ' is ' + pieces.length + ' card(s)');
  pieces.forEach((pc, i) => {
    if (!pc.querySelector('[data-do="me-save"]') && !pc.querySelector('[data-me^="qual"]')) bad.push(sid + ' piece ' + i + ' has no Save of its own');
    if (!pc.querySelector('.wgt-admin [data-do="lay-join"]')) bad.push(sid + ' piece ' + i + ' has no Join');
  });
  const after = [...new Set(pieces.flatMap(pc => [...pc.querySelectorAll('[data-me]')].map(x => x.dataset.me)))];
  if (after.join() !== fields.join()) bad.push('the pieces hold ' + after.join() + ', the card held ' + fields.join());
  /* IN THE SAME PLACE: the cards before and after it on the column are unchanged. */
  const pagesAfter = [...d.querySelectorAll('#' + col + ' .card')].map(c => c.dataset.split || '');
  const squash = a => a.filter((x, i) => !(x === sid && a[i - 1] === sid)).join('|');
  if (squash(pagesAfter) !== squash(pagesBefore)) bad.push('Split moved the card: ' + squash(pagesBefore) + ' → ' + squash(pagesAfter));
  /* EVERY FIELD STILL ONE HOME. */
  fields.forEach(f => { const n = d.querySelectorAll('[data-me="' + f + '"]').length; const was = 1; if (n < was) bad.push(f + ' is gone after Split'); });
  /* A RELOAD KEEPS IT. */
  const p2 = payload(); p2.layout = posts[posts.length - 1] && posts[posts.length - 1].layout;
  const r = layBoot_({ payload: p2 }); await wait(300);
  try { r.w.__t.go(col.slice(2), false, true); r.w.paint(col.slice(2)); } catch (e) {}
  await wait(150);
  if (r.w.document.querySelectorAll('.card[data-split="' + sid + '"]').length !== pieces.length) bad.push('a reload did not keep ' + sid + ' split');
  /* JOIN: one card again. */
  A['lay-join'](cardsOf(sid).concat([d])[1 % Math.max(1, cardsOf(sid).length)].querySelector('[data-do="lay-join"]') || d.createElement('button')); await wait(250);
  posts = sent.filter(x => x.action === 'layoutSave');
  if (posts.length !== 2 || ((posts[1].layout || {}).split || []).indexOf(sid) !== -1) bad.push('Join did not post a layout without ' + sid);
  if (cardsOf(sid).length !== 1 || !cardsOf(sid)[0].querySelector('[data-do="lay-split"]')) bad.push('after Join ' + sid + ' is ' + cardsOf(sid).length + ' cards, or has no Split');
  /* BUSINESS: the Insurance records a card each, and one piece's Save posts its own record alone. */
  t.go('biz', false, true); await wait(600);
  const bid = 'biz:rec:insurance';
  const bs = d.querySelector('#s-biz .card[data-split="' + bid + '"] [data-do="lay-split"]');
  if (!bs) return bad.concat(['the Insurance card offers no Split']);
  if (!d.querySelector('#s-biz .card[data-split="biz:profit-terms"] [data-do="lay-split"]')) bad.push('Profit · the terms offers no Split');
  A['lay-split'](bs); await wait(250);
  const bp = cardsOf(bid);
  if (bp.length !== 3) bad.push('Insurance split into ' + bp.length + ' cards, not three');
  else {
    const before = sent.length;
    A['biz-save'](bp[1].querySelector('[data-do="biz-save"]')); await wait(250);
    const rec = sent.slice(before).find(x => x.action === 'saveRecordsPage');
    if (!rec || rec.records.length !== 1 || rec.records[0].id !== 'prof_indemnity') bad.push('a piece\'s Save posted ' + JSON.stringify(rec && rec.records.map(x => x.id)) + ', wanted prof_indemnity alone');
  }
  A['lay-join'](((cardsOf(bid)[0] || d).querySelector('[data-do="lay-join"]')) || d.createElement('button')); await wait(250);
  if (cardsOf(bid).length !== 1) bad.push('Join left Insurance in ' + cardsOf(bid).length + ' cards');
  const pt = d.querySelector('#s-biz .card[data-split="biz:profit-terms"] [data-do="lay-split"]');
  if (pt) {
    const nTerms = pt.closest('.card').querySelectorAll('[data-pf-var]').length;
    A['lay-split'](pt); await wait(250);
    if (!nTerms || d.querySelectorAll('#s-biz .card[data-profit="term"]').length !== nTerms) bad.push('the profit terms did not split a term a card');
  }
  /* A NON-ADMIN: no Split, no Join, no post. */
  const m = boot({ member: true }); await wait(300);
  ['account', 'staff', 'family'].forEach(c => { try { m.w.paint(c); } catch (e) {} });
  await wait(150);
  if (m.w.document.querySelector('[data-do="lay-split"], [data-do="lay-join"]')) bad.push('a member is offered Split or Join');
  const fake = m.w.document.createElement('button'); fake.setAttribute('data-card', sid);
  m.w.__t.ACTIONS['lay-split'](fake); await wait(100);
  if (m.sent.some(x => x.action === 'layoutSave')) bad.push('a member posted layoutSave');
  return bad;
});

