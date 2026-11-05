check('layout tiles (463): a stale or garbled layout falls back cleanly — unknown ids ignored, missing ones appended in the code\'s order, a 462 value\'s columns and hidden ignored, rubbish ignored', async () => {
  const bad = [];
  const base = boot(); await wait(300);
  const tools0 = layIds_(base.w.__t, 'reel'), find0 = layIds_(base.w.__t, 'tool'), cols0 = base.w.__t.TABS.map(x => x.id);
  const p = payload();
  p.layout = { columns: ['nope', 'games', 'feed'], widgets: { reel: ['ghost', tools0[2]], nowhere: ['calculator'], tools: [find0[3], find0[0]], games: ['wordgames'] }, hidden: [tools0[0]], deleted: ['long-gone'] };
  const r = boot({ payload: p }); await wait(300);
  const t = r.w.__t, tools = layIds_(t, 'reel'), cols = t.TABS.map(x => x.id);
  if (tools[0] !== tools0[2] || tools.slice(1).join() !== tools0.filter(x => x !== tools0[2]).join()) bad.push('stale widgets: ' + tools.join());
  /* A LAYOUT SAVED WHILE TOOLS AND GAMES WERE COLUMNS (before 790) still loads: their lists are ignored, Find's order is the code's. */
  if (layIds_(t, 'tool').join() !== find0.join()) bad.push('an old layout\'s Tools list reordered Find: ' + layIds_(t, 'tool').join());
  if (cols.join() !== cols0.join()) bad.push('a stored column order was applied: ' + cols.join());
  if (r.errs.length) bad.push('errors: ' + r.errs.join('; '));
  for (const junk of ['{not json', 42, [1, 2], { columns: 'feed', widgets: 7 }]) {
    const q = payload(); q.layout = junk;
    const g = boot({ payload: q }); await wait(250);
    if (layIds_(g.w.__t, 'reel').join() !== tools0.join() || g.w.__t.TABS.map(x => x.id).join() !== cols0.join()) bad.push(JSON.stringify(junk) + ' was not ignored');
    if (g.errs.length) bad.push(JSON.stringify(junk) + ' threw: ' + g.errs.join('; '));
  }
  return bad;
});

/* ---------- CARDS ON THE RIGHT-HAND COLUMNS (465): ▲ ▼ ◀ ▶, Delete and Start here on every settings, profiles and Business card ---------- */
const LAY_CARD_COLS_ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'settings', 'columns.json'), 'utf8')).filter(r => String(r.cards).toUpperCase() === 'TRUE').map(r => r.screen);
const layPaintAll_ = async w => { for (const c of LAY_CARD_COLS_) { try { w.paint(c); } catch (e) {} } await wait(200); };
const layCardRow_ = (d, id) => d.querySelector(`.card-admin[data-lay-for="${id}"]`);
const layCardTile_ = (d, id, act, dir) => layCardRow_(d, id)?.querySelector(`[data-do="${act}"]${dir ? `[data-d="${dir}"]` : ''}`);
const laySeen_ = (w, col) => w.cardSeen_(col);
const layLast_ = sent => ((sent.filter(x => x.action === 'layoutSave').pop() || {}).layout) || null;

/* A CARD MOVED ACROSS IS ON A PAGE THE PAGER COUNTS (476): the count was the builder's, the column drawn `cardsOf_`'s, so a moved-in card sat past the last page. */
const layReach_ = (w, col, id) => {
  const host = w.document.getElementById('s-' + col), pages = host ? [...host.querySelectorAll(':scope > .page')] : [];
  const at = pages.findIndex(p => p.querySelector(`.card-admin[data-lay-for="${id}"]`));
  let n = -1; try { n = w.__t.pageCount(col); } catch (e) {}
  return at === -1 ? col + ' does not draw ' + id : at >= n ? col + ' draws ' + id + ' on page ' + (at + 1) + ' of ' + pages.length + ' and its pager counts ' + n : '';
};
/* ---------- MERGE WITH THE CARD ABOVE (480): two neighbours one card, again for three, Split back, moved and deleted whole ---------- */
const layMergeTile_ = (d, id) => layCardTile_(d, id, 'lay-merge');
const layPagesOf_ = (w, col) => { const h = w.document.getElementById('s-' + col); return h ? h.querySelectorAll(':scope > .page').length : -1; };
check('merge with the card above (480): a profiles card merges with the one above, then the merged card with the next above — one frame, one admin row, the lower titles subheadings, one page; a client after a reload sees the merged card without the parts their role hides; Move takes it whole, Split parts it in place, Delete takes every part', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const A = w.__t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-merge'] || !A['lay-unmerge'] || typeof w.mergedNow_ !== 'function') return ['no lay-merge / lay-unmerge — NOT checked'];
  await layPaintAll_(w);
  const seen0 = laySeen_(w, 'students'), n0 = w.__t.pageCount('students');
  const [help, add, search, manage] = ['ppl:students:help', 'ppl:students:add', 'ppl:students:search', 'ppl:students:manage'];
  if ([help, add, search, manage].some(x => seen0.indexOf(x) === -1)) return ['Student profiles does not hold its four cards: ' + seen0.join() + ' — NOT checked'];
  if (layMergeTile_(d, seen0[0])) bad.push('the first card has a Merge tile with nothing above it');
  /* TWO */
  const t1 = layMergeTile_(d, search);
  if (!t1 || t1.getAttribute('aria-label') !== 'Merge with the card above') return bad.concat(['Find by handle has no "Merge with the card above" tile']);
  A['lay-merge'](t1); await wait(250); await layPaintAll_(w);
  let L = layLast_(sent);
  if (!L || JSON.stringify(L.merged) !== JSON.stringify([[add, search]])) bad.push('the first merge saved ' + JSON.stringify(L && L.merged));
  const one = () => d.querySelectorAll('#s-students .card.is-merged');
  if (one().length !== 1 || one()[0].querySelectorAll(':scope > .merged-part').length !== 2) bad.push('two cards did not draw as one frame of two parts');
  if (w.__t.pageCount('students') !== n0 - 1 || layPagesOf_(w, 'students') !== n0 - 1) bad.push('after one merge the pager counts ' + w.__t.pageCount('students') + ' and the column draws ' + layPagesOf_(w, 'students') + ', not ' + (n0 - 1));
  /* THREE: the merged card's own tile merges the next above. */
  A['lay-merge'](layMergeTile_(d, add)); await wait(250); await layPaintAll_(w);
  /* FOUR: the card below joins too, so a client has two parts left to see. */
  A['lay-merge'](layMergeTile_(d, manage)); await wait(250); await layPaintAll_(w);
  L = layLast_(sent);
  if (JSON.stringify(L && L.merged) !== JSON.stringify([[help, add, search, manage]])) bad.push('merging up twice more saved ' + JSON.stringify(L && L.merged));
  const m = one()[0];
  if (!m || m.querySelectorAll(':scope > .merged-part').length !== 4) bad.push('the merged card does not hold four parts');
  if (m && m.querySelectorAll('.card-admin').length !== 1) bad.push('the merged card has ' + (m && m.querySelectorAll('.card-admin').length) + ' admin rows, not one');
  if (m && m.lastElementChild && !m.lastElementChild.classList.contains('card-admin')) bad.push('the admin row is not at the foot of the merged card');
  if (m && !m.querySelector('.card-admin [data-do="lay-unmerge"]')) bad.push('the merged card has no Split');
  if (w.__t.pageCount('students') !== n0 - 3 || layPagesOf_(w, 'students') !== n0 - 3) bad.push('four merged: the pager counts ' + w.__t.pageCount('students') + ', the column draws ' + layPagesOf_(w, 'students') + ', not ' + (n0 - 3));
  if (m && !m.querySelector('.merged-part + .merged-part h3')) bad.push('a lower part has no title to be its subheading');
  /* A CLIENT, after a reload: the merged card without Needs help and Add a student. */
  const p = payload(); p.layout = L;
  const c = boot({ member: true, payload: p }); await wait(300); await layPaintAll_(c.w);
  const cm = c.w.document.querySelectorAll('#s-students .card.is-merged');
  const parts = cm[0] ? [...cm[0].querySelectorAll(':scope > .merged-part')].map(x => x.getAttribute('data-part')) : [];
  if (cm.length !== 1 || parts.join() !== [search, manage].join()) bad.push('a client sees ' + cm.length + ' merged cards of parts ' + parts.join());
  if (c.w.document.querySelector('#s-students .wgt-admin, [data-do="lay-merge"]')) bad.push('a client sees layout tiles');
  if (c.w.__t.pageCount('students') !== layPagesOf_(c.w, 'students')) bad.push('a client\'s pager counts ' + c.w.__t.pageCount('students') + ' for ' + layPagesOf_(c.w, 'students') + ' pages');
  /* MOVE: ◀ takes every part to Tutor profiles. */
  A['lay-c-col'](layCardTile_(d, help, 'lay-c-col', '-1')); await wait(250); await layPaintAll_(w);
  const tut = laySeen_(w, 'tutors');
  if ([help, add, search, manage].some(x => tut.indexOf(x) === -1) || laySeen_(w, 'students').some(x => [help, add, search, manage].indexOf(x) !== -1)) bad.push('◀ did not move every part: tutors ' + tut.join());
  if (d.querySelectorAll('#s-tutors .card.is-merged').length !== 1) bad.push('the moved card is not one merged card on Tutor profiles');
  /* SPLIT: the parts apart, in place. */
  A['lay-unmerge'](d.querySelector('#s-tutors .card.is-merged [data-do="lay-unmerge"]')); await wait(250); await layPaintAll_(w);
  if (layLast_(sent).merged || d.querySelector('#s-tutors .card.is-merged')) bad.push('Split left a merged card');
  const tut2 = laySeen_(w, 'tutors');
  if (tut2.slice(-4).join() !== [help, add, search, manage].join()) bad.push('Split did not leave the parts where they stood: ' + tut2.join());
  /* DELETE: merge two again, two taps, both gone. */
  A['lay-merge'](layMergeTile_(d, manage)); await wait(250); await layPaintAll_(w);
  const del = () => d.querySelector('#s-tutors .card.is-merged [data-do="lay-c-del"]');
  if (!del()) return bad.concat(['the re-merged card has no Delete']);
  A['lay-c-del'](del());
  if (!/Tap again/.test(del().getAttribute('aria-label') || '')) bad.push('the first tap did not ask again');
  await wait(450); A['lay-c-del'](del()); await wait(250); await layPaintAll_(w);
  L = layLast_(sent);
  if ([search, manage].some(x => (L.deleted || []).indexOf(x) === -1) || L.merged) bad.push('Delete did not delete both parts: ' + JSON.stringify(L));
  return bad;
});

check('merge with the card above (480): widgets — a Find card (790) has no Merge tile, tool or game, and a layout saved with tools merged still loads: each part its own card, started, for an admin and a client', async () => {
  const { w } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-merge']) return ['no lay-merge — NOT checked'];
  for (const [g, id] of [['Tools', 'calculator'], ['Tools', 'mat'], ['Tools', 'timer'], ['Games', 'wordgames']]) {
    t.findGroup(g, id); await wait(300);
    if (!d.querySelector('#s-stuff #wgt-' + id)) { bad.push('Find › ' + g + ' did not draw ' + id + ' — NOT checked'); continue; }
    if (d.querySelector('#s-stuff [data-do="lay-merge"]')) bad.push('a Find card (' + id + ') has a Merge tile — Find places its cards, nothing merges them');
  }
  /* THE LAYOUT AN ADMIN SAVED WHEN TOOLS WAS A COLUMN: its merge names three tools, and is ignored. */
  const p = payload(); p.layout = { v: 2, widgets: { tools: ['calculator', 'flyers', 'mat', 'timer'] }, merged: [['flyers', 'mat', 'timer']], deleted: [] };
  for (const [who, b] of [['an admin', layBoot_({ payload: p })], ['a client', boot({ member: true, payload: p })]]) {
    await wait(300);
    if (b.errs && b.errs.length) bad.push(who + ': the old layout threw: ' + b.errs.join('; '));
    b.w.__t.findGroup('Tools', 'timer'); await wait(400);
    const bd = b.w.document;
    if (bd.querySelector('#s-stuff .card.is-merged')) bad.push(who + ': an old merge of tools is drawn merged on Find');
    const sl = bd.querySelector('#s-stuff #wgt-timer');
    if (!sl) bad.push(who + ': the timer is not its own Find card under an old merged layout');
    else { for (let k = 0; k < 40 && sl.getAttribute('aria-busy'); k++) await wait(50); if (sl.getAttribute('aria-busy')) bad.push(who + ': the timer on Find was never started'); }
  }
  return bad;
});

check('a card moved ◀ into the next column is on a page that column scrolls to — Biz settings into Apprentice settings (730), parents into students — and still after a reload (476)', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const A = w.__t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-c-col'] || typeof w.__t.pageCount !== 'function') return ['no lay-c-col or pageCount — NOT checked'];
  await layPaintAll_(w);
  const moves = [];
  for (const [from, to] of [['biz', 'apprentice'], ['parents', 'students']]) {
    const seen = laySeen_(w, from).filter(x => !moves.some(m => m[1] === x)), id = from === 'biz' ? seen[0] : seen[seen.length - 1];
    const tile = id && layCardTile_(d, id, 'lay-c-col', '-1');
    if (!tile) { bad.push(from + ' has no ◀ card to move — NOT checked'); continue; }
    A['lay-c-col'](tile); await wait(300); await layPaintAll_(w);
    const why = layReach_(w, to, id); if (why) bad.push(why);
    moves.push([to, id]);
  }
  const p = payload(); p.layout = layLast_(sent);
  const r = layBoot_({ payload: p }); await wait(300); await layPaintAll_(r.w);
  moves.forEach(([to, id]) => { const why = layReach_(r.w, to, id); if (why) bad.push('after a reload: ' + why); });
  return bad;
});

check('layout cards (465): an admin sees ▲ ▼ ◀ ▶ Start here Delete on every settings, profiles and Business card (Split beside them on a card of several fields); a settings card moves down, up and to another settings column, one layoutSave each, every setting still edited in one place, a reload keeps it; Business cards reorder and "+ Add a student" goes to the bottom', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-c-move'] || typeof w.cardsOf_ !== 'function') return ['no lay-c-move handler or cardsOf_ — NOT checked'];
  await layPaintAll_(w);
  /* EVERY CARD ON EVERY RIGHT-HAND COLUMN HAS THE ROW — cards are the column's pages less its own lines. */
  for (const col of LAY_CARD_COLS_) {
    const seen = laySeen_(w, col);
    /* 469: THIS ADMIN HAS NO TUTOR CARD, and everybody's four live on Student settings — so Tutor settings may hold none. */
    if (!seen.length && col !== 'family' && col !== 'staff') bad.push(col + ' has no arranged cards');
    seen.forEach(id => {
      const row = layCardRow_(d, id);
      if (!row) { bad.push(col + ': ' + id + ' has no admin row'); return; }
      const labels = [...row.querySelectorAll('[data-do]')].map(x => x.getAttribute('aria-label') || '').join('|');
      /* THE FIRST COLUMN'S ◀ (Spotlight since 730) makes a new column on the left rather than naming a previous one. */
      ['Move up', 'Move down', 'Move to previous column|Move to a new column on the left', 'Move to ', 'Start here', 'Delete'].forEach(l => { if (!l.split('|').some(x => labels.indexOf(x) !== -1)) bad.push(id + ' has no ' + l); });
    });
  }
  /* A CARD THAT MOVES BUT IS KEPT (CARD_KEEP, 770: Deleted) has every tile but Delete. */
  const keep = ['biz:deleted'];
  for (let i = bad.length - 1; i >= 0; i--) if (keep.some(k => bad[i] === k + ' has no Delete')) bad.splice(i, 1);
  ['ppl:students:help', 'ppl:students:add', 'ppl:tutors:add', 'ppl:parents:add', 'biz:build', 'acct:pin'].forEach(id => { if (!layCardTile_(d, id, 'lay-c-del')) bad.push(id + ' has no Delete'); });
  /* SPLIT SITS BESIDE THEM on a card of several fields (Contact & address). */
  const split = d.querySelector('#s-account .card[data-split^="set:account:"] [data-do="lay-split"]');
  if (!split || !split.closest('.card').querySelector('.card-admin')) bad.push('a several-field settings card lacks Split beside its admin row');
  /* DOWN, UP: Your role on Student settings. */
  const s0 = laySeen_(w, 'account'), id = 'acct:roles', i0 = s0.indexOf(id);
  if (i0 < 0 || i0 >= s0.length - 1) return bad.concat(['Your role is not a movable card on Student settings: ' + s0.join()]);
  A['lay-c-move'](layCardTile_(d, id, 'lay-c-move', '1')); await wait(250); await layPaintAll_(w);
  if (laySeen_(w, 'account').indexOf(id) !== i0 + 1) bad.push('Move down left Student settings ' + laySeen_(w, 'account').join());
  const drawn = [...d.querySelectorAll('#s-account .card-admin')].map(x => x.dataset.layFor).filter((x, i, a) => a.indexOf(x) === i);
  if (drawn.indexOf(id) !== drawn.indexOf(s0[i0 + 1]) + 1) bad.push('Move down was not redrawn: ' + drawn.join());
  A['lay-c-move'](layCardTile_(d, id, 'lay-c-move', '-1')); await wait(250); await layPaintAll_(w);
  if (laySeen_(w, 'account').join() !== s0.join()) bad.push('Move up did not put it back: ' + laySeen_(w, 'account').join());
  /* ACROSS: Notifications to the previous settings column (Tutor settings), last there, the same card. */
  A['lay-c-col'](layCardTile_(d, 'acct:notify', 'lay-c-col', '-1')); await wait(300);
  await layPaintAll_(w);
  const st = laySeen_(w, 'staff');
  if (st[st.length - 1] !== 'acct:notify' || d.querySelector('#s-account .notify-card') || !d.querySelector('#s-staff .notify-card')) bad.push('Notifications did not move to the end of Tutor settings: ' + st.join());
  if (d.querySelectorAll('.notify-card').length !== 1) bad.push('Notifications is drawn ' + d.querySelectorAll('.notify-card').length + ' times');
  /* AND A SETTINGS GROUP TO PARENT SETTINGS: its fields still have one home. */
  const grp = laySeen_(w, 'staff').find(x => /^set:staff:/.test(x));
  if (grp) {
    A['lay-c-col'](layCardTile_(d, grp, 'lay-c-col', '-1')); await wait(300); await layPaintAll_(w);
    if (laySeen_(w, 'family').indexOf(grp) === -1) bad.push(grp + ' did not move to Parent settings');
  }
  const ed = editorsOf_(d, {});
  Object.keys(ed).filter(f => ed[f].size > 1).forEach(f => bad.push('after the moves "' + f + '" is edited in ' + ed[f].size + ' places'));
  const posts = sent.filter(x => x.action === 'layoutSave');
  if (posts.length !== (grp ? 4 : 3)) bad.push(posts.length + ' layoutSave posts for ' + (grp ? 4 : 3) + ' presses');
  /* A RELOAD KEEPS IT. */
  const p2 = payload(); p2.layout = layLast_(sent);
  const r = layBoot_({ payload: p2 }); await wait(300); await layPaintAll_(r.w);
  if (!r.w.document.querySelector('#s-staff .notify-card') || r.w.document.querySelector('#s-account .notify-card')) bad.push('a reload did not keep Notifications on Tutor settings');
  /* BUSINESS: Build up one place; "+ Add a student" down to the bottom of Student profiles. */
  const b0 = laySeen_(w, 'site'), bi = b0.indexOf('biz:build');   // Build is on Site since 491
  A['lay-c-move'](layCardTile_(d, 'biz:build', 'lay-c-move', '-1')); await wait(250); await layPaintAll_(w);
  if (laySeen_(w, 'site').indexOf('biz:build') !== bi - 1) bad.push('Build did not move up on Site: ' + laySeen_(w, 'site').join());
  for (let k = 0; k < 12 && !layCardTile_(d, 'ppl:students:add', 'lay-c-move', '1')?.disabled; k++) {
    A['lay-c-move'](layCardTile_(d, 'ppl:students:add', 'lay-c-move', '1')); await wait(200); await layPaintAll_(w);
  }
  const ss = laySeen_(w, 'students');
  if (ss[ss.length - 1] !== 'ppl:students:add') bad.push('"+ Add a student" did not reach the bottom: ' + ss.join());
  const pgs = [...d.querySelectorAll('#s-students > .page')];
  if (!pgs.length || !pgs[pgs.length - 1].querySelector('[data-do="person-add"]')) bad.push('the last page of Student profiles is not "+ Add a student"');
  /* A BUSINESS CARD CANNOT LEAVE FOR A COLUMN… IT CAN; a settings card cannot go to Business (it would vanish for all but an admin). */
  /* THE LAST COLUMN A NON-ADMIN CARD MAY STAND ON is Apprentice settings since 730 (Biz settings, an admin's, is right of it). */
  const pr = layCardTile_(d, 'appr:blurb', 'lay-c-col', '1');
  if (!pr || pr.disabled || pr.getAttribute('aria-label') !== 'Move to a new column') bad.push('▶ on the last right-hand column does not offer a new column (466): ' + (pr && pr.getAttribute('aria-label')));
  if (r.errs.length) bad.push('errors: ' + r.errs.join('; '));
  return bad;
});

check('layout cards (465): Delete asks twice in place and says when a card is the only place to edit a setting; a delete is final (477) — nothing lists or brings it back; Build, Needs help, Manage your child and the "+ Add" cards all delete', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-c-del']) return ['no lay-c-del handler — NOT checked'];
  await layPaintAll_(w);
  const del = async id => { const x = layCardTile_(d, id, 'lay-c-del'); if (!x) { bad.push(id + ' has no Delete'); return null; } A['lay-c-del'](x); const say = x.getAttribute('aria-label'); await wait(450); A['lay-c-del'](x); await wait(250); await layPaintAll_(w); return say; };
  /* ONE TAP IS NOT A DELETE, and a settings group says it is the only place. */
  const grp = laySeen_(w, 'account').find(x => /^set:account:/.test(x));
  const tile = layCardTile_(d, grp, 'lay-c-del');
  A['lay-c-del'](tile);
  if (sent.some(x => x.action === 'layoutSave')) bad.push('one tap deleted');
  if (!/^Tap again — this removes the only place to edit /.test(tile.getAttribute('aria-label') || '')) bad.push('the only editor\'s second step reads ' + tile.getAttribute('aria-label'));
  if (d.querySelector('#sheet:not(.hidden) #sheet-body *')) bad.push('delete opened a sheet');
  await wait(450); A['lay-c-del'](tile); await wait(250); await layPaintAll_(w);
  if (laySeen_(w, 'account').indexOf(grp) !== -1 || d.querySelector(`[data-lay-card="${grp}"], [data-split="${grp}"]`)) bad.push(grp + ' was not deleted');
  const says = {};
  for (const id of ['biz:build', 'ppl:students:help', 'ppl:students:add', 'ppl:tutors:add', 'ppl:parents:add']) says[id] = await del(id);
  if (!/^Tap again to delete/.test(says['biz:build'] || '')) bad.push('Build\'s second step reads ' + says['biz:build']);
  if (d.querySelector('#s-biz .me-build') || d.querySelector('.help-list') || d.querySelector('[data-do="person-add"]')) bad.push('Build, Needs help or an Add card is still drawn');
  /* FINAL (477): no list of deleted cards, no Add back, no Layout card. */
  if (d.querySelector('.lay-del-pick, .lay-foot, .layout-card, [data-do="lay-w-undel"], [data-do="layout-reset"]')) bad.push('a way back is still drawn');
  /* MANAGE YOUR CHILD, for a client. */
  const CL = { name: 'Cleo Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'cleo' };
  const c = boot({ before: signedInAs_(CL) }); await wait(300);
  /* A CARD DELETED FOR EVERYBODY: Manage your child on a client's phone. */
  const p = payload(); p.layout = { v: 1, widgets: {}, deleted: ['ppl:students:manage'] };
  const c2 = boot({ payload: p, before: signedInAs_(CL) }); await wait(300); await layPaintAll_(c2.w);
  await layPaintAll_(c.w);
  if (!c.w.document.querySelector('.kid-manage')) bad.push('a client has no Manage your child to delete (fixture) — NOT checked');
  else if (c2.w.document.querySelector('.kid-manage')) bad.push('a deleted Manage your child is still drawn for a client');
  return bad;
});

check('layout cards (465): Start here makes a card, a person or "the first person" where a column opens — stored as start, kept on reload, pressed again cleared; a role-gated card moved to another column stays hidden from those without the role; a member sees no tiles and cannot post; a garbled cards/start falls back', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-start']) return ['no lay-start handler — NOT checked'];
  await layPaintAll_(w);
  /* A PERSON'S START HERE and the list's "the first person". */
  /* "THE FIRST PERSON" IS NO LONGER A SECOND TILE (466): a stored 'first-person' still opens there. */
  const first = d.querySelector('#s-parents .start-tiles [data-do="lay-start"]') || d.querySelector('.start-tiles [data-do="lay-start"]');
  if (!first) return bad.concat(['no person card offers Start here']);
  const col = first.dataset.col;
  const fp = payload(); fp.layout = { v: 1, widgets: {}, deleted: [], start: { [col]: 'first-person' } };
  const f = layBoot_({ payload: fp }); await wait(300); await layPaintAll_(f.w);
  const at = f.w.cardStartAt_(col), pg = [...f.w.document.querySelectorAll('#s-' + col + ' > .page')][at];
  if (!pg || !pg.querySelector('.start-tiles')) bad.push(col + ' opens on page ' + at + ', not the first person');
  let L;
  const person = [...d.querySelectorAll('#s-' + col + ' .start-tiles [data-do="lay-start"]')].map(x => x.dataset.lc).filter(x => /^person:/.test(x)).pop();
  A['lay-start'](d.querySelector(`#s-${col} [data-do="lay-start"][data-lc="${person}"]`)); await wait(250); await layPaintAll_(w);
  L = layLast_(sent);
  if (!L.start || L.start[col] !== person) bad.push('a person\'s Start here posted ' + JSON.stringify(L.start));
  const p2 = payload(); p2.layout = L;
  const r = layBoot_({ payload: p2 }); await wait(300); await layPaintAll_(r.w);
  const at2 = r.w.cardStartAt_(col), pg2 = [...r.w.document.querySelectorAll('#s-' + col + ' > .page')][at2];
  if (!pg2 || !pg2.querySelector(`[data-do="lay-start"][data-lc="${person}"].on`)) bad.push('after a reload ' + col + ' does not open on ' + person);
  /* A CARD'S START HERE, then pressed again clears. */
  A['lay-start'](layCardTile_(d, 'biz:build', 'lay-start')); await wait(250); await layPaintAll_(w);
  if ((layLast_(sent).start || {}).site !== 'biz:build') bad.push('Build\'s Start here was not stored');
  A['lay-start'](layCardTile_(d, 'biz:build', 'lay-start')); await wait(250);
  if ((layLast_(sent).start || {}).site) bad.push('Start here pressed again did not clear');
  /* A ROLE-GATED CARD MOVED: the Staff hub to Student settings stays a tutor's. */
  const g = payload(); g.layout = { v: 1, widgets: {}, deleted: [], cards: { account: ['staff:hub'], students: ['acct:pin'] } };
  const CL = { name: 'Cleo Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'cleo' };
  const c = boot({ payload: g, before: signedInAs_(CL) }); await wait(300); await layPaintAll_(c.w);
  /* 467: SHOWN TO A CLIENT ONLY LOCKED — the card is seen, never usable. */
  if (c.w.document.querySelector('[data-do="hub-open"]:not([disabled]), .staff-top:not(.is-locked)')) bad.push('a client can use the Staff hub moved to Student settings');
  if (!c.w.document.querySelector('#s-students [data-do="pin-save"]') || c.w.document.querySelector('#s-account [data-do="pin-save"]')) bad.push('a client does not find the PIN where it was moved');
  if (c.w.document.querySelector('.card-admin, .start-tiles, [data-do="lay-c-move"]')) bad.push('a client sees layout tiles');
  /* A MEMBER: no tiles, no post. */
  const m = boot({ member: true }); await wait(300); await layPaintAll_(m.w);
  if (m.w.document.querySelector('.card-admin, .start-tiles')) bad.push('a member sees card tiles');
  const fake = m.w.document.createElement('button'); fake.setAttribute('data-lc', 'acct:pin'); fake.setAttribute('data-col', 'account'); fake.setAttribute('data-d', '1'); fake.setAttribute('data-armed', '1');
  ['lay-c-move', 'lay-c-col', 'lay-c-del', 'lay-start'].forEach(k => { try { m.w.__t.ACTIONS[k](fake); } catch (e) {} });
  await wait(100);
  if (m.sent.some(x => x.action === 'layoutSave')) bad.push('a member posted layoutSave');
  /* GARBLED: unknown ids, wrong shapes. */
  for (const junk of [{ cards: 'x', start: [1] }, { cards: { account: ['ghost', 7, 'acct:roles'], nowhere: ['acct:pin'] }, start: { account: 'ghost', biz: {} } }, '{bad']) {
    const q = payload(); q.layout = junk;
    const gb = layBoot_({ payload: q }); await wait(250); await layPaintAll_(gb.w);
    if (gb.errs.length) bad.push(JSON.stringify(junk) + ' threw: ' + gb.errs.join('; '));
    if (!gb.w.document.querySelector('#s-account [data-do="pin-save"]') || !gb.w.document.querySelector('#s-account .roles-card')) bad.push(JSON.stringify(junk) + ' lost a Student settings card');
  }
  return bad;
});

/* ---------- THE LAYOUT ENGINE, AGAIN (466): independent pieces, a new column past the last, every card deletable, one Start here ---------- */
const layPieces_ = (d, base) => [...d.querySelectorAll(`.card[data-split="${base}"][data-lay-card^="${base}#"]`)].map(c => c.dataset.layCard);

check('layout engine (466): a split card\'s pieces are cards of their own — each moves up, down and across, is deleted and gets Start here alone, each field still edited in one place; Join gathers them back wherever they went', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-split'] || typeof w.cardSeen_ !== 'function') return ['no lay-split or cardSeen_ — NOT checked'];
  await layPaintAll_(w);
  const base = 'set:account:contact';
  const sp = d.querySelector(`#s-account [data-do="lay-split"][data-card="${base}"]`);
  if (!sp) return ['Contact on Student settings offers no Split — NOT checked'];
  A['lay-split'](sp); await wait(250); await layPaintAll_(w);
  const pcs = layPieces_(d, base);
  if (pcs.length < 2) return bad.concat(['Split drew ' + pcs.length + ' pieces with their own ids']);
  pcs.forEach(id => { if (!layCardRow_(d, id)) bad.push(id + ' has no admin row of its own'); });
  const seen0 = laySeen_(w, 'account');
  if (pcs.some(id => seen0.indexOf(id) === -1)) bad.push('the pieces are not each a card on Student settings: ' + seen0.join());
  /* THE SECOND PIECE UP, ALONE: the first stays where it was. */
  const [p1, p2] = pcs;
  A['lay-c-move'](layCardTile_(d, p2, 'lay-c-move', '-1')); await wait(250); await layPaintAll_(w);
  let s = laySeen_(w, 'account');
  if (s.indexOf(p2) !== s.indexOf(p1) - 1) bad.push('the second piece did not move up past the first alone: ' + s.join());
  /* THE FIRST ACROSS to Tutor settings, alone. */
  A['lay-c-col'](layCardTile_(d, p1, 'lay-c-col', '-1')); await wait(250); await layPaintAll_(w);
  if (laySeen_(w, 'staff').indexOf(p1) === -1 || laySeen_(w, 'account').indexOf(p1) !== -1) bad.push(p1 + ' did not move to Tutor settings: ' + laySeen_(w, 'staff').join());
  if (laySeen_(w, 'staff').indexOf(p2) !== -1) bad.push('the other piece went with it');
  const ed = editorsOf_(d, {});
  Object.keys(ed).filter(f => ed[f].size > 1).forEach(f => bad.push('"' + f + '" is edited in ' + ed[f].size + ' places after the pieces moved'));
  /* START HERE on one piece, then DELETE another. */
  A['lay-start'](layCardTile_(d, p1, 'lay-start')); await wait(250); await layPaintAll_(w);
  if (((layLast_(sent) || {}).start || {}).staff !== p1) bad.push('Start here on a piece was not stored: ' + JSON.stringify((layLast_(sent) || {}).start));
  const del = layCardTile_(d, p2, 'lay-c-del');
  A['lay-c-del'](del); await wait(450); A['lay-c-del'](del); await wait(250); await layPaintAll_(w);
  if (laySeen_(w, 'account').indexOf(p2) !== -1 || d.querySelector(`[data-lay-card="${p2}"]`)) bad.push(p2 + ' was not deleted alone');
  if (!d.querySelector(`[data-lay-card="${p1}"]`)) bad.push('deleting one piece took ' + p1 + ' with it');
  /* A RELOAD KEEPS EACH PIECE WHERE IT IS — and another account sees the same. */
  const L = layLast_(sent), p = payload(); p.layout = L;
  const r = layBoot_({ payload: p }); await wait(300); await layPaintAll_(r.w);
  if (laySeen_(r.w, 'staff').indexOf(p1) === -1 || r.w.document.querySelector(`[data-lay-card="${p2}"]`)) bad.push('a reload did not keep the pieces apart');
  /* JOIN, from the piece on Tutor settings: one card again, on Student settings, nothing of its pieces left. */
  A['lay-join'](d.querySelector(`[data-lay-card="${p1}"] [data-do="lay-join"]`) || d.createElement('button')); await wait(250); await layPaintAll_(w);
  const J = layLast_(sent) || {}, txt = JSON.stringify(J);
  if (txt.indexOf(base + '#') !== -1) bad.push('Join left pieces in the layout: ' + txt);
  if (d.querySelectorAll(`.card[data-split="${base}"]`).length !== 1 || laySeen_(w, 'account').indexOf(base) === -1) bad.push('Join did not gather ' + base + ' back into one card on Student settings');
  if (r.errs.length) bad.push('errors: ' + r.errs.join('; '));
  return bad;
});

check('layout engine (508): ▶ on a Biz settings card makes an admin-only column after it (Biz settings is last since 730) with the card on it; a settings card cannot move onto it; a client never sees it', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  await layPaintAll_(w);
  const sid = laySeen_(w, 'biz').find(x => /^(site|biz):/.test(x));
  const right = sid && layCardTile_(d, sid, 'lay-c-col', '1');
  if (!right || right.disabled) return ['no live ▶ on a Biz settings card (' + sid + ') — NOT checked'];
  if (right.getAttribute('aria-label') !== 'Move to a new admin-only column') bad.push('▶ on Biz settings says ' + right.getAttribute('aria-label'));
  A['lay-c-col'](right); await wait(300);
  const L = layLast_(sent) || {};
  const cu = (L.custom || [])[0] || {};
  if (!/^custom-\d+$/.test(cu.id || '') || cu.admin !== true || ((L.cards || {})[cu.id] || []).indexOf(sid) === -1) bad.push('▶ past Biz settings posted ' + JSON.stringify(L));
  const ids = t.TABS.map(x => x.id);
  if (ids.indexOf(cu.id) !== ids.indexOf('biz') + 1) bad.push('the admin-only column is not just after Biz settings: ' + ids.join());
  try { w.paint(cu.id); } catch (e) { bad.push('painting it threw ' + e.message); }
  await wait(150); await layPaintAll_(w);
  if (laySeen_(w, cu.id).indexOf(sid) === -1) bad.push(sid + ' is not on the new column: ' + laySeen_(w, cu.id).join());
  /* A SETTINGS CARD'S ▶ never reaches it: the last right-hand public column still offers a public new column. */
  const pr = layCardTile_(d, 'appr:blurb', 'lay-c-col', '1');
  if (!pr || pr.getAttribute('aria-label') !== 'Move to a new column') bad.push('▶ on Apprentice settings now says ' + (pr && pr.getAttribute('aria-label')));
  /* A CLIENT reloading has no such column and no section for it. */
  const CL = { name: 'Cleo Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'cleo' };
  const p = payload(); p.layout = layLast_(sent);
  const c = boot({ payload: p, before: signedInAs_(CL) }); await wait(300);
  if (c.w.__t.TABS.some(x => x.id === cu.id) || c.w.document.getElementById('s-' + cu.id)) bad.push('a client sees the admin-only column');
  if (c.errs.length) bad.push('client errors: ' + c.errs.join('; '));
  /* ◀ BACK to Biz settings empties it and it goes. */
  A['lay-c-col'](layCardTile_(d, sid, 'lay-c-col', '-1')); await wait(300);
  if ((layLast_(sent) || {}).custom) bad.push('the emptied admin column was not removed');
  return bad;
});

check('layout engine (466, 710): ▶ on the last right-hand column makes a new column before Business, for everybody, with no name — no Column name card, no Rename, its tab says its first card; its card moved back empties it and it goes; ◀ from the first column a unit stands on makes one on the far left; a garbled custom falls back', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  await layPaintAll_(w);
  const id = 'appr:blurb';   /* the last column a public card stands on is Apprentice settings since 730 */
  const right = layCardTile_(d, id, 'lay-c-col', '1');
  if (!right || right.disabled) return ['Apprentice settings\' card has no live ▶ — NOT checked'];
  A['lay-c-col'](right); await wait(300);
  const L = layLast_(sent) || {};
  if (JSON.stringify(L.custom) !== JSON.stringify([{ id: 'custom-1' }]) || ((L.cards || {})['custom-1'] || []).join() !== id) bad.push('▶ past the last posted ' + JSON.stringify(L));
  const ids = t.TABS.map(x => x.id);
  if (ids.indexOf('custom-1') === -1 || ids.indexOf('custom-1') !== ids.indexOf('biz') - 1) bad.push('the new column is not just before Business: ' + ids.join());
  try { w.paint('custom-1'); w.paint('apprentice'); } catch (e) { bad.push('painting it threw ' + e.message); }
  await wait(150);
  if (!d.querySelector('#s-custom-1 .appr-set') || d.querySelector('#s-apprentice .appr-set')) bad.push('the Apprentice settings card is not on the new column alone');
  /* NO NAME (710): a column is a position. */
  if (d.querySelector('#s-custom-1 .custom-head, #s-custom-1 .lay-col-name, [data-do="lay-col-rename"], [data-do="lay-col-del"]')) bad.push('the new column still has a name card, Rename or Delete column');
  if (A['lay-col-rename'] || A['lay-col-del']) bad.push('a lay-col-rename or lay-col-del handler still exists');
  if ((t.TABS.find(x => x.id === 'custom-1') || {}).label !== w.cardLabel_(id)) bad.push('the tab is not named for its first card: ' + (t.TABS.find(x => x.id === 'custom-1') || {}).label);
  /* EVERYBODY: a client reloading has the column and the card where it was put (its own gate decides what is drawn). */
  const CL = { name: 'Cleo Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'cleo' };
  const p = payload(); p.layout = layLast_(sent);
  const c = boot({ payload: p, before: signedInAs_(CL) }); await wait(300);
  const cids = c.w.__t.TABS.map(x => x.id);
  if (cids.indexOf('custom-1') === -1 || cids.indexOf('biz') !== -1) bad.push('a client\'s columns: ' + cids.join());
  try { c.w.paint('custom-1'); } catch (e) {}
  await wait(100);
  if (!c.w.document.getElementById('s-custom-1')) bad.push('a client has no section for the new column');
  if (c.w.document.querySelector('#s-custom-1 .card-admin')) bad.push('a client sees the admin line on the new column');
  if (c.errs.length) bad.push('client errors: ' + c.errs.join('; '));
  /* A NAMED COLUMN SAVED BEFORE 710 still loads, its title dropped. */
  const o = payload(); o.layout = { v: 2, widgets: {}, deleted: [], custom: [{ id: 'custom-3', title: 'Front desk' }], cards: { 'custom-3': ['acct:voice'] } };
  const ob = layBoot_({ payload: o }); await wait(300);
  const otab = ob.w.__t.TABS.find(x => x.id === 'custom-3');
  if (!otab || otab.label === 'Front desk') bad.push('an old named column did not load as an unnamed one: ' + JSON.stringify(otab && otab.label));
  if (JSON.stringify(ob.w.layoutNow_().custom) !== JSON.stringify([{ id: 'custom-3' }])) bad.push('an old named column read as ' + JSON.stringify(ob.w.layoutNow_().custom));
  /* ◀ BACK: the column is empty and goes. */
  await layPaintAll_(w); try { w.paint('custom-1'); } catch (e) {}
  await wait(100);
  A['lay-c-col'](layCardTile_(d, id, 'lay-c-col', '-1')); await wait(300);
  const B = layLast_(sent) || {};
  if (B.custom || (B.cards || {})['custom-1']) bad.push('the emptied column was not removed: ' + JSON.stringify(B));
  if (t.TABS.some(x => x.id === 'custom-1') || d.getElementById('s-custom-1')) bad.push('the emptied column is still a tab or a section');
  await layPaintAll_(w);
  if (!d.querySelector('#s-apprentice .appr-set')) bad.push('the Apprentice settings card did not come back');
  /* ◀ FROM THE FIRST COLUMN A UNIT STANDS ON (Reels) MAKES ONE ON THE FAR LEFT (710); ▶ back empties it and it goes. */
  /* THE FIRST REELS WIDGET (790: a tool is a Find card, placed by the funnel): ◀ takes it to Spotlight, then past it. */
  t.go('reel', false, true); await wait(300);
  const tid = layIds_(t, 'reel')[0];
  const tl = layTile_(d, tid, 'lay-w-col', '-1');
  if (!tl || tl.disabled) bad.push('the first Reels widget has no live ◀');
  else {
    if (tl.getAttribute('aria-label') === 'Move to previous column') { A['lay-w-col'](tl); await wait(300); try { w.paint('spotlight'); } catch (e) {} await wait(150); }
    /* SPOTLIGHT IS THE FIRST COLUMN A UNIT STANDS ON SINCE 730: one more ◀ takes the tool there first. */
    const sp = layTile_(d, tid, 'lay-w-col', '-1');
    if (sp && sp.getAttribute('aria-label') === 'Move to previous column') { A['lay-w-col'](sp); await wait(300); try { w.paint('spotlight'); } catch (e) {} await wait(150); }
    const lt = layTile_(d, tid, 'lay-w-col', '-1');
    if (!lt || lt.getAttribute('aria-label') !== 'Move to a new column on the left') bad.push('◀ on Spotlight says ' + (lt && lt.getAttribute('aria-label')));
    else {
      A['lay-w-col'](lt); await wait(300);
      const LL = layLast_(sent) || {}, nid = ((LL.custom || [])[0] || {}).id;
      if (!nid || LL.custom[0].first !== true || ((LL.widgets || {})[nid] || []).indexOf(tid) === -1) bad.push('◀ past the first posted ' + JSON.stringify(LL));
      const lids = t.TABS.map(x => x.id);
      if (!nid || lids.indexOf(nid) !== lids.indexOf('spotlight') - 1) bad.push('the new left column is not just before Spotlight: ' + lids.join());
      try { w.paint(nid); } catch (e) {}
      await wait(150);
      if (!d.querySelector('#s-' + nid + ' #wgt-' + tid)) bad.push('the tool is not drawn on the new left column');
      const back = layTile_(d, tid, 'lay-w-col', '1');
      if (back) { A['lay-w-col'](back); await wait(300); }
      if ((layLast_(sent) || {}).custom || t.TABS.some(x => x.id === nid)) bad.push('the emptied left column was not removed');
    }
  }
  /* GARBLED: a custom with a bad id, a duplicate — the bad ones ignored, the column still drawn. */
  const g = payload(); g.layout = { v: 1, widgets: {}, deleted: [], custom: [{ id: 'evil' }, { id: 'custom-2' }, { id: 'custom-2', title: 'x' }, 7], cards: { 'custom-2': ['acct:voice'], evil: ['acct:pin'] } };
  const gb = layBoot_({ payload: g }); await wait(300); await layPaintAll_(gb.w);
  const gids = gb.w.__t.TABS.map(x => x.id);
  if (gids.filter(x => /custom|evil/.test(x)).join() !== 'custom-2') bad.push('a garbled custom gave columns ' + gids.join());
  if (!gb.w.document.querySelector('#s-account [data-do="pin-save"]')) bad.push('a card named under a bad column left Student settings');
  if (gb.errs.length) bad.push('garbled errors: ' + gb.errs.join('; '));
  return bad;
});

check('layout engine (710): any unit anywhere — a settings card moves into Reels and a tool into Student settings, each with the same ▲ ▼ ◀ ▶ as its neighbours, up and down past a unit of the other kind; a reload keeps both where they were put and the tool is started there', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  await layPaintAll_(w);
  /* A SETTINGS CARD INTO TOOLS: ◀ from Student settings until it stands on Reels. */
  const cid = laySeen_(w, 'account').find(x => d.querySelector(`#s-account .card-admin[data-lay-for="${x}"]`) && !/^own:/.test(x));
  if (!cid) return ['Student settings has no card with an admin row — NOT checked'];
  const CARD_ = `[data-lay-for="${cid}"]`;
  for (let k = 0; k < 12; k++) {
    const col = t.TABS.map(x => x.id).find(c => laySeen_(w, c).indexOf(cid) !== -1 && d.querySelector(`#s-${c} .card-admin[data-lay-for="${cid}"]`));
    if (col === 'reel' || !col) { if (!col) bad.push('the card ' + cid + ' is on no column, step ' + k); break; }
    const lt = d.querySelector(`#s-${col} .card-admin[data-lay-for="${cid}"] [data-do="lay-c-col"][data-d="-1"]`);
    if (!lt || lt.disabled) { bad.push('stuck on ' + col + ': ' + (lt ? lt.getAttribute('aria-label') + ' off' : 'no ◀')); break; }
    A['lay-c-col'](lt); await wait(300);
    try { const to = (layLast_(sent) || {}).cards || {}; Object.keys(to).forEach(c => { try { w.paint(c); } catch (e) {} }); } catch (e) {}
    await wait(150);
  }
  try { w.paint('reel'); } catch (e) {}
  await wait(150);
  const L1 = layLast_(sent) || {};
  if (((L1.cards || {}).reel || []).indexOf(cid) === -1) bad.push('the card ' + cid + ' never reached Reels: ' + JSON.stringify(L1.cards));
  const onTools = d.querySelector(`#s-reel .card-admin[data-lay-for="${cid}"]`);
  if (!onTools) bad.push('the card ' + cid + ' is not drawn on Reels with its admin row');
  if (!d.querySelector('#s-reel ' + CARD_)) bad.push('nothing of ' + cid + ' is drawn on Reels');
  if (d.querySelector('#s-account ' + CARD_)) bad.push('the card ' + cid + ' is still on Student settings too — two homes');
  /* ▲ PAST A TOOL: the card is last on Reels, and Move up puts it above the last tool. */
  const tools0 = layIds_(t, 'reel'), lastTool = tools0[tools0.length - 1];
  const up = onTools && onTools.querySelector('[data-do="lay-c-move"][data-d="-1"]');
  if (!up || up.disabled) bad.push('the card on Reels has no live Move up');
  else {
    A['lay-c-move'](up); await wait(300);
    const ord = ((layLast_(sent) || {}).cards || {}).reel || [];
    if (ord.indexOf(cid) === -1 || ord.indexOf(cid) > ord.indexOf(lastTool)) bad.push('Move up did not put the card above ' + lastTool + ': ' + ord.join());
    const slots = [...d.querySelectorAll('#s-reel .widget-slot, #s-reel .card-admin' + CARD_)].map(x => x.matches(CARD_) ? cid : x.id.slice(4));
    if (slots.indexOf(cid) === -1 || slots.indexOf(cid) > slots.indexOf(lastTool)) bad.push('Tools did not redraw the card above ' + lastTool + ': ' + slots.join());
  }
  /* A TOOL INTO STUDENT SETTINGS: ▶ from Reels until it stands there. */
  const tid = tools0.find(x => { const o = w.layoutWidgetOf_(x); return o && !o.admin && !o.tutor && !o.signedIn && x !== 'reels'; }) || tools0[0];
  for (let k = 0; k < 12; k++) {
    const col = t.TABS.map(x => x.id).find(c => d.querySelector(`#s-${c} #wgt-${tid}`));
    if (col === 'account' || !col) break;
    const rt = d.querySelector(`#s-${col} #wgt-${tid}`)?.closest('.card')?.querySelector('.wgt-admin [data-do="lay-w-col"][data-d="1"]');
    if (!rt || rt.disabled) break;
    A['lay-w-col'](rt); await wait(300);
    await layPaintAll_(w);
    ['reel', 'shop'].forEach(c => { try { w.paint(c); } catch (e) {} });
    await wait(150);
  }
  const L2 = layLast_(sent) || {};
  if (((L2.widgets || {}).account || []).indexOf(tid) === -1) bad.push(tid + ' never reached Student settings: ' + JSON.stringify(L2.widgets));
  const there = d.querySelector(`#s-account #wgt-${tid}`)?.closest('.card');
  if (!there) bad.push(tid + ' is not drawn on Student settings');
  else ['Move up', 'Move down', 'Move to previous column', 'Move to next column'].forEach(l => {
    if (!there.querySelector(`.wgt-admin [aria-label="${l}"]`)) bad.push(tid + ' on Student settings has no ' + l);
  });
  if (d.querySelector(`#s-reel #wgt-${tid}`)) bad.push(tid + ' is still on Reels too');
  /* A RELOAD keeps both, and the tool starts on its new column. */
  const p = payload(); p.layout = layLast_(sent);
  const r = layBoot_({ payload: p }); await wait(300);
  await layPaintAll_(r.w); try { r.w.paint('reel'); } catch (e) {}
  await wait(150);
  const rd = r.w.document;
  if (!rd.querySelector('#s-reel ' + CARD_)) bad.push('a reload lost the card ' + cid + ' on Reels');
  if (!rd.querySelector(`#s-account #wgt-${tid}`)) bad.push('a reload lost ' + tid + ' on Student settings');
  r.w.__t.go('account', false, true); await wait(200);
  { const host = rd.getElementById('s-account'), pg = rd.querySelector(`#s-account #wgt-${tid}`)?.closest('.page'); const n = pg ? [...host.querySelectorAll(':scope > .page')].indexOf(pg) : -1; if (n > -1) { try { r.w.goPage('account', n, true); } catch (e) {} } }
  await wait(600);
  const slot = rd.querySelector(`#s-account #wgt-${tid}`);
  if (slot && slot.getAttribute('aria-busy') && r.w.widgetsOn_('account').some(x => String(x.id) === tid && typeof x.start === 'function')) bad.push(tid + ' on Student settings was never started');
  /* A CLIENT reloading sees both where they were put, with no admin tiles. */
  const CL = { name: 'Cleo Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'cleo' };
  const c = boot({ payload: p, before: signedInAs_(CL) }); await wait(300);
  try { c.w.paint('reel'); c.w.paint('account'); } catch (e) {}
  await wait(150);
  if (!c.w.document.querySelector(`#s-account #wgt-${tid}`)) bad.push('a client does not see ' + tid + ' on Student settings');
  if (c.w.cardSeen_('reel').indexOf(cid) === -1) bad.push('a client does not see the card ' + cid + ' on Reels');
  if (c.w.document.querySelector('.wgt-admin')) bad.push('a client sees layout tiles');
  [r, c].forEach(x => { if (x.errs.length) bad.push('errors: ' + x.errs.join('; ')); });
  return bad;
});

/* ---------- THE OWNER'S COLUMNS AND WHOLE-COLUMN MOVES (730) ---------- */
const COLS730_ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'settings', 'columns.json'), 'utf8'));
check('columns (730): the owner\'s eleven — five profiles then six settings, named as asked, in that order; Web profile is the business card, Apprentice profile says none yet; Web and Biz settings an admin\'s alone', async () => {
  const want = ['Web profile', 'Tutor profile', 'Student profile', 'Parent profile', 'Apprentice profile', 'Tutor settings', 'Web settings',
    'Kids settings', 'Parent settings', 'Apprentice settings', 'Biz settings'];
  const bad = [];
  const { w } = layBoot_();
  await wait(300);
  const t = w.__t, d = w.document;
  const labels = t.TABS.map(x => x.label), got = labels.filter(l => want.indexOf(l) !== -1);
  if (got.join('|') !== want.join('|')) bad.push('an admin\'s columns: ' + got.join(', '));
  const at = labels.indexOf('Web profile');
  if (labels.slice(at, at + want.length).join('|') !== want.join('|')) bad.push('the eleven are not side by side: ' + labels.slice(at).join(', '));
  const fileLabels = COLS730_.map(r => r.label).filter(l => want.indexOf(l) !== -1);
  if (fileLabels.join('|') !== want.join('|')) bad.push('columns.json says ' + fileLabels.join(', '));
  t.go('web', false, true); await wait(200); try { w.paint('web'); } catch (e) {}
  const web = d.querySelector('#s-web .web-card');
  if (!web) bad.push('Web profile draws no business card');
  else if (!/@family\.|\w/.test(web.querySelector('h3')?.textContent || '')) bad.push('the business card has no name');
  try { w.paint('apprentices'); } catch (e) {}
  if (!d.querySelector('#s-apprentices .appr-card')) bad.push('Apprentice profile draws nothing');
  try { w.paint('site'); w.paint('biz'); } catch (e) {}
  ['site:rules', 'site:inbox', 'biz:build'].forEach(id => { if (w.cardHome0_(id) !== 'site') bad.push(id + ' is not a Web settings card'); });
  ['biz:apps', 'biz:staff', 'biz:profit-sum'].forEach(id => { if (w.cardHome0_(id) !== 'biz') bad.push(id + ' left Biz settings'); });
  const s = boot({ before: signedInAs_({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'], handle: 'sam' }) });
  await wait(300);
  const ids = s.w.__t.TABS.map(x => x.id);
  ['site', 'biz'].forEach(c => { if (ids.indexOf(c) !== -1) bad.push(c + ' is a student\'s column'); });
  ['web', 'apprentices', 'apprentice', 'account'].forEach(c => { if (ids.indexOf(c) === -1) bad.push(c + ' is not a student\'s column'); });
  return bad;
});

check('layout (730): a whole column moves — the first unit of Web profile carries Move this column ◀ ▶; ▶ saves an order with Web profile right of Tutor profile, the row redraws so, and a reload keeps it', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-col']) return ['no lay-col handler — NOT checked'];
  try { w.paint('web'); } catch (e) {}
  await wait(150);
  const rt = d.querySelector('#s-web [data-do="lay-col"][data-d="1"]');
  if (!rt || rt.disabled) return ['Web profile has no live Move this column right'];
  if (d.querySelectorAll('#s-web [data-do="lay-col"][data-d="1"]').length !== 1) bad.push('more than one column tile on Web profile');
  A['lay-col'](rt); await wait(300);
  const L = layLast_(sent) || {}, ord = L.order || [];
  if (!(ord.indexOf('web') > ord.indexOf('tutors') && ord.indexOf('tutors') !== -1)) bad.push('the saved order does not put web after tutors: ' + ord.join(' '));
  const ids = t.TABS.map(x => x.id);
  if (ids.indexOf('web') !== ids.indexOf('tutors') + 1) bad.push('the row is not redrawn so: ' + ids.join(' '));
  const p = payload(); p.layout = L;
  const r = layBoot_({ payload: p }); await wait(300);
  const ids2 = r.w.__t.TABS.map(x => x.id);
  if (ids2.indexOf('web') !== ids2.indexOf('tutors') + 1) bad.push('a reload lost the order: ' + ids2.join(' '));
  return bad;
});

check('layout (730): a column between two — Move to a new column here, on the right, from a Kids settings card makes an unnamed column between Kids and Parent settings holding it; another Kids settings card moved ▶ lands in it; a reload keeps both', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-newcol']) return ['no lay-newcol handler — NOT checked'];
  await layPaintAll_(w);
  const cid = laySeen_(w, 'account').find(x => d.querySelector(`#s-account .card-admin[data-lay-for="${x}"] [data-do="lay-newcol"][data-d="1"]`) && !/^own:/.test(x));
  if (!cid) return ['Kids settings has no card with Move to a new column here — NOT checked'];
  A['lay-newcol'](d.querySelector(`#s-account .card-admin[data-lay-for="${cid}"] [data-do="lay-newcol"][data-d="1"]`)); await wait(300);
  const L = layLast_(sent) || {}, nc = ((L.custom || [])[0] || {}).id;
  if (!nc) return ['no new column was saved: ' + JSON.stringify(L).slice(0, 300)];
  if (((L.cards || {})[nc] || []).indexOf(cid) === -1) bad.push(cid + ' is not in the new column: ' + JSON.stringify(L.cards));
  const ids = t.TABS.map(x => x.id), at = ids.indexOf(nc);
  if (ids[at - 1] !== 'account' || ids[at + 1] !== 'family') bad.push('the new column is not between Kids and Parent settings: ' + ids.join(' '));
  if ((t.TABS[at] || {}).label === 'Column' || !(t.TABS[at] || {}).label) bad.push('the new column has no word for its tab');
  await layPaintAll_(w); try { w.paint(nc); } catch (e) {}
  await wait(150);
  if (!d.querySelector(`#s-${nc} [data-lay-for="${cid}"]`)) bad.push(cid + ' is not drawn on the new column');
  const fid = laySeen_(w, 'account').find(x => x !== cid && d.querySelector(`#s-account .card-admin[data-lay-for="${x}"] [data-do="lay-c-col"][data-d="1"]`));
  if (!fid) bad.push('Kids settings has no second card to move ▶ — that half NOT checked');
  else {
    A['lay-c-col'](d.querySelector(`#s-account .card-admin[data-lay-for="${fid}"] [data-do="lay-c-col"][data-d="1"]`)); await wait(300);
    const L2 = layLast_(sent) || {};
    if (((L2.cards || {})[nc] || []).indexOf(fid) === -1) bad.push(fid + ' moved ▶ did not land in the new column: ' + JSON.stringify(L2.cards));
  }
  const p = payload(); p.layout = layLast_(sent);
  const r = layBoot_({ payload: p }); await wait(300);
  const ids2 = r.w.__t.TABS.map(x => x.id), at2 = ids2.indexOf(nc);
  if (ids2[at2 - 1] !== 'account' || ids2[at2 + 1] !== 'family') bad.push('a reload lost the column\'s place: ' + ids2.join(' '));
  return bad;
});

check('layout (730): Spotlight and a Reels widget move like any unit (790: the games are Find cards) — the window is one unit with ▲ ▼ ◀ ▶, and Videos ▶ leaves Reels for the next column and is drawn there', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  t.go('spotlight', false, true); await wait(200); try { w.paint('spotlight'); } catch (e) {}
  const row = d.querySelector('#s-spotlight .card-admin[data-lay-for="spot:list"]');
  if (!row) bad.push('Spotlight has no admin row');
  else ['Move to next column', 'Move this column right'].forEach(l => { if (!row.querySelector(`[aria-label="${l}"]`)) bad.push('Spotlight has no ' + l); });
  t.go('reel', false, true); await wait(300);
  const bt = d.querySelector('#s-reel #wgt-videos')?.closest('.card')?.querySelector('.wgt-admin [data-do="lay-w-col"][data-d="1"]');
  if (!bt || bt.disabled) bad.push('Videos has no live ▶');
  else {
    A['lay-w-col'](bt); await wait(300);
    const L = layLast_(sent) || {}, to = Object.keys(L.widgets || {}).find(c => (L.widgets[c] || []).indexOf('videos') !== -1);
    if (!to || to === 'reel') bad.push('Videos did not leave Reels: ' + JSON.stringify(L.widgets));
    else { try { w.paint(to); } catch (e) {} await wait(150); if (!d.querySelector(`#s-${to} #wgt-videos`)) bad.push('Videos is not drawn on ' + to); }
  }
  return bad;
});

check('stability (730): Web settings carries the Stability card for an admin — its score, verdict and top three from data/stability.json, Show every signal opens the rest; a student has no such card', async () => {
  const J = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'stability.json'), 'utf8'));
  /* THE FILE AS GITHUB PAGES SERVES IT: the card asks `fetch` once, the first time it is drawn. */
  const stub = w0 => { const was = w0.fetch; w0.fetch = (u, o) => /data\/stability\.json/.test(String(u)) ? Promise.resolve({ ok: true, json: () => Promise.resolve(J) }) : (was ? was.call(w0, u, o) : Promise.reject(new Error('no fetch'))); };
  const { w } = layBoot_({ before: w0 => { signedInAs_(LAY_ADMIN_)(w0); stub(w0); } });
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  try { w.paint('site'); } catch (e) { return ['could not draw Web settings: ' + e.message]; }
  await wait(300);
  try { w.paint('site'); } catch (e) {}
  await wait(150);
  const c = d.querySelector('#s-site .stability-card');
  if (!c) return ['Web settings has no Stability card'];
  if ((c.querySelector('.stab-score')?.textContent || '') !== J.score + '%') bad.push('the score says ' + c.querySelector('.stab-score')?.textContent + ', the file ' + J.score);
  const n = J.signals.filter(x => x.off > 0).length;
  if (c.querySelectorAll('.stab-top li').length !== Math.min(3, n)) bad.push('not the top three: ' + c.querySelectorAll('.stab-top li').length);
  const all = c.querySelector('[data-do="stab-all"]');
  if (n > 3) {
    if (!all) bad.push('no Show every signal tile');
    else { A['stab-all'](all); await wait(150); const c2 = d.querySelector('#s-site .stability-card'); if (c2.querySelectorAll('.stab-top li').length !== n) bad.push('Show every signal shows ' + c2.querySelectorAll('.stab-top li').length + ' of ' + n); }
  }
  if (w.cardHome0_('site:stability') !== 'site') bad.push('site:stability is not a Web settings card');
  const s = boot({ before: signedInAs_({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'], handle: 'sam' }) });
  await wait(300);
  if (s.w.document.querySelector('.stability-card')) bad.push('a student is drawn the Stability card');
  return bad;
});

check('layout (730): pager names for moved units — a Reels widget moved onto Kids settings is named by the pager there, and a card moved onto Spotlight by its title (Brownie points)', async () => {
  const { w } = layBoot_();
  await wait(300);
  const t = w.__t, bad = [];
  if (typeof w.pageName_ !== 'function' || !t.PAGER) return ['no pageName_ or PAGER — NOT checked'];
  const tool = layIds_(t, 'reel').find(x => { const o = w.layoutWidgetOf_(x); return o && !o.admin && !o.tutor && !o.signedIn && x !== 'reels'; });
  const name = (w.layoutWidgetOf_(tool) || {}).name;
  const D = w.layoutDraftOf_(null);
  Object.keys(D.widgets).forEach(c => { D.widgets[c] = D.widgets[c].filter(x => x !== tool); });
  D.widgets.account = [tool];
  D.cards = { spotlight: ['acct:brownie'] };
  w.layoutSave_(D);
  await wait(300);
  const names = t.PAGER.account();
  if (!Array.isArray(names) || names.indexOf(name) === -1) bad.push('Kids settings\' pager does not name ' + name + ': ' + JSON.stringify(names).slice(0, 300));
  const tn = t.PAGER.spotlight();
  if (!Array.isArray(tn) || tn.indexOf('Brownie points') === -1) bad.push('Spotlight\'s pager does not name the moved Brownie points card: ' + JSON.stringify(tn).slice(0, 300));
  if (Array.isArray(tn) && tn.some(x => x === '')) bad.push('a page on Spotlight is unnamed');
  return bad;
});

check('layout engine (466): every card deletes — a paper series (past papers, Religious Studies) on its own and the Sessions card; one Start here per card or person, a house not a flag; an admin\'s delete is gone for another account on reload', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  /* TWO SERIES AND A SESSIONS CARD WITH SOMETHING IN IT, as a learner with work would have. */
  const was = w.progressCards_;
  w.progressCards_ = () => was().filter(c => !/prog-series|is-empty"><h3>Papers|prog-sessions|is-empty"><h3>Sessions/.test(c))
    .concat([w.progressSeriesCard_({ name: 'past papers', papers: [], untouched: 3 }), w.progressSeriesCard_({ name: 'Religious Studies', papers: [], untouched: 2 }),
      w.progressSessionsCard_({ ahead: [{ d: new w.Date(), j: { title: 'Maths' } }], past: [] })]);
  await layPaintAll_(w);
  const s0 = laySeen_(w, 'account');
  ['prog:series:past-papers', 'prog:series:religious-studies', 'acct:prog-sessions'].forEach(id => {
    if (s0.indexOf(id) === -1) bad.push(id + ' is not a card on Student settings: ' + s0.join());
    else if (!layCardTile_(d, id, 'lay-c-del')) bad.push(id + ' has no Delete');
  });
  for (const id of ['prog:series:religious-studies', 'acct:prog-sessions']) {
    const x = layCardTile_(d, id, 'lay-c-del');
    if (!x) continue;
    A['lay-c-del'](x); await wait(450); A['lay-c-del'](x); await wait(250); await layPaintAll_(w);
  }
  const s1 = laySeen_(w, 'account');
  if (s1.indexOf('prog:series:religious-studies') !== -1 || s1.indexOf('acct:prog-sessions') !== -1) bad.push('Religious Studies or Sessions was not deleted: ' + s1.join());
  if (s1.indexOf('prog:series:past-papers') === -1) bad.push('deleting Religious Studies took past papers with it');
  if (d.querySelector('#s-account .prog-sessions')) bad.push('the Sessions card is still drawn');
  /* ONE START HERE A CARD, a house. */
  [...d.querySelectorAll('#screen > .screen > .page')].forEach(pg => {
    const n = pg.querySelectorAll('[data-do="lay-start"]').length;
    if (n > 1) bad.push(pg.parentNode.id + ' has a page with ' + n + ' Start here tiles');
  });
  const st = d.querySelectorAll('[data-do="lay-start"]');
  if (!st.length) bad.push('no Start here at all');
  [...st].forEach(x => { if (/M4 15\.5v-13/.test(x.innerHTML)) bad.push('Start here is still a flag'); if (!/^Start here/.test(x.getAttribute('aria-label') || '')) bad.push('a Start here reads ' + x.getAttribute('aria-label')); });
  if (d.querySelector('[data-do="lay-start"][data-lc="first-person"]')) bad.push('"the first person" is still a second Start here');
  /* COMPACT: the admin row's tiles are icons, each at least 44px by the stylesheet's rule. */
  /* SITE-WIDE: an admin's delete is gone for a client on reload. */
  const kill = layCardTile_(d, 'acct:voice', 'lay-c-del') || layCardTile_(d, 'acct:notify', 'lay-c-del');
  const kid = kill && kill.dataset.lc;
  if (kill) { A['lay-c-del'](kill); await wait(450); A['lay-c-del'](kill); await wait(250); }
  const CL = { name: 'Cleo Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'cleo' };
  const base = boot({ before: signedInAs_(CL) }); await wait(300); await layPaintAll_(base.w);
  const p = payload(); p.layout = layLast_(sent);
  const c = boot({ payload: p, before: signedInAs_(CL) }); await wait(300); await layPaintAll_(c.w);
  const sel = kid === 'acct:voice' ? '.voice-card' : '.notify-card';
  if (!base.w.document.querySelector('#s-account ' + sel)) bad.push('a client has no ' + kid + ' to begin with (fixture) — NOT checked');
  else if (c.w.document.querySelector(sel)) bad.push('a client still sees ' + kid + ' the admin deleted');
  if (c.w.document.querySelector('[data-do="lay-start"], .card-admin')) bad.push('a client sees admin tiles');
  return bad;
});

/* ---------- GOOGLE TASKS (475): connect → sync makes each task once, a re-sync updates, Disconnect forgets; no client id says so ---------- */
const GT_U_ = { name: 'Gia Tasks', personId: 'P-GT', role: 'student', roles: ['student'], rank: 'student', token: 't-gt', handle: 'giatasks' };
function gtWorld_(withId) {
  const T = { lists: [], tasks: [], calls: [], revoked: [], scripts: 0 };
  const p = payload();
  if (withId) p.googleClientId = 'cid-gtasks.apps.googleusercontent.com'; else delete p.googleClientId;
  p.brand = Object.assign({}, p.brand || {}); delete p.brand.google_client_id;
  const gj = [{ id: 'J-GT', jobId: 'J-GT', type: 'job', kind: '', status: 'confirmed', subject: 'Maths', level: 'GCSE',
    tutor: 'GeorgePovey', client: GT_U_.name, day: 'Mon', time: '16:00', dates: '', slots: [], tutorSlots: [], events: [] }];
  p.jobs = (p.jobs || []).concat(gj); if (p.liveJobs) p.liveJobs = p.liveJobs.concat(gj);
  const before = w => {
    signedInAs_(GT_U_)(w);
    w.google = { accounts: { id: { initialize() {}, renderButton() {} }, oauth2: {
      initTokenClient: c => (T.scope = c.scope, T.cid = c.client_id, { requestAccessToken: () => setTimeout(() => c.callback({ access_token: 'tok-gt', expires_in: 3600 }), 0) }),
      revoke: (t, cb) => { T.revoked.push(t); if (cb) cb(); } } } };
    const orig = w.fetch;
    w.fetch = (url, o) => {
      const u = String(url);
      if (u.indexOf('https://tasks.googleapis.com/tasks/v1') !== 0) return orig(url, o);
      const m = (o && o.method) || 'GET', b = o && o.body ? JSON.parse(o.body) : null, path = u.slice('https://tasks.googleapis.com/tasks/v1'.length);
      T.calls.push(m + ' ' + path + ' ' + ((o && o.headers && o.headers.Authorization) || ''));
      let out = {};
      if (/^\/users\/@me\/lists/.test(path)) {
        if (m === 'POST') { out = { id: 'L' + (T.lists.length + 1), title: b.title }; T.lists.push(out); } else out = { items: T.lists.slice() };
      } else if (m === 'GET') out = { items: T.tasks.map(t => Object.assign({}, t)) };
      else if (m === 'POST') { out = Object.assign({ id: 'T' + (T.tasks.length + 1), status: 'needsAction' }, b); T.tasks.push(out); }
      else if (m === 'PATCH') { const id = decodeURIComponent(path.split('/').pop()); const t = T.tasks.find(x => x.id === id); Object.assign(t, b); out = t; }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(out), text: () => Promise.resolve(JSON.stringify(out)) });
    };
  };
  return { T, p, before };
}
check('Google Tasks (475): Connect asks Google for the tasks scope, one sync makes one "@family." list and each task once, a re-sync updates them (a tick in Google kept), Disconnect revokes and forgets; with no client id the card says it is not switched on', async () => {
  const bad = [];
  {
    const { p, before } = gtWorld_(false);
    const m = boot({ payload: p, before }); await wait(300); m.w.paint('account'); await wait(200);
    if (m.w.document.querySelector('#s-account .gtasks-card')) bad.push('Google Tasks is still in Student settings (491: one home, the Docket)');
    m.w.__t.findGroup('Tools'); await wait(200); m.w.paintDocket(); const c = m.w.document.querySelector('#docket-gtasks .gtasks-card');
    if (!c) bad.push('no Google Tasks block under the Docket');
    else {
      if (!/not switched on/i.test(c.textContent)) bad.push('no client id did not say it is not switched on: ' + c.textContent);
      if (c.querySelector('[data-do="gtasks-connect"]')) bad.push('a Connect tile with no client id');
      if (/google_client_id/.test(c.textContent)) bad.push('a student was shown the admin\'s how-to');
    }
  }
  const { T, p, before } = gtWorld_(true);
  const m = boot({ payload: p, before }); await wait(300); m.w.__t.findGroup('Tools'); await wait(200); m.w.paintDocket(); await wait(200);
  const d = m.w.document, card = () => d.querySelector('#docket-gtasks .gtasks-card');
  const tap = act => { const el = d.querySelector('#docket-gtasks [data-do="' + act + '"]'); if (!el) { bad.push('no ' + act + ' tile'); return false; } el.click(); return true; };
  const settle = async ms => { await wait(ms); m.w.paintDocket(); await wait(100); };
  if (!card()) return bad.concat('no Google Tasks block with a client id');
  if (!tap('gtasks-connect')) return bad;
  await settle(300);
  if (T.scope !== 'https://www.googleapis.com/auth/tasks' || !/^cid-gtasks/.test(T.cid || '')) bad.push('Connect did not ask for the tasks scope with the site\'s client id: ' + T.scope);
  if (T.lists.length !== 1 || T.lists[0].title !== '@family.') bad.push('the list was not made once as "@family.": ' + JSON.stringify(T.lists));
  const n1 = T.tasks.length;
  if (n1 < 4) bad.push('a weekly Monday session made ' + n1 + ' tasks over four weeks');
  if (T.calls.some(c => !/Bearer tok-gt$/.test(c))) bad.push('a call went without the token');
  if (T.tasks.some(t => !/\[family:(job|exam):[^\]]+\]/.test(t.notes || "") || !/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(t.due))) bad.push('a task has no marker or due date: ' + JSON.stringify(T.tasks));
  if (!/Synced/.test(card().textContent)) bad.push('no last-synced line: ' + card().textContent);
  if (m.sent.some(x => JSON.stringify(x).indexOf('tok-gt') !== -1)) bad.push('the Google token was sent to our backend');
  T.tasks[0].status = 'completed';
  tap('gtasks-sync'); await settle(300);
  if (T.tasks.length !== n1) bad.push('a re-sync duplicated: ' + n1 + ' → ' + T.tasks.length);
  if (T.lists.length !== 1) bad.push('a re-sync made a second list');
  if (!T.calls.some(c => /^PATCH /.test(c))) bad.push('a re-sync did not update');
  if (T.tasks[0].status !== 'completed') bad.push('a re-sync undid a tick made in Google');
  if (!/ticked off in Google/.test(card().textContent)) bad.push('the tick in Google is not counted: ' + card().textContent);
  tap('gtasks-off'); await settle(100);
  if (T.revoked[0] !== 'tok-gt') bad.push('Disconnect did not revoke the token');
  if (!card() || !card().querySelector('[data-do="gtasks-connect"]')) bad.push('after Disconnect the card does not offer Connect');
  let left = '';
  try { left = m.w.sessionStorage.getItem('gtasksTok') || ''; } catch (e) {}
  if (left) bad.push('the token outlived Disconnect in sessionStorage');
  return bad;
});

/* ---------- SPOTIFY (510): no client id says so; Connect builds a PKCE address; the way back swaps the code and shows now playing; Premium said; Disconnect forgets ---------- */
const SP_U_ = { name: 'Sid Spot', personId: 'P-SP', role: 'student', roles: ['student'], rank: 'student', token: 't-sp', handle: 'sidspot' };
function spWorld_(o) {
  o = o || {};
  const T = { gone: [], token: [], api: [] };
  const p = payload();
  p.brand = Object.assign({}, p.brand || {});
  if (o.cid) p.brand.spotify_client_id = 'sp-cid-test'; else delete p.brand.spotify_client_id;
  const before = w => {
    signedInAs_(SP_U_)(w);
    const wc = require('crypto').webcrypto;
    try { if (!w.crypto || !w.crypto.subtle) Object.defineProperty(w, 'crypto', { value: wc, configurable: true }); } catch (e) {}
    if (!w.TextEncoder) w.TextEncoder = TextEncoder;
    if (o.pkce) try { w.sessionStorage.setItem('spPkce', JSON.stringify(o.pkce)); } catch (e) {}
    const orig = w.fetch;
    w.fetch = (url, opt) => {
      const u = String(url), m = (opt && opt.method) || 'GET';
      const ans = (status, body) => Promise.resolve({ ok: status < 300, status, json: () => Promise.resolve(body), text: () => Promise.resolve(JSON.stringify(body)) });
      if (u === 'https://accounts.spotify.com/api/token') { T.token.push(String(opt.body)); return ans(200, { access_token: 'tok-sp', refresh_token: 'ref-sp', expires_in: 3600 }); }
      if (u.indexOf('https://api.spotify.com/v1') !== 0) return orig(url, opt);
      const path = u.slice('https://api.spotify.com/v1'.length);
      T.api.push(m + ' ' + path + ' ' + ((opt && opt.headers && opt.headers.Authorization) || ''));
      if (/^\/me\/player\/currently-playing/.test(path)) return ans(200, { is_playing: true, item: { name: 'Clair de Lune', type: 'track', artists: [{ name: 'Debussy' }], album: { images: [{ url: 'https://i.scdn.co/x.jpg' }] }, external_urls: { spotify: 'https://open.spotify.com/track/1' } } });
      if (/^\/me\/playlists/.test(path)) return ans(200, { items: [{ id: 'PL1', name: 'Revision calm', type: 'playlist', external_urls: { spotify: 'https://open.spotify.com/playlist/PL1' } }] });
      if (/^\/me\/player\//.test(path)) return ans(403, { error: { status: 403, message: 'Player command failed: Premium required', reason: 'PREMIUM_REQUIRED' } });
      return ans(404, {});
    };
  };
  return { T, p, before };
}
check('Spotify (510): no client id says not switched on; Connect builds a PKCE address with the four scopes; the way back swaps the code and shows now playing and playlists; a free account is told Premium; Disconnect forgets', async () => {
  const bad = [];
  const card = d => d.querySelector('#sp-box .sp-card');
  {
    const { p, before } = spWorld_({});
    const m = boot({ payload: p, before }); await wait(300); m.w.__t.findGroup('Tools'); await wait(200); m.w.initSpotify();
    const c = card(m.w.document);
    if (!c) bad.push('no Spotify widget on Tools');
    else {
      if (!/not switched on/i.test(c.textContent)) bad.push('no client id did not say it is not switched on: ' + c.textContent);
      if (c.querySelector('[data-do="sp-connect"]')) bad.push('a Connect tile with no client id');
      if (/spotify_client_id/.test(c.textContent)) bad.push('a student was shown the admin\'s how-to');
    }
  }
  {
    const { p, before } = spWorld_({ cid: true });
    const m = boot({ payload: p, before }); await wait(300); m.w.__t.findGroup('Tools'); await wait(200); m.w.initSpotify();
    let went = '';
    m.w.spGo_ = u => { went = u; };
    const t = m.w.document.querySelector('#sp-box [data-do="sp-connect"]');
    if (!t) bad.push('no Connect tile with a client id'); else { t.click(); await wait(200); }
    const q = went ? new URL(went).searchParams : null;
    if (!q || !/^https:\/\/accounts\.spotify\.com\/authorize\?/.test(went)) bad.push('Connect did not go to Spotify: ' + went);
    else {
      if (q.get('client_id') !== 'sp-cid-test' || q.get('response_type') !== 'code' || q.get('code_challenge_method') !== 'S256') bad.push('wrong PKCE address: ' + went);
      if (q.get('scope') !== 'user-read-currently-playing user-read-playback-state user-modify-playback-state playlist-read-private') bad.push('wrong scopes: ' + q.get('scope'));
      if (q.get('redirect_uri') !== 'https://example.org/?spotify=cb') bad.push('wrong redirect: ' + q.get('redirect_uri'));
      let pk = null; try { pk = JSON.parse(m.w.sessionStorage.getItem('spPkce')); } catch (e) {}
      const want = pk && require('crypto').createHash('sha256').update(pk.v).digest('base64url');
      if (!pk || q.get('code_challenge') !== want) bad.push('the challenge is not the SHA-256 of the kept verifier');
      if (!pk || q.get('state') !== pk.state) bad.push('the state was not kept');
    }
  }
  const pkce = { v: 'verifier-test', state: 'st-1', cid: 'sp-cid-test', back: 'https://example.org/?spotify=cb' };
  const { T, p, before } = spWorld_({ cid: true, pkce });
  const m = boot({ payload: p, before, url: 'https://example.org/?spotify=cb&code=CODE1&state=st-1' }); await wait(400);
  m.w.__t.findGroup('Tools'); await wait(300); m.w.spPaint_();
  const d = m.w.document;
  if (/spotify=cb|code=/.test(m.w.location.href)) bad.push('the address still carries the code: ' + m.w.location.href);
  const tb = T.token[0] ? new URLSearchParams(T.token[0]) : null;
  if (!tb || tb.get('grant_type') !== 'authorization_code' || tb.get('code') !== 'CODE1' || tb.get('code_verifier') !== 'verifier-test' || tb.get('client_secret')) bad.push('the code swap was wrong: ' + T.token[0]);
  const c = card(d);
  if (!c || !/Clair de Lune/.test(c.textContent) || !/Debussy/.test(c.textContent)) bad.push('now playing not shown: ' + (c && c.textContent));
  if (!c || !/Revision calm/.test(c.textContent) || !c.querySelector('a[href="https://open.spotify.com/playlist/PL1"]')) bad.push('the playlist line with Open in Spotify is missing');
  if (T.api.some(x => !/Bearer tok-sp$/.test(x))) bad.push('a call went without the token');
  if (m.sent.some(x => JSON.stringify(x).indexOf('tok-sp') !== -1 || JSON.stringify(x).indexOf('ref-sp') !== -1)) bad.push('a Spotify token was sent to our backend');
  const pause = d.querySelector('#sp-box [data-do="sp-ctl"][data-c="pause"]');
  if (!pause) bad.push('no Pause tile while playing'); else { pause.click(); await wait(200); }
  if (!/Premium/.test((card(d) || {}).textContent || '')) bad.push('a 403 PREMIUM_REQUIRED was not said');
  const off = d.querySelector('#sp-box [data-do="sp-off"]');
  if (!off) bad.push('no Disconnect tile'); else { off.click(); await wait(100); }
  if (!d.querySelector('#sp-box [data-do="sp-connect"]')) bad.push('after Disconnect the card does not offer Connect');
  let left = '';
  try { left = (m.w.sessionStorage.getItem('spTok') || '') + (m.w.localStorage.getItem('spRefresh') || ''); } catch (e) {}
  if (left) bad.push('a token outlived Disconnect');
  return bad;
});

/* ---------- PHONE NOTIFICATIONS (492): Turn on asks, subscribes and stores the token; Turn off deletes it; an iPhone outside the home screen is told how ---------- */
const PU_U_ = { name: 'Pia Push', personId: 'P-PU', role: 'student', roles: ['student'], rank: 'student', token: 't-pu', handle: 'piapush' };
const PU_CFG_ = { apiKey: 'AIza-test', projectId: 'fam-test', messagingSenderId: '123', appId: '1:123:web:abc', vapidKey: 'BPub-test' };
function puWorld_(o) {
  o = o || {};
  const T = { asked: 0, tokens: [], deleted: 0, off: [] };
  const p = payload();
  p.brand = Object.assign({}, p.brand || {});
  if (o.cfg !== false) p.brand.fcm_web_config = JSON.stringify(PU_CFG_); else delete p.brand.fcm_web_config;
  const state = () => ({ success: true, ready: o.ready !== false, devices: T.tokens.length, off: T.off.slice(),
    kinds: [{ kind: 'messages', label: 'Messages' }, { kind: 'bookings', label: 'Booking requests and answers' }, { kind: 'posts', label: 'Replies to your posts' }] });
  const reply = b => {
    if (b.action === 'pushState') return state();
    if (b.action === 'pushSubscribe') { T.tokens.push(b.fcmToken); return state(); }
    if (b.action === 'pushUnsubscribe') { T.tokens = T.tokens.filter(t => t !== b.fcmToken); return state(); }
    if (b.action === 'pushSet') { T.off = T.off.filter(k => k !== b.kind); if (!b.on) T.off.push(b.kind); return state(); }
    return undefined;
  };
  const before = w => {
    signedInAs_(PU_U_)(w);
    if (o.iphone) Object.defineProperty(w.navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1', configurable: true });
    if (o.standalone) Object.defineProperty(w.navigator, 'standalone', { value: true, configurable: true });
    w.Notification = { permission: 'default', requestPermission: () => { T.asked++; return Promise.resolve('granted'); } };
    w.PushManager = function () {};
    const reg = { scope: 'https://example.org/' };
    Object.defineProperty(w.navigator, 'serviceWorker', { configurable: true, value: {
      getRegistration: () => Promise.resolve(reg), register: () => Promise.resolve(reg), addEventListener() {} } });
    /* FIREBASE ARRIVES WHEN ITS SCRIPT IS ADDED — and only then, so a page that loads it early is caught. */
    const add = w.Node.prototype.appendChild;
    w.Node.prototype.appendChild = function (el) {
      if (el && el.tagName === 'SCRIPT' && /gstatic\.com\/firebasejs\/\d+\.\d+\.\d+\//.test(el.src || '')) {
        T.scripts = (T.scripts || 0) + 1;
        w.firebase = w.firebase || { apps: [], initializeApp(c) { T.cfg = c; this.apps.push(c); },
          messaging: () => ({ getToken: x => { T.vapid = x.vapidKey; T.reg = x.serviceWorkerRegistration; return Promise.resolve('fcm-tok-1'); },
                              deleteToken: () => { T.deleted++; return Promise.resolve(true); } }) };
        setTimeout(() => el.onload && el.onload(), 0);
        return el;
      }
      return add.call(this, el);
    };
  };
  return { T, p, before, reply };
}
check('the Rewrite coach (519): an admin lists the facts with the AI off; recall shows ONE fact at a time, "1 of N", with a specific cue; Next and Back keep what was typed; the summary checks; "done" is not enough to judge own wording; with the AI a verdict without its real quote falls to missing; Try again steps only through the facts still out', async () => {
  const bad = [];
  const admin = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 't' };
  const TEXT = 'Photosynthesis is the process by which green plants use sunlight to make glucose from carbon dioxide and water. '
    + 'It happens in the chloroplasts, which contain a green pigment called chlorophyll that absorbs light energy. Oxygen is released as a by-product.';
  const GOOD = 'Using sunlight, plants build glucose out of water and carbon dioxide; that is photosynthesis.';
  const open = async (ai, reply) => {
    const p = payload(); p.aiMarking = ai;
    const m = boot({ payload: p, reply: reply, before: win => { try { win.localStorage.setItem('familyUser', JSON.stringify(admin)); } catch (e) {} } });
    await wait(300); m.w.__t.findGroup('Tools', 'rewrite'); await wait(200); m.w.initRewrite_(); await wait(50);   /* its own Find card (790) */
    return m;
  };
  const box = m => m.w.document.querySelector('#rw-box');
  const tap = async (m, act) => { const el = box(m) && box(m).querySelector('[data-do="' + act + '"]'); if (!el) { bad.push('no ' + act + ' tile: ' + (box(m) || {}).textContent); return false; } el.click(); await wait(80); return true; };
  const type = async (m, sel, v) => { const el = box(m).querySelector(sel); if (!el) { bad.push('no box ' + sel + ': ' + box(m).textContent.slice(0, 200)); return; } el.value = v; el.dispatchEvent(new m.w.Event('input', { bubbles: true })); await wait(30); };
  const boxes = m => [...box(m).querySelectorAll('[data-rw="mine"]')];
  const stepOf = m => ((box(m).querySelector('.rw-step') || {}).textContent || '').trim();
  /* NEXT UNTIL THE SUMMARY, at most 20 taps. */
  const toEnd = async m => { for (let k = 0; k < 20 && box(m).querySelector('[data-do="rw-next"]'); k++) await tap(m, 'rw-next'); };
  {
    const m = await open(false);
    if (!box(m)) return ['an admin\'s Tools has no Rewrite coach, so nothing was asked'];
    await type(m, '[data-rw="src"]', TEXT);
    await tap(m, 'rw-ideas');
    const n = box(m).querySelectorAll('.rw-facts li').length;
    if (n < 3) bad.push('with the AI off the facts were not listed: ' + box(m).textContent.slice(0, 200));
    if (!box(m).querySelector('.rw-term')) bad.push('no protected term was shown with the AI off');
    await tap(m, 'rw-recall');
    if (box(m).querySelector('.rw-src-text') || box(m).querySelector('.rw-facts')) bad.push('writing from memory still shows the text or the checklist');
    /* ONE FACT ON SCREEN, with where you are and a specific cue. */
    if (boxes(m).length !== 1 || stepOf(m) !== '1 of ' + n) bad.push('recall showed ' + boxes(m).length + ' boxes at "' + stepOf(m) + '", wanted one at "1 of ' + n + '"');
    const cue = boxes(m).length ? boxes(m)[0].closest('label').textContent : '';
    if (!/^(?:What|When|Where|How many|Who)\b|___/.test(cue.trim()) || /What did the text say about/.test(cue)) bad.push('the cue is not a specific question: ' + cue);
    const back = box(m).querySelector('[data-do="rw-back"]');
    if (!back || !back.disabled) bad.push('Back was missing or live on the first fact');
    if (box(m).querySelector('[data-do="rw-check"]')) bad.push('Check was offered before the last step');
    await tap(m, 'rw-peek');
    if (!box(m).querySelector('.rw-src-text')) bad.push('Peek did not show the text');
    await tap(m, 'rw-hide');
    if (!/1 so far/.test(box(m).innerHTML) || box(m).querySelector('.rw-src-text')) bad.push('Hide again did not hide, or the peek was not counted');
    /* "done" EVERYWHERE IS NOT ENOUGH TO JUDGE OWN WORDING. */
    await type(m, '[data-rw="mine"][data-i="0"]', 'done');
    await tap(m, 'rw-next');
    if (stepOf(m) !== '2 of ' + n || !box(m).querySelector('[data-rw="mine"][data-i="1"]')) bad.push('Next did not show fact 2 alone: "' + stepOf(m) + '"');
    await tap(m, 'rw-back');
    const kept = box(m).querySelector('[data-rw="mine"][data-i="0"]');
    if (stepOf(m) !== '1 of ' + n || !kept || kept.value !== 'done') bad.push('Back did not bring fact 1 back with what was typed: ' + (kept && kept.value));
    await toEnd(m);
    if (boxes(m).length || box(m).querySelectorAll('.rw-sum li').length !== n) bad.push('the last step is not a summary of the ' + n + ' facts: ' + box(m).textContent.slice(0, 300));
    if (!/1 of \d+ facts answered|0 of \d+ facts answered/.test(box(m).textContent)) bad.push('the summary does not say how many facts were answered');
    await tap(m, 'rw-check');
    if (!/Own wording not enough written yet/.test(box(m).textContent) || /Own wording \d+%/.test(box(m).textContent)) bad.push('"done" was judged for own wording: ' + box(m).textContent.slice(-300));
    /* TRY AGAIN STEPS THROUGH THE FACTS STILL OUT, the scanner following the typing. */
    await tap(m, 'rw-retry');
    if (boxes(m).length !== 1) bad.push('Try again showed ' + boxes(m).length + ' boxes at once');
    const before = box(m).querySelector('[data-rw-scan="0"]').textContent;
    await type(m, '[data-rw="mine"][data-i="0"]', GOOD);
    const after = box(m).querySelector('[data-rw-scan="0"]').textContent;
    if (before === after || !/Substance [5-9]\d%|Substance 100%/.test(after)) bad.push('the scanner did not follow the typing: ' + before + ' → ' + after);
    await toEnd(m);
    await tap(m, 'rw-check');
    if (!/Facts kept 1\/\d+/.test(box(m).textContent) || !/Own wording 100%/.test(box(m).textContent)) bad.push('no score line after Check: ' + box(m).textContent.slice(-300));
    if (!box(m).querySelector('[data-do="rw-retry"]')) bad.push('no Try again with facts still out');
  }
  {
    let asked = null;
    const m = await open(true, body => {
      if (body.action !== 'rewriteCheck') return undefined;
      asked = body;
      return { success: true, facts: body.items.map((it, k) => (k === 0 ? { verdict: 'yes', quote: 'plants build glucose' } : { verdict: 'yes', quote: 'words they never wrote' })), note: 'Link the steps.' };
    });
    await type(m, '[data-rw="src"]', TEXT);
    await tap(m, 'rw-ideas'); await tap(m, 'rw-recall');
    const n = Number((stepOf(m).match(/of (\d+)/) || [])[1]) || 0;
    await type(m, '[data-rw="mine"][data-i="0"]', 'Using sunlight, plants build glucose out of water and carbon dioxide.');
    await tap(m, 'rw-next');
    await type(m, '[data-rw="mine"][data-i="1"]', 'Somewhere in the leaf.');
    await toEnd(m);
    await tap(m, 'rw-check'); await wait(150);
    if (!asked || asked.items.length !== n || asked.items[1].mine !== 'Somewhere in the leaf.') bad.push('the check did not send one answer per fact: ' + JSON.stringify(asked).slice(0, 200));
    if (!new RegExp('Facts kept 1/' + n).test(box(m).textContent)) bad.push('a verdict without its real quote was kept: ' + box(m).textContent.slice(-300));
    await tap(m, 'rw-retry');
    if (stepOf(m) !== '1 of ' + (n - 1) || !box(m).querySelector('[data-rw="mine"][data-i="1"]')) bad.push('Try again began at "' + stepOf(m) + '", wanted fact 2 at "1 of ' + (n - 1) + '"');
    await type(m, '[data-rw="mine"][data-i="1"]', 'Chlorophyll in the chloroplasts soaks up the light.');
    await toEnd(m);
    if (box(m).querySelectorAll('.rw-sum li').length !== n - 1) bad.push('the Try again summary did not list only the ' + (n - 1) + ' facts still out');
    asked = null; await tap(m, 'rw-check'); await wait(150);
    if (!asked || asked.items.length !== n - 1 || asked.items.some(it => /plants build glucose/.test(it.mine))) bad.push('Try again re-asked a kept fact: ' + JSON.stringify(asked).slice(0, 200));
  }
  return bad;
});
check('phone notifications (492): Student settings has a Notifications card; Turn on asks permission, lazy-loads Firebase, subscribes with the VAPID key on our own worker and stores the token; a kind can be turned off; Turn off deletes it; an iPhone in Safari is told to Add to Home Screen; no config says not switched on', async () => {
  const bad = [];
  const open = async o => { const W = puWorld_(o); const m = boot({ payload: W.p, before: W.before, reply: W.reply }); await wait(300); m.w.paint('account'); await wait(200); m.w.paint('account'); await wait(100); return Object.assign(W, { m }); };
  const card = m => m.w.document.querySelector('#s-account .push-card');
  {
    const { m } = await open({ cfg: false });
    const c = card(m);
    if (!c) bad.push('no Notifications card in Student settings');
    else if (!/not switched on/i.test(c.textContent) || c.querySelector('[data-do="push-on"]')) bad.push('with no config the card did not say not switched on: ' + c.textContent);
  }
  {
    const { m, T } = await open({ iphone: true });
    const c = card(m);
    if (!c || !/Add to Home Screen/.test(c.textContent)) bad.push('an iPhone in Safari was not told to Add to Home Screen: ' + (c && c.textContent));
    if (c && c.querySelector('[data-do="push-on"]')) bad.push('an iPhone in Safari was offered Turn on');
    if (T.scripts) bad.push('Firebase loaded before anything was tapped');
  }
  const { m, T } = await open({ iphone: true, standalone: true });
  const d = m.w.document;
  const tap = act => { const el = d.querySelector('#s-account [data-do="' + act + '"]'); if (!el) { bad.push('no ' + act + ' tile: ' + (card(m) || {}).textContent); return false; } el.click(); return true; };
  const settle = async ms => { await wait(ms); m.w.paint('account'); await wait(100); };
  if (T.scripts) bad.push('Firebase loaded before Turn on was tapped');
  if (!tap('push-on')) return bad;
  await settle(400);
  if (T.asked !== 1) bad.push('Turn on asked for permission ' + T.asked + ' times');
  if (T.vapid !== 'BPub-test' || !T.reg) bad.push('the token was not asked for with the VAPID key on our own worker');
  if (T.tokens.join() !== 'fcm-tok-1') bad.push('the token was not stored: ' + JSON.stringify(T.tokens));
  const sub = m.sent.find(x => x.action === 'pushSubscribe');
  if (!sub || sub.personId !== 'P-PU') bad.push('pushSubscribe did not carry the person');
  const box = d.querySelector('#s-account [data-push-kind="messages"]');
  if (!box) bad.push('no Messages row once on: ' + (card(m) || {}).textContent);
  else {
    box.checked = false; box.dispatchEvent(new m.w.Event('change', { bubbles: true }));
    await settle(200);
    if (T.off.join() !== 'messages') bad.push('unticking Messages did not turn it off: ' + T.off);
    const again = d.querySelector('#s-account [data-push-kind="messages"]');
    if (!again || again.checked) bad.push('the redrawn row does not show Messages off');
  }
  if (!tap('push-off')) return bad;
  await settle(300);
  if (T.tokens.length) bad.push('Turn off did not delete the token: ' + T.tokens);
  if (!d.querySelector('#s-account [data-do="push-on"]')) bad.push('after Turn off the card does not offer Turn on');
  let left = '';
  try { left = m.w.localStorage.getItem('pushToken') || ''; } catch (e) {}
  if (left) bad.push('the token outlived Turn off on the device');
  return bad;
});

