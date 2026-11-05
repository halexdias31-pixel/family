/* ---------- NOTES FOR CLAUDE BY SUGGEST A CHANGE (484, 494): one Suggest tile on every widget and card; a box in place; Send, Done ---------- */
const cnRow_ = (w, id) => (w.document.querySelector(`#wgt-${id}`)?.closest('.card')?.querySelector('.wgt-foot')) || null;
check('notes for Claude by Suggest a change (494): an admin has one Suggest tile on a widget and on a card and no Note for Claude tile; it opens a box in place, a draft survives Cancel, Send posts the item id and title; no note is listed and there is no Done (498)', async () => {
  const notes = [];
  const { w, sent } = layBoot_({ reply: b => {
    if (b.action === 'suggest') { notes.unshift({ id: 'N-1', at: Date.now(), column: b.kind, itemId: b.kind + '|' + b.itemId, itemLabel: b.label, note: b.note }); return { success: true, serious: true, id: 'N-1', notes: notes.slice() }; }
    if (b.action === 'claudeNoteDone') { notes.splice(0); return { success: true, id: b.id, notes: [] }; }
    return undefined;
  } });
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['rep-box'] || !A['rep-send']) return ['no rep-box / rep-send — NOT checked'];
  if (A['ncl-done']) bad.push('Done is still wired — Claude marks notes done by data/notes-done.json (498)');
  if (A['ncl-open'] || A['ncl-send']) bad.push('the old Note for Claude box is still wired');
  t.findGroup('Tools'); await wait(300);
  const a = layIds_(t, 'tool')[0];
  const row = cnRow_(w, a);
  const tiles = row ? row.querySelectorAll('[data-do="rep-box"]') : [];
  if (tiles.length !== 1) return ['the first tool has ' + tiles.length + ' Suggest tiles in its row — wanted one'];
  const tile = tiles[0];
  if (tile.getAttribute('aria-label') !== 'Suggest a change') bad.push('the tile is called ' + tile.getAttribute('aria-label'));
  if (d.querySelector('[data-do="ncl-open"]')) bad.push('a Note for Claude tile is still drawn');
  await layPaintAll_(w);
  const cardRow = d.querySelector('.card-admin[data-lay-for]');
  if (cardRow && cardRow.querySelectorAll('[data-do="rep-box"]').length > 1) bad.push('a right-hand card’s admin row has two Suggest tiles');
  A['rep-box'](tile); await wait(50);
  const boxOf = () => [...d.querySelectorAll('.rep-box')].find(x => x.dataset.rk === 'widget' && x.dataset.ri === a);
  const box = boxOf();
  if (!box) return bad.concat(['Suggest a change opened no box']);
  const wcard = d.querySelector(`#wgt-${a}`)?.closest('.card');
  if (box.parentElement !== wcard || !wcard.classList.contains('is-writing')) bad.push('the box did not open in place of the widget');
  const ta = box.querySelector('textarea');
  if (!ta || ta.getAttribute('placeholder') !== 'What should change here?') bad.push('the box has no "What should change here?" textarea');
  if (!box.querySelector('[data-do="rep-send"]') || !box.querySelector('[data-do="rep-cancel"]')) bad.push('the box has no Send and Cancel tiles');
  ta.value = 'Make the title bigger'; ta.dispatchEvent(new w.Event('input', { bubbles: true })); await wait(50);
  A['rep-cancel'](box.querySelector('[data-do="rep-cancel"]')); await wait(50);
  if (boxOf()) bad.push('Cancel did not close the box');
  A['rep-box'](tile); await wait(50);
  const box2 = boxOf(), ta2 = box2 && box2.querySelector('textarea');
  if (!ta2 || ta2.value !== 'Make the title bigger') bad.push('the draft did not survive Cancel: ' + (ta2 && ta2.value));
  A['rep-send'](box2.querySelector('[data-do="rep-send"]')); await wait(300);
  const post = sent.filter(x => x.action === 'suggest');
  if (post.length !== 1) bad.push(post.length + ' suggest posts after one Send');
  else if (post[0].itemId !== a || post[0].kind !== 'widget' || !post[0].label || post[0].note !== 'Make the title bigger') bad.push('the suggestion went as ' + JSON.stringify(post[0]));
  if (boxOf()) bad.push('Send did not close the box');
  if (d.querySelector(`#wgt-${a}`)?.closest('.card')?.classList.contains('is-writing')) bad.push('the widget is still hidden after Send');
  const tile2 = cnRow_(w, a)?.querySelector('[data-do="rep-box"]') || tile;
  A['rep-box'](tile2); await wait(50);
  const ta3 = boxOf()?.querySelector('textarea');
  if (ta3 && ta3.value) bad.push('the box opened again with the sent words in it: ' + ta3.value);
  if (boxOf()?.querySelector('.ncl-item, [data-do="ncl-done"]')) bad.push('the box lists notes or a Done tile — the owner: "I don\'t even need to be able to tick or see old tasks"');
  const c = boot({ before: signedInAs_({ name: 'Cal Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'calclient' }) });
  await wait(300);
  c.w.__t.findGroup('Tools'); await wait(200); await layPaintAll_(c.w);
  if (c.w.document.querySelector('[data-do="ncl-open"]')) bad.push('a client has a Note for Claude tile');
  if (!c.w.document.querySelector('#s-stuff [data-do="rep-box"]')) bad.push('a client has no Suggest a change tile on Tools');
  return bad;
});
check('notes for Claude (484), the real backend: claudeNoteAdd keeps a row with the item id and title and rewrites the Drive file "Notes for Claude"; a client is refused; doGet sends open notes to an admin only; Done takes it out of both', async () => {
  const { backend } = require('./check-gas-load.js');
  const files = [];
  const iter = a => { let i = 0; return { hasNext: () => i < a.length, next: () => a[i++] }; };
  const folder = { getFilesByName: n => iter(files.filter(f => f.name === n)), getFoldersByName: () => iter([]),
    createFile: (n, text) => { const f = { name: n, text: text, getId: () => 'F' + files.length, setContent(t) { this.text = t; } }; files.push(f); return f; } };
  const b = backend({ DriveApp: { getFolderById: () => null, getFileById: () => null, getFoldersByName: () => iter([folder]), createFolder: () => folder },
    MimeType: { PLAIN_TEXT: 'text/plain' } });
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'hl2026', email: 'a1@example.org', role: 'admin' }, base),
                    Object.assign({ person_id: 'P-C1', first_name: 'Cal', last_name: 'Client', handle: 'cl2026', email: 'c1@example.org', role: 'client' }, base)]);
  const tk = {};
  ['a1@example.org', 'c1@example.org'].forEach(e => { tk[e] = b.post({ action: 'verifyLogin', email: e, pin: '0000' }); });
  const bad = [];
  if (!tk['a1@example.org'].token) return ['the admin could not sign in — NOT checked'];
  const as = (e, body) => b.post(Object.assign({ token: tk[e].token, personId: tk[e].personId || tk[e].person_id || '' }, body));
  const no = as('c1@example.org', { action: 'claudeNoteAdd', itemId: 'clock', itemLabel: 'Clock', column: 'tools', note: 'x' });
  if (!no.error) bad.push('a client could add a note');
  const r = as('a1@example.org', { action: 'claudeNoteAdd', itemId: 'clock', itemLabel: 'Clock', column: 'tools', note: 'Bigger hands\nand a second line' });
  if (!r.success) return bad.concat(['claudeNoteAdd failed: ' + r.error]);
  const tab = b.tabs.claude_notes, h = tab[0], row = tab[1] || [];
  const cell = k => row[h.indexOf(k)];
  if (tab.length !== 2 || cell('item_id') !== 'clock' || cell('item_label') !== 'Clock' || cell('status') !== 'open' || cell('made_by') !== 'P-A1') bad.push('the row is not right: ' + JSON.stringify(row));
  const f = files.find(x => x.name === 'Notes for Claude');
  if (!f) bad.push('no Drive file called "Notes for Claude"');
  else if (f.text.indexOf('[' + r.id + '] tools › Clock (clock) — ') === -1 || f.text.indexOf('Bigger hands\nand a second line') === -1) bad.push('the Drive file does not say the note: ' + f.text);
  const ga = b.get({ token: tk['a1@example.org'].token }), gc = b.get({ token: tk['c1@example.org'].token });
  if (!Array.isArray(ga.claudeNotes) || ga.claudeNotes.length !== 1 || ga.claudeNotes[0].itemId !== 'clock') bad.push('an admin\'s payload has not the open note: ' + JSON.stringify(ga.claudeNotes));
  if ('claudeNotes' in gc) bad.push('a client\'s payload carries claudeNotes');
  const dn = as('a1@example.org', { action: 'claudeNoteDone', id: r.id });
  if (!dn.success || (dn.notes || []).length) bad.push('Done did not close it: ' + JSON.stringify(dn));
  if (cell('status') !== 'done' || !cell('done_at')) bad.push('the row is not done: ' + JSON.stringify(tab[1]));
  if (files.length !== 1) bad.push(files.length + ' Drive files, not one rewritten');
  else if (files[0].text.indexOf('No open notes') === -1) bad.push('the Drive file still lists a done note: ' + files[0].text);
  const ga2 = b.get({ token: tk['a1@example.org'].token });
  if ((ga2.claudeNotes || []).length) bad.push('the payload still carries a done note');
  return bad;
});

/* ---------- RUN THEM ---------------------------------------------------------------------------- */
/* ---------- THE OWNER'S NOTES, ROUND TWO (489) ---------- */
check('the camera is first on the feed (489, 506): the newest post right under it; a layout with item:feed:festive in deleted is harmless; a v1 layout with the camera deleted gets it back', async () => {
  const p = payload();
  p.posts = [1, 2].map(i => ({ id: 'PO' + i, author: '@family.', handle: '@family.', avatar: '', image: '', media: [], caption: 'Post ' + i, body: '', location: '',
    when: '0' + i + '/09/2026', at: Date.UTC(2026, 8, i), pinned: false, active: true, waiting: false, refused: false, reactions: NO_REACTIONS_(), comments: { total: 0, list: [] } }));
  p.layout = { v: 2, widgets: {}, deleted: ['item:feed:festive'] };
  const { w } = layBoot_({ payload: p });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.go('feed', false, true); await wait(300);
  const pagesOf = () => [...d.querySelectorAll('#s-feed > .page')];
  if (d.querySelector('#s-feed [data-item="item:feed:festive"]')) bad.push('a festive card is drawn');
  const first = pagesOf()[0], second = pagesOf()[1];
  if (!first || !first.querySelector('[data-item="item:feed:camera"]')) bad.push('the camera is not first: ' + (first ? first.textContent.trim().slice(0, 60) : 'no page'));
  if (!second || !second.querySelector('[data-post]')) bad.push('the newest post is not right under the camera');
  if (w.feedCamAt_() !== 0 || w.feedPostsAt_() !== 1) bad.push(`the feed counts camera ${w.feedCamAt_()} and posts from ${w.feedPostsAt_()}, not 0 and 1`);
  /* THE ONE-OFF REPAIR: a v1 layout with the camera deleted and the festive card not. */
  const fixed = w.layoutSane_({ v: 1, widgets: {}, deleted: ['item:feed:camera', 'x1'] });
  if (fixed.deleted.indexOf('item:feed:camera') !== -1 || fixed.deleted.indexOf('item:feed:festive') === -1 || fixed.v !== 2) bad.push('the v1 repair did not move the delete to the festive card: ' + JSON.stringify(fixed));
  const kept = w.layoutSane_({ v: 2, widgets: {}, deleted: ['item:feed:camera'] });
  if (kept.deleted.indexOf('item:feed:camera') === -1) bad.push('a v2 layout\'s camera delete was undone — the repair must run once');
  const { backend } = require('./check-gas-load.js');
  const g = backend();
  const back = g.ev('layoutClean_(' + JSON.stringify({ v: 1, widgets: {}, deleted: ['item:feed:camera'] }) + ')');
  if (!back || back.deleted.indexOf('item:feed:camera') !== -1 || back.deleted.indexOf('item:feed:festive') === -1 || back.v !== 2) bad.push('layoutClean_ does not make the same repair: ' + JSON.stringify(back));
  return bad;
});
check('front door (489): an admin\'s door tile on a widget sets layout.front for everybody, distinct from Start here; a member opening the app lands on that widget; pressed again it clears; layoutClean_ keeps it', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['lay-front']) return ['no lay-front handler — NOT checked'];
  /* A REELS WIDGET (790: a Find card's place is the funnel's, so it has no door). */
  t.go('reel', false, true); await wait(300);
  const ids = layIds_(t, 'reel'), id = ids[1];
  const door = layTile_(d, id, 'lay-front'), home = layTile_(d, id, 'lay-start');
  if (!door) return ['the second Reels widget has no Front door tile'];
  if (!home) bad.push('a widget has no Start here tile');
  if (home && door.innerHTML === home.innerHTML) bad.push('Front door and Start here look the same');
  A['lay-front'](door); await wait(200);
  const L = layLast_(sent);
  if (!L || !L.front || L.front.col !== 'reel' || L.front.id !== id) return bad.concat(['the door saved ' + JSON.stringify(L && L.front)]);
  const { backend } = require('./check-gas-load.js');
  const kept = backend().ev('layoutClean_(' + JSON.stringify(L) + ')');
  if (!kept || !kept.front || kept.front.id !== id) bad.push('layoutClean_ dropped front: ' + JSON.stringify(kept && kept.front));
  /* A MEMBER, the layout in the payload: the app opens on Reels, at that widget. */
  const p = payload(); p.layout = L;
  const m = boot({ payload: p, before: signedInAs_({ name: 'Cal Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'calclient' }) });
  await wait(600);
  if (m.w.__t.AT() !== 'reel') bad.push('a member opened the app on ' + m.w.__t.AT() + ', not the front door\'s Reels');
  else {
    const want = m.w.__t.widgetsOf('reel').map(x => String(x.id)).indexOf(id);
    if ((m.w.__t.PAGE() || {}).reel !== want) bad.push(`Reels opened on page ${(m.w.__t.PAGE() || {}).reel}, not the door's ${want}`);
  }
  t.go('reel', false, true); await wait(200);
  A['lay-front'](layTile_(d, id, 'lay-front')); await wait(200);
  if ((layLast_(sent) || {}).front) bad.push('pressed again, the door did not clear');
  return bad;
});
check('edit words in place (497): an admin\'s Edit words makes a widget\'s title editable; Save posts wordsSave; a client sees the new title, typed markup as text; Reset posts the key back', async () => {
  const { w, sent } = layBoot_({ reply: b => (b.action === 'wordsSave' ? { success: true, words: Object.assign({}, b.set) } : undefined) });
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['words-edit'] || typeof w.wordsIn_ !== 'function') return ['no words-edit handler or wordsIn_ — NOT checked'];
  t.findGroup('Tools'); await wait(300);
  const id = layIds_(t, 'tool').find(x => d.querySelector(`#wgt-${x} h3[data-wk]`));
  if (!id) return ['no tool has a title marked for words — NOT checked'];
  const tile = layTile_(d, id, 'words-edit');
  if (!tile) return ['the tool has no Edit words tile in its admin group'];
  A['words-edit'](tile); await wait(300);   /* a Find card is filled a moment after its paint (790) */
  const h = d.querySelector(`#wgt-${id} h3[data-wk]`), k = h && h.getAttribute('data-wk');
  if (!h || !/^(true|plaintext-only)$/.test(h.getAttribute('contenteditable') || '')) return bad.concat(['the title did not become editable in place']);
  const said = '<img src=x onerror=alert(1)> New title';
  h.textContent = said;
  const save = h.closest('.wk-editing')?.querySelector('[data-do="words-save"]');
  if (!save) return bad.concat(['no Save words under the card being edited']);
  A['words-save'](save); await wait(200);
  const post = sent.filter(x => x.action === 'wordsSave').pop();
  if (!post || !post.set || post.set[k] !== said) return bad.concat(['Save did not post the title: ' + JSON.stringify(post)]);
  const { backend } = require('./check-gas-load.js');
  if (backend().ev('ACTION_ACCESS.wordsSave') !== 'admin') bad.push('ACTION_ACCESS.wordsSave is not admin');
  const p = payload(); p.words = { [k]: said };
  const m = boot({ payload: p, before: signedInAs_({ name: 'Cal Client', personId: 'P-CL', role: 'client', roles: ['client'], rank: 'client', token: 'tk', handle: 'calclient' }) });
  await wait(400);
  m.w.__t.findGroup('Tools'); await wait(300);
  const mh = m.w.document.querySelector(`#wgt-${id} h3[data-wk]`);
  if (!mh || mh.textContent !== said) bad.push('a client saw the title as ' + (mh && mh.textContent));
  if (m.w.document.querySelector(`#wgt-${id} img[onerror]`)) bad.push('typed markup became markup');
  if (m.w.document.querySelector(`#wgt-${id} [data-do="words-edit"]`)) bad.push('a client has an Edit words tile');
  /* STILL EDITING AFTER SAVE, the changed title with its Reset beside it. */
  const ah = d.querySelector(`#wgt-${id} h3[data-wk]`);
  if (!ah || ah.textContent !== said) bad.push('after Save the admin sees ' + (ah && ah.textContent));
  const reset = ah && ah.closest('.card')?.querySelector('[data-do="words-reset"]');
  if (!reset) return bad.concat(['a changed title has no Reset this text']);
  A['words-reset'](reset); await wait(200);
  const r = sent.filter(x => x.action === 'wordsSave').pop();
  if (!r || (r.reset || []).indexOf(k) === -1) bad.push('Reset did not post the key back: ' + JSON.stringify(r));
  return bad;
});
check('who sees this (497): an admin narrows a widget to Tutors in place; a student does not see it, a tutor does, and the pager counts agree; an admin-only widget cannot be widened; layoutClean_ keeps seen', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (!A['seen-open'] || !A['seen-set']) return ['no seen-open or seen-set handler — NOT checked'];
  t.findGroup('Tools'); await wait(300);
  const ids = layIds_(t, 'tool'), id = ids.find(x => x !== 'flyers' && !w.seenGate_(x));
  const tile = layTile_(d, id, 'seen-open');
  if (!tile) return ['the tool has no Who sees this tile'];
  A['seen-open'](tile); await wait(50);
  const sel = d.querySelector(`.seen-box[data-seen-for="${id}"] select`);
  if (!sel) return ['Who sees this did not open in place'];
  if (d.querySelector('.modal, dialog[open]')) bad.push('Who sees this opened a pop-up');
  sel.value = 'staff';
  A['seen-set'](sel); await wait(200);
  const L = layLast_(sent);
  if (!L || !L.seen || L.seen[id] !== 'staff') return bad.concat(['the layout saved seen ' + JSON.stringify(L && L.seen)]);
  const { backend } = require('./check-gas-load.js');
  const kept = backend().ev('layoutClean_(' + JSON.stringify(L) + ')');
  if (!kept || !kept.seen || kept.seen[id] !== 'staff') bad.push('layoutClean_ dropped seen: ' + JSON.stringify(kept && kept.seen));
  const as = (rank, role) => { const p = payload(); p.layout = L; return boot({ payload: p, before: signedInAs_({ name: 'Sam ' + rank, personId: 'P-' + rank, role: role, roles: [role], rank: rank, token: 'tk', handle: 'sam' + rank }) }); };
  const s = as('student', 'student'), tu = as('staff', 'tutor');
  await wait(500);
  const sIds = s.w.__t.widgetsOf('tool').map(x => String(x.id)), tIds = tu.w.__t.widgetsOf('tool').map(x => String(x.id));
  if (sIds.indexOf(id) !== -1) bad.push('a student still sees ' + id);
  if (tIds.indexOf(id) === -1) bad.push('a tutor does not see ' + id);
  s.w.__t.findGroup('Tools'); await wait(300);
  if (s.w.document.querySelector(`#wgt-${id}`)) bad.push('the student\'s Tools column still draws ' + id);
  /* AN ADMIN-ONLY WIDGET: Students, Parents and Tutors are not offered; Everyone and Admin only are. */
  if (ids.indexOf('flyers') !== -1) {
    const box = d.createElement('div'); box.innerHTML = w.seenBox_('flyers');
    const o = v => box.querySelector(`option[value="${v}"]`);
    if (!o('staff') || !o('staff').disabled || !o('student').disabled || !o('out').disabled) bad.push('an admin-only widget offers a wider audience');
    if (o('admin').disabled || o('').disabled) bad.push('an admin-only widget cannot be set to Admin only or Everyone');
  } else bad.push('no admin-only widget (flyers) to try widening — NOT checked');
  return bad;
});
check('suggest a change (489, 494): one tile with that name on a widget, the booking form and the finder itself; the box opens in place of the widget; after Send the words are gone when it opens again', async () => {
  const { w, sent } = layBoot_({ reply: b => (b.action === 'suggest' ? { success: true } : undefined) });
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  t.findGroup('Tools'); await wait(300);
  const id = layIds_(t, 'tool')[0];
  const card = d.querySelector(`#wgt-${id}`)?.closest('.card');
  const tile = card && card.querySelector('[data-do="rep-box"]');
  if (!tile) return ['the first tool has no Suggest tile'];
  if (tile.getAttribute('aria-label') !== 'Suggest a change') bad.push('the tile is called ' + tile.getAttribute('aria-label'));
  if (card.querySelectorAll('[data-do="rep-box"]').length !== 1) bad.push('the widget has more than one Suggest tile');
  A['rep-box'](tile); await wait(50);
  const box = card.querySelector(':scope > .rep-box');
  if (!box || !card.classList.contains('is-writing')) return bad.concat(['the Suggest box did not open in place of the widget']);
  if (box.querySelector('select')) bad.push('the box still asks for a reason');
  const ta = box.querySelector('textarea');
  ta.value = 'Bigger keys please'; ta.dispatchEvent(new w.Event('input', { bubbles: true })); await wait(50);
  A['rep-send'](box.querySelector('[data-do="rep-send"]')); await wait(300);
  if (sent.filter(x => x.action === 'suggest' && x.note === 'Bigger keys please').length !== 1) bad.push('Send did not post one suggestion with the words');
  if (card.querySelector('.rep-box') || card.classList.contains('is-writing')) bad.push('after Send the widget did not come back');
  A['rep-box'](card.querySelector('[data-do="rep-box"]')); await wait(50);
  const again = card.querySelector('.rep-box textarea');
  if (!again || again.value) bad.push('the Suggest box opened again with the last words in it: ' + (again && again.value));
  t.go('booking', false, true); await wait(300);
  if (!d.querySelector('#s-booking [data-do="rep-box"]')) bad.push('the booking form has no Suggest tile');
  /* THE FINDER ITSELF (494): "should be on finder widget too" — Find and Find 2 each carry one on the question's page. */
  for (const f of ['stuff', 'res']) {
    t.go(f, false, true); await wait(300);
    const n = d.querySelectorAll(`#${f}-controls [data-do="rep-box"][data-rk="finder"]`).length;
    if (n !== 1) bad.push(`#${f}-controls has ${n} Suggest tiles for the finder itself — wanted one`);
  }
  return bad;
});
check('library cards (489): the widget holds one card — no Add another, the one filled shown', async () => {
  const { w } = layBoot_();
  await wait(300);
  const bad = [];
  if (typeof w.libraryShelf_ !== 'function') return ['no libraryShelf_ — NOT checked'];
  const list = ['lib1_name', 'lib1_no', 'lib1_pin', 'lib2_name', 'lib2_no', 'lib2_pin'];
  const h = w.libraryShelf_(list, f => (f === 'lib2_name' ? 'Town library' : ''));
  const box = w.document.createElement('div'); box.innerHTML = h;
  if (box.querySelectorAll('.lib-card').length !== 1) bad.push(box.querySelectorAll('.lib-card').length + ' card slots, not one');
  if (box.querySelector('[data-do="shelf-more"]')) bad.push('there is still an Add another');
  if (!box.querySelector('[name="lib2_name"], [data-me="lib2_name"], [data-f="lib2_name"]') && h.indexOf('Town library') === -1) bad.push('the filled card is not the one shown');
  return bad;
});

/* ---------- TWO BARE-BONES TOOLS (547): the poster planner and the pixel editor -- tiles, one line per thing, this device only, files out ---------- */
check('the poster planner and the pixel editor (547) are Tools widgets: tiles only, a box drawn, moved, resized and labelled, a square painted and erased, JSON and PNG out, kept on this device and never sent', async () => {
  const { w, sent } = layBoot_();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (typeof w.initPoster_ !== 'function' || typeof w.initPixel_ !== 'function') return ['no initPoster_ or initPixel_ -- NOT checked'];
  const ids = (typeof w.widgetsOf_ === 'function' ? w.widgetsOf_('tool') : []).map(x => x.id);
  ['poster', 'pixel'].forEach(id => { if (ids.indexOf(id) < 0) bad.push('no ' + id + ' widget in Tools'); });
  /* A FRESH WINDOW HAS NOTHING STORED, so both start blank; Clear makes sure of it should a widget have drawn on the way in. */
  const saved = [], strokes = [];
  w.HTMLCanvasElement.prototype.getContext = function () { return new Proxy({}, { get: (x, k) => (k === 'fillRect' ? (...a) => strokes.push(a) : k in x ? x[k] : () => {}), set: (x, k, v) => { x[k] = v; return true; } }); };
  w.HTMLCanvasElement.prototype.toBlob = function (cb, type) { setTimeout(() => cb(new w.Blob(['x'], { type })), 0); };
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () { saved.push(this.download); };
  const ev = (el, type, x, y) => el.dispatchEvent(new w.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  const before = sent.length;
  /* ---------- THE POSTER ---------- */
  const ph = d.createElement('div'); ph.id = 'pst-box'; d.body.appendChild(ph);
  w.initPoster_();
  if (ph.querySelector('[data-do="pst-clear"]:not([disabled])')) A['pst-clear'](ph.querySelector('[data-do="pst-clear"]'));
  const sizes = [...ph.querySelectorAll('[data-pst-set="size"] option')].map(o => o.value).join();
  if (sizes !== 'A0,A1,A2,A3') bad.push('the poster sizes are ' + sizes + ', not A0-A3');
  if (!ph.querySelector('[data-pst-set="orient"] option[value="landscape"]')) bad.push('no landscape');
  const kinds = [...ph.querySelectorAll('.tile[data-do="pst-kind"]')].map(x => x.dataset.kind).join();
  if (kinds !== 'title,text,image,chart') bad.push('the box kinds are ' + kinds);
  const loose = ph.querySelectorAll('button:not(.tile)');
  if (loose.length) bad.push('the poster planner has ' + loose.length + ' button(s) that are not tiles');
  const page = () => ph.querySelector('.pst-page');
  page().getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 300 });
  A['pst-kind'](ph.querySelector('[data-do="pst-kind"][data-kind="title"]'));
  page().getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 300 });
  ev(page(), 'pointerdown', 20, 30); ev(d, 'pointermove', 120, 90); ev(d, 'pointerup', 120, 90);
  let plan = JSON.parse(w.localStorage.getItem('posterPlan') || '{}');
  const b0 = (plan.boxes || [])[0];
  if (!b0 || b0.kind !== 'title' || Math.abs(b0.x - 0.1) > 0.01 || Math.abs(b0.w - 0.5) > 0.01 || Math.abs(b0.h - 0.2) > 0.01) bad.push('the drawn box is ' + JSON.stringify(plan.boxes));
  else {
    page().getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 300 });
    ev(ph.querySelector('[data-pst="' + b0.id + '"] .pst-label'), 'pointerdown', 50, 50); ev(d, 'pointermove', 70, 80); ev(d, 'pointerup', 70, 80);
    page().getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 300 });
    ev(ph.querySelector('[data-pst-grip="' + b0.id + '"]'), 'pointerdown', 140, 120); ev(d, 'pointermove', 160, 150); ev(d, 'pointerup', 160, 150);
    plan = JSON.parse(w.localStorage.getItem('posterPlan') || '{}');
    const b1 = plan.boxes[0];
    if (Math.abs(b1.x - 0.2) > 0.01 || Math.abs(b1.y - 0.2) > 0.01) bad.push('the box did not move: ' + JSON.stringify(b1));
    if (Math.abs(b1.w - 0.6) > 0.01 || Math.abs(b1.h - 0.3) > 0.01) bad.push('the box did not resize: ' + JSON.stringify(b1));
    const lab = ph.querySelector('[data-pst-label="' + b0.id + '"]');
    if (!lab) bad.push('a chosen box has no label row');
    else { lab.value = 'Method'; lab.dispatchEvent(new w.Event('input', { bubbles: true })); }
    const sz = ph.querySelector('[data-pst-set="orient"]'); sz.value = 'landscape'; sz.dispatchEvent(new w.Event('change', { bubbles: true }));
    const out = w.pstExport_();
    if (out.paper !== 'A1' || out.orientation !== 'landscape' || out.width_mm !== 841 || out.height_mm !== 594) bad.push('the JSON page is ' + JSON.stringify([out.paper, out.orientation, out.width_mm, out.height_mm]));
    const ob = (out.boxes || [])[0] || {};
    if (ob.label !== 'Method' || ob.kind !== 'title' || Math.abs(ob.x_mm - 168.2) > 0.2) bad.push('the JSON box is ' + JSON.stringify(ob));
    A['pst-json'](ph.querySelector('[data-do="pst-json"]'));
    A['pst-png'](ph.querySelector('[data-do="pst-png"]'));
    await wait(50);
    if (saved.indexOf('poster-layout.json') < 0 || saved.indexOf('poster-layout.png') < 0) bad.push('the poster exports saved ' + JSON.stringify(saved));
  }
  /* ---------- THE PIXEL EDITOR ---------- */
  const xh = d.createElement('div'); xh.id = 'pxe-box'; d.body.appendChild(xh);
  w.initPixel_();
  if (xh.querySelectorAll('.pxe-c').length !== 256) bad.push('the pixel grid has ' + xh.querySelectorAll('.pxe-c').length + ' squares, not 16 x 16');
  if (xh.querySelectorAll('button:not(.tile)').length) bad.push('the pixel editor has buttons that are not tiles');
  ['pxe-tool', 'pxe-clear', 'pxe-png'].forEach(a => { if (!xh.querySelector('.tile[data-do="' + a + '"]')) bad.push('no ' + a + ' tile'); });
  const col = xh.querySelector('input[type="color"][data-pxe-set="colour"]');
  if (!col) bad.push('no colour row');
  else { col.value = '#ff0000'; col.dispatchEvent(new w.Event('change', { bubbles: true })); }
  const cell = i => xh.querySelector('[data-pxe="' + i + '"]');
  ev(cell(5), 'pointerdown', 0, 0); ev(cell(6), 'pointermove', 0, 0); ev(d, 'pointerup', 0, 0);
  let art = JSON.parse(w.localStorage.getItem('pixelArt') || '{}');
  if ((art.px || [])[5] !== '#ff0000' || art.px[6] !== '#ff0000') bad.push('a press and a drag did not paint: ' + JSON.stringify((art.px || []).slice(4, 8)));
  A['pxe-tool'](xh.querySelector('[data-do="pxe-tool"][data-tool="eraser"]'));
  ev(cell(6), 'pointerdown', 0, 0); ev(d, 'pointerup', 0, 0);
  art = JSON.parse(w.localStorage.getItem('pixelArt') || '{}');
  if (art.px[6] !== '' || art.px[5] !== '#ff0000') bad.push('the eraser did not clear one square: ' + JSON.stringify(art.px.slice(4, 8)));
  strokes.length = 0;
  A['pxe-png'](xh.querySelector('[data-do="pxe-png"]'));
  await wait(50);
  if (strokes.length !== 1 || saved.indexOf('pixel-art-16x16.png') < 0) bad.push('the PNG drew ' + strokes.length + ' square(s) (wanted 1) and saved ' + JSON.stringify(saved));
  A['pxe-clear'](xh.querySelector('[data-do="pxe-clear"]'));
  art = JSON.parse(w.localStorage.getItem('pixelArt') || '{}');
  if (art.px.some(Boolean)) bad.push('Clear left painted squares');
  const gs = xh.querySelector('[data-pxe-set="n"]'); gs.value = '8'; gs.dispatchEvent(new w.Event('change', { bubbles: true }));
  if (xh.querySelectorAll('.pxe-c').length !== 64) bad.push('an 8 x 8 grid has ' + xh.querySelectorAll('.pxe-c').length + ' squares');
  if (sent.length !== before) bad.push('the tools sent ' + sent.slice(before).map(x => x.action).join(', ') + ' -- they are this device\'s alone');
  ph.remove(); xh.remove();
  return bad;
});

/* ---------- THE WEEKLY EMAIL CARD SHOWS THE EMAIL AS IS (547): the backend's own HTML in a frame, and typed words re-render it there ---------- */
check('the Weekly email card (547) shows the very HTML the backend sends, in a sandboxed frame, never a copy drawn on the phone; a typed subject is asked of the same renderer', async () => {
  const W = cardWorld_(), bad = [];
  const reply = b => (b.action === 'digestPreview' ? W.real.post(b) : W.reply(b));
  const a = await cardOpen_(W, 'admin@example.org', { reply });
  if (a.err) return [a.err];
  a.t.go('site', false, true); a.w.paint('site');
  let fr = null;
  for (let i = 0; i < 60 && !(fr = a.d.querySelector('#s-site .digest-look iframe.dw-frame')); i++) await wait(100);
  if (!fr) return ['the Weekly email card drew no frame: ' + ((a.d.querySelector('#s-site .digest-look') || {}).textContent || '(no card)').replace(/\s+/g, ' ').slice(0, 200)];
  const want = W.real.post({ action: 'digestPreview', personId: a.u.personId, token: a.u.token });
  if (!want || !want.shown || fr.getAttribute('srcdoc') !== want.shown.html) bad.push('the frame does not hold the backend\'s shown email byte for byte');
  if (fr.getAttribute('sandbox') !== '') bad.push('the frame is not fully sandboxed: sandbox="' + fr.getAttribute('sandbox') + '"');
  if (a.d.querySelector('#s-site .digest-look .dp-q, #s-site .digest-look .dp-body')) bad.push('a hand-drawn imitation of the email is still on the card');
  const subj = a.d.querySelector('#s-site .digest-look .dp-subj');
  if (!subj || subj.textContent.indexOf(want.shown.subject) < 0) bad.push('the subject line is not the backend\'s: ' + (subj && subj.textContent));
  const box = a.d.querySelector('#s-site .digest-words [data-dw="digest_subject"]');
  if (!box) return bad.concat(['no Subject box on the words card']);
  box.value = 'Typed for {child}';
  box.dispatchEvent(new a.w.Event('input', { bubbles: true }));
  let asked = null;
  for (let i = 0; i < 40 && !(asked = a.sent.filter(x => x.action === 'digestPreview' && x.words).pop()); i++) await wait(100);
  if (!asked || asked.words.digest_subject !== 'Typed for {child}') bad.push('typing the subject did not ask the backend\'s renderer with it: ' + JSON.stringify(asked && asked.words));
  await wait(400);
  const subj2 = a.d.querySelector('#s-site .digest-look .dp-subj');
  if (!subj2 || !/Typed for \S/.test(subj2.textContent)) bad.push('after typing, the subject shown is "' + (subj2 && subj2.textContent) + '"');
  return bad;
});

/* ---------- THE RULES CARD (496): a rule flipped to Universal changes a client's site after a reload, Undo restores it, a locked rule cannot flip, a non-admin cannot save ---------- */
check('the Rules card (496): the admin flips "Tell the admin" to Universal on Site and a client reloads to "Suggest a change"; Undo puts it back; a locked rule has no switch and the backend refuses it; a client cannot save', async () => {
  const W = cardWorld_(), bad = [];
  const reply = b => (b.action === 'rulesSave' ? W.real.post(b) : W.reply(b));
  const says = c => String(c.w.suggestTile_('message', 'm-1', 'a message'));
  const c0 = await cardOpen_(W, 'parent@example.org', { reply });
  if (c0.err) return [c0.err];
  if (says(c0).indexOf('Tell the admin') === -1) bad.push('before any change a client\'s message does not say "Tell the admin"');
  const a = await cardOpen_(W, 'admin@example.org', { reply });
  if (a.err) return bad.concat([a.err]);
  a.t.go('site', false, true); a.w.paint('site'); await wait(300);
  const card = a.d.querySelector('#s-site .rules-card');
  if (!card) return bad.concat(['the Site column has no Rules card for an admin']);
  const nReg = (require('fs').readFileSync(require('path').join(__dirname, 'rules.js'), 'utf8').match(/^  \{ id: '/gm) || []).length;
  if (!nReg || card.querySelectorAll('.rule-row').length !== nReg) bad.push('the card shows ' + card.querySelectorAll('.rule-row').length + ' rules, not ' + nReg);
  const locked = card.querySelector('.rule-row[data-rule="keep-basket"]');
  if (!locked || locked.querySelector('.rule-opt') || !/Locked: /.test(locked.textContent)) bad.push('the locked basket rule has a switch or no reason');
  const uni = card.querySelector('.rule-row[data-rule="tell-admin"] .rule-opt[data-to="universal"]');
  if (!uni) return bad.concat(['the tell-admin rule has no Universal switch']);
  a.A('rule-set', uni); await wait(500);
  const post = a.sent.filter(x => x.action === 'rulesSave').pop();
  if (!post || post.rule !== 'tell-admin' || post.to !== 'universal') bad.push('Universal posted ' + JSON.stringify(post));
  const c1 = await cardOpen_(W, 'parent@example.org', { reply });
  if (c1.err) return bad.concat([c1.err]);
  if (says(c1).indexOf('Suggest a change') === -1) bad.push('after Universal and a reload a client\'s message still says "Tell the admin"');
  /* UNDO: the last change, back for everybody. */
  a.t.go('site', false, true); a.w.paint('site'); await wait(300);
  const undo = a.d.querySelector('#s-site .rules-card [data-do="rules-undo"]:not([disabled])');
  if (!undo) return bad.concat(['no live Undo tile after a change']);
  a.A('rules-undo', undo); await wait(500);
  const c2 = await cardOpen_(W, 'parent@example.org', { reply });
  if (c2.err) return bad.concat([c2.err]);
  if (says(c2).indexOf('Tell the admin') === -1) bad.push('after Undo and a reload a client\'s message does not say "Tell the admin"');
  const hist = (W.GET().rules || {}).hist || [];
  if (hist.length !== 0) bad.push('after one change and its Undo the history holds ' + hist.length);
  /* A LOCKED RULE: the backend refuses it even when asked directly. */
  const L = W.real.post({ action: 'rulesSave', personId: a.u.personId, token: a.u.token, rule: 'keep-basket', to: 'universal' });
  if (!L || L.success || !(W.GET().rules || { set: {} }).set) bad.push('the backend let a locked rule flip: ' + JSON.stringify(L));
  if (((W.GET().rules || {}).set || {})['keep-basket']) bad.push('keep-basket was saved universal');
  /* A CLIENT: no card, and the backend says no. */
  c2.t.go('site', false, true); await wait(200);
  if (c2.d.querySelector('.rules-card')) bad.push('a client is drawn the Rules card');
  const n = W.real.post({ action: 'rulesSave', personId: c2.u.personId, token: c2.u.token, rule: 'tell-admin', to: 'universal' });
  if (!n || n.success) bad.push('a client saved a rule: ' + JSON.stringify(n));
  return bad;
});

/* ---------- AFTER LIBRARY → A SUBJECT, ONLY THAT SUBJECT'S SHELVES (499) § */
/* ---------- MECHANICS (548): THE PATH Library → Mechanics → Card type → System → Make → Model → Engine, ON THE REAL FILES ---------- */
check('Mechanics (548, 650, 740): Library → Mechanics offers Part and Car; Car offers the Clio\'s four engines; Part → Engine 1.5 dCi narrows to its parts; the Parts tile on a car card opens them; cards are minimal, with no picture', async () => {
  const serveAll = url => {
    const m = /(?:^|\/)(data\/[a-z0-9_\-\/]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    try { return JSON.parse(fs.readFileSync(path.join(dir, '..', m[1]), 'utf8')); } catch (e) { return undefined; }
  };
  const { w } = boot({ serve: serveAll });
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  if (!w.__t) return ['the app did not boot — NOT checked'];
  const t = w.__t;
  try { t.go('stuff'); w.paintStuff(); } catch (e) {}
  for (let i = 0; i < 160 && !w.mechItems_().length; i++) await wait(50);
  const all = w.mechItems_(), bad = [];
  if (!all.length) return ['the mechanics files did not load — NOT checked'];
  const S = t.STUFF(), vals = field => w.facetValues(w.stuffFiltered(), w.facetList().find(f => f.field === field)).map(v => v.value);
  S.q = ''; S.filters = [{ field: 'kindLabel', value: 'Library' }];
  if (vals('subject').indexOf('Mechanics') < 0) bad.push('Library offers no Mechanics subject');
  S.filters.push({ field: 'subject', value: 'Mechanics' });
  const kinds = vals('mKind').sort().join(',');
  if (kinds !== 'Car,Part') bad.push('Mechanics → Card type offers ' + kinds);
  const base = S.filters.slice();
  /* ONE CAR (740): Brand and Model went, so Engine is the question that splits. */
  ['mMake', 'mModel'].forEach(f => { if (w.facetList().some(x => x.field === f)) bad.push('the ' + f + ' facet is back, with one car to split'); });
  S.filters.push({ field: 'mKind', value: 'Car' });
  if (vals('mEngine').length !== 4) bad.push('the Clio offers ' + vals('mEngine').length + ' engines, wanted 4: ' + vals('mEngine').join(', '));
  S.filters = base.concat({ field: 'mKind', value: 'Part' });
  const parts = w.stuffFiltered().length;
  if (parts < 60) bad.push('Part found ' + parts + ' Clio parts, wanted 60 or more');
  S.filters.push({ field: 'mEngine', value: '1.5 dCi (K9K)' });
  const dci = w.stuffFiltered();
  if (!dci.length || dci.some(x => (x.mEngine || []).indexOf('1.5 dCi (K9K)') < 0)) bad.push('Part → 1.5 dCi found ' + dci.length + ', not only its parts');
  if (dci.length >= parts) bad.push('Part → 1.5 dCi did not narrow');
  if (dci.some(x => x.name === 'Spark plugs')) bad.push('the diesel is offered spark plugs');
  const car = all.find(x => x.mKind === 'Car' && x.mEngine === '1.5 dCi (K9K)');
  /* ONE TILE ROW PER THING (489, 950): the Parts tile is in the card's own row (`CARD_EXTRAS_MORE`), so the whole card is asked. */
  const chtml = car ? w.stuffCard(car, 0) : '';
  if (!/data-do="mech-parts"[^>]*data-engine="1.5 dCi \(K9K\)"/.test(chtml)) bad.push('a car card offers no Parts tile');
  else {
    const b = w.document.createElement('button'); b.dataset.do = 'mech-parts'; b.dataset.engine = '1.5 dCi (K9K)'; w.document.body.appendChild(b); b.click(); b.remove();
    const got = t.STUFF().filters.map(c => c.field + '=' + c.value).join();
    if (got !== 'kindLabel=Library,subject=Mechanics,mKind=Part,mEngine=1.5 dCi (K9K)') bad.push('the Parts tile set ' + got);
  }
  if (!/Renault · Clio/.test(chtml) || !/<b>Engine<\/b>/.test(chtml)) bad.push('a car card does not say brand, model and engine');
  const part = all.find(x => x.mKind === 'Part');
  const html = w.mechCard_(part);
  if (!/What it is/.test(html) || !/Part number \(example\)/.test(html) || !/approximate/.test(html) || !/<b>Fits<\/b>/.test(html) || !/qtag/.test(html)) bad.push('a part card does not draw what it is, its number, price, fits and tags');
  /* MINIMAL (740): no picture and no extra sections. */
  if (/mech-pic|<img|viewBox="0 0 64 64"/.test(html + chtml)) bad.push('a part or car card draws a picture');
  if ((html.match(/<p><b>/g) || []).length !== 4 || (chtml.match(/<p><b>/g) || []).length !== 2) bad.push('a card draws more than its minimal rows');
  return bad;
});

/* ---------- CHEMISTRY (550): Library → Chemistry → Card type → Chemical type → Group → State, ON THE REAL FILES ---------- */
check('Chemistry (550): Library → Chemistry offers Element, Substance and Reaction; Element → Halogen → Group 17 narrows to the halogens; a reaction card draws its examples and source', async () => {
  const serveAll = url => {
    const m = /(?:^|\/)(data\/[a-z0-9_\-\/]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    try { return JSON.parse(fs.readFileSync(path.join(dir, '..', m[1]), 'utf8')); } catch (e) { return undefined; }
  };
  const { w } = boot({ serve: serveAll });
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  if (!w.__t) return ['the app did not boot — NOT checked'];
  const t = w.__t;
  try { t.go('stuff'); w.paintStuff(); } catch (e) {}
  for (let i = 0; i < 160 && !w.chemItems_().length; i++) await wait(50);
  const all = w.chemItems_(), bad = [];
  if (!all.length) return ['the chemistry files did not load — NOT checked'];
  const S = t.STUFF(), vals = field => w.facetValues(w.stuffFiltered(), w.facetList().find(f => f.field === field)).map(v => v.value);
  S.q = ''; S.filters = [{ field: 'kindLabel', value: 'Library' }];
  if (vals('subject').indexOf('Chemistry') < 0) bad.push('Library offers no Chemistry subject');
  S.filters.push({ field: 'subject', value: 'Chemistry' });
  ['Element', 'Reaction', 'Substance'].forEach(k => { if (vals('mKind').indexOf(k) < 0) bad.push('Chemistry → Card type lacks ' + k); });
  S.filters.push({ field: 'mKind', value: 'Element' }, { field: 'cCategory', value: 'Halogen' });
  if (vals('cGroup').join() !== 'Group 17') bad.push('Element → Halogen offers groups ' + vals('cGroup').join(', '));
  if (vals('cState').sort().join() !== 'Gas,Liquid,Solid,Unknown') bad.push('halogens offer states ' + vals('cState').join(', '));
  const rx = all.find(x => x.mKind === 'Reaction');
  const html = w.chemCard_(rx);
  if (!/Observations/.test(html) || !/<ol>/.test(html) || html.indexOf('chemistry knowledge') < 0 || !/qtag/.test(html)) bad.push('a reaction card does not draw its words, examples, tags and source');
  return bad;
});

check('Library → a subject offers only shelves that subject has — never Books, Boxing and History everywhere (499)', async () => {
  const serveAll = url => {
    const m = /(?:^|\/)(data\/[a-z0-9_\-\/]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    const p = path.join(dir, '..', m[1]);
    try { return JSON.parse(LIB_FULL.serve(p) || fs.readFileSync(p, 'utf8')); } catch (e) { return undefined; }
  };
  const u = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] };
  const p = payload();
  const read = n => { try { return JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')); } catch (e) { return []; } };
  Object.assign(p, { boxers: read('boxers'), fights: read('fights') });
  const { w } = boot({ payload: p, serve: serveAll, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} } });
  const t = w.__t;
  try { t.go('stuff'); w.paintStuff(); } catch (e) {}
  for (let i = 0; i < 160 && !(w.stuffItems().length > 1000 && w.talmudItems_().length && w.stuffItems().some(x => x.kind === 'quran') && w.stuffItems().some(x => x.kind === 'bible')); i++) await wait(50);
  const bad = [];
  if (w.stuffItems().length < 1000) return ['the library did not load, so NOT checked'];
  /* THE BIBLE IS A CARD A VERSE ON THE EVERYDAY LIST (499), every one 18+, and no cover. */
  const bv = w.stuffItems().filter(x => x.kind === 'bible');
  /* ONE A VERSE A TEXT (504): the KJV's 31,102, the WEB's on the same numbering, and each other text over its own books. */
  const bix = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'bible', 'index.json'), 'utf8'));
  const bWant = bix.totals.verses + (bix.also || []).reduce((n, t) => n + (Array.isArray(t.books) ? t.books.reduce((m, b) => m + b.verses, 0) : bix.totals.verses), 0);
  if (bv.length !== bWant) bad.push('the admin\'s list holds ' + bv.length + ' Bible items — wanted ' + bWant + ', one a verse a text');
  if (bv.some(x => !x.bb || Number(x.min_age) < 18)) bad.push('a Bible item is not a verse, or carries no 18+ limit');
  const S = t.STUFF();
  const base = [{ field: 'kindLabel', value: 'Library' }];
  S.q = ''; S.filters = base.slice();
  const subjects = w.facetValues(w.stuffFiltered(), w.facetList().find(f => f.field === 'subject')).map(v => v.value);
  if (subjects.length < 3) bad.push('Library offers only ' + subjects.length + ' subjects: ' + subjects.join(', '));
  let shelvesSeen = 0;
  subjects.forEach(sub => {
    S.filters = base.concat([{ field: 'subject', value: sub }]);
    const list = w.stuffFiltered();
    if (list.some(x => String(x.subject || '') !== String(sub) && !(Array.isArray(x.subject) && x.subject.indexOf(sub) >= 0))) {
      const odd = list.filter(x => String(x.subject || '') !== String(sub));
      bad.push('Library → ' + sub + ' holds ' + odd.length + ' item(s) of another subject, e.g. ' + odd.slice(0, 3).map(x => x.kind + ':' + x.name + ' (' + x.subject + ')').join('; '));
    }
    const shelf = w.facetList().find(f => f.field === 'shelf');
    w.facetValues(list, shelf).forEach(v => {
      shelvesSeen++;
      const n = list.filter(x => String(x.shelf || '') === String(v.value)).length;
      if (!n) bad.push('Library → ' + sub + ' offers the shelf ' + v.value + ' with no item of that subject on it');
    });
  });
  if (!shelvesSeen) bad.push('no subject offered any shelf, so the shelf rule was NOT exercised');
  if (subjects.indexOf('Boxing') >= 0) bad.push('Boxing is still a subject — boxers and bouts are Physical Education (499)');
  S.filters = base.concat([{ field: 'subject', value: 'Physical Education' }]);
  if (!w.stuffFiltered().some(x => x.kind === 'boxer')) bad.push('Library → Physical Education holds no boxer');
  /* ANY SUBJECT, AND SHELF IS SUBJECT AGAIN UNDER OTHER NAMES: it is not asked (facetEcho_). */
  S.filters = base.concat([{ field: 'subject', any: true }]);
  const nx = w.nextFacet(w.stuffFiltered());
  /* AN ECHO ONLY WHILE EVERY SHELF IS ONE SUBJECT'S: Writings holds Religious Studies, English Literature and History (520), so it is asked. */
  const spans = sh => new Set(w.stuffFiltered().filter(x => String(x.shelf || '') === sh).map(x => String(x.subject || ''))).size;
  if (nx && nx.field === 'shelf' && w.facetValues(w.stuffFiltered(), nx).every(v => spans(v.value) <= 1)) bad.push('Library → Any subject asks Shelf (' + w.facetValues(w.stuffFiltered(), nx).map(v => v.value).join(', ') + ') — the subject question again');
  S.filters = [];
  return bad;
});

/* ---------- WHAT'S MISSING (526): an admin's card directly above Find's question, fetched for an admin alone ---------- */
const MISS_LIST_ = [
  { board: 'Edexcel', level: 'GCSE', subject: 'Maths', label: 'Edexcel GCSE Maths', papers: ['1H', '2H'], series: ['June'], from: 2017, to: 2017 },
  { board: 'AQA', level: 'GCSE', subject: 'Geography', label: 'AQA GCSE Geography', papers: ['1'], from: 2022, to: 2022 },
  { board: 'AQA', level: 'GCSE', subject: 'Psychology', label: 'AQA GCSE Psychology', papers: ['1'], from: 2022, to: 2022 },
  /* NEVER SHOWN (562): an OCR line, and an Edexcel line that is not Maths. */
  { board: 'OCR', level: 'GCSE', subject: 'Maths', label: 'OCR GCSE Maths', papers: ['1'], from: 2022, to: 2022 },
  { board: 'Edexcel', level: 'GCSE', subject: 'History', label: 'Edexcel GCSE History', papers: ['1'], from: 2022, to: 2022 },
];
const MISS_ROWS_ = [
  { kind: 'document', document_type: 'Past paper', paper_id: 'MX-1H', exam_board: 'Edexcel', level: 'GCSE', subject: 'Maths', year: '2017', month: '6',
    paper: '1', tier: 'Higher', name: 'Paper 1 — June 2017', active: 'True' },
  { kind: 'document', document_type: 'Past paper', paper_id: 'MX-PS', exam_board: 'AQA', level: 'GCSE', subject: 'Psychology', year: '2022', month: '5',
    paper: '1', name: 'Paper 1 — June 2022', active: 'True' },
  { kind: 'question', row_id: 'MX-PS-1', paper_id: 'MX-PS', question: '1', exam_board: 'AQA', level: 'GCSE', subject: 'Psychology', year: '2022', month: '5',
    paper: '1', name: 'Q1', active: 'True', lib_pending: 'True' },
];
const missServe_ = list => u => (/expected-papers\.json/.test(u) ? list : /data\/questions\.json/.test(u) ? MISS_ROWS_ : undefined);
const missPages_ = d => [...(d.getElementById('s-stuff') || { querySelectorAll: () => [] }).querySelectorAll(':scope > .page')];

check('What\'s missing (526): an admin sees the card directly above Find\'s question and Find still opens on the question; the gaps, "none yet", "complete" and the papers waiting; a chip and Back to top keep it; Delete takes it off; an empty list says so; a student and a client neither see nor fetch it', async () => {
  const { w, errs, gets } = boot({ before: signedInAs_(LAY_ADMIN_), serve: missServe_(MISS_LIST_) });
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  t.go('stuff', false, true); await wait(400);
  /* IN FIND, NOT ABOVE IT (owner, 4 Nov, `HEALTH_IN_FIND`): no lead page, Find opens on its question, and the card is the Find item health:missing. */
  const qAt = () => missPages_(d).indexOf(d.getElementById('stuff-controls')?.closest('.page'));
  if (qAt() !== 0 || t.PAGE().stuff !== 0) bad.push('the question is page ' + qAt() + ' and Find opens on page ' + t.PAGE().stuff + ' — wanted the question first, no page above it');
  if (d.querySelector('#s-stuff .miss-card')) bad.push('the card is still drawn above Find\'s question');
  const host = d.createElement('div'); host.className = 'miss-host'; d.getElementById('s-stuff').appendChild(host);
  const item = () => (w.stuffItemsAll_() || []).find(x => x.key === 'health:missing');
  const draw = async () => { host.innerHTML = item() ? w.stuffCard(item(), 0) : ''; await wait(200); host.innerHTML = item() ? w.stuffCard(item(), 0) : ''; };
  if (!item()) return bad.concat(['no What’s missing item in Find for an admin — NOT checked']);
  await draw();
  if (!host.querySelector('.miss-card')) return bad.concat(['the What’s missing item draws no card — NOT checked']);
  if (d.querySelector('#s-res .miss-card')) bad.push('Find 2 carries the card too');
  const said = () => [...host.querySelectorAll('.miss-card :is(h3, p, .k, .v)')].map(e => e.textContent.trim()).join(' ');
  /* ONE LINE FIRST (660): the rows open behind The list. */
  if (!/papers? missing in \d+ of \d+/.test(said())) bad.push('the card is not one line: ' + said().slice(0, 160));
  const allTile = host.querySelector('.miss-card [data-do="miss-all"]');
  if (!allTile) bad.push('no The list tile on the card (660)'); else { t.ACTIONS['miss-all'](allTile); await wait(100); host.innerHTML = w.stuffCard(item(), 0); }
  const s0 = said();
  if (!/What.s missing/.test(s0)) bad.push('the card has no title: ' + s0.slice(0, 120));
  if (!/Edexcel GCSE Maths 1 missing/.test(s0) || !/June 2017 Paper 2H/.test(s0)) bad.push('Edexcel GCSE Maths does not say 1 missing, Paper 2H June 2017: ' + s0.slice(0, 300));
  if (/Paper 1H|Papers 1H/.test(s0)) bad.push('a present paper (1H June 2017) is listed as missing');
  if (!/AQA GCSE Geography none yet/.test(s0)) bad.push('a qualification with nothing does not say "none yet"');
  if (!/AQA GCSE Psychology complete/.test(s0)) bad.push('a complete qualification does not say "complete"');
  if (/OCR GCSE Maths|Edexcel GCSE History/.test(s0)) bad.push('an OCR line or an Edexcel line that is not Maths is shown (562)');
  if (!/1 paper waiting for their words|· 1 waiting for words/.test(s0)) bad.push('the paper with pending words is not counted');
  if (host.querySelectorAll('.miss-card details.miss-q').length !== 2) bad.push('not one fold per incomplete qualification: ' + host.querySelectorAll('.miss-card details.miss-q').length);
  if (host.querySelector('.miss-card details[open]')) bad.push('a qualification opens unfolded');
  if (host.querySelector('.miss-card [aria-busy="true"], .miss-card .loading')) bad.push('the card is still waiting after its list came');
  if (gets.filter(u => /expected-papers\.json/.test(u)).length !== 1) bad.push('the list was fetched ' + gets.filter(u => /expected-papers\.json/.test(u)).length + ' times, not once');
  /* A REPAINT OF THE FUNNEL LEAVES FIND ON ITS QUESTION, nothing put above it. */
  w.paintFinder_('stuff');
  await wait(200);
  if (qAt() !== 0 || t.PAGE().stuff !== 0) bad.push('a repaint of the funnel left the question on page ' + qAt() + ' and Find on page ' + t.PAGE().stuff);
  host.remove();
  if (errs.length) bad.push('errors: ' + errs.join(' | ').slice(0, 300));
  w.close();
  /* AN EMPTY OR ABSENT LIST SAYS SO. */
  const e = boot({ before: signedInAs_(LAY_ADMIN_), serve: missServe_(null) });
  await wait(400);
  e.w.__t.go('stuff', false, true); await wait(300);
  const eItem = (e.w.stuffItemsAll_() || []).find(x => x.key === 'health:missing');
  const eh = e.w.document.createElement('div'); eh.innerHTML = eItem ? e.w.stuffCard(eItem, 0) : ''; await wait(200); eh.innerHTML = eItem ? e.w.stuffCard(eItem, 0) : '';
  const es = (eh.querySelector('.miss-card') || { textContent: '' }).textContent;
  if (!/Nothing listed to expect yet/.test(es)) bad.push('an absent list does not say "Nothing listed to expect yet": ' + es.replace(/\s+/g, ' ').slice(0, 120));
  e.w.close();
  /* A STUDENT AND A CLIENT: no card, the question is page 0, nothing fetched. */
  for (const who of [{ name: 'Kit Young', personId: 'P-K', role: 'student', roles: ['student'], rank: 'student', token: 'tk-kit', handle: 'kit_y' }, MEMBER_]) {
    const s = boot({ before: signedInAs_(who), serve: missServe_(MISS_LIST_) });
    await wait(400);
    s.w.__t.go('stuff', false, true); await wait(300);
    const sd = s.w.document;
    if (sd.querySelector('.miss-card') || (s.w.stuffItemsAll_() || []).some(x => x.key === 'health:missing')) bad.push('a ' + who.rank + ' sees What’s missing');
    if (missPages_(sd).indexOf(sd.getElementById('stuff-controls')?.closest('.page')) !== 0) bad.push('for a ' + who.rank + ' the question is not page 0');
    if (s.gets.some(u => /expected-papers\.json/.test(u))) bad.push('a ' + who.rank + ' fetched expected-papers.json');
    s.w.close();
  }
  return bad;
});

/* ---------- THE OWNER'S NOTES OF 29 OCT, ON EDEXCEL A-LEVEL MATHS 2021 IN FIND 2 ---------- */
check('Find 2 › Questions › Maths › Past paper › A-Level › Edexcel › 2021 (owner, 29 Oct): every page of a question has Suggest a change, a part with nothing to draw on has no Pen (no blank working paper), and Function is offered once a paper is picked', async () => {
  const full = LIB_FULL.rows('questions');
  const one = await resBoot_({ serve: url => (/data\/questions\.json/.test(url) ? full : undefined), before: signedInAs_(LAY_ADMIN_) });
  if (!one) return ['the app did not boot — NOT checked'];
  const W = one.w, T = W.__t, d = W.document, bad = [];
  for (let i = 0; i < 100 && !(W.stuffItemsAll_().some(x => x.row && x.row.paper_id === 'RS1786302107764-506')); i++) await wait(50);
  T.go('res'); await wait(80);
  const path = [{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }, { field: 'subject', value: 'Maths' }, { field: 'documentType', value: 'Past paper' },
    { field: 'level', value: 'A-Level' }, { field: 'examBoard', value: 'Edexcel' }, { field: 'examYear', value: '2021' }];
  const R = resView_(W);
  T.RES().filters = path.map(f => Object.assign({}, f));
  W.paintFinder_('res');
  if (R.stuffFiltered().length < 50) return ['the path holds ' + R.stuffFiltered().length + ' questions — the 2021 papers are not in the library, NOT checked'];
  /* FUNCTION, ONCE A PAPER IS PICKED: Paper 2 holds one part that is not machine-marked, so Function splits it and is asked before Question. */
  T.RES().filters.push({ field: 'paperId', value: 'RS1786302107764-506' });
  const next = R.nextFacet(R.stuffFiltered());
  if (!next || next.field !== 'function') bad.push('after Paper 2 the funnel asks ' + (next ? next.field : 'nothing') + ', not Function — the verified tags are sorted after the questions that pick one question');
  else if (R.facetValues(R.stuffFiltered(), next).map(v => v.value).sort().join() !== 'Function unverified,Function verified') bad.push('Function offers ' + R.facetValues(R.stuffFiltered(), next).map(v => v.value).join(', '));
  W.paintFinder_('res');
  /* EVERY PAGE: a stem's page and a long part's first pages carried no Suggest a change (486). */
  const pages = R.stuffPages_(), first = R.stuffFirstResult_();
  let seen = 0, stems = 0, bare = 0, drawn = 0;
  for (let at = 0; at < Math.min(pages.length, 24); at += 3) {
    T.goPage('res', first + at, true);
    await wait(120);
    const host = d.getElementById('s-res');
    [...host.querySelectorAll(':scope > .page')].forEach(pg => {
      const q = pg.querySelector('.qcard');
      if (!q) return;
      seen++;
      if (q.classList.contains('qstem') || q.classList.contains('qpre')) stems++;
      if (!pg.querySelector('[data-do="rep-box"]')) bad.push('a ' + (q.classList.contains('qstem') ? 'stem' : q.classList.contains('qpre') ? 'first' : 'part') + ' page has no Suggest a change: ' + pg.textContent.replace(/\s+/g, ' ').trim().slice(0, 60));
      const row = pg.querySelector('.qt-row');
      if (!row) return;
      const it = W.stuffItemsAll_().find(y => y.key === row.getAttribute('data-key'));
      const art = !!it && W.padHasArt_(it);
      const pens = row.querySelectorAll('[data-do="qt-pen"], [data-do="qt-inst"]').length;
      if (art) drawn++; else bare++;
      if (!art && pens) bad.push(row.getAttribute('data-key') + ': nothing to draw on, and ' + pens + ' drawing tools — the Pen opens a blank working paper');
      if (!art && pg.querySelector('.qsheet figure svg')) bad.push(row.getAttribute('data-key') + ' has a figure and padHasArt_ says it has nothing to draw on');
      if (art && !pens) bad.push(row.getAttribute('data-key') + ' has something to draw on and no Pen');
    });
  }
  if (seen < 8 || !stems || !bare) bad.push('only ' + seen + ' question pages (' + stems + ' stem or first pages, ' + bare + ' with nothing to draw on) were seen, so the rule was NOT checked');
  /* AND THE PEN ITSELF: a bare part's pen opens nothing; one with a figure still draws on it. */
  const parts = R.stuffFiltered().filter(x => x.kind === 'question');
  const plain = parts.find(x => !x.diagram && !(x.stems || []).some(p => p && p.diagram) && !W.padHasArt_(x));
  if (plain) { W.qtPenSet_(plain, true); if (W.padSource_(plain)) bad.push(plain.key + ': a Pen tap on a part with no figure still lays a blank grid'); W.qtPenSet_(plain, false); }
  const fig = W.stuffItemsAll_().find(x => x.kind === 'question' && x.diagram);
  if (fig && !/data-do="qt-pen"/.test(W.qtRow_(fig))) bad.push(fig.key + ' has a figure and no Pen');
  return bad;
});

/* ---------- THE OWNER'S NOTES OF 2 NOV, ON FIND'S FUNNEL (660) ---------- */
check('Find 2 funnel (owner, 2 Nov, 660): Type under Practice › Maths offers Past paper and Worksheet alone and Which type holds Specimen paper and 5-a-day; Which (a kind question) is asked under Practice and inside one paper however lopsided; Any what kind is never asked finer (Which, Shelf) but Subject; the Hebrew Bible answers Judaism › Tanakh; a path says labels, never field names', async () => {
  const full = LIB_FULL.rows('questions');
  const one = await resBoot_({ serve: url => (/data\/questions\.json/.test(url) ? full : undefined), before: signedInAs_(LAY_ADMIN_) });
  if (!one) return ['the app did not boot — NOT checked'];
  const W = one.w, T = W.__t, bad = [];
  for (let i = 0; i < 100 && W.stuffItemsAll_().filter(x => x.kind === 'question').length < 5000; i++) await wait(50);
  T.go('res'); await wait(80);
  const R = resView_(W);
  const ask = fs_ => { T.RES().filters = fs_.map(f => Object.assign({}, f)); const l = R.stuffFiltered(); const n = R.nextFacet(l) || R.overFacet_(l); return { n, vals: n ? R.facetValues(l, n).map(v => v.value) : [], l }; };
  const P = [{ field: 'kindLabel', value: 'Practice' }];
  if (R.stuffFiltered && ask(P).l.length < 5000) return ['the library holds ' + ask(P).l.length + ' Practice cards — NOT checked'];
  /* 1. Which first, then Type with the types above alone, then Which type with the one below. */
  let s = ask(P);
  if (!s.n || s.n.field !== 'kindOwn') bad.push('Practice asks ' + (s.n ? s.n.field : 'nothing') + ' first, not Which');
  s = ask(P.concat([{ field: 'kindOwn', value: 'Questions' }, { field: 'subject', value: 'Maths' }]));
  if (!s.n || s.n.field !== 'documentType') bad.push('Practice › Questions › Maths asks ' + (s.n ? s.n.field : 'nothing') + ', not Type');
  else if (s.vals.some(v => v === 'Specimen paper' || v === '5-a-day') || s.vals.indexOf('Past paper') < 0) bad.push('Type offers ' + s.vals.join(', ') + ' — a specimen or 5-a-day beside the type it is under');
  s = ask(P.concat([{ field: 'kindOwn', value: 'Questions' }, { field: 'subject', value: 'Maths' }, { field: 'documentType', value: 'Past paper' }]));
  if (!s.n || s.n.field !== 'typeOwn' || s.vals.indexOf('Specimen paper') < 0) bad.push('after Past paper the funnel asks ' + (s.n ? s.n.field + ' (' + s.vals.join(', ') + ')' : 'nothing') + ', not Which type with Specimen paper');
  if (s.vals.indexOf('Past paper') >= 0) bad.push('after Past paper Which type offers Past paper again (680): ' + s.vals.join(', '));
  /* 680, the owner's screenshot: Worksheet, then Which type offers 5-a-day alone, never Worksheet twice; and the chip row never repeats. */
  const WS = P.concat([{ field: 'kindOwn', value: 'Questions' }, { field: 'subject', value: 'Maths' }, { field: 'documentType', value: 'Worksheet' }]);
  s = ask(WS);
  if (s.n && s.n.field === 'typeOwn' && s.vals.indexOf('Worksheet') >= 0) bad.push('after Worksheet Which type offers ' + s.vals.join(', ') + ' — Worksheet twice (680)');
  T.RES().filters = WS.concat([{ field: 'typeOwn', value: 'Worksheet' }]).map(f => Object.assign({}, f));
  const ch = R.filterChips ? R.filterChips() : '';
  const words = (ch.match(/>\s*([^<]+?)<span class="chip-x"/g) || []).map(t => t.replace(/^>\s*|<span.*$/g, '').trim());
  if (!R.filterChips) bad.push('filterChips is not reachable — the chip row NOT checked');
  else if (new Set(words).size !== words.length) bad.push('the chip row repeats a label: ' + words.join(' · ') + ' (680)');
  /* 3. Inside one paper Questions and Answers are the same cards, and Which is still asked. */
  const paper = (s.l.find(x => x.kind === 'question' && x.row && x.row.paper_id && R.questionHasAns_(x)) || {}).row;
  if (paper) {
    T.RES().filters = [{ field: 'paperId', value: paper.paper_id }];
    const why = R.facetWhy_(R.stuffFiltered(), R.facetList().find(f => f.field === 'kindOwn'));
    if (why) bad.push('inside ' + paper.paper_id + ' Which is held back: ' + why);
  } else bad.push('no past paper with answers — Which inside a paper NOT checked');
  /* 6. Doesn't matter on What kind: nothing that only re-asks it, Subject instead. */
  s = ask([{ field: 'kindLabel', any: true }]);
  if (!s.n || s.n.field !== 'subject') bad.push('after Any what kind the funnel asks ' + (s.n ? s.n.field + ' (' + s.vals.slice(0, 4).join(', ') + ')' : 'nothing') + ', not Subject');
  /* 3. The path a suggestion carries says labels. */
  T.RES().filters = [{ field: 'kindLabel', any: true }, { field: 'qNumber', any: true }, { field: 'myResult', any: true }];
  const said = T.RES().filters.map((f, i) => R.chipText_(f, i)).join(' › ');
  if (/kindLabel|qNumber|myResult/.test(said)) bad.push('the path says field names: ' + said);
  /* 4. The Masoretic Hebrew is Judaism's Tanakh too; a translation of it is not. */
  const heb = { kind: 'bible', topic: 'Christianity', bb: { book: 'Genesis', testament: 'Old Testament', group: 'Law', text: 'Hebrew' }, ch: '1', v: '1' };
  const kjv = { kind: 'bible', topic: 'Christianity', bb: { book: 'Genesis', testament: 'Old Testament', group: 'Law', text: 'English, King James Version (1611)' }, ch: '1', v: '1' };
  const at = (x, k) => [].concat(W.writingAt_(x, k) || []);
  if (at(heb, 'religion').indexOf('Judaism') < 0 || at(heb, 'collection').indexOf('Tanakh') < 0) bad.push('the Hebrew Genesis answers Religion ' + at(heb, 'religion') + ', Collection ' + at(heb, 'collection') + ' — not Judaism, Tanakh');
  if (at(kjv, 'religion').indexOf('Judaism') >= 0) bad.push('the KJV Genesis answers Judaism — a translation is not the Tanakh');
  T.RES().filters = [];
  return bad;
});

